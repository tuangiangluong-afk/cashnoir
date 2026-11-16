// Post-build : écrit un index.html statique par route marketing (head SEO + contenu lisible
// sans JS) pour les crawlers qui n'exécutent pas JavaScript (GPTBot, ClaudeBot, PerplexityBot,
// aperçus de liens sociaux). React remplace #root au montage : aucun impact côté joueur.
// shortcut: gabarits HTML à la main qui reprennent la logique <head> de MarketingSite.tsx ;
// passer à un vrai SSR (renderToString) si les deux divergent.
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AEO_FAQ,
  BLOG_ARTICLES,
  GUIDE_PAGES,
  SITE_COPY,
  VERSUS_PAGES,
} from '../src/data/seoContent.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const BASE = 'https://cashnoir.app';
// shortcut: icône carrée en attendant un vrai visuel 1200x630 du jeu actuel, alors passer twitter:card à summary_large_image.
const OG_IMAGE = `${BASE}/assets/icons/icon-512.png`;
const template = readFileSync(join(dist, 'index.html'), 'utf8');

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const urlFor = (locale, sub) => (locale === 'en' ? sub || '/' : `/${locale}${sub}`);

function page(locale, sub) {
  const copy = SITE_COPY[locale];
  const [, kind, slug] = sub.split('/');
  const blog = kind === 'blog' && slug ? BLOG_ARTICLES.find((a) => a.slug === slug) : null;
  const vs = kind === 'vs' ? VERSUS_PAGES.find((v) => v.slug === slug) : null;
  const guide = kind === 'guides' ? GUIDE_PAGES.find((g) => g.slug === slug) : null;

  let title = copy.metaTitle;
  let desc = copy.metaDesc;
  let body;
  if (blog) {
    title = `${blog.title} — CASH NOIR`;
    desc = blog.excerpt;
    body = `<article><h1>${esc(blog.title)}</h1><p>${esc(blog.excerpt)}</p>${blog.sections
      .map((s) => `<h2>${esc(s.heading)}</h2><p>${esc(s.body)}</p>`)
      .join('')}</article>`;
  } else if (vs) {
    title = `${vs.title} — CASH NOIR`;
    desc = vs.metaDesc;
    body = `<article><h1>${esc(vs.title)}</h1><p>${esc(vs.directAnswer)}</p><table><tr><th></th><th>CASH NOIR</th><th>${esc(
      vs.competitor,
    )}</th></tr>${vs.rows
      .map((r) => `<tr><th>${esc(r.criteria)}</th><td>${esc(r.cashNoir)}</td><td>${esc(r.other)}</td></tr>`)
      .join('')}</table><p>${esc(vs.verdict)}</p></article>`;
  } else if (guide) {
    title = `${guide.title} — CASH NOIR`;
    desc = guide.metaDesc;
    body = `<article><h1>${esc(guide.title)}</h1><p>${esc(guide.metaDesc)}</p><ol>${guide.steps
      .map((s) => `<li><h2>${esc(s.title)}</h2><p>${esc(s.detail)}</p></li>`)
      .join('')}</ol></article>`;
  } else if (kind === 'blog') {
    title = `${copy.blogIndexTitle} — CASH NOIR`;
    body = `<h1>${esc(copy.blogIndexTitle)}</h1><ul>${BLOG_ARTICLES.map(
      (a) => `<li><a href="${urlFor(locale, `/blog/${a.slug}`)}">${esc(a.title)}</a> — ${esc(a.excerpt)}</li>`,
    ).join('')}</ul>`;
  } else {
    body = `<h1>${esc(`${copy.heroTitleLine1} ${copy.heroTitleLine2} ${copy.heroTitleLine3}`)}</h1><p>${esc(
      copy.heroSub,
    )}</p><h2>${esc(copy.aiTitle)}</h2><p>${esc(copy.aiLead)}</p><ul>${copy.aiPoints
      .map((p) => `<li><strong>${esc(p.label)}</strong> — ${esc(p.text)}</li>`)
      .join('')}</ul><h2>FAQ</h2>${AEO_FAQ.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}`;
  }

  const nav = [
    ['/', 'CASH NOIR'],
    ['/play', copy.navPlay],
    ['/blog', copy.navBlog],
    ...VERSUS_PAGES.map((v) => [`/vs/${v.slug}`, `vs ${v.competitor}`]),
    ...GUIDE_PAGES.map((g) => [`/guides/${g.slug}`, g.title]),
  ]
    .map(([p, label]) => `<a href="${p === '/play' ? p : urlFor(locale, p === '/' ? '' : p)}">${esc(label)}</a>`)
    .join(' · ');

  const ld = blog
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: blog.title,
        datePublished: blog.publishedAt,
        inLanguage: copy.htmlLang,
        description: blog.excerpt,
        image: OG_IMAGE,
        publisher: { '@type': 'Organization', name: 'CASH NOIR' },
      }
    : {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'VideoGame',
            name: 'CASH NOIR',
            url: `${BASE}/`,
            image: OG_IMAGE,
            genre: 'Noir Simulation / Real-Time AI Interrogation',
            gamePlatform: 'Web Browser / PWA',
            inLanguage: ['en', 'fr', 'es'],
            description: copy.metaDesc,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
          {
            '@type': 'FAQPage',
            mainEntity: AEO_FAQ.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          },
        ],
      };

  const canonical = `${BASE}${urlFor(locale, sub)}`;
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    ...['en', 'fr', 'es'].map((l) => `<link rel="alternate" hreflang="${l}" href="${BASE}${urlFor(l, sub)}" />`),
    `<link rel="alternate" hreflang="x-default" href="${BASE}${urlFor('en', sub)}" />`,
    `<meta property="og:type" content="${blog ? 'article' : 'website'}" />`,
    `<meta property="og:site_name" content="CASH NOIR" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta name="twitter:card" content="summary" />`,
    // data-cashnoir-ld : MarketingSite réutilise ce <script> au lieu d'en créer un second.
    `<script type="application/ld+json" data-cashnoir-ld="1">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ');

  // Remplacements par fonction : pas d'interprétation des "$" (prix) dans le contenu.
  return template
    .replace(/<html lang="[^"]*"/, () => `<html lang="${copy.htmlLang}"`)
    .replace(/<title>[^<]*<\/title>/, () => head)
    .replace('<div id="root"></div>', () => `<div id="root"><main>${body}<nav>${nav}</nav></main></div>`);
}

const subs = [
  '',
  '/blog',
  ...BLOG_ARTICLES.map((a) => `/blog/${a.slug}`),
  ...VERSUS_PAGES.map((v) => `/vs/${v.slug}`),
  ...GUIDE_PAGES.map((g) => `/guides/${g.slug}`),
];

const written = new Set();
const write = (urlPath, html) => {
  const file = join(dist, urlPath, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  written.add(urlPath.replace(/\/$/, '') || '/');
};

// Le client de jeu garde la coquille SPA (routes profondes servies sans rewrite côté hébergeur).
write('/play', template);
write('/play/daily', template);
// '/' en dernier : il écrase dist/index.html, qui sert de gabarit lu plus haut.
for (const locale of ['fr', 'es', 'en']) for (const sub of [...subs].reverse()) write(urlFor(locale, sub), page(locale, sub));

// Self-check : chaque URL du sitemap a son fichier, et le contenu est bien dans le HTML brut.
const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
for (const [, loc] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const p = loc.replace(BASE, '').replace(/\/$/, '') || '/';
  assert(written.has(p), `sitemap URL sans page prérendue : ${p}`);
}
const home = readFileSync(join(dist, 'index.html'), 'utf8');
assert(home.includes('application/ld+json') && home.includes('<h1>') && home.includes('og:image'));
assert(home.includes('<script type="module"'), 'le bundle du jeu doit rester chargé');
console.log(`prerender: ${written.size} routes`);
