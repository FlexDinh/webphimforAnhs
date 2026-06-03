// RoPhim Service Worker v3 - Offline + Image CDN Cache Strategy
const CACHE_NAME = "rophim-v3";
const IMAGE_CACHE_NAME = "rophim-images-v3";
const IMAGE_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 ngày

// Domains ảnh CDN ngoài cần cache
const IMAGE_CDN_ORIGINS = [
  "img.ophim.live",
  "phimimg.com",
  "phim.nguonc.com",
  "image.tmdb.org",
  "ophim1.com",
];

const STATIC_ASSETS = ["/phimhay", "/manifest.json", "/favicon.ico"];

// Kiểm tra URL có phải ảnh CDN ngoài không
function isExternalImage(url) {
  try {
    const parsed = new URL(url);
    return IMAGE_CDN_ORIGINS.some((host) => parsed.hostname.endsWith(host));
  } catch {
    return false;
  }
}

// Kiểm tra ảnh CDN đã hết hạn chưa
function isCacheExpired(response) {
  if (!response) return true;
  const dateHeader = response.headers.get("sw-cached-at");
  if (!dateHeader) return false; // không có metadata → coi như còn dùng được
  const cachedAt = parseInt(dateHeader, 10);
  const ageSeconds = (Date.now() - cachedAt) / 1000;
  return ageSeconds > IMAGE_CACHE_TTL_SECONDS;
}

// ──────────────────────────────────────────────
// Install: pre-cache static pages
// ──────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ──────────────────────────────────────────────
// Activate: xóa cache cũ
// ──────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== IMAGE_CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ──────────────────────────────────────────────
// Fetch: chiến lược riêng cho ảnh CDN vs page thường
// ──────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = event.request.url;

  // Chiến lược Cache-First cho ảnh CDN ngoài
  if (isExternalImage(url)) {
    event.respondWith(cacheFirstForImage(event.request));
    return;
  }

  // Chỉ xử lý same-origin cho các route thường
  const parsed = new URL(url);
  if (parsed.origin !== self.location.origin) return;

  // Bỏ qua API calls và HMR
  if (
    parsed.pathname.startsWith("/api/") ||
    parsed.pathname.startsWith("/_next/webpack-hmr")
  ) {
    return;
  }

  // Network-first cho ảnh đã optimize (/_next/image) - để tận dụng CDN Vercel
  if (parsed.pathname.startsWith("/_next/image")) {
    event.respondWith(networkFirstWithCache(event.request, CACHE_NAME));
    return;
  }

  // Stale-while-revalidate cho static assets
  if (parsed.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(event.request, CACHE_NAME));
    return;
  }

  // Network-first cho page thường, fallback về cache nếu offline
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Cache-First cho ảnh CDN ngoài với TTL 7 ngày
async function cacheFirstForImage(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const cached = await cache.match(request);

  if (cached && !isCacheExpired(cached)) {
    return cached;
  }

  try {
    const response = await fetch(request, { mode: "cors" });
    if (response.ok) {
      // Clone và thêm header timestamp để track TTL
      const headers = new Headers(response.headers);
      headers.set("sw-cached-at", String(Date.now()));
      const cachedResponse = new Response(await response.clone().arrayBuffer(), {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
      cache.put(request, cachedResponse);
    }
    return response;
  } catch {
    // Offline → trả về ảnh cũ kể cả đã hết hạn
    if (cached) return cached;
    return new Response("", { status: 503 });
  }
}

// Cache-First cho static assets
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// Network-First với fallback cache
async function networkFirstWithCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw new Error("Network error and no cache available");
  }
}

// ──────────────────────────────────────────────
// Message API — cho phép CEO page gọi clear cache
// ──────────────────────────────────────────────
self.addEventListener("message", async (event) => {
  if (event.data?.type === "CLEAR_IMAGE_CACHE") {
    await caches.delete(IMAGE_CACHE_NAME);
    const newCache = await caches.open(IMAGE_CACHE_NAME);
    event.ports[0]?.postMessage({ success: true, cleared: IMAGE_CACHE_NAME });
    return;
  }

  if (event.data?.type === "CLEAR_ALL_CACHE") {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    event.ports[0]?.postMessage({ success: true, cleared: keys });
    return;
  }

  if (event.data?.type === "GET_CACHE_STATS") {
    try {
      const imageCache = await caches.open(IMAGE_CACHE_NAME);
      const pageCache = await caches.open(CACHE_NAME);
      const imageKeys = await imageCache.keys();
      const pageKeys = await pageCache.keys();
      event.ports[0]?.postMessage({
        success: true,
        imageCount: imageKeys.length,
        pageCount: pageKeys.length,
        cacheName: CACHE_NAME,
        imageCacheName: IMAGE_CACHE_NAME,
      });
    } catch {
      event.ports[0]?.postMessage({ success: false });
    }
    return;
  }
});
