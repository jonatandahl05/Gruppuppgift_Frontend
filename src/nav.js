const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');



const overlay = document.createElement('div');
overlay.classList.add('nav-overlay');
document.body.appendChild(overlay);


// Toggle-funktion
export function toggleMenu() {
    const isOpen = navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    overlay.classList.toggle('active');

    // Uppdatera aria-expanded för tillgänglighet
    navToggle.setAttribute('aria-expanded', isOpen);

    // Förhindra scroll när menyn är öppen
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