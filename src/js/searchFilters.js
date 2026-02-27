import { getImage, openDetail } from "./featured.js";
import { toggleFavorite, isFavorite } from "./favStore.js";

const FILTERS = {
    people: {
        field: "gender",
        label: "Gender",
        options: null,
    },
    planets: {
        field: "climate",
        label: "Climate",
        options: null, // null gör så det använder data från swapi för alternativ
    },
    starships: {
        field: "starship_class",
        label: "Ship Class",
        options: null,
    },
    films: {
        field: "director",
        label: "Director",
        options: null,
    },
};

let cachedData = [];

function extractId(url) {
    return url.match(/\/(\d+)\/$/)?.[1];
}

// Från gamla featured.js #issue17-branchen när metoder delades upp för att dom skulle va återanvändbara till saker som filtrering.
function createCard(item, type) {
    const id = extractId(item.url);
    const name = item.name || item.title || "Unknown";
    const card = document.createElement("div");
    card.className = "featured-card";

    card.innerHTML = `
    <img src="${getImage(type, id)}" alt="${name}"
         onerror="this.onerror=null; this.src='./star-wars.png';">
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

    return card;
}

// Från gamla featured.js #issue17-branchen när metoder delades upp för att dom skulle va återanvändbara till saker som filtrering.
function updateTitle(type) {
    const titleEl = document.getElementById("featured-title");
    if (!titleEl) return;
    const names = { people: "Characters", planets: "Planets", starships: "Starships", films: "Movies" };
    titleEl.textContent = `All ${names[type] || type}`;
}

function renderCards(type, items) {
    const container = document.querySelector(".featured-list");
    container.innerHTML = "";

    for (const item of items) {
        if (!extractId(item.url)) continue;
        container.appendChild(createCard(item, type));
    }
}

function buildOptions(config, data) {
    if (config.options) return config.options;

    return [...new Set(
        data.flatMap(item => (item[config.field] || "")
            .split(",")
            .map(v => v.trim()))
            .filter(v => v && v !== "unknown" && v !== "n/a")
    )].sort();
}

// ── Filtrera data ──
function filterData(data, field, value) {
    if (!value) return data;
    return data.filter(item => {
        const cell = (item[field] || "").toLowerCase();
        const search = value.toLowerCase();
        const values = cell.split(",").map(v => v.trim());
        return values.includes(search);
    });
}

// ── Hämta alla sidor ──
async function fetchAll(type) {
    let results = [];
    let url = `https://swapi.py4e.com/api/${type}/`;
    while (url) {
        const res = await fetch(url);
        const json = await res.json();
        results = results.concat(json.results);
        url = json.next;
    }
    return results;
}

export async function activateFilters(type) {
    const config = FILTERS[type];
    if (!config) return;

    updateTitle(type);

    const container = document.querySelector(".featured-list");
    container.innerHTML = '<p class="loading">Loading...</p>';

    const firstRes = await fetch(`https://swapi.py4e.com/api/${type}/`);
    const firstPage = await firstRes.json();
    cachedData = firstPage.results;

    renderCards(type, cachedData);
    injectFilterBar(type, config);

    let nextUrl = firstPage.next;
    while (nextUrl) {
        const res = await fetch(nextUrl);
        const json = await res.json();
        cachedData = cachedData.concat(json.results);
        nextUrl = json.next;

        updateFilterOptions(config);
    }
}

export function deactivateFilters() {
    document.getElementById("filter-bar")?.remove();
    cachedData = [];
}

function injectFilterBar(type, config) {
    const existing = document.getElementById("filter-bar");
    if (existing) return;

    const bar = document.createElement("div");
    bar.id = "filter-bar";
    bar.innerHTML = `
    <label for="${config.field}-filter">${config.label}:</label>
    <select id="${config.field}-filter">
      <option value="">All</option>
    </select>
  `;

    const section = document.getElementById("featured");
    const list = document.querySelector(".featured-list");
    section.insertBefore(bar, list);

    bar.querySelector("select").onchange = (e) => {
        renderCards(type, filterData(cachedData, config.field, e.target.value));
    };

    updateFilterOptions(config);
}

function updateFilterOptions(config) {
    const select = document.getElementById(`${config.field}-filter`);
    if (!select) return;

    const currentValue = select.value;

    const options = [...new Set(
        cachedData.flatMap(item => (item[config.field] || "")
            .split(",")
            .map(v => v.trim()))
            .filter(v => v && v !== "unknown" && v !== "n/a")
    )].sort();

    select.innerHTML =
        `<option value="">All</option>` +
        options.map(o => `<option value="${o}"${o === currentValue ? " selected" : ""}>${o}</option>`).join("");
}