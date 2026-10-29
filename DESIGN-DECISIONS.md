# DEWS — design decisions

A record of who decided what, and why. Newest first.
**LAIKA** = project lead and designer. **Claude** = AI design and code assistant.

| # | Date | Decision | Proposed by | Why / evidence |
|---|---|---|---|---|
| 24 | 2026-10-30 | Real warnings: show the official level, its meaning and a link to the official warning; DEWS never picks "leave" or "shelter" for a specific fire. Only fixed terms (level, status, fire type) are translated, with reviewed Chinese; place names stay English | Claude | The RFS feed has the level but not the action text; a wrong guess could send someone out when it's too late to leave. AIDR republisher guideline: keep official wording, show source, date and time |
| 23 | 2026-10-30 | Real NSW bushfire warnings from the NSW RFS feed, read on the phone (no DEWS server). Show every incident within 50 km, plus every Emergency Warning in NSW; samples move to Practice mode | LAIKA (range), Claude (approach) | Nearby small fires matter to someone without a car; a statewide Emergency must never be missed |
| 22 | 2026-10-26 | No invented places on the map, ever; only real OpenStreetMap places, with evacuation centres left to official channels | LAIKA | People act on what the map shows; a fake place could send someone the wrong way |
| 21 | 2026-10-26 | Warning flow: what → how far → act? → what to take → where to go; whether to act comes from the official warning level, not from DEWS | LAIKA (flow), Claude (official level decides, leave vs shelter) | Matches the Australian Warning System; the app must not invent safety decisions |
| 20 | 2026-10-26 | "You are here" uses a colour reserved for it (violet) plus pulse and label | LAIKA | Blue was also the drinking-water colour |
| 19 | 2026-10-26 | Glass styles as a trial setting (Frosted / Liquid / Tinted / Solid) on buttons and their containers; primary and emergency buttons stay solid | LAIKA | Choose by looking on real devices; emergency actions must stay high-contrast |
| 18 | 2026-10-26 | Tablet version (bigger type and targets, sidebar / icon rail), same shared code | LAIKA | The desktop layout on a tablet was too small to tap and read |
| 17 | 2026-10-26 | Safe places bundled in the app (Greater Sydney, OpenStreetMap, rebuilt weekly by GitHub Actions); manual "set my location on the map"; Wi-Fi location fallback | LAIKA reported "can't locate, can't route"; Claude diagnosed | Public Overpass took 37–45 s and often returned 429/502; offline-first means the data must already be on the phone |
| 16 | 2026-10-26 | Place names follow official Australian terms: evacuation centre, Neighbourhood Safer Place (last resort), emergency assembly area; no generic "safe point" | LAIKA asked; Claude checked NSW sources | "Assembly point" is a workplace term; calling a place "safe" when no authority says so could mislead |
| 15 | 2026-10-23 | "Me" renamed "Profile" / 个人档案; English and Chinese must say the same thing; "network" not "signal"; first-run guide is swipeable, with buttons kept | LAIKA | "Me" was unclear and didn't match 我的; "signal" is inaccurate (the app needs no internet, GPS still works); swipe is expected on phones, buttons keep it accessible |
| 14 | 2026-10-23 | Emergency mode follows the normal theme (no forced dark screen); a red line marks the mode | LAIKA (spotted the inconsistent backgrounds) | Switching light/dark felt jarring. Calm comes from consistency and clarity more than hue |
| 13 | 2026-10-23 | Frosted glass on cards and floating layers, over a soft low-saturation background; can be turned off | LAIKA | Aesthetics. Glass kept at ≥72% opacity so text stays ≥4.5:1; off when "reduce transparency" is on |
| 12 | 2026-10-23 | Colour direction: low saturation everywhere; saturated red only for Call 000 / emergency | LAIKA (red "too red", "glaring") → research by Claude | Wilms & Oberfeld 2018: saturation and brightness drive arousal more than hue. Wogalter et al. 2002: colour is salient only when used sparingly |
| 11 | 2026-10-23 | Three trial palettes (A Eucalypt, B Harbour, C Okabe–Ito) shipped as a setting to compare on real phones | LAIKA | Choose by looking, not by description |
| 10 | 2026-10-23 | **4 MVPs**: (1) personal supplies, (2) disaster learning + supplies, (3) live map, compass, route and survival guide, (4) personal profile. MVP mode switch | LAIKA | Course method: start from a minimum viable product, add features once the core works |
| 9 | 2026-10-23 | Emergency card kept, inside the profile; prompt to also fill in the phone's Medical ID | LAIKA | Responders need the info when the person can't speak; web apps can't show on the lock screen |
| 8 | 2026-10-23 | Profile includes disability, wheelchair / walking aid, stairs, vision, hearing, powered equipment, assistance animal, allergies | LAIKA | Responders bring the right help; routes may include steps |
| 7 | 2026-10-23 | Map: OpenFreeMap + OpenStreetMap (free, cacheable); not Google Maps; own offline map pack (PMTiles) later | LAIKA asked; Claude compared options | Google Maps costs per use and its terms limit offline caching |
| 6 | 2026-10-23 | Live compass and directions to the nearest safe place appear immediately in emergency mode, plus a full-screen live map | LAIKA | People in a panic need "which way", not a list |
| 5 | 2026-10-23 | First-time guide: language first, then one sentence per section, then location and compass permission | LAIKA | Content must be in the person's language before anything else |
| 4 | 2026-10-23 | Vision: a disaster app for everyone. First test group: international students in Australia (proposed, to be confirmed by research) | LAIKA (vision), Claude (first test group) | Accessible to LAIKA for interviews; gap hypotheses to be tested, not assumed |
| 3 | 2026-10-23 | Check-in flow: detect a warning → "Are you affected?" → "Do you need help?" → send location, injuries and needs → show estimated response time | LAIKA | Turns a passive warning into action. ETA must come from the agency, never invented by the app |
| 2 | 2026-10-23 | Every safety instruction from an official source, shown with source and date | LAIKA (principle), Claude (sourcing) | Layer 1 must never fail; AI must not author survival advice |
| 1 | 2026-10-23 | Full redesign of v1 (features, UI, UX); v1 kept at /v1/ | LAIKA | v1 was a quick demo; visual quality and structure weren't good enough |

## Open questions (to answer with research)
- Which of the international-student gap hypotheses are real? (language, unfamiliar hazards, 000 vs 132 500, renting without a car, family overseas)
- Final palette: A, B, C or a mix?
- Final glass style: Frosted, Liquid, Tinted or Solid?
- Offline walking routes: which approach (see the 2026-10-26 notes)?
- Do people trust the straight-line arrow offline, or do they need the map?
