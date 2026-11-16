import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Radio,
  KeyRound,
  Send,
  ChevronRight,
  RotateCcw,
  ShieldAlert,
  Flame,
  Clock,
  Flashlight,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Loader2,
  User,
} from 'lucide-react';
import {
  generateProceduralCase,
  generateDailyContract,
  generateBossCase,
  type ProceduralCase,
} from './data/generator';
import { DISTRICTS, CITY_ASSETS, type District, type CityAsset } from './data/empire';
import {
  STORY_ARCS,
  buildArcStep1Case,
  buildArcStep2Case,
  type ArcNote,
} from './data/arcs';
import {
  localizeItemName,
  localizeFaction,
  localizeArchetype,
  localizeChallenge,
  localizeArcTitle,
  localizeArcNote,
} from './data/noirLocalization';
import { evaluatePsychoTriggers, findProfileForArchetype } from './data/psychology';
import { getNightEvent } from './data/events';
import { drawRandomJokers, type SyndicateJoker } from './data/jokers';
import { type VengeanceEntry, checkVengeance, pruneVengeance } from './data/revenge';
import { getWeeklyChallenge, type WeeklyChallenge } from './data/challenges';
import { getAscensionModifier, canAscend } from './data/ascension';
import {
  getDiscoveredCodexItems,
  recordCodexDiscovery,
  getActiveCodexPerks,
} from './data/codex';
import {
  INITIAL_FACTION_REP,
  resolveFactionId,
  getFactionRank,
  applyFactionDealDelta,
  type FactionRepMap,
} from './data/factions';
import {
  INITIAL_RIVALS,
  rollMarketTrends,
  advanceRivals,
  type RivalFence,
} from './data/rivals';
import { getSeasonLevel, SEASON_EPISODES, type SeasonEpisode } from './data/seasons';
import {
  getDailyQuests,
  LOGIN_STREAK_REWARDS,
  CAREER_ACHIEVEMENTS,
} from './data/quests';
import { CAST_ROSTER } from './data/cast';
import { PantheonView, type HistoryEntry } from './components/PantheonView';
import { MarketingSite } from './components/MarketingSite';
import { GAME_UI, getLocalizedRank, formatMoney } from './data/gameI18n';
import type { Locale } from './data/seoContent';
import { ShopBackdrop, FilmOverlay, ClientBust, Typewriter, resolveCastPortrait } from './components/Scene';
import { rollSecretId, secretContent, checkSecret, secretReward, SECRET_UI } from './data/secrets';
import { localizeCastText } from './data/castI18n';
import { localizeItemText } from './data/itemsI18n';
import { CounterItemProp } from './components/CounterProps';
import { ambience } from './services/ambience';
import { sound } from './services/sound';
import type { Gauges } from './services/types';
import {
  queryNPC,
  computeDynamicFloor,
  type ChatTurn,
  type LLMConfig,
  type LLMProvider,
} from './services/llm';

interface BoughtItem {
  id: string;
  name: string;
  faction: string;
  paid: number;
  streetValue: number;
  hotLevel: 'BRÛLANT' | 'TIÈDE' | 'PIÈGE';
  cleaned: boolean;
  category?: string;
  modifier?: 'traceur' | 'collection' | 'contrefacon';
  codexId?: string;
  rarity?: string;
  arcId?: string;
  arcItemKey?: string;
  secretId?: string;
  secretTries?: number;
  secretState?: 'open' | 'solved' | 'burned';
}

interface RegistryEntry {
  id: string;
  castId?: string;
  name: string;
  gender: 'm' | 'f';
  job: string;
  day: number;
  result: 'deal' | 'trap' | 'gun' | 'walk';
  paid: number;
  street: number;
}

interface Upgrades {
  uvLamp: boolean;
  armoredDoor: boolean;
  gpsJammer: boolean;
}

// Messages (joueur + vendeur) avant que la faille et la ligne rouge du vendeur se révèlent.
const FLAW_REVEAL_TURNS = 5;

interface LbEntry {
  pseudo: string;
  margin: number;
  discount?: number;
  turns?: number;
  badge?: 'negotiator' | 'blitz' | null;
}
type LbBoard = 'margin' | 'discount' | 'speed';

const LB_COPY: Record<Locale, { boards: Record<LbBoard, string>; badges: Record<'negotiator' | 'blitz', string>; turns: (n: number) => string }> = {
  fr: { boards: { margin: 'Marge', discount: 'Négociateur', speed: 'Éclair' }, badges: { negotiator: 'Négociateur', blitz: 'Éclair' }, turns: (n) => `${n} tour${n > 1 ? 's' : ''}` },
  en: { boards: { margin: 'Margin', discount: 'Haggler', speed: 'Blitz' }, badges: { negotiator: 'Haggler', blitz: 'Blitz' }, turns: (n) => `${n} turn${n > 1 ? 's' : ''}` },
  es: { boards: { margin: 'Margen', discount: 'Negociador', speed: 'Relámpago' }, badges: { negotiator: 'Negociador', blitz: 'Relámpago' }, turns: (n) => `${n} turno${n > 1 ? 's' : ''}` },
};

type TabMode = 'counter' | 'night' | 'shop' | 'pantheon' | 'daily';

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getSecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}

function formatCountdown(secs: number): string {
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function App() {
  const todayStr = getTodayStr();

  const [routePath, setRoutePath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/play';
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'ok' || params.get('pass') === 'claim') return '/play';
    return window.location.pathname || '/';
  });

  const navigateTo = (nextPath: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
      window.scrollTo(0, 0);
    }
    setRoutePath(nextPath);
  };

  useEffect(() => {
    const onPop = () => setRoutePath(window.location.pathname || '/');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const isGameRoute = routePath === '/play' || routePath.startsWith('/play/');
  const [gameLocale, setGameLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('fence_locale');
    return saved === 'fr' || saved === 'es' || saved === 'en' ? saved : 'en';
  });
  const t = GAME_UI[gameLocale];

  // Persistent empire state
  const [day, setDay] = useState<number>(() => Number(localStorage.getItem('fence_day')) || 1);
  const [cash, setCash] = useState<number>(() => Number(localStorage.getItem('fence_cash')) || 2500);
  const [totalProfit, setTotalProfit] = useState<number>(
    () => Number(localStorage.getItem('fence_profit')) || 0,
  );
  const [cityHeat, setCityHeat] = useState<number>(
    () => Number(localStorage.getItem('fence_heat')) || 15,
  );
  const [inventory, setInventory] = useState<BoughtItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fence_inv') || '[]');
    } catch {
      return [];
    }
  });
  const [upgrades, setUpgrades] = useState<Upgrades>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem('fence_upgrades') || 'null') || {
          uvLamp: false,
          armoredDoor: false,
          gpsJammer: false,
        }
      );
    } catch {
      return { uvLamp: false, armoredDoor: false, gpsJammer: false };
    }
  });
  const [lastMemory, setLastMemory] = useState<string>(
    () => localStorage.getItem('fence_memory') || '',
  );
  const [dailyDoneDate, setDailyDoneDate] = useState<string>(
    () => localStorage.getItem('fence_daily_done') || '',
  );
  const [streak, setStreak] = useState<number>(
    () => Number(localStorage.getItem('fence_streak')) || 0,
  );
  const [lastContractDate, setLastContractDate] = useState<string>(
    () => localStorage.getItem('fence_streak_date') || '',
  );
  const [auctionsToday, setAuctionsToday] = useState(0);
  const [rerollsLeft, setRerollsLeft] = useState(() => Math.max(0, 2 - (getAscensionModifier(Number(localStorage.getItem('fence_ascension')) || 0)?.rerollPenalty ?? 0)));
  const [raidNote, setRaidNote] = useState<string | null>(null);
  const [jokerIds, setJokerIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fence_jokers') || '[]');
    } catch {
      return [];
    }
  });
  const [jokerDraft, setJokerDraft] = useState<SyndicateJoker[] | null>(null);
  const [muted, setMuted] = useState(false);
  const [codexDiscovered, setCodexDiscovered] = useState<string[]>(() => getDiscoveredCodexItems());
  const [factionRep, setFactionRep] = useState<FactionRepMap>(() => {
    try {
      return { ...INITIAL_FACTION_REP, ...JSON.parse(localStorage.getItem('fence_faction_rep') || '{}') };
    } catch {
      return INITIAL_FACTION_REP;
    }
  });
  const [seasonXp, setSeasonXp] = useState<number>(
    () => Number(localStorage.getItem('fence_season_xp')) || 0,
  );
  const [rivals, setRivals] = useState<RivalFence[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('fence_rivals') || 'null');
      return Array.isArray(saved) && saved.length > 0 ? saved : INITIAL_RIVALS;
    } catch {
      return INITIAL_RIVALS;
    }
  });
  const [lastPoachedItem, setLastPoachedItem] = useState<string | undefined>(undefined);
  const [listening, setListening] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LbEntry[]>([]);
  const [lbBoard, setLbBoard] = useState<LbBoard>('margin');
  const [highlight, setHighlight] = useState<{ pseudo: string; discount: number; line: string } | null>(null);
  const [pseudo, setPseudo] = useState('Receleur');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [hasPass, setHasPass] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [passBusy, setPassBusy] = useState(false);

  // Méta-Empire Persistant (survit même au Game Over)
  const [swissBank, setSwissBank] = useState<number>(
    () => Number(localStorage.getItem('fence_swiss')) || 0,
  );
  const [cityAssets, setCityAssets] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fence_assets') || '[]');
    } catch {
      return [];
    }
  });
  const [districtId, setDistrictId] = useState<District['id']>(
    () => (localStorage.getItem('fence_district') as District['id']) || 'docks',
  );
  const [arcNotes, setArcNotes] = useState<ArcNote[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fence_arcs') || '[]');
    } catch {
      return [];
    }
  });
  const currentDistrict = DISTRICTS.find((d) => d.id === districtId) || DISTRICTS[0];

  // Revenge, Ascension & Weekly Challenge
  const [vengeance, setVengeance] = useState<VengeanceEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem('fence_vengeance') || '[]'); } catch { return []; }
  });
  const [ascensionLevel, setAscensionLevel] = useState<number>(
    () => Number(localStorage.getItem('fence_ascension')) || 0,
  );
  const [maxDaySurvived, setMaxDaySurvived] = useState<number>(
    () => Number(localStorage.getItem('fence_maxday')) || 0,
  );
  const [historyLog, setHistoryLog] = useState<HistoryEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fence_history_log') || '[]');
    } catch {
      return [];
    }
  });
  const [completedEpisodes, setCompletedEpisodes] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fence_episodes') || '[]');
    } catch {
      return [];
    }
  });
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(null);
  const [questProgress, setQuestProgress] = useState<
    Record<'deals' | 'traps' | 'auctions' | 'swiss' | 'bargains', number>
  >(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('fence_quests_prog') || 'null');
      if (saved?.date === getTodayStr() && saved.metrics) return saved.metrics;
    } catch {}
    return { deals: 0, traps: 0, auctions: 0, swiss: 0, bargains: 0 };
  });
  const [claimedQuestIds, setClaimedQuestIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fence_quests_claimed') || '[]');
    } catch {
      return [];
    }
  });
  const [debt, setDebt] = useState<number>(() => Number(localStorage.getItem('fence_debt')) || 0);
  const [openSecretId, setOpenSecretId] = useState<string | null>(null);
  const [secretInput, setSecretInput] = useState('');
  const [secretMsg, setSecretMsg] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [registry, setRegistry] = useState<RegistryEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fence_registry') || '[]');
    } catch {
      return [];
    }
  });
  const [showRegistry, setShowRegistry] = useState(false);
  const loggedCaseRef = useRef<string>('');
  const [loginStreak, setLoginStreak] = useState<number>(
    () => Number(localStorage.getItem('fence_login_streak')) || 1,
  );
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fence_achievements') || '[]');
    } catch {
      return [];
    }
  });

  const bumpQuest = (
    metric: 'deals' | 'traps' | 'auctions' | 'swiss' | 'bargains',
    delta = 1,
  ) => {
    setQuestProgress((prev) => {
      const next = { ...prev, [metric]: (prev[metric] || 0) + delta };
      localStorage.setItem('fence_quests_prog', JSON.stringify({ date: todayStr, metrics: next }));
      for (const q of getDailyQuests(todayStr)) {
        if (q.metric === metric && next[metric] >= q.target && !claimedQuestIds.includes(q.id)) {
          setClaimedQuestIds((c) => (c.includes(q.id) ? c : [...c, q.id]));
          setCash((c) => c + q.rewardCash);
          setSeasonXp((xp) => xp + q.rewardXp);
        }
      }
      return next;
    });
  };

  const unlockAchievement = (id: string) => {
    if (unlockedAchievements.includes(id)) return;
    const ach = CAREER_ACHIEVEMENTS.find((a) => a.id === id);
    if (!ach) return;
    setUnlockedAchievements((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setSeasonXp((xp) => xp + ach.rewardXp);
  };
  const [authUser, setAuthUser] = useState<{
    id: string;
    name: string;
    email: string;
    picture: string;
  } | null>(null);
  const [oauthConfigured, setOauthConfigured] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
  const cloudReadyRef = useRef(false);

  const appendHistory = (
    type: HistoryEntry['type'],
    summary: string,
    cashDelta = 0,
  ) => {
    setHistoryLog((prev) => [{ ts: Date.now(), day, type, summary, cashDelta }, ...prev].slice(0, 100));
  };
  const weeklyChallenge: WeeklyChallenge = getWeeklyChallenge(getTodayStr(), gameLocale);
  const ascMod = getAscensionModifier(ascensionLevel);
  const activeCodexPerks = getActiveCodexPerks(codexDiscovered);
  const seasonState = getSeasonLevel(seasonXp);
  const { trends: marketTrends, headline: marketHeadline } = rollMarketTrends(day, gameLocale);

  useEffect(() => {
    localStorage.setItem('fence_day', String(day));
    localStorage.setItem('fence_cash', String(cash));
    localStorage.setItem('fence_profit', String(totalProfit));
    localStorage.setItem('fence_heat', String(cityHeat));
    localStorage.setItem('fence_inv', JSON.stringify(inventory));
    localStorage.setItem('fence_upgrades', JSON.stringify(upgrades));
    localStorage.setItem('fence_memory', lastMemory);
    localStorage.setItem('fence_daily_done', dailyDoneDate);
    localStorage.setItem('fence_jokers', JSON.stringify(jokerIds));
    localStorage.setItem('fence_streak', String(streak));
    localStorage.setItem('fence_streak_date', lastContractDate);
    localStorage.setItem('fence_swiss', String(swissBank));
    localStorage.setItem('fence_assets', JSON.stringify(cityAssets));
    localStorage.setItem('fence_district', districtId);
    localStorage.setItem('fence_arcs', JSON.stringify(arcNotes));
    localStorage.setItem('fence_vengeance', JSON.stringify(vengeance));
    localStorage.setItem('fence_ascension', String(ascensionLevel));
    localStorage.setItem('fence_maxday', String(maxDaySurvived));
    localStorage.setItem('fence_faction_rep', JSON.stringify(factionRep));
    localStorage.setItem('fence_season_xp', String(seasonXp));
    localStorage.setItem('fence_rivals', JSON.stringify(rivals));
    localStorage.setItem('fence_history_log', JSON.stringify(historyLog));
    localStorage.setItem('fence_episodes', JSON.stringify(completedEpisodes));
    localStorage.setItem('fence_quests_claimed', JSON.stringify(claimedQuestIds));
    localStorage.setItem('fence_login_streak', String(loginStreak));
    localStorage.setItem('fence_achievements', JSON.stringify(unlockedAchievements));
    localStorage.setItem('fence_debt', String(debt));
    localStorage.setItem('fence_registry', JSON.stringify(registry.slice(-60)));
  }, [
    day,
    cash,
    totalProfit,
    cityHeat,
    inventory,
    upgrades,
    lastMemory,
    dailyDoneDate,
    jokerIds,
    streak,
    lastContractDate,
    swissBank,
    cityAssets,
    districtId,
    arcNotes,
    vengeance,
    ascensionLevel,
    maxDaySurvived,
    factionRep,
    seasonXp,
    rivals,
    historyLog,
  ]);

  // Daily 7-day login streak check on mount
  useEffect(() => {
    const lastLogin = localStorage.getItem('fence_last_login') || '';
    if (lastLogin === todayStr) return;
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    const nextStreak = lastLogin === yesterday ? Math.min(7, (Number(localStorage.getItem('fence_login_streak')) || 0) + 1) : 1;
    localStorage.setItem('fence_last_login', todayStr);
    setLoginStreak(nextStreak);
    const rw = LOGIN_STREAK_REWARDS[(nextStreak - 1) % LOGIN_STREAK_REWARDS.length];
    if (rw.cash > 0) setCash((c) => c + rw.cash);
    if (rw.xp > 0) setSeasonXp((xp) => xp + rw.xp);
  }, [todayStr]);

  // OAuth session & Cloud Profile hydration
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        setOauthConfigured(Boolean(data.oauthConfigured));
        if (!data.authenticated || !data.user) return;
        setAuthUser(data.user);

        const profRes = await fetch('/api/profile', { credentials: 'include' });
        if (!profRes.ok || cancelled) return;
        const profData = await profRes.json();
        const p = profData?.profile;
        if (p) {
          if (typeof p.day === 'number') setDay(p.day);
          if (typeof p.cash === 'number') setCash(p.cash);
          if (typeof p.totalProfit === 'number') setTotalProfit(p.totalProfit);
          if (typeof p.cityHeat === 'number') setCityHeat(p.cityHeat);
          if (typeof p.swissBank === 'number') setSwissBank(p.swissBank);
          if (typeof p.streak === 'number') setStreak(p.streak);
          if (typeof p.lastContractDate === 'string') setLastContractDate(p.lastContractDate);
          if (typeof p.dailyDoneDate === 'string') setDailyDoneDate(p.dailyDoneDate);
          if (typeof p.districtId === 'string') setDistrictId(p.districtId as District['id']);
          if (typeof p.ascensionLevel === 'number') setAscensionLevel(p.ascensionLevel);
          if (typeof p.maxDaySurvived === 'number') setMaxDaySurvived(p.maxDaySurvived);
          if (typeof p.seasonXp === 'number') setSeasonXp((prev) => Math.max(prev, p.seasonXp));
          if (typeof p.lastMemory === 'string') setLastMemory(p.lastMemory);
          if (Array.isArray(p.inventory)) setInventory(p.inventory);
          if (p.upgrades) setUpgrades(p.upgrades);
          if (Array.isArray(p.jokerIds)) setJokerIds(p.jokerIds);
          if (Array.isArray(p.cityAssets)) setCityAssets(p.cityAssets);
          if (Array.isArray(p.arcNotes)) setArcNotes(p.arcNotes);
          if (Array.isArray(p.vengeance)) setVengeance(p.vengeance);
          if (p.factionRep) setFactionRep((prev) => ({ ...prev, ...p.factionRep }));
          if (Array.isArray(p.codexDiscovered)) {
            setCodexDiscovered((prev) => {
              const merged = Array.from(new Set([...prev, ...p.codexDiscovered]));
              localStorage.setItem('fence_codex_discovered', JSON.stringify(merged));
              return merged;
            });
          }
          if (Array.isArray(p.historyLog)) {
            setHistoryLog((prev) => {
              const seen = new Set(p.historyLog.map((h: HistoryEntry) => `${h.ts}-${h.summary}`));
              const merged = [...p.historyLog, ...prev.filter((h) => !seen.has(`${h.ts}-${h.summary}`))].slice(0, 100);
              return merged;
            });
          }
        }
        cloudReadyRef.current = true;
        setCloudStatus('saved');
      } catch {
        // Offline / backend absent : localStorage reste actif
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced auto-save to Cloud Profile when authenticated
  useEffect(() => {
    if (!authUser || !cloudReadyRef.current) return;
    const timer = setTimeout(async () => {
      setCloudStatus('syncing');
      try {
        const res = await fetch('/api/profile', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            day,
            cash,
            totalProfit,
            cityHeat,
            swissBank,
            streak,
            lastContractDate,
            dailyDoneDate,
            districtId,
            ascensionLevel,
            maxDaySurvived,
            seasonXp,
            lastMemory,
            inventory,
            upgrades,
            jokerIds,
            cityAssets,
            arcNotes,
            vengeance,
            codexDiscovered,
            factionRep,
            historyLog,
          }),
        });
        setCloudStatus(res.ok ? 'saved' : 'error');
      } catch {
        setCloudStatus('error');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [
    authUser,
    day,
    cash,
    totalProfit,
    cityHeat,
    swissBank,
    streak,
    lastContractDate,
    dailyDoneDate,
    districtId,
    ascensionLevel,
    maxDaySurvived,
    seasonXp,
    lastMemory,
    inventory,
    upgrades,
    jokerIds,
    cityAssets,
    arcNotes,
    vengeance,
    codexDiscovered,
    factionRep,
    historyLog,
  ]);

  // UI & FOMO countdown
  const [tab, setTab] = useState<TabMode>('counter');
  const [countdown, setCountdown] = useState<number>(getSecondsUntilMidnight);
  const [clientsServedToday, setClientsServedToday] = useState(0);
  const dailyRunRef = useRef<{ runId: string; ticket: string } | null>(null);
  const [gameOverReason, setGameOverReason] = useState<string | null>(null);
  const [showBrief, setShowBrief] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getSecondsUntilMidnight()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Active case state
  const [currentCase, setCurrentCase] = useState<ProceduralCase>(() =>
    generateProceduralCase(
      day,
      cityHeat,
      lastMemory || undefined,
      currentDistrict.multiplier,
      gameLocale,
    ),
  );
  const [gauges, setGauges] = useState<Gauges>(currentCase.initialGauges);
  const [askedPrice, setAskedPrice] = useState<number>(currentCase.initialPrice);
  const [priceTrail, setPriceTrail] = useState<number[]>([currentCase.initialPrice]);
  const [tell, setTell] = useState<string>(currentCase.openingTell);
  const [outcome, setOutcome] = useState<
    'active' | 'deal_accepte' | 'quitte_la_boutique' | 'sort_son_arme'
  >('active');

  // Player Profile & Commuter Preferences
  const [playerHandle, setPlayerHandle] = useState<string>(() => {
    return localStorage.getItem('fence_player_handle') || 'MARC';
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fence_haptics') !== '0';
  });

  const triggerHaptic = (ms: number | number[] = 15) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.(ms);
      } catch {}
    }
  };

  const switchLanguage = (newLoc: Locale) => {
    if (newLoc === gameLocale) return;
    triggerHaptic(20);
    setGameLocale(newLoc);
    localStorage.setItem('fence_locale', newLoc);
    if (tab === 'daily' || currentCase.isDailyContract) {
      void openDailyContract(newLoc);
    } else if (currentCase.isBoss) {
      startNewCase(generateBossCase(day, cityHeat, currentDistrict.multiplier, newLoc));
    } else {
      startNewCase(
        generateProceduralCase(
          day,
          cityHeat,
          lastMemory || undefined,
          currentDistrict.multiplier,
          newLoc,
        ),
      );
    }
  };

  // Tools state
  const [inspected, setInspected] = useState(false);
  const [phantomDone, setPhantomDone] = useState(false);
  const [uvScanned, setUvScanned] = useState(false);
  const [grilled, setGrilled] = useState({ loupe: false, uv: false, radio: false });
  const [radioOpen, setRadioOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState<number>(
    Math.max(150, Math.round((currentCase.initialPrice * 0.8) / 50) * 50),
  );

  // Chat state
  const [history, setHistory] = useState<ChatTurn[]>([
    { role: 'npc', content: currentCase.openingLine },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings / Debug
  const [debugMode, setDebugMode] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [provider, setProvider] = useState<LLMProvider>(
    () => (sessionStorage.getItem('fence_provider') as LLMProvider) || 'gemini',
  );

  // Sans clé hébergée côté serveur (Gemini/Groq), le jeu retombe sur Ollama au lieu de planter.
  useEffect(() => {
    if (sessionStorage.getItem('fence_provider')) return;
    fetch('/api/health')
      .then((r) => r.json())
      .then((h) => {
        const p = h?.providers;
        setProvider(p?.gemini ? 'gemini' : p?.groq ? 'groq' : p?.deepseek ? 'deepseek' : 'ollama');
      })
      .catch(() => setProvider('ollama'));
  }, []);

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const [copiedShare, setCopiedShare] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const usedPsychoRef = useRef<{ nameHit: boolean; weakHit: boolean }>({
    nameHit: false,
    weakHit: false,
  });
  const [soldCategories, setSoldCategories] = useState<Record<string, number>>({});
  const [historyDays, setHistoryDays] = useState<{ date: string; margin: number; entries: number }[]>([]);
  const [showArchive7d, setShowArchive7d] = useState(false);
  const [showDailyScores, setShowDailyScores] = useState(false);
  const [gaugeDeltas, setGaugeDeltas] = useState<{
    peur?: number;
    colere?: number;
    mefiance?: number;
    key: number;
  }>({ key: 0 });

  // Taxe du Syndicat : socle + 8 % de ta caisse. Impossible de thésauriser :
  // plus tu accumules, plus le soir coûte cher (le revenu ne suit plus).
  const nightEvent = getNightEvent(day);
  const rentShare = Math.round(cash * 0.08);
  const dailyRent = Math.round(
    (500 + (day - 1) * 450 + rentShare) *
      (nightEvent?.rentMultiplier ?? 1) *
      (jokerIds.includes('blanchisseur-express') ? 1.1 : 1) *
      (ascMod?.rentMult ?? 1),
  ) + debt; // le prêt du Syndicat se rembourse avec le loyer du soir
  const maxClientsPerDay = 3;
  const baseRerolls = Math.max(0, 2 - (ascMod?.rerollPenalty ?? 0));
  const heatRaid = cityHeat >= 80;

  // Voix robotique TTS désactivée volontairement (sera remplacée par de vraies voix plus tard).
  const speakNPC = (_text: string, _currentGauges: Gauges) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleMic = () => {
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (!SpeechRec) {
      setError('Reconnaissance vocale non supportée sur ce navigateur (utilise Chrome/Safari).');
      return;
    }

    if (listening) return;
    const rec = new SpeechRec() as {
      lang: string;
      interimResults: boolean;
      onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      onerror: () => void;
      onend: () => void;
      start: () => void;
    };
    rec.lang = 'fr-FR';
    rec.interimResults = false;
    setListening(true);
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript;
      if (transcript) setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  };

  const refreshPass = async () => {
    try {
      const res = await fetch('/api/pass');
      if (res.ok) {
        const data = await res.json();
        setHasPass(Boolean(data.pass));
        setPassOpen(data.mode === 'open');
      }
    } catch {
      // Backend hors-ligne : pas de Pass.
    }
  };

  const buyPass = async () => {
    setPassBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/pass/checkout', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        setError(data?.error || 'Impossible de créer la session de paiement.');
        return;
      }
      window.location.assign(data.url as string);
    } catch {
      setError('Serveur de paiement hors-ligne.');
    } finally {
      setPassBusy(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('pass')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    void refreshPass();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/leaderboard/history?days=7');
      if (res.ok) {
        const data = (await res.json()) as { days?: { date: string; margin: number; entries: number }[] };
        setHistoryDays(data.days || []);
      }
    } catch {
      // Backend hors-ligne : pas d'historique.
    }
  };

  const fetchLeaderboard = async (board: LbBoard = lbBoard) => {
    try {
      const res = await fetch(`/api/leaderboard?date=${todayStr}&board=${board}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.entries || []);
      }
    } catch {
      // Backend optionnel en local pur
    }
  };

  const submitDailyScore = async (paid: number) => {
    try {
      // 1. Le serveur ouvre la partie et renvoie le contrat officiel.
      const run = dailyRunRef.current;
      if (!run) {
        setError('Leaderboard indisponible (partie non ouverte côté serveur).');
        return;
      }
      const { runId, ticket } = run;

      // 2. Il valide le prix payé et calcule la marge lui-même.
      const dealRes = await fetch('/api/run/deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId, ticket, paid }),
      });
      const deal = await dealRes.json().catch(() => ({}));
      if (!dealRes.ok) {
        setError(deal?.error || 'Le serveur a refusé ce deal.');
        return;
      }

      // 3. Publication : aucune valeur de score n'est envoyée par le client.
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudo,
          runId,
          ticket,
          line: [...history].reverse().find((h) => h.role === 'player')?.content ?? '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setLeaderboard(data.entries || []);
        setScoreSubmitted(true);
        setError(null);
        // Le panneau d'historique doit refléter la publication qui vient d'avoir lieu.
        void fetchHistory();
      } else {
        setError(data?.error || 'Score refusé par le serveur.');
      }
    } catch {
      setError('Serveur leaderboard hors-ligne (lance `npm run server`).');
    }
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 380);
  };

  const toggleMute = () => {
    sound.muted = !muted;
    setMuted(!muted);
    if (muted) ambience.stop();
  };

  // Rappel Contrat 24h : sans service worker ni push, la seule fenêtre utile
  // est l'ouverture du jeu. On prévient donc au chargement, une fois par jour.
  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem('fence_notified') === today) return;
    if (localStorage.getItem('fence_daily_done') === today) return;
    localStorage.setItem('fence_notified', today);
    try {
      new Notification('CASH NOIR', {
        body: "Ton contrat 24h du jour t'attend derrière le comptoir.",
        icon: '/assets/icons/icon-192.png',
        tag: 'fence-daily',
      });
    } catch {
      /* notification refusée par le système : on ignore */
    }
  }, []);

  // Démarre la pluie + le néon au premier geste (politique d'autoplay des navigateurs).
  useEffect(() => {
    if (muted || !routePath.startsWith('/play')) return;
    const start = () => {
      ambience.start();
      window.removeEventListener('pointerdown', start);
    };
    window.addEventListener('pointerdown', start);
    return () => window.removeEventListener('pointerdown', start);
  }, [muted, routePath]);

  // Quitter le jeu (retour au site vitrine) coupe l'ambiance.
  useEffect(() => {
    if (!routePath.startsWith('/play')) ambience.stop();
  }, [routePath]);

  // Registre des clients : une entrée par client, ajoutée quand l'issue est connue.
  useEffect(() => {
    if (outcome === 'active' || currentCase.isDailyContract || loggedCaseRef.current === currentCase.id) return;
    loggedCaseRef.current = currentCase.id;
    const result: RegistryEntry['result'] =
      outcome === 'deal_accepte' ? (currentCase.isTrap ? 'trap' : 'deal') : outcome === 'sort_son_arme' ? 'gun' : 'walk';
    setRegistry((prev) => [
      ...prev.slice(-59),
      {
        id: currentCase.id,
        castId: currentCase.castId,
        name: currentCase.name,
        gender: currentCase.gender,
        job: currentCase.displayArchetype ?? currentCase.archetype,
        day,
        result,
        paid: result === 'deal' ? askedPrice : 0,
        street: currentCase.streetValue,
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome, currentCase.id]);

  const startNewCase = (nextCase: ProceduralCase) => {
    setCurrentCase(nextCase);
    const armedWeapons = jokerIds.includes('vitrine-armee')
      ? inventory.filter((it) => it.category === 'Armement').length
      : 0;
    const fearBonus =
      (jokerIds.includes('intimidation') ? 15 : 0) +
      armedWeapons * 15 +
      (!nextCase.isDailyContract ? (nightEvent?.bonusFear ?? 0) : 0) +
      (weeklyChallenge.modifier.fearBoost ?? 0);
    const suspicionBonus =
      (nextCase.item.modifier === 'collection' ? 12 : 0) +
      (!nextCase.isDailyContract ? (nightEvent?.bonusSuspicion ?? 0) : 0) +
      (weeklyChallenge.modifier.mefianceBoost ?? 0) +
      (ascMod?.mefianceBoost ?? 0);
    // Revenge: faction grudge boosts anger/mefiance
    const revenge = !nextCase.isDailyContract
      ? checkVengeance(vengeance, day, nextCase.faction)
      : null;
    const facRank = !nextCase.isDailyContract
      ? getFactionRank(factionRep[resolveFactionId(nextCase.faction)] ?? 0)
      : null;
    setGauges({
      ...nextCase.initialGauges,
      peur: Math.min(100, nextCase.initialGauges.peur + fearBonus),
      colere: Math.min(100, nextCase.initialGauges.colere + (revenge?.angerBoost ?? 0)),
      mefiance: Math.max(
        5,
        Math.min(
          100,
          nextCase.initialGauges.mefiance +
            suspicionBonus +
            (revenge?.mefianceBoost ?? 0) +
            (facRank?.mefianceDelta ?? 0),
        ),
      ),
    });
    // Negociateur joker + Faction rank discount
    const facPriceMult = facRank?.priceMult ?? 1;
    const negoMult = jokerIds.includes('negociateur') ? 0.9 : 1;
    const priceAfterNego =
      facPriceMult !== 1 || negoMult !== 1
        ? Math.round((nextCase.initialPrice * negoMult * facPriceMult) / 50) * 50
        : nextCase.initialPrice;
    setAskedPrice(priceAfterNego);
    setPriceTrail([priceAfterNego]);
    usedPsychoRef.current = { nameHit: false, weakHit: false };
    setGrilled({ loupe: false, uv: false, radio: false });
    setTell(revenge?.flavorText ?? nextCase.openingTell);
    // Collectionneur joker or Codex Œil d'Expert perk: detect contrefacon on sight
    if (
      (jokerIds.includes('collectionneur') || activeCodexPerks.includes('Œil d’Expert')) &&
      nextCase.item.modifier === 'contrefacon'
    ) {
      setTell((prev) => prev + ' [EXPERT] Tu repères une contrefaçon au premier coup d\u2019œil.');
    }
    setOutcome('active');
    setInspected(false);
    setUvScanned(false);
    setPhantomDone(false);
    setRadioOpen(false);
    setHistory([{ role: 'npc', content: nextCase.openingLine }]);
    setError(null);
    setOfferAmount(Math.max(150, Math.min(cash, Math.round((nextCase.initialPrice * 0.8) / 50) * 50)));
  };

  const startSeasonEpisode = (ep: SeasonEpisode) => {
    const base = generateProceduralCase(day, cityHeat, lastMemory || undefined, currentDistrict.multiplier);
    const castChar = CAST_ROSTER.find((c) => c.id === ep.castId) || CAST_ROSTER[0];
    setActiveEpisodeId(ep.id);
    setTab('counter');
    startNewCase({
      ...base,
      id: `ep-${ep.id}-${Date.now()}`,
      castId: castChar.id,
      gender: castChar.gender,
      name: castChar.fullName,
      age: castChar.age,
      faction: ep.faction,
      archetype: `${ep.title} · ${castChar.job}`,
      isTrap: false,
      openingLine: `${ep.synopsis} — ${castChar.openingTemplate
        .replace('{item}', base.item.name)
        .replace('{price}', base.initialPrice.toLocaleString('fr-FR'))}`,
      openingTell: castChar.tell,
    });
  };

  // Heat extrême : contrôle de police en pleine journée (coût immédiat).
  const policeCheckIfHot = (): boolean => {
    if (cityHeat < 90) return false;
    const bribe = Math.max(0, Math.round(cash * 0.1));
    sound.playDanger();
    setCash((c) => Math.max(0, c - bribe));
    setCityHeat(70);
    setError(
      `[HEAT ≥ 90 %] Contrôle de police devant la boutique : ${bribe.toLocaleString('fr-FR')} $ de pot-de-vin payés pour les faire partir (Heat retombé à 70 %).`,
    );
    return true;
  };

  const spawnNextCase = (isLastClient = false): ProceduralCase => {
    // BOSS : priorité absolue sur le 3e client des jours 3, 6, 9… Aucun arc ne le remplace.
    if (isLastClient && day >= 3 && day % 3 === 0) {
      return generateBossCase(day, cityHeat, currentDistrict.multiplier, gameLocale);
    }
    const activeNote = arcNotes.find((n) => !n.resolved);
    if (activeNote && (isLastClient || Math.random() < 0.55)) {
      const arc = STORY_ARCS.find((a) => a.id === activeNote.arcId);
      if (arc) {
        const hasItem = inventory.some((i) => i.arcItemKey === arc.itemKey);
        return buildArcStep2Case(arc, hasItem, currentDistrict.multiplier, gameLocale);
      }
    }
    const activeCount = arcNotes.filter((n) => !n.resolved).length;
    const seenIds = new Set(arcNotes.map((n) => n.arcId));
    const unseenArcs = STORY_ARCS.filter((a) => !seenIds.has(a.id));
    if (activeCount < 2 && unseenArcs.length > 0 && Math.random() < 0.45) {
      const pick = unseenArcs[Math.floor(Math.random() * unseenArcs.length)];
      return buildArcStep1Case(pick, currentDistrict.multiplier, gameLocale);
    }
    return generateProceduralCase(
      day,
      cityHeat,
      lastMemory || undefined,
      currentDistrict.multiplier,
      gameLocale,
    );
  };

  const nextProceduralClient = () => {
    if (policeCheckIfHot()) return;

    const nextServed = clientsServedToday + 1;
    if (nextServed >= maxClientsPerDay) {
      setClientsServedToday(maxClientsPerDay);
      setTab('night');
      return;
    }
    setClientsServedToday(nextServed);
    // Au 3e client du jour, si une piste est ouverte, on fait avancer l'histoire.
    startNewCase(spawnNextCase(nextServed === maxClientsPerDay - 1));
  };

  const rerollClient = () => {
    if (tab === 'daily') {
      setError('Contrat quotidien : une seule tentative.');
      return;
    }
    if (policeCheckIfHot()) return;
    if (rerollsLeft <= 0) {
      setError("Plus de tirage aujourd'hui : le marché est sec, reviens demain.");
      return;
    }
    setRerollsLeft((n) => n - 1);
    // Weekly challenge: reroll can cost heat
    if (weeklyChallenge.modifier.extraRerollCost) {
      setCityHeat((h) => Math.min(100, h + weeklyChallenge.modifier.extraRerollCost!));
    }
    setError(null);
    // Sur le dernier client d'un jour de boss, le tirage rend un boss (pas un client banal).
    startNewCase(spawnNextCase(clientsServedToday >= maxClientsPerDay - 1));
  };

  const openDailyContract = async (targetLocale?: Locale) => {
    const loc = targetLocale || gameLocale;
    setTab('daily');
    setScoreSubmitted(false);
    void fetchLeaderboard();
    fetch('/api/leaderboard/highlight')
      .then((r) => r.json())
      .then((h) => setHighlight(h?.line ? h : null))
      .catch(() => setHighlight(null));
    void fetchHistory();

    // Le serveur ouvre la partie dès le début : il compte les tours de négociation.
    dailyRunRef.current = null;
    try {
      const r = await fetch('/api/run/start', { method: 'POST' });
      if (r.status === 409) {
        const e = await r.json().catch(() => ({}));
        setError(e?.error || 'Contrat quotidien déjà tenté aujourd’hui.');
        setTab('counter');
        return;
      }
      if (r.ok) {
        const { runId, ticket } = await r.json();
        dailyRunRef.current = { runId, ticket };
      }
    } catch {
      // Hors-ligne : pas de run, donc pas de publication au classement.
    }

    // Prix officiels du contrat du jour : c'est le serveur qui les fixe.
    let priceOverride: { initialPrice: number; floorPrice: number; streetValue: number } | undefined;
    try {
      const res = await fetch('/api/daily');
      if (res.ok) {
        const contract = await res.json();
        if (
          Number.isFinite(contract?.initialPrice) &&
          Number.isFinite(contract?.floorPrice) &&
          Number.isFinite(contract?.streetValue)
        ) {
          priceOverride = {
            initialPrice: contract.initialPrice,
            floorPrice: contract.floorPrice,
            streetValue: contract.streetValue,
          };
        }
      }
    } catch {
      // Hors-ligne : on garde le contrat généré localement.
    }

    startNewCase(generateDailyContract(todayStr, priceOverride, loc));
  };

  const resetEmpire = () => {
    setDay(1);
    setCash(2500);
    setDebt(0);
    setTotalProfit(0);
    setCityHeat(15);
    setInventory([]);
    setUpgrades({ uvLamp: false, armoredDoor: false, gpsJammer: false });
    setLastMemory('');
    setJokerIds([]);
    setJokerDraft(null);
    setClientsServedToday(0);
    setArcNotes([]);
    setGameOverReason(null);
    setVengeance([]);
    setAscensionLevel(0);
    setMaxDaySurvived(0);
    setTab('counter');
    startNewCase(generateProceduralCase(1, 15, undefined, 1, gameLocale));
  };

  const saveConfig = () => {
    sessionStorage.setItem('fence_provider', provider);
    sessionStorage.removeItem('fence_api_key');
    setShowConfig(false);
    setError(null);
  };

  const sendMessage = async (textOverride?: string, explicitOffer?: number, isClueMacro = false) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading || outcome !== 'active') return;

    triggerHaptic(15);
    const updatedHistory: ChatTurn[] = [...history, { role: 'player', content: text }];
    setHistory(updatedHistory);
    if (!textOverride) setInput('');
    setLoading(true);
    setError(null);

    try {
      let inferredOffer = explicitOffer;
      if (inferredOffer === undefined) {
        const match = text.match(/(?:^|\s)(\d{3,6}|\d{1,2}\s\d{3})(?:\s*\$|\s|$|[.,!?])/);
        if (match?.[1]) {
          const parsedNum = Number(match[1].replace(/\s+/g, ''));
          if (Number.isFinite(parsedNum) && parsedNum >= 100) {
            if (parsedNum <= cash) {
              inferredOffer = parsedNum;
            } else {
              setError(
                `Tu proposes ${parsedNum.toLocaleString('fr-FR')} $, mais tu n'as que ${cash.toLocaleString('fr-FR')} $ en caisse.`,
              );
              setHistory(history);
              if (!textOverride) setInput(text);
              setLoading(false);
              return;
            }
          }
        } else if (
          /^(?:ok|d'accord|dac|vendu|deal|march[eé]\s*conclu|tope\s*l[aà]|[cç]a\s*marche|je\s*(?:te\s*le\s*)?prends)[.!\s]*$/i.test(
            text,
          ) &&
          askedPrice <= cash
        ) {
          inferredOffer = askedPrice;
        }
      }
      const playerTurnsSoFar = history.filter((h) => h.role === 'player').length;
      const repeated = history.some((h) => h.role === 'player' && h.content.trim().toLowerCase() === text.toLowerCase());
      let psycho: ReturnType<typeof evaluatePsychoTriggers>;
      if (repeated) {
        psycho = {
          fearDelta: 0,
          angerDelta: 12,
          mefianceDelta: 8,
          isPromptInjection: false,
          hitName: false,
          hitWeak: false,
          hitLabel: 'Répétition',
        };
      } else if (isClueMacro) {
        const isRadio = /fréquence|scanner|police|radio|escáner/i.test(text);
        const isUv = /UV|ultraviolet|fluorescent/i.test(text);
        psycho = {
          fearDelta: isRadio ? 22 : isUv ? 18 : 14,
          angerDelta: 4,
          mefianceDelta: isRadio ? 12 : isUv ? 10 : 6,
          isPromptInjection: false,
          hitName: false,
          hitWeak: true,
          hitLabel: isRadio ? 'Scanner Police' : isUv ? 'Marquage UV' : 'Indice Loupe',
        };
      } else {
        psycho = evaluatePsychoTriggers(
          text,
          currentCase.archetype,
          currentCase.name,
          day,
          usedPsychoRef.current,
        );
      }
      if (psycho.isPromptInjection) {
        const nextColere = Math.min(100, gauges.colere + psycho.angerDelta);
        const nextMefiance = Math.min(100, gauges.mefiance + psycho.mefianceDelta);
        const nextG: Gauges = { peur: gauges.peur, colere: nextColere, mefiance: nextMefiance };
        setGaugeDeltas({ peur: 0, colere: nextColere - gauges.colere, mefiance: nextMefiance - gauges.mefiance, key: Date.now() });
        setGauges(nextG);
        setTell(`${currentCase.gender === 'f' ? 'Elle' : 'Il'} te regarde comme si tu perdais la boule. [${psycho.hitLabel}]`);
        setHistory((prev) => [
          ...prev,
          { role: 'npc', content: 'Arrête ton charabia, tu me prends pour un robot ? On parle cash ou je me casse.' },
        ]);
        if (nextColere >= 80) setOutcome('sort_son_arme');
        else if (nextMefiance >= 88) setOutcome('quitte_la_boutique');
        setLoading(false);
        return;
      }
      if (psycho.hitName) usedPsychoRef.current.nameHit = true;
      if (psycho.hitWeak) usedPsychoRef.current.weakHit = true;
      const preGauges: Gauges = {
        peur: Math.min(100, gauges.peur + psycho.fearDelta),
        colere: Math.min(100, gauges.colere + psycho.angerDelta),
        mefiance: Math.min(100, gauges.mefiance + psycho.mefianceDelta),
      };
      const config: LLMConfig = { provider };
      const res = await queryNPC(
        config,
        currentCase.systemPrompt,
        updatedHistory,
        preGauges,
        askedPrice,
        currentCase.initialPrice,
        currentCase.floorPrice,
        inferredOffer,
        gameLocale,
        currentCase.isDailyContract ? (dailyRunRef.current ?? undefined) : undefined,
        currentCase.gender,
        isClueMacro ? 25 : repeated ? 5 : Math.max(10, 25 - 5 * playerTurnsSoFar),
      );

      const nextGauges: Gauges = {
        peur: Math.max(preGauges.peur, res.jauges.peur),
        colere: res.jauges.colere,
        mefiance: res.jauges.mefiance,
      };
      setGaugeDeltas({
        peur: nextGauges.peur - gauges.peur,
        colere: nextGauges.colere - gauges.colere,
        mefiance: nextGauges.mefiance - gauges.mefiance,
        key: Date.now(),
      });
      setGauges(nextGauges);
      setAskedPrice(res.prix_actuel_demande);
      if (res.prix_actuel_demande < askedPrice) {
        setPriceTrail((prev) => [...prev, res.prix_actuel_demande]);
      }
      setTell(
        psycho.hitLabel
          ? `${res.indice_comportemental} [${psycho.hitLabel}]`
          : res.indice_comportemental,
      );
      setHistory((prev) => [...prev, { role: 'npc', content: res.dialogue }]);
      speakNPC(res.dialogue, res.jauges);

      if (res.jauges.colere >= 60 && res.jauges.colere > gauges.colere) {
        triggerShake();
      }

      if (res.action_speciale !== 'aucune') {
        setOutcome(res.action_speciale);

        if (res.action_speciale === 'deal_accepte') {
          sound.playDealSuccess();
          const finalPaid = res.prix_actuel_demande;
          setCash((c) => c - finalPaid);
          const baseHeatGain = upgrades.gpsJammer ? 6 : 14;
          const fantomeReduction = jokerIds.includes('fantome') ? 5 : 0;
          const rawHeatGain =
            Math.max(0, baseHeatGain - fantomeReduction) +
            (!currentCase.isDailyContract ? (nightEvent?.extraHeatPerDeal ?? 0) : 0);
          const heatGain = activeCodexPerks.includes('Immunité Fédérale')
            ? Math.round(rawHeatGain * 0.75)
            : rawHeatGain;
          setCityHeat((h) => Math.min(100, h + heatGain));
          // Weekly challenge bonus cash per deal
          if (weeklyChallenge.modifier.bonusCashPerDeal) {
            setCash((c) => c + weeklyChallenge.modifier.bonusCashPerDeal!);
          }
          // Traiter avec un boss se voit : le Syndicat ou la Brigade finissent par le savoir.
          if (currentCase.isBoss) setCityHeat((h) => Math.min(100, h + 22));
          setLastMemory(
            `a acheté un(e) ${currentCase.item.name} lié(e) à ${currentCase.faction} pour ${finalPaid} $`,
          );

          // Calcul des multiplicateurs Atouts (Balatro-style)
          let valueBoost = 1;
          if (jokerIds.includes('sang-froid')) {
            if (inspected) valueBoost += 0.15;
            if (uvScanned) valueBoost += 0.15;
          }
          if (jokerIds.includes('oeil-lynx') && finalPaid <= currentCase.streetValue * 0.3) {
            valueBoost += 0.25;
          }

          if (currentCase.isTrap) {
            sound.playDanger();
            triggerShake();
            setCityHeat((h) => Math.min(100, h + 30));
            setRaidNote(
              `PIÈGE ! ${currentCase.name} était un agent infiltré (${currentCase.item.name}). Heat +30% !`,
            );
            // Visible immédiatement sur le comptoir (le bandeau raidNote ne s'affiche qu'à l'onglet Nuit).
            setTell(
              `PIÈGE : ${currentCase.name} était un agent infiltré. Cash perdu, rien au coffre, Heat +30.`,
            );
            setLastMemory(`${currentCase.name} était un agent infiltré : appât payé au prix fort.`);
            appendHistory('trap', `Piégé par ${currentCase.name} (${currentCase.item.name})`, -finalPaid);
          } else {
            if (currentCase.item.codexId) {
              const isNew = recordCodexDiscovery(currentCase.item.codexId);
              if (isNew) setCodexDiscovered(getDiscoveredCodexItems());
            }
            const rarityXp =
              currentCase.item.rarity === 'mythique' || currentCase.item.rarity === 'legendaire'
                ? 300
                : currentCase.item.rarity === 'epique' || currentCase.item.rarity === 'rare'
                  ? 150
                  : 0;
            setSeasonXp((xp) => xp + 120 + rarityXp);
            setFactionRep((prev) =>
              applyFactionDealDelta(prev, currentCase.faction, currentCase.isBoss ? 14 : 8),
            );
            bumpQuest('deals', 1);
            if (finalPaid <= currentCase.initialPrice * 0.55) bumpQuest('bargains', 1);
            unlockAchievement('first-blood');
            if (codexDiscovered.length >= 10) unlockAchievement('codex-10');
            if (activeEpisodeId) {
              const ep = SEASON_EPISODES.find((e) => e.id === activeEpisodeId);
              if (ep && !completedEpisodes.includes(ep.id)) {
                setCompletedEpisodes((prev) => [...prev, ep.id]);
                setSeasonXp((xp) => xp + ep.rewardXp);
                setCash((c) => c + ep.rewardCash);
                if (ep.unlockCodexId && recordCodexDiscovery(ep.unlockCodexId)) {
                  setCodexDiscovered(getDiscoveredCodexItems());
                }
                appendHistory('deal', `${ep.title} bouclé (+${ep.rewardXp} XP)`, ep.rewardCash);
              }
              setActiveEpisodeId(null);
            }
            const dealItemName = localizeItemName(currentCase.item.name, gameLocale);
            const historyLabel =
              gameLocale === 'en'
                ? `Bought: ${dealItemName} (${currentCase.name})`
                : gameLocale === 'es'
                  ? `Compra: ${dealItemName} (${currentCase.name})`
                  : `Achat : ${currentCase.item.name} (${currentCase.name})`;
            appendHistory('deal', historyLabel, -finalPaid);
            setInventory((inv) => [
              ...inv,
              {
                id: `${currentCase.id}-${Date.now()}`,
                name: currentCase.item.name,
                faction: currentCase.faction,
                paid: finalPaid,
                streetValue: Math.round(
                  currentCase.streetValue *
                    valueBoost *
                    (currentCase.item.modifier === 'contrefacon' ? 0.4 : 1) *
                    (!currentCase.isDailyContract ? (nightEvent?.streetMultiplier ?? 1) : 1),
                ),
                hotLevel: currentCase.item.hotLevel,
                cleaned: false,
                category: currentCase.item.category,
                modifier: currentCase.item.modifier,
                codexId: currentCase.item.codexId,
                rarity: currentCase.item.rarity,
                arcId: currentCase.arcId,
                arcItemKey: currentCase.arcItemKey,
                ...(currentCase.isTrap || currentCase.isDailyContract ? {} : (() => {
                  const secretId = rollSecretId();
                  return secretId ? { secretId, secretTries: 3, secretState: 'open' as const } : {};
                })()),
              },
            ]);
            if (currentCase.arcStep === 1 && currentCase.arcId && currentCase.arcItemKey) {
              setArcNotes((prev) =>
                prev.some((n) => n.arcId === currentCase.arcId)
                  ? prev
                  : [
                      ...prev,
                      {
                        arcId: currentCase.arcId!,
                        title: currentCase.arcTitle || 'Piste ouverte',
                        note: currentCase.arcClueNote || currentCase.item.hiddenClue,
                        itemKey: currentCase.arcItemKey!,
                        resolved: false,
                      },
                    ],
              );
            }
          }

          if (currentCase.isDailyContract) {
            setDailyDoneDate(todayStr);
            const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
            setStreak((prev) => (lastContractDate === yesterday ? prev + 1 : 1));
            setLastContractDate(todayStr);
          }
        } else if (res.action_speciale === 'quitte_la_boutique') {
          if (jokerIds.includes('vautour')) {
            setCash((c) => c + 150);
          }
          // Revenge: faction remembers rejection
          if (!currentCase.isDailyContract && !currentCase.isBoss) {
            setVengeance((prev) => [...prev, { faction: currentCase.faction, day, reason: 'rejected' }]);
          }
        } else if (res.action_speciale === 'sort_son_arme') {
          sound.playDanger();
          triggerShake();
          // Revenge: faction remembers braquage
          if (!currentCase.isDailyContract) {
            setVengeance((prev) => [...prev, { faction: currentCase.faction, day, reason: 'braquage' }]);
          }
          const hasWeaponInStock = inventory.some((i) => /revolver|fusil|357|arme/i.test(i.name));
          if (upgrades.armoredDoor) {
            setTell('La porte blindée s’est verrouillée à temps : le tir a ricoché sur l’acier.');
          } else if (hasWeaponInStock) {
            setTell(
              'Tu sors le canon que tu gardes sur ton étagère : il ravale sa menace et détale ! (0 $ volés)',
            );
          } else {
            const stolen = Math.min(cash, 600);
            setCash((c) => c - stolen);
            setCityHeat((h) => Math.min(100, h + 15));
            if (cash - stolen <= 0 && inventory.length === 0) {
              setGameOverReason(`${currentCase.name} t'a braqué et vidé ta caisse.`);
            }
          }
        }
      }
    } catch (err) {
      setHistory(history);
      if (!textOverride) setInput(text);
      setError(err instanceof Error ? err.message : 'Erreur inconnue.');
    } finally {
      setLoading(false);
    }
  };

  const slapCashOnCounter = () => {
    // Le compteur est plafonné par la caisse : l'offre réelle doit l'être aussi,
    // sinon le bouton annonce un montant que tu ne peux pas payer.
    const amount = Math.min(offerAmount, cash);
    if (amount < 100) {
      setError(
        gameLocale === 'en'
          ? `Not enough cash in register ($${formatMoney(cash, gameLocale)} available).`
          : gameLocale === 'es'
            ? `No hay suficiente efectivo (${formatMoney(cash, gameLocale)} $ disponibles).`
            : `Pas assez de liquide en caisse (${formatMoney(cash, gameLocale)} $ disponibles).`,
      );
      return;
    }
    triggerHaptic(25);
    sound.playCashSlap();
    const slapMsg =
      gameLocale === 'en'
        ? `(You pull a stack of bills from the register and slap them on the counter, palm flat on top.) $${formatMoney(amount, gameLocale)} cold cash right here, right now. Take it or walk.`
        : gameLocale === 'es'
          ? `(Sacas un fajo del cajón y lo estampas sobre el mostrador, con la mano encima.) Te doy ${formatMoney(amount, gameLocale)} $ en efectivo ahora mismo. Lo tomas o lo dejas.`
          : `(Tu sors une liasse du tiroir et tu la claques sur le comptoir, main posée dessus.) Je t'en donne ${formatMoney(amount, gameLocale)} $ en liquide, maintenant. À prendre ou à laisser.`;
    sendMessage(slapMsg, amount);
  };

  const confrontWithClue = (useUv = false) => {
    const clue = useUv ? currentCase.item.uvClue : currentCase.item.clueTag;
    triggerHaptic(20);
    const confrontMsg =
      gameLocale === 'en'
        ? `(You set the ${useUv ? 'UV lamp' : 'magnifier'} down firmly and stare into their eyes.) Explain this: ${clue}. And don't bullshit me about ${currentCase.faction}.`
        : gameLocale === 'es'
          ? `(Apoyas la ${useUv ? 'lámpara UV' : 'lupa'} en el mostrador y no desvías la mirada.) Explícame esto: ${clue}. Y no me mientas sobre ${currentCase.faction}.`
          : `(Tu poses ${useUv ? 'la lampe UV' : 'la loupe'} sur le comptoir et tu ${currentCase.gender === 'f' ? 'la' : 'le'} fixes.) Explique-moi ça : ${clue}. Et ne me mens pas sur ${currentCase.faction}.`;
    setGrilled((g) => ({ ...g, [useUv ? 'uv' : 'loupe']: true }));
    void sendMessage(confrontMsg, undefined, true);
  };

  const resolveArcStep2 = () => {
    if (outcome !== 'active' || currentCase.arcStep !== 2 || !currentCase.requiresItemKey) return;
    const match = inventory.find((i) => i.arcItemKey === currentCase.requiresItemKey);
    if (!match) return;
    const reward = currentCase.arcRewardCash || 5000;
    const heatDelta = currentCase.arcRewardHeat ?? -10;
    sound.playDealSuccess();
    setInventory((inv) => inv.filter((i) => i.id !== match.id));
    setCash((c) => c + reward);
    setTotalProfit((p) => p + reward);
    setCityHeat((h) => Math.max(0, Math.min(100, h + heatDelta)));
    setArcNotes((prev) =>
      prev.map((n) => (n.arcId === currentCase.arcId ? { ...n, resolved: true } : n)),
    );
    const resolutionMsg =
      currentCase.arcResolution ||
      `Énigme bouclée ! Tu livres la pièce et encaisses +${reward.toLocaleString('fr-FR')} $.`;
    setHistory((prev) => [...prev, { role: 'npc', content: resolutionMsg }]);
    setTell(resolutionMsg);
    setOutcome('deal_accepte');
  };

  const abandonArcStep2 = () => {
    if (outcome !== 'active' || currentCase.arcStep !== 2) return;
    sound.playDanger();
    setArcNotes((prev) =>
      prev.map((n) => (n.arcId === currentCase.arcId ? { ...n, resolved: true } : n)),
    );
    setTell('Piste perdue : tu as revendu la pièce trop tôt.');
    setOutcome('quitte_la_boutique');
  };

  // Night Phase actions
  const cleanItem = (itemId: string) => {
    const cleanCost = jokerIds.includes('blanchisseur-express') ? 0 : 150;
    if (cash < cleanCost) {
      setError(`Il faut ${cleanCost} $ pour effacer les traces.`);
      return;
    }
    setCash((c) => c - cleanCost);
    setCityHeat((h) => Math.max(0, h - 8));
    setInventory((inv) =>
      inv.map((it) => (it.id === itemId ? { ...it, cleaned: true, hotLevel: 'TIÈDE' } : it)),
    );
  };

  // L'Acheteur Fantôme : rachat en bloc du coffre, plafonné (4 pièces / 15 000 $).
  const PHANTOM_MAX_ITEMS = 4;
  const PHANTOM_MAX_CASH = 15000;

  const phantomBuyout = () => {
    if (outcome !== 'active' || currentCase.bossKind !== 'phantom' || phantomDone) return;
    if (inventory.length === 0) {
      setError('Le coffre est vide : l’Acheteur Fantôme repart sans rien.');
      return;
    }
    const batch = inventory.slice(0, PHANTOM_MAX_ITEMS);
    const raw = Math.round(batch.reduce((sum, it) => sum + it.streetValue * 1.2, 0));
    const capped = Math.min(PHANTOM_MAX_CASH, raw);
    const paidTotal = batch.reduce((sum, it) => sum + it.paid, 0);
    const ids = new Set(batch.map((it) => it.id));
    sound.playDealSuccess();
    setCash((c) => c + capped);
    setTotalProfit((p) => p + (capped - paidTotal));
    setInventory((inv) => inv.filter((it) => !ids.has(it.id)));
    setCityHeat((h) => Math.min(100, h + 12));
    setPhantomDone(true);
    setTell(
      `Rachat en bloc : ${batch.length} pièce(s) partie(s) pour ${capped.toLocaleString('fr-FR')} $ cash.${
        raw > capped
          ? ` Plafond atteint : ${(raw - capped).toLocaleString('fr-FR')} $ laissés sur la table.`
          : ''
      }`,
    );
  };

  const getFastSellPayout = (target: BoughtItem): number => {
    const catCount = target.category ? soldCategories[target.category] || 0 : 0;
    const catMult = catCount >= 2 ? 0.75 : catCount === 1 ? 0.88 : 1;
    const blindBoost = jokerIds.includes('a-l-aveugle') ? 1.6 : 1;
    const trendMult = target.category ? marketTrends[target.category] ?? 1 : 1;
    const seasonFastMult = seasonState.level >= 3 ? 1.05 : 1;
    return Math.round(target.streetValue * 0.62 * catMult * blindBoost * trendMult * seasonFastMult);
  };

  const sellItem = (itemId: string, mode: 'fast' | 'auction') => {
    const target = inventory.find((i) => i.id === itemId);
    if (!target) return;

    const baseAuctionMult = target.cleaned
      ? jokerIds.includes('blanchisseur')
        ? 1.4
        : 1.3
      : 1.15;
    const assetBoost = cityAssets.includes('warehouse') ? 1.35 : 1;
    // Marché saturé : chaque enchère de la journée ET chaque répétition de catégorie paie moins.
    const saturation = mode === 'auction' ? (jokerIds.includes('reseau') ? [1, 0.85, 0.7, 0.55] : [1, 0.8, 0.6])[Math.min(auctionsToday, jokerIds.includes('reseau') ? 3 : 2)] : 1;
    const catCount = target.category ? soldCategories[target.category] || 0 : 0;
    const catMult = catCount >= 2 ? 0.75 : catCount === 1 ? 0.88 : 1;
    const blindBoost = jokerIds.includes('a-l-aveugle') ? 1.6 : 1;
    const trendMult = target.category ? marketTrends[target.category] ?? 1 : 1;
    const codexAuctionMult = activeCodexPerks.includes('Clientèle Aristocratique') ? 1.18 : 1;
    const seasonAuctionMult = seasonState.level >= 20 ? 1.1 : 1;
    const facAuctionBonus = 1 + getFactionRank(factionRep[resolveFactionId(target.faction)] ?? 0).auctionBonus;
    const salePrice =
      mode === 'fast'
        ? getFastSellPayout(target)
        : Math.round(
            target.streetValue *
              baseAuctionMult *
              assetBoost *
              saturation *
              catMult *
              blindBoost *
              trendMult *
              codexAuctionMult *
              seasonAuctionMult *
              facAuctionBonus,
          );
    if (mode === 'auction') setAuctionsToday((n) => n + 1);
    if (target.category) {
      setSoldCategories((prev) => ({
        ...prev,
        [target.category!]: (prev[target.category!] || 0) + 1,
      }));
    }

    sound.playDealSuccess();
    const profit = salePrice - target.paid;
    setCash((c) => c + salePrice);
    setTotalProfit((p) => p + profit);
    if (mode === 'auction') bumpQuest('auctions', 1);
    appendHistory(
      'sell',
      `Revente ${mode === 'auction' ? 'enchères' : 'rapide'} : ${target.name} (marge ${profit >= 0 ? '+' : ''}${profit} $)`,
      salePrice,
    );

    if (mode === 'auction' && !target.cleaned) {
      setCityHeat((h) => Math.min(100, h + 18));
    } else if (mode === 'fast') {
      setCityHeat((h) => Math.max(0, h - 5));
    }

    setInventory((inv) => inv.filter((i) => i.id !== itemId));
  };

  const payRentAndNextDay = () => {
    if (cash < dailyRent) {
      setGameOverReason(
        `Tu n'as pas les ${dailyRent.toLocaleString('fr-FR')} $ pour payer le Syndicat ce soir. Boutique saisie.`,
      );
      return;
    }
    sound.playCashSlap();
    setDebt(0);
    const barIncome = cityAssets.includes('nightbar') ? 600 : 0;
    const barCool = cityAssets.includes('nightbar') ? 5 : 0;
    setCash((c) => c - dailyRent + barIncome);
    if (jokerIds.includes('assurance') || barCool > 0) {
      setCityHeat((h) => Math.max(0, h - (jokerIds.includes('assurance') ? 10 : 0) - barCool));
    }
    // Traceurs GPS : +12 % de Heat par pièce encore au coffre (nettoyer les neutralise).
    const activeTrackers = inventory.filter(
      (it) => it.modifier === 'traceur' && !it.cleaned,
    ).length;
    if (activeTrackers > 0) {
      setCityHeat((h) => Math.min(100, h + activeTrackers * 12));
      setRaidNote((prev) =>
        `${activeTrackers} traceur(s) encore actif(s) : Heat +${activeTrackers * 12} %.${prev ? ` ${prev}` : ''}`,
      );
    }

    setJokerDraft(drawRandomJokers(jokerIds, 3));
  };

  const pickJokerAndAdvance = (jokerId: string) => {
    sound.playDealSuccess();
    setJokerIds((prev) => (prev.includes(jokerId) ? prev : [...prev, jokerId]));
    setJokerDraft(null);

    // Heat >= 80 : descente de police. Le risque devient une vraie perte.
    const raidProtected = activeCodexPerks.includes('Brouillage Total');
    if (cityHeat >= 80 && !raidProtected) {
      const fine = Math.round(cash * 0.3);
      const seized = inventory.length;
      const cashLeft = cash - fine;
      setCash(Math.max(0, cashLeft));
      // double-fond joker: save 2 most valuable items from raid
      if (jokerIds.includes('double-fond') || jokerId === 'double-fond') {
        const sorted = [...inventory].sort((a, b) => b.paid - a.paid);
        setInventory(sorted.slice(0, 2));
      } else {
        setInventory([]);
      }
      setCityHeat(45);
      setRaidNote(
        `Descente de police au Jour ${day} : ${seized} pièce(s) saisie(s), ${fine.toLocaleString(
          'fr-FR',
        )} $ d'amende. Le dossier reste ouvert.`,
      );
      if (cashLeft <= 0) {
        setGameOverReason(
          'Descente de police : le Syndicat te lâche, caisse vide et boutique sous scellés.',
        );
        return;
      }
    } else {
      const seasonCool = seasonState.level >= 10 ? 3 : 0;
      setCityHeat((h) => Math.max(0, h - 12 - seasonCool));
      const morningDividend =
        (activeCodexPerks.includes('Trésorerie Noire') ? 400 : 0) +
        (seasonState.level >= 30 ? 500 : 0);
      if (morningDividend > 0) setCash((c) => c + morningDividend);
      if (nightEvent?.curfewBonusCash && cityHeat < 35) {
        setCash((c) => c + nightEvent.curfewBonusCash!);
        setRaidNote(
          `Couvre-feu calme (Heat < 35%) : +${nightEvent.curfewBonusCash.toLocaleString('fr-FR')} $ de prime de discrétion.`,
        );
      } else if (raidProtected && cityHeat >= 80) {
        setRaidNote('Brouillage Total (Codex) : la descente de police a été déviée.');
      } else {
        setRaidNote(null);
      }
    }

    const nextDay = day + 1;
    setDay(nextDay);
    setClientsServedToday(0);
    setAuctionsToday(0);
    setSoldCategories({});
    setRerollsLeft(baseRerolls);
    setVengeance((prev) => pruneVengeance(prev, nextDay));
    setMaxDaySurvived((prev) => Math.max(prev, nextDay));
    if (nextDay >= 10) unlockAchievement('survive-10');
    setRivals((prev) => advanceRivals(prev, nextDay, lastPoachedItem, gameLocale));
    setLastPoachedItem(undefined);
    setTab('counter');
    startNewCase(
      generateProceduralCase(nextDay, cityHeat, lastMemory || undefined, currentDistrict.multiplier, gameLocale),
    );
  };

  const buyUpgrade = (key: keyof Upgrades, cost: number) => {
    if (upgrades[key] || cash < cost) return;
    setCash((c) => c - cost);
    setUpgrades((u) => ({ ...u, [key]: true }));
  };

  const transferToSwiss = (amount: number) => {
    if (cash < amount || amount <= 0) return;
    sound.playCashSlap();
    setCash((c) => c - amount);
    const netRate = seasonState.level >= 15 ? 0.94 : 0.9;
    const netAdded = Math.round(amount * netRate);
    setSwissBank((s) => s + netAdded);
    bumpQuest('swiss', amount);
    if (swissBank + netAdded >= 10000) unlockAchievement('swiss-10k');
  };

  const withdrawFromSwiss = (amount: number) => {
    if (swissBank < amount || amount <= 0) return;
    sound.playCashSlap();
    setSwissBank((s) => s - amount);
    setCash((c) => c + amount);
    setError(null);
  };

  const submitSecret = (item: BoughtItem) => {
    if (!item.secretId || item.secretState !== 'open') return;
    const ui = SECRET_UI[gameLocale];
    if (checkSecret(item.secretId, secretInput, gameLocale)) {
      const r = secretReward(item.secretId)!;
      const text =
        r.kind === 'cash' ? ui.rewardCash(formatMoney(r.amount, gameLocale)) : r.kind === 'xp' ? ui.rewardXp(r.amount) : ui.rewardHeat(r.amount);
      if (r.kind === 'cash') setCash((c) => c + r.amount);
      if (r.kind === 'xp') setSeasonXp((x) => x + r.amount);
      if (r.kind === 'heat') setCityHeat((h) => Math.max(0, h - r.amount));
      sound.playDealSuccess();
      setInventory((inv) => inv.map((i) => (i.id === item.id ? { ...i, secretState: 'solved' as const } : i)));
      setSecretMsg((m) => ({ ...m, [item.id]: ui.solved(text) }));
      setSecretInput('');
      return;
    }
    const left = (item.secretTries ?? 3) - 1;
    sound.playDanger();
    setInventory((inv) =>
      inv.map((i) => (i.id === item.id ? { ...i, secretTries: left, secretState: left <= 0 ? ('burned' as const) : ('open' as const) } : i)),
    );
    setSecretMsg((m) => ({ ...m, [item.id]: left <= 0 ? ui.burned : ui.wrong(left) }));
    setSecretInput('');
  };

  const takeSyndicateLoan = () => {
    if (debt > 0) {
      setError(
        gameLocale === 'en'
          ? `You already owe $${formatMoney(debt, gameLocale)} to the Syndicate.`
          : gameLocale === 'es'
            ? `Ya debes ${formatMoney(debt, gameLocale)} $ al Sindicato.`
            : `Tu dois déjà ${formatMoney(debt, gameLocale)} $ au Syndicat.`,
      );
      return;
    }
    sound.playCashSlap();
    setDebt(1300);
    setCash((c) => c + 1000);
    setCityHeat((h) => Math.min(100, h + 15));
    setError(null);
  };

  const buyCityAsset = (asset: CityAsset) => {
    if (cityAssets.includes(asset.id) || swissBank < asset.costSwiss) return;
    sound.playDealSuccess();
    setSwissBank((s) => s - asset.costSwiss);
    setCityAssets((prev) => [...prev, asset.id]);
  };

  const reopenStartingCash = 2500 + Math.min(700, streak * 100);
  const reopenCostSwiss = Math.ceil(reopenStartingCash / 0.9);

  const reopenFromSwiss = () => {
    // Coût calculé pour qu'un aller-retour caisse → Suisse soit TOUJOURS perdant
    // (frais de blanchiment 10 % inclus). Sinon la réouverture + le bonus de série
    // puis le transfert retour créaient de l'argent gratuit à chaque faillite.
    const startingCash = reopenStartingCash;
    const reopenCost = reopenCostSwiss;
    if (swissBank < reopenCost) return;
    setSwissBank((s) => s - reopenCost);
    setDay(1);
    setCash(startingCash);
    setDebt(0);
    setCityHeat(15);
    setInventory([]);
    setClientsServedToday(0);
    setAuctionsToday(0);
    setSoldCategories({});
    setRerollsLeft(baseRerolls);
    setRaidNote(null);
    setGameOverReason(null);
    setTab('counter');
    startNewCase(generateProceduralCase(1, 15, lastMemory || undefined, currentDistrict.multiplier, gameLocale));
  };

  const passClient = () => {
    if (outcome !== 'active') return;
    setTell('Tu déclines l’offre. Le client remballe sa pièce sans faire d’histoire.');
    setHistory((prev) => [
      ...prev,
      { role: 'player', content: 'Pas intéressé ce soir, passe ton chemin.' },
      { role: 'npc', content: 'Comme tu veux. Je vais voir ailleurs.' },
    ]);
    setVengeance((prev) => [...prev, { faction: currentCase.faction, day, reason: 'rejected' as const }]);
    setFactionRep((prev) => applyFactionDealDelta(prev, currentCase.faction, -4));
    if (!currentCase.isTrap) setLastPoachedItem(currentCase.item.name);
    setOutcome('quitte_la_boutique');
  };

  const rejectTrap = () => {
    if (outcome !== 'active') return;
    if (currentCase.isTrap) {
      sound.playDealSuccess();
      const trapBonus = seasonState.level >= 6 ? 500 : 350;
      setCash((c) => c + trapBonus);
      setSeasonXp((xp) => xp + 150);
      bumpQuest('traps', 1);
      unlockAchievement('mole-hunter');
      appendHistory('trap', `Infiltré démasqué : ${currentCase.name}`, trapBonus);
      setCityHeat((h) => Math.max(0, h - 8));
      setTell(`Tu as démasqué l’infiltré : il décampe avant que ça tourne mal (+${trapBonus} $ prime d’info).`);
      setHistory((prev) => [
        ...prev,
        { role: 'player', content: '(Tu le vires sur-le-champ.) Dégage d’ici avec ton micro-cravate !' },
        { role: 'npc', content: 'Merde... t’es plus malin que t’en as l’air.' },
      ]);
      setOutcome('quitte_la_boutique');
    } else {
      sound.playDanger();
      setCityHeat((h) => Math.min(100, h + 8));
      setCash((c) => c - Math.min(c, 250)); // dédommagement : accuser au hasard n'est plus gratuit
      setTell('Fausse accusation : le client était réglo, claque la porte furieux et te fait payer 250 $ de dédommagement.');
      setHistory((prev) => [
        ...prev,
        { role: 'player', content: 'T’es un flic ! Dégage de ma boutique !' },
        { role: 'npc', content: 'T’es complètement parano, mec. Je vais vendre ailleurs.' },
      ]);
      setVengeance((prev) => [...prev, { faction: currentCase.faction, day, reason: 'rejected' as const }]);
      setFactionRep((prev) => applyFactionDealDelta(prev, currentCase.faction, -8));
      setLastPoachedItem(currentCase.item.name);
      setOutcome('quitte_la_boutique');
    }
  };

  const dynamicFloor = computeDynamicFloor(
    currentCase.initialPrice,
    currentCase.floorPrice,
    gauges.peur,
  );

  if (!isGameRoute) {
    return (
      <MarketingSite
        pathname={routePath}
        onNavigate={navigateTo}
        hasExistingSave={day > 1 || totalProfit !== 0 || swissBank > 0 || cash !== 2500}
        savedDay={day}
        savedCash={cash}
        countdownText={formatCountdown(countdown)}
        onPlay={() => {
          const nextLoc: Locale =
            routePath === '/fr' || routePath.startsWith('/fr/')
              ? 'fr'
              : routePath === '/es' || routePath.startsWith('/es/')
                ? 'es'
                : 'en';
          localStorage.setItem('fence_locale', nextLoc);
          localStorage.setItem('fence_entered', '1');
          if (nextLoc !== gameLocale) {
            setGameLocale(nextLoc);
            startNewCase(generateProceduralCase(day, cityHeat, lastMemory || undefined, currentDistrict.multiplier, nextLoc));
          }
          document.title = 'CASH NOIR — Counter';
          navigateTo('/play');
        }}
        onPlayDaily={() => {
          const nextLoc: Locale =
            routePath === '/fr' || routePath.startsWith('/fr/')
              ? 'fr'
              : routePath === '/es' || routePath.startsWith('/es/')
                ? 'es'
                : 'en';
          localStorage.setItem('fence_locale', nextLoc);
          localStorage.setItem('fence_entered', '1');
          setGameLocale(nextLoc);
          document.title = 'CASH NOIR — Daily Contract';
          navigateTo('/play/daily');
          openDailyContract();
        }}
      />
    );
  }

  // Texte de partage (FR/EN/ES) : carte du contrat quotidien ou "moment fort" d'une partie normale.
  const shareMoment = async (daily: boolean) => {
    const L = gameLocale;
    const won = outcome === 'deal_accepte' && !currentCase.isTrap;
    const margin = won ? currentCase.streetValue - askedPrice : 0;
    const discount = Math.round((100 * (currentCase.initialPrice - askedPrice)) / currentCase.initialPrice);
    const turns = Math.max(1, Math.floor(history.length / 2));
    const money = (n: number) => (L === 'en' ? `$${formatMoney(n, L)}` : `${formatMoney(n, L)} $`);
    const T = {
      fr: { head: daily ? 'Contrat Quotidien' : 'Au comptoir', deal: `DEAL +${money(margin)} 🟩`, trap: 'PIÈGE 🟥', gun: 'BRAQUAGE 🔫', walk: 'CLAQUÉ LA PORTE 🚪', neg: '🎯 NÉGOCIATEUR', blitz: '⚡ ÉCLAIR', cut: `📉 Décote : −${discount} % en ${turns} tour${turns > 1 ? 's' : ''}`, item: '📦 Objet', streak: 'Série', unit: 'j', line: 'Réplique clé', cta: 'Peux-tu faire mieux ?' },
      en: { head: daily ? 'Daily Contract' : 'At the counter', deal: `DEAL +${money(margin)} 🟩`, trap: 'TRAP 🟥', gun: 'HOLD-UP 🔫', walk: 'WALKED OUT 🚪', neg: '🎯 HAGGLER', blitz: '⚡ BLITZ', cut: `📉 Discount: −${discount}% in ${turns} turn${turns > 1 ? 's' : ''}`, item: '📦 Item', streak: 'Streak', unit: 'd', line: 'Key line', cta: 'Can you beat it?' },
      es: { head: daily ? 'Contrato Diario' : 'En el mostrador', deal: `TRATO +${money(margin)} 🟩`, trap: 'TRAMPA 🟥', gun: 'ATRACO 🔫', walk: 'PORTAZO 🚪', neg: '🎯 NEGOCIADOR', blitz: '⚡ RELÁMPAGO', cut: `📉 Descuento: −${discount} % en ${turns} turno${turns > 1 ? 's' : ''}`, item: '📦 Objeto', streak: 'Racha', unit: 'd', line: 'Frase clave', cta: '¿Puedes superarlo?' },
    }[L];
    const verdict = won ? T.deal : outcome === 'deal_accepte' ? T.trap : outcome === 'sort_son_arme' ? T.gun : T.walk;
    const badge = discount >= 45 ? T.neg : turns <= 2 && discount >= 20 ? T.blitz : '';
    const line = [...history].reverse().find((h) => h.role === 'player')?.content.replace(/\s+/g, ' ');
    const text = [
      `CASH NOIR · ${T.head} 🕵️‍♂️`,
      `${verdict}${badge ? ` · ${badge}` : ''}`,
      T.cut,
      `${T.item} : ${localizeItemName(currentCase.item.name, L)}${daily ? ` · ${T.streak} : ${streak} ${T.unit}` : ''}`,
      line ? `${T.line} : « ${line.slice(0, 80)}${line.length > 80 ? '…' : ''} »` : '',
      `🔗 ${T.cta} https://cashnoir.app/play${daily ? '/daily' : ''}`,
    ]
      .filter(Boolean)
      .join('\n');
    try {
      if (typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      // Partage annulé ou presse-papier refusé : le joueur peut réessayer.
    }
  };

  const itemProp = (
    <CounterItemProp
      name={localizeItemName(currentCase.item.name, gameLocale)}
      category={currentCase.item.category}
      surfaceDesc={localizeItemText(currentCase.item.surfaceDesc, gameLocale)}
      streetValue={currentCase.streetValue}
      inspected={inspected}
      uvScanned={uvScanned}
      locale={gameLocale}
      onInspect={() => {
        if (outcome !== 'active') return;
        if (!jokerIds.includes('a-l-aveugle')) setInspected(true);
        sound.playInspect();
      }}
    />
  );

  if (gameOverReason) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111114] border border-red-500/40 rounded-lg p-6 space-y-4 text-center">
          <ShieldAlert className="w-10 h-10 text-red-500 mx-auto" />
          <h1 className="text-xl font-semibold text-red-400">{t.gameOverCurtain(day)}</h1>
          <p className="text-sm text-zinc-300 leading-relaxed">{gameOverReason}</p>
          <div className="bg-zinc-950 border border-white/10 rounded p-3 text-xs font-mono text-zinc-400 space-y-1">
            <div>
              {t.gameOverProfit(formatMoney(totalProfit, gameLocale), getLocalizedRank(totalProfit, gameLocale))}
            </div>
            <div className="text-amber-400">
              {t.gameOverSwiss(formatMoney(swissBank, gameLocale), cityAssets.length)}
            </div>
          </div>
          {swissBank >= reopenCostSwiss && (
            <button
              onClick={reopenFromSwiss}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold py-2.5 rounded-md text-sm"
            >
              {t.gameOverReopen(formatMoney(reopenCostSwiss, gameLocale), formatMoney(reopenStartingCash, gameLocale))}
            </button>
          )}
          {canAscend(swissBank, maxDaySurvived) && (
            <button
              onClick={() => {
                const nextLevel = ascensionLevel + 1;
                setAscensionLevel(nextLevel);
                unlockAchievement('ascended');
                setDay(1);
                setCash(2500);
    setDebt(0);
                setTotalProfit(0);
                setCityHeat(15);
                setInventory([]);
                setUpgrades({ uvLamp: false, armoredDoor: false, gpsJammer: false });
                setLastMemory('');
                setJokerIds([]);
                setJokerDraft(null);
                setClientsServedToday(0);
                setArcNotes([]);
                setVengeance([]);
                setMaxDaySurvived(0);
                setGameOverReason(null);
                setTab('counter');
                startNewCase(generateProceduralCase(1, 15, undefined, 1, gameLocale));
              }}
              className="w-full bg-amber-600 hover:bg-amber-500 text-zinc-950 font-semibold py-2.5 rounded-md text-sm"
            >
              {t.gameOverAscend(['I', 'II', 'III'][ascensionLevel] || 'MAX')}
            </button>
          )}
          <button
            onClick={resetEmpire}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold py-2.5 rounded-md text-sm"
          >
            {t.gameOverReset}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        tab === 'counter' || tab === 'daily' ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'
      } bg-[#09090b] text-zinc-100 flex flex-col pb-[env(safe-area-inset-bottom)] ${shaking ? 'animate-shake' : ''}`}
    >
      {/* Top Bar : Responsive iOS/Android & Desktop */}
      <header className="relative z-30 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#090a0f]/95 px-3 py-2 sm:px-6">
        {/* Gauche : Logo SVG minimaliste + Identité CASH NOIR */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateTo('/')}
            className="flex items-center gap-2 select-none text-left hover:opacity-85 transition-opacity"
            title="Accueil & histoire CASH NOIR"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="h-5 w-5 shrink-0"
            >
              <path d="M10.5 3.5L3 12L10.5 20.5" stroke="#f4f4f5" strokeWidth="2" strokeLinecap="square" />
              <path d="M13.5 3.5L21 12L13.5 20.5V3.5Z" fill="#fbbf24" />
            </svg>
            <h1 className="font-[family-name:var(--font-display)] text-base leading-none tracking-[0.22em] text-zinc-100 sm:text-lg">
              CASH <span className="text-amber-400">NOIR</span>
            </h1>
          </button>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
            <span>{t.day} {day}</span>
            <span>·</span>
            <span className="text-zinc-400">{getLocalizedRank(totalProfit, gameLocale)}</span>
            {ascensionLevel > 0 && (
              <span className="border border-amber-500/40 bg-amber-500/10 px-1 py-0.2 text-[8px] text-amber-300">
                ASC.{['I','II','III'][ascensionLevel - 1] || ascensionLevel}
              </span>
            )}
          </div>
        </div>

        {/* Centre / HÉROS : Caisse & Danger (Mise en avant percutante du cash) */}
        <div className="flex items-center gap-3 sm:gap-6 bg-black/60 border border-white/5 rounded-full px-4 py-1">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="hidden sm:inline text-[9px] uppercase tracking-widest text-zinc-500">{t.cash}</span>
            <span className="text-base sm:text-xl font-bold tracking-tight text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              {gameLocale === 'en' ? `$${formatMoney(cash, gameLocale)}` : `${formatMoney(cash, gameLocale)} $`}
            </span>
          </div>

          <div className="h-3.5 w-px bg-white/10" />

          <div
            className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${
              cityHeat >= 70 ? 'text-red-400 animate-pulse font-bold' : cityHeat >= 50 ? 'text-amber-400' : 'text-zinc-500'
            }`}
            title={`Pression policière : ${cityHeat} %`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>{cityHeat}%</span>
          </div>

          {weeklyChallenge && (
            <>
              <div className="h-3.5 w-px bg-white/10 hidden md:block" />
              <span
                className="hidden md:inline font-mono text-[9px] uppercase tracking-widest text-zinc-500 hover:text-amber-300 cursor-help"
                title={localizeChallenge(weeklyChallenge, gameLocale).desc}
              >
                {localizeChallenge(weeklyChallenge, gameLocale).title}
              </span>
            </>
          )}
        </div>

        {/* Droite : Navigation sobre & Contrôles épurés */}
        <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:flex-nowrap sm:justify-end">
          <nav className="order-2 flex w-full items-center gap-1 overflow-x-auto no-scrollbar sm:order-none sm:w-auto font-mono text-[10px] uppercase tracking-wider whitespace-nowrap">
            <button
              onClick={() => {
                setTab('counter');
                if (currentCase.isDailyContract) {
                  startNewCase(
                    generateProceduralCase(
                      day,
                      cityHeat,
                      lastMemory || undefined,
                      currentDistrict.multiplier,
                      gameLocale,
                    ),
                  );
                }
              }}
              className={`px-2.5 py-1 transition-colors ${
                tab === 'counter'
                  ? 'border-b border-amber-400 text-amber-300 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.tabCounter} ({Math.min(clientsServedToday + 1, maxClientsPerDay)}/{maxClientsPerDay})
            </button>

            <button
              onClick={() => setTab('night')}
              className={`px-2.5 py-1 transition-colors ${
                tab === 'night'
                  ? 'border-b border-amber-400 text-amber-300 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.tabVault} ({inventory.length}){inventory.some((i) => i.secretState === 'open') ? ' ✦' : ''}
            </button>

            <button
              onClick={() => setTab('shop')}
              className={`px-2.5 py-1 transition-colors ${
                tab === 'shop'
                  ? 'border-b border-amber-400 text-amber-300 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.tabEmpire}
            </button>

            <button
              onClick={() => setTab('pantheon')}
              className={`px-2.5 py-1 transition-colors ${
                tab === 'pantheon'
                  ? 'border-b border-amber-400 text-amber-300 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.tabPantheon}
            </button>

            <button
              onClick={() => openDailyContract()}
              className={`flex items-center gap-1 px-2.5 py-1 transition-colors ${
                tab === 'daily'
                  ? 'border-b border-amber-400 text-amber-300 font-semibold'
                  : 'text-amber-500/80 hover:text-amber-300'
              }`}
            >
              <Clock className="h-3 w-3" />
              <span>{formatCountdown(countdown)}</span>
            </button>
          </nav>

          <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

          {/* Profil OAuth / Google Sign-In compact */}
          {authUser ? (
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 font-mono text-[10px] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="max-w-[70px] sm:max-w-[90px] truncate" title={authUser.email}>
                {authUser.name || authUser.email}
              </span>
              <button
                type="button"
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
                  cloudReadyRef.current = false;
                  setAuthUser(null);
                  setCloudStatus('idle');
                }}
                className="text-zinc-500 hover:text-red-400 transition-colors ml-0.5"
                title={t.logout}
              >
                ×
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (oauthConfigured) {
                  window.location.href = '/api/auth/google';
                } else {
                  setError('OAuth Google prêt : configure GOOGLE_CLIENT_ID et SECRET dans .env.local.');
                }
              }}
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-2.5 py-1 font-mono text-[10px] text-zinc-300 hover:text-white transition-all active:scale-95"
              title={gameLocale === 'en' ? 'Sync cloud progress via Google' : 'Synchroniser via Google'}
            >
              <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.8l3.7-2.9z"/>
                <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z"/>
              </svg>
              <span>{gameLocale === 'en' ? 'Google' : 'Google'}</span>
            </button>
          )}

          {/* Outils profil, son & debug épurés (sans boutons langue dans le header) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(15);
                setShowProfileModal(true);
              }}
              title={gameLocale === 'en' ? 'Profile & Preferences' : 'Profil & Préférences'}
              className="flex items-center gap-1 rounded-full border border-white/15 bg-black/60 px-2.5 py-1 font-mono text-[10px] text-zinc-300 hover:border-amber-400/60 hover:text-amber-300 transition-colors"
            >
              <User className="h-3 w-3 text-amber-400" />
              <span className="max-w-[70px] sm:max-w-[90px] truncate font-semibold tracking-wider">
                {playerHandle}
              </span>
            </button>

            <button
              onClick={() => {
                triggerHaptic(10);
                toggleMute();
              }}
              title={muted ? t.soundOn : t.soundOff}
              className="p-1 text-zinc-500 hover:text-amber-300 transition-colors"
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>

            <button
              onClick={() => {
                triggerHaptic(10);
                setShowConfig((s) => !s);
              }}
              title={t.aiSettings}
              className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <KeyRound className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* API Config Drawer */}
      {showConfig && (
        <div className="border-b border-white/10 bg-[#121216] px-6 py-4">
          <div className="max-w-4xl mx-auto flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">{t.engineLabel}</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as LLMProvider)}
                className="bg-zinc-900 border border-white/15 rounded-md px-3 py-2 text-sm text-zinc-100"
              >
                <option value="ollama">Ollama Local (gemma4:latest · 0 €)</option>
                <option value="gemini">Google Gemini (Gemini 3.8 Flash)</option>
                <option value="groq">Groq (LPU Ultra-rapide ~250ms)</option>
                <option value="deepseek">DeepSeek (DeepSeek-V3 · Low-cost)</option>
              </select>
            </div>
            <p className="flex-1 min-w-[240px] text-xs text-zinc-400 pb-2">
              {t.serverKeyNote}
            </p>
            <button
              onClick={saveConfig}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-4 py-2 rounded-md text-sm"
            >
              {t.saveBtn}
            </button>
            <button
              onClick={() => setDebugMode((d) => !d)}
              className="text-xs text-zinc-400 hover:text-zinc-200 underline"
            >
              {t.debugLabel} {debugMode ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={resetEmpire}
              className="text-xs text-red-400 hover:text-red-300 ml-auto underline"
            >
              {t.resetGame}
            </button>
          </div>
        </div>
      )}

      {/* TAB: NIGHT & RENT */}
      {tab === 'night' && (
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-4">
          {(() => {
            const L = gameLocale;
            const money = (n: number) => (L === 'en' ? `$${formatMoney(n, L)}` : `${formatMoney(n, L)} $`);
            const open = inventory.filter((i) => i.secretState === 'open').length;
            const arcsOpen = arcNotes.filter((n) => !n.resolved).length;
            const missing = Math.max(0, dailyRent - cash);
            const G = {
              fr: {
                title: 'Que faire ce soir ?', now: 'À faire maintenant',
                steps: [
                  'Au comptoir : négocie avec tes mots, vérifie avec Loupe, UV et Radio, achète sous la valeur de rue.',
                  'Ici, au coffre : ouvre les pièces ✦ à double fond (une énigme, une récompense), nettoie, puis revends vite ou aux enchères.',
                  'Pistes : achète l’objet-clé d’une enquête, un client viendra le réclamer plus tard et paiera cher.',
                  'Chaque soir : paye le loyer (sinon la boutique est saisie) et planque du cash en Suisse pour survivre à la ruine.',
                ],
                debt: `Rembourse ${money(debt)} au Syndicat : c’est inclus dans le loyer de ce soir.`,
                rent: `Il te manque ${money(missing)} pour le loyer de ce soir : revends une pièce.`,
                secrets: `${open} pièce${open > 1 ? 's' : ''} à double fond à examiner ✦ (récompense à la clé).`,
                arcs: `${arcsOpen} piste${arcsOpen > 1 ? 's' : ''} ouverte${arcsOpen > 1 ? 's' : ''} : un client viendra réclamer l’objet-clé.`,
                buy: 'Rien d’urgent : retourne au comptoir pour le prochain client.',
              },
              en: {
                title: 'What to do tonight?', now: 'To do now',
                steps: [
                  'At the counter: negotiate with your own words, check with Loupe, UV and Radio, buy below street value.',
                  'Here, in the vault: open the ✦ false-bottom pieces (one riddle, one reward), clean, then flip fast or at auction.',
                  'Cases: buy the key item of an investigation; a client will come to claim it later and pay well.',
                  'Every night: pay the rent (or the shop is seized) and stash cash in Switzerland to survive a bust.',
                ],
                debt: `Repay ${money(debt)} to the Syndicate: it is included in tonight’s rent.`,
                rent: `You are ${money(missing)} short for tonight’s rent: sell a piece.`,
                secrets: `${open} false-bottom piece${open > 1 ? 's' : ''} to examine ✦ (a reward is waiting).`,
                arcs: `${arcsOpen} open case${arcsOpen > 1 ? 's' : ''}: a client will come to claim the key item.`,
                buy: 'Nothing urgent: head back to the counter for the next client.',
              },
              es: {
                title: '¿Qué hacer esta noche?', now: 'Por hacer ahora',
                steps: [
                  'En el mostrador: negocia con tus palabras, comprueba con Lupa, UV y Radio, compra por debajo del valor de calle.',
                  'Aquí, en la caja fuerte: abre las piezas ✦ de doble fondo (un acertijo, una recompensa), limpia y luego revende rápido o en subasta.',
                  'Casos: compra el objeto clave de una investigación; un cliente vendrá a reclamarlo y pagará bien.',
                  'Cada noche: paga el alquiler (si no, te embargan la tienda) y guarda efectivo en Suiza para sobrevivir a la ruina.',
                ],
                debt: `Devuelve ${money(debt)} al Sindicato: va incluido en el alquiler de esta noche.`,
                rent: `Te faltan ${money(missing)} para el alquiler de esta noche: vende una pieza.`,
                secrets: `${open} pieza${open > 1 ? 's' : ''} de doble fondo por examinar ✦ (hay recompensa).`,
                arcs: `${arcsOpen} caso${arcsOpen > 1 ? 's' : ''} abierto${arcsOpen > 1 ? 's' : ''}: un cliente vendrá a reclamar el objeto clave.`,
                buy: 'Nada urgente: vuelve al mostrador para el siguiente cliente.',
              },
            }[L];
            const todo = [
              ...(debt > 0 ? [G.debt] : []),
              ...(missing > 0 ? [G.rent] : []),
              ...(open > 0 ? [G.secrets] : []),
              ...(arcsOpen > 0 ? [G.arcs] : []),
            ];
            if (!todo.length) todo.push(G.buy);
            return (
              <div className="space-y-3 border border-amber-500/40 bg-amber-500/5 p-4 font-mono">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">{G.now}</p>
                <ul className="space-y-1 text-xs text-zinc-100">
                  {todo.map((x) => (
                    <li key={x}>→ {x}</li>
                  ))}
                </ul>
                <details open={day <= 2} className="border-t border-white/10 pt-2">
                  <summary className="cursor-pointer text-[11px] uppercase tracking-wider text-zinc-400 hover:text-amber-300">{G.title}</summary>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[12px] leading-relaxed text-zinc-300">
                    {G.steps.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ol>
                </details>
              </div>
            );
          })()}
          <div className="border-t-2 border-amber-500/60 bg-[#0b0d12] border-x border-b border-white/10 p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-400">
                {t.backroomNight(day)}
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wider text-zinc-100">
                {t.syndicateLedger}
              </h2>
              <p className="font-mono text-xs text-zinc-400">
                {t.taxSub(formatMoney(rentShare, gameLocale), auctionsToday)}
              </p>
              {nightEvent && (
                <p className="font-mono text-xs text-amber-300">
                  {t.eventLabel} ({nightEvent.title}) : {nightEvent.effectText}
                </p>
              )}
              {heatRaid && (
                <p className="font-mono text-xs text-red-300">
                  {t.raidAlert}
                </p>
              )}
              {raidNote && (
                <p
                  className={`font-mono text-xs ${
                    raidNote.startsWith('Couvre-feu') || raidNote.includes('15 %') ? 'text-emerald-300' : 'text-red-400'
                  }`}
                >
                  {raidNote}
                </p>
              )}
            </div>
            <button
              onClick={payRentAndNextDay}
              className="brass px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-[#1a1206] transition-transform hover:scale-[1.02]"
            >
              {t.payRentBtn(formatMoney(dailyRent, gameLocale), day + 1)}
            </button>
          </div>

          {/* Compte Offshore Suisse */}
          <div className="border border-emerald-500/30 bg-[#0a0f0d] p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-300">
                {t.swissBankTitle(formatMoney(swissBank, gameLocale))}
              </h3>
              <p className="font-mono text-[11px] text-zinc-400 mt-0.5">
                {t.swissBankDesc}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {swissBank >= 500 && (
                <button
                  onClick={() => withdrawFromSwiss(500)}
                  className="border border-amber-400/50 bg-amber-500/15 hover:bg-amber-500/30 px-3 py-1.5 font-mono text-xs font-semibold text-amber-200"
                >
                  {t.withdrawSwiss}
                </button>
              )}
              <button
                disabled={cash < 500}
                onClick={() => transferToSwiss(500)}
                className="border border-white/15 bg-black/50 hover:border-white/35 disabled:opacity-40 px-3 py-1.5 font-mono text-xs text-zinc-200"
              >
                {t.transfer500}
              </button>
              <button
                disabled={cash < 1500}
                onClick={() => transferToSwiss(1500)}
                className="border border-emerald-500/45 bg-emerald-500/15 hover:bg-emerald-500/30 disabled:opacity-40 px-3 py-1.5 font-mono text-xs font-semibold text-emerald-300"
              >
                {t.transfer1500}
              </button>
            </div>
          </div>

          {/* Pouvoirs tactiques des pièces gardées sur l'étagère */}
          {(inventory.some((i) => /passeport/i.test(i.name)) ||
            inventory.some((i) => /téléphone.*député/i.test(i.name))) && (
            <div className="border border-amber-500/35 bg-amber-950/20 p-3.5 flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-xs text-amber-200">
                {t.tacticalUsage}
              </span>
              <div className="flex flex-wrap gap-2">
                {inventory.some((i) => /passeport/i.test(i.name)) && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = inventory.find((i) => /passeport/i.test(i.name));
                      if (!target) return;
                      sound.playDealSuccess();
                      setInventory((inv) => inv.filter((i) => i.id !== target.id));
                      setCityHeat(15);
                      setRaidNote(t.burnPassportNote);
                    }}
                    className="border border-sky-400/50 bg-sky-500/15 px-3 py-1.5 font-mono text-xs font-semibold text-sky-200 hover:bg-sky-500/30"
                  >
                    {t.burnPassport}
                  </button>
                )}
                {inventory.some((i) => /téléphone.*député/i.test(i.name)) && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = inventory.find((i) => /téléphone.*député/i.test(i.name));
                      if (!target) return;
                      const discount = Math.round(dailyRent * 0.4);
                      sound.playDealSuccess();
                      setInventory((inv) => inv.filter((i) => i.id !== target.id));
                      setCash((c) => c + discount);
                      setRaidNote(t.callContactNote(formatMoney(discount, gameLocale)));
                    }}
                    className="border border-amber-400/50 bg-amber-500/15 px-3 py-1.5 font-mono text-xs font-semibold text-amber-200 hover:bg-amber-500/30"
                  >
                    {t.callContact}
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            <h3 className="font-mono text-xs uppercase tracking-widest text-zinc-400">
              {t.vaultTitle(inventory.length)}
            </h3>

            {inventory.length === 0 ? (
              <div className="border border-white/10 bg-[#0b0d12] p-6 text-center font-mono text-xs text-zinc-500">
                {t.vaultEmpty}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inventory.map((item) => {
                  const blind = jokerIds.includes('a-l-aveugle') ? 1.6 : 1;
                  const fastPrice = Math.round(item.streetValue * 0.7 * blind);
                  const auctionPrice = Math.round(
                    item.streetValue * (item.cleaned ? 1.3 : 1.15) * blind,
                  );
                  return (
                    <div
                      key={item.id}
                      className="border border-white/15 bg-[#0a0c10] p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-100">
                            {item.name}
                          </h4>
                          <p className="font-mono text-[11px] text-zinc-400 mt-0.5">
                            {item.faction} · {t.paidLabel(formatMoney(item.paid, gameLocale))}
                          </p>
                          {item.modifier && (
                            <p
                              className={`mt-0.5 font-mono text-[10px] uppercase tracking-wider ${
                                item.modifier === 'contrefacon'
                                  ? 'text-red-400'
                                  : item.modifier === 'collection'
                                    ? 'text-amber-300'
                                    : 'text-sky-400'
                              }`}
                            >
                              {item.modifier === 'traceur'
                                ? t.modGps
                                : item.modifier === 'collection'
                                  ? t.modCollection
                                  : t.modCounterfeit}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 border ${
                            item.cleaned
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                              : 'bg-red-950/40 border-red-500/40 text-red-300'
                          }`}
                        >
                          {item.cleaned ? t.cleanedBadge : item.hotLevel}
                        </span>
                      </div>

                      {item.secretId && item.secretState && (
                        <div className="space-y-2 border-t border-white/10 pt-2 font-mono">
                          {item.secretState === 'open' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenSecretId((cur) => (cur === item.id ? null : item.id));
                                  setSecretInput('');
                                }}
                                className="w-full border border-amber-400/60 bg-amber-500/10 px-2.5 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider text-amber-300 hover:bg-amber-500/20"
                              >
                                {SECRET_UI[gameLocale].badge} · {openSecretId === item.id ? SECRET_UI[gameLocale].close : SECRET_UI[gameLocale].examine}
                              </button>
                              {openSecretId === item.id && (() => {
                                const c = secretContent(item.secretId!, gameLocale);
                                if (!c) return null;
                                return (
                                  <div className="space-y-2 border border-amber-500/30 bg-black/50 p-3 text-[12px] text-zinc-200">
                                    <p className="whitespace-pre-line leading-relaxed">{c.note}</p>
                                    {showHint[item.id] && <p className="text-[11px] text-sky-300">{c.hint}</p>}
                                    <div className="flex flex-wrap items-center gap-2">
                                      <input
                                        value={secretInput}
                                        onChange={(e) => setSecretInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && submitSecret(item)}
                                        placeholder={SECRET_UI[gameLocale].placeholder}
                                        maxLength={24}
                                        className="min-w-0 flex-1 border border-white/20 bg-black/60 px-2 py-1.5 text-xs text-zinc-100"
                                      />
                                      <button type="button" onClick={() => submitSecret(item)} className="brass px-3 py-1.5 text-xs font-bold uppercase text-[#1a1206]">
                                        {SECRET_UI[gameLocale].submit}
                                      </button>
                                      <button type="button" onClick={() => setShowHint((h) => ({ ...h, [item.id]: true }))} className="border border-white/20 px-2 py-1.5 text-[11px] uppercase text-zinc-300">
                                        {SECRET_UI[gameLocale].hint}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })()}
                              <p className="text-[10px] text-zinc-500">{SECRET_UI[gameLocale].lostOnSale}</p>
                            </>
                          ) : null}
                          {secretMsg[item.id] && (
                            <p className={`text-[11px] ${item.secretState === 'solved' ? 'text-emerald-300' : item.secretState === 'burned' ? 'text-red-300' : 'text-amber-300'}`}>{secretMsg[item.id]}</p>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1 font-mono">
                        {!item.cleaned && (
                          <button
                            onClick={() => cleanItem(item.id)}
                            className="text-[11px] bg-black/60 hover:bg-zinc-800 border border-white/15 px-2.5 py-1.5 text-zinc-200"
                          >
                            {t.cleanBtn}
                          </button>
                        )}
                        <button
                          onClick={() => sellItem(item.id, 'fast')}
                          className="text-[11px] bg-black/60 hover:bg-zinc-800 border border-white/15 px-2.5 py-1.5 text-zinc-200"
                        >
                          {t.fastSellBtn(formatMoney(fastPrice, gameLocale))}
                        </button>
                        <button
                          onClick={() => sellItem(item.id, 'auction')}
                          className="brass text-[11px] font-bold px-2.5 py-1.5 text-[#1a1206]"
                        >
                          {t.auctionBtn(formatMoney(auctionPrice, gameLocale))}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Collection des 6 Énigmes (Pistes) */}
          <div className="border border-white/10 bg-[#0b0d12] p-4 space-y-2.5">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-200">
              {t.arcsTitle(
                STORY_ARCS.filter((a) => arcNotes.some((n) => n.arcId === a.id && n.resolved)).length,
                STORY_ARCS.length,
              )}
            </h3>
            <p className="font-mono text-[11px] leading-relaxed text-zinc-400">
              {gameLocale === 'en'
                ? 'Buy the key item of a case (●): a client will come back to claim it and pay well. ○ not opened yet · ✓ solved.'
                : gameLocale === 'es'
                  ? 'Compra el objeto clave de un caso (●): un cliente volverá a reclamarlo y pagará bien. ○ sin abrir · ✓ resuelto.'
                  : 'Achète l’objet-clé d’une piste (●) : un client reviendra le réclamer et paiera cher. ○ pas encore ouverte · ✓ résolue.'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STORY_ARCS.map((arc) => {
                const solved = arcNotes.some((n) => n.arcId === arc.id && n.resolved);
                const active = arcNotes.some((n) => n.arcId === arc.id && !n.resolved);
                return (
                  <div
                    key={arc.id}
                    className={`border px-2.5 py-1.5 font-mono text-[11px] ${
                      solved
                        ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                        : active
                          ? 'border-amber-500/40 bg-amber-950/20 text-amber-200'
                          : 'border-white/10 bg-black/40 text-zinc-500'
                    }`}
                  >
                    {solved ? '✓ ' : active ? '● ' : '○ '}
                    {localizeArcTitle(arc.id, arc.title, gameLocale)}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border border-white/10 bg-[#0b0d12] p-4 space-y-2.5">
            <button
              type="button"
              onClick={() => setShowRegistry((v) => !v)}
              className="flex w-full items-center justify-between font-mono text-xs font-semibold uppercase tracking-wider text-zinc-200"
            >
              <span>
                {gameLocale === 'en' ? 'Client ledger' : gameLocale === 'es' ? 'Registro de clientes' : 'Registre des clients'} ({registry.length})
              </span>
              <span className="text-zinc-500">{showRegistry ? '−' : '+'}</span>
            </button>
            {showRegistry &&
              (registry.length === 0 ? (
                <p className="font-mono text-[11px] text-zinc-500">
                  {gameLocale === 'en' ? 'No client yet.' : gameLocale === 'es' ? 'Aún no hay clientes.' : 'Aucun client pour l’instant.'}
                </p>
              ) : (
                <ul className="max-h-80 space-y-1.5 overflow-y-auto thin-scroll">
                  {[...registry].reverse().slice(0, 30).map((r) => {
                    const visits = registry.filter((x) => x.castId && x.castId === r.castId).length;
                    const label =
                      r.result === 'deal'
                        ? gameLocale === 'en' ? `Bought $${formatMoney(r.paid, gameLocale)} (street ~$${formatMoney(r.street, gameLocale)})` : gameLocale === 'es' ? `Comprado ${formatMoney(r.paid, gameLocale)} $ (calle ~${formatMoney(r.street, gameLocale)} $)` : `Acheté ${formatMoney(r.paid, gameLocale)} $ (rue ~${formatMoney(r.street, gameLocale)} $)`
                        : r.result === 'trap'
                          ? gameLocale === 'en' ? 'Fell for a sting' : gameLocale === 'es' ? 'Caíste en una trampa' : 'Tombé dans une souricière'
                          : r.result === 'gun'
                            ? gameLocale === 'en' ? 'Held you up' : gameLocale === 'es' ? 'Te atracó' : 'T’a braqué'
                            : gameLocale === 'en' ? 'Walked out / passed' : gameLocale === 'es' ? 'Se fue / rechazado' : 'Parti / refusé';
                    return (
                      <li key={r.id} className="flex items-center gap-2.5 border border-white/5 bg-black/30 p-1.5 font-mono text-[11px]">
                        <img
                          src={`/assets/portraits/${resolveCastPortrait(r.castId, r.gender, r.name, r.job)}.webp`}
                          alt=""
                          loading="lazy"
                          className="h-10 w-10 shrink-0 object-cover object-top"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-zinc-100">
                            {r.name}
                            {visits > 1 ? ` ×${visits}` : ''}
                          </span>
                          <span className="block truncate text-zinc-500">{localizeArchetype(r.job, gameLocale)} · {gameLocale === 'en' ? 'Day' : gameLocale === 'es' ? 'Día' : 'Jour'} {r.day}</span>
                        </span>
                        <span className={`shrink-0 text-right ${r.result === 'deal' ? 'text-emerald-300' : 'text-red-300'}`}>{label}</span>
                      </li>
                    );
                  })}
                </ul>
              ))}
          </div>
        </main>
      )}

      {/* TAB: SHOP / UPGRADES & MONETIZATION */}
      {tab === 'shop' && (
        <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400">
              {t.arsenalTag}
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wider text-zinc-100">
              {t.arsenalTitle}
            </h2>
            <p className="font-mono text-xs text-zinc-400">
              {t.arsenalDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                key: 'uvLamp' as const,
                title: t.upgrades.uvLamp.title,
                cost: 800,
                desc: t.upgrades.uvLamp.desc,
              },
              {
                key: 'armoredDoor' as const,
                title: t.upgrades.armoredDoor.title,
                cost: 1200,
                desc: t.upgrades.armoredDoor.desc,
              },
              {
                key: 'gpsJammer' as const,
                title: t.upgrades.gpsJammer.title,
                cost: 1500,
                desc: t.upgrades.gpsJammer.desc,
              },
            ].map((up) => {
              const owned = upgrades[up.key];
              return (
                <div
                  key={up.key}
                  className="border border-white/15 bg-[#0a0c10] p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-100">
                        {up.title}
                      </h3>
                      {owned ? (
                        <Unlock className="w-4 h-4 shrink-0 text-emerald-400" />
                      ) : (
                        <Lock className="w-4 h-4 shrink-0 text-zinc-500" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{up.desc}</p>
                  </div>
                  <button
                    disabled={owned || cash < up.cost}
                    onClick={() => buyUpgrade(up.key, up.cost)}
                    className={`w-full py-2 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                      owned
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/35'
                        : 'brass text-[#1a1206] disabled:opacity-40'
                    }`}
                  >
                    {owned ? t.equipped : t.buyUpgrade(formatMoney(up.cost, gameLocale))}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Méta-Empire : Actifs de la Ville & Quartiers */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                  {t.empireTag}
                </p>
                <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wider text-zinc-100">
                  {t.empireTitle}
                </h2>
                <p className="font-mono text-xs text-zinc-400">
                  {t.empireDesc}
                </p>
              </div>
              <span className="font-mono text-sm font-semibold text-emerald-400">
                {t.swissBalance(formatMoney(swissBank, gameLocale))}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CITY_ASSETS.map((asset) => {
                const owned = cityAssets.includes(asset.id);
                const locAsset = t.cityAssets[asset.id] ?? asset;
                return (
                  <div
                    key={asset.id}
                    className="border border-white/15 bg-[#0a0c10] p-5 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <span className="inline-block text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 uppercase tracking-wider">
                        {locAsset.tag}
                      </span>
                      <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-100">
                        {locAsset.name}
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">{locAsset.desc}</p>
                    </div>
                    <button
                      disabled={owned || swissBank < asset.costSwiss}
                      onClick={() => buyCityAsset(asset)}
                      className={`w-full py-2 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                        owned
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/35'
                          : 'border border-emerald-500/50 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 disabled:opacity-40'
                      }`}
                    >
                      {owned
                        ? t.assetOwned
                        : t.buyAsset(formatMoney(asset.costSwiss, gameLocale))}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {DISTRICTS.map((dist) => {
                const unlocked = swissBank >= dist.unlockSwiss;
                const active = districtId === dist.id;
                const locDist = t.districts[dist.id] ?? dist;
                return (
                  <button
                    key={dist.id}
                    disabled={!unlocked}
                    onClick={() => {
                      setDistrictId(dist.id);
                      setTab('counter');
                      startNewCase(
                        generateProceduralCase(day, cityHeat, lastMemory || undefined, dist.multiplier, gameLocale),
                      );
                    }}
                    className={`text-left p-4 border transition-colors ${
                      active
                        ? 'bg-amber-500/15 border-amber-500/50'
                        : unlocked
                          ? 'bg-[#0a0c10] border-white/15 hover:border-white/35'
                          : 'bg-zinc-950 border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-xs font-semibold uppercase tracking-wider">
                      <span className={active ? 'text-amber-300' : 'text-zinc-200'}>
                        {locDist.name}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {unlocked
                          ? active
                            ? t.districtActive
                            : t.districtOpen
                          : t.districtRequired(formatMoney(dist.unlockSwiss, gameLocale))}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1.5">{locDist.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* TAB: PANTHEON (CODEX, FACTIONS, RIVAUX, SAISON) */}
      {tab === 'pantheon' && (
        <PantheonView
          locale={gameLocale}
          todayStr={todayStr}
          codexDiscovered={codexDiscovered}
          factionRep={factionRep}
          seasonXp={seasonXp}
          rivals={rivals}
          marketTrends={marketTrends}
          marketHeadline={marketHeadline}
          playerNetWorth={cash + swissBank + totalProfit}
          historyLog={historyLog}
          completedEpisodes={completedEpisodes}
          onStartEpisode={startSeasonEpisode}
          questProgress={questProgress}
          claimedQuestIds={claimedQuestIds}
          loginStreak={loginStreak}
          unlockedAchievements={unlockedAchievements}
        />
      )}

      {/* TAB: COUNTER (DAY) OR DAILY CONTRACT (FOMO) */}
      {(tab === 'counter' || tab === 'daily') && (
        <main className="relative min-h-0 flex-1 overflow-hidden bg-black select-none">
          <ShopBackdrop
            districtId={districtId}
            inventory={inventory}
            cityAssets={cityAssets}
            arcNotes={arcNotes}
            onOpenStock={() => setTab('night')}
            onOpenEmpire={() => setTab('shop')}
          />
          <FilmOverlay />

          <div className="relative z-20 flex h-full min-h-0 flex-col justify-between overflow-y-auto lg:overflow-hidden lg:grid lg:grid-cols-[21rem_minmax(0,1fr)_21rem] lg:grid-rows-[minmax(0,1fr)_auto] lg:gap-x-6 lg:gap-y-3 lg:px-6 lg:pt-4">
            {/* ==================== HAUT : HUD & CARNET DE COMPTOIR ==================== */}
            <div className="pointer-events-none relative z-30 flex flex-col gap-2 p-2 sm:p-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-6 sm:pt-4 lg:contents">
              {/* Gauche : HUD sobre typographique avec fond sombre protecteur */}
              <div className="pointer-events-auto flex w-full max-w-md flex-col gap-2 rounded-sm border border-white/10 bg-black/85 p-2 sm:p-3 sm:gap-2.5 backdrop-blur-md drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] lg:col-start-1 lg:row-start-1 lg:max-w-none lg:self-start">
                <div className="flex items-baseline justify-between gap-2 sm:gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                      {currentCase.isBoss && (
                        <span className="bg-red-600/90 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white sm:text-[11px]">
                          BOSS · {currentCase.bossTitle}
                        </span>
                      )}
                      <span className="font-[family-name:var(--font-display)] text-xl tracking-wider text-zinc-100 uppercase sm:text-3xl">
                        {currentCase.name}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400 uppercase sm:text-[11px]">
                        {currentCase.age} {gameLocale === 'en' ? 'Y.O.' : gameLocale === 'es' ? 'AÑOS' : 'ANS'} · {localizeArchetype(currentCase.displayArchetype ?? currentCase.archetype, gameLocale)}
                      </span>
                    </div>
                    <p className="truncate font-mono text-[10px] uppercase tracking-widest text-amber-400/90 sm:text-[11px]">
                      {localizeItemName(currentCase.item.name, gameLocale)} · {localizeFaction(currentCase.faction, gameLocale)}
                    </p>
                  </div>

                  {/* Prix demandé massif + boutons rapides intégrés sur mobile */}
                  <div className="shrink-0 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="text-right">
                        <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 sm:text-[11px]">
                          {currentCase.gender === 'f' ? t.askingShe : t.askingHe}
                        </span>
                        <span className="font-[family-name:var(--font-display)] text-2xl leading-none tracking-wider text-amber-300 sm:text-4xl">
                          {gameLocale === 'en' ? `$${formatMoney(askedPrice, gameLocale)}` : `${formatMoney(askedPrice, gameLocale)} $`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 lg:hidden">
                        {tab === 'counter' && (
                          <button
                            onClick={rerollClient}
                            title={gameLocale === 'en' ? `Next client (${rerollsLeft} left)` : `Suivant (${rerollsLeft} restants)`}
                            className="flex items-center gap-1 border border-white/15 bg-black/80 px-2 py-1 font-mono text-[10px] text-zinc-300 hover:border-amber-400/50 hover:text-white"
                          >
                            <RotateCcw className="h-3 w-3" /> {rerollsLeft}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowBrief((v) => !v)}
                          title={gameLocale === 'en' ? 'How to play' : 'Comment jouer'}
                          className="border border-white/15 bg-black/80 px-2 py-1 font-mono text-[10px] text-zinc-400 hover:text-amber-300"
                        >
                          ?
                        </button>
                      </div>
                    </div>
                    {priceTrail.length > 1 && (
                      <span
                        title={priceTrail.map((p) => (gameLocale === 'en' ? `$${formatMoney(p, gameLocale)}` : `${formatMoney(p, gameLocale)} $`)).join(' → ')}
                        className="mt-0.5 block whitespace-nowrap font-mono text-[10px] text-emerald-400 sm:text-[11px]"
                      >
                        <s className="text-zinc-500">{gameLocale === 'en' ? `$${formatMoney(priceTrail[0], gameLocale)}` : `${formatMoney(priceTrail[0], gameLocale)} $`}</s>{' '}
                        −{((priceTrail[0] - askedPrice) / Math.max(1, priceTrail[0]) * 100).toFixed(0)} %
                      </span>
                    )}
                  </div>
                </div>

                {/* Jauges segmentées façon moniteur analogique */}
                <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-1 sm:gap-3 sm:pt-1.5 font-mono text-[10px] sm:text-[11px]">
                  {[
                    {
                      label: t.fear,
                      val: gauges.peur,
                      delta: gaugeDeltas.peur,
                      key: `p-${gaugeDeltas.key}`,
                      title: 'Plus il a peur, plus son prix plancher baisse',
                      labelCls: 'text-amber-300/90',
                      fillCls: 'bg-amber-400',
                      deltaCls: 'text-amber-300',
                    },
                    {
                      label: t.anger,
                      val: gauges.colere,
                      delta: gaugeDeltas.colere,
                      key: `c-${gaugeDeltas.key}`,
                      title: 'À 80% il dégaine son arme',
                      labelCls: gauges.colere >= 60 ? 'animate-pulse font-bold text-red-400' : 'text-zinc-400',
                      fillCls: gauges.colere >= 60 ? 'bg-red-500' : 'bg-orange-400',
                      deltaCls: 'text-red-400',
                    },
                    {
                      label: t.suspicion,
                      val: gauges.mefiance,
                      delta: gaugeDeltas.mefiance,
                      key: `m-${gaugeDeltas.key}`,
                      title: 'À 88% il claque la porte',
                      labelCls: 'text-sky-300/90',
                      fillCls: 'bg-sky-400',
                      deltaCls: 'text-sky-300',
                    },
                  ].map((g) => (
                    <div key={g.label} className="relative" title={g.title}>
                      <div className={`mb-1 flex justify-between ${g.labelCls}`}>
                        <span>{g.label}</span>
                        <span>{g.val}%</span>
                      </div>
                      <div className="grid grid-cols-10 gap-0.5">
                        {Array.from({ length: 10 }, (_, idx) => (
                          <span
                            key={idx}
                            className={`h-1.5 transition-colors duration-200 ${
                              g.val >= (idx + 1) * 10 ? g.fillCls : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                      {Boolean(g.delta) && (
                        <span
                          key={g.key}
                          className={`animate-float-delta pointer-events-none absolute -top-3 right-0 font-bold ${g.deltaCls}`}
                        >
                          {(g.delta ?? 0) > 0 ? `+${g.delta}` : g.delta}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Étagère & Stock actuel : parfaitement intégré en flux naturel, zéro collision */}
                <div className="hidden items-center justify-between border-t border-white/10 pt-1.5 font-mono text-[11px] lg:flex">
                  <button
                    type="button"
                    onClick={() => setTab('night')}
                    className="flex items-center gap-1.5 uppercase tracking-wider text-amber-300/80 hover:text-amber-200 transition-colors"
                  >
                    <span>{t.shelf} ({inventory.length}/6)</span>
                    <span className="text-zinc-500 hover:text-amber-400">{t.vaultArrow}</span>
                  </button>
                  {inventory.length > 0 ? (
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      {inventory.slice(0, 3).map((it) => (
                        <span
                          key={it.id}
                          className="max-w-[80px] truncate border-b border-amber-900/40 text-[11px] text-zinc-300"
                          title={`${localizeItemName(it.name, gameLocale)} (${gameLocale === 'en' ? '$' + formatMoney(it.paid, gameLocale) : formatMoney(it.paid, gameLocale) + ' $'})`}
                        >
                          {localizeItemName(it.name, gameLocale)}
                        </span>
                      ))}
                      {inventory.length > 3 && (
                        <span className="text-zinc-500 text-[10px]">+{inventory.length - 3}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] italic text-zinc-600">{t.emptyShelf}</span>
                  )}
                </div>

                {/* Pistes actives (si présentes) */}
                {arcNotes.filter((n) => !n.resolved).length > 0 && (
                  <div className="hidden space-y-0.5 border-l border-amber-500/60 bg-black/40 pl-2 py-0.5 font-mono text-[11px] lg:block">
                    <div className="text-amber-300/90 font-semibold uppercase tracking-wider">
                      {gameLocale === 'en' ? 'Leads' : gameLocale === 'es' ? 'Pistas' : 'Pistes'} ({arcNotes.filter((n) => !n.resolved).length})
                    </div>
                    {arcNotes.filter((n) => !n.resolved).slice(0, 1).map((n) => (
                      <div key={n.arcId} className="truncate text-zinc-400 text-[10px]">
                        <span className="text-amber-200">{localizeArcTitle(n.arcId, n.title, gameLocale)}:</span> {localizeArcNote(n.arcId, n.note, gameLocale)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Droite : Contrôles rapides + Carnet d'indices physique */}
              <div className="pointer-events-auto flex w-full flex-col items-end gap-2 sm:w-auto sm:max-w-xs lg:col-start-3 lg:row-start-1 lg:w-full lg:max-w-none lg:self-start">
                <div className="hidden lg:flex items-center gap-1.5">
                  {tab === 'counter' && (
                    <button
                      onClick={rerollClient}
                      title={gameLocale === 'en' ? `Next client (${rerollsLeft} left)` : `Suivant (${rerollsLeft} restants)`}
                      className="flex items-center gap-1 border border-white/15 bg-black/80 px-2.5 py-1 font-mono text-[10px] text-zinc-300 hover:border-amber-400/50 hover:text-white"
                    >
                      <RotateCcw className="h-3 w-3" /> {rerollsLeft}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowBrief((v) => !v)}
                    title={gameLocale === 'en' ? 'How to play' : 'Comment jouer'}
                    className="border border-white/15 bg-black/80 px-2 py-1 font-mono text-[10px] text-zinc-400 hover:text-amber-300"
                  >
                    ?
                  </button>
                </div>

                <div className="hidden w-full rounded-sm border border-white/10 bg-black/55 p-3 backdrop-blur-sm lg:block">{itemProp}</div>

                {/* Carnet de notes / indices découverts */}
                {(inspected ||
                  uvScanned ||
                  radioOpen ||
                  history.length >= 3 ||
                  currentCase.arcId ||
                  (cityAssets.includes('lookout') && currentCase.isTrap)) && (
                  <div className="w-full max-h-36 overflow-y-auto thin-scroll space-y-1.5 border border-amber-500/30 bg-[#12100b]/95 p-2 font-mono text-[10px] sm:text-[11px] sm:p-2.5 shadow-2xl backdrop-blur-md lg:max-h-none">
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-1 text-[9px] uppercase tracking-widest text-amber-400/80">
                      <span>{t.counterNotebook}</span>
                      <span>{t.confidential}</span>
                    </div>

                    {cityAssets.includes('lookout') && currentCase.isTrap && outcome === 'active' && (
                      <p className="font-bold text-red-400">
                        {t.lookoutAlert}
                      </p>
                    )}

                    {currentCase.arcId && (
                      <div className="space-y-1 border-l-2 border-amber-400 bg-amber-500/10 py-1 pl-2">
                        <p className="text-[10px] font-bold uppercase text-amber-300">
                          {t.arcTrack(currentCase.arcStep || 1, currentCase.arcTitle || '')}
                        </p>
                        {currentCase.arcStep === 2 && outcome === 'active' && (
                          inventory.some((i) => i.arcItemKey === currentCase.requiresItemKey) ? (
                            <button
                              type="button"
                              onClick={resolveArcStep2}
                              className="w-full border border-emerald-400/60 bg-emerald-500/25 px-2 py-1 text-[10px] font-bold text-emerald-200 hover:bg-emerald-500/40"
                            >
                              {t.arcDeliver(formatMoney(currentCase.arcRewardCash || 0, gameLocale))}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={abandonArcStep2}
                              className="text-[10px] text-red-300 underline"
                            >
                              {t.arcClose}
                            </button>
                          )
                        )}
                      </div>
                    )}

                    {history.length >= FLAW_REVEAL_TURNS && (() => {
                      const castChar = currentCase.castId
                        ? CAST_ROSTER.find((c) => c.id === currentCase.castId)
                        : null;
                      const profile = findProfileForArchetype(currentCase.archetype);
                      const isF = currentCase.gender === 'f';
                      const weakness = localizeCastText(
                        castChar
                          ? castChar.weaknessHint
                          : (isF && profile.femaleWeaknessHint) ? profile.femaleWeaknessHint : profile.weaknessHint,
                        gameLocale,
                      );
                      const redLine = localizeCastText(
                        castChar
                          ? castChar.redLineHint
                          : (isF && profile.femaleRedLineHint) ? profile.femaleRedLineHint : profile.redLineHint,
                        gameLocale,
                      );
                      return (
                        <div className="space-y-0.5 text-[10px] text-zinc-300">
                          <p>
                            <span className="text-amber-400">{t.flawLabel}</span> {weakness}
                          </p>
                          <p>
                            <span className="text-red-400">{t.redLineLabel}</span> {redLine}
                          </p>
                        </div>
                      );
                    })()}

                    {inspected && (
                      <div className="flex items-start justify-between gap-2 border-t border-white/10 pt-1 text-amber-200">
                        <span>{t.loupe} : {localizeItemText(currentCase.item.hiddenClue, gameLocale)}</span>
                        {outcome === 'active' && (
                          <button
                            onClick={() => confrontWithClue(false)}
                            disabled={loading || grilled.loupe}
                            className="shrink-0 border border-amber-400/50 bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-300 hover:bg-amber-500/35"
                          >
                            {t.clueGrill}
                          </button>
                        )}
                      </div>
                    )}

                    {uvScanned && (
                      <div className="flex items-start justify-between gap-2 border-t border-white/10 pt-1 text-sky-300">
                        <span>{t.uv} : {localizeItemText(currentCase.item.uvClue, gameLocale)}</span>
                        {outcome === 'active' && (
                          <button
                            onClick={() => confrontWithClue(true)}
                            disabled={loading || grilled.uv}
                            className="shrink-0 border border-sky-400/50 bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-sky-200 hover:bg-sky-500/35"
                          >
                            {t.clueGrill}
                          </button>
                        )}
                      </div>
                    )}

                    {radioOpen && (
                      <div className="flex items-start justify-between gap-2 border-t border-white/10 pt-1 text-[10px] text-red-300">
                        <span>{t.radio} : {currentCase.policeRadioBrief}</span>
                        {outcome === 'active' && (
                          <button
                            onClick={() => {
                              setGrilled((g) => ({ ...g, radio: true }));
                              void sendMessage(
                                gameLocale === 'en'
                                  ? `(Turn up police scanner volume towards the counter.) Listen to the brigade frequency: alert on ${currentCase.item.name} and ${currentCase.faction}.`
                                  : gameLocale === 'es'
                                    ? `(Subes el volumen de la radio policial hacia el mostrador.) Escucha la frecuencia: aviso sobre ${currentCase.item.name} y ${currentCase.faction}.`
                                    : `(Tu montes le son du scanner police vers le comptoir.) Écoute la fréquence brigade : alerte sur ${currentCase.item.name} et ${currentCase.faction}.`,
                                undefined,
                                true,
                              );
                            }}
                            disabled={loading || grilled.radio}
                            className="shrink-0 border border-red-400/50 bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-200 hover:bg-red-500/35"
                          >
                            {t.clueGrill}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Contrat 24h en mode Daily */}
                {tab === 'daily' && (
                  <div className="w-full space-y-1 border border-amber-500/40 bg-black/85 p-2 font-mono text-[10px]">
                    <div className="flex items-center justify-between text-amber-300">
                      <span className="font-bold">{t.dailyContractHeader}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400">{formatCountdown(countdown)}</span>
                        <button
                          type="button"
                          onClick={() => setShowDailyScores((v) => !v)}
                          className="lg:hidden border border-amber-400/40 bg-amber-500/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-amber-200 hover:bg-amber-500/20 active:scale-95 transition-transform"
                        >
                          {showDailyScores ? 'Masquer ▲' : 'Scores ▼'}
                        </button>
                      </div>
                    </div>
                    <div className={`${showDailyScores ? 'block' : 'hidden lg:block'} space-y-1 pt-1`}>
                    {streak > 0 && (
                      <p className="text-emerald-400">
                        {t.dailyStreakBonus(streak, Math.min(700, streak * 100))}
                      </p>
                    )}
                    {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default' && (
                      <button
                        type="button"
                        onClick={() => void Notification.requestPermission()}
                        className="w-full border border-white/15 bg-white/5 px-2 py-0.5 text-left text-[9px] text-zinc-300 hover:border-amber-400/50 hover:text-amber-200"
                      >
                        {t.dailyReminderBtn}
                      </button>
                    )}
                    <div className="flex gap-1">
                      {(['margin', 'discount', 'speed'] as const).map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => {
                            setLbBoard(b);
                            void fetchLeaderboard(b);
                          }}
                          className={`border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${
                            lbBoard === b ? 'border-amber-400/60 text-amber-300' : 'border-white/10 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {LB_COPY[gameLocale].boards[b]}
                        </button>
                      ))}
                    </div>
                    {highlight && (
                      <p className="border-l border-amber-400/60 pl-2 text-[11px] italic leading-snug text-zinc-300">
                        <span className="block text-[9px] not-italic uppercase tracking-wider text-amber-300">
                          {gameLocale === 'en' ? "Yesterday's best line" : gameLocale === 'es' ? 'La mejor frase de ayer' : "La meilleure réplique d'hier"} · {highlight.pseudo} · −{highlight.discount} %
                        </span>
                        « {highlight.line} »
                      </p>
                    )}
                    {leaderboard.slice(0, 3).map((entry, idx) => (
                      <div key={idx} className="flex justify-between gap-2 text-zinc-400">
                        <span className="truncate">
                          #{idx + 1} {entry.pseudo}
                          {entry.badge && (
                            <span className="ml-1.5 border border-amber-400/40 px-1 text-[8px] uppercase text-amber-300">
                              {LB_COPY[gameLocale].badges[entry.badge]}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-emerald-400">
                          {lbBoard === 'discount' && entry.discount !== undefined
                            ? `−${entry.discount} %`
                            : lbBoard === 'speed' && entry.turns !== undefined
                              ? LB_COPY[gameLocale].turns(entry.turns)
                              : `+${formatMoney(entry.margin, gameLocale)} $`}
                        </span>
                      </div>
                    ))}
                    {historyDays.length > 0 && (
                      <div className="border-t border-white/10 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowArchive7d((v) => !v)}
                          className="w-full text-left text-[9px] uppercase tracking-wider text-zinc-400 hover:text-amber-300"
                        >
                          {showArchive7d ? t.dailyHide7d : t.dailyShow7d}
                        </button>
                        {showArchive7d && (
                          <div className="mt-1 space-y-0.5 text-[9px]">
                            {historyDays.map((d) => (
                              <div key={d.date} className="flex justify-between text-zinc-400">
                                <span>{d.date.slice(5)}</span>
                                <span className={d.margin > 0 ? 'text-emerald-400' : 'text-zinc-600'}>
                                  {d.margin > 0
                                    ? `+${formatMoney(d.margin, gameLocale)} $ (${d.entries})`
                                    : '—'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Guide tutoriel flottant si activé */}
            {showBrief && (
              <div className="z-30 mx-auto flex w-[min(92vw,500px)] items-center justify-between gap-3 border border-amber-400/60 bg-black/90 px-4 py-2 backdrop-blur-md">
                <p className="font-mono text-xs text-zinc-200">
                  <strong className="text-amber-400">
                    {inventory.length > 0
                      ? t.briefStep3
                      : inspected || uvScanned
                        ? t.briefStep2
                        : t.briefStep1}
                  </strong>
                  {inventory.length > 0
                    ? t.briefDesc3
                    : inspected || uvScanned
                      ? t.briefDesc2
                      : t.briefDesc1}
                </p>
                <button
                  onClick={() => {
                    localStorage.setItem('fence_brief_seen', '1');
                    setShowBrief(false);
                  }}
                  className="shrink-0 font-mono text-xs text-amber-300 hover:underline"
                >
                  OK ×
                </button>
              </div>
            )}

            {/* ==================== CENTRE : BUSTE + SOUS-TITRE CINÉMATIQUE ==================== */}
            <div className="relative flex min-h-0 flex-1 flex-col items-center justify-end lg:col-start-2 lg:row-start-1">
              {/* Silhouette / Portrait plein cadre */}
              <div className="pointer-events-none relative mx-auto min-h-[5rem] max-h-[30vh] w-full max-w-[420px] flex-1 lg:max-h-none lg:min-h-0 lg:max-w-[600px]">
                <ClientBust
                  castId={currentCase.castId}
                  gender={currentCase.gender}
                  age={currentCase.age}
                  name={currentCase.name}
                  archetype={currentCase.displayArchetype ?? currentCase.archetype}
                  gauges={gauges}
                  outcome={outcome}
                  speaking={loading}
                  isTrap={currentCase.isTrap}
                  discount={askedPrice > 0 ? Math.round(((currentCase.initialPrice - askedPrice) / currentCase.initialPrice) * 100) : 0}
                />
              </div>

              {/* Tampon Papers, Please au dénouement (placé sur le portrait, jamais sur le texte) */}
              {outcome !== 'active' && (
                <div className="pointer-events-none absolute inset-x-0 top-2 z-30 flex justify-center sm:top-14">
                  <div
                    key={`${currentCase.id}-${outcome}`}
                    className={`animate-stamp-slam border-4 px-3 py-1 font-[family-name:var(--font-display)] text-2xl tracking-[0.22em] uppercase shadow-2xl sm:px-6 sm:py-2 sm:text-5xl ${
                      outcome === 'deal_accepte' && !currentCase.isTrap
                        ? 'border-emerald-400 bg-emerald-950/80 text-emerald-300'
                        : 'border-red-500 bg-red-950/80 text-red-300'
                    }`}
                  >
                    {outcome === 'deal_accepte'
                      ? currentCase.isTrap
                        ? t.stampTrap
                        : t.stampSealed
                      : outcome === 'sort_son_arme'
                        ? t.stampHoldup
                        : t.stampWalkout}
                  </div>
                </div>
              )}

              {/* Objet posé à nu + Sous-titre cinématique côte à côte (zéro chevauchement) */}
              <div className="relative z-20 mx-auto flex w-full max-w-5xl flex-row items-center gap-2 px-3 pb-2 sm:items-end sm:gap-4 sm:px-6">
                <div className="w-24 shrink-0 sm:w-auto lg:hidden">{itemProp}</div>

                {/* Sous-titre cinématique unique + toggle Historique */}
                <div className="min-w-0 flex-1">
                {(() => {
                  const lastPlayerTurn = [...history].reverse().find((t) => t.role === 'player');
                  const lastNpcTurn = [...history].reverse().find((t) => t.role === 'npc');
                  return (
                    <div className="space-y-1.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 py-2.5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] lg:rounded-sm lg:border lg:border-white/10 lg:bg-black/70 lg:bg-none lg:backdrop-blur-sm">
                      {/* Mobile : fil de discussion (3 derniers messages), le visage reste visible au-dessus */}
                      <div className="flex max-h-[34vh] shrink-0 flex-col justify-end gap-1.5 overflow-hidden lg:hidden">
                        {history.slice(-2).map((turn, i, arr) => {
                          const isLastNpc = turn.role === 'npc' && i === arr.length - 1 && !loading;
                          return turn.role === 'player' ? (
                            <p key={`${history.length}-${i}`} className="ml-auto max-w-[85%] rounded-lg rounded-br-sm bg-amber-500/15 px-2.5 py-1.5 font-mono text-xs text-amber-200">
                              {turn.content}
                            </p>
                          ) : (
                            <p key={`${history.length}-${i}`} className="mr-auto max-w-[92%] rounded-lg rounded-bl-sm bg-white/10 px-2.5 py-1.5 text-sm leading-snug text-zinc-100">
                              {isLastNpc ? (
                                <Typewriter text={turn.content.slice(0, 420)} onChar={() => sound.playType()} />
                              ) : (
                                turn.content
                              )}
                            </p>
                          );
                        })}
                        {loading && (
                          <p className="mr-auto flex items-center gap-2 rounded-lg rounded-bl-sm bg-white/10 px-2.5 py-1.5 font-mono text-xs text-amber-300">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            {currentCase.name}…
                          </p>
                        )}
                        {tell && !loading && (
                          <p className="line-clamp-1 font-mono text-[11px] italic text-zinc-400">* {tell}</p>
                        )}
                      </div>
                      <div className="hidden space-y-1.5 lg:block">
                      <div className="flex items-center justify-between gap-2">
                        {lastPlayerTurn ? (
                          <p className="break-words font-mono text-xs text-amber-300">
                            {gameLocale === 'en' ? 'You' : gameLocale === 'es' ? 'Tú' : 'Toi'} : « {lastPlayerTurn.content} »
                          </p>
                        ) : (
                          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                            {gameLocale === 'en' ? 'Opening' : gameLocale === 'es' ? 'Apertura' : 'Ouverture'}
                          </span>
                        )}
                        {history.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setShowHistory((v) => !v)}
                            className="shrink-0 font-mono text-[10px] uppercase text-zinc-400 hover:text-amber-300"
                          >
                            {showHistory
                              ? (gameLocale === 'en' ? 'Hide log' : gameLocale === 'es' ? 'Ocultar log' : 'Masquer log')
                              : (gameLocale === 'en' ? `History (${history.length})` : gameLocale === 'es' ? `Historial (${history.length})` : `Historique (${history.length})`)}
                          </button>
                        )}
                      </div>

                      {showHistory && (
                        <div className="thin-scroll max-h-32 space-y-1 overflow-y-auto border-y border-white/10 py-1.5 font-mono text-[11px]">
                          {history.slice(0, -1).map((t, i) => (
                            <p key={i} className={t.role === 'player' ? 'text-amber-300/80' : 'text-zinc-300'}>
                              <span className="uppercase">{t.role === 'player' ? (gameLocale === 'en' ? 'You' : gameLocale === 'es' ? 'Tú' : 'Toi') : currentCase.name} :</span>{' '}
                              {t.content}
                            </p>
                          ))}
                        </div>
                      )}

                      {loading ? (
                        <div className="flex items-center gap-2 py-1 font-mono text-sm text-amber-300">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{currentCase.name} {gameLocale === 'en' ? 'sizes you up in silence…' : gameLocale === 'es' ? 'te mide en silencio…' : 'te jauge en silence…'}</span>
                        </div>
                      ) : (
                        <p className="text-sm font-medium leading-snug text-zinc-100 sm:text-lg">
                          <span className="mr-2 font-mono text-xs uppercase tracking-wider text-amber-400">
                            {currentCase.name} :
                          </span>
                          <Typewriter
                            text={(lastNpcTurn?.content || currentCase.openingLine).slice(0, 420)}
                            onChar={() => sound.playType()}
                          />
                        </p>
                      )}

                      {tell && !loading && (
                        <p className="line-clamp-2 border-t border-white/5 pt-1 font-mono text-[11px] italic text-zinc-400">
                          * {tell}
                        </p>
                      )}
                      </div>
                    </div>
                  );
                })()}

                {(error || cash < 100) && (
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 border border-red-500/50 bg-red-950/90 px-3 py-1.5 font-mono text-xs text-red-200">
                    <span>
                      {error || (gameLocale === 'en' ? `Cash register low ($${formatMoney(cash, gameLocale)}). Quick-sell stock to replenish:` : `Caisse presque vide (${formatMoney(cash, gameLocale)} $). Remets du liquide pour acheter :`)}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {inventory.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            sellItem(inventory[0].id, 'fast');
                            setError(null);
                          }}
                          className="border border-emerald-400/60 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-200 hover:bg-emerald-500/35"
                        >
                          {gameLocale === 'en'
                            ? `Sell ${localizeItemName(inventory[0].name, gameLocale)} (+$${formatMoney(Math.round(inventory[0].streetValue * 0.7), gameLocale)})`
                            : `Vendre ${inventory[0].name} (+${formatMoney(Math.round(inventory[0].streetValue * 0.7), gameLocale)} $)`}
                        </button>
                      )}
                      {swissBank >= 500 && (
                        <button
                          type="button"
                          onClick={() => withdrawFromSwiss(500)}
                          className="border border-amber-400/60 bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-200 hover:bg-amber-500/35"
                        >
                          Retirer 500 $ (Suisse)
                        </button>
                      )}
                      {cash < 1000 && (
                        <button
                          type="button"
                          onClick={takeSyndicateLoan}
                          className="border border-white/30 bg-black/50 px-2 py-0.5 text-[10px] text-zinc-200 hover:border-amber-400/60 hover:text-amber-200"
                        >
                          Crédit Syndicat (+1 000 $, +15% Heat)
                        </button>
                      )}
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* ==================== BAS : COMPTOIR FEUTRE & TIROIR-CAISSE ==================== */}
            <div className="felt sticky bottom-0 z-30 border-t-2 border-[#3d2c1e] px-3 py-2.5 sm:px-6 sm:py-3 lg:static lg:col-span-3 lg:row-start-2 lg:-mx-6">
              <div className="mx-auto max-w-5xl">
                {outcome !== 'active' ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 py-1">
                    <div className="flex items-center gap-2 font-mono text-xs sm:text-sm">
                      {outcome === 'deal_accepte' ? (
                        <span className={currentCase.isTrap ? 'text-red-300' : 'text-emerald-300'}>
                          {currentCase.isTrap
                            ? (gameLocale === 'en'
                                ? `TRAP! $${formatMoney(askedPrice, gameLocale)} lost · Heat +30%`
                                : gameLocale === 'es'
                                  ? `¡TRAMPA! ${formatMoney(askedPrice, gameLocale)} $ perdidos · Heat +30%`
                                  : `PIÈGE ! ${formatMoney(askedPrice, gameLocale)} $ perdus · Heat +30%`)
                            : (gameLocale === 'en'
                                ? `✓ Bought for $${formatMoney(askedPrice, gameLocale)} (Street ~$${formatMoney(currentCase.streetValue, gameLocale)})`
                                : gameLocale === 'es'
                                  ? `✓ Comprado por ${formatMoney(askedPrice, gameLocale)} $ (Calle ~${formatMoney(currentCase.streetValue, gameLocale)} $)`
                                  : `✓ Acheté ${formatMoney(askedPrice, gameLocale)} $ (Rue ~${formatMoney(currentCase.streetValue, gameLocale)} $)`)}
                        </span>
                      ) : outcome === 'sort_son_arme' ? (
                        <span className="text-red-400">
                          {upgrades.armoredDoor
                            ? t.outcomeGunArmored
                            : t.outcomeGunStolen(currentCase.name)}
                        </span>
                      ) : (
                        <span className="text-zinc-300">{t.outcomeWalked(currentCase.name)}</span>
                      )}
                    </div>

                    {tab === 'counter' ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {outcome === 'deal_accepte' &&
                          !currentCase.isTrap &&
                          currentCase.arcStep !== 2 &&
                          inventory.length > 0 &&
                          inventory[inventory.length - 1]?.name === currentCase.item.name && (
                            <button
                              type="button"
                              onClick={() => sellItem(inventory[inventory.length - 1].id, 'fast')}
                              className="border border-emerald-400/60 bg-emerald-950/60 px-3 py-2 font-mono text-xs font-semibold uppercase text-emerald-200 hover:bg-emerald-900/80"
                            >
                              {t.quickSellDirect(
                                formatMoney(getFastSellPayout(inventory[inventory.length - 1]), gameLocale),
                              )}
                            </button>
                          )}
                        {(outcome === 'sort_son_arme' ||
                          (outcome === 'deal_accepte' &&
                            !currentCase.isTrap &&
                            (100 * (currentCase.initialPrice - askedPrice)) / currentCase.initialPrice >= 30)) && (
                          <button
                            type="button"
                            onClick={() => void shareMoment(false)}
                            className="border border-white/20 bg-black/50 px-3 py-2 font-mono text-xs uppercase text-zinc-200 hover:border-amber-400/50"
                          >
                            {copiedShare ? t.copiedBtn : t.shareBtn}
                          </button>
                        )}
                        <button
                          onClick={nextProceduralClient}
                          className="brass flex items-center gap-1.5 px-5 py-2 font-[family-name:var(--font-display)] text-lg tracking-widest uppercase text-[#1a1206] transition-transform hover:scale-[1.02]"
                        >
                          {clientsServedToday + 1 >= maxClientsPerDay ? t.toNight : t.nextClient}
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        {hasPass && outcome === 'deal_accepte' && !scoreSubmitted && (
                          <>
                            <input
                              type="text"
                              value={pseudo}
                              onChange={(e) => setPseudo(e.target.value)}
                              maxLength={20}
                              placeholder={t.dailyPseudoPlaceholder}
                              className="w-28 border border-white/20 bg-black/60 px-2 py-1.5 font-mono text-xs text-zinc-100"
                            />
                            <button
                              onClick={() => submitDailyScore(askedPrice)}
                              className="brass px-3 py-1.5 font-mono text-xs font-bold uppercase text-[#1a1206]"
                            >
                              {t.dailyPublish(formatMoney(currentCase.streetValue - askedPrice, gameLocale))}
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => void shareMoment(true)}
                          className="border border-white/20 bg-black/50 px-3 py-1.5 font-mono text-xs uppercase text-zinc-200 hover:border-amber-400/50"
                        >
                          {copiedShare ? t.copiedBtn : t.shareBtn}
                        </button>
                        {hasPass ? (
                          <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400/80">
                            {passOpen ? t.freeAccess : t.passActive30d}
                          </span>
                        ) : (
                          <button
                            onClick={() => void buyPass()}
                            disabled={passBusy}
                            className="border border-amber-500/50 bg-amber-500/15 px-3 py-1.5 font-mono text-xs uppercase text-amber-300"
                          >
                            {passBusy ? t.redirecting : t.getPass}
                          </button>
                        )}
                        <button
                          onClick={() => setTab('night')}
                          className="flex items-center gap-1 border border-white/15 px-3 py-1.5 font-mono text-xs uppercase text-zinc-300 hover:border-white/30"
                        >
                          {t.vaultSellBtn} <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Ligne 1 : Outils physiques à gauche + Compteur mécanique de liasses à droite */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => {
                            if (weeklyChallenge.modifier.disableLoupe && !currentCase.isDailyContract) return;
                            if (!jokerIds.includes('a-l-aveugle')) setInspected(true);
                            sound.playInspect();
                          }}
                          disabled={Boolean(weeklyChallenge.modifier.disableLoupe && !currentCase.isDailyContract)}
                          title={
                            weeklyChallenge.modifier.disableLoupe && !currentCase.isDailyContract
                              ? 'Loupe fêlée cette semaine'
                              : 'Examiner la pièce à la loupe'
                          }
                          className={`flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all disabled:opacity-40 ${
                            inspected
                              ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                              : 'border-[#4a3a22] bg-[#16120d] text-[#c9a25f] hover:border-amber-500/60'
                          }`}
                        >
                          <Search className="h-3.5 w-3.5" />
                          <span>{weeklyChallenge.modifier.disableLoupe && !currentCase.isDailyContract ? t.loupeOff : t.loupe}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (nightEvent?.disableUv && !currentCase.isDailyContract) return;
                            if (!jokerIds.includes('a-l-aveugle')) setUvScanned(true);
                            sound.playInspect();
                          }}
                          disabled={Boolean(nightEvent?.disableUv && !currentCase.isDailyContract)}
                          title={
                            nightEvent?.disableUv && !currentCase.isDailyContract
                              ? 'Panne secteur : lampe UV HS ce soir'
                              : 'Passer la lampe UV'
                          }
                          className={`flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all disabled:opacity-40 ${
                            uvScanned
                              ? 'border-sky-400 bg-sky-500/20 text-sky-200'
                              : 'border-[#2c3a4a] bg-[#0f141c] text-[#7fb4d8] hover:border-sky-400/60'
                          }`}
                        >
                          <Flashlight className="h-3.5 w-3.5" />
                          <span>{nightEvent?.disableUv && !currentCase.isDailyContract ? t.uvOff : t.uv}</span>
                        </button>

                        <button
                          onClick={() => {
                            const next = !radioOpen;
                            setRadioOpen(next);
                            if (next) {
                              sound.playInspect();
                              ambience.crackle();
                            }
                          }}
                          className={`flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all ${
                            radioOpen
                              ? 'border-red-500 bg-red-950/50 text-red-300'
                              : 'border-[#3a2f24] bg-[#14110e] text-[#b9a07a] hover:border-red-400/50'
                          }`}
                        >
                          <Radio className="h-3.5 w-3.5" />
                          <span>{t.radio}</span>
                        </button>
                      </div>

                      {/* Compteur mécanique de billets + Boutons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center border border-amber-500/40 bg-black/80">
                          <button
                            type="button"
                            disabled={cash < 100}
                            onClick={() => setOfferAmount((v) => Math.max(100, Math.min(cash, v) - 500))}
                            className="px-2 py-1.5 font-mono text-xs text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-40"
                          >
                            -500
                          </button>
                          <button
                            type="button"
                            disabled={cash < 100}
                            onClick={() => setOfferAmount((v) => Math.max(100, Math.min(cash, v) - 100))}
                            className="border-l border-white/10 px-2 py-1.5 font-mono text-xs text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-40"
                          >
                            -100
                          </button>
                          <div className="min-w-[110px] px-2.5 py-0.5 text-center">
                            {cash < 100 ? (
                              <span className="block font-[family-name:var(--font-display)] text-2xl leading-none tracking-wider text-red-400">
                                {gameLocale === 'en' ? `$${formatMoney(cash, gameLocale)}` : `${formatMoney(cash, gameLocale)} $`}
                              </span>
                            ) : (
                              <div className="flex items-baseline justify-center gap-1">
                                <input
                                  type="number"
                                  min={100}
                                  max={cash}
                                  step={10}
                                  value={Math.min(offerAmount, cash)}
                                  onChange={(e) => {
                                    const raw = Number(e.target.value);
                                    if (!Number.isNaN(raw)) {
                                      setOfferAmount(Math.max(0, Math.min(cash, Math.round(raw))));
                                    }
                                  }}
                                  onBlur={() =>
                                    setOfferAmount((v) => Math.max(100, Math.min(cash, v)))
                                  }
                                  title={gameLocale === 'en' ? 'Type exact offer directly' : 'Tape directement le montant exact'}
                                  className="w-20 bg-transparent text-center font-[family-name:var(--font-display)] text-2xl leading-none tracking-wider text-emerald-300 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                                <span className="font-[family-name:var(--font-display)] text-xl leading-none text-emerald-300/80">
                                  $
                                </span>
                              </div>
                            )}
                            <span className="block font-mono text-[9px] uppercase text-zinc-400">
                              {cash < 100
                                ? (gameLocale === 'en' ? 'register too low' : 'caisse trop basse')
                                : (gameLocale === 'en'
                                    ? `Margin ${currentCase.streetValue - Math.min(offerAmount, cash) >= 0 ? '+' : ''}$${formatMoney(currentCase.streetValue - Math.min(offerAmount, cash), gameLocale)}`
                                    : `Marge ${currentCase.streetValue - Math.min(offerAmount, cash) >= 0 ? '+' : ''}${formatMoney(currentCase.streetValue - Math.min(offerAmount, cash), gameLocale)} $`)}
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={cash < 100}
                            onClick={() =>
                              setOfferAmount((v) => Math.min(cash, currentCase.initialPrice, v + 100))
                            }
                            className="border-l border-white/10 px-2 py-1.5 font-mono text-xs text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-40"
                          >
                            +100
                          </button>
                          <button
                            type="button"
                            disabled={cash < 100}
                            onClick={() =>
                              setOfferAmount((v) => Math.min(cash, currentCase.initialPrice, v + 500))
                            }
                            className="border-l border-white/10 px-2 py-1.5 font-mono text-xs text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-40"
                          >
                            +500
                          </button>
                        </div>

                        <button
                          onClick={slapCashOnCounter}
                          disabled={loading || cash < 100}
                          className="brass px-4 py-1.5 font-[family-name:var(--font-display)] text-xl tracking-widest uppercase text-[#1a1206] transition-transform hover:scale-[1.02] disabled:opacity-40"
                        >
                          {cash < 100 ? t.cashEmpty : t.slapCash}
                        </button>

                        <button
                          onClick={passClient}
                          disabled={loading}
                          title="Décliner poliment sans pénalité de Heat"
                          className="border border-white/20 bg-black/60 px-2.5 py-2 font-mono text-[10px] uppercase text-zinc-300 hover:border-white/40 hover:text-white disabled:opacity-40"
                        >
                          {t.pass}
                        </button>

                        {currentCase.bossKind === 'phantom' && !phantomDone && inventory.length > 0 && (
                          <button
                            onClick={phantomBuyout}
                            disabled={loading}
                            title="Revend jusqu’à 4 pièces du coffre à ×1,2 — plafond 15 000 $"
                            className="border border-amber-500/60 bg-amber-500/15 px-2.5 py-2 font-mono text-[10px] font-bold uppercase text-amber-200 hover:bg-amber-500/25 disabled:opacity-40"
                          >
                            {t.phantomBuyout(Math.min(PHANTOM_MAX_ITEMS, inventory.length))}
                          </button>
                        )}

                        <button
                          onClick={rejectTrap}
                          disabled={loading}
                          title="Le démasquer : un infiltré décampe, un client réglo s'en va"
                          className="border border-red-500/70 bg-red-950/70 px-2.5 py-2 font-mono text-[10px] font-bold uppercase text-red-200 hover:bg-red-900 disabled:opacity-40"
                        >
                          {t.expose}
                        </button>
                      </div>
                    </div>

                    {/* Ligne 2 : 3 relances rapides tactiques + Saisie directe au clavier */}
                    <div className="flex flex-col gap-1.5 w-full">
                      {(() => {
                        const undercut = Math.max(100, Math.round((askedPrice * 0.8) / 50) * 50);
                        const unlockedFaille = history.length >= FLAW_REVEAL_TURNS;
                        const profile = findProfileForArchetype(currentCase.archetype);
                        return (
                          <div className="flex w-full items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 sm:flex-wrap sm:overflow-visible [&>*]:shrink-0 [&>*]:whitespace-nowrap">
                            {undercut <= cash && undercut < askedPrice && (
                              <button
                                type="button"
                                disabled={loading}
                                onClick={() => {
                                  triggerHaptic(15);
                                  sendMessage(
                                    t.chip20Msg(formatMoney(undercut, gameLocale)),
                                    undercut,
                                  );
                                }}
                                className="border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] text-amber-200 hover:bg-amber-500/25 active:scale-95 transition-transform disabled:opacity-40"
                              >
                                {t.chip20(formatMoney(undercut, gameLocale))}
                              </button>
                            )}
                            {(() => {
                              const deepCut = Math.max(100, Math.round((askedPrice * 0.65) / 50) * 50);
                              if (deepCut <= cash && deepCut < undercut) {
                                const deepMsg =
                                  gameLocale === 'en'
                                    ? `Take $${formatMoney(deepCut, gameLocale)} cold cash right now or walk.`
                                    : gameLocale === 'es'
                                      ? `Toma ${formatMoney(deepCut, gameLocale)} $ en efectivo ahora mismo o lárgate.`
                                      : `Prends ${formatMoney(deepCut, gameLocale)} $ en liquide tout de suite ou dégage.`;
                                const deepLabel =
                                  gameLocale === 'en'
                                    ? `-35% ($${formatMoney(deepCut, gameLocale)})`
                                    : `-35% (${formatMoney(deepCut, gameLocale)} $)`;
                                return (
                                  <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => {
                                      triggerHaptic(20);
                                      sendMessage(deepMsg, deepCut);
                                    }}
                                    className="border border-red-500/30 bg-red-500/10 px-2 py-1 font-mono text-[10px] text-red-300 hover:bg-red-500/20 active:scale-95 transition-transform disabled:opacity-40"
                                  >
                                    {deepLabel}
                                  </button>
                                );
                              }
                              return null;
                            })()}
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => {
                                triggerHaptic(15);
                                sendMessage(t.chipPressureMsg);
                              }}
                              className="border border-white/15 bg-black/50 px-2.5 py-1 font-mono text-[10px] text-zinc-300 hover:border-white/35 hover:text-white active:scale-95 transition-transform disabled:opacity-40"
                            >
                              {t.chipPressure}
                            </button>
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => {
                                triggerHaptic(15);
                                sendMessage(
                                  unlockedFaille
                                    ? t.chipFlawMsg(
                                        localizeCastText(
                                          currentCase.gender === 'f' && profile.femaleWeaknessHint
                                            ? profile.femaleWeaknessHint
                                            : profile.weaknessHint,
                                          gameLocale,
                                        ),
                                      )
                                    : t.chipBluffMsg,
                                );
                              }}
                              className="border border-white/15 bg-black/50 px-2.5 py-1 font-mono text-[10px] text-zinc-300 hover:border-amber-400/50 hover:text-amber-200 active:scale-95 transition-transform disabled:opacity-40"
                            >
                              {unlockedFaille ? t.chipFlaw : t.chipBluff}
                            </button>
                          </div>
                        );
                      })()}

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          sendMessage();
                        }}
                        className="flex w-full items-center gap-2 border border-white/15 bg-black/75 px-3 py-1.5"
                      >
                        <span className="font-mono text-sm font-bold text-amber-400">&gt;</span>
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          disabled={loading}
                          placeholder={
                            loading
                              ? `${currentCase.name} ...`
                              : t.inputPlaceholder
                          }
                          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none disabled:opacity-60"
                        />
                        <button
                          type="button"
                          onClick={toggleMic}
                          disabled={loading}
                          title="Dicter au micro"
                          className={`p-1 ${listening ? 'animate-pulse text-red-400' : 'text-zinc-400 hover:text-white'}`}
                        >
                          {listening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                        </button>
                        <button
                          type="submit"
                          disabled={loading || !input.trim()}
                          title="Envoyer"
                          className="p-1 text-amber-400 hover:text-amber-300 disabled:opacity-40"
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {debugMode && (
                  <p className="mt-1 font-mono text-[9px] text-amber-500/50">
                    plancher dynamique {dynamicFloor} $ · objet {currentCase.item.name} · rue{' '}
                    {currentCase.streetValue} $
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Balatro-style Syndicate Atout Draft Modal */}
      {jokerDraft && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="max-w-3xl w-full bg-[#111114] border border-amber-500/40 rounded-xl p-6 space-y-5">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400">
                {t.jokerDraftTax(day)}
              </span>
              <h2 className="text-xl font-semibold text-zinc-100">
                {t.jokerDraftTitle}
              </h2>
              <p className="text-xs text-zinc-400">
                {t.jokerDraftDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {jokerDraft.map((jk) => {
                const locJk = t.jokers[jk.id] ?? jk;
                return (
                  <button
                    key={jk.id}
                    onClick={() => pickJokerAndAdvance(jk.id)}
                    className="text-left bg-zinc-950 hover:bg-zinc-900 border border-white/10 hover:border-amber-500/60 rounded-lg p-4 flex flex-col justify-between space-y-3 transition-all group"
                  >
                    <div className="space-y-2">
                      <span className="inline-block text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                        {locJk.tag}
                      </span>
                      <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-amber-300">
                        {locJk.name}
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">{locJk.desc}</p>
                    </div>
                    <span className="text-xs font-medium text-amber-400">{t.jokerDraftActivate}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Profil & Préférences Modal (Ultra-épuré, zéro bruit) */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#0c0d12] p-5 shadow-2xl space-y-4 font-mono animate-in fade-in zoom-in-95 duration-150">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold tracking-widest text-zinc-200 uppercase">
                  {gameLocale === 'en' ? 'Preferences' : gameLocale === 'es' ? 'Ajustes' : 'Préférences'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setShowProfileModal(false);
                }}
                className="text-zinc-500 hover:text-zinc-200 text-xs transition-colors p-1"
              >
                ✕
              </button>
            </div>

            {/* Street Name / Blase */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-zinc-500 tracking-wider">
                {gameLocale === 'en' ? 'Street Name' : gameLocale === 'es' ? 'Apodo' : 'Blase'}
              </span>
              <input
                type="text"
                value={playerHandle}
                maxLength={16}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setPlayerHandle(val);
                  localStorage.setItem('fence_player_handle', val);
                }}
                className="w-full rounded border border-white/10 bg-black/70 px-2.5 py-1.5 text-xs font-bold text-amber-300 focus:border-amber-400 focus:outline-none tracking-wider"
                placeholder="MARC"
              />
            </div>

            {/* Language Segmented Pill */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-zinc-500 tracking-wider">
                {gameLocale === 'en' ? 'Language' : gameLocale === 'es' ? 'Idioma' : 'Langue'}
              </span>
              <div className="grid grid-cols-3 gap-1 rounded bg-black/70 p-0.5 border border-white/5 text-[11px]">
                {(['en', 'fr', 'es'] as const).map((loc) => {
                  const active = gameLocale === loc;
                  const names = { en: 'English', fr: 'Français', es: 'Español' };
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => switchLanguage(loc)}
                      className={`rounded py-1 text-center font-semibold transition-all ${
                        active
                          ? 'bg-amber-400 text-zinc-950 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {names[loc]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Switches: Haptics & Sound */}
            <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  const next = !hapticsEnabled;
                  setHapticsEnabled(next);
                  localStorage.setItem('fence_haptics', next ? '1' : '0');
                  if (next) triggerHaptic(20);
                }}
                className={`flex items-center justify-between rounded border px-2.5 py-1.5 transition-colors ${
                  hapticsEnabled
                    ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                    : 'border-white/5 bg-black/40 text-zinc-500'
                }`}
              >
                <span>{gameLocale === 'en' ? 'Haptics' : 'Haptique'}</span>
                <span className="text-[9px] uppercase font-bold">{hapticsEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className={`flex items-center justify-between rounded border px-2.5 py-1.5 transition-colors ${
                  !muted
                    ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                    : 'border-white/5 bg-black/40 text-zinc-500'
                }`}
              >
                <span>{gameLocale === 'en' ? 'Sound' : 'Son'}</span>
                <span className="text-[9px] uppercase font-bold">{!muted ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Cloud Sync State Row */}
            <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-zinc-400">
              <span className="text-zinc-500 uppercase">Cloud Sync</span>
              {authUser ? (
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="max-w-[120px] truncate">{authUser.name || authUser.email}</span>
                  <span className="text-zinc-500 text-[9px] uppercase">({cloudStatus})</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (oauthConfigured) window.location.href = '/api/auth/google';
                  }}
                  className="text-amber-400 hover:text-amber-300 underline"
                >
                  {gameLocale === 'en' ? 'Connect Google' : 'Lier Google'}
                </button>
              )}
            </div>

            {/* Career Summary Ticker */}
            <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-zinc-500">
              <span>{gameLocale === 'en' ? 'Profit' : 'Bénéfice'}: <strong className="text-amber-300">${formatMoney(totalProfit, gameLocale)}</strong></span>
              <span>·</span>
              <span>Swiss: <strong className="text-emerald-400">${formatMoney(swissBank, gameLocale)}</strong></span>
              <span>·</span>
              <span>Day: <strong className="text-zinc-300">{day}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
