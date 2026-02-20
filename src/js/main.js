import "../css/style.css";
import { renderNav, initNav } from "./nav.js";
import { initOfflineBanner } from "./offlineBanner.js";

document.addEventListener("DOMContentLoaded", async () => {
    initOfflineBanner();

    const app = document.getElementById("app");
    if (app) {
        app.insertAdjacentHTML("afterbegin", renderNav());
        initNav();
    }

    initThemeToggle();

    const sections = {
        featured: document.getElementById("featured"),
        favorites: document.getElementById("favorites"),
        detail: document.getElementById("detail")
    };

    function showSection(name) {
        Object.values(sections).forEach(sec => sec.style.display = "none");
        sections[name].style.display = "block";
    }

    const featuredMod = await import("./featured.js");
    await featuredMod.loadFeatured();
    showSection("featured");

    window.addEventListener("open-detail", (e) => {
        const { type, id } = e.detail || {};
        import("./detail.js").then((m) => m.renderDetail(type, id));
        showSection("detail");
    });

    const backBtn = document.getElementById("back-btn");
    if (backBtn) backBtn.onclick = () => showSection("featured");

    window.addEventListener("nav:viewChange", (e) => {
        const { action, resource, filter } = e.detail || {};

        if (action === "favorites") {
            import("./favorites.js").then((m) => m.renderFavorites());
            showSection("favorites");
            return;
        }

        if (!resource) return;

        sections.featured.dataset.type = resource;

        if (action === "list") {
            import("./featured.js").then((m) => m.loadAll(resource));
            showSection("featured");
            return;
        }

        if (action === "filter") {
            import("./featured.js").then((m) => m.loadFiltered(resource, filter));
            showSection("featured");
            return;
        }

        import("./featured.js").then((m) => m.loadFeatured());
        showSection("featured");
    });
});

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
