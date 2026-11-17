import type { BlogArticle, VersusPage, GuidePage } from './seoContent';
import type { Locale } from './seoContent';

/**
 * Dossiers, comparatifs, guides et FAQ en français (source), anglais et espagnol.
 * Les textes français ci-dessous REMPLACENT ceux de seoContent.ts à l'affichage : ils décrivent le jeu tel qu'il est
 * aujourd'hui (loyer, impôt, outils limités, énigmes), pas les anciennes règles.
 */

type Sections = { heading: string; body: string }[];
interface BlogText { title: string; excerpt: string; updatedLabel: string; keywords: string[]; sections: Sections }
interface VersusText { title: string; metaDesc: string; directAnswer: string; rows: { criteria: string; cashNoir: string; other: string }[]; verdict: string }
interface GuideText { title: string; metaDesc: string; steps: { title: string; detail: string }[] }

const BLOG: Record<string, Record<Locale, BlogText>> = {
  'ia-temps-reel-vs-arbres-de-dialogue': {
    fr: {
      title: 'Pourquoi les arbres de dialogue sont morts : négocier face à des agents IA en temps réel',
      excerpt: 'Dans la plupart des jeux de gestion ou d’interrogatoire, tu devines quelle option A/B/C le développeur a prévue. Voici comment CASH NOIR remplace le script par de vrais agents psychologiques.',
      updatedLabel: '4 novembre 2026',
      keywords: ['jeu IA temps réel', 'négociation jeu vidéo', 'PNJ autonomes', 'CASH NOIR'],
      sections: [
        { heading: 'Le mensonge du « choix multiple »', body: 'Dans un jeu classique, le PNJ n’écoute rien : il attend un clic sur un bouton pré-écrit. Dès ta deuxième partie, tu connais les répliques par cœur et la tension disparaît. Sur un vrai marché noir à 3h du matin, personne ne te donne trois réponses polies entre lesquelles choisir.' },
        { heading: 'Trois jauges vivantes, un prix plancher mouvant', body: 'Chaque personnage de CASH NOIR est piloté par un moteur psychologique couplé à un agent IA en temps réel. Ses jauges de Peur, Colère et Méfiance réagissent au sens exact de ta phrase : cite son prénom avant qu’il ne le donne, touche sa faille ou pose un indice précis sur le comptoir — son prix plancher baisse en direct.' },
        { heading: 'La limite à ne jamais franchir', body: 'Pousser un client n’est jamais gratuit. Chaque profil a sa ligne rouge : traite un hacker paranoïaque d’amateur ou menace physiquement un cadre acculé, sa Colère passe 80 % et il dégaine son arme sur le comptoir.' },
      ],
    },
    en: {
      title: 'Why dialogue trees are dead: negotiating with real-time AI agents',
      excerpt: 'In most management or interrogation games, you can guess which A/B/C option the developer planned. Here is how CASH NOIR replaces the script with real psychological agents.',
      updatedLabel: 'November 4, 2026',
      keywords: ['real-time AI game', 'negotiation video game', 'autonomous NPCs', 'CASH NOIR'],
      sections: [
        { heading: 'The “multiple choice” lie', body: 'In a classic game, the NPC listens to nothing: it waits for a click on a pre-written button. By your second playthrough you know every line by heart and the tension is gone. On a real black market at 3 a.m., nobody hands you three polite answers to pick from.' },
        { heading: 'Three living gauges, a moving floor price', body: 'Every CASH NOIR character is driven by a psychology engine coupled to a real-time AI agent. Their Fear, Anger and Suspicion gauges react to the exact meaning of your sentence: use their first name before they give it, hit their weak spot, or lay a precise clue on the counter — and their floor price drops live.' },
        { heading: 'The line you must never cross', body: 'Pushing a client is never free. Every profile has a red line: call a paranoid hacker an amateur or physically threaten a cornered executive, and their Anger passes 80% and they draw a weapon on the counter.' },
      ],
    },
    es: {
      title: 'Por qué los árboles de diálogo han muerto: negociar con agentes de IA en tiempo real',
      excerpt: 'En la mayoría de los juegos de gestión o interrogatorio, adivinas qué opción A/B/C previó el desarrollador. Así sustituye CASH NOIR el guion por auténticos agentes psicológicos.',
      updatedLabel: '4 de noviembre de 2026',
      keywords: ['juego de IA en tiempo real', 'negociación videojuego', 'PNJ autónomos', 'CASH NOIR'],
      sections: [
        { heading: 'La mentira de la «opción múltiple»', body: 'En un juego clásico, el PNJ no escucha nada: espera un clic en un botón escrito de antemano. En tu segunda partida ya te sabes las réplicas de memoria y la tensión desaparece. En un mercado negro de verdad a las 3 de la madrugada, nadie te da tres respuestas educadas entre las que elegir.' },
        { heading: 'Tres barras vivas, un precio mínimo móvil', body: 'Cada personaje de CASH NOIR está dirigido por un motor psicológico acoplado a un agente de IA en tiempo real. Sus barras de Miedo, Ira y Desconfianza reaccionan al sentido exacto de tu frase: usa su nombre antes de que lo diga, toca su punto débil o deja una pista precisa sobre el mostrador, y su precio mínimo baja en directo.' },
        { heading: 'El límite que nunca debes cruzar', body: 'Presionar a un cliente nunca sale gratis. Cada perfil tiene su línea roja: llama aficionado a un hacker paranoico o amenaza físicamente a un ejecutivo acorralado, y su Ira pasa del 80 % y saca un arma sobre el mostrador.' },
      ],
    },
  },
  'survivre-au-jour-5-infiltres': {
    fr: {
      title: 'Comment démasquer un infiltré : le cap critique du Jour 5',
      excerpt: 'Dès le Jour 2, la Brigade Financière envoie des pièces appâts pour faire tomber les receleurs trop gourmands. Ni le prix, ni la Loupe, ni l’UV ne tranchent à ta place.',
      updatedLabel: '9 novembre 2026',
      keywords: ['guide CASH NOIR', 'démasquer infiltré', 'lampe UV', 'stratégie receleur'],
      sections: [
        { heading: 'Un prix correct ne prouve rien', body: 'Un infiltré demande un prix dans la même fourchette qu’un vrai vendeur et sa pièce ressemble à une pièce honnête : ni le prix, ni l’étiquette, ni le premier regard à la Loupe ne le trahissent.' },
        { heading: 'Loupe, UV et Radio : des indices, pas des verdicts', body: 'L’UV peut montrer un marquage net, un marquage partiel impossible à trancher, ou même un faux positif sur un vendeur honnête. Chaque outil n’ajoute qu’un peu de peur et ne se « cuisine » qu’une fois par client : il faut surtout parler et observer ses réactions.' },
        { heading: 'Le coût d’une fausse accusation', body: 'Virer un client réglo en le traitant de flic te coûte 250 $ de dédommagement, ajoute du Heat et grave une vengeance auprès de sa faction. Quelques jours plus tard, elle te renvoie un client plus dur, déjà en colère à la porte.' },
      ],
    },
    en: {
      title: 'How to expose an undercover agent: the critical Day 5 threshold',
      excerpt: 'From Day 2, the Financial Crimes Squad sends bait pieces to bring down greedy fences. Neither the price, the loupe nor the UV lamp decides for you.',
      updatedLabel: 'November 9, 2026',
      keywords: ['CASH NOIR guide', 'expose undercover agent', 'UV lamp', 'fence strategy'],
      sections: [
        { heading: 'A fair price proves nothing', body: 'An undercover agent asks a price in the same range as a real seller and their piece looks like an honest one: neither the price, the label nor a first look through the loupe gives them away.' },
        { heading: 'Loupe, UV and Radio: clues, not verdicts', body: 'The UV lamp can show a clear marking, a partial marking you cannot read, or even a false positive on an honest seller. Each tool adds only a little fear and can be “grilled” once per client: above all, talk and watch how they react.' },
        { heading: 'The cost of a false accusation', body: 'Throwing out an honest client by calling them a cop costs you $250 in compensation, adds Heat and carves a grudge into their faction. A few days later it sends you a tougher client, already angry at the door.' },
      ],
    },
    es: {
      title: 'Cómo desenmascarar a un infiltrado: el umbral crítico del Día 5',
      excerpt: 'Desde el Día 2, la Brigada Financiera envía piezas cebo para hundir a los peristas demasiado codiciosos. Ni el precio, ni la lupa, ni la luz UV deciden por ti.',
      updatedLabel: '9 de noviembre de 2026',
      keywords: ['guía CASH NOIR', 'desenmascarar infiltrado', 'lámpara UV', 'estrategia de perista'],
      sections: [
        { heading: 'Un precio razonable no prueba nada', body: 'Un infiltrado pide un precio dentro del mismo rango que un vendedor real y su pieza parece honesta: ni el precio, ni la etiqueta, ni una primera mirada con la lupa lo delatan.' },
        { heading: 'Lupa, UV y Radio: pistas, no veredictos', body: 'La luz UV puede mostrar un marcado nítido, un marcado parcial imposible de interpretar o incluso un falso positivo en un vendedor honesto. Cada herramienta añade solo un poco de miedo y se puede «cuestionar» una vez por cliente: sobre todo, habla y observa sus reacciones.' },
        { heading: 'El coste de una falsa acusación', body: 'Echar a un cliente honesto llamándolo policía te cuesta 250 $ de indemnización, suma Heat y graba un rencor en su facción. Unos días después te envía un cliente más duro, ya furioso en la puerta.' },
      ],
    },
  },
  'economie-marche-noir-blanchiment': {
    fr: {
      title: 'De 2 500 $ à l’Ascension : loyer, impôt, Compte Suisse et Syndicats',
      excerpt: 'Le loyer monte chaque nuit et le cash en main est taxé : accumuler en caisse est le meilleur moyen de tout perdre. Guide de la survie économique sur la durée.',
      updatedLabel: '14 novembre 2026',
      keywords: ['compte suisse CASH NOIR', 'syndicats', 'codex reliques', 'ascension'],
      sections: [
        { heading: 'Le loyer et l’impôt font mal', body: 'Chaque soir, le Syndicat réclame 500 $ + 350 $ par jour de jeu, plus un impôt sur ton cash en main (de 8 % à 25 %). Si tu ne peux pas payer, la boutique est saisie. Garde un œil sur le chiffre « Loyer » affiché en haut de l’écran.' },
        { heading: 'Le Compte Suisse protège de la ruine', body: 'Blanchis ton surplus vers le Compte Suisse (10 % de frais) : même si tu fais faillite, ton argent offshore et tes actifs survivent et te permettent de repartir.' },
        { heading: 'Syndicats, Codex et doubles fonds', body: 'Chaque vente ou refus modifie ta réputation auprès des 5 Syndicats. Compléter une des 6 séries du Codex (36 pièces) débloque des atouts permanents, et certaines pièces cachent un double fond : une énigme à résoudre pour du cash, de l’XP ou moins de Heat.' },
      ],
    },
    en: {
      title: 'From $2,500 to Ascension: rent, tax, the Swiss Account and the Syndicates',
      excerpt: 'Rent rises every night and cash in hand is taxed: stacking cash in the register is the best way to lose everything. A guide to economic survival over the long run.',
      updatedLabel: 'November 14, 2026',
      keywords: ['CASH NOIR Swiss account', 'syndicates', 'codex relics', 'ascension'],
      sections: [
        { heading: 'Rent and tax bite', body: 'Every night the Syndicate demands $500 + $350 per day played, plus a tax on your cash in hand (8% to 25%). If you cannot pay, the shop is seized. Keep an eye on the “Rent” figure at the top of the screen.' },
        { heading: 'The Swiss Account protects you from ruin', body: 'Launder your surplus into the Swiss Account (10% fee): even if you go bust, your offshore money and assets survive and let you start again.' },
        { heading: 'Syndicates, Codex and false bottoms', body: 'Every sale or refusal changes your reputation with the 5 Syndicates. Completing one of the 6 Codex sets (36 pieces) unlocks permanent perks, and some pieces hide a false bottom: a riddle to solve for cash, XP or lower Heat.' },
      ],
    },
    es: {
      title: 'De 2 500 $ a la Ascensión: alquiler, impuestos, cuenta suiza y Sindicatos',
      excerpt: 'El alquiler sube cada noche y el efectivo en mano paga impuestos: acumular en caja es la mejor forma de perderlo todo. Guía de supervivencia económica a largo plazo.',
      updatedLabel: '14 de noviembre de 2026',
      keywords: ['cuenta suiza CASH NOIR', 'sindicatos', 'reliquias del códice', 'ascensión'],
      sections: [
        { heading: 'El alquiler y los impuestos duelen', body: 'Cada noche el Sindicato exige 500 $ + 350 $ por día jugado, más un impuesto sobre tu efectivo en mano (del 8 % al 25 %). Si no puedes pagar, te embargan la tienda. Vigila la cifra «Alquiler» en la parte superior de la pantalla.' },
        { heading: 'La cuenta suiza te protege de la ruina', body: 'Blanquea tu excedente en la cuenta suiza (10 % de comisión): aunque quiebres, tu dinero offshore y tus activos sobreviven y te permiten volver a empezar.' },
        { heading: 'Sindicatos, Códice y dobles fondos', body: 'Cada venta o rechazo cambia tu reputación con los 5 Sindicatos. Completar una de las 6 series del Códice (36 piezas) desbloquea ventajas permanentes, y algunas piezas esconden un doble fondo: un acertijo que da efectivo, XP o menos Heat.' },
      ],
    },
  },
};

const VERSUS: Record<string, Record<'en' | 'es', VersusText>> = {
  'papers-please': {
    en: {
      title: 'CASH NOIR vs Papers, Please: counter control or free AI interrogation?',
      metaDesc: 'Full comparison between CASH NOIR and Papers, Please: booth mechanics, stamps, suspicion, freedom of dialogue and long-term replayability.',
      directAnswer: 'Papers, Please excels at timed administrative sorting on fixed rules, while CASH NOIR moves the booth tension into a night-time fence counter with free negotiation against real-time AI agents.',
      rows: [
        { criteria: 'Type of interaction', cashNoir: 'Free text in real time against AI agents', other: 'Manual document inspection + fixed stamp' },
        { criteria: 'What is at stake', cashNoir: 'Drive the price down and avoid undercover agents', other: 'Approve or refuse entry according to decrees' },
        { criteria: 'Long-term replayability', cashNoir: '20 written characters, 36 Codex relics, 5 syndicates, NG+', other: '31-day narrative campaign + endless mode' },
        { criteria: 'Access', cashNoir: 'Free browser / PWA, nothing to install', other: 'Paid (Steam / mobile)' },
      ],
      verdict: 'If you love the cold paranoia of Papers, Please but want to talk freely to suspects who bluff and genuinely lose their temper, CASH NOIR is the logical next step.',
    },
    es: {
      title: 'CASH NOIR vs Papers, Please: control de ventanilla o interrogatorio libre con IA',
      metaDesc: 'Comparativa completa entre CASH NOIR y Papers, Please: mecánica de ventanilla, sellos, sospecha, libertad de diálogo y rejugabilidad a largo plazo.',
      directAnswer: 'Papers, Please destaca en la clasificación administrativa cronometrada con reglas fijas, mientras que CASH NOIR traslada la tensión de la ventanilla a un mostrador nocturno de perista con negociación libre frente a agentes de IA en tiempo real.',
      rows: [
        { criteria: 'Tipo de interacción', cashNoir: 'Texto libre en tiempo real frente a agentes de IA', other: 'Inspección manual de documentos + sello fijo' },
        { criteria: 'Lo que está en juego', cashNoir: 'Bajar el precio y evitar a los infiltrados', other: 'Aprobar o rechazar la entrada según los decretos' },
        { criteria: 'Rejugabilidad a largo plazo', cashNoir: '20 personajes escritos, 36 reliquias del Códice, 5 sindicatos, NG+', other: 'Campaña narrativa de 31 días + modo infinito' },
        { criteria: 'Acceso', cashNoir: 'Navegador / PWA gratis, sin instalar nada', other: 'De pago (Steam / móvil)' },
      ],
      verdict: 'Si te gusta la paranoia fría de Papers, Please pero quieres hablar libremente con sospechosos que se marcan faroles y se enfadan de verdad, CASH NOIR es el siguiente paso lógico.',
    },
  },
  'dealers-life': {
    en: {
      title: 'CASH NOIR vs Dealer’s Life: real AI crime thriller or flea-market sim?',
      metaDesc: 'CASH NOIR vs Dealer’s Life 2: classic percentage haggling against real-time AI psychology, police, syndicates and deadly traps.',
      directAnswer: 'Dealer’s Life relies on price sliders and simple statistical traits; CASH NOIR stages autonomous AI sellers who react to your arguments, UV clues and the police radio.',
      rows: [
        { criteria: 'Negotiation', cashNoir: 'Open dialogue + 3 gauges (Fear, Anger, Suspicion)', other: 'Offer slider and patience bar' },
        { criteria: 'Real risk', cashNoir: 'Undercover agents, hold-ups at the counter, police raids', other: 'Counterfeits and simple financial losses' },
        { criteria: 'Atmosphere', cashNoir: 'Neo-noir 3 a.m., rain and procedural music', other: 'Colorful cartoon humor' },
        { criteria: 'Competition', cashNoir: 'Global 24h daily contract + 3 AI rivals', other: 'Pure solo' },
      ],
      verdict: 'To go from a light flea-market game to a crime thriller where every badly chosen sentence can trigger a hold-up.',
    },
    es: {
      title: 'CASH NOIR vs Dealer’s Life: thriller criminal con IA o simulador de rastro',
      metaDesc: 'CASH NOIR vs Dealer’s Life 2: regateo clásico por porcentajes frente a psicología de IA en tiempo real, policía, sindicatos y trampas mortales.',
      directAnswer: 'Dealer’s Life se basa en deslizadores de precio y rasgos estadísticos simples; CASH NOIR pone en escena vendedores de IA autónomos que reaccionan a tus argumentos, a las pistas UV y a la radio de la policía.',
      rows: [
        { criteria: 'Negociación', cashNoir: 'Diálogo abierto + 3 barras (Miedo, Ira, Desconfianza)', other: 'Deslizador de oferta y barra de paciencia' },
        { criteria: 'Riesgo real', cashNoir: 'Infiltrados, atracos en el mostrador, redadas policiales', other: 'Falsificaciones y pérdidas económicas simples' },
        { criteria: 'Ambiente', cashNoir: 'Neo-noir de las 3 de la madrugada, lluvia y música procedural', other: 'Humor de dibujos animados colorido' },
        { criteria: 'Competición', cashNoir: 'Contrato diario mundial de 24 h + 3 rivales de IA', other: 'Solo puro' },
      ],
      verdict: 'Para pasar de un juego ligero de mercadillo a un thriller criminal donde cada frase mal elegida puede desencadenar un atraco.',
    },
  },
  'disco-elysium': {
    en: {
      title: 'CASH NOIR vs Disco Elysium: short-form psychological interrogation vs sprawling RPG',
      metaDesc: 'CASH NOIR vs Disco Elysium: reading a suspect’s psychological weak spots in a tense 10-minute browser session.',
      directAnswer: 'Disco Elysium is a 40-hour narrative RPG masterpiece with written multiple choices; CASH NOIR captures the thrill of psychological reading in quick 10-minute sessions against unpredictable AI agents.',
      rows: [
        { criteria: 'Session format', cashNoir: 'Instant tension: 5 to 15 min per night', other: 'Investigation RPG of 30 to 50 hours' },
        { criteria: 'Dialogue engine', cashNoir: 'Reactive real-time AI agents (no fixed script)', other: 'Brilliant but fixed literary tree' },
        { criteria: 'Core mechanic', cashNoir: 'Psychological pressure + fencing economy', other: 'Dice rolls across 24 inner skills' },
      ],
      verdict: 'Complementary: the same taste for human flaws and grimy atmosphere, condensed into tense duels you can replay endlessly.',
    },
    es: {
      title: 'CASH NOIR vs Disco Elysium: interrogatorio psicológico corto frente a un RPG fluvial',
      metaDesc: 'CASH NOIR vs Disco Elysium: leer los puntos débiles psicológicos de un sospechoso en una tensa sesión de 10 minutos en el navegador.',
      directAnswer: 'Disco Elysium es una obra maestra de RPG narrativo de 40 horas con opciones múltiples escritas; CASH NOIR captura la emoción de la lectura psicológica en sesiones rápidas de 10 minutos contra agentes de IA impredecibles.',
      rows: [
        { criteria: 'Formato de sesión', cashNoir: 'Tensión inmediata: de 5 a 15 min por noche', other: 'RPG de investigación de 30 a 50 horas' },
        { criteria: 'Motor de diálogo', cashNoir: 'Agentes de IA reactivos en tiempo real (sin guion fijo)', other: 'Árbol literario brillante pero fijo' },
        { criteria: 'Mecánica central', cashNoir: 'Presión psicológica + economía de perista', other: 'Tiradas de dados sobre 24 habilidades interiores' },
      ],
      verdict: 'Complementarios: el mismo gusto por la falla humana y el ambiente sucio, condensado en duelos tensos rejugables sin fin.',
    },
  },
};

const GUIDES: Record<string, Record<Locale, GuideText>> = {
  'negociation-ia-temps-reel': {
    fr: {
      title: 'Guide complet : faire craquer un agent IA sans le faire exploser dans CASH NOIR',
      metaDesc: 'Méthode étape par étape pour faire baisser le prix d’un vendeur IA sans pousser sa Colère à 80 %.',
      steps: [
        { title: '1. Ne propose pas de prix au premier tour', detail: 'Commence par parler et observer : la Loupe, l’UV et la Radio donnent des indices matériels, pas des réponses. La faille et la ligne rouge du vendeur n’apparaissent dans le Carnet de Comptoir qu’après deux échanges.' },
        { title: '2. Touche sa faille avec tes propres mots', detail: 'Cite le prénom du client avant qu’il ne le donne, ou appuie-toi sur un détail précis de la pièce. La Peur monte de 10 à 25 points par tour, de moins en moins vite : répéter la même phrase ne sert à rien.' },
        { title: '3. Évite la ligne rouge et conclus', detail: 'Une fois sa Peur installée (au-dessus d’environ 55 %) et sa Colère basse, propose un prix net bien en dessous de sa demande. Une offre trop basse dès le début l’énerve au lieu de le faire plier.' },
      ],
    },
    en: {
      title: 'Complete guide: crack an AI agent without making them explode in CASH NOIR',
      metaDesc: 'A step-by-step method to bring an AI seller’s price down without pushing their Anger to 80%.',
      steps: [
        { title: '1. Never name a price on turn one', detail: 'Start by talking and watching: the Loupe, UV and Radio give material clues, not answers. The seller’s weak spot and red line only appear in the Counter Notebook after two exchanges.' },
        { title: '2. Hit their weak spot with your own words', detail: 'Use the client’s first name before they give it, or lean on a precise detail of the piece. Fear rises by 10 to 25 points per turn, ever more slowly: repeating the same sentence gets you nothing.' },
        { title: '3. Avoid the red line and close', detail: 'Once their Fear is set (above roughly 55%) and their Anger is low, offer a clean price well below their ask. An offer that is too low too early angers them instead of making them give in.' },
      ],
    },
    es: {
      title: 'Guía completa: hacer ceder a un agente de IA sin que explote en CASH NOIR',
      metaDesc: 'Método paso a paso para bajar el precio de un vendedor de IA sin llevar su Ira al 80 %.',
      steps: [
        { title: '1. No propongas precio en el primer turno', detail: 'Empieza hablando y observando: la Lupa, la UV y la Radio dan pistas materiales, no respuestas. El punto débil y la línea roja del vendedor solo aparecen en el Cuaderno del Mostrador tras dos intercambios.' },
        { title: '2. Toca su punto débil con tus propias palabras', detail: 'Usa el nombre del cliente antes de que lo diga, o apóyate en un detalle preciso de la pieza. El Miedo sube de 10 a 25 puntos por turno, cada vez más despacio: repetir la misma frase no sirve de nada.' },
        { title: '3. Evita la línea roja y cierra', detail: 'Cuando su Miedo esté asentado (por encima de un 55 % aproximadamente) y su Ira sea baja, ofrece un precio limpio muy por debajo de su petición. Una oferta demasiado baja demasiado pronto lo enfurece en lugar de hacerlo ceder.' },
      ],
    },
  },
  'codex-reliques-mythiques': {
    fr: {
      title: 'Guide Codex : les 36 reliques et les 6 atouts permanents à débloquer',
      metaDesc: 'Liste des 6 collections du Codex du Receleur dans CASH NOIR et comment activer Immunité Fédérale, Œil d’Expert et Brouillage Total.',
      steps: [
        { title: 'Atteins le Jour 3 pour débloquer Légendaires et Mythiques', detail: 'Les pièces Mythiques (Clé Ledger 450 BTC, Diamant Bleu de Golconde, Katana Muramasa 1620) n’apparaissent qu’à partir du Jour 3.' },
        { title: 'Utilise les Syndicats pour baisser la note', detail: 'Plus tu aides un Syndicat, plus il te fait de prix : un Allié te vend à meilleur compte, un Hostile t’envoie des braquages.' },
        { title: 'Sauvegarde ton Codex sur Compte Google', detail: 'Ton Codex et tes atouts débloqués survivent à la faillite, à l’Ascension et à chaque changement de saison.' },
      ],
    },
    en: {
      title: 'Codex guide: the 36 relics and the 6 permanent perks to unlock',
      metaDesc: 'The 6 Fence Codex collections in CASH NOIR and how to activate Federal Immunity, Expert’s Eye and Total Jamming.',
      steps: [
        { title: 'Reach Day 3 to unlock Legendary and Mythic pieces', detail: 'Mythic pieces (Ledger key with 450 BTC, Golconda Blue Diamond, 1620 Muramasa Katana) only appear from Day 3.' },
        { title: 'Use the Syndicates to lower the bill', detail: 'The more you help a Syndicate, the better its prices: an Ally sells to you for less, a Hostile sends you hold-ups.' },
        { title: 'Save your Codex to a Google account', detail: 'Your Codex and unlocked perks survive bankruptcy, Ascension and every season change.' },
      ],
    },
    es: {
      title: 'Guía del Códice: las 36 reliquias y las 6 ventajas permanentes que desbloquear',
      metaDesc: 'Las 6 colecciones del Códice del Perista en CASH NOIR y cómo activar Inmunidad Federal, Ojo Experto e Interferencia Total.',
      steps: [
        { title: 'Llega al Día 3 para desbloquear Legendarias y Míticas', detail: 'Las piezas Míticas (Llave Ledger de 450 BTC, Diamante Azul de Golconda, Katana Muramasa de 1620) solo aparecen a partir del Día 3.' },
        { title: 'Usa los Sindicatos para bajar la factura', detail: 'Cuanto más ayudas a un Sindicato, mejores precios te hace: un Aliado te vende más barato, un Hostil te envía atracos.' },
        { title: 'Guarda tu Códice en una cuenta de Google', detail: 'Tu Códice y tus ventajas desbloqueadas sobreviven a la quiebra, a la Ascensión y a cada cambio de temporada.' },
      ],
    },
  },
};

const FAQ: Record<Locale, { q: string; a: string }[]> = {
  fr: [
    { q: 'Comment fonctionnent les personnages IA dans CASH NOIR ?', a: 'Chaque vendeur est un agent IA autonome relié à trois jauges psychologiques (Peur, Colère, Méfiance), un secret personnel et un prix plancher calculé en direct. Il n’y a aucun arbre de dialogue figé : tu écris ce que tu veux et le personnage réagit à tes preuves, tes menaces ou tes erreurs.' },
    { q: 'Quelle est la différence entre la page d’accueil et /play ?', a: 'Les pages /, /blog, /vs et /guides présentent l’univers, les comparatifs et les dossiers tactiques. Le jeu complet tourne directement sur /play (et /play/daily pour le Contrat du Jour mondial).' },
    { q: 'Est-ce que ma progression et mon Codex sont sauvegardés ?', a: 'Oui : localement à chaque action dans ton navigateur, et en cloud multi-appareils dès que tu connectes ton Compte Google depuis l’en-tête.' },
  ],
  en: [
    { q: 'How do the AI characters work in CASH NOIR?', a: 'Every seller is an autonomous AI agent tied to three psychological gauges (Fear, Anger, Suspicion), a personal secret and a floor price computed live. There is no fixed dialogue tree: you write whatever you want and the character reacts to your proof, threats or mistakes.' },
    { q: 'What is the difference between the home page and /play?', a: 'The /, /blog, /vs and /guides pages present the universe, the comparisons and the tactical guides. The full game runs directly on /play (and /play/daily for the global Daily Contract).' },
    { q: 'Are my progress and my Codex saved?', a: 'Yes: locally after every action in your browser, and in the cloud across devices as soon as you connect your Google account from the header.' },
  ],
  es: [
    { q: '¿Cómo funcionan los personajes de IA en CASH NOIR?', a: 'Cada vendedor es un agente de IA autónomo ligado a tres barras psicológicas (Miedo, Ira, Desconfianza), un secreto personal y un precio mínimo calculado en directo. No hay ningún árbol de diálogo fijo: escribes lo que quieras y el personaje reacciona a tus pruebas, amenazas o errores.' },
    { q: '¿Cuál es la diferencia entre la página de inicio y /play?', a: 'Las páginas /, /blog, /vs y /guides presentan el universo, las comparativas y las guías tácticas. El juego completo funciona directamente en /play (y en /play/daily para el Contrato Diario mundial).' },
    { q: '¿Se guardan mi progreso y mi Códice?', a: 'Sí: localmente tras cada acción en tu navegador, y en la nube entre dispositivos en cuanto conectes tu cuenta de Google desde la cabecera.' },
  ],
};

/** Dossier de blog dans la langue demandée (le texte français d'ici remplace celui de seoContent.ts). */
export function localizeBlog(a: BlogArticle, locale: Locale): BlogArticle {
  const t = BLOG[a.slug]?.[locale];
  return t ? { ...a, title: t.title, excerpt: t.excerpt, updatedLabel: t.updatedLabel, keywords: t.keywords, sections: t.sections } : a;
}

export function localizeVersus(v: VersusPage, locale: Locale): VersusPage {
  const t = locale === 'fr' ? undefined : VERSUS[v.slug]?.[locale];
  return t ? { ...v, ...t } : v;
}

export function localizeGuide(g: GuidePage, locale: Locale): GuidePage {
  const t = GUIDES[g.slug]?.[locale];
  return t ? { ...g, title: t.title, metaDesc: t.metaDesc, steps: t.steps } : g;
}

export function localizeFaq(locale: Locale): { q: string; a: string }[] {
  return FAQ[locale];
}
