/**
 * Batch portrait generator for THE FENCE.
 * Supports Street Fighter II multi-state portraits: calm (default), broken (defeated), furious (armed).
 * Uses Google Vertex AI Imagen 3 via Service Account JWT (no external deps, no hardcoded keys).
 *
 * Usage:
 *   VERTEX_SA_PATH=/Users/marc/Desktop/vertex/your-sa.json node scripts/generate-portraits.mjs
 *   Optional: MOOD=broken|furious|calm|all (default: calm)
 *   Optional: LIMIT=20 (generate first N missing portraits)
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SA_PATH = process.env.VERTEX_SA_PATH;
if (!SA_PATH) {
  throw new Error('Missing required environment variable: VERTEX_SA_PATH');
}

const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
const PROJECT_ID = sa.project_id;
const LOCATION = process.env.VERTEX_LOCATION || 'us-central1';
const LIMIT = Number(process.env.LIMIT || '100');
const TARGET_MOOD = process.env.MOOD || 'calm'; // 'calm' | 'broken' | 'furious' | 'all'
const OUT_DIR = path.resolve('public/assets/portraits/cast');
fs.mkdirSync(OUT_DIR, { recursive: true });

function b64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  );
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${claim}`);
  const signature = sign
    .sign(sa.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claim}.${signature}`,
    }),
  });
  if (!res.ok) throw new Error(`OAuth failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

// Parse portrait specs from src/data/cast.ts without needing TS compilation
function loadCastEntries() {
  const src = fs.readFileSync(path.resolve('src/data/cast.ts'), 'utf8');
  const entries = [];
  const tupleRe = /\['(c\d{3})',\s*'([^']+)',\s*'([^']+)',\s*'([mf])',\s*(\d+),\s*'([^']+)'[\s\S]*?'([^']+)'\]/g;
  let m;
  while ((m = tupleRe.exec(src)) !== null) {
    entries.push({ id: m[1], name: `${m[2]} ${m[3]}`, visual: m[7] });
  }
  return entries;
}

function buildPrompt(entry, mood) {
  if (mood === 'broken') {
    return `Dark neo-noir cinematic bust portrait illustration, ${entry.visual}, terrified and defeated expression, trembling in panic, cold sweat running down pale skin, wide desperate eyes, slumped defeated posture, Street Fighter II continue screen defeat aesthetic, sitting across a pawn shop counter at 3am, harsh cold desk lamp keylight, pure pitch black #000000 background, graphic novel realism, centered bust framing, no text, no watermark`;
  }
  if (mood === 'furious') {
    return `Dark neo-noir cinematic bust portrait illustration, ${entry.visual}, furious enraged expression, snarling with bared teeth, bulging veins on neck and forehead, drawing a concealed firearm from beneath coat, lethal menacing stance, sitting across a pawn shop counter at 3am, dramatic harsh red danger rimlight, pure pitch black #000000 background, gritty graphic novel realism, centered bust framing, no text, no watermark`;
  }
  return `Dark neo-noir cinematic bust portrait illustration, ${entry.visual}, calculating guarded expression, sitting across a pawn shop counter at 3am, single warm tungsten desk lamp keylight from above, pure pitch black #000000 background, gritty graphic novel realism, Rockstar Games concept art style, centered bust framing, no text, no watermark`;
}

async function generatePortrait(token, entry, mood = 'calm') {
  const filename = mood === 'calm' ? `${entry.id}.png` : `${entry.id}_${mood}.png`;
  const outPath = path.join(OUT_DIR, filename);
  if (fs.existsSync(outPath)) return 'skip';

  const prompt = buildPrompt(entry, mood);
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-generate-002:predict`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: '3:4', outputOptions: { mimeType: 'image/png' } },
    }),
  });
  if (!res.ok) {
    throw new Error(`Imagen failed for ${entry.id} [${mood}]: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  const b64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error(`No image bytes returned for ${entry.id} [${mood}]`);
  fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
  return 'generated';
}

const token = await getAccessToken();
const entries = loadCastEntries();
const moodsToRun = TARGET_MOOD === 'all' ? ['calm', 'broken', 'furious'] : [TARGET_MOOD];

console.log(`Loaded ${entries.length} cast specs. Moods: ${moodsToRun.join(', ')}. Generating up to ${LIMIT}...`);
let done = 0;
for (const entry of entries) {
  if (done >= LIMIT) break;
  for (const mood of moodsToRun) {
    if (done >= LIMIT) break;
    const status = await generatePortrait(token, entry, mood);
    if (status === 'generated') {
      done++;
      console.log(`[${done}/${LIMIT}] Generated ${entry.id}_${mood} (${entry.name})`);
    }
  }
}
console.log('Done.');
