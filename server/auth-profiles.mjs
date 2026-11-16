import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const PROFILES_DIR = path.resolve('server/data/profiles');
fs.mkdirSync(PROFILES_DIR, { recursive: true });

const SAFE_USER_ID_RE = /^google_[A-Za-z0-9_-]{4,64}$/;
const SESSION_TTL_MS = 30 * 24 * 3600 * 1000;
const TX_TTL_MS = 10 * 60 * 1000;

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    try {
      out[k] = decodeURIComponent(v);
    } catch {
      out[k] = v;
    }
  }
  return out;
}

function cookieFlags(req, maxAgeSeconds) {
  const isHttps =
    req.socket?.encrypted ||
    String(req.headers['x-forwarded-proto'] || '').toLowerCase() === 'https';
  return `HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}${isHttps ? '; Secure' : ''}`;
}

export function getAuthUser(req, verifyToken) {
  const cookies = parseCookies(req);
  const raw = cookies.fence_session;
  if (!raw) return null;
  const claims = verifyToken(raw);
  if (!claims || claims.kind !== 'oauth_session' || !(claims.exp > Date.now())) return null;
  if (!SAFE_USER_ID_RE.test(String(claims.userId || ''))) return null;
  return {
    id: String(claims.userId),
    name: String(claims.name || 'Receleur').slice(0, 64),
    email: String(claims.email || '').slice(0, 128),
    picture: String(claims.picture || '').slice(0, 512),
  };
}

function sanitizeProfilePayload(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    const err = new Error('Profil JSON invalide');
    err.statusCode = 400;
    throw err;
  }
  const num = (v, min, max, fallback) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.round(n))) : fallback;
  };
  const str = (v, max, fallback = '') =>
    typeof v === 'string' ? v.slice(0, max) : fallback;
  const strArr = (v, maxItems, maxLen) =>
    Array.isArray(v)
      ? v.filter((x) => typeof x === 'string').slice(0, maxItems).map((x) => x.slice(0, maxLen))
      : [];

  const factionRep = {};
  if (input.factionRep && typeof input.factionRep === 'object' && !Array.isArray(input.factionRep)) {
    for (const [k, v] of Object.entries(input.factionRep).slice(0, 10)) {
      if (/^[a-z0-9_-]{2,24}$/i.test(k)) {
        factionRep[k] = num(v, -100, 100, 0);
      }
    }
  }

  const upgrades = {
    uvLamp: Boolean(input.upgrades?.uvLamp),
    armoredDoor: Boolean(input.upgrades?.armoredDoor),
    gpsJammer: Boolean(input.upgrades?.gpsJammer),
  };

  const inventory = Array.isArray(input.inventory)
    ? input.inventory.slice(0, 50).map((it) => ({
        id: str(it?.id, 80),
        name: str(it?.name, 120),
        faction: str(it?.faction, 80),
        paid: num(it?.paid, 0, 10_000_000, 0),
        streetValue: num(it?.streetValue, 0, 10_000_000, 0),
        hotLevel: it?.hotLevel === 'BRÛLANT' || it?.hotLevel === 'PIÈGE' ? it.hotLevel : 'TIÈDE',
        cleaned: Boolean(it?.cleaned),
        category: it?.category ? str(it.category, 40) : undefined,
        modifier:
          it?.modifier === 'traceur' || it?.modifier === 'collection' || it?.modifier === 'contrefacon'
            ? it.modifier
            : undefined,
        codexId: it?.codexId ? str(it.codexId, 64) : undefined,
        rarity: it?.rarity ? str(it.rarity, 24) : undefined,
        arcId: it?.arcId ? str(it.arcId, 64) : undefined,
        arcItemKey: it?.arcItemKey ? str(it.arcItemKey, 64) : undefined,
      }))
    : [];

  const historyLog = Array.isArray(input.historyLog)
    ? input.historyLog.slice(0, 100).map((h) => ({
        ts: num(h?.ts, 0, 9_999_999_999_999, Date.now()),
        day: num(h?.day, 1, 10_000, 1),
        type: ['deal', 'sell', 'trap', 'raid', 'gameover', 'ascend'].includes(h?.type)
          ? h.type
          : 'deal',
        summary: str(h?.summary, 180),
        cashDelta: num(h?.cashDelta, -10_000_000, 10_000_000, 0),
      }))
    : [];

  const arcNotes = Array.isArray(input.arcNotes)
    ? input.arcNotes.slice(0, 30).map((a) => ({
        arcId: str(a?.arcId, 64),
        title: str(a?.title, 120),
        note: str(a?.note, 300),
        itemKey: str(a?.itemKey, 64),
        resolved: Boolean(a?.resolved),
      }))
    : [];

  const vengeance = Array.isArray(input.vengeance)
    ? input.vengeance.slice(0, 50).map((v) => ({
        faction: str(v?.faction, 80),
        day: num(v?.day, 1, 10_000, 1),
        reason: v?.reason === 'braquage' || v?.reason === 'trap_exposed' ? v.reason : 'rejected',
      }))
    : [];

  return {
    day: num(input.day, 1, 10_000, 1),
    cash: num(input.cash, 0, 100_000_000, 2500),
    totalProfit: num(input.totalProfit, -100_000_000, 100_000_000, 0),
    cityHeat: num(input.cityHeat, 0, 100, 15),
    swissBank: num(input.swissBank, 0, 100_000_000, 0),
    streak: num(input.streak, 0, 10_000, 0),
    lastContractDate: str(input.lastContractDate, 20),
    dailyDoneDate: str(input.dailyDoneDate, 20),
    districtId: str(input.districtId, 32, 'docks'),
    ascensionLevel: num(input.ascensionLevel, 0, 10, 0),
    maxDaySurvived: num(input.maxDaySurvived, 0, 10_000, 0),
    seasonXp: num(input.seasonXp, 0, 10_000_000, 0),
    lastMemory: str(input.lastMemory, 240),
    inventory,
    upgrades,
    jokerIds: strArr(input.jokerIds, 50, 48),
    cityAssets: strArr(input.cityAssets, 10, 48),
    arcNotes,
    vengeance,
    codexDiscovered: strArr(input.codexDiscovered, 100, 64),
    factionRep,
    historyLog,
    updatedAt: Date.now(),
  };
}

function profilePath(userId) {
  if (!SAFE_USER_ID_RE.test(userId)) throw new Error('Invalid userId');
  return path.join(PROFILES_DIR, `${userId}.json`);
}

function readUserProfile(userId) {
  const file = profilePath(userId);
  try {
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function writeUserProfile(userId, profile) {
  const file = profilePath(userId);
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(profile, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

export async function handleAuthAndProfileRoutes({
  req,
  res,
  url,
  origin,
  allowedOrigin,
  allowedOrigins,
  sessionSecret,
  issueToken,
  verifyToken,
  sendJson,
  readJson,
}) {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const oauthConfigured = Boolean(clientId && clientSecret && sessionSecret);

  const callbackBase =
    process.env.OAUTH_REDIRECT_URI ||
    `${origin && allowedOrigins.includes(origin) ? origin : allowedOrigin}/api/auth/google/callback`;

  /* ---------------- GET /api/auth/me ---------------- */
  if (req.method === 'GET' && url.pathname === '/api/auth/me') {
    const user = getAuthUser(req, verifyToken);
    sendJson(res, 200, {
      authenticated: Boolean(user),
      oauthConfigured,
      user,
    });
    return true;
  }

  /* ---------------- POST /api/auth/logout ---------------- */
  if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
    sendJson(
      res,
      200,
      { ok: true },
      { 'Set-Cookie': `fence_session=; ${cookieFlags(req, 0)}` },
    );
    return true;
  }

  /* ---------------- GET /api/auth/google ---------------- */
  if (req.method === 'GET' && url.pathname === '/api/auth/google') {
    if (!oauthConfigured) {
      sendJson(res, 503, {
        error: 'OAuth Google non configuré (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / SESSION_SECRET requis dans .env.local).',
      });
      return true;
    }

    const state = crypto.randomBytes(24).toString('hex');
    const codeVerifier = b64url(crypto.randomBytes(32));
    const codeChallenge = b64url(crypto.createHash('sha256').update(codeVerifier).digest());

    const txToken = issueToken({
      kind: 'oauth_tx',
      state,
      codeVerifier,
      redirectUri: callbackBase,
      exp: Date.now() + TX_TTL_MS,
    });

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', callbackBase);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('prompt', 'select_account');

    res.writeHead(302, {
      Location: authUrl.toString(),
      'Set-Cookie': `fence_oauth_tx=${encodeURIComponent(txToken)}; ${cookieFlags(req, 600)}`,
      'Cache-Control': 'no-store',
    });
    res.end();
    return true;
  }

  /* ---------------- GET /api/auth/google/callback ---------------- */
  if (req.method === 'GET' && url.pathname === '/api/auth/google/callback') {
    if (!oauthConfigured) {
      sendJson(res, 503, { error: 'OAuth Google non configuré.' });
      return true;
    }

    const code = url.searchParams.get('code') || '';
    const state = url.searchParams.get('state') || '';
    const cookies = parseCookies(req);
    const tx = cookies.fence_oauth_tx ? verifyToken(cookies.fence_oauth_tx) : null;

    if (
      !code ||
      !state ||
      !tx ||
      tx.kind !== 'oauth_tx' ||
      !(tx.exp > Date.now()) ||
      String(tx.state).length !== state.length ||
      !crypto.timingSafeEqual(Buffer.from(String(tx.state)), Buffer.from(state))
    ) {
      sendJson(res, 403, { error: 'Transaction OAuth invalide ou expirée (anti-CSRF).' });
      return true;
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: String(tx.redirectUri || callbackBase),
        grant_type: 'authorization_code',
        code_verifier: String(tx.codeVerifier),
      }),
    });
    if (!tokenRes.ok) {
      sendJson(res, 502, { error: 'Échec échange OAuth Google.' });
      return true;
    }
    const tokenData = await tokenRes.json();
    const userRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!userRes.ok) {
      sendJson(res, 502, { error: 'Impossible de lire le profil Google.' });
      return true;
    }
    const profile = await userRes.json();
    const sub = String(profile?.sub || '').replace(/[^A-Za-z0-9_-]/g, '');
    const userId = `google_${sub}`;
    if (!SAFE_USER_ID_RE.test(userId)) {
      sendJson(res, 400, { error: 'Identifiant utilisateur Google invalide.' });
      return true;
    }

    const sessionToken = issueToken({
      kind: 'oauth_session',
      userId,
      name: String(profile?.name || 'Receleur').slice(0, 64),
      email: String(profile?.email || '').slice(0, 128),
      picture: String(profile?.picture || '').slice(0, 512),
      exp: Date.now() + SESSION_TTL_MS,
    });

    const redirectHome = `${allowedOrigin}/?auth=ok`;
    res.writeHead(302, {
      Location: redirectHome,
      'Set-Cookie': [
        `fence_session=${encodeURIComponent(sessionToken)}; ${cookieFlags(req, 30 * 24 * 3600)}`,
        `fence_oauth_tx=; ${cookieFlags(req, 0)}`,
      ],
      'Cache-Control': 'no-store',
    });
    res.end();
    return true;
  }

  /* ---------------- GET /api/profile ---------------- */
  if (req.method === 'GET' && url.pathname === '/api/profile') {
    const user = getAuthUser(req, verifyToken);
    if (!user) {
      sendJson(res, 401, { error: 'Authentification requise.' });
      return true;
    }
    const saved = readUserProfile(user.id);
    sendJson(res, 200, { user, profile: saved });
    return true;
  }

  /* ---------------- POST /api/profile ---------------- */
  if (req.method === 'POST' && url.pathname === '/api/profile') {
    const user = getAuthUser(req, verifyToken);
    if (!user) {
      sendJson(res, 401, { error: 'Authentification requise.' });
      return true;
    }
    const body = await readJson(req);
    const clean = sanitizeProfilePayload(body?.profile ?? body);
    writeUserProfile(user.id, clean);
    sendJson(res, 200, { ok: true, updatedAt: clean.updatedAt });
    return true;
  }

  return false;
}
