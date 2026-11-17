/* Ten more cities: Agra, Kolkata, Hyderabad, Bengaluru, Chennai, Amritsar, Udaipur, Kochi, Ahmedabad, Puri.
   Landmarks are respectful, stylised "inspired-by" structures built from primitives — not replicas. */
(function () {
  const P = IR.P, PI = Math.PI, M = () => IR.M, H = IR.TH;

  /* ---------- new props ---------- */
  P.cypress = (c, x, y, d, h) => { c.cyl(M().trunk, 0.1, h * 0.15, x, y + h * 0.07, d); c.put(M().leafDark, IR.G.sph, x, y + h * 0.55, d, 0, 0, 0, h * 0.13, h * 0.48, h * 0.13); };
  P.minaret = (c, x, y, d, h, mat, dome) => {
    c.cyl(mat, 0.75, h, x, y + h / 2, d, 0, 0, 0, IR.G.cylT);
    for (const k of [0.35, 0.65, 0.92]) c.cyl(mat, 1.0, 0.25, x, y + h * k, d);
    P.chhatri(c, x, y + h, d, 0.7, mat, dome || mat);
  };
  P.mughalTomb = (c, x, y, d, sc, marble) => {
    const m = M(), mat = marble || m.marble;
    c.box(mat, 46 * sc, 3 * sc, 46 * sc, x, y + 1.5 * sc, d);
    c.box(mat, 24 * sc, 18 * sc, 24 * sc, x, y + 12 * sc, d, PI / 4 * 0);
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) c.box(m.stonePlain, dx ? 0.6 : 9 * sc, 13 * sc, dz ? 0.6 : 9 * sc, x + dx * 12.2 * sc, y + 10 * sc, d + dz * 12.2 * sc);
    c.cyl(mat, 7.5 * sc, 4 * sc, x, y + 23 * sc, d);
    c.put(mat, IR.G.dome, x, y + 25 * sc, d, 0, 0, 0, 8 * sc, 9 * sc, 8 * sc);
    c.put(m.brass, IR.G.kalash, x, y + 41 * sc, d, 0, 0, 0, 0.8 * sc, 3 * sc, 0.8 * sc);
    for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { P.chhatri(c, x + dx * 8 * sc, y + 21 * sc, d + dz * 8 * sc, 2.4 * sc, mat, mat); P.minaret(c, x + dx * 21 * sc, y + 3 * sc, d + dz * 21 * sc, 30 * sc, mat, mat); }
  };
  P.gopuram = (c, x, y, d, sc, w, dd) => {
    const m = M(), cols = m.gopuram;
    c.box(m.stoneGrey, w * sc, 6 * sc, dd * sc, x, y + 3 * sc, d, 0, 2);
    let yy = y + 6 * sc;
    for (let i = 0; i < 7; i++) {
      const k = 1 - i * 0.11, h = 2.6 * sc;
      c.box(cols[i % cols.length], w * k * sc, h, dd * k * sc, x, yy + h / 2, d);
      c.box(m.white, w * k * sc + 0.3, 0.3 * sc, dd * k * sc + 0.3, x, yy + h, d);
      for (let q = -2; q <= 2; q++) c.put(cols[(i + q + 5) % cols.length], IR.G.sphLo, x + q * w * k * sc * 0.2, yy + h + 0.4 * sc, d - dd * k * sc / 2, 0, 0, 0, 0.45 * sc);
      yy += h;
    }
    c.put(m.gopuram[0], IR.G.cyl, x, yy + 1.2 * sc, d, 0, 0, PI / 2, 1.6 * sc, w * 0.25 * sc, 1.6 * sc);
    for (let q = -3; q <= 3; q++) c.put(m.gold, IR.G.kalash, x + q * 0.9 * sc, yy + 2.6 * sc, d, 0, 0, 0, 0.3 * sc, 0.9 * sc, 0.3 * sc);
  };
  P.goldenPavilion = (c, x, y, d, sc) => {
    const m = M();
    c.box(m.marble, 10 * sc, 7 * sc, 10 * sc, x, y + 3.5 * sc, d);
    c.box(m.white, 10.6 * sc, 0.5 * sc, 10.6 * sc, x, y + 7.2 * sc, d);
    c.put(m.gold, IR.G.dome, x, y + 7.4 * sc, d, 0, 0, 0, 3.2 * sc, 3.6 * sc, 3.2 * sc);
    for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) P.chhatri(c, x + dx * 4.4 * sc, y + 7.4 * sc, d + dz * 4.4 * sc, 1.1 * sc, m.marble, m.gold);
  };
  P.fishNet = (c, x, y, d, s) => {
    const m = M(), g = new THREE.Group(), b = new IR.Batcher(), k = P.ctx(b, c.r, g);
    k.cyl(m.trunk, 0.14, 14, 0, 3, 0, 0, 0, s * 0.9); k.cyl(m.trunk, 0.14, 14, 0, 3, 0, 0, 0, -s * 0.9 + s * 0.4);
    k.cyl(m.trunk, 0.1, 9, s * 3.5, 5.2, 0, 0, 0, -s * 1.15);
    for (let i = 0; i < 6; i++) k.put(m.stoneGrey, IR.G.sph, -s * 3 - s * i * 0.2, 0.8 + i * 0.35, 0, 0, 0, 0, 0.35);
    k.box(m.woodDark, 4, 0.5, 3, -s * 3, 0.3, 0);
    b.build(g);
    const net = new THREE.Mesh(new THREE.ConeGeometry(4, 2.5, 4, 1, true), m.net); net.geometry.userData.own = true;
    net.position.set(s * 7.2, 7, 0); net.rotation.y = PI / 4; g.add(net);
    g.position.set(x, y, -d); c.group.add(g);
    c.anim.push({ obj: g, y, ph: c.r() * 6, amp: 0.05 });
  };
  P.kite = (c, x, y, d, col) => {
    const g = new THREE.Group(), geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0.8, 0, -0.6, 0, 0, 0, -0.8, 0, 0, 0.8, 0, 0, -0.8, 0, 0.6, 0, 0], 3)); geo.computeVertexNormals(); geo.userData.own = true;
    const k = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, side: THREE.DoubleSide, roughness: 0.6, emissive: new THREE.Color(col).multiplyScalar(0.2) }));
    k.rotation.z = PI / 4; g.add(k);
    g.position.set(x, y, -d); c.group.add(g);
    c.anim.push({ obj: g, y, ph: c.r() * 6, amp: 1.2 });
  };
  P.landmarkArch = (c, d, mat, minar) => {
    const m = M();
    for (const s of [-1, 1]) { P.minaret(c, s * 7.2, 0, d - 2.5, 26, mat, m.white); P.minaret(c, s * 7.2, 0, d + 2.5, 26, mat, m.white); c.box(mat, 3, 14, 7, s * 6, 7, d); }
    c.box(mat, 15, 4, 7, 0, 15, d); c.box(mat, 13, 4, 6, 0, 19, d); c.put(mat, IR.G.dome, 0, 21, d, 0, 0, 0, 3, 3, 3);
    for (let i = -2; i <= 2; i++) c.box(m.white, 1.4, 0.4, 7.2, i * 2.6, 13.2, d);
  };
  P.beach = (c, s, d0, d1, th, u0 = 2) => {
    const m = M(), r = c.r, wy = th.floor.y, len = d1 - d0, mid = (d0 + d1) / 2;
    c.box(m.sand, 24, 1.6, len, s * (4 + u0 + 12), wy - 0.2 + 0.3, mid);
    c.put(m.sand, IR.G.box, s * (4 + u0 + 27), wy - 0.6, mid, 0, 0, s * -0.12, 14, 1.6, len);
    for (let d = d0 + 4; d < d1; d += 7 + r() * 8) {
      const u = u0 + 4 + r() * 16;
      if (r() < 0.6) P.umbrella(c, s * (4 + u), wy + 1.1, d, IR.pick(r, m.awning));
      else P.boat(c, s * (4 + u), wy + 1.2, d, 'boat', r() * 2);
    }
  };

  const T = IR.THEMES;
  const fol = (c, s, d0, d1, fn, step = 12) => { for (let d = d0 + 4; d < d1; d += step + c.r() * step * 0.6) fn(d); };

  /* AGRA — Mughal gardens & a marble mausoleum across the Yamuna */
  T.agra = {
    id: 'agra', names: { en: 'Agra', hi: 'आगरा', gu: 'આગ્રા' }, tag: { en: 'Mughal gardens by the Yamuna', hi: 'यमुना किनारे मुग़ल बाग़', gu: 'યમુના કિનારે મુઘલ બાગ' }, card: ['#fff2e0', '#e0a890', '#7a4a5a'], icon: '🕌',
    atmos: { top: '#7a8ac8', hor: '#ffd8c0', bot: '#f2d0b8', sun: '#ffe0c0', sunDir: [-0.4, 0.12, -1], phys: { turb: 7, ray: 2.2, mie: 0.006, g: 0.82 }, skyExp: 0.42, sunI: 3.0, hemiSky: '#ffe8d8', hemiGround: '#8a6a5a', hemiI: 1.2, fog: '#f2d6c4', fogNear: 60, fogFar: 320, exposure: 0.92, cloud: 0.3, cloudCol: '#fff0e8' },
    floor: { type: 'water', color: '#5a7a7a', y: -1.6 }, pano: { kind: 'delhi', cols: ['#e8d0c8', '#c0a098'], seed: 21 },
    path: { mat: 'pathRed', depth: 3 }, weather: 'motes', weatherColor: '#fff0d0', birds: true,
    music: { lead: 'sitar', scale: [0, 2, 4, 5, 7, 9, 11], root: 62, tempo: 88 }, amb: 'river',
    obst: { hurdle: 'bamboo', banner: 'cloth', block: ['cart', 'pots', 'crates'] },
    left(c, s, d0, d1) {
      const m = M(), r = c.r;
      H.landBase(c, s, d0, d1, 0, 0.2, m.lawn);
      c.box(m.marble, 1.6, 0.25, d1 - d0, s * (4 + 6), 0.25, (d0 + d1) / 2);
      c.box(IR.M.waterStrip || (IR.M.waterStrip = new THREE.MeshPhysicalMaterial({ color: '#3a6a78', roughness: 0.05, clearcoat: 1 })), 1.1, 0.06, d1 - d0, s * (4 + 6), 0.36, (d0 + d1) / 2);
      fol(c, s, d0, d1, (d) => { P.cypress(c, s * (4 + 3.2), 0.2, d, 7 + r() * 2); P.cypress(c, s * (4 + 8.8), 0.2, d + 3, 7 + r() * 2); }, 6);
      fol(c, s, d0, d1, (d) => P.flowerPot(c, s * (4 + 1.4), 0.2, d), 8);
      H.rowBuildings(c, s, d0, d1, 14, 0.2, (dc, l) => P.haveli(c, s, 14, dc, l, 8, 8 + Math.floor(r() * 2) * 4, 0.2, m.facade.red, { chMat: m.stoneRed, domeMat: m.marble, dome: true }));
      fol(c, s, d0, d1, (d) => P.minaret(c, s * (4 + 26), 0.2, d, 18, m.stoneRed, m.marble), 30);
    },
    right(c, s, d0, d1, th) { H.riverSide(c, s, d0, d1, th); },
    far(c, s, d0, d1, th) { const r = c.r; for (let d = d0; d < d1; d += 8) P.cypress(c, s * (4 + 100 + r() * 10), th.floor.y + 1, d, 9); c.box(M().stoneRed, 30, 3, d1 - d0, s * (4 + 110), th.floor.y + 0.6, (d0 + d1) / 2); },
    gateMat: 'stoneRed', domeMat: 'marble', gateBg: ['#7a1c3a', '#3a0c18'],
  };

  /* KOLKATA — colonial streets, trams and a giant steel bridge over the Hooghly */
  T.kolkata = {
    id: 'kolkata', names: { en: 'Kolkata', hi: 'कोलकाता', gu: 'કોલકાતા' }, tag: { en: 'Trams, colonial lanes & the great bridge', hi: 'ट्राम, पुरानी गलियाँ और पुल', gu: 'ટ્રામ, જૂની ગલીઓ અને પુલ' }, card: ['#ffe28a', '#c8a050', '#3a4a6a'], icon: '🚋',
    atmos: { top: '#6a8ab8', hor: '#f2dcc0', bot: '#d8c8b0', sun: '#ffe8c8', sunDir: [0.5, 0.22, -1], phys: { turb: 10, ray: 1.6, mie: 0.008, g: 0.8 }, skyExp: 0.4, sunI: 3.0, hemiSky: '#f4ecdc', hemiGround: '#7a6a5a', hemiI: 1.25, fog: '#e2d6c2', fogNear: 45, fogFar: 280, exposure: 0.95, cloud: 0.5, cloudCol: '#fbf4ea' },
    floor: { type: 'water', color: '#5a6a5a', y: -1.6 }, pano: { kind: 'skyline', cols: ['#b8b0a8', '#8a8078'], seed: 13 },
    path: { mat: 'pathAsphalt', depth: 3, lanes: true, rails: true }, weather: 'motes', weatherColor: '#fff2d0', birds: true,
    music: { lead: 'flute', scale: [0, 2, 4, 7, 9], root: 60, tempo: 96 }, amb: 'city',
    obst: { hurdle: 'metal', banner: 'cloth', block: ['tram', 'taxi', 'cart'] },
    left(c, s, d0, d1) {
      const m = M(), r = c.r;
      H.sidewalk(c, s, d0, d1, 3, m.stoneGrey); H.landBase(c, s, d0, d1, 3, 0.22, m.stoneGrey);
      fol(c, s, d0, d1, (d) => P.tree(c, s * (4 + 1.8), 0.22, d, 7 + r() * 2), 14);
      fol(c, s, d0, d1, (d) => P.lamp(c, s * (4 + 0.5), 0.22, d, 4), 16);
      H.rowBuildings(c, s, d0, d1, 3.5, 0.22, (dc, l) => P.haveli(c, s, 3.5, dc, l, 10, 12 + Math.floor(r() * 3) * 4, 0.22, m.facade.colonial, { chhatri: false }));
      H.rowBuildings(c, s, d0, d1, 16, 0.22, (dc, l) => P.haveli(c, s, 16, dc, l, 10, 16 + Math.floor(r() * 3) * 4, 0.22, m.facade.colonial, { chhatri: false, dome: true }));
    },
    right(c, s, d0, d1, th) { H.riverSide(c, s, d0, d1, th); },
    far(c, s, d0, d1, th) {
      const m = M(), wy = th.floor.y;
      for (let d = d0 + 10; d < d1 - 10; d += 70) {
        const x = s * (4 + 70);
        for (const dz of [-14, 14]) for (const dx of [-6, 6]) c.box(m.steel, 1.6, 70, 1.6, x + dx, wy + 35, d + dz);
        for (let h = 8; h < 70; h += 12) { c.put(m.steel, IR.G.box, x, wy + h, d, 0.0, 0, 0, 14, 0.8, 30); c.put(m.steel, IR.G.box, x, wy + h + 6, d, 0.6, 0, 0, 1, 0.6, 30); }
        c.box(m.iron, 18, 2, 70, x, wy + 12, d);
      }
      H.rowBuildings(c, s, d0, d1, 100, wy + 1, (dc, l) => P.haveli(c, s, 100, dc, l, 10, 12 + Math.floor(c.r() * 4) * 4, wy + 1, m.facade.colonial, { chhatri: false }));
    },
    gateMat: 'stonePlain', gateBg: ['#1f3a6a', '#0a1830'],
  };

  /* HYDERABAD — Charminar-inspired arches & pearl bazaars */
  T.hyderabad = {
    id: 'hyderabad', names: { en: 'Hyderabad', hi: 'हैदराबाद', gu: 'હૈદરાબાદ' }, tag: { en: 'Four-minaret arches & bangle bazaars', hi: 'चार मीनार और चूड़ी बाज़ार', gu: 'ચાર મિનાર અને બંગડી બજાર' }, card: ['#ffe6b8', '#d09a5a', '#5a3a2a'], icon: '🕌',
    atmos: { top: '#5a86c8', hor: '#f6dcb8', bot: '#e8d0b0', sun: '#fff0d0', sunDir: [0.2, 0.3, -1], phys: { turb: 8, ray: 1.4, mie: 0.006, g: 0.8 }, skyExp: 0.4, sunI: 3.4, hemiSky: '#fff2dc', hemiGround: '#8a6a4a', hemiI: 1.15, fog: '#f0dcc0', fogNear: 50, fogFar: 300, exposure: 0.93, cloud: 0.3 },
    floor: { type: 'ground', y: -0.02, tex: { base: '#c9a87a', dark: 'rgba(120,80,40,.25)', light: 'rgba(255,235,200,.2)' } }, pano: { kind: 'delhi', cols: ['#d8c0a0', '#a88a6a'], seed: 31 },
    path: { mat: 'pathFlag', depth: 0.3 }, weather: 'motes', weatherColor: '#ffe6b0', birds: true,
    music: { lead: 'sitar', scale: [0, 1, 4, 5, 7, 8, 10], root: 62, tempo: 100 }, amb: 'bazaar',
    obst: { hurdle: 'bamboo', banner: 'cloth', block: ['auto', 'cart', 'pots'] },
    left(c, s, d0, d1, th) { IR.TH.jaipurBazaar(c, s, d0, d1, th); },
    right(c, s, d0, d1) {
      const m = M(), r = c.r;
      H.sidewalk(c, s, d0, d1, 1.5, m.stone);
      H.rowBuildings(c, s, d0, d1, 1.5, 0, (dc, l) => P.haveli(c, s, 1.5, dc, l, 9, 8 + Math.floor(r() * 3) * 4, 0, m.facade.ghat, { dome: true, domeMat: m.marble }));
      fol(c, s, d0, d1, (d) => P.minaret(c, s * (4 + 14), 0, d, 22, m.stonePlain, m.marble), 34);
    },
    gateMat: 'stonePlain', domeMat: 'marble', gateBg: ['#5a2a6a', '#2a1030'],
  };

  /* BENGALURU — garden city parks & glass tech towers */
  T.bengaluru = {
    id: 'bengaluru', names: { en: 'Bengaluru', hi: 'बेंगलुरु', gu: 'બેંગલુરુ' }, tag: { en: 'Garden city & tech towers', hi: 'बाग़ों का शहर और टेक टावर', gu: 'બગીચાનું શહેર અને ટેક ટાવર' }, card: ['#b8f0c8', '#4aa878', '#1a3a4a'], icon: '🌳',
    atmos: { top: '#4f88d0', hor: '#d8e8f0', bot: '#d0dccc', sun: '#fff6e0', sunDir: [-0.3, 0.45, -1], phys: { turb: 4, ray: 1.1, mie: 0.004, g: 0.78 }, skyExp: 0.38, sunI: 3.4, hemiSky: '#eaf4ff', hemiGround: '#5a7a4a', hemiI: 1.2, fog: '#dce8ec', fogNear: 50, fogFar: 300, exposure: 0.92, cloud: 0.45 },
    floor: { type: 'ground', y: -0.02, tex: { base: '#5f8f3f', dark: 'rgba(30,60,20,.3)', light: 'rgba(170,210,110,.25)', blades: true } }, pano: { kind: 'skyline', cols: ['#9ab0c8', '#6a8098'], seed: 41 },
    path: { mat: 'pathAsphalt', depth: 0.3, lanes: true }, weather: null, birds: true,
    music: { lead: 'santoor', scale: [0, 2, 4, 7, 9], root: 64, tempo: 104 }, amb: 'city',
    obst: { hurdle: 'metal', banner: 'metal', block: ['auto', 'barrels', 'crates'] },
    left(c, s, d0, d1) {
      const m = M(), r = c.r;
      H.sidewalk(c, s, d0, d1, 3, m.stoneGrey);
      fol(c, s, d0, d1, (d) => P.lamp(c, s * (4 + 0.6), 0.22, d, 6, 'modern'), 14);
      H.rowBuildings(c, s, d0, d1, 4, 0, (dc, l) => P.tower(c, s, 4, dc, l, 12, 20 + r() * 35, IR.pick(r, [m.facade.modern[0], m.facade.modern[3]])));
      H.rowBuildings(c, s, d0, d1, 20, 0, (dc, l) => P.tower(c, s, 20, dc, l, 14, 40 + r() * 40, IR.pick(r, m.facade.modern)));
    },
    right(c, s, d0, d1) {
      const m = M(), r = c.r;
      H.sidewalk(c, s, d0, d1, 1.2, m.stoneGrey);
      for (let d = d0 + 2; d < d1; d += 5 + r() * 4) P.tree(c, s * (4 + 3 + r() * 30), 0, d, 6 + r() * 6, r() < 0.15 ? M().chinar : null);
      fol(c, s, d0, d1, (d) => { c.box(m.woodDark, 0.5, 0.45, 1.8, s * (4 + 2), 0.45, d); c.box(m.iron, 0.6, 0.06, 1.9, s * (4 + 2), 0.68, d); }, 12);
      fol(c, s, d0, d1, (d) => P.lamp(c, s * (4 + 1), 0, d, 3.6), 16);
    },
    gateMat: 'stoneGrey', gateBg: ['#1a5a3a', '#0a2a1a'],
  };

  /* CHENNAI — Marina beach & Dravidian gopurams */
  T.chennai = {
    id: 'chennai', names: { en: 'Chennai', hi: 'चेन्नई', gu: 'ચેન્નઈ' }, tag: { en: 'Marina beach & temple towers', hi: 'मरीना बीच और मंदिर गोपुरम', gu: 'મરીના બીચ અને ગોપુરમ' }, card: ['#ffd88a', '#3aa8c8', '#1a3a6a'], icon: '🏖️',
    atmos: { top: '#3a80d8', hor: '#e0eef4', bot: '#cfe0e0', sun: '#fff4dc', sunDir: [0.55, 0.32, -1], phys: { turb: 5, ray: 1.3, mie: 0.005, g: 0.8 }, skyExp: 0.38, sunI: 3.6, hemiSky: '#eef6ff', hemiGround: '#a08a6a', hemiI: 1.15, fog: '#dceaf0', fogNear: 55, fogFar: 320, exposure: 0.9, cloud: 0.35 },
    floor: { type: 'water', color: '#2f7a8a', y: -1.5 }, pano: { kind: 'ghats', cols: ['#d8b8a0', '#a8846a'], seed: 51 },
    path: { mat: 'pathPink', depth: 3 }, weather: 'motes', weatherColor: '#fff4d8', birds: true,
    music: { lead: 'flute', scale: [0, 2, 4, 5, 7, 9, 11], root: 64, tempo: 98 }, amb: 'river',
    obst: { hurdle: 'bamboo', banner: 'cloth', block: ['auto', 'cart', 'pots'] },
    left(c, s, d0, d1) {
      const m = M(), r = c.r;
      H.sidewalk(c, s, d0, d1, 2, m.stonePink); H.landBase(c, s, d0, d1, 2, 0.22, m.stone);
      fol(c, s, d0, d1, (d) => P.palm(c, s * (4 + 1.2), 0.22, d, 7 + r() * 2), 10);
      let d = d0 + 6;
      while (d < d1 - 12) {
        if (r() < 0.45) { P.gopuram(c, s * (4 + 12), 0.22, d + 7, 0.9 + r() * 0.3, 12, 8); d += 18; }
        else { const l = 7 + r() * 5; P.haveli(c, s, 4, d + l / 2, l, 9, 8 + Math.floor(r() * 3) * 4, 0.22, m.facade.colonial.slice(1, 3), { chhatri: false, dome: true }); d += l + 1; }
      }
    },
    right(c, s, d0, d1, th) { H.railing(c, s, d0, d1, m_(), M().iron, 4); P.beach(c, s, d0, d1, th, 0.5); fol(c, s, d0, d1, (d) => P.lamp(c, s * 3.85, 1.3, d, 3), 20); },
    gateMat: 'stone', gateBg: ['#a8402a', '#4a1a0a'],
  };
  const m_ = () => M().stonePlain;

  /* AMRITSAR — Punjabi streets, golden domes & lively markets */
  T.amritsar = {
    id: 'amritsar', names: { en: 'Amritsar', hi: 'अमृतसर', gu: 'અમૃતસર' }, tag: { en: 'Golden domes & Punjabi bazaars', hi: 'सुनहरे गुंबद और पंजाबी बाज़ार', gu: 'સોનેરી ગુંબજ અને પંજાબી બજાર' }, card: ['#fff0b0', '#e0b030', '#6a3a10'], icon: '✨',
    atmos: { top: '#8aa0c8', hor: '#f4e2c4', bot: '#e8d8c0', sun: '#ffe6b8', sunDir: [0.4, 0.16, -1], phys: { turb: 10, ray: 2.0, mie: 0.008, g: 0.82 }, skyExp: 0.42, sunI: 3.0, hemiSky: '#fff0dc', hemiGround: '#8a6a4a', hemiI: 1.2, fog: '#ead8bc', fogNear: 40, fogFar: 260, exposure: 0.95, cloud: 0.3 },
    floor: { type: 'ground', y: -0.02, tex: { base: '#b89a7a', dark: 'rgba(100,70,40,.25)', light: 'rgba(255,240,210,.2)' } }, pano: { kind: 'delhi', cols: ['#e0ccb0', '#b8a080'], seed: 61 },
    path: { mat: 'pathFlag', depth: 0.3 }, weather: 'motes', weatherColor: '#fff2c8', birds: true,
    music: { lead: 'sitar', scale: [0, 2, 4, 5, 7, 9, 10], root: 60, tempo: 112 }, amb: 'bazaar',
    obst: { hurdle: 'bamboo', banner: 'cloth', block: ['cart', 'crates', 'pots'] },
    left(c, s, d0, d1) {
      const m = M(), r = c.r;
      H.sidewalk(c, s, d0, d1, 2, m.marble, 0.25);
      let d = d0 + 4;
      while (d < d1 - 12) {
        if (r() < 0.3) { P.goldenPavilion(c, s * (4 + 10), 0.25, d + 6, 1); d += 15; }
        else { const l = 6 + r() * 5; P.haveli(c, s, 2.5, d + l / 2, l, 8, 8 + Math.floor(r() * 3) * 4, 0.25, m.facade.white, { domeMat: m.gold, dome: true, chMat: m.marble }); d += l + 0.6; }
      }
      fol(c, s, d0, d1, (d2) => P.flowerPot(c, s * (4 + 1.3), 0.25, d2), 9);
    },
    right(c, s, d0, d1, th) { IR.TH.jaipurBazaar(c, s, d0, d1, th); },
    gateMat: 'marble', domeMat: 'gold', gateBg: ['#c08a10', '#5a3a00'],
  };

  /* UDAIPUR — city of lakes, white palaces & ornate bridges */
  T.udaipur = {
    id: 'udaipur', names: { en: 'Udaipur', hi: 'उदयपुर', gu: 'ઉદયપુર' }, tag: { en: 'Lake palaces & ornate bridges', hi: 'झील महल और सुंदर पुल', gu: 'સરોવર મહેલ અને સુંદર પુલ' }, card: ['#e8f4ff', '#7ab0d8', '#3a4a8a'], icon: '🏰',
    atmos: { top: '#5a7ac8', hor: '#ffd0b0', bot: '#f0c8b0', sun: '#ffd8a8', sunDir: [-0.5, 0.08, -1], phys: { turb: 8, ray: 2.8, mie: 0.006, g: 0.84 }, skyExp: 0.46, sunI: 2.9, hemiSky: '#ffe2d0', hemiGround: '#6a5a6a', hemiI: 1.25, fog: '#f0ccb8', fogNear: 60, fogFar: 330, exposure: 0.92, cloud: 0.45, cloudCol: '#ffd8c8' },
    floor: { type: 'water', color: '#3a6a8a', y: -1.8 }, pano: { kind: 'hills', cols: ['#a89aa8', '#7a6a7a', '#f0e8e0'], seed: 71 },
    path: { mat: 'pathFlag', depth: 3 }, weather: 'motes', weatherColor: '#ffe0c0', birds: true,
    music: { lead: 'santoor', scale: [0, 2, 4, 5, 7, 9, 11], root: 62, tempo: 86 }, amb: 'river',
    obst: { hurdle: 'bamboo', banner: 'cloth', block: ['pots', 'crates', 'cart'] },
    left(c, s, d0, d1, th) {
      const m = M(), r = c.r;
      H.railing(c, s, d0, d1, m.marble, m.brass, 2.5);
      fol(c, s, d0, d1, (d) => P.chhatri(c, s * 3.85, 1.3, d, 0.55, m.marble, m.marble), 15);
      H.rowBuildings(c, s, d0, d1, 10, 0, (dc, l) => { c.box(m.stone, 14, 3, l, s * (4 + 15), th.floor.y + 1.4, dc); P.haveli(c, s, 9, dc, l, 12, 12 + Math.floor(r() * 4) * 4, th.floor.y + 2.9, m.facade.white, { chMat: m.marble, domeMat: m.marble, dome: true }); });
      for (let d = d0 + 5; d < d1; d += 12 + r() * 8) P.boat(c, s * (4 + 4 + r() * 3), th.floor.y + 0.05, d, 'shikara', 0);
    },
    right(c, s, d0, d1, th) { const m = M(); H.railing(c, s, d0, d1, m.marble, m.brass, 2.5); for (let d = d0 + 2; d < d1; d += 6) c.put(m.marble, IR.G.hemi, s * 3.6, -1.2, d, PI / 2, PI / 2 * s, 0, 2.6, 0.6, 2.2); for (let d = d0 + 6; d < d1; d += 14) P.boat(c, s * (4 + 8 + c.r() * 25), th.floor.y + 0.05, d, 'shikara', c.r()); },
    far(c, s, d0, d1, th) { const m = M(); for (let d = d0 + 20; d < d1 - 20; d += 90) { c.box(m.marble, 40, 4, 40, s * (4 + 110), th.floor.y + 2, d); P.haveli(c, s, 92, d, 34, 30, 12, th.floor.y + 4, m.facade.white, { dome: true, chMat: m.marble, domeMat: m.marble }); } },
    gateMat: 'marble', domeMat: 'marble', gateBg: ['#2a4a8a', '#101a3a'],
  };

  /* KOCHI — backwaters, Chinese fishing nets & coconut palms */
  T.kochi = {
    id: 'kochi', names: { en: 'Kochi', hi: 'कोच्चि', gu: 'કોચી' }, tag: { en: 'Backwaters & fishing nets', hi: 'बैकवाटर और मछली जाल', gu: 'બેકવોટર અને માછીમારીની જાળ' }, card: ['#c8f0b0', '#3a9a6a', '#1a4a3a'], icon: '🌴',
    atmos: { top: '#5a8ab8', hor: '#e4ecd8', bot: '#c8d8c0', sun: '#fff0d0', sunDir: [0.4, 0.2, -1], phys: { turb: 12, ray: 1.4, mie: 0.01, g: 0.78 }, skyExp: 0.42, sunI: 2.8, hemiSky: '#e8f4e0', hemiGround: '#4a6a3a', hemiI: 1.35, fog: '#d8e4d0', fogNear: 40, fogFar: 260, exposure: 0.95, cloud: 0.65, cloudCol: '#f4f6f0' },
    floor: { type: 'water', color: '#3a6a5a', y: -1.3 }, pano: { kind: 'hills', cols: ['#8aa88a', '#5a7a5a', '#4a6a4a'], seed: 81 },
    path: { mat: 'pathWood', depth: 0.45, piles: true }, weather: 'rain', birds: true,
    music: { lead: 'flute', scale: [0, 2, 3, 7, 9], root: 62, tempo: 92 }, amb: 'rain',
    obst: { hurdle: 'log', banner: 'wood', block: ['crates', 'logs', 'pots'] },
    left(c, s, d0, d1) {
      const m = M(), r = c.r;
      H.landBase(c, s, d0, d1, 1.6, 0.3, m.lawn);
      for (let d = d0 + 2; d < d1; d += 3 + r() * 3) P.palm(c, s * (4 + 2 + r() * 14), 0.3, d, 7 + r() * 4);
      H.rowBuildings(c, s, d0, d1, 8, 0.3, (dc, l) => { const w = Math.min(l, 8); P.chalet(c, s * (4 + 12), 0.3, dc, 6, w, false); });
      H.rowBuildings(c, s, d0, d1, 22, 0.3, (dc, l) => P.haveli(c, s, 22, dc, l, 8, 8, 0.3, m.facade.pastel, { chhatri: false }));
    },
    right(c, s, d0, d1, th) {
      const m = M(), r = c.r, x = s * 3.85;
      for (let d = d0; d <= d1; d += 2.5) c.cyl(m.woodDark, 0.08, 1.2, x, 0.6, d);
      c.cyl(m.rope, 0.03, d1 - d0, x, 0.95, (d0 + d1) / 2, PI / 2);
      for (let d = d0 + 8; d < d1 - 6; d += 24 + r() * 10) P.fishNet(c, s * (4 + 5), th.floor.y, d, s);
      for (let d = d0 + 14; d < d1; d += 26 + r() * 10) P.boat(c, s * (4 + 16 + r() * 10), th.floor.y + 0.05, d, 'house', 0);
    },
    gateMat: 'woodLight', domeMat: 'roofTile', gateBg: ['#1a6a4a', '#0a2a1a'],
  };

  /* AHMEDABAD — carved pol houses, stepwells & Uttarayan kites */
  T.ahmedabad = {
    id: 'ahmedabad', names: { en: 'Ahmedabad', hi: 'अहमदाबाद', gu: 'અમદાવાદ' }, tag: { en: 'Pol houses, stepwells & kites', hi: 'पोल, बावड़ी और पतंगें', gu: 'પોળ, વાવ અને પતંગ' }, card: ['#ffe0a0', '#e0784a', '#5a2a6a'], icon: '🪁',
    atmos: { top: '#4a8ad8', hor: '#f8e4c4', bot: '#e8d4b8', sun: '#fff0d0', sunDir: [0.3, 0.35, -1], phys: { turb: 6, ray: 1.3, mie: 0.005, g: 0.8 }, skyExp: 0.38, sunI: 3.4, hemiSky: '#fff4e0', hemiGround: '#8a6a4a', hemiI: 1.15, fog: '#f0dcc0', fogNear: 45, fogFar: 290, exposure: 0.93, cloud: 0.2 },
    floor: { type: 'ground', y: -0.02, tex: { base: '#c9a87a', dark: 'rgba(120,80,40,.25)', light: 'rgba(255,235,200,.2)' } }, pano: { kind: 'delhi', cols: ['#d8c4a8', '#a89070'], seed: 91 },
    path: { mat: 'pathFlag', depth: 0.3 }, weather: 'motes', weatherColor: '#fff0c8', birds: false,
    music: { lead: 'santoor', scale: [0, 2, 4, 5, 7, 9, 11], root: 64, tempo: 108 }, amb: 'bazaar',
    obst: { hurdle: 'bamboo', banner: 'cloth', block: ['auto', 'pots', 'cart'] },
    left(c, s, d0, d1) {
      const m = M(), r = c.r;
      H.sidewalk(c, s, d0, d1, 1.2, m.stone);
      H.rowBuildings(c, s, d0, d1, 1.2, 0, (dc, l) => P.haveli(c, s, 1.2, dc, l, 7, 8 + Math.floor(r() * 2) * 4, 0, m.facade.pol, { chhatri: false, rail: m.woodDark }));
      fol(c, s, d0, d1, (d) => P.kite(c, s * (6 + r() * 30), 18 + r() * 20, d, IR.pick(r, ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#ff7043'])), 7);
    },
    right(c, s, d0, d1) {
      const m = M(), r = c.r;
      H.sidewalk(c, s, d0, d1, 1.2, m.stone);
      let d = d0 + 3;
      while (d < d1 - 14) {
        if (r() < 0.3) {
          // stepwell-inspired sunken court
          const cx = s * (4 + 10), dc = d + 7;
          for (let k = 0; k < 5; k++) c.box(m.stone, 12 - k * 2, 0.6, 12 - k * 2, cx, -0.3 - k * 0.6, dc, 0, 2);
          for (const dx of [-1, 1]) { c.box(m.stone, 0.6, 3, 12, cx + dx * 6, 1.5, dc, 0, 2); for (let q = -4; q <= 4; q += 2.6) c.box(m.stonePlain, 0.4, 2.6, 0.4, cx + dx * 5.5, 1.3, dc + q); }
          d += 16;
        } else { const l = 6 + r() * 4; P.haveli(c, s, 1.2, d + l / 2, l, 7, 8 + Math.floor(r() * 2) * 4, 0, m.facade.pol, { chhatri: false }); d += l + 0.4; }
      }
      fol(c, s, d0, d1, (d2) => P.kite(c, s * (6 + r() * 30), 18 + r() * 20, d2, IR.pick(r, ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#8e24aa'])), 7);
      for (let d2 = d0 + 6; d2 < d1; d2 += 16) P.garland(c, s * 3.9, 4.2, d2, -s * 3.9, 4.2, d2 + 1, 0.6, 30, 0.06);
    },
    gateMat: 'stone', gateBg: ['#a8402a', '#4a1a0a'],
  };

  /* PURI — coastal temple town & golden sea beach */
  T.puri = {
    id: 'puri', names: { en: 'Puri', hi: 'पुरी', gu: 'પુરી' }, tag: { en: 'Temple town by the sea', hi: 'समुद्र किनारे मंदिर नगरी', gu: 'દરિયા કિનારે મંદિર નગરી' }, card: ['#ffe8b0', '#e07a3a', '#2a5a8a'], icon: '🌊',
    atmos: { top: '#6a7ac0', hor: '#ffcaa0', bot: '#f0c8a8', sun: '#ffd8a0', sunDir: [0.6, 0.06, -1], phys: { turb: 10, ray: 3.0, mie: 0.007, g: 0.86 }, skyExp: 0.48, sunI: 3.0, hemiSky: '#ffe0c8', hemiGround: '#7a5a4a', hemiI: 1.2, fog: '#f2c8a8', fogNear: 55, fogFar: 320, exposure: 0.93, cloud: 0.5, cloudCol: '#ffd0b8' },
    floor: { type: 'water', color: '#2f6a8a', y: -1.5 }, pano: { kind: 'ghats', cols: ['#e0b8a0', '#b08a7a'], seed: 101 },
    path: { mat: 'pathFlag', depth: 3 }, weather: 'motes', weatherColor: '#ffe8c0', birds: true,
    music: { lead: 'flute', scale: [0, 1, 4, 5, 7, 8, 11], root: 61, tempo: 94 }, amb: 'river',
    obst: { hurdle: 'bamboo', banner: 'cloth', block: ['cart', 'pots', 'crates'] },
    left(c, s, d0, d1) {
      const m = M(), r = c.r;
      H.sidewalk(c, s, d0, d1, 2, m.stone); H.landBase(c, s, d0, d1, 2, 0.22, m.stone);
      let d = d0 + 4;
      while (d < d1 - 12) {
        if (r() < 0.35) { P.temple(c, s, 4, d + 6, 0.22, 1.0 + r() * 0.4, r() < 0.5 ? m.whitePlaster : m.templeRed); d += 14; }
        else { const l = 4 + r() * 3; P.stall(c, s, 1.5, d + l / 2, l); d += l + 0.4; }
      }
      H.rowBuildings(c, s, d0, d1, 18, 0.22, (dc, l) => P.haveli(c, s, 18, dc, l, 8, 8 + Math.floor(r() * 3) * 4, 0.22, m.facade.white.concat(m.facade.pastel), { chhatri: false }));
      fol(c, s, d0, d1, (d2) => P.flagPole(c, s * (4 + 1), d2, 5, s > 0 ? PI / 2 : -PI / 2), 12);
    },
    right(c, s, d0, d1, th) { H.railing(c, s, d0, d1, M().stonePlain, M().iron, 4); P.beach(c, s, d0, d1, th, 0.5); fol(c, s, d0, d1, (d) => P.palm(c, s * (4 + 3), 0.4, d, 7), 16); },
    gateMat: 'stone', gateBg: ['#c04a1a', '#5a1a0a'],
  };

  IR.CITY_ORDER = ['varanasi', 'agra', 'delhi', 'amritsar', 'kashmir', 'jaipur', 'udaipur', 'ahmedabad', 'mumbai', 'hyderabad', 'bengaluru', 'chennai', 'kochi', 'kolkata', 'puri'];
  IR.COMING = [];
})();
