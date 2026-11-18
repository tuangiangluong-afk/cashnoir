import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

export const isNative = Capacitor.isNativePlatform();
const API = 'https://cashnoir.app';
const TOKEN_KEY = 'fence_native_token';
const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};

/** Connexion Google : navigation classique sur le web, navigateur système + deep link `cashnoir://` en natif (Google bloque OAuth dans une WebView). */
export function startGoogleLogin() {
  if (isNative) void Browser.open({ url: `${API}/api/auth/google?native=1` });
  else window.location.href = '/api/auth/google';
}

export function clearNativeSession() {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* stockage indisponible */ }
}

/** En natif uniquement : /api -> https://cashnoir.app/api, session en Bearer (cookies tiers bloqués par WKWebView). Sur le web/PWA : aucun effet. */
if (isNative) {
  document.documentElement.setAttribute('data-native', '');
  const orig = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input !== 'string' || !input.startsWith('/api')) return orig(input, init);
    const headers = new Headers(init?.headers);
    const token = getToken();
    if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
    return orig(API + input, { ...init, headers, credentials: 'include' });
  };

  void App.addListener('appUrlOpen', async ({ url }) => {
    const ticket = new URL(url).searchParams.get('ticket');
    if (!url.startsWith('cashnoir://auth') || !ticket) return;
    void Browser.close().catch(() => {});
    try {
      const res = await fetch('/api/auth/native', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        window.location.reload();
      }
    } catch { /* l'utilisateur peut relancer la connexion */ }
  });
}
