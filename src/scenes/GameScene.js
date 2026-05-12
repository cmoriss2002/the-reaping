const WORLD_W = 3200;
const WORLD_H = 3200;

class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create(data) {
    const charType = (data && data.charType) || 'knight';

    // ── World & physics ───────────────────────────────────────────────────
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

    // Base background fill
    this.add.rectangle(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x0d0d1a);

    // Subtle grid overlay
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x15152a, 1);
    for (let x = 0; x <= WORLD_W; x += 80) grid.lineBetween(x, 0, x, WORLD_H);
    for (let y = 0; y <= WORLD_H; y += 80) grid.lineBetween(0, y, WORLD_W, y);

    // World objects, ground zones, altar — returns obstacle sprites
    const obstacleSprites = WorldGenerator.generate(this);

    // Make rocks and pillars into static physics obstacles
    this.obstacles = this.physics.add.staticGroup();
    obstacleSprites.forEach(spr => {
      this.physics.add.existing(spr, true); // true = static body
      const body = spr.body;
      // Tighter hitbox than the full sprite
      const hw = spr.displayWidth  * 0.45;
      const hh = spr.displayHeight * 0.35;
      body.setSize(hw, hh);
      body.setOffset(
        (spr.displayWidth  - hw) / 2,
        spr.displayHeight  - hh - 4
      );
      body.reset(spr.x, spr.y);
      this.obstacles.add(spr);
    });

    // World border
    const border = this.add.graphics();
    border.lineStyle(6, 0x223355, 1);
    border.strokeRect(2, 2, WORLD_W - 4, WORLD_H - 4);

    // ── Groups & entities ─────────────────────────────────────────────────
    this.enemies          = this.physics.add.group();
    this.projectiles      = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();
    this.xpGems           = [];
    this.healthDrops      = [];

    this.player = new Player(this, WORLD_W / 2, WORLD_H / 2, charType);

    // Apply persistent meta-progression bonuses
    MetaProgress.load();
    MetaProgress.applyBonuses(this.player);

    // Shield ring visual (follows player)
    this.shieldRing = this.add.graphics().setDepth(490);

    // ── Camera ───────────────────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // ── Systems ───────────────────────────────────────────────────────────
    this.juice          = new JuiceManager(this);
    this.combatSystem   = new CombatSystem(this);
    this.waveManager    = new WaveManager(this);
    this.upgradeManager = new UpgradeManager();
    this.combatSystem.setup();

    // Obstacle colliders
    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.collider(this.enemies, this.obstacles);

    // Enemy projectiles hit player.
    // NOTE: Phaser calls overlap(group, sprite) callbacks as (sprite, groupMember),
    // so the first arg is the player and the second is the projectile.
    this.physics.add.overlap(this.enemyProjectiles, this.player, (playerSprite, proj) => {
      if (!proj.active || !playerSprite.active) return;
      proj.setActive(false);
      if (proj.body) proj.body.enable = false;
      const dmg = proj.damage;
      const px = proj.x, py = proj.y;
      proj.destroy();
      playerSprite.takeDamage(dmg);
      this.juice.hitSpark(px, py, 0xff4444);
    });

    // ── Stats ─────────────────────────────────────────────────────────────
    this.stats = { kills: 0, startTime: Date.now() };
    this.soulsBanked = 0; // souls already credited to MetaProgress this run

    // Kill streak (text created after W/H are declared below)
    this.streak      = 0;
    this.streakTimer = null;

    // ── HUD ──────────────────────────────────────────────────────────────────
    const W = this.scale.width, H = this.scale.height;
    const D = 500; // depth shorthand

    // Top-left: HP row  (label · inline bar · numbers)
    this.add.text(20, 16, 'HP', { fontSize: '15px', fill: '#ff6666', fontStyle: 'bold' }).setScrollFactor(0).setDepth(D);
    this.hudBars   = this.add.graphics().setScrollFactor(0).setDepth(D);   // redrawn each frame
    this.hudHpNums = this.add.text(152, 16, '', { fontSize: '14px', fill: '#ffaaaa' }).setScrollFactor(0).setDepth(D);

    // Top-left: XP row
    this.hudLvText = this.add.text(20, 38, '', { fontSize: '14px', fill: '#44ffaa', fontStyle: 'bold' }).setScrollFactor(0).setDepth(D);
    this.hudXpNums = this.add.text(152, 38, '', { fontSize: '13px', fill: '#88ddbb' }).setScrollFactor(0).setDepth(D);

    // Dash label + cooldown bar
    this.add.text(20, 59, 'DASH', { fontSize: '10px', fill: '#4466aa' }).setScrollFactor(0).setDepth(D);

    // Top-centre / right
    this.hudWave     = this.add.text(W/2, 16, '', { fontSize: '20px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(D);
    this.hudEnemies  = this.add.text(W/2, 40, '', { fontSize: '12px', fill: '#556677' }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(D);
    this.hudKills  = this.add.text(W-20, 16, '', { fontSize: '16px', fill: '#aaaaaa' }).setOrigin(1, 0).setScrollFactor(0).setDepth(D);
    this.hudTime   = this.add.text(W-20, 38, '', { fontSize: '14px', fill: '#666688' }).setOrigin(1, 0).setScrollFactor(0).setDepth(D);
    this.hudSouls  = this.add.text(W-20, 58, '', { fontSize: '14px', fill: '#cc9922' }).setOrigin(1, 0).setScrollFactor(0).setDepth(D);

    // Character badge + camp button
    const charColors = { knight: '#5588ff', mage: '#cc66ff', rogue: '#44ffaa' };
    this.add.text(W-20, 78, charType.toUpperCase(), { fontSize: '13px', fill: charColors[charType] || '#fff' }).setOrigin(1, 0).setScrollFactor(0).setDepth(D);
    const makeTouchBtn = (x, y, label, color, hoverColor, onClick) => {
      const bg = this.add.rectangle(x, y, 80, 32, 0x111111, 0.7).setOrigin(1, 0).setScrollFactor(0).setDepth(D).setStrokeStyle(1, color).setInteractive({ useHandCursor: true });
      const txt = this.add.text(x - 40, y + 16, label, { fontSize: '13px', fill: '#' + color.toString(16).padStart(6, '0') }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(D);
      bg.on('pointerover',  () => { bg.setFillStyle(0x222222, 0.9); txt.setStyle({ fill: '#' + hoverColor.toString(16).padStart(6, '0') }); });
      bg.on('pointerout',   () => { bg.setFillStyle(0x111111, 0.7); txt.setStyle({ fill: '#' + color.toString(16).padStart(6, '0') }); });
      bg.on('pointerdown',  onClick);
      return bg;
    };
    makeTouchBtn(W - 8, 82, '🔥 Camp', 0x886633, 0xffaa44, () => { this.bankCurrentSouls(); this.scene.pause('GameScene'); this.scene.launch('CampOverlayScene', { gameScene: this }); });
    makeTouchBtn(W - 8, 118, '⏸ Pause', 0x556688, 0x88aaff, () => { this.scene.pause('GameScene'); this.scene.launch('PauseScene', { gameScene: this }); });

    // Passive item row — bottom-left, well clear of any bars
    this.passiveRow   = this.add.graphics().setScrollFactor(0).setDepth(D);
    this.passiveTexts = [];

    // Weapon bar — bottom-centre
    this.weaponBar   = this.add.graphics().setScrollFactor(0).setDepth(D);
    this.weaponTexts = [];

    // Boss health bar (hidden by default)
    this.bossBarGroup = this.add.group();
    this.currentBoss  = null;

    // Minimap — bottom-right corner
    const mmSize = 110, mmPad = 12;
    this.mmX    = W - mmSize - mmPad;
    this.mmY    = H - mmSize - mmPad;
    this.mmSize = mmSize;
    const minimapBg = this.add.graphics().setScrollFactor(0).setDepth(D - 1);
    minimapBg.fillStyle(0x000000, 0.50);
    minimapBg.fillRect(this.mmX, this.mmY, mmSize, mmSize);
    minimapBg.lineStyle(1, 0x334466, 1);
    minimapBg.strokeRect(this.mmX, this.mmY, mmSize, mmSize);
    this.add.text(this.mmX + mmSize / 2, this.mmY - 10, 'MAP', {
      fontSize: '9px', fill: '#334455'
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(D - 1);
    this.minimapDots = this.add.graphics().setScrollFactor(0).setDepth(D);

    // Wave announcement
    this.waveAnnounce = this.add.text(W/2, H/2 - 60, '', {
      fontSize: '56px', fill: '#FFD700', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5).setScrollFactor(0).setDepth(500).setAlpha(0);

    // countdownText alias — WaveManager writes here between waves
    this.countdownText = this.hudEnemies;

    // Kill streak display — above the weapon bar
    this.streakText = this.add.text(W/2, H - 65, '', {
      fontSize: '20px', fill: '#ffaa22', fontStyle: 'bold',
      stroke: '#442200', strokeThickness: 3
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(500).setAlpha(0);

    // Pause keys
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.pKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    // Camp key — open upgrade shop mid-run
    this.campKey  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);

    // Events
    this.events.on('player-levelup', () => this.onLevelUp());
    this.events.on('player-dead',    () => this.endRun());

    MusicManager.play('game');

    // Show mission briefing for brand-new players only
    MetaProgress.load();
    if (MetaProgress.lifetimeSouls === 0 && MetaProgress.records.wave === 0) {
      this.showMissionBriefing(() => this.waveManager.startWave());
    } else {
      this.waveManager.startWave();
    }
  }

  showMissionBriefing(onDone) {
    const W = this.scale.width, H = this.scale.height;
    const slides = [
      {
        title: '⚔  YOUR MISSION',
        body:  'The Reaping has begun.\nWaves of undead are rising from the graveyard.\nSurvive as long as you can.',
        hint:  'Click or press any key to continue'
      },
      {
        title: '🎮  COMBAT',
        body:  'WASD to move  ·  Space to dash\nYour weapons fire automatically at the nearest enemy\nKill enemies to earn XP and level up',
        hint:  'Click or press any key to continue'
      },
      {
        title: '💀  SOULS & POWER',
        body:  'Every kill earns Souls — your permanent currency\nLevel up mid-run to pick upgrades\nSpend Souls at the Campfire between runs for lasting power',
        hint:  'Click to begin'
      }
    ];

    let current = 0;
    const overlay = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.88).setScrollFactor(0).setDepth(800);

    const titleTxt = this.add.text(W/2, H/2 - 90, '', {
      fontSize: '28px', fill: '#FFD700', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(801);

    const bodyTxt = this.add.text(W/2, H/2, '', {
      fontSize: '20px', fill: '#aabbcc', align: 'center', lineSpacing: 10
    }).setOrigin(0.5).setScrollFactor(0).setDepth(801);

    const hintTxt = this.add.text(W/2, H/2 + 120, '', {
      fontSize: '14px', fill: '#556677'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(801);

    const pipGroup = [];

    const show = (idx) => {
      const s = slides[idx];
      titleTxt.setText(s.title);
      bodyTxt.setText(s.body);
      hintTxt.setText(s.hint);

      // Pip indicators
      pipGroup.forEach(p => p.destroy());
      pipGroup.length = 0;
      for (let i = 0; i < slides.length; i++) {
        const pip = this.add.circle(W/2 - (slides.length - 1) * 10 + i * 20, H/2 + 90, 5,
          i === idx ? 0xffd700 : 0x334455).setScrollFactor(0).setDepth(801);
        pipGroup.push(pip);
      }
    };

    show(0);

    const advance = () => {
      current++;
      if (current >= slides.length) {
        [overlay, titleTxt, bodyTxt, hintTxt, ...pipGroup].forEach(o => o.destroy());
        this.input.off('pointerdown', advance);
        onDone();
      } else {
        show(current);
      }
    };

    this.input.on('pointerdown', advance);
    this.input.keyboard.on('keydown', (e) => {
      if (['SPACE','ENTER','ESCAPE','W','A','S','D','ARROWUP','ARROWDOWN','ARROWLEFT','ARROWRIGHT'].some(k => e.key.toUpperCase() === k)) return;
      advance();
    });
  }

  update(time, delta) {
    if (!this.player.active) return;
    this._time = time;

    if (Phaser.Input.Keyboard.JustDown(this.pauseKey) ||
        Phaser.Input.Keyboard.JustDown(this.pKey)) {
      this.scene.pause('GameScene');
      this.scene.launch('PauseScene', { gameScene: this });
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.campKey)) {
      this.bankCurrentSouls();
      this.scene.pause('GameScene');
      this.scene.launch('CampOverlayScene', { gameScene: this });
      return;
    }

    this.player.update(time, delta);
    this.enemies.getChildren().forEach(e => {
      if (e.active) e.update(time, delta, this.player);
    });

    this.waveManager.update();
    this.updateXPGems();
    this.updateHealthDrops();
    this.updateHUD();
    this.juice.updateVignette(this.player.hp, this.player.maxHp);
    this.updateShieldRing();
    this.updateBossBar();
    this.updatePassiveRow();
    this.updateWeaponBar();
    this.updateMinimap();
  }

  updateXPGems() {
    for (let i = this.xpGems.length - 1; i >= 0; i--) {
      const gem = this.xpGems[i];
      if (!gem || !gem.active) { this.xpGems.splice(i, 1); continue; }

      const dist = Phaser.Math.Distance.Between(gem.x, gem.y, this.player.x, this.player.y);
      if (dist < this.player.xpPickupRadius) {
        SoundManager.play('xp_pickup');
        this.juice.hitSpark(gem.x, gem.y, 0x00ffaa);
        this.player.gainXP(gem.xpValue);
        gem.destroy();
        this.xpGems.splice(i, 1);
      } else if (dist < this.player.xpPickupRadius * 4) {
        const speed = 5 + (1 - dist / (this.player.xpPickupRadius * 4)) * 12;
        const angle = Phaser.Math.Angle.Between(gem.x, gem.y, this.player.x, this.player.y);
        gem.x += Math.cos(angle) * speed;
        gem.y += Math.sin(angle) * speed;
        this.juice.pulseGem(gem);
      }
    }
  }

  registerKill() {
    this.streak++;
    this.stats.kills++;

    if (this.streakTimer) this.streakTimer.remove();
    this.streakTimer = this.time.delayedCall(3000, () => {
      this.streak = 0;
      this.tweens.add({ targets: this.streakText, alpha: 0, duration: 300 });
    });

    if (this.streak >= 3) {
      const label = this.streak >= 15 ? `🔥 ${this.streak}x RAMPAGE!!!`
                  : this.streak >= 8  ? `⚡ ${this.streak}x KILLING SPREE!`
                  : `✦ ${this.streak}x COMBO`;
      const col = this.streak >= 15 ? '#ff4400'
                : this.streak >= 8  ? '#ff8800'
                : '#ffcc44';
      this.streakText.setText(label).setStyle({ fill: col }).setAlpha(1).setScale(1);
      this.tweens.killTweensOf(this.streakText);
      this.tweens.add({
        targets: this.streakText,
        scaleX: { from: 1.25, to: 1 }, scaleY: { from: 1.25, to: 1 },
        duration: 200, ease: 'Back.easeOut'
      });
    }
  }

  updateHealthDrops() {
    for (let i = this.healthDrops.length - 1; i >= 0; i--) {
      const heart = this.healthDrops[i];
      if (!heart || !heart.active) { this.healthDrops.splice(i, 1); continue; }

      const dist = Phaser.Math.Distance.Between(heart.x, heart.y, this.player.x, this.player.y);
      if (dist < 32) {
        const healed = Math.min(heart.healAmount || 10, this.player.maxHp - this.player.hp);
        if (healed > 0) {
          this.player.hp += healed;
          this.juice.floatText(heart.x, heart.y - 20, `+${healed} HP`, '#ff6688', 17);
        }
        SoundManager.play('heal');
        this.juice.hitSpark(heart.x, heart.y, 0xff4466);
        heart.destroy();
        this.healthDrops.splice(i, 1);
      }
    }
  }

  updateHUD() {
    const p       = this.player;
    const W       = this.scale.width;
    const elapsed = Math.floor((Date.now() - this.stats.startTime) / 1000);
    const mins    = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const secs    = (elapsed % 60).toString().padStart(2, '0');

    this.hudHpNums.setText(`${p.hp} / ${p.maxHp}`);
    this.hudLvText.setText(`Lv ${p.level}`);
    this.hudXpNums.setText(`${p.xp} / ${p.xpToNextLevel} XP`);
    const wm = this.waveManager;
    this.hudWave.setText(`Wave ${wm.wave}`);

    // Enemy progress: only show during active (non-boss) wave when not counting down
    if (!wm.betweenWaves && !wm.isBossWave && !wm.countdownActive) {
      const alive     = this.enemies.getChildren().filter(e => e.active).length;
      const remaining = (wm.toSpawn - wm.spawned) + alive;
      this.hudEnemies.setText(`${remaining} enemies remaining`).setStyle({ fill: '#556677' });
    } else if (!wm.countdownActive) {
      this.hudEnemies.setText('');
    }
    this.hudKills.setText(`Kills: ${this.stats.kills}`);
    this.hudTime.setText(`${mins}:${secs}`);

    const soulsDisplay = MetaProgress.souls + (MetaProgress.calcRunSouls(this.stats.kills, this.waveManager.wave, p.level) - this.soulsBanked);
    this.hudSouls.setText(`💀 ${soulsDisplay}`);

    // Inline HP and XP bars (redrawn each frame)
    const barX = 46, barW = 100;
    const hpPct = Math.max(0, p.hp / p.maxHp);
    const xpPct = p.xp / p.xpToNextLevel;
    const hpCol = hpPct > 0.5 ? 0xff6644 : hpPct > 0.25 ? 0xff8800 : 0xff2222;

    this.hudBars.clear();
    this.hudBars.fillStyle(0x330000, 0.8);
    this.hudBars.fillRect(barX, 19, barW, 9);
    this.hudBars.fillStyle(hpCol, 1);
    this.hudBars.fillRect(barX, 19, barW * hpPct, 9);
    this.hudBars.fillStyle(0x112211, 0.8);
    this.hudBars.fillRect(barX, 41, barW, 7);
    this.hudBars.fillStyle(0x44ffaa, 1);
    this.hudBars.fillRect(barX, 41, barW * xpPct, 7);

    // Dash cooldown bar
    const dashPct = Math.min(1, (this.time.now - (this.player.lastDashTime || 0)) / this.player.dashCooldownMs);
    this.hudBars.fillStyle(0x111133, 0.8);
    this.hudBars.fillRect(barX, 60, barW, 5);
    this.hudBars.fillStyle(dashPct >= 1 ? 0x4488ff : 0x223366, 1);
    this.hudBars.fillRect(barX, 60, barW * dashPct, 5);
  }

  updatePassiveRow() {
    this.passiveRow.clear();
    this.passiveTexts.forEach(t => t.destroy());
    this.passiveTexts = [];

    const ownedPassives = PASSIVES.filter(p => (this.player.passives[p.id] || 0) > 0);
    if (ownedPassives.length === 0) return;

    const H       = this.scale.height;
    const boxW    = 52, boxH = 38, gap = 4;
    const startX  = 20;
    const y       = H - 112;

    const effectLabel = {
      armor:     () => `-${Math.round(this.player.passiveStats.damageReduction * 100)}% dmg`,
      tome:      () => `+${Math.round(this.player.passiveStats.damageMultiplier * 100)}% atk`,
      pendant:   () => `-${Math.round(this.player.passiveStats.cooldownReduction * 100)}% cd`,
      ring:      () => `+${Math.round(this.player.passiveStats.xpMultiplier * 100)}% xp`,
      fang:      () => `+${this.player.passiveStats.killHeal}hp/kill`,
      ironheart: () => `+${this.player.passiveStats.maxHpBonus} hp`,
      crystal:   () => `+${this.player.passiveStats.xpRadius}px`,
      gloves:    () => `knockback`,
    };

    ownedPassives.forEach((p, i) => {
      const tier = this.player.passives[p.id] || 0;
      const x    = startX + i * (boxW + gap);

      // Box background
      this.passiveRow.fillStyle(p.color, 0.8);
      this.passiveRow.fillRect(x, y, boxW, boxH);
      this.passiveRow.lineStyle(1, 0xffffff, 0.35);
      this.passiveRow.strokeRect(x, y, boxW, boxH);

      // Item name (abbreviated)
      const nameLbl = this.add.text(x + boxW/2, y + 8, p.icon, {
        fontSize: '11px', fill: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
      this.passiveTexts.push(nameLbl);

      // Effect label — what it's actually doing
      const effect = effectLabel[p.id] ? effectLabel[p.id]() : '';
      const effLbl = this.add.text(x + boxW/2, y + 22, effect, {
        fontSize: '10px', fill: '#ffffff'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
      this.passiveTexts.push(effLbl);

      // Tier pip dots at bottom
      for (let t2 = 0; t2 < p.maxTier; t2++) {
        this.passiveRow.fillStyle(t2 < tier ? 0xffffff : 0x334444, 1);
        this.passiveRow.fillRect(x + 4 + t2 * Math.floor((boxW - 8) / p.maxTier), y + boxH - 5, Math.floor((boxW - 8) / p.maxTier) - 2, 3);
      }
    });
  }

  updateMinimap() {
    this.minimapDots.clear();
    const scX = this.mmSize / WORLD_W;
    const scY = this.mmSize / WORLD_H;

    // Enemy dots (red; elites in gold)
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      if (e.isElite) {
        this.minimapDots.fillStyle(0xffdd33, 1);
        this.minimapDots.fillCircle(this.mmX + e.x * scX, this.mmY + e.y * scY, 3);
      } else {
        this.minimapDots.fillStyle(0xff3333, 0.85);
        this.minimapDots.fillCircle(this.mmX + e.x * scX, this.mmY + e.y * scY, 1.5);
      }
    });

    // Player dot — bright white, slightly larger
    const px = this.mmX + this.player.x * scX;
    const py = this.mmY + this.player.y * scY;
    this.minimapDots.fillStyle(0xffffff, 1);
    this.minimapDots.fillCircle(px, py, 3);
    // Small arrow-head pointing right (shows direction via sprite flip)
    const flipSign = this.player.flipX ? -1 : 1;
    this.minimapDots.fillTriangle(px + flipSign * 5, py, px + flipSign * 2, py - 2, px + flipSign * 2, py + 2);
  }

  updateWeaponBar() {
    this.weaponBar.clear();
    this.weaponTexts.forEach(t => t.destroy());
    this.weaponTexts = [];

    const W     = this.scale.width;
    const H     = this.scale.height;
    const boxW  = 54, boxH = 42, gap = 6;
    const time  = this._time || 0;
    const count = this.player.weapons.length;
    const totalW = count * (boxW + gap) - gap;
    const startX = W / 2 - totalW / 2;
    const y      = H - boxH - 10;

    // Weapon color palette by id
    const wColors = {
      magic_orb: 0x4422aa, sword_slash: 0x224488, arrow: 0x225522,
      boomerang: 0x884422, fire_nova: 0x882211, daggers: 0x446644,
      chaos_nova: 0x661188, storm_bow: 0x115566, holy_blade: 0xaa8811,
      soul_catcher: 0x334466,
    };

    this.player.weapons.forEach((wDef, i) => {
      const x   = startX + i * (boxW + gap);
      const key = wDef.id + '_' + i;
      const lastFired   = this.player.attackTimers[key] || 0;
      const effectiveCd = wDef.cooldown * (1 - this.player.passiveStats.cooldownReduction);
      const cdPct       = Math.min(1, (time - lastFired) / effectiveCd);
      const ready       = cdPct >= 1;

      const col = wColors[wDef.id] || 0x334455;

      // Background box
      this.weaponBar.fillStyle(col, ready ? 0.90 : 0.45);
      this.weaponBar.fillRect(x, y, boxW, boxH);
      this.weaponBar.lineStyle(1, ready ? 0xffffff : 0x555577, ready ? 0.5 : 0.25);
      this.weaponBar.strokeRect(x, y, boxW, boxH);

      // Cooldown fill overlay (dark, shrinks top-to-bottom as ready)
      if (!ready) {
        this.weaponBar.fillStyle(0x000000, 0.55);
        this.weaponBar.fillRect(x, y, boxW, boxH * (1 - cdPct));
      }

      // Abbreviated weapon name (2 lines)
      const names = {
        magic_orb: ['ORB', ''], sword_slash: ['SLASH', ''], arrow: ['ARROW', ''],
        boomerang: ['BOOM-', 'RANG'], fire_nova: ['NOVA', ''], daggers: ['DAGGER', ''],
        chaos_nova: ['CHAOS', 'NOVA'], storm_bow: ['STORM', 'BOW'],
        holy_blade: ['HOLY', 'BLADE'], soul_catcher: ['SOUL', 'CATCH'],
      };
      const [line1, line2] = names[wDef.id] || [wDef.id.toUpperCase().slice(0, 5), ''];
      const nameColor = ready ? '#ffffff' : '#888899';

      const t1 = this.add.text(x + boxW / 2, y + (line2 ? 11 : 16), line1, {
        fontSize: '10px', fill: nameColor, fontStyle: 'bold'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
      this.weaponTexts.push(t1);

      if (line2) {
        const t2 = this.add.text(x + boxW / 2, y + 23, line2, {
          fontSize: '10px', fill: nameColor, fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
        this.weaponTexts.push(t2);
      }

      // Damage label
      const dmgLabel = this.add.text(x + boxW / 2, y + boxH - 9, `${wDef.damage}dmg`, {
        fontSize: '9px', fill: ready ? '#aaccff' : '#445566'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
      this.weaponTexts.push(dmgLabel);

      // "READY" dot
      if (ready) {
        this.weaponBar.fillStyle(0x44ffaa, 1);
        this.weaponBar.fillCircle(x + boxW - 5, y + 5, 3);
      }

      // Evolved badge
      if (wDef.evolved) {
        this.weaponBar.fillStyle(0xffdd00, 0.9);
        this.weaponBar.fillRect(x, y, boxW, 5);
      }
    });
  }

  updateShieldRing() {
    this.shieldRing.clear();
    if (!this.player.hasShield) return;

    const p      = this.player;
    const dur    = p.shieldDurability;
    const maxDur = p.shieldMax;
    const radius = 28;
    const pulse  = 0.65 + 0.35 * Math.sin(this.time.now / 280);

    if (dur <= 0) {
      // Broken — faint grey ring
      this.shieldRing.lineStyle(1, 0x334455, 0.3);
      this.shieldRing.strokeCircle(p.x, p.y, radius);
      return;
    }

    // Draw one arc segment per remaining charge
    const gapDeg = 10;
    const segDeg = (360 / maxDur) - gapDeg;
    const color  = dur === maxDur ? 0x4488ff : dur === 2 ? 0x44aaff : 0xff8844;

    for (let i = 0; i < dur; i++) {
      const startRad = Phaser.Math.DegToRad(-90 + i * (360 / maxDur) + gapDeg / 2);
      const endRad   = Phaser.Math.DegToRad(-90 + i * (360 / maxDur) + segDeg + gapDeg / 2);
      this.shieldRing.lineStyle(3, color, pulse);
      this.shieldRing.beginPath();
      this.shieldRing.arc(p.x, p.y, radius, startRad, endRad, false);
      this.shieldRing.strokePath();
    }
  }

  showBossEntry(boss) {
    const W = this.scale.width, H = this.scale.height;

    // Large centred name that punches in, holds, then rises to become the HP bar header
    const nameTxt = this.add.text(W/2, H/2, '☠  THE LICH  ☠', {
      fontSize: '58px', fill: '#cc22ff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 7
    }).setOrigin(0.5).setScrollFactor(0).setDepth(502).setAlpha(0).setScale(0.4);

    this.tweens.add({
      targets: nameTxt,
      alpha: 1, scaleX: 1, scaleY: 1,
      duration: 350, ease: 'Back.easeOut',
      onComplete: () => {
        // Hold 1.2s then fade while HP bar fades in
        this.time.delayedCall(1200, () => {
          this.tweens.add({
            targets: nameTxt, alpha: 0, y: 130,
            duration: 400, ease: 'Quad.easeIn',
            onComplete: () => { nameTxt.destroy(); this.showBossBar(boss); }
          });
        });
      }
    });

    SoundManager.play('player_death'); // dramatic boom reuse
  }

  showBossBar(boss) {
    // Clear any old bar
    this.bossBarGroup.clear(true, true);
    const W = this.scale.width;
    const barW = W - 80;

    const bg   = this.add.rectangle(W/2, 148, barW, 20, 0x220000).setScrollFactor(0).setDepth(500).setStrokeStyle(1, 0x660000);
    const fill = this.add.rectangle(40, 148, barW, 16, 0xcc0044).setOrigin(0, 0.5).setScrollFactor(0).setDepth(500);
    const lbl  = this.add.text(W/2, 130, '☠ THE LICH ☠', { fontSize: '15px', fill: '#ff4444', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(500);

    this.bossBarGroup.addMultiple([bg, fill, lbl]);
    this._bossBarFill = fill;
    this._bossBarMaxW = barW;
  }

  updateBossBar() {
    if (!this.currentBoss || !this._bossBarFill) return;
    if (!this.currentBoss.active || this.currentBoss.hp <= 0) {
      // Boss died — clear bar with fanfare
      this.bossBarGroup.clear(true, true);
      this._bossBarFill = null;
      this.currentBoss  = null;
      this.juice.waveClearFanfare();
      this.juice.flash(255, 200, 0, 400);
      this.juice.floatText(this.player.x, this.player.y - 80, 'BOSS SLAIN!', '#FFD700', 28);
      SoundManager.play('wave_clear');
      MusicManager.play('game'); // return to game music after boss
      return;
    }
    const pct = this.currentBoss.hp / this.currentBoss.maxHp;
    const col = pct > 0.6 ? 0xcc0044 : pct > 0.3 ? 0xff6600 : 0xff0000;
    this._bossBarFill.setSize(this._bossBarMaxW * pct, 16);
    this._bossBarFill.setFillStyle(col);
  }

  showWaveAnnouncement(wave) {
    if (wave > 1) this.juice.waveClearFanfare();
    this.waveAnnounce.setText(`Wave ${wave}`);
    this.tweens.killTweensOf(this.waveAnnounce);
    this.tweens.add({
      targets: this.waveAnnounce,
      alpha: { from: 0, to: 1 },
      y: { from: this.scale.height / 2, to: this.scale.height / 2 - 80 },
      duration: 350,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(900, () => {
          this.tweens.add({ targets: this.waveAnnounce, alpha: 0, duration: 400 });
        });
      }
    });
  }

  // Credit any newly earned souls to MetaProgress right now.
  // Tracks what's already been banked so death doesn't double-count.
  bankCurrentSouls() {
    const potential = MetaProgress.calcRunSouls(this.stats.kills, this.waveManager.wave, this.player.level);
    const toBank = potential - this.soulsBanked;
    if (toBank > 0) {
      MetaProgress.addSouls(toBank);
      this.soulsBanked = potential;
    }
  }

  onLevelUp() {
    SoundManager.play('level_up');
    this.juice.levelUpFanfare(this.player.x, this.player.y);
    // Defer upgrade picker during boss death animation so timers don't freeze
    if (this._bossDeathInProgress) {
      this._pendingLevelUps = (this._pendingLevelUps || 0) + 1;
      return;
    }
    this.openUpgradePicker();
  }

  openUpgradePicker() {
    const choices = this.upgradeManager.getChoices(3, this.player);
    this.scene.pause('GameScene');
    this.scene.launch('UpgradeScene', { choices, gameScene: this });
  }

  onBossDied() {
    if (this._chapterBreak) return;
    this._chapterBreak = true;

    const chapter = Math.floor(this.waveManager.wave / 5);
    const W = this.scale.width, H = this.scale.height;

    // Capture souls earned this chapter BEFORE banking (banking resets the delta to 0)
    const soulsEarned = MetaProgress.calcRunSouls(this.stats.kills, this.waveManager.wave, this.player.level) - this.soulsBanked;
    this.bankCurrentSouls();

    // Dramatic pause + flash
    this.juice.flash(200, 200, 80, 600);
    MusicManager.play('campfire');

    // Chapter complete overlay
    const overlay = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0)
      .setScrollFactor(0).setDepth(600);
    this.tweens.add({ targets: overlay, fillAlpha: 0.65, duration: 600 });

    const chapterText = this.add.text(W/2, H/2 - 80, `Chapter ${chapter} Complete!`, {
      fontSize: '52px', fill: '#FFD700', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(601).setAlpha(0);

    const subText = this.add.text(W/2, H/2, `Waves ${(chapter-1)*5 + 1}–${chapter*5} cleared`, {
      fontSize: '22px', fill: '#aabbcc'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(601).setAlpha(0);

    const soulText = this.add.text(W/2, H/2 + 50, `💀 +${soulsEarned} souls banked`, {
      fontSize: '18px', fill: '#cc9922'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(601).setAlpha(0);

    const continueText = this.add.text(W/2, H/2 + 110, 'Preparing bonus upgrade…', {
      fontSize: '15px', fill: '#556677'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(601).setAlpha(0);

    this.tweens.add({
      targets: [chapterText, subText, soulText, continueText],
      alpha: 1, duration: 500, delay: 400
    });

    // After 3s, offer a free bonus upgrade then start the next wave
    this.time.delayedCall(3200, () => {
      [overlay, chapterText, subText, soulText, continueText].forEach(o => o.destroy());
      this._chapterBreak = false;
      // Heal player
      this.player.hp = Math.min(this.player.hp + Math.floor(this.player.maxHp * 0.25), this.player.maxHp);
      this.juice.floatText(this.player.x, this.player.y - 40, '+25% HP restored', '#44ff88', 18);
      // Start next wave properly so WaveManager doesn't stall
      this.waveManager.betweenWaves = true;
      this.waveManager.countdownActive = false;
      // Give a bonus upgrade pick, then resume music
      this._bossDeathInProgress = false;
      const pending = this._pendingLevelUps || 0;
      this._pendingLevelUps = 0;
      MusicManager.play('game');
      // Bonus upgrade + any queued level-ups
      this.openUpgradePicker();
      for (let i = 0; i < pending; i++) this.openUpgradePicker();
      // Wave countdown starts after the upgrade picker closes
      this.events.once('resume', () => {
        this.waveManager.nextWaveAt      = this.time.now + 2000;
        this.waveManager.countdownActive = true;
      });
    });
  }

  endRun() {
    if (this._ending) return;
    this._ending = true;
    // Bank any remaining un-banked souls (delta since last camp visit)
    this.bankCurrentSouls();
    SoundManager.play('player_death');
    this.juice.bigShake();
    this.juice.flash(255, 50, 50, 300);
    const elapsed  = Math.floor((Date.now() - this.stats.startTime) / 1000);
    const improved = MetaProgress.submitRun(this.stats.kills, this.waveManager.wave, this.player.level, elapsed);
    this.time.delayedCall(700, () => {
      this.scene.start('CampfireScene', {
        kills: this.stats.kills,
        wave:  this.waveManager.wave,
        level: this.player.level,
        time:  elapsed,
        alreadyBanked: true,
        soulsEarned: this.soulsBanked,
        improved
      });
    });
  }
}
