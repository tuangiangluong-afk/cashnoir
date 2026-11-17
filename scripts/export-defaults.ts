import fs from 'node:fs';
import path from 'node:path';
import { PROCEDURAL_ITEMS_CATALOG } from '../src/data/itemsCatalog';
import { CAST_ROSTER } from '../src/data/cast';
import { PSYCHO_PROFILES } from '../src/data/psychology';
import { SEASON_REWARDS } from '../src/data/seasons';
import { MORE_EPISODES } from '../src/data/seasonsMore';
import { SYNDICATE_FACTIONS } from '../src/data/factions';

const outDir = path.resolve('server/data/ecosystem');
fs.mkdirSync(outDir, { recursive: true });

const archetypes = PSYCHO_PROFILES.map((p) => ({
  id: p.id,
  label: p.label,
  femaleLabel: p.femaleLabel || p.label,
  trait: p.trait,
  femaleTrait: p.femaleTrait || p.trait,
  weaknessHint: p.weaknessHint,
  femaleWeaknessHint: p.femaleWeaknessHint || p.weaknessHint,
  redLineHint: p.redLineHint,
  femaleRedLineHint: p.femaleRedLineHint || p.redLineHint,
  baseGauges: p.baseGauges,
  fearBonus: p.fearBonus,
  angerPenalty: p.angerPenalty,
  openings: p.openings,
  tells: p.tells,
  weakKeywords: p.weakRegex.source,
  angerKeywords: p.angerRegex.source,
}));

const items = PROCEDURAL_ITEMS_CATALOG.map((it, idx) => {
  let cat = it.category;
  if (/rolex|patek|montre|horlog|audemars|chronographe|vacheron|breguet|speedmaster/i.test(it.name)) {
    cat = 'Horlogerie';
  } else if (/lingot|platine|palladium|or de raffinerie|argent pur|barre d/i.test(it.name)) {
    cat = 'Métaux';
  }
  return {
    id: `item_${idx + 1}`,
    name: it.name,
    category: cat,
    surfaceDesc: it.surfaceDesc,
    clues: it.clues,
    uvClues: it.uvClues,
    clueTag: it.clueTag,
    baseValue: it.baseValue,
    hotLevel: it.hotLevel,
    isCustom: false,
  };
});

// Ajout d'items dédiés Horlogerie & Métaux pour enrichir l'écosystème
const extraHorlogerie = [
  {
    name: 'Patek Philippe Nautilus 5711/1R Or Rose',
    baseValue: 14500,
    hotLevel: 3,
    surfaceDesc: 'Cadran brun chocolat rayé horizontalement, lunette octogonale aux angles adoucis.',
    clues: ['Mouvement 324 SC avec sceau Patek Philippe poinçonné sur le pont.', 'Numéro de série gravé au dos de la corne gauche.'],
    uvClues: ['Sous UV : micro-marquage d’assurance suisse révélé sur l’intérieur du fermoir.']
  },
  {
    name: 'Audemars Piguet Royal Oak Chronographe Céramique Noire',
    baseValue: 16200,
    hotLevel: 4,
    surfaceDesc: 'Boîtier céramique inrayable satiné, cadran motif Grande Tapisserie noir mat.',
    clues: ['Vis octogonales en or blanc parfaitement alignées sur la lunette.', 'Poussoirs de chronographe à double joint sans jeu mécanique.'],
    uvClues: ['Sous UV : tampon anti-contrefaçon de la manufacture du Brassus visible sur le verre saphir.']
  },
  {
    name: 'Rolex Daytona Cosmograph Platine Lunette Cerachrom',
    baseValue: 19800,
    hotLevel: 4,
    surfaceDesc: 'Cadran bleu glacier exclusif, lunette châtaigne en céramique monobloc, poids massif du platine.',
    clues: ['Gravure laser Rolex au réhaut à 6h parfaitement centrée sur la couronne.', 'Poids exact de 283 grammes conforme au platine 950.'],
    uvClues: ['Sous UV : numéro de série matricé sur la tranche invisible en lumière du jour.']
  },
  {
    name: 'Richard Mille RM 11-03 Automatique Flyback Carbone TPT',
    baseValue: 28000,
    hotLevel: 5,
    surfaceDesc: 'Forme tonneau en carbone multicouche zébré, cadran squelette complexe aux rouages dorés.',
    clues: ['Rotor à géométrie variable en titane grade 5 avec ailettes en or blanc.', 'Affichage surdimensionné de la date semi-instantanée.'],
    uvClues: ['Sous UV : résine phosphorescente spécifique au carbone TPT officiel des ateliers des Breuleux.']
  },
  {
    name: 'Vacheron Constantin Overseas Tourbillon Squelette Titane',
    baseValue: 22500,
    hotLevel: 4,
    surfaceDesc: 'Boîtier titane grade 5 ultra-léger, cage de tourbillon ajourée en forme de croix de Malte.',
    clues: ['Poinçon de Genève visible sur la platine rhodiée à travers le fond saphir.', 'Système d’interchangeabilité rapide du bracelet fonctionnel.'],
    uvClues: ['Sous UV : micro-gravure de traçabilité douanière monégasque sous la boucle déployante.']
  },
  {
    name: 'Omega Speedmaster Professional Calibre 321 Canopus Gold',
    baseValue: 11800,
    hotLevel: 2,
    surfaceDesc: 'Or blanc Canopus exclusif, cadran noir onyx étagé avec index vintage.',
    clues: ['Célèbre calibre 321 à roue à colonnes reconstitué à l’identique de la montre lunaire.', 'Point au-dessus de 90 (Dot Over Ninety) sur la lunette tachymétrique en émail.'],
    uvClues: ['Sous UV : insigne NASA gravé sous le boîtier lors d’une mission commémorative.']
  }
];

const extraMetaux = [
  {
    name: 'Barre de Platine Suisse Valcambi 500g',
    baseValue: 13200,
    hotLevel: 3,
    surfaceDesc: 'Lingot de platine pur 999.5‰ de forme rectangulaire avec certificat fondu.',
    clues: ['Poinçon de l’essayeur jurassien CHI en ovale régulier.', 'Bords nets coupés à froid sans bulle de coulée.'],
    uvClues: ['Sous UV : numéro de série fluorescent invisible gravé par la raffinerie de Balerna.']
  },
  {
    name: 'Lingot de Palladium Pur 250g sous blister scellé',
    baseValue: 9800,
    hotLevel: 3,
    surfaceDesc: 'Métal blanc argenté dense, ensaché sous plastique thermo-soudé sécurisé.',
    clues: ['Mention Palladium 999.5 frappée à la presse hydraulique 1000 tonnes.', 'Hologramme Kinebar intact sur le revers.'],
    uvClues: ['Sous UV : micro-texte de sécurité Banque Populaire de Zurich sur le contour du blister.']
  },
  {
    name: 'Plaquette de Rhodium Industriel 100g',
    baseValue: 11500,
    hotLevel: 4,
    surfaceDesc: 'Plaque ultra-dense de rhodium pur provenant d’un complexe pétrochimique d’Odessa.',
    clues: ['Absence totale de corrosion ou d’oxydation même sous acide sulfurique.', 'Densité de 12.41 g/cm³ confirmée à la balance hydrostatique.'],
    uvClues: ['Sous UV : traceur chimique rougeoyant utilisé pour marquer les métaux stratégiques militaires.']
  },
  {
    name: 'Lot de 20 pièces Krugerrand Or 1oz millésime 1984',
    baseValue: 8900,
    hotLevel: 2,
    surfaceDesc: 'Pièces d’or au reflet cuivré caractéristique (alliage or-cuivre 22 carats), profil de Paul Kruger.',
    clues: ['Sonorité cristalline aiguë unique lors du tintement sur le zinc.', 'Poids individuel strict de 33.93 grammes au centième de gramme.'],
    uvClues: ['Sous UV : aucune trace de réargenture, usure patinée homogène des tranches cannelées.']
  },
  {
    name: 'Lingot d’Or Pur 1kg poinçon Banque Centrale Suisse limé',
    baseValue: 24500,
    hotLevel: 5,
    surfaceDesc: 'Barre trapézoïdale d’or fin 999.9‰ pesant exactement 1 000 grammes, face supérieure rabotée à la fraiseuse.',
    clues: ['Traces de fraiseuse visibles pour effacer l’aigle ou le matricule de la réserve fédérale.', 'Test à la pierre de touche : trace dorée intacte sous acide 24K.'],
    uvClues: ['Sous UV : reste du matricule bancaire CH-8022 encore lisible par fluorescence résiduelle.']
  },
  {
    name: 'Cylindre de Titane Grade 5 aéronautique de contrebande',
    baseValue: 7600,
    hotLevel: 3,
    surfaceDesc: 'Pièce usinée cylindrique en alliage Ti-6Al-4V provenant d’un bureau d’études militaire.',
    clues: ['Rapport résistance/poids extrême, insensible à l’aimant.', 'Tolérance d’usinage micrométrique mesurée au pied à coulisse.'],
    uvClues: ['Sous UV : tampon d’homologation Sukhoi secret défense visible sur la face d’appui.']
  }
];

let nextId = items.length + 1;
for (const h of extraHorlogerie) {
  items.push({
    id: `item_${nextId++}`,
    name: h.name,
    category: 'Horlogerie',
    surfaceDesc: h.surfaceDesc,
    clues: h.clues,
    uvClues: h.uvClues,
    clueTag: 'Luxe / Horlogerie',
    baseValue: h.baseValue,
    hotLevel: h.hotLevel,
    isCustom: false,
  });
}

for (const m of extraMetaux) {
  items.push({
    id: `item_${nextId++}`,
    name: m.name,
    category: 'Métaux',
    surfaceDesc: m.surfaceDesc,
    clues: m.clues,
    uvClues: m.uvClues,
    clueTag: 'Métaux Précieux',
    baseValue: m.baseValue,
    hotLevel: m.hotLevel,
    isCustom: false,
  });
}

const characters = CAST_ROSTER.map((c) => ({
  id: c.id,
  firstName: c.firstName,
  fullName: c.fullName,
  gender: c.gender,
  age: c.age,
  job: c.job,
  faction: c.faction,
  profileId: c.profileId,
  secret: c.secret,
  weaknessHint: c.weaknessHint,
  redLineHint: c.redLineHint,
  weakKeywords: c.weakKeywords,
  angerKeywords: c.angerKeywords,
  openingTemplate: c.openingTemplate,
  tell: c.tell,
  portraitVisual: c.portraitVisual,
  portraitUrl: `/assets/portraits/cast/${c.id}.webp`,
  isCustom: false,
}));

const categories = ['Données', 'Joaillerie', 'Horlogerie', 'Art', 'Reliques', 'Armement', 'Métaux'];

const seasons = [
  {
    seasonNumber: 1,
    name: 'Nuits de Sang sur les Docks',
    theme: 'Bratva & Convois Maritimes',
    daysLeft: 24,
    episodes: MORE_EPISODES.filter((e) => e.seasonNumber === 1 || !e.seasonNumber).slice(0, 4),
    rewards: SEASON_REWARDS,
  },
  {
    seasonNumber: 2,
    name: 'La Chute de l’Oligarque',
    theme: 'Finance Noire & Banques Suisses',
    daysLeft: 30,
    episodes: MORE_EPISODES.filter((e) => e.seasonNumber === 2),
    rewards: SEASON_REWARDS,
  },
];

const ecosystem = {
  version: '1.0.0',
  exportedAt: new Date().toISOString(),
  categories,
  factions: SYNDICATE_FACTIONS,
  archetypes,
  items,
  characters,
  seasons,
};

fs.writeFileSync(path.join(outDir, 'defaults.json'), JSON.stringify(ecosystem, null, 2), 'utf8');
console.log(`✓ Defaults exported: ${items.length} items, ${characters.length} characters, ${archetypes.length} archetypes.`);
