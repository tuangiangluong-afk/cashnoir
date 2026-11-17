// Statistiques anonymes : seulement des compteurs agrégés par jour (jamais d'IP, d'identifiant ni de texte libre).
// Le joueur peut les couper dans ses préférences ; le navigateur respecte aussi « Do Not Track ».
export const EVENTS = new Set(['session_start', 'game_over', 'pass_click', 'scripted_mode', 'daily_start', 'daily_done', 'checkpoint_restart', 'saga_end', 'windfall_buy', 'quota_hit']);

/** store : { 'YYYY-MM-DD': { nom: { n, sum, max } } }. Retourne false si l'événement est refusé. */
export function recordEvent(store, date, name, v) {
  if (!EVENTS.has(name) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const value = Number.isFinite(Number(v)) ? Math.max(0, Math.min(10000, Math.round(Number(v)))) : 0;
  const day = (store[date] = store[date] || {});
  const e = (day[name] = day[name] || { n: 0, sum: 0, max: 0 });
  e.n += 1;
  e.sum += value;
  e.max = Math.max(e.max, value);
  return true;
}
