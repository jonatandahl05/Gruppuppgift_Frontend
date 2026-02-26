import { defineConfig } from "vite";

export default defineConfig({
    root: ".",
    publicDir: "public",
    base: "/Gruppuppgift_Frontend/",
    build: {
        outDir: "dist",
    },
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "./src/tests/setup.js",
    },
});