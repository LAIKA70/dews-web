# Changelog — DEWS web

Plain-language notes on what changed in each version.

## 2.0.1 — 2026-10-23 · Accessibility

- New **Extra large** text size (Me → Text size), for older users and anyone who wants bigger text. Large is now a little bigger too.
- Screen readers: every screen now has a main heading, the Call 000 bar is labelled, and focus moves to the new content when you change screens. The map radar is hidden from screen readers because the list below gives the same information.
- Phone numbers no longer break across two lines.
- Automated accessibility check (axe-core, WCAG 2.2 AA): 0 issues on all 14 screens, light and dark.

## 2.0.0 — 2026-10-23 · Full redesign

The whole app was redesigned: features, layout and look.

**New layout**
- Four tabs at the bottom: Today, Prepare, Nearby, Me.
- A red **Emergency** button sits at the top of every screen, so help is always one tap away.

**Emergency mode** (dark screen, big text, saves battery)
- **Call 000** button at the top.
- **Tell family I'm safe**: opens a text message to your contacts, with your location if you allow it. Texts work without mobile data.
- **Request help**: say whether anyone is hurt, how many people are with you, and what you need most. If someone is badly hurt, the app tells you to call 000 first. *Demo only: nothing is sent to a real agency yet, and the arrival time is a sample.*
- **What's happening?** Bushfire, flood, storm, heatwave, earthquake. The app asks one question first (for example "Can you leave safely right now?"), then shows what to do. The first step is shown large at the top, with no scrolling needed.
- **Tools**: torch (bright screen), SOS light, whistle sound, and a "Show to others" card that says *I need help, please call 000* in English.

**The app checks in with you**
- When there's a warning for your area, DEWS asks "Are you affected?" If you say yes, it asks "Do you need help?" and takes you to Request help or Tell family I'm safe.
- Warnings use the Australian Warning System's three levels: Advice, Watch and Act, Emergency Warning. *Uses sample data for now. Turn it on under Me → Simulate a warning.*

**Prepare**
- **Emergency kit calculator**: enter how many people, plus whether you have a baby or pets. It works out how much water to store and gives you a checklist.
- **Household plan** for families and share houses: people and phone numbers, meeting points, an out-of-area contact, and when you'll leave. You can share it.
- **Scenario practice**: 8 short questions, each with the correct answer and its source.

**Nearby**
- A radar view and a list of shelters, hospitals, water and charging points, with distance and direction. Includes a compass. *Sample places for now.*

**Me**
- **Emergency card**: name, language, blood type, allergies, medications and emergency contact. It's shown in English so responders can read it. It's saved only on your phone.
- Settings for language, text size (Standard / Large) and appearance (Auto / Light / Dark).
- A **Sources** page listing where every safety instruction comes from.

**Works offline**
- After the first visit, the whole app (version 1 included) is saved on your phone and opens with no signal. A "Works offline" badge shows when it's ready.

**Content**
- All safety instructions now come from official Australian sources: NSW RFS, NSW SES, Get Ready Queensland, SecureNT, DFES WA and the Australian Warning System. They were checked on 23 Oct 2026.
- The water amount now follows Get Ready Queensland: at least 10 litres per person for three days. Version 1 said 4 litres per day, with no source.

**Version 1**
- Moved to `/v1/`. It's still online at `laika70.github.io/dews-web/v1/`.

## 1.0.0 — 2026-06

- First web demo: three cards (Stay ready, Emergency, Nearby help), tips, a checklist, three hazards and English/中文.
