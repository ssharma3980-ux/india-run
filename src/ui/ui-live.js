/* Live Race UI: create / join with a 4-digit code, lobby, 3-2-1 countdown, live HUD tag, results */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const fmt = (n) => Math.floor(n).toLocaleString('en-IN');
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const UI = IR.ui, LV = IR.live;
  const charIcon = (id) => {
    const c = IR.CHARS.find((x) => x.id === id) || {}, m = c.model || '';
    return /Horse/.test(m) ? '🐎' : /Camel/.test(m) ? '🐪' : /Deer/.test(m) ? '🦌' : /Dog/.test(m) ? '🐕' : c.sex === 'f' ? '🏃‍♀️' : '🏃';
  };

  const build = UI.build;
  UI.build = function (game) {
    build.call(this, game);
    $('#ui').insertAdjacentHTML('beforeend', `<div id="live" class="screen panelScreen"><div class="panel narrow" id="liveBody"></div></div>`);
    $('#hud').insertAdjacentHTML('beforeend', `<div class="liveCount" id="liveCount"></div>`);
    $('.runWrap').insertAdjacentHTML('afterend', `<button class="liveBtn" id="bLiveMenu"><span class="liveDot"></span><b data-t="liveRace">${this.tr('liveRace')}</b><small>2P · 4-digit code</small></button>`);
    $('#bLiveMenu').onclick = () => { this.click(); if (LV.st === 'error') LV.st = 'idle'; this.openLive(); this.renderLive(); };
    LV.cb = (ev, data) => this.liveEvent(ev, data);
    const code = LV.parseLink(location.hash);
    if (code) {
      try { history.replaceState(null, '', location.href.split('#')[0]); } catch (e) {}
      setTimeout(() => { this.hideAll(); this.stack = []; this.show('live'); LV.join(code); this.renderLive(); }, 500);
    }
  };

  /* Live Race card at the top of the Multiplayer screen */
  const renderMulti = UI.renderMulti;
  UI.renderMulti = function () {
    renderMulti.call(this);
    const card = document.createElement('div');
    card.className = 'mcard liveCard';
    card.innerHTML = `<div class="mh"><span class="liveDot"></span><b>${this.tr('liveRace')}</b></div><p class="muted">${this.tr('liveDesc')}</p>
      <button class="cta" id="bLiveHost">🏁 ${this.tr('createRace')}</button>
      <div class="joinRow"><input id="liveCode" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="${this.tr('enterCode')}" autocomplete="off"><button class="ghost" id="bLiveJoin">${this.tr('joinRace')} ›</button></div>`;
    const box = $('#multiBody');
    box.insertBefore(card, box.firstChild);
    // name field lives in the challenge card; move it to the top so both modes use it
    const nameField = $('#myName') && $('#myName').closest('.field');
    if (nameField) box.insertBefore(nameField, card);
    const inp = $('#liveCode');
    inp.oninput = () => { inp.value = inp.value.replace(/\D/g, '').slice(0, 4); };
    $('#bLiveHost').onclick = () => { this.click(); this.saveName(); this.openLive(); LV.host(); this.renderLive(); };
    $('#bLiveJoin').onclick = () => {
      this.click(); this.saveName();
      if (!/^\d{4}$/.test(inp.value)) { inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 500); return; }
      this.openLive(); LV.join(inp.value); this.renderLive();
    };
    inp.onkeydown = (e) => { if (e.key === 'Enter') $('#bLiveJoin').click(); };
  };
  UI.saveName = function () { const e = $('#myName'); if (e) { this.g.data.name = e.value.trim().slice(0, 14); IR.progress.save(); } };
  UI.openLive = function () { this.hideAll(); this.stack = []; this.show('live'); };

  /* the live panel shows whatever stage the connection is in */
  UI.renderLive = function () {
    const box = $('#liveBody'), t = (k) => this.tr(k), st = LV.st, d = this.g.data;
    const cancel = `<button class="ghost" id="bLiveX">${t('cancel')}</button>`;
    let html = '';
    if (st === 'idle') {
      html = `<div class="mh c"><span class="liveDot"></span><b>${t('liveRace')}</b></div><p class="muted">${t('liveDesc')}</p>
        <div class="field"><small>${t('yourName')}</small><input id="liveName" maxlength="14" value="${esc(d.name || '')}" placeholder="${t('yourName')}"></div>
        <button class="cta" id="bLiveHost2">🏁 ${t('createRace')}</button>
        <div class="orLine"><span>${t('or')}</span></div>
        <div class="joinRow"><input id="liveCode2" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="${t('enterCode')}" autocomplete="off"><button class="ghost" id="bLiveJoin2">${t('joinRace')} ›</button></div>
        <button class="ghost" id="bLiveX">${t('home')}</button>`;
    } else if (st === 'opening' || st === 'connecting') {
      html = `<div class="bigIcon spin">📡</div><h2>${t('connecting')}</h2>${LV.code && st === 'connecting' ? `<p class="codeSmall">${LV.code}</p>` : ''}${cancel}`;
    } else if (st === 'waiting') {
      html = `<div class="mh c"><span class="liveDot"></span><b>${t('liveRace')}</b></div><small class="muted">${t('raceCode')}</small>
        <div class="bigCode">${LV.code.split('').map((c) => `<i>${c}</i>`).join('')}</div>
        <p class="muted">${t('shareCode')}</p>
        <div class="shareRow"><button class="ghost wa" id="bLiveWA">💬 ${t('whatsapp')}</button><button class="ghost" id="bLiveCopy">🔗 ${t('copyLink')}</button></div>
        <p class="waiting"><span class="dots3"><i></i><i></i><i></i></span> ${t('waitingFriend')}</p>${cancel}`;
    } else if (st === 'lobby' && LV.friend) {
      const th = IR.THEMES[IR.progress.isUnlocked(d.city) ? d.city : 'varanasi'];
      html = `<div class="mh c"><span class="liveDot"></span><b>${t('liveRace')}</b></div>
        <div class="versus"><div><span>${charIcon(d.char)}</span><b>${esc(d.name || t('you'))}</b></div><em>VS</em><div><span>${charIcon(LV.friend.ch)}</span><b>${esc(LV.friend.n)}</b></div></div>
        <p class="okTxt">✅ ${esc(LV.friend.n)} ${t('joined')}</p>
        ${LV.role === 'host'
          ? `<p class="muted">${t('city')}: ${th.icon} ${th.names[this.lang]} · ${t('raceNote')}</p><button class="cta" id="bLiveGo">🏁 ${t('startRace')}</button>`
          : `<p class="waiting"><span class="dots3"><i></i><i></i><i></i></span> ${t('waitHost')}</p><p class="muted">${t('raceNote')}</p>`}
        <button class="ghost" id="bLiveX">${t('leave')}</button>`;
    } else if (st === 'lobby') {
      html = `<div class="bigIcon spin">📡</div><h2>${t('connecting')}</h2>${cancel}`;
    } else if (st === 'error') {
      html = `<div class="bigIcon">⚠️</div><h2>${t('liveRace')}</h2><p class="errTxt">${t(this.liveErr || 'noConn')}</p>
        <button class="cta" id="bLiveRetry">🔁 ${t('retry')}</button><button class="ghost" id="bLiveX">${t('home')}</button>`;
    } else return;
    box.innerHTML = html;
    if (st === 'idle') {
      const nm = $('#liveName'), inp = $('#liveCode2');
      const keepName = () => { d.name = nm.value.trim().slice(0, 14); IR.progress.save(); };
      inp.oninput = () => { inp.value = inp.value.replace(/\D/g, '').slice(0, 4); };
      $('#bLiveHost2').onclick = () => { this.click(); keepName(); LV.host(); this.renderLive(); };
      $('#bLiveJoin2').onclick = () => {
        this.click(); keepName();
        if (!/^\d{4}$/.test(inp.value)) { inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 500); return; }
        LV.join(inp.value); this.renderLive();
      };
      inp.onkeydown = (e) => { if (e.key === 'Enter') $('#bLiveJoin2').click(); };
    }
    const x = $('#bLiveX'); if (x) x.onclick = () => { this.click(); LV.close(true); this.toMenu(); };
    const go = $('#bLiveGo'); if (go) go.onclick = () => { this.click(); LV.start(); };
    const retry = $('#bLiveRetry'); if (retry) retry.onclick = () => { this.click(); if (LV.lastRole === 'guest' && LV.lastCode) LV.join(LV.lastCode); else LV.host(); this.renderLive(); };
    const url = LV.code ? LV.link() : '', text = `${t('liveInvite')} ${LV.code}`;
    const wa = $('#bLiveWA'); if (wa) wa.onclick = () => { const a = document.createElement('a'); a.href = IR.mp.whatsapp(url, text); a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); };
    const cp = $('#bLiveCopy'); if (cp) cp.onclick = async () => { const r = await IR.mp.share(url, text); this.toast(r === 'manual' ? url : '🔗 ' + t('linkCopied')); };
  };

  UI.liveEvent = function (ev, data) {
    if (LV.role) { LV.lastRole = LV.role; if (LV.code) LV.lastCode = LV.code; }
    const g = this.g, inRace = g.runOpts && g.runOpts.live && (g.state === 'countdown' || g.state === 'playing' || g.state === 'dying' || g.state === 'revive' || g.state === 'paused');
    switch (ev) {
      case 'code': case 'connecting': case 'friend':
        if (ev === 'friend') IR.audio.play('power');
        if (g.state === 'over' && ev === 'friend') break;
        this.renderLive(); break;
      case 'error':
        this.liveErr = data; if (!inRace && g.state !== 'over') { this.hideAll(); this.show('live'); this.renderLive(); } break;
      case 'friendEnd':
        if (inRace) this.toast(`🏁 ${esc(LV.friend.n)} ${this.tr('isOut')} ${fmt(data.ds)} m`, 'mission');
        if (g.state === 'over') this.renderLiveOver(); break;
      case 'left':
        this.toast('⚠️ ' + this.tr('friendLeft'), 'warn');
        LV.removeGhost();
        if (g.state === 'over' && g.runOpts && g.runOpts.live) this.renderLiveOver();
        else if (!inRace && $('#live').classList.contains('on')) { this.liveErr = 'friendLeft'; LV.st = 'error'; this.renderLive(); }
        break;
    }
  };

  /* 3-2-1-GO over the track */
  UI.countdown = function (t, tick) {
    const el = $('#liveCount'); if (!el) return;
    const n = Math.ceil(t);
    if (tick || !el.textContent) {
      el.textContent = n > 0 ? n : this.tr('go');
      el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
      IR.audio.play(n > 0 ? 'click' : 'power');
      if (n <= 0) setTimeout(() => { el.textContent = ''; el.classList.remove('pop'); }, 700);
    }
  };

  /* live lead / gap in the HUD */
  const hud = UI.hud;
  UI.hud = function (p, g) {
    hud.call(this, p, g);
    if (!(g.runOpts && g.runOpts.live) || !LV.friend) return;
    const f = LV.friend, fd = LV.friendDist(), v = Math.round(p.dist - fd), tag = $('#hTag');
    if (f.end) { tag.textContent = `🏁 ${f.n}: ${fmt(f.end.ds)} m`; tag.className = 'hTag live ' + (p.dist > f.end.ds ? 'good' : 'bad'); }
    else if (!f.last) { tag.textContent = `🔴 ${f.n}`; tag.className = 'hTag live'; }
    else { tag.textContent = `🔴 ${f.n}: ${Math.abs(v)} m ${v >= 0 ? this.tr('ahead') : this.tr('behind')}`; tag.className = 'hTag live ' + (v >= 0 ? 'good' : 'bad'); }
  };

  /* no solo restart in the middle of a live race */
  const show = UI.show;
  UI.show = function (id) {
    show.call(this, id);
    if (id === 'pause') { const r = $('#bRestart'); if (r) r.style.display = this.g.runOpts && this.g.runOpts.live ? 'none' : ''; }
  };

  /* results */
  UI.liveOver = function (p, best) { this.liveBest = best; this.hideAll(); this.renderLiveOver(); this.show('over'); };
  UI.renderLiveOver = function () {
    const t = (k) => this.tr(k), d = this.g.data, mine = LV.myEnd, f = LV.friend, gone = !LV.conn;
    if (!mine) return;
    let verdict = '', cls = '';
    if (f && f.end) {
      if (mine.ds > f.end.ds) { verdict = t('youWin'); cls = 'win'; IR.audio.play('mission'); }
      else if (mine.ds < f.end.ds) { verdict = `${esc(f.n)} ${t('friendWins')}`; cls = 'lose'; }
      else { verdict = t('draw'); cls = 'win'; }
    } else if (gone) verdict = t('friendLeft');
    else verdict = `🔴 ${esc(f ? f.n : '')} ${t('stillRunning')} ${fmt(LV.friendDist())} m`;
    const row = (icon, name, e, live) => `<div class="brow ${e && cls === 'win' && name === (d.name || t('you')) ? 'win' : ''}"><span>${icon}</span><b>${esc(name)}</b><em>${e ? fmt(e.ds) + ' m' : live}</em><small>${e ? fmt(e.sc) : ''}</small></div>`;
    const host = LV.role === 'host' && LV.conn, waitingFriend = f && !f.end && !gone;
    $('#overBody').innerHTML = `<h2>🏁 ${t('liveRace')}</h2>${this.liveBest ? `<div class="newBest">🏆 ${t('newBest')}</div>` : ''}
      <div class="vs ${cls}">${verdict}</div>
      <div class="board">${row(charIcon(d.char), d.name || t('you'), mine)}${f ? row(charIcon(f.ch), f.n, f.end, gone ? '—' : '🔴 ' + fmt(LV.friendDist()) + ' m') : ''}</div>
      ${host ? `<button class="cta" id="bRematch" ${waitingFriend ? 'disabled' : ''}>🔁 ${t('rematch')}</button>` : LV.conn ? `<p class="waiting"><span class="dots3"><i></i><i></i><i></i></span> ${t('waitRematch')}</p>` : ''}
      <button class="ghost" id="bLiveLeave">${t('leave')}</button>`;
    const rm = $('#bRematch'); if (rm) rm.onclick = () => { this.click(); LV.start(); };
    $('#bLiveLeave').onclick = () => { this.click(); this.g.toMenu(); };
    // keep the friend's live distance ticking while they are still running
    clearTimeout(this.liveOverT);
    if (waitingFriend) this.liveOverT = setTimeout(() => { if (this.g.state === 'over' && this.g.runOpts && this.g.runOpts.live) this.renderLiveOver(); }, 500);
  };
})();
