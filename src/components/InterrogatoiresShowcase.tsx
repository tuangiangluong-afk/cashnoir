import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, ArrowRight } from 'lucide-react';
import type { Locale } from '../data/seoContent';

interface SuspectVideo {
  id: string;
  name: string;
  role: { fr: string; en: string; es: string };
  gauge: { label: { fr: string; en: string; es: string }; value: string; color: string };
  item: { fr: string; en: string; es: string };
  profit: string;
  videoUrl: string;
  portrait: string;
}

const SUSPECTS: SuspectVideo[] = [
  {
    id: 'kamel',
    name: 'Kamel Benali',
    role: {
      fr: 'Coursier de nuit traqué par la pègre',
      en: 'Night courier hunted by the mob',
      es: 'Mensajero nocturno perseguido por el hampa'
    },
    gauge: {
      label: { fr: 'Panique', en: 'Panic', es: 'Pánico' },
      value: '90 %',
      color: 'text-amber-400'
    },
    item: {
      fr: 'Diamant brut du poker clandestin',
      en: 'Rough diamond from underground poker',
      es: 'Diamante en bruto de póquer clandestino'
    },
    profit: '+8 000 $ NET',
    videoUrl: 'https://jeprtikkylotvcddrqvm.supabase.co/storage/v1/object/public/videos/videos/cashnoir_pilote_09_kamel_coursier_diamant_v1_1795347971539.mp4',
    portrait: '/assets/portraits/cast/c004.webp'
  },
  {
    id: 'clarisse',
    name: 'Clarisse De Montfort',
    role: {
      fr: 'Commissaire-priseur déchue',
      en: 'Fallen auctioneer',
      es: 'Subastadora caída'
    },
    gauge: {
      label: { fr: 'Peur', en: 'Fear', es: 'Miedo' },
      value: '85 %',
      color: 'text-rose-400'
    },
    item: {
      fr: 'Toile de maître sortie de réserve',
      en: 'Stolen museum masterpiece painting',
      es: 'Obra maestra robada de la reserva'
    },
    profit: '+6 000 $ NET',
    videoUrl: 'https://jeprtikkylotvcddrqvm.supabase.co/storage/v1/object/public/videos/videos/cashnoir_pilote_07_clarisse_tableau_drouot_v1_1795347144244.mp4',
    portrait: '/assets/portraits/cast/c003.webp'
  },
  {
    id: 'viktor',
    name: 'Viktor Morozov',
    role: {
      fr: 'Artificier de la Baltique',
      en: 'Baltic veteran explosives expert',
      es: 'Experto en explosivos del Báltico'
    },
    gauge: {
      label: { fr: 'Colère', en: 'Anger', es: 'Ira' },
      value: '80 %',
      color: 'text-red-400'
    },
    item: {
      fr: 'Rolex Daytona en or rose trafiquée',
      en: 'Tampered Rose Gold Rolex Daytona',
      es: 'Rolex Daytona de oro rosa manipulado'
    },
    profit: '+400 $ NET',
    videoUrl: 'https://jeprtikkylotvcddrqvm.supabase.co/storage/v1/object/public/videos/videos/cashnoir_pilote_01_gta6_vs_ia_interrogatoire_v4_1795301162945.mp4',
    portrait: '/assets/portraits/cast/c002.webp'
  },
  {
    id: 'moreau',
    name: 'Père Moreau',
    role: {
      fr: 'Aumônier de prison à la retraite',
      en: 'Retired prison chaplain',
      es: 'Capellán de prisiones retirado'
    },
    gauge: {
      label: { fr: 'Culpabilité', en: 'Guilt', es: 'Culpa' },
      value: '95 %',
      color: 'text-purple-400'
    },
    item: {
      fr: 'Lingot pur légué sous confession',
      en: 'Gold bullion bequeathed in confession',
      es: 'Lingote de oro bajo confesión'
    },
    profit: '+9 000 $ NET',
    videoUrl: 'https://jeprtikkylotvcddrqvm.supabase.co/storage/v1/object/public/videos/videos/cashnoir_pilote_10_pere_moreau_lingot_v1_1795351479072.mp4',
    portrait: '/assets/portraits/cast/c007.webp'
  },
  {
    id: 'rico',
    name: 'Rico Santana',
    role: {
      fr: 'Ancien videur armé',
      en: 'Armed former bouncer',
      es: 'Ex-portero armado'
    },
    gauge: {
      label: { fr: 'Menace', en: 'Threat', es: 'Amenaza' },
      value: '100 % COLÈRE',
      color: 'text-red-500'
    },
    item: {
      fr: 'Revolver Smith & Wesson chargé',
      en: 'Loaded Smith & Wesson revolver',
      es: 'Revólver Smith & Wesson cargado'
    },
    profit: 'SURVIE',
    videoUrl: 'https://jeprtikkylotvcddrqvm.supabase.co/storage/v1/object/public/videos/videos/cashnoir_pilote_04_danger_colere_revolver_v1_1795336935581.mp4',
    portrait: '/assets/portraits/cast/c009.webp'
  }
];

interface InterrogatoiresShowcaseProps {
  locale: Locale;
  onPlay: () => void;
}

export function InterrogatoiresShowcase({ locale, onPlay }: InterrogatoiresShowcaseProps) {
  const [selectedId, setSelectedId] = useState<string>('kamel');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeSuspect = SUSPECTS.find((s) => s.id === selectedId) || SUSPECTS[0];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [selectedId]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const copy = {
    eyebrow: {
      fr: 'GAMEPLAY DIRECT · ZÉRO QCM',
      en: 'DIRECT GAMEPLAY · ZERO MULTIPLE CHOICE',
      es: 'GAMEPLAY EN VIVO · CERO QCM'
    },
    title: {
      fr: 'Interrogatoires Criminels en Direct',
      en: 'Live Criminal Interrogations',
      es: 'Interrogatorios Criminales en Vivo'
    },
    subtitle: {
      fr: "Tape librement au clavier. Observe les réactions psychologiques, les failles et le décompte de marge nette en temps réel.",
      en: "Type freely with your keyboard. Watch real-time psychological reactions, hidden flaws, and cash margins unfold live.",
      es: "Escribe libremente con el teclado. Observa las reacciones psicológicas, sus debilidades y el margen neto en tiempo real."
    },
    itemLabel: {
      fr: 'Objet Clandestin :',
      en: 'Clandestine Item:',
      es: 'Objeto Clandestino:'
    },
    marginLabel: {
      fr: 'Marge Négociée :',
      en: 'Negotiated Profit:',
      es: 'Margen Negociado:'
    },
    cta: {
      fr: 'Interroger ce suspect',
      en: 'Interrogate this suspect',
      es: 'Interrogar a este sospechoso'
    }
  };

  return (
    <section className="border-b border-white/10 bg-[#07080b] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* En-tête de section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{copy.eyebrow[locale]}</span>
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-zinc-100 sm:text-5xl">
            {copy.title[locale]}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            {copy.subtitle[locale]}
          </p>
        </div>

        {/* Grille principale : Sélecteur de Suspects + Player Vertical 9:16 */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Liste des suspects (7 colonnes sur desktop) */}
          <div className="lg:col-span-7 space-y-3 font-mono">
            {SUSPECTS.map((suspect) => {
              const isSelected = suspect.id === selectedId;
              return (
                <button
                  key={suspect.id}
                  type="button"
                  onClick={() => setSelectedId(suspect.id)}
                  className={`w-full text-left p-3.5 border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-amber-400/80 bg-amber-500/10 shadow-[0_0_20px_rgba(251,191,36,0.12)]'
                      : 'border-white/10 bg-[#0a0b0f] hover:border-white/25 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-white/10 bg-black">
                      <img
                        src={suspect.portrait}
                        alt={suspect.name}
                        className="h-full w-full object-cover object-top"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/assets/portraits/courtier.webp';
                        }}
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-[family-name:var(--font-display)] text-base tracking-wide text-zinc-100 truncate">
                        {suspect.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {suspect.role[locale]}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <span className={`inline-block text-[11px] font-bold px-2 py-0.5 border border-white/10 rounded bg-black/60 ${suspect.gauge.color}`}>
                      {suspect.gauge.label[locale]} {suspect.gauge.value}
                    </span>
                    <p className="text-[10px] text-amber-300 font-bold tracking-wider">
                      {suspect.profit}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Fiche d'information du suspect actif */}
            <div className="border border-white/10 bg-black/60 p-4 space-y-2.5 rounded text-xs">
              <div className="flex items-center justify-between text-zinc-400 border-b border-white/10 pb-2">
                <span className="uppercase tracking-wider">{copy.itemLabel[locale]}</span>
                <span className="font-bold text-zinc-200">{activeSuspect.item[locale]}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span className="uppercase tracking-wider">{copy.marginLabel[locale]}</span>
                <span className="font-bold text-amber-400">{activeSuspect.profit}</span>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onPlay}
                  className="w-full flex items-center justify-center gap-2 bg-amber-400 py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-950 hover:bg-amber-300 transition-colors"
                >
                  <span>{copy.cta[locale]}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Lecteur Vidéo Vertical 9:16 (5 colonnes sur desktop) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[320px] aspect-[9/16] rounded-xl overflow-hidden border border-white/15 bg-black shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
              <video
                ref={videoRef}
                src={activeSuspect.videoUrl}
                playsInline
                muted={isMuted}
                loop
                autoPlay
                className="h-full w-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {/* Contrôles tactiles discrets en overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
                  className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-amber-400" />}
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-amber-400 text-amber-400 ml-0.5" />}
                </button>
              </div>

              {/* Badge direct en bas à gauche */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-black/75 backdrop-blur-md text-amber-300 border border-white/10">
                  {activeSuspect.name}
                </span>
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-black/75 backdrop-blur-md text-zinc-300 border border-white/10">
                  {activeSuspect.gauge.value}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
