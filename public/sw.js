const CACHE = "sijac-shell-v1";
const FALLBACK = "/sin-conexion.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(["/", FALLBACK, "/icon-192.png", "/icon-512.png", "/favicon.png", "/sijac-logo.png", "/sijac-icon-192.png", "/hero-aguadas-mobile.webp"]),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      return cached || caches.match(FALLBACK);
    }),
  );
});
