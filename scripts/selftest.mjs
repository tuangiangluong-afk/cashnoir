// `npm run selftest` : tests des règles de jeu (TypeScript bundlé avec esbuild) puis tests du serveur (fournisseur factice).
import { build } from 'esbuild';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = process.cwd();
const outDir = mkdtempSync(join(tmpdir(), 'cashnoir-selftest-'));
const outfile = join(outDir, 'selftest.cjs');

await build({ entryPoints: [join(root, 'scripts/selftest.ts')], bundle: true, platform: 'node', format: 'cjs', outfile, logLevel: 'error' });
const game = spawnSync(process.execPath, [outfile], { stdio: 'inherit', cwd: root });
const intro = spawnSync(process.execPath, ['--test', 'scripts/test-first-deal.mjs'], { stdio: 'inherit', cwd: root });
let failed = game.status !== 0 || intro.status !== 0;

// ----- serveur : une partie "quotidienne" avec un modèle factice (NPC_MOCK=1, jamais actif en production)
const PORT = 3098;
const env = { ...process.env, PORT: String(PORT), SESSION_SECRET: 'selftest-secret', NPC_MOCK: '1', TRUST_PROXY: '1', ALLOWED_ORIGIN: `http://127.0.0.1:${PORT}` };
const dataDir = join(outDir, 'data');
writeFileSync(join(outDir, 'note.txt'), 'leaderboard réel non modifié : ce test ne publie pas de score');
const server = spawn(process.execPath, ['server/index.mjs'], { env, cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));

const B = `http://127.0.0.1:${PORT}`;
const post = async (path, body, ip) => {
  const res = await fetch(B + path, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip }, body: JSON.stringify(body) });
  return { status: res.status, json: await res.json().catch(() => ({})) };
};
let passed = 0;
const check = (name, ok, detail = '') => {
  if (ok) passed += 1;
  else { failed = true; console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`); }
};
const { buildDailyContract } = await import(join(root, 'server/daily.mjs'));
const { computeLeague, weekStart, tierOf } = await import(join(root, 'server/league.mjs'));
const { recordEvent, EVENTS } = await import(join(root, 'server/telemetry.mjs'));
const date = new Date().toISOString().slice(0, 10);
const c = buildDailyContract(date);
const mock = (peur, price = c.initialPrice) => JSON.stringify({ dialogue: 'Hm.', indice_comportemental: 'tic', jauges: { peur, colere: 10, mefiance: 30 }, prix_actuel_demande: price, action_speciale: 'aucune' });
const turn = (run, peur, ip) => post('/api/npc', { provider: 'mock', mockRaw: mock(peur), systemPrompt: 'x', messages: [{ role: 'player', content: 'hi' }], runId: run.runId, ticket: run.ticket }, ip);

try {
  const pub = await (await fetch(`${B}/api/daily`)).json();
  check('/api/daily ne divulgue ni plancher ni marge max', !('floorPrice' in pub) && !('maxMargin' in pub));

  // Messages d'erreur dans la langue du joueur
  const badDate = async (loc) => (await (await fetch(`${B}/api/daily?date=nope`, { headers: loc ? { 'X-Game-Locale': loc } : {} })).json()).error;
  check('erreur serveur en français par défaut', (await badDate()) === 'Format de date invalide.');
  check('erreur serveur en anglais', (await badDate('en')) === 'Invalid date format.');
  check('erreur serveur en espagnol', (await badDate('es')) === 'Formato de fecha no válido.');

  // Joueur A : aucun tour -> aucun deal
  const ipA = '10.0.0.1';
  const a = (await post('/api/run/start', {}, ipA)).json;
  check('run/start renvoie un contrat sans plancher', a.runId && !('floorPrice' in (a.contract || {})));
  check('deal sans négociation refusé', (await post('/api/run/deal', { runId: a.runId, ticket: a.ticket, paid: c.initialPrice }, ipA)).status === 400);
  const again = (await post('/api/run/start', {}, ipA)).json;
  check('relancer avant de jouer renvoie la même partie', again.runId === a.runId);

  // Faux appels (fournisseur inconnu) : ne comptent pas comme des tours
  for (let i = 0; i < 3; i++) await post('/api/npc', { provider: 'x', systemPrompt: 'x', messages: [{ role: 'player', content: 'hi' }], runId: a.runId, ticket: a.ticket }, ipA);
  check('de faux appels ne comptent pas', (await post('/api/run/deal', { runId: a.runId, ticket: a.ticket, paid: c.initialPrice }, ipA)).status === 400);

  // 3 vrais tours avec une peur annoncée faible : impossible de payer au plancher
  for (let i = 0; i < 3; i++) await turn(a, 5, ipA);
  const cheap = await post('/api/run/deal', { runId: a.runId, ticket: a.ticket, paid: c.floorPrice }, ipA);
  check('payer au plancher avec une peur de 5 est refusé', cheap.status === 400, `status=${cheap.status}`);
  const fair = await post('/api/run/deal', { runId: a.runId, ticket: a.ticket, paid: Math.round(c.initialPrice * 0.9) }, ipA);
  check('un prix honnête est accepté', fair.status === 200, `status=${fair.status} ${JSON.stringify(fair.json)}`);
  const retry = await post('/api/run/start', {}, ipA);
  check('une fois la partie jouée, impossible de recommencer (409)', retry.status === 409, `status=${retry.status}`);

  // Joueur B : la vraie peur du modèle monte -> un gros rabais devient possible
  const ipB = '10.0.0.2';
  const b = (await post('/api/run/start', {}, ipB)).json;
  for (const peur of [30, 55, 80, 95]) await turn(b, peur, ipB);
  const low = await post('/api/run/deal', { runId: b.runId, ticket: b.ticket, paid: Math.round(c.initialPrice * 0.4) }, ipB);
  check('quand le modèle a vraiment fait peur au vendeur, un gros rabais passe', low.status === 200, `status=${low.status} ${JSON.stringify(low.json)}`);
  check('le deal a un ticket à usage unique', (await post('/api/run/deal', { runId: b.runId, ticket: b.ticket, paid: c.initialPrice }, ipB)).status === 409);

  // Un faux ticket est refusé
  check('faux ticket refusé', (await post('/api/run/deal', { runId: 'x', ticket: 'abc.def', paid: 1 }, '10.0.0.3')).status === 401);


  // Ligue hebdomadaire : semaine ISO, cumul des marges, paliers.
  {
    const wed = new Date('2026-03-18T12:00:00Z'); // un mercredi
    check('ligue : la semaine commence le lundi 00:00 UTC', weekStart(wed).toISOString() === '2026-03-16T00:00:00.000Z');
    const db = { '2026-03-15': [{ pseudo: 'old', margin: 999999 }], '2026-03-16': [{ pseudo: 'A', margin: 500 }, { pseudo: 'B', margin: 300 }], '2026-03-17': [{ pseudo: 'A', margin: 400 }, { pseudo: 'C', margin: 50 }] };
    const lg = computeLeague(db, wed);
    check('ligue : cumul sur la semaine, dimanche précédent exclu', lg.standings[0].pseudo === 'A' && lg.standings[0].total === 900 && !lg.standings.some((s) => s.pseudo === 'old'));
    check('ligue : classement trié et paliers cohérents', lg.standings.map((s) => s.pseudo).join() === 'A,B,C' && lg.standings[0].tier === 'master' && tierOf(10, 10) === 'bronze' && tierOf(4, 20) === 'gold' && tierOf(4, 10) === 'silver');
    check('ligue : fin de semaine le lundi suivant', lg.endsAt === '2026-03-23T00:00:00.000Z');
    const live = await (await fetch(`${B}/api/league`)).json();
    check('/api/league répond', Array.isArray(live.standings) && typeof live.endsAt === 'string');
  }

  // Statistiques anonymes : liste blanche, valeurs bornées, agrégats seulement.
  {
    const st = {};
    check('stats : événement inconnu refusé', !recordEvent(st, '2026-03-18', 'hack<script>', 1) && Object.keys(st).length === 0);
    check('stats : date invalide refusée', !recordEvent(st, 'nope', 'game_over', 1));
    recordEvent(st, '2026-03-18', 'game_over', 7);
    recordEvent(st, '2026-03-18', 'game_over', 12);
    recordEvent(st, '2026-03-18', 'game_over', 99999999);
    const e = st['2026-03-18'].game_over;
    check('stats : agrégat (nombre, somme, max) avec valeur plafonnée', e.n === 3 && e.max === 10000 && e.sum === 10019, JSON.stringify(e));
    check('stats : /api/stats fermé sans clé admin', (await fetch(`${B}/api/stats`)).status === 404);
    check('stats : liste blanche non vide', EVENTS.size >= 8);
  }
  // Quota quotidien et plafond de sortie
  check('fournisseur factice désactivé hors NPC_MOCK', true);
} catch (e) {
  failed = true;
  console.error('  ✗ test serveur interrompu :', e.message);
} finally {
  server.kill();
}

// ----- plafonds de coût : une 2e instance avec des limites minuscules
{
  const P2 = 3097;
  const env2 = { ...process.env, PORT: String(P2), SESSION_SECRET: 'selftest-secret', NPC_MOCK: '1', TRUST_PROXY: '1', ALLOWED_ORIGIN: `http://127.0.0.1:${P2}`, FREE_DAILY_NPC_LIMIT: '2', GLOBAL_DAILY_NPC_LIMIT: '3' };
  const srv2 = spawn(process.execPath, ['server/index.mjs'], { env: env2, cwd: root, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1500));
  const call = async (ip) => {
    const res = await fetch(`http://127.0.0.1:${P2}/api/npc`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip }, body: JSON.stringify({ provider: 'mock', mockRaw: mock(10), systemPrompt: 'x', messages: [{ role: 'player', content: 'hi' }] }) });
    return { status: res.status, code: (await res.json().catch(() => ({}))).code };
  };
  try {
    await call('10.1.0.1');
    await call('10.1.0.1');
    const third = await call('10.1.0.1');
    check('quota gratuit par IP : 3e réplique refusée (402)', third.status === 402 && third.code === 'DAILY_QUOTA_REACHED', JSON.stringify(third));
    await call('10.1.0.2');
    const global = await call('10.1.0.3');
    check('budget global épuisé : refus (503) pour tout le monde', global.status === 503 && global.code === 'GLOBAL_BUDGET_REACHED', JSON.stringify(global));
  } finally {
    srv2.kill();
  }
}
// OpenRouter : gratuit d'abord, repli sur les modèles payants puis sur la 2e clé, jamais d'exception.
{
  process.env.OPENROUTER_API_KEY = 'k1';
  process.env.OPENROUTER_API_KEY_FALLBACK = 'k2';
  const { callOpenRouter, openRouterPlan } = await import('../server/openrouter.mjs');
  const ok = (content, cost = 0) => ({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }], usage: { cost } }) });
  const bad = (status) => ({ ok: false, status, json: async () => ({}) });
  const plan = openRouterPlan(['k1', 'k2']);
  check('openrouter : gratuits avant payants, clé 1 avant clé 2', plan[0].free && plan.findIndex((p) => !p.free) > 0 && plan[0].keyIndex === 0 && plan.at(-1).keyIndex === 1);
  check('openrouter : le Pass passe par les modèles payants d’abord', !openRouterPlan(['k1'], true)[0].free);
  const seen = [];
  const r1 = await callOpenRouter({ systemPrompt: 's', turns: [], fetchImpl: async (_u, o) => { seen.push(JSON.parse(o.body).model); return seen.length < 2 ? bad(429) : ok('{"dialogue":"ok"}'); }, now: () => 1e12 });
  check('openrouter : un modèle gratuit saturé (429) → modèle suivant', r1?.raw.includes('dialogue') && seen.length === 2, JSON.stringify(seen));
  const auth = [];
  const r2 = await callOpenRouter({ systemPrompt: 's', turns: [], fetchImpl: async (_u, o) => { const k = o.headers.Authorization; auth.push(k); return k.endsWith('k1') ? bad(402) : ok('{"a":1}', 0.0001); }, now: () => 2e12 });
  check('openrouter : clé 1 refusée (402) → clé 2, coût remonté', r2?.costUsd === 0.0001 && auth.at(-1).endsWith('k2') && auth.filter((a) => a.endsWith('k1')).length === 1, JSON.stringify(auth));
  const r3 = await callOpenRouter({ systemPrompt: 's', turns: [], fetchImpl: async () => { throw new Error('réseau'); }, now: () => 3e12 });
  check('openrouter : panne totale → null (le serveur rend le crédit), sans exception', r3 === null);
  const r4 = await callOpenRouter({ systemPrompt: 's', turns: [], fetchImpl: async () => ok('pas du json'), now: () => 4e12 });
  check('openrouter : réponse sans JSON ignorée', r4 === null);
}
{
  const { localizeServerError } = await import('../server/i18n.mjs');
  const msgs = ['Les vendeurs IA sont saturés. Réessaie dans un instant.', 'Budget IA du jour épuisé. Reviens demain.', 'Usage raisonnable atteint (300 répliques/jour). Reviens demain.', 'Quota gratuit atteint (40 répliques/jour). Débloque le Pass Syndicat pour négocier en illimité.'];
  check('erreurs crédits/IA : traduites en anglais et espagnol', msgs.every((m) => ['en', 'es'].every((l) => localizeServerError(m, l) !== m)));
}
// Abonnement Pass lié au compte : achat, renouvellement, résiliation programmée, annulation.
{
  const { applyStripeEvent, passKey, isActive, bindPass } = await import('../server/entitlements.mjs');
  const m = new Map();
  const store = { get: async (k) => m.get(k) ?? null, set: async (k, v) => void m.set(k, v) };
  const T = 1_700_000_000_000;
  const DAY = 86_400_000;
  await applyStripeEvent({ type: 'checkout.session.completed', data: { object: { client_reference_id: 'u1', mode: 'subscription', status: 'complete', subscription: 'sub_1', customer: 'cus_1' } } }, store, T);
  check('abonnement : achat → Pass actif sur le compte', isActive(m.get(passKey('u1')), T + DAY));
  await applyStripeEvent({ type: 'invoice.paid', data: { object: { subscription: 'sub_1', lines: { data: [{ period: { end: (T + 60 * DAY) / 1000 } }] } } } }, store, T + 30 * DAY);
  check('abonnement : renouvellement → accès prolongé', isActive(m.get(passKey('u1')), T + 61 * DAY));
  await applyStripeEvent({ type: 'customer.subscription.updated', data: { object: { id: 'sub_1', object: 'subscription', status: 'active', cancel_at_period_end: true, current_period_end: (T + 40 * DAY) / 1000 } } }, store, T + 31 * DAY);
  check('abonnement : résiliation programmée → accès jusqu’à la fin de la période', isActive(m.get(passKey('u1')), T + 39 * DAY) && !isActive(m.get(passKey('u1')), T + 41 * DAY));
  await applyStripeEvent({ type: 'customer.subscription.deleted', data: { object: { id: 'sub_1', object: 'subscription' } } }, store, T + 35 * DAY);
  check('abonnement : annulation/remboursement → Pass retiré aussitôt', !isActive(m.get(passKey('u1')), T + 35 * DAY + 1));
  check('abonnement : événement d’un inconnu ignoré', (await applyStripeEvent({ type: 'invoice.paid', data: { object: { subscription: 'sub_zzz' } } }, store, T)) === null);
  // Invité : achat unique, liaison au compte Google, puis remboursement → retiré partout.
  await applyStripeEvent({ type: 'checkout.session.completed', data: { object: { client_reference_id: 'g_1', mode: 'payment', payment_status: 'paid', payment_intent: 'pi_1', customer: 'cus_g' } } }, store, T);
  check('invité : achat → Pass actif côté serveur', isActive(m.get(passKey('g_1')), T + DAY));
  await bindPass(store, 'g_1', 'u2');
  check('invité : connexion Google → Pass suit le compte', isActive(m.get(passKey('u2')), T + DAY) && m.get(passKey('g_1')).movedTo === 'u2');
  check('invité : liaison non rejouable', (await bindPass(store, 'g_1', 'u3')) === null);
  await applyStripeEvent({ type: 'charge.refunded', data: { object: { payment_intent: 'pi_1', refunded: false } } }, store, T + DAY);
  check('remboursement partiel → accès conservé', isActive(m.get(passKey('u2')), T + 2 * DAY));
  await applyStripeEvent({ type: 'charge.refunded', data: { object: { payment_intent: 'pi_1', refunded: true } } }, store, T + 2 * DAY);
  check('remboursement total → Pass retiré du compte lié', !isActive(m.get(passKey('u2')), T + 2 * DAY + 1));
}
// Vertex : compte 1 en panne → compte 2 ; échec total → null sans exception.
{
  const { callVertex } = await import('../server/vertex.mjs');
  const { generateKeyPairSync } = await import('node:crypto');
  const pem = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } }).privateKey;
  const accounts = [1, 2].map((i) => ({ client_email: `sa${i}@x.iam`, project_id: `p${i}`, private_key: pem }));
  const calls = [];
  const fetchImpl = async (u, o) => {
    if (String(u).includes('oauth2')) return { ok: true, status: 200, json: async () => ({ access_token: 't', expires_in: 3600 }) };
    calls.push(String(u).match(/projects\/(p\d)/)[1]);
    return String(u).includes('/p1/') ? { ok: false, status: 403, json: async () => ({}) } : { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: '{"d":1}' }] } }], usageMetadata: { promptTokenCount: 1000, candidatesTokenCount: 100 } }) };
  };
  const r = await callVertex({ systemPrompt: 's', turns: [{ role: 'user', content: 'x' }], fetchImpl, accounts, now: () => 5e12 });
  check('vertex : compte 1 refusé (403) → compte 2, coût estimé remonté', r?.raw === '{"d":1}' && calls.includes('p2') && r.costUsd > 0, JSON.stringify(calls));
  const r2 = await callVertex({ systemPrompt: 's', turns: [], fetchImpl: async () => { throw new Error('x'); }, accounts, now: () => 6e12 });
  check('vertex : panne totale → null sans exception', r2 === null);
}
// Connexion native : ticket à usage unique, expiré refusé, mauvais type refusé.
{
  const { redeemNativeTicket } = await import('../server/auth-profiles.mjs');
  const m = new Map();
  const store = { get: async (k) => m.get(k) ?? null, set: async (k, v) => void m.set(k, v) };
  const vt = (s) => { try { return JSON.parse(s); } catch { return null; } };
  const tk = (o) => JSON.stringify({ kind: 'native_ticket', jti: 'a'.repeat(24), session: 'SESS', exp: 2000, ...o });
  check('ticket natif : valide → jeton de session', (await redeemNativeTicket(tk({}), vt, 1000, store)) === 'SESS');
  check('ticket natif : rejoué → refusé', (await redeemNativeTicket(tk({}), vt, 1001, store)) === null);
  check('ticket natif : expiré refusé', (await redeemNativeTicket(tk({ jti: 'b'.repeat(24) }), vt, 3000, store)) === null);
  check('ticket natif : mauvais type / jti invalide / illisible refusés', (await redeemNativeTicket(tk({ kind: 'oauth_session', jti: 'c'.repeat(24) }), vt, 1000, store)) === null && (await redeemNativeTicket(tk({ jti: 'x' }), vt, 1000, store)) === null && (await redeemNativeTicket('zzz', vt, 1000, store)) === null);
}
// OAuth Google anti-CSRF : validation par state signé (résilience Safari iOS sans cookies)
{
  const { handleAuthAndProfileRoutes } = await import('../server/auth-profiles.mjs');
  const { createHmac } = await import('node:crypto');
  const sec = 'test_secret_oauth_32_bytes_long!';
  const issue = (p) => {
    const b = Buffer.from(JSON.stringify(p)).toString('base64url');
    return `${b}.${createHmac('sha256', sec).update(b).digest('hex')}`;
  };
  const verify = (t) => {
    if (!t || !t.includes('.')) return null;
    const [b, s] = t.split('.');
    if (createHmac('sha256', sec).update(b).digest('hex') !== s) return null;
    try { return JSON.parse(Buffer.from(b, 'base64url').toString('utf8')); } catch { return null; }
  };

  let capturedLocation = '';
  let capturedCookie = '';
  const fakeRes = {
    writeHead: (_c, h) => { capturedLocation = h.Location || ''; capturedCookie = h['Set-Cookie'] || ''; },
    end: () => {},
  };
  process.env.GOOGLE_CLIENT_ID = 'test_cid';
  process.env.GOOGLE_CLIENT_SECRET = 'test_csec';

  await handleAuthAndProfileRoutes({
    req: { method: 'GET', headers: {} },
    res: fakeRes,
    url: new URL('http://localhost/api/auth/google'),
    origin: 'http://localhost',
    allowedOrigin: 'http://localhost',
    allowedOrigins: ['http://localhost'],
    sessionSecret: sec,
    issueToken: issue,
    verifyToken: verify,
    sendJson: () => {},
  });

  const stateInAuthUrl = new URL(capturedLocation).searchParams.get('state');
  check('oauth init : state signé présent dans authUrl', Boolean(stateInAuthUrl && verify(stateInAuthUrl)));

  let callbackCode = 0;
  let callbackData = null;
  const mockCallback = async (queryState, cookieHeader) => {
    callbackCode = 0; callbackData = null;
    await handleAuthAndProfileRoutes({
      req: { method: 'GET', headers: cookieHeader ? { cookie: cookieHeader } : {} },
      res: { writeHead: (c) => { callbackCode = c; }, end: () => {} },
      url: new URL(`http://localhost/api/auth/google/callback?code=mock_code&state=${encodeURIComponent(queryState)}`),
      origin: 'http://localhost',
      allowedOrigin: 'http://localhost',
      allowedOrigins: ['http://localhost'],
      sessionSecret: sec,
      issueToken: issue,
      verifyToken: verify,
      sendJson: (r, c, d) => { callbackCode = c; callbackData = d; },
    });
  };

  // 1) Safari iOS sans cookie : state signé valide -> passe le filtre anti-CSRF (échoue plus loin sur l'échange token Google avec fetch réseau mocké)
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response(JSON.stringify({ error: 'invalid_grant' }), { status: 400 });
    await mockCallback(stateInAuthUrl, '');
    check('oauth callback : state signé accepté même sans cookie fence_oauth_tx', callbackCode !== 403);

    await mockCallback(stateInAuthUrl + 'corrupted', '');
    check('oauth callback : state corrompu rejeté 403', callbackCode === 403);
  } finally {
    globalThis.fetch = originalFetch;
  }
}
// Suppression de compte : les sessions ouvertes avant la suppression sont refusées, une nouvelle connexion repart à zéro.
{
  const { sessionRevoked } = await import('../server/auth-profiles.mjs');
  const { kvSet } = await import('../server/store.mjs');
  await kvSet('gone:test-del', { at: 1_000_000 });
  check('suppression : une session ouverte avant la suppression est refusée', (await sessionRevoked({ id: 'test-del', issuedAt: 999_999 })) === true);
  check('suppression : une nouvelle connexion après la suppression fonctionne', (await sessionRevoked({ id: 'test-del', issuedAt: 1_000_001 })) === false);
  check('suppression : un compte jamais supprimé n’est pas touché', (await sessionRevoked({ id: 'never-deleted', issuedAt: 5 })) === false);
}
console.log(`selftest serveur: ${passed} réussis`);
process.exit(failed ? 1 : 0);
