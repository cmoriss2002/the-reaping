class LeaderboardScene extends Phaser.Scene {
  constructor() { super('LeaderboardScene'); }

  create(data) {
    const W = this.scale.width, H = this.scale.height;
    const from = (data && data.from) || 'MainMenuScene';

    this.add.rectangle(W/2, H/2, W, H, 0x04040e);

    this.add.text(W/2, 48, '🏆  LEADERBOARD', {
      fontSize: '36px', fill: '#FFD700', fontStyle: 'bold',
      stroke: '#442200', strokeThickness: 4
    }).setOrigin(0.5);

    // Tabs
    const stats = ['wave', 'kills', 'level', 'time'];
    const labels = { wave: 'Wave', kills: 'Kills', level: 'Level', time: 'Time' };
    this._activeStat = stats[0];
    this._tabs = {};
    this._tabBgs = {};

    stats.forEach((s, i) => {
      const tx = W/2 - 210 + i * 140;
      const bg = this.add.rectangle(tx, 104, 124, 34, 0x1a2244)
        .setStrokeStyle(1, 0x4488cc).setInteractive({ useHandCursor: true });
      const txt = this.add.text(tx, 104, labels[s], {
        fontSize: '16px', fill: '#aabbcc', fontStyle: 'bold'
      }).setOrigin(0.5);
      this._tabs[s]   = txt;
      this._tabBgs[s] = bg;
      bg.on('pointerdown', () => this._switchTab(s));
    });

    // Table area
    this._tableContainer = this.add.container(0, 0);
    this._loadingText = this.add.text(W/2, H/2, 'Loading...', {
      fontSize: '18px', fill: '#446688'
    }).setOrigin(0.5);

    // Back button
    const back = this.add.rectangle(W/2, H - 36, 200, 40, 0x1a2233)
      .setStrokeStyle(1, 0x446688).setInteractive({ useHandCursor: true });
    this.add.text(W/2, H - 36, '← BACK', { fontSize: '18px', fill: '#aabbcc' }).setOrigin(0.5);
    back.on('pointerover', () => back.setFillStyle(0x2a3a55));
    back.on('pointerout',  () => back.setFillStyle(0x1a2233));
    back.on('pointerdown', () => this.scene.start(from));
    this.input.keyboard.once('keydown-ESC', () => this.scene.start(from));

    this._switchTab('wave');
    this.cameras.main.fadeIn(200, 0, 0, 0);
  }

  _switchTab(stat) {
    const W = this.scale.width;
    this._activeStat = stat;

    // Update tab highlight
    const labels = { wave: 'Wave', kills: 'Kills', level: 'Level', time: 'Time' };
    Object.keys(this._tabs).forEach(s => {
      this._tabBgs[s].setFillStyle(s === stat ? 0x2a4a8a : 0x1a2244);
      this._tabs[s].setStyle({ fill: s === stat ? '#ffffff' : '#aabbcc' });
    });

    this._loadingText.setVisible(true);
    this._tableContainer.removeAll(true);

    fetch(`/api/leaderboard?stat=${stat}`)
      .then(r => r.json())
      .then(rows => this._renderTable(rows, stat, W))
      .catch(() => {
        this._loadingText.setText('Failed to load.');
      });
  }

  _renderTable(rows, stat, W) {
    this._loadingText.setVisible(false);
    this._tableContainer.removeAll(true);

    const H = this.scale.height;
    const labels = { wave: 'Wave', kills: 'Kills', level: 'Level', time: 'Time' };
    const charColors = { knight: '#5588ff', mage: '#cc66ff', rogue: '#44ffaa' };
    const charIcons  = { knight: '🗡', mage: '🔮', rogue: '🏹' };

    if (rows.length === 0) {
      const t = this.add.text(W/2, H/2, 'No scores yet — be the first!', {
        fontSize: '18px', fill: '#445566'
      }).setOrigin(0.5);
      this._tableContainer.add(t);
      return;
    }

    // Header
    const headerY = 148;
    [['#', W/2 - 340], ['Name', W/2 - 270], ['Character', W/2 - 60], [labels[stat], W/2 + 200]].forEach(([label, x]) => {
      const t = this.add.text(x, headerY, label, { fontSize: '14px', fill: '#445566', fontStyle: 'bold' }).setOrigin(0, 0.5);
      this._tableContainer.add(t);
    });
    const line = this.add.rectangle(W/2, headerY + 16, W - 120, 1, 0x223344);
    this._tableContainer.add(line);

    rows.forEach((row, i) => {
      const y = 184 + i * 46;
      const rowBg = this.add.rectangle(W/2, y, W - 120, 40, i % 2 === 0 ? 0x0a0a18 : 0x0c0c1e);
      this._tableContainer.add(rowBg);

      const rankColor = i === 0 ? '#FFD700' : i === 1 ? '#aaaaaa' : i === 2 ? '#cc8844' : '#445566';
      const rank = this.add.text(W/2 - 340, y, `#${i + 1}`, { fontSize: '16px', fill: rankColor, fontStyle: 'bold' }).setOrigin(0, 0.5);

      const name = this.add.text(W/2 - 270, y, row.name, { fontSize: '17px', fill: '#ccdde8' }).setOrigin(0, 0.5);

      const charColor = charColors[row.character] || '#ffffff';
      const charIcon  = charIcons[row.character]  || '⚔';
      const charTxt = this.add.text(W/2 - 60, y, `${charIcon} ${row.character}`, { fontSize: '15px', fill: charColor }).setOrigin(0, 0.5);

      const val = stat === 'time'
        ? `${String(Math.floor(row.time / 60)).padStart(2, '0')}:${String(row.time % 60).padStart(2, '0')}`
        : String(row[stat]);
      const valTxt = this.add.text(W/2 + 200, y, val, { fontSize: '18px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5);

      this._tableContainer.add([rank, name, charTxt, valTxt]);
    });
  }
}
