// Ligue hebdomadaire : somme des marges du contrat quotidien (déjà vérifié par le serveur) sur la semaine ISO en cours
// (lundi 00:00 UTC -> dimanche). Aucune confiance accordée au navigateur : on ne lit que le classement existant.
const DAY = 86_400_000;

/** Lundi 00:00 UTC de la semaine qui contient `now`. */
export function weekStart(now) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dow = (d.getUTCDay() + 6) % 7; // lundi = 0
  return new Date(d.getTime() - dow * DAY);
}

export const tierOf = (rank, n) => (rank <= 3 ? 'master' : rank <= Math.max(3, Math.ceil(n * 0.2)) ? 'gold' : rank <= Math.ceil(n * 0.5) ? 'silver' : 'bronze');

/** db : { 'YYYY-MM-DD': [{ pseudo, margin }] } -> classement de la semaine en cours. */
export function computeLeague(db, now = new Date()) {
  const start = weekStart(now);
  const totals = new Map();
  for (let i = 0; i < 7; i++) {
    const date = new Date(start.getTime() + i * DAY).toISOString().slice(0, 10);
    for (const e of db[date] || []) {
      const key = String(e.pseudo || '').trim().slice(0, 20);
      if (!key) continue;
      const cur = totals.get(key) || { pseudo: key, total: 0, days: 0 };
      cur.total += Math.max(0, Number(e.margin) || 0);
      cur.days += 1;
      totals.set(key, cur);
    }
  }
  const sorted = [...totals.values()].sort((a, b) => b.total - a.total || b.days - a.days);
  const standings = sorted.map((s, i) => ({ ...s, rank: i + 1, tier: tierOf(i + 1, sorted.length) }));
  return { weekStart: start.toISOString().slice(0, 10), endsAt: new Date(start.getTime() + 7 * DAY).toISOString(), players: standings.length, standings: standings.slice(0, 20) };
}
