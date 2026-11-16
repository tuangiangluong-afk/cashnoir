export interface SyndicateJoker {
  id: string;
  name: string;
  tag: string;
  desc: string;
}

export const JOKER_POOL: SyndicateJoker[] = [
  {
    id: 'blanchisseur',
    name: 'Blanchisseur Suisse',
    tag: 'x1.4 ENCHÈRES',
    desc: 'Les pièces nettoyées se revendent x1.4 aux Enchères Noires.',
  },
  {
    id: 'oeil-lynx',
    name: 'Œil de Lynx',
    tag: 'COMBO x1.5',
    desc: 'Tout achat sous 30 % de la valeur rue ajoute +25 % de marge à la revente.',
  },
  {
    id: 'sang-froid',
    name: 'Sang-Froid',
    tag: '+15% PAR INDICE',
    desc: 'Passer la loupe ou la lampe UV ajoute +15 % de prime à la revente de la pièce.',
  },
  {
    id: 'intimidation',
    name: 'Aura de Parrain',
    tag: '+15 PEUR DÉPART',
    desc: 'Les clients entrent déjà intimidés (+15 Peur initiale).',
  },
  {
    id: 'assurance',
    name: 'Flics dans la Poche',
    tag: '-10% HEAT / NUIT',
    desc: 'Le Heat de la ville redescend automatiquement de 10 % chaque nuit.',
  },
  {
    id: 'vautour',
    name: 'Vautour de Nuit',
    tag: '+150 $ SUR FUITE',
    desc: 'Si un client claque la porte, tu revends sa localisation (+150 $).',
  },
  {
    id: 'a-l-aveugle',
    name: 'À l’Aveugle',
    tag: 'REVENTES ×1,6',
    desc: 'Loupe et lampe UV hors service pour toute la partie. Toutes tes reventes font ×1,6.',
  },
  {
    id: 'vitrine-armee',
    name: 'Vitrine Armée',
    tag: '+15 PEUR / ARME',
    desc: 'Chaque arme au coffre ajoute +15 de Peur au client dès son entrée.',
  },
  {
    id: 'blanchisseur-express',
    name: 'Blanchisseur Express',
    tag: 'NETTOYAGE 0 $ · LOYER +10 %',
    desc: 'Nettoyer une pièce ne coûte plus rien, mais le Syndicat augmente ton loyer de 10 %.',
  },
  {
    id: 'radar',
    name: 'Radar à Pièges',
    tag: 'DÉTECTION PIÈGE',
    desc: 'Les pièges subtils sont détectés par la Loupe (pas besoin d\'UV).',
  },
  {
    id: 'negociateur',
    name: 'Négociateur Né',
    tag: '-10 % PRIX INITIAL',
    desc: 'Les clients commencent systématiquement 10 % moins cher.',
  },
  {
    id: 'reseau',
    name: 'Réseau de Clôtures',
    tag: '+1 ENCHÈRE/NUIT',
    desc: 'Tu peux faire une enchère de plus par nuit sans pénalité de saturation.',
  },
  {
    id: 'fantome',
    name: 'Fantôme du Quartier',
    tag: '-5 HEAT/DEAL',
    desc: 'Chaque deal conclu génère 5 % de Heat en moins.',
  },
  {
    id: 'collectionneur',
    name: 'Œil du Collectionneur',
    tag: 'DÉTECTE CONTREFAÇON',
    desc: 'Les contrefaçons sont marquées dès l\'ouverture (avant Loupe/UV).',
  },
  {
    id: 'double-fond',
    name: 'Double Fond',
    tag: '2 PIÈCES PROTÉGÉES',
    desc: 'En cas de saisie policière, 2 pièces du coffre sont planquées dans le double fond.',
  },
];

export function drawRandomJokers(ownedIds: string[], count = 3): SyndicateJoker[] {
  const available = JOKER_POOL.filter((j) => !ownedIds.includes(j.id));
  const pool = available.length >= count ? available : JOKER_POOL;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}
