// Carte de partage : un PNG 1200×630 (X, Discord, TikTok) dessiné dans un <canvas>, sans dépendance.
// Portrait du vendeur, résultat, décote en gros, ta réplique exacte et l'adresse du jeu.

export interface ShareCardInput {
  portraitUrl: string;
  verdict: string;
  tone: 'win' | 'loss' | 'neutral';
  discountPct: number;
  name: string;
  item: string;
  line: string;
  lineLabel: string;
  head: string;
  url: string;
}

/** Coupe un texte en lignes qui tiennent dans `maxWidth` (mesure injectée pour pouvoir tester sans canvas). */
export function wrapByWidth(measure: (s: string) => number, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (measure(next) <= maxWidth || !cur) cur = next;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[\s.,;:!?…]+$/, '')}…`;
    return kept;
  }
  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const TONE = { win: '#34d399', loss: '#f87171', neutral: '#a1a1aa' } as const;

export async function renderShareCard(d: ShareCardInput): Promise<Blob> {
  const W = 1200;
  const H = 630;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas indisponible');
  // Polices du jeu : on attend leur chargement pour ne pas dessiner avec la police de secours.
  try {
    await document.fonts?.ready;
  } catch {
    /* polices indisponibles : la police de secours convient */
  }
  const display = '"Bebas Neue", Impact, "Arial Narrow", sans-serif';
  const mono = '"IBM Plex Mono", ui-monospace, Menlo, monospace';

  ctx.fillStyle = '#07080c';
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.72, 120, 40, W * 0.72, 120, 620);
  glow.addColorStop(0, 'rgba(245,158,11,0.18)');
  glow.addColorStop(1, 'rgba(7,8,12,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Portrait à gauche (recadré sur le visage), fondu vers le fond.
  const PW = 430;
  const img = await loadImage(d.portraitUrl);
  if (img) {
    const scale = Math.max(PW / img.width, H / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (PW - w) / 2, -(h - H) * 0.18, w, h);
  } else {
    ctx.fillStyle = '#12141b';
    ctx.fillRect(0, 0, PW, H);
  }
  const fade = ctx.createLinearGradient(PW - 150, 0, PW + 20, 0);
  fade.addColorStop(0, 'rgba(7,8,12,0)');
  fade.addColorStop(1, '#07080c');
  ctx.fillStyle = fade;
  ctx.fillRect(PW - 150, 0, 170, H);

  const X = PW + 40;
  const right = W - 56;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fbbf24';
  ctx.font = `34px ${display}`;
  ctx.fillText('CASH NOIR', X, 62);
  ctx.fillStyle = '#71717a';
  ctx.font = `18px ${mono}`;
  ctx.fillText(d.head.toUpperCase(), X + 170, 60);

  // Résultat
  ctx.fillStyle = TONE[d.tone];
  ctx.font = `bold 26px ${mono}`;
  ctx.fillText(d.verdict, X, 118);

  // Décote en gros
  if (d.discountPct > 0) {
    ctx.fillStyle = '#fafafa';
    ctx.font = `150px ${display}`;
    ctx.fillText(`−${d.discountPct} %`, X, 258);
  } else {
    ctx.fillStyle = '#fafafa';
    ctx.font = `84px ${display}`;
    ctx.fillText(d.name.toUpperCase().slice(0, 22), X, 232);
  }

  ctx.fillStyle = '#d4d4d8';
  ctx.font = `22px ${mono}`;
  ctx.fillText(`${d.name} · ${d.item}`.slice(0, 64), X, 304);

  // Réplique exacte
  if (d.line.trim()) {
    ctx.fillStyle = '#f59e0b';
    ctx.font = `16px ${mono}`;
    ctx.fillText(d.lineLabel.toUpperCase(), X, 360);
    ctx.fillStyle = '#fafafa';
    ctx.font = `italic 30px ${mono}`;
    const quote = wrapByWidth((s) => ctx.measureText(s).width, `« ${d.line} »`, right - X, 4);
    quote.forEach((l, i) => ctx.fillText(l, X, 404 + i * 42));
  }

  // Pied de carte
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(X, H - 74, right - X, 1);
  ctx.fillStyle = '#a1a1aa';
  ctx.font = `20px ${mono}`;
  ctx.fillText(d.url, X, H - 32);

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('export impossible'))), 'image/png');
  });
}

/** Partage l'image : feuille de partage native avec fichier si possible, sinon téléchargement du PNG. */
export async function shareCardImage(blob: Blob, text: string, filename = 'cash-noir.png'): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], filename, { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
    await nav.share({ files: [file], text });
    return 'shared';
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return 'downloaded';
}
