// Statistiques anonymes : un compteur par événement, aucune donnée personnelle (voir server/telemetry.mjs).
export function track(name: string, v?: number): void {
  try {
    if (localStorage.getItem('fence_telemetry') === '0' || navigator.doNotTrack === '1') return;
    const body = JSON.stringify({ name, v });
    if (typeof navigator.sendBeacon === 'function') navigator.sendBeacon('/api/event', new Blob([body], { type: 'application/json' }));
    else void fetch('/api/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  } catch {
    /* stockage ou réseau indisponible : on ne mesure pas, le jeu continue */
  }
}
