const PASSIVES = [
  {
    id: 'armor', name: 'Leather Armor', icon: '🛡️',
    color: 0x886622, rarity: 'common', maxTier: 3,
    tiers: [
      { desc: 'Block 10%\nof all damage',      stat: 'damageReduction', value: 0.10 },
      { desc: 'Block 20%\nof all damage',      stat: 'damageReduction', value: 0.10 },
      { desc: 'Block 30%\nof all damage',      stat: 'damageReduction', value: 0.10 },
    ]
  },
  {
    id: 'tome', name: 'Tome of Power', icon: '📖',
    color: 0xcc3333, rarity: 'uncommon', maxTier: 3,
    tiers: [
      { desc: '+20% weapon\ndamage',           stat: 'damageMultiplier', value: 0.20 },
      { desc: '+25% more\ndamage',             stat: 'damageMultiplier', value: 0.25 },
      { desc: '+35% more\ndamage',             stat: 'damageMultiplier', value: 0.35 },
    ]
  },
  {
    id: 'pendant', name: 'Swift Pendant', icon: '⏱️',
    color: 0x8844cc, rarity: 'uncommon', maxTier: 3,
    tiers: [
      { desc: '-15% attack\ncooldowns',        stat: 'cooldownReduction', value: 0.15 },
      { desc: '-15% more\ncooldown',           stat: 'cooldownReduction', value: 0.15 },
      { desc: '-15% more\ncooldown',           stat: 'cooldownReduction', value: 0.15 },
    ]
  },
  {
    id: 'ring', name: 'XP Ring', icon: '💫',
    color: 0xcc8800, rarity: 'common', maxTier: 3,
    tiers: [
      { desc: '+30% XP\nfrom kills',           stat: 'xpMultiplier', value: 0.30 },
      { desc: '+40% more\nXP',                 stat: 'xpMultiplier', value: 0.40 },
      { desc: '+50% more\nXP',                 stat: 'xpMultiplier', value: 0.50 },
    ]
  },
  {
    id: 'fang', name: 'Vampiric Fang', icon: '🩸',
    color: 0xaa1133, rarity: 'rare', maxTier: 3,
    tiers: [
      { desc: 'Heal 2 HP\nper kill',           stat: 'killHeal', value: 2 },
      { desc: 'Heal 4 HP\nper kill',           stat: 'killHeal', value: 2 },
      { desc: 'Heal 8 HP\nper kill',           stat: 'killHeal', value: 4 },
    ]
  },
  {
    id: 'ironheart', name: 'Iron Heart', icon: '💖',
    color: 0xcc2233, rarity: 'uncommon', maxTier: 3,
    tiers: [
      { desc: '+30 Max HP\n(restored)',         stat: 'maxHpBonus', value: 30 },
      { desc: '+40 more\nMax HP',              stat: 'maxHpBonus', value: 40 },
      { desc: '+50 more\nMax HP',              stat: 'maxHpBonus', value: 50 },
    ]
  },
  {
    id: 'crystal', name: 'Soul Crystal', icon: '💎',
    color: 0x22aacc, rarity: 'rare', maxTier: 2,
    tiers: [
      { desc: '+40 XP gem\nattract radius',    stat: 'xpRadius', value: 40 },
      { desc: 'XP gems fly\nto you instantly', stat: 'xpRadius', value: 80 },
    ]
  },
  {
    id: 'gloves', name: 'Power Gloves', icon: '👊',
    color: 0xcc6633, rarity: 'uncommon', maxTier: 2,
    tiers: [
      { desc: 'Knockback\nenemies on hit',     stat: 'knockback', value: 1 },
      { desc: 'Strong\nknockback + stun',      stat: 'knockback', value: 1 },
    ]
  },
];
