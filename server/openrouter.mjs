// OpenRouter : modèles gratuits d'abord, puis modèles payants très bon marché, avec une 2e clé en repli.
// Les clés ne viennent que de l'environnement (OPENROUTER_API_KEY, OPENROUTER_API_KEY_FALLBACK), jamais du code.
const FREE = (process.env.OPENROUTER_FREE_MODELS || 'google/gemma-4-31b-it:free,google/gemma-4-26b-a4b-it:free').split(',').map((s) => s.trim()).filter(Boolean);
const PAID = (process.env.OPENROUTER_PAID_MODELS || 'deepseek/deepseek-v4-flash,google/gemma-4-26b-a4b-it').split(',').map((s) => s.trim()).filter(Boolean);
const TIMEOUT_MS = Number(process.env.OPENROUTER_TIMEOUT_MS || 8_000);
const MAX_ATTEMPTS = Number(process.env.OPENROUTER_MAX_ATTEMPTS || 5);

export const openRouterKeys = () => [process.env.OPENROUTER_API_KEY, process.env.OPENROUTER_API_KEY_FALLBACK].filter(Boolean);

/** Ordre d'essai : (clé 1 : gratuits puis payants), puis (clé 2 : gratuits puis payants). */
export function openRouterPlan(keys = openRouterKeys(), preferPaid = false) {
  const models = preferPaid ? [...PAID, ...FREE] : [...FREE, ...PAID];
  return keys.flatMap((key, k) => models.map((model) => ({ key, model, keyIndex: k, free: model.endsWith(':free') })));
}

// Un modèle gratuit saturé (429) ou muet est mis en pause quelques minutes pour ne pas être réessayé à chaque réplique.
const cooldown = new Map();
const COOLDOWN_MS = 3 * 60_000;

/** Renvoie { raw, model, costUsd, free } ou null si tout a échoué. Ne lève jamais. */
export async function callOpenRouter({ systemPrompt, turns, preferPaid = false, fetchImpl = fetch, now = Date.now }) {
  let attempts = 0;
  const dead = new Set(); // clés refusées (401/402) : on saute leurs modèles
  for (const step of openRouterPlan(openRouterKeys(), preferPaid)) {
    if (attempts >= MAX_ATTEMPTS) break;
    if (dead.has(step.keyIndex) || (cooldown.get(step.model) ?? 0) > now()) continue;
    attempts += 1;
    try {
      const res = await fetchImpl('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${step.key}`, 'X-Title': 'Cash Noir' },
        body: JSON.stringify({
          model: step.model,
          messages: [{ role: 'system', content: systemPrompt }, ...turns],
          temperature: 0.7,
          max_tokens: 400,
          response_format: { type: 'json_object' },
          usage: { include: true },
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (res.status === 401 || res.status === 402) {
        dead.add(step.keyIndex);
        continue;
      }
      if (!res.ok) {
        cooldown.set(step.model, now() + COOLDOWN_MS);
        continue;
      }
      const data = await res.json().catch(() => ({}));
      const raw = String(data?.choices?.[0]?.message?.content || '').trim();
      // Réponse inutilisable (vide ou pas du JSON) : modèle suivant.
      if (!raw.includes('{')) {
        cooldown.set(step.model, now() + COOLDOWN_MS);
        continue;
      }
      return { raw, model: step.model, free: step.free, costUsd: Number(data?.usage?.cost) || 0 };
    } catch {
      cooldown.set(step.model, now() + COOLDOWN_MS);
    }
  }
  return null;
}
