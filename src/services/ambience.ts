// Ambiance procédurale haute fidélité (Web Audio) : pluie feutrée sur vitre (zéro bourdonnement lourd).
class Ambience {
  private ctx: AudioContext | null = null;
  private rainGain: GainNode | null = null;
  private nodes: AudioScheduledSourceNode[] = [];
  private playing = false;

  private ensureCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  private noiseBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      // Filtre rose acoustique
      b0 = 0.99765 * b0 + white * 0.08;
      b1 = 0.963 * b1 + white * 0.22;
      b2 = 0.57 * b2 + white * 0.75;
      data[i] = (b0 + b1 + b2 + white * 0.12) * 0.16;
    }
    return buffer;
  }

  start() {
    // Désactivé : évite le souffle / grésillement procédural continu perçu comme un bug sonore ou du bruit parasite.
    this.stop();
  }

  stop() {
    if (!this.playing) return;
    const ctx = this.ctx;
    this.playing = false;
    if (ctx && this.rainGain) {
      const t = ctx.currentTime;
      this.rainGain.gain.cancelScheduledValues(t);
      this.rainGain.gain.setValueAtTime(Math.max(this.rainGain.gain.value, 0.0001), t);
      this.rainGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      const nodes = this.nodes;
      setTimeout(() => nodes.forEach((n) => {
        try { n.stop(); } catch { /* déjà arrêté */ }
      }), 500);
    }
    this.nodes = [];
  }

  /** Grésillement de radio de police / scanner. */
  crackle() {
    const ctx = this.ensureCtx();
    if (!ctx || !this.playing) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(ctx, 0.35);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1800;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 3200;
    bp.Q.value = 2.0;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.12, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    src.connect(hp);
    hp.connect(bp);
    bp.connect(g);
    g.connect(ctx.destination);
    src.start(now);
    src.stop(now + 0.32);
  }
}

export const ambience = new Ambience();
