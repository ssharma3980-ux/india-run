/* Multiplayer: Friend Challenge (shareable link + ghost runner) and Pass & Play (2–4 players, one phone) */
(function () {
  const MP = (IR.mp = { rec: null, ghost: null, party: null, challenge: null });
  const STEP = 0.25, MAXS = 3 * 60 / STEP;

  /* ---- recording the player's run ---- */
  MP.startRecording = () => { MP.rec = { t: 0, acc: 0, data: [] }; };
  MP.record = (dt, run, p) => {
    const r = MP.rec; if (!r) return;
    r.t += dt; r.acc += dt;
    if (r.acc >= STEP && r.data.length / 4 < MAXS) { r.acc -= STEP; r.data.push(run.i, Math.round(p.d * 10), Math.round(p.x * 10), Math.round(Math.max(0, p.y) * 10)); }
  };

  /* ---- compact link encoding ---- */
  const b64u = (u8) => { let s = ''; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64u = (s) => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  MP.makeLink = (info) => {
    const g = new Int16Array(MP.rec ? MP.rec.data : []);
    const meta = new TextEncoder().encode(JSON.stringify(info));
    const out = new Uint8Array(2 + meta.length + g.byteLength);
    out[0] = meta.length & 255; out[1] = meta.length >> 8; out.set(meta, 2); out.set(new Uint8Array(g.buffer), 2 + meta.length);
    return (IR.SHARE_BASE || location.href.split('#')[0]) + '#c=' + b64u(out);
  };
  MP.parseLink = (hash) => {
    try {
      const m = /#c=([A-Za-z0-9_-]+)/.exec(hash || ''); if (!m) return null;
      const u = unb64u(m[1]), ml = u[0] | (u[1] << 8);
      const info = JSON.parse(new TextDecoder().decode(u.slice(2, 2 + ml)));
      const rest = u.slice(2 + ml), g = new Int16Array(rest.buffer.slice(rest.byteOffset, rest.byteOffset + (rest.byteLength & ~1)));
      info.ghost = Array.from(g);
      return info;
    } catch (e) { console.warn('bad challenge link', e); return null; }
  };

  /* ---- ghost runner replay ---- */
  MP.makeGhost = (game, info) => {
    MP.removeGhost(game);
    if (!info || !info.ghost || info.ghost.length < 8) return;
    const def = IR.CHARS.find((c) => c.id === info.ch) || IR.CHARS[0];
    let runner;
    try { runner = IR.Avatars.models[def.id] ? (def.animal ? new IR.AnimalRunner(def, 0) : new IR.AvatarRunner(def, 0)) : null; } catch (e) { runner = null; }
    if (!runner) return;
    runner.root.traverse((m) => { if (m.isMesh && m.material && !m.material.isShaderMaterial) { m.material = [].concat(m.material).map((mm) => { const c = mm.clone(); c.transparent = true; c.opacity = 0.55; c.depthWrite = false; return c; }); if (m.material.length === 1) m.material = m.material[0]; m.castShadow = false; } });
    const c = IR.tex.cv(256, 64), x = c.getContext('2d');
    x.fillStyle = 'rgba(20,10,40,.75)'; x.beginPath(); x.roundRect ? x.roundRect(4, 4, 248, 56, 28) : x.rect(4, 4, 248, 56); x.fill();
    x.fillStyle = '#ffe08a'; x.font = '700 30px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('👻 ' + (info.n || 'Friend').slice(0, 12), 128, 34);
    const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthWrite: false, depthTest: false, toneMapped: false }));
    tag.scale.set(1.8, 0.45, 1); tag.position.y = (runner.height || 1.8) + 0.6; runner.root.add(tag);
    game.scene.add(runner.root);
    MP.ghost = { runner, data: info.ghost, t: 0, name: info.n || 'Friend', done: false, pos: new THREE.Vector3(), d: 0 };
  };
  MP.removeGhost = (game) => { if (MP.ghost) { game.scene.remove(MP.ghost.runner.root); MP.ghost = null; } };
  MP.updateGhost = (game, dt, playing) => {
    const G = MP.ghost; if (!G) return;
    if (playing) G.t += dt;
    const n = G.data.length / 4, f = G.t / STEP, i = Math.min(n - 1, Math.floor(f)), k = Math.min(1, f - i);
    const a = i * 4, b = Math.min(n - 1, i + 1) * 4, D = G.data;
    const runI = D[b] === D[a] ? D[a] : D[b];
    const run = game.world.runs.find((r) => r.i === runI);
    G.done = f >= n - 1;
    if (!run) { G.runner.root.visible = false; return; }
    const lerp = D[b] === D[a] ? k : 1;
    const d = (D[a + 1] + (D[b + 1] - D[a + 1]) * lerp) / 10, x = (D[a + 2] + (D[b + 2] - D[a + 2]) * lerp) / 10, y = (D[a + 3] + (D[b + 3] - D[a + 3]) * lerp) / 10;
    game.world.toWorld(run, d, x, y, G.pos);
    const R = G.runner.root; R.visible = true; R.position.copy(G.pos); R.rotation.y = IR.angDamp(R.rotation.y, run.yaw, 12, dt);
    G.runner.update(dt, { state: G.done ? 'crash' : y > 0.15 ? 'jump' : 'run', speed: 14, y });
    // distance lead (+ ahead / - behind), counting completed runs
    const myRun = game.run; G.lead = (myRun.i - runI) * 150 + (game.p.d - d);
  };

  /* ---- share helpers ---- */
  MP.share = async (url, text) => {
    try { if (navigator.share) { await navigator.share({ title: 'INDIA RUN', text, url }); return 'shared'; } } catch (e) {}
    try { await navigator.clipboard.writeText(text + ' ' + url); return 'copied'; } catch (e) {}
    return 'manual';
  };
  MP.whatsapp = (url, text) => 'https://wa.me/?text=' + encodeURIComponent(text + ' ' + url);

  /* ---- Pass & Play party ---- */
  MP.startParty = (names, opts) => { MP.party = { players: names.map((n) => ({ name: n, score: null, dist: 0, coins: 0 })), turn: 0, opts }; };
  MP.partyResult = (p) => { const P = MP.party; if (!P) return; Object.assign(P.players[P.turn], { score: Math.floor(p.score), dist: Math.floor(p.dist), coins: p.coins }); P.turn++; };
  MP.partyDone = () => MP.party && MP.party.turn >= MP.party.players.length;
})();
