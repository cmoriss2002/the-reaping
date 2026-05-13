class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenuScene'); }

  create() {
    const W = this.scale.width, H = this.scale.height;

    // ── Sky ───────────────────────────────────────────────────────────────
    const sky = this.add.graphics();
    // Deep night gradient: near-black at top, dark indigo toward horizon
    sky.fillStyle(0x04040e, 1); sky.fillRect(0, 0, W, H * 0.55);
    sky.fillStyle(0x080820, 1); sky.fillRect(0, H * 0.45, W, H * 0.2);
    sky.fillStyle(0x0c1228, 1); sky.fillRect(0, H * 0.6,  W, H * 0.4);

    // ── Moon ──────────────────────────────────────────────────────────────
    const moonX = W * 0.78, moonY = 110;
    sky.fillStyle(0x2a2a55, 0.18); sky.fillCircle(moonX, moonY, 85);
    sky.fillStyle(0x4444aa, 0.12); sky.fillCircle(moonX, moonY, 65);
    sky.fillStyle(0xe8eeff, 1);    sky.fillCircle(moonX, moonY, 46);
    // Craters
    sky.fillStyle(0xccd4ee, 0.55);
    sky.fillCircle(moonX - 14, moonY - 8,  11);
    sky.fillCircle(moonX + 17, moonY + 10,  8);
    sky.fillCircle(moonX - 3,  moonY + 20,  5);
    // Wispy cloud crossing the moon
    sky.fillStyle(0x0c1228, 0.45);
    sky.fillEllipse(moonX + 30, moonY - 5, 110, 28);
    sky.fillStyle(0x0c1228, 0.30);
    sky.fillEllipse(moonX - 20, moonY + 12, 80, 20);

    // ── Floating soul wisps ───────────────────────────────────────────────
    for (let i = 0; i < 28; i++) {
      const x   = Phaser.Math.Between(20, W - 20);
      const y   = Phaser.Math.Between(30, H * 0.58);
      const r   = Math.random() < 0.7 ? 1 : 2;
      const col = Math.random() < 0.55 ? 0x44ffbb : 0x8899ff;
      const wisp = this.add.circle(x, y, r, col, Math.random() * 0.5 + 0.15);
      this.tweens.add({
        targets: wisp,
        y:     y - 18 - Math.random() * 28,
        alpha: { from: wisp.alpha, to: wisp.alpha * 0.2 },
        duration: 2200 + Math.random() * 2800,
        yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 2000
      });
    }

    // ── Distant tree line (layer 1 — far, lighter) ────────────────────────
    const treeFar = this.add.graphics();
    treeFar.fillStyle(0x0a0e1a, 1);
    for (let i = 0; i < 22; i++) {
      const tx = i * 62 + Phaser.Math.Between(-10, 10);
      const ty = H * 0.50 + Phaser.Math.Between(0, 18);
      const th = 55 + Phaser.Math.Between(0, 35);
      const tw = th * 0.45;
      treeFar.fillTriangle(tx + tw/2, ty - th, tx, ty, tx + tw, ty);
      treeFar.fillTriangle(tx + tw/2, ty - th * 0.65, tx + tw*0.08, ty - th*0.28, tx + tw*0.92, ty - th*0.28);
      treeFar.fillRect(tx + tw/2 - 3, ty, 5, 14);
    }

    // ── Mist bands ────────────────────────────────────────────────────────
    const mist = this.add.graphics();
    mist.fillStyle(0x0d1830, 0.55); mist.fillEllipse(W/2, H * 0.615, W * 1.6, 70);
    mist.fillStyle(0x0d1830, 0.35); mist.fillEllipse(W/2 - 80, H * 0.58, W * 1.2, 44);
    mist.fillStyle(0x101e3a, 0.25); mist.fillEllipse(W/2 + 60, H * 0.64, W * 1.3, 36);

    // ── Near tree line (layer 2 — closer, darker) ─────────────────────────
    const treeNear = this.add.graphics();
    treeNear.fillStyle(0x050810, 1);
    for (let i = 0; i < 14; i++) {
      const tx = i * 100 + Phaser.Math.Between(-15, 15);
      const ty = H * 0.60 + Phaser.Math.Between(0, 12);
      const th = 80 + Phaser.Math.Between(0, 50);
      const tw = th * 0.48;
      treeNear.fillTriangle(tx + tw/2, ty - th, tx, ty, tx + tw, ty);
      treeNear.fillTriangle(tx + tw/2, ty - th * 0.60, tx + tw*0.06, ty - th*0.24, tx + tw*0.94, ty - th*0.24);
      treeNear.fillRect(tx + tw/2 - 4, ty, 7, 18);
    }

    // ── Ground base ───────────────────────────────────────────────────────
    const ground = this.add.graphics();
    ground.fillStyle(0x060a07, 1); ground.fillRect(0, H * 0.65, W, H * 0.35);

    // ── Rocky / earthy ground texture ─────────────────────────────────────
    const gnd = this.add.graphics();

    // Dark earth patches — give the ground uneven color variation
    const earthPatch = (x, y, w, h, col) => { gnd.fillStyle(col, 1); gnd.fillEllipse(x, y, w, h); };
    [[180,  H*0.72, 140, 22, 0x0c1209], [420, H*0.75, 110, 18, 0x0a100a],
     [660,  H*0.70, 160, 24, 0x0e130b], [880, H*0.74, 130, 20, 0x0b1109],
     [1080, H*0.71, 120, 18, 0x0d1208], [340, H*0.79, 100, 16, 0x090e08],
     [740,  H*0.78, 145, 22, 0x0c1109], [1200,H*0.76, 100, 18, 0x0b1009]
    ].forEach(([x, y, w, h, c]) => earthPatch(x, y, w, h, c));

    // Rocky pebbles scattered on the ground
    const rng = (a, b) => Phaser.Math.Between(a, b);
    gnd.fillStyle(0x1a1c14, 1);
    for (let i = 0; i < 26; i++) {
      const rx = rng(10, W - 10);
      const ry = H * 0.68 + rng(0, H * 0.28);
      const rw = rng(7, 20), rh = rng(4, 10);
      gnd.fillEllipse(rx, ry, rw, rh);
    }
    // Slightly lighter face on each rock cluster for 3D feel
    gnd.fillStyle(0x252820, 0.6);
    for (let i = 0; i < 14; i++) {
      const rx = rng(10, W - 10);
      const ry = H * 0.69 + rng(0, H * 0.26);
      gnd.fillEllipse(rx - 2, ry - 2, rng(4, 10), rng(3, 6));
    }

    // Grass tufts along the ground/treeline transition
    gnd.fillStyle(0x1e3d12, 1);
    for (let i = 0; i < 55; i++) {
      const gx = rng(0, W);
      const gy = H * 0.645 + rng(-4, 8);
      const gh = 7 + Math.random() * 11;
      // Each tuft: 2-3 blades
      gnd.fillTriangle(gx,     gy,  gx - 3, gy - gh,        gx + 3, gy);
      gnd.fillTriangle(gx + 3, gy,  gx + 5, gy - gh * 0.75, gx + 8, gy);
      if (Math.random() > 0.4)
        gnd.fillTriangle(gx - 4, gy, gx - 6, gy - gh * 0.6,  gx - 1, gy);
    }
    // Slightly lighter green tips for moonlit grass
    gnd.fillStyle(0x2e5a1a, 0.5);
    for (let i = 0; i < 30; i++) {
      const gx = rng(0, W);
      const gy = H * 0.643 + rng(-2, 4);
      const gh = 5 + Math.random() * 7;
      gnd.fillTriangle(gx, gy, gx - 2, gy - gh, gx + 2, gy);
    }

    // Moonlit ground edge glow
    ground.fillStyle(0x0e1e10, 1); ground.fillRect(0, H * 0.638, W, 8);

    // ── Foreground graveyard silhouettes ──────────────────────────────────
    const graves = this.add.graphics();
    graves.fillStyle(0x030610, 1);
    const graveData = [
      { x: 55,   h: 52, w: 22 }, { x: 160,  h: 38, w: 18 },
      { x: 930,  h: 44, w: 20 }, { x: 1050, h: 60, w: 24 },
      { x: 1170, h: 36, w: 17 }, { x: 1260, h: 48, w: 21 },
    ];
    graveData.forEach(({ x, h, w }) => {
      const y = H * 0.66 + Phaser.Math.Between(0, 16);
      graves.fillRect(x - w/2, y - h, w, h);
      graves.fillCircle(x, y - h, w / 2);
      graves.fillRect(x - w/2 - 5, y - 7, w + 10, 9);
      // Cross
      graves.fillRect(x - 1, y - h + 6, 2, h * 0.5);
      graves.fillRect(x - 6, y - h + 14, 12, 2);
    });

    // Broken pillar silhouettes
    graves.fillRect(490, H * 0.59, 16, H * 0.1);
    graves.fillRect(487, H * 0.585, 22, 8);
    graves.fillRect(802, H * 0.57, 18, H * 0.12);
    graves.fillRect(799, H * 0.568, 24, 8);

    // ── Title ─────────────────────────────────────────────────────────────
    this.add.text(W/2, 148, 'THE', {
      fontSize: '62px', fill: '#aaddff', fontStyle: 'bold',
      stroke: '#224488', strokeThickness: 7
    }).setOrigin(0.5);

    this.add.text(W/2, 228, 'REAPING', {
      fontSize: '82px', fill: '#FFD700', fontStyle: 'bold',
      stroke: '#442200', strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(W/2, 318, 'Roguelite Auto-Battler', {
      fontSize: '22px', fill: '#778899', fontStyle: 'italic'
    }).setOrigin(0.5);

    // ── Enemy previews ────────────────────────────────────────────────────
    const enemies = [
      { key: 'slime',    label: 'Slime',    scale: 1.1 },
      { key: 'goblin',   label: 'Goblin',   scale: 1.0 },
      { key: 'skeleton', label: 'Skeleton', scale: 1.0 },
      { key: 'dragon',   label: 'Dragon',   scale: 0.9 },
    ];
    enemies.forEach((e, i) => {
      const cx = W/2 - 270 + i * 180;
      this.add.sprite(cx, 430, e.key).setScale(e.scale);
      this.add.text(cx, 468, e.label, { fontSize: '14px', fill: '#889aaa' }).setOrigin(0.5);
    });

    // ── Buttons ───────────────────────────────────────────────────────────
    const btnBg = this.add.rectangle(W/2, 548, 280, 56, 0x224488)
      .setInteractive({ useHandCursor: true });
    const btnText = this.add.text(W/2, 548, 'START RUN', {
      fontSize: '28px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x4488cc));
    btnBg.on('pointerout',  () => btnBg.setFillStyle(0x224488));
    btnBg.on('pointerdown', () => {
      SoundManager.resume();
      this.scene.start('CharacterSelectScene');
    });

    // Leaderboard button
    const lbBtn = this.add.text(W/2, 610, '🏆 Leaderboard', { fontSize: '18px', fill: '#aa8833' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    lbBtn.on('pointerover', () => lbBtn.setStyle({ fill: '#FFD700' }));
    lbBtn.on('pointerout',  () => lbBtn.setStyle({ fill: '#aa8833' }));
    lbBtn.on('pointerdown', () => this.scene.start('LeaderboardScene', { from: 'MainMenuScene' }));

    // Settings button
    const setBtn = this.add.text(30, 30, '⚙ Settings', { fontSize: '16px', fill: '#446688' })
      .setInteractive({ useHandCursor: true });
    setBtn.on('pointerover', () => setBtn.setStyle({ fill: '#88aacc' }));
    setBtn.on('pointerout',  () => setBtn.setStyle({ fill: '#446688' }));
    setBtn.on('pointerdown', () => this.scene.start('SettingsScene', { from: 'MainMenuScene' }));

    // How to play
    const helpBtn = this.add.text(W - 30, 30, '? How to Play', { fontSize: '16px', fill: '#446688' })
      .setOrigin(1, 0).setInteractive({ useHandCursor: true });
    helpBtn.on('pointerover', () => helpBtn.setStyle({ fill: '#88aacc' }));
    helpBtn.on('pointerout',  () => helpBtn.setStyle({ fill: '#446688' }));
    helpBtn.on('pointerdown', () => this.showHelp(W, H));

    MetaProgress.load();

    this.add.text(W/2, 600, 'WASD / Arrow Keys to move  •  Space to dash  •  Level up = choose an upgrade', {
      fontSize: '17px', fill: '#445566'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: btnText,
      scaleX: 1.05, scaleY: 1.05,
      duration: 700, yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Personal best + ascension panel — bottom right
    const rec = MetaProgress.records;
    const asc = MetaProgress.ascensionLevel;
    const px = W - 20, py = H - 24;

    if (asc > 0) {
      this.add.text(px, py - 134, `✦ ASCENSION LV ${asc}`, {
        fontSize: '16px', fill: '#aa66cc', fontStyle: 'bold'
      }).setOrigin(1, 0.5);
      this.add.text(px, py - 114, `+${asc * 3}% dmg  ·  +${asc * 3}% HP  ·  +${asc * 2} speed`, {
        fontSize: '14px', fill: '#664488'
      }).setOrigin(1, 0.5);
    }

    const lifetimeSouls = MetaProgress.lifetimeSouls;
    if (lifetimeSouls > 0) {
      this.add.text(px, py - (asc > 0 ? 90 : 90), `💀 ${lifetimeSouls.toLocaleString()} lifetime souls`, {
        fontSize: '16px', fill: '#886633'
      }).setOrigin(1, 0.5);
    }

    if (rec.wave > 0 || rec.kills > 0) {
      const baseY = py - (lifetimeSouls > 0 ? 64 : 90) + (asc > 0 ? -24 : 0);
      this.add.text(px, baseY, 'PERSONAL BESTS', { fontSize: '14px', fill: '#444466', fontStyle: 'bold' }).setOrigin(1, 0.5);
      const t = rec.time || 0;
      const pb = [
        ['Best Wave', rec.wave],
        ['Best Kills', rec.kills],
        ['Best Level', rec.level],
        ['Longest Run', `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`],
      ];
      pb.forEach(([label, val], i) => {
        this.add.text(px, baseY + 20 + i * 20, `${label}:  ${val}`, { fontSize: '15px', fill: '#445566' }).setOrigin(1, 0.5);
      });
    }

    MusicManager.play('menu');
  }

  showHelp(W, H) {
    const overlay = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.85).setDepth(10)
      .setInteractive(); // blocks clicks through

    this.add.rectangle(W/2, H/2, 700, 420, 0x0c0c1e).setDepth(11)
      .setStrokeStyle(2, 0x5577aa);

    this.add.text(W/2, H/2 - 170, '⚔  HOW TO PLAY', {
      fontSize: '28px', fill: '#FFD700', fontStyle: 'bold',
      stroke: '#442200', strokeThickness: 4
    }).setOrigin(0.5).setDepth(12);

    const lines = [
      ['OBJECTIVE',  'Survive endless waves of undead. Kill enemies, earn XP,'],
      ['',           'level up, and grow powerful enough to slay the Lich boss.'],
      ['MOVE',       'WASD or Arrow Keys'],
      ['DASH',       'Space  (1.5s cooldown, invincible during dash)'],
      ['ATTACK',     'Automatic — targets the nearest visible enemy'],
      ['LEVEL UP',   'Pick one upgrade card — weapons, passives, or bonuses'],
      ['SOULS',      'Earned from kills. Spend at the Campfire (C key mid-run)'],
      ['',           'for permanent upgrades that carry across every run.'],
      ['BOSS',       'Every 5 waves a Lich appears. Defeat it to advance.'],
    ];

    let y = H/2 - 110;
    lines.forEach(([label, text]) => {
      if (label) {
        this.add.text(W/2 - 300, y, label, { fontSize: '14px', fill: '#4488cc', fontStyle: 'bold' })
          .setOrigin(0, 0.5).setDepth(12);
      }
      this.add.text(label ? W/2 - 160 : W/2 - 300 + 88, y, text, { fontSize: '14px', fill: '#aabbcc' })
        .setOrigin(0, 0.5).setDepth(12);
      y += label ? 30 : 20;
    });

    const closeBtn = this.add.rectangle(W/2, H/2 + 170, 180, 38, 0x1a2244)
      .setStrokeStyle(1, 0x4466aa).setInteractive({ useHandCursor: true }).setDepth(12);
    this.add.text(W/2, H/2 + 170, 'Got it  ✓', { fontSize: '18px', fill: '#88aaff', fontStyle: 'bold' })
      .setOrigin(0.5).setDepth(13);

    const dismiss = () => {
      this.children.list
        .filter(c => c.depth >= 10)
        .forEach(c => c.destroy());
    };
    closeBtn.on('pointerdown', dismiss);
    overlay.on('pointerdown', dismiss);
  }
}
