import { toggleFavorite, isFavorite, normalizeType } from "./favStore.js";

export function getImage(type, id) {
  const base =
    "https://raw.githubusercontent.com/tbone849/star-wars-guide/master/build/assets/img";
  return {
    people: `${base}/characters/${id}.jpg`,
    planets: `${base}/planets/${id}.jpg`,
    starships: `${base}/starships/${id}.jpg`,
    films: `${base}/films/${id}.jpg`,
  }[type];
}

const popular = {
  people: [1, 4, 5, 10, 11],
  planets: [1, 2, 3, 4, 5],
  starships: [9, 10, 11],
  films: [1, 2, 3],
};

const endpoints = {
  people: "https://swapi.py4e.com/api/people/",
  planets: "https://swapi.py4e.com/api/planets/",
  starships: "https://swapi.py4e.com/api/starships/",
  films: "https://swapi.py4e.com/api/films/",
};

export function openDetail(type, id) {
  window.dispatchEvent(
    new CustomEvent("open-detail", { detail: { type, id: String(id) } })
  );
}

export async function loadFeatured() {
  const section = document.querySelector("#featured");
  const container = document.querySelector(".featured-list");
  if (!section || !container) return;

  container.innerHTML = "";

  const type = normalizeType(section.dataset.type);
  const ids = popular[type];
  const endpoint = endpoints[type];
  if (!ids || !endpoint) return;

  for (const idNum of ids) {
    const id = String(idNum);
    const res = await fetch(`${endpoint}${idNum}/`);
    const data = await res.json();

    const item = { id, type, name: data.name || data.title };

    const card = document.createElement("div");
    card.classList.add("featured-card");

    card.innerHTML = `
      <img src="${getImage(type, id)}" alt="${item.name}">
      <h3>${item.name}</h3>

      <div class="card-actions">
        <button class="view-btn" type="button">View more</button>
        <button class="fav-btn" type="button">${isFavorite(id, type) ? "★" : "☆"}</button>
      </div>
    `;

    card.querySelector(".view-btn").onclick = () => openDetail(type, id);

    const favBtn = card.querySelector(".fav-btn");
    favBtn.onclick = () => {
      toggleFavorite(item);
      favBtn.textContent = isFavorite(id, type) ? "★" : "☆";
    };

    container.appendChild(card);
  }

  const list = document.querySelector(".featured-list");
  const left = document.querySelector(".left-btn");
  const right = document.querySelector(".right-btn");

  if (list && left && right) {
    const cardWidth = 180 + 16;
    left.onclick = () => list.scrollBy({ left: -cardWidth, behavior: "smooth" });
    right.onclick = () => list.scrollBy({ left: cardWidth, behavior: "smooth" });
  }
}
