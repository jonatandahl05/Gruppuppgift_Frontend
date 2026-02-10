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

export function getImage(type, id) {
    const base = "https://raw.githubusercontent.com/tbone849/star-wars-guide/master/build/assets/img";
    return {
        people: `${base}/characters/${id}.jpg`,
        planets: `${base}/planets/${id}.jpg`,
        starships: `${base}/starships/${id}.jpg`,
        films: `${base}/films/${id}.jpg`
    }[type];
}

const popular = {
    people: [1, 4, 5, 10, 11],
    planets: [1, 2, 3, 4, 5],
    starships: [9, 10, 11],
    films: [1, 2, 3]
};

const endpoints = {
    people: "https://swapi.py4e.com/api/people/",
    planets: "https://swapi.py4e.com/api/planets/",
    starships: "https://swapi.py4e.com/api/starships/",
    films: "https://swapi.py4e.com/api/films/"
};

export function openDetail(type, id) {
    window.dispatchEvent(new CustomEvent("open-detail", { detail: { type, id } }));
}

export async function loadFeatured() {
    const section = document.querySelector("#featured");
    const container = document.querySelector(".featured-list");

    container.innerHTML = "";

    const type = section.dataset.type;
    const ids = popular[type];
    const endpoint = endpoints[type];

    for (const id of ids) {
        const res = await fetch(`${endpoint}${id}/`);
        const data = await res.json();

        const item = { id, type, name: data.name || data.title };

        const card = document.createElement("div");
        card.classList.add("featured-card");

        card.innerHTML = `
            <img src="${getImage(type, id)}">
            <h3>${item.name}</h3>

            <div class="card-actions">
                <button class="view-btn">View more</button>
                <button class="fav-btn"></button>
            </div>
        `;

        // View more
        card.querySelector(".view-btn").onclick = () => openDetail(type, id);

        // Favorite
        const favBtn = card.querySelector(".fav-btn");
        favBtn.textContent = isFavorite(id, type) ? "★" : "☆";

        favBtn.onclick = () => {
            toggleFavorite(item);
            favBtn.textContent = isFavorite(id, type) ? "★" : "☆";
        };

        container.appendChild(card);
        // Scroll buttons
        const list = document.querySelector(".featured-list");
        const left = document.querySelector(".left-btn");
        const right = document.querySelector(".right-btn");

// Scroll one card at a time
        const cardWidth = 180 + 16; // card width + gap

        left.onclick = () => list.scrollBy({ left: -cardWidth, behavior: "smooth" });
        right.onclick = () => list.scrollBy({ left: cardWidth, behavior: "smooth" });

    }
}
