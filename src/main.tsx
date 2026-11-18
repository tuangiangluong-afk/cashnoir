import { StrictMode, Suspense, lazy, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import type { Locale } from './data/seoContent';

const GameApp = lazy(() => import('./App.tsx'));
const MarketingSite = lazy(() =>
  import('./components/MarketingSite.tsx').then((m) => ({ default: m.MarketingSite })),
);
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard.tsx').then((m) => ({ default: m.AdminDashboard })),
);

// Toutes les requêtes vers l'API portent la langue du joueur : les erreurs du serveur reviennent traduites.
const nativeFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.pathname : input.url;
  if (url.startsWith('/api/')) {
    let locale = 'fr';
    try {
      locale = localStorage.getItem('fence_locale') || (navigator.language || 'fr').slice(0, 2);
    } catch {
      /* stockage indisponible : langue du navigateur */
    }
    const headers = new Headers(init?.headers);
    headers.set('X-Game-Locale', locale);
    return nativeFetch(input, { ...init, headers });
  }
  return nativeFetch(input, init);
};

function utcMidnightCountdown(): string {
  const now = new Date();
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  const s = Math.max(0, Math.floor((next - now.getTime()) / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

function readSavedMeta() {
  try {
    const day = Number(localStorage.getItem('fence_day') || '1') || 1;
    const cash = Number(localStorage.getItem('fence_cash') || '2500') || 2500;
    const profit = Number(localStorage.getItem('fence_profit') || '0') || 0;
    const swiss = Number(localStorage.getItem('fence_swiss') || '0') || 0;
    return { day, cash, hasSave: day > 1 || profit !== 0 || swiss > 0 || cash !== 2500 };
  } catch {
    return { day: 1, cash: 2500, hasSave: false };
  }
}

function RootRouter() {
  const [routePath, setRoutePath] = useState<string>(() => window.location.pathname || '/');
  const [countdownText, setCountdownText] = useState<string>(utcMidnightCountdown);

  useEffect(() => {
    const onPop = () => setRoutePath(window.location.pathname || '/');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const isGame = routePath === '/play' || routePath.startsWith('/play/');
  const isAdmin = routePath === '/admin' || routePath.startsWith('/admin/');

  useEffect(() => {
    if (isGame || isAdmin) return;
    const id = setInterval(() => setCountdownText(utcMidnightCountdown()), 1000);
    return () => clearInterval(id);
  }, [isGame, isAdmin]);

  const navigateTo = (nextPath: string) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
      setRoutePath(nextPath);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const launchLocale = (): Locale =>
    routePath === '/fr' || routePath.startsWith('/fr/')
      ? 'fr'
      : routePath === '/es' || routePath.startsWith('/es/')
        ? 'es'
        : 'en';

  if (isAdmin) {
    let loc: Locale = 'fr';
    try {
      const saved = localStorage.getItem('fence_locale');
      if (saved === 'en' || saved === 'fr' || saved === 'es') loc = saved;
    } catch {}
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#07080c]" />}>
        <AdminDashboard onNavigate={navigateTo} gameLocale={loc} />
      </Suspense>
    );
  }

  if (isGame) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#07080c]" />}>
        <GameApp />
      </Suspense>
    );
  }

  const saved = readSavedMeta();
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050507]" />}>
      <MarketingSite
        pathname={routePath}
        onNavigate={navigateTo}
        hasExistingSave={saved.hasSave}
        savedDay={saved.day}
        savedCash={saved.cash}
        countdownText={countdownText}
        onPlay={() => {
          try {
            localStorage.setItem('fence_locale', launchLocale());
            localStorage.setItem('fence_entered', '1');
          } catch {}
          document.title = 'CASH NOIR — Counter';
          navigateTo('/play');
        }}
        onPlayDaily={() => {
          try {
            localStorage.setItem('fence_locale', launchLocale());
            localStorage.setItem('fence_entered', '1');
          } catch {}
          document.title = 'CASH NOIR — Daily Contract';
          navigateTo('/play/daily');
        }}
      />
    </Suspense>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootRouter />
  </StrictMode>,
);
