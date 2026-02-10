import "../css/style.css";

/* ===============================
   DARK MODE
================================ */
function initThemeToggle() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

    // Ladda sparat tema
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
        document.documentElement.classList.add("dark-theme");
        btn.setAttribute("aria-pressed", "true");
        btn.querySelector(".theme-toggle__icon").textContent = "☀️";
    }

    btn.onclick = () => {
        const isDark = document.documentElement.classList.toggle("dark-theme");

        btn.setAttribute("aria-pressed", isDark);
        btn.querySelector(".theme-toggle__icon").textContent = isDark ? "☀️" : "🌙";

        localStorage.setItem("theme", isDark ? "dark" : "light");
    };
}
initThemeToggle();


/* ===============================
   CATEGORY NAVIGATION
================================ */
function initCategoryNavigation() {
    const links = document.querySelectorAll(".nav-links a[data-type]");
    links.forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const type = link.dataset.type;
            window.dispatchEvent(new CustomEvent("show-featured", { detail: { type } }));
        };
    });
}

initCategoryNavigation();

/* ===============================
   SHOW SECTIONS
================================ */
const featured = document.getElementById("featured");
const favorites = document.getElementById("favorites");
const detail = document.getElementById("detail");

function show(section) {
    featured.style.display = "none";
    favorites.style.display = "none";
    detail.style.display = "none";
    section.style.display = "block";
}

/* ===============================
   FAVORITES
================================ */
document.getElementById("nav-favorites").onclick = () => {
    import("./favorites.js").then(m => m.renderFavorites());
    show(favorites);
};

/* ===============================
   DETAILS
================================ */
window.addEventListener("open-detail", (e) => {
    const { type, id } = e.detail;
    import("./detail.js").then(m => m.renderDetail(type, id));
    show(detail);
});

/* ===============================
   FEATURED
================================ */
window.addEventListener("show-featured", (e) => {
    const { type } = e.detail;
    featured.dataset.type = type;
    import("./featured.js").then(m => m.loadFeatured());
    show(featured);
});

/* ===============================
   START APP
================================ */
import("./featured.js").then(m => m.loadFeatured());
/* ===============================
   MOBILE NAV (hamburger)
================================ */
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navOverlay = document.querySelector(".nav-overlay");

navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active");
    navLinks.classList.toggle("active");
    navOverlay.classList.toggle("active");
});

navOverlay.addEventListener("click", () => {
    navToggle.classList.remove("active");
    navLinks.classList.remove("active");
    navOverlay.classList.remove("active");
});
