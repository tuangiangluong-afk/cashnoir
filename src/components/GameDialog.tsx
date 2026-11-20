import { useEffect, useRef, type ReactNode } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export function GameDialog({ label, onDismiss, children }: {
  label: string;
  onDismiss: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    el.showModal();
    const back = Capacitor.getPlatform() === 'android'
      ? App.addListener('backButton', () => dismiss.current())
      : undefined;
    return () => {
      el.close();
      void back?.then((listener) => listener.remove());
    };
  }, []);

  return (
    <dialog ref={dialog} aria-label={label} className="game-dialog" onCancel={(event) => {
      event.preventDefault();
      onDismiss();
    }}>
      {children}
    </dialog>
  );
}
