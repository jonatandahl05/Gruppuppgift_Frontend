import { getImage, openDetail } from "./featured.js";
import { toggleFavorite, isFavorite } from "./favStore.js";

let allPeople = [];

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

export async function activateFilters(type) {
    if (type !== "people") return;

    updateTitle(type);

    let results = [];
    let url = "https://swapi.py4e.com/api/people/";
    while (url) {
        const res = await fetch(url);
        const json = await res.json();
        results = results.concat(json.results);
        url = json.next;
    }
    allPeople = results;

    const bar = document.createElement("div");
    bar.id = "filter-bar";
    bar.innerHTML = `
    <label for="gender-filter">Gender:</label>
    <select id="gender-filter">
      <option value="">All</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="n/a">N/A</option>
    </select>
  `;

    const section = document.getElementById("featured");
    const list = document.querySelector(".featured-list");
    section.insertBefore(bar, list);

    bar.querySelector("#gender-filter").onchange = (e) => {
        const val = e.target.value;
        const filtered = val ? allPeople.filter(p => p.gender === val) : allPeople;
        renderCards("people", filtered);
    };

    renderCards("people", allPeople);
}

export function deactivateFilters() {
    document.getElementById("filter-bar")?.remove();
    allPeople = [];
}