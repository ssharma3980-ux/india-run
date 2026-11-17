/* Procedural track: runs of road joined by 90° junctions, streamed in budgeted jobs */
(function () {
  const PI = Math.PI;
  const DIRS = [new THREE.Vector3(0, 0, -1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(-1, 0, 0)];
  const YAWS = [0, -PI / 2, PI, PI / 2];
  /* IR.POWERS (Indian power-ups) is defined in culture.js */

  class World {
    constructor(scene) {
      this.scene = scene; this.runs = []; this.jobs = []; this.t = 0;
      this.coinGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.08, 28); this.coinGeo.rotateX(PI / 2);
      this.iconTex = {};
      for (const k in IR.POWERS) this.iconTex[k] = IR.tex.icon(IR.POWERS[k].icon, IR.POWERS[k].ring);
      this.ringMat = new THREE.MeshBasicMaterial({ color: '#fff3c0', transparent: true, opacity: 0.85 });
      this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._v = new THREE.Vector3(); this._s = new THREE.Vector3(1, 1, 1);
    }

    reset(o) {
      for (const r of this.runs) IR.disposeTree(r.group);
      this.runs = []; this.jobs = []; this.count = 0;
      this.mode = o.mode; this.city = o.city; this.festival = o.festival || null; this.cityList = o.cityList || IR.CITY_ORDER; this.seed = o.seed || ((Math.random() * 1e9) | 0);
      this.cityStart = Math.max(0, this.cityList.indexOf(o.city));
      for (let i = 0; i < 3; i++) this.addRun();
      this.flush();
      return this.runs[0];
    }
    themeFor(i) {
      if (this.mode !== 'yatra') return IR.THEMES[this.city];
      return IR.THEMES[this.cityList[(this.cityStart + Math.floor(i / 3)) % this.cityList.length]];
    }

    addRun() {
      const prev = this.runs[this.runs.length - 1], i = this.count++;
      const r = IR.rng(this.seed * 31 + i * 7919);
      const h = prev ? prev.nextH : 0;
      const start = prev ? prev.start.clone().addScaledVector(prev.dir, prev.L) : new THREE.Vector3();
      const L = i === 0 ? 175 : Math.round(IR.rr(r, 120, 190));
      const turn = h === 0 ? (r() < 0.5 ? -1 : 1) : h === 1 ? -1 : 1;
      const theme = this.themeFor(i);
      const run = {
        i, h, dir: DIRS[h], right: new THREE.Vector3(-DIRS[h].z, 0, DIRS[h].x), yaw: YAWS[h], start, L, turn,
        nextH: turn < 0 ? (h + 3) % 4 : (h + 1) % 4, startTurn: prev ? prev.turn : 0, theme,
        newCity: !prev || prev.theme !== theme, group: new THREE.Group(), obstacles: [], coinData: [], pickups: [], gaps: [], anim: [], falls: [], ready: false, seedR: r,
      };
      run.group.position.copy(start); run.group.rotation.y = run.yaw;
      this.scene.add(run.group);
      if (prev) prev.next = run;
      this.runs.push(run);
      // landmark monument (modelled in Blender) — one per run, cycling through the city's list
      const cult = IR.CULTURE[theme.id];
      if (cult && cult.mon.length) {
        const cfg = cult.mon[i % cult.mon.length], md = IR.MON[cfg.k];
        if (md && IR.Monuments.models[cfg.k]) {
          const sc = cfg.s || 1, dC = Math.round(L * (cfg.place === 'span' ? 0.55 : 0.45));
          run.mon = { cfg, d: dC, half: (cfg.place === 'span' ? md.dp : md.w) * sc / 2 + 3, side: cfg.place === 'span' ? 0 : cfg.place === 'left' ? -1 : 1 };
        }
      }
      run.factD = run.mon ? run.mon.d - 30 : (run.newCity ? 75 : -1);
      this.plan(run, r);
      this.jobs.push(() => this.buildGround(run));
      this.jobs.push(() => this.buildContent(run));
      if (run.mon) this.jobs.push(() => this.buildMonument(run));
      if (this.festival) this.jobs.push(() => this.buildFestival(run));
      const cutRange = (s, d0, d1) => {
        const m = run.mon; if (!m || (m.side !== 0 && m.side !== s)) return [[d0, d1]];
        const c0 = m.d - m.half, c1 = m.d + m.half, out = [];
        if (c0 - d0 > 6) out.push([d0, Math.min(d1, c0)]);
        if (d1 - c1 > 6) out.push([Math.max(d0, c1), d1]);
        return out;
      };
      for (const s of [-1, 1])
        for (const [e0, e1] of cutRange(s, i === 0 ? -60 : run.startTurn === s ? 50 : 12, L - 12))
          for (let a = e0; a < e1 - 4; a += 36) {
            const b0 = a, b1 = Math.min(a + 36, e1), seed = this.seed * 13 + i * 101 + (s + 1) * 1000 + Math.round(a);
            this.jobs.push(() => this.buildDecor(run, s, b0, b1, seed));
          }
      if (theme.far) {
        const s = 1;
        for (const [e0, e1] of cutRange(s, i === 0 ? -60 : run.startTurn === s ? 132 : 12, L - 12))
          for (let a = e0; a < e1 - 4; a += 36) { const b0 = a, b1 = Math.min(a + 36, e1), seed = this.seed * 17 + i * 131 + Math.round(a); this.jobs.push(() => this.buildFar(run, s, b0, b1, seed)); }
      }
      this.jobs.push(() => { run.ready = true; });
      return run;
    }

    plan(run, r) {
      const k = IR.clamp(run.i / 10, 0, 1);
      let d = run.i === 0 ? 60 : run.newCity ? 40 : 34;
      const end = run.L - 24, items = [];
      while (d < end) {
        const t = r(); let o;
        if (t < 0.25) { const q = r(), l = Math.floor(r() * 3); o = { type: 'hurdle', lanes: q < 0.45 ? [l] : q < 0.72 ? (l < 2 ? [l, l + 1] : [1, 2]) : [0, 1, 2] }; }
        else if (t < 0.45) o = { type: 'banner', lanes: [0, 1, 2] };
        else if (t < 0.72) { const a = Math.floor(r() * 3); let lanes = [a]; if (r() < 0.5 + k * 0.2) lanes.push((a + 1 + Math.floor(r() * 2)) % 3); o = { type: 'block', lanes }; }
        else if (t < 0.85 && run.i > 0) o = { type: 'gap', lanes: [0, 1, 2], len: IR.rr(r, 3.0, 4.2 + k) };
        else { const free = Math.floor(r() * 3); items.push({ type: 'block', lanes: [0, 1, 2].filter((l) => l !== free), d }); o = { type: 'hurdle', lanes: [free] }; }
        o.d = d; items.push(o);
        d += IR.rr(r, 23, 31) - k * 4;
      }
      run.plan = items;
      for (const it of items) if (it.type === 'gap') run.gaps.push([it.d - it.len / 2, it.d + it.len / 2]);
      // coins
      const add = (d, lane, y = 1.0) => run.coinData.push({ d, x: IR.LANES[lane], y, taken: false, mag: false, lx: 0, ly: 0, lz: 0 });
      let prevD = run.i === 0 ? 10 : 8;
      const singles = items.filter((it, idx) => !(it.type === 'block' && items[idx + 1] && items[idx + 1].d === it.d));
      for (const it of singles) {
        const blocked = items.filter((o) => o.d === it.d && o.type === 'block').flatMap((o) => o.lanes);
        const freeLanes = [0, 1, 2].filter((l) => !blocked.includes(l));
        const lane = IR.pick(r, freeLanes.length ? freeLanes : [1]);
        const a = prevD + 3, b = it.d - (it.type === 'gap' ? it.len / 2 + 5 : 5);
        if (b - a > 4 && r() < 0.85) for (let dd = a; dd < Math.min(b, a + 16); dd += 1.7) add(dd, lane);
        if (it.type === 'hurdle' || it.type === 'gap') {
          const l2 = it.type === 'hurdle' ? it.lanes[Math.floor(r() * it.lanes.length)] : lane, span = it.type === 'gap' ? it.len / 2 + 3 : 3.2;
          for (let q = 0; q <= 6; q++) { const tt = q / 6; add(it.d - span + tt * span * 2, l2, 1.0 + Math.sin(tt * PI) * 1.5); }
        } else if (it.type === 'banner') for (let q = -2; q <= 2; q++) add(it.d + q * 1.2, lane, 0.55);
        prevD = it.d + (it.len || 0) / 2 + 2;
      }
      if (run.L - 30 - prevD > 6) for (let dd = prevD + 3; dd < Math.min(run.L - 28, prevD + 18); dd += 1.7) add(dd, 1);
      // power-up
      if (r() < 0.6 && items.length > 1) {
        const idx = Math.floor(r() * (items.length - 1)), d0 = (items[idx].d + items[idx + 1].d) / 2;
        const blockedNear = (l) => items.some((o) => Math.abs(o.d - d0) < 4 && o.lanes.includes(l));
        const lane = [0, 1, 2].find((l) => !blockedNear(l));
        const kinds = ['magnet', 'magnet', 'shield', 'double', 'multi', 'boost', 'glide', 'rath'];
        if (lane !== undefined && !run.coinData.some((cd) => Math.abs(cd.d - d0) < 1.5 && cd.x === IR.LANES[lane])) run.pickupPlan = { d: d0, lane, kind: IR.pick(r, kinds) };
      }
      // festival tokens replace every 4th coin
      if (this.festival) run.coinData.forEach((cd, k) => { if (k % 4 === 1) cd.tok = true; });
      // hidden treasure: floats above a single-lane hurdle (jump for it) or under a banner (slide for it)
      if (run.i > 0 && r() < 0.4) {
        const cands = items.filter((it) => (it.type === 'hurdle' && it.lanes.length === 1) || it.type === 'banner');
        if (cands.length) {
          const it = IR.pick(r, cands), lane = it.type === 'hurdle' ? it.lanes[0] : Math.floor(r() * 3);
          run.coinData = run.coinData.filter((cd) => !(Math.abs(cd.d - it.d) < 2 && cd.x === IR.LANES[lane]));
          run.treasurePlan = { d: it.d, x: IR.LANES[lane], y: it.type === 'hurdle' ? 1.95 : 0.35 };
        }
      }
    }

    buildGround(run) {
      const th = run.theme, M = IR.M, b = new IR.Batcher(), c = IR.P.ctx(b, run.seedR, run.group);
      const mat = M[th.path.mat], depth = th.path.depth;
      const a0 = run.i === 0 ? -60 : 4, a1 = run.L + 4;
      const cuts = run.gaps.slice().sort((p, q) => p[0] - q[0]);
      const spans = []; let a = a0;
      for (const [g0, g1] of cuts) { spans.push([a, g0]); a = g1; }
      spans.push([a, a1]);
      for (const [s0, s1] of spans) {
        if (s1 - s0 < 0.1) continue;
        c.box(mat, 8, depth, s1 - s0, 0, -depth / 2, (s0 + s1) / 2, 0, th.path.ts || 2.6);
        const curbMat = th.path.mat === 'pathAsphalt' ? M.stonePlain : th.path.mat === 'pathWood' ? M.woodDark : M.stoneDark;
        const ce = Math.min(s1, run.L - 4);
        if (ce - s0 > 0.5) for (const sx of [-1, 1]) c.box(curbMat, 0.28, 0.12, ce - s0, sx * 3.92, 0.06, (s0 + ce) / 2);
        if (th.path.lanes) for (let d = Math.ceil(s0 / 6) * 6; d < Math.min(s1, run.L - 6) - 2.5; d += 6) for (const lx of [-1.15, 1.15]) c.box(M.laneMark, 0.14, 0.02, 2.4, lx, 0.012, d + 1.2);
        if (th.path.rails) for (const rx of [-0.72, 0.72]) c.box(M.steel, 0.09, 0.03, s1 - s0, rx, 0.012, (s0 + s1) / 2);
        if (th.path.piles) for (let d = s0 + 1; d < s1; d += 4) for (const sx of [-3.5, 3.5]) c.cyl(M.woodDark, 0.16, 4.2, sx, -2.2, d);
      }
      for (const [g0, g1] of cuts) {
        if (th.floor.type === 'ground') c.box(M.pit, 8, 0.02, g1 - g0, 0, 0.004, (g0 + g1) / 2);
        for (let q = 0; q < 6; q++) {
          const edge = q < 3 ? g0 : g1, dd = edge + (q < 3 ? -0.2 : 0.2);
          c.put(mat, IR.G.box, (q % 3 - 1) * 2.6 + (run.seedR() - 0.5), -0.15, dd, run.seedR() - 0.5, run.seedR(), run.seedR() - 0.5, 0.7 + run.seedR() * 0.8, 0.3, 0.5);
        }
        // crumbling slabs (fall when the runner approaches)
        for (let q = 0; q < 4; q++) {
          const m = new THREE.Mesh(IR.G.box, mat);
          m.scale.set(1.6 + run.seedR(), Math.min(depth, 0.5), 0.9);
          m.position.set(-3 + q * 2 + run.seedR() * 0.4, -m.scale.y / 2, -(g0 + 0.6 + run.seedR() * (g1 - g0 - 1.2)));
          m.castShadow = true; run.group.add(m);
          run.falls.push({ m, d: g0, v: 0, rx: (run.seedR() - 0.5) * 3, rz: (run.seedR() - 0.5) * 3, active: false, delay: q * 0.08 });
        }
      }
      IR.P.junctionWall(c, run.L, run.turn, th);
      if (th.landmarks) th.landmarks(c, run);
      if (run.newCity) IR.P.welcomeGate(c, run.i === 0 ? 22 : 16, th);
      b.build(run.group);
      if (c.glows.length) IR.addGlows(run.group, c.glows);
      run.anim.push(...c.anim);
    }

    buildContent(run) {
      const th = run.theme, r = run.seedR;
      for (const it of run.plan) {
        if (it.type === 'gap') { run.obstacles.push({ type: 'gap', lanes: [0, 1, 2], d: it.d, depth: it.len, len: it.len }); continue; }
        const style = it.type === 'block' ? IR.pick(r, th.obst.block) : th.obst[it.type];
        const o = IR.makeObstacle(it.type, style, it.lanes, r);
        o.group.position.z = -it.d;
        run.group.add(o.group);
        run.obstacles.push({ type: it.type, lanes: it.lanes, d: it.d, depth: o.depth, group: o.group });
      }
      // coins as one instanced mesh
      const n = run.coinData.length;
      if (n) {
        const im = new THREE.InstancedMesh(this.coinGeo, [IR.M.coinSide, IR.M.coinFace, IR.M.coinFace], n);
        im.castShadow = true; im.frustumCulled = false;
        run.coins = im; run.group.add(im);
        for (const cd of run.coinData) {
          cd.lx = cd.x; cd.ly = cd.y; cd.lz = -cd.d;
          if (cd.tok) { const sp = new THREE.Sprite(this.tokenMat()); sp.scale.set(0.95, 0.95, 1); sp.position.set(cd.lx, cd.ly, cd.lz); run.group.add(sp); cd.sprite = sp; }
        }
      }
      if (run.treasurePlan) {
        const t = run.treasurePlan, g = IR.makeChest();
        g.position.set(t.x, t.y, -t.d); run.group.add(g);
        run.treasure = Object.assign({ g, taken: false }, t);
      }
      if (run.pickupPlan) {
        const p = run.pickupPlan, g = new THREE.Group();
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.iconTex[p.kind], depthWrite: false, toneMapped: false }));
        sp.scale.set(1.1, 1.1, 1); g.add(sp);
        const ring = new THREE.Mesh(IR.G.ring, this.ringMat); ring.scale.setScalar(0.62); g.add(ring);
        g.position.set(IR.LANES[p.lane], 1.25, -p.d);
        run.group.add(g);
        run.pickups.push({ kind: p.kind, d: p.d, x: IR.LANES[p.lane], y: 1.25, g, ring, taken: false });
      }
    }

    buildDecor(run, s, d0, d1, seed) {
      const b = new IR.Batcher(), c = IR.P.ctx(b, IR.rng(seed), run.group);
      (s < 0 ? run.theme.left : run.theme.right)(c, s, d0, d1, run.theme);
      b.build(run.group);
      if (c.glows.length) IR.addGlows(run.group, c.glows);
      run.anim.push(...c.anim);
    }

    tokenMat() {
      const k = this.festival;
      if (!this._tokMat || this._tokKey !== k) { this._tokKey = k; this._tokMat = new THREE.SpriteMaterial({ map: IR.tex.icon(IR.FESTIVALS[k].token, 'rgba(255,200,80,.85)'), depthWrite: false, toneMapped: false }); }
      return this._tokMat;
    }

    buildMonument(run) {
      const m = run.mon, cfg = m.cfg, md = IR.MON[cfg.k], sc = cfg.s || 1, th = run.theme;
      const obj = IR.Monuments.models[cfg.k].clone();
      obj.scale.setScalar(sc);
      if (m.side === 0) obj.position.set(0, 0, -m.d);
      else {
        const s = m.side, depth = md.dp * sc, y = cfg.water ? th.floor.y + 0.25 : 0;
        obj.position.set(s * (4 + cfg.u + depth / 2), y, -m.d);
        obj.rotation.y = -s * Math.PI / 2;
        if (cfg.pad) { const pad = new THREE.Mesh(IR.G.box, IR.M.stone); pad.scale.set(depth + 6, 3.4, md.w * sc + 6); pad.position.set(obj.position.x, -1.5, -m.d); pad.receiveShadow = true; run.group.add(pad); }
      }
      run.group.add(obj);
    }

    buildFestival(run) {
      const b = new IR.Batcher(), c = IR.P.ctx(b, IR.rng(this.seed + run.i * 7), run.group);
      IR.festDecor(c, run, this.festival);
      b.build(run.group, { cast: false });
      if (c.glows.length) IR.addGlows(run.group, c.glows);
      run.anim.push(...c.anim);
    }

    buildFar(run, s, d0, d1, seed) {
      const b = new IR.Batcher(), c = IR.P.ctx(b, IR.rng(seed), run.group);
      run.theme.far(c, s, d0, d1, run.theme);
      b.build(run.group, { cast: false });
      if (c.glows.length) IR.addGlows(run.group, c.glows);
      run.anim.push(...c.anim);
    }

    flush() { while (this.jobs.length) this.jobs.shift()(); }
    process(budgetMs) {
      const t0 = performance.now();
      while (this.jobs.length && performance.now() - t0 < budgetMs) this.jobs.shift()();
    }

    toWorld(run, d, x, y, out) {
      return out.copy(run.start).addScaledVector(run.dir, d).addScaledVector(run.right, x).setY(run.start.y + y);
    }

    update(dt, cur, pd) {
      this.t += dt;
      // keep two runs ahead of the current one, drop old runs
      const ci = this.runs.indexOf(cur);
      while (this.runs.length - ci < 4) this.addRun();
      while (this.runs.length && this.runs.indexOf(cur) > 1) { const old = this.runs.shift(); IR.disposeTree(old.group); }
      this.process(5);
      IR.P.animateFlags(this.t);
      const m = this._m, q = this._q, v = this._v, sc = this._s;
      for (const run of this.runs) {
        for (const a of run.anim) a.obj.position.y = a.y + Math.sin(this.t * 1.6 + a.ph) * a.amp, (a.obj.rotation.z = Math.sin(this.t * 1.1 + a.ph) * a.amp * 0.6);
        if (run.coins) {
          q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, this.t * 3);
          for (let k = 0; k < run.coinData.length; k++) {
            const cd = run.coinData[k];
            if (cd.taken || cd.tok) sc.set(0, 0, 0); else sc.set(1, 1, 1);
            if (cd.sprite) { cd.sprite.visible = !cd.taken; cd.sprite.position.set(cd.lx, cd.ly + Math.sin(this.t * 3 + cd.d) * 0.08, cd.lz); }
            v.set(cd.lx, cd.ly + Math.sin(this.t * 3 + cd.d) * 0.06, cd.lz);
            m.compose(v, q, sc); run.coins.setMatrixAt(k, m);
          }
          run.coins.instanceMatrix.needsUpdate = true;
        }
        if (run.treasure && !run.treasure.taken) { const g = run.treasure.g; g.rotation.y += dt * 1.2; g.position.y = run.treasure.y + Math.sin(this.t * 2.2) * 0.1; }
        for (const p of run.pickups) if (!p.taken) { p.g.position.y = p.y + Math.sin(this.t * 2.5) * 0.15; p.ring.rotation.y += dt * 2; p.ring.rotation.x = 0.3; }
        if (run === cur) for (const f of run.falls) {
          if (!f.active && pd > f.d - 38) f.active = true;
          if (f.active) {
            if (f.delay > 0) { f.delay -= dt; continue; }
            f.v += 22 * dt; f.m.position.y -= f.v * dt; f.m.rotation.x += f.rx * dt; f.m.rotation.z += f.rz * dt;
            if (f.m.position.y < -12) f.m.visible = false;
          }
        }
      }
    }
  }
  IR.World = World;
})();
