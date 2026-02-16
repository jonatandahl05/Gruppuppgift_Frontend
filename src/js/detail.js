import { toggleFavorite, isFavorite, normalizeType } from "./favStore.js";

const endpoints = {
    people: "https://swapi.py4e.com/api/people/",
    planets: "https://swapi.py4e.com/api/planets/",
    starships: "https://swapi.py4e.com/api/starships/",
    films: "https://swapi.py4e.com/api/films/"
};

function getImage(type, id) {
    const base = "https://raw.githubusercontent.com/tbone849/star-wars-guide/master/build/assets/img";
    return {
        people: `${base}/characters/${id}.jpg`,
        planets: `${base}/planets/${id}.jpg`,
        starships: `${base}/starships/${id}.jpg`,
        films: `${base}/films/${id}.jpg`
    }[type];
}

export async function renderDetail(type, id) {
    type = normalizeType(type);
    id = String(id);

    const container = document.getElementById("detail-container");

    const res = await fetch(`${endpoints[type]}${id}/`);
    const data = await res.json();

    const item = { id, type, name: data.name || data.title };

    const infoFields = Object.entries(data)
        .filter(([_, value]) => typeof value === "string" || typeof value === "number")
        .map(([key, value]) => {
            const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
            return `<div><span class="label">${label}:</span> ${value}</div>`;
        })
        .join("");

    container.innerHTML = `
        <img src="${getImage(type, id)}" class="detail-image">
        <h1>${item.name}</h1>

        <button id="fav-detail-btn" class="fav-btn"></button>

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
