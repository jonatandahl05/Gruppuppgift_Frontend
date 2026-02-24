// src/tests/dom/offlineBanner.test.js

import { initOfflineBanner } from "../../js/offlineBanner.js";

describe("offlineBanner", () => {
    beforeEach(() => {
        document.body.innerHTML = `
      <div id="offlineBanner" class="offline-banner" role="alert" hidden>
        Du är offline – viss data kanske inte är uppdaterad.
      </div>
    `;
    });

    it("banner is hidden when online", () => {

        initOfflineBanner();

        const banner = document.getElementById("offlineBanner");
        expect(banner.hidden).toBe(true);
    });

    it("banner shows when offline event fires", () => {
        initOfflineBanner();

        // Simulera att användaren tappar nätet
        Object.defineProperty(navigator, "onLine", {
            value: false,
            writable: true,
            configurable: true,
        });
        window.dispatchEvent(new Event("offline"));

        const banner = document.getElementById("offlineBanner");
        expect(banner.hidden).toBe(false);
    });

    it("banner hides again when back online", () => {
        initOfflineBanner();

        Object.defineProperty(navigator, "onLine", {
            value: false,
            writable: true,
            configurable: true,
        });
        window.dispatchEvent(new Event("offline"));

        Object.defineProperty(navigator, "onLine", {
            value: true,
            writable: true,
            configurable: true,
        });
        window.dispatchEvent(new Event("online"));

        const banner = document.getElementById("offlineBanner");
        expect(banner.hidden).toBe(true);
    });

    it("banner has role=alert for accessibility", () => {
        const banner = document.getElementById("offlineBanner");
        expect(banner.getAttribute("role")).toBe("alert");
    });

    it("does nothing if banner element is missing", () => {
        document.body.innerHTML = "";

        expect(() => initOfflineBanner()).not.toThrow();
    });
});