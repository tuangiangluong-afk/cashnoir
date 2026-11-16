import type { Locale } from './seoContent';
import { localizeChallenge } from './noirLocalization';

/** Weekly rotating challenge — deterministic from ISO week number. */
export interface WeeklyChallenge {
  id: string;
  title: string;
  desc: string;
  modifier: {
    mefianceBoost?: number;
    fearBoost?: number;
    streetValueMult?: number;
    disableUv?: boolean;
    disableLoupe?: boolean;
    extraRerollCost?: number;
    bonusCashPerDeal?: number;
  };
}

const CHALLENGE_POOL: WeeklyChallenge[] = [
  {
    id: 'uv-morte',
    title: 'Semaine UV Morte',
    desc: 'Lampe UV en panne toute la semaine. +200 $ bonus par deal conclu.',
    modifier: { disableUv: true, bonusCashPerDeal: 200 },
  },
  {
    id: 'paranoia',
    title: 'Paranoïa Générale',
    desc: 'Tous les clients arrivent avec +20 % Méfiance. Revente rue ×1,25.',
    modifier: { mefianceBoost: 20, streetValueMult: 1.25 },
  },
  {
    id: 'marche-noir',
    title: 'Grand Marché Noir',
    desc: 'Valeur rue ×1,4 sur tout. Mais chaque reroll coûte +5 Heat.',
    modifier: { streetValueMult: 1.4, extraRerollCost: 5 },
  },
  {
    id: 'peur-bleue',
    title: 'Peur Bleue',
    desc: 'Clients terrorisés (+25 Peur). Enchères -15 %.',
    modifier: { fearBoost: 25 },
  },
  {
    id: 'loupe-cassee',
    title: 'Loupe Fêlée',
    desc: 'Loupe hors service. Bluff pur ou UV. +150 $ bonus par deal.',
    modifier: { disableLoupe: true, bonusCashPerDeal: 150 },
  },
  {
    id: 'fievre-acheteuse',
    title: 'Fièvre Acheteuse',
    desc: 'Clients pressés (-10 Méfiance). Prix demandés +15 % plus hauts.',
    modifier: { mefianceBoost: -10 },
  },
];

export function getWeeklyChallenge(dateStr: string, locale: Locale = 'fr'): WeeklyChallenge {
  const d = new Date(dateStr);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d.getTime() - jan1.getTime()) / 86_400_000 + jan1.getDay() + 1) / 7);
  const base = CHALLENGE_POOL[weekNum % CHALLENGE_POOL.length];
  if (locale === 'fr') return base;
  const loc = localizeChallenge(base, locale);
  return {
    ...base,
    title: loc.title,
    desc: loc.desc,
  };
}
