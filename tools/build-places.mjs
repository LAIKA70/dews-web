/* Builds data/places-sydney.json: safe places across Greater Sydney from OpenStreetMap.
 * Runs on GitHub Actions (weekly + on demand) so the app never has to wait for the
 * public Overpass server, and works offline from the first visit.
 * Data © OpenStreetMap contributors, ODbL.
 */
import { writeFileSync, mkdirSync } from 'node:fs';

const BBOX = [-34.25, 150.50, -33.40, 151.40]; /* south, west, north, east */
const bb = '(' + BBOX.join(',') + ')';
const Q = `[out:json][timeout:240];(
node["emergency"="assembly_point"]${bb};way["emergency"="assembly_point"]${bb};
nwr["amenity"="hospital"]${bb};
nwr["amenity"~"^(fire_station|police)$"]${bb};
nwr["emergency"="ses_station"]${bb};
node["amenity"="drinking_water"]${bb};
);out center tags;`;

const SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

/* Not places a member of the public should walk to in an emergency. */
const NOT_PUBLIC = /training|catering|comms|communication|logistics|support brigade|fleet|hazmat|academy|trail bike|dog unit|campus security|border force|aviation|mounted|bomb|headquarters|\bhq\b|command centre|transit police|loading dock|strategic operations|suppression|usar/i;
const NOT_ED = /private|day (hospital|surgery)|clinic|surgical|rehab|hospice|skin|tresillian|karitane|hypno|dentist|medical practice|health centre|day surgery|jarrah|justice health|women and babies/i;

function classify(t) {
  const name = t.name || '';
  if (t.emergency === 'assembly_point') return /neighbourhood safer place/i.test(name) || t['assembly_point:fire'] === 'designated' ? 'nsp' : 'assembly';
  if (NOT_PUBLIC.test(name)) return null;
  if (t.amenity === 'hospital') {
    if (/dentist|medical practice|health centre|cumberland hospital/i.test(name)) return null;
    if (t.emergency === 'yes') return 'hospital';
    if (t.emergency === 'no' || NOT_ED.test(name) || !/hospital/i.test(name)) return null;
    return 'hospital';
  }
  if (t.amenity === 'fire_station' || t.amenity === 'police' || t.emergency === 'ses_station') return name ? 'rescue' : null;
  if (t.amenity === 'drinking_water') return 'water';
  return null;
}

async function fetchOverpass() {
  let last;
  for (const url of SERVERS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const r = await fetch(url, { method: 'POST', body: 'data=' + encodeURIComponent(Q), headers: { 'User-Agent': 'DEWS places builder (github.com/LAIKA70/dews-web)' } });
        const text = await r.text();
        if (!r.ok || text[0] !== '{') throw new Error(url + ' ' + r.status + ' ' + text.slice(0, 80));
        return JSON.parse(text);
      } catch (e) { last = e; console.warn(String(e)); await new Promise((s) => setTimeout(s, 20000)); }
    }
  }
  throw last;
}

const j = await fetchOverpass();
const seen = new Set(), near = new Map(), out = [];
for (const e of j.elements) {
  const t = e.tags || {}, ty = classify(t); if (!ty) continue;
  const lat = e.lat ?? e.center?.lat, lng = e.lon ?? e.center?.lon; if (lat == null) continue;
  const id = e.type[0] + e.id; if (seen.has(id)) continue; seen.add(id);
  /* drop near-duplicates (same type within ~40 m, e.g. node + building) */
  const key = ty + ':' + Math.round(lat * 2500) + ':' + Math.round(lng * 2500);
  if (near.has(key)) continue; near.set(key, 1);
  const row = [ty, +lat.toFixed(5), +lng.toFixed(5)];
  if (ty !== 'water') { row.push(t.name || '', t['name:zh'] || t['name:zh-Hans'] || ''); if (ty === 'hospital') row.push(t.emergency === 'yes' ? 1 : 0); }
  out.push(row);
}
out.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
const counts = {}; out.forEach((r) => { counts[r[0]] = (counts[r[0]] || 0) + 1; });
const data = { v: 1, area: 'Greater Sydney', bbox: BBOX, osmBase: j.osm3s && j.osm3s.timestamp_osm_base, built: new Date().toISOString(), counts, licence: 'Data © OpenStreetMap contributors, ODbL 1.0', rows: out };
mkdirSync(new URL('../data/', import.meta.url), { recursive: true });
writeFileSync(new URL('../data/places-sydney.json', import.meta.url), JSON.stringify(data));
console.log('places:', out.length, counts);
