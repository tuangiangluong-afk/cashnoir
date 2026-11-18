import type { Gauges } from './types';
import type { Locale } from '../data/seoContent';
import { formatMoney } from '../data/gameI18n';
import { scriptedNpcRaw } from './scriptedNpc';

export type LLMProvider = 'ollama' | 'gemini' | 'groq' | 'deepseek' | 'openrouter';

/** Crédits de négociation du jour (1 crédit = 1 réplique envoyée au vendeur). */
export interface NpcQuota {
  tier: 'free' | 'pass';
  used: number;
  limit: number;
  remaining: number;
}

export interface LLMConfig {
  provider: LLMProvider;
}

export interface ChatTurn {
  role: 'player' | 'npc';
  content: string;
}

export interface NPCResponse {
  dialogue: string;
  indice_comportemental: string;
  jauges: Gauges;
  prix_actuel_demande: number;
  action_speciale: 'aucune' | 'deal_accepte' | 'quitte_la_boutique' | 'sort_son_arme';
  /** Vrai quand la réplique vient du vendeur scripté (IA indisponible ou quota atteint). */
  scripted?: boolean;
  /** Crédits restants après cette réplique (renvoyé par le serveur). */
  quota?: NpcQuota;
}

const JSON_CONTRACTS: Record<Locale, string> = {
  fr: `Tu DOIS répondre STRICTEMENT avec un objet JSON valide (sans markdown, sans texte avant ni après) respectant ce schéma exact :
{
  "dialogue": "Ta réplique orale vive et naturelle en 1 à 3 phrases courtes (zéro phrase robotique, réagis directement à ce que le joueur vient de dire, avec hésitations ou tension selon tes jauges)",
  "indice_comportemental": "Un micro-geste physique réaliste et court (ex: 'Elle déglutit et baisse les yeux vers la caisse', 'Sa mâchoire se crispe')",
  "jauges": {
    "peur": <entier 0 à 100>,
    "colere": <entier 0 à 100>,
    "mefiance": <entier 0 à 100>
  },
  "prix_actuel_demande": <entier en dollars>,
  "action_speciale": "aucune" | "deal_accepte" | "quitte_la_boutique" | "sort_son_arme"
}`,
  en: `You MUST respond STRICTLY with a valid JSON object (no markdown, no backticks, no prefix or suffix text) matching this exact schema:
{
  "dialogue": "Your gritty, spoken English dialogue in 1 to 3 short punchy sentences (street noir tone, react directly to the player's offer or bluff with realistic street tension)",
  "indice_comportemental": "A brief physical micro-tell in English (e.g. 'He swallows hard and glances at the street reflection', 'Her jaw clenches as her hand twitches near her coat')",
  "jauges": {
    "peur": <integer 0 to 100>,
    "colere": <integer 0 to 100>,
    "mefiance": <integer 0 to 100>
  },
  "prix_actuel_demande": <integer price in dollars>,
  "action_speciale": "aucune" | "deal_accepte" | "quitte_la_boutique" | "sort_son_arme"
}`,
  es: `Debes responder ESTRICTAMENTE con un objeto JSON válido (sin markdown, sin comillas triples, sin texto previo ni posterior) con este esquema exacto:
{
  "dialogue": "Tu réplica hablada en español callejero y tenso en 1 a 3 frases cortas (tono cine negro, reacciona a la oferta o presión)",
  "indice_comportemental": "Un micro-gesto físico realista en español (ej: 'Traga saliva y desvía la mirada hacia la puerta', 'Aprieta la mandíbula con desconfianza')",
  "jauges": {
    "peur": <entero 0 a 100>,
    "colere": <entero 0 a 100>,
    "mefiance": <entero 0 a 100>
  },
  "prix_actuel_demande": <entero en dólares>,
  "action_speciale": "aucune" | "deal_accepte" | "quitte_la_boutique" | "sort_son_arme"
}`,
};

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

/**
 * Calcule le prix plancher dynamique côté moteur (déterministe) selon la peur du PNJ.
 */
export function computeDynamicFloor(initialPrice: number, floorPrice: number, peur: number): number {
  const ratio = Math.min(1, Math.max(0, peur / 85));
  const ceiling = initialPrice * 0.85;
  const raw = ceiling - ratio * (ceiling - floorPrice);
  return Math.max(floorPrice, Math.round(raw / 50) * 50);
}

const LOWBALL_RATIO = 0.65;

export function parseSpelledPrices(text: string): number[] {
  const t = text.toLowerCase();
  const patterns: [RegExp, number][] = [
    // 50s (testés avant les centaines pour capturer 'mille neuf cent cinquante' avant 'mille neuf cents')
    [/\b(?:deux\s+mille\s+neuf\s+cents?\s+cinquante|twenty-nine\s+fifty|dos\s+mil\s+novecientos\s+cincuenta)\b/g, 2950],
    [/\b(?:deux\s+mille\s+huit\s+cents?\s+cinquante|twenty-eight\s+fifty|dos\s+mil\s+ochocientos\s+cincuenta)\b/g, 2850],
    [/\b(?:deux\s+mille\s+sept\s+cents?\s+cinquante|twenty-seven\s+fifty|dos\s+mil\s+setecientos\s+cincuenta)\b/g, 2750],
    [/\b(?:deux\s+mille\s+six\s+cents?\s+cinquante|twenty-six\s+fifty|dos\s+mil\s+seiscientos\s+cincuenta)\b/g, 2650],
    [/\b(?:deux\s+mille\s+cinq\s+cents?\s+cinquante|twenty-five\s+fifty|dos\s+mil\s+quinientos\s+cincuenta)\b/g, 2550],
    [/\b(?:deux\s+mille\s+quatre\s+cents?\s+cinquante|twenty-four\s+fifty|dos\s+mil\s+cuatrocientos\s+cincuenta)\b/g, 2450],
    [/\b(?:deux\s+mille\s+trois\s+cents?\s+cinquante|twenty-three\s+fifty|dos\s+mil\s+trescientos\s+cincuenta)\b/g, 2350],
    [/\b(?:deux\s+mille\s+deux\s+cents?\s+cinquante|twenty-two\s+fifty|dos\s+mil\s+doscientos\s+cincuenta)\b/g, 2250],
    [/\b(?:deux\s+mille\s+cent?\s+cinquante|twenty-one\s+fifty|dos\s+mil\s+ciento?\s+cincuenta)\b/g, 2150],
    [/\b(?:deux\s+mille\s+cinquante|two\s+thousand\s+fifty|dos\s+mil\s+cincuenta)\b/g, 2050],
    [/\b(?:mille\s+neuf\s+cents?\s+cinquante|dix-neuf\s+cents?\s+cinquante|nineteen\s+fifty|mil\s+novecientos\s+cincuenta)\b/g, 1950],
    [/\b(?:mille\s+huit\s+cents?\s+cinquante|dix-huit\s+cents?\s+cinquante|eighteen\s+fifty|mil\s+ochocientos\s+cincuenta)\b/g, 1850],
    [/\b(?:mille\s+sept\s+cents?\s+cinquante|dix-sept\s+cents?\s+cinquante|seventeen\s+fifty|mil\s+setecientos\s+cincuenta)\b/g, 1750],
    [/\b(?:mille\s+six\s+cents?\s+cinquante|seize\s+cents?\s+cinquante|sixteen\s+fifty|mil\s+seiscientos\s+cincuenta)\b/g, 1650],
    [/\b(?:mille\s+cinq\s+cents?\s+cinquante|quinze\s+cents?\s+cinquante|fifteen\s+fifty|mil\s+quinientos\s+cincuenta)\b/g, 1550],
    [/\b(?:mille\s+quatre\s+cents?\s+cinquante|quatorze\s+cents?\s+cinquante|fourteen\s+fifty|mil\s+cuatrocientos\s+cincuenta)\b/g, 1450],
    [/\b(?:mille\s+trois\s+cents?\s+cinquante|treize\s+cents?\s+cinquante|thirteen\s+fifty|mil\s+trescientos\s+cincuenta)\b/g, 1350],
    [/\b(?:mille\s+deux\s+cents?\s+cinquante|douze\s+cents?\s+cinquante|twelve\s+fifty|mil\s+doscientos\s+cincuenta)\b/g, 1250],
    [/\b(?:mille\s+cent?\s+cinquante|onze\s+cents?\s+cinquante|eleven\s+fifty|mil\s+ciento?\s+cincuenta)\b/g, 1150],
    [/\b(?:mille\s+cinquante|one\s+thousand\s+fifty|mil\s+cincuenta)\b/g, 1050],

    // Centaines
    [/\b(?:deux\s+mille\s+neuf\s+cents?|twenty-nine\s+hundred|dos\s+mil\s+novecientos)\b/g, 2900],
    [/\b(?:deux\s+mille\s+huit\s+cents?|twenty-eight\s+hundred|dos\s+mil\s+ochocientos)\b/g, 2800],
    [/\b(?:deux\s+mille\s+sept\s+cents?|twenty-seven\s+hundred|dos\s+mil\s+setecientos)\b/g, 2700],
    [/\b(?:deux\s+mille\s+six\s+cents?|twenty-six\s+hundred|dos\s+mil\s+seiscientos)\b/g, 2600],
    [/\b(?:deux\s+mille\s+cinq\s+cents?|twenty-five\s+hundred|dos\s+mil\s+quinientos)\b/g, 2500],
    [/\b(?:deux\s+mille\s+quatre\s+cents?|twenty-four\s+hundred|dos\s+mil\s+cuatrocientos)\b/g, 2400],
    [/\b(?:deux\s+mille\s+trois\s+cents?|twenty-three\s+hundred|dos\s+mil\s+trescientos)\b/g, 2300],
    [/\b(?:deux\s+mille\s+deux\s+cents?|twenty-two\s+hundred|dos\s+mil\s+doscientos)\b/g, 2200],
    [/\b(?:deux\s+mille\s+cents?|twenty-one\s+hundred|dos\s+mil\s+cien)\b/g, 2100],
    [/\b(?:mille\s+neuf\s+cents?|dix-neuf\s+cents?|nineteen\s+hundred|mil\s+novecientos)\b/g, 1900],
    [/\b(?:mille\s+huit\s+cents?|dix-huit\s+cents?|eighteen\s+hundred|mil\s+ochocientos)\b/g, 1800],
    [/\b(?:mille\s+sept\s+cents?|dix-sept\s+cents?|seventeen\s+hundred|mil\s+setecientos)\b/g, 1700],
    [/\b(?:mille\s+six\s+cents?|seize\s+cents?|sixteen\s+hundred|mil\s+seiscientos)\b/g, 1600],
    [/\b(?:mille\s+cinq\s+cents?|quinze\s+cents?|fifteen\s+hundred|mil\s+quinientos)\b/g, 1500],
    [/\b(?:mille\s+quatre\s+cents?|quatorze\s+cents?|fourteen\s+hundred|mil\s+cuatrocientos)\b/g, 1400],
    [/\b(?:mille\s+trois\s+cents?|treize\s+cents?|thirteen\s+hundred|mil\s+trescientos)\b/g, 1300],
    [/\b(?:mille\s+deux\s+cents?|douze\s+cents?|twelve\s+hundred|mil\s+doscientos)\b/g, 1200],
    [/\b(?:mille\s+cents?|onze\s+cents?|eleven\s+hundred|mil\s+cien)\b/g, 1100],
    [/\b(?:deux\s+mille|two\s+thousand|dos\s+mil)\b/g, 2000],
    [/\b(?:trois\s+mille|three\s+thousand|tres\s+mil)\b/g, 3000],
    [/\b(?:quatre\s+mille|four\s+thousand|cuatro\s+mil)\b/g, 4000],
    [/\b(?:cinq\s+mille|five\s+thousand|cinco\s+mil)\b/g, 5000],
    [/\b(?:mille|one\s+thousand|mil)\b/g, 1000],
  ];
  const found: number[] = [];
  let s = t;
  for (const [regex, val] of patterns) {
    if (regex.test(s)) {
      found.push(val);
      s = s.replace(regex, '');
    }
  }
  return found;
}

export function spelledAmount(n: number, locale: Locale): string {
  const thousands = Math.floor(n / 1000);
  const rem = n % 1000;
  if (locale === 'fr') {
    const tMap: Record<number, string> = {
      1: 'mille',
      2: 'deux mille',
      3: 'trois mille',
      4: 'quatre mille',
      5: 'cinq mille',
      6: 'six mille',
      7: 'sept mille',
      8: 'huit mille',
      9: 'neuf mille',
    };
    const tStr = tMap[thousands] || `${thousands} mille`;
    if (rem === 0) return `${tStr} dollars`;
    return `${tStr} ${rem} dollars`;
  }
  if (locale === 'es') {
    const tMap: Record<number, string> = {
      1: 'mil',
      2: 'dos mil',
      3: 'tres mil',
      4: 'cuatro mil',
      5: 'cinco mil',
    };
    const tStr = tMap[thousands] || `${thousands} mil`;
    if (rem === 0) return `${tStr} dólares`;
    return `${tStr} ${rem} dólares`;
  }
  const tMap: Record<number, string> = {
    1: 'one thousand',
    2: 'two thousand',
    3: 'three thousand',
    4: 'four thousand',
    5: 'five thousand',
  };
  const tStr = tMap[thousands] || `${thousands} thousand`;
  if (rem === 0) return `${tStr} dollars`;
  return `${tStr} ${rem} dollars`;
}

export function sanitizeSpelledOffer(dialogue: string, playerOffer: number | undefined, locale: Locale): string {
  if (playerOffer === undefined) return dialogue;
  let cleaned = dialogue;
  if (locale === 'fr') {
    if (playerOffer >= 1800 && playerOffer <= 2200) {
      cleaned = cleaned.replace(/\bvingt[\s-]mille\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Deux mille' : 'deux mille'));
      cleaned = cleaned.replace(/\b20[\s\u202f\u00a0]?000\s*\$?/gi, `${playerOffer.toLocaleString('fr-FR')} $`);
    } else if (playerOffer >= 2800 && playerOffer <= 3200) {
      cleaned = cleaned.replace(/\btrente[\s-]mille\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Trois mille' : 'trois mille'));
      cleaned = cleaned.replace(/\b30[\s\u202f\u00a0]?000\s*\$?/gi, `${playerOffer.toLocaleString('fr-FR')} $`);
    }
  } else if (locale === 'en') {
    if (playerOffer >= 1800 && playerOffer <= 2200) {
      cleaned = cleaned.replace(/\btwenty[\s-]thousand\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Two thousand' : 'two thousand'));
      cleaned = cleaned.replace(/\$?\b20[, ]?000\b/gi, `$${playerOffer.toLocaleString('en-US')}`);
    }
  } else if (locale === 'es') {
    if (playerOffer >= 1800 && playerOffer <= 2200) {
      cleaned = cleaned.replace(/\bveinte[\s-]mil\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Dos mil' : 'dos mil'));
      cleaned = cleaned.replace(/\b20[., ]?000\s*\$?/gi, `${playerOffer.toLocaleString('es-ES')} $`);
    }
  }
  return cleaned;
}

function sanitizeText(raw: unknown, fallback: string): string {
  const s = String(raw || fallback)
    .replace(/(?:<0xE2><0x80><0xAF>|<0xC2><0xA0>|[\u202f\u00a0])/gi, ' ')
    .replace(/<0x[0-9A-Fa-f]{2}>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return s || fallback;
}

export function parseNPCJson(
  rawText: string,
  fallbackGauges: Gauges,
  currentPrice: number,
  initialPrice: number,
  floorPrice: number,
  playerOffer?: number,
  locale: Locale = 'fr',
  gender: 'm' | 'f' = 'm',
  fearCap = 25,
  leaveGuard = true,
): NPCResponse {
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned);
  const validActions = ['aucune', 'deal_accepte', 'quitte_la_boutique', 'sort_son_arme'];
  let action: NPCResponse['action_speciale'] = validActions.includes(parsed.action_speciale)
    ? parsed.action_speciale
    : 'aucune';

  const jauges: Gauges = {
    peur: clamp(
      Math.min(fallbackGauges.peur + fearCap, Number(parsed.jauges?.peur ?? fallbackGauges.peur)),
      0,
      100,
    ),
    colere: clamp(
      Math.min(fallbackGauges.colere + 25, Number(parsed.jauges?.colere ?? fallbackGauges.colere)),
      0,
      100,
    ),
    mefiance: clamp(
      Math.min(
        fallbackGauges.mefiance + 25,
        Number(parsed.jauges?.mefiance ?? fallbackGauges.mefiance),
      ),
      0,
      100,
    ),
  };

  let dynamicFloor = computeDynamicFloor(initialPrice, floorPrice, jauges.peur);
  let nextPrice = Math.min(
    currentPrice,
    Math.max(floorPrice, Math.round(Number(parsed.prix_actuel_demande ?? currentPrice))),
  );

  // Extrait tout prix de concession ou contre-offre mentionné textuellement par le NPC (en chiffres et en toutes lettres)
  const numericMatches = Array.from(
    String(parsed.dialogue || '').matchAll(/(?:\$\s*(\d[\d,\s\u202f\u00a0]{1,8})|(\d[\d,\s\u202f\u00a0]{1,8})\s*(?:\$|dollars?))/gi),
  )
    .map((m) => Number((m[1] || m[2]).replace(/[\s\u202f\u00a0,\.]/g, '')));
  const spelledMatches = parseSpelledPrices(String(parsed.dialogue || ''));
  const dialoguePriceMatches = [...numericMatches, ...spelledMatches]
    .filter((n) => Number.isFinite(n) && n >= floorPrice && n <= initialPrice);

  const rawDialogue = String(parsed.dialogue || '');
  const hasRefusalCue =
    /(?:pas\s+un\s+de\s+moins|trouverai\s+(?:un|quelqu['’]un)\s+autre|jamais\s+vendu|hors\s+de\s+question|pas\s+question|certainement\s+pas|vous\s+r[êe]vez|no\s+way|not\s+a\s+chance|ni\s+de\s+coña|de\s+ninguna\s+manera)/i.test(
      rawDialogue,
    );

  const concessionToPlayerOffer = Boolean(
    playerOffer !== undefined &&
    !hasRefusalCue &&
    dialoguePriceMatches.includes(playerOffer) &&
    /(?:donnez-moi|d'accord|va\s+pour|prenez|march[ée]|oubli(?:ez|e)\s+le\s+prix|laissez-moi|take|give\s+me|all\s+right|de\s+acuerdo|dame)/i.test(
      rawDialogue,
    ),
  );

  const mentionedPrice = concessionToPlayerOffer
    ? playerOffer
    : dialoguePriceMatches.find((p) => p < currentPrice && p !== playerOffer);
  const hasConcededInDialogue = Boolean(mentionedPrice && mentionedPrice <= currentPrice);
  if (hasConcededInDialogue && mentionedPrice) {
    // Plafond de baisse par tour (25 %, 5 % pour un simple indice matériel), sauf si la peur était déjà installée.
    const maxDrop = fearCap < 25 ? 0.95 : 0.75;
    const lowestAllowed =
      fallbackGauges.peur >= 55 ? floorPrice : Math.max(floorPrice, Math.round((currentPrice * maxDrop) / 50) * 50);
    nextPrice = Math.min(nextPrice, Math.max(lowestAllowed, Math.round(mentionedPrice / 50) * 50));
    dynamicFloor = Math.min(dynamicFloor, nextPrice);
  }

  // Empêche le modèle d'augmenter son prix s'il a plus peur qu'avant,
  // et rapproche réalistement le prix si l'offre du joueur frôle le plancher dynamique.
  if (jauges.peur > fallbackGauges.peur && nextPrice >= currentPrice) {
    nextPrice = Math.max(dynamicFloor, Math.round((currentPrice * 0.85) / 50) * 50);
  } else if (
    playerOffer !== undefined &&
    playerOffer >= dynamicFloor * 0.78 &&
    playerOffer < dynamicFloor &&
    jauges.colere < 70 &&
    nextPrice > dynamicFloor
  ) {
    nextPrice = Math.max(
      dynamicFloor,
      Math.round(((currentPrice + dynamicFloor) / 2) / 50) * 50,
    );
  }

  // Anti-capitulation : ne baisse pas de plus de 25 % d'un coup sauf si la peur est installée ou si le vendeur a concédé
  if (jauges.peur < 55 && !hasConcededInDialogue && action !== 'deal_accepte') {
    nextPrice = Math.max(nextPrice, Math.max(floorPrice, Math.round((currentPrice * (fearCap < 25 ? 0.95 : 0.75)) / 50) * 50));
  }

  // Un lowball insultant arrive UNIQUEMENT si l'offre est sous le plancher dynamique
  // ET que le vendeur n'est pas terrorisé. S'il est sous pression ou si l'offre >= dynamicFloor, ce n'est PAS un lowball.
  const isTerrified = fallbackGauges.peur >= 55;
  const isCloseToAsked = playerOffer !== undefined && playerOffer >= currentPrice * 0.82;
  const satisfiesDynamicFloor = playerOffer !== undefined && playerOffer >= dynamicFloor;
  const lowball =
    playerOffer !== undefined &&
    !satisfiesDynamicFloor &&
    !isCloseToAsked &&
    !isTerrified &&
    playerOffer < currentPrice * LOWBALL_RATIO;

  if (lowball) {
    jauges.colere = clamp(Math.min(fallbackGauges.colere + 25, jauges.colere + 12), 0, 100);
    nextPrice = Math.min(currentPrice, Math.max(floorPrice, Math.round((currentPrice * 0.92) / 50) * 50));
    if (action === 'deal_accepte') action = 'aucune';
  }

  // Le modèle ne peut pas faire partir le vendeur sur un simple bluff : il faut une vraie montée de méfiance ou de colère.
  if (leaveGuard && action === 'quitte_la_boutique' && jauges.mefiance < 72 && jauges.colere < 62) action = 'aucune';

  // Un deal ne peut JAMAIS être conclu sans offre explicite du joueur.
  if (playerOffer === undefined && action === 'deal_accepte') {
    action = 'aucune';
  }

  // Détection d'accord explicite dans le dialogue du PNJ (sans signal de refus)
  const dialogueAgreed =
    playerOffer !== undefined &&
    !lowball &&
    !hasRefusalCue &&
    (/(?:march[ée] conclu|affaire conclue|c'est d'accord|topons l[àa]|it'?s a deal|deal done|you'?ve got a deal|trato hecho|hecho,? trato)/i.test(
      rawDialogue,
    ) ||
      /(?:c'est parfait|c'est \u00e7a,? c'est parfait|laissez-moi (?:juste )?partir[.,\s]+(?:oui|c'est (?:parfait|bon))|vous avez raison[.,\s]+.*?(?:laissez-moi|prenez|d'accord|c'est (?:parfait|ça|bon))|all right,? take it|take the money|d'accord,? (?:prenez-le|je cède|va pour)|donnez-moi (?:le cash|l'argent|les billets) et (?:je pars|laissez-moi))/i.test(
        rawDialogue,
      ));

  // Enforcement déterministe des seuils et de l'acceptation d'offre
  let forcedOutcome: 'deal' | 'gun' | 'leave' | 'lowball' | null = lowball ? 'lowball' : null;
  const fearAllowsFloor = (jauges.peur >= 40 || fallbackGauges.peur >= 40) && playerOffer !== undefined && playerOffer >= floorPrice;
  const offerOk =
    playerOffer !== undefined &&
    (playerOffer >= dynamicFloor ||
      playerOffer >= nextPrice ||
      (hasConcededInDialogue && mentionedPrice && playerOffer >= mentionedPrice) ||
      concessionToPlayerOffer ||
      // Accord du modèle (action ou phrase) : toléré à 10 % sous le plancher, ou jusqu'au plancher réel si peur installée.
      ((action === 'deal_accepte' || dialogueAgreed) && !lowball && (fearAllowsFloor || playerOffer >= dynamicFloor * 0.90)));

  // Une acceptation du modèle n'est valable que si l'offre tient (plancher, ou 5 % sous le plancher avec accord explicite).
  if (action === 'deal_accepte' && (playerOffer === undefined || lowball || !offerOk)) {
    action = 'aucune';
  }

  if (
    !lowball &&
    playerOffer !== undefined &&
    offerOk &&
    fallbackGauges.colere < 78
  ) {
    forcedOutcome = 'deal';
    action = 'deal_accepte';
    // On ne paie jamais plus que le prix demandé, même si le joueur a proposé davantage.
    nextPrice = Math.min(playerOffer, currentPrice);
  } else if (jauges.colere >= 80) {
    if (action !== 'sort_son_arme') forcedOutcome = 'gun';
    action = 'sort_son_arme';
  } else if (jauges.mefiance >= 88) {
    if (action !== 'quitte_la_boutique') forcedOutcome = 'leave';
    action = 'quitte_la_boutique';
  }
  if (forcedOutcome === 'lowball' && action !== 'aucune') {
    forcedOutcome = action === 'sort_son_arme' ? 'gun' : 'leave';
  }

  let dialogue = sanitizeText(parsed.dialogue, '...');
  // Nettoie l'inversion de rôle linguistique (vendeur disant par erreur 'je vous en donne X $' au lieu de 'je vous le cède à X $')
  if (locale === 'fr') {
    dialogue = dialogue.replace(/\bje\s+(?:vous|t['’]en)\s+(?:donne|lâche)\s+(\d+)/gi, 'je vous le cède à $1');
  } else if (locale === 'en') {
    dialogue = dialogue.replace(/\bI(?:'ll)?\s+give\s+you\s+\$?(\d+)/gi, "I'll let you have it for $$$1");
  } else if (locale === 'es') {
    dialogue = dialogue.replace(/\bte\s+doy\s+(\d+)/gi, 'te lo dejo en $1');
  }

  // Nettoie toute confusion 2000 vs 20000 ("vingt mille" -> "deux mille")
  dialogue = sanitizeSpelledOffer(dialogue, playerOffer, locale);
  let tell = sanitizeText(
    parsed.indice_comportemental,
    locale === 'en'
      ? 'A heavy silence settles across the counter.'
      : locale === 'es'
        ? 'Un silencio pesado se instala sobre el mostrador.'
        : 'Un silence lourd s’installe derrière le comptoir.',
  );

  // Synchronise tout prix dans le dialogue avec nextPrice réel si aucun outcome forcé
  if (!forcedOutcome) {
    const formattedNext =
      locale === 'en'
        ? nextPrice.toLocaleString('en-US')
        : locale === 'es'
          ? nextPrice.toLocaleString('es-ES')
          : nextPrice.toLocaleString('fr-FR').replace(/[\u202f\u00a0]/g, ' ');
    dialogue = dialogue.replace(
      /(?:\$\s*(\d{1,3}(?:[,\.]\d{3})+|\d+)|(\d{1,3}(?:[ \u202f\u00a0\.]\d{3})+|\d+)\s*(?:\$|dollars?))/gi,
      (full, p1, p2) => {
        const numStr = p1 || p2;
        const val = Number(String(numStr).replace(/[\s\u202f\u00a0,\.]/g, ''));
        if (Number.isFinite(val) && val !== playerOffer && val !== nextPrice) {
          return locale === 'en' ? `$${formattedNext}` : `${formattedNext} $`;
        }
        return full;
      },
    );
    // Remplacement aussi si le modèle répète l'ancien prix initial exact sans symbole
    if (initialPrice && nextPrice !== initialPrice) {
      const initStr = String(initialPrice);
      const initFormatted = initialPrice.toLocaleString(locale === 'en' ? 'en-US' : 'fr-FR').replace(/[\u202f\u00a0]/g, ' ');
      const initRegex = new RegExp(`\\b(?:${initStr}|${initFormatted})\\b`, 'g');
      dialogue = dialogue.replace(initRegex, formattedNext);
    }
  }

  const isFemale = gender === 'f';

  if (forcedOutcome === 'deal') {
    const dealAmount = playerOffer !== undefined ? playerOffer : nextPrice;
    const formattedOffer = formatMoney(dealAmount, locale);
    if (!dialogueAgreed && parsed.action_speciale !== 'deal_accepte') {
      if (locale === 'en') {
        dialogue = `Deal sealed for $${formattedOffer}. Hand over the bills, and I was never here.`;
        tell = `${isFemale ? 'She' : 'He'} pushes the item across the counter and reaches for the cash.`;
      } else if (locale === 'es') {
        dialogue = `Trato cerrado por ${formattedOffer} $. Dame los billetes y olvida mi cara.`;
        tell = `${isFemale ? 'Ella empuja' : 'Empuja'} el objeto sobre el mostrador y extiende la mano para el dinero.`;
      } else {
        dialogue = `Marché conclu pour ${formattedOffer} $. Donne le liquide, je disparais.`;
        tell = `${isFemale ? 'Elle' : 'Il'} pousse l'objet vers toi et tend la main pour les billets.`;
      }
    }
  } else if (forcedOutcome === 'gun') {
    if (locale === 'en') {
      dialogue = "That's it, smartass. You crossed the line — empty the register, right now.";
      tell = `${isFemale ? 'She pulls a gun from beneath her' : 'He pulls a gun from beneath his'} coat and points it straight at your chest.`;
    } else if (locale === 'es') {
      dialogue = "Se acabó el juego, listo. Cruzaste la raya: vacía la caja ahora mismo.";
      tell = 'Saca un arma de debajo del abrigo y te apunta directamente al pecho.';
    } else {
      dialogue = "Assez joué au malin. T'as dépassé la limite — vide la caisse, tout de suite.";
      tell = `${isFemale ? 'Elle' : 'Il'} sort une arme de sous son manteau et la braque sur toi.`;
    }
  } else if (forcedOutcome === 'lowball') {
    const ask = formatMoney(nextPrice, locale);
    if (locale === 'en') {
      dialogue = `That's an insult. I'm not giving it away. $${ask}, and not a cent less without a real reason.`;
      tell = `${isFemale ? 'Her' : 'His'} jaw tightens and ${isFemale ? 'she' : 'he'} slides the item back toward ${isFemale ? 'herself' : 'himself'}.`;
    } else if (locale === 'es') {
      dialogue = `Eso es un insulto. No lo regalo. ${ask} $, y ni un centavo menos sin una buena razón.`;
      tell = `Aprieta la mandíbula y arrastra el objeto de vuelta hacia ${isFemale ? 'ella' : 'él'}.`;
    } else {
      dialogue = `C'est une insulte. Je ne le brade pas. ${ask} $, pas un dollar de moins sans vraie raison.`;
      tell = `Sa mâchoire se crispe, ${isFemale ? 'elle' : 'il'} ramène l'objet vers ${isFemale ? 'elle' : 'lui'}.`;
    }
  } else if (forcedOutcome === 'leave') {
    if (locale === 'en') {
      dialogue = "You're too jumpy and asking too many questions for a fence. I'm out.";
      tell = `${isFemale ? 'She' : 'He'} grabs ${isFemale ? 'her' : 'his'} item off the counter and slams the heavy door behind ${isFemale ? 'her' : 'him'}.`;
    } else if (locale === 'es') {
      dialogue = "Estás demasiado nervioso y haces demasiadas preguntas. Me largo.";
      tell = 'Agarra su objeto del mostrador y da un portazo al salir.';
    } else {
      dialogue = "T'es trop nerveux et trop curieux pour un receleur. Je me casse.";
      tell = `${isFemale ? 'Elle' : 'Il'} attrape son objet et claque la porte derrière ${isFemale ? 'elle' : 'lui'}.`;
    }
  }

  return {
    dialogue,
    indice_comportemental: tell,
    jauges,
    prix_actuel_demande: nextPrice,
    action_speciale: action,
  };
}

export async function queryNPC(
  config: LLMConfig,
  systemPrompt: string,
  history: ChatTurn[],
  currentGauges: Gauges,
  currentPrice: number,
  initialPrice: number,
  floorPrice: number,
  playerOffer?: number,
  locale: Locale = 'fr',
  run?: { runId: string; ticket: string },
  gender: 'm' | 'f' = 'm',
  fearCap = 25,
  leaveGuard = true,
): Promise<NPCResponse> {
  const dynamicFloor = computeDynamicFloor(initialPrice, floorPrice, currentGauges.peur);
  const jsonContract = JSON_CONTRACTS[locale] || JSON_CONTRACTS.fr;
  
  const statusNote = locale === 'en'
    ? `CURRENT GAUGES STATUS: fear=${currentGauges.peur}, anger=${currentGauges.colere}, suspicion=${currentGauges.mefiance}.
CURRENT ASKING PRICE: $${currentPrice} (ABSOLUTE RULE: NEVER ask for more than $${currentPrice}, price can only drop or stay at $${currentPrice}).
ACCEPTABLE FLOOR THRESHOLD: $${dynamicFloor} (if player offers at least $${dynamicFloor} without insults, accept the deal).${
      playerOffer !== undefined
        ? `\nPLAYER'S CASH OFFER THIS TURN: $${playerOffer} (${spelledAmount(playerOffer, 'en')} — read this exact amount in digits: $${playerOffer}, do not confuse with $20,000).`
        : ''
    }
MANDATORY COMMERCIAL ROLE: YOU ARE THE SELLER demanding cash. The player is the BUYER. You NEVER give cash to the player. NEVER say "I give you $X". Say "I'll let you have it for $X", "give me $X and I walk", or "deal for $X".
PRICE CONSISTENCY DIRECTIVE: Any price you speak in your dialogue MUST strictly match your current asking price or counter-offer. ALWAYS write prices in DIGITS with $ (e.g. "$${currentPrice}", never spell out large numbers in words). If you accept the player's cash offer or say deal/alright, you MUST set action_speciale to "deal_accepte" and prix_actuel_demande to ${playerOffer ?? currentPrice}.
MANDATORY LANGUAGE: Respond 100% in gritty spoken English.`
    : locale === 'es'
      ? `ESTADO ACTUAL DE LAS BARRAS: miedo=${currentGauges.peur}, ira=${currentGauges.colere}, desconfianza=${currentGauges.mefiance}.
PRECIO ACTUAL PEDIDO: ${currentPrice} $ (REGLA ABSOLUTA: NUNCA pidas más de ${currentPrice} $, el precio solo puede bajar o mantenerse).
UMBRAL MÍNIMO ACEPTABLE: ${dynamicFloor} $ (si el jugador ofrece al menos ${dynamicFloor} $ sin insultarte, aceptas el trato).${
        playerOffer !== undefined
          ? `\nOFERTA EN EFECTIVO DEL JUGADOR ESTE TURNO: ${playerOffer} $ (${spelledAmount(playerOffer, 'es')} — lee este monto exacto en números: ${playerOffer} $, no confundir con 20 000 $).`
          : ''
      }
ROL COMERCIAL OBLIGATORIO: ERES EL VENDEDOR pidiendo efectivo. El jugador es el COMPRADOR. NUNCA le das dinero al jugador. NUNCA digas "te doy X $". Di "te lo dejo en X $", "dame X $ y me voy", o "trato hecho por X $".
DIRECTIVA DE PRECIO: Cualquier precio que digas DEBE coincidir con tu precio actual. Escribe SIEMPRE los precios en CIFRAS con $ (ej: "${currentPrice} $", NUNCA en letras). Si aceptas la oferta del jugador o dices que sí en tu diálogo, debes poner action_speciale: "deal_accepte" y prix_actuel_demande: ${playerOffer ?? currentPrice}.
IDIOMA OBLIGATORIO: Responde 100% en español callejero.`
      : `ÉTAT ACTUEL DES JAUGES : peur=${currentGauges.peur}, colere=${currentGauges.colere}, mefiance=${currentGauges.mefiance}.
PRIX ACTUEL DEMANDÉ : ${currentPrice} $ (RÈGLE ABSOLUE : ne demande JAMAIS plus que ${currentPrice} $, le prix ne peut que baisser ou rester à ${currentPrice} $).
SEUIL ACCEPTABLE ACTUEL : ${dynamicFloor} $ (si le joueur propose au moins ${dynamicFloor} $ sans t'insulter, tu acceptes le deal).${
        playerOffer !== undefined
          ? `\nOFFRE CHIFFRÉE DU JOUEUR CE TOUR : ${playerOffer} $ (${spelledAmount(playerOffer, 'fr')} — lis bien ce montant exact en chiffres : ${playerOffer} $, et ne le confonds JAMAIS avec 20 000 $ ni "vingt mille").`
          : ''
      }
RÔLE COMMERCIAL OBLIGATOIRE : TU ES LE VENDEUR qui réclame du liquide. Le joueur est l'ACHETEUR. Tu ne donnes JAMAIS d'argent au joueur. Ne dis JAMAIS "je vous en donne X $" ni "je vous donne X $". Dis "je vous le cède pour X $", "laissez-moi partir avec X $", ou "donnez-moi X $ et je disparais".
DIRECTIVE DE PRIX : Tout prix que tu prononces dans ton dialogue DOIT être écrit en CHIFFRES avec le symbole $ (exemple : "${currentPrice} $", JAMAIS en toutes lettres). Si tu acceptes l'offre du joueur dans ton texte ("d'accord", "vous avez raison", "laissez-moi partir", "marché conclu"), tu DOIS OBLIGATOIREMENT renvoyer action_speciale: "deal_accepte" et prix_actuel_demande: ${playerOffer ?? currentPrice}.`;

  const fullSystem = `${systemPrompt}

${statusNote}
${jsonContract}`;

  let raw = '';
  let scripted = false;
  let quota: NpcQuota | undefined;

  if (config.provider === 'ollama') {
    const messages = [
      { role: 'system', content: fullSystem },
      ...history.map((turn) => ({
        role: turn.role === 'player' ? 'user' : 'assistant',
        content: turn.content,
      })),
    ];

    const res = await fetch('/api/ollama/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma4:latest',
        messages,
        format: 'json',
        stream: false,
        think: false,
        options: { temperature: 0.7 },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(locale === 'en' ? `Ollama error (${res.status}): ${errText.slice(0, 180)}` : locale === 'es' ? `Error de Ollama (${res.status}): ${errText.slice(0, 180)}` : `Erreur Ollama (${res.status}): ${errText.slice(0, 180)}`);
    }

    const data = await res.json();
    raw = data?.message?.content ?? '';
  } else {
    // Clés Gemini/Groq : exclusivement côté serveur, jamais dans le navigateur.
    let res: Response | null = null;
    let data: { raw?: string; error?: string; quota?: NpcQuota } = {};
    try {
      res = await fetch('/api/npc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: config.provider,
          systemPrompt: fullSystem,
          messages: history.map((turn) => ({ role: turn.role, content: turn.content })),
          ...(run ? { runId: run.runId, ticket: run.ticket } : {}),
        }),
      });
      data = (await res.json().catch(() => ({}))) as { raw?: string; error?: string; quota?: NpcQuota };
    } catch {
      res = null;
    }

    if (!res || !res.ok) {
      // Fallback automatique vers le modèle local Ollama si le serveur externe ou Gemini a échoué
      try {
        const messages = [
          { role: 'system', content: fullSystem },
          ...history.map((turn) => ({
            role: turn.role === 'player' ? 'user' : 'assistant',
            content: turn.content,
          })),
        ];
        const localRes = await fetch('http://127.0.0.1:11434/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gemma4:latest',
            messages,
            format: 'json',
            stream: false,
            options: { temperature: 0.7 },
          }),
        });
        if (localRes.ok) {
          const localData = await localRes.json();
          raw = localData?.message?.content ?? '';
        }
      } catch {
        // Ollama non disponible non plus, lever l'erreur d'origine
      }

      if (!raw && !run) {
        // IA indisponible (quota gratuit, budget du jour, panne) : on bascule sur le vendeur scripté, sans coût.
        raw = scriptedNpcRaw({ history, gauges: currentGauges, currentPrice, dynamicFloor, playerOffer, locale, gender });
        scripted = true;
      }
      if (!raw) {
        throw new Error(
          data?.error ||
            (locale === 'en'
              ? `${config.provider} error (${res?.status ?? 504}). Check .env.local on the server.`
              : locale === 'es'
                ? `Error de ${config.provider} (${res?.status ?? 504}). Revisa .env.local en el servidor.`
                : `Erreur ${config.provider} (${res?.status ?? 504}). Vérifie .env.local côté serveur.`),
        );
      }
    } else {
      raw = String(data?.raw ?? '');
      quota = data?.quota;
    }
  }

  if (!raw) throw new Error(locale === 'en' ? 'Empty model response.' : locale === 'es' ? 'Respuesta vacía del modelo.' : 'Réponse du modèle vide.');
  const parsed = parseNPCJson(raw, currentGauges, currentPrice, initialPrice, floorPrice, playerOffer, locale, gender, fearCap, leaveGuard);
  return { ...parsed, ...(scripted ? { scripted: true } : {}), ...(quota ? { quota } : {}) };
}
