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

const EVENT_I18N: Record<string, { en: [string, string]; es: [string, string] }> = {
  'Rafle au port': { en: ['Port crackdown', 'Street resale ×1.35, but +10% Heat per deal.'], es: ['Redada en el puerto', 'Reventa en calle ×1,35, pero +10 % de Heat por trato.'] },
  'Panne secteur': { en: ['Power cut', 'UV lamp is off tonight, but client Fear +15.'], es: ['Apagón en el sector', 'Lámpara UV apagada esta noche, pero Miedo del cliente +15.'] },
  'Gala privé': { en: ['Private gala', 'Street resale ×1.25, but clients are 12% more suspicious.'], es: ['Gala privada', 'Reventa en calle ×1,25, pero clientes un 12 % más desconfiados.'] },
  'Trêve du Syndicat': { en: ['Syndicate truce', 'Tonight’s tax cut by 20%.'], es: ['Tregua del Sindicato', 'Impuesto de esta noche reducido un 20 %.'] },
  'Couvre-feu': { en: ['Curfew', '+$400 bonus if you end the night under 35% Heat.'], es: ['Toque de queda', '+400 $ de prima si terminas la noche por debajo del 35 % de Heat.'] },
  'Contrôle des docks': { en: ['Dock inspection', 'Tonight’s tax +15%, but street resale ×1.20.'], es: ['Control en los muelles', 'Impuesto de esta noche +15 %, pero reventa en calle ×1,20.'] },
  'Foire clandestine': { en: ['Underground fair', 'Street resale ×1.40, but +12% Heat per deal.'], es: ['Feria clandestina', 'Reventa en calle ×1,40, pero +12 % de Heat por trato.'] },
  'Quartier sous tension': { en: ['District on edge', 'Clients arrive with +10% Fear and +10% Suspicion.'], es: ['Barrio en tensión', 'Los clientes entran con +10 % de Miedo y +10 % de Desconfianza.'] },
  'Programme de protection': { en: ['Witness protection', 'A witness lurks: clients +15% Suspicion.'], es: ['Programa de protección', 'Un testigo ronda: clientes +15 % de Desconfianza.'] },
  'Embargo sur les armes': { en: ['Arms embargo', 'Weapons resell ×1.5 (shortage). +8 Heat per deal.'], es: ['Embargo de armas', 'Las armas se revenden ×1,5 (escasez). +8 de Heat por trato.'] },
  'Nuit des indics': { en: ['Informants’ night', 'Sting risk doubled. +$200 bonus if you expose one.'], es: ['Noche de los chivatos', 'Riesgo de trampa duplicado. +200 $ de prima si desenmascaras a uno.'] },
  'Fièvre des enchères': { en: ['Auction fever', 'Auctions ×1.3 but rent +25%.'], es: ['Fiebre de subastas', 'Subastas ×1,3 pero alquiler +25 %.'] },
};

/** Titre et effet d'un événement de nuit dans la langue du joueur. */
export function localizeNightEvent(e: { title: string; effectText: string }, locale: 'fr' | 'en' | 'es'): { title: string; effectText: string } {
  const t = locale === 'fr' ? undefined : EVENT_I18N[e.title]?.[locale];
  return t ? { title: t[0], effectText: t[1] } : { title: e.title, effectText: e.effectText };
}
