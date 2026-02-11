export function initNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!navToggle || !navLinks) return;

    let overlay = document.querySelector('.nav-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.classList.add('nav-overlay');
        document.body.appendChild(overlay);
    }

    function toggleMenu() {
        const isOpen = navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        overlay.classList.toggle('active');

        navToggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    // 🔹 NYTT: koppla nav-länkar till appen
    navLinks.querySelectorAll('a[data-type]').forEach(link => {
        link.addEventListener('click', () => {
            const type = link.dataset.type;
            window.dispatchEvent(new CustomEvent("show-featured", {
                detail: { type }
            }));
            if (navLinks.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Favorites-länken får bara stänga menyn (main.js sköter sidan)
    const favLink = document.getElementById("nav-favorites");
    if (favLink) {
        favLink.addEventListener("click", () => {
            if (navLinks.classList.contains("active")) {
                toggleMenu();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            toggleMenu();
        }
    });

    navToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
}

document.addEventListener("DOMContentLoaded", initNav);
