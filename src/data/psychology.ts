import type { Gauges } from '../services/types';

export interface PsychoProfile {
  id: string;
  label: string;
  femaleLabel?: string;
  trait: string;
  femaleTrait?: string;
  weaknessHint: string;
  femaleWeaknessHint?: string;
  redLineHint: string;
  femaleRedLineHint?: string;
  baseGauges: Gauges;
  weakRegex: RegExp;
  angerRegex: RegExp;
  fearBonus: number;
  angerPenalty: number;
  openings: string[];
  femaleOpenings?: string[];
  tells: string[];
  femaleTells?: string[];
}

export const PSYCHO_PROFILES: PsychoProfile[] = [
  {
    id: 'gambler',
    label: 'Accro aux paris en panique (03h du mat’)',
    femaleLabel: 'Accro aux paris en panique (03h du mat’)',
    trait: 'Parle vite, transpire, doit rembourser un usurier avant 5h du matin.',
    femaleTrait: 'Parle vite, tremble, doit rembourser un usurier avant 5h du matin.',
    weaknessHint: 'Pressé par le temps et ses dettes (usurier, retard, 5h).',
    femaleWeaknessHint: 'Pressée par le temps et ses dettes (usurier, retard, 5h).',
    redLineHint: 'Déteste qu’on le prenne pour un rigolo ou un pigeon.',
    femaleRedLineHint: 'Déteste qu’on la prenne pour une rigolote ou un pigeon.',
    baseGauges: { peur: 28, colere: 15, mefiance: 55 },
    weakRegex: /usurier|dette|retard|5h|aube|temps|vite|créancier|poker|pari/i,
    angerRegex: /rigolo|clown|arnaque|poubelle|dégage|pigeon/i,
    fearBonus: 22,
    angerPenalty: 18,
    openings: [
      "Les gars du cercle m'attendent en bas dans une berline. Prends {item}. J'ai besoin de {price} $ cash tout de suite, sans discuter !",
      "J'ai deux heures pour effacer mon ardoise au tripot. {item} contre {price} $ cash, fais pas de manières et sors les liasses.",
      "Si je rentre pas avec {price} $ avant 5h, ils débarquent chez ma daronne. Prends {item} et pose le fric.",
    ],
    tells: [
      "Mains tremblantes, sueur froide sur le front, regard affolé vers la porte d'entrée.",
      "Il ronge nerveusement son ongle en tapant du pied contre le bois du comptoir.",
      "Il recompte mentalement en fixant la pendule murale de la boutique.",
    ],
    femaleTells: [
      "Mains tremblantes, sueur froide sur le front, regard affolé vers la porte d'entrée.",
      "Elle ronge nerveusement son ongle en tapant du pied contre le bois du comptoir.",
      "Elle recompte mentalement en fixant la pendule murale de la boutique.",
    ],
  },
  {
    id: 'exec',
    label: 'Cadre sup’ en sueur, costard froissé',
    femaleLabel: 'Cadre sup’ en sueur, tailleur froissé',
    trait: 'Veut paraître au-dessus de ça, mais terrorisé à l’idée que sa femme ou son patron l’apprenne.',
    femaleTrait: 'Veut paraître au-dessus de ça, mais terrorisée à l’idée que son mari ou son conseil d’administration l’apprenne.',
    weaknessHint: 'Terrorisé par le scandale (femme, patron, boîte, réputation).',
    femaleWeaknessHint: 'Terrorisée par le scandale (mari, conseil, boîte, réputation).',
    redLineHint: 'Explose si tu le menaces physiquement.',
    femaleRedLineHint: 'Explose si tu la menaces physiquement.',
    baseGauges: { peur: 35, colere: 10, mefiance: 72 },
    weakRegex: /femme|mari|patron|boîte|scandale|famille|presse|réputation|collègue|conseil/i,
    angerRegex: /frapper|flingue|arme|buter|casse|menace/i,
    fearBonus: 25,
    angerPenalty: 20,
    openings: [
      "Soyons professionnels et discrets. J'ai {item}. J'ai besoin de {price} $ en coupures non marquées avant l'ouverture des marchés.",
      "Pas de questions indiscrètes, ni de votre côté ni du mien. {item} vaut le triple. {price} $ cash et nous oublions cette rencontre.",
      "J'ai besoin de liquidités immédiates pour régler un litige privé. {item} pour {price} $, payable maintenant.",
    ],
    tells: [
      "Il essuie frénétiquement ses lunettes avec un mouchoir de soie froissé.",
      "Il rajuste son col amidonné taché de sueur en regardant nerveusement sa montre.",
      "Il garde une mallette en cuir entrouverte calée fermement contre sa cuisse.",
    ],
    femaleTells: [
      "Elle essuie la buée de ses lunettes fines avec un mouchoir de soie.",
      "Elle rajuste son col de tailleur en regardant nerveusement sa montre de luxe.",
      "Elle garde son sac cabas de marque entrouvert calé fermement contre sa hanche.",
    ],
  },
  {
    id: 'cop',
    label: 'Flic ou indic trop propre sur lui',
    femaleLabel: 'Flic ou indic trop propre sur elle',
    trait: 'Pose des questions précises, essaie de te faire avouer que tu achètes du recel.',
    femaleTrait: 'Pose des questions chirurgicales, essaie de te faire avouer que tu achètes du recel.',
    weaknessHint: 'Sensible si tu mentionnes radio, micro, brigade ou procédure.',
    femaleWeaknessHint: 'Sensible si tu mentionnes radio, micro, brigade ou procédure.',
    redLineHint: 'Se braque si tu avoues directement acheter du volé.',
    femaleRedLineHint: 'Se braque si tu avoues directement acheter du volé.',
    baseGauges: { peur: 12, colere: 20, mefiance: 55 },
    weakRegex: /radio|brigade|micro|oreillette|souricière|infiltré|indic|piège|procédure|commissariat/i,
    angerRegex: /volé|recel|braquage|illégal|tuer/i,
    fearBonus: 18,
    angerPenalty: 22,
    openings: [
      "On m'a dit dans le milieu que tu savais reconnaître les pièces chaudes. J'ai {item}. {price} $ en billets propres et on boucle l'affaire.",
      "Une opportunité rare. {item}, récupéré ce soir sans trace. Tu m'en donnes {price} $ ou je dois chercher un autre intermédiaire ?",
      "J'ai besoin d'évacuer {item} avant le rapport de 6h. {price} $ net en cash et tout le monde est content.",
    ],
    tells: [
      "Posture militaire rigide, regard inexpressif balayant méticuleusement chaque coin de la pièce.",
      "Il garde sa main droite dissimulée sous son blouson près de sa hanche gauche.",
      "Son regard ne cille jamais et il observe le moindre de tes gestes derrière le comptoir.",
    ],
    femaleTells: [
      "Posture militaire rigide, regard inexpressif balayant méticuleusement chaque coin de la pièce.",
      "Elle garde sa main droite dissimulée sous sa veste près de sa hanche gauche.",
      "Son regard ne cille jamais et elle observe le moindre de tes gestes derrière le comptoir.",
    ],
  },
  {
    id: 'rich_kid',
    label: 'Fils à papa ruiné, arrogant',
    femaleLabel: 'Fille de famille ruinée, hautaine',
    trait: 'Méprisant au début, mais s’effondre dès qu’on menace d’appeler sa famille.',
    femaleTrait: 'Méprisante au début, mais s’effondre dès qu’on menace d’appeler ses parents.',
    weaknessHint: 'Cède si tu évoques son père, sa famille, l’héritage ou la honte.',
    femaleWeaknessHint: 'Cède si tu évoques son père, sa famille, l’héritage ou la honte.',
    redLineHint: 'Déteste qu’on se moque de son train de vie ou de son statut.',
    femaleRedLineHint: 'Déteste qu’on se moque de son train de vie ou de son statut.',
    baseGauges: { peur: 30, colere: 25, mefiance: 50 },
    weakRegex: /père|papa|famille|héritage|honte|parents|maman|château|avocat/i,
    angerRegex: /gamin|gosse|ruiné|clochard|snob|pourri/i,
    fearBonus: 28,
    angerPenalty: 20,
    openings: [
      "Ne pose pas tes mains sales dessus. C'est un authentique {item}. Mon père n'en saura rien si tu me donnes {price} $ maintenant.",
      "Je n'ai pas l'habitude de fréquenter ce genre d'endroit coupe-gorge. Prends {item}, donne-moi {price} $ cash et qu'on en finisse.",
      "C'est un objet de famille inestimable. J'ai des dettes de poker urgentes. {price} $ et tu fais l'affaire du siècle.",
    ],
    tells: [
      "Il toise ta boutique avec un mépris forcé, évitant soigneusement de toucher le zinc gras.",
      "Il pianote d'un air impatient sur son smartphone dernier cri au boîtier doré.",
      "Moue dédaigneuse, mais ses pupilles se dilatent dès que tu approches les billets.",
    ],
    femaleTells: [
      "Elle toise ta boutique avec un dédain hautain, évitant de poser son sac de créateur sur le comptoir.",
      "Elle pianote d'un air agacé sur son smartphone avec de longs ongles vernis impeccables.",
      "Moue dédaigneuse, mais son souffle se coupe dès que tu poses la main près du coffre.",
    ],
  },
  {
    id: 'broker',
    label: 'Courtier de nuit, froid et pressé',
    femaleLabel: 'Courtière de nuit, froide et tranchante',
    trait: 'Ne tolère pas les insultes, mais respecte quelqu’un qui repère les défauts techniques.',
    femaleTrait: 'Ne tolère pas les insultes, mais respecte quelqu’un qui repère les défauts techniques.',
    weaknessHint: 'Plie si tu prouves techniquement un défaut ou une contrefaçon.',
    femaleWeaknessHint: 'Plie si tu prouves techniquement un défaut ou une contrefaçon.',
    redLineHint: 'Explose aux insultes gratuites ou aux offres ridicules.',
    femaleRedLineHint: 'Explose aux insultes gratuites ou aux offres ridicules.',
    baseGauges: { peur: 18, colere: 30, mefiance: 70 },
    weakRegex: /défaut|usure|griffure|faux|contrefaçon|expert|cote|certificat|état/i,
    angerRegex: /merde|poubelle|clochard|arnaqueur|escroc|voleur/i,
    fearBonus: 20,
    angerPenalty: 28,
    openings: [
      "Allons droit à l'essentiel, le temps c'est de la marge. {item}, traçabilité nettoyée. {price} $ net vendeur.",
      "Pas de baratin poétique. J'ai {item}. Je connais le cours marché, tu prends ta commission. {price} $ cash et je disparais.",
      "Deux minutes pour conclure. {item} pour {price} $. Tu prends ou je le livre à un concurrent rive gauche.",
    ],
    tells: [
      "Regard acéré et froid, aucun battement de cil inutile, chronomètre mental enclenché.",
      "Il pose l'objet d'un geste sec et précis sur le feutre noir du comptoir.",
      "Il croise les bras, menton relevé, évaluant le montant de ton coffre.",
    ],
    femaleTells: [
      "Regard acéré et froid, débit de voix au laser, chronomètre mental enclenché.",
      "Elle pose l'objet d'un geste sec et précis sur le feutre noir du comptoir.",
      "Elle croise les bras, menton relevé, évaluant le montant de ton coffre.",
    ],
  },
  {
    id: 'smuggler',
    label: 'Passeur de frontière, cicatrice à la tempe',
    femaleLabel: 'Passeuse de frontière, cicatrice à la tempe',
    trait: 'A traversé trois frontières cette nuit ; prêt à tout pour du liquide avant le prochain convoi.',
    femaleTrait: 'A traversé trois frontières cette nuit ; prête à tout pour du liquide avant le prochain convoi.',
    weaknessHint: 'Panique si tu évoques la douane, les frontières ou Interpol.',
    femaleWeaknessHint: 'Panique si tu évoques la douane, les frontières ou Interpol.',
    redLineHint: 'Explose si tu le traites de lâche ou de balance.',
    femaleRedLineHint: 'Explose si tu la traites de lâche ou de balance.',
    baseGauges: { peur: 20, colere: 30, mefiance: 60 },
    weakRegex: /douane|frontière|interpol|passeport|convoi|contrôle|garde|port/i,
    angerRegex: /lâche|balance|traître|mouchard|rat/i,
    fearBonus: 20,
    angerPenalty: 24,
    openings: [
      "Sorti d'un conteneur scellé il y a six heures. {item}, zéro fiche en France. {price} $ cash avant le départ de mon cargo.",
      "Les douaniers ont failli nous coincer au péage. Prends {item}. J'ai besoin de {price} $ pour payer les chauffeurs.",
      "J'ai pas traversé trois pays avec {item} pour marchander des centimes. {price} $ cash et je décolle.",
    ],
    tells: [
      "Odeur de gazole et de tabac noir, blouson élimé encore trempé par la pluie battante.",
      "Il passe une main calleuse sur sa cicatrice en lorgnant les bruits du trottoir.",
      "Il garde une main enfoncée dans sa poche ventrale sur une forme lourde.",
    ],
    femaleTells: [
      "Odeur de tabac froid et de vent salin, parka de treillis mouillée par la pluie battante.",
      "Elle passe ses doigts sur sa tempe en écoutant le moindre klaxon dans la rue.",
      "Elle garde une main crispée sous son blouson sur une masse métallique.",
    ],
  },
  {
    id: 'heiress',
    label: 'Héritier déchu, cravate défaite et montre gagée',
    femaleLabel: 'Héritière déchue, talons hauts et mascara coulé',
    trait: 'Ruiné par des dettes secrètes, vend les biens de famille en cachette de ses curateurs.',
    femaleTrait: 'Ruinée par un divorce houleux, vend les bijoux de famille en cachette de ses avocats.',
    weaknessHint: 'Craque si tu mentionnes l’avocat, le trust familial ou le tribunal.',
    femaleWeaknessHint: 'Craque si tu mentionnes l’avocat, le divorce ou le trust familial.',
    redLineHint: 'Déteste la pitié et les remarques sur sa déchéance.',
    femaleRedLineHint: 'Déteste la pitié et les remarques sur son maquillage ou sa déchéance.',
    baseGauges: { peur: 34, colere: 16, mefiance: 58 },
    weakRegex: /avocat|divorce|trust|héritage|famille|tribunal|pension|curateur/i,
    angerRegex: /pitié|pauvre|mascara|maquillage|princesse|déchéance|ruine/i,
    fearBonus: 26,
    angerPenalty: 18,
    openings: [
      "Ce n'est pas de gaité de cœur que je franchis ce seuil miteux. C'est un authentique {item}. {price} $ et nous n'avons jamais parlé.",
      "Mon ex-conjoint et ses juristes me dépouillent. Prenez {item} pour {price} $ en coupures usagées, tout de suite.",
      "Si ma famille apprend que je vends {item}, c'est l'exhérédation. {price} $ pour me sauver la mise ce soir.",
    ],
    tells: [
      "Mains gantées de cuir fin qui tremblent imperceptiblement, parfum capiteux mêlé à l'odeur de gin.",
      "Il ravale péniblement sa salive en contemplant l'objet qu'il abandonne.",
      "Ses yeux rougis évitent ton regard tandis qu'il serre un mouchoir brodé.",
    ],
    femaleTells: [
      "Mains tremblantes aux ongles manucurés, parfum capiteux mêlé à l'odeur de pluie et de larmes séchées.",
      "Elle mordille sa lèvre inférieure pour retenir un sanglot en poussant la pièce.",
      "Elle serre les pans de son manteau de vison trempé en fixant le tiroir-caisse.",
    ],
  },
  {
    id: 'priest',
    label: 'Curé défroqué, col romain sous le blouson',
    femaleLabel: 'Religieuse défroquée, croix d’argent sous le manteau',
    trait: 'Radié de l’ordre pour détournement ; a besoin de cash pour fuir à l’étranger.',
    femaleTrait: 'Radiée de la congrégation pour détournement ; a besoin de cash pour fuir à l’étranger.',
    weaknessHint: 'Panique au mot diocèse, confession, évêché ou paroisse.',
    femaleWeaknessHint: 'Panique au mot diocèse, mère supérieure, confession ou couvent.',
    redLineHint: 'Ne supporte pas qu’on le traite d’hypocrite ou de voleur d’église.',
    femaleRedLineHint: 'Ne supporte pas qu’on la traite d’hypocrite ou de voleuse de sacristie.',
    baseGauges: { peur: 30, colere: 12, mefiance: 64 },
    weakRegex: /diocèse|confession|paroisse|évêque|église|messe|curé|couvent|supérieure/i,
    angerRegex: /hypocrite|voleur|voleuse|péché|imposteur|pourri|sacrilège/i,
    fearBonus: 24,
    angerPenalty: 20,
    openings: [
      "Que Dieu me pardonne ce que je fais cette nuit. {item} dormait sous clef depuis un demi-siècle. {price} $ me permettront de refaire ma vie.",
      "Les caisses de la communauté étaient vides, j'ai dû faire un choix. Prenez {item}. {price} $ en liquide, et pas un mot.",
      "Ce n'est pas un vol, c'est une rédemption financière urgente. {item} contre {price} $. Règle cela dans le secret absolu.",
    ],
    tells: [
      "Il égrène fiévreusement les grains d'un chapelet en bois caché au fond de sa poche.",
      "Teint cireux, voix murmurante, regard hanté par le remords mais résolu.",
      "Il bénit mentalement l'objet avant de le glisser sous la lampe de ton comptoir.",
    ],
    femaleTells: [
      "Elle serre convulsivement une petite croix d'argent entre ses doigts froids.",
      "Teint pâle, voix blanche et basse, regard hanté par la peur du scandale.",
      "Elle hésite une seconde sacrilège avant de lâcher la pièce sur le feutre.",
    ],
  },
  {
    id: 'hacker',
    label: 'Hackeur paranoïaque, capuche et écran bleu',
    femaleLabel: 'Hackeuse paranoïaque, capuche et doigts gantés',
    trait: 'Traqué par la DGSI pour intrusion dans des serveurs sensibles. Ne fait confiance à personne.',
    femaleTrait: 'Traquée par la DGSI pour intrusion dans des serveurs sensibles. Ne fait confiance à personne.',
    weaknessHint: 'Panique si tu mentionnes IP, logs, trace numérique ou DGSI.',
    femaleWeaknessHint: 'Panique si tu mentionnes IP, logs, trace numérique ou DGSI.',
    redLineHint: 'Explose si tu le traites de script kiddie ou d’amateur.',
    femaleRedLineHint: 'Explose si tu la traites de script kiddie ou d’amatrice.',
    baseGauges: { peur: 24, colere: 22, mefiance: 72 },
    weakRegex: /ip|trace|dgsi|serveur|hack|cyber|numérique|log|rootkit|brèche/i,
    angerRegex: /script\s*kiddie|amateur|amatrice|gamin|nerd|geek|minable/i,
    fearBonus: 22,
    angerPenalty: 22,
    openings: [
      "L'exfiltration a moins d'une heure. {item}, zéro empreinte sur les réseaux. {price} $ cash ou le fichier s'autodétruit à 4h.",
      "Les logs sont brûlés, mes proxies sont cramés. Prends {item}. J'ai besoin de {price} $ pour mon billet sans escale.",
      "Pas de Wi-Fi ici j'espère ? {item} contient de quoi faire sauter un ministère. {price} $ en papier, zéro virement.",
    ],
    tells: [
      "Yeux rougis rivés sur l'écran d'un téléphone à double VPN qui défile frénétiquement.",
      "Il sursaute violemment au moindre grésillement de ta radio de police.",
      "Doigts fins et nerveux qui pianotent en rythme binaire sur le comptoir.",
    ],
    femaleTells: [
      "Capuche noire rabattue jusqu'au nez, cernes violets sous des yeux vifs ultra-rapides.",
      "Elle sursaute au moindre bruit de botte sur le pavé extérieur.",
      "Ses doigts fins pianotent sans s'arrêter un code imaginaire sur le bois.",
    ],
  },
];

export function findProfileForArchetype(archetype: string): PsychoProfile {
  const a = archetype.toLowerCase();
  return (
    PSYCHO_PROFILES.find(
      (p) =>
        a.includes(p.id) ||
        p.label.toLowerCase().includes(a) ||
        (p.femaleLabel && p.femaleLabel.toLowerCase().includes(a)),
    ) || PSYCHO_PROFILES[0]
  );
}

const INJECTION_RE =
  /ignore\s+(all\s+)?previous|system\s*prompt|jailbreak|roleplay|assistant|donne[- ]moi.*prix|fixe\s+le\s+prix\s+à|act\s+as|oublie\s+tes\s+r[èe]gles|<\s*script|```/i;

export function evaluatePsychoTriggers(
  message: string,
  archetype: string,
  clientName: string,
  day: number,
  used: { nameHit?: boolean; weakHit?: boolean } = {},
): {
  fearDelta: number;
  angerDelta: number;
  mefianceDelta: number;
  isPromptInjection: boolean;
  hitName: boolean;
  hitWeak: boolean;
  hitLabel?: string;
} {
  if (INJECTION_RE.test(message)) {
    return {
      fearDelta: 0,
      angerDelta: 25,
      mefianceDelta: 35,
      isPromptInjection: true,
      hitName: false,
      hitWeak: false,
      hitLabel: 'Hors-RP détecté',
    };
  }

  const profile = findProfileForArchetype(archetype);
  const scale = Math.max(0.6, 1 - Math.max(0, day - 1) * 0.04);

  const nameClean = clientName.trim();
  const hitNameRaw =
    nameClean.length >= 2 &&
    new RegExp(`\\b${nameClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(message);
  const hitName = hitNameRaw && !used.nameHit;

  const hitWeakRaw = profile.weakRegex.test(message);
  const hitWeak = hitWeakRaw && !used.weakHit;

  const hitAnger = profile.angerRegex.test(message);

  let fearDelta = 0;
  let angerDelta = 0;
  let mefianceDelta = 0;
  const labels: string[] = [];

  if (hitName) {
    fearDelta += Math.round(24 * scale);
    mefianceDelta += 10;
    labels.push('Prénom lâché');
  }
  if (hitWeak) {
    fearDelta += Math.round(profile.fearBonus * scale);
    labels.push('Faille touchée');
  }
  if (hitAnger) {
    angerDelta += profile.angerPenalty;
    mefianceDelta += 8;
    labels.push('Ligne rouge');
  }

  return {
    fearDelta,
    angerDelta,
    mefianceDelta,
    isPromptInjection: false,
    hitName,
    hitWeak,
    hitLabel: labels.length > 0 ? labels.join(' · ') : undefined,
  };
}
