import { COLLECTIONS_DATA, isCollectionComplete, type ItemRarity } from '../data/codex';
import {
  SYNDICATE_FACTIONS,
  getFactionRank,
  type FactionRepMap,
} from '../data/factions';
import { type RivalFence, type MarketTrendMap } from '../data/rivals';
import {
  getCurrentSeason,
  getSeasonLevel,
  SEASON_REWARDS,
  SEASON_EPISODES,
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

const RARITY_STYLES: Record<ItemRarity, string> = {
  commun: 'border-zinc-700 text-zinc-400',
  insolite: 'border-emerald-800/70 text-emerald-300',
  rare: 'border-sky-800/70 text-sky-300',
  epique: 'border-violet-800/70 text-violet-300',
  legendaire: 'border-amber-600/70 text-amber-300',
  mythique: 'border-red-600/80 text-red-300',
};

export interface HistoryEntry {
  ts: number;
  day: number;
  type: 'deal' | 'sell' | 'trap' | 'raid' | 'gameover' | 'ascend';
  summary: string;
  cashDelta: number;
}

export function PantheonView({
  locale = 'fr',
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
  const t = GAME_UI[locale];
  const season = getCurrentSeason(todayStr);
  const { level, xpInLevel, xpForNext } = getSeasonLevel(seasonXp);
  const totalCodexItems = COLLECTIONS_DATA.reduce((sum, c) => sum + c.items.length, 0);

  const ranking = [
    { id: 'player', name: t.playerLabel, district: t.playerCounter, netWorth: playerNetWorth, isPlayer: true },
    ...rivals.map((r) => ({ ...r, isPlayer: false })),
  ].sort((a, b) => b.netWorth - a.netWorth);

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-6 text-zinc-100 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* 1. PASS CLANDESTIN (SAISON 30J) */}
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

          {/* Missions du jour + Série 7 jours + Hauts-faits */}
          <div className="mt-6 border-t border-white/10 pt-5 space-y-5">
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
          </div>

          {/* Campagnes Épisodiques Scénarisées */}
          <div className="mt-6 border-t border-white/10 pt-5 space-y-3">
            <div className="flex items-baseline justify-between">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-200">
                {t.campaignTitle(completedEpisodes.length, SEASON_EPISODES.length)}
              </h3>
              <span className="font-mono text-[10px] text-zinc-500">
                {t.campaignSub}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {SEASON_EPISODES.map((ep) => {
                const done = completedEpisodes.includes(ep.id);
                const locEp = localizeSeasonEpisode(ep, locale);
                return (
                  <div
                    key={ep.id}
                    className={`border p-3.5 font-mono flex flex-col justify-between gap-2.5 ${
                      done ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 bg-black/40'
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
                    {onStartEpisode && !done && (
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
          </div>
        </section>

        {/* 2. SYNDICATS & RIVAUX (2 COLONNES) */}
        <div className="grid gap-6 lg:grid-cols-2">
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
                  <div key={fac.id} className="border border-white/5 bg-black/40 p-3 font-mono">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-100">{localizeFaction(fac.name, locale)}</span>
                      <span className={`text-[10px] uppercase ${rank.colorCls}`}>
                        {rankLabel} ({rep > 0 ? `+${rep}` : rep})
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-zinc-500">
                      {t.factionLeader} : {fac.leader} · {localizeFactionSpecialty(fac.id, fac.specialty, locale)}
                    </p>
                    <div className="mt-2 h-1 w-full bg-zinc-900">
                      <div
                        className={`h-full ${rep >= 20 ? 'bg-amber-400' : rep <= -20 ? 'bg-red-500' : 'bg-zinc-500'}`}
                        style={{ width: `${pct}%` }}
                      />
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
                  className={`border px-2 py-1 ${
                    mult > 1
                      ? 'border-emerald-500/40 text-emerald-300'
                      : mult < 1
                        ? 'border-red-500/40 text-red-400'
                        : 'border-white/10 text-zinc-400'
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
                  className={`flex items-start justify-between gap-3 border p-3 font-mono ${
                    entry.isPlayer
                      ? 'border-amber-500/50 bg-amber-500/10'
                      : 'border-white/5 bg-black/40'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-zinc-500">#{idx + 1}</span>
                      <span className={entry.isPlayer ? 'font-bold text-amber-300' : 'text-zinc-200'}>
                        {entry.name}
                      </span>
                      <span className="text-[10px] text-zinc-500">· {localizeFaction(entry.district, locale)}</span>
                    </div>
                    {'lastHeadline' in entry && (
                      <p className="mt-1 text-[10px] text-zinc-400">{localizeRivalHeadline(entry.lastHeadline, locale)}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs font-bold text-zinc-200">
                    {formatMoney(entry.netWorth, locale)} $
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 3. CODEX DU RECELEUR (MUSÉE PERMANENT) */}
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
                  className={`border p-4 space-y-3 ${
                    complete ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10 bg-black/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-100">
                        {localizeCodexText(col.title, locale)}
                      </h4>
                      <p className="text-[10px] text-zinc-500">{localizeCodexText(col.description, locale)}</p>
                    </div>
                    <span className="font-mono text-[10px] text-amber-400">
                      {foundCount}/{col.items.length}
                    </span>
                  </div>

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

        {/* 4. HISTORIQUE DES OPÉRATIONS (SAUVEGARDÉ PAR PROFIL) */}
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
    </main>
  );
}
