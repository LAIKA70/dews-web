# DEWS — design decisions

A record of who decided what, and why. Newest first.
**LAIKA** = project lead and designer. **Claude** = AI design and code assistant.

| # | Date | Decision | Proposed by | Why / evidence |
|---|---|---|---|---|
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
- Do people trust the straight-line arrow offline, or do they need the map?
