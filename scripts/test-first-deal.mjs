import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

test('first deal initializes a new shop once and preserves returning careers', async () => {
  const cwd = process.cwd();
  const scratch = mkdtempSync(join(tmpdir(), 'cashnoir-first-deal-'));
  const env = { VERCEL: process.env.VERCEL, SUPABASE_URL: process.env.SUPABASE_URL };
  try {
    process.chdir(scratch);
    delete process.env.VERCEL;
    delete process.env.SUPABASE_URL;
    const { handleAuthAndProfileRoutes } = await import('../server/auth-profiles.mjs');
    const call = async (path, method, body, signedIn = true) => {
      let result;
      await handleAuthAndProfileRoutes({
        url: new URL(path, 'https://example.test'), req: { method, headers: signedIn ? { authorization: 'Bearer fixture' } : {} },
        verifyToken: () => ({ kind: 'oauth_session', userId: 'google_firstdeal', exp: Date.now() + 10000 }),
        readJson: async () => body, sendJson: (_, status, data) => { result = { status, data }; },
      });
      return result;
    };
    const claim = (price, signedIn) => call('/api/profile/first-deal', 'POST', { price }, signedIn);
    assert.equal((await claim(600, false)).status, 401);
    assert.equal((await claim(1)).status, 400);
    const results = await Promise.all([claim(600), claim(800)]);
    const opening = results[0].data.profile;
    assert.deepEqual(results[1].data.profile, opening);
    assert.equal(opening.inventory.length, 1);
    assert.equal(opening.cash + opening.inventory[0].paid, 2500);
    await call('/api/profile', 'POST', { ...opening, day: 7, cash: 987, inventory: [] });
    const returning = (await claim(600)).data.profile;
    assert.equal(returning.day, 7);
    assert.equal(returning.cash, 987);
    assert.deepEqual(returning.inventory, []);
  } finally {
    process.chdir(cwd);
    for (const [key, value] of Object.entries(env)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    rmSync(scratch, { recursive: true, force: true });
  }
});
