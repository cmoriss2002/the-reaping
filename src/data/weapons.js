const WEAPONS = {
  magic_orb: {
    id: 'magic_orb', name: 'Magic Orb', texture: 'orb', bodySize: 16,
    damage: 18, cooldown: 1100, projectileSpeed: 340, lifetime: 2200,
    piercing: false, color: 0xcc66ff,
    description: 'Fires a magic orb at the nearest enemy'
  },
  sword_slash: {
    id: 'sword_slash', name: 'Sword Slash', texture: 'slash', bodySize: 36,
    damage: 35, cooldown: 850, projectileSpeed: 550, lifetime: 160,
    piercing: true, color: 0xffee44,
    description: 'Sweeps a blade arc — pierces all enemies in path'
  },
  arrow: {
    id: 'arrow', name: 'Longbow', texture: 'arrow', bodySize: 10,
    damage: 24, cooldown: 750, projectileSpeed: 700, lifetime: 1300,
    piercing: false, color: 0x44ccff,
    description: 'Fires a fast arrow at the nearest enemy'
  },
  boomerang: {
    id: 'boomerang', name: 'Boomerang', texture: 'boomerang', bodySize: 12,
    damage: 28, cooldown: 1800, projectileSpeed: 420, lifetime: 900,
    piercing: true,  // hits on the way out AND back
    color: 0xcc8822,
    special: 'boomerang', // signals Player to use the return-trip logic
    description: 'Flies out and returns — hits enemies twice'
  },
  fire_nova: {
    id: 'fire_nova', name: 'Fire Nova', texture: 'orb', bodySize: 0,
    damage: 40, cooldown: 2800, projectileSpeed: 0, lifetime: 0,
    piercing: true,
    color: 0xff4400,
    special: 'nova', // signals Player to use area explosion logic
    novaRadius: 130,
    description: 'Explodes around you hitting all nearby enemies'
  },
  // ── Evolved weapons (unlocked via synergy, not directly pickable) ──────────
  chaos_nova: {
    id: 'chaos_nova', name: 'Chaos Nova', texture: 'orb', bodySize: 34,
    damage: 80, cooldown: 2200, projectileSpeed: 180, lifetime: 3500,
    piercing: true, color: 0xff00ff,
    special: 'nova', novaRadius: 200,
    evolved: true,
    description: 'Massive piercing nova that destroys everything nearby'
  },
  storm_bow: {
    id: 'storm_bow', name: 'Storm Bow', texture: 'arrow', bodySize: 10,
    damage: 20, cooldown: 280, projectileSpeed: 900, lifetime: 900,
    piercing: false, color: 0x00ffff,
    special: 'spread3', spreadAngle: 10,
    evolved: true,
    description: 'Rapid-fire triple arrows at blinding speed'
  },
  holy_blade: {
    id: 'holy_blade', name: 'Holy Blade', texture: 'slash', bodySize: 50,
    damage: 60, cooldown: 1100, projectileSpeed: 500, lifetime: 250,
    piercing: true, color: 0xffffaa,
    special: 'holy_slash',
    evolved: true,
    description: 'Sweeping holy arc — heals 5 HP per enemy slain'
  },
  soul_catcher: {
    id: 'soul_catcher', name: 'Soul Catcher', texture: 'boomerang', bodySize: 18,
    damage: 45, cooldown: 1400, projectileSpeed: 380, lifetime: 1100,
    piercing: true, color: 0x44ffcc,
    special: 'boomerang',
    evolved: true,
    description: 'Returns collecting XP gems in its path'
  },
  daggers: {
    id: 'daggers', name: 'Daggers', texture: 'dagger', bodySize: 8,
    damage: 16, cooldown: 650, projectileSpeed: 750, lifetime: 800,
    piercing: false, color: 0xccddee,
    special: 'spread3', // fires 3 projectiles in a spread
    spreadAngle: 18,    // degrees between each dagger
    description: 'Throws 3 daggers in a spread at enemies'
  }
};
