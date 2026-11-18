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
  BLOG_ARTICLES,
  GUIDE_PAGES,
  SITE_COPY,
  VERSUS_PAGES,
} from '../src/data/seoContent.ts';
import { localizeBlog, localizeVersus, localizeGuide, localizeFaq } from '../src/data/seoI18n.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const BASE = 'https://cashnoir.app';
// shortcut: icône carrée en attendant un vrai visuel 1200x630 du jeu actuel, alors passer twitter:card à summary_large_image.
const OG_IMAGE = `${BASE}/assets/icons/icon-512.png`;
const template = readFileSync(join(dist, 'index.html'), 'utf8');

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const urlFor = (locale, sub) => (locale === 'en' ? sub || '/' : `/${locale}${sub}`);
const richHtml = (locale, text) =>
  esc(text)
    .replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, (_, label, p) => {
      const href = p === '/play' || p.startsWith('/play/') ? p : urlFor(locale, p);
      return `<a href="${esc(href)}">${label}</a>`;
    })
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
const DEFAULT_RELATED = [
  { label: 'Best Games Like Papers, Please 2026', path: '/blog/best-games-like-papers-please-2026' },
  { label: 'Best AI Interrogation NPC Games', path: '/blog/best-ai-interrogation-npc-games' },
  { label: 'Ascension I to X Survival Guide', path: '/guides/ascension-i-to-x-survival-guide' },
  { label: 'CASH NOIR vs Suck Up!', path: '/vs/suck-up' },
];
const relatedHtml = (locale, related, currentSub) => {
  const items = (related?.length ? related : DEFAULT_RELATED).filter((r) => r.path !== currentSub);
  return items.length
    ? `<aside><h2>Related</h2><ul>${items
        .map((r) => `<li><a href="${esc(urlFor(locale, r.path))}">${esc(r.label)}</a></li>`)
        .join('')}</ul></aside>`
    : '';
};
const tableHtml = (locale, table) =>
  table?.headers?.length && table?.rows?.length
    ? `<table><thead><tr>${table.headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${table.rows
        .map((row) => `<tr>${row.map((c) => `<td>${richHtml(locale, c)}</td>`).join('')}</tr>`)
        .join('')}</tbody></table>`
    : '';
const faqHtml = (locale, faq) =>
  faq?.length
    ? `<section><h2>FAQ</h2>${faq.map((f) => `<h3>${esc(f.q)}</h3><p>${richHtml(locale, f.a)}</p>`).join('')}</section>`
    : '';

const trimMeta = (s, max) => {
  const clean = String(s).replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const sp = cut.lastIndexOf(' ');
  return `${sp > max * 0.6 ? cut.slice(0, sp) : cut}…`;
};

function page(locale, sub) {
  const copy = SITE_COPY[locale];
  const [, kind, slug] = sub.split('/');
  const blogs = BLOG_ARTICLES.map((a) => localizeBlog(a, locale));
  const faq = localizeFaq(locale);
  const blog = kind === 'blog' && slug ? blogs.find((a) => a.slug === slug) : null;
  const vsRaw = kind === 'vs' ? VERSUS_PAGES.find((v) => v.slug === slug) : null;
  const vs = vsRaw ? localizeVersus(vsRaw, locale) : null;
  const guideRaw = kind === 'guides' ? GUIDE_PAGES.find((g) => g.slug === slug) : null;
  const guide = guideRaw ? localizeGuide(guideRaw, locale) : null;

  let title = copy.metaTitle;
  let desc = copy.metaDesc;
  let body;
  if (blog) {
    title = `${blog.title} — CASH NOIR`;
    desc = blog.excerpt;
    body = `<article><h1>${esc(blog.title)}</h1><p>${esc(blog.excerpt)}</p>${
      blog.directAnswer ? `<p><strong>${richHtml(locale, blog.directAnswer)}</strong></p>` : ''
    }${tableHtml(locale, blog.table)}${blog.sections
      .map((s) => `<h2>${esc(s.heading)}</h2><p>${richHtml(locale, s.body)}</p>`)
      .join('')}${faqHtml(locale, blog.faq)}${relatedHtml(locale, blog.related, sub)}</article>`;
  } else if (vs) {
    title = `${vs.title} — CASH NOIR`;
    desc = vs.metaDesc;
    body = `<article><h1>${esc(vs.title)}</h1><p>${richHtml(locale, vs.directAnswer)}</p><table><tr><th></th><th>CASH NOIR</th><th>${esc(
      vs.competitor,
    )}</th></tr>${vs.rows
      .map((r) => `<tr><th>${esc(r.criteria)}</th><td>${esc(r.cashNoir)}</td><td>${esc(r.other)}</td></tr>`)
      .join('')}</table><p>${richHtml(locale, vs.verdict)}</p>${faqHtml(locale, vs.faq)}${relatedHtml(locale, vs.related, sub)}</article>`;
  } else if (guide) {
    title = `${guide.title} — CASH NOIR`;
    desc = guide.metaDesc;
    body = `<article><h1>${esc(guide.title)}</h1><p>${esc(guide.metaDesc)}</p>${
      guide.directAnswer ? `<p><strong>${richHtml(locale, guide.directAnswer)}</strong></p>` : ''
    }${tableHtml(locale, guide.table)}<ol>${guide.steps
      .map((s) => `<li><h2>${esc(s.title)}</h2><p>${richHtml(locale, s.detail)}</p></li>`)
      .join('')}</ol>${faqHtml(locale, guide.faq)}${relatedHtml(locale, guide.related, sub)}</article>`;
  } else if (kind === 'guides') {
    title = `${copy.navGuides} — CASH NOIR`;
    body = `<h1>${esc(copy.navGuides)}</h1><ul>${GUIDE_PAGES.map((g) => {
      const lg = localizeGuide(g, locale);
      return `<li><a href="${urlFor(locale, `/guides/${lg.slug}`)}">${esc(lg.title)}</a> — ${esc(lg.metaDesc)}</li>`;
    }).join('')}</ul>`;
  } else if (kind === 'vs') {
    title = `${copy.navVs} — CASH NOIR`;
    body = `<h1>${esc(copy.navVs)}</h1><ul>${VERSUS_PAGES.map((v) => {
      const lv = localizeVersus(v, locale);
      return `<li><a href="${urlFor(locale, `/vs/${lv.slug}`)}">${esc(lv.title)}</a> — ${esc(lv.metaDesc)}</li>`;
    }).join('')}</ul>`;
  } else if (sub === '/play') {
    title = 'Play CASH NOIR — Real-Time AI Interrogation Counter';
    desc = 'Enter the backroom counter in CASH NOIR. Sign in with Google to interrogate 100 autonomous AI sellers, inspect relics and survive midnight rent.';
    body = `<h1>Play CASH NOIR — Backroom Counter</h1><h2>Sign in with Google to open the counter</h2><p>${esc(desc)}</p>`;
  } else if (sub === '/play/daily') {
    title = 'Daily 24h Contract — CASH NOIR Global Seed';
    desc = 'One global seed per 24 hours. Negotiate against today’s target in CASH NOIR and post your verified margin on the global leaderboard.';
    body = `<h1>CASH NOIR Daily 24h Contract</h1><h2>One seed, one shot, global leaderboard</h2><p>${esc(desc)}</p>`;
  } else if (sub === '/terms') {
    title = 'Terms of Service — CASH NOIR (WeLink Tech SAS)';
    desc = 'Terms of Service for CASH NOIR, operated by WeLink Tech SAS, 6 Rue des Bateliers, 92110 Clichy, France.';
    body = `<h1>Terms of Service — CASH NOIR</h1><p>Operated by WeLink Tech SAS, 6 Rue des Bateliers, 92110 Clichy, France. Contact: hello@cashnoir.app.</p>`;
  } else if (sub === '/privacy') {
    title = 'Privacy Policy — CASH NOIR (WeLink Tech SAS)';
    desc = 'Privacy Policy and GDPR compliance for CASH NOIR, operated by WeLink Tech SAS, 6 Rue des Bateliers, 92110 Clichy, France.';
    body = `<h1>Privacy Policy — CASH NOIR</h1><p>Data controller: WeLink Tech SAS, 6 Rue des Bateliers, 92110 Clichy, France. Contact: hello@cashnoir.app. Google OAuth scopes are limited to openid, email and profile for cloud saves.</p>`;
  } else if (kind === 'blog') {
    title = `${copy.blogIndexTitle} — CASH NOIR`;
    body = `<h1>${esc(copy.blogIndexTitle)}</h1><ul>${blogs.map(
      (a) => `<li><a href="${urlFor(locale, `/blog/${a.slug}`)}">${esc(a.title)}</a> — ${esc(a.excerpt)}</li>`,
    ).join('')}</ul>`;
  } else {
    body = `<h1>${esc(`${copy.heroTitleLine1} ${copy.heroTitleLine2} ${copy.heroTitleLine3}`)}</h1><p>${esc(
      copy.heroSub,
    )}</p><h2>${esc(copy.aiTitle)}</h2><p>${esc(copy.aiLead)}</p><ul>${copy.aiPoints
      .map((p) => `<li><strong>${esc(p.label)}</strong> — ${esc(p.text)}</li>`)
      .join('')}</ul><h2>${esc(copy.sagasTitle)}</h2><p>${esc(copy.sagasSub)}</p><p><strong>${esc(copy.sagasDilemmaVault)}</strong></p><p><strong>${esc(copy.sagasDilemmaSell)}</strong></p><h2>${esc(copy.seasonHeroTitle)}</h2><p>${esc(copy.seasonHeroSub)}</p><ul>${copy.seasonHeroDossierSteps.map((s) => `<li><strong>${esc(s.step)} · ${esc(s.title)}</strong> : ${esc(s.desc)}</li>`).join('')}</ul><h2>${esc(copy.viralShareTitle)}</h2><p>${esc(copy.viralShareSub)}</p><blockquote>${esc(copy.viralShareQuote)}</blockquote><h2>${esc(copy.ascensionTitle)}</h2><p>${esc(copy.ascensionSub)}</p><ul>${copy.ascensionTiers.map((t) => `<li><strong>Ascension ${esc(t.level)} (${esc(t.name)})</strong> : ${esc(t.rule)} (${esc(t.survival)})</li>`).join('')}</ul><h2>${esc(copy.autopsyTitle)}</h2><p>${esc(copy.autopsySub)}</p><ul>${copy.autopsyPoints.map((p) => `<li><strong>${esc(p.tag)} · ${esc(p.title)}</strong> : ${esc(p.desc)}</li>`).join('')}</ul><h2>${esc(copy.arbitrageTitle)}</h2><p>${esc(copy.arbitrageSub)}</p><p><strong>${esc(copy.arbitrageFastTitle)}</strong> : ${esc(copy.arbitrageFastDesc)}</p><p><strong>${esc(copy.arbitrageAuctionTitle)}</strong> : ${esc(copy.arbitrageAuctionDesc)}</p><h2>FAQ</h2>${faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}`;
  }

  const nav = [
    ['/', 'CASH NOIR'],
    ['/play', copy.navPlay],
    ['/blog', copy.navBlog],
    ...VERSUS_PAGES.map((v) => [`/vs/${v.slug}`, `vs ${v.competitor}`]),
    ...GUIDE_PAGES.map((g) => [`/guides/${g.slug}`, localizeGuide(g, locale).title]),
  ]
    .map(([p, label]) => `<a href="${p === '/play' ? p : urlFor(locale, p === '/' ? '' : p)}">${esc(label)}</a>`)
    .join(' · ');

  const pub = { '@type': 'Organization', name: 'WeLink Tech SAS', url: BASE };
  const todayIso = new Date().toISOString().slice(0, 10);
  const ld = blog
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Article',
            headline: blog.title,
            datePublished: blog.publishedAt,
            dateModified: blog.publishedAt,
            inLanguage: copy.htmlLang,
            description: blog.excerpt,
            image: OG_IMAGE,
            author: pub,
            publisher: pub,
            speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', 'article p'] },
          },
          ...(blog.faq?.length
            ? [
                {
                  '@type': 'FAQPage',
                  mainEntity: blog.faq.map((f) => ({
                    '@type': 'Question',
                    name: f.q,
                    acceptedAnswer: { '@type': 'Answer', text: f.a },
                  })),
                },
              ]
            : []),
        ],
      }
    : guide
      ? {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Article',
              headline: guide.title,
              datePublished: guide.publishedAt || '2026-11-15',
              dateModified: todayIso,
              inLanguage: copy.htmlLang,
              description: guide.metaDesc,
              image: OG_IMAGE,
              author: pub,
              publisher: pub,
              speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', 'h2', 'p'] },
            },
            {
              '@type': 'HowTo',
              name: guide.title,
              description: guide.metaDesc,
              inLanguage: copy.htmlLang,
              step: guide.steps.map((s, i) => ({
                '@type': 'HowToStep',
                position: i + 1,
                name: s.title,
                text: s.detail,
              })),
            },
          ],
        }
      : {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebPage',
              name: title,
              url: `${BASE}${urlFor(locale, sub)}`,
              datePublished: '2026-11-01',
              dateModified: todayIso,
              inLanguage: copy.htmlLang,
              speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', 'h2'] },
            },
            {
              '@type': 'VideoGame',
              name: 'CASH NOIR',
              url: `${BASE}/`,
              image: OG_IMAGE,
              genre: 'Noir Simulation / Real-Time AI Interrogation',
              gamePlatform: 'Web Browser / PWA',
              inLanguage: ['en', 'fr', 'es'],
              description: copy.metaDesc,
              publisher: pub,
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            },
            {
              '@type': 'FAQPage',
              mainEntity: faq.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            },
          ],
        };

  const finalTitle = trimMeta(title, 58);
  const finalDesc = trimMeta(desc, 152);
  const canonical = `${BASE}${urlFor(locale, sub)}`;
  const head = [
    `<title>${esc(finalTitle)}</title>`,
    `<meta name="description" content="${esc(finalDesc)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<link rel="ard" href="/.well-known/ard.json" />`,
    ...['en', 'fr', 'es'].map((l) => `<link rel="alternate" hreflang="${l}" href="${BASE}${urlFor(l, sub)}" />`),
    `<link rel="alternate" hreflang="x-default" href="${BASE}${urlFor('en', sub)}" />`,
    `<meta property="og:type" content="${blog ? 'article' : 'website'}" />`,
    `<meta property="og:site_name" content="CASH NOIR" />`,
    `<meta property="og:title" content="${esc(finalTitle)}" />`,
    `<meta property="og:description" content="${esc(finalDesc)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta name="twitter:card" content="summary" />`,
    // data-cashnoir-ld : MarketingSite réutilise ce <script> au lieu d'en créer un second.
    `<script type="application/ld+json" data-cashnoir-ld="1">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ');

  // Remplacements par fonction : pas d'interprétation des "$" (prix) dans le contenu.
  const preload = sub === '' ? '<link rel="preload" as="image" href="/assets/portraits/cast/c001.webp" fetchpriority="high" />' : '';
  return template
    .replace(/<html lang="[^"]*"/, () => `<html lang="${copy.htmlLang}"`)
    .replace(/<title>[^<]*<\/title>/, () => head)
    .replace('</head>', () => `${preload}<style>#root>main[data-ssr]{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}</style></head>`)
    .replace('<div id="root"></div>', () => `<div id="root"><main data-ssr>${body}<nav>${nav}</nav></main></div>`);
}

const subs = [
  '',
  '/blog',
  '/guides',
  '/vs',
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

// Le client de jeu garde la coquille SPA, avec métadonnées complètes pour /play et /play/daily.
write('/play', page('en', '/play'));
write('/play/daily', page('en', '/play/daily'));
write('/admin', template);
write('/terms', page('en', '/terms'));
write('/privacy', page('en', '/privacy'));
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
