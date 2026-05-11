var SoundManager = {
  _ctx: null,
  _master: null,
  enabled: true,

  init() {
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._master = this._ctx.createGain();
      this._master.gain.value = 0.28;
      this._master.connect(this._ctx.destination);

      // Share AudioContext with MusicManager
      MusicManager.init(this._ctx, this._master);

      // Pre-generate 1.5s of white noise once — reused by all _noise() calls
      // so no per-hit buffer allocation blocks the JS thread
      const len = Math.ceil(this._ctx.sampleRate * 1.5);
      this._noiseBuf = this._ctx.createBuffer(1, len, this._ctx.sampleRate);
      const data = this._noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    } catch (e) { this.enabled = false; }
    return this;
  },

  // Call on first user interaction to unlock audio context
  resume() {
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
  },

  play(type) {
    if (!this.enabled || !this._ctx) return;
    this.resume();
    const fn = this['_' + type];
    if (fn) fn.call(this);
  },

  // ── Core helpers ───────────────────────────────────────────────────────

  _osc(freq, type, startTime, duration, vol = 0.3, endFreq = null) {
    const ctx = this._ctx;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(this._master);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  },

  _noise(startTime, duration, filterFreq = 1000, vol = 0.2) {
    const ctx    = this._ctx;
    const src    = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain   = ctx.createGain();

    // Reuse the pre-generated buffer — no per-call allocation
    src.buffer             = this._noiseBuf;
    src.loop               = false;
    filter.type            = 'bandpass';
    filter.frequency.value = filterFreq;
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + Math.min(duration, 1.4));

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this._master);
    src.start(startTime);
    src.stop(startTime + Math.min(duration, 1.4));
  },

  // ── Sound implementations ──────────────────────────────────────────────

  _shoot_orb() {
    const t = this._ctx.currentTime;
    this._osc(600, 'sine',     t,       0.10, 0.18, 320);
    this._osc(900, 'sine',     t,       0.06, 0.08);
  },

  _shoot_arrow() {
    const t = this._ctx.currentTime;
    this._noise(t, 0.07, 2400, 0.18);
    this._osc(180, 'sawtooth', t, 0.05, 0.08, 80);
  },

  _shoot_slash() {
    const t = this._ctx.currentTime;
    this._osc(700, 'sawtooth', t, 0.09, 0.22, 200);
    this._noise(t, 0.08, 1800, 0.12);
  },

  _hit() {
    const t = this._ctx.currentTime;
    this._noise(t, 0.055, 900, 0.22);
    this._osc(220, 'square', t, 0.04, 0.12, 80);
  },

  _enemy_death() {
    const t = this._ctx.currentTime;
    this._osc(280, 'sawtooth', t, 0.18, 0.28, 45);
    this._noise(t, 0.12, 600, 0.18);
  },

  _player_hit() {
    const now = Date.now();
    if (this._lastHitAt && now - this._lastHitAt < 150) return; // debounce
    this._lastHitAt = now;
    const t = this._ctx.currentTime;
    this._osc(90,  'square', t, 0.20, 0.45, 40);
    this._noise(t, 0.18, 280, 0.35);
  },

  _shield_block() {
    const t = this._ctx.currentTime;
    this._osc(880, 'triangle', t,       0.15, 0.40);
    this._osc(1320,'sine',     t,       0.10, 0.22);
    this._osc(660, 'triangle', t+0.05,  0.10, 0.18);
    this._noise(t, 0.05, 4000, 0.12);
  },

  _xp_pickup() {
    const t = this._ctx.currentTime;
    this._osc(1100, 'sine', t,      0.06, 0.10);
    this._osc(1600, 'sine', t+0.03, 0.04, 0.06);
  },

  _level_up() {
    const t   = this._ctx.currentTime;
    const seq = [523, 659, 784, 1047];
    seq.forEach((freq, i) => {
      this._osc(freq, 'triangle', t + i * 0.09, 0.18, 0.22);
    });
  },

  _wave_clear() {
    const t = this._ctx.currentTime;
    [392, 523, 659].forEach((freq, i) => {
      this._osc(freq, 'triangle', t + i * 0.11, 0.22, 0.18);
    });
    this._osc(784, 'sine', t + 0.33, 0.30, 0.14);
  },

  _player_death() {
    const t = this._ctx.currentTime;
    this._osc(220, 'sawtooth', t, 0.80, 0.50, 35);
    this._noise(t, 0.45, 180, 0.35);
    this._osc(110, 'sine', t + 0.15, 0.60, 0.30, 30);
  },

  _campfire_open() {
    const t = this._ctx.currentTime;
    this._osc(330, 'sine',     t,       0.25, 0.20);
    this._osc(440, 'triangle', t+0.12,  0.18, 0.15);
    this._noise(t, 0.30, 400, 0.08);
  },

  _upgrade_buy() {
    const t = this._ctx.currentTime;
    this._osc(440, 'sine', t,      0.10, 0.25);
    this._osc(550, 'sine', t+0.08, 0.10, 0.22);
    this._osc(660, 'sine', t+0.16, 0.15, 0.20);
  },

  _dash() {
    const t = this._ctx.currentTime;
    this._noise(t, 0.10, 3200, 0.22);
    this._osc(420, 'sawtooth', t, 0.08, 0.22, 180);
  },

  _heal() {
    const t = this._ctx.currentTime;
    this._osc(660, 'sine', t,       0.12, 0.15);
    this._osc(880, 'sine', t+0.08,  0.10, 0.18);
    this._osc(1100,'sine', t+0.16,  0.08, 0.14);
  }
};
