import type { Locale } from './seoContent';
import { COLLECTIONS_DATA } from './codex';
import { localizeCodexItem } from './codexI18n';
import { localizeCodexText } from './castI18n';

// Textes d'objets du catalogue (noms de base, aspect, indice Loupe, indice UV). Clé = français d'origine.
const rows: [string, string, string][] = [
  // Noms de base manquants dans ITEM_BASE_TRANSLATIONS
  ['Revolver .357 de Collection', 'Collector’s .357 revolver', 'Revólver .357 de colección'],
  ['Katana ancien forgé main', 'Antique hand-forged katana', 'Katana antiguo forjado a mano'],
  ['Œuf émaillé impérial', 'Imperial enamel egg', 'Huevo esmaltado imperial'],
  ['Violoncelle ancien verni ambre', 'Antique amber-varnished cello', 'Violonchelo antiguo barnizado en ámbar'],
  ['Calice d’argent martelé', 'Hammered silver chalice', 'Cáliz de plata martillada'],
  ['Masque rituel en obsidienne', 'Obsidian ritual mask', 'Máscara ritual de obsidiana'],
  ['Micro-drone tactique thermique', 'Thermal tactical micro-drone', 'Microdrón táctico térmico'],
  ['Chevalière héraldique en or', 'Gold heraldic signet ring', 'Sello heráldico de oro'],
  ['Plaque diplomatique CMD', 'CMD diplomatic plate', 'Matrícula diplomática CMD'],
  ['Gilet pare-balles composite', 'Composite bulletproof vest', 'Chaleco antibalas compuesto'],
  ['Dossier confidentiel relié', 'Bound confidential file', 'Expediente confidencial encuadernado'],
  ['Montre Patek Philippe vintage', 'Vintage Patek Philippe watch', 'Reloj Patek Philippe vintage'],
  ['Revolver Colt Python chromé', 'Chrome Colt Python revolver', 'Revólver Colt Python cromado'],
  ['Fusil de précision démonté', 'Dismantled precision rifle', 'Fusil de precisión desmontado'],
  ['Cryptophone satellite Iridium', 'Iridium satellite cryptophone', 'Criptoteléfono satelital Iridium'],
  ['Lingot d’or de raffinerie', 'Refinery gold ingot', 'Lingote de oro de refinería'],
  ['Toile expressionniste roulée', 'Rolled expressionist canvas', 'Lienzo expresionista enrollado'],
  ['Scanner fréquences chiffrées', 'Encrypted-frequency scanner', 'Escáner de frecuencias cifradas'],
  ['Émeraude colombienne sertie', 'Set Colombian emerald', 'Esmeralda colombiana engarzada'],
  ['Manuscrit enluminé XIVe', 'Illuminated 14th-century manuscript', 'Manuscrito iluminado del siglo XIV'],
  ['Luger P08 gravé or', 'Gold-engraved Luger P08', 'Luger P08 grabada en oro'],
  // Aspect (surface)
  ['Boîtier titane étanche sans marque apparente.', 'Waterproof titanium case with no visible markings.', 'Carcasa de titanio estanca sin marcas visibles.'],
  ['Clé crypto première génération avec écran OLED terne.', 'First-generation crypto key with a dull OLED screen.', 'Llave cripto de primera generación con pantalla OLED opaca.'],
  ['Pierre octaédrique translucide aux reflets bleutés.', 'Translucent octahedral stone with bluish glints.', 'Piedra octaédrica translúcida con destellos azulados.'],
  ['Lame courbe avec ligne de trempe ondulée et fourreau laqué.', 'Curved blade with a wavy temper line and lacquered scabbard.', 'Hoja curva con línea de temple ondulada y vaina lacada.'],
  ['Émail guilloché rubis et monture en or ciselé.', 'Ruby guilloché enamel in a chased gold mount.', 'Esmalte guilloché rubí con montura de oro cincelado.'],
  ['Bois d’érable ondé et étiquette jaunie à l’intérieur.', 'Flamed maple wood with a yellowed label inside.', 'Madera de arce ondulada y etiqueta amarillenta en el interior.'],
  ['Panneau de bois peint à la détrempe et feuille d’or craquelée.', 'Tempera-painted wood panel with cracked gold leaf.', 'Tabla pintada al temple con pan de oro agrietado.'],
  ['Coupe liturgique lourde ornée de cabochons rouges.', 'Heavy liturgical cup set with red cabochons.', 'Copa litúrgica pesada con cabujones rojos.'],
  ['Pierre volcanique noire polie avec incrustations turquoise.', 'Polished black volcanic stone with turquoise inlays.', 'Piedra volcánica negra pulida con incrustaciones de turquesa.'],
  ['Châssis carbone mat pliable avec optique infrarouge.', 'Matte foldable carbon frame with infrared optics.', 'Chasis de carbono mate plegable con óptica infrarroja.'],
  ['Or 18 carats gravé d’un blason familial usé.', '18-carat gold engraved with a worn family crest.', 'Oro de 18 quilates grabado con un escudo familiar gastado.'],
  ['Plaque métallique verte à liseré doré avec boulons tordus.', 'Green metal plate with gold trim and bent bolts.', 'Placa metálica verde con ribete dorado y tornillos torcidos.'],
  ['Housse noire discrète avec deux plaques céramiques niveau IV.', 'Discreet black cover with two level-IV ceramic plates.', 'Funda negra discreta con dos placas cerámicas de nivel IV.'],
  ['Chemise cartonnée rouge sang fermée par un élastique.', 'Blood-red cardboard folder held shut by an elastic band.', 'Carpeta roja sangre cerrada con una goma elástica.'],
  ['Boîtier or jaune ultra-fin, bracelet alligator usé.', 'Ultra-thin yellow-gold case, worn alligator strap.', 'Caja de oro amarillo ultrafina, correa de cocodrilo gastada.'],
  ['Canon ventilé 4 pouces, crosse noyer quadrillée.', '4-inch vented barrel, checkered walnut grip.', 'Cañón ventilado de 4 pulgadas, empuñadura de nogal cuadriculada.'],
  ['Mallette mousse découpée sur mesure avec lunette nocturne.', 'Custom foam-cut case with a night scope.', 'Maletín de espuma cortada a medida con mira nocturna.'],
  ['Téléphone blindé à grosse antenne rétractable.', 'Armored phone with a large retractable antenna.', 'Teléfono blindado con gran antena retráctil.'],
  ['Barre de 250g coulée artisanalement, poinçon fondu.', '250 g bar cast by hand, hallmark melted away.', 'Barra de 250 g fundida artesanalmente, punzón fundido.'],
  ['Châssis absent — toile découpée proprement au cutter.', 'No frame — canvas neatly cut out with a box cutter.', 'Sin bastidor: lienzo cortado limpiamente con cúter.'],
  ['Livret bordeaux neuf avec puce biométrique intacte.', 'New burgundy booklet with an intact biometric chip.', 'Libreto burdeos nuevo con chip biométrico intacto.'],
  ['Boîtier radio noir modifié avec double antenne.', 'Modified black radio box with dual antennas.', 'Caja de radio negra modificada con doble antena.'],
  ['Pierre verte de 14 carats démontée d’un collier royal.', '14-carat green stone pried from a royal necklace.', 'Piedra verde de 14 quilates desmontada de un collar real.'],
  ['Parchemin de vélin orné d’or et de lapis-lazuli.', 'Vellum parchment decorated with gold and lapis lazuli.', 'Pergamino de vitela adornado con oro y lapislázuli.'],
  ['Pistolet historique à genouillère, damasquinage doré.', 'Historic toggle-lock pistol with gold damascening.', 'Pistola histórica de rodillera con damasquinado dorado.'],
  ['Routeur noir modifié alimenté par batterie LiPo externe.', 'Modified black router powered by an external LiPo battery.', 'Router negro modificado alimentado por batería LiPo externa.'],
  ['Billets serrés sous bande bancaire perforée.', 'Bills bound under a perforated bank strap.', 'Billetes apretados bajo una banda bancaria perforada.'],
  ['Caisson médical carbone avec voyant batterie à 18 %.', 'Carbon medical case with a battery light at 18%.', 'Cajón médico de carbono con indicador de batería al 18 %.'],
  ['Juxtaposé calibre 12 enveloppé dans un torchon gras.', '12-gauge side-by-side wrapped in a greasy rag.', 'Paralela del calibre 12 envuelta en un trapo grasiento.'],
  ['32 pierres taille brillant glissées dans du velours noir.', '32 brilliant-cut stones slipped into black velvet.', '32 piedras talla brillante deslizadas en terciopelo negro.'],
  // Indices Loupe
  ['Porte des micro-rayures d’un lecteur sécurisé gouvernemental.', 'Carries micro-scratches from a secure government reader.', 'Lleva microarañazos de un lector gubernamental seguro.'],
  ['Étiquette manuscrite au dos portant 4 mots d’une seed phrase.', 'Handwritten label on the back with 4 words of a seed phrase.', 'Etiqueta manuscrita detrás con 4 palabras de una frase semilla.'],
  ['Aucune gravure laser GIA — provenance directe hors circuit Kimberley.', 'No GIA laser engraving — straight from outside the Kimberley circuit.', 'Sin grabado láser GIA: procedencia directa fuera del circuito Kimberley.'],
  ['Signature gravée sur la soie sous le manche : atelier du XVIIe.', 'Signature engraved on the tang under the handle: 17th-century workshop.', 'Firma grabada en la espiga bajo la empuñadura: taller del siglo XVII.'],
  ['Poinçon de maître orfèvre authentique sous le socle.', 'Authentic master goldsmith hallmark under the base.', 'Punzón auténtico de maestro orfebre bajo la base.'],
  ['Réparation de fracture d’âme faite au XIXe siècle.', 'Sound-post fracture repaired in the 19th century.', 'Reparación de una fractura del alma hecha en el siglo XIX.'],
  ['Cadre scié à la hâte — arrachée d’une chapelle privée.', 'Frame hastily sawn off — torn from a private chapel.', 'Marco serrado a toda prisa: arrancado de una capilla privada.'],
  ['Devise latine partiellement limée sur le pied.', 'Latin motto partly filed off the foot.', 'Lema latino parcialmente limado en el pie.'],
  ['Terre sèche encore logée dans les orbites — fouille clandestine.', 'Dry soil still lodged in the eye sockets — illegal dig.', 'Tierra seca aún alojada en las órbitas: excavación clandestina.'],
  ['Batterie militaire sans marquage civil et liaison chiffrée.', 'Military battery with no civilian marking and an encrypted link.', 'Batería militar sin marcas civiles y enlace cifrado.'],
  ['Initiales et date « 1924 » gravées à l’intérieur de l’anneau.', 'Initials and the date "1924" engraved inside the band.', 'Iniciales y la fecha «1924» grabadas dentro del anillo.'],
  ['Peinture de pare-chocs arrachée autour des vis.', 'Bumper paint torn away around the screws.', 'Pintura del parachoques arrancada alrededor de los tornillos.'],
  ['Impact de calibre 9mm arrêté dans la plaque avant.', '9mm impact stopped in the front plate.', 'Impacto de calibre 9 mm detenido en la placa frontal.'],
  ['Contient des écoutes retranscrites et des photos de filature.', 'Contains transcribed wiretaps and surveillance photos.', 'Contiene escuchas transcritas y fotos de seguimiento.'],
  ['Numéro de mouvement intact correspondant à une succession contestée.', 'Intact movement number matching a contested estate.', 'Número de movimiento intacto que corresponde a una herencia en disputa.'],
  ['Deux chambres du barillet sentent encore la poudre fraîche.', 'Two chambers of the cylinder still smell of fresh powder.', 'Dos cámaras del tambor aún huelen a pólvora fresca.'],
  ['Silencieux artisanal fileté et trois douilles récupérées.', 'Threaded homemade suppressor and three recovered casings.', 'Silenciador casero roscado y tres casquillos recuperados.'],
  ['Dernier appel émis il y a 22 minutes vers un cargo en mer.', 'Last call placed 22 minutes ago to a cargo ship at sea.', 'Última llamada hecha hace 22 minutos a un carguero en alta mar.'],
  ['Angles martelés pour masquer l’estampille d’origine.', 'Corners hammered to hide the original stamp.', 'Esquinas martilladas para ocultar el sello de origen.'],
  ['Signature en coin recouverte d’un vernis de restauration.', 'Corner signature covered with restoration varnish.', 'Firma de la esquina cubierta con barniz de restauración.'],
  ['Numéro de série d’un lot déclaré disparu en ambassade.', 'Serial number from a batch reported missing at an embassy.', 'Número de serie de un lote declarado desaparecido en una embajada.'],
  ['Mémoire verrouillée sur les canaux de la Brigade Financière.', 'Memory locked on the Financial Crimes Squad channels.', 'Memoria bloqueada en los canales de la Brigada Financiera.'],
  ['Griffes en platine tordues à la pince coupante.', 'Platinum prongs bent with wire cutters.', 'Garras de platino dobladas con alicates de corte.'],
  ['Arraché d’une reliure monastique — bord gauche dentelé.', 'Torn from a monastic binding — jagged left edge.', 'Arrancado de una encuadernación monástica: borde izquierdo dentado.'],
  ['Chargeur plein avec balles d’époque sous-chargées.', 'Full magazine with underloaded period rounds.', 'Cargador lleno con balas de época con carga reducida.'],
  ['Capte les identifiants mobiles dans un rayon de 400 m.', 'Captures mobile identifiers within a 400 m radius.', 'Capta identificadores móviles en un radio de 400 m.'],
  ['Numéros de série consécutifs d’une rançon récente.', 'Consecutive serial numbers from a recent ransom.', 'Números de serie consecutivos de un rescate reciente.'],
  ['Échantillons biologiques numérotés sous azote.', 'Numbered biological samples under nitrogen.', 'Muestras biológicas numeradas bajo nitrógeno.'],
  ['Crosse raccourcie au ruban adhésif noir, poudre fraîche.', 'Stock shortened with black tape, fresh powder.', 'Culata acortada con cinta negra, pólvora fresca.'],
  ['Fermoir en or blanc brisé net à la pince.', 'White-gold clasp snapped clean with pliers.', 'Cierre de oro blanco roto limpiamente con alicates.'],
  // Indices UV
  ['Sous UV : numéro d’inventaire du Parquet gratté à l’acétone.', 'Under UV: the Prosecutor’s inventory number scraped off with acetone.', 'Bajo UV: número de inventario de la Fiscalía rascado con acetona.'],
  ['Sous UV : empreinte digitale nette sur le bouton de validation.', 'Under UV: a clean fingerprint on the confirm button.', 'Bajo UV: huella dactilar nítida en el botón de validación.'],
  ['Sous UV : fluorescence bleu vif typique des gisements d’Anvers.', 'Under UV: vivid blue fluorescence typical of Antwerp deposits.', 'Bajo UV: fluorescencia azul intensa típica de los yacimientos de Amberes.'],
  ['Sous UV : traces anciennes nettoyées près de la garde en fer.', 'Under UV: old traces wiped near the iron guard.', 'Bajo UV: restos antiguos limpiados junto a la guarda de hierro.'],
  ['Sous UV : cire de scellé de galerie privée encore visible.', 'Under UV: private gallery seal wax still visible.', 'Bajo UV: cera de sello de galería privada aún visible.'],
  ['Sous UV : vernis d’époque aux résines naturelles, zéro colle moderne.', 'Under UV: period varnish with natural resins, no modern glue.', 'Bajo UV: barniz de época con resinas naturales, sin pegamento moderno.'],
  ['Sous UV : numéro d’inventaire du patrimoine ecclésiastique.', 'Under UV: church heritage inventory number.', 'Bajo UV: número de inventario del patrimonio eclesiástico.'],
  ['Sous UV : résidu de cire d’autel et de vernis muséal.', 'Under UV: altar wax and museum varnish residue.', 'Bajo UV: residuo de cera de altar y barniz de museo.'],
  ['Sous UV : étiquette de transit douanier déchirée au dos.', 'Under UV: customs transit label torn off the back.', 'Bajo UV: etiqueta de tránsito aduanero arrancada en el dorso.'],
  ['Sous UV : code d’unité d’intervention effacé au solvant.', 'Under UV: intervention unit code wiped off with solvent.', 'Bajo UV: código de unidad de intervención borrado con disolvente.'],
  ['Sous UV : micro-trace de poudre noire sur le chaton.', 'Under UV: micro-trace of black powder on the bezel.', 'Bajo UV: microhuella de pólvora negra en el engaste.'],
  ['Sous UV : hologramme officiel du Quai d’Orsay authentique.', 'Under UV: authentic official Quai d’Orsay hologram.', 'Bajo UV: holograma oficial auténtico del Quai d’Orsay.'],
  ['Sous UV : matricule d’équipement de police effacé.', 'Under UV: police equipment ID erased.', 'Bajo UV: matrícula de equipo policial borrada.'],
  ['Sous UV : tampon « SECRET DÉFENSE » barré au feutre.', 'Under UV: "TOP SECRET" stamp crossed out in marker.', 'Bajo UV: sello «SECRETO DE DEFENSA» tachado con rotulador.'],
  ['Sous UV : gravure horlogère invisible de Genève sous la corne.', 'Under UV: invisible Geneva watchmaker engraving under the lug.', 'Bajo UV: grabado relojero invisible de Ginebra bajo el asa.'],
  ['Sous UV : numéro de série limé chimiquement sur la carcasse.', 'Under UV: serial number chemically filed off the frame.', 'Bajo UV: número de serie limado químicamente en el armazón.'],
  ['Sous UV : trace de solvant de nettoyage militaire récent.', 'Under UV: trace of recent military cleaning solvent.', 'Bajo UV: resto de disolvente de limpieza militar reciente.'],
  ['Sous UV : puce de chiffrement scellée à la résine époxy.', 'Under UV: encryption chip sealed with epoxy resin.', 'Bajo UV: chip de cifrado sellado con resina epoxi.'],
  ['Sous UV : traces d’acide de test chez un diamantaire.', 'Under UV: acid-test marks from a diamond dealer.', 'Bajo UV: marcas de ácido de prueba de un diamantista.'],
  ['Sous UV : étiquette d’exposition d’une galerie suisse.', 'Under UV: exhibition label from a Swiss gallery.', 'Bajo UV: etiqueta de exposición de una galería suiza.'],
  ['Sous UV : filigranes officiels 100 % authentiques.', 'Under UV: 100% authentic official watermarks.', 'Bajo UV: filigranas oficiales 100 % auténticas.'],
  ['Sous UV : autocollant de maintenance de fourgon arraché.', 'Under UV: van maintenance sticker torn off.', 'Bajo UV: pegatina de mantenimiento de furgón arrancada.'],
  ['Sous UV : aucune résine de remplissage — pierre pure.', 'Under UV: no filler resin — pure stone.', 'Bajo UV: sin resina de relleno: piedra pura.'],
  ['Sous UV : tampon de bibliothèque universitaire gratté.', 'Under UV: university library stamp scratched off.', 'Bajo UV: sello de biblioteca universitaria rascado.'],
  ['Sous UV : trace d’huile de coffre-fort privé.', 'Under UV: oil trace from a private safe.', 'Bajo UV: resto de aceite de caja fuerte privada.'],
  ['Sous UV : soudure manuelle sur la puce GPS désactivée.', 'Under UV: hand solder on the disabled GPS chip.', 'Bajo UV: soldadura manual en el chip GPS desactivado.'],
  ['Sous UV : trace d’encre antivol rose sur la tranche.', 'Under UV: pink anti-theft ink trace on the edge.', 'Bajo UV: resto de tinta antirrobo rosa en el canto.'],
  ['Sous UV : code-barres de clinique privée gratté.', 'Under UV: private clinic barcode scratched off.', 'Bajo UV: código de barras de clínica privada rascado.'],
  ['Sous UV : empreinte partielle sur le pontet.', 'Under UV: partial fingerprint on the trigger guard.', 'Bajo UV: huella parcial en el guardamonte.'],
  ['Sous UV : micro-inclusions naturelles authentiques.', 'Under UV: authentic natural micro-inclusions.', 'Bajo UV: microinclusiones naturales auténticas.'],
];

/** Les 20 noms de base ajoutés ici (les 20 premières lignes), à fusionner dans ITEM_BASE_TRANSLATIONS. */
export const ITEM_BASE_EXTRA: Record<string, { en: string; es: string }> = Object.fromEntries(
  rows.slice(0, 21).map(([fr, en, es]) => [fr, { en, es }]),
);

const MAP = new Map(rows.map(([fr, en, es]) => [fr, { en, es }]));

// ---- Compléments : noms de base manquants, aspects, indices Loupe et UV des objets non-Codex.
const NAME_ROWS: [string, string, string][] = [
  ['Fusil de chasse scié', 'Sawed-off hunting shotgun', 'Escopeta de caza recortada'],
  ['Icône byzantine volée au musée', 'Byzantine icon stolen from the museum', 'Icono bizantino robado del museo'],
  ['Liasses de faux billets qualité AAA', 'Bundles of AAA-grade counterfeit bills', 'Fajos de billetes falsos de calidad AAA'],
  ['Carte d’identité militaire falsifiée', 'Forged military ID card', 'Carné militar falsificado'],
  ['Violoncelle miniature Stradivarius (contrefait)', 'Miniature Stradivarius cello (counterfeit)', 'Violonchelo en miniatura Stradivarius (falsificado)'],
  ['Boîtier de surveillance WiFi modifié', 'Modified WiFi surveillance box', 'Caja de vigilancia WiFi modificada'],
  ['Plaque d’immatriculation diplomatique', 'Diplomatic license plate', 'Matrícula diplomática'],
];
export const ITEM_NAME_EXTRA: Record<string, { en: string; es: string }> = Object.fromEntries(
  NAME_ROWS.map(([fr, en, es]) => [fr, { en, es }]),
);

const MORE_ROWS: [string, string, string][] = [
  // Aspects
  ['Billets de 200 € impeccables, empilés sous film thermo-soudé.', 'Flawless €200 bills stacked under heat-sealed film.', 'Billetes de 200 € impecables, apilados bajo film termosellado.'],
  ['Boîtier lourd, gravure personnalisée effacée à la lime.', 'Heavy case, custom engraving filed away.', 'Caja pesada, grabado personalizado borrado con lima.'],
  ['Double canon scié à la meuleuse, crosse entourée de scotch noir.', 'Double barrel cut off with a grinder, stock wrapped in black tape.', 'Doble cañón cortado con amoladora, culata envuelta en cinta negra.'],
  ['Billets de 100 € marqués en bande de banque (change noir ~30 %).', 'Bank-banded €100 bills, marked (black-market exchange ~30%).', 'Billetes de 100 € marcados con banda bancaria (cambio negro ~30 %).'],
  ['Peinture à l’huile découpée au cutter hors de son cadre.', 'Oil painting cut out of its frame with a box cutter.', 'Óleo cortado de su marco con un cúter.'],
  ['Smartphone blindé sans carte SIM apparente, écran fissuré.', 'Armored smartphone with no visible SIM card, cracked screen.', 'Smartphone blindado sin tarjeta SIM visible, pantalla rota.'],
  ['Canon chromé, crosse en noyer usée par la sueur.', 'Chrome barrel, walnut grip worn by sweat.', 'Cañón cromado, empuñadura de nogal gastada por el sudor.'],
  ['Routeur noir sans marque, antennes soudées à la main, ventilateur bruyant.', 'Unbranded black router, hand-soldered antennas, noisy fan.', 'Router negro sin marca, antenas soldadas a mano, ventilador ruidoso.'],
  ['Panneau de bois doré à la feuille, visage peint à la tempera, 40 cm.', 'Gold-leaf wood panel, tempera-painted face, 40 cm.', 'Tabla dorada a la hoja, rostro pintado al temple, 40 cm.'],
  ['Valise médicale grise qui vibre légèrement sur batterie.', 'Grey medical case humming slightly on battery.', 'Maletín médico gris que vibra levemente con la batería.'],
  ['Clé blindée en titane, LED rouge fixe, connecteur tordu.', 'Armored titanium key, steady red LED, bent connector.', 'Llave blindada de titanio, LED rojo fijo, conector torcido.'],
  ['Badge rigide format carte de crédit, hologramme Défense nationale.', 'Rigid credit-card-size badge, National Defense hologram.', 'Tarjeta rígida tamaño tarjeta de crédito, holograma de Defensa Nacional.'],
  ['Pierre translucide irrégulière dans un sachet antistatique froissé.', 'Irregular translucent stone in a crumpled antistatic bag.', 'Piedra translúcida irregular en una bolsa antiestática arrugada.'],
  ['Boîtier en platine, bracelet alligator arraché au fermoir.', 'Platinum case, alligator strap torn from the clasp.', 'Caja de platino, correa de cocodrilo arrancada del cierre.'],
  ['Livret officiel neuf sans photo, puce biométrique intacte.', 'New official booklet without a photo, biometric chip intact.', 'Libreto oficial nuevo sin foto, chip biométrico intacto.'],
  ['Etui rigide cabossé, instrument verni, étiquette Stradivarius 1721.', 'Dented hard case, varnished instrument, Stradivarius 1721 label.', 'Estuche rígido abollado, instrumento barnizado, etiqueta Stradivarius 1721.'],
  ['Plaque verte CMD avec liseré doré, boulons encore vissés.', 'Green CMD plate with gold trim, bolts still screwed in.', 'Placa verde CMD con ribete dorado, tornillos aún puestos.'],
  ['Lingot poinçonné dont le numéro de fondeur a été meulé.', 'Hallmarked ingot whose smelter number has been ground off.', 'Lingote punzonado cuyo número de fundidor ha sido lijado.'],
  // Indices Loupe
  ['Un billet en surface porte un numéro de série identique au suivant.', 'A bill on top carries the same serial number as the next one.', 'Un billete de la superficie lleva el mismo número de serie que el siguiente.'],
  ['Un traceur GPS est collé sous la doublure : +12 % de Heat chaque nuit tant qu\'elle reste au coffre.', 'A GPS tracker is stuck under the lining: +12% Heat every night while it stays in the vault.', 'Hay un rastreador GPS pegado bajo el forro: +12 % de Heat cada noche mientras siga en la caja fuerte.'],
  ['Pièce de collection authentifiée : elle se revendra 35 % plus cher, mais le vendeur le sait et se méfie.', 'Authenticated collector’s piece: it will resell 35% higher, but the seller knows it and is wary.', 'Pieza de colección autenticada: se revenderá un 35 % más cara, pero el vendedor lo sabe y desconfía.'],
  ['CONTREFAÇON : gravure laser trop nette, métal trop léger. Elle ne vaut que 40 % de sa valeur rue.', 'COUNTERFEIT: laser engraving too crisp, metal too light. It is worth only 40% of its street value.', 'FALSIFICACIÓN: grabado láser demasiado nítido, metal demasiado ligero. Solo vale el 40 % de su valor de calle.'],
  ['Du sang séché dans les maillons et le bracelet est cassé net comme arraché.', 'Dried blood in the links and the strap is snapped clean as if torn off.', 'Sangre seca en los eslabones y la correa está rota limpiamente, como arrancada.'],
  ['Peinture verte de fourgon blindé écaillée sur le canon.', 'Green armored-van paint flaking off the barrel.', 'Pintura verde de furgón blindado descascarillada en el cañón.'],
  ['Les numéros de série se suivent exactement : cash de rançon ou braquage de DAB.', 'The serial numbers run in exact sequence: ransom cash or an ATM heist.', 'Los números de serie se suceden exactamente: dinero de rescate o atraco a un cajero.'],
  ['Bords déchirés à la va-vite ; tampon d’assurance privée au dos.', 'Edges torn in a hurry; private insurance stamp on the back.', 'Bordes rasgados a toda prisa; sello de seguro privado en el dorso.'],
  ['Coque arrière forcée au tournevis : trace de sang sec sur le capteur d’empreinte.', 'Back shell pried open with a screwdriver: dried blood on the fingerprint sensor.', 'Carcasa trasera forzada con un destornillador: sangre seca en el sensor de huellas.'],
  ['Numéro de série intact : arme déclarée volée au stand de tir municipal.', 'Serial number intact: weapon reported stolen from the municipal shooting range.', 'Número de serie intacto: arma denunciada como robada en el campo de tiro municipal.'],
  ['Encore chaud ; cartouche bloquée dans la chambre gauche.', 'Still warm; cartridge jammed in the left chamber.', 'Aún caliente; cartucho atascado en la recámara izquierda.'],
  ['Étiquette d’inventaire muséal arrachée : reste le code-barres collé au dos.', 'Museum inventory label torn off: the barcode is still stuck on the back.', 'Etiqueta de inventario del museo arrancada: queda el código de barras pegado en el dorso.'],
  ['Autocollant DGSI arraché sur la face arrière.', 'Intelligence-service sticker torn off the back.', 'Pegatina de los servicios de inteligencia arrancada en la parte trasera.'],
  ['Étiquette de la Clinique Saint-Luc arrachée. Il reste 2h d’autonomie sur la batterie.', 'Saint-Luc Clinic label torn off. The battery has 2 hours left.', 'Etiqueta de la Clínica Saint-Luc arrancada. A la batería le quedan 2 horas.'],
  ['Fichiers judiciaires chiffrés AES-256 : dossiers d’instruction et écoutes du parquet.', 'AES-256 encrypted court files: investigation dossiers and prosecutor wiretaps.', 'Archivos judiciales cifrados con AES-256: sumarios de instrucción y escuchas de la fiscalía.'],
  ['Taches d’humidité d’un conduit d’aération de musée.', 'Damp stains from a museum ventilation duct.', 'Manchas de humedad de un conducto de ventilación de museo.'],
  ['Le code d’unité ne correspond à aucun régiment répertorié.', 'The unit code matches no listed regiment.', 'El código de unidad no corresponde a ningún regimiento registrado.'],
  ['La photo est collée par-dessus une autre : les bords gondolent.', 'The photo is glued over another one: the edges are warping.', 'La foto está pegada sobre otra: los bordes se abarquillan.'],
  ['Traces de coupe au cutter sur le cadre d’origine encore visible.', 'Box-cutter marks visible on the original frame.', 'Marcas de cúter visibles en el marco original.'],
  ['Inclusions rouges visibles à la loupe : traces de sang humain piégé dans le cristal.', 'Red inclusions visible under the loupe: traces of human blood trapped in the crystal.', 'Inclusiones rojas visibles con la lupa: restos de sangre humana atrapados en el cristal.'],
  ['Numéro de mouvement limé à la hâte ; rayure profonde sur le verre saphir.', 'Movement number filed off in a hurry; deep scratch on the sapphire crystal.', 'Número de movimiento limado a toda prisa; arañazo profundo en el cristal de zafiro.'],
  ['Numéro de lot manquant d’une valise volée à l’aéroport.', 'Lot number missing from a suitcase stolen at the airport.', 'Falta el número de lote de una maleta robada en el aeropuerto.'],
  ['Deux douilles percutées encore dans le barillet. Odeur de poudre fraîche.', 'Two fired casings still in the cylinder. Smell of fresh powder.', 'Dos casquillos percutidos aún en el tambor. Olor a pólvora fresca.'],
  ['Le vernis sent le polyuréthane industriel, pas la gomme-laque.', 'The varnish smells of industrial polyurethane, not shellac.', 'El barniz huele a poliuretano industrial, no a goma laca.'],
  ['Le papier crisse un poil trop fort : pas de fibres de coton, impression offset.', 'The paper crackles a touch too loudly: no cotton fibers, offset printing.', 'El papel cruje un poco demasiado: sin fibras de algodón, impresión offset.'],
  ['Les boulons portent des traces de peinture de carrosserie arrachée à la hâte.', 'The bolts carry traces of bodywork paint torn off in a hurry.', 'Los tornillos llevan restos de pintura de carrocería arrancada a toda prisa.'],
  ['Message non lu sur l’écran verrouillé : "Si les photos sortent avant 6h, on te retrouve."', 'Unread message on the lock screen: "If the photos leak before 6, we find you."', 'Mensaje sin leer en la pantalla de bloqueo: «Si las fotos salen antes de las 6, te encontramos.»'],
  ['Poussière de coffre-fort encore coincée dans les angles.', 'Safe dust still caught in the corners.', 'Polvo de caja fuerte aún atrapado en las esquinas.'],
  ['Coin supérieur légèrement brûlé par une lampe à souder.', 'Upper corner slightly scorched by a blowtorch.', 'Esquina superior ligeramente quemada por un soplete.'],
  ['Le coin d’un billet est taché d’encre rose de cartouche antivol.', 'A bill’s corner is stained with pink anti-theft cartridge ink.', 'La esquina de un billete está manchada con tinta rosa de cartucho antirrobo.'],
  ['Le numéro correspond à une ambassade fermée depuis 2 ans.', 'The number belongs to an embassy closed for 2 years.', 'El número corresponde a una embajada cerrada desde hace 2 años.'],
  ['Certificat Kimberley absent : pierre de zone de conflit probable.', 'Kimberley certificate missing: probably a conflict-zone stone.', 'Falta el certificado Kimberley: probable piedra de zona de conflicto.'],
  ['Autocollant CONFIDENTIEL DÉFENSE gratté au couteau.', 'CONFIDENTIAL DEFENSE sticker scraped off with a knife.', 'Pegatina de CONFIDENCIAL DEFENSA rascada con un cuchillo.'],
  ['Le cadenas a été coupé à la pince monseigneur.', 'The padlock was cut with a crowbar-style bolt cutter.', 'El candado fue cortado con una cizalla.'],
  ['Poids légèrement inférieur (965 g) : traces de limaille fraîche.', 'Slightly underweight (965 g): traces of fresh filings.', 'Peso ligeramente inferior (965 g): restos de limaduras frescas.'],
  ['Le mouvement fait un bruit anormal : un micro-traceur a été collé sous le cadran.', 'The movement makes an odd noise: a micro-tracker was stuck under the dial.', 'El mecanismo hace un ruido anormal: hay un micro-rastreador pegado bajo la esfera.'],
  ['Firmware custom : intercepte le trafic réseau dans un rayon de 200 m.', 'Custom firmware: intercepts network traffic within a 200 m radius.', 'Firmware personalizado: intercepta el tráfico de red en un radio de 200 m.'],
  // Indices UV
  ['SOUS UV : Objet appât marqué par la Brigade Financière ! Ce client est un infiltré.', 'UNDER UV: Bait item marked by the Financial Crimes Squad! This client is an undercover agent.', 'BAJO UV: ¡Objeto cebo marcado por la Brigada Financiera! Este cliente es un infiltrado.'],
  ['Sous UV : marquage fluorescent de la Brigade Financière sur chaque billet.', 'Under UV: Financial Crimes Squad fluorescent marking on every bill.', 'Bajo UV: marcado fluorescente de la Brigada Financiera en cada billete.'],
  ['Sous UV : signature invisible d’expertise d’un collectionneur assassiné.', 'Under UV: invisible appraisal signature of a murdered collector.', 'Bajo UV: firma invisible de tasación de un coleccionista asesinado.'],
  ['Sous UV : autocollant de scellé judiciaire gratté à la lame de rasoir.', 'Under UV: court seal sticker scraped off with a razor blade.', 'Bajo UV: pegatina de precinto judicial rascada con una cuchilla.'],
  ['Sous UV : empreinte partielle sur le ruban adhésif.', 'Under UV: partial fingerprint on the adhesive tape.', 'Bajo UV: huella parcial en la cinta adhesiva.'],
  ['Sous UV : numéro de série des services de renseignement gravé au laser.', 'Under UV: intelligence-service serial number laser-engraved.', 'Bajo UV: número de serie de los servicios de inteligencia grabado con láser.'],
  ['Sous UV : code-barres hospitalier signalé volé cette nuit.', 'Under UV: hospital barcode reported stolen tonight.', 'Bajo UV: código de barras hospitalario denunciado como robado esta noche.'],
  ['Sous UV : l’hologramme est un simple sticker chinois qui se décolle.', 'Under UV: the hologram is a cheap sticker that peels off.', 'Bajo UV: el holograma es una simple pegatina barata que se despega.'],
  ['Sous UV : tampon d’expertise du Louvre sous la dorure.', 'Under UV: Louvre appraisal stamp under the gilding.', 'Bajo UV: sello de tasación del Louvre bajo el dorado.'],
  ['Sous UV : résidus de tir (GSR) sur toute la crosse.', 'Under UV: gunshot residue (GSR) all over the grip.', 'Bajo UV: restos de disparo (GSR) por toda la empuñadura.'],
  ['Sous UV : colle moderne fluorescente aux jointures (anachronisme).', 'Under UV: fluorescent modern glue at the joints (anachronism).', 'Bajo UV: pegamento moderno fluorescente en las uniones (anacronismo).'],
  ['Sous UV : trace de marqueur chimique anti-casse de banque.', 'Under UV: trace of bank anti-theft chemical marker.', 'Bajo UV: resto de marcador químico antirrobo bancario.'],
  ['Sous UV : résidu médico-légal sur le fermoir + traceur passif.', 'Under UV: forensic residue on the clasp + passive tracker.', 'Bajo UV: residuo forense en el cierre + rastreador pasivo.'],
  ['Sous UV : filigrane consulaire authentique (valeur énorme en fuite).', 'Under UV: authentic consular watermark (enormous value on the run).', 'Bajo UV: filigrana consular auténtica (valor enorme en fuga).'],
  ['Sous UV : empreinte latente du greffier sur le capuchon.', 'Under UV: the clerk’s latent fingerprint on the cap.', 'Bajo UV: huella latente del secretario judicial en el capuchón.'],
  ['Sous UV : résidu d’ADN sur la boucle déployante.', 'Under UV: DNA residue on the deployant buckle.', 'Bajo UV: resto de ADN en la hebilla desplegable.'],
  ['Gravure intérieure à peine lisible : "Ministère — 2024".', 'Inner engraving barely legible: "Ministry — 2024".', 'Grabado interior apenas legible: «Ministerio — 2024».'],
  ['L’étiquette intérieure est imprimée au laser — un vrai Strad est manuscrit.', 'The inner label is laser-printed — a real Strad is handwritten.', 'La etiqueta interior está impresa con láser: un Strad auténtico es manuscrito.'],
  ['Sous UV : le filigrane ne fluoresce pas du tout — impression jet d’encre.', 'Under UV: the watermark does not fluoresce at all — inkjet printing.', 'Bajo UV: la filigrana no fluorece en absoluto: impresión de inyección de tinta.'],
  ['Sous UV : fluorescence bleue intense — diamant naturel, pas synthétique.', 'Under UV: intense blue fluorescence — natural diamond, not synthetic.', 'Bajo UV: fluorescencia azul intensa: diamante natural, no sintético.'],
  ['Sous UV : micro-gravure du Quai d’Orsay authentique — volée au stock.', 'Under UV: authentic Quai d’Orsay micro-engraving — stolen from stock.', 'Bajo UV: micrograbado auténtico del Quai d’Orsay: robado del almacén.'],
];
for (const [fr, en, es] of MORE_ROWS) MAP.set(fr, { en, es });

// Textes issus du Codex : « Provenance tracée … », « signature de lot … », « provenance — lore ».
const RARITY_WORDS: Record<string, { en: string; es: string }> = {
  COMMUN: { en: 'COMMON', es: 'COMÚN' },
  INSOLITE: { en: 'UNUSUAL', es: 'INSÓLITA' },
  RARE: { en: 'RARE', es: 'RARA' },
  EPIQUE: { en: 'EPIC', es: 'ÉPICA' },
  LEGENDAIRE: { en: 'LEGENDARY', es: 'LEGENDARIA' },
  MYTHIQUE: { en: 'MYTHIC', es: 'MÍTICA' },
};
let codexProv: Map<string, { en: string; es: string }> | null = null;
let codexLore: Map<string, { en: string; es: string }> | null = null;
function codexMaps() {
  if (!codexProv || !codexLore) {
    codexProv = new Map();
    codexLore = new Map();
    for (const col of COLLECTIONS_DATA) {
      for (const it of col.items) {
        const en = localizeCodexItem(it, 'en');
        const es = localizeCodexItem(it, 'es');
        codexProv.set(it.provenance, { en: en.provenance, es: es.provenance });
        codexLore.set(it.lore, { en: en.lore, es: es.lore });
      }
    }
  }
  return { prov: codexProv, lore: codexLore };
}

/** Traduit un texte d'objet du catalogue (nom de base, aspect, indice Loupe/UV) ; sinon renvoie le français. */
export function localizeItemText(fr: string, locale: Locale): string {
  if (locale !== 'fr') {
    const { prov, lore } = codexMaps();
    const direct = lore.get(fr);
    if (direct) return direct[locale];
    let m = /^Provenance tracée : (.+)\. Pièce recherchée du Codex \(([A-Z]+)\)\.$/.exec(fr);
    if (m && prov.get(m[1])) {
      const r = RARITY_WORDS[m[2]]?.[locale] ?? m[2];
      return locale === 'en' ? `Traced provenance: ${prov.get(m[1])!.en}. Wanted Codex piece (${r}).` : `Procedencia rastreada: ${prov.get(m[1])!.es}. Pieza buscada del Códice (${r}).`;
    }
    m = /^Sous UV : signature de lot (.+) \((.+)\)\.$/.exec(fr);
    if (m) {
      const col = localizeCodexText(m[1], locale);
      const pv = prov.get(m[2])?.[locale] ?? m[2];
      return locale === 'en' ? `Under UV: lot signature ${col} (${pv}).` : `Bajo UV: firma de lote ${col} (${pv}).`;
    }
    m = /^(.+) — (.+)$/.exec(fr);
    if (m && prov.get(m[1]) && lore.get(m[2])) return `${prov.get(m[1])![locale]} — ${lore.get(m[2])![locale]}`;
  }
  if (locale !== 'fr' && fr.startsWith('SOUS UV : marquage fluorescent partiel')) {
    return locale === 'en'
      ? 'Under UV: partial fluorescent marking. Impossible to tell — recent seizure, or a Squad bait.'
      : 'Bajo UV: marcado fluorescente parcial. Imposible saberlo: incautación reciente o cebo de la Brigada.';
  }
  return locale === 'fr' ? fr : (MAP.get(fr)?.[locale] ?? fr);
}
