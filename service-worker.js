// ╔══════════════════════════════════════════════════════════╗
// ║  VERSION CONFIG — UPDATE THIS WHEN RELEASING A CHANGE   ║
// ╠══════════════════════════════════════════════════════════╣
// ║  CACHE_NAME  →  bump whenever index.html changes         ║
// ║  Forces all users' browsers to pull the new version      ║
// ║  Match this to MIN_CODE_VERSION in index.html            ║
// ╚══════════════════════════════════════════════════════════╝
var CACHE_NAME  = "financials-v2.2.0";

// ── Everything below rarely needs changing ────────────────────
var REPO_PATH   = "/Personal-Finance-Tracker";
var APP_SHELL   = [
  REPO_PATH + "/",
  REPO_PATH + "/index.html"
];

// ── INSTALL ───────────────────────────────────────────────────
self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) { return cache.addAll(APP_SHELL); })
      .then(function() { return self.skipWaiting(); })
  );
});

// ── ACTIVATE: delete old caches ──────────────────────────────
self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k)    { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

// ── FETCH ─────────────────────────────────────────────────────
self.addEventListener("fetch", function(e) {
  var url = new URL(e.request.url);

  // ── Never intercept: Apps Script, Google APIs, CDN ───────
  if (url.hostname.indexOf("script.google.com")    > -1 ||
      url.hostname.indexOf("googleusercontent.com") > -1 ||
      url.hostname.indexOf("cdnjs.cloudflare.com")  > -1 ||
      url.hostname.indexOf("apis.google.com")        > -1) {
    return; // let browser handle it normally
  }

  // ── Only cache same-origin requests to this repo ─────────
  if (url.hostname !== self.location.hostname) {
    return;
  }

  // ── App shell (index.html and root path) ─────────────────
  var isAppShell = (
    url.pathname === REPO_PATH + "/" ||
    url.pathname === REPO_PATH + "/index.html" ||
    url.pathname === REPO_PATH
  );

  if (isAppShell) {
    // Cache-first: serve instantly from cache, update in background
    e.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(e.request).then(function(cached) {
          var networkFetch = fetch(e.request)
            .then(function(response) {
              if (response && response.status === 200) {
                cache.put(e.request, response.clone());
              }
              return response;
            })
            .catch(function() { return cached; });

          return cached || networkFetch;
        });
      })
    );
    return;
  }

  // ── service-worker.js and manifest.json ──────────────────
  // Network-first so updates are picked up immediately
  if (url.pathname.indexOf("service-worker.js") > -1 ||
      url.pathname.indexOf("manifest.json") > -1) {
    e.respondWith(
      fetch(e.request).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }

  // ── Everything else on same origin: network-first ────────
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request);
    })
  );
});

// ── MESSAGE ───────────────────────────────────────────────────
self.addEventListener("message", function(e) {
  if (e.data && e.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
