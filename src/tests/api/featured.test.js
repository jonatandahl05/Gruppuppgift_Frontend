// src/tests/api/featured.test.js

import { loadFeatured, loadAll, getImage } from "../../js/featured.js";

describe("getImage", () => {
    it("returns correct URL for people", () => {
        const url = getImage("people", "1");
        expect(url).toContain("/characters/1.jpg");
    });

    it("returns correct URL for planets", () => {
        const url = getImage("planets", "3");
        expect(url).toContain("/planets/3.jpg");
    });

    it("returns correct URL for starships", () => {
        const url = getImage("starships", "9");
        expect(url).toContain("/starships/9.jpg");
    });

    it("returns correct URL for films", () => {
        const url = getImage("films", "2");
        expect(url).toContain("/films/2.jpg");
    });

    it("returns undefined for unknown type", () => {
        const url = getImage("droids", "1");
        expect(url).toBeUndefined();
    });
});

describe("loadFeatured", () => {
    beforeEach(() => {
        document.body.innerHTML = `
      <section id="featured" data-type="people">
        <h2>Featured</h2>
        <button class="left-btn"></button>
        <button class="right-btn"></button>
        <div class="featured-list"></div>
      </section>
    `;

        vi.stubGlobal("fetch", vi.fn((url) => {

            const match = url.match(/\/(\d+)\/$/);
            const id = match ? match[1] : "0";

            return Promise.resolve({
                ok: true,
                json: async () => ({
                    name: `Character ${id}`,
                    url: `https://swapi.py4e.com/api/people/${id}/`,
                }),
            });
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("calls fetch for each featured character", async () => {
        await loadFeatured();

        expect(fetch).toHaveBeenCalledTimes(5);
    });

    it("renders cards into the featured-list", async () => {
        await loadFeatured();

        const cards = document.querySelectorAll(".featured-card");
        expect(cards.length).toBe(5);
    });

    it("each card has a name", async () => {
        await loadFeatured();

        const names = document.querySelectorAll(".featured-card h3");
        names.forEach(name => {
            expect(name.textContent).toBeTruthy();
        });
    });

    it("each card has a view button and fav button", async () => {
        await loadFeatured();

        const cards = document.querySelectorAll(".featured-card");
        cards.forEach(card => {
            expect(card.querySelector(".view-btn")).not.toBeNull();
            expect(card.querySelector(".fav-btn")).not.toBeNull();
        });
    });

    it("fav button shows ☆ when not favorited", async () => {
        await loadFeatured();

        const favBtns = document.querySelectorAll(".fav-btn");
        favBtns.forEach(btn => {
            expect(btn.textContent).toBe("☆");
        });
    });
});

describe("loadAll", () => {
    beforeEach(() => {
        document.body.innerHTML = `
      <section id="featured" data-type="people">
        <div class="featured-list"></div>
      </section>
    `;

        vi.stubGlobal("fetch", vi.fn(() => {
            return Promise.resolve({
                ok: true,
                json: async () => ({
                    results: [
                        { name: "Luke", url: "https://swapi.py4e.com/api/people/1/" },
                        { name: "Leia", url: "https://swapi.py4e.com/api/people/5/" },
                    ],
                    next: null,
                }),
            });
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders a card for each result", async () => {
        await loadAll("people");

        const cards = document.querySelectorAll(".featured-card");
        expect(cards.length).toBe(2);
    });

    it("shows character names", async () => {
        await loadAll("people");

        const names = [...document.querySelectorAll(".featured-card h3")]
            .map(h3 => h3.textContent);

        expect(names).toContain("Luke");
        expect(names).toContain("Leia");
    });

    it("shows loading text before data arrives", async () => {

        let resolveFetch;
        vi.stubGlobal("fetch", vi.fn(() => new Promise(resolve => {
            resolveFetch = resolve;
        })));

        const promise = loadAll("people");

        const container = document.querySelector(".featured-list");
        expect(container.innerHTML).toContain("Loading...");

        resolveFetch({
            ok: true,
            json: async () => ({ results: [], next: null }),
        });

        await promise;
    });
});

describe("loadAll error handling", () => {
    beforeEach(() => {
        document.body.innerHTML = `
      <section id="featured" data-type="people">
        <div class="featured-list"></div>
      </section>
    `;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("shows error message when fetch fails", async () => {
        vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("Network error"))));

        await loadAll("people");

        const container = document.querySelector(".featured-list");
        expect(container.innerHTML).toContain("Could not load data");
    });
});