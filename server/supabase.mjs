// Adaptateur Supabase universel : persistance durable en production (Vercel)
// avec repli transparent sur le filesystem local en dev ou hors-ligne.

const getUrl = () => process.env.SUPABASE_URL || '';
const getKey = () =>
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_KEY ||
  '';

export const isSupabaseConfigured = () => Boolean(getUrl() && getKey());

function getHeaders() {
  const key = getKey();
  return {
    'Content-Type': 'application/json',
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

/* ------------------------------------------------------------------ */
/* 1. Écosystème & Overrides Admin (Custom Items, Suspects, LLM Actif)*/
/* ------------------------------------------------------------------ */
export async function getEcosystemOverridesFromSupabase() {
  if (!isSupabaseConfigured()) return null;
  try {
    const res = await fetch(
      `${getUrl()}/rest/v1/ecosystem_overrides?id=eq.current&select=data`,
      { headers: getHeaders() },
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows?.[0]?.data || null;
  } catch {
    return null;
  }
}

export async function saveEcosystemOverridesToSupabase(data) {
  if (!isSupabaseConfigured()) return false;
  try {
    const res = await fetch(`${getUrl()}/rest/v1/ecosystem_overrides`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: 'current',
        data,
        updated_at: new Date().toISOString(),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* 2. Profils Joueurs (Google OAuth, Pass VIP, Progression)          */
/* ------------------------------------------------------------------ */
export async function getUserProfileFromSupabase(userId) {
  if (!isSupabaseConfigured()) return null;
  try {
    const res = await fetch(
      `${getUrl()}/rest/v1/player_profiles?user_id=eq.${encodeURIComponent(userId)}&select=profile`,
      { headers: getHeaders() },
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows?.[0]?.profile || null;
  } catch {
    return null;
  }
}

export async function saveUserProfileToSupabase(userId, profile) {
  if (!isSupabaseConfigured()) return false;
  try {
    const res = await fetch(`${getUrl()}/rest/v1/player_profiles`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        user_id: userId,
        profile,
        updated_at: new Date().toISOString(),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* 3. Classements Leaderboard (Contrat 24h & All-Time)                */
/* ------------------------------------------------------------------ */
export async function getLeaderboardFromSupabase() {
  if (!isSupabaseConfigured()) return null;
  try {
    const res = await fetch(`${getUrl()}/rest/v1/leaderboard?select=date_key,entries`, {
      headers: getHeaders(),
    });
    if (!res.ok) return null;
    const rows = await res.json();
    const map = {};
    for (const r of rows) {
      if (r.date_key) map[r.date_key] = r.entries || [];
    }
    return map;
  } catch {
    return null;
  }
}

export async function saveLeaderboardEntryToSupabase(dateKey, entries) {
  if (!isSupabaseConfigured()) return false;
  try {
    const res = await fetch(`${getUrl()}/rest/v1/leaderboard`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        date_key: dateKey,
        entries,
        updated_at: new Date().toISOString(),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
