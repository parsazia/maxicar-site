const CACHE_NAME = "maxicar-shell-v1";
const OFFLINE_URL = "/offline.html";
const STATIC_ASSETS = [OFFLINE_URL, "/maxicar-icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("maxicar-") && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedPage = await caches.match(request);
        return cachedPage || caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  if (url.pathname === "/maxicar-icon.svg" || url.pathname === OFFLINE_URL) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
  }
});
