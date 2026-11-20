import { APPS, WORK, ALL_SITES, CHAPTERS, PERSON, STORY, TOOLKIT, TESTIMONIALS, DIVISIONS, ABOUT, STATS, type AppItem, type Work } from '../content';
import { isMobile } from '../device';

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ARR = '<svg class="arr" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 11.5l7-7M5.5 4.5h6v6"/></svg>';
export const ext = (url: string, label: string, cls = 'btn') =>
  `<a class="${cls}" href="${url}" target="_blank" rel="noopener">${esc(label)}${ARR}</a>`;
const domain = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');
const pad = (n: number) => String(n).padStart(2, '0');
/** WebP with a JPEG fallback for browsers (and crawlers) that don't take WebP. */
export const pic = (src: string, alt: string, attrs = '') =>
  `<picture><source type="image/webp" srcset="${src}"/><img src="${src.replace(/\.webp$/, '.jpg')}" alt="${esc(alt)}" ${attrs}/></picture>`;
const firstSentences = (s: string, n = 2) => s.split(/(?<=\.)\s+/).slice(0, n).join(' ');

const label = (i: number) =>
  `<p class="ch-label rv"><span class="no">${CHAPTERS[i].no}</span><span>${CHAPTERS[i].title}</span><span class="hi">${CHAPTERS[i].hi}</span></p>`;
const sec = (i: number, cls: string, inner: string) =>
  `<section class="ch ${cls}" id="${CHAPTERS[i].id}" data-i="${i}">${inner}</section>`;

export const CAT_COLORS = ['#34c77b', '#4f7cff', '#f2a93b', '#e0567a'];

/* ---------- app posters ---------- */

export function poster(a: AppItem) {
  if (a.poster) {
    return `<div class="poster img">${pic(a.poster, '', 'class="bg" aria-hidden="true" decoding="async" loading="lazy"')}${pic(a.poster, `${a.name} app screens`, 'class="main" decoding="async" loading="lazy"')}</div>`;
  }
  if (a.id === 'next') {
    return `<div class="poster made soon">
      <p class="pm-brand">What’s next</p>
      <div class="soon-orb"><span>✦</span></div>
      <b class="pm-big">Upcoming<br/><em>soon</em></b>
      <p class="pm-sub">A new app is being built under Assudani Group.</p>
    </div>`;
  }
  const [t1, t2] = a.tone ?? ['#333', '#111'];
  return `<div class="poster made" style="--t1:${t1};--t2:${t2}">
    <p class="pm-brand">${esc(a.name)}</p>
    <p class="pm-head">${esc(a.tagline)}</p>
    <div class="phone"><div class="screen">${pic(a.screen!, `${a.name} app screen`, 'decoding="async" loading="lazy"')}</div><i class="island"></i></div>
    <div class="pm-chips">${a.points.map((p) => `<span>${esc(p.split(':')[0])}</span>`).join('')}</div>
  </div>`;
}

function appInfo(a: AppItem, k: number) {
  const soon = a.id === 'next';
  return `<div class="info${k === 0 ? ' on' : ''}" data-info="${k}">
    <p class="info-meta"><span>${pad(k + 1)} / ${pad(APPS.length)}</span>${esc(a.kind)}</p>
    <h3>${esc(a.name)}</h3>
    <span class="status${soon ? ' soon' : ''}"><i></i>${esc(a.status)}</span>
    <p class="info-copy">${esc(firstSentences(a.summary))}</p>
    <div class="row">${soon ? '' : `<button class="btn solid" data-app="${k}">Full story${ARR}</button>`}${a.links.slice(0, 1).map((l) => ext(l.url, l.label)).join('')}</div>
  </div>`;
}

/* ---------- site windows ---------- */

function browserCard(w: Work) {
  return `<div class="browser"><div class="bar"><i></i><i></i><i></i><span>${domain(w.url)}</span></div><div class="shot">${pic(w.image, `${w.name} website by Piyush Assudani`, 'loading="lazy" decoding="async"')}</div></div>`;
}

function workInfo(w: Work, k: number) {
  return `<div class="info${k === 0 ? ' on' : ''}" data-info="${k}">
    <p class="info-meta"><span>${pad(k + 1)} / ${pad(WORK.length)}</span>${esc(w.category)}${w.place ? ` · ${w.place}` : ''}</p>
    <h3>${esc(w.name)}</h3>
    <p class="info-copy">${esc(firstSentences(w.summary, 1))}</p>
    <div class="row"><button class="btn solid" data-work="${k}">Summary${ARR}</button>${ext(w.url, 'Visit site')}</div>
  </div>`;
}

/* ---------- the story ---------- */

function storyVisual(i: number) {
  const b = STORY[i];
  if (b.photo) {
    const src = b.photo === 'today' ? '/media/photos/today.webp' : '/media/photos/childhood.webp';
    const cap = b.photo === 'today' ? 'Balotra, today' : 'Where it began';
    return `<figure class="frame">${pic(src, `Piyush Assudani — ${cap}`, 'decoding="async"')}<figcaption>${cap}</figcaption></figure>`;
  }
  return `<div class="figure"><span class="fig-k">${esc(b.kicker)}</span><b>${esc(b.figure!.big)}</b><span class="fig-s">${esc(b.figure!.small)}</span></div>`;
}
function storyBeat(i: number) {
  const b = STORY[i];
  return `<span class="beat-k">${pad(i + 1)} · ${esc(b.kicker)}</span><h3>${esc(b.title)}</h3>${b.body.map((p) => `<p>${esc(p)}</p>`).join('')}`;
}

export function renderStory() {
  const s: string[] = [];

  // 00 — HOME
  s.push(sec(0, 'hero', `
    <div class="hero-in">
      <p class="eyebrow rv"><span class="greet" data-greet>Hello from Balotra</span><span class="sep"></span><span class="hi">बालोतरा, राजस्थान</span></p>
      <h1 class="hero-name"><span class="ln"><span class="rv">Piyush</span></span><span class="ln"><em class="rv">Assudani</em></span></h1>
      <div class="hero-foot">
        <p class="hero-sub rv">Full-stack developer and founder of ${PERSON.company}. A Class 12 student from Balotra who builds websites and Android apps for real businesses, and ships products of his own.</p>
        <ul class="hero-stats rv">
          <li><b>${STATS.sites}</b><span>websites live</span></li>
          <li><b>${STATS.products}</b><span>products of my own</span></li>
          <li><b>${STATS.since}</b><span>the year it started</span></li>
        </ul>
      </div>
      <div class="scroll-cue rv"><i></i><span>Scroll for the story</span></div>
    </div>`));

  // 01 — STORY
  s.push(isMobile
    ? sec(1, 'story m', `
      <div class="wrap">
        ${label(1)}
        <h2 class="ch-title rv">The story <em>so far.</em></h2>
        <div class="beats-m">${STORY.map((_, i) => `<article class="beat-m rv">${storyVisual(i)}<div class="beat-body">${storyBeat(i)}</div></article>`).join('')}</div>
      </div>`)
    : sec(1, 'story d', `
      <div class="pin">
        <div class="story-grid">
          <div class="story-vis">${STORY.map((_, i) => `<div class="vis${i === 0 ? ' on' : ''}" data-beat="${i}">${storyVisual(i)}</div>`).join('')}</div>
          <div class="story-copy">
            ${label(1)}
            <h2 class="ch-title rv">The story <em>so far.</em></h2>
            <div class="beats">${STORY.map((_, i) => `<article class="beat${i === 0 ? ' on' : ''}" data-beat="${i}">${storyBeat(i)}</article>`).join('')}</div>
            <ol class="beat-nav rv">${STORY.map((b, i) => `<li class="${i === 0 ? 'on' : ''}" data-beat="${i}"><i></i><span>${esc(b.kicker)}</span></li>`).join('')}</ol>
          </div>
        </div>
      </div>`));

  // 02 — TOOLKIT: a 3D orbit of tools + the four areas
  let ci = 0;
  const chips = TOOLKIT.flatMap((g, gi) => g.tools.map((t) => `<span class="chip" data-cat="${gi}" style="--c:${CAT_COLORS[gi]};--i:${ci++}"><i></i>${esc(t)}</span>`)).join('');
  s.push(sec(2, 'toolkit', `
    <div class="wrap kit-grid">
      <div class="kit-copy">
        ${label(2)}
        <h2 class="ch-title rv">What I build <em>with.</em></h2>
        <p class="ch-copy rv">Self-taught, one project at a time. ${isMobile ? 'Spin' : 'Drag'} the orbit, or pick an area to see its tools.</p>
        <div class="cats rv">${TOOLKIT.map((g, i) => `
          <button class="cat" data-cat="${i}" style="--c:${CAT_COLORS[i]}">
            <span class="cat-dot"></span>
            <span class="cat-txt"><b>${esc(g.area)}</b><small>${esc(g.note)}</small></span>
            <span class="cat-n">${g.tools.length}</span>
          </button>`).join('')}
        </div>
      </div>
      <div class="orbit rv" aria-label="Tools I use">
        <div class="orbit-rings"><i></i><i></i><i></i></div>
        <div class="orbit-core"><b>${TOOLKIT.reduce((n, g) => n + g.tools.length, 0)}</b><span>tools</span></div>
        ${chips}
      </div>
    </div>`));

  // 03 — APPS: 3D coverflow
  const cf = `<div class="cf-stage"><div class="cf-floor"></div>${APPS.map((a, k) => `<button class="cf-item${k === 0 ? ' on' : ''}" data-cf="${k}" aria-label="${esc(a.name)}">${poster(a)}<i class="shade"></i></button>`).join('')}</div>`;
  const dots = (n: number, key: string) => `<div class="dots" data-dots="${key}">${Array.from({ length: n }, (_, k) => `<i class="${k === 0 ? 'on' : ''}"></i>`).join('')}</div>`;
  s.push(isMobile
    ? sec(3, 'apps m', `
      <div class="wrap">
        ${label(3)}
        <h2 class="ch-title rv">From an idea to <em>the Play Store.</em></h2>
        ${cf}
        ${dots(APPS.length, 'apps')}
        <div class="infos">${APPS.map(appInfo).join('')}</div>
      </div>`)
    : sec(3, 'apps d', `
      <div class="pin">
        <div class="wrap apps-grid">
          <div class="apps-copy">
            ${label(3)}
            <h2 class="ch-title rv">From an idea to <em>the Play Store.</em></h2>
            <div class="infos rv">${APPS.map(appInfo).join('')}</div>
            ${dots(APPS.length, 'apps')}
          </div>
          ${cf}
        </div>
      </div>`));

  // 04 — WORK: 3D arc gallery
  const arc = `<div class="arc-stage"><div class="arc-ring">${WORK.map((w, k) => `<button class="arc-item${k === 0 ? ' on' : ''}" data-arc="${k}" aria-label="${esc(w.name)}">${browserCard(w)}<i class="shade"></i></button>`).join('')}</div></div>`;
  s.push(sec(4, `work ${isMobile ? 'm' : 'd'}`, `
    <div class="${isMobile ? '' : 'pin'}">
      <div class="wrap work-head">
        ${label(4)}
        <div class="head-row">
          <h2 class="ch-title rv">Real businesses, <em>live online.</em></h2>
          <button class="link-all rv" data-open-sites>More live sites →</button>
        </div>
      </div>
      ${arc}
      <div class="wrap work-foot">
        <div class="infos">${WORK.map(workInfo).join('')}</div>
        <div class="arc-progress"><i></i></div>
      </div>
    </div>`));

  // 05 — GROUP: the company as a 3D structure — group → divisions → products
  const products = APPS.filter((a) => a.id !== 'next');
  s.push(sec(5, 'group', `
    <div class="wrap group-grid">
      <div class="group-copy">
        ${label(5)}
        <h2 class="ch-title rv">Assudani <em>Group.</em></h2>
        <p class="ch-copy rv">A software and design company from Rajasthan, working out of Jodhpur and Balotra. I run it while I finish school. ${STATS.sites} websites are live and ${STATS.products} products of our own have shipped. Clients get one team for the whole job: design, development, Play Store publishing and maintenance.</p>
        <div class="row rv">${ext('https://assudanigroup.online', 'Visit assudanigroup.online', 'btn solid')}<a class="btn" href="/apps/">Our products${ARR}</a></div>
      </div>
      <div class="hq rv" aria-label="Assudani Group: two divisions and three products">
        <div class="hq-scene">
          <a class="hq-layer hq-group" href="https://assudanigroup.online" target="_blank" rel="noopener">
            <span class="hq-k">The company</span>
            <b>Assudani Group</b>
            <span class="hq-url">assudanigroup.online ↗</span>
            <span class="hq-meta"><i>${STATS.sites}</i> websites live <i>${STATS.products}</i> products</span>
          </a>
          ${DIVISIONS.map((d, i) => `
          <div class="hq-layer hq-div hq-div-${i}">
            <span class="hq-k">${d.no} · ${esc(d.kind)}</span>
            <b>${esc(d.name)}</b>
            <ul>${d.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
          </div>`).join('')}
          ${products.map((a, i) => `
          <button class="hq-layer hq-prod hq-prod-${i}" data-app="${APPS.indexOf(a)}" aria-label="${esc(a.name)}: open summary">
            <span class="hq-thumb">${a.poster ? pic(a.poster, a.name, 'loading="lazy"') : `<span class="hq-thumb-made" style="--t1:${a.tone?.[0]};--t2:${a.tone?.[1]}">${pic(a.screen!, a.name, 'loading="lazy"')}</span>`}</span>
            <span class="hq-k">Product</span>
            <b>${esc(a.name)}</b>
          </button>`).join('')}
          <svg class="hq-wires" viewBox="0 0 620 600" aria-hidden="true"><path d="M310 130 V160 H155 V190 M310 160 H465 V190 M155 330 V365 H105 V395 M155 365 H310 V395 M155 365 H515 V395"/></svg>
        </div>
      </div>
    </div>`));

  // 06 — WORDS: every review, drifting past like lanterns
  const stars = (n: number) => `<span class="stars" aria-label="${n} out of 5">${'★'.repeat(n)}<i>${'★'.repeat(5 - n)}</i></span>`;
  const quote = (t: (typeof TESTIMONIALS)[number]) =>
    `<figure class="quote">${stars(t.stars)}<blockquote>“${esc(t.quote)}”</blockquote><figcaption>${esc(t.who)}</figcaption></figure>`;
  const half = Math.ceil(TESTIMONIALS.length / 2);
  const rowA = TESTIMONIALS.slice(0, half).map(quote).join(''), rowB = TESTIMONIALS.slice(half).map(quote).join('');
  s.push(sec(6, 'words', `
    <div class="wrap">
      ${label(6)}
      <div class="head-row">
        <h2 class="ch-title rv">Kind words <em>from clients.</em></h2>
        <p class="ch-copy rv">${TESTIMONIALS.length} reviews, as they were left.</p>
      </div>
    </div>
    ${isMobile
      ? `<div class="wrap"><div class="quotes-m rv">${TESTIMONIALS.map(quote).join('')}</div></div>`
      : `<div class="marquee rv"><div class="track">${rowA}${rowA}</div></div><div class="marquee rev rv"><div class="track">${rowB}${rowB}</div></div>`}
  `));

  // 07 — ABOUT
  s.push(sec(7, 'about', `
    <div class="wrap about-grid">
      <div class="stack rv" aria-label="Photos of Piyush">
        ${ABOUT.photos.map((p, i) => `<figure class="ph" style="--i:${i}">${pic(p.src, `Piyush Assudani — ${p.cap}`, 'loading="lazy" decoding="async"')}<figcaption>${esc(p.cap)}</figcaption></figure>`).join('')}
      </div>
      <div class="about-copy">
        ${label(7)}
        <h2 class="ch-title rv">The person <em>behind it.</em></h2>
        ${ABOUT.paragraphs.map((p) => `<p class="about-p rv">${esc(p)}</p>`).join('')}
        <dl class="facts rv">${ABOUT.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      </div>
    </div>
    <div class="fullname rv" aria-label="${ABOUT.fullName}">
      ${ABOUT.fullName.split(' ').map((w, i) => `<span style="--i:${i}">${w}</span>`).join(' ')}
    </div>`));

  // 08 — CONTACT
  s.push(sec(8, 'contact', `
    <div class="wrap">
      ${label(8)}
      <h2 class="ch-title big rv">Let’s build <em>what’s next.</em></h2>
      <p class="ch-copy rv">A website for your business, an Android app, or a brand that needs to look right. Tell me what you have in mind and I’ll reply myself.</p>
      <form class="compose rv" autocomplete="off">
        <label><span>Your name</span><input name="name" required maxlength="60" placeholder="Name or business"/></label>
        <label><span>What are we building?</span><input name="msg" required maxlength="400" placeholder="A website for my store…"/></label>
        <div class="row">
          <button type="submit" class="btn solid" data-via="wa">Send on WhatsApp${ARR}</button>
          <button type="submit" class="btn" data-via="mail">Send by email${ARR}</button>
        </div>
      </form>
      <div class="contact-row rv">
        <a href="mailto:${PERSON.email}">${PERSON.email}</a>
        <a href="${PERSON.whatsapp}" target="_blank" rel="noopener">${PERSON.phone}</a>
      </div>
      <div class="socials rv">${PERSON.socials.map((x) => ext(x.url, x.label, 'soc')).join('')}</div>
    </div>
    <footer class="foot">
      <nav aria-label="Pages"><a href="/about/">About</a><a href="/work/">Work</a><a href="/apps/">Apps</a><a href="/apps/atteni/">Atteni</a><a href="/apps/pypocket/">PyPocket</a><a href="/apps/perfect-bandhan/">Perfect Bandhan</a><a href="/contact/">Contact</a><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a></nav>
      <p class="credit">Designed &amp; developed by <a href="/about/">Piyush Assudani</a>, founder of Assudani Developer · <a href="https://assudanigroup.online" target="_blank" rel="noopener">Assudani Group</a></p>
      <p>© ${new Date().getFullYear()} ${ABOUT.fullName} · Balotra, Rajasthan</p>
    </footer>`));

  return s.join('\n');
}

/* ---------- summary sheet content ---------- */

export function appSheet(a: AppItem) {
  const gallery = a.gallery?.length
    ? `<p class="sh-sub">Inside the app</p><div class="sh-gallery">${a.gallery.map((g) => pic(g, `${a.name} screen`, 'loading="lazy"')).join('')}</div>` : '';
  return `
    <div class="sh-hero app-hero">${poster(a)}</div>
    <p class="sh-kind">${esc(a.kind)}</p>
    <h3 class="sh-title">${esc(a.name)}</h3>
    <span class="status${a.id === 'next' ? ' soon' : ''}"><i></i>${esc(a.status)}</span>
    <p class="sh-lead">${esc(a.tagline)}</p>
    <p class="sh-body">${esc(a.summary)}</p>
    ${a.points.length ? `<ul class="sh-points">${a.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
    ${gallery}
    ${a.links.length ? `<div class="row">${a.links.map((l, i) => ext(l.url, l.label, i === 0 ? 'btn solid' : 'btn')).join('')}<a class="btn" href="/apps/${a.id === 'bandhan' ? 'perfect-bandhan' : a.id}/">Product page${ARR}</a></div>` : ''}`;
}

export function workSheet(w: Work) {
  return `
    <div class="sh-hero">${browserCard(w)}</div>
    <p class="sh-kind">${esc(w.category)}${w.place ? ` · ${w.place}` : ''}</p>
    <h3 class="sh-title">${esc(w.name)}</h3>
    <p class="sh-body">${esc(w.summary)}</p>
    <p class="sh-sub">What I built</p>
    <ul class="sh-points">${w.built.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
    <div class="row">${ext(w.url, 'Visit the live site', 'btn solid')}</div>`;
}

/* ---------- chrome ---------- */

export const SKY_ICONS: Record<string, string> = {
  sunrise: '<svg viewBox="0 0 24 24"><path d="M3 18h18M6 18a6 6 0 0 1 12 0M12 6V3M5.6 9.6 4 8M18.4 9.6 20 8"/></svg>',
  day: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>',
  sunset: '<svg viewBox="0 0 24 24"><path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 3v6m-3-3 3 3 3-3"/></svg>',
  evening: '<svg viewBox="0 0 24 24"><path d="M3 18h18M17 13.5A6 6 0 0 1 9.5 6a6 6 0 1 0 7.5 7.5Z"/></svg>',
  night: '<svg viewBox="0 0 24 24"><path d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1Z"/><path d="M17 4.5v2M16 5.5h2"/></svg>',
};

export function renderChrome() {
  const opts: [string, string][] = [['auto', 'Live · my clock'], ['sunrise', 'Sunrise'], ['day', 'Day'], ['sunset', 'Sunset'], ['evening', 'Evening'], ['night', 'Night']];
  return `
  <header class="hud-top">
    <a href="#home" class="brand" data-goto="0"><span class="badge">PA</span><span class="brand-name">Piyush Assudani</span></a>
    <div class="hud-ch"><span class="hud-no">00</span><span class="hud-title">Home</span></div>
    <div class="hud-actions">
      <div class="sky">
        <button class="sky-btn" aria-haspopup="true" aria-expanded="false" aria-label="Time of day">
          <span class="sky-ic"></span><span class="sky-txt"><b class="sky-phase">Day</b><small class="sky-time"></small></span>
        </button>
        <div class="sky-menu" role="menu">
          <p>The sky follows your clock</p>
          ${opts.map(([k, t]) => `<button role="menuitemradio" data-sky="${k}"><span class="sky-ic">${SKY_ICONS[k === 'auto' ? 'day' : k]}</span>${t}</button>`).join('')}
        </div>
      </div>
      <button class="talk" data-goto="8">Let’s talk</button>
      <button class="menu-btn" aria-label="Open chapters"><i></i><i></i></button>
    </div>
  </header>
  <nav class="menu" aria-hidden="true">
    <div class="menu-inner">
      <p class="menu-head">Chapters</p>
      <ol>${CHAPTERS.map((c, i) => `<li style="--i:${i}"><button data-goto="${i}"><span class="no">${c.no}</span>${c.title}<span class="hi">${c.hi}</span></button></li>`).join('')}</ol>
      <div class="menu-foot"><a href="mailto:${PERSON.email}">${PERSON.email}</a><span>${PERSON.location}</span></div>
    </div>
  </nav>
  <div class="hud-bottom"><div class="progress"><i></i></div></div>
  <div class="sites overlay" aria-hidden="true">
    <div class="sites-inner">
      <button class="x" data-close aria-label="Close">×</button>
      <p class="ch-label"><span class="no">04</span><span>Client work</span></p>
      <h2 class="ch-title">${ALL_SITES.length} sites, <em>live.</em></h2>
      <ul>${ALL_SITES.map((x) => `<li><a href="${x.url}" target="_blank" rel="noopener"><span>${esc(x.name)}</span><span class="dom">${domain(x.url)} ↗</span></a></li>`).join('')}</ul>
    </div>
  </div>
  <aside class="sheet overlay" aria-hidden="true">
    <div class="sheet-panel" role="dialog" aria-modal="true" aria-label="Summary">
      <button class="x" data-close aria-label="Close">×</button>
      <div class="sheet-body"></div>
    </div>
  </aside>
  ${isMobile ? '' : '<div class="cursor"><i class="dot"></i><i class="ring"></i></div>'}
  `;
}
