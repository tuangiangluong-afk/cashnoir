interface ItemCounterVisualProps {
  category: string;
  inspected: boolean;
  uvScanned: boolean;
}

export function ItemCounterVisual({ category, inspected, uvScanned }: ItemCounterVisualProps) {
  return (
    <div className="relative h-28 rounded-md bg-zinc-950 border border-white/10 overflow-hidden flex items-center justify-center">
      {/* Felt mat subtle texture */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #27272a 1px, transparent 1px)',
          backgroundSize: '8px 8px',
        }}
      />

      {/* UV Beam overlay */}
      {uvScanned && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 55% 45%, rgba(56,189,248,0.28), rgba(14,165,233,0.06) 60%, transparent)',
          }}
        />
      )}

      {/* Item Vector Art */}
      <svg viewBox="0 0 120 70" className="w-36 h-20 relative z-10">
        {category === 'Horlogerie' && (
          <g>
            <rect x="46" y="4" width="28" height="16" rx="2" fill="#3f3f46" stroke="#71717a" />
            <rect x="46" y="50" width="28" height="16" rx="2" fill="#3f3f46" stroke="#71717a" />
            <circle cx="60" cy="35" r="20" fill="#18181b" stroke="#f59e0b" strokeWidth="2.5" />
            <circle cx="60" cy="35" r="14" fill="#09090b" stroke="#52525b" />
            <line x1="60" y1="35" x2="60" y2="25" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
            <line x1="60" y1="35" x2="68" y2="38" stroke="#e4e4e7" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}
        {category === 'Données' && (
          <g>
            <rect x="26" y="16" width="68" height="38" rx="4" fill="#18181b" stroke="#52525b" strokeWidth="2" />
            <rect x="34" y="24" width="26" height="12" rx="1" fill="#27272a" />
            <circle cx="80" cy="35" r="4" fill={uvScanned ? '#38bdf8' : '#f59e0b'} />
            <rect x="94" y="29" width="10" height="12" rx="1" fill="#71717a" />
          </g>
        )}
        {category === 'Métaux' && (
          <g>
            <polygon points="32,50 44,20 76,20 88,50" fill="#d97706" stroke="#fbbf24" strokeWidth="2" />
            <polygon points="44,20 76,20 70,30 50,30" fill="#f59e0b" opacity="0.6" />
            <text x="60" y="42" textAnchor="middle" fill="#451a03" fontSize="8" fontWeight="bold">
              999.9
            </text>
          </g>
        )}
        {category === 'Joaillerie' && (
          <g>
            <rect x="22" y="14" width="76" height="44" rx="4" fill="#27272a" stroke="#71717a" strokeWidth="2" />
            <polygon points="45,35 55,25 65,25 75,35 60,49" fill="#38bdf8" stroke="#bae6fd" strokeWidth="1.5" opacity="0.9" />
          </g>
        )}
        {category === 'Armement' && (
          <g>
            <rect x="24" y="22" width="56" height="9" rx="1" fill="#52525b" stroke="#a1a1aa" />
            <rect x="44" y="31" width="18" height="13" rx="2" fill="#3f3f46" stroke="#71717a" />
            <path d="M36,31 L42,56 L28,56 L26,31 Z" fill="#78350f" stroke="#b45309" />
          </g>
        )}
        {category === 'Art' && (
          <g>
            <rect x="28" y="10" width="64" height="50" fill="#18181b" stroke="#a16207" strokeWidth="3" />
            <circle cx="52" cy="32" r="9" fill="#f59e0b" opacity="0.7" />
            <path d="M34,52 L54,32 L72,46 L86,26" fill="none" stroke="#e4e4e7" strokeWidth="1.8" />
          </g>
        )}
      </svg>

      {/* Loupe Ring */}
      {inspected && (
        <div className="absolute right-4 bottom-3 w-12 h-12 rounded-full border-2 border-amber-400/70 bg-amber-400/5 pointer-events-none flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-red-500/80 animate-ping" />
        </div>
      )}
    </div>
  );
}
