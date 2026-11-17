// Danger qui grandit avec la richesse : une caisse bien garnie attire les braqueurs. La porte blindée réduit le risque
// de 60 %, et l'argent au compte suisse n'est jamais exposé : c'est la raison de le remplir.
export const heistThreshold = (day: number): number => 12000 + day * 600;

/** Probabilité de braquage cette nuit (0 sous le seuil, plafonnée à 60 %). */
export function heistRisk(cash: number, day: number, armored: boolean): number {
  const th = heistThreshold(day);
  if (cash <= th) return 0;
  const r = Math.min(0.6, (cash - th) / (th * 2));
  return armored ? r * 0.4 : r;
}

/** Perte en cas de braquage : 12 à 25 % de la caisse. */
export function heistLoss(cash: number, rand: () => number): number {
  return Math.round((cash * (0.12 + rand() * 0.13)) / 50) * 50;
}
