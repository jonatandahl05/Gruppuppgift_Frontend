import { getImage, openDetail } from "./featured.js";

function toggleFavorite(item) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const exists = favorites.some(f => f.id === item.id && f.type === item.type);

    if (exists) {
        favorites = favorites.filter(f => !(f.id === item.id && f.type === item.type));
    } else {
        favorites.push(item);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function isFavorite(id, type) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    return favorites.some(f => f.id === id && f.type === type);
}

export function renderFavorites() {
    const container = document.getElementById("favorites-container");
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.length === 0) {
        container.innerHTML = `<p>No favorites saved yet.</p>`;
        return;
    }

    // Gruppera efter kategori
    const groups = {
        people: [],
        planets: [],
        starships: [],
        films: []
    };

    favorites.forEach(f => groups[f.type].push(f));

    // Bygg HTML
    container.innerHTML = Object.entries(groups)
        .filter(([_, items]) => items.length > 0)
        .map(([type, items]) => `
            <h2 style="margin-top:1.5rem; text-transform:capitalize;">${type}</h2>
            <div class="favorites-list">
                ${items.map(item => `
                    <div class="featured-card">
                        <img src="${getImage(item.type, item.id)}">
                        <h3>${item.name}</h3>

                        <div class="card-actions">
                            <button class="view-btn">View more</button>
                            <button class="fav-btn">${isFavorite(item.id, item.type) ? "★" : "☆"}</button>
                        </div>
                    </div>
                `).join("")}
            </div>
        `).join("");

    // Aktivera knappar
    container.querySelectorAll(".featured-card").forEach(card => {
        const name = card.querySelector("h3").textContent;
        const type = card.closest("section") ? card.closest("section").dataset.type : null;

        const viewBtn = card.querySelector(".view-btn");
        const favBtn = card.querySelector(".fav-btn");

        // Hämta item-info från DOM
        const img = card.querySelector("img").src;
        const id = img.match(/(\d+)\.jpg/)[1];

        const item = { id, type: card.parentElement.previousElementSibling.textContent.toLowerCase(), name };

        viewBtn.onclick = () => openDetail(item.type, item.id);

        favBtn.onclick = () => {
            toggleFavorite(item);
            favBtn.textContent = isFavorite(item.id, item.type) ? "★" : "☆";
            renderFavorites(); // uppdatera sidan direkt
        };
    });
}
