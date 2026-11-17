import type { Locale } from './seoContent';

export interface GameUiCopy {
  day: string;
  cash: string;
  tabCounter: string;
  tabVault: string;
  tabEmpire: string;
  tabPantheon: string;
  askingHe: string;
  askingShe: string;
  fear: string;
  anger: string;
  suspicion: string;
  shelf: string;
  vaultArrow: string;
  emptyShelf: string;
  loupe: string;
  loupeOff: string;
  uv: string;
  uvOff: string;
  radio: string;
  pass: string;
  expose: string;
  offerBtn: string;
  inputPlaceholder: string;
  accountGoogle: string;
  nextClient: string;
  ranks: [string, string, string, string];
  langPromptDirective: string;

  // Header & Drawer
  logout: string;
  aiSettings: string;
  soundOn: string;
  soundOff: string;
  engineLabel: string;
  serverKeyNote: string;
  saveBtn: string;
  debugLabel: string;
  resetGame: string;

  // Vault / Night Tab
  backroomNight: (day: number) => string;
  syndicateLedger: string;
  taxSub: (rentShare: string, auctions: number) => string;
  eventLabel: string;
  raidAlert: string;
  payRentBtn: (rent: string, nextDay: number) => string;
  swissBankTitle: (amt: string) => string;
  swissBankDesc: string;
  withdrawSwiss: string;
  transfer500: string;
  transfer1500: string;
  tacticalUsage: string;
  burnPassport: string;
  callContact: string;
  burnPassportNote: string;
  callContactNote: (discount: string) => string;
  vaultTitle: (count: number) => string;
  vaultEmpty: string;
  paidLabel: (paid: string) => string;
  modGps: string;
  modCollection: string;
  modCounterfeit: string;
  cleanedBadge: string;
  cleanBtn: string;
  fastSellBtn: (amt: string) => string;
  auctionBtn: (amt: string) => string;
  arcsTitle: (solved: number, total: number) => string;

  // Empire / Shop Tab
  arsenalTag: string;
  arsenalTitle: string;
  arsenalDesc: string;
  upgrades: {
    uvLamp: { title: string; desc: string };
    armoredDoor: { title: string; desc: string };
    gpsJammer: { title: string; desc: string };
  };
  equipped: string;
  buyUpgrade: (cost: string) => string;
  empireTag: string;
  empireTitle: string;
  empireDesc: string;
  swissBalance: (amt: string) => string;
  cityAssets: Record<string, { name: string; tag: string; desc: string }>;
  assetOwned: string;
  buyAsset: (cost: string) => string;
  districts: Record<string, { name: string; desc: string }>;
  districtActive: string;
  districtOpen: string;
  districtRequired: (cost: string) => string;

  // Pantheon Tab
  seasonDays: (seasonNum: number, days: number) => string;
  seasonLevel: string;
  tierLabel: (lvl: number) => string;
  tierActive: string;
  tierLocked: string;
  dailyQuestsTitle: string;
  questValidated: string;
  loginStreakDay: (day: number) => string;
  achievementsTitle: string;
  campaignTitle: (completed: number, total: number) => string;
  campaignSub: string;
  seasonTag: (seasonNum: number, cast: string) => string;
  completedBadge: string;
  launchEpisodeBtn: string;
  factionsTitle: string;
  factionsDesc: string;
  factionLeader: string;
  rivalsTitle: string;
  playerLabel: string;
  playerCounter: string;
  codexTitle: string;
  codexDesc: string;
  codexPieces: (found: number, total: number) => string;
  codexPerk: string;
  codexUndiscovered: string;
  codexNotYetFound: string;
  historyTitle: string;
  historyEntries: (n: number) => string;
  historyEmpty: string;
  dayShort: string;
  factionRanks: {
    hit: string;
    hostile: string;
    neutral: string;
    affiliated: string;
    ally: string;
  };
  dailyQuests: Record<string, { title: string; desc: string }>;
  achievements: Record<string, { title: string; desc: string }>;
  jokers: Record<string, { name: string; tag: string; desc: string }>;

  // Counter & Modals
  slapCash: string;
  cashEmpty: string;
  phantomBuyout: (n: number) => string;
  chip20: (amt: string) => string;
  chip20Msg: (amt: string) => string;
  chipPressure: string;
  chipPressureMsg: string;
  chipFlaw: string;
  chipBluff: string;
  chipFlawMsg: (hint: string) => string;
  chipBluffMsg: string;
  clueGrill: string;
  flawLabel: string;
  redLineLabel: string;
  arcTrack: (step: number, title: string) => string;
  arcDeliver: (reward: string) => string;
  arcClose: string;
  dailyContractHeader: string;
  dailyStreakBonus: (days: number, amt: number) => string;
  dailyReminderBtn: string;
  dailyHide7d: string;
  dailyShow7d: string;
  briefStep3: string;
  briefStep2: string;
  briefStep1: string;
  briefDesc3: string;
  briefDesc2: string;
  briefDesc1: string;
  stampSealed: string;
  stampTrap: string;
  stampHoldup: string;
  stampWalkout: string;
  counterNotebook: string;
  confidential: string;
  lookoutAlert: string;
  outcomeDeal: (name: string, margin: string) => string;
  outcomeGunArmored: string;
  outcomeGunStolen: (name: string) => string;
  outcomeWalked: (name: string) => string;
  toNight: string;
  quickSellDirect: (amt: string) => string;
  dailyPublish: (margin: string) => string;
  dailyPseudoPlaceholder: string;
  shareBtn: string;
  copiedBtn: string;
  freeAccess: string;
  passActive30d: string;
  getPass: string;
  redirecting: string;
  vaultSellBtn: string;
  gameOverCurtain: (day: number) => string;
  gameOverProfit: (profit: string, rank: string) => string;
  gameOverSwiss: (amt: string, count: number) => string;
  gameOverReopen: (cost: string, cash: string) => string;
  gameOverAscend: (roman: string) => string;
  gameOverReset: string;
  jokerDraftTax: (day: number) => string;
  jokerDraftTitle: string;
  jokerDraftDesc: string;
  jokerDraftActivate: string;
}

export function formatMoney(amt: number, loc: Locale): string {
  const code = loc === 'fr' ? 'fr-FR' : loc === 'es' ? 'es-ES' : 'en-US';
  return Math.round(amt).toLocaleString(code).replace(/[\u202f\u00a0]/g, ' ');
}

export const GAME_UI: Record<Locale, GameUiCopy> = {
  fr: {
    day: 'JOUR',
    cash: 'Caisse',
    tabCounter: 'Comptoir',
    tabVault: 'Coffre',
    tabEmpire: 'Empire',
    tabPantheon: 'Panthéon',
    askingHe: 'Il en veut',
    askingShe: 'Elle en veut',
    fear: 'PEUR',
    anger: 'COLÈRE',
    suspicion: 'MÉFIANCE',
    shelf: 'Étagère',
    vaultArrow: '· Coffre →',
    emptyShelf: 'Vide pour l’instant',
    loupe: 'Loupe',
    loupeOff: 'Loupe HS',
    uv: 'UV',
    uvOff: 'UV HS',
    radio: 'Radio',
    pass: 'Refuser',
    expose: 'Virer (Infiltré !)',
    offerBtn: 'Offrir',
    inputPlaceholder: 'Négocie, bluffe ou cite un indice...',
    accountGoogle: 'Compte Google',
    nextClient: 'Client suivant →',
    ranks: ['Fourmi de Quartier', 'Receleur Confirmé', 'Courtier de l’Ombre', 'Parrain du Marché Noir'],
    langPromptDirective: 'Réponds STRICTEMENT en français parlé sec et réaliste.',

    logout: 'Se déconnecter',
    aiSettings: 'Réglages IA & Clé',
    soundOn: 'Activer le son',
    soundOff: 'Couper le son',
    engineLabel: 'Moteur IA',
    serverKeyNote: 'Clés Gemini/Groq stockées uniquement dans .env.local côté serveur — aucune clé ne transite par le navigateur.',
    saveBtn: 'Enregistrer',
    debugLabel: 'Debug',
    resetGame: 'Réinitialiser ma partie',

    backroomNight: (d) => `ARRIÈRE-BOUTIQUE · NUIT ${d}`,
    syndicateLedger: 'REGISTRE & TAXE DU SYNDICAT',
    taxSub: (rentShare, auctions) =>
      `Taxe : 300 $ + 350 $/j + impôt progressif sur le cash (8 % → 25 %) (${rentShare} $)` +
      (auctions > 0 ? ` · ${auctions} enchère(s) ce soir` : ''),
    eventLabel: 'ÉVÉNEMENT',
    raidAlert: 'ALERTE RAID : la police passe cette nuit (saisie + 30 % caisse).',
    payRentBtn: (rent, next) => `Payer ${rent} $ & Jour ${next} →`,
    swissBankTitle: (amt) => `Compte Suisse · ${amt} $ protégés à vie`,
    swissBankDesc: '10 % de frais de blanchiment. Survit aux saisies et faillites.',
    withdrawSwiss: 'Retirer 500 $ → Caisse',
    transfer500: 'Virer 500 $ (+450 $)',
    transfer1500: 'Virer 1 500 $ (+1 350 $)',
    tacticalUsage: 'Usage tactique de ton stock (consomme la pièce) :',
    burnPassport: 'Griller le Passeport (Heat → 15 %)',
    callContact: 'Appeler le contact (Taxe -40 %)',
    burnPassportNote: 'Passeport brûlé : identité changée, Heat retombé à 15 %.',
    callContactNote: (disc) => `Contact parlementaire activé : +${disc} $ d’allègement sur la taxe.`,
    vaultTitle: (c) => `Étagère & Coffre (${c})`,
    vaultEmpty: 'Aucune pièce en réserve.',
    paidLabel: (p) => `Payé ${p} $`,
    modGps: 'Traceur GPS · +12 % Heat/nuit',
    modCollection: 'Pièce de collection · ×1,35',
    modCounterfeit: 'Contrefaçon · 40 % de la valeur',
    cleanedBadge: 'BLANCHI',
    cleanBtn: 'Nettoyer (-250 $)',
    fastSellBtn: (amt) => `Vente rapide (+${amt} $)`,
    auctionBtn: (amt) => `Enchères (+${amt} $)`,
    arcsTitle: (s, tot) => `Pistes & Énigmes · ${s}/${tot} bouclées`,

    arsenalTag: 'ARSENAL · COMPTOIR',
    arsenalTitle: 'MATÉRIEL DE RECELEUR',
    arsenalDesc: 'Leviers psychologiques et blindage pour survivre aux factions.',
    upgrades: {
      uvLamp: {
        title: 'Lampe UV Médico-Légale',
        desc: 'Révèle les traces invisibles (sang lavé, encre bancaire). Fait exploser la peur du client.',
      },
      armoredDoor: {
        title: 'Comptoir & Porte Blindée',
        desc: 'Pare les balles si un client dégaine son arme : zéro perte de cash en cas de braquage.',
      },
      gpsJammer: {
        title: 'Brouilleur GPS Militaire',
        desc: 'Divise par 2 la montée du Heat de la ville quand tu achètes des pièces brûlantes.',
      },
    },
    equipped: 'Équipé',
    buyUpgrade: (cost) => `Acheter · ${cost} $`,
    empireTag: 'BLANCHIMENT · PERMANENT',
    empireTitle: 'EMPIRE & ACTIFS DE LA VILLE',
    empireDesc: 'Achetés avec ton Compte Suisse (conservés même après faillite).',
    swissBalance: (amt) => `Suisse : ${amt} $`,
    cityAssets: {
      lookout: {
        name: 'Guetteur de Rue',
        tag: 'ANTI-PIÈGE',
        desc: 'Te prévient dès qu’un client entrant est un infiltré ou un piège.',
      },
      nightbar: {
        name: 'Bar de Nuit',
        tag: '+600 $/NUIT',
        desc: 'Blanchit +600 $ passifs chaque nuit et réduit le Heat de 5 %.',
      },
      warehouse: {
        name: 'Entrepôt des Docks',
        tag: '+35% ENCHÈRES',
        desc: 'Ouvre les Enchères Internationales (+35 % sur toutes tes reventes aux enchères).',
      },
    },
    assetOwned: 'Actif possédé',
    buyAsset: (cost) => `Acquérir · ${cost} $ Suisse`,
    districts: {
      docks: {
        name: 'Ruelle des Docks',
        desc: 'Quartier de départ · Pièces de 3k à 8k $.',
      },
      finance: {
        name: 'Centre Financier',
        desc: 'Cols blancs & secrets industriels · Enjeux ×2,5.',
      },
      politics: {
        name: 'Cercle Politique',
        desc: 'Dossiers d’État & chantage haut niveau · Enjeux ×6.',
      },
    },
    districtActive: 'ACTIF',
    districtOpen: 'OUVRIR',
    districtRequired: (cost) => `Requis: ${cost} $`,

    seasonDays: (s, d) => `Saison ${s} · ${d}j restants`,
    seasonLevel: 'NIVEAU',
    tierLabel: (l) => `PALIER ${l}`,
    tierActive: 'ACTIF',
    tierLocked: 'VERROUILLÉ',
    dailyQuestsTitle: 'Missions du Jour & Quêtes',
    questValidated: 'VALIDÉE',
    loginStreakDay: (d) => `JOUR ${d}`,
    achievementsTitle: 'Hauts-Faits de Carrière',
    campaignTitle: (c, tot) => `Campagne Épisodique · Dossiers de Saison (${c}/${tot})`,
    campaignSub: 'Saisons 1 à 3 · Récompenses XP & Reliques Codex',
    seasonTag: (s, cast) => `SAISON ${s} · ${cast}`,
    completedBadge: 'BOUCLÉ',
    launchEpisodeBtn: 'Lancer cet épisode au comptoir →',
    factionsTitle: 'Réputation des 5 Syndicats',
    factionsDesc: 'Aider un syndicat braque son rival. Allié = prix réduits ; Hostile = braquages.',
    factionLeader: 'Chef',
    rivalsTitle: 'Receleurs Rivaux & Cours du Soir',
    playerLabel: 'Toi (La Boutique)',
    playerCounter: 'Ton Comptoir',
    codexTitle: 'Codex du Receleur — Musée Permanent',
    codexDesc: 'Chaque pièce rare achetée reste gravée ici. Complète une série pour débloquer son atout permanent.',
    codexPieces: (f, tot) => `${f} / ${tot} PIÈCES`,
    codexPerk: 'Atout',
    codexUndiscovered: '??? (Non découverte)',
    codexNotYetFound: 'Pièce non encore achetée',
    historyTitle: 'Historique des Opérations',
    historyEntries: (n) => `${n} entrée(s)`,
    historyEmpty: 'Aucune opération enregistrée sur ce profil pour l’instant.',
    dayShort: 'J',
    factionRanks: {
      hit: 'Contrat sur ta tête',
      hostile: 'Hostile',
      neutral: 'Neutre',
      affiliated: 'Affilié',
      ally: 'Allié d’Honneur',
    },
    dailyQuests: {
      deals: { title: 'Négociateur Impitoyable', desc: 'Conclure 2 rachats au comptoir aujourd’hui' },
      traps: { title: 'Chasseur de Taupes', desc: 'Démasquer 1 agent infiltré avant de payer' },
      auctions: { title: 'Salle des Ventes', desc: 'Vendre 2 pièces aux enchères de nuit' },
      swiss: { title: 'Blanchiment Express', desc: 'Transférer 1 000 $ vers la Suisse' },
      bargains: { title: 'Casser les Prix', desc: 'Acheter une pièce à −45 % ou moins du prix demandé' },
    },
    achievements: {
      first_deal: { title: 'Premier Butin', desc: 'Conclure son premier deal au comptoir' },
      first_trap_busted: { title: 'Flair de la Rue', desc: 'Démasquer un agent sous couverture' },
      swiss_unlocked: { title: 'Compte Numéroté', desc: 'Effectuer son premier virement suisse' },
      first_auction: { title: 'Marteau de Minuit', desc: 'Vendre une pièce aux enchères nocturnes' },
      heat_survivor: { title: 'Invisible', desc: 'Survivre à un raid de police sans saisie' },
      ascended: { title: 'Parrain Éternel', desc: 'Terminer une Ascension et relancer un empire' },
    },
    jokers: {
      blanchisseur: { name: 'Blanchisseur Suisse', tag: 'x1.4 ENCHÈRES', desc: 'Les pièces nettoyées se revendent x1.4 aux Enchères Noires.' },
      'oeil-lynx': { name: 'Œil de Lynx', tag: 'COMBO x1.5', desc: 'Tout achat sous 30 % de la valeur rue ajoute +25 % de marge à la revente.' },
      'sang-froid': { name: 'Sang-Froid', tag: '+15% PAR INDICE', desc: 'Passer la loupe ou la lampe UV ajoute +15 % de prime à la revente.' },
      intimidation: { name: 'Aura de Parrain', tag: '+15 PEUR DÉPART', desc: 'Les clients entrent déjà intimidés (+15 Peur initiale).' },
      assurance: { name: 'Flics dans la Poche', tag: '-10% HEAT / NUIT', desc: 'Le Heat de la ville redescend automatiquement de 10 % chaque nuit.' },
      vautour: { name: 'Vautour de Nuit', tag: '+150 $ SUR FUITE', desc: 'Si un client claque la porte, tu revends sa localisation (+150 $).' },
      'a-l-aveugle': { name: 'À l’Aveugle', tag: 'REVENTES ×1,6', desc: 'Loupe et lampe UV hors service pour toute la partie. Toutes tes reventes font ×1,6.' },
      'vitrine-armee': { name: 'Vitrine Armée', tag: '+15 PEUR / ARME', desc: 'Chaque arme au coffre ajoute +15 de Peur au client dès son entrée.' },
      'blanchisseur-express': { name: 'Blanchisseur Express', tag: 'NETTOYAGE 0 $ · LOYER +10 %', desc: 'Nettoyage des pièces gratuit, mais taxe syndicat +10 %.' },
      'marcheur-ombre': { name: 'Marcheur de l’Ombre', tag: 'HEAT RAID 90%', desc: 'Le raid de police ne se déclenche qu’à 90 % de Heat au lieu de 75 %.' },
      radar: { name: 'Radar à Pièges', tag: 'DÉTECTION PIÈGE', desc: "Les pièges subtils sont détectés par la Loupe (pas besoin d'UV)." },
      negociateur: { name: 'Négociateur Né', tag: '-10 % PRIX INITIAL', desc: 'Les clients commencent systématiquement 10 % moins cher.' },
      reseau: { name: 'Réseau de Clôtures', tag: '+1 ENCHÈRE/NUIT', desc: 'Tu peux faire une enchère de plus par nuit sans pénalité de saturation.' },
      fantome: { name: 'Fantôme du Quartier', tag: '-5 HEAT/DEAL', desc: 'Chaque deal conclu génère 5 % de Heat en moins.' },
      collectionneur: { name: 'Œil du Collectionneur', tag: 'DÉTECTE CONTREFAÇON', desc: "Les contrefaçons sont marquées dès l'ouverture (avant Loupe/UV)." },
      'double-fond': { name: 'Double Fond', tag: '2 PIÈCES PROTÉGÉES', desc: 'En cas de saisie policière, 2 pièces du coffre sont planquées dans le double fond.' },
    },

    slapCash: 'Claquer Cash',
    cashEmpty: 'Caisse vide',
    phantomBuyout: (n) => `Rachat en bloc (${n})`,
    chip20: (amt) => `-20% (${amt} $)`,
    chip20Msg: (amt) => `Je te pose ${amt} $ cash tout de suite, à prendre ou à laisser.`,
    chipPressure: 'Mettre la pression',
    chipPressureMsg: 'La patrouille tourne dans la rue. Si tu sors avec ça sous le bras, t’es coffré.',
    chipFlaw: 'Exploiter la faille',
    chipBluff: 'Bluffer valeur',
    chipFlawMsg: (h) => `Arrête ton cinéma : ${h} Baisse ton tarif.`,
    chipBluffMsg: 'C’est invendable en l’état, personne ne mettra ce prix-là.',
    clueGrill: 'Cuisiner',
    flawLabel: 'Faille :',
    redLineLabel: 'Ligne rouge :',
    arcTrack: (step, title) => `Piste ${step}/2 · ${title}`,
    arcDeliver: (reward) => `Livrer la pièce (+${reward} $)`,
    arcClose: 'Pièce vendue · Clore la piste',
    dailyContractHeader: 'CONTRAT DU JOUR',
    dailyStreakBonus: (days, amt) => `Série : ${days} j (+${amt} $ départ)`,
    dailyReminderBtn: 'Activer rappel Contrat 24h',
    dailyHide7d: '▾ Masquer 7j',
    dailyShow7d: '▸ Records 7 jours',
    briefStep3: '3/3 · Revends au coffre : ',
    briefStep2: '2/3 · Fais-le craquer : ',
    briefStep1: '1/3 · Inspecte la pièce : ',
    briefDesc3: 'Passe à l’onglet Coffre pour blanchir ou mettre aux enchères. N’oublie pas le loyer du soir, affiché en haut.',
    briefDesc2: 'Utilise "Cuisiner" dans ton carnet ou claque une offre cash.',
    briefDesc1: 'Clique sur l’objet posé sur le comptoir ou sur la Loupe.',
    stampSealed: 'CONCLU',
    stampTrap: 'PIÈGE !',
    stampHoldup: 'BRAQUAGE',
    stampWalkout: 'CLAQUÉ',
    counterNotebook: 'Carnet de Comptoir',
    confidential: 'Confidentiel',
    lookoutAlert: '[GUETTEUR] Oreillette repérée sous son col.',
    outcomeDeal: (name, margin) => `${name} a accepté l’offre ! (+${margin} $ marge)`,
    outcomeGunArmored: 'Braquage stoppé par ta porte blindée !',
    outcomeGunStolen: (name) => `${name} a dégainé ! (-600 $ volés)`,
    outcomeWalked: (name) => `${name} est parti.`,
    toNight: 'Vers la nuit',
    quickSellDirect: (amt) => `Revendre direct (+${amt} $)`,
    dailyPublish: (margin) => `Publier (+${margin} $)`,
    dailyPseudoPlaceholder: 'Ton pseudo',
    shareBtn: 'Partager',
    copiedBtn: 'Copié ✓',
    freeAccess: 'Accès libre',
    passActive30d: 'Pass actif · 30 j',
    getPass: 'Obtenir le Pass',
    redirecting: 'Redirection…',
    vaultSellBtn: 'Coffre & Revente',
    gameOverCurtain: (d) => `Rideau baissé · Jour ${d}`,
    gameOverProfit: (profit, rank) => `Profit cumulé : ${profit} $ · Rang : ${rank}`,
    gameOverSwiss: (amt, count) => `Compte Suisse préservé : ${amt} $ · Actifs : ${count}/3`,
    gameOverReopen: (cost, cash) => `Rouvrir avec ton réseau suisse (−${cost} $ Suisse → ${cash} $ caisse)`,
    gameOverAscend: (roman) => `Ascension ${roman} — Nouvelle difficulté`,
    gameOverReset: 'Tout effacer & Recommencer à zéro',
    jokerDraftTax: (d) => `Taxe payée · Jour ${d} survécu`,
    jokerDraftTitle: 'Choisis un Atout du Syndicat',
    jokerDraftDesc: 'Ces bonus s’empilent sur toute ta partie pour casser le marché noir.',
    jokerDraftActivate: 'Activer cet atout →',
  },

  en: {
    day: 'DAY',
    cash: 'Cash',
    tabCounter: 'Counter',
    tabVault: 'Vault',
    tabEmpire: 'Empire',
    tabPantheon: 'Pantheon',
    askingHe: 'He wants',
    askingShe: 'She wants',
    fear: 'FEAR',
    anger: 'ANGER',
    suspicion: 'SUSPICION',
    shelf: 'Shelf',
    vaultArrow: '· Vault →',
    emptyShelf: 'Empty for now',
    loupe: 'Magnifier',
    loupeOff: 'Magnifier Down',
    uv: 'UV',
    uvOff: 'UV Down',
    radio: 'Radio',
    pass: 'Pass',
    expose: 'Expose Mole',
    offerBtn: 'Offer',
    inputPlaceholder: 'Negotiate, bluff, or drop a clue...',
    accountGoogle: 'Google Sign-In',
    nextClient: 'Next client →',
    ranks: ['Street Ant', 'Night Fence', 'Shadow Broker', 'Black-Market Baron'],
    langPromptDirective:
      'LANGUAGE OVERRIDE: You MUST respond STRICTLY in gritty, natural spoken English (street noir, short sentences). Translate your persona, opening tension, and micro-tell into English.',

    logout: 'Log out',
    aiSettings: 'AI Engine & Key Settings',
    soundOn: 'Unmute',
    soundOff: 'Mute',
    engineLabel: 'AI Engine',
    serverKeyNote: 'Gemini/Groq keys stored strictly in server-side .env.local — zero keys ever exposed to client browser.',
    saveBtn: 'Save',
    debugLabel: 'Debug',
    resetGame: 'Reset my game',

    backroomNight: (d) => `BACKROOM · NIGHT ${d}`,
    syndicateLedger: 'SYNDICATE LEDGER & TAX',
    taxSub: (rentShare, auctions) =>
      `Tax: $300 + $350/day + progressive tax on cash (8% → 25%) ($${rentShare})` +
      (auctions > 0 ? ` · ${auctions} auction(s) tonight` : ''),
    eventLabel: 'EVENT',
    raidAlert: 'RAID ALERT: Police patrol tonight (seizure + 30% cash cut).',
    payRentBtn: (rent, next) => `Pay $${rent} & Day ${next} →`,
    swissBankTitle: (amt) => `Swiss Account · $${amt} secured for life`,
    swissBankDesc: '10% laundering fee. Survives police raids and bankruptcies.',
    withdrawSwiss: 'Withdraw $500 → Cash',
    transfer500: 'Transfer $500 (+$450)',
    transfer1500: 'Transfer $1,500 (+$1,350)',
    tacticalUsage: 'Tactical inventory usage (consumes item):',
    burnPassport: 'Burn Passport (Heat → 15%)',
    callContact: 'Call Contact (Tax -40%)',
    burnPassportNote: 'Passport incinerated: identity changed, City Heat dropped to 15%.',
    callContactNote: (disc) => `Parliamentary contact dialed: +$${disc} tax relief granted.`,
    vaultTitle: (c) => `Shelf & Vault (${c})`,
    vaultEmpty: 'No items in reserve.',
    paidLabel: (p) => `Paid $${p}`,
    modGps: 'GPS Tracker · +12% Heat/night',
    modCollection: 'Collector Piece · ×1.35',
    modCounterfeit: 'Counterfeit · 40% street value',
    cleanedBadge: 'CLEANED',
    cleanBtn: 'Clean (-$250)',
    fastSellBtn: (amt) => `Quick flip (+$${amt})`,
    auctionBtn: (amt) => `Auction (+$${amt})`,
    arcsTitle: (s, tot) => `Cases & Clues · ${s}/${tot} solved`,

    arsenalTag: 'ARSENAL · COUNTER',
    arsenalTitle: 'FENCE GEAR & HARDENING',
    arsenalDesc: 'Psychological leverage and ballistics to survive syndicate pressure.',
    upgrades: {
      uvLamp: {
        title: 'Forensic UV Lamp',
        desc: 'Reveals invisible traces (washed blood, bank dyes). Sends client fear skyrocketing.',
      },
      armoredDoor: {
        title: 'Reinforced Counter & Armored Door',
        desc: 'Stops bullets if a client draws a weapon: zero cash lost during a robbery.',
      },
      gpsJammer: {
        title: 'Military GPS Jammer',
        desc: 'Halves City Heat escalation when buying hot or tracked merchandise.',
      },
    },
    equipped: 'Equipped',
    buyUpgrade: (cost) => `Buy · $${cost}`,
    empireTag: 'LAUNDERING · PERMANENT',
    empireTitle: 'EMPIRE & CITY ASSETS',
    empireDesc: 'Acquired with Swiss Account (retained even after bankruptcy).',
    swissBalance: (amt) => `Swiss: $${amt}`,
    cityAssets: {
      lookout: {
        name: 'Street Lookout',
        tag: 'ANTI-TRAP',
        desc: 'Warns you whenever an incoming client is an undercover mole or sting.',
      },
      nightbar: {
        name: 'Night Bar',
        tag: '+$600/NIGHT',
        desc: 'Launders +$600 passive cash every night and cools down City Heat by 5%.',
      },
      warehouse: {
        name: 'Docks Warehouse',
        tag: '+35% AUCTIONS',
        desc: 'Unlocks International Black-Market Auctions (+35% on all auction flips).',
      },
    },
    assetOwned: 'Asset owned',
    buyAsset: (cost) => `Acquire · $${cost} Swiss`,
    districts: {
      docks: {
        name: 'Docks Back-Alley',
        desc: 'Starting district · Deals from $3k to $8k.',
      },
      finance: {
        name: 'Financial District',
        desc: 'White collars & corporate espionage · Stakes ×2.5.',
      },
      politics: {
        name: 'Political Inner Circle',
        desc: 'State files & high-level extortion · Stakes ×6.',
      },
    },
    districtActive: 'ACTIVE',
    districtOpen: 'OPEN',
    districtRequired: (cost) => `Requires: $${cost}`,

    seasonDays: (s, d) => `Season ${s} · ${d}d remaining`,
    seasonLevel: 'LEVEL',
    tierLabel: (l) => `TIER ${l}`,
    tierActive: 'ACTIVE',
    tierLocked: 'LOCKED',
    dailyQuestsTitle: 'Daily Ops & Bounties',
    questValidated: 'CLAIMED',
    loginStreakDay: (d) => `DAY ${d}`,
    achievementsTitle: 'Career Achievements',
    campaignTitle: (c, tot) => `Episodic Campaign · Season Case Files (${c}/${tot})`,
    campaignSub: 'Seasons 1 to 3 · XP Rewards & Codex Relics',
    seasonTag: (s, cast) => `SEASON ${s} · ${cast}`,
    completedBadge: 'CLEARED',
    launchEpisodeBtn: 'Launch this episode at the counter →',
    factionsTitle: '5 Syndicate Reputations',
    factionsDesc: 'Aiding one syndicate provokes its rival. Ally = reduced prices; Hostile = holdups.',
    factionLeader: 'Boss',
    rivalsTitle: 'Rival Fences & Evening Market Rates',
    playerLabel: 'You (The Fence)',
    playerCounter: 'Your Counter',
    codexTitle: 'Fence Codex — Permanent Museum',
    codexDesc: 'Every rare contraband bought is immortalized here. Complete a set to unlock its permanent syndicate perk.',
    codexPieces: (f, tot) => `${f} / ${tot} RELICS`,
    codexPerk: 'Perk',
    codexUndiscovered: '??? (Undiscovered)',
    codexNotYetFound: 'Relic not yet acquired',
    historyTitle: 'Operations Ledger',
    historyEntries: (n) => `${n} log entry(ies)`,
    historyEmpty: 'No operations logged on this profile yet.',
    dayShort: 'D',
    factionRanks: {
      hit: 'Hit on Your Head',
      hostile: 'Hostile',
      neutral: 'Neutral',
      affiliated: 'Affiliated',
      ally: 'Honorary Ally',
    },
    dailyQuests: {
      deals: { title: 'Ruthless Negotiator', desc: 'Close 2 counter deals today' },
      traps: { title: 'Mole Hunter', desc: 'Expose 1 undercover operative before paying' },
      auctions: { title: 'Auction Floor', desc: 'Sell 2 items in night auctions' },
      swiss: { title: 'Express Laundering', desc: 'Wire $1,000 into Swiss account' },
      bargains: { title: 'Hard Bargain', desc: 'Buy an item at 45% or more below asking price' },
    },
    achievements: {
      first_deal: { title: 'First Score', desc: 'Close your very first counter deal' },
      first_trap_busted: { title: 'Street Smarts', desc: 'Expose an undercover operative' },
      swiss_unlocked: { title: 'Numbered Account', desc: 'Make your first Swiss wire transfer' },
      first_auction: { title: 'Midnight Gavel', desc: 'Sell an item in a night auction' },
      heat_survivor: { title: 'Untouchable', desc: 'Survive a police raid with zero contraband seized' },
      ascended: { title: 'Eternal Baron', desc: 'Complete an Ascension run and reboot your empire' },
    },
    jokers: {
      blanchisseur: { name: 'Swiss Launderer', tag: '×1.4 AUCTIONS', desc: 'Cleaned items resell for ×1.4 in Black-Market Auctions.' },
      'oeil-lynx': { name: 'Lynx Eye', tag: 'COMBO ×1.5', desc: 'Any buy under 30% street value adds +25% margin on resell.' },
      'sang-froid': { name: 'Cold Blood', tag: '+15% PER CLUE', desc: 'Using loupe or UV adds +15% bonus margin to item resell.' },
      intimidation: { name: 'Baron Aura', tag: '+15 STARTING FEAR', desc: 'Clients enter already intimidated (+15 initial Fear).' },
      assurance: { name: 'Cops in Pocket', tag: '-10% HEAT / NIGHT', desc: 'City Heat cools down by 10% automatically each night.' },
      vautour: { name: 'Night Vulture', tag: '+$150 ON WALKOUT', desc: 'If a client storms out, you flip their location (+$150).' },
      'a-l-aveugle': { name: 'Flying Blind', tag: 'RESELLS ×1.6', desc: 'Loupe and UV lamp disabled all run. All resells boosted to ×1.6.' },
      'vitrine-armee': { name: 'Armed Display', tag: '+15 FEAR / WEAPON', desc: 'Every firearm in vault adds +15 Fear to clients upon arrival.' },
      'blanchisseur-express': { name: 'Express Cleaner', tag: 'CLEANING $0 · TAX +10%', desc: 'Item cleaning is free, but syndicate tax increases by 10%.' },
      'marcheur-ombre': { name: 'Shadow Walker', tag: 'RAID THRESHOLD 90%', desc: 'Police raids only trigger at 90% Heat instead of 75%.' },
      radar: { name: 'Trap Radar', tag: 'TRAP DETECTION', desc: 'Subtle traps are revealed with Loupe alone (no UV needed).' },
      negociateur: { name: 'Born Negotiator', tag: '-10% INITIAL PRICE', desc: 'Clients systematically start with 10% lower asking prices.' },
      reseau: { name: 'Fencing Network', tag: '+1 AUCTION/NIGHT', desc: 'Run one extra auction each night without market saturation penalties.' },
      fantome: { name: 'District Ghost', tag: '-5 HEAT/DEAL', desc: 'Every completed deal generates 5% less Heat.' },
      collectionneur: { name: "Collector's Eye", tag: 'SPOT FORGERIES', desc: 'Counterfeits are flagged immediately upon arrival (before Loupe/UV).' },
      'double-fond': { name: 'False Bottom', tag: '2 PROTECTED PIECES', desc: 'During police seizures, 2 pieces in your vault are stashed in a secret compartment.' },
    },

    slapCash: 'Slap Cash',
    cashEmpty: 'Out of cash',
    phantomBuyout: (n) => `Bulk Buyout (${n})`,
    chip20: (amt) => `-20% ($${amt})`,
    chip20Msg: (amt) => `I am putting $${amt} cash on the table right now, take it or walk.`,
    chipPressure: 'Turn up the heat',
    chipPressureMsg: 'Police patrols are cruising the block. Walk out with that in your hands and you are locked up.',
    chipFlaw: 'Exploit flaw',
    chipBluff: 'Bluff value',
    chipFlawMsg: (h) => `Cut the drama: ${h} Drop your price.`,
    chipBluffMsg: 'It is unsellable as-is, nobody on the street will touch it at that price.',
    clueGrill: 'Grill',
    flawLabel: 'Flaw:',
    redLineLabel: 'Red line:',
    arcTrack: (step, title) => `Case Lead ${step}/2 · ${title}`,
    arcDeliver: (reward) => `Deliver piece (+$${reward})`,
    arcClose: 'Item sold · Close lead',
    dailyContractHeader: 'DAILY CONTRACT',
    dailyStreakBonus: (days, amt) => `Streak: ${days} d (+$${amt} starting bonus)`,
    dailyReminderBtn: 'Enable 24h contract alert',
    dailyHide7d: '▾ Hide 7d',
    dailyShow7d: '▸ 7-Day Records',
    briefStep3: '3/3 · Flip in Vault: ',
    briefStep2: '2/3 · Break their bluff: ',
    briefStep1: '1/3 · Inspect contraband: ',
    briefDesc3: 'Head to the Vault tab to launder or auction on the black market. Don’t forget tonight’s rent, shown at the top.',
    briefDesc2: 'Use "Grill" from notebook or slap cash on the table.',
    briefDesc1: 'Click the item on the counter or activate the Loupe.',
    stampSealed: 'SEALED',
    stampTrap: 'TRAP!',
    stampHoldup: 'HOLDUP',
    stampWalkout: 'WALKOUT',
    counterNotebook: 'Counter Notebook',
    confidential: 'Confidential',
    lookoutAlert: '[LOOKOUT] Earpiece spotted beneath the collar.',
    outcomeDeal: (name, margin) => `${name} accepted the deal! (+$${margin} margin)`,
    outcomeGunArmored: 'Holdup deflected by your armored door!',
    outcomeGunStolen: (name) => `${name} pulled a gun! (-$600 stolen)`,
    outcomeWalked: (name) => `${name} walked out.`,
    toNight: 'To the night',
    quickSellDirect: (amt) => `Quick flip (+$${amt})`,
    dailyPublish: (margin) => `Publish (+$${margin})`,
    dailyPseudoPlaceholder: 'Your handle',
    shareBtn: 'Share',
    copiedBtn: 'Copied ✓',
    freeAccess: 'Free access',
    passActive30d: 'Pass active · 30 d',
    getPass: 'Get Season Pass',
    redirecting: 'Redirecting…',
    vaultSellBtn: 'Vault & Sell',
    gameOverCurtain: (d) => `Curtain Down · Day ${d}`,
    gameOverProfit: (profit, rank) => `Cumulative Profit: $${profit} · Rank: ${rank}`,
    gameOverSwiss: (amt, count) => `Protected Swiss Account: $${amt} · City Assets: ${count}/3`,
    gameOverReopen: (cost, cash) => `Reopen with Swiss network (-$${cost} Swiss → $${cash} cash)`,
    gameOverAscend: (roman) => `Ascension ${roman} — Higher Difficulty`,
    gameOverReset: 'Wipe all & Start from scratch',
    jokerDraftTax: (d) => `Tax paid · Day ${d} survived`,
    jokerDraftTitle: 'Pick a Syndicate Perk',
    jokerDraftDesc: 'These bonuses stack throughout your entire career to crack the black market.',
    jokerDraftActivate: 'Activate this perk →',
  },

  es: {
    day: 'DÍA',
    cash: 'Caja',
    tabCounter: 'Mostrador',
    tabVault: 'Bóveda',
    tabEmpire: 'Imperio',
    tabPantheon: 'Panteón',
    askingHe: 'Él pide',
    askingShe: 'Ella pide',
    fear: 'MIEDO',
    anger: 'IRA',
    suspicion: 'DESCONFIANZA',
    shelf: 'Estante',
    vaultArrow: '· Bóveda →',
    emptyShelf: 'Vacío por ahora',
    loupe: 'Lupa',
    loupeOff: 'Lupa Rota',
    uv: 'UV',
    uvOff: 'UV Rota',
    radio: 'Radio',
    pass: 'Rechazar',
    expose: 'Echar (Infiltrado)',
    offerBtn: 'Ofrecer',
    inputPlaceholder: 'Negocia, presiona o suelta una pista...',
    accountGoogle: 'Cuenta Google',
    nextClient: 'Siguiente cliente →',
    ranks: ['Hormiga de Barrio', 'Perista Nocturno', 'Corredor en la Sombra', 'Barón del Mercado Negro'],
    langPromptDirective:
      'LANGUAGE OVERRIDE: You MUST respond STRICTLY in gritty, natural spoken Spanish (cine negro, frases cortas). Translate your persona and micro-tell into Spanish.',

    logout: 'Cerrar sesión',
    aiSettings: 'Ajustes de IA y Claves',
    soundOn: 'Activar sonido',
    soundOff: 'Silenciar',
    engineLabel: 'Motor de IA',
    serverKeyNote: 'Claves Gemini/Groq guardadas solo en .env.local del servidor — ninguna clave viaja al navegador.',
    saveBtn: 'Guardar',
    debugLabel: 'Debug',
    resetGame: 'Reiniciar partida',

    backroomNight: (d) => `TRASHO TIENDA · NOCHE ${d}`,
    syndicateLedger: 'REGISTRO Y TRIBUTO DEL SINDICATO',
    taxSub: (rentShare, auctions) =>
      `Tributo: 300 $ + 350 $/día + impuesto progresivo sobre la caja (8 % → 25 %) (${rentShare} $)` +
      (auctions > 0 ? ` · ${auctions} subasta(s) esta noche` : ''),
    eventLabel: 'EVENTO',
    raidAlert: 'ALERTA REDADA: La policía pasa esta noche (confiscación + 30 % caja).',
    payRentBtn: (rent, next) => `Pagar ${rent} $ y Día ${next} →`,
    swissBankTitle: (amt) => `Cuenta Suiza · ${amt} $ protegidos de por vida`,
    swissBankDesc: '10 % tarifa de blanqueo. Sobrevive a redadas y quiebras.',
    withdrawSwiss: 'Retirar 500 $ → Caja',
    transfer500: 'Transferir 500 $ (+450 $)',
    transfer1500: 'Transferir 1 500 $ (+1 350 $)',
    tacticalUsage: 'Uso táctico del inventario (consume la pieza):',
    burnPassport: 'Quemar Pasaporte (Heat → 15 %)',
    callContact: 'Llamar al contacto (Tributo -40 %)',
    burnPassportNote: 'Pasaporte incinerado: identidad cambiada, Heat baja al 15 %.',
    callContactNote: (disc) => `Contacto parlamentario activado: +${disc} $ de alivio en el tributo.`,
    vaultTitle: (c) => `Estante y Bóveda (${c})`,
    vaultEmpty: 'Sin piezas en reserva.',
    paidLabel: (p) => `Pagado ${p} $`,
    modGps: 'Rastreador GPS · +12 % Heat/noche',
    modCollection: 'Pieza de Colección · ×1,35',
    modCounterfeit: 'Falsificación · 40 % del valor',
    cleanedBadge: 'LAVADO',
    cleanBtn: 'Limpiar (-250 $)',
    fastSellBtn: (amt) => `Venta rápida (+${amt} $)`,
    auctionBtn: (amt) => `Subasta (+${amt} $)`,
    arcsTitle: (s, tot) => `Casos y Pistas · ${s}/${tot} cerradas`,

    arsenalTag: 'ARSENAL · MOSTRADOR',
    arsenalTitle: 'EQUIPAMIENTO DE PERISTA',
    arsenalDesc: 'Palancas psicológicas y blindaje para resistir la presión de las facciones.',
    upgrades: {
      uvLamp: {
        title: 'Lámpara UV Forense',
        desc: 'Revela rastros invisibles (sangre lavada, tintas de seguridad). Dispara el miedo del cliente.',
      },
      armoredDoor: {
        title: 'Mostrador y Puerta Blindada',
        desc: 'Detiene las balas si un cliente saca un arma: cero pérdidas de dinero en atracos.',
      },
      gpsJammer: {
        title: 'Inhibidor GPS Militar',
        desc: 'Reduce a la mitad la subida de Heat al comprar contrabando caliente.',
      },
    },
    equipped: 'Equipado',
    buyUpgrade: (cost) => `Comprar · ${cost} $`,
    empireTag: 'BLANQUEO · PERMANENTE',
    empireTitle: 'IMPERIO Y ACTIVOS DE LA CIUDAD',
    empireDesc: 'Comprados con tu Cuenta Suiza (se conservan incluso tras la quiebra).',
    swissBalance: (amt) => `Suiza: ${amt} $`,
    cityAssets: {
      lookout: {
        name: 'Vigía Callejero',
        tag: 'ANTI-TRAMPA',
        desc: 'Te alerta en cuanto entra un infiltrado policial o una trampa.',
      },
      nightbar: {
        name: 'Bar Nocturno',
        tag: '+600 $/NOCHE',
        desc: 'Blanquea +600 $ pasivos cada noche y reduce el Heat un 5 %.',
      },
      warehouse: {
        name: 'Almacén de los Muelles',
        tag: '+35% SUBASTAS',
        desc: 'Abre las Subastas Internacionales (+35 % en todas las ventas en subasta).',
      },
    },
    assetOwned: 'Activo en propiedad',
    buyAsset: (cost) => `Adquirir · ${cost} $ Suiza`,
    districts: {
      docks: {
        name: 'Callejón de los Muelles',
        desc: 'Distrito de inicio · Piezas de 3k a 8k $.',
      },
      finance: {
        name: 'Centro Financiero',
        desc: 'Cuellos blancos y espionaje corporativo · Apuestas ×2,5.',
      },
      politics: {
        name: 'Círculo Político',
        desc: 'Secretos de Estado y extorsión al más alto nivel · Apuestas ×6.',
      },
    },
    districtActive: 'ACTIVO',
    districtOpen: 'ABRIR',
    districtRequired: (cost) => `Requiere: ${cost} $`,

    seasonDays: (s, d) => `Temporada ${s} · ${d}d restantes`,
    seasonLevel: 'NIVEL',
    tierLabel: (l) => `NIVEL ${l}`,
    tierActive: 'ACTIVO',
    tierLocked: 'BLOQUEADO',
    dailyQuestsTitle: 'Misiones Diarias y Recompensas',
    questValidated: 'VALIDADA',
    loginStreakDay: (d) => `DÍA ${d}`,
    achievementsTitle: 'Hazañas de Carrera',
    campaignTitle: (c, tot) => `Campaña Episódica · Expedientes de Temporada (${c}/${tot})`,
    campaignSub: 'Temporadas 1 a 3 · Recompensas de XP y Reliquias del Códice',
    seasonTag: (s, cast) => `TEMPORADA ${s} · ${cast}`,
    completedBadge: 'SUPERADO',
    launchEpisodeBtn: 'Iniciar este episodio en el mostrador →',
    factionsTitle: 'Reputación de los 5 Sindicatos',
    factionsDesc: 'Ayudar a un sindicato cabrea a su rival. Aliado = precios reducidos; Hostil = atracos.',
    factionLeader: 'Líder',
    rivalsTitle: 'Peristas Rivales y Mercado Nocturno',
    playerLabel: 'Tú (La Tienda)',
    playerCounter: 'Tu Mostrador',
    codexTitle: 'Códice del Perista — Museo Permanente',
    codexDesc: 'Cada pieza rara comprada queda grabada aquí. Completa una serie para desbloquear su ventaja permanente.',
    codexPieces: (f, tot) => `${f} / ${tot} RELIQUIAS`,
    codexPerk: 'Ventaja',
    codexUndiscovered: '??? (No descubierta)',
    codexNotYetFound: 'Pieza no descubierta aún',
    historyTitle: 'Historial de Operaciones',
    historyEntries: (n) => `${n} entrada(s)`,
    historyEmpty: 'Sin operaciones registradas en este perfil por ahora.',
    dayShort: 'D',
    factionRanks: {
      hit: 'Precio por tu cabeza',
      hostile: 'Hostil',
      neutral: 'Neutral',
      affiliated: 'Afiliado',
      ally: 'Aliado de Honor',
    },
    dailyQuests: {
      deals: { title: 'Negociador Implacable', desc: 'Cerrar 2 compras en el mostrador hoy' },
      traps: { title: 'Cazador de Topos', desc: 'Desenmascarar 1 agente infiltrado antes de pagar' },
      auctions: { title: 'Sala de Subastas', desc: 'Vender 2 piezas en subastas nocturnas' },
      swiss: { title: 'Blanqueo Exprés', desc: 'Transferir 1 000 $ a la cuenta suiza' },
      bargains: { title: 'Tirar Precios', desc: 'Comprar una pieza a −45 % o menos de lo pedido' },
    },
    achievements: {
      first_deal: { title: 'Primer Botín', desc: 'Cerrar tu primer trato en el mostrador' },
      first_trap_busted: { title: 'Olfato Callejero', desc: 'Desenmascarar a un agente encubierto' },
      swiss_unlocked: { title: 'Cuenta Numerada', desc: 'Hacer tu primera transferencia a Suiza' },
      first_auction: { title: 'Martillo de Medianoche', desc: 'Vender una pieza en subasta nocturna' },
      heat_survivor: { title: 'Intocable', desc: 'Sobrevivir a una redada policial sin decomisos' },
      ascended: { title: 'Barón Eterno', desc: 'Completar una Ascensión y reiniciar tu imperio' },
    },
    jokers: {
      blanchisseur: { name: 'Blanqueador Suizo', tag: '×1.4 SUBASTAS', desc: 'Las piezas lavadas se revenden ×1.4 en Subastas Negras.' },
      'oeil-lynx': { name: 'Ojo de Lince', tag: 'COMBO ×1.5', desc: 'Toda compra bajo el 30% del valor de calle añade +25% de margen.' },
      'sang-froid': { name: 'Sangre Fría', tag: '+15% POR PISTA', desc: 'Usar la lupa o lámpara UV añade +15% de prima a la reventa.' },
      intimidation: { name: 'Aura de Padrino', tag: '+15 MIEDO INICIAL', desc: 'Los clientes entran intimidados (+15 Miedo inicial).' },
      assurance: { name: 'Policías Comprados', tag: '-10% HEAT / NOCHE', desc: 'El Heat baja un 10% automáticamente cada noche.' },
      vautour: { name: 'Buitre Nocturno', tag: '+150 $ EN PORTAZO', desc: 'Si un cliente da un portazo, revendes su paradero (+150 $).' },
      'a-l-aveugle': { name: 'A Ciegas', tag: 'REVENTAS ×1,6', desc: 'Lupa y UV desactivadas toda la partida. Todas las reventas a ×1,6.' },
      'vitrine-armee': { name: 'Escaparate Armado', tag: '+15 MIEDO / ARMA', desc: 'Cada arma en la bóveda suma +15 de Miedo al cliente al entrar.' },
      'blanchisseur-express': { name: 'Limpieza Exprés', tag: 'LIMPIEZA 0 $ · TRIBUTO +10%', desc: 'Limpieza gratis, pero el tributo del sindicato sube un 10%.' },
      'marcheur-ombre': { name: 'Caminante Sombrío', tag: 'REDADA A 90%', desc: 'Las redadas solo se activan con 90% de Heat en vez de 75%.' },
      radar: { name: 'Radar de Trampas', tag: 'DETECCIÓN TRAMPAS', desc: 'Las trampas sutiles se revelan con la Lupa (sin necesidad de UV).' },
      negociateur: { name: 'Negociador Nato', tag: '-10% PRECIO INICIAL', desc: 'Los clientes empiezan sistemáticamente pidiendo un 10% menos.' },
      reseau: { name: 'Red de Receptores', tag: '+1 SUBASTA/NOCHE', desc: 'Puedes subastar una pieza extra por noche sin penalización de mercado.' },
      fantome: { name: 'Fantasma del Barrio', tag: '-5 HEAT/TRATO', desc: 'Cada trato cerrado genera un 5% menos de Heat.' },
      collectionneur: { name: 'Ojo del Coleccionista', tag: 'DETECTA FALSIFICACIÓN', desc: 'Las falsificaciones se marcan nada más abrir (antes de Lupa/UV).' },
      'double-fond': { name: 'Doble Fondo', tag: '2 PIEZAS PROTEGIDAS', desc: 'En caso de redada policial, 2 piezas de la bóveda quedan ocultas en el doble fondo.' },
    },

    slapCash: 'Soltar Cash',
    cashEmpty: 'Caja vacía',
    phantomBuyout: (n) => `Compra en bloque (${n})`,
    chip20: (amt) => `-20% (${amt} $)`,
    chip20Msg: (amt) => `Te planto ${amt} $ en efectivo ahora mismo, lo tomas o te largas.`,
    chipPressure: 'Apretar tuercas',
    chipPressureMsg: 'La patrulla ronda la calle. Si sales con eso encima, vas directo al calabozo.',
    chipFlaw: 'Explotar debilidad',
    chipBluff: 'Farol de valor',
    chipFlawMsg: (h) => `Déjate de cuentos: ${h} Baja tu precio.`,
    chipBluffMsg: 'Es invendible en este estado, nadie en la calle va a pagar ese precio.',
    clueGrill: 'Presionar',
    flawLabel: 'Debilidad:',
    redLineLabel: 'Línea roja:',
    arcTrack: (step, title) => `Pista ${step}/2 · ${title}`,
    arcDeliver: (reward) => `Entregar pieza (+${reward} $)`,
    arcClose: 'Pieza vendida · Cerrar pista',
    dailyContractHeader: 'CONTRATO DEL DÍA',
    dailyStreakBonus: (days, amt) => `Racha: ${days} d (+${amt} $ inicio)`,
    dailyReminderBtn: 'Activar alerta 24h',
    dailyHide7d: '▾ Ocultar 7d',
    dailyShow7d: '▸ Récords 7 días',
    briefStep3: '3/3 · Revende en bóveda: ',
    briefStep2: '2/3 · Hazle ceder: ',
    briefStep1: '1/3 · Inspecciona la pieza: ',
    briefDesc3: 'Pasa a la pestaña Bóveda para blanquear o subastar en el mercado negro. No olvides el alquiler de esta noche, arriba.',
    briefDesc2: 'Usa "Presionar" en tu libreta o suelta una oferta en efectivo.',
    briefDesc1: 'Haz clic en el objeto del mostrador o activa la Lupa.',
    stampSealed: 'SELLADO',
    stampTrap: '¡TRAMPA!',
    stampHoldup: 'ATRACO',
    stampWalkout: 'PORTAZO',
    counterNotebook: 'Cuaderno de Mostrador',
    confidential: 'Confidencial',
    lookoutAlert: '[VIGÍA] Pinganillo detectado bajo el cuello.',
    outcomeDeal: (name, margin) => `¡${name} aceptó la oferta! (+${margin} $ margen)`,
    outcomeGunArmored: '¡Atraco detenido por tu puerta blindada!',
    outcomeGunStolen: (name) => `¡${name} sacó un arma! (-600 $ robados)`,
    outcomeWalked: (name) => `${name} se fue.`,
    toNight: 'Hacia la noche',
    quickSellDirect: (amt) => `Venta directa (+${amt} $)`,
    dailyPublish: (margin) => `Publicar (+${margin} $)`,
    dailyPseudoPlaceholder: 'Tu apodo',
    shareBtn: 'Compartir',
    copiedBtn: 'Copiado ✓',
    freeAccess: 'Acceso libre',
    passActive30d: 'Pase activo · 30 d',
    getPass: 'Obtener Pase',
    redirecting: 'Redirigiendo…',
    vaultSellBtn: 'Bóveda y Venta',
    gameOverCurtain: (d) => `Cortina bajada · Día ${d}`,
    gameOverProfit: (profit, rank) => `Beneficio acumulado: ${profit} $ · Rango: ${rank}`,
    gameOverSwiss: (amt, count) => `Cuenta Suiza protegida: ${amt} $ · Activos: ${count}/3`,
    gameOverReopen: (cost, cash) => `Reabrir con red suiza (−${cost} $ Suiza → ${cash} $ caja)`,
    gameOverAscend: (roman) => `Ascensión ${roman} — Nueva Dificultad`,
    gameOverReset: 'Borrar todo y empezar de cero',
    jokerDraftTax: (d) => `Tributo pagado · Día ${d} superado`,
    jokerDraftTitle: 'Elige una Ventaja del Sindicato',
    jokerDraftDesc: 'Estos bonus se acumulan en toda tu carrera para dominar el mercado negro.',
    jokerDraftActivate: 'Activar esta ventaja →',
  },
};

export function getLocalizedRank(profit: number, locale: Locale): string {
  const r = GAME_UI[locale].ranks;
  if (profit >= 25000) return r[3];
  if (profit >= 10000) return r[2];
  if (profit >= 3000) return r[1];
  return r[0];
}
