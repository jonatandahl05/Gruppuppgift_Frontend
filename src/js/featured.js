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

function extractId(url) {
  const m = url.match(/\/(\d+)\/$/);
  return m ? m[1] : null;
}

/* ========================= FILTER ========================= */

export async function loadFiltered(type, filter) {
  const container = document.querySelector(".featured-list");
  const endpoint = endpoints[type];
  if (!container || !endpoint) return;

  container.innerHTML = '<p class="loading">Loading...</p>';

  try {
    let nextUrl = endpoint;
    let results = [];

    while (nextUrl) {
      const res = await fetch(nextUrl);
      const data = await res.json();
      results = results.concat(data.results);
      nextUrl = data.next;
    }

    container.innerHTML = "";

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

    if (type === "starships") {

      const categories = {

        imperial: [
          "Star Destroyer",
          "Executor",
          "TIE Advanced x1",
          "Imperial shuttle",
          "Death Star"
        ],

        rebel: [
          "CR90 corvette",
          "Rebel transport",
          "Millennium Falcon",
          "X-wing",
          "Y-wing",
          "A-wing",
          "B-wing",
          "EF76 Nebulon-B escort frigate",
          "Calamari Cruiser"
        ],

        separatist: [
          "Trade Federation cruiser",
          "Droid control ship",
          "Scimitar",
          "Belbullab-22 starfighter"
        ],

        republic: [
          "Republic Cruiser",
          "Republic attack cruiser",
          "Jedi Interceptor",
          "Jedi starfighter",
          "Naboo fighter",
          "Naboo Royal Starship",
          "Naboo star skiff",
          "H-type Nubian yacht",
          "J-type diplomatic barge",
          "AA-9 Coruscant freighter",
          "Theta-class T-2c shuttle",
          "arc-170",
          "V-wing",
          "Banking clan frigate"
        ]

      };

      results = results.filter(item =>
          categories[filter]?.includes(item.name)
      );
    }

    for (const item of results) {
      const id = extractId(item.url);
      if (!id) continue;

      const name = item.name || item.title || "Unknown";
      const card = document.createElement("div");
      card.classList.add("featured-card");

      card.innerHTML = `
        <img src="${getImage(type, id)}" alt="${name}" />
        <h3>${name}</h3>
        <div class="card-actions">
          <button class="view-btn btn-primary" type="button">View more</button>
          <button class="fav-btn" type="button">
            ${isFavorite(id, type) ? "★" : "☆"}
          </button>
        </div>
      `;

      card.querySelector(".view-btn").onclick = () =>
          openDetail(type, id);

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

/* ========================= FEATURED ========================= */

export async function loadFeatured() {
  const section = document.querySelector("#featured");
  const container = document.querySelector(".featured-list");
  if (!section || !container) return;

  const token = String(Date.now());
  section.dataset.loadToken = token;

  const type = normalizeType(section.dataset.type);
  const ids = popular[type];
  const endpoint = endpoints[type];
  if (!ids || !endpoint) return;

  container.innerHTML = "";

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

  const tasks = ids.map(async (idNum, index) => {
    const id = String(idNum);

    try {
      const res = await fetch(`${endpoint}${idNum}/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (section.dataset.loadToken !== token) return;

      const name = data.name || data.title || "Unknown";
      const item = { id, type, name };

      const card = document.createElement("div");
      card.classList.add("featured-card");

      card.innerHTML = `
        <img src="${getImage(type, id)}" alt="${name}" />
        <h3>${item.name}</h3>
        <div class="card-actions">
          <button class="view-btn btn-primary" type="button">View more</button>
          <button class="fav-btn" type="button">
            ${isFavorite(id, type) ? "★" : "☆"}
          </button>
        </div>
      `;

      card.querySelector(".view-btn").onclick = () =>
          openDetail(type, id);

      const favBtn = card.querySelector(".fav-btn");
      favBtn.onclick = () => {
        toggleFavorite(item);
        favBtn.textContent = isFavorite(id, type) ? "★" : "☆";
      };

      const placeholder = container.children[index];
      if (placeholder) {
        container.replaceChild(card, placeholder);
      } else {
        container.appendChild(card);
      }
    } catch (err) {
      console.error("Featured fetch error:", err);
    }
  });

  await Promise.allSettled(tasks);
}

/* ========================= LOAD ALL ========================= */

export async function loadAll(type) {
  const container = document.querySelector(".featured-list");
  const endpoint = endpoints[type];
  if (!container || !endpoint) return;

  container.innerHTML = '<p class="loading">Loading...</p>';

  try {
    let nextUrl = endpoint;
    let results = [];

    while (nextUrl) {
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
        <img src="${getImage(type, id)}" alt="${name}" />
        <h3>${name}</h3>
        <div class="card-actions">
          <button class="view-btn btn-primary" type="button">View more</button>
          <button class="fav-btn" type="button">
            ${isFavorite(id, type) ? "★" : "☆"}
          </button>
        </div>
      `;

      card.querySelector(".view-btn").onclick = () =>
          openDetail(type, id);

      const favBtn = card.querySelector(".fav-btn");
      favBtn.onclick = () => {
        toggleFavorite({ id, type, name });
        favBtn.textContent = isFavorite(id, type) ? "★" : "☆";
      };

      container.appendChild(card);
    }
  } catch (err) {
    console.error("Error loading all:", err);
    container.innerHTML =
        '<p class="error">Could not load data.</p>';
  }
}

/* ========================= SEARCH ========================= */

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
    let nextUrl = `${endpoint}?search=${encodeURIComponent(q)}`;
    let results = [];

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
        <img src="${getImage(type, id)}" alt="${name}" />
        <h3>${name}</h3>
        <div class="card-actions">
          <button class="view-btn" type="button">View more</button>
          <button class="fav-btn" type="button">
            ${isFavorite(id, type) ? "★" : "☆"}
          </button>
        </div>
      `;

      card.querySelector(".view-btn").onclick = () =>
          openDetail(type, id);

      const favBtn = card.querySelector(".fav-btn");
      favBtn.onclick = () => {
        toggleFavorite({ id, type, name });
        favBtn.textContent = isFavorite(id, type) ? "★" : "☆";
      };

      container.appendChild(card);
    }

    if (!container.children.length) {
      container.innerHTML =
          '<p class="no-results">No results found.</p>';
    }
  } catch (err) {
    console.error("Error searching:", err);
    container.innerHTML =
        '<p class="error">Could not search data.</p>';
  }
}