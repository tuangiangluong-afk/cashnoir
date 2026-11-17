import { localizeArcText } from './arcsI18n';
import { type ProceduralCase, getGenderFromName } from './generator';
import type { Locale } from './seoContent';
import { GAME_UI } from './gameI18n';

export interface ArcNote {
  arcId: string;
  title: string;
  note: string;
  itemKey: string;
  resolved: boolean;
}

export interface StoryArc {
  id: string;
  title: string;
  itemKey: string;
  clueNote: string;
  step1: {
    castId?: string;
    gender?: 'm' | 'f';
    name: string;
    age: number;
    faction: string;
    archetype: string;
    itemName: string;
    category: string;
    surfaceDesc: string;
    hiddenClue: string;
    uvClue: string;
    clueTag: string;
    openingLine: string;
    openingTell: string;
    baseAsked: number;
    baseFloor: number;
    baseStreet: number;
    policeRadioBrief: string;
    storyContext: string;
  };
  step2: {
    castId?: string;
    gender?: 'm' | 'f';
    name: string;
    age: number;
    faction: string;
    archetype: string;
    itemName: string;
    category: string;
    surfaceDesc: string;
    hiddenClue: string;
    uvClue: string;
    clueTag: string;
    openingWithItem: string;
    openingWithoutItem: string;
    openingTell: string;
    baseAsked: number;
    baseFloor: number;
    baseStreet: number;
    rewardCash: number;
    rewardHeatDelta: number;
    resolutionText: string;
    policeRadioBrief: string;
    storyContext: string;
  };
}

export const STORY_ARCS: StoryArc[] = [
  {
    id: 'arc_depute',
    title: 'Le Chantage du Député',
    itemKey: 'key_depute_phone',
    clueNote:
      'Téléphone chiffré de Député : contact "M. Vane" cherche à le racheter avant 6h. Garde-le au coffre.',
    step1: {
      castId: 'c020',
      gender: 'm',
      name: 'Yanis',
      age: 23,
      faction: 'Mairie & Promoteurs',
      archetype: 'Accro aux paris en panique (03h du mat’)',
      itemName: 'Téléphone chiffré de Député',
      category: 'Données',
      surfaceDesc: 'Smartphone blindé, écran fissuré, code PIN à 6 chiffres.',
      hiddenClue: 'Message verrouillé : "Vane paie 6 500 $ si le tel revient intact avant l’aube."',
      uvClue: 'Sous UV : empreinte partielle + badge d’accès Parlement.',
      clueTag: 'Message de Vane (6 500 $)',
      openingLine:
        'J’ai ramassé ce téléphone sur la banquette arrière d’une berline. Il sonne toutes les dix minutes. Donne-moi du cash vite, je veux plus l’avoir sur moi.',
      openingTell: 'Il vérifie sans cesse par-dessus son épaule.',
      baseAsked: 2600,
      baseFloor: 1350,
      baseStreet: 3200,
      policeRadioBrief: 'Radio : signalement d’un téléphone parlementaire volé près du Quai Sud.',
      storyContext:
        'Tu as trouvé ce téléphone dans un taxi près de la Mairie. Un certain M. Vane menace l’ancien propriétaire par SMS.',
    },
    step2: {
      castId: 'c005',
      gender: 'm',
      name: 'Vane',
      age: 48,
      faction: 'Mairie & Promoteurs',
      archetype: 'Courtier de nuit, froid et pressé',
      itemName: 'Téléphone chiffré de Député',
      category: 'Données',
      surfaceDesc: 'Enveloppe kraft épaisse posée sur le comptoir.',
      hiddenClue: 'Vane porte une chevalière de la Mairie. Il veut le téléphone à tout prix.',
      uvClue: 'Sous UV : billets neufs non marqués dans son enveloppe.',
      clueTag: 'Chevalière Mairie + Enveloppe cash',
      openingWithItem:
        'On m’a dit que tu avais récupéré un téléphone chiffré de Député cette semaine. Pose-le sur le comptoir, je double le tarif et j’efface ton nom des registres.',
      openingWithoutItem:
        'Dis-moi que tu as encore le téléphone du Député. Si tu l’as déjà refourgué au marché noir, on a tous les deux un énorme problème.',
      openingTell: 'Il garde une main dans son manteau, regard glacial.',
      baseAsked: 2400,
      baseFloor: 1200,
      baseStreet: 2800,
      rewardCash: 6500,
      rewardHeatDelta: -14,
      resolutionText:
        'Tu rends le téléphone chiffré à Vane : +6 500 $ cash et dossier effacé (-14 % Heat).',
      policeRadioBrief: 'Radio : silence inhabituel sur les fréquences du Centre.',
      storyContext:
        'Tu es le fixeur de la Mairie. Tu es venu récupérer le Téléphone chiffré de Député que le joueur a peut-être acheté plus tôt.',
    },
  },
  {
    id: 'arc_saint_luc',
    title: 'La Mallette de Saint-Luc',
    itemKey: 'key_cryo_case',
    clueNote:
      'Mallette réfrigérée Saint-Luc : une chirurgienne clandestine (Dr. Kour) paiera fort pour le greffon intact.',
    step1: {
      castId: 'c011',
      gender: 'm',
      name: 'Driss',
      age: 34,
      faction: 'Clinique Privée Saint-Luc',
      archetype: 'Cadre sup’ en sueur, costard froissé',
      itemName: 'Mallette réfrigérée scellée',
      category: 'Métaux',
      surfaceDesc: 'Valise médicale grise qui vibre sur batterie.',
      hiddenClue: 'Étiquette : "À remettre en main propre au Dr. Kour. Prime : 7 500 $."',
      uvClue: 'Sous UV : code-barres de la Clinique Saint-Luc encore actif.',
      clueTag: 'Destination Dr. Kour',
      openingLine:
        'Ne l’ouvre surtout pas. La batterie tient encore cette nuit. Achète-la maintenant ou je la jette dans le canal.',
      openingTell: 'Ses mains tremblent quand il pose la poignée.',
      baseAsked: 3100,
      baseFloor: 1650,
      baseStreet: 3900,
      policeRadioBrief: 'Radio : transport médical non déclaré signalé autour de Saint-Luc.',
      storyContext:
        'Tu as détourné cette mallette de la clinique pour éponger une dette. Tu sais qu’un médecin la cherche.',
    },
    step2: {
      castId: 'c016',
      gender: 'f',
      name: 'Dr. Kour',
      age: 41,
      faction: 'Clinique Privée Saint-Luc',
      archetype: 'Chirurgienne clandestine, froide et pressée',
      itemName: 'Mallette réfrigérée scellée',
      category: 'Métaux',
      surfaceDesc: 'Carnet de chèques au porteur et badge de bloc opératoire.',
      hiddenClue: 'Elle a besoin de la mallette scellée avant la panne de batterie.',
      uvClue: 'Sous UV : gants chirurgicaux propres dans sa poche.',
      clueTag: 'Urgence médicale clandestine',
      openingWithItem:
        'La batterie de ma mallette doit être presque vide. Je sais qu’elle est sur ton étagère. Donne-la-moi maintenant, j’ai 7 500 $ en liquide dans mon sac.',
      openingWithoutItem:
        'Ne me dis pas que tu as déjà revendu la mallette réfrigérée à un ferrailleur… Mon patient ne tiendra pas jusqu’à demain.',
      openingTell: 'Elle consulte sa montre toutes les cinq secondes.',
      baseAsked: 2800,
      baseFloor: 1400,
      baseStreet: 3300,
      rewardCash: 7500,
      rewardHeatDelta: -10,
      resolutionText:
        'Dr. Kour récupère la mallette scellée à temps : +7 500 $ et protection médicale (-10 % Heat).',
      policeRadioBrief: 'Radio : aucune alerte côté clinique.',
      storyContext:
        'Tu es chirurgienne clandestine. Tu cherches absolument la Mallette réfrigérée scellée.',
    },
  },
  {
    id: 'arc_rolex_temoin',
    title: 'La Montre du Témoin',
    itemKey: 'key_rolex_witness',
    clueNote:
      'Rolex Daytona gravée "J.M." : la sœur du témoin disparu ou les Docks la veulent pour le micro-traceur.',
    step1: {
      castId: 'c009',
      gender: 'm',
      name: 'Rico',
      age: 39,
      faction: 'Docks du Nord',
      archetype: 'Fils à papa ruiné, arrogant',
      itemName: 'Rolex Daytona en Or Rose',
      category: 'Horlogerie',
      surfaceDesc: 'Montre lourde, fermoir tordu, tic-tac irrégulier.',
      hiddenClue: 'Gravure au dos : "Pour J.M. — Casier 47". Un micro-traceur est collé dessous.',
      uvClue: 'Sous UV : trace de cambouis du Quai 4.',
      clueTag: 'Gravure J.M. + Traceur',
      openingLine:
        'C’est de l’or rose massif. Je te la laisse pas au prix d’une montre de supermarché, alors fais pas le malin.',
      openingTell: 'Il tapote le comptoir avec impatience.',
      baseAsked: 2900,
      baseFloor: 1500,
      baseStreet: 3600,
      policeRadioBrief: 'Radio : un témoin protégé a disparu près du Quai 4.',
      storyContext:
        'Tu as récupéré cette Rolex sur les docks sans comprendre pourquoi un traceur y est collé.',
    },
    step2: {
      castId: 'c014',
      gender: 'f',
      name: 'Inès',
      age: 33,
      faction: 'Docks du Nord',
      archetype: 'Enquêtrice obstinée, regard d’acier',
      itemName: 'Rolex Daytona en Or Rose',
      category: 'Horlogerie',
      surfaceDesc: 'Dossier photo d’un homme portant exactement cette montre.',
      hiddenClue: 'Elle cherche la gravure "J.M." pour localiser le casier du témoin.',
      uvClue: 'Sous UV : carte de presse plastifiée sous sa veste.',
      clueTag: 'Enquête sur J.M.',
      openingWithItem:
        'La Rolex avec les initiales J.M.… Mon frère la portait le soir où il a disparu. Vends-moi la montre intacte avec son traceur, je te paie 6 000 $ sans poser de questions.',
      openingWithoutItem:
        'J’ai remonté la piste jusqu’ici : la montre de mon frère est passée entre tes mains. Dis-moi que tu l’as pas déjà fondue.',
      openingTell: 'Ses yeux brillent quand elle regarde vers ton étagère.',
      baseAsked: 2500,
      baseFloor: 1200,
      baseStreet: 2900,
      rewardCash: 6000,
      rewardHeatDelta: -15,
      resolutionText:
        'Inès retrouve le traceur de la Rolex et couvre ta boutique : +6 000 $ et -15 % Heat.',
      policeRadioBrief: 'Radio : enquête du Quai 4 classée sans suite.',
      storyContext:
        'Tu cherches la Rolex Daytona gravée J.M. de ton frère disparu pour retrouver le casier 47.',
    },
  },
  {
    id: 'arc_revolver_cercle',
    title: 'L’Arme du Cercle',
    itemKey: 'key_revolver_cercle',
    clueNote:
      'Revolver .357 à deux douilles percutées : le Cercle des Jeux paie 5 800 $ pour récupérer l’arme avant les flics.',
    step1: {
      castId: 'c029',
      gender: 'm',
      name: 'Milo',
      age: 36,
      faction: 'Cercle des Jeux',
      archetype: 'Accro aux paris en panique (03h du mat’)',
      itemName: 'Revolver .357 de Collection',
      category: 'Armement',
      surfaceDesc: 'Canon chromé, crosse en noyer chaude au toucher.',
      hiddenClue: 'Deux douilles percutées dans le barillet. Initiales du Cercle gravées sous la crosse.',
      uvClue: 'Sous UV : résidus de poudre fraîche.',
      clueTag: 'Arme du Cercle + 2 douilles',
      openingLine:
        'Prends ce .357 et planque-le au fond de ton coffre. Si la brigade le trouve sur moi je prends vingt ans.',
      openingTell: 'Il essuie sa sueur sur sa manche.',
      baseAsked: 2200,
      baseFloor: 1100,
      baseStreet: 2800,
      policeRadioBrief: 'Radio : coups de feu entendus derrière le Cercle des Jeux.',
      storyContext:
        'Tu sors d’une fusillade derrière le Cercle des Jeux et veux te débarrasser de l’arme.',
    },
    step2: {
      castId: 'c018',
      gender: 'f',
      name: 'Olga',
      age: 38,
      faction: 'Cercle des Jeux',
      archetype: 'Courtière de nuit, froide et pressée',
      itemName: 'Revolver .357 de Collection',
      category: 'Armement',
      surfaceDesc: 'Valise en cuir contenant des liasses attachées.',
      hiddenClue: 'Elle nettoie les preuves pour le patron du Cercle des Jeux.',
      uvClue: 'Sous UV : aucune trace sur ses gants en cuir.',
      clueTag: 'Nettoyeuse du Cercle',
      openingWithItem:
        'Le gamin du Cercle est passé ici avec un .357 chromé. Remets-moi l’arme sur le comptoir, tu touches 5 800 $ et le Cercle te doit une faveur.',
      openingWithoutItem:
        'On m’a dit que tu avais racheté le .357 de Milo. Si tu l’as déjà balancé dans la rue, c’est toi qui paies la facture.',
      openingTell: 'Elle ne cligne pas des yeux.',
      baseAsked: 2400,
      baseFloor: 1200,
      baseStreet: 2900,
      rewardCash: 5800,
      rewardHeatDelta: -12,
      resolutionText:
        'Olga récupère le .357 du Cercle : +5 800 $ et la rue se calme (-12 % Heat).',
      policeRadioBrief: 'Radio : dossier balistique introuvable.',
      storyContext:
        'Tu représentes le Cercle des Jeux et dois récupérer le Revolver .357 avant la police.',
    },
  },
  {
    id: 'arc_toile_musee',
    title: 'La Toile du Collectionneur',
    itemKey: 'key_toile_musee',
    clueNote:
      'Toile roulée au tampon d’assurance : un receleur d’art suisse offre 8 200 $ pour la toile intacte.',
    step1: {
      castId: 'c023',
      gender: 'm',
      name: 'Benoît',
      age: 65,
      faction: 'Brigade Financière',
      archetype: 'Cadre sup’ en sueur, costard froissé',
      itemName: 'Toile roulée sans châssis',
      category: 'Art',
      surfaceDesc: 'Peinture à l’huile découpée au cutter, odeur de vernis.',
      hiddenClue: 'Tampon au dos : "Collection Moreau — Lot 14". Valeur réelle énorme pour un collectionneur.',
      uvClue: 'Sous UV : signature authentique de 1924 au coin inférieur.',
      clueTag: 'Lot 14 Authentique',
      openingLine:
        'Je dois quitter le pays à 7h. Cette toile vaut dix fois ce que j’en demande, mais j’ai besoin de liquide tout de suite.',
      openingTell: 'Son col est trempé de sueur malgré la pluie.',
      baseAsked: 3500,
      baseFloor: 1900,
      baseStreet: 4400,
      policeRadioBrief: 'Radio : alarme silencieuse déclenchée dans une galerie privée.',
      storyContext:
        'Tu as découpé une toile de ta propre collection avant la saisie de tes biens.',
    },
    step2: {
      castId: 'c008',
      gender: 'f',
      name: 'Sonia',
      age: 31,
      faction: 'Mairie & Promoteurs',
      archetype: 'Courtière d’art privée, élégante et exigeante',
      itemName: 'Toile roulée sans châssis',
      category: 'Art',
      surfaceDesc: 'Tube de transport blindé et certificat vierge.',
      hiddenClue: 'Mandatée par un acheteur privé pour le Lot 14.',
      uvClue: 'Sous UV : lettre de crédit suisse dans sa pochette.',
      clueTag: 'Mandat Collection Moreau',
      openingWithItem:
        'Je cherche le Lot 14 de la collection Moreau — une toile roulée sans châssis. Si tu l’as gardée à l’abri, j’ai 8 200 $ prêts à partir.',
      openingWithoutItem:
        'Le Lot 14 devait être ici ce soir. Si tu l’as bradé en vente rapide, mon acheteur va se tourner vers quelqu’un de plus fiable.',
      openingTell: 'Elle pose un tube de transport en aluminium sur le feutre.',
      baseAsked: 3000,
      baseFloor: 1500,
      baseStreet: 3600,
      rewardCash: 8200,
      rewardHeatDelta: -8,
      resolutionText:
        'La toile du Lot 14 part dans le tube blindé : +8 200 $ nets (-8 % Heat).',
      policeRadioBrief: 'Radio : enquête d’assurance clôturée.',
      storyContext:
        'Tu es courtière d’art clandestine venue racheter la Toile roulée Lot 14.',
    },
  },
  {
    id: 'arc_liasse_brigade',
    title: 'Les Coupures de la Financière',
    itemKey: 'key_liasse_brigade',
    clueNote:
      'Liasse à numéros suivis : un faussaire du Port échange les billets marqués contre 7 000 $ propres.',
    step1: {
      castId: 'c004',
      gender: 'm',
      name: 'Tarik',
      age: 29,
      faction: 'Brigade Financière',
      archetype: 'Accro aux paris en panique (03h du mat’)',
      itemName: 'Liasse de 20 000 € en coupures neuves',
      category: 'Joaillerie',
      surfaceDesc: 'Billets de 100 € neufs sous bande papier.',
      hiddenClue: 'Numéros de série consécutifs : impossible à dépenser en ville, mais un faussaire sait les blanchir.',
      uvClue: 'Sous UV : marquage fluorescent de la Brigade Financière.',
      clueTag: 'Numéros suivis / Blanchiment',
      openingLine:
        'C’est du vrai papier de banque, mais les séries se suivent. Je peux pas les poser au casino. Prends la liasse à prix cassé.',
      openingTell: 'Il garde les mains dans ses poches.',
      baseAsked: 2500,
      baseFloor: 1250,
      baseStreet: 3100,
      policeRadioBrief: 'Radio : la Brigade Financière traque un lot de billets numérotés.',
      storyContext:
        'Tu as récupéré cette liasse chaude et tu cherches à t’en débarrasser avant le contrôle.',
    },
    step2: {
      castId: 'c021',
      gender: 'm',
      name: 'Marek',
      age: 50,
      faction: 'Docks du Nord',
      archetype: 'Courtier de nuit, froid et pressé',
      itemName: 'Liasse de 20 000 € en coupures neuves',
      category: 'Joaillerie',
      surfaceDesc: 'Sacoche de billets usagés et froissés, impossibles à tracer.',
      hiddenClue: 'Il rachète les liasses numérotées pour les expédier hors frontière.',
      uvClue: 'Sous UV : billets propres de petite coupure.',
      clueTag: 'Blanchisseur du Port',
      openingWithItem:
        'On m’a soufflé que tu avais une liasse en coupures neuves qui se suivent. Je la reprends pour le fret maritime et je te pose 7 000 $ propres sur la table.',
      openingWithoutItem:
        'Tu as vraiment écoulé cette liasse numérotée ? Dommage, je t’en donnais 7 000 $ en billets propres ce soir.',
      openingTell: 'Il ajuste ses lunettes et tapote sa sacoche.',
      baseAsked: 2600,
      baseFloor: 1300,
      baseStreet: 3200,
      rewardCash: 7000,
      rewardHeatDelta: -10,
      resolutionText:
        'Marek expédie les billets marqués sur un cargo : +7 000 $ propres (-10 % Heat).',
      policeRadioBrief: 'Radio : piste des billets perdue au port.',
      storyContext:
        'Tu es blanchisseur sur les docks et tu cherches la Liasse en coupures neuves.',
    },
  },
];

export function buildArcStep1Case(
  arc: StoryArc,
  districtMultiplier = 1,
  locale: Locale = 'fr',
): ProceduralCase {
  const s = arc.step1;
  const initialPrice = Math.round((s.baseAsked * districtMultiplier) / 50) * 50;
  const floorPrice = Math.round((s.baseFloor * districtMultiplier) / 50) * 50;
  const streetValue = Math.round((s.baseStreet * districtMultiplier) / 50) * 50;
  const langRule = GAME_UI[locale].langPromptDirective;
  const loc = (x: string) => localizeArcText(x, locale);

  return {
    id: `arc-${arc.id}-1-${Date.now()}`,
    castId: s.castId,
    gender: s.gender ?? getGenderFromName(s.name),
    isTrap: false,
    name: s.name,
    age: s.age,
    faction: s.faction,
    archetype: loc(s.archetype),
    openingLine: loc(s.openingLine),
    openingTell: loc(s.openingTell),
    initialPrice,
    floorPrice,
    streetValue,
    initialGauges: { peur: 25, colere: 18, mefiance: 60 },
    item: {
      name: s.itemName,
      category: s.category,
      surfaceDesc: loc(s.surfaceDesc),
      hiddenClue: loc(s.hiddenClue),
      uvClue: loc(s.uvClue),
      clueTag: s.clueTag,
      hotLevel: 'BRÛLANT',
    },
    policeRadioBrief: loc(s.policeRadioBrief),
    arcId: arc.id,
    arcStep: 1,
    arcTitle: arc.title,
    arcItemKey: arc.itemKey,
    arcClueNote: loc(arc.clueNote),
    systemPrompt: `You are ${s.name}, ${s.age} years old, ${s.archetype}, tied to ${s.faction}.
STORY ARC CONTEXT (${arc.title} — Act 1): ${s.storyContext}
You want to sell: ${s.itemName}. Asking price: $${initialPrice}, bottom floor: $${floorPrice}.
Secret tell/flaw: ${s.hiddenClue}.
${langRule}
If the player pressures your secret or puts down clean cash, lower your price and increase fear. Never break character.`,
  };
}

export function buildArcStep2Case(
  arc: StoryArc,
  hasRequiredItem: boolean,
  districtMultiplier = 1,
  locale: Locale = 'fr',
): ProceduralCase {
  const s = arc.step2;
  const initialPrice = Math.round((s.baseAsked * districtMultiplier) / 50) * 50;
  const floorPrice = Math.round((s.baseFloor * districtMultiplier) / 50) * 50;
  const streetValue = Math.round((s.baseStreet * districtMultiplier) / 50) * 50;
  const rewardCash = Math.round((s.rewardCash * districtMultiplier) / 50) * 50;
  const langRule = GAME_UI[locale].langPromptDirective;
  const loc = (x: string) => localizeArcText(x, locale);

  return {
    id: `arc-${arc.id}-2-${Date.now()}`,
    castId: s.castId,
    gender: s.gender ?? getGenderFromName(s.name),
    isTrap: false,
    name: s.name,
    age: s.age,
    faction: s.faction,
    archetype: loc(s.archetype),
    openingLine: loc(hasRequiredItem ? s.openingWithItem : s.openingWithoutItem),
    openingTell: loc(s.openingTell),
    initialPrice,
    floorPrice,
    streetValue,
    initialGauges: { peur: 12, colere: hasRequiredItem ? 15 : 40, mefiance: 50 },
    item: {
      name: s.itemName,
      category: s.category,
      surfaceDesc: loc(s.surfaceDesc),
      hiddenClue: loc(s.hiddenClue),
      uvClue: loc(s.uvClue),
      clueTag: s.clueTag,
      hotLevel: 'TIÈDE',
    },
    policeRadioBrief: loc(s.policeRadioBrief),
    arcId: arc.id,
    arcStep: 2,
    arcTitle: arc.title,
    requiresItemKey: arc.itemKey,
    arcRewardCash: rewardCash,
    arcRewardHeat: s.rewardHeatDelta,
    arcResolution: loc(s.resolutionText),
    systemPrompt: `You are ${s.name}, ${s.age} years old, ${s.archetype}, tied to ${s.faction}.
STORY ARC CONTEXT (${arc.title} — Act 2 / Climax): ${s.storyContext}
The player ${hasRequiredItem ? 'STILL HAS the piece on their shelf and can deliver it for $' + rewardCash : 'ALREADY SOLD the item elsewhere (cold trail)'}.
${langRule}
If the player closes the deal or presses your leverage, lower your asking price. Never break character.`,
  };
}
