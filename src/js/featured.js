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
        vehicles: `${base}/vehicles/${id}.jpg`,
        species: `${base}/species/${id}.jpg`,

    }[type];
}

// POPULAR ITEMS FOR HOME PAGE
const popular = {
    people: [1, 4, 5, 10, 11],
    planets: [1, 2, 3, 4, 5],
    starships: [9, 10, 11],
    films: [1, 2, 3],
    vehicles: [4, 6, 7],
    species: [1, 2, 3]
};

// API ENDPOINTS
const endpoints = {
    people: "https://swapi.py4e.com/api/people/",
    planets: "https://swapi.py4e.com/api/planets/",
    starships: "https://swapi.py4e.com/api/starships/",
    films: "https://swapi.py4e.com/api/films/",
    vehicles: "https://swapi.py4e.com/api/vehicles/",
    species: "https://swapi.py4e.com/api/species/"
};

// ⭐ OPEN DETAIL
export function openDetail(type, id) {
    window.dispatchEvent(
        new CustomEvent("open-detail", { detail: { type, id: String(id) } })
    );
}

// ⭐ HOME PAGE → Featured Characters, Planets, Starships, Movies
export async function loadHome() {
    // FIX: Only select lists that belong to HOME
    const sections = document.querySelectorAll(".featured-list[data-type]");

    for (const sec of sections) {
        const type = sec.dataset.type;
        const ids = popular[type];
        const endpoint = endpoints[type];

        if (!ids || !endpoint) continue;

        sec.innerHTML = "";

        for (const idNum of ids) {
            const id = String(idNum);
            const res = await fetch(`${endpoint}${idNum}/`);
            const data = await res.json();

            const name = data.name || data.title || "Unknown";

            renderCard(sec, type, id, name);
        }
    }
}

// ⭐ ALL ITEMS (Characters, Planets, Starships, Movies)
export async function loadAll(type) {
    const container = document.querySelector("#featured .featured-list");
    const endpoint = endpoints[type];
    if (!container || !endpoint) return;

    container.innerHTML = '<p class="loading">Loading...</p>';

    try {
        let nextUrl = endpoint;
        let results = [];

        while (nextUrl && results.length < 50) {
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

// ⭐ FILTERED ITEMS (Light Side, Dark Side, Film filters)
export async function loadFiltered(type, filter) {
    const container = document.querySelector("#featured .featured-list");
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

// ⭐ PEOPLE FILTER (Light Side / Dark Side)
async function loadPeopleFilter(filter, container, endpoint) {
    // Hämta ALLA sidor av people
    let next = endpoint;
    let all = [];

    while (next) {
        const res = await fetch(next);
        const data = await res.json();
        all = all.concat(data.results);
        next = data.next;
    }

    // SWAPI-kompatibla filter
    const darkSide = ["vader", "sidious", "palpatine"];
    const lightSide = ["luke", "leia", "obi-wan", "yoda", "han", "chewbacca"];

    container.innerHTML = "";

    for (const item of all) {
        const nameLower = (item.name || "").toLowerCase();
        const id = extractId(item.url);
        if (!id) continue;

        let matches = false;

        if (filter === "dark") {
            matches = darkSide.some(x => nameLower.includes(x));
        }

        if (filter === "light") {
            matches = lightSide.some(x => nameLower.includes(x));
        }

        if (!matches) continue;

        renderCard(container, "people", id, item.name);
    }

    if (!container.children.length) {
        container.innerHTML = `<p class="no-results">No characters found for this filter.</p>`;
    }
}

// ⭐ FILM FILTER (Skywalker / Standalone / Series)
async function loadFilmFilter(filter, container, endpoint) {
    const res = await fetch(endpoint);
    const data = await res.json();

    container.innerHTML = "";

    const films = data.results;

    for (const item of films) {
        const id = extractId(item.url);
        if (!id) continue;

        const episode = item.episode_id;

        let matches = false;

        if (filter === "skywalker") {
            matches = episode >= 1 && episode <= 6;
        }

        if (filter === "standalone") {
            container.innerHTML = `<p class="no-results">SWAPI has no standalone films (Rogue One, Solo).</p>`;
            return;
        }

        if (filter === "series") {
            container.innerHTML = `<p class="no-results">SWAPI has no series films.</p>`;
            return;
        }

        if (!matches) continue;

        renderCard(container, "films", id, item.title);
    }

    if (!container.children.length) {
        container.innerHTML = `<p class="no-results">No films found for this filter.</p>`;
    }
}

// ⭐ HELPERS
function extractId(url) {
    const m = url.match(/\/(\d+)\/$/);
    return m ? m[1] : null;
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
