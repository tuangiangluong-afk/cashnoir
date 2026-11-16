export interface NightEvent {
  id:
    | 'blackout'
    | 'port_raid'
    | 'vip_gala'
    | 'syndicate_truce'
    | 'curfew'
    | 'customs_check'
    | 'black_market'
    | 'nervous_street'
    | 'witness_protection'
    | 'arms_embargo'
    | 'informant_night'
    | 'auction_fever';
  title: string;
  effectText: string;
  streetMultiplier: number;
  extraHeatPerDeal: number;
  rentMultiplier: number;
  disableUv: boolean;
  bonusFear: number;
  bonusSuspicion: number;
  curfewBonusCash: number;
}

export const NIGHT_EVENTS: NightEvent[] = [
  {
    id: 'port_raid',
    title: 'Rafle au port',
    effectText: 'Revente rue ×1,35, mais +10 % Heat par deal.',
    streetMultiplier: 1.35,
    extraHeatPerDeal: 10,
    rentMultiplier: 1,
    disableUv: false,
    bonusFear: 0,
    bonusSuspicion: 0,
    curfewBonusCash: 0,
  },
  {
    id: 'blackout',
    title: 'Panne secteur',
    effectText: 'Lampe UV coupée ce soir, mais Peur client +15.',
    streetMultiplier: 1,
    extraHeatPerDeal: 0,
    rentMultiplier: 1,
    disableUv: true,
    bonusFear: 15,
    bonusSuspicion: 0,
    curfewBonusCash: 0,
  },
  {
    id: 'vip_gala',
    title: 'Gala privé',
    effectText: 'Revente rue ×1,25, mais clients +12 % méfiants.',
    streetMultiplier: 1.25,
    extraHeatPerDeal: 0,
    rentMultiplier: 1,
    disableUv: false,
    bonusFear: 0,
    bonusSuspicion: 12,
    curfewBonusCash: 0,
  },
  {
    id: 'syndicate_truce',
    title: 'Trêve du Syndicat',
    effectText: 'Taxe du soir réduite de -20 %.',
    streetMultiplier: 1,
    extraHeatPerDeal: 0,
    rentMultiplier: 0.8,
    disableUv: false,
    bonusFear: 0,
    bonusSuspicion: 0,
    curfewBonusCash: 0,
  },
  {
    id: 'curfew',
    title: 'Couvre-feu',
    effectText: '+400 $ de prime si tu finis la nuit sous 35 % Heat.',
    streetMultiplier: 1,
    extraHeatPerDeal: 0,
    rentMultiplier: 1,
    disableUv: false,
    bonusFear: 0,
    bonusSuspicion: 0,
    curfewBonusCash: 400,
  },
  {
    id: 'customs_check',
    title: 'Contrôle des docks',
    effectText: 'Taxe du soir +15 %, mais revente rue ×1,20.',
    streetMultiplier: 1.2,
    extraHeatPerDeal: 0,
    rentMultiplier: 1.15,
    disableUv: false,
    bonusFear: 0,
    bonusSuspicion: 0,
    curfewBonusCash: 0,
  },
  {
    id: 'black_market',
    title: 'Foire clandestine',
    effectText: 'Revente rue ×1,40, mais +12 % Heat par deal.',
    streetMultiplier: 1.4,
    extraHeatPerDeal: 12,
    rentMultiplier: 1,
    disableUv: false,
    bonusFear: 0,
    bonusSuspicion: 8,
    curfewBonusCash: 0,
  },
  {
    id: 'nervous_street',
    title: 'Quartier sous tension',
    effectText: 'Clients +10 % Peur et +10 % Méfiance dès l’entrée.',
    streetMultiplier: 1,
    extraHeatPerDeal: 0,
    rentMultiplier: 1,
    disableUv: false,
    bonusFear: 10,
    bonusSuspicion: 10,
    curfewBonusCash: 0,
  },
  {
    id: 'witness_protection',
    title: 'Programme de protection',
    effectText: 'Un témoin rôde : clients +15 % Méfiance.',
    streetMultiplier: 1,
    extraHeatPerDeal: 0,
    rentMultiplier: 1,
    disableUv: false,
    bonusFear: 0,
    bonusSuspicion: 15,
    curfewBonusCash: 0,
  },
  {
    id: 'arms_embargo',
    title: 'Embargo sur les armes',
    effectText: 'Les armes se revendent ×1,5 (pénurie). +8 Heat/deal.',
    streetMultiplier: 1.5,
    extraHeatPerDeal: 8,
    rentMultiplier: 1,
    disableUv: false,
    bonusFear: 0,
    bonusSuspicion: 0,
    curfewBonusCash: 0,
  },
  {
    id: 'informant_night',
    title: 'Nuit des indics',
    effectText: 'Risque de piège doublé. Prime +200 $ si démasqué.',
    streetMultiplier: 1,
    extraHeatPerDeal: 0,
    rentMultiplier: 1,
    disableUv: false,
    bonusFear: 5,
    bonusSuspicion: 0,
    curfewBonusCash: 0,
  },
  {
    id: 'auction_fever',
    title: 'Fièvre des enchères',
    effectText: 'Enchères ×1,3 mais Loyer +25 %.',
    streetMultiplier: 1.3,
    extraHeatPerDeal: 0,
    rentMultiplier: 1.25,
    disableUv: false,
    bonusFear: 0,
    bonusSuspicion: 0,
    curfewBonusCash: 0,
  },
];

export function getNightEvent(day: number): NightEvent | null {
  if (day < 2) return null;
  return NIGHT_EVENTS[(day - 2) % NIGHT_EVENTS.length];
}
