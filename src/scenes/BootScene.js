class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    const W = this.scale.width, H = this.scale.height;
    const bg  = this.add.graphics();
    const bar = this.add.graphics();
    bg.fillStyle(0x333333).fillRect(W/2 - 200, H/2 - 15, 400, 30);
    this.load.on('progress', v => {
      bar.clear().fillStyle(0x4488ff).fillRect(W/2 - 200, H/2 - 15, 400 * v, 30);
    });
    this.add.text(W/2, H/2 - 50, 'Loading...', { fontSize: '20px', fill: '#ffffff' }).setOrigin(0.5);
  }

  create() {
    TextureFactory.generate(this);
    SoundManager.init();
    SettingsScene.loadVolumes(); // restore saved music/sfx volumes
    this.scene.start('MainMenuScene');
  }
}
