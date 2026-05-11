class PauseScene extends Phaser.Scene {
  constructor() { super('PauseScene'); }

  create(data) {
    const W = this.scale.width, H = this.scale.height;
    const gs = data.gameScene;
    const p  = gs.player;

    // ── Backdrop ──────────────────────────────────────────────────────────
    // Full-screen dim
    this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.65).setDepth(1);

    // Central solid panel
    const panW = 1100, panH = 560;
    const panX = W/2, panY = H/2 + 24;
    this.add.rectangle(panX, panY, panW, panH, 0x0c0c1e, 1).setDepth(2);
    // Panel border with glow effect (two strokes)
    this.add.rectangle(panX, panY, panW,     panH,     0x000000, 0).setStrokeStyle(4, 0x5577aa, 1).setDepth(3);
    this.add.rectangle(panX, panY, panW + 4, panH + 4, 0x000000, 0).setStrokeStyle(1, 0x334466, 0.5).setDepth(3);

    // ── Title bar ─────────────────────────────────────────────────────────
    this.add.rectangle(panX, panY - panH/2, panW, 40, 0x1a1a35, 1).setOrigin(0.5, 1).setDepth(3);
    this.add.text(panX, panY - panH/2 + 20, '⏸  PAUSED', {
      fontSize: '32px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(4);

    // Run stats strip
    const elapsed = Math.floor((Date.now() - gs.stats.startTime) / 1000);
    const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const secs = (elapsed % 60).toString().padStart(2, '0');
    this.add.text(panX, panY - panH/2 + 56, `Wave ${gs.waveManager.wave}   ·   Level ${p.level}   ·   ${gs.stats.kills} kills   ·   ${mins}:${secs}`, {
      fontSize: '15px', fill: '#8899aa'
    }).setOrigin(0.5).setDepth(4);

    // Thin separator below stats
    this.add.rectangle(panX, panY - panH/2 + 72, panW - 40, 1, 0x334466, 0.8).setDepth(4);

    // ── Column divider ────────────────────────────────────────────────────
    const divX = panX + 10;
    this.add.rectangle(divX, panY + 10, 1, panH - 100, 0x334466, 0.6).setDepth(3);

    const leftX  = panX - panW/2 + 20;   // left edge of panel
    const rightX = divX + 20;             // right of divider
    const colW   = (panW - 60) / 2;      // usable column width
    const startY = panY - panH/2 + 82;   // top of content area

    // ── WEAPONS column ────────────────────────────────────────────────────
    this.sectionHeader(leftX + colW/2, startY, '⚔  WEAPONS', '#66aaff');

    const wColors = {
      magic_orb: 0x4422aa, sword_slash: 0x1e3d7a, arrow: 0x1a4a22,
      boomerang: 0x6a3010, fire_nova: 0x7a1a0a, daggers: 0x2a4a2a,
      chaos_nova: 0x551177, storm_bow: 0x0d4455, holy_blade: 0x7a6008,
      soul_catcher: 0x223355,
    };
    const wNames = {
      magic_orb: 'Magic Orb', sword_slash: 'Sword Slash', arrow: 'Longbow',
      boomerang: 'Boomerang', fire_nova: 'Fire Nova', daggers: 'Daggers',
      chaos_nova: 'Chaos Nova', storm_bow: 'Storm Bow',
      holy_blade: 'Holy Blade', soul_catcher: 'Soul Catcher',
    };
    const wIcons = {
      magic_orb:    '🔮',
      sword_slash:  '🗡',
      arrow:        '🏹',
      boomerang:    '🪃',
      fire_nova:    '🔥',
      daggers:      '🔪',
      chaos_nova:   '🌀',
      storm_bow:    '⚡',
      holy_blade:   '✨',
      soul_catcher: '👻',
    };

    const cardW = colW - 10, cardH = 54, cardGap = 7;
    p.weapons.forEach((wDef, i) => {
      const cx = leftX + colW / 2;
      const cy = startY + 58 + i * (cardH + cardGap);
      const col = wColors[wDef.id] || 0x223344;
      const effectiveCd = (wDef.cooldown * (1 - p.passiveStats.cooldownReduction) / 1000).toFixed(1);
      const dmg = Math.floor(wDef.damage * (1 + p.passiveStats.damageMultiplier));

      // Card background
      this.add.rectangle(cx, cy, cardW, cardH, col, 1).setDepth(4);
      if (wDef.evolved) {
        this.add.rectangle(cx, cy - cardH/2 + 3, cardW, 5, 0xffcc00, 1).setDepth(5);
      }
      this.add.rectangle(cx, cy, cardW, cardH, 0xffffff, 0)
        .setStrokeStyle(1, wDef.evolved ? 0xffcc00 : 0x4466aa).setDepth(5);

      // Weapon icon + name
      const nameColor = wDef.evolved ? '#ffe066' : '#ffffff';
      const icon = wIcons[wDef.id] || '⚔️';
      this.add.text(cx - cardW/2 + 10, cy - 14,
        `${icon}  ${wNames[wDef.id] || wDef.id}${wDef.evolved ? '  ★' : ''}`, {
        fontSize: '16px', fill: nameColor, fontStyle: 'bold'
      }).setDepth(6);

      // Stats
      const extras = wDef.piercing ? '  ·  pierce' : '';
      this.add.text(cx - cardW/2 + 10, cy + 7,
        `${dmg} dmg  ·  ${effectiveCd}s cd${extras}`, {
        fontSize: '13px', fill: '#99ccdd'
      }).setDepth(6);
    });

    // ── Character stat panel ──────────────────────────────────────────────
    const cStatY = startY + 58 + p.weapons.length * (cardH + cardGap) + 14;
    const statBoxH = 106;
    const bx = leftX, by = cStatY, bw = cardW;

    // Background + border
    this.add.rectangle(bx + bw/2, by + statBoxH/2, bw, statBoxH, 0x0e0e22, 1).setDepth(4);
    this.add.rectangle(bx + bw/2, by + statBoxH/2, bw, statBoxH, 0, 0)
      .setStrokeStyle(1, 0x3a4a66).setDepth(5);

    // "CHARACTER" label strip — 22px tall, well-separated from the bar below
    const stripH = 22;
    this.add.rectangle(bx + bw/2, by + stripH/2, bw, stripH, 0x1c1c38, 1).setDepth(5);
    this.add.text(bx + bw/2, by + stripH/2, 'CHARACTER', {
      fontSize: '13px', fill: '#5566aa', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);

    // HP row: label line then bar below
    const hpPct = p.hp / p.maxHp;
    const hpCol = hpPct > 0.5 ? 0x44cc66 : hpPct > 0.25 ? 0xee8822 : 0xdd2222;
    const barX  = bx + 12, barW = bw - 24, barH = 9;
    const labelY = by + 34, barY = by + 48;

    this.add.text(barX, labelY, '❤️  HP', { fontSize: '14px', fill: '#dd7777' }).setOrigin(0, 0.5).setDepth(6);
    this.add.text(barX + barW, labelY, `${p.hp} / ${p.maxHp}`, {
      fontSize: '14px', fill: '#aabbaa'
    }).setOrigin(1, 0.5).setDepth(6);

    this.add.rectangle(barX + barW/2, barY, barW, barH, 0x1a1a30, 1).setDepth(5);
    this.add.rectangle(barX, barY, barW * hpPct, barH, hpCol, 1).setOrigin(0, 0.5).setDepth(6);

    // Stat grid — two rows × two columns
    const stats = [
      { icon: '⚡', label: 'Speed',   val: String(p.speed),    col: '#88aadd' },
      { icon: '🌱', label: 'Regen',   val: p.regenRate > 0 ? `${p.regenRate}/s` : '—', col: '#88ccaa' },
      { icon: '💫', label: 'XP Pull', val: `${p.xpPickupRadius}px`, col: '#ddbb55' },
      { icon: '🛡️', label: 'Block',   val: p.passiveStats.damageReduction > 0
          ? `${Math.round(p.passiveStats.damageReduction * 100)}%` : '—', col: '#bb99dd' },
    ];
    const col1X = bx + 12, col2X = bx + bw/2 + 10;
    const halfW  = bw/2 - 16;
    stats.forEach(({ icon, label, val, col }, i) => {
      const sx = i % 2 === 0 ? col1X : col2X;
      const sy = by + 62 + Math.floor(i / 2) * 20;
      this.add.text(sx, sy, `${icon} ${label}`, { fontSize: '14px', fill: '#667788' }).setDepth(6);
      this.add.text(sx + halfW, sy, val, { fontSize: '14px', fill: col, fontStyle: 'bold' })
        .setOrigin(1, 0).setDepth(6);
    });

    // ── PASSIVES column ───────────────────────────────────────────────────
    this.sectionHeader(rightX + colW/2, startY, '✦  PASSIVES', '#ffaa44');

    const ownedPassives = PASSIVES.filter(pas => (p.passives[pas.id] || 0) > 0);
    const effectLabel = {
      armor:     () => `Block ${Math.round(p.passiveStats.damageReduction * 100)}% damage`,
      tome:      () => `+${Math.round(p.passiveStats.damageMultiplier * 100)}% weapon damage`,
      pendant:   () => `-${Math.round(p.passiveStats.cooldownReduction * 100)}% attack cooldowns`,
      ring:      () => `+${Math.round(p.passiveStats.xpMultiplier * 100)}% XP from kills`,
      fang:      () => `Heal ${p.passiveStats.killHeal} HP per kill`,
      ironheart: () => `+${p.passiveStats.maxHpBonus} max HP`,
      crystal:   () => `+${p.passiveStats.xpRadius}px XP gem radius`,
      gloves:    () => `Knockback enemies on hit`,
    };

    if (ownedPassives.length === 0) {
      this.add.text(rightX + colW/2, startY + 50, 'No passive items yet.\nPick upgrades to build your loadout.', {
        fontSize: '14px', fill: '#445566', align: 'center', lineSpacing: 6
      }).setOrigin(0.5, 0).setDepth(4);
    } else {
      ownedPassives.forEach((pas, i) => {
        const tier = p.passives[pas.id];
        const cx   = rightX + colW / 2;
        const cy   = startY + 58 + i * (cardH + cardGap);

        this.add.rectangle(cx, cy, cardW, cardH, pas.color, 1).setDepth(4);
        this.add.rectangle(cx, cy, cardW, cardH, 0, 0).setStrokeStyle(1, 0x667799).setDepth(5);

        // Tier pips
        for (let t = 0; t < pas.maxTier; t++) {
          this.add.rectangle(
            cx - cardW/2 + 10 + t * 18 + 8, cy + cardH/2 - 6,
            14, 4, t < tier ? 0xffffff : 0x334455
          ).setDepth(6);
        }

        this.add.text(cx - cardW/2 + 10, cy - 14, `${pas.icon}  ${pas.name}`, {
          fontSize: '17px', fill: '#ffffff', fontStyle: 'bold'
        }).setDepth(6);
        this.add.text(cx - cardW/2 + 10, cy + 6, effectLabel[pas.id] ? effectLabel[pas.id]() : '', {
          fontSize: '13px', fill: '#ddeecc'
        }).setDepth(6);
        this.add.text(cx + cardW/2 - 10, cy - 14, `T${tier} / ${pas.maxTier}`, {
          fontSize: '13px', fill: '#aabbaa'
        }).setOrigin(1, 0).setDepth(6);
      });
    }

    // ── Buttons ───────────────────────────────────────────────────────────
    const btnY = H - 58;
    this.makeButton(W/2 - 130, btnY, 'RESUME',       0x1e3d7a, 0x2d5cb8, () => this.resume(data));
    this.makeButton(W/2 + 130, btnY, 'QUIT TO MENU', 0x5a1515, 0x8a2222, () => {
      this.scene.stop('PauseScene');
      this.scene.stop('GameScene');
      this.scene.start('MainMenuScene');
    });

    this.add.text(W/2, H - 20, 'Press ESC or P to resume', {
      fontSize: '14px', fill: '#445566'
    }).setOrigin(0.5).setDepth(4);

    this.input.keyboard.once('keydown-ESC', () => this.resume(data));
    this.input.keyboard.once('keydown-P',   () => this.resume(data));
  }

  sectionHeader(x, y, label, color) {
    this.add.text(x, y, label, {
      fontSize: '19px', fill: color, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5, 0).setDepth(7);
    this.add.rectangle(x, y + 22, 240, 2, 0x446688, 1).setDepth(7);
  }

  makeButton(x, y, label, color, hoverColor, onClick) {
    const bg = this.add.rectangle(x, y, 220, 50, color, 1).setDepth(4)
      .setInteractive({ useHandCursor: true });
    this.add.rectangle(x, y, 220, 50, 0, 0).setStrokeStyle(2, 0x6688bb).setDepth(5);
    this.add.text(x, y, label, {
      fontSize: '20px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    bg.on('pointerover', () => bg.setFillStyle(hoverColor));
    bg.on('pointerout',  () => bg.setFillStyle(color));
    bg.on('pointerdown', onClick);
    return bg;
  }

  resume(data) {
    this.scene.stop('PauseScene');
    this.scene.resume('GameScene');
  }
}
