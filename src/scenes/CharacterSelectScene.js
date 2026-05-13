class CharacterSelectScene extends Phaser.Scene {
  constructor() { super('CharacterSelectScene'); }

  create() {
    const W = this.scale.width, H = this.scale.height;

    this.add.rectangle(W/2, H/2, W, H, 0x0d0d1a);
    for (let i = 0; i < 60; i++) {
      this.add.circle(
        Phaser.Math.Between(0, W), Phaser.Math.Between(0, H),
        Math.random() < 0.8 ? 1 : 2, 0xffffff, Math.random() * 0.5 + 0.2
      );
    }

    MetaProgress.load();

    this.add.text(W/2, 55, 'CHOOSE YOUR HERO', {
      fontSize: '40px', fill: '#FFD700', fontStyle: 'bold',
      stroke: '#442200', strokeThickness: 4
    }).setOrigin(0.5);

    const chars = [
      {
        id: 'knight', name: 'Knight',
        color: 0x3366cc, borderColor: 0x88aaff,
        trait: 'Tough melee fighter.\nPierces groups of enemies.',
        stats: ['HP:     140  (Highest)', 'Speed:  175  (Slow)', 'Weapon: Sword Slash'],
        statBars: { HP: 1.0, Speed: 0.55, Power: 0.75 }
      },
      {
        id: 'mage', name: 'Mage',
        color: 0x7722cc, borderColor: 0xcc66ff,
        trait: 'Glass cannon.\nHighest single-shot damage.',
        stats: ['HP:     80   (Low)', 'Speed:  200  (Normal)', 'Weapon: Magic Orb +40% dmg'],
        statBars: { HP: 0.45, Speed: 0.70, Power: 1.0 }
      },
      {
        id: 'rogue', name: 'Rogue',
        color: 0x226644, borderColor: 0x44ffaa,
        trait: 'High mobility, rapid fire.\nKite enemies to survive.',
        stats: ['HP:     80   (Low)', 'Speed:  245  (Fastest)', 'Weapon: Arrow  -25% cooldown'],
        statBars: { HP: 0.45, Speed: 1.0, Power: 0.60 }
      }
    ];

    const cardW = 300, cardH = 460, gap = 24;
    const totalW = chars.length * cardW + (chars.length - 1) * gap;
    const startX = W / 2 - totalW / 2 + cardW / 2;
    const cardCY = H / 2 + 20;
    const BAR_W = 160, BAR_LEFT = -BAR_W / 2;

    chars.forEach((char, i) => {
      const cx  = startX + i * (cardW + gap);
      const top = cardCY - cardH / 2;

      const card = this.add.rectangle(cx, cardCY, cardW, cardH, 0x12122a)
        .setStrokeStyle(2, char.borderColor)
        .setInteractive({ useHandCursor: true });

      const preview = this.add.sprite(cx, top + 95, 'player_' + char.id).setScale(2.6);

      this.add.text(cx, top + 175, char.name, {
        fontSize: '26px', fill: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5);

      this.add.text(cx, top + 215, char.trait, {
        fontSize: '13px', fill: '#9999bb', align: 'center', lineSpacing: 4
      }).setOrigin(0.5);

      Object.entries(char.statBars).forEach(([label, pct], si) => {
        const by = top + 268 + si * 30;
        this.add.text(cx + BAR_LEFT - 10, by, label, { fontSize: '12px', fill: '#7777aa' }).setOrigin(1, 0.5);
        this.add.rectangle(cx + BAR_LEFT + BAR_W/2, by, BAR_W, 8, 0x222244).setOrigin(0.5, 0.5);
        this.add.rectangle(cx + BAR_LEFT, by, Math.min(pct, 1) * BAR_W, 6, char.color).setOrigin(0, 0.5);
      });

      char.stats.forEach((line, li) => {
        this.add.text(cx, top + 370 + li * 22, line, {
          fontSize: '13px', fill: '#aaaacc', fontFamily: 'monospace'
        }).setOrigin(0.5);
      });

      card.on('pointerover', () => { card.setFillStyle(0x1e1e3a); card.setStrokeStyle(3, 0xffffff); preview.setScale(2.9); });
      card.on('pointerout',  () => { card.setFillStyle(0x12122a); card.setStrokeStyle(2, char.borderColor); preview.setScale(2.6); });
      card.on('pointerdown', () => {
        this.cameras.main.fadeOut(220, 0, 0, 0);
        this.time.delayedCall(220, () => this.scene.start('GameScene', { charType: char.id }));
      });

      const origX = cx;
      card.setAlpha(0).setX(cx + 30);
      preview.setAlpha(0).setX(cx + 30);
      this.tweens.add({ targets: [card, preview], alpha: 1, x: origX, duration: 220 + i * 70, ease: 'Quad.easeOut' });
    });

    const backBg = this.add.rectangle(60, 36, 110, 44, 0x111122)
      .setStrokeStyle(1, 0x445566).setInteractive({ useHandCursor: true });
    const back = this.add.text(60, 36, '← Back', { fontSize: '17px', fill: '#8899bb' }).setOrigin(0.5);
    backBg.on('pointerover', () => { backBg.setFillStyle(0x1a2233); back.setStyle({ fill: '#aabbdd' }); });
    backBg.on('pointerout',  () => { backBg.setFillStyle(0x111122); back.setStyle({ fill: '#8899bb' }); });
    backBg.on('pointerdown', () => this.scene.start('MainMenuScene'));

    this.cameras.main.fadeIn(280, 0, 0, 0);
  }
}
