// src/tests/dom/accessibility.test.js

import axe from "axe-core";

describe("Accessibility (axe-core)", () => {

    it("main page has no critical violations", async () => {
        document.body.innerHTML = `
      <header class="header">
        <nav class="container nav">
          <a href="./index.html" class="logo">SW</a>
          <button class="nav-toggle" aria-label="Öppna meny" aria-expanded="false">
            <span class="hamburger"></span>
          </button>
          <ul class="nav-links">
            <li><a href="#">Characters</a></li>
            <li><a href="#">Planets</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <section id="featured" aria-labelledby="featured-title">
          <h2 id="featured-title">Featured</h2>
          <div class="featured-list">
            <div class="featured-card">
              <img src="test.jpg" alt="Luke Skywalker">
              <h3>Luke Skywalker</h3>
              <div class="card-actions">
                <button class="view-btn">View more</button>
                <button class="fav-btn" aria-label="Add to favorites">☆</button>
              </div>
            </div>
          </div>
        </section>

        <div id="offlineBanner" class="offline-banner" role="alert" aria-live="polite" hidden>
          Du är offline – viss data kanske inte är uppdaterad.
        </div>
      </main>
    `;

        const results = await axe.run(document.body);

        if (results.violations.length > 0) {
            console.log("\n=== AXE VIOLATIONS ===");
            results.violations.forEach(v => {
                console.log(`\n[${v.impact}] ${v.id}`);
                console.log(`  ${v.description}`);
                console.log(`  Nodes: ${v.nodes.length}`);
            });
        }

        const critical = results.violations.filter(
            v => v.impact === "critical" || v.impact === "serious"
        );

        expect(critical).toEqual([]);
    });

    it("detail page has no critical violations", async () => {
        document.body.innerHTML = `
      <main>
        <button id="back-btn" class="back-btn" type="button">← Back</button>
        <div class="detail-container">
          <img src="test.jpg" alt="Luke Skywalker">
          <h1>Luke Skywalker</h1>
          <button id="fav-detail-btn" class="fav-btn" aria-label="Add to favorites">
            ☆ Add Favorite
          </button>
          <div class="detail-info">
            <div><span class="label">Height:</span> 172</div>
            <div><span class="label">Mass:</span> 77</div>
          </div>
        </div>
      </main>
    `;

        const results = await axe.run(document.body);

        if (results.violations.length > 0) {
            console.log("\n=== AXE VIOLATIONS (detail) ===");
            results.violations.forEach(v => {
                console.log(`[${v.impact}] ${v.id}: ${v.description}`);
            });
        }

        const critical = results.violations.filter(
            v => v.impact === "critical" || v.impact === "serious"
        );

        expect(critical).toEqual([]);
    });

    it("favorites page has no critical violations", async () => {
        document.body.innerHTML = `
      <main>
        <section id="favorites">
          <h2>Your Favorites</h2>
          <div id="favorites-container">
            <h2>People</h2>
            <div class="favorites-list">
              <div class="featured-card">
                <img src="test.jpg" alt="Luke Skywalker">
                <h3>Luke Skywalker</h3>
                <div class="card-actions">
                  <button class="view-btn">View more</button>
                  <button class="fav-btn" aria-label="Remove from favorites">★</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    `;

        const results = await axe.run(document.body);

        if (results.violations.length > 0) {
            console.log("\n=== AXE VIOLATIONS (favorites) ===");
            results.violations.forEach(v => {
                console.log(`[${v.impact}] ${v.id}: ${v.description}`);
            });
        }

        const critical = results.violations.filter(
            v => v.impact === "critical" || v.impact === "serious"
        );

        expect(critical).toEqual([]);
    });

    it("reports total passes", async () => {
        document.body.innerHTML = `
      <main>
        <h1>Galactic Dex</h1>
        <p>Browse Star Wars characters</p>
      </main>
    `;

        const results = await axe.run(document.body);

        console.log(`\nAxe passes: ${results.passes.length}`);
        console.log(`Axe violations: ${results.violations.length}`);

        expect(results.passes.length).toBeGreaterThan(0);
    });
});