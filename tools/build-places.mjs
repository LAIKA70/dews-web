/* Builds data/places-sydney.json: help points across Greater Sydney.
 * Neighbourhood Safer Places come from the official NSW RFS list (NSW Spatial Services ArcGIS layer).
 * Everything else comes from OpenStreetMap. OSM "assembly points" are NOT used: they are mostly
 * building or tunnel fire-drill points, not public disaster refuges (DESIGN-DECISIONS #27).
 * Runs on GitHub Actions (weekly + on demand) so the app never has to wait for the
 * public Overpass server, and works offline from the first visit.
 * Data © OpenStreetMap contributors, ODbL.
 */
import { writeFileSync, mkdirSync } from 'node:fs';

const BBOX = [-34.25, 150.50, -33.40, 151.40]; /* south, west, north, east */
const bb = '(' + BBOX.join(',') + ')';
const Q = `[out:json][timeout:240];(
nwr["amenity"="hospital"]${bb};
nwr["amenity"~"^(fire_station|police)$"]${bb};
nwr["emergency"="ses_station"]${bb};
node["amenity"="drinking_water"]${bb};
nwr["amenity"~"^(clinic|doctors)$"]${bb};
nwr["amenity"="charging_station"]${bb};
nwr["amenity"="device_charging_station"]${bb};
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
  if (NOT_PUBLIC.test(name)) return null;
  if (t.amenity === 'hospital') {
    if (/dentist|medical practice|health centre|cumberland hospital/i.test(name)) return null;
    if (t.emergency === 'yes') return 'hospital';
    if (t.emergency === 'no' || NOT_ED.test(name) || !/hospital/i.test(name)) return null;
    return 'hospital';
  }
  if (t.emergency === 'ses_station' || /\bSES\b|State Emergency Service/.test(name)) return name ? 'ses' : null;
  if (t.amenity === 'fire_station') return name ? 'fire' : null;
  if (t.amenity === 'police') return name ? 'police' : null;
  if (t.amenity === 'drinking_water') return 'water';
  if (t.amenity === 'clinic' || t.amenity === 'doctors') return name && !/dentist|dental|physio|vet|cosmetic|skin|psych/i.test(name) ? 'clinic' : null;
  if (t.amenity === 'charging_station') return t.motorcar === 'no' ? null : 'ev';
  if (t.amenity === 'device_charging_station') return 'phone';
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

/* Official Neighbourhood Safer Places (NSW RFS), inside the same box */
const NSP_URL = 'https://spatial.industry.nsw.gov.au/arcgis/rest/services/CrownLands_Bushfire/Bushfire_RFSData/MapServer/8/query';
async function fetchNsp() {
  const feats = [];
  for (let offset = 0; offset < 10000; offset += 1000) {
    const q = new URLSearchParams({ where: '1=1', outFields: 'Title,Location,Suburb,Type,last_edited_date', returnGeometry: 'true', outSR: '4326',
      geometry: [BBOX[1], BBOX[0], BBOX[3], BBOX[2]].join(','), geometryType: 'esriGeometryEnvelope', inSR: '4326', spatialRel: 'esriSpatialRelIntersects',
      resultOffset: String(offset), resultRecordCount: '1000', f: 'geojson' });
    const r = await fetch(NSP_URL + '?' + q, { headers: { 'User-Agent': 'DEWS places builder (github.com/LAIKA70/dews-web)' } });
    if (!r.ok) throw new Error('NSP ' + r.status);
    const g = await r.json();
    if (!g.features) throw new Error('NSP: no features ' + JSON.stringify(g).slice(0, 200));
    feats.push(...g.features);
    if (g.features.length < 1000) break;
  }
  return feats;
}
const nspFeats = await fetchNsp();
let nspEdited = 0;

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
  if (ty !== 'water') { row.push(t.name || t.operator || t.brand || '', t['name:zh'] || t['name:zh-Hans'] || ''); if (ty === 'hospital') row.push(t.emergency === 'yes' ? 1 : 0); }
  out.push(row);
}
for (const f of nspFeats) {
  const c = f.geometry && f.geometry.coordinates; if (!c) continue;
  const pr = f.properties || {};
  if (pr.last_edited_date && pr.last_edited_date > nspEdited) nspEdited = pr.last_edited_date;
  const addr = [pr.Location, pr.Suburb].filter(Boolean).join(', ');
  out.push(['nsp', +c[1].toFixed(5), +c[0].toFixed(5), (pr.Title || '').trim(), '', addr, pr.Type || '']);
}
out.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
const counts = {}; out.forEach((r) => { counts[r[0]] = (counts[r[0]] || 0) + 1; });
const data = { v: 2, area: 'Greater Sydney', bbox: BBOX, osmBase: j.osm3s && j.osm3s.timestamp_osm_base, built: new Date().toISOString(), counts,
  nsp: { source: 'NSW Rural Fire Service — Neighbourhood Safer Places (NSW Spatial Services)', edited: nspEdited ? new Date(nspEdited).toISOString().slice(0, 10) : null, count: nspFeats.length },
  licence: 'Data © OpenStreetMap contributors, ODbL 1.0; Neighbourhood Safer Places © State of New South Wales (NSW Rural Fire Service)', rows: out };
mkdirSync(new URL('../data/', import.meta.url), { recursive: true });
writeFileSync(new URL('../data/places-sydney.json', import.meta.url), JSON.stringify(data));
console.log('places:', out.length, counts);
