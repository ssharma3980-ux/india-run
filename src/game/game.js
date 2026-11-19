/* Core gameplay: runner controller, turns, collisions, camera, power-ups */
(function () {
  const PI = Math.PI, LANES = () => IR.LANES;
  const GRAV = 36, JUMP_V = 12.4;

  class Particles {
    constructor(scene, n = 260) {
      this.n = n; this.i = 0;
      this.pos = new Float32Array(n * 3); this.col = new Float32Array(n * 3); this.vel = new Float32Array(n * 3); this.life = new Float32Array(n);
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
      this.pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.17, map: IR.M.glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      this.pts.frustumCulled = false; scene.add(this.pts);
      for (let k = 0; k < n; k++) this.pos[k * 3 + 1] = -999;
    }
    burst(p, col, count, spd, up = 2, grav = 6) {
      const c = new THREE.Color(col);
      for (let k = 0; k < count; k++) {
        const i = this.i++ % this.n;
        this.pos.set([p.x, p.y, p.z], i * 3); this.col.set([c.r, c.g, c.b], i * 3);
        this.vel.set([(Math.random() - 0.5) * spd, Math.random() * up, (Math.random() - 0.5) * spd], i * 3);
        this.life[i] = 0.5 + Math.random() * 0.4; this.grav = grav;
      }
    }
    update(dt) {
      for (let i = 0; i < this.n; i++) {
        if (this.life[i] <= 0) continue;
        this.life[i] -= dt;
        if (this.life[i] <= 0) { this.pos[i * 3 + 1] = -999; continue; }
        this.vel[i * 3 + 1] -= (this.grav || 6) * dt;
        for (let a = 0; a < 3; a++) this.pos[i * 3 + a] += this.vel[i * 3 + a] * dt;
        const f = Math.min(1, this.life[i] * 2.5);
        this.col[i * 3] *= 0.995; this.col[i * 3 + 1] *= 0.995; this.col[i * 3 + 2] *= 0.995;
        if (f < 1) { this.col[i * 3] *= f; this.col[i * 3 + 1] *= f; this.col[i * 3 + 2] *= f; }
      }
      this.pts.geometry.attributes.position.needsUpdate = true; this.pts.geometry.attributes.color.needsUpdate = true;
    }
  }

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }));
      r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping;
      r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
      IR.maxAniso = Math.min(8, r.capabilities.getMaxAnisotropy());
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 2000);
      this.clock = new THREE.Clock();
      this.state = 'loading';
      this.tmp = new THREE.Vector3(); this.ppos = new THREE.Vector3(); this.camLook = new THREE.Vector3();
      this.shake = 0; this.t = 0; this.fps = 60; this.fpsAcc = 0; this.fpsN = 0;
    }

    async init(onProgress) {
      const step = async (k, fn) => { fn(); onProgress && onProgress(k); await new Promise((r) => setTimeout(r, 16)); };
      await step(0.1, () => IR.initGeo());
      await step(0.35, () => IR.initMaterials());
      await step(0.45, () => { IR.P.initFlag(); this.data = IR.progress.load(); });
      await step(0.55, () => { this.env = new IR.Env(this.renderer, this.scene); this.world = new IR.World(this.scene); this.fx = new Particles(this.scene); });
      onProgress && onProgress(0.6);
      try { await IR.Avatars.load((k) => onProgress && onProgress(0.6 + k * 0.2)); } catch (e) { console.warn('avatars', e); }
      try { await IR.Monuments.load((k) => onProgress && onProgress(0.8 + k * 0.08)); } catch (e) { console.warn('monuments', e); }
      await step(0.9, () => { this.makePost(); this.applySettings(); this.setupWorld(); this.makeRunner(); });
      await step(1, () => { this.resize(); });
      addEventListener('resize', () => this.resize());
      this.bindInput();
      document.addEventListener('visibilitychange', () => { if (document.hidden && this.state === 'playing') this.pause(); });
      this.state = 'menu';
      this.renderer.setAnimationLoop(() => this.frame());
    }

    applySettings() {
      const s = this.data.settings, dpr = window.devicePixelRatio || 1;
      // big laptop screens: cap the number of pixels we draw, then let dynamic resolution fine-tune
      const px = innerWidth * innerHeight, bigScreen = px > 1.2e6 ? Math.sqrt(1.2e6 / px) : 1;
      this.basePR = s.quality === 'low' ? Math.min(dpr, 1) * 0.75 : s.quality === 'high' ? Math.min(dpr, 2) : Math.min(dpr, 1.25) * bigScreen;
      if (s.quality === 'high') this.basePR = Math.max(this.basePR * Math.min(1, bigScreen * 1.3), 0.8);
      this.resScale = this.resScale || 1;
      this.renderer.setPixelRatio(this.basePR * this.resScale);
      this.env && this.env.setQuality(s.quality);
      this.renderer.shadowMap.enabled = s.quality !== 'low';
      this.renderer.shadowMap.type = s.quality === 'high' ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
      this.renderer.shadowMap.needsUpdate = true;
      if (this.bloom) this.bloom.enabled = s.quality === 'high';
      IR.audio.setMusic(s.music); IR.audio.setSfx(s.sfx);
      this.resize();
    }
    resize() {
      const w = innerWidth, h = innerHeight;
      this.renderer.setSize(w, h, false);
      if (this.composer) { this.composer.setPixelRatio(this.renderer.getPixelRatio()); this.composer.setSize(w, h); }
      this.camera.aspect = w / h;
      this.portrait = h > w;
      this.camera.updateProjectionMatrix();
    }

    setupWorld(seed) {
      const d = this.data, mode = this.mode || d.mode, city = this.cityOverride || d.city;
      this.env.festival = this.festival || null;
      this.run = this.world.reset({ mode: mode === 'yatra' ? 'yatra' : 'city', city, seed, festival: this.festival || null });
      this.env.apply(this.run.theme);
      this.curTheme = this.run.theme;
      this.p = { d: 3, x: 0, y: 0, laneI: 1 };
      this.camYaw = this.run.yaw;
    }
    makeRunner() {
      if (this.runner) this.scene.remove(this.runner.root);
      const idx = Math.max(0, IR.CHARS.findIndex((c) => c.id === (this.previewChar || this.data.char)));
      const def = IR.CHARS[idx], outfit = this.previewOutfit !== undefined ? this.previewOutfit : this.data.outfit;
      this.runner = IR.Avatars.models[def.id] ? (def.animal ? new IR.AnimalRunner(def, outfit) : new IR.AvatarRunner(def, outfit)) : new IR.Runner(IR.CHARS_PROC[idx % IR.CHARS_PROC.length], outfit);
      if (this.ppos) this.runner.root.position.copy(this.ppos);
      this.scene.add(this.runner.root);
    }

    /* cinematic post-processing: bloom + grade + ACES output */
    makePost() {
      try {
        const r = this.renderer, size = r.getDrawingBufferSize(new THREE.Vector2());
        const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: r.capabilities.isWebGL2 ? 4 : 0 });
        this.composer = new THREE.EffectComposer(r, rt);
        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
        this.bloom = new THREE.UnrealBloomPass(new THREE.Vector2(size.x / 2, size.y / 2), 0.42, 0.55, 0.86);
        this.composer.addPass(this.bloom);
        this.grade = new THREE.ShaderPass({
          uniforms: { tDiffuse: { value: null }, vig: { value: 0.32 }, sat: { value: 1.12 }, warm: { value: new THREE.Vector3(1.03, 1.0, 0.96) } },
          vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
          fragmentShader: `uniform sampler2D tDiffuse; uniform float vig; uniform float sat; uniform vec3 warm; varying vec2 vUv;
            void main(){ vec4 c = texture2D(tDiffuse, vUv); float l = dot(c.rgb, vec3(.2126,.7152,.0722));
              c.rgb = mix(vec3(l), c.rgb, sat) * warm;
              vec2 d = vUv - .5; c.rgb *= 1. - vig * dot(d, d) * 2.2;
              gl_FragColor = c; }`,
        });
        this.composer.addPass(this.grade);
        this.composer.addPass(new THREE.OutputPass());
      } catch (e) { console.warn('post-processing unavailable', e); this.composer = null; }
    }
    render() {
      // the post-processing chain (bloom + colour grade) only runs on High; Medium/Low draw straight to the screen
      if (this.composer && this.data.settings.quality === 'high') this.composer.render();
      else this.renderer.render(this.scene, this.camera);
    }

    /* ---------- run lifecycle ---------- */
    startRun(mode, opts = {}) {
      IR.audio.init();
      this.mode = mode;
      this.runOpts = opts;
      const d = this.data;
      this.cityOverride = opts.city || null;
      let seed = opts.seed;
      this.festival = opts.festival !== undefined ? opts.festival : mode === 'festival' ? d.festival : null;
      if (mode === 'daily') { const ch = IR.progress.challenge(); this.cityOverride = ch.city; seed = ch.seed; this.challenge = ch; this.festival = ch.festival; }
      else this.challenge = null;
      this.setupWorld(seed);
      this.runSeed = this.world.seed;
      this.previewChar = undefined; this.previewOutfit = undefined; this.makeRunner();
      this.p = {
        d: 3, x: 0, y: 0, vy: 0, laneI: 1, speed: 11, dist: 0, coins: 0, score: 0, slideT: 0, slideQ: false, grounded: true,
        turnQ: false, turns: 0, jumps: 0, slides: 0, powers: 0, pw: { magnet: 0, shield: 0, double: 0, multi: 0, boost: 0, glide: 0, rath: 0 }, tokens: 0, treasures: 0, facts: 0,
        invuln: 0, revives: 0, lives: IR.FREE_LIVES, combo: 0, comboT: 0, nextCheck: 1000, timeLeft: mode === 'timed' ? 120 : 0, fall: false, dead: false, chDone: false,
      };
      this.mult = IR.progress.multiplier();
      this.camYaw = this.run.yaw;
      this.state = 'playing';
      this.missionTimer = 0;
      d.visited[this.run.theme.id] = 1;
      IR.audio.startMusic(this.run.theme, 0.3);
      IR.mp.startRecording();
      if (opts.ghost) IR.mp.makeGhost(this, opts.ghost); else IR.mp.removeGhost(this);
      IR.ui.showHUD(this.p, this);
      if (this.festival) setTimeout(() => IR.ui.festivalCard(this.festival), 900);
      if (d.settings.tutorial) IR.ui.tutorial();
    }
    pause() { if (this.state !== 'playing') return; this.state = 'paused'; IR.ui.show('pause'); IR.audio.ctx && IR.audio.ctx.suspend(); }
    resume() { if (this.state !== 'paused') return; IR.ui.hide('pause'); IR.audio.ctx && IR.audio.ctx.resume(); this.countdown = 0; this.state = 'playing'; this.clock.getDelta(); }
    toMenu() {
      IR.audio.stopMusic(); IR.audio.ctx && IR.audio.ctx.resume();
      IR.mp.removeGhost(this); IR.mp.party = null;
      if (IR.live.st !== 'idle') IR.live.close(true);
      this.mode = null; this.cityOverride = null; this.festival = null; this.runOpts = {}; this.setupWorld(); this.makeRunner();
      this.state = 'menu'; IR.ui.toMenu();
    }

    die(cause) {
      const p = this.p; if (p.dead) return;
      p.dead = true; p.cause = cause; this.state = 'dying'; this.dyingT = 1.3; this.shake = 0.6;
      IR.audio.play(cause === 'fall' ? 'fall' : 'crash');
      if (cause !== 'fall') this.fx.burst(this.ppos.clone().setY(this.ppos.y + 1), '#ffd08a', 30, 6, 4);
      if (navigator.vibrate) try { navigator.vibrate(120); } catch (e) {}
    }
    reviveCost() { return 150 * Math.pow(2, this.p.revives); }
    revive(free) {
      const p = this.p, cost = this.reviveCost();
      if (!free) {
        if (this.data.coins + p.coins < cost) return false;
        // spend banked coins first, then run coins
        const fromBank = Math.min(this.data.coins, cost); this.data.coins -= fromBank; p.coins -= cost - fromBank;
        p.revives++;
      }
      p.dead = false; p.invuln = 2.5; p.vy = 0; p.slideT = 0; p.fall = false;
      if (p.cause === 'wall') this.doTurn(true);
      else if (p.cause === 'fall') { const g = this.run.gaps.find(([a, b]) => p.d > a - 1 && p.d < b + 1); if (g) p.d = g[1] + 1; p.y = 0; }
      for (const o of this.run.obstacles) if (Math.abs(o.d - p.d) < 6) this.clearObstacle(o, false);
      this.state = 'playing'; IR.ui.hide('revive'); this.clock.getDelta();
      return true;
    }
    gameOver() {
      const p = this.p, d = this.data;
      this.state = 'over'; IR.audio.stopMusic();
      d.coins += p.coins; d.totalCoins += p.coins; d.totalDist += p.dist; d.runs++; d.totalJumps += p.jumps;
      const newBest = p.score > d.best; if (newBest) d.best = Math.floor(p.score);
      d.settings.tutorial = false;
      d.tokens = (d.tokens || 0) + p.tokens;
      IR.progress.checkAch({ dist: p.dist }, (a) => IR.ui.toast(a.icon + ' ' + (a.t[IR.ui.lang] || a.t.en), 'ach'));
      const P = IR.progress, dcDone = (t, all) => IR.ui.toast(all ? '🎁 ' + IR.ui.tr('dcAll') + ' +300 🪙' : '✅ ' + P.dcText(t, IR.ui.lang) + ' +100 🪙', 'mission');
      for (const [k, v] of [['coins', p.coins], ['dist', Math.floor(p.dist)], ['jumps', p.jumps], ['slides', p.slides], ['treasure', p.treasures], ['tokens', p.tokens], ['powers', p.powers], ['facts', p.facts]]) P.dcAdd(k, v, dcDone);
      P.save();
      if (IR.mp.party) { IR.mp.partyResult(p); IR.ui.partyTurnOver(p); }
      else if (this.runOpts && this.runOpts.live) { IR.live.finish(p); IR.ui.liveOver(p, newBest); }
      else IR.ui.gameOver(p, newBest);
    }

    /* ---------- input ---------- */
    bindInput() {
      let sx = 0, sy = 0, st = 0, used = false, down = false;
      const el = this.canvas;
      el.addEventListener('pointerdown', (e) => { down = true; used = false; sx = e.clientX; sy = e.clientY; st = performance.now(); IR.audio.init(); });
      el.addEventListener('pointermove', (e) => {
        if (!down || used) return;
        const dx = e.clientX - sx, dy = e.clientY - sy, th = Math.max(22, Math.min(innerWidth, innerHeight) * 0.045);
        if (Math.abs(dx) < th && Math.abs(dy) < th) return;
        used = true;
        if (Math.abs(dx) > Math.abs(dy)) this.action(dx > 0 ? 'right' : 'left'); else this.action(dy > 0 ? 'down' : 'up');
      });
      const end = () => { down = false; };
      el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
      el.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
      addEventListener('keydown', (e) => {
        const k = e.key;
        if (['ArrowLeft', 'a', 'A'].includes(k)) this.action('left');
        else if (['ArrowRight', 'd', 'D'].includes(k)) this.action('right');
        else if (['ArrowUp', 'w', 'W', ' '].includes(k)) this.action('up');
        else if (['ArrowDown', 's', 'S'].includes(k)) this.action('down');
        else if (k === 'p' || k === 'P' || k === 'Escape') { if (this.state === 'playing') this.pause(); else if (this.state === 'paused') this.resume(); }
        else return;
        e.preventDefault();
      });
    }
    action(a) {
      if (this.state !== 'playing') return;
      const p = this.p, run = this.run;
      IR.ui.tutorialAction(a);
      if (a === 'left' || a === 'right') {
        const dir = a === 'left' ? -1 : 1;
        if (!p.turnQ && dir === run.turn && p.d > run.L - 17) { p.turnQ = true; return; }
        const nl = IR.clamp(p.laneI + dir, 0, 2);
        if (nl !== p.laneI) { p.laneI = nl; IR.audio.play('lane'); }
      } else if (a === 'up') {
        if (p.pw.glide > 0) return;
        if (p.grounded && !p.fall) { p.vy = JUMP_V; p.grounded = false; p.slideT = 0; p.jumps++; IR.audio.play('jump'); }
      } else if (a === 'down') {
        if (p.pw.glide > 0) return;
        if (!p.grounded) { p.vy = Math.min(p.vy, -24); p.slideQ = true; }
        else if (!p.fall) this.startSlide();
      }
    }
    startSlide() { const p = this.p; p.slideT = 0.78; p.slides++; IR.audio.play('slide'); this.fx.burst(this.ppos, '#d9b68a', 10, 3, 1, 3); }

    doTurn(force) {
      const p = this.p, run = this.run;
      let next = run.next;
      if (!next || !next.ready) { this.world.flush(); next = run.next; }
      const dExec = run.turn < 0 ? run.L + p.x : run.L - p.x;
      const over = force ? 0 : Math.max(0, p.d - dExec);
      p.d = (run.turn < 0 ? -p.x : p.x) + over;
      this.run = next; p.turnQ = false; p.turns++;
      IR.audio.play('turn');
      if (next.theme !== this.curTheme) {
        this.curTheme = next.theme; this.env.apply(next.theme); IR.audio.setTheme(next.theme);
        this.data.visited[next.theme.id] = 1;
        if (IR.progress.unlock(next.theme.id)) { this.p.coins += 100; setTimeout(() => IR.ui.toast('🔓 ' + IR.ui.tr('cityUnlocked') + ' ' + next.theme.names[IR.ui.lang] + '  +100 🪙', 'mission'), 1800); }
        IR.ui.cityBanner(next.theme);
      }
    }

    clearObstacle(o, burst = true) {
      if (o.cleared) return; o.cleared = true;
      if (o.group) {
        if (burst) { this.world.toWorld(this.run, o.d, this.p.x, 0.8, this.tmp); this.fx.burst(this.tmp, '#ffcf7a', 26, 7, 4); }
        o.group.visible = false;
      }
    }

    /* ---------- frame ---------- */
    frame() {
      let dt = Math.min(this.clock.getDelta(), 1 / 20);
      this.t += dt;
      this.fpsAcc += dt; this.fpsN++;
      if (this.fpsAcc > 1) { this.fps = this.fpsN / this.fpsAcc; this.fpsAcc = 0; this.fpsN = 0; }
      this.dynamicRes(dt);
      if (this.state === 'paused') { this.render(); return; }
      if (this.state === 'playing') this.updatePlay(dt);
      else if (this.state === 'countdown') {
        const before = Math.ceil(this.countT);
        this.countT = (this.countEnd - performance.now()) / 1000; // wall clock, so both phones hit GO together
        IR.ui.countdown(this.countT, before !== Math.ceil(this.countT));
        if (this.countT <= 0) { this.state = 'playing'; IR.live.beganRacing(); this.clock.getDelta(); }
      }
      else if (this.state === 'dying') {
        this.dyingT -= dt;
        if (this.p.fall) { this.p.vy -= GRAV * dt; this.p.y += this.p.vy * dt; }
        if (this.dyingT <= 0 && this.p.lives > 0) { this.p.lives--; this.revive(true); IR.ui.lifeUsed(this.p.lives); }
        else if (this.dyingT <= 0) { this.state = 'revive'; IR.ui.revive(this.reviveCost(), this.data.coins + this.p.coins >= this.reviveCost() && this.p.revives < 3); }
      }
      this.updateVisuals(dt);
      this.render();
      this.adaptQuality(dt);
    }
    /* dynamic resolution: render fewer pixels when frames are slow, more when there is headroom */
    dynamicRes(dt) {
      this.drAcc = (this.drAcc || 0) + dt; this.drN = (this.drN || 0) + 1;
      if (this.drAcc < 0.6) return;
      const fps = this.drN / this.drAcc; this.drAcc = 0; this.drN = 0;
      if (document.hidden || this.state === 'loading') return;
      let k = this.resScale || 1;
      if (fps < 42) k *= fps < 28 ? 0.8 : 0.9;
      else if (fps > 56 && k < 1) k = Math.min(1, k * 1.06);
      k = Math.max(0.5, k);
      if (Math.abs(k - (this.resScale || 1)) > 0.02) {
        this.resScale = k;
        this.renderer.setPixelRatio(this.basePR * k);
        this.resize();
      }
    }
    adaptQuality(dt) {
      if (this.state !== 'playing') { this.lowT = 0; return; }
      const s = this.data.settings;
      if (this.fps < 34 && (this.resScale || 1) <= 0.55 && s.quality !== 'low' && !s.manualQ) {
        this.lowT = (this.lowT || 0) + dt;
        if (this.lowT > 5) { s.quality = s.quality === 'high' ? 'med' : 'low'; this.lowT = 0; this.applySettings(); IR.progress.save(); IR.ui.toast('⚙️ ' + IR.ui.tr('quality') + ': ' + IR.ui.tr(s.quality)); }
      } else this.lowT = 0;
    }

    updatePlay(dt) {
      const p = this.p, pw = p.pw;
      let run = this.run;
      // speed
      const base = Math.min(21, 11 + p.dist * 0.0036);
      p.speed = IR.damp(p.speed, pw.rath > 0 ? base * 1.75 : pw.boost > 0 ? base * 1.6 : base, 3, dt);
      p.d += p.speed * dt; p.dist += p.speed * dt;
      // lateral
      p.x = IR.damp(p.x, LANES()[p.laneI], 15, dt);
      // vertical
      const overGap = run.gaps.some(([a, b]) => p.d > a + 0.3 && p.d < b - 0.3);
      if (pw.glide > 0) { p.y = IR.damp(p.y, 4.3, 3, dt); p.vy = 0; p.grounded = false; }
      else {
        p.vy -= GRAV * dt; p.y += p.vy * dt;
        if (!overGap && p.y <= 0 && !p.fall) {
          if (!p.grounded) { p.grounded = true; this.fx.burst(this.ppos, '#d9b68a', 8, 3, 1, 3); IR.audio.play('step'); if (p.slideQ) { p.slideQ = false; this.startSlide(); } }
          p.y = 0; p.vy = 0;
        } else if (p.y > 0.001) p.grounded = false;
        if (overGap && p.y < -0.05 && !p.fall) {
          if (p.invuln > 0) { p.y = 0; p.vy = JUMP_V; } else { p.fall = true; this.die('fall'); return; }
        }
      }
      if (p.slideT > 0) p.slideT -= dt;
      // turns
      if ((pw.glide > 0 || pw.boost > 0 || pw.rath > 0) && p.d > run.L - 8) p.turnQ = true;
      if (p.turnQ) { const dExec = run.turn < 0 ? run.L + p.x : run.L - p.x; if (p.d >= dExec) { this.doTurn(); run = this.run; } }
      if (this.run === run && p.d > run.L + 3.3) { if (p.invuln > 0) { this.doTurn(true); run = this.run; } else { p.d = run.L + 3.3; this.die('wall'); return; } }
      if (this.state !== 'playing') return;
      // obstacles
      const L = LANES();
      for (const o of run.obstacles) {
        if (o.cleared || o.type === 'gap' || Math.abs(p.d - o.d) > o.depth / 2 + 0.32) continue;
        if (!o.lanes.some((l) => Math.abs(p.x - L[l]) < 1.32)) continue;
        if (pw.glide > 0) continue;
        const hit = o.type === 'block' || (o.type === 'hurdle' && p.y < 0.82) || (o.type === 'banner' && !(p.slideT > 0 && p.y < 0.45));
        if (!hit) continue;
        if (p.invuln > 0 || pw.boost > 0 || pw.rath > 0) this.clearObstacle(o);
        else if (pw.shield > 0) { pw.shield = 0; p.invuln = 1; this.clearObstacle(o); IR.audio.play('shieldBreak'); }
        else { this.die('hit'); return; }
      }
      // coins
      const magnet = pw.magnet > 0 || pw.glide > 0 || pw.rath > 0;
      const center = p.slideT > 0 ? 0.45 : 0.95;
      for (const r of [run, run.next]) {
        if (!r || !r.coinData.length) continue;
        let local = null;
        for (const cd of r.coinData) {
          if (cd.taken) continue;
          if (magnet || cd.mag) {
            if (!local) { local = this.ppos.clone(); local.y += center; r.group.worldToLocal(local); }
            const dx = local.x - cd.lx, dy = local.y - cd.ly, dz = local.z - cd.lz, dist2 = dx * dx + dy * dy + dz * dz;
            if (!cd.mag && dist2 < 64) cd.mag = true;
            if (cd.mag) {
              const f = 1 - Math.exp(-14 * dt);
              cd.lx += dx * f; cd.ly += dy * f; cd.lz += dz * f;
              if (dist2 < 0.5) this.takeCoin(r, cd);
              continue;
            }
          }
          if (r === run && Math.abs(-cd.lz - p.d) < 0.9 && Math.abs(cd.lx - p.x) < 0.95 && Math.abs(cd.ly - (p.y + center)) < 1.05) this.takeCoin(r, cd);
        }
      }
      // hidden treasure
      const T = run.treasure;
      if (T && !T.taken && Math.abs(T.d - p.d) < 1.1 && Math.abs(T.x - p.x) < 1.0 && Math.abs(T.y + 0.3 - (p.y + center)) < 1.1) {
        T.taken = true; T.g.visible = false; p.treasures++;
        const cul = IR.CULTURE[run.theme.id], idx = Math.floor(Math.random() * cul.tr.length), isNew = IR.progress.addTreasure(run.theme.id, idx);
        IR.audio.play('treasure'); this.fx.burst(this.ppos.clone().setY(this.ppos.y + 1.2), '#ffd36a', 50, 7, 5);
        IR.ui.treasureCard(cul.tr[idx], isNew, run.theme);
      }
      // culture fact card near a monument / on entering a city
      if (run.factD > 0 && !run.factShown && p.d > run.factD) {
        run.factShown = true;
        const cul = IR.CULTURE[run.theme.id];
        if (cul && cul.facts.length) {
          const fi = run.mon ? Math.max(0, cul.mon.indexOf(run.mon.cfg)) % cul.facts.length : (run.i % cul.facts.length), key = run.theme.id + ':' + fi;
          if (!this.data.facts[key]) { this.data.facts[key] = 1; p.facts++; }
          IR.ui.factCard(run.theme, cul.facts[fi], run.mon && IR.MON[run.mon.cfg.k]);
        }
      }
      // pickups
      for (const pk of run.pickups) {
        if (pk.taken || Math.abs(pk.d - p.d) > 1 || Math.abs(pk.x - p.x) > 1.1 || Math.abs(pk.y - (p.y + center)) > 1.4) continue;
        pk.taken = true; pk.g.visible = false; p.powers++;
        pw[pk.kind] = IR.progress.duration(pk.kind);
        IR.audio.play('power');
        this.fx.burst(this.ppos.clone().setY(this.ppos.y + 1.2), IR.POWERS[pk.kind].col, 30, 5, 3);
        IR.ui.powerToast(pk.kind);
      }
      for (const k in pw) if (pw[k] > 0) pw[k] = Math.max(0, pw[k] - dt);
      if (p.invuln > 0) p.invuln -= dt;
      if (p.comboT > 0) p.comboT -= dt; else p.combo = 0;
      // score
      p.score += p.speed * dt * this.mult * (pw.multi > 0 ? 2 : 1);
      if (p.dist >= p.nextCheck) { p.nextCheck += 1000; p.coins += 25; IR.ui.toast('🚩 ' + IR.ui.tr('checkpoint') + ' ' + Math.floor(p.dist / 1000) * 1000 + ' m  +25 🪙', 'check'); IR.audio.play('mission'); }
      if (this.mode === 'timed') { p.timeLeft -= dt; if (p.timeLeft <= 0) { p.timeLeft = 0; p.cause = 'time'; this.gameOver(); return; } }
      if (this.challenge && !p.chDone && p.coins >= this.challenge.target) {
        p.chDone = true; if (!this.data.challenge.done) { this.data.challenge.done = true; this.data.coins += this.challenge.reward; IR.ui.toast('🎯 ' + IR.ui.tr('challengeDone') + ' +' + this.challenge.reward + ' 🪙', 'mission'); IR.audio.play('mission'); }
      }
      this.missionTimer -= dt;
      if (this.missionTimer <= 0) {
        this.missionTimer = 0.5;
        IR.progress.checkMissions({ coins: p.coins, dist: p.dist, jumps: p.jumps, slides: p.slides, turns: p.turns, powers: p.powers, score: p.score }, (m, lvl) => {
          if (lvl) { this.mult = IR.progress.multiplier(); IR.ui.toast('⭐ ' + IR.ui.tr('levelUp') + ' x' + this.mult, 'mission'); }
          else IR.ui.toast('✅ ' + IR.progress.missionText(m, IR.ui.lang), 'mission');
          IR.audio.play('mission'); IR.progress.save();
        });
      }
      IR.audio.setIntensity(IR.clamp((p.speed - 11) / 13, 0, 1));
      this.world.update(dt, this.run, p.d);
      IR.mp.record(dt, this.run, p);
      IR.ui.hud(p, this);
    }
    takeCoin(r, cd) {
      const p = this.p; cd.taken = true;
      if (cd.tok) {
        p.tokens++; p.score += 25 * this.mult; p.combo++; p.comboT = 0.6;
        IR.audio.play('token', p.combo);
        this.world.toWorld(r, -cd.lz, cd.lx, cd.ly, this.tmp);
        const cols = ['#ff3d7f', '#ffd400', '#00e0ff', '#7cff4a', '#ff7a00'];
        this.fx.burst(this.tmp, this.festival === 'holi' ? cols[p.tokens % 5] : '#ffcf6a', this.festival === 'holi' ? 22 : 10, 4, 3, 3);
        return;
      }
      const v = p.pw.double > 0 || p.pw.rath > 0 ? 2 : 1;
      p.coins += v; p.score += 10 * this.mult * v;
      p.combo++; p.comboT = 0.6;
      IR.audio.play('coin', p.combo);
      this.world.toWorld(r, -cd.lz, cd.lx, cd.ly, this.tmp);
      this.fx.burst(this.tmp, '#ffd23a', 5, 2.5, 2, 4);
    }

    updateVisuals(dt) {
      const p = this.p, run = this.run;
      if (this.state !== 'playing') this.world.update(dt, run, p.d);
      this.world.toWorld(run, p.d, p.x, p.y, this.ppos);
      const R = this.runner;
      R.root.position.copy(this.ppos);
      const yaw = this.state === 'select' ? run.yaw : run.yaw;
      R.root.rotation.y = IR.angDamp(R.root.rotation.y, yaw, 14, dt);
      let st = 'idle';
      if (this.state === 'select') st = 'show';
      else if (this.state === 'menu') st = 'idle';
      else if (this.state === 'countdown') st = 'idle';
      else if (p.dead) st = 'crash';
      else if (p.pw && p.pw.glide > 0) st = 'glide';
      else if (p.slideT > 0) st = 'slide';
      else if (!p.grounded) st = 'jump';
      else st = 'run';
      const lean = st === 'run' ? IR.clamp((LANES()[p.laneI] - p.x) * 0.12, -0.25, 0.25) : 0;
      this.pState = st;
      R.update(dt, { state: st, y: p.y || 0, speed: p.speed || 0, lean: -lean, shield: p.pw && (p.pw.shield > 0 || p.pw.rath > 0), magnet: p.pw && (p.pw.magnet > 0 || p.pw.rath > 0), onStep: () => IR.audio.play('step') });
      R.root.visible = !(p.invuln > 0 && !p.dead && Math.floor(this.t * 14) % 2 === 0 && !(p.pw && p.pw.shield > 0));
      this.fx.update(dt);
      // camera
      const cam = this.camera, s = this.data.settings;
      this.camYaw = IR.angDamp(this.camYaw, run.yaw, this.state === 'playing' ? 5.5 : 3, dt);
      const fx = -Math.sin(this.camYaw), fz = -Math.cos(this.camYaw);
      let tx, ty, tz, lx, ly, lz, rate = 9;
      if (this.state === 'menu') {
        const th = this.camYaw + 0.35 + Math.sin(this.t * 0.13) * 0.75;
        tx = this.ppos.x + Math.sin(th) * 6.2; tz = this.ppos.z + Math.cos(th) * 6.2; ty = 2.4;
        lx = this.ppos.x + fx * 3; ly = 1.5; lz = this.ppos.z + fz * 3; rate = 2.5;
      } else if (this.state === 'select') {
        const an = !!this.runner.garland, ht = this.runner.height || 1.8;
        const dist = an ? 2.0 + ht * 1.3 : 3.0, side = an ? 1.4 + ht * 0.8 : 0.4;
        tx = this.ppos.x + fx * dist - fz * side; tz = this.ppos.z + fz * dist + fx * side; ty = an ? ht * 0.85 + 0.25 : 1.35;
        lx = this.ppos.x; ly = an ? ht * 0.5 : 1.05; lz = this.ppos.z; rate = 4;
      } else {
        const back = this.portrait ? 4.9 : 5.2, h = (p.slideT > 0 ? 2.3 : 2.75) + (this.portrait ? 0.15 : 0);
        tx = this.ppos.x - fx * back; tz = this.ppos.z - fz * back; ty = h + Math.max(0, p.y) * 0.55 + (p.fall ? p.y * 0.3 : 0);
        lx = this.ppos.x + fx * 7; ly = 1.45 + Math.max(0, p.y) * 0.4; lz = this.ppos.z + fz * 7;
      }
      cam.position.x = IR.damp(cam.position.x, tx, rate, dt); cam.position.y = IR.damp(cam.position.y, ty, rate, dt); cam.position.z = IR.damp(cam.position.z, tz, rate, dt);
      this.camLook.x = IR.damp(this.camLook.x, lx, rate * 1.5, dt); this.camLook.y = IR.damp(this.camLook.y, ly, rate * 1.5, dt); this.camLook.z = IR.damp(this.camLook.z, lz, rate * 1.5, dt);
      if (this.shake > 0) { this.shake -= dt; const k = this.shake * 0.4; cam.position.x += (Math.random() - 0.5) * k; cam.position.y += (Math.random() - 0.5) * k; }
      cam.lookAt(this.camLook);
      const boost = p.pw && p.pw.boost > 0 ? 10 : 0;
      const fov = (this.state === 'select' ? 45 : s.fov + (this.portrait ? 5 : 0)) + boost + (p.speed ? (p.speed - 11) * 0.35 : 0);
      if (Math.abs(cam.fov - fov) > 0.05) { cam.fov = IR.damp(cam.fov, fov, 4, dt); cam.updateProjectionMatrix(); }
      this.env.camYaw = this.camYaw;
      IR.mp.updateGhost(this, dt, this.state === 'playing');
      IR.live.update(dt);
      this.env.update(dt, cam, this.ppos);
    }
    snapCamera() {
      this.world.toWorld(this.run, this.p.d, this.p.x, this.p.y, this.ppos);
      const fx = -Math.sin(this.camYaw), fz = -Math.cos(this.camYaw);
      this.camera.position.set(this.ppos.x - fx * 6, 3, this.ppos.z - fz * 6);
      this.camLook.set(this.ppos.x + fx * 6, 1.2, this.ppos.z + fz * 6);
    }
  }
  IR.Game = Game;
})();
