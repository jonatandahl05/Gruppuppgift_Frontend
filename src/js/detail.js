import { toggleFavorite, isFavorite, normalizeType } from "./favStore.js";
import { getImage } from "./featured.js";

const endpoints = {
    people: "https://swapi.py4e.com/api/people/",
    planets: "https://swapi.py4e.com/api/planets/",
    starships: "https://swapi.py4e.com/api/starships/",
    films: "https://swapi.py4e.com/api/films/"
};

export async function renderDetail(type, id) {
    type = normalizeType(type);
    id = String(id);

    const container = document.getElementById("detail-container");
    container.innerHTML = `<p class="loading">Loading...</p>`;

    try {
        const res = await fetch(`${endpoints[type]}${id}/`);
        const data = await res.json();

        const name = data.name || data.title || "Unknown";
        const item = { id, type, name };

        const infoFields = Object.entries(data)
            .filter(([_, value]) => typeof value === "string" || typeof value === "number")
            .map(([key, value]) => {
                const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                return `<div class="detail-row"><span class="label">${label}:</span> ${value}</div>`;
            })
            .join("");

        container.innerHTML = `
      <img src="${getImage(type, id)}" class="detail-image" alt="${name}">
      <h1>${name}</h1>

      <button id="fav-detail-btn" class="fav-btn detail-fav-btn">
        ${isFavorite(id, type) ? "★ Remove Favorite" : "☆ Add Favorite"}
      </button>

      <div class="detail-info">${infoFields}</div>
    `;

        const favBtn = document.getElementById("fav-detail-btn");
        favBtn.onclick = () => {
            toggleFavorite(item);
            favBtn.textContent = isFavorite(id, type)
                ? "★ Remove Favorite"
                : "☆ Add Favorite";
        };

    } catch (err) {
        console.error("Detail error:", err);
        container.innerHTML = `<p class="error">Could not load details.</p>`;
    }
}
