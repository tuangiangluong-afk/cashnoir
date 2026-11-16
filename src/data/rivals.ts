/**
 * RIVAUX IA & MARCHÉ NOIR DYNAMIQUE
 * 3 receleurs concurrents qui évoluent chaque nuit + cours du marché par catégorie.
 */

import { localizeCategory } from './noirLocalization';

export interface RivalFence {
  id: string;
  name: string;
  district: string;
  specialty: string;
  netWorth: number;
  lastHeadline: string;
}

export const INITIAL_RIVALS: RivalFence[] = [
  {
    id: 'wu',
    name: 'Madame Wu',
    district: 'Chinatown',
    specialty: 'Art & Reliques',
    netWorth: 4200,
    lastHeadline: 'A racheté deux icônes byzantines sous le nez des douanes.',
  },
  {
    id: 'vassili',
    name: 'Vassili le Balafré',
    district: 'Docks du Nord',
    specialty: 'Armement & Fret',
    netWorth: 3600,
    lastHeadline: 'Écoule des caisses de munitions vers le port d’Anvers.',
  },
  {
    id: 'ashworth',
    name: 'Lord Ashworth',
    district: 'Quartier Financier',
    specialty: 'Secrets & Joaillerie',
    netWorth: 5100,
    lastHeadline: 'Dîne avec un procureur tout en négociant des titres au porteur.',
  },
];

export type MarketTrendMap = Record<string, number>;

const CATEGORIES = ['Données', 'Joaillerie', 'Armement', 'Art', 'Reliques'];

export function rollMarketTrends(day: number, locale: 'en' | 'fr' | 'es' = 'fr'): {
  trends: MarketTrendMap;
  headline: string;
} {
  const hotIdx = day % CATEGORIES.length;
  const coldIdx = (day + 2) % CATEGORIES.length;
  const trends: MarketTrendMap = {};
  CATEGORIES.forEach((cat, idx) => {
    if (idx === hotIdx) trends[cat] = 1.3;
    else if (idx === coldIdx) trends[cat] = 0.8;
    else trends[cat] = 1.0;
  });

  const hotCat = localizeCategory(CATEGORIES[hotIdx], locale);
  const coldCat = localizeCategory(CATEGORIES[coldIdx], locale);
  const headline =
    locale === 'en'
      ? `Evening Market Rates: ${hotCat} (+30% at auction) · ${coldCat} oversaturated (−20%).`
      : locale === 'es'
        ? `Cotización nocturna: ${hotCat} (+30% en subasta) · ${coldCat} saturado (−20%).`
        : `Cours du soir : ${CATEGORIES[hotIdx]} (+30 % aux enchères) · ${CATEGORIES[coldIdx]} saturé (−20 %).`;

  return { trends, headline };
}

export function advanceRivals(
  rivals: RivalFence[],
  day: number,
  poachedItemName?: string,
  locale: 'en' | 'fr' | 'es' = 'fr',
): RivalFence[] {
  const snippets =
    locale === 'en'
      ? [
          'snatched a batch of seized luxury watches before the night patrol.',
          'driving up auction bids on the docks.',
          'laundering profits through a ghost art gallery.',
          'narrowly escaped a police raid thanks to an undercover leak.',
        ]
      : locale === 'es'
        ? [
            'se llevó un lote de relojes incautados antes de la ronda nocturna.',
            'subiendo las apuestas en las subastas de los muelles.',
            'blanquea ganancias a través de una galería fantasma.',
            'escapó de una redada por los pelos gracias a un informante.',
          ]
        : [
            'a raflé un lot de montres saisies avant la ronde de nuit.',
            'fait monter les enchères sur les docks.',
            'blanchit ses gains via une galerie fantôme.',
            'a évité une descente de justesse grâce à un indic.',
          ];

  return rivals.map((r, idx) => {
    const gain = 700 + ((day * 313 + idx * 547) % 1600);
    const usePoached = poachedItemName && idx === day % rivals.length;
    let headline = snippets[(day + idx) % snippets.length];
    if (usePoached) {
      headline =
        locale === 'en'
          ? `Picked up "${poachedItemName}" that you passed on at the counter.`
          : locale === 'es'
            ? `Recogió "${poachedItemName}" que rechazaste en el mostrador.`
            : `A récupéré "${poachedItemName}" que tu as refusé au comptoir.`;
    }
    return {
      ...r,
      netWorth: r.netWorth + gain,
      lastHeadline: headline,
    };
  });
}
