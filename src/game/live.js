/* Live Race: two phones race on the same track at the same time.
   One player creates a race and gets a 4-digit code (and a link); the friend joins with the code.
   PeerJS (WebRTC) connects the phones; race data then flows directly phone-to-phone. */
(function () {
  const PREFIX = 'indiarun-live-';
  const SEND_HZ = 12;
  const L = (IR.live = {
    st: 'idle', // idle | opening | waiting | connecting | lobby | countdown | racing | done | error
    role: null, code: null, peer: null, conn: null,
    friend: null, // { n, ch, last packet, end }
    race: null, // { seed, city, fest }
    ghost: null, rtt: 120, sendAcc: 0, myEnd: null, cb: null,
  });

  const emit = (ev, data) => { try { L.cb && L.cb(ev, data); } catch (e) { console.error(e); } };
  const send = (m) => { try { if (L.conn && L.conn.open) L.conn.send(m); } catch (e) {} };
  const me = () => { const d = window.game && game.data; return { n: (d && d.name) || 'Player', ch: (d && d.char) || 'm1' }; };
  const peerOpts = () => Object.assign({
    debug: 0,
    config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:stun.cloudflare.com:3478' }].concat(IR.LIVE_TURN || []) },
  }, IR.LIVE_SERVER || window.IR_LIVE_SERVER || {});

  L.active = () => !!(L.conn && L.race && (L.st === 'countdown' || L.st === 'racing' || L.st === 'done'));
  L.link = () => (IR.SHARE_BASE || location.href.split('#')[0]) + '#live=' + L.code;
  L.parseLink = (hash) => { const m = /#live=(\d{4})\b/.exec(hash || ''); return m ? m[1] : null; };

  function fail(e) {
    const t = (e && e.type) || 'error';
    const why = t === 'peer-unavailable' ? 'noRoom' : t === 'busy' ? 'roomFull' : t === 'timeout' ? 'noConn'
      : /network|server-error|socket|browser-incompatible|ssl/.test(t) ? 'noNet' : 'noConn';
    console.warn('live:', t, e && e.message);
    const racing = L.st === 'racing' || L.st === 'countdown';
    cleanup();
    L.st = 'error';
    emit(racing ? 'left' : 'error', why);
  }
  function cleanup() {
    clearTimeout(L.joinTimer); clearInterval(L.pingT);
    try { L.conn && L.conn.close(); } catch (e) {}
    try { L.peer && L.peer.destroy(); } catch (e) {}
    L.conn = null; L.peer = null;
  }

  /* ---------- create / join ---------- */
  L.host = () => {
    L.close(true); L.role = 'host'; L.st = 'opening';
    if (!window.Peer) return fail({ type: 'browser-incompatible' });
    const attempt = (n) => {
      const code = String(1000 + Math.floor(Math.random() * 9000));
      const peer = new Peer(PREFIX + code, peerOpts()); L.peer = peer;
      peer.on('open', () => { if (L.peer !== peer) return; L.code = code; L.st = 'waiting'; emit('code', code); });
      peer.on('error', (e) => { if (L.peer !== peer) return; if (e.type === 'unavailable-id' && n < 8) { peer.destroy(); attempt(n + 1); } else if (e.type !== 'peer-unavailable') fail(e); });
      peer.on('connection', (c) => {
        if (L.conn) { c.on('open', () => { c.send({ t: 'busy' }); setTimeout(() => c.close(), 400); }); return; }
        bind(c);
      });
      peer.on('disconnected', () => { if (L.peer === peer && L.st === 'waiting') try { peer.reconnect(); } catch (e) {} });
    };
    attempt(0);
  };
  L.join = (code) => {
    L.close(true); L.role = 'guest'; L.code = code; L.st = 'connecting'; emit('connecting', code);
    if (!window.Peer) return fail({ type: 'browser-incompatible' });
    const peer = new Peer(undefined, peerOpts()); L.peer = peer;
    peer.on('open', () => {
      if (L.peer !== peer) return;
      bind(peer.connect(PREFIX + code, { reliable: true, serialization: 'json' }));
      L.joinTimer = setTimeout(() => { if (L.st === 'connecting') fail({ type: 'timeout' }); }, 20000);
    });
    peer.on('error', (e) => { if (L.peer === peer) fail(e); });
  };
  function bind(c) {
    L.conn = c; L.byeSeen = false;
    c.on('open', () => {
      clearTimeout(L.joinTimer);
      L.st = 'lobby';
      send(Object.assign({ t: 'hi', v: 1 }, me()));
      // keep measuring round-trip time so both countdowns end together
      L.pingT = setInterval(() => send({ t: 'ping', ts: performance.now() }), 2000);
      send({ t: 'ping', ts: performance.now() });
      // the host no longer needs the signalling server once connected
      if (L.role === 'host') try { L.peer.disconnect(); } catch (e) {}
    });
    c.on('data', onData);
    c.on('close', () => { if (L.conn !== c || L.byeSeen) return; const was = L.st; L.conn = null; clearInterval(L.pingT); if (was !== 'idle') { L.st = was === 'done' || was === 'racing' || was === 'countdown' ? was : 'error'; emit('left', 'friendLeft'); } });
    c.on('error', (e) => { if (L.conn === c) fail(e); });
  }

  /* ---------- messages ---------- */
  function onData(m) {
    if (!m || typeof m !== 'object') return;
    switch (m.t) {
      case 'hi':
        L.friend = { n: String(m.n || 'Friend').slice(0, 14), ch: m.ch, last: null, end: null };
        IR.Avatars.ensure(m.ch); // load the friend's runner while still in the lobby
        emit('friend', L.friend);
        break;
      case 'busy': fail({ type: 'busy' }); break;
      case 'ping': send({ t: 'pong', ts: m.ts }); break;
      case 'pong': L.rtt = L.rtt * 0.6 + (performance.now() - m.ts) * 0.4; break;
      case 'go': if (L.role === 'guest') begin(m, 3); break;
      case 'p':
        if (!L.friend) break;
        m.at = performance.now(); L.friend.last = m;
        break;
      case 'end':
        if (!L.friend) break;
        L.friend.end = { sc: m.sc | 0, ds: m.ds | 0, c: m.c | 0 };
        emit('friendEnd', L.friend.end);
        break;
      case 'bye': {
        const c = L.conn; L.byeSeen = true; L.conn = null; clearInterval(L.pingT);
        try { c && c.close(); } catch (e) {}
        if (L.st !== 'done' && L.st !== 'racing' && L.st !== 'countdown') L.st = 'error';
        emit('left', 'friendLeft'); break;
      }
    }
  }

  /* ---------- race ---------- */
  L.start = () => { // host only
    if (L.role !== 'host' || !L.conn) return;
    const d = game.data;
    const city = IR.progress.isUnlocked(d.city) ? d.city : 'varanasi';
    const msg = { t: 'go', seed: (Math.random() * 1e9) | 0, city, fest: d.mode === 'festival' ? d.festival : null };
    send(msg);
    begin(msg, 3 + Math.min(0.4, L.rtt / 2000)); // host waits half a round trip longer so both reach "GO" together
  };
  function begin(m, delay) {
    L.race = { seed: m.seed, city: m.city, fest: m.fest || null };
    L.myEnd = null;
    if (L.friend) { L.friend.last = null; L.friend.end = null; }
    L.st = 'countdown';
    emit('go', L.race);
    IR.ui.hideAll();
    game.startRun('city', { seed: m.seed, city: m.city, festival: m.fest || null, live: true });
    // start side by side: host on the left lane, guest on the right
    const lane = L.role === 'host' ? 0 : 2; game.p.laneI = lane; game.p.x = IR.LANES[lane];
    game.state = 'countdown'; game.countT = delay; game.countEnd = performance.now() + delay * 1000;
    makeGhost();
  }
  L.beganRacing = () => { L.st = 'racing'; };
  L.finish = (p) => {
    if (!L.race) return;
    L.myEnd = { sc: Math.floor(p.score), ds: Math.floor(p.dist), c: p.coins };
    send(Object.assign({ t: 'end' }, L.myEnd));
    L.st = 'done';
  };

  function makeGhost() {
    removeGhost();
    if (!L.friend) return;
    const runner = IR.mp.ghostRunner(game, L.friend.ch, '🔴 ' + L.friend.n, 0.85, '#9fe8ff');
    if (runner) L.ghost = { runner, pos: new THREE.Vector3(), d: 0, x: 0, y: 0, i: -1 };
  }
  function removeGhost() { if (L.ghost) { game.scene.remove(L.ghost.runner.root); L.ghost = null; } }
  L.removeGhost = removeGhost;

  /* friend's live distance (m), extrapolated a little between packets */
  L.friendDist = () => {
    const f = L.friend; if (!f) return 0;
    if (f.end) return f.end.ds;
    const m = f.last; if (!m) return 0;
    const age = Math.min(0.35, (performance.now() - m.at) / 1000);
    return m.ds + (m.st === 'run' || m.st === 'jump' || m.st === 'slide' || m.st === 'glide' ? m.s * age : 0);
  };

  /* called every frame from game.updateVisuals */
  L.update = (dt) => {
    if (!L.race || !window.game) return;
    const g = game, p = g.p;
    // send my state
    if (L.conn && (g.state === 'playing' || g.state === 'countdown' || g.state === 'dying' || g.state === 'revive' || g.state === 'paused')) {
      L.sendAcc += dt;
      if (L.sendAcc >= 1 / SEND_HZ) {
        L.sendAcc = 0;
        send({ t: 'p', i: g.run.i, d: +p.d.toFixed(2), x: +p.x.toFixed(2), y: +Math.max(0, p.y).toFixed(2), s: +(g.state === 'playing' ? p.speed : 0).toFixed(1), st: g.state === 'paused' || g.state === 'countdown' ? 'idle' : g.pState || 'run', ds: Math.floor(p.dist), sc: Math.floor(p.score) });
      }
    }
    // draw the friend
    const G = L.ghost, f = L.friend, m = f && f.last;
    if (!G) return;
    if (!m) { G.runner.root.visible = false; return; }
    const run = g.world.runs.find((r) => r.i === m.i);
    if (!run) { G.runner.root.visible = false; return; }
    const age = Math.min(0.35, (performance.now() - m.at) / 1000);
    const moving = m.st === 'run' || m.st === 'jump' || m.st === 'slide' || m.st === 'glide';
    let d = m.d + (moving ? m.s * age : 0);
    if (run.turn) d = Math.min(d, run.L + 2);
    if (G.i !== m.i) { G.i = m.i; G.d = d; G.x = m.x; G.y = m.y; }
    G.d = IR.damp(G.d, d, 14, dt); G.x = IR.damp(G.x, m.x, 12, dt); G.y = IR.damp(G.y, m.y, 14, dt);
    g.world.toWorld(run, G.d, G.x, G.y, G.pos);
    const R = G.runner.root; R.visible = true; R.position.copy(G.pos); R.rotation.y = IR.angDamp(R.rotation.y, run.yaw, 12, dt);
    G.runner.update(dt, { state: f.end ? 'crash' : m.st || 'run', speed: m.s || 0, y: G.y });
  };

  /* ---------- leave ---------- */
  L.close = (silent) => {
    if (L.conn) send({ t: 'bye' });
    cleanup(); if (window.game) removeGhost();
    Object.assign(L, { st: 'idle', role: null, code: null, friend: null, race: null, myEnd: null });
    if (!silent) emit('closed');
  };
  L.endRace = () => { if (window.game) removeGhost(); L.race = null; if (L.conn) L.st = 'lobby'; };
  window.addEventListener('pagehide', () => { if (L.conn) send({ t: 'bye' }); });
})();
