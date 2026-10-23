/* DEWS app — shared by the mobile and desktop versions. */
(function(){
'use strict';
var BASE = window.DEWS_BASE || '';
var DESKTOP = window.DEWS_LAYOUT === 'desktop';

/* ---------- state ---------- */
var KEY = 'dews2';
var DEFAULTS = {
  lang: null, size: 'std', theme: 'auto', glass: 'on', palette: 'a',
  kit: { people: 1, baby: false, pet: false, have: {} },
  plan: { people: [{ name: '', phone: '' }], near: '', far: '', contact: '', trigger: '' },
  card: { name: '', lang: '', blood: '', allergies: '', meds: '', conditions: '', contactName: '', contactPhone: '', address: '', disability: '', needs: {} },
  quiz: { best: null },
  demo: { alert: false, answered: false }
};
var S = load();
function load(){
  var d = JSON.parse(JSON.stringify(DEFAULTS));
  try {
    var s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (s) for (var k in d) if (s[k] !== undefined) d[k] = s[k];
    if (!d.lang) { var old = localStorage.getItem('dews-lang'); if (old === 'zh' || old === 'en') d.pre = old; }
  } catch (e) {}
  return d;
}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

/* transient */
var CI = null;             /* check-in sheet stage */
var Q = null;              /* quiz run */
var HR = null;             /* help request draft */
var heading = null;        /* compass heading in degrees */
var here = null;           /* {lat,lng} if user shared */
var swReady = false;
var filter = 'all';
var resetArmed = false;

/* ---------- helpers ---------- */
function li(){ return S.lang === 'zh' ? 1 : 0; }
function tx(a){ return a ? a[li()] : ''; }
function t(k){ return STR[k] ? STR[k][li()] : k; }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]; }); }
function linkify(s){
  return esc(s).replace(/\b000\b/g, '<a href="tel:000">000</a>').replace(/132 500/g, '<a href="tel:132500">132 500</a>');
}
function hz(id){ for (var i = 0; i < HAZARDS.length; i++) if (HAZARDS[i].id === id) return HAZARDS[i]; return null; }
function srcLine(key){
  var s = SOURCES[key]; if (!s) return '';
  return '<p class="src">' + t('source') + ': <a href="' + s.u + '" target="_blank" rel="noopener">' + esc(s.t) + '</a> · ' + t('checked') + ' ' + CONTENT_CHECKED + '</p>';
}
function toast(msg){
  var el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = msg;
  document.body.appendChild(el); setTimeout(function(){ el.remove(); }, 3200);
}
function getPath(o, p){ return p.split('.').reduce(function(a, k){ return a == null ? a : a[k]; }, o); }
function setPath(o, p, v){ var ks = p.split('.'), last = ks.pop(); var tgt = ks.reduce(function(a, k){ return a[k]; }, o); tgt[last] = v; }

/* ---------- icons ---------- */
var P = {
  fire:'<path d="M12 21a6 6 0 0 0 6-6c0-4-3-6-4-10-2 2-3 4-3 6-1-1-1.5-2-1.5-3C7 9.5 6 12 6 15a6 6 0 0 0 6 6z"/>',
  flood:'<path d="M5 11V7.5L12 3l7 4.5V11"/><path d="M2 15c2 0 2-1.5 4-1.5S8 15 10 15s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/><path d="M2 19.5c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/>',
  storm:'<path d="M7 16a4.5 4.5 0 1 1 .9-8.9A6 6 0 0 1 19 9a3.5 3.5 0 0 1-1 7"/><path d="M13 12l-3 5h4l-2 5"/>',
  heat:'<path d="M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0z"/><path d="M12 10v7"/><path d="M18 5h3M18 9h2"/>',
  quake:'<path d="M2 12h4l2-6 3 12 3-9 2 3h6"/>',
  home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
  cross:'<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
  drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
  chevR:'<path d="M9 5l7 7-7 7"/>', chevL:'<path d="M15 5l-7 7 7 7"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-4.5"/>',
  pin:'<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.5-6.5 8-6.5s7 2 8 6.5"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/>',
  torch:'<path d="M8 3h8v4l-2 3v11h-4V10L8 7z"/><path d="M12 13v2"/>',
  flash:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  whistle:'<path d="M3 10h12a5 5 0 1 1-5 5"/><path d="M3 10v4h6"/><path d="M14 6l1.5-3M18 7.5l3-1.5"/>',
  card:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="11" r="2"/><path d="M6 16c.5-1.5 1.5-2 2.5-2s2 .5 2.5 2M14 10h4M14 13h4"/>',
  msg:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8.5 10.5l2 2 4-4"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.5-5 6.5-5s5.7 1.5 6.5 5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .6 3.2 2.2 3.5 5"/>',
  bag:'<rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V5a3 3 0 0 1 6 0v2M4 12h16M12 10v4"/>',
  quiz:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17v.01"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  arrow:'<path d="M12 3l6 17-6-4-6 4z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>',
  share:'<path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6"/>',
  ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  wifi:'<path d="M2 8.5a15 15 0 0 1 20 0M5.5 12a10 10 0 0 1 13 0M9 15.5a5 5 0 0 1 6 0M12 19v.01"/><path d="M3 3l18 18"/>',
  locate:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>'
};
function ic(n, cls){ return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (P[n] || '') + '</svg>'; }
window.ICON_PATHS = P;
var MARK = '<svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#16191C"/><path d="M14 34L32 18l18 16" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 46h36" stroke="#fff" stroke-width="6" stroke-linecap="round"/><rect x="28.5" y="30" width="7" height="7" rx="1.5" fill="#E2483D"/></svg>';

/* ---------- readiness ---------- */
function kitItems(){
  var items = KIT.items.slice();
  if (S.kit.baby) items.push(KIT.baby);
  if (S.kit.pet) items.push(KIT.pet);
  return items.concat(kitExtras());
}
function kitExtras(){
  var ex = S.kit.extra || {}, out = [];
  Object.keys(LEARN).forEach(function(h){ LEARN[h].supplies.forEach(function(it){ if (ex[it[0]]) out.push(it); }); });
  return out;
}
function kitDone(){ var it = kitItems(), n = 0; it.forEach(function(i){ if (S.kit.have[i[0]]) n++; }); return { n: n, total: it.length }; }
function planDone(){
  var p = S.plan, n = 0;
  if (p.people.some(function(x){ return x.name && x.phone; })) n++;
  if (p.near) n++; if (p.far) n++; if (p.contact) n++; if (p.trigger) n++;
  return { n: n, total: 5 };
}
function cardDone(){ var c = S.card; return !!(c.name && (c.contactPhone || c.allergies || c.meds || c.blood || needList(0).length)); }
function needList(lang){ var n = (S.card.needs || {}), out = []; NEEDS.forEach(function(g){ g.items.forEach(function(i){ if (n[i[0]]) out.push(lang ? i[2] : i[1]); }); }); return out; }
function hasNeed(k){ return !!(S.card.needs && S.card.needs[k]); }
function readiness(){
  var k = kitDone(), p = planDone();
  return [
    { id: 'card', on: cardDone(), label: ['Profile', '档案'], ns: 'nsCard', href: '#/me/card' },
    { id: 'plan', on: p.n >= 3, label: ['Plan', '计划'], ns: 'nsPlan', href: '#/prepare/plan' },
    { id: 'kit', on: k.n / k.total >= 0.8, label: ['Kit', '应急包'], ns: 'nsKit', href: '#/prepare/kit' },
    { id: 'quiz', on: S.quiz.best != null, label: ['Practice', '练习'], ns: 'nsQuiz', href: '#/prepare/quiz' }
  ];
}

/* ---------- router ---------- */
function parts(){ return location.hash.replace(/^#\/?/, '').split('/').filter(Boolean); }
function render(){
  var p = parts(), main = '', top = '', dock = '', em = p[0] === 'sos';
  document.documentElement.lang = li() ? 'zh-CN' : 'en';
  document.documentElement.setAttribute('data-size', S.size);
  if (S.theme === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', S.theme);
  document.documentElement.setAttribute('data-glass', S.glass || 'on');
  if (S.palette && S.palette !== 'ink') document.documentElement.setAttribute('data-palette', S.palette); else document.documentElement.removeAttribute('data-palette');
  document.body.classList.toggle('em', em);
  document.documentElement.setAttribute('data-layout', DESKTOP ? 'desktop' : 'mobile');
  document.title = em ? 'DEWS — ' + t('sos') : 'DEWS';
  if (p[1] === 'go' && (p[0] === 'sos' || p[0] === 'map')) { document.getElementById('app').innerHTML = vGo(em); renderLayer(); after(p); return; }

  if (em) {
    var r = sosRoute(p); main = r.main; dock = r.dock || ''; top = emTop(p.length > 1 ? r.back || '#/sos' : null);
  } else {
    top = normalTop();
    if (p[0] === 'prepare') main = p[1] === 'kit' ? vKit() : p[1] === 'plan' ? vPlan() : p[1] === 'quiz' ? vQuiz() : vPrepare();
    else if (p[0] === 'map') main = vMap();
    else if (p[0] === 'learn') main = p[1] ? vLearn(p[1]) : vLearnList();
    else if (S.mvp && !p[0]) main = vKit();
    else if (p[0] === 'me') main = p[1] === 'card' ? vCardEdit() : p[1] === 'sources' ? vSources() : vMe();
    else if (p[0] === 'alert') main = vAlert();
    else main = vHome();
  }
  var tab = p[0] === 'prepare' || (S.mvp && !p[0]) ? 'prepare' : p[0] === 'learn' ? (S.mvp ? 'learn' : 'prepare') : p[0] === 'map' ? 'map' : p[0] === 'me' ? 'me' : 'home';
  var tabs = '<nav class="tabs" aria-label="Main"><div class="tabs-in">' + (S.mvp ?
    tabLink('#/prepare/kit', 'bag', t('tabKit'), tab === 'prepare') +
    tabLink('#/learn', 'quiz', t('tabLearn'), tab === 'learn') +
    tabLink('#/map', 'arrow', t('tabGo'), tab === 'map') +
    tabLink('#/me', 'user', t('tabProfile'), tab === 'me') :
    tabLink('#/', 'sun', t('tabHome'), tab === 'home') +
    tabLink('#/prepare', 'shield', t('tabPrep'), tab === 'prepare') +
    tabLink('#/map', 'pin', t('tabMap'), tab === 'map') +
    tabLink('#/me', 'user', t('tabMe'), tab === 'me')) + '</div></nav>';
  if (DESKTOP) document.getElementById('app').innerHTML = sidebar(p, em) + '<div class="dmain">' + (em ? top : '') + '<main class="wrap" id="main" tabindex="-1">' + offlineBar() + main + '</main>' + (em ? dock : '') + '</div>';
  else document.getElementById('app').innerHTML = top + '<main class="wrap" id="main" tabindex="-1">' + offlineBar() + main + '</main>' + (em ? dock : tabs);
  renderLayer();
  after(p);
}
function sidebar(p, em){
  var cur = em ? 'sos' : p[0] === 'learn' ? 'learn' : p[0] === 'prepare' ? (S.mvp ? 'kit' : 'prepare') : p[0] === 'map' ? 'map' : p[0] === 'me' ? 'me' : (S.mvp ? 'kit' : 'home');
  var items = S.mvp ? [['kit', '#/prepare/kit', 'bag', 'tabKit'], ['learn', '#/learn', 'quiz', 'tabLearn'], ['map', '#/map', 'arrow', 'tabGo'], ['me', '#/me', 'user', 'tabProfile']]
    : [['home', '#/', 'sun', 'tabHome'], ['prepare', '#/prepare', 'shield', 'tabPrep'], ['learn', '#/learn', 'quiz', 'tabLearn'], ['map', '#/map', 'pin', 'tabMap'], ['me', '#/me', 'user', 'tabMe']];
  return '<aside class="side glass"><div class="side-brand"><a class="brand" href="#/">DEWS</a><span class="chip">' + t('desktopLabel') + '</span></div>' + offChip() +
    '<a class="sosbtn side-sos" href="#/sos"' + (cur === 'sos' ? ' aria-current="page"' : '') + '>' + ic('alert') + t('sos') + '</a>' +
    '<nav class="side-nav" aria-label="Main">' + items.map(function(x){ return '<a href="' + x[1] + '"' + (cur === x[0] ? ' class="on" aria-current="page"' : '') + '>' + ic(x[2]) + '<span>' + t(x[3]) + '</span></a>'; }).join('') + '</nav>' +
    '<div class="side-foot"><button class="iconbtn" data-a="set" data-k="lang" data-v="' + (li() ? 'en' : 'zh') + '">' + ic('globe') + (li() ? 'English' : '中文') + '</button>' +
    '<a class="iconbtn" href="' + BASE + 'mobile/">' + ic('phone') + t('mobileLink') + '</a></div></aside>';
}
function mapOvl(){ return NAV.mapState() === 'failed' ? '<div class="ovl">' + t('mapFailed') + '</div>' : NAV.mapState() !== 'ready' ? '<div class="ovl">' + t('mapLoading') + '</div>' : ''; }
function tabLink(h, i, l, on){ return '<a href="' + h + '"' + (on ? ' class="on" aria-current="page"' : '') + '>' + ic(i) + '<span>' + l + '</span></a>'; }
function offChip(){
  if (!('serviceWorker' in navigator)) return '';
  return swReady ? '<span class="chip ok">' + ic('check') + t('offlineReady') + '</span>' : '<span class="chip">' + t('offlineNot') + '</span>';
}
function offlineBar(){ return navigator.onLine === false ? '<div class="offbar">' + ic('wifi') + t('youreOffline') + '</div>' : ''; }
function normalTop(){
  return '<header class="top"><a class="brand" href="#/" aria-label="DEWS home">DEWS</a>' + offChip() + '<span class="sp"></span>' +
    '<a class="sosbtn" href="#/sos">' + ic('alert') + t('sos') + '</a></header>';
}
function emTop(back){
  return '<header class="top">' +
    (back ? '<a class="iconbtn" href="' + back + '">' + ic('chevL') + t('back') + '</a>' : '<a class="iconbtn" href="#/">' + ic('x') + t('exitEmergency') + '</a>') +
    '<span class="sp"></span><span class="em-label">' + t('sos') + '</span></header>';
}

/* ---------- HOME ---------- */
function dateLine(){
  try { return new Date().toLocaleDateString(li() ? 'zh-CN' : 'en-AU', { weekday: 'long', day: 'numeric', month: 'long' }); } catch (e) { return ''; }
}
function alertCard(){
  if (S.demo.alert) {
    var a = SAMPLE_ALERT, L = LEVELS[a.level], h = hz(a.hazard);
    return '<a class="alert lv-' + a.level + '" href="#/alert">' +
      '<div class="alert-band">' + ic(h.icon) + esc(tx(L.name)) + '<span class="chip sample">' + t('sample') + '</span></div>' +
      '<div class="alert-body"><div class="alert-act">' + esc(tx(a.action)) + '</div>' +
      '<div class="alert-meta">' + esc(tx(h.name)) + ' · ' + esc(tx(a.area)) + ' · ' + t('issued') + ' ' + a.issued + '</div>' +
      meter(a.level) + '</div></a>';
  }
  return '<div class="alert none"><div class="alert-body">' + ic('check') + '<div class="grow"><h2>' + t('noWarnings') + '</h2>' +
    '<p class="small">' + t('sampleData') + '</p>' +
    '<button class="textlink" data-a="demoAlert">' + t('demoAlert') + ic('chevR') + '</button></div></div></div>';
}
function meter(level){
  var n = level === 'emergency' ? 3 : level === 'watch' ? 2 : 1;
  var ks = ['advice', 'watch', 'emergency'];
  return '<div class="meter" aria-hidden="true">' + [1, 2, 3].map(function(i){ return '<i class="' + (i <= n ? 'f' + i : '') + '"></i>'; }).join('') + '</div>' +
    '<div class="meter-l">' + ks.map(function(k, i){ return '<span class="' + (i + 1 === n ? 'on' : '') + '">' + esc(tx(LEVELS[k].name)) + '</span>'; }).join('') + '</div>';
}
function vHome(){
  var R = readiness(), on = R.filter(function(r){ return r.on; }).length, nx = R.filter(function(r){ return !r.on; })[0];
  return '<div class="page-head"><p class="eyebrow">' + esc(dateLine()) + '</p><h1>' + t('yourArea') + '</h1></div>' +
    (DESKTOP ? '<div class="dgrid"><div>' : '') + alertCard() +
    '<a class="em-entry" href="#/sos">' + ic('alert', 'lg') + '<div class="grow"><b>' + t('imIn') + '</b><span>' + t('imInSub') + '</span></div>' + ic('chevR') + '</a>' +
    (DESKTOP ? '<h2 class="label">' + t('numbers') + '</h2>' + numbers() + '</div><div>' : '') +
    '<h2 class="label"' + (DESKTOP ? ' style="margin-top:0"' : '') + '>' + t('readiness') + '</h2>' +
    '<section class="card"><div class="between"><span class="ready-num">' + on + '<small> / 4</small></span></div>' +
    '<div class="segs">' + R.map(function(r){ return '<a class="seg' + (r.on ? ' on' : '') + '" href="' + r.href + '"><i></i><span>' + tx(r.label) + '</span></a>'; }).join('') + '</div>' +
    (nx ? '<a class="next" href="' + nx.href + '"><div class="grow"><span class="eyebrow">' + t('nextStep') + '</span>' + t(nx.ns) + '</div>' + ic('chevR') + '</a>'
        : '<div class="next"><div class="grow">' + t('nsDone') + '</div></div>') + '</section>' +
    (DESKTOP ? '</div></div>' : '<h2 class="label">' + t('numbers') + '</h2>' + numbers());
}
function numbers(){
  return '<a class="num red" href="tel:000"><span class="num-n">000</span><span class="grow">' + t('n000') + '</span>' + ic('phone') + '</a>' +
    '<a class="num" href="tel:132500"><span class="num-n">132 500</span><span class="grow">' + t('n132') + '</span>' + ic('phone') + '</a>';
}

/* ---------- ALERT DETAIL ---------- */
function vAlert(){
  if (!S.demo.alert) return vHome();
  var a = SAMPLE_ALERT, L = LEVELS[a.level], h = hz(a.hazard);
  return '<div class="page-head"><a class="iconbtn" href="#/">' + ic('chevL') + t('back') + '</a></div>' +
    '<h1 class="sr">' + esc(tx(L.name)) + ' — ' + esc(tx(h.name)) + '</h1>' +
    '<div class="alert lv-' + a.level + '"><div class="alert-band">' + ic(h.icon) + esc(tx(L.name)) + '<span class="chip sample">' + t('sample') + '</span></div>' +
    '<div class="alert-body"><div class="alert-act">' + esc(tx(a.action)) + '</div>' +
    '<div class="alert-meta">' + esc(tx(h.name)) + ' · ' + esc(tx(a.area)) + ' · ' + t('issued') + ' ' + a.issued + '</div>' + meter(a.level) +
    '<p style="margin-top:16px">' + esc(tx(L.desc)) + '</p></div></div>' +
    '<div class="stack" style="margin-top:16px">' +
    '<a class="btn btn-lg btn-red" href="#/sos/h/' + h.id + '">' + t('whatToDo') + ic('chevR') + '</a>' +
    '<button class="btn btn-line" data-a="checkin">' + t('affectedQ') + '</button></div>' +
    srcLine('aws');
}

/* ---------- CHECK-IN SHEET (the app asks you) ---------- */
function checkinSheet(){
  var a = SAMPLE_ALERT, h = hz(a.hazard), L = LEVELS[a.level];
  if (CI === 'help') {
    return '<div class="scrim"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="ci-h">' +
      '<span class="chip sample">' + t('sample') + '</span><h2 id="ci-h">' + t('needHelpQ') + '</h2>' +
      '<a class="btn btn-lg btn-red" href="#/sos/help" data-a="ciClose">' + ic('users') + t('needHelp') + '</a>' +
      '<button class="btn btn-lg btn-green" data-a="ciSafe">' + ic('msg') + t('imSafe') + '</button>' +
      '<button class="btn btn-ghost" data-a="ciClose">' + t('close') + '</button></div></div>';
  }
  return '<div class="scrim"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="ci-h">' +
    '<span class="chip sample">' + t('sample') + '</span>' +
    '<p class="small" style="margin-top:12px">' + esc(tx(L.name)) + ' · ' + esc(tx(h.name)) + ' · ' + esc(tx(a.area)) + '</p>' +
    '<h2 id="ci-h">' + t('affectedQ') + '</h2>' +
    '<button class="btn btn-lg btn-primary" data-a="ciYes">' + t('yes') + '</button>' +
    '<button class="btn btn-lg btn-line" data-a="ciNo">' + t('no') + '</button></div></div>';
}

/* ---------- EMERGENCY MODE ---------- */
function sosRoute(p){
  if (p[1] === 'h') {
    var h = hz(p[2]); if (!h) return { main: vSos() };
    if (p[3]) return vSteps(h, p[3]);
    return { main: vFork(h) };
  }
  if (p[1] === 'help') return p[2] === 'sent' ? vSent() : vHelp();
  return { main: vSos(), back: null };
}
function vSos(){
  var ctx = S.demo.alert && !S.mvp ? hz(SAMPLE_ALERT.hazard) : null;
  var list = HAZARDS.slice();
  if (ctx) list.sort(function(a, b){ return (b.id === ctx.id) - (a.id === ctx.id); });
  return (DESKTOP ? '<div class="dgrid"><div class="sticky">' : '') + (ctx ? '<a class="ctx-strip" href="#/sos/h/' + ctx.id + '">' + ic(ctx.icon) + '<span class="grow">' + esc(tx(LEVELS[SAMPLE_ALERT.level].name)) + ' · ' + esc(tx(ctx.name)) + ' — ' + esc(tx(SAMPLE_ALERT.action)) + '</span><span class="chip sample">' + t('sample') + '</span></a>' : '') +
    '<div class="em-actions"><a class="emb red" href="tel:000">' + ic('phone') + t('emCall') + '</a>' + guideCard() +
    (DESKTOP ? '</div><div class="mapbox" id="mapSlot">' + mapOvl() + '</div></div><div><div class="em-actions">' : '') +
    (S.mvp ? '' : '<div class="em-two"><button class="emb" data-a="safe">' + ic('msg', 'lg') + t('emSafe') + '</button>' +
    '<a class="emb" href="#/sos/help">' + ic('users', 'lg') + t('emHelp') + '</a></div>') + '</div>' +
    '<h1 class="em-h"' + (DESKTOP && S.mvp ? ' style="margin-top:0"' : '') + '>' + t('emTitle') + '</h1>' +
    list.map(function(h){
      var on = ctx && ctx.id === h.id;
      return '<a class="hz' + (on ? ' ctx' : '') + '" href="#/sos/h/' + h.id + '">' + ic(h.icon) + '<span>' + esc(tx(h.name)) + '</span>' + (on ? '<span class="tag">' + t('sample') + '</span>' : '<span class="chev">' + ic('chevR') + '</span>') + '</a>';
    }).join('') +
    (S.mvp ? '<button class="link-row" style="margin-top:12px;width:100%;text-align:left" data-a="tool" data-t="card"><span class="badge">' + ic('card') + '</span><span class="grow"><span class="t">' + t('showCard') + '</span></span></button>' : '<h2 class="label">' + t('emTools') + '</h2>' +
    '<div class="tools">' +
    '<button class="tool" data-a="tool" data-t="torch">' + ic('torch', 'lg') + t('torch') + '</button>' +
    '<button class="tool" data-a="tool" data-t="flash">' + ic('flash', 'lg') + t('sosFlash') + '</button>' +
    '<button class="tool" data-a="tool" data-t="whistle">' + ic('whistle', 'lg') + t('whistle') + '</button>' +
    '<button class="tool" data-a="tool" data-t="card">' + ic('card', 'lg') + t('showCard') + '</button></div>') + (DESKTOP ? '</div></div>' : '');
}
function vFork(h){
  return '<div class="hz-head">' + ic(h.icon, 'xl') + '<h1>' + esc(tx(h.name)) + '</h1></div>' +
    '<p class="fork-q">' + esc(tx(h.fork.q)) + '</p>' +
    '<div class="fork">' + h.fork.options.map(function(o){
      return '<a class="fork-o" href="#/sos/h/' + h.id + '/' + o.id + '"><span>' + esc(tx(o.label)) + '</span><span class="kind k-' + o.kind + '">' + esc(tx(KINDS[o.kind])) + '</span></a>';
    }).join('') + '</div>' + srcLine(h.src);
}
function vSteps(h, oid){
  var o = h.fork.options.filter(function(x){ return x.id === oid; })[0];
  if (!o) return { main: vFork(h) };
  var st = o.steps;
  return {
    back: '#/sos/h/' + h.id,
    main: '<h1 class="hz-mini">' + ic(h.icon) + esc(tx(h.name)) + '<span class="kind k-' + o.kind + '">' + esc(tx(KINDS[o.kind])) + '</span></h1>' +
      '<div class="now" aria-live="polite"><span class="now-l">' + t('doNow') + '</span><p>' + linkify(tx(st[0])) + '</p></div>' +
      (st.length > 1 ? '<h2 class="label">' + t('then') + '</h2><ol class="steps" style="margin-top:0">' + st.slice(1).map(function(s, i){
        return '<li><span class="n">' + (i + 2) + '</span><p>' + linkify(tx(s)) + '</p></li>'; }).join('') + '</ol>' : '') +
      '<a class="textlink" href="#/sos/h/' + h.id + '">' + ic('chevL') + t('otherOption') + '</a>' + srcLine(h.src),
    dock: dockCall()
  };
}
function dockCall(extra){
  return '<aside class="dock" aria-label="000"><div class="dock-in">' + (extra || '') + '<a class="btn btn-red" href="tel:000">' + ic('phone') + t('emCall') + '</a></div></aside>';
}

/* help request */
function hrInit(){ if (!HR) HR = { inj: null, people: 1, needs: {}, note: '', loc: true, card: true }; }
function vHelp(){
  hrInit();
  var needs = [['water', 'drop', 'needWater'], ['food', 'bag', 'needFood'], ['meds', 'cross', 'needMeds'], ['shelter', 'home', 'needShelter'], ['transport', 'arrow', 'needTransport'], ['power', 'bolt', 'needPower']];
  return {
    main: '<div class="page-head"><h1>' + t('hrTitle') + '</h1></div>' +
      '<div class="callout demo">' + ic('alert') + '<span>' + t('hrDemo') + '</span></div>' +
      '<div class="field"><span>' + t('hrInjured') + '</span><div class="seg-ctl danger">' +
      [['none', 'injNone'], ['minor', 'injMinor'], ['serious', 'injSerious']].map(function(x){
        return '<button class="sel-' + x[0] + '" data-a="hrInj" data-v="' + x[0] + '" aria-pressed="' + (HR.inj === x[0]) + '">' + t(x[1]) + '</button>'; }).join('') + '</div></div>' +
      (HR.inj === 'serious' ? '<div class="callout red" style="margin-top:12px">' + ic('alert') + '<div class="grow"><b>' + t('seriousCall') + '</b><a class="btn btn-red" style="margin-top:12px" href="tel:000">' + ic('phone') + t('emCall') + '</a></div></div>' : '') +
      '<div class="field"><span>' + t('hrPeople') + '</span><div class="stepper"><button data-a="hrPeople" data-d="-1" aria-label="−">' + ic('minus') + '</button><output aria-live="polite">' + HR.people + '</output><button data-a="hrPeople" data-d="1" aria-label="+">' + ic('plus') + '</button></div></div>' +
      '<div class="field"><span>' + t('hrNeed') + '</span><div class="chips">' + needs.map(function(n){
        return '<button class="pick" data-a="hrNeed" data-v="' + n[0] + '" aria-pressed="' + !!HR.needs[n[0]] + '">' + (HR.needs[n[0]] ? ic('check') : ic(n[1])) + t(n[2]) + '</button>'; }).join('') + '</div></div>' +
      '<label class="field"><span>' + t('hrNote') + '</span><textarea class="input" data-hr="note" placeholder="' + esc(t('hrNotePh')) + '">' + esc(HR.note) + '</textarea></label>' +
      '<div class="field"><button class="toggle" data-a="hrToggle" data-v="loc" aria-pressed="' + HR.loc + '"><span class="grow">' + t('hrShareLoc') + '</span><span class="sw"></span></button>' +
      '<button class="toggle" data-a="hrToggle" data-v="card" aria-pressed="' + HR.card + '"><span class="grow">' + t('hrIncludeCard') + '</span><span class="sw"></span></button>' +
      (HR.card && needList(0).length ? '<div class="callout" style="margin-top:8px">' + ic('user') + '<span>' + t('profileShared') + ' ' + esc(needList(li()).join(li() ? '、' : '; ')) + '</span></div>' : '') + '</div>',
    dock: '<div class="dock"><div class="dock-in"><button class="btn btn-primary" data-a="hrSend">' + t('hrSend') + '</button></div></div>'
  };
}
function vSent(){
  hrInit();
  var injLabel = HR.inj ? t({ none: 'injNone', minor: 'injMinor', serious: 'injSerious' }[HR.inj]) : '—';
  var nmap = { water: 'needWater', food: 'needFood', meds: 'needMeds', shelter: 'needShelter', transport: 'needTransport', power: 'needPower' };
  var needs = Object.keys(HR.needs).filter(function(k){ return HR.needs[k]; }).map(function(k){ return t(nmap[k]); }).join(li() ? '、' : ', ') || '—';
  return {
    back: '#/sos',
    main: '<div class="sent-check">' + ic('check') + '</div><h1>' + t('hrSent') + '</h1>' +
      '<p class="sub">' + t('hrSentTo') + '</p>' +
      '<div class="eta"><span class="eyebrow">' + t('hrEta') + '</span><div class="eta-v">' + t('hrEtaVal') + '</div>' +
      '<span class="chip sample">' + t('sample') + '</span><p class="small" style="margin-top:8px">' + t('hrEtaNote') + '</p></div>' +
      '<dl class="kv card" style="margin-top:12px"><dt>' + t('hrInjured') + '</dt><dd>' + injLabel + '</dd><dt>' + t('hrPeople') + '</dt><dd>' + HR.people + '</dd>' +
      '<dt>' + t('hrNeed') + '</dt><dd>' + esc(needs) + '</dd>' + (HR.card && needList(0).length ? '<dt>' + t('profileTitle') + '</dt><dd>' + esc(needList(li()).join(li() ? '、' : '; ')) + '</dd>' : '') + (HR.coords ? '<dt>' + t('safeWhere') + '</dt><dd>' + HR.coords + '</dd>' : '') + '</dl>' +
      '<h2 class="label">' + t('hrWhile') + '</h2><ul class="bullets"><li>' + t('hrWhile1') + '</li><li>' + t('hrWhile2') + '</li><li>' + linkify(t('hrWhile3')) + '</li></ul>' +
      '<button class="btn btn-line" style="margin-top:16px" data-a="hrSms">' + ic('msg') + t('hrAlsoSms') + '</button>',
    dock: dockCall()
  };
}

/* ---------- LEARN ---------- */
function learnCount(id){ var ex = S.kit.extra || {}, L = LEARN[id]; return L.supplies.filter(function(it){ return ex[it[0]]; }).length; }
function learnDone(){ return HAZARDS.filter(function(h){ return learnCount(h.id) === LEARN[h.id].supplies.length; }).length; }
function vLearnList(){
  return '<div class="page-head"><h1>' + t('learnTitle') + '</h1><p class="sub">' + t('learnSub') + '</p></div><div class="stack">' +
    HAZARDS.map(function(h){
      var n = learnCount(h.id), tot = LEARN[h.id].supplies.length;
      return '<a class="link-row" href="#/learn/' + h.id + '"><span class="badge">' + ic(h.icon) + '</span><span class="grow"><span class="t">' + esc(tx(h.name)) + '</span><br><span class="d">' + n + ' / ' + tot + ' ' + t('learnAdded') + '</span></span><span class="chev">' + ic('chevR') + '</span></a>';
    }).join('') + '</div>';
}
function vLearn(id){
  var h = hz(id), L = LEARN[id]; if (!h || !L) return vLearnList();
  var ex = S.kit.extra || {}, all = L.supplies.every(function(it){ return ex[it[0]]; });
  return backTo('#/learn') + '<div class="hz-head">' + ic(h.icon, 'xl') + '<h1>' + esc(tx(h.name)) + '</h1></div>' +
    '<h2 class="label" style="margin-top:8px">' + t('learnWhat') + '</h2><div class="card"><p>' + esc(tx(L.what)) + '</p></div>' +
    '<h2 class="label">' + t('learnPrep') + '</h2><div class="card"><ul class="bullets">' + L.prep.map(function(x){ return '<li>' + esc(tx(x)) + '</li>'; }).join('') + '</ul></div>' +
    '<h2 class="label">' + t('learnSupplies') + '</h2><div class="card" style="padding-top:4px;padding-bottom:4px">' + L.supplies.map(function(it, i){
      return '<button class="check" style="' + (i === 0 ? 'border-top:0' : '') + '" data-a="learnItem" data-v="' + it[0] + '" aria-pressed="' + !!ex[it[0]] + '"><span class="bx">' + ic('check') + '</span><span class="tx" style="color:var(--ink)">' + esc(li() ? it[2] : it[1]) + '</span></button>';
    }).join('') + '</div>' +
    '<button class="btn ' + (all ? 'btn-line' : 'btn-primary') + '" style="margin-top:12px" data-a="learnAll" data-v="' + id + '">' + ic(all ? 'check' : 'bag') + (all ? t('learnAdded') : t('learnAddAll')) + '</button>' +
    '<a class="link-row" style="margin-top:12px" href="#/sos/h/' + id + '"><span class="badge" style="background:var(--red);color:var(--on-red)">' + ic('alert') + '</span><span class="grow"><span class="t">' + t('learnDuring') + '</span></span><span class="chev">' + ic('chevR') + '</span></a>' +
    L.src.map(srcLine).join('');
}

/* ---------- PREPARE ---------- */
function vPrepare(){
  var k = kitDone(), p = planDone(), q = S.quiz.best;
  function pc(href, icon, title, sub, n, total, meta){
    return '<a class="prep-card" href="' + href + '"><div class="row"><span class="badge">' + ic(icon) + '</span><div class="grow"><h2>' + title + '</h2><p class="small">' + sub + '</p></div>' + ic('chevR') + '</div>' +
      '<div class="bar"><i style="width:' + Math.round(n / total * 100) + '%"></i></div><p class="meta">' + meta + '</p></a>';
  }
  return '<div class="page-head"><h1>' + t('prepTitle') + '</h1><p class="sub">' + t('prepSub') + '</p></div>' +
    pc('#/prepare/kit', 'bag', t('kitTitle'), t('kitSub'), k.n, k.total, k.n + ' / ' + k.total + ' ' + t('kitHave')) +
    pc('#/learn', 'quiz', t('learnTitle'), t('learnSub'), learnDone(), HAZARDS.length, learnDone() + ' / ' + HAZARDS.length) +
    pc('#/prepare/plan', 'users', t('planTitle'), t('planSub'), p.n, p.total, p.n + ' / ' + p.total) +
    pc('#/prepare/quiz', 'quiz', t('quizTitle'), t('quizSub'), q == null ? 0 : q, QUIZ.length, q == null ? '— / ' + QUIZ.length : q + ' / ' + QUIZ.length);
}
function backTo(h){ return '<div class="page-head" style="padding-bottom:0"><a class="iconbtn" href="' + h + '">' + ic('chevL') + t('back') + '</a></div>'; }
function vKit(){
  var items = kitItems(), water = KIT.waterPerPerson * S.kit.people;
  return (S.mvp ? '' : backTo('#/prepare')) + '<div class="page-head"><h1>' + t('kitTitle') + '</h1><p class="sub">' + t('kitSub') + '</p></div>' +
    (DESKTOP ? '<div class="dgrid"><div class="sticky">' : '') + '<section class="card"><div class="calc"><span style="font-weight:650">' + t('kitPeople') + '</span>' +
    '<div class="stepper"><button data-a="kitPeople" data-d="-1" aria-label="−">' + ic('minus') + '</button><output aria-live="polite">' + S.kit.people + '</output><button data-a="kitPeople" data-d="1" aria-label="+">' + ic('plus') + '</button></div></div>' +
    '<button class="toggle" data-a="kitToggle" data-v="baby" aria-pressed="' + S.kit.baby + '"><span class="grow">' + t('kitBaby') + '</span><span class="sw"></span></button>' +
    '<button class="toggle" data-a="kitToggle" data-v="pet" aria-pressed="' + S.kit.pet + '"><span class="grow">' + t('kitPet') + '</span><span class="sw"></span></button>' +
    '<div class="water"><b>' + water + '</b><span style="font-weight:650">' + t('kitLitres') + '</span><span class="small" style="width:100%">' + t('kitWater') + ' · ' + KIT.waterPerPerson + ' L × ' + S.kit.people + '</span></div></section>' +
    (DESKTOP ? '</div><div>' : '') + '<section style="margin-top:' + (DESKTOP ? 0 : 16) + 'px">' + items.map(function(i, n){
      var on = !!S.kit.have[i[0]], firstEx = kitExtras().length && i === kitExtras()[0] || (kitExtras()[0] && i[0] === kitExtras()[0][0]);
      return (firstEx ? '<h2 class="label">' + t('kitExtra') + '</h2>' : '') + '<button class="check" data-a="kitItem" data-v="' + i[0] + '" aria-pressed="' + on + '"><span class="bx">' + ic('check') + '</span><span class="tx">' + esc(li() ? i[2] : i[1]) + '</span>' + (i[0] === 'water' ? '<span class="qty">' + water + ' L</span>' : '') + '</button>';
    }).join('') + '</section>' + srcLine('kit') +
    (S.mvp ? '' : '') + '<a class="link-row" style="margin-top:16px" href="#/learn"><span class="badge">' + ic('quiz') + '</span><span class="grow"><span class="t">' + t('learnTitle') + '</span><br><span class="d">' + t('learnSub') + '</span></span><span class="chev">' + ic('chevR') + '</span></a>' + (DESKTOP ? '</div></div>' : '');
}
function vPlan(){
  var p = S.plan;
  function fld(key, label, ph){ return '<label class="field"><span>' + label + '</span><input class="input" data-bind="plan.' + key + '" value="' + esc(p[key]) + '" placeholder="' + esc(ph) + '"></label>'; }
  return backTo('#/prepare') + '<div class="page-head"><h1>' + t('planTitle') + '</h1><p class="sub">' + t('planSub') + '</p></div>' +
    '<section class="card"><h2>' + t('planPeople') + '</h2>' + p.people.map(function(x, i){
      return '<div class="person"><input class="input" aria-label="' + t('planName') + '" placeholder="' + t('planName') + '" data-bind="plan.people.' + i + '.name" value="' + esc(x.name) + '">' +
        '<input class="input" type="tel" inputmode="tel" aria-label="' + t('planPhone') + '" placeholder="' + t('planPhone') + '" data-bind="plan.people.' + i + '.phone" value="' + esc(x.phone) + '">' +
        '<button class="rm" data-a="planRm" data-i="' + i + '" aria-label="Remove">' + ic('x') + '</button></div>';
    }).join('') + '<button class="textlink" data-a="planAdd">' + ic('plus') + t('planAdd') + '</button></section>' +
    '<section class="card" style="margin-top:12px">' +
    fld('near', t('planMeetNear'), t('planMeetNearPh')) + fld('far', t('planMeetFar'), t('planMeetFarPh')) +
    fld('contact', t('planContact'), t('planContactPh')) + fld('trigger', t('planTrigger'), t('planTriggerPh')) + '</section>' +
    '<button class="btn btn-primary" style="margin-top:16px" data-a="planShare">' + ic('share') + t('planShare') + '</button>' + srcLine('fire');
}
function vQuiz(){
  var head = backTo('#/prepare');
  if (!Q) {
    return head + '<div class="page-head"><h1>' + t('quizTitle') + '</h1><p class="sub">' + t('quizSub') + '</p></div>' +
      (S.quiz.best != null ? '<p class="small">' + t('quizScore') + ' ' + S.quiz.best + ' / ' + QUIZ.length + '</p>' : '') +
      '<button class="btn btn-lg btn-primary" style="margin-top:16px" data-a="quizStart">' + t('quizStart') + '</button>';
  }
  if (Q.i >= QUIZ.length) {
    return head + '<div class="score">' + Q.score + '<small style="font-size:1.5rem;color:var(--ink-3)"> / ' + QUIZ.length + '</small></div>' +
      '<p class="sub">' + t('quizScore') + '</p><button class="btn btn-lg btn-primary" style="margin-top:24px" data-a="quizStart">' + t('quizAgain') + '</button>' +
      '<a class="btn btn-ghost" href="#/prepare" style="margin-top:8px">' + t('done') + '</a>';
  }
  var q = QUIZ[Q.i], picked = Q.picked;
  return head + '<div class="qprog" aria-label="' + (Q.i + 1) + ' / ' + QUIZ.length + '">' + QUIZ.map(function(_, i){ return '<i class="' + (i < Q.i || (i === Q.i && picked != null) ? 'done' : '') + '"></i>'; }).join('') + '</div>' +
    '<p class="qq">' + esc(tx(q.q)) + '</p>' +
    q.a.map(function(a, i){
      var cls = picked == null ? '' : i === q.ok ? ' right' : i === picked ? ' wrong' : '';
      var mark = picked == null ? '' : i === q.ok ? ic('check') : i === picked ? ic('x') : '';
      return '<button class="qa' + cls + '" data-a="quizPick" data-i="' + i + '"' + (picked != null ? ' disabled' : '') + '>' + esc(tx(a)) + mark + '</button>';
    }).join('') +
    (picked != null ? '<div class="why" aria-live="polite"><b>' + (picked === q.ok ? t('quizCorrect') : t('quizWrong')) + '</b>' + esc(tx(q.why)) + srcLine(q.src) + '</div>' +
      '<button class="btn btn-lg btn-primary" style="margin-top:16px" data-a="quizNext">' + t('next') + '</button>' : '');
}

/* ---------- MAP & GUIDANCE ---------- */
function dirName(b){ var n = li() ? ['北', '东北', '东', '东南', '南', '西南', '西', '西北'] : ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']; return n[Math.round(b / 45) % 8]; }
function fmtDist(m){ if (m == null) return '—'; return m < 1000 ? Math.round(m / 10) * 10 + ' m' : (m / 1000).toFixed(1) + ' km'; }
function placeName(p){ var n = li() ? (p.nameZh || p.name) : (p.name || p.nameZh); return n || tx((PLACE_TYPES[p.type] || {}).name); }
function relText(g){
  if (g.d < 25) return t('arrived');
  if (g.rel == null) {
    var names = li() ? ['北', '东北', '东', '东南', '南', '西南', '西', '西北'] : ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];
    var n = names[Math.round(g.b / 45) % 8]; return t('dHead') + (li() ? '' : ' ') + n + t('dHeadSuffix');
  }
  var r = g.rel;
  return t(r <= 20 || r >= 340 ? 'dStraight' : r < 60 ? 'dBearR' : r < 120 ? 'dRight' : r < 160 ? 'dBackR' : r <= 200 ? 'dAround' : r < 240 ? 'dBackL' : r < 300 ? 'dLeft' : 'dBearL');
}
function distLine(g){ return fmtDist(g.d) + ' · ' + g.mins + ' ' + t('minWalk') + ' · ' + (g.viaRoute ? t('viaRoute') : t('straight')); }
function dialHTML(){
  var ticks = ''; for (var i = 0; i < 12; i++) ticks += '<i style="transform:rotate(' + (i * 30) + 'deg)"></i>';
  return '<div class="dial" aria-hidden="true"><div class="dial-ring" data-live="ring">' + ticks + '<b>N</b></div>' +
    '<div class="needle off" data-live="needle"><svg viewBox="0 0 24 24"><path d="M12 2l7 19-7-4-7 4z"/></svg></div></div>';
}
function srcNote(){
  var s = NAV.state.src;
  return (s === 'osm' ? t('srcOsm') : s === 'cache' ? t('srcCache') : t('srcSample')) + ' ' + t('officialNote');
}
function guideBody(){
  var st = NAV.state, g = NAV.guide();
  if (!st.pos) {
    if (st.loc === 'denied' || st.loc === 'unavailable') return '<span class="eyebrow">' + t('guideTitle') + '</span><p class="tname">' + t('guideDenied') + '</p>';
    if (st.loc === 'asking') return '<span class="eyebrow">' + t('guideTitle') + '</span><p class="instr">' + t('guideLocating') + '</p>';
    return '<span class="eyebrow">' + t('guideTitle') + '</span><p class="tname">' + t('guideEnableSub') + '</p><button class="btn btn-green" data-a="navEnable">' + ic('locate') + t('guideEnable') + '</button>';
  }
  if (!g) return '<span class="eyebrow">' + t('guideTitle') + '</span><p class="instr">' + t('guideLocating') + '</p>';
  return '<span class="eyebrow">' + t('guideTitle') + ' · ' + esc(tx(PLACE_TYPES[g.t.p.type].name)) + '</span>' +
    '<p class="instr" data-live="instr">' + esc(relText(g)) + '</p>' +
    '<p class="tname">' + esc(placeName(g.t.p)) + (g.t.p.sample ? ' <span class="chip sample">' + t('sample') + '</span>' : '') + '</p>' +
    '<p class="meta2" data-live="dist">' + distLine(g) + '</p>' +
    (st.compass === 'needs-tap' ? '<button class="btn btn-line" data-a="navEnable">' + ic('arrow') + t('compassTap') + '</button>' :
     st.compass === 'unavailable' ? '<p class="small">' + t('compassNone') + '</p>' : '');
}
function guideCard(){ return '<div class="guide" data-a="openGo" role="link" tabindex="0" aria-label="' + t('openMap') + '">' + dialHTML() + '<div class="grow">' + guideBody() + '</div></div>'; }
function rot(el, deg){
  var prev = el._a == null ? deg : el._a, d = ((deg - prev) % 360 + 540) % 360 - 180;
  el._a = prev + d; el.style.transform = 'rotate(' + el._a + 'deg)';
}
function updateLive(){
  var st = NAV.state, g = NAV.guide(), h = st.heading;
  document.querySelectorAll('[data-live="ring"]').forEach(function(el){ rot(el, h == null ? 0 : -h); });
  document.querySelectorAll('[data-live="needle"]').forEach(function(el){
    if (!g) { el.classList.add('off'); return; }
    el.classList.remove('off'); rot(el, h == null ? g.b : g.rel);
  });
  if (g) {
    document.querySelectorAll('[data-live="instr"]').forEach(function(el){ el.textContent = relText(g); });
    document.querySelectorAll('[data-live="dist"]').forEach(function(el){ el.textContent = distLine(g); });
  }
  document.querySelectorAll('[data-live-b]').forEach(function(el){ var b = +el.getAttribute('data-live-b'); rot(el, h == null ? b : b - h); });
}
function vMap(){
  var st = NAV.state, all = NAV.list(), types = ['all'];
  all.forEach(function(x){ if (types.indexOf(x.p.type) < 0) types.push(x.p.type); });
  if (types.indexOf(filter) < 0) filter = 'all';
  var list = all.filter(function(x){ return filter === 'all' || x.p.type === filter; }).slice(0, 30), tg = NAV.target();
  return '<div class="page-head"><h1>' + t('mapTitle') + '</h1></div>' +
    (!st.pos && st.loc !== 'asking' && st.loc !== 'denied' ? '<div class="callout">' + ic('locate') + '<div class="grow">' + t('guideEnableSub') + '<button class="btn btn-primary" style="margin-top:12px" data-a="navEnable">' + t('guideEnable') + '</button></div></div>' : '') +
    (st.loc === 'denied' ? '<div class="callout">' + ic('locate') + '<span>' + t('guideDenied') + '</span></div>' : '') +
    (DESKTOP ? '<div class="dgrid map-grid"><div class="sticky">' + '<div class="mapbox" id="mapSlot">' + (NAV.mapState() === 'failed' ? '<div class="ovl">' + t('mapFailed') + '</div>' : NAV.mapState() !== 'ready' ? '<div class="ovl">' + t('mapLoading') + '</div>' : '') + '</div>' +
    '<p class="small" style="margin-top:8px">' + srcNote() + '</p>' + '</div><div>' + '<div class="filters" style="margin-top:12px">' + types.map(function(k){
      return '<button class="pick" data-a="filter" data-v="' + k + '" aria-pressed="' + (filter === k) + '">' + (k === 'all' ? t('mapAll') : ic(PLACE_TYPES[k].icon) + tx(PLACE_TYPES[k].name)) + '</button>'; }).join('') + '</div>' + (tg && st.pos ? '<a class="btn btn-primary" style="margin-top:12px" href="#/map/go">' + ic('arrow') + t('startGuide') + ' · ' + esc(placeName(tg.p)) + '</a>' : '') + '<section style="margin-top:12px">' + list.map(function(x){
      var on = tg && tg.p.id === x.p.id;
      return '<button class="pl" style="width:100%;text-align:left' + (on ? ';background:var(--surface-2);border-radius:12px;padding-left:8px;padding-right:8px' : '') + '" data-a="pickPlace" data-id="' + x.p.id + '">' +
        '<span class="mk t-' + x.p.type + '" style="position:static;margin:0;border:0;width:40px;height:40px">' + ic(PLACE_TYPES[x.p.type].icon) + '</span>' +
        '<div class="grow"><div class="nm">' + esc(placeName(x.p)) + '</div><div class="nt">' + esc(tx(PLACE_TYPES[x.p.type].name)) + (x.p.note ? ' · ' + esc(typeof x.p.note === 'string' ? x.p.note : tx(x.p.note)) : '') + '</div></div>' +
        '<div><div class="dist">' + fmtDist(x.d) + '</div>' + (x.b != null ? '<div class="dir"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true" data-live-b="' + Math.round(x.b) + '">' + P.arrow + '</svg>' + dirName(x.b) + '</div>' : '') + '</div></button>';
    }).join('') + '</section>' + '</div></div>'
      : '<div class="filters" style="margin-top:12px">' + types.map(function(k){
      return '<button class="pick" data-a="filter" data-v="' + k + '" aria-pressed="' + (filter === k) + '">' + (k === 'all' ? t('mapAll') : ic(PLACE_TYPES[k].icon) + tx(PLACE_TYPES[k].name)) + '</button>'; }).join('') + '</div>' + '<div class="mapbox" id="mapSlot">' + (NAV.mapState() === 'failed' ? '<div class="ovl">' + t('mapFailed') + '</div>' : NAV.mapState() !== 'ready' ? '<div class="ovl">' + t('mapLoading') + '</div>' : '') + '</div>' +
    '<p class="small" style="margin-top:8px">' + srcNote() + '</p>' + (tg && st.pos ? '<a class="btn btn-primary" style="margin-top:12px" href="#/map/go">' + ic('arrow') + t('startGuide') + ' · ' + esc(placeName(tg.p)) + '</a>' : '') + '<section style="margin-top:12px">' + list.map(function(x){
      var on = tg && tg.p.id === x.p.id;
      return '<button class="pl" style="width:100%;text-align:left' + (on ? ';background:var(--surface-2);border-radius:12px;padding-left:8px;padding-right:8px' : '') + '" data-a="pickPlace" data-id="' + x.p.id + '">' +
        '<span class="mk t-' + x.p.type + '" style="position:static;margin:0;border:0;width:40px;height:40px">' + ic(PLACE_TYPES[x.p.type].icon) + '</span>' +
        '<div class="grow"><div class="nm">' + esc(placeName(x.p)) + '</div><div class="nt">' + esc(tx(PLACE_TYPES[x.p.type].name)) + (x.p.note ? ' · ' + esc(typeof x.p.note === 'string' ? x.p.note : tx(x.p.note)) : '') + '</div></div>' +
        '<div><div class="dist">' + fmtDist(x.d) + '</div>' + (x.b != null ? '<div class="dir"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true" data-live-b="' + Math.round(x.b) + '">' + P.arrow + '</svg>' + dirName(x.b) + '</div>' : '') + '</div></button>';
    }).join('') + '</section>');
}
function vGo(em){
  var back = em ? '#/sos' : '#/map', tg = NAV.target();
  var safe = NAV.list().filter(function(x){ return ['assembly', 'shelter', 'rescue', 'hospital'].indexOf(x.p.type) >= 0; }).slice(0, 6);
  return '<main class="go" id="main" tabindex="-1"><div class="go-map" id="mapSlot" role="img" aria-label="' + t('mapTitle') + '">' + (NAV.mapState() === 'failed' ? '<div class="ovl">' + t('mapFailed') + '</div>' : NAV.mapState() !== 'ready' ? '<div class="ovl">' + t('mapLoading') + '</div>' : '') + '</div>' +
    '<header class="go-top glass"><a class="iconbtn" href="' + back + '" aria-label="' + t('back') + '">' + ic('chevL') + '</a><h1>' + t('goTitle') + '</h1>' +
    (em ? '<a class="sosbtn" href="tel:000">' + ic('phone') + '000</a>' : '') + '</header>' +
    '<div class="go-side"><button class="fab glass" data-a="recenter" aria-label="' + t('recenter') + '">' + ic('locate') + '</button>' +
    '<button class="fab glass" data-a="follow" aria-pressed="' + NAV.state.follow + '" aria-label="' + t('followHeading') + '">' + ic('arrow') + '</button></div>' +
    '<section class="go-panel glass" aria-live="polite"><div class="row">' + dialHTML() + '<div class="grow">' + guideBody() + '</div></div>' +
    (safe.length > 1 ? '<div class="chips">' + safe.map(function(x){
      return '<button class="pick" data-a="pickPlace" data-id="' + x.p.id + '" aria-pressed="' + !!(tg && tg.p.id === x.p.id) + '">' + ic(PLACE_TYPES[x.p.type].icon) + esc(placeName(x.p)) + ' · ' + fmtDist(x.d) + '</button>'; }).join('') + '</div>' : '') +
    '<p class="warnline">' + ic('alert') + '<span>' + t('hazardWarn') + '</span></p>' +
    (hasNeed('wheelchair') || hasNeed('noStairs') || hasNeed('walkingAid') ? '<p class="warnline">' + ic('alert') + '<span>' + t('stepsNote') + '</span></p>' : '') +
    '<p class="small" style="margin-top:4px;font-size:.75rem">' + srcNote() + '</p></section></main>';
}
function isDark(){ return S.theme === 'dark' || (S.theme === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); }
function usesNav(p){ return (p[0] === 'sos' && (p.length === 1 || p[1] === 'go')) || p[0] === 'map'; }

/* ---------- ME ---------- */
function cardKV(){
  var c = S.card, nl = needList(0), rows = [['Language', c.lang], ['Needs', nl.join('; ')], ['Disability', c.disability], ['Blood type', c.blood], ['Allergies', c.allergies], ['Medications', c.meds], ['Medical notes', c.conditions],
    ['Emergency contact', [c.contactName, c.contactPhone].filter(Boolean).join(' · ')], ['Address', c.address]].filter(function(r){ return r[1]; });
  return rows.map(function(r){ return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('');
}
function vMe(){
  var c = S.card, kv = cardKV();
  function segc(key, opts){ return '<div class="seg-ctl">' + opts.map(function(o){ return '<button data-a="set" data-k="' + key + '" data-v="' + o[0] + '" aria-pressed="' + (S[key] === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>'; }
  return '<div class="page-head"><h1>' + t('meTitle') + '</h1></div>' + (DESKTOP ? '<div class="dgrid"><div>' : '') +
    '<h2 class="label" style="margin-top:0">' + t('profileTitle') + '</h2><a class="idcard" href="#/me/card" style="display:block"><div class="idcard-h">' + ic('card') + 'EMERGENCY CARD<span class="sp" style="flex:1"></span>' + t('cardEdit') + '</div>' +
    '<div class="idcard-b">' + (c.name || kv ? '<div class="nm">' + esc(c.name || '—') + '</div><dl class="kv">' + kv + '</dl>' : '<p class="small">' + t('cardEmpty') + '</p>') + '</div></a>' +
    '<p class="small" style="margin-top:8px">' + t('cardSub') + ' ' + t('cardPrivacy') + '</p>' +
    '<p class="small" style="margin-top:4px">' + t('emCardWho') + '</p>' +
    (DESKTOP ? '</div><div>' : '') + '<h2 class="label"' + (DESKTOP ? ' style="margin-top:0"' : '') + '>' + t('settings') + '</h2><section class="card">' +
    '<button class="toggle" data-a="mvpToggle" aria-pressed="' + !!S.mvp + '" style="margin-bottom:8px"><span class="grow"><b>' + t('mvp') + '</b><br><span class="small">' + t('mvpSub') + '</span></span><span class="sw"></span></button>' +
    '<div class="set" style="margin-top:0"><span>' + t('language') + '</span>' + segc('lang', [['en', 'English'], ['zh', '中文']]) + '</div>' +
    '<div class="set"><span>' + t('textSize') + '</span>' + segc('size', [['std', t('sizeStd')], ['lg', t('sizeLg')], ['xl', t('sizeXl')]]) + '</div>' +
    '<div class="set"><span>' + t('theme') + '</span>' + segc('theme', [['auto', t('themeAuto')], ['light', t('themeLight')], ['dark', t('themeDark')]]) + '</div>' +
    '<div class="set"><span>' + t('palette') + '</span>' + segc('palette', [['a', 'A ' + t('palA')], ['b', 'B ' + t('palB')], ['c', 'C ' + t('palC')], ['ink', t('palInk')]]) + '</div>' +
    '<div class="set"><span>' + t('glass') + '</span>' + segc('glass', [['on', t('glassOn')], ['off', t('glassOff')]]) + '</div>' +
    '<div class="set"><button class="toggle" data-a="demoToggle" aria-pressed="' + S.demo.alert + '"><span class="grow">' + t('demoAlert') + '<br><span class="small">' + t('demoAlertSub') + '</span></span><span class="sw"></span></button></div></section>' +
    '<h2 class="label">' + t('about') + '</h2>' +
    '<div class="stack"><a class="link-row" href="#/me/sources"><span class="badge">' + ic('shield') + '</span><span class="grow"><span class="t">' + t('sourcesTitle') + '</span><br><span class="d">' + t('sourcesSub') + '</span></span><span class="chev">' + ic('chevR') + '</span></a>' +
    '<div class="card"><p class="small">' + linkify(t('aboutText')) + '</p><p class="small" style="margin-top:8px">' + t('version') + ' ' + DEWS_VERSION + ' · <a href="' + BASE + 'v1/" style="text-decoration:underline">' + t('oldVersion') + '</a> · <a href="' + BASE + (DESKTOP ? 'mobile/' : 'desktop/') + '" style="text-decoration:underline">' + (DESKTOP ? t('mobileLink') : t('desktopLink')) + '</a></p></div>' +
    '<button class="btn btn-ghost" data-a="reset" style="color:var(--red-text)">' + (resetArmed ? t('resetConfirm') : t('reset')) + '</button></div>' + (DESKTOP ? '</div></div>' : '');
}
function vCardEdit(){
  var c = S.card; if (!c.needs) c.needs = {};
  function f(k, label, ph, type){ return '<label class="field"><span>' + label + '</span><input class="input" ' + (type ? 'type="' + type + '" ' : '') + 'data-bind="card.' + k + '" value="' + esc(c[k] || '') + '" placeholder="' + esc(ph || '') + '"></label>'; }
  var gname = { mobility: 'gMobility', senses: 'gSenses', support: 'gSupport', health: 'gHealth' };
  return backTo('#/me') + '<div class="page-head"><h1>' + t('profileTitle') + '</h1><p class="sub">' + t('profileSub') + '</p></div>' +
    '<div class="callout">' + ic('shield') + '<span>' + t('cardPrivacy') + ' ' + t('emCardWho') + '</span></div>' +
    '<div class="callout" style="margin-top:8px">' + ic('phone') + '<span>' + t('emCardNote') + '</span></div>' +
    '<h2 class="label">' + t('secBasic') + '</h2><section class="card" style="padding-top:0">' +
    f('name', t('fName'), 'Wei Zhang') + f('lang', t('fLang'), 'Mandarin Chinese') + f('address', t('fAddress')) + '</section>' +
    '<h2 class="label">' + t('secNeeds') + '</h2><section class="card"><p class="small">' + t('needsHint') + '</p>' +
    NEEDS.filter(function(g){ return g.group !== 'health'; }).map(function(g){
      return '<div class="field"><span>' + t(gname[g.group]) + '</span>' + g.items.map(function(it){
        return '<button class="check" data-a="needToggle" data-v="' + it[0] + '" aria-pressed="' + !!c.needs[it[0]] + '"><span class="bx">' + ic('check') + '</span><span class="tx">' + esc(li() ? it[2] : it[1]) + '</span></button>'; }).join('') + '</div>';
    }).join('') + f('disability', t('fDisability'), t('fDisabilityPh')) + '</section>' +
    '<h2 class="label">' + t('secHealth') + '</h2><section class="card" style="padding-top:0">' +
    f('allergies', t('fAllergies'), t('fAllergiesPh')) +
    NEEDS.filter(function(g){ return g.group === 'health'; })[0].items.map(function(it){
      return '<button class="check" style="margin-top:8px" data-a="needToggle" data-v="' + it[0] + '" aria-pressed="' + !!c.needs[it[0]] + '"><span class="bx">' + ic('check') + '</span><span class="tx">' + esc(li() ? it[2] : it[1]) + '</span></button>'; }).join('') +
    f('meds', t('fMeds')) + f('blood', t('fBlood'), 'O+') + f('conditions', t('fConditions')) + '</section>' +
    '<h2 class="label">' + t('secContact') + '</h2><section class="card" style="padding-top:0">' +
    f('contactName', t('planName')) + f('contactPhone', t('planPhone'), '04xx xxx xxx', 'tel') + '</section>' +
    '<p class="small" style="margin-top:12px">English is easiest for Australian responders to read. / 用英文填写，方便澳洲救援人员阅读。</p>' +
    '<a class="btn btn-primary" style="margin-top:16px" href="#/me">' + t('done') + '</a>';
}
function vSources(){
  return backTo('#/me') + '<div class="page-head"><h1>' + t('sourcesTitle') + '</h1><p class="sub">' + t('sourcesSub') + ' ' + t('checked') + ' ' + CONTENT_CHECKED + '.</p></div>' +
    '<div class="src-list">' + Object.keys(SOURCES).map(function(k){ var s = SOURCES[k]; return '<a href="' + s.u + '" target="_blank" rel="noopener"><b>' + esc(s.t) + '</b><span>' + esc(s.u) + '</span></a>'; }).join('') + '</div>' +
    '<h2 class="label">Map &amp; places</h2><p class="small">Map tiles: OpenFreeMap · © OpenMapTiles · © OpenStreetMap contributors. Places: OpenStreetMap via Overpass API. Walking routes: FOSSGIS OSRM (routing.openstreetmap.de). Map library: MapLibre GL JS (BSD-3).</p>';
}

/* ---------- layer: onboarding, sheets, tools ---------- */
var TOOL = null, toolTimer = null, audio = null, wake = null;
function renderLayer(){
  var L = document.getElementById('layer'), h = '';
  var p = parts();
  if (!S.lang) h = onboarding();
  else if (TOOL) h = toolView();
  else if (CI) h = checkinSheet();
  else if (S.demo.alert && !S.demo.answered && (p.length === 0)) { CI = 'affected'; h = checkinSheet(); }
  L.innerHTML = h;
}
var OB = 0;
var OB_SLIDES = [{ k: 'ob1', art: 'mark' }, { k: 'ob2', art: 'sos' }, { k: 'ob3', tab: 0, icon: 'sun' }, { k: 'ob4', tab: 1, icon: 'shield' }, { k: 'ob5', tab: 2, icon: 'pin' }, { k: 'ob6', tab: 3, icon: 'user' }, { k: 'obPerm', art: 'perm' }];
function onboarding(){
  var pick = S.pre || 'en', zh = pick === 'zh';
  function T(k){ return STR[k][zh ? 1 : 0]; }
  if (OB === 0) {
    return '<div class="ob" role="dialog" aria-modal="true" aria-labelledby="ob-h"><div class="ob-in">' + MARK +
      '<h1 id="ob-h">' + T('obTitle') + '</h1><p class="sub">' + T('obSub') + '</p>' +
      '<div class="lang-pick"><button data-a="obLang" data-v="en" aria-pressed="' + !zh + '">English' + ic('check') + '</button>' +
      '<button data-a="obLang" data-v="zh" aria-pressed="' + zh + '">中文' + ic('check') + '</button></div>' +
      '<div class="sp"></div><button class="btn btn-lg btn-primary" data-a="obNext">' + T('obContinue') + '</button></div></div>';
  }
  var sl = OB_SLIDES[OB - 1], art = '';
  var tabs = [['sun', 'tabHome'], ['shield', 'tabPrep'], ['pin', 'tabMap'], ['user', 'tabMe']];
  if (sl.art === 'mark') art = MARK.replace('class="mark"', 'class="mark" style="width:96px;height:96px"');
  else if (sl.art === 'sos') art = '<div class="mini-top"><span class="sosbtn">' + ic('alert') + T('sos') + '</span></div><div class="big-ic" style="background:var(--red);color:var(--on-red)">' + ic('alert') + '</div>';
  else if (sl.art === 'perm') art = '<div class="dial" style="width:140px;height:140px"><div class="dial-ring">' + (function(){ var x = ''; for (var i = 0; i < 12; i++) x += '<i style="transform:rotate(' + (i * 30) + 'deg);transform-origin:1px 66px"></i>'; return x; })() + '<b>N</b></div><div class="needle" style="transform:rotate(38deg);inset:24px"><svg viewBox="0 0 24 24" style="width:84px;height:84px"><path d="M12 2l7 19-7-4-7 4z"/></svg></div></div>';
  else art = '<div class="big-ic" style="margin-bottom:64px">' + ic(sl.icon) + '</div><div class="mini-tabs">' + tabs.map(function(x, i){ return '<span class="' + (i === sl.tab ? 'on' : '') + '">' + ic(x[0]) + T(x[1]) + '</span>'; }).join('') + '</div>';
  var title = T(sl.k + 'T'), desc = T(sl.k + 'D'), last = OB === OB_SLIDES.length;
  return '<div class="ob" role="dialog" aria-modal="true" aria-labelledby="ob-h"><div class="ob-in">' +
    '<div class="ob-top"><button class="iconbtn" data-a="obBack">' + ic('chevL') + T('obBack') + '</button>' + (last ? '' : '<button class="iconbtn" data-a="obSkip" style="color:var(--ink-2)">' + T('obSkip') + '</button>') + '</div>' +
    '<div class="ob-art" aria-hidden="true">' + art + '</div>' +
    '<div class="ob-dots" aria-hidden="true">' + OB_SLIDES.map(function(_, i){ return '<i class="' + (i === OB - 1 ? 'on' : '') + '"></i>'; }).join('') + '</div>' +
    '<h1 id="ob-h" style="margin-top:0">' + title + '</h1><p class="sub">' + desc + '</p><div class="sp"></div>' +
    (last ? '<button class="btn btn-lg btn-green" data-a="obAllow">' + ic('locate') + T('obAllow') + '</button><button class="btn btn-ghost" style="margin-top:8px" data-a="obFinish">' + T('obLater') + '</button>'
          : '<button class="btn btn-lg btn-primary" data-a="obNext">' + T('obNext') + '</button>') + '</div></div>';
}
function toolView(){
  if (TOOL === 'torch') return '<div class="ov white" data-a="toolStop"><span class="hint">' + t('torchNote') + '</span><span class="hint">' + t('tapToStop') + '</span></div>';
  if (TOOL === 'flash') return '<div class="ov black" id="flash" data-a="toolStop"><span class="big">SOS</span><span class="hint">' + t('flashNote') + '</span><span class="hint">' + t('tapToStop') + '</span></div>';
  if (TOOL === 'whistle') return '<div class="ov black" data-a="toolStop">' + ic('whistle', 'xl') + '<span class="big">' + t('whistle') + '</span><span class="hint">' + t('whistleNote') + '</span><span class="hint">' + t('tapToStop') + '</span></div>';
  if (TOOL === 'card') {
    var c = S.card, lang = c.lang || (li() ? 'Mandarin Chinese (中文)' : 'English');
    return '<div class="helpcard" role="dialog" aria-modal="true"><div class="hc-in"><div class="hc-big">I NEED HELP</div><div class="hc-zh">我需要帮助</div>' +
      '<div class="hc-line">Please call 000 for me.</div><div class="hc-line" style="font-size:1.375rem">I speak: ' + esc(lang) + '</div>' +
      (cardKV() || c.name ? '<dl>' + (c.name ? '<dt>Name</dt><dd>' + esc(c.name) + '</dd>' : '') + cardKV() + '</dl>' : '') +
      '<button class="btn btn-lg" data-a="toolStop">' + t('close') + '</button></div></div>';
  }
  return '';
}
function startTool(k){
  TOOL = k; renderLayer();
  try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function(w){ wake = w; }).catch(function(){}); } catch (e) {}
  if (k === 'flash') {
    /* S O S : dot = 1 unit, dash = 3 units; 1 unit = 300 ms (under 3 flashes per second) */
    var U = 300, seq = [], add = function(on, u){ seq.push([on, u * U]); };
    [1, 1, 1].forEach(function(d){ add(1, d); add(0, 1); }); seq[seq.length - 1][1] = 3 * U;
    [3, 3, 3].forEach(function(d){ add(1, d); add(0, 1); }); seq[seq.length - 1][1] = 3 * U;
    [1, 1, 1].forEach(function(d){ add(1, d); add(0, 1); }); seq[seq.length - 1][1] = 7 * U;
    var i = 0;
    (function stepf(){ var el = document.getElementById('flash'); if (!el || TOOL !== 'flash') return; var s = seq[i % seq.length]; el.classList.toggle('flash-on', !!s[0]); i++; toolTimer = setTimeout(stepf, s[1]); })();
  }
  if (k === 'whistle') {
    try {
      var AC = window.AudioContext || window.webkitAudioContext; audio = new AC();
      var osc = audio.createOscillator(), g = audio.createGain(); osc.type = 'square'; osc.frequency.value = 3150; g.gain.value = 0;
      osc.connect(g); g.connect(audio.destination); osc.start();
      var n = 0;
      (function blast(){ if (TOOL !== 'whistle') return; var inBurst = n % 4 < 3; g.gain.setTargetAtTime(inBurst ? 0.5 : 0, audio.currentTime, 0.01);
        setTimeout(function(){ g.gain.setTargetAtTime(0, audio.currentTime, 0.01); n++; toolTimer = setTimeout(blast, inBurst ? 300 : 900); }, inBurst ? 600 : 10); })();
    } catch (e) { toast('Audio not available'); }
  }
}
function stopTool(){
  TOOL = null; clearTimeout(toolTimer);
  if (audio) { try { audio.close(); } catch (e) {} audio = null; }
  if (wake) { try { wake.release(); } catch (e) {} wake = null; }
  renderLayer();
}

/* ---------- actions ---------- */
function contacts(){
  var n = S.plan.people.map(function(p){ return (p.phone || '').replace(/[^\d+]/g, ''); }).filter(Boolean);
  if (S.card.contactPhone) n.push(S.card.contactPhone.replace(/[^\d+]/g, ''));
  return n.filter(function(x, i, a){ return a.indexOf(x) === i; });
}
function withLocation(cb){
  if (!navigator.geolocation) return cb(null);
  var done = false;
  navigator.geolocation.getCurrentPosition(function(p){ if (done) return; done = true; cb({ lat: p.coords.latitude, lng: p.coords.longitude }); },
    function(){ if (done) return; done = true; cb(null); }, { timeout: 6000, maximumAge: 120000, enableHighAccuracy: true });
  setTimeout(function(){ if (!done) { done = true; cb(null); } }, 7000);
}
function sendSms(body){
  var n = contacts();
  if (!n.length) { toast(t('safeNoContacts')); location.hash = '#/prepare/plan'; return; }
  location.href = 'sms:' + n.join(',') + '?&body=' + encodeURIComponent(body);
}
function sendSafe(){
  withLocation(function(c){
    var body = t('safeMsg');
    if (c) body += '\n' + t('safeWhere') + ': https://maps.google.com/?q=' + c.lat.toFixed(5) + ',' + c.lng.toFixed(5);
    sendSms(body);
  });
}
var A = {
  obLang: function(el){ S.pre = el.dataset.v; renderLayer(); },
  obNext: function(){ if (!S.pre) S.pre = 'en'; OB = Math.min(OB + 1, OB_SLIDES.length); renderLayer(); },
  obBack: function(){ OB = Math.max(0, OB - 1); renderLayer(); },
  obSkip: function(){ OB = OB_SLIDES.length; renderLayer(); },
  obAllow: function(){ NAV.enable(); A.obFinish(); },
  obFinish: function(){ S.lang = S.pre || 'en'; delete S.pre; OB = 0; save(); render(); },
  navEnable: function(){ NAV.enable().then(function(){ render(); }); render(); },
  openGo: function(){ location.hash = parts()[0] === 'sos' ? '#/sos/go' : '#/map/go'; },
  recenter: function(){ NAV.recenter(); },
  follow: function(){ NAV.setFollow(!NAV.state.follow); },
  pickPlace: function(el){ NAV.setTarget(el.dataset.id); },
  learnItem: function(el){ if (!S.kit.extra) S.kit.extra = {}; S.kit.extra[el.dataset.v] = !S.kit.extra[el.dataset.v]; save(); var y = window.scrollY; render(); window.scrollTo(0, y); },
  learnAll: function(el){ if (!S.kit.extra) S.kit.extra = {}; var L = LEARN[el.dataset.v], all = L.supplies.every(function(it){ return S.kit.extra[it[0]]; }); L.supplies.forEach(function(it){ S.kit.extra[it[0]] = !all; }); save(); var y = window.scrollY; render(); window.scrollTo(0, y); if (!all) toast(t('learnAdded')); },
  mvpToggle: function(){ S.mvp = !S.mvp; save(); render(); },
  needToggle: function(el){ if (!S.card.needs) S.card.needs = {}; S.card.needs[el.dataset.v] = !S.card.needs[el.dataset.v]; save(); var y = window.scrollY; render(); window.scrollTo(0, y); },
  demoAlert: function(){ S.demo.alert = true; S.demo.answered = false; CI = null; save(); location.hash = '#/'; render(); },
  demoToggle: function(){ S.demo.alert = !S.demo.alert; S.demo.answered = false; save(); render(); },
  checkin: function(){ CI = 'affected'; renderLayer(); },
  ciYes: function(){ CI = 'help'; renderLayer(); },
  ciNo: function(){ CI = null; S.demo.answered = true; save(); renderLayer(); },
  ciClose: function(){ CI = null; S.demo.answered = true; save(); renderLayer(); },
  ciSafe: function(){ CI = null; S.demo.answered = true; save(); renderLayer(); sendSafe(); },
  safe: function(){ sendSafe(); },
  tool: function(el){ startTool(el.dataset.t); },
  toolStop: function(){ stopTool(); },
  hrInj: function(el){ HR.inj = el.dataset.v; render(); },
  hrPeople: function(el){ HR.people = Math.max(1, Math.min(50, HR.people + +el.dataset.d)); render(); },
  hrNeed: function(el){ HR.needs[el.dataset.v] = !HR.needs[el.dataset.v]; render(); },
  hrToggle: function(el){ HR[el.dataset.v] = !HR[el.dataset.v]; render(); },
  hrSend: function(el){
    el.disabled = true;
    var go = function(c){ if (c) HR.coords = c.lat.toFixed(4) + ', ' + c.lng.toFixed(4); location.hash = '#/sos/help/sent'; };
    if (HR.loc) withLocation(go); else go(null);
  },
  hrSms: function(){
    var nmap = { water: 'needWater', food: 'needFood', meds: 'needMeds', shelter: 'needShelter', transport: 'needTransport', power: 'needPower' };
    var needs = Object.keys(HR.needs).filter(function(k){ return HR.needs[k]; }).map(function(k){ return t(nmap[k]); }).join(', ');
    var prof = HR.card ? needList(0).concat(S.card.allergies ? ['Allergies: ' + S.card.allergies] : []).join('; ') : '';
    var body = t('needHelp') + '. ' + t('hrPeople') + ' ' + HR.people + '. ' + (needs ? t('hrNeed') + ' ' + needs + '. ' : '') + (prof ? '[' + prof + '] ' : '') + (HR.note ? HR.note + ' ' : '') +
      (HR.coords ? '\nhttps://maps.google.com/?q=' + HR.coords.replace(/\s/g, '') : '');
    sendSms(body);
  },
  kitPeople: function(el){ S.kit.people = Math.max(1, Math.min(12, S.kit.people + +el.dataset.d)); save(); render(); },
  kitToggle: function(el){ S.kit[el.dataset.v] = !S.kit[el.dataset.v]; save(); render(); },
  kitItem: function(el){ S.kit.have[el.dataset.v] = !S.kit.have[el.dataset.v]; save(); render(); },
  planAdd: function(){ S.plan.people.push({ name: '', phone: '' }); save(); render(); },
  planRm: function(el){ S.plan.people.splice(+el.dataset.i, 1); if (!S.plan.people.length) S.plan.people.push({ name: '', phone: '' }); save(); render(); },
  planShare: function(){
    var p = S.plan, lines = ['DEWS — ' + t('planTitle')];
    p.people.forEach(function(x){ if (x.name || x.phone) lines.push('• ' + x.name + ' ' + x.phone); });
    if (p.near) lines.push(t('planMeetNear') + ': ' + p.near);
    if (p.far) lines.push(t('planMeetFar') + ': ' + p.far);
    if (p.contact) lines.push(t('planContact') + ': ' + p.contact);
    if (p.trigger) lines.push(t('planTrigger') + ': ' + p.trigger);
    var text = lines.join('\n');
    if (navigator.share) navigator.share({ text: text }).catch(function(){});
    else location.href = 'sms:?&body=' + encodeURIComponent(text);
  },
  quizStart: function(){ Q = { i: 0, picked: null, score: 0 }; render(); },
  quizPick: function(el){ if (Q.picked != null) return; Q.picked = +el.dataset.i; if (Q.picked === QUIZ[Q.i].ok) Q.score++; render(); },
  quizNext: function(){ Q.i++; Q.picked = null; if (Q.i >= QUIZ.length) { S.quiz.best = Math.max(S.quiz.best || 0, Q.score); save(); } render(); window.scrollTo(0, 0); },
  filter: function(el){ filter = el.dataset.v; render(); },
  set: function(el){ S[el.dataset.k] = el.dataset.v; save(); render(); },
  reset: function(){
    if (!resetArmed) { resetArmed = true; render(); setTimeout(function(){ resetArmed = false; }, 4000); return; }
    try { localStorage.removeItem(KEY); } catch (e) {}
    S = JSON.parse(JSON.stringify(DEFAULTS)); resetArmed = false; location.hash = '#/'; render();
  }
};
document.addEventListener('click', function(e){
  var el = e.target.closest('[data-a]'); if (!el) return;
  var fn = A[el.dataset.a]; if (!fn) return;
  if (el.tagName !== 'A') e.preventDefault();
  fn(el, e);
});
document.addEventListener('input', function(e){
  var el = e.target;
  if (el.dataset.bind) { setPath(S, el.dataset.bind, el.value); save(); }
  if (el.dataset.hr && HR) HR[el.dataset.hr] = el.value;
});
document.addEventListener('keydown', function(e){ if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute && e.target.getAttribute('role') === 'link' && e.target.dataset.a) { e.preventDefault(); A[e.target.dataset.a](e.target, e); return; } if (e.key === 'Escape') { if (TOOL) stopTool(); else if (CI) A.ciClose(); } });
window.addEventListener('hashchange', function(){ render(); window.scrollTo(0, 0); var m = document.getElementById('main'); if (m && !TOOL && !CI) try { m.focus({ preventScroll: true }); } catch (e) {} });
window.addEventListener('online', render); window.addEventListener('offline', render);
function after(p){
  var m = document.getElementById('main'); if (m && p[0] === 'sos' && p[3]) { var n = m.querySelector('.now'); if (n) n.setAttribute('tabindex', '-1'); }
  if (S.lang && usesNav(p)) NAV.auto();
  var slot = document.getElementById('mapSlot');
  if (slot && NAV.mapState() !== 'failed') NAV.mount(slot, { dark: isDark() });
  updateLive();
}
var navRendering = false;
NAV.onChange(function(){ var p = parts(); if (!S.lang || TOOL || navRendering || !usesNav(p)) return; navRendering = true; var y = window.scrollY; render(); window.scrollTo(0, y); navRendering = false; });
NAV.onLive(updateLive);

/* ---------- offline ---------- */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(BASE + 'sw.js', { scope: BASE }).then(function(){ return navigator.serviceWorker.ready; })
    .then(function(){ swReady = true; if (S.lang) { var y = window.scrollY; render(); window.scrollTo(0, y); } }).catch(function(){});
}
render();
})();
