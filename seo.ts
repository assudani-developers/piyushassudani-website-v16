// Build-time SEO: structured data, crawlable no-JS content, sitemap, robots.txt, llms.txt and the web manifest,
// all generated from src/content.ts so they never drift from what the page shows.
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { PERSON, STORY, APPS, WORK, ALL_SITES, TOOLKIT, TESTIMONIALS, ABOUT, STATS, DIVISIONS } from './src/content';
import { writePages, PAGE_PATHS, PRODUCTS, SLUG } from './pages';

const SITE = 'https://www.piyushassudani.in';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const today = new Date().toISOString().slice(0, 10);
const abs = (p: string) => `${SITE}${p}`;
const jpg = (p: string) => p.replace(/\.webp$/, '.jpg');

const DESCRIPTION = `Piyush Assudani (${ABOUT.fullName}) is a self-taught full-stack developer from Balotra, Rajasthan and the founder of Assudani Group, with ${STATS.sites} websites live and ${STATS.products} products of his own.`;

function jsonLd() {
  const person = {
    '@type': 'Person',
    '@id': `${SITE}/#person`,
    name: PERSON.name,
    alternateName: [ABOUT.fullName, 'Piyush Assudani Balotra'],
    givenName: 'Piyush',
    familyName: 'Assudani',
    jobTitle: 'Full-Stack Developer',
    description: DESCRIPTION,
    url: `${SITE}/`,
    image: [abs('/media/photos/portrait.jpg'), abs('/media/photos/today.jpg')],
    email: `mailto:${PERSON.email}`,
    telephone: PERSON.phone.replace(/\s/g, ''),
    address: { '@type': 'PostalAddress', addressLocality: 'Balotra', addressRegion: 'Rajasthan', addressCountry: 'IN' },
    homeLocation: { '@type': 'Place', name: 'Balotra, Rajasthan, India' },
    nationality: { '@type': 'Country', name: 'India' },
    knowsAbout: TOOLKIT.flatMap((g) => g.tools).concat(['Android app development', 'Web development', 'Full-stack development', 'UI/UX design']),
    knowsLanguage: ['en', 'hi'],
    founder: { '@id': `${SITE}/#org` },
    worksFor: { '@id': `${SITE}/#org` },
    sameAs: PERSON.socials.map((s) => s.url),
  };
  const org = {
    '@type': 'Organization',
    '@id': `${SITE}/#org`,
    name: PERSON.company,
    url: 'https://assudanigroup.online',
    founder: { '@id': `${SITE}/#person` },
    description: 'Software and design company from Rajasthan building websites, Android apps and brand identities.',
    areaServed: 'IN',
    address: { '@type': 'PostalAddress', addressLocality: 'Balotra', addressRegion: 'Rajasthan', addressCountry: 'IN' },
    department: DIVISIONS.map((d) => ({ '@type': 'Organization', name: d.name, description: d.lines.join(', ') })),
  };
  const apps = APPS.filter((a) => a.id !== 'next').map((a) => ({
    '@type': 'SoftwareApplication',
    name: a.name,
    description: a.summary,
    applicationCategory: a.id === 'bandhan' ? 'LifestyleApplication' : 'EducationalApplication',
    operatingSystem: 'Android, Web',
    url: a.links[a.links.length - 1]?.url,
    sameAs: a.links.map((l) => l.url),
    image: abs(jpg(a.poster ?? a.screen ?? '')),
    author: { '@id': `${SITE}/#person` },
    publisher: { '@id': `${SITE}/#org` },
  }));
  const work = {
    '@type': 'ItemList',
    name: 'Websites built by Piyush Assudani',
    numberOfItems: WORK.length,
    itemListElement: WORK.map((w, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: { '@type': 'WebSite', name: w.name, url: w.url, description: w.summary, image: abs(jpg(w.image)), creator: { '@id': `${SITE}/#person` } },
    })),
  };
  const site = {
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    url: `${SITE}/`,
    name: 'Piyush Assudani',
    inLanguage: 'en-IN',
    publisher: { '@id': `${SITE}/#person` },
  };
  const page = {
    '@type': 'ProfilePage',
    '@id': `${SITE}/#profile`,
    url: `${SITE}/`,
    name: 'Piyush Assudani — Full-Stack Developer from Balotra',
    description: DESCRIPTION,
    inLanguage: 'en-IN',
    isPartOf: { '@id': `${SITE}/#website` },
    mainEntity: { '@id': `${SITE}/#person` },
    primaryImageOfPage: abs('/og-image.jpg'),
    dateModified: today,
  };
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': [page, site, person, org, ...apps, work] })}</script>`;
}

/** The full story as plain HTML for crawlers, AI agents and anyone without JavaScript. */
function noscript() {
  return `<noscript><article class="seo-plain">
<h1>${esc(PERSON.name)} — Full-Stack Developer from Balotra, Rajasthan</h1>
<p>${esc(DESCRIPTION)}</p>
<h2>The story so far</h2>
${STORY.map((b) => `<h3>${esc(b.kicker)}: ${esc(b.title)}</h3>${b.body.map((p) => `<p>${esc(p)}</p>`).join('')}`).join('\n')}
<h2>What I build with</h2>
<ul>${TOOLKIT.map((g) => `<li><strong>${esc(g.area)}:</strong> ${esc(g.tools.join(', '))}</li>`).join('')}</ul>
<h2>Apps</h2>
${APPS.map((a) => `<h3>${esc(a.name)} (${esc(a.status)})</h3><p>${esc(a.summary)}</p>${a.links.map((l) => `<a href="${l.url}">${esc(l.label)}</a>`).join(' · ')}`).join('\n')}
<h2>Client work</h2>
<ul>${WORK.map((w) => `<li><a href="${w.url}">${esc(w.name)}</a> — ${esc(w.category)}. ${esc(w.summary)}</li>`).join('')}</ul>
<h2>Reviews</h2>
${TESTIMONIALS.map((t) => `<blockquote>“${esc(t.quote)}” — ${esc(t.who)} (${t.stars}/5)</blockquote>`).join('')}
<h2>About ${esc(ABOUT.fullName)}</h2>
${ABOUT.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
<h2>Contact</h2>
<p><a href="mailto:${PERSON.email}">${PERSON.email}</a> · <a href="${PERSON.whatsapp}">WhatsApp ${PERSON.phone}</a></p>
<p><a href="/about/">About</a> · <a href="/work/">Work</a> · <a href="/apps/">Apps</a> · ${PRODUCTS.map((a) => `<a href="/apps/${SLUG[a.id]}/">${esc(a.name)}</a>`).join(' · ')} · <a href="/contact/">Contact</a> · <a href="/privacy.html">Privacy policy</a> · <a href="/terms.html">Terms of use</a></p>
</article></noscript>`;
}

function sitemap() {
  const images = ['/media/photos/portrait.jpg', '/media/photos/today.jpg', '/media/photos/jacket.jpg', '/media/photos/city.jpg', '/media/photos/palace.jpg', '/media/photos/childhood.jpg', '/og-image.jpg']
    .concat(WORK.map((w) => jpg(w.image)), APPS.filter((a) => a.poster || a.screen).map((a) => jpg((a.poster ?? a.screen)!)));
  const url = (loc: string, prio: string, freq: string, imgs: string[] = []) => `  <url>
    <loc>${SITE}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${prio}</priority>${imgs.map((i) => `\n    <image:image><image:loc>${SITE}${i}</image:loc></image:image>`).join('')}
  </url>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${url('/', '1.0', 'weekly', images)}
${url('/about/', '0.9', 'monthly', ['/media/photos/portrait.jpg', '/media/photos/jacket.jpg', '/media/photos/city.jpg', '/media/photos/palace.jpg', '/media/photos/today.jpg', '/media/photos/childhood.jpg'])}
${url('/work/', '0.9', 'monthly', WORK.map((w) => jpg(w.image)))}
${url('/apps/', '0.9', 'monthly')}
${PRODUCTS.map((a) => url(`/apps/${SLUG[a.id]}/`, '0.8', 'monthly', [jpg((a.poster ?? a.screen)!), ...(a.gallery ?? []).map(jpg)])).join('\n')}
${url('/contact/', '0.7', 'yearly')}
${url('/privacy.html', '0.3', 'yearly')}
${url('/terms.html', '0.3', 'yearly')}
</urlset>
`;
}

const ROBOTS = `# Everyone is welcome: search engines and AI assistants alike.
User-agent: *
Allow: /

# AI crawlers and answer engines, named explicitly
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: Claude-User
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: Bingbot
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;

function llms() {
  return `# ${PERSON.name}

> ${DESCRIPTION}

Full name: ${ABOUT.fullName}. Based in Balotra, Rajasthan, India. Studying Class 12 (PCM). Founder of ${PERSON.company} (Jodhpur & Balotra). Building since 2023, self-taught.

## Key facts
- Websites live: ${STATS.sites}
- Products of his own: ${STATS.products}
- Contact: ${PERSON.email}, WhatsApp ${PERSON.phone}
- Profiles: ${PERSON.socials.map((s) => `[${s.label}](${s.url})`).join(', ')}

## Story
${STORY.map((b) => `### ${b.kicker}: ${b.title}\n${b.body.join('\n\n')}`).join('\n\n')}

## Apps
${APPS.map((a) => `- **${a.name}** (${a.status}): ${a.summary}${a.links.length ? ` Links: ${a.links.map((l) => `[${l.label}](${l.url})`).join(', ')}` : ''}`).join('\n')}

## Tools
${TOOLKIT.map((g) => `- ${g.area}: ${g.tools.join(', ')}`).join('\n')}

## Client websites (selection)
${WORK.map((w) => `- [${w.name}](${w.url}): ${w.category}. ${w.summary}`).join('\n')}

## All live sites
${ALL_SITES.map((s) => `- [${s.name}](${s.url})`).join('\n')}

## Reviews
${TESTIMONIALS.map((t) => `- "${t.quote}" — ${t.who} (${t.stars}/5)`).join('\n')}

## Pages
${PAGE_PATHS.map((p) => `- ${SITE}${p}`).join('\n')}

## Optional
- [Privacy policy](${SITE}/privacy.html)
- [Terms of use](${SITE}/terms.html)
`;
}

const MANIFEST = JSON.stringify({
  name: 'Piyush Assudani',
  short_name: 'Piyush',
  description: DESCRIPTION,
  start_url: '/',
  display: 'standalone',
  background_color: '#F5E6D0',
  theme_color: '#B4441C',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2);

export function seo(): Plugin {
  return {
    name: 'portfolio-seo',
    buildStart() {
      const pub = path.resolve(__dirname, 'public');
      fs.writeFileSync(path.join(pub, 'sitemap.xml'), sitemap());
      fs.writeFileSync(path.join(pub, 'robots.txt'), ROBOTS);
      fs.writeFileSync(path.join(pub, 'llms.txt'), llms());
      fs.writeFileSync(path.join(pub, 'site.webmanifest'), MANIFEST);
      writePages(pub);
    },
    transformIndexHtml(html, ctx) {
      if (!ctx.filename.endsWith('index.html')) return html;
      return html.replace('<!--SEO:JSONLD-->', jsonLd()).replace('<!--SEO:NOSCRIPT-->', noscript());
    },
  };
}
