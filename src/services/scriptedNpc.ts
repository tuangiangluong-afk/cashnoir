// Vendeur scripté : sert de repli quand l'IA n'est pas disponible (quota gratuit atteint, budget du jour épuisé, panne).
// Il produit le même JSON que le modèle ; parseNPCJson applique donc exactement les mêmes règles
// (plancher dynamique, baisse max par tour, garde-fou de départ). Aucun coût, aucune clé.
import type { Gauges } from './types';

type Loc = 'fr' | 'en' | 'es';
type Situation = 'accept' | 'counter' | 'hold' | 'insulted' | 'pressured' | 'bluffed' | 'chat';

const T: Record<Loc, Record<Situation, string[]>> = {
  fr: {
    accept: ['{p} $. Pose le liquide et disparais de ma vue.', 'Marché conclu à {p} $. Compte pas sur moi pour te faire un cadeau la prochaine fois.', 'D’accord, {p} $. Prends-le avant que je change d’avis.', '{p} $. C’est donnant-donnant : tu paies, tu pars, personne ne t’a vu.', 'Allez, {p} $. J’ai passé assez de temps dans cette boutique.', 'Topons là à {p} $. Et surtout, tu n’as jamais vu ma tête.'],
    counter: ['Je descends à {p} $, mais pas un dollar de moins ce soir.', '{p} $. C’est mon dernier effort, après je range la pièce.', 'Pour toi, {p} $. Tu ne trouveras pas mieux dans cette rue.', 'Ça me fait mal, mais {p} $. Pas un centime de moins.', '{p} $, parce que j’ai besoin de cash avant l’aube.', 'Je te fais {p} $. C’est ça ou je traverse la rue.'],
    hold: ['Mon prix reste {p} $. Je ne suis pas là pour discuter de la météo.', '{p} $. J’ai d’autres acheteurs qui attendent derrière ta porte.', 'Toujours {p} $. Fais-moi une vraie offre ou laisse-moi partir.', 'Je ne bouge pas : {p} $.', '{p} $. La pièce vaut ce qu’elle vaut, pas ce que tu veux payer.', 'Tu perds ton temps. {p} $ ou rien.'],
    insulted: ['Tu me parles comme ça ? {p} $, et tu viens de perdre ma sympathie.', 'Garde tes insultes. {p} $, point final.', 'Reste poli. Le prix, c’est {p} $, et ma patience a des limites.', 'Une insulte de plus et je range tout. {p} $.', 'Je ne négocie pas avec quelqu’un qui m’insulte. {p} $, c’est tout.', 'Surveille ta langue. {p} $, et fais vite.'],
    pressured: ['Tu crois me faire peur ? Bon… {p} $, mais ne reviens pas me chercher.', 'Pas besoin de menaces. {p} $ et on n’en parle plus.', 'Doucement. Je peux faire {p} $, mais personne n’a besoin de savoir.', 'Garde tes menaces pour les débutants. {p} $, ça me va.', 'Bon, bon. Pas de bruit. {p} $.', 'Tu sais t’y prendre. {p} $, mais c’est la dernière fois.'],
    bluffed: ['Tu bluffes mal. La pièce vaut bien {p} $.', 'Ce n’est pas ce que dit mon expert. {p} $.', 'Je connais ce que je vends. {p} $, et je ne bouge pas là-dessus.', 'Ne me prends pas pour un amateur. {p} $.', 'Tu cherches la faille ? Il n’y en a pas. {p} $.', 'Bel essai. La pièce reste à {p} $.'],
    chat: ['Parlons chiffres : {p} $.', 'Je suis pressé. {p} $, ça te va ?', 'On n’a pas toute la nuit. {p} $.', 'Je t’écoute, mais {p} $ reste mon prix.', 'Alors ? {p} $, oui ou non ?', 'Décide-toi, {p} $ et on en finit.'],
  },
  en: {
    accept: ['{p} bucks. Put the cash down and vanish.', 'Deal at {p}. Don’t expect a gift next time.', 'Fine, {p}. Take it before I change my mind.', '{p}. You pay, you leave, nobody saw you.', 'Alright, {p}. I’ve spent enough time in this shop.', 'Shake on {p}. And you never saw my face.'],
    counter: ['I’ll drop to {p}, not a dollar less tonight.', '{p}. That’s my last move, then the piece goes back in the bag.', 'For you, {p}. You won’t beat that on this street.', 'It hurts, but {p}. Not a cent less.', '{p}, because I need cash before dawn.', 'I’ll do {p}. That or I cross the street.'],
    hold: ['My price stays at {p}. I’m not here to talk about the weather.', '{p}. I’ve got other buyers waiting behind your door.', 'Still {p}. Make a real offer or let me walk.', 'I’m not moving: {p}.', '{p}. The piece is worth what it’s worth, not what you want to pay.', 'You’re wasting time. {p} or nothing.'],
    insulted: ['You talk to me like that? {p}, and you just lost my goodwill.', 'Keep your insults. {p}, final.', 'Stay polite. The price is {p}, and my patience has limits.', 'One more insult and I pack up. {p}.', 'I don’t haggle with someone who insults me. {p}, that’s it.', 'Watch your mouth. {p}, and be quick.'],
    pressured: ['You think that scares me? Fine… {p}, but don’t come looking for me.', 'No need for threats. {p} and we never spoke.', 'Easy. I can do {p}, but nobody needs to know.', 'Save your threats for rookies. {p} works for me.', 'Fine, fine. Keep it quiet. {p}.', 'You know how to push. {p}, but that’s the last time.'],
    bluffed: ['You bluff badly. This piece is worth {p}.', 'That’s not what my appraiser says. {p}.', 'I know what I’m selling. {p}, and I’m not moving.', 'Don’t take me for an amateur. {p}.', 'Looking for a flaw? There isn’t one. {p}.', 'Nice try. The piece stays at {p}.'],
    chat: ['Let’s talk numbers: {p}.', 'I’m in a hurry. {p}, does that work?', 'We don’t have all night. {p}.', 'I’m listening, but {p} is still my price.', 'Well? {p}, yes or no?', 'Make up your mind. {p} and we’re done.'],
  },
  es: {
    accept: ['{p} $. Deja el efectivo y desaparece.', 'Trato hecho a {p} $. No esperes un regalo la próxima vez.', 'De acuerdo, {p} $. Llévatelo antes de que cambie de idea.', '{p} $. Tú pagas, te vas y nadie te vio.', 'Vale, {p} $. Ya he pasado demasiado tiempo en esta tienda.', 'Choca esa mano: {p} $. Y nunca viste mi cara.'],
    counter: ['Bajo a {p} $, ni un dólar menos esta noche.', '{p} $. Es mi último esfuerzo, luego guardo la pieza.', 'Para ti, {p} $. No encontrarás algo mejor en esta calle.', 'Me duele, pero {p} $. Ni un centavo menos.', '{p} $, porque necesito efectivo antes del amanecer.', 'Te hago {p} $. O eso o cruzo la calle.'],
    hold: ['Mi precio sigue en {p} $. No estoy aquí para hablar del tiempo.', '{p} $. Tengo otros compradores esperando tras tu puerta.', 'Sigue siendo {p} $. Haz una oferta de verdad o déjame ir.', 'No me muevo: {p} $.', '{p} $. La pieza vale lo que vale, no lo que quieras pagar.', 'Pierdes el tiempo. {p} $ o nada.'],
    insulted: ['¿Me hablas así? {p} $, y acabas de perder mi simpatía.', 'Guárdate los insultos. {p} $, y punto.', 'Sé educado. El precio es {p} $ y mi paciencia tiene límites.', 'Un insulto más y recojo. {p} $.', 'No regateo con quien me insulta. {p} $, y punto.', 'Cuida esa lengua. {p} $, y rápido.'],
    pressured: ['¿Crees que me asustas? Bueno… {p} $, pero no vengas a buscarme.', 'No hacen falta amenazas. {p} $ y nunca hablamos.', 'Con calma. Puedo hacer {p} $, pero nadie tiene que saberlo.', 'Guarda las amenazas para los novatos. {p} $ me vale.', 'Bueno, bueno. Sin ruido. {p} $.', 'Sabes presionar. {p} $, pero es la última vez.'],
    bluffed: ['Farolear no es lo tuyo. La pieza vale {p} $.', 'Eso no es lo que dice mi tasador. {p} $.', 'Sé lo que vendo. {p} $, y no me muevo.', 'No me tomes por aficionado. {p} $.', '¿Buscas un defecto? No lo hay. {p} $.', 'Buen intento. La pieza sigue en {p} $.'],
    chat: ['Hablemos de números: {p} $.', 'Tengo prisa. {p} $, ¿te vale?', 'No tenemos toda la noche. {p} $.', 'Te escucho, pero {p} $ sigue siendo mi precio.', '¿Entonces? {p} $, ¿sí o no?', 'Decídete. {p} $ y acabamos.'],
  },
};

const TELL: Record<Loc, Record<Situation, string>> = {
  fr: { accept: 'Il range la pièce sans te regarder.', counter: 'Il hésite, puis hausse les épaules.', hold: 'Il tapote le comptoir, impatient.', insulted: 'Sa mâchoire se crispe.', pressured: 'Il jette un œil vers la porte.', bluffed: 'Un sourire en coin, à peine visible.', chat: 'Il garde un œil sur la rue.' },
  en: { accept: 'He pockets the deal without looking at you.', counter: 'He hesitates, then shrugs.', hold: 'He drums on the counter, impatient.', insulted: 'His jaw tightens.', pressured: 'He glances at the door.', bluffed: 'A barely visible smirk.', chat: 'He keeps one eye on the street.' },
  es: { accept: 'Guarda el trato sin mirarte.', counter: 'Duda y se encoge de hombros.', hold: 'Tamborilea el mostrador, impaciente.', insulted: 'Se le tensa la mandíbula.', pressured: 'Mira de reojo hacia la puerta.', bluffed: 'Una sonrisa apenas visible.', chat: 'Vigila la calle con un ojo.' },
};

export const INSULT = /connard|idiot|imb[eé]cile|merde|ta gueule|d[eé]gage|pigeon|clochard|escroc|voleur|fuck|idiot|stupid|asshole|shut up|scam|thief|gilipollas|idiota|estafador|ladr[oó]n|cabr[oó]n|imb[eé]cil/i;
const PRESSURE = /police|flic|patrouille|brigade|radio|scanner|coffr|menace|indic|cops?|patrol|arrest|threat|polic[ií]a|patrulla|arresto|amenaza/i;
const BLUFF = /faux|contrefa|invendable|sans valeur|worthless|fake|forg|unsellable|falso|falsific|invendible|sin valor/i;

const round50 = (n: number) => Math.round(n / 50) * 50;

const tellFor = (loc: Loc, situation: Situation, gender?: 'm' | 'f') => {
  const base = TELL[loc][situation];
  if (gender !== 'f') return base;
  if (loc === 'fr') return base.replace(/^Il /, 'Elle ');
  if (loc === 'en') return base.replace(/^He /, 'She ').replace(/^His /, 'Her ');
  return base;
};

export function scriptedNpcRaw(args: {
  history: { role: 'player' | 'npc'; content: string }[];
  gauges: Gauges;
  currentPrice: number;
  dynamicFloor: number;
  playerOffer?: number;
  locale: Loc;
  gender?: 'm' | 'f';
}): string {
  const { history, gauges, currentPrice, dynamicFloor, playerOffer, locale, gender } = args;
  const loc: Loc = locale in T ? locale : 'fr';
  const playerTurns = history.filter(turn => turn.role === 'player');
  const lastPlayer = playerTurns[playerTurns.length - 1]?.content ?? '';
  const previousPlayer = playerTurns[playerTurns.length - 2]?.content ?? '';
  const insulted = INSULT.test(lastPlayer);
  const pressured = PRESSURE.test(lastPlayer);
  const bluffed = BLUFF.test(lastPlayer);

  let situation: Situation = 'chat';
  let price = currentPrice;
  let action: 'aucune' | 'deal_accepte' | 'quitte_la_boutique' = 'aucune';
  let { peur, colere, mefiance } = gauges;

  if (insulted) {
    situation = 'insulted';
    colere += 12;
    mefiance += 6;
  } else if (playerOffer !== undefined && playerOffer >= dynamicFloor) {
    situation = 'accept';
    price = Math.min(currentPrice, playerOffer);
    action = 'deal_accepte';
  } else if (playerOffer !== undefined) {
    // Contre-offre : on se rapproche de l'offre, sans jamais passer sous le plancher.
    const target = Math.max(dynamicFloor, playerOffer);
    price = Math.max(dynamicFloor, Math.min(currentPrice, round50(currentPrice - (currentPrice - target) * 0.4)));
    situation = price < currentPrice ? 'counter' : 'hold';
  } else if (pressured && PRESSURE.test(previousPlayer)) {
    situation = 'hold';
    mefiance += 6;
  } else if (pressured) {
    situation = 'pressured';
    price = Math.max(dynamicFloor, round50(currentPrice * 0.94));
    mefiance += 4;
  } else if (bluffed) {
    situation = 'bluffed';
    mefiance += 5;
  } else if (history.filter((h) => h.role === 'player').length >= 3 && peur >= 40) {
    situation = 'counter';
    price = Math.max(dynamicFloor, round50(currentPrice * 0.95));
  }
  if (colere >= 75 && insulted) action = 'quitte_la_boutique';

  const pool = T[loc][situation];
  const said = new Set(history.filter((h) => h.role === 'npc').map((h) => h.content));
  const render = (line: string) => line.replace('{p}', price.toLocaleString(loc === 'en' ? 'en-US' : loc === 'es' ? 'es-ES' : 'fr-FR').replace(/[\u202f\u00a0]/g, ' '));
  const seed = history.length * 7 + Math.round(currentPrice / 50);
  return JSON.stringify({
    dialogue: (() => {
      // Évite de répéter une réplique déjà dite à ce client.
      for (let k = 0; k < pool.length; k++) {
        const line = render(pool[(seed + k) % pool.length]);
        if (!said.has(line)) return line;
      }
      return render(pool[seed % pool.length]);
    })(),
    indice_comportemental: tellFor(loc, situation, gender),
    jauges: { peur, colere: Math.min(100, colere), mefiance: Math.min(100, mefiance) },
    prix_actuel_demande: price,
    action_speciale: action,
  });
}
