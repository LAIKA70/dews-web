/* DEWS — live location, compass, nearby safe places, walking guidance and the map.
 * Works in layers: real map + OpenStreetMap places + walking route when online;
 * cached places + straight-line arrow when offline; sample places if nothing else.
 */
var NAV = (function () {
  'use strict';
  var st = {
    pos: null, acc: null, heading: null,
    loc: 'off',        /* off | asking | on | denied | unavailable */
    compass: 'off',    /* off | on | needs-tap | unavailable */
    places: [], src: null, loadedAt: null, loadedFrom: null,
    targetId: null, route: null, routeFor: null,
    follow: false
  };
  var subs = [], liveSubs = [];
  var CACHE_KEY = 'dews-places';
  var SAFE = { assembly: 1, rescue: 2, hospital: 3, shelter: 1 };

  function emit() { subs.forEach(function (f) { try { f(); } catch (e) {} }); }
  function emitLive() { liveSubs.forEach(function (f) { try { f(); } catch (e) {} }); }

  /* ---------- geometry ---------- */
  var R = 6371000, rad = Math.PI / 180;
  function dist(a, b) {
    var dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function bearing(a, b) {
    var y = Math.sin((b.lng - a.lng) * rad) * Math.cos(b.lat * rad);
    var x = Math.cos(a.lat * rad) * Math.sin(b.lat * rad) - Math.sin(a.lat * rad) * Math.cos(b.lat * rad) * Math.cos((b.lng - a.lng) * rad);
    return (Math.atan2(y, x) / rad + 360) % 360;
  }
  function offset(p, dx, dy) { /* dx east metres, dy south metres */
    return { lat: p.lat - dy / 111320, lng: p.lng + dx / (111320 * Math.cos(p.lat * rad)) };
  }

  /* ---------- location ---------- */
  var watchId = null;
  function startLocation() {
    if (!navigator.geolocation) { st.loc = 'unavailable'; emit(); return; }
    if (watchId != null) return;
    st.loc = 'asking'; emit();
    watchId = navigator.geolocation.watchPosition(function (p) {
      var np = { lat: p.coords.latitude, lng: p.coords.longitude }, first = !st.pos;
      var moved = st.pos ? dist(st.pos, np) : 0;
      st.pos = np; st.acc = p.coords.accuracy; st.loc = 'on';
      try { localStorage.setItem('dews-nav-ok', '1'); } catch (e) {}
      if (first || !st.loadedFrom || dist(st.loadedFrom, np) > 1200) loadPlaces();
      else if (moved > 25) { maybeRoute(); emit(); }
      else emitLive();
    }, function (err) {
      st.loc = err && err.code === 1 ? 'denied' : 'unavailable';
      watchId = null;
      if (!st.places.length) useSamples();
      emit();
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
  }

  /* ---------- compass ---------- */
  var hx = null, hy = null, lastLive = 0, gotEvent = false;
  function screenAngle() {
    try { if (screen.orientation && typeof screen.orientation.angle === 'number') return screen.orientation.angle; } catch (e) {}
    return typeof window.orientation === 'number' ? window.orientation : 0;
  }
  function onOrient(e) {
    var h = null;
    if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) h = e.webkitCompassHeading;
    else if ((e.absolute || e.type === 'deviceorientationabsolute') && e.alpha != null) h = 360 - e.alpha;
    if (h == null) return;
    gotEvent = true;
    h = (h + screenAngle() + 360) % 360;
    var c = Math.cos(h * rad), s = Math.sin(h * rad);
    if (hx == null) { hx = c; hy = s; } else { hx = hx * 0.75 + c * 0.25; hy = hy * 0.75 + s * 0.25; }
    st.heading = (Math.atan2(hy, hx) / rad + 360) % 360;
    if (st.compass !== 'on') { st.compass = 'on'; emit(); }
    var now = Date.now(); if (now - lastLive > 60) { lastLive = now; emitLive(); }
  }
  function listen() {
    if ('ondeviceorientationabsolute' in window) window.addEventListener('deviceorientationabsolute', onOrient);
    else window.addEventListener('deviceorientation', onOrient);
    setTimeout(function () { if (!gotEvent && st.compass !== 'on') { st.compass = needsPermission() ? 'needs-tap' : 'unavailable'; emit(); } }, 1500);
  }
  function needsPermission() { return window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function'; }
  var listening = false;
  /* Call from a tap (iOS needs a user gesture for the compass). */
  function enable() {
    startLocation();
    if (needsPermission()) {
      return DeviceOrientationEvent.requestPermission().then(function (s) {
        if (s === 'granted') { if (!listening) { listening = true; listen(); } if (!gotEvent) setTimeout(function () { if (!gotEvent) { st.compass = 'unavailable'; emit(); } }, 1500); }
        else { st.compass = 'unavailable'; emit(); }
      }).catch(function () { st.compass = 'needs-tap'; emit(); });
    }
    if (!listening) { listening = true; listen(); }
    return Promise.resolve();
  }
  /* Call on entering emergency mode / map: starts whatever doesn't need a tap. */
  function auto() {
    var ok = false; try { ok = localStorage.getItem('dews-nav-ok') === '1'; } catch (e) {}
    if (ok) startLocation();
    else if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(function (r) { if (r.state === 'granted') startLocation(); }).catch(function () {});
    }
    /* Always listen: if events arrive, the compass works; if not after 1.5 s, ask for a tap (iOS) or report no compass. */
    if (!listening) { listening = true; listen(); }
    if (!st.places.length && !fromCache()) useSamples();
  }

  /* ---------- places ---------- */
  function typeOf(t) {
    if (t.emergency === 'assembly_point') return 'assembly';
    if (t.amenity === 'hospital') return 'hospital';
    if (t.amenity === 'fire_station' || t.amenity === 'police') return 'rescue';
    if (t.amenity === 'drinking_water') return 'water';
    return null;
  }
  function parse(els) {
    var out = [], seen = {};
    els.forEach(function (e) {
      var t = e.tags || {}, ty = typeOf(t); if (!ty) return;
      var lat = e.lat != null ? e.lat : e.center && e.center.lat, lng = e.lon != null ? e.lon : e.center && e.center.lon;
      if (lat == null) return;
      var id = e.type + e.id; if (seen[id]) return; seen[id] = 1;
      out.push({ id: id, type: ty, lat: lat, lng: lng, name: t.name || '', nameZh: t['name:zh'] || '', note: t['opening_hours'] || '', osm: true });
    });
    return out;
  }
  function fromCache() {
    try {
      var c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (c && c.items && c.items.length && (!st.pos || dist(st.pos, c.from) < 5000)) {
        st.places = c.items; st.src = 'cache'; st.loadedAt = c.at; st.loadedFrom = c.from; return true;
      }
    } catch (e) {}
    return false;
  }
  function useSamples() {
    var c = st.pos || { lat: -33.8732, lng: 151.2061 };
    st.places = (window.SAMPLE_PLACES || []).map(function (p, i) {
      var q = offset(c, p.dx, p.dy);
      return { id: 'sample' + i, type: p.type, lat: q.lat, lng: q.lng, sample: true, name: p.name[0], nameZh: p.name[1], note: p.note };
    });
    st.src = 'sample'; st.loadedFrom = c;
  }
  var loading = false;
  function loadPlaces() {
    if (!st.pos) return;
    if (navigator.onLine === false) { if (!fromCache()) useSamples(); afterPlaces(); return; }
    if (loading) return; loading = true;
    var p = st.pos, q = '[out:json][timeout:20];(' +
      'node["emergency"="assembly_point"](around:3000,' + p.lat + ',' + p.lng + ');' +
      'nwr["amenity"="hospital"](around:6000,' + p.lat + ',' + p.lng + ');' +
      'nwr["amenity"~"^(fire_station|police)$"](around:4000,' + p.lat + ',' + p.lng + ');' +
      'node["amenity"="drinking_water"](around:1500,' + p.lat + ',' + p.lng + ');' +
      ');out center 150;';
    var ctl = window.AbortController ? new AbortController() : null;
    var to = setTimeout(function () { if (ctl) ctl.abort(); }, 15000);
    fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(q), ctl ? { signal: ctl.signal } : {})
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) {
        var items = parse(j.elements || []);
        if (!items.length) throw new Error('empty');
        st.places = items; st.src = 'osm'; st.loadedAt = Date.now(); st.loadedFrom = p;
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: st.loadedAt, from: p, items: items })); } catch (e) {}
      })
      .catch(function () { if (!fromCache()) useSamples(); })
      .then(function () { clearTimeout(to); loading = false; afterPlaces(); });
  }
  function afterPlaces() {
    if (st.targetId && !st.places.some(function (x) { return x.id === st.targetId; })) st.targetId = null;
    st.route = null; maybeRoute(); emit();
  }

  /* ---------- target & guidance ---------- */
  function withDist() {
    if (!st.pos) return st.places.map(function (p) { return { p: p, d: null, b: null }; });
    return st.places.map(function (p) { return { p: p, d: dist(st.pos, p), b: bearing(st.pos, p) }; })
      .sort(function (a, b) { return a.d - b.d; });
  }
  function target() {
    var list = withDist();
    if (st.targetId) { for (var i = 0; i < list.length; i++) if (list[i].p.id === st.targetId) return list[i]; }
    var safe = list.filter(function (x) { return SAFE[x.p.type]; });
    return safe[0] || list[0] || null;
  }
  function setTarget(id) { st.targetId = id; st.route = null; maybeRoute(); emit(); if (map && mapState === 'ready') fit(); }
  function cycleTarget() {
    var safe = withDist().filter(function (x) { return SAFE[x.p.type]; }).slice(0, 5);
    if (!safe.length) return;
    var cur = target(), i = 0;
    for (var k = 0; k < safe.length; k++) if (cur && safe[k].p.id === cur.p.id) i = k + 1;
    setTarget(safe[i % safe.length].p.id);
  }

  /* walking route (online only). Falls back to straight line. */
  var routing = false;
  function maybeRoute() {
    var t = target(); if (!t || !st.pos || navigator.onLine === false || routing) return;
    if (st.route && st.routeFor === t.p.id && offRoute() < 40) return;
    routing = true;
    var u = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot/' + st.pos.lng + ',' + st.pos.lat + ';' + t.p.lng + ',' + t.p.lat + '?overview=full&geometries=geojson&steps=false';
    var ctl = window.AbortController ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 10000);
    fetch(u, ctl ? { signal: ctl.signal } : {}).then(function (r) { return r.json(); }).then(function (j) {
      var rt = j.routes && j.routes[0]; if (!rt) throw 0;
      st.route = { coords: rt.geometry.coordinates.map(function (c) { return { lng: c[0], lat: c[1] }; }), distance: rt.distance, duration: rt.duration };
      st.routeFor = t.p.id;
    }).catch(function () { st.route = null; }).then(function () { clearTimeout(to); routing = false; emit(); });
  }
  function nearestIdx() {
    var best = 0, bd = Infinity, c = st.route.coords;
    for (var i = 0; i < c.length; i++) { var d = dist(st.pos, c[i]); if (d < bd) { bd = d; best = i; } }
    return { i: best, d: bd };
  }
  function offRoute() { return st.route && st.pos ? nearestIdx().d : Infinity; }
  /* Where to walk now: along the route ~25 m ahead, else straight at the target. */
  function guide() {
    var t = target(); if (!t || !st.pos) return null;
    var g = { t: t, b: t.b, d: t.d, viaRoute: false };
    if (st.route && st.routeFor === t.p.id) {
      var n = nearestIdx(), c = st.route.coords, acc = 0, j = n.i;
      while (j < c.length - 1 && acc < 25) { acc += dist(c[j], c[j + 1]); j++; }
      var rest = 0; for (var k = n.i; k < c.length - 1; k++) rest += dist(c[k], c[k + 1]);
      if (n.d < 60) { g.b = bearing(st.pos, c[j]); g.d = rest + n.d; g.viaRoute = true; }
    }
    g.rel = st.heading == null ? null : (g.b - st.heading + 360) % 360;
    g.mins = Math.max(1, Math.round(g.d / 1.2 / 60));
    return g;
  }

  /* ---------- map (MapLibre, loaded on demand) ---------- */
  var host = null, map = null, mapState = 'none', markers = {}, meMk = null, libP = null, mapDark = null, mapClick = null;
  function lib() {
    if (window.maplibregl) return Promise.resolve();
    if (libP) return libP;
    libP = new Promise(function (res, rej) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = (window.DEWS_BASE || '') + 'lib/maplibre-gl.css'; document.head.appendChild(l);
      var s = document.createElement('script'); s.src = (window.DEWS_BASE || '') + 'lib/maplibre-gl.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
    return libP;
  }
  function styleUrl(dark) { return 'https://tiles.openfreemap.org/styles/' + (dark ? 'dark' : 'positron'); }
  /* Put the (persistent) map into a slot element on the page. */
  function mount(slot, opts) {
    opts = opts || {};
    if (!host) { host = document.createElement('div'); host.className = 'map-host'; }
    mapClick = opts.onPlace || null;
    slot.appendChild(host);
    if (map) {
      if (mapDark !== !!opts.dark) { mapDark = !!opts.dark; setStyle(mapDark); }
      map.resize(); sync(false); return;
    }
    if (mapState === 'loading') return;
    mapState = 'loading'; mapDark = !!opts.dark;
    lib().then(function () {
      if (!window.maplibregl) throw new Error('lib');
      var cv = document.createElement('canvas'); if (!(cv.getContext('webgl2') || cv.getContext('webgl'))) throw new Error('webgl');
      return fetch(styleUrl(mapDark)).then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .catch(function () { return fetch(styleUrl(false)).then(function (r) { if (!r.ok) throw 0; return r.json(); }); });
    }).then(function (style) {
      var c = st.pos || target() && target().p || { lat: -33.8732, lng: 151.2061 };
      map = new maplibregl.Map({ container: host, style: style, center: [c.lng, c.lat], zoom: 15, attributionControl: { compact: true }, pitchWithRotate: false, dragRotate: true });
      map.on('load', function () { mapState = 'ready'; addRouteLayer(); sync(true); emit(); });
      map.on('dragstart', function () { if (st.follow) { st.follow = false; emit(); } });
      map.on('error', function () {});
    }).catch(function () { mapState = 'failed'; emit(); });
  }
  function setStyle(dark) {
    fetch(styleUrl(dark)).then(function (r) { return r.json(); }).then(function (s) {
      map.setStyle(s); map.once('styledata', function () { addRouteLayer(); sync(true); });
    }).catch(function () {});
  }
  function addRouteLayer() {
    if (!map || map.getSource('route')) return;
    map.addSource('route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addLayer({ id: 'route-casing', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': 9, 'line-opacity': 0.9 } });
    map.addLayer({ id: 'route', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#1F5FAD', 'line-width': 5 } });
  }
  var ICON = function (n) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + (window.ICON_PATHS && ICON_PATHS[n] || '') + '</svg>'; };
  function sync(recenter) {
    if (!map || mapState !== 'ready') return;
    var t = target(), seen = {};
    withDist().slice(0, 60).forEach(function (x) {
      var p = x.p; seen[p.id] = 1;
      var m = markers[p.id];
      if (!m) {
        var el = document.createElement('button');
        el.className = 'mk t-' + p.type; el.type = 'button';
        el.setAttribute('aria-label', p.name || p.type);
        el.innerHTML = ICON((window.PLACE_TYPES && PLACE_TYPES[p.type] || {}).icon || 'pin');
        el.addEventListener('click', function (e) { e.stopPropagation(); setTarget(p.id); if (mapClick) mapClick(p.id); });
        m = markers[p.id] = new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
        el.setAttribute('aria-label', (p.name || p.nameZh || p.type));
      }
      m.getElement().classList.toggle('is-target', !!(t && t.p.id === p.id));
    });
    Object.keys(markers).forEach(function (id) { if (!seen[id]) { markers[id].remove(); delete markers[id]; } });
    if (st.pos) {
      if (!meMk) {
        var me = document.createElement('div'); me.className = 'me-mk'; me.innerHTML = '<span class="cone"></span><span class="dot"></span>';
        meMk = new maplibregl.Marker({ element: me }).setLngLat([st.pos.lng, st.pos.lat]).addTo(map);
      } else meMk.setLngLat([st.pos.lng, st.pos.lat]);
    }
    var src = map.getSource('route');
    if (src) src.setData(st.route && t && st.routeFor === t.p.id ? { type: 'Feature', geometry: { type: 'LineString', coordinates: st.route.coords.map(function (c) { return [c.lng, c.lat]; }) } }
      : { type: 'FeatureCollection', features: (st.pos && t) ? [{ type: 'Feature', geometry: { type: 'LineString', coordinates: [[st.pos.lng, st.pos.lat], [t.p.lng, t.p.lat]] } }] : [] });
    if (recenter) fit();
    live();
  }
  function fit() {
    if (!map) return;
    var t = target();
    if (st.pos && t) {
      var b = new maplibregl.LngLatBounds([st.pos.lng, st.pos.lat], [st.pos.lng, st.pos.lat]); b.extend([t.p.lng, t.p.lat]);
      var hgt = map.getContainer().clientHeight, big = hgt > 600;
      map.fitBounds(b, { padding: big ? { top: 140, bottom: 340, left: 60, right: 90 } : { top: 40, bottom: 40, left: 40, right: 40 }, maxZoom: 17, duration: 0 });
    } else if (st.pos) map.jumpTo({ center: [st.pos.lng, st.pos.lat], zoom: 15 });
  }
  function live() {
    if (!map || !meMk) return;
    var cone = meMk.getElement().querySelector('.cone');
    if (st.heading == null) cone.style.display = 'none';
    else { cone.style.display = ''; cone.style.transform = 'rotate(' + (st.heading - map.getBearing()) + 'deg)'; }
    if (st.follow && st.heading != null) map.jumpTo({ bearing: st.heading, center: st.pos ? [st.pos.lng, st.pos.lat] : map.getCenter() });
  }
  function setFollow(on) { st.follow = on; if (map && !on) map.easeTo({ bearing: 0, duration: 300 }); if (on) live(); emit(); }
  function recenter() { st.follow = false; fit(); emit(); }

  subs.push(function () { if (map) sync(false); });
  liveSubs.push(live);
  window.addEventListener('online', function () { if (st.src !== 'osm') loadPlaces(); });

  return {
    state: st, onChange: function (f) { subs.push(f); }, onLive: function (f) { liveSubs.push(f); },
    enable: enable, auto: auto, startLocation: startLocation, loadPlaces: loadPlaces,
    list: withDist, target: target, setTarget: setTarget, cycleTarget: cycleTarget, guide: guide,
    mount: mount, mapState: function () { return mapState; }, setFollow: setFollow, recenter: recenter,
    dist: dist, bearing: bearing
  };
})();
