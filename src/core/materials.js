/* Material library (PBR MeshStandard/Physical) */
(function () {
  const M = (IR.M = {});
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const rep = (t, x, y) => { t = t.clone(); t.needsUpdate = true; t.repeat.set(x, y || x); return t; };

  IR.initMaterials = () => {
    const T = IR.tex;
    const flag = T.flagstone({ hsl: [30, 32, 62], seed: 11 });
    const flagPink = T.flagstone({ hsl: [8, 42, 66], seed: 12 });
    const flagRed = T.flagstone({ hsl: [8, 52, 42], seed: 13, rows: 6 });
    const ashlar = T.flagstone({ hsl: [32, 26, 58], seed: 21, rows: 8, minW: 60, varW: 60, grain: 22 });
    const ashlarPink = T.flagstone({ hsl: [10, 40, 64], seed: 22, rows: 8, minW: 60, varW: 60 });
    const ashlarRed = T.flagstone({ hsl: [6, 55, 38], seed: 23, rows: 8, minW: 60, varW: 60 });
    const ashlarGrey = T.flagstone({ hsl: [210, 6, 52], seed: 24, rows: 8, minW: 60, varW: 60 });
    const planks = T.planks({ hsl: [24, 42, 32] });
    const asph = T.asphalt();

    const N = (t, s) => T.normalFrom(t, s), R = (t, b, v) => T.roughFrom(t, b, v);
    const ns = new THREE.Vector2(1, 1);
    M.pathFlag = std({ map: flag, normalMap: N(flag, 4), normalScale: ns, roughnessMap: R(flag, 0.72, 0.4), roughness: 1 });
    M.pathPink = std({ map: flagPink, normalMap: N(flagPink, 4), roughnessMap: R(flagPink, 0.72, 0.4), roughness: 1 });
    M.pathRed = std({ map: flagRed, normalMap: N(flagRed, 4), roughnessMap: R(flagRed, 0.7, 0.4), roughness: 1 });
    M.pathWood = std({ map: planks, normalMap: N(planks, 5), roughnessMap: R(planks, 0.7, 0.3), roughness: 1 });
    M.pathAsphalt = new THREE.MeshPhysicalMaterial({ map: asph, normalMap: N(asph, 3), roughness: 0.32, metalness: 0.0, clearcoat: 0.6, clearcoatRoughness: 0.15 });

    M.stone = std({ map: ashlar, normalMap: N(ashlar, 3.5), roughness: 0.88 });
    M.stonePink = std({ map: ashlarPink, normalMap: N(ashlarPink, 3.5), roughness: 0.86 });
    M.stoneRed = std({ map: ashlarRed, normalMap: N(ashlarRed, 3.5), roughness: 0.84 });
    M.stoneGrey = std({ map: ashlarGrey, normalMap: N(ashlarGrey, 3.5), roughness: 0.85 });
    M.stonePlain = std({ color: '#cdb08a', roughness: 0.85 });
    M.stoneDark = std({ color: '#7a6450', roughness: 0.9 });
    M.temple = std({ map: rep(ashlar, 1, 1), color: '#e8c9a0', roughness: 0.82 });
    M.templeRed = std({ color: '#c96a3c', roughness: 0.8 });
    M.marble = std({ color: '#f4efe6', roughness: 0.35 });
    M.whitePlaster = std({ color: '#f1e6d4', roughness: 0.9 });

    M.wood = std({ map: planks, normalMap: M.pathWood.normalMap, roughness: 0.7 });
    M.woodDark = std({ color: '#4a2d1a', roughness: 0.72 });
    M.woodLight = std({ color: '#a9774a', roughness: 0.7 });
    M.bamboo = std({ color: '#c9a35a', roughness: 0.55 });
    M.rope = std({ color: '#b08a55', roughness: 0.95 });
    M.snow = std({ color: '#e6ecf4', roughness: 0.7 });
    M.pine = std({ color: '#1f4a35', roughness: 0.9 });
    M.leaf = std({ color: '#3f7a35', roughness: 0.85 });
    M.leafDark = std({ color: '#2c5a2a', roughness: 0.85 });
    M.chinar = std({ color: '#c4471c', roughness: 0.8 });
    M.trunk = std({ color: '#4d3424', roughness: 0.95 });
    M.palm = std({ color: '#4b8a3a', roughness: 0.7, side: THREE.DoubleSide });

    M.terracotta = std({ color: '#b5582e', roughness: 0.7 });
    M.clay = std({ color: '#8f4a2a', roughness: 0.75 });
    M.gold = std({ color: '#ffc845', metalness: 1, roughness: 0.28 });
    M.brass = std({ color: '#d9a441', metalness: 0.9, roughness: 0.35 });
    M.iron = std({ color: '#2b2b2e', metalness: 0.7, roughness: 0.45 });
    M.steel = std({ color: '#9aa3ad', metalness: 0.8, roughness: 0.35 });
    M.black = std({ color: '#111', roughness: 0.6 });
    M.pit = new THREE.MeshBasicMaterial({ color: '#0b0705' });

    M.marigold = std({ color: '#ff8a10', roughness: 0.6, emissive: '#5a2200' });
    M.marigoldY = std({ color: '#ffc21a', roughness: 0.6, emissive: '#4a3000' });
    M.rose = std({ color: '#e0245a', roughness: 0.6 });
    M.flame = new THREE.MeshBasicMaterial({ color: '#ffd27a' });
    M.flame.userData.noCast = true;
    M.lampGlow = new THREE.MeshBasicMaterial({ color: '#ffe3a8' });
    M.lampGlow.userData.noCast = true;

    M.saffron = std({ color: '#ff7a14', roughness: 0.7, side: THREE.DoubleSide, emissive: '#3a1400' });
    const clothRed = T.cloth({ base: '#b3122a', border: '#f2b53a', dots: 'rgba(255,210,120,.5)' });
    const clothPurple = T.cloth({ base: '#6b2a8a', border: '#f2b53a', motif: 'rgba(255,220,150,.6)', seed: 3 });
    const clothYellow = T.cloth({ base: '#f2b31c', border: '#c2321e', seed: 4 });
    const clothTeal = T.cloth({ base: '#127a7a', border: '#ffd25a', dots: 'rgba(255,255,255,.35)', seed: 5 });
    const clothPink = T.cloth({ base: '#e0457b', border: '#ffe08a', dots: 'rgba(255,255,255,.45)', seed: 6 });
    const clothOrange = T.cloth({ base: '#f06a12', border: '#7a1020', motif: 'rgba(255,230,160,.6)', seed: 7 });
    const ds = THREE.DoubleSide;
    M.cloth = [clothRed, clothPurple, clothYellow, clothTeal, clothPink, clothOrange].map((t) => std({ map: t, roughness: 0.85, side: ds }));
    M.clothRed = M.cloth[0];
    M.awning = ['#f2b31c', '#c62828', '#7b2fa0', '#e04a8a', '#1e8a7a', '#f06a12'].map((c) => std({ color: c, roughness: 0.85, side: ds }));

    M.facade = {};
    const fac = (k, arr) => (M.facade[k] = arr.map((o, i) => { const t = T.facade(Object.assign({ seed: 30 + i }, o)); return std({ map: t, normalMap: T.normalFrom(t, 2.2), roughness: 0.86 }); }));
    fac('ghat', [
      { wall: '#e3c49a', trim: '#f6e7cc', style: 'arch', shutter: '#2f6f6a' },
      { wall: '#d9a777', trim: '#f3dcb5', style: 'arch', shutter: '#7a2a2a' },
      { wall: '#e8b59a', trim: '#fff0dc', style: 'arch', shutter: '#2a4f7a' },
      { wall: '#c9b08f', trim: '#efe0c4', style: 'arch', shutter: '#6b4a2a' },
      { wall: '#e6d2a5', trim: '#b8462e', style: 'arch', shutter: '#2f6f3a' },
    ]);
    fac('pink', [
      { wall: '#e48a6a', trim: '#fbe3c8', style: 'jharokha' },
      { wall: '#d9785c', trim: '#fff1de', style: 'jharokha' },
      { wall: '#e99b78', trim: '#fde7cf', style: 'arch', shutter: '#3a6a5a' },
    ]);
    fac('red', [{ wall: '#a8402a', trim: '#e9c9a0', style: 'fort' }, { wall: '#b5503a', trim: '#f0d7b0', style: 'arch', shutter: '#2e5a3a' }]);
    fac('modern', [
      { wall: '#cfd5da', trim: '#8c96a0', style: 'grid', glass: '#3f5d78', lit: true },
      { wall: '#e9e1d2', trim: '#b9ae9a', style: 'deco', lit: true },
      { wall: '#d8c7a8', trim: '#f1e8d6', style: 'deco', lit: true },
      { wall: '#9fa9b3', trim: '#59636d', style: 'grid', glass: '#2d4a66', lit: true },
    ]);
    fac('chalet', [{ wall: '#5a3a24', trim: '#d9b48a', style: 'chalet', lit: true }, { wall: '#6b4428', trim: '#f0d8b0', style: 'chalet' }]);

    fac('colonial', [
      { wall: '#e9d7a8', trim: '#fbf3e0', style: 'colonial', shutter: '#2f6a3a' },
      { wall: '#d9a46a', trim: '#f6e6c8', style: 'colonial', shutter: '#5a2a1a' },
      { wall: '#c96a52', trim: '#f4e2c8', style: 'colonial', shutter: '#2f4f6a' },
      { wall: '#f0e8d8', trim: '#ffffff', style: 'colonial', shutter: '#1f5a5a' },
    ]);
    fac('pol', [{ wall: '#e8d2b0', trim: '#f6ead2', style: 'pol' }, { wall: '#d9c4a0', trim: '#fff3dc', style: 'pol', cols: ['#7a3a8a', '#2a6aa8', '#e0784a', '#3a8a6a'] }]);
    fac('white', [{ wall: '#f2efe8', trim: '#ffffff', style: 'jharokha', win: '#3a3430' }, { wall: '#f4f0e6', trim: '#e8d8b8', style: 'arch', shutter: '#3a6a8a' }]);
    fac('pastel', [{ wall: '#7ac4b8', trim: '#fff6e8', style: 'colonial', shutter: '#a83a2a' }, { wall: '#f2c46a', trim: '#fff6e8', style: 'colonial', shutter: '#2a5a8a' }, { wall: '#e88a9a', trim: '#fff6e8', style: 'colonial', shutter: '#2a6a3a' }, { wall: '#9ab8e8', trim: '#fff', style: 'colonial', shutter: '#7a4a2a' }]);
    M.sand = std({ color: '#e2c89a', roughness: 0.95 });
    M.gopuram = ['#e8c87a', '#d9785a', '#5aa8a0', '#e0a0b8', '#f2f0e0', '#7a9ad8'].map((c) => std({ color: c, roughness: 0.75 }));
    M.lawn = std({ color: '#4f8a3a', roughness: 0.95 });
    M.net = new THREE.MeshStandardMaterial({ color: '#3a2a1a', roughness: 0.9, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });
    M.roofTile = std({ color: '#8a3a22', roughness: 0.8 });
    M.roofGreen = std({ color: '#3b5e4a', roughness: 0.75 });
    M.taxiYellow = std({ color: '#f2c018', roughness: 0.35, metalness: 0.2 });
    M.glass = std({ color: '#1d2a36', roughness: 0.1, metalness: 0.6 });
    M.stripe = std({ map: (() => { const c = T.cv(128, 32), x = c.getContext('2d'); for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#111' : '#ffcc11'; x.beginPath(); x.moveTo(i * 16, 0); x.lineTo(i * 16 + 16, 0); x.lineTo(i * 16, 32); x.lineTo(i * 16 - 16, 32); x.fill(); } return T.tex(c); })(), roughness: 0.5 });
    M.white = std({ color: '#f5f5f5', roughness: 0.5 });
    M.laneMark = std({ color: '#f2f2e6', roughness: 0.6 });

    const coinFace = T.coin();
    M.coinSide = std({ color: '#ffe066', metalness: 1, roughness: 0.18, emissive: '#a87000' });
    M.coinFace = std({ map: coinFace, bumpMap: coinFace, bumpScale: 3, metalness: 1, roughness: 0.25, emissive: '#5a3a00', emissiveMap: coinFace, emissiveIntensity: 1.25 });

    M.glowTex = T.glow();
    M.dotTex = T.dot();
  };
})();
