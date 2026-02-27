
// Visar detaljerad information när vi klickar in på korten.

import { toggleFavorite, isFavorite, normalizeType } from "./favStore.js";
import { aboutSections } from "./aboutSections.js";
import { fetchById } from "./fetchData.js";
import { getImage, PLACEHOLDER_IMG } from "./media.js";

export async function renderDetail(type, id) {
    type = normalizeType(type);
    id = String(id);

    const container = document.getElementById("detail-container");

    const data = await fetchById(type, id);

    const item = { id, type, name: data.name || data.title };

    const aboutEntry = aboutSections[type] ? aboutSections[type][id] : null;
    const aboutMarkup = aboutEntry
        ? `
        <section class="detail-about" aria-labelledby="detail-about-title">
            <h2 id="detail-about-title">About</h2>
            <p>${aboutEntry.about}</p>
        </section>
        `
        : "";

    const infoFields = Object.entries(data)
        .filter(([_, value]) => typeof value === "string" || typeof value === "number")
        .map(([key, value]) => {
            const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
            return `<div><span class="label">${label}:</span> ${value}</div>`;
        })
        .join("");

    container.innerHTML = `
        <img 
            src="${getImage(type, id)}" 
            class="detail-image"
            onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';"
        />        
        
        <h1>${item.name}</h1>

        <button id="fav-detail-btn" class="fav-btn"></button>

        ${aboutMarkup}

        <div class="detail-info">${infoFields}</div>
    `;

    const favBtn = document.getElementById("fav-detail-btn");
    favBtn.textContent = isFavorite(id, type)
        ? "★ Remove Favorite"
        : "☆ Add Favorite";

    favBtn.onclick = () => {
        toggleFavorite(item);
        favBtn.textContent = isFavorite(id, type)
            ? "★ Remove Favorite"
            : "☆ Add Favorite";
    };
}
