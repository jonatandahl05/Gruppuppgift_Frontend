import "../css/style.css";
import "./featured.js";
import { renderNav, initNav } from "./nav.js";
import { initOfflineBanner } from "./offlineBanner.js";

const THEME_KEY = "theme"; // "dark" | "light"
const DARK_CLASS = "dark-theme"; // must match your CSS selector

initOfflineBanner();

function applyTheme(theme) {
  const isDark = theme === "dark";

  // Use ONE place for the class; here we use <html> (documentElement)
  document.documentElement.classList.toggle(DARK_CLASS, isDark);

  const btn = document.getElementById("theme-toggle");
  if (btn) btn.setAttribute("aria-pressed", String(isDark));

  const icon = document.querySelector("#theme-toggle .theme-toggle__icon");
  // If dark is ON, show sun (meaning: click to go light). If light is ON, show moon.
  if (icon) icon.textContent = isDark ? "☀️" : "🌙";
}

document.addEventListener("DOMContentLoaded", () => {
  
  const app = document.querySelector("#app");
  app.insertAdjacentHTML("afterbegin", renderNav());
  
  initNav();

  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  const initialTheme = saved ?? (prefersDark ? "dark" : "light");
  applyTheme(initialTheme);

  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  btn.addEventListener("click", () => {
    // IMPORTANT: check the same place you toggle the class
    const isDarkNow = document.documentElement.classList.contains(DARK_CLASS);
    const nextTheme = isDarkNow ? "light" : "dark";
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  });
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
  });
}
