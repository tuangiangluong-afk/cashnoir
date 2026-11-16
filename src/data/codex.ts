/**
 * LE CODEX DU RECELEUR (Musée Clandestin)
 * 60+ objets uniques classés par collection thématique et rareté.
 * Chaque objet acheté est enregistré de manière permanente dans le Codex.
 * Compléter une collection débloque un Atout Permanent du Syndicat.
 */

export type ItemRarity = 'commun' | 'insolite' | 'rare' | 'epique' | 'legendaire' | 'mythique';

export interface CodexItem {
  id: string;
  name: string;
  collection: string;
  rarity: ItemRarity;
  provenance: string;
  lore: string;
  baseEstimatedValue: number;
}

export interface CollectionSet {
  id: string;
  title: string;
  description: string;
  faction: string;
  perkName: string;
  perkDescription: string;
  items: CodexItem[];
}

export const COLLECTIONS_DATA: CollectionSet[] = [
  {
    id: 'secrets-etat',
    title: 'Secrets d’État & Guerre Froide',
    description: 'Archives volées, matériel d’espionnage déclassé et dossiers compromettants.',
    faction: 'Syndicat des Banquiers Suisses',
    perkName: 'Immunité Fédérale',
    perkDescription: 'La police hésite à toucher à ta boutique : -25% de Heat généré sur tous les deals.',
    items: [
      {
        id: 'microfilm-stasi',
        name: 'Microfilm Stasi 1982',
        collection: 'secrets-etat',
        rarity: 'rare',
        provenance: 'Berlin-Est',
        lore: 'Bobine 8mm contenant la liste d’agents doubles infiltrés à l’OTAN. Développé mais non déchiffré.',
        baseEstimatedValue: 4200,
      },
      {
        id: 'cle-usb-procureur',
        name: 'Clé USB cryptée du Procureur',
        collection: 'secrets-etat',
        rarity: 'insolite',
        provenance: 'Palais de Justice',
        lore: '32 Go chiffrés en AES-256 avec les dépositions sous X contre le grand banditisme local.',
        baseEstimatedValue: 2800,
      },
      {
        id: 'carte-militaire',
        name: 'Carte militaire d’invasion falsifiée',
        collection: 'secrets-etat',
        rarity: 'insolite',
        provenance: 'État-major étranger',
        lore: 'Quadrillage d’axes logistiques stratégiques avec tampons secrets périmés.',
        baseEstimatedValue: 2400,
      },
      {
        id: 'valise-nucleaire',
        name: 'Valise de transmission Cheget déclassée',
        collection: 'secrets-etat',
        rarity: 'legendaire',
        provenance: 'Silo désaffecté de l’Oural',
        lore: 'Console portable blindée à cadran rotatif et codes de tir pré-enregistrés de 1989.',
        baseEstimatedValue: 12500,
      },
      {
        id: 'passeport-diplomatique',
        name: 'Passeport diplomatique vierge',
        collection: 'secrets-etat',
        rarity: 'rare',
        provenance: 'Consulat général',
        lore: 'Véritable papier filigrané avec immunité totale, prêt pour un nouveau visage.',
        baseEstimatedValue: 5600,
      },
      {
        id: 'protocole-gladio',
        name: 'Dossier secret Réseau Gladio',
        collection: 'secrets-etat',
        rarity: 'epique',
        provenance: 'Archives souterraines OTAN',
        lore: 'Caches d’armes secrètes et identités dormantes en Europe de l’Ouest.',
        baseEstimatedValue: 8900,
      },
    ],
  },
  {
    id: 'joyaux-imperiaux',
    title: 'Joyaux de la Couronne & Trésors Impériaux',
    description: 'Bijouterie princière, gemmes mythiques et trésors pillés aux dynasties déchues.',
    faction: 'Le Milieu de Pigalle',
    perkName: 'Clientèle Aristocratique',
    perkDescription: 'Les collectionneurs privés paient le prix fort : +18% de valeur lors des ventes aux enchères.',
    items: [
      {
        id: 'diamant-golconde',
        name: 'Diamant Bleu de Golconde (9 carats)',
        collection: 'joyaux-imperiaux',
        rarity: 'mythique',
        provenance: 'Mines de Golconde (Inde)',
        lore: 'Taille ancienne coussin, pureté VVS1, couleur bleu océan profond. Une légende vivante.',
        baseEstimatedValue: 28000,
      },
      {
        id: 'oeuf-faberge',
        name: 'Œuf Fabergé des Tsars volé',
        collection: 'joyaux-imperiaux',
        rarity: 'legendaire',
        provenance: 'Palais d’Hiver, Saint-Pétersbourg',
        lore: 'Émail guilloché translucide et or ciselé 24 carats. Automate d’horlogerie en état de marche.',
        baseEstimatedValue: 18500,
      },
      {
        id: 'diademe-romanov',
        name: 'Diadème perles et platine des Romanov',
        collection: 'joyaux-imperiaux',
        rarity: 'epique',
        provenance: 'Trésor impérial russe',
        lore: '42 perles fines d’eau douce et 180 diamants taille rose montés sur platine massif.',
        baseEstimatedValue: 11000,
      },
      {
        id: 'rolex-daytona-rose',
        name: 'Rolex Daytona en Or Rose sertie',
        collection: 'joyaux-imperiaux',
        rarity: 'rare',
        provenance: 'Hôtel particulier Monégasque',
        lore: 'Lunette rainbow baguette, cadran nacre noire. Numéro de série gravé au laser meulé.',
        baseEstimatedValue: 4800,
      },
      {
        id: 'bague-medicis',
        name: 'Chevalière ornée des Médicis',
        collection: 'joyaux-imperiaux',
        rarity: 'rare',
        provenance: 'Galerie des Offices (Florence)',
        lore: 'Camée antique sculpté dans une agate bicouche avec le blason des six tourteaux florentins.',
        baseEstimatedValue: 6200,
      },
      {
        id: 'patek-vintage-1952',
        name: 'Patek Philippe Calendrier Perpétuel 1952',
        collection: 'joyaux-imperiaux',
        rarity: 'epique',
        provenance: 'Vente confidentielle Genève',
        lore: 'Boîtier or jaune non poli, phase de lune en émail bleu profond. Restaurée sans traces.',
        baseEstimatedValue: 9800,
      },
    ],
  },
  {
    id: 'arsenal-clandestin',
    title: 'Arsenal Clandestin & Pièces d’Élite',
    description: 'Armement de guerre introuvable, prototypes modifiés et armes historiques de maîtres.',
    faction: 'La Bratva des Docks',
    perkName: 'Garde Rapprochée',
    perkDescription: 'Les clients sentent le danger : tu ne peux plus subir de braquage spontané.',
    items: [
      {
        id: 'luger-p08-or',
        name: 'Luger P08 gravé à l’or fin',
        collection: 'arsenal-clandestin',
        rarity: 'epique',
        provenance: 'Collection privée d’officier',
        lore: 'Canon 9mm Parabellum, finitions au damasquinage d’or et plaquettes en noyer quadrillé.',
        baseEstimatedValue: 8400,
      },
      {
        id: 'fusil-sniper-demantele',
        name: 'Fusil de précision démonté en mallette',
        collection: 'arsenal-clandestin',
        rarity: 'rare',
        provenance: 'Conteneur d’armes des Balkans',
        lore: 'Canon lourd cannelé, culasse fluide et silencieux démontable sans numéro de série.',
        baseEstimatedValue: 5200,
      },
      {
        id: 'colt-1911-noirci',
        name: 'Colt 1911 finition parkerisée noire',
        collection: 'arsenal-clandestin',
        rarity: 'insolite',
        provenance: 'Base militaire abandonnée',
        lore: 'Matricule limé chimiquement, détente allégée à 1,5 kg. Une mécanique parfaite.',
        baseEstimatedValue: 2600,
      },
      {
        id: 'revolver-bulldog-argent',
        name: 'Revolver Bulldog 1880 manche ivoire',
        collection: 'arsenal-clandestin',
        rarity: 'rare',
        provenance: 'Succession clandestine de Pigalle',
        lore: 'Gravures florales profondes, barillet 5 coups cal. 44, aucun recul.',
        baseEstimatedValue: 3900,
      },
      {
        id: 'prototype-drone-suicide',
        name: 'Micro-drone militaire de reconnaissance',
        collection: 'arsenal-clandestin',
        rarity: 'legendaire',
        provenance: 'Laboratoire de défense secret',
        lore: 'Optique thermique haute résolution et charge creuse miniature. Liaison satellite militaire.',
        baseEstimatedValue: 14000,
      },
      {
        id: 'gilet-pare-balles-kevlar',
        name: 'Gilet pare-balles composite discret',
        collection: 'arsenal-clandestin',
        rarity: 'commun',
        provenance: 'Dépôt de sécurité privée',
        lore: 'Plaques céramiques niveau IV dissimulables sous une veste de costume.',
        baseEstimatedValue: 1800,
      },
    ],
  },
  {
    id: 'toiles-de-maitre',
    title: 'Toiles de Maître & Faussaires de Génie',
    description: 'Chefs-d’œuvre spoliés, études préparatoires et contrefaçons indétectables.',
    faction: 'Le Milieu de Pigalle',
    perkName: 'Œil d’Expert',
    perkDescription: 'Tu détectes immédiatement toutes les contrefaçons au premier coup d’œil (100% garanti).',
    items: [
      {
        id: 'esquisse-modigliani',
        name: 'Étude au fusain de Modigliani (1917)',
        collection: 'toiles-de-maitre',
        rarity: 'epique',
        provenance: 'Atelier de Montparnasse spolié',
        lore: 'Ligne pure et mélancolique sur papier vélin jauni, tampon d’atelier authentique.',
        baseEstimatedValue: 9200,
      },
      {
        id: 'faux-monet-expert',
        name: 'Nymphéas attribués à Claude Monet',
        collection: 'toiles-de-maitre',
        rarity: 'legendaire',
        provenance: 'Domaine normand privé',
        lore: 'Craquelures microscopiques parfaites, pigments d’époque. Même les musées s’y trompent.',
        baseEstimatedValue: 16000,
      },
      {
        id: 'manuscrit-illumine',
        name: 'Feuillet de livre d’heures du XIVe siècle',
        collection: 'toiles-de-maitre',
        rarity: 'rare',
        provenance: 'Abbaye sécularisée',
        lore: 'Enluminure or et lapis-lazuli sur parchemin de vélin. Lettrine historiée intacte.',
        baseEstimatedValue: 4600,
      },
      {
        id: 'dessin-rembrandt',
        name: 'Dessin à la plume attribué à Rembrandt',
        collection: 'toiles-de-maitre',
        rarity: 'mythique',
        provenance: 'Cabinet de curiosités d’Amsterdam',
        lore: 'Clair-obscur magistral au lavis d’encre de bistre. Trésor inestimable.',
        baseEstimatedValue: 24000,
      },
      {
        id: 'stradivarius-contrefait',
        name: 'Violoncelle façon Stradivarius expertisé',
        collection: 'toiles-de-maitre',
        rarity: 'rare',
        provenance: 'Atelier de Crémone (faussaire)',
        lore: 'Vernis ambré à base de résine ancienne. Son chaud et puissant qui dupe les solistes.',
        baseEstimatedValue: 5800,
      },
      {
        id: 'lithographie-picasso',
        name: 'Lithographie numérotée de Picasso (1955)',
        collection: 'toiles-de-maitre',
        rarity: 'insolite',
        provenance: 'Galerie rive gauche cambriolée',
        lore: 'Épreuve d’artiste 3/20 signée au crayon gras, certificat déchiré.',
        baseEstimatedValue: 3400,
      },
    ],
  },
  {
    id: 'cyber-pegre',
    title: 'Cyber-Pègre & Technologie Noire',
    description: 'Hardware de crypto-hackers, matériel d’interception et clés d’infrastructures critiques.',
    faction: 'Le Cartel de la Baie',
    perkName: 'Contre-Surveillance',
    perkDescription: 'Les flics ne peuvent plus poser de mouchard sur tes pièces : la police est aveugle.',
    items: [
      {
        id: 'hardware-wallet-2011',
        name: 'Clé Ledger 2011 avec 450 BTC dormants',
        collection: 'cyber-pegre',
        rarity: 'mythique',
        provenance: 'Disque dur récupéré d’un crash',
        lore: 'Clé privée protégée par une seed phrase de 12 mots partiellement corrompue.',
        baseEstimatedValue: 32000,
      },
      {
        id: 'boitier-surveillance-wifi',
        name: 'Boîtier d’interception IMSI-Catcher miniaturisé',
        collection: 'cyber-pegre',
        rarity: 'rare',
        provenance: 'Cellule antiterroriste piratée',
        lore: 'Capte tous les SMS et appels cellulaires dans un rayon de 400 mètres sans mandat.',
        baseEstimatedValue: 6400,
      },
      {
        id: 'cryptophone-militaire',
        name: 'Cryptophone satellite inviolable',
        collection: 'cyber-pegre',
        rarity: 'insolite',
        provenance: 'Mercenaire d’Europe centrale',
        lore: 'Réseau Iridium chiffré matériellement, autodestruction thermique sur faux code PIN.',
        baseEstimatedValue: 3100,
      },
      {
        id: 'puce-zero-day',
        name: 'Carte mère injectée d’un exploit Zero-Day',
        collection: 'cyber-pegre',
        rarity: 'epique',
        provenance: 'Entreprise de télécom d’État',
        lore: 'Backdoor permanente gravée au silicium permettant le contrôle d’un câble sous-marin.',
        baseEstimatedValue: 10500,
      },
      {
        id: 'scanner-frequences-police',
        name: 'Scanner police déverrouillé bandes chiffrées',
        collection: 'cyber-pegre',
        rarity: 'commun',
        provenance: 'Fourgon de gendarmerie pillé',
        lore: 'Écoute en temps réel des fréquences tactiques et des alertes de braquage.',
        baseEstimatedValue: 1900,
      },
      {
        id: 'antenne-starlink-pirate',
        name: 'Antenne Starlink débridée non géo-bloquée',
        collection: 'cyber-pegre',
        rarity: 'insolite',
        provenance: 'Port d’Anvers',
        lore: 'Débit gigabit indétectable depuis n’importe quel cargo en pleine mer.',
        baseEstimatedValue: 2700,
      },
    ],
  },
  {
    id: 'reliques-sacrees',
    title: 'Reliques Sacrées & Ésotériques',
    description: 'Objets de culte clandestins, trésors templiers et artefacts sacrés convoités par les loges.',
    faction: 'Les Yakuza du Dragon Noir',
    perkName: 'Trésorerie Noire',
    perkDescription: 'Les loges et sectes arrosent ta boutique : +400 $ de dividende net chaque matin.',
    items: [
      {
        id: 'icone-byzantine',
        name: 'Icône byzantine en ivoire du XIe siècle',
        collection: 'reliques-sacrees',
        rarity: 'epique',
        provenance: 'Monastère du Mont Athos',
        lore: 'Représentation du Christ Pantocrator en ivoire sculpté avec dorures à la feuille.',
        baseEstimatedValue: 8800,
      },
      {
        id: 'calice-templier',
        name: 'Calice d’argent massif des Templiers',
        collection: 'reliques-sacrees',
        rarity: 'legendaire',
        provenance: 'Commanderie secrète du Larzac',
        lore: 'Gravé de la croix pattée et de l’inscription « Non nobis Domine ». Éclat mystique.',
        baseEstimatedValue: 14500,
      },
      {
        id: 'katana-edo-muramasa',
        name: 'Katana Muramasa d’époque Edo (1620)',
        collection: 'reliques-sacrees',
        rarity: 'mythique',
        provenance: 'Trésor familial d’un Oyabun',
        lore: 'Lame forgée avec une ligne de trempe ondulée légendaire. Considéré comme assoiffé de sang.',
        baseEstimatedValue: 26000,
      },
      {
        id: 'emeraude-vatican',
        name: 'Émeraude brute gravée du Vatican',
        collection: 'reliques-sacrees',
        rarity: 'epique',
        provenance: 'Bibliothèque secrète du Saint-Siège',
        lore: 'Pierre de 45 carats d’un vert intense ornée d’un sceau papal du XVIe siècle.',
        baseEstimatedValue: 11200,
      },
      {
        id: 'masque-azteque-obsidienne',
        name: 'Masque funéraire aztèque en obsidienne',
        collection: 'reliques-sacrees',
        rarity: 'rare',
        provenance: 'Fouille clandestine au Mexique',
        lore: 'Obsidienne polie comme un miroir noir avec incrustations de turquoise et de nacre.',
        baseEstimatedValue: 6800,
      },
      {
        id: 'dague-rituelle-thibétaine',
        name: 'Phurba rituelle en fer météorique',
        collection: 'reliques-sacrees',
        rarity: 'rare',
        provenance: 'Temple himalayen isolé',
        lore: 'Trois visages courroucés ciselés dans du fer d’origine extra-terrestre.',
        baseEstimatedValue: 5400,
      },
    ],
  },
];

export function getDiscoveredCodexItems(): string[] {
  try {
    return JSON.parse(localStorage.getItem('fence_codex_discovered') || '[]');
  } catch {
    return [];
  }
}

export function recordCodexDiscovery(itemId: string): boolean {
  try {
    const list = getDiscoveredCodexItems();
    if (!list.includes(itemId)) {
      list.push(itemId);
      localStorage.setItem('fence_codex_discovered', JSON.stringify(list));
      return true; // Newly discovered
    }
  } catch {
    // Ignore storage issues
  }
  return false;
}

export function isCollectionComplete(collectionId: string, discovered: string[]): boolean {
  const col = COLLECTIONS_DATA.find((c) => c.id === collectionId);
  if (!col) return false;
  return col.items.every((it) => discovered.includes(it.id));
}

export function getActiveCodexPerks(discovered: string[]): string[] {
  return COLLECTIONS_DATA.filter((c) => isCollectionComplete(c.id, discovered)).map((c) => c.perkName);
}
