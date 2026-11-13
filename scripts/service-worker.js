/**
 * The service worker, served at /sw.js. This file is a template:
 * scripts/prerender.js fills in the three constants below and writes the result
 * into dist/sw.js — the hashed asset names only exist once Vite has built them.
 *
 * What it is for: the installed app opens even with no network, and a visit on
 * a bad connection doesn't wait on files that never change. It is not a way to
 * play offline — every game is a website of its own.
 *
 * - Pages: network first, so a deploy shows up on the next visit; a copy of
 *   each page visited is kept for when the network is gone. A page never
 *   visited falls back to its language's landing page (precached), by a
 *   redirect, so the URL and the markup always agree and hydration holds.
 * - Our own files (hashed assets, icons): cache first, they never change
 *   under the same name.
 * - Google Fonts: the stylesheet is refreshed in the background, the font
 *   files are kept. The games' favicons (www.google.com) are left to the
 *   browser's HTTP cache.
 *
 * VERSION changes with any precached file, so a deploy installs a new worker,
 * which takes over at once and drops the old caches.
 */

const VERSION = "__VERSION__";
/** Files to cache at install: assets, icons, the landing pages. */
const PRECACHE = /*__PRECACHE__*/ [];
/** The landing page of each language, e.g. "/", "/fr/", "/es/". */
const LANDINGS = /*__LANDINGS__*/ ["/"];

const CACHE = `what-we-play-${VERSION}`;
const FONTS_CACHE = "what-we-play-fonts";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE && key !== FONTS_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (request.mode === "navigate") {
      event.respondWith(page(request, url));
    } else {
      event.respondWith(cacheFirst(request, CACHE));
    }
  } else if (url.hostname === "fonts.gstatic.com") {
    event.respondWith(cacheFirst(request, FONTS_CACHE));
  } else if (url.hostname === "fonts.googleapis.com") {
    event.respondWith(staleWhileRevalidate(request, FONTS_CACHE));
  }
});

async function page(request, url) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(url.pathname, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(url.pathname);
    if (cached) return cached;
    // The longest landing that prefixes the path is its language's.
    const landing = LANDINGS.filter((path) => url.pathname.startsWith(path)).sort(
      (a, b) => b.length - a.length
    )[0];
    if (landing && landing !== url.pathname) {
      return Response.redirect(new URL(landing, url).href, 302);
    }
    throw error;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      // The stylesheet is fetched without CORS, so its response is opaque
      // (status 0): keep it anyway, it is the only way to have it offline.
      if (response.ok || response.type === "opaque") cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached ?? network;
}
