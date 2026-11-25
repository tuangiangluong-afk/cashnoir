import { useState } from 'react';
import type { ChatTurn } from '../services/llm';

type Props = {
  history: ChatTurn[];
  name: string;
  t: (fr: string, en: string, es: string) => string;
};

export function DealReplay({ history, name, t }: Props) {
  const [index, setIndex] = useState(0);
  if (!history.some(turn => turn.role === 'player') || history.length < 2) return null;
  const turn = history[index];
  return (
    <details className="mb-2 rounded-lg border border-amber-400/30 bg-zinc-950 text-left">
      <summary className="min-h-11 cursor-pointer px-3 py-3 font-medium text-amber-200">
        {t('Revoir l’échange', 'Replay the exchange', 'Repasar la conversación')}
      </summary>
      <div className="px-3 pb-2">
        <div aria-live="polite" aria-atomic="true" className="max-h-[23dvh] overflow-y-auto break-words">
          <strong className="text-sm text-amber-200">{turn.role === 'player' ? t('Toi', 'You', 'Tú') : name}</strong>
          <p className="text-base text-zinc-100">{turn.content}</p>
        </div>
        <div className="flex items-center justify-between gap-2 text-sm">
          <button type="button" disabled={index === 0} className="min-h-11 px-2 disabled:opacity-40" onClick={() => setIndex(index - 1)}>{t('Précédent', 'Previous', 'Anterior')}</button>
          <span>{index + 1} / {history.length}</span>
          <button type="button" disabled={index === history.length - 1} className="min-h-11 px-2 disabled:opacity-40" onClick={() => setIndex(index + 1)}>{t('Suivant', 'Next', 'Siguiente')}</button>
        </div>
      </div>
    </details>
  );
}
