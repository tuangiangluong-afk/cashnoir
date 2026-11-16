import type { Gauges } from './types';
import type { Locale } from '../data/seoContent';
import { formatMoney } from '../data/gameI18n';

export type LLMProvider = 'ollama' | 'gemini' | 'groq' | 'deepseek';

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

function sanitizeText(raw: unknown, fallback: string): string {
  const s = String(raw || fallback)
    .replace(/(?:<0xE2><0x80><0xAF>|<0xC2><0xA0>|[\u202f\u00a0])/gi, ' ')
    .replace(/<0x[0-9A-Fa-f]{2}>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return s || fallback;
}

function parseNPCJson(
  rawText: string,
  fallbackGauges: Gauges,
  currentPrice: number,
  initialPrice: number,
  floorPrice: number,
  playerOffer?: number,
  locale: Locale = 'fr',
  gender: 'm' | 'f' = 'm',
  fearCap = 25,
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

  const dynamicFloor = computeDynamicFloor(initialPrice, floorPrice, jauges.peur);
  let nextPrice = Math.min(
    currentPrice,
    Math.max(floorPrice, Math.round(Number(parsed.prix_actuel_demande ?? currentPrice))),
  );

  // Extrait tout prix de concession ou contre-offre mentionné textuellement par le NPC
  const dialoguePriceMatches = Array.from(
    String(parsed.dialogue || '').matchAll(/(?:^|[^\d])(\d[\d\s\u202f\u00a0]{1,6})\s*(?:\$|dollars?)/gi),
  )
    .map((m) => Number(m[1].replace(/[\s\u202f\u00a0]/g, '')))
    .filter((n) => Number.isFinite(n) && n >= floorPrice && n <= initialPrice);
  const mentionedPrice = dialoguePriceMatches.find((p) => p < currentPrice && p !== playerOffer);
  if (mentionedPrice && mentionedPrice < nextPrice) {
    nextPrice = Math.max(dynamicFloor, Math.round(mentionedPrice / 50) * 50);
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

  // Anti-capitulation : quand le vendeur n'est pas terrifié (peur < 55), il ne baisse pas
  // de plus de 25 % d'un coup. S'il a la trouille (peur >= 55), il peut craquer jusqu'au plancher.
  if (jauges.peur < 55) {
    nextPrice = Math.max(nextPrice, Math.max(floorPrice, Math.round((currentPrice * (fearCap < 25 ? 0.95 : 0.75)) / 50) * 50));
  } else {
    nextPrice = Math.max(dynamicFloor, nextPrice);
  }

  // Un lowball insultant arrive UNIQUEMENT si l'offre est sous le plancher dynamique
  // ET que le vendeur n'est pas terrorisé. S'il est sous pression ou si l'offre >= dynamicFloor, ce n'est PAS un lowball.
  // La peur doit déjà être installée AVANT ce message : un seul bluff ne suffit pas à tout débloquer.
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
    jauges.colere = clamp(Math.min(fallbackGauges.colere + 25, jauges.colere + 18), 0, 100);
    nextPrice = Math.min(currentPrice, Math.max(floorPrice, Math.round((currentPrice * 0.92) / 50) * 50));
    if (action === 'deal_accepte') action = 'aucune';
  }

  // Enforcement déterministe des seuils et de l'acceptation d'offre
  let forcedOutcome: 'deal' | 'gun' | 'leave' | 'lowball' | null = lowball ? 'lowball' : null;
  const offerOk = playerOffer === undefined || playerOffer >= dynamicFloor || playerOffer >= nextPrice;
  if (action === 'deal_accepte' && !offerOk) action = 'aucune';
  if (
    action === 'deal_accepte' ||
    (!lowball && playerOffer !== undefined && offerOk && fallbackGauges.colere < 78)
  ) {
    forcedOutcome = 'deal';
    action = 'deal_accepte';
    nextPrice = playerOffer !== undefined ? playerOffer : nextPrice;
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
    const formattedNext = formatMoney(nextPrice, locale);
    dialogue = dialogue.replace(
      /(\d[\d\s\u202f\u00a0]{1,8})\s*(?:\$|dollars?)/gi,
      (full, numStr) => {
        const val = Number(String(numStr).replace(/[\s\u202f\u00a0]/g, ''));
        if (Number.isFinite(val) && val !== playerOffer && val !== nextPrice) {
          return locale === 'en' ? `$${formattedNext}` : `${formattedNext} $`;
        }
        return full;
      },
    );
  }

  const isFemale = gender === 'f';

  if (forcedOutcome === 'deal') {
    const dealAmount = playerOffer !== undefined ? playerOffer : nextPrice;
    const formattedOffer = formatMoney(dealAmount, locale);
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
): Promise<NPCResponse> {
  const dynamicFloor = computeDynamicFloor(initialPrice, floorPrice, currentGauges.peur);
  const jsonContract = JSON_CONTRACTS[locale] || JSON_CONTRACTS.fr;
  
  const statusNote = locale === 'en'
    ? `CURRENT GAUGES STATUS: fear=${currentGauges.peur}, anger=${currentGauges.colere}, suspicion=${currentGauges.mefiance}.
CURRENT ASKING PRICE: $${currentPrice} (ABSOLUTE RULE: NEVER ask for more than $${currentPrice}, price can only drop or stay at $${currentPrice}).
ACCEPTABLE FLOOR THRESHOLD: $${dynamicFloor} (if player offers at least $${dynamicFloor} without insults, accept the deal).${
      playerOffer !== undefined
        ? `\nPLAYER'S CASH OFFER THIS TURN: $${playerOffer} (take this exact cash amount: $${playerOffer}, do not invent another number).`
        : ''
    }
MANDATORY LANGUAGE: Respond 100% in gritty spoken English.`
    : locale === 'es'
      ? `ESTADO ACTUAL DE LAS BARRAS: miedo=${currentGauges.peur}, ira=${currentGauges.colere}, desconfianza=${currentGauges.mefiance}.
PRECIO ACTUAL PEDIDO: ${currentPrice} $ (REGLA ABSOLUTA: NUNCA pidas más de ${currentPrice} $, el precio solo puede bajar o mantenerse).
UMBRAL MÍNIMO ACEPTABLE: ${dynamicFloor} $ (si el jugador ofrece al menos ${dynamicFloor} $ sin insultarte, aceptas el trato).${
        playerOffer !== undefined
          ? `\nOFERTA EN EFECTIVO DEL JUGADOR ESTE TURNO: ${playerOffer} $ (toma este monto exacto: ${playerOffer} $).`
          : ''
      }
IDIOMA OBLIGATORIO: Responde 100% en español callejero.`
      : `ÉTAT ACTUEL DES JAUGES : peur=${currentGauges.peur}, colere=${currentGauges.colere}, mefiance=${currentGauges.mefiance}.
PRIX ACTUEL DEMANDÉ : ${currentPrice} $ (RÈGLE ABSOLUE : ne demande JAMAIS plus que ${currentPrice} $, le prix ne peut que baisser ou rester à ${currentPrice} $).
SEUIL ACCEPTABLE ACTUEL : ${dynamicFloor} $ (si le joueur propose au moins ${dynamicFloor} $ sans t'insulter, tu acceptes le deal).${
        playerOffer !== undefined
          ? `\nOFFRE CHIFFRÉE DU JOUEUR CE TOUR : ${playerOffer} $ (lis bien ce montant exact : ${playerOffer} $, ne le transforme pas en un autre nombre).`
          : ''
      }`;

  const fullSystem = `${systemPrompt}

${statusNote}
${jsonContract}`;

  let raw = '';

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
      throw new Error(`Erreur Ollama (${res.status}): ${errText.slice(0, 180)}`);
    }

    const data = await res.json();
    raw = data?.message?.content ?? '';
  } else {
    // Clés Gemini/Groq : exclusivement côté serveur, jamais dans le navigateur.
    const res = await fetch('/api/npc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: config.provider,
        systemPrompt: fullSystem,
        messages: history.map((turn) => ({ role: turn.role, content: turn.content })),
        ...(run ? { runId: run.runId, ticket: run.ticket } : {}),
      }),
    });

    const data = (await res.json().catch(() => ({}))) as { raw?: string; error?: string };
    if (!res.ok) {
      throw new Error(
        data?.error || `Erreur ${config.provider} (${res.status}). Vérifie .env.local côté serveur.`,
      );
    }
    raw = String(data?.raw ?? '');
  }

  if (!raw) throw new Error('Réponse du modèle vide.');
  return parseNPCJson(raw, currentGauges, currentPrice, initialPrice, floorPrice, playerOffer, locale, gender, fearCap);
}
