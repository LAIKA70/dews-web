// End-to-end checks with recorded RFS data. Run: node tests/e2e.mjs  (serves the repo on :8099)
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import { readFileSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
const root = new URL('..', import.meta.url).pathname, OUT = process.env.OUT || root + 'tests/out/';
mkdirSync(OUT, { recursive: true });
const srv = spawn('python3', ['-m', 'http.server', '8099', '-d', root], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
const fx = n => readFileSync(root + 'tests/fixtures/' + n + '.json', 'utf8');
const MASCOT = { latitude: -33.9262, longitude: 151.1925 };
const browser = await chromium.launch();
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
async function open({ feed = 'rfs-levels', lang = 'en', geo = true, layout = 'mobile', state = {}, cache = null, size = { width: 390, height: 844 } } = {}) {
  const ctx = await browser.newContext({ viewport: size, geolocation: geo ? MASCOT : undefined, permissions: geo ? ['geolocation'] : [], serviceWorkers: 'block', locale: lang === 'zh' ? 'zh-CN' : 'en-AU' });
  await ctx.route(/rfs\.nsw\.gov\.au\/feeds/, r => feed === 'fail' ? r.abort() : r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: fx(feed) }));
  await ctx.route(/openfreemap|overpass|routing\.openstreetmap|fonts\./, r => r.abort());
  await ctx.addInitScript(([lang, geo, state, cache]) => {
    if (sessionStorage.getItem('init')) return; sessionStorage.setItem('init', '1');
    localStorage.setItem('dews2', JSON.stringify(Object.assign({ lang, tutLearn: true }, state)));
    if (geo) localStorage.setItem('dews-nav-ok', '1');
    if (cache) localStorage.setItem('dews-rfs', JSON.stringify(cache));
  }, [lang, geo, state, cache]);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(`http://localhost:8099/${layout}/#/`); await page.waitForTimeout(1500);
  return { page, ctx, errs };
}
const txt = p => p.locator('body').innerText();

// 1. three levels, English, with location
{ const { page, ctx, errs } = await open();
  const sheet = page.locator('.sheet');
  ok(await sheet.count() === 1 && (await sheet.innerText()).includes('KURNELL'), 'pop-up for nearby Watch and Act (Kurnell)');
  await page.screenshot({ path: OUT + '1-popup_en.png' });
  await page.locator('.sheet [data-a="liveSeen"].btn-ghost').click(); await page.waitForTimeout(300);
  ok(await page.locator('.sheet').count() === 0, 'pop-up closes and stays closed');
  const t = await txt(page);
  ok(/Emergency Warning[\s\S]*BLACKHEATH/.test(t), 'top card: statewide Emergency Warning');
  ok(t.includes('KURNELL') && t.includes('ALEXANDRIA') && t.includes('ST MARYS') && t.includes('PORTERS HR'), 'nearby incidents listed (W&A, advice, unmapped, planned burn)');
  ok(!t.includes('WHITTINGHAM') && !t.includes('CONDOBOLIN'), 'far non-emergency hidden');
  ok(t.includes('NSW Rural Fire Service') && /checked (just now|\d+ min ago)/.test(t), 'source + checked time');
  ok(!/Sample/.test(t.split('Practice mode')[0]), 'no sample label on real warnings');
  await page.screenshot({ path: OUT + '2-home_en.png', fullPage: true });
  await page.goto('http://localhost:8099/mobile/#/alert/rfs/900002'); await page.waitForTimeout(800);
  const k = await txt(page);
  ok(k.includes('Watch and Act') && k.includes('Being controlled') && /8\.\d km/.test(k), 'Kurnell page: level, status, distance');
  ok(k.includes('Read the official warning') && /where to go/i.test(k), 'W&A: official link + where to go');
  ok(k.includes('© State of New South Wales (NSW Rural Fire Service)'), 'attribution shown');
  ok(await page.locator('a[href="https://www.rfs.nsw.gov.au/fire-information/fires-near-me"]').count() > 0, 'links to Fires Near Me');
  await page.screenshot({ path: OUT + '3-watch_en.png', fullPage: true });
  await page.goto('http://localhost:8099/mobile/#/alert/rfs/900003'); await page.waitForTimeout(600);
  const e = await txt(page);
  ok(e.includes('far from you') && !/where to go/i.test(e), 'far Emergency: no route, explains why shown');
  await page.goto('http://localhost:8099/mobile/#/alert/rfs/900004'); await page.waitForTimeout(600);
  ok((await txt(page)).includes('Exact location not mapped'), 'unmapped incident note');
  await page.goto('http://localhost:8099/mobile/#/alert/rfs/683451'); await page.waitForTimeout(600);
  const pb = await txt(page); ok(pb.includes('Planned Burn') && pb.includes('No warning level'), 'planned burn: no level');
  await page.goto('http://localhost:8099/mobile/#/alert/rfs/123'); await page.waitForTimeout(400);
  ok((await txt(page)).includes('no longer listed'), 'removed incident handled');
  ok(errs.length === 0, 'no page errors ' + errs.join(' | '));
  await ctx.close(); }

// 2. Chinese
{ const { page, ctx, errs } = await open({ lang: 'zh', state: { liveSeen: { 900002: 'watch' } } });
  const t = await txt(page);
  ok(t.includes('紧急警告') && t.includes('丛林火') && t.includes('失控'), 'zh: fixed terms translated');
  ok(t.includes('BLACKHEATH'), 'zh: place names stay English');
  await page.screenshot({ path: OUT + '4-home_zh.png', fullPage: true });
  await page.goto('http://localhost:8099/mobile/#/alert/rfs/900002'); await page.waitForTimeout(800);
  const k = await txt(page); ok(k.includes('注意并行动') && k.includes('控制中') && k.includes('阅读官方警告'), 'zh: warning page');
  await page.screenshot({ path: OUT + '5-watch_zh.png', fullPage: true });
  ok(errs.length === 0, 'zh no errors'); await ctx.close(); }

// 3. inside an Emergency Warning area
{ const { page, ctx } = await open({ feed: 'rfs-inside' });
  const s = await page.locator('.sheet').innerText().catch(() => '');
  ok(s.includes('MASCOT') && s.includes('inside the warning area'), 'inside: pop-up says you are inside');
  await page.screenshot({ path: OUT + '6-inside_en.png' }); await ctx.close(); }

// 4. no location
{ const { page, ctx } = await open({ geo: false });
  const t = await txt(page);
  ok(t.includes('BLACKHEATH') && !t.includes('KURNELL') && t.includes('Turn on location'), 'no location: statewide Emergency only + prompt');
  await ctx.close(); }

// 5. feed unreachable, old cache → stale warning
{ const old = Date.now() - 2 * 3600e3;
  const { page, ctx } = await open({ feed: 'fail', cache: { at: old, list: [] } });
  const t = await txt(page); ok(t.includes('may be out of date') && t.includes('2 hours ago'), 'stale cache flagged');
  await ctx.close(); }
{ const { page, ctx } = await open({ feed: 'fail' });
  ok((await txt(page)).includes('Couldn’t load bushfire warnings'), 'never loaded + error'); await ctx.close(); }

// 6. offline after loading
{ const { page, ctx } = await open({ state: { liveSeen: { 900002: 'watch' } } });
  await ctx.setOffline(true); await page.evaluate(() => window.dispatchEvent(new Event('offline'))); await page.waitForTimeout(400);
  ok((await txt(page)).includes('You’re offline'), 'offline flagged, warnings still shown');
  await ctx.close(); }

// 7. quiet day
{ const { page, ctx } = await open({ feed: 'rfs-quiet' });
  const t = await txt(page); ok(t.includes('No bushfire warnings within 50 km') && t.includes('PORTERS HR'), 'quiet: none + nearby planned burn row');
  await page.screenshot({ path: OUT + '7-quiet_en.png', fullPage: true }); await ctx.close(); }

// 8. practice mode still works and is labelled
{ const { page, ctx } = await open({ feed: 'rfs-quiet' });
  await page.locator('[data-a="demoAlert"]').first().click(); await page.locator('[data-a="simPick"]').nth(2).click(); await page.waitForTimeout(500);
  const t = await txt(page); ok(t.includes('Practice') && t.includes('Leave now'), 'practice mode sample labelled Practice');
  await ctx.close(); }

// 9. tablet + desktop render
for (const [layout, size] of [['tablet', { width: 1024, height: 768 }], ['desktop', { width: 1280, height: 800 }]]) {
  const { page, ctx, errs } = await open({ layout, size, state: { liveSeen: { 900002: 'watch' } } });
  ok((await txt(page)).includes('BLACKHEATH') && errs.length === 0, layout + ' renders live warnings');
  await page.screenshot({ path: OUT + `8-home_${layout}.png` }); await ctx.close(); }

// 10. screen guide "?" on every screen, both languages
{ const { page, ctx, errs } = await open({ feed: 'rfs-quiet' });
  const routes = { '#/': 'Today', '#/alert/rfs/683451': 'A real bushfire warning', '#/fires': 'Fires near you', '#/sos': 'Emergency mode', '#/sos/h/fire': 'Choose your situation', '#/sos/h/fire/leave': 'Step-by-step help', '#/sos/help': 'Ask for help', '#/prepare': 'Prepare', '#/prepare/kit': 'Emergency kit', '#/prepare/plan': 'Household plan', '#/prepare/quiz': 'Practice quiz', '#/learn': 'Learn the disasters', '#/learn/fire': 'About this disaster', '#/map': 'Nearby', '#/map/go': 'Directions', '#/me': 'Profile', '#/me/card': 'Edit your profile', '#/me/sources': 'Sources' };
  let all = true;
  for (const [r, title] of Object.entries(routes)) {
    await page.goto('http://localhost:8099/mobile/' + r); await page.waitForTimeout(350);
    await page.locator('.helptab').click(); await page.waitForTimeout(150);
    const h = await page.locator('#help-h').innerText().catch(() => '');
    if (h !== title) { all = false; console.log('  guide mismatch', r, JSON.stringify(h)); }
    if (r === '#/learn') await page.screenshot({ path: OUT + '9-guide_learn_en.png' });
    await page.keyboard.press('Escape'); await page.waitForTimeout(100);
    if (await page.locator('.help-sheet').count()) { all = false; console.log('  not closed', r); }
  }
  ok(all, 'guide opens with the right title on all 18 screens and closes with Esc');
  await page.goto('http://localhost:8099/mobile/#/'); await page.waitForTimeout(300);
  await page.locator('.helptab').click(); await page.mouse.click(200, 30); await page.waitForTimeout(150);
  ok(await page.locator('.help-sheet').count() === 0, 'tap outside closes guide');
  await page.goto('http://localhost:8099/mobile/#/learn'); await page.waitForTimeout(300);
  await page.locator('.helptab').click(); await page.locator('[data-a="helpTour"]').click(); await page.waitForTimeout(700);
  ok(await page.locator('#tut').count() === 1, 'guide can start the on-screen tour');
  ok(errs.length === 0, 'guide no errors ' + errs.join(' | ')); await ctx.close(); }
{ const { page, ctx } = await open({ feed: 'rfs-quiet', lang: 'zh' });
  await page.goto('http://localhost:8099/mobile/#/sos'); await page.waitForTimeout(400);
  await page.locator('.helptab').click(); await page.waitForTimeout(150);
  ok((await page.locator('.help-sheet').innerText()).includes('给家人报平安'), 'zh guide');
  await page.screenshot({ path: OUT + '9-guide_sos_zh.png' }); await ctx.close(); }
for (const [layout, size] of [['tablet', { width: 1024, height: 768 }], ['desktop', { width: 1280, height: 800 }]]) {
  const { page, ctx } = await open({ layout, size, feed: 'rfs-quiet' });
  await page.locator('.helptab').click(); await page.waitForTimeout(200);
  ok(await page.locator('.help-sheet').count() === 1, layout + ' guide');
  await page.screenshot({ path: OUT + `9-guide_${layout}.png` }); await ctx.close(); }

await browser.close(); srv.kill();
console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); process.exit(fails ? 1 : 0);
