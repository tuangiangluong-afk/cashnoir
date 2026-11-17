import type { SeasonEpisode } from './seasons';

/**
 * Suite de la campagne : saisons 2 à 6 complétées (4 épisodes chacune → 24 épisodes au total avec la saison 1).
 * Le jeu en débloque un par semaine à partir de la première partie (voir episodesUnlocked dans seasons.ts).
 */
export const MORE_EPISODES: SeasonEpisode[] = [
  // ---- Saison 2 — La Chute de l’Oligarque
  {
    id: 's2-e3', seasonNumber: 2, episodeNumber: 3, title: 'Épisode 3 · Le Videur du Quai Rouge', castId: 'c009', castName: 'Rico Santana', faction: 'Cercle des Jeux',
    synopsis: 'L’oligarque est tombé, son ancien videur survit en vendant ce qu’il a vu : un carnet de visiteurs que la moitié de la ville voudrait brûler.',
    stakes: 'Obtiens le carnet sans qu’il comprenne combien il vaut.', rewardXp: 800, rewardCash: 1500, unlockCodexId: 'cle-usb-procureur',
  },
  {
    id: 's2-e4', seasonNumber: 2, episodeNumber: 4, title: 'Final · La Confession de l’Oligarque', castId: 'c007', castName: 'Père Moreau', faction: 'Mairie & Promoteurs',
    synopsis: 'L’aumônier a recueilli les dernières confessions de l’oligarque. Elles dorment dans un missel que personne n’ose ouvrir.',
    stakes: 'Fais parler un homme qui a juré de se taire, sans le traiter d’hypocrite.', rewardXp: 1000, rewardCash: 2200, unlockCodexId: 'calice-templier',
  },
  // ---- Saison 3 — Code Zéro-Day
  {
    id: 's3-e2', seasonNumber: 3, episodeNumber: 2, title: 'Épisode 2 · Le Serveur Fantôme', castId: 'c030', castName: 'Elena Chen', faction: 'Cercle des Jeux',
    synopsis: 'Elena a volé un serveur entier qui n’existe sur aucun plan. Quelqu’un la traque depuis trois nuits et elle ne dort plus.',
    stakes: 'Sois plus patient que sa paranoïa : une seule question de trop et elle disparaît.', rewardXp: 850, rewardCash: 1700, unlockCodexId: 'puce-zero-day',
  },
  {
    id: 's3-e3', seasonNumber: 3, episodeNumber: 3, title: 'Épisode 3 · La Fibre Noire', castId: 'c020', castName: 'Kévin Dumont', faction: 'Cercle des Jeux',
    synopsis: 'En réparant une ligne, Kévin a trouvé un câble qui ne mène nulle part officiellement. Il veut s’en débarrasser avant qu’on le retrouve.',
    stakes: 'Garde ton calme : il panique plus vite que tu ne comptes.', rewardXp: 900, rewardCash: 1800, unlockCodexId: 'antenne-starlink-pirate',
  },
  {
    id: 's3-e4', seasonNumber: 3, episodeNumber: 4, title: 'Final · Le Procès à Huis Clos', castId: 'c024', castName: 'Nora Novak', faction: 'Brigade Financière',
    synopsis: 'Une avocate radiée détient la preuve qui ferait tomber la Brigade. Elle te la vend, ou elle la vend à ceux qui t’arrêteront.',
    stakes: 'Reste sous 60 % de Heat : un seul faux pas et la preuve change de main.', rewardXp: 1100, rewardCash: 2400, unlockCodexId: 'boitier-surveillance-wifi',
  },
  // ---- Saison 4 — L’Hiver de la Bratva
  {
    id: 's4-e1', seasonNumber: 4, episodeNumber: 1, title: 'Épisode 1 · Le Traducteur de Mourmansk', castId: 'c011', castName: 'Tariq Mansour', faction: 'Docks du Nord',
    synopsis: 'Ex-traducteur militaire, Tariq a gardé un carnet de conversations interceptées entre deux parrains. L’un d’eux le cherche déjà.',
    stakes: 'Respecte son honneur de soldat, et il te donnera plus que ce qu’il vend.', rewardXp: 800, rewardCash: 1500, unlockCodexId: 'cryptophone-militaire',
  },
  {
    id: 's4-e2', seasonNumber: 4, episodeNumber: 2, title: 'Épisode 2 · La Passeuse de Minuit', castId: 'c018', castName: 'Olga Petrova', faction: 'Docks du Nord',
    synopsis: 'Olga fait passer des gens et des caisses par un port gelé. Cette nuit, elle transporte quelque chose qu’elle refuse de nommer.',
    stakes: 'Ne la traite jamais avec mépris : elle te coupera la route avant que tu parles.', rewardXp: 850, rewardCash: 1700, unlockCodexId: 'passeport-diplomatique',
  },
  {
    id: 's4-e3', seasonNumber: 4, episodeNumber: 3, title: 'Épisode 3 · Les Icônes du Glacier', castId: 'c022', castName: 'Inès Rousseau', faction: 'Docks du Nord',
    synopsis: 'Une restauratrice a copié trois icônes pour la Bratva. Elle sait laquelle est vraie, et elle a peur de le dire.',
    stakes: 'Fais-lui avouer quelle icône est authentique avant de payer.', rewardXp: 900, rewardCash: 1800, unlockCodexId: 'icone-byzantine',
  },
  {
    id: 's4-e4', seasonNumber: 4, episodeNumber: 4, title: 'Final · Le Convoi Blanc', castId: 'c021', castName: 'Marek Bouchard', faction: 'Mairie & Promoteurs',
    synopsis: 'Un convoi de fonds a « disparu » sous la neige. Marek était au volant et sait où sont les sacs. La Bratva aussi.',
    stakes: 'Achète avant eux, sans te mettre la Bratva à dos.', rewardXp: 1100, rewardCash: 2600, unlockCodexId: 'carte-militaire',
  },
  // ---- Saison 5 — Enchères de Minuit à Genève
  {
    id: 's5-e1', seasonNumber: 5, episodeNumber: 1, title: 'Épisode 1 · Le Lot Zéro', castId: 'c008', castName: 'Yuki Tanaka', faction: 'Clinique Privée Saint-Luc',
    synopsis: 'Yuki propose un lot qui ne figure sur aucun catalogue : une pièce retirée de la vente la veille, à la demande de quelqu’un de puissant.',
    stakes: 'Reste courtois : elle quitte la table devant la moindre offense.', rewardXp: 850, rewardCash: 1800, unlockCodexId: 'katana-edo-muramasa',
  },
  {
    id: 's5-e2', seasonNumber: 5, episodeNumber: 2, title: 'Épisode 2 · Les Pierres d’Anvers', castId: 'c026', castName: 'Chloé Ferrari', faction: 'Mairie & Promoteurs',
    synopsis: 'Chloé a échangé des pierres authentiques contre des copies pour couvrir une dette. Les vraies sont dans sa poche.',
    stakes: 'Prouve que tu sais distinguer le vrai du faux avant de sortir le cash.', rewardXp: 900, rewardCash: 1900, unlockCodexId: 'diamant-golconde',
  },
  {
    id: 's5-e3', seasonNumber: 5, episodeNumber: 3, title: 'Épisode 3 · La Vente Blanche', castId: 'c034', castName: 'Claire Varga', faction: 'Brigade Financière',
    synopsis: 'Une galériste en liquidation brade sa collection avant l’huissier. Certaines toiles sont des faux, d’autres viennent d’un cambriolage.',
    stakes: 'Trie les vraies des fausses sans lui montrer que tu doutes.', rewardXp: 950, rewardCash: 2000, unlockCodexId: 'lithographie-picasso',
  },
  {
    id: 's5-e4', seasonNumber: 5, episodeNumber: 4, title: 'Final · Le Dernier Marteau', castId: 'c019', castName: 'Léon Marchand', faction: 'Mairie & Promoteurs',
    synopsis: 'Le plus vieux brocanteur de la ville met en vente la pièce qui a ruiné sa famille. Il veut qu’elle finisse chez quelqu’un qui comprend.',
    stakes: 'Ne lui fais pas la leçon sur l’antiquité : écoute-le d’abord.', rewardXp: 1200, rewardCash: 2800, unlockCodexId: 'dessin-rembrandt',
  },
  // ---- Saison 6 — Opération Mains Sales
  {
    id: 's6-e1', seasonNumber: 6, episodeNumber: 1, title: 'Épisode 1 · La Taupe de la Brigade', castId: 'c014', castName: 'Sonia Morel', faction: 'Brigade Financière',
    synopsis: 'Une infiltrée des Stups se présente comme receleuse. Elle te teste depuis des semaines et ce soir, elle veut conclure.',
    stakes: 'Ne dis jamais que tu fais du recel, et ne l’accuse pas à tort.', rewardXp: 900, rewardCash: 1900, unlockCodexId: 'scanner-frequences-police',
  },
  {
    id: 's6-e2', seasonNumber: 6, episodeNumber: 2, title: 'Épisode 2 · Le Coffre de la Préfecture', castId: 'c029', castName: 'Milo Kowalski', faction: 'Brigade Financière',
    synopsis: 'Dépanneur de coffres, Milo en a ouvert un qu’il n’aurait jamais dû ouvrir. À l’intérieur, un dossier que quelqu’un veut brûler.',
    stakes: 'Obtiens le dossier en lui faisant croire que c’est lui qui décide.', rewardXp: 950, rewardCash: 2000, unlockCodexId: 'microfilm-stasi',
  },
  {
    id: 's6-e3', seasonNumber: 6, episodeNumber: 3, title: 'Épisode 3 · Le Garde du Corps', castId: 'c039', castName: 'Matteo Haddad', faction: 'Brigade Financière',
    synopsis: 'Matteo a protégé trop longtemps un homme qu’il méprise. Ce soir, il vend ce qu’il sait de son ancien patron.',
    stakes: 'Trouve ce qui le tient encore loyal, et pousse-le avec.', rewardXp: 1000, rewardCash: 2200, unlockCodexId: 'protocole-gladio',
  },
  {
    id: 's6-e4', seasonNumber: 6, episodeNumber: 4, title: 'Final · Le Dossier du Sénat', castId: 'c012', castName: 'Mélanie Gauthier', faction: 'Mairie & Promoteurs',
    synopsis: 'Une assistante parlementaire détient la preuve d’un système qui lave l’argent de toute la ville. Elle n’a plus personne à qui la vendre.',
    stakes: 'Tu es son dernier recours. Ne le lui fais pas sentir trop tôt.', rewardXp: 1300, rewardCash: 3200, unlockCodexId: 'valise-nucleaire',
  },
];

/** Traductions des titres, synopsis et enjeux : id → { en, es } de [titre, synopsis, enjeu]. */
export const MORE_EPISODE_TRANSLATIONS: Record<string, { en: [string, string, string]; es: [string, string, string] }> = {
  's2-e3': {
    en: ['Episode 3 · The Bouncer of Red Quay', 'The oligarch has fallen; his old bouncer survives by selling what he saw: a visitor log half the city would like to burn.', 'Get the log without letting him understand what it is worth.'],
    es: ['Episodio 3 · El portero del Muelle Rojo', 'El oligarca ha caído; su antiguo portero sobrevive vendiendo lo que vio: un registro de visitas que media ciudad quiere quemar.', 'Consigue el registro sin que entienda cuánto vale.'],
  },
  's2-e4': {
    en: ['Finale · The Oligarch’s Confession', 'The chaplain took the oligarch’s last confessions. They sleep inside a missal nobody dares open.', 'Make a man who swore silence talk, without calling him a hypocrite.'],
    es: ['Final · La confesión del oligarca', 'El capellán recogió las últimas confesiones del oligarca. Duermen en un misal que nadie se atreve a abrir.', 'Haz hablar a un hombre que juró callar, sin llamarlo hipócrita.'],
  },
  's3-e2': {
    en: ['Episode 2 · The Ghost Server', 'Camille stole an entire server that appears on no map. Someone has been hunting her for three nights and she no longer sleeps.', 'Be more patient than her paranoia: one question too many and she vanishes.'],
    es: ['Episodio 2 · El servidor fantasma', 'Camille robó un servidor entero que no figura en ningún plano. Alguien la persigue desde hace tres noches y ya no duerme.', 'Sé más paciente que su paranoia: una pregunta de más y desaparece.'],
  },
  's3-e3': {
    en: ['Episode 3 · The Black Fiber', 'While fixing a line, Kévin found a cable that officially leads nowhere. He wants to get rid of it before he is found.', 'Stay calm: he panics faster than you can count.'],
    es: ['Episodio 3 · La fibra negra', 'Al reparar una línea, Kévin encontró un cable que oficialmente no lleva a ninguna parte. Quiere deshacerse de él antes de que lo encuentren.', 'Mantén la calma: entra en pánico más rápido de lo que cuentas.'],
  },
  's3-e4': {
    en: ['Finale · The Closed-Door Trial', 'A disbarred lawyer holds the proof that would bring down the Squad. She sells it to you, or to the people who will arrest you.', 'Stay under 60% Heat: one false step and the proof changes hands.'],
    es: ['Final · El juicio a puerta cerrada', 'Una abogada inhabilitada tiene la prueba que hundiría a la Brigada. Te la vende a ti, o a quienes te detendrán.', 'Mantente por debajo del 60 % de Heat: un paso en falso y la prueba cambia de manos.'],
  },
  's4-e1': {
    en: ['Episode 1 · The Translator of Murmansk', 'A former military translator, Tariq kept a notebook of intercepted conversations between two bosses. One of them is already looking for him.', 'Respect his soldier’s honor and he will give you more than he is selling.'],
    es: ['Episodio 1 · El traductor de Múrmansk', 'Excolaborador traductor militar, Tariq guardó un cuaderno de conversaciones interceptadas entre dos capos. Uno de ellos ya lo busca.', 'Respeta su honor de soldado y te dará más de lo que vende.'],
  },
  's4-e2': {
    en: ['Episode 2 · The Midnight Smuggler', 'Olga moves people and crates through a frozen port. Tonight she carries something she refuses to name.', 'Never treat her with contempt: she will cut you off before you speak.'],
    es: ['Episodio 2 · La pasadora de medianoche', 'Olga pasa personas y cajas por un puerto helado. Esta noche transporta algo que se niega a nombrar.', 'Nunca la trates con desprecio: te cortará el paso antes de que hables.'],
  },
  's4-e3': {
    en: ['Episode 3 · The Glacier Icons', 'A restorer copied three icons for the Bratva. She knows which one is real, and she is afraid to say so.', 'Make her admit which icon is authentic before you pay.'],
    es: ['Episodio 3 · Los iconos del glaciar', 'Una restauradora copió tres iconos para la Bratva. Sabe cuál es el auténtico y teme decirlo.', 'Haz que confiese qué icono es auténtico antes de pagar.'],
  },
  's4-e4': {
    en: ['Finale · The White Convoy', 'A cash convoy “vanished” under the snow. Marek was at the wheel and knows where the bags are. So does the Bratva.', 'Buy before they do, without making an enemy of the Bratva.'],
    es: ['Final · El convoy blanco', 'Un convoy de fondos «desapareció» bajo la nieve. Marek iba al volante y sabe dónde están las bolsas. La Bratva también.', 'Compra antes que ellos, sin ganarte la enemistad de la Bratva.'],
  },
  's5-e1': {
    en: ['Episode 1 · Lot Zero', 'Yuki offers a lot that appears in no catalog: a piece pulled from the sale the day before, at someone powerful’s request.', 'Stay courteous: she leaves the table at the slightest insult.'],
    es: ['Episodio 1 · El lote cero', 'Yuki ofrece un lote que no figura en ningún catálogo: una pieza retirada de la venta el día anterior, a petición de alguien poderoso.', 'Sé cortés: se levanta de la mesa ante la mínima ofensa.'],
  },
  's5-e2': {
    en: ['Episode 2 · The Stones of Antwerp', 'Diane swapped real stones for copies to cover a debt. The real ones are in her pocket.', 'Prove you can tell real from fake before you pull out the cash.'],
    es: ['Episodio 2 · Las piedras de Amberes', 'Diane cambió piedras auténticas por copias para cubrir una deuda. Las verdaderas están en su bolsillo.', 'Demuestra que distingues lo auténtico de lo falso antes de sacar el efectivo.'],
  },
  's5-e3': {
    en: ['Episode 3 · The White Sale', 'A gallery owner in liquidation dumps her collection before the bailiff. Some paintings are fakes, others come from a burglary.', 'Sort the real from the fake without showing her you doubt.'],
    es: ['Episodio 3 · La venta blanca', 'Una galerista en liquidación malvende su colección antes del alguacil. Algunos cuadros son falsos, otros vienen de un robo.', 'Separa los auténticos de los falsos sin que note que dudas.'],
  },
  's5-e4': {
    en: ['Finale · The Last Gavel', 'The city’s oldest junk dealer puts up the piece that ruined his family. He wants it to end up with someone who understands.', 'Don’t lecture him about antiques: listen to him first.'],
    es: ['Final · El último mazazo', 'El anticuario más viejo de la ciudad pone a la venta la pieza que arruinó a su familia. Quiere que acabe con alguien que lo entienda.', 'No le des lecciones sobre antigüedades: escúchalo primero.'],
  },
  's6-e1': {
    en: ['Episode 1 · The Squad’s Mole', 'A Narcotics undercover agent poses as a fence. She has been testing you for weeks and tonight she wants to close.', 'Never admit you fence stolen goods, and don’t accuse her wrongly.'],
    es: ['Episodio 1 · El topo de la Brigada', 'Una infiltrada de Estupefacientes se hace pasar por perista. Te pone a prueba desde hace semanas y esta noche quiere cerrar.', 'Nunca digas que haces de perista, y no la acuses sin motivo.'],
  },
  's6-e2': {
    en: ['Episode 2 · The Prefecture Safe', 'A safe technician, Milo opened one he should never have opened. Inside: a file someone wants burned.', 'Get the file by making him believe he is the one deciding.'],
    es: ['Episodio 2 · La caja fuerte de la Prefectura', 'Cerrajero de cajas fuertes, Milo abrió una que nunca debió abrir. Dentro, un expediente que alguien quiere quemar.', 'Consigue el expediente haciéndole creer que él decide.'],
  },
  's6-e3': {
    en: ['Episode 3 · The Bodyguard', 'Karim protected a man he despises for too long. Tonight he sells what he knows about his old boss.', 'Find what still keeps him loyal, and push on it.'],
    es: ['Episodio 3 · El guardaespaldas', 'Karim protegió demasiado tiempo a un hombre al que desprecia. Esta noche vende lo que sabe de su antiguo jefe.', 'Descubre qué lo mantiene aún leal y presiona ahí.'],
  },
  's6-e4': {
    en: ['Finale · The Senate File', 'A parliamentary aide holds proof of a scheme laundering money across the entire city. She has no one left to sell it to.', 'You are her last resort. Don’t let her feel it too early.'],
    es: ['Final · El expediente del Senado', 'Una asistente parlamentaria tiene la prueba de un sistema que lava dinero por toda la ciudad. Ya no le queda a quién vendérsela.', 'Eres su último recurso. No se lo hagas notar demasiado pronto.'],
  },
};
