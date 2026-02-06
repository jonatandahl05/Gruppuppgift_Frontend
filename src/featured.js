// ===============================
// Bildkällor (GitHub mirror)
// ===============================
function getImage(type, id) {
    const base = "https://raw.githubusercontent.com/tbone849/star-wars-guide/master/build/assets/img";

    const paths = {
        people: `${base}/characters/${id}.jpg`,
        planets: `${base}/planets/${id}.jpg`,
        starships: `${base}/starships/${id}.jpg`,
        films: `${base}/films/${id}.jpg`
    };

    return paths[type];
}

// Hämta id från url

function extractId(url) {
    // URL ser ut som: "https://swapi.py4e.com/api/people/1/"
    const matches = url.match(/\/(\d+)\/$/);
    return matches ? matches[1] : null;
}

// ===============================
// Populära ID:n
// ===============================
const popular = {
    people: [1, 4, 5, 10, 11],
    planets: [1, 2, 3, 4, 5],
    starships: [9, 10, 11, 12, 13],
    films: [1, 2, 3, 4, 5]
};

// ===============================
// API-endpoints
// ===============================
const endpoints = {
    people: "https://swapi.py4e.com/api/people/",
    planets: "https://swapi.py4e.com/api/planets/",
    starships: "https://swapi.py4e.com/api/starships/",
    films: "https://swapi.py4e.com/api/films/"
};

// ===============================
// Öppna detaljsida
// ===============================
function openDetail(type, id) {
    window.location.href = `detail.html?type=${type}&id=${id}`;
}

// Skapa ett kort
function createCard(data, type, id) {
    const card = document.createElement("div");
    card.classList.add("featured-card");

    card.innerHTML = `
        <img 
            src="${getImage(type, id)}"
            alt="${data.name || data.title}"
            onerror="this.onerror=null; this.src='/star-wars.png';"
        />
        <h3>${data.name || data.title}</h3>
        <button type="button">View more</button>
    `;

    card.querySelector("button").addEventListener("click", () => openDetail(type, id));

    return card;
}

// Uppdatera titel på sidan
function updateTitle(action, resource, filter) {
    const titleEl = document.querySelector("#featured-title");
    if (!titleEl) return;

    const resourceNames = {
        people: "Characters",
        planets: "Planets",
        starships: "Starships",
        films: "Movies"
    };

    if (action === "favorites") {
        titleEl.textContent = "Your Favourites";
    } else if (action === "filter" && filter) {
        const filterName = filter.charAt(0).toUpperCase() + filter.slice(1);
        titleEl.textContent = `${filterName} Side Characters`;
    } else if (action === "list") {
        titleEl.textContent = `All ${resourceNames[resource] || resource}`;
    } else {
        titleEl.textContent = `Featured ${resourceNames[resource] || resource}`;
    }
}

// ===============================
// Ladda Featured
// ===============================
async function loadFeatured(type) {
    const container = document.querySelector(".featured-list");
    const ids = popular[type];
    const endpoint = endpoints[type];

    if (!container || !ids || !endpoint) return;

    container.innerHTML = '<p class="loading">Loading...</p>';

    try {
        container.innerHTML = "";

        for (const id of ids) {
            const res = await fetch(`${endpoint}${id}/`);
            const data = await res.json();
            const card = createCard(data, type, id);
            container.appendChild(card);
        }
    } catch (err) {
        console.error("Error loading featured:", err);
        container.innerHTML = '<p class="error">Could not load data.</p>';
    }
}

// addEventlistener på nav viewchange
window.addEventListener("nav:viewChange", (e) => {
    const { action, resource, filter } = e.detail;

    const section = document.querySelector("#featured");
    if (!section) return;

    if (resource) {
        section.dataset.type = resource;
    }

    section.dataset.filter = filter || "";

    loadFeatured();
});


// Init – första laddning

loadFeatured();

// ===============================
// Navigera mellan kort (mobile)
// ===============================
const list = document.querySelector(".featured-list");
const leftBtn = document.querySelector(".left-btn");
const rightBtn = document.querySelector(".right-btn");

if (list && leftBtn && rightBtn) {
    rightBtn.addEventListener("click", () => {
        const cardWidth = list.querySelector(".featured-card")?.offsetWidth + 16 || 200;
        list.scrollBy({ left: cardWidth, behavior: "smooth" });
    });

    leftBtn.addEventListener("click", () => {
        const cardWidth = list.querySelector(".featured-card")?.offsetWidth + 16 || 200;
        list.scrollBy({ left: -cardWidth, behavior: "smooth" });
    });
}