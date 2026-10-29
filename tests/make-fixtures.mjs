// Builds recorded-style RFS feeds for tests. Shapes copied from the real feed recorded 2026-10-30 08:05 AEDT.
import { writeFileSync } from 'node:fs';
const D = (lvl, loc, council, status, type, size, upd) =>
  `ALERT LEVEL: ${lvl} <br />LOCATION: ${loc} <br />COUNCIL AREA: ${council} <br />STATUS: ${status} <br />TYPE: ${type} <br />FIRE: Yes <br />SIZE: ${size} ha <br />RESPONSIBLE AGENCY: Rural Fire Service <br />UPDATED: ${upd}`;
const box = (lng, lat, w, h) => [[[lng - w, lat - h], [lng + w, lat - h], [lng + w, lat + h], [lng - w, lat + h], [lng - w, lat - h]]];
const F = (id, title, cat, desc, geometry, pub) => ({ type: 'Feature', geometry, properties: { title, link: 'https://www.rfs.nsw.gov.au/fire-information/fires-near-me', category: cat, guid: `https://incidents.rfs.nsw.gov.au/api/v1/incidents/${id}`, guid_isPermaLink: 'true', pubDate: pub, description: desc } });
const GC = (lng, lat, polys) => ({ type: 'GeometryCollection', geometries: [{ type: 'Point', coordinates: [lng, lat] }, { type: 'GeometryCollection', geometries: polys.map(c => ({ type: 'Polygon', coordinates: c })) }] });
const PT = (lng, lat) => ({ type: 'Point', coordinates: [lng, lat] });

// real, unchanged (recorded): planned burn at Kenthurst (~35 km from Mascot), advice at Whittingham (far), structure fire point (far)
const real = [
  F(683451, 'PORTERS HR STAGE 3', 'Planned Burn', D('Planned Burn', 'PORTERS RD, KENTHURST 2156', 'The Hills', 'Under control', 'Hazard Reduction', 18, '29 Oct 2026 17:15'), GC(150.9671, -33.614, [box(150.9655, -33.6122, 0.0028, 0.0024)]), '29/10/2026 6:15:00 AM'),
  F(683363, 'SECTOR 5, SMA', 'Advice', D('Advice', 'RANGE RD, WHITTINGHAM 2330', 'Singleton', 'Under control', 'Grass Fire', 541, '29 Oct 2026 17:50'), GC(151.2086, -32.7108, [box(151.199, -32.711, 0.0215, 0.0135)]), '29/10/2026 6:50:00 AM'),
  F(683792, 'BOONA RD, CONDOBOLIN', 'Not Applicable', D('Not Applicable', 'HOMESWORTH, BOONA RD, CONDOBOLIN 2877', 'Lachlan', 'Responding', 'Structure Fire', 0, '30 Oct 2026 08:02'), PT(147.1254, -32.8632), '29/10/2026 9:02:00 PM'),
];
// recorded-style test incidents for the three levels (not real fires)
const test = [
  F(900001, 'TEST ADVICE, ALEXANDRIA', 'Advice', D('Advice', 'TEST ST, ALEXANDRIA 2015', 'Sydney', 'Under control', 'Grass Fire', 3, '30 Oct 2026 07:10'), GC(151.196, -33.905, [box(151.196, -33.905, 0.003, 0.002)]), '29/10/2026 8:10:00 PM'),
  F(900002, 'TEST WATCH AND ACT, KURNELL', 'Watch and Act', D('Watch and Act', 'CAPTAIN COOK DR, KURNELL 2231', 'Sutherland', 'Being controlled', 'Bush Fire', 120, '30 Oct 2026 07:40'), GC(151.21, -34.01, [box(151.21, -34.01, 0.015, 0.01)]), '29/10/2026 8:40:00 PM'),
  F(900003, 'TEST EMERGENCY, BLACKHEATH', 'Emergency Warning', D('Emergency Warning', 'GREAT WESTERN HWY, BLACKHEATH 2785', 'Blue Mountains', 'Out of control', 'Bush Fire', 2400, '30 Oct 2026 07:55'), GC(150.28, -33.63, [box(150.28, -33.63, 0.04, 0.03)]), '29/10/2026 8:55:00 PM'),
  F(900004, 'TEST RD, ST MARYS (Unmapped Incident)', 'Advice', D('Advice', 'TEST RD, ST MARYS 2750', 'Penrith', 'Responding', 'Bush Fire', 0, '30 Oct 2026 07:58'), PT(150.80, -33.76), '29/10/2026 8:58:00 PM'),
];
writeFileSync(new URL('./fixtures/rfs-levels.json', import.meta.url), JSON.stringify({ type: 'FeatureCollection', features: [...test, ...real] }));
writeFileSync(new URL('./fixtures/rfs-quiet.json', import.meta.url), JSON.stringify({ type: 'FeatureCollection', features: real }));
// an Emergency Warning whose area covers Mascot (person inside)
const inside = F(900005, 'TEST EMERGENCY, MASCOT', 'Emergency Warning', D('Emergency Warning', 'TEST AVE, MASCOT 2020', 'Bayside', 'Out of control', 'Bush Fire', 50, '30 Oct 2026 08:00'), GC(151.1925, -33.9262, [box(151.1925, -33.9262, 0.01, 0.008)]), '29/10/2026 9:00:00 PM');
writeFileSync(new URL('./fixtures/rfs-inside.json', import.meta.url), JSON.stringify({ type: 'FeatureCollection', features: [inside, ...real] }));
console.log('ok');
