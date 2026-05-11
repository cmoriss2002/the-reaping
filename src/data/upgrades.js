const UPGRADES = [
  {
    id: 'hp_up',
    name: 'Toughness',
    icon: '❤️',
    description: '+25 Max HP\n(fully restored)',
    rarity: 'common',
    apply: (player) => {
      player.maxHp += 25;
      player.hp = Math.min(player.hp + 25, player.maxHp);
    }
  },
  {
    id: 'speed_up',
    name: 'Fleet Foot',
    icon: '💨',
    description: '+35 Movement\nSpeed',
    rarity: 'common',
    apply: (player) => { player.speed += 35; }
  },
  {
    id: 'damage_up',
    name: 'Power Surge',
    icon: '💥',
    description: '+25% Weapon\nDamage',
    rarity: 'uncommon',
    apply: (player) => {
      player.weapons.forEach(w => { w.damage = Math.floor(w.damage * 1.25); });
    }
  },
  {
    id: 'cooldown_down',
    name: 'Rapid Fire',
    icon: '⚡',
    description: '-20% Attack\nCooldown',
    rarity: 'uncommon',
    apply: (player) => {
      player.weapons.forEach(w => { w.cooldown = Math.floor(w.cooldown * 0.8); });
    }
  },
  {
    id: 'add_orb',
    name: 'Magic Orb',
    icon: '🔮',
    description: 'Add Magic Orb\nweapon',
    rarity: 'uncommon',
    apply: (player) => { player.addWeapon('magic_orb'); }
  },
  {
    id: 'add_arrow',
    name: 'Longbow',
    icon: '🏹',
    description: 'Add Longbow\nweapon',
    rarity: 'uncommon',
    apply: (player) => { player.addWeapon('arrow'); }
  },
  {
    id: 'add_slash',
    name: 'Sword Slash',
    icon: '🗡',
    description: 'Add Sword Slash\nweapon',
    rarity: 'uncommon',
    apply: (player) => { player.addWeapon('sword_slash'); }
  },
  {
    id: 'xp_magnet',
    name: 'XP Magnet',
    icon: '🧲',
    description: 'XP gems attract\nfrom further away',
    rarity: 'common',
    apply: (player) => { player.xpPickupRadius += 80; }
  },
  {
    id: 'regen',
    name: 'Regeneration',
    icon: '🌱',
    description: 'Regenerate 3\nHP per second',
    rarity: 'rare',
    apply: (player) => { player.regenRate = (player.regenRate || 0) + 3; }
  },
  {
    id: 'add_boomerang',
    name: 'Boomerang',
    icon: '🪃',
    description: 'Add Boomerang\n(returns to you)',
    rarity: 'rare',
    apply: (player) => { player.addWeapon('boomerang'); }
  },
  {
    id: 'add_fire_nova',
    name: 'Fire Nova',
    icon: '🔥',
    description: 'Add Fire Nova\n(area explosion)',
    rarity: 'rare',
    apply: (player) => { player.addWeapon('fire_nova'); }
  },
  {
    id: 'add_daggers',
    name: 'Daggers',
    icon: '🗡️',
    description: 'Add Daggers\n(3-way spread)',
    rarity: 'uncommon',
    apply: (player) => { player.addWeapon('daggers'); }
  },
  {
    id: 'piercing',
    name: 'Piercing Shots',
    icon: '✦',
    description: 'All projectiles\npierce enemies',
    rarity: 'rare',
    apply: (player) => {
      player.weapons.forEach(w => { w.piercing = true; });
      player.futurePiercing = true;
    }
  }
];
