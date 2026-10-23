# Changelog — DEWS web

Plain-language notes on what changed in each version.

## 2.4.1 — 2026-10-23 · Fits small phones, swipeable guide, clearer words

- **Fits small phones.** On phones about 360 px wide (many Android phones) the top bar was a little too wide, so the browser zoomed the whole page out. It now fits, and nothing on any page sticks out past the screen edge.
- **Swipe through the first-run guide.** Swipe left or right to move between cards, or use the arrow keys on a keyboard. The Next and Back buttons still work. Screen readers hear "Step 2 of 7" and the new card's title.
- **Language picked for you.** The language screen now preselects 中文 if your phone is set to Chinese.
- **"Me" is now "Profile" / 个人档案**, in the tabs, the page title and the guide. The language screen says where to change it later: Profile → Settings.
- **Clearer words in both languages.** "Works without signal" / "没有信号也能用" now says "works with no internet connection" / "没有网络也能用". The English and Chinese now say the same thing everywhere, for example the Emergency card in the guide, Kit / 应急包, Charging / 充电, Drinking water / 饮用水, and the palette names.

## 2.4.0 — 2026-10-23 · Desktop version and a start page

- **Start page** at `laika70.github.io/dews-web/`: choose **手机版 Mobile** or **电脑版 Desktop**. It recommends the one that fits your device.
- **Mobile version** is now at `/mobile/`. The installed app opens here.
- **Desktop version** at `/desktop/`: a sidebar instead of bottom tabs, and two columns on wide screens. Big map next to the place list, the emergency compass with a map beside the disaster guides, the kit calculator next to the checklist, and your profile next to settings.
- Both versions share the same code and content, so a change to one updates both. Each links to the other under Me → About.

## 2.3.0 — 2026-10-23 · Learn, MVP mode, one consistent look

- **Learn about disasters** (new, MVP 2): for bushfire, flood, storm, heatwave and earthquake: what it is, how to prepare now, and the supplies you'll need. Add supplies to your emergency kit with one tap, then pack them off in the kit checklist. Every item comes from an official source (NSW RFS, NSW SES / council, NSW Government, SecureNT, DFES WA).
- **MVP mode** (Me → MVP mode): shows only the 4 core features, Kit · Learn · Directions · Profile. In emergency mode it keeps Call 000, the live compass, the disaster guides and the "Show to others" card.
- **One consistent look**: emergency mode no longer switches to a dark screen. It follows your appearance setting and shows a red line across the top instead.
- **Frosted glass** now covers the cards too, over a soft, low-saturation background. It turns off with Me → Glass effect, or automatically if your phone is set to reduce transparency.
- The profile explains who the emergency card is for, and suggests also filling in your phone's built-in Medical ID, which works from the lock screen.

## 2.2.0 — 2026-10-23 · Personal profile and colour trial

- **Personal profile** (Me → My profile), in sections: About you, Access and mobility, Health, Emergency contact. New: uses a wheelchair, uses crutches/cane/walker, cannot use stairs, cannot walk far or fast, blind/low vision, deaf/hard of hearing, needs powered medical equipment, assistance animal, needs simple instructions, carries an EpiPen, pregnant, plus a free-text disability field.
- The profile appears in English on the emergency card and the "Show to others" card. It's included in help requests and in the text you send to contacts.
- If you use a wheelchair or walking aid, or can't use stairs, the directions screen warns that walking routes may include steps.
- **Colour palette trial** (Me → Colour palette): A Eucalypt (now the default), B Harbour, C Clear (colour-blind safe, based on Okabe–Ito), and the v2.0 original. All pass WCAG AA contrast in light and dark. This setting is temporary until a palette is chosen.

## 2.1.0 — 2026-10-23 · Directions to safety

- **First-time guide**: choose your language first, then one short screen for each part of the app (Emergency, Today, Prepare, Nearby, Me), then permission for location and compass. Everything after the first screen is in the language you chose.
- **Live compass in emergency mode**: the moment you open Emergency, a compass card points to the nearest safe place (assembly point, fire/police station or hospital). It turns as you turn your phone and says what to do: "Walk straight ahead", "Turn right", "Turn around". It shows the distance and walking time.
- **Live map**: tap the compass card for a full-screen map with your position, which way you're facing, nearby safe places and the walking route. You can pick a different place, re-centre, or rotate the map with you.
- **Real places**: hospitals, assembly points, fire and police stations and drinking water come from OpenStreetMap. They're saved on your phone, so they still work offline. Sample places are shown only when nothing else is available.
- **Walking route** when online (OpenStreetMap routing). Offline, the arrow points in a straight line and reminds you to follow roads.
- **Safety note** on every direction screen: never walk toward fire, smoke or floodwater, even if the arrow points that way. Official evacuation centres are announced by emergency services.
- **Nearby tab** now uses the live map too.
- **Glass effect** on the floating layers (tab bar, top bar, sheets, map controls). You can turn it off under Me → Glass effect. It also turns off automatically if your phone is set to reduce transparency.
- **Updates show straight away**: when you're online the app now loads the newest version first, and uses the saved copy only when offline.
- Map: OpenFreeMap tiles, MapLibre GL JS (included in the app, so it works offline). Places you've viewed on the map are cached.

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
