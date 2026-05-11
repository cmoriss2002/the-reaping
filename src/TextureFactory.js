var TextureFactory = {
  generate(scene) {
    this.makeSlime(scene);
    this.makeGoblin(scene);
    this.makeGoblinArcher(scene);
    this.makeBat(scene);
    this.makeDarkMage(scene);
    this.makeTroll(scene);
    this.makeSkeleton(scene);
    this.makeSkeletonCharger(scene);
    this.makeDragon(scene);
    this.makePlayerKnight(scene);
    this.makePlayerMage(scene);
    this.makePlayerRogue(scene);
    this.makeOrb(scene);
    this.makeArrow(scene);
    this.makeSlash(scene);
    this.makeXpGem(scene);
    this.makeHeartPickup(scene);
    this.makeEnemyArrow(scene);
    this.makeBoomerang(scene);
    this.makeDagger(scene);
    this.makeBossOrb(scene);
    this.makeLich(scene);
    // World objects
    this.makeTreePine(scene);
    this.makeTreeRound(scene);
    this.makeRockLarge(scene);
    this.makeRockSmall(scene);
    this.makeGravestone(scene);
    this.makePillarBroken(scene);
    this.makeTorch(scene);
    this.makeBush(scene);
    this.makeBonePile(scene);
    this.makeBarrel(scene);
  },

  _g(scene) {
    const g = scene.add.graphics();
    g.clear();
    return g;
  },

  makeSlime(scene) {
    const g = this._g(scene);
    // Body — wide lime-green blob
    g.fillStyle(0x33cc44, 1);
    g.fillEllipse(20, 16, 38, 30);
    // Highlight
    g.fillStyle(0x66ff77, 0.5);
    g.fillEllipse(14, 10, 16, 10);
    // Eyes
    g.fillStyle(0xffffff, 1);
    g.fillCircle(12, 13, 5);
    g.fillCircle(28, 13, 5);
    g.fillStyle(0x111111, 1);
    g.fillCircle(13, 14, 2.5);
    g.fillCircle(29, 14, 2.5);
    g.generateTexture('slime', 40, 30);
    g.destroy();
  },

  makeGoblin(scene) {
    const g = this._g(scene);
    // Body
    g.fillStyle(0xcc5500, 1);
    g.fillEllipse(22, 30, 28, 22);
    // Head
    g.fillStyle(0xdd6600, 1);
    g.fillCircle(22, 16, 14);
    // Ears (triangles via points)
    g.fillStyle(0xdd6600, 1);
    g.fillTriangle(6, 10, 10, 20, 14, 12);
    g.fillTriangle(38, 10, 34, 20, 30, 12);
    // Eyes
    g.fillStyle(0xffee00, 1);
    g.fillCircle(16, 14, 4);
    g.fillCircle(28, 14, 4);
    g.fillStyle(0x111111, 1);
    g.fillCircle(17, 15, 2);
    g.fillCircle(29, 15, 2);
    // Mouth / tusks
    g.fillStyle(0xffffff, 1);
    g.fillRect(17, 22, 3, 5);
    g.fillRect(24, 22, 3, 5);
    g.generateTexture('goblin', 44, 44);
    g.destroy();
  },

  makeGoblinArcher(scene) {
    const g = this._g(scene);
    // Body (slightly slimmer — more agile)
    g.fillStyle(0x994400, 1);
    g.fillEllipse(22, 30, 24, 20);
    // Head
    g.fillStyle(0xbb5500, 1);
    g.fillCircle(22, 16, 12);
    // Ears
    g.fillStyle(0xbb5500, 1);
    g.fillTriangle(8, 10, 12, 19, 14, 11);
    g.fillTriangle(36, 10, 32, 19, 30, 11);
    // Eyes — focused/squinting (archers aim)
    g.fillStyle(0xffcc00, 1);
    g.fillCircle(16, 14, 3);
    g.fillCircle(27, 14, 3);
    g.fillStyle(0x111111, 1);
    g.fillCircle(17, 14, 2);
    g.fillCircle(28, 14, 2);
    // Hood/cap
    g.fillStyle(0x552200, 1);
    g.fillTriangle(10, 10, 22, 0, 34, 10);
    // Bow (right side)
    g.lineStyle(3, 0x886633, 1);
    g.strokeEllipse(36, 22, 10, 28);
    // Bowstring
    g.lineStyle(1, 0xddddaa, 1);
    g.lineBetween(36, 8, 36, 36);
    // Arrow nocked
    g.fillStyle(0xaaccee, 1);
    g.fillRect(30, 20, 12, 2);
    g.generateTexture('goblin_archer', 44, 44);
    g.destroy();
  },

  makeSkeletonCharger(scene) {
    const g = this._g(scene);
    // Torso — darker, more cracked
    g.fillStyle(0xbbbb99, 1);
    g.fillRect(13, 22, 20, 28);
    // Ribs (angular/cracked)
    g.fillStyle(0x665544, 1);
    for (let i = 0; i < 4; i++) g.fillRect(13, 24 + i * 7, 20, 2);
    // Skull — cracked, lower jaw visible
    g.fillStyle(0xddddaa, 1);
    g.fillCircle(23, 14, 13);
    g.fillRect(16, 18, 14, 8);
    // Cracked eye sockets (larger, angrier)
    g.fillStyle(0x111111, 1);
    g.fillEllipse(16, 12, 9, 10);
    g.fillEllipse(30, 12, 9, 10);
    // Glowing red eyes (charged up energy)
    g.fillStyle(0xff2200, 1);
    g.fillCircle(16, 12, 3);
    g.fillCircle(30, 12, 3);
    // Crack on skull
    g.lineStyle(1, 0x554433, 1);
    g.lineBetween(23, 4, 20, 14);
    // Shoulder spikes
    g.fillStyle(0x998877, 1);
    g.fillTriangle(8, 22, 13, 22, 10, 14);
    g.fillTriangle(38, 22, 33, 22, 36, 14);
    g.generateTexture('skeleton_charger', 48, 52);
    g.destroy();
  },

  makeBat(scene) {
    const g = this._g(scene);
    // Wings
    g.fillStyle(0x2a1144, 1);
    g.fillTriangle(0, 14, 12, 6, 14, 18);
    g.fillTriangle(28, 14, 16, 6, 14, 18);
    // Body
    g.fillStyle(0x441166, 1);
    g.fillEllipse(14, 16, 16, 14);
    // Eyes
    g.fillStyle(0xff2200, 1);
    g.fillCircle(10, 13, 3);
    g.fillCircle(18, 13, 3);
    g.fillStyle(0xff6600, 0.8);
    g.fillCircle(10, 13, 1.5);
    g.fillCircle(18, 13, 1.5);
    // Ears
    g.fillStyle(0x2a1144, 1);
    g.fillTriangle(8, 8, 11, 2, 14, 8);
    g.fillTriangle(20, 8, 17, 2, 14, 8);
    g.generateTexture('bat', 28, 22);
    g.destroy();
  },

  makeDarkMage(scene) {
    const g = this._g(scene);
    // Robe
    g.fillStyle(0x1a0033, 1);
    g.fillEllipse(20, 44, 30, 24);
    g.fillRect(6, 26, 28, 24);
    // Hat
    g.fillStyle(0x110022, 1);
    g.fillTriangle(20, 2, 8, 20, 32, 20);
    g.fillRect(4, 18, 32, 6);
    // Face
    g.fillStyle(0x334455, 1);
    g.fillCircle(20, 24, 10);
    // Glowing eyes
    g.fillStyle(0xcc00ff, 1);
    g.fillCircle(15, 22, 4);
    g.fillCircle(25, 22, 4);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(14, 21, 1.5);
    g.fillCircle(24, 21, 1.5);
    // Magic staff (left hand)
    g.fillStyle(0x443322, 1);
    g.fillRect(0, 16, 3, 24);
    g.fillStyle(0xcc00ff, 1);
    g.fillCircle(1, 14, 5);
    g.generateTexture('dark_mage', 40, 56);
    g.destroy();
  },

  makeTroll(scene) {
    const g = this._g(scene);
    // Big rocky body
    g.fillStyle(0x3a5533, 1);
    g.fillEllipse(32, 50, 52, 36);
    g.fillRect(8, 28, 48, 30);
    // Shoulders (boulders)
    g.fillStyle(0x445544, 1);
    g.fillCircle(6, 32, 14);
    g.fillCircle(58, 32, 14);
    // Head
    g.fillStyle(0x3a5533, 1);
    g.fillCircle(32, 18, 18);
    // Face - angry brow
    g.fillStyle(0x2a3a22, 1);
    g.fillRect(16, 10, 14, 5);
    g.fillRect(34, 10, 14, 5);
    // Eyes sunken
    g.fillStyle(0xffaa00, 1);
    g.fillCircle(22, 16, 5);
    g.fillCircle(42, 16, 5);
    g.fillStyle(0x110000, 1);
    g.fillCircle(22, 17, 2.5);
    g.fillCircle(42, 17, 2.5);
    // Nose / mouth
    g.fillStyle(0x2a3a22, 1);
    g.fillRect(28, 22, 8, 4);
    g.fillRect(20, 28, 24, 4);
    // Knuckles
    g.fillStyle(0x2a3a22, 1);
    for (let i = 0; i < 4; i++) { g.fillCircle(4 + i*5, 50, 3); g.fillCircle(46 + i*5, 50, 3); }
    g.generateTexture('troll', 64, 66);
    g.destroy();
  },

  makeSkeleton(scene) {
    const g = this._g(scene);
    // Torso
    g.fillStyle(0xddddcc, 1);
    g.fillRect(14, 24, 20, 28);
    // Ribs
    g.fillStyle(0x888877, 1);
    for (let i = 0; i < 4; i++) {
      g.fillRect(14, 26 + i * 7, 20, 2);
    }
    // Skull
    g.fillStyle(0xffeedd, 1);
    g.fillCircle(24, 16, 14);
    // Eye sockets
    g.fillStyle(0x111111, 1);
    g.fillEllipse(17, 14, 8, 9);
    g.fillEllipse(31, 14, 8, 9);
    // Nose cavity
    g.fillStyle(0x111111, 1);
    g.fillTriangle(22, 18, 26, 18, 24, 22);
    // Teeth
    g.fillStyle(0xffeedd, 1);
    for (let i = 0; i < 4; i++) {
      g.fillRect(16 + i * 5, 26, 3, 4);
    }
    g.generateTexture('skeleton', 48, 54);
    g.destroy();
  },

  makeDragon(scene) {
    const g = this._g(scene);
    // Wings
    g.fillStyle(0xaa1111, 0.85);
    g.fillTriangle(8, 20, 30, 10, 30, 44);
    g.fillTriangle(72, 20, 50, 10, 50, 44);
    // Body
    g.fillStyle(0xdd2222, 1);
    g.fillEllipse(40, 38, 44, 36);
    // Head
    g.fillStyle(0xee3333, 1);
    g.fillCircle(40, 18, 18);
    // Snout
    g.fillStyle(0xff5544, 1);
    g.fillEllipse(40, 26, 18, 10);
    // Eyes
    g.fillStyle(0xffdd00, 1);
    g.fillCircle(30, 14, 6);
    g.fillCircle(50, 14, 6);
    g.fillStyle(0x110000, 1);
    g.fillCircle(31, 14, 3);
    g.fillCircle(51, 14, 3);
    // Spines on back
    g.fillStyle(0xaa1111, 1);
    for (let i = 0; i < 3; i++) {
      g.fillTriangle(30 + i * 10, 6, 26 + i * 10, 16, 34 + i * 10, 16);
    }
    g.generateTexture('dragon', 80, 70);
    g.destroy();
  },

  makePlayerKnight(scene) {
    const g = this._g(scene);
    // Cape
    g.fillStyle(0x2244aa, 0.7);
    g.fillEllipse(16, 34, 24, 14);
    // Body / armor
    g.fillStyle(0x3366cc, 1);
    g.fillRect(6, 20, 20, 22);
    // Armor highlight
    g.fillStyle(0x5588ee, 0.6);
    g.fillRect(8, 22, 8, 16);
    // Helmet
    g.fillStyle(0x445577, 1);
    g.fillCircle(16, 13, 11);
    g.fillRect(9, 13, 14, 8);
    // Visor slit
    g.fillStyle(0x88aaff, 0.9);
    g.fillRect(10, 14, 12, 3);
    // Sword
    g.fillStyle(0xccddee, 1);
    g.fillRect(26, 16, 3, 18);
    g.fillRect(22, 20, 11, 3);
    // Shield
    g.fillStyle(0x2244aa, 1);
    g.fillCircle(4, 26, 6);
    g.fillStyle(0xffcc00, 1);
    g.fillRect(2, 24, 4, 2);
    g.generateTexture('player_knight', 32, 44);
    g.destroy();
  },

  makePlayerMage(scene) {
    const g = this._g(scene);
    // Robe
    g.fillStyle(0x7722cc, 1);
    g.fillEllipse(14, 32, 22, 30);
    // Hat brim
    g.fillStyle(0x5511aa, 1);
    g.fillEllipse(14, 16, 22, 6);
    // Hat cone
    g.fillStyle(0x7722cc, 1);
    g.fillTriangle(14, 0, 5, 17, 23, 17);
    // Face
    g.fillStyle(0xffddcc, 1);
    g.fillCircle(14, 21, 8);
    // Eyes
    g.fillStyle(0x3333aa, 1);
    g.fillCircle(10, 20, 2);
    g.fillCircle(17, 20, 2);
    // Staff
    g.fillStyle(0x886633, 1);
    g.fillRect(24, 10, 3, 32);
    // Orb on staff
    g.fillStyle(0xcc44ff, 1);
    g.fillCircle(25, 8, 6);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(23, 6, 3);
    // Stars on robe
    g.fillStyle(0xffdd44, 0.8);
    g.fillCircle(10, 30, 2);
    g.fillCircle(18, 36, 2);
    g.generateTexture('player_mage', 32, 44);
    g.destroy();
  },

  makePlayerRogue(scene) {
    const g = this._g(scene);
    // Body / cloak
    g.fillStyle(0x226644, 1);
    g.fillEllipse(14, 30, 22, 30);
    // Hood
    g.fillStyle(0x1a4433, 1);
    g.fillCircle(14, 14, 12);
    g.fillRect(5, 14, 18, 8);
    // Face in shadow
    g.fillStyle(0xffddbb, 0.7);
    g.fillEllipse(14, 17, 12, 10);
    // Eyes (glowing)
    g.fillStyle(0x44ffaa, 0.9);
    g.fillCircle(10, 16, 2);
    g.fillCircle(17, 16, 2);
    // Left dagger
    g.fillStyle(0xccddee, 1);
    g.fillRect(1, 20, 2, 14);
    g.fillTriangle(1, 20, 3, 20, 2, 14);
    // Right dagger
    g.fillRect(25, 20, 2, 14);
    g.fillTriangle(25, 20, 27, 20, 26, 14);
    // Belt
    g.fillStyle(0x553322, 1);
    g.fillRect(5, 30, 18, 3);
    g.generateTexture('player_rogue', 28, 44);
    g.destroy();
  },

  makeOrb(scene) {
    const g = this._g(scene);
    // Glow
    g.fillStyle(0xaa44ff, 0.3);
    g.fillCircle(12, 12, 12);
    // Core
    g.fillStyle(0xcc66ff, 1);
    g.fillCircle(12, 12, 8);
    // Highlight
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(9, 9, 3);
    g.generateTexture('orb', 24, 24);
    g.destroy();
  },

  makeArrow(scene) {
    const g = this._g(scene);
    // Shaft
    g.fillStyle(0x886633, 1);
    g.fillRect(0, 4, 20, 2);
    // Head
    g.fillStyle(0xaaccee, 1);
    g.fillTriangle(16, 0, 28, 5, 16, 10);
    // Fletching
    g.fillStyle(0xcc4444, 1);
    g.fillTriangle(0, 5, 8, 2, 6, 5);
    g.fillTriangle(0, 5, 8, 8, 6, 5);
    g.generateTexture('arrow', 28, 10);
    g.destroy();
  },

  makeSlash(scene) {
    const g = this._g(scene);
    // Arc slash effect — bright yellow crescent
    g.fillStyle(0xffee44, 0.9);
    g.fillRect(0,  4, 10, 6);
    g.fillRect(8,  2, 10, 8);
    g.fillRect(16, 0, 10, 10);
    g.fillRect(24, 2, 10, 8);
    g.fillRect(32, 4, 10, 6);
    // White center glow
    g.fillStyle(0xffffff, 0.5);
    g.fillRect(8, 4, 28, 4);
    g.generateTexture('slash', 42, 12);
    g.destroy();
  },

  makeEnemyArrow(scene) {
    const g = this._g(scene);
    // Shaft
    g.fillStyle(0x663300, 1);
    g.fillRect(0, 4, 20, 2);
    // Head — red/dark
    g.fillStyle(0xcc2222, 1);
    g.fillTriangle(16, 0, 28, 5, 16, 10);
    // Fletching — dark
    g.fillStyle(0x440000, 1);
    g.fillTriangle(0, 5, 8, 2, 6, 5);
    g.fillTriangle(0, 5, 8, 8, 6, 5);
    g.generateTexture('enemy_arrow', 28, 10);
    g.destroy();
  },

  makeXpGem(scene) {
    const g = this._g(scene);
    // Diamond shape
    g.fillStyle(0x00ddaa, 1);
    g.fillTriangle(7, 0, 14, 7, 7, 14);
    g.fillTriangle(7, 0, 0, 7, 7, 14);
    // Highlight
    g.fillStyle(0xaafff0, 0.7);
    g.fillTriangle(7, 1, 12, 7, 7, 5);
    g.generateTexture('xp_gem', 14, 14);
    g.destroy();
  },

  makeHeartPickup(scene) {
    const g = this._g(scene);
    // Two circles for the top of the heart
    g.fillStyle(0xff2244, 1);
    g.fillCircle(5, 5, 5);
    g.fillCircle(11, 5, 5);
    // Triangle for the bottom
    g.fillTriangle(0, 7, 16, 7, 8, 16);
    // Highlight
    g.fillStyle(0xff88aa, 0.7);
    g.fillCircle(4, 4, 2);
    g.generateTexture('heart_pickup', 16, 16);
    g.destroy();
  },

  makeBoomerang(scene) {
    const g = this._g(scene);
    // Compact curved boomerang — two arms meeting at a point
    g.fillStyle(0xbb7711, 1);
    g.fillEllipse(12,  4, 22,  7);   // horizontal arm
    g.fillEllipse( 4, 12,  7, 22);   // vertical arm
    // Hollow out the inside (carve with dark)
    g.fillStyle(0x000000, 0);         // transparent — just shape via geometry
    // Edge highlight
    g.fillStyle(0xffcc44, 0.6);
    g.fillEllipse(11, 3, 14, 4);
    g.fillEllipse( 3,11,  4, 14);
    // Grip notch at corner
    g.fillStyle(0x8b5a0a, 1);
    g.fillCircle(6, 6, 4);
    g.generateTexture('boomerang', 22, 22);
    g.destroy();
  },

  makeDagger(scene) {
    const g = this._g(scene);
    // Thin blade
    g.fillStyle(0xccddee, 1);
    g.fillTriangle(6, 0, 10, 0, 8, 18);
    // Guard
    g.fillStyle(0xaa8844, 1);
    g.fillRect(3, 17, 10, 3);
    // Handle
    g.fillStyle(0x664422, 1);
    g.fillRect(5, 20, 6, 8);
    g.generateTexture('dagger', 16, 28);
    g.destroy();
  },

  makeBossOrb(scene) {
    const g = this._g(scene);
    g.fillStyle(0x220033, 0.4); g.fillCircle(14, 14, 14);
    g.fillStyle(0x6600aa, 1);   g.fillCircle(14, 14, 10);
    g.fillStyle(0xaa22ff, 1);   g.fillCircle(14, 14, 6);
    g.fillStyle(0xffffff, 0.6); g.fillCircle(11, 11, 3);
    g.generateTexture('boss_orb', 28, 28);
    g.destroy();
  },

  makeLich(scene) {
    const g = this._g(scene);
    // Robe
    g.fillStyle(0x110022, 1);
    g.fillEllipse(40, 76, 52, 44);
    g.fillRect(16, 44, 48, 38);
    // Robe highlight / folds
    g.fillStyle(0x220044, 1);
    g.fillRect(24, 44, 6, 36);
    g.fillRect(50, 44, 6, 36);
    // Staff
    g.fillStyle(0x443322, 1); g.fillRect(66, 10, 4, 60);
    // Staff orb
    g.fillStyle(0x00cc44, 1);   g.fillCircle(68, 8, 9);
    g.fillStyle(0x00ff66, 0.7); g.fillCircle(65, 5, 4);
    // Body/torso
    g.fillStyle(0x1a0033, 1);
    g.fillRect(22, 28, 36, 22);
    // Skull
    g.fillStyle(0xddddc0, 1); g.fillCircle(40, 20, 17);
    g.fillRect(28, 22, 24, 12);
    // Crown
    g.fillStyle(0xcc8800, 1);
    g.fillRect(26, 6, 28, 6);
    [28, 36, 44, 52].forEach(x => g.fillTriangle(x, 6, x+4, -2, x+8, 6));
    g.fillStyle(0xff0000, 1);
    g.fillCircle(32, 5, 3); g.fillCircle(40, 5, 3); g.fillCircle(48, 5, 3);
    // Eye sockets
    g.fillStyle(0x000011, 1);
    g.fillEllipse(33, 19, 11, 12); g.fillEllipse(47, 19, 11, 12);
    // Glowing eyes
    g.fillStyle(0x00ff88, 1);
    g.fillCircle(33, 19, 4); g.fillCircle(47, 19, 4);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(32, 18, 1.5); g.fillCircle(46, 18, 1.5);
    // Bone hands
    g.fillStyle(0xddddc0, 1);
    g.fillRect(12, 48, 6, 16); g.fillEllipse(15, 64, 10, 8);
    g.fillRect(62, 48, 6, 16); g.fillEllipse(65, 64, 10, 8);
    g.generateTexture('lich', 80, 96);
    g.destroy();
  },

  makeTreePine(scene) {
    const g = this._g(scene);
    // Trunk
    g.fillStyle(0x5a3010, 1);
    g.fillRect(17, 44, 10, 18);
    // Layers (dark green triangles)
    g.fillStyle(0x1a5c1a, 1);
    g.fillTriangle(22, 4,  4, 36, 40, 36);
    g.fillStyle(0x227022, 1);
    g.fillTriangle(22, 0, 6, 28, 38, 28);
    g.fillStyle(0x2d8c2d, 1);
    g.fillTriangle(22, 2, 8, 22, 36, 22);
    // Snow tips
    g.fillStyle(0xddeeff, 0.4);
    g.fillTriangle(22, 0, 16, 10, 28, 10);
    g.generateTexture('tree_pine', 44, 62);
    g.destroy();
  },

  makeTreeRound(scene) {
    const g = this._g(scene);
    // Trunk
    g.fillStyle(0x5a3010, 1);
    g.fillRect(18, 38, 10, 16);
    g.fillStyle(0x3d2008, 1);
    g.fillRect(20, 38, 4, 16);
    // Canopy shadows
    g.fillStyle(0x1a5520, 1);
    g.fillCircle(24, 26, 20);
    g.fillStyle(0x227a28, 1);
    g.fillCircle(22, 22, 18);
    // Highlight
    g.fillStyle(0x33aa3a, 1);
    g.fillCircle(19, 17, 12);
    g.fillStyle(0x55cc55, 0.5);
    g.fillCircle(16, 14, 7);
    g.generateTexture('tree_round', 48, 54);
    g.destroy();
  },

  makeRockLarge(scene) {
    const g = this._g(scene);
    g.fillStyle(0x445566, 1);
    g.fillEllipse(28, 28, 52, 40);
    g.fillStyle(0x556677, 1);
    g.fillEllipse(24, 22, 38, 28);
    // Cracks
    g.lineStyle(1, 0x334455, 1);
    g.lineBetween(22, 14, 28, 28);
    g.lineBetween(28, 28, 36, 38);
    // Highlight
    g.fillStyle(0x7788aa, 0.5);
    g.fillEllipse(18, 16, 18, 10);
    g.generateTexture('rock_large', 56, 44);
    g.destroy();
  },

  makeRockSmall(scene) {
    const g = this._g(scene);
    g.fillStyle(0x445566, 1);
    g.fillEllipse(16, 16, 30, 22);
    g.fillStyle(0x556677, 1);
    g.fillEllipse(13, 12, 20, 14);
    g.fillStyle(0x7788aa, 0.4);
    g.fillEllipse(10, 9, 10, 6);
    g.generateTexture('rock_small', 32, 26);
    g.destroy();
  },

  makeGravestone(scene) {
    const g = this._g(scene);
    // Base
    g.fillStyle(0x334455, 1);
    g.fillRect(8, 36, 24, 6);
    // Stone
    g.fillStyle(0x445566, 1);
    g.fillRect(10, 10, 20, 30);
    // Rounded top
    g.fillCircle(20, 12, 10);
    // Darker face
    g.fillStyle(0x3a4d60, 1);
    g.fillRect(12, 14, 16, 24);
    g.fillCircle(20, 14, 8);
    // Cross carving
    g.fillStyle(0x223344, 1);
    g.fillRect(18, 16, 4, 14);
    g.fillRect(13, 20, 14, 4);
    // Moss
    g.fillStyle(0x2a5a2a, 0.5);
    g.fillRect(10, 30, 6, 4);
    g.fillRect(24, 28, 5, 5);
    g.generateTexture('gravestone', 40, 44);
    g.destroy();
  },

  makePillarBroken(scene) {
    const g = this._g(scene);
    // Base chunks
    g.fillStyle(0x667788, 1);
    g.fillRect(2, 48, 22, 10);
    g.fillStyle(0x556677, 1);
    g.fillRect(0, 50, 10, 8);
    // Column shaft
    g.fillStyle(0x778899, 1);
    g.fillRect(6, 14, 18, 38);
    g.fillStyle(0x667788, 1);
    g.fillRect(6, 14, 6, 38);
    // Broken top (jagged)
    g.fillStyle(0x778899, 1);
    g.fillTriangle(6, 14, 24, 14, 18, 4);
    g.fillTriangle(6, 14, 14,  6, 10, 14);
    // Debris
    g.fillStyle(0x667788, 0.8);
    g.fillRect(26, 42, 8, 6);
    g.fillRect(28, 50, 6, 4);
    g.generateTexture('pillar_broken', 36, 60);
    g.destroy();
  },

  makeTorch(scene) {
    const g = this._g(scene);
    // Post
    g.fillStyle(0x665533, 1);
    g.fillRect(7, 14, 4, 28);
    // Bracket
    g.fillStyle(0x886644, 1);
    g.fillRect(4, 20, 10, 6);
    // Bowl
    g.fillStyle(0x998866, 1);
    g.fillRect(4, 10, 10, 8);
    // Flame outer
    g.fillStyle(0xff6600, 0.9);
    g.fillTriangle(9, 0, 3, 12, 15, 12);
    // Flame inner
    g.fillStyle(0xffcc00, 0.9);
    g.fillTriangle(9, 3, 5, 12, 13, 12);
    // Glow
    g.fillStyle(0xffaa00, 0.2);
    g.fillCircle(9, 8, 10);
    g.generateTexture('torch', 18, 42);
    g.destroy();
  },

  makeBush(scene) {
    const g = this._g(scene);
    g.fillStyle(0x1a4a1a, 1);
    g.fillCircle(18, 20, 16);
    g.fillCircle(30, 20, 14);
    g.fillCircle(8,  22, 12);
    g.fillStyle(0x226622, 1);
    g.fillCircle(16, 16, 12);
    g.fillCircle(28, 17, 11);
    g.fillStyle(0x2d882d, 0.7);
    g.fillCircle(13, 13, 7);
    g.fillCircle(24, 13, 7);
    g.generateTexture('bush', 44, 34);
    g.destroy();
  },

  makeBonePile(scene) {
    const g = this._g(scene);
    // Scattered bones (light gray rectangles at angles)
    g.fillStyle(0xccccbb, 1);
    g.fillRect(4,  18, 20, 5);
    g.fillRect(16, 12, 5,  20);
    g.fillRect(2,  10, 16, 4);
    g.fillRect(18, 22, 18, 4);
    // Skull
    g.fillStyle(0xddddc0, 1);
    g.fillCircle(30, 12, 9);
    g.fillRect(24, 14, 12, 6);
    g.fillStyle(0x111111, 1);
    g.fillEllipse(27, 11, 5, 6);
    g.fillEllipse(33, 11, 5, 6);
    g.generateTexture('bone_pile', 42, 30);
    g.destroy();
  },

  makeBarrel(scene) {
    const g = this._g(scene);
    // Body
    g.fillStyle(0x6b3d1e, 1);
    g.fillEllipse(18, 8,  32, 12);
    g.fillRect(2, 8, 32, 26);
    g.fillEllipse(18, 34, 32, 12);
    // Hoops
    g.fillStyle(0x886644, 1);
    g.fillRect(2, 14, 32, 3);
    g.fillRect(2, 24, 32, 3);
    // Highlight
    g.fillStyle(0x8b5a2e, 1);
    g.fillRect(6, 8, 8, 26);
    // Lid ring
    g.fillStyle(0x996633, 1);
    g.fillEllipse(18, 8, 28, 10);
    g.generateTexture('barrel', 36, 40);
    g.destroy();
  }
};
