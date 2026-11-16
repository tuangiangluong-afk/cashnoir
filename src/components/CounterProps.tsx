import { useEffect, useState } from 'react';

export type ItemVisualKind =
  | 'phone'
  | 'passport'
  | 'cash'
  | 'goldbar'
  | 'watch'
  | 'case'
  | 'revolver'
  | 'shotgun'
  | 'painting'
  | 'usb'
  | 'diamond'
  | 'katana'
  | 'faberge'
  | 'violin'
  | 'icon'
  | 'chalice'
  | 'mask'
  | 'drone'
  | 'ring'
  | 'dossier'
  | 'kevlar'
  | 'plate';

export function itemKindFor(name: string): ItemVisualKind {
  const n = name.toLowerCase();
  if (/clé\s*usb|ledger|hardware\s*wallet|puce|microfilm/.test(n)) return 'usb';
  if (/diamant|émeraude|emeraude|rivière/.test(n)) return 'diamond';
  if (/katana|dague|phurba/.test(n)) return 'katana';
  if (/fabergé|faberge|œuf|oeuf/.test(n)) return 'faberge';
  if (/violon|stradivarius/.test(n)) return 'violin';
  if (/icône|icone/.test(n)) return 'icon';
  if (/calice/.test(n)) return 'chalice';
  if (/masque/.test(n)) return 'mask';
  if (/drone|imsi|scanner|boîtier|boitier|antenne/.test(n)) return 'drone';
  if (/chevalière|chevaliere|bague|diadème|diademe/.test(n)) return 'ring';
  if (/dossier|manuscrit|carte\s*militaire|protocole/.test(n)) return 'dossier';
  if (/gilet|pare-balles|kevlar/.test(n)) return 'kevlar';
  if (/plaque\s*diplomatique|cmd/.test(n)) return 'plate';
  if (/passeport/.test(n)) return 'passport';
  if (/téléphone|phone|sim|cryptophone/.test(n)) return 'phone';
  if (/lingot/.test(n)) return 'goldbar';
  if (/liasse|billet|coupure|€|\$/.test(n)) return 'cash';
  if (/rolex|patek|montre|horlog/.test(n)) return 'watch';
  if (/mallette|valise|réfrigér|précision|precision/.test(n)) return 'case';
  if (/fusil|chasse|scié/.test(n)) return 'shotgun';
  if (/revolver|357|arme|pistolet|luger|colt/.test(n)) return 'revolver';
  return 'painting';
}

function ItemSvg({
  kind,
  inspected,
  uvScanned,
  className = 'h-16 w-24',
}: {
  kind: ItemVisualKind;
  inspected: boolean;
  uvScanned: boolean;
  className?: string;
}) {
  switch (kind) {
    case 'phone':
      return (
        <svg viewBox="0 0 120 72" className={className} aria-hidden>
          <rect x="26" y="10" width="68" height="52" rx="7" fill="#151922" stroke="#525a6b" strokeWidth="2" />
          <rect x="33" y="15" width="54" height="42" rx="3" fill="#090c12" />
          {/* écran fissuré */}
          <path d="M40 16 L58 34 L50 44 L70 56" stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.7" />
          <path d="M58 34 L76 28" stroke="#94a3b8" strokeWidth="0.8" fill="none" opacity="0.5" />
          {/* capteur / trace loupe */}
          <circle cx="81" cy="36" r="3" fill={inspected ? '#dc2626' : '#272e3b'} />
          {/* scellé UV */}
          {uvScanned && (
            <rect x="38" y="22" width="24" height="10" rx="1" fill="#38bdf8" opacity="0.55" />
          )}
        </svg>
      );
    case 'cash':
      return (
        <svg viewBox="0 0 120 72" className={className} aria-hidden>
          <rect x="18" y="24" width="84" height="34" rx="2" fill="#1e3a2f" stroke="#4ade80" strokeOpacity="0.45" strokeWidth="1.4" />
          <rect x="20" y="19" width="80" height="34" rx="2" fill="#224436" stroke="#86efac" strokeOpacity="0.55" strokeWidth="1.4" />
          <rect x="22" y="14" width="76" height="34" rx="2" fill="#2a5241" stroke="#bbf7d0" strokeOpacity="0.65" strokeWidth="1.4" />
          {/* bande papier */}
          <rect x="50" y="14" width="20" height="34" fill="#d4b483" opacity="0.9" />
          <text x="60" y="34" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#18181b" fontWeight="bold">
            100€
          </text>
          {/* tache encre antivol sous loupe */}
          {inspected && <circle cx="31" cy="22" r="5" fill="#ec4899" opacity="0.85" />}
          {/* marquage UV */}
          {uvScanned && (
            <g opacity="0.85">
              <rect x="27" y="19" width="16" height="6" fill="#38bdf8" />
              <rect x="75" y="34" width="18" height="6" fill="#38bdf8" />
            </g>
          )}
        </svg>
      );
    case 'watch':
      return (
        <svg viewBox="0 0 120 72" className={className} aria-hidden>
          {/* bracelet or rose */}
          <rect x="18" y="27" width="84" height="18" rx="3" fill="#b47b56" stroke="#e2b494" strokeWidth="1.2" />
          {/* maillon cassé */}
          <path d="M36 27 L39 45" stroke="#090b10" strokeWidth={inspected ? '3' : '1.4'} />
          {inspected && <circle cx="37" cy="36" r="3" fill="#dc2626" />}
          {/* boîtier */}
          <circle cx="60" cy="36" r="18" fill="#c98d68" stroke="#f0c7ab" strokeWidth="2" />
          <circle cx="60" cy="36" r="13.5" fill="#111319" stroke="#e2b494" strokeWidth="1" />
          <line x1="60" y1="36" x2="60" y2="27" stroke="#f5d0b5" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="60" y1="36" x2="68" y2="39" stroke="#f5d0b5" strokeWidth="1.3" strokeLinecap="round" />
          {uvScanned && <circle cx="60" cy="36" r="16" fill="none" stroke="#38bdf8" strokeWidth="2.5" opacity="0.85" />}
        </svg>
      );
    case 'case':
      return (
        <svg viewBox="0 0 120 72" className={className} aria-hidden>
          <path d="M46 16 L46 10 L74 10 L74 16" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
          <rect x="20" y="16" width="80" height="44" rx="5" fill="#334155" stroke="#94a3b8" strokeWidth="1.8" />
          <line x1="20" y1="32" x2="100" y2="32" stroke="#1e293b" strokeWidth="2" />
          {/* voyant batterie */}
          <circle cx="88" cy="24" r="2.6" fill="#22c55e" />
          {/* cadenas coupé sous loupe */}
          <rect x="55" y="28" width="10" height="9" rx="1.5" fill={inspected ? '#ef4444' : '#cbd5e1'} />
          {/* code-barres UV */}
          {uvScanned && (
            <g fill="#38bdf8" opacity="0.85">
              <rect x="30" y="40" width="3" height="12" />
              <rect x="35" y="40" width="2" height="12" />
              <rect x="40" y="40" width="4" height="12" />
              <rect x="47" y="40" width="2" height="12" />
            </g>
          )}
        </svg>
      );
    case 'revolver':
      return (
        <svg viewBox="0 0 120 72" className={className} aria-hidden>
          {/* canon chromé */}
          <rect x="46" y="19" width="56" height="9" rx="1.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.2" />
          {/* barillet */}
          <rect x="40" y="25" width="18" height="15" rx="2" fill="#94a3b8" stroke="#475569" strokeWidth="1.2" />
          {inspected && (
            <>
              <circle cx="46" cy="32" r="2" fill="#f97316" />
              <circle cx="52" cy="32" r="2" fill="#f97316" />
            </>
          )}
          {/* crosse noyer */}
          <path d="M40 28 L25 56 L38 58 L46 38 Z" fill="#6b4226" stroke="#3f2311" strokeWidth="1.4" />
          {/* pontet */}
          <circle cx="48" cy="43" r="5" fill="none" stroke="#94a3b8" strokeWidth="1.8" />
          {uvScanned && (
            <path d="M27 54 L41 32" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" opacity="0.65" />
          )}
        </svg>
      );
    case 'painting':
    default:
      return (
        <svg viewBox="0 0 120 72" className={className} aria-hidden>
          {/* toile roulée */}
          <rect x="18" y="24" width="84" height="24" rx="12" fill="#d6c7a9" stroke="#8c7a5b" strokeWidth="1.6" />
          <ellipse cx="96" cy="36" rx="7" ry="12" fill="#292524" stroke="#8c7a5b" strokeWidth="1.4" />
          <ellipse cx="96" cy="36" rx="3" ry="6" fill="#0c0a09" />
          {/* ruban */}
          <rect x="54" y="24" width="10" height="24" fill="#991b1b" opacity="0.85" />
          {/* bord déchiré sous loupe */}
          {inspected && (
            <path d="M24 27 L32 32 L25 38 L33 44" stroke="#dc2626" strokeWidth="1.6" fill="none" />
          )}
          {/* signature UV */}
          {uvScanned && (
            <path
              d="M68 38 Q75 30 82 39 T90 35"
              stroke="#38bdf8"
              strokeWidth="2"
              fill="none"
              opacity="0.9"
            />
          )}
        </svg>
      );
  }
}

export function CounterItemProp({
  name,
  category: _category,
  surfaceDesc,
  streetValue,
  inspected,
  uvScanned,
  onInspect,
  locale = 'fr',
}: {
  name: string;
  category: string;
  surfaceDesc?: string;
  streetValue?: number;
  inspected: boolean;
  uvScanned: boolean;
  onInspect: () => void;
  locale?: 'en' | 'fr' | 'es';
}) {
  const kind = itemKindFor(name);
  const [lensPos, setLensPos] = useState<{ x: number; y: number } | null>(null);
  const [imgOk, setImgOk] = useState(true);
  useEffect(() => {
    setImgOk(true);
  }, [kind]);

  return (
    <button
      type="button"
      onClick={onInspect}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setLensPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onPointerLeave={() => setLensPos(null)}
      title={surfaceDesc || "Cliquer pour examiner l'objet à la loupe"}
      className="group relative flex flex-col items-start p-1.5 text-left transition-transform hover:scale-105"
    >
      {/* Pièce posée à nu sur le comptoir avec ombre portée */}
      <div className="relative rounded-full p-1">
        {lensPos && (
          <div
            className="pointer-events-none absolute inset-0 z-20 rounded-full"
            style={{
              background: uvScanned
                ? `radial-gradient(circle 54px at ${lensPos.x}px ${lensPos.y}px, rgba(56,189,248,0.45), transparent 80%)`
                : `radial-gradient(circle 54px at ${lensPos.x}px ${lensPos.y}px, rgba(245,158,11,0.35), transparent 80%)`,
            }}
          />
        )}
        {uvScanned && (
          <div
            className="pointer-events-none absolute inset-0 z-10 rounded-full"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(56,189,248,0.28), transparent 72%)',
            }}
          />
        )}
        {imgOk ? (
          <img
            key={kind}
            src={`/assets/items/${kind}.webp`}
            alt={name}
            draggable={false}
            onError={() => setImgOk(false)}
            className="h-16 w-28 object-contain mix-blend-lighten drop-shadow-[0_18px_12px_rgba(0,0,0,0.95)] sm:h-28 sm:w-40"
            style={{
              WebkitMaskImage: 'radial-gradient(circle at 50% 50%, #000 58%, transparent 98%)',
              maskImage: 'radial-gradient(circle at 50% 50%, #000 58%, transparent 98%)',
            }}
          />
        ) : (
          <ItemSvg
            kind={kind}
            inspected={inspected}
            uvScanned={uvScanned}
            className="h-14 w-24 sm:h-20 sm:w-32 drop-shadow-[0_16px_12px_rgba(0,0,0,0.95)]"
          />
        )}
      </div>

      {/* Légende sobre sans encart avec libellé explicite de revente rue */}
      <div className="mt-0.5 font-mono text-[10px] drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)]">
        <span className="hidden text-zinc-200 sm:inline">{name}</span>
        {streetValue ? (
          <span className="block text-center font-semibold text-emerald-400 sm:ml-1.5 sm:inline">
            {locale === 'en'
              ? `(Est. Resale ~$${streetValue.toLocaleString('en-US')})`
              : locale === 'es'
                ? `(Reventa est. ~${streetValue.toLocaleString('es-ES')} $)`
                : `(Revente rue est. ~${streetValue.toLocaleString('fr-FR').replace(/[\u202f\u00a0]/g, ' ')} $)`}
          </span>
        ) : null}
      </div>
    </button>
  );
}

export function ShelfMiniIcon({ name }: { name: string }) {
  return (
    <ItemSvg
      kind={itemKindFor(name)}
      inspected={false}
      uvScanned={false}
      className="h-7 w-11 opacity-85 transition-transform group-hover:scale-110"
    />
  );
}
