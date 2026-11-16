/**
 * ROSTER DE 100 PERSONNAGES UNIQUES ("THE FENCE")
 * Chaque PNJ possède son identité, son passé, son secret, sa faille, sa ligne rouge,
 * son tic physique, sa réplique d'ouverture et son portrait dédié (/assets/portraits/cast/<id>.png).
 */

export interface CastCharacter {
  id: string;
  firstName: string;
  fullName: string;
  gender: 'm' | 'f';
  age: number;
  job: string;
  faction: string;
  profileId: 'gambler' | 'exec' | 'cop' | 'rich_kid' | 'broker' | 'smuggler' | 'heiress' | 'priest' | 'hacker';
  secret: string;
  weaknessHint: string;
  redLineHint: string;
  weakKeywords: string;
  angerKeywords: string;
  openingTemplate: string;
  tell: string;
  portraitVisual: string;
}

type RawCastTuple = [
  id: string,
  firstName: string,
  lastName: string,
  gender: 'm' | 'f',
  age: number,
  job: string,
  faction: string,
  profileId: CastCharacter['profileId'],
  secret: string,
  weaknessHint: string,
  redLineHint: string,
  weakKeywords: string,
  angerKeywords: string,
  openingTemplate: string,
  tell: string,
  portraitVisual: string,
];

const RAW_CAST: RawCastTuple[] = [
  ['c001', 'Nadia', 'Khoury', 'f', 36, 'Chirurgienne radiée, blouse sous trench', 'Clinique Privée Saint-Luc', 'exec',
    'A opéré un parrain blessé en cachette et doit payer son billet pour Beyrouth.',
    'Craque si tu évoques l’Ordre des médecins, son bloc opératoire ou la clinique.',
    'Explose si tu la traites de boucher ou d’incompétente.',
    'ordre|clinique|bloc|patient|scalpel|radiation|beyrouth', 'boucher|incompétente|charcutière',
    "J'ai laissé un bloc ouvert il y a vingt minutes. Prends {item} pour {price} $ cash et oublie mon visage.",
    'Ongles coupés ras, odeur d’éther, elle désinfecte mécaniquement ses doigts au gel.',
    '36yo Middle Eastern woman, sharp dark eyes, dark bob haircut, medical scrub collar visible under dark trenchcoat, exhausted expression'],
  ['c002', 'Viktor', 'Morozov', 'm', 52, 'Ancien artificier de la Baltique', 'Docks du Nord', 'smuggler',
    'Il lui manque deux phalanges et transporte souvent du matériel militaire déclassé.',
    'Se crispe dès que tu parles de douane maritime, de Kaliningrad ou de ses doigts.',
    'Devient violent si tu te moques de sa main mutilée.',
    'douane|cargo|baltique|kaliningrad|port|explosif', 'manchot|infirme|invalide|moquer',
    "Ça sort de cale sèche, zéro papier. {item}, {price} $ en grosses coupures, pas de monnaie.",
    'Il garde la main gauche gantée de cuir noir posée lourdement sur le comptoir.',
    '52yo weathered Russian man, deep facial scar, buzzcut grey hair, thick stubble, black leather jacket, missing pinky finger on gloved hand'],
  ['c003', 'Clarisse', 'De Montfort', 'f', 44, 'Commissaire-priseur déchue', 'Mairie & Promoteurs', 'heiress',
    'Siphonne la réserve d’un musée de province pour couvrir ses dettes aux courses.',
    'Panique si tu mentionnes Drouot, l’inventaire annuel ou les assurances.',
    'Méprise toute offre qu’elle juge indigne de son rang.',
    'drouot|inventaire|assurance|conservateur|musée|course', 'voleuse|minable|fauchée|clocharde',
    "Les experts officiels posent trop de questions. {item} est authentique. {price} $ et nous n'avons jamais existé.",
    'Elle ajuste son carré de soie Hermès taché de pluie avec un dédain crispé.',
    '44yo aristocratic French woman, high cheekbones, silver-streaked chignon, pearl earrings, silk scarf, tailored wool coat'],
  ['c004', 'Kamel', 'Benali', 'm', 29, 'Coursier de nuit en T-Max', 'Cercle des Jeux', 'gambler',
    'A perdu la recette d’un caïd au poker clandestin rue Saint-Denis.',
    'S’effondre si tu cites le cercle de jeux, son scooter ou l’heure qu’il est.',
    'S’emporte si tu le prends pour un petit livreur sans cerveau.',
    'cercle|poker|usurier|scooter|moto|caïd|dette', 'livreur|gamin|bouffon|rigolo',
    "Mon moteur tourne encore dehors. Prends {item}, lâche {price} $ maintenant ou je suis mort à 5h.",
    'Casque sous le bras, il regarde sans cesse à travers la vitrine vers le trottoir.',
    '29yo North African man, athletic build, short fade haircut, dark hoodie under leather moto jacket, holding motorcycle helmet edge, sweating'],
  ['c005', 'Sébastien', 'Lemaire', 'm', 48, 'Inspecteur des impôts véreux', 'Brigade Financière', 'cop',
    'Revend des pièces saisies lors de perquisitions fiscales avant mise sous scellés.',
    'Bafouille si tu parles de Bercy, du procureur ou des numéros de scellés.',
    'Se braque si tu l’accuses ouvertement d’être un flic.',
    'bercy|impôts|scellé|procureur|perquisition|contrôle', 'flic|pourri|balance|poulet',
    "J'ai vingt minutes avant le dépôt au greffe. {item}, propre et traçable nulle part : {price} $.",
    'Costume gris anthracite trop strict, lunettes sans monture, œil froid qui scanne tes étagères.',
    '48yo gaunt French bureaucrat man, rimless glasses, receding hairline, grey wool suit and tie, cold calculating stare'],
  ['c006', 'Zoe', 'Vandenberg', 'f', 24, 'Hackeuse sous bracelet électronique', 'Brigade Financière', 'hacker',
    'A coupé son bracelet GPS avec un leurre RF et n’a que 45 minutes d’autonomie.',
    'Panique si tu mentionnes le bracelet, la triangulation ou les logs réseau.',
    'Explose si tu la traites d’amatrice ou de gamine.',
    'bracelet|gps|triangulation|log|ip|dgsi|signal', 'gamine|amatrice|nerd|minable',
    "Mon leurre tient encore trente minutes max. {item}, clean de toute trace. {price} $ cash, zéro virement.",
    'Cheville droite dissimulée dans une grosse botte, doigts tachés d’encre et de café froid.',
    '24yo Belgian woman, pale skin, dark under-eye circles, messy bun with chopstick, oversized charcoal hoodie, intense wary gaze'],
  ['c007', 'Père', 'Moreau', 'm', 63, 'Aumônier de prison à la retraite', 'Mairie & Promoteurs', 'priest',
    'Fait passer des objets cachés par d’anciens détenus contre de l’argent pour une maison de retraite.',
    'Craque si tu évoques la maison d’arrêt, l’évêché ou la confession.',
    'Ne supporte pas qu’on le traite d’hypocrite.',
    'prison|évêché|confession|paroisse|détenu|parloir', 'hypocrite|imposteur|escroc',
    "Un homme repenti m'a confié {item} avant de disparaître. {price} $ aideront à réparer bien des fautes.",
    'Voix douce mais mains noueuses crispées sur la doublure de son manteau noir.',
    '63yo frail French elderly man, deep wrinkles, silver hair, worn black wool overcoat over dark shirt, haunted guilty eyes'],
  ['c008', 'Yuki', 'Tanaka', 'f', 31, 'Négociante en art de Kyoto', 'Clinique Privée Saint-Luc', 'broker',
    'Travaille pour un clan Yakuza qui lui a coupé l’auriculaire gauche après une erreur.',
    'Cède si tu remarques sa main gauche ou cites le clan de Kyoto.',
    'Explose face aux insultes ou aux offres insultantes.',
    'kyoto|clan|yakuza|doigt|main|galerie|douane', 'merde|arnaque|poubelle|idiote',
    "Je ne négocie pas par plaisir. {item} vaut le double à Tokyo. {price} $ net, décision immédiate.",
    'Maintien impeccable, mais sa main gauche reste toujours glissée dans sa poche.',
    '31yo Japanese woman, sleek black hair in low ponytail, sharp tailored black blazer, minimalist platinum earrings, icy composed gaze'],
  ['c009', 'Rico', 'Santana', 'm', 39, 'Ancien videur de boîte de nuit', 'Cercle des Jeux', 'smuggler',
    'A vidé le coffre de son propre patron après trois mois de salaire impayé.',
    'Pâlit si tu évoques le patron du club, les caméras ou ses anciens collègues.',
    'Devient agressif si tu le provoques physiquement.',
    'patron|club|boîte|caméra|videur|salaire|coffre', 'brute|abruti|tocard|dégage',
    "C'est mon dû, point barre. {item} contre {price} $ cash et je change de département ce matin.",
    'Nuque épaisse tatouée, souffle court, il jette un œil à tes caméras.',
    '39yo muscular Hispanic man, shaved head, neck tattoo peeking above collar, heavy bomber jacket, bruised knuckles'],
  ['c010', 'Éléonore', 'Vasseur', 'f', 58, 'Veuve d’un armateur marseillais', 'Docks du Nord', 'heiress',
    'Découvre que son mari défunt a laissé 4 millions de dettes cachées au port.',
    'S’effondre si tu évoques le notaire, les créanciers ou son défunt mari.',
    'Se vexe instantanément si tu doutes de son nom.',
    'notaire|mari|succession|dettes|marseille|huissier', 'menteuse|ruinée|pauvre|pitié',
    "Mon mari gardait {item} dans son coffre secret. {price} $ en espèces, s'il vous plaît, avant l'arrivée des huissiers.",
    'Manteau en cachemire noir trempé, gants de cuir fin, bague de veuve tournée sans arrêt.',
    '58yo distinguished French woman, silver bob, fur-trimmed black coat, pearl brooch, proud posture hiding quiet desperation'],
  ['c011', 'Tariq', 'Mansour', 'm', 34, 'Ex-traducteur militaire', 'Docks du Nord', 'broker',
    'Rapatrie des biens pillés lors d’opérations extérieures via valise diplomatique.',
    'Sensible si tu mentionnes l’ambassade, l’armée ou les douanes militaires.',
    'Explose si tu remets en cause son honneur de soldat.',
    'ambassade|armée|légion|douane|valise|convoi', 'lâche|traître|mercenaire|rat',
    "Cette pièce a traversé trois déserts. {item}, {price} $ cash, propre comme un sou neuf.",
    'Regard vif et posé, veste kaki sans galons, posture droite.',
    '34yo Arab man, short dark beard, sharp jawline, olive drab field jacket, calm intense eyes'],
  ['c012', 'Mélanie', 'Gauthier', 'f', 27, 'Assistante parlementaire aux abois', 'Mairie & Promoteurs', 'exec',
    'A subtilisé des pièces compromettantes dans le bureau d’un sénateur qui la harcelait.',
    'Tremble si tu cites le Sénat, la presse ou son patron.',
    'Claque la porte si tu lui fais des remarques déplacées.',
    'sénat|député|presse|journaliste|scandale|bureau', 'gamine|menteuse|pute|menace',
    "Si on me voit ici ma carrière est finie. Prends {item} pour {price} $ et ne me demande jamais d'où ça vient.",
    'Tailleur noir froissé, badge retourné oublié autour du cou, mains glacées.',
    '27yo French woman, dark chestnut hair pulled back, tired eyes, white silk blouse under dark blazer, nervous posture'],
  ['c013', 'Boris', 'Kovalenko', 'm', 46, 'Mécanicien de cargos fantômes', 'Docks du Nord', 'smuggler',
    'Trafique des pièces détachées et des reliques récupérées sur des épaves en mer Noire.',
    'Pâlit si tu évoques les garde-côtes, le pavillon libérien ou les épaves.',
    'S’énerve si tu critiques la qualité de sa marchandise.',
    'cargo|garde-côte|épave|port|pavillon|douane', 'rouillé|pourri|camelote|arnaque',
    "De l'acier vrai, pas du toc. {item} sorti de cale hier soir. {price} $ net pour les gars.",
    'Taches de graisse indélébiles sous les ongles, odeur de sel et de diesel.',
    '46yo Ukrainian dock mechanic, thick moustache, weathered skin, dark wool beanie, heavy canvas work jacket'],
  ['c014', 'Sonia', 'Morel', 'f', 33, 'Infiltrée de la Brigade des Stups', 'Brigade Financière', 'cop',
    'Teste les receleurs du quartier sur ordre du commissaire divisionnaire.',
    'Se trouble si tu repères son oreillette ou mentionnes la brigade.',
    'Se braque dès que tu avoues ouvertement faire du recel.',
    'oreillette|micro|brigade|stups|indic|souricière', 'volé|recel|braquage|illégal',
    "Un contact m'a dit que tu payais bien et vite. {item} pour {price} $ cash, on boucle ça tout de suite ?",
    'Blouson en cuir neuf sans une rayure, regard beaucoup trop calme pour 3h du matin.',
    '33yo sharp-featured French woman, dark hair tucked behind ear, dark leather jacket, intense unblinking stare'],
  ['c015', 'Arthur', 'De Saint-Clair', 'm', 25, 'Héritier flambeur interdit de casino', 'Cercle des Jeux', 'rich_kid',
    'A engagé la collection de son grand-père pour payer une table de baccara.',
    'Craque si tu menaces d’appeler son père ou le notaire familial.',
    'Explose si tu te moques de son accent ou de son nom.',
    'père|grand-père|famille|casino|baccara|honte', 'gosse|fils à papa|clown|ruiné',
    "Ne touche pas ça avec tes doigts gras. C'est {item}. Donne-moi {price} $ et on oublie ma visite.",
    'Chevalière dorée, montre de luxe absente au poignet (déjà vendue ailleurs).',
    '25yo posh young French man, tousled blond hair, cashmere turtleneck under tweed coat, arrogant smirk hiding panic'],
  ['c016', 'Fatima', 'Ziani', 'f', 41, 'Pharmacienne de nuit endettée', 'Clinique Privée Saint-Luc', 'exec',
    'Détourne des stocks et des appareils de luxe pour éponger le crédit de son officine.',
    'Panique si tu parles de l’Inspection sanitaire, des ordonnances ou des créanciers.',
    'Refuse qu’on la traite de dealeuse.',
    'inspection|ordonnance|officine|pharmacie|banque|crédit', 'dealeuse|came|drogue|pourrie',
    "La banque coupe ma ligne demain matin. Prends {item} pour {price} $, j'en ai besoin avant 7h.",
    'Cernes profonds, manteau boutonné jusqu’au menton, souffle court.',
    '41yo North African woman, dark curly hair pinned up, tortoise-shell glasses, dark trench coat, worried expression'],
  ['c017', 'Gérard', 'Perrin', 'm', 61, 'Ancien serrurier de coffres forts', 'Mairie & Promoteurs', 'broker',
    'Ouvre les coffres oubliés des hôtels particuliers en démolition avant le passage des pelleteuses.',
    'Se méfie si tu mentionnes les chantiers de la mairie ou les promoteurs.',
    'Déteste qu’on doute de son expertise technique.',
    'mairie|chantier|démolition|promoteur|coffre|serrure', 'amateur|bricoleur|faux|toc',
    "J'ai ouvert le coffre à l'oreille en quatre minutes. {item} est authentique. {price} $ et pas un sou de moins.",
    'Petite loupe d’horloger rangée dans sa poche poitrine, mains précises et calmes.',
    '61yo French craftsman man, salt-and-pepper beard, deep laugh lines, dark corduroy jacket, quiet confident eyes'],
  ['c018', 'Olga', 'Petrova', 'f', 38, 'Ancienne gymnaste devenue passeuse', 'Docks du Nord', 'smuggler',
    'Transporte des pierres et documents dans des doubles fonds entre Minsk et Paris.',
    'Se crispe si tu parles de Minsk, des passeports ou des douaniers.',
    'Ne tolère aucun manque de respect.',
    'minsk|biélorussie|passeport|douane|frontière|valise', 'lâche|traître|espionne|pute',
    "Train de nuit arrivé à 2h10. {item} propre, sans trace. {price} $ cash et je reprends la route.",
    'Port de tête altier, manteau cintré sombre, regard glacial qui ne cille pas.',
    '38yo Slavic woman, blonde hair pulled tightly back, high cheekbones, long black wool coat, stoic expression'],
  ['c019', 'Léon', 'Marchand', 'm', 55, 'Brocanterie en faillite rue des Rosiers', 'Mairie & Promoteurs', 'broker',
    'Connaît la valeur exacte de chaque pièce mais doit fermer boutique vendredi.',
    'Plie si tu prouves un défaut technique ou une usure cachée.',
    'Explose si tu essaies de lui faire la leçon sur l’antiquité.',
    'défaut|usure|copie|faux|expert|faillite|loyer', 'arnaqueur|escroc|ignorant|poubelle',
    "Je sais ce que ça vaut, petit. {item}, cote haute. Je te le cède à {price} $ parce que j'ai le couteau sous la gorge.",
    'Lunettes demi-lune posées sur le bout du nez, veste en tweed usée aux coudes.',
    '55yo French antiques dealer, greying curly hair, half-moon glasses, brown tweed jacket, sharp appraising eyes'],
  ['c020', 'Kévin', 'Dumont', 'm', 23, 'Technicien fibre ayant fouillé un grenier', 'Cercle des Jeux', 'gambler',
    'A trouvé une planque murée lors d’un raccordement et panique devant la valeur.',
    'Craque vite si tu parles de police, de propriétaire ou de caméra d’immeuble.',
    'S’énerve si tu te fous de son âge.',
    'propriétaire|caméra|immeuble|police|flic|grenier', 'gamin|puceau|rigolo|idiot',
    "Je sais même pas ce que c'est exactement mais ça vaut un bras. {item} pour {price} $ cash, vite !",
    'Blouson fluo retourné à l’envers pour cacher le logo de son employeur.',
    '23yo nervous French youth, messy brown hair, faded black windbreaker zipped to chin, wide anxious eyes'],
];

const LAST_NAMES_EXT = [
  'Bouchard', 'Rousseau', 'Keller', 'Novak', 'Diallo', 'Ferrari', 'Silva', 'Lindqvist',
  'Kowalski', 'Chen', 'Sato', 'Al-Mansoor', 'Conti', 'Varga', 'Okafor', 'Mercier',
  'Delacroix', 'Bauer', 'Haddad', 'Reyes',
];

const EXTRA_JOBS_M = [
  'Ex-convoyeur de fonds', 'Veilleur de nuit au Louvre', 'Chimiste de laboratoire clandestin',
  'Ancien garde du corps d’oligarque', 'Archiviste radié du Quai d’Orsay', 'Croupier renvoyé du cercle Haussmann',
  'Pilote d’hélicoptère privé', 'Restaurateur de toiles faussaire', 'Dépanneur de coffres-forts',
  'Agent de sûreté aéroportuaire', 'Ancien légionnaire endetté', 'Courtier en crypto déchu',
  'Journaliste d’investigation aux abois', 'Avocat radié du barreau', 'Majordome d’ambassade congédié',
];

const EXTRA_JOBS_F = [
  'Ex-convoyeuse de fonds', 'Restauratrice du patrimoine aux abois', 'Croupière virée d’un cercle privé',
  'Avocate radiée du barreau', 'Ancienne attachée de presse ministérielle', 'Négociante en pierres d’Anvers',
  'Archiviste radiée des Renseignements', 'Hôtesse de jet privé endettée', 'Experte en horlogerie déchue',
  'Hackeuse freelance traquée', 'Fille de diplomate ruinée', 'Ancienne agent de sécurité VIP',
  'Biologiste sans labo', 'Galériste en liquidation', 'Traductrice d’écoutes judiciaires',
];

const FIRST_M = ['Marek', 'Driss', 'Vance', 'Tarik', 'Milo', 'Yanis', 'Benoît', 'Lucas', 'Hugo', 'Matteo', 'Samir', 'Ivan', 'Enzo', 'Roman', 'Karim', 'Damien', 'Théo', 'Julien', 'Cédric', 'Arnaud'];
const FIRST_F = ['Inès', 'Nora', 'Chloé', 'Zara', 'Elena', 'Marina', 'Claire', 'Camille', 'Sarah', 'Leïla', 'Amélie', 'Roxane', 'Eva', 'Maya', 'Lucie', 'Diane', 'Katya', 'Soraya', 'Jade', 'Salomé'];

const FACTIONS_CYCLE = [
  'Mairie & Promoteurs',
  'Docks du Nord',
  'Clinique Privée Saint-Luc',
  'Brigade Financière',
  'Cercle des Jeux',
];

const PROFILES_CYCLE: CastCharacter['profileId'][] = [
  'gambler', 'exec', 'cop', 'rich_kid', 'broker', 'smuggler', 'heiress', 'priest', 'hacker',
];

const SECRETS_POOL = [
  'Doit quitter le territoire par cargo avant 06h00 demain matin.',
  'A subtilisé la pièce dans le bureau privé d’un client trop confiant.',
  'Un créancier retient sa voiture en otage à deux rues d’ici.',
  'La pièce vient d’un héritage contesté dont personne n’a l’inventaire.',
  'A effacé les caméras de surveillance pendant exactement quatre minutes.',
  'Cache une double vie qui s’effondrera au moindre scandale public.',
  'Doit payer une caution judiciaire en liquide avant l’ouverture du greffe.',
  'A trouvé la pièce dans une saisie douanière mal scellée.',
];

const OPENINGS_EXTRA = [
  "Je suis déjà censé être loin d'ici. Prends {item} pour {price} $ cash et oublie que je suis entré.",
  "Pas le temps de jouer aux devinettes. {item}, authentique et sans papier. {price} $ sur le zinc, maintenant.",
  "On m'a recommandé ton rideau fermé pour les affaires pressées. {item} à {price} $, à prendre ou à laisser.",
  "J'ai risqué gros pour sortir {item} ce soir. Tu me donnes {price} $ en coupures usagées et je disparais.",
];

const TELLS_M = [
  'Il garde un œil rivé sur le reflet de la rue dans la vitrine sombre.',
  'Il tapote impatiemment sa bague contre l’établi en fixant la caisse.',
  'Ses épaules sont tendues ; il vérifie sa montre toutes les dix secondes.',
  'Il garde la main droite enfouie dans la poche de son manteau.',
];

const TELLS_F = [
  'Elle garde un œil rivé sur le reflet de la rue dans la vitrine sombre.',
  'Elle serre nerveusement la anse de son sac contre son flanc.',
  'Ses épaules sont tendues ; elle vérifie son téléphone sans l’allumer.',
  'Elle glisse une mèche derrière son oreille en scrutant l’entrée.',
];

const PORTRAIT_LOOKS_M = [
  'weathered face, dark wool coat, rain droplets on collar, dramatic side lamp',
  'short beard, leather jacket, shadowed eyes, cigarette smoke haze',
  'slicked back hair, rumpled dark suit, loosened tie, nervous sweat',
  'buzzcut, turtleneck sweater, sharp jawline, hard noir shadows',
  'round wire glasses, tweed blazer, silver temples, gaunt cheeks',
];

const PORTRAIT_LOOKS_F = [
  'sharp cheekbones, dark trench coat, damp hair from rain, warm desk lamp keylight',
  'sleek bob haircut, black blazer, shadowed intense eyes, high contrast noir',
  'messy updo, wool turtleneck, dark coat collar turned up, tired beauty',
  'silver-streaked hair, silk scarf, tailored coat, guarded aristocratic expression',
  'dark hoodie under leather coat, subtle hoop earrings, wary night gaze',
];

/** id de personnage -> id du portrait utilisé (les 20 personnages écrits ont chacun le leur, les autres en partagent un compatible). */
export const PORTRAIT_OF: Record<string, string> = {};

function buildProceduralRoster(): CastCharacter[] {
  const handCrafted: CastCharacter[] = RAW_CAST.map(
    ([
      id, firstName, lastName, gender, age, job, faction, profileId,
      secret, weaknessHint, redLineHint, weakKeywords, angerKeywords,
      openingTemplate, tell, portraitVisual,
    ]) => ({
      id,
      firstName,
      fullName: `${firstName} ${lastName}`,
      gender,
      age,
      job,
      faction,
      profileId,
      secret,
      weaknessHint,
      redLineHint,
      weakKeywords,
      angerKeywords,
      openingTemplate,
      tell,
      portraitVisual,
    }),
  );

  // Visages disponibles (les 20 portraits existants) : chaque personnage généré en reçoit un du même genre,
  // le moins utilisé, dont l'âge colle au métier. L'âge affiché suit alors le visage (plus de pilote de 23 ans).
  const faces: Record<'m' | 'f', { id: string; age: number }[]> = { m: [], f: [] };
  const faceUse: Record<string, number> = {};
  for (const c of handCrafted) {
    PORTRAIT_OF[c.id] = c.id;
    faces[c.gender].push({ id: c.id, age: c.age });
    faceUse[c.id] = 1;
  }
  const jobAgeRange = (job: string): [number, number] => {
    if (/^fille /i.test(job)) return [22, 30];
    if (/pilote|chimiste|avocat|journaliste|restaurat|archiviste|expert|attachée|négociante|biolog|traduct|galér/i.test(job)) return [30, 65];
    if (/ancien|ex-|majordome|croupi|garde du corps|légionnaire|convoy|dépanneur/i.test(job)) return [28, 65];
    return [23, 65];
  };

  // Generate 80 more distinct deterministic characters -> total 100 unique characters!
  const generated: CastCharacter[] = [];
  for (let i = 0; i < 80; i++) {
    const idx = i + 21;
    const id = `c${String(idx).padStart(3, '0')}`;
    const isFemale = i % 2 === 1;
    const gender: 'm' | 'f' = isFemale ? 'f' : 'm';
    const firstName = isFemale
      ? FIRST_F[(i * 3) % FIRST_F.length]
      : FIRST_M[(i * 3) % FIRST_M.length];
    const lastName = LAST_NAMES_EXT[(i * 7 + (isFemale ? 3 : 0)) % LAST_NAMES_EXT.length];
    const job = isFemale
      ? EXTRA_JOBS_F[i % EXTRA_JOBS_F.length]
      : EXTRA_JOBS_M[i % EXTRA_JOBS_M.length];
    const [minAge, maxAge] = jobAgeRange(job);
    const pool = faces[gender].filter((f) => f.age + 3 >= minAge && f.age - 2 <= maxAge);
    const candidates = pool.length ? pool : faces[gender];
    const leastUsed = Math.min(...candidates.map((f) => faceUse[f.id] ?? 0));
    const ties = candidates.filter((f) => (faceUse[f.id] ?? 0) === leastUsed);
    const face = ties[i % ties.length];
    faceUse[face.id] = (faceUse[face.id] ?? 0) + 1;
    PORTRAIT_OF[id] = face.id;
    const age = Math.min(maxAge, Math.max(minAge, face.age + ((i * 5) % 6) - 2));
    const faction = FACTIONS_CYCLE[i % FACTIONS_CYCLE.length];
    const profileId = PROFILES_CYCLE[i % PROFILES_CYCLE.length];
    const secret = SECRETS_POOL[i % SECRETS_POOL.length];
    const openingTemplate = OPENINGS_EXTRA[i % OPENINGS_EXTRA.length];
    const tell = isFemale
      ? TELLS_F[i % TELLS_F.length]
      : TELLS_M[i % TELLS_M.length];
    const look = isFemale
      ? PORTRAIT_LOOKS_F[i % PORTRAIT_LOOKS_F.length]
      : PORTRAIT_LOOKS_M[i % PORTRAIT_LOOKS_M.length];

    const weaknessHint = isFemale
      ? `Pressée par son secret : ${secret.toLowerCase()}`
      : `Pressé par son secret : ${secret.toLowerCase()}`;
    const redLineHint = isFemale
      ? 'Explose si tu l’insultes ou la traites de menteuse.'
      : 'Explose si tu l’insultes ou le traites de menteur.';

    generated.push({
      id,
      firstName,
      fullName: `${firstName} ${lastName}`,
      gender,
      age,
      job,
      faction,
      profileId,
      secret,
      weaknessHint,
      redLineHint,
      weakKeywords: 'police|douane|caméra|scandale|greffe|créancier|cargo|audit',
      angerKeywords: 'menteur|menteuse|escroc|poubelle|dégage|minable',
      openingTemplate,
      tell,
      portraitVisual: `${age}yo ${isFemale ? 'woman' : 'man'}, ${job}, ${look}`,
    });
  }

  return [...handCrafted, ...generated];
}

export const CAST_ROSTER: CastCharacter[] = buildProceduralRoster();
