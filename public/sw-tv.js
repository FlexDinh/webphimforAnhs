// RoPhim TV Service Worker - Enhanced for Smart TV PWA
const CACHE_NAME = "rophim-tv-v1";
const API_CACHE = "rophim-tv-api-v1";
const IMG_CACHE = "rophim-tv-img-v1";

// Core TV assets to pre-cache
const STATIC_ASSETS = [
  "/tv",
  "/manifest-tv.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// API domains to cache
const API_HOSTS = ["phimapi.com", "ophim1.com", "phim.nguonc.com"];
const IMG_HOSTS = ["img.ophim.live", "phimimg.com", "image.tmdb.org"];

// Install: pre-cache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // If some assets fail, continue anyway
        return Promise.allSettled(
          STATIC_ASSETS.map((url) =>
            cache.add(url).catch(() => console.warn("Failed to cache:", url))
          )
        );
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  const currentCaches = [CACHE_NAME, API_CACHE, IMG_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !currentCaches.includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: smart caching strategy
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Strategy 1: API requests — Network first, cache fallback (5 min TTL)
  if (API_HOSTS.some((host) => url.hostname.includes(host))) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Strategy 2: Images — Cache first, network fallback (long TTL)
  if (IMG_HOSTS.some((host) => url.hostname.includes(host))) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(IMG_CACHE).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Strategy 3: Same-origin — Stale while revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clone);
              });
            }
            return response;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }
});

// Listen for messages from the app
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }

  // Clear API cache on demand
  if (event.data === "clearApiCache") {
    caches.delete(API_CACHE);
  }
});
