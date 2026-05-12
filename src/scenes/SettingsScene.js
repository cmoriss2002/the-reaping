class SettingsScene extends Phaser.Scene {
  constructor() { super('SettingsScene'); }

  create(data) {
    const W = this.scale.width, H = this.scale.height;
    const from = data && data.from ? data.from : 'MainMenuScene';

    this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.82);

    this.add.text(W/2, 80, 'SETTINGS', {
      fontSize: '44px', fill: '#FFD700', fontStyle: 'bold',
      stroke: '#442200', strokeThickness: 4
    }).setOrigin(0.5);

    const sliders = [
      {
        label: 'Music Volume',
        get: ()  => MusicManager._gain ? MusicManager._gain.gain.value / 0.55 : 1,
        set: (v) => { if (MusicManager._gain) MusicManager._gain.gain.value = v * 0.55; },
        key: 'musicVol'
      },
      {
        label: 'SFX Volume',
        get: ()  => SoundManager._master ? SoundManager._master.gain.value / 0.28 : 1,
        set: (v) => { if (SoundManager._master) SoundManager._master.gain.value = v * 0.28; },
        key: 'sfxVol'
      },
    ];

    sliders.forEach((s, i) => {
      const cy  = 180 + i * 74;
      const barX = W/2 - 180, barW = 360, barH = 10;

      this.add.text(W/2, cy - 24, s.label, { fontSize: '20px', fill: '#ccccdd' }).setOrigin(0.5);

      // Track
      const track = this.add.rectangle(W/2, cy, barW, barH, 0x222244).setInteractive();

      // Fill
      const fill = this.add.rectangle(barX, cy, barW * s.get(), barH, 0x4488cc).setOrigin(0, 0.5);

      // Handle
      const handle = this.add.circle(barX + barW * s.get(), cy, 11, 0xaaccff)
        .setInteractive({ draggable: true });

      // Percentage label
      const pctLabel = this.add.text(W/2, cy + 22, `${Math.round(s.get() * 100)}%`, {
        fontSize: '15px', fill: '#8899aa'
      }).setOrigin(0.5);

      // Click on track to jump
      track.on('pointerdown', (ptr) => {
        const pct = Phaser.Math.Clamp((ptr.x - barX) / barW, 0, 1);
        s.set(pct);
        fill.setSize(barW * pct, barH);
        handle.setX(barX + barW * pct);
        pctLabel.setText(`${Math.round(pct * 100)}%`);
        this.saveVolumes();
      });

      // Drag handle
      this.input.setDraggable(handle);
      handle.on('drag', (ptr, dx) => {
        const pct = Phaser.Math.Clamp((ptr.x - barX) / barW, 0, 1);
        s.set(pct);
        fill.setSize(barW * pct, barH);
        handle.setX(barX + barW * pct);
        pctLabel.setText(`${Math.round(pct * 100)}%`);
        this.saveVolumes();
      });
    });

    // Mobile controls toggle
    this.add.text(W/2, 318, 'MOBILE CONTROLS', { fontSize: '16px', fill: '#556688', fontStyle: 'bold' }).setOrigin(0.5);
    let ctrlMode = (() => { try { return JSON.parse(localStorage.getItem('fab_settings') || '{}').controlMode || 'tap'; } catch(e) { return 'tap'; } })();
    const tapBtn = this.add.rectangle(W/2 - 75, 348, 130, 32, ctrlMode === 'tap'      ? 0x1a3a5a : 0x111122).setStrokeStyle(1, 0x4488cc).setInteractive({ useHandCursor: true });
    const joyBtn = this.add.rectangle(W/2 + 75, 348, 130, 32, ctrlMode === 'joystick' ? 0x1a3a5a : 0x111122).setStrokeStyle(1, 0x4488cc).setInteractive({ useHandCursor: true });
    const tapTxt = this.add.text(W/2 - 75, 348, 'Tap to Move', { fontSize: '13px', fill: '#aaccee' }).setOrigin(0.5);
    const joyTxt = this.add.text(W/2 + 75, 348, 'Joystick',    { fontSize: '13px', fill: '#aaccee' }).setOrigin(0.5);
    const setCtrl = (mode) => {
      ctrlMode = mode;
      tapBtn.setFillStyle(mode === 'tap'      ? 0x1a3a5a : 0x111122);
      joyBtn.setFillStyle(mode === 'joystick' ? 0x1a3a5a : 0x111122);
      this.saveVolumes(mode);
    };
    tapBtn.on('pointerdown', () => setCtrl('tap'));
    joyBtn.on('pointerdown', () => setCtrl('joystick'));

    // Controls display
    this.add.text(W/2, 382, 'CONTROLS', { fontSize: '20px', fill: '#556688', fontStyle: 'bold' }).setOrigin(0.5);
    [
      ['WASD / Arrow Keys', 'Move'],
      ['Space',             'Dash (1.5s cd, i-frames)'],
      ['Auto',              'Attack nearest enemy'],
      ['C',                 'Open Camp (upgrades)'],
      ['P / ESC',           'Pause'],
    ].forEach(([key, desc], i) => {
      const y = 412 + i * 30;
      this.add.text(W/2 - 160, y, key,  { fontSize: '18px', fill: '#4488cc' }).setOrigin(1, 0.5);
      this.add.text(W/2 - 140, y, desc, { fontSize: '18px', fill: '#889aaa' }).setOrigin(0, 0.5);
    });

    // ── Reset progress ────────────────────────────────────────────────────
    const resetG = this.add.graphics();
    resetG.lineStyle(1, 0x661111, 0.6);
    resetG.strokeRect(W/2 - 180, H - 148, 360, 74);
    resetG.fillStyle(0x1a0808, 0.6);
    resetG.fillRect(W/2 - 180, H - 148, 360, 74);

    this.add.text(W/2, H - 140, '⚠  DANGER ZONE', {
      fontSize: '11px', fill: '#883333', fontStyle: 'bold', letterSpacing: 2
    }).setOrigin(0.5);

    const resetBtn = this.add.rectangle(W/2, H - 116, 280, 32, 0x3a0c0c)
      .setStrokeStyle(1, 0xaa2222).setInteractive({ useHandCursor: true });
    const resetTxt = this.add.text(W/2, H - 116, 'RESET ALL PROGRESS', {
      fontSize: '15px', fill: '#cc4444', fontStyle: 'bold'
    }).setOrigin(0.5);

    resetBtn.on('pointerover', () => { resetBtn.setFillStyle(0x5a1010); resetTxt.setStyle({ fill: '#ff6666' }); });
    resetBtn.on('pointerout',  () => { resetBtn.setFillStyle(0x3a0c0c); resetTxt.setStyle({ fill: '#cc4444' }); });
    resetBtn.on('pointerdown', () => this.showResetConfirm(W, H));

    // Back
    const back = this.add.rectangle(W/2, H - 30, 200, 36, 0x222233)
      .setStrokeStyle(1, 0x446688).setInteractive({ useHandCursor: true });
    this.add.text(W/2, H - 30, '← BACK', { fontSize: '18px', fill: '#aabbcc' }).setOrigin(0.5);
    back.on('pointerover', () => back.setFillStyle(0x334455));
    back.on('pointerout',  () => back.setFillStyle(0x222233));
    back.on('pointerdown', () => this.scene.start(from));

    this.input.keyboard.once('keydown-ESC', () => this.scene.start(from));

    this.cameras.main.fadeIn(200, 0, 0, 0);
  }

  showResetConfirm(W, H) {
    // Dim overlay
    const overlay = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.75);

    // Modal box
    const modal = this.add.rectangle(W/2, H/2, 440, 200, 0x100808)
      .setStrokeStyle(2, 0xaa2222);

    this.add.text(W/2, H/2 - 70, '⚠  Are you sure?', {
      fontSize: '26px', fill: '#ff4444', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(W/2, H/2 - 30, 'This will delete all souls, upgrades,\nascension levels and personal bests.', {
      fontSize: '15px', fill: '#aa6666', align: 'center', lineSpacing: 4
    }).setOrigin(0.5);

    // YES button
    const yes = this.add.rectangle(W/2 - 80, H/2 + 56, 140, 40, 0x5a0c0c)
      .setStrokeStyle(1, 0xdd2222).setInteractive({ useHandCursor: true });
    const yesTxt = this.add.text(W/2 - 80, H/2 + 56, 'YES, RESET', {
      fontSize: '16px', fill: '#ff5555', fontStyle: 'bold'
    }).setOrigin(0.5);

    yes.on('pointerover', () => { yes.setFillStyle(0x8a1010); yesTxt.setStyle({ fill: '#ff8888' }); });
    yes.on('pointerout',  () => { yes.setFillStyle(0x5a0c0c); yesTxt.setStyle({ fill: '#ff5555' }); });
    yes.on('pointerdown', () => {
      MetaProgress.load();
      MetaProgress.reset();
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(320, () => this.scene.start('MainMenuScene'));
    });

    // NO button
    const no = this.add.rectangle(W/2 + 80, H/2 + 56, 140, 40, 0x1a2233)
      .setStrokeStyle(1, 0x446688).setInteractive({ useHandCursor: true });
    const noTxt = this.add.text(W/2 + 80, H/2 + 56, 'CANCEL', {
      fontSize: '16px', fill: '#aabbcc', fontStyle: 'bold'
    }).setOrigin(0.5);

    no.on('pointerover', () => { no.setFillStyle(0x2a3a55); noTxt.setStyle({ fill: '#ccddef' }); });
    no.on('pointerout',  () => { no.setFillStyle(0x1a2233); noTxt.setStyle({ fill: '#aabbcc' }); });
    no.on('pointerdown', () => {
      [overlay, modal, yes, yesTxt, no, noTxt].forEach(o => o.destroy());
      this.children.list
        .filter(c => c.type === 'Text' && (c.text === '⚠  Are you sure?' || c.text.includes('This will delete')))
        .forEach(t => t.destroy());
    });
  }

  saveVolumes(controlMode) {
    try {
      const existing = JSON.parse(localStorage.getItem('fab_settings') || '{}');
      const mv = MusicManager._gain ? MusicManager._gain.gain.value / 0.55 : 1;
      const sv = SoundManager._master ? SoundManager._master.gain.value / 0.28 : 1;
      const mode = controlMode !== undefined ? controlMode : (existing.controlMode || 'tap');
      localStorage.setItem('fab_settings', JSON.stringify({ ...existing, musicVol: mv, sfxVol: sv, controlMode: mode }));
    } catch (e) {}
  }

  static saveFromOutside(controlMode) {
    try {
      const existing = JSON.parse(localStorage.getItem('fab_settings') || '{}');
      const mv = MusicManager._gain ? MusicManager._gain.gain.value / 0.55 : 1;
      const sv = SoundManager._master ? SoundManager._master.gain.value / 0.28 : 1;
      const mode = controlMode !== undefined ? controlMode : (existing.controlMode || 'tap');
      localStorage.setItem('fab_settings', JSON.stringify({ ...existing, musicVol: mv, sfxVol: sv, controlMode: mode }));
    } catch(e) {}
  }

  static loadVolumes() {
    try {
      const s = JSON.parse(localStorage.getItem('fab_settings') || '{}');
      if (s.musicVol !== undefined && MusicManager._gain)  MusicManager._gain.gain.value  = s.musicVol * 0.55;
      if (s.sfxVol   !== undefined && SoundManager._master) SoundManager._master.gain.value = s.sfxVol   * 0.28;
    } catch (e) {}
  }
}
