class CampfireScene extends Phaser.Scene {
  constructor() { super('CampfireScene'); }

  create(data) {
    const W = this.scale.width, H = this.scale.height;
    const fromMenu = !!(data && data.fromMenu);
    MetaProgress.load();

    // Souls are banked progressively as the player visits camp mid-run.
    // On death, GameScene.bankCurrentSouls() has already credited them —
    // so we just show what was earned total without adding again.
    const earned = fromMenu
      ? 0
      : data.alreadyBanked
        ? (data.soulsEarned || 0)
        : MetaProgress.calcRunSouls(data.kills || 0, data.wave || 1, data.level || 1);
    const soulsBeforeRun = MetaProgress.souls - (data.alreadyBanked ? earned : 0);
    if (!data.alreadyBanked && earned > 0) MetaProgress.addSouls(earned);
    const soulsAfterRun = MetaProgress.souls;

    // ── Background ────────────────────────────────────────────────────────
    this.add.rectangle(W/2, H/2, W, H, 0x080810);

    // ── Left panel ────────────────────────────────────────────────────────
    const fireX = 300, fireY = fromMenu ? 300 : 280;
    this.buildCampfire(fireX, fireY);

    if (fromMenu) {
      // Simple header when accessed from menu
      this.add.text(300, 90, 'CAMPFIRE', {
        fontSize: '48px', fill: '#ff8833', fontStyle: 'bold',
        stroke: '#331100', strokeThickness: 5
      }).setOrigin(0.5);
      this.add.text(300, 148, 'Spend your souls on\npermanent upgrades', {
        fontSize: '16px', fill: '#887755', align: 'center'
      }).setOrigin(0.5);
      // Total souls summary only
      this.add.rectangle(300, 580, 320, 52, 0x1a1a10).setStrokeStyle(1, 0xaa8822);
      this.add.text(300, 580, `💀 ${MetaProgress.souls} souls available`, {
        fontSize: '18px', fill: '#FFD700', fontStyle: 'bold'
      }).setOrigin(0.5);
    } else {
      // YOU DIED header + run stats
      this.add.text(300, 90, 'YOU DIED', {
        fontSize: '52px', fill: '#cc2222', fontStyle: 'bold',
        stroke: '#000', strokeThickness: 5
      }).setOrigin(0.5);

      const elapsed  = data.time || 0;
      const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const secs = (elapsed % 60).toString().padStart(2, '0');
      const improved = data.improved || {};
      const records  = MetaProgress.records;

      [
        ['Wave Reached', data.wave  || 1, 'wave',  records.wave],
        ['Level',        data.level || 1, 'level', records.level],
        ['Kills',        data.kills || 0, 'kills', records.kills],
        ['Time',         `${mins}:${secs}`, 'time', null],
      ].forEach(([label, value, key, best], i) => {
        const y      = 400 + i * 40;
        const isNew  = improved[key];
        const color  = isNew ? '#FFD700' : '#ccccdd';
        this.add.text(160, y, label, { fontSize: '16px', fill: '#666688' }).setOrigin(0, 0.5);
        this.add.text(440, y, String(value), { fontSize: '17px', fill: color, fontStyle: isNew ? 'bold' : 'normal' }).setOrigin(1, 0.5);
        if (isNew) {
          this.add.text(448, y, '★ BEST', { fontSize: '11px', fill: '#FFD700' }).setOrigin(0, 0.5);
        } else if (best !== null && best > 0) {
          this.add.text(448, y, `pb: ${key === 'wave' || key === 'level' || key === 'kills' ? best : ''}`, { fontSize: '10px', fill: '#444455' }).setOrigin(0, 0.5);
        }
      });

      const banner = this.add.rectangle(300, 600, 320, 60, 0x1a1a10).setStrokeStyle(2, 0xcc9922);
      this.add.text(300, 584, 'SOULS EARNED THIS RUN', { fontSize: '12px', fill: '#886633' }).setOrigin(0.5);
      const earnedText = this.add.text(300, 610, `+${earned} souls`, {
        fontSize: '26px', fill: '#FFD700', fontStyle: 'bold',
        stroke: '#442200', strokeThickness: 3
      }).setOrigin(0.5).setAlpha(0);

      // Pop in after a short delay
      this.time.delayedCall(400, () => {
        this.tweens.add({
          targets: earnedText,
          alpha: 1, scaleX: { from: 0.5, to: 1 }, scaleY: { from: 0.5, to: 1 },
          duration: 300, ease: 'Back.easeOut'
        });
      });

      // Score submission prompt
      this.time.delayedCall(800, () => this._showScoreSubmit(data));
    }

    // Divider
    this.add.rectangle(560, H/2, 2, H - 80, 0x223344);

    // ── Right panel: upgrade shop ─────────────────────────────────────────
    this.add.text(870, 48, 'CAMPFIRE UPGRADES', {
      fontSize: '22px', fill: '#FFD700', fontStyle: 'bold',
      stroke: '#442200', strokeThickness: 3
    }).setOrigin(0.5);

    this.soulsText = this.add.text(870, 76, `💀 ${fromMenu ? MetaProgress.souls : soulsBeforeRun} souls`, {
      fontSize: '16px', fill: '#FFD700'
    }).setOrigin(0.5);

    this.gridContainer = this.add.container(0, 0);
    this.buildUpgradeGrid(600, 105, W - 20);

    // Animate soul counter counting up to new total after a short delay
    if (earned > 0) {
      this.time.delayedCall(800, () => {
        let current = soulsBeforeRun;
        const target = soulsAfterRun;
        const steps = Math.min(earned, 60);
        const increment = Math.ceil(earned / steps);
        const timer = this.time.addEvent({
          delay: 30,
          repeat: steps - 1,
          callback: () => {
            current = Math.min(current + increment, target);
            this.soulsText.setText(`💀 ${current} souls`);
            if (current >= target) timer.remove();
          }
        });
      });
    }

    // ── Run Again button ──────────────────────────────────────────────────
    const btnLabel = fromMenu ? 'START RUN →' : 'RUN AGAIN →';
    const btn = this.add.rectangle(300, H - 52, 300, 46, 0x1a3a1a)
      .setStrokeStyle(2, 0x44aa44)
      .setInteractive({ useHandCursor: true });
    const btnText = this.add.text(300, H - 52, btnLabel, {
      fontSize: '19px', fill: '#44ff66', fontStyle: 'bold'
    }).setOrigin(0.5);

    btn.on('pointerover', () => { btn.setFillStyle(0x2a5a2a); });
    btn.on('pointerout',  () => { btn.setFillStyle(0x1a3a1a); });
    btn.on('pointerdown', () => {
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.time.delayedCall(200, () => this.scene.start('CharacterSelectScene'));
    });

    SoundManager.play('campfire_open');
    MusicManager.play('campfire');
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  // ── Animated campfire ──────────────────────────────────────────────────
  buildCampfire(cx, cy) {
    // Logs (drawn at absolute scene coords — no tweening, so fine as-is)
    const g = this.add.graphics();
    g.fillStyle(0x5a3010, 1);
    g.fillRect(cx - 36, cy + 28, 72, 10);
    g.fillRect(cx - 28, cy + 20, 56, 10);

    // Flame layers — animated arcs
    const flames = [
      { color: 0xff2200, r: 28, dy: -30, alpha: 0.9 },
      { color: 0xff6600, r: 20, dy: -20, alpha: 0.85 },
      { color: 0xffaa00, r: 13, dy: -12, alpha: 0.9 },
      { color: 0xffee44, r: 6,  dy: -5,  alpha: 1.0 },
    ];
    flames.forEach(({ color, r, dy, alpha }) => {
      // Position Graphics at fire center, draw ellipse at local origin (0,0)
      const flame = this.add.graphics();
      flame.setPosition(cx, cy + dy);
      flame.fillStyle(color, alpha);
      flame.fillEllipse(0, 0, r * 2, r * 2.8);

      // Wobble around the current position using relative offset
      this.tweens.add({
        targets: flame,
        scaleX: { from: 0.88, to: 1.12 },
        scaleY: { from: 0.92, to: 1.08 },
        x: cx - 3,                      // tween TO cx-3 …
        duration: 280 + Math.random() * 180,
        yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 200,
        onStart: (tween, targets) => {
          // Lock start x to the correct center so yoyo oscillates ±3
          targets[0].x = cx + 3;
        }
      });
    });

    // Glow
    const glow = this.add.graphics();
    glow.fillStyle(0xff6600, 0.08);
    glow.fillCircle(cx, cy, 90);
    this.tweens.add({
      targets: glow, alpha: { from: 0.5, to: 1.0 },
      duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // Embers: small circles that float up and fade
    this.time.addEvent({
      delay: 300, loop: true,
      callback: () => {
        const ex = cx + Phaser.Math.Between(-20, 20);
        const ember = this.add.circle(ex, cy + 10, Phaser.Math.Between(1, 3), 0xffaa22, 1);
        this.tweens.add({
          targets: ember,
          y: cy - 80 - Math.random() * 60,
          x: ex + Phaser.Math.Between(-30, 30),
          alpha: 0,
          scaleX: 0, scaleY: 0,
          duration: 900 + Math.random() * 600,
          ease: 'Quad.easeOut',
          onComplete: () => ember.destroy()
        });
      }
    });
  }

  // ── Upgrade grid ───────────────────────────────────────────────────────
  buildUpgradeGrid(x, y, maxX) {
    this.gridContainer.removeAll(true);

    const colW = (maxX - x - 20) / 2;
    const rowH = 104;
    const pad  = 6;
    const add  = (obj) => { this.gridContainer.add(obj); return obj; };

    // Ascension level banner at top
    const asc = MetaProgress.ascensionLevel;
    if (asc > 0) {
      add(this.add.rectangle(x + (colW * 2 + pad) / 2, y - 18, colW * 2 + pad, 28, 0x2a1a3a)
        .setStrokeStyle(1, 0x8844cc));
      add(this.add.text(x + (colW * 2 + pad) / 2, y - 18,
        `✦ Ascension Lv ${asc}  ·  +${asc * 3}% dmg  ·  +${asc * 3}% HP  ·  +${asc * 2} speed`,
        { fontSize: '11px', fill: '#cc88ff' }
      ).setOrigin(0.5));
    }

    MetaProgress.UPGRADES.forEach((upg, i) => {
      const col  = i % 2;
      const row  = Math.floor(i / 2);
      const cx   = x + col * (colW + pad) + colW / 2;
      const cy   = y + 8 + row * (rowH + pad) + rowH / 2;
      const tier = MetaProgress.getTier(upg.id);
      const max  = upg.tiers.length;
      const isMaxed  = tier >= max;
      const canBuy   = MetaProgress.canPurchaseNext(upg.id);

      const bgColor = isMaxed ? 0x0f1f0f : tier > 0 ? 0x0f1525 : 0x0e0e18;
      const border  = isMaxed ? 0x336633 : tier > 0 ? 0x4488cc : canBuy ? 0x335577 : 0x222233;

      add(this.add.rectangle(cx, cy, colW, rowH - 2, bgColor).setStrokeStyle(1, border));

      // Owned accent bar on left edge
      if (tier > 0 && !isMaxed) {
        add(this.add.rectangle(cx - colW/2 + 3, cy, 5, rowH - 6, 0x4488cc, 1));
      }

      // Name + icon
      const nameColor = isMaxed ? '#44cc44' : tier > 0 ? '#ddeeff' : '#778899';
      add(this.add.text(cx - colW/2 + 10, cy - 32, `${upg.icon}  ${upg.name}`, {
        fontSize: '17px', fill: nameColor, fontStyle: 'bold'
      }).setOrigin(0, 0.5));

      // Tier pip dots  ●●○
      const pipStartX = cx + colW/2 - 14 - max * 18;
      for (let t = 0; t < max; t++) {
        const pipX = pipStartX + t * 18;
        const filled = t < tier;
        add(this.add.circle(pipX, cy - 32, 7, filled ? 0x44aaff : 0x223344, 1));
      }

      // Current / next effect description
      if (isMaxed) {
        add(this.add.text(cx - colW/2 + 10, cy - 5, upg.tiers[max - 1].desc, {
          fontSize: '14px', fill: '#336633'
        }).setOrigin(0, 0.5));
        add(this.add.text(cx + colW/2 - 10, cy + 22, '✓ MAX', {
          fontSize: '15px', fill: '#44cc44', fontStyle: 'bold'
        }).setOrigin(1, 0.5));
      } else {
        const prevDesc = tier > 0 ? upg.tiers[tier - 1].desc : null;
        if (prevDesc) {
          add(this.add.text(cx - colW/2 + 10, cy - 8, prevDesc, {
            fontSize: '12px', fill: '#445544'
          }).setOrigin(0, 0.5));
        }
        const nextDesc = MetaProgress.nextTierDesc(upg.id);
        const nextCost = MetaProgress.nextTierCost(upg.id);
        add(this.add.text(cx - colW/2 + 10, cy + (prevDesc ? 12 : 2), `→ ${nextDesc}`, {
          fontSize: '14px', fill: canBuy ? '#aaccff' : '#445566'
        }).setOrigin(0, 0.5));

        // Buy button
        const btnColor  = canBuy ? 0x1a3a5a : 0x0e0e18;
        const btnBorder = canBuy ? 0x4488cc : 0x223344;
        const buyBtn = add(this.add.rectangle(cx + colW/2 - 48, cy + 30, 90, 30, btnColor)
          .setStrokeStyle(1, btnBorder));
        add(this.add.text(cx + colW/2 - 48, cy + 30, `${nextCost} 💀`, {
          fontSize: '14px', fill: canBuy ? '#88ccff' : '#334455'
        }).setOrigin(0.5));

        if (canBuy) {
          buyBtn.setInteractive({ useHandCursor: true });
          buyBtn.on('pointerover', () => buyBtn.setFillStyle(0x2a5a8a));
          buyBtn.on('pointerout',  () => buyBtn.setFillStyle(btnColor));
          buyBtn.on('pointerdown', () => {
            if (MetaProgress.purchaseNext(upg.id)) {
              SoundManager.play('upgrade_buy');
              this.soulsText.setText(`💀 ${MetaProgress.souls} souls`);
              this.buildUpgradeGrid(x, y, maxX);
            }
          });
        }
      }
    });

    // ── Ascension button (below grid) ──────────────────────────────────────
    const rows    = Math.ceil(MetaProgress.UPGRADES.length / 2);
    const ascY    = y + 8 + rows * (rowH + pad) + 18;
    const fullW   = colW * 2 + pad;
    const ascCx   = x + fullW / 2;
    const allMax  = MetaProgress.allMaxed();
    const canAsc  = MetaProgress.canAscend();
    const ascCost = MetaProgress.ascensionCost;
    const nextAsc = MetaProgress.ascensionLevel + 1;

    const ascBg = add(this.add.rectangle(ascCx, ascY, fullW, 46,
      allMax ? (canAsc ? 0x2a0a3a : 0x1a0a2a) : 0x0e0e18
    ).setStrokeStyle(2, allMax ? (canAsc ? 0xaa44ff : 0x553388) : 0x222233));

    if (allMax) {
      add(this.add.text(ascCx, ascY - 8,
        canAsc
          ? `⬆  ASCEND  (${ascCost} 💀)  →  Lv ${nextAsc}: +${nextAsc * 3}% dmg/HP, +${nextAsc * 2} spd`
          : `⬆  ASCEND  —  ${ascCost} 💀 needed  (need ${ascCost - MetaProgress.souls} more)`,
        { fontSize: '13px', fill: canAsc ? '#dd88ff' : '#664488', fontStyle: canAsc ? 'bold' : 'normal' }
      ).setOrigin(0.5));
      add(this.add.text(ascCx, ascY + 10,
        'Resets all tiers · Grants permanent bonus · Reopens the tree',
        { fontSize: '10px', fill: allMax ? '#664466' : '#333344' }
      ).setOrigin(0.5));

      if (canAsc) {
        ascBg.setInteractive({ useHandCursor: true });
        ascBg.on('pointerover', () => ascBg.setFillStyle(0x3a1050));
        ascBg.on('pointerout',  () => ascBg.setFillStyle(0x2a0a3a));
        ascBg.on('pointerdown', () => {
          if (MetaProgress.ascend()) {
            SoundManager.play('level_up');
            this.soulsText.setText(`💀 ${MetaProgress.souls} souls`);
            this.buildUpgradeGrid(x, y, maxX);
          }
        });
      }
    } else {
      const remaining = MetaProgress.UPGRADES.filter(u =>
        MetaProgress.getTier(u.id) < u.tiers.length
      ).length;
      add(this.add.text(ascCx, ascY,
        `⬆  ASCEND  —  max all ${remaining} remaining upgrade${remaining !== 1 ? 's' : ''} to unlock`,
        { fontSize: '12px', fill: '#333344' }
      ).setOrigin(0.5));
    }
  }

  _showScoreSubmit(data) {
    const storedName = localStorage.getItem('reaping_player_name') || '';

    window._inputOverlayOpen = true;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.78);display:flex;align-items:center;justify-content:center;z-index:9999;font-family:monospace';

    const box = document.createElement('div');
    box.style.cssText = 'background:#0c0c1e;border:2px solid #5577aa;padding:32px;text-align:center;min-width:300px;border-radius:4px';

    const title = document.createElement('p');
    title.textContent = '📋 SUBMIT SCORE';
    title.style.cssText = 'color:#FFD700;font-size:18px;font-weight:bold;margin:0 0 8px';

    const sub = document.createElement('p');
    sub.textContent = `Wave ${data.wave}  ·  ${data.kills} kills  ·  Lv ${data.level}`;
    sub.style.cssText = 'color:#667788;font-size:13px;margin:0 0 18px';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Your name';
    input.maxLength = 20;
    input.value = storedName;
    input.style.cssText = 'width:200px;padding:10px;background:#1a1a2e;border:1px solid #4488cc;color:#fff;font-size:15px;text-align:center;border-radius:3px;outline:none;display:block;margin:0 auto 18px;box-sizing:border-box';
    window.mobileInput(input);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center';

    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Submit';
    submitBtn.style.cssText = 'padding:10px 24px;background:#1e3d7a;border:1px solid #4488cc;color:#fff;font-size:14px;cursor:pointer;border-radius:3px';

    const skipBtn = document.createElement('button');
    skipBtn.textContent = 'Skip';
    skipBtn.style.cssText = 'padding:10px 24px;background:#1a1a2e;border:1px solid #445566;color:#888;font-size:14px;cursor:pointer;border-radius:3px';

    btnRow.appendChild(submitBtn);
    btnRow.appendChild(skipBtn);
    box.appendChild(title);
    box.appendChild(sub);
    box.appendChild(input);
    box.appendChild(btnRow);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    setTimeout(() => input.focus(), 100);

    const dismiss = () => { window._inputOverlayOpen = false; overlay.remove(); };

    const submit = async () => {
      const name = input.value.trim();
      if (!name) { input.focus(); return; }
      localStorage.setItem('reaping_player_name', name);
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;
      try {
        await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            character: data.charType || 'knight',
            wave:  data.wave  || 1,
            kills: data.kills || 0,
            level: data.level || 1,
            time:  data.time  || 0
          })
        });
      } catch(e) {}
      dismiss();
    };

    submitBtn.addEventListener('click', submit);
    skipBtn.addEventListener('click', dismiss);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  }
}
