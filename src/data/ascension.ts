/**
 * Ascension (New Game+): after reaching Swiss bank >= 50K$ or surviving 30+ days,
 * the player can "ascend" for a harder run with permanent modifiers.
 */
export interface AscensionModifier {
  level: number;
  title: string;
  desc: string;
  mefianceBoost: number;
  rentMult: number;
  rerollPenalty: number;
  trapBoost: number;
  floorBoost: number;
}

export const ASCENSION_LEVELS: AscensionModifier[] = [
  {
    level: 1,
    title: 'Ascension I · Quartier Chaud',
    desc: '+10 % méfiance. Loyer +15 %. Un reroll de moins.',
    mefianceBoost: 10,
    rentMult: 1.15,
    rerollPenalty: 1,
    trapBoost: 0.05,
    floorBoost: 0.03,
  },
  {
    level: 2,
    title: 'Ascension II · Cible Prioritaire',
    desc: '+20 % méfiance. Loyer +30 %. Pièges plus discrets. Plancher +6 %.',
    mefianceBoost: 20,
    rentMult: 1.3,
    rerollPenalty: 1,
    trapBoost: 0.10,
    floorBoost: 0.06,
  },
  {
    level: 3,
    title: 'Ascension III · Parrain',
    desc: '+30 % méfiance. Loyer +50 %. Plancher +10 %. Un seul reroll/jour.',
    mefianceBoost: 30,
    rentMult: 1.5,
    rerollPenalty: 2,
    trapBoost: 0.12,
    floorBoost: 0.10,
  },
];

export function getAscensionModifier(level: number): AscensionModifier | null {
  if (level <= 0) return null;
  return ASCENSION_LEVELS[Math.min(level, ASCENSION_LEVELS.length) - 1];
}

export function canAscend(swissBank: number, maxDaySurvived: number): boolean {
  return swissBank >= 50_000 || maxDaySurvived >= 30;
}
