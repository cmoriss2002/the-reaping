class JuiceManager {
  constructor(scene) {
    this.scene = scene;
    this.lowHpVignette = null;
    this.setupVignette();
  }

  // ── Screen shake ─────────────────────────────────────────────────────────
  shake(duration = 120, intensity = 0.012) {
    this.scene.cameras.main.shake(duration, intensity);
  }

  bigShake() {
    this.shake(200, 0.025);
  }

  // ── Camera flash ─────────────────────────────────────────────────────────
  flash(r = 255, g = 255, b = 255, duration = 80) {
    this.scene.cameras.main.flash(duration, r, g, b, 0.35);
  }

  // ── Enemy death burst ────────────────────────────────────────────────────
  deathBurst(x, y, color) {
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle  = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const dist   = 30 + Math.random() * 40;
      const radius = 3 + Math.random() * 4;
      const speed  = 0.25 + Math.random() * 0.2;

      const particle = this.scene.add.circle(x, y, radius, color, 1);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: 350 * speed + 150,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy()
      });
    }

    // Central flash ring
    const ring = this.scene.add.circle(x, y, 4, 0xffffff, 0.9);
    this.scene.tweens.add({
      targets: ring,
      scaleX: 5, scaleY: 5,
      alpha: 0,
      duration: 220,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy()
    });
  }

  // ── Hit spark (smaller than death burst) ────────────────────────────────
  hitSpark(x, y, color = 0xffffff) {
    const count = 4;
    for (let i = 0; i < count; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const dist   = 8 + Math.random() * 14;
      const radius = 2 + Math.random() * 2;

      const p = this.scene.add.circle(x, y, radius, color, 0.9);
      this.scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        scaleX: 0, scaleY: 0,
        alpha: 0,
        duration: 180,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }

  // ── Floating text (damage numbers, XP popups) ───────────────────────────
  floatText(x, y, text, color = '#ffffff', size = 18) {
    const t = this.scene.add.text(x + (Math.random() - 0.5) * 20, y, text, {
      fontSize: size + 'px',
      fill: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 1).setDepth(30);

    this.scene.tweens.add({
      targets: t,
      y: y - 55,
      alpha: 0,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 700,
      ease: 'Quad.easeOut',
      onComplete: () => t.destroy()
    });
  }

  floatDamage(x, y, amount) {
    this.floatText(x, y, '-' + amount, '#ff4444', 16);
  }

  floatXP(x, y, amount) {
    this.floatText(x, y - 20, '+' + amount + ' XP', '#44ffaa', 14);
  }

  // ── Level-up fanfare ─────────────────────────────────────────────────────
  levelUpFanfare(x, y) {
    this.flash(100, 220, 100, 150);

    // Ring of gold particles expanding outward
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const p = this.scene.add.circle(x, y, 5, 0xFFD700, 1).setDepth(25);
      this.scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * 90,
        y: y + Math.sin(angle) * 90,
        scaleX: 0, scaleY: 0,
        alpha: 0,
        duration: 500,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy()
      });
    }

    this.floatText(x, y - 30, 'LEVEL UP!', '#FFD700', 22);
  }

  // ── Wave clear fanfare ───────────────────────────────────────────────────
  waveClearFanfare() {
    this.flash(180, 180, 60, 200);
    this.shake(80, 0.006);
  }

  // ── Low-HP vignette (red edge glow when HP < 30%) ────────────────────────
  setupVignette() {
    const W = this.scene.scale.width, H = this.scene.scale.height;
    this.lowHpVignette = this.scene.add.graphics().setDepth(498).setScrollFactor(0);
    this._vignetteAlpha = 0;
    this._vignettePulse = 0;
  }

  updateVignette(hp, maxHp) {
    const pct = hp / maxHp;
    if (pct > 0.35) {
      this._vignetteAlpha = Math.max(0, this._vignetteAlpha - 0.05);
    } else {
      this._vignettePulse += 0.05;
      const target = (1 - pct / 0.35) * 0.6;
      this._vignetteAlpha = target * (0.6 + 0.4 * Math.sin(this._vignettePulse));
    }

    if (this._vignetteAlpha < 0.01) {
      this.lowHpVignette.clear();
      return;
    }

    const W = this.scene.scale.width, H = this.scene.scale.height;
    const size = 120;
    this.lowHpVignette.clear();

    // Draw red border rectangles
    this.lowHpVignette.fillStyle(0xff0000, this._vignetteAlpha);
    this.lowHpVignette.fillRect(0, 0, W, size);          // top
    this.lowHpVignette.fillRect(0, H - size, W, size);   // bottom
    this.lowHpVignette.fillRect(0, 0, size, H);           // left
    this.lowHpVignette.fillRect(W - size, 0, size, H);    // right
  }

  // ── XP gem zoom-in effect when attracted ─────────────────────────────────
  pulseGem(gem) {
    if (gem._pulsing) return;
    gem._pulsing = true;
    this.scene.tweens.add({
      targets: gem,
      scaleX: 1.6, scaleY: 1.6,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => { gem._pulsing = false; }
    });
  }
}
