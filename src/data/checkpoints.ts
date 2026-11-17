// Paliers de redémarrage : après une défaite, on repart du début du dernier chapitre (5 jours) atteint,
// jamais plus bas. Les chapitres validés sont verrouillés par le record (bestDay).
export const CHAPTER_DAYS = 5;

/** Premier jour du dernier chapitre atteint (1 tant que le record est inférieur au jour 6). */
export function chapterStart(bestDay: number): number {
  return bestDay > CHAPTER_DAYS ? Math.floor((bestDay - 1) / CHAPTER_DAYS) * CHAPTER_DAYS + 1 : 1;
}

/** Caisse de reprise : premier loyer du chapitre (500 + 350 par jour) * multiplicateur de loyer (ascension) + 15 % taxe + fonds de roulement de 1 500 $ pour pouvoir acheter sans banqueroute immédiate. */
export function checkpointCash(day: number, rentMult = 1): number {
  if (day <= 1) return 2500;
  const baseRent = (500 + (day - 1) * 350) * rentMult;
  const workingCapital = 1500;
  return Math.max(2500, Math.round((baseRent * 1.15 + workingCapital) / 50) * 50);
}
