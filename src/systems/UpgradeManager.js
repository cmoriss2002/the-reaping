// Weapon synergies: { weapons: [id1, id2], passive: passiveId, evolvedWeapon: id }
const SYNERGIES = [
  { weapons: ['magic_orb'],  passive: 'tome',    evolves: 'magic_orb',    into: 'chaos_nova',   name: 'Chaos Nova',   desc: 'Orb + Tome → Massive Chaos Nova' },
  { weapons: ['arrow'],      passive: 'pendant', evolves: 'arrow',         into: 'storm_bow',    name: 'Storm Bow',    desc: 'Arrow + Pendant → Rapid Storm Bow' },
  { weapons: ['sword_slash'],passive: 'armor',   evolves: 'sword_slash',   into: 'holy_blade',   name: 'Holy Blade',   desc: 'Slash + Armor → Healing Holy Blade' },
  { weapons: ['boomerang'],  passive: 'ring',    evolves: 'boomerang',     into: 'soul_catcher', name: 'Soul Catcher', desc: 'Boomerang + XP Ring → Soul Catcher' },
];

class UpgradeManager {
  constructor() {
    this.offeredIds = [];
  }

  checkSynergies(player) {
    SYNERGIES.forEach(syn => {
      const hasWeapons  = syn.weapons.every(wid => player.weapons.some(w => w.id === wid));
      const hasPassive  = (player.passives[syn.passive] || 0) >= 1;
      const alreadyEvolved = player.weapons.some(w => w.id === syn.into);
      if (!hasWeapons || !hasPassive || alreadyEvolved) return;

      // Remove the base weapon, add the evolved one
      const idx = player.weapons.findIndex(w => w.id === syn.evolves);
      if (idx !== -1) {
        player.weapons.splice(idx, 1);
        player.addWeapon(syn.into);
        // Announce
        if (player.scene && player.scene.juice) {
          player.scene.juice.flash(200, 200, 60, 400);
          player.scene.juice.floatText(player.x, player.y - 70, `✨ ${syn.name}!`, '#FFD700', 24);
        }
        SoundManager.play('level_up');
      }
    });
  }

  // Weapon id each "add_*" upgrade gives
  _weaponFor(upgradeId) {
    const map = {
      add_orb: 'magic_orb', add_arrow: 'arrow', add_slash: 'sword_slash',
      add_boomerang: 'boomerang', add_fire_nova: 'fire_nova', add_daggers: 'daggers'
    };
    return map[upgradeId] || null;
  },

  // Build a combined pool of weapon upgrades + passive items filtered for this player
  _buildPool(player) {
    const pool = [];

    // Regular upgrades — weapon cards become "upgrade" cards if already owned
    UPGRADES.forEach(u => {
      const wid = this._weaponFor(u.id);
      if (wid && player && player.weapons.some(w => w.id === wid)) {
        // Player already has this weapon — offer a boost instead
        pool.push({
          ...u,
          _type: 'upgrade',
          name: u.name + ' +',
          description: '+20% damage\n−10% cooldown',
          apply: (pl) => {
            pl.weapons.filter(w => w.id === wid).forEach(w => {
              w.damage   = Math.floor(w.damage   * 1.20);
              w.cooldown = Math.floor(w.cooldown * 0.90);
            });
          }
        });
      } else {
        pool.push({ ...u, _type: 'upgrade' });
      }
    });

    // Passives — exclude maxed ones
    PASSIVES.forEach(p => {
      const tier = player ? (player.passives[p.id] || 0) : 0;
      if (tier < p.maxTier) {
        pool.push({
          ...p,
          _type:    'passive',
          _tier:    tier,           // current tier (0 = not owned)
          icon:     p.icon,
          name:     tier > 0 ? `${p.name} ★${tier + 1}` : p.name,
          description: p.tiers[tier].desc,
          apply:    (pl) => pl.applyPassive(p.id),
        });
      }
    });

    return pool;
  }

  getChoices(count = 3, player) {
    const pool     = this._buildPool(player);
    const shuffled = pool.sort(() => Math.random() - 0.5);
    // Prefer not repeating recently offered items
    const fresh  = shuffled.filter(u => !this.offeredIds.includes(u.id));
    const source = fresh.length >= count ? fresh : shuffled;
    const chosen = source.slice(0, count);
    this.offeredIds = chosen.map(u => u.id);
    return chosen;
  }

  applyUpgrade(upgradeId, player) {
    const upg = UPGRADES.find(u => u.id === upgradeId);
    if (upg) { upg.apply(player); }
    else {
      const pas = PASSIVES.find(p => p.id === upgradeId);
      if (pas) player.applyPassive(upgradeId);
    }
    // Check for newly unlocked synergy evolutions after every pickup
    this.checkSynergies(player);
  }
}
