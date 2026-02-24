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

  container.innerHTML = "";

  const type = normalizeType(section.dataset.type);
  const ids = popular[type];
  const endpoint = endpoints[type];
  if (!ids || !endpoint) return;

  for (const idNum of ids) {
    const id = String(idNum);
    const res = await fetch(`${endpoint}${idNum}/`);
    const data = await res.json();

    const item = { id, type, name: data.name || data.title };

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

    container.appendChild(card);
  }

  const list = document.querySelector(".featured-list");
  const left = document.querySelector(".left-btn");
  const right = document.querySelector(".right-btn");

  if (list && left && right) {
    const cardWidth = 180 + 16;
    left.onclick = () => list.scrollBy({ left: -cardWidth, behavior: "smooth" });
    right.onclick = () => list.scrollBy({ left: cardWidth, behavior: "smooth" });
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

export async function loadFiltered(type, filter) {
  const container = document.querySelector(".featured-list");
  const endpoint = endpoints[type];
  if (!container || !endpoint) return;

  container.innerHTML = '<p class="loading">Loading...</p>';

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