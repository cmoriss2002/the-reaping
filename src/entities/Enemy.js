class Enemy extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, type) {
    const def = ENEMIES[type];
    super(scene, x, y, def.texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(def.bodySize || def.size * 1.6, def.bodySize || def.size * 1.6);

    this.enemyType      = type;
    this.maxHp          = def.hp;
    this.hp             = def.hp;
    this.speed          = def.speed;
    this.damage         = def.damage;
    this.xpValue        = def.xpValue;
    this.attackRate     = def.attackRate;
    this.lastAttackTime = 0;
    this.behavior       = def.behavior || 'chaser';

    // Charger state
    this.chargeTimer    = 0;
    this.chargePhase    = 'idle'; // idle | windup | charging
    this.chargeVx       = 0;
    this.chargeVy       = 0;

    this.hpBar  = scene.add.graphics();
    this.isElite = false;
  }

  makeElite() {
    this.isElite = true;
    this.maxHp  = this.maxHp  * 2;
    this.hp     = this.maxHp;
    this.xpValue = this.xpValue * 3;
    this.setScale(this.scaleX * 1.25, this.scaleY * 1.25);
    this.setTint(0xffdd33);

    // Pulsing gold aura ring
    this._eliteAura = this.scene.add.graphics();
    this.scene.tweens.add({
      targets: { t: 0 },
      t: 1,
      duration: 900,
      yoyo: true,
      repeat: -1,
      onUpdate: (tween) => {
        if (!this.active || !this._eliteAura) return;
        const alpha = 0.25 + tween.getValue() * 0.35;
        this._eliteAura.clear();
        this._eliteAura.lineStyle(3, 0xffdd33, alpha);
        this._eliteAura.strokeCircle(this.x, this.y, 22 + tween.getValue() * 6);
      }
    });
  }

  update(time, delta, player) {
    if (!this.active || !player.active || this._isDying) return;

    switch (this.behavior) {
      case 'archer':    this.behaviorArcher(time, player);           break;
      case 'charger':   this.behaviorCharger(time, delta, player);   break;
      case 'boss':      this.behaviorBoss(time, delta, player);      break;
      case 'swoop':     this.behaviorSwoop(time, delta, player);     break;
      case 'retreater': this.behaviorRetreater(time, player);        break;
      default:          this.behaviorChaser(time, player);
                        this.applyRegen(delta);                      break;
    }

    this.drawHpBar();
    if (player.x < this.x) this.setFlipX(true);
    else this.setFlipX(false);
  }

  // ── Standard chase + melee ──────────────────────────────────────────────
  behaviorChaser(time, player) {
    this.chasePlayer(player);
    this.tryMeleeAttack(time, player);
  }

  // ── Goblin Archer: keep at range, flee if too close, shoot ─────────────
  behaviorArcher(time, player) {
    const def  = ENEMIES[this.enemyType];
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    if (dist < def.fleeRange) {
      // Too close — flee directly away
      const angle = Phaser.Math.Angle.Between(player.x, player.y, this.x, this.y);
      this.body.setVelocity(Math.cos(angle) * this.speed * 1.3, Math.sin(angle) * this.speed * 1.3);
    } else if (dist > def.preferredRange + 60) {
      // Too far — approach
      this.chasePlayer(player);
    } else {
      // Sweet spot — stop and shoot
      this.body.setVelocity(0, 0);
      this.tryRangedAttack(time, player);
    }
  }

  // ── Skeleton Charger: chase slowly, then telegraph+dash ────────────────
  behaviorCharger(time, delta, player) {
    const def = ENEMIES[this.enemyType];
    this.chargeTimer += delta;

    if (this.chargePhase === 'charging') {
      this.body.setVelocity(this.chargeVx, this.chargeVy);
      this.tryMeleeAttack(time, player);
      if (this.chargeTimer >= def.chargeDuration) {
        this.chargePhase = 'idle';
        this.chargeTimer = 0;
        this.clearTint();
      }
    } else if (this.chargePhase === 'windup') {
      // Frozen, glowing red — about to charge
      this.body.setVelocity(0, 0);
      this.setTint(Phaser.Math.Between(0, 4) > 2 ? 0xff3300 : 0xff6600); // flicker
      if (this.chargeTimer >= 550) {
        this.chargePhase = 'charging';
        this.chargeTimer = 0;
        this.clearTint();
        this.setTint(0xff8800);
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.chargeVx = Math.cos(angle) * def.chargeSpeed;
        this.chargeVy = Math.sin(angle) * def.chargeSpeed;
      }
    } else {
      // Normal slow chase
      this.chasePlayer(player);
      this.tryMeleeAttack(time, player);
      if (this.chargeTimer >= def.chargeInterval) {
        this.chargePhase = 'windup';
        this.chargeTimer = 0;
        // Warning tint
        this.setTint(0xff2200);
      }
    }
  }

  // ── Bat: fast swooping arcs ────────────────────────────────────────────────
  behaviorSwoop(time, delta, player) {
    if (!this._swoopAngle) this._swoopAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    if (!this._swoopTimer) this._swoopTimer = 0;
    this._swoopTimer += delta;

    // Periodically re-aim
    if (this._swoopTimer > 800) {
      this._swoopAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this._swoopTimer = 0;
    }
    // Add a sine wave perpendicular wobble for a swooping path
    const wobble = Math.sin(this._swoopTimer / 120) * 1.2;
    const perp   = this._swoopAngle + Math.PI / 2;
    this.body.setVelocity(
      Math.cos(this._swoopAngle) * this.speed + Math.cos(perp) * wobble * 60,
      Math.sin(this._swoopAngle) * this.speed + Math.sin(perp) * wobble * 60
    );
    this.tryMeleeAttack(time, player);
  }

  // ── Dark Mage: keeps distance, shoots, retreats when player gets close ──────
  behaviorRetreater(time, player) {
    const def  = ENEMIES[this.enemyType];
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (dist < def.fleeRange) {
      // Run away
      const angle = Phaser.Math.Angle.Between(player.x, player.y, this.x, this.y);
      this.body.setVelocity(Math.cos(angle) * this.speed * 1.4, Math.sin(angle) * this.speed * 1.4);
    } else if (dist > def.preferredRange + 40) {
      this.chasePlayer(player);
    } else {
      this.body.setVelocity(0, 0);
      this.tryRangedAttack(time, player);
    }
  }

  // ── Troll HP regen ───────────────────────────────────────────────────────────
  applyRegen(delta) {
    const def = ENEMIES[this.enemyType];
    if (!def.regenRate || this.hp >= this.maxHp) return;
    if (!this._regenAcc) this._regenAcc = 0;
    this._regenAcc += def.regenRate * (delta / 1000);
    if (this._regenAcc >= 1) {
      this.hp = Math.min(this.hp + Math.floor(this._regenAcc), this.maxHp);
      this._regenAcc = 0;
    }
  }

  // ── Lich Boss ────────────────────────────────────────────────────────────
  behaviorBoss(time, delta, player) {
    const def   = ENEMIES[this.enemyType];
    const hpPct = this.hp / this.maxHp;

    if (!this._bossPhase) this._bossPhase = 1;
    if (!this._bossTimer) this._bossTimer = 0;
    this._bossTimer += delta;

    // Transition to harder phase
    if (hpPct < def.phase3At && this._bossPhase < 3) {
      this._bossPhase = 3;
      this.setTint(0xff0000);
      this.scene.juice.bigShake();
      this.scene.juice.flash(255, 0, 0, 200);
      this.scene.juice.floatText(this.x, this.y - 60, 'ENRAGED!', '#ff2200', 22);
    } else if (hpPct < def.phase2At && this._bossPhase < 2) {
      this._bossPhase = 2;
      this.setTint(0xff6600);
      this.scene.juice.shake(150, 0.012);
    }

    // Move toward player
    this.chasePlayer(player);

    // Fire pattern based on phase
    const interval = this._bossPhase === 3 ? 900 : this._bossPhase === 2 ? 1400 : 2000;
    if (this._bossTimer >= interval) {
      this._bossTimer = 0;
      this._bossFire();
    }
  }

  _bossFire() {
    if (!this.scene || !this.scene.enemyProjectiles) return;
    const shots = this._bossPhase === 3 ? 12 : this._bossPhase === 2 ? 8 : 4;
    const speed = this._bossPhase === 3 ? 220 : 170;

    for (let i = 0; i < shots; i++) {
      const angle = (i / shots) * Math.PI * 2;
      const proj  = new EnemyProjectile(this.scene, this.x, this.y, this.damage);
      // Override texture to boss_orb
      proj.setTexture('boss_orb').setScale(1.2);
      this.scene.enemyProjectiles.add(proj);
      proj.fire(Math.cos(angle) * speed, Math.sin(angle) * speed, angle);
    }

    if (this.scene.juice) this.scene.juice.hitSpark(this.x, this.y, 0x8800ff);
  }

  // ── Shared helpers ──────────────────────────────────────────────────────
  chasePlayer(player) {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    this.body.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
  }

  tryMeleeAttack(time, player) {
    if (time - this.lastAttackTime < this.attackRate) return;
    const def  = ENEMIES[this.enemyType];
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (dist < 28 + (def.size || 20)) {
      player.takeDamage(this.damage);
      this.lastAttackTime = time;
    }
  }

  tryRangedAttack(time, player) {
    if (time - this.lastAttackTime < this.attackRate) return;
    this.lastAttackTime = time;

    if (!this.scene.enemyProjectiles) return;

    const proj  = new EnemyProjectile(this.scene, this.x, this.y, this.damage);
    this.scene.enemyProjectiles.add(proj);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    proj.fire(Math.cos(angle) * 260, Math.sin(angle) * 260, angle);
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.setTint(0xffffff);
    if (this.scene) {
      this.scene.time.delayedCall(80, () => {
        if (this.active) {
          if (this.isElite) this.setTint(0xffdd33);
          else this.clearTint();
        }
      });
    }
    if (this.hp <= 0) {
      this.hpBar.destroy();
      if (this._eliteAura) { this._eliteAura.destroy(); this._eliteAura = null; }
      if (this.enemyType === 'lich') {
        this._playBossDeath();
        return true; // CombatSystem treats it as dead immediately
      }
      this.destroy();
      return true;
    }
    return false;
  }

  _playBossDeath() {
    this._isDying = true;
    this.scene._bossDeathInProgress = true;
    // Freeze in place
    if (this.body) { this.body.setVelocity(0, 0); this.body.enable = false; }

    const scene = this.scene;
    const bx = this.x, by = this.y;

    // Phase 1 (0–1.2s): rapid colour flicker
    let tick = 0;
    scene.time.addEvent({
      delay: 80, repeat: 14,
      callback: () => {
        if (!this.active) return;
        this.setTint(tick++ % 2 === 0 ? 0xffffff : 0xff2200);
        scene.juice.shake(80, 0.008);
      }
    });

    // Phase 2 (1.2s): big white flash + first burst
    scene.time.delayedCall(1200, () => {
      scene.juice.flash(255, 255, 255, 500);
      scene.juice.bigShake();
      scene.juice.deathBurst(bx, by, 0xcc44ff);
      scene.juice.deathBurst(bx, by, 0xff2244);
      if (this.active) this.setTint(0xffffff);
    });

    // Phase 3 (1.6s): scale-up + fade out with spinning
    scene.time.delayedCall(1600, () => {
      if (!this.active) return;
      scene.tweens.add({
        targets: this,
        scaleX: this.scaleX * 2.5,
        scaleY: this.scaleY * 2.5,
        alpha: 0,
        angle: 270,
        duration: 1400,
        ease: 'Quad.easeIn',
        onComplete: () => { if (this.active) this.destroy(); }
      });
      scene.juice.deathBurst(bx, by, 0xffdd00);
    });

    // Phase 4 (1.8s): "BOSS DEFEATED!" floating text
    scene.time.delayedCall(1800, () => {
      scene.juice.floatText(bx, by - 60, '☠ BOSS DEFEATED ☠', '#FFD700', 32);
      scene.juice.flash(200, 150, 0, 800);
    });

    // Phase 5 (2.4s): third burst + climax shake
    scene.time.delayedCall(2400, () => {
      scene.juice.deathBurst(bx, by, 0xffffff);
      scene.juice.bigShake();
    });
  }

  drawHpBar() {
    if (!this.active) return;
    const def  = ENEMIES[this.enemyType];
    const pct  = this.hp / this.maxHp;
    const barW = (def.size || 20) * 2.2;
    const barX = this.x - barW / 2;
    const barY = this.y - (def.size || 20) - 10;

    this.hpBar.clear();
    this.hpBar.fillStyle(0x222222, 0.8);
    this.hpBar.fillRect(barX, barY, barW, 5);
    const col = pct > 0.5 ? 0x44ff44 : pct > 0.25 ? 0xffaa00 : 0xff2222;
    this.hpBar.fillStyle(col, 1);
    this.hpBar.fillRect(barX, barY, barW * pct, 5);
  }

  destroy(fromScene) {
    if (this.hpBar && this.hpBar.active) this.hpBar.destroy();
    super.destroy(fromScene);
  }
}
