/* INDIA RUN: Legends of Bharat — core utilities (original code) */
(function () {
  const IR = (window.IR = window.IR || {});

  IR.rng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  IR.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  IR.lerp = (a, b, t) => a + (b - a) * t;
  IR.damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  IR.pick = (r, arr) => arr[Math.floor(r() * arr.length) % arr.length];
  IR.rr = (r, a, b) => a + (b - a) * r();
  IR.angDamp = (a, b, k, dt) => {
    let d = b - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return a + d * (1 - Math.exp(-k * dt));
  };

  const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
  IR.mat4 = (x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => {
    _e.set(rx, ry, rz, 'YXZ');
    _q.setFromEuler(_e);
    return new THREE.Matrix4().compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz));
  };

  /* --- shared unit geometries --- */
  const lathe = (pts, seg) => new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), seg);
  IR.G = {};
  IR.initGeo = () => {
    const G = IR.G;
    G.box = new THREE.BoxGeometry(1, 1, 1);
    G.cyl = new THREE.CylinderGeometry(1, 1, 1, 12);
    G.cyl6 = new THREE.CylinderGeometry(1, 1, 1, 6);
    G.cylT = new THREE.CylinderGeometry(0.75, 1, 1, 10);
    G.cone = new THREE.ConeGeometry(1, 1, 12);
    G.cone4 = new THREE.ConeGeometry(1, 1, 4);
    G.cone8 = new THREE.ConeGeometry(1, 1, 8);
    G.sph = new THREE.SphereGeometry(1, 14, 10);
    G.sphLo = new THREE.SphereGeometry(1, 8, 6);
    G.hemi = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    G.ico = new THREE.IcosahedronGeometry(1, 0);
    G.ico1 = new THREE.IcosahedronGeometry(1, 1);
    G.torus = new THREE.TorusGeometry(1, 0.18, 6, 16);
    G.ring = new THREE.TorusGeometry(1, 0.06, 4, 20);
    G.plane = new THREE.PlaneGeometry(1, 1);
    G.shikhara = lathe([[0, 0], [1, 0], [1, 0.12], [0.9, 0.16], [0.94, 0.45], [0.9, 1.1], [0.8, 1.8], [0.64, 2.45], [0.46, 2.95], [0.28, 3.3], [0.12, 3.48], [0, 3.52]], 12);
    G.amalaka = new THREE.TorusGeometry(1, 0.5, 8, 16);
    G.dome = lathe([[0, 0], [1, 0], [1.1, 0.28], [1.06, 0.6], [0.82, 0.95], [0.46, 1.22], [0.18, 1.45], [0.07, 1.7], [0, 1.82]], 14);
    G.flatDome = lathe([[0, 0], [1, 0], [0.98, 0.25], [0.85, 0.55], [0.55, 0.82], [0.2, 0.95], [0, 0.98]], 14);
    G.pot = lathe([[0, 0], [0.32, 0], [0.52, 0.1], [0.62, 0.33], [0.56, 0.58], [0.34, 0.74], [0.23, 0.8], [0.29, 0.88], [0.26, 0.92], [0, 0.9]], 14);
    G.diya = lathe([[0, 0], [0.5, 0.02], [0.95, 0.25], [1, 0.32], [0.85, 0.3], [0, 0.2]], 10);
    G.kalash = lathe([[0, 0], [0.4, 0], [0.7, 0.25], [0.6, 0.55], [0.25, 0.7], [0.32, 0.8], [0, 1.1]], 10);
    G.hull = new THREE.SphereGeometry(1, 14, 7, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    G.umbrella = lathe([[0, 0], [1, 0], [0.6, 0.18], [0.05, 0.42], [0, 0.45]], 14);
  };

  /* --- geometry merger: one draw call per material --- */
  const nonIdx = new WeakMap();
  function prep(geo) {
    let g = nonIdx.get(geo);
    if (!g) {
      g = geo.index ? geo.toNonIndexed() : geo;
      if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      if (!g.attributes.normal) g.computeVertexNormals();
      nonIdx.set(geo, g);
    }
    return g;
  }
  const _nm = new THREE.Matrix3(), _v = new THREE.Vector3();
  class Batcher {
    constructor() { this.map = new Map(); }
    add(mat, geo, m) {
      let l = this.map.get(mat);
      if (!l) { l = []; this.map.set(mat, l); }
      l.push(prep(geo), m);
      return this;
    }
    p(mat, geo, x, y, z, rx, ry, rz, sx, sy, sz, T) {
      const m = IR.mat4(x, y, z, rx, ry, rz, sx, sy, sz);
      if (T) m.premultiply(T);
      return this.add(mat, geo, m);
    }
    build(parent, opts = {}) {
      const out = [];
      for (const [mat, l] of this.map) {
        let n = 0;
        for (let i = 0; i < l.length; i += 2) n += l[i].attributes.position.count;
        const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
        let o = 0;
        for (let i = 0; i < l.length; i += 2) {
          const g = l[i], m = l[i + 1];
          _nm.getNormalMatrix(m);
          const P = g.attributes.position.array, N = g.attributes.normal.array, U = g.attributes.uv.array, c = g.attributes.position.count;
          for (let k = 0; k < c; k++) {
            _v.set(P[k * 3], P[k * 3 + 1], P[k * 3 + 2]).applyMatrix4(m);
            pos[(o + k) * 3] = _v.x; pos[(o + k) * 3 + 1] = _v.y; pos[(o + k) * 3 + 2] = _v.z;
            _v.set(N[k * 3], N[k * 3 + 1], N[k * 3 + 2]).applyMatrix3(_nm).normalize();
            nor[(o + k) * 3] = _v.x; nor[(o + k) * 3 + 1] = _v.y; nor[(o + k) * 3 + 2] = _v.z;
            uv[(o + k) * 2] = U[k * 2]; uv[(o + k) * 2 + 1] = U[k * 2 + 1];
          }
          o += c;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
        geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        geo.computeBoundingSphere();
        geo.userData.own = true;
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = opts.cast !== false && !mat.userData.noCast;
        mesh.receiveShadow = opts.receive !== false;
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        parent.add(mesh);
        out.push(mesh);
      }
      this.map.clear();
      return out;
    }
  }
  IR.Batcher = Batcher;

  /* box with world-scaled UVs (ts = metres per texture repeat) */
  IR.box = (w, h, d, ts = 4) => {
    const g = new THREE.BoxGeometry(w, h, d);
    const uv = g.attributes.uv;
    const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++)
      for (let i = 0; i < 4; i++) {
        const j = f * 4 + i;
        uv.setXY(j, (uv.getX(j) * dims[f][0]) / ts, (uv.getY(j) * dims[f][1]) / ts);
      }
    return g;
  };

  IR.disposeTree = (obj) => {
    obj.traverse((o) => {
      if (o.geometry && o.geometry.userData.own) o.geometry.dispose();
    });
    if (obj.parent) obj.parent.remove(obj);
  };

  /* simple persistent save */
  IR.store = {
    get(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
})();
