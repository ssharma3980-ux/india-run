/* Original 3D runner characters: procedural rig + blended animation */
(function () {
  const PI = Math.PI;
  IR.CHARS_PROC = [
    {
      id: 'arjun', name: { en: 'Arjun', hi: 'अर्जुन', gu: 'અર્જુન' }, from: { en: 'Varanasi', hi: 'वाराणसी', gu: 'વારાણસી' }, price: 0, female: false,
      skin: '#c48558', hair: { style: 'curly', color: '#1b120c' },
      outfits: [
        { name: { en: 'Ghat Runner', hi: 'घाट धावक', gu: 'ઘાટ દોડવીર' }, top: '#f2ece0', topStyle: 'vest', bottom: '#8c1f2c', bottomStyle: 'cargo', scarf: '#ff7410', shoes: '#f4f4f2', sole: '#b8342a', band: '#2a1a12', bag: '#6b4426' },
        { name: { en: 'Festival', hi: 'उत्सव', gu: 'ઉત્સવ' }, top: '#ffc93a', topStyle: 'kurta', bottom: '#f4efe4', bottomStyle: 'pants', scarf: '#c2185b', shoes: '#7a4422', sole: '#2a1a12', band: '#d4a017', bag: '#7a2a2a' },
      ],
    },
    {
      id: 'meera', name: { en: 'Meera', hi: 'मीरा', gu: 'મીરા' }, from: { en: 'Jaipur', hi: 'जयपुर', gu: 'જયપુર' }, price: 500, female: true,
      skin: '#b67650', hair: { style: 'braid', color: '#120b08' },
      outfits: [
        { name: { en: 'Pink City', hi: 'गुलाबी नगरी', gu: 'ગુલાબી નગરી' }, top: '#c2185b', topStyle: 'kurti', bottom: '#f4ead8', bottomStyle: 'pants', scarf: '#ffb300', shoes: '#d4a017', sole: '#6b3a10', band: '#ffd54a', bag: '#8a4a2a' },
        { name: { en: 'Peacock', hi: 'मोर', gu: 'મોર' }, top: '#0f7a8a', topStyle: 'kurti', bottom: '#f2e6d0', bottomStyle: 'pants', scarf: '#ff7043', shoes: '#c2185b', sole: '#3a1020', band: '#ffd54a', bag: '#2e5a3a' },
      ],
    },
    {
      id: 'kabir', name: { en: 'Kabir', hi: 'कबीर', gu: 'કબીર' }, from: { en: 'Kashmir', hi: 'कश्मीर', gu: 'કાશ્મીર' }, price: 1000, female: false,
      skin: '#d6a07a', hair: { style: 'beanie', color: '#2a1a10', cap: '#8a1c2a' },
      outfits: [
        { name: { en: 'Valley Pheran', hi: 'घाटी फेरन', gu: 'ખીણ ફેરન' }, top: '#2e5a4a', topStyle: 'pheran', bottom: '#3a3a42', bottomStyle: 'pants', scarf: '#d9b23a', shoes: '#4a2d1a', sole: '#1a1a1a', band: '#d9b23a', bag: '#5a3a22' },
        { name: { en: 'Saffron Winter', hi: 'केसरिया सर्दी', gu: 'કેસરી શિયાળો' }, top: '#6b2f7a', topStyle: 'pheran', bottom: '#2a2a30', bottomStyle: 'pants', scarf: '#ff8f1f', shoes: '#2a1a12', sole: '#111', band: '#ff8f1f', bag: '#2a2a2a' },
      ],
    },
    {
      id: 'zoya', name: { en: 'Zoya', hi: 'ज़ोया', gu: 'ઝોયા' }, from: { en: 'Mumbai', hi: 'मुंबई', gu: 'મુંબઈ' }, price: 1500, female: true,
      skin: '#a86c48', hair: { style: 'ponytail', color: '#1a100a' },
      outfits: [
        { name: { en: 'Monsoon', hi: 'मानसून', gu: 'ચોમાસું' }, top: '#ffd21a', topStyle: 'jacket', bottom: '#2f4f8a', bottomStyle: 'pants', scarf: '#e53935', shoes: '#ffffff', sole: '#e53935', band: '#222', bag: '#222' },
        { name: { en: 'Marine Drive', hi: 'मरीन ड्राइव', gu: 'મરીન ડ્રાઈવ' }, top: '#ff5a7a', topStyle: 'jacket', bottom: '#1f1f26', bottomStyle: 'pants', scarf: '#26c6da', shoes: '#26c6da', sole: '#fff', band: '#fff', bag: '#26c6da' },
      ],
    },
  ];

  const lathe = (pts, seg = 16) => new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), seg);
  let G = null;
  function geos() {
    if (G) return G;
    G = {
      torso: lathe([[0, 0], [0.145, 0], [0.152, 0.08], [0.162, 0.2], [0.186, 0.32], [0.2, 0.4], [0.188, 0.465], [0.12, 0.525], [0, 0.54]], 20),
      pelvis: lathe([[0, 0.05], [0.148, 0.05], [0.158, -0.04], [0.146, -0.11], [0.06, -0.14], [0, -0.14]], 18),
      skirt: lathe([[0.158, 0.03], [0.17, -0.05], [0.2, -0.2], [0.235, -0.38]], 20),
      longSkirt: lathe([[0.158, 0.03], [0.18, -0.1], [0.23, -0.35], [0.27, -0.6]], 20),
      limb: new THREE.CylinderGeometry(1, 0.78, 1, 14),
      sph: new THREE.SphereGeometry(1, 24, 16),
      sphLo: new THREE.SphereGeometry(1, 12, 8),
      cap: new THREE.SphereGeometry(1, 24, 12, 0, PI * 2, 0, PI * 0.56),
      torus: new THREE.TorusGeometry(1, 0.22, 8, 24),
      box: new THREE.BoxGeometry(1, 1, 1),
      shoe: (() => { const g = new THREE.SphereGeometry(1, 16, 10); g.scale(0.055, 0.05, 0.13); g.translate(0, 0.035, -0.05); return g; })(),
      sole: (() => { const g = new THREE.BoxGeometry(0.115, 0.03, 0.28); g.translate(0, 0.015, -0.05); return g; })(),
    };
    return G;
  }

  function cloth(col) {
    const c = new THREE.Color(col);
    return new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.78, sheen: 0.8, sheenRoughness: 0.6, sheenColor: c.clone().lerp(new THREE.Color('#fff'), 0.35) });
  }

  class Runner {
    constructor(def, outfitIdx = 0) {
      this.def = def;
      const o = def.outfits[outfitIdx] || def.outfits[0], g = geos();
      this.root = new THREE.Group();
      this.body = new THREE.Group(); this.root.add(this.body);
      const skin = new THREE.MeshPhysicalMaterial({ color: def.skin, roughness: 0.48, sheen: 0.3, sheenColor: new THREE.Color('#ffd0b0'), clearcoat: 0.08 });
      const top = cloth(o.top), bot = cloth(o.bottom), scarfM = cloth(o.scarf);
      scarfM.side = THREE.DoubleSide;
      const shoe = new THREE.MeshStandardMaterial({ color: o.shoes, roughness: 0.5 }), sole = new THREE.MeshStandardMaterial({ color: o.sole, roughness: 0.6 });
      const band = new THREE.MeshStandardMaterial({ color: o.band, roughness: 0.5, metalness: 0.3 });
      const hairM = new THREE.MeshPhysicalMaterial({ color: def.hair.color, roughness: 0.55, sheen: 1, sheenColor: new THREE.Color('#6a4a3a'), sheenRoughness: 0.4 });
      const white = new THREE.MeshStandardMaterial({ color: '#f8f6f0', roughness: 0.3 }), dark = new THREE.MeshStandardMaterial({ color: '#160d08', roughness: 0.2 });
      const lip = new THREE.MeshStandardMaterial({ color: def.female ? '#9a3b3b' : '#7a3f32', roughness: 0.5 });
      const bagM = new THREE.MeshStandardMaterial({ color: o.bag, roughness: 0.7 });
      const mesh = (geo, mat, parent, x = 0, y = 0, z = 0, sx = 1, sy = sx, sz = sx) => {
        const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.castShadow = true; parent.add(m); return m;
      };
      const grp = (parent, x = 0, y = 0, z = 0) => { const q = new THREE.Group(); q.position.set(x, y, z); parent.add(q); return q; };
      const fem = def.female;
      const sw = fem ? 0.92 : 1;

      // hips & legs
      this.hips = grp(this.body, 0, 0.98, 0);
      mesh(g.pelvis, bot, this.hips, 0, 0, 0, 1.12 * (fem ? 1.04 : 1), 1, 0.74);
      const legs = (side) => {
        const L = {};
        L.thigh = grp(this.hips, side * 0.095, -0.05, 0);
        mesh(g.limb, bot, L.thigh, 0, -0.22, 0, 0.083, 0.46, 0.083);
        L.knee = grp(L.thigh, 0, -0.45, 0);
        mesh(g.sphLo, o.bottomStyle === 'cargo' ? bot : bot, L.knee, 0, 0, 0, 0.066);
        if (o.bottomStyle === 'cargo') {
          mesh(g.limb, bot, L.knee, 0, -0.1, 0, 0.074, 0.22, 0.074);
          mesh(g.torus, bot, L.knee, 0, -0.21, 0, 0.07, 0.07, 0.07).rotation.x = PI / 2;
          mesh(g.limb, skin, L.knee, 0, -0.3, 0, 0.052, 0.24, 0.052);
          mesh(g.box, bot, L.thigh, side * 0.075, -0.25, 0.01, 0.03, 0.12, 0.1);
        } else mesh(g.limb, bot, L.knee, 0, -0.21, 0, 0.066, 0.43, 0.066);
        L.foot = grp(L.knee, 0, -0.43, 0);
        mesh(g.sphLo, o.bottomStyle === 'cargo' ? band : bot, L.foot, 0, 0.02, 0, 0.05);
        mesh(g.shoe, shoe, L.foot, 0, -0.07, 0);
        mesh(g.sole, sole, L.foot, 0, -0.085, 0);
        return L;
      };
      this.L = legs(-1); this.R = legs(1);

      // torso
      this.torso = grp(this.hips, 0, 0.03, 0);
      const ts = o.topStyle;
      mesh(g.torso, top, this.torso, 0, 0, 0, 1.12 * sw, 1, 0.72);
      if (fem) { mesh(g.sphLo, top, this.torso, -0.075, 0.33, -0.08, 0.075, 0.07, 0.06); mesh(g.sphLo, top, this.torso, 0.075, 0.33, -0.08, 0.075, 0.07, 0.06); }
      if (ts === 'kurti' || ts === 'kurta') mesh(g.skirt, top, this.torso, 0, 0, 0, 1.12 * sw, 1, 0.78).material.side = THREE.DoubleSide;
      if (ts === 'pheran') mesh(g.longSkirt, top, this.torso, 0, 0, 0, 1.12, 1, 0.8).material.side = THREE.DoubleSide;
      if (ts === 'jacket') { mesh(g.box, top, this.torso, 0, 0.27, -0.13, 0.02, 0.5, 0.01); mesh(g.torus, top, this.torso, 0, 0.5, 0.06, 0.13, 0.13, 0.2).rotation.x = 0.5; }
      if (ts === 'kurta' || ts === 'kurti') for (let i = 0; i < 4; i++) mesh(g.sphLo, band, this.torso, 0, 0.45 - i * 0.06, -0.142, 0.009);
      mesh(g.torus, band, this.torso, 0, 0.0, 0, 0.165 * sw, 0.165, 0.12).rotation.x = PI / 2;
      if (!fem || ts !== 'kurti') { const bag = mesh(g.box, bagM, this.hips, 0.19, -0.06, 0.04, 0.07, 0.14, 0.15); bag.rotation.z = 0.1; }
      mesh(g.limb, skin, this.torso, 0, 0.57, 0, 0.052, 0.12, 0.052);

      // head
      this.head = grp(this.torso, 0, 0.62, 0);
      const hc = mesh(g.sph, skin, this.head, 0, 0.1, 0, 0.108, 0.125, 0.115);
      mesh(g.sph, skin, this.head, 0, 0.04, -0.035, 0.078, 0.07, 0.08);
      mesh(g.sphLo, skin, this.head, 0, 0.09, -0.118, 0.018, 0.026, 0.02);
      for (const sx of [-1, 1]) {
        mesh(g.sphLo, skin, this.head, sx * 0.106, 0.1, 0.0, 0.015, 0.032, 0.025);
        mesh(g.sphLo, white, this.head, sx * 0.04, 0.122, -0.101, 0.021, 0.016, 0.012);
        mesh(g.sphLo, dark, this.head, sx * 0.04, 0.121, -0.111, 0.0115, 0.0125, 0.006);
        const brow = mesh(g.box, new THREE.MeshStandardMaterial({ color: def.hair.color }), this.head, sx * 0.042, 0.152, -0.1, 0.045, 0.01, 0.014);
        brow.rotation.z = sx * -0.12;
      }
      this.eyes = this.head.children.filter((c) => c.material === white || c.material === dark);
      mesh(g.box, lip, this.head, 0, 0.05, -0.112, 0.036, 0.009, 0.01);
      if (fem) { mesh(g.sphLo, new THREE.MeshBasicMaterial({ color: '#c0102a' }), this.head, 0, 0.16, -0.112, 0.007); for (const sx of [-1, 1]) mesh(g.torus, band, this.head, sx * 0.11, 0.06, 0, 0.016); }
      // hair
      const hs = def.hair.style;
      if (hs === 'beanie') {
        mesh(g.cap, hairM, this.head, 0, 0.1, 0.005, 0.117, 0.13, 0.123);
        const capM = cloth(def.hair.cap);
        mesh(g.cap, capM, this.head, 0, 0.13, 0.01, 0.125, 0.135, 0.13);
        mesh(g.torus, capM, this.head, 0, 0.145, 0.01, 0.12, 0.12, 0.2).rotation.x = PI / 2;
        mesh(g.sphLo, capM, this.head, 0, 0.27, 0.01, 0.03);
      } else {
        mesh(g.cap, hairM, this.head, 0, 0.098, 0.008, 0.118, 0.138, 0.126);
        const r = IR.rng(def.id.length * 7);
        if (hs === 'curly') {
          for (let i = 0; i < 46; i++) {
            const th = r() * 1.65, ph = r() * PI * 2;
            const x = Math.sin(th) * Math.cos(ph), y = Math.cos(th), z = Math.sin(th) * Math.sin(ph);
            if (z < -0.35 && th > 0.75) continue;
            mesh(g.sphLo, hairM, this.head, x * 0.12, 0.1 + y * 0.13, z * 0.125, 0.036 + r() * 0.018);
          }
          mesh(g.sph, hairM, this.head, 0, 0.12, 0.05, 0.11, 0.1, 0.09);
        } else {
          mesh(g.sph, hairM, this.head, 0, 0.1, 0.035, 0.12, 0.13, 0.11);
        }
      }
      // tails (scarf / braid / ponytail) — chains of groups for secondary motion
      this.chains = [];
      const chain = (parent, x, y, z, n, segLen, makeSeg, opts) => {
        const segs = []; let p = grp(parent, x, y, z);
        for (let i = 0; i < n; i++) { makeSeg(p, i); segs.push(p); p = grp(p, 0, -segLen, 0); }
        this.chains.push(Object.assign({ segs }, opts));
      };
      if (hs === 'braid') chain(this.head, 0, 0.06, 0.11, 8, 0.06, (p, i) => mesh(g.sphLo, hairM, p, 0, -0.03, 0, 0.042 - i * 0.003, 0.04, 0.035), { run: -0.35, idle: 0.05, amp: 0.12, freq: 1 });
      if (hs === 'ponytail') { mesh(g.torus, band, this.head, 0, 0.17, 0.115, 0.03).rotation.x = 0.4; chain(this.head, 0, 0.17, 0.13, 5, 0.07, (p, i) => mesh(g.sphLo, hairM, p, 0, -0.035, 0, 0.045 - i * 0.005, 0.05, 0.04), { run: -0.9, idle: -0.15, amp: 0.25, freq: 1 }); }
      // scarf
      mesh(g.torus, scarfM, this.torso, 0, 0.52, 0, 0.115, 0.115, 0.18).rotation.x = PI / 2 + 0.15;
      const sl = mesh(g.box, scarfM, this.torso, 0.03, 0.34, -0.118, 0.065, 0.36, 0.02); sl.rotation.z = -0.5; sl.rotation.x = -0.12;
      chain(this.torso, -0.05, 0.5, 0.12, 7, 0.1, (p, i) => mesh(g.box, scarfM, p, 0, -0.05, 0, 0.12 - i * 0.006, 0.105, 0.012), { run: -1.25, idle: -0.08, amp: 0.32, freq: 1.6 });

      // arms
      const arm = (side) => {
        const A = {};
        const sleeve = ts === 'vest' ? skin : top;
        A.sh = grp(this.torso, side * 0.205 * sw, 0.455, 0);
        mesh(g.sphLo, ts === 'vest' ? top : top, A.sh, 0, 0, 0, 0.068);
        mesh(g.limb, sleeve, A.sh, 0, -0.14, 0, 0.05, 0.28, 0.05);
        if (ts === 'vest') mesh(g.torus, band, A.sh, 0, -0.1, 0, 0.055, 0.055, 0.08).rotation.x = PI / 2;
        A.el = grp(A.sh, 0, -0.28, 0);
        mesh(g.sphLo, sleeve, A.el, 0, 0, 0, 0.045);
        mesh(g.limb, ts === 'kurti' || ts === 'vest' ? skin : top, A.el, 0, -0.125, 0, 0.043, 0.25, 0.043);
        mesh(g.torus, band, A.el, 0, -0.23, 0, 0.042, 0.042, 0.09).rotation.x = PI / 2;
        mesh(g.sph, skin, A.el, 0, -0.29, -0.005, 0.042, 0.055, 0.035);
        return A;
      };
      this.AL = arm(-1); this.AR = arm(1);

      // power-up visuals
      this.shield = new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 20), new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { t: { value: 0 }, col: { value: new THREE.Color('#5ab4ff') } },
        vertexShader: 'varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); vP = position; gl_Position = projectionMatrix*mv; }',
        fragmentShader: 'uniform float t; uniform vec3 col; varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ float f = pow(1.-abs(dot(vN,vV)), 2.2); float h = .5+.5*sin(vP.y*18.-t*6.); gl_FragColor = vec4(col*(f*1.6+h*.08), f*.9+.05); }',
      }));
      this.shield.position.y = 0.95; this.shield.visible = false; this.root.add(this.shield);
      this.magnetRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.025, 6, 40), new THREE.MeshBasicMaterial({ color: '#ff4a4a', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }));
      this.magnetRing.rotation.x = PI / 2; this.magnetRing.position.y = 0.9; this.magnetRing.visible = false; this.root.add(this.magnetRing);
      // kite glider
      this.kite = new THREE.Group();
      const kg = new THREE.BufferGeometry();
      kg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0.9, 0, -0.85, 0, 0, 0, -1.1, 0, 0, 0.9, 0, 0, -1.1, 0, 0.85, 0, 0], 3));
      kg.setAttribute('color', new THREE.Float32BufferAttribute([1, 0.3, 0.1, 1, 0.8, 0.1, 1, 0.3, 0.1, 0.1, 0.7, 0.6, 1, 0.3, 0.1, 0.9, 0.1, 0.4], 3));
      kg.computeVertexNormals();
      const kite = new THREE.Mesh(kg, new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.6 }));
      kite.rotation.x = -1.1; kite.scale.setScalar(1.4); this.kite.add(kite);
      for (let i = 0; i < 6; i++) { const tl = new THREE.Mesh(g.box, scarfM); tl.scale.set(0.1, 0.02, 0.18); tl.position.set(0, -0.4 - i * 0.05, 1.0 + i * 0.22); this.kite.add(tl); }
      this.kite.position.set(0, 2.6, 0.2); this.kite.visible = false; this.root.add(this.kite);

      this.root.traverse((m) => { if (m.isMesh && m !== this.shield && m !== this.magnetRing) m.castShadow = true; });
      this.shield.castShadow = false; this.magnetRing.castShadow = false;
      this.cur = {}; this.phase = 0; this.t = 0; this.blink = 2;
      this.state = 'idle';
    }

    pose(state, t, ph, speed) {
      const s = Math.sin(ph), c = Math.cos(ph);
      const P = { hipY: 0.98, bodyRx: 0, torsoRx: 0, torsoRy: 0, torsoRz: 0, hipRy: 0, headRx: 0, headRy: 0, thL: 0, thR: 0, knL: -0.05, knR: -0.05, ftL: 0, ftR: 0, shLx: 0, shRx: 0, shLz: -0.08, shRz: 0.08, elL: 0.2, elR: 0.2 };
      if (state === 'run') {
        const k = IR.clamp(0.75 + speed * 0.012, 0.8, 1.05);
        P.thL = 0.12 + 0.82 * k * s; P.thR = 0.12 - 0.82 * k * s;
        P.knL = -(0.22 + 1.4 * Math.pow(Math.max(0, c), 1.2)); P.knR = -(0.22 + 1.4 * Math.pow(Math.max(0, -c), 1.2));
        P.ftL = 0.25 * Math.sin(ph + 1.2); P.ftR = 0.25 * Math.sin(ph + 1.2 + PI);
        P.shLx = -0.85 * k * s; P.shRx = 0.85 * k * s; P.shLz = -0.14; P.shRz = 0.14;
        P.elL = 1.35 + 0.3 * s; P.elR = 1.35 - 0.3 * s;
        P.torsoRx = -0.24; P.torsoRy = 0.16 * s; P.hipRy = -0.12 * s; P.headRx = 0.16; P.headRy = -0.08 * s;
        P.hipY = 0.95 + 0.07 * Math.abs(s);
      } else if (state === 'jump') {
        P.thL = 1.25; P.thR = 0.05; P.knL = -1.8; P.knR = -0.7; P.ftL = 0.3;
        P.shLx = 1.9; P.shRx = -0.6; P.shLz = -0.4; P.shRz = 0.35; P.elL = 0.5; P.elR = 0.9; P.torsoRx = -0.12; P.headRx = 0.05;
      } else if (state === 'slide') {
        P.hipY = 0.36; P.torsoRx = 1.0; P.thL = 1.5; P.thR = 1.25; P.knL = -0.12; P.knR = -1.0;
        P.shLx = 0.7; P.shRx = 0.5; P.shLz = -0.7; P.shRz = 0.7; P.elL = 0.4; P.elR = 0.6; P.headRx = -0.75;
      } else if (state === 'glide') {
        P.shLx = 2.95; P.shRx = 2.95; P.shLz = -0.25; P.shRz = 0.25; P.elL = 0.2; P.elR = 0.2;
        P.thL = 0.2 + 0.15 * Math.sin(t * 3); P.thR = -0.1 - 0.15 * Math.sin(t * 3); P.knL = -0.6; P.knR = -0.4; P.torsoRx = 0.05;
      } else if (state === 'crash') {
        P.hipY = 0.5; P.bodyRx = 1.25; P.torsoRx = 0.4; P.thL = 0.9; P.thR = 0.4; P.knL = -0.9; P.knR = -0.3; P.shLx = 1.4; P.shRx = 1.0; P.shLz = -1.1; P.shRz = 1.2; P.elL = 0.3; P.elR = 0.5; P.headRx = -0.3;
      } else if (state === 'show') {
        P.hipY = 0.98 + Math.sin(t * 1.8) * 0.006; P.torsoRx = -0.02 + Math.sin(t * 1.8) * 0.02; P.hipRy = Math.sin(t * 0.7) * 0.06;
        P.thL = 0.04; P.thR = -0.06; P.knL = -0.08; P.shLz = -0.12; P.shRz = 0.35 + Math.sin(t * 4) * 0.08; P.shRx = 0.2; P.elR = 1.9; P.elL = 0.25;
        P.headRy = Math.sin(t * 0.6) * 0.25; P.headRx = Math.sin(t * 0.9) * 0.05;
      } else {
        P.torsoRx = Math.sin(t * 1.6) * 0.02; P.headRy = Math.sin(t * 0.5) * 0.3; P.shLz = -0.1 - Math.sin(t * 1.6) * 0.02; P.shRz = 0.1 + Math.sin(t * 1.6) * 0.02;
      }
      return P;
    }

    update(dt, st) {
      this.t += dt;
      const speed = st.speed || 0, state = st.state || 'idle';
      const cadence = state === 'run' ? Math.PI * 2 * IR.clamp(1.25 + speed * 0.045, 1.4, 2.35) : 0;
      const prev = this.phase;
      this.phase += cadence * dt;
      if (state === 'run' && Math.floor(prev / Math.PI) !== Math.floor(this.phase / Math.PI) && st.onStep) st.onStep();
      const P = this.pose(state, this.t, this.phase, speed);
      const k = state === 'run' ? 26 : state === 'crash' ? 7 : 13;
      for (const key in P) this.cur[key] = this.cur[key] === undefined ? P[key] : IR.damp(this.cur[key], P[key], k, dt);
      const C = this.cur;
      this.hips.position.y = C.hipY; this.hips.rotation.y = C.hipRy;
      this.body.rotation.x = C.bodyRx; this.body.rotation.z = IR.damp(this.body.rotation.z, st.lean || 0, 8, dt);
      this.torso.rotation.set(C.torsoRx, C.torsoRy, C.torsoRz);
      this.head.rotation.set(C.headRx, C.headRy, 0);
      this.L.thigh.rotation.x = C.thL; this.R.thigh.rotation.x = C.thR;
      this.L.knee.rotation.x = C.knL; this.R.knee.rotation.x = C.knR;
      this.L.foot.rotation.x = C.ftL; this.R.foot.rotation.x = C.ftR;
      this.AL.sh.rotation.set(C.shLx, 0, C.shLz); this.AR.sh.rotation.set(C.shRx, 0, C.shRz);
      this.AL.el.rotation.x = C.elL; this.AR.el.rotation.x = C.elR;
      // secondary motion
      const moving = state === 'run' || state === 'jump' || state === 'glide' || state === 'slide';
      for (const ch of this.chains) {
        ch.cur = IR.damp(ch.cur === undefined ? ch.idle : ch.cur, moving ? ch.run : ch.idle, 4, dt);
        ch.segs.forEach((sgm, i) => {
          sgm.rotation.x = (i === 0 ? ch.cur : ch.cur * 0.08) + Math.sin(this.t * (moving ? 13 : 2) * ch.freq - i * 0.9) * ch.amp * (moving ? 1 : 0.2) * (0.4 + i * 0.12);
          sgm.rotation.z = Math.sin(this.t * 5 - i * 0.6) * 0.06 * (moving ? 1 : 0.2);
        });
      }
      // blink
      this.blink -= dt;
      const bl = this.blink < 0.12 ? 0.15 : 1;
      if (this.blink < 0) this.blink = 2 + Math.random() * 3;
      for (const e of this.eyes) e.scale.y = e.userData.sy === undefined ? (e.userData.sy = e.scale.y) : e.userData.sy * bl;
      // power visuals
      this.shield.visible = !!st.shield; this.shield.material.uniforms.t.value = this.t;
      this.magnetRing.visible = !!st.magnet; this.magnetRing.rotation.z += dt * 4; this.magnetRing.scale.setScalar(1 + Math.sin(this.t * 8) * 0.05);
      this.kite.visible = state === 'glide'; this.kite.rotation.z = Math.sin(this.t * 2) * 0.1;
    }
  }
  IR.Runner = Runner;
})();
