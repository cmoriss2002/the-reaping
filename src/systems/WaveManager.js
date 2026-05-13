class WaveManager {
  constructor(scene) {
    this.scene = scene;
    this.wave = 0;
    this.betweenWaves = true;
    this.toSpawn = 0;
    this.spawned = 0;
    this.nextSpawnTime = 0;
    this.spawnDelay      = 450;
    this.nextWaveAt      = 0;
    this.countdownActive = false;
  }

  get isBossWave() { return this.wave % 5 === 0; }

  startWave() {
    this.wave++;
    this.betweenWaves = false;
    this.spawned = 0;

    if (this.isBossWave) {
      this.toSpawn = 0; // no regular enemies on boss waves
      // Brief pause then boss enters — no pre-announcement, entry IS the reveal
      this.scene.time.delayedCall(1500, () => this.spawnBoss());
    } else {
      this.toSpawn = 6 + this.wave * 3;
      this.nextSpawnTime = this.scene.time.now + 500;
      this.scene.showWaveAnnouncement(this.wave);
    }
  }

  spawnBoss() {
    this.scene._chapterBreak = false; // safety reset in case it got stuck
    const cam = this.scene.cameras.main;
    const x   = cam.scrollX + cam.width / 2;
    const y   = cam.scrollY - 80; // enter from top

    const boss = new Enemy(this.scene, x, y, 'lich');
    this.scene.enemies.add(boss);
    this.scene.currentBoss = boss;
    this.toSpawn = 1;
    this.spawned = 1;

    // Single combined entry event — flash, shake, name banner, then HP bar
    this.scene.juice.flash(80, 0, 255, 500);
    this.scene.juice.bigShake();
    MusicManager.play('boss');

    // Show "THE LICH" name banner centred on screen, then slide it up to become the HP bar header
    this.scene.showBossEntry(boss);
  }

  get allSpawned() {
    return this.spawned >= this.toSpawn;
  }

  spawnOneEnemy() {
    const cam  = this.scene.cameras.main;
    const pad  = 100;
    const left = cam.scrollX - pad;
    const top  = cam.scrollY - pad;
    const W    = cam.width  + pad * 2;
    const H    = cam.height + pad * 2;

    const edge = Phaser.Math.Between(0, 3);
    let x, y;
    if      (edge === 0) { x = left + Phaser.Math.Between(0, W); y = top - 20; }
    else if (edge === 1) { x = left + W + 20;                     y = top + Phaser.Math.Between(0, H); }
    else if (edge === 2) { x = left + Phaser.Math.Between(0, W); y = top + H + 20; }
    else                 { x = left - 20;                          y = top + Phaser.Math.Between(0, H); }

    // Clamp to world
    const wb = this.scene.physics.world.bounds;
    x = Phaser.Math.Clamp(x, wb.x + 40, wb.right  - 40);
    y = Phaser.Math.Clamp(y, wb.y + 40, wb.bottom - 40);

    const type  = this.pickEnemyType();
    const enemy = new Enemy(this.scene, x, y, type);

    // Scale stats with wave + elapsed run time (soft difficulty ramp)
    const minutes  = (Date.now() - this.scene.stats.startTime) / 60000;
    const waveMult = 1 + (this.wave - 1) * 0.08;   // +8% per wave
    const timeMult = 1 + minutes * 0.04;             // +4% per minute survived

    enemy.maxHp  = Math.floor(enemy.maxHp  * waveMult * timeMult);
    enemy.hp     = enemy.maxHp;
    enemy.speed  = Math.floor(enemy.speed  * Math.min(waveMult * timeMult, 2.2)); // cap at 2.2×
    enemy.damage = Math.floor(enemy.damage * waveMult);

    // 15% chance to be elite from wave 2 onwards
    if (this.wave >= 2 && Math.random() < 0.15) {
      enemy.makeElite();
      // Show brief "ELITE!" notice near spawn
      this.scene.juice.floatText(
        enemy.x, enemy.y - 30, '★ ELITE', '#ffdd33', 16
      );
    }

    this.scene.enemies.add(enemy);
    this.spawned++;
  }

  pickEnemyType() {
    const pool = Object.keys(ENEMIES).filter(k => {
      if (k === 'lich')             return false;        // boss only
      if (k === 'dragon')           return this.wave >= 5;
      if (k === 'troll')            return this.wave >= 5;
      if (k === 'skeleton_charger') return this.wave >= 4;
      if (k === 'skeleton')         return this.wave >= 3;
      if (k === 'dark_mage')        return this.wave >= 3;
      if (k === 'goblin_archer')    return this.wave >= 2;
      if (k === 'bat')              return this.wave >= 2;
      return true;
    });
    const totalWeight = pool.reduce((s, k) => s + ENEMIES[k].spawnWeight, 0);
    let r = Math.random() * totalWeight;
    for (const k of pool) {
      r -= ENEMIES[k].spawnWeight;
      if (r <= 0) return k;
    }
    return pool[0];
  }

  update() {
    const now = this.scene.time.now;

    if (!this.betweenWaves && !this.allSpawned) {
      if (now >= this.nextSpawnTime) {
        this.spawnOneEnemy();
        this.nextSpawnTime = now + this.spawnDelay;
      }
    }

    if (!this.betweenWaves && this.allSpawned) {
      const alive = this.scene.enemies.getChildren().filter(e => e.active).length;
      if (alive === 0) {
        // Boss waves are handled entirely by onBossDied() — skip the normal clear
        if (this.isBossWave) return;
        this.betweenWaves    = true;
        this.nextWaveAt      = now + 2800;
        this.countdownActive = true;
        SoundManager.play('wave_clear');
      }
    }

    if (this.betweenWaves && this.countdownActive) {
      const remaining = Math.ceil((this.nextWaveAt - now) / 1000);
      if (this.scene.countdownText) {
        this.scene.countdownText.setText(remaining > 0 ? `Next wave in ${remaining}…` : '');
      }
      if (now >= this.nextWaveAt) {
        this.countdownActive = false;
        if (this.scene.countdownText) this.scene.countdownText.setText('');
        this.startWave();
      }
    }
  }
}
