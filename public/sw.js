const CACHE_VERSION = "20260722-v2";
const STATIC_CACHE = `anar-static-${CACHE_VERSION}`;
const OFFLINE_FALLBACK_URL = "/offline.html";

const PRECACHE_ASSETS = [
  OFFLINE_FALLBACK_URL,
  "/brand/anar-icon.png",
  "/brand/anar-logo.png",
  "/icons/pwa/apple-touch-icon.png",
  "/icons/pwa/icon-192.png",
  "/icons/pwa/icon-512.png",
  "/icons/pwa/maskable-192.png",
  "/icons/pwa/maskable-512.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch(() => undefined),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== STATIC_CACHE)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (isDocumentNavigation(request)) {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (shouldBypassCache(request, url)) {
    return;
  }

  if (isSafeStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

function shouldBypassCache(request, url) {
  const { pathname } = url;

  return (
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/today") ||
    pathname.startsWith("/foods") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/_next/image") ||
    pathname.startsWith("/api/")
  );
}

function isSafeStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/brand/") ||
    url.pathname.startsWith("/icons/pwa/") ||
    url.pathname === OFFLINE_FALLBACK_URL
  );
}

function isDocumentNavigation(request) {
  return (
    request.mode === "navigate" ||
    request.destination === "document" ||
    request.headers.get("accept")?.includes("text/html")
  );
}

async function networkFirstNavigation(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(STATIC_CACHE);
    const fallback = await cache.match(OFFLINE_FALLBACK_URL);

    return fallback || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  const networkResponse = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }

      return response;
    })
    .catch(() => cachedResponse);

  return cachedResponse || networkResponse;
}
