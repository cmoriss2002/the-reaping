class CombatSystem {
  constructor(scene) {
    this.scene = scene;
  }

  setup() {
    this.scene.physics.add.overlap(
      this.scene.projectiles,
      this.scene.enemies,
      (proj, enemy) => this.onProjectileHitEnemy(proj, enemy)
    );
  }

  onProjectileHitEnemy(proj, enemy) {
    if (!proj.active || !enemy.active) return;
    if (proj.hitEnemies.has(enemy)) return;
    proj.hitEnemies.add(enemy);

    const juice = this.scene.juice;

    SoundManager.play('hit');

    // Hit spark at impact point
    juice.hitSpark(enemy.x, enemy.y, 0xffffff);

    // Floating damage number
    juice.floatDamage(enemy.x, enemy.y - 10, proj.damage);

    // Knockback: push enemy away from projectile source
    const angle = Phaser.Math.Angle.Between(proj.x, proj.y, enemy.x, enemy.y);
    const knockDist = 40;
    if (enemy.body) {
      const prevVx = enemy.body.velocity.x;
      const prevVy = enemy.body.velocity.y;
      enemy.body.setVelocity(
        prevVx + Math.cos(angle) * knockDist * 8,
        prevVy + Math.sin(angle) * knockDist * 8
      );
      // Restore chase velocity after brief knockback
      this.scene.time.delayedCall(80, () => {
        if (enemy.active && enemy.body) {
          enemy.body.setVelocity(prevVx, prevVy);
        }
      });
    }

    const died = enemy.takeDamage(proj.damage);

    if (!proj.piercing) {
      proj.destroy();
    }

    // Knockback passive
    if (this.scene.player.passiveStats.knockback > 0 && enemy.active && enemy.body) {
      const kb = this.scene.player.passiveStats.knockback * 180;
      const kbAngle = Phaser.Math.Angle.Between(this.scene.player.x, this.scene.player.y, enemy.x, enemy.y);
      enemy.body.setVelocity(Math.cos(kbAngle) * kb, Math.sin(kbAngle) * kb);
    }

    if (died) {
      // Holy Blade: heal 5 HP on kill
      if (proj._holySlash) {
        this.scene.player.hp = Math.min(this.scene.player.hp + 5, this.scene.player.maxHp);
        this.scene.juice.floatText(this.scene.player.x, this.scene.player.y - 30, '+5 HP', '#ffffaa', 14);
      }
      // Vampiric Fang: heal on kill
      const heal = this.scene.player.passiveStats.killHeal;
      if (heal > 0) {
        this.scene.player.hp = Math.min(this.scene.player.hp + heal, this.scene.player.maxHp);
        if (heal >= 4) this.scene.juice.floatText(enemy.x, enemy.y - 30, `+${heal} HP`, '#44ff44', 14);
      }

      SoundManager.play('enemy_death');
      const color = ENEMIES[enemy.enemyType] ? ENEMIES[enemy.enemyType].color : 0xffffff;
      juice.deathBurst(enemy.x, enemy.y, color);

      // XP bonus for kill streak (3+ streak = +10% per extra kill)
      const streakBonus = this.scene.streak >= 3
        ? 1 + (this.scene.streak - 2) * 0.10 : 1;
      this.scene.player.gainXP(Math.floor(enemy.xpValue * streakBonus));
      this.scene.registerKill();

      // Floating XP
      juice.floatXP(enemy.x, enemy.y - 20, enemy.xpValue);

      this.spawnXPGem(enemy.x, enemy.y, enemy.xpValue);

      // Health drops: tiered by enemy type
      // Boss: guaranteed 35 HP; elites: guaranteed 20 HP; regulars: 8% chance 10 HP
      if (enemy.enemyType === 'lich') {
        this.spawnHealthDrop(enemy.x, enemy.y, 35);
      } else if (enemy.isElite) {
        this.spawnHealthDrop(enemy.x, enemy.y, 20);
      } else if (Math.random() < 0.08) {
        this.spawnHealthDrop(enemy.x, enemy.y, 10);
      }

      // Boss killed — updateBossBar() detects .active=false and clears the bar;
      // trigger chapter break after it has a frame to clean up
      if (enemy.enemyType === 'lich') {
        // Wait for death animation (~1.5s) then trigger chapter break
        this.scene.time.delayedCall(3600, () => this.scene.onBossDied());
      }
    }
  }

  spawnHealthDrop(x, y, healAmount = 10) {
    const scale = healAmount >= 30 ? 1.6 : healAmount >= 18 ? 1.2 : 0.85;
    const heart = this.scene.add.sprite(x, y, 'heart_pickup').setDepth(4).setScale(scale);
    heart.healAmount = healAmount;
    const angle  = Math.random() * Math.PI * 2;
    const dist   = 18 + Math.random() * 20;
    this.scene.tweens.add({
      targets: heart,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      duration: 200,
      ease: 'Quad.easeOut',
      onComplete: () => {
        // Bob gently after landing
        this.scene.tweens.add({
          targets: heart,
          y: heart.y - 5,
          duration: 550,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });
    // Pulse glow tween
    this.scene.tweens.add({
      targets: heart,
      alpha: { from: 1, to: 0.65 },
      duration: 700,
      yoyo: true,
      repeat: -1
    });
    this.scene.healthDrops.push(heart);
  }

  spawnXPGem(x, y, value) {
    const gem = this.scene.add.sprite(x, y, 'xp_gem');
    gem.xpValue  = value;
    gem._pulsing = false;

    const angle   = Math.random() * Math.PI * 2;
    const dist    = 20 + Math.random() * 24;
    this.scene.tweens.add({
      targets: gem,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      duration: 180,
      ease: 'Quad.easeOut'
    });

    this.scene.xpGems.push(gem);
  }
}
