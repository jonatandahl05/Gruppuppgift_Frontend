import "../css/style.css";
import { initOfflineBanner } from "./offlineBanner.js";

document.addEventListener("DOMContentLoaded", () => {
    initOfflineBanner();

    function initThemeToggle() {
        const btn = document.getElementById("theme-toggle");
        if (!btn) return;

        const saved = localStorage.getItem("theme");
        if (saved === "dark") {
            document.documentElement.classList.add("dark-theme");
            btn.querySelector(".theme-toggle__icon").textContent = "☀️";
        }

        btn.onclick = () => {
            const isDark = document.documentElement.classList.toggle("dark-theme");
            btn.querySelector(".theme-toggle__icon").textContent = isDark ? "☀️" : "🌙";
            localStorage.setItem("theme", isDark ? "dark" : "light");
        };
    }
    initThemeToggle();


    const featured = document.getElementById("featured");
    const favorites = document.getElementById("favorites");
    const detail = document.getElementById("detail");

    function show(section) {
        featured.style.display = "none";
        favorites.style.display = "none";
        detail.style.display = "none";
        section.style.display = "block";
    }

    document.getElementById("nav-favorites").onclick = () => {
        import("./favorites.js").then(m => m.renderFavorites());
        show(favorites);
    };

    window.addEventListener("open-detail", (e) => {
        const { type, id } = e.detail;
        import("./detail.js").then(m => m.renderDetail(type, id));
        show(detail);
    });

    window.addEventListener("show-featured", (e) => {
        const { type } = e.detail;
        featured.dataset.type = type;
        import("./featured.js").then(m => m.loadFeatured());
        show(featured);
    });

    import("./featured.js").then(m => {
        m.loadFeatured();
        show(featured);
    });

    const backBtn = document.getElementById("back-btn");
    if (backBtn) backBtn.onclick = () => show(featured);
});
