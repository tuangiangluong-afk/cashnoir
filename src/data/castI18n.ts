import type { Locale } from './seoContent';

// Traductions des 20 personnages écrits à la main (métier, faille, ligne rouge). Clé = texte français d'origine.
const T: Record<string, { en: string; es: string }> = {
  // c001
  'Chirurgienne radiée, blouse sous trench': { en: 'Disbarred surgeon, scrubs under trench', es: 'Cirujana inhabilitada, bata bajo la gabardina' },
  'Craque si tu évoques l’Ordre des médecins, son bloc opératoire ou la clinique.': { en: 'Cracks if you mention the medical board, her operating room or the clinic.', es: 'Cede si mencionas el Colegio de Médicos, su quirófano o la clínica.' },
  'Explose si tu la traites de boucher ou d’incompétente.': { en: 'Explodes if you call her a butcher or incompetent.', es: 'Explota si la llamas carnicera o incompetente.' },
  // c002
  'Ancien artificier de la Baltique': { en: 'Former Baltic demolitions expert', es: 'Antiguo artificiero del Báltico' },
  'Se crispe dès que tu parles de douane maritime, de Kaliningrad ou de ses doigts.': { en: 'Tenses up when you bring up sea customs, Kaliningrad or his fingers.', es: 'Se tensa si hablas de aduana marítima, Kaliningrado o sus dedos.' },
  'Devient violent si tu te moques de sa main mutilée.': { en: 'Turns violent if you mock his maimed hand.', es: 'Se vuelve violento si te burlas de su mano mutilada.' },
  // c003
  'Commissaire-priseur déchue': { en: 'Fallen auctioneer', es: 'Subastadora caída en desgracia' },
  'Panique si tu mentionnes Drouot, l’inventaire annuel ou les assurances.': { en: 'Panics if you mention Drouot, the annual inventory or insurers.', es: 'Entra en pánico si mencionas Drouot, el inventario anual o los seguros.' },
  'Méprise toute offre qu’elle juge indigne de son rang.': { en: 'Scorns any offer she finds beneath her rank.', es: 'Desprecia toda oferta que considera indigna de su rango.' },
  // c004
  'Coursier de nuit en T-Max': { en: 'Night courier on a T-Max scooter', es: 'Mensajero nocturno en T-Max' },
  'S’effondre si tu cites le cercle de jeux, son scooter ou l’heure qu’il est.': { en: 'Folds if you cite the gambling club, his scooter or what time it is.', es: 'Se desmorona si citas el círculo de juego, su scooter o la hora que es.' },
  'S’emporte si tu le prends pour un petit livreur sans cerveau.': { en: 'Flares up if you treat him like a brainless delivery boy.', es: 'Se enfurece si lo tratas como a un repartidor sin cerebro.' },
  // c005
  'Inspecteur des impôts véreux': { en: 'Crooked tax inspector', es: 'Inspector de Hacienda corrupto' },
  'Bafouille si tu parles de Bercy, du procureur ou des numéros de scellés.': { en: 'Stammers if you bring up the Treasury, the prosecutor or seal numbers.', es: 'Balbucea si hablas de Hacienda, del fiscal o de los números de precinto.' },
  'Se braque si tu l’accuses ouvertement d’être un flic.': { en: 'Bristles if you openly accuse him of being a cop.', es: 'Se pone a la defensiva si lo acusas abiertamente de ser policía.' },
  // c006
  'Hackeuse sous bracelet électronique': { en: 'Hacker under an ankle monitor', es: 'Hacker con tobillera electrónica' },
  'Panique si tu mentionnes le bracelet, la triangulation ou les logs réseau.': { en: 'Panics if you mention the monitor, triangulation or network logs.', es: 'Entra en pánico si mencionas la tobillera, la triangulación o los logs de red.' },
  'Explose si tu la traites d’amatrice ou de gamine.': { en: 'Explodes if you call her an amateur or a kid.', es: 'Explota si la llamas aficionada o niña.' },
  // c007
  'Aumônier de prison à la retraite': { en: 'Retired prison chaplain', es: 'Capellán de prisión jubilado' },
  'Craque si tu évoques la maison d’arrêt, l’évêché ou la confession.': { en: 'Cracks if you mention the jail, the bishopric or confession.', es: 'Cede si mencionas la cárcel, el obispado o la confesión.' },
  'Ne supporte pas qu’on le traite d’hypocrite.': { en: 'Cannot stand being called a hypocrite.', es: 'No soporta que lo llamen hipócrita.' },
  // c008
  'Négociante en art de Kyoto': { en: 'Kyoto art dealer', es: 'Marchante de arte de Kioto' },
  'Cède si tu remarques sa main gauche ou cites le clan de Kyoto.': { en: 'Yields if you notice her left hand or cite the Kyoto clan.', es: 'Cede si notas su mano izquierda o citas al clan de Kioto.' },
  'Explose face aux insultes ou aux offres insultantes.': { en: 'Explodes at insults or insulting offers.', es: 'Explota ante insultos u ofertas insultantes.' },
  // c009
  'Ancien videur de boîte de nuit': { en: 'Former nightclub bouncer', es: 'Antiguo portero de discoteca' },
  'Pâlit si tu évoques le patron du club, les caméras ou ses anciens collègues.': { en: 'Goes pale if you mention the club owner, the cameras or his old colleagues.', es: 'Palidece si mencionas al dueño del club, las cámaras o a sus antiguos compañeros.' },
  'Devient agressif si tu le provoques physiquement.': { en: 'Turns aggressive if you provoke him physically.', es: 'Se vuelve agresivo si lo provocas físicamente.' },
  // c010
  'Veuve d’un armateur marseillais': { en: 'Widow of a Marseille shipowner', es: 'Viuda de un armador marsellés' },
  'S’effondre si tu évoques le notaire, les créanciers ou son défunt mari.': { en: 'Breaks down if you mention the notary, the creditors or her late husband.', es: 'Se derrumba si mencionas al notario, a los acreedores o a su difunto marido.' },
  'Se vexe instantanément si tu doutes de son nom.': { en: 'Takes instant offense if you doubt her name.', es: 'Se ofende al instante si dudas de su apellido.' },
  // c011
  'Ex-traducteur militaire': { en: 'Former military translator', es: 'Excolaborador traductor militar' },
  'Sensible si tu mentionnes l’ambassade, l’armée ou les douanes militaires.': { en: 'Sensitive if you mention the embassy, the army or military customs.', es: 'Sensible si mencionas la embajada, el ejército o las aduanas militares.' },
  'Explose si tu remets en cause son honneur de soldat.': { en: 'Explodes if you question his honor as a soldier.', es: 'Explota si cuestionas su honor de soldado.' },
  // c012
  'Assistante parlementaire aux abois': { en: 'Cornered parliamentary aide', es: 'Asistente parlamentaria acorralada' },
  'Tremble si tu cites le Sénat, la presse ou son patron.': { en: 'Trembles if you cite the Senate, the press or her boss.', es: 'Tiembla si citas el Senado, la prensa o a su jefe.' },
  'Claque la porte si tu lui fais des remarques déplacées.': { en: 'Walks out if you make inappropriate remarks.', es: 'Se va dando un portazo si le haces comentarios fuera de lugar.' },
  // c013
  'Mécanicien de cargos fantômes': { en: 'Ghost-cargo ship mechanic', es: 'Mecánico de cargueros fantasma' },
  'Pâlit si tu évoques les garde-côtes, le pavillon libérien ou les épaves.': { en: 'Goes pale if you mention the coast guard, the Liberian flag or wrecks.', es: 'Palidece si mencionas a los guardacostas, el pabellón liberiano o los naufragios.' },
  'S’énerve si tu critiques la qualité de sa marchandise.': { en: 'Gets angry if you criticise the quality of his goods.', es: 'Se enfada si criticas la calidad de su mercancía.' },
  // c014
  'Infiltrée de la Brigade des Stups': { en: 'Narcotics Squad infiltrator', es: 'Infiltrada de la Brigada de Estupefacientes' },
  'Se trouble si tu repères son oreillette ou mentionnes la brigade.': { en: 'Rattled if you spot her earpiece or mention the squad.', es: 'Se turba si descubres su pinganillo o mencionas la brigada.' },
  'Se braque dès que tu avoues ouvertement faire du recel.': { en: 'Bristles as soon as you openly admit to fencing.', es: 'Se pone a la defensiva en cuanto admites abiertamente que traficas con robos.' },
  // c015
  'Héritier flambeur interdit de casino': { en: 'Spendthrift heir banned from casinos', es: 'Heredero derrochador con prohibición de casinos' },
  'Craque si tu menaces d’appeler son père ou le notaire familial.': { en: 'Cracks if you threaten to call his father or the family notary.', es: 'Cede si amenazas con llamar a su padre o al notario de la familia.' },
  'Explose si tu te moques de son accent ou de son nom.': { en: 'Explodes if you mock his accent or his name.', es: 'Explota si te burlas de su acento o de su apellido.' },
  // c016
  'Pharmacienne de nuit endettée': { en: 'Indebted night pharmacist', es: 'Farmacéutica nocturna endeudada' },
  'Panique si tu parles de l’Inspection sanitaire, des ordonnances ou des créanciers.': { en: 'Panics if you bring up health inspectors, prescriptions or creditors.', es: 'Entra en pánico si hablas de Sanidad, de recetas o de acreedores.' },
  'Refuse qu’on la traite de dealeuse.': { en: 'Refuses to be called a dealer.', es: 'No acepta que la llamen traficante.' },
  // c017
  'Ancien serrurier de coffres forts': { en: 'Former safe locksmith', es: 'Antiguo cerrajero de cajas fuertes' },
  'Se méfie si tu mentionnes les chantiers de la mairie ou les promoteurs.': { en: 'Grows wary if you mention city-hall building sites or developers.', es: 'Desconfía si mencionas las obras del ayuntamiento o a los promotores.' },
  'Déteste qu’on doute de son expertise technique.': { en: 'Hates having his technical expertise doubted.', es: 'Detesta que duden de su pericia técnica.' },
  // c018
  'Ancienne gymnaste devenue passeuse': { en: 'Former gymnast turned smuggler', es: 'Exgimnasta convertida en pasadora' },
  'Se crispe si tu parles de Minsk, des passeports ou des douaniers.': { en: 'Tenses up if you bring up Minsk, passports or customs officers.', es: 'Se tensa si hablas de Minsk, de pasaportes o de aduaneros.' },
  'Ne tolère aucun manque de respect.': { en: 'Tolerates no disrespect.', es: 'No tolera ninguna falta de respeto.' },
  // c019
  'Brocanterie en faillite rue des Rosiers': { en: 'Bankrupt junk shop on Rue des Rosiers', es: 'Anticuario en quiebra de la calle des Rosiers' },
  'Plie si tu prouves un défaut technique ou une usure cachée.': { en: 'Folds if you prove a technical flaw or hidden wear.', es: 'Cede si demuestras un defecto técnico o un desgaste oculto.' },
  'Explose si tu essaies de lui faire la leçon sur l’antiquité.': { en: 'Explodes if you try to lecture him about antiques.', es: 'Explota si intentas darle lecciones sobre antigüedades.' },
  // c020
  'Technicien fibre ayant fouillé un grenier': { en: 'Fiber technician who rummaged through an attic', es: 'Técnico de fibra que registró un desván' },
  'Craque vite si tu parles de police, de propriétaire ou de caméra d’immeuble.': { en: 'Cracks fast if you mention police, the landlord or building cameras.', es: 'Cede rápido si hablas de policía, del propietario o de las cámaras del edificio.' },
  'S’énerve si tu te fous de son âge.': { en: 'Gets angry if you make fun of his age.', es: 'Se enfada si te burlas de su edad.' },

  // Métiers procéduraux (80 personnages c021-c100)
  'Ex-convoyeur de fonds': { en: 'Former armored car guard', es: 'Extransportista de fondos' },
  'Veilleur de nuit au Louvre': { en: 'Louvre night watchman', es: 'Vigilante nocturno del Louvre' },
  'Chimiste de laboratoire clandestin': { en: 'Clandestine lab chemist', es: 'Químico de laboratorio clandestino' },
  'Ancien garde du corps d’oligarque': { en: 'Former oligarch bodyguard', es: 'Exguardaespaldas de oligarca' },
  'Archiviste radié du Quai d’Orsay': { en: 'Disbarred Quai d’Orsay archivist', es: 'Archivero inhabilitado de Exteriores' },
  'Croupier renvoyé du cercle Haussmann': { en: 'Fired Haussmann gaming club dealer', es: 'Crupier despedido del club Haussmann' },
  'Pilote d’hélicoptère privé': { en: 'Private helicopter pilot', es: 'Piloto de helicóptero privado' },
  'Restaurateur de toiles faussaire': { en: 'Art forger & restorer', es: 'Restaurador de arte falsificador' },
  'Dépanneur de coffres-forts': { en: 'Safe locksmith & cracker', es: 'Técnico de cajas fuertes' },
  'Agent de sûreté aéroportuaire': { en: 'Airport security officer', es: 'Agente de seguridad aeroportuaria' },
  'Ancien légionnaire endetté': { en: 'Indebted former legionnaire', es: 'Exlegionario endeudado' },
  'Courtier en crypto déchu': { en: 'Fallen crypto broker', es: 'Corredor de criptomonedas arruinado' },
  'Journaliste d’investigation aux abois': { en: 'Hounded investigative reporter', es: 'Periodista de investigación acosado' },
  'Avocat radié du barreau': { en: 'Disbarred attorney', es: 'Abogado inhabilitado' },
  'Majordome d’ambassade congédié': { en: 'Dismissed embassy butler', es: 'Mayordomo de embajada despedido' },

  'Ex-convoyeuse de fonds': { en: 'Former armored car guard', es: 'Extransportista de fondos' },
  'Restauratrice du patrimoine aux abois': { en: 'Cornered heritage art restorer', es: 'Restauradora de patrimonio acorralada' },
  'Croupière virée d’un cercle privé': { en: 'Fired private gaming club dealer', es: 'Crupier despedida de club privado' },
  'Avocate radiée du barreau': { en: 'Disbarred attorney', es: 'Abogada inhabilitada' },
  'Ancienne attachée de presse ministérielle': { en: 'Former ministerial press secretary', es: 'Exjefa de prensa ministerial' },
  'Négociante en pierres d’Anvers': { en: 'Antwerp gem trader', es: 'Marchante de gemas de Amberes' },
  'Archiviste radiée des Renseignements': { en: 'Disbarred Intelligence archivist', es: 'Archivera inhabilitada de Inteligencia' },
  'Hôtesse de jet privé endettée': { en: 'Indebted private jet flight attendant', es: 'Azafata de jet privado endeudada' },
  'Experte en horlogerie déchue': { en: 'Fallen luxury watchmaker', es: 'Experta en alta relojería caída en desgracia' },
  'Hackeuse freelance traquée': { en: 'Hunted freelance hacker', es: 'Hacker freelance perseguida' },
  'Fille de diplomate ruinée': { en: 'Ruined diplomat’s daughter', es: 'Hija de diplomático arruinada' },
  'Ancienne agent de sécurité VIP': { en: 'Former VIP security agent', es: 'Exagente de seguridad VIP' },
  'Biologiste sans labo': { en: 'Displaced research biologist', es: 'Bióloga sin laboratorio' },
  'Galériste en liquidation': { en: 'Liquidating art gallery owner', es: 'Galerista en liquidación' },
  'Traductrice d’écoutes judiciaires': { en: 'Wiretap court translator', es: 'Traductora de escuchas judiciales' },

  // Profils procéduraux (failles et lignes rouges)
  'Pressé par le temps et ses dettes (usurier, retard, 5h).': { en: 'Pressed for time and debts (loan shark, deadline, 5 AM).', es: 'Acosado por el tiempo y sus deudas (usurero, plazo, 5:00).' },
  'Pressée par le temps et ses dettes (usurier, retard, 5h).': { en: 'Pressed for time and debts (loan shark, deadline, 5 AM).', es: 'Acosada por el tiempo y sus deudas (usurero, plazo, 5:00).' },
  'Déteste qu’on le prenne pour un rigolo ou un pigeon.': { en: 'Hates being taken for a clown or an easy mark.', es: 'Detesta que lo tomen por un payaso o un incauto.' },
  'Déteste qu’on la prenne pour une rigolote ou un pigeon.': { en: 'Hates being taken for a lightweight or an easy mark.', es: 'Detesta que la tomen por novata o un incauto.' },
  'Terrorisé par le scandale (femme, patron, boîte, réputation).': { en: 'Terrified of scandal (wife, boss, firm, reputation).', es: 'Aterrorizado por el escándalo (esposa, jefe, empresa, reputación).' },
  'Terrorisée par le scandale (mari, conseil, boîte, réputation).': { en: 'Terrified of scandal (husband, board, firm, reputation).', es: 'Aterrorizada por el escándalo (marido, junta, empresa, reputación).' },
  'Explose si tu le menaces physiquement.': { en: 'Explodes if you threaten him physically.', es: 'Explota si lo amenazas físicamente.' },
  'Explose si tu la menaces physiquement.': { en: 'Explodes if you threaten her physically.', es: 'Explota si la amenazas físicamente.' },
  'Sensible si tu mentionnes radio, micro, brigade ou procédure.': { en: 'Rattled if you mention radio, wire, squad or procedure.', es: 'Sensible si mencionas radio, micrófono, brigada o procedimiento.' },
  'Se braque si tu avoues directement acheter du volé.': { en: 'Stiffens up if you openly admit to buying stolen goods.', es: 'Se cierra en banda si admites abiertamente comprar material robado.' },
  'Cède si tu évoques son père, sa famille, l’héritage ou la honte.': { en: 'Folds if you bring up his father, family, inheritance or disgrace.', es: 'Cede si mencionas a su padre, su familia, la herencia o la deshonra.' },
  'Déteste qu’on se moque de son train de vie ou de son statut.': { en: 'Hates being mocked about his lifestyle or status.', es: 'Detesta que se burlen de su tren de vida o de su estatus.' },
  'Plie si tu prouves techniquement un défaut ou une contrefaçon.': { en: 'Bends if you technically prove a flaw or a counterfeit.', es: 'Cede si demuestras técnicamente un defecto o una falsificación.' },
  'Explose aux insultes gratuites ou aux offres ridicules.': { en: 'Explodes at gratuitous insults or insulting lowball offers.', es: 'Explota ante insultos gratuitos u ofertas ridículas.' },
  'Panique si tu évoques la douane, les frontières ou Interpol.': { en: 'Panics if you bring up customs, border patrols or Interpol.', es: 'Entra en pánico si mencionas aduanas, fronteras o la Interpol.' },
  'Explose si tu le traites de lâche ou de balance.': { en: 'Explodes if you call him a coward or a rat.', es: 'Explota si lo llamas cobarde o soplón.' },
  'Explose si tu la traites de lâche ou de balance.': { en: 'Explodes if you call her a coward or a rat.', es: 'Explota si la llamas cobarde o sopla.' },
  'Craque si tu mentionnes l’avocat, le trust familial ou le tribunal.': { en: 'Cracks if you mention the lawyer, family trust or the courts.', es: 'Cede si mencionas al abogado, el fideicomiso familiar o los tribunales.' },
  'Craque si tu mentionnes l’avocat, le divorce ou le trust familial.': { en: 'Cracks if you mention the lawyer, divorce or family trust.', es: 'Cede si mencionas al abogado, el divorcio o el fideicomiso familiar.' },
  'Déteste la pitié et les remarques sur sa déchéance.': { en: 'Despises pity and remarks about his downfall.', es: 'Desprecia la compasión y los comentarios sobre su decadencia.' },
  'Déteste la pitié et les remarques sur son maquillage ou sa déchéance.': { en: 'Despises pity and remarks about her smeared makeup or downfall.', es: 'Desprecia la compasión y los comentarios sobre su maquillaje o decadencia.' },
  'Panique au mot diocèse, confession, évêché ou paroisse.': { en: 'Panics at the words diocese, confession, bishopric or parish.', es: 'Entra en pánico ante las palabras diócesis, confesión, obispado o parroquia.' },
  'Panique au mot diocèse, mère supérieure, confession ou couvent.': { en: 'Panics at the words diocese, mother superior, confession or convent.', es: 'Entra en pánico ante las palabras diócesis, madre superiora, confesión o convento.' },
  'Ne supporte pas qu’on le traite d’hypocrite ou de voleur d’église.': { en: 'Cannot stand being called a hypocrite or a church thief.', es: 'No soporta que lo llamen hipócrita o ladrón de iglesia.' },
  'Ne supporte pas qu’on la traite d’hypocrite ou de voleuse de sacristie.': { en: 'Cannot stand being called a hypocrite or a church thief.', es: 'No soporta que la llamen hipócrita o ladrona de sacristía.' },
  'Panique si tu mentionnes IP, logs, trace numérique ou DGSI.': { en: 'Panics if you mention IP address, server logs, digital footprint or intelligence.', es: 'Entra en pánico si mencionas IP, registros, rastro digital o inteligencia.' },
  'Explose si tu le traites de script kiddie ou d’amateur.': { en: 'Explodes if you call him a script kiddie or an amateur.', es: 'Explota si lo llamas aficionado o script kiddie.' },
  'Explose si tu la traites de script kiddie ou d’amatrice.': { en: 'Explodes if you call her a script kiddie or an amateur.', es: 'Explota si la llamas aficionada o script kiddie.' },
};

// Personnages générés : faille = « Pressé(e) par son secret : … » + ligne rouge générique.
const SECRET_I18N: Record<string, { en: string; es: string }> = {
  'doit quitter le territoire par cargo avant 06h00 demain matin.': { en: 'has to leave the country by cargo ship before 6:00 a.m. tomorrow.', es: 'tiene que salir del país en carguero antes de las 6:00 de mañana.' },
  'a subtilisé la pièce dans le bureau privé d’un client trop confiant.': { en: 'lifted the piece from an overtrusting client’s private office.', es: 'sustrajo la pieza del despacho privado de un cliente demasiado confiado.' },
  'un créancier retient sa voiture en otage à deux rues d’ici.': { en: 'a creditor is holding their car hostage two streets away.', es: 'un acreedor retiene su coche como rehén a dos calles de aquí.' },
  'la pièce vient d’un héritage contesté dont personne n’a l’inventaire.': { en: 'the piece comes from a contested inheritance nobody has an inventory of.', es: 'la pieza viene de una herencia en disputa de la que nadie tiene inventario.' },
  'a effacé les caméras de surveillance pendant exactement quatre minutes.': { en: 'wiped the surveillance cameras for exactly four minutes.', es: 'borró las cámaras de vigilancia durante exactamente cuatro minutos.' },
  'cache une double vie qui s’effondrera au moindre scandale public.': { en: 'hides a double life that would collapse at the slightest public scandal.', es: 'oculta una doble vida que se derrumbaría ante el mínimo escándalo público.' },
  'doit payer une caution judiciaire en liquide avant l’ouverture du greffe.': { en: 'has to pay a court bail in cash before the registry opens.', es: 'debe pagar una fianza judicial en efectivo antes de que abra el registro.' },
  'a trouvé la pièce dans une saisie douanière mal scellée.': { en: 'found the piece in a badly sealed customs seizure.', es: 'encontró la pieza en una incautación aduanera mal precintada.' },
};
T['Explose si tu l’insultes ou le traites de menteur.'] = { en: 'Explodes if you insult him or call him a liar.', es: 'Explota si lo insultas o lo llamas mentiroso.' };
T['Explose si tu l’insultes ou la traites de menteuse.'] = { en: 'Explodes if you insult her or call her a liar.', es: 'Explota si la insultas o la llamas mentirosa.' };

/** Texte de personnage : renvoie la traduction si elle existe, sinon le français d'origine. */
export function localizeCastText(fr: string, locale: Locale): string {
  if (locale === 'fr') return fr;
  if (T[fr]) return T[fr][locale];
  const m = /^Pressée? par son secret : (.*)$/.exec(fr);
  if (m && SECRET_I18N[m[1]]) {
    const fem = fr.startsWith('Pressée');
    return locale === 'en' ? `Pressured by a secret: ${SECRET_I18N[m[1]].en}` : `${fem ? 'Presionada' : 'Presionado'} por su secreto: ${SECRET_I18N[m[1]].es}`;
  }
  return fr;
}

// Collections du Codex (titres, descriptions, atouts). Clé = français d'origine.
const CODEX: Record<string, { en: string; es: string }> = {
  'Secrets d’État & Guerre Froide': { en: 'State Secrets & Cold War', es: 'Secretos de Estado y Guerra Fría' },
  'Archives volées, matériel d’espionnage déclassé et dossiers compromettants.': { en: 'Stolen archives, declassified spy gear and compromising files.', es: 'Archivos robados, material de espionaje desclasificado y expedientes comprometedores.' },
  'Immunité Fédérale': { en: 'Federal Immunity', es: 'Inmunidad Federal' },
  'La police hésite à toucher à ta boutique : -25% de Heat généré sur tous les deals.': { en: 'Police think twice about touching your shop: −25% Heat generated on every deal.', es: 'La policía duda en tocar tu tienda: −25 % de Heat generado en todos los tratos.' },
  'Joyaux de la Couronne & Trésors Impériaux': { en: 'Crown Jewels & Imperial Treasures', es: 'Joyas de la Corona y Tesoros Imperiales' },
  'Bijouterie princière, gemmes mythiques et trésors pillés aux dynasties déchues.': { en: 'Princely jewelry, mythical gems and treasures looted from fallen dynasties.', es: 'Joyería principesca, gemas míticas y tesoros saqueados a dinastías caídas.' },
  'Clientèle Aristocratique': { en: 'Aristocratic Clientele', es: 'Clientela Aristocrática' },
  'Les collectionneurs privés paient le prix fort : +18% de valeur lors des ventes aux enchères.': { en: 'Private collectors pay top dollar: +18% value at auctions.', es: 'Los coleccionistas privados pagan a precio de oro: +18 % de valor en las subastas.' },
  'Arsenal Clandestin & Pièces d’Élite': { en: 'Clandestine Arsenal & Elite Pieces', es: 'Arsenal Clandestino y Piezas de Élite' },
  'Armement de guerre introuvable, prototypes modifiés et armes historiques de maîtres.': { en: 'Unobtainable war weaponry, modified prototypes and master-crafted historic arms.', es: 'Armamento de guerra inencontrable, prototipos modificados y armas históricas de maestros.' },
  'Garde Rapprochée': { en: 'Close Guard', es: 'Guardia Cercana' },
  'Les clients sentent le danger : tu ne peux plus subir de braquage spontané.': { en: 'Clients sense the danger: you can no longer suffer a spontaneous hold-up.', es: 'Los clientes huelen el peligro: ya no puedes sufrir un atraco espontáneo.' },
  'Toiles de Maître & Faussaires de Génie': { en: 'Master Paintings & Genius Forgers', es: 'Lienzos Maestros y Falsificadores Geniales' },
  'Chefs-d’œuvre spoliés, études préparatoires et contrefaçons indétectables.': { en: 'Plundered masterpieces, preparatory studies and undetectable forgeries.', es: 'Obras maestras expoliadas, estudios preparatorios y falsificaciones indetectables.' },
  'Œil d’Expert': { en: 'Expert’s Eye', es: 'Ojo Experto' },
  'Tu détectes immédiatement toutes les contrefaçons au premier coup d’œil (100% garanti).': { en: 'You spot every forgery at first glance (100% guaranteed).', es: 'Detectas todas las falsificaciones a primera vista (100 % garantizado).' },
  'Cyber-Pègre & Technologie Noire': { en: 'Cyber-Underworld & Black Tech', es: 'Ciberhampa y Tecnología Negra' },
  'Hardware de crypto-hackers, matériel d’interception et clés d’infrastructures critiques.': { en: 'Crypto-hacker hardware, interception gear and critical-infrastructure keys.', es: 'Hardware de cripto-hackers, equipo de interceptación y llaves de infraestructuras críticas.' },
  'Contre-Surveillance': { en: 'Counter-Surveillance', es: 'Contravigilancia' },
  'Les flics ne peuvent plus poser de mouchard sur tes pièces : la police est aveugle.': { en: 'Cops can no longer plant a tracker on your pieces: the police are blind.', es: 'La policía ya no puede poner rastreadores en tus piezas: está ciega.' },
  'Reliques Sacrées & Ésotériques': { en: 'Sacred & Esoteric Relics', es: 'Reliquias Sagradas y Esotéricas' },
  'Objets de culte clandestins, trésors templiers et artefacts sacrés convoités par les loges.': { en: 'Clandestine cult objects, Templar treasures and sacred artifacts coveted by the lodges.', es: 'Objetos de culto clandestinos, tesoros templarios y artefactos sagrados codiciados por las logias.' },
  'Trésorerie Noire': { en: 'Black Treasury', es: 'Tesorería Negra' },
  'Les loges et sectes arrosent ta boutique : +400 $ de dividende net chaque matin.': { en: 'Lodges and sects shower your shop: +$400 net dividend every morning.', es: 'Las logias y sectas riegan tu tienda: +400 $ de dividendo neto cada mañana.' },
};

export function localizeCodexText(fr: string, locale: Locale): string {
  return locale === 'fr' ? fr : (CODEX[fr]?.[locale] ?? fr);
}
