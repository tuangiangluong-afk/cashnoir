/**
 * Revenge system: when a client is rejected, braquage'd, or trap-exposed,
 * their faction remembers. 2-5 days later, that faction sends a hardened
 * client with boosted anger and locked first price drop.
 */
export interface VengeanceEntry {
  faction: string;
  /** Day when the grudge was recorded */
  day: number;
  reason: 'rejected' | 'braquage' | 'trap_exposed';
}

const FACTION_FULL_NAMES: Record<string, { fr: string; en: string; es: string }> = {
  'Cercle des Jeux': {
    fr: 'Le Cercle des Jeux',
    en: 'The Underground Casino Syndicate',
    es: 'El Círculo de Juegos',
  },
  'Docks du Nord': {
    fr: 'Les Docks du Nord',
    en: 'The North Docks Smugglers',
    es: 'Los Muelles del Norte',
  },
  'Clinique Privée Saint-Luc': {
    fr: 'La Clinique Privée Saint-Luc',
    en: 'The Saint-Luc Private Clinic',
    es: 'La Clínica Privada San Lucas',
  },
  'Brigade Financière': {
    fr: 'La Brigade Financière',
    en: 'The Financial Crimes Squad',
    es: 'La Brigada Financiera',
  },
  'Mairie & Promoteurs': {
    fr: 'La Mairie et les Promoteurs',
    en: 'City Hall & Developers',
    es: 'El Ayuntamiento y Promotores',
  },
};

export function checkVengeance(
  entries: VengeanceEntry[],
  currentDay: number,
  clientFaction: string,
  locale: 'en' | 'fr' | 'es' = 'fr',
): { active: boolean; angerBoost: number; mefianceBoost: number; flavorText: string } | null {
  const match = entries.find(
    (e) => e.faction === clientFaction && currentDay - e.day >= 2 && currentDay - e.day <= 5,
  );
  if (!match) return null;
  const boost = match.reason === 'braquage' ? 30 : match.reason === 'trap_exposed' ? 20 : 15;
  const facName = FACTION_FULL_NAMES[match.faction]?.[locale] || match.faction;

  let flavorText = `${facName} se souvient que tu as refusé un de leurs gars.`;
  if (locale === 'en') {
    flavorText =
      match.reason === 'braquage'
        ? `${facName} still holds a grudge for the Day ${match.day} holdup.`
        : match.reason === 'trap_exposed'
          ? `${facName} knows you exposed their undercover mole.`
          : `${facName} remembers that you turned away one of their runners.`;
  } else if (locale === 'es') {
    flavorText =
      match.reason === 'braquage'
        ? `${facName} te la tiene jurada por el asalto del Día ${match.day}.`
        : match.reason === 'trap_exposed'
          ? `${facName} sabe que delataste a su agente infiltrado.`
          : `${facName} recuerda que rechazaste a uno de los suyos.`;
  } else {
    flavorText =
      match.reason === 'braquage'
        ? `${facName} t'en veut pour le braquage du Jour ${match.day}.`
        : match.reason === 'trap_exposed'
          ? `${facName} sait que tu as grillé leur infiltré.`
          : `${facName} se souvient que tu as refusé un de leurs gars.`;
  }

  return {
    active: true,
    angerBoost: boost,
    mefianceBoost: Math.round(boost * 0.6),
    flavorText,
  };
}

/** Prune entries older than 6 days */
export function pruneVengeance(entries: VengeanceEntry[], currentDay: number): VengeanceEntry[] {
  return entries.filter((e) => currentDay - e.day <= 6);
}
