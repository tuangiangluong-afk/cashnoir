import { spawn } from 'node:child_process';
import { join } from 'node:path';

const PORT = 3099;
const root = process.cwd();
const env = {
  ...process.env,
  PORT: String(PORT),
  SESSION_SECRET: 'test-admin-secret-2026',
  ADMIN_PASSWORD: 'test-syndicate-secret-admin',
  TRUST_PROXY: '1',
  ALLOWED_ORIGIN: `http://127.0.0.1:${PORT}`,
};

const server = spawn(process.execPath, ['server/index.mjs'], { env, cwd: root, stdio: 'inherit' });
await new Promise((r) => setTimeout(r, 1200));

const B = `http://127.0.0.1:${PORT}`;
let cookie = '';

try {
  // 1. GET /api/ecosystem (public)
  const ecoRes = await fetch(`${B}/api/ecosystem`);
  const ecoData = await ecoRes.json();
  if (!ecoData.items || ecoData.items.length < 200) throw new Error('Ecosystem items missing');
  if (!ecoData.characters || ecoData.characters.length < 90) throw new Error('Ecosystem characters missing');
  console.log(`✓ GET /api/ecosystem returns ${ecoData.items.length} items & ${ecoData.characters.length} characters`);

  // 2. POST /api/admin/login with bad password -> 401
  const badLogin = await fetch(`${B}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'wrong-password' }),
  });
  if (badLogin.status !== 401) throw new Error(`Expected 401 on bad login, got ${badLogin.status}`);
  console.log('✓ Bad password rejected with 401');

  // 3. POST /api/admin/login with good password -> 200 + cookie
  const goodLogin = await fetch(`${B}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'test-syndicate-secret-admin' }),
  });
  if (goodLogin.status !== 200) throw new Error(`Expected 200 on good login, got ${goodLogin.status}`);
  const setCookie = goodLogin.headers.get('set-cookie');
  if (!setCookie || !setCookie.includes('fence_admin_session')) throw new Error('Cookie fence_admin_session not set');
  cookie = setCookie.split(';')[0];
  console.log('✓ Admin login successful with cookie session');

  // 4. GET /api/admin/ecosystem with cookie
  const authEcoRes = await fetch(`${B}/api/admin/ecosystem`, {
    headers: { Cookie: cookie },
  });
  if (authEcoRes.status !== 200) throw new Error(`Expected 200 for authenticated ecosystem, got ${authEcoRes.status}`);
  console.log('✓ GET /api/admin/ecosystem authorized');

  // 5. POST /api/admin/items (create new custom item)
  const createItem = await fetch(`${B}/api/admin/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      id: 'custom_test_watch',
      name: 'Rolex Submariner Ghost Edition',
      category: 'Horlogerie',
      baseValue: 18500,
      description: 'Montre automatique en titane sablé avec numéro de série limé.',
      loupeClue: 'Le mouvement 3230 tourne à 28800 A/h avec une gravure laser artisanale.',
      uvClue: 'Micro-tampon UV du cartel de Genève sous le bracelet.',
      hotLevel: 3,
    }),
  });
  if (createItem.status !== 200) throw new Error(`Expected 200 on item create, got ${createItem.status}`);
  console.log('✓ Custom item created successfully');

  // 6. POST /api/admin/characters (edit character personality)
  const editChar = await fetch(`${B}/api/admin/characters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      id: 'c001',
      fullName: 'Viktor Kaelen (Overridden)',
      job: 'Maître Faussaire',
      secret: 'A un compte offshore secret au Luxembourg.',
      weaknessHint: 'Panique si on mentionne son frère en taule.',
      redLineHint: 'Ne tolère aucun manque de respect sur son art.',
      weakKeywords: 'frère|taule|prison',
      angerKeywords: 'toquard|amateur|escroc',
    }),
  });
  if (editChar.status !== 200) throw new Error(`Expected 200 on character edit, got ${editChar.status}`);
  console.log('✓ Character personality updated');

  // 7. Verify modifications are reflected in /api/ecosystem
  const verifyRes = await fetch(`${B}/api/ecosystem`);
  const verifyData = await verifyRes.json();
  const foundItem = verifyData.items.find((it) => it.id === 'custom_test_watch');
  if (!foundItem || foundItem.baseValue !== 18500) throw new Error('Custom item not found in ecosystem');
  const foundChar = verifyData.characters.find((c) => c.id === 'c001');
  if (!foundChar || foundChar.fullName !== 'Viktor Kaelen (Overridden)') throw new Error('Overridden character not found in ecosystem');
  console.log('✓ Dynamic overrides correctly merged in ecosystem');

  // 8. Gate 20 File upload test
  // 8a. Fake file (bad magic bytes) -> 400
  const fakeUpload = await fetch(`${B}/api/admin/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      filename: 'exploit.php.png',
      dataBase64: Buffer.from('<?php echo "pwned"; ?>').toString('base64'),
    }),
  });
  if (fakeUpload.status !== 400) throw new Error(`Expected 400 on fake upload magic bytes, got ${fakeUpload.status}`);
  console.log('✓ Gate 20: Fake image payload rejected via magic bytes header check');

  // 8b. Real 1x1 transparent PNG magic bytes -> 200
  const validPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const goodUpload = await fetch(`${B}/api/admin/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      filename: 'test-admin-portrait.png',
      dataBase64: validPngBase64,
      folder: 'portraits',
    }),
  });
  if (goodUpload.status !== 200) throw new Error(`Expected 200 on valid upload, got ${goodUpload.status}`);
  const uploadResult = await goodUpload.json();
  if (!uploadResult.url.startsWith('/assets/portraits/cast/') && !uploadResult.url.startsWith('/assets/uploads/')) {
    throw new Error(`Unexpected upload URL: ${uploadResult.url}`);
  }
  console.log(`✓ Gate 20: Valid PNG image uploaded to ${uploadResult.url}`);

  // 9. Reset overrides to keep workspace clean
  const resetRes = await fetch(`${B}/api/admin/reset`, {
    method: 'POST',
    headers: { Cookie: cookie },
  });
  if (resetRes.status !== 200) throw new Error('Failed to reset overrides');
  console.log('✓ Overrides reset cleanly');

  console.log('\nALL 9 ADMIN BACKEND TESTS PASSED 100%!');
} finally {
  server.kill('SIGTERM');
}
