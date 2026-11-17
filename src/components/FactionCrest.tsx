import type { FC } from 'react';

export interface FactionCrestProps {
  factionId: string;
  className?: string;
}

export const FactionCrest: FC<FactionCrestProps> = ({ factionId, className = 'w-6 h-6' }) => {
  switch (factionId) {
    case 'cercle':
      // Le Cercle des Jeux : As de Pique / Cartes à jouer
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 2C8 6 4 9 4 13a8 8 0 0 0 16 0c0-4-4-7-8-11z" fill="currentColor" fillOpacity="0.25" className="text-amber-400" />
          <path d="M12 17v5M8 22h8" strokeWidth="2" />
        </svg>
      );

    case 'cartel':
      // Le Cartel du Port : Ancre maritime & Docks
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="5" r="3" />
          <line x1="12" y1="8" x2="12" y2="21" strokeWidth="2" />
          <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
          <line x1="9" y1="11" x2="15" y2="11" strokeWidth="2" />
        </svg>
      );

    case 'moretti':
      // Famille Moretti : Rose noire & Dague
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 2v14M9 13h6" strokeWidth="2" />
          <path d="m9 16 3 6 3-6" fill="currentColor" fillOpacity="0.3" className="text-red-400" />
          <circle cx="12" cy="6" r="3" className="text-amber-400" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );

    case 'horlogers':
      // Guilde des Horlogers : Engrenage & Montre de gousset
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="14" r="8" />
          <line x1="12" y1="14" x2="12" y2="10" strokeWidth="2" className="text-amber-300" />
          <line x1="12" y1="14" x2="15" y2="14" strokeWidth="2" className="text-amber-300" />
          <path d="M12 6V2M9 2h6" strokeWidth="2" />
        </svg>
      );

    case 'voleurs':
      // Voleurs de l'Ombre : Masque vénitien / Capuche furtive
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M2 10s3-4 10-4 10 4 10 4-3 8-10 8-10-8-10-8z" fill="currentColor" fillOpacity="0.2" />
          <circle cx="8" cy="11" r="2" fill="currentColor" />
          <circle cx="16" cy="11" r="2" fill="currentColor" />
          <path d="m10 14 2 2 2-2" />
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
