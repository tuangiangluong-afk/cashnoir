import type { CodexItem, ItemRarity } from './codex';
import type { Locale } from './seoContent';

export const RARITY_I18N: Record<ItemRarity, Record<Locale, string>> = {
  commun: { fr: 'Commun', en: 'Common', es: 'Común' },
  insolite: { fr: 'Insolite', en: 'Uncommon', es: 'Insólito' },
  rare: { fr: 'Rare', en: 'Rare', es: 'Raro' },
  epique: { fr: 'Épique', en: 'Epic', es: 'Épico' },
  legendaire: { fr: 'Légendaire', en: 'Legendary', es: 'Legendario' },
  mythique: { fr: 'Mythique', en: 'Mythic', es: 'Mítico' },
};

export interface LocalizedCodexItemText {
  name: string;
  provenance: string;
  lore: string;
}

export const CODEX_ITEMS_I18N: Record<string, { en: LocalizedCodexItemText; es: LocalizedCodexItemText }> = {
  // Collection 1: Secrets d’État & Guerre Froide
  'microfilm-stasi': {
    en: {
      name: '1982 Stasi Microfilm',
      provenance: 'East Berlin',
      lore: '8mm reel listing double agents planted in NATO. Developed but undeciphered.',
    },
    es: {
      name: 'Microfilm de la Stasi 1982',
      provenance: 'Berlín Este',
      lore: 'Carrete de 8 mm con la lista de agentes dobles infiltrados en la OTAN. Revelado pero no descifrado.',
    },
  },
  'cle-usb-procureur': {
    en: {
      name: 'Prosecutor’s Encrypted USB Drive',
      provenance: 'Courthouse',
      lore: '32 GB AES-256 encrypted depositions from anonymous witnesses against local syndicate bosses.',
    },
    es: {
      name: 'Memoria USB cifrada del Fiscal',
      provenance: 'Palacio de Justicia',
      lore: '32 GB cifrados en AES-256 con declaraciones anónimas contra el crimen organizado local.',
    },
  },
  'carte-militaire': {
    en: {
      name: 'Forged Military Invasion Map',
      provenance: 'Foreign General Staff',
      lore: 'Grid map of strategic logistics corridors stamped with expired top-secret seals.',
    },
    es: {
      name: 'Mapa militar de invasión falsificado',
      provenance: 'Estado Mayor extranjero',
      lore: 'Cuadrícula de corredores logísticos estratégicos con sellos secretos caducados.',
    },
  },
  'valise-nucleaire': {
    en: {
      name: 'Decommissioned Cheget Nuclear Briefcase',
      provenance: 'Decommissioned Ural Silo',
      lore: 'Armored briefcase console with rotary dial and pre-programmed 1989 launch authorization codes.',
    },
    es: {
      name: 'Maletín nuclear Cheget fuera de servicio',
      provenance: 'Silo abandonado en los Urales',
      lore: 'Consola blindada portátil con dial giratorio y códigos de lanzamiento pregrabados de 1989.',
    },
  },
  'passeport-diplomatique': {
    en: {
      name: 'Blank Diplomatic Passport',
      provenance: 'Consulate General',
      lore: 'Genuine watermarked security paper granting full immunity, waiting for a fresh identity.',
    },
    es: {
      name: 'Pasaporte diplomático en blanco',
      provenance: 'Consulado General',
      lore: 'Papel de seguridad filigranado con inmunidad total, listo para un nuevo rostro.',
    },
  },
  'protocole-gladio': {
    en: {
      name: 'Gladio Network Secret Dossier',
      provenance: 'Underground NATO Archives',
      lore: 'Locations of covert weapon caches and sleeper agents across Western Europe.',
    },
    es: {
      name: 'Expediente secreto Red Gladio',
      provenance: 'Archivos subterráneos de la OTAN',
      lore: 'Ubicaciones de depósitos de armas clandestinos e identidades durmientes en Europa Occidental.',
    },
  },

  // Collection 2: Joyaux de la Couronne & Trésors Impériaux
  'diamant-golconde': {
    en: {
      name: 'Golconda Blue Diamond (9 Carats)',
      provenance: 'Golconda Mines (India)',
      lore: 'Antique cushion cut, VVS1 clarity, deep ocean-blue hue. A living legend.',
    },
    es: {
      name: 'Diamante Azul de Golconda (9 quilates)',
      provenance: 'Minas de Golconda (India)',
      lore: 'Talla cojín antigua, pureza VVS1, color azul océano profundo. Una leyenda viva.',
    },
  },
  'oeuf-faberge': {
    en: {
      name: 'Stolen Imperial Tsars Fabergé Egg',
      provenance: 'Winter Palace, Saint Petersburg',
      lore: 'Translucent guilloché enamel and 24-carat chased gold. Working clockwork automaton inside.',
    },
    es: {
      name: 'Huevo Fabergé imperial robado',
      provenance: 'Palacio de Invierno, San Petersburgo',
      lore: 'Esmalte guilloché translúcido y oro cincelado de 24 quilates. Mecanismo de relojería operativo.',
    },
  },
  'diademe-romanov': {
    en: {
      name: 'Romanov Platinum & Pearl Tiara',
      provenance: 'Russian Imperial Treasury',
      lore: '42 natural freshwater pearls and 180 rose-cut diamonds set in solid platinum.',
    },
    es: {
      name: 'Diadema de perlas y platino de los Románov',
      provenance: 'Tesoro imperial ruso',
      lore: '42 perlas naturales de agua dulce y 180 diamantes talla rosa engastados en platino macizo.',
    },
  },
  'rolex-daytona-rose': {
    en: {
      name: 'Diamond-Set Rose Gold Rolex Daytona',
      provenance: 'Monaco Private Mansion',
      lore: 'Baguette rainbow bezel, black mother-of-pearl dial. Laser serials filed off cleanly.',
    },
    es: {
      name: 'Rolex Daytona en Oro Rosa engastado',
      provenance: 'Palacete privado de Mónaco',
      lore: 'Bisel baguette arcoíris, esfera de nácar negro. Número de serie borrado con muela.',
    },
  },
  'bague-medicis': {
    en: {
      name: 'Medici Crest Signet Ring',
      provenance: 'Uffizi Gallery (Florence)',
      lore: 'Antique cameo carved in banded two-layer agate bearing the six Florentine palle crest.',
    },
    es: {
      name: 'Sello ornamental de los Médici',
      provenance: 'Galería Uffizi (Florencia)',
      lore: 'Cameo antiguo tallado en ágata bicapa con el blasón de los seis roeles florentinos.',
    },
  },
  'patek-vintage-1952': {
    en: {
      name: '1952 Patek Philippe Perpetual Calendar',
      provenance: 'Private Geneva Auction',
      lore: 'Unpolished yellow gold case, deep-blue enamel moonphase. Restored without a trace.',
    },
    es: {
      name: 'Patek Philippe Calendario Perpetuo 1952',
      provenance: 'Subasta privada de Ginebra',
      lore: 'Caja de oro amarillo sin pulir, fase lunar en esmalte azul profundo. Restaurado sin huellas.',
    },
  },

  // Collection 3: Arsenal Clandestin & Pièces d’Élite
  'luger-p08-or': {
    en: {
      name: 'Fine Gold-Inlaid Luger P08',
      provenance: 'Private Officer Collection',
      lore: '9mm Parabellum barrel, gold damascening accents and checkered walnut grip panels.',
    },
    es: {
      name: 'Luger P08 con damasquinado en oro',
      provenance: 'Colección privada de oficial',
      lore: 'Cañón 9 mm Parabellum, acabados en damasquinado de oro y cachas de nogal cuadriculado.',
    },
  },
  'fusil-sniper-demantele': {
    en: {
      name: 'Takedown Sniper Rifle in Custom Case',
      provenance: 'Balkan Arms Container',
      lore: 'Fluted heavy barrel, silky bolt action and detachable suppressor with no serials.',
    },
    es: {
      name: 'Fusil de precisión desmontado en maletín',
      provenance: 'Contenedor de armas balcánico',
      lore: 'Cañón pesado estriado, cerrojo fluido y silenciador desmontable sin numeración.',
    },
  },
  'colt-1911-noirci': {
    en: {
      name: 'Black Parkerized Colt 1911',
      provenance: 'Abandoned Military Outpost',
      lore: 'Chemically filed serials, lightened 3.3 lb match trigger. Flawless action.',
    },
    es: {
      name: 'Colt 1911 en acabado parkerizado negro',
      provenance: 'Base militar abandonada',
      lore: 'Matrícula borrada con ácido, gatillo ajustado a 1,5 kg. Mecánica perfecta.',
    },
  },
  'revolver-bulldog-argent': {
    en: {
      name: '1880 Ivory-Grip Bulldog Revolver',
      provenance: 'Underground Pigalle Estate',
      lore: 'Deep floral scrollwork, 5-shot .44 cylinder, zero recoil.',
    },
    es: {
      name: 'Revólver Bulldog 1880 con empuñadura de marfil',
      provenance: 'Herencia clandestina de Pigalle',
      lore: 'Grabados florales profundos, tambor de 5 tiros cal. 44, sin retroceso.',
    },
  },
  'prototype-drone-suicide': {
    en: {
      name: 'Military Micro Recon Drone',
      provenance: 'Classified Defense Lab',
      lore: 'High-res thermal optics and miniature shaped charge. Encrypted military satellite link.',
    },
    es: {
      name: 'Microdrón militar de reconocimiento',
      provenance: 'Laboratorio secreto de defensa',
      lore: 'Óptica térmica de alta resolución y carga hueca miniatura. Enlace satelital militar.',
    },
  },
  'gilet-pare-balles-kevlar': {
    en: {
      name: 'Low-Profile Composite Body Armor',
      provenance: 'Private Security Depot',
      lore: 'Level IV ceramic plates slim enough to conceal beneath a tailored suit.',
    },
    es: {
      name: 'Chaleco antibalas compuesto discreto',
      provenance: 'Depósito de seguridad privada',
      lore: 'Placas cerámicas nivel IV ocultables bajo una chaqueta de traje.',
    },
  },

  // Collection 4: Toiles de Maître & Faussaires de Génie
  'esquisse-modigliani': {
    en: {
      name: '1917 Modigliani Charcoal Study',
      provenance: 'Looted Montparnasse Studio',
      lore: 'Pure, melancholy lines on yellowed vellum paper, genuine estate studio stamp.',
    },
    es: {
      name: 'Estudio al carboncillo de Modigliani (1917)',
      provenance: 'Taller de Montparnasse expoliado',
      lore: 'Trazo puro y melancólico sobre papel vitela amarillento, sello de taller auténtico.',
    },
  },
  'faux-monet-expert': {
    en: {
      name: 'Water Lilies attributed to Claude Monet',
      provenance: 'Private Normandy Estate',
      lore: 'Flawless microscopic craquelure, period pigments. Even national museums are fooled.',
    },
    es: {
      name: 'Nenúfares atribuidos a Claude Monet',
      provenance: 'Finca privada en Normandía',
      lore: 'Craquelado microscópico perfecto, pigmentos de época. Hasta los museos dudan.',
    },
  },
  'manuscrit-illumine': {
    en: {
      name: '14th-Century Illuminated Book of Hours Leaf',
      provenance: 'Secularized Abbey',
      lore: 'Gold leaf and lapis lazuli illumination on vellum parchment. Intact historiated initial.',
    },
    es: {
      name: 'Folio de libro de horas del siglo XIV',
      provenance: 'Abadía secularizada',
      lore: 'Iluminación en oro y lapislázuli sobre pergamino de vitela. Letra capitular intacta.',
    },
  },
  'dessin-rembrandt': {
    en: {
      name: 'Pen & Ink Drawing attributed to Rembrandt',
      provenance: 'Amsterdam Cabinet of Curiosities',
      lore: 'Masterful chiaroscuro in warm bistre ink wash. Inestimable heirloom.',
    },
    es: {
      name: 'Dibujo a pluma atribuido a Rembrandt',
      provenance: 'Gabinete de curiosidades de Ámsterdam',
      lore: 'Claroscuro magistral a la aguada de tinta de bistre. Tesoro de valor incalculable.',
    },
  },
  'stradivarius-contrefait': {
    en: {
      name: 'Expert Counterfeit Stradivarius Cello',
      provenance: 'Cremona Master Workshop (Forgery)',
      lore: 'Amber varnish formulated with historical resins. Rich, powerful tone that fools soloists.',
    },
    es: {
      name: 'Violonchelo estilo Stradivarius peritado',
      provenance: 'Taller de Cremona (falsificador)',
      lore: 'Barniz ambarino a base de resinas históricas. Sonido cálido y potente que engaña a solistas.',
    },
  },
  'lithographie-picasso': {
    en: {
      name: 'Numbered 1955 Picasso Lithograph',
      provenance: 'Burgled Left Bank Gallery',
      lore: 'Artist proof 3/20 signed in grease pencil, accompanying certificate torn.',
    },
    es: {
      name: 'Litografía numerada de Picasso (1955)',
      provenance: 'Galería de la Rive Gauche asaltada',
      lore: 'Prueba de artista 3/20 firmada con lápiz graso, certificado roto.',
    },
  },

  // Collection 5: Cyber-Pègre & Technologie Noire
  'hardware-wallet-2011': {
    en: {
      name: '2011 Hardware Wallet with 450 Dormant BTC',
      provenance: 'Recovered Crash Hard Drive',
      lore: 'Private key secured by a partially corrupted 12-word seed phrase.',
    },
    es: {
      name: 'Billetera fría 2011 con 450 BTC inactivos',
      provenance: 'Disco duro rescatado de un siniestro',
      lore: 'Clave privada protegida por una frase semilla de 12 palabras parcialmente dañada.',
    },
  },
  'boitier-surveillance-wifi': {
    en: {
      name: 'Miniaturized IMSI-Catcher Intercept Unit',
      provenance: 'Compromised Counter-Terror Cell',
      lore: 'Sniffs all mobile calls and SMS packets within 400 meters without a warrant.',
    },
    es: {
      name: 'Unidad de interceptación IMSI-Catcher en miniatura',
      provenance: 'Célula antiterrorista hackeada',
      lore: 'Captura llamadas y mensajes móviles en un radio de 400 metros sin orden judicial.',
    },
  },
  'cryptophone-militaire': {
    en: {
      name: 'Inviolable Satellite Cryptophone',
      provenance: 'Central European Mercenary',
      lore: 'Hardware-encrypted Iridium network, thermal self-destruct upon failed PIN attempts.',
    },
    es: {
      name: 'Criptoteléfono satelital inviolable',
      provenance: 'Mercenario de Europa Central',
      lore: 'Red Iridium cifrada por hardware, autodestrucción térmica tras código PIN erróneo.',
    },
  },
  'puce-zero-day': {
    en: {
      name: 'Motherboard with Hardcoded Zero-Day Exploit',
      provenance: 'State Telecom Provider',
      lore: 'Permanent silicon backdoor granting covert tapping access to a submarine fiber cable.',
    },
    es: {
      name: 'Placa base con exploit Zero-Day inyectado',
      provenance: 'Operadora estatal de telecomunicaciones',
      lore: 'Puerta trasera grabada en silicio que permite espiar un cable submarino de fibra.',
    },
  },
  'scanner-frequences-police': {
    en: {
      name: 'Unlocked Tactical Police Frequency Scanner',
      provenance: 'Raided Gendarmerie Van',
      lore: 'Real-time intercept of encrypted tactical radios and active holdup dispatches.',
    },
    es: {
      name: 'Escáner policial desbloqueado con bandas cifradas',
      provenance: 'Furgón policial saqueado',
      lore: 'Escucha en tiempo real de frecuencias tácticas y alertas de asalto en curso.',
    },
  },
  'antenne-starlink-pirate': {
    en: {
      name: 'Jailbroken Un-Geofenced Satellite Dish',
      provenance: 'Port of Antwerp',
      lore: 'Untraceable gigabit throughput beamed to cargo ships anywhere on open water.',
    },
    es: {
      name: 'Antena Starlink liberada sin geobloqueo',
      provenance: 'Puerto de Amberes',
      lore: 'Conexión gigabit indetectable desde cualquier carguero en alta mar.',
    },
  },

  // Collection 6: Reliques Sacrées & Ésotériques
  'icone-byzantine': {
    en: {
      name: '11th-Century Carved Ivory Byzantine Icon',
      provenance: 'Mount Athos Monastery',
      lore: 'Christ Pantocrator carved in antique ivory with intricate gold-leaf detailing.',
    },
    es: {
      name: 'Icono bizantino de marfil del siglo XI',
      provenance: 'Monasterio del Monte Athos',
      lore: 'Cristo Pantocrátor tallado en marfil antiguo con detalles en pan de oro.',
    },
  },
  'calice-templier': {
    en: {
      name: 'Solid Silver Knights Templar Chalice',
      provenance: 'Covert Larzac Commanderie',
      lore: 'Engraved with the cross pattée and "Non nobis Domine". Eerie mystical sheen.',
    },
    es: {
      name: 'Cáliz de plata maciza de los Templarios',
      provenance: 'Encomienda secreta de Larzac',
      lore: 'Grabado con la cruz paté y la inscripción «Non nobis Domine». Brillo místico.',
    },
  },
  'katana-edo-muramasa': {
    en: {
      name: 'Edo-Period Muramasa Katana (1620)',
      provenance: 'Oyabun Family Vault',
      lore: 'Forged with a legendary wavy hamon temper line. Reputed to thirst for blood.',
    },
    es: {
      name: 'Katana Muramasa del período Edo (1620)',
      provenance: 'Caja fuerte familiar de un Oyabun',
      lore: 'Hoja forjada con una legendaria línea de temple ondulada. Se dice que tiene sed de sangre.',
    },
  },
  'emeraude-vatican': {
    en: {
      name: 'Engraved Rough Vatican Emerald',
      provenance: 'Holy See Secret Archives',
      lore: 'Intense 45-carat green gem carved with a 16th-century secret papal signet.',
    },
    es: {
      name: 'Esmeralda en bruto grabada del Vaticano',
      provenance: 'Biblioteca secreta de la Santa Sede',
      lore: 'Piedra de 45 quilates de verde intenso con un sello papal del siglo XVI.',
    },
  },
  'masque-azteque-obsidienne': {
    en: {
      name: 'Obsidian Aztec Funeral Mask',
      provenance: 'Clandestine Dig in Mexico',
      lore: 'Black obsidian polished to a dark mirror finish with turquoise and mother-of-pearl inlays.',
    },
    es: {
      name: 'Máscara funeraria azteca de obsidiana',
      provenance: 'Excavación clandestina en México',
      lore: 'Obsidiana pulida como un espejo oscuro con incrustaciones de turquesa y nácar.',
    },
  },
  'dague-rituelle-thibétaine': {
    en: {
      name: 'Meteoric Iron Ritual Phurba Dagger',
      provenance: 'Remote Himalayan Temple',
      lore: 'Three wrathful deity faces carved into extraterrestrial meteoric iron.',
    },
    es: {
      name: 'Daga ritual Phurba de hierro meteórico',
      provenance: 'Templo remoto del Himalaya',
      lore: 'Tres rostros iracundos tallados en hierro de origen extraterrestre.',
    },
  },
};

export function localizeCodexItem(
  item: CodexItem,
  locale: Locale,
): { name: string; provenance: string; lore: string; rarity: string } {
  const rarity = RARITY_I18N[item.rarity]?.[locale] || item.rarity;
  if (locale === 'fr') {
    return {
      name: item.name,
      provenance: item.provenance,
      lore: item.lore,
      rarity,
    };
  }

  const trans = CODEX_ITEMS_I18N[item.id]?.[locale];
  return {
    name: trans?.name || item.name,
    provenance: trans?.provenance || item.provenance,
    lore: trans?.lore || item.lore,
    rarity,
  };
}
