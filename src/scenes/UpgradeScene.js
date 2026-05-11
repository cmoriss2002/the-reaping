class UpgradeScene extends Phaser.Scene {
  constructor() { super('UpgradeScene'); }

  create(data) {
    const W = this.scale.width, H = this.scale.height;

    // Dark overlay
    this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.75);

    this.add.text(W/2, 100, 'LEVEL UP!', {
      fontSize: '52px', fill: '#FFD700', fontStyle: 'bold',
      stroke: '#884400', strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(W/2, 165, 'Choose an upgrade', {
      fontSize: '22px', fill: '#aaaaaa'
    }).setOrigin(0.5);

    const cardW = 230, cardH = 280;
    const totalW = data.choices.length * cardW + (data.choices.length - 1) * 30;
    const startX = W/2 - totalW/2 + cardW/2;

    const rarityColors = { common: 0x4488cc, uncommon: 0x44aa44, rare: 0xaa44cc };
    const isPassive = (upg) => upg._type === 'passive';
    const rarityLabels = { common: 'COMMON', uncommon: 'UNCOMMON', rare: 'RARE' };

    data.choices.forEach((upgrade, i) => {
      const cx = startX + i * (cardW + 30);
      const cy = H/2 + 20;

      const rColor = rarityColors[upgrade.rarity] || 0x4488cc;

      // Card background
      const card = this.add.rectangle(cx, cy, cardW, cardH, 0x1a1a2e)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, rColor);

      // Rarity badge (passives show ITEM instead of rarity)
      const badgeLabel = isPassive(upgrade) ? 'ITEM' : (rarityLabels[upgrade.rarity] || 'COMMON');
      const badgeColor = isPassive(upgrade) ? upgrade.color : rColor;
      this.add.rectangle(cx, cy - cardH/2 + 18, cardW, 36, badgeColor, 0.9);
      this.add.text(cx, cy - cardH/2 + 18, badgeLabel, {
        fontSize: '13px', fill: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5);

      // Tier indicator for passives
      if (isPassive(upgrade) && upgrade._tier > 0) {
        this.add.text(cx, cy - cardH/2 + 30, `TIER ${upgrade._tier} → ${upgrade._tier + 1}`, {
          fontSize: '10px', fill: '#ffee88'
        }).setOrigin(0.5);
      }

      // Icon label (big text)
      this.add.text(cx, cy - 60, upgrade.icon, {
        fontSize: '36px', fill: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5);

      // Upgrade name
      this.add.text(cx, cy + 10, upgrade.name, {
        fontSize: '20px', fill: '#FFD700', fontStyle: 'bold'
      }).setOrigin(0.5);

      // Description
      this.add.text(cx, cy + 60, upgrade.description, {
        fontSize: '15px', fill: '#cccccc',
        align: 'center',
        wordWrap: { width: cardW - 20 }
      }).setOrigin(0.5);

      // Hover/click
      card.on('pointerover', () => {
        card.setFillStyle(0x2a2a4e);
        card.setStrokeStyle(3, 0xffffff);
      });
      card.on('pointerout', () => {
        card.setFillStyle(0x1a1a2e);
        card.setStrokeStyle(2, rColor);
      });
      card.on('pointerdown', () => {
        data.gameScene.upgradeManager.applyUpgrade(upgrade.id, data.gameScene.player);
        this.scene.stop('UpgradeScene');
        this.scene.resume('GameScene');
      });

      // Slide-in animation
      card.setAlpha(0);
      card.x += 30;
      this.tweens.add({
        targets: card,
        alpha: 1,
        x: cx,
        duration: 200 + i * 80,
        ease: 'Quad.easeOut'
      });
    });

    // Keyboard shortcut hint
    this.add.text(W/2, H - 50, 'Click a card to choose', {
      fontSize: '15px', fill: '#555577'
    }).setOrigin(0.5);
  }
}
