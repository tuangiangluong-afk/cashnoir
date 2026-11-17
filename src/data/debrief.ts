// Autopsie d'un deal et bilan de partie : des règles déterministes (aucune IA, aucun coût) lues dans l'historique réel
// des tours (variations de jauges, prix, offres, planchers). Chaque phrase est traduite en FR/EN/ES.
type Loc = 'fr' | 'en' | 'es';

export interface DebriefEntry {
  turn: number;
  action: string;
  peurDelta: number;
  colereDelta: number;
  mefianceDelta: number;
  colere: number;
  mefiance: number;
  priceDelta: number;
  offer?: number;
  floor?: number;
  weak?: boolean;
  name?: boolean;
  /** Bits : 1 = loupe passée, 2 = UV passée, 4 = radio ouverte. */
  tools?: number;
}

export interface DealCtx {
  outcome: 'deal_accepte' | 'quitte_la_boutique' | 'sort_son_arme';
  initialPrice: number;
  finalPrice: number;
  isTrap: boolean;
  profileId?: string;
  tags: string[];
  locale: Loc;
  money: (n: number) => string;
  /** Traduit le libellé d'une action (« Faille touchée »…) dans la langue du joueur. */
  label?: (action: string) => string;
}

export interface Point {
  kind: 'good' | 'warn' | 'tip';
  text: string;
}

export interface RunStats {
  deals: number;
  discountSum: number;
  walkouts: number;
  guns: number;
  lowballs: number;
  trapsBought: number;
  trapsExposed: number;
}

export const EMPTY_RUN_STATS: RunStats = { deals: 0, discountSum: 0, walkouts: 0, guns: 0, lowballs: 0, trapsBought: 0, trapsExposed: 0 };

const PROFILE_TIP: Record<string, Record<Loc, string>> = {
  gambler: { fr: 'Joueur endetté : la pression du temps (usurier, aube, retard) le fait craquer.', en: 'Indebted gambler: time pressure (loan shark, dawn, late) breaks him.', es: 'Jugador endeudado: la presión del tiempo (usurero, amanecer, retraso) lo quiebra.' },
  exec: { fr: 'Cadre aux abois : le scandale et sa famille le brisent, mais une menace physique le braque.', en: 'Cornered executive: scandal and family break him, but a physical threat makes him snap.', es: 'Ejecutivo acorralado: el escándalo y la familia lo rompen, pero una amenaza física lo enfurece.' },
  cop: { fr: 'Policier en faute : parle de brigade, de radio ou de procédure, mais n’évoque jamais le vol.', en: 'Cop in trouble: mention the squad, the radio or procedure, but never theft.', es: 'Policía en falta: habla de brigada, radio o procedimiento, pero nunca de robo.' },
  rich_kid: { fr: 'Fils à papa : sa famille et son héritage le déstabilisent, mais il déteste qu’on le prenne de haut.', en: 'Rich kid: family and inheritance unsettle him, but he hates being talked down to.', es: 'Hijo de papá: la familia y la herencia lo desestabilizan, pero odia que lo traten por encima del hombro.' },
  broker: { fr: 'Expert : les défauts, certificats et contrefaçons le font douter ; les insultes le ferment.', en: 'Expert: flaws, certificates and fakes make him doubt; insults shut him down.', es: 'Experto: los defectos, certificados y falsificaciones lo hacen dudar; los insultos lo cierran.' },
  smuggler: { fr: 'Trafiquant : douane, frontière et convois le font plier ; ne le traite jamais de balance.', en: 'Smuggler: customs, borders and convoys make him fold; never call him a snitch.', es: 'Contrabandista: la aduana, la frontera y los convoyes lo hacen ceder; nunca lo llames chivato.' },
  heiress: { fr: 'Héritière : avocats, divorce et tuteurs la fragilisent ; la pitié la braque.', en: 'Heiress: lawyers, divorce and guardians weaken her; pity makes her snap.', es: 'Heredera: abogados, divorcio y tutores la debilitan; la lástima la enfurece.' },
  priest: { fr: 'Prêtre : diocèse, confession et paroisse le troublent ; l’hypocrisie le met en colère.', en: 'Priest: diocese, confession and parish trouble him; hypocrisy angers him.', es: 'Sacerdote: la diócesis, la confesión y la parroquia lo turban; la hipocresía lo enfurece.' },
  hacker: { fr: 'Hacker : traces, serveurs et brèches le paniquent ; le mépris le braque.', en: 'Hacker: traces, servers and breaches panic him; contempt makes him snap.', es: 'Hacker: rastros, servidores y brechas lo asustan; el desprecio lo enfurece.' },
};

const TAG_TIP: Record<string, Record<Loc, string>> = {
  nervous: { fr: 'Nerveux de nature : la peur monte vite, insiste sur les risques qu’il court.', en: 'Jumpy by nature: fear rises fast, stress the risks he runs.', es: 'Nervioso por naturaleza: el miedo sube rápido, insiste en los riesgos que corre.' },
  coolheaded: { fr: 'Sang-froid : la peur glisse sur lui, travaille plutôt sa faille.', en: 'Cool-headed: fear slides off him, work on his weak spot instead.', es: 'Sangre fría: el miedo le resbala, trabaja mejor su punto débil.' },
  hothead: { fr: 'Soupe au lait : évite les offres agressives, elles le font exploser.', en: 'Hothead: avoid aggressive offers, they make him explode.', es: 'Irascible: evita ofertas agresivas, lo hacen estallar.' },
  phlegmatic: { fr: 'Flegmatique : il encaisse, tu peux pousser plus fort que d’habitude.', en: 'Phlegmatic: he takes it, you can push harder than usual.', es: 'Flemático: lo aguanta, puedes presionar más de lo habitual.' },
  wary: { fr: 'Méfiant de nature : rassure-le d’abord (Loupe, calme), puis négocie.', en: 'Naturally wary: reassure him first (loupe, calm), then negotiate.', es: 'Desconfiado por naturaleza: tranquilízalo primero (lupa, calma), luego negocia.' },
  trusting: { fr: 'Confiant : une bonne relation lui fait lâcher du prix sans pression.', en: 'Trusting: a good rapport gets him to drop the price without pressure.', es: 'Confiado: una buena relación le hace bajar el precio sin presión.' },
};

const T: Record<Loc, {
  bestDrop: (turn: number, action: string, drop: string, extra: string) => string;
  weakExtra: string;
  toolExtra: string;
  anger: (turn: number, d: number, c: number, left: boolean) => string;
  lowball: (turn: number, offer: string, floor: string) => string;
  mefiance: string;
  hardDeal: (pct: number) => string;
  easyDeal: string;
  nameHit: string;
  trap: string;
  gun: string;
}> = {
  fr: {
    bestDrop: (t, a, d, e) => `Tour ${t} (${a}) : son prix a baissé de ${d}.${e}`,
    weakExtra: ' Tu as touché sa faille.',
    toolExtra: ' Tu avais examiné la pièce avant.',
    anger: (t, d, c, left) => `Tour ${t} : sa Colère a bondi de +${d} (à ${c} %). Tu as poussé trop fort.${left ? ' C’est ce qui l’a fait partir.' : ''}`,
    lowball: (t, o, f) => `Tour ${t} : ton offre de ${o} était trop basse (son plancher du moment : ~${f}). Sous ~78 % de ce plancher, il le prend mal.`,
    mefiance: 'Sa Méfiance a dépassé 70 % : il flairait le piège ou le bluff. Rassure-le avant de pousser.',
    hardDeal: (p) => `Tu l’as fait descendre de ${p} % : belle négociation.`,
    easyDeal: 'Tu as payé presque le prix demandé. Fais monter sa Peur avant de proposer un chiffre.',
    nameHit: 'Prononcer son prénom au bon moment l’a déstabilisé.',
    trap: 'C’était un infiltré : un prix anormalement bas est un signal. Regarde l’UV et la Radio avant d’acheter.',
    gun: 'Il a sorti une arme : sa Colère avait dépassé la limite. Calme le jeu quand elle monte.',
  },
  en: {
    bestDrop: (t, a, d, e) => `Turn ${t} (${a}): his price dropped by ${d}.${e}`,
    weakExtra: ' You hit his weak spot.',
    toolExtra: ' You had examined the piece before.',
    anger: (t, d, c, left) => `Turn ${t}: his Anger jumped +${d} (to ${c}%). You pushed too hard.${left ? ' That is what made him leave.' : ''}`,
    lowball: (t, o, f) => `Turn ${t}: your offer of ${o} was too low (his floor at the time: ~${f}). Below ~78% of that floor, he takes it badly.`,
    mefiance: 'His Suspicion went past 70%: he smelled a trap or a bluff. Reassure him before pushing.',
    hardDeal: (p) => `You brought him down ${p}%: nice negotiation.`,
    easyDeal: 'You paid almost the asking price. Raise his Fear before naming a number.',
    nameHit: 'Using his first name at the right moment unsettled him.',
    trap: 'It was an undercover agent: an abnormally low price is a signal. Check the UV and the Radio before buying.',
    gun: 'He pulled a weapon: his Anger went past the limit. Ease off when it rises.',
  },
  es: {
    bestDrop: (t, a, d, e) => `Turno ${t} (${a}): su precio bajó ${d}.${e}`,
    weakExtra: ' Tocaste su punto débil.',
    toolExtra: ' Habías examinado la pieza antes.',
    anger: (t, d, c, left) => `Turno ${t}: su Ira saltó +${d} (hasta ${c} %). Presionaste demasiado.${left ? ' Eso hizo que se fuera.' : ''}`,
    lowball: (t, o, f) => `Turno ${t}: tu oferta de ${o} era demasiado baja (su mínimo del momento: ~${f}). Por debajo del ~78 % de ese mínimo, lo toma mal.`,
    mefiance: 'Su Desconfianza pasó del 70 %: olió la trampa o el farol. Tranquilízalo antes de presionar.',
    hardDeal: (p) => `Lo bajaste un ${p} %: buena negociación.`,
    easyDeal: 'Pagaste casi el precio pedido. Sube su Miedo antes de decir una cifra.',
    nameHit: 'Usar su nombre en el momento justo lo desestabilizó.',
    trap: 'Era un infiltrado: un precio anormalmente bajo es una señal. Mira la UV y la Radio antes de comprar.',
    gun: 'Sacó un arma: su Ira pasó el límite. Afloja cuando suba.',
  },
};

/** Autopsie d'un deal : au plus 5 points (réussites, erreurs, un conseil de profil). Vide s'il y a trop peu de tours. */
export function dealDebrief(entries: DebriefEntry[], ctx: DealCtx): Point[] {
  const turns = entries.filter((e) => e.turn > 0);
  if (turns.length < 2) return [];
  const tx = T[ctx.locale];
  const out: Point[] = [];

  const best = [...turns].sort((a, b) => a.priceDelta - b.priceDelta)[0];
  if (best && best.priceDelta <= -50) {
    const earlier = turns.filter((e) => e.turn < best.turn);
    const toolBefore = earlier.some((e) => (e.tools ?? 0) & 3) || ((best.tools ?? 0) & 3) > 0;
    out.push({ kind: 'good', text: tx.bestDrop(best.turn, ctx.label ? ctx.label(best.action) : best.action, ctx.money(-best.priceDelta), `${best.weak ? tx.weakExtra : ''}${toolBefore ? tx.toolExtra : ''}`) });
  }
  const spike = [...turns].sort((a, b) => b.colereDelta - a.colereDelta)[0];
  if (spike && spike.colereDelta >= 15) {
    out.push({ kind: 'warn', text: tx.anger(spike.turn, spike.colereDelta, spike.colere, ctx.outcome === 'quitte_la_boutique') });
  }
  const low = turns.find((e) => e.offer !== undefined && e.floor !== undefined && e.offer < e.floor * 0.78);
  if (low) out.push({ kind: 'warn', text: tx.lowball(low.turn, ctx.money(low.offer as number), ctx.money(low.floor as number)) });
  if (ctx.outcome === 'quitte_la_boutique' && turns.some((e) => e.mefiance >= 70)) out.push({ kind: 'warn', text: tx.mefiance });
  if (ctx.outcome === 'sort_son_arme') out.push({ kind: 'warn', text: tx.gun });
  if (ctx.outcome === 'deal_accepte') {
    if (ctx.isTrap) out.push({ kind: 'warn', text: tx.trap });
    else if (ctx.initialPrice > 0) {
      const pct = Math.round(((ctx.initialPrice - ctx.finalPrice) / ctx.initialPrice) * 100);
      if (pct >= 25) out.push({ kind: 'good', text: tx.hardDeal(pct) });
      else if (pct < 8) out.push({ kind: 'warn', text: tx.easyDeal });
    }
  }
  if (turns.some((e) => e.name)) out.push({ kind: 'good', text: tx.nameHit });
  const tag = ctx.tags.find((k) => TAG_TIP[k]);
  const tip = tag ? TAG_TIP[tag][ctx.locale] : ctx.profileId && PROFILE_TIP[ctx.profileId] ? PROFILE_TIP[ctx.profileId][ctx.locale] : '';
  if (tip) out.push({ kind: 'tip', text: tip });
  // 5 points maximum : on garde d'abord les erreurs, puis les réussites, puis le conseil.
  const rank = { warn: 0, good: 1, tip: 2 } as const;
  return out.sort((a, b) => rank[a.kind] - rank[b.kind]).slice(0, 5);
}

const ADVICE: Record<Loc, Record<'cheap' | 'walkouts' | 'traps' | 'lowballs' | 'guns' | 'ok', string>> = {
  fr: {
    cheap: 'Tu paies presque le prix demandé en moyenne : monte la Peur (menaces crédibles, indices) avant de proposer un chiffre.',
    walkouts: 'Beaucoup de clients te quittent en cours de route : quand la Colère ou la Méfiance monte, reviens à un ton calme et passe la Loupe.',
    traps: 'Tu achètes des pièges : un prix anormalement bas, l’UV et la Radio sont tes meilleurs alliés, utilise-les avant de payer.',
    lowballs: 'Plusieurs offres étaient sous ~78 % du plancher du vendeur : il les prend pour une insulte. Descends par paliers.',
    guns: 'Des clients ont sorti une arme : les offres agressives et les insultes font monter la Colère trop vite.',
    ok: 'Bonne partie : continue à varier tes approches et à lire les tics de chaque client.',
  },
  en: {
    cheap: 'You pay almost the asking price on average: raise Fear (credible threats, clues) before naming a number.',
    walkouts: 'Many clients leave mid-conversation: when Anger or Suspicion rises, go back to a calm tone and use the Loupe.',
    traps: 'You buy traps: an abnormally low price, the UV and the Radio are your best allies, use them before paying.',
    lowballs: 'Several offers were under ~78% of the seller’s floor: he takes them as an insult. Come down in steps.',
    guns: 'Some clients pulled a weapon: aggressive offers and insults raise Anger too fast.',
    ok: 'Good run: keep varying your approaches and reading each client’s tells.',
  },
  es: {
    cheap: 'Pagas casi el precio pedido de media: sube el Miedo (amenazas creíbles, pistas) antes de decir una cifra.',
    walkouts: 'Muchos clientes se van a mitad de conversación: cuando suben la Ira o la Desconfianza, vuelve a un tono calmado y usa la Lupa.',
    traps: 'Compras trampas: un precio anormalmente bajo, la UV y la Radio son tus mejores aliados, úsalos antes de pagar.',
    lowballs: 'Varias ofertas estaban por debajo del ~78 % del mínimo del vendedor: las toma como un insulto. Baja por escalones.',
    guns: 'Algunos clientes sacaron un arma: las ofertas agresivas y los insultos suben la Ira demasiado rápido.',
    ok: 'Buena partida: sigue variando tus enfoques y leyendo los gestos de cada cliente.',
  },
};

/** Bilan de partie : jusqu'à 3 conseils tirés des statistiques réelles de la partie. */
export function runAdvice(s: RunStats, loc: Loc): string[] {
  const a = ADVICE[loc];
  const out: string[] = [];
  if (s.guns >= 1) out.push(a.guns);
  if (s.lowballs >= 3) out.push(a.lowballs);
  if (s.trapsBought >= 2) out.push(a.traps);
  if (s.deals + s.walkouts + s.guns >= 4 && s.walkouts + s.guns >= s.deals) out.push(a.walkouts);
  if (s.deals >= 3 && s.discountSum / s.deals < 10) out.push(a.cheap);
  return (out.length ? out : [a.ok]).slice(0, 3);
}
