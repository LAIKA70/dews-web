/* DEWS service worker — keeps the app working with no internet connection.
 * App files: network first (so updates show at once), cache when offline.
 * Map tiles: cache first, so places you've viewed work offline. */
var CACHE = 'dews-v2.5.0';
var TILES = 'dews-tiles';
var TILE_MAX = 600;
var FILES = ['./', './index.html', './app.css', './app.js', './content.js', './nav.js', './mobile/', './mobile/index.html', './desktop/', './desktop/index.html', './tablet/', './tablet/index.html', './data/places-sydney.json',
  './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png',
  './lib/maplibre-gl.js', './lib/maplibre-gl.css', './v1/', './v1/index.html'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('dews-v') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
function timeout(ms) { return new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, ms); }); }
function trim(cache) {
  cache.keys().then(function (keys) { if (keys.length > TILE_MAX) for (var i = 0; i < keys.length - TILE_MAX; i++) cache.delete(keys[i]); });
}
self.addEventListener('fetch', function (e) {
  var req = e.request; if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.hostname === 'tiles.openfreemap.org') {
    e.respondWith(caches.open(TILES).then(function (cache) {
      return cache.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (res) { if (res && res.ok) { cache.put(req, res.clone()); trim(cache); } return res; });
      });
    }));
    return;
  }
  if (url.origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (cache) {
    var net = fetch(req).then(function (res) { if (res && res.ok) cache.put(req, res.clone()); return res; });
    return Promise.race([net, timeout(4000)]).catch(function () {
      return cache.match(req, { ignoreSearch: true }).then(function (hit) {
        if (hit) return hit;
        if (req.mode === 'navigate') return cache.match(url.pathname.indexOf('/desktop/') >= 0 ? './desktop/index.html' : url.pathname.indexOf('/tablet/') >= 0 ? './tablet/index.html' : url.pathname.indexOf('/mobile/') >= 0 ? './mobile/index.html' : './index.html');
        return net;
      });
    });
  }));
});
