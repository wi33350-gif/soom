// Web Audio API Procedural Relaxation & Soundscape Engine

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  // Track Gains
  private oceanGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private bowlGain: GainNode | null = null;
  private binauralGain: GainNode | null = null;

  // Running nodes
  private isSoundscapeRunning: boolean = false;
  private activeSources: (AudioNode | number)[] = [];
  private bowlIntervalId: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public ensureContext() {
    this.initContext();
  }

  // Play a soft Zen chime for breath transitions
  public playPhaseChime(type: 'inhale' | 'hold' | 'exhale' | 'hold2' | 'complete', volume: number = 0.5) {
    try {
      this.initContext();
      if (!this.ctx || this.isMuted || volume <= 0) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Soft low-pass filter for warmth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);

      let freq = 528; // Inhale: 528 Hz (Love/transformation frequency)
      let duration = 1.8;

      if (type === 'hold' || type === 'hold2') {
        freq = 432; // Hold: 432 Hz (Universal calm)
        duration = 1.2;
      } else if (type === 'exhale') {
        freq = 396; // Exhale: 396 Hz (Release tension)
        duration = 2.2;
      } else if (type === 'complete') {
        freq = 528;
        duration = 3.0;
        this.playSingingBowlStrike(volume);
      }

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // Gentle pitch drop for exhale, slight rise for inhale
      if (type === 'inhale') {
        osc.frequency.exponentialRampToValueAtTime(freq * 1.04, now + 0.3);
      } else if (type === 'exhale') {
        osc.frequency.exponentialRampToValueAtTime(freq * 0.96, now + 0.4);
      }

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, now); // 1 octave overtone

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.25 * volume, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + duration);
      osc2.stop(now + duration);
    } catch {
      // Audio autoplay policies or background state
    }
  }

  // Singing bowl strike
  public playSingingBowlStrike(volume: number = 0.5) {
    try {
      this.initContext();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      const frequencies = [216, 432, 648, 864];
      const masterBowlGain = this.ctx.createGain();
      masterBowlGain.gain.setValueAtTime(0.0001, now);
      masterBowlGain.gain.linearRampToValueAtTime(0.3 * volume, now + 0.08);
      masterBowlGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);
      masterBowlGain.connect(this.ctx.destination);

      frequencies.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + (Math.random() * 1.2 - 0.6), now);

        subGain.gain.setValueAtTime(1 / (idx + 1.2), now);
        osc.connect(subGain);
        subGain.connect(masterBowlGain);

        osc.start(now);
        osc.stop(now + 6.0);
      });
    } catch {
      // Ignore audio error
    }
  }

  // Voice guidance using Web Speech API (calm Korean prompts)
  public speakGuidance(text: string) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.85; // Slow and calming
      utterance.pitch = 0.95; // Slightly grounded warm tone
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis error
    }
  }

  // Start continuous soundscape generators
  public startSoundscapes(volumes: {
    ocean: number;
    rain: number;
    bowl: number;
    binaural: number;
    master: number;
  }) {
    this.initContext();
    if (!this.ctx) return;

    if (this.isSoundscapeRunning) {
      this.updateVolumes(volumes);
      return;
    }

    this.isSoundscapeRunning = true;

    // Master
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(volumes.master, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // 1. Ocean Generator (Pink noise + oscillating lowpass filter LFO)
    this.setupOcean(volumes.ocean);

    // 2. Rain Generator (White/Pink noise with high frequency filtering)
    this.setupRain(volumes.rain);

    // 3. Meditative 432Hz Drone & Binaural Theta
    this.setupBinaural(volumes.binaural);

    // 4. Periodic Singing Bowl (every ~18 seconds)
    this.setupPeriodicBowl(volumes.bowl);
  }

  private setupOcean(initialVol: number) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    // LFO for tide simulation (period ~8 seconds)
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8.3s cycle
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(320, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    this.oceanGain = this.ctx.createGain();
    this.oceanGain.gain.setValueAtTime(initialVol * 0.4, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.oceanGain);
    this.oceanGain.connect(this.masterGain);

    whiteNoise.start();
    lfo.start();
    this.activeSources.push(whiteNoise, lfo);
  }

  private setupRain(initialVol: number) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.12;
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1400, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(0.8, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(initialVol * 0.35, this.ctx.currentTime);

    rainSource.connect(bandpass);
    bandpass.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);

    rainSource.start();
    this.activeSources.push(rainSource);
  }

  private setupBinaural(initialVol: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const baseOsc = this.ctx.createOscillator();
    baseOsc.type = 'sine';
    baseOsc.frequency.setValueAtTime(432, now); // Solfeggio 432 Hz

    const thetaOsc = this.ctx.createOscillator();
    thetaOsc.type = 'sine';
    thetaOsc.frequency.setValueAtTime(436.5, now); // 4.5 Hz Theta wave difference

    this.binauralGain = this.ctx.createGain();
    this.binauralGain.gain.setValueAtTime(initialVol * 0.25, now);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    baseOsc.connect(filter);
    thetaOsc.connect(filter);
    filter.connect(this.binauralGain);
    this.binauralGain.connect(this.masterGain);

    baseOsc.start();
    thetaOsc.start();
    this.activeSources.push(baseOsc, thetaOsc);
  }

  private setupPeriodicBowl(initialVol: number) {
    if (this.bowlIntervalId) {
      window.clearInterval(this.bowlIntervalId);
    }
    if (initialVol > 0.05) {
      this.playSingingBowlStrike(initialVol);
      this.bowlIntervalId = window.setInterval(() => {
        if (this.isSoundscapeRunning && !this.isMuted) {
          this.playSingingBowlStrike(initialVol);
        }
      }, 16000);
    }
  }

  public updateVolumes(volumes: {
    ocean: number;
    rain: number;
    bowl: number;
    binaural: number;
    master: number;
  }) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(volumes.master, now + 0.1);
    }
    if (this.oceanGain) {
      this.oceanGain.gain.linearRampToValueAtTime(volumes.ocean * 0.4, now + 0.1);
    }
    if (this.rainGain) {
      this.rainGain.gain.linearRampToValueAtTime(volumes.rain * 0.35, now + 0.1);
    }
    if (this.binauralGain) {
      this.binauralGain.gain.linearRampToValueAtTime(volumes.binaural * 0.25, now + 0.1);
    }
    if (volumes.bowl !== undefined) {
      this.setupPeriodicBowl(volumes.bowl);
    }
  }

  public stopSoundscapes() {
    if (this.bowlIntervalId) {
      window.clearInterval(this.bowlIntervalId);
      this.bowlIntervalId = null;
    }
    this.activeSources.forEach((src) => {
      if (typeof src === 'object' && 'stop' in src && typeof (src as AudioScheduledSourceNode).stop === 'function') {
        try {
          (src as AudioScheduledSourceNode).stop();
        } catch {
          // ignore
        }
      }
    });
    this.activeSources = [];
    this.isSoundscapeRunning = false;
  }
}

export const soundEngine = new SoundEngine();
