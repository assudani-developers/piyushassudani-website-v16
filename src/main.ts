import './styles.css';
import Lenis from 'lenis';
import gsap from 'gsap';
import { isMobile, reducedMotion, watchModeChange } from './device';
import { loadAll } from './assets';
import { renderChrome, renderStory, appSheet, workSheet, beatSheet, SKY_ICONS } from './ui/render';
import { APPS, CHAPTERS, PERSON, STORY, WORK } from './content';
import { applyTheme } from './theme';
import { daylightAt, PRESETS, PHASE_LABEL, GREETING, clockLabel, type Phase } from './daylight';
import type { World } from './scene/World';
import { Coverflow, ArcGallery, SkillOrbit, DepthTilt } from './ui/three-d';

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

document.body.classList.add(isMobile ? 'is-mobile' : 'is-desktop');
const setVh = () => document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
setVh();
$('#app').innerHTML = renderChrome() + `<main id="story-root">${renderStory()}</main>`;
watchModeChange();

/* ======================= time of day ======================= */

type Mode = 'auto' | Phase;
let mode: Mode = 'auto';
try { const m = sessionStorage.getItem('pa-sky') as Mode | null; if (m && (m === 'auto' || m in PRESETS)) mode = m; } catch { /* storage blocked */ }
const sky = { ...(mode === 'auto' ? daylightAt() : PRESETS[mode]) };
let phase: Phase = mode === 'auto' ? daylightAt().phase : mode;
let world: World | null = null;

function paintSkyUI() {
  $('.sky-btn .sky-ic').innerHTML = SKY_ICONS[phase];
  $('.sky-phase').textContent = PHASE_LABEL[phase];
  $('.sky-time').textContent = mode === 'auto' ? clockLabel() : 'Preview';
  $$('[data-sky]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.sky === mode)));
  const g = $('[data-greet]');
  if (g) g.textContent = GREETING[phase];
  applyTheme(sky.night > 0.5 ? 'dark' : 'light', phase);
}

function setSky(next: Mode, instant = false) {
  mode = next;
  try { sessionStorage.setItem('pa-sky', mode); } catch { /* ignore */ }
  const target = mode === 'auto' ? daylightAt() : PRESETS[mode];
  phase = target.phase;
  gsap.to(sky, {
    night: target.night, warm: target.warm, elev: target.elev,
    duration: instant || reducedMotion ? 0 : 2.4, ease: 'power2.inOut',
    onUpdate: () => applyTheme(sky.night > 0.5 ? 'dark' : 'light', phase),
  });
  paintSkyUI();
}
paintSkyUI();
setInterval(() => { if (mode === 'auto') setSky('auto'); else paintSkyUI(); }, 60_000);

const skyWrap = $('.sky');
$('.sky-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  const open = skyWrap.classList.toggle('open');
  $('.sky-btn').setAttribute('aria-expanded', String(open));
});
$$('[data-sky]').forEach((b) => b.addEventListener('click', () => { setSky(b.dataset.sky as Mode); skyWrap.classList.remove('open'); }));
document.addEventListener('click', (e) => { if (!(e.target as Element).closest('.sky')) skyWrap.classList.remove('open'); });

/* ======================= scrolling ======================= */

const sections = $$<HTMLElement>('section.ch');
const last = sections.length - 1;
let tops: number[] = [];
let heights: number[] = [];
let vh = window.innerHeight;

const appsSec = $<HTMLElement>('#apps');
const workSec = $<HTMLElement>('#work');

function measure() {
  vh = window.innerHeight;
  if (!isMobile) {
    // pinned 3D chapters: scroll length per item
    appsSec.style.height = `${Math.round(vh * (1 + (APPS.length - 1) * 0.75))}px`;
    workSec.style.height = `${Math.round(vh * (1 + (WORK.length - 1) * 0.32))}px`;
  }
  tops = sections.map((s) => s.offsetTop);
  heights = sections.map((s) => s.offsetHeight);
}
measure();

const lenis = isMobile ? null : new Lenis({ lerp: reducedMotion ? 1 : 0.1, smoothWheel: true, wheelMultiplier: 1 });
const scrollY = () => (lenis ? lenis.scroll : window.scrollY);
function lockScroll(on: boolean) {
  document.documentElement.classList.toggle('locked', on);
  if (lenis) { if (on) lenis.stop(); else lenis.start(); }
}

function goto(i: number) {
  closeMenu();
  const y = i === 0 ? 0 : tops[i];
  if (lenis) lenis.scrollTo(y, { duration: reducedMotion ? 0 : Math.min(3.2, 1.2 + Math.abs(y - lenis.scroll) / vh * 0.12), easing: (t: number) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: y, behavior: reducedMotion ? 'auto' : 'smooth' });
}
$$('[data-goto]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); goto(Number(b.dataset.goto)); }));

/** Scroll → story: c = fractional chapter (the camera flies between chapters around each boundary), u = progress through each chapter. */
function storyState(y: number) {
  const yc = y + vh * 0.5;
  let c = 0;
  for (let b = 1; b <= last; b++) c += clamp((yc - (tops[b] - vh * 0.45)) / (vh * 0.9));
  const u = sections.map((_, i) => clamp((y - tops[i]) / Math.max(1, heights[i] - vh)));
  return { c, u };
}

/* ======================= reveal on view ======================= */

const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
function startReveals() {
  // hero text is clipped by its line masks, so the observer can't see it: reveal it directly
  $$('.hero .rv').forEach((el) => el.classList.add('in'));
  $$('.rv:not(.in)').forEach((el) => io.observe(el));
}

/* ======================= menu, sheets, overlays ======================= */

function closeMenu() { document.body.classList.remove('menu-open'); $('.menu').setAttribute('aria-hidden', 'true'); }
$('.menu-btn').addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  $('.menu').setAttribute('aria-hidden', String(!open));
});

let openOverlay: HTMLElement | null = null;
let lastFocus: HTMLElement | null = null;
function showOverlay(el: HTMLElement) {
  lastFocus = document.activeElement as HTMLElement;
  openOverlay = el;
  el.setAttribute('aria-hidden', 'false');
  el.classList.add('open');
  lockScroll(true);
  ($('[data-close]', el) as HTMLElement).focus({ preventScroll: true });
}
function closeOverlay() {
  if (!openOverlay) return;
  openOverlay.classList.remove('open');
  openOverlay.setAttribute('aria-hidden', 'true');
  openOverlay = null;
  lockScroll(false);
  lastFocus?.focus({ preventScroll: true });
}
$$('.overlay').forEach((o) => {
  o.setAttribute('data-lenis-prevent', '');
  o.addEventListener('click', (e) => { if (e.target === o || (e.target as Element).closest('[data-close]')) closeOverlay(); });
});
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeOverlay(); closeMenu(); skyWrap.classList.remove('open'); } });

const sheet = $<HTMLElement>('.sheet');
const sheetBody = $<HTMLElement>('.sheet-body');
function openSheet(html: string) {
  sheetBody.innerHTML = html;
  ($('.sheet-panel') as HTMLElement).scrollTop = 0;
  showOverlay(sheet);
}
$$('[data-app]').forEach((b) => b.addEventListener('click', () => openSheet(appSheet(APPS[Number(b.dataset.app)]))));
$$('[data-work]').forEach((b) => b.addEventListener('click', () => openSheet(workSheet(WORK[Number(b.dataset.work)]))));
$$('[data-open-sites]').forEach((b) => b.addEventListener('click', () => showOverlay($('.sites'))));

/* ======================= 3D showcases ======================= */

function syncInfos(sec: HTMLElement, key: string, i: number) {
  $$('.infos .info', sec).forEach((el, k) => el.classList.toggle('on', k === i));
  $$(`[data-dots="${key}"] i`, sec).forEach((el, k) => el.classList.toggle('on', k === i));
}
/** Desktop: scroll to where item i faces the front. Mobile: turn to it. */
function focusItem(secIdx: number, ctl: { target: number }, i: number, n: number) {
  if (isMobile) { ctl.target = i; return; }
  const y = tops[secIdx] + (i / (n - 1)) * (heights[secIdx] - vh) + 2;
  if (lenis) lenis.scrollTo(y, { duration: 1.2 });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}

const cfItems = $$<HTMLElement>('.cf-item', appsSec);
const coverflow = new Coverflow($('.cf-stage', appsSec), cfItems, isMobile);
coverflow.onActive = (i) => syncInfos(appsSec, 'apps', i);
cfItems.forEach((el, i) => el.addEventListener('click', () => {
  if (i === coverflow.active) openSheet(appSheet(APPS[i]));
  else focusItem(3, coverflow, i, APPS.length);
}));

const arcItems = $$<HTMLElement>('.arc-item', workSec);
const arc = new ArcGallery($('.arc-stage', workSec), $('.arc-ring', workSec), arcItems, isMobile ? 34 : 24, isMobile);
const arcBar = $<HTMLElement>('.arc-progress i', workSec);
arc.onActive = (i) => syncInfos(workSec, 'work', i);
arcItems.forEach((el, i) => el.addEventListener('click', () => {
  if (i === arc.active) openSheet(workSheet(WORK[i]));
  else focusItem(4, arc, i, WORK.length);
}));

const kitSec = $<HTMLElement>('#toolkit');
const orbit = new SkillOrbit($('.orbit', kitSec), $$('.chip', kitSec));
const hq = new DepthTilt($('.hq'), $('.hq-scene'));
let pinnedCat = -1;
function showCat(c: number) {
  kitSec.classList.toggle('has-cat', c >= 0);
  $$('.chip', kitSec).forEach((el) => el.classList.toggle('lit', Number(el.dataset.cat) === c));
  $$('.cat', kitSec).forEach((el) => el.classList.toggle('on', Number(el.dataset.cat) === c));
}
$$<HTMLElement>('.cat', kitSec).forEach((b) => {
  const c = Number(b.dataset.cat);
  b.addEventListener('mouseenter', () => showCat(c));
  b.addEventListener('mouseleave', () => showCat(pinnedCat));
  b.addEventListener('click', () => { pinnedCat = pinnedCat === c ? -1 : c; showCat(pinnedCat); });
});

/* ======================= contact (no backend) ======================= */

const form = $<HTMLFormElement>('form.compose');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const via = ((e as SubmitEvent).submitter as HTMLElement | null)?.dataset.via ?? 'wa';
  const fd = new FormData(form);
  const name = String(fd.get('name') ?? '').trim();
  const msg = String(fd.get('msg') ?? '').trim();
  const text = `Hi Piyush, I'm ${name}. ${msg}`;
  const url = via === 'mail'
    ? `mailto:${PERSON.email}?subject=${encodeURIComponent(`New project — ${name}`)}&body=${encodeURIComponent(text)}`
    : `${PERSON.whatsapp}?text=${encodeURIComponent(text)}`;
  window.open(url, via === 'mail' ? '_self' : '_blank', 'noopener');
});

/* ======================= cursor (desktop) ======================= */

const cursor = isMobile ? null : $('.cursor');
const cur = { x: innerWidth / 2, y: innerHeight / 2, rx: innerWidth / 2, ry: innerHeight / 2 };
window.addEventListener('pointermove', (e) => {
  cur.x = e.clientX; cur.y = e.clientY;
  if (!isMobile) world?.setPointer(e.clientX, e.clientY);
  if (cursor) cursor.classList.toggle('hover', !!(e.target as Element).closest?.('a, button, input, label'));
}, { passive: true });

/* ======================= share ======================= */
// Sends a proper card (title, line, link preview with the OG image) instead of a bare URL.
const SHARE = {
  title: 'Piyush Assudani — Full-Stack Developer from Balotra',
  text: 'Meet Piyush Assudani: self-taught full-stack developer from Balotra, Rajasthan. 50+ websites live, 5+ products of his own, and the story of how it started with ₹500.',
  url: 'https://www.piyushassudani.in/',
};
document.querySelectorAll<HTMLElement>('[data-share]').forEach((b) => b.addEventListener('click', async () => {
  closeMenu();
  if (navigator.share) {
    // share the preview image itself along with the text and link, where the phone supports files
    try {
      const blob = await fetch('/og-image.jpg').then((r) => r.blob());
      const file = new File([blob], 'piyush-assudani.jpg', { type: 'image/jpeg' });
      const withImage = { ...SHARE, text: `${SHARE.text}\n${SHARE.url}`, files: [file] };
      if (navigator.canShare?.(withImage)) { await navigator.share(withImage); return; }
    } catch (err) { if ((err as Error).name === 'AbortError') return; }
    try { await navigator.share(SHARE); } catch { /* cancelled */ }
    return;
  }
  try { await navigator.clipboard.writeText(`${SHARE.text}\n${SHARE.url}`); b.textContent = 'Copied ✓'; }
  catch { window.open(`https://wa.me/?text=${encodeURIComponent(`${SHARE.text}\n${SHARE.url}`)}`, '_blank', 'noopener'); }
}));

/* ======================= mobile extras ======================= */

// story deck: cards stick and stack; the one underneath sinks back as the next slides over it
const deckCards = isMobile ? Array.from(document.querySelectorAll<HTMLElement>('.deck-card')) : [];
function syncDeck() {
  if (!deckCards.length) return;
  const first = deckCards[0].getBoundingClientRect();
  if (first.top > vh || deckCards[deckCards.length - 1].getBoundingClientRect().bottom < 0) return;
  for (let i = 0; i < deckCards.length - 1; i++) {
    const a = deckCards[i].getBoundingClientRect(), b = deckCards[i + 1].getBoundingClientRect();
    const cover = clamp(1 - (b.top - a.top) / Math.max(1, a.height));
    deckCards[i].style.transform = `scale(${(1 - cover * 0.07).toFixed(4)}) rotateX(${(cover * 6).toFixed(2)}deg)`;
    deckCards[i].style.setProperty('--cover', cover.toFixed(3));
  }
}
document.querySelectorAll<HTMLElement>('[data-beat-open]').forEach((b) => b.addEventListener('click', () => openSheet(beatSheet(Number(b.dataset.beatOpen)))));

// reviews: a swipeable 3D rail
const qrail = document.querySelector<HTMLElement>('.qrail');
function syncQrail() {
  if (!qrail) return;
  const c = qrail.scrollLeft + qrail.clientWidth / 2;
  qrail.querySelectorAll<HTMLElement>('.quote').forEach((q) => {
    const d = (q.offsetLeft + q.offsetWidth / 2 - c) / q.offsetWidth;
    const ad = Math.min(1.5, Math.abs(d));
    q.style.transform = `perspective(900px) rotateY(${(-d * 28).toFixed(2)}deg) scale(${(1 - ad * 0.1).toFixed(3)})`;
    q.style.opacity = (1 - ad * 0.35).toFixed(3);
  });
}
qrail?.addEventListener('scroll', syncQrail, { passive: true });
syncQrail();

// tilt the phone to look around the desert (Android directly; iOS asks once on first tap)
if (isMobile) {
  const onTilt = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    world?.setPointer(((clamp(e.gamma / 30, -1, 1) + 1) / 2) * innerWidth, ((clamp((e.beta - 45) / 30, -1, 1) + 1) / 2) * innerHeight);
  };
  const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
  if (DOE?.requestPermission) {
    window.addEventListener('touchend', () => { DOE.requestPermission!().then((r) => { if (r === 'granted') window.addEventListener('deviceorientation', onTilt); }).catch(() => {}); }, { once: true });
  } else window.addEventListener('deviceorientation', onTilt);
}

const dock = document.querySelector<HTMLElement>('.dock');
const dockNo = document.querySelector<HTMLElement>('.dock-no');
const dockTitle = document.querySelector<HTMLElement>('.dock-title') as HTMLElement;
dock?.addEventListener('click', () => (document.querySelector('.menu-btn') as HTMLElement).click());

/* ======================= per-frame UI ======================= */

const hudNo = $('.hud-no');
const hudTitle = $('.hud-title');
const prog = $('.progress i');
const storyVis = $$('.story-vis .vis');
const storyBeats = $$('.beats .beat');
const storyNav = $$('.beat-nav li');
let lastCh = -1, lastBeat = 0;

// How much of the 3D shows through in each chapter (0 = all of it). Interpolated with the fractional chapter,
// so the veil eases between chapters instead of cutting at section edges.
const VEIL = isMobile ? [0, 0.9, 0.6, 0.7, 0.65, 0.55, 0.7, 0.85, 0.7] : [0, 0.85, 0.45, 0.55, 0.5, 0.4, 0.55, 0.8, 0.6];
const veilEl = $<HTMLElement>('.veil');
let veilNow = -1;
function syncUI(c: number, u: number[], y: number) {
  const i0 = Math.min(VEIL.length - 1, Math.floor(c)), i1 = Math.min(VEIL.length - 1, i0 + 1), f = c - Math.floor(c);
  const v = VEIL[i0] + (VEIL[i1] - VEIL[i0]) * (f * f * (3 - 2 * f));
  if (Math.abs(v - veilNow) > 0.003) { veilNow = v; veilEl.style.opacity = v.toFixed(3); }
  const ch = Math.min(last, Math.round(c));
  if (ch !== lastCh) {
    lastCh = ch;
    hudNo.textContent = CHAPTERS[ch].no;
    hudTitle.textContent = CHAPTERS[ch].title;
    if (dockNo) { dockNo.textContent = CHAPTERS[ch].no; dockTitle.textContent = CHAPTERS[ch].title; }
  }
  const max = document.documentElement.scrollHeight - vh;
  prog.style.transform = `scaleX(${max > 0 ? clamp(y / max) : 0})`;
  if (dock) dock.style.setProperty('--p', (max > 0 ? clamp(y / max) : 0).toFixed(4));
  syncDeck();

  if (storyBeats.length) {
    const b = Math.min(STORY.length - 1, Math.floor(u[1] * STORY.length * 0.999));
    if (b !== lastBeat) {
      [storyVis, storyBeats, storyNav].forEach((list) => { list[lastBeat]?.classList.remove('on'); list[b]?.classList.add('on'); });
      lastBeat = b;
    }
  }
  if (!isMobile) {
    coverflow.target = u[3] * (APPS.length - 1);
    arc.target = u[4] * (WORK.length - 1);
  }
  arcBar.style.transform = `scaleX(${(arc.pos / (WORK.length - 1)).toFixed(4)})`;
}

let ready = false;
let lastT = 0;
function tick(t: number) {
  lenis?.raf(t);
  const dt = Math.min(0.05, lastT ? (t - lastT) / 1000 : 0.016);
  lastT = t;
  coverflow.update(dt);
  arc.update(dt);
  orbit.update(dt);
  hq.update(dt);
  const y = scrollY();
  const { c, u } = storyState(y);
  if (world) {
    world.target.c = c;
    world.target.u = u;
    world.light.night = sky.night;
    world.light.warm = sky.warm;
    world.light.elev = sky.elev;
    world.intro = intro.v;
    world.frame();
  }
  if (ready) syncUI(c, u, y);
  if (cursor) {
    cur.rx += (cur.x - cur.rx) * 0.2;
    cur.ry += (cur.y - cur.ry) * 0.2;
    cursor.style.transform = `translate3d(${cur.x}px,${cur.y}px,0)`;
    (cursor.lastElementChild as HTMLElement).style.transform = `translate3d(${cur.rx - cur.x}px,${cur.ry - cur.y}px,0)`;
  }
  requestAnimationFrame(tick);
}

let lastW = window.innerWidth;
let rz = 0;
window.addEventListener('resize', () => {
  if (!isMobile || Math.abs(window.innerWidth - lastW) > 2) { setVh(); lastW = window.innerWidth; }
  cancelAnimationFrame(rz);
  rz = requestAnimationFrame(() => { measure(); world?.resize(); });
});
window.addEventListener('load', measure);

/* ======================= boot ======================= */

const intro = { v: 0 };
const loaderBar = $<HTMLElement>('.ld-bar i');
function setLoad(p: number) { if (loaderBar) loaderBar.style.transform = `scaleX(${p})`; }
const greeted = (window as unknown as { __greet?: Promise<void> }).__greet ?? Promise.resolve();
function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

async function boot() {
  lockScroll(true);
  const [, mod] = await Promise.all([loadAll(setLoad), hasWebGL() ? import('./scene/World').catch(() => null) : Promise.resolve(null)]);
  if (mod) {
    try {
      world = new mod.World($<HTMLCanvasElement>('#webgl'));
      world.light.night = sky.night; world.light.warm = sky.warm; world.light.elev = sky.elev;
      world.frame();
    } catch (err) { console.error(err); world = null; }
  }
  if (!world) document.body.classList.add('no-webgl');
  measure();
  requestAnimationFrame(tick);
  // the greetings finish (about 1.5 s) while assets load in parallel; never wait longer than that
  await Promise.race([greeted, new Promise((r) => setTimeout(r, 2500))]);
  // the loader lifts like a curtain onto the desert
  gsap.to('#loader', {
    yPercent: -100, duration: reducedMotion ? 0.01 : 1.1, ease: 'power4.inOut',
    onComplete: () => $('#loader')?.remove(),
  });
  gsap.to(intro, { v: 1, duration: reducedMotion ? 0.01 : 3, ease: 'power2.out', delay: 0.2 });
  setTimeout(() => {
    ready = true;
    document.body.classList.add('ready');
    lockScroll(false);
    measure();
    startReveals();
  }, 350);
}
boot();
