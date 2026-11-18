import { computeLeague } from './league.mjs';
import { recordEvent } from './telemetry.mjs';
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { buildDailyContract } from './daily.mjs';
import { handleAuthAndProfileRoutes } from './auth-profiles.mjs';
import { localizeServerError, requestLocale } from './i18n.mjs';
import { handleAdminRoutes, getSystemConfig, syncOverridesWithSupabase } from './admin.mjs';
import { getLeaderboardFromSupabase, saveLeaderboardEntryToSupabase, isSupabaseConfigured } from './supabase.mjs';

/* ------------------------------------------------------------------ */
/* 1. Chargement de .env.local / .env (aucune dépendance externe)      */
/* ------------------------------------------------------------------ */
function loadEnvFiles(files) {
  for (const file of files) {
    let txt;
    try {
      if (!fs.existsSync(file)) continue;
      txt = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    for (const line of txt.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#') || line.trim().startsWith('[')) continue;
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!m) continue;
      let value = m[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[m[1]] === undefined) process.env[m[1]] = value;
    }
  }
}
loadEnvFiles(['.env.local', '.env']);

const PORT = Number(process.env.PORT || 3001);
const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGIN ||
  'https://cashnoir.app,https://cashnoir-nine.vercel.app,https://cashnoir-app.vercel.app,http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const ALLOWED_ORIGIN = ALLOWED_ORIGINS[0];
const TRUST_PROXY = process.env.TRUST_PROXY === '1' || Boolean(process.env.VERCEL);

const DATA_DIR = process.env.VERCEL ? path.resolve('/tmp/data') : path.resolve('server/data');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');
try {
  fs.mkdirSync(DATA_DIR, { recursive: true });
} catch {
  // Ignorer si en lecture seule
}

// SESSION_SECRET aléatoire = tokens invalidés à chaque redémarrage. On prévient
// explicitement au lieu de laisser croire que le paywall fonctionne.
const SESSION_SECRET = process.env.SESSION_SECRET || '';
if (!SESSION_SECRET) {
  console.warn(
    '[WARN] SESSION_SECRET absent de .env.local : les jetons Pass et les tickets de run ' +
      'ne pourront pas être émis (503). Renseigne-le avant de tester Stripe.',
  );
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const GEMINI_FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash-lite';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

const MAX_BODY_BYTES = 64 * 1024;

/* ------------------------------------------------------------------ */
/* 2. Rate limiting par IP ET par famille de route                     */
/* ------------------------------------------------------------------ */
const ROUTE_LIMITS = {
  npc: { max: 10, windowMs: 60_000 }, // appels LLM = coût réel
  write: { max: 20, windowMs: 60_000 }, // uploads leaderboard / runs
  read: { max: 120, windowMs: 60_000 },
};
const rateBuckets = new Map();

function clientIp(req) {
  if (TRUST_PROXY) {
    const fwd = req.headers['x-forwarded-for'];
    if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

function rateClass(method, pathname) {
  if (pathname === '/api/npc') return 'npc';
  if (pathname.startsWith('/api/webhook')) return null; // authentifié par HMAC
  if (method === 'POST') return 'write';
  return 'read';
}

// Renvoie le nombre de ms à attendre, ou 0 si autorisé.
function hitRateLimit(ip, kind) {
  const limit = ROUTE_LIMITS[kind];
  const now = Date.now();
  const key = `${ip}|${kind}`;
  let entry = rateBuckets.get(key);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + limit.windowMs };
    rateBuckets.set(key, entry);
  }
  entry.count += 1;
  if (entry.count > limit.max) return Math.max(1, entry.resetAt - now);
  return 0;
}

// Purge : sans ça la Map grossit indéfiniment (fuite mémoire).
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateBuckets) {
    if (now >= entry.resetAt) rateBuckets.delete(key);
  }
}, 60_000).unref();

/* ------------------------------------------------------------------ */
/* 3. Helpers HTTP                                                     */
/* ------------------------------------------------------------------ */
function baseHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Cache-Control', 'no-store');
}

function sendJson(res, status, data, extraHeaders = {}) {
  baseHeaders(res);
  if (data && typeof data.error === 'string') data = { ...data, error: localizeServerError(data.error, res.gameLocale || 'fr') };
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Game-Locale, X-Admin-Key, Authorization',
    'Access-Control-Max-Age': '600',
    ...extraHeaders,
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        const err = new Error('Payload trop volumineux');
        err.statusCode = 413;
        // On arrête de bufferiser mais laisse la réponse 413 partir avant de couper.
        req.pause();
        req.removeAllListeners('data');
        reject(err);
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function readJson(req) {
  const raw = await readBody(req);
  if (!raw) {
    const err = new Error('Corps JSON requis');
    err.statusCode = 400;
    throw err;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const err = new Error('JSON invalide');
    err.statusCode = 400;
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* 4. Signature (Stripe + jetons internes)                             */
/* ------------------------------------------------------------------ */
function hmac(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

function safeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length || a.length === 0 || a.length % 2 !== 0) return false;
  if (!/^[0-9a-f]+$/i.test(a) || !/^[0-9a-f]+$/i.test(b)) return false;
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

const STRIPE_TOLERANCE_S = 300;

// Cookie `Secure` dès que la requête arrive en HTTPS (directement ou derrière un proxy de confiance).
const secureFlag = (req) =>
  req.socket?.encrypted || (process.env.TRUST_PROXY === '1' && req.headers['x-forwarded-proto'] === 'https') ? '; Secure' : '';

// Une session Stripe payée ne peut débloquer le Pass que quelques fois (évite de partager un lien de retour).
const passClaims = new Map();
const MAX_CLAIMS_PER_SESSION = 3;
const PASS_DURATION_MS = 30 * 24 * 3600 * 1000;

// Modèles Ollama autorisés : on ne laisse pas le navigateur choisir n'importe quoi.
const OLLAMA_MODELS = (process.env.OLLAMA_MODELS || 'gemma4:latest,llama3.1,llama3.2,mistral,qwen2.5')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';

// Vérifie la signature Stripe ET la fraîcheur du timestamp (anti-replay).
function verifyStripeSignature(rawBody, sigHeader, secret) {
  if (typeof sigHeader !== 'string' || !sigHeader || !secret) return false;

  let timestamp = null;
  const candidates = [];
  for (const part of sigHeader.split(',')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key === 't') timestamp = value;
    else if (key === 'v1') candidates.push(value);
  }
  if (!timestamp || candidates.length === 0) return false;
  if (!/^\d{1,12}$/.test(timestamp)) return false;

  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (ageSeconds > STRIPE_TOLERANCE_S) return false;

  const expected = hmac(`${timestamp}.${rawBody}`, secret);
  return candidates.some((candidate) => safeEqualHex(expected, candidate));
}

// Jetons internes : payload.signature
function issueToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${hmac(body, SESSION_SECRET)}`;
}

function verifyToken(token) {
  if (typeof token !== 'string' || !token.includes('.') || !SESSION_SECRET) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  if (!safeEqualHex(hmac(body, SESSION_SECRET), sig)) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
let eventStats = {};
try {
  eventStats = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8')) || {};
} catch {
  eventStats = {};
}
let eventsTimer = null;
function scheduleEventsWrite() {
  if (eventsTimer) return;
  eventsTimer = setTimeout(() => {
    eventsTimer = null;
    fs.promises.writeFile(EVENTS_FILE, JSON.stringify(eventStats)).catch((e) => console.warn('[stats] écriture échouée:', e.message));
  }, 5000);
  eventsTimer.unref();
}

/* ------------------------------------------------------------------ */
/* 5. Stockage leaderboard (lecture/écriture non bloquante + sérialisée) */
/* ------------------------------------------------------------------ */
let leaderboardCache = null;
let writeQueue = Promise.resolve();

function loadLeaderboard() {
  if (leaderboardCache) return leaderboardCache;
  try {
    leaderboardCache = JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf8')) || {};
  } catch {
    leaderboardCache = {};
  }
  return leaderboardCache;
}

function persistLeaderboard(db, dateKey) {
  writeQueue = writeQueue
    .then(async () => {
      try {
        const tmp = `${LEADERBOARD_FILE}.${process.pid}.tmp`;
        await fs.promises.writeFile(tmp, JSON.stringify(db, null, 2));
        await fs.promises.rename(tmp, LEADERBOARD_FILE); // écriture atomique
      } catch {}
      if (isSupabaseConfigured() && dateKey) {
        await saveLeaderboardEntryToSupabase(dateKey, db[dateKey] || []);
      }
    })
    .catch((e) => console.warn('[leaderboard] écriture échouée:', e.message));
  return writeQueue;
}

const today = () => new Date().toISOString().slice(0, 10);

// runId -> { date } : un ticket = une seule entrée (anti-spam / anti-replay)
const consumedRuns = new Map();
setInterval(() => {
  const cutoff = Date.now() - 12 * 3600 * 1000;
  for (const [runId, meta] of consumedRuns) {
    if (meta.at < cutoff) consumedRuns.delete(runId);
  }
  const todayKey = today();
  for (const key of submitsByIp.keys()) {
    if (!key.endsWith(todayKey)) submitsByIp.delete(key);
  }
}, 3600 * 1000).unref();

const processedStripeEvents = new Set();

// Anti-flood du classement : 2 publications max par IP et par jour.
const submitsByIp = new Map();
const contactByIp = new Map();
const MAX_SUBMITS_PER_DAY = 2;

// Anti-drain tokens LLM : 20 messages/jour en gratuit quand Stripe est actif.
const FREE_DAILY_NPC_LIMIT = Number(process.env.FREE_DAILY_NPC_LIMIT || 60);
const PASS_DAILY_NPC_LIMIT = Number(process.env.PASS_DAILY_NPC_LIMIT || 400);
// Interrupteur d'urgence : nombre total de répliques IA servies par jour, tous joueurs confondus.
const GLOBAL_DAILY_NPC_LIMIT = Number(process.env.GLOBAL_DAILY_NPC_LIMIT || 5000);
const npcDailyByIp = new Map();
let npcDayStamp = '';
let npcGlobalToday = 0;

function hasValidPassCookie(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/(?:^|;\s*)syndicate_pass=([^;]+)/);
  const claims = match ? verifyToken(decodeURIComponent(match[1])) : null;
  return Boolean(claims && claims.kind === 'pass' && claims.exp > Date.now());
}

// Parties en cours : le serveur garde la marge, le client ne la fournit jamais.
const runs = new Map();

/** Miroir de computeDynamicFloor (src/services/llm.ts) : plus le vendeur a peur, plus son plancher baisse. */
function dynamicFloor(initialPrice, floorPrice, peur) {
  const ratio = Math.min(1, Math.max(0, peur / 85));
  const ceiling = initialPrice * 0.85;
  const raw = ceiling - ratio * (ceiling - floorPrice);
  return Math.max(floorPrice, Math.round(raw / 50) * 50);
}

/**
 * Un tour de négociation du contrat quotidien ne compte que s'il y a eu une vraie réponse du modèle.
 * On retient la peur annoncée par le modèle (bornée à +25 par tour, comme côté client) pour borner le prix payé.
 */
function recordNpcTurn(run, rawText) {
  if (!run || run.margin !== null) return;
  run.turns += 1;
  try {
    const cleaned = String(rawText).replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const peur = Number(JSON.parse(cleaned)?.jauges?.peur);
    if (Number.isFinite(peur)) {
      const bounded = Math.min(100, Math.max(0, peur));
      run.peurSeen = Math.max(run.peurSeen, Math.min(bounded, run.peurSeen + 25));
    }
  } catch {
    /* réponse non JSON : le tour compte, mais n'apporte aucune peur */
  }
}
const dailyRunByIp = new Map(); // `${ip}|${date}` -> runId : une seule tentative par IP et par jour
setInterval(() => {
  const cutoff = Date.now() - 24 * 3600 * 1000;
  for (const [runId, run] of runs) {
    if (run.at < cutoff) runs.delete(runId);
  }
}, 3600 * 1000).unref();

/* ------------------------------------------------------------------ */
/* 6. Serveur                                                          */
/* ------------------------------------------------------------------ */
export async function handleRequest(req, res) {
  res.gameLocale = requestLocale(req);
  const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);

  if (req.method === 'OPTIONS') {
    baseHeaders(res);
    res.writeHead(204, {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Game-Locale, X-Admin-Key, Authorization',
      'Access-Control-Max-Age': '600',
    });
    res.end();
    return;
  }

  // Refus explicite d'une origine non autorisée sur les mutations.
  const origin = req.headers.origin;
  if (['POST', 'PUT', 'DELETE'].includes(req.method) && origin && !ALLOWED_ORIGINS.includes(origin)) {
    sendJson(res, 403, { error: 'Origine non autorisée.' });
    return;
  }

  const kind = rateClass(req.method || 'GET', url.pathname);
  if (kind) {
    const waitMs = hitRateLimit(clientIp(req), kind);
    if (waitMs > 0) {
      sendJson(res, 429, { error: 'Trop de requêtes. Ralentis le rythme.' }, {
        'Retry-After': String(Math.ceil(waitMs / 1000)),
      });
      return;
    }
  }

  try {
    /* ---------------- Santé ---------------- */
    if (req.method === 'GET' && url.pathname === '/api/health') {
      if (isSupabaseConfigured()) {
        await syncOverridesWithSupabase().catch(() => {});
      }
      const sys = getSystemConfig();
      const providers = {
        ollama: true,
        gemini: Boolean(process.env.GEMINI_API_KEY),
        groq: Boolean(process.env.GROQ_API_KEY),
        deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
      };
      const configuredProvider = sys.llmProvider || 'auto';
      const activeProvider =
        configuredProvider !== 'auto' && (configuredProvider === 'ollama' || providers[configuredProvider])
          ? configuredProvider
          : providers.gemini
            ? 'gemini'
            : providers.groq
              ? 'groq'
              : providers.deepseek
                ? 'deepseek'
                : 'ollama';
      sendJson(res, 200, {
        ok: true,
        providers,
        activeProvider,
        configuredProvider,
        supabaseConfigured: isSupabaseConfigured(),
        stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
        passEnabled: Boolean(SESSION_SECRET && process.env.STRIPE_WEBHOOK_SECRET),
      });
      return;
    }

    /* ---------------- Contact Form (hello@cashnoir.app via Resend) ---------------- */
    if (req.method === 'POST' && url.pathname === '/api/contact') {
      const ip = clientIp(req);
      const now = Date.now();
      const last = contactByIp.get(ip) || 0;
      if (now - last < 60_000) {
        sendJson(res, 429, { error: 'Trop de messages envoyés. Réessaie dans une minute.' });
        return;
      }
      const body = await readJson(req);
      const email = String(body?.email || '').trim().slice(0, 120);
      const subject = String(body?.subject || 'Contact CASH NOIR').trim().slice(0, 120);
      const message = String(body?.message || '').trim().slice(0, 2000);
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 5) {
        sendJson(res, 400, { error: 'Email valide et message (min 5 caractères) requis.' });
        return;
      }
      contactByIp.set(ip, now);

      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'CASH NOIR <hello@cashnoir.app>',
            to: ['hello@cashnoir.app'],
            reply_to: email,
            subject: `[CASH NOIR] ${subject}`,
            text: `De: ${email}\n\n${message}`,
          }),
        });
        if (!r.ok) {
          sendJson(res, 502, { error: 'Envoi impossible pour le moment. Écris à hello@cashnoir.app.' });
          return;
        }
        sendJson(res, 200, { ok: true, sent: true });
        return;
      }
      // Fallback sans RESEND_API_KEY : on accepte proprement ou on laisse le front ouvrir mailto.
      sendJson(res, 200, { ok: true, fallbackMailto: true });
      return;
    }

    /* ---------------- Contrat 24h officiel ---------------- */
    if (req.method === 'GET' && url.pathname === '/api/daily') {
      const date = url.searchParams.get('date') || today();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        sendJson(res, 400, { error: 'Format de date invalide.' });
        return;
      }
      // Plancher et marge max restent côté serveur (la validation du deal les utilise).
      const { floorPrice: _f, maxMargin: _m, ...publicContract } = buildDailyContract(date);
      sendJson(res, 200, publicContract);
      return;
    }

    /* ---------------- Ticket de run (anti-forge leaderboard) ---------------- */
    if (req.method === 'POST' && url.pathname === '/api/run/start') {
      if (!SESSION_SECRET) {
        sendJson(res, 503, { error: 'SESSION_SECRET non configuré sur le serveur.' });
        return;
      }
      const date = today();
      const attemptKey = `${clientIp(req)}|${date}`;
      const previousId = dailyRunByIp.get(attemptKey);
      const previous = previousId ? runs.get(previousId) : null;
      if (previous) {
        if (previous.turns > 0 || previous.margin !== null) {
          sendJson(res, 409, { error: 'Contrat quotidien déjà tenté aujourd’hui depuis cette connexion. Reviens demain.' });
          return;
        }
        // Partie ouverte mais pas encore jouée : on la réutilise (impossible de jeter une tentative entamée).
        const { floorPrice: _f0, maxMargin: _m0, ...publicPrevious } = previous.contract;
        sendJson(res, 200, {
          runId: previousId,
          date,
          ticket: issueToken({ runId: previousId, date, iat: Date.now() }),
          contract: publicPrevious,
        });
        return;
      }
      const contract = buildDailyContract(date);
      const runId = crypto.randomUUID();
      dailyRunByIp.set(attemptKey, runId);
      runs.set(runId, { date, contract, margin: null, turns: 0, peurSeen: 0, at: Date.now() });
      const ticket = issueToken({ runId, date, iat: Date.now() });
      const { floorPrice: _f, maxMargin: _m, ...publicContract } = contract;
      sendJson(res, 200, { runId, date, ticket, contract: publicContract });
      return;
    }

    /* ---------------- Deal validé (le serveur calcule la marge) ---------------- */
    if (req.method === 'POST' && url.pathname === '/api/run/deal') {
      const body = await readJson(req);
      const claims = verifyToken(body.ticket);
      if (!claims || claims.runId !== body.runId) {
        sendJson(res, 401, { error: 'Ticket de run invalide.' });
        return;
      }
      if (claims.date !== today()) {
        sendJson(res, 400, { error: 'Ticket expiré : le contrat a changé de journée.' });
        return;
      }
      const run = runs.get(claims.runId);
      if (!run) {
        sendJson(res, 404, { error: 'Partie inconnue ou expirée. Recharge la page.' });
        return;
      }
      if (run.margin !== null) {
        sendJson(res, 409, { error: 'Un deal a déjà été enregistré pour cette partie.' });
        return;
      }

      const paid = Math.round(Number(body.paid));
      const { floorPrice, initialPrice, streetValue } = run.contract;
      if (run.turns < 1) {
        sendJson(res, 400, { error: 'Aucune négociation enregistrée pour ce contrat.' });
        return;
      }
      // Le client ne peut pas baisser de plus de 25 % par tour de négociation (cf. llm.ts).
      const fearBound = Math.min(100, run.peurSeen + 40); // marge pour les bonus de mots-clés calculés côté client
      const minPaid = Math.max(
        floorPrice,
        Math.round(initialPrice * 0.75 ** run.turns),
        dynamicFloor(initialPrice, floorPrice, fearBound),
      );
      if (!Number.isFinite(paid) || paid < minPaid || paid > initialPrice) {
        sendJson(res, 400, {
          error: 'Prix incohérent avec la négociation enregistrée.',
        });
        return;
      }

      // La marge est calculée ici, à partir des bornes officielles.
      run.margin = streetValue - paid;
      run.paid = paid;
      sendJson(res, 200, { ok: true, margin: run.margin, paid, contract: run.contract });
      return;
    }

    /* ---------------- Proxy Ollama verrouillé ---------------- */
    if (req.method === 'POST' && url.pathname === '/api/ollama/api/chat') {
      // Contrairement aux autres routes, ici l'origine est OBLIGATOIRE :
      // c'est ce qui empêche d'utiliser le serveur comme passerelle vers ton Ollama.
      if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
        sendJson(res, 403, { error: 'Origine requise et non autorisée.' });
        return;
      }

      const body = await readJson(req);
      const model = String(body.model || '');
      if (!OLLAMA_MODELS.includes(model)) {
        sendJson(res, 400, {
          error: `Modèle non autorisé. Autorisés : ${OLLAMA_MODELS.join(', ')}`,
        });
        return;
      }
      if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 40) {
        sendJson(res, 400, { error: 'Conversation invalide.' });
        return;
      }

      const messages = body.messages.map((m) => ({
        role: m?.role === 'assistant' ? 'assistant' : m?.role === 'system' ? 'system' : 'user',
        content: String(m?.content ?? '').slice(0, 8_000),
      }));

      let upstream;
      try {
        upstream = await fetch(`${OLLAMA_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages,
            stream: false,
            format: 'json',
            options: { temperature: 0.7 },
          }),
          signal: AbortSignal.timeout(120_000),
        });
      } catch {
        sendJson(res, 502, { error: 'Ollama injoignable sur 127.0.0.1:11434.' });
        return;
      }

      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        sendJson(res, 502, { error: `Ollama a répondu ${upstream.status}.` });
        return;
      }
      sendJson(res, 200, data);
      return;
    }

    /* ---------------- Statistiques anonymes (compteurs agrégés) ---------------- */
    if (req.method === 'POST' && url.pathname === '/api/event') {
      const body = await readJson(req);
      if (recordEvent(eventStats, today(), String(body?.name || ''), body?.v)) scheduleEventsWrite();
      res.statusCode = 204;
      res.end();
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/stats') {
      const key = process.env.ADMIN_KEY;
      if (!key || req.headers['x-admin-key'] !== key) {
        sendJson(res, 404, { error: 'Introuvable.' });
        return;
      }
      sendJson(res, 200, eventStats);
      return;
    }

    /* ---------------- Ligue hebdomadaire ---------------- */
    if (req.method === 'GET' && url.pathname === '/api/league') {
      sendJson(res, 200, computeLeague(loadLeaderboard()));
      return;
    }

    /* ---------------- Historique 7 jours ---------------- */
    if (req.method === 'GET' && url.pathname === '/api/leaderboard/history') {
      const days = Math.min(30, Math.max(1, Number(url.searchParams.get('days')) || 7));
      const db = loadLeaderboard();
      const out = [];
      for (let i = 0; i < days; i++) {
        const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
        const entries = db[d] || [];
        out.push({
          date: d,
          margin: entries.reduce((best, e) => Math.max(best, e.margin), 0),
          entries: entries.length,
        });
      }
      sendJson(res, 200, { days: out });
      return;
    }

    /* ---------------- Réplique gagnante de la veille ---------------- */
    if (req.method === 'GET' && url.pathname === '/api/leaderboard/highlight') {
      const date = url.searchParams.get('date') || new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        sendJson(res, 400, { error: 'Format de date invalide.' });
        return;
      }
      const best = [...(loadLeaderboard()[date] || [])]
        .filter((e) => e.line)
        .sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0) || b.margin - a.margin)[0];
      sendJson(res, 200, best ? { date, pseudo: best.pseudo, discount: best.discount, turns: best.turns, line: best.line } : { date });
      return;
    }

    /* ---------------- Leaderboard ---------------- */
    if (url.pathname === '/api/leaderboard') {
      const db = loadLeaderboard();
      const date = url.searchParams.get('date') || today();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        sendJson(res, 400, { error: 'Format de date invalide.' });
        return;
      }

      if (req.method === 'GET') {
        // Trois classements calculés par le serveur uniquement (rien n'est déclaré par le client).
        const board = url.searchParams.get('board') || 'margin';
        const sorters = {
          margin: (a, b) => b.margin - a.margin,
          discount: (a, b) => (b.discount ?? 0) - (a.discount ?? 0) || b.margin - a.margin,
          speed: (a, b) => (a.turns ?? 99) - (b.turns ?? 99) || b.margin - a.margin,
        };
        const list = [...(db[date] || [])].sort(sorters[board] || sorters.margin).slice(0, 10);
        sendJson(res, 200, { date, board, entries: list });
        return;
      }

      if (req.method === 'POST') {
        const body = await readJson(req);

        // Sans ticket serveur, n'importe qui peut poster 50 000 $. On refuse.
        const claims = verifyToken(body.ticket);
        if (!claims || claims.runId !== body.runId) {
          sendJson(res, 401, {
            error: 'Ticket de run invalide. Recharge la page pour en obtenir un.',
          });
          return;
        }
        if (claims.date !== today()) {
          sendJson(res, 400, { error: 'Ce ticket ne correspond pas à la journée en cours.' });
          return;
        }
        if (consumedRuns.has(claims.runId)) {
          sendJson(res, 409, { error: 'Score déjà envoyé pour cette partie.' });
          return;
        }

        const pseudo =
          String(body.pseudo || 'Anonyme')
            .replace(/[^\p{L}\p{N}_\- ]/gu, '')
            .trim()
            .slice(0, 20) || 'Anonyme';

        // Aucune marge envoyée par le client : on prend celle de la partie.
        const run = runs.get(claims.runId);
        if (!run || typeof run.margin !== 'number') {
          sendJson(res, 409, { error: 'Aucun deal validé par le serveur pour cette partie.' });
          return;
        }
        const margin = run.margin;

        const ipKey = `${clientIp(req)}|${claims.date}`;
        const submitted = submitsByIp.get(ipKey) || 0;
        if (submitted >= MAX_SUBMITS_PER_DAY) {
          sendJson(res, 429, {
            error: `Déjà ${MAX_SUBMITS_PER_DAY} scores publiés aujourd'hui depuis cette connexion.`,
          });
          return;
        }
        submitsByIp.set(ipKey, submitted + 1);

        consumedRuns.set(claims.runId, { at: Date.now(), date: claims.date });
        db[claims.date] = db[claims.date] || [];
        const { initialPrice } = run.contract;
        const discount = Math.round((100 * (initialPrice - run.paid)) / initialPrice);
        const turns = run.turns;
        // Titre gagné par les chiffres du serveur : décote profonde = négociateur, deal propre en 2 tours = éclair.
        const badge = discount >= 45 ? 'negotiator' : turns <= 2 && discount >= 20 ? 'blitz' : null;
        // Réplique clé affichée le lendemain : texte libre du joueur, donc nettoyé et borné.
        const line = String(body.line || '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/[\u0000-\u001f<>]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 100);
        db[claims.date].push({ pseudo, margin, discount, turns, badge, line, at: new Date().toISOString() });
        db[claims.date] = db[claims.date].sort((a, b) => b.margin - a.margin).slice(0, 50);
        await persistLeaderboard(db, claims.date);
        sendJson(res, 200, { ok: true, entries: db[claims.date].slice(0, 10) });
        return;
      }
    }

    /* ---------------- Proxy LLM (clés jamais côté navigateur) ---------------- */
    if (req.method === 'POST' && url.pathname === '/api/npc') {
      const stripeActive = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
      // Garde-fous de coût : (1) quota par IP, (2) usage raisonnable pour le Pass, (3) budget global journalier
      // (interrupteur d'urgence) : au-delà, le client bascule sur des vendeurs scriptés, sans erreur ni facture.
      const dayKey = today();
      if (npcDayStamp !== dayKey) {
        npcDayStamp = dayKey;
        npcDailyByIp.clear();
        npcGlobalToday = 0;
      }
      const ipDayKey = `${clientIp(req)}|${dayKey}`;
      const used = npcDailyByIp.get(ipDayKey) || 0;
      const hasPassNow = hasValidPassCookie(req);
      const ipLimit = hasPassNow ? PASS_DAILY_NPC_LIMIT : FREE_DAILY_NPC_LIMIT;
      if (used >= ipLimit) {
        sendJson(res, 402, {
          error: hasPassNow
            ? `Usage raisonnable atteint (${PASS_DAILY_NPC_LIMIT} répliques/jour). Reviens demain.`
            : stripeActive
              ? `Quota gratuit atteint (${FREE_DAILY_NPC_LIMIT} répliques/jour). Débloque le Pass Syndicat pour négocier en illimité.`
              : `Quota quotidien atteint (${FREE_DAILY_NPC_LIMIT} répliques/jour). Reviens demain.`,
          code: 'DAILY_QUOTA_REACHED',
        });
        return;
      }
      if (npcGlobalToday >= GLOBAL_DAILY_NPC_LIMIT) {
        sendJson(res, 503, { error: 'Budget IA du jour épuisé. Reviens demain.', code: 'GLOBAL_BUDGET_REACHED' });
        return;
      }
      npcDailyByIp.set(ipDayKey, used + 1);
      npcGlobalToday += 1;

      const body = await readJson(req);
      const { provider, systemPrompt, messages } = body;
      // Tour de négociation d'un contrat quotidien : compté côté serveur (anti-triche).
      const npcClaims = body.ticket ? verifyToken(body.ticket) : null;
      const npcRun = npcClaims && npcClaims.runId === body.runId ? runs.get(npcClaims.runId) : null;
      if (typeof systemPrompt !== 'string' || !Array.isArray(messages) || messages.length === 0) {
        sendJson(res, 400, { error: 'Requête invalide.' });
        return;
      }
      if (systemPrompt.length > 12_000 || messages.length > 40) {
        sendJson(res, 413, { error: 'Conversation trop longue.' });
        return;
      }

      const turns = messages
        .slice(-40)
        .map((m) => ({
          role: m?.role === 'player' ? 'user' : 'assistant',
          content: String(m?.content ?? '').slice(0, 2_000),
        }));

      if (provider === 'gemini') {
        const key = process.env.GEMINI_API_KEY;
        if (!key) {
          sendJson(res, 503, { error: 'GEMINI_API_KEY non configurée sur le serveur.' });
          return;
        }
        // Essais successifs : modèle principal sans "réflexion" (réponse en ~1 s), puis sans ce réglage si le modèle le refuse (400),
        // puis modèle de secours si le principal est saturé (429/503). Pas de nouvel essai sur une erreur de clé ou de quota dépassé.
        const body = (thinkingOff) =>
          JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: turns.map((t) => ({ role: t.role === 'user' ? 'user' : 'model', parts: [{ text: t.content }] })),
            generationConfig: {
              temperature: 0.7,
              responseMimeType: 'application/json',
              maxOutputTokens: 400,
              ...(thinkingOff ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
            },
          });
        const call = (model, thinkingOff) =>
          fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
            body: body(thinkingOff),
            signal: AbortSignal.timeout(20_000),
          });
        let upstream;
        try {
          upstream = await call(GEMINI_MODEL, true);
          if (upstream.status === 400) upstream = await call(GEMINI_MODEL, false);
          if ((upstream.status === 429 || upstream.status === 503) && GEMINI_FALLBACK_MODEL && GEMINI_FALLBACK_MODEL !== GEMINI_MODEL) {
            upstream = await call(GEMINI_FALLBACK_MODEL, false);
          }
        } catch {
          // Fallback automatique vers le modèle local Ollama si Gemini time out
          try {
            const localOllama = await fetch('http://127.0.0.1:11434/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: 'gemma4:latest',
                messages: [{ role: 'system', content: systemPrompt }, ...turns],
                format: 'json',
                stream: false,
                options: { temperature: 0.7 },
              }),
              signal: AbortSignal.timeout(15_000),
            });
            if (localOllama.ok) {
              const olData = await localOllama.json().catch(() => ({}));
              const rawText = String(olData?.message?.content || '');
              recordNpcTurn(npcRun, rawText);
              sendJson(res, 200, { raw: rawText, fallback: 'ollama' });
              return;
            }
          } catch {}
          sendJson(res, 504, { error: 'Gemini ne répond pas (délai dépassé). Réessaie dans un instant.' });
          return;
        }
        const data = await upstream.json().catch(() => ({}));
        if (!upstream.ok) {
          // Fallback Ollama si quota 429 ou erreur 503
          try {
            const localOllama = await fetch('http://127.0.0.1:11434/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: 'gemma4:latest',
                messages: [{ role: 'system', content: systemPrompt }, ...turns],
                format: 'json',
                stream: false,
                options: { temperature: 0.7 },
              }),
              signal: AbortSignal.timeout(15_000),
            });
            if (localOllama.ok) {
              const olData = await localOllama.json().catch(() => ({}));
              const rawText = String(olData?.message?.content || '');
              recordNpcTurn(npcRun, rawText);
              sendJson(res, 200, { raw: rawText, fallback: 'ollama' });
              return;
            }
          } catch {}
          const quota = upstream.status === 429;
          sendJson(res, quota ? 429 : upstream.status, {
            error: quota ? 'Le quota Gemini est atteint pour le moment. Réessaie plus tard.' : `Gemini a refusé la requête (${upstream.status}).`,
          });
          return;
        }
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        {
        const rawText = String(text || '');
        recordNpcTurn(npcRun, rawText);
        sendJson(res, 200, { raw: rawText });
      }
        return;
      }

      if (provider === 'groq') {
        const key = process.env.GROQ_API_KEY;
        if (!key) {
          sendJson(res, 503, { error: 'GROQ_API_KEY non configurée sur le serveur.' });
          return;
        }
        const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [{ role: 'system', content: systemPrompt }, ...turns],
            temperature: 0.7,
            response_format: { type: 'json_object' },
            max_tokens: 400,
          }),
        });
        const data = await upstream.json().catch(() => ({}));
        if (!upstream.ok) {
          sendJson(res, upstream.status, { error: `Groq a refusé la requête (${upstream.status}).` });
          return;
        }
        {
        const rawText = String(data?.choices?.[0]?.message?.content || '');
        recordNpcTurn(npcRun, rawText);
        sendJson(res, 200, { raw: rawText });
      }
        return;
      }

      if (provider === 'deepseek') {
        const key = process.env.DEEPSEEK_API_KEY;
        if (!key) {
          sendJson(res, 503, { error: 'DEEPSEEK_API_KEY non configurée sur le serveur.' });
          return;
        }
        const upstream = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: DEEPSEEK_MODEL,
            messages: [{ role: 'system', content: systemPrompt }, ...turns],
            temperature: 0.7,
            response_format: { type: 'json_object' },
            max_tokens: 400,
          }),
        });
        const data = await upstream.json().catch(() => ({}));
        if (!upstream.ok) {
          sendJson(res, upstream.status, { error: `DeepSeek a refusé la requête (${upstream.status}).` });
          return;
        }
        {
        const rawText = String(data?.choices?.[0]?.message?.content || '');
        recordNpcTurn(npcRun, rawText);
        sendJson(res, 200, { raw: rawText });
      }
        return;
      }

      if (provider === 'mock' && process.env.NPC_MOCK === '1') {
        const rawText = String(body.mockRaw || '{}');
        recordNpcTurn(npcRun, rawText);
        sendJson(res, 200, { raw: rawText });
        return;
      }
      sendJson(res, 400, { error: 'Fournisseur non supporté.' });
      return;
    }

    /* ---------------- Achat du Pass (Stripe Checkout) ---------------- */
    if (req.method === 'POST' && url.pathname === '/api/pass/checkout') {
      const key = process.env.STRIPE_SECRET_KEY;
      const price = process.env.STRIPE_PRICE_ID;
      if (!key || !price) {
        sendJson(res, 503, {
          error: 'Stripe non configuré (STRIPE_SECRET_KEY / STRIPE_PRICE_ID dans .env.local).',
        });
        return;
      }

      const form = new URLSearchParams();
      form.set('mode', 'payment');
      form.set('line_items[0][price]', price);
      form.set('line_items[0][quantity]', '1');
      form.set('success_url', `${ALLOWED_ORIGIN}/?pass=claim&session_id={CHECKOUT_SESSION_ID}`);
      form.set('cancel_url', `${ALLOWED_ORIGIN}/?pass=cancel`);

      const upstream = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form.toString(),
      });
      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok || !data?.url) {
        sendJson(res, 502, { error: 'Stripe a refusé la création de la session.' });
        return;
      }
      sendJson(res, 200, { url: data.url });
      return;
    }

    /* ---------------- Retour de paiement : émission du cookie ---------------- */
    if (req.method === 'GET' && url.pathname === '/api/pass/claim') {
      const key = process.env.STRIPE_SECRET_KEY;
      const sessionId = url.searchParams.get('session_id') || '';
      if (!key) {
        sendJson(res, 503, { error: 'Stripe non configuré.' });
        return;
      }
      if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
        sendJson(res, 400, { error: 'Session Stripe invalide.' });
        return;
      }
      if (!SESSION_SECRET) {
        sendJson(res, 503, { error: 'SESSION_SECRET non configuré : Pass non émis.' });
        return;
      }

      // On ne fait pas confiance au retour navigateur : on revérifie chez Stripe.
      const upstream = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
        { headers: { Authorization: `Bearer ${key}` } },
      );
      const session = await upstream.json().catch(() => ({}));
      if (!upstream.ok || session?.payment_status !== 'paid') {
        sendJson(res, 402, { error: 'Paiement non confirmé par Stripe.' });
        return;
      }

      const claimed = passClaims.get(sessionId) || 0;
      if (claimed >= MAX_CLAIMS_PER_SESSION) {
        sendJson(res, 403, { error: 'Cette session de paiement a déjà été utilisée.' });
        return;
      }
      passClaims.set(sessionId, claimed + 1);

      const passToken = issueToken({
        kind: 'pass',
        session: sessionId,
        exp: Date.now() + PASS_DURATION_MS,
      });
      baseHeaders(res);
      res.writeHead(302, {
        'Set-Cookie': `syndicate_pass=${encodeURIComponent(passToken)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${PASS_DURATION_MS / 1000}${secureFlag(req)}`,
        Location: '/?pass=ok',
      });
      res.end();
      return;
    }

    /* ---------------- Statut du Pass (cookie httpOnly signé) ---------------- */
    if (req.method === 'GET' && url.pathname === '/api/pass') {
      const cookie = req.headers.cookie || '';
      const match = cookie.match(/(?:^|;\s*)syndicate_pass=([^;]+)/);
      const claims = match ? verifyToken(decodeURIComponent(match[1])) : null;
      const valid = Boolean(claims && claims.kind === 'pass' && claims.exp > Date.now());

      // Sans Stripe configuré, le Pass serait invendable ET bloquant : on ouvre
      // l'accès pour ne pas tuer le classement en local/dev.
      const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
      sendJson(res, 200, {
        pass: stripeEnabled ? valid : true,
        mode: stripeEnabled ? 'paid' : 'open',
        stripeEnabled,
      });
      return;
    }

    /* ---------------- Webhook Stripe ---------------- */
    if (req.method === 'POST' && url.pathname === '/api/webhook/stripe') {
      const raw = await readBody(req);
      const secret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!secret) {
        sendJson(res, 503, { error: 'STRIPE_WEBHOOK_SECRET non configuré.' });
        return;
      }
      if (!verifyStripeSignature(raw, req.headers['stripe-signature'], secret)) {
        sendJson(res, 401, { error: 'Signature Stripe invalide.' });
        return;
      }

      let event;
      try {
        event = JSON.parse(raw);
      } catch {
        sendJson(res, 400, { error: 'Payload Stripe illisible.' });
        return;
      }

      if (event?.id) {
        if (processedStripeEvents.has(event.id)) {
          sendJson(res, 200, { received: true, duplicate: true });
          return;
        }
        processedStripeEvents.add(event.id);
        if (processedStripeEvents.size > 5_000) processedStripeEvents.clear();
      }

      if (event?.type === 'checkout.session.completed') {
        if (!SESSION_SECRET) {
          sendJson(res, 503, { error: 'SESSION_SECRET non configuré : Pass non émis.' });
          return;
        }
        if (event.data?.object?.payment_status && event.data.object.payment_status !== 'paid') {
          sendJson(res, 200, { received: true, ignored: 'unpaid' });
          return;
        }
        const passToken = issueToken({
          kind: 'pass',
          session: String(event.data?.object?.id || ''),
          exp: Date.now() + 30 * 24 * 3600 * 1000,
        });
        // Le jeton va au navigateur via cookie httpOnly, jamais dans la réponse webhook.
        sendJson(
          res,
          200,
          { received: true },
          {
            'Set-Cookie': `syndicate_pass=${encodeURIComponent(
              passToken,
            )}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${30 * 24 * 3600}`,
          },
        );
        return;
      }

      sendJson(res, 200, { received: true });
      return;
    }

    const handledAdmin = await handleAdminRoutes({
      req,
      res,
      url,
      origin,
      allowedOrigin: ALLOWED_ORIGIN,
      allowedOrigins: ALLOWED_ORIGINS,
      sessionSecret: SESSION_SECRET,
      issueToken,
      verifyToken,
      sendJson,
      readJson,
      readBody,
      clientIp,
    });
    if (handledAdmin) return;

    const handledAuth = await handleAuthAndProfileRoutes({
      req,
      res,
      url,
      origin,
      allowedOrigin: ALLOWED_ORIGIN,
      allowedOrigins: ALLOWED_ORIGINS,
      sessionSecret: SESSION_SECRET,
      issueToken,
      verifyToken,
      sendJson,
      readJson,
    });
    if (handledAuth) return;

    sendJson(res, 404, { error: 'Route introuvable.' });
  } catch (err) {
    const status = err?.statusCode === 413 ? 413 : err?.statusCode === 400 ? 400 : 500;
    if (status === 500) console.error('[erreur]', err?.message || err);
    if (status === 413) res.once('finish', () => req.destroy());
    sendJson(res, status, {
      error: status === 413 ? 'Payload trop volumineux.' : status === 400 ? 'Requête invalide.' : 'Erreur interne serveur.',
      code: status === 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST',
    });
  }
}

const server = http.createServer(handleRequest);

if (!process.env.VERCEL) {
  server.listen(PORT, '127.0.0.1', () => {
    const address = server.address();
    const boundPort = typeof address === 'object' && address ? address.port : PORT;
    console.log(`The Fence API server running on http://127.0.0.1:${boundPort}`);
    if (boundPort !== 3001) {
      console.warn(
        `[WARN] PORT=${PORT} : Vite proxifie /api vers 3001. Lance avec PORT=3001 si le proxy échoue.`,
      );
    }
  });
}
