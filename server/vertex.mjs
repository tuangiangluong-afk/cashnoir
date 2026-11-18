// Vertex AI (Gemini) en dernier recours, avec des comptes de service Google Cloud (crédits gratuits).
// Les comptes viennent de l'environnement : VERTEX_SA_1, VERTEX_SA_2 = JSON du compte de service encodé en base64.
import crypto from 'node:crypto';

const MODELS = (process.env.VERTEX_MODELS || 'gemini-3.1-flash-lite,gemini-3.5-flash-lite').split(',').map((s) => s.trim()).filter(Boolean);
const TIMEOUT_MS = Number(process.env.VERTEX_TIMEOUT_MS || 10_000);
const PRICE_IN = Number(process.env.VERTEX_PRICE_IN || 0.1) / 1e6; // $ par token, estimation (tarif à confirmer sur ta facture)
const PRICE_OUT = Number(process.env.VERTEX_PRICE_OUT || 0.4) / 1e6;

export function vertexAccounts(env = process.env) {
  const out = [];
  for (const k of ['VERTEX_SA_1', 'VERTEX_SA_2', 'VERTEX_SA_3']) {
    if (!env[k]) continue;
    try {
      const sa = JSON.parse(Buffer.from(env[k], 'base64').toString('utf8'));
      if (sa.private_key && sa.client_email && sa.project_id) out.push(sa);
    } catch {
      /* compte illisible : ignoré */
    }
  }
  return out;
}

const b64u = (b) => Buffer.from(b).toString('base64url');
const tokens = new Map(); // client_email -> { token, exp }

async function accessToken(sa, fetchImpl, now) {
  const hit = tokens.get(sa.client_email);
  if (hit && hit.exp > now() + 60_000) return hit.token;
  const iat = Math.floor(now() / 1000);
  const head = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64u(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/cloud-platform', aud: 'https://oauth2.googleapis.com/token', iat, exp: iat + 3600 }));
  const sig = crypto.createSign('RSA-SHA256').update(`${head}.${claim}`).sign(sa.private_key, 'base64url');
  const res = await fetchImpl('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${claim}.${sig}` }).toString(),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) throw new Error('token');
  tokens.set(sa.client_email, { token: data.access_token, exp: now() + (data.expires_in || 3600) * 1000 });
  return data.access_token;
}

const cooldown = new Map();
const COOLDOWN_MS = 3 * 60_000;

/** Renvoie { raw, model, costUsd } ou null si tout a échoué. Ne lève jamais. */
export async function callVertex({ systemPrompt, turns, fetchImpl = fetch, now = Date.now, accounts = vertexAccounts() }) {
  for (const sa of accounts) {
    for (const model of MODELS) {
      const id = `${sa.project_id}|${model}`;
      if ((cooldown.get(id) ?? 0) > now()) continue;
      try {
        const token = await accessToken(sa, fetchImpl, now);
        const res = await fetchImpl(`https://aiplatform.googleapis.com/v1/projects/${sa.project_id}/locations/global/publishers/google/models/${encodeURIComponent(model)}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: turns.map((t) => ({ role: t.role === 'user' ? 'user' : 'model', parts: [{ text: t.content }] })),
            generationConfig: { temperature: 0.7, responseMimeType: 'application/json', maxOutputTokens: 400, thinkingConfig: { thinkingBudget: 0 } },
          }),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (!res.ok) {
          cooldown.set(id, now() + COOLDOWN_MS);
          continue;
        }
        const data = await res.json().catch(() => ({}));
        const raw = String(data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
        if (!raw.includes('{')) {
          cooldown.set(id, now() + COOLDOWN_MS);
          continue;
        }
        const u = data?.usageMetadata || {};
        return { raw, model, costUsd: (u.promptTokenCount || 0) * PRICE_IN + (u.candidatesTokenCount || 0) * PRICE_OUT };
      } catch {
        cooldown.set(id, now() + COOLDOWN_MS);
      }
    }
  }
  return null;
}
