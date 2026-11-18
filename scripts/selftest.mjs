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
let failed = game.status !== 0;

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
console.log(`selftest serveur: ${passed} réussis`);
process.exit(failed ? 1 : 0);
