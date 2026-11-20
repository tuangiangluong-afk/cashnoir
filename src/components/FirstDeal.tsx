import { useState } from 'react';
import { Search, Watch } from 'lucide-react';
import { trackEvent } from '../services/analytics';

const key = 'cashnoir_first_watch_v1';
type Stage = 'arrival' | 'inspected' | 'counter' | 'bought';
export interface FirstDealState { stage: Stage; price: number }
type Translate = (fr: string, en: string, es: string) => string;

export function readFirstDeal(): FirstDealState | null {
  try {
    const data = JSON.parse(localStorage.getItem(key) || 'null');
    if (!data || !['arrival', 'inspected', 'counter', 'bought'].includes(data.stage)) return null;
    if (data.price !== 800 && !(data.price === 600 && ['counter', 'bought'].includes(data.stage))) return null;
    return { stage: data.stage, price: data.price };
  } catch { return null; }
}

export function clearFirstDeal() {
  localStorage.removeItem(key);
}

export function FirstDeal({ t, onExit, onContinue }: { t: Translate; onExit: () => void; onContinue: () => void }) {
  const [deal, setDeal] = useState<FirstDealState>(() => readFirstDeal() ?? { stage: 'arrival', price: 800 });
  const [storageFailed, setStorageFailed] = useState(false);
  const money = (n: number) => t(`${n} $`, `$${n}`, `${n} $`);
  const move = (stage: Stage, price = deal.price) => {
    const next = { stage, price };
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setStorageFailed(false);
    } catch { setStorageFailed(true); }
    setDeal(next);
    if (stage === 'bought') trackEvent('first_deal_complete', { price });
  };
  const bought = deal.stage === 'bought';
  const primary = 'w-full rounded-lg bg-amber-300 px-4 py-3.5 text-base font-bold text-zinc-950 active:bg-amber-400';
  const secondary = 'w-full rounded-lg border border-white/20 bg-zinc-900 px-4 py-3 text-base font-medium text-zinc-100 active:bg-zinc-800';
  return (
    <main className="min-h-[100dvh] bg-[#0a0a0d] px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-zinc-100">
      <div className="mx-auto flex min-h-[85dvh] max-w-md flex-col gap-4">
        <header className="flex items-center justify-between border-b border-white/15">
          <span className="font-bold tracking-widest">CASH <span className="text-amber-300">NOIR</span></span>
          <button onClick={onExit} className="min-h-11 px-2 text-sm text-zinc-300">{t('Retour', 'Back', 'Volver')}</button>
        </header>
        <div className="relative isolate overflow-hidden rounded-xl border border-amber-300/20 bg-zinc-950">
          <img className="mx-auto h-[clamp(100px,22dvh,190px)] w-full object-contain" src="/assets/items/watch.webp" alt="" />
          <h1 className="px-4 pb-3 font-[family-name:var(--font-display)] text-3xl tracking-wide">
            {t('La montre des docks', 'The dockside watch', 'El reloj del muelle')}
          </h1>
        </div>
        <section aria-live="polite" aria-atomic="true" className="flex-1 space-y-3">
          {bought ? <>
            <h2 className="text-xl font-semibold text-amber-300">{t('Marché conclu.', 'Deal sealed.', 'Trato cerrado.')}</h2>
            <p>{t(`Tu empoches la montre pour ${money(deal.price)}. Sa valeur de rue est estimée à ${money(1000)}.`, `The watch is yours for ${money(deal.price)}. Its estimated street value is ${money(1000)}.`, `El reloj es tuyo por ${money(deal.price)}. Su valor estimado es de ${money(1000)}.`)}</p>
            <p className="text-sm leading-relaxed text-zinc-300">{t('Ouvre une nouvelle boutique pour retrouver cette montre au coffre et choisir comment la revendre. Si tu as déjà une boutique, tu retrouveras ta partie.', 'Open a new shop to keep the watch in your vault and choose how to sell it. Returning players resume their existing shop.', 'Abre una tienda nueva para guardar el reloj en tu caja y decidir cómo venderlo. Si ya tienes tienda, retomarás tu partida.')}</p>
          </> : <>
            <div className="flex items-center gap-3">
              <img src="/assets/portraits/cast/c002.webp" alt="" className="size-12 rounded-full object-cover object-top" />
              <p className="text-base leading-relaxed">{deal.stage === 'counter'
                ? t('« Tu as vu le fermoir… Bon, 600 $. Dernier prix. »', '“You spotted the clasp… Fine, $600. Final offer.”', '« Has visto el cierre… Vale, 600 $. Última oferta. »')
                : t('« Une montre de collection. 800 $ et elle est à toi. »', '“A collector’s watch. Eight hundred and it’s yours.”', '« Un reloj de colección. Por 800 $ es tuyo. »')}</p>
            </div>
            {deal.stage !== 'arrival' && <p className="border-l-2 border-amber-400 pl-3 text-base text-amber-100">{t('Le cadran est d’origine. Le fermoir, lui, a été remplacé.', 'The dial is original. The clasp is a replacement.', 'La esfera es original. El cierre ha sido sustituido.')}</p>}
          </>}
        </section>
        <div className="space-y-2">
          {storageFailed && <p role="alert">{t('Stockage local indisponible. La fermeture de cet écran perdra cet essai.', 'Local storage is unavailable. Leaving this screen will lose this trial.', 'El almacenamiento local no está disponible. Si sales perderás esta prueba.')}</p>}
          {bought ? <button className={primary} onClick={onContinue}>{t('Continuer avec mon compte', 'Continue with my account', 'Continuar con mi cuenta')}</button> : <>
            {deal.stage === 'arrival' && <button className={primary} onClick={() => move('inspected')}><Search className="mr-2 inline size-5" />{t('Examiner la montre', 'Inspect the watch', 'Examinar el reloj')}</button>}
            {deal.stage === 'inspected' && <button className={primary} onClick={() => move('counter', 600)}>{t('Montrer le fermoir et proposer 600 $', 'Point out the clasp and offer $600', 'Señalar el cierre y ofrecer 600 $')}</button>}
            <button className={deal.stage === 'counter' ? primary : secondary} onClick={() => move('bought')}><Watch className="mr-2 inline size-5" />{t('Acheter', 'Buy', 'Comprar')} · {money(deal.price)}</button>
          </>}
        </div>
      </div>
    </main>
  );
}
