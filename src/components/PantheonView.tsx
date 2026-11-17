import { useState } from 'react';
import { COLLECTIONS_DATA, isCollectionComplete, type ItemRarity } from '../data/codex';
import {
  SYNDICATE_FACTIONS,
  getFactionRank,
  type FactionRepMap,
} from '../data/factions';
import { FactionCrest } from './FactionCrest';
import { type RivalFence, type MarketTrendMap } from '../data/rivals';
import {
  getCurrentSeason,
  getSeasonLevel,
  SEASON_REWARDS,
  SEASON_EPISODES,
  daysUntilEpisode,
  type SeasonEpisode,
} from '../data/seasons';
import {
  getDailyQuests,
  LOGIN_STREAK_REWARDS,
  CAREER_ACHIEVEMENTS,
} from '../data/quests';
import type { Locale } from '../data/seoContent';
import { ACHIEVEMENT_I18N, loginRewardLabel } from '../data/quests';
import { localizeCodexText } from '../data/castI18n';
import { localizeCodexItem } from '../data/codexI18n';
import { GAME_UI, formatMoney } from '../data/gameI18n';
import {
  localizeFaction,
  localizeCategory,
  localizeSeasonName,
  localizeSeasonReward,
  localizeSeasonEpisode,
  localizeFactionSpecialty,
  localizeRivalHeadline,
} from '../data/noirLocalization';

const FACTION_BANNER_MAP: Record<string, string> = {
  bratva: 'moretti',
  cartel: 'cartel',
  yakuza: 'cercle',
  milieu: 'voleurs',
  suisses: 'horlogers',
};

const RARITY_STYLES: Record<ItemRarity, string> = {
  commun: 'border-zinc-700 text-zinc-400',
  insolite: 'border-emerald-800/70 text-emerald-300',
  rare: 'border-sky-800/70 text-sky-300',
  epique: 'border-violet-800/70 text-violet-300',
  legendaire: 'border-amber-600/70 text-amber-300',
  mythique: 'border-red-600/80 text-red-300',
};

export type PantheonSubTab = 'syndicates' | 'codex' | 'season' | 'log';

export interface HistoryEntry {
  ts: number;
  day: number;
  type: 'deal' | 'sell' | 'trap' | 'raid' | 'gameover' | 'ascend';
  summary: string;
  cashDelta: number;
}

const COLLECTION_BANNERS: Record<string, string> = {
  'secrets-etat': '/assets/pantheon/codex-secrets.webp',
  'joyaux-imperiaux': '/assets/pantheon/codex-crown.webp',
  'arsenal-clandestin': '/assets/pantheon/codex-weapons.webp',
  'toiles-de-maitre': '/assets/pantheon/codex-art.webp',
  'cyber-pegre': '/assets/pantheon/codex-cyber.webp',
  'reliques-sacrees': '/assets/pantheon/codex-relics.webp',
};

export function PantheonView({
  locale = 'fr',
  daysSinceStart = 999,
  todayStr,
  codexDiscovered,
  factionRep,
  seasonXp,
  rivals,
  marketTrends,
  marketHeadline,
  playerNetWorth,
  historyLog = [],
  completedEpisodes = [],
  onStartEpisode,
  questProgress = { deals: 0, traps: 0, auctions: 0, swiss: 0, bargains: 0 },
  claimedQuestIds = [],
  loginStreak = 1,
  unlockedAchievements = [],
}: {
  locale?: Locale;
  daysSinceStart?: number;
  todayStr: string;
  codexDiscovered: string[];
  factionRep: FactionRepMap;
  seasonXp: number;
  rivals: RivalFence[];
  marketTrends: MarketTrendMap;
  marketHeadline: string;
  playerNetWorth: number;
  historyLog?: HistoryEntry[];
  completedEpisodes?: string[];
  onStartEpisode?: (ep: SeasonEpisode) => void;
  questProgress?: Record<'deals' | 'traps' | 'auctions' | 'swiss' | 'bargains', number>;
  claimedQuestIds?: string[];
  loginStreak?: number;
  unlockedAchievements?: string[];
}) {
  const [subTab, setSubTab] = useState<PantheonSubTab>('syndicates');
  const t = GAME_UI[locale];
  const season = getCurrentSeason(todayStr);
  const { level, xpInLevel, xpForNext } = getSeasonLevel(seasonXp);
  const totalCodexItems = COLLECTIONS_DATA.reduce((sum, c) => sum + c.items.length, 0);

  const subTabLabels: Record<PantheonSubTab, string> = {
    syndicates: locale === 'en' ? 'Syndicates & Rivals' : locale === 'es' ? 'Sindicatos y Rivales' : 'Syndicats & Rivaux',
    codex: locale === 'en' ? 'Codex Museum' : locale === 'es' ? 'Museo del Códex' : 'Musée du Codex',
    season: locale === 'en' ? 'Pass & Campaigns' : locale === 'es' ? 'Pase y Campañas' : 'Pass & Campagnes',
    log: locale === 'en' ? 'Operations & Log' : locale === 'es' ? 'Operaciones y Diario' : 'Opérations & Journal',
  };

  const ranking = [
    { id: 'player', name: t.playerLabel, district: t.playerCounter, netWorth: playerNetWorth, isPlayer: true },
    ...rivals.map((r) => ({ ...r, isPlayer: false })),
  ].sort((a, b) => b.netWorth - a.netWorth);

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-6 text-zinc-100 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Navigation secondaire en 4 sous-onglets nets */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
          {(['syndicates', 'codex', 'season', 'log'] as const).map((key) => {
            const active = subTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSubTab(key)}
                className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-all ${
                  active
                    ? 'border-b-2 border-amber-400 bg-amber-400/10 font-bold text-amber-300'
                    : 'border-b-2 border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {subTabLabels[key]}
              </button>
            );
          })}
        </div>

        {/* 1. SYNDICATS & RIVAUX (2 COLONNES) */}
        {subTab === 'syndicates' && (
          <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
            {/* Réputation des 5 Syndicats */}
            <section className="border border-white/10 bg-[#0d0e12] p-5 space-y-3">
              <div className="border-b border-white/10 pb-2">
                <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-300">
                  {t.factionsTitle}
                </h3>
                <p className="text-[11px] text-zinc-500">
                  {t.factionsDesc}
                </p>
              </div>
              <div className="space-y-2.5">
                {SYNDICATE_FACTIONS.map((fac) => {
                  const rep = factionRep[fac.id] ?? 0;
                  const rank = getFactionRank(rep);
                  const rankLabel =
                    rep <= -60
                      ? t.factionRanks.hit
                      : rep <= -20
                        ? t.factionRanks.hostile
                        : rep >= 60
                          ? t.factionRanks.ally
                          : rep >= 20
                            ? t.factionRanks.affiliated
                            : t.factionRanks.neutral;
                  const pct = Math.round(((rep + 100) / 200) * 100);
                  return (
                    <div key={fac.id} className="group relative flex items-start gap-3 overflow-hidden border border-white/10 bg-[#0c0d12] p-3.5 font-mono rounded-lg hover:border-amber-500/40 transition-all shadow-md">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded border border-white/10 bg-black/60 pointer-events-none sm:h-28 sm:w-28">
                        <img
                          src={`/assets/pantheon/${FACTION_BANNER_MAP[fac.id] || fac.id}.webp`}
                          alt={fac.name}
                          style={{ objectPosition: '50% 22%' }}
                          className="h-full w-full object-cover brightness-[0.9]"
                          onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                      <div className="relative z-10 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                              <FactionCrest factionId={fac.id} className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-semibold text-zinc-100 sm:truncate">{localizeFaction(fac.name, locale)}</span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase shrink-0 px-2 py-0.5 rounded border border-current/30 ${rank.colorCls} bg-black/60`}>
                            {rankLabel} ({rep > 0 ? `+${rep}` : rep})
                          </span>
                        </div>
                        <p className="mt-2 text-[10px] text-zinc-400">
                          <span className="text-zinc-500">{t.factionLeader} :</span> <span className="text-zinc-200 font-semibold">{fac.leader}</span> · {localizeFactionSpecialty(fac.id, fac.specialty, locale)}
                        </p>
                        <div className="mt-2 h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${rep >= 20 ? 'bg-amber-400' : rep <= -20 ? 'bg-red-500' : 'bg-zinc-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Classement Pègre & Cours du soir */}
            <section className="border border-white/10 bg-[#0d0e12] p-5 space-y-4">
              <div className="border-b border-white/10 pb-2">
                <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-300">
                  {t.rivalsTitle}
                </h3>
                <p className="text-[11px] text-amber-400/90 mt-0.5">{marketHeadline}</p>
              </div>

              <div className="flex flex-wrap gap-2 font-mono text-[10px]">
                {Object.entries(marketTrends).map(([cat, mult]) => (
                  <span
                    key={cat}
                    className={`border px-2 py-1 rounded ${
                      mult > 1
                        ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                        : mult < 1
                          ? 'border-red-500/40 bg-red-950/30 text-red-400'
                          : 'border-white/10 bg-black/30 text-zinc-400'
                    }`}
                  >
                    {localizeCategory(cat, locale)} ×{mult.toFixed(1)}
                  </span>
                ))}
              </div>

              <div className="space-y-2">
                {ranking.map((entry, idx) => (
                  <div
                    key={entry.id}
                    className={`flex items-start justify-between gap-3 border p-3 font-mono rounded transition-all ${
                      entry.isPlayer
                        ? 'border-amber-500/60 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                        : 'border-white/5 bg-black/40 hover:border-white/15'
                    }`}
                  >
                    <div className="min-w-0 flex items-start gap-2.5">
                      <span className="mt-0.5 shrink-0">
                        {idx === 0 ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/25 border border-amber-400/60 text-[10px] font-bold text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                            1
                          </span>
                        ) : idx === 1 ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-400/20 border border-zinc-300/50 text-[10px] font-bold text-zinc-200">
                            2
                          </span>
                        ) : idx === 2 ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-800/25 border border-amber-700/50 text-[10px] font-bold text-amber-500">
                            3
                          </span>
                        ) : (
                          <span className="flex h-5 w-5 items-center justify-center font-mono text-[10px] text-zinc-600">
                            #{idx + 1}
                          </span>
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={entry.isPlayer ? 'font-bold text-amber-300' : 'text-zinc-200'}>
                            {entry.name}
                          </span>
                          <span className="text-[10px] text-zinc-500">· {localizeFaction(entry.district, locale)}</span>
                        </div>
                        {'lastHeadline' in entry && (
                          <p className="mt-1 text-[10px] text-zinc-400">{localizeRivalHeadline(entry.lastHeadline, locale)}</p>
                        )}
                      </div>
                    </div>
                    <span className={`shrink-0 text-xs font-bold ${entry.isPlayer ? 'text-amber-300' : 'text-zinc-200'}`}>
                      {formatMoney(entry.netWorth, locale)} $
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* 2. MUSÉE DU CODEX */}
        {subTab === 'codex' && (
          <section className="border border-white/10 bg-[#0d0e12] p-5 space-y-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-200">
                  {t.codexTitle}
                </h3>
                <p className="text-[11px] text-zinc-500">
                  {t.codexDesc}
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-amber-300">
                {t.codexPieces(codexDiscovered.length, totalCodexItems)}
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {COLLECTIONS_DATA.map((col) => {
                const complete = isCollectionComplete(col.id, codexDiscovered);
                const foundCount = col.items.filter((i) => codexDiscovered.includes(i.id)).length;
                return (
                  <div
                    key={col.id}
                    className={`border p-4 space-y-3 rounded-lg overflow-hidden ${
                      complete ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10 bg-black/30'
                    }`}
                  >
                    <div className="relative h-28 w-full overflow-hidden rounded bg-black/60 border border-white/10 -mt-1 mb-2">
                      <img
                        src={COLLECTION_BANNERS[col.id] || '/assets/pantheon/codex-secrets.webp'}
                        alt=""
                        className="h-full w-full object-cover object-[50%_35%] brightness-[0.9] contrast-[1.05] hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-baseline justify-between">
                        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-100 drop-shadow">
                          {localizeCodexText(col.title, locale)}
                        </h4>
                        <span className="font-mono text-[10px] text-amber-400 font-bold bg-black/60 px-1.5 py-0.5 rounded border border-amber-500/30 backdrop-blur-sm">
                          {foundCount}/{col.items.length}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-500">{localizeCodexText(col.description, locale)}</p>

                    <div className="border-l-2 border-amber-500/60 pl-2 font-mono text-[10px]">
                      <span className={complete ? 'font-bold text-amber-300' : 'text-zinc-400'}>
                        {t.codexPerk} ({localizeCodexText(col.perkName, locale)}) :
                      </span>{' '}
                      <span className="text-zinc-400">{localizeCodexText(col.perkDescription, locale)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                      {col.items.map((it) => {
                        const found = codexDiscovered.includes(it.id);
                        const locItem = localizeCodexItem(it, locale);
                        return (
                          <div
                            key={it.id}
                            title={found ? `${locItem.provenance} — ${locItem.lore}` : t.codexNotYetFound}
                            className={`border px-2 py-1.5 ${
                              found
                                ? RARITY_STYLES[it.rarity]
                                : 'border-white/5 bg-black/50 text-zinc-600'
                            }`}
                          >
                            <div className="truncate font-medium">
                              {found ? locItem.name : t.codexUndiscovered}
                            </div>
                            <div className="text-[8px] uppercase opacity-75">{locItem.rarity}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. PASS CLANDESTIN & CAMPAGNES */}
        {subTab === 'season' && (
          <div className="space-y-6">
            {/* Bannière Concept Art Pass Clandestin */}
            <div className="relative h-28 sm:h-36 w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl">
              <img
                src="/assets/pantheon/season-pass.webp"
                alt=""
                className="h-full w-full object-cover filter brightness-[0.7] contrast-[1.15]"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e12] via-black/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 sm:left-6 flex items-baseline justify-between right-4 sm:right-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-amber-400 font-bold">
                    {t.seasonDays(season.seasonNumber, season.daysLeft)}
                  </p>
                  <h2 className="mt-0.5 font-[family-name:var(--font-display)] text-xl sm:text-2xl tracking-wider text-zinc-100">
                    {localizeSeasonName(season.name, locale)}
                  </h2>
                </div>
                <div className="text-right font-mono bg-black/60 px-3 py-1.5 rounded border border-amber-500/30 backdrop-blur-sm">
                  <span className="text-xs text-zinc-400">{t.seasonLevel} </span>
                  <span className="text-xl font-bold text-amber-300">{level}</span>
                  <span className="text-xs text-zinc-500"> / 30</span>
                </div>
              </div>
            </div>

            <section className="border border-white/10 bg-[#0d0e12] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-amber-500/80">
                    {t.seasonDays(season.seasonNumber, season.daysLeft)}
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-wider text-zinc-100">
                    {localizeSeasonName(season.name, locale)}
                  </h2>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-zinc-500">{t.seasonLevel} </span>
                  <span className="text-2xl font-bold text-amber-300">{level}</span>
                  <span className="text-xs text-zinc-500"> / 30</span>
                  <p className="text-[10px] text-zinc-400">
                    {xpInLevel} / {xpForNext} XP
                  </p>
                </div>
              </div>

              <div className="mt-3 h-1.5 w-full bg-zinc-900">
                <div
                  className="h-full bg-amber-400 transition-all"
                  style={{ width: `${Math.min(100, Math.round((xpInLevel / xpForNext) * 100))}%` }}
                />
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {SEASON_REWARDS.map((rw) => {
                  const unlocked = level >= rw.level;
                  const locRw = localizeSeasonReward(rw, locale);
                  return (
                    <div
                      key={rw.level}
                      className={`border p-2.5 font-mono text-[10px] ${
                        unlocked
                          ? 'border-amber-500/50 bg-amber-500/10 text-amber-200'
                          : 'border-white/5 bg-black/40 text-zinc-500'
                      }`}
                    >
                      <div className="flex justify-between font-bold">
                        <span>{t.tierLabel(rw.level)}</span>
                        <span>{unlocked ? t.tierActive : t.tierLocked}</span>
                      </div>
                      <p className="mt-1 text-zinc-200">{locRw.title}</p>
                      <p className="mt-0.5 text-[9px] text-zinc-400">{locRw.perkDesc}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Campagnes Épisodiques Scénarisées */}
            <section className="border border-white/10 bg-[#0d0e12] p-5 space-y-3">
              <div className="flex items-baseline justify-between border-b border-white/10 pb-2">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-200">
                  {t.campaignTitle(completedEpisodes.length, SEASON_EPISODES.length)}
                </h3>
                <span className="font-mono text-[10px] text-zinc-500">
                  {t.campaignSub}
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {SEASON_EPISODES.map((ep, epIndex) => {
                  const done = completedEpisodes.includes(ep.id);
                  const wait = daysUntilEpisode(epIndex, daysSinceStart);
                  const locked = wait > 0 && !done;
                  const locEp = localizeSeasonEpisode(ep, locale);
                  return (
                    <div
                      key={ep.id}
                      className={`border p-3.5 font-mono flex flex-col justify-between gap-2.5 ${
                        done ? 'border-emerald-500/40 bg-emerald-500/5' : locked ? 'border-white/5 bg-black/20 opacity-60' : 'border-white/10 bg-black/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-amber-400">{t.seasonTag(ep.seasonNumber, ep.castName)}</span>
                          <span className={done ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                            {done ? t.completedBadge : `+${ep.rewardXp} XP · +${formatMoney(ep.rewardCash, locale)} $`}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-zinc-100">{locEp.title}</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{locEp.synopsis}</p>
                        <p className="text-[10px] text-amber-200/80">{locEp.stakes}</p>
                      </div>
                      {locked && (
                        <p className="text-[10px] text-zinc-500">
                          {locale === 'en' ? `Unlocks in ${wait} day${wait > 1 ? 's' : ''}` : locale === 'es' ? `Se desbloquea en ${wait} día${wait > 1 ? 's' : ''}` : `Disponible dans ${wait} jour${wait > 1 ? 's' : ''}`}
                        </p>
                      )}
                      {onStartEpisode && !done && !locked && (
                        <button
                          type="button"
                          onClick={() => onStartEpisode(ep)}
                          className="self-start border border-amber-400/60 bg-amber-400/10 px-3 py-1 text-[10px] font-bold uppercase text-amber-300 hover:bg-amber-400 hover:text-zinc-950 transition-colors"
                        >
                          {t.launchEpisodeBtn}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* 4. OPÉRATIONS & JOURNAL */}
        {subTab === 'log' && (
          <div className="space-y-6">
            {/* Missions du jour + Série 7 jours + Hauts-faits */}
            <section className="border border-white/10 bg-[#0d0e12] p-5 space-y-5">
              <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-300 border-b border-white/10 pb-2">
                {locale === 'en' ? 'Daily Directives & Login Streak' : locale === 'es' ? 'Directivas Diarias y Racha' : 'Directives Quotidiennes & Série'}
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                {getDailyQuests(todayStr).map((q) => {
                  const cur = Math.min(q.target, questProgress[q.metric] ?? 0);
                  const done = claimedQuestIds.includes(q.id) || cur >= q.target;
                  const questDef = t.dailyQuests[q.metric];
                  const title = questDef?.title ?? q.title;
                  const desc = questDef?.desc ?? q.desc;
                  return (
                    <div
                      key={q.id}
                      className={`border p-3 font-mono text-[10px] space-y-1.5 ${
                        done ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 bg-black/40'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="font-bold text-zinc-100">{title}</span>
                        <span className={done ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                          {cur}/{q.target}
                        </span>
                      </div>
                      <p className="text-zinc-400">{desc}</p>
                      <p className="text-[9px] text-amber-300/80">
                        +{formatMoney(q.rewardCash, locale)} $ · +{q.rewardXp} XP {done ? `· ${t.questValidated}` : ''}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-2 sm:grid-cols-7 font-mono text-[9px]">
                {LOGIN_STREAK_REWARDS.map((r) => {
                  const active = loginStreak >= r.day;
                  return (
                    <div
                      key={r.day}
                      className={`border p-2 ${
                        active
                          ? 'border-amber-500/50 bg-amber-500/10 text-amber-200'
                          : 'border-white/5 bg-black/40 text-zinc-500'
                      }`}
                    >
                      <div className="font-bold">{t.loginStreakDay(r.day)}</div>
                      <div className="mt-0.5 text-[8px]">{loginRewardLabel(r.day, locale) ?? r.label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6 font-mono text-[9px]">
                {CAREER_ACHIEVEMENTS.map((ach) => {
                  const ok = unlockedAchievements.includes(ach.id);
                  const achDef = ACHIEVEMENT_I18N[locale]?.[ach.id];
                  const title = achDef?.title ?? ach.title;
                  const desc = achDef?.desc ?? ach.desc;
                  return (
                    <div
                      key={ach.id}
                      className={`border p-2 ${
                        ok ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200' : 'border-white/5 bg-black/30 text-zinc-500'
                      }`}
                    >
                      <div className="font-bold">{title}</div>
                      <div className="mt-0.5 text-[8px] text-zinc-400">{desc}</div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* HISTORIQUE DES OPÉRATIONS */}
            <section className="border border-white/10 bg-[#0d0e12] p-5 space-y-3">
              <div className="flex items-baseline justify-between border-b border-white/10 pb-2">
                <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-200">
                  {t.historyTitle}
                </h3>
                <span className="font-mono text-[10px] text-zinc-500">
                  {t.historyEntries(historyLog.length)}
                </span>
              </div>
              {historyLog.length === 0 ? (
                <p className="font-mono text-[11px] italic text-zinc-500">
                  {t.historyEmpty}
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto divide-y divide-white/5 font-mono text-[11px]">
                  {historyLog.slice(0, 30).map((entry, idx) => (
                    <div key={`${entry.ts}-${idx}`} className="flex items-center justify-between gap-3 py-2">
                      <div className="min-w-0">
                        <span className="text-zinc-500 mr-2">{t.dayShort}{entry.day}</span>
                        <span className="uppercase text-[9px] text-amber-400/80 mr-2">{entry.type}</span>
                        <span className="text-zinc-300">{entry.summary}</span>
                      </div>
                      {entry.cashDelta !== 0 && (
                        <span
                          className={`shrink-0 font-bold ${
                            entry.cashDelta > 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {entry.cashDelta > 0 ? `+${formatMoney(entry.cashDelta, locale)}` : formatMoney(entry.cashDelta, locale)} $
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
