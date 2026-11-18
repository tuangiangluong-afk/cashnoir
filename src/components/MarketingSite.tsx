import { localizeBlog, localizeVersus, localizeGuide, localizeFaq } from '../data/seoI18n';
import { localizeSeasonName, localizeSeasonEpisode, localizeFaction } from '../data/noirLocalization';
import { trackEvent, updateAnalyticsConsent } from '../services/analytics';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, Clock, Search, Flashlight, ShieldAlert, Skull, Star, Share2, FileText } from 'lucide-react';
import {
  SITE_COPY,
  BLOG_ARTICLES,
  VERSUS_PAGES,
  GUIDE_PAGES,
  type Locale,
} from '../data/seoContent';
import { getCurrentSeason, SEASON_EPISODES } from '../data/seasons';

function detectLocale(pathname: string): Locale {
  if (pathname === '/fr' || pathname.startsWith('/fr/')) return 'fr';
  if (pathname === '/es' || pathname.startsWith('/es/')) return 'es';
  return 'en';
}

function stripLocalePrefix(pathname: string): string {
  if (pathname === '/en' || pathname === '/es' || pathname === '/fr') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice(3);
  if (pathname.startsWith('/es/')) return pathname.slice(3);
  if (pathname.startsWith('/fr/')) return pathname.slice(3);
  return pathname || '/';
}

function upsertHeadLink(rel: string, attrs: Record<string, string>) {
  const selector = Object.entries(attrs)
    .filter(([k]) => k !== 'href')
    .map(([k, v]) => `[${k}="${v}"]`)
    .join('');
  let el = document.head.querySelector(`link[rel="${rel}"]${selector}`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
}

export function MarketingSite({
  pathname,
  onNavigate,
  onPlay,
  onPlayDaily,
  hasExistingSave,
  savedDay,
  savedCash,
  countdownText,
}: {
  pathname: string;
  onNavigate: (path: string) => void;
  onPlay: () => void;
  onPlayDaily: () => void;
  hasExistingSave: boolean;
  savedDay: number;
  savedCash: number;
  countdownText: string;
}) {
  const locale = detectLocale(pathname);
  const subPath = stripLocalePrefix(pathname);
  const copy = SITE_COPY[locale];
  const BLOGS = BLOG_ARTICLES.map((a) => localizeBlog(a, locale));
  const VERSUS = VERSUS_PAGES.map((v) => localizeVersus(v, locale));
  const GUIDES = GUIDE_PAGES.map((g) => localizeGuide(g, locale));
  const FAQ = localizeFaq(locale);
  const season = getCurrentSeason(new Date().toISOString().slice(0, 10));
  const [teaserStep, setTeaserStep] = useState<'idle' | 'uv' | 'bluff'>('idle');
  const [dailyTop, setDailyTop] = useState<Array<{ pseudo: string; margin: number }>>([]);
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/leaderboard')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && Array.isArray(d?.entries)) {
          setDailyTop(d.entries.slice(0, 3));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const startPassCheckout = async () => {
    setCheckoutBusy(true);
    trackEvent('begin_checkout', { item_name: 'Syndicate Pass', currency: 'EUR', value: 9, locale });
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      onPlay();
    } catch {
      onPlay();
    } finally {
      setCheckoutBusy(false);
    }
  };

  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<'idle' | 'busy' | 'sent' | 'error'>('idle');
  const [contactError, setContactError] = useState('');
  const [cookieBannerOpen, setCookieBannerOpen] = useState(() => {
    try {
      return typeof window !== 'undefined' && !localStorage.getItem('cashnoir_consent');
    } catch {
      return false;
    }
  });

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('busy');
    setContactError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: contactEmail,
          subject: contactSubject || 'Contact CASH NOIR',
          message: contactMessage,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        trackEvent('generate_lead', { form_id: 'contact_hello', locale });
        if (data.fallbackMailto) {
          window.location.href = `mailto:hello@cashnoir.app?subject=${encodeURIComponent(
            contactSubject || 'Contact CASH NOIR',
          )}&body=${encodeURIComponent(`De: ${contactEmail}\n\n${contactMessage}`)}`;
        }
        setContactStatus('sent');
        setContactEmail('');
        setContactSubject('');
        setContactMessage('');
      } else {
        setContactStatus('error');
        setContactError(data.error || 'Error');
      }
    } catch {
      window.location.href = `mailto:hello@cashnoir.app?subject=${encodeURIComponent(
        contactSubject || 'Contact CASH NOIR',
      )}&body=${encodeURIComponent(`De: ${contactEmail}\n\n${contactMessage}`)}`;
      setContactStatus('sent');
    }
  };

  const activeBlog = subPath.startsWith('/blog/')
    ? BLOGS.find((a) => a.slug === subPath.replace('/blog/', ''))
    : null;
  const activeVs = subPath.startsWith('/vs/')
    ? VERSUS.find((v) => v.slug === subPath.replace('/vs/', ''))
    : null;
  const activeGuide = subPath.startsWith('/guides/')
    ? GUIDES.find((g) => g.slug === subPath.replace('/guides/', ''))
    : null;
  const isBlogIndex = subPath === '/blog';
  const isGuidesIndex = subPath === '/guides';
  const isVsIndex = subPath === '/vs';
  const isTerms = subPath === '/terms';
  const isPrivacy = subPath === '/privacy';

  // Dynamic SEO / AEO / GEO Head Tags + Hreflang (EN default on /) + JSON-LD
  useEffect(() => {
    const base = 'https://cashnoir.app';
    const cleanSub = subPath === '/' ? '' : subPath;
    const canonicalPath = locale === 'en' ? (cleanSub || '/') : `/${locale}${cleanSub}`;

    let title = copy.metaTitle;
    let desc = copy.metaDesc;
    if (activeBlog) {
      title = `${activeBlog.title} — CASH NOIR`;
      desc = activeBlog.excerpt;
    } else if (activeVs) {
      title = `${activeVs.title} — CASH NOIR`;
      desc = activeVs.metaDesc;
    } else if (activeGuide) {
      title = `${activeGuide.title} — CASH NOIR`;
      desc = activeGuide.metaDesc;
    } else if (isBlogIndex) {
      title = `${copy.blogIndexTitle} — CASH NOIR`;
      desc = copy.metaDesc;
    } else if (isGuidesIndex) {
      title = `${copy.navGuides} — CASH NOIR`;
      desc = copy.metaDesc;
    } else if (isVsIndex) {
      title = `${copy.navVs} — CASH NOIR`;
      desc = copy.metaDesc;
    } else if (isTerms) {
      title = 'Terms of Service — CASH NOIR (WeLink Tech SAS)';
      desc = 'Terms of Service for CASH NOIR, operated by WeLink Tech SAS, Paris / Clichy, France.';
    } else if (isPrivacy) {
      title = 'Privacy Policy — CASH NOIR (WeLink Tech SAS)';
      desc = 'Privacy Policy and GDPR compliance for CASH NOIR, operated by WeLink Tech SAS, Paris / Clichy, France.';
    }

    document.documentElement.lang = copy.htmlLang;
    document.title = title;

    let metaDesc = document.head.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = desc;

    upsertHeadLink('canonical', { href: `${base}${canonicalPath}` });
    upsertHeadLink('alternate', { hreflang: 'en', href: `${base}${cleanSub || '/'}` });
    upsertHeadLink('alternate', { hreflang: 'fr', href: `${base}/fr${cleanSub}` });
    upsertHeadLink('alternate', { hreflang: 'es', href: `${base}/es${cleanSub}` });
    upsertHeadLink('alternate', { hreflang: 'x-default', href: `${base}${cleanSub || '/'}` });

    const pageFaqs = activeBlog?.faq?.length
      ? activeBlog.faq
      : activeVs?.faq?.length
        ? activeVs.faq
        : activeGuide?.faq?.length
          ? activeGuide.faq
          : FAQ;

    const schemaPayload = activeBlog
      ? {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Article',
              headline: activeBlog.title,
              datePublished: activeBlog.publishedAt,
              inLanguage: copy.htmlLang,
              description: activeBlog.excerpt,
              publisher: { '@type': 'Organization', name: 'CASH NOIR' },
            },
            ...(activeBlog.faq?.length
              ? [
                  {
                    '@type': 'FAQPage',
                    mainEntity: activeBlog.faq.map((f) => ({
                      '@type': 'Question',
                      name: f.q,
                      acceptedAnswer: { '@type': 'Answer', text: f.a },
                    })),
                  },
                ]
              : []),
          ],
        }
      : {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'VideoGame',
              name: 'CASH NOIR',
              genre: 'Noir Simulation / Real-Time AI Interrogation',
              gamePlatform: 'Web Browser / PWA',
              inLanguage: ['en', 'fr', 'es'],
              description: copy.metaDesc,
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            },
            {
              '@type': 'FAQPage',
              mainEntity: pageFaqs.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            },
          ],
        };

    let ld = document.head.querySelector('script[data-cashnoir-ld]') as HTMLScriptElement | null;
    if (!ld) {
      ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.setAttribute('data-cashnoir-ld', '1');
      document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify(schemaPayload);
  }, [locale, subPath, copy, activeBlog, activeVs, activeGuide, isBlogIndex, isGuidesIndex, isVsIndex]);

  const localePath = (sub: string) => {
    const clean = sub.startsWith('/') ? sub : `/${sub}`;
    if (clean === '/play' || clean.startsWith('/play/')) return clean;
    if (locale === 'en') return clean;
    return clean === '/' ? `/${locale}` : `/${locale}${clean}`;
  };

  const renderInlineEmphasis = (chunk: string, keyPrefix: string) =>
    chunk.split(/(\*[^*\n]+\*)/g).map((seg, i) =>
      seg.startsWith('*') && seg.endsWith('*') && seg.length > 2 ? (
        <em key={`${keyPrefix}-em-${i}`} className="italic text-zinc-100">
          {seg.slice(1, -1)}
        </em>
      ) : (
        seg
      ),
    );

  const renderRichText = (text: string) => {
    const parts = text.split(/(\[[^\]]+\]\(\/[^)]+\))/g);
    return parts.map((part, idx) => {
      const m = part.match(/^\[([^\]]+)\]\((\/[^)]+)\)$/);
      if (!m) return renderInlineEmphasis(part, `t-${idx}`);
      const [, label, rawPath] = m;
      const href = localePath(rawPath);
      return (
        <a
          key={`${rawPath}-${idx}`}
          href={href}
          onClick={(e) => {
            if (rawPath === '/play' || rawPath.startsWith('/play/')) {
              e.preventDefault();
              if (rawPath === '/play') onPlay();
              else onNavigate(rawPath);
              return;
            }
            e.preventDefault();
            onNavigate(href);
          }}
          className="text-amber-300 underline decoration-amber-400/50 underline-offset-4 hover:text-amber-200"
        >
          {renderInlineEmphasis(label, `l-${idx}`)}
        </a>
      );
    });
  };

  const renderComparisonTable = (table?: { headers: string[]; rows: string[][] }) => {
    if (!table || !table.headers.length || !table.rows.length) return null;
    return (
      <div className="overflow-x-auto border border-white/10">
        <table className="w-full text-left font-mono text-xs">
          <thead className="border-b border-white/10 bg-black/60 text-amber-300 uppercase">
            <tr>
              {table.headers.map((h) => (
                <th key={h} className="p-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {table.rows.map((row, idx) => (
              <tr key={idx}>
                {row.map((cell, ci) => (
                  <td key={ci} className={ci === 0 ? 'p-3 font-semibold text-zinc-100' : 'p-3 text-zinc-300'}>
                    {renderRichText(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPageFaq = (faq?: { q: string; a: string }[]) => {
    if (!faq || !faq.length) return null;
    return (
      <section className="border-t border-white/10 pt-8 space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-amber-400">FAQ</p>
        <div className="space-y-3">
          {faq.map((f) => (
            <div key={f.q} className="border border-white/10 bg-zinc-900/40 p-4 space-y-1.5">
              <h3 className="font-mono text-xs font-bold text-zinc-100">{f.q}</h3>
              <p className="text-sm leading-relaxed text-zinc-300">{renderRichText(f.a)}</p>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderRelatedBlock = (
    related: { label: string; path: string; kind: 'blog' | 'vs' | 'guide' }[] | undefined,
    excludePath: string,
  ) => {
    const fallback = [
      ...GUIDES.slice(0, 2).map((g) => ({ label: g.title, path: `/guides/${g.slug}`, kind: 'guide' as const })),
      ...VERSUS.slice(0, 2).map((v) => ({ label: `CASH NOIR vs ${v.competitor}`, path: `/vs/${v.slug}`, kind: 'vs' as const })),
      ...BLOGS.slice(0, 2).map((b) => ({ label: b.title, path: `/blog/${b.slug}`, kind: 'blog' as const })),
    ]
      .filter((x) => x.path !== excludePath)
      .slice(0, 4);
    const items = (related && related.length > 0 ? related : fallback).filter((x) => x.path !== excludePath);
    if (!items.length) return null;
    return (
      <aside className="border-t border-white/10 pt-8 space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-amber-400">
          {locale === 'fr' ? 'Dossiers & Guides Liés' : locale === 'es' ? 'Dossiers y Guías Relacionados' : 'Related Intelligence & Guides'}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const href = localePath(item.path);
            return (
              <a
                key={item.path}
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(href);
                }}
                className="border border-white/10 bg-zinc-900/50 p-3.5 transition-colors hover:border-amber-400/50 group"
              >
                <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  {item.kind}
                </span>
                <span className="mt-1 block text-sm font-medium text-zinc-200 group-hover:text-amber-300">
                  {item.label} →
                </span>
              </a>
            );
          })}
        </div>
      </aside>
    );
  };

  const switchLocale = (nextLoc: Locale) => {
    const cleanSub = subPath === '/' ? '' : subPath;
    onNavigate(nextLoc === 'en' ? (cleanSub || '/') : `/${nextLoc}${cleanSub}`);
  };

  const castImages = [
    { src: '/assets/portraits/cast/c001.webp', fallback: '/assets/portraits/courtier.webp' },
    { src: '/assets/portraits/cast/c002.webp', fallback: '/assets/portraits/flic.webp' },
    { src: '/assets/portraits/cast/c003.webp', fallback: '/assets/portraits/cadre.webp' },
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 selection:bg-amber-500/30 selection:text-amber-200 pb-[env(safe-area-inset-bottom)]">
      {/* Header épuré & responsive mobile */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#06070a]/95 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-5">
            <a
              href={locale === 'en' ? '/' : `/${locale}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(locale === 'en' ? '/' : `/${locale}`);
              }}
              className="flex items-center gap-2 select-none"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 shrink-0">
                <path d="M10.5 3.5L3 12L10.5 20.5" stroke="#f4f4f5" strokeWidth="2" strokeLinecap="square" />
                <path d="M13.5 3.5L21 12L13.5 20.5V3.5Z" fill="#fbbf24" />
              </svg>
              <span className="font-[family-name:var(--font-display)] text-lg tracking-[0.22em] text-zinc-100">
                CASH <span className="text-amber-400">NOIR</span>
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-5 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              <a
                href={localePath('/blog')}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(localePath('/blog'));
                }}
                className="hover:text-amber-300 transition-colors"
              >
                {copy.navBlog}
              </a>
              <a
                href={localePath('/vs')}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(localePath('/vs'));
                }}
                className="hover:text-amber-300 transition-colors"
              >
                {copy.navVs}
              </a>
              <a
                href={localePath('/guides')}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(localePath('/guides'));
                }}
                className="hover:text-amber-300 transition-colors"
              >
                {copy.navGuides}
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 font-mono text-[11px]">
            {/* Switcher EN | FR | ES visible sur mobile & desktop */}
            <div className="flex items-center border border-white/10 text-[10px]">
              {(['en', 'fr', 'es'] as Locale[]).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => switchLocale(loc)}
                  className={`px-2 py-1 uppercase transition-colors ${
                    locale === loc ? 'bg-white/10 text-amber-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onPlayDaily}
              className="hidden lg:flex items-center gap-1.5 text-amber-400/90 hover:text-amber-300 uppercase"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{copy.navDaily} · {countdownText}</span>
            </button>

            <a
              href="/play"
              onClick={(e) => {
                e.preventDefault();
                onPlay();
              }}
              className="bg-amber-400 px-3.5 py-1.5 font-bold uppercase tracking-wider text-zinc-950 transition-colors hover:bg-amber-300"
            >
              {hasExistingSave ? `${copy.ctaResume} (${locale === 'fr' ? 'J' : 'D'}${savedDay})` : copy.navPlay}
            </a>
          </div>
        </div>
      </header>

      {/* ARTICLE BLOG */}
      {activeBlog && (
        <article className="mx-auto max-w-3xl px-4 py-12 space-y-8 sm:px-6 sm:py-16">
          <button
            type="button"
            onClick={() => onNavigate(localePath('/blog'))}
            className="flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-amber-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {copy.backToBlog}
          </button>
          <header className="space-y-3 border-b border-white/10 pb-6">
            <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
              {activeBlog.updatedLabel} · {activeBlog.readTime}
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl leading-tight tracking-wide text-zinc-100 sm:text-5xl">
              {activeBlog.title}
            </h1>
            <p className="text-base leading-relaxed text-zinc-400">{activeBlog.excerpt}</p>
            {activeBlog.directAnswer && (
              <p className="border-l-2 border-amber-400 pl-4 text-sm leading-relaxed text-zinc-200">
                {renderRichText(activeBlog.directAnswer)}
              </p>
            )}
          </header>
          {renderComparisonTable(activeBlog.table)}
          <div className="space-y-8">
            {activeBlog.sections.map((s) => (
              <section key={s.heading} className="space-y-2.5">
                <h2 className="font-mono text-base font-bold uppercase tracking-wider text-amber-300">
                  {s.heading}
                </h2>
                <p className="text-base leading-relaxed text-zinc-300">{renderRichText(s.body)}</p>
              </section>
            ))}
          </div>
          {renderPageFaq(activeBlog.faq)}
          <button
            type="button"
            onClick={onPlay}
            className="bg-amber-400 px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 hover:bg-amber-300"
          >
            {copy.ctaPrimary} →
          </button>
          {renderRelatedBlock(activeBlog.related, `/blog/${activeBlog.slug}`)}
        </article>
      )}

      {/* INDEX BLOG */}
      {isBlogIndex && (
        <main className="mx-auto max-w-5xl px-4 py-12 space-y-10 sm:px-6 sm:py-16">
          <div className="space-y-2 border-b border-white/10 pb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-amber-400">
              {copy.blogIndexEyebrow}
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wider sm:text-5xl">
              {copy.blogIndexTitle}
            </h1>
          </div>
          <div className="divide-y divide-white/10">
            {BLOGS.map((art) => (
              <a
                key={art.slug}
                href={localePath(`/blog/${art.slug}`)}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(localePath(`/blog/${art.slug}`));
                }}
                className="block py-6 group"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  {art.updatedLabel} · {art.readTime}
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-wide text-zinc-100 group-hover:text-amber-300 transition-colors">
                  {art.title}
                </h2>
                <p className="mt-2 text-sm text-zinc-400 max-w-3xl">{art.excerpt}</p>
              </a>
            ))}
          </div>
        </main>
      )}

      {/* VERSUS */}
      {activeVs && (
        <main className="mx-auto max-w-4xl px-4 py-12 space-y-10 sm:px-6 sm:py-16">
          <div className="space-y-3 border-b border-white/10 pb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-amber-400">
              CASH NOIR vs {activeVs.competitor}
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl leading-tight tracking-wide sm:text-5xl">
              {activeVs.title}
            </h1>
            <p className="border-l-2 border-amber-400 pl-4 text-base leading-relaxed text-zinc-200">
              {renderRichText(activeVs.directAnswer)}
            </p>
          </div>
          <div className="overflow-x-auto border border-white/10">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-white/10 bg-black/60 text-zinc-400 uppercase">
                <tr>
                  <th className="p-3">{copy.vsCriteria}</th>
                  <th className="p-3 text-amber-300">CASH NOIR</th>
                  <th className="p-3">{activeVs.competitor}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeVs.rows.map((r) => (
                  <tr key={r.criteria}>
                    <td className="p-3 text-zinc-400">{r.criteria}</td>
                    <td className="p-3 text-zinc-100">{r.cashNoir}</td>
                    <td className="p-3 text-zinc-400">{r.other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-base leading-relaxed text-zinc-300">{renderRichText(activeVs.verdict)}</p>
          {renderPageFaq(activeVs.faq)}
          <button
            type="button"
            onClick={onPlay}
            className="bg-amber-400 px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 hover:bg-amber-300"
          >
            {copy.vsTestBtn}
          </button>
          {renderRelatedBlock(activeVs.related, `/vs/${activeVs.slug}`)}
        </main>
      )}

      {/* INDEX VERSUS */}
      {isVsIndex && (
        <main className="mx-auto max-w-5xl px-4 py-12 space-y-10 sm:px-6 sm:py-16">
          <div className="space-y-2 border-b border-white/10 pb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-amber-400">
              {copy.navVs} · CASH NOIR
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wider sm:text-5xl">
              {locale === 'fr' ? 'Comparatifs CASH NOIR' : locale === 'es' ? 'Comparativas CASH NOIR' : 'CASH NOIR Comparisons & Alternatives'}
            </h1>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {VERSUS.map((v) => (
              <a
                key={v.slug}
                href={localePath(`/vs/${v.slug}`)}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(localePath(`/vs/${v.slug}`));
                }}
                className="border border-white/10 bg-zinc-900/40 p-5 transition-colors hover:border-amber-400/50 group"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
                  CASH NOIR vs {v.competitor}
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl tracking-wide text-zinc-100 group-hover:text-amber-300">
                  {v.title}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">{v.metaDesc}</p>
              </a>
            ))}
          </div>
        </main>
      )}

      {/* GUIDE */}
      {activeGuide && (
        <main className="mx-auto max-w-3xl px-4 py-12 space-y-8 sm:px-6 sm:py-16">
          <div className="space-y-3 border-b border-white/10 pb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-amber-400">
              {copy.navGuides} · CASH NOIR
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl leading-tight tracking-wide sm:text-5xl">
              {activeGuide.title}
            </h1>
            <p className="text-base text-zinc-400">{activeGuide.metaDesc}</p>
            {activeGuide.directAnswer && (
              <p className="border-l-2 border-amber-400 pl-4 text-sm leading-relaxed text-zinc-200">
                {renderRichText(activeGuide.directAnswer)}
              </p>
            )}
          </div>
          {renderComparisonTable(activeGuide.table)}
          <div className="space-y-6">
            {activeGuide.steps.map((st) => (
              <div key={st.title} className="border-l-2 border-amber-400/70 pl-4 space-y-1">
                <h2 className="font-mono text-sm font-bold text-zinc-100">{st.title}</h2>
                <p className="text-sm leading-relaxed text-zinc-300">{renderRichText(st.detail)}</p>
              </div>
            ))}
          </div>
          {renderPageFaq(activeGuide.faq)}
          <button
            type="button"
            onClick={onPlay}
            className="bg-amber-400 px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 hover:bg-amber-300"
          >
            {copy.guideApplyBtn}
          </button>
          {renderRelatedBlock(activeGuide.related, `/guides/${activeGuide.slug}`)}
        </main>
      )}

      {/* INDEX GUIDES */}
      {isGuidesIndex && (
        <main className="mx-auto max-w-5xl px-4 py-12 space-y-10 sm:px-6 sm:py-16">
          <div className="space-y-2 border-b border-white/10 pb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-amber-400">
              {copy.navGuides} · CASH NOIR
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wider sm:text-5xl">
              {locale === 'fr' ? 'Guides Tactiques & Dossiers' : locale === 'es' ? 'Guías Tácticas y Dossiers' : 'Tactical Guides & Field Manuals'}
            </h1>
          </div>
          <div className="divide-y divide-white/10">
            {GUIDES.map((g) => (
              <a
                key={g.slug}
                href={localePath(`/guides/${g.slug}`)}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(localePath(`/guides/${g.slug}`));
                }}
                className="block py-6 group"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
                  {g.steps.length} {locale === 'fr' ? 'étapes' : locale === 'es' ? 'pasos' : 'steps'}
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-wide text-zinc-100 group-hover:text-amber-300 transition-colors">
                  {g.title}
                </h2>
                <p className="mt-2 text-sm text-zinc-400 max-w-3xl">{g.metaDesc}</p>
              </a>
            ))}
          </div>
        </main>
      )}

      {/* TERMS OF SERVICE (/terms) */}
      {isTerms && (
        <main className="mx-auto max-w-3xl px-4 py-12 space-y-8 sm:px-6 sm:py-16 text-sm leading-relaxed text-zinc-300">
          <div className="space-y-2 border-b border-white/10 pb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-amber-400">
              LEGAL · WELINK TECH SAS
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide text-zinc-100 sm:text-5xl">
              TERMS OF SERVICE
            </h1>
            <p className="font-mono text-xs text-zinc-400">Last updated: November 2026 · cashnoir.app</p>
          </div>

          <section className="space-y-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">1. Publisher & Operator</h2>
            <p>
              CASH NOIR (<strong>cashnoir.app</strong>) is published and operated by <strong>WeLink Tech SAS</strong>, a French registered corporation with headquarters at <strong>6 Rue des Bateliers, 92110 Clichy, France</strong>. Contact: <a href="mailto:hello@cashnoir.app" className="text-amber-400 underline">hello@cashnoir.app</a>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">2. Access & Gameplay</h2>
            <p>
              CASH NOIR is an interactive AI-driven negotiation game. Free access is provided with daily limits; optional paid tiers (Syndicate Pass) unlock extended play, cloud saves and full campaign access. All in-game items, characters, currencies and criminal storylines are purely fictional.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">3. Accounts & Billing</h2>
            <p>
              Cloud progression uses Google OAuth authentication solely to identify your profile. Paid subscriptions are processed securely by Stripe and can be cancelled at any time.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">4. Acceptable Use</h2>
            <p>
              Automated scraping, prompt-injection abuse, leaderboard tampering or attempting to bypass server rate limits may result in immediate account suspension.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">5. Governing Law</h2>
            <p>
              These Terms are governed strictly by French Law. Any dispute falls under the exclusive jurisdiction of the competent courts of Nanterre, France.
            </p>
          </section>
        </main>
      )}

      {/* PRIVACY POLICY (/privacy) */}
      {isPrivacy && (
        <main className="mx-auto max-w-3xl px-4 py-12 space-y-8 sm:px-6 sm:py-16 text-sm leading-relaxed text-zinc-300">
          <div className="space-y-2 border-b border-white/10 pb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-amber-400">
              GDPR · WELINK TECH SAS
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide text-zinc-100 sm:text-5xl">
              PRIVACY POLICY
            </h1>
            <p className="font-mono text-xs text-zinc-400">Last updated: November 2026 · cashnoir.app</p>
          </div>

          <section className="space-y-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">1. Data Controller</h2>
            <p>
              Personal data on <strong>cashnoir.app</strong> is processed by <strong>WeLink Tech SAS</strong>, <strong>6 Rue des Bateliers, 92110 Clichy, France</strong>, in strict compliance with the EU General Data Protection Regulation (GDPR). Data Protection contact: <a href="mailto:hello@cashnoir.app" className="text-amber-400 underline">hello@cashnoir.app</a>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">2. Data Collected</h2>
            <p>
              When you sign in with Google OAuth, we only request basic profile scopes (<code>openid</code>, <code>email</code>, <code>profile</code>) to store your player ID, display name, cloud save state and Syndicate Pass entitlement. We never access your contacts, Drive, or private Google data, and we never sell or share your personal data to train public LLMs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">3. Cookies & Local Storage</h2>
            <p>
              We use strictly necessary <code>httpOnly</code> session cookies for authentication and browser <code>localStorage</code> for offline game saves. No third-party ad-tracking cookies are used.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">4. Retention & Your Rights</h2>
            <p>
              Under GDPR, you have the right to access, rectify, export or permanently delete your account and cloud save data at any time by emailing <a href="mailto:hello@cashnoir.app" className="text-amber-400 underline">hello@cashnoir.app</a>.
            </p>
          </section>
        </main>
      )}

      {/* HOME MARKETING (/) */}
      {!activeBlog && !isBlogIndex && !activeVs && !isVsIndex && !activeGuide && !isGuidesIndex && !isTerms && !isPrivacy && (
        <main>
          <section className="relative overflow-hidden border-b border-white/10">
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:py-20">
              <div className="space-y-5 lg:col-span-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/90">
                  {copy.heroEyebrow}
                </p>

                <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[0.94] tracking-[0.04em] text-zinc-100 sm:text-6xl lg:text-7xl">
                  {copy.heroTitleLine1}
                  <br />
                  <span className="text-amber-400">{copy.heroTitleLine2}</span>
                  <br />
                  {copy.heroTitleLine3}
                </h1>

                <p className="max-w-lg text-sm leading-relaxed text-zinc-300 sm:text-base">
                  {copy.heroSub}
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onPlay}
                    className="flex items-center justify-center gap-2.5 bg-amber-400 px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-950 transition-colors hover:bg-amber-300"
                  >
                    <span>
                      {hasExistingSave
                        ? `${copy.ctaResume} (${savedCash.toLocaleString('fr-FR')} $)`
                        : copy.ctaPrimary}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={onPlayDaily}
                    className="flex items-center justify-center gap-2 border border-white/15 bg-black/60 px-5 py-4 font-mono text-xs uppercase tracking-[0.14em] text-zinc-200 transition-colors hover:border-amber-400/50 hover:text-amber-300"
                  >
                    <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>
                      {copy.ctaDaily} ({countdownText})
                    </span>
                  </button>
                </div>
              </div>

              {/* Comptoir interactif en direct */}
              <div className="lg:col-span-6">
                <div className="border border-white/15 bg-[#0a0b0f]">
                  <div className="flex items-center justify-between border-b border-white/10 bg-black/60 px-4 py-2 font-mono text-[10px] uppercase tracking-widest">
                    <span className="text-zinc-400">{copy.simHeader}</span>
                    <span className="text-amber-400">{copy.simBadge}</span>
                  </div>

                  <div className="grid sm:grid-cols-5">
                    <div className="relative h-56 sm:h-auto sm:min-h-[240px] bg-black sm:col-span-2 overflow-hidden">
                      <img
                        src="/assets/portraits/cast/c001.webp"
                        width={320}
                        height={400}
                        fetchPriority="high"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/assets/portraits/courtier.webp';
                        }}
                        alt="Nadia Khoury"
                        className="h-full w-full object-cover object-top"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3">
                        <p className="font-[family-name:var(--font-display)] text-xl tracking-wider text-zinc-100">
                          NADIA KHOURY
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between p-4 font-mono text-xs sm:col-span-3 space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-baseline justify-between border-b border-white/10 pb-2">
                          <span className="text-[10px] uppercase text-zinc-400">{copy.simAskLabel}</span>
                          <span className="font-bold text-amber-300">
                            {teaserStep === 'bluff' ? copy.simBroken : copy.simAsked}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-zinc-200">
                          {teaserStep === 'idle' && copy.simQuoteIdle}
                          {teaserStep === 'uv' && copy.simQuoteUv}
                          {teaserStep === 'bluff' && copy.simQuoteBluff}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setTeaserStep('uv')}
                            className={`flex items-center justify-center gap-1.5 border py-2 text-[10px] uppercase ${
                              teaserStep === 'uv'
                                ? 'border-sky-400 bg-sky-500/20 text-sky-200'
                                : 'border-white/15 bg-black/60 text-zinc-300'
                            }`}
                          >
                            <Flashlight className="h-3 w-3 shrink-0" /> {copy.simBtnUv}
                          </button>
                          <button
                            type="button"
                            onClick={() => setTeaserStep('bluff')}
                            className={`flex items-center justify-center gap-1.5 border py-2 text-[10px] uppercase ${
                              teaserStep === 'bluff'
                                ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                                : 'border-white/15 bg-black/60 text-zinc-300'
                            }`}
                          >
                            <Search className="h-3 w-3 shrink-0" /> {copy.simBtnBluff}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={onPlay}
                          className="w-full bg-amber-400 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-950 hover:bg-amber-300"
                        >
                          {copy.simBtnPlay}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* UN COMPTOIR SANS SCRIPT — ÉDITORIAL SEC SANS TICK AI */}
          <section className="border-b border-white/10 bg-[#07080b] px-4 py-12 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-12 items-start">
              <div className="lg:col-span-5 space-y-3">
                <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] sm:text-5xl">
                  {copy.aiTitle}
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-zinc-400">{copy.aiLead}</p>
              </div>
              <div className="lg:col-span-7 divide-y divide-white/10 font-mono">
                {copy.aiPoints.map((pt) => (
                  <div key={pt.label} className="py-4 first:pt-0 last:pb-0 space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      {pt.label}
                    </h3>
                    <p className="text-xs leading-relaxed text-zinc-300">{pt.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SAGAS & INTRIGUES RAMIFIÉES — LE DILEMME DU COFFRE */}
          <section className="border-b border-white/10 bg-[#0a0b0f] px-4 py-12 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-6xl space-y-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-purple-400">
                    {copy.sagasEyebrow}
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] sm:text-5xl text-zinc-100">
                    {copy.sagasTitle}
                  </h2>
                </div>
                <p className="max-w-md font-mono text-xs text-zinc-400">{copy.sagasSub}</p>
              </div>

              {/* Le Dilemme Irréversible : Carte Visuelle Interactive */}
              <div className="grid gap-6 lg:grid-cols-12 items-stretch">
                {/* Exemple de pièce clé d'enquête */}
                <div className="lg:col-span-5 border border-purple-500/30 bg-[#0e0d14] p-5 rounded-xl space-y-4 font-mono shadow-[0_0_40px_rgba(168,85,247,0.08)] flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase tracking-wider min-w-0">
                        <ShieldAlert className="h-4 w-4 shrink-0 text-purple-400" />
                        <span>{copy.sagasDilemmaTitle}</span>
                      </span>
                      <span className="shrink-0 whitespace-nowrap text-[10px] px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40">
                        {locale === 'en' ? 'North Docks' : locale === 'es' ? 'Muelles del Norte' : 'Docks du Nord'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5 bg-black/60 p-3 rounded-lg border border-white/10">
                      <div className="h-16 w-16 shrink-0 rounded bg-black/80 border border-white/10 flex items-center justify-center p-1 overflow-hidden">
                        <img
                          src="/assets/items/watch-sm.webp"
                          width={64}
                          height={64}
                          loading="lazy"
                          alt="Rolex Daytona"
                          className="h-full w-full object-contain mix-blend-lighten drop-shadow-md"
                        />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs font-bold text-amber-200 truncate">
                          {locale === 'en' ? 'Rose Gold Rolex Daytona' : locale === 'es' ? 'Rolex Daytona de Oro Rosa' : 'Rolex Daytona en Or Rose'}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          {locale === 'en' ? 'Stolen from an oligarch. Serial number matches an active mob lead in your Notebook.' : locale === 'es' ? 'Robada a un oligarca. El número de serie coincide con una pista activa de tu Cuaderno.' : 'Volée à un oligarque. Numéro de série lié à une intrigue active dans ton Carnet.'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="rounded border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-1">
                        <p className="font-bold text-emerald-300 text-[11px] uppercase tracking-wider">
                          {copy.sagasDilemmaVault}
                        </p>
                      </div>
                      <div className="rounded border border-red-500/30 bg-red-950/20 p-3 space-y-1">
                        <p className="font-bold text-red-300 text-[11px] uppercase tracking-wider">
                          {copy.sagasDilemmaSell}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Les 3 piliers narratifs des Sagas */}
                <div className="lg:col-span-7 grid gap-4 sm:grid-cols-2 font-mono text-xs">
                  <div className="border border-white/10 bg-[#07080b] p-5 rounded-xl space-y-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase text-purple-400 font-bold tracking-widest">
                        {locale === 'en' ? '100 Characters' : locale === 'es' ? '100 Personajes' : '100 Personnages'}
                      </span>
                      <h3 className="text-sm font-bold text-zinc-100">
                        {locale === 'en' ? 'Recurring Grudges & Memory' : locale === 'es' ? 'Rencor y Memoria Viva' : 'Rancune Vivante & Mémoire'}
                      </h3>
                      <p className="text-zinc-400 leading-relaxed font-sans text-xs">
                        {locale === 'en'
                          ? 'Sell a mob relic to the police and the underworld marks you. The character who brought it returns nights later with demands... or armed muscle.'
                          : locale === 'es'
                          ? 'Vende una reliquia del hampa a la policía y el sindicato te señalará. Quien te la vendió volverá noches después exigiendo cuentas... o con matones armados.'
                          : 'Vends une relique du milieu à la police et le syndicat met ta tête à prix. Le personnage qui te l’a cédée revient quelques nuits plus tard exiger des comptes... ou avec des gros bras.'}
                      </p>
                    </div>
                  </div>

                  <div className="border border-white/10 bg-[#07080b] p-5 rounded-xl space-y-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase text-amber-400 font-bold tracking-widest">
                        {locale === 'en' ? '10 Underworld Factions' : locale === 'es' ? '10 Facciones Clandestinas' : '10 Factions Criminelles'}
                      </span>
                      <h3 className="text-sm font-bold text-zinc-100">
                        {locale === 'en' ? 'Shifting Territory War' : locale === 'es' ? 'Guerra Territorial' : 'Guerre de Territoire'}
                      </h3>
                      <p className="text-zinc-400 leading-relaxed font-sans text-xs">
                        {locale === 'en'
                          ? 'Dock Cartel, Eastern Oligarchs, Financial Squad, Night Barons. Your reputation with each faction unlocks hidden black-market auctions and lower trap rates.'
                          : locale === 'es'
                          ? 'Cártel del Puerto, Oligarcas del Este, Brigada Financiera, Barones de la Noche. Tu reputación con cada facción desbloquea subastas exclusivas y reduce trampas.'
                          : 'Cartel des Docks, Oligarques de l’Est, Brigade Financière, Barons de la Nuit. Ta réputation auprès de chaque faction débloque des ventes exclusives et baisse les pièges.'}
                      </p>
                    </div>
                  </div>

                  <div className="border border-white/10 bg-[#07080b] p-5 rounded-xl space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] uppercase text-emerald-400 font-bold tracking-widest">
                        {locale === 'en' ? '30+ Physical Relics' : locale === 'es' ? '30+ Reliquias Físicas' : '30+ Reliques Physiques'}
                      </span>
                      <span className="text-zinc-400 text-[10px]">
                        {locale === 'en' ? 'Magnifier & UV Lamp' : locale === 'es' ? 'Lupa y Luz UV' : 'Loupe Horlogère & Lampe UV'}
                      </span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed font-sans text-xs">
                      {locale === 'en'
                        ? 'Double bottoms, pickable locks, scraped serial numbers, secret microfilms. Inspecting the physical hardware reveals blackmail leverage before you speak a single word.'
                        : locale === 'es'
                        ? 'Dobles fondos, cerraduras forzables, números de serie raspados, microfilms ocultos. Inspeccionar la pieza física te da palancas de chantaje antes de decir una sola palabra.'
                        : 'Faux tiroirs, serrures crochetables, numéros de série limés, microfilms cachés. L’inspection matérielle de l’objet te donne le levier de chantage avant même d’ouvrir la bouche.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* HÉROS DE LA SAISON & DOSSIER D'ENQUÊTE PROGRESSIF */}
          <section className="border-b border-white/10 bg-[#08090d] px-4 py-12 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-6xl space-y-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400 flex items-center gap-1.5">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    {copy.seasonHeroEyebrow}
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] sm:text-5xl text-zinc-100">
                    {copy.seasonHeroTitle}
                  </h2>
                </div>
                <p className="max-w-md font-mono text-xs text-zinc-400">{copy.seasonHeroSub}</p>
              </div>

              {/* Grille : Portrait du Boss de Saison + Dossier Noir en 3 Paliers */}
              <div className="grid gap-6 lg:grid-cols-12 items-stretch">
                {/* Carte Personnage du Héros */}
                <div className="lg:col-span-5 border border-amber-500/30 bg-gradient-to-b from-[#13110d] to-[#0a0b0e] p-5 rounded-xl space-y-4 font-mono shadow-[0_0_30px_rgba(245,158,11,0.06)] flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                      <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        {copy.seasonHeroBadge}
                      </span>
                      <span className="shrink-0 whitespace-nowrap text-[10px] text-zinc-400">
                        {locale === 'en' ? 'c013 · North Docks' : locale === 'es' ? 'c013 · Muelles del Norte' : 'c013 · Docks du Nord'}
                      </span>
                    </div>

                    <div className="flex gap-4 items-center">
                      <img
                        src="/assets/portraits/cast/c013-sm.webp"
                        width={96}
                        height={112}
                        loading="lazy"
                        alt="Boris Kovalenko"
                        className="h-28 w-24 shrink-0 rounded-lg border border-amber-400/50 object-cover object-[50%_18%] shadow-lg"
                      />
                      <div className="space-y-1 min-w-0">
                        <h3 className="font-[family-name:var(--font-display)] text-xl uppercase tracking-wider text-zinc-100">
                          Boris Kovalenko
                        </h3>
                        <p className="text-xs text-amber-400 font-bold">
                          {locale === 'en'
                            ? 'Ghost-cargo ship mechanic (46yo)'
                            : locale === 'es'
                            ? 'Mecánico de cargueros fantasma (46 años)'
                            : 'Mécanicien de cargos fantômes (46 ans)'}
                        </p>
                        <p className="text-[11px] text-zinc-400 italic">
                          {locale === 'en'
                            ? '« Real steel, no junk. Lifted from the hold last night. $1,800 net for my crew. »'
                            : locale === 'es'
                            ? '«Acero de verdad, no chatarra. Salido de bodega anoche. 1.800 $ netos para los muchachos.»'
                            : '« De l’acier vrai, pas du toc. Sorti de cale hier soir. 1 800 $ net pour les gars. »'}
                        </p>
                      </div>
                    </div>

                    <div className="rounded border border-white/10 bg-black/40 p-3 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-zinc-300">
                        <span className="text-amber-400 font-bold">
                          {locale === 'en' ? 'Saga Arc: The Container 47 Ultimatum' : locale === 'es' ? 'Arco de Saga: El Ultimátum del Contenedor 47' : 'Arc Narratif : L’Ultimatum du Conteneur 47'}
                        </span>
                        <span className="text-[10px] text-zinc-400">5 {locale === 'en' ? 'episodes' : locale === 'es' ? 'episodios' : 'épisodes'}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400">
                        {locale === 'en'
                          ? 'Boris returns across multiple nights. Each conversation deepens the investigation or brings down the Bratva hammer.'
                          : locale === 'es'
                          ? 'Boris vuelve a lo largo de varias noches. Cada conversación profundiza la investigación o desata la furia de la Bratva.'
                          : 'Boris revient au fil des nuits. Chaque négociation resserre l’étau de l’enquête ou déchaîne la Bratva.'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-amber-500/10 pt-3 text-[11px] text-amber-300/80 flex items-center justify-between">
                    <span>{locale === 'en' ? 'Counter boost: ~12% appearance' : locale === 'es' ? 'Aparición en mostrador: ~12%' : 'Boost comptoir : ~12% d’apparition'}</span>
                    <span className="text-emerald-400 font-bold">+2 200 $ {locale === 'en' ? 'Bounty' : locale === 'es' ? 'Recompensa' : 'Prime'}</span>
                  </div>
                </div>

                {/* Dossier Noir en 3 Paliers */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-3 font-mono">
                  <div className="border border-white/10 bg-[#0a0b0f] p-5 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-xs uppercase text-zinc-200 font-bold tracking-widest flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-violet-400" />
                        {copy.seasonHeroDossierTitle}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {locale === 'en' ? 'Deterministic Memory' : locale === 'es' ? 'Memoria Determinista' : 'Mémoire Déterministe'}
                      </span>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {copy.seasonHeroDossierSteps.map((st, i) => (
                        <div
                          key={st.step}
                          className={`p-3 rounded-lg border text-xs space-y-1 ${
                            i === 0
                              ? 'border-violet-500/30 bg-violet-950/20'
                              : i === 1
                              ? 'border-amber-500/30 bg-amber-950/20'
                              : 'border-red-500/30 bg-red-950/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                              {st.step}
                            </span>
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${
                              i === 0 ? 'text-violet-300' : i === 1 ? 'text-amber-300' : 'text-red-300'
                            }`}>
                              {st.title}
                            </span>
                          </div>
                          <p className="text-zinc-300 font-sans text-xs leading-relaxed">{st.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Partage Viral de la Punchline Choc */}
                  <div className="border border-emerald-500/30 bg-gradient-to-r from-[#0a120e] to-[#060b08] p-5 rounded-xl space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase text-emerald-400 font-bold tracking-widest flex items-center gap-1.5">
                        <Share2 className="h-3.5 w-3.5 text-emerald-400" />
                        {copy.viralShareEyebrow}
                      </span>
                      <span className="shrink-0 whitespace-nowrap text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                        {locale === 'en' ? 'PNG Card · −20% / Weapon Drawn' : locale === 'es' ? 'Tarjeta PNG · −20% / Arma Sacada' : 'Carte PNG · −20% / Arme Dégainée'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-zinc-100">{copy.viralShareTitle}</h4>
                      <p className="mt-1 text-zinc-400 font-sans text-xs leading-relaxed">{copy.viralShareSub}</p>
                    </div>

                    <div className="bg-black/70 p-3 rounded border border-emerald-500/20 text-xs text-emerald-300 italic">
                      {copy.viralShareQuote}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* L'ASCENSION IMPITOYABLE — 10 NIVEAUX CUMULATIFS */}
          <section className="border-b border-white/10 bg-[#07080b] px-4 py-12 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-6xl space-y-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-red-400">
                    {copy.ascensionEyebrow}
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] sm:text-5xl text-zinc-100">
                    {copy.ascensionTitle}
                  </h2>
                </div>
                <p className="max-w-md font-mono text-xs text-zinc-400">{copy.ascensionSub}</p>
              </div>

              {/* 4 Paliers représentatifs sur les 10 */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 font-mono text-xs">
                {copy.ascensionTiers.map((tier) => (
                  <div
                    key={tier.level}
                    className="border border-white/10 bg-[#0a0b0f] p-5 rounded-xl space-y-3 relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold font-[family-name:var(--font-display)] text-amber-400">
                          ASCENSION {tier.level}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-zinc-400 font-bold">
                          {tier.survival}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-zinc-100">{tier.name}</h3>
                      <p className="text-zinc-400 font-sans text-xs leading-relaxed">{tier.rule}</p>
                    </div>
                    <div className="pt-2 border-t border-white/5 text-[10px] text-zinc-400 uppercase flex items-center gap-1.5">
                      {tier.level === 'X' ? (
                        <span className="text-red-400 font-bold flex items-center gap-1">
                          <Skull className="h-3 w-3 text-red-400" />
                          {locale === 'en' ? 'True Final Boss' : locale === 'es' ? 'Jefe Final Verdadero' : 'Défi Ultime Parrain'}
                        </span>
                      ) : (
                        <span>{locale === 'en' ? 'Stacked Penalty' : locale === 'es' ? 'Penalización Acumulada' : 'Malus Cumulatif'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Barre de stats & simulation */}
              <div className="border border-amber-500/20 bg-[#0e1017] p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>
                    {locale === 'en'
                      ? 'Benchmark: 300 automated 40-day Monte-Carlo runs per tier (scripts/econ-sim.ts).'
                      : locale === 'es'
                      ? 'Benchmark: 300 partidas simuladas de 40 días por rango (scripts/econ-sim.ts).'
                      : 'Benchmark : 300 parties simulées de 40 jours par niveau (scripts/econ-sim.ts).'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onPlay}
                  className="bg-amber-400 px-4 py-2 font-bold uppercase tracking-wider text-zinc-950 hover:bg-amber-300 transition-colors cursor-pointer text-[10px]"
                >
                  {locale === 'en' ? 'Test Your Survival (/play) →' : locale === 'es' ? 'Pruébate en /play →' : 'Tester ta survie sur /play →'}
                </button>
              </div>
            </div>
          </section>

          {/* AUTOPSIE DU DEAL & CONSEIL DU PARRAIN */}
          <section className="border-b border-white/10 bg-[#0a0b0f] px-4 py-12 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-6xl space-y-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400">
                    {copy.autopsyEyebrow}
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] sm:text-5xl text-zinc-100">
                    {copy.autopsyTitle}
                  </h2>
                </div>
                <p className="max-w-md font-mono text-xs text-zinc-400">{copy.autopsySub}</p>
              </div>

              {/* 3 Blocs de l'Autopsie */}
              <div className="grid gap-4 sm:grid-cols-3 font-mono text-xs">
                {copy.autopsyPoints.map((pt) => (
                  <div
                    key={pt.title}
                    className="border border-white/10 bg-[#07080b] p-5 rounded-xl space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider inline-block ${
                        pt.tag.includes('ERREURS') || pt.tag.includes('MISTAKES') || pt.tag.includes('ERRORES')
                          ? 'bg-red-950/80 text-red-300 border border-red-500/30'
                          : pt.tag.includes('SUCCÈS') || pt.tag.includes('WINS') || pt.tag.includes('ACIERTOS')
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                      }`}>
                        {pt.tag}
                      </span>
                      <h3 className="text-sm font-bold text-zinc-100">{pt.title}</h3>
                      <p className="text-zinc-400 font-sans text-xs leading-relaxed">{pt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ARBITRAGE DE TRÉSORERIE : VENTE RAPIDE VS ENCHÈRES NOCTURNES */}
          <section className="border-b border-white/10 bg-[#07080b] px-4 py-12 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-6xl space-y-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400">
                    {copy.arbitrageEyebrow}
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] sm:text-5xl text-zinc-100">
                    {copy.arbitrageTitle}
                  </h2>
                </div>
                <p className="max-w-md font-mono text-xs text-zinc-400">{copy.arbitrageSub}</p>
              </div>

              {/* Grille 2 Colonnes : Vente Rapide vs Enchères Clandestines */}
              <div className="grid gap-6 sm:grid-cols-2 font-mono text-xs">
                {/* Vente Rapide */}
                <div className="border border-emerald-500/30 bg-[#09110d] p-6 rounded-xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                      <span className="font-bold text-sm text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        {copy.arbitrageFastTitle}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40">
                        {locale === 'en' ? '-5% Heat · Unlimited' : locale === 'es' ? '-5% Heat · Ilimitada' : '-5% Heat · Illimitée'}
                      </span>
                    </div>
                    <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                      {copy.arbitrageFastDesc}
                    </p>
                  </div>
                  <div className="border-t border-emerald-500/10 pt-3 text-[11px] text-emerald-400/80">
                    ✓ {locale === 'en' ? 'Instant liquidity for midnight rent' : locale === 'es' ? 'Liquidez inmediata para el alquiler nocturno' : 'Liquidité immédiate pour régler le loyer'}
                  </div>
                </div>

                {/* Enchères Clandestines */}
                <div className="border border-amber-500/30 bg-[#120e08] p-6 rounded-xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                      <span className="font-bold text-sm text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        {copy.arbitrageAuctionTitle}
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40">
                        {locale === 'en' ? '+20% Price · 1/Night' : locale === 'es' ? '+20% Precio · 1/Noche' : '+20% Cote · 1/Nuit'}
                      </span>
                    </div>
                    <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                      {copy.arbitrageAuctionDesc}
                    </p>
                  </div>
                  <div className="border-t border-amber-500/10 pt-3 text-[11px] text-amber-400/80">
                    ⚠️ {locale === 'en' ? 'Market crashes by -25% on 2nd auction' : locale === 'es' ? 'El mercado se hunde un -25% en la 2ª subasta' : 'Le marché sature à -25% dès la 2e pièce'}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* GALERIE RÉELLE DES VISAGES & ÉPISODES DE SAISON */}
          <section className="border-b border-white/10 px-4 py-12 sm:px-6 sm:py-14">
            <div className="mx-auto max-w-6xl space-y-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400">
                    {copy.castEyebrow} {season.seasonNumber} · {localizeSeasonName(season.name, locale)}
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] sm:text-5xl">
                    {copy.castTitle}
                  </h2>
                </div>
                <span className="font-mono text-xs text-zinc-400">{copy.castSub}</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {copy.castCards.map((c, idx) => (
                  <div key={c.name} className="border border-white/10 bg-[#0a0b0f] overflow-hidden">
                    <div className="h-64 bg-black overflow-hidden">
                      <img
                        src={castImages[idx].src}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = castImages[idx].fallback;
                        }}
                        alt={c.name}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                    <div className="p-4 font-mono space-y-1.5">
                      <p className="text-[10px] uppercase text-amber-400">{c.role}</p>
                      <h3 className="text-sm font-bold text-zinc-100">{c.name}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">{c.line}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-4 font-mono">
                {SEASON_EPISODES.slice(0, 4).map((ep) => {
                  const locEp = localizeSeasonEpisode(ep, locale);
                  return (
                    <div key={ep.id} className="border-l border-amber-500/40 pl-3 space-y-1">
                      <span className="text-[9px] uppercase text-zinc-400">{localizeFaction(ep.faction, locale)}</span>
                      <p className="text-xs font-bold text-zinc-200">{locEp.title}</p>
                      <p className="text-[11px] text-zinc-400">{locEp.stakes}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* CLASSEMENT LIVE + PASS SYNDICAT */}
          <section className="border-b border-white/10 bg-[#07080b] px-4 py-12 sm:px-6 sm:py-14">
            <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5 border border-white/10 bg-[#0b0c10] p-6 font-mono space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    {copy.topTitle}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {copy.topExpires} {countdownText}
                  </span>
                </div>
                {dailyTop.length === 0 ? (
                  <p className="text-xs text-zinc-400 leading-relaxed">{copy.topEmpty}</p>
                ) : (
                  <div className="divide-y divide-white/5">
                    {dailyTop.map((row, idx) => (
                      <div key={`${row.pseudo}-${idx}`} className="flex justify-between py-2.5 text-xs">
                        <span className="text-zinc-200">
                          <span className="text-zinc-400 mr-2">#{idx + 1}</span>
                          {row.pseudo}
                        </span>
                        <span className="font-bold text-emerald-400">
                          +{row.margin.toLocaleString('fr-FR')} $
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={onPlayDaily}
                  className="w-full border border-amber-400/60 py-2.5 text-[11px] font-bold uppercase text-amber-300 hover:bg-amber-400 hover:text-zinc-950 transition-colors"
                >
                  {copy.topBtn}
                </button>
              </div>

              <div className="lg:col-span-7 grid gap-4 sm:grid-cols-2 font-mono">
                <div className="border border-white/10 bg-[#0b0c10] p-6 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400">
                      {copy.freeLabel}
                    </span>
                    <div className="text-3xl font-bold text-zinc-100">{copy.freePrice}</div>
                    <ul className="space-y-2 text-xs text-zinc-400">
                      {copy.freeBullets.map((b) => (
                        <li key={b}>· {b}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={onPlay}
                    className="w-full border border-white/20 py-3 text-xs font-bold uppercase text-zinc-200 hover:border-amber-400"
                  >
                    {copy.freeBtn}
                  </button>
                </div>

                <div className="border border-amber-500/50 bg-[#100e09] p-6 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase tracking-widest text-amber-400">
                      {copy.vipLabel}
                    </span>
                    <div className="text-3xl font-bold text-amber-300">{copy.vipPrice}</div>
                    <ul className="space-y-2 text-xs text-zinc-300">
                      {copy.vipBullets.map((b) => (
                        <li key={b}>· {b}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    disabled={checkoutBusy}
                    onClick={startPassCheckout}
                    className="w-full bg-amber-400 py-3 text-xs font-bold uppercase text-zinc-950 hover:bg-amber-300 disabled:opacity-50"
                  >
                    {checkoutBusy ? copy.vipBusy : copy.vipBtn}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* FOMO CONTRAT DU JOUR */}
          <section className="px-4 py-12 sm:px-6 sm:py-14">
            <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 border border-amber-500/40 bg-[#0b0c10] p-6 sm:p-8 md:flex-row md:items-center">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-red-400">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>{countdownText}</span>
                </div>
                <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] sm:text-4xl">
                  {copy.fomoHeading}
                </h2>
                <p className="text-sm text-zinc-400">{copy.fomoSub}</p>
              </div>
              <button
                type="button"
                onClick={onPlayDaily}
                className="w-full md:w-auto shrink-0 bg-amber-400 px-7 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-zinc-950 hover:bg-amber-300"
              >
                {copy.ctaDaily} →
              </button>
            </div>
          </section>

          {/* CONTACT DIRECT -> hello@cashnoir.app */}
          <section id="contact" className="border-t border-white/10 bg-[#07080b] px-4 py-12 sm:px-6 sm:py-14">
            <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-12 items-start">
              <div className="lg:col-span-5 space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400">
                  {locale === 'en' ? 'Direct Line · Syndicate Desk' : locale === 'es' ? 'Línea Directa · Mesa del Sindicato' : 'Ligne Directe · Bureau du Syndicat'}
                </p>
                <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] sm:text-4xl text-zinc-100">
                  {locale === 'en' ? 'PRESS, BETA OR PARTNERSHIPS?' : locale === 'es' ? '¿PRENSA, BETA O ALIANZAS?' : 'PRESSE, BÊTA OU PARTENARIATS ?'}
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {locale === 'en'
                    ? 'Write directly to the team at hello@cashnoir.app. Creators, press access or bug reports — we reply fast.'
                    : locale === 'es'
                    ? 'Escribe directamente al equipo en hello@cashnoir.app. Creadores, acceso de prensa o reportes — respondemos rápido.'
                    : 'Écris directement à l’équipe sur hello@cashnoir.app. Créateurs, accès presse ou retours de bêta — réponse rapide.'}
                </p>
                <a
                  href="mailto:hello@cashnoir.app"
                  className="inline-block font-mono text-xs text-amber-400 hover:text-amber-300 underline"
                >
                  hello@cashnoir.app
                </a>
              </div>

              <form onSubmit={submitContact} className="lg:col-span-7 border border-white/10 bg-[#0b0c10] p-6 space-y-4 font-mono text-xs">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">
                      {locale === 'en' ? 'Your Email' : locale === 'es' ? 'Tu Email' : 'Ton Email'}
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full border border-white/15 bg-black/70 px-3 py-2.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">
                      {locale === 'en' ? 'Subject' : locale === 'es' ? 'Asunto' : 'Objet'}
                    </label>
                    <input
                      type="text"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder={locale === 'en' ? 'Beta / Press / Partnership' : locale === 'es' ? 'Beta / Prensa / Alianza' : 'Bêta / Presse / Partenariat'}
                      className="w-full border border-white/15 bg-black/70 px-3 py-2.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">
                    {locale === 'en' ? 'Message' : locale === 'es' ? 'Mensaje' : 'Message'}
                  </label>
                  <textarea
                    required
                    minLength={5}
                    rows={3}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder={locale === 'en' ? 'Your message...' : locale === 'es' ? 'Tu mensaje...' : 'Ton message...'}
                    className="w-full border border-white/15 bg-black/70 px-3 py-2.5 text-zinc-100 placeholder-zinc-600 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="submit"
                    disabled={contactStatus === 'busy'}
                    className="bg-amber-400 px-5 py-2.5 font-bold uppercase tracking-wider text-zinc-950 hover:bg-amber-300 disabled:opacity-50"
                  >
                    {contactStatus === 'busy'
                      ? (locale === 'en' ? 'Sending...' : locale === 'es' ? 'Enviando...' : 'Envoi...')
                      : (locale === 'en' ? 'Send to hello@cashnoir.app' : locale === 'es' ? 'Enviar a hello@cashnoir.app' : 'Envoyer à hello@cashnoir.app')}
                  </button>
                  {contactStatus === 'sent' && (
                    <span className="text-emerald-400">
                      {locale === 'en' ? '✓ Message sent.' : locale === 'es' ? '✓ Mensaje enviado.' : '✓ Message transmis.'}
                    </span>
                  )}
                  {contactStatus === 'error' && (
                    <span className="text-red-400">{contactError}</span>
                  )}
                </div>
              </form>
            </div>
          </section>
        </main>
      )}

      {/* Footer sobre avec maillage propre (blog / vs / guides / llms / sitemap) */}
      <footer className="border-t border-white/10 px-4 py-8 font-mono text-[11px] text-zinc-400 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <span>{copy.footerTag}</span>
          <div className="flex flex-wrap gap-4">
            <a href="/play" onClick={(e) => { e.preventDefault(); onPlay(); }} className="hover:text-zinc-200">
              /play
            </a>
            <a href={localePath('/blog')} onClick={(e) => { e.preventDefault(); onNavigate(localePath('/blog')); }} className="hover:text-zinc-200">
              {copy.navBlog}
            </a>
            <a href={localePath('/vs')} onClick={(e) => { e.preventDefault(); onNavigate(localePath('/vs')); }} className="hover:text-zinc-200">
              {copy.navVs}
            </a>
            <a href={localePath('/guides')} onClick={(e) => { e.preventDefault(); onNavigate(localePath('/guides')); }} className="hover:text-zinc-200">
              {copy.navGuides}
            </a>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); onNavigate('/privacy'); }} className="hover:text-zinc-200">
              Privacy
            </a>
            <a href="/terms" onClick={(e) => { e.preventDefault(); onNavigate('/terms'); }} className="hover:text-zinc-200">
              Terms
            </a>
            <a href="/llms.txt" className="hover:text-zinc-200">
              llms.txt
            </a>
            <a href="/sitemap.xml" className="hover:text-zinc-200">
              sitemap.xml
            </a>
          </div>
        </div>
      </footer>

      {cookieBannerOpen && (
        <aside
          aria-label="Cookie consent"
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl border border-white/15 bg-[#0b0c10]/95 p-4 backdrop-blur-md shadow-2xl font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <p className="text-zinc-300 leading-relaxed text-[11px]">
            {locale === 'en'
              ? 'We use essential session cookies and anonymous analytics (GA4) to improve CASH NOIR. '
              : locale === 'es'
              ? 'Usamos cookies esenciales de sesión y analítica anónima (GA4) para mejorar CASH NOIR. '
              : 'Nous utilisons des cookies de session essentiels et une mesure d’audience anonyme (GA4). '}
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/privacy');
              }}
              className="text-amber-400 underline hover:text-amber-300"
            >
              {locale === 'en' ? 'Privacy Policy' : locale === 'es' ? 'Política de Privacidad' : 'Confidentialité'}
            </a>
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                updateAnalyticsConsent(false);
                setCookieBannerOpen(false);
              }}
              className="border border-white/15 px-3 py-1.5 text-[11px] uppercase tracking-wider text-zinc-300 hover:text-white cursor-pointer"
            >
              {locale === 'en' ? 'Decline' : locale === 'es' ? 'Rechazar' : 'Refuser'}
            </button>
            <button
              type="button"
              onClick={() => {
                updateAnalyticsConsent(true);
                setCookieBannerOpen(false);
              }}
              className="bg-amber-400 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-950 hover:bg-amber-300 cursor-pointer"
            >
              {locale === 'en' ? 'Accept' : locale === 'es' ? 'Aceptar' : 'Accepter'}
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
