import { toggleFavorite, isFavorite, normalizeType } from "./favStore.js";
import { getImage, openDetail } from "./featured.js";

export function renderFavorites() {
    const container = document.getElementById("favorites-container");
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.length === 0) {
        container.innerHTML = `<p>No favorites saved yet...</p>`;
        return;
    }

    const groups = {
        people: [],
        planets: [],
        starships: [],
        films: [],
        vehicles: [],
        species: []
    };

    favorites.forEach(f => {
        const type = normalizeType(f.type);
        if (groups[type]) groups[type].push(f);
    });

    container.innerHTML = Object.entries(groups)
        .filter(([_, items]) => items.length > 0)
        .map(([type, items]) => `
            <h2 style="margin-top:1.5rem; text-transform:capitalize;">${type}</h2>

            <div class="favorites-wrapper">
                <div class="favorites-list">
                    ${items.map(item => `
                        <div class="featured-card" 
                             data-id="${item.id}" 
                             data-type="${item.type}">
                             
                            <img src="${getImage(item.type, item.id)}">
                            <h3>${item.name}</h3>

                            <div class="card-actions">
                                <button class="view-btn btn-primary" type="button">View more</button>
                                <button class="fav-btn">${isFavorite(item.id, item.type) ? "★" : "☆"}</button>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");

    container.querySelectorAll(".featured-card").forEach(card => {
        const id = String(card.dataset.id);
        const type = card.dataset.type;
        const name = card.querySelector("h3").textContent;

        const item = { id, type, name };

        card.querySelector(".view-btn").onclick = () => openDetail(type, id);

        card.querySelector(".fav-btn").onclick = () => {
            toggleFavorite(item);
            renderFavorites();
        };
    });
}
