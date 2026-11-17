import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
