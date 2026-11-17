/**
 * Ascension (difficulté croissante) : après un record de 30 jours ou 50 000 $ au compte suisse, le joueur peut « monter »
 * pour une partie plus dure. Dix niveaux CUMULATIFS : chaque niveau garde les règles des précédents (les valeurs ci-dessous
 * sont déjà cumulées) et en ajoute une qui force à changer de façon de jouer.
 */
type Loc = 'fr' | 'en' | 'es';

export interface AscensionModifier {
  level: number;
  title: Record<Loc, string>;
  desc: Record<Loc, string>;
  /** Méfiance de départ des clients (points). */
  mefianceBoost: number;
  /** Colère de départ des clients (points). */
  angerBoost: number;
  rentMult: number;
  rerollPenalty: number;
  /** Part de pièges supplémentaire (0,05 = +5 points de probabilité). */
  trapBoost: number;
  /** Plancher des vendeurs relevé (0,05 = +5 %). */
  floorBoost: number;
  /** La descente de police se déclenche à (80 − raidShift) % de Heat. */
  raidShift: number;
  /** Le seuil de braquage est multiplié par cette valeur (< 1 = plus tôt). */
  heistScale: number;
  /** Heat ajouté par le crédit du Syndicat (15 par défaut). */
  loanHeat: number;
  /** Heat plancher permanent. */
  heatMin: number;
  /** La radio de police est hors service un jour sur trois. */
  radioDown: boolean;
}

const BASE = { mefianceBoost: 0, angerBoost: 0, rentMult: 1, rerollPenalty: 0, trapBoost: 0, floorBoost: 0, raidShift: 0, heistScale: 1, loanHeat: 15, heatMin: 0, radioDown: false };

const row = (level: number, title: Record<Loc, string>, desc: Record<Loc, string>, o: Partial<typeof BASE>): AscensionModifier => ({ level, title, desc, ...BASE, ...o });

export const ASCENSION_LEVELS: AscensionModifier[] = [];
let acc: Partial<typeof BASE> = {};
const add = (level: number, title: Record<Loc, string>, desc: Record<Loc, string>, o: Partial<typeof BASE>) => {
  acc = { ...acc, ...o };
  ASCENSION_LEVELS.push(row(level, title, desc, acc));
};

add(1, { fr: 'Quartier Chaud', en: 'Hot Neighborhood', es: 'Barrio Caliente' }, { fr: 'Méfiance +10, loyer +15 %, un reroll de moins.', en: 'Suspicion +10, rent +15%, one reroll less.', es: 'Desconfianza +10, alquiler +15 %, un cambio menos.' }, { mefianceBoost: 10, rentMult: 1.15, rerollPenalty: 1 });
add(2, { fr: 'Cible Prioritaire', en: 'Priority Target', es: 'Objetivo Prioritario' }, { fr: 'Plancher des vendeurs +5 %, plus de pièges.', en: 'Seller floors +5%, more traps.', es: 'Mínimos de vendedores +5 %, más trampas.' }, { floorBoost: 0.05, trapBoost: 0.05 });
add(3, { fr: 'Pression Policière', en: 'Police Pressure', es: 'Presión Policial' }, { fr: 'Descente de police dès 70 % de Heat.', en: 'Police raid from 70% Heat.', es: 'Redada policial desde el 70 % de Heat.' }, { raidShift: 10, mefianceBoost: 15 });
add(4, { fr: 'Racket Nocturne', en: 'Night Racket', es: 'Extorsión Nocturna' }, { fr: 'Les braqueurs visent dès une caisse 35 % moins pleine.', en: 'Robbers target a register 35% less full.', es: 'Los ladrones atacan con una caja un 35 % menos llena.' }, { heistScale: 0.65 });
add(5, { fr: 'Usure du Milieu', en: 'Underworld Wear', es: 'Desgaste del Hampa' }, { fr: 'Le crédit du Syndicat coûte +25 % de Heat.', en: 'The Syndicate loan costs +25% Heat.', es: 'El crédito del Sindicato cuesta +25 % de Heat.' }, { loanHeat: 25 });
add(6, { fr: 'Vendeurs Tendus', en: 'Tense Sellers', es: 'Vendedores Tensos' }, { fr: 'Colère de départ +10, méfiance +20.', en: 'Starting anger +10, suspicion +20.', es: 'Ira inicial +10, desconfianza +20.' }, { angerBoost: 10, mefianceBoost: 20 });
add(7, { fr: 'Loyer Étrangleur', en: 'Choking Rent', es: 'Alquiler Asfixiante' }, { fr: 'Loyer +35 %, plancher des vendeurs +8 %.', en: 'Rent +35%, seller floors +8%.', es: 'Alquiler +35 %, mínimos de vendedores +8 %.' }, { rentMult: 1.35, floorBoost: 0.08 });
add(8, { fr: 'Marché Noir Toxique', en: 'Toxic Black Market', es: 'Mercado Negro Tóxico' }, { fr: 'Beaucoup plus de pièges (+15 points).', en: 'Far more traps (+15 points).', es: 'Muchas más trampas (+15 puntos).' }, { trapBoost: 0.15 });
add(9, { fr: 'Surveillance Étroite', en: 'Tight Surveillance', es: 'Vigilancia Estrecha' }, { fr: 'Plus aucun reroll de base ; radio de police hors service un jour sur trois.', en: 'No base rerolls; police radio down one day in three.', es: 'Sin cambios base; radio de la policía fuera de servicio un día de cada tres.' }, { rerollPenalty: 2, radioDown: true });
add(10, { fr: 'Parrain Suprême', en: 'Supreme Godfather', es: 'Padrino Supremo' }, { fr: 'Loyer +50 %, plancher +12 %, Heat jamais sous 15 %.', en: 'Rent +50%, floors +12%, Heat never below 15%.', es: 'Alquiler +50 %, mínimos +12 %, Heat nunca bajo el 15 %.' }, { rentMult: 1.5, floorBoost: 0.12, mefianceBoost: 30, heatMin: 15 });

export const MAX_ASCENSION = ASCENSION_LEVELS.length;
export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export function getAscensionModifier(level: number): AscensionModifier | null {
  if (level <= 0) return null;
  return ASCENSION_LEVELS[Math.min(level, MAX_ASCENSION) - 1];
}

export function canAscend(swissBank: number, maxDaySurvived: number): boolean {
  return swissBank >= 50_000 || maxDaySurvived >= 30;
}
