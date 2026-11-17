// Paliers de redémarrage : après une défaite, on repart du début du dernier chapitre (5 jours) atteint,
// jamais plus bas. Les chapitres validés sont verrouillés par le record (bestDay).
export const CHAPTER_DAYS = 5;

/** Premier jour du dernier chapitre atteint (1 tant que le record est inférieur au jour 6). */
export function chapterStart(bestDay: number): number {
  return bestDay > CHAPTER_DAYS ? Math.floor((bestDay - 1) / CHAPTER_DAYS) * CHAPTER_DAYS + 1 : 1;
}

/** Caisse de reprise : le premier loyer du chapitre (500 + 350 par jour) * multiplicateur de loyer (ascension) + 15 % pour la taxe du Syndicat, jamais moins que le départ classique. */
export function checkpointCash(day: number, rentMult = 1): number {
  const baseRent = (500 + (day - 1) * 350) * rentMult;
  return Math.max(2500, Math.round((baseRent * 1.15) / 50) * 50);
}
