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
  }
> = {
  fr: {
    htmlLang: 'fr',
    metaTitle: 'CASH NOIR — Interrogatoire psychologique face à des agents IA en temps réel',
    metaDesc:
      'Zéro dialogue pré-écrit. Négocie en temps réel face à des personnages psychologiques autonomes, démasque les infiltrés sous lampe UV et bâtis ton empire criminel.',
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
        label: 'Peur · Colère · Méfiance',
        text: 'Trois jauges vivantes calculées à chaque réplique. À 80 % de Colère, la négociation s’arrête au bout d’un canon.',
      },
      {
        label: '20 profils écrits, zéro clone',
        text: 'Chirurgienne radiée, artificier amputé, hackeuse sous bracelet : chacun arrive avec sa gueule, son secret et sa ligne rouge.',
      },
      {
        label: 'Mémoire & Rancune',
        text: 'Ce que tu refuses enrichit tes 3 rivaux. Ce que tu braques revient te chercher deux à cinq nuits plus tard.',
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
    castEyebrow: 'Casting Écrit · Saison 1',
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
      'Campagne infinie & casting IA écrit',
      'Loupe, Lampe UV, Scanner police',
      'Contrat mondial quotidien (1 essai/j)',
      'Sauvegarde locale & Compte Google',
    ],
    freeBtn: 'Jouer gratuitement →',
    vipLabel: 'Pass Syndicat · 30 jours',
    vipPrice: 'Accès VIP',
    vipBullets: [
      'Publication au Classement Mondial officiel',
      'Accès complet aux Épisodes de Saison',
      'Sauvegarde Cloud multi-appareils & Codex',
      'Soutien direct aux serveurs IA temps réel',
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
  },
  en: {
    htmlLang: 'en',
    metaTitle: 'CASH NOIR — Real-Time AI Black-Market Interrogation Game',
    metaDesc:
      'No dialogue trees. Negotiate in real time against 20 hand-written AI sellers with live fear, anger, and secrets. Expose undercover cops and build your empire.',
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
        label: 'Fear · Anger · Suspicion',
        text: 'Three live meters recalculated every turn. Push Anger past 80% and negotiation ends down the barrel of a gun.',
      },
      {
        label: '20 Faces, Zero Clones',
        text: 'Disbarred surgeons, amputee smugglers, ankle-monitor hackers — each arrives with their own face, flaw, and red line.',
      },
      {
        label: 'Memory & Grudges',
        text: 'Refuse a deal and 3 rival fences poach it. Cross a syndicate and they send hostile sellers 2–5 nights later.',
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
    castEyebrow: '20 hand-written characters · Season',
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
      'Endless career & 20 hand-written AI characters',
      'Loupe, UV Lamp, Police Scanner',
      'Daily global contract (1 shot/day)',
      'Local save & Google Account sync',
    ],
    freeBtn: 'Play Free →',
    vipLabel: 'Syndicate Pass · 30 Days',
    vipPrice: 'VIP Access',
    vipBullets: [
      'Official Global Leaderboard publishing',
      'Full access to Seasonal Story Episodes',
      'Cross-device Cloud Save & Codex',
      'Direct support for real-time AI servers',
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
  },
  es: {
    htmlLang: 'es',
    metaTitle: 'CASH NOIR — Juego de interrogatorio noir con agentes IA en tiempo real',
    metaDesc:
      'Sin árboles de diálogo escritos. Negocia en tiempo real contra 20 vendedores IA escritos a mano con miedo, ira y secretos reales. Desenmascara infiltrados y domina la ciudad.',
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
        label: 'Miedo · Ira · Desconfianza',
        text: 'Tres medidores vivos en cada turno. Si la Ira supera el 80 %, la negociación termina frente a un cañón.',
      },
      {
        label: '20 rostros, cero clones',
        text: 'Cirujana inhabilitada, contrabandista amputado, hacker con tobillera: cada uno tiene su ficha, su grieta y su límite.',
      },
      {
        label: 'Memoria y Rencor',
        text: 'Lo que rechazas lo compran 3 rivales IA. Si traicionas a un sindicato, vuelve a por ti noches después.',
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
    castEyebrow: '20 personajes escritos a mano · Temporada',
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
      'Campaña infinita y 20 personajes IA',
      'Lupa, Lámpara UV y Escáner policial',
      'Contrato mundial diario (1 intento/día)',
      'Guardado local y Cuenta Google',
    ],
    freeBtn: 'Jugar gratis →',
    vipLabel: 'Pase Sindicato · 30 días',
    vipPrice: 'Acceso VIP',
    vipBullets: [
      'Publicación oficial en el Ranking Mundial',
      'Acceso total a Episodios de Temporada',
      'Guardado Cloud multidispositivo y Codex',
      'Soporte directo a servidores IA en vivo',
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
      { criteria: 'Rejouabilité long terme', cashNoir: '20 persos, 36 reliques Codex, 5 syndicats, NG+', other: 'Campagne narrative de 31 jours + mode infini' },
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
