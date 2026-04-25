/**
 * SentiGuard Service Worker
 * Enables PWA features: offline support, caching, background sync
 */

const CACHE_NAME = "sentiguard-v3";
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/app.js?v=3",
  "/js/qr-scanner.js?v=3",
  "/assets/icon48.png",
  "/assets/icon96.png",
  "/assets/icon192.png",
  "/assets/icon512.png"
];

// Install event - cache files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching app files");
      return cache.addAll(URLS_TO_CACHE).catch((err) => {
        console.warn("[SW] Some files could not be cached:", err);
        // Continue even if some files fail to cache
        return cache.addAll(
          URLS_TO_CACHE.filter((url) => !url.includes("assets"))
        );
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // API calls: network first
  if (request.url.includes("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const cache_copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cache_copy);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached API response if offline
          return caches.match(request).then((cached) => {
            if (cached) {
              console.log("[SW] Serving cached API response");
              return cached;
            }
            // Return offline error response
            return new Response(
              JSON.stringify({
                error: "offline",
                message: "API unavailable. Check your connection.",
              }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" },
              }
            );
          });
        })
    );
    return;
  }

  // Static assets: cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request).then((response) => {
        if (response.status === 200) {
          const cache_copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cache_copy);
          });
        }
        return response;
      });
    })
  );
});

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
