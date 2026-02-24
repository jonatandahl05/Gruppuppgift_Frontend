// src/tests/api/detail.test.js

import { renderDetail } from "../../js/detail.js";

describe("renderDetail", () => {
    beforeEach(() => {
        document.body.innerHTML = `
      <div id="detail-container" class="detail-container"></div>
    `;

        vi.stubGlobal("fetch", vi.fn(() => {
            return Promise.resolve({
                ok: true,
                json: async () => ({
                    name: "Luke Skywalker",
                    height: "172",
                    mass: "77",
                    hair_color: "blond",
                    birth_year: "19BBY",
                    url: "https://swapi.py4e.com/api/people/1/",
                }),
            });
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("fetches data for the correct type and id", async () => {
        await renderDetail("people", "1");

        expect(fetch).toHaveBeenCalledWith(
            "https://swapi.py4e.com/api/people/1/"
        );
    });

    it("renders the character name as h1", async () => {
        await renderDetail("people", "1");

        const h1 = document.querySelector("h1");
        expect(h1.textContent).toBe("Luke Skywalker");
    });

    it("renders detail info fields", async () => {
        await renderDetail("people", "1");

        const info = document.querySelector(".detail-info");
        expect(info.innerHTML).toContain("172");
        expect(info.innerHTML).toContain("blond");
    });

    it("renders a favorite button", async () => {
        await renderDetail("people", "1");

        const favBtn = document.getElementById("fav-detail-btn");
        expect(favBtn).not.toBeNull();
        expect(favBtn.textContent).toContain("☆");
    });

    it("favorite button toggles on click", async () => {
        await renderDetail("people", "1");

        const favBtn = document.getElementById("fav-detail-btn");
        favBtn.click();

        expect(favBtn.textContent).toContain("★");
    });

    it("renders an image", async () => {
        await renderDetail("people", "1");

        const img = document.querySelector("img");
        expect(img).not.toBeNull();
        expect(img.src).toContain("/characters/1.jpg");
    });
});