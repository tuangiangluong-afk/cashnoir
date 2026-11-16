/**
 * Contrat 24h déterministe, calculé côté serveur.
 *
 * Le client ne décide plus ni du prix demandé ni de la marge : il reçoit ce
 * contrat et le serveur valide le prix final contre ces bornes.
 *
 * La dérivation du PRNG est identique à `src/data/generator.ts`
 * (mulberry32 + hashString sur `THE-FENCE-DAILY-<date>`), donc le même objet
 * et les mêmes prix sortent des deux côtés.
 */

const FIRST_NAMES = [
  'Kévin', 'Sonia', 'Marek', 'Driss', 'Inès', 'Vance', 'Léon', 'Nora',
  'Tarik', 'Olga', 'Milo', 'Chloé', 'Rico', 'Zara', 'Yanis', 'Benoît',
];

const FACTIONS = ['Mairie & Promoteurs', 'Docks du Nord', 'Clinique Privée Saint-Luc', 'Brigade Financière', 'Cercle des Jeux'];

const ARCHETYPES = ['paris', 'cadre', 'flic', 'fils à papa', 'courtier'];

// Même ordre et mêmes valeurs de base que ITEMS_POOL côté client.
// ATTENTION : toute modification du pool client doit être répercutée ici,
// sinon les prix affichés divergent du contrat officiel et la publication échoue.
const ITEMS = [
  { name: 'Téléphone chiffré de Député', category: 'Données', baseValue: 6800 },
  { name: 'Liasse de 20 000 € en coupures neuves', category: 'Joaillerie', baseValue: 6200 },
  { name: 'Rolex Daytona en Or Rose', category: 'Horlogerie', baseValue: 5200 },
  { name: 'Mallette réfrigérée scellée', category: 'Métaux', baseValue: 8400 },
  { name: 'Revolver .357 de Collection', category: 'Armement', baseValue: 3800 },
  { name: 'Toile roulée sans châssis', category: 'Art', baseValue: 7900 },
];

const DAILY_HEAT = 45;

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function buildDailyContract(dateStr) {
  const rand = mulberry32(hashString(`THE-FENCE-DAILY-${dateStr}`));

  // Même ordre de tirages que buildCase() côté client.
  const name = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
  const age = 22 + Math.floor(rand() * 34);
  const faction = FACTIONS[Math.floor(rand() * FACTIONS.length)];
  const archetype = ARCHETYPES[Math.floor(rand() * ARCHETYPES.length)];
  const item = ITEMS[Math.floor(rand() * ITEMS.length)];
  rand(); // indice caché

  const multiplier = 1; // le contrat est toujours joué au Jour 1
  const streetValue = Math.round((item.baseValue * multiplier) / 50) * 50;
  const initialPrice = Math.round((streetValue * (0.65 + rand() * 0.25)) / 50) * 50;
  const floorPrice = Math.round((streetValue * (0.14 + rand() * 0.1)) / 50) * 50;

  return {
    date: dateStr,
    name,
    age,
    faction,
    archetype,
    itemName: item.name,
    itemCategory: item.category,
    cityHeat: DAILY_HEAT,
    streetValue,
    initialPrice,
    floorPrice,
    // Marge maximale admissible : plancher absolu du PNJ.
    maxMargin: streetValue - floorPrice,
  };
}
