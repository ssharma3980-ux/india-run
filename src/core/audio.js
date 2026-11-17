/* Procedural Indian-instrument soundtrack + SFX (WebAudio, no audio files) */
(function () {
  class Audio {
    constructor() { this.ctx = null; this.music = true; this.sfx = true; this.playing = false; this.step = 0; }
    init() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      const c = (this.ctx = new AC());
      this.master = c.createGain(); this.master.gain.value = 0.8;
      const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3;
      this.master.connect(comp); comp.connect(c.destination);
      this.mBus = c.createGain(); this.mBus.gain.value = this.music ? 0.55 : 0; this.mBus.connect(this.master);
      this.sBus = c.createGain(); this.sBus.gain.value = this.sfx ? 0.9 : 0; this.sBus.connect(this.master);
      this.aBus = c.createGain(); this.aBus.gain.value = this.sfx ? 0.35 : 0; this.aBus.connect(this.master);
      // reverb (synthetic impulse)
      const len = c.sampleRate * 1.8, ir = c.createBuffer(2, len, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
      this.verb = c.createConvolver(); this.verb.buffer = ir;
      const vg = c.createGain(); vg.gain.value = 0.28; this.verb.connect(vg); vg.connect(this.mBus);
      const nl = c.sampleRate * 2; this.noise = c.createBuffer(1, nl, c.sampleRate);
      const nd = this.noise.getChannelData(0); for (let i = 0; i < nl; i++) nd[i] = Math.random() * 2 - 1;
    }
    setMusic(on) { this.music = on; if (this.mBus) this.mBus.gain.setTargetAtTime(on ? 0.55 : 0, this.ctx.currentTime, 0.1); }
    setSfx(on) { this.sfx = on; if (this.sBus) { this.sBus.gain.setTargetAtTime(on ? 0.9 : 0, this.ctx.currentTime, 0.05); this.aBus.gain.setTargetAtTime(on ? 0.35 : 0, this.ctx.currentTime, 0.2); } }

    env(g, t, a, peak, dec, sus = 0.0001) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(sus, 0.0001), t + a + dec); }
    osc(type, f, t, dur, peak, dest, a = 0.005, verb = 0) {
      const c = this.ctx, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); this.env(g, t, a, peak, dur);
      o.connect(g); g.connect(dest); if (verb) { const v = c.createGain(); v.gain.value = verb; g.connect(v); v.connect(this.verb); }
      o.start(t); o.stop(t + a + dur + 0.05); return o;
    }
    noiseHit(t, dur, peak, type, f, q, dest, f2) {
      const c = this.ctx, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
      s.buffer = this.noise; fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = q;
      this.env(g, t, 0.004, peak, dur); s.connect(fl); fl.connect(g); g.connect(dest);
      s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
    }
    mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }

    /* tabla voices */
    bayan(t, v) { const c = this.ctx, o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(62, t); o.frequency.exponentialRampToValueAtTime(96, t + 0.12); o.frequency.exponentialRampToValueAtTime(70, t + 0.4); this.env(g, t, 0.004, 0.55 * v, 0.42); o.connect(g); g.connect(this.mBus); o.start(t); o.stop(t + 0.5); }
    dayan(t, v, ring) {
      const f = this.mtof(this.root + 12);
      this.osc('sine', f, t, ring ? 0.35 : 0.1, 0.22 * v, this.mBus, 0.002, 0.15);
      this.osc('sine', f * 2.01, t, ring ? 0.2 : 0.06, 0.08 * v, this.mBus, 0.002);
      this.osc('triangle', f * 3.02, t, 0.05, 0.05 * v, this.mBus, 0.002);
      this.noiseHit(t, 0.03, 0.08 * v, 'highpass', 3000, 1, this.mBus);
    }
    lead(t, midi, dur) {
      const c = this.ctx, f = this.mtof(midi), type = this.th.music.lead;
      if (type === 'flute') {
        const o = c.createOscillator(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(f * 0.985, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
        lfo.frequency.value = 5.2; lg.gain.value = f * 0.008; lfo.connect(lg); lg.connect(o.frequency);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.13, t + 0.07); g.gain.setValueAtTime(0.12, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.15);
        o.connect(g); g.connect(this.mBus); const v = c.createGain(); v.gain.value = 0.7; g.connect(v); v.connect(this.verb);
        o.start(t); lfo.start(t); o.stop(t + dur + 0.2); lfo.stop(t + dur + 0.2);
        this.noiseHit(t, dur * 0.6, 0.012, 'bandpass', f * 2, 2, this.mBus);
      } else if (type === 'santoor') {
        for (const det of [0, 3]) { this.osc('triangle', f * (1 + det / 1200), t, 0.9, 0.08, this.mBus, 0.002, 0.6); }
        this.osc('sine', f * 2, t, 0.4, 0.03, this.mBus, 0.002, 0.4);
        this.osc('triangle', f, t + 0.11, 0.6, 0.03, this.mBus, 0.002, 0.5);
      } else {
        const o = c.createOscillator(), fl = c.createBiquadFilter(), g = c.createGain();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(f * 0.97, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.08);
        fl.type = 'bandpass'; fl.Q.value = 6; fl.frequency.setValueAtTime(f * 6, t); fl.frequency.exponentialRampToValueAtTime(f * 2, t + 0.5);
        this.env(g, t, 0.003, 0.14, Math.min(1.2, dur + 0.4)); o.connect(fl); fl.connect(g); g.connect(this.mBus);
        const v = c.createGain(); v.gain.value = 0.5; g.connect(v); v.connect(this.verb);
        o.start(t); o.stop(t + dur + 0.6);
      }
    }
    drone(t, dur) {
      const c = this.ctx;
      for (const iv of [0, 7, 12, 12]) {
        const o = c.createOscillator(), fl = c.createBiquadFilter(), g = c.createGain();
        o.type = 'sawtooth'; o.frequency.value = this.mtof(this.root - 12 + iv) * (1 + (Math.random() - 0.5) * 0.002);
        fl.type = 'lowpass'; fl.frequency.value = 900; fl.Q.value = 3;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.022, t + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(fl); fl.connect(g); g.connect(this.mBus); o.start(t); o.stop(t + dur + 0.1);
      }
    }

    startMusic(th, intensity = 1) {
      this.init(); if (!this.ctx) return;
      this.th = th; this.root = th.music.root; this.scale = th.music.scale;
      this.bpm = th.music.tempo; this.intensity = intensity;
      if (this.playing) return;
      this.playing = true; this.next = this.ctx.currentTime + 0.1; this.step = 0; this.mel = 2; this.rest = 0;
      this.tick();
      this.timer = setInterval(() => this.tick(), 60);
      this.startAmbience(th);
    }
    setTheme(th) { this.th = th; this.root = th.music.root; this.scale = th.music.scale; this.bpm = th.music.tempo; this.startAmbience(th); }
    stopMusic() { this.playing = false; clearInterval(this.timer); this.stopAmbience(); }
    setIntensity(k) { this.intensity = k; }
    tick() {
      if (!this.playing || !this.ctx) return;
      // teentaal-inspired 16-beat cycle, played in 8th notes
      const pat = ['D', 'n', 'D', 'T', 'D', 'n', 'D', 't', 'D', 'n', 'D', 'T', 't', 'n', 'D', 'T'];
      while (this.next < this.ctx.currentTime + 0.25) {
        const t = this.next, sp = 60 / (this.bpm * (0.92 + this.intensity * 0.2)) / 2, s = this.step % 16;
        const p = pat[s], acc = s % 4 === 0 ? 1 : 0.7;
        if (p === 'D') { this.bayan(t, acc); this.dayan(t, acc, true); }
        else if (p === 'T') this.dayan(t, 0.9, true);
        else if (p === 't') this.dayan(t, 0.55, false);
        else if (this.intensity > 0.6) this.dayan(t, 0.35, false);
        if (this.step % 32 === 0) this.drone(t, sp * 33);
        if (s % 2 === 0) {
          if (this.rest > 0) this.rest--;
          else if (Math.random() < 0.82) {
            this.mel = IR.clamp(this.mel + Math.round((Math.random() - 0.5) * 3.2), 0, this.scale.length * 2 - 1);
            const oct = Math.floor(this.mel / this.scale.length), deg = this.scale[this.mel % this.scale.length];
            const len = Math.random() < 0.3 ? 2 : 1;
            this.lead(t, this.root + 12 + oct * 12 + deg, sp * 2 * len);
            if (len === 2) this.rest = 1;
            if (Math.random() < 0.08) this.rest = 3;
          }
        }
        this.next += sp; this.step++;
      }
    }
    startAmbience(th) {
      this.stopAmbience(); if (!this.ctx) return;
      const c = this.ctx, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
      s.buffer = this.noise; s.loop = true;
      const a = th.amb;
      fl.type = a === 'rain' ? 'highpass' : a === 'wind' ? 'bandpass' : 'lowpass';
      fl.frequency.value = a === 'rain' ? 1800 : a === 'wind' ? 500 : a === 'river' ? 700 : 400; fl.Q.value = a === 'wind' ? 0.7 : 0.5;
      g.gain.value = a === 'rain' ? 0.5 : a === 'river' ? 0.45 : 0.25;
      s.connect(fl); fl.connect(g); g.connect(this.aBus); s.start();
      this.amb = s;
      if (a === 'river') this.bellTimer = setInterval(() => this.bell(), 5200);
      if (a === 'bazaar' || a === 'city') this.bellTimer = setInterval(() => this.honk(), 4300);
    }
    stopAmbience() { if (this.amb) { try { this.amb.stop(); } catch (e) {} this.amb = null; } clearInterval(this.bellTimer); }
    bell() {
      if (!this.ctx || !this.sfx) return; const t = this.ctx.currentTime;
      for (const [r, a] of [[1, 0.05], [2.76, 0.03], [5.4, 0.015], [8.9, 0.008]]) this.osc('sine', 820 * r, t, 2.2 / r, a, this.aBus, 0.002, 0.3);
    }
    honk() { if (!this.ctx || Math.random() < 0.4) return; const t = this.ctx.currentTime; this.osc('square', 420 + Math.random() * 60, t, 0.12, 0.025, this.aBus, 0.01); }

    play(name, k = 0) {
      if (!this.ctx || !this.sfx) return;
      const t = this.ctx.currentTime, d = this.sBus;
      switch (name) {
        case 'coin': { const f = 1320 * Math.pow(2, (k % 8) / 24); this.osc('sine', f, t, 0.09, 0.12, d); this.osc('sine', f * 1.5, t + 0.05, 0.14, 0.1, d); break; }
        case 'jump': this.noiseHit(t, 0.25, 0.25, 'bandpass', 400, 2, d, 2200); this.osc('sine', 300, t, 0.15, 0.05, d); break;
        case 'slide': this.noiseHit(t, 0.4, 0.22, 'lowpass', 1500, 1, d, 300); break;
        case 'turn': this.noiseHit(t, 0.3, 0.2, 'bandpass', 1800, 3, d, 500); break;
        case 'lane': this.noiseHit(t, 0.12, 0.1, 'bandpass', 1200, 4, d, 2400); break;
        case 'step': this.noiseHit(t, 0.05, 0.05 + Math.random() * 0.03, 'lowpass', 600, 1, d); break;
        case 'crash': this.noiseHit(t, 0.6, 0.6, 'lowpass', 2000, 1, d, 120); this.osc('sine', 90, t, 0.5, 0.5, d); this.osc('sawtooth', 160, t, 0.25, 0.12, d); break;
        case 'power': [0, 4, 7, 12, 16].forEach((s, i) => this.osc('triangle', this.mtof(72 + s), t + i * 0.06, 0.25, 0.1, d, 0.003, 0.4)); break;
        case 'shieldBreak': this.noiseHit(t, 0.5, 0.35, 'highpass', 2500, 1, d); [12, 7, 0].forEach((s, i) => this.osc('sine', this.mtof(76 + s), t + i * 0.05, 0.2, 0.08, d)); break;
        case 'mission': [0, 7, 12, 16, 19, 24].forEach((s, i) => this.osc('sine', this.mtof(67 + s), t + i * 0.08, 0.35, 0.09, d, 0.004, 0.6)); this.bell(); break;
        case 'click': this.osc('sine', 880, t, 0.05, 0.06, d); break;
        case 'fall': { const o = this.osc('sine', 600, t, 0.9, 0.15, d); o.frequency.exponentialRampToValueAtTime(80, t + 0.9); break; }
      }
    }
  }
  IR.audio = new Audio();
})();
