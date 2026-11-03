/* =========================================================
   AUDIO — tiny chiptune synth: pulse/triangle/noise voices,
   a 16th-note sequencer, and synthesized sound effects.
   All music below is original.
   ========================================================= */
const NOTE_IDX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function noteMidi(n) {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(n);
  if (!m) return null;
  return 12 * (parseInt(m[3], 10) + 1) + NOTE_IDX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const CHORD_Q = { '': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], dim: [0, 3, 6], sus4: [0, 5, 7], sus2: [0, 2, 7], '5': [0, 7], m6: [0, 3, 7, 9] };
function parseChord(sym) {
  const m = /^([A-G])([#b]?)(.*)$/.exec(sym);
  const root = NOTE_IDX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  return { root, iv: CHORD_Q[m[3]] || CHORD_Q[''] };
}

const SONGS = {
  title: {
    bpm: 116,
    bars: ['Am', 'F', 'C', 'E', 'Am', 'F', 'E', 'Am'],
    lead: [
      'E5 - A5 - G5 - E5 - C5 - D5 - E5 - - -',
      'F5 - E5 - D5 - C5 - A4 - - - C5 - - -',
      'G4 - C5 - E5 - G5 - F5 - E5 - D5 - C5 -',
      'B4 - - - G#4 - - - E4 - - - . . . .',
      'E5 - A5 - G5 - E5 - C5 - D5 - E5 - G5 -',
      'A5 - G5 - F5 - E5 - D5 - - - C5 - D5 -',
      'E5 - - - D5 - C5 - B4 - - - G#4 - B4 -',
      'A4 - - - - - - - . . . . . . . .',
    ],
    duty: 0.25, leadVol: 0.11, bass: 'oct8', arp: 'up16', arpVol: 0.035,
    drums: ['k . h . s . h . k . h k s . h .', 'k . h . s . h . k . h k s . h .', 'k . h . s . h . k . h k s . h .', 'k . h . s . h . k . s . s s s s'],
  },
  offer: {
    bpm: 104,
    bars: ['Fmaj7', 'Em7|A7', 'Dm7', 'G7|C7', 'Fmaj7', 'Bbmaj7', 'Gm7|C7', 'Fmaj7'],
    lead: [
      'A4 - - C5 - - E5 - D5 - C5 - A4 - - -',
      'G4 - - B4 - - D5 - C#5 - - E5 - - . .',
      'F5 - - E5 - - D5 - C5 - A4 - F4 - - -',
      'E4 - - G4 - - B4 - Bb4 - - G4 - - E4 -',
      'A4 - - C5 - - E5 - G5 - - E5 - - C5 -',
      'D5 - - F5 - - A5 - - - G5 - F5 - D5 -',
      'Bb4 - - D5 - - F5 - E5 - - C5 - - Bb4 -',
      'A4 - - - - - - - . . . . . . . .',
    ],
    duty: 0.125, leadVol: 0.1, bass: 'walk', arp: 'stab', arpVol: 0.03,
    drums: ['k . h . h k h . k . h . h k h .'], drumVol: 0.6,
  },
  career: {
    bpm: 138,
    bars: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G'],
    lead: [
      'E5 - . E5 . G5 - . E5 - D5 - C5 - . .',
      'D5 - . D5 . G5 - . D5 - B4 - G4 - . .',
      'C5 - . C5 . E5 - . A5 - G5 - E5 - . .',
      'F5 - E5 - D5 - C5 - A4 - - - . . . .',
      'E5 - . E5 . G5 - . C6 - B5 - G5 - . .',
      'B5 - A5 - G5 - D5 - G5 - - - . . . .',
      'A5 - G5 - F5 - A5 - G5 - F5 - E5 - D5 -',
      'D5 - - - G5 - - - G4 - - - . . . .',
    ],
    duty: 0.25, leadVol: 0.1, bass: 'oct8', arp: 'broken8', arpVol: 0.035,
    drums: ['k . h . s . h . k k h . s . h .'],
  },
  arena: {
    bpm: 150,
    bars: ['Dm', 'Bb', 'C', 'A', 'Dm', 'Bb', 'Gm', 'A'],
    lead: [
      'D5 - - - F5 - A5 - - - G5 - F5 - E5 -',
      'D5 - - - Bb4 - - - F4 - - - Bb4 - D5 -',
      'E5 - - - G5 - C6 - - - Bb5 - A5 - G5 -',
      'A5 - - - - - E5 - C#5 - - - A4 - - -',
      'D5 - F5 - A5 - D6 - - - C6 - A5 - F5 -',
      'Bb5 - - - A5 - G5 - F5 - - - D5 - F5 -',
      'G5 - - - Bb5 - A5 - G5 - F5 - E5 - D5 -',
      'C#5 - - - E5 - - - A5 - - - . . . .',
    ],
    duty: 0.5, leadVol: 0.075, bass: 'pump', arp: 'up16', arpVol: 0.03,
    drums: ['k . h . s . h k k . h . s . h h'],
  },
  boss: {
    bpm: 168,
    bars: ['Em', 'F', 'Em', 'D', 'Em', 'F', 'G', 'F'],
    lead: [
      'E5 . E5 . G5 - E5 . B5 - - - A5 - G5 -',
      'F5 . F5 . A5 - F5 . C6 - - - B5 - A5 -',
      'G5 - F#5 - E5 - D5 - E5 - - - B4 - - -',
      'A4 - B4 - C5 - D5 - F#5 - - - D5 - - -',
      'E6 - - - D6 - B5 - G5 - - - E5 - - -',
      'F5 - A5 - C6 - F6 - - - E6 - C6 - A5 -',
      'B5 - - - G5 - D5 - B4 - D5 - G5 - B5 -',
      'A5 - - - - - - - F5 - G5 - A5 - B5 -',
    ],
    duty: 0.25, leadVol: 0.08, bass: 'gallop', arp: 'updown16', arpVol: 0.03,
    drums: ['k h s h k k s h k h s h k k s s'],
  },
  good: {
    bpm: 120,
    bars: ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'G'],
    lead: [
      'D5 - G5 - B5 - - - A5 - G5 - D5 - - -',
      'F#5 - - - A5 - - - D6 - - - A5 - - -',
      'G5 - - - B5 - - - E5 - - - G5 - - -',
      'E5 - - - G5 - - - C6 - - - B5 - A5 -',
      'B5 - - - D6 - - - B5 - A5 - G5 - - -',
      'A5 - - - F#5 - - - D5 - E5 - F#5 - - -',
      'G5 - - - E5 - - - C5 - - - D5 - - -',
      'G5 - - - - - - - - - - - . . . .',
    ],
    duty: 0.25, leadVol: 0.1, bass: 'oct8', arp: 'up16', arpVol: 0.035,
    drums: ['k . h . s . h . k . h k s . h .'],
  },
  bad: {
    bpm: 84,
    bars: ['Am', 'Dm', 'E', 'Am', 'F', 'Dm', 'E', 'E'],
    lead: [
      'A4 - - - C5 - - - E5 - - - D5 - C5 -',
      'D5 - - - - - F5 - A4 - - - - - - -',
      'G#4 - - - B4 - - - E5 - - - D5 - - -',
      'C5 - - - B4 - A4 - - - - - . . . .',
      'A4 - - - C5 - - - F5 - - - E5 - D5 -',
      'D5 - - - F5 - - - A5 - - - G5 - F5 -',
      'E5 - - - - - D5 - C5 - - - B4 - - -',
      'G#4 - - - - - - - . . . . . . . .',
    ],
    duty: 0.125, leadVol: 0.1, bass: 'half', arp: 'broken8', arpVol: 0.03,
    drums: ['k . . . . . . . s . . . . . . .'], drumVol: 0.6,
  },
  arb: {
    bpm: 132,
    bars: ['Cm', 'Ab', 'Bb', 'G', 'Cm', 'Ab', 'G', 'G'],
    lead: [
      'C5 - Eb5 - G5 - - - F5 - Eb5 - D5 - - -',
      'C5 - Eb5 - Ab5 - - - G5 - F5 - Eb5 - - -',
      'D5 - F5 - Bb5 - - - Ab5 - G5 - F5 - - -',
      'G5 - - - D5 - - - B4 - - - G4 - - -',
      'C6 - - - Bb5 - Ab5 - G5 - - - Eb5 - - -',
      'Ab5 - - - G5 - F5 - Eb5 - - - C5 - - -',
      'D5 - - - F5 - Ab5 - G5 - - - B4 - - -',
      'G4 - - - - - - - . . . . . . . .',
    ],
    duty: 0.5, leadVol: 0.07, bass: 'pump', arp: 'up16', arpVol: 0.03,
    drums: ['k . h . s . h . k . h . s . h h'],
  },
};
// pre-split song tokens
for (const k in SONGS) {
  const s = SONGS[k];
  s._lead = s.lead.map((b) => b.trim().split(/\s+/));
  s._drums = s.drums.map((b) => b.trim().split(/\s+/));
  s._bars = s.bars.map((b) => b.split('|').map(parseChord));
  s._lead.forEach((b, i) => { if (b.length !== 16) console.warn('song', k, 'bar', i, 'has', b.length, 'steps'); });
}

const Sound = {
  ctx: null, master: null, mus: null, fx: null, noiseBuf: null, waves: {},
  song: null, songName: null, step: 0, nextTime: 0, timer: null, muted: false,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { this.ctx = new AC(); } catch (e) { this.ctx = null; return; }
    const c = this.ctx;
    this.master = c.createGain(); this.master.connect(c.destination);
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(this.master);
    this.mus = c.createGain(); this.mus.connect(comp);
    this.fx = c.createGain(); this.fx.connect(comp);
    const len = c.sampleRate;
    this.noiseBuf = c.createBuffer(1, len, c.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    for (const duty of [0.125, 0.25, 0.5]) {
      const N = 40, re = new Float32Array(N), im = new Float32Array(N);
      for (let n = 1; n < N; n++) re[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * duty);
      this.waves[duty] = c.createPeriodicWave(re, im);
    }
    this.applyVolumes();
    if (this.pendingSong) { const s = this.pendingSong; this.pendingSong = null; this.play(s); }
  },
  applyVolumes() {
    if (!this.ctx) return;
    const S = Store.S;
    this.mus.gain.value = this.muted ? 0 : S.music * 0.9;
    this.fx.gain.value = this.muted ? 0 : S.sfx * 0.9;
  },
  toggleMute() { this.muted = !this.muted; this.applyVolumes(); return this.muted; },
  /* ---- voices ---- */
  osc(freq, t, dur, o = {}) {
    const c = this.ctx; if (!c) return;
    const os = c.createOscillator();
    if (o.duty) os.setPeriodicWave(this.waves[o.duty] || this.waves[0.5]); else os.type = o.type || 'square';
    os.frequency.setValueAtTime(freq, t);
    if (o.slide) os.frequency.exponentialRampToValueAtTime(Math.max(20, o.slide), t + dur);
    if (o.vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = o.vib; lg.gain.value = freq * 0.03; l.connect(lg); lg.connect(os.frequency); l.start(t); l.stop(t + dur + 0.05); }
    const gn = c.createGain();
    const v = o.vol !== undefined ? o.vol : 0.15, a = o.a || 0.004, r = o.r !== undefined ? o.r : 0.04;
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.linearRampToValueAtTime(v, t + a);
    gn.gain.setValueAtTime(v * (o.sus !== undefined ? o.sus : 1), t + Math.max(a, dur - r));
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    os.connect(gn); gn.connect(o.dest || this.fx);
    os.start(t); os.stop(t + dur + 0.02);
  },
  noise(t, dur, o = {}) {
    const c = this.ctx; if (!c) return;
    const src = c.createBufferSource(); src.buffer = this.noiseBuf;
    src.playbackRate.value = o.rate || 1;
    const f = c.createBiquadFilter(); f.type = o.ftype || 'highpass'; f.frequency.value = o.freq || 1000;
    if (o.fslide) f.frequency.exponentialRampToValueAtTime(o.fslide, t + dur);
    const gn = c.createGain(); const v = o.vol !== undefined ? o.vol : 0.15;
    gn.gain.setValueAtTime(v, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(gn); gn.connect(o.dest || this.fx);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.02);
  },
  /* ---- sound effects ---- */
  sfx(name, p = 0) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + 0.005;
    const O = (f, at, d, o) => this.osc(f, t + at, d, o);
    switch (name) {
      case 'blip': O(1046 + p, 0, 0.035, { duty: 0.25, vol: 0.05 }); break;
      case 'talk': O(p || 520, 0, 0.03, { duty: 0.5, vol: 0.035 }); break;
      case 'select': O(660, 0, 0.05, { duty: 0.25, vol: 0.08 }); O(990, 0.05, 0.07, { duty: 0.25, vol: 0.08 }); break;
      case 'confirm': [523, 659, 784, 1046].forEach((f, i) => O(f, i * 0.045, 0.09, { duty: 0.25, vol: 0.08 })); break;
      case 'cancel': O(440, 0, 0.12, { duty: 0.5, vol: 0.07, slide: 220 }); break;
      case 'error': O(130, 0, 0.18, { duty: 0.5, vol: 0.08 }); O(123, 0.02, 0.16, { duty: 0.5, vol: 0.06 }); break;
      case 'pip': O(1568, 0, 0.04, { duty: 0.125, vol: 0.06 }); O(2093, 0.04, 0.05, { duty: 0.125, vol: 0.05 }); break;
      case 'burn': O(880, 0, 0.25, { duty: 0.25, vol: 0.07, slide: 110 }); this.noise(t, 0.2, { freq: 3000, vol: 0.05 }); break;
      case 'stamp': this.noise(t, 0.14, { ftype: 'lowpass', freq: 900, vol: 0.4 }); O(110, 0, 0.14, { type: 'sine', vol: 0.4, slide: 40 }); break;
      case 'bigstamp': this.noise(t, 0.3, { ftype: 'lowpass', freq: 700, vol: 0.5 }); O(80, 0, 0.3, { type: 'sine', vol: 0.5, slide: 30 }); O(160, 0, 0.1, { duty: 0.5, vol: 0.08, slide: 60 }); break;
      case 'paper': this.noise(t, 0.09, { freq: 2500, vol: 0.06, ftype: 'bandpass' }); this.noise(t + 0.05, 0.07, { freq: 3500, vol: 0.04, ftype: 'bandpass' }); break;
      case 'coin': O(988, 0, 0.05, { duty: 0.25, vol: 0.07 }); O(1319, 0.05, 0.14, { duty: 0.25, vol: 0.07 }); break;
      case 'cash': O(1319, 0, 0.05, { duty: 0.125, vol: 0.06 }); O(1760, 0.04, 0.12, { duty: 0.125, vol: 0.06 }); this.noise(t, 0.05, { freq: 6000, vol: 0.05 }); break;
      case 'hurt': O(320, 0, 0.18, { duty: 0.5, vol: 0.1, slide: 90 }); this.noise(t, 0.12, { freq: 800, vol: 0.12 }); break;
      case 'gag': O(220, 0, 0.25, { type: 'triangle', vol: 0.12, slide: 140, vib: 18 }); break;
      case 'freeze': [1568, 1175, 880, 659].forEach((f, i) => O(f, i * 0.06, 0.1, { type: 'triangle', vol: 0.12 })); break;
      case 'ghost': O(500, 0, 0.35, { type: 'sine', vol: 0.06, slide: 720, vib: 9 }); break;
      case 'objection': O(784, 0, 0.06, { duty: 0.5, vol: 0.08 }); O(1175, 0.06, 0.12, { duty: 0.5, vol: 0.08 }); this.noise(t, 0.08, { freq: 4000, vol: 0.06 }); break;
      case 'sign': for (let i = 0; i < 7; i++) this.noise(t + i * 0.06, 0.05, { ftype: 'bandpass', freq: 1800 + Math.random() * 1600, vol: 0.06 }); break;
      case 'levelup': [523, 659, 784, 1046, 1319].forEach((f, i) => O(f, i * 0.06, 0.12, { duty: 0.25, vol: 0.08 })); break;
      case 'dash': this.noise(t, 0.14, { freq: 600, fslide: 4000, vol: 0.1, ftype: 'bandpass' }); break;
      case 'alarm': for (let i = 0; i < 4; i++) { O(880, i * 0.2, 0.1, { duty: 0.5, vol: 0.06 }); O(660, i * 0.2 + 0.1, 0.1, { duty: 0.5, vol: 0.06 }); } break;
      case 'boss': O(55, 0, 0.8, { duty: 0.5, vol: 0.12, slide: 40 }); this.noise(t, 0.8, { ftype: 'lowpass', freq: 300, vol: 0.2 }); break;
      case 'shield': O(1400, 0, 0.12, { type: 'triangle', vol: 0.1, slide: 500 }); break;
      case 'hit': this.noise(t, 0.06, { freq: 1200, vol: 0.12 }); O(200, 0, 0.06, { duty: 0.5, vol: 0.06, slide: 120 }); break;
      case 'door': this.noise(t, 0.2, { ftype: 'lowpass', freq: 500, vol: 0.2 }); O(90, 0.02, 0.15, { type: 'sine', vol: 0.25, slide: 50 }); break;
      case 'claw': for (let i = 0; i < 6; i++) O(110 + (i % 2) * 30, i * 0.07, 0.06, { duty: 0.5, vol: 0.06 }); break;
      case 'win': [523, 659, 784, 1046, 784, 1046, 1319].forEach((f, i) => O(f, i * 0.08, 0.14, { duty: 0.25, vol: 0.08 })); break;
      case 'lose': [392, 370, 349, 330].forEach((f, i) => O(f, i * 0.18, 0.2, { duty: 0.5, vol: 0.08 })); break;
      case 'heal': [659, 880, 1046].forEach((f, i) => O(f, i * 0.05, 0.08, { type: 'triangle', vol: 0.1 })); break;
      case 'tick': O(1800, 0, 0.015, { duty: 0.125, vol: 0.03 }); break;
      case 'thud': O(70, 0, 0.18, { type: 'sine', vol: 0.3, slide: 35 }); break;
      case 'whoosh': this.noise(t, 0.3, { ftype: 'bandpass', freq: 300, fslide: 2500, vol: 0.1 }); break;
      case 'phone': for (let i = 0; i < 2; i++) { O(1320, i * 0.32, 0.12, { duty: 0.5, vol: 0.05 }); O(1100, i * 0.32 + 0.12, 0.12, { duty: 0.5, vol: 0.05 }); } break;
    }
  },
  /* ---- music ---- */
  play(name) {
    if (!SONGS[name]) return;
    if (!this.ctx) { this.pendingSong = name; return; }
    if (this.songName === name && this.timer) return;
    this.stop();
    this.songName = name; this.song = SONGS[name]; this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.08;
    this.timer = setInterval(() => this.sched(), 25);
    this.sched();
  },
  stop() { if (this.timer) clearInterval(this.timer); this.timer = null; this.songName = null; this.pendingSong = null; },
  sched() {
    if (!this.ctx || !this.song) return;
    const s = this.song, sd = 60 / s.bpm / 4;
    while (this.nextTime < this.ctx.currentTime + 0.15) {
      this.playStep(s, this.step, this.nextTime, sd);
      this.nextTime += sd; this.step++;
    }
  },
  playStep(s, step, t, sd) {
    const nb = s._lead.length, bi = Math.floor(step / 16) % nb, pos = step % 16;
    const D = this.mus;
    // lead
    const bar = s._lead[bi], tok = bar[pos];
    if (tok && tok !== '.' && tok !== '-') {
      let len = 1, k = pos + 1;
      while (k < 16 && bar[k] === '-') { len++; k++; }
      const m = noteMidi(tok);
      if (m !== null) this.osc(mtof(m), t, len * sd * 0.95, { duty: s.duty || 0.25, vol: s.leadVol || 0.1, dest: D, r: Math.min(0.08, len * sd * 0.4), sus: 0.8, vib: len > 3 ? 5.5 : 0 });
    }
    // chord for this position
    const chs = s._bars[bi], ch = chs.length > 1 ? chs[pos < 8 ? 0 : 1] : chs[0];
    const root2 = 36 + ch.root; // C2 based
    // bass (triangle)
    const bv = 0.22;
    const B = (m, len) => this.osc(mtof(m), t, len, { type: 'triangle', vol: bv, dest: D, r: 0.02 });
    switch (s.bass) {
      case 'oct8': if (pos % 2 === 0) B(root2 + ((pos / 2) % 2 ? 12 : 0), sd * 1.8); break;
      case 'pump': if (pos % 2 === 0) B(root2, sd * 1.6); break;
      case 'gallop': if (pos % 4 !== 1) B(root2 + (pos % 8 === 0 ? 12 : 0), sd * 0.9); break;
      case 'half': if (pos % 8 === 0) B(root2, sd * 7.5); break;
      case 'walk': if (pos % 4 === 0) { const W = [0, ch.iv[1], ch.iv[2], ch.iv[2] + 2]; B(root2 + W[pos / 4], sd * 3.6); } break;
    }
    // arp / harmony
    const av = s.arpVol || 0.03, base = 60 + ch.root - (ch.root > 6 ? 12 : 0);
    const tones = ch.iv.map((i) => base + i);
    const A = (m, len, duty) => this.osc(mtof(m), t, len, { duty: duty || 0.125, vol: av, dest: D, r: 0.02 });
    switch (s.arp) {
      case 'up16': A(tones[pos % tones.length], sd * 0.9); break;
      case 'updown16': { const seq = tones.concat(tones.slice(1, -1).reverse()); A(seq[pos % seq.length] + 12, sd * 0.9); break; }
      case 'broken8': if (pos % 2 === 0) A(tones[[0, 2, 1, 2][(pos / 2) % 4] % tones.length], sd * 1.8); break;
      case 'stab': if (pos % 4 === 2) tones.slice(0, 3).forEach((m) => A(m, sd * 1.2, 0.25)); break;
    }
    // drums
    const dp = s._drums[bi % s._drums.length], dt = dp[pos], dv = s.drumVol || 1;
    if (dt && dt !== '.') {
      if (dt.includes('k')) { this.osc(150, t, 0.12, { type: 'sine', vol: 0.32 * dv, slide: 45, dest: D }); }
      if (dt.includes('s')) { this.noise(t, 0.12, { freq: 1500, vol: 0.12 * dv, ftype: 'bandpass', dest: D }); this.osc(190, t, 0.05, { type: 'triangle', vol: 0.08 * dv, dest: D }); }
      if (dt.includes('h')) this.noise(t, 0.035, { freq: 7000, vol: 0.05 * dv, dest: D });
      if (dt.includes('o')) this.noise(t, 0.15, { freq: 6000, vol: 0.05 * dv, dest: D });
    }
  },
};
