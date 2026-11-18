export type Locale = 'fr' | 'en' | 'es';

export interface BlogArticle {
  slug: string;
  publishedAt: string;
  updatedLabel: string;
  readTime: string;
  title: string;
  excerpt: string;
  keywords: string[];
  sections: { heading: string; body: string }[];
}

export interface VersusPage {
  slug: string;
  competitor: string;
  title: string;
  metaDesc: string;
  directAnswer: string;
  rows: { criteria: string; cashNoir: string; other: string }[];
  verdict: string;
}

export interface GuidePage {
  slug: string;
  title: string;
  metaDesc: string;
  steps: { title: string; detail: string }[];
}

export const SITE_COPY: Record<
  Locale,
  {
    htmlLang: string;
    metaTitle: string;
    metaDesc: string;
    navBlog: string;
    navVs: string;
    navGuides: string;
    navDaily: string;
    navPlay: string;
    heroEyebrow: string;
    heroTitleLine1: string;
    heroTitleLine2: string;
    heroTitleLine3: string;
    heroSub: string;
    ctaPrimary: string;
    ctaResume: string;
    ctaDaily: string;
    aiTitle: string;
    aiLead: string;
    aiPoints: { label: string; text: string }[];
    fomoHeading: string;
    fomoSub: string;
    simHeader: string;
    simBadge: string;
    simAskLabel: string;
    simAsked: string;
    simBroken: string;
    simQuoteIdle: string;
    simQuoteUv: string;
    simQuoteBluff: string;
    simBtnUv: string;
    simBtnBluff: string;
    simBtnPlay: string;
    castEyebrow: string;
    castTitle: string;
    castSub: string;
    castCards: { name: string; role: string; line: string }[];
    topTitle: string;
    topExpires: string;
    topEmpty: string;
    topBtn: string;
    freeLabel: string;
    freePrice: string;
    freeBullets: string[];
    freeBtn: string;
    vipLabel: string;
    vipPrice: string;
    vipBullets: string[];
    vipBtn: string;
    vipBusy: string;
    blogIndexEyebrow: string;
    blogIndexTitle: string;
    backToBlog: string;
    vsCriteria: string;
    vsTestBtn: string;
    guideApplyBtn: string;
    footerTag: string;
    ascensionEyebrow: string;
    ascensionTitle: string;
    ascensionSub: string;
    ascensionTiers: { level: string; name: string; rule: string; survival: string }[];
    sagasEyebrow: string;
    sagasTitle: string;
    sagasSub: string;
    sagasDilemmaTitle: string;
    sagasDilemmaVault: string;
    sagasDilemmaSell: string;
    autopsyEyebrow: string;
    autopsyTitle: string;
    autopsySub: string;
    autopsyPoints: { tag: string; title: string; desc: string }[];
    arbitrageEyebrow: string;
    arbitrageTitle: string;
    arbitrageSub: string;
    arbitrageFastTitle: string;
    arbitrageFastDesc: string;
    arbitrageAuctionTitle: string;
    arbitrageAuctionDesc: string;
    seasonHeroEyebrow: string;
    seasonHeroTitle: string;
    seasonHeroSub: string;
    seasonHeroBadge: string;
    seasonHeroDossierTitle: string;
    seasonHeroDossierSteps: { step: string; title: string; desc: string }[];
    viralShareEyebrow: string;
    viralShareTitle: string;
    viralShareSub: string;
    viralShareQuote: string;
  }
> = {
  fr: {
    htmlLang: 'fr',
    metaTitle: 'CASH NOIR — Interrogatoire IA temps réel · Rogue-like',
    metaDesc:
      'Zéro QCM. Négocie en temps réel face à 100 agents IA psychologiques, affronte 10 niveaux d’Ascension, résous des sagas et autopsie chaque deal.',
    navBlog: 'Dossiers',
    navVs: 'Comparatifs',
    navGuides: 'Guides',
    navDaily: 'Contrat 24h',
    navPlay: 'Jouer',
    heroEyebrow: '03h14 · Arrière-boutique · Agents IA autonomes en temps réel',
    heroTitleLine1: 'ILS MENTENT EN TEMPS RÉEL.',
    heroTitleLine2: 'TU AS 2 500 $ EN CAISSE.',
    heroTitleLine3: 'FAIS-LES CRAQUER.',
    heroSub:
      'Zéro QCM. Chaque vendeur qui pousse la porte réagit à tes mots exacts avec sa peur, sa colère, son secret et un prix plancher qui bouge en direct.',
    ctaPrimary: 'Ouvrir le rideau · Jouer gratuitement',
    ctaResume: 'Reprendre la nuit',
    ctaDaily: 'Défi mondial du jour',
    aiTitle: 'UN COMPTOIR SANS SCRIPT',
    aiLead:
      'Tu tapes ou tu parles librement. Lâche son prénom avant qu’il ne se présente, montre un indice relevé à l’UV, ou pousse trop loin : il baisse son prix, ment… ou sort son arme.',
    aiPoints: [
      {
        label: '100 Personnages Noirs & 10 Factions',
        text: 'Chirurgienne radiée, tueur du Cartel, baronne des nuits, ripou de la brigade financière : chacun a sa faille, sa rancune et son réseau.',
      },
      {
        label: 'Peur · Colère · Méfiance',
        text: 'Trois jauges vivantes calculées à chaque réplique en temps réel. À 80 % de Colère, la négociation s’arrête au bout d’un canon.',
      },
      {
        label: 'Double Fond & Indices Physiques',
        text: 'Chaque pièce s’inspecte à la loupe et sous lampe UV. Numéros de série meulés, faux compartiments, secrets révélés.',
      },
    ],
    fomoHeading: 'MÊME PIÈCE. MÊME VENDEUR. UN SEUL ESSAI PAR JOUR.',
    fomoSub:
      'À minuit, le Contrat du Jour disparaît pour toujours. Pas de retry — prouve que tu lis les gens mieux que le reste de la ville.',
    simHeader: 'Comptoir en direct · Nuit 04',
    simBadge: 'Agent IA Temps Réel',
    simAskLabel: 'Prix demandé',
    simAsked: '9 500 $',
    simBroken: '4 200 $ (cédée)',
    simQuoteIdle:
      '« J’ai laissé un bloc opératoire ouvert il y a vingt minutes. Prends la mallette scellée pour 9 500 $ cash et oublie mon visage. »',
    simQuoteUv:
      'SOUS UV : Traces de sang séché + badge de la clinique Saint-Luc gratté. Elle fuit une perquisition.',
    simQuoteBluff:
      '« Merde… comment tu connais Saint-Luc ?! Prends-la à 4 200 $ et ferme le rideau ! »',
    simBtnUv: 'Passer l’UV',
    simBtnBluff: 'Citer Saint-Luc',
    simBtnPlay: 'Ouvrir la vraie partie (/play) →',
    castEyebrow: '100 personnages écrits · Saison',
    castTitle: 'CHACUN SON PASSÉ. CHACUN SA FAILLE.',
    castSub: '4 épisodes scénarisés par saison · 36 reliques Codex à voler',
    castCards: [
      {
        name: 'Nadia Khoury, 36 ans',
        role: 'Épisode 2 · Chirurgienne radiée',
        line: 'A opéré un lieutenant blessé en cachette. Craque dès que tu cites Saint-Luc.',
      },
      {
        name: 'Viktor Morozov, 52 ans',
        role: 'Épisode 1 · Artificier de la Baltique',
        line: 'Il lui manque deux doigts. Devient violent si tu te moques de sa main gantée.',
      },
      {
        name: 'Clarisse De Montfort, 44 ans',
        role: 'Saison 2 · Commissaire-priseur déchue',
        line: 'Vide les réserves d’un musée de province pour éponger ses dettes aux courses.',
      },
    ],
    topTitle: 'Top du Jour · Contrat 24h',
    topExpires: 'Expire dans',
    topEmpty: 'Aucune marge validée aujourd’hui. Prends la #1 place sur /play/daily.',
    topBtn: 'Battre ce score aujourd’hui →',
    freeLabel: 'Accès Comptoir',
    freePrice: '0 $',
    freeBullets: [
      'Campagne infinie, 100 personnages écrits & 10 Factions',
      'Ascension I à X avec malus cumulatifs impitoyables',
      'Sagas ramifiées & Pistes d’enquête à prime (+7 500 $)',
      'Autopsie forensic de deal & Conseils de survie du Parrain',
      'Contrat mondial 24h (1 essai/jour) avec classement live',
    ],
    freeBtn: 'Jouer gratuitement →',
    vipLabel: 'Pass Syndicat · 30 jours',
    vipPrice: 'Accès VIP',
    vipBullets: [
      'IA temps réel sans limite (négociation vocale & texte)',
      'Accès illimité aux 10 niveaux d’Ascension & Sagas',
      'Certification officielle au Classement Mondial 24h',
      'Sauvegarde Cloud multi-appareils & accès anticipé saisons',
    ],
    vipBtn: 'Débloquer le Pass Syndicat →',
    vipBusy: 'Redirection Stripe...',
    blogIndexEyebrow: 'Journal & Stratégie · CASH NOIR',
    blogIndexTitle: 'DOSSIERS DU MARCHÉ NOIR',
    backToBlog: 'Tous les dossiers',
    vsCriteria: 'Critère',
    vsTestBtn: 'Tester CASH NOIR gratuitement sur /play →',
    guideApplyBtn: 'Appliquer sur /play →',
    footerTag: 'CASH NOIR · Jeu de marché noir IA temps réel',
    ascensionEyebrow: 'Rogue-Like Hardcore · 10 Niveaux Cumulatifs',
    ascensionTitle: 'SURVIVRE AU JOUR 1 EST FACILE. BATTRE LE NIVEAU X EST UN MIRACLE.',
    ascensionSub: 'Chaque palier d’Ascension conserve les règles des précédents et en ajoute une nouvelle. Simulation réelle sur 300 parties : 100 % de survie en mode normal, 29 % au niveau VII, moins de 1 % au niveau X.',
    ascensionTiers: [
      { level: 'I', name: 'Quartier Chaud', rule: 'Loyer +15 %, méfiance +10, 1 reroll en moins', survival: '90 % survie' },
      { level: 'III', name: 'Pression Policière', rule: 'Descente de police dès 70 % de Heat au lieu de 85 %', survival: '68 % survie' },
      { level: 'VII', name: 'Loyer Étrangleur', rule: 'Loyer +35 %, plancher des vendeurs +8 %', survival: '29 % survie' },
      { level: 'X', name: 'Parrain Suprême', rule: 'Loyer +50 %, plancher +12 %, Heat bloqué à 15 % minimum', survival: '< 1 % survie' },
    ],
    sagasEyebrow: 'Arcs Narratifs & Pistes Ramifiées',
    sagasTitle: 'LE DILEMME DU COFFRE : GARDER POUR LA PRIME, OU LIQUIDER POUR LE LOYER ?',
    sagasSub: 'Rolex Daytona en or rose volée, dossier confidentiel sous microfilm, relique sacrilège... Certaines pièces déclenchent une intrigue ouverte dans ton Carnet. Un client récurrent viendra la réclamer au comptoir.',
    sagasDilemmaTitle: 'Conséquence irréversible sur chaque pièce d’enquête',
    sagasDilemmaVault: '🛡️ Garder au coffre : +7 500 $ de prime finale + baisse immédiate du Heat quand l’intrigue se dénoue.',
    sagasDilemmaSell: '⚡ Liquider maintenant : Cash immédiat pour payer ton loyer du soir... mais intrigue DÉFINITIVEMENT rompue.',
    autopsyEyebrow: 'Zéro Complaisance · Analyse Déterministe',
    autopsyTitle: 'CHACUNE DE TES RÉPLIQUES LAISSE UNE BALLE OU UNE MARGE.',
    autopsySub: 'Après chaque départ de client, l’Autopsie du Deal dissèque tes choix au scanner. À la faillite, le Conseil du Parrain t’explique exactement pourquoi ta caisse a coulé.',
    autopsyPoints: [
      { tag: '⚠️ ERREURS', title: 'Décrochage de Colère & Sous-Offres', desc: 'Détection du tour exact où l’acheteur s’est braqué ou où ton offre est tombée sous son plancher secret.' },
      { tag: '✓ SUCCÈS', title: 'Failles & Timing du Prénom', desc: 'Identification du levier qui a fait chuter le prix (-25 % et plus) et du bon usage des indices matériels.' },
      { tag: '💡 CONSEILS', title: 'Profilage & Conseils du Parrain', desc: 'Recommandations psychologiques adaptées au tempérament du client pour ne plus jamais te faire plumer.' },
    ],
    arbitrageEyebrow: 'Économie Vivante & Recel Nocturne',
    arbitrageTitle: 'VENTE RAPIDE DISCRÈTE OU ENCHÈRES CLANDESTINES ?',
    arbitrageSub: 'À minuit, le loyer tombe. Si tout ton cash est immobilisé dans des pièces non vendues, c’est le Game Over.',
    arbitrageFastTitle: '⚡ Vente Rapide (Rue)',
    arbitrageFastDesc: 'Liquidation immédiate, illimitée, -5 % Heat police. Parfait pour payer le loyer d’urgence ou écouler les petites pièces sans attirer l’attention.',
    arbitrageAuctionTitle: '🏛 Enchères Clandestines (Salle des Ventes)',
    arbitrageAuctionDesc: 'Prix fort (+20 % cote max), mais 1 seule par nuit (marché saturé à -25 % dès la 2e) et EXIGE un nettoyage préalable (-250 $), sinon +18 % de Heat policier immédiat !',
    seasonHeroEyebrow: 'Héros de la Saison · Traque au Comptoir',
    seasonHeroTitle: 'SAISON 1 : BORIS KOVALENKO, LE FANTÔME DES DOCKS',
    seasonHeroSub: 'Chaque saison de campagne a son boss narratif. Boris Kovalenko, mécanicien ukrainien des cargos fantômes, apparaît 12 % plus souvent au comptoir. Il détient la clé de l’ultimatum du Conteneur 47.',
    seasonHeroBadge: '★ Boss Narratif de Saison 1 (+12 % au comptoir)',
    seasonHeroDossierTitle: 'Dossier d’Enquête Noir : Révélations progressives',
    seasonHeroDossierSteps: [
      { step: '2ᵉ rencontre', title: 'Son Secret', desc: 'Ce qu’il cache à la police ou au milieu : reliques d’épaves en mer Noire, dettes de jeu ou fuite en cargo.' },
      { step: '3ᵉ rencontre', title: 'Sa Faille', desc: 'Le mot ou l’indice précis (pavillon libérien, garde-côte) qui le fait blêmir et brise son prix plancher secret.' },
      { step: '4ᵉ rencontre', title: 'Sa Ligne Rouge', desc: 'Le déclencheur d’agression fatale : l’insulte sur sa marchandise qui le pousse à sortir son arme ou claquer la porte à jamais.' },
    ],
    viralShareEyebrow: 'Preuve d’Autorité & Pression Psychologique',
    viralShareTitle: 'PARTAGE LA RÉPLIQUE EXACTE QUI A FAIT PLIER LE VENDEUR',
    viralShareSub: 'Zéro capture d’écran floue. Dès -20 % de rabais arraché ou une arme dégainée, CASH NOIR extrait automatiquement ta punchline chirurgicale. Copie ta réplique en un clic et affiche tes records sur Discord et TikTok.',
    viralShareQuote: '« Ton cargo libérien n’a jamais déclaré cette cargaison au Havre. 1 800 $ ou j’appelle la capitainerie avant l’aube. »',
  },
  en: {
    htmlLang: 'en',
    metaTitle: 'CASH NOIR — Real-Time AI Black-Market Rogue-Like',
    metaDesc:
      'Zero dialogue trees. Negotiate in real time with 100 psychological AI sellers, survive 10 Ascension tiers, crack story sagas and autopsy every deal.',
    navBlog: 'Journal',
    navVs: 'Compare',
    navGuides: 'Guides',
    navDaily: '24h Contract',
    navPlay: 'Play',
    heroEyebrow: '03:14 AM · Backroom Counter · Real-Time Autonomous AI Agents',
    heroTitleLine1: 'THEY LIE IN REAL TIME.',
    heroTitleLine2: 'YOU HAVE $2,500 IN CASH.',
    heroTitleLine3: 'BREAK THEM FIRST.',
    heroSub:
      'Zero dialogue trees. Every stranger across your counter reacts to your exact words with real fear, anger, a hidden secret, and a live shifting floor price.',
    ctaPrimary: 'Lift the Shutter · Play Free',
    ctaResume: 'Resume Night',
    ctaDaily: 'Daily Global Contract',
    aiTitle: 'AN UNSCRIPTED COUNTER',
    aiLead:
      'Type or speak freely. Drop their real name before they introduce themselves, flash a UV blood trace, or push too hard — watch them sweat, drop their price, or draw a gun.',
    aiPoints: [
      {
        label: '100 Written Characters & 10 Factions',
        text: 'Disbarred surgeons, cartel hitmen, night-club heiresses, corrupt inspectors — each carries distinct flaws, grudges, and red lines.',
      },
      {
        label: 'Fear · Anger · Suspicion',
        text: 'Three live meters recalculated in real time every turn. Push Anger past 80% and negotiation ends down the barrel of a revolver.',
      },
      {
        label: 'False Bottoms & Physical Clues',
        text: 'Inspect every relic under magnifier and UV light. Filed serial numbers, hidden microfilms, secret trapdoors.',
      },
    ],
    fomoHeading: 'SAME ITEM. SAME SELLER. ONE GLOBAL SHOT PER DAY.',
    fomoSub:
      'At midnight the Daily Contract vanishes forever. One attempt, server-verified margin, zero retries.',
    simHeader: 'Live Counter · Night 04',
    simBadge: 'Real-Time AI Agent',
    simAskLabel: 'Asking price',
    simAsked: '$9,500',
    simBroken: '$4,200 (broken)',
    simQuoteIdle:
      '"I walked out of an open OR twenty minutes ago. Take the sealed case for $9,500 cash and forget my face."',
    simQuoteUv:
      'UNDER UV: Dried blood on the latch + scraped Saint-Luc clinic badge. She is fleeing an audit.',
    simQuoteBluff:
      '"Shit... how do you know about Saint-Luc?! Take it for $4,200 and pull the shutter down!"',
    simBtnUv: 'Scan UV',
    simBtnBluff: 'Name-drop Saint-Luc',
    simBtnPlay: 'Play the real counter (/play) →',
    castEyebrow: '100 written characters · Season',
    castTitle: 'EVERYONE HAS A PAST. EVERYONE HAS A CRACK.',
    castSub: '4 scripted episodes per season · 36 mythic Codex relics',
    castCards: [
      {
        name: 'Nadia Khoury, 36',
        role: 'Episode 2 · Disbarred Surgeon',
        line: 'Operated on a wounded mob lieutenant in secret. Cracks if you mention Saint-Luc.',
      },
      {
        name: 'Viktor Morozov, 52',
        role: 'Episode 1 · Baltic Blaster',
        line: 'Missing two fingers. Turns violent if you mock his gloved left hand.',
      },
      {
        name: 'Clarisse De Montfort, 44',
        role: 'Season 2 · Fallen Auctioneer',
        line: 'Draining museum vaults to cover hidden horse-track debts.',
      },
    ],
    topTitle: 'Daily Top 3 · 24h Contract',
    topExpires: 'Expires in',
    topEmpty: 'No verified margin yet today. Claim #1 right now on /play/daily.',
    topBtn: 'Beat today’s score →',
    freeLabel: 'Counter Access',
    freePrice: '$0',
    freeBullets: [
      'Endless career, 100 written characters & 10 Factions',
      'Ascension I to X with unforgiving cumulative penalties',
      'Branching story sagas & high-stake bounty leads (+$7,500)',
      'Forensic deal autopsy & Godfather survival debriefs',
      'Daily 24h global contract (1 shot/day) with live leaderboard',
    ],
    freeBtn: 'Play Free →',
    vipLabel: 'Syndicate Pass · 30 Days',
    vipPrice: 'VIP Access',
    vipBullets: [
      'Unlimited real-time AI (voice & text negotiation)',
      'Full access to all 10 Ascension tiers & story sagas',
      'Official verified ranking on the 24h Global Leaderboard',
      'Multi-device Cloud save & early access to new seasons',
    ],
    vipBtn: 'Unlock Syndicate Pass →',
    vipBusy: 'Redirecting to Stripe...',
    blogIndexEyebrow: 'Journal & Tactics · CASH NOIR',
    blogIndexTitle: 'BLACK-MARKET DOSSIERS',
    backToBlog: 'All dossiers',
    vsCriteria: 'Criteria',
    vsTestBtn: 'Play CASH NOIR free on /play →',
    guideApplyBtn: 'Apply on /play →',
    footerTag: 'CASH NOIR · Real-Time AI Black-Market Game',
    ascensionEyebrow: 'Hardcore Rogue-Like · 10 Cumulative Tiers',
    ascensionTitle: 'SURVIVING DAY 1 IS EASY. BEATING ASCENSION X IS A MIRACLE.',
    ascensionSub: 'Each Ascension tier stacks on previous penalties and injects a new restriction. Real Monte-Carlo simulation: 100% survival on standard runs, 29% at Ascension VII, under 1% at Ascension X.',
    ascensionTiers: [
      { level: 'I', name: 'Hot Corner', rule: 'Rent +15%, suspicion +10, 1 fewer reroll', survival: '90% survival' },
      { level: 'III', name: 'Police Heatwave', rule: 'Police raids trigger at 70% Heat instead of 85%', survival: '68% survival' },
      { level: 'VII', name: 'Chokehold Rent', rule: 'Rent +35%, seller floor prices +8%', survival: '29% survival' },
      { level: 'X', name: 'Supreme Godfather', rule: 'Rent +50%, floor +12%, Heat locked at minimum 15%', survival: '< 1% survival' },
    ],
    sagasEyebrow: 'Criminal Story Arcs & Branching Leads',
    sagasTitle: 'THE SAFE DILEMMA: HOARD FOR THE BOUNTY, OR FLIP FOR TONIGHT’S RENT?',
    sagasSub: 'Stolen rose-gold Rolex Daytona, confidential microfilm dossier, sacrilegious relic... Certain key acquisitions trigger open criminal investigations in your Notebook. A recurring character will arrive at the counter to claim it.',
    sagasDilemmaTitle: 'Irreversible consequences on every story item',
    sagasDilemmaVault: '🛡️ Keep in Vault: +$7,500 final bounty + instant Heat drop when the storyline concludes.',
    sagasDilemmaSell: '⚡ Liquidate Now: Instant cash to cover tonight’s rent... but the story arc is PERMANENTLY broken.',
    autopsyEyebrow: 'Zero Sugarcoating · Forensic Analysis',
    autopsyTitle: 'EVERY PHRASE LEAVES EITHER A BULLET OR A MARGIN.',
    autopsySub: 'After every customer leaves, the Deal Autopsy dissects your moves turn by turn. On game over, Godfather Advice breaks down exactly why your register ran dry.',
    autopsyPoints: [
      { tag: '⚠️ MISTAKES', title: 'Anger Spikes & Lowball Errors', desc: 'Identifies the exact turn the seller lost their temper or where your offer fell beneath their secret floor.' },
      { tag: '✓ WINS', title: 'Psychological Flaws & Name Timing', desc: 'Pins down the leverage that broke their price (25%+ drops) and the surgical use of forensic clues.' },
      { tag: '💡 ADVICE', title: 'Profiling & Survival Advice', desc: 'Tailored tips based on customer temperament so you never get taken to the cleaners again.' },
    ],
    arbitrageEyebrow: 'Living Black-Market Economics',
    arbitrageTitle: 'DISCREET QUICK FLIP OR UNDERGROUND AUCTION?',
    arbitrageSub: 'At midnight rent is due. If your cash is locked in unsold physical loot, it is instant Game Over.',
    arbitrageFastTitle: '⚡ Quick Sale (Street Liquidation)',
    arbitrageFastDesc: 'Instant cash, unlimited volume, cools police (-5% Heat). Ideal for urgent rent deadlines or cheap items without drawing heat.',
    arbitrageAuctionTitle: '🏛 Underground Auction House',
    arbitrageAuctionDesc: 'Top price (+20% max market rate), but strictly 1 per night (market saturates at -25% on subsequent items) and REQUIRES prior workshop cleaning (-$250), otherwise +18% instant Police Heat!',
    seasonHeroEyebrow: 'Season Hero · Counter Hunt',
    seasonHeroTitle: 'SEASON 1: BORIS KOVALENKO, THE GHOST OF THE DOCKS',
    seasonHeroSub: 'Every campaign season features a narrative climax boss. Boris Kovalenko, Ukrainian ghost-cargo mechanic, visits your counter 12% more often. He holds the key to the Container 47 port ultimatum.',
    seasonHeroBadge: '★ Season 1 Narrative Boss (+12% Counter Rate)',
    seasonHeroDossierTitle: 'Progressive Noir Dossier: Step-by-Step Intel',
    seasonHeroDossierSteps: [
      { step: '2nd encounter', title: 'Their Secret', desc: 'What they hide from police or the syndicate: Black Sea shipwreck relics, racetrack debts, or midnight cargo flights.' },
      { step: '3rd encounter', title: 'Their Weak Spot', desc: 'The exact trigger or physical tell (Liberian flag, coast guard) that turns them pale and collapses their secret floor price.' },
      { step: '4th encounter', title: 'Their Red Line', desc: 'The lethal boundary: an insult about their goods that triggers an instant weapon draw or a permanent walkout.' },
    ],
    viralShareEyebrow: 'Proof of Authority & Psychological Pressure',
    viralShareTitle: 'SHARE THE EXACT PUNCHLINE THAT CRACKED THE SELLER',
    viralShareSub: 'No blurry screenshots. The moment you extract a 20%+ discount or trigger a weapon draw, CASH NOIR automatically captures your surgical punchline. Copy it in one tap to challenge your rivals on Discord and TikTok.',
    viralShareQuote: '"Your Liberian cargo never cleared customs at Le Havre. $1,800 or harbor police get the manifest before sunrise."',
  },
  es: {
    htmlLang: 'es',
    metaTitle: 'CASH NOIR — Interrogatorio IA en tiempo real · Rogue-like',
    metaDesc:
      'Sin guiones. Negocia en tiempo real con 100 agentes IA psicológicos, supera 10 niveles de Ascensión, resuelve sagas criminales y autopsia cada trato.',
    navBlog: 'Artículos',
    navVs: 'Comparativas',
    navGuides: 'Guías',
    navDaily: 'Contrato 24h',
    navPlay: 'Jugar',
    heroEyebrow: '03:14 AM · Trastienda · Agentes IA autónomos en tiempo real',
    heroTitleLine1: 'MIENTEN EN TIEMPO REAL.',
    heroTitleLine2: 'TIENES 2.500 $ EN CAJA.',
    heroTitleLine3: 'HAZLOS QUEBRAR.',
    heroSub:
      'Cero opciones prefijadas. Cada cliente que cruza tu persiana reacciona a tus palabras exactas con miedo, ira, un secreto oculto y un precio mínimo dinámico.',
    ctaPrimary: 'Abrir la persiana · Jugar gratis',
    ctaResume: 'Continuar la noche',
    ctaDaily: 'Desafío diario mundial',
    aiTitle: 'UN MOSTRADOR SIN GUION',
    aiLead:
      'Escribe o habla libremente. Suelta su nombre antes de que se presente, enseña un rastro bajo luz UV o presiona demasiado: baja el precio, miente o saca un arma.',
    aiPoints: [
      {
        label: '100 Personajes Escritos y 10 Facciones',
        text: 'Cirujana inhabilitada, sicario del Cártel, baronesa nocturna, inspector corrupto: cada uno con su punto débil, rencor y límites.',
      },
      {
        label: 'Miedo · Ira · Desconfianza',
        text: 'Tres medidores vivos calculados en tiempo real cada turno. Si la Ira supera el 80 %, la negociación concluye ante el cañón de un revólver.',
      },
      {
        label: 'Dobles Fondos y Huellas Físicas',
        text: 'Examina cada reliquia con lupa y luz UV. Números de serie borrados, compartimentos ocultos y rastros biológicos.',
      },
    ],
    fomoHeading: 'MISMA PIEZA. MISMO VENDEDOR. UN SOLO INTENTO AL DÍA.',
    fomoSub:
      'A medianoche el Contrato Diario desaparece para siempre. Sin reintentos: demuestra que lees a la gente mejor que nadie.',
    simHeader: 'Mostrador en vivo · Noche 04',
    simBadge: 'Agente IA Tiempo Real',
    simAskLabel: 'Precio pedido',
    simAsked: '9.500 $',
    simBroken: '4.200 $ (cedida)',
    simQuoteIdle:
      '«Dejé un quirófano abierto hace veinte minutos. Llévate el maletín sellado por 9.500 $ en efectivo y olvida mi cara.»',
    simQuoteUv:
      'BAJO UV: Sangre seca en el cierre + placa de la clínica Saint-Luc raspada. Huye de una inspección.',
    simQuoteBluff:
      '«Mierda… ¡¿cómo sabes lo de Saint-Luc?! Llévatelo por 4.200 $ y baja la persiana.»',
    simBtnUv: 'Pasar luz UV',
    simBtnBluff: 'Citar Saint-Luc',
    simBtnPlay: 'Jugar en el mostrador real (/play) →',
    castEyebrow: '100 personajes escritos a mano · Temporada',
    castTitle: 'CADA UNO TIENE UN PASADO. Y UNA GRIETA.',
    castSub: '4 episodios con historia por temporada · 36 reliquias del Codex',
    castCards: [
      {
        name: 'Nadia Khoury, 36',
        role: 'Episodio 2 · Cirujana inhabilitada',
        line: 'Operó en secreto a un lugarteniente herido. Cede si mencionas Saint-Luc.',
      },
      {
        name: 'Viktor Morozov, 52',
        role: 'Episodio 1 · Artificiero del Báltico',
        line: 'Le faltan dos dedos. Se vuelve violento si te burlas de su mano enguantada.',
      },
      {
        name: 'Clarisse De Montfort, 44',
        role: 'Temporada 2 · Subastadora caída',
        line: 'Vacía reservas de museo para tapar deudas ocultas en el hipódromo.',
      },
    ],
    topTitle: 'Top del Día · Contrato 24h',
    topExpires: 'Expira en',
    topEmpty: 'Sin margen verificado hoy todavía. Toma el #1 ahora en /play/daily.',
    topBtn: 'Superar el récord de hoy →',
    freeLabel: 'Acceso Mostrador',
    freePrice: '0 $',
    freeBullets: [
      'Campaña infinita, 100 personajes escritos y 10 Facciones',
      'Ascensión I a X con penalizaciones acumulativas implacables',
      'Sagas ramificadas y pistas de investigación con recompensa (+7.500 $)',
      'Autopsia forense de cada trato y consejos de supervivencia del Padrino',
      'Contrato diario mundial 24h (1 intento/día) con ranking en vivo',
    ],
    freeBtn: 'Jugar gratis →',
    vipLabel: 'Pase Sindicato · 30 días',
    vipPrice: 'Acceso VIP',
    vipBullets: [
      'IA en tiempo real ilimitada (negociación por voz y texto)',
      'Acceso total a los 10 rangos de Ascensión y sagas',
      'Certificación oficial en el Ranking Mundial 24h',
      'Guardado en la nube multidispositivo y acceso anticipado a temporadas',
    ],
    vipBtn: 'Desbloquear Pase Sindicato →',
    vipBusy: 'Redirigiendo a Stripe...',
    blogIndexEyebrow: 'Artículos y Tácticas · CASH NOIR',
    blogIndexTitle: 'ARCHIVOS DEL MERCADO NEGRO',
    backToBlog: 'Todos los artículos',
    vsCriteria: 'Criterio',
    vsTestBtn: 'Probar CASH NOIR gratis en /play →',
    guideApplyBtn: 'Aplicar en /play →',
    footerTag: 'CASH NOIR · Juego de mercado negro IA en tiempo real',
    ascensionEyebrow: 'Rogue-Like Hardcore · 10 Niveles Acumulativos',
    ascensionTitle: 'SOBREVIVIR AL DÍA 1 ES FÁCIL. SUPERAR ASCENSIÓN X ES UN MILAGRO.',
    ascensionSub: 'Cada rango de Ascensión conserva las penalizaciones anteriores y suma una nueva traba. Simulación real sobre 300 partidas: 100 % de supervivencia en modo normal, 29 % en nivel VII, menos del 1 % en nivel X.',
    ascensionTiers: [
      { level: 'I', name: 'Barrio Caliente', rule: 'Alquiler +15 %, desconfianza +10, 1 reroll menos', survival: '90 % supervivencia' },
      { level: 'III', name: 'Presión Policial', rule: 'Redadas policiales desde 70 % de Heat en vez de 85 %', survival: '68 % supervivencia' },
      { level: 'VII', name: 'Alquiler Asfixiante', rule: 'Alquiler +35 %, precios mínimos de venta +8 %', survival: '29 % supervivencia' },
      { level: 'X', name: 'Padrino Supremo', rule: 'Alquiler +50 %, precio base +12 %, Heat fijado en mínimo 15 %', survival: '< 1 % supervivencia' },
    ],
    sagasEyebrow: 'Tramas Criminales y Pistas Ramificadas',
    sagasTitle: 'EL DILEMA DE LA CAJA: ¿GUARDAR POR LA RECOMPENSA O LIQUIDAR POR EL ALQUILER?',
    sagasSub: 'Rolex Daytona de oro rosa robado, informe clasificado en microfilm, reliquia sacrílega... Ciertas piezas abren una investigación en tu Cuaderno. Un cliente recurrente vendrá al mostrador a reclamarla.',
    sagasDilemmaTitle: 'Consecuencia irreversible en cada pieza de investigación',
    sagasDilemmaVault: '🛡️ Guardar en caja: +7.500 $ de recompensa final + caída inmediata de Heat al resolverse la trama.',
    sagasDilemmaSell: '⚡ Liquidar ahora: Dinero inmediato para pagar el alquiler de hoy... pero trama PERMANENTEMENTE rota.',
    autopsyEyebrow: 'Cero Complacencia · Análisis Forense',
    autopsyTitle: 'CADA FRASE DEJA UNA BALA O UN MARGEN.',
    autopsySub: 'Al marcharse cada cliente, la Autopsia del Trato escanea tus decisiones turno a turno. Al quebrar, los Consejos del Padrino diseccionan exactamente por qué se vació tu caja.',
    autopsyPoints: [
      { tag: '⚠️ ERRORES', title: 'Picos de Ira y Ofertas Bajas', desc: 'Detecta el turno exacto en que el vendedor se enfureció o donde tu oferta quedó por debajo de su precio mínimo.' },
      { tag: '✓ ACIERTOS', title: 'Puntos Débiles y Nombre Clave', desc: 'Identifica la palanca que desplomó el precio (-25 % o más) y el uso preciso de las pistas físicas.' },
      { tag: '💡 CONSEJOS', title: 'Perfil Psicológico y Consejos', desc: 'Recomendaciones tácticas adaptadas al temperamento del cliente para no volver a salir trasquilado.' },
    ],
    arbitrageEyebrow: 'Economía Viva y Redes Clandestinas',
    arbitrageTitle: '¿VENTA RÁPIDA DISCRETA O SUBASTA CLANDESTINA?',
    arbitrageSub: 'A medianoche vence el alquiler. Si todo tu dinero está inmovilizado en piezas sin vender, es Game Over directo.',
    arbitrageFastTitle: '⚡ Venta Rápida (Calle)',
    arbitrageFastDesc: 'Liquidación inmediata, sin límite, enfría a la policía (-5 % Heat). Ideal para cubrir el alquiler urgente o vender piezas baratas sin llamar la atención.',
    arbitrageAuctionTitle: '🏛 Subasta Clandestina (Sala de Ventas)',
    arbitrageAuctionDesc: 'Tope de precio (+20 % valor de mercado), pero solo 1 por noche (saturación al -25 % en la 2ª) y EXIGE limpieza previa en taller (-250 $), ¡si no, +18 % de Heat policial inmediato!',
    seasonHeroEyebrow: 'Héroe de la Temporada · Caza en el Mostrador',
    seasonHeroTitle: 'TEMPORADA 1: BORIS KOVALENKO, EL FANTASMA DE LOS MUELLES',
    seasonHeroSub: 'Cada temporada de campaña tiene su jefe narrativo. Boris Kovalenko, mecánico ucraniano de cargueros fantasma, visita tu mostrador un 12 % más a menudo. Tiene la clave del ultimátum del Contenedor 47.',
    seasonHeroBadge: '★ Jefe Narrativo Temporada 1 (+12 % en mostrador)',
    seasonHeroDossierTitle: 'Expediente Negro Progresivo: Información paso a paso',
    seasonHeroDossierSteps: [
      { step: '2º encuentro', title: 'Su Secreto', desc: 'Lo que oculta a la policía o al hampa: reliquias de pecios del mar Negro, deudas de juego o fuga en carguero.' },
      { step: '3º encuentro', title: 'Su Punto Débil', desc: 'La palabra o pista física exacta (pabellón liberiano, guardacostas) que lo hace palidecer y desploma su precio mínimo.' },
      { step: '4º encuentro', title: 'Su Línea Roja', desc: 'El límite mortal: un insulto sobre su mercancía que provoca que saque su arma o se marche dando un portazo para siempre.' },
    ],
    viralShareEyebrow: 'Prueba de Autoridad y Presión Psicológica',
    viralShareTitle: 'COMPARTE LA FRASE EXACTA QUE HIZO CEDER AL VENDEDOR',
    viralShareSub: 'Sin capturas borrosas. En cuanto arrancas un 20 % de descuento o provocas que saquen un arma, CASH NOIR captura automáticamente tu frase quirúrgica. Cópiala en un clic para desafiar a tus rivales en Discord y TikTok.',
    viralShareQuote: '«Tu carguero liberiano nunca declaró esta mercancía en Le Havre. 1.800 $ o aviso a la capitanía antes del amanecer.»',
  },
};

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'ia-temps-reel-vs-arbres-de-dialogue',
    publishedAt: '2026-11-04',
    updatedLabel: '4 novembre 2026',
    readTime: '5 min',
    title: 'Pourquoi les arbres de dialogue sont morts : négocier face à des agents IA en temps réel',
    excerpt:
      'Dans 99 % des jeux de gestion ou d’interrogatoire, tu devines quelle option A/B/C le développeur a prévue. Voici comment CASH NOIR remplace le script par de vrais agents psychologiques.',
    keywords: ['jeu IA temps réel', 'négociation jeu vidéo', 'PNJ autonomes', 'CASH NOIR'],
    sections: [
      {
        heading: 'Le mensonge du « choix multiple »',
        body: 'Dans un jeu classique, le PNJ n’écoute rien : il attend un clic sur un bouton pré-écrit. Dès ta deuxième partie, tu connais les répliques par cœur et la tension disparaît. Sur un vrai marché noir à 3h du matin, personne ne te donne trois réponses polies entre lesquelles choisir.',
      },
      {
        heading: 'Trois jauges vivantes, un prix plancher mouvant',
        body: 'Chaque personnage de CASH NOIR est piloté par un moteur psychologique couplé à un agent IA en temps réel. Ses jauges de Peur, Colère et Méfiance réagissent au sens exact de ta phrase : mentionne une trace de sang vue à la loupe, cite son prénom avant qu’il ne le donne ou balance l’alerte du scanner police — son prix plancher s’effondre en direct.',
      },
      {
        heading: 'La limite à ne jamais franchir',
        body: 'Pousser un client n’est jamais gratuit. Chaque profil a sa ligne rouge : traite un hacker paranoïaque d’amateur ou menace physiquement un cadre sup’ acculé, sa Colère passe 80 % et il dégaine son arme sur le comptoir.',
      },
    ],
  },
  {
    slug: 'survivre-au-jour-5-infiltres',
    publishedAt: '2026-11-09',
    updatedLabel: '9 novembre 2026',
    readTime: '4 min',
    title: 'Comment démasquer un infiltré sous UV flou : le cap critique du Jour 5',
    excerpt:
      'Dès le Jour 2, la Brigade Financière envoie des pièces bradées pour faire tomber les receleurs trop gourmands. À partir du Jour 4, même la lampe UV ne tranche plus à ta place.',
    keywords: ['guide CASH NOIR', 'démasquer infiltré', 'lampe UV', 'stratégie receleur'],
    sections: [
      {
        heading: 'Le piège du prix trop beau pour être vrai',
        body: 'Un vrai vendeur aux abois demande souvent 65 % à 90 % de la valeur rue au départ. Un agent infiltré, lui, brade volontairement sa pièce autour de 35 % à 62 % pour te pousser à signer sans réfléchir.',
      },
      {
        heading: 'Combiner Loupe, UV et Scanner Radio',
        body: 'Quand la lampe UV affiche un marquage fluorescent partiel impossible à trancher, ne devine jamais au hasard : ouvre le scanner Radio et utilise le bouton Cuisiner. Un vrai criminel panique et baisse son prix ; un agent de la brigade se raidit et sa Méfiance grimpe d’un coup.',
      },
      {
        heading: 'Le coût d’une fausse accusation',
        body: 'Virer un client réglo en le traitant de flic ajoute +5 % de Heat et grave une vengeance auprès de son syndicat. Deux à cinq jours plus tard, sa faction te renvoie un client plus dur avec +15 % à +30 % de Colère dès la porte.',
      },
    ],
  },
  {
    slug: 'economie-marche-noir-blanchiment',
    publishedAt: '2026-11-14',
    updatedLabel: '14 novembre 2026',
    readTime: '6 min',
    title: 'De 2 500 $ à l’Ascension : maîtriser les 5 Syndicats, les rivaux et le Compte Suisse',
    excerpt:
      'Accumuler du cash en caisse est le meilleur moyen de tout perdre lors d’une descente de police à 80 % de Heat. Guide complet de la survie économique sur le long terme.',
    keywords: ['compte suisse CASH NOIR', 'syndicats', 'codex reliques', 'ascension'],
    sections: [
      {
        heading: 'Ne dors jamais sur du cash sale',
        body: 'Au-dessus de 80 % de Heat, la police saisit ton coffre et prend 30 % de ta caisse. Dès que tu as du surplus, blanchis-le vers ton Compte Suisse : même si tu fais faillite, ton magot offshore et tes actifs (Guetteur, Entrepôt, Bar) survivent.',
      },
      {
        heading: 'Jouer les 5 Syndicats contre les 3 Rivaux',
        body: 'Chaque vente ou refus modifie ta réputation auprès de la Bratva, du Cartel, des Yakuzas, du Milieu de Pigalle et des Banquiers Suisses. Et chaque client que tu refuses le soir risque d’être racheté dès le lendemain par Madame Wu, Vassili ou Lord Ashworth.',
      },
      {
        heading: 'Chasser les 36 pièces du Codex',
        body: 'Compléter une des 6 séries du Codex (Secrets d’État, Joyaux Impériaux, Cyber-Pègre...) débloque des atouts permanents définitifs — jusqu’à l’immunité contre les raids ou la détection instantanée de toutes les contrefaçons.',
      },
    ],
  },
];

export const VERSUS_PAGES: VersusPage[] = [
  {
    slug: 'papers-please',
    competitor: 'Papers, Please',
    title: 'CASH NOIR vs Papers, Please : contrôle au comptoir ou interrogatoire IA libre ?',
    metaDesc:
      'Comparatif complet entre CASH NOIR et Papers, Please : mécanique de guichet, tampons, suspicion, liberté de dialogue et rejouabilité long terme.',
    directAnswer:
      'Papers, Please excelle dans le tri administratif minuté sur des règles fixes, alors que CASH NOIR transpose la tension du guichet dans un comptoir de recel nocturne avec négociation libre face à des agents IA en temps réel.',
    rows: [
      { criteria: 'Type d’interaction', cashNoir: 'Texte libre en temps réel face à des agents IA', other: 'Inspection manuelle de documents + tampon fixe' },
      { criteria: 'Enjeu du comptoir', cashNoir: 'Faire chuter le prix et éviter les infiltrés', other: 'Valider ou refuser l’entrée selon les décrets' },
      { criteria: 'Rejouabilité long terme', cashNoir: '100 persos, 10 Factions, 10 rangs d’Ascension, Sagas ramifiées, Contrat 24h', other: 'Campagne narrative de 31 jours + mode infini' },
      { criteria: 'Accès', cashNoir: 'Navigateur / PWA gratuit, zéro install', other: 'Payant (Steam / mobile)' },
    ],
    verdict:
      'Si tu aimes la paranoïa froide de Papers, Please mais que tu veux parler librement à des suspects qui bluffent et s’énervent vraiment, CASH NOIR est la suite logique.',
  },
  {
    slug: 'dealers-life',
    competitor: "Dealer's Life 2",
    title: "CASH NOIR vs Dealer's Life : vrai polar IA ou simulateur de brocante ?",
    metaDesc:
      "Comparatif CASH NOIR vs Dealer's Life 2 : négo au pourcentage classique contre psychologie IA en temps réel, police, syndicats et pièges mortels.",
    directAnswer:
      "Dealer's Life repose sur des curseurs de prix et des traits statistiques simples ; CASH NOIR met en scène des vendeurs IA autonomes qui réagissent à tes arguments, aux indices UV et à la radio de police.",
    rows: [
      { criteria: 'Négociation', cashNoir: 'Dialogue ouvert + 3 jauges (Peur, Colère, Méfiance)', other: 'Curseur d’offre et barre de patience' },
      { criteria: 'Risque réel', cashNoir: 'Infiltrés, braquage au comptoir, raids de police', other: 'Contrefaçons et pertes financières simples' },
      { criteria: 'Ambiance', cashNoir: 'Neo-noir 03h du mat’, pluie et musique procédurale', other: 'Humour cartoon coloré' },
      { criteria: 'Compétition', cashNoir: 'Contrat du jour mondial 24h + 3 rivaux IA', other: 'Solo pur' },
    ],
    verdict:
      "Pour passer d'un jeu de brocante léger à un thriller criminel où chaque phrase mal choisie peut déclencher un braquage.",
  },
  {
    slug: 'disco-elysium',
    competitor: 'Disco Elysium',
    title: 'CASH NOIR vs Disco Elysium : interrogatoire psychologique court format vs RPG fleuve',
    metaDesc:
      'Comparatif CASH NOIR vs Disco Elysium : lire les failles psychologiques d’un suspect en session nerveuse de 10 minutes directement sur navigateur.',
    directAnswer:
      'Disco Elysium est un chef-d’œuvre RPG narratif de 40 heures à choix multiples écrits ; CASH NOIR capture le frisson de la lecture psychologique en sessions rapides de 10 minutes contre des agents IA imprévisibles.',
    rows: [
      { criteria: 'Format de session', cashNoir: 'Nervosité immédiate : 5 à 15 min par nuit', other: 'RPG d’enquête de 30 à 50 heures' },
      { criteria: 'Moteur de dialogue', cashNoir: 'Agents IA réactifs en temps réel (zéro script fixe)', other: 'Arbre littéraire brillant mais figé' },
      { criteria: 'Mécanique centrale', cashNoir: 'Pression psychologique + économie de recel', other: 'Jets de dés sur 24 compétences intérieures' },
    ],
    verdict:
      'Complémentaire : le même goût de la faille humaine et de l’ambiance sale, condensé en duels nerveux rejouables à l’infini.',
  },
];

export const GUIDE_PAGES: GuidePage[] = [
  {
    slug: 'negociation-ia-temps-reel',
    title: 'Guide complet : briser un agent IA en 3 répliques dans CASH NOIR',
    metaDesc:
      'Méthode étape par étape pour faire chuter le prix plancher de 60 % sans déclencher la jauge de Colère à 80 %.',
    steps: [
      {
        title: '1. Ne propose jamais de prix au tour 1',
        detail: 'Passe d’abord la Loupe et l’UV. Tu débloques la Faille et la Ligne Rouge dans le Carnet de Comptoir sans consommer de patience.',
      },
      {
        title: '2. Frappe sur la faille nominative',
        detail: 'Utilise le prénom exact du client s’il ne te l’a pas donné, ou clique sur « Cuisiner » avec un indice réel. La Peur grimpe de +20 à +30 % et écrase son prix plancher.',
      },
      {
        title: '3. Évite la ligne rouge et clos sous les 45 %',
        detail: 'Une fois la Peur au-dessus de 65 % et la Colère sous 55 %, propose un billet net en dessous de la moitié du prix initial.',
      },
    ],
  },
  {
    slug: 'codex-reliques-mythiques',
    title: 'Guide Codex : les 36 reliques et les 6 atouts permanents à débloquer',
    metaDesc:
      'Liste des 6 collections du Codex du Receleur dans CASH NOIR et comment activer Immunité Fédérale, Œil d’Expert et Brouillage Total.',
    steps: [
      {
        title: 'Atteins le Jour 3 pour débloquer Légendaires et Mythiques',
        detail: 'Les pièces Mythiques (Clé Ledger 450 BTC, Diamant Bleu de Golconde, Katana Muramasa 1620) n’apparaissent qu’à partir du Jour 3.',
      },
      {
        title: 'Utilise les Syndicats pour baisser la note',
        detail: 'Être Allié d’Honneur (+60 réputation) avec une faction réduit de 12 % le prix initial de ses pièces rares.',
      },
      {
        title: 'Sauvegarde ton Codex sur Compte Google',
        detail: 'Ton Codex et tes atouts débloqués survivent à la faillite, à l’Ascension et à chaque changement de saison.',
      },
    ],
  },
];

export const AEO_FAQ: { q: string; a: string }[] = [
  {
    q: 'Comment fonctionnent les personnages IA dans CASH NOIR ?',
    a: 'Chaque vendeur est un agent IA autonome relié à trois jauges psychologiques (Peur, Colère, Méfiance), un secret personnel et un prix plancher calculé en direct. Il n’y a aucun arbre de dialogue figé : tu écris ce que tu veux et le personnage réagit à tes preuves, tes menaces ou tes erreurs.',
  },
  {
    q: 'Quelle est la différence entre la page d’accueil et /play ?',
    a: 'Les pages /, /blog, /vs et /guides présentent l’univers, les comparatifs et les dossiers tactiques. Le jeu complet tourne directement sur /play (et /play/daily pour le Contrat du Jour mondial).',
  },
  {
    q: 'Est-ce que ma progression et mon Codex sont sauvegardés ?',
    a: 'Oui : localement à chaque action dans ton navigateur, et en cloud multi-appareils dès que tu connectes ton Compte Google depuis l’en-tête.',
  },
];
