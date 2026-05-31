// Service worker for the wedding invite — caches everything needed so the
// page works fully offline after the first visit, with no quality loss.
// Strategy:
//   * Navigation/HTML  → network-first, falls back to cached "/"
//   * Same-origin assets (JS/CSS/images/fonts/audio) → stale-while-revalidate
//   * Cross-origin GETs → cache-on-success, fallback to cache
const CACHE = "wedding-invite-v5";

const PRECACHE_PATHS = [
  "/",
  "/manifest.webmanifest",
  "/api/sfx?name=bell",
  "/api/sfx?name=conch",
  "/api/sfx?name=whoosh",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.all(
        PRECACHE_PATHS.map((p) =>
          fetch(p, { cache: "reload" })
            .then((r) => (r && r.ok ? c.put(p, r.clone()) : null))
            .catch(() => null),
        ),
      ),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const isAssetPath = (pathname) =>
  pathname.startsWith("/api/sfx") ||
  pathname.startsWith("/_build/") ||
  pathname.startsWith("/assets/") ||
  /\.(?:png|jpg|jpeg|webp|gif|svg|ico|woff2?|ttf|otf|css|js|mjs|mp3|ogg|wav|json)$/i.test(pathname);

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch { return; }

  // HTML navigations: network-first with offline fallback to cached root.
  // Bypass Service Worker entirely for database files so they are always fresh
  // and do not bloat the cache with ?t= timestamps.
  if (url.pathname.includes("/api/media/db/")) {
    return;
  }

  const isNavigation =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  if (isNavigation) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.ok) cache.put("/", fresh.clone());
          return fresh;
        } catch {
          return (await cache.match(req)) || (await cache.match("/"));
        }
      })(),
    );
    return;
  }

  // Same-origin asset: stale-while-revalidate.
  if (url.origin === self.location.origin && isAssetPath(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })(),
    );
    return;
  }

  // Cross-origin GET: cache opportunistically.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
        return res;
      } catch {
        return cached || Response.error();
      }
    })(),
  );
});
