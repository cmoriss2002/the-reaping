class Projectile extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, weaponDef) {
    super(scene, x, y, weaponDef.texture || 'orb');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(weaponDef.bodySize || 14, weaponDef.bodySize || 14);

    this.damage    = weaponDef.damage;
    this.piercing  = weaponDef.piercing || false;
    this.hitEnemies = new Set();

    scene.time.delayedCall(weaponDef.lifetime, () => {
      if (this.active) this.destroy();
    });
  }

  fire(vx, vy, angle = 0) {
    this.body.setVelocity(vx, vy);
    this.setRotation(angle);
  }

  destroy(fromScene) {
    if (this.body) this.body.setVelocity(0, 0);
    super.destroy(fromScene);
  }
}
