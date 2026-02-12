import "../css/style.css";
import "./featured.js";
import { renderNav, initNav } from "./nav.js";
import { initOfflineBanner } from "./offlineBanner.js";

document.addEventListener("DOMContentLoaded", () => {
    initOfflineBanner();

  const app = document.querySelector("#app");
  app.insertAdjacentHTML("afterbegin", renderNav());
  
  initNav();

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
  btn.addEventListener("click", () => {
    // IMPORTANT: check the same place you toggle the class
    const isDarkNow = document.documentElement.classList.contains(DARK_CLASS);
    const nextTheme = isDarkNow ? "light" : "dark";
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  });
});

window.addEventListener("nav:viewChange", (e) => {
  const { action, resource, filter } = e.detail || {};

  // 1) Navigera till favoriter
  if (action === "favorites") {
    window.location.href = "./favorites.html";
    return;
  }

  // 2) “List/featured”-vy (anpassa till hur ni vill att UI ska reagera)
  if (action === "list") {
    window.dispatchEvent(
      new CustomEvent("featured:setType", { detail: { type: resource } })
    );
    return;
  }

  // 3) Filter-läge
  if (action === "filter") {
    window.dispatchEvent(
      new CustomEvent("featured:applyFilter", { detail: { type: resource, filter } })
    );
    return;
  }
});

// -- Service Worker --
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./service-worker.js");
      console.log("Service Worker registered ✅");
    } catch (err) {
      console.error("Service Worker registration failed ❌", err);
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
