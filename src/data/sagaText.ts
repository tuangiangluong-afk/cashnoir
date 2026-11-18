// Textes des sagas clients : 4 épisodes de retour (2 à 5) par profil psychologique, en FR/EN/ES.
// {item} = pièce proposée, {price} = prix, {P} = pronom (il / elle), {name} = prénom + nom.
import type { SagaEnd } from './saga';

type Loc = 'fr' | 'en' | 'es';
type Four = [string, string, string, string];
type ProfileId = 'gambler' | 'exec' | 'cop' | 'rich_kid' | 'broker' | 'smuggler' | 'heiress' | 'priest' | 'hacker';

const BODY: Record<ProfileId, Record<Loc, Four>> = {
  gambler: {
    fr: ['Je me suis refait au poker. Enfin presque. Il me faut du liquide : {item}, {price}.', 'L’usurier me donne jusqu’à l’aube. Prends {item} pour {price}, je t’en supplie.', 'Je dois encore de l’argent à des gens dangereux. {item}, {price}. Et peut-être un service, après.', 'C’est fini, d’une façon ou d’une autre. Dernier objet : {item}, {price}.'],
    en: ['I won it back at poker. Well, almost. I need cash: {item}, {price}.', 'The loan shark gave me until dawn. Take {item} for {price}, I’m begging you.', 'I still owe dangerous people. {item}, {price}. And maybe a favor, afterwards.', 'It’s over, one way or another. Last piece: {item}, {price}.'],
    es: ['Me recuperé en el póker. Bueno, casi. Necesito efectivo: {item}, {price}.', 'El usurero me da hasta el amanecer. Llévate {item} por {price}, te lo suplico.', 'Aún debo dinero a gente peligrosa. {item}, {price}. Y quizá un favor, después.', 'Se acabó, de una forma u otra. Última pieza: {item}, {price}.'],
  },
  exec: {
    fr: ['Ma boîte a des soupçons. Je dois me débarrasser de {item} : {price}.', 'Ma famille commence à poser des questions. {item}, {price}, et on oublie tout.', 'Le conseil se réunit demain. Si {item} reste chez moi, je suis fini. {price}.', 'J’ai démissionné avant qu’on me vire. {item} pour {price}, mon dernier lien avec tout ça.'],
    en: ['My company is getting suspicious. I have to get rid of {item}: {price}.', 'My family is starting to ask questions. {item}, {price}, and we forget all this.', 'The board meets tomorrow. If {item} stays with me, I’m finished. {price}.', 'I resigned before they fired me. {item} for {price}, my last tie to all that.'],
    es: ['Mi empresa sospecha. Tengo que deshacerme de {item}: {price}.', 'Mi familia empieza a hacer preguntas. {item}, {price}, y olvidamos todo.', 'El consejo se reúne mañana. Si {item} sigue conmigo, estoy acabado. {price}.', 'Dimití antes de que me echaran. {item} por {price}, mi último lazo con todo eso.'],
  },
  cop: {
    fr: ['L’IGPN fouine autour de moi. {item}, {price}. Pas de questions.', 'Un collègue a parlé. Je dois me délester de {item} : {price}.', 'On me suit depuis deux jours. {item}, {price}, et tu ne m’as jamais vu.', 'Je rends mon badge demain. {item} pour {price}. Après, on n’a plus rien à se dire.'],
    en: ['Internal Affairs is sniffing around me. {item}, {price}. No questions.', 'A colleague talked. I have to unload {item}: {price}.', 'I’ve been followed for two days. {item}, {price}, and you never saw me.', 'I hand in my badge tomorrow. {item} for {price}. After that, we have nothing left to say.'],
    es: ['Asuntos Internos husmea a mi alrededor. {item}, {price}. Sin preguntas.', 'Un compañero habló. Tengo que soltar {item}: {price}.', 'Me siguen desde hace dos días. {item}, {price}, y nunca me viste.', 'Entrego la placa mañana. {item} por {price}. Después no tendremos nada que decirnos.'],
  },
  rich_kid: {
    fr: ['Papa a gelé mes comptes. J’ai {item} à vendre, {price}.', 'Mon père débarque ce week-end. Il ne doit pas voir {item}. {price}.', 'Je suis fauché pour de bon. {item}, {price}. Et une idée à te proposer.', 'Je pars de la maison. {item} pour {price}, mon premier vrai chèque.'],
    en: ['Dad froze my accounts. I have {item} to sell, {price}.', 'My father arrives this weekend. He can’t see {item}. {price}.', 'I’m truly broke now. {item}, {price}. And an idea to pitch you.', 'I’m leaving home. {item} for {price}, my first real paycheck.'],
    es: ['Papá congeló mis cuentas. Tengo {item} para vender, {price}.', 'Mi padre llega este fin de semana. No puede ver {item}. {price}.', 'Estoy arruinado de verdad. {item}, {price}. Y una idea que proponerte.', 'Me voy de casa. {item} por {price}, mi primer sueldo de verdad.'],
  },
  broker: {
    fr: ['Un client m’a menti sur un certificat. J’ai {item}, {price}, tu verras vite pourquoi.', 'L’expert a douté de {item}. Je te le laisse à {price} avant qu’il parle.', 'Mon associé s’est barré avec la caisse. {item}, {price}, c’est tout ce qui me reste.', 'Je ferme l’étude. Dernière pièce honnête : {item}, {price}.'],
    en: ['A client lied to me about a certificate. I have {item}, {price}, you’ll see why.', 'The appraiser doubted {item}. I’ll let it go for {price} before he talks.', 'My partner ran off with the till. {item}, {price}, it’s all I have left.', 'I’m closing the shop. Last honest piece: {item}, {price}.'],
    es: ['Un cliente me mintió sobre un certificado. Tengo {item}, {price}, enseguida verás por qué.', 'El perito dudó de {item}. Te lo dejo por {price} antes de que hable.', 'Mi socio se fue con la caja. {item}, {price}, es todo lo que me queda.', 'Cierro el despacho. Última pieza honesta: {item}, {price}.'],
  },
  smuggler: {
    fr: ['Un convoi est tombé à la douane. J’ai {item} sur les bras : {price}.', 'Mon contact au port est mort. Prends {item}, {price}, vite.', 'Interpol a mon nom. {item}, {price}, et j’ai peut-être un service à te demander.', 'Je quitte le pays cette nuit. {item} pour {price}, et bonne chance.'],
    en: ['A convoy got caught at customs. I’m stuck with {item}: {price}.', 'My contact at the port is dead. Take {item}, {price}, quickly.', 'Interpol has my name. {item}, {price}, and I may have a favor to ask.', 'I’m leaving the country tonight. {item} for {price}, and good luck.'],
    es: ['Un convoy cayó en la aduana. Me quedé con {item}: {price}.', 'Mi contacto en el puerto murió. Llévate {item}, {price}, rápido.', 'Interpol tiene mi nombre. {item}, {price}, y quizá tenga un favor que pedirte.', 'Dejo el país esta noche. {item} por {price}, y buena suerte.'],
  },
  heiress: {
    fr: ['L’avocat de ma famille me harcèle. {item}, {price}, discrètement.', 'Le divorce se complique. Je ne veux pas qu’on retrouve {item}. {price}.', 'Mon tuteur gèle les comptes. {item}, {price}, et j’ai besoin d’un allié.', 'J’ai tout signé. {item} pour {price}, mon dernier caprice.'],
    en: ['My family’s lawyer is harassing me. {item}, {price}, discreetly.', 'The divorce is getting complicated. I don’t want {item} found. {price}.', 'My guardian is freezing the accounts. {item}, {price}, and I need an ally.', 'I signed everything. {item} for {price}, my last whim.'],
    es: ['El abogado de mi familia me acosa. {item}, {price}, con discreción.', 'El divorcio se complica. No quiero que encuentren {item}. {price}.', 'Mi tutor congela las cuentas. {item}, {price}, y necesito un aliado.', 'Lo firmé todo. {item} por {price}, mi último capricho.'],
  },
  priest: {
    fr: ['Le diocèse fait un audit. Il faut faire disparaître {item} : {price}.', 'La sœur supérieure a vu {item}. {price}, avant la confession de ce soir.', 'Ma paroisse est en faillite. {item}, {price}. Dieu pardonne, pas les banquiers.', 'Je quitte les ordres. {item} pour {price}, et que Dieu me juge.'],
    en: ['The diocese is auditing. {item} has to disappear: {price}.', 'The mother superior saw {item}. {price}, before tonight’s confession.', 'My parish is bankrupt. {item}, {price}. God forgives, bankers don’t.', 'I’m leaving the order. {item} for {price}, and may God judge me.'],
    es: ['La diócesis hace una auditoría. {item} tiene que desaparecer: {price}.', 'La madre superiora vio {item}. {price}, antes de la confesión de esta noche.', 'Mi parroquia está en quiebra. {item}, {price}. Dios perdona, los banqueros no.', 'Dejo la orden. {item} por {price}, y que Dios me juzgue.'],
  },
  hacker: {
    fr: ['Quelqu’un a repéré mon IP. J’ai {item}, {price}, et je dois disparaître.', 'Ils ont trouvé une brèche dans mes serveurs. {item}, {price}, tout de suite.', 'Mes logs sont compromis. {item}, {price}. J’ai peut-être besoin d’une planque.', 'Je coupe tout. {item} pour {price}, mon dernier gain en ligne.'],
    en: ['Someone spotted my IP. I have {item}, {price}, and I have to disappear.', 'They found a breach in my servers. {item}, {price}, right now.', 'My logs are compromised. {item}, {price}. I may need a hideout.', 'I’m cutting everything. {item} for {price}, my last online win.'],
    es: ['Alguien detectó mi IP. Tengo {item}, {price}, y debo desaparecer.', 'Encontraron una brecha en mis servidores. {item}, {price}, ahora mismo.', 'Mis logs están comprometidos. {item}, {price}. Quizá necesite un escondite.', 'Lo corto todo. {item} por {price}, mi última ganancia online.'],
  },
};

/** Titres des épisodes 2 à 5. */
export const CHAPTER: Record<Loc, Four> = {
  fr: ['Le retour', 'La pression', 'Le service', 'Le dénouement'],
  en: ['The return', 'The pressure', 'The favor', 'The ending'],
  es: ['El regreso', 'La presión', 'El favor', 'El desenlace'],
};

const TELL: Record<Loc, Four> = {
  fr: ['{P} revient, la mine plus tendue que la dernière fois.', '{P} sue malgré le froid de la rue.', '{P} n’ose plus te regarder en face.', '{P} a l’air de quelqu’un qui a pris sa décision.'],
  en: ['{P} is back, more nervous than last time.', '{P} sweats despite the cold street.', '{P} can no longer look you in the eye.', '{P} looks like someone who made a decision.'],
  es: ['{P} vuelve, con el gesto más tenso que la última vez.', '{P} suda a pesar del frío de la calle.', '{P} ya no se atreve a mirarte a los ojos.', '{P} parece alguien que ha tomado una decisión.'],
};

const PREFIX: Record<Loc, { friendly: string; hostile: string }> = {
  fr: { friendly: 'Toi, au moins, tu m’as toujours traité droit. ', hostile: 'Je n’ai pas oublié comment tu m’as traité. ' },
  en: { friendly: 'You, at least, always treated me straight. ', hostile: 'I haven’t forgotten how you treated me. ' },
  es: { friendly: 'Tú, al menos, siempre me trataste con rectitud. ', hostile: 'No he olvidado cómo me trataste. ' },
};

const ENDING: Record<Loc, Record<SagaEnd, string>> = {
  fr: { ally: '{name} te devient fidèle : {P} reviendra avec ses trouvailles, à prix d’ami.', enemy: '{name} t’en veut : {P} ne t’oubliera pas (Heat +10).', gone: '{name} sort de ta vie. L’histoire est close.' },
  en: { ally: '{name} becomes loyal: {P} will come back with finds, at a friend’s price.', enemy: '{name} holds a grudge: {P} won’t forget you (Heat +10).', gone: '{name} walks out of your life. The story is over.' },
  es: { ally: '{name} te será fiel: {P} volverá con hallazgos, a precio de amigo.', enemy: '{name} te guarda rencor: {P} no te olvidará (Heat +10).', gone: '{name} sale de tu vida. La historia se cierra.' },
};

export const FAVOR_TEXT: Record<Loc, string> = {
  fr: '{name} te demande un service : {cost} pour s’en sortir.',
  en: '{name} asks you for a favor: {cost} to get out of trouble.',
  es: '{name} te pide un favor: {cost} para salir del apuro.',
};

export const ALLY_GIFT: Record<Loc, string> = {
  fr: '« Content de te voir. J’ai trouvé {item}, je te le laisse à {price}, prix d’ami. »',
  en: '"Good to see you. I found {item}, you can have it for {price}, friend’s price."',
  es: '«Me alegra verte. Encontré {item}, te lo dejo por {price}, precio de amigo.»',
};

const PRONOUN: Record<Loc, { m: string; f: string }> = { fr: { m: 'Il', f: 'Elle' }, en: { m: 'He', f: 'She' }, es: { m: 'Él', f: 'Ella' } };
const pron = (loc: Loc, g: 'm' | 'f') => PRONOUN[loc][g];

const fill = (t: string, vars: Record<string, string>) => t.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);

/** Réplique d'ouverture de l'épisode `episode` (2 à 5). */
export function sagaOpening(profile: string, episode: number, loc: Loc, trust: number, item: string, price: string): string {
  const p = (profile in BODY ? profile : 'gambler') as ProfileId;
  const body = fill(BODY[p][loc][Math.max(0, Math.min(3, episode - 2))], { item, price });
  const pre = trust >= 25 ? PREFIX[loc].friendly : trust <= -25 ? PREFIX[loc].hostile : '';
  return `« ${pre}${body} »`;
}

const KNOWS: Record<Loc, string> = { fr: 'Ce que tu sais de lui :', en: 'What you know about them:', es: 'Lo que sabes de esta persona:' };

/** Faits propres au personnage, révélés épisode après épisode : son secret (dès la 2e rencontre), sa faille, sa ligne rouge. */
export function sagaFacts(met: number, secret: string, weakness: string, redLine: string): string[] {
  return [met >= 2 ? secret : '', met >= 3 ? weakness : '', met >= 4 ? redLine : ''].filter(Boolean);
}

export const sagaKnows = (loc: Loc, facts: string[]): string => (facts.length ? `${KNOWS[loc]} ${facts.join(' ')}` : '');

export const sagaTell = (episode: number, loc: Loc, g: 'm' | 'f'): string => fill(TELL[loc][Math.max(0, Math.min(3, episode - 2))], { P: pron(loc, g) });
export const sagaChapter = (episode: number, loc: Loc): string => CHAPTER[loc][Math.max(0, Math.min(3, episode - 2))];
export const sagaEnding = (end: SagaEnd, loc: Loc, name: string, g: 'm' | 'f'): string => fill(ENDING[loc][end], { name, P: pron(loc, g).toLowerCase() });
export const sagaFavor = (loc: Loc, name: string, cost: string): string => fill(FAVOR_TEXT[loc], { name, cost });
export const sagaAllyGift = (loc: Loc, item: string, price: string): string => fill(ALLY_GIFT[loc], { item, price });
