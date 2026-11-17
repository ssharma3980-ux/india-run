/* Procedural props — original architecture-inspired models built from primitives */
(function () {
  const P = (IR.P = {});
  const PI = Math.PI;

  /* context helpers (x = lateral, y = up, d = distance along run) */
  P.ctx = (b, r, group) => {
    const c = { b, r, group, anim: [], glows: [] };
    c.put = (mat, geo, x, y, d, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => b.p(mat, geo, x, y, -d, rx, ry, rz, sx, sy, sz);
    c.box = (mat, w, h, dd, x, y, d, ry = 0, ts = 0) => {
      if (ts) b.add(mat, IR.box(w, h, dd, ts), IR.mat4(x, y, -d, 0, ry, 0));
      else b.p(mat, IR.G.box, x, y, -d, 0, ry, 0, w, h, dd);
    };
    c.cyl = (mat, rad, h, x, y, d, rx = 0, ry = 0, rz = 0, geo) => b.p(mat, geo || IR.G.cyl, x, y, -d, rx, ry, rz, rad, h, rad);
    c.glow = (x, y, d, size = 1, col) => c.glows.push(x, y, -d, size);
    return c;
  };

  /* shared flag geometry (animated once per frame) */
  P.initFlag = () => {
    const g = new THREE.PlaneGeometry(1.5, 1.0, 12, 4);
    g.translate(0.75, 0, 0);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setY(i, y * (1 - (x / 1.5) * 0.55)); }
    g.userData.base = Float32Array.from(p.array);
    P.flagGeo = g;
  };
  P.animateFlags = (t) => {
    const g = P.flagGeo, p = g.attributes.position, b = g.userData.base;
    for (let i = 0; i < p.count; i++) {
      const x = b[i * 3];
      p.array[i * 3 + 2] = Math.sin(x * 3.2 - t * 7) * 0.14 * x + Math.sin(x * 7 - t * 11) * 0.03 * x;
    }
    p.needsUpdate = true;
    g.computeVertexNormals();
  };
  P.flag = (c, x, y, d, ry = 0, mat) => {
    const m = new THREE.Mesh(P.flagGeo, mat || IR.M.saffron);
    m.position.set(x, y, -d); m.rotation.y = ry;
    c.group.add(m);
    return m;
  };
  P.flagPole = (c, x, d, h = 5, ry = PI / 2) => {
    const M = IR.M;
    c.cyl(M.woodDark, 0.06, h, x, h / 2, d);
    c.put(M.brass, IR.G.sphLo, x, h + 0.08, d, 0, 0, 0, 0.1);
    P.flag(c, x, h - 0.55, d, ry);
  };

  P.garland = (c, x1, y1, d1, x2, y2, d2, sag = 0.6, n = 18, sc = 0.075) => {
    const M = IR.M;
    for (let i = 0; i <= n; i++) {
      const t = i / n, s = 4 * t * (1 - t);
      c.put(i % 3 === 0 ? M.marigoldY : M.marigold, IR.G.ico, IR.lerp(x1, x2, t), IR.lerp(y1, y2, t) - s * sag, IR.lerp(d1, d2, t), i, i * 2, 0, sc);
    }
  };
  P.strand = (c, x, y, d, len, n = 8) => {
    const M = IR.M;
    for (let i = 0; i < n; i++) c.put(i % 2 ? M.marigoldY : M.marigold, IR.G.ico, x, y - (i / n) * len, d, i, 0, 0, 0.07);
  };

  P.pillar = (c, x, d, h, mat, top = 'kalash') => {
    const M = IR.M;
    c.box(mat, 0.75, 0.35, 0.75, x, 0.175, d);
    c.box(mat, 0.5, h - 0.7, 0.5, x, 0.35 + (h - 0.7) / 2, d, 0, 2);
    c.box(mat, 0.6, 0.12, 0.6, x, h * 0.55, d);
    c.box(mat, 0.8, 0.35, 0.8, x, h - 0.175, d);
    if (top === 'kalash') c.put(M.brass, IR.G.kalash, x, h, d, 0, 0, 0, 0.22, 0.3, 0.22);
    else if (top === 'ball') c.put(mat, IR.G.sph, x, h + 0.15, d, 0, 0, 0, 0.2);
  };

  P.pot = (c, x, y, d, sc = 0.5, mat) => { c.put(mat || IR.M.terracotta, IR.G.pot, x, y, d, 0, c.r() * 6, 0, sc); };
  P.flowerPot = (c, x, y, d) => {
    P.pot(c, x, y, d, 0.42, IR.M.clay);
    for (let i = 0; i < 6; i++) c.put(i % 2 ? IR.M.marigold : IR.M.marigoldY, IR.G.ico1, x + (c.r() - 0.5) * 0.3, y + 0.42 + c.r() * 0.15, d + (c.r() - 0.5) * 0.3, 0, 0, 0, 0.11);
  };
  P.diya = (c, x, y, d) => {
    c.put(IR.M.clay, IR.G.diya, x, y, d, 0, 0, 0, 0.12, 0.1, 0.12);
    c.put(IR.M.flame, IR.G.cone, x, y + 0.07, d, 0, 0, 0, 0.025, 0.08, 0.025);
    c.glow(x, y + 0.1, d, 0.9);
  };

  P.crate = (c, x, y, d, s = 1, ry = 0) => {
    const M = IR.M;
    c.box(M.woodLight, s, s, s, x, y + s / 2, d, ry);
    const e = s * 0.09;
    for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) c.box(M.woodDark, e, s * 1.01, e, x + (dx * s) / 2.1, y + s / 2, d + (dz * s) / 2.1, ry);
    c.box(M.woodDark, s * 1.01, e, s * 1.01, x, y + s * 0.95, d, ry);
    c.box(M.woodDark, s * 1.01, e, s * 1.01, x, y + s * 0.05, d, ry);
    c.box(M.woodDark, s * 1.02, e, e, x, y + s / 2, d - s / 2.05, ry, 0);
  };

  P.umbrella = (c, x, y, d, col) => {
    c.cyl(IR.M.bamboo, 0.05, 2.6, x, y + 1.3, d);
    c.put(col || IR.M.bamboo, IR.G.umbrella, x, y + 2.3, d, 0, 0, 0, 1.6, 1.1, 1.6);
  };

  P.chhatri = (c, x, y, d, s = 1, mat, domeMat) => {
    const M = IR.M; mat = mat || M.stonePlain;
    c.box(mat, 1.8 * s, 0.2 * s, 1.8 * s, x, y + 0.1 * s, d);
    for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) c.box(mat, 0.16 * s, 1.1 * s, 0.16 * s, x + dx * 0.7 * s, y + 0.75 * s, d + dz * 0.7 * s);
    c.box(mat, 2.0 * s, 0.16 * s, 2.0 * s, x, y + 1.38 * s, d);
    c.put(domeMat || mat, IR.G.flatDome, x, y + 1.45 * s, d, 0, 0, 0, 0.85 * s);
    c.put(M.brass, IR.G.kalash, x, y + 2.35 * s, d, 0, 0, 0, 0.12 * s, 0.25 * s, 0.12 * s);
  };

  /* Multi-storey haveli. s = side sign, u = distance from path edge (4m) to front face */
  P.haveli = (c, s, u, d, len, depth, H, base, facades, o = {}) => {
    const M = IR.M, r = c.r;
    const fx = s * (4 + u), cx = s * (4 + u + depth / 2);
    const fac = IR.pick(r, facades);
    c.box(fac, depth, H, len, cx, base + H / 2, d, 0, 8);
    const trim = o.trim || M.whitePlaster;
    c.box(trim, depth + 0.5, 0.35, len + 0.5, cx, base + H + 0.17, d);
    c.box(trim, 0.25, 0.6, len, fx - s * -0.1, base + H + 0.6, d);
    for (let fl = 4; fl < H - 1; fl += 4) c.box(trim, 0.3, 0.18, len + 0.2, fx - s * 0.1, base + fl, d);
    if (r() < 0.6) {
      const bh = base + 4 + Math.floor(r() * Math.max(1, (H - 6) / 4)) * 4;
      c.box(trim, 0.9, 0.18, len * 0.55, fx - s * 0.45, bh, d);
      c.box(o.rail || M.woodDark, 0.06, 0.8, len * 0.55, fx - s * 0.88, bh + 0.45, d);
      if (r() < 0.6) c.put(IR.pick(r, M.awning), IR.G.box, fx - s * 0.6, bh + 2.6, d, 0, 0, s * 0.45, 1.4, 0.05, len * 0.6);
    }
    if (o.chhatri !== false && r() < 0.45) P.chhatri(c, cx + (r() - 0.5) * depth * 0.3, base + H + 0.35, d + (r() - 0.5) * len * 0.3, 0.9 + r() * 0.5, o.chMat, o.domeMat);
    if (o.dome && r() < 0.3) c.put(o.domeMat || M.whitePlaster, IR.G.dome, cx, base + H + 0.35, d, 0, 0, 0, 1.6, 1.4, 1.6);
  };

  /* Nagara-style temple tower (inspired, not a replica) */
  P.temple = (c, s, u, d, base, sc = 1, mat) => {
    const M = IR.M; mat = mat || M.temple;
    const cx = s * (4 + u + 4 * sc);
    c.box(mat, 8 * sc, 1.4 * sc, 8 * sc, cx, base + 0.7 * sc, d);
    c.box(mat, 6.4 * sc, 0.3 * sc, 6.4 * sc, cx, base + 1.55 * sc, d);
    const tb = base + 1.7 * sc;
    c.box(mat, 5 * sc, 3.4 * sc, 5 * sc, cx, tb + 1.7 * sc, d);
    for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) c.box(mat, 0.5 * sc, 3.4 * sc, 0.5 * sc, cx + dx * 2.6 * sc, tb + 1.7 * sc, d + dz * 2.6 * sc);
    c.box(mat, 5.8 * sc, 0.35 * sc, 5.8 * sc, cx, tb + 3.55 * sc, d);
    const st = tb + 3.7 * sc;
    c.put(mat, IR.G.shikhara, cx, st, d, 0, PI / 12, 0, 2.6 * sc, 3.0 * sc, 2.6 * sc);
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) c.put(mat, IR.G.shikhara, cx + dx * 1.95 * sc, st, d + dz * 1.95 * sc, 0, 0, 0, 1.0 * sc, 1.35 * sc, 1.0 * sc);
    for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) c.put(mat, IR.G.shikhara, cx + dx * 1.75 * sc, st, d + dz * 1.75 * sc, 0, 0, 0, 0.7 * sc, 0.9 * sc, 0.7 * sc);
    const top = st + 3.52 * 3.0 * sc;
    c.put(mat, IR.G.amalaka, cx, top - 0.05, d, PI / 2, 0, 0, 0.42 * sc, 0.42 * sc, 0.42 * sc);
    c.put(M.gold, IR.G.kalash, cx, top + 0.15, d, 0, 0, 0, 0.32 * sc, 0.55 * sc, 0.32 * sc);
    c.cyl(M.woodDark, 0.03, 1.6 * sc, cx, top + 1.2 * sc, d);
    P.flag(c, cx, top + 1.6 * sc, d, s > 0 ? PI : 0);
    // bells & garland on entry
    P.garland(c, cx - s * 2.6 * sc, tb + 3.2 * sc, d - 2.6 * sc, cx - s * 2.6 * sc, tb + 3.2 * sc, d + 2.6 * sc, 0.8, 22);
  };

  P.pine = (c, x, y, d, h, snowy) => {
    const M = IR.M;
    c.cyl(M.trunk, 0.18, h * 0.3, x, y + h * 0.15, d);
    for (let i = 0; i < 4; i++) {
      const t = i / 4, rad = (1 - t) * h * 0.26 + 0.3, yy = y + h * 0.22 + t * h * 0.62;
      c.put(M.pine, IR.G.cone8, x, yy + h * 0.13, d, 0, i, 0, rad, h * 0.3, rad);
      if (snowy) c.put(M.snow, IR.G.cone8, x, yy + h * 0.2, d, 0, i, 0, rad * 0.75, h * 0.16, rad * 0.75);
    }
  };
  P.tree = (c, x, y, d, h, mat) => {
    const M = IR.M, r = c.r;
    c.cyl(M.trunk, 0.22, h * 0.55, x, y + h * 0.27, d, 0, 0, (r() - 0.5) * 0.15, IR.G.cylT);
    for (let i = 0; i < 6; i++) c.put(mat || (i % 2 ? M.leaf : M.leafDark), IR.G.ico1, x + (r() - 0.5) * h * 0.4, y + h * (0.6 + r() * 0.3), d + (r() - 0.5) * h * 0.4, r(), r(), 0, h * (0.18 + r() * 0.1));
  };
  P.palm = (c, x, y, d, h) => {
    const M = IR.M, r = c.r; let px = x, py = y, lean = (r() - 0.5) * 0.25;
    for (let i = 0; i < 6; i++) { c.cyl(M.trunk, 0.16 - i * 0.012, h / 6 + 0.05, px, py + h / 12, d, 0, 0, lean); px -= Math.sin(lean) * (h / 6); py += h / 6; }
    for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2; c.put(M.palm, IR.G.box, px + Math.cos(a) * 1.1, py - 0.2, d + Math.sin(a) * 1.1, 0, -a, -0.45, 2.4, 0.04, 0.45); }
  };
  P.lamp = (c, x, y, d, h = 4.5, style = 'heritage') => {
    const M = IR.M;
    c.cyl(M.iron, 0.07, h, x, y + h / 2, d);
    c.cyl(M.iron, 0.14, 0.5, x, y + 0.25, d);
    if (style === 'modern') { c.box(M.iron, 0.12, 0.1, 1.6, x, y + h, d - 0.7); c.box(M.lampGlow, 0.25, 0.08, 0.5, x, y + h - 0.08, d - 1.3); c.glow(x, y + h - 0.2, d - 1.3, 3); }
    else { c.put(M.iron, IR.G.cone4, x, y + h + 0.55, d, 0, PI / 4, 0, 0.32, 0.3, 0.32); c.box(M.lampGlow, 0.3, 0.45, 0.3, x, y + h + 0.2, d); c.glow(x, y + h + 0.2, d, 2.4); }
  };

  /* Boats are separate groups so they can bob on the water */
  P.boat = (c, x, y, d, kind, ry = 0) => {
    const M = IR.M, r = c.r, g = new THREE.Group(), b = new IR.Batcher(), k = P.ctx(b, r, g);
    const hullCol = IR.pick(r, ['#2f6fa0', '#a8322a', '#2e7d4f', '#d08a2a', '#6b3a8a', '#e0e0d0']);
    const hull = new THREE.MeshStandardMaterial({ color: hullCol, roughness: 0.6 });
    const L = kind === 'house' ? 9 : kind === 'shikara' ? 3.6 : 2.6 + r();
    k.put(hull, IR.G.hull, 0, 0.45, 0, 0, 0, 0, kind === 'house' ? 1.6 : 0.95, 0.75, L);
    k.put(M.woodDark, IR.G.box, 0, 0.42, 0, 0, 0, 0, kind === 'house' ? 3.1 : 1.8, 0.08, L * 1.7);
    if (kind === 'shikara') {
      for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) k.cyl(M.woodDark, 0.04, 1.4, dx * 0.7, 1.15, dz * 1.4);
      k.put(IR.pick(r, M.cloth), IR.G.box, 0, 1.9, 0, 0, 0, 0, 1.7, 0.12, 3.2);
      k.put(IR.pick(r, M.cloth), IR.G.box, 0, 0.62, 0, 0, 0, 0, 1.3, 0.22, 2.4);
    } else if (kind === 'house') {
      k.box(IR.M.facade.chalet[0], 3.2, 2.6, 14, 0, 1.75, 0, 0, 8);
      k.put(M.roofGreen, IR.G.box, 0.7, 3.35, 0, 0, 0, 0.32, 1.9, 0.14, 14.4);
      k.put(M.roofGreen, IR.G.box, -0.7, 3.35, 0, 0, 0, -0.32, 1.9, 0.14, 14.4);
      k.put(M.snow, IR.G.box, 0, 3.62, 0, 0, 0, 0, 0.5, 0.12, 14.4);
    } else {
      k.put(M.woodLight, IR.G.box, 0, 0.62, 0, 0, 0, 0, 1.4, 0.08, 0.35);
      if (r() < 0.6) {
        for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) k.cyl(M.woodDark, 0.035, 1.3, dx * 0.6, 1.05, dz * 0.9);
        k.put(IR.pick(r, M.awning), IR.G.box, 0, 1.72, 0, 0, 0, 0, 1.5, 0.08, 2.2);
      }
    }
    b.build(g, { cast: false });
    g.position.set(x, y, -d); g.rotation.y = ry;
    c.group.add(g);
    c.anim.push({ obj: g, y, ph: r() * 6, amp: kind === 'house' ? 0.04 : 0.09 });
    return g;
  };

  P.chalet = (c, x, y, d, w, dd, snowy = true) => {
    const M = IR.M, h = 3.6;
    c.box(M.stoneGrey, w + 0.3, 0.8, dd + 0.3, x, y + 0.4, d);
    c.box(IR.pick(c.r, M.facade.chalet), w, h, dd, x, y + 0.8 + h / 2, d, 0, 8);
    const rh = y + 0.8 + h, rw = w / 2 + 0.6;
    c.put(M.roofTile, IR.G.box, x + rw / 2 - 0.05, rh + 0.75, d, 0, 0, -0.62, rw * 1.18, 0.18, dd + 0.8);
    c.put(M.roofTile, IR.G.box, x - rw / 2 + 0.05, rh + 0.75, d, 0, 0, 0.62, rw * 1.18, 0.18, dd + 0.8);
    if (snowy) {
      c.put(M.snow, IR.G.box, x + rw / 2 - 0.05, rh + 0.88, d, 0, 0, -0.62, rw * 1.12, 0.14, dd + 0.85);
      c.put(M.snow, IR.G.box, x - rw / 2 + 0.05, rh + 0.88, d, 0, 0, 0.62, rw * 1.12, 0.14, dd + 0.85);
    }
    c.box(M.stoneDark, 0.6, 2.4, 0.6, x + w * 0.25, rh + 1.4, d + dd * 0.25);
  };

  P.stall = (c, s, u, d, len) => {
    const M = IR.M, r = c.r, x = s * (4 + u + 1.4);
    c.box(M.woodLight, 2.4, 0.9, len, x, 0.45, d);
    for (const dz of [-1, 1]) for (const dx of [-1, 1]) c.cyl(M.woodDark, 0.05, 2.6, x + dx * 1.15, 1.3, d + dz * (len / 2 - 0.1));
    c.put(IR.pick(r, M.awning), IR.G.box, x - s * 0.35, 2.75, d, 0, 0, s * 0.28, 3.4, 0.06, len + 0.4);
    const n = Math.floor(len / 0.6);
    for (let i = 0; i < n; i++) {
      const t = r();
      if (t < 0.4) P.pot(c, x + (r() - 0.5) * 1.6, 0.9, d - len / 2 + 0.3 + i * 0.6, 0.35 + r() * 0.2, r() < 0.5 ? M.terracotta : M.brass);
      else if (t < 0.7) c.put(IR.pick(r, [M.marigold, M.rose, M.leaf, M.marigoldY]), IR.G.ico1, x + (r() - 0.5) * 1.6, 1.05, d - len / 2 + 0.3 + i * 0.6, 0, 0, 0, 0.2);
      else c.put(IR.pick(r, M.cloth), IR.G.box, x - s * 1.18, 1.7, d - len / 2 + 0.3 + i * 0.6, 0, 0, 0, 0.04, 1.4, 0.5);
    }
  };

  P.tower = (c, s, u, d, len, depth, H, fac) => {
    const M = IR.M, cx = s * (4 + u + depth / 2);
    c.box(fac, depth, H, len, cx, H / 2, d, 0, 8);
    c.box(M.stoneGrey, depth + 0.4, 0.4, len + 0.4, cx, H + 0.2, d);
    if (c.r() < 0.5) c.box(M.iron, 0.1, 4, 0.1, cx, H + 2.2, d);
  };

  P.fortWall = (c, s, u, d0, d1, H, mat) => {
    const M = IR.M, len = d1 - d0, x = s * (4 + u + 1.5);
    c.box(mat, 3, H, len, x, H / 2, (d0 + d1) / 2, 0, 4);
    for (let d = d0 + 0.6; d < d1 - 0.4; d += 1.5) { c.box(mat, 0.6, 0.9, 0.8, x - s * 1.2, H + 0.45, d); c.put(mat, IR.G.hemi, x - s * 1.2, H + 0.9, d, 0, 0, 0, 0.4, 0.3, 0.4); }
  };

  P.welcomeGate = (c, d, th, lang) => {
    const M = IR.M, mat = th.gateMat ? M[th.gateMat] : M.stone, H = 7.2;
    for (const s of [-1, 1]) {
      c.box(mat, 1.6, H, 1.6, s * 5, H / 2, d, 0, 2);
      c.box(mat, 2, 0.5, 2, s * 5, 0.25, d);
      P.chhatri(c, s * 5, H + 0.6, d, 0.9, mat, th.domeMat ? M[th.domeMat] : mat);
    }
    c.box(mat, 12, 1.2, 1.8, 0, H, d);
    c.box(mat, 11, 0.4, 2, 0, H - 0.8, d);
    const tex = IR.tex.banner([th.names.en.toUpperCase(), th.names.hi + ' • ' + th.names.gu], th.gateBg || ['#7a1c1c', '#3a0c0c'], '#ffd36a');
    const m = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 2.1), new THREE.MeshBasicMaterial({ map: tex, fog: true, toneMapped: false }));
    m.position.set(0, H - 1.85, -d + 0.95);
    m.geometry.userData.own = true;
    const m2 = m.clone(); m2.position.z = -d - 0.95; m2.rotation.y = PI;
    c.group.add(m, m2);
    P.garland(c, -4.2, H - 3, d + 0.95, 4.2, H - 3, d + 0.95, 1.2, 40);
    P.flagPole(c, -5, d, H + 3.5); P.flagPole(c, 5, d, H + 3.5);
  };

  /* Junction blocker: ornate wall with turn arrows */
  P.junctionWall = (c, L, turn, th) => {
    const M = IR.M, mat = th.gateMat ? M[th.gateMat] : M.stone;
    const far = L + 4.6, outer = -turn;
    c.box(mat, 10.4, 5.5, 1.2, outer * 0.6, 2.75, far, 0, 4);
    c.box(mat, 1.2, 5.5, 9.2, outer * 4.6, 2.75, L, 0, 4);
    c.box(mat, 11, 0.5, 1.6, outer * 0.6, 5.75, far);
    for (let i = -2; i <= 2; i++) P.chhatri(c, i * 2.2, 6, far, 0.55, mat, th.domeMat ? M[th.domeMat] : mat);
    // arrows
    const tex = IR.tex.arrow || (IR.tex.arrow = (() => { const cvs = IR.tex.cv(256, 128), x = cvs.getContext('2d'); x.fillStyle = '#ffcf3a'; x.strokeStyle = '#7a3a00'; x.lineWidth = 8; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(30 + i * 70, 64); x.lineTo(80 + i * 70, 14); x.lineTo(104 + i * 70, 14); x.lineTo(54 + i * 70, 64); x.lineTo(104 + i * 70, 114); x.lineTo(80 + i * 70, 114); x.closePath(); x.fill(); x.stroke(); } const t = new THREE.CanvasTexture(cvs); t.colorSpace = THREE.SRGBColorSpace; return t; })());
    const am = new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide });
    const a = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), am);
    a.geometry.userData.own = true;
    a.position.set(0, 2.6, -(far - 0.62)); if (turn > 0) a.scale.x = -1;
    c.group.add(a);
    P.garland(c, -4.6, 4.6, far - 0.65, 4.6, 4.6, far - 0.65, 0.9, 34);
  };
})();
