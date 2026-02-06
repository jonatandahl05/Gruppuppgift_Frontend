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


// Current view
let currentView = {
    action: "featured",
    resource: "people",
    filter: ""
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


// Ladda ALL från API (för "All"-knappen)
async function loadAll(type) {
    const container = document.querySelector(".featured-list");
    const endpoint = endpoints[type];

    if (!container || !endpoint) return;

    container.innerHTML = '<p class="loading">Loading...</p>';

    try {
        let allResults = [];
        let nextUrl = endpoint;

        while (nextUrl) {
            const res = await fetch(nextUrl);
            const data = await res.json();
            allResults = allResults.concat(data.results);
            nextUrl = data.next;

            // Begränsa till 18
            if (allResults.length >= 18) break;
        }

        container.innerHTML = "";

        for (const item of allResults) {
            const id = extractId(item.url);
            if (id) {
                const card = createCard(item, type, id);
                container.appendChild(card);
            }
        }

    } catch (err) {
        console.error("Error loading all:", err);
        container.innerHTML = '<p class="error">Could not load data. Try again later.</p>';
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


// Ladda med filter (Dark/Light Side)
async function loadFiltered(type, filter) {
    const container = document.querySelector(".featured-list");
    const endpoint = endpoints[type];

    if (!container || !endpoint) return;

    container.innerHTML = '<p class="loading">Loading...</p>';

    const darkSideNames = ["vader", "darth", "sidious", "palpatine", "maul", "dooku", "kylo"];
    const lightSideNames = ["luke", "leia", "obi-wan", "yoda", "rey", "finn", "han", "chewbacca"];

    try {
        const res = await fetch(endpoint);
        const data = await res.json();

        container.innerHTML = "";

        for (const item of data.results) {
            const name = (item.name || item.title || "").toLowerCase();
            const id = extractId(item.url);

            let matches = false;

            if (filter === "dark") {
                matches = darkSideNames.some(dark => name.includes(dark));
            } else if (filter === "light") {
                matches = lightSideNames.some(light => name.includes(light));
            }

            if (matches && id) {
                const card = createCard(item, type, id);
                container.appendChild(card);
            }
        }

        if (container.children.length === 0) {
            container.innerHTML = '<p class="no-results">No characters found for this filter.</p>';
        }

    } catch (err) {
        console.error("Error loading filtered:", err);
        container.innerHTML = '<p class="error">Could not load data.</p>';
    }
}


// Handle viewchange
export async function handleViewChange(action, resource, filter) {
    currentView = { action, resource, filter };

    updateTitle(action, resource, filter);

    switch (action) {
        case "list":
            await loadAll(resource);
            break;

        case "filter":
            await loadFiltered(resource, filter);
            break;

        case "favorites":
            loadFavorites();
            break;

        default:
            await loadFeatured(resource);
            break;
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