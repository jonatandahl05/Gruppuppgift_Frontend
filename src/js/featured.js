import { toggleFavorite, isFavorite, normalizeType } from "./favStore.js";

/* ========================= KNAPP SORTERING ========================= */
let lastCategoryKey = "";

let currentSort = "relevance";

function sortResults(results) {
  if (currentSort === "relevance") {
    return results;
  }

  const sorted = [...results].sort((a, b) => {
    const nameA = (a.name || a.title || "").toLowerCase();
    const nameB = (b.name || b.title || "").toLowerCase();
    return nameA.localeCompare(nameB, "sv");
  });

  if (currentSort === "desc") {
    sorted.reverse();
  }

  return sorted;
}

/* ========================= SORT UI ========================= */

function renderSortControl() {
  const section = document.querySelector("#featured");
  if (!section) return;

  const existing = section.querySelector(".sort-wrapper");
  if (existing) existing.remove();

  if (section.dataset.view === "featured") return;

  const wrapper = document.createElement("div");
  wrapper.className = "sort-wrapper";

  wrapper.innerHTML = `
    <div class="sort-dropdown">
        <button class="sort-btn">
            <span class="sort-label">${
      currentSort === "asc"
          ? "A–Ö"
          : currentSort === "desc"
              ? "Ö–A"
              : "Relevance"
  }</span>
            <span class="arrow">▾</span>
        </button>
      <div class="sort-menu">
        <button data-sort="relevance">Relevance</button>
        <button data-sort="asc">A–Ö</button>
        <button data-sort="desc">Ö–A</button>
      </div>
    </div>
  `;

  section.insertBefore(wrapper, section.querySelector(".featured-list"));

  const btn = wrapper.querySelector(".sort-btn");
  const menu = wrapper.querySelector(".sort-menu");

  btn.addEventListener("click", () => {
    menu.classList.toggle("open");
  });

  menu.addEventListener("click", (e) => {
    const sort = e.target.dataset.sort;
    if (!sort) return;

    currentSort = sort;
    menu.classList.remove("open");

    const label = wrapper.querySelector(".sort-label");

    if (sort === "asc") label.textContent = "A–Ö";
    else if (sort === "desc") label.textContent = "Ö–A";
    else label.textContent = "Relevance";

    const type = normalizeType(section.dataset.type);

    if (section.dataset.filter) {
      loadFiltered(type, section.dataset.filter);
    } else {
      loadAll(type);
    }
  });
}

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

function extractId(url) {
  const m = url.match(/\/(\d+)\/$/);
  return m ? m[1] : null;
}

/* ========================= FILTER ========================= */

export async function loadFiltered(type, filter) {
  const section = document.querySelector("#featured");
  const container = document.querySelector(".featured-list");
  const endpoint = endpoints[type];
  if (!section || !container || !endpoint) return;

  const newKey = `${type}-${filter}`;
  if (lastCategoryKey !== newKey) {
    currentSort = "relevance";
    lastCategoryKey = newKey;
  }

  section.dataset.view = "filtered";
  section.dataset.filter = filter;
  renderSortControl();

  container.innerHTML = '<p class="loading">Loading...</p>';

  try {
    let nextUrl = endpoint;
    let results = [];

    while (nextUrl) {
      const res = await fetch(nextUrl);
      const data = await res.json();
      results = results.concat(data.results);
      nextUrl = data.next;
    }

    container.innerHTML = "";

    if (type === "people") {
      const droids = ["C-3PO","R2-D2","R5-D4","IG-88","R4-P17","BB-8"];

      const darkSide = [
        "Darth Vader","Palpatine","Wilhuff Tarkin","Greedo",
        "Jabba Desilijic Tiure","Boba Fett","Bossk","Nute Gunray",
        "Watto","Sebulba","Darth Maul","Bib Fortuna",
        "Poggle the Lesser","Dooku","Jango Fett","Zam Wesell",
        "Wat Tambor","San Hill","Mas Amedda","Grievous",
        "Sly Moore","Captain Phasma"
      ];

      const lightSide = [
        "Luke Skywalker","Leia Organa","C-3PO","R2-D2","R4-P17",
        "Owen Lars","Beru Whitesun lars","Biggs Darklighter",
        "Obi-Wan Kenobi","Anakin Skywalker","Chewbacca","Han Solo",
        "Wedge Antilles","Jek Tono Porkins","Yoda","Lando Calrissian",
        "Lobot","Ackbar","Mon Mothma","Arvel Crynyd",
        "Wicket Systri Warrick","Nien Nunb","Qui-Gon Jinn",
        "Finis Valorum","Padmé Amidala","Jar Jar Binks",
        "Roos Tarpals","Rugor Nass","Ric Olié","Quarsh Panaka",
        "Shmi Skywalker","Ayla Secura","Ratts Tyerel",
        "Dud Bolt","Gasgano","Ben Quadinaros","Mace Windu",
        "Ki-Adi-Mundi","Kit Fisto","Eeth Koth","Adi Gallia",
        "Saesee Tiin","Yarael Poof","Plo Koon","Gregar Typho",
        "Cordé","Cliegg Lars","Luminara Unduli","Barriss Offee",
        "Dormé","Bail Prestor Organa","Dexter Jettster",
        "Lama Su","Taun We","Jocasta Nu","Shaak Ti",
        "Tarfful","Raymus Antilles","Tion Medon",
        "Finn","Rey","Poe Dameron"
      ];

      results = results.filter(item => {
        const name = item.name;
        if (filter === "droids") return droids.includes(name);
        if (filter === "dark") return darkSide.includes(name);
        if (filter === "light") return lightSide.includes(name);
        return false;
      });
    }

    if (type === "starships") {
      const categories = {
        imperial: [
          "Star Destroyer", "Executor", "TIE Advanced x1",
          "Imperial shuttle", "Death Star"
        ],
        rebel: [
          "CR90 corvette", "Rebel transport",
          "Millennium Falcon", "X-wing", "Y-wing", "A-wing",
          "B-wing", "EF76 Nebulon-B escort frigate", "Calamari Cruiser"
        ],
        separatist: [
          "Trade Federation cruiser", "Droid control ship",
          "Scimitar", "Belbullab-22 starfighter"
        ],
        republic: [
          "Republic Cruiser", "Republic attack cruiser",
          "Jedi Interceptor", "Jedi starfighter", "Naboo fighter",
          "Naboo Royal Starship", "Naboo star skiff", "H-type Nubian yacht",
          "J-type diplomatic barge", "AA-9 Coruscant freighter",
          "Theta-class T-2c shuttle", "arc-170", "V-wing",
          "Banking clan frigate"
        ]
      };

      results = results.filter(item =>
          categories[filter]?.includes(item.name)
      );
    }

    results = sortResults(results);

    for (const item of results) {
      const id = extractId(item.url);
      if (!id) continue;

      const name = item.name || item.title || "Unknown";
      const card = document.createElement("div");
      card.classList.add("featured-card");

      card.innerHTML = `
        <img src="${getImage(type, id)}" alt="${name}" />
        <h3>${name}</h3>
        <div class="card-actions">
          <button class="view-btn btn-primary" type="button">View more</button>
          <button class="fav-btn" type="button">
            ${isFavorite(id, type) ? "★" : "☆"}
          </button>
        </div>
      `;

      card.querySelector(".view-btn").onclick = () =>
          openDetail(type, id);

      const favBtn = card.querySelector(".fav-btn");
      favBtn.onclick = () => {
        toggleFavorite({ id, type, name });
        favBtn.textContent = isFavorite(id, type) ? "★" : "☆";
      };

      container.appendChild(card);
    }

  } catch (err) {
    console.error("Error loading filtered:", err);
    container.innerHTML =
        '<p class="error">Could not load data.</p>';
  }
}

/* ========================= FEATURED ========================= */

export async function loadFeatured() {
  const section = document.querySelector("#featured");
  const container = document.querySelector(".featured-list");
  if (!section || !container) return;

  currentSort = "relevance";
  lastCategoryKey = "featured";

  section.dataset.view = "featured";
  delete section.dataset.filter;
  renderSortControl();

  const token = String(Date.now());
  section.dataset.loadToken = token;

  const type = normalizeType(section.dataset.type);
  const ids = popular[type];
  const endpoint = endpoints[type];
  if (!ids || !endpoint) return;

  container.innerHTML = "";

  for (let i = 0; i < ids.length; i++) {
    const skel = document.createElement("div");
    skel.className = "featured-card featured-card--skeleton";
    skel.innerHTML = `
      <div class="skeleton-img"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-actions"></div>
    `;
    container.appendChild(skel);
  }

  const tasks = ids.map(async (idNum, index) => {
    const id = String(idNum);

    try {
      const res = await fetch(`${endpoint}${idNum}/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (section.dataset.loadToken !== token) return;

      const name = data.name || data.title || "Unknown";
      const item = { id, type, name };

      const card = document.createElement("div");
      card.classList.add("featured-card");

      card.innerHTML = `
        <img src="${getImage(type, id)}" alt="${name}" />
        <h3>${item.name}</h3>
        <div class="card-actions">
          <button class="view-btn btn-primary" type="button">View more</button>
          <button class="fav-btn" type="button">
            ${isFavorite(id, type) ? "★" : "☆"}
          </button>
        </div>
      `;

      card.querySelector(".view-btn").onclick = () =>
          openDetail(type, id);

      const favBtn = card.querySelector(".fav-btn");
      favBtn.onclick = () => {
        toggleFavorite(item);
        favBtn.textContent = isFavorite(id, type) ? "★" : "☆";
      };

      const placeholder = container.children[index];
      if (placeholder) {
        container.replaceChild(card, placeholder);
      } else {
        container.appendChild(card);
      }
    } catch (err) {
      console.error("Featured fetch error:", err);
    }
  });

  await Promise.allSettled(tasks);
}

/* ========================= LOAD ALL ========================= */

export async function loadAll(type) {
  const section = document.querySelector("#featured");
  const container = document.querySelector(".featured-list");
  const endpoint = endpoints[type];
  if (!section || !container || !endpoint) return;

  const newKey = `${type}-all`;
  if (lastCategoryKey !== newKey) {
    currentSort = "relevance";
    lastCategoryKey = newKey;
  }


  section.dataset.view = "all";
  delete section.dataset.filter;
  renderSortControl();

  container.innerHTML = '<p class="loading">Loading...</p>';

  try {
    let nextUrl = endpoint;
    let results = [];

    while (nextUrl) {
      const res = await fetch(nextUrl);
      const data = await res.json();
      results = results.concat(data.results);
      nextUrl = data.next;
    }

    container.innerHTML = "";
    results = sortResults(results);

    for (const item of results) {
      const id = extractId(item.url);
      if (!id) continue;

      const name = item.name || item.title || "Unknown";
      const card = document.createElement("div");
      card.classList.add("featured-card");

      card.innerHTML = `
        <img src="${getImage(type, id)}" alt="${name}" />
        <h3>${name}</h3>
        <div class="card-actions">
          <button class="view-btn btn-primary" type="button">View more</button>
          <button class="fav-btn" type="button">
            ${isFavorite(id, type) ? "★" : "☆"}
          </button>
        </div>
      `;

      card.querySelector(".view-btn").onclick = () =>
          openDetail(type, id);

      const favBtn = card.querySelector(".fav-btn");
      favBtn.onclick = () => {
        toggleFavorite({ id, type, name });
        favBtn.textContent = isFavorite(id, type) ? "★" : "☆";
      };

      container.appendChild(card);
    }

  } catch (err) {
    console.error("Error loading all:", err);
    container.innerHTML =
        '<p class="error">Could not load data.</p>';
  }
}