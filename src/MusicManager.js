var MusicManager = {
  _ctx:     null,
  _gain:    null,
  _nodes:   [],
  _loopId:  null,
  _current: null,
  _gen:     0,       // generation tag so stale loops self-cancel

  init(ctx, masterGain) {
    this._ctx  = ctx;
    this._gain = ctx.createGain();
    this._gain.gain.value = 0;
    // Connect directly to destination — not through masterGain —
    // so music volume is independent of SFX volume
    this._gain.connect(ctx.destination);
    return this;
  },

  play(track) {
    if (!this._ctx || this._current === track) return;
    // If context is suspended (browser policy), wait until it resumes
    if (this._ctx.state === 'suspended') {
      this._pendingTrack = track;
      const onResume = () => {
        this._ctx.removeEventListener('statechange', onResume);
        if (this._pendingTrack) {
          const t = this._pendingTrack;
          this._pendingTrack = null;
          this._fadeToTrack(t);
        }
      };
      this._ctx.addEventListener('statechange', onResume);
      return;
    }
    this._pendingTrack = null;
    this._fadeToTrack(track);
  },

  stop() {
    this._fadeTo(0, () => this._killNodes());
    clearTimeout(this._loopId);
    this._current = null;
    this._gen++;
  },

  // ── Internal ──────────────────────────────────────────────────────────────

  _fadeToTrack(track) {
    const gen = ++this._gen;
    this._current = track;
    const g = this._gain.gain;
    g.cancelScheduledValues(this._ctx.currentTime);
    g.linearRampToValueAtTime(0, this._ctx.currentTime + 0.8);
    clearTimeout(this._loopId);

    setTimeout(() => {
      if (this._gen !== gen) return;
      this._killNodes();
      g.cancelScheduledValues(this._ctx.currentTime);
      g.setValueAtTime(0, this._ctx.currentTime);
      g.linearRampToValueAtTime(0.55, this._ctx.currentTime + 1.5);
      this._startLoop(track, gen);
    }, 900);
  },

  _fadeTo(vol, cb) {
    const g = this._gain.gain;
    g.cancelScheduledValues(this._ctx.currentTime);
    g.linearRampToValueAtTime(vol, this._ctx.currentTime + 1.2);
    if (cb) setTimeout(cb, 1300);
  },

  _killNodes() {
    this._nodes.forEach(n => { try { n.stop(); } catch (e) {} });
    this._nodes = [];
  },

  // ── Note helpers ──────────────────────────────────────────────────────────

  // Sustained pad note starting now, lasting `dur` seconds
  _pad(freq, dur, vol = 0.18, type = 'sine') {
    const ctx = this._ctx, t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    osc.type = type;
    osc.frequency.value = freq;
    filt.type = 'lowpass';
    filt.frequency.value = freq * 4;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 1.0);
    gain.gain.setValueAtTime(vol, t + dur - 1.0);
    gain.gain.linearRampToValueAtTime(0, t + dur);
    osc.connect(filt); filt.connect(gain); gain.connect(this._gain);
    osc.start(t); osc.stop(t + dur + 0.05);
    this._nodes.push(osc);
  },

  // Single note at a scheduled time
  _note(freq, time, dur, vol = 0.20, type = 'triangle') {
    const ctx = this._ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + Math.min(0.04, dur * 0.1));
    gain.gain.setValueAtTime(vol * 0.7, time + dur * 0.6);
    gain.gain.linearRampToValueAtTime(0, time + dur);
    osc.connect(gain); gain.connect(this._gain);
    osc.start(time); osc.stop(time + dur + 0.05);
    this._nodes.push(osc);
  },

  // Low kick-like pulse
  _kick(time, vol = 0.30) {
    const ctx = this._ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.15);
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    osc.connect(gain); gain.connect(this._gain);
    osc.start(time); osc.stop(time + 0.2);
    this._nodes.push(osc);
  },

  _startLoop(track, gen) {
    const loops = { menu: '_loopMenu', game: '_loopGame', boss: '_loopBoss', campfire: '_loopCampfire' };
    if (loops[track]) this[loops[track]](gen);
  },

  // ── D minor pentatonic: D F G A C ─────────────────────────────────────────
  // Octave 1: 36.7  43.7  49.0  55.0  65.4
  // Octave 2: 73.4  87.3  98.0  110   130.8
  // Octave 3: 146.8 174.6 196   220   261.6
  // Octave 4: 293.7 349.2 392   440   523.2

  // ── Menu: slow dark ambient ───────────────────────────────────────────────
  _loopMenu(gen) {
    if (this._gen !== gen) return;
    const t   = this._ctx.currentTime;
    const dur = 10; // loop duration seconds

    // Bass drone
    this._pad(36.7, dur + 1, 0.30, 'sine');
    this._pad(73.4, dur + 1, 0.18, 'sine');

    // Chord swells
    [[146.8, 0], [174.6, 1.5], [220, 3], [261.6, 5], [196, 7], [146.8, 9]]
      .forEach(([f, dt]) => this._note(f, t + dt, 2.2, 0.15));

    // Occasional high eerie accent
    if (Math.random() > 0.4) this._note(587.4, t + 4, 1.0, 0.12);
    if (Math.random() > 0.6) this._note(440,   t + 7, 0.8, 0.12);

    this._loopId = setTimeout(() => this._loopMenu(gen), (dur - 0.2) * 1000);
  },

  // ── Game: dark driving action ─────────────────────────────────────────────
  _loopGame(gen) {
    if (this._gen !== gen) return;
    const bpm  = 110;
    const beat = 60 / bpm;
    const bars = 8;
    const dur  = bars * 4 * beat;
    const t    = this._ctx.currentTime;

    // Sub-bass drone for weight
    this._pad(36.7, dur + 0.5, 0.28, 'sine');

    // Walking bass — moves every 2 bars: D F G F
    [[73.4, 0], [87.3, 2], [98.0, 4], [87.3, 6]].forEach(([f, bar]) => {
      this._note(f,     t + bar * beat * 4, beat * 7.8, 0.24, 'sine');
      this._note(f * 2, t + bar * beat * 4, beat * 7.8, 0.10, 'sawtooth');
    });

    // Kick: strong on 1, medium on 3, off-beat flick on bar 2 of each phrase
    for (let i = 0; i < bars * 4; i++) {
      const bt = t + i * beat;
      if (i % 4 === 0) this._kick(bt, 0.28);
      if (i % 4 === 2) this._kick(bt, 0.18);
      if (i % 8 === 7) this._kick(bt, 0.10);
    }

    // Rhythmic off-beat pulse for forward drive
    for (let i = 0; i < bars * 4; i++) {
      if (i % 2 === 1) this._note(146.8, t + i * beat, beat * 0.30, 0.07, 'square');
    }

    // Structured 4-bar melody in D minor — repeated twice
    // D  F  A  G | F  E  D  C | D  F  G  A | C5 A  G  F
    const phrase = [
      [293.7,  0], [349.2,  1], [440,    2], [392,    3],
      [349.2,  4], [329.6,  5], [293.7,  6], [261.6,  7],
      [293.7,  8], [349.2,  9], [392,   10], [440,   11],
      [523.3, 12], [440,   13], [392,   14], [349.2, 15],
    ];
    for (let rep = 0; rep < 2; rep++) {
      phrase.forEach(([f, b]) => {
        this._note(f, t + (rep * 16 + b) * beat, beat * 0.78, 0.16, 'triangle');
      });
    }

    // Tension chord stabs on the back half (bars 5-8)
    [[146.8, 220, 16], [174.6, 261.6, 20], [196, 293.7, 24], [174.6, 246.9, 28]]
      .forEach(([f1, f2, b]) => {
        this._note(f1, t + b * beat, beat * 1.6, 0.10, 'square');
        this._note(f2, t + b * beat, beat * 1.6, 0.08, 'square');
      });

    this._loopId = setTimeout(() => this._loopGame(gen), (dur - 0.15) * 1000);
  },

  // ── Boss: intense, dissonant, fast ───────────────────────────────────────
  _loopBoss(gen) {
    if (this._gen !== gen) return;
    const bpm  = 150;
    const beat = 60 / bpm;
    const bars = 4;
    const dur  = bars * 4 * beat;
    const t    = this._ctx.currentTime;

    // Heavy bass on every beat
    for (let i = 0; i < bars * 4; i++) {
      this._kick(t + i * beat, 0.35);
      if (i % 2 === 1) this._note(36.7, t + i * beat, beat * 0.5, 0.20, 'sawtooth');
    }

    // Tense tritone stabs
    const stabs = [[261.6, 0], [277.2, beat], [233.1, beat*2], [246.9, beat*3],
                   [220,   beat*4], [261.6, beat*5], [196, beat*6], [207.6, beat*7]];
    stabs.forEach(([f, dt]) => this._note(f, t + dt, beat * 0.4, 0.18, 'square'));

    // Pad tension
    this._pad(73.4,  dur + 0.2, 0.22, 'sawtooth');
    this._pad(110,   dur + 0.2, 0.14, 'sawtooth');

    this._loopId = setTimeout(() => this._loopBoss(gen), (dur - 0.1) * 1000);
  },

  // ── Campfire: warm, peaceful ──────────────────────────────────────────────
  _loopCampfire(gen) {
    if (this._gen !== gen) return;
    const t   = this._ctx.currentTime;
    const dur = 12;

    // Warm A major pad (A C# E = 220, 277.2, 329.6)
    this._pad(110,   dur + 1, 0.20, 'sine');
    this._pad(220,   dur + 1, 0.16, 'sine');
    this._pad(277.2, dur + 1, 0.12, 'sine');
    this._pad(329.6, dur + 1, 0.12, 'sine');

    // Gentle melody
    [[440,  0],  [523.2, 1.5], [659.3, 3],   [587.3, 4.5],
     [523.2, 6], [440,   7.5], [392,   9],   [440,   10.5]]
      .forEach(([f, dt]) => this._note(f, t + dt, 1.4, 0.18));

    this._loopId = setTimeout(() => this._loopCampfire(gen), (dur - 0.2) * 1000);
  }
};
