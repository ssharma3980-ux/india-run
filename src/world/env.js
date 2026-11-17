/* Atmosphere: physical sky + clouds, sun & shadows, reflective water, panorama, weather, birds */
(function () {
  const cloudVS = `varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position = p.xyww; }`;
  const cloudFS = `
  uniform vec3 sunCol; uniform vec3 sunDir; uniform float cover; uniform float time; uniform vec3 cloudCol; uniform vec3 shadeCol;
  varying vec3 vDir;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x), mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x), f.y); }
  float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<6;i++){ v+=a*noise(p); p=p*2.02+vec2(1.7,9.2); a*=.5; } return v; }
  void main(){
    vec3 d = normalize(vDir); float h = d.y;
    if (h < 0.0) discard;
    vec2 uv = d.xz/(h+.08)*0.9 + vec2(time*.004, time*.0015);
    float n = fbm(uv*1.15);
    float c = smoothstep(1.0-cover*0.62, 1.05-cover*0.35, n);
    float n2 = fbm(uv*1.15 + normalize(sunDir.xz)*0.06);
    float lit = clamp((n - n2)*6. + .55, 0., 1.);
    float s = max(dot(d, normalize(sunDir)), 0.);
    vec3 col = mix(shadeCol, cloudCol, lit) + sunCol*(pow(s, 8.)*.9 + pow(s,2.)*.15)*lit;
    float a = c * smoothstep(0., .18, h) * .92;
    gl_FragColor = vec4(col, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;

  class Env {
    constructor(renderer, scene) {
      this.r = renderer; this.scene = scene;
      this.pmrem = new THREE.PMREMGenerator(renderer);
      // physically based sky (Preetham)
      this.sky = new THREE.Sky(); this.sky.scale.setScalar(950); this.sky.frustumCulled = false; this.sky.renderOrder = -10;
      this.sky.material.depthWrite = false;
      scene.add(this.sky);
      this.envSky = new THREE.Sky(); this.envSky.scale.setScalar(450);
      this.skyScene = new THREE.Scene(); this.skyScene.add(this.envSky);
      for (const sk of [this.sky, this.envSky]) {
        sk.material.uniforms.skyExp = { value: 0.4 };
        sk.material.fragmentShader = sk.material.fragmentShader.replace('uniform vec3 up;', 'uniform vec3 up;\nuniform float skyExp;').replace('gl_FragColor = vec4( retColor, 1.0 );', 'gl_FragColor = vec4( retColor * skyExp, 1.0 );');
        sk.material.needsUpdate = true;
      }
      this.cu = { sunCol: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, cover: { value: 0.5 }, time: { value: 0 }, cloudCol: { value: new THREE.Color() }, shadeCol: { value: new THREE.Color() } };
      this.clouds = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.ShaderMaterial({ uniforms: this.cu, vertexShader: cloudVS, fragmentShader: cloudFS, side: THREE.BackSide, transparent: true, depthWrite: false, fog: false }));
      this.clouds.renderOrder = -8; this.clouds.frustumCulled = false; scene.add(this.clouds);

      this.hemi = new THREE.HemisphereLight('#fff', '#444', 1); scene.add(this.hemi);
      this.sun = new THREE.DirectionalLight('#fff', 3);
      this.sun.castShadow = true;
      const sc = this.sun.shadow.camera;
      sc.left = -24; sc.right = 24; sc.top = 24; sc.bottom = -24; sc.near = 1; sc.far = 160;
      this.sun.shadow.bias = -0.0005; this.sun.shadow.normalBias = 0.035; this.sun.shadow.radius = 3;
      scene.add(this.sun); scene.add(this.sun.target);
      scene.fog = new THREE.Fog('#fff', 40, 300);

      // lens flare on the sun
      const flareTex = (r, soft, col) => { const c = IR.tex.cv(128), x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, col); g.addColorStop(soft, col.replace(/[\d.]+\)$/, '0.25)')); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); };
      this.flareLight = new THREE.PointLight('#fff', 0, 1); scene.add(this.flareLight);
      try {
        this.flare = new THREE.Lensflare();
        this.flare.addElement(new THREE.LensflareElement(flareTex(0, 0.2, 'rgba(255,240,210,1)'), 420, 0));
        this.flare.addElement(new THREE.LensflareElement(flareTex(0, 0.5, 'rgba(255,190,120,.35)'), 70, 0.5));
        this.flare.addElement(new THREE.LensflareElement(flareTex(0, 0.6, 'rgba(255,150,90,.25)'), 110, 0.7));
        this.flare.addElement(new THREE.LensflareElement(flareTex(0, 0.4, 'rgba(160,200,255,.2)'), 60, 0.95));
        this.flareLight.add(this.flare);
      } catch (e) { this.flare = null; }

      // water: reflective (High) or PBR (Low/Medium)
      this.waterN = IR.tex.waterNormal(3);
      this.waterN2 = IR.tex.waterNormal(8);
      this.waterN.repeat.set(70, 70); this.waterN2.repeat.set(45, 45);
      this.waterPBR = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshPhysicalMaterial({
        color: '#4d6f73', roughness: 0.1, metalness: 0.0, normalMap: this.waterN, normalScale: new THREE.Vector2(0.55, 0.55),
        clearcoat: 1, clearcoatRoughness: 0.03, clearcoatNormalMap: this.waterN2, clearcoatNormalScale: new THREE.Vector2(0.35, 0.35), envMapIntensity: 1.3,
      }));
      this.waterPBR.rotation.x = -Math.PI / 2; this.waterPBR.receiveShadow = true;
      scene.add(this.waterPBR);
      this.water = this.waterPBR;
      // ground
      this.ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshStandardMaterial({ color: '#fff', roughness: 0.95 }));
      this.ground.rotation.x = -Math.PI / 2; this.ground.receiveShadow = true;
      scene.add(this.ground);
      this.groundTex = {};

      // panorama ring
      this.pano = new THREE.Mesh(new THREE.CylinderGeometry(620, 620, 380, 72, 1, true), new THREE.MeshBasicMaterial({ transparent: true, side: THREE.BackSide, fog: false, depthWrite: false }));
      this.pano.renderOrder = -7; this.pano.frustumCulled = false;
      scene.add(this.pano);
      this.panoCache = {};

      this.weather = null;
      this.birds = new THREE.Group();
      const bmat = new THREE.MeshBasicMaterial({ color: '#2a1d1a', side: THREE.DoubleSide, fog: false });
      const wg = new THREE.BufferGeometry();
      wg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, -1, 0, 0.35, -0.2, 0, -0.25], 3));
      for (let i = 0; i < 12; i++) {
        const b = new THREE.Group();
        const l = new THREE.Mesh(wg, bmat), r = new THREE.Mesh(wg, bmat); r.scale.x = -1;
        b.add(l, r); b.userData = { l, r, ph: Math.random() * 6, rad: 30 + Math.random() * 40, h: 35 + Math.random() * 25, sp: 0.15 + Math.random() * 0.1, off: Math.random() * 6 };
        b.scale.setScalar(1.4);
        this.birds.add(b);
      }
      scene.add(this.birds);
      // festival sky effects: fireworks (Diwali) and colour clouds (Holi)
      const FN = 900;
      this.fw = { n: FN, i: 0, pos: new Float32Array(FN * 3), col: new Float32Array(FN * 3), vel: new Float32Array(FN * 3), life: new Float32Array(FN), timer: 0 };
      const fg = new THREE.BufferGeometry();
      fg.setAttribute('position', new THREE.BufferAttribute(this.fw.pos, 3)); fg.setAttribute('color', new THREE.BufferAttribute(this.fw.col, 3));
      for (let k = 0; k < FN; k++) this.fw.pos[k * 3 + 1] = -999;
      this.fwPts = new THREE.Points(fg, new THREE.PointsMaterial({ size: 1.1, map: IR.M.glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      this.fwPts.frustumCulled = false; scene.add(this.fwPts);
      this.t = 0; this.theme = null;
      this.sunDir = new THREE.Vector3(0, 0.3, -1).normalize();
    }

    makeReflectiveWater() {
      if (this.waterRefl) return;
      const q = this.quality === 'high' ? 512 : 256;
      this.waterRefl = new THREE.Water(new THREE.PlaneGeometry(1400, 1400), {
        textureWidth: q, textureHeight: q, waterNormals: this.waterN2, sunDirection: this.sunDir.clone(), sunColor: 0xffffff, waterColor: 0x3d5f66, distortionScale: 2.2, fog: true, alpha: 1,
      });
      this.waterRefl.rotation.x = -Math.PI / 2;
      this.waterRefl.material.uniforms.size.value = 2.2;
      this.scene.add(this.waterRefl);
    }

    setQuality(q) {
      this.quality = q;
      this.sun.castShadow = q !== 'low';
      const s = q === 'high' ? 2048 : 1024;
      if (this.sun.shadow.mapSize.x !== s) {
        this.sun.shadow.mapSize.set(s, s);
        if (this.sun.shadow.map) { this.sun.shadow.map.dispose(); this.sun.shadow.map = null; }
      }
      if (q !== 'low') this.makeReflectiveWater();
      if (this.theme) this.apply(this.theme);
    }

    apply(th) {
      this.theme = th;
      const a = IR.festAtmos ? IR.festAtmos(th, this.festival) : th.atmos, ph = a.phys || { turb: 6, ray: 1.5, mie: 0.005, g: 0.8 };
      this.sunDir.set(...a.sunDir).normalize();
      for (const sky of [this.sky, this.envSky]) {
        const u = sky.material.uniforms;
        u.turbidity.value = ph.turb; u.rayleigh.value = ph.ray; u.mieCoefficient.value = ph.mie; u.mieDirectionalG.value = ph.g;
        u.sunPosition.value.copy(this.sunDir).multiplyScalar(400);
        u.up.value.set(0, 1, 0);
      }
      this.skyExp = a.skyExp || 0.4;
      this.sky.material.uniforms.skyExp.value = this.skyExp; this.envSky.material.uniforms.skyExp.value = this.skyExp * 1.1;
      const cu = this.cu;
      cu.sunCol.value.set(a.sun); cu.sunDir.value.copy(this.sunDir); cu.cover.value = a.cloud; cu.cloudCol.value.set(a.cloudCol || '#fff');
      cu.shadeCol.value.set(a.cloudCol || '#fff').lerp(new THREE.Color(a.top), 0.45).multiplyScalar(0.8);
      this.sun.color.set(a.sun); this.sun.intensity = a.sunI * 1.05;
      this.hemi.color.set(a.hemiSky); this.hemi.groundColor.set(a.hemiGround); this.hemi.intensity = a.hemiI * 0.85;
      this.scene.fog.color.set(a.fog); this.scene.fog.near = a.fogNear; this.scene.fog.far = a.fogFar * 1.15;
      this.r.toneMappingExposure = a.exposure;
      // image-based lighting from the physical sky
      if (this.envRT) this.envRT.dispose();
      const prevExp = this.r.toneMappingExposure;
      this.envRT = this.pmrem.fromScene(this.skyScene, 0, 0.1, 1000);
      this.r.toneMappingExposure = prevExp;
      this.scene.environment = this.envRT.texture;
      this.scene.environmentIntensity = 1;
      // floor
      const f = th.floor, refl = this.quality !== 'low' && this.waterRefl;
      this.water = refl ? this.waterRefl : this.waterPBR;
      this.waterPBR.visible = f.type === 'water' && !refl;
      if (this.waterRefl) this.waterRefl.visible = f.type === 'water' && !!refl;
      this.ground.visible = f.type === 'ground';
      if (f.type === 'water') {
        this.waterPBR.material.color.set(f.color); this.waterPBR.position.y = f.y;
        if (this.waterRefl) {
          const u = this.waterRefl.material.uniforms;
          this.waterRefl.position.y = f.y; u.waterColor.value.set(f.color).multiplyScalar(0.8); u.sunColor.value.set(a.sun); u.sunDirection.value.copy(this.sunDir);
          u.distortionScale.value = th.id === 'mumbai' ? 3.2 : 2.0;
        }
      } else {
        if (!this.groundTex[th.id]) { const t = IR.tex.ground(f.tex); t.repeat.set(140, 140); this.groundTex[th.id] = t; }
        this.ground.material.map = this.groundTex[th.id]; this.ground.material.needsUpdate = true;
        this.ground.position.y = f.y;
      }
      if (!this.panoCache[th.id]) this.panoCache[th.id] = IR.tex.panorama(th.pano.kind, th.pano.cols, th.pano.seed || 4);
      this.pano.material.map = this.panoCache[th.id]; this.pano.material.needsUpdate = true;
      this.pano.position.y = (f.y || 0) + 190 - 8;
      this.birds.visible = !!th.birds && !(IR.FESTIVALS && IR.FESTIVALS[this.festival] && IR.FESTIVALS[this.festival].night);
      if (this.flare) this.flare.visible = a.sunI > 2 && this.sunDir.y < 0.5;
      this.makeWeather(th);
    }

    makeWeather(th) {
      if (this.weather) { this.scene.remove(this.weather); this.weather.geometry.dispose(); this.weather = null; }
      const type = th.weather; if (!type) return;
      const q = this.quality || 'med';
      const mul = q === 'low' ? 0.4 : q === 'high' ? 1.4 : 1;
      if (type === 'rain') {
        const n = Math.floor(1600 * mul), pos = new Float32Array(n * 6);
        for (let i = 0; i < n; i++) { const x = (Math.random() - 0.5) * 60, y = Math.random() * 30, z = (Math.random() - 0.5) * 60; pos.set([x, y, z, x + 0.05, y - 0.9, z], i * 6); }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        this.weather = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#c8d8ea', transparent: true, opacity: 0.4, fog: false }));
        this.weather.userData = { type, n, speed: 32 };
      } else {
        const n = Math.floor((type === 'snow' ? 1800 : 420) * mul), pos = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) pos.set([(Math.random() - 0.5) * 60, Math.random() * 26, (Math.random() - 0.5) * 60], i * 3);
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const m = new THREE.PointsMaterial({
          size: type === 'snow' ? 0.14 : 0.1, map: IR.M.dotTex, transparent: true, depthWrite: false, color: th.weatherColor || '#fff',
          blending: type === 'snow' ? THREE.NormalBlending : THREE.AdditiveBlending, opacity: type === 'snow' ? 0.95 : 0.7,
        });
        this.weather = new THREE.Points(g, m);
        this.weather.userData = { type, n, speed: type === 'snow' ? 1.6 : 0.25 };
      }
      this.weather.frustumCulled = false;
      this.scene.add(this.weather);
    }

    update(dt, cam, focus) {
      this.t += dt;
      this.cu.time.value = this.t;
      this.sky.position.copy(cam.position); this.clouds.position.copy(cam.position);
      this.pano.position.x = cam.position.x; this.pano.position.z = cam.position.z;
      const tile = 1400 / 70, tile2 = 1400 / 45;
      this.waterPBR.position.x = cam.position.x; this.waterPBR.position.z = cam.position.z;
      this.waterN.offset.set(cam.position.x / tile + this.t * 0.012, -cam.position.z / tile + this.t * 0.02);
      this.waterN2.offset.set(cam.position.x / tile2 - this.t * 0.018, -cam.position.z / tile2 + this.t * 0.01);
      if (this.waterRefl && this.waterRefl.visible) {
        this.waterRefl.position.x = cam.position.x; this.waterRefl.position.z = cam.position.z;
        this.waterRefl.material.uniforms.time.value = this.t * 0.6;
      }
      this.ground.position.x = cam.position.x; this.ground.position.z = cam.position.z;
      const gt = this.ground.material.map;
      if (gt) gt.offset.set(cam.position.x / 10, -cam.position.z / 10);
      this.sun.position.copy(focus).addScaledVector(this.sunDir, 80);
      this.sun.position.y = Math.max(this.sun.position.y, focus.y + 25);
      this.sun.target.position.copy(focus);
      this.flareLight.position.copy(cam.position).addScaledVector(this.sunDir, 800);
      const w = this.weather;
      if (w) {
        const p = w.geometry.attributes.position, a = p.array, ud = w.userData;
        const cx = cam.position.x, cy = cam.position.y, cz = cam.position.z;
        if (ud.type === 'rain') {
          for (let i = 0; i < ud.n; i++) {
            const o = i * 6; a[o + 1] -= ud.speed * dt; a[o + 4] -= ud.speed * dt;
            if (a[o + 1] < cy - 6) { const nx = cx + (Math.random() - 0.5) * 60, nz = cz + (Math.random() - 0.5) * 60, ny = cy + 18 + Math.random() * 10; a[o] = nx; a[o + 1] = ny; a[o + 2] = nz; a[o + 3] = nx + 0.05; a[o + 4] = ny - 0.9; a[o + 5] = nz; }
          }
        } else {
          for (let i = 0; i < ud.n; i++) {
            const o = i * 3;
            a[o + 1] -= ud.speed * dt * (0.6 + (i % 7) * 0.08);
            a[o] += Math.sin(this.t * 0.8 + i) * dt * 0.5;
            if (a[o + 1] < cy - 5 || Math.abs(a[o] - cx) > 32 || Math.abs(a[o + 2] - cz) > 32) {
              a[o] = cx + (Math.random() - 0.5) * 60; a[o + 2] = cz + (Math.random() - 0.5) * 60; a[o + 1] = ud.type === 'snow' ? cy + 14 + Math.random() * 8 : cy - 3 + Math.random() * 14;
            }
          }
        }
        p.needsUpdate = true;
      }
      const fest = IR.FESTIVALS && IR.FESTIVALS[this.festival], fw = this.fw;
      if (fest && (fest.fireworks || fest.puffs || this.festival === 'navratri')) {
        fw.timer -= dt;
        if (fw.timer <= 0) {
          fw.timer = fest.puffs ? 0.5 : 0.7 + Math.random() * 0.9;
          const fx = -Math.sin(this.camYaw || 0), fz = -Math.cos(this.camYaw || 0);
          const dist = fest.puffs ? 14 + Math.random() * 20 : 70 + Math.random() * 60, side = (Math.random() - 0.5) * (fest.puffs ? 14 : 90);
          const cx = cam.position.x + fx * dist - fz * side, cz = cam.position.z + fz * dist + fx * side, cy = fest.puffs ? 1 + Math.random() * 2 : 35 + Math.random() * 30;
          const c = new THREE.Color(IR.pick(Math.random, ['#ff3d7f', '#ffd400', '#00e0ff', '#7cff4a', '#ff7a00', '#c86bff', '#ffffff']));
          const cnt = fest.puffs ? 40 : 90, spd = fest.puffs ? 3 : 16;
          for (let k = 0; k < cnt; k++) {
            const i = fw.i++ % fw.n, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), v = spd * (0.6 + Math.random() * 0.4);
            fw.pos.set([cx, cy, cz], i * 3); fw.col.set([c.r, c.g, c.b], i * 3);
            fw.vel.set([Math.sin(ph) * Math.cos(th) * v, Math.cos(ph) * v * (fest.puffs ? 0.4 : 1) + (fest.puffs ? 1.5 : 0), Math.sin(ph) * Math.sin(th) * v], i * 3);
            fw.life[i] = fest.puffs ? 1.6 + Math.random() : 1.4 + Math.random() * 0.8;
          }
          if (!fest.puffs && IR.audio && IR.audio.play) IR.audio.play('firework');
        }
        this.fwPts.material.size = fest.puffs ? 2.2 : 1.1;
      }
      for (let i = 0; i < fw.n; i++) {
        if (fw.life[i] <= 0) continue;
        fw.life[i] -= dt;
        if (fw.life[i] <= 0) { fw.pos[i * 3 + 1] = -999; continue; }
        fw.vel[i * 3 + 1] -= (fest && fest.puffs ? 0.6 : 7) * dt;
        for (let a = 0; a < 3; a++) { fw.vel[i * 3 + a] *= 1 - 1.2 * dt; fw.pos[i * 3 + a] += fw.vel[i * 3 + a] * dt; }
        if (fw.life[i] < 0.5) for (let a = 0; a < 3; a++) fw.col[i * 3 + a] *= 0.93;
      }
      this.fwPts.geometry.attributes.position.needsUpdate = true; this.fwPts.geometry.attributes.color.needsUpdate = true;
      if (this.birds.visible) {
        for (const b of this.birds.children) {
          const u = b.userData, t = this.t * u.sp + u.off;
          b.position.set(focus.x + Math.cos(t) * u.rad + 30, u.h + Math.sin(t * 2) * 3, focus.z + Math.sin(t) * u.rad - 90);
          b.rotation.y = -t;
          const f = Math.sin(this.t * 9 + u.ph) * 0.6;
          u.l.rotation.z = f; u.r.rotation.z = -f;
        }
      }
    }
  }
  IR.Env = Env;
})();
