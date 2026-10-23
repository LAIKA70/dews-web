# DEWS — web (v2)

DEWS is a disaster-readiness guide in English and 中文. It's built for people
in Australia who may not read English warnings easily, starting with
international students. It is survival-first and offline-first.

**[Start page](https://laika70.github.io/dews-web/)** · **[手机版 Mobile](https://laika70.github.io/dews-web/mobile/)** · **[电脑版 Desktop](https://laika70.github.io/dews-web/desktop/)** · [Version 1](https://laika70.github.io/dews-web/v1/) · [What changed](CHANGELOG.md) · [Design decisions](DESIGN-DECISIONS.md)

## What it does

- **Emergency mode**: call 000, tell family you're safe, request help, step-by-step guides for bushfire, flood, storm, heatwave and earthquake, and tools (torch, SOS light, whistle, help card).
- **Check-in**: when a warning covers your area, DEWS asks whether you're affected and whether you need help.
- **Prepare**: an emergency kit calculator, a household / share-house plan, and scenario practice.
- **Nearby**: shelters, hospitals, water and charging points, with distance and direction.
- **Profile**: an emergency card in English for responders, plus language, text size and theme settings.

Warnings, places and the help-request agency are **sample data** in this version.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Start page: choose mobile or desktop |
| `mobile/`, `desktop/` | The two versions (small shells that load the shared files) |
| `app.js`, `app.css` | The app's logic and styles, shared by both versions |
| `nav.js` | Location, compass, nearby places, walking route, map |
| `content.js` | All text, safety steps and sources (English + 中文) |
| `lib/` | MapLibre GL JS (BSD-3), bundled so the map works offline |
| `sw.js` | Makes the app work offline. Bump `CACHE` when you change any file. |
| `manifest.webmanifest`, `icon*` | Lets people add DEWS to their home screen |
| `v1/` | The original version |

## Rules for content

Every safety instruction must come from an official source listed in
`content.js` → `SOURCES`. Don't add advice without one.

All data stays in the browser. No server, no tracking.
DEWS is a guide. It does not replace official warnings or 000.
