import { toggleFavorite, isFavorite, normalizeType } from "./favStore.js";

// IMAGE HELPER
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
      <img src="${getImage(type, id)}" alt="${item.name}">
      <h3>${item.name}</h3>

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

        container.appendChild(card);
    }

    initScrollButtons();
}

function initScrollButtons() {
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
            renderCard(container, type, id, name);
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

    if (type === "people") {
        return loadPeopleFilter(filter, container, endpoint);
    }

    if (type === "films") {
        return loadFilmFilter(filter, container, endpoint);
    }

    await loadAll(type);
}

async function loadPeopleFilter(filter, container, endpoint) {
    const darkSide = ["vader", "darth", "sidious", "palpatine", "maul", "dooku", "kylo"];
    const lightSide = ["luke", "leia", "obi-wan", "yoda", "rey", "finn", "han", "chewbacca"];

    try {
        const res = await fetch(endpoint);
        const data = await res.json();

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

            renderCard(container, "people", id, item.name);
        }

        if (!container.children.length) {
            container.innerHTML = '<p class="no-results">No characters found for this filter.</p>';
        }
    } catch (err) {
        console.error("Error loading filtered:", err);
        container.innerHTML = '<p class="error">Could not load data.</p>';
    }
}

async function loadFilmFilter(filter, container, endpoint) {
    try {
        const res = await fetch(endpoint);
        const data = await res.json();

        container.innerHTML = "";

        for (const item of data.results) {
            const id = extractId(item.url);
            if (!id) continue;

            const episode = item.episode_id;

            const matches =
                (filter === "skywalker" && episode <= 6) ||
                (filter === "standalone" && (episode === 1 || episode === 3)) ||
                (filter === "series" && item.director === "Dave Filoni");

            if (!matches) continue;

            renderCard(container, "films", id, item.title);
        }

        if (!container.children.length) {
            container.innerHTML = '<p class="no-results">No films found for this filter.</p>';
        }
    } catch (err) {
        console.error("Error loading filtered films:", err);
        container.innerHTML = '<p class="error">Could not load data.</p>';
    }
}

function renderCard(container, type, id, name) {
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
