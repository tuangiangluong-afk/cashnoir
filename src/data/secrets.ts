import type { Locale } from './seoContent';

/**
 * PIÈCES À SECRET : certains objets achetés cachent un double fond avec une énigme (chiffre de César, mot à l'envers,
 * suite logique…). La résoudre rapporte de l'argent, de l'XP de saison ou fait baisser le Heat.
 * 3 essais par pièce ; au-delà, le message est détruit. Revendre la pièce avant, c'est perdre le secret.
 */

type Kind = 'caesar' | 'reverse' | 'a1z26' | 'seq' | 'roman' | 'acrostic' | 'math';
export type SecretReward = { kind: 'cash' | 'xp' | 'heat'; amount: number };

interface Riddle {
  id: string;
  kind: Kind;
  words?: Record<Locale, string>;
  shift?: number;
  n?: number;
  seq?: number[];
  expr?: string;
  lines?: Record<Locale, string[]>;
  reward: SecretReward;
}

const RIDDLES: Riddle[] = [
  { id: 's-caesar-vault', kind: 'caesar', shift: 3, words: { fr: 'SUISSE', en: 'VAULT', es: 'BOVEDA' }, reward: { kind: 'cash', amount: 400 } },
  { id: 's-caesar-harbor', kind: 'caesar', shift: 5, words: { fr: 'CASINO', en: 'HARBOR', es: 'ALMACEN' }, reward: { kind: 'cash', amount: 550 } },
  { id: 's-reverse-locker', kind: 'reverse', words: { fr: 'GARAGE', en: 'LOCKER', es: 'BUZON' }, reward: { kind: 'cash', amount: 300 } },
  { id: 's-a1z26-safe', kind: 'a1z26', words: { fr: 'COFFRE', en: 'SAFE', es: 'CAJA' }, reward: { kind: 'xp', amount: 250 } },
  { id: 's-seq-30', kind: 'seq', seq: [2, 6, 12, 20], n: 30, reward: { kind: 'cash', amount: 450 } },
  { id: 's-roman-47', kind: 'roman', n: 47, reward: { kind: 'heat', amount: 12 } },
  { id: 's-math-32', kind: 'math', expr: '4 × 7 + 9 − 5', n: 32, reward: { kind: 'cash', amount: 350 } },
  {
    id: 's-acrostic',
    kind: 'acrostic',
    words: { fr: 'PORT', en: 'DOCK', es: 'MUELLE' },
    lines: {
      fr: ['Parfois la nuit tombe vite.', 'Ouvre l’œil sur les quais.', 'Rien ne vaut un bon silence.', 'Tiens-toi prêt.'],
      en: ['Don’t trust the night.', 'Open your eyes.', 'Cold rain hides everything.', 'Keep quiet.'],
      es: ['Mira bien el puerto.', 'Una luz parpadea.', 'Es la señal.', 'Lleva el dinero.', 'Lejos de aquí.', 'Entrégalo en silencio.'],
    },
    reward: { kind: 'xp', amount: 350 },
  },
];

const ROMAN: [number, string][] = [[50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
const toRoman = (n: number) => {
  let out = '';
  for (const [v, s] of ROMAN) while (n >= v) { out += s; n -= v; }
  return out;
};

const shiftWord = (w: string, k: number) =>
  [...w].map((c) => String.fromCharCode(((c.charCodeAt(0) - 65 + k) % 26) + 65)).join('');

export const normalizeAnswer = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

export function rollSecretId(): string | undefined {
  // ~30 % des pièces (jamais les pièges) ont un double fond.
  return Math.random() < 0.3 ? RIDDLES[Math.floor(Math.random() * RIDDLES.length)].id : undefined;
}

const find = (id: string) => RIDDLES.find((r) => r.id === id);

export function secretContent(id: string, L: Locale): { note: string; hint: string } | null {
  const r = find(id);
  if (!r) return null;
  const w = r.words?.[L] ?? '';
  const T = {
    fr: {
      caesar: (c: string) => `Billet plié : « ${c} ». Chaque lettre a été avancée de ${r.shift} rangs dans l’alphabet. Quel est le mot ?`,
      caesarH: `Recule chaque lettre de ${r.shift} rangs.`,
      reverse: (c: string) => `Écrit à l’envers au fond de la boîte : « ${c} ». Quel est le mot ?`,
      reverseH: 'Lis de droite à gauche.',
      a1z26: (c: string) => `Chiffres gravés sous la pièce : ${c} (A=1, B=2, C=3…). Quel est le mot ?`,
      a1z26H: 'Compte dans l’alphabet : 1=A, 2=B…',
      seq: `Reçu de consigne : le numéro du casier prolonge la suite ${r.seq?.join(' · ')} · ? Quel numéro ?`,
      seqH: 'Regarde l’écart entre deux nombres qui se suivent.',
      roman: `Plaque de casier en chiffres romains : ${toRoman(r.n ?? 0)}. Quel numéro ?`,
      romanH: 'X = 10, L = 50, V = 5, I = 1. Un petit chiffre avant un grand se soustrait.',
      math: `Mot de passe du casier : ${r.expr}. Quel numéro ?`,
      mathH: 'Les multiplications passent avant les additions.',
      acro: (l: string[]) => `Mot glissé dans la doublure :\n${l.join('\n')}\nQue cachent les premières lettres ?`,
      acroH: 'Lis la première lettre de chaque ligne.',
    },
    en: {
      caesar: (c: string) => `Folded note: “${c}”. Every letter was pushed ${r.shift} places forward in the alphabet. What is the word?`,
      caesarH: `Move each letter back ${r.shift} places.`,
      reverse: (c: string) => `Written backwards inside the box: “${c}”. What is the word?`,
      reverseH: 'Read it right to left.',
      a1z26: (c: string) => `Numbers engraved under the piece: ${c} (A=1, B=2, C=3…). What is the word?`,
      a1z26H: 'Count through the alphabet: 1=A, 2=B…',
      seq: `Left-luggage receipt: the locker number continues the sequence ${r.seq?.join(' · ')} · ? Which number?`,
      seqH: 'Look at the gap between consecutive numbers.',
      roman: `Locker plate in Roman numerals: ${toRoman(r.n ?? 0)}. Which number?`,
      romanH: 'X = 10, L = 50, V = 5, I = 1. A small numeral before a big one is subtracted.',
      math: `Locker passcode: ${r.expr}. Which number?`,
      mathH: 'Multiplication comes before addition.',
      acro: (l: string[]) => `Word slipped into the lining:\n${l.join('\n')}\nWhat do the first letters spell?`,
      acroH: 'Read the first letter of each line.',
    },
    es: {
      caesar: (c: string) => `Nota doblada: «${c}». Cada letra se adelantó ${r.shift} posiciones en el alfabeto. ¿Cuál es la palabra?`,
      caesarH: `Retrocede cada letra ${r.shift} posiciones.`,
      reverse: (c: string) => `Escrito del revés en el fondo de la caja: «${c}». ¿Cuál es la palabra?`,
      reverseH: 'Léelo de derecha a izquierda.',
      a1z26: (c: string) => `Números grabados bajo la pieza: ${c} (A=1, B=2, C=3…). ¿Cuál es la palabra?`,
      a1z26H: 'Cuenta en el alfabeto: 1=A, 2=B…',
      seq: `Recibo de consigna: el número de la taquilla continúa la serie ${r.seq?.join(' · ')} · ? ¿Qué número?`,
      seqH: 'Mira la diferencia entre números consecutivos.',
      roman: `Placa de taquilla en números romanos: ${toRoman(r.n ?? 0)}. ¿Qué número?`,
      romanH: 'X = 10, L = 50, V = 5, I = 1. Un número pequeño antes de uno grande se resta.',
      math: `Clave de la taquilla: ${r.expr}. ¿Qué número?`,
      mathH: 'La multiplicación va antes que la suma.',
      acro: (l: string[]) => `Palabra escondida en el forro:\n${l.join('\n')}\n¿Qué esconden las primeras letras?`,
      acroH: 'Lee la primera letra de cada línea.',
    },
  }[L];
  switch (r.kind) {
    case 'caesar': return { note: T.caesar(shiftWord(w, r.shift ?? 0)), hint: T.caesarH };
    case 'reverse': return { note: T.reverse([...w].reverse().join('')), hint: T.reverseH };
    case 'a1z26': return { note: T.a1z26([...w].map((c) => c.charCodeAt(0) - 64).join('-')), hint: T.a1z26H };
    case 'seq': return { note: T.seq, hint: T.seqH };
    case 'roman': return { note: T.roman, hint: T.romanH };
    case 'math': return { note: T.math, hint: T.mathH };
    case 'acrostic': return { note: T.acro(r.lines?.[L] ?? []), hint: T.acroH };
  }
}

export function checkSecret(id: string, answer: string, L: Locale): boolean {
  const r = find(id);
  if (!r) return false;
  const given = normalizeAnswer(answer);
  const expected = r.words ? normalizeAnswer(r.words[L]) : String(r.n);
  return given === expected;
}

export const secretReward = (id: string): SecretReward | undefined => find(id)?.reward;

export const SECRET_UI: Record<Locale, {
  badge: string; examine: string; close: string; hint: string; placeholder: string; submit: string;
  wrong: (left: number) => string; burned: string; solved: (reward: string) => string; lostOnSale: string;
  rewardCash: (n: string) => string; rewardXp: (n: number) => string; rewardHeat: (n: number) => string;
  howTo: string;
}> = {
  fr: {
    badge: '✦ Double fond', examine: 'Examiner', close: 'Fermer', hint: 'Indice', placeholder: 'Ta réponse…', submit: 'Valider',
    wrong: (n) => `Mauvaise réponse. ${n} essai${n > 1 ? 's' : ''} restant${n > 1 ? 's' : ''}.`,
    burned: 'Le message s’est effacé : secret perdu.',
    solved: (r) => `Double fond ouvert ! ${r}`,
    lostOnSale: 'Un secret dort dans cette pièce : le revendre le fait disparaître.',
    rewardCash: (n) => `+${n} $ cachés dans la doublure.`, rewardXp: (n) => `+${n} XP de saison (un contact te doit un service).`, rewardHeat: (n) => `Heat −${n} (une planque sûre pour tes pièces).`,
    howTo: 'Certaines pièces cachent un double fond. Ouvre-les ici : une énigme, trois essais, une récompense.',
  },
  en: {
    badge: '✦ False bottom', examine: 'Examine', close: 'Close', hint: 'Hint', placeholder: 'Your answer…', submit: 'Submit',
    wrong: (n) => `Wrong answer. ${n} attempt${n > 1 ? 's' : ''} left.`,
    burned: 'The message smudged away: secret lost.',
    solved: (r) => `False bottom opened! ${r}`,
    lostOnSale: 'A secret sleeps in this piece: selling it makes it vanish.',
    rewardCash: (n) => `+$${n} hidden in the lining.`, rewardXp: (n) => `+${n} season XP (a contact owes you a favor).`, rewardHeat: (n) => `Heat −${n} (a safe stash for your pieces).`,
    howTo: 'Some pieces hide a false bottom. Open them here: one riddle, three tries, one reward.',
  },
  es: {
    badge: '✦ Doble fondo', examine: 'Examinar', close: 'Cerrar', hint: 'Pista', placeholder: 'Tu respuesta…', submit: 'Validar',
    wrong: (n) => `Respuesta incorrecta. Te quedan ${n} intento${n > 1 ? 's' : ''}.`,
    burned: 'El mensaje se borró: secreto perdido.',
    solved: (r) => `¡Doble fondo abierto! ${r}`,
    lostOnSale: 'Esta pieza guarda un secreto: venderla lo hace desaparecer.',
    rewardCash: (n) => `+${n} $ escondidos en el forro.`, rewardXp: (n) => `+${n} XP de temporada (un contacto te debe un favor).`, rewardHeat: (n) => `Heat −${n} (un escondite seguro para tus piezas).`,
    howTo: 'Algunas piezas esconden un doble fondo. Ábrelas aquí: un acertijo, tres intentos, una recompensa.',
  },
};
