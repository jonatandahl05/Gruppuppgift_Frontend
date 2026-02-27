
// Här är vart vi rendrerar datan som vi har eventuellt filtrerat och vill visa

import { toggleFavorite, isFavorite, normalizeType } from "./favStore.js";
import {
  fetchById,
  fetchAllLimited,
  searchType,
  searchAllTypes,
  fetchPage,
  extractId,
} from "./fetchData.js";

const PLACEHOLDER_IMG = "placeholder/198-1986030_pixalry-star-wars-icons-star-wars-ilustraciones.png";

export function getImage(type, id) {
  const base =
    "https://raw.githubusercontent.com/tbone849/star-wars-guide/master/build/assets/img";
  return {
    people: `${base}/characters/${id}.jpg`,
    planets: `${base}/planets/${id}.jpg`,
    starships: `${base}/starships/${id}.jpg`,
    films: `${base}/films/${id}.jpg`,
  }[type];
}

const popular = {
  people: [1, 4, 5, 10, 11],
  planets: [1, 2, 3, 4, 5],
  starships: [9, 10, 11],
  films: [1, 2, 3],
};

export function openDetail(type, id) {
  window.dispatchEvent(
    new CustomEvent("open-detail", { detail: { type, id: String(id) } })
  );
}

export async function loadFeatured() {
  const section = document.querySelector("#featured");
  const container = document.querySelector(".featured-list");
  if (!section || !container) return;

  // “token” för att undvika race conditions när man byter kategori snabbt
  const token = String(Date.now());
  section.dataset.loadToken = token;

  const type = normalizeType(section.dataset.type);
  const ids = popular[type];
  if (!ids || !endpoint) return;

  // Reset UI direkt
  container.innerHTML = "";

  // (Valfritt) visa enkla placeholders så att UI känns instant
  for (let i = 0; i < ids.length; i++) {
    const skel = document.createElement("div");
    skel.className = "featured-card featured-card--skeleton";
    skel.innerHTML = `
      <div class="skeleton-img"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-actions"></div>
    `;
    container.appendChild(skel);
  }

  // Hämta ALLA parallellt
  const tasks = ids.map(async (idNum, index) => {
    const id = String(idNum);

    try {

      const data = await fetchById(type, idNum);

      // Om användaren bytte view under tiden: avbryt render
      if (section.dataset.loadToken !== token) return;

      const name = data.name || data.title || "Unknown";
      const item = { id, type, name };

      const card = document.createElement("div");
      card.classList.add("featured-card");

      card.innerHTML = `
        <img 
            src="${getImage(type, id)}" 
            alt="${name}" 
            onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';"
        />
        <h3>${name}</h3>

        <div class="card-actions">
          <button class="view-btn" type="button">View more</button>
          <button class="fav-btn" type="button">${isFavorite(id, type) ? "★" : "☆"}</button>
        </div>
      `;

      card.querySelector(".view-btn").onclick = () => openDetail(type, id);

      const favBtn = card.querySelector(".fav-btn");
      favBtn.onclick = () => {
        toggleFavorite(item);
        favBtn.textContent = isFavorite(id, type) ? "★" : "☆";
      };

      // Ersätt placeholder på samma index (så ordningen blir stabil)
      const placeholder = container.children[index];
      if (placeholder) {
        container.replaceChild(card, placeholder);
      } else {
        container.appendChild(card);
      }
    } catch (err) {
      console.error("Featured fetch error:", err);

      // Om användaren bytte view under tiden: avbryt
      if (section.dataset.loadToken !== token) return;

      // Ersätt placeholder med ett felkort istället för att lämna tomt
      const errorCard = document.createElement("div");
      errorCard.className = "featured-card featured-card--error";
      errorCard.innerHTML = `
        <h3>Could not load</h3>
        <p class="error">Try again later.</p>
      `;

      const placeholder = container.children[index];
      if (placeholder) {
        container.replaceChild(errorCard, placeholder);
      } else {
        container.appendChild(errorCard);
      }
    }
  });

  // Vi väntar inte på att allt måste bli klart för att rendera,
  // men vi kan låta funktionen returnera när alla tasks är “done”.
  await Promise.allSettled(tasks);

  // Scroll-knappar (behåll er gamla logik)
  const left = document.querySelector(".left-btn");
  const right = document.querySelector(".right-btn");

  if (left && right) {
    const cardWidth = 180 + 16;
    left.onclick = () => container.scrollBy({ left: -cardWidth, behavior: "smooth" });
    right.onclick = () => container.scrollBy({ left: cardWidth, behavior: "smooth" });
  }
}


export async function loadAll(type) {
  const container = document.querySelector(".featured-list");

  if (!container) return;

  container.innerHTML = '<p class="loading">Loading...</p>';

  try {
    
    const results = await fetchAllLimited(type, 10); // Begränsa så det inte blir tungt (justera vid behov)

    container.innerHTML = "";

    for (const item of results) {
      const id = extractId(item.url);
      if (!id) continue;

      const name = item.name || item.title || "Unknown";
      const card = document.createElement("div");
      card.classList.add("featured-card");

      card.innerHTML = `
        <img 
            src="${getImage(type, id)}" 
            alt="${name}" 
            onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';"
        />        
        <h3>${name}</h3>

        <div class="card-actions">
          <button class="view-btn btn-primary" type="button">View more</button>
          <button class="fav-btn" type="button">${isFavorite(id, type) ? "★" : "☆"}</button>
        </div>
      `;

      card.querySelector(".view-btn").onclick = () => openDetail(type, id);

      const favBtn = card.querySelector(".fav-btn");
      favBtn.onclick = () => {
        toggleFavorite({ id, type, name });
        favBtn.textContent = isFavorite(id, type) ? "★" : "☆";
      };

      container.appendChild(card);
    }
  } catch (err) {
    console.error("Error loading all:", err);
    container.innerHTML = '<p class="error">Could not load data.</p>';
  }

}

export async function searchResource(type, query) {
  const container = document.querySelector(".featured-list");

  if (!container) return;

  const q = (query || "").trim();
  if (!q) {
    await loadAll(type);
    return;
  }

  container.innerHTML = '<p class="loading">Searching...</p>';

  try {
    // SWAPI stödjer ?search=
    const results = await searchType(type, q, 10); // Håll det lätt: max 10 kort (samma känsla som loadAll)

    container.innerHTML = "";

    for (const item of results) {
      const id = extractId(item.url);
      if (!id) continue;

      const name = item.name || item.title || "Unknown";
      const card = document.createElement("div");
      card.classList.add("featured-card");

      card.innerHTML = `
        <img 
            src="${getImage(type, id)}" 
            alt="${name}" 
            onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';"
        />        
        <h3>${name}</h3>

        <div class="card-actions">
          <button class="view-btn" type="button">View more</button>
          <button class="fav-btn" type="button">${isFavorite(id, type) ? "★" : "☆"}</button>
        </div>
      `;

      card.querySelector(".view-btn").onclick = () => openDetail(type, id);

      const favBtn = card.querySelector(".fav-btn");
      favBtn.onclick = () => {
        toggleFavorite({ id, type, name });
        favBtn.textContent = isFavorite(id, type) ? "★" : "☆";
      };

      container.appendChild(card);
    }

    if (!container.children.length) {
      container.innerHTML = '<p class="no-results">No results for your search.</p>';
    }
  } catch (err) {
    console.error("Error searching:", err);
    container.innerHTML = '<p class="error">Could not search data.</p>';
  }
}

export async function searchAll(query) {
  const container = document.querySelector(".featured-list");
  if (!container) return;

  const q = (query || "").trim();
  if (!q) {
    await loadFeatured();
    return;
  }

  container.innerHTML = '<p class="loading">Searching across all...</p>';

  try {
    const responses = await searchAllTypes(q, 8);

    // Flatta och tagga items med typ
    const all = responses.flatMap(({ type, results }) =>
      results.map((item) => ({ type, item }))
    );

    container.innerHTML = "";

    // Inga träffar
    if (!all.length) {
      container.innerHTML = '<p class="no-results">No results across all resources.</p>';
      return;
    }

    // Rendera blandat – med liten typ-badge
    for (const { type, item } of all) {
      const id = extractId(item.url);
      if (!id) continue;

      const name = item.name || item.title || "Unknown";
      const card = document.createElement("div");
      card.classList.add("featured-card");

      const typeLabel =
        type === "people" ? "Character" :
        type === "planets" ? "Planet" :
        type === "starships" ? "Starship" :
        type === "films" ? "Film" :
        type;

      card.innerHTML = `
        <div class="card-badge" aria-label="Type">${typeLabel}</div>
        <img 
            src="${getImage(type, id)}" 
            alt="${name}" 
            onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';"
        />        
        <h3>${name}</h3>

        <div class="card-actions">
          <button class="view-btn" type="button">View more</button>
          <button class="fav-btn" type="button">${isFavorite(id, type) ? "★" : "☆"}</button>
        </div>
      `;

      card.querySelector(".view-btn").onclick = () => openDetail(type, id);

      const favBtn = card.querySelector(".fav-btn");
      favBtn.onclick = () => {
        toggleFavorite({ id, type, name });
        favBtn.textContent = isFavorite(id, type) ? "★" : "☆";
      };

      container.appendChild(card);
    }
  } 
  catch (err) {
    console.error("Error searching across all:", err);
    container.innerHTML = '<p class="error">Could not search across all data.</p>';
  }
}

export async function loadFiltered(type, filter) {
  // Filter är bara definierat för people i navData.js :contentReference[oaicite:1]{index=1}
  if (type !== "people") {
    await loadAll(type);
    return;
  }

  const container = document.querySelector(".featured-list");

  if (!container) return;

  container.innerHTML = '<p class="loading">Loading...</p>';

  const darkSide = ["vader", "darth", "sidious", "palpatine", "maul", "dooku", "kylo"];
  const lightSide = ["luke", "leia", "obi-wan", "yoda", "rey", "finn", "han", "chewbacca"];

  try {
    const data = await fetchPage(type, 1);

    container.innerHTML = "";

    for (const item of data.results) {
      const nameLower = (item.name || "").toLowerCase();
      const id = extractId(item.url);
      if (!id) continue;

      const matches =
        filter === "dark"
          ? darkSide.some((x) => nameLower.includes(x))
          : filter === "light"
          ? lightSide.some((x) => nameLower.includes(x))
          : false;

      if (!matches) continue;

      const name = item.name || "Unknown";
      const card = document.createElement("div");
      card.classList.add("featured-card");

      card.innerHTML = `
        <img 
            src="${getImage(type, id)}" 
            alt="${name}" 
            onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';"
        />       
        <h3>${name}</h3>

        <div class="card-actions">
          <button class="view-btn btn-primary" type="button">View more</button>
          <button class="fav-btn" type="button">${isFavorite(id, "people") ? "★" : "☆"}</button>
        </div>
      `;

      card.querySelector(".view-btn").onclick = () => openDetail("people", id);

      const favBtn = card.querySelector(".fav-btn");
      favBtn.onclick = () => {
        toggleFavorite({ id, type: "people", name });
        favBtn.textContent = isFavorite(id, "people") ? "★" : "☆";
      };

      container.appendChild(card);
    }

    if (!container.children.length) {
      container.innerHTML = '<p class="no-results">No characters found for this filter.</p>';
    }
  } catch (err) {
    console.error("Error loading filtered:", err);
    container.innerHTML = '<p class="error">Could not load data.</p>';
  }
}
