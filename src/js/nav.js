import { menuData } from "./navData.js";

export function renderNav() {
    return `
    <header class="header">
      <nav class="container nav">
        <a href="./index.html" class="logo">SW</a>

        

        <button class="nav-toggle" aria-label="Open menu" aria-expanded="false">
          <span class="hamburger"></span>
        </button>

        <ul class="nav-links">
          ${menuData.map(item => `
            <li class="nav-item">
              <button class="nav-btn"
                data-action="${item.action}"
                data-resource="${item.resource || ""}"
                data-filter="${item.filter || ""}">
                ${item.label}
              </button>
            </li>
          `).join("")}
        </ul>
        <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
          <span class="theme-toggle__icon">🌙</span>
        </button>
      </nav>
    </header>
  `;
}


export function initNav() {
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (!navToggle || !navLinks) return;

    const overlay = document.createElement("div");
    overlay.classList.add("nav-overlay");
    document.body.appendChild(overlay);

    function closeMobileMenu() {
        navToggle.classList.remove("active");
        navLinks.classList.remove("active");
        overlay.classList.remove("active");
        document.body.style.overflow = "";
    }

    function toggleMenu() {
        const isOpen = navToggle.classList.toggle("active");
        navLinks.classList.toggle("active");
        overlay.classList.toggle("active");
        navToggle.setAttribute("aria-expanded", isOpen);
        document.body.style.overflow = isOpen ? "hidden" : "";
    }

    navToggle.addEventListener("click", toggleMenu);
    overlay.addEventListener("click", closeMobileMenu);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMobileMenu();
    });

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const action = btn.dataset.action;
            const resource = btn.dataset.resource;
            const filter = btn.dataset.filter;

            window.dispatchEvent(
                new CustomEvent("nav:viewChange", {
                    detail: { action, resource, filter }
                })
            );

            closeMobileMenu();
        });
    });
}
