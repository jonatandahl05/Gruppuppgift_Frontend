import "../css/style.css";
import "../css/base.css";
import "../css/layout.css";
import "../css/responsive.css";
import "../css/components.css";

import { renderNav, initNav } from "./nav.js";
import { initOfflineBanner } from "./offlineBanner.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1) Offline banner
  initOfflineBanner();

  // 2) Rendera nav i #app och initiera
  const app = document.getElementById("app");
  if (app) {
    app.insertAdjacentHTML("afterbegin", renderNav());
    initNav();
  }

  // 3) Theme toggle (behåll enkel variant)
  initThemeToggle();

  // 4) SPA sections
  const featured = document.getElementById("featured");
  const favorites = document.getElementById("favorites");
  const detail = document.getElementById("detail");

  function show(section) {
    if (!featured || !favorites || !detail) return;

    featured.style.display = "none";
    favorites.style.display = "none";
    detail.style.display = "none";
    section.style.display = "block";
  }

  // 5) Default: visa featured och ladda första gången
  const featuredMod = await import("./featured.js");
  await featuredMod.loadFeatured();
  show(featured);

  // 6) När ett kort vill öppna detail (featured.js dispatchar open-detail)
  window.addEventListener("open-detail", (e) => {
    const { type, id } = e.detail || {};
    import("./detail.js").then((m) => m.renderDetail(type, id));
    show(detail);
  });

  // 7) Back från detail
  const backBtn = document.getElementById("back-btn");
  if (backBtn) backBtn.onclick = () => show(featured);

  // 8) NAV adapter: dropdown-nav dispatchar nav:viewChange
  window.addEventListener("nav:viewChange", (e) => {
    const { action, resource, filter } = e.detail || {};

    // 1) Favourites
    if (action === "favorites") {
      import("./favorites.js").then((m) => m.renderFavorites());
      show(favorites);
      return;
    }

    // Safety: måste finnas
    if (!resource) return;

    // Uppdatera vilken resurs som visas
    if (featured) featured.dataset.type = resource;

    // 2) All
    if (action === "list") {
      import("./featured.js").then((m) => m.loadAll(resource));
      show(featured);
      return;
    }

    // 3) Dark/Light filter
    if (action === "filter") {
      import("./featured.js").then((m) => m.loadFiltered(resource, filter));
      show(featured);
      return;
    }

    // Default fallback
    import("./featured.js").then((m) => m.loadFeatured());
    show(featured);
  });

});

function initThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    document.documentElement.classList.add("dark-theme");
    const icon = btn.querySelector(".theme-toggle__icon");
    if (icon) icon.textContent = "☀️";
  }

  btn.onclick = () => {
    const isDark = document.documentElement.classList.toggle("dark-theme");
    const icon = btn.querySelector(".theme-toggle__icon");
    if (icon) icon.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };
}

// 9) Service Worker (PWA)
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
