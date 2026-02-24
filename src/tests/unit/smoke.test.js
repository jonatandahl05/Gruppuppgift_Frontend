// tests/unit/smoke.test.js
describe("Test setup", () => {
    it("has access to DOM via jsdom", () => {
        const div = document.createElement("div");
        div.textContent = "hello";
        document.body.appendChild(div);

        expect(document.body.textContent).toBe("hello");
    });

    it("has clean localStorage", () => {
        expect(localStorage.getItem("favorites")).toBeNull();
    });

    it("localStorage works", () => {
        localStorage.setItem("test", "value");
        expect(localStorage.getItem("test")).toBe("value");
    });
});