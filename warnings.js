/* DEWS — real bushfire warnings from the NSW Rural Fire Service.
 * Pulls the public "major incidents" feed straight from the browser (no DEWS server).
 * Feed: https://www.rfs.nsw.gov.au/feeds/majorIncidents.json — GeoJSON, updated every 30 min, CC BY 4.0.
 * Rules we follow (RFS feed page + AIDR Guideline for Warnings Republishers):
 *  - show source, attribution, and the time RFS last updated each incident
 *  - never change the official wording: only fixed terms (level, status, fire type) are translated,
 *    with reviewed Chinese; names and places stay in English
 *  - never decide leave-or-shelter for the person; point to the official warning for the exact action
 *  - show every update, including downgrades; drop incidents the moment RFS removes them
 *  - say clearly when the data is old or the phone is offline
 * Pure logic is exposed on window.WARN so it can be tested on its own. */
(function () {
  'use strict';
  var FEED = 'https://www.rfs.nsw.gov.au/feeds/majorIncidents.json';
  var NEAR_M = 50000;            /* show every incident within 50 km */
  var POLL_MS = 5 * 60 * 1000;   /* check every 5 min while the app is open (feed updates every 30 min) */
  var STALE_MS = 60 * 60 * 1000; /* older than 60 min = may be out of date */
  var STORE = 'dews-rfs';
  var ATTRIBUTION = '© State of New South Wales (NSW Rural Fire Service). For current information go to www.rfs.nsw.gov.au.';
  var FNM = 'https://www.rfs.nsw.gov.au/fire-information/fires-near-me';

  var LEVEL = { 'advice': 'advice', 'watch and act': 'watch', 'emergency warning': 'emergency' };
  var RANK = { emergency: 3, watch: 2, advice: 1 };

  /* ---------- geometry (small areas: flat-earth metres around the person) ---------- */
  var R = 6371000, D2R = Math.PI / 180;
  function proj(o, ll) { /* [lng,lat] → metres east/north of o */
    return [(ll[0] - o.lng) * D2R * R * Math.cos(o.lat * D2R), (ll[1] - o.lat) * D2R * R];
  }
  function hav(a, b) {
    var dLat = (b.lat - a.lat) * D2R, dLng = (b.lng - a.lng) * D2R;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * D2R) * Math.cos(b.lat * D2R) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }
  function segDist(p, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
    var u = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)) : 0;
    var x = a[0] + u * dx - p[0], y = a[1] + u * dy - p[1];
    return Math.sqrt(x * x + y * y);
  }
  function inRing(p, ring) {
    var inside = false;
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      var a = ring[i], b = ring[j];
      if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
    }
    return inside;
  }
  /* collect Points and Polygons from any nesting of GeometryCollection / Multi* */
  function walk(g, pts, polys) {
    if (!g) return;
    if (g.type === 'Point') pts.push(g.coordinates);
    else if (g.type === 'MultiPoint') g.coordinates.forEach(function (c) { pts.push(c); });
    else if (g.type === 'Polygon') polys.push(g.coordinates);
    else if (g.type === 'MultiPolygon') g.coordinates.forEach(function (c) { polys.push(c); });
    else if (g.type === 'GeometryCollection') (g.geometries || []).forEach(function (x) { walk(x, pts, polys); });
  }
  function ringArea(r) { var s = 0; for (var i = 0, j = r.length - 1; i < r.length; j = i++) s += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return Math.abs(s / 2); }

  /* ---------- parsing ---------- */
  function field(desc, key) {
    var m = new RegExp(key + ':\\s*([^<]*)', 'i').exec(desc || '');
    return m ? m[1].trim() : '';
  }
  /* "30 Oct 2026 08:02" (NSW local time, as RFS writes it) — kept as text and also as a Date when possible */
  var MON = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  /* pubDate is UTC: "29/10/2026 9:02:00 PM" */
  function parsePub(s) {
    var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i.exec(s || '');
    if (!m) return null;
    var h = +m[4] % 12; if (m[7] && m[7].toUpperCase() === 'PM') h += 12; if (!m[7]) h = +m[4];
    return Date.UTC(+m[3], +m[2] - 1, +m[1], h, +m[5], +(m[6] || 0));
  }
  function parse(geo) {
    var out = [];
    ((geo && geo.features) || []).forEach(function (f) {
      var p = f.properties || {}, d = p.description || '';
      var cat = (p.category || field(d, 'ALERT LEVEL') || '').trim();
      var pts = [], polys = []; walk(f.geometry, pts, polys);
      polys = polys.filter(function (pg) { return pg[0] && pg[0].length >= 4 && ringArea(pg[0]) > 1e-9; });
      var title = p.title || field(d, 'LOCATION') || 'Unnamed incident';
      var id = (String(p.guid || '').match(/(\d+)\s*$/) || [])[1] || title;
      out.push({
        id: id, title: title.replace(/\s*\(Unmapped Incident\)\s*$/i, ''),
        unmapped: /\(Unmapped Incident\)/i.test(title),
        category: cat, level: LEVEL[cat.toLowerCase()] || null,
        location: field(d, 'LOCATION'), council: field(d, 'COUNCIL AREA'),
        status: field(d, 'STATUS'), type: field(d, 'TYPE'), size: field(d, 'SIZE'),
        agency: field(d, 'RESPONSIBLE AGENCY'), updated: field(d, 'UPDATED'),
        pub: parsePub(p.pubDate), link: p.link || FNM,
        point: pts[0] ? { lng: pts[0][0], lat: pts[0][1] } : null, polys: polys
      });
    });
    return out;
  }

  /* how far the person is from an incident: to the edge of the fire area if mapped, else to its reported point */
  function measure(inc, pos) {
    if (!pos || !inc.point) return null;
    var dir = bearing(pos, inc.point);
    if (inc.polys.length) {
      var o = { lat: pos.lat, lng: pos.lng }, p = [0, 0], best = Infinity, inside = false;
      inc.polys.forEach(function (pg) {
        var outer = pg[0].map(function (c) { return proj(o, c); });
        if (inRing(p, outer) && !pg.slice(1).some(function (h) { return inRing(p, h.map(function (c) { return proj(o, c); })); })) inside = true;
        pg.forEach(function (ring) {
          var rr = ring.map(function (c) { return proj(o, c); });
          for (var i = 1; i < rr.length; i++) best = Math.min(best, segDist(p, rr[i - 1], rr[i]));
        });
      });
      return { m: inside ? 0 : best, inside: inside, edge: true, dir: dir };
    }
    return { m: hav(pos, inc.point), inside: false, edge: false, dir: dir };
  }
  function bearing(a, b) {
    var y = Math.sin((b.lng - a.lng) * D2R) * Math.cos(b.lat * D2R);
    var x = Math.cos(a.lat * D2R) * Math.sin(b.lat * D2R) - Math.sin(a.lat * D2R) * Math.cos(b.lat * D2R) * Math.cos((b.lng - a.lng) * D2R);
    return (Math.atan2(y, x) / D2R + 360) % 360;
  }
  /* a circle that covers the fire area — used so walking routes keep away from it */
  function zone(inc) {
    if (!inc || !inc.point) return null;
    var all = []; inc.polys.forEach(function (pg) { pg[0].forEach(function (c) { all.push(c); }); });
    if (!all.length) return { lat: inc.point.lat, lng: inc.point.lng, r: 1000 };
    var lng = 0, lat = 0; all.forEach(function (c) { lng += c[0]; lat += c[1]; }); lng /= all.length; lat /= all.length;
    var c = { lat: lat, lng: lng }, r = 0;
    all.forEach(function (p) { r = Math.max(r, hav(c, { lat: p[1], lng: p[0] })); });
    return { lat: lat, lng: lng, r: Math.max(300, r) };
  }

  /* what DEWS shows: everything within 50 km, plus every Emergency Warning in NSW */
  function select(list, pos) {
    var out = [];
    list.forEach(function (inc) {
      var far = measure(inc, pos);
      var near = far && far.m <= NEAR_M;
      if (near || inc.level === 'emergency') out.push({ inc: inc, far: far, near: !!near });
    });
    out.sort(function (a, b) {
      return (RANK[b.inc.level] || 0) - (RANK[a.inc.level] || 0) || ((a.far ? a.far.m : 1e12) - (b.far ? b.far.m : 1e12));
    });
    return out;
  }

  /* ---------- fixed terms in Chinese (reviewed by LAIKA 2026-10-30; anything not here stays in English) ---------- */
  var ZH = {
    'Advice': '建议', 'Watch and Act': '注意并行动', 'Emergency Warning': '紧急警告',
    'Planned Burn': '计划性焚烧', 'Not Applicable': '未分级',
    'Out of control': '失控', 'Being controlled': '控制中', 'Under control': '已控制', 'Responding': '消防队正在前往',
    'Bush Fire': '丛林火', 'Grass Fire': '草火', 'Scrub Fire': '灌木火', 'Forest Fire': '森林火',
    'Hazard Reduction': '计划性烧除', 'Burn off': '烧荒', 'Structure Fire': '建筑物火灾', 'Haystack fire': '干草堆火灾',
    'Vehicle Fire': '车辆火灾', 'MVA/Transport': '交通事故', 'Other': '其他', 'Flood': '洪水', 'Search': '搜救'
  };
  function term(s, zh) {
    if (!zh || !s) return s || '';
    for (var k in ZH) if (k.toLowerCase() === s.toLowerCase()) return ZH[k];
    return s;
  }

  /* ---------- fetching, caching, freshness ---------- */
  var st = { list: null, at: null, state: 'idle', error: null };
  var subs = [];
  function emit() { subs.forEach(function (f) { try { f(); } catch (e) {} }); }
  function loadCache() {
    try { var c = JSON.parse(localStorage.getItem(STORE) || 'null'); if (c && c.list) { st.list = c.list; st.at = c.at; } } catch (e) {}
  }
  function saveCache() { try { localStorage.setItem(STORE, JSON.stringify({ at: st.at, list: st.list })); } catch (e) {} }
  var timer = null, inflight = null;
  function refresh() {
    if (inflight) return inflight;
    if (navigator.onLine === false) { st.state = 'offline'; emit(); return Promise.resolve(); }
    st.state = 'loading'; emit();
    var ctl = window.AbortController ? new AbortController() : null;
    var to = setTimeout(function () { if (ctl) ctl.abort(); }, 20000);
    inflight = fetch(FEED, { cache: 'no-store', signal: ctl ? ctl.signal : undefined, credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) { st.list = parse(j); st.at = Date.now(); st.state = 'ok'; st.error = null; saveCache(); })
      .catch(function (e) { st.state = 'error'; st.error = String(e && e.message || e); })
      .then(function () { clearTimeout(to); inflight = null; emit(); });
    return inflight;
  }
  function start() {
    loadCache(); refresh();
    if (timer) clearInterval(timer);
    timer = setInterval(function () { if (!document.hidden) refresh(); }, POLL_MS);
    document.addEventListener('visibilitychange', function () { if (!document.hidden && (!st.at || Date.now() - st.at > POLL_MS)) refresh(); });
    window.addEventListener('online', function () { refresh(); });
    window.addEventListener('offline', function () { st.state = 'offline'; emit(); });
  }
  function stale() { return !st.at || Date.now() - st.at > STALE_MS; }

  window.WARN = {
    FEED: FEED, FNM: FNM, ATTRIBUTION: ATTRIBUTION, NEAR_M: NEAR_M, STALE_MS: STALE_MS,
    parse: parse, measure: measure, select: select, zone: zone, term: term, ZH: ZH,
    state: st, start: start, refresh: refresh, stale: stale,
    onChange: function (f) { subs.push(f); },
    find: function (id) { return (st.list || []).filter(function (x) { return x.id === id; })[0] || null; },
    _set: function (list, at) { st.list = list; st.at = at == null ? Date.now() : at; st.state = 'ok'; emit(); } /* tests */
  };
})();
