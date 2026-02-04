import "./style.css";
import "./featured.js";

// Inget mer behövs här.
// #app fylls av HTML direkt i index.html
import "./style.css";
import { renderNav, initNav } from "./nav.js";
import "./featured.js";

const app = document.querySelector("#app");

app.insertAdjacentHTML("afterbegin", renderNav());

document.addEventListener("DOMContentLoaded", () => {
    initNav();
});