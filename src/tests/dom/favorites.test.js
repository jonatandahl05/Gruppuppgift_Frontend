// src/tests/dom/favorites.test.js

import { renderFavorites } from "../../js/favorites.js";
import { toggleFavorite } from "../../js/favStore.js";

describe("renderFavorites", () => {
    beforeEach(() => {
        document.body.innerHTML = `
      <div id="favorites-container"></div>
    `;
    });

    it("shows message when no favorites exist", () => {
        renderFavorites();

        const container = document.getElementById("favorites-container");
        expect(container.textContent).toContain("No favorites saved yet");
    });

    it("renders favorite cards when favorites exist", () => {
        toggleFavorite({ id: "1", type: "people", name: "Luke" });
        toggleFavorite({ id: "3", type: "planets", name: "Yavin IV" });

        renderFavorites();

        const cards = document.querySelectorAll(".featured-card");
        expect(cards.length).toBe(2);
    });

    it("groups favorites by type with headings", () => {
        toggleFavorite({ id: "1", type: "people", name: "Luke" });
        toggleFavorite({ id: "3", type: "planets", name: "Yavin IV" });

        renderFavorites();

        const headings = [...document.querySelectorAll("h2")]
            .map(h => h.textContent.toLowerCase());

        expect(headings).toContain("people");
        expect(headings).toContain("planets");
    });

    it("each card shows the character name", () => {
        toggleFavorite({ id: "1", type: "people", name: "Luke" });

        renderFavorites();

        const name = document.querySelector(".featured-card h3");
        expect(name.textContent).toBe("Luke");
    });

    it("each card has view and fav buttons", () => {
        toggleFavorite({ id: "1", type: "people", name: "Luke" });

        renderFavorites();

        const card = document.querySelector(".featured-card");
        expect(card.querySelector(".view-btn")).not.toBeNull();
        expect(card.querySelector(".fav-btn")).not.toBeNull();
    });

    it("removing a favorite re-renders the list", () => {
        toggleFavorite({ id: "1", type: "people", name: "Luke" });
        toggleFavorite({ id: "5", type: "people", name: "Leia" });

        renderFavorites();

        const favBtn = document.querySelector(".fav-btn");
        favBtn.click();

        const cards = document.querySelectorAll(".featured-card");
        expect(cards.length).toBe(1);
    });
});