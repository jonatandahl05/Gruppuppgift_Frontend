import { toggleFavorite, isFavorite, normalizeType } from "./favStore.js";

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

const endpoints = {
  people: "https://swapi.py4e.com/api/people/",
  planets: "https://swapi.py4e.com/api/planets/",
  starships: "https://swapi.py4e.com/api/starships/",
  films: "https://swapi.py4e.com/api/films/",
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
  const endpoint = endpoints[type];
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
      const res = await fetch(`${endpoint}${idNum}/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

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
            onerror="this.onerror=null; this.src='placeholder/198-1986030_pixalry-star-wars-icons-star-wars-ilustraciones.png';"
        />      
      <h3>${item.name}</h3>
      <div class="card-actions">
        <button class="view-btn btn-primary" type="button">View more</button>
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



function extractId(url) {
  const m = url.match(/\/(\d+)\/$/);
  return m ? m[1] : null;
}

export async function loadAll(type) {
  const container = document.querySelector(".featured-list");
  const endpoint = endpoints[type];
  if (!container || !endpoint) return;

  container.innerHTML = '<p class="loading">Loading...</p>';

  try {
    let nextUrl = endpoint;
    let results = [];

    // Begränsa så det inte blir tungt (justera vid behov)
    while (nextUrl && results.length < 18) {
      const res = await fetch(nextUrl);
      const data = await res.json();
      results = results.concat(data.results);
      nextUrl = data.next;
    }

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
            onerror="this.onerror=null; this.src='placeholder/198-1986030_pixalry-star-wars-icons-star-wars-ilustraciones.png';"
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
  const endpoint = endpoints[type];
  if (!container || !endpoint) return;

  const q = (query || "").trim();
  if (!q) {
    await loadAll(type);
    return;
  }

  container.innerHTML = '<p class="loading">Searching...</p>';

  try {
    // SWAPI stödjer ?search=
    let nextUrl = `${endpoint}?search=${encodeURIComponent(q)}`;
    let results = [];

    // Håll det lätt: max 18 kort (samma känsla som loadAll)
    while (nextUrl && results.length < 18) {
      const res = await fetch(nextUrl);
      const data = await res.json();
      results = results.concat(data.results || []);
      nextUrl = data.next;
    }

    container.innerHTML = "";

    for (const item of results) {
      const id = extractId(item.url);
      if (!id) continue;

      const name = item.name || item.title || "Unknown";
      const card = document.createElement("div");
      card.classList.add("featured-card");

      card.innerHTML = `
        <img src="${getImage(type, id)}" alt="${name}">
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

  const types = ["people", "planets", "starships", "films"];

  try {
    // Kör parallellt – snabbare än att vänta typ för typ
    const responses = await Promise.all(
      types.map(async (type) => {
        const endpoint = endpoints[type];
        const url = `${endpoint}?search=${encodeURIComponent(q)}`;
        const res = await fetch(url);
        const data = await res.json();
        const results = (data.results || []).slice(0, 8); // håll det lätt
        return { type, results };
      })
    );

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
        <img src="${getImage(type, id)}" alt="${name}">
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
  } catch (err) {
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
  const endpoint = endpoints[type];
  if (!container || !endpoint) return;

  container.innerHTML = '<p class="loading">Loading...</p>';

  const darkSide = ["vader", "darth", "sidious", "palpatine", "maul", "dooku", "kylo"];
  const lightSide = ["luke", "leia", "obi-wan", "yoda", "rey", "finn", "han", "chewbacca"];

  try {
    let nextUrl = endpoint;
    let results = [];

    while (nextUrl && results.length < 30) {
      const res = await fetch(nextUrl);
      const data = await res.json();
      results = results.concat(data.results);
      nextUrl = data.next;
    }

    container.innerHTML = "";

    // PEOPLE
    if (type === "people") {
      const darkSide = ["vader", "darth", "sidious", "palpatine", "maul", "dooku", "kylo"];
      const lightSide = ["luke", "leia", "obi-wan", "yoda", "rey", "finn", "han", "chewbacca"];

      results = results.filter(item => {
        const nameLower = (item.name || "").toLowerCase();
        if (filter === "dark") return darkSide.some(x => nameLower.includes(x));
        if (filter === "light") return lightSide.some(x => nameLower.includes(x));
        return false;
      });
    }

    // STARSHIPS
    if (type === "starships") {
      results = results.filter(item => {
        const nameLower = (item.name || "").toLowerCase();

        if (filter === "imperial") {
          return (
              nameLower.includes("tie") ||
              nameLower.includes("star destroyer") ||
              nameLower.includes("executor") ||
              nameLower.includes("death star") ||
              nameLower.includes("tie advanced x1") ||
              nameLower.includes("imperial shuttle") ||
              nameLower.includes("sentinel-class landing craft")

          );
        }

        if (filter === "rebel") {
          return (
              nameLower.includes("x-") ||
              nameLower.includes("y-") ||
              nameLower.includes("a-wing") ||
              nameLower.includes("millennium falcon") ||
              nameLower.includes("ef76 nebulon-b escort frigate") ||
              nameLower.includes("b-wing") ||
              nameLower.includes("cr90 corvette") ||
              nameLower.includes("calamari cruiser")
          );
        }

        if (filter === "separatist") {
          return (
              nameLower.includes("droid control ship")
          )
        }

        if (filter === "republic") {
          return (
              nameLower.includes("naboo fighter") ||
              nameLower.includes("naboo royal starship") ||
              nameLower.includes("republic cruiser") ||
              nameLower.includes("rebel transport")
          )
        }

        return false;
      });
    }

    for (const item of results) {
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
            onerror="this.onerror=null; this.src='placeholder/198-1986030_pixalry-star-wars-icons-star-wars-ilustraciones.png';"
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

    if (!container.children.length) {
      container.innerHTML =
          '<p class="no-results">No results found for this filter.</p>';
    }
  } catch (err) {
    console.error("Error loading filtered:", err);
    container.innerHTML =
        '<p class="error">Could not load data.</p>';
  }
}
