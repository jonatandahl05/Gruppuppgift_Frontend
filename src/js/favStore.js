// favStore.js
export function normalizeType(type) {
    return (type || "").trim().toLowerCase();
}

export function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem("favorites")) || [];
    } catch {
        return [];
    }
}

export function isFavorite(id, type) {
    id = String(id);
    type = normalizeType(type);
    return getFavorites().some(f => f.id === id && f.type === type);
}

export function toggleFavorite(item) {
    let favorites = getFavorites();

    const id = String(item.id);
    const type = normalizeType(item.type);
    const name = item.name || "Unknown";

    const exists = favorites.some(f => f.id === id && f.type === type);

    if (exists) {
        favorites = favorites.filter(f => !(f.id === id && f.type === type));
    } else {
        favorites.push({ id, type, name });
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
}
