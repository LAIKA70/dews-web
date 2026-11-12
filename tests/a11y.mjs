// WCAG 2.2 AA check: axe-core on every screen × light/dark × phone/tablet/desktop, plus target size (2.5.8),
// horizontal overflow (1.4.10 reflow at 320 px) and side padding. Run: AXE=path/to/axe.min.js node tests/a11y.mjs
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
const root = new URL('..', import.meta.url).pathname;
const AXE = readFileSync(process.env.AXE, 'utf8');
const srv = spawn('python3', ['-m', 'http.server', '8097', '-d', root], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
const feed = readFileSync(root + 'tests/fixtures/rfs-levels.json', 'utf8');
const routes = ['#/', '#/alert/rfs/900002', '#/alert/rfs/900003', '#/fires', '#/sos', '#/sos/h/fire', '#/sos/h/fire/leave', '#/sos/help', '#/prepare', '#/prepare/kit', '#/prepare/plan', '#/prepare/quiz', '#/learn', '#/learn/fire', '#/map', '#/map/go', '#/me', '#/me/card', '#/me/sources'];
const PAL = process.env.PAL || 'a';
const b = await chromium.launch();
const issues = {}; const add = (k, v) => { (issues[k] = issues[k] || new Set()).add(v); };
for (const [layout, size] of [['mobile', { width: 390, height: 844 }], ['mobile', { width: 320, height: 640 }], ['tablet', { width: 1024, height: 768 }], ['desktop', { width: 1280, height: 800 }]])
for (const theme of ['light', 'dark']) for (const lang of ['en', 'zh']) {
  if (size.width === 320 && theme === 'dark') continue;
  const ctx = await b.newContext({ viewport: size, geolocation: { latitude: -33.9262, longitude: 151.1925 }, permissions: ['geolocation'], serviceWorkers: 'block', colorScheme: theme, reducedMotion: 'reduce' });
  await ctx.route(/rfs\.nsw/, r => r.fulfill({ status: 200, contentType: 'application/json', body: feed }));
  await ctx.route(/openfreemap|overpass|routing\.openstreetmap/, r => r.abort());
  await ctx.addInitScript(([lang, pal]) => { if (sessionStorage.i) return; sessionStorage.i = 1; localStorage.setItem('dews2', JSON.stringify({ lang, palette: pal, tutLearn: 1, liveSeen: { 900002: 'watch' } })); localStorage.setItem('dews-nav-ok', '1'); }, [lang, PAL]);
  const page = await ctx.newPage();
  await page.goto(`http://localhost:8097/${layout}/#/`); await page.waitForTimeout(1200);
  await page.addScriptTag({ content: AXE });
  for (const r of routes) {
    await page.goto(`http://localhost:8097/${layout}/` + r); await page.waitForTimeout(450);
    const tag = `${PAL} ${layout}${size.width}/${theme}/${lang} ${r}`;
    const res = await page.evaluate(async () => {
      const a = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] });
      const v = a.violations.map(x => ({ id: x.id, n: x.nodes.slice(0, 3).map(n => n.target.join(' ') + (n.any[0] && n.any[0].data && n.any[0].data.contrastRatio ? ' ratio=' + n.any[0].data.contrastRatio + ' fg=' + n.any[0].data.fgColor + ' bg=' + n.any[0].data.bgColor : '')) }));
      const small = [...document.querySelectorAll('a[href],button,input,select,textarea,[role=link],[tabindex="0"]')].filter(e => { const s = e.getBoundingClientRect(); return s.width > 0 && s.height > 0 && (s.width < 24 || s.height < 24) && getComputedStyle(e).display !== 'inline'; })
        .slice(0, 6).map(e => (e.className || e.tagName) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height) + ' "' + (e.innerText || e.getAttribute('aria-label') || '').slice(0, 20) + '"');
      const over = document.documentElement.scrollWidth > innerWidth + 1;
      const m = document.getElementById('main'); let pad = null;
      if (m && !document.querySelector('.go')) { const cs = getComputedStyle(m); pad = parseFloat(cs.paddingLeft); }
      return { v, small, over, pad };
    }).catch(e => ({ err: String(e) }));
    if (res.err) { add('error', tag + ' ' + res.err.slice(0, 100)); continue; }
    res.v.forEach(x => add(x.id, tag + ' → ' + x.n.join(' | ')));
    res.small.forEach(x => add('target-size<24', tag + ' → ' + x));
    if (res.over) add('horizontal-scroll', tag);
    if (res.pad != null && res.pad < 16 && layout === 'mobile') add('side-padding<16', tag + ' ' + res.pad);
  }
  await ctx.close();
}
await b.close(); srv.kill();
for (const k of Object.keys(issues)) { const arr = [...issues[k]]; console.log('\n## ' + k + ' (' + arr.length + ')'); arr.slice(0, 12).forEach(x => console.log('  ' + x)); }
if (!Object.keys(issues).length) console.log('NO ISSUES');
