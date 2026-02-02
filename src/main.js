import "./style.css";
import "./featured.js";

// Inget mer behövs här.
// #app fylls av HTML direkt i index.html
import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'


import { initNav } from "./nav.js";

document.addEventListener("DOMContentLoaded", () => {
    initNav();
});