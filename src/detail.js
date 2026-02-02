// Read type and id from URL
const params = new URLSearchParams(window.location.search);
const type = params.get("type");
const id = params.get("id");

// API endpoints
const endpoints = {
    people: "https://swapi.py4e.com/api/people/",
    planets: "https://swapi.py4e.com/api/planets/",
    starships: "https://swapi.py4e.com/api/starships/",
    films: "https://swapi.py4e.com/api/films/"
};

// Image source
function getImage(type, id) {
    const base = "https://raw.githubusercontent.com/tbone849/star-wars-guide/master/build/assets/img";
    return {
        people: `${base}/characters/${id}.jpg`,
        planets: `${base}/planets/${id}.jpg`,
        starships: `${base}/starships/${id}.jpg`,
        films: `${base}/films/${id}.jpg`
    }[type];
}

// Fetch homeworld name
async function getHomeworld(url) {
    const res = await fetch(url);
    const data = await res.json();
    return data.name;
}

// Fetch film titles
async function getFilmTitles(filmUrls) {
    const titles = [];

    for (const url of filmUrls) {
        const res = await fetch(url);
        const data = await res.json();
        titles.push(data.title);
    }

    return titles;
}

// Render properties
function renderProperties(data) {
    const ignore = ["created", "edited", "url", "films", "vehicles", "starships", "species", "homeworld"];

    return Object.entries(data)
        .filter(([key]) => !ignore.includes(key))
        .map(([key, value]) => `
            <div class="detail-row">
                <span class="label">${key.replace(/_/g, " ")}:</span>
                <span class="value">${value}</span>
            </div>
        `)
        .join("");
}

// Load details
async function loadDetail() {
    const container = document.querySelector("#detail");

    try {
        const res = await fetch(`${endpoints[type]}${id}/`);
        const data = await res.json();

        // Homeworld
        let homeworldName = null;
        if (data.homeworld) {
            homeworldName = await getHomeworld(data.homeworld);
        }

        // Films
        let filmTitles = [];
        if (data.films && data.films.length > 0) {
            filmTitles = await getFilmTitles(data.films);
        }

        container.innerHTML = `
            <img 
                src="${getImage(type, id)}"
                alt="${data.name || data.title}"
                class="detail-image"
                onerror="this.onerror=null; this.src='/star-wars.png';"
            />

            <h1 class="detail-title">${data.name || data.title}</h1>

            <div class="detail-info">
                ${renderProperties(data)}

                ${homeworldName ? `
                    <div class="detail-row">
                        <span class="label">Homeworld:</span>
                        <span class="value">${homeworldName}</span>
                    </div>
                ` : ""}

                ${filmTitles.length > 0 ? `
                    <div class="detail-row">
                        <span class="label">Films:</span>
                        <span class="value">${filmTitles.join(", ")}</span>
                    </div>
                ` : ""}
            </div>
        `;
    } catch (err) {
        container.innerHTML = "<p>Could not load data.</p>";
    }
}

loadDetail();
