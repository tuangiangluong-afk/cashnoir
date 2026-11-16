import { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, Clock, Search, Flashlight, ShieldAlert } from 'lucide-react';
import {
  SITE_COPY,
  BLOG_ARTICLES,
  VERSUS_PAGES,
  GUIDE_PAGES,
  AEO_FAQ,
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

  const activeBlog = subPath.startsWith('/blog/')
    ? BLOG_ARTICLES.find((a) => a.slug === subPath.replace('/blog/', ''))
    : null;
  const activeVs = subPath.startsWith('/vs/')
    ? VERSUS_PAGES.find((v) => v.slug === subPath.replace('/vs/', ''))
    : null;
  const activeGuide = subPath.startsWith('/guides/')
    ? GUIDE_PAGES.find((g) => g.slug === subPath.replace('/guides/', ''))
    : null;
  const isBlogIndex = subPath === '/blog';

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

    const schemaPayload = activeBlog
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: activeBlog.title,
          datePublished: activeBlog.publishedAt,
          inLanguage: copy.htmlLang,
          description: activeBlog.excerpt,
          publisher: { '@type': 'Organization', name: 'CASH NOIR' },
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
              mainEntity: AEO_FAQ.map((f) => ({
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
  }, [locale, subPath, copy, activeBlog, activeVs, activeGuide, isBlogIndex]);

  const localePath = (sub: string) => {
    const clean = sub.startsWith('/') ? sub : `/${sub}`;
    if (locale === 'en') return clean;
    return clean === '/' ? `/${locale}` : `/${locale}${clean}`;
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
                href={localePath('/vs/papers-please')}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(localePath('/vs/papers-please'));
                }}
                className="hover:text-amber-300 transition-colors"
              >
                {copy.navVs}
              </a>
              <a
                href={localePath('/guides/negociation-ia-temps-reel')}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(localePath('/guides/negociation-ia-temps-reel'));
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
                    locale === loc ? 'bg-white/10 text-amber-300 font-bold' : 'text-zinc-500 hover:text-zinc-200'
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
              {hasExistingSave ? `${copy.ctaResume} (J${savedDay})` : copy.navPlay}
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
          </header>
          <div className="space-y-8">
            {activeBlog.sections.map((s) => (
              <section key={s.heading} className="space-y-2.5">
                <h2 className="font-mono text-base font-bold uppercase tracking-wider text-amber-300">
                  {s.heading}
                </h2>
                <p className="text-base leading-relaxed text-zinc-300">{s.body}</p>
              </section>
            ))}
          </div>
          <button
            type="button"
            onClick={onPlay}
            className="bg-amber-400 px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 hover:bg-amber-300"
          >
            {copy.ctaPrimary} →
          </button>
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
            {BLOG_ARTICLES.map((art) => (
              <a
                key={art.slug}
                href={localePath(`/blog/${art.slug}`)}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(localePath(`/blog/${art.slug}`));
                }}
                className="block py-6 group"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
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
              {activeVs.directAnswer}
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
          <p className="text-base leading-relaxed text-zinc-300">{activeVs.verdict}</p>
          <button
            type="button"
            onClick={onPlay}
            className="bg-amber-400 px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 hover:bg-amber-300"
          >
            {copy.vsTestBtn}
          </button>
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
          </div>
          <div className="space-y-6">
            {activeGuide.steps.map((st) => (
              <div key={st.title} className="border-l-2 border-amber-400/70 pl-4 space-y-1">
                <h2 className="font-mono text-sm font-bold text-zinc-100">{st.title}</h2>
                <p className="text-sm leading-relaxed text-zinc-300">{st.detail}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onPlay}
            className="bg-amber-400 px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 hover:bg-amber-300"
          >
            {copy.guideApplyBtn}
          </button>
        </main>
      )}

      {/* HOME MARKETING (/) */}
      {!activeBlog && !isBlogIndex && !activeVs && !activeGuide && (
        <>
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
                          <span className="text-[10px] uppercase text-zinc-500">{copy.simAskLabel}</span>
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

          {/* GALERIE RÉELLE DES VISAGES & ÉPISODES DE SAISON */}
          <section className="border-b border-white/10 px-4 py-12 sm:px-6 sm:py-14">
            <div className="mx-auto max-w-6xl space-y-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400">
                    {copy.castEyebrow} {season.seasonNumber} · {season.name}
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] sm:text-5xl">
                    {copy.castTitle}
                  </h2>
                </div>
                <span className="font-mono text-xs text-zinc-500">{copy.castSub}</span>
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
                {SEASON_EPISODES.slice(0, 4).map((ep) => (
                  <div key={ep.id} className="border-l border-amber-500/40 pl-3 space-y-1">
                    <span className="text-[9px] uppercase text-zinc-500">{ep.faction}</span>
                    <p className="text-xs font-bold text-zinc-200">{ep.title}</p>
                    <p className="text-[11px] text-zinc-400">{ep.stakes}</p>
                  </div>
                ))}
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
                  <span className="text-[10px] text-zinc-500">
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
                          <span className="text-zinc-500 mr-2">#{idx + 1}</span>
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
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500">
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
        </>
      )}

      {/* Footer sobre avec maillage propre (blog / vs / guides / llms / sitemap) */}
      <footer className="border-t border-white/10 px-4 py-8 font-mono text-[11px] text-zinc-500 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <span>{copy.footerTag}</span>
          <div className="flex flex-wrap gap-4">
            <a href="/play" onClick={(e) => { e.preventDefault(); onPlay(); }} className="hover:text-zinc-200">
              /play
            </a>
            <a href={localePath('/blog')} onClick={(e) => { e.preventDefault(); onNavigate(localePath('/blog')); }} className="hover:text-zinc-200">
              {copy.navBlog}
            </a>
            <a href={localePath('/vs/papers-please')} onClick={(e) => { e.preventDefault(); onNavigate(localePath('/vs/papers-please')); }} className="hover:text-zinc-200">
              vs Papers, Please
            </a>
            <a href={localePath('/vs/dealers-life')} onClick={(e) => { e.preventDefault(); onNavigate(localePath('/vs/dealers-life')); }} className="hover:text-zinc-200">
              vs Dealer&apos;s Life
            </a>
            <a href={localePath('/guides/negociation-ia-temps-reel')} onClick={(e) => { e.preventDefault(); onNavigate(localePath('/guides/negociation-ia-temps-reel')); }} className="hover:text-zinc-200">
              {copy.navGuides}
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
    </div>
  );
}
