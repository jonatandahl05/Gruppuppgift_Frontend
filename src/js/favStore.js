export function normalizeType(type) {
    return type.trim().toLowerCase();
}

export function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites")) || [];
}

export function isFavorite(id, type) {
    id = String(id);
    type = normalizeType(type);
    return getFavorites().some(f => f.id === id && f.type === type);
}

export function toggleFavorite(item) {
    let favorites = getFavorites();

    item.id = String(item.id);
    item.type = normalizeType(item.type);

    const exists = favorites.some(f => f.id === item.id && f.type === item.type);

    if (exists) {
        favorites = favorites.filter(f => !(f.id === item.id && f.type === item.type));
    } else {
        favorites.push(item);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
}
