
// Rendrerar favoriter baserat på vad som favStore.js har sparat.

import { getFavorites, normalizeType } from "./favStore.js";
import { createCard } from "./card.js";

export function renderFavorites() {
    const container = document.getElementById("favorites-container");
    const favorites = getFavorites();

    if (favorites.length === 0) {
        container.innerHTML = `<p>No favorites saved yet...</p>`;
        return;
    }

    const groups = {
        people: [],
        planets: [],
        starships: [],
        films: []
    };

    favorites.forEach(f => {
        const type = normalizeType(f.type);
        if (groups[type]) groups[type].push(f);
    });

    container.innerHTML = "";
    Object.entries(groups)
        .filter(([_, items]) => items.length > 0)
        .forEach(([type, items]) => {
            const heading = document.createElement("h2");
            heading.style.marginTop = "1.5rem";
            heading.style.textTransform = "capitalize";
            heading.textContent = type;
            container.appendChild(heading);

    const wrapper = document.createElement("div");
    wrapper.className = "favorites-wrapper";

    const list = document.createElement("div");
    list.className = "favorites-list";

    for (const item of items) {
        const card = createCard(item, type, {
            viewBtnClass: "btn-primary",
            onFavoriteToggle: ({ card, isFavorite }) => {
                if (isFavorite) return;

                card.remove();

                // om listan blev tom, ta bort hela sektionen för typen
                if (!list.children.length) {
                    wrapper.remove();
                    heading.remove();
                }

                // om inga favoriter finns kvar alls, visa tom-text
                if (!container.querySelector(".favorites-list")) {
                    container.innerHTML = `<p>No favorites saved yet.</p>`;
                }
            }
        });

        if (!card) continue;
        list.appendChild(card);
    }

            wrapper.appendChild(list);
            container.appendChild(wrapper);
    });
}
