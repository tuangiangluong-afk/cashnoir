import { FirstDeal, readFirstDeal, clearFirstDeal } from './components/FirstDeal';
import { GameDialog } from './components/GameDialog';
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
  Loader2,
  User,
  MessageSquare,
  Package,
  Building2,
  Trophy,
  Ellipsis,
  Shuffle,
  CircleHelp,
  BookOpen,
  UserX,
  Skull,
} from 'lucide-react';
import {
  generateProceduralCase,
  setPlayerCashHint,
  generateDailyContract,
  generateBossCase,
  generateWindfallCase,
  setAscensionHint,
  setFeaturedCast,
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
import { consumeLoginError, startGoogleLogin, clearNativeSession, isNative, openSitePage } from './services/nativeApi';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { track } from './services/telemetry';
import { trackEvent, trackPageView } from './services/analytics';
import { renderShareCard, shareCardImage } from './services/shareCard';
import { dealDebrief, runAdvice, EMPTY_RUN_STATS, type RunStats } from './data/debrief';
import { activeCombos, comboCompletedBy, hasCombo } from './data/combos';
import { heistLoss, heistRisk } from './data/risk';
import { chapterStart, checkpointCash, RENT_BASE, RENT_SLOPE } from './data/checkpoints';
import { applyEncounter, applyFavor, nextEpisode, pickDue, rebaseSagas, trustTone, SAGA_EPISODES, type SagaState } from './data/saga';
import { sagaAllyGift, sagaChapter, sagaEnding, sagaFacts, sagaFavor, sagaKnows, sagaOpening, sagaTell } from './data/sagaText';
import { evaluatePsychoTriggers, findProfileForArchetype, temperamentOf } from './data/psychology';
import { getNightEvent, localizeNightEvent } from './data/events';
import { drawRandomJokers, JOKER_POOL, type SyndicateJoker } from './data/jokers';
import { JokerIcon } from './components/JokerIcon';
import { EmpireIcon } from './components/EmpireIcons';
import { type VengeanceEntry, checkVengeance, pruneVengeance } from './data/revenge';
import { getWeeklyChallenge, type WeeklyChallenge } from './data/challenges';
import { getAscensionModifier, canAscend, MAX_ASCENSION, ROMAN } from './data/ascension';
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
import { getSeasonLevel, SEASON_EPISODES, daysUntilEpisode, type SeasonEpisode, campaignSeasonOf, seasonHero } from './data/seasons';
import {
  getDailyQuests,
  LOGIN_STREAK_REWARDS,
  CAREER_ACHIEVEMENTS,
} from './data/quests';
import { CAST_ROSTER } from './data/cast';
import { PantheonView, type HistoryEntry } from './components/PantheonView';
import { MarketingSite } from './components/MarketingSite';
import { AdminDashboard } from './components/AdminDashboard';
import { GAME_UI, getLocalizedRank, formatMoney } from './data/gameI18n';
import type { Locale } from './data/seoContent';
import { ShopBackdrop, FilmOverlay, ClientBust, Typewriter, resolveCastPortrait, PORTRAIT_DIR } from './components/Scene';
import { rollSecretId, secretContent, checkSecret, secretReward, SECRET_UI } from './data/secrets';
import { localizeCastText, localizeSecret } from './data/castI18n';
import { localizeItemText } from './data/itemsI18n';
import { CounterItemProp, itemKindFor } from './components/CounterProps';
import { ambience } from './services/ambience';
import { sound } from './services/sound';
import type { Gauges } from './services/types';
import {
  queryNPC,
  computeDynamicFloor,
  type ChatTurn,
  type LLMConfig,
  type LLMProvider,
  type NpcQuota,
} from './services/llm';

const ActionRow = ({ icon, label, hint, onClick, disabled, tone }: { icon: React.ReactNode; label: string; hint?: string; onClick: () => void; disabled?: boolean; tone?: 'danger' }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left active:bg-white/10 disabled:opacity-40 ${tone === 'danger' ? 'text-red-300' : 'text-zinc-100'}`}
  >
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">{icon}</span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-[15px] font-medium">{label}</span>
      {hint && <span className="block truncate text-xs text-zinc-500">{hint}</span>}
    </span>
  </button>
);

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
  portraitId?: string;
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

const SESSION_KEY = 'fence_session';

// Équilibrage (voir `npm run econ`) : revente rapide, enchères et impôt progressif sur le cash en main.
const FAST_SELL_RATIO = 0.8;
const AUCTION_CLEAN_RATIO = 1.2;
const AUCTION_DIRTY_RATIO = 1.05;
const wealthTax = (cash: number) =>
  Math.round(Math.min(cash, 15000) * 0.08 + Math.max(0, Math.min(cash, 50000) - 15000) * 0.15 + Math.max(0, cash - 50000) * 0.25);

interface AuditEntry {
  id: string;
  turn: number;
  action: string;
  peur: number;
  peurDelta: number;
  colere: number;
  colereDelta: number;
  mefiance: number;
  mefianceDelta: number;
  price: number;
  priceDelta: number;
  text?: string;
  offer?: number;
  floor?: number;
  weak?: boolean;
  name?: boolean;
  tools?: number;
}

/** Le client en cours est sauvegardé : recharger la page ou passer par le contrat quotidien ne change pas de client. */
interface ClientSession {
  v: 1;
  day: number;
  case: ProceduralCase;
  gauges: Gauges;
  askedPrice: number;
  priceTrail: number[];
  tell: string;
  outcome: 'active' | 'deal_accepte' | 'quitte_la_boutique' | 'sort_son_arme';
  history: ChatTurn[];
  clientsServedToday: number;
  inspected: boolean;
  uvScanned: boolean;
  grilled: { loupe: boolean; uv: boolean; radio: boolean };
  radioOpen: boolean;
  offerAmount: number;
  used: { nameHit: boolean; weakHit: boolean };
  audit?: AuditEntry[];
}

function loadSession(day: number): ClientSession | null {
  try {
    const raw = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (raw && raw.v === 1 && raw.day === day && raw.case && !raw.case.isDailyContract) return raw as ClientSession;
  } catch {
    /* session illisible : on repart d'un client neuf */
  }
  return null;
}

type TabMode = 'counter' | 'night' | 'shop' | 'pantheon' | 'daily';

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getSecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}

function formatCountdown(secs: number, compact = false): string {
  const hNum = Math.floor(secs / 3600);
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  if (compact && hNum === 0) return `${m}:${s}`;
  const h = String(hNum).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function DailyClock({ compact = false }: { compact?: boolean }) {
  const [seconds, setSeconds] = useState(getSecondsUntilMidnight);
  useEffect(() => {
    let timer: number | undefined;
    const sync = () => {
      window.clearInterval(timer);
      if (document.hidden) return;
      const tick = () => setSeconds(getSecondsUntilMidnight());
      tick();
      timer = window.setInterval(tick, 1000);
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);
  return <>{formatCountdown(seconds, compact)}</>;
}

export default function App() {
  const [todayStr, setTodayStr] = useState(getTodayStr);

  const [routePath, setRoutePath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/play';
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'ok' || params.get('pass') === 'claim' || params.get('pass') === 'ok') return '/play';
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
    if (saved === 'fr' || saved === 'es' || saved === 'en') return saved;
    const preferred = navigator.language.split('-')[0];
    return preferred === 'fr' || preferred === 'es' ? preferred : 'en';
  });
  const tt = (fr: string, en: string, es: string) => (gameLocale === 'en' ? en : gameLocale === 'es' ? es : fr);
  const hitLoc = (label: string) => {
    const D: Record<string, [string, string]> = {
      'Prénom lâché': ['Name dropped', 'Nombre soltado'],
      'Faille touchée': ['Weak spot hit', 'Punto débil tocado'],
      'Ligne rouge': ['Red line', 'Línea roja'],
      'Hors-RP détecté': ['Out-of-character detected', 'Fuera de personaje detectado'],
      'Scanner Police': ['Police scanner', 'Escáner policial'],
      'Marquage UV': ['UV marking', 'Marcado UV'],
      'Indice Loupe': ['Magnifier clue', 'Pista de lupa'],
      'Répétition': ['Repetition', 'Repetición'],
    };
    return label.split(' · ').map((l) => (gameLocale === 'fr' ? l : D[l]?.[gameLocale === 'en' ? 0 : 1] ?? l)).join(' · ');
  };
  const sagaLabel = (sg: SagaState): string => {
    const toneMap: Record<string, string> = {
      devoted: tt('dévoué', 'devoted', 'devoto'),
      friendly: tt('amical', 'friendly', 'amistoso'),
      neutral: tt('neutre', 'neutral', 'neutral'),
      wary: tt('méfiant', 'wary', 'recelo'),
      hostile: tt('hostile', 'hostile', 'hostil'),
    };
    const endMap = { ally: tt('Allié fidèle', 'Loyal ally', 'Aliado fiel'), enemy: tt('Ennemi', 'Enemy', 'Enemigo'), gone: tt('Histoire close', 'Story closed', 'Historia cerrada') };
    return sg.end ? `${endMap[sg.end]} · ${toneMap[trustTone(sg.trust)]}` : `${tt('Ép.', 'Ep.', 'Ep.')} ${Math.min(sg.met + 1, SAGA_EPISODES)}/${SAGA_EPISODES} · ${toneMap[trustTone(sg.trust)]}`;
  };
  const TEMPER_LABEL: Record<string, string> = {
    nervous: tt('Nerveux', 'Jumpy', 'Nervioso'),
    coolheaded: tt('Sang-froid', 'Cool-headed', 'Sangre fría'),
    hothead: tt('Soupe au lait', 'Hothead', 'Irascible'),
    phlegmatic: tt('Flegmatique', 'Phlegmatic', 'Flemático'),
    wary: tt('Méfiant de nature', 'Naturally wary', 'Desconfiado por naturaleza'),
    trusting: tt('Confiant', 'Trusting', 'Confiado'),
  };
  const mny = (n: number) => (gameLocale === 'en' ? `$${formatMoney(n, gameLocale)}` : `${formatMoney(n, gameLocale)} $`);
  const t = GAME_UI[gameLocale];

  // Persistent empire state
  const [day, setDay] = useState<number>(() => Number(localStorage.getItem('fence_day')) || 1);
  // Jour de la toute première partie : la campagne se débloque un épisode par semaine à partir de là.
  const [daysSinceStart] = useState<number>(() => {
    try {
      let first = localStorage.getItem('fence_first_play');
      if (!first) {
        first = new Date().toISOString().slice(0, 10);
        localStorage.setItem('fence_first_play', first);
      }
      return Math.max(0, Math.floor((Date.now() - new Date(first).getTime()) / 86_400_000));
    } catch {
      return 0;
    }
  });
  const [saved] = useState<ClientSession | null>(() => {
    setPlayerCashHint(Number(localStorage.getItem('fence_cash')) || 2500); // avant la génération du premier client
    return loadSession(Number(localStorage.getItem('fence_day')) || 1);
  });
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
  const [rerollsLeft, setRerollsLeft] = useState(() => {
    // Les tirages restants survivent au rechargement de la page (sinon F5 = tirage gratuit).
    try {
      const r = JSON.parse(localStorage.getItem('fence_rerolls') || 'null');
      if (r && r.day === (Number(localStorage.getItem('fence_day')) || 1) && Number.isFinite(r.left)) return Math.max(0, r.left);
    } catch {
      /* valeur illisible : défaut */
    }
    return Math.max(0, 2 - (getAscensionModifier(Number(localStorage.getItem('fence_ascension')) || 0)?.rerollPenalty ?? 0));
  });
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
  const [shaking, setShaking] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LbEntry[]>([]);
  const [lbBoard, setLbBoard] = useState<LbBoard>('margin');
  const [highlight, setHighlight] = useState<{ pseudo: string; discount: number; line: string } | null>(null);
  const [pseudo, setPseudo] = useState('Receleur');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [hasPass, setHasPass] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [passManageable, setPassManageable] = useState(false);
  const [passWelcome, setPassWelcome] = useState(false);
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
  const [graceUsed, setGraceUsed] = useState<boolean>(() => localStorage.getItem('fence_grace') === '1');
  const [bestDay, setBestDay] = useState<number>(() => Number(localStorage.getItem('fence_best_day')) || 0);
  // Bonus de départ de la prochaine partie : +100 $ par jour de record au-delà du jour 5 (plafond 2 000 $).
  const legacyBonus = Math.min(2000, Math.max(0, bestDay - 5) * 100);
  const [openSecretId, setOpenSecretId] = useState<string | null>(null);
  const [secretInput, setSecretInput] = useState('');
  const [secretMsg, setSecretMsg] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  // Sagas clients : relations persistantes (elles survivent aux nouvelles parties : c'est ta réputation dans les bas-fonds).
  const [sagas, setSagas] = useState<Record<string, SagaState>>(() => {
    try {
      return JSON.parse(localStorage.getItem('fence_saga') || '{}');
    } catch {
      return {};
    }
  });
  const [sagaNote, setSagaNote] = useState('');
  const [runStats, setRunStats] = useState<RunStats>(() => {
    try {
      return { ...EMPTY_RUN_STATS, ...JSON.parse(localStorage.getItem('fence_runstats') || '{}') };
    } catch {
      return EMPTY_RUN_STATS;
    }
  });
  const [league, setLeague] = useState<{ endsAt: string; players: number; standings: { pseudo: string; total: number; days: number; rank: number; tier: string }[] } | null>(null);
  const [favor, setFavor] = useState<{ castId: string; name: string; cost: number } | null>(null);
  const [registry, setRegistry] = useState<RegistryEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fence_registry') || '[]');
    } catch {
      return [];
    }
  });
  const [showRegistry, setShowRegistry] = useState(false);
  const loggedCaseRef = useRef<string>(saved && saved.outcome !== 'active' ? saved.case.id : '');
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
  const [showFirstDeal, setShowFirstDeal] = useState(false);
  const [profileFailed, setProfileFailed] = useState(false);
  const [authAttempt, setAuthAttempt] = useState(0);
  const [authChecked, setAuthChecked] = useState(false);
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
    localStorage.setItem('fence_saga', JSON.stringify(sagas));
    localStorage.setItem('fence_runstats', JSON.stringify(runStats));
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
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include', signal: controller.signal });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        setOauthConfigured(Boolean(data.oauthConfigured));
        if (!data.authenticated || !data.user) {
          setAuthUser(null);
          setProfileFailed(false);
          cloudReadyRef.current = false;
          return;
        }
        setAuthUser(data.user);
        try {
          const known = localStorage.getItem('fence_known_user');
          if (known !== data.user.id) {
            localStorage.setItem('fence_known_user', data.user.id);
            trackEvent('sign_up', { method: 'google', user_id: data.user.id });
          } else {
            trackEvent('login', { method: 'google', user_id: data.user.id });
          }
        } catch {}

        const intro = readFirstDeal();
        const importDeal = intro?.stage === 'bought';
        const profRes = await fetch(importDeal ? '/api/profile/first-deal' : '/api/profile', {
          credentials: 'include',
          signal: controller.signal,
          ...(importDeal ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ price: intro.price }) } : {}),
        });
        if (cancelled) return;
        if (!profRes.ok) throw new Error('Profile unavailable');
        const profData = await profRes.json();
        if (cancelled) return;
        const p = profData?.profile;
        if (importDeal && !p) throw new Error('First deal unavailable');
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
        if (importDeal) {
          clearFirstDeal();
          if (p.inventory?.some((item: BoughtItem) => item.id === 'first-dock-watch')) setTab('night');
        }
        setProfileFailed(false);
        cloudReadyRef.current = true;
        setCloudStatus('saved');
      } catch {
        if (!cancelled) setProfileFailed(true);
      } finally {
        window.clearTimeout(timeout);
        if (!cancelled) setAuthChecked(true);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [authAttempt]);

  // Tracking GA4 / GTM : vues de page + achat Pass Syndicat confirmé au retour Stripe
  useEffect(() => {
    trackPageView(routePath);
    if (typeof window !== 'undefined') {
      const qs = new URLSearchParams(window.location.search);
      if (qs.get('checkout') === 'success' || qs.get('pass') === 'success' || qs.get('pass') === 'ok') {
        trackEvent('purchase', { item_name: 'Syndicate Pass', currency: 'EUR', value: 9 });
      }
    }
  }, [routePath]);

  // Synchronisation dynamique de l'écosystème (nouveaux objets & suspects créés en BO)
  useEffect(() => {
    fetch('/api/ecosystem')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        try {
          if (Array.isArray(data.items)) {
            localStorage.setItem('fence_ecosystem_items', JSON.stringify(data.items));
          }
          if (Array.isArray(data.characters)) {
            localStorage.setItem('fence_ecosystem_characters', JSON.stringify(data.characters));
          }
        } catch {}
      })
      .catch(() => {});
  }, []);

  const saveQueue = useRef(Promise.resolve());
  useEffect(() => {
    if (!authUser || !authChecked || !cloudReadyRef.current) return;
    const body = JSON.stringify({
      day, cash, totalProfit, cityHeat, swissBank, streak, lastContractDate, dailyDoneDate,
      districtId, ascensionLevel, maxDaySurvived, seasonXp, lastMemory, inventory,
      upgrades, jokerIds, cityAssets, arcNotes, vengeance, codexDiscovered, factionRep, historyLog,
    });
    let current = true;
    let queued = false;
    let saved = false;
    let timer: number;
    const flush = () => {
      if (!current || queued || saved) return;
      queued = true;
      window.clearTimeout(timer);
      saveQueue.current = saveQueue.current.then(async () => {
        if (!current || !cloudReadyRef.current) return;
        setCloudStatus('syncing');
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 12000);
        try {
          const res = await fetch('/api/profile', {
            method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
            body, signal: controller.signal,
            keepalive: new Blob([body]).size < 60000,
          });
          if (!res.ok) throw new Error('Save unavailable');
          saved = true;
          if (current) setCloudStatus('saved');
        } catch {
          if (current) {
            setCloudStatus('error');
            if (navigator.onLine && !document.hidden) timer = window.setTimeout(flush, 15000);
          }
        } finally {
          queued = false;
          window.clearTimeout(timeout);
        }
      });
    };
    timer = window.setTimeout(flush, 1200);
    window.addEventListener('online', flush);
    document.addEventListener('visibilitychange', flush);
    return () => {
      current = false;
      window.clearTimeout(timer);
      window.removeEventListener('online', flush);
      document.removeEventListener('visibilitychange', flush);
    };
  }, [
    authUser,
    authChecked,
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
  const [tab, selectTab] = useState<TabMode>('counter');
  const dailyOpening = useRef<AbortController | null>(null);
  const [openingDaily, setOpeningDaily] = useState(false);
  const setTab = (next: TabMode) => {
    if (next !== 'daily' && dailyOpening.current) {
      dailyOpening.current.abort();
      dailyOpening.current = null;
      setOpeningDaily(false);
    }
    selectTab(next);
  };
  useEffect(() => () => dailyOpening.current?.abort(), []);
  const [clientsServedToday, setClientsServedToday] = useState(saved?.clientsServedToday ?? 0);
  const dailyRunRef = useRef<{ runId: string; ticket: string } | null>(null);
  const lastArcStep2DayRef = useRef<number>(-1);
  const lastSpecialDayRef = useRef<number>(-1);
  const lastReturnDayRef = useRef<number>(-1);
  const lastWindfallDayRef = useRef<number>(-99);
  const lastHoldupDayRef = useRef<number>(-99);
  const [telemetryOn, setTelemetryOn] = useState<boolean>(() => localStorage.getItem('fence_telemetry') !== '0');
  const scriptedNoticeRef = useRef(false);
  const gameScreen = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const viewport = window.visualViewport;
    const screen = gameScreen.current;
    if (!screen || !viewport) return;
    const resize = () => {
      if (viewport.scale === 1) screen.style.setProperty('--visible-game-height', `${viewport.height}px`);
      else screen.style.removeProperty('--visible-game-height');
    };
    resize();
    viewport.addEventListener('resize', resize);
    return () => viewport.removeEventListener('resize', resize);
  }, [authUser, authChecked, isGameRoute]);
  const threadRef = useRef<HTMLDivElement>(null);
  const followThread = useRef(true);
  const [showItemSheet, setShowItemSheet] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showClientSheet, setShowClientSheet] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [cashWarningCollapsed, setCashWarningCollapsed] = useState(true);
  // Prix demandé à l'acheteur (-1 = valeur de rue par défaut).
  const [buyerAsk, setBuyerAsk] = useState<number>(-1);
  const [gameOverReason, setGameOverReason] = useState<string | null>(null);
  const [showBrief, setShowBrief] = useState(() =>
    !localStorage.getItem('fence_brief_seen') && day === 1 && !saved?.clientsServedToday && (saved?.history.length ?? 0) <= 1
  );

  useEffect(() => {
    const refreshDay = () => setTodayStr(getTodayStr());
    const timer = window.setTimeout(refreshDay, (getSecondsUntilMidnight() + 1) * 1000);
    document.addEventListener('visibilitychange', refreshDay);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', refreshDay);
    };
  }, [todayStr]);

  // Active case state
  const [currentCase, setCurrentCase] = useState<ProceduralCase>(() =>
    saved?.case ?? generateProceduralCase(
      day,
      cityHeat,
      lastMemory || undefined,
      currentDistrict.multiplier,
      gameLocale,
    ),
  );
  const [gauges, setGauges] = useState<Gauges>(saved?.gauges ?? currentCase.initialGauges);
  const [askedPrice, setAskedPrice] = useState<number>(saved?.askedPrice ?? currentCase.initialPrice);
  const [priceTrail, setPriceTrail] = useState<number[]>(saved?.priceTrail ?? [currentCase.initialPrice]);
  const [tell, setTell] = useState<string>(saved?.tell ?? currentCase.openingTell);
  const [outcome, setOutcome] = useState<
    'active' | 'deal_accepte' | 'quitte_la_boutique' | 'sort_son_arme'
  >(saved?.outcome ?? 'active');

  // Player Profile & Commuter Preferences
  const [playerHandle, setPlayerHandle] = useState<string>(() => {
    return localStorage.getItem('fence_player_handle') || '';
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [pendingSellConfirm, setPendingSellConfirm] = useState<{ item: BoughtItem; mode: 'fast' | 'auction' } | null>(null);
  const [pendingDirtyAuction, setPendingDirtyAuction] = useState<BoughtItem | null>(null);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fence_haptics') !== '0';
  });

  const triggerHaptic = (ms: number | number[] = 15) => {
    if (hapticsEnabled && isNative) {
      void Haptics.impact({ style: (Array.isArray(ms) ? 40 : ms) > 20 ? ImpactStyle.Medium : ImpactStyle.Light }).catch(() => {});
      return;
    }
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
    // Preserve a deal already in progress when changing the interface language.
    if (dailyOpening.current || currentCase.isDailyContract || currentCase.special ||
        outcome !== 'active' || history.length > 1 || inspected || uvScanned) return;
    if (currentCase.isBoss) {
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
  const [inspected, setInspected] = useState(saved?.inspected ?? false);
  const [phantomDone, setPhantomDone] = useState(false);
  const [uvScanned, setUvScanned] = useState(saved?.uvScanned ?? false);
  const [grilled, setGrilled] = useState(saved?.grilled ?? { loupe: false, uv: false, radio: false });
  const [radioOpen, setRadioOpen] = useState(saved?.radioOpen ?? false);
  const [offerAmount, setOfferAmount] = useState<number>(
    saved?.offerAmount ?? Math.max(150, Math.round((currentCase.initialPrice * 0.8) / 50) * 50),
  );

  // Chat state
  const [history, setHistory] = useState<ChatTurn[]>(
    saved?.history ?? [{ role: 'npc', content: currentCase.openingLine }],
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const showError = () => {
      if (consumeLoginError()) setError(tt('La connexion a expiré ou a été interrompue. Réessaie avec Google.', 'Sign-in expired or was interrupted. Try Google again.', 'La conexión caducó o se interrumpió. Vuelve a intentarlo con Google.'));
    };
    showError();
    window.addEventListener('cashnoir-login-error', showError);
    return () => window.removeEventListener('cashnoir-login-error', showError);
  }, [gameLocale]);

  // Settings / Debug
  const [debugMode, setDebugMode] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [provider, setProvider] = useState<LLMProvider>('gemini');
  const [quota, setQuota] = useState<NpcQuota | null>(null);
  const [showQuotaInfo, setShowQuotaInfo] = useState(false);
  useEffect(() => {
    fetch('/api/quota').then((r) => (r.ok ? r.json() : null)).then((q) => q && setQuota(q as NpcQuota)).catch(() => {});
  }, []);

  // Le moteur IA actif est piloté côté serveur / BO Admin (/api/health).
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((h) => {
        const p = h?.providers;
        const ap = h?.activeProvider as LLMProvider | undefined;
        setProvider(ap || (p?.gemini ? 'gemini' : p?.groq ? 'groq' : p?.deepseek ? 'deepseek' : 'ollama'));
      })
      .catch(() => setProvider('ollama'));
  }, []);

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const [copiedShare, setCopiedShare] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  useEffect(() => {
    localStorage.setItem('fence_grace', graceUsed ? '1' : '0');
  }, [graceUsed]);
  useEffect(() => {
    if (maxDaySurvived > bestDay) setBestDay(maxDaySurvived);
  }, [maxDaySurvived, bestDay]);
  useEffect(() => {
    localStorage.setItem('fence_best_day', String(bestDay));
  }, [bestDay]);

  // Anti double-clic : une même action d'argent ne peut pas s'exécuter deux fois dans la même fraction de seconde.
  const actionLocks = useRef<Set<string>>(new Set());
  const lockAction = (key: string): boolean => {
    if (actionLocks.current.has(key)) return false;
    actionLocks.current.add(key);
    setTimeout(() => actionLocks.current.delete(key), 700);
    return true;
  };
  const usedPsychoRef = useRef<{ nameHit: boolean; weakHit: boolean }>(
    saved?.used ?? { nameHit: false, weakHit: false },
  );
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
  const [psychoAudit, setPsychoAudit] = useState<AuditEntry[]>(saved?.audit ?? []);
  const [showPsychoAudit, setShowPsychoAudit] = useState(false);
  const [mobileNotebookOpen, setMobileNotebookOpen] = useState(false);

  // Taxe du Syndicat : socle + 8 % de ta caisse. Impossible de thésauriser :
  // plus tu accumules, plus le soir coûte cher (le revenu ne suit plus).
  const nightEvent = getNightEvent(day);
  const rentShare = wealthTax(cash);
  const dailyRent = Math.round(
    (RENT_BASE + (day - 1) * RENT_SLOPE + rentShare) *
      (nightEvent?.rentMultiplier ?? 1) *
      (jokerIds.includes('blanchisseur-express') && !hasCombo(jokerIds, 'blanchisseur', 'blanchisseur-express') ? 1.1 : 1) *
      (ascMod?.rentMult ?? 1),
  ) + debt; // le prêt du Syndicat se rembourse avec le loyer du soir
  const maxClientsPerDay = 3;
  const baseRerolls = Math.max(0, 2 - (ascMod?.rerollPenalty ?? 0));
  const raidAt = 80 - (ascMod?.raidShift ?? 0);
  const heatRaid = cityHeat >= raidAt;

  // Voix robotique TTS désactivée volontairement (sera remplacée par de vraies voix plus tard).
  const speakNPC = (_text: string, _currentGauges: Gauges) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const refreshPass = async () => {
    try {
      const res = await fetch('/api/pass');
      if (res.ok) {
        const data = await res.json();
        setHasPass(Boolean(data.pass));
        setPassOpen(data.mode === 'open');
        setPassManageable(Boolean(data.manageable));
      }
    } catch {
      // Backend hors-ligne : pas de Pass.
    }
  };

  const openBillingPortal = async () => {
    setPassBusy(true);
    try {
      const res = await fetch('/api/pass/portal', { method: 'POST', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        setError(data?.error || tt('Portail de paiement indisponible.', 'Billing portal unavailable.', 'Portal de pago no disponible.'));
        return;
      }
      window.location.assign(data.url as string);
    } catch {
      setError(tt('Serveur de paiement hors-ligne.', 'Payment server offline.', 'Servidor de pago sin conexión.'));
    } finally {
      setPassBusy(false);
    }
  };

  const buyPass = async () => {
    track('pass_click');
    setPassBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/pass/checkout', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        setError(data?.error || tt('Impossible de créer la session de paiement.', 'Could not create the payment session.', 'No se pudo crear la sesión de pago.'));
        return;
      }
      window.location.assign(data.url as string);
    } catch {
      setError(tt('Serveur de paiement hors-ligne.', 'Payment server offline.', 'Servidor de pago sin conexión.'));
    } finally {
      setPassBusy(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session_id');
    if (params.get('pass') === 'claim' && sid) {
      window.location.replace(`/api/pass/claim?session_id=${encodeURIComponent(sid)}`);
      return;
    }
    if (params.get('pass') === 'ok') {
      setPassWelcome(true);
      window.setTimeout(() => setPassWelcome(false), 8000);
    }
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
        setError(tt('Classement indisponible (partie non ouverte côté serveur).', 'Leaderboard unavailable (run not opened on the server).', 'Clasificación no disponible (partida no abierta en el servidor).'));
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
        setError(deal?.error || tt('Le serveur a refusé ce deal.', 'The server rejected this deal.', 'El servidor rechazó este trato.'));
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
        setError(data?.error || tt('Score refusé par le serveur.', 'Score rejected by the server.', 'Puntuación rechazada por el servidor.'));
      }
    } catch {
      setError(tt('Serveur de classement hors-ligne (lance `npm run server`).', 'Leaderboard server offline (run `npm run server`).', 'Servidor de clasificación sin conexión (ejecuta `npm run server`).'));
    }
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 380);
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    sound.muted = nextMuted;
    setMuted(nextMuted);
    if (nextMuted) ambience.stop();
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
        body: (() => {
          const l = localStorage.getItem('fence_locale');
          return l === 'en' ? 'Your daily 24h contract is waiting behind the counter.' : l === 'es' ? 'Tu contrato diario de 24 h te espera tras el mostrador.' : "Ton contrat 24h du jour t'attend derrière le comptoir.";
        })(),
        icon: '/assets/icons/icon-192.png',
        tag: 'fence-daily',
      });
    } catch {
      /* notification refusée par le système : on ignore */
    }
  }, []);

  // Quitter le jeu coupe l'ambiance si elle a été sollicitée.
  useEffect(() => {
    if (muted || !routePath.startsWith('/play')) ambience.stop();
  }, [muted, routePath]);

  useEffect(() => {
    track('session_start');
  }, []);
  useEffect(() => {
    if (gameOverReason) track('game_over', day);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOverReason]);

  // Registre des clients : une entrée par client, ajoutée quand l'issue est connue.
  useEffect(() => {
    if (outcome === 'active' || currentCase.isDailyContract || currentCase.special || loggedCaseRef.current === currentCase.id) return;
    loggedCaseRef.current = currentCase.id;
    const result: RegistryEntry['result'] =
      outcome === 'deal_accepte' ? (currentCase.isTrap ? 'trap' : 'deal') : outcome === 'sort_son_arme' ? 'gun' : 'walk';
    setRegistry((prev) => [
      ...prev.slice(-59),
      {
        id: currentCase.id,
        castId: currentCase.castId,
        portraitId: currentCase.portraitOverride,
        name: currentCase.name,
        gender: currentCase.gender,
        job: currentCase.displayArchetype ?? currentCase.archetype,
        day,
        result,
        paid: result === 'deal' ? askedPrice : 0,
        street: currentCase.streetValue,
      },
    ]);
    if (!currentCase.castId || !currentCase.isTrap) {
      const lows = psychoAudit.filter((e) => e.offer !== undefined && e.floor !== undefined && e.offer < e.floor * 0.78).length;
      setRunStats((st) => ({
        ...st,
        deals: st.deals + (result === 'deal' ? 1 : 0),
        discountSum: st.discountSum + (result === 'deal' && currentCase.initialPrice > 0 ? Math.max(0, ((currentCase.initialPrice - askedPrice) / currentCase.initialPrice) * 100) : 0),
        walkouts: st.walkouts + (result === 'walk' && psychoAudit.length > 1 ? 1 : 0),
        guns: st.guns + (result === 'gun' ? 1 : 0),
        lowballs: st.lowballs + lows,
        trapsBought: st.trapsBought + (result === 'trap' ? 1 : 0),
      }));
    } else if (result === 'trap') {
      setRunStats((st) => ({ ...st, trapsBought: st.trapsBought + 1 }));
    }
    // Saga : la relation évolue à chaque rencontre avec un personnage du casting (pas les infiltrés).
    const cid = currentCase.castId;
    if (cid && !currentCase.isTrap) {
      const encounter: 'deal' | 'walk' | 'gun' = result === 'deal' ? 'deal' : result === 'gun' ? 'gun' : 'walk';
      const margin = currentCase.streetValue > 0 ? 1 - askedPrice / currentCase.streetValue : 0;
      const prevSaga = sagas[cid];
      const next = applyEncounter(prevSaga, cid, day, encounter, margin);
      const g = currentCase.gender;
      let note = '';
      if (next.end && !prevSaga?.end) {
        note = sagaEnding(next.end, gameLocale, currentCase.name, g);
        if (next.end === 'enemy') {
          setCityHeat((h) => Math.min(100, h + 10));
          setVengeance((v) => [...v, { faction: currentCase.faction, day, reason: 'rejected' as const }]);
        }
      }
      const ep = currentCase.saga?.episode ?? 0;
      if (ep >= 3 && ep <= 4 && encounter === 'deal') {
        setFavor({ castId: cid, name: currentCase.name, cost: Math.min(1500, Math.max(200, Math.round((currentCase.streetValue * 0.3) / 50) * 50)) });
      }
      setSagaNote(note);
      setSagas((all) => ({ ...all, [cid]: next }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome, currentCase.id]);

  const heroCastId = seasonHero(campaignSeasonOf(daysSinceStart))?.castId;
  useEffect(() => {
    setFeaturedCast(heroCastId);
  }, [heroCastId]);
  useEffect(() => {
    setAscensionHint(ascMod?.trapBoost ?? 0, ascMod?.floorBoost ?? 0);
  }, [ascMod]);
  useEffect(() => {
    if (ascMod?.heatMin && cityHeat < ascMod.heatMin) setCityHeat(ascMod.heatMin);
  }, [ascMod, cityHeat]);

  // Le générateur adapte la valeur des pièces au cash du joueur (jamais de pièce hors de portée).
  useEffect(() => {
    setPlayerCashHint(cash);
  }, [cash]);

  useEffect(() => {
    followThread.current = true;
  }, [currentCase.id, tab]);

  useEffect(() => {
    const el = threadRef.current;
    if (el && (followThread.current || history[history.length - 1]?.role === 'player')) {
      el.scrollTop = el.scrollHeight;
      followThread.current = true;
    }
  }, [currentCase.id, tab, history, loading, tell, authUser]);

  // Sauvegarde du client en cours (jamais le contrat quotidien, qui a sa propre règle côté serveur).
  useEffect(() => {
    if (currentCase.isDailyContract) return;
    try {
      const snapshot: ClientSession = {
        v: 1, day, case: currentCase, gauges, askedPrice, priceTrail, tell, outcome, history,
        clientsServedToday, inspected, uvScanned, grilled, radioOpen, offerAmount,
        used: usedPsychoRef.current,
        audit: psychoAudit,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(snapshot));
      localStorage.setItem('fence_rerolls', JSON.stringify({ day, left: rerollsLeft }));
    } catch {
      /* stockage plein ou indisponible : pas de sauvegarde de session */
    }
  }, [currentCase, gauges, askedPrice, priceTrail, tell, outcome, history, clientsServedToday, inspected, uvScanned, grilled, radioOpen, offerAmount, rerollsLeft, day, psychoAudit]);

  // Retour du contrat quotidien : on retrouve exactement le client laissé au comptoir.
  const restoreCounterSession = (): boolean => {
    const s = loadSession(day);
    if (!s) return false;
    setCurrentCase(s.case);
    setGauges(s.gauges);
    setAskedPrice(s.askedPrice);
    setPriceTrail(s.priceTrail);
    setTell(s.tell);
    setOutcome(s.outcome);
    setHistory(s.history);
    setInspected(s.inspected);
    setUvScanned(s.uvScanned);
    setGrilled(s.grilled);
    setRadioOpen(s.radioOpen);
    setOfferAmount(s.offerAmount);
    usedPsychoRef.current = s.used;
    setPsychoAudit(s.audit ?? []);
    return true;
  };

  // La réplique d'ouverture cite le prix de base ; si un joker / rang de faction l'a changé, on aligne le texte sur le badge.
  const fixOpeningPrice = (line: string, from: number, to: number): string => {
    if (from === to || from < 1000) return from === to ? line : line.replace(new RegExp(`(?<!\\d)${from}(?!\\d)`), String(to));
    const grouped = String(Math.round(from)).replace(/\B(?=(\d{3})+(?!\d))/g, '[\\s\\u202f\\u00a0,.]?');
    return line.replace(new RegExp(`(?<!\\d)${grouped}(?!\\d)`), formatMoney(to, gameLocale));
  };

  const startNewCase = (nextCase: ProceduralCase, activeJokers: string[] = jokerIds) => {
    setMobileNotebookOpen(false);
    const armedWeapons = activeJokers.includes('vitrine-armee')
      ? inventory.filter((it) => it.category === 'Armement').length
      : 0;
    const ascAnger = nextCase.isDailyContract ? 0 : ascMod?.angerBoost ?? 0;
    const fearBonus =
      (activeJokers.includes('intimidation') ? 15 : 0) +
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
      colere: Math.min(100, nextCase.initialGauges.colere + ascAnger + (revenge?.angerBoost ?? 0)),
      mefiance: Math.max(
        5,
        Math.min(
          100,
          nextCase.initialGauges.mefiance +
            (nextCase.isDailyContract ? 0 : temperamentOf(nextCase.castId)?.trust ?? 0) +
            suspicionBonus +
            (revenge?.mefianceBoost ?? 0) +
            (facRank?.mefianceDelta ?? 0),
        ),
      ),
    });
    // Negociateur joker + Faction rank discount
    const facPriceMult = facRank?.priceMult ?? 1;
    const negoMult = (activeJokers.includes('negociateur') ? 0.9 : 1) * (hasCombo(activeJokers, 'negociateur', 'intimidation') ? 0.95 : 1);
    const priceAfterNego =
      facPriceMult !== 1 || negoMult !== 1
        ? Math.round((nextCase.initialPrice * negoMult * facPriceMult) / 50) * 50
        : nextCase.initialPrice;
    const floorAfterNego =
      facPriceMult !== 1 || negoMult !== 1
        ? Math.round((nextCase.floorPrice * negoMult * facPriceMult) / 50) * 50
        : nextCase.floorPrice;

    // Aligne la fiche de cas (prix initial, prompt système et réplique d'ouverture) sur le prix remisé
    const fixedOpening = fixOpeningPrice(nextCase.openingLine, nextCase.initialPrice, priceAfterNego);
    const adjustedPrompt = priceAfterNego !== nextCase.initialPrice
      ? nextCase.systemPrompt.replace(new RegExp(`\\b${nextCase.initialPrice}\\b`, 'g'), String(priceAfterNego))
      : nextCase.systemPrompt;

    setCurrentCase({
      ...nextCase,
      initialPrice: priceAfterNego,
      floorPrice: floorAfterNego,
      openingLine: fixedOpening,
      systemPrompt: adjustedPrompt,
    });
    setAskedPrice(priceAfterNego);
    setPriceTrail(priceAfterNego !== nextCase.initialPrice ? [nextCase.initialPrice, priceAfterNego] : [priceAfterNego]);
    setPsychoAudit([
      {
        id: 'audit-0',
        turn: 0,
        action: tt('Entrée au comptoir', 'Enters counter', 'Entrada al mostrador'),
        peur: Math.min(100, nextCase.initialGauges.peur + fearBonus),
        peurDelta: fearBonus,
        colere: Math.min(100, nextCase.initialGauges.colere + ascAnger + (revenge?.angerBoost ?? 0)),
        colereDelta: revenge?.angerBoost ?? 0,
        mefiance: Math.max(5, Math.min(100, nextCase.initialGauges.mefiance + suspicionBonus + (revenge?.mefianceBoost ?? 0) + (facRank?.mefianceDelta ?? 0))),
        mefianceDelta: suspicionBonus + (revenge?.mefianceBoost ?? 0) + (facRank?.mefianceDelta ?? 0),
        price: priceAfterNego,
        priceDelta: 0,
      },
    ]);
    setShowPsychoAudit(false);
    usedPsychoRef.current = { nameHit: false, weakHit: false };
    setGrilled({ loupe: false, uv: false, radio: false });
    setTell(revenge?.flavorText ?? nextCase.openingTell);
    // Collectionneur joker or Codex Œil d'Expert perk: detect contrefacon on sight
    if (
      (activeJokers.includes('collectionneur') || activeCodexPerks.includes('Œil d’Expert')) &&
      nextCase.item.modifier === 'contrefacon'
    ) {
      setTell((prev) => prev + tt(' [EXPERT] Tu repères une contrefaçon au premier coup d’œil.', ' [EXPERT] You spot a forgery at first glance.', ' [EXPERTO] Detectas una falsificación a primera vista.'));
    }
    setOutcome('active');
    setInspected(false);
    setUvScanned(false);
    setPhantomDone(false);
    setRadioOpen(false);
    setHistory([{ role: 'npc', content: fixedOpening }]);
    setError(null);
    setOfferAmount(Math.max(150, Math.min(cash, Math.round((priceAfterNego * 0.8) / 50) * 50)));
    setBuyerAsk(-1);
    setSagaNote('');
    setFavor(null);
  };

  const startSeasonEpisode = (ep: SeasonEpisode) => {
    if (daysUntilEpisode(SEASON_EPISODES.findIndex((e) => e.id === ep.id), daysSinceStart) > 0) return;
    if (outcome === 'active' && history.length > 1) {
      setError(tt('Termine ce client (ou refuse-le) avant de lancer un épisode.', 'Finish this client (or turn them down) before starting an episode.', 'Termina con este cliente (o recházalo) antes de lanzar un episodio.'));
      setTab('counter');
      return;
    }
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
      tt(`[HEAT ≥ 90 %] Contrôle de police devant la boutique : ${mny(bribe)} de pot-de-vin payés pour les faire partir (Heat retombé à 70 %).`, `[HEAT ≥ 90%] Police check outside the shop: ${mny(bribe)} in bribes paid to make them leave (Heat back to 70%).`, `[HEAT ≥ 90 %] Control policial frente a la tienda: ${mny(bribe)} en sobornos para que se vayan (Heat baja a 70 %).`),
    );
    return true;
  };

  // ---------- Clients spéciaux : le joueur VEND (acheteur) ou achète de la discrétion (indic) ----------
  const roundTo50 = (n: number) => Math.round(n / 50) * 50;

  const buildBuyerCase = (item: BoughtItem): ProceduralCase => {
    const base = generateProceduralCase(day, 0, undefined, currentDistrict.multiplier, gameLocale);
    const trend = item.category ? marketTrends[item.category] ?? 1 : 1;
    // Plafond caché : jusqu'où il paiera. Une pièce encore chaude vaut moins pour lui.
    const ceiling = Math.max(100, roundTo50(item.streetValue * (0.95 + Math.random() * 0.35) * (item.cleaned ? 1 : 0.85) * trend));
    const offer = Math.max(50, roundTo50(ceiling * 0.62));
    const nm = localizeItemName(item.name, gameLocale);
    return {
      ...base,
      id: `buyer-${Date.now()}`,
      isTrap: false,
      isBoss: false,
      bossKind: undefined,
      arcId: undefined,
      arcStep: undefined,
      requiresItemKey: undefined,
      item: { ...base.item, name: item.name, category: item.category ?? base.item.category, modifier: undefined, hotLevel: item.hotLevel },
      initialPrice: offer,
      floorPrice: 0,
      streetValue: item.streetValue,
      initialGauges: { peur: 0, colere: 0, mefiance: 20 },
      openingLine: tt(
        `« On m'a dit que tu as ${nm}. C'est exactement ce que je cherche. Je t'en donne ${mny(offer)}, cash. »`,
        `"I heard you have ${nm}. It's exactly what I'm after. I'll give you ${mny(offer)}, cash."`,
        `«Me han dicho que tienes ${nm}. Es justo lo que busco. Te doy ${mny(offer)}, en efectivo.»`,
      ),
      openingTell: tt('Un acheteur : cette fois, c’est toi qui vends. Il ouvre bas, il a une limite.', 'A buyer: this time you are the seller. He opens low, and he has a limit.', 'Un comprador: esta vez vendes tú. Abre bajo y tiene un límite.'),
      special: { kind: 'buyer', itemId: item.id, ceiling, offer, patience: 3 },
    };
  };

  const buildInformantCase = (): ProceduralCase => {
    const base = generateProceduralCase(day, 0, undefined, currentDistrict.multiplier, gameLocale);
    return {
      ...base,
      id: `informant-${Date.now()}`,
      isTrap: false,
      isBoss: false,
      bossKind: undefined,
      arcId: undefined,
      arcStep: undefined,
      requiresItemKey: undefined,
      item: { ...base.item, name: tt('Info police', 'Police intel', 'Info policial'), modifier: undefined },
      initialPrice: 0,
      floorPrice: 0,
      initialGauges: { peur: 0, colere: 0, mefiance: 30 },
      openingLine: tt(
        '« J’ai un cousin à la brigade. Pour un peu de cash, je peux faire retomber la pression sur ta boutique. »',
        '"I have a cousin at the precinct. For some cash I can take the heat off your shop."',
        '«Tengo un primo en la comisaría. Por algo de efectivo puedo aliviar la presión sobre tu tienda.»',
      ),
      openingTell: tt('Un indic : il ne vend aucun objet, seulement du silence.', 'An informant: no item, only silence for sale.', 'Un confidente: no vende objetos, solo silencio.'),
      special: { kind: 'informant' },
    };
  };

  // Clients qui reviennent : une mini-série de 5 épisodes par personnage ; un allié fidèle revient avec ses trouvailles.
  const buildSagaCase = (sg: SagaState): ProceduralCase | null => {
    const castChar = CAST_ROSTER.find((c) => c.id === sg.castId);
    if (!castChar) return null;
    const base = generateProceduralCase(day, cityHeat, lastMemory || undefined, currentDistrict.multiplier, gameLocale);
    const ally = sg.end === 'ally';
    const episode = ally ? SAGA_EPISODES : nextEpisode(sg);
    const item = localizeItemName(base.item.name, gameLocale);
    const initialPrice = ally ? Math.max(100, Math.round((base.initialPrice * 0.75) / 50) * 50) : base.initialPrice;
    const floorPrice = ally ? Math.max(50, Math.round((base.floorPrice * 0.75) / 50) * 50) : base.floorPrice;
    const chapter = ally ? tt('Allié fidèle', 'Loyal ally', 'Aliado fiel') : sagaChapter(episode, gameLocale);
    const opening = ally ? sagaAllyGift(gameLocale, item, mny(initialPrice)) : sagaOpening(castChar.profileId, episode, gameLocale, sg.trust, item, mny(initialPrice));
    const g = base.initialGauges;
    const mefiance = Math.max(5, Math.min(100, g.mefiance - Math.round(sg.trust / 4)));
    const colere = Math.max(0, Math.min(100, g.colere + (sg.trust < 0 ? Math.round(-sg.trust / 5) : 0)));
    const tone = trustTone(sg.trust);
    const memory = `\nMÉMOIRE (importante) : tu as déjà rencontré ce joueur ${sg.met} fois ; c'est l'épisode ${episode}/${SAGA_EPISODES} de ton histoire personnelle. Ta relation avec lui : ${tone}. Fais-y allusion une fois, naturellement, sans réciter.`;
    return {
      ...base,
      id: `saga-${sg.castId}-${Date.now()}`,
      castId: castChar.id,
      gender: castChar.gender,
      name: castChar.fullName,
      age: castChar.age,
      faction: castChar.faction,
      archetype: castChar.job,
      displayArchetype: undefined,
      portraitOverride: undefined,
      isTrap: false,
      isBoss: false,
      bossKind: undefined,
      arcId: undefined,
      arcStep: undefined,
      requiresItemKey: undefined,
      initialPrice,
      floorPrice,
      initialGauges: { peur: g.peur, colere, mefiance },
      openingLine: opening,
      openingTell: ally
        ? tt('Un allié de la maison : la confiance règne.', 'A friend of the house: trust runs deep.', 'Un aliado de la casa: reina la confianza.')
        : `${sagaTell(episode, gameLocale, castChar.gender)} ${sagaKnows(gameLocale, sagaFacts(sg.met, localizeSecret(castChar.secret, gameLocale), localizeCastText(castChar.weaknessHint, gameLocale), localizeCastText(castChar.redLineHint, gameLocale)))}`.trim(),
      systemPrompt: base.systemPrompt + memory,
      saga: { episode, ally, chapter },
    };
  };

  const spawnNextCase = (isLastClient = false): ProceduralCase => {
    // BOSS : priorité absolue sur le 3e client des jours 3, 6, 9… Aucun arc ne le remplace.
    if (isLastClient && day >= 3 && day % 3 === 0) {
      return generateBossCase(day, cityHeat, currentDistrict.multiplier, gameLocale);
    }
    const activeNote = arcNotes.find((n) => !n.resolved);
    // Étape 2 d'un arc : au maximum UNE fois par jour ingame pour éviter de spammer le joueur
    if (activeNote && lastArcStep2DayRef.current !== day && (isLastClient || Math.random() < 0.45)) {
      const arc = STORY_ARCS.find((a) => a.id === activeNote.arcId);
      if (arc) {
        lastArcStep2DayRef.current = day;
        const hasItem = inventory.some((i) => i.arcItemKey === arc.itemKey);
        return buildArcStep2Case(arc, hasItem, currentDistrict.multiplier, gameLocale);
      }
    }
    // Client spécial (un par jour, en dernier) : un acheteur pour une pièce du coffre, ou un indic quand le Heat monte.
    if (isLastClient && day >= 2 && lastSpecialDayRef.current !== day) {
      const sellable = inventory.filter((i) => !i.arcItemKey && i.secretState !== 'open');
      if (sellable.length > 0 && Math.random() < 0.55) {
        lastSpecialDayRef.current = day;
        return buildBuyerCase(sellable[Math.floor(Math.random() * sellable.length)]);
      }
      if (cityHeat >= 30 && Math.random() < 0.35) {
        lastSpecialDayRef.current = day;
        return buildInformantCase();
      }
      if (cityHeat >= 55 && Math.random() < 0.3) {
        lastSpecialDayRef.current = day;
        return buildEventCase('checkpoint');
      }
      if (cash >= 3000 && day >= 4 && day - lastHoldupDayRef.current >= 6 && Math.random() < 0.25) {
        lastSpecialDayRef.current = day;
        lastHoldupDayRef.current = day;
        return buildEventCase('holdup');
      }
    }
    // 30 % : un client de ta saga revient (jamais le dernier du jour, une fois par jour).
    if (!isLastClient && lastReturnDayRef.current !== day && Math.random() < 0.3) {
      const due = pickDue(sagas, day, Math.random);
      const back = due ? buildSagaCase(due) : null;
      if (back) {
        lastReturnDayRef.current = day;
        return back;
      }
    }
    // Trouvaille rare (1 chance sur 50 par client, au plus une par semaine) : une pièce légendaire bradée par quelqu'un qui ignore sa valeur.
    if (!isLastClient && day >= 4 && day - lastWindfallDayRef.current >= 6 && Math.random() < 0.02) {
      lastWindfallDayRef.current = day;
      return generateWindfallCase(day, cityHeat, gameLocale);
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

  // Coups de théâtre à choix (jamais de chrono) : contrôle de police quand le Heat monte, braquage quand la caisse est pleine.
  const buildEventCase = (event: 'checkpoint' | 'holdup'): ProceduralCase => {
    const base = generateProceduralCase(day, 0, undefined, currentDistrict.multiplier, gameLocale);
    const isCheck = event === 'checkpoint';
    return {
      ...base,
      id: `event-${event}-${Date.now()}`,
      isTrap: false,
      isBoss: false,
      bossKind: undefined,
      arcId: undefined,
      arcStep: undefined,
      requiresItemKey: undefined,
      item: { ...base.item, name: isCheck ? tt('Contrôle de police', 'Police check', 'Control policial') : tt('Braquage', 'Holdup', 'Atraco'), modifier: undefined },
      initialPrice: 0,
      floorPrice: 0,
      initialGauges: { peur: 0, colere: 0, mefiance: 30 },
      openingLine: isCheck
        ? tt('Deux voitures banalisées se garent devant la boutique. Un agent frappe à la vitre : « Contrôle. On peut entrer ? »', 'Two unmarked cars park outside. An officer knocks on the glass: "Routine check. May we come in?"', 'Dos coches camuflados aparcan frente a la tienda. Un agente golpea el cristal: «Control. ¿Podemos pasar?»')
        : tt('La porte s’ouvre d’un coup. Un type cagoulé braque le comptoir : « La caisse. Maintenant. »', 'The door bursts open. A masked man levels a gun at the counter: "The register. Now."', 'La puerta se abre de golpe. Un encapuchado apunta al mostrador: «La caja. Ahora.»'),
      openingTell: isCheck ? tt('Le Heat a fini par attirer du monde.', 'The Heat finally drew attention.', 'El Heat acabó atrayendo atención.') : tt('Ta caisse bien garnie ne passait pas inaperçue.', 'Your full register did not go unnoticed.', 'Tu caja llena no pasaba desapercibida.'),
      special: { kind: 'event', event },
    };
  };

  const resolveEvent = (choice: 'a' | 'b' | 'c') => {
    const sp = currentCase.special;
    if (outcome !== 'active' || sp?.kind !== 'event' || !lockAction(`event-${currentCase.id}`)) return;
    const clampHeat = (d: number) => setCityHeat((h) => Math.max(0, Math.min(100, h + d)));
    let msg = '';
    if (sp.event === 'checkpoint') {
      const bribe = Math.min(2000, Math.max(300, Math.round((cash * 0.05) / 50) * 50));
      if (choice === 'a') {
        if (cash < bribe) { setError(tt(`Il te faut ${mny(bribe)}.`, `You need ${mny(bribe)}.`, `Necesitas ${mny(bribe)}.`)); return; }
        setCash((c) => c - bribe);
        clampHeat(-20);
        msg = tt(`Tu glisses ${mny(bribe)} : ils repartent. Heat −20 %.`, `You slip them ${mny(bribe)}: they leave. Heat −20%.`, `Les das ${mny(bribe)}: se van. Heat −20 %.`);
      } else {
        clampHeat(10);
        const lost = inventory.filter((i) => !i.arcItemKey && i.secretState !== 'open');
        if (lost.length > 0 && Math.random() < 0.4) {
          const it = lost[Math.floor(Math.random() * lost.length)];
          setInventory((inv) => inv.filter((i) => i.id !== it.id));
          msg = tt(`Tu fais profil bas, mais ils repartent avec ${it.name}. Heat +10 %.`, `You keep a low profile, but they leave with ${it.name}. Heat +10%.`, `Mantienes un perfil bajo, pero se llevan ${it.name}. Heat +10 %.`);
        } else {
          msg = tt('Tu fais profil bas : ils ne trouvent rien et repartent. Heat +10 %.', 'You keep a low profile: they find nothing and leave. Heat +10%.', 'Mantienes un perfil bajo: no encuentran nada y se van. Heat +10 %.');
        }
      }
    } else if (choice === 'a') {
      const loss = Math.round((cash * 0.15) / 50) * 50;
      setCash((c) => Math.max(0, c - loss));
      msg = tt(`Tu cèdes ${mny(loss)} (15 % de la caisse). Il disparaît dans la nuit.`, `You hand over ${mny(loss)} (15% of the register). He vanishes into the night.`, `Cedes ${mny(loss)} (15 % de la caja). Desaparece en la noche.`);
    } else if (choice === 'b') {
      clampHeat(5);
      msg = tt('Tu déclenches la porte blindée : il détale. Heat +5 %.', 'You trigger the armored door: he bolts. Heat +5%.', 'Activas la puerta blindada: sale corriendo. Heat +5 %.');
    } else if (Math.random() < 0.5) {
      msg = tt('Tu lui tiens tête sans trembler : il bat en retraite, personne n’a perdu un dollar.', 'You stare him down: he backs off, nobody lost a dollar.', 'Le plantas cara sin temblar: retrocede, nadie perdió un dólar.');
    } else {
      const loss = Math.round((cash * 0.3) / 50) * 50;
      setCash((c) => Math.max(0, c - loss));
      sound.playDanger();
      msg = tt(`Le bluff rate : il vide ${mny(loss)} (30 % de la caisse).`, `The bluff fails: he empties ${mny(loss)} (30% of the register).`, `El farol falla: vacía ${mny(loss)} (30 % de la caja).`);
    }
    setHistory((prev) => [...prev, { role: 'npc', content: msg }]);
    setTell(msg);
    setOutcome('quitte_la_boutique');
  };

  const leaveSpecial = () => {
    if (outcome !== 'active' || !currentCase.special) return;
    const msg = tt('Tu le laisses partir. Il reviendra peut-être.', 'You let him go. He may come back.', 'Lo dejas ir. Quizá vuelva.');
    setHistory((prev) => [...prev, { role: 'npc', content: tt('« Comme tu veux. »', '"Suit yourself."', '«Como quieras.»') }]);
    setTell(msg);
    setOutcome('quitte_la_boutique');
  };

  const finishBuyerSale = (price: number) => {
    const sp = currentCase.special;
    if (outcome !== 'active' || sp?.kind !== 'buyer') return;
    const target = inventory.find((i) => i.id === sp.itemId);
    if (!target) {
      leaveSpecial();
      return;
    }
    if (!lockAction(`buyer-${currentCase.id}`)) return;
    sound.playDealSuccess();
    const profit = price - target.paid;
    setCash((c) => c + price);
    setTotalProfit((p) => p + profit);
    if (target.category) setSoldCategories((prev) => ({ ...prev, [target.category!]: (prev[target.category!] || 0) + 1 }));
    setCityHeat((h) => (target.cleaned ? Math.max(0, h - 3) : Math.min(100, h + 6)));
    setSeasonXp((xp) => xp + 60);
    setInventory((inv) => inv.filter((i) => i.id !== target.id));
    appendHistory(
      'sell',
      tt(`Vente à un acheteur : ${target.name} (marge ${profit >= 0 ? '+' : ''}${profit} $)`, `Sold to a buyer: ${target.name} (margin ${profit >= 0 ? '+' : ''}${profit} $)`, `Venta a un comprador: ${target.name} (margen ${profit >= 0 ? '+' : ''}${profit} $)`),
      price,
    );
    const msg = tt(
      `Vendu ${mny(price)} (marge ${profit >= 0 ? '+' : ''}${mny(profit)}). Il part avec la pièce.`,
      `Sold for ${mny(price)} (margin ${profit >= 0 ? '+' : ''}${mny(profit)}). He leaves with the piece.`,
      `Vendido por ${mny(price)} (margen ${profit >= 0 ? '+' : ''}${mny(profit)}). Se va con la pieza.`,
    );
    setHistory((prev) => [...prev, { role: 'npc', content: tt('« Marché conclu. »', '"Deal."', '«Trato hecho.»') }]);
    setTell(msg);
    setOutcome('quitte_la_boutique');
  };

  // Arguments de vente : vrais = le plafond de l'acheteur monte un peu ; faux = il le sent et perd patience.
  const BUYER_ARGS: { key: string; fr: string; en: string; es: string }[] = [
    { key: 'clean', fr: 'Pièce propre : aucune trace, aucun risque.', en: 'Clean piece: no trace, no risk.', es: 'Pieza limpia: sin rastro, sin riesgo.' },
    { key: 'rare', fr: 'Très rare : tu n’en verras pas deux.', en: 'Very rare: you will not see another.', es: 'Muy rara: no verás otra igual.' },
    { key: 'trend', fr: 'Le marché monte sur ce type de pièce.', en: 'The market is rising on this kind of piece.', es: 'El mercado sube con este tipo de pieza.' },
  ];
  const isBuyerArgTrue = (key: string, item: BoughtItem): boolean => {
    if (key === 'clean') return item.cleaned;
    if (key === 'rare') return ['rare', 'epique', 'legendaire', 'mythique'].includes(item.rarity ?? '') || item.modifier === 'collection';
    return (item.category ? marketTrends[item.category] ?? 1 : 1) > 1;
  };
  const useBuyerArgument = (key: string) => {
    const sp = currentCase.special;
    if (outcome !== 'active' || sp?.kind !== 'buyer' || (sp.used ?? []).includes(key)) return;
    const arg = BUYER_ARGS.find((a) => a.key === key);
    const target = inventory.find((i) => i.id === sp.itemId);
    if (!arg || !target) return;
    const line = gameLocale === 'en' ? arg.en : gameLocale === 'es' ? arg.es : arg.fr;
    const used = [...(sp.used ?? []), key];
    setHistory((prev) => [...prev, { role: 'player', content: line }]);
    if (isBuyerArgTrue(key, target)) {
      const ceiling = Math.min(roundTo50(target.streetValue * 1.3), Math.max(sp.ceiling, roundTo50(sp.ceiling * 1.08)));
      setCurrentCase((c) => ({ ...c, special: { ...sp, ceiling, used } }));
      setHistory((prev) => [...prev, { role: 'npc', content: tt('« Hm. Ça, c’est un point. »', '"Hm. That is a point."', '«Hm. Eso es un punto.»') }]);
      setTell(tt('Il hoche la tête : l’argument porte.', 'He nods: the argument lands.', 'Asiente: el argumento cuela.'));
      return;
    }
    const patience = sp.patience - 1;
    if (patience <= 0) {
      sound.playDanger();
      setHistory((prev) => [...prev, { role: 'npc', content: tt('« Tu me prends pour un débutant ? Salut. »', '"You take me for a rookie? Bye."', '«¿Me tomas por novato? Adiós.»') }]);
      setTell(tt('Il a flairé le bluff et s’en va. La pièce reste au coffre.', 'He smelled the bluff and walks out. The piece stays in the vault.', 'Olió el farol y se va. La pieza se queda en la caja.'));
      setCurrentCase((c) => ({ ...c, special: { ...sp, patience: 0, used } }));
      setOutcome('quitte_la_boutique');
      return;
    }
    setCurrentCase((c) => ({ ...c, special: { ...sp, patience, used } }));
    setHistory((prev) => [...prev, { role: 'npc', content: tt('« Ça sent le bluff. Je connais ce marché. »', '"Smells like a bluff. I know this market."', '«Huele a farol. Conozco este mercado.»') }]);
    setTell(tt('Il plisse les yeux : mauvais argument, il perd patience.', 'He narrows his eyes: bad argument, he loses patience.', 'Entrecierra los ojos: mal argumento, pierde paciencia.'));
  };

  // Service demandé par un client de saga (épisodes 3 et 4) : l'aider rapproche, refuser refroidit.
  const resolveFavor = (helped: boolean) => {
    if (!favor || !lockAction(`favor-${favor.castId}`)) return;
    if (helped) {
      if (cash < favor.cost) {
        setError(tt(`Il te faut ${mny(favor.cost)}.`, `You need ${mny(favor.cost)}.`, `Necesitas ${mny(favor.cost)}.`));
        return;
      }
      setCash((c) => c - favor.cost);
      appendHistory('sell', tt(`Service rendu à ${favor.name}`, `Favor for ${favor.name}`, `Favor a ${favor.name}`), -favor.cost);
    }
    setSagas((all) => (all[favor.castId] ? { ...all, [favor.castId]: applyFavor(all[favor.castId], helped) } : all));
    setSagaNote(helped ? tt('Tu l’as aidé : ça restera dans sa mémoire.', 'You helped: it will stay in memory.', 'Lo ayudaste: quedará en su memoria.') : tt('Tu as refusé : ça restera dans sa mémoire aussi.', 'You refused: that will stay in memory too.', 'Te negaste: también quedará en su memoria.'));
    setFavor(null);
  };

  const acceptBuyerOffer = () => {
    if (currentCase.special?.kind === 'buyer') finishBuyerSale(currentCase.special.offer);
  };

  const proposeBuyerPrice = () => {
    const sp = currentCase.special;
    if (outcome !== 'active' || sp?.kind !== 'buyer') return;
    const x = buyerAsk < 0 ? roundTo50(currentCase.streetValue) : buyerAsk;
    if (x < 50) return;
    setHistory((prev) => [...prev, { role: 'player', content: tt(`Mon prix : ${mny(x)}.`, `My price: ${mny(x)}.`, `Mi precio: ${mny(x)}.`) }]);
    if (x <= sp.offer) {
      finishBuyerSale(sp.offer);
      return;
    }
    if (x <= sp.ceiling) {
      finishBuyerSale(x);
      return;
    }
    const patience = sp.patience - 1;
    if (patience <= 0) {
      sound.playDanger();
      const msg = tt('Il perd patience et s’en va. La pièce reste au coffre.', 'He loses patience and walks out. The piece stays in the vault.', 'Pierde la paciencia y se va. La pieza se queda en la caja.');
      setHistory((prev) => [...prev, { role: 'npc', content: tt('« Tu me fais perdre mon temps. Salut. »', '"You are wasting my time. Bye."', '«Me haces perder el tiempo. Adiós.»') }]);
      setTell(msg);
      setCurrentCase((c) => ({ ...c, special: { ...sp, patience: 0 } }));
      setOutcome('quitte_la_boutique');
      return;
    }
    const close = x <= sp.ceiling * 1.12;
    const offer = close ? Math.min(sp.ceiling, Math.max(sp.offer, roundTo50((sp.offer + sp.ceiling) / 2))) : sp.offer;
    setCurrentCase((c) => ({ ...c, special: { ...sp, offer, patience } }));
    setHistory((prev) => [
      ...prev,
      {
        role: 'npc',
        content: close
          ? tt(`« Pas loin… je monte à ${mny(offer)}. Mais ne tire pas sur la corde. »`, `"Not far off… I'll go up to ${mny(offer)}. Don't push your luck."`, `«No está lejos… subo a ${mny(offer)}. Pero no tires de la cuerda.»`)
          : tt(`« Tu me prends pour un pigeon ? Mon offre reste ${mny(offer)}. »`, `"Take me for a fool? My offer stays at ${mny(offer)}."`, `«¿Me tomas por tonto? Mi oferta sigue en ${mny(offer)}.»`),
      },
    ]);
    setTell(
      close
        ? tt('Il hésite : tu es tout près de son plafond.', 'He wavers: you are close to his ceiling.', 'Duda: estás cerca de su límite.')
        : tt('Sa mâchoire se crispe : tu es très loin de son plafond.', 'His jaw tightens: you are far above his ceiling.', 'Se le tensa la mandíbula: estás muy por encima de su límite.'),
    );
  };

  const buyTip = (cost: number, drop: number) => {
    if (outcome !== 'active' || currentCase.special?.kind !== 'informant') return;
    if (cash < cost) {
      setError(tt(`Il te faut ${mny(cost)}.`, `You need ${mny(cost)}.`, `Necesitas ${mny(cost)}.`));
      return;
    }
    if (!lockAction(`tip-${currentCase.id}`)) return;
    sound.playCashSlap();
    setCash((c) => c - cost);
    setCityHeat((h) => Math.max(0, h - drop));
    appendHistory('sell', tt(`Pot-de-vin à un indic : Heat −${drop} %`, `Informant bribe: Heat −${drop}%`, `Soborno a un confidente: Heat −${drop} %`), -cost);
    const msg = tt(`Payé ${mny(cost)} : Heat −${drop} %. Il disparaît dans la nuit.`, `Paid ${mny(cost)}: Heat −${drop}%. He vanishes into the night.`, `Pagado ${mny(cost)}: Heat −${drop} %. Desaparece en la noche.`);
    setHistory((prev) => [...prev, { role: 'npc', content: tt('« Les flics regarderont ailleurs cette semaine. »', '"The cops will look elsewhere this week."', '«La policía mirará a otro lado esta semana.»') }]);
    setTell(msg);
    setOutcome('quitte_la_boutique');
  };

  // Phrase d'attaque « faille » : le cadre varie selon le client, la faille est celle du personnage.
  const flawLine = (hint: string): string => {
    const k = [...currentCase.id].reduce((a, c) => a + c.charCodeAt(0), 0) % 4;
    const F: [string, string, string][] = [
      [`Arrête ton cinéma : ${hint} Baisse ton tarif.`, `Cut the drama: ${hint} Drop your price.`, `Déjate de cuentos: ${hint} Baja tu precio.`],
      [`Je vois clair dans ton jeu : ${hint} Fais un effort sur le prix.`, `I see through you: ${hint} Make an effort on the price.`, `Te veo venir: ${hint} Esfuérzate con el precio.`],
      [`Ne fais pas l’innocent : ${hint} Alors on discute, mais plus bas.`, `Don't play innocent: ${hint} So we talk, but lower.`, `No te hagas el inocente: ${hint} Así que hablamos, pero más bajo.`],
      [`Tout le monde sait ce qu’il en est : ${hint} Descends ton prix.`, `Everyone knows how it is: ${hint} Bring your price down.`, `Todos saben cómo es: ${hint} Baja tu precio.`],
    ];
    return tt(...F[k]);
  };

  const nextProceduralClient = () => {
    if (policeCheckIfHot()) return;

    // Si le joueur passe sans livrer la pièce requise à l'étape 2, la piste est morte et ne réapparaît plus
    if (currentCase.arcStep === 2) {
      const hasItem = inventory.some((i) => i.arcItemKey === currentCase.requiresItemKey);
      if (!hasItem) {
        setArcNotes((prev) =>
          prev.map((n) => (n.arcId === currentCase.arcId ? { ...n, resolved: true } : n)),
        );
      }
    }

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
      setError(tt('Contrat quotidien : une seule tentative.', 'Daily contract: one attempt only.', 'Contrato diario: un solo intento.'));
      return;
    }
    if (policeCheckIfHot()) return;
    if (rerollsLeft <= 0) {
      setError(tt("Plus de tirage aujourd'hui : le marché est sec, reviens demain.", 'No more reshuffles today: the market is dry, come back tomorrow.', 'No quedan cambios hoy: el mercado está seco, vuelve mañana.'));
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

  const openDailyContract = async () => {
    if (dailyOpening.current || loading) return;
    setTab('daily');
    if (currentCase.isDailyContract && currentCase.id.startsWith(`daily-${todayStr}-`)) return;
    const request = new AbortController();
    dailyOpening.current = request;
    setOpeningDaily(true);
    const timeout = window.setTimeout(() => request.abort(), 12000);
    try {
      await startDailyContract(gameLocale, request);
    } finally {
      window.clearTimeout(timeout);
      if (dailyOpening.current === request) {
        dailyOpening.current = null;
        setOpeningDaily(false);
      }
    }
  };

  const startDailyContract = async (loc: Locale, request: AbortController) => {
    setScoreSubmitted(false);
    void fetchLeaderboard();
    fetch('/api/leaderboard/highlight')
      .then((r) => r.json())
      .then((h) => setHighlight(h?.line ? h : null))
      .catch(() => setHighlight(null));
    track('daily_start');
    void fetchHistory();
    fetch('/api/league').then((r) => r.json()).then((l) => setLeague(l?.standings ? l : null)).catch(() => setLeague(null));

    // Le serveur ouvre la partie dès le début : il compte les tours de négociation.
    dailyRunRef.current = null;
    try {
      const r = await fetch('/api/run/start', { method: 'POST', signal: request.signal });
      if (r.status === 409) {
        const e = await r.json().catch(() => ({}));
        if (dailyOpening.current !== request) return;
        setError(e?.error || tt('Contrat quotidien déjà tenté aujourd’hui.', 'Daily contract already attempted today.', 'Contrato diario ya intentado hoy.'));
        setTab('counter');
        return;
      }
      if (r.ok) {
        const { runId, ticket } = await r.json();
        if (dailyOpening.current !== request) return;
        dailyRunRef.current = { runId, ticket };
      }
    } catch {
      // Hors-ligne : pas de run, donc pas de publication au classement.
    }

    if (dailyOpening.current !== request) return;
    startNewCase(generateDailyContract(todayStr, undefined, loc));
  };

  const dailyRouteOpened = useRef(false);
  useEffect(() => {
    if (routePath !== '/play/daily') {
      dailyRouteOpened.current = false;
    } else if (authChecked && !profileFailed && authUser && !dailyRouteOpened.current) {
      dailyRouteOpened.current = true;
      void openDailyContract();
    }
  }, [routePath, authUser, authChecked, profileFailed]);

  const resetEmpire = () => {
    setDay(1);
    setCash(2500 + legacyBonus);
    setDebt(0);
    setGraceUsed(false);
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
    setSagas((a) => rebaseSagas(a));
    setRunStats(EMPTY_RUN_STATS);
    setTab('counter');
    startNewCase(generateProceduralCase(1, 15, undefined, 1, gameLocale));
  };

  // Reprise au dernier palier atteint : mêmes remises à zéro qu'un nouveau départ, mais au jour du chapitre validé.
  const restartFromCheckpoint = () => {
    const cp = chapterStart(bestDay);
    track('checkpoint_restart', cp);
    setDay(cp);
    setCash(checkpointCash(cp, ascMod?.rentMult ?? 1));
    setDebt(0);
    setGraceUsed(false);
    setTotalProfit(0);
    setCityHeat(15);
    setInventory([]);
    setUpgrades({ uvLamp: false, armoredDoor: false, gpsJammer: false });
    setLastMemory('');
    setJokerIds([]);
    setJokerDraft(null);
    setClientsServedToday(0);
    setAuctionsToday(0);
    setSoldCategories({});
    setRerollsLeft(baseRerolls);
    setRaidNote(null);
    setArcNotes([]);
    setVengeance([]);
    setMaxDaySurvived((prev) => Math.max(prev, cp));
    setSagas((a) => rebaseSagas(a, cp));
    setRunStats(EMPTY_RUN_STATS);
    setGameOverReason(null);
    setTab('counter');
    startNewCase(generateProceduralCase(cp, 15, undefined, currentDistrict.multiplier, gameLocale));
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
        // Les montants cités ne sont pas des offres : « liasse de 20 000 € » (nom de l'objet) ou un montant en euros.
        const itemNums = new Set((currentCase.item.name.match(/\d[\d\s.,]*\d|\d/g) ?? []).map((n) => n.replace(/\D/g, '')));
        const scan = text.replace(/\d[\d\s]*\s?(?:€|euros?|eur)(?![a-z])/gi, ' ');
        const match = scan.match(/(?:^|\s)(\d{3,6}|\d{1,2}\s\d{3})(?:\s*\$|\s|$|[.,!?])/);
        if (match?.[1]) {
          const parsedNum = Number(match[1].replace(/\s+/g, ''));
          if (itemNums.has(String(parsedNum))) {
            // nombre qui appartient au nom de l'objet : pas une offre
          } else if (Number.isFinite(parsedNum) && parsedNum >= 100) {
            if (parsedNum <= cash) {
              inferredOffer = parsedNum;
            } else {
              setError(
                tt(`Tu proposes ${mny(parsedNum)}, mais tu n'as que ${mny(cash)} en caisse.`, `You offer ${mny(parsedNum)}, but you only have ${mny(cash)} in the register.`, `Ofreces ${mny(parsedNum)}, pero solo tienes ${mny(cash)} en caja.`),
              );
              setHistory(history);
              if (!textOverride) setInput(text);
              setLoading(false);
              return;
            }
          }
        } else if (
          /^(?:(?:ok|okay|oui|d'accord|dac|vendu|deal|march[eé]\s*conclu|tope\s*l[aà]|topons\s*l[aà]|[cç]a\s*marche|c'est\s*bon|accept[eé]e?|je\s*(?:te\s*le\s*)?prends|yes|sure|done|agreed|trato|vale|hecho|de\s*acuerdo|acepto)[\s,.!;:]*)+$/i.test(
            text,
          ) &&
          askedPrice <= cash
        ) {
          inferredOffer = askedPrice;
        }
      }
      // Jamais d'offre au-dessus du prix demandé : on paierait plus cher que nécessaire.
      if (inferredOffer !== undefined && inferredOffer > askedPrice) inferredOffer = askedPrice;
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
          fearDelta: isRadio ? 8 : isUv ? 6 : 5,
          angerDelta: 4,
          mefianceDelta: isRadio ? 12 : isUv ? 10 : 6,
          isPromptInjection: false,
          hitName: false,
          hitWeak: false,
          hitLabel: isRadio ? 'Scanner Police' : isUv ? 'Marquage UV' : 'Indice Loupe',
        };
      } else {
        const castChar = currentCase.castId ? CAST_ROSTER.find((c) => c.id === currentCase.castId) : undefined;
        const weakWords = castChar
          ? [...new Set(localizeCastText(castChar.weaknessHint, gameLocale).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^a-zñ]+/).filter((w) => w.length >= 5))]
          : undefined;
        psycho = evaluatePsychoTriggers(
          text,
          currentCase.archetype,
          currentCase.name,
          day,
          usedPsychoRef.current,
          castChar ? { profileId: castChar.profileId, weak: castChar.weakKeywords, anger: castChar.angerKeywords, weakWords } : undefined,
        );
      }
      if (psycho.isPromptInjection) {
        const nextColere = Math.min(100, gauges.colere + psycho.angerDelta);
        const nextMefiance = Math.min(100, gauges.mefiance + psycho.mefianceDelta);
        const nextG: Gauges = { peur: gauges.peur, colere: nextColere, mefiance: nextMefiance };
        setGaugeDeltas({ peur: 0, colere: nextColere - gauges.colere, mefiance: nextMefiance - gauges.mefiance, key: Date.now() });
        setGauges(nextG);
        setTell(tt(`${currentCase.gender === 'f' ? 'Elle' : 'Il'} te regarde comme si tu perdais la boule.`, `${currentCase.gender === 'f' ? 'She' : 'He'} looks at you as if you had lost it.`, `${currentCase.gender === 'f' ? 'Ella' : 'Él'} te mira como si hubieras perdido la cabeza.`) + ` [${psycho.hitLabel}]`);
        setHistory((prev) => [
          ...prev,
          { role: 'npc', content: tt('Arrête ton charabia, tu me prends pour un robot ? On parle cash ou je me casse.', 'Cut the gibberish, you think I’m a robot? We talk cash or I’m gone.', 'Déjate de tonterías, ¿me tomas por un robot? Hablamos de dinero o me largo.') },
        ]);
        if (nextColere >= 80) setOutcome('sort_son_arme');
        else if (nextMefiance >= 88) setOutcome('quitte_la_boutique');
        setLoading(false);
        return;
      }
      const temp = temperamentOf(currentCase.castId);
      if (temp && !psycho.isPromptInjection && !currentCase.isDailyContract) {
        psycho = {
          ...psycho,
          fearDelta: Math.round(psycho.fearDelta * temp.fear),
          angerDelta: Math.round(psycho.angerDelta * temp.anger),
        };
      }
      if (psycho.hitName) usedPsychoRef.current.nameHit = true;
      if (psycho.hitWeak) usedPsychoRef.current.weakHit = true;
      const preGauges: Gauges = {
        peur: Math.min(100, gauges.peur + psycho.fearDelta),
        colere: Math.min(100, gauges.colere + psycho.angerDelta),
        mefiance: Math.min(100, gauges.mefiance + psycho.mefianceDelta),
      };
      const config: LLMConfig = { provider };
      const t0 = performance.now();
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
        isClueMacro ? 8 : repeated ? 5 : Math.max(10, 25 - 5 * playerTurnsSoFar),
        currentCase.arcStep !== 2, // un client de piste qui n'a plus sa pièce peut légitimement repartir
      );

      if (res.quota) setQuota(res.quota);
      else if (res.scripted) setQuota((q) => (q ? { ...q, remaining: 0, used: q.limit } : q));
      if (!res.scripted) track('llm_latency', Math.round(performance.now() - t0));
      if (res.scripted && !scriptedNoticeRef.current) {
        scriptedNoticeRef.current = true;
        track('scripted_mode');
        setError(tt('IA indisponible ou quota du jour atteint : les vendeurs répondent en mode scripté. Le Pass Syndicat débloque l’IA sans limite.', 'AI unavailable or daily quota reached: sellers now answer in scripted mode. The Syndicate Pass unlocks unlimited AI.', 'IA no disponible o cuota diaria alcanzada: los vendedores responden en modo guionizado. El Pase del Sindicato desbloquea la IA sin límite.'));
      }
      const nextGauges: Gauges = {
        peur: Math.max(preGauges.peur, res.jauges.peur),
        colere: res.jauges.colere,
        mefiance: res.jauges.mefiance,
      };
      const deltaP = nextGauges.peur - gauges.peur;
      const deltaC = nextGauges.colere - gauges.colere;
      const deltaM = nextGauges.mefiance - gauges.mefiance;
      const deltaPr = res.prix_actuel_demande - askedPrice;
      setGaugeDeltas({
        peur: deltaP,
        colere: deltaC,
        mefiance: deltaM,
        key: Date.now(),
      });
      setPsychoAudit((prev) => [
        ...prev,
        {
          id: `audit-${Date.now()}`,
          turn: prev.length,
          action: psycho.hitLabel || (inferredOffer !== undefined ? `${tt('Offre', 'Offer', 'Oferta')} ${mny(inferredOffer)}` : text.slice(0, 32)),
          peur: nextGauges.peur,
          peurDelta: deltaP,
          colere: nextGauges.colere,
          colereDelta: deltaC,
          mefiance: nextGauges.mefiance,
          mefianceDelta: deltaM,
          price: res.prix_actuel_demande,
          priceDelta: deltaPr,
          text: text.slice(0, 160),
          offer: inferredOffer,
          floor: computeDynamicFloor(currentCase.initialPrice, currentCase.floorPrice, nextGauges.peur),
          weak: psycho.hitWeak,
          name: psycho.hitName,
          tools: (inspected ? 1 : 0) + (uvScanned ? 2 : 0) + (radioOpen ? 4 : 0),
        },
      ]);
      setGauges(nextGauges);
      setAskedPrice(res.prix_actuel_demande);
      if (res.prix_actuel_demande < askedPrice) {
        setPriceTrail((prev) => [...prev, res.prix_actuel_demande]);
      }
      setTell(
        psycho.hitLabel
          ? `${res.indice_comportemental} [${hitLoc(psycho.hitLabel)}]`
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
            const trapRevealMsg = tt(
              '« Brigade Financière, les mains bien à plat sur le zinc ! Vos billets sont marqués et la transaction vient d’être filmée. Ne bougez plus. »',
              '« Financial Crimes Division, flat hands on the counter! These bills are marked and the transaction was just recorded. Don’t move. »',
              '« ¡Brigada Financiera, las manos sobre el mostrador! Tus billetes están marcados y la transacción acaba de ser grabada. No te muevas. »',
            );
            setHistory((prev) => {
              const updated = [...prev];
              for (let i = updated.length - 1; i >= 0; i--) {
                if (updated[i].role === 'npc') {
                  updated[i] = { ...updated[i], content: trapRevealMsg };
                  break;
                }
              }
              return updated;
            });
            speakNPC(trapRevealMsg, { peur: 10, colere: 80, mefiance: 95 });
            setRaidNote(
              tt(`PIÈGE ! ${currentCase.name} était un agent infiltré (${currentCase.item.name}). Heat +30% !`, `TRAP! ${currentCase.name} was an undercover agent (${currentCase.item.name}). Heat +30%!`, `¡TRAMPA! ${currentCase.name} era un agente encubierto (${currentCase.item.name}). ¡Heat +30 %!`),
            );
            // Visible immédiatement sur le comptoir (le bandeau raidNote ne s'affiche qu'à l'onglet Nuit).
            setTell(
              tt(`PIÈGE : ${currentCase.name} était un agent infiltré. Cash perdu, rien au coffre, Heat +30.`, `TRAP: ${currentCase.name} was an undercover agent. Cash lost, nothing in the vault, Heat +30.`, `TRAMPA: ${currentCase.name} era un agente encubierto. Efectivo perdido, nada en la caja fuerte, Heat +30.`),
            );
            setLastMemory(`${currentCase.name} était un agent infiltré : appât payé au prix fort.`);
            appendHistory('trap', tt(`Piégé par ${currentCase.name} (${currentCase.item.name})`, `Stung by ${currentCase.name} (${currentCase.item.name})`, `Trampa de ${currentCase.name} (${currentCase.item.name})`), -finalPaid);
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
                appendHistory('deal', tt(`${ep.title} bouclé (+${ep.rewardXp} XP)`, `${ep.title} completed (+${ep.rewardXp} XP)`, `${ep.title} completado (+${ep.rewardXp} XP)`), ep.rewardCash);
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
            setCash((c) => c + (hasCombo(jokerIds, 'vautour', 'fantome') ? 400 : 150));
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
            setTell(tt('La porte blindée s’est verrouillée à temps : le tir a ricoché sur l’acier.', 'The armored door locked in time: the shot ricocheted off the steel.', 'La puerta blindada se cerró a tiempo: el disparo rebotó en el acero.'));
          } else if (hasWeaponInStock) {
            setTell(
              tt('Tu sors le canon que tu gardes sur ton étagère : il ravale sa menace et détale ! (0 $ volés)', 'You pull the gun you keep on your shelf: he swallows his threat and bolts! ($0 stolen)', 'Sacas el arma que guardas en la estantería: se traga la amenaza y huye. (0 $ robados)'),
            );
          } else {
            const stolen = Math.min(cash, 600);
            setCash((c) => c - stolen);
            setCityHeat((h) => Math.min(100, h + 15));
            if (cash - stolen <= 0 && inventory.length === 0) {
              setGameOverReason(tt(`${currentCase.name} t'a braqué et vidé ta caisse.`, `${currentCase.name} held you up and emptied your register.`, `${currentCase.name} te atracó y vació tu caja.`));
            }
          }
        }
      }
    } catch (err) {
      setHistory(history);
      if (!textOverride) setInput(text);
      setError(err instanceof Error ? err.message : tt('Erreur inconnue.', 'Unknown error.', 'Error desconocido.'));
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
      tt(`Énigme bouclée ! Tu livres la pièce et encaisses +${mny(reward)}.`, `Case closed! You deliver the piece and collect +${mny(reward)}.`, `¡Caso cerrado! Entregas la pieza y cobras +${mny(reward)}.`);
    setHistory((prev) => [...prev, { role: 'npc', content: resolutionMsg }]);
    setTell(resolutionMsg);
    setOutcome('deal_accepte');
  };

  const abandonArcStep2 = () => {
    if (outcome !== 'active' || currentCase.arcStep !== 2) return;
    sound.playDanger();
    setArcNotes((prev) =>
      prev.map((n) => (n.arcId === currentCase.arcId ? { ...n, resolved: true, failed: true } : n)),
    );
    setTell(tt('Piste perdue : tu as revendu la pièce trop tôt.', 'Lead lost: you sold the piece too early.', 'Pista perdida: vendiste la pieza demasiado pronto.'));
    setOutcome('quitte_la_boutique');
  };

  // Night Phase actions
  const cleanItem = (itemId: string) => {
    if (!lockAction(`clean-${itemId}`)) return;
    const cleanCost = jokerIds.includes('blanchisseur-express') ? 0 : 250;
    if (cash < cleanCost) {
      setError(tt(`Il faut ${cleanCost} $ pour effacer les traces.`, `You need $${cleanCost} to wipe the traces.`, `Necesitas ${cleanCost} $ para borrar las huellas.`));
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
      setError(tt('Le coffre est vide : l’Acheteur Fantôme repart sans rien.', 'The vault is empty: the Phantom Buyer leaves with nothing.', 'La caja fuerte está vacía: el Comprador Fantasma se va con las manos vacías.'));
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
      tt(`Rachat en bloc : ${batch.length} pièce(s) partie(s) pour ${mny(capped)} cash.`, `Bulk buyout: ${batch.length} piece(s) gone for ${mny(capped)} cash.`, `Compra en bloque: ${batch.length} pieza(s) vendidas por ${mny(capped)} en efectivo.`) +
        (raw > capped
          ? tt(` Plafond atteint : ${mny(raw - capped)} laissés sur la table.`, ` Cap reached: ${mny(raw - capped)} left on the table.`, ` Tope alcanzado: ${mny(raw - capped)} se quedan sobre la mesa.`)
          : ''),
    );
  };

  const getFastSellPayout = (target: BoughtItem): number => {
    const catCount = target.category ? soldCategories[target.category] || 0 : 0;
    const catMult = catCount >= 2 ? 0.75 : catCount === 1 ? 0.88 : 1;
    const blindBoost = jokerIds.includes('a-l-aveugle') ? 1.6 : 1;
    const trendMult = target.category ? marketTrends[target.category] ?? 1 : 1;
    const seasonFastMult = seasonState.level >= 3 ? 1.05 : 1;
    return Math.round(target.streetValue * FAST_SELL_RATIO * catMult * blindBoost * trendMult * seasonFastMult);
  };

  const getAuctionPayout = (target: BoughtItem): number => {
    const baseAuctionMult = target.cleaned
      ? jokerIds.includes('blanchisseur')
        ? 1.4
        : AUCTION_CLEAN_RATIO
      : AUCTION_DIRTY_RATIO;
    const assetBoost = cityAssets.includes('warehouse') ? 1.35 : 1;
    // Marché saturé : chaque enchère de la journée ET chaque répétition de catégorie paie moins.
    const satTable = jokerIds.includes('reseau') ? [1, 0.85, 0.7, 0.55] : [1, 0.75, 0.55];
    const saturation = satTable[Math.min(auctionsToday, satTable.length - 1)];
    const catCount = target.category ? soldCategories[target.category] || 0 : 0;
    const catMult = catCount >= 2 ? 0.75 : catCount === 1 ? 0.88 : 1;
    const blindBoost = jokerIds.includes('a-l-aveugle') ? 1.6 : 1;
    const trendMult = target.category ? marketTrends[target.category] ?? 1 : 1;
    const codexAuctionMult = activeCodexPerks.includes('Clientèle Aristocratique') ? 1.18 : 1;
    const seasonAuctionMult = seasonState.level >= 20 ? 1.1 : 1;
    const facAuctionBonus = 1 + getFactionRank(factionRep[resolveFactionId(target.faction)] ?? 0).auctionBonus;
    return Math.round(
      target.streetValue * baseAuctionMult * assetBoost * saturation * catMult * blindBoost * trendMult * codexAuctionMult * seasonAuctionMult * facAuctionBonus,
    );
  };

  const sellItem = (itemId: string, mode: 'fast' | 'auction', forceConfirmed = false, overrideItem?: BoughtItem) => {
    const target = overrideItem || inventory.find((i) => i.id === itemId);
    if (!target) return;

    if (target.arcItemKey && !forceConfirmed) {
      triggerHaptic([20, 50, 20]);
      setPendingSellConfirm({ item: target, mode });
      return;
    }

    if (mode === 'auction' && !target.cleaned && !forceConfirmed) {
      triggerHaptic([20, 50, 20]);
      setPendingDirtyAuction(target);
      return;
    }

    if (!lockAction(`sell-${itemId}`)) return;

    // Si on liquide une pièce clé d'enquête, clore et rompre définitivement la piste associée
    if (target.arcItemKey) {
      setArcNotes((prev) =>
        prev.map((n) =>
          n.itemKey === target.arcItemKey || (target.arcId && n.arcId === target.arcId)
            ? { ...n, resolved: true, failed: true }
            : n
        )
      );
    }

    const salePrice = mode === 'fast' ? getFastSellPayout(target) : getAuctionPayout(target);
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
      tt(`Revente ${mode === 'auction' ? 'enchères' : 'rapide'} : ${target.name} (marge ${profit >= 0 ? '+' : ''}${profit} $)`, `${mode === 'auction' ? 'Auction' : 'Quick'} sale: ${localizeItemName(target.name, gameLocale)} (margin ${profit >= 0 ? '+' : ''}$${profit})`, `Venta ${mode === 'auction' ? 'en subasta' : 'rápida'}: ${localizeItemName(target.name, gameLocale)} (margen ${profit >= 0 ? '+' : ''}${profit} $)`),
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
    let paidNow = dailyRent;
    let graceDebt = 0;
    // Première fois (par partie) : le Syndicat avance la différence à 30 % d'intérêt au lieu de saisir la boutique.
    if (cash < dailyRent && !graceUsed && debt === 0) {
      paidNow = cash;
      graceDebt = Math.ceil(((dailyRent - cash) * 1.3) / 50) * 50;
      setGraceUsed(true);
      setError(tt(`Dernier avertissement : le Syndicat t’avance ${mny(dailyRent - cash)} ce soir. Tu devras ${mny(graceDebt)} avec le prochain loyer, sinon boutique saisie.`, `Final warning: the Syndicate fronts you ${mny(dailyRent - cash)} tonight. You will owe ${mny(graceDebt)} with the next rent, or the shop is seized.`, `Último aviso: el Sindicato te adelanta ${mny(dailyRent - cash)} esta noche. Deberás ${mny(graceDebt)} con el próximo alquiler, o te embargan la tienda.`));
    }
    if (cash < dailyRent && graceDebt === 0) {
      setGameOverReason(
        tt(`Tu n'as pas les ${mny(dailyRent)} pour payer le Syndicat ce soir. Boutique saisie.`, `You don’t have the ${mny(dailyRent)} to pay the Syndicate tonight. Shop seized.`, `No tienes los ${mny(dailyRent)} para pagar al Sindicato esta noche. Tienda embargada.`),
      );
      return;
    }
    sound.playCashSlap();
    setDebt(graceDebt);
    const barIncome = cityAssets.includes('nightbar') ? 600 : 0;
    const barCool = cityAssets.includes('nightbar') ? 5 : 0;
    // Fond de roulement de survie : si la caisse tombe à sec et que le coffre est vide, le tiroir garde 350 $ pour négocier le lendemain
    setCash((c) => {
      const remaining = c - paidNow + barIncome;
      return inventory.length === 0 && remaining < 350 ? 350 : remaining;
    });
    if (jokerIds.includes('assurance') || barCool > 0) {
      setCityHeat((h) => Math.max(0, h - (jokerIds.includes('assurance') ? 10 : 0) - (hasCombo(jokerIds, 'assurance', 'reseau') ? 10 : 0) - barCool));
    }
    // Traceurs GPS : +12 % de Heat par pièce encore au coffre (nettoyer les neutralise).
    const activeTrackers = inventory.filter(
      (it) => it.modifier === 'traceur' && !it.cleaned,
    ).length;
    if (activeTrackers > 0) {
      setCityHeat((h) => Math.min(100, h + activeTrackers * 12));
      setRaidNote((prev) =>
        tt(`${activeTrackers} traceur(s) encore actif(s) : Heat +${activeTrackers * 12} %.`, `${activeTrackers} tracker(s) still active: Heat +${activeTrackers * 12}%.`, `${activeTrackers} rastreador(es) aún activo(s): Heat +${activeTrackers * 12} %.`) + (prev ? ` ${prev}` : ''),
      );
    }

    setJokerDraft(drawRandomJokers(jokerIds, 3));
  };

  const pickJokerAndAdvance = (jokerId: string) => {
    sound.playDealSuccess();
    const nextJokers = jokerIds.includes(jokerId) ? jokerIds : [...jokerIds, jokerId];
    setJokerIds(nextJokers);
    setJokerDraft(null);

    let heistText: string | null = null;
    // Heat >= 80 : descente de police. Le risque devient une vraie perte.
    const raidProtected = activeCodexPerks.includes('Brouillage Total');
    if (cityHeat >= raidAt && !raidProtected) {
      const fine = Math.round(cash * 0.3);
      const seized = inventory.length;
      const cashLeft = cash - fine;
      setCash(Math.max(0, cashLeft));
      // double-fond joker: save 2 most valuable items from raid
      if (jokerIds.includes('double-fond') || jokerId === 'double-fond') {
        const sorted = [...inventory].sort((a, b) => b.paid - a.paid);
        setInventory(sorted.slice(0, hasCombo([...jokerIds, jokerId], 'double-fond', 'collectionneur') ? 3 : 2));
      } else {
        setInventory([]);
      }
      setCityHeat(45);
      setRaidNote(
        tt(`Descente de police au Jour ${day} : ${seized} pièce(s) saisie(s), ${mny(fine)} d'amende. Le dossier reste ouvert.`, `Police raid on Day ${day}: ${seized} piece(s) seized, ${mny(fine)} fine. The case stays open.`, `Redada policial el Día ${day}: ${seized} pieza(s) incautada(s), ${mny(fine)} de multa. El caso sigue abierto.`),
      );
      if (cashLeft <= 0) {
        setGameOverReason(
          tt('Descente de police : le Syndicat te lâche, caisse vide et boutique sous scellés.', 'Police raid: the Syndicate drops you, empty register and shop sealed.', 'Redada policial: el Sindicato te abandona, caja vacía y tienda precintada.'),
        );
        return;
      }
    } else {
      // Une caisse bien garnie attire les braqueurs (la porte blindée et le compte suisse protègent).
      if (Math.random() < heistRisk(cash, day, upgrades.armoredDoor, ascMod?.heistScale ?? 1)) {
        const loss = heistLoss(cash, Math.random);
        setCash((c) => Math.max(0, c - loss));
        heistText = tt(`Braquage de nuit : ${mny(loss)} envolés. Une caisse bien garnie attire du monde.`, `Night robbery: ${mny(loss)} gone. A full register attracts company.`, `Atraco nocturno: ${mny(loss)} desaparecidos. Una caja llena atrae visitas.`);
      }
      const seasonCool = seasonState.level >= 10 ? 3 : 0;
      setCityHeat((h) => Math.max(0, h - 12 - seasonCool));
      const morningDividend =
        (activeCodexPerks.includes('Trésorerie Noire') ? 400 : 0) +
        (seasonState.level >= 30 ? 500 : 0);
      if (morningDividend > 0) setCash((c) => c + morningDividend);
      if (nightEvent?.curfewBonusCash && cityHeat < 35) {
        setCash((c) => c + nightEvent.curfewBonusCash!);
        setRaidNote(
          '✓ ' + tt(`Couvre-feu calme (Heat < 35%) : +${mny(nightEvent.curfewBonusCash)} de prime de discrétion.`, `Quiet curfew (Heat < 35%): +${mny(nightEvent.curfewBonusCash)} discretion bonus.`, `Toque de queda tranquilo (Heat < 35 %): +${mny(nightEvent.curfewBonusCash)} de prima de discreción.`),
        );
      } else if (raidProtected && cityHeat >= raidAt) {
        setRaidNote('✓ ' + tt('Brouillage Total (Codex) : la descente de police a été déviée.', 'Total Jamming (Codex): the police raid was diverted.', 'Interferencia total (Códice): la redada policial fue desviada.'));
      } else {
        setRaidNote(null);
      }
    }

    if (heistText) {
      const ht = heistText;
      setRaidNote((p) => (p ? `${p} ` : '') + ht);
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
      nextJokers,
    );
  };

  const buyUpgrade = (key: keyof Upgrades, cost: number) => {
    if (upgrades[key] || cash < cost || !lockAction(`up-${key}`)) return;
    setCash((c) => c - cost);
    setUpgrades((u) => ({ ...u, [key]: true }));
  };

  const transferToSwiss = (amount: number) => {
    if (cash < amount || amount <= 0 || !lockAction('swiss-in')) return;
    sound.playCashSlap();
    setCash((c) => c - amount);
    const netRate = seasonState.level >= 15 ? 0.94 : 0.9;
    const netAdded = Math.round(amount * netRate);
    setSwissBank((s) => s + netAdded);
    bumpQuest('swiss', amount);
    if (swissBank + netAdded >= 10000) unlockAchievement('swiss-10k');
  };

  const withdrawFromSwiss = (amount: number) => {
    if (swissBank < amount || amount <= 0 || !lockAction('swiss-out')) return;
    sound.playCashSlap();
    setSwissBank((s) => s - amount);
    setCash((c) => c + amount);
    setError(null);
  };

  const submitSecret = (item: BoughtItem) => {
    if (!item.secretId || item.secretState !== 'open' || !lockAction(`secret-${item.id}`)) return;
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
    if (!lockAction('loan')) return;
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
    setCityHeat((h) => Math.min(100, h + (ascMod?.loanHeat ?? 15)));
    setError(null);
  };

  const buyCityAsset = (asset: CityAsset) => {
    if (cityAssets.includes(asset.id) || swissBank < asset.costSwiss || !lockAction(`asset-${asset.id}`)) return;
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
    setCash(startingCash + legacyBonus);
    setDebt(0);
    setGraceUsed(false);
    setCityHeat(15);
    setInventory([]);
    setClientsServedToday(0);
    setAuctionsToday(0);
    setSoldCategories({});
    setRerollsLeft(baseRerolls);
    setRaidNote(null);
    setSagas((a) => rebaseSagas(a));
    setRunStats(EMPTY_RUN_STATS);
    setGameOverReason(null);
    setTab('counter');
    startNewCase(generateProceduralCase(1, 15, lastMemory || undefined, currentDistrict.multiplier, gameLocale));
  };

  const passClient = () => {
    if (outcome !== 'active') return;
    if (currentCase.arcStep === 2) {
      const hasItem = inventory.some((i) => i.arcItemKey === currentCase.requiresItemKey);
      if (!hasItem) {
        setArcNotes((prev) =>
          prev.map((n) => (n.arcId === currentCase.arcId ? { ...n, resolved: true, failed: true } : n)),
        );
      }
    }
    setTell(tt('Tu déclines l’offre. Le client remballe sa pièce sans faire d’histoire.', 'You decline the offer. The client packs the piece away without a fuss.', 'Rechazas la oferta. El cliente guarda su pieza sin montar un escándalo.'));
    setHistory((prev) => [
      ...prev,
      { role: 'player', content: tt('Pas intéressé ce soir, passe ton chemin.', 'Not interested tonight, move along.', 'Esta noche no me interesa, sigue tu camino.') },
      { role: 'npc', content: tt('Comme tu veux. Je vais voir ailleurs.', 'Suit yourself. I’ll look elsewhere.', 'Como quieras. Iré a otro sitio.') },
    ]);
    setVengeance((prev) => [...prev, { faction: currentCase.faction, day, reason: 'rejected' as const }]);
    setFactionRep((prev) => applyFactionDealDelta(prev, currentCase.faction, -4));
    if (!currentCase.isTrap) setLastPoachedItem(currentCase.item.name);
    setOutcome('quitte_la_boutique');
  };

  const rejectTrap = () => {
    if (outcome !== 'active') return;
    if (currentCase.arcStep === 2) {
      const hasItem = inventory.some((i) => i.arcItemKey === currentCase.requiresItemKey);
      if (!hasItem) {
        setArcNotes((prev) =>
          prev.map((n) => (n.arcId === currentCase.arcId ? { ...n, resolved: true, failed: true } : n)),
        );
      }
    }
    if (currentCase.isTrap) {
      setRunStats((st) => ({ ...st, trapsExposed: st.trapsExposed + 1 }));
      sound.playDealSuccess();
      const trapBonus = seasonState.level >= 6 ? 500 : 350;
      setCash((c) => c + trapBonus);
      setSeasonXp((xp) => xp + 150);
      bumpQuest('traps', 1);
      unlockAchievement('mole-hunter');
      appendHistory('trap', tt(`Infiltré démasqué : ${currentCase.name}`, `Undercover agent exposed: ${currentCase.name}`, `Infiltrado desenmascarado: ${currentCase.name}`), trapBonus);
      setCityHeat((h) => Math.max(0, h - 8));
      setTell(tt(`Tu as démasqué l’infiltré : il décampe avant que ça tourne mal (+${mny(trapBonus)} prime d’info).`, `You exposed the undercover agent: he bolts before it turns ugly (+${mny(trapBonus)} tip bonus).`, `Desenmascaraste al infiltrado: huye antes de que se ponga feo (+${mny(trapBonus)} de prima).`));
      setHistory((prev) => [
        ...prev,
        { role: 'player', content: tt('(Tu le vires sur-le-champ.) Dégage d’ici avec ton micro-cravate !', '(You throw him out on the spot.) Get out of here with your wire!', '(Lo echas en el acto.) ¡Largo de aquí con tu micrófono!') },
        { role: 'npc', content: tt('Merde... t’es plus malin que t’en as l’air.', 'Damn… you’re smarter than you look.', 'Mierda… eres más listo de lo que pareces.') },
      ]);
      setOutcome('quitte_la_boutique');
    } else {
      sound.playDanger();
      setCityHeat((h) => Math.min(100, h + 8));
      setCash((c) => c - Math.min(c, 250)); // dédommagement : accuser au hasard n'est plus gratuit
      setTell(tt('Fausse accusation : le client était réglo, claque la porte furieux et te fait payer 250 $ de dédommagement.', 'False accusation: the client was clean, slams the door furious and makes you pay $250 in compensation.', 'Falsa acusación: el cliente era legal, se va furioso dando un portazo y te hace pagar 250 $ de indemnización.'));
      setHistory((prev) => [
        ...prev,
        { role: 'player', content: tt('T’es un flic ! Dégage de ma boutique !', 'You’re a cop! Get out of my shop!', '¡Eres un poli! ¡Fuera de mi tienda!') },
        { role: 'npc', content: tt('T’es complètement parano, mec. Je vais vendre ailleurs.', 'You’re completely paranoid, man. I’ll sell elsewhere.', 'Estás completamente paranoico, tío. Venderé en otro sitio.') },
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

  if (routePath === '/admin' || routePath.startsWith('/admin')) {
    return <AdminDashboard onNavigate={navigateTo} gameLocale={gameLocale} />;
  }

  if (!isGameRoute) {
    return (
      <MarketingSite
        pathname={routePath}
        onNavigate={navigateTo}
        hasExistingSave={day > 1 || totalProfit !== 0 || swissBank > 0 || cash !== 2500}
        savedDay={day}
        savedCash={cash}
        countdownText={<DailyClock />}
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
    // Réplique clé : celle qui a fait le plus baisser le prix (ou monter la peur), sinon la dernière.
    const crack = [...psychoAudit].filter((e) => e.text && (e.priceDelta < 0 || e.peurDelta >= 15)).sort((a, b) => a.priceDelta - b.priceDelta || b.peurDelta - a.peurDelta)[0];
    const line = (crack?.text ?? [...history].reverse().find((h) => h.role === 'player')?.content ?? '').replace(/\s+/g, ' ');
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
    // Carte image (portrait, résultat, décote, réplique) : partage natif avec fichier sur mobile, PNG téléchargé + texte copié sur ordinateur.
    try {
      const blob = await renderShareCard({
        portraitUrl: `${PORTRAIT_DIR}${resolveCastPortrait(currentCase.portraitOverride ?? currentCase.castId, currentCase.gender, currentCase.name, currentCase.displayArchetype ?? currentCase.archetype)}.webp`,
        verdict: `${verdict}${badge ? ` · ${badge}` : ''}`.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim(),
        tone: won ? 'win' : outcome === 'quitte_la_boutique' ? 'neutral' : 'loss',
        discountPct: won ? Math.max(0, discount) : 0,
        name: currentCase.name,
        item: localizeItemName(currentCase.item.name, L),
        line: line.slice(0, 120),
        lineLabel: T.line,
        head: T.head,
        url: `cashnoir.app/play${daily ? '/daily' : ''}`,
      });
      const mode = await shareCardImage(blob, text);
      if (mode === 'downloaded') await navigator.clipboard.writeText(text).catch(() => {});
      trackEvent('share', { method: mode, discount_pct: discount, item_name: currentCase.item.name });
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
      return;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return; // le joueur a fermé la feuille de partage
      /* image ou partage indisponible : on retombe sur le partage texte ci-dessous */
    }
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

  // Actions du comptoir : partagées par les boutons desktop et le menu d'actions mobile.
  const doLoupe = () => {
                            if (weeklyChallenge.modifier.disableLoupe && !currentCase.isDailyContract) return;
                            if (jokerIds.includes('a-l-aveugle')) {
                              setError(tt('Joker « À l’aveugle » actif : Loupe et UV sont désactivées (en échange, revente ×1,6).', 'Blind Buyer joker active: Loupe and UV are disabled (in exchange, resale ×1.6).', 'Comodín «A ciegas» activo: Lupa y UV desactivadas (a cambio, reventa ×1,6).'));
                              return;
                            }
                            setInspected(true);
                            if (jokerIds.includes('radar')) {
                              setUvScanned(true);
                            }
                            setMobileNotebookOpen(true);
                            sound.playInspect();
  };
  const doUv = () => {
                            if (nightEvent?.disableUv && !currentCase.isDailyContract) return;
                            if (jokerIds.includes('a-l-aveugle')) {
                              setError(tt('Joker « À l’aveugle » actif : Loupe et UV sont désactivées (en échange, revente ×1,6).', 'Blind Buyer joker active: Loupe and UV are disabled (in exchange, resale ×1.6).', 'Comodín «A ciegas» activo: Lupa y UV desactivadas (a cambio, reventa ×1,6).'));
                              return;
                            }
                            setUvScanned(true);
                            setMobileNotebookOpen(true);
                            sound.playInspect();
  };
  const doRadio = () => {
    if (ascMod?.radioDown && day % 3 === 0) {
      setError(tt('Ascension : la radio de police est en panne aujourd’hui.', 'Ascension: the police radio is down today.', 'Ascensión: la radio de la policía no funciona hoy.'));
      return;
    }
                            const next = !radioOpen;
                            setRadioOpen(next);
                            if (next) {
                              setMobileNotebookOpen(true);
                              sound.playInspect();
                              ambience.crackle();
                            }
  };
  const goCounter = () => {
                setTab('counter');
                if (currentCase.isDailyContract && !restoreCounterSession()) {
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
  };
  const useFallbackPortrait = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const fallback = `${PORTRAIT_DIR}cast/${currentCase.gender === 'f' ? 'c001' : 'c002'}.webp`;
    if (event.currentTarget.getAttribute('src') !== fallback) event.currentTarget.src = fallback;
  };
  const loupeOff = Boolean(weeklyChallenge.modifier.disableLoupe && !currentCase.isDailyContract);
  const uvOff = Boolean(nightEvent?.disableUv && !currentCase.isDailyContract);

  // Répliques rapides (desktop : puces ; mobile : menu d'actions).
  const quickReplies = (): { key: string; label: string; tone: 'amber' | 'red' | 'plain'; run: () => void }[] => {
    const out: { key: string; label: string; tone: 'amber' | 'red' | 'plain'; run: () => void }[] = [];
    const undercut = Math.max(100, Math.round((askedPrice * 0.8) / 50) * 50);
    const unlockedFaille = history.length >= FLAW_REVEAL_TURNS;
    const castForChip = currentCase.castId ? CAST_ROSTER.find((c) => c.id === currentCase.castId) : undefined;
    const profile = findProfileForArchetype(castForChip?.profileId ?? currentCase.archetype);
    if (undercut <= cash && undercut < askedPrice) {
      out.push({ key: 'c20', label: t.chip20(formatMoney(undercut, gameLocale)), tone: 'amber', run: () => { triggerHaptic(15); sendMessage(t.chip20Msg(formatMoney(undercut, gameLocale)), undercut); } });
    }
    const deepCut = Math.max(100, Math.round((askedPrice * 0.65) / 50) * 50);
    if (deepCut <= cash && deepCut < undercut) {
      const deepMsg =
        gameLocale === 'en'
          ? `Take $${formatMoney(deepCut, gameLocale)} cold cash right now or walk.`
          : gameLocale === 'es'
            ? `Toma ${formatMoney(deepCut, gameLocale)} $ en efectivo ahora mismo o lárgate.`
            : `Prends ${formatMoney(deepCut, gameLocale)} $ en liquide tout de suite ou dégage.`;
      out.push({ key: 'c35', label: gameLocale === 'en' ? `-35% ($${formatMoney(deepCut, gameLocale)})` : `-35% (${formatMoney(deepCut, gameLocale)} $)`, tone: 'red', run: () => { triggerHaptic(20); sendMessage(deepMsg, deepCut); } });
    }
    out.push({ key: 'press', label: t.chipPressure, tone: 'plain', run: () => { triggerHaptic(15); sendMessage(t.chipPressureMsg); } });
    out.push({
      key: 'flaw',
      label: unlockedFaille ? t.chipFlaw : t.chipBluff,
      tone: 'plain',
      run: () => {
        triggerHaptic(15);
        sendMessage(
          unlockedFaille
            ? flawLine(localizeCastText(castForChip ? castForChip.weaknessHint : currentCase.gender === 'f' && profile.femaleWeaknessHint ? profile.femaleWeaknessHint : profile.weaknessHint, gameLocale))
            : t.chipBluffMsg,
        );
      },
    });
    return out;
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
        if (window.matchMedia('(max-width: 1023px)').matches) setShowItemSheet(true);
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
          <div className="border border-white/10 bg-black/40 p-3 text-left font-mono text-[11px] leading-relaxed text-zinc-400">
            <p className="mb-1 uppercase tracking-wider text-amber-300">
              {gameLocale === 'en' ? 'How to last longer' : gameLocale === 'es' ? 'Cómo durar más' : 'Comment tenir plus longtemps'}
            </p>
            <ul className="list-disc space-y-1 pl-4">
              {(gameLocale === 'en'
                ? [
                    'Rent rises every night ($300 + $350 per day) and cash in hand is taxed. Check the “Rent” figure at the top before each night.',
                    'Buy well under the street value shown under the item: pressure the seller with your own words, not just the tools.',
                    'Flip fast when you are short on cash; clean items (−$250) and sell at auction when you can afford to wait.',
                    'Open the ✦ false-bottom pieces in the Vault: a solved riddle pays cash, XP or lowers Heat.',
                    'Keep cash in the Swiss account: it survives a bust and lets you restart.',
                  ]
                : gameLocale === 'es'
                  ? [
                      'El alquiler sube cada noche (300 $ + 350 $ por día) y el efectivo en mano paga impuestos. Mira la cifra «Alquiler» arriba antes de cada noche.',
                      'Compra muy por debajo del valor de calle que aparece bajo el objeto: presiona al vendedor con tus palabras, no solo con las herramientas.',
                      'Revende rápido si andas corto de efectivo; limpia las piezas (−250 $) y véndelas en subasta cuando puedas esperar.',
                      'Abre las piezas ✦ de doble fondo en la caja fuerte: un acertijo resuelto paga efectivo, XP o baja el Heat.',
                      'Guarda efectivo en la cuenta suiza: sobrevive a la ruina y te deja volver a empezar.',
                    ]
                  : [
                      'Le loyer monte chaque soir (300 $ + 350 $ par jour) et le cash en main est taxé. Regarde le chiffre « Loyer » en haut avant chaque nuit.',
                      'Achète bien sous la valeur de rue affichée sous l’objet : mets la pression avec tes mots, pas seulement avec les outils.',
                      'Revends vite quand tu manques de cash ; nettoie les pièces (−250 $) et passe-les aux enchères quand tu peux attendre.',
                      'Ouvre les pièces ✦ à double fond au coffre : une énigme résolue rapporte du cash, de l’XP ou baisse le Heat.',
                      'Garde du cash sur le compte suisse : il survit à la ruine et te permet de repartir.',
                    ]
              ).map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="bg-zinc-950 border border-white/10 rounded p-3 text-xs font-mono text-zinc-400 space-y-1">
            <div>
              {t.gameOverProfit(formatMoney(totalProfit, gameLocale), getLocalizedRank(totalProfit, gameLocale))}
            </div>
            <div className="text-amber-400">
              {t.gameOverSwiss(formatMoney(swissBank, gameLocale), cityAssets.length)}
            </div>
            <div className={day >= bestDay ? 'text-emerald-300' : 'text-zinc-400'}>
              {day >= bestDay
                ? tt(`Nouveau record : jour ${day}.`, `New record: day ${day}.`, `Nuevo récord: día ${day}.`)
                : tt(`Ton record : jour ${maxDaySurvived}. Tu peux faire mieux.`, `Your record: day ${maxDaySurvived}. You can beat it.`, `Tu récord: día ${maxDaySurvived}. Puedes superarlo.`)}
            </div>
            {!hasPass && (
              <button type="button" data-buy-pass onClick={() => void buyPass()} className="w-full border border-amber-500/50 bg-amber-500/10 px-3 py-2 font-mono text-[11px] uppercase text-amber-300 hover:bg-amber-500/20">
                {tt('Pass Syndicat : IA sans limite & classement mondial →', 'Syndicate Pass: unlimited AI & world leaderboard →', 'Pase del Sindicato: IA sin límite y ranking mundial →')}
              </button>
            )}
            <div className="space-y-1 border border-violet-400/30 bg-violet-950/20 p-2 text-left text-[11px] leading-snug text-zinc-300">
              <p className="font-bold uppercase tracking-wider text-violet-200">🧠 {tt('Conseil du Parrain', 'Godfather’s advice', 'Consejo del Padrino')}</p>
              {runAdvice(runStats, gameLocale).map((line, i) => (
                <p key={i}>• {line}</p>
              ))}
            </div>
            {legacyBonus > 0 && (
              <div className="text-emerald-300">
                {tt(`Bonus de départ de ta prochaine partie : +${mny(legacyBonus)} (grâce à ton record).`, `Starting bonus for your next run: +${mny(legacyBonus)} (thanks to your record).`, `Bonificación de inicio de tu próxima partida: +${mny(legacyBonus)} (por tu récord).`)}
              </div>
            )}
          </div>
          {chapterStart(bestDay) > 1 && (
            <div className="space-y-2">
              <button
                onClick={restartFromCheckpoint}
                className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold py-2.5 rounded-md text-sm transition-colors"
              >
                {tt(
                  `Reprendre au jour ${chapterStart(bestDay)} (${mny(
                    checkpointCash(chapterStart(bestDay), ascMod?.rentMult ?? 1),
                  )} en caisse)`,
                  `Resume at day ${chapterStart(bestDay)} (${mny(
                    checkpointCash(chapterStart(bestDay), ascMod?.rentMult ?? 1),
                  )} cash)`,
                  `Reanudar en el día ${chapterStart(bestDay)} (${mny(
                    checkpointCash(chapterStart(bestDay), ascMod?.rentMult ?? 1),
                  )} en caja)`,
                )}
              </button>
              <button
                onClick={resetEmpire}
                className="w-full border border-white/20 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-100 font-semibold py-2 rounded-md text-sm transition-colors"
              >
                {tt(
                  `Recommencer au jour 1 (Nouveau départ · +${mny(legacyBonus)} bonus)`,
                  `Restart from Day 1 (Fresh start · +${mny(legacyBonus)} bonus)`,
                  `Empezar desde el Día 1 (Nuevo comienzo · +${mny(legacyBonus)} bonus)`,
                )}
              </button>
              <p className="text-[11px] leading-snug text-zinc-500">
                {tt('Chapitres de 5 jours : ceux que tu as validés restent verrouillés, tu ne repars jamais plus bas. Coffre vide, atouts remis à zéro.', 'Chapters of 5 days: the ones you cleared stay locked, you never restart lower. Vault empty, jokers reset.', 'Capítulos de 5 días: los que superaste quedan bloqueados, nunca reinicias más abajo. Caja vacía, comodines reiniciados.')}
              </p>
            </div>
          )}
          {swissBank >= reopenCostSwiss && (
            <button
              onClick={reopenFromSwiss}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold py-2.5 rounded-md text-sm"
            >
              {t.gameOverReopen(formatMoney(reopenCostSwiss, gameLocale), formatMoney(reopenStartingCash, gameLocale))}
            </button>
          )}
          {ascensionLevel < MAX_ASCENSION && canAscend(swissBank, maxDaySurvived) && (
            <button
              onClick={() => {
                const nextLevel = ascensionLevel + 1;
                setAscensionLevel(nextLevel);
                unlockAchievement('ascended');
                setDay(1);
                setCash(2500 + legacyBonus);
    setDebt(0);
    setGraceUsed(false);
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
                setSagas((a) => rebaseSagas(a));
                setRunStats(EMPTY_RUN_STATS);
                setGameOverReason(null);
                setTab('counter');
                startNewCase(generateProceduralCase(1, 15, undefined, 1, gameLocale));
              }}
              className="w-full bg-amber-600 hover:bg-amber-500 text-zinc-950 font-semibold py-2.5 rounded-md text-sm"
            >
              {t.gameOverAscend(ROMAN[ascensionLevel] ?? 'MAX')}
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

  // Porte d'entrée obligatoire : compte Google OAuth requis avant d'accéder au comptoir (pas de connexion directe anonyme en prod).
  if (!authChecked) {
    return (
      <div role="status" aria-label={tt('Vérification de session…', 'Checking session…', 'Verificando sesión…')} className="min-h-[100dvh] bg-[#050507] flex items-center justify-center">
        {/* Même logo que l'écran de lancement natif : transition sans rupture. */}
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-12 w-12 animate-pulse">
          <path d="M14.5 5L5 16L14.5 27" stroke="#f4f4f5" strokeWidth="2.4" strokeLinecap="square" />
          <path d="M17.5 5L27 16L17.5 27V5Z" fill="#fbbf24" />
        </svg>
      </div>
    );
  }

  const retryConnection = () => {
    setAuthChecked(false);
    setAuthAttempt((attempt) => attempt + 1);
  };
  if (authUser && profileFailed) {
    return (
      <main className="grid min-h-[100dvh] place-content-center gap-4 px-6 text-center">
        <h1 className="text-xl font-semibold">{tt('Ta boutique est indisponible', 'Your shop is unavailable', 'Tu tienda no está disponible')}</h1>
        <p>{tt('Reconnecte-toi au réseau pour retrouver ta partie.', 'Reconnect to the network to resume your game.', 'Vuelve a conectarte a la red para retomar tu partida.')}</p>
        <button onClick={retryConnection} className="rounded-lg bg-amber-300 py-3 font-bold text-zinc-950">{tt('Réessayer', 'Try again', 'Reintentar')}</button>
      </main>
    );
  }
  // A paying guest plays right away; Google login stays optional (cloud save).
  const paidGuest = hasPass && !passOpen;
  if (!authUser && !paidGuest && showFirstDeal) {
    return <FirstDeal t={tt} onExit={() => setShowFirstDeal(false)} onContinue={() => {
      setShowFirstDeal(false);
      if (oauthConfigured) startGoogleLogin();
      else retryConnection();
    }} />;
  }
  if (!authUser && !paidGuest) {
    return (
      <div className="login-scene min-h-[100dvh] bg-[#07080c] text-zinc-100 flex items-center justify-center p-4 max-sm:items-end max-sm:pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:p-6">
        <div className="w-full max-w-md space-y-6 p-2 sm:border sm:border-white/15 sm:bg-[#0b0c10] sm:p-8 sm:shadow-[0_0_60px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 shrink-0">
                <path d="M10.5 3.5L3 12L10.5 20.5" stroke="#f4f4f5" strokeWidth="2" strokeLinecap="square" />
                <path d="M13.5 3.5L21 12L13.5 20.5V3.5Z" fill="#fbbf24" />
              </svg>
              <span className="font-[family-name:var(--font-display)] text-lg tracking-[0.22em] text-zinc-100">
                CASH <span className="text-amber-400">NOIR</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-white/10 font-mono text-[11px]">
                {(['en', 'fr', 'es'] as Locale[]).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => switchLanguage(loc)}
                    className={`px-1.5 py-0.5 uppercase transition-colors ${
                      gameLocale === loc ? 'bg-white/10 text-amber-300 font-bold' : 'text-zinc-500 hover:text-zinc-200'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-wider text-zinc-100 leading-none">
              {tt('Derrière le comptoir', 'Behind the counter', 'Tras el mostrador')}
            </h2>
            <p className="text-base leading-relaxed text-zinc-300">
              {tt(
                'Un client entre avec une pièce à vendre. Lis ses réactions, négocie le prix et garde assez de cash pour le loyer de ce soir.',
                'A client walks in with something to sell. Read their reactions, negotiate a price and keep enough cash for tonight’s rent.',
                'Entra un cliente con algo que vender. Lee sus reacciones, negocia el precio y guarda suficiente dinero para el alquiler de esta noche.',
              )}
            </p>
          </div>

          <button type="button" onClick={() => {
            trackEvent('first_deal_open');
            setShowFirstDeal(true);
          }} className="w-full rounded-lg bg-amber-300 px-4 py-3.5 text-base font-bold text-zinc-950">
            {readFirstDeal() ? tt('Retrouver mon premier deal', 'Resume my first deal', 'Retomar mi primer trato') : tt('Jouer mon premier deal', 'Play my first deal', 'Jugar mi primer trato')}
          </button>
          <button
            type="button"
            onClick={() => {
              if (oauthConfigured) {
                trackEvent('login_attempt', { method: 'google' });
                startGoogleLogin();
              } else {
                retryConnection();
              }
            }}
            className="flex w-full items-center justify-center gap-3 bg-white px-4 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 transition-colors hover:bg-amber-300 cursor-pointer"
          >
            {oauthConfigured && <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.8l3.7-2.9z" />
              <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z" />
            </svg>}
            <span>{oauthConfigured
              ? tt('Continuer avec Google', 'Continue with Google', 'Continuar con Google')
              : tt('Réessayer la connexion', 'Retry connection', 'Reintentar la conexión')}</span>
          </button>

          {!oauthConfigured && (
            <p role="status" className="text-sm text-amber-200">
              {tt('Connexion au comptoir indisponible pour le moment.', 'The counter is currently unavailable.', 'La conexión con el mostrador no está disponible por el momento.')}
            </p>
          )}

          {error && (
            <p className="font-mono text-[11px] text-red-400 border border-red-500/30 bg-red-950/30 p-2.5">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-white/10 pt-4 font-mono text-[11px] text-zinc-500">
            {isNative ? <span /> : (
              <button type="button" onClick={() => navigateTo('/')} className="hover:text-zinc-300">
                ← {tt('Retour accueil', 'Back to home', 'Volver al inicio')}
              </button>
            )}
            <div className="flex gap-3">
              <a href="/privacy" onClick={(e) => { e.preventDefault(); if (isNative) openSitePage('/privacy'); else navigateTo('/privacy'); }} className="hover:text-zinc-300">
                {tt('Confidentialité', 'Privacy', 'Privacidad')}
              </a>
              <a href="/terms" onClick={(e) => { e.preventDefault(); if (isNative) openSitePage('/terms'); else navigateTo('/terms'); }} className="hover:text-zinc-300">
                {tt('Conditions', 'Terms', 'Términos')}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={gameScreen}
      className={`game-screen ${
        tab === 'counter' || tab === 'daily' ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'
      } bg-[#09090b] text-zinc-100 flex flex-col pt-[env(safe-area-inset-top)] sm:pb-[env(safe-area-inset-bottom)] ${shaking ? 'animate-shake' : ''}`}
    >
      {passWelcome && (
        <div role="status" className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[60] mx-auto w-[min(92vw,26rem)] border border-amber-400/60 bg-[#0b0c10] px-4 py-3 text-sm text-zinc-100 shadow-lg" onClick={() => setPassWelcome(false)}>
          <strong className="text-amber-300">{tt('Pass Syndicat activé.', 'Syndicate Pass activated.', 'Pase del Sindicato activado.')}</strong>{' '}
          {authUser
            ? tt('IA sans limite et classement mondial débloqués.', 'Unlimited AI and world leaderboard unlocked.', 'IA sin límite y ranking mundial desbloqueados.')
            : tt('Connecte-toi avec Google (menu Compte) pour le garder sur tous tes appareils.', 'Sign in with Google (Account menu) to keep it on all your devices.', 'Inicia sesión con Google (menú Cuenta) para conservarlo en todos tus dispositivos.')}
        </div>
      )}
      {/* Top Bar : Responsive iOS/Android & Desktop */}
      <header className="relative z-30 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 border-b border-white/10 bg-[#090a0f]/95 px-2.5 py-1.5 sm:px-6 w-full max-w-full overflow-hidden">
        {/* Gauche : Logo SVG minimaliste + Identité CASH NOIR */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (isNative) {
                triggerHaptic(10);
                goCounter();
              } else {
                navigateTo('/');
              }
            }}
            className="flex items-center gap-2 select-none text-left hover:opacity-85 transition-opacity active:scale-95"
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
            <h1 className="max-sm:hidden font-[family-name:var(--font-display)] text-base leading-none tracking-[0.22em] text-zinc-100 sm:text-lg">
              CASH <span className="text-amber-400">NOIR</span>
            </h1>
          </button>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-zinc-500 uppercase tracking-widest">
            <span>{t.day} {day}</span>
            <span>·</span>
            <span className="text-zinc-400">{getLocalizedRank(totalProfit, gameLocale)}</span>
            {ascensionLevel > 0 && (
              <span className="border border-amber-500/40 bg-amber-500/10 px-1 py-0.2 text-[11px] text-amber-300">
                ASC.{ROMAN[ascensionLevel - 1] ?? ascensionLevel}
              </span>
            )}
          </div>
        </div>

        {/* Centre / HÉROS : Caisse & Danger (Mise en avant percutante du cash) */}
        <div className="flex items-center gap-2.5 sm:gap-6 bg-black/60 border border-white/5 rounded-full px-3 sm:px-4 py-1">
          <div className="flex flex-col items-center gap-0.5 leading-none font-mono sm:flex-row sm:items-baseline sm:gap-1.5">
            <span className="text-[11px] uppercase tracking-widest text-zinc-400">{t.cash}</span>
            <span className="text-base sm:text-xl font-bold tracking-tight text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              {gameLocale === 'en' ? `$${formatMoney(cash, gameLocale)}` : `${formatMoney(cash, gameLocale)} $`}
            </span>
          </div>

          <div className="h-3.5 w-px bg-white/10" />

          <button
            type="button"
            onClick={() => setTab('night')}
            title={gameLocale === 'en' ? 'Tonight’s rent (tap for the ledger)' : gameLocale === 'es' ? 'Alquiler de esta noche (ver el libro)' : 'Loyer de ce soir (voir le registre)'}
            className={`flex flex-col items-center gap-0.5 leading-none font-mono text-[11px] uppercase tracking-wider sm:flex-row sm:items-baseline sm:gap-1 ${cash < dailyRent ? 'text-red-400' : 'text-zinc-300'} hover:text-amber-300`}
          >
            <span className="text-zinc-400">{gameLocale === 'en' ? 'Rent' : gameLocale === 'es' ? 'Alquiler' : 'Loyer'}</span>
            <span className="font-semibold">{gameLocale === 'en' ? `$${formatMoney(dailyRent, gameLocale)}` : `${formatMoney(dailyRent, gameLocale)} $`}</span>
          </button>

          <div className="h-3.5 w-px bg-white/10 max-[359px]:hidden" />

          <div
            className={`flex flex-col items-center gap-0.5 leading-none font-mono text-[11px] uppercase tracking-wider max-[359px]:hidden sm:flex-row sm:gap-1.5 ${
              cityHeat >= 70 ? 'text-red-400 animate-pulse font-bold' : cityHeat >= 50 ? 'text-amber-400' : 'text-zinc-300'
            }`}
            title={tt(`Pression policière : ${cityHeat} %`, `Police pressure: ${cityHeat}%`, `Presión policial: ${cityHeat} %`)}
          >
            <span className="text-zinc-400 sm:hidden">{tt('Flics', 'Heat', 'Policía')}</span>
            <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5" />{cityHeat}%</span>
          </div>

          {jokerIds.length > 0 && (
            <>
              <div className="h-3.5 w-px bg-white/10 hidden lg:block" />
              <button type="button" onClick={() => setShowHelp(true)} className="lg:hidden flex items-center gap-1 font-mono text-[11px] text-amber-300" aria-label={tt('Atouts actifs', 'Active jokers', 'Comodines activos')}>
                ★{jokerIds.length}
              </button>
              <div role="button" tabIndex={0} onClick={() => setShowHelp(true)} className="hidden lg:flex cursor-pointer items-center gap-1.5" title={tt('Atouts actifs : clique pour le détail', 'Active jokers: click for details', 'Comodines activos: clic para ver el detalle')}>
                {jokerIds.map((jid) => {
                  const jk = JOKER_POOL.find((j) => j.id === jid);
                  const locJk = t.jokers[jid] ?? jk;
                  return (
                    <div
                      key={jid}
                      title={`${locJk?.name ?? jid}: ${locJk?.desc ?? ''}`}
                      className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:border-amber-400 hover:scale-110 transition-all cursor-help"
                    >
                      <JokerIcon id={jid} className="h-3.5 w-3.5" />
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {weeklyChallenge && (
            <>
              <div className="h-3.5 w-px bg-white/10 hidden md:block" />
              <span
                className="hidden md:inline font-mono text-[11px] uppercase tracking-widest text-zinc-500 hover:text-amber-300 cursor-help"
                title={localizeChallenge(weeklyChallenge, gameLocale).desc}
              >
                {localizeChallenge(weeklyChallenge, gameLocale).title}
              </span>
            </>
          )}
        </div>

        {/* Droite : Navigation sobre & Contrôles épurés */}
        <div className="contents sm:flex sm:w-auto sm:flex-nowrap sm:items-center sm:justify-end sm:gap-2">
          <nav className="order-2 max-sm:hidden max-lg:[@media(max-height:520px)]:hidden flex w-full min-w-0 max-w-full items-center justify-between gap-0.5 sm:gap-1 overflow-x-auto sm:justify-start no-scrollbar sm:order-none sm:w-auto font-mono text-[11px] sm:text-[11px] uppercase tracking-wider whitespace-nowrap">
            <button
              onClick={goCounter}
              className={`px-1 sm:px-2.5 py-1 transition-colors ${
                tab === 'counter'
                  ? 'border-b border-amber-400 text-amber-300 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="sm:hidden">{gameLocale === 'en' ? 'Counter' : gameLocale === 'es' ? 'Mostr.' : 'Cpt'} ({Math.min(clientsServedToday + 1, maxClientsPerDay)}/{maxClientsPerDay})</span>
              <span className="hidden sm:inline">{t.tabCounter} ({Math.min(clientsServedToday + 1, maxClientsPerDay)}/{maxClientsPerDay})</span>
            </button>

            <button
              onClick={() => setTab('night')}
              className={`px-1 sm:px-2.5 py-1 transition-colors ${
                tab === 'night'
                  ? 'border-b border-amber-400 text-amber-300 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.tabVault} ({inventory.length}){inventory.some((i) => i.secretState === 'open') ? ' ✦' : ''}
            </button>

            <button
              onClick={() => setTab('shop')}
              className={`px-1 sm:px-2.5 py-1 transition-colors ${
                tab === 'shop'
                  ? 'border-b border-amber-400 text-amber-300 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.tabEmpire}
            </button>

            <button
              onClick={() => setTab('pantheon')}
              className={`px-1 sm:px-2.5 py-1 transition-colors ${
                tab === 'pantheon'
                  ? 'border-b border-amber-400 text-amber-300 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.tabPantheon}
            </button>

            <button
              onClick={() => openDailyContract()}
              className={`flex items-center gap-1 px-1 sm:px-2.5 py-1 transition-colors ${
                tab === 'daily'
                  ? 'border-b border-amber-400 text-amber-300 font-semibold'
                  : 'text-amber-500/80 hover:text-amber-300'
              }`}
            >
              <Clock className="h-3 w-3 shrink-0" />
              <span className="sm:hidden"><DailyClock compact /></span>
              <span className="hidden sm:inline"><DailyClock /></span>
            </button>
          </nav>

          <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

          {/* Outils profil, son & debug épurés (sans boutons langue dans le header) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(15);
                setShowProfileModal(true);
              }}
              title={gameLocale === 'en' ? 'Profile & Preferences' : 'Profil & Préférences'}
              className="flex items-center gap-1 rounded-full border border-white/15 bg-black/60 px-2.5 py-1 font-mono text-[11px] text-zinc-300 hover:border-amber-400/60 hover:text-amber-300 transition-colors"
            >
              {authUser && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              <User className="h-3 w-3 text-amber-400" />
              {playerHandle.trim() && (
                <span className="max-sm:hidden max-w-[70px] sm:max-w-[90px] truncate font-semibold tracking-wider">
                  {playerHandle}
                </span>
              )}
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
              className="max-sm:hidden p-1 text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <KeyRound className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Options de partie (Debug & Réinitialisation — Moteur IA déplacé dans /admin) */}
      {showConfig && (
        <div className="border-b border-white/10 bg-[#121216] px-6 py-3">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-4">
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
      {tab === 'night' && (() => {
        const L = gameLocale;
        const money = (n: number) => (L === 'en' ? `$${formatMoney(n, L)}` : `${formatMoney(n, L)} $`);
        const tr = (fr: string, en: string, es: string) => (L === 'en' ? en : L === 'es' ? es : fr);
        const short = Math.max(0, dailyRent - cash);
        const openSecrets = inventory.filter((i) => i.secretState === 'open').length;
        const openCases = arcNotes.filter((n) => !n.resolved).length;
        const solvedCases = STORY_ARCS.filter((a) => arcNotes.some((n) => n.arcId === a.id && n.resolved && !n.failed)).length;
        const todo: string[] = [];
        if (debt > 0) todo.push(tr(`Tu dois ${money(debt)} au Syndicat : c’est inclus dans le loyer de ce soir.`, `You owe the Syndicate ${money(debt)}: it is included in tonight’s rent.`, `Debes ${money(debt)} al Sindicato: va incluido en el alquiler de esta noche.`));
        if (openSecrets > 0) todo.push(tr(`${openSecrets} pièce${openSecrets > 1 ? 's' : ''} à double fond à examiner.`, `${openSecrets} piece${openSecrets > 1 ? 's' : ''} with a false bottom to examine.`, `${openSecrets} pieza${openSecrets > 1 ? 's' : ''} con doble fondo por examinar.`));
        if (openCases > 0) todo.push(tr(`${openCases} piste${openCases > 1 ? 's' : ''} ouverte${openCases > 1 ? 's' : ''} : un client viendra réclamer l’objet-clé.`, `${openCases} open case${openCases > 1 ? 's' : ''}: a client will come for the key item.`, `${openCases} caso${openCases > 1 ? 's' : ''} abierto${openCases > 1 ? 's' : ''}: un cliente vendrá a por el objeto clave.`));
        const steps = [
          tr('Au comptoir, négocie avec tes mots et achète sous la valeur de rue.', 'At the counter, negotiate with your own words and buy under street value.', 'En el mostrador, negocia con tus palabras y compra por debajo del valor de calle.'),
          tr('Ici, nettoie ou revends tes pièces : vente rapide si tu manques de cash, enchères si tu peux attendre.', 'Here, clean or sell your pieces: quick sale if you are short on cash, auction if you can wait.', 'Aquí, limpia o vende tus piezas: venta rápida si andas corto de efectivo, subasta si puedes esperar.'),
          tr('Une pièce à double fond cache une énigme : la résoudre rapporte du cash, de l’XP ou baisse le Heat.', 'A false-bottom piece hides a riddle: solving it pays cash, XP or lowers Heat.', 'Una pieza con doble fondo esconde un acertijo: resolverlo da efectivo, XP o baja el Heat.'),
          tr(`Chaque soir, paye le loyer : 300 $ + 350 $ par jour + un impôt sur ton cash (${money(rentShare)} ce soir). Sinon, la boutique est saisie.`, `Every night, pay the rent: $300 + $350 per day + a tax on your cash (${money(rentShare)} tonight). Otherwise the shop is seized.`, `Cada noche, paga el alquiler: 300 $ + 350 $ por día + un impuesto sobre tu efectivo (${money(rentShare)} esta noche). Si no, te embargan la tienda.`),
          tr('Le compte suisse met ton argent à l’abri de la ruine (10 % de frais).', 'The Swiss account keeps your money safe from a bust (10% fee).', 'La cuenta suiza pone tu dinero a salvo de la ruina (10 % de comisión).'),
        ];
        const ghost = 'border border-white/15 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-zinc-200 hover:border-amber-400/60 hover:text-amber-300 disabled:opacity-40 transition-colors';
        const rentProgressPct = Math.min(100, Math.round((cash / dailyRent) * 100));
        return (
          <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-4 pb-24 sm:p-6 sm:pb-6 font-mono">
            {/* Bannière Concept Art du Coffre */}
            <div className="relative h-28 sm:h-36 w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl">
              <img
                src="/assets/vault/vault-room.webp"
                alt=""
                className="h-full w-full object-cover filter brightness-[0.7] contrast-[1.15]"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e14] via-black/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 sm:left-6 flex items-baseline justify-between right-4 sm:right-6">
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl text-amber-300 tracking-wider uppercase">
                    {tr('Le Coffre & Planque Clandestine', 'The Vault & Safehouse', 'La Caja Fuerte y Escondite')}
                  </h2>
                  <p className="text-[11px] text-zinc-300 font-mono">
                    {tr('Pièces sous séquestre, doubles fonds et réserves stratégiques', 'Sequestrated goods, false bottoms & strategic reserves', 'Bienes custodiados, dobles fondos y reservas estratégicas')}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-amber-400/90 bg-black/60 px-2.5 py-1 rounded border border-amber-500/30 backdrop-blur-sm">
                  <span>✦ {inventory.length}/6 {tr('pièces', 'items', 'piezas')}</span>
                  {jokerIds.length > 0 && <span>· {jokerIds.length} {tr('atouts', 'perks', 'comodines')}</span>}
                </div>
              </div>
            </div>

            {/* Atouts Actifs du Syndicat (Visuels Concept Art) */}
            {jokerIds.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                      {tr('Atouts Actifs du Syndicat', 'Active Syndicate Perks', 'Comodines Activos del Sindicato')}
                    </span>
                    <span className="text-amber-400 font-mono text-xs">({jokerIds.length})</span>
                  </div>
                  <span className="text-[11px] text-zinc-500">{tr('Bonus permanents accumulés sur cette carrière', 'Permanent bonuses stacked over this career', 'Bonificaciones permanentes')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {jokerIds.map((jid) => {
                    const jk = JOKER_POOL.find((j) => j.id === jid);
                    const locJk = t.jokers[jid] ?? jk;
                    return (
                      <div
                        key={jid}
                        className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#0d0e14] p-3 flex gap-3 items-center hover:border-amber-500/40 transition-all shadow-lg"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black/60 border border-white/10 flex items-center justify-center">
                          <img
                            src={`/assets/jokers/${jid}.webp`}
                            alt=""
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                          <JokerIcon id={jid} className="h-6 w-6 text-amber-400 absolute pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-xs text-zinc-100 truncate group-hover:text-amber-300 transition-colors">
                              {locJk?.name ?? jid}
                            </span>
                            <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-1 rounded uppercase shrink-0">
                              {locJk?.tag ?? '✦'}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                            {locJk?.desc ?? ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Registre de Loyer / Swiss Vault Ledger */}
            <section className="rounded-xl border border-white/10 bg-[#0d0e14] p-5 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-[0.25em] text-amber-500/80">
                      {tr(`Nuit ${day} · Registre du Syndicat`, `Night ${day} · Syndicate Ledger`, `Noche ${day} · Libro del Sindicato`)}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      short > 0 ? 'bg-red-950/80 text-red-300 border border-red-500/40' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {short > 0 ? tr(`Déficit : ${money(short)}`, `Deficit: ${money(short)}`, `Déficit: ${money(short)}`) : tr('Loyer Garanti', 'Rent Covered', 'Alquiler Cubierto')}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-bold tabular-nums text-zinc-50">{money(dailyRent)}</span>
                    <span className="text-xs text-zinc-500">
                      {tr('exigé à l’aube', 'due at dawn', 'exigido al alba')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {short > 0
                      ? tr(`Liquidités insuffisantes en caisse (${money(cash)} dispo). Vends une pièce ou puise dans le compte suisse.`, `Insufficient vault cash (${money(cash)} available). Liquidate a piece or tap Swiss funds.`, `Efectivo insuficiente (${money(cash)} disponible). Vende una pieza o retira de la cuenta suiza.`)
                      : tr(`Reste net en caisse après paiement : ${money(cash - dailyRent)}`, `Net remaining in cash after payment: ${money(cash - dailyRent)}`, `Restante neto en caja tras el pago: ${money(cash - dailyRent)}`)}
                  </p>
                  {heistRisk(cash, day, upgrades.armoredDoor, ascMod?.heistScale ?? 1) >= 0.1 && (
                    <p className="rounded border border-amber-500/40 bg-amber-950/40 px-2 py-1.5 text-[11px] leading-snug text-amber-200">
                      {tr(
                        `Ta caisse (${money(cash)}) attire les braqueurs : ${Math.round(heistRisk(cash, day, upgrades.armoredDoor, ascMod?.heistScale ?? 1) * 100)} % de risque cette nuit, 12 à 25 % de la caisse. Mets du cash en Suisse ou installe la porte blindée.`,
                        `Your register (${money(cash)}) attracts robbers: ${Math.round(heistRisk(cash, day, upgrades.armoredDoor, ascMod?.heistScale ?? 1) * 100)}% risk tonight, 12-25% of the cash. Move cash to Switzerland or install the armored door.`,
                        `Tu caja (${money(cash)}) atrae a los ladrones: ${Math.round(heistRisk(cash, day, upgrades.armoredDoor, ascMod?.heistScale ?? 1) * 100)} % de riesgo esta noche, 12-25 % de la caja. Pasa efectivo a Suiza o instala la puerta blindada.`,
                      )}
                    </p>
                  )}
                  {cityHeat >= raidAt - 5 && (
                    <p className="rounded border border-red-500/40 bg-red-950/40 px-2 py-1.5 text-[11px] leading-snug text-red-300">
                      {tr(
                        `Heat ${cityHeat} % : à ${raidAt} %, descente de police à la fin de la nuit. Tu perdrais ${inventory.length} pièce(s)${jokerIds.includes('double-fond') ? ' (2 sauvées par ton double-fond)' : ''} et 30 % de ta caisse. Nettoie tes pièces ou vends-les pour faire baisser le Heat.`,
                        `Heat ${cityHeat}%: at ${raidAt}%, a police raid hits at the end of the night. You would lose ${inventory.length} piece(s)${jokerIds.includes('double-fond') ? ' (2 saved by your false bottom)' : ''} and 30% of your cash. Clean or sell your pieces to lower the Heat.`,
                        `Heat ${cityHeat} %: al ${raidAt} %, redada policial al final de la noche. Perderías ${inventory.length} pieza(s)${jokerIds.includes('double-fond') ? ' (2 salvadas por tu doble fondo)' : ''} y el 30 % de tu caja. Limpia o vende tus piezas para bajar el Heat.`,
                      )}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={payRentAndNextDay}
                    className="brass px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#1a1206] transition-transform hover:scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                  >
                    {short <= 0
                      ? t.payRentBtn(formatMoney(dailyRent, L), day + 1)
                      : !graceUsed && debt === 0
                        ? tr(`Il manque ${money(short)} : le Syndicat avance (dette ${money(Math.ceil((short * 1.3) / 50) * 50)}) →`, `Short by ${money(short)}: the Syndicate fronts it (debt ${money(Math.ceil((short * 1.3) / 50) * 50)}) →`, `Faltan ${money(short)}: el Sindicato adelanta (deuda ${money(Math.ceil((short * 1.3) / 50) * 50)}) →`)
                        : tr(`Il manque ${money(short)} : boutique saisie (fin de partie)`, `Short by ${money(short)}: shop seized (game over)`, `Faltan ${money(short)}: tienda embargada (fin de la partida)`)}
                  </button>
                  {short > 0 && swissBank >= 500 && (
                    <button
                      type="button"
                      onClick={() => withdrawFromSwiss(500)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 underline underline-offset-4"
                    >
                      {tr('✦ Retirer 500 $ d’urgence (Suisse)', '✦ Emergency withdraw $500 (Swiss)', '✦ Retirada urgente de 500 $ (Suiza)')}
                    </button>
                  )}
                  {short > 0 && debt === 0 && (
                    <button
                      type="button"
                      onClick={takeSyndicateLoan}
                      className="text-[11px] text-red-400 hover:text-red-300 underline underline-offset-4"
                    >
                      {tr('✦ Crédit d’urgence Syndicat (+1 000 $)', '✦ Syndicate emergency loan (+$1,000)', '✦ Crédito de emergencia Sindicato (+1.000 $)')}
                    </button>
                  )}
                </div>
              </div>

              {/* Barre de progression loyer */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>{tr('Solde Caisse', 'Vault Cash', 'Caja')} : {money(cash)}</span>
                  <span>{rentProgressPct}%</span>
                </div>
                <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full transition-all duration-300 ${cash >= dailyRent ? 'bg-emerald-400' : 'bg-red-500'}`}
                    style={{ width: `${rentProgressPct}%` }}
                  />
                </div>
              </div>

              {(nightEvent || heatRaid || raidNote) && (
                <div className="rounded-lg bg-black/40 border border-white/5 p-3 space-y-1 text-xs">
                  {nightEvent && (
                    <p className="text-zinc-300">
                      <span className="text-amber-400 font-semibold">{localizeNightEvent(nightEvent, L).title}</span> · {localizeNightEvent(nightEvent, L).effectText}
                    </p>
                  )}
                  {heatRaid && <p className="text-red-400 font-bold">{t.raidAlert}</p>}
                  {raidNote && (
                    <p className={raidNote.startsWith('✓') || /15 ?%/.test(raidNote) ? 'text-emerald-300' : 'text-red-400'}>{raidNote}</p>
                  )}
                </div>
              )}

              {todo.length > 0 && (
                <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 space-y-1 text-xs text-amber-200">
                  <div className="text-[11px] uppercase font-bold text-amber-400 tracking-wider">
                    {tr('À faire ce soir', 'To do tonight', 'Por hacer esta noche')}
                  </div>
                  {todo.map((x) => (
                    <p key={x} className="text-zinc-300">• {x}</p>
                  ))}
                </div>
              )}

              <details className="text-xs text-zinc-400 border border-white/5 bg-black/30 p-2.5 rounded">
                <summary className="cursor-pointer text-zinc-500 hover:text-zinc-300 font-medium">{tr('Guide du Coffre (Comment ça marche)', 'Vault Guide (How it works)', 'Guía del Cofre (Cómo funciona)')}</summary>
                <ol className="mt-2.5 list-decimal space-y-1.5 pl-4 text-zinc-400 leading-relaxed text-[11px]">
                  {steps.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ol>
              </details>
            </section>

            {/* Compte suisse & Réserve Tactique */}
            <div className="grid gap-4 sm:grid-cols-2">
              <section className="rounded-xl border border-white/10 bg-[#0d0e14] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold">
                      +
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">{tr('Compte Suisse', 'Swiss Account', 'Cuenta Suiza')}</h3>
                      <p className="text-[11px] text-zinc-500">{tr('À l’abri de la ruine (10% frais)', 'Safe from bust (10% fee)', 'A salvo de la ruina (10% comisión)')}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold tabular-nums text-amber-300">{money(swissBank)}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {swissBank >= 500 && (
                    <button onClick={() => withdrawFromSwiss(500)} className={ghost}>
                      {t.withdrawSwiss}
                    </button>
                  )}
                  <button disabled={cash < 500} onClick={() => transferToSwiss(500)} className={ghost}>
                    {t.transfer500}
                  </button>
                  <button disabled={cash < 1500} onClick={() => transferToSwiss(1500)} className={ghost}>
                    {t.transfer1500}
                  </button>
                </div>
              </section>

              {/* Pouvoirs tactiques */}
              <section className="rounded-xl border border-white/10 bg-[#0d0e14] p-4 space-y-3">
                <div className="border-b border-white/10 pb-2">
                  <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">{t.tacticalUsage}</h3>
                  <p className="text-[11px] text-zinc-500">{tr('Pièces spéciales gardées en réserve', 'Special pieces kept in reserve', 'Piezas especiales guardadas')}</p>
                </div>
                {inventory.some((i) => /passeport/i.test(i.name) || /téléphone.*député/i.test(i.name)) ? (
                  <div className="flex flex-wrap gap-2 pt-1">
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
                        className="border border-red-500/40 bg-red-950/30 px-3 py-1.5 text-xs text-red-200 hover:bg-red-900/50 rounded"
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
                          setRaidNote(t.callContactNote(formatMoney(discount, L)));
                        }}
                        className="border border-amber-500/40 bg-amber-950/30 px-3 py-1.5 text-xs text-amber-200 hover:bg-amber-900/50 rounded"
                      >
                        {t.callContact}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-500 italic pt-1">{tr('Aucune pièce tactique active (Passeport, Téléphone Député...)', 'No tactical item active (Passport, Deputy Phone...)', 'Sin piezas tácticas activas (Pasaporte, Teléfono Diputado...)')}</p>
                )}
              </section>
            </div>

            {/* Pièces en réserve (Cartes Visuelles Ultra-Polish) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                  {tr('Pièces en réserve', 'Pieces in reserve', 'Piezas en reserva')} <span className="text-amber-400">({inventory.length})</span>
                </h2>
                <span className="text-[11px] text-zinc-500">{tr('Nettoie pour revendre aux enchères ou liquide en direct', 'Clean for auctions or fast sell for instant cash', 'Limpia para subastas o vende rápido')}</span>
              </div>

              {/* Arbitrage Marché : Vente Rapide vs Enchères Nocturnes */}
              <div className="rounded-xl border border-white/10 bg-[#0e1017] p-3.5 space-y-3 font-mono text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${auctionsToday === 0 ? 'bg-emerald-400' : auctionsToday === 1 ? 'bg-amber-400' : 'bg-red-400'}`} />
                    <span className="font-bold uppercase tracking-wider text-zinc-200">
                      {tr('Salle des Ventes Nocturnes', 'Night Auction House', 'Sala de Subastas Nocturnas')}
                    </span>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    auctionsToday === 0
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                  }`}>
                    {auctionsToday === 0
                      ? tr('Marché Ouvert · 1/1 créneau au prix fort', 'Market Open · 1/1 slot at top price', 'Mercado Abierto · 1/1 cupo al tope')
                      : tr(`Saturé (${auctionsToday} faite(s)) · Malus -${auctionsToday === 1 ? '25' : '45'}%`, `Saturated (${auctionsToday} done) · Malus -${auctionsToday === 1 ? '25' : '45'}%`, `Saturado (${auctionsToday} hecha(s)) · Malus -${auctionsToday === 1 ? '25' : '45'}%`)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans">
                  <div className="rounded-lg bg-black/40 border border-emerald-500/20 p-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-300 flex items-center gap-1 font-mono">
                        ⚡ {tr('Vente Rapide', 'Quick Sale', 'Venta Rápida')}
                      </span>
                      <span className="text-[11px] text-emerald-400/90 font-mono font-bold">{tr('Illimitée · Immédiat', 'Unlimited · Instant', 'Ilimitada · Inmediata')}</span>
                    </div>
                    <p className="text-zinc-400 leading-snug">
                      {tr(
                        'Revente de rue sans risque. Rend du cash tout de suite et refroidit la police (−5% Heat). Idéal si le loyer approche ou sur petites pièces.',
                        'Street liquidation with zero risk. Delivers instant cash and cools police (-5% Heat). Ideal when rent is due or on cheap items.',
                        'Liquidación callejera sin riesgo. Entrega efectivo inmediato y enfría a la policía (-5% Heat). Ideal si vence el alquiler o con piezas baratas.'
                      )}
                    </p>
                  </div>

                  <div className="rounded-lg bg-black/40 border border-amber-500/20 p-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 flex items-center gap-1 font-mono">
                        🏛 {tr('Enchères Clandestines', 'Night Auctions', 'Subastas Clandestinas')}
                      </span>
                      <span className="text-[11px] text-amber-400/90 font-mono font-bold">{tr('1 seule/nuit · Cote +20%', '1/night only · Top +20%', '1 sola/noche · Tope +20%')}</span>
                    </div>
                    <p className="text-zinc-400 leading-snug">
                      {tr(
                        'Prix maximal aux collectionneurs. Attention : sature dès la 2e de la nuit (-25%) et EXIGE une pièce nettoyée (sinon +18% Heat policier) !',
                        'Top price from private collectors. Beware: saturates after the 1st (-25%) and REQUIRES a cleaned item (otherwise +18% Police Heat)!',
                        'Tope de precio con coleccionistas. Cuidado: satura tras la 1ª (-25%) y EXIGE pieza limpia (¡si no, +18% Heat policial)!'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {inventory.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-black/30 p-8 text-center space-y-3">
                  <p className="text-sm font-semibold text-zinc-300">{t.vaultEmpty}</p>
                  <p className="text-xs text-zinc-500 max-w-md mx-auto">{tr('Retourne au comptoir pour négocier tes premières acquisitions.', 'Head back to the counter to negotiate your first deals.', 'Vuelve al mostrador para negociar tus compras.')}</p>
                  {arcNotes.filter((n) => !n.resolved).length > 0 && (
                    <div className="mt-4 mx-auto text-left max-w-md rounded-lg border border-purple-500/30 bg-purple-950/20 p-3.5 font-mono text-[11px] text-purple-200 shadow-lg space-y-1.5">
                      <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                        <span>🔍</span>
                        <span>{tr("Carnet d'histoire vs Coffre physique", 'Story Notebook vs Physical Vault', 'Cuaderno de Trama vs Caja Física')}</span>
                        <span className="text-purple-400 font-normal">({arcNotes.filter((n) => !n.resolved).length} {tr('piste en cours', 'active lead', 'pista activa')})</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                        {tr(
                          "Tu as une enquête ouverte dans ton carnet, mais aucune pièce physique dans ton coffre-fort. Les « Pièces en réserve » sont uniquement les objets matériels en stock. Dès que tu achètes l'objet d'une piste au comptoir, garde-le ici pour débloquer l'étape finale et empocher les 7 500 $ de prime !",
                          "You have an open case in your notebook, but no physical pieces in your safe. 'Pieces in reserve' are strictly tangible stock. As soon as you acquire a lead's item at the counter, keep it here to unlock the final step and pocket the $7,500 bounty!",
                          "Tienes un caso abierto en tu cuaderno, pero ninguna pieza física en tu caja. Las 'Piezas en reserva' son existencias físicas. ¡En cuanto compres el objeto de una pista en el mostrador, consérvalo aquí para desbloquear el paso final y cobrar los 7 500 $ de recompensa!"
                        )}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-3">
                  {inventory.map((item) => {
                    const ui = SECRET_UI[L];
                    const kind = itemKindFor(item.name);
                    const fastPayout = getFastSellPayout(item);
                    const auctionPayout = getAuctionPayout(item);
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-white/10 bg-[#0d0e14] p-4 hover:border-amber-500/30 transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Miniature visuelle de l'objet */}
                            <div className="relative h-14 w-20 shrink-0 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center p-1 overflow-hidden shadow-inner">
                              <img
                                src={`/assets/items/${kind}.webp`}
                                alt={item.name}
                                className="h-full w-full object-contain mix-blend-lighten drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
                              />
                              {item.secretId && item.secretState === 'open' && (
                                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                              )}
                            </div>

                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-bold text-zinc-100 truncate">{localizeItemName(item.name, L)}</h3>
                                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                  item.cleaned ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-red-950/80 text-red-300 border border-red-500/30'
                                }`}>
                                  {item.cleaned ? t.cleanedBadge : item.hotLevel === 'BRÛLANT' ? tr('Brûlant', 'Hot', 'Caliente') : tr('Tiède', 'Warm', 'Tibia')}
                                </span>
                                {item.modifier && (
                                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-500/30">
                                    {item.modifier === 'traceur' ? t.modGps : item.modifier === 'collection' ? t.modCollection : t.modCounterfeit}
                                  </span>
                                )}
                                {item.arcItemKey && (
                                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-purple-950/90 text-purple-200 border border-purple-500/50 flex items-center gap-1 shadow-[0_0_8px_rgba(168,85,247,0.35)] animate-pulse">
                                    🔍 {tr("Piste d'Enquête · Garder au Coffre", 'Investigation Lead · Keep in Vault', 'Pista de Investigación · Guardar en Caja')}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-zinc-400">
                                <span className="text-zinc-500">{localizeFaction(item.faction, L)}</span> · {t.paidLabel(formatMoney(item.paid, L))} · <span className="text-emerald-400 font-semibold">{tr('rue', 'street', 'calle')} ~{money(item.streetValue)}</span>
                              </p>
                            </div>
                          </div>

                          {/* Boutons d'action */}
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {!item.cleaned && (
                                <button
                                  onClick={() => cleanItem(item.id)}
                                  className={ghost}
                                  title={tr('Efface les traces (-250 $, -8% Heat) pour débloquer la cote maximale aux enchères.', 'Wipe traces (-$250, -8% Heat) to unlock max auction price.', 'Borra las huellas (-250 $, -8% Heat) para desbloquear precio tope en subasta.')}
                                >
                                  {t.cleanBtn}
                                </button>
                              )}
                              <button
                                onClick={() => sellItem(item.id, 'fast')}
                                title={tr('Liquidation discrète immédiate : refroidit le Heat (-5%), aucune pénalité de saturation.', 'Immediate quiet liquidation: cools Heat (-5%), no saturation penalty.', 'Liquidación discreta inmediata: baja el Heat (-5 %), sin penalización de saturación.')}
                                className="border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-900/60 rounded transition-colors"
                              >
                                {t.fastSellBtn(formatMoney(fastPayout, L))}
                              </button>
                              <button
                                onClick={() => sellItem(item.id, 'auction')}
                                title={tr('Enchère clandestine : gros cash mais sature dès la 2e de la nuit, et attire la police (+18% Heat si non nettoyé).', 'Underground auction: big cash but market saturates after the 1st/night, +18% Heat if not cleaned.', 'Subasta clandestina: mucho efectivo pero satura tras la 1ª de la noche, +18% Heat si no está limpio.')}
                                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-transform hover:scale-105 cursor-pointer ${
                                  auctionsToday >= 1
                                    ? 'border border-amber-500/50 bg-amber-950/40 text-amber-200 hover:bg-amber-900/60'
                                    : !item.cleaned
                                      ? 'border border-red-500/50 bg-red-950/40 text-red-200 hover:bg-red-900/60'
                                      : 'brass text-[#1a1206]'
                                }`}
                              >
                                {t.auctionBtn(formatMoney(auctionPayout, L))}
                              </button>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                              <span className="text-emerald-400/80">⚡ {tr('-5% Heat · Discret', '-5% Heat · Discreet', '-5% Heat · Discreto')}</span>
                              {auctionsToday >= 1 ? (
                                <span className="text-amber-400 font-bold">
                                  🏛 {tr(`Saturé (-${auctionsToday === 1 ? '25' : '45'}%)`, `Saturated (-${auctionsToday === 1 ? '25' : '45'}%)`, `Saturado (-${auctionsToday === 1 ? '25' : '45'}%)`)}
                                </span>
                              ) : !item.cleaned ? (
                                <span className="text-red-400 font-bold">
                                  🏛 {tr('+18% Heat si sale', '+18% Heat if dirty', '+18% Heat si está sucia')}
                                </span>
                              ) : (
                                <span className="text-amber-400 font-bold">
                                  🏛 {tr('Cote Max (+20%) · 1/nuit', 'Top Price (+20%) · 1/night', 'Tope Precio (+20%) · 1/noche')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Énigme du Double Fond */}
                        {item.secretId && item.secretState === 'open' && (
                          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenSecretId((cur) => (cur === item.id ? null : item.id));
                                setSecretInput('');
                              }}
                              className="text-xs font-bold text-amber-300 uppercase tracking-wider hover:underline"
                            >
                              {ui.badge} · {openSecretId === item.id ? ui.close : ui.examine}
                            </button>
                            {openSecretId === item.id && (() => {
                              const c = secretContent(item.secretId!, L);
                              if (!c) return null;
                              return (
                                <div className="space-y-3 border-t border-amber-500/20 pt-2 text-zinc-200">
                                  <p className="whitespace-pre-line text-xs leading-relaxed">{c.note}</p>
                                  {showHint[item.id] && <p className="text-xs text-sky-300">{c.hint}</p>}
                                  <div className="flex flex-wrap items-center gap-2">
                                    <input
                                      value={secretInput}
                                      onChange={(e) => setSecretInput(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && submitSecret(item)}
                                      placeholder={ui.placeholder}
                                      maxLength={24}
                                      className="min-w-0 flex-1 border border-white/20 bg-black/60 px-2.5 py-1.5 text-xs text-zinc-100 rounded"
                                    />
                                    <button type="button" onClick={() => submitSecret(item)} className="brass px-3 py-1.5 text-xs font-bold text-[#1a1206]">
                                      {ui.submit}
                                    </button>
                                    <button type="button" onClick={() => setShowHint((h) => ({ ...h, [item.id]: true }))} className={ghost}>
                                      {ui.hint}
                                    </button>
                                  </div>
                                  <p className="text-[11px] text-zinc-500">{ui.lostOnSale}</p>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                        {secretMsg[item.id] && (
                          <p className={`text-xs ${item.secretState === 'solved' ? 'text-emerald-300' : item.secretState === 'burned' ? 'text-red-300' : 'text-amber-300'}`}>{secretMsg[item.id]}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Pistes */}
            <details className="border-t border-white/10 pt-4 text-sm">
              <summary className="cursor-pointer text-zinc-300 hover:text-white">
                {tr('Pistes', 'Cases', 'Casos')} <span className="text-zinc-500">· {tr(`${solvedCases}/${STORY_ARCS.length} résolues`, `${solvedCases}/${STORY_ARCS.length} solved`, `${solvedCases}/${STORY_ARCS.length} resueltos`)}</span>
              </summary>
              <p className="mt-3 text-zinc-500">
                {tr('Achète l’objet-clé d’une piste : un client reviendra le réclamer et paiera cher.', 'Buy the key item of a case: a client will come back to claim it and pay well.', 'Compra el objeto clave de un caso: un cliente volverá a reclamarlo y pagará bien.')}
              </p>
              <ul className="mt-3 space-y-1">
                {STORY_ARCS.map((arc) => {
                  const solved = arcNotes.some((n) => n.arcId === arc.id && n.resolved && !n.failed);
                  const failed = arcNotes.some((n) => n.arcId === arc.id && n.failed);
                  const active = arcNotes.some((n) => n.arcId === arc.id && !n.resolved);
                  return (
                    <li key={arc.id} className={solved ? 'text-emerald-400' : failed ? 'text-red-400/70 line-through' : active ? 'text-amber-200' : 'text-zinc-500'}>
                      {solved ? '✓' : failed ? '✗' : active ? '•' : '○'} {localizeArcTitle(arc.id, arc.title, L)}
                      <span className="text-zinc-500"> {solved ? tr('· résolue', '· solved', '· resuelto') : failed ? tr('· rompue (pièce vendue)', '· broken (item sold)', '· rota (pieza vendida)') : active ? tr('· en cours', '· in progress', '· en curso') : ''}</span>
                    </li>
                  );
                })}
              </ul>
            </details>

            {/* Registre des clients */}
            <details open={showRegistry} onToggle={(e) => setShowRegistry((e.currentTarget as HTMLDetailsElement).open)} className="border-t border-white/10 pt-4 text-sm">
              <summary className="cursor-pointer text-zinc-300 hover:text-white">
                {tr('Registre des clients', 'Client ledger', 'Registro de clientes')} <span className="text-zinc-500">({registry.length})</span>
              </summary>
              {registry.length === 0 ? (
                <p className="mt-3 text-zinc-500">{tr('Aucun client pour l’instant.', 'No client yet.', 'Aún no hay clientes.')}</p>
              ) : (
                <ul className="mt-3 max-h-80 divide-y divide-white/5 overflow-y-auto thin-scroll">
                  {[...registry].reverse().slice(0, 30).map((r) => {
                    const visits = registry.filter((x) => x.castId && x.castId === r.castId).length;
                    const label =
                      r.result === 'deal'
                        ? tr(`Acheté ${money(r.paid)}`, `Bought ${money(r.paid)}`, `Comprado ${money(r.paid)}`)
                        : r.result === 'trap'
                          ? tr('Souricière', 'Sting', 'Trampa')
                          : r.result === 'gun'
                            ? tr('Braquage', 'Hold-up', 'Atraco')
                            : tr('Parti / refusé', 'Walked / passed', 'Se fue / rechazado');
                    return (
                      <li key={r.id} className="flex items-center gap-3 py-2">
                        <img
                          src={`/assets/portraits/${resolveCastPortrait(r.portraitId ?? r.castId, r.gender, r.name, r.job)}.webp`}
                          alt=""
                          loading="lazy"
                          className="h-9 w-9 shrink-0 object-cover object-top"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-zinc-200">
                            {r.name}
                            {visits > 1 ? ` ×${visits}` : ''}
                          </span>
                          <span className="block truncate text-xs text-zinc-500">
                            {localizeArchetype(r.job, L)} · {tr('Jour', 'Day', 'Día')} {r.day}
                          </span>
                          {r.castId && sagas[r.castId] && <span className="block truncate text-[11px] text-violet-300">{sagaLabel(sagas[r.castId])}</span>}
                        </span>
                        <span className={`shrink-0 text-xs ${r.result === 'deal' ? 'text-emerald-400' : 'text-red-400'}`}>{label}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </details>
          </main>
        );
      })()}

      {/* TAB: SHOP / UPGRADES & MONETIZATION */}
      {tab === 'shop' && (
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 pb-24 sm:p-6 sm:pb-6 space-y-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-400">
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
                  className="group overflow-hidden rounded-xl border border-white/10 bg-[#0c0d12] flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-xl"
                >
                  <div className="relative h-28 w-full overflow-hidden bg-black/80">
                    <img
                      src={`/assets/empire/${up.key}.webp`}
                      alt={up.title}
                      className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d12] via-transparent to-transparent" />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-black/70 backdrop-blur-md border border-amber-500/40 flex items-center justify-center text-amber-300">
                        <EmpireIcon id={up.key} className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      {owned ? (
                        <span className="flex items-center gap-1 rounded bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 text-[11px] font-mono font-bold text-emerald-300 backdrop-blur-md">
                          <Unlock className="w-3 h-3" /> {t.equipped}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded bg-black/70 border border-white/10 px-2 py-0.5 text-[11px] font-mono text-zinc-400 backdrop-blur-md">
                          <Lock className="w-3 h-3" /> {formatMoney(up.cost, gameLocale)} $
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-100">
                        {up.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{up.desc}</p>
                    </div>
                    <button
                      disabled={owned || cash < up.cost}
                      onClick={() => buyUpgrade(up.key, up.cost)}
                      className={`w-full py-2 rounded font-mono text-xs font-bold uppercase tracking-wider transition-colors mt-2 ${
                        owned
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/35 cursor-default'
                          : 'brass text-[#1a1206] disabled:opacity-40'
                      }`}
                    >
                      {owned ? t.equipped : t.buyUpgrade(formatMoney(up.cost, gameLocale))}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Méta-Empire : Actifs de la Ville & Quartiers */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400">
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
                    className="group overflow-hidden rounded-xl border border-white/10 bg-[#0c0d12] flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-xl"
                  >
                    <div className="relative h-28 w-full overflow-hidden bg-black/80">
                      <img
                        src={`/assets/empire/${asset.id}.webp`}
                        alt={locAsset.name}
                        className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d12] via-transparent to-transparent" />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-black/70 backdrop-blur-md border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                          <EmpireIcon id={asset.id} className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        <span className="inline-block text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 uppercase tracking-wider rounded font-bold backdrop-blur-md">
                          {locAsset.tag}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-100 truncate">
                          {locAsset.name}
                        </h3>
                        <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{locAsset.desc}</p>
                      </div>
                      <button
                        disabled={owned || swissBank < asset.costSwiss}
                        onClick={() => buyCityAsset(asset)}
                        className={`w-full py-2 rounded font-mono text-xs font-bold uppercase tracking-wider transition-colors mt-2 ${
                          owned
                            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/35 cursor-default'
                            : 'border border-emerald-500/50 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 disabled:opacity-40'
                        }`}
                      >
                        {owned
                          ? t.assetOwned
                          : t.buyAsset(formatMoney(asset.costSwiss, gameLocale))}
                      </button>
                    </div>
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
                    className={`group overflow-hidden rounded-xl border text-left flex flex-col justify-between transition-all shadow-xl ${
                      active
                        ? 'border-amber-500/60 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : unlocked
                          ? 'border-white/10 bg-[#0c0d12] hover:border-white/20'
                          : 'border-white/5 bg-black/40 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="relative h-28 w-full overflow-hidden bg-black/80">
                      <img
                        src={`/assets/empire/${dist.id}.webp`}
                        alt={locDist.name}
                        className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d12] via-transparent to-transparent" />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                        <div className={`h-7 w-7 rounded-lg backdrop-blur-md flex items-center justify-center ${
                          active ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50' : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        }`}>
                          <EmpireIcon id={dist.id} className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        <span className="inline-block text-[11px] font-mono text-zinc-300 bg-black/70 border border-white/10 px-2 py-0.5 rounded backdrop-blur-md">
                          {dist.unlockSwiss === 0
                            ? t.districtOpen
                            : t.districtRequired(formatMoney(dist.unlockSwiss, gameLocale))}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-100 truncate">
                          {locDist.name}
                        </h3>
                        <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{locDist.desc}</p>
                      </div>
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[11px] uppercase">
                        <span className={active ? 'font-bold text-amber-400' : unlocked ? 'text-zinc-400' : 'text-zinc-600'}>
                          {active ? t.districtActive : unlocked ? t.districtOpen : t.districtRequired(formatMoney(dist.unlockSwiss, gameLocale))}
                        </span>
                        {active && <span className="text-amber-400">✓ ACTIF</span>}
                      </div>
                    </div>
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
          daysSinceStart={daysSinceStart}
          questProgress={questProgress}
          claimedQuestIds={claimedQuestIds}
          loginStreak={loginStreak}
          unlockedAchievements={unlockedAchievements}
        />
      )}

      {/* TAB: COUNTER (DAY) OR DAILY CONTRACT (FOMO) */}
      {openingDaily && tab === 'daily' && (
        <main role="status" className="flex flex-1 items-center justify-center gap-3 text-base text-amber-200">
          <Clock className="size-5" />{tt('Ouverture du contrat…', 'Opening contract…', 'Abriendo el contrato…')}
        </main>
      )}
      {(tab === 'counter' || (tab === 'daily' && !openingDaily)) && (
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

          <div className="relative z-20 flex h-full min-h-0 flex-col justify-between overflow-hidden lg:grid lg:grid-cols-[21rem_minmax(0,1fr)_21rem] lg:grid-rows-[minmax(0,1fr)_auto] lg:gap-x-6 lg:gap-y-3 lg:px-6 lg:pt-4">
            {/* ==================== HAUT : HUD & CARNET DE COMPTOIR ==================== */}
            <div className="pointer-events-none relative z-30 flex flex-col gap-1.5 p-2 sm:p-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-6 sm:pt-4 lg:contents">
              {/* Gauche : HUD sobre typographique avec fond sombre protecteur */}
              <div className="pointer-events-auto flex w-full max-w-md flex-col gap-1.5 sm:gap-2.5 rounded-sm border border-white/20 bg-[#15161c]/95 p-2 sm:p-3 backdrop-blur-md drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] lg:col-start-1 lg:row-start-1 lg:max-w-none lg:self-start">
                <div className="flex items-center justify-between gap-2 sm:items-baseline sm:gap-4">
                  <button type="button" onClick={() => setShowClientSheet(true)} className="shrink-0 self-center max-sm:hidden lg:hidden" aria-label={tt('Fiche du client', 'Client profile', 'Ficha del cliente')}>
                    <img
                      src={`${PORTRAIT_DIR}${resolveCastPortrait(currentCase.portraitOverride ?? currentCase.castId, currentCase.gender, currentCase.name, currentCase.displayArchetype ?? currentCase.archetype)}.webp`}
                      alt=""
                      onError={useFallbackPortrait}
                      className="h-12 w-12 rounded-full border border-amber-500/40 object-cover object-[50%_18%]"
                    />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:gap-x-2 sm:gap-y-0">
                      {currentCase.isBoss && (
                        <span className="bg-red-600/90 px-1 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white sm:text-[11px] shrink-0">
                          BOSS · {currentCase.bossTitle}
                        </span>
                      )}
                      {currentCase.arcStep === 2 && (
                        <span className={`px-1.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest sm:text-[11px] shrink-0 ${
                          inventory.some((i) => i.arcItemKey === currentCase.requiresItemKey)
                            ? 'bg-amber-600/90 text-white'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-600'
                        }`}>
                          {inventory.some((i) => i.arcItemKey === currentCase.requiresItemKey)
                            ? tt('RACHAT', 'BUYBACK', 'RECOMPRA')
                            : tt('PISTE PERDUE', 'LOST LEAD', 'PISTA PERDIDA')}
                        </span>
                      )}
                      {heroCastId && currentCase.castId === heroCastId && (
                        <span className="shrink-0 max-sm:order-last border border-amber-400/60 bg-amber-950/70 px-1.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest text-amber-200 sm:text-[11px]">
                          ★ {tt('Héros de la saison', 'Hero of the season', 'Héroe de la temporada')}
                        </span>
                      )}
                      {currentCase.windfall && (
                        <span className="shrink-0 max-sm:order-last border border-emerald-400/60 bg-emerald-950/70 px-1.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-200 sm:text-[11px]">
                          ★ {tt('Trouvaille', 'Windfall', 'Hallazgo')}
                        </span>
                      )}
                      {currentCase.saga && (
                        <span className="shrink-0 max-sm:order-last max-sm:max-w-full max-sm:truncate border border-violet-400/50 bg-violet-950/60 px-1.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest text-violet-200 sm:text-[11px]">
                          {currentCase.saga.ally ? '★' : `${tt('Ép.', 'Ep.', 'Ep.')} ${currentCase.saga.episode}/${SAGA_EPISODES}`} · {currentCase.saga.chapter}
                        </span>
                      )}
                      <span className="truncate font-[family-name:var(--font-display)] text-base tracking-wider text-zinc-100 uppercase sm:shrink-0 sm:overflow-visible sm:whitespace-nowrap sm:text-3xl">
                        {currentCase.name}
                      </span>
                      <span className="hidden sm:inline font-mono text-[11px] text-zinc-400 uppercase sm:text-[11px]">
                        {currentCase.age} {gameLocale === 'en' ? 'Y.O.' : gameLocale === 'es' ? 'AÑOS' : 'ANS'} · {localizeArchetype(currentCase.displayArchetype ?? currentCase.archetype, gameLocale)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 sm:hidden font-mono text-[11px]">
                      <span className="max-w-full text-zinc-300 truncate">
                        {currentCase.age} {gameLocale === 'en' ? 'Y.O.' : gameLocale === 'es' ? 'AÑOS' : 'ANS'} · {localizeArchetype(currentCase.displayArchetype ?? currentCase.archetype, gameLocale)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(10);
                          setShowItemSheet(true);
                        }}
                        aria-label={tt('Examiner l’objet', 'Inspect the item', 'Examinar el objeto')}
                        className="flex w-full items-center gap-1.5 rounded-md border border-amber-500/40 bg-black/60 px-2 py-1 text-left active:scale-95 transition-transform"
                      >
                        <img
                          src={`/assets/items/${itemKindFor(localizeItemName(currentCase.item.name, gameLocale))}.webp`}
                          alt=""
                          className="h-5 w-7 object-contain mix-blend-lighten shrink-0"
                          onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                        />
                        <span className="min-w-0 flex-1 line-clamp-2 text-[12px] leading-tight font-semibold text-amber-300">
                          {currentCase.arcStep === 2 && !inventory.some((i) => i.arcItemKey === currentCase.requiresItemKey)
                            ? tt(`Recherche : ${localizeItemName(currentCase.item.name, gameLocale)}`, `Searching: ${localizeItemName(currentCase.item.name, gameLocale)}`, `Buscando: ${localizeItemName(currentCase.item.name, gameLocale)}`)
                            : localizeItemName(currentCase.item.name, gameLocale)}
                        </span>
                        <span className="shrink-0 text-[11px] font-mono text-zinc-400">
                          ~{mny(currentCase.streetValue)}
                        </span>
                        <span className="shrink-0 text-[12px] font-mono font-bold text-amber-400 flex items-center gap-0.5">
                          {inspected || uvScanned ? '✓' : <Search className="h-4 w-4" />}
                        </span>
                      </button>
                    </div>
                    <div className="hidden sm:flex min-w-0 items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
                      <span className="max-w-full truncate text-amber-400/90 font-medium">
                        {currentCase.arcStep === 2 && !inventory.some((i) => i.arcItemKey === currentCase.requiresItemKey)
                          ? tt(`Recherche : ${localizeItemName(currentCase.item.name, gameLocale)}`, `Searching: ${localizeItemName(currentCase.item.name, gameLocale)}`, `Buscando: ${localizeItemName(currentCase.item.name, gameLocale)}`)
                          : `${localizeItemName(currentCase.item.name, gameLocale)} · ${localizeFaction(currentCase.faction, gameLocale)}`}
                      </span>
                    </div>
                  </div>

                  {/* Prix demandé massif + boutons rapides intégrés sur mobile */}
                  <div className="shrink-0 text-right">
                    <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                      <div className="text-right">
                        <span className="hidden sm:block font-mono text-[11px] uppercase tracking-widest text-zinc-400 sm:text-[11px]">
                          {currentCase.arcStep === 2
                            ? (inventory.some((i) => i.arcItemKey === currentCase.requiresItemKey)
                                ? tt(currentCase.gender === 'f' ? 'Elle paie pour reprendre' : 'Il paie pour reprendre', currentCase.gender === 'f' ? 'She pays to retrieve' : 'He pays to retrieve', currentCase.gender === 'f' ? 'Ella paga para recuperar' : 'Él paga para recuperar')
                                : tt('Pièce manquante', 'Missing item', 'Pieza faltante'))
                            : currentCase.special?.kind === 'buyer' ? tt('Il propose', 'He offers', 'Ofrece') : currentCase.special ? (currentCase.special.kind === 'event' ? tt('Alerte', 'Alert', 'Alerta') : tt('Indic', 'Informant', 'Confidente')) : currentCase.gender === 'f' ? t.askingShe : t.askingHe}
                        </span>
                        <span className="font-[family-name:var(--font-display)] text-xl sm:text-4xl leading-none tracking-wider text-amber-300">
                          {currentCase.arcStep === 2
                            ? (inventory.some((i) => i.arcItemKey === currentCase.requiresItemKey)
                                ? mny(currentCase.arcRewardCash || 0)
                                : '—')
                            : currentCase.special?.kind === 'buyer' ? mny(currentCase.special.offer) : currentCase.special ? '—' : mny(askedPrice)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 lg:hidden max-sm:hidden">
                        {tab === 'counter' && (
                          <button
                            onClick={rerollClient}
                            title={gameLocale === 'en' ? `Next client (${rerollsLeft} left)` : `Suivant (${rerollsLeft} restants)`}
                            className="flex items-center gap-0.5 border border-white/15 bg-black/80 px-1.5 py-0.5 font-mono text-[11px] text-zinc-300 hover:border-amber-400/50 hover:text-white"
                          >
                            <RotateCcw className="h-2.5 w-2.5" /> {rerollsLeft}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowHelp(true)}
                          title={gameLocale === 'en' ? 'How to play' : 'Comment jouer'}
                          className="border border-white/15 bg-black/80 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400 hover:text-amber-300"
                        >
                          ?
                        </button>
                      </div>
                    </div>
                    {priceTrail.length > 1 && (
                      <span
                        title={priceTrail.map((p) => (gameLocale === 'en' ? `$${formatMoney(p, gameLocale)}` : `${formatMoney(p, gameLocale)} $`)).join(' → ')}
                        className="mt-0.5 block whitespace-nowrap font-mono text-[11px] sm:text-[11px] text-emerald-400"
                      >
                        <s className="text-zinc-500">{gameLocale === 'en' ? `$${formatMoney(priceTrail[0], gameLocale)}` : `${formatMoney(priceTrail[0], gameLocale)} $`}</s>{' '}
                        −{((priceTrail[0] - askedPrice) / Math.max(1, priceTrail[0]) * 100).toFixed(0)} %
                        {jokerIds.includes('negociateur') && (
                          <span className="ml-1 text-[11px] text-amber-300 font-bold tracking-tight">★ -10% NÉGO</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Jauges segmentées façon moniteur analogique */}
                {currentCase.special?.kind === 'buyer' && (
                  <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-1 font-mono text-[11px] sm:pt-1.5 sm:text-[11px]">
                    <span className="font-semibold uppercase text-amber-300/90">{tt('Patience', 'Patience', 'Paciencia')}</span>
                    <span className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className={`h-1.5 w-7 ${i < (currentCase.special?.kind === 'buyer' ? currentCase.special.patience : 0) ? 'bg-amber-400' : 'bg-white/10'}`} />
                      ))}
                    </span>
                    <span className="text-zinc-400">{tt('Rue', 'Street', 'Calle')} ~{mny(currentCase.streetValue)}</span>
                  </div>
                )}
                <div onClick={() => window.matchMedia('(max-width: 639px)').matches && setShowClientSheet(true)} className={`${currentCase.special ? 'hidden ' : ''}max-sm:cursor-pointer grid grid-cols-3 gap-2 border-t border-white/10 pt-1 sm:gap-3 sm:pt-1.5 font-mono text-[11px] sm:text-[11px]`}>
                  {[
                    {
                      label: t.fear,
                      val: gauges.peur,
                      delta: gaugeDeltas.peur,
                      key: `p-${gaugeDeltas.key}`,
                      title: tt('Plus il a peur, plus son prix plancher baisse', 'The more afraid he is, the lower his floor price', 'Cuanto más miedo tiene, más baja su precio mínimo'),
                      labelCls: 'text-amber-300/90',
                      fillCls: 'bg-amber-400',
                      deltaCls: 'text-amber-300',
                    },
                    {
                      label: t.anger,
                      val: gauges.colere,
                      delta: gaugeDeltas.colere,
                      key: `c-${gaugeDeltas.key}`,
                      title: tt('À 80% il dégaine son arme', 'At 80% he draws a weapon', 'Al 80 % saca un arma'),
                      labelCls: gauges.colere >= 60 ? 'animate-pulse font-bold text-red-400' : 'text-zinc-400',
                      fillCls: gauges.colere >= 60 ? 'bg-red-500' : 'bg-orange-400',
                      deltaCls: 'text-red-400',
                    },
                    {
                      label: t.suspicion,
                      val: gauges.mefiance,
                      delta: gaugeDeltas.mefiance,
                      key: `m-${gaugeDeltas.key}`,
                      title: tt('À 88% il claque la porte', 'At 88% he walks out', 'Al 88 % se va dando un portazo'),
                      labelCls: 'text-sky-300/90',
                      fillCls: 'bg-sky-400',
                      deltaCls: 'text-sky-300',
                    },
                  ].map((g) => {
                    const hasShift = Boolean(g.delta);
                    const prevVal = g.val - (g.delta ?? 0);
                    return (
                      <div
                        key={g.label}
                        className={`relative rounded p-1 transition-all ${
                          hasShift
                            ? g.label === t.fear
                              ? 'ring-1 ring-amber-400/80 bg-amber-400/10 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                              : g.label === t.anger
                                ? 'ring-1 ring-red-500/80 bg-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.35)]'
                                : 'ring-1 ring-sky-400/80 bg-sky-400/10 shadow-[0_0_12px_rgba(56,189,248,0.35)]'
                            : ''
                        }`}
                        title={g.title}
                      >
                        <div className={`mb-1 flex items-baseline justify-between gap-1 ${g.labelCls}`}>
                          <span className="min-w-0 truncate font-semibold">{g.label}</span>
                          <span className="shrink-0 whitespace-nowrap font-mono font-bold">
                            {hasShift && <span className="mr-0.5 text-[11px] font-normal text-zinc-400">{prevVal}→</span>}
                            {g.val}%
                          </span>
                        </div>
                        <div className="grid grid-cols-10 gap-0.5">
                          {Array.from({ length: 10 }, (_, idx) => (
                            <span
                              key={idx}
                              className={`h-1.5 transition-colors duration-200 ${
                                g.val >= (idx + 1) * 10
                                  ? hasShift && prevVal < (idx + 1) * 10
                                    ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]'
                                    : g.fillCls
                                  : hasShift && prevVal >= (idx + 1) * 10
                                    ? 'bg-red-500/50 ring-1 ring-red-400/60'
                                    : 'bg-white/10'
                              }`}
                            />
                          ))}
                        </div>
                        {hasShift && (
                          <span
                            key={g.key}
                            className={`animate-float-delta pointer-events-none absolute -top-3.5 right-0 font-mono text-[11px] font-bold ${g.deltaCls}`}
                          >
                            {(g.delta ?? 0) > 0 ? `+${g.delta}` : g.delta}%
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Journal Psychologique interactif (historique des paliers) */}
                {psychoAudit.length > 1 && (
                  <div className="border-t border-white/10 pt-1 font-mono text-[11px] max-sm:hidden sm:text-[11px]">
                    <button
                      type="button"
                      onClick={() => setShowPsychoAudit((prev) => !prev)}
                      className="flex items-center justify-between w-full text-zinc-400 hover:text-amber-300 transition-colors uppercase tracking-wider py-0.5"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="sm:hidden">{tt('Historique', 'History', 'Historial')} ({psychoAudit.length - 1})</span>
                        <span className="hidden sm:inline">{tt('Historique des jauges', 'Gauge history', 'Historial de medidores')} ({psychoAudit.length - 1} {tt('actions', 'shifts', 'acciones')})</span>
                      </span>
                      <span className="text-zinc-500">{showPsychoAudit ? '▲' : '▼'}</span>
                    </button>

                    {showPsychoAudit && (
                      <div className="mt-1 max-h-28 sm:max-h-36 overflow-y-auto space-y-1 rounded bg-black/90 p-2 border border-white/10 text-[11px] no-scrollbar">
                        {psychoAudit.slice(1).reverse().map((entry) => (
                          <div
                            key={entry.id}
                            className="flex flex-col gap-0.5 border-b border-white/5 pb-1 last:border-b-0"
                          >
                            <div className="flex items-center justify-between text-zinc-300">
                              <span className="font-semibold text-amber-200/90 truncate max-w-[180px]">
                                #{entry.turn} · {hitLoc(entry.action)}
                              </span>
                              {entry.priceDelta !== 0 && (
                                <span className={entry.priceDelta < 0 ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                                  {entry.priceDelta < 0 ? `${entry.priceDelta} $` : `+${entry.priceDelta} $`}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-zinc-400">
                              {entry.peurDelta !== 0 && (
                                <span className="text-amber-300">
                                  {t.fear} {entry.peur - entry.peurDelta}% → {entry.peur}% ({entry.peurDelta > 0 ? `+${entry.peurDelta}` : entry.peurDelta}%)
                                </span>
                              )}
                              {entry.colereDelta !== 0 && (
                                <span className="text-red-400">
                                  {t.anger} {entry.colere - entry.colereDelta}% → {entry.colere}% ({entry.colereDelta > 0 ? `+${entry.colereDelta}` : entry.colereDelta}%)
                                </span>
                              )}
                              {entry.mefianceDelta !== 0 && (
                                <span className="text-sky-300">
                                  {t.suspicion} {entry.mefiance - entry.mefianceDelta}% → {entry.mefiance}% ({entry.mefianceDelta > 0 ? `+${entry.mefianceDelta}` : entry.mefianceDelta}%)
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

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
                        <span className="text-zinc-500 text-[11px]">+{inventory.length - 3}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] italic text-zinc-600">{t.emptyShelf}</span>
                  )}
                </div>

                {/* Pistes actives (si présentes) */}
                {arcNotes.filter((n) => !n.resolved).length > 0 && (
                  <div className="space-y-1 border-l-2 border-purple-500/80 bg-purple-950/35 px-2.5 py-1.5 font-mono text-[11px] rounded-r shadow-sm">
                    <div className="text-purple-300 font-semibold uppercase tracking-wider flex items-center justify-between gap-1">
                      <span className="flex items-center gap-1.5">
                        <span>🔍</span>
                        <span>{gameLocale === 'en' ? 'Story Leads' : gameLocale === 'es' ? 'Pistas de Trama' : 'Pistes en cours'}</span>
                        <span className="text-purple-400 font-normal">({arcNotes.filter((n) => !n.resolved).length})</span>
                      </span>
                      <span className="text-[11px] text-zinc-400 font-sans normal-case tracking-normal">
                        {tt("Carnet", 'Notebook', 'Cuaderno')}
                      </span>
                    </div>
                    {arcNotes.filter((n) => !n.resolved).slice(0, 2).map((n) => {
                      const inVault = inventory.some((i) => i.arcItemKey === n.itemKey);
                      return (
                        <div key={n.arcId} className="flex items-center justify-between gap-2 text-zinc-300 text-[11px]">
                          <span className="truncate">
                            <span className="text-amber-200 font-medium">{localizeArcTitle(n.arcId, n.title, gameLocale)}:</span> {localizeArcNote(n.arcId, n.note, gameLocale)}
                          </span>
                          <span className={`shrink-0 px-1.5 py-0.2 rounded text-[11px] font-mono border ${
                            inVault
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                          }`}>
                            {inVault
                              ? tt('Au coffre ✓', 'In vault ✓', 'En caja ✓')
                              : tt('Pièce manquante ✗', 'Missing item ✗', 'Falta pieza ✗')}
                          </span>
                        </div>
                      );
                    })}
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
                      className="flex items-center gap-1 border border-white/15 bg-black/80 px-2.5 py-1 font-mono text-[11px] text-zinc-300 hover:border-amber-400/50 hover:text-white"
                    >
                      <RotateCcw className="h-3 w-3" /> {rerollsLeft}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowClientSheet(true)}
                    title={tt('Fiche du client : tempérament, faille, historique des jauges', 'Client profile: temperament, weak spot, gauge history', 'Ficha del cliente: temperamento, punto débil, historial de medidores')}
                    className="border border-white/15 bg-black/80 px-2 py-1 font-mono text-[11px] text-zinc-300 hover:border-amber-400/50 hover:text-white"
                  >
                    {tt('Fiche', 'Profile', 'Ficha')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowHelp(true)}
                    title={gameLocale === 'en' ? 'How to play' : 'Comment jouer'}
                    className="border border-white/15 bg-black/80 px-2 py-1 font-mono text-[11px] text-zinc-400 hover:text-amber-300"
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
                  <div className={`border border-amber-500/30 bg-[#12100b]/95 p-2 font-mono text-[11px] sm:text-[11px] sm:p-2.5 shadow-2xl backdrop-blur-md lg:w-full lg:max-h-none max-lg:absolute max-lg:right-2 max-lg:top-full max-lg:z-40 max-lg:mt-1 ${
                    mobileNotebookOpen ? 'max-lg:left-2 max-h-[40vh] overflow-y-auto thin-scroll' : 'max-lg:w-auto max-lg:py-1 max-sm:hidden'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setMobileNotebookOpen((v) => !v)}
                      className="flex items-center justify-between w-full border-b border-amber-500/20 pb-1 text-[11px] uppercase tracking-widest text-amber-400/80 cursor-pointer lg:cursor-default"
                    >
                      <span className="flex items-center gap-1.5 font-bold">
                        <span className="max-lg:hidden">{t.counterNotebook}</span>
                        <span className="lg:hidden">{tt('Carnet', 'Notes', 'Notas')}</span>
                        <span className="text-zinc-500 font-normal lg:hidden">
                          ({[
                            currentCase.arcId ? 1 : 0,
                            inspected ? 1 : 0,
                            uvScanned ? 1 : 0,
                            radioOpen ? 1 : 0,
                            history.length >= FLAW_REVEAL_TURNS ? 1 : 0,
                            cityAssets.includes('lookout') && currentCase.isTrap ? 1 : 0,
                          ].reduce((a, b) => a + b, 0)})
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="max-lg:hidden">{t.confidential}</span>
                        <span className="text-amber-400 font-bold lg:hidden text-xs">
                          {mobileNotebookOpen ? '▲' : '▼'}
                        </span>
                      </span>
                    </button>

                    <div className={`${mobileNotebookOpen ? 'block' : 'hidden lg:block'} space-y-1.5 pt-1.5`}>
                    {cityAssets.includes('lookout') && currentCase.isTrap && outcome === 'active' && (
                      <p className="font-bold text-red-400">
                        {t.lookoutAlert}
                      </p>
                    )}

                    {currentCase.arcId && (
                      <div className="space-y-1 border-l-2 border-amber-400 bg-amber-500/10 py-1 pl-2">
                        <p className="text-[11px] font-bold uppercase text-amber-300">
                          {t.arcTrack(currentCase.arcStep || 1, currentCase.arcTitle || '')}
                        </p>
                        {currentCase.arcStep === 2 && outcome === 'active' && (
                          inventory.some((i) => i.arcItemKey === currentCase.requiresItemKey) ? (
                            <button
                              type="button"
                              onClick={resolveArcStep2}
                              className="w-full border border-emerald-400/60 bg-emerald-500/25 px-2 py-1 text-[11px] font-bold text-emerald-200 hover:bg-emerald-500/40"
                            >
                              {t.arcDeliver(formatMoney(currentCase.arcRewardCash || 0, gameLocale))}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={abandonArcStep2}
                              className="text-[11px] text-red-300 underline"
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
                      const profile = findProfileForArchetype(castChar?.profileId ?? currentCase.archetype);
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
                        <div className="space-y-0.5 text-[11px] text-zinc-300">
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
                            className="shrink-0 border border-amber-400/50 bg-amber-500/20 px-1.5 py-0.5 text-[11px] font-bold uppercase text-amber-300 hover:bg-amber-500/35"
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
                            className="shrink-0 border border-sky-400/50 bg-sky-500/20 px-1.5 py-0.5 text-[11px] font-bold uppercase text-sky-200 hover:bg-sky-500/35"
                          >
                            {t.clueGrill}
                          </button>
                        )}
                      </div>
                    )}

                    {radioOpen && (
                      <div className="flex items-start justify-between gap-2 border-t border-white/10 pt-1 text-[11px] text-red-300">
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
                            className="shrink-0 border border-red-400/50 bg-red-500/20 px-1.5 py-0.5 text-[11px] font-bold uppercase text-red-200 hover:bg-red-500/35"
                          >
                            {t.clueGrill}
                          </button>
                        )}
                      </div>
                    )}
                    </div>
                  </div>
                )}

                {/* Contrat 24h en mode Daily */}
                {tab === 'daily' && (
                  <div className="w-full space-y-1 border border-amber-500/40 bg-black/85 p-2 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-amber-300">
                      <span className="font-bold">{t.dailyContractHeader}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400"><DailyClock /></span>
                        <button
                          type="button"
                          onClick={() => setShowDailyScores((v) => !v)}
                          className="lg:hidden border border-amber-400/40 bg-amber-500/10 px-1.5 py-0.5 text-[11px] uppercase tracking-wider text-amber-200 hover:bg-amber-500/20 active:scale-95 transition-transform"
                        >
                          {showDailyScores ? tt('Masquer ▲', 'Hide ▲', 'Ocultar ▲') : tt('Scores ▼', 'Scores ▼', 'Resultados ▼')}
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
                        className="w-full border border-white/15 bg-white/5 px-2 py-0.5 text-left text-[11px] text-zinc-300 hover:border-amber-400/50 hover:text-amber-200"
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
                          className={`border px-1.5 py-0.5 text-[11px] uppercase tracking-wider ${
                            lbBoard === b ? 'border-amber-400/60 text-amber-300' : 'border-white/10 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {LB_COPY[gameLocale].boards[b]}
                        </button>
                      ))}
                    </div>
                    {league && league.standings.length > 0 && (() => {
                      const tierName: Record<string, string> = { master: tt('Maître', 'Master', 'Maestro'), gold: tt('Or', 'Gold', 'Oro'), silver: tt('Argent', 'Silver', 'Plata'), bronze: tt('Bronze', 'Bronze', 'Bronce') };
                      const left = Math.max(0, new Date(league.endsAt).getTime() - Date.now());
                      const dLeft = Math.floor(left / 86_400_000);
                      const hLeft = Math.floor((left % 86_400_000) / 3_600_000);
                      return (
                        <div className="space-y-0.5 border-t border-white/10 pt-1">
                          <p className="flex justify-between text-[11px] uppercase tracking-wider text-violet-300">
                            <span>{tt('Ligue de la semaine', 'Weekly league', 'Liga semanal')}</span>
                            <span className="text-zinc-500">{tt('fin dans', 'ends in', 'termina en')} {dLeft}{tt('j', 'd', 'd')} {hLeft}h</span>
                          </p>
                          {league.standings.slice(0, 5).map((e) => (
                            <div key={e.pseudo} className="flex justify-between gap-2 text-zinc-400">
                              <span className="truncate">#{e.rank} {e.pseudo}</span>
                              <span className="shrink-0 text-zinc-300">{mny(e.total)} · <span className="text-violet-300">{tierName[e.tier]}</span></span>
                            </div>
                          ))}
                          <p className="text-[11px] leading-snug text-zinc-500">{tt('Les paliers (Maître, Or, Argent, Bronze) se jouent sur les marges de tes contrats quotidiens de la semaine.', 'Tiers (Master, Gold, Silver, Bronze) are decided by your weekly daily-contract margins.', 'Los rangos (Maestro, Oro, Plata, Bronce) se deciden por los márgenes de tus contratos diarios de la semana.')}</p>
                        </div>
                      );
                    })()}
                    {highlight && (
                      <p className="border-l border-amber-400/60 pl-2 text-[11px] italic leading-snug text-zinc-300">
                        <span className="block text-[11px] not-italic uppercase tracking-wider text-amber-300">
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
                            <span className="ml-1.5 border border-amber-400/40 px-1 text-[11px] uppercase text-amber-300">
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
                          className="w-full text-left text-[11px] uppercase tracking-wider text-zinc-400 hover:text-amber-300"
                        >
                          {showArchive7d ? t.dailyHide7d : t.dailyShow7d}
                        </button>
                        {showArchive7d && (
                          <div className="mt-1 space-y-0.5 text-[11px]">
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

            {/* Guide de première négociation */}
            {showBrief && tab === 'counter' && day === 1 && clientsServedToday === 0 && !currentCase.special && (
              <div className="first-deal-guide z-30 mx-auto flex w-[min(92vw,500px)] items-center justify-between gap-3 border border-amber-400/60 bg-black/90 px-4 py-2 backdrop-blur-md">
                <p className="font-mono text-sm leading-snug text-zinc-200">
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
              <div className={`pointer-events-none relative mx-auto h-[20vh] min-h-[118px] max-h-[210px] max-lg:hidden w-full max-w-[420px] flex-1 flex items-center justify-center overflow-hidden lg:h-auto lg:max-h-none lg:min-h-0 lg:max-w-[600px]`}>
                <ClientBust
                  castId={currentCase.portraitOverride ?? currentCase.castId}
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
              {outcome !== 'active' && !currentCase.special && (
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
              <div className="relative z-20 mx-auto flex w-full max-w-5xl flex-row items-center gap-2 px-3 pb-2 max-lg:min-h-0 max-lg:flex-1 max-lg:items-stretch sm:items-end sm:gap-4 sm:px-6">
                <div className="w-16 shrink-0 max-sm:hidden sm:w-auto lg:hidden">{itemProp}</div>

                {/* Sous-titre cinématique unique + toggle Historique */}
                <div className="min-w-0 flex-1 max-lg:flex max-lg:min-h-0 max-lg:flex-col max-lg:justify-end">
                {(() => {
                  const lastPlayerTurn = [...history].reverse().find((t) => t.role === 'player');
                  const lastNpcTurn = [...history].reverse().find((t) => t.role === 'npc');
                  return (
                    <div className="space-y-1.5 max-lg:flex max-lg:min-h-0 max-lg:flex-col bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 py-2.5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] lg:rounded-sm lg:border lg:border-white/10 lg:bg-black/70 lg:bg-none lg:backdrop-blur-sm">
                      {/* Mobile : fil de discussion (3 derniers messages), le visage reste visible au-dessus */}
                      <div ref={threadRef} role="log" aria-label={tt('Négociation', 'Negotiation', 'Negociación')}
                        onScroll={(e) => {
                          const el = e.currentTarget;
                          followThread.current = el.scrollHeight - el.clientHeight - el.scrollTop < 24;
                        }} className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain [&>*]:shrink-0 lg:hidden">
                        <div className="mt-auto" />
                        {history.length <= 1 && (
                          <button type="button" onClick={() => setShowClientSheet(true)} aria-label={tt('Fiche du client', 'Client profile', 'Ficha del cliente')} className="mx-auto mb-1 shrink-0">
                            <img
                              src={`${PORTRAIT_DIR}${resolveCastPortrait(currentCase.portraitOverride ?? currentCase.castId, currentCase.gender, currentCase.name, currentCase.displayArchetype ?? currentCase.archetype)}.webp`}
                              alt=""
                              onError={useFallbackPortrait}
                              onLoad={() => { const el = threadRef.current; if (el && followThread.current) el.scrollTop = el.scrollHeight; }}
                              className="h-[10vh] max-h-20 sm:h-[15vh] sm:max-h-28 w-auto rounded-xl border border-amber-500/30 object-cover shadow-2xl"
                            />
                          </button>
                        )}
                        {history.map((turn, i) => {
                          return turn.role === 'player' ? (
                            <p key={`${currentCase.id}-${i}`} className="ml-auto max-w-[85%] rounded-lg rounded-br-sm bg-amber-500/15 px-3 py-2 text-[0.9375rem] leading-snug break-words text-amber-100">
                              {turn.content}
                            </p>
                          ) : (
                            <p key={`${currentCase.id}-${i}`} className="mr-auto max-w-[92%] rounded-lg rounded-bl-sm bg-zinc-900/95 px-3 py-2 text-base leading-normal break-words text-zinc-100">
                              {turn.content}
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
                          <p className="font-mono text-xs leading-relaxed italic text-zinc-300">* {tell}</p>
                        )}
                      </div>
                      <div className="hidden space-y-1.5 lg:block">
                      <div className="flex items-center justify-between gap-2">
                        {lastPlayerTurn ? (
                          <p className="break-words font-mono text-xs text-amber-300">
                            {gameLocale === 'en' ? 'You' : gameLocale === 'es' ? 'Tú' : 'Toi'} : « {lastPlayerTurn.content} »
                          </p>
                        ) : (
                          <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                            {gameLocale === 'en' ? 'Opening' : gameLocale === 'es' ? 'Apertura' : 'Ouverture'}
                          </span>
                        )}
                        {history.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setShowHistory((v) => !v)}
                            className="shrink-0 font-mono text-[11px] uppercase text-zinc-400 hover:text-amber-300"
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
                            text={lastNpcTurn?.content || currentCase.openingLine}
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

                {(error || (cash < askedPrice && outcome === 'active' && !currentCase.isDailyContract && currentCase.arcStep !== 2)) && (
                  <div className="mt-1 border border-amber-500/40 bg-[#16120d]/95 px-2.5 py-1 sm:px-3 sm:py-1.5 font-mono text-[11px] sm:text-xs text-amber-200 shadow-lg">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-amber-400 font-bold shrink-0">⚠️</span>
                        <span className="truncate text-[11px] sm:text-[11px]">
                          {error || (
                            <>
                              <span className="sm:hidden font-semibold">
                                {tt(`Manque de cash : ${mny(cash)} / ${mny(askedPrice)}`, `Cash shortage: ${mny(cash)} / ${mny(askedPrice)}`, `Falta cash: ${mny(cash)} / ${mny(askedPrice)}`)}
                              </span>
                              <span className="hidden sm:inline">
                                {inventory.length === 0 && swissBank < 500 && debt > 0
                                  ? tt(`Tu as ${mny(cash)} pour ${mny(askedPrice)} demandés, et plus aucun recours. Négocie sous ${mny(cash)} ou passe ce client (aucune pénalité).`, `You have ${mny(cash)} for ${mny(askedPrice)} asked, and no way out. Negotiate under ${mny(cash)} or pass on this client (no penalty).`, `Tienes ${mny(cash)} para ${mny(askedPrice)} pedidos y ningún recurso. Negocia por debajo de ${mny(cash)} o pasa de este cliente (sin penalización).`)
                                  : tt(`Tu as ${mny(cash)} pour ${mny(askedPrice)} demandés. Négocie plus bas, ou trouve du cash :`, `You have ${mny(cash)} for ${mny(askedPrice)} asked. Negotiate lower, or raise cash:`, `Tienes ${mny(cash)} para ${mny(askedPrice)} pedidos. Negocia más bajo o consigue efectivo:`)}
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!error && (
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic(10);
                              setCashWarningCollapsed((v) => !v);
                            }}
                            className="border border-amber-400/40 bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-500/25 active:scale-95 transition-all"
                          >
                            {cashWarningCollapsed ? tt('Trouver du cash ▼', 'Raise cash ▼', 'Conseguir cash ▼') : tt('Réduire ▲', 'Collapse ▲', 'Reducir ▲')}
                          </button>
                        )}
                        {error && (
                          <button
                            type="button"
                            onClick={() => setError(null)}
                            className="text-zinc-400 hover:text-white px-1 text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {!error && !cashWarningCollapsed && (
                      <div className="mt-1.5 pt-1.5 border-t border-amber-500/20 flex flex-wrap items-center gap-1.5">
                        {inventory.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              sellItem(inventory[0].id, 'fast');
                              setError(null);
                            }}
                            className="border border-emerald-400/60 bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-200 hover:bg-emerald-500/35 active:scale-95 transition-transform"
                          >
                            {tt(
                              `Vendre ${localizeItemName(inventory[0].name, gameLocale)} (+${formatMoney(Math.round(inventory[0].streetValue * 0.7), gameLocale)} $)`,
                              `Sell ${localizeItemName(inventory[0].name, gameLocale)} (+$${formatMoney(Math.round(inventory[0].streetValue * 0.7), gameLocale)})`,
                              `Vender ${localizeItemName(inventory[0].name, gameLocale)} (+${formatMoney(Math.round(inventory[0].streetValue * 0.7), gameLocale)} $)`
                            )}
                          </button>
                        )}
                        {swissBank >= 500 && (
                          <button
                            type="button"
                            onClick={() => withdrawFromSwiss(500)}
                            className="border border-amber-400/60 bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-200 hover:bg-amber-500/35 active:scale-95 transition-transform"
                          >
                            {tt('Retirer 500 $ (Suisse)', 'Withdraw $500 (Swiss)', 'Retirar 500 $ (Suiza)')}
                          </button>
                        )}
                        {debt === 0 && (
                          <button
                            type="button"
                            onClick={takeSyndicateLoan}
                            className="border border-amber-500/60 bg-amber-950/60 px-2 py-0.5 text-[11px] font-bold text-amber-300 hover:bg-amber-500/30 active:scale-95 transition-transform"
                          >
                            {tt(`Crédit Syndicat (+1 000 $, +${ascMod?.loanHeat ?? 15}% Heat)`, `Syndicate Loan (+$1,000, +${ascMod?.loanHeat ?? 15}% Heat)`, `Crédito Sindicato (+1.000 $, +${ascMod?.loanHeat ?? 15}% Heat)`)}
                          </button>
                        )}
                        {cash < askedPrice && outcome === 'active' && !currentCase.special && (
                          <button
                            type="button"
                            onClick={passClient}
                            className="border border-white/30 bg-black/50 px-2 py-0.5 text-[11px] font-bold text-zinc-200 hover:bg-white/10 active:scale-95 transition-transform"
                          >
                            {tt('Passer ce client', 'Pass on this client', 'Pasar de este cliente')}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* ==================== BAS : COMPTOIR FEUTRE & TIROIR-CAISSE ==================== */}
            <div className="counter-controls felt sticky bottom-0 z-30 border-t-2 border-amber-900/70 shadow-[0_-8px_24px_rgba(0,0,0,0.6)] px-2.5 py-1.5 max-sm:pb-1.5 sm:px-6 sm:py-3 lg:static lg:col-span-3 lg:row-start-2 lg:-mx-6">
              <div className="mx-auto max-w-5xl">
                {outcome !== 'active' && !currentCase.special && !currentCase.isDailyContract && (() => {
                  const castD = currentCase.castId ? CAST_ROSTER.find((c) => c.id === currentCase.castId) : undefined;
                  const points = dealDebrief(psychoAudit, {
                    outcome,
                    initialPrice: currentCase.initialPrice,
                    finalPrice: askedPrice,
                    isTrap: currentCase.isTrap,
                    profileId: castD?.profileId,
                    tags: temperamentOf(currentCase.castId)?.tags ?? [],
                    locale: gameLocale,
                    money: mny,
                    label: hitLoc,
                  });
                  if (!points.length) return null;
                  return (
                    <details className="mb-2 border border-violet-400/30 bg-violet-950/20 text-sm text-zinc-200">
                      <summary className="cursor-pointer px-3 py-3 font-medium text-violet-200">🧠 {tt('Autopsie du deal', 'Deal autopsy', 'Autopsia del trato')} ({points.length})</summary>
                      <ul className="space-y-1.5 px-2 pb-2 leading-snug">
                        {points.map((pt, i) => (
                          <li key={i} className={pt.kind === 'good' ? 'text-emerald-300' : pt.kind === 'warn' ? 'text-amber-300' : 'text-sky-300'}>
                            {pt.kind === 'good' ? '✓ ' : pt.kind === 'warn' ? '⚠ ' : '💡 '}
                            {pt.text}
                          </li>
                        ))}
                      </ul>
                    </details>
                  );
                })()}
                {outcome !== 'active' && (sagaNote || favor) && (
                  <div className="mb-2 space-y-1.5 border border-amber-500/30 bg-amber-500/5 p-2 font-mono text-[11px] leading-snug text-amber-100">
                    {sagaNote && <p>{sagaNote}</p>}
                    {favor && (
                      <>
                        <p>{sagaFavor(gameLocale, favor.name, mny(favor.cost))}</p>
                        <div className="flex gap-2">
                          <button type="button" disabled={cash < favor.cost} onClick={() => resolveFavor(true)} className="brass flex-1 px-2 py-1.5 font-bold uppercase text-[#1a1206] disabled:opacity-40">
                            {tt(`Lui avancer ${mny(favor.cost)}`, `Lend ${mny(favor.cost)}`, `Prestar ${mny(favor.cost)}`)}
                          </button>
                          <button type="button" onClick={() => resolveFavor(false)} className="border border-white/20 bg-black/60 px-3 py-1.5 uppercase text-zinc-300 hover:border-white/40">
                            {tt('Refuser', 'Refuse', 'Rechazar')}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {outcome !== 'active' ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 py-1">
                    <div className="flex items-center gap-2 font-mono text-xs sm:text-sm">
                      {currentCase.special ? (
                        <span className="text-zinc-200">{tell}</span>
                      ) : outcome === 'deal_accepte' ? (
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
                          inventory[inventory.length - 1]?.name === currentCase.item.name && (() => {
                            const lastItem = inventory[inventory.length - 1];
                            const payout = getFastSellPayout(lastItem);
                            const hasBlind = jokerIds.includes('a-l-aveugle');
                            const trend = lastItem.category ? marketTrends[lastItem.category] ?? 1 : 1;
                            const hasTrend = trend > 1;
                            const bonusTags: string[] = [];
                            if (hasBlind) bonusTags.push(tt('Joker ×1,6', 'Joker ×1.6', 'Comodín ×1,6'));
                            if (hasTrend) bonusTags.push(`${tt('Marché', 'Market', 'Mercado')} +${Math.round((trend - 1) * 100)}%`);
                            const tagStr = bonusTags.length > 0 ? ` [${bonusTags.join(' · ')}]` : '';
                            return (
                              <button
                                type="button"
                                onClick={() => sellItem(lastItem.id, 'fast')}
                                className="border border-emerald-400/60 bg-emerald-950/60 px-3 py-2 font-mono text-xs font-semibold uppercase text-emerald-200 hover:bg-emerald-900/80"
                              >
                                {t.quickSellDirect(formatMoney(payout, gameLocale))}{tagStr}
                              </button>
                            );
                          })()}
                        {(outcome === 'sort_son_arme' ||
                          (outcome === 'deal_accepte' &&
                            !currentCase.isTrap &&
                            (100 * (currentCase.initialPrice - askedPrice)) / currentCase.initialPrice >= 20)) && (
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
                          className="brass flex items-center justify-center gap-1.5 px-5 py-2.5 font-[family-name:var(--font-display)] text-lg tracking-widest uppercase text-[#1a1206] max-sm:w-full transition-transform hover:scale-[1.02] active:scale-95"
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
                          <span className="font-mono text-[11px] uppercase tracking-widest text-emerald-400/80">
                            {passOpen ? t.freeAccess : t.passActive30d}
                          </span>
                        ) : (
                          <button
                            data-buy-pass onClick={() => void buyPass()}
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
                ) : currentCase.special ? (() => {
                  const sp = currentCase.special!;
                  if (sp.kind === 'informant') {
                    const opts = [{ cost: 250, drop: 15 }, { cost: 600, drop: 35 }];
                    return (
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-2 gap-2">
                          {opts.map((o) => (
                            <button
                              key={o.cost}
                              type="button"
                              disabled={cash < o.cost}
                              onClick={() => buyTip(o.cost, o.drop)}
                              className="brass px-2 py-2.5 font-mono text-xs font-bold uppercase text-[#1a1206] disabled:opacity-40"
                            >
                              {tt(`Payer ${mny(o.cost)} · Heat −${o.drop} %`, `Pay ${mny(o.cost)} · Heat −${o.drop}%`, `Pagar ${mny(o.cost)} · Heat −${o.drop} %`)}
                            </button>
                          ))}
                        </div>
                        <button type="button" onClick={leaveSpecial} className="w-full border border-white/20 bg-black/60 px-3 py-2 font-mono text-[11px] uppercase text-zinc-300 hover:border-white/40">
                          {tt('Pas besoin de toi', 'No thanks', 'No te necesito')}
                        </button>
                      </div>
                    );
                  }
                  if (sp.kind === 'event') {
                    const bribe = Math.min(2000, Math.max(300, Math.round((cash * 0.05) / 50) * 50));
                    const btn = 'brass px-2 py-2.5 font-mono text-xs font-bold uppercase text-[#1a1206] disabled:opacity-40';
                    const ghost = 'border border-white/20 bg-black/60 px-2 py-2.5 font-mono text-xs uppercase text-zinc-200 hover:border-white/40 disabled:opacity-40';
                    return sp.event === 'checkpoint' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button type="button" disabled={cash < bribe} onClick={() => resolveEvent('a')} className={btn}>{tt(`Graisser la patte ${mny(bribe)} · Heat −20 %`, `Bribe ${mny(bribe)} · Heat −20%`, `Sobornar ${mny(bribe)} · Heat −20 %`)}</button>
                        <button type="button" onClick={() => resolveEvent('b')} className={ghost}>{tt('Profil bas · Heat +10 %, 40 % de perdre une pièce', 'Low profile · Heat +10%, 40% to lose a piece', 'Perfil bajo · Heat +10 %, 40 % de perder una pieza')}</button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button type="button" onClick={() => resolveEvent('a')} className={ghost}>{tt('Payer 15 % de la caisse', 'Pay 15% of the register', 'Pagar el 15 % de la caja')}</button>
                        <button type="button" disabled={!upgrades.armoredDoor} onClick={() => resolveEvent('b')} className={btn}>{upgrades.armoredDoor ? tt('Porte blindée · gratuit', 'Armored door · free', 'Puerta blindada · gratis') : tt('Porte blindée (non installée)', 'Armored door (not installed)', 'Puerta blindada (sin instalar)')}</button>
                        <button type="button" onClick={() => resolveEvent('c')} className={ghost}>{tt('Bluffer · 50 % : rien ou −30 %', 'Bluff · 50%: nothing or −30%', 'Farolear · 50 %: nada o −30 %')}</button>
                      </div>
                    );
                  }
                  const ask = buyerAsk < 0 ? roundTo50(currentCase.streetValue) : buyerAsk;
                  return (
                    <div className="space-y-1.5">
                      <div className="flex items-stretch gap-2">
                        <div className="flex items-center border border-amber-500/40 bg-black/80">
                          <button type="button" onClick={() => setBuyerAsk(Math.max(50, ask - 100))} className="px-2 py-1.5 font-mono text-xs text-zinc-300 hover:bg-white/10">-100</button>
                          <div className="min-w-[88px] px-2 text-center">
                            <input
                              type="number"
                              min={50}
                              step={50}
                              value={ask}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                if (!Number.isNaN(v)) setBuyerAsk(Math.max(0, Math.min(99999, Math.round(v))));
                              }}
                              className="w-20 bg-transparent text-center font-[family-name:var(--font-display)] text-2xl leading-none tracking-wider text-emerald-300 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="block font-mono text-[11px] uppercase text-zinc-400">{tt('Ton prix', 'Your price', 'Tu precio')}</span>
                          </div>
                          <button type="button" onClick={() => setBuyerAsk(Math.min(99999, ask + 100))} className="border-l border-white/10 px-2 py-1.5 font-mono text-xs text-zinc-300 hover:bg-white/10">+100</button>
                        </div>
                        <button
                          type="button"
                          onClick={proposeBuyerPrice}
                          className="brass min-w-0 flex-1 px-3 py-2 font-[family-name:var(--font-display)] text-xl uppercase tracking-widest text-[#1a1206]"
                        >
                          {tt('Proposer', 'Offer', 'Proponer')}
                        </button>
                      </div>
                      <div className="no-scrollbar flex gap-1.5 overflow-x-auto sm:flex-wrap [&>*]:shrink-0 [&>*]:whitespace-nowrap">
                        {BUYER_ARGS.map((a) => {
                          const done = (sp.used ?? []).includes(a.key);
                          return (
                            <button
                              key={a.key}
                              type="button"
                              disabled={done}
                              onClick={() => useBuyerArgument(a.key)}
                              className="border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-left font-mono text-[11px] leading-tight text-amber-200 hover:bg-amber-500/25 disabled:opacity-30"
                            >
                              {gameLocale === 'en' ? a.en : gameLocale === 'es' ? a.es : a.fr}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-2 max-sm:w-full">
                        <button
                          type="button"
                          onClick={acceptBuyerOffer}
                          className="flex-1 border border-emerald-400/60 bg-emerald-950/60 px-2 py-2.5 font-mono text-xs font-semibold uppercase text-emerald-200 hover:bg-emerald-900/80 active:scale-95"
                        >
                          {tt(`Accepter ${mny(sp.offer)}`, `Accept ${mny(sp.offer)}`, `Aceptar ${mny(sp.offer)}`)}
                        </button>
                        <button type="button" onClick={leaveSpecial} className="border border-white/20 bg-black/60 px-4 py-2.5 font-mono text-xs uppercase text-zinc-300 hover:border-white/40 active:scale-95">
                          {t.pass}
                        </button>
                      </div>
                    </div>
                  );
                })() : currentCase.arcStep === 2 ? (() => {
                  const hasArcItem = inventory.some((i) => i.arcItemKey === currentCase.requiresItemKey);
                  return (
                    <div className="flex flex-wrap items-center justify-between gap-3 py-1">
                      <p className="min-w-0 flex-1 text-sm text-zinc-300">
                        {hasArcItem
                          ? tt(`${currentCase.name} veut la pièce que tu gardes et la paie ${mny(currentCase.arcRewardCash || 0)}. Livre-la pour clore la piste.`, `${currentCase.name} wants the piece you kept and pays ${mny(currentCase.arcRewardCash || 0)}. Deliver it to close the case.`, `${currentCase.name} quiere la pieza que guardas y paga ${mny(currentCase.arcRewardCash || 0)}. Entrégala para cerrar el caso.`)
                          : tt('Tu n’as plus la pièce : ce client repart et la piste se referme.', 'You no longer have the piece: this client leaves and the case closes.', 'Ya no tienes la pieza: este cliente se va y el caso se cierra.')}
                      </p>
                      <div className="flex gap-2 max-sm:w-full">
                        {hasArcItem && (
                          <button onClick={resolveArcStep2} className="brass flex-1 px-5 py-2 text-sm font-semibold text-[#1a1206]">
                            {t.arcDeliver(formatMoney(currentCase.arcRewardCash || 0, gameLocale))}
                          </button>
                        )}
                        <button
                          onClick={hasArcItem ? passClient : abandonArcStep2}
                          className="border border-white/20 px-4 py-2 text-sm text-zinc-200 hover:border-white/40 max-sm:flex-1"
                        >
                          {hasArcItem ? t.pass : t.arcClose}
                        </button>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="space-y-1.5 sm:space-y-2.5">
                    {/* Ligne 1 : Outils physiques à gauche + Compteur mécanique de liasses à droite */}
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 sm:gap-3">
                      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 max-sm:hidden max-lg:[@media(max-height:520px)]:hidden">
                        <button
                          onClick={doLoupe}
                          disabled={Boolean(weeklyChallenge.modifier.disableLoupe && !currentCase.isDailyContract)}
                          title={
                            weeklyChallenge.modifier.disableLoupe && !currentCase.isDailyContract
                              ? tt('Loupe fêlée cette semaine', 'Cracked magnifier this week', 'Lupa rota esta semana')
                              : tt('Examiner la pièce à la loupe', 'Examine the piece with the magnifier', 'Examinar la pieza con la lupa')
                          }
                          className={`flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all disabled:opacity-40 ${
                            inspected
                              ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                              : 'border-[#4a3a22] bg-[#16120d] text-[#c9a25f] hover:border-amber-500/60'
                          }`}
                        >
                          <Search className="h-3.5 w-3.5" />
                          <span className="max-sm:hidden">{weeklyChallenge.modifier.disableLoupe && !currentCase.isDailyContract ? t.loupeOff : t.loupe}</span>
                        </button>

                        <button
                          onClick={doUv}
                          disabled={Boolean(nightEvent?.disableUv && !currentCase.isDailyContract)}
                          title={
                            nightEvent?.disableUv && !currentCase.isDailyContract
                              ? tt('Panne secteur : lampe UV HS ce soir', 'Power cut: UV lamp is out tonight', 'Apagón: lámpara UV fuera de servicio esta noche')
                              : tt('Passer la lampe UV', 'Sweep the UV lamp', 'Pasar la lámpara UV')
                          }
                          className={`flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all disabled:opacity-40 ${
                            uvScanned
                              ? 'border-sky-400 bg-sky-500/20 text-sky-200'
                              : 'border-[#2c3a4a] bg-[#0f141c] text-[#7fb4d8] hover:border-sky-400/60'
                          }`}
                        >
                          <Flashlight className="h-3.5 w-3.5" />
                          <span className="max-sm:hidden">{nightEvent?.disableUv && !currentCase.isDailyContract ? t.uvOff : t.uv}</span>
                        </button>

                        <button
                          onClick={doRadio}
                          className={`flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all ${
                            radioOpen
                              ? 'border-red-500 bg-red-950/50 text-red-300'
                              : 'border-[#3a2f24] bg-[#14110e] text-[#b9a07a] hover:border-red-400/50'
                          }`}
                        >
                          <Radio className="h-3.5 w-3.5" />
                          <span className="max-sm:hidden">{t.radio}</span>
                        </button>
                      </div>

                      {/* Compteur mécanique de billets + Boutons */}

                      <div className="max-sm:contents flex flex-wrap items-center gap-2">
                        <div className="flex items-center border border-amber-500/40 bg-black/80 max-sm:order-4">
                          <button
                            type="button"
                            disabled={cash < 100}
                            onClick={() => setOfferAmount((v) => Math.max(100, Math.min(cash, v) - 500))}
                            className="max-sm:hidden px-2 py-1.5 font-mono text-xs text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-40"
                          >
                            -500
                          </button>
                          <button
                            type="button"
                            disabled={cash < 100}
                            onClick={() => setOfferAmount((v) => Math.max(100, Math.min(cash, v) - 100))}
                            className="border-l border-white/10 px-2 py-1.5 max-sm:py-1 max-sm:px-1.5 font-mono text-xs text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-40"
                          >
                            -100
                          </button>
                          <div className="min-w-[88px] sm:min-w-[110px] px-2 sm:px-2.5 py-0.5 text-center">
                            {cash < 100 ? (
                              <span className="block font-[family-name:var(--font-display)] text-xl sm:text-2xl leading-none tracking-wider text-red-400">
                                {gameLocale === 'en' ? `$${formatMoney(cash, gameLocale)}` : `${formatMoney(cash, gameLocale)} $`}
                              </span>
                            ) : (
                              <div className="flex items-baseline justify-center gap-1">
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  aria-label={tt('Ton offre', 'Your offer', 'Tu oferta')}
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
                                  className="w-20 bg-transparent text-center font-[family-name:var(--font-display)] text-xl sm:text-2xl leading-none tracking-wider text-emerald-300 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                                <span className="font-[family-name:var(--font-display)] text-lg sm:text-xl leading-none text-emerald-300/80">
                                  $
                                </span>
                              </div>
                            )}
                            <span className="block font-mono text-[11px] uppercase text-zinc-400">
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
                            className="border-l border-white/10 px-2 py-1.5 max-sm:py-1 max-sm:px-1.5 font-mono text-xs text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-40"
                          >
                            +100
                          </button>
                          <button
                            type="button"
                            disabled={cash < 100}
                            onClick={() =>
                              setOfferAmount((v) => Math.min(cash, currentCase.initialPrice, v + 500))
                            }
                            className="max-sm:hidden border-l border-white/10 px-2 py-1.5 font-mono text-xs text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-40"
                          >
                            +500
                          </button>
                        </div>

                        <button
                          onClick={slapCashOnCounter}
                          disabled={loading || cash < 100}
                          className="brass max-sm:order-5 max-sm:min-w-0 max-sm:flex-1 max-sm:py-1.5 max-[359px]:text-sm max-[359px]:px-2 px-3 sm:px-4 py-1.5 font-[family-name:var(--font-display)] text-lg sm:text-xl tracking-wider uppercase text-[#1a1206] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40"
                        >
                          {cash < 100 ? t.cashEmpty : t.slapCash}
                        </button>

                        <button
                          onClick={passClient}
                          disabled={loading}
                          title={tt('Décliner poliment sans pénalité de Heat', 'Decline politely with no Heat penalty', 'Rechazar con educación sin penalización de Heat')}
                          className="max-lg:[@media(max-height:520px)]:hidden max-sm:hidden border border-white/20 bg-black/60 px-2.5 py-2 font-mono text-[11px] uppercase text-zinc-300 hover:border-white/40 hover:text-white disabled:opacity-40"
                        >
                          {t.pass}
                        </button>

                        {currentCase.bossKind === 'phantom' && !phantomDone && inventory.length > 0 && (
                          <button
                            onClick={phantomBuyout}
                            disabled={loading}
                            title={tt('Revend jusqu’à 4 pièces du coffre à ×1,2 — plafond 15 000 $', 'Resells up to 4 vault pieces at ×1.2 — $15,000 cap', 'Revende hasta 4 piezas de la caja fuerte a ×1,2 — tope de 15 000 $')}
                            className="max-sm:hidden border border-amber-500/60 bg-amber-500/15 px-2.5 py-2 font-mono text-[11px] font-bold uppercase text-amber-200 hover:bg-amber-500/25 disabled:opacity-40"
                          >
                            {t.phantomBuyout(Math.min(PHANTOM_MAX_ITEMS, inventory.length))}
                          </button>
                        )}

                        <button
                          onClick={rejectTrap}
                          disabled={loading}
                          title={tt('Le démasquer : un infiltré décampe, un client réglo s\'en va', 'Expose him: an undercover agent bolts, an honest client walks away', 'Desenmascararlo: un infiltrado huye, un cliente legal se va')}
                          className="max-lg:[@media(max-height:520px)]:hidden max-sm:hidden border border-red-500/70 bg-red-950/70 px-2.5 py-2 font-mono text-[11px] font-bold uppercase text-red-200 hover:bg-red-900 disabled:opacity-40"
                        >
                          {t.expose}
                        </button>
                      </div>
                    </div>

                    {/* Ligne 2 : 3 relances rapides tactiques + Saisie directe au clavier */}
                    <div className="flex flex-col gap-1.5 w-full">
                      {/* Pastilles tactiques défilables à l'horizontale au pouce sur mobile */}
                      <div className="flex sm:hidden w-full items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
                        {quickReplies().map((q) => (
                          <button
                            key={q.key}
                            type="button"
                            disabled={loading}
                            onClick={() => {
                              triggerHaptic(10);
                              q.run();
                            }}
                            className={`shrink-0 rounded-full border px-3 py-1 text-sm font-medium active:scale-95 transition-transform disabled:opacity-40 ${
                              q.tone === 'amber'
                                ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                                : q.tone === 'red'
                                  ? 'border-red-500/30 bg-red-500/10 text-red-300'
                                  : 'border-white/15 bg-black/60 text-zinc-300'
                            }`}
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>

                      <div className="max-lg:[@media(max-height:520px)]:hidden max-sm:hidden grid w-full grid-cols-2 gap-1.5 py-0.5 sm:flex sm:flex-wrap sm:items-center [&>*]:whitespace-normal [&>*]:text-left sm:[&>*]:whitespace-nowrap">
                        {quickReplies().map((q) => (
                          <button
                            key={q.key}
                            type="button"
                            disabled={loading}
                            onClick={q.run}
                            className={`border px-2.5 py-1 font-mono text-[11px] active:scale-95 transition-transform disabled:opacity-40 ${
                              q.tone === 'amber'
                                ? 'border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/25'
                                : q.tone === 'red'
                                  ? 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20'
                                  : 'border-white/15 bg-black/50 text-zinc-300 hover:border-white/35 hover:text-white'
                            }`}
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          sendMessage();
                        }}
                        className="flex w-full items-center gap-2 border border-white/15 bg-black/75 px-3 py-1.5 max-sm:rounded-full max-sm:px-1.5 max-sm:py-1"
                      >
                        <button
                          type="button"
                          onClick={() => setShowActions(true)}
                          aria-label={tt('Actions', 'Actions', 'Acciones')}
                          className="hidden shrink-0 items-center justify-center rounded-full bg-white/10 text-zinc-200 active:scale-95 max-sm:flex max-sm:size-11"
                        >
                          <Ellipsis className="h-5 w-5" />
                        </button>
                        <span className="font-mono text-sm font-bold text-amber-400 max-sm:hidden">&gt;</span>
                        <input
                          type="text"
                          value={input}
                          aria-label={t.inputPlaceholder}
                          enterKeyHint="send"
                          onChange={(e) => setInput(e.target.value)}
                          disabled={loading}
                          placeholder={
                            loading
                              ? `${currentCase.name} ...`
                              : t.inputPlaceholder
                          }
                          className="min-w-0 flex-1 bg-transparent text-base sm:text-sm text-white placeholder:text-zinc-400 focus:outline-none disabled:opacity-60"
                        />
                        {quota && (
                          <button type="button" onClick={() => setShowQuotaInfo((v) => !v)} aria-label={tt(`${quota.remaining} négos IA restantes`, `${quota.remaining} AI haggles left`, `${quota.remaining} regateos IA`)} className={`sm:hidden shrink-0 flex items-center gap-1 px-1 font-mono text-[11px] ${quota.remaining <= 5 ? 'text-amber-300' : 'text-zinc-400'}`}>
                            <MessageSquare className="h-3.5 w-3.5" />{quota.remaining}
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={loading || !input.trim()}
                          aria-label={tt('Envoyer', 'Send', 'Enviar')}
                          className="p-1 text-amber-400 hover:text-amber-300 disabled:opacity-40 max-sm:flex max-sm:size-11 max-sm:items-center max-sm:justify-center max-sm:rounded-full max-sm:bg-amber-400 max-sm:text-zinc-950 max-sm:disabled:bg-white/10 max-sm:disabled:text-zinc-500"
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </button>
                      </form>
                      {quota && (
                        <div className={`mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 px-1 font-mono text-[11px] text-zinc-400 max-sm:justify-center ${quota.remaining > 10 && !showQuotaInfo ? 'max-sm:hidden' : ''}`}>
                          <button type="button" onClick={() => setShowQuotaInfo((v) => !v)} className={`inline-flex items-center gap-1 ${quota.remaining <= 5 ? 'text-amber-300' : ''}`} aria-expanded={showQuotaInfo}>
                            <MessageSquare className="h-3 w-3" />
                            {quota.remaining > 0
                              ? tt(`${quota.remaining} négos IA restantes aujourd’hui`, `${quota.remaining} AI haggles left today`, `${quota.remaining} regateos IA hoy`)
                              : tt('Négos IA épuisées : vendeur simple jusqu’à demain', 'AI haggles used up: basic seller until tomorrow', 'Regateos IA agotados: vendedor simple hasta mañana')}
                            <span className="text-zinc-500">ⓘ</span>
                          </button>
                          {quota.tier === 'free' && quota.remaining <= 10 && (
                            <button type="button" data-buy-pass onClick={buyPass} disabled={passBusy} className="border border-amber-400/50 bg-amber-500/15 px-1.5 py-0.5 font-bold uppercase tracking-wider text-amber-300 active:scale-95">
                              {tt('Passer au Pass', 'Get the Pass', 'Obtener el Pase')}
                            </button>
                          )}
                          {showQuotaInfo && (
                            <p className="basis-full text-zinc-300">
                              {tt(
                                '1 négo = 1 réplique que tu envoies au vendeur (message, offre, bluff, pression, loupe ou lumière UV). Les boutons d’inspection sans réplique sont gratuits. Le compteur repart à zéro chaque jour.',
                                '1 haggle = 1 line you send to the seller (message, offer, bluff, pressure, magnifier or UV light). Inspecting without sending a line is free. The counter resets every day.',
                                '1 regateo = 1 réplica que envías al vendedor (mensaje, oferta, farol, presión, lupa o luz UV). Inspeccionar sin enviar réplica es gratis. El contador se reinicia cada día.',
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {debugMode && (
                  <p className="mt-1 font-mono text-[11px] text-amber-500/50">
                    plancher dynamique {dynamicFloor} $ · objet {currentCase.item.name} · rue{' '}
                    {currentCase.streetValue} $
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Menu d'actions mobile (feuille du bas façon iOS) : tout ce qui n'est pas « parler » ou « payer » */}
      {showActions && (
        <GameDialog label={tt('Actions', 'Actions', 'Acciones')} onDismiss={() => setShowActions(false)}>
        <div className="fixed inset-0 z-50" onClick={() => setShowActions(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-[#14151b] px-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-white/25" />
            <button type="button" onClick={() => setShowActions(false)} className="float-right px-3 text-sm text-zinc-300">
              {tt('Fermer', 'Close', 'Cerrar')}
            </button>
            {(() => {
              const close = (fn: () => void) => () => {
                setShowActions(false);
                fn();
              };
              const replies = quickReplies();
              return (
                <>
                  <p className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{tt('Répliques rapides', 'Quick replies', 'Respuestas rápidas')}</p>
                  <div className="grid grid-cols-2 gap-2 px-2">
                    {replies.map((q) => (
                      <button
                        key={q.key}
                        type="button"
                        disabled={loading}
                        onClick={close(q.run)}
                        className={`rounded-2xl px-3 py-3 text-left text-[14px] leading-tight active:scale-[0.98] disabled:opacity-40 ${
                          q.tone === 'amber' ? 'bg-amber-500/15 text-amber-200' : q.tone === 'red' ? 'bg-red-500/15 text-red-300' : 'bg-white/10 text-zinc-100'
                        }`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                  <p className="px-3 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{tt('Examiner', 'Inspect', 'Examinar')}</p>
                  <div className="grid grid-cols-4 gap-2 px-2">
                    {[
                      { key: 'loupe', icon: <Search className="h-5 w-5" />, label: loupeOff ? t.loupeOff : t.loupe, on: inspected, off: loupeOff, cls: 'text-amber-300', run: doLoupe },
                      { key: 'uv', icon: <Flashlight className="h-5 w-5" />, label: uvOff ? t.uvOff : t.uv, on: uvScanned, off: uvOff, cls: 'text-sky-300', run: doUv },
                      { key: 'radio', icon: <Radio className="h-5 w-5" />, label: t.radio, on: radioOpen, off: false, cls: 'text-red-300', run: doRadio },
                      { key: 'notes', icon: <BookOpen className="h-5 w-5" />, label: tt('Carnet', 'Notes', 'Notas'), on: false, off: false, cls: 'text-amber-100', run: () => setMobileNotebookOpen(true) },
                    ].map((x) => (
                      <button
                        key={x.key}
                        type="button"
                        disabled={x.off}
                        onClick={close(x.run)}
                        className={`flex flex-col items-center gap-1 rounded-2xl py-3 text-[12px] active:scale-[0.97] disabled:opacity-40 ${x.on ? 'bg-white/20' : 'bg-white/10'} ${x.cls}`}
                      >
                        {x.icon}
                        <span className="max-w-full truncate px-1 text-zinc-100">{x.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{tt('Ce client', 'This client', 'Este cliente')}</p>
                  <ActionRow icon={<UserX className="h-4 w-4" />} label={t.pass} hint={tt('Décliner poliment, sans pénalité de Heat', 'Decline politely, no Heat penalty', 'Rechazar con educación, sin penalización de Heat')} disabled={loading} onClick={close(passClient)} />
                  <ActionRow icon={<Skull className="h-4 w-4" />} tone="danger" label={t.expose} hint={tt('Le démasquer : un infiltré décampe, un client réglo s’en va', 'Expose him: an agent bolts, an honest client walks', 'Desenmascararlo: un infiltrado huye, un cliente honesto se va')} disabled={loading} onClick={close(rejectTrap)} />
                  {currentCase.bossKind === 'phantom' && !phantomDone && inventory.length > 0 && (
                    <ActionRow icon={<Package className="h-4 w-4" />} label={t.phantomBuyout(Math.min(PHANTOM_MAX_ITEMS, inventory.length))} disabled={loading} onClick={close(phantomBuyout)} />
                  )}
                  <ActionRow icon={<Shuffle className="h-4 w-4" />} label={tt('Client suivant', 'Next client', 'Siguiente cliente')} hint={`${rerollsLeft} ${tt('restants', 'left', 'restantes')}`} disabled={rerollsLeft <= 0 || tab !== 'counter'} onClick={close(rerollClient)} />
                  <ActionRow icon={<User className="h-4 w-4" />} label={tt('Fiche du client', 'Client profile', 'Ficha del cliente')} hint={tt('Tempérament, historique des jauges', 'Temperament, gauge history', 'Temperamento, historial de medidores')} onClick={close(() => setShowClientSheet(true))} />
                  <ActionRow icon={<CircleHelp className="h-4 w-4" />} label={tt('Comment jouer', 'How to play', 'Cómo jugar')} onClick={close(() => setShowHelp(true))} />
                </>
              );
            })()}
          </div>
        </div>
        </GameDialog>
      )}

      {/* Aide : règles, jauges et atouts actifs */}
      {showHelp && (
        <GameDialog label={tt('Comment jouer', 'How to play', 'Cómo jugar')} onDismiss={() => setShowHelp(false)}>
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={() => setShowHelp(false)}>
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <div
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-[#0c0d12] px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 font-mono shadow-2xl sm:rounded-xl sm:pt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20 sm:hidden" />
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-300">{tt('Comment jouer', 'How to play', 'Cómo jugar')}</h3>
              <button type="button" aria-label={tt('Fermer', 'Close', 'Cerrar')} onClick={() => setShowHelp(false)} className="min-w-11 p-1 text-zinc-300 hover:text-zinc-200">✕</button>
            </div>
            <ol className="space-y-1.5 text-sm leading-relaxed text-zinc-300">
              <li><span className="text-amber-400">1.</span> {tt('Négocie avec tes mots (ou les boutons) : achète sous la valeur de rue.', 'Negotiate in your own words (or with the buttons): buy under street value.', 'Negocia con tus palabras (o con los botones): compra por debajo del valor de calle.')}</li>
              <li><span className="text-amber-400">2.</span> {tt('Loupe, UV et Radio révèlent la pièce et le piège. Un infiltré démasqué rapporte une prime.', 'Magnifier, UV and Radio reveal the piece and the trap. Exposing an undercover agent pays a bounty.', 'Lupa, UV y Radio revelan la pieza y la trampa. Desenmascarar a un infiltrado da una prima.')}</li>
              <li><span className="text-amber-400">3.</span> {tt('Au Coffre : nettoie, revends, paie le loyer du soir (affiché en haut).', 'In the Vault: clean, resell, pay tonight’s rent (shown at the top).', 'En la Caja: limpia, revende, paga el alquiler de esta noche (arriba).')}</li>
            </ol>
            {ascMod && (
              <p className="mt-4 border border-amber-500/40 bg-amber-950/40 px-2 py-1.5 text-xs leading-snug text-amber-200"><span className="font-bold">{tt('Ascension', 'Ascension', 'Ascensión')} {ROMAN[ascMod.level - 1]} · {ascMod.title[gameLocale]}</span> — {ascMod.desc[gameLocale]}</p>
            )}
            <h4 className="mb-1.5 mt-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">{tt('Les jauges', 'The gauges', 'Los medidores')}</h4>
            <ul className="space-y-1 text-sm leading-relaxed text-zinc-300">
              <li><span className="text-amber-300">{t.fear}</span> — {tt('plus elle monte, plus son prix plancher baisse.', 'the higher it goes, the lower his floor price.', 'cuanto más sube, más baja su precio mínimo.')}</li>
              <li><span className="text-orange-400">{t.anger}</span> — {tt('trop haute, il claque la porte.', 'too high and he walks out.', 'demasiado alta y se va dando un portazo.')}</li>
              <li><span className="text-sky-300">{t.suspicion}</span> — {tt('trop haute, il flaire le piège ou part.', 'too high and he smells a trap or leaves.', 'demasiado alta y huele la trampa o se va.')}</li>
            </ul>
            {activeCombos(jokerIds).length > 0 && (
              <div className="mt-4 space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-violet-300">{tt('Combos actifs', 'Active combos', 'Combos activos')}</h4>
                {activeCombos(jokerIds).map((c) => (
                  <p key={c.id} className="border border-violet-400/40 bg-violet-950/40 px-2 py-1.5 text-xs leading-snug text-violet-100"><span className="font-bold">{c.name[gameLocale]}</span> — {c.desc[gameLocale]}</p>
                ))}
              </div>
            )}
            <h4 className="mb-1.5 mt-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">{tt('Tes atouts', 'Your jokers', 'Tus comodines')} ({jokerIds.length})</h4>
            {jokerIds.length === 0 ? (
              <p className="text-xs leading-relaxed text-zinc-400">{tt('Aucun pour l’instant. Tu en choisis un parmi trois à chaque nuit payée : ils changent tes règles (prix, jauges, revente).', 'None yet. You pick one of three after each paid night: they change your rules (price, gauges, resale).', 'Ninguno por ahora. Eliges uno de tres tras cada noche pagada: cambian tus reglas (precio, medidores, reventa).')}</p>
            ) : (
              <ul className="space-y-2">
                {jokerIds.map((jid) => {
                  const jk = JOKER_POOL.find((j) => j.id === jid);
                  const locJk = t.jokers[jid] ?? jk;
                  return (
                    <li key={jid} className="flex items-start gap-2.5 rounded border border-amber-500/20 bg-amber-500/5 p-2">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded border border-amber-500/30 text-amber-300"><JokerIcon id={jid} className="h-4 w-4" /></span>
                      <span className="min-w-0 text-xs">
                        <span className="block font-bold text-amber-200">{locJk?.name ?? jid}</span>
                        <span className="block leading-snug text-zinc-300">{locJk?.desc ?? ''}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        </GameDialog>
      )}

      {/* Fiche du client (mobile) : avatar, profil, tempérament, historique des jauges */}
      {showClientSheet && (() => {
        const castChar = currentCase.castId ? CAST_ROSTER.find((c) => c.id === currentCase.castId) : undefined;
        const temp = temperamentOf(currentCase.castId);
        const playerTurns = history.filter((h) => h.role === 'player').length;
        return (
          <GameDialog label={tt('Fiche du client', 'Client profile', 'Ficha del cliente')} onDismiss={() => setShowClientSheet(false)}>
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center" onClick={() => setShowClientSheet(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-[#0c0d12] px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 font-mono shadow-2xl lg:relative lg:inset-x-auto lg:bottom-auto lg:w-full lg:max-w-md lg:rounded-xl lg:border lg:pt-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
              <div className="flex items-start gap-3">
                <img
                  src={`${PORTRAIT_DIR}${resolveCastPortrait(currentCase.portraitOverride ?? currentCase.castId, currentCase.gender, currentCase.name, currentCase.displayArchetype ?? currentCase.archetype)}.webp`}
                  alt=""
                  onError={useFallbackPortrait}
                  className="h-28 w-24 shrink-0 rounded-lg border border-amber-500/40 object-cover object-[50%_18%]"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-[family-name:var(--font-display)] text-xl uppercase tracking-wider text-zinc-100">{currentCase.name}</h3>
                  <p className="mt-0.5 text-[11px] uppercase text-zinc-400">
                    {currentCase.age} {tt('ans', 'y.o.', 'años')} · {localizeArchetype(currentCase.displayArchetype ?? currentCase.archetype, gameLocale)}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500">{localizeFaction(currentCase.faction, gameLocale)}</p>
                  {tell && <p className="mt-2 text-[11px] italic leading-snug text-zinc-300">* {tell}</p>}
                </div>
                <button type="button" aria-label={tt('Fermer', 'Close', 'Cerrar')} onClick={() => setShowClientSheet(false)} className="min-w-11 p-1 text-zinc-300">✕</button>
              </div>
              <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3 text-xs">
                <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{tt('Profil', 'Profile', 'Perfil')}</div>
                {temp && playerTurns >= 3 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {temp.tags.length === 0 && <span className="text-zinc-400">{tt('Tempérament sans relief.', 'No strong temperament.', 'Temperamento sin relieve.')}</span>}
                    {temp.tags.map((k) => (
                      <span key={k} className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-200">{TEMPER_LABEL[k]}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500">{tt('Parle-lui encore un peu : son tempérament se devine à ses réactions (3 échanges).', 'Keep talking: his temperament shows in his reactions (3 exchanges).', 'Sigue hablando: su temperamento se ve en sus reacciones (3 intercambios).')}</p>
                )}
                {currentCase.castId && sagas[currentCase.castId] && (
                  <>
                    <p><span className="text-violet-300">{tt('Votre histoire', 'Your story', 'Vuestra historia')}</span> {sagaLabel(sagas[currentCase.castId])}</p>
                    {castChar && sagaFacts(sagas[currentCase.castId].met, localizeSecret(castChar.secret, gameLocale), localizeCastText(castChar.weaknessHint, gameLocale), localizeCastText(castChar.redLineHint, gameLocale)).map((f, i) => (
                      <p key={i} className="text-zinc-300"><span className="text-violet-300">{i === 0 ? tt('Son secret', 'Their secret', 'Su secreto') : i === 1 ? tt('Sa faille', 'Weak spot', 'Su punto débil') : tt('Sa ligne rouge', 'Red line', 'Su línea roja')}</span> {f}</p>
                    ))}
                  </>
                )}
                {castChar && history.length >= FLAW_REVEAL_TURNS ? (
                  <>
                    <p><span className="text-amber-400">{t.flawLabel}</span> {localizeCastText(castChar.weaknessHint, gameLocale)}</p>
                    <p><span className="text-red-400">{t.redLineLabel}</span> {localizeCastText(castChar.redLineHint, gameLocale)}</p>
                  </>
                ) : (
                  <p className="text-zinc-500">{tt(`Faille et ligne rouge : dossier ouvert après ${FLAW_REVEAL_TURNS} échanges.`, `Weak spot and red line: file opens after ${FLAW_REVEAL_TURNS} exchanges.`, `Punto débil y línea roja: el expediente se abre tras ${FLAW_REVEAL_TURNS} intercambios.`)}</p>
                )}
              </div>
              {psychoAudit.length > 1 && (
                <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-[11px]">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{tt('Historique des jauges', 'Gauge history', 'Historial de medidores')}</div>
                  {psychoAudit.slice(1).reverse().map((entry) => (
                    <div key={entry.id} className="border-b border-white/5 pb-1 text-zinc-300">
                      <div className="flex justify-between gap-2">
                        <span className="min-w-0 truncate font-semibold text-amber-200/90">#{entry.turn} · {hitLoc(entry.action)}</span>
                        {entry.priceDelta !== 0 && <span className={entry.priceDelta < 0 ? 'font-bold text-emerald-400' : 'text-red-400'}>{entry.priceDelta < 0 ? '' : '+'}{mny(entry.priceDelta)}</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-3 text-[11px] text-zinc-400">
                        {entry.peurDelta !== 0 && <span className="text-amber-300">{t.fear} {entry.peur - entry.peurDelta}→{entry.peur}%</span>}
                        {entry.colereDelta !== 0 && <span className="text-red-400">{t.anger} {entry.colere - entry.colereDelta}→{entry.colere}%</span>}
                        {entry.mefianceDelta !== 0 && <span className="text-sky-300">{t.suspicion} {entry.mefiance - entry.mefianceDelta}→{entry.mefiance}%</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </GameDialog>
        );
      })()}

      {/* Fiche objet : feuille du bas façon iOS / Android (mobile) */}
      {showItemSheet && (
        <GameDialog label={tt('Fiche de l’objet', 'Item details', 'Ficha del objeto')} onDismiss={() => setShowItemSheet(false)}>
        <div className="fixed inset-0 z-50" onClick={() => setShowItemSheet(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="absolute inset-x-0 bottom-0 max-h-[78vh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-[#0c0d12] px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 font-mono shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
            <div className="flex items-start gap-3">
              <img src={`/assets/items/${itemKindFor(localizeItemName(currentCase.item.name, gameLocale))}.webp`} alt="" className="h-20 w-24 shrink-0 object-contain mix-blend-lighten" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold uppercase leading-tight tracking-wider text-amber-300">{localizeItemName(currentCase.item.name, gameLocale)}</h3>
                <p className="mt-1 text-[11px] text-zinc-400">{currentCase.item.category} · {localizeFaction(currentCase.faction, gameLocale)}</p>
                <p className="mt-1 text-sm font-semibold text-emerald-300">{tt('Valeur de rue', 'Street value', 'Valor de calle')} ~{mny(currentCase.streetValue)}</p>
              </div>
              <button type="button" aria-label={tt('Fermer', 'Close', 'Cerrar')} onClick={() => setShowItemSheet(false)} className="min-w-11 p-1 text-zinc-300">✕</button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">{localizeItemText(currentCase.item.surfaceDesc, gameLocale)}</p>
            {outcome === 'active' && !currentCase.special && (
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(15);
                    doLoupe();
                  }}
                  disabled={Boolean(weeklyChallenge.modifier.disableLoupe && !currentCase.isDailyContract)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold transition-all active:scale-95 ${
                    inspected
                      ? 'border border-amber-400 bg-amber-500/25 text-amber-200'
                      : 'border border-[#4a3a22] bg-[#16120d] text-[#c9a25f] hover:border-amber-400'
                  }`}
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>{inspected ? tt('Examiné ✓', 'Inspected ✓', 'Examinado ✓') : t.loupe}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(15);
                    doUv();
                  }}
                  disabled={Boolean(nightEvent?.disableUv && !currentCase.isDailyContract)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold transition-all active:scale-95 ${
                    uvScanned
                      ? 'border border-sky-400 bg-sky-500/25 text-sky-200'
                      : 'border border-[#2c3a4a] bg-[#0f141c] text-[#7fb4d8] hover:border-sky-400'
                  }`}
                >
                  <Flashlight className="h-3.5 w-3.5" />
                  <span>{uvScanned ? tt('Scanné ✓', 'Scanned ✓', 'Escaneado ✓') : t.uv}</span>
                </button>
              </div>
            )}

            <div className="mt-3 space-y-2 border-t border-white/10 pt-3 text-xs">
              <div className={`p-2.5 rounded-lg border ${inspected ? 'border-amber-500/40 bg-amber-950/20 text-amber-200' : 'border-white/5 bg-black/40 text-zinc-500'}`}>
                <div className="font-bold uppercase text-amber-400 text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1"><Search className="h-3 w-3" /> {t.loupe}</span>
                  {inspected && <span className="text-[11px] text-amber-300">✓ {tt('Révélé', 'Revealed', 'Revelado')}</span>}
                </div>
                <p className="mt-1 text-sm leading-relaxed">
                  {inspected ? localizeItemText(currentCase.item.hiddenClue, gameLocale) : tt('Pas encore examinée. Touche le bouton Loupe ci-dessus.', 'Not examined yet. Tap the Magnifier button above.', 'Aún sin examinar. Toca el botón Lupa arriba.')}
                </p>
                {inspected && outcome === 'active' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowItemSheet(false);
                      confrontWithClue(false);
                    }}
                    disabled={loading || grilled.loupe}
                    className="mt-2 border border-amber-400/50 bg-amber-500/20 px-2 py-1 text-[11px] font-bold uppercase text-amber-300 hover:bg-amber-500/35"
                  >
                    {t.clueGrill}
                  </button>
                )}
              </div>

              <div className={`p-2.5 rounded-lg border ${uvScanned ? 'border-sky-500/40 bg-sky-950/20 text-sky-200' : 'border-white/5 bg-black/40 text-zinc-500'}`}>
                <div className="font-bold uppercase text-sky-400 text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1"><Flashlight className="h-3 w-3" /> {t.uv}</span>
                  {uvScanned && <span className="text-[11px] text-sky-300">✓ {tt('Scanné', 'Scanned', 'Escaneado')}</span>}
                </div>
                <p className="mt-1 text-sm leading-relaxed">
                  {uvScanned ? localizeItemText(currentCase.item.uvClue, gameLocale) : tt('Pas encore passée à la lampe UV. Touche le bouton UV ci-dessus.', 'Not swept with the UV lamp yet. Tap the UV button above.', 'Aún sin pasar la lámpara UV. Toca el botón UV arriba.')}
                </p>
                {uvScanned && outcome === 'active' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowItemSheet(false);
                      confrontWithClue(true);
                    }}
                    disabled={loading || grilled.uv}
                    className="mt-2 border border-sky-400/50 bg-sky-500/20 px-2 py-1 text-[11px] font-bold uppercase text-sky-200 hover:bg-sky-500/35"
                  >
                    {t.clueGrill}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        </GameDialog>
      )}

      {/* Balatro-style Syndicate Atout Draft Modal */}
      {jokerDraft && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="max-h-[85dvh] overflow-y-auto overscroll-contain max-w-3xl w-full bg-[#111114] border border-amber-500/40 rounded-xl p-6 space-y-5">
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
                    className="text-left bg-zinc-950 hover:bg-[#151518] border border-white/10 hover:border-amber-500/60 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all group shadow-xl hover:shadow-amber-500/10"
                  >
                    <div className="space-y-3">
                      <div className="relative h-28 w-full overflow-hidden rounded-lg bg-black/60 border border-white/10 flex items-center justify-center">
                        <img
                          src={`/assets/jokers/${jk.id}.webp`}
                          alt=""
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute top-2 left-2 h-8 w-8 rounded bg-black/60 border border-amber-500/30 flex items-center justify-center text-amber-300 backdrop-blur-sm">
                          <JokerIcon id={jk.id} className="w-4 h-4" />
                        </div>
                        <span className="absolute top-2 right-2 text-[11px] font-mono bg-black/80 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold uppercase tracking-wider backdrop-blur-sm">
                          {locJk.tag}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors">
                        {locJk.name}
                      </h3>
                      {comboCompletedBy(jk.id, jokerIds) && (
                        <p className="border border-violet-400/50 bg-violet-950/50 px-2 py-1 font-mono text-[11px] leading-snug text-violet-200">
                          ✦ {tt('COMBO', 'COMBO', 'COMBO')} · {comboCompletedBy(jk.id, jokerIds)!.name[gameLocale]} : {comboCompletedBy(jk.id, jokerIds)!.desc[gameLocale]}
                        </p>
                      )}
                      <p className="text-xs text-zinc-400 leading-relaxed">{locJk.desc}</p>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-400 group-hover:underline">{t.jokerDraftActivate}</span>
                      <span className="text-[11px] text-zinc-500 font-mono tracking-wider">
                        {tt('✦ ATOUT', '✦ PERK', '✦ COMODÍN')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Profil & Préférences Modal (Ultra-épuré, zéro bruit) */}
      {showProfileModal && (
        <GameDialog label={tt('Préférences', 'Preferences', 'Ajustes')} onDismiss={() => setShowProfileModal(false)}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem)] overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-[#0c0d12] p-5 shadow-2xl space-y-4 font-mono animate-in fade-in zoom-in-95 duration-150">
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
                aria-label={tt('Fermer', 'Close', 'Cerrar')}
                className="min-w-11 p-1 text-zinc-300"
              >
                ✕
              </button>
            </div>

            {/* Street Name / Blase */}
            <div className="space-y-1">
              <span className="text-[11px] uppercase text-zinc-500 tracking-wider">
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
                placeholder={tt('Ton pseudo', 'Your nickname', 'Tu apodo')}
              />
            </div>

            {/* Compte : connexion / création de compte (sauvegarde cloud) */}
            <div className="space-y-1">
              <span className="text-[11px] uppercase text-zinc-500 tracking-wider">
                {tt('Compte', 'Account', 'Cuenta')}
              </span>
              {authUser ? (
                <div className="flex items-center justify-between gap-2 rounded border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1.5 text-[11px] text-emerald-300">
                  <span className="min-w-0 truncate" title={authUser.email}>{authUser.name || authUser.email} <span className="text-[11px] uppercase text-zinc-500">({cloudStatus === 'saved' ? tt('sauvegardé', 'saved', 'guardado') : cloudStatus === 'syncing' ? tt('sauvegarde…', 'saving…', 'guardando…') : cloudStatus === 'error' ? tt('à synchroniser', 'sync pending', 'pendiente') : tt('local', 'local', 'local')})</span></span>
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
                      clearNativeSession();
                      cloudReadyRef.current = false;
                      setAuthUser(null);
                      setCloudStatus('idle');
                    }}
                    className="shrink-0 text-zinc-400 underline hover:text-red-300"
                  >
                    {t.logout}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (oauthConfigured) {
                      startGoogleLogin();
                    } else {
                      setError(tt('Connexion Google prête : configure GOOGLE_CLIENT_ID et SECRET dans .env.local.', 'Google sign-in ready: set GOOGLE_CLIENT_ID and SECRET in .env.local.', 'Inicio de sesión de Google listo: configura GOOGLE_CLIENT_ID y SECRET en .env.local.'));
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded border border-white/15 bg-white/5 px-2.5 py-2 text-[11px] text-zinc-200 hover:bg-white/10"
                >
                  <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.8l3.7-2.9z"/>
                    <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z"/>
                  </svg>
                  {tt('Se connecter / créer un compte avec Google', 'Sign in / sign up with Google', 'Iniciar sesión / crear cuenta con Google')}
                </button>
              )}
              <p className="text-[11px] leading-snug text-zinc-500">
                {tt('Un compte sauvegarde ta progression dans le cloud et te permet de publier ton score.', 'An account saves your progress in the cloud and lets you publish your score.', 'Una cuenta guarda tu progreso en la nube y te permite publicar tu puntuación.')}
              </p>
            </div>

            {hasPass && !passOpen && (
              <div className="space-y-1">
                <span className="text-[11px] uppercase text-zinc-500 tracking-wider">
                  {tt('Pass Syndicat', 'Syndicate Pass', 'Pase del Sindicato')}
                </span>
                {!authUser && (
                  <p className="border-l-2 border-amber-400 pl-2 text-[11px] leading-snug text-amber-200">
                    {tt('Actif sur ce navigateur seulement. Connecte-toi avec Google pour le lier à ton compte.', 'Active on this browser only. Sign in with Google to tie it to your account.', 'Activo solo en este navegador. Inicia sesión con Google para vincularlo a tu cuenta.')}
                  </p>
                )}
                {passManageable && !isNative && (
                  <button type="button" disabled={passBusy} onClick={openBillingPortal} className="w-full rounded border border-white/15 bg-white/5 px-2.5 py-2 text-[11px] text-zinc-200 hover:bg-white/10 disabled:opacity-50">
                    {tt('Gérer ou résilier mon abonnement', 'Manage or cancel my subscription', 'Gestionar o cancelar mi suscripción')}
                  </button>
                )}
              </div>
            )}

            {/* Language Segmented Pill */}
            <div className="space-y-1">
              <span className="text-[11px] uppercase text-zinc-500 tracking-wider">
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
                <span>{tt('Haptique', 'Haptics', 'Háptico')}</span>
                <span className="text-[11px] uppercase font-bold">{hapticsEnabled ? 'ON' : 'OFF'}</span>
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
                <span>{tt('Son', 'Sound', 'Sonido')}</span>
                <span className="text-[11px] uppercase font-bold">{!muted ? 'ON' : 'OFF'}</span>
              </button>
            </div>


            <button
              type="button"
              onClick={() => {
                const next = !telemetryOn;
                setTelemetryOn(next);
                localStorage.setItem('fence_telemetry', next ? '1' : '0');
              }}
              title={tt('Compteurs anonymes (jour atteint, abandons…), aucune donnée personnelle.', 'Anonymous counters (day reached, drop-offs…), no personal data.', 'Contadores anónimos (día alcanzado, abandonos…), sin datos personales.')}
              className={`flex w-full items-center justify-between rounded border px-2.5 py-1.5 text-[11px] transition-colors ${telemetryOn ? 'border-amber-400/40 bg-amber-400/10 text-amber-300' : 'border-white/5 bg-black/40 text-zinc-500'}`}
            >
              <span>{tt('Statistiques anonymes', 'Anonymous stats', 'Estadísticas anónimas')}</span>
              <span className="text-[11px] font-bold uppercase">{telemetryOn ? 'ON' : 'OFF'}</span>
            </button>

            {/* Career Summary Ticker */}
            <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[11px] text-zinc-500">
              <span>{tt('Bénéfice', 'Profit', 'Beneficio')}: <strong className="text-amber-300">{mny(totalProfit)}</strong></span>
              <span>·</span>
              <span>{tt('Suisse', 'Swiss', 'Suiza')}: <strong className="text-emerald-400">{mny(swissBank)}</strong></span>
              <span>·</span>
              <span>{tt('Jour', 'Day', 'Día')}: <strong className="text-zinc-300">{day}</strong></span>
            </div>
          </div>
        </div>
        </GameDialog>
      )}

      {/* Modal Confirmation de Liquidation Pièce d'Enquête (Bespoke Dark Neo-Noir, Zéro Prompt Natif) */}
      {pendingSellConfirm && (() => {
        const item = pendingSellConfirm.item;
        const mode = pendingSellConfirm.mode;
        const payout = mode === 'auction' ? getAuctionPayout(item) : getFastSellPayout(item);
        const kind = itemKindFor(item.name);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-150"
            onClick={() => setPendingSellConfirm(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-purple-500/50 bg-[#0c0d12] p-5 shadow-[0_0_50px_rgba(168,85,247,0.25)] space-y-4 font-mono animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar / Badge */}
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300">
                    <ShieldAlert className="h-3.5 w-3.5 text-purple-300" />
                  </span>
                  <span className="text-xs font-bold tracking-wider text-purple-300 uppercase">
                    {tt("Alerte · Piste d'Enquête Clé", 'Alert · Key Story Lead', 'Alerta · Pista Clave')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setPendingSellConfirm(null);
                  }}
                  className="text-zinc-500 hover:text-zinc-200 text-xs p-1 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Thumbnail + Item details */}
              <div className="flex items-center gap-3.5 rounded-xl border border-white/10 bg-black/60 p-3">
                <div className="relative h-14 w-16 shrink-0 rounded-lg bg-black/80 border border-white/10 flex items-center justify-center p-1 overflow-hidden shadow-inner">
                  <img
                    src={`/assets/items/${kind}.webp`}
                    alt={item.name}
                    className="h-full w-full object-contain mix-blend-lighten drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="text-xs font-bold text-amber-200 truncate">
                    « {localizeItemName(item.name, gameLocale)} »
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                    <span>{localizeFaction(item.faction, gameLocale)}</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-semibold">
                      {mode === 'auction'
                        ? tt(`Enchères : ~${mny(payout)}`, `Auction: ~${mny(payout)}`, `Subasta: ~${mny(payout)}`)
                        : tt(`Rapide : ~${mny(payout)}`, `Fast: ~${mny(payout)}`, `Rápido: ~${mny(payout)}`)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning Message Box */}
              <div className="rounded-xl border border-red-500/30 bg-red-950/25 p-3.5 space-y-2 text-xs">
                <div className="text-red-300 font-semibold flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                  <span>⚠️</span>
                  <span>{tt('Conséquence irréversible', 'Irreversible consequence', 'Consecuencia irreversible')}</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                  {tt(
                    "Cette pièce est l'élément central d'une intrigue en cours notée dans ton Carnet. Un client de l'histoire viendra au comptoir pour la réclamer.",
                    'This piece is the core element of an ongoing lead in your Notebook. A story client will come to the counter to claim it.',
                    'Esta pieza es el elemento central de una trama activa en tu Cuaderno. Un cliente de la historia vendrá al mostrador a reclamarla.'
                  )}
                </p>
                <div className="border-t border-red-500/20 pt-2 text-[11px] font-mono space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">{tt('Si gardée au coffre :', 'If kept in vault:', 'Si se guarda en caja :')}</span>
                    <span className="text-emerald-400 font-bold">+7 500 $ {tt('prime + baisse Heat', 'bounty + Heat drop', 'recompensa + baja de Heat')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">{tt('Si liquidée maintenant :', 'If liquidated now:', 'Si se liquida ahora :')}</span>
                    <span className="text-red-400 font-bold">{tt('Intrigue DÉFINITIVEMENT rompue', 'Story arc PERMANENTLY broken', 'Trama PERMANENTEMENTE rota')}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(15);
                    sound.playDealSuccess();
                    setPendingSellConfirm(null);
                  }}
                  className="w-full brass py-2.5 px-3 rounded-lg text-xs font-bold text-[#1a1206] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  <span>🛡️</span>
                  <span>{tt('Garder au Coffre', 'Keep in Vault', 'Guardar en Caja')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic([30, 60]);
                    setPendingSellConfirm(null);
                    sellItem(item.id, mode, true);
                  }}
                  className="w-full border border-red-500/40 bg-red-950/40 hover:bg-red-900/60 py-2.5 px-3 rounded-lg text-xs font-semibold text-red-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{tt('Vendre quand même', 'Sell Anyway', 'Vender de todos modos')}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal Alerte Vente aux Enchères Pièce Sale (+18% Heat) */}
      {pendingDirtyAuction && (() => {
        const item = pendingDirtyAuction;
        const kind = itemKindFor(item.name);
        const dirtyPayout = getAuctionPayout(item);
        const cleanPayout = getAuctionPayout({ ...item, cleaned: true });
        const fastPayout = getFastSellPayout(item);
        const cleanCost = jokerIds.includes('blanchisseur-express') ? 0 : 250;
        const canClean = cash >= cleanCost;

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-150"
            onClick={() => setPendingDirtyAuction(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-red-500/50 bg-[#0c0d12] p-5 shadow-[0_0_50px_rgba(239,68,68,0.25)] space-y-4 font-mono animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar / Badge */}
              <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 border border-red-400/40 text-red-300">
                    <Flame className="h-3.5 w-3.5 text-red-300" />
                  </span>
                  <span className="text-xs font-bold tracking-wider text-red-300 uppercase">
                    {tt('Alerte Police · Pièce Non Nettoyée', 'Police Alert · Uncleaned Item', 'Alerta Policial · Pieza No Limpia')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setPendingDirtyAuction(null);
                  }}
                  className="text-zinc-500 hover:text-zinc-200 text-xs p-1 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Thumbnail + Item details */}
              <div className="flex items-center gap-3.5 rounded-xl border border-white/10 bg-black/60 p-3">
                <div className="relative h-14 w-16 shrink-0 rounded-lg bg-black/80 border border-white/10 flex items-center justify-center p-1 overflow-hidden shadow-inner">
                  <img
                    src={`/assets/items/${kind}.webp`}
                    alt={item.name}
                    className="h-full w-full object-contain mix-blend-lighten drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="text-xs font-bold text-amber-200 truncate">
                    « {localizeItemName(item.name, gameLocale)} »
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/30 font-bold uppercase text-[11px]">
                      {tt('Sale / Traçable', 'Dirty / Traceable', 'Sucia / Rastreable')}
                    </span>
                    <span>·</span>
                    <span className="text-zinc-300">{localizeFaction(item.faction, gameLocale)}</span>
                  </div>
                </div>
              </div>

              {/* Explication du Danger */}
              <div className="rounded-xl border border-red-500/30 bg-red-950/25 p-3.5 space-y-2 text-xs">
                <div className="text-red-300 font-semibold flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                  <span>🚨</span>
                  <span>{tt('Surveillance des Enchères Clandestines', 'Underground Auction Surveillance', 'Vigilancia de Subastas Clandestinas')}</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                  {tt(
                    "Cette pièce porte encore des traces ou numéros de série identifiables. La police surveille la salle des ventes : la liquider aux enchères sans la nettoyer fera bondir ton Heat de +18 % !",
                    'This item still bears serial numbers or traceable marks. Police monitor underground auctions: selling it uncleaned will immediately spike your Heat by +18%!',
                    'Esta pieza aún lleva números de serie o marcas rastreables. La policía vigila la sala de subastas: ¡liquidarla sin limpiarla aumentará tu Heat un +18 %!'
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1 font-mono">
                {/* Option 1 : Nettoyer d'abord & Vendre au prix fort (Recommandé) */}
                <button
                  type="button"
                  disabled={!canClean}
                  onClick={() => {
                    triggerHaptic(20);
                    sound.playDealSuccess();
                    setCash((c) => c - cleanCost);
                    setCityHeat((h) => Math.max(0, h - 8));
                    const cleanedItem: BoughtItem = { ...item, cleaned: true, hotLevel: 'TIÈDE' };
                    setInventory((inv) => inv.map((it) => (it.id === item.id ? cleanedItem : it)));
                    setPendingDirtyAuction(null);
                    sellItem(item.id, 'auction', true, cleanedItem);
                  }}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-transform cursor-pointer ${
                    canClean
                      ? 'brass text-[#1a1206] hover:scale-[1.02]'
                      : 'border border-zinc-800 bg-zinc-900/50 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>🧼</span>
                    <span>{tt(`Nettoyer (−${cleanCost} $) & Enchères`, `Clean (−$${cleanCost}) & Auction`, `Limpiar (−${cleanCost} $) y Subasta`)}</span>
                  </span>
                  <span className="font-bold text-[11px]">
                    +{mny(cleanPayout)}
                  </span>
                </button>
                {!canClean && (
                  <p className="text-[11px] text-red-400/90 text-center font-sans">
                    {tt(`Cash insuffisant pour nettoyer (${cleanCost} $ requis / tu as ${cash} $).`, `Not enough cash to clean ($${cleanCost} required / you have $${cash}).`, `Efectivo insuficiente para limpiar (${cleanCost} $ requeridos / tienes ${cash} $).`)}
                  </p>
                )}

                {/* Option 2 : Vente rapide discrète (Alternative sûre) */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(15);
                    setPendingDirtyAuction(null);
                    sellItem(item.id, 'fast');
                  }}
                  className="w-full border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 py-2.5 px-3 rounded-lg text-xs font-semibold text-emerald-200 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>{tt('Passer en Vente Rapide (−5% Heat)', 'Switch to Quick Sale (−5% Heat)', 'Pasar a Venta Rápida (−5% Heat)')}</span>
                  </span>
                  <span className="font-mono font-bold text-[11px]">
                    +{mny(fastPayout)}
                  </span>
                </button>

                {/* Option 3 : Vendre telle quelle (+18% Heat) */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic([30, 60]);
                    setPendingDirtyAuction(null);
                    sellItem(item.id, 'auction', true);
                  }}
                  className="w-full border border-red-500/30 bg-red-950/20 hover:bg-red-900/40 py-2 px-3 rounded-lg text-[11px] font-semibold text-red-300 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>{tt('Vendre quand même (+18% Heat)', 'Sell Anyway (+18% Heat)', 'Vender de todos modos (+18% Heat)')}</span>
                  </span>
                  <span className="font-mono text-zinc-400">
                    +{mny(dirtyPayout)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Barre d'onglets mobile (façon iOS) : le comptoir reste plein écran, la navigation est à portée de pouce */}
      <nav className="sticky bottom-0 z-40 flex min-h-[56px] shrink-0 border-t border-white/10 bg-[#0b0c11]/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md sm:hidden">
        {([
          { id: 'counter', icon: MessageSquare, label: tt('Comptoir', 'Counter', 'Mostrador'), badge: `${Math.min(clientsServedToday + 1, maxClientsPerDay)}/${maxClientsPerDay}`, go: goCounter },
          { id: 'night', icon: Package, label: tt('Coffre', 'Vault', 'Caja'), badge: inventory.length > 0 ? String(inventory.length) : '', go: () => setTab('night') },
          { id: 'daily', icon: Clock, label: tt('Contrat', 'Daily', 'Contrato'), badge: '', go: () => openDailyContract() },
          { id: 'shop', icon: Building2, label: t.tabEmpire, badge: '', go: () => setTab('shop') },
          { id: 'pantheon', icon: Trophy, label: t.tabPantheon, badge: '', go: () => setTab('pantheon') },
        ] as const).map((it) => {
          const Icon = it.icon;
          const active = tab === it.id;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => {
                triggerHaptic(10);
                it.go();
              }}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-w-0 flex-1 flex-col items-center gap-0.5 pb-1.5 pt-2 active:bg-white/5 ${active ? 'text-amber-300' : 'text-zinc-400'}`}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-full truncate px-0.5 text-[11px] font-medium">{it.label}</span>
              {it.badge && <span className="absolute left-[calc(50%+8px)] top-0.5 rounded-full bg-amber-500 px-1 text-[11px] font-bold leading-4 text-zinc-950">{it.badge}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
