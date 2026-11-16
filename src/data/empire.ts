export interface District {
  id: 'docks' | 'finance' | 'politics';
  name: string;
  unlockSwiss: number;
  multiplier: number;
  desc: string;
}

export interface CityAsset {
  id: 'lookout' | 'nightbar' | 'warehouse';
  name: string;
  costSwiss: number;
  tag: string;
  desc: string;
}

export const DISTRICTS: District[] = [
  {
    id: 'docks',
    name: 'Ruelle des Docks',
    unlockSwiss: 0,
    multiplier: 1,
    desc: 'Quartier de départ · Pièces de 3k à 8k $.',
  },
  {
    id: 'finance',
    name: 'Centre Financier',
    unlockSwiss: 12000,
    multiplier: 2.5,
    desc: 'Cols blancs & secrets industriels · Enjeux ×2,5.',
  },
  {
    id: 'politics',
    name: 'Cercle Politique',
    unlockSwiss: 35000,
    multiplier: 6,
    desc: 'Dossiers d’État & chantage haut niveau · Enjeux ×6.',
  },
];

export const CITY_ASSETS: CityAsset[] = [
  {
    id: 'lookout',
    name: 'Guetteur de Rue',
    costSwiss: 2500,
    tag: 'ANTI-PIÈGE',
    desc: 'Te prévient dès qu’un client entrant est un infiltré ou un piège.',
  },
  {
    id: 'nightbar',
    name: 'Bar de Nuit',
    costSwiss: 6000,
    tag: '+600 $/NUIT',
    desc: 'Blanchit +600 $ passifs chaque nuit et réduit le Heat de 5 %.',
  },
  {
    id: 'warehouse',
    name: 'Entrepôt des Docks',
    costSwiss: 14000,
    tag: '+35% ENCHÈRES',
    desc: 'Ouvre les Enchères Internationales (+35 % sur toutes tes reventes aux enchères).',
  },
];
