import type { FC } from 'react';

export interface JokerIconProps {
  id: string;
  className?: string;
}

export const JokerIcon: FC<JokerIconProps> = ({ id, className = 'w-6 h-6' }) => {
  switch (id) {
    case 'blanchisseur':
      // Blanchisseur Suisse : Écu suisse & coffre fort
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="text-amber-400" />
          <path d="M12 8v8M8 12h8" strokeWidth="2.2" className="text-amber-300" />
        </svg>
      );

    case 'oeil-lynx':
      // Œil de Lynx : Réticule & iris prédateur
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" className="text-amber-400" fill="currentColor" fillOpacity="0.25" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <line x1="12" y1="2" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="2" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="22" y2="12" />
        </svg>
      );

    case 'sang-froid':
      // Sang-Froid : Flocon de glace & thermomètre négatif
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 3v18M3 12h18" />
          <path d="m6 6 12 12M6 18 18 6" />
          <circle cx="12" cy="12" r="2.5" className="text-sky-400" fill="currentColor" />
          <path d="m9 4 3 2 3-2M9 20l3-2 3 2M4 9l2 3-2 3M20 9l-2 3 2 3" className="text-sky-300" />
        </svg>
      );

    case 'intimidation':
      // Aura de Parrain : Chapeau Borsalino / Couronne pègre
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M2 17h20" strokeWidth="2" />
          <path d="M5 17c1-4 3-7 7-7s6 3 7 7" fill="currentColor" fillOpacity="0.15" />
          <path d="M7 10V6c0-1.1.9-2 2-2h6a2 2 0 0 1 2 2v4" />
          <circle cx="9" cy="14" r="1" fill="currentColor" />
          <circle cx="15" cy="14" r="1" fill="currentColor" />
        </svg>
      );

    case 'assurance':
      // Flics dans la Poche : Étoile de shérif / insigne corrompu
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" className="text-amber-400" fill="currentColor" fillOpacity="0.2" />
          <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
        </svg>
      );

    case 'vautour':
      // Vautour de Nuit : Serres et ailes rapace
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 2c-3 0-5 2.5-5 5.5 0 2 1 3.5 3 4.5l-6 6c-1 1-1 2.5 0 3.5s2.5 1 3.5 0l5.5-5.5 5.5 5.5c1 1 2.5 1 3.5 0s1-2.5 0-3.5l-6-6c2-1 3-2.5 3-4.5 0-3-2-5.5-5-5.5z" />
          <circle cx="12" cy="7" r="1.5" fill="currentColor" />
        </svg>
      );

    case 'a-l-aveugle':
      // À l’Aveugle : Œil barré / bandeau
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M2 2l20 20" strokeWidth="2" className="text-red-400" />
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        </svg>
      );

    case 'vitrine-armee':
      // Vitrine Armée : Revolvers croisés
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m3 7 6 6-3 3-4-2 1-7z" fill="currentColor" fillOpacity="0.2" />
          <path d="m21 7-6 6 3 3 4-2-1-7z" fill="currentColor" fillOpacity="0.2" />
          <line x1="9" y1="13" x2="15" y2="7" strokeWidth="2" />
          <line x1="15" y1="13" x2="9" y2="7" strokeWidth="2" />
          <circle cx="12" cy="10" r="1.5" fill="currentColor" />
        </svg>
      );

    case 'blanchisseur-express':
      // Blanchisseur Express : Éclair + fiole chimique
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" className="text-amber-400" fill="currentColor" fillOpacity="0.25" />
        </svg>
      );

    case 'radar':
      // Radar à Pièges : Antenne sonar balayage
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
          <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor" />
          <path d="M12 12 18 6" strokeWidth="2" className="text-emerald-400" />
          <path d="M12 6a6 6 0 0 1 6 6" strokeDasharray="2 2" className="text-emerald-400" />
        </svg>
      );

    case 'negociateur':
      // Négociateur Né : Balance dorée / poignée de main
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m16 16 2 2 4-4" />
          <path d="M11 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h5l2 3h9a2 2 0 0 1 2 2v3" />
          <circle cx="17" cy="17" r="4" className="text-amber-400" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );

    case 'reseau':
      // Réseau de Clôtures : Nœuds connectés / toile
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="6" cy="6" r="3" fill="currentColor" fillOpacity="0.25" />
          <circle cx="18" cy="6" r="3" fill="currentColor" fillOpacity="0.25" />
          <circle cx="6" cy="18" r="3" fill="currentColor" fillOpacity="0.25" />
          <circle cx="18" cy="18" r="3" fill="currentColor" fillOpacity="0.25" />
          <circle cx="12" cy="12" r="3" className="text-amber-400" fill="currentColor" />
          <line x1="8.5" y1="7.5" x2="10" y2="10.5" />
          <line x1="15.5" y1="7.5" x2="14" y2="10.5" />
          <line x1="8.5" y1="16.5" x2="10" y2="13.5" />
          <line x1="15.5" y1="16.5" x2="14" y2="13.5" />
        </svg>
      );

    case 'fantome':
      // Fantôme du Quartier : Ombre furtive / capuche
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M9 10h.01M15 10h.01" strokeWidth="2.5" />
          <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 3 2.5-3 3 3 3-3 2 3V10a8 8 0 0 0-8-8z" fill="currentColor" fillOpacity="0.15" />
        </svg>
      );

    case 'collectionneur':
      // Œil du Collectionneur : Gemme taillée / diamant
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M6 3h12l4 6-10 12L2 9l4-6z" fill="currentColor" fillOpacity="0.2" className="text-amber-400" />
          <path d="M2 9h20" />
          <path d="m12 21 4-12L14 3" />
          <path d="m12 21-4-12L10 3" />
        </svg>
      );

    case 'double-fond':
      // Double Fond : Coffre fort / trappe secrète
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="3" y="4" width="18" height="13" rx="2" fill="currentColor" fillOpacity="0.15" />
          <path d="M3 17h18v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3z" strokeWidth="2" className="text-amber-400" />
          <circle cx="12" cy="10" r="2.5" />
          <path d="M12 12.5V14" strokeWidth="2" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
  }
};
