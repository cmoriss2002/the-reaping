class EnemyProjectile extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, damage) {
    super(scene, x, y, 'enemy_arrow');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(18, 6);

    this.damage = damage;

    scene.time.delayedCall(2000, () => {
      if (this.active) this.destroy();
    });
  }

  fire(vx, vy, angle) {
    this.body.setVelocity(vx, vy);
    this.setRotation(angle);
  }

  destroy(fromScene) {
    if (this.body) this.body.setVelocity(0, 0);
    super.destroy(fromScene);
  }
}
