/**
 * GAMIFICATION LONG TERME :
 * - 3 Missions Quotidiennes rotatives par jour
 * - Calendrier de série de connexion 7 jours (Daily Streak)
 * - Hauts-Faits permanents (Achievements)
 */

export interface DailyQuest {
  id: string;
  title: string;
  desc: string;
  target: number;
  metric: 'deals' | 'traps' | 'auctions' | 'swiss' | 'bargains';
  rewardCash: number;
  rewardXp: number;
}

export interface CareerAchievement {
  id: string;
  title: string;
  desc: string;
  rewardXp: number;
}

const QUEST_POOL: Omit<DailyQuest, 'id'>[] = [
  {
    title: 'Négociateur Impitoyable',
    desc: 'Conclure 2 rachats au comptoir aujourd’hui',
    target: 2,
    metric: 'deals',
    rewardCash: 350,
    rewardXp: 200,
  },
  {
    title: 'Chasseur de Taupes',
    desc: 'Démasquer 1 agent infiltré avant de payer',
    target: 1,
    metric: 'traps',
    rewardCash: 450,
    rewardXp: 250,
  },
  {
    title: 'Salle des Ventes',
    desc: 'Vendre 2 pièces aux enchères de nuit',
    target: 2,
    metric: 'auctions',
    rewardCash: 400,
    rewardXp: 220,
  },
  {
    title: 'Blanchiment Express',
    desc: 'Transférer 1 000 $ vers la Suisse',
    target: 1000,
    metric: 'swiss',
    rewardCash: 300,
    rewardXp: 200,
  },
  {
    title: 'Casser les Prix',
    desc: 'Acheter une pièce à −45 % ou moins du prix demandé',
    target: 1,
    metric: 'bargains',
    rewardCash: 500,
    rewardXp: 300,
  },
];

export function getDailyQuests(dateStr: string): DailyQuest[] {
  const seed = Array.from(dateStr).reduce((acc, ch) => (acc * 33 + ch.charCodeAt(0)) >>> 0, 17);
  const picked: DailyQuest[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = (seed + i * 2) % QUEST_POOL.length;
    const tpl = QUEST_POOL[idx];
    picked.push({ ...tpl, id: `${dateStr}-q${idx}` });
  }
  return picked;
}

export const LOGIN_STREAK_REWARDS = [
  { day: 1, label: '+200 $ Cash', cash: 200, xp: 100 },
  { day: 2, label: '+250 XP Saison', cash: 0, xp: 250 },
  { day: 3, label: '+450 $ Cash', cash: 450, xp: 150 },
  { day: 4, label: '+400 XP Saison', cash: 0, xp: 400 },
  { day: 5, label: '+700 $ Cash', cash: 700, xp: 200 },
  { day: 6, label: '+600 XP Saison', cash: 200, xp: 600 },
  { day: 7, label: 'Coffre Hebdo (+1 500 $ · +800 XP)', cash: 1500, xp: 800 },
];

export const CAREER_ACHIEVEMENTS: CareerAchievement[] = [
  { id: 'first-blood', title: 'Premier Rideau', desc: 'Conclure ton tout premier rachat', rewardXp: 150 },
  { id: 'mole-hunter', title: 'Œil de la Brigade', desc: 'Démasquer ton premier agent infiltré', rewardXp: 300 },
  { id: 'swiss-10k', title: 'Banquier Fantôme', desc: 'Accumuler 10 000 $ sur le Compte Suisse', rewardXp: 500 },
  { id: 'survive-10', title: 'Tenancier des Docks', desc: 'Survivre jusqu’au Jour 10', rewardXp: 600 },
  { id: 'codex-10', title: 'Archiviste Noir', desc: 'Découvrir 10 pièces du Codex', rewardXp: 500 },
  { id: 'ascended', title: 'Légende en Ascension', desc: 'Déclencher au moins 1 Ascension (NG+)', rewardXp: 1000 },
];

// Traductions des hauts-faits (clés = ids de CAREER_ACHIEVEMENTS) et libellés du calendrier de connexion.
export const ACHIEVEMENT_I18N: Record<'fr' | 'en' | 'es', Record<string, { title: string; desc: string }>> = {
  fr: {},
  en: {
    'first-blood': { title: 'First Curtain', desc: 'Close your very first counter deal' },
    'mole-hunter': { title: 'Eye of the Squad', desc: 'Expose your first undercover agent' },
    'swiss-10k': { title: 'Phantom Banker', desc: 'Stack $10,000 in the Swiss account' },
    'survive-10': { title: 'Dock Keeper', desc: 'Survive until Day 10' },
    'codex-10': { title: 'Black Archivist', desc: 'Discover 10 Codex pieces' },
    ascended: { title: 'Ascension Legend', desc: 'Trigger at least 1 Ascension (NG+)' },
  },
  es: {
    'first-blood': { title: 'Primer Telón', desc: 'Cierra tu primera compra en el mostrador' },
    'mole-hunter': { title: 'Ojo de la Brigada', desc: 'Desenmascara a tu primer agente infiltrado' },
    'swiss-10k': { title: 'Banquero Fantasma', desc: 'Acumula 10 000 $ en la cuenta suiza' },
    'survive-10': { title: 'Guardián del Muelle', desc: 'Sobrevive hasta el Día 10' },
    'codex-10': { title: 'Archivista Negro', desc: 'Descubre 10 piezas del Códice' },
    ascended: { title: 'Leyenda de la Ascensión', desc: 'Activa al menos 1 Ascensión (NG+)' },
  },
};

const LOGIN_LABELS: Record<'en' | 'es', string[]> = {
  en: ['+$200 Cash', '+250 Season XP', '+$450 Cash', '+400 Season XP', '+$700 Cash', '+600 Season XP', 'Weekly Chest (+$1,500 · +800 XP)'],
  es: ['+200 $ Efectivo', '+250 XP de Temporada', '+450 $ Efectivo', '+400 XP de Temporada', '+700 $ Efectivo', '+600 XP de Temporada', 'Cofre Semanal (+1 500 $ · +800 XP)'],
};

export function loginRewardLabel(day: number, locale: string): string | undefined {
  return locale === 'en' || locale === 'es' ? LOGIN_LABELS[locale][day - 1] : undefined;
}
