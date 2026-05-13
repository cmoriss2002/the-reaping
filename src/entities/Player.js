class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, charType = 'knight') {
    super(scene, x, y, 'player_' + charType);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCollideWorldBounds(false);
    this.body.setSize(20, 28); // tighter hitbox than sprite size

    this.charType = charType;

    // Base stats (tweaked per character in applyCharStats)
    this.maxHp = 100;
    this.hp    = 100;
    this.speed = 200;

    this.xp             = 0;
    this.level          = 1;
    this.xpToNextLevel  = 20;
    this.xpPickupRadius = 70;
    this.regenRate      = 0;
    this.regenAccumulator = 0;
    this.futurePiercing   = false;
    this.hasRevive        = false;
    this.hasShield        = false;
    this.shieldDurability = 0;
    this.shieldMax        = 3;

    // Passive item inventory: { itemId: currentTier }
    this.passives = {};
    // Derived passive stats (recalculated as passives are applied)
    this.passiveStats = {
      damageReduction:  0,    // fraction of incoming damage blocked
      damageMultiplier: 0,    // fraction added to outgoing damage
      cooldownReduction:0,    // fraction subtracted from weapon cooldowns
      xpMultiplier:     0,    // fraction added to XP gained
      killHeal:         0,    // HP healed per kill
      maxHpBonus:       0,    // extra max HP (applied at pickup time)
      xpRadius:         0,    // extra XP attract radius
      knockback:        0,    // knockback tier (0=none)
    };

    this.weapons      = [];
    this.attackTimers = {};

    // Dash state
    this.dashCooldownMs = 1500;
    this.dashDurationMs = 190;
    this.lastDashTime   = -9999;
    this.isDashing      = false;
    this.dashInvincible = false;
    this.lastMoveDir    = { x: 1, y: 0 };

    this.applyCharStats(charType);

    this.cursors   = scene.input.keyboard.createCursorKeys();
    this.wasd      = scene.input.keyboard.addKeys('W,A,S,D');
    this.spaceKey  = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Read control mode from settings
    try {
      const s = JSON.parse(localStorage.getItem('fab_settings') || '{}');
      this._controlMode = s.controlMode || 'joystick';
    } catch(e) { this._controlMode = 'joystick'; }

    const JOY_R = 65;
    this._pointerTarget = null;
    this._lastTapTime   = 0;
    this._joyBase       = null;
    this._joyVec        = { x: 0, y: 0 };
    this._joyGfx        = scene.add.graphics().setScrollFactor(0).setDepth(490);

    scene.input.on('pointerdown', (ptr) => {
      if (!this.active) return;
      if (!ptr.leftButtonDown()) return;
      if (scene.input.hitTestPointer(ptr).length > 0) return;
      const now = scene.time.now;
      if (now - this._lastTapTime < 300) { this._doubleTapDash(ptr); }
      this._lastTapTime = now;
      if (this._controlMode === 'joystick') {
        this._joyBase = { x: ptr.x, y: ptr.y };
        this._joyVec  = { x: 0, y: 0 };
        this._drawJoystick(ptr.x, ptr.y, ptr.x, ptr.y, JOY_R);
      } else {
        this._pointerTarget = { x: ptr.worldX, y: ptr.worldY - 100 };
      }
    });
    scene.input.on('pointermove', (ptr) => {
      if (!this.active || !ptr.isDown) return;
      if (scene.input.hitTestPointer(ptr).length > 0) return;
      if (this._controlMode === 'joystick' && this._joyBase) {
        const dx = ptr.x - this._joyBase.x;
        const dy = ptr.y - this._joyBase.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this._joyVec = dist > 0 ? { x: dx / dist, y: dy / dist } : { x: 0, y: 0 };
        const clamp = Math.min(dist, JOY_R);
        this._drawJoystick(this._joyBase.x, this._joyBase.y,
          this._joyBase.x + this._joyVec.x * clamp,
          this._joyBase.y + this._joyVec.y * clamp, JOY_R);
      } else if (this._controlMode === 'tap') {
        this._pointerTarget = { x: ptr.worldX, y: ptr.worldY - 100 };
      }
    });
    scene.input.on('pointerup', () => {
      this._joyBase = null;
      this._joyVec  = { x: 0, y: 0 };
      this._joyGfx.clear();
      this._pointerTarget = null;
    });
  }

  _drawJoystick(bx, by, kx, ky, r) {
    this._joyGfx.clear();
    this._joyGfx.fillStyle(0xffffff, 0.12);
    this._joyGfx.fillCircle(bx, by, r);
    this._joyGfx.lineStyle(2, 0xffffff, 0.35);
    this._joyGfx.strokeCircle(bx, by, r);
    this._joyGfx.fillStyle(0xffffff, 0.45);
    this._joyGfx.fillCircle(kx, ky, r * 0.38);
  }

  _doubleTapDash(ptr) {
    if (!ptr) return;
    this._pointerTarget = null;
    const dx = ptr.worldX - this.x;
    const dy = ptr.worldY - this.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      this.lastMoveDir.x = dx / len;
      this.lastMoveDir.y = dy / len;
    }
    this._triggerDash(this.scene.time.now);
  }

  applyCharStats(charType) {
    if (charType === 'knight') {
      this.maxHp = 140; this.hp = 140;
      this.speed = 175;
      this.addWeapon('sword_slash');
    } else if (charType === 'mage') {
      this.maxHp = 80; this.hp = 80;
      this.speed = 200;
      this.addWeapon('magic_orb');
      // Mage gets boosted orb damage
      this.weapons[0].damage = Math.floor(this.weapons[0].damage * 1.4);
    } else {
      // rogue
      this.maxHp = 80; this.hp = 80;
      this.speed = 245;
      this.addWeapon('arrow');
      this.weapons[0].cooldown = Math.floor(this.weapons[0].cooldown * 0.75);
    }
  }

  applyPassive(passiveId) {
    const def = PASSIVES.find(p => p.id === passiveId);
    if (!def) return;
    const currentTier = this.passives[passiveId] || 0;
    if (currentTier >= def.maxTier) return;

    this.passives[passiveId] = currentTier + 1;
    const tier = def.tiers[currentTier];

    switch (tier.stat) {
      case 'damageReduction':   this.passiveStats.damageReduction   = Math.min(0.60, this.passiveStats.damageReduction + tier.value); break;
      case 'damageMultiplier':  this.passiveStats.damageMultiplier  += tier.value; break;
      case 'cooldownReduction': this.passiveStats.cooldownReduction = Math.min(0.60, this.passiveStats.cooldownReduction + tier.value); break;
      case 'xpMultiplier':      this.passiveStats.xpMultiplier      += tier.value; break;
      case 'killHeal':          this.passiveStats.killHeal           += tier.value; break;
      case 'xpRadius':          this.xpPickupRadius                  += tier.value; break;
      case 'maxHpBonus':
        this.maxHp += tier.value;
        this.hp = Math.min(this.hp + tier.value, this.maxHp);
        break;
      case 'knockback':         this.passiveStats.knockback          += tier.value; break;
    }
  }

  addWeapon(weaponId) {
    const def = Object.assign({}, WEAPONS[weaponId]);
    if (this.futurePiercing) def.piercing = true;
    this.weapons.push(def);
  }

  update(time, delta) {
    this.handleDash(time);
    if (!this.isDashing) this.handleMovement();
    this.handleAttacks(time);
    this.handleRegen(delta);
  }

  handleMovement() {
    let vx = 0, vy = 0;
    let fromPointer = false;
    if (this.cursors.left.isDown  || this.wasd.A.isDown) vx = -this.speed;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx =  this.speed;
    if (this.cursors.up.isDown    || this.wasd.W.isDown) vy = -this.speed;
    if (this.cursors.down.isDown  || this.wasd.S.isDown) vy =  this.speed;

    if (vx === 0 && vy === 0) {
      if (this._controlMode === 'joystick' && this._joyBase &&
          (this._joyVec.x !== 0 || this._joyVec.y !== 0)) {
        vx = this._joyVec.x * this.speed;
        vy = this._joyVec.y * this.speed;
        fromPointer = true;
      } else if (this._pointerTarget) {
        const dx = this._pointerTarget.x - this.x;
        const dy = this._pointerTarget.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 5) {
          vx = (dx / dist) * this.speed;
          vy = (dy / dist) * this.speed;
          fromPointer = true;
        } else {
          this._pointerTarget = null;
        }
      }
    }

    if (!fromPointer && vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

    if (vx !== 0 || vy !== 0) {
      this.lastMoveDir.x = vx;
      this.lastMoveDir.y = vy;
    }

    this.body.setVelocity(vx, vy);

    // Flip sprite based on direction
    if (vx < 0) this.setFlipX(true);
    else if (vx > 0) this.setFlipX(false);

    // Clamp to world bounds
    const wb = this.scene.physics.world.bounds;
    this.x = Phaser.Math.Clamp(this.x, wb.x + 20, wb.right  - 20);
    this.y = Phaser.Math.Clamp(this.y, wb.y + 20, wb.bottom - 20);
  }

  handleDash(time) {
    if (this.isDashing) return;
    if (!Phaser.Input.Keyboard.JustDown(this.spaceKey)) return;
    this._triggerDash(time);
  }

  _triggerDash(time) {
    if (this.isDashing) return;
    if (time - this.lastDashTime < this.dashCooldownMs) return;

    let dx = this.lastMoveDir.x, dy = this.lastMoveDir.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) { dx /= len; dy /= len; }

    this.isDashing      = true;
    this.dashInvincible = true;
    this.lastDashTime   = time;

    this.body.setVelocity(dx * 1100, dy * 1100);
    SoundManager.play('dash');
    this._createDashTrail();

    this.scene.time.delayedCall(this.dashDurationMs, () => {
      if (!this.active) return;
      this.isDashing      = false;
      this.dashInvincible = false;
    });
  }

  _createDashTrail() {
    for (let i = 0; i < 5; i++) {
      this.scene.time.delayedCall(i * 35, () => {
        if (!this.active) return;
        const ghost = this.scene.add.sprite(this.x, this.y, this.texture.key)
          .setAlpha(0.55 - i * 0.09)
          .setFlipX(this.flipX)
          .setTint(0x6699ff)
          .setDepth(this.depth - 1)
          .setScale(this.scaleX, this.scaleY);
        this.scene.tweens.add({
          targets: ghost,
          alpha: 0,
          scaleX: ghost.scaleX * 0.8,
          scaleY: ghost.scaleY * 0.8,
          duration: 220,
          onComplete: () => ghost.destroy()
        });
      });
    }
  }

  handleAttacks(time) {
    const cam    = this.scene.cameras.main;
    const margin = 40; // small buffer so enemies just entering screen get targeted

    const enemies = this.scene.enemies.getChildren().filter(e =>
      e.active && !e._isDying &&
      e.x > cam.scrollX - margin && e.x < cam.scrollX + cam.width  + margin &&
      e.y > cam.scrollY - margin && e.y < cam.scrollY + cam.height + margin
    );
    if (enemies.length === 0) return;

    let nearest = null, minDist = Infinity;
    enemies.forEach(e => {
      const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
      if (d < minDist) { minDist = d; nearest = e; }
    });
    if (!nearest) return;

    this.weapons.forEach((weaponDef, idx) => {
      const key = weaponDef.id + '_' + idx;
      const lastFired = this.attackTimers[key] || 0;
      const effectiveCooldown = weaponDef.cooldown * (1 - this.passiveStats.cooldownReduction);
      if (time - lastFired >= effectiveCooldown) {
        this.attackTimers[key] = time;
        this.fireWeapon(weaponDef, nearest);
      }
    });
  }

  fireWeapon(weaponDef, target) {
    const shootSound = { magic_orb: 'shoot_orb', sword_slash: 'shoot_slash', arrow: 'shoot_arrow' };
    SoundManager.play(shootSound[weaponDef.id] || 'shoot_orb');

    // Apply damage multiplier from passives
    const boosted = Object.assign({}, weaponDef, {
      damage: Math.floor(weaponDef.damage * (1 + this.passiveStats.damageMultiplier))
    });

    if (boosted.special === 'nova')        { this._fireNova(boosted);              return; }
    if (boosted.special === 'boomerang')   { this._fireBoomerang(boosted, target); return; }
    if (boosted.special === 'spread3')     { this._fireSpread(boosted, target);    return; }
    if (boosted.special === 'holy_slash')  { boosted._holySlash = true; /* handled in combat */ }

    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    const proj  = new Projectile(this.scene, this.x, this.y, boosted);
    this.scene.projectiles.add(proj);
    proj.fire(Math.cos(angle) * weaponDef.projectileSpeed, Math.sin(angle) * weaponDef.projectileSpeed, angle);
  }

  _fireBoomerang(weaponDef, target) {
    // Only one boomerang active at a time per weapon slot
    const key = '_boom_' + this.weapons.indexOf(weaponDef);
    if (this[key]) return;
    this[key] = true;

    const proj  = new Projectile(this.scene, this.x, this.y, weaponDef);
    this.scene.projectiles.add(proj);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    proj.fire(Math.cos(angle) * weaponDef.projectileSpeed, Math.sin(angle) * weaponDef.projectileSpeed, angle);

    // Continuous spin while in flight
    this.scene.tweens.add({
      targets: proj,
      angle: 360,
      duration: 400,
      repeat: -1,
      ease: 'Linear'
    });

    // After half the lifetime, reverse toward player
    this.scene.time.delayedCall(weaponDef.lifetime * 0.5, () => {
      if (!proj.active || !this.active) { this[key] = false; return; }
      proj.hitEnemies.clear();
      const returnAngle = Phaser.Math.Angle.Between(proj.x, proj.y, this.x, this.y);
      proj.body.setVelocity(
        Math.cos(returnAngle) * weaponDef.projectileSpeed * 1.3,
        Math.sin(returnAngle) * weaponDef.projectileSpeed * 1.3
      );
      proj.setRotation(returnAngle + Math.PI);
    });

    proj.once('destroy', () => { this[key] = false; });
  }

  _fireNova(weaponDef) {
    // Visual expanding ring
    const ring = this.scene.add.graphics();
    ring.setPosition(this.x, this.y).setDepth(5);
    ring.lineStyle(4, 0xff6600, 0.9);
    ring.strokeCircle(0, 0, 14);
    ring.fillStyle(0xff3300, 0.12);
    ring.fillCircle(0, 0, 14);

    this.scene.tweens.add({
      targets: ring,
      scaleX: weaponDef.novaRadius / 14,
      scaleY: weaponDef.novaRadius / 14,
      alpha: 0,
      duration: 380,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy()
    });

    this.scene.juice.shake(120, 0.01);

    // Damage all enemies in range instantly
    const radius = weaponDef.novaRadius;
    this.scene.enemies.getChildren().forEach(enemy => {
      if (!enemy.active) return;
      if (Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) > radius) return;
      const died = enemy.takeDamage(weaponDef.damage);
      this.scene.juice.hitSpark(enemy.x, enemy.y, 0xff4400);
      if (died) {
        this.gainXP(enemy.xpValue);
        this.scene.registerKill();
        this.scene.juice.deathBurst(enemy.x, enemy.y, ENEMIES[enemy.enemyType].color);
        this.scene.juice.floatXP(enemy.x, enemy.y, enemy.xpValue);
        this.scene.combatSystem.spawnXPGem(enemy.x, enemy.y, enemy.xpValue);
      }
    });
  }

  _fireSpread(weaponDef, target) {
    const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    const spread    = Phaser.Math.DegToRad(weaponDef.spreadAngle || 18);
    [-spread, 0, spread].forEach(offset => {
      const proj  = new Projectile(this.scene, this.x, this.y, weaponDef);
      this.scene.projectiles.add(proj);
      const a = baseAngle + offset;
      proj.fire(Math.cos(a) * weaponDef.projectileSpeed, Math.sin(a) * weaponDef.projectileSpeed, a);
    });
  }

  handleRegen(delta) {
    if (this.regenRate <= 0 || this.hp >= this.maxHp) return;
    this.regenAccumulator += this.regenRate * (delta / 1000);
    if (this.regenAccumulator >= 1) {
      const healed = Math.floor(this.regenAccumulator);
      this.hp = Math.min(this.hp + healed, this.maxHp);
      this.regenAccumulator -= healed;
    }
  }

  gainXP(amount) {
    this.xp += Math.floor(amount * (1 + this.passiveStats.xpMultiplier));
    if (this.xp >= this.xpToNextLevel) {
      this.xp -= this.xpToNextLevel;
      this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.6);
      this.level++;
      this.scene.events.emit('player-levelup');
    }
  }

  takeDamage(amount) {
    if (this.hp <= 0) return; // already dead
    if (this.dashInvincible) return; // i-frames during dash

    // Shield absorbs one charge per hit
    if (this.shieldDurability > 0) {
      this.shieldDurability--;
      SoundManager.play('shield_block');
      if (this.scene.juice) {
        this.scene.juice.flash(80, 120, 255, 100);
        this.scene.juice.hitSpark(this.x, this.y, 0x4488ff);
        if (this.shieldDurability > 0) {
          this.scene.juice.floatText(this.x, this.y - 30, `SHIELD ${this.shieldDurability}/${this.shieldMax}`, '#4488ff', 16);
        } else {
          this.scene.juice.flash(255, 80, 0, 200);
          this.scene.juice.floatText(this.x, this.y - 30, 'SHIELD BROKEN', '#ff6600', 18);
        }
      }
      return;
    }

    this.hp -= amount;

    // Armor passive: reduce incoming damage
    if (this.passiveStats.damageReduction > 0) {
      const reduced = Math.max(1, Math.floor(amount * (1 - this.passiveStats.damageReduction)));
      const blocked = amount - reduced;
      if (blocked > 0 && this.scene.juice)
        this.scene.juice.floatText(this.x + 20, this.y - 20, `🛡 -${blocked}`, '#886622', 13);
      amount = reduced;
    }

    SoundManager.play('player_hit');

    // Flash red-white
    this.setTint(0xff4444);
    this.scene.time.delayedCall(130, () => {
      if (this.active) this.clearTint();
    });

    if (this.scene.juice) {
      const big = amount >= 20;
      big ? this.scene.juice.bigShake() : this.scene.juice.shake();
      this.scene.juice.floatDamage(this.x, this.y - 20, amount);
      if (big) this.scene.juice.flash(255, 50, 50, 100);
    }

    if (this.hp <= 0) {
      if (this.hasRevive) {
        this.hasRevive = false;
        this.hp = 50;
        if (this.scene.juice) {
          this.scene.juice.flash(255, 220, 50, 500);
          this.scene.juice.levelUpFanfare(this.x, this.y);
          this.scene.juice.floatText(this.x, this.y - 60, 'SECOND WIND!', '#FFD700', 22);
        }
        return;
      }
      this.hp = 0;
      this.scene.events.emit('player-dead');
    }
  }
}
