const VERSION = "v1";
const APP_CACHE = `app-shell-${VERSION}`;
const API_CACHE = `api-${VERSION}`;

// Vi cachar "shell" via runtime (när de requestas) + kan pre-cacha alla våra html + manifest + ikon.
const PRECACHE_URLS = [
  "/Gruppuppgift_Frontend/",
  "/Gruppuppgift_Frontend/index.html",
  "/Gruppuppgift_Frontend/manifest.json",
  "/Gruppuppgift_Frontend/star-wars-192.png",
  "/Gruppuppgift_Frontend/star-wars-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== APP_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

    // Bara GET
    if (req.method !== "GET") return;

    // Ignorera querystring vid offline
    if (req.mode === "navigate") {
    event.respondWith((async () => {
        try {
        // Online: hämta normalt (färsk html)
        return await fetch(req);
        } catch {
        // Offline: servera cachad sida baserat på pathname (utan query)
        const cache = await caches.open(APP_CACHE);

        // Ex: /detail.html?type=... -> pathname = /detail.html
        const pathname = url.pathname;

        // Försök matcha både "/detail.html" och "./detail.html"
        const cached =
            (await cache.match(pathname)) ||
            (await cache.match("." + pathname)) ||
            (await cache.match("./" + pathname.replace(/^\//, "")));

        return cached || (await cache.match("./index.html"));
        }
    })());
    return;
    }

  // 1) API: Network-first, cache fallback
  const isSwapi =
    url.hostname.includes("swapi.py4e.com") || url.hostname.includes("swapi.dev");

  if (isSwapi) {
    event.respondWith(networkFirst(req, API_CACHE));
    return;
  }

  // 2) App shell + statiska assets: Cache-first
  // Gäller: våra html-sidor, Vite assets (/assets/*), bilder i public, css/js byggda etc.
  event.respondWith(cacheFirst(req, APP_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const fresh = await fetch(request);

  // Bara cacha "bra" svar
  if (fresh && fresh.ok) cache.put(request, fresh.clone());
  return fresh;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}
