// Web Audio API Synthesizer for Camera Sounds
class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 880, duration = 0.08) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio beep error:', e);
    }
  }

  playCountdownTick() {
    this.playBeep(750, 0.07);
  }

  playCountdownFinal() {
    this.playBeep(1200, 0.15);
  }

  playShutter() {
    try {
      this.init();
      if (!this.ctx) return;
      
      // Simulate mechanical shutter click: noise burst + low thud
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();

      // Second click
      setTimeout(() => {
        try {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const g2 = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.05);

          g2.gain.setValueAtTime(0.4, this.ctx.currentTime);
          g2.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

          osc.connect(g2);
          g2.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.05);
        } catch (e) {}
      }, 35);

    } catch (e) {
      console.warn('Shutter sound error:', e);
    }
  }
}

window.soundEffects = new SoundEffects();
