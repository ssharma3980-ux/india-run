/* Real rigged 3D runners — Microsoft Rocketbox avatars (MIT licence) with motion-capture clips.
   Characters, textures and mocap © 2020 Microsoft, MIT licence (assets/characters/ROCKETBOX_LICENSE.md). */
(function () {
  const PI = Math.PI;
  IR.CHARS = [
    { id: 'arjun', model: 'Male_Adult_10', code: 'm024', sex: 'm', price: 0, name: { en: 'Arjun', hi: 'अर्जुन', gu: 'અર્જુન' }, from: { en: 'Delhi', hi: 'दिल्ली', gu: 'દિલ્હી' },
      outfits: [{ name: { en: 'Saffron Scarf', hi: 'केसरिया दुपट्टा', gu: 'કેસરી દુપટ્ટો' }, scarf: '#ff7410', top: '#8c1f2c', bottom: '#2a2a2e' }, { name: { en: 'Tricolour Scarf', hi: 'तिरंगा दुपट्टा', gu: 'તિરંગો દુપટ્ટો' }, scarf: '#138808', top: '#8c1f2c', bottom: '#2a2a2e', stripes: ['#ff9933', '#ffffff', '#138808'] }] },
    { id: 'meera', model: 'Female_Adult_03', code: 'f003', sex: 'f', price: 0, name: { en: 'Meera', hi: 'मीरा', gu: 'મીરા' }, from: { en: 'Jaipur', hi: 'जयपुर', gu: 'જયપુર' },
      outfits: [{ name: { en: 'Pink Dupatta', hi: 'गुलाबी दुपट्टा', gu: 'ગુલાબી દુપટ્ટો' }, scarf: '#e0337a', top: '#7a2a8a', bottom: '#222' }, { name: { en: 'Marigold Dupatta', hi: 'गेंदा दुपट्टा', gu: 'ગલગોટા દુપટ્ટો' }, scarf: '#ffb300', top: '#7a2a8a', bottom: '#222' }] },
    { id: 'kabir', model: 'Male_Adult_15', code: 'm204', sex: 'm', price: 0, name: { en: 'Kabir', hi: 'कबीर', gu: 'કબીર' }, from: { en: 'Varanasi', hi: 'वाराणसी', gu: 'વારાણસી' },
      outfits: [{ name: { en: 'Ganga Kurta', hi: 'गंगा कुर्ता', gu: 'ગંગા કુર્તા' }, scarf: '#ff8f1f', top: '#f2f0ea', bottom: '#f2f0ea' }, { name: { en: 'Green Angavastram', hi: 'हरा अंगवस्त्र', gu: 'લીલું અંગવસ્ત્ર' }, scarf: '#1e8a4a', top: '#f2f0ea', bottom: '#f2f0ea' }] },
    { id: 'zoya', model: 'Female_Adult_12', code: 'f012', sex: 'f', price: 0, name: { en: 'Zoya', hi: 'ज़ोया', gu: 'ઝોયા' }, from: { en: 'Mumbai', hi: 'मुंबई', gu: 'મુંબઈ' },
      outfits: [{ name: { en: 'Monsoon Red', hi: 'मानसून लाल', gu: 'ચોમાસું લાલ' }, scarf: '#e53935', top: '#333', bottom: '#2f4f8a' }, { name: { en: 'Sea Blue', hi: 'समुद्री नीला', gu: 'દરિયાઈ વાદળી' }, scarf: '#26a6da', top: '#333', bottom: '#2f4f8a' }] },
    { id: 'rohan', model: 'Male_Adult_04', code: 'm006', sex: 'm', price: 0, name: { en: 'Rohan', hi: 'रोहन', gu: 'રોહન' }, from: { en: 'Bengaluru', hi: 'बेंगलुरु', gu: 'બેંગલુરુ' },
      outfits: [{ name: { en: 'Tech Hoodie', hi: 'टेक हूडी', gu: 'ટેક હૂડી' }, scarf: '#f2b31c', top: '#222', bottom: '#5a4a2a' }, { name: { en: 'Kerala Mundu Scarf', hi: 'केरल गमछा', gu: 'કેરળ ગમછો' }, scarf: '#f4efe4', top: '#222', bottom: '#5a4a2a', stripes: ['#f4efe4', '#d4a017', '#f4efe4'] }] },
    { id: 'ayesha', model: 'Female_Adult_06', code: 'f202', sex: 'f', price: 0, name: { en: 'Ayesha', hi: 'आयशा', gu: 'આયશા' }, from: { en: 'Hyderabad', hi: 'हैदराबाद', gu: 'હૈદરાબાદ' },
      outfits: [{ name: { en: 'Emerald Dupatta', hi: 'पन्ना दुपट्टा', gu: 'પન્ના દુપટ્ટો' }, scarf: '#0f8a5a', top: '#7a7a3a', bottom: '#7a7a3a' }, { name: { en: 'Pearl Dupatta', hi: 'मोती दुपट्टा', gu: 'મોતી દુપટ્ટો' }, scarf: '#f0e6f0', top: '#7a7a3a', bottom: '#7a7a3a' }] },
    { id: 'sheru', animal: true, model: 'Dog_GermanShepard_01', prefix: 'dog_', tex: [['', 'shepherd_dog', 'bump']], scale: 0.011, height: 0.95, gait: { amp: 0.75, freq: 2.6, spine: 0.16 }, price: 0, name: { en: 'Sheru the Dog', hi: 'शेरू कुत्ता', gu: 'શેરુ કૂતરો' }, from: { en: 'Delhi', hi: 'दिल्ली', gu: 'દિલ્હી' },
      outfits: [{ name: { en: 'Marigold Garland', hi: 'गेंदे की माला', gu: 'ગલગોટાની માળા' }, scarf: '#ff8a10', top: '#8a6a4a', bottom: '#2a1a10' }, { name: { en: 'Red Bandana', hi: 'लाल रुमाल', gu: 'લાલ રૂમાલ' }, scarf: '#d32f2f', top: '#8a6a4a', bottom: '#2a1a10' }] },
    { id: 'badal', animal: true, model: 'Horse_Brown_Saddle_01', prefix: 'horse_', tex: [['reins', 'horse_reins', 'bump'], ['', 'horse_brown_saddle', 'bump']], scale: 0.0085, height: 1.75, gait: { amp: 0.62, freq: 2.0, spine: 0.08 }, price: 0, name: { en: 'Badal the Horse', hi: 'बादल घोड़ा', gu: 'બાદલ ઘોડો' }, from: { en: 'Udaipur', hi: 'उदयपुर', gu: 'ઉદયપુર' },
      outfits: [{ name: { en: 'Marigold Garland', hi: 'गेंदे की माला', gu: 'ગલગોટાની માળા' }, scarf: '#ff8a10', top: '#6a3a1a', bottom: '#2a1a10' }, { name: { en: 'Royal Rose Garland', hi: 'गुलाब माला', gu: 'ગુલાબ માળા' }, scarf: '#e0245a', top: '#6a3a1a', bottom: '#2a1a10' }] },
    { id: 'hiran', animal: true, model: 'Deer_Roe_Tabby_01', prefix: 'roe_deer_', tex: [['', 'roe_deer_tabby', 'bump']], scale: 0.012, height: 1.1, gait: { amp: 0.8, freq: 2.4, spine: 0.14 }, price: 0, name: { en: 'Hiran the Deer', hi: 'हिरन', gu: 'હરણ' }, from: { en: 'Kashmir', hi: 'कश्मीर', gu: 'કાશ્મીર' },
      outfits: [{ name: { en: 'Flower Crown', hi: 'फूलों का हार', gu: 'ફૂલોનો હાર' }, scarf: '#ffc21a', top: '#9a6a3a', bottom: '#2a1a10' }, { name: { en: 'Blue Bells', hi: 'नीली घंटियाँ', gu: 'વાદળી ઘંટડી' }, scarf: '#2a7ad8', top: '#9a6a3a', bottom: '#2a1a10' }] },
    { id: 'raju', animal: true, model: 'Camel_OneHump_01', prefix: 'dromedar_', tex: [['', 'dromedar', 'normal']], scale: 0.008, height: 1.72, gait: { amp: 0.55, freq: 1.7, spine: 0.06 }, price: 0, name: { en: 'Raju the Camel', hi: 'राजू ऊँट', gu: 'રાજુ ઊંટ' }, from: { en: 'Jaipur', hi: 'जयपुर', gu: 'જયપુર' },
      outfits: [{ name: { en: 'Rajasthani Tassels', hi: 'राजस्थानी फुंदने', gu: 'રાજસ્થાની ફૂમતાં' }, scarf: '#e53935', top: '#c9a06a', bottom: '#2a1a10' }, { name: { en: 'Mirror-work Saddle', hi: 'शीशा काठी', gu: 'આભલા કાઠી' }, scarf: '#7b2fa0', top: '#c9a06a', bottom: '#2a1a10' }] },
  ];

  /* asset access: embedded base64 (single-file build) or relative files (dev) */
  const blobCache = {};
  IR.assetURL = (p) => {
    if (blobCache[p]) return blobCache[p];
    if (IR.ASSETS && IR.ASSETS[p]) {
      if (!blobCache[p]) {
        const bin = atob(IR.ASSETS[p]), u8 = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        const type = p.endsWith('.jpg') ? 'image/jpeg' : p.endsWith('.png') ? 'image/png' : p.endsWith('.json') ? 'application/json' : 'application/octet-stream';
        blobCache[p] = URL.createObjectURL(new Blob([u8], { type }));
        delete IR.ASSETS[p];
      }
      return blobCache[p];
    }
    return 'assets/' + p + (IR.FBXEXT && p.endsWith('.fbx') ? IR.FBXEXT : '');
  };

  const Lib = (IR.Avatars = { models: {}, clips: {}, ready: false });
  Lib.load = async (onProgress) => {
    const clipNames = ['m_run', 'f_run', 'm_idle', 'f_idle', 'm_crouch', 'f_crouch', 'm_cheer', 'f_cheer'];
    let done = 0; const total = clipNames.length + 1;
    const tick = () => onProgress && onProgress(++done / total);
    await Promise.all(clipNames.map(async (n) => {
      const j = await (await fetch(IR.assetURL('anims/' + n + '.json'))).json();
      const clip = THREE.AnimationClip.parse(j);
      for (const t of clip.tracks) if (t.name === 'Bip01.position') for (let i = 0; i < t.values.length; i += 3) { t.values[i] = 0; t.values[i + 2] = 0; }
      Lib.clips[n] = clip; tick();
    }));
    const tl = new THREE.TextureLoader();
    const tex = (p, srgb) => { const t = tl.load(IR.assetURL(p)); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
    const inflight = {};
    const loadChar = (c) => inflight[c.id] || (inflight[c.id] = loadCharRaw(c));
    const loadCharRaw = async (c) => {
      if (Lib.models[c.id]) return;
      try {
        const url = IR.assetURL(`characters/${c.model}/${c.model}.fbx`);
        const obj = await new Promise((res, rej) => new THREE.FBXLoader().load(url, res, undefined, rej));
        obj.animations = [];
        if (c.animal) {
          obj.traverse((m) => {
            if (!m.isMesh) return;
            m.material = [].concat(m.material).map((mm) => {
              const t = c.tex.find(([k]) => !k || mm.name.includes(k)), base = `characters/${c.model}/${t[1]}_`;
              const mat = new THREE.MeshPhysicalMaterial({ map: tex(base + 'color.jpg', true), roughness: 0.78, sheen: 0.6, sheenRoughness: 0.5, sheenColor: new THREE.Color('#fff4e0') });
              if (t[2] === 'normal') mat.normalMap = tex(base + 'normal.jpg'); else { mat.bumpMap = tex(base + 'bump.jpg'); mat.bumpScale = 3; }
              return mat;
            });
            if (m.material.length === 1) m.material = m.material[0];
            m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false;
          });
          obj.scale.setScalar(c.scale);
          Lib.models[c.id] = obj; return;
        }
        obj.traverse((m) => {
          if (!m.isMesh) return;
          m.material = [].concat(m.material).map((mm) => {
            const part = /head/.test(mm.name) ? 'head' : /body/.test(mm.name) ? 'body' : 'opacity';
            const base = `characters/${c.model}/${c.code}_${part}_`;
            if (part === 'opacity') return new THREE.MeshStandardMaterial({ map: tex(base + 'color.png', true), alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6 });
            return new THREE.MeshPhysicalMaterial({ map: tex(base + 'color.jpg', true), normalMap: tex(base + 'normal.jpg'), roughness: part === 'head' ? 0.48 : 0.7, sheen: part === 'body' ? 0.35 : 0.15, sheenRoughness: 0.6, sheenColor: new THREE.Color(part === 'head' ? '#ffd0b0' : '#ffffff') });
          });
          if (m.material.length === 1) m.material = m.material[0];
          m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false;
        });
        obj.scale.setScalar(0.01);
        Lib.models[c.id] = obj;
      } catch (e) { console.warn('avatar failed', c.id, e); }
    };
    Lib.loadChar = loadChar;
    // only the chosen runner is loaded before the menu appears; the rest load quietly afterwards
    const first = IR.CHARS.find((c) => c.id === (IR.progress.data && IR.progress.data.char)) || IR.CHARS[0];
    await loadChar(first); tick();
    Lib.ready = Object.keys(Lib.models).length > 0;
    Lib.rest = (async () => {
      for (const c of IR.CHARS) {
        if (Lib.models[c.id]) continue;
        // never parse a model while a run is on screen
        while (window.game && game.state !== 'menu' && game.state !== 'select' && game.state !== 'over' && game.state !== 'loading') await new Promise((r) => setTimeout(r, 1500));
        await new Promise((r) => setTimeout(r, 120));
        await loadChar(c);
        IR.ui && IR.ui.onAvatarLoaded && IR.ui.onAvatarLoaded(c.id);
      }
    })();
  };
  Lib.ensure = async (id) => {
    if (Lib.models[id]) return true;
    const c = IR.CHARS.find((x) => x.id === id); if (!c || !Lib.loadChar) return false;
    await Lib.loadChar(c); IR.ui && IR.ui.onAvatarLoaded && IR.ui.onAvatarLoaded(id); return !!Lib.models[id];
  };

  function scarfTexture(o) {
    const c = IR.tex.cv(128, 256), x = c.getContext('2d');
    if (o.stripes) o.stripes.forEach((s, i) => { x.fillStyle = s; x.fillRect((i * 128) / 3, 0, 128 / 3 + 1, 256); });
    else { x.fillStyle = o.scarf; x.fillRect(0, 0, 128, 256); }
    x.fillStyle = 'rgba(255,215,90,.85)'; x.fillRect(0, 232, 128, 10); x.fillRect(0, 246, 128, 4);
    for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(255,230,150,.35)'; x.beginPath(); x.arc(Math.random() * 128, Math.random() * 220, 2, 0, 7); x.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  function addFX(self) {
      // contact shadow
      const sc = IR.tex.cv(64), sx = sc.getContext('2d'), g = sx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); sx.fillStyle = g; sx.fillRect(0, 0, 64, 64);
      self.blob = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
      self.blob.rotation.x = -PI / 2; self.blob.renderOrder = 1; self.root.add(self.blob);

      // power-up visuals (shared with old runner)
      self.shield = new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 20), new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { t: { value: 0 }, col: { value: new THREE.Color('#5ab4ff') } },
        vertexShader: 'varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); vP = position; gl_Position = projectionMatrix*mv; }',
        fragmentShader: 'uniform float t; uniform vec3 col; varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ float f = pow(1.-abs(dot(vN,vV)), 2.2); float h = .5+.5*sin(vP.y*18.-t*6.); gl_FragColor = vec4(col*(f*1.6+h*.08), f*.9+.05); }',
      }));
      self.shield.position.y = 0.95; self.shield.visible = false; self.root.add(self.shield);
      self.magnetRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.025, 6, 40), new THREE.MeshBasicMaterial({ color: '#ff4a4a', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }));
      self.magnetRing.rotation.x = PI / 2; self.magnetRing.position.y = 0.9; self.magnetRing.visible = false; self.root.add(self.magnetRing);
      self.kite = new THREE.Group();
      const kg = new THREE.BufferGeometry();
      kg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0.9, 0, -0.85, 0, 0, 0, -1.1, 0, 0, 0.9, 0, 0, -1.1, 0, 0.85, 0, 0], 3));
      kg.setAttribute('color', new THREE.Float32BufferAttribute([1, 0.3, 0.1, 1, 0.8, 0.1, 1, 0.3, 0.1, 0.1, 0.7, 0.6, 1, 0.3, 0.1, 0.9, 0.1, 0.4], 3));
      kg.computeVertexNormals();
      const kite = new THREE.Mesh(kg, new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.6 }));
      kite.rotation.x = -1.1; kite.scale.setScalar(1.4); self.kite.add(kite);
      self.kite.position.set(0, 2.9, 0.2); self.kite.visible = false; self.root.add(self.kite);
  }

  class AvatarRunner {
    constructor(def, outfitIdx = 0) {
      this.def = def;
      const o = def.outfits[outfitIdx] || def.outfits[0];
      this.root = new THREE.Group();
      this.body = new THREE.Group(); this.root.add(this.body);
      this.model = THREE.SkeletonUtils.clone(Lib.models[def.id]);
      this.model.rotation.y = PI;
      this.body.add(this.model);
      this.model.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.frustumCulled = false; } });
      this.bones = {};
      this.model.traverse((b) => { if (b.isBone) this.bones[b.name] = b; });
      this.mixer = new THREE.AnimationMixer(this.model);
      const s = def.sex;
      this.actions = {};
      for (const k of ['run', 'idle', 'crouch', 'cheer']) {
        const a = this.mixer.clipAction(Lib.clips[s + '_' + k]);
        a.enabled = true; a.setEffectiveWeight(0); a.play();
        this.actions[k] = a;
      }
      this.actions.crouch.timeScale = 0.6;
      this.cur = null; this.setAction('idle', 0);

      // flowing scarf / dupatta (cloth chain driven by neck bone)
      const scarfM = new THREE.MeshPhysicalMaterial({ map: scarfTexture(o), roughness: 0.75, sheen: 1, sheenColor: new THREE.Color('#fff2d8'), sheenRoughness: 0.5, side: THREE.DoubleSide });
      this.scarf = new THREE.Group(); this.root.add(this.scarf);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.03, 8, 20), scarfM);
      ring.rotation.x = PI / 2 - 0.25; ring.scale.set(1.1, 1, 0.9); this.scarf.add(ring);
      this.chain = []; let p = new THREE.Group(); p.position.set(-0.04, -0.02, 0.08); this.scarf.add(p);
      const seg = new THREE.PlaneGeometry(0.15, 0.12); seg.translate(0, -0.06, 0);
      for (let i = 0; i < 8; i++) {
        const geo = seg.clone(); const uv = geo.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setY(k, 1 - (i + 1 - uv.getY(k)) / 8);
        const m = new THREE.Mesh(geo, scarfM); m.castShadow = true; m.scale.x = 1 - i * 0.04; p.add(m);
        this.chain.push(p); const n = new THREE.Group(); n.position.y = -0.115; p.add(n); p = n;
      }
      addFX(this);
      this.t = 0; this.state = 'idle'; this.pitch = 0; this.drop = 0; this.stepPhase = 0;
      this._v = new THREE.Vector3(); this._m = new THREE.Matrix4();
    }
    setAction(name, fade = 0.18) {
      if (this.cur === name) return;
      const next = this.actions[name], prev = this.cur && this.actions[this.cur];
      next.reset(); next.setEffectiveWeight(1);
      if (prev && fade > 0) next.crossFadeFrom(prev, fade, false); else { for (const k in this.actions) if (k !== name) this.actions[k].setEffectiveWeight(0); }
      next.play();
      this.cur = name;
    }
    update(dt, st) {
      this.t += dt;
      const state = st.state || 'idle', speed = st.speed || 0;
      const map = { run: 'run', jump: 'crouch', slide: 'crouch', glide: 'cheer', crash: 'idle', show: 'cheer', idle: 'idle' };
      this.setAction(map[state] || 'idle', state === 'jump' ? 0.12 : 0.2);
      if (state === 'run') this.actions.run.timeScale = IR.clamp(0.85 + speed * 0.025, 0.95, 1.45);
      this.actions.crouch.timeScale = state === 'jump' ? 0.2 : 0.6;
      this.mixer.update(dt);
      // footsteps from run cycle (0.6 s clip, two steps)
      if (state === 'run') {
        const ph = (this.actions.run.time / this.actions.run.getClip().duration) * 2;
        if (Math.floor(ph) !== Math.floor(this.stepPhase) && st.onStep) st.onStep();
        this.stepPhase = ph;
      }
      // whole-body poses layered on top of mocap
      const tp = state === 'slide' ? -0.62 : state === 'crash' ? -1.45 : state === 'jump' ? 0.12 : state === 'run' ? 0.06 : 0;
      const td = state === 'slide' ? -0.28 : state === 'jump' ? 0.12 : 0;
      this.pitch = IR.damp(this.pitch, tp, state === 'crash' ? 5 : 12, dt);
      this.drop = IR.damp(this.drop, td, 12, dt);
      this.body.rotation.x = this.pitch;
      this.body.position.y = this.drop;
      this.body.rotation.z = IR.damp(this.body.rotation.z, st.lean || 0, 8, dt);
      // scarf follows the neck bone
      const neck = this.bones.Bip01_Neck || this.bones.Bip01_Head;
      if (neck) {
        this.root.updateMatrixWorld(true);
        neck.getWorldPosition(this._v); this.root.worldToLocal(this._v);
        this.scarf.position.copy(this._v); this.scarf.position.y -= 0.02;
        this.scarf.rotation.x = this.body.rotation.x * 0.8;
      }
      const moving = state !== 'idle' && state !== 'show' && state !== 'crash';
      this.chain.forEach((sg, i) => {
        const base = i === 0 ? (moving ? -1.25 : -0.12) : (moving ? -0.06 : 0);
        sg.rotation.x = IR.damp(sg.rotation.x, base + Math.sin(this.t * (moving ? 13 : 2) - i * 0.9) * (moving ? 0.3 : 0.06) * (0.4 + i * 0.12), 10, dt);
        sg.rotation.z = Math.sin(this.t * 5 - i * 0.6) * (moving ? 0.08 : 0.02);
      });
      this.blob.position.y = 0.02 - (st.y || 0); const h = Math.max(0.3, 1 - (st.y || 0) * 0.25); this.blob.scale.setScalar(h); this.blob.material.opacity = h;
      this.shield.visible = !!st.shield; this.shield.material.uniforms.t.value = this.t;
      this.magnetRing.visible = !!st.magnet; this.magnetRing.rotation.z += dt * 4;
      this.kite.visible = state === 'glide'; this.kite.rotation.z = Math.sin(this.t * 2) * 0.1;
    }
  }

  /* Quadruped runners: rigged Rocketbox animals with a procedural gallop */
  class AnimalRunner {
    constructor(def, outfitIdx = 0) {
      this.def = def;
      const o = def.outfits[outfitIdx] || def.outfits[0];
      this.root = new THREE.Group(); this.body = new THREE.Group(); this.root.add(this.body);
      this.model = THREE.SkeletonUtils.clone(Lib.models[def.id]);
      this.model.rotation.y = PI; this.body.add(this.model);
      this.model.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.frustumCulled = false; } });
      const P = def.prefix, B = (n) => this.model.getObjectByName(P + n);
      this.j = {};
      for (const n of ['L_UpperArm', 'R_UpperArm', 'L_Forearm', 'R_Forearm', 'L_Hand', 'R_Hand', 'L_Thigh', 'R_Thigh', 'L_Calf', 'R_Calf', 'L_Foot', 'R_Foot', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Neck1', 'Head', 'Tail', 'Tail1', 'Tail2', 'Ear_L', 'Ear_R']) {
        const b = B(n); if (b) this.j[n] = { b, q0: b.quaternion.clone() };
      }
      // garland around the neck
      const neck = this.j.Neck1 || this.j.Neck;
      this.neckBone = neck && neck.b;
      this.garland = new THREE.Group(); this.root.add(this.garland);
      const gm = [new THREE.MeshStandardMaterial({ color: o.scarf, roughness: 0.55, emissive: new THREE.Color(o.scarf).multiplyScalar(0.15) }), new THREE.MeshStandardMaterial({ color: '#ffc21a', roughness: 0.55 })];
      const ico = new THREE.IcosahedronGeometry(0.045, 1), R = 0.16 * (def.scale / 0.01);
      for (let i = 0; i < 26; i++) { const a = (i / 26) * PI * 2, m = new THREE.Mesh(ico, gm[i % 3 === 0 ? 1 : 0]); m.position.set(Math.cos(a) * R, Math.sin(a) * R * 0.25 - Math.abs(Math.sin(a / 2)) * 0.05, Math.sin(a) * R * 0.9); m.castShadow = true; this.garland.add(m); }
      addFX(this);
      this.height = def.height || 1.2;
      this.shield.scale.setScalar(Math.max(1, this.height * 0.75)); this.shield.position.y = this.height * 0.55;
      this.kite.position.y = this.height + 1.4;
      this.t = 0; this.ph = 0; this.pitch = 0; this.drop = 0; this.roll = 0; this.k = {};
      this._v = new THREE.Vector3(); this._q = new THREE.Quaternion(); this._ax = new THREE.Vector3(0, 0, 1);
    }
    set(name, ang, axis) {
      const j = this.j[name]; if (!j) return;
      this.k[name] = IR.damp(this.k[name] || 0, ang, 18, this._dt);
      j.b.quaternion.copy(j.q0).multiply(this._q.setFromAxisAngle(axis || this._ax, this.k[name]));
    }
    update(dt, st) {
      this.t += dt; this._dt = dt;
      const state = st.state || 'idle', speed = st.speed || 0, g = this.def.gait;
      const moving = state === 'run' || state === 'glide';
      if (moving) this.ph += dt * PI * 2 * g.freq * IR.clamp(0.75 + speed * 0.025, 0.85, 1.45);
      else this.ph += dt * PI * 2 * 0.4;
      const ph = this.ph, A = g.amp, s = Math.sin, c = Math.cos;
      let fl, fr, hl, hr, fe, he, sp = 0, nk = 0, tl = 0, bob = 0;
      if (moving) {
        // rotary gallop: front pair then hind pair, slight left/right offset
        fl = A * s(ph); fr = A * s(ph + 0.45); hl = -A * s(ph + PI * 0.9); hr = -A * s(ph + PI * 0.9 + 0.45);
        fe = 0.9; he = 0.8;
        sp = g.spine * s(ph + PI * 0.5); nk = 0.12 * s(ph + 0.6); tl = 0.25 * s(ph * 2); bob = 0.06 * Math.abs(s(ph)) * this.height;
        if (st.onStep && Math.floor(this.lastPh / PI) !== Math.floor(ph / PI)) st.onStep();
      } else if (state === 'jump') { fl = fr = A * 1.1; hl = hr = -A * 1.1; fe = he = 0.1; sp = -0.12; nk = -0.15; tl = 0.3; }
      else if (state === 'slide') { fl = fr = A * 0.9; hl = hr = A * 0.6; fe = 1.6; he = 1.4; sp = 0.05; nk = 0.25; }
      else if (state === 'crash') { fl = fr = 0.5; hl = hr = -0.4; fe = he = 0.6; nk = 0.3; }
      else { fl = fr = hl = hr = 0; fe = he = 0; nk = 0.06 * s(this.t * 0.8); tl = 0.35 * s(this.t * 3.5); sp = 0.02 * s(this.t * 1.5); }
      this.lastPh = ph;
      const fbend = (x) => -Math.max(0, x) * 1.2;
      this.set('L_UpperArm', fl); this.set('R_UpperArm', fr);
      this.set('L_Forearm', moving ? fbend(c(ph)) * fe : -fe * 0.8); this.set('R_Forearm', moving ? fbend(c(ph + 0.45)) * fe : -fe * 0.8);
      this.set('L_Thigh', hl); this.set('R_Thigh', hr);
      this.set('L_Calf', moving ? Math.max(0, c(ph + PI * 0.9)) * he : he * 0.8); this.set('R_Calf', moving ? Math.max(0, c(ph + PI * 0.9 + 0.45)) * he : he * 0.8);
      this.set('Spine1', sp); this.set('Spine2', sp * 0.6); this.set('Neck', nk); this.set('Head', -nk * 0.6);
      this.set('Tail', tl, new THREE.Vector3(0, 1, 0)); this.set('Tail1', tl * 0.7, new THREE.Vector3(0, 1, 0));
      this.set('Ear_L', 0.15 * s(this.t * 6)); this.set('Ear_R', -0.15 * s(this.t * 6 + 1));
      const tp = state === 'jump' ? -0.18 : state === 'slide' ? 0.05 : moving ? 0.03 * s(ph * 2) : 0;
      const td = state === 'slide' ? -this.height * 0.28 : moving ? bob : 0;
      this.pitch = IR.damp(this.pitch, tp, 10, dt); this.drop = IR.damp(this.drop, td, 14, dt);
      this.roll = IR.damp(this.roll, state === 'crash' ? 1.4 : 0, 5, dt);
      this.body.rotation.set(this.pitch, 0, this.roll + (st.lean || 0) * 0.6);
      this.body.position.y = this.drop;
      if (this.neckBone) { this.root.updateMatrixWorld(true); this.neckBone.getWorldPosition(this._v); this.root.worldToLocal(this._v); this.garland.position.copy(this._v); this.garland.rotation.x = 0.5 + this.pitch; }
      this.blob.position.y = 0.02 - (st.y || 0); const h = Math.max(0.3, 1 - (st.y || 0) * 0.25); this.blob.scale.set(h, h * 1.8, h); this.blob.material.opacity = h;
      this.shield.visible = !!st.shield; this.shield.material.uniforms.t.value = this.t;
      this.magnetRing.visible = !!st.magnet; this.magnetRing.rotation.z += dt * 4;
      this.kite.visible = state === 'glide';
    }
  }
  IR.AvatarRunner = AvatarRunner;
  IR.AnimalRunner = AnimalRunner;
})();
