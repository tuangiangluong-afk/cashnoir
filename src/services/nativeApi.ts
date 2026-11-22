import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Keyboard } from '@capacitor/keyboard';

export const isNative = Capacitor.isNativePlatform();
// shortcut: Google seul est refusé par l'App Store (règle 4.8, Sign in with Apple obligatoire) ; sur iOS on joue sans compte tant que Sign in with Apple n'est pas branché.
export const googleLoginAvailable = !(isNative && Capacitor.getPlatform() === 'ios');
const API = 'https://cashnoir.app';
const TOKEN_KEY = 'fence_native_token';
const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};

/** Connexion Google : navigation classique sur le web, navigateur système + deep link `cashnoir://` en natif (Google bloque OAuth dans une WebView). */
let loginFailed = false;
function reportLoginFailure() {
  loginFailed = true;
  window.dispatchEvent(new Event('cashnoir-login-error'));
}
export function consumeLoginError() {
  const failed = loginFailed;
  loginFailed = false;
  return failed;
}
export function startGoogleLogin() {
  if (isNative) void Browser.open({ url: `${API}/api/auth/google?native=1`, toolbarColor: '#050507', presentationStyle: 'popover' }).catch(reportLoginFailure);
  else window.location.href = '/api/auth/google';
}

/** Pages légales du site : navigateur intégré en natif (le site marketing n'est pas embarqué dans l'app). */
export function openSitePage(path: string) {
  void Browser.open({ url: `${API}${path}`, toolbarColor: '#050507' });
}

/** Bouton retour Android : renvoie de quoi retirer l'écouteur (sans effet ailleurs). */
export function onAndroidBack(fn: () => void): () => void {
  if (!isNative || Capacitor.getPlatform() !== 'android') return () => {};
  const listener = App.addListener('backButton', fn);
  return () => void listener.then((l) => l.remove());
}

/** Comme une app native : retour à l'écran d'accueil du téléphone, la partie reste en mémoire. */
export function minimizeApp() {
  void App.minimizeApp().catch(() => {});
}

export function clearNativeSession() {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* stockage indisponible */ }
}

/** En natif uniquement : /api -> https://cashnoir.app/api, session en Bearer (cookies tiers bloqués par WKWebView). Sur le web/PWA : aucun effet. */
if (isNative) {
  document.documentElement.setAttribute('data-native', '');
  // L'app native ouvre directement le comptoir (le site marketing reste réservé au web).
  if (window.location.pathname === '/') window.history.replaceState(null, '', '/play');
  void SystemBars.setStyle({ style: SystemBarsStyle.Dark }).catch(() => {});
  // Pas de barre « ˄ ˅ ✓ » au-dessus du clavier iOS : une app de chat n'en a pas.
  if (Capacitor.getPlatform() === 'ios') void Keyboard.setAccessoryBarVisible({ isVisible: false }).catch(() => {});
  const orig = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input !== 'string' || !input.startsWith('/api')) return orig(input, init);
    const headers = new Headers(init?.headers);
    const token = getToken();
    if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
    return orig(API + input, { ...init, headers, credentials: 'include' });
  };

  let lastTicket = '';
  const finishLogin = async (url: string) => {
    const callback = new URL(url);
    if (callback.protocol !== 'cashnoir:' || callback.host !== 'auth') return;
    const ticket = callback.searchParams.get('ticket');
    if (!ticket || ticket === lastTicket) return;
    lastTicket = ticket;
    void Browser.close().catch(() => {});
    try {
      const res = await fetch('/api/auth/native', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket }),
      });
      const data = await res.json();
      if (!res.ok || typeof data.token !== 'string' || !data.token) throw new Error('Login exchange failed');
      localStorage.setItem(TOKEN_KEY, data.token);
      window.location.reload();
    } catch { reportLoginFailure(); }
  };
  void App.addListener('appUrlOpen', ({ url }) => finishLogin(url)).then(async () => {
    const launch = await App.getLaunchUrl();
    if (launch?.url) await finishLogin(launch.url);
  }).catch(() => {});
}
