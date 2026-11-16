import type { Gauges } from '../services/types';

interface NoirPortraitProps {
  name: string;
  gauges: Gauges;
  outcome: 'active' | 'deal_accepte' | 'quitte_la_boutique' | 'sort_son_arme';
}

export function NoirPortrait({ name, gauges, outcome }: NoirPortraitProps) {
  const isAngry = gauges.colere >= 55 || outcome === 'sort_son_arme';
  const isScared = gauges.peur >= 55 && !isAngry;
  const isSuspicious = gauges.mefiance >= 75 && !isAngry && !isScared;

  const rimColor = isAngry
    ? '#ef4444'
    : isScared
      ? '#f59e0b'
      : outcome === 'deal_accepte'
        ? '#10b981'
        : '#52525b';

  const browOffset = isAngry ? 4 : isScared ? -3 : 0;

  return (
    <div
      className={`relative w-20 h-20 rounded-lg overflow-hidden border bg-zinc-950 shrink-0 transition-all duration-300 ${
        isAngry
          ? 'border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
          : isScared
            ? 'border-amber-500/50 shadow-[0_0_16px_rgba(245,158,11,0.2)]'
            : 'border-white/10'
      }`}
      aria-label={`Portrait de ${name}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="lampGlow" cx="50%" cy="25%" r="65%">
            <stop offset="0%" stopColor={rimColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor="#09090b" stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#lampGlow)" />

        {/* Shoulders / Coat */}
        <path d="M12,100 C14,72 30,66 50,66 C70,66 86,72 88,100 Z" fill="#18181b" stroke={rimColor} strokeWidth="1" strokeOpacity="0.4" />
        {/* Collar */}
        <path d="M36,68 L50,82 L64,68" fill="none" stroke="#3f3f46" strokeWidth="2" />

        {/* Head */}
        <ellipse cx="50" cy="44" rx="18" ry="22" fill="#27272a" stroke={rimColor} strokeWidth="1.2" strokeOpacity="0.6" />

        {/* Eyes & Brows */}
        <g transform={`translate(0, ${isScared ? -1 : 0})`}>
          {/* Left brow */}
          <line
            x1="36"
            y1={36 + (isAngry ? 2 : 0)}
            x2="46"
            y2={36 + browOffset}
            stroke="#e4e4e7"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Right brow */}
          <line
            x1="54"
            y1={36 + browOffset}
            x2="64"
            y2={36 + (isAngry ? 2 : 0)}
            stroke="#e4e4e7"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Eyes */}
          <circle cx="41" cy="42" r={isScared ? 2.6 : 2} fill={isAngry ? '#fca5a5' : '#f4f4f5'} />
          <circle cx="59" cy="42" r={isScared ? 2.6 : 2} fill={isAngry ? '#fca5a5' : '#f4f4f5'} />
        </g>

        {/* Mouth */}
        {isAngry ? (
          <path d="M42,56 Q50,51 58,56" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" />
        ) : isScared ? (
          <ellipse cx="50" cy="55" rx="4" ry="2.5" fill="#18181b" stroke="#fbbf24" strokeWidth="1.2" />
        ) : isSuspicious ? (
          <line x1="43" y1="55" x2="57" y2="54" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />
        ) : (
          <line x1="44" y1="55" x2="56" y2="55" stroke="#d4d4d8" strokeWidth="1.8" strokeLinecap="round" />
        )}

        {/* Sweat drop if scared */}
        {isScared && (
          <path d="M65,30 Q68,36 65,39 Q62,36 65,30 Z" fill="#38bdf8" opacity="0.85" />
        )}

        {/* Gun silhouette if armed outcome */}
        {outcome === 'sort_son_arme' && (
          <g transform="translate(58, 66)">
            <rect x="0" y="6" width="26" height="6" rx="1" fill="#ef4444" />
            <rect x="2" y="12" width="7" height="12" rx="1" fill="#dc2626" />
          </g>
        )}
      </svg>
    </div>
  );
}
