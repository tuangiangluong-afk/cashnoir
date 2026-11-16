import { PORTRAIT_OF } from '../data/cast';
import { useEffect, useRef, useState } from 'react';
import type { Gauges } from '../services/types';

/* ------------------------------------------------------------------ */
/*  Pluie sur la vitre (Canvas, ~140 traits, zéro asset)               */
/* ------------------------------------------------------------------ */
export function RainCanvas({ intensity = 1 }: { intensity?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;

    type Drop = { x: number; y: number; len: number; v: number; a: number; wob: number };
    let drops: Drop[] = [];

    const build = () => {
      const count = Math.round((w * h) / 9000) * intensity;
      drops = Array.from({ length: Math.max(50, Math.min(220, count)) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        len: 12 + Math.random() * 46,
        v: 240 + Math.random() * 520,
        a: 0.08 + Math.random() * 0.28,
        wob: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round';

      for (const d of drops) {
        d.wob += dt * 1.4;
        d.y += d.v * dt;
        if (d.y > h + 40) {
          d.y = -60;
          d.x = Math.random() * w;
        }
        const drift = Math.sin(d.wob) * 5;
        ctx.strokeStyle = `rgba(196, 214, 232, ${d.a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + drift * 0.5 - 3, d.y + d.len);
        ctx.stroke();

        // gouttelette qui perle sur la vitre
        if (d.a > 0.3) {
          ctx.fillStyle = `rgba(220, 232, 245, ${d.a * 0.5})`;
          ctx.beginPath();
          ctx.arc(d.x + drift * 0.5 - 3, d.y + d.len, 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(frame);
    };

    if (reduce) {
      // une seule image statique
      ctx.clearRect(0, 0, w, h);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [intensity]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}

/* ------------------------------------------------------------------ */
/*  Décor : vitre, quartier, étagères de stock, actifs de l'empire     */
/* ------------------------------------------------------------------ */
export function ShopBackdrop({
  districtId = 'docks',
}: {
  districtId?: string;
  inventory?: { id: string; name: string; paid: number; arcItemKey?: string }[];
  cityAssets?: string[];
  arcNotes?: { arcId: string; title: string; note: string; resolved: boolean }[];
  onOpenStock?: () => void;
  onOpenEmpire?: () => void;
}) {
  const skylineColor =
    districtId === 'penthouse'
      ? 'rgba(245, 180, 90, 0.24)'
      : districtId === 'financial'
        ? 'rgba(110, 160, 220, 0.22)'
        : 'rgba(65, 85, 110, 0.20)';

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#040507]">
      {/* Nuit derrière la vitre, teinte selon le quartier */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 25%, ${skylineColor}, transparent 65%), linear-gradient(180deg, #05070b 0%, #030406 100%)`,
        }}
      />

      {/* Silhouette urbaine du quartier derrière la vitre */}
      <svg
        viewBox="0 0 1200 420"
        preserveAspectRatio="xMidYMax slice"
        className="pointer-events-none absolute inset-x-0 bottom-[26%] h-[46%] w-full opacity-45"
        aria-hidden
      >
        {districtId === 'docks' && (
          <g fill="#0b0f17" stroke="#1e293b" strokeWidth="1">
            {/* grues & conteneurs des docks */}
            <rect x="60" y="290" width="140" height="130" />
            <rect x="220" y="320" width="180" height="100" />
            <rect x="860" y="300" width="160" height="120" />
            <path d="M120 290 L140 120 L310 140 M140 120 L140 290" fill="none" stroke="#1e293b" strokeWidth="3" />
            <path d="M980 300 L960 110 L790 135" fill="none" stroke="#1e293b" strokeWidth="3" />
            <circle cx="310" cy="140" r="3" fill="#f59e0b" opacity="0.7" />
          </g>
        )}
        {districtId === 'financial' && (
          <g fill="#0a0e17" stroke="#1e293b" strokeWidth="1">
            <rect x="80" y="120" width="90" height="300" />
            <rect x="190" y="70" width="110" height="350" />
            <rect x="320" y="160" width="80" height="260" />
            <rect x="810" y="90" width="105" height="330" />
            <rect x="935" y="140" width="95" height="280" />
            <rect x="1045" y="180" width="85" height="240" />
            {/* fenêtres allumées */}
            <g fill="#93c5fd" opacity="0.35">
              <rect x="210" y="100" width="12" height="6" />
              <rect x="245" y="135" width="14" height="6" />
              <rect x="835" y="125" width="14" height="6" />
              <rect x="960" y="175" width="12" height="6" />
            </g>
          </g>
        )}
        {districtId === 'penthouse' && (
          <g fill="#0c0a12" stroke="#3b2f24" strokeWidth="1">
            <rect x="40" y="150" width="110" height="270" />
            <rect x="170" y="80" width="130" height="340" />
            <rect x="890" y="60" width="140" height="360" />
            <rect x="1050" y="130" width="110" height="290" />
            <g fill="#fbbf24" opacity="0.45">
              <rect x="195" y="110" width="16" height="5" />
              <rect x="230" y="150" width="20" height="5" />
              <rect x="915" y="95" width="18" height="5" />
              <rect x="955" y="135" width="16" height="5" />
            </g>
          </g>
        )}
      </svg>

      <RainCanvas intensity={0.75} />

      {/* Cône de lampe de bureau sobre */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[78%] w-[52%] -translate-x-1/2"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(255,198,120,0.28), rgba(255,170,70,0.08) 45%, transparent 75%)',
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Calques de finition : grain + scanlines + vignette                 */
/* ------------------------------------------------------------------ */
export function FilmOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute inset-0 vignette" />
      <div className="absolute inset-0 film-grain" />
      <div className="absolute inset-0 scanlines opacity-20" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Buste du client, plein cadre                                       */
/* ------------------------------------------------------------------ */
/*  Portraits d'archétypes (optionnels)                                */
/* ------------------------------------------------------------------ */
/*  Déposer les PNG ici, fond transparent, cadrage buste (900x1100 px   */
/*  conseillé, sujet posé en bas). Tant qu'un fichier manque, la         */
/*  silhouette SVG est utilisée automatiquement à la place.             */
export const PORTRAIT_DIR = '/assets/portraits/';

export const FEMALE_CAST_PORTRAITS = [
  'c001',
  'c003',
  'c006',
  'c008',
  'c010',
  'c012',
  'c014',
  'c016',
  'c018',
  'c022',
  'c024',
  'c026',
  'c028',
  'c030',
] as const;

export const MALE_CAST_PORTRAITS = [
  'c002',
  'c004',
  'c005',
  'c007',
  'c009',
  'c011',
  'c013',
  'c015',
  'c017',
  'c019',
  'c020',
  'c021',
  'c023',
  'c025',
  'c027',
  'c029',
] as const;

/** Âge physique visible pour chaque visage du cast */
export const PORTRAIT_PHYSICAL_AGE: Record<string, number> = {
  c001: 36,
  c002: 52,
  c003: 44,
  c004: 29,
  c005: 48,
  c006: 24,
  c007: 63,
  c008: 31,
  c009: 39,
  c010: 58,
  c011: 34,
  c012: 27,
  c013: 46,
  c014: 33,
  c015: 25,
  c016: 41,
  c017: 61,
  c018: 38,
  c019: 55,
  c020: 23,
  c021: 50,
  c022: 47,
  c023: 65,
  c024: 30,
  c025: 46,
  c026: 37,
  c027: 30,
  c028: 27,
  c029: 36,
  c030: 42,
};

export function resolveCastPortrait(
  castId?: string,
  gender?: 'm' | 'f',
  name = '',
  archetype = '',
): string {
  if (castId && PORTRAIT_OF[castId]) return `cast/${PORTRAIT_OF[castId]}`;
  if (castId) {
    const num = parseInt(castId.replace(/\D/g, ''), 10);
    if (!Number.isNaN(num) && num >= 1 && num <= 30) {
      return `cast/${castId}`;
    }
  }
  const isFemale =
    gender === 'f' ||
    /sonia|inès|ines|olga|chloé|chloe|zara|nora|kour|nadia|clarisse|zoe|yuki|éléonore|mélanie|fatima|camille|sarah|leïla|amélie|roxane|eva|maya|lucie|diane|katya|soraya|jade|salomé|elena|marina|claire/i.test(
      name,
    );
  const hash = Array.from(`${name}:${archetype}:${castId || ''}`).reduce(
    (acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0,
    7,
  );
  if (isFemale) {
    return `cast/${FEMALE_CAST_PORTRAITS[hash % FEMALE_CAST_PORTRAITS.length]}`;
  }
  return `cast/${MALE_CAST_PORTRAITS[hash % MALE_CAST_PORTRAITS.length]}`;
}

/* ------------------------------------------------------------------ */
export function ClientBust({
  castId,
  gender,
  age: _age = 35,
  name = '',
  archetype,
  gauges,
  outcome,
  speaking,
  isTrap,
  discount = 0,
}: {
  castId?: string;
  gender?: 'm' | 'f';
  age?: number;
  name?: string;
  archetype: string;
  gauges: Gauges;
  outcome: 'active' | 'deal_accepte' | 'quitte_la_boutique' | 'sort_son_arme';
  speaking: boolean;
  isTrap?: boolean;
  discount?: number;
}) {
  const a = archetype.toLowerCase();
  const n = name.toLowerCase();
  const hash = Array.from(`${n}:${a}`).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const isFemale = gender === 'f' || /sonia|inès|ines|olga|chloé|chloe|zara|nora|kour|nadia|clarisse|zoe|yuki|éléonore|mélanie|fatima|camille|sarah|leïla|amélie|roxane|eva|maya|lucie|diane|katya|soraya|jade|salomé|elena|marina|claire/.test(n);
  
  // Street Fighter 2 mood states
  const isFurious = gauges.colere >= 70 || outcome === 'sort_son_arme';
  const isBroken = (gauges.peur >= 65 || (outcome === 'deal_accepte' && discount >= 35)) && !isFurious;
  const angry = (gauges.colere >= 55 || outcome === 'sort_son_arme') && !isFurious;
  const scared = (gauges.peur >= 55 && !angry && !isFurious && !isBroken);
  const suspicious = gauges.mefiance >= 72 && !angry && !scared && !isFurious && !isBroken;

  const rim = isTrap
    ? '#e0402f'
    : isFurious
      ? '#ef4444'
      : angry
        ? '#ff5a4d'
        : isBroken
          ? '#60a5fa'
          : scared
            ? '#f5b544'
            : outcome === 'deal_accepte'
              ? '#2fbf71'
              : ['#9db2cf', '#cbd5e1', '#d6b88d', '#a5b4fc'][hash % 4];

  const variant: 'fedora' | 'suit' | 'hoodie' | 'coat' = /suspect|flic|mercenaire/.test(a)
    ? 'fedora'
    : /cadre|papa|col blanc|courtier/.test(a)
      ? 'suit'
      : /paris|braqueur|ruiné/.test(a)
        ? 'hoodie'
        : 'coat';

  const headStyle: 'fedora' | 'hoodie' | 'bob' | 'bald' | 'cap' | 'slick' = isFemale
    ? 'bob'
    : variant === 'fedora'
      ? 'fedora'
      : variant === 'hoodie'
        ? hash % 2 === 0
          ? 'hoodie'
          : 'cap'
        : (['slick', 'bald', 'cap'] as const)[hash % 3];

  const hasGlasses = /courtier|cadre|col blanc/.test(a) || hash % 5 === 0;
  const hasSunglasses = !hasGlasses && hash % 7 === 0;
  const hasBeard = !isFemale && hash % 3 === 1;
  const coatTint = ['#0e131b', '#171210', '#101613', '#15131c'][hash % 4];
  const skinTones = [
    ['#6e5648', '#3c2d25', '#16110e'], // clair / pâle sous lampe
    ['#634a39', '#36261d', '#140e0b'], // mat / méditerranéen
    ['#755f52', '#41332b', '#191310'], // très clair / cendré
    ['#4f3626', '#2a1c13', '#110b08'], // métis / ambré
    ['#362419', '#1d130d', '#0b0806'], // foncé
  ];
  const skinTone = skinTones[hash % skinTones.length];
  const eyeY = 202;
  const glint = scared ? 3.2 : 2.4;
  const browY = isFurious ? 8 : angry ? 6 : (scared || isBroken) ? -5 : 0;

  // Portrait illustré : toujours un portrait dédié haute résolution (/cast/<id>.webp)
  const baseKey = resolveCastPortrait(castId, gender, name, archetype);
  const moodVariantKey = isFurious ? `${baseKey}_furious` : isBroken ? `${baseKey}_broken` : null;
  const [triedMood, setTriedMood] = useState(false);
  const [portrait, setPortrait] = useState<'idle' | 'ok' | 'none'>('idle');

  useEffect(() => {
    setTriedMood(false);
    setPortrait('idle');
  }, [baseKey, isFurious, isBroken]);

  const activeSrc = !triedMood && moodVariantKey
    ? `${PORTRAIT_DIR}${moodVariantKey}.webp`
    : `${PORTRAIT_DIR}${baseKey}.webp`;

  const stateMotionCls = isFurious
    ? 'animate-sf-rage filter contrast-[1.25] brightness-95'
    : isBroken
      ? 'animate-sf-defeat filter saturate-[0.65] contrast-[1.1] brightness-[0.88]'
      : angry && outcome === 'active'
        ? 'animate-shake'
        : scared && outcome === 'active'
          ? 'animate-tense-tremble'
          : suspicious && outcome === 'active'
            ? 'scale-[0.97] brightness-75'
            : speaking
              ? 'breathe'
              : '';

  return (
    <div
      className={`relative h-full w-full transition-all duration-500 ${stateMotionCls}`}
    >
      {isFurious && (
        <div
          className="pointer-events-none absolute inset-0 animate-pulse z-10"
          style={{
            background: 'radial-gradient(ellipse at 50% 48%, rgba(239,68,68,0.25), transparent 65%)',
          }}
        />
      )}
      {isBroken && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.18), transparent 70%)',
          }}
        />
      )}
      {angry && outcome === 'active' && !isFurious && (
        <div
          className="pointer-events-none absolute inset-0 animate-pulse"
          style={{
            background: 'radial-gradient(ellipse at 50% 48%, rgba(239,68,68,0.14), transparent 62%)',
          }}
        />
      )}
      {portrait === 'ok' && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 50% 42%, ${rim}22, transparent 62%)` }}
        />
      )}

      {portrait !== 'none' && (
        <img
          key={activeSrc}
          src={activeSrc}
          alt=""
          aria-hidden
          draggable={false}
          onLoad={() => setPortrait('ok')}
          onError={() => {
            if (!triedMood && moodVariantKey) {
              setTriedMood(true);
            } else {
              setPortrait('none');
            }
          }}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover object-[50%_16%] lg:object-contain lg:object-bottom mix-blend-lighten transition-opacity duration-500 ${
            portrait === 'ok' ? 'opacity-95' : 'opacity-0'
          }`}
          style={{
            WebkitMaskImage: 'radial-gradient(ellipse 62% 76% at 50% 48%, #000 40%, transparent 92%)',
            maskImage: 'radial-gradient(ellipse 62% 76% at 50% 48%, #000 40%, transparent 92%)',
          }}
        />
      )}

      <svg
        viewBox="0 0 440 540"
        className={`relative h-full w-full transition-opacity duration-300 ${
          portrait === 'none' ? 'opacity-100' : 'opacity-0'
        }`}
        preserveAspectRatio="xMidYMax meet"
        aria-label="Client derrière le comptoir"
        aria-hidden={portrait !== 'none'}
      >
        <defs>
          <linearGradient id="coatGrad" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0%" stopColor="#0e131b" />
            <stop offset="38%" stopColor="#080b11" />
            <stop offset="100%" stopColor="#04060a" />
          </linearGradient>
          <linearGradient id="collarGrad" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#232c3a" />
            <stop offset="45%" stopColor="#12171f" />
            <stop offset="100%" stopColor="#05070b" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="0" y1="0.1" x2="1" y2="0.9">
            <stop offset="0%" stopColor={skinTone[0]} />
            <stop offset="46%" stopColor={skinTone[1]} />
            <stop offset="100%" stopColor={skinTone[2]} />
          </linearGradient>
          <radialGradient id="backGlow" cx="50%" cy="42%" r="50%">
            <stop offset="0%" stopColor="#ffcf94" stopOpacity="0.28" />
            <stop offset="52%" stopColor="#ffb257" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#ffb257" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cheek" cx="34%" cy="46%" r="52%">
            <stop offset="0%" stopColor="#ffd7a3" stopOpacity="0.13" />
            <stop offset="100%" stopColor="#ffd7a3" stopOpacity="0" />
          </radialGradient>
          <filter id="rimGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Halo de la lampe derrière le client */}
        <ellipse cx="222" cy="250" rx="250" ry="290" fill="url(#backGlow)" />

        {/* ---- Manteau / veste ---- */}
        <path
          d="M34,540 L34,478 C34,424 88,390 148,377 L222,366 L296,377 C356,390 410,424 410,478 L410,540 Z"
          fill="url(#coatGrad)"
        />
        {/* col relevé (lisible en silhouette) */}
        <path
          d="M170,374 L222,486 L274,374 L250,358 L222,404 L194,358 Z"
          fill="#05070b"
        />
        <path d="M170,374 L222,486" fill="none" stroke={rim} strokeOpacity="0.4" strokeWidth="1.8" />
        <path d="M274,374 L222,486" fill="none" stroke={rim} strokeOpacity="0.18" strokeWidth="1.6" />

        {variant === 'suit' && (
          <path d="M214,430 L230,430 L236,500 L222,528 L208,500 Z" fill={angry ? '#4d120f' : '#1d1610'} opacity="0.9" />
        )}
        {variant === 'hoodie' && (
          <>
            <path
              d="M154,392 C170,356 196,344 222,344 C248,344 274,356 290,392 C272,376 248,368 222,368 C196,368 172,376 154,392 Z"
              fill="#070a0f"
            />
            <path d="M202,398 L198,486 M242,398 L246,486" stroke="#20262f" strokeWidth="3" strokeLinecap="round" />
          </>
        )}

        {/* ---- Liseré de lumière sur l'épaule gauche ---- */}
        <path
          d="M34,520 L34,478 C34,424 88,390 148,377 L186,368"
          fill="none"
          stroke={rim}
          strokeOpacity="0.6"
          strokeWidth="2.6"
          filter="url(#rimGlow)"
        />
        <path
          d="M410,520 L410,478 C410,424 356,390 296,377 L258,368"
          fill="none"
          stroke={rim}
          strokeOpacity="0.2"
          strokeWidth="2"
        />

        {/* ---- Cou (dans l'ombre du col) ---- */}
        <path d="M198,282 L246,282 L252,340 L192,340 Z" fill="#0a0806" />

        {/* ---- Écharpe / col relevé qui mange le cou ---- */}
        <path d="M184,316 C204,302 240,302 260,316 L290,394 C270,406 174,406 154,394 Z" fill="url(#collarGrad)" />
        <path d="M184,316 C204,306 240,306 260,316" fill="none" stroke="#2b3542" strokeWidth="2" />
        <path d="M170,372 C196,384 248,384 274,372" fill="none" stroke="#06080b" strokeWidth="2.5" opacity="0.8" />
        <path d="M154,394 C174,406 270,406 290,394" fill="none" stroke="#000" strokeOpacity="0.5" strokeWidth="2.5" />

        {/* ---- Tête ---- */}
        <ellipse cx="222" cy="206" rx="78" ry="92" fill="url(#skinGrad)" />
        {/* lumière rasante sur la joue gauche */}
        <ellipse cx="222" cy="206" rx="78" ry="92" fill="url(#cheek)" />
        {/* oreilles */}
        <ellipse cx="145" cy="212" rx="9" ry="18" fill="#0b0907" />
        <ellipse cx="299" cy="212" rx="9" ry="18" fill="#0b0907" />

        {/* ---- Chapeau / cheveux (distinct par client) ---- */}
        {headStyle === 'fedora' ? (
          <>
            <path d="M136,156 C138,112 174,90 222,90 C270,90 306,112 308,156 Z" fill="#05070a" />
            <path
              d="M100,160 C166,145 278,145 344,160 C349,171 338,181 320,181 L124,181 C106,181 95,171 100,160 Z"
              fill="#03050a"
            />
            <path d="M100,160 C166,145 278,145 344,160" fill="none" stroke={rim} strokeOpacity="0.24" strokeWidth="1.6" />
            <path d="M144,150 C164,116 190,102 218,98" fill="none" stroke={rim} strokeOpacity="0.22" strokeWidth="1.6" />
            <path d="M150,142 L294,142 L288,133 L156,133 Z" fill="#0a0806" opacity="0.95" />
          </>
        ) : headStyle === 'cap' ? (
          <>
            <path d="M142,166 C144,114 178,94 222,94 C266,94 300,114 302,166 Z" fill={coatTint} />
            <path d="M136,162 Q222,142 328,168 Q276,178 140,172 Z" fill="#05070b" />
            <path d="M144,158 C162,118 190,104 222,102" fill="none" stroke={rim} strokeOpacity="0.35" strokeWidth="2" />
          </>
        ) : headStyle === 'bob' ? (
          <>
            <path
              d="M134,182 C132,102 174,80 222,80 C270,80 312,102 310,182 L316,288 C294,296 286,262 288,200 C272,148 250,126 222,126 C194,126 172,148 156,200 C158,262 150,296 128,288 Z"
              fill="#07090e"
            />
            <path d="M134,182 C142,120 178,92 222,90" fill="none" stroke={rim} strokeOpacity="0.45" strokeWidth="2.2" filter="url(#rimGlow)" />
          </>
        ) : headStyle === 'bald' ? (
          <path d="M156,154 C172,124 196,116 222,116" fill="none" stroke={rim} strokeOpacity="0.52" strokeWidth="2.4" filter="url(#rimGlow)" />
        ) : headStyle === 'hoodie' ? (
          <>
            <path d="M142,182 C140,114 178,92 222,92 C266,92 304,114 302,182 C288,140 260,122 222,122 C184,122 156,140 142,182 Z" fill="#05080c" />
            <path d="M142,178 C152,130 182,112 222,110" fill="none" stroke={rim} strokeOpacity="0.34" strokeWidth="2" filter="url(#rimGlow)" />
          </>
        ) : (
          <>
            <path d="M146,180 C144,108 182,86 222,86 C262,86 300,108 298,180 C286,136 258,114 222,114 C186,114 158,136 146,180 Z" fill="#05070b" />
            <path d="M146,176 C156,128 184,110 222,110" fill="none" stroke={rim} strokeOpacity="0.42" strokeWidth="2.2" filter="url(#rimGlow)" />
          </>
        )}

        {hasBeard && (
          <path
            d="M154,234 C160,282 188,302 222,302 C256,302 284,282 290,234 C276,262 252,274 222,274 C192,274 168,262 154,234 Z"
            fill="#030406"
            opacity="0.9"
          />
        )}

        {/* ombre du bord du chapeau sur le haut du visage */}
        <path d="M138,182 Q222,202 306,182 L306,212 Q222,236 138,212 Z" fill="#000" opacity="0.5" />

        {/* ---- Contre-jour sur le profil gauche ---- */}
        <path
          d="M156,164 C146,208 152,258 178,290"
          fill="none"
          stroke={rim}
          strokeOpacity="0.72"
          strokeWidth="2.8"
          filter="url(#rimGlow)"
        />

        {/* ---- Sourcils (à peine lisibles) ---- */}
        <line x1="178" y1={178 + (angry ? 4 : 0)} x2="204" y2={178 + browY} stroke="#3a3128" strokeWidth="3.6" strokeLinecap="round" opacity="0.85" />
        <line x1="240" y1={178 + browY} x2="266" y2={178 + (angry ? 4 : 0)} stroke="#3a3128" strokeWidth="3.6" strokeLinecap="round" opacity="0.85" />

        {/* ---- Yeux : deux éclats dans l'ombre ---- */}
        <g>
          <ellipse cx="192" cy={eyeY} rx="11" ry="7" fill="#000" opacity="0.6" />
          <ellipse cx="252" cy={eyeY} rx="11" ry="7" fill="#000" opacity="0.6" />
          <circle cx="192" cy={eyeY} r={glint} fill="#ffe6bd" opacity={angry ? 0.95 : 0.78} />
          <circle cx="252" cy={eyeY} r={glint} fill="#ffe6bd" opacity={angry ? 0.95 : 0.78} />
          {scared && (
            <>
              <ellipse cx="192" cy={eyeY} rx="6" ry="5" fill="#ffe6bd" opacity="0.35" />
              <ellipse cx="252" cy={eyeY} rx="6" ry="5" fill="#ffe6bd" opacity="0.35" />
            </>
          )}
        </g>

        {hasGlasses && (
          <g stroke={rim} strokeOpacity="0.5" strokeWidth="1.4" fill="none">
            <rect x="172" y="192" width="42" height="23" rx="3" />
            <rect x="230" y="192" width="42" height="23" rx="3" />
            <path d="M214,203 L230,203" />
          </g>
        )}
        {hasSunglasses && (
          <g stroke={rim} strokeOpacity="0.55" strokeWidth="1.4" fill="#040508" fillOpacity="0.92">
            <rect x="170" y="192" width="44" height="21" rx="4" />
            <rect x="230" y="192" width="44" height="21" rx="4" />
            <path d="M214,200 L230,200" fill="none" />
          </g>
        )}

        {/* ---- Nez + bouche, effleurés par la lumière ---- */}
        <path d="M218,206 L211,238 L226,239" fill="none" stroke="#6b5847" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
        {angry ? (
          <path d="M204,262 Q222,251 240,262" fill="none" stroke="#7d4438" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        ) : scared ? (
          <ellipse cx="222" cy="260" rx="9" ry="6" fill="#05060a" stroke="#6f5327" strokeWidth="1" />
        ) : suspicious ? (
          <line x1="206" y1="260" x2="238" y2="257" stroke="#635a4e" strokeWidth="2.6" strokeLinecap="round" opacity="0.7" />
        ) : (
          <line x1="208" y1="260" x2="236" y2="260" stroke="#5c5348" strokeWidth="2.2" strokeLinecap="round" opacity="0.6" />
        )}

        {scared && <path d="M286,166 Q294,184 286,192 Q278,184 286,166 Z" fill="#7fc4ef" opacity="0.75" />}

        {outcome === 'sort_son_arme' && (
          <g transform="translate(292,352)" opacity="0.95">
            <rect x="0" y="10" width="104" height="15" rx="3" fill="#0b0e13" stroke="#ff5a4d" strokeWidth="1.4" />
            <rect x="12" y="25" width="21" height="44" rx="4" fill="#080b10" stroke="#ff5a4d" strokeWidth="1.2" />
            <circle cx="94" cy="17.5" r="4" fill="#ff5a4d" />
          </g>
        )}
      </svg>
    </div>
  );
}


/*  Texte lettre par lettre                                            */
/* ------------------------------------------------------------------ */
export function Typewriter({
  text,
  speed = 22,
  onChar,
  className,
}: {
  text: string;
  speed?: number;
  onChar?: () => void;
  className?: string;
}) {
  const [n, setN] = useState(0);
  const cbRef = useRef(onChar);
  cbRef.current = onChar;

  useEffect(() => {
    setN(0);
  }, [text]);

  useEffect(() => {
    if (n >= text.length) return;
    const id = window.setTimeout(() => {
      setN((v) => v + 1);
      if (n % 2 === 0) cbRef.current?.();
    }, speed);
    return () => window.clearTimeout(id);
  }, [n, text, speed]);

  return (
    <span
      className={className}
      onClick={() => setN(text.length)}
      style={{ cursor: n < text.length ? 'pointer' : 'inherit' }}
      title={n < text.length ? 'Cliquer pour afficher tout de suite' : undefined}
    >
      {text.slice(0, n)}
      {n < text.length && <span className="caret" />}
    </span>
  );
}
