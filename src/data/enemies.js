const ENEMIES = {
  slime: {
    texture: 'slime',
    size: 18,
    bodySize: 28,
    hp: 22,
    speed: 55,
    damage: 6,
    xpValue: 1,
    attackRate: 1000,
    spawnWeight: 10,
    color: 0x33cc44
  },
  goblin: {
    texture: 'goblin',
    size: 20,
    bodySize: 30,
    hp: 45,
    speed: 90,
    damage: 10,
    xpValue: 3,
    attackRate: 900,
    spawnWeight: 6,
    color: 0xcc5500
  },
  bat: {
    texture: 'bat', size: 12, bodySize: 18,
    hp: 18, speed: 160, damage: 7, xpValue: 2,
    attackRate: 800, spawnWeight: 7, color: 0x441166,
    behavior: 'swoop'
  },
  dark_mage: {
    texture: 'dark_mage', size: 18, bodySize: 26,
    hp: 55, speed: 50, damage: 14, xpValue: 6,
    attackRate: 1800, spawnWeight: 3, color: 0xcc00ff,
    behavior: 'retreater',
    preferredRange: 320, fleeRange: 80
  },
  troll: {
    texture: 'troll', size: 30, bodySize: 48,
    hp: 350, speed: 38, damage: 28, xpValue: 18,
    attackRate: 1600, spawnWeight: 2, color: 0x3a5533,
    behavior: 'chaser', regenRate: 8   // regenerates 8 HP per second
  },
  goblin_archer: {
    texture: 'goblin_archer',
    size: 18,
    bodySize: 28,
    hp: 35,
    speed: 80,
    damage: 8,
    xpValue: 4,
    attackRate: 2200,   // ranged fire rate
    spawnWeight: 4,
    color: 0x994400,
    behavior: 'archer',
    preferredRange: 280,
    fleeRange: 110
  },
  skeleton: {
    texture: 'skeleton',
    size: 22,
    bodySize: 32,
    hp: 80,
    speed: 65,
    damage: 14,
    xpValue: 5,
    attackRate: 1400,
    spawnWeight: 4,
    color: 0xddddc0
  },
  skeleton_charger: {
    texture: 'skeleton_charger',
    size: 22,
    bodySize: 32,
    hp: 65,
    speed: 70,
    damage: 20,
    xpValue: 6,
    attackRate: 1000,
    spawnWeight: 3,
    color: 0xddddaa,
    behavior: 'charger',
    chargeSpeed: 340,
    chargeInterval: 2800,
    chargeDuration: 550
  },
  lich: {
    texture: 'lich',
    size: 40,
    bodySize: 56,
    hp: 2800,
    speed: 55,
    damage: 22,
    xpValue: 200,
    attackRate: 99999,   // boss uses its own attack timer
    spawnWeight: 0,       // never spawned randomly — only by WaveManager boss logic
    color: 0x6600aa,
    behavior: 'boss',
    // Phase thresholds (% of max HP)
    phase2At: 0.6,
    phase3At: 0.3
  },
  dragon: {
    texture: 'dragon',
    size: 38,
    bodySize: 60,
    hp: 500,
    speed: 40,
    damage: 30,
    xpValue: 40,
    attackRate: 2200,
    spawnWeight: 1,
    color: 0xdd2222
  }
};
