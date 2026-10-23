/* DEWS service worker — keeps the app working with no signal.
 * Bump CACHE when any file changes so phones pick up the new version. */
var CACHE = 'dews-v2.0.1';
var FILES = ['./', './index.html', './content.js', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './v1/', './v1/index.html'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('dews-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* Cache first, then refresh in the background. Offline navigations fall back to the app. */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (cache) {
    return cache.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(function () { return null; });
      if (hit) { e.waitUntil(net); return hit; }
      return net.then(function (res) {
        if (res) return res;
        if (req.mode === 'navigate') return cache.match('./index.html');
        return new Response('', { status: 504 });
      });
    });
  }));
});
