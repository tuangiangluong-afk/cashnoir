// Petite mémoire durable clé→JSON : Supabase (table player_profiles existante, clés préfixées) quand il est configuré,
// sinon mémoire du processus. Sur Vercel (sans état), c'est ce qui garde quotas et abonnements entre deux requêtes.
import { getUserProfileFromSupabase, saveUserProfileToSupabase, isSupabaseConfigured } from './supabase.mjs';

const mem = new Map(); // key -> { v, at }
const TTL_MS = 30_000; // relit la base au plus toutes les 30 s (les révocations d'abonnement se voient vite)

export async function kvGet(key, { fresh = false } = {}) {
  const hit = mem.get(key);
  if (hit && (!isSupabaseConfigured() || (!fresh && Date.now() - hit.at < TTL_MS))) return hit.v;
  if (!isSupabaseConfigured()) return null;
  const remote = await getUserProfileFromSupabase(key);
  if (remote) mem.set(key, { v: remote, at: Date.now() });
  return remote ?? hit?.v ?? null;
}

export async function kvSet(key, value) {
  mem.set(key, { v: value, at: Date.now() });
  if (isSupabaseConfigured()) await saveUserProfileToSupabase(key, value);
}
