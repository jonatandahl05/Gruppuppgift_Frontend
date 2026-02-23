// src/tests/unit/navData.test.js

import { menuData } from "../../js/navData.js";

describe("menuData", () => {
    it("has all four categories", () => {
        const keys = menuData.map(item => item.key);
        expect(keys).toEqual(["people", "planets", "starships", "films"]);
    });

    it("every category has a label", () => {
        menuData.forEach(cat => {
            expect(cat.label).toBeTruthy();
        });
    });

    it("every category has at least one subItem", () => {
        menuData.forEach(cat => {
            expect(cat.subItems.length).toBeGreaterThan(0);
        });
    });

    it("every subItem has action and label", () => {
        menuData.forEach(cat => {
            cat.subItems.forEach(sub => {
                expect(sub.action).toBeTruthy();
                expect(sub.label).toBeTruthy();
            });
        });
    });

    it("people has favorites subItem", () => {
        const people = menuData.find(cat => cat.key === "people");
        const favItem = people.subItems.find(sub => sub.action === "favorites");
        expect(favItem).toBeDefined();
    });

    it("filter subItems have a filter value", () => {
        const people = menuData.find(cat => cat.key === "people");
        const filters = people.subItems.filter(sub => sub.action === "filter");

        filters.forEach(f => {
            expect(f.filter).toBeTruthy();
        });
    });
});