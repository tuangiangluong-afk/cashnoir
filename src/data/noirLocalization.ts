import { MORE_EPISODE_TRANSLATIONS } from './seasonsMore';
import { localizeCastText } from './castI18n';
import { ITEM_BASE_EXTRA, ITEM_NAME_EXTRA } from './itemsI18n';
import { CODEX_ITEMS_I18N } from './codexI18n';
import { COLLECTIONS_DATA } from './codex';
import type { Locale } from './seoContent';

/* ------------------------------------------------------------------ */
/*  Dictionnaires de localisation bilingue / trilingue                */
/* ------------------------------------------------------------------ */

const ITEM_BASE_TRANSLATIONS: Record<string, { en: string; es: string }> = {
  'Boîtier IMSI-Catcher WiFi': { en: 'WiFi IMSI-Catcher Wiretap Box', es: 'Caja Espía IMSI-Catcher WiFi' },
  'Fusil à canon scié': { en: 'Sawed-Off 12-Gauge Shotgun', es: 'Escopeta de Cañón Recortado' },
  'Toile roulée sans châssis': { en: 'Unstretched Rolled Masterpiece', es: 'Lienzo Maestro Enrollado' },
  'Clé USB chiffrée': { en: 'Encrypted USB Drive', es: 'Memoria USB Cifrada' },
  'Hardware Wallet 2011': { en: '2011 Hardware Crypto Wallet', es: 'Billetera Cripto 2011' },
  'Diamant brut non taillé': { en: 'Uncut Raw Diamond', es: 'Diamante en Bruto' },
  'Rolex Submariner or noir': { en: 'Rolex Submariner Black Gold', es: 'Rolex Submariner Oro Negro' },
  'Rolex Daytona en Or Rose': { en: 'Rose Gold Rolex Daytona', es: 'Rolex Daytona en Oro Rosa' },
  'Passeport diplomatique vierge': { en: 'Blank Diplomatic Passport', es: 'Pasaporte Diplomático Virgen' },
  'Lingot d’or limé (1 kg)': { en: 'Scratched 1kg Gold Bar', es: 'Lingote de Oro 1kg Limado' },
  'Lingot d\'or limé (1 kg)': { en: 'Scratched 1kg Gold Bar', es: 'Lingote de Oro 1kg Limado' },
  'Lingot d’or limé': { en: 'Scratched 1kg Gold Bar', es: 'Lingote de Oro 1kg Limado' },
  'Lingot d\'or limé': { en: 'Scratched 1kg Gold Bar', es: 'Lingote de Oro 1kg Limado' },
  'Dossier confidentiel ministériel': { en: 'Classified Ministerial Dossier', es: 'Expediente Ministerial Clasificado' },
  'Drone furtif militaire': { en: 'Stealth Military Surveillance Drone', es: 'Dron Furtivo Militar' },
  'Gilet pare-balles kevlar percé': { en: 'Breached Kevlar Tactical Vest', es: 'Chaleco Antibalas Perforado' },
  'Liasse coupures neuves 100 $': { en: 'Stack of Crisp $100 Bills', es: 'Fajo de Billetes de 100 $' },
  'Liasse de 20 000 € en coupures neuves': { en: 'Stack of Unmarked Cash', es: 'Fajo de Billetes Nuevos' },
  'Mallette réfrigérée scellée': { en: 'Sealed Cryo Medical Case', es: 'Maletín Médico Sellado' },
  'Rivière de diamants démontée': { en: 'Loose Diamond Rivière Necklace', es: 'Gargantilla de Diamantes' },
  'Revolver calibre .38': { en: '.38 Snub-Nose Revolver', es: 'Revólver Calibre .38' },
  'Arme du Cercle': { en: 'Syndicate .357 Snub Revolver', es: 'Revólver .357 del Sindicato' },
  'Calice liturgique en vermeil': { en: 'Gilded Liturgical Chalice', es: 'Cáliz Litúrgico en Vermeil' },
  'Masque vénitien orné de rubis': { en: 'Ruby-Encrusted Venetian Mask', es: 'Máscara Veneciana con Rubíes' },
  'Chevalière en platine gravée': { en: 'Engraved Platinum Signet Ring', es: 'Sello de Platino Grabado' },
  'Plaque d\'imprimerie faux billets': { en: 'Counterfeit Bill Engraving Plate', es: 'Plancha de Billetes Falsos' },
  'Violon de maître 18e siècle': { en: '18th Century Master Violin', es: 'Violín de Maestro Siglo XVIII' },
  'Œuf Fabergé miniature': { en: 'Miniature Imperial Fabergé Egg', es: 'Huevo Fabergé Miniatura' },
  'Icône byzantine dorée': { en: 'Gilded Byzantine Icon', es: 'Icono Bizantino Dorado' },
  'Katana artisanal forgé': { en: 'Hand-Forged Antique Katana', es: 'Katana Artesanal Forjada' },
  'Montre des docks': { en: 'Dockside watch', es: 'Reloj del muelle' },
  'Montre Patek Philippe volée': { en: 'Stolen Patek Philippe Watch', es: 'Reloj Patek Philippe Robado' },
  'Téléphone chiffré de Député': { en: 'Classified Encrypted Smartphone', es: 'Teléfono Cifrado de Diputado' },
  'Bague Cartier panthère volée': { en: 'Stolen Cartier Panther Ring', es: 'Anillo Pantera Cartier Robado' },
  'Microfilm militaire Guerre Froide': { en: 'Cold War Military Microfilm', es: 'Microfilm Militar Guerra Fría' },
  'Statuette précolombienne pillée': { en: 'Looted Pre-Columbian Relic', es: 'Estatuilla Precolombina Saqueada' },
  'Pistolet Luger P08 gravé': { en: 'Engraved Luger P08 Pistol', es: 'Pistola Luger P08 Grabada' },
  'Montre Rolex Submariner volée': { en: 'Stolen Rolex Submariner', es: 'Reloj Rolex Submariner Robado' },
  'Toile de Maître volée': { en: 'Stolen Masterpiece Oil Painting', es: 'Óleo Maestro Robado' },
  'Chandelier d\'argent poinçonné': { en: 'Hallmarked Sterling Silver Candelabra', es: 'Candelabro de Plata Sellada' },
  'Lingot de Platine numéroté': { en: 'Numbered Platinum Bullion Bar', es: 'Lingote de Platino Numerado' },
  'Enveloppe de Diamants bruts': { en: 'Parcel of Raw Cut Diamonds', es: 'Sobre de Diamantes en Bruto' },
  'Sceau impérial en jade': { en: 'Imperial Carved Jade Seal', es: 'Sello Imperial de Jade' },
  'Manuscrit médiéval enluminé': { en: 'Illuminated Medieval Manuscript', es: 'Manuscrito Medieval Iluminado' },
};

const SUFFIX_TRANSLATIONS: Record<string, { en: string; es: string }> = {
  'de succession nocturne': { en: 'from estate raid', es: 'de herencia nocturna' },
  'd’un cargo du port': { en: 'from docks cargo heist', es: 'de contrabando portuario' },
  'd\'un cargo du port': { en: 'from docks cargo heist', es: 'de contrabando portuario' },
  'de saisie douanière': { en: 'from customs seizure', es: 'de incautación aduanera' },
  'sorti de coffre privé': { en: 'from private vault heist', es: 'de caja fuerte privada' },
  'sans numéro de série': { en: 'with serials filed off', es: 'sin número de serie' },
  'taché d’encre froide': { en: 'stained with dye-pack ink', es: 'con tinta antirrobo' },
  'taché d\'encre froide': { en: 'stained with dye-pack ink', es: 'con tinta antirrobo' },
  'authentifié hors circuit': { en: 'black-market certified', es: 'certificado en mercado negro' },
  'volé avant inventaire': { en: 'stolen pre-audit', es: 'robado antes de auditar' },
};

Object.assign(ITEM_BASE_TRANSLATIONS, ITEM_BASE_EXTRA, ITEM_NAME_EXTRA);
for (const col of COLLECTIONS_DATA) {
  for (const it of col.items) {
    const tr = CODEX_ITEMS_I18N[it.id];
    if (tr) {
      ITEM_BASE_TRANSLATIONS[it.name] = { en: tr.en.name, es: tr.es.name };
    }
  }
}

export function localizeItemName(name: string, locale: Locale): string {
  if (locale === 'fr') return name;

  // 1. Recherche exacte
  if (ITEM_BASE_TRANSLATIONS[name]) {
    return ITEM_BASE_TRANSLATIONS[name][locale] || name;
  }

  // 2. Décomposition base + suffixe procédural
  for (const [baseKey, trans] of Object.entries(ITEM_BASE_TRANSLATIONS)) {
    if (name.startsWith(baseKey)) {
      const rest = name.slice(baseKey.length).trim();
      for (const [sufKey, sufTrans] of Object.entries(SUFFIX_TRANSLATIONS)) {
        if (rest.includes(sufKey)) {
          return `${trans[locale]} (${sufTrans[locale]})`;
        }
      }
      return trans[locale];
    }
  }

  // 3. Fallback partiel
  let out = name;
  for (const [fr, enObj] of Object.entries(ITEM_BASE_TRANSLATIONS)) {
    if (out.includes(fr)) {
      out = out.replace(fr, enObj[locale]);
    }
  }
  for (const [frSuf, enSuf] of Object.entries(SUFFIX_TRANSLATIONS)) {
    if (out.includes(frSuf)) {
      out = out.replace(frSuf, `(${enSuf[locale]})`);
    }
  }

  return out;
}

const FACTION_TRANSLATIONS: Record<string, { en: string; es: string }> = {
  'Mairie & Promoteurs': { en: 'City Hall & Developers', es: 'Alcaldía y Promotores' },
  'Docks du Nord': { en: 'North Docks Smugglers', es: 'Muelles del Norte' },
  'Clinique Privée Saint-Luc': { en: 'Saint-Luc Private Clinic', es: 'Clínica Privada San Lucas' },
  'Brigade Financière': { en: 'Financial Crimes Squad', es: 'Brigada Financiera' },
  'Cercle des Jeux': { en: 'Underground Casino Syndicate', es: 'Círculo de Juegos Clandestino' },
  'La Bratva des Docks': { en: 'The Dockside Bratva', es: 'La Bratva de los Muelles' },
  'Le Cartel de la Baie': { en: 'The Bay Cartel', es: 'El Cártel de la Bahía' },
  'Yakuza du Dragon Noir': { en: 'Black Dragon Yakuza', es: 'Yakuza del Dragón Negro' },
  'Le Milieu de Pigalle': { en: 'The Pigalle Underworld', es: 'El Hampa de Pigalle' },
  'Ordre des Banquiers Suisses': { en: 'Order of Swiss Bankers', es: 'Orden de Banqueros Suizos' },
  // Rivaux (texte de la table du marché noir)
  'Chinatown': { en: 'Chinatown', es: 'Barrio Chino' },
  'Quartier Financier': { en: 'Financial District', es: 'Distrito Financiero' },
  'Art & Reliques': { en: 'Art & Relics', es: 'Arte y Reliquias' },
  'Armement & Fret': { en: 'Arms & Freight', es: 'Armamento y Flete' },
  'Secrets & Joaillerie': { en: 'Secrets & Jewelry', es: 'Secretos y Joyería' },
  'A racheté deux icônes byzantines sous le nez des douanes.': { en: 'Bought two Byzantine icons right under customs’ nose.', es: 'Compró dos iconos bizantinos delante de las narices de la aduana.' },
  'Écoule des caisses de munitions vers le port d’Anvers.': { en: 'Moving ammunition crates to the port of Antwerp.', es: 'Mueve cajas de munición hacia el puerto de Amberes.' },
  'Dîne avec un procureur tout en négociant des titres au porteur.': { en: 'Dines with a prosecutor while trading bearer bonds.', es: 'Cena con un fiscal mientras negocia bonos al portador.' },
};

export function localizeFaction(faction: string, locale: Locale): string {
  if (locale === 'fr') return faction;
  return FACTION_TRANSLATIONS[faction]?.[locale] || faction;
}

const ARCHETYPE_TRANSLATIONS: Record<string, { en: string; es: string }> = {
  'Accro aux paris en panique (03h du mat’)': {
    en: 'Panicked Gambler (3:00 AM)',
    es: 'Apostador en Pánico (03:00)',
  },
  'Cadre sup’ en sueur, costard froissé': {
    en: 'Sweating Corporate Exec, Rumpled Suit',
    es: 'Ejecutivo Sudoroso en Traje',
  },
  'Flic ou indic trop propre sur lui': {
    en: 'Clean-Cut Undercover Cop or Informant',
    es: 'Policía o Topo Infiltrado Demasiado Limpio',
  },
  'Fils à papa ruiné, arrogant': {
    en: 'Arrogant Ruined Trust-Fund Heir',
    es: 'Niño de Papá Arruinado y Arrogante',
  },
  'Courtier de nuit, froid et pressé': {
    en: 'Ice-Cold Midnight Broker',
    es: 'Corredor Nocturno Implacable',
  },
  'Cliente suspecte (prix anormalement bas)': {
    en: 'Suspect Buyer (Unusually Low Price)',
    es: 'Cliente Sospechosa (Precio Sospechoso)',
  },
  'Client suspect (prix anormalement bas)': {
    en: 'Suspect Seller (Unusually Low Price)',
    es: 'Cliente Sospechoso (Precio Sospechoso)',
  },
  'Restaurateur de toiles faussaire': {
    en: 'Master Forger Art Restorer',
    es: 'Restaurador de Arte Falsario',
  },
  'Chirurgienne radiée, blouse sous trench': {
    en: 'Disbarred Surgeon, Scrubs under Trench',
    es: 'Cirujana Inhabilitada en Gabardina',
  },
  'Ancien flic de la BAC reconverti videur': {
    en: 'Ex-Vice Squad Cop Turned Bouncer',
    es: 'Ex-Policía Convertido en Portero',
  },
  'Courtier en cryptos traqué par des créanciers': {
    en: 'Crypto Broker Hunted by Loan Sharks',
    es: 'Corredor Cripto Acosado por Usureros',
  },
  'Avocate d\'affaires au bord de la faillite': {
    en: 'Corporate Attorney on Brink of Ruin',
    es: 'Abogada Corporativa en Quiebra',
  },
  'Comptable marron de la mafia géorgienne': {
    en: 'Crooked Mob Accountant',
    es: 'Contador Turbio de la Mafia',
  },
  'Pickpocket des palaces, costume sur mesure': {
    en: 'Tailored-Suit Luxury Hotel Pickpocket',
    es: 'Carterista Elegante de Hoteles de Lujo',
  },
  'Tatoueur clandestin des docks': {
    en: 'Underground Docks Tattooist',
    es: 'Tatuador Clandestino de los Muelles',
  },
  'Faux antiquaire des puces': {
    en: 'Flea-Market Shady Antique Dealer',
    es: 'Falso Anticuario de Mercado Negro',
  },
  'Contrebandier de fret nocturne': {
    en: 'Nighttime Freight Smuggler',
    es: 'Contrabandista de Carga Nocturna',
  },
};

Object.assign(ARCHETYPE_TRANSLATIONS, {
  'Cadre sup’ en sueur, tailleur froissé': { en: 'Sweating executive, rumpled suit', es: 'Ejecutiva sudorosa, traje arrugado' },
  'Passeur de frontière, cicatrice à la tempe': { en: 'Border smuggler, scar on the temple', es: 'Pasador de frontera, cicatriz en la sien' },
  'Passeuse de frontière, cicatrice à la tempe': { en: 'Border smuggler, scar on the temple', es: 'Pasadora de frontera, cicatriz en la sien' },
  'Héritier déchu, cravate défaite et montre gagée': { en: 'Fallen heir, loosened tie and a pawned watch', es: 'Heredero caído, corbata floja y reloj empeñado' },
  'Héritière déchue, talons hauts et mascara coulé': { en: 'Fallen heiress, high heels and smudged mascara', es: 'Heredera caída, tacones y rímel corrido' },
  'Curé défroqué, col romain sous le blouson': { en: 'Defrocked priest, clerical collar under the jacket', es: 'Cura que colgó los hábitos, alzacuello bajo la chaqueta' },
  'Religieuse défroquée, croix d’argent sous le manteau': { en: 'Defrocked nun, silver cross under the coat', es: 'Monja que colgó los hábitos, cruz de plata bajo el abrigo' },
  'Hackeur paranoïaque, capuche et écran bleu': { en: 'Paranoid hacker, hood and blue screen', es: 'Hacker paranoico, capucha y pantalla azul' },
  'Hackeuse paranoïaque, capuche et doigts gantés': { en: 'Paranoid hacker, hood and gloved fingers', es: 'Hacker paranoica, capucha y dedos enguantados' },
});

export function localizeArchetype(jobOrArchetype: string, locale: Locale): string {
  if (locale === 'fr') return jobOrArchetype;
  if (ARCHETYPE_TRANSLATIONS[jobOrArchetype]) {
    return ARCHETYPE_TRANSLATIONS[jobOrArchetype][locale];
  }

  const castJob = localizeCastText(jobOrArchetype, locale);
  if (castJob !== jobOrArchetype) return castJob;

  // Si c'est un job du cast non répertorié : nettoyage d'anglicismes
  let s = jobOrArchetype;
  if (locale === 'en') {
    s = s
      .replace(/faussaire/gi, 'forger')
      .replace(/volé[es]?/gi, 'stolen')
      .replace(/clandestin[es]?/gi, 'underground')
      .replace(/flic/gi, 'cop')
      .replace(/radié[es]?/gi, 'disbarred')
      .replace(/docks/gi, 'docks')
      .replace(/marché noir/gi, 'black market')
      .replace(/de nuit/gi, 'night worker')
      .replace(/ruiné[es]?/gi, 'bankrupt');
  } else if (locale === 'es') {
    s = s
      .replace(/faussaire/gi, 'falsario')
      .replace(/volé[es]?/gi, 'robado')
      .replace(/clandestin[es]?/gi, 'clandestino')
      .replace(/flic/gi, 'policía')
      .replace(/marché noir/gi, 'mercado negro');
  }
  return s;
}

const CHALLENGE_TRANSLATIONS: Record<string, { title: { en: string; es: string }; desc: { en: string; es: string } }> = {
  'uv-morte': {
    title: { en: 'Dead UV Week', es: 'Semana UV Muerta' },
    desc: { en: 'UV lamp down all week. +$200 bonus per closed deal.', es: 'Lámpara UV rota. +200 $ bono por trato cerrado.' },
  },
  'paranoia': {
    title: { en: 'General Paranoia', es: 'Paranoia General' },
    desc: { en: 'All clients arrive with +20% Suspicion. Street resale ×1.25.', es: 'Clientes con +20% Desconfianza. Reventa calle ×1,25.' },
  },
  'marche-noir': {
    title: { en: 'Black Market Surge', es: 'Gran Mercado Negro' },
    desc: { en: 'Street value ×1.4 on everything. Each reroll costs +5 Heat.', es: 'Valor calle ×1,4. Cada reroll cuesta +5 Heat.' },
  },
  'peur-bleue': {
    title: { en: 'Cold Fear', es: 'Miedo Azul' },
    desc: { en: 'Terrified clients (+25 Fear). Auctions -15%.', es: 'Clientes aterrorizados (+25 Miedo). Subastas -15%.' },
  },
  'loupe-cassee': {
    title: { en: 'Cracked Magnifier', es: 'Lupa Rota' },
    desc: { en: 'Magnifier out of order. Pure bluff or UV. +$150 bonus per deal.', es: 'Lupa fuera de servicio. Solo farol o UV. +150 $ bono.' },
  },
  'fievre-acheteuse': {
    title: { en: 'Buying Frenzy', es: 'Fiebre Compradora' },
    desc: { en: 'Impatient clients (-10 Suspicion). Asking prices +15% higher.', es: 'Clientes impacientes (-10 Desconfianza). Precios pedidos +15%.' },
  },
};

export function localizeChallenge(
  challenge: { id: string; title: string; desc: string },
  locale: Locale,
): { title: string; desc: string } {
  if (locale === 'fr') return { title: challenge.title, desc: challenge.desc };
  const trans = CHALLENGE_TRANSLATIONS[challenge.id];
  if (trans) {
    return {
      title: trans.title[locale] || challenge.title,
      desc: trans.desc[locale] || challenge.desc,
    };
  }
  return { title: challenge.title, desc: challenge.desc };
}

const ARC_TITLE_TRANSLATIONS: Record<string, { en: string; es: string }> = {
  'arc_depute': { en: "The MP's Blackmail", es: 'El Chantaje del Diputado' },
  'arc_saint_luc': { en: 'The Saint-Luc Cryo Case', es: 'El Maletín de San Lucas' },
  'arc_rolex_temoin': { en: "The Witness's Rolex", es: 'El Reloj del Testigo' },
  'arc_revolver_cercle': { en: 'The Syndicate .357 Revolver', es: 'El Revólver del Sindicato' },
  'arc_toile_musee': { en: "The Collector's Canvas", es: 'El Lienzo del Coleccionista' },
  'arc_liasse_brigade': { en: 'The Marked Bill Stacks', es: 'Los Billetes Marcados' },
  // Aliases de secours
  'arc_cercle': { en: 'The Syndicate .357 Revolver', es: 'El Revólver del Sindicato' },
  'arc_clinique': { en: 'The Saint-Luc Cryo Case', es: 'El Maletín de San Lucas' },
  'arc_docks': { en: "The Witness's Rolex", es: 'El Reloj del Testigo' },
  'arc_promotrice': { en: "The Collector's Canvas", es: 'El Lienzo del Coleccionista' },
  'arc_faussaire': { en: 'The Marked Bill Stacks', es: 'Los Billetes Marcados' },
};

const ARC_NOTE_TRANSLATIONS: Record<string, { en: string; es: string }> = {
  'arc_depute': {
    en: "Encrypted MP Phone: contact 'Mr. Vane' seeks to buy it back before 6 AM. Keep it in your safe.",
    es: 'Teléfono cifrado de Diputado: contacto "Sr. Vane" busca comprarlo antes de las 6h. Guárdalo en la caja.',
  },
  'arc_saint_luc': {
    en: 'Saint-Luc Cryo Case: underground surgeon Dr. Kour will pay top dollar for the intact graft.',
    es: 'Maletín refrigerado San Lucas: la cirujana clandestina Dra. Kour pagará fuerte por el injerto intacto.',
  },
  'arc_rolex_temoin': {
    en: "Rolex Daytona engraved 'J.M.': the missing witness's sister or the Docks want it for the micro-tracker.",
    es: 'Rolex Daytona grabado "J.M.": la hermana del testigo desaparecido o los Muelles lo quieren por el micro-rastreador.',
  },
  'arc_revolver_cercle': {
    en: '.357 Revolver with 2 spent casings: the Syndicate Gambling Ring pays $5,800 to recover the weapon before the cops.',
    es: 'Revólver .357 con 2 casquillos disparados: el Círculo de Juegos paga 5.800 $ para recuperar el arma antes que la policía.',
  },
  'arc_toile_musee': {
    en: 'Rolled canvas with insurance stamp: a Swiss art fence offers $8,200 for the intact piece.',
    es: 'Lienzo enrollado con sello de seguro: un perista de arte suizo ofrece 8.200 $ por la obra intacta.',
  },
  'arc_liasse_brigade': {
    en: 'Consecutive serial bank stack: a Port money launderer exchanges marked bills for $7,000 clean cash.',
    es: 'Fajo de números correlativos: un falsificador del Puerto cambia los billetes marcados por 7.000 $ limpios.',
  },
  'arc_cercle': {
    en: '.357 Revolver with 2 spent casings: the Syndicate Gambling Ring pays $5,800 to recover the weapon before the cops.',
    es: 'Revólver .357 con 2 casquillos disparados: el Círculo de Juegos paga 5.800 $ para recuperar el arma antes que la policía.',
  },
};

export function localizeArcTitle(arcId: string, defaultTitle: string, locale: Locale): string {
  if (locale === 'fr') return defaultTitle;
  return ARC_TITLE_TRANSLATIONS[arcId]?.[locale] || defaultTitle;
}

export function localizeArcNote(arcId: string, defaultNote: string, locale: Locale): string {
  if (locale === 'fr') return defaultNote;
  return ARC_NOTE_TRANSLATIONS[arcId]?.[locale] || defaultNote;
}

/* ------------------------------------------------------------------ */
/*  Traductions Catégories & Tendances Marché                         */
/* ------------------------------------------------------------------ */
const CATEGORY_TRANSLATIONS: Record<string, { en: string; es: string }> = {
  'Données': { en: 'Data', es: 'Datos' },
  'Joaillerie': { en: 'Jewelry', es: 'Joyería' },
  'Horlogerie': { en: 'Timepieces', es: 'Relojería' },
  'Métaux': { en: 'Precious Metals', es: 'Metales' },
  'Armement': { en: 'Weapons', es: 'Armamento' },
  'Art': { en: 'Fine Art', es: 'Arte' },
  'Reliques': { en: 'Relics', es: 'Reliquias' },
  'Cyber': { en: 'Cyber-Hardware', es: 'Ciber-Material' },
  'Luxe': { en: 'Luxury Goods', es: 'Lujo' },
};

export function localizeCategory(cat: string, locale: Locale): string {
  if (locale === 'fr') return cat;
  const match = CATEGORY_TRANSLATIONS[cat];
  if (match) return match[locale] || cat;
  const key = Object.keys(CATEGORY_TRANSLATIONS).find((k) => k.toLowerCase() === cat.toLowerCase());
  return key ? CATEGORY_TRANSLATIONS[key][locale] : cat;
}

/* ------------------------------------------------------------------ */
/*  Traductions Saisons, Récompenses & Épisodes                       */
/* ------------------------------------------------------------------ */
const SEASON_NAME_TRANSLATIONS: Record<string, { en: string; es: string }> = {
  'Nuits de Sang sur les Docks': { en: 'Bloody Nights on the Docks', es: 'Noches Sangrientas en los Muelles' },
  'La Chute de l’Oligarque': { en: 'Fall of the Oligarch', es: 'La Caída del Oligarca' },
  'Code Zéro-Day': { en: 'Zero-Day Code', es: 'Código Día-Cero' },
  'L’Hiver de la Bratva': { en: 'Winter of the Bratva', es: 'El Invierno de la Bratva' },
  'Enchères de Minuit à Genève': { en: 'Midnight Auctions in Geneva', es: 'Subastas de Medianoche en Ginebra' },
  'Opération Mains Sales': { en: 'Operation Dirty Hands', es: 'Operación Manos Sucias' },
};

export function localizeSeasonName(name: string, locale: Locale): string {
  if (locale === 'fr') return name;
  return SEASON_NAME_TRANSLATIONS[name]?.[locale] || name;
}

const SEASON_REWARD_TRANSLATIONS: Record<number, { title: { en: string; es: string }; perk: { en: string; es: string } }> = {
  3: {
    title: { en: 'Apprentice Fence', es: 'Aprendiz de Perista' },
    perk: { en: '+5% value on quick-sells', es: '+5% valor en ventas rápidas' },
  },
  6: {
    title: { en: 'Street Eye', es: 'Ojo de la Calle' },
    perk: { en: '+$150 bonus on each exposed trap', es: '+150 $ de bono por cada trampa' },
  },
  10: {
    title: { en: 'Phantom Broker', es: 'Corredor Fantasma' },
    perk: { en: '−3 extra Heat every quiet night', es: '−3 Heat adicional cada noche tranquila' },
  },
  15: {
    title: { en: 'Shadow Banker', es: 'Banquero en la Sombra' },
    perk: { en: 'Reduced Swiss fees (94% net instead of 90%)', es: 'Comisiones suizas reducidas (94% neto)' },
  },
  20: {
    title: { en: 'Counter Master', es: 'Maestro del Mostrador' },
    perk: { en: '+10% margin on all auctions', es: '+10% margen en subastas' },
  },
  30: {
    title: { en: 'Syndicate Legend', es: 'Leyenda del Sindicato' },
    perk: { en: '+$500 dividend every morning', es: '+500 $ de dividendo cada mañana' },
  },
};

export function localizeSeasonReward(rw: { level: number; title: string; perkDesc: string }, locale: Locale): { title: string; perkDesc: string } {
  if (locale === 'fr') return { title: rw.title, perkDesc: rw.perkDesc };
  const trans = SEASON_REWARD_TRANSLATIONS[rw.level];
  if (!trans) return { title: rw.title, perkDesc: rw.perkDesc };
  return {
    title: trans.title[locale] || rw.title,
    perkDesc: trans.perk[locale] || rw.perkDesc,
  };
}

const EPISODE_TRANSLATIONS: Record<string, { title: { en: string; es: string }; synopsis: { en: string; es: string }; stakes: { en: string; es: string } }> = {
  's1-e1': {
    title: { en: 'Episode 1 · Container 47', es: 'Episodio 1 · El Contenedor 47' },
    synopsis: {
      en: '03:12 AM. A Liberian cargo ship just docked running dark. Viktor brings decommissioned military crates still wet from sea spray.',
      es: '03:12. Un carguero liberiano atraca sin luces. Viktor entrega cajas de armamento militar aún húmedas de salitre.',
    },
    stakes: {
      en: 'Buy the piece without alerting port patrols (+400 XP, +10 Bratva).',
      es: 'Compra la pieza sin alertar patrullas portuarias (+400 XP, +10 Bratva).',
    },
  },
  's1-e2': {
    title: { en: 'Episode 2 · Open Operating Room', es: 'Episodio 2 · El Quirófano Abierto' },
    synopsis: {
      en: 'A Bratva lieutenant took a bullet at the docks. Nadia emerges from the underground clinic with evidence dossiers from the surgery.',
      es: 'Un teniente de la Bratva recibió un disparo. Nadia sale del quirófano clandestino con pruebas de la operación.',
    },
    stakes: {
      en: 'Pressure her on Saint-Luc before the Financial Squad cordons off the block.',
      es: 'Presiónala sobre San Lucas antes de que la Brigada acordoné el sector.',
    },
  },
  's1-e3': {
    title: { en: 'Episode 3 · The Treasury Clerk', es: 'Episodio 3 · El Actuario Fiscal' },
    synopsis: {
      en: 'Tax investigators tracked the serials on Container 47. Lemaire offers to sell you the dossier... or spring a trap.',
      es: 'Hacienda rastreó los números del Contenedor 47. Lemaire viene a venderte el expediente... o tenderte una trampa.',
    },
    stakes: {
      en: 'Read his tells under UV: if clean buy the file, if wired kick him out.',
      es: 'Lee sus tics bajo UV: si es legal compra el archivo, si está cableado échalo.',
    },
  },
  's1-e4': {
    title: { en: 'Finale · The Harbor Ultimatum', es: 'Final · El Ultimátum del Puerto' },
    synopsis: {
      en: 'Ivan Voronov demands all evidence from Container 47 before dawn. Your ticket to the big leagues.',
      es: 'Ivan Voronov exige todas las pruebas del Contenedor 47 antes del amanecer. Tu entrada a las grandes ligas.',
    },
    stakes: {
      en: 'Negotiate the final buyback to claim the Syndicate bounty and season relic.',
      es: 'Negocia la recompra final para reclamar el bono del Sindicato y la reliquia de temporada.',
    },
  },
  's2-e1': {
    title: { en: 'Episode 1 · The Auction House Seals', es: 'Episodio 1 · Los Precintos de Subasta' },
    synopsis: {
      en: 'Court bailiffs are raiding a luxury estate on Avenue Foch. Clarisse smuggled imperial jewelry out before the seals were placed.',
      es: 'Una orden judicial allana una mansión en Avenue Foch. Clarisse sacó joyas imperiales antes del precinto.',
    },
    stakes: {
      en: 'Negotiate under 45% to lay the foundation of your imperial collection.',
      es: 'Negocia por debajo del 45% para iniciar tu colección imperial.',
    },
  },
  's2-e2': {
    title: { en: 'Episode 2 · The Marseille Widow', es: 'Episodio 2 · La Viuda de Marsella' },
    synopsis: {
      en: 'Her shipping magnate husband left 4 million in debts and a secret vault holding the Fabergé Egg.',
      es: 'Su marido armador dejó 4 millones en deudas y una caja secreta con el Huevo Fabergé.',
    },
    stakes: {
      en: 'Dodge the loan sharks and secure the piece without exceeding 65% Heat.',
      es: 'Esquiva a los usureros y asegura la pieza sin superar el 65% de Heat.',
    },
  },
  's3-e1': {
    title: { en: 'Episode 1 · Severed Ankle Monitor', es: 'Episodio 1 · El Grillete Cortado' },
    synopsis: {
      en: 'Zoe has 30 minutes before her GPS decoy expires to offload a hardware wallet containing 450 vintage 2011 Bitcoins.',
      es: 'Zoe tiene 30 minutos de señuelo GPS para vender una billetera con 450 BTC de 2011.',
    },
    stakes: {
      en: 'Break through her paranoia without calling her an amateur before intelligence pings.',
      es: 'Rompe su paranoia sin llamarla novata antes del pitido de inteligencia.',
    },
  },
};

export function localizeSeasonEpisode(
  ep: { id: string; title: string; synopsis: string; stakes: string },
  locale: Locale,
): { title: string; synopsis: string; stakes: string } {
  if (locale === 'fr') return { title: ep.title, synopsis: ep.synopsis, stakes: ep.stakes };
  const more = MORE_EPISODE_TRANSLATIONS[ep.id]?.[locale];
  if (more) return { title: more[0], synopsis: more[1], stakes: more[2] };
  const trans = EPISODE_TRANSLATIONS[ep.id];
  if (!trans) return { title: ep.title, synopsis: ep.synopsis, stakes: ep.stakes };
  return {
    title: trans.title[locale] || ep.title,
    synopsis: trans.synopsis[locale] || ep.synopsis,
    stakes: trans.stakes[locale] || ep.stakes,
  };
}

/* ------------------------------------------------------------------ */
/*  Traductions Spécialités des Factions                             */
/* ------------------------------------------------------------------ */
const FACTION_SPECIALTY_TRANSLATIONS: Record<string, { en: string; es: string }> = {
  'bratva': { en: 'Heavy Weapons & Maritime Freight', es: 'Armamento Pesado y Carga Marítima' },
  'cartel': { en: 'Cash Laundering & Cyber-Hardware', es: 'Blanqueo de Capitales y Ciber-Material' },
  'yakuza': { en: 'Rare Relics & Strict Clan Discipline', es: 'Reliquias Raras y Disciplina Estricta' },
  'milieu': { en: 'High Jewelry & Plundered Fine Art', es: 'Alta Joyería y Cuadros Expoliados' },
  'suisses': { en: 'State Secrets & Bearer Bonds', es: 'Secretos de Estado y Bonos al Portador' },
  'docks': { en: 'Maritime Smuggling & Heavy Cargo', es: 'Contrabando Marítimo y Carga Pesada' },
  'saint-luc': { en: 'Medical Laundering & Black-Market Surgery', es: 'Blanqueo Médico y Cirugías Clandestinas' },
  'promoteurs': { en: 'Elected Official Bribery & Construction Permits', es: 'Sobornos Políticos y Permisos de Obras' },
  'financiere': { en: 'Judicial Seizures & Wiretap Leaks', es: 'Incautaciones Judiciales y Escuchas Ilegales' },
  'cercle': { en: 'Underground Gambling & Armed Debt Collection', es: 'Juego Clandestino y Cobro Armado' },
};

export function localizeFactionSpecialty(factionId: string, defaultSpec: string, locale: Locale): string {
  if (locale === 'fr') return defaultSpec;
  return FACTION_SPECIALTY_TRANSLATIONS[factionId]?.[locale] || defaultSpec;
}

const RIVAL_HEADLINE_STATIC: Record<string, { en: string; es: string }> = {
  'A racheté deux icônes byzantines sous le nez des douanes.': {
    en: 'Bought two Byzantine icons right under the nose of customs.',
    es: 'Compró dos iconos bizantinos delante de las narices de la aduana.',
  },
  'Écoule des caisses de munitions vers le port d’Anvers.': {
    en: 'Moving crates of military ordnance toward the Port of Antwerp.',
    es: 'Colocando cajas de munición con destino al puerto de Amberes.',
  },
  'Dîne avec un procureur tout en négociant des titres au porteur.': {
    en: 'Dining with a prosecutor while laundering bearer bonds.',
    es: 'Cenando con un fiscal mientras negocia bonos al portador.',
  },
  'a raflé un lot de montres saisies avant la ronde de nuit.': {
    en: 'snagged a seized watch lot before the night patrol.',
    es: 'se hizo con un lote de relojes incautados antes de la ronda nocturna.',
  },
  'fait monter les enchères sur les docks.': {
    en: 'driving up bidding on the northern docks.',
    es: 'subiendo las apuestas en las subastas de los muelles.',
  },
  'blanchit ses gains via une galerie fantôme.': {
    en: 'laundering illicit profits through a ghost art gallery.',
    es: 'blanquea ganancias a través de una galería fantasma.',
  },
  'a évité une descente de justesse grâce à un indic.': {
    en: 'narrowly dodged a police raid thanks to a confidential informant.',
    es: 'escapó de una redada por los pelos gracias a un informante.',
  },
};

export function localizeRivalHeadline(headline: string, locale: Locale): string {
  if (locale === 'fr') return headline;
  if (RIVAL_HEADLINE_STATIC[headline]) {
    return RIVAL_HEADLINE_STATIC[headline][locale] || headline;
  }
  const poachedMatch = headline.match(/^A récupéré "([^"]+)" que tu as refusé au comptoir\.$/);
  if (poachedMatch) {
    const localizedItem = localizeItemName(poachedMatch[1], locale);
    if (locale === 'en') {
      return `Picked up "${localizedItem}" that you passed on at the counter.`;
    }
    if (locale === 'es') {
      return `Recogió "${localizedItem}" que rechazaste en el mostrador.`;
    }
  }
  return headline;
}
