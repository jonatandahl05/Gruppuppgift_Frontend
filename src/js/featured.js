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

// ===============================
// Populära ID:n
// ===============================
const popular = {
    people: [1, 4, 5, 10, 11],
    planets: [1, 2, 3, 4, 5],
    starships: [9, 10, 11],
    films: [1, 2, 3]
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

function toggleFavorite(item) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    const exists = favorites.some(fav => fav.id === item.id);

    if (exists) {
        favorites = favorites.filter(fav => fav.id !== item.id);
    } else {
        favorites.push(item);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
}


// ===============================
// Öppna detaljsida
// ===============================
function openDetail(type, id) {
    window.location.href = `detail.html?type=${type}&id=${id}`;
}

// ===============================
// Ladda Featured
// ===============================
async function loadFeatured() {
    const section = document.querySelector("#featured");
    const container = document.querySelector(".featured-list");

    if (!section || !container) return;

    const type = section.dataset.type;
    const ids = popular[type];
    const endpoint = endpoints[type];

    for (const id of ids) {
        try {
            const res = await fetch(`${endpoint}${id}/`);
            const data = await res.json();

            const card = document.createElement("div");
            card.classList.add("featured-card");

            card.innerHTML = `
    <img 
        src="${getImage(type, id)}" 
        alt="${data.name || data.title}"
        onerror="this.onerror=null; this.src='/star-wars.png';"
    />
    <h3>${data.name || data.title}</h3>

    <div class="featured-actions">
        <button type="button" class="view-btn">View more</button>
        <button 
            type="button" 
            class="fav-btn" 
            data-id="${endpoint}${id}/" 
            data-name="${data.name || data.title}" 
            data-type="${type}">
        </button>
    </div>
`;

            card.querySelector(".view-btn").addEventListener("click", () => openDetail(type, id));

            const favBtn = card.querySelector(".fav-btn");

            favBtn.addEventListener("click", () => {
                const item = {
                    id: favBtn.dataset.id,
                    name: favBtn.dataset.name,
                    type: favBtn.dataset.type
                };

                toggleFavorite(item);
                favBtn.classList.toggle("active");
            });

           // Markera om redan favorit
            const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
            const isFav = savedFavorites.some(fav => fav.id === favBtn.dataset.id);
            if (isFav) {
                favBtn.classList.add("active");
            }

            container.appendChild(card);
        } catch (err) {
            console.error("Fel vid hämtning:", err);
        }
    }
}

loadFeatured();

// ===============================
// Navigera mellan kort (mobile)
// ===============================
const list = document.querySelector(".featured-list");
const leftBtn = document.querySelector(".left-btn");
const rightBtn = document.querySelector(".right-btn");

if (list && leftBtn && rightBtn) {
    rightBtn.addEventListener("click", () => {
        const cardWidth = list.querySelector(".featured-card").offsetWidth + 16;
        list.scrollBy({ left: cardWidth, behavior: "smooth" });
    });

    leftBtn.addEventListener("click", () => {
        const cardWidth = list.querySelector(".featured-card").offsetWidth + 16;
        list.scrollBy({ left: -cardWidth, behavior: "smooth" });
    });
}

// Byt typ som visas via menyn
const menuLinks = document.querySelectorAll(".nav-links a[data-type]");
const featuredSection = document.querySelector("#featured");

menuLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();

        const type = link.dataset.type;
        if (!type || !featuredSection) return;

        // Uppdatera vad som visas
        featuredSection.dataset.type = type;

        // Ta bort gammalt
        const container = document.querySelector(".featured-list");
        container.innerHTML = "";

        // Uppdatera titel
        document.querySelector("#featured-title").textContent =
            link.textContent;

        // Ladda nya featured
        loadFeatured();
    });
});