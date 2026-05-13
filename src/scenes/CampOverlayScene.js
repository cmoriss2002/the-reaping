// Campfire overlay — opens mid-run so the player can spend accumulated souls
// without dying. Launched over GameScene (which stays paused), closed to resume.
class CampOverlayScene extends Phaser.Scene {
  constructor() { super('CampOverlayScene'); }

  create(data) {
    const W = this.scale.width, H = this.scale.height;
    MetaProgress.load();

    // ── Backdrop ──────────────────────────────────────────────────────────
    this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.72);

    // ── Campfire visual (left) ────────────────────────────────────────────
    this.buildCampfire(200, 200);

    this.add.text(200, 58, '🔥  CAMPFIRE', {
      fontSize: '34px', fill: '#ff9933', fontStyle: 'bold',
      stroke: '#331100', strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(200, 98, 'Spend souls — game is paused', {
      fontSize: '14px', fill: '#886644'
    }).setOrigin(0.5);

    // Soul count
    this.soulsText = this.add.text(200, 340, `💀 ${MetaProgress.souls} souls`, {
      fontSize: '22px', fill: '#FFD700', fontStyle: 'bold'
    }).setOrigin(0.5);

    // ── Divider ───────────────────────────────────────────────────────────
    this.add.rectangle(400, H/2, 2, H - 80, 0x2a2a44);

    // ── Upgrade grid (right panel) ────────────────────────────────────────
    this.add.text(W/2 + 120, 38, 'UPGRADES', {
      fontSize: '18px', fill: '#cc9922', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.gridContainer = this.add.container(0, 0);
    this.buildGrid(410, 64, W - 10);


    // ── Close / resume button ─────────────────────────────────────────────
    const btn = this.add.rectangle(200, H - 52, 260, 46, 0x1a2244)
      .setStrokeStyle(2, 0x4466cc)
      .setInteractive({ useHandCursor: true });
    this.add.text(200, H - 52, 'RESUME  (C / ESC)', {
      fontSize: '18px', fill: '#88aaff', fontStyle: 'bold'
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setFillStyle(0x2a3466));
    btn.on('pointerout',  () => btn.setFillStyle(0x1a2244));
    btn.on('pointerdown', () => this.close(data));

    this.input.keyboard.once('keydown-C',   () => this.close(data));
    this.input.keyboard.once('keydown-ESC', () => this.close(data));

    this.cameras.main.fadeIn(150, 0, 0, 0);
  }

  close(data) {
    this.scene.stop('CampOverlayScene');
    this.scene.resume('GameScene');
  }

  buildGrid(x, y, maxX) {
    this.gridContainer.removeAll(true);
    const colW = (maxX - x - 10) / 2;
    const rowH = 98;
    const pad  = 6;
    const add  = (obj) => { this.gridContainer.add(obj); return obj; };

    MetaProgress.UPGRADES.forEach((upg, i) => {
      const col    = i % 2;
      const row    = Math.floor(i / 2);
      const cx     = x + col * (colW + pad) + colW / 2;
      const cy     = y + row * (rowH + pad) + rowH / 2;
      const tier   = MetaProgress.getTier(upg.id);
      const max    = upg.tiers.length;
      const isMax  = tier >= max;
      const canBuy = MetaProgress.canPurchaseNext(upg.id);

      const bgCol = isMax ? 0x0f1f0f : tier > 0 ? 0x0f1525 : 0x0e0e18;
      const border = isMax ? 0x336633 : tier > 0 ? 0x4488cc : canBuy ? 0x335577 : 0x222233;

      add(this.add.rectangle(cx, cy, colW, rowH - 2, bgCol).setStrokeStyle(1, border));

      // Owned accent bar on left edge
      if (tier > 0 && !isMax) {
        add(this.add.rectangle(cx - colW/2 + 3, cy, 4, rowH - 6, 0x4488cc, 1));
      }

      // Name + tier pips
      const nameColor = isMax ? '#44cc44' : tier > 0 ? '#ddeeff' : '#778899';
      add(this.add.text(cx - colW/2 + 10, cy - 28, `${upg.icon}  ${upg.name}`, {
        fontSize: '16px', fill: nameColor, fontStyle: 'bold'
      }).setOrigin(0, 0.5));

      for (let t = 0; t < max; t++) {
        add(this.add.circle(cx + colW/2 - 18 - (max - 1 - t) * 16, cy - 28, 6, t < tier ? 0x44aaff : 0x223344));
      }

      if (isMax) {
        add(this.add.text(cx - colW/2 + 10, cy - 4, upg.tiers[max - 1].desc, { fontSize: '14px', fill: '#336633' }).setOrigin(0, 0.5));
        add(this.add.text(cx + colW/2 - 10, cy + 24, '✓ MAX', { fontSize: '14px', fill: '#44cc44', fontStyle: 'bold' }).setOrigin(1, 0.5));
      } else {
        const nextDesc = MetaProgress.nextTierDesc(upg.id);
        const nextCost = MetaProgress.nextTierCost(upg.id);
        add(this.add.text(cx - colW/2 + 10, cy - 4, `→ ${nextDesc}`, {
          fontSize: '14px', fill: canBuy ? '#aaccff' : '#445566'
        }).setOrigin(0, 0.5));

        const buyBtn = add(this.add.rectangle(cx + colW/2 - 44, cy + 26, 84, 28, canBuy ? 0x1a3a5a : 0x0e0e18).setStrokeStyle(1, canBuy ? 0x4488cc : 0x223344));
        add(this.add.text(cx + colW/2 - 44, cy + 26, `💀 ${nextCost}`, {
          fontSize: '14px', fill: canBuy ? '#88ccff' : '#334455'
        }).setOrigin(0.5));

        if (canBuy) {
          buyBtn.setInteractive({ useHandCursor: true });
          buyBtn.on('pointerover', () => buyBtn.setFillStyle(0x2a5a8a));
          buyBtn.on('pointerout',  () => buyBtn.setFillStyle(0x1a3a5a));
          buyBtn.on('pointerdown', () => {
            const tierBefore = MetaProgress.getTier(upg.id);
            if (MetaProgress.purchaseNext(upg.id)) {
              SoundManager.play('upgrade_buy');
              this.soulsText.setText(`💀 ${MetaProgress.souls} souls`);
              const gs = this.scene.get('GameScene');
              if (gs && gs.player) upg.tiers[tierBefore].apply(gs.player);
              this.buildGrid(x, y, maxX);
            }
          });
        }

        // Shield restore row — only shown inside the shield card when charges are depleted
        if (upg.id === 'shield') {
          const gs  = this.scene.get('GameScene');
          const p   = gs && gs.player;
          if (p && p.hasShield && p.shieldDurability < p.shieldMax) {
            const restoreCost   = 25;
            const canRestore    = MetaProgress.souls >= restoreCost;
            const restoreLabel  = `🔵 Restore shield — 💀 ${restoreCost}`;
            const rBtn = add(this.add.rectangle(cx - colW/2 + 8 + (colW - 16)/2, cy + 26, colW - 16, 26,
              canRestore ? 0x112244 : 0x0e0e14).setStrokeStyle(1, canRestore ? 0x4466cc : 0x222233));
            add(this.add.text(cx - colW/2 + 8 + (colW - 16)/2, cy + 26, restoreLabel, {
              fontSize: '14px', fill: canRestore ? '#88aaff' : '#334455'
            }).setOrigin(0.5));
            if (canRestore) {
              rBtn.setInteractive({ useHandCursor: true });
              rBtn.on('pointerover', () => rBtn.setFillStyle(0x1a3a66));
              rBtn.on('pointerout',  () => rBtn.setFillStyle(0x112244));
              rBtn.on('pointerdown', () => {
                if (MetaProgress.souls >= restoreCost) {
                  MetaProgress._data.souls -= restoreCost;
                  MetaProgress.save();
                  p.shieldDurability = p.shieldMax;
                  SoundManager.play('upgrade_buy');
                  this.soulsText.setText(`💀 ${MetaProgress.souls} souls`);
                  this.buildGrid(x, y, maxX);
                }
              });
            }
          }
        }
      }
    });
  }

  buildCampfire(cx, cy) {
    const g = this.add.graphics();
    g.fillStyle(0x5a3010, 1);
    g.fillRect(cx - 34, cy + 28, 68, 10);
    g.fillRect(cx - 26, cy + 20, 52, 10);

    const flames = [
      { color: 0xff2200, r: 26, dy: -28 },
      { color: 0xff6600, r: 18, dy: -18 },
      { color: 0xffaa00, r: 11, dy: -10 },
      { color: 0xffee44, r:  5, dy:  -4 },
    ];
    flames.forEach(({ color, r, dy }) => {
      const flame = this.add.graphics();
      flame.setPosition(cx, cy + dy);
      flame.fillStyle(color, 0.9);
      flame.fillEllipse(0, 0, r * 2, r * 2.8);
      this.tweens.add({
        targets: flame,
        scaleX: { from: 0.88, to: 1.12 },
        scaleY: { from: 0.92, to: 1.08 },
        x: cx - 3,
        duration: 200 + Math.random() * 160,
        yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 200,
        onStart: (tw, targets) => { targets[0].x = cx + 3; }
      });
    });

    const glow = this.add.graphics();
    glow.setPosition(cx, cy);
    glow.fillStyle(0xff6600, 0.07);
    glow.fillCircle(0, 0, 80);
    this.tweens.add({ targets: glow, alpha: { from: 0.5, to: 1 }, duration: 700, yoyo: true, repeat: -1 });

    // Ember particles
    this.time.addEvent({
      delay: 350, loop: true,
      callback: () => {
        const ex = cx + Phaser.Math.Between(-18, 18);
        const ember = this.add.circle(ex, cy + 8, Phaser.Math.Between(1, 3), 0xffaa22);
        this.tweens.add({
          targets: ember,
          y: cy - 60 - Math.random() * 50,
          x: ex + Phaser.Math.Between(-24, 24),
          alpha: 0, scaleX: 0, scaleY: 0,
          duration: 800 + Math.random() * 500,
          ease: 'Quad.easeOut',
          onComplete: () => ember.destroy()
        });
      }
    });
  }
}
