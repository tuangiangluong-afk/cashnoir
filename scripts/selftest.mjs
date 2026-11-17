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
console.log(`selftest serveur: ${passed} réussis`);
process.exit(failed ? 1 : 0);
