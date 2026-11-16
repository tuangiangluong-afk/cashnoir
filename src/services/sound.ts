// Pure Web Audio API high-fidelity tactile Foley synthesizer (zero external assets)
class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted = false;

  private getCtx(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Crisp cash slap on wooden counter:
   * Crisp banknote ruffle (bandpassed noise) + tactile wood contact transient.
   * Eliminates the muddy 40Hz sub-bass thump.
   */
  playCashSlap() {
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Banknote paper friction (crisp high bandpass noise burst)
    const bufferSize = Math.floor(ctx.sampleRate * 0.05);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(3200, now);
    noiseFilter.Q.setValueAtTime(1.8, now);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    // 2. Solid wooden desk contact transient (sharp strike at 420Hz, not a sub-bass rumble)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.035);
    oscGain.gain.setValueAtTime(0.22, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  /**
   * Classic vintage brass cash register bell + mechanical ratchet:
   * Dual harmonic bell strike (1480Hz & 2220Hz) with shimmer decay,
   * followed by crisp spring latch click.
   */
  playDealSuccess() {
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Brass bell harmonics
    const bellFrequencies = [1480, 2220, 3700];
    const bellGains = [0.15, 0.12, 0.06];
    const bellDecays = [0.45, 0.35, 0.2];

    bellFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(bellGains[idx], now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + bellDecays[idx]);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + bellDecays[idx] + 0.02);
    });

    // Mechanical gear snap at deal closure
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(2800, now + 0.02);
    clickGain.gain.setValueAtTime(0.08, now + 0.02);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now + 0.02);
    clickOsc.stop(now + 0.055);
  }

  /**
   * Loupe inspection glass tap / UV lamp spark:
   * Pure crystalline optical glass resonance at 2100Hz with fast decay.
   */
  playInspect() {
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2100, now);
    osc.frequency.exponentialRampToValueAtTime(2450, now + 0.04);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    const bp = ctx.createBiquadFilter();
    bp.type = 'highpass';
    bp.frequency.setValueAtTime(1200, now);

    osc.connect(bp);
    bp.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  /**
   * Crisp vintage mechanical typewriter key strike.
   */
  playType() {
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1800 + Math.random() * 800, now);
    gain.gain.setValueAtTime(0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.022);

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(1400, now);

    osc.connect(hp);
    hp.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.025);
  }

  /**
   * Sharp gun hammer cocking / danger warning:
   * Two crisp metallic ratchet clicks (cylinder rotate + hammer cock lock).
   */
  playDanger() {
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Click 1: Cylinder spin / latch
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1600, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.04);

    // Click 2: Heavy steel hammer locks into place (60ms later)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(2400, now + 0.06);
    osc2.frequency.exponentialRampToValueAtTime(950, now + 0.11);
    gain2.gain.setValueAtTime(0.2, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.06);
    osc2.stop(now + 0.14);
  }
}

export const sound = new SoundEngine();
