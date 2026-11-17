// Synergies d'atouts : deux atouts précis ensemble déclenchent un bonus que ni l'un ni l'autre n'offre seul.
type Loc = 'fr' | 'en' | 'es';

export interface JokerCombo {
  id: string;
  a: string;
  b: string;
  name: Record<Loc, string>;
  desc: Record<Loc, string>;
}

export const COMBOS: JokerCombo[] = [
  { id: 'parrain', a: 'negociateur', b: 'intimidation', name: { fr: 'Parrain de la rue', en: 'Godfather of the street', es: 'Padrino de la calle' }, desc: { fr: 'Les clients ouvrent encore 5 % moins cher.', en: 'Clients open another 5% cheaper.', es: 'Los clientes abren un 5 % más barato.' } },
  { id: 'rapace', a: 'vautour', b: 'fantome', name: { fr: 'Rapace discret', en: 'Quiet raptor', es: 'Rapaz discreto' }, desc: { fr: 'Un client qui claque la porte te rapporte 400 $ au lieu de 150 $.', en: 'A client who walks out pays you $400 instead of $150.', es: 'Un cliente que se va te da 400 $ en vez de 150 $.' } },
  { id: 'poche', a: 'assurance', b: 'reseau', name: { fr: 'Réseau d’influence', en: 'Influence network', es: 'Red de influencia' }, desc: { fr: 'Le Heat redescend de 10 % de plus chaque nuit.', en: 'Heat drops a further 10% every night.', es: 'El Heat baja otro 10 % cada noche.' } },
  { id: 'laverie', a: 'blanchisseur', b: 'blanchisseur-express', name: { fr: 'Laverie industrielle', en: 'Industrial laundry', es: 'Lavandería industrial' }, desc: { fr: 'Plus aucun surloyer : le Syndicat ferme les yeux.', en: 'No more rent surcharge: the Syndicate looks away.', es: 'Sin recargo de alquiler: el Sindicato mira a otro lado.' } },
  { id: 'cache', a: 'double-fond', b: 'collectionneur', name: { fr: 'Cache d’expert', en: 'Expert stash', es: 'Escondite de experto' }, desc: { fr: 'En cas de descente, 3 pièces sont sauvées au lieu de 2.', en: 'In a raid, 3 pieces are saved instead of 2.', es: 'En una redada se salvan 3 piezas en vez de 2.' } },
];

export const hasCombo = (owned: string[], a: string, b: string): boolean => owned.includes(a) && owned.includes(b);
export const activeCombos = (owned: string[]): JokerCombo[] => COMBOS.filter((c) => hasCombo(owned, c.a, c.b));
/** Combo qu'on complèterait en prenant `pick` (pour mettre l'atout en avant au tirage). */
export const comboCompletedBy = (pick: string, owned: string[]): JokerCombo | undefined =>
  COMBOS.find((c) => (c.a === pick && owned.includes(c.b)) || (c.b === pick && owned.includes(c.a)));
