// Static, crawlable sub-pages (one per product, plus Apps, Work, About and Contact) so search engines can index each
// on its own and show them as sitelinks. Generated from src/content.ts at build time into public/.
import fs from 'node:fs';
import path from 'node:path';
import { PERSON, STORY, APPS, WORK, ALL_SITES, TESTIMONIALS, ABOUT, STATS, type AppItem } from './src/content';

export const SITE = 'https://piyushassudani.in';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jpg = (p: string) => p.replace(/\.webp$/, '.jpg');
export const SLUG: Record<string, string> = { atteni: 'atteni', pypocket: 'pypocket', bandhan: 'perfect-bandhan' };
export const PRODUCTS = APPS.filter((a) => a.id !== 'next');

/** A linked image: Google can find both the WebP and the JPEG, and the link points at the full image. */
const img = (src: string, alt: string, w: number, h: number, cls = '') =>
  `<a class="imglink ${cls}" href="${jpg(src)}" title="${esc(alt)}"><picture><source type="image/webp" srcset="${src}"/><img src="${jpg(src)}" alt="${esc(alt)}" width="${w}" height="${h}" loading="lazy" decoding="async"/></picture></a>`;

const CSS = `:root{--bg:#f5e6d0;--ink:#241509;--dim:rgba(36,21,9,.76);--line:rgba(36,21,9,.14);--accent:#b4441c;--panel:#fdf8f0;color-scheme:light dark}
@media (prefers-color-scheme:dark){:root{--bg:#0b0c1f;--ink:#f4ead9;--dim:rgba(244,234,217,.78);--line:rgba(244,234,217,.14);--accent:#f2aa48;--panel:#15163a}}
*{box-sizing:border-box;margin:0;padding:0}body{background:var(--bg);color:var(--ink);font:16px/1.7 Manrope,Arial,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--accent)}img{display:block;max-width:100%;height:auto}
header{max-width:1080px;margin:0 auto;padding:24px 22px;display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap}
.brand{display:flex;align-items:center;gap:10px;color:var(--ink);text-decoration:none;font-weight:700}
.badge{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--accent);color:var(--bg);font:italic 500 16px Fraunces,Georgia,serif}
nav.top{display:flex;gap:6px;flex-wrap:wrap}nav.top a{color:var(--ink);text-decoration:none;font-weight:600;font-size:14px;padding:8px 14px;border-radius:999px;border:1px solid transparent}
nav.top a:hover,nav.top a[aria-current]{border-color:var(--line);background:var(--panel)}
main{max-width:1080px;margin:0 auto;padding:20px 22px 70px}
.crumbs{font-size:13px;color:var(--dim)}.crumbs a{color:var(--dim)}
.kicker{font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-top:22px}
h1{font:400 clamp(42px,7vw,76px)/1.04 Fraunces,Georgia,serif;letter-spacing:-.02em;margin:8px 0 14px}h1 em,h2 em{color:var(--accent)}
h2{font:400 clamp(28px,3.4vw,38px)/1.15 Fraunces,Georgia,serif;margin:46px 0 12px}
h3{font:400 24px/1.2 Fraunces,Georgia,serif;margin:6px 0}
.lead{font-size:19px;max-width:760px}p{color:var(--dim);margin-top:12px;max-width:760px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px;margin-top:24px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:6px}
.card .imglink img{border-radius:12px;aspect-ratio:16/10;object-fit:cover;object-position:top;width:100%}
.card.app .imglink img{aspect-ratio:9/16}
.split{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:40px;align-items:start;margin-top:20px}
.poster img{border-radius:22px;box-shadow:0 30px 60px -30px rgba(0,0,0,.5)}
ul.points{list-style:none;margin-top:16px}ul.points li{padding:10px 0 10px 24px;border-top:1px solid var(--line);position:relative;color:var(--ink)}
ul.points li::before{content:'✦';position:absolute;left:0;color:var(--accent);font-size:11px;top:13px}
.btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.btn{display:inline-flex;align-items:center;height:46px;padding:0 20px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--ink);text-decoration:none;font-weight:700;font-size:14px}
.btn.solid{background:var(--accent);border-color:var(--accent);color:var(--bg)}
.status{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#2f9e5f}
.gallery{display:flex;gap:12px;overflow-x:auto;margin-top:18px;padding-bottom:8px}.gallery img{height:320px;width:auto;border-radius:14px}
.photos{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px}.photos img{border-radius:12px;aspect-ratio:4/5;object-fit:cover;width:100%}
dl{display:grid;grid-template-columns:repeat(2,1fr);gap:0 24px;margin-top:20px}dl div{padding:12px 0;border-top:1px solid var(--line)}dt{font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--accent)}dd{font-weight:600}
blockquote{font:italic 20px/1.4 Fraunces,Georgia,serif;margin-top:16px}blockquote footer{font:700 12px Manrope,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-top:6px}
.sites{columns:2;column-gap:30px;margin-top:16px;list-style:none}.sites li{break-inside:avoid;border-top:1px solid var(--line);padding:9px 0}
.fullname{font:400 clamp(30px,5vw,64px)/1.05 Fraunces,Georgia,serif;text-align:center;margin-top:56px}
footer.site{max-width:1080px;margin:0 auto;padding:30px 22px 44px;border-top:1px solid var(--line);font-size:13px;color:var(--dim);display:flex;flex-direction:column;gap:12px}
footer.site nav{display:flex;flex-wrap:wrap;gap:6px 16px}footer.site a{color:var(--dim)}
@media (max-width:760px){.split{grid-template-columns:1fr}.photos{grid-template-columns:repeat(2,1fr)}dl{grid-template-columns:1fr}.sites{columns:1}.gallery img{height:240px}}`;

const NAV: [string, string][] = [['/', 'Home'], ['/about/', 'About'], ['/work/', 'Work'], ['/apps/', 'Apps'], ['/contact/', 'Contact']];

export const CREDIT = `Designed &amp; developed by <a href="${SITE}/about/">Piyush Assudani</a>, founder of Assudani Developer · <a href="https://assudanigroup.online">Assudani Group</a>`;

function page(o: { path: string; title: string; desc: string; image: string; crumbs: [string, string][]; body: string; ld: object[] }) {
  const crumbLd = {
    '@type': 'BreadcrumbList',
    itemListElement: o.crumbs.map(([url, name], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${url}` })),
  };
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}"/>
<meta name="author" content="${ABOUT.fullName}"/>
<meta name="robots" content="index, follow, max-image-preview:large"/>
<link rel="canonical" href="${SITE}${o.path}"/>
<meta property="og:type" content="website"/><meta property="og:site_name" content="Piyush Assudani"/><meta property="og:locale" content="en_IN"/>
<meta property="og:title" content="${esc(o.title)}"/><meta property="og:description" content="${esc(o.desc)}"/>
<meta property="og:url" content="${SITE}${o.path}"/><meta property="og:image" content="${SITE}${o.image}"/>
<meta name="twitter:card" content="summary_large_image"/><meta name="twitter:image" content="${SITE}${o.image}"/>
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32"/><link rel="apple-touch-icon" href="/apple-touch-icon.png"/><link rel="manifest" href="/site.webmanifest"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Manrope:wght@400;600;700&display=swap" rel="stylesheet"/>
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': [crumbLd, ...o.ld] })}</script>
<style>${CSS}</style>
</head>
<body>
<header><a class="brand" href="/"><span class="badge">PA</span>Piyush Assudani</a>
<nav class="top" aria-label="Main">${NAV.map(([u, n]) => `<a href="${u}"${u === o.path ? ' aria-current="page"' : ''}>${n}</a>`).join('')}</nav></header>
<main>
<p class="crumbs">${o.crumbs.map(([u, n], i) => (i === o.crumbs.length - 1 ? esc(n) : `<a href="${u}">${esc(n)}</a>`)).join(' / ')}</p>
${o.body}
</main>
<footer class="site">
<nav aria-label="Footer">${NAV.map(([u, n]) => `<a href="${u}">${n}</a>`).join('')}${PRODUCTS.map((a) => `<a href="/apps/${SLUG[a.id]}/">${esc(a.name)}</a>`).join('')}<a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/sitemap.xml">Sitemap</a></nav>
<p>${CREDIT}</p>
<p>© ${new Date().getFullYear()} ${ABOUT.fullName} · Balotra, Rajasthan, India</p>
</footer>
</body>
</html>
`;
}

const person = { '@type': 'Person', '@id': `${SITE}/#person`, name: PERSON.name, alternateName: ABOUT.fullName, url: `${SITE}/` };
const appLd = (a: AppItem) => ({
  '@type': 'SoftwareApplication',
  name: a.name,
  description: a.summary,
  applicationCategory: a.id === 'bandhan' ? 'LifestyleApplication' : 'EducationalApplication',
  operatingSystem: 'Android, Web',
  url: `${SITE}/apps/${SLUG[a.id]}/`,
  sameAs: a.links.map((l) => l.url),
  image: `${SITE}${jpg((a.poster ?? a.screen)!)}`,
  author: person,
  publisher: { '@type': 'Organization', name: PERSON.company, url: 'https://assudanigroup.online' },
});

function productPage(a: AppItem) {
  const src = (a.poster ?? a.screen)!;
  const others = PRODUCTS.filter((x) => x.id !== a.id);
  return page({
    path: `/apps/${SLUG[a.id]}/`,
    title: `${a.name} — ${a.tagline.replace(/\.$/, '')} | by Piyush Assudani`,
    desc: `${a.name}: ${a.summary.split('. ').slice(0, 2).join('. ')}. Built by Piyush Assudani, Assudani Group.`.slice(0, 300),
    image: jpg(src),
    crumbs: [['/', 'Home'], ['/apps/', 'Apps'], [`/apps/${SLUG[a.id]}/`, a.name]],
    ld: [appLd(a)],
    body: `<p class="kicker">${esc(a.kind)}</p>
<h1>${esc(a.name)}</h1>
<span class="status">● ${esc(a.status)}</span>
<div class="split">
  <div class="poster">${img(src, `${a.name} app by Piyush Assudani`, 600, 1200)}</div>
  <div>
    <p class="lead">${esc(a.tagline)}</p>
    <p>${esc(a.summary)}</p>
    <ul class="points">${a.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
    <div class="btns">${a.links.map((l, i) => `<a class="btn${i === 0 ? ' solid' : ''}" href="${l.url}" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div>
    <p>Designed, built and published by <a href="/about/">Piyush Assudani</a> under <a href="https://assudanigroup.online">Assudani Group</a>, Balotra, Rajasthan.</p>
  </div>
</div>
${a.gallery?.length ? `<h2>Inside <em>${esc(a.name)}</em></h2><div class="gallery">${a.gallery.map((g, i) => img(g, `${a.name} screen ${i + 1}`, 700, 1400)).join('')}</div>` : ''}
<h2>More <em>products</em></h2>
<div class="grid">${others.map((o) => `<div class="card app">${img((o.poster ?? o.screen)!, `${o.name} app`, 600, 1200)}<h3><a href="/apps/${SLUG[o.id]}/">${esc(o.name)}</a></h3><p>${esc(o.tagline)}</p></div>`).join('')}</div>`,
  });
}

function appsPage() {
  return page({
    path: '/apps/',
    title: `Apps & products by Piyush Assudani — Atteni, PyPocket, Perfect Bandhan`,
    desc: `Products built by Piyush Assudani and Assudani Group: Atteni (school-bus tracking), PyPocket (learn and run Python on your phone) and Perfect Bandhan (Sindhi matchmaking). ${STATS.products} products of his own.`,
    image: '/og-image.jpg',
    crumbs: [['/', 'Home'], ['/apps/', 'Apps']],
    ld: [{ '@type': 'CollectionPage', name: 'Apps by Piyush Assudani', url: `${SITE}/apps/`, hasPart: PRODUCTS.map(appLd) }],
    body: `<p class="kicker">Products</p>
<h1>From an idea to <em>the Play Store.</em></h1>
<p class="lead">${STATS.products} products of my own, built under Assudani Group. These are the ones that are public; more are on the way.</p>
<div class="grid">${PRODUCTS.map((a) => `<div class="card app">${img((a.poster ?? a.screen)!, `${a.name} app by Piyush Assudani`, 600, 1200)}<p class="kicker" style="margin:6px 0 0">${esc(a.kind)}</p><h3><a href="/apps/${SLUG[a.id]}/">${esc(a.name)}</a></h3><p>${esc(a.tagline)}</p><span class="status">● ${esc(a.status)}</span></div>`).join('')}</div>
<h2>Upcoming <em>soon</em></h2><p>More apps are in the works under Assudani Group. They will show up here first, once they’re live.</p>`,
  });
}

function workPage() {
  return page({
    path: '/work/',
    title: `Client websites by Piyush Assudani — ${STATS.sites} sites live`,
    desc: `Websites built by Piyush Assudani for real businesses in Balotra, Rajasthan and across India: MRK Engineers, Novia World, Aryan Steel, Prowear, Rainbow E Smart School and more. ${STATS.sites} websites live.`,
    image: jpg(WORK[0].image),
    crumbs: [['/', 'Home'], ['/work/', 'Work']],
    ld: [{
      '@type': 'CollectionPage', name: 'Client websites by Piyush Assudani', url: `${SITE}/work/`,
      mainEntity: { '@type': 'ItemList', itemListElement: WORK.map((w, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'WebSite', name: w.name, url: w.url, description: w.summary, image: `${SITE}${jpg(w.image)}`, creator: person } })) },
    }],
    body: `<p class="kicker">Client work</p>
<h1>Real businesses, <em>live online.</em></h1>
<p class="lead">${STATS.sites} websites live, many of them for shops, schools and manufacturers in Balotra that I first met by walking in through the door.</p>
<div class="grid">${WORK.map((w) => `<article class="card">${img(w.image, `${w.name} website designed and developed by Piyush Assudani`, 1280, 800)}<p class="kicker" style="margin:6px 0 0">${esc(w.category)}${w.place ? ` · ${w.place}` : ''}</p><h3>${esc(w.name)}</h3><p>${esc(w.summary)}</p><a href="${w.url}" rel="noopener">Visit ${esc(w.url.replace(/^https?:\/\//, '').replace(/\/$/, ''))} ↗</a></article>`).join('')}</div>
<h2>All live <em>sites</em></h2>
<ul class="sites">${ALL_SITES.map((s) => `<li><a href="${s.url}" rel="noopener">${esc(s.name)}</a></li>`).join('')}</ul>
<h2>What clients <em>say</em></h2>
${TESTIMONIALS.map((t) => `<blockquote>“${esc(t.quote)}”<footer>${esc(t.who)} · ${'★'.repeat(t.stars)}</footer></blockquote>`).join('')}`,
  });
}

function aboutPage() {
  const photos: [string, string][] = [
    ...ABOUT.photos.map((p) => [p.src, p.cap] as [string, string]),
    ['/media/photos/today.webp', 'Balotra, today'],
    ['/media/photos/childhood.webp', 'Where it began'],
  ];
  return page({
    path: '/about/',
    title: `About Piyush Assudani (${ABOUT.fullName}) — Full-Stack Developer, Balotra`,
    desc: `${ABOUT.fullName}: a self-taught full-stack developer from Balotra, Rajasthan, Class 12 PCM student and founder of Assudani Group. His story, from a ₹500 first client to the Play Store.`,
    image: '/media/photos/portrait.jpg',
    crumbs: [['/', 'Home'], ['/about/', 'About']],
    ld: [{
      '@type': 'AboutPage', url: `${SITE}/about/`, name: `About ${PERSON.name}`,
      mainEntity: {
        ...person, jobTitle: 'Full-Stack Developer', image: photos.map(([p]) => `${SITE}${jpg(p)}`),
        address: { '@type': 'PostalAddress', addressLocality: 'Balotra', addressRegion: 'Rajasthan', addressCountry: 'IN' },
        founder: { '@type': 'Organization', name: PERSON.company, url: 'https://assudanigroup.online' },
        sameAs: PERSON.socials.map((s) => s.url),
      },
    }],
    body: `<p class="kicker">About me</p>
<h1>The person <em>behind it.</em></h1>
${ABOUT.paragraphs.map((p, i) => `<p${i === 0 ? ' class="lead"' : ''}>${esc(p)}</p>`).join('')}
<div class="photos">${photos.map(([src, cap]) => img(src, `Piyush Assudani — ${cap}`, 800, 1000)).join('')}</div>
<dl>${ABOUT.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
<h2>The story <em>so far</em></h2>
${STORY.map((b) => `<h3>${esc(b.title)}</h3>${b.body.map((p) => `<p>${esc(p)}</p>`).join('')}`).join('')}
<p class="fullname">${ABOUT.fullName}</p>`,
  });
}

function contactPage() {
  return page({
    path: '/contact/',
    title: 'Contact Piyush Assudani — websites, Android apps, design',
    desc: `Contact Piyush Assudani for a website, an Android app or brand design. Email ${PERSON.email}, WhatsApp ${PERSON.phone}. Assudani Group, Balotra, Rajasthan.`,
    image: '/og-image.jpg',
    crumbs: [['/', 'Home'], ['/contact/', 'Contact']],
    ld: [{ '@type': 'ContactPage', url: `${SITE}/contact/`, mainEntity: { ...person, email: `mailto:${PERSON.email}`, telephone: PERSON.phone.replace(/\s/g, '') } }],
    body: `<p class="kicker">Contact</p>
<h1>Let’s build <em>what’s next.</em></h1>
<p class="lead">A website for your business, an Android app, or a brand that needs to look right. Tell me what you have in mind and I’ll reply myself.</p>
<div class="btns"><a class="btn solid" href="${PERSON.whatsapp}" rel="noopener">WhatsApp ${PERSON.phone} ↗</a><a class="btn" href="mailto:${PERSON.email}">${PERSON.email}</a><a class="btn" href="https://assudanigroup.online">assudanigroup.online ↗</a></div>
<h2>Elsewhere</h2>
<div class="btns">${PERSON.socials.map((s) => `<a class="btn" href="${s.url}" rel="noopener me">${esc(s.label)} ↗</a>`).join('')}</div>
<p>Based in Balotra, Rajasthan, India. Assudani Group works out of Jodhpur and Balotra, with clients across India.</p>`,
  });
}

export const PAGE_PATHS = ['/about/', '/work/', '/apps/', ...PRODUCTS.map((a) => `/apps/${SLUG[a.id]}/`), '/contact/'];

export function writePages(pub: string) {
  const out: [string, string][] = [
    ['about/index.html', aboutPage()], ['work/index.html', workPage()], ['apps/index.html', appsPage()], ['contact/index.html', contactPage()],
    ...PRODUCTS.map((a) => [`apps/${SLUG[a.id]}/index.html`, productPage(a)] as [string, string]),
  ];
  for (const [rel, html] of out) {
    const f = path.join(pub, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, html);
  }
}
