// Service worker minimal : coquille hors-ligne. /api n'est jamais mis en cache (quotas, Pass, paiement).
const V = 'cashnoir-v1';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(['/', '/favicon.svg', '/manifest.webmanifest'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  const u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api')) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).catch(() => caches.match('/')));
    return;
  }
  e.respondWith(
    caches.match(r).then((hit) => hit || fetch(r).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(V).then((c) => c.put(r, copy)); }
      return res;
    })),
  );
});
