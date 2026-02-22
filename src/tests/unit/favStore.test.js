// src/tests/unit/favStore.test.js

import { normalizeType, getFavorites, isFavorite, toggleFavorite } from "../../js/favStore.js";

describe("getFavorites", () => {
    it("returns empty array when localStorage is empty", () => {
        expect(getFavorites()).toEqual([]);
    });
});

describe("toggleFavorite", () => {
    it("adds a favorite when it does not exist", () => {
        toggleFavorite({ id: "1", type: "people", name: "Luke" });

        const favs = getFavorites();
        expect(favs).toHaveLength(1);
        expect(favs[0].name).toBe("Luke");
    });
});