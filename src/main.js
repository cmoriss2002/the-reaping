const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#0d0d1a',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  fps: { target: 30, forceSetTimeOut: true },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [BootScene, MainMenuScene, CharacterSelectScene, GameScene, UpgradeScene, PauseScene, CampOverlayScene, SettingsScene, CampfireScene, GameOverScene]
};

const game = new Phaser.Game(config);

// Unlock Web Audio on first user interaction (browser policy)
document.addEventListener('click', function unlock() {
  SoundManager.resume();
  document.removeEventListener('click', unlock);
}, { once: true });
