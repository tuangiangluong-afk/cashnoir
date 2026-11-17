// Sagas clients : chaque personnage rencontré garde une relation avec toi (confiance) et peut revenir pour
// une mini-série de 5 épisodes (rencontre, retour, pression, service, dénouement). Le dénouement dépend de la confiance :
// allié fidèle (il revient avec ses trouvailles à prix d'ami), ennemi (il t'en veut) ou départ neutre.
// Logique pure : aucune dépendance au rendu, testée par le self-test.
export type SagaEnd = 'ally' | 'enemy' | 'gone';
export type EncounterResult = 'deal' | 'walk' | 'pass' | 'gun';

export interface SagaState {
  castId: string;
  /** Nombre de rencontres terminées (1 = première rencontre faite). */
  met: number;
  /** -100 (ennemi juré) à +100 (ami fidèle). */
  trust: number;
  lastDay: number;
  end?: SagaEnd;
}

export const SAGA_EPISODES = 5;
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

/** Variation de confiance selon l'issue : un deal honnête rassure, être plumé ou laissé sur le trottoir refroidit. */
export function trustDelta(result: EncounterResult, margin: number): number {
  if (result === 'gun') return -25;
  if (result === 'walk' || result === 'pass') return -6;
  if (margin >= 0.4) return -12; // plumé
  if (margin < 0.05) return 15; // payé au prix de la rue : généreux
  return 10;
}

/** Enregistre la fin d'une rencontre et résout le dénouement au 5e épisode. */
export function applyEncounter(prev: SagaState | undefined, castId: string, day: number, result: EncounterResult, margin: number): SagaState {
  const base: SagaState = prev ?? { castId, met: 0, trust: 0, lastDay: day };
  const met = base.met + 1;
  const trust = clamp(base.trust + trustDelta(result, margin), -100, 100);
  let end = base.end;
  // Un client rangé (allié) garde sa fidélité : ses visites de cadeau ne comptent pas comme épisodes.
  if (!end && met >= SAGA_EPISODES) end = trust >= 20 ? 'ally' : trust <= -20 ? 'enemy' : 'gone';
  return { castId, met, trust, lastDay: day, end };
}

export function applyFavor(s: SagaState, helped: boolean): SagaState {
  return { ...s, trust: clamp(s.trust + (helped ? 25 : -15), -100, 100) };
}

/** Épisode suivant (2 à 5) d'une série en cours. */
export const nextEpisode = (s: SagaState): number => Math.min(SAGA_EPISODES, s.met + 1);

export function isDue(s: SagaState, day: number): boolean {
  if (s.end === 'gone' || s.end === 'enemy') return false;
  if (s.end === 'ally') return day - s.lastDay >= 5;
  return s.met >= 1 && s.met < SAGA_EPISODES && day - s.lastDay >= (s.met <= 1 ? 2 : 3);
}

/** Choisit une saga à relancer : les séries déjà avancées sont privilégiées (une histoire qu'on suit, pas un tirage plat). */
export function pickDue(sagas: Record<string, SagaState>, day: number, rand: () => number): SagaState | null {
  const due = Object.values(sagas).filter((s) => isDue(s, day));
  if (!due.length) return null;
  const weights = due.map((s) => 1 + s.met * 2 + (s.end === 'ally' ? 2 : 0));
  let r = rand() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < due.length; i++) {
    r -= weights[i];
    if (r <= 0) return due[i];
  }
  return due[due.length - 1];
}

/** À chaque nouvelle partie, le temps repart de zéro mais les relations restent : on remet l'horloge des sagas à 0. */
export function rebaseSagas(sagas: Record<string, SagaState>, toDay = 0): Record<string, SagaState> {
  return Object.fromEntries(Object.entries(sagas).map(([k, v]) => [k, { ...v, lastDay: toDay }]));
}

/** Libellé de la relation (pour le journal) : -100..100 -> clé de tonalité. */
export function trustTone(trust: number): 'devoted' | 'friendly' | 'neutral' | 'wary' | 'hostile' {
  return trust >= 50 ? 'devoted' : trust >= 15 ? 'friendly' : trust > -15 ? 'neutral' : trust > -50 ? 'wary' : 'hostile';
}
