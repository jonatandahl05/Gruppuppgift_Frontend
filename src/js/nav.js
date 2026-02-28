import { menuData } from "./navData.js";

export function renderNav() {
    return `
    <header class="header">
      <nav class="container nav">
        <a href="./index.html" class="logo">SW</a>

        <form class="nav-search" role="search" aria-label="Sök" autocomplete="off">
          <label class="sr-only" for="nav-search-input">Sök sida</label>
          <input
            id="nav-search-input"
            class="nav-search-input"
            type="search"
            name="q"
            placeholder="Sök..."
            aria-describedby="nav-search-hint"
          />
          <span id="nav-search-hint" class="sr-only">Skriv för att söka och filtrera.</span>
        </form>


        <button
          id="theme-toggle" class="dark-mode-toggle" type="button" aria-label="Växla mörkt läge" aria-pressed="false">
          <span class="theme-toggle__icon">🌙</span>
        </button>

        <button class="nav-toggle"
          type="button"
          aria-label="Öppna meny"
          aria-expanded="false"
          aria-controls="primary-navigation">
          <span class="hamburger"></span>
        </button>

        <ul class="nav-links" id="primary-navigation">
          ${menuData.map(item => `
            <li>
              <button class="nav-link-btn"
                      data-action="${item.action}"
                      data-resource="${item.resource}">
                ${item.label}
              </button>
            </li>
          `).join("")}
        </ul>
      </nav>
    </header>
  `;
}

export function initNav() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const searchInput = document.getElementById('nav-search-input');

    if (!navToggle || !navLinks) return;

    const overlay = document.createElement('div');
    overlay.classList.add('nav-overlay');
    document.body.appendChild(overlay);

    function closeMobileMenu() {
        navToggle.classList.remove("active");
        navLinks.classList.remove("active");
        overlay.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
    }

    // Toggle-funktion (lokal, inte exporterad)
    function toggleMenu() {
        const isOpen = navToggle.classList.toggle("active");
        navLinks.classList.toggle('active');
        overlay.classList.toggle('active');

        navToggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    navToggle.addEventListener("click", toggleMenu);
    overlay.addEventListener("click", closeMobileMenu);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMobileMenu();
    });

    document.querySelectorAll(".nav-link-btn").forEach(btn => {
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

    // Searchbar: dispatcha ett event som main.js kan lyssna på
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = (e.target.value || '').trim();

        window.dispatchEvent(
          new CustomEvent('nav:search', {
            detail: { query }
          })
        );
      });

      // Enter ska inte råka navigera/refresh om någon browser försöker submit:a formuläret
      const searchForm = searchInput.closest('form');
      if (searchForm) {
        searchForm.addEventListener('submit', (e) => e.preventDefault());
      }
    }

    if (window.innerWidth >= 768) {
      initDesktopDropdown();
    } 
    else {
      initMobileMenu();
    }

  };

function initDesktopDropdown() {
    document.querySelectorAll(".nav-item").forEach(item => {
        const mainBtn = item.querySelector(".nav-main");
        const subMenu = item.querySelector(".sub-menu");

        mainBtn.addEventListener("mouseenter", () => { 
            subMenu.classList.add("open");
        });

        item.addEventListener("mouseleave", () => { // <-- Detta är okej men det kan skapa flickrande, det kanske är bättre att sätta "mouseenter" på item istället för mainBtn
            subMenu.classList.remove("open");
        });
    });
}

function initMobileMenu() {
    document.querySelectorAll(".nav-main").forEach(btn => {
        btn.addEventListener("click", () => {
            const key = btn.dataset.key;

            document.querySelectorAll(".sub-menu").forEach(menu => {
                menu.classList.toggle(
                    "active",
                    menu.dataset.parent === key
                );
            });
        });
    });
}

