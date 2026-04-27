// ============================================================
//  Financials — Service Worker
//  Cache version: bump this string whenever index.html changes
//  to force all clients to pick up the new version.
// ============================================================

var CACHE_NAME = "financials-v2.1.0";
var APP_SHELL  = [
  "./",
  "./index.html"
];

// ── INSTALL: cache the app shell ─────────────────────────────
self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(APP_SHELL);
    }).then(function() {
      // Take over immediately without waiting for old SW to die
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE: delete old caches ──────────────────────────────
self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key)   { return caches.delete(key); })
      );
    }).then(function() {
      // Take control of all open tabs immediately
      return self.clients.claim();
    })
  );
});

// ── FETCH: serve from cache, fall back to network ────────────
self.addEventListener("fetch", function(e) {
  var url = new URL(e.request.url);

  // Never intercept calls to Apps Script (those must go to network)
  if (url.hostname.indexOf("script.google.com") > -1 ||
      url.hostname.indexOf("googleusercontent.com") > -1) {
    return;
  }

  // For the app shell: cache-first strategy
  // Serve from cache instantly, check network in background for updates
  if (url.pathname === "/" ||
      url.pathname.indexOf("index.html") > -1 ||
      url.pathname.indexOf("/Personal-Finance-Tracker") > -1) {
    e.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(e.request).then(function(cached) {
          var networkFetch = fetch(e.request).then(function(response) {
            // Update cache with latest version in background
            if (response && response.status === 200) {
              cache.put(e.request, response.clone());
            }
            return response;
          }).catch(function() { return cached; });

          // Return cached immediately if available, else wait for network
          return cached || networkFetch;
        });
      })
    );
    return;
  }

  // For everything else: network-first, fall back to cache
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request);
    })
  );
});

// ── MESSAGE: allow app to trigger SW update check ────────────
self.addEventListener("message", function(e) {
  if (e.data && e.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
