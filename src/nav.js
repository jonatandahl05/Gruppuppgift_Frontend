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
          <li>
            <button class="nav-main" data-category="people">
              Characters
            </button>
          </li>
          <li>
            <button class="nav-main" data-category="planets">
              Planets
            </button>
          </li>
          <li>
            <button class="nav-main" data-category="films">
              Movies
            </button>
          </li>
          <li>
            <button class="nav-main" data-category="starships">
              Star-ships
            </button>
          </li>
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

    // Toggle-funktion (lokal, inte exporterad)
    function toggleMenu() {
        const isOpen = navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        overlay.classList.toggle('active');

        navToggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            toggleMenu();
        }
    });

    navToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
}