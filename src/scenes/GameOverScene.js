class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  create(data) {
    const W = this.scale.width, H = this.scale.height;

    this.add.rectangle(W/2, H/2, W, H, 0x0a0a0a);

    // Dramatic title
    this.add.text(W/2, 130, 'YOU DIED', {
      fontSize: '80px', fill: '#cc1111', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5);

    // Stats panel
    const panelX = W/2, panelY = 360;
    this.add.rectangle(panelX, panelY, 400, 240, 0x1a1a2e, 0.9)
      .setStrokeStyle(2, 0x444466);

    const mins = Math.floor(data.time / 60).toString().padStart(2, '0');
    const secs = (data.time % 60).toString().padStart(2, '0');

    const rows = [
      ['Wave Reached', `${data.wave}`],
      ['Level',        `${data.level}`],
      ['Kills',        `${data.kills}`],
      ['Time Survived', `${mins}:${secs}`],
    ];

    rows.forEach(([label, value], i) => {
      const y = panelY - 80 + i * 54;
      this.add.text(panelX - 150, y, label, { fontSize: '20px', fill: '#888899' }).setOrigin(0, 0.5);
      this.add.text(panelX + 150, y, value, { fontSize: '22px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(1, 0.5);
    });

    // Rank
    const rank = this.getRank(data.kills, data.wave);
    this.add.text(W/2, 530, rank.label, {
      fontSize: '28px', fill: rank.color, fontStyle: 'bold'
    }).setOrigin(0.5);

    // Restart button
    const btn = this.add.rectangle(W/2, 625, 260, 56, 0x224488)
      .setInteractive({ useHandCursor: true });
    const btnText = this.add.text(W/2, 625, 'TRY AGAIN', {
      fontSize: '26px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setFillStyle(0x4488cc));
    btn.on('pointerout',  () => btn.setFillStyle(0x224488));
    btn.on('pointerdown', () => this.scene.start('MainMenuScene'));

    // Fade in
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  getRank(kills, wave) {
    if (wave >= 10 && kills >= 200) return { label: '★ LEGENDARY ★', color: '#FFD700' };
    if (wave >= 7  && kills >= 100) return { label: '✦ EPIC ✦',      color: '#cc44ff' };
    if (wave >= 5  && kills >= 50)  return { label: '◆ RARE ◆',       color: '#4488ff' };
    if (wave >= 3  && kills >= 20)  return { label: '◇ COMMON ◇',     color: '#44cc44' };
    return { label: '☆ NOVICE ☆', color: '#aaaaaa' };
  }
}
