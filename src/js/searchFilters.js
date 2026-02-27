
// Filtrerar datan baserat på vad för urval användaren vill ha

import { fetchAll } from "./fetchData.js";
import { createCard } from "./card.js";

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
        const card = createCard(item, type, { viewBtnClass: "btn-primary" });
        if (!card) continue;
        container.appendChild(card);
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
    return data.filter(item =>
        (item[field] || "").toLowerCase().includes(value.toLowerCase())
    );
}

export async function activateFilters(type) {
    const config = FILTERS[type];
    if (!config) return;

    updateTitle(type);
    cachedData = await fetchAll(type);

    const options = buildOptions(config, cachedData);

    const bar = document.createElement("div");
    bar.id = "filter-bar";
    bar.innerHTML = `
    <label for="${config.field}-filter">${config.label}:</label>
    <select id="${config.field}-filter">
      <option value="">All</option>
      ${options.map(o => `<option value="${o}">${o}</option>`).join("")}
    </select>
  `;

    const section = document.getElementById("featured");
    const list = document.querySelector(".featured-list");
    section.insertBefore(bar, list);

    bar.querySelector("select").onchange = (e) => {
        renderCards(type, filterData(cachedData, config.field, e.target.value));
    };

    renderCards(type, cachedData);
}

export function deactivateFilters() {
    document.getElementById("filter-bar")?.remove();
    cachedData = [];
}