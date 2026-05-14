const CACHE_NAME = "iclose-v1";
const OFFLINE_URL = "/offline";

// Minimal precache — just the shell
const PRECACHE_URLS = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  // Only handle navigation requests — let Next.js handle everything else
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(() => {
      // Offline fallback: serve cached root or a basic response
      return caches.match("/").then(
        (cached) =>
          cached ??
          new Response("You are offline. Please check your connection.", {
            headers: { "Content-Type": "text/plain" },
          }),
      );
    }),
  );
});
