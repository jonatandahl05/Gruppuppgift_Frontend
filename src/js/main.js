import "../css/style.css";
import "../css/base.css";
import "../css/layout.css";
import "../css/responsive.css";
import "../css/components.css";

import { renderNav, initNav } from "./nav.js";
import { initOfflineBanner } from "./offlineBanner.js";


document.addEventListener("DOMContentLoaded", async () => {
    initOfflineBanner();

    // Inject navigation
    const app = document.getElementById("app");
    if (app) {
        app.insertAdjacentHTML("afterbegin", renderNav());
        initNav();
    }

    initThemeToggle();

    // Sections
    const sections = {
        home: document.getElementById("home"),
        featured: document.getElementById("featured"),
        favorites: document.getElementById("favorites"),
        detail: document.getElementById("detail")
    };

    function showSection(name) {
        Object.values(sections).forEach(sec => sec.style.display = "none");
        sections[name].style.display = "block";
    }

    // ⭐ STARTSIDA
    const featuredMod = await import("./featured.js");
    await featuredMod.loadHome();
    showSection("home");

    // ⭐ DETAIL VIEW
    window.addEventListener("open-detail", (e) => {
        const { type, id } = e.detail || {};
        import("./detail.js").then((m) => m.renderDetail(type, id));
        showSection("detail");
    });

    // ⭐ BACK BUTTON
    const backBtn = document.getElementById("back-btn");
    if (backBtn) backBtn.onclick = () => showSection("home");

    // ⭐ NAVIGATION (LIST, FILTER, FAVORITES)
    window.addEventListener("nav:viewChange", (e) => {
        const { action, resource, filter } = e.detail || {};

        // ⭐ FAVORITES
        if (action === "favorites") {
            import("./favorites.js").then((m) => m.renderFavorites());
            showSection("favorites");
            return;
        }

        // ⭐ FILTER (Light Side, Dark Side, Skywalker, Standalone, Series)
        if (action === "filter" && resource && filter) {
            import("./featured.js").then((m) => m.loadFiltered(resource, filter));
            showSection("featured");
            return;
        }

        // ⭐ LIST (Characters, Planets, Starships, Movies)
        if (action === "list" && resource) {
            import("./featured.js").then((m) => m.loadAll(resource));
            showSection("featured");
            return;
        }
    });
});

// ⭐ THEME TOGGLE
function initThemeToggle() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

    const icon = btn.querySelector(".theme-toggle__icon");

    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark";

    document.documentElement.classList.toggle("dark-theme", isDark);
    if (icon) icon.textContent = isDark ? "☀️" : "🌙";

    btn.onclick = () => {
        const nowDark = document.documentElement.classList.toggle("dark-theme");
        if (icon) icon.textContent = nowDark ? "☀️" : "🌙";
        localStorage.setItem("theme", nowDark ? "dark" : "light");
    };
}

// ⭐ SERVICE WORKER
if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            await navigator.serviceWorker.register("./service-worker.js");
            console.log("Service Worker registered ✅");
        } catch (err) {
            console.error("Service Worker registration failed ❌", err);
        }
    });
}
