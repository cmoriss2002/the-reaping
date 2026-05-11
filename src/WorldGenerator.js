var WorldGenerator = {
  // Returns array of obstacle sprites so GameScene can add physics colliders
  generate(scene) {
    const W = WORLD_W, H = WORLD_H;
    const cx = W / 2, cy = H / 2;

    this.drawGroundZones(scene, cx, cy, W, H);
    this.drawGroundDetail(scene, cx, cy, W, H);
    this.drawStonePaths(scene, cx, cy);
    this.drawCenterAltar(scene, cx, cy);
    this.placeTorchesAlongPaths(scene, cx, cy);
    return this.scatterObjects(scene, cx, cy, W, H);
  },

  drawGroundZones(scene, cx, cy, W, H) {
    const g = scene.add.graphics();
    const rng = this._seededRng(42);

    // Sparse ground patches — fewer and farther apart
    for (let i = 0; i < 60; i++) {
      const x = rng() * W, y = rng() * H;
      const r = 80 + rng() * 180;
      g.fillStyle(rng() < 0.5 ? 0x13131f : 0x0e1820, 0.5);
      g.fillEllipse(x, y, r * 2, r * 1.3);
    }

    // Stone patches in mid-ring only
    for (let i = 0; i < 24; i++) {
      const angle = rng() * Math.PI * 2;
      const dist  = 350 + rng() * 700;
      g.fillStyle(0x1e2530, 0.4);
      g.fillEllipse(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist,
        100 + rng() * 160, 60 + rng() * 90);
    }

    // World edge darkening
    g.fillStyle(0x0a0a12, 0.8);
    g.fillRect(0, 0, W, 100); g.fillRect(0, H - 100, W, 100);
    g.fillRect(0, 0, 100, H); g.fillRect(W - 100, 0, 100, H);
  },

  drawGroundDetail(scene, cx, cy, W, H) {
    const rng  = this._seededRng(77);
    const g    = scene.add.graphics();
    const altarR = 220; // avoid drawing over center altar

    const away = (x, y) => {
      const dx = x - cx, dy = y - cy;
      return Math.sqrt(dx*dx + dy*dy) > altarR;
    };

    // ── Dirt / earth variation patches ───────────────────────────────────
    // Large irregular patches give the ground uneven earthy tones
    for (let i = 0; i < 180; i++) {
      const x = rng() * W, y = rng() * H;
      if (!away(x, y)) continue;
      const r   = 30 + rng() * 90;
      const col = [0x0e1009, 0x0c0e08, 0x111309, 0x0f110a, 0x0d1208][Math.floor(rng() * 5)];
      g.fillStyle(col, 0.55 + rng() * 0.3);
      g.fillEllipse(x, y, r * 2, r * (0.4 + rng() * 0.5));
    }

    // ── Gravel clusters ───────────────────────────────────────────────────
    // Groups of small dark pebbles scattered across the world
    for (let i = 0; i < 120; i++) {
      const cx2 = rng() * W, cy2 = rng() * H;
      if (!away(cx2, cy2)) continue;
      const count = 4 + Math.floor(rng() * 7);
      for (let j = 0; j < count; j++) {
        const px = cx2 + (rng() - 0.5) * 60;
        const py = cy2 + (rng() - 0.5) * 40;
        const pw = 3 + rng() * 9;
        const ph = pw * (0.4 + rng() * 0.4);
        const col = [0x1c1a12, 0x18160f, 0x201e15, 0x16140d][Math.floor(rng() * 4)];
        g.fillStyle(col, 0.75 + rng() * 0.25);
        g.fillEllipse(px, py, pw, ph);
        // Slight highlight on top edge for pebble feel
        g.fillStyle(0x28261c, 0.35);
        g.fillEllipse(px - pw * 0.15, py - ph * 0.2, pw * 0.55, ph * 0.4);
      }
    }

    // ── Grass tuft clusters ───────────────────────────────────────────────
    // Short blade-shaped triangles in dark green tones
    const grassColors = [0x0d1e09, 0x112610, 0x152d0e, 0x0f2009, 0x183212];
    for (let i = 0; i < 200; i++) {
      const cx2 = rng() * W, cy2 = rng() * H;
      if (!away(cx2, cy2)) continue;
      const blades = 3 + Math.floor(rng() * 5);
      for (let j = 0; j < blades; j++) {
        const bx  = cx2 + (rng() - 0.5) * 44;
        const by  = cy2 + (rng() - 0.5) * 28;
        const bh  = 8 + rng() * 14;
        const bw  = 2 + rng() * 3;
        // Lean the blade slightly left or right
        const lean = (rng() - 0.5) * 8;
        const col = grassColors[Math.floor(rng() * grassColors.length)];
        g.fillStyle(col, 0.7 + rng() * 0.3);
        g.fillTriangle(bx - bw, by, bx + lean, by - bh, bx + bw, by);
      }
      // Lighter tip highlight on some tufts (moonlit)
      if (rng() > 0.6) {
        g.fillStyle(0x1e3d14, 0.3);
        g.fillTriangle(cx2, cy2, cx2 + (rng()-0.5)*4, cy2 - 10 - rng()*8, cx2+2, cy2);
      }
    }

    // ── Moss patches on stone areas ────────────────────────────────────────
    // Dark teal-green splotches near the mid-ring (ruins area)
    for (let i = 0; i < 50; i++) {
      const angle = rng() * Math.PI * 2;
      const dist  = 200 + rng() * 800;
      const x = cx + Math.cos(angle) * dist;
      const y2 = cy + Math.sin(angle) * dist;
      if (x < 40 || x > W-40 || y2 < 40 || y2 > H-40) continue;
      g.fillStyle(0x0d2012, 0.4 + rng() * 0.35);
      g.fillEllipse(x, y2, 18 + rng() * 36, 8 + rng() * 16);
    }
  },

  drawStonePaths(scene, cx, cy) {
    const g = scene.add.graphics();
    const roadW = 90, roadLen = 1400;

    g.fillStyle(0x1a2030, 0.6);
    g.fillRect(cx - roadW / 2, cy - roadLen, roadW, roadLen);
    g.fillRect(cx - roadW / 2, cy,            roadW, roadLen);
    g.fillRect(cx - roadLen,   cy - roadW / 2, roadLen, roadW);
    g.fillRect(cx,             cy - roadW / 2, roadLen, roadW);

    // Paving stones
    g.fillStyle(0x222c3a, 0.45);
    for (let d = 60; d < 1380; d += 64) {
      g.fillRect(cx - 40, cy - d - 26, 80, 24);
      g.fillRect(cx - 40, cy + d + 2,  80, 24);
      g.fillRect(cx - d - 26, cy - 40, 24, 80);
      g.fillRect(cx + d + 2,  cy - 40, 24, 80);
    }
  },

  drawCenterAltar(scene, cx, cy) {
    const g = scene.add.graphics();

    // Plaza
    g.fillStyle(0x1e2535, 0.9); g.fillCircle(cx, cy, 190);
    g.fillStyle(0x252f3d, 1);   g.fillCircle(cx, cy, 140);

    // Ring lines
    g.lineStyle(1, 0x334466, 0.4);
    [50, 95, 140].forEach(r => g.strokeCircle(cx, cy, r));
    g.lineBetween(cx - 140, cy, cx + 140, cy);
    g.lineBetween(cx, cy - 140, cx, cy + 140);

    // Altar stone
    g.fillStyle(0x3a4555, 1); g.fillRect(cx - 28, cy - 18, 56, 36);
    g.fillStyle(0x445566, 1); g.fillRect(cx - 22, cy - 14, 44, 28);
    g.fillStyle(0x4466aa, 0.5);
    g.fillRect(cx - 16, cy - 3, 32, 3);
    g.fillRect(cx - 3, cy - 10, 3, 18);

    // Torches at corners of plaza — use animated helper
    [0.25, 0.75, 1.25, 1.75].forEach(frac => {
      const a = frac * Math.PI;
      this._placeTorch(scene, cx + Math.cos(a) * 120, cy + Math.sin(a) * 120);
    });

    // Standing stones ring
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.fillStyle(0x445566, 1);
      g.fillRect(cx + Math.cos(a) * 175 - 7, cy + Math.sin(a) * 175 - 12, 14, 24);
      g.fillStyle(0x556677, 1);
      g.fillRect(cx + Math.cos(a) * 175 - 5, cy + Math.sin(a) * 175 - 8, 10, 16);
    }
  },

  scatterObjects(scene, cx, cy, W, H) {
    const rng   = this._seededRng(123);
    const obstacles = [];

    // place(key, count, minDist, maxDist, scaleMin, scaleMax, isObstacle)
    const place = (key, count, minDist, maxDist, scaleMin, scaleMax, isObstacle = false) => {
      let placed = 0, tries = 0;
      while (placed < count && tries < count * 30) {
        tries++;
        const angle = rng() * Math.PI * 2;
        const dist  = minDist + rng() * (maxDist - minDist);
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;
        if (x < 80 || x > W - 80 || y < 80 || y > H - 80) continue;

        const scale = scaleMin + rng() * (scaleMax - scaleMin);
        const spr = scene.add.sprite(x, y, key)
          .setScale(scale)
          .setDepth(Math.floor(y / 10));

        if (isObstacle) obstacles.push(spr);
        placed++;
      }
    };

    // ── Obstacles (physics-blocked) ───────────────────────────────────────
    place('rock_large',     12, 220, 1480, 1.0, 1.5, true);
    place('pillar_broken',   8, 200, 600,  0.9, 1.3, true);

    // ── Decorative (no physics) ───────────────────────────────────────────
    place('gravestone',     22, 250, 1000, 0.9, 1.2);
    place('rock_small',     20, 200, 1480, 0.9, 1.3);
    place('bush',           22, 200, 1480, 0.9, 1.4);
    place('bone_pile',      12, 220, 1480, 0.9, 1.1);
    place('barrel',          8, 250, 1100, 1.0, 1.2);
    place('tree_round',     20, 500, 1540, 1.0, 1.4);
    place('tree_pine',      20, 550, 1560, 1.0, 1.5);

    return obstacles;
  },

  // ── Torch helper: sprite + glow circle + flicker tween ──────────────────
  _placeTorch(scene, x, y) {
    const depth = Math.floor(y / 10);

    // Glow drawn at local origin so scale tweening works correctly
    const glow = scene.add.graphics();
    glow.setPosition(x, y).setDepth(depth);
    glow.fillStyle(0xff7700, 0.10);
    glow.fillCircle(0, 0, 28);
    glow.fillStyle(0xff5500, 0.04);
    glow.fillCircle(0, 0, 48);

    scene.add.sprite(x, y, 'torch').setDepth(depth + 1);

    const dur   = 160 + Math.random() * 140;
    const delay = Math.random() * 700;

    scene.tweens.add({
      targets: glow,
      scaleX: { from: 0.78, to: 1.22 },
      scaleY: { from: 0.78, to: 1.22 },
      alpha:  { from: 0.65, to: 1.00 },
      duration: dur,
      yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut',
      delay
    });
  },

  // ── Torches along the four road arms ────────────────────────────────────
  placeTorchesAlongPaths(scene, cx, cy) {
    const off = 52; // distance from road centre to torch
    [300, 560, 820, 1080, 1340].forEach(d => {
      this._placeTorch(scene, cx - off, cy - d); // N left
      this._placeTorch(scene, cx + off, cy - d); // N right
      this._placeTorch(scene, cx - off, cy + d); // S left
      this._placeTorch(scene, cx + off, cy + d); // S right
      this._placeTorch(scene, cx - d, cy - off); // W top
      this._placeTorch(scene, cx - d, cy + off); // W bottom
      this._placeTorch(scene, cx + d, cy - off); // E top
      this._placeTorch(scene, cx + d, cy + off); // E bottom
    });
  },

  _seededRng(seed) {
    let s = seed;
    return () => {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
};
