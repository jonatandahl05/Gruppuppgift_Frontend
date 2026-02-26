// src/tests/unit/navData.test.js

import { menuData } from "../../js/navData.js";

describe("menuData", () => {
    it("has all expected categories", () => {
        const labels = menuData.map(item => item.label);
        expect(labels).toEqual(["Characters", "Planets", "Starships", "Movies", "Favourites"]);
    });

    it("every category has a label", () => {
        menuData.forEach(cat => {
            expect(cat.label).toBeTruthy();
        });
    });
});