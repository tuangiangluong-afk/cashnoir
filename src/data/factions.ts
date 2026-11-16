/**
 * SYSTÈME DE FACTIONS & RÉPUTATION PERMANENTE (5 Syndicats)
 * Chaque deal, refus ou dénonciation modifie l'équilibre géopolitique de la ville.
 */

export interface FactionDef {
  id: string;
  name: string;
  shortName: string;
  leader: string;
  specialty: string;
  rivalId: string;
}

export const SYNDICATE_FACTIONS: FactionDef[] = [
  {
    id: 'bratva',
    name: 'La Bratva des Docks',
    shortName: 'Docks du Nord',
    leader: 'Ivan Voronov',
    specialty: 'Armement lourd & fret maritime',
    rivalId: 'cartel',
  },
  {
    id: 'cartel',
    name: 'Le Cartel de la Baie',
    shortName: 'Cercle des Jeux',
    leader: 'Hector Mendez',
    specialty: 'Blanchiment cash & cyber-matos',
    rivalId: 'bratva',
  },
  {
    id: 'yakuza',
    name: 'Yakuza du Dragon Noir',
    shortName: 'Clinique Privée Saint-Luc',
    leader: 'Kenji Takahashi',
    specialty: 'Reliques rares & discipline stricte',
    rivalId: 'milieu',
  },
  {
    id: 'milieu',
    name: 'Le Milieu de Pigalle',
    shortName: 'Mairie & Promoteurs',
    leader: 'Marcel « L’Élégant »',
    specialty: 'Haute joaillerie & toiles spoliées',
    rivalId: 'yakuza',
  },
  {
    id: 'suisses',
    name: 'Ordre des Banquiers Suisses',
    shortName: 'Brigade Financière',
    leader: 'Dr. Von Berg',
    specialty: 'Secrets d’État & titres au porteur',
    rivalId: 'cartel',
  },
];

export type FactionRepMap = Record<string, number>;

export const INITIAL_FACTION_REP: FactionRepMap = {
  bratva: 0,
  cartel: 0,
  yakuza: 0,
  milieu: 0,
  suisses: 0,
};

export function resolveFactionId(caseFactionName: string): string {
  const f = caseFactionName.toLowerCase();
  if (f.includes('dock') || f.includes('bratva')) return 'bratva';
  if (f.includes('jeu') || f.includes('cartel')) return 'cartel';
  if (f.includes('clinique') || f.includes('yakuza')) return 'yakuza';
  if (f.includes('mairie') || f.includes('pigalle') || f.includes('milieu')) return 'milieu';
  if (f.includes('brigade') || f.includes('suisse') || f.includes('banq')) return 'suisses';
  return 'bratva';
}

export function getFactionRank(rep: number): {
  label: string;
  colorCls: string;
  priceMult: number;
  mefianceDelta: number;
  auctionBonus: number;
} {
  if (rep <= -60) {
    return {
      label: 'Contrat sur ta tête',
      colorCls: 'text-red-400',
      priceMult: 1.2,
      mefianceDelta: 22,
      auctionBonus: 0,
    };
  }
  if (rep <= -20) {
    return {
      label: 'Hostile',
      colorCls: 'text-orange-400',
      priceMult: 1.1,
      mefianceDelta: 12,
      auctionBonus: 0,
    };
  }
  if (rep >= 60) {
    return {
      label: 'Allié d’Honneur',
      colorCls: 'text-amber-300',
      priceMult: 0.88,
      mefianceDelta: -12,
      auctionBonus: 0.15,
    };
  }
  if (rep >= 20) {
    return {
      label: 'Affilié',
      colorCls: 'text-emerald-400',
      priceMult: 0.94,
      mefianceDelta: -6,
      auctionBonus: 0.08,
    };
  }
  return {
    label: 'Neutre',
    colorCls: 'text-zinc-400',
    priceMult: 1,
    mefianceDelta: 0,
    auctionBonus: 0,
  };
}

export function applyFactionDealDelta(
  prev: FactionRepMap,
  caseFactionName: string,
  delta: number,
): FactionRepMap {
  const id = resolveFactionId(caseFactionName);
  const def = SYNDICATE_FACTIONS.find((f) => f.id === id);
  const clamp = (n: number) => Math.max(-100, Math.min(100, n));
  const next: FactionRepMap = {
    ...prev,
    [id]: clamp((prev[id] ?? 0) + delta),
  };
  // Helping a faction slightly annoys its rival
  if (def && delta > 0) {
    const rivalDelta = -Math.max(2, Math.floor(delta * 0.4));
    next[def.rivalId] = clamp((prev[def.rivalId] ?? 0) + rivalDelta);
  }
  return next;
}
