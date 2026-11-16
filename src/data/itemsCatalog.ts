/**
 * CATALOGUE D'OBJETS PROCÉDURAL — 240+ PIÈCES UNIQUES
 * 30 familles d'objets × 8 variantes de provenance/état = 240+ pièces distinctes
 * avec indice Loupe, indice UV et tag visuel dédié.
 */

export interface CatalogItemTemplate {
  name: string;
  category: string;
  surfaceDesc: string;
  clues: string[];
  uvClues: string[];
  clueTag: string;
  baseValue: number;
  hotLevel: 'BRÛLANT' | 'TIÈDE';
}

interface ItemFamily {
  baseName: string;
  category: string;
  baseValue: number;
  hotLevel: 'BRÛLANT' | 'TIÈDE';
  surface: string;
  clue: string;
  uv: string;
}

const FAMILIES: ItemFamily[] = [
  {
    baseName: 'Clé USB chiffrée',
    category: 'Données',
    baseValue: 3200,
    hotLevel: 'BRÛLANT',
    surface: 'Boîtier titane étanche sans marque apparente.',
    clue: 'Porte des micro-rayures d’un lecteur sécurisé gouvernemental.',
    uv: 'Sous UV : numéro d’inventaire du Parquet gratté à l’acétone.',
  },
  {
    baseName: 'Hardware Wallet 2011',
    category: 'Données',
    baseValue: 7800,
    hotLevel: 'BRÛLANT',
    surface: 'Clé crypto première génération avec écran OLED terne.',
    clue: 'Étiquette manuscrite au dos portant 4 mots d’une seed phrase.',
    uv: 'Sous UV : empreinte digitale nette sur le bouton de validation.',
  },
  {
    baseName: 'Diamant brut non taillé',
    category: 'Joaillerie',
    baseValue: 6400,
    hotLevel: 'BRÛLANT',
    surface: 'Pierre octaédrique translucide aux reflets bleutés.',
    clue: 'Aucune gravure laser GIA — provenance directe hors circuit Kimberley.',
    uv: 'Sous UV : fluorescence bleu vif typique des gisements d’Anvers.',
  },
  {
    baseName: 'Katana ancien forgé main',
    category: 'Reliques',
    baseValue: 7200,
    hotLevel: 'TIÈDE',
    surface: 'Lame courbe avec ligne de trempe ondulée et fourreau laqué.',
    clue: 'Signature gravée sur la soie sous le manche : atelier du XVIIe.',
    uv: 'Sous UV : traces anciennes nettoyées près de la garde en fer.',
  },
  {
    baseName: 'Œuf émaillé impérial',
    category: 'Joaillerie',
    baseValue: 8900,
    hotLevel: 'BRÛLANT',
    surface: 'Émail guilloché rubis et monture en or ciselé.',
    clue: 'Poinçon de maître orfèvre authentique sous le socle.',
    uv: 'Sous UV : cire de scellé de galerie privée encore visible.',
  },
  {
    baseName: 'Violoncelle ancien verni ambre',
    category: 'Art',
    baseValue: 5600,
    hotLevel: 'TIÈDE',
    surface: 'Bois d’érable ondé et étiquette jaunie à l’intérieur.',
    clue: 'Réparation de fracture d’âme faite au XIXe siècle.',
    uv: 'Sous UV : vernis d’époque aux résines naturelles, zéro colle moderne.',
  },
  {
    baseName: 'Icône byzantine dorée',
    category: 'Reliques',
    baseValue: 4900,
    hotLevel: 'TIÈDE',
    surface: 'Panneau de bois peint à la détrempe et feuille d’or craquelée.',
    clue: 'Cadre scié à la hâte — arrachée d’une chapelle privée.',
    uv: 'Sous UV : numéro d’inventaire du patrimoine ecclésiastique.',
  },
  {
    baseName: 'Calice d’argent martelé',
    category: 'Reliques',
    baseValue: 4400,
    hotLevel: 'TIÈDE',
    surface: 'Coupe liturgique lourde ornée de cabochons rouges.',
    clue: 'Devise latine partiellement limée sur le pied.',
    uv: 'Sous UV : résidu de cire d’autel et de vernis muséal.',
  },
  {
    baseName: 'Masque rituel en obsidienne',
    category: 'Reliques',
    baseValue: 5300,
    hotLevel: 'BRÛLANT',
    surface: 'Pierre volcanique noire polie avec incrustations turquoise.',
    clue: 'Terre sèche encore logée dans les orbites — fouille clandestine.',
    uv: 'Sous UV : étiquette de transit douanier déchirée au dos.',
  },
  {
    baseName: 'Micro-drone tactique thermique',
    category: 'Armement',
    baseValue: 6900,
    hotLevel: 'BRÛLANT',
    surface: 'Châssis carbone mat pliable avec optique infrarouge.',
    clue: 'Batterie militaire sans marquage civil et liaison chiffrée.',
    uv: 'Sous UV : code d’unité d’intervention effacé au solvant.',
  },
  {
    baseName: 'Chevalière héraldique en or',
    category: 'Joaillerie',
    baseValue: 3600,
    hotLevel: 'TIÈDE',
    surface: 'Or 18 carats gravé d’un blason familial usé.',
    clue: 'Initiales et date « 1924 » gravées à l’intérieur de l’anneau.',
    uv: 'Sous UV : micro-trace de poudre noire sur le chaton.',
  },
  {
    baseName: 'Plaque diplomatique CMD',
    category: 'Données',
    baseValue: 3400,
    hotLevel: 'BRÛLANT',
    surface: 'Plaque métallique verte à liseré doré avec boulons tordus.',
    clue: 'Peinture de pare-chocs arrachée autour des vis.',
    uv: 'Sous UV : hologramme officiel du Quai d’Orsay authentique.',
  },
  {
    baseName: 'Gilet pare-balles composite',
    category: 'Armement',
    baseValue: 2600,
    hotLevel: 'BRÛLANT',
    surface: 'Housse noire discrète avec deux plaques céramiques niveau IV.',
    clue: 'Impact de calibre 9mm arrêté dans la plaque avant.',
    uv: 'Sous UV : matricule d’équipement de police effacé.',
  },
  {
    baseName: 'Dossier confidentiel relié',
    category: 'Données',
    baseValue: 4100,
    hotLevel: 'BRÛLANT',
    surface: 'Chemise cartonnée rouge sang fermée par un élastique.',
    clue: 'Contient des écoutes retranscrites et des photos de filature.',
    uv: 'Sous UV : tampon « SECRET DÉFENSE » barré au feutre.',
  },
  {
    baseName: 'Montre Patek Philippe vintage',
    category: 'Joaillerie',
    baseValue: 7400,
    hotLevel: 'BRÛLANT',
    surface: 'Boîtier or jaune ultra-fin, bracelet alligator usé.',
    clue: 'Numéro de mouvement intact correspondant à une succession contestée.',
    uv: 'Sous UV : gravure horlogère invisible de Genève sous la corne.',
  },
  {
    baseName: 'Revolver Colt Python chromé',
    category: 'Armement',
    baseValue: 3900,
    hotLevel: 'BRÛLANT',
    surface: 'Canon ventilé 4 pouces, crosse noyer quadrillée.',
    clue: 'Deux chambres du barillet sentent encore la poudre fraîche.',
    uv: 'Sous UV : numéro de série limé chimiquement sur la carcasse.',
  },
  {
    baseName: 'Fusil de précision démonté',
    category: 'Armement',
    baseValue: 6200,
    hotLevel: 'BRÛLANT',
    surface: 'Mallette mousse découpée sur mesure avec lunette nocturne.',
    clue: 'Silencieux artisanal fileté et trois douilles récupérées.',
    uv: 'Sous UV : trace de solvant de nettoyage militaire récent.',
  },
  {
    baseName: 'Cryptophone satellite Iridium',
    category: 'Données',
    baseValue: 4300,
    hotLevel: 'BRÛLANT',
    surface: 'Téléphone blindé à grosse antenne rétractable.',
    clue: 'Dernier appel émis il y a 22 minutes vers un cargo en mer.',
    uv: 'Sous UV : puce de chiffrement scellée à la résine époxy.',
  },
  {
    baseName: 'Lingot d’or de raffinerie',
    category: 'Joaillerie',
    baseValue: 8200,
    hotLevel: 'BRÛLANT',
    surface: 'Barre de 250g coulée artisanalement, poinçon fondu.',
    clue: 'Angles martelés pour masquer l’estampille d’origine.',
    uv: 'Sous UV : traces d’acide de test chez un diamantaire.',
  },
  {
    baseName: 'Toile expressionniste roulée',
    category: 'Art',
    baseValue: 5900,
    hotLevel: 'TIÈDE',
    surface: 'Châssis absent — toile découpée proprement au cutter.',
    clue: 'Signature en coin recouverte d’un vernis de restauration.',
    uv: 'Sous UV : étiquette d’exposition d’une galerie suisse.',
  },
  {
    baseName: 'Passeport diplomatique vierge',
    category: 'Données',
    baseValue: 4800,
    hotLevel: 'BRÛLANT',
    surface: 'Livret bordeaux neuf avec puce biométrique intacte.',
    clue: 'Numéro de série d’un lot déclaré disparu en ambassade.',
    uv: 'Sous UV : filigranes officiels 100 % authentiques.',
  },
  {
    baseName: 'Scanner fréquences chiffrées',
    category: 'Données',
    baseValue: 2900,
    hotLevel: 'BRÛLANT',
    surface: 'Boîtier radio noir modifié avec double antenne.',
    clue: 'Mémoire verrouillée sur les canaux de la Brigade Financière.',
    uv: 'Sous UV : autocollant de maintenance de fourgon arraché.',
  },
  {
    baseName: 'Émeraude colombienne sertie',
    category: 'Joaillerie',
    baseValue: 6700,
    hotLevel: 'TIÈDE',
    surface: 'Pierre verte de 14 carats démontée d’un collier royal.',
    clue: 'Griffes en platine tordues à la pince coupante.',
    uv: 'Sous UV : aucune résine de remplissage — pierre pure.',
  },
  {
    baseName: 'Manuscrit enluminé XIVe',
    category: 'Art',
    baseValue: 5100,
    hotLevel: 'TIÈDE',
    surface: 'Parchemin de vélin orné d’or et de lapis-lazuli.',
    clue: 'Arraché d’une reliure monastique — bord gauche dentelé.',
    uv: 'Sous UV : tampon de bibliothèque universitaire gratté.',
  },
  {
    baseName: 'Luger P08 gravé or',
    category: 'Armement',
    baseValue: 5800,
    hotLevel: 'BRÛLANT',
    surface: 'Pistolet historique à genouillère, damasquinage doré.',
    clue: 'Chargeur plein avec balles d’époque sous-chargées.',
    uv: 'Sous UV : trace d’huile de coffre-fort privé.',
  },
  {
    baseName: 'Boîtier IMSI-Catcher WiFi',
    category: 'Données',
    baseValue: 4600,
    hotLevel: 'BRÛLANT',
    surface: 'Routeur noir modifié alimenté par batterie LiPo externe.',
    clue: 'Capte les identifiants mobiles dans un rayon de 400 m.',
    uv: 'Sous UV : soudure manuelle sur la puce GPS désactivée.',
  },
  {
    baseName: 'Liasse coupures neuves 100 $',
    category: 'Joaillerie',
    baseValue: 3500,
    hotLevel: 'BRÛLANT',
    surface: 'Billets serrés sous bande bancaire perforée.',
    clue: 'Numéros de série consécutifs d’une rançon récente.',
    uv: 'Sous UV : trace d’encre antivol rose sur la tranche.',
  },
  {
    baseName: 'Mallette réfrigérée scellée',
    category: 'Données',
    baseValue: 6100,
    hotLevel: 'BRÛLANT',
    surface: 'Caisson médical carbone avec voyant batterie à 18 %.',
    clue: 'Échantillons biologiques numérotés sous azote.',
    uv: 'Sous UV : code-barres de clinique privée gratté.',
  },
  {
    baseName: 'Fusil à canon scié',
    category: 'Armement',
    baseValue: 3100,
    hotLevel: 'BRÛLANT',
    surface: 'Juxtaposé calibre 12 enveloppé dans un torchon gras.',
    clue: 'Crosse raccourcie au ruban adhésif noir, poudre fraîche.',
    uv: 'Sous UV : empreinte partielle sur le pontet.',
  },
  {
    baseName: 'Rivière de diamants démontée',
    category: 'Joaillerie',
    baseValue: 7900,
    hotLevel: 'BRÛLANT',
    surface: '32 pierres taille brillant glissées dans du velours noir.',
    clue: 'Fermoir en or blanc brisé net à la pince.',
    uv: 'Sous UV : micro-inclusions naturelles authentiques.',
  },
];

const VARIANTS = [
  { suffix: 'de saisie douanière', mult: 1.0, hotBump: true },
  { suffix: 'sorti de coffre privé', mult: 1.15, hotBump: false },
  { suffix: 'd’un cargo du port', mult: 0.95, hotBump: true },
  { suffix: 'sans numéro de série', mult: 1.1, hotBump: true },
  { suffix: 'de succession nocturne', mult: 1.05, hotBump: false },
  { suffix: 'taché d’encre froide', mult: 0.9, hotBump: true },
  { suffix: 'authentifié hors circuit', mult: 1.25, hotBump: false },
  { suffix: 'volé avant inventaire', mult: 1.2, hotBump: true },
];

export const PROCEDURAL_ITEMS_CATALOG: CatalogItemTemplate[] = FAMILIES.flatMap((fam) =>
  VARIANTS.map((v) => ({
    name: `${fam.baseName} ${v.suffix}`,
    category: fam.category,
    surfaceDesc: fam.surface,
    clues: [fam.clue],
    uvClues: [fam.uv],
    clueTag: `${fam.baseName} · ${v.suffix}`,
    baseValue: Math.round((fam.baseValue * v.mult) / 50) * 50,
    hotLevel: v.hotBump ? 'BRÛLANT' : fam.hotLevel,
  })),
);
