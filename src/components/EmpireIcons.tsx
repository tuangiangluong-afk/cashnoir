import type { FC } from 'react';

export interface EmpireIconProps {
  id: string;
  className?: string;
}

export const EmpireIcon: FC<EmpireIconProps> = ({ id, className = 'w-6 h-6' }) => {
  switch (id) {
    /* ---------------- Arsenal ---------------- */
    case 'uvLamp':
      // Lampe UV Haute Puissance
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M18 6l-4 4-7-7 4-4 7 7z" />
          <path d="M14 10l-4 4" />
          <path d="M5 19l-3 3" />
          <path d="M9 15l-4 4" />
          <path d="M18 13a6 6 0 0 1 4 4" strokeDasharray="2 2" className="text-sky-400" />
          <path d="M15 16a8 8 0 0 1 6 6" strokeDasharray="2 2" className="text-sky-300" />
        </svg>
      );

    case 'armoredDoor':
      // Porte Blindée à Sas
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="4" y="2" width="16" height="20" rx="2" fill="currentColor" fillOpacity="0.15" />
          <circle cx="12" cy="12" r="4" strokeWidth="2" className="text-amber-400" />
          <line x1="12" y1="8" x2="12" y2="10" strokeWidth="2" />
          <line x1="12" y1="14" x2="12" y2="16" strokeWidth="2" />
          <line x1="8" y1="12" x2="10" y2="12" strokeWidth="2" />
          <line x1="14" y1="12" x2="16" y2="12" strokeWidth="2" />
        </svg>
      );

    case 'gpsJammer':
      // Brouilleur GPS Militaire
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 2v20" strokeWidth="2" />
          <path d="M4.93 4.93a10 10 0 0 1 14.14 0" className="text-amber-400" />
          <path d="M7.76 7.76a6 6 0 0 1 8.48 0" className="text-amber-300" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <line x1="2" y1="2" x2="22" y2="22" strokeWidth="1.8" className="text-red-400" />
        </svg>
      );

    /* ---------------- Actifs de la Ville ---------------- */
    case 'lookout':
      // Guetteur de Rue
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="7" r="4" fill="currentColor" fillOpacity="0.2" />
          <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
          <circle cx="12" cy="7" r="1.5" fill="currentColor" />
          <path d="M2 12h3M19 12h3" strokeWidth="2" className="text-amber-400" />
        </svg>
      );

    case 'nightbar':
      // Bar de Nuit Clandestin (Speakeasy)
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M8 22h8" strokeWidth="2" />
          <line x1="12" y1="15" x2="12" y2="22" strokeWidth="2" />
          <path d="m19 3-7 8-7-8h14z" fill="currentColor" fillOpacity="0.25" className="text-amber-400" />
          <circle cx="14" cy="6" r="1.5" fill="currentColor" className="text-amber-300" />
        </svg>
      );

    case 'warehouse':
      // Entrepôt des Docks & Enchères
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 21V9l9-6 9 6v12H3z" fill="currentColor" fillOpacity="0.15" />
          <path d="M9 21v-6h6v6" strokeWidth="2" className="text-amber-400" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="12" y1="3" x2="12" y2="9" />
        </svg>
      );

    /* ---------------- Quartiers ---------------- */
    case 'docks':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="5" r="3" />
          <line x1="12" y1="8" x2="12" y2="21" strokeWidth="2" />
          <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
        </svg>
      );

    case 'finance':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="7" width="20" height="14" rx="2" fill="currentColor" fillOpacity="0.15" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );

    case 'politics':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 22h16M4 18h16M4 6h16M12 2l8 4H4l8-4z" />
          <line x1="7" y1="6" x2="7" y2="18" strokeWidth="2" />
          <line x1="12" y1="6" x2="12" y2="18" strokeWidth="2" />
          <line x1="17" y1="6" x2="17" y2="18" strokeWidth="2" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
};
