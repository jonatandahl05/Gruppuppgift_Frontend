import { menuData } from "./navData.js";

export function renderNav() {
    return `
    <header class="header">
      <nav class="container nav">
        <a href="/" class="logo">SW</a>

        <button class="nav-toggle" 
                aria-label="Öppna meny"
                aria-expanded="false">
          <span class="hamburger"></span>
        </button>

        <ul class="nav-links">
          ${menuData.map(cat => `
            <li class="nav-item">
              <button class="nav-main" data-key="${cat.key}">
                ${cat.label}
              </button>
              <ul class="sub-menu" data-parent="${cat.key}">
                ${cat.subItems.map(sub => `
                  <li>
                    <button
                      class="sub-item"
                      data-action="${sub.action}"
                      data-resource="${sub.resource || ""}"
                      data-filter="${sub.filter || ""}">
                      ${sub.label}
                    </button>
                  </li>
                `).join("")}
              </ul>
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

    if (!navToggle || !navLinks) return;

    const overlay = document.createElement('div');
    overlay.classList.add('nav-overlay');
    document.body.appendChild(overlay);

    function closeMobileMenu() {
        navToggle.classList.remove("active");
        navLinks.classList.remove("active");
        overlay.classList.remove("active");
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

    document.querySelectorAll(".sub-item").forEach(btn => {
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

    if (window.innerWidth >= 768) {
      initDesktopDropdown();
    } 
    else {
      initMobileMenu();
    }

  };

//    navLinks.querySelectorAll('a').forEach(link => {
//        link.addEventListener('click', () => {
//            if (navLinks.classList.contains('active')) {
//                toggleMenu();
//            }
//        });
//    });

function initDesktopDropdown() {
    document.querySelectorAll(".nav-item").forEach(item => {
        const mainBtn = item.querySelector(".nav-main");
        const subMenu = item.querySelector(".sub-menu");

        mainBtn.addEventListener("mouseenter", () => {
            subMenu.classList.add("open");
        });

        item.addEventListener("mouseleave", () => {
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