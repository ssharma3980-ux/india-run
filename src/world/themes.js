/* City themes: atmosphere, audio palette, decor builders, obstacle styles */
(function () {
  const P = IR.P, PI = Math.PI;
  const M = () => IR.M;

  /* ---------- shared side pieces ---------- */
  function railing(c, s, d0, d1, mat, rodMat, spacing = 3) {
    const x = s * 3.85;
    for (let d = d0; d <= d1; d += spacing) {
      c.box(mat, 0.42, 1.05, 0.42, x, 0.52, d, 0, 2);
      c.box(mat, 0.56, 0.16, 0.56, x, 1.12, d);
      c.put(mat, IR.G.sph, x, 1.32, d, 0, 0, 0, 0.17);
    }
    const len = d1 - d0, mid = (d0 + d1) / 2;
    c.cyl(rodMat, 0.045, len, x, 0.5, mid, PI / 2);
    c.cyl(rodMat, 0.045, len, x, 0.88, mid, PI / 2);
  }
  function sidewalk(c, s, d0, d1, w, mat, h = 0.22) {
    c.box(mat, w, h, d1 - d0, s * (4 + w / 2), h / 2, (d0 + d1) / 2, 0, 3);
  }
  function landBase(c, s, d0, d1, u0, top, mat) {
    const w = 42 - u0;
    c.box(mat, w, top + 3, d1 - d0, s * (4 + u0 + w / 2), (top - 3) / 2, (d0 + d1) / 2, 0, 4);
  }
  function rowBuildings(c, s, d0, d1, u, base, fn) {
    let d = d0 + 0.5;
    while (d < d1 - 3) {
      const len = Math.min(d1 - d - 0.5, 6 + c.r() * 7);
      if (len < 3) break;
      fn(d + len / 2, len);
      d += len + c.r() * 1.2;
    }
  }

  /* ---------- VARANASI ---------- */
  function varanasiLand(c, s, d0, d1) {
    const m = M(), r = c.r, len = d1 - d0, mid = (d0 + d1) / 2;
    for (let k = 0; k < 6; k++) {
      const w = 9.6 - k * 0.8;
      c.box(m.stone, w, 0.36, len, s * (4 + k * 0.8 + w / 2), k * 0.35 + 0.18, mid, 0, 2);
    }
    c.box(m.stone, 34, 5.1, len, s * (4 + 9.6 + 17), -0.45, mid, 0, 4);
    c.box(m.stoneDark, 9.6, 3, len, s * (4 + 4.8), -1.5, mid);
    // pillars + garlands along the ghat edge
    let prev = null;
    for (let d = d0 + 2; d < d1 - 1; d += 6) {
      P.pillar(c, s * 13.2, d, 4.4, m.stone);
      if (prev !== null) P.garland(c, s * 13.2, 4.0, prev, s * 13.2, 4.0, d, 0.9, 20);
      prev = d;
    }
    // ghat life: diyas, pots, umbrellas
    for (let d = d0 + 1; d < d1; d += 1.6 + r() * 2.5) {
      const k = Math.floor(r() * 6), u = k * 0.8 + 0.4, y = (k + 1) * 0.35, x = s * (4 + u);
      const t = r();
      if (t < 0.45) P.diya(c, x, y, d);
      else if (t < 0.6) P.flowerPot(c, x, y, d);
      else if (t < 0.72) P.pot(c, x, y, d, 0.45 + r() * 0.2);
      else if (t < 0.8) c.put(IR.pick(r, m.cloth), IR.G.box, x, y + 0.02, d, 0, r(), 0, 0.9, 0.03, 0.6);
    }
    for (let d = d0 + 4; d < d1 - 2; d += 7 + r() * 8) P.umbrella(c, s * (4 + 10.8 + r() * 1.5), 2.1, d, r() < 0.3 ? IR.pick(r, m.awning) : null);
    // first row: temples & havelis
    rowBuildings(c, s, d0, d1, 14, 2.1, (dc, l) => {
      if (r() < 0.28 && l > 7) P.temple(c, s, 11, dc, 2.1, 0.75 + r() * 0.35, r() < 0.3 ? m.templeRed : m.temple);
      else P.haveli(c, s, 11, dc, l, 8 + r() * 6, 7 + Math.floor(r() * 3) * 4, 2.1, m.facade.ghat, { dome: true });
    });
    // back row (taller)
    rowBuildings(c, s, d0, d1, 26, 2.1, (dc, l) => P.haveli(c, s, 25, dc, l, 8, 12 + Math.floor(r() * 4) * 4, 2.1, m.facade.ghat, { chhatri: r() < 0.5 }));
    rowBuildings(c, s, d0, d1, 34, 2.1, (dc, l) => r() < 0.25 ? P.temple(c, s, 33, dc, 2.1, 1.3 + r() * 0.4, m.temple) : P.haveli(c, s, 34, dc, l, 8, 20 + Math.floor(r() * 4) * 4, 2.1, m.facade.ghat, { chhatri: r() < 0.7 }));
    for (let d = d0 + 3; d < d1; d += 10 + r() * 8) c.put(IR.pick(r, m.awning), IR.G.box, s * (4 + 10.2), 3.0, d, 0, 0, s * 0.35, 2.4, 0.05, 3.2 + r() * 2);
  }
  function riverSide(c, s, d0, d1, th) {
    const m = M(), r = c.r;
    railing(c, s, d0, d1, m.stone, m.iron);
    for (let d = d0 + 4; d < d1; d += 9 + r() * 6) P.flagPole(c, s * 4.15, d, 4.6 + r() * 1.2, s > 0 ? PI / 2 + 0.3 : -PI / 2 - 0.3);
    for (let d = d0 + 8; d < d1; d += 22 + r() * 6) P.lamp(c, s * 3.85, 1.3, d, 2.6);
    const wy = th.floor.y;
    for (let d = d0 + 3; d < d1; d += 6 + r() * 9) P.boat(c, s * (4 + 4 + r() * 26), wy + 0.05, d, 'boat', (r() - 0.5) * 0.8 + (r() < 0.3 ? PI / 2 : 0));
    for (let d = d0; d < d1; d += 5 + r() * 6) c.cyl(m.woodDark, 0.12, 2.4, s * (4 + 2 + r() * 3), wy + 0.4, d);
  }

  /* far river bank: a full ghat city facing the runner across the water */
  function varanasiFar(c, s, d0, d1, th) {
    const m = M(), r = c.r, wy = th.floor.y, u0 = 92, len = d1 - d0, mid = (d0 + d1) / 2;
    for (let k = 0; k < 7; k++) c.box(m.stone, 40 - k * 1.4, 0.7, len, s * (4 + u0 + k * 1.4 + (40 - k * 1.4) / 2), wy + k * 0.7 + 0.35, mid, 0, 2);
    const top = wy + 4.9;
    rowBuildings(c, s, d0, d1, u0 + 10, top, (dc, l) => {
      if (r() < 0.3 && l > 7) P.temple(c, s, u0 + 9, dc, top, 1.0 + r() * 0.5, r() < 0.5 ? m.templeRed : m.temple);
      else P.haveli(c, s, u0 + 9, dc, l, 10, 10 + Math.floor(r() * 5) * 4, top, m.facade.ghat, { dome: true });
    });
    rowBuildings(c, s, d0, d1, u0 + 24, top, (dc, l) => P.haveli(c, s, u0 + 22, dc, l, 12, 18 + Math.floor(r() * 5) * 4, top, m.facade.ghat, { chhatri: r() < 0.6 }));
    for (let d = d0 + 3; d < d1; d += 10 + r() * 8) P.umbrella(c, s * (4 + u0 + 6 + r() * 3), top - 0.7, d, r() < 0.4 ? IR.pick(r, m.awning) : null);
    for (let d = d0 + 5; d < d1; d += 14 + r() * 10) P.boat(c, s * (4 + u0 - 6 - r() * 18), wy + 0.05, d, 'boat', (r() - 0.5) * 0.8);
    for (let d = d0 + 2; d < d1; d += 3 + r() * 4) P.diya(c, s * (4 + u0 + 2 + r() * 5), wy + 1.05 + Math.floor(r() * 5) * 0.7, d);
  }
  function kashmirFar(c, s, d0, d1, th) {
    const m = M(), r = c.r, wy = th.floor.y, u0 = 70;
    c.box(m.snow, 60, 3, d1 - d0, s * (4 + u0 + 30), wy + 0.6, (d0 + d1) / 2);
    for (let d = d0 + 2; d < d1; d += 2.6 + r() * 2) P.pine(c, s * (4 + u0 + 2 + r() * 40), wy + 2.1, d, 8 + r() * 9, true);
    for (let d = d0 + 8; d < d1; d += 22 + r() * 10) P.boat(c, s * (4 + u0 - 6), wy + 0.05, d, 'house', 0);
  }

  /* ---------- KASHMIR ---------- */
  function kashmirLand(c, s, d0, d1) {
    const m = M(), r = c.r;
    landBase(c, s, d0, d1, 1.6, 0.35, m.snow);
    c.box(m.stoneGrey, 1.0, 1.6, d1 - d0, s * (4 + 1.6), -0.6, (d0 + d1) / 2, 0, 3);
    for (let d = d0 + 2; d < d1 - 1; d += 2.2 + r() * 3) {
      const u = 3 + r() * 30;
      if (r() < 0.82) P.pine(c, s * (4 + u), 0.35, d, 5 + r() * 7, true);
      else c.put(m.snow, IR.G.sph, s * (4 + u), 0.2, d, 0, 0, 0, 1 + r(), 0.5, 1 + r());
    }
    for (let d = d0 + 6; d < d1 - 6; d += 16 + r() * 10) P.chalet(c, s * (4 + 9 + r() * 6), 0.35, d, 5 + r() * 2, 6 + r() * 3);
    for (let d = d0 + 5; d < d1; d += 14 + r() * 8) P.lamp(c, s * (4 + 2.4), 0.35, d, 3.2);
    for (let d = d0 + 9; d < d1; d += 20 + r() * 10) P.tree(c, s * (4 + 5 + r() * 4), 0.35, d, 6, m.chinar);
  }
  function kashmirLake(c, s, d0, d1, th) {
    const m = M(), r = c.r, x = s * 3.85;
    for (let d = d0; d <= d1; d += 2.5) { c.cyl(m.woodDark, 0.08, 1.2, x, 0.6, d); c.put(m.snow, IR.G.sphLo, x, 1.22, d, 0, 0, 0, 0.11, 0.06, 0.11); }
    c.cyl(m.rope, 0.03, d1 - d0, x, 0.95, (d0 + d1) / 2, PI / 2);
    c.cyl(m.rope, 0.03, d1 - d0, x, 0.55, (d0 + d1) / 2, PI / 2);
    const wy = th.floor.y;
    for (let d = d0 + 4; d < d1; d += 8 + r() * 8) P.boat(c, s * (4 + 4 + r() * 12), wy + 0.05, d, 'shikara', (r() - 0.5) * 0.6);
    for (let d = d0 + 10; d < d1 - 6; d += 28 + r() * 10) P.boat(c, s * (4 + 20 + r() * 8), wy + 0.05, d, 'house', 0);
    for (let i = 0; i < 6; i++) c.cyl(m.leaf, 0.5 + r() * 0.4, 0.04, s * (4 + 2 + r() * 10), wy + 0.03, d0 + r() * (d1 - d0));
  }

  /* ---------- JAIPUR ---------- */
  function jaipurHaveli(c, s, d0, d1) {
    const m = M(), r = c.r;
    sidewalk(c, s, d0, d1, 2, m.stonePink);
    rowBuildings(c, s, d0, d1, 2, 0, (dc, l) => {
      if (r() < 0.2 && l > 9) {
        // Hawa-Mahal-inspired honeycomb facade (stylised)
        const cx = s * (4 + 2 + 3);
        for (let t = 0; t < 4; t++) {
          const w = l - t * 1.8, h = 5 + t * 3.2;
          c.box(m.facade.pink[0], 5 - t * 0.6, 4 + (t === 0 ? 1 : 0), w, cx + s * t * 0.3, h - 2, dc, 0, 8);
          for (let q = -w / 2 + 0.8; q < w / 2 - 0.5; q += 1.4) c.put(m.whitePlaster, IR.G.hemi, cx - s * (2.5 - t * 0.3 - 0.05), h + 0.1, dc + q, 0, 0, 0, 0.45, 0.35, 0.45);
        }
        P.chhatri(c, cx, 17.2, dc, 1.2, m.stonePink, m.whitePlaster);
      } else P.haveli(c, s, 2, dc, l, 7 + r() * 5, 8 + Math.floor(r() * 3) * 4, 0, m.facade.pink, { chMat: m.stonePink, domeMat: m.whitePlaster });
    });
    for (let d = d0 + 3; d < d1; d += 10 + r() * 10) P.flowerPot(c, s * (4 + 1.4), 0.22, d);
  }
  function jaipurBazaar(c, s, d0, d1) {
    const m = M(), r = c.r;
    sidewalk(c, s, d0, d1, 0.8, m.stonePink);
    let d = d0 + 1;
    while (d < d1 - 4) {
      const len = 3 + r() * 2.5;
      if (r() < 0.8) P.stall(c, s, 0.8, d + len / 2, len);
      else P.tree(c, s * (4 + 2.5), 0, d + len / 2, 6.5);
      d += len + 0.4;
    }
    rowBuildings(c, s, d0, d1, 6, 0, (dc, l) => P.haveli(c, s, 6.5, dc, l, 8, 8 + Math.floor(r() * 3) * 4, 0, m.facade.pink, { chMat: m.stonePink }));
    for (let d2 = d0 + 6; d2 < d1; d2 += 18) P.garland(c, s * 3.9, 3.6, d2, -s * 3.9, 3.6, d2 + 1, 0.7, 30, 0.06);
  }

  /* ---------- MUMBAI ---------- */
  function mumbaiCity(c, s, d0, d1) {
    const m = M(), r = c.r;
    sidewalk(c, s, d0, d1, 3, m.stoneGrey);
    landBase(c, s, d0, d1, 3, 0.22, m.stoneGrey);
    for (let d = d0 + 4; d < d1; d += 12) P.lamp(c, s * (4 + 0.6), 0.22, d, 6, 'modern');
    for (let d = d0 + 9; d < d1; d += 16 + r() * 6) P.tree(c, s * (4 + 1.8), 0.22, d, 5.5);
    rowBuildings(c, s, d0, d1, 3.5, 0, (dc, l) => {
      if (r() < 0.55) P.haveli(c, s, 3.5, dc, l, 10, 12 + Math.floor(r() * 4) * 4, 0.22, m.facade.modern.slice(1, 3), { chhatri: false });
      else P.tower(c, s, 3.5, dc, l, 12, 22 + r() * 30, IR.pick(r, [m.facade.modern[0], m.facade.modern[3]]));
    });
    rowBuildings(c, s, d0, d1, 18, 0, (dc, l) => P.tower(c, s, 18, dc, l, 14, 34 + r() * 40, IR.pick(r, m.facade.modern)));
  }
  function mumbaiSea(c, s, d0, d1, th) {
    const m = M(), r = c.r;
    sidewalk(c, s, d0, d1, 4.5, m.stoneGrey, 0.3);
    c.box(m.stoneGrey, 1, 3.4, d1 - d0, s * (4 + 4.5), -1.4, (d0 + d1) / 2, 0, 3);
    c.box(m.stonePlain, 0.4, 0.75, d1 - d0, s * (4 + 4.3), 0.68, (d0 + d1) / 2, 0, 3);
    for (let d = d0 + 2; d < d1; d += 12) P.lamp(c, s * (4 + 4.0), 0.3, d, 6.5, 'modern');
    for (let d = d0 + 8; d < d1; d += 14 + r() * 8) P.palm(c, s * (4 + 2.2), 0.3, d, 6 + r() * 2);
    const wy = th.floor.y;
    for (let d = d0 + 1; d < d1; d += 1.7) {
      const x = s * (4 + 5.6 + r() * 3), y = wy - 0.2 + r() * 0.4;
      for (let a = 0; a < 4; a++) c.put(m.stonePlain, IR.G.cone, x, y, d, a * 1.6 + r(), a * 1.9, a * 0.8, 0.35, 1.3, 0.35);
    }
  }

  /* ---------- DELHI ---------- */
  function delhiFort(c, s, d0, d1) {
    const m = M(), r = c.r;
    sidewalk(c, s, d0, d1, 2.5, m.stoneRed);
    c.box(m.leaf, 6, 0.15, d1 - d0, s * (4 + 2.5 + 3), 0.05, (d0 + d1) / 2);
    P.fortWall(c, s, 8.5, d0, d1, 10, m.stoneRed);
    for (let d = d0 + 8; d < d1 - 4; d += 26) {
      const x = s * (4 + 8.5 + 1.5);
      c.cyl(m.stoneRed, 2.4, 13, x, 6.5, d, 0, 0, 0, IR.G.cyl);
      P.chhatri(c, x, 13, d, 1.6, m.stoneRed, m.marble);
    }
    for (let d = d0 + 4; d < d1; d += 9 + r() * 4) P.tree(c, s * (4 + 5.5), 0, d, 4.5 + r() * 2);
    for (let d = d0 + 2; d < d1; d += 14) P.lamp(c, s * (4 + 0.6), 0.22, d, 3.6);
  }
  function delhiMarket(c, s, d0, d1) {
    const m = M(), r = c.r;
    sidewalk(c, s, d0, d1, 1.5, m.stoneRed);
    let d = d0 + 1;
    while (d < d1 - 4) { const len = 3 + r() * 2.5; if (r() < 0.6) P.stall(c, s, 1.5, d + len / 2, len); d += len + 0.5; }
    rowBuildings(c, s, d0, d1, 5.5, 0, (dc, l) => P.haveli(c, s, 5.5, dc, l, 9, 8 + Math.floor(r() * 3) * 4, 0, [m.facade.red[1], m.facade.ghat[1], m.facade.ghat[4]], { chMat: m.stoneRed, domeMat: m.marble, dome: true }));
    for (let d2 = d0 + 5; d2 < d1; d2 += 15) P.lamp(c, s * (4 + 0.6), 0.22, d2, 3.6);
  }

  IR.TH = { railing, sidewalk, landBase, rowBuildings, varanasiLand, riverSide, kashmirLand, kashmirLake, jaipurHaveli, jaipurBazaar, mumbaiCity, mumbaiSea, delhiFort, delhiMarket };
  const T = (IR.THEMES = {});
  T.varanasi = {
    id: 'varanasi', names: { en: 'Varanasi', hi: 'वाराणसी', gu: 'વારાણસી' },
    tag: { en: 'Ganga ghats at golden hour', hi: 'सुनहरी शाम में गंगा घाट', gu: 'સોનેરી સાંજે ગંગા ઘાટ' },
    card: ['#ffb36b', '#c2577a', '#3c2a6a'], icon: '🪔',
    atmos: { top: '#6e6cc0', hor: '#ffb070', bot: '#f2b086', sun: '#ffd49a', sunDir: [0.45, 0.05, -1], phys: { turb: 12, ray: 3.4, mie: 0.007, g: 0.86 }, skyExp: 0.5, sunI: 3.1, hemiSky: '#ffd8b8', hemiGround: '#7a5038', hemiI: 1.2, fog: '#f4b98e', fogNear: 55, fogFar: 300, exposure: 0.95, cloud: 0.55, cloudCol: '#ffc4a8' },
    floor: { type: 'water', color: '#4c6c70', y: -1.6 }, pano: { kind: 'ghats', cols: ['#d39a86', '#a8695e'], seed: 7 },
    path: { mat: 'pathFlag', depth: 3, side: 'stone' }, weather: 'motes', weatherColor: '#ffcf7a', birds: true,
    music: { lead: 'flute', scale: [0, 2, 4, 7, 9], root: 62, tempo: 92 }, amb: 'river',
    obst: { hurdle: 'bamboo', banner: 'cloth', block: ['crates', 'pots', 'cart'] },
    left: varanasiLand, right: riverSide, far: varanasiFar, gateMat: 'stone',
  };
  T.kashmir = {
    id: 'kashmir', names: { en: 'Kashmir', hi: 'कश्मीर', gu: 'કાશ્મીર' },
    tag: { en: 'Snowy Dal Lake boardwalks', hi: 'बर्फ़ीली डल झील', gu: 'બરફીલું દાલ સરોવર' },
    card: ['#bfe3ff', '#5d8fd0', '#22406a'], icon: '🏔️',
    atmos: { top: '#3a78cc', hor: '#d4e8f6', bot: '#e2eef8', sun: '#fff3df', sunDir: [-0.45, 0.42, -1], phys: { turb: 1.6, ray: 0.9, mie: 0.004, g: 0.75 }, skyExp: 0.36, sunI: 3.3, hemiSky: '#e4f0ff', hemiGround: '#8d9aa8', hemiI: 1.35, fog: '#d6e6f3', fogNear: 45, fogFar: 270, exposure: 0.78, cloud: 0.45, cloudCol: '#ffffff' },
    floor: { type: 'water', color: '#3e6676', y: -1.3 }, pano: { kind: 'mountains', cols: ['#9db4cf', '#5f7895'], seed: 3 },
    path: { mat: 'pathWood', depth: 0.45, piles: true }, weather: 'snow', birds: true,
    music: { lead: 'santoor', scale: [0, 2, 3, 7, 9], root: 64, tempo: 84 }, amb: 'wind',
    obst: { hurdle: 'log', banner: 'wood', block: ['snowman', 'logs', 'crates'] },
    left: kashmirLand, right: kashmirLake, far: kashmirFar, gateMat: 'woodLight', domeMat: 'roofGreen', gateBg: ['#1f4a6a', '#0d2338'],
  };
  T.jaipur = {
    id: 'jaipur', names: { en: 'Jaipur', hi: 'जयपुर', gu: 'જયપુર' },
    tag: { en: 'Pink City bazaars', hi: 'गुलाबी नगरी के बाज़ार', gu: 'ગુલાબી નગરીના બજાર' },
    card: ['#ffc2a0', '#e06a6a', '#7a2a4a'], icon: '🐫',
    atmos: { top: '#4b86c8', hor: '#ffd8ae', bot: '#f2c9a0', sun: '#ffe2b0', sunDir: [0.6, 0.3, -1], phys: { turb: 6, ray: 1.4, mie: 0.005, g: 0.8 }, skyExp: 0.4, sunI: 3.5, hemiSky: '#ffe6c8', hemiGround: '#b57a5a', hemiI: 1.1, fog: '#f4d0ae', fogNear: 50, fogFar: 300, exposure: 0.95, cloud: 0.25, cloudCol: '#fff4e8' },
    floor: { type: 'ground', y: -0.02, tex: { base: '#d9a77a', dark: 'rgba(150,90,50,.25)', light: 'rgba(255,230,190,.25)' } }, pano: { kind: 'hills', cols: ['#c99a7a', '#9a6a52', '#7a4a3a'], seed: 5 },
    path: { mat: 'pathPink', depth: 0.3 }, weather: 'motes', weatherColor: '#ffd9a0', birds: true,
    music: { lead: 'sitar', scale: [0, 1, 4, 5, 7, 8, 11], root: 60, tempo: 100 }, amb: 'bazaar',
    obst: { hurdle: 'bamboo', banner: 'cloth', block: ['pots', 'cart', 'crates'] },
    left: jaipurHaveli, right: jaipurBazaar, gateMat: 'stonePink', domeMat: 'whitePlaster', gateBg: ['#b0405a', '#5a1a2a'],
  };
  T.mumbai = {
    id: 'mumbai', names: { en: 'Mumbai', hi: 'मुंबई', gu: 'મુંબઈ' },
    tag: { en: 'Monsoon on the sea drive', hi: 'समुद्री सड़क पर मानसून', gu: 'દરિયા કિનારે ચોમાસું' },
    card: ['#8fa6c8', '#3a4a7a', '#141a30'], icon: '🌧️',
    atmos: { top: '#2a3552', hor: '#a08ea2', bot: '#6c6c7c', sun: '#ffbe9a', sunDir: [-0.6, 0.1, -1], phys: { turb: 18, ray: 0.6, mie: 0.02, g: 0.7 }, skyExp: 0.45, sunI: 1.5, hemiSky: '#b8c2dc', hemiGround: '#42424c', hemiI: 1.5, fog: '#7f8598', fogNear: 30, fogFar: 220, exposure: 1.1, cloud: 1.0, cloudCol: '#6d7184' },
    floor: { type: 'water', color: '#2f4b58', y: -1.4 }, pano: { kind: 'skyline', cols: ['#5a6078', '#383c52'], seed: 9 },
    path: { mat: 'pathAsphalt', depth: 3, lanes: true }, weather: 'rain', birds: false,
    music: { lead: 'sitar', scale: [0, 2, 3, 5, 7, 9, 10], root: 57, tempo: 108 }, amb: 'rain',
    obst: { hurdle: 'metal', banner: 'metal', block: ['taxi', 'barrels', 'crates'] },
    left: mumbaiCity, right: mumbaiSea, gateMat: 'stoneGrey', gateBg: ['#2a3a6a', '#101830'],
  };
  T.delhi = {
    id: 'delhi', names: { en: 'Delhi', hi: 'दिल्ली', gu: 'દિલ્હી' },
    tag: { en: 'Red sandstone forts & markets', hi: 'लाल किले और बाज़ार', gu: 'લાલ કિલ્લા અને બજાર' },
    card: ['#ffcf9a', '#c2502a', '#5a1a14'], icon: '🏛️',
    atmos: { top: '#5a8cc8', hor: '#f2d6b0', bot: '#e0c8a8', sun: '#fff0d0', sunDir: [0.3, 0.42, -1], phys: { turb: 7, ray: 1.2, mie: 0.006, g: 0.8 }, skyExp: 0.38, sunI: 3.4, hemiSky: '#fff0dc', hemiGround: '#8a6a4a', hemiI: 1.15, fog: '#ead6ba', fogNear: 50, fogFar: 300, exposure: 0.95, cloud: 0.35, cloudCol: '#ffffff' },
    floor: { type: 'ground', y: -0.02, tex: { base: '#6f8f45', dark: 'rgba(40,70,20,.3)', light: 'rgba(170,200,110,.25)', blades: true } }, pano: { kind: 'delhi', cols: ['#c4a88e', '#8f6f5a'], seed: 11 },
    path: { mat: 'pathRed', depth: 0.3 }, weather: 'motes', weatherColor: '#fff2c0', birds: true,
    music: { lead: 'flute', scale: [0, 2, 4, 5, 7, 9, 11], root: 60, tempo: 96 }, amb: 'city',
    obst: { hurdle: 'bamboo', banner: 'cloth', block: ['cart', 'crates', 'pots'] },
    left: delhiFort, right: delhiMarket, gateMat: 'stoneRed', domeMat: 'marble', gateBg: ['#8a2a1a', '#3a0e08'],
  };
  IR.CITY_ORDER = ['varanasi', 'kashmir', 'jaipur', 'mumbai', 'delhi'];
  IR.COMING = [
    ['Agra', 'आगरा', 'આગ્રા'], ['Kolkata', 'कोलकाता', 'કોલકાતા'], ['Hyderabad', 'हैदराबाद', 'હૈદરાબાદ'], ['Bengaluru', 'बेंगलुरु', 'બેંગલુરુ'], ['Chennai', 'चेन्नई', 'ચેન્નઈ'],
    ['Amritsar', 'अमृतसर', 'અમૃતસર'], ['Udaipur', 'उदयपुर', 'ઉદયપુર'], ['Kochi', 'कोच्चि', 'કોચી'], ['Ahmedabad', 'अहमदाबाद', 'અમદાવાદ'], ['Puri', 'पुरी', 'પુરી'],
  ];

  /* ---------- OBSTACLES ---------- */
  const LANES = (IR.LANES = [-2.3, 0, 2.3]);
  function drape(w, h, sag, seed) {
    const g = new THREE.PlaneGeometry(w, h, 16, 4), p = g.attributes.position, r = IR.rng(seed);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), t = x / w + 0.5, s = 4 * t * (1 - t), k = (h / 2 - y) / h;
      p.setY(i, y - s * sag * (1 - k * 0.3)); p.setZ(i, Math.sin(x * 2.3 + r() * 0.5) * 0.06 * k);
    }
    g.computeVertexNormals(); g.userData.own = true;
    return g;
  }
  IR.makeObstacle = (type, style, lanes, r) => {
    const m = M(), g = new THREE.Group(), b = new IR.Batcher(), c = P.ctx(b, r, g);
    const lo = Math.min(...lanes), hi = Math.max(...lanes);
    const x0 = LANES[lo] - 1.12, x1 = LANES[hi] + 1.12, xc = (x0 + x1) / 2, w = x1 - x0;
    let depth = 0.6;
    if (type === 'hurdle') {
      depth = 0.5;
      if (style === 'metal') {
        for (const x of [x0 + 0.2, x1 - 0.2]) { c.box(m.iron, 0.08, 1.0, 0.08, x, 0.5, 0); c.box(m.iron, 0.08, 0.06, 0.7, x, 0.03, 0); }
        c.box(m.stripe, w - 0.2, 0.36, 0.06, xc, 0.72, 0, 0, 0);
        c.box(m.stripe, w - 0.2, 0.2, 0.06, xc, 0.3, 0);
        c.glow(x0 + 0.2, 1.05, 0, 0.6); c.glow(x1 - 0.2, 1.05, 0, 0.6);
        c.put(m.lampGlow, IR.G.sphLo, x0 + 0.2, 1.05, 0, 0, 0, 0, 0.06);
        c.put(m.lampGlow, IR.G.sphLo, x1 - 0.2, 1.05, 0, 0, 0, 0, 0.06);
      } else if (style === 'log') {
        for (const x of [x0 + 0.25, x1 - 0.25]) { c.put(m.trunk, IR.G.cyl, x, 0.5, 0, 0, 0, 0.35, 0.09, 1.1, 0.09); c.put(m.trunk, IR.G.cyl, x, 0.5, 0, 0, 0, -0.35, 0.09, 1.1, 0.09); }
        c.put(m.trunk, IR.G.cyl, xc, 0.3, 0, 0, 0, PI / 2, 0.2, w, 0.2);
        c.put(m.trunk, IR.G.cyl, xc, 0.7, 0, 0, 0, PI / 2, 0.18, w - 0.2, 0.18);
        c.put(m.snow, IR.G.box, xc, 0.9, 0, 0, 0, 0, w - 0.4, 0.08, 0.26);
      } else {
        for (const x of [x0 + 0.22, x1 - 0.22]) {
          c.put(m.bamboo, IR.G.cyl, x, 0.55, 0, 0, 0, 0.3, 0.06, 1.25, 0.06);
          c.put(m.bamboo, IR.G.cyl, x, 0.55, 0, 0, 0, -0.3, 0.06, 1.25, 0.06);
          for (const y of [0.35, 0.62, 0.88]) c.put(m.rope, IR.G.torus, x, y, 0, 0, PI / 2, 0, 0.1);
        }
        for (const y of [0.35, 0.62, 0.88]) {
          c.put(m.bamboo, IR.G.cyl, xc, y, 0, 0, 0, PI / 2, 0.065, w, 0.065);
          for (let k = x0 + 0.6; k < x1 - 0.4; k += 0.7) c.put(m.trunk, IR.G.cyl, k, y, 0, 0, 0, PI / 2, 0.072, 0.03, 0.072);
        }
        const cl = new THREE.Mesh(drape(w * 0.82, 0.62, 0.22, lanes.length), m.cloth[(lanes[0] + (style === 'bamboo' ? 0 : 3)) % 6]);
        cl.position.set(xc, 0.6, 0.12); cl.castShadow = true; g.add(cl);
      }
    } else if (type === 'banner') {
      depth = 0.7;
      const H = 3.25;
      if (style === 'metal') {
        for (const x of [-4.05, 4.05]) c.box(m.steel, 0.25, H + 0.6, 0.25, x, (H + 0.6) / 2, 0);
        c.box(m.steel, 8.4, 0.25, 0.3, 0, H + 0.55, 0);
        c.box(m.steel, 8.4, 0.15, 0.3, 0, 1.3, 0);
        const bm = IR.M.cloth[Math.floor(r() * 6)];
        c.box(bm, 8.0, 1.9, 0.12, 0, 2.3, 0);
        c.box(m.stripe, 8.0, 0.18, 0.14, 0, 1.3, 0);
        for (let x = -3; x <= 3; x += 2) { c.put(m.lampGlow, IR.G.sphLo, x, 3.4, -0.2, 0, 0, 0, 0.08); c.glow(x, 3.4, -0.2, 0.8); }
      } else {
        const post = style === 'wood' ? m.woodDark : m.bamboo;
        for (const x of [-4.0, 4.0]) { c.cyl(post, 0.12, H + 0.3, x, (H + 0.3) / 2, 0); c.put(m.brass, IR.G.sphLo, x, H + 0.4, 0, 0, 0, 0, 0.14); }
        c.cyl(post, 0.11, 8.4, 0, H, 0, 0, 0, PI / 2);
        if (style === 'wood') {
          c.box(m.wood, 7.6, 0.9, 0.12, 0, H - 0.6, 0, 0, 2);
          for (let x = -3.4; x <= 3.4; x += 0.85) { c.cyl(m.rope, 0.015, 0.9, x, H - 1.45, 0); c.put(IR.M.cloth[Math.floor(r() * 6)], IR.G.cyl, x, 1.55, 0, 0, 0, 0, 0.14, 0.3, 0.14); c.glow(x, 1.6, 0.1, 0.7); }
          for (let x = -3.6; x <= 3.6; x += 0.5) c.put(m.chinar, IR.G.ico, x + 0.2, H - 1.2 - r() * 0.4, 0.05, r(), r(), 0, 0.12, 0.03, 0.12);
        } else {
          const cl = new THREE.Mesh(drape(7.6, 1.55, 0.25, 9), IR.M.cloth[Math.floor(r() * 6)]);
          cl.position.set(0, H - 0.85, 0.06); cl.castShadow = true; g.add(cl);
          for (let x = -3.6; x <= 3.7; x += 0.6) P.strand(c, x, H, -0.1, 1.55 + Math.abs(Math.sin(x)) * 0.1, 9);
          P.garland(c, -4, H - 0.1, 0.12, 4, H - 0.1, 0.12, 0.5, 30);
          c.put(m.brass, IR.G.cone, 0, 1.5, 0.2, 0, 0, 0, 0.16, 0.26, 0.16);
        }
      }
    } else if (type === 'block') {
      for (const L of lanes) {
        const x = LANES[L];
        if (style === 'taxi') {
          depth = 3.6;
          c.box(m.black, 1.82, 0.62, 3.6, x, 0.55, 0);
          c.box(m.taxiYellow, 1.85, 0.5, 3.4, x, 0.95, 0);
          c.box(m.taxiYellow, 1.6, 0.62, 1.9, x, 1.5, 0.15);
          c.box(m.glass, 1.62, 0.44, 1.7, x, 1.52, 0.15);
          c.box(m.taxiYellow, 0.9, 0.2, 0.3, x, 1.9, 0.15);
          for (const [dx, dz] of [[0.86, 1.15], [-0.86, 1.15], [0.86, -1.15], [-0.86, -1.15]]) c.put(m.black, IR.G.cyl, x + dx, 0.33, dz, 0, 0, PI / 2, 0.33, 0.24, 0.33);
          c.put(m.lampGlow, IR.G.sphLo, x - 0.6, 0.95, -1.72, 0, 0, 0, 0.12); c.put(m.lampGlow, IR.G.sphLo, x + 0.6, 0.95, -1.72, 0, 0, 0, 0.12);
          c.glow(x - 0.6, 0.95, -1.8, 1.4); c.glow(x + 0.6, 0.95, -1.8, 1.4);
        } else if (style === 'auto') {
          depth = Math.max(depth, 2.6);
          c.box(m.awning[4], 1.5, 0.9, 2.4, x, 0.8, 0); c.box(m.taxiYellow, 1.52, 0.5, 2.42, x, 1.45, 0.1);
          c.box(m.black, 1.55, 0.12, 2.0, x, 2.05, 0.25); c.put(m.black, IR.G.cyl, x, 2.0, -0.6, 0, 0, PI / 2, 0.72, 1.55, 0.72);
          c.box(m.glass, 1.2, 0.55, 0.06, x, 1.55, -1.12);
          for (const [dx, dz] of [[0, -1.0], [0.68, 0.85], [-0.68, 0.85]]) c.put(m.black, IR.G.cyl, x + dx, 0.26, dz, 0, 0, PI / 2, 0.26, 0.16, 0.26);
          c.put(m.lampGlow, IR.G.sphLo, x, 1.0, -1.25, 0, 0, 0, 0.1); c.glow(x, 1.0, -1.3, 1.2);
        } else if (style === 'tram') {
          depth = Math.max(depth, 7.6);
          c.box(m.awning[0], 2.1, 1.3, 7.6, x, 1.0, 0); c.box(m.white, 2.12, 1.1, 7.62, x, 2.2, 0); c.box(m.glass, 2.14, 0.7, 7.0, x, 2.2, 0);
          c.box(m.awning[4], 2.2, 0.18, 7.8, x, 2.85, 0); c.box(m.iron, 0.06, 1.2, 0.06, x, 3.5, 0); c.box(m.iron, 1.2, 0.05, 0.05, x, 4.1, 0);
          for (const dz of [-2.6, 2.6]) for (const dx of [-0.75, 0.75]) c.put(m.black, IR.G.cyl, x + dx, 0.32, dz, 0, 0, PI / 2, 0.32, 0.18, 0.32);
          c.put(m.lampGlow, IR.G.sphLo, x, 1.2, -3.82, 0, 0, 0, 0.14); c.glow(x, 1.2, -3.9, 1.6);
        } else if (style === 'cart') {
          depth = Math.max(depth, 2.0);
          c.box(m.woodLight, 1.7, 0.18, 2.0, x, 0.85, 0);
          c.box(m.woodDark, 1.75, 0.35, 0.08, x, 1.1, -1.0); c.box(m.woodDark, 1.75, 0.35, 0.08, x, 1.1, 1.0);
          c.box(m.woodDark, 0.08, 0.35, 2.0, x - 0.86, 1.1, 0); c.box(m.woodDark, 0.08, 0.35, 2.0, x + 0.86, 1.1, 0);
          for (const dx of [-0.9, 0.9]) c.put(m.woodDark, IR.G.torus, x + dx, 0.45, 0, 0, PI / 2, 0, 0.42, 0.42, 1.4);
          c.cyl(m.woodDark, 0.04, 2.6, x, 0.85, -1.9, PI / 2 - 0.25);
          const produce = IR.pick(r, [m.marigold, m.leaf, m.rose, m.marigoldY]);
          for (let i = 0; i < 26; i++) c.put(produce, IR.G.ico1, x + (r() - 0.5) * 1.4, 1.1 + r() * 0.55, (r() - 0.5) * 1.7, 0, 0, 0, 0.17);
          c.put(IR.pick(r, m.awning), IR.G.box, x, 2.3, 0, 0.0, 0, 0, 1.9, 0.06, 2.2);
          for (const [dx, dz] of [[0.8, 0.9], [-0.8, 0.9], [0.8, -0.9], [-0.8, -0.9]]) c.cyl(m.bamboo, 0.03, 1.4, x + dx, 1.6, dz);
        } else if (style === 'pots') {
          depth = Math.max(depth, 1.4);
          for (let k = 0; k < 3; k++) P.pot(c, x + (k - 1) * 0.6, 0, 0, 0.9);
          for (let k = 0; k < 2; k++) P.pot(c, x + (k - 0.5) * 0.6, 0.82, 0, 0.85);
          P.pot(c, x, 1.6, 0, 0.8, m.brass);
          c.put(m.marigold, IR.G.torus, x, 0.82, 0, PI / 2, 0, 0, 0.75, 0.75, 1.2);
        } else if (style === 'snowman') {
          depth = Math.max(depth, 1.3);
          c.put(m.snow, IR.G.sph, x, 0.55, 0, 0, 0, 0, 0.62); c.put(m.snow, IR.G.sph, x, 1.35, 0, 0, 0, 0, 0.45); c.put(m.snow, IR.G.sph, x, 1.95, 0, 0, 0, 0, 0.32);
          c.put(m.terracotta, IR.G.cone, x, 1.95, 0.42, PI / 2, 0, 0, 0.06, 0.3, 0.06);
          c.put(m.black, IR.G.sphLo, x - 0.11, 2.03, 0.28, 0, 0, 0, 0.04); c.put(m.black, IR.G.sphLo, x + 0.11, 2.03, 0.28, 0, 0, 0, 0.04);
          c.put(m.cloth[0], IR.G.torus, x, 1.68, 0, PI / 2, 0, 0, 0.36, 0.36, 1.2);
          c.cyl(m.woodDark, 0.03, 0.9, x - 0.5, 1.45, 0, 0, 0, 1.0); c.cyl(m.woodDark, 0.03, 0.9, x + 0.5, 1.45, 0, 0, 0, -1.0);
          c.put(m.cloth[1], IR.G.cylT, x, 2.3, 0, 0, 0, 0, 0.26, 0.3, 0.26);
        } else if (style === 'logs') {
          depth = Math.max(depth, 1.5);
          for (let row = 0; row < 4; row++) for (let k = 0; k < 4 - row; k++) c.put(m.trunk, IR.G.cyl, x + (k - (3 - row) / 2) * 0.45, 0.24 + row * 0.4, 0, PI / 2, 0, 0, 0.22, 1.4, 0.22);
          c.put(m.snow, IR.G.box, x, 1.82, 0, 0, 0, 0, 0.5, 0.1, 1.3);
        } else if (style === 'barrels') {
          depth = Math.max(depth, 1.4);
          for (let k = 0; k < 2; k++) { c.cyl(IR.pick(r, [m.awning[1], m.awning[4], m.steel]), 0.42, 1.15, x + (k - 0.5) * 0.9, 0.58, 0); c.cyl(m.iron, 0.44, 0.06, x + (k - 0.5) * 0.9, 0.9, 0); }
          c.cyl(m.awning[0], 0.42, 1.15, x, 1.73, 0);
          c.box(m.stripe, 1.9, 0.25, 0.06, x, 0.6, 0.5);
        } else {
          depth = Math.max(depth, 1.2);
          P.crate(c, x - 0.3, 0, 0, 1.1, 0.1); P.crate(c, x + 0.45, 0, 0.1, 0.95, -0.15); P.crate(c, x + 0.05, 1.05, 0, 0.95, 0.3);
          P.pot(c, x + 0.05, 2.0, 0, 0.45);
        }
      }
    }
    b.build(g);
    if (c.glows.length) IR.addGlows(g, c.glows);
    return { group: g, depth };
  };

  /* additive glow sprites for lamps/diyas (one Points per batch) */
  IR.addGlows = (parent, arr, color = '#ffb75a') => {
    const buckets = {};
    for (let i = 0; i < arr.length; i += 4) (buckets[arr[i + 3]] = buckets[arr[i + 3]] || []).push(arr[i], arr[i + 1], arr[i + 2]);
    IR.glowMats = IR.glowMats || {};
    for (const k in buckets) {
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(buckets[k]), 3)); g.userData.own = true;
      const key = color + k;
      const mat = IR.glowMats[key] || (IR.glowMats[key] = new THREE.PointsMaterial({ size: 0.6 * k, map: IR.M.glowTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9 }));
      parent.add(new THREE.Points(g, mat));
    }
  };
})();
