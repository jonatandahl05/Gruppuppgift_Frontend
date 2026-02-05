const container = document.getElementById("favorites-container");

function renderFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.length === 0) {
        container.innerHTML = `<p>No favorites saved yet.</p>`;
        return;
    }

    container.innerHTML = favorites.map(item => `
        <div class="card">
            <h3>${item.name}</h3>
            <p>${item.type}</p>
        </div>
    `).join("");
}

renderFavorites();
