// src/tests/unit/favStore.test.js

import { normalizeType, getFavorites, isFavorite, toggleFavorite } from "../../js/favStore.js";

describe("getFavorites", () => {
    it("returns empty array when localStorage is empty", () => {
        expect(getFavorites()).toEqual([]);
    });

    it("returns parsed favorites from localStorage", () => {
        const favs = [{ id: "1", type: "people", name: "Luke" }];
        localStorage.setItem("favorites", JSON.stringify(favs));

        expect(getFavorites()).toEqual(favs);
    });
});

describe("toggleFavorite", () => {
    it("adds a favorite when it does not exist", () => {
        toggleFavorite({ id: "1", type: "people", name: "Luke" });

        const favs = getFavorites();
        expect(favs).toHaveLength(1);
        expect(favs[0].name).toBe("Luke");
    });

    it("removes a favorite when it already exists", () => {
        toggleFavorite({ id: "1", type: "people", name: "Luke" });
        toggleFavorite({ id: "1", type: "people", name: "Luke" });

        expect(getFavorites()).toHaveLength(0);
    });

    it("normalizes type before storing", () => {
        toggleFavorite({ id: "1", type: "  People  ", name: "Luke" });

        const favs = getFavorites();
        expect(favs[0].type).toBe("people");
    });

    it("converts id to string", () => {
        toggleFavorite({ id: 5, type: "planets", name: "Tatooine" });

        const favs = getFavorites();
        expect(favs[0].id).toBe("5");
    });

    it("can store multiple favorites of different types", () => {
        toggleFavorite({ id: "1", type: "people", name: "Luke" });
        toggleFavorite({ id: "1", type: "planets", name: "Tatooine" });

        expect(getFavorites()).toHaveLength(2);
    });

    it("only removes the exact match (same id + type)", () => {
        toggleFavorite({ id: "1", type: "people", name: "Luke" });
        toggleFavorite({ id: "1", type: "planets", name: "Tatooine" });

        toggleFavorite({ id: "1", type: "people", name: "Luke" });

        const favs = getFavorites();
        expect(favs).toHaveLength(1);
        expect(favs[0].type).toBe("planets");
    });
});

describe("isFavorite", () => {
    it("returns false when no favorites exist", () => {
        expect(isFavorite("1", "people")).toBe(false);
    });

    it("returns true after adding a favorite", () => {
        toggleFavorite({ id: "1", type: "people", name: "Luke" });

        expect(isFavorite("1", "people")).toBe(true);
    });

    it("returns false after removing a favorite", () => {
        toggleFavorite({ id: "1", type: "people", name: "Luke" });
        toggleFavorite({ id: "1", type: "people", name: "Luke" });

        expect(isFavorite("1", "people")).toBe(false);
    });

    it("handles numeric id input", () => {
        toggleFavorite({ id: "3", type: "starships", name: "X-Wing" });

        expect(isFavorite(3, "starships")).toBe(true);
    });

    it("normalizes type when checking", () => {
        toggleFavorite({ id: "1", type: "people", name: "Luke" });

        expect(isFavorite("1", "  People  ")).toBe(true);
    });
});

describe("normalizeType", () => {
    it("converts to lowercase", () => {
        expect(normalizeType("People")).toBe("people");
    });

    it("trims whitespace", () => {
        expect(normalizeType("  planets  ")).toBe("planets");
    });

    it("handles already normalized input", () => {
        expect(normalizeType("starships")).toBe("starships");
    });
});