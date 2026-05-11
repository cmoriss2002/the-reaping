var MetaProgress = {

  // ── Upgrade definitions (3 tiers each) ───────────────────────────────────
  UPGRADES: [
    {
      id: 'hp', name: 'Iron Body', icon: '🛡️',
      tiers: [
        { desc: '+25 Max HP',   cost: 30,  apply: (p) => { p.maxHp += 25; p.hp = Math.min(p.hp + 25, p.maxHp); } },
        { desc: '+15 Max HP',   cost: 75,  apply: (p) => { p.maxHp += 15; p.hp = Math.min(p.hp + 15, p.maxHp); } },
        { desc: '+10 Max HP',   cost: 150, apply: (p) => { p.maxHp += 10; p.hp = Math.min(p.hp + 10, p.maxHp); } },
      ]
    },
    {
      id: 'dmg', name: 'Runic Edge', icon: '🗡',
      tiers: [
        { desc: '+20% weapon dmg', cost: 55,  apply: (p) => { p.weapons.forEach(w => { w.damage = Math.floor(w.damage * 1.20); }); } },
        { desc: '+15% weapon dmg', cost: 137, apply: (p) => { p.weapons.forEach(w => { w.damage = Math.floor(w.damage * 1.15); }); } },
        { desc: '+10% weapon dmg', cost: 275, apply: (p) => { p.weapons.forEach(w => { w.damage = Math.floor(w.damage * 1.10); }); } },
      ]
    },
    {
      id: 'speed', name: 'Swift Feet', icon: '💨',
      tiers: [
        { desc: '+25 move speed', cost: 45,  apply: (p) => { p.speed += 25; } },
        { desc: '+15 move speed', cost: 112, apply: (p) => { p.speed += 15; } },
        { desc: '+10 move speed', cost: 225, apply: (p) => { p.speed += 10; } },
      ]
    },
    {
      id: 'magnet', name: 'Soul Magnet', icon: '🧲',
      tiers: [
        { desc: '+50px XP attract', cost: 65,  apply: (p) => { p.xpPickupRadius += 50; } },
        { desc: '+30px XP attract', cost: 162, apply: (p) => { p.xpPickupRadius += 30; } },
        { desc: '+20px XP attract', cost: 325, apply: (p) => { p.xpPickupRadius += 20; } },
      ]
    },
    {
      id: 'souls', name: 'Soul Reaper', icon: '💀',
      tiers: [
        { desc: '+30% souls/run', cost: 100, apply: () => {} },
        { desc: '+20% more souls', cost: 250, apply: () => {} },
        { desc: '+15% more souls', cost: 500, apply: () => {} },
      ]
    },
    {
      id: 'weapon', name: 'Dual Wielder', icon: '⚔',
      tiers: [
        { desc: 'Start with 1 bonus weapon', cost: 185, apply: () => {} },
        { desc: 'Start with 2 bonus weapons', cost: 462, apply: () => {} },
        { desc: 'Start with 3 bonus weapons', cost: 925, apply: () => {} },
      ]
    },
    {
      id: 'shield', name: 'Arcane Shield', icon: '🔵',
      tiers: [
        { desc: '3 shield charges/run', cost: 120, apply: (p) => { p.hasShield = true; p.shieldMax = 3; p.shieldDurability = 3; } },
        { desc: '4 shield charges/run', cost: 300, apply: (p) => { p.hasShield = true; p.shieldMax = 4; p.shieldDurability = 4; } },
        { desc: '5 shield charges/run', cost: 600, apply: (p) => { p.hasShield = true; p.shieldMax = 5; p.shieldDurability = 5; } },
      ]
    },
    {
      id: 'revive', name: 'Second Wind', icon: '✨',
      tiers: [
        { desc: 'Revive once with 50 HP',  cost: 230,  apply: (p) => { p.hasRevive = true; p._reviveHp = 50; } },
        { desc: 'Revive once with 80 HP',  cost: 575,  apply: (p) => { p.hasRevive = true; p._reviveHp = 80; } },
        { desc: 'Revive twice per run',    cost: 1150, apply: (p) => { p.hasRevive = true; p._reviveHp = 80; p._reviveTwice = true; } },
      ]
    },
  ],

  _data: null,

  // ── Persistence ────────────────────────────────────────────────────────────
  load() {
    try {
      const raw = localStorage.getItem('fantasyAutoBattler_v1');
      const parsed = raw ? JSON.parse(raw) : null;
      this._data = parsed ? this._migrate(parsed) : this._defaults();
    } catch (e) {
      this._data = this._defaults();
    }
    return this;
  },

  _defaults() {
    return {
      souls: 0, lifetimeSouls: 0,
      purchased: {},
      ascensionLevel: 0,
      records: { wave: 0, kills: 0, level: 0, time: 0 }
    };
  },

  // Migrate old boolean-purchased v1 data to new tier system
  _migrate(data) {
    const p = data.purchased || {};
    const isOldFormat = Object.values(p).some(v => v === true);
    if (!isOldFormat) {
      // Already new format — just fill in any missing fields
      if (!data.lifetimeSouls) data.lifetimeSouls = data.souls || 0;
      if (!data.ascensionLevel) data.ascensionLevel = 0;
      return data;
    }
    const newP = {};
    newP.hp     = (p.hp1 ? 1 : 0) + (p.hp2 ? 1 : 0) + (p.hp3 ? 1 : 0);
    newP.dmg    = (p.dmg1 ? 1 : 0) + (p.dmg2 ? 1 : 0);
    newP.speed  = p.speed1 ? 1 : 0;
    newP.magnet = p.xpmagnet ? 1 : 0;
    newP.souls  = p.souls1 ? 1 : 0;
    newP.weapon = p.extraweapon ? 1 : 0;
    newP.shield = p.shield ? 1 : 0;
    newP.revive = p.revive ? 1 : 0;
    return {
      souls: data.souls || 0,
      lifetimeSouls: data.souls || 0,
      purchased: newP,
      ascensionLevel: 0,
      records: data.records || { wave: 0, kills: 0, level: 0, time: 0 }
    };
  },

  save() {
    try { localStorage.setItem('fantasyAutoBattler_v1', JSON.stringify(this._data)); }
    catch (e) {}
  },

  // ── Soul economy ────────────────────────────────────────────────────────────
  get souls()        { return this._data ? this._data.souls        : 0; },
  get lifetimeSouls(){ return this._data ? (this._data.lifetimeSouls || 0) : 0; },

  addSouls(n) {
    this._data.souls += n;
    this._data.lifetimeSouls = (this._data.lifetimeSouls || 0) + n;
    this.save();
  },

  calcRunSouls(kills, wave, level) {
    const base = kills + wave * 8 + level * 4;
    const tier  = this.getTier('souls');
    const mult  = [1.0, 1.3, 1.5, 1.65][tier] || 1.0;
    return Math.floor(base * mult);
  },

  // ── Tier helpers ────────────────────────────────────────────────────────────
  getTier(id) {
    if (!this._data) return 0;
    return Math.min(this._data.purchased[id] || 0, this.maxTier(id));
  },

  maxTier(id) {
    const upg = this.UPGRADES.find(u => u.id === id);
    return upg ? upg.tiers.length : 0;
  },

  has(id) { return this.getTier(id) >= 1; },

  nextTierCost(id) {
    const upg  = this.UPGRADES.find(u => u.id === id);
    const tier = this.getTier(id);
    if (!upg || tier >= upg.tiers.length) return Infinity;
    return upg.tiers[tier].cost;
  },

  nextTierDesc(id) {
    const upg  = this.UPGRADES.find(u => u.id === id);
    const tier = this.getTier(id);
    if (!upg || tier >= upg.tiers.length) return '';
    return upg.tiers[tier].desc;
  },

  canPurchaseNext(id) {
    const tier = this.getTier(id);
    const max  = this.maxTier(id);
    if (tier >= max) return false;
    return this._data.souls >= this.nextTierCost(id);
  },

  purchaseNext(id) {
    if (!this.canPurchaseNext(id)) return false;
    this._data.souls -= this.nextTierCost(id);
    this._data.purchased[id] = this.getTier(id) + 1;
    this.save();
    return true;
  },

  // ── Ascension ───────────────────────────────────────────────────────────────
  get ascensionLevel() { return this._data ? (this._data.ascensionLevel || 0) : 0; },

  get ascensionCost()  { return 2000 + this.ascensionLevel * 1000; },

  allMaxed() {
    return this.UPGRADES.every(u => this.getTier(u.id) >= u.tiers.length);
  },

  canAscend() {
    return this.allMaxed() && this._data.souls >= this.ascensionCost;
  },

  ascend() {
    if (!this.canAscend()) return false;
    this._data.souls -= this.ascensionCost;
    this._data.ascensionLevel = (this._data.ascensionLevel || 0) + 1;
    this.UPGRADES.forEach(u => { this._data.purchased[u.id] = 0; });
    this.save();
    return true;
  },

  // ── Apply bonuses to player at run start ─────────────────────────────────
  applyBonuses(player) {
    // Apply each purchased tier cumulatively
    this.UPGRADES.forEach(upg => {
      const tier = this.getTier(upg.id);
      for (let t = 0; t < tier; t++) {
        upg.tiers[t].apply(player);
      }
    });

    // Weapon upgrade: add bonus starting weapons
    const weaponTier = this.getTier('weapon');
    if (weaponTier > 0) {
      const pool = Object.keys(WEAPONS).filter(k =>
        !player.weapons.find(w => w.id === k) && !WEAPONS[k].evolved
      );
      for (let i = 0; i < weaponTier && pool.length > 0; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        player.addWeapon(pool[idx]);
        pool.splice(idx, 1);
      }
    }

    // Shield: set charges based on tier (last write wins)
    const shieldTier = this.getTier('shield');
    if (shieldTier > 0) {
      const charges = [0, 3, 4, 5][shieldTier];
      player.hasShield = true;
      player.shieldDurability = charges;
      player.shieldMax = charges;
    }

    // Revive: tier determines HP and count
    const reviveTier = this.getTier('revive');
    if (reviveTier >= 1) {
      player.hasRevive = true;
      player._reviveHp = reviveTier >= 2 ? 80 : 50;
      player._reviveTwice = reviveTier >= 3;
    }

    // Ascension permanent bonus: +3% dmg, +3% maxHP, +2 speed per level
    const asc = this.ascensionLevel;
    if (asc > 0) {
      player.weapons.forEach(w => { w.damage = Math.floor(w.damage * (1 + asc * 0.03)); });
      const hpBonus = Math.floor(player.maxHp * asc * 0.03);
      player.maxHp += hpBonus;
      player.hp = player.maxHp;
      player.speed += asc * 2;
    }
  },

  // ── Records ──────────────────────────────────────────────────────────────
  get records() {
    return this._data.records || { wave: 0, kills: 0, level: 0, time: 0 };
  },

  submitRun(kills, wave, level, time) {
    if (!this._data.records) this._data.records = { wave: 0, kills: 0, level: 0, time: 0 };
    const r = this._data.records;
    const improved = {
      wave:  wave  > r.wave,
      kills: kills > r.kills,
      level: level > r.level,
      time:  time  > r.time,
    };
    if (improved.wave)  r.wave  = wave;
    if (improved.kills) r.kills = kills;
    if (improved.level) r.level = level;
    if (improved.time)  r.time  = time;
    this.save();
    return improved;
  },

  reset() { this._data = this._defaults(); this.save(); }
};
