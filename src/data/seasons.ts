/**
 * PASS CLANDESTIN & CAMPAGNES ÉPISODIQUES (Saisons rotatives de 30 jours)
 * Chaque saison possède une vraie histoire en 4 épisodes jouables + 30 paliers d'XP.
 */

import { MORE_EPISODES } from './seasonsMore';

export interface SeasonReward {
  level: number;
  title: string;
  perkDesc: string;
}

export interface SeasonEpisode {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  castId: string;
  castName: string;
  faction: string;
  synopsis: string;
  stakes: string;
  rewardXp: number;
  rewardCash: number;
  unlockCodexId?: string;
}

export interface SeasonInfo {
  seasonNumber: number;
  name: string;
  daysLeft: number;
}

const SEASON_NAMES = [
  'Nuits de Sang sur les Docks',
  'La Chute de l’Oligarque',
  'Code Zéro-Day',
  'L’Hiver de la Bratva',
  'Enchères de Minuit à Genève',
  'Opération Mains Sales',
];

export const SEASON_REWARDS: SeasonReward[] = [
  { level: 3, title: 'Apprenti Receleur', perkDesc: '+5 % valeur sur les ventes rapides' },
  { level: 6, title: 'Œil de Pigalle', perkDesc: '+150 $ prime sur chaque piège démasqué' },
  { level: 10, title: 'Courtier Fantôme', perkDesc: '−3 Heat supplémentaire chaque nuit calme' },
  { level: 15, title: 'Banquier de l’Ombre', perkDesc: 'Frais suisses réduits (94 % net au lieu de 90 %)' },
  { level: 20, title: 'Maître du Comptoir', perkDesc: '+10 % marge sur toutes les enchères' },
  { level: 30, title: 'Légende du Syndicat', perkDesc: '+500 $ de dividende chaque matin' },
];

const BASE_EPISODES: SeasonEpisode[] = [
  // SAISON 1 — Nuits de Sang sur les Docks
  {
    id: 's1-e1',
    seasonNumber: 1,
    episodeNumber: 1,
    title: 'Épisode 1 · Le Conteneur 47',
    castId: 'c002',
    castName: 'Viktor Morozov',
    faction: 'Docks du Nord',
    synopsis:
      '03h12. Un cargo libérien vient d’accoster sans feux. Viktor dépose des caisses d’armement déclassées encore humides d’eau salée.',
    stakes: 'Achète la pièce sans déclencher la patrouille portuaire (+400 XP, +10 Bratva).',
    rewardXp: 400,
    rewardCash: 600,
    unlockCodexId: 'fusil-sniper-demantele',
  },
  {
    id: 's1-e2',
    seasonNumber: 1,
    episodeNumber: 2,
    title: 'Épisode 2 · Le Bloc Ouvert',
    castId: 'c001',
    castName: 'Nadia Khoury',
    faction: 'Clinique Privée Saint-Luc',
    synopsis:
      'Un lieutenant de la Bratva a pris une balle dans le port. Nadia sort du bloc clandestin avec les preuves et les dossiers de l’opération.',
    stakes: 'Fais-la craquer sur Saint-Luc avant que la Brigade Financière ne boucle le quartier.',
    rewardXp: 550,
    rewardCash: 900,
    unlockCodexId: 'cle-usb-procureur',
  },
  {
    id: 's1-e3',
    seasonNumber: 1,
    episodeNumber: 3,
    title: 'Épisode 3 · Le Greffier de Bercy',
    castId: 'c005',
    castName: 'Sébastien Lemaire',
    faction: 'Brigade Financière',
    synopsis:
      'Le fisc a récupéré les numéros de série du Conteneur 47. Lemaire vient te vendre le dossier… ou te tendre une souricière.',
    stakes: 'Lis ses tics sous UV : s’il est réglo achète le dossier, s’il est câblé vire-le.',
    rewardXp: 700,
    rewardCash: 1200,
    unlockCodexId: 'protocole-gladio',
  },
  {
    id: 's1-e4',
    seasonNumber: 1,
    episodeNumber: 4,
    title: 'Final · L’Ultimatum du Port',
    castId: 'c013',
    castName: 'Boris Kovalenko',
    faction: 'Docks du Nord',
    synopsis:
      'Ivan Voronov réclame toutes les preuves du Conteneur 47 avant l’aube. C’est ton passage en Cour des Grands.',
    stakes: 'Négocie le rachat final pour débloquer la prime du Syndicat et la relique de saison.',
    rewardXp: 1000,
    rewardCash: 2200,
    unlockCodexId: 'prototype-drone-suicide',
  },
  // SAISON 2 — La Chute de l'Oligarque
  {
    id: 's2-e1',
    seasonNumber: 2,
    episodeNumber: 1,
    title: 'Épisode 1 · Les Sceaux de Drouot',
    castId: 'c003',
    castName: 'Clarisse De Montfort',
    faction: 'Mairie & Promoteurs',
    synopsis:
      'Une saisie judiciaire vise un hôtel particulier de l’avenue Foch. Clarisse sort les bijoux impériaux avant la mise sous scellés.',
    stakes: 'Négocie en dessous de 45 % pour poser les bases de ta collection impériale.',
    rewardXp: 500,
    rewardCash: 800,
    unlockCodexId: 'diademe-romanov',
  },
  {
    id: 's2-e2',
    seasonNumber: 2,
    episodeNumber: 2,
    title: 'Épisode 2 · La Veuve de Marseille',
    castId: 'c010',
    castName: 'Éléonore Vasseur',
    faction: 'Docks du Nord',
    synopsis:
      'Son mari armateur a laissé 4 millions de dettes et un coffre secret contenant l’Œuf Fabergé.',
    stakes: 'Évite les créanciers et sécurise la pièce sans dépasser 65 % de Heat.',
    rewardXp: 750,
    rewardCash: 1400,
    unlockCodexId: 'oeuf-faberge',
  },
  // SAISON 3 — Code Zéro-Day
  {
    id: 's3-e1',
    seasonNumber: 3,
    episodeNumber: 1,
    title: 'Épisode 1 · Le Bracelet Coupé',
    castId: 'c006',
    castName: 'Zoe Vandenberg',
    faction: 'Brigade Financière',
    synopsis:
      'Zoe a 30 minutes d’autonomie sur son leurre GPS pour vendre une clé hardware contenant 450 BTC de 2011.',
    stakes: 'Brise sa paranoïa sans la traiter d’amatrice avant le bip de la DGSI.',
    rewardXp: 900,
    rewardCash: 1800,
    unlockCodexId: 'hardware-wallet-2011',
  },
];

/** Campagne complète : 24 épisodes (6 saisons de 4), classés dans l'ordre de l'histoire. */
export const SEASON_EPISODES: SeasonEpisode[] = [...BASE_EPISODES, ...MORE_EPISODES].sort(
  (a, b) => a.seasonNumber - b.seasonNumber || a.episodeNumber - b.episodeNumber,
);

/** Épisodes de départ puis un de plus chaque semaine : la campagne s'étale sur ~6 mois. */
export const STARTING_EPISODES = 4;
export function episodesUnlocked(daysSinceStart: number, total = SEASON_EPISODES.length): number {
  return Math.min(total, STARTING_EPISODES + Math.floor(Math.max(0, daysSinceStart) / 7));
}
/** Jours à attendre avant l'épisode d'index `index` (0 = déjà débloqué). */
export function daysUntilEpisode(index: number, daysSinceStart: number): number {
  return Math.max(0, (index - STARTING_EPISODES + 1) * 7 - Math.max(0, daysSinceStart));
}

/** Saison de campagne en cours : celle du dernier épisode débloqué. */
export function campaignSeasonOf(daysSinceStart: number): number {
  const n = episodesUnlocked(daysSinceStart);
  return SEASON_EPISODES[Math.max(0, n - 1)]?.seasonNumber ?? 1;
}

/** Héros d'une saison : le personnage de son épisode final (le sommet de l'histoire). */
export function seasonHero(seasonNumber: number): SeasonEpisode | undefined {
  return SEASON_EPISODES.filter((e) => e.seasonNumber === seasonNumber).sort((a, b) => b.episodeNumber - a.episodeNumber)[0];
}

export function getCurrentSeason(dateStr: string): SeasonInfo {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-11
  const seasonNumber = (year - 2026) * 12 + month + 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - d.getDate() + 1);
  const name = SEASON_NAMES[Math.abs(seasonNumber) % SEASON_NAMES.length];
  return { seasonNumber: Math.max(1, seasonNumber), name, daysLeft };
}

export function getSeasonLevel(xp: number): {
  level: number;
  xpInLevel: number;
  xpForNext: number;
} {
  const xpPerLevel = 400;
  const level = Math.min(30, 1 + Math.floor(xp / xpPerLevel));
  const xpInLevel = level >= 30 ? xpPerLevel : xp % xpPerLevel;
  return { level, xpInLevel, xpForNext: xpPerLevel };
}
