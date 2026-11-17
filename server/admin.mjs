import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/* ------------------------------------------------------------------ */
/* Constantes, chemins et sécurité                                    */
/* ------------------------------------------------------------------ */
const DATA_DIR = path.resolve('server/data/ecosystem');
fs.mkdirSync(DATA_DIR, { recursive: true });

const UPLOADS_DIR = path.resolve('public/assets/uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const DEFAULTS_FILE = path.join(DATA_DIR, 'defaults.json');
const FALLBACK_DEFAULTS_FILE = path.resolve('server/ecosystem-defaults.json');
const OVERRIDES_FILE = path.join(DATA_DIR, 'overrides.json');

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ||
  process.env.ADMIN_KEY ||
  'cashnoir-syndicate-admin-2026';

const VALID_CATEGORIES = [
  'Données',
  'Joaillerie',
  'Horlogerie',
  'Art',
  'Reliques',
  'Armement',
  'Métaux',
];

const VALID_PROFILES = [
  'gambler',
  'exec',
  'cop',
  'rich_kid',
  'broker',
  'smuggler',
  'heiress',
  'priest',
  'hacker',
];

/* ------------------------------------------------------------------ */
/* Rate limiter sur /api/admin/login (Gate 04 : anti-bruteforce)      */
/* ------------------------------------------------------------------ */
const loginRateLimit = new Map();
function checkLoginRateLimit(ip) {
  const now = Date.now();
  const entry = loginRateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    loginRateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count += 1;
  return true;
}

// Purge périodique
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of loginRateLimit) {
    if (now >= entry.resetAt) loginRateLimit.delete(ip);
  }
}, 60_000).unref();

/* ------------------------------------------------------------------ */
/* Lecture et écriture du stockage des modifications                  */
/* ------------------------------------------------------------------ */
function getEmptyOverrides() {
  return {
    customItems: [],
    customCharacters: [],
    modifiedItems: {},
    modifiedCharacters: {},
    modifiedArchetypes: {},
    customSeasons: [],
    deletedItemIds: [],
    deletedCharacterIds: [],
    systemConfig: {},
  };
}

function loadOverrides() {
  try {
    if (!fs.existsSync(OVERRIDES_FILE)) return getEmptyOverrides();
    const raw = fs.readFileSync(OVERRIDES_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return { ...getEmptyOverrides(), ...parsed };
  } catch {
    return getEmptyOverrides();
  }
}

function saveOverrides(data) {
  fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function loadDefaults() {
  try {
    if (fs.existsSync(DEFAULTS_FILE)) {
      return JSON.parse(fs.readFileSync(DEFAULTS_FILE, 'utf8'));
    }
    if (fs.existsSync(FALLBACK_DEFAULTS_FILE)) {
      return JSON.parse(fs.readFileSync(FALLBACK_DEFAULTS_FILE, 'utf8'));
    }
  } catch {
    // Fichier absent ou corrompu
  }
  return {
    categories: VALID_CATEGORIES,
    factions: [],
    archetypes: [],
    items: [],
    characters: [],
    seasons: [],
  };
}

/* ------------------------------------------------------------------ */
/* Fusion des données de base et des surcharges (Ecosystem View)      */
/* ------------------------------------------------------------------ */
export function getEcosystemData() {
  const defaults = loadDefaults();
  const overrides = loadOverrides();

  // 1. Objets
  const deletedItemSet = new Set(overrides.deletedItemIds || []);
  const baseItems = (defaults.items || [])
    .filter((it) => !deletedItemSet.has(it.id))
    .map((it) => {
      const mod = overrides.modifiedItems?.[it.id];
      return mod ? { ...it, ...mod, isModified: true } : it;
    });
  const items = [...baseItems, ...(overrides.customItems || []).map((it) => ({ ...it, isCustom: true }))];

  // 2. Personnages
  const deletedCharSet = new Set(overrides.deletedCharacterIds || []);
  const baseChars = (defaults.characters || [])
    .filter((c) => !deletedCharSet.has(c.id))
    .map((c) => {
      const mod = overrides.modifiedCharacters?.[c.id];
      return mod ? { ...c, ...mod, isModified: true } : c;
    });
  const characters = [
    ...baseChars,
    ...(overrides.customCharacters || []).map((c) => ({ ...c, isCustom: true })),
  ];

  // 3. Archetypes (Psychologie)
  const archetypes = (defaults.archetypes || []).map((arch) => {
    const mod = overrides.modifiedArchetypes?.[arch.id];
    return mod ? { ...arch, ...mod, isModified: true } : arch;
  });

  // 4. Saisons
  const seasons =
    overrides.customSeasons && overrides.customSeasons.length > 0
      ? overrides.customSeasons
      : defaults.seasons || [];

  return {
    version: '1.0.0',
    categories: defaults.categories || VALID_CATEGORIES,
    factions: defaults.factions || [],
    archetypes,
    items,
    characters,
    seasons,
    systemConfig: overrides.systemConfig || {},
    stats: {
      totalItems: items.length,
      customItemsCount: (overrides.customItems || []).length,
      totalCharacters: characters.length,
      customCharactersCount: (overrides.customCharacters || []).length,
      totalArchetypes: archetypes.length,
      totalSeasons: seasons.length,
      categoriesCount: VALID_CATEGORIES.length,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Authentification Admin (Gate 01, Gate 02)                          */
/* ------------------------------------------------------------------ */
function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    try {
      out[k] = decodeURIComponent(v);
    } catch {
      out[k] = v;
    }
  }
  return out;
}

function verifyAdmin(req, verifyToken) {
  // Option 1 : En-tête X-Admin-Key ou Bearer Token (idéal pour CLI et intégration)
  const headerKey = req.headers['x-admin-key'];
  if (headerKey && typeof headerKey === 'string' && headerKey === ADMIN_PASSWORD) {
    return { role: 'admin', authType: 'header' };
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token === ADMIN_PASSWORD) return { role: 'admin', authType: 'bearer' };
  }

  // Option 2 : Cookie de session httpOnly signé
  const cookies = parseCookies(req);
  const sessionToken = cookies.fence_admin_session;
  if (!sessionToken) return null;

  const claims = verifyToken(sessionToken);
  if (
    claims &&
    claims.kind === 'admin_session' &&
    claims.role === 'admin' &&
    claims.exp > Date.now()
  ) {
    return { role: 'admin', authType: 'cookie' };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Validation Magique de Fichier (Gate 20 Hardening)                   */
/* ------------------------------------------------------------------ */
function validateImageMagicBytes(buffer) {
  if (!buffer || buffer.length < 8) return null;
  // PNG: 89 50 4e 47 0d 0a 1a 0a
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { ext: 'png', mime: 'image/png' };
  }
  // JPEG: ff d8 ff
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: 'jpg', mime: 'image/jpeg' };
  }
  // WEBP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x41 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { ext: 'webp', mime: 'image/webp' };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Routeur API Back-Office (/api/admin/*)                             */
/* ------------------------------------------------------------------ */
export async function handleAdminRoutes(ctx) {
  const { req, res, url, sendJson, readJson, readBody, issueToken, verifyToken, clientIp } = ctx;
  const pathname = url.pathname;

  // 1. Route publique de synchronisation écosystème
  if (req.method === 'GET' && pathname === '/api/ecosystem') {
    const data = getEcosystemData();
    sendJson(res, 200, {
      items: data.items,
      characters: data.characters,
      archetypes: data.archetypes,
      seasons: data.seasons,
      factions: data.factions,
      categories: data.categories,
      systemConfig: data.systemConfig,
    });
    return true;
  }

  // Routes sous /api/admin
  if (!pathname.startsWith('/api/admin')) return false;

  const isHttps =
    req.socket?.encrypted ||
    String(req.headers['x-forwarded-proto'] || '').toLowerCase() === 'https';

  // 2. Connexion Administrateur (/api/admin/login)
  if (req.method === 'POST' && pathname === '/api/admin/login') {
    const ip = clientIp(req);
    if (!checkLoginRateLimit(ip)) {
      sendJson(res, 429, {
        error: 'Trop de tentatives de connexion. Réessaie dans une minute.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
      return true;
    }

    const body = await readJson(req);
    const password = String(body?.password || '').trim();

    if (!password || password !== ADMIN_PASSWORD) {
      sendJson(res, 401, {
        error: 'Mot de passe administrateur incorrect.',
        code: 'INVALID_CREDENTIALS',
      });
      return true;
    }

    const token = issueToken({
      kind: 'admin_session',
      role: 'admin',
      exp: Date.now() + 24 * 3600 * 1000, // 24h
    });

    const cookieHeader = `fence_admin_session=${encodeURIComponent(
      token,
    )}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${isHttps ? '; Secure' : ''}`;

    sendJson(
      res,
      200,
      { success: true, message: 'Accès administrateur déverrouillé.' },
      { 'Set-Cookie': cookieHeader },
    );
    return true;
  }

  // 3. Déconnexion Administrateur (/api/admin/logout)
  if (req.method === 'POST' && pathname === '/api/admin/logout') {
    const cookieHeader = `fence_admin_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${
      isHttps ? '; Secure' : ''
    }`;
    sendJson(res, 200, { success: true }, { 'Set-Cookie': cookieHeader });
    return true;
  }

  // 4. Vérification de statut de session (/api/admin/check)
  if (req.method === 'GET' && pathname === '/api/admin/check') {
    const auth = verifyAdmin(req, verifyToken);
    sendJson(res, 200, {
      authenticated: Boolean(auth),
      role: auth ? 'admin' : null,
    });
    return true;
  }

  // 5. TOUTES LES AUTRES ROUTES /api/admin/* SONT STRICTEMENT PROTÉGÉES (Gate 01)
  const auth = verifyAdmin(req, verifyToken);
  if (!auth) {
    sendJson(res, 401, {
      error: 'Accès administrateur requis.',
      code: 'UNAUTHORIZED',
    });
    return true;
  }

  // ===================== CRUD & GESTION ECOSYSTEME =====================

  // Aperçu & Données complètes
  if (req.method === 'GET' && pathname === '/api/admin/ecosystem') {
    const data = getEcosystemData();
    sendJson(res, 200, data);
    return true;
  }

  // CRUD Objets
  if (pathname === '/api/admin/items') {
    const overrides = loadOverrides();

    // GET : Liste complète des objets
    if (req.method === 'GET') {
      const eco = getEcosystemData();
      sendJson(res, 200, { items: eco.items, categories: VALID_CATEGORIES });
      return true;
    }

    // POST : Ajouter ou modifier un objet
    if (req.method === 'POST') {
      const body = await readJson(req);
      const name = String(body.name || '').trim();
      const category = String(body.category || '').trim();
      const baseValue = Number(body.baseValue || 0);
      const hotLevel = body.hotLevel === 'TIÈDE' ? 'TIÈDE' : 'BRÛLANT';
      const surfaceDesc = String(body.surfaceDesc || '').trim();
      const clues = Array.isArray(body.clues)
        ? body.clues.map((c) => String(c).trim()).filter(Boolean)
        : [String(body.clue || '').trim()].filter(Boolean);
      const uvClues = Array.isArray(body.uvClues)
        ? body.uvClues.map((u) => String(u).trim()).filter(Boolean)
        : [String(body.uv || '').trim()].filter(Boolean);

      if (!name || !category || baseValue <= 0) {
        sendJson(res, 400, { error: 'Nom, catégorie et valeur requis.' });
        return true;
      }
      if (!VALID_CATEGORIES.includes(category)) {
        sendJson(res, 400, {
          error: `Catégorie invalide. Choix: ${VALID_CATEGORIES.join(', ')}`,
        });
        return true;
      }

      const id = body.id ? String(body.id) : `custom_item_${Date.now()}`;
      const defaults = loadDefaults();
      const isDefault = (defaults.items || []).some((it) => it.id === id);

      const itemPayload = {
        id,
        name,
        category,
        baseValue,
        hotLevel,
        surfaceDesc,
        clues: clues.length ? clues : ['Aucun indice particulier.'],
        uvClues: uvClues.length ? uvClues : ['Aucune réaction sous UV.'],
        clueTag: body.clueTag ? String(body.clueTag) : name,
      };

      if (isDefault) {
        overrides.modifiedItems[id] = itemPayload;
      } else {
        const existingIdx = overrides.customItems.findIndex((it) => it.id === id);
        if (existingIdx >= 0) {
          overrides.customItems[existingIdx] = { ...itemPayload, isCustom: true };
        } else {
          overrides.customItems.push({ ...itemPayload, isCustom: true });
        }
      }

      saveOverrides(overrides);
      sendJson(res, 200, { success: true, item: itemPayload });
      return true;
    }

    // DELETE : Supprimer ou réinitialiser un objet
    if (req.method === 'DELETE') {
      const id = String(url.searchParams.get('id') || '');
      if (!id) {
        sendJson(res, 400, { error: 'ID requis.' });
        return true;
      }

      const defaults = loadDefaults();
      const isDefault = (defaults.items || []).some((it) => it.id === id);

      if (isDefault) {
        // Marquer comme supprimé et nettoyer les modifications
        delete overrides.modifiedItems[id];
        if (!overrides.deletedItemIds.includes(id)) {
          overrides.deletedItemIds.push(id);
        }
      } else {
        overrides.customItems = overrides.customItems.filter((it) => it.id !== id);
      }

      saveOverrides(overrides);
      sendJson(res, 200, { success: true, deletedId: id });
      return true;
    }
  }

  // CRUD Personnages (avec personnalités, failles et répliques)
  if (pathname === '/api/admin/characters') {
    const overrides = loadOverrides();

    // GET : Liste de tous les personnages
    if (req.method === 'GET') {
      const eco = getEcosystemData();
      sendJson(res, 200, { characters: eco.characters });
      return true;
    }

    // POST : Créer ou éditer un personnage
    if (req.method === 'POST') {
      const body = await readJson(req);
      const firstName = String(body.firstName || '').trim();
      const fullName = String(body.fullName || body.name || '').trim();
      const gender = body.gender === 'f' ? 'f' : 'm';
      const age = Number(body.age || 35);
      const job = String(body.job || '').trim();
      const faction = String(body.faction || 'Docks du Nord').trim();
      const profileId = VALID_PROFILES.includes(body.profileId) ? body.profileId : 'gambler';

      // Psychologie & Personnalité
      const secret = String(body.secret || '').trim();
      const weaknessHint = String(body.weaknessHint || '').trim();
      const redLineHint = String(body.redLineHint || '').trim();
      const weakKeywords = String(body.weakKeywords || '').trim();
      const angerKeywords = String(body.angerKeywords || '').trim();
      const openingTemplate = String(body.openingTemplate || body.opening || '').trim();
      const tell = String(body.tell || '').trim();
      const portraitVisual = String(body.portraitVisual || '').trim();
      const portraitUrl = String(body.portraitUrl || '').trim();

      if (!fullName) {
        sendJson(res, 400, { error: 'Le nom du personnage est requis.' });
        return true;
      }

      const id = body.id ? String(body.id) : `custom_c_${Date.now()}`;
      const defaults = loadDefaults();
      const isDefault = (defaults.characters || []).some((c) => c.id === id);

      const charPayload = {
        id,
        firstName: firstName || fullName.split(' ')[0],
        fullName,
        gender,
        age,
        job: job || 'Contact clandestin',
        faction,
        profileId,
        secret: secret || 'Aucun secret enregistré.',
        weaknessHint: weaknessHint || 'Sensible à la pression policière.',
        redLineHint: redLineHint || 'Déteste qu’on remette en doute sa parole.',
        weakKeywords: weakKeywords || 'police|flic|preuve|dette',
        angerKeywords: angerKeywords || 'idiot|menteur|escroc',
        openingTemplate:
          openingTemplate ||
          'Prends {item} pour {price} $ cash tout de suite, sans poser de questions.',
        tell: tell || (gender === 'f' ? 'Elle jette un regard méfiant vers la vitre.' : 'Il tapote nerveusement le zinc.'),
        portraitVisual: portraitVisual || `${age}yo suspect in dark coat`,
        portraitUrl: portraitUrl || `/assets/portraits/cast/${isDefault ? id : 'c001'}.webp`,
      };

      if (isDefault) {
        overrides.modifiedCharacters[id] = charPayload;
      } else {
        const existingIdx = overrides.customCharacters.findIndex((c) => c.id === id);
        if (existingIdx >= 0) {
          overrides.customCharacters[existingIdx] = { ...charPayload, isCustom: true };
        } else {
          overrides.customCharacters.push({ ...charPayload, isCustom: true });
        }
      }

      saveOverrides(overrides);
      sendJson(res, 200, { success: true, character: charPayload });
      return true;
    }

    // DELETE : Supprimer ou réinitialiser un personnage
    if (req.method === 'DELETE') {
      const id = String(url.searchParams.get('id') || '');
      if (!id) {
        sendJson(res, 400, { error: 'ID requis.' });
        return true;
      }

      const defaults = loadDefaults();
      const isDefault = (defaults.characters || []).some((c) => c.id === id);

      if (isDefault) {
        delete overrides.modifiedCharacters[id];
        if (!overrides.deletedCharacterIds.includes(id)) {
          overrides.deletedCharacterIds.push(id);
        }
      } else {
        overrides.customCharacters = overrides.customCharacters.filter((c) => c.id !== id);
      }

      saveOverrides(overrides);
      sendJson(res, 200, { success: true, deletedId: id });
      return true;
    }
  }

  // Personnalités de base (Archetypes / Psychology Tuning)
  if (pathname === '/api/admin/archetypes') {
    const overrides = loadOverrides();

    if (req.method === 'GET') {
      const eco = getEcosystemData();
      sendJson(res, 200, { archetypes: eco.archetypes });
      return true;
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const id = String(body.id || '');
      if (!VALID_PROFILES.includes(id)) {
        sendJson(res, 400, { error: 'Profil invalide.' });
        return true;
      }

      overrides.modifiedArchetypes[id] = {
        id,
        label: body.label,
        trait: body.trait,
        weaknessHint: body.weaknessHint,
        redLineHint: body.redLineHint,
        baseGauges: {
          peur: Math.min(100, Math.max(0, Number(body.baseGauges?.peur ?? 25))),
          colere: Math.min(100, Math.max(0, Number(body.baseGauges?.colere ?? 20))),
          mefiance: Math.min(100, Math.max(0, Number(body.baseGauges?.mefiance ?? 50))),
        },
        fearBonus: Number(body.fearBonus ?? 20),
        angerPenalty: Number(body.angerPenalty ?? 15),
        weakKeywords: body.weakKeywords,
        angerKeywords: body.angerKeywords,
        openings: Array.isArray(body.openings) ? body.openings : undefined,
        tells: Array.isArray(body.tells) ? body.tells : undefined,
      };

      saveOverrides(overrides);
      sendJson(res, 200, { success: true, archetype: overrides.modifiedArchetypes[id] });
      return true;
    }
  }

  // Saisons & Pass Clandestin
  if (pathname === '/api/admin/seasons') {
    const overrides = loadOverrides();

    if (req.method === 'GET') {
      const eco = getEcosystemData();
      sendJson(res, 200, { seasons: eco.seasons });
      return true;
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      if (Array.isArray(body.seasons)) {
        overrides.customSeasons = body.seasons;
      } else if (body.season) {
        const s = body.season;
        const idx = overrides.customSeasons.findIndex(
          (ex) => ex.seasonNumber === s.seasonNumber,
        );
        if (idx >= 0) overrides.customSeasons[idx] = s;
        else overrides.customSeasons.push(s);
      }
      saveOverrides(overrides);
      sendJson(res, 200, { success: true, seasons: overrides.customSeasons });
      return true;
    }
  }

  // Upload sécurisé d'image (Gate 20)
  if (req.method === 'POST' && pathname === '/api/admin/upload') {
    try {
      const body = await readJson(req);
      const base64Data = String(body.data || body.dataBase64 || body.image || '').replace(
        /^data:image\/\w+;base64,/,
        '',
      );
      if (!base64Data) {
        sendJson(res, 400, { error: 'Données base64 requises.' });
        return true;
      }

      const buffer = Buffer.from(base64Data, 'base64');
      if (buffer.length > 5 * 1024 * 1024) {
        sendJson(res, 413, { error: 'Fichier trop volumineux (max 5 Mo).' });
        return true;
      }

      const fileInfo = validateImageMagicBytes(buffer);
      if (!fileInfo) {
        sendJson(res, 400, {
          error: 'Format invalide. Formats acceptés : WEBP, PNG, JPEG.',
        });
        return true;
      }

      const folderChoice = body.folder === 'portraits' ? 'portraits' : 'uploads';
      const targetDir =
        folderChoice === 'portraits'
          ? path.resolve('public/assets/portraits/cast')
          : UPLOADS_DIR;
      fs.mkdirSync(targetDir, { recursive: true });

      const safeName = String(body.filename || 'asset')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_')
        .slice(0, 32);
      const filename = `${safeName}_${crypto.randomBytes(4).toString('hex')}.${fileInfo.ext}`;
      const filePath = path.join(targetDir, filename);

      fs.writeFileSync(filePath, buffer);

      const publicUrl =
        folderChoice === 'portraits'
          ? `/assets/portraits/cast/${filename}`
          : `/assets/uploads/${filename}`;

      sendJson(res, 200, {
        success: true,
        url: publicUrl,
        size: buffer.length,
        mime: fileInfo.mime,
      });
      return true;
    } catch (e) {
      sendJson(res, 500, { error: `Échec upload : ${e.message}` });
      return true;
    }
  }

  // Export complet de l'écosystème en JSON
  if (req.method === 'GET' && pathname === '/api/admin/export') {
    const data = getEcosystemData();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="cashnoir-ecosystem-${new Date().toISOString().slice(0, 10)}.json"`,
    );
    res.writeHead(200);
    res.end(JSON.stringify(data, null, 2));
    return true;
  }

  // Import / Restauration d'un backup JSON
  if (req.method === 'POST' && pathname === '/api/admin/import') {
    const body = await readJson(req);
    if (!body || typeof body !== 'object') {
      sendJson(res, 400, { error: 'Payload JSON invalide.' });
      return true;
    }
    const overrides = getEmptyOverrides();
    if (Array.isArray(body.items)) {
      overrides.customItems = body.items.filter((it) => it.isCustom);
    }
    if (Array.isArray(body.characters)) {
      overrides.customCharacters = body.characters.filter((c) => c.isCustom);
    }
    if (body.modifiedItems) overrides.modifiedItems = body.modifiedItems;
    if (body.modifiedCharacters) overrides.modifiedCharacters = body.modifiedCharacters;
    if (body.modifiedArchetypes) overrides.modifiedArchetypes = body.modifiedArchetypes;
    if (body.customSeasons) overrides.customSeasons = body.customSeasons;

    saveOverrides(overrides);
    sendJson(res, 200, { success: true, message: 'Écosystème restauré avec succès.' });
    return true;
  }

  // Réinitialisation aux valeurs d'usine
  if (req.method === 'POST' && pathname === '/api/admin/reset') {
    saveOverrides(getEmptyOverrides());
    sendJson(res, 200, {
      success: true,
      message: 'Écosystème réinitialisé aux valeurs d’usine.',
    });
    return true;
  }

  sendJson(res, 404, { error: 'Endpoint administrateur inconnu.' });
  return true;
}
