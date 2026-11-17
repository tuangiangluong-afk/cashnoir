// Paliers de redémarrage : après une défaite, on repart du début du dernier chapitre (5 jours) atteint,
// jamais plus bas. Les chapitres validés sont verrouillés par le record (bestDay).
export const CHAPTER_DAYS = 5;

/** Loyer du soir : base + pente par jour (hors taxe sur le cash). Base abaissée à 300 $ : les 3 premières nuits ne mangent plus tout le capital de départ. */
export const RENT_BASE = 300;
export const RENT_SLOPE = 350;

/** Premier jour du dernier chapitre atteint (1 tant que le record est inférieur au jour 6). */
export function chapterStart(bestDay: number): number {
  return bestDay > CHAPTER_DAYS ? Math.floor((bestDay - 1) / CHAPTER_DAYS) * CHAPTER_DAYS + 1 : 1;
}

/** Caisse de reprise : premier loyer du chapitre (RENT_BASE + RENT_SLOPE par jour) * multiplicateur de loyer (ascension) + 15 % taxe + fonds de roulement de 1 500 $ pour pouvoir acheter sans banqueroute immédiate. */
export function checkpointCash(day: number, rentMult = 1): number {
  if (day <= 1) return 2500;
  const baseRent = (RENT_BASE + (day - 1) * RENT_SLOPE) * rentMult;
  const workingCapital = 1500;
  return Math.max(2500, Math.round((baseRent * 1.15 + workingCapital) / 50) * 50);
}
