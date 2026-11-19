/* Premium UI: menu, city chooser, runners, treasures passport, daily, multiplayer, shop, settings, HUD, cards */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
  const fmt = (n) => Math.floor(n).toLocaleString('en-IN');
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const UI = (IR.ui = {
    lang: 'en',
    tr(k) { return (IR.STR[this.lang] && IR.STR[this.lang][k]) || IR.STR.en[k] || k; },
    L(o) { return (o && (o[this.lang] || o.en)) || ''; },

    build(game) {
      this.g = game; this.lang = game.data.settings.lang;
      $('#ui').innerHTML = `
      <div id="menu" class="screen">
        <div class="topbar">
          <button class="chip lvl" data-go="daily"><span class="av">🏅</span><span><b data-t="level"></b> <b id="mLvl">1</b> <small>x<span id="mMult">1</span></small></span></button>
          <div class="chip coins"><span>🪙</span><b id="mCoins">0</b></div>
          <button class="iconbtn" data-go="settings" aria-label="Settings">⚙️</button>
        </div>
        <div class="logo"><div class="l1">INDIA RUN</div><div class="l2" data-t="subtitle"></div></div>
        <div class="menuBody">
          <div class="cityHero" id="cityHero">
            <button class="arrow" id="cPrevCity" aria-label="Previous city">‹</button>
            <div class="chInfo"><div class="chTop"><span id="mCityIcon"></span><b id="mCity"></b><i class="lock" id="mLock">🔒</i></div><small id="mCityTag"></small><div class="chMon" id="mMon"></div></div>
            <button class="arrow" id="cNextCity" aria-label="Next city">›</button>
          </div>
          <button class="festStrip" id="festStrip"></button>
          <div class="pills" id="modes"></div>
          <div class="festPick" id="festPick"></div>
          <div class="runWrap"><div class="runRing"></div><div class="runRing r2"></div>
            <button class="runBtn" id="bPlay"><span class="rl" data-t="play"></span><span class="rs" id="runSub"></span></button></div>
        </div>
        <nav class="nav">
          <button data-go="chars"><span>🧍</span><small data-t="runners"></small></button>
          <button data-go="passport"><span>🏺</span><small data-t="treasures"></small></button>
          <button data-go="daily"><span>🎯</span><small data-t="dailyT"></small><i class="badge" id="dailyBadge"></i></button>
          <button data-go="multi"><span>👥</span><small data-t="multiplayer"></small></button>
          <button data-go="shop"><span>🛒</span><small data-t="shop"></small></button>
        </nav>
      </div>
      <div id="chars" class="screen">
        <div class="topbar"><button class="chip" data-back>‹ <span data-t="back"></span></button><div class="chip coins"><span>🪙</span><b class="bank">0</b></div></div>
        <div class="sheet charSheet">
          <div class="charNav"><button id="cPrev">‹</button><div><h2 id="cName"></h2><small id="cFrom"></small><div class="dots" id="cDots"></div></div><button id="cNext">›</button></div>
          <div class="outfits" id="cOutfits"></div>
          <button class="cta" id="cAction"></button>
        </div>
      </div>
      ${['passport', 'daily', 'multi', 'shop', 'settings'].map((id) => `<div id="${id}" class="screen panelScreen"><div class="panel"><div class="ph"><h2 data-t="${{ passport: 'collection', daily: 'dailyT', multi: 'multiplayer', shop: 'shop', settings: 'settings' }[id]}"></h2><div class="chip coins sm"><span>🪙</span><b class="bank">0</b></div><button class="x" data-back>✕</button></div><div class="pbody" id="${id}Body"></div></div></div>`).join('')}
      <div id="unlock" class="screen panelScreen"><div class="panel narrow" id="unlockBody"></div></div>
      <div id="incoming" class="screen panelScreen"><div class="panel narrow" id="incomingBody"></div></div>
      <div id="hud" class="screen">
        <div class="hudTop">
          <div class="hLeft"><div class="hScore"><b id="hScore">0</b><small><span id="hDist">0</span> m · <span class="mult" id="hMult">x1</span></small></div><div class="hLives" id="hLives"></div></div>
          <div class="hMid"><div class="hTimer" id="hTimer"></div><div class="hTag" id="hTag"></div></div>
          <div class="hRight"><div class="chip coins"><span>🪙</span><b id="hCoins">0</b></div><div class="chip tok" id="hTok"></div><button class="pauseBtn" id="bPause" aria-label="Pause">❚❚</button></div>
        </div>
        <div class="powers" id="hPowers"></div>
        <div class="turnHint" id="turnHint"></div>
        <div class="tut" id="tut"></div>
        <div class="fact" id="fact"></div>
      </div>
      <div id="pause" class="screen panelScreen"><div class="panel narrow"><h2 data-t="pause"></h2><button class="cta" id="bResume"></button><button class="ghost" id="bRestart"></button><button class="ghost" id="bHome"></button>
        <div class="row"><label data-t="music"></label><button class="tog" id="pMusic"></button></div><div class="row"><label data-t="sfx"></label><button class="tog" id="pSfx"></button></div></div></div>
      <div id="revive" class="screen panelScreen"><div class="panel narrow"><h2 data-t="reviveQ"></h2><div class="ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" class="trk"/><circle cx="50" cy="50" r="44" class="bar" id="rvBar"/></svg><b id="rvNum">5</b></div><button class="cta" id="bRevive"></button><button class="ghost" id="bSkip"></button></div></div>
      <div id="over" class="screen panelScreen"><div class="panel narrow" id="overBody"></div></div>
      <div id="toasts"></div>
      <div id="cityBanner"></div>
      <div id="popCard"></div>`;
      this.applyLang();
      const modes = $('#modes');
      for (const m of ['yatra', 'city', 'festival', 'timed', 'daily']) {
        const b = h('button', 'pill', `<b>${{ yatra: '🗺️', city: '🏙️', festival: '🎉', timed: '⏱️', daily: '📅' }[m]}</b><span>${this.tr(m)}</span>`);
        b.dataset.mode = m; b.onclick = () => { this.click(); this.setMode(m); };
        modes.appendChild(b);
      }
      $('#bPlay').onclick = () => this.play();
      $('#cPrevCity').onclick = () => this.stepCity(-1);
      $('#cNextCity').onclick = () => this.stepCity(1);
      $('#festStrip').onclick = () => { this.click(); game.data.festival = IR.festivalOfDay(); this.setMode('festival'); };
      $('#ui').querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => this.open(b.dataset.go)));
      $('#ui').querySelectorAll('[data-back]').forEach((b) => (b.onclick = () => this.back()));
      $('#bPause').onclick = () => game.pause();
      $('#bResume').onclick = () => game.resume();
      $('#bRestart').onclick = () => { this.hideAll(); IR.audio.ctx && IR.audio.ctx.resume(); IR.audio.stopMusic(); game.startRun(game.mode, game.runOpts); };
      $('#bHome').onclick = () => game.toMenu();
      $('#bSkip').onclick = () => { clearInterval(this.rvTimer); this.hide('revive'); game.gameOver(); };
      $('#cPrev').onclick = () => this.charStep(-1);
      $('#cNext').onclick = () => this.charStep(1);
      $('#pMusic').onclick = () => { const s = game.data.settings; s.music = !s.music; game.applySettings(); IR.progress.save(); this.togs(); };
      $('#pSfx').onclick = () => { const s = game.data.settings; s.sfx = !s.sfx; game.applySettings(); IR.progress.save(); this.togs(); };
      this.stack = [];
      this.toMenu();
      const inc = IR.mp.parseLink(location.hash);
      if (inc) { IR.mp.challenge = inc; setTimeout(() => this.incoming(inc), 400); }
    },
    applyLang() {
      document.querySelectorAll('[data-t]').forEach((e) => (e.textContent = this.tr(e.dataset.t)));
      const set = (id, k) => { const e = $(id); if (e) e.textContent = this.tr(k); };
      set('#bResume', 'resume'); set('#bRestart', 'restart'); set('#bHome', 'home'); set('#bSkip', 'skip');
      document.querySelectorAll('.pill').forEach((b) => (b.querySelector('span').textContent = this.tr(b.dataset.mode)));
      document.documentElement.lang = this.lang;
    },
    click() { IR.audio.init(); IR.audio.play('click'); },
    show(id) { $('#' + id).classList.add('on'); },
    hide(id) { $('#' + id).classList.remove('on'); },
    hideAll() { document.querySelectorAll('.screen').forEach((s) => s.classList.remove('on')); },
    open(id) {
      this.click(); this.stack.push(id);
      if (id === 'chars') { this.hide('menu'); this.g.state = 'select'; this.charIdx = Math.max(0, IR.CHARS.findIndex((c) => c.id === this.g.data.char)); this.outfitIdx = this.g.data.outfit; this.renderChar(); }
      const r = { passport: 'renderPassport', daily: 'renderDaily', multi: 'renderMulti', shop: 'renderShop', settings: 'renderSettings' }[id];
      if (r) this[r]();
      this.show(id); this.updateBank();
    },
    back() {
      this.click();
      const id = this.stack.pop(); if (id) this.hide(id);
      if (id === 'chars') { this.g.previewChar = undefined; this.g.previewOutfit = undefined; this.g.makeRunner(); this.g.state = 'menu'; this.show('menu'); }
      this.refreshMenu();
    },
    toMenu() { this.hideAll(); this.stack = []; this.show('menu'); this.refreshMenu(); },
    updateBank() { document.querySelectorAll('.bank').forEach((e) => (e.textContent = fmt(this.g.data.coins))); },

    /* ---------- menu ---------- */
    setMode(m) {
      const g = this.g, d = g.data; d.mode = m; IR.progress.save();
      const fest = m === 'festival' ? d.festival : null;
      if ((g.festival || null) !== fest) { g.festival = fest; g.setupWorld(); g.snapCamera(); }
      this.refreshMenu();
    },
    stepCity(dir) {
      this.click();
      const d = this.g.data, L = IR.CITY_ORDER, i = (L.indexOf(d.city) + dir + L.length) % L.length;
      d.city = L[i]; IR.progress.save();
      this.g.setupWorld(); this.g.snapCamera(); this.refreshMenu();
    },
    play() {
      const g = this.g, d = g.data;
      if (d.mode !== 'daily' && !IR.progress.isUnlocked(d.city)) return this.unlockPrompt(d.city);
      this.click(); this.hideAll();
      if (d.mode === 'festival') g.startRun('festival', { festival: d.festival });
      else g.startRun(d.mode);
    },
    unlockPrompt(id) {
      const th = IR.THEMES[id], P = IR.progress, d = this.g.data;
      $('#unlockBody').innerHTML = `<div class="bigIcon">${th.icon}</div><h2>${esc(th.names[this.lang])}</h2><p class="muted">🔒 ${this.tr('reachYatra')}</p>
        <button class="cta" id="uBuy">${this.tr('unlockFor')} · 🪙 ${P.CITY_PRICE}</button><button class="ghost" id="uYatra">🗺️ ${this.tr('yatra')}</button><button class="ghost" id="uNo">${this.tr('back')}</button>`;
      this.show('unlock');
      $('#uBuy').onclick = () => { if (d.coins < P.CITY_PRICE) return this.toast(this.tr('notEnough'), 'warn'); d.coins -= P.CITY_PRICE; P.unlock(id); IR.audio.play('power'); this.hide('unlock'); this.toast('🔓 ' + this.tr('cityUnlocked') + ' ' + th.names[this.lang], 'mission'); this.refreshMenu(); };
      $('#uYatra').onclick = () => { this.hide('unlock'); d.city = IR.progress.unlockedList()[0]; this.setMode('yatra'); this.g.setupWorld(); this.g.snapCamera(); this.refreshMenu(); };
      $('#uNo').onclick = () => this.hide('unlock');
    },
    refreshMenu() {
      const d = this.g.data, th = IR.THEMES[d.city], P = IR.progress, un = P.isUnlocked(d.city);
      $('#mCoins').textContent = fmt(d.coins); $('#mLvl').textContent = d.mLevel + 1; $('#mMult').textContent = P.multiplier();
      $('#mCity').textContent = th.names[this.lang]; $('#mCityTag').textContent = th.tag[this.lang]; $('#mCityIcon').textContent = th.icon;
      $('#mLock').style.display = un ? 'none' : 'inline';
      const cul = IR.CULTURE[d.city];
      $('#mMon').innerHTML = cul && cul.mon.length ? cul.mon.map((m) => `<span>🏛️ ${esc(this.L(IR.MON[m.k].name))}</span>`).join('') : `<span>🏺 ${cul ? cul.tr.length : 0} ${this.tr('treasures')}</span>`;
      const hero = $('#cityHero');
      hero.style.setProperty('--c1', th.card[0]); hero.style.setProperty('--c2', th.card[1]); hero.style.setProperty('--c3', th.card[2]);
      hero.classList.toggle('isLocked', !un);
      document.querySelectorAll('.pill').forEach((b) => b.classList.toggle('sel', b.dataset.mode === d.mode));
      const tf = IR.FESTIVALS[IR.festivalOfDay()];
      $('#festStrip').innerHTML = `<span class="fi">${tf.icon}</span><span class="ft"><small>${this.tr('todayFest')}</small><b>${this.L(tf.name)}</b></span><span class="go">${this.tr('playFestival')} ›</span>`;
      const fp = $('#festPick'); fp.innerHTML = '';
      fp.style.display = d.mode === 'festival' ? 'flex' : 'none';
      for (const k of IR.FEST_ORDER) { const f = IR.FESTIVALS[k], b = h('button', 'fchip' + (d.festival === k ? ' sel' : ''), `${f.icon} ${this.L(f.name)}`); b.onclick = () => { this.click(); d.festival = k; this.g.festival = null; this.setMode('festival'); }; fp.appendChild(b); }
      const ch = P.challenge();
      const sub = d.mode === 'daily' ? `📅 ${IR.THEMES[ch.city].names[this.lang]} · ${IR.FESTIVALS[ch.festival].icon}` : d.mode === 'festival' ? `${IR.FESTIVALS[d.festival].icon} ${this.L(IR.FESTIVALS[d.festival].name)} · ${th.names[this.lang]}` : `${this.tr(d.mode)} · ${th.names[this.lang]}`;
      $('#runSub').textContent = !un && d.mode !== 'daily' ? '🔒 ' + this.tr('unlockFor') + ' · 🪙 ' + P.CITY_PRICE : sub;
      $('#bPlay').classList.toggle('lockedRun', !un && d.mode !== 'daily');
      const dc = P.dailyChallenges();
      $('#dailyBadge').style.display = P.dailyState().can || dc.claimed.length < 3 ? 'block' : 'none';
      this.updateBank();
    },

    /* ---------- runners ---------- */
    charStep(dir) { this.click(); this.charIdx = (this.charIdx + dir + IR.CHARS.length) % IR.CHARS.length; this.outfitIdx = 0; const c = IR.CHARS[this.charIdx]; if (this.g.data.char === c.id) this.outfitIdx = this.g.data.outfit; this.renderChar(); },
    renderChar() {
      const c = IR.CHARS[this.charIdx], d = this.g.data;
      this.g.previewChar = c.id; this.g.previewOutfit = this.outfitIdx; this.g.makeRunner();
      if (!IR.Avatars.models[c.id]) IR.Avatars.ensure(c.id);
      $('#cName').textContent = c.name[this.lang]; $('#cFrom').textContent = (c.animal ? '🐾 ' : '📍 ') + c.from[this.lang];
      $('#cDots').innerHTML = IR.CHARS.map((x, i) => `<i class="${i === this.charIdx ? 'on' : ''}"></i>`).join('');
      const box = $('#cOutfits'); box.innerHTML = '';
      c.outfits.forEach((o, i) => {
        const b = h('button', 'outfit' + (i === this.outfitIdx ? ' sel' : ''), `<span class="sw" style="background:linear-gradient(135deg,${o.top} 0 40%,${o.scarf} 40% 65%,${o.bottom} 65%)"></span><small>${esc(o.name[this.lang])}</small>`);
        b.onclick = () => { this.click(); this.outfitIdx = i; this.renderChar(); };
        box.appendChild(b);
      });
      const isSel = d.char === c.id && d.outfit === this.outfitIdx, act = $('#cAction');
      act.classList.toggle('done', isSel);
      act.textContent = isSel ? '✓ ' + this.tr('selected') : this.tr('select');
      act.onclick = () => { if (isSel) return; this.click(); d.char = c.id; d.outfit = this.outfitIdx; IR.progress.save(); this.renderChar(); };
    },

    /* ---------- treasure passport ---------- */
    renderPassport() {
      const d = this.g.data, box = $('#passportBody');
      const total = IR.CITY_ORDER.reduce((a, id) => a + IR.CULTURE[id].tr.length, 0);
      let html = `<div class="sumRow"><div><b>${IR.progress.treasureCount()}</b><small>/ ${total} ${this.tr('treasures')}</small></div><div><b>${Object.keys(d.facts).length}</b><small>${this.tr('factsFound')}</small></div><div><b>${Object.keys(d.visited).length}</b><small>/ 15 🏙️</small></div></div><div class="pgrid">`;
      for (const id of IR.CITY_ORDER) {
        const th = IR.THEMES[id], cul = IR.CULTURE[id], un = IR.progress.isUnlocked(id);
        const items = cul.tr.map(([e, n], i) => { const got = d.treasures[id + ':' + i]; return `<span class="ti ${got ? 'got' : ''}" title="${esc(this.L(n))}">${got ? e : '❔'}<small>${got ? esc(this.L(n)) : '???'}</small></span>`; }).join('');
        const facts = cul.facts.filter((f, i) => d.facts[id + ':' + i]).map((f) => `<p>💡 ${esc(this.L(f))}</p>`).join('');
        html += `<div class="pcard ${d.visited[id] ? 'stamped' : ''}" style="--c1:${th.card[0]};--c2:${th.card[1]}"><div class="pt"><span>${th.icon}</span><b>${esc(th.names[this.lang])}</b>${un ? '' : '<i>🔒</i>'}${d.visited[id] ? '<em>✔</em>' : ''}</div><div class="titems">${items}</div>${facts}</div>`;
      }
      box.innerHTML = html + '</div>';
    },

    /* ---------- daily ---------- */
    renderDaily() {
      const P = IR.progress, d = this.g.data, dc = P.dailyChallenges(), box = $('#dailyBody');
      const tasks = dc.tasks.map((t, i) => { const v = Math.min(t.n, dc.prog[t.id] || 0), done = dc.claimed.includes(i); return `<div class="task ${done ? 'done' : ''}"><span class="big">${done ? '✅' : '🎯'}</span><div class="grow"><b>${esc(P.dcText(t, this.lang))}</b><div class="bar"><i style="width:${(v / t.n) * 100}%"></i></div><small>${fmt(v)} / ${fmt(t.n)} · 🪙 100</small></div></div>`; }).join('');
      const st = P.dailyState();
      const days = P.DAILY.map((a, i) => `<div class="dayc ${i < st.day ? 'got' : i === st.day && st.can ? 'today' : ''}"><small>${this.tr('day')} ${i + 1}</small><span>${i === 6 ? '💰' : '🪙'}</span><b>${a}</b></div>`).join('');
      box.innerHTML = `<h3>${this.tr('dailyChallenges')} <small class="muted">🔥 ${dc.streak || 0} ${this.tr('streak')}</small></h3>${tasks}
        <div class="chestRow ${dc.chest ? 'done' : ''}"><span>🎁</span><b>${this.tr('chest')}</b><small>${dc.claimed.length}/3 · 🪙 300</small></div>
        <h3>${this.tr('loginReward')}</h3><div class="days">${days}</div><button class="cta sm ${st.can ? '' : 'done'}" id="bClaim">${st.can ? this.tr('claim') + ' 🪙 ' + P.DAILY[st.day] : this.tr('claimed')}</button>
        <h3>${this.tr('missionsT')} · ${this.tr('level')} ${d.mLevel + 1} · x${P.multiplier()}</h3>${d.missions.map((m) => `<div class="task ${m.done ? 'done' : ''}"><span class="big">${m.done ? '✅' : '⭐'}</span><div class="grow"><b>${esc(P.missionText(m, this.lang))}</b><small>🪙 ${50 * (d.mLevel + 1)}</small></div></div>`).join('')}
        <h3>${this.tr('achievements')}</h3><div class="achGrid">${P.ACH.map((a) => `<div class="ach ${d.ach[a.id] ? 'on' : ''}"><span>${a.icon}</span><small>${esc(a.t[this.lang] || a.t.en)}</small></div>`).join('')}</div>`;
      $('#bClaim').onclick = () => { const a = P.claimDaily(); if (a) { IR.audio.play('mission'); this.toast('🎁 +' + a + ' 🪙'); this.renderDaily(); this.refreshMenu(); } };
    },

    /* ---------- multiplayer ---------- */
    renderMulti() {
      const d = this.g.data, box = $('#multiBody');
      this.partyN = this.partyN || 2;
      const pl = this.tr('players');
      box.innerHTML = `<div class="mcard"><div class="mh"><span>👻</span><b>${this.tr('challengeFriend')}</b></div><p class="muted">${this.tr('challengeDesc')}</p><p class="tip">${this.tr('lastRun')}</p>
          <label class="field"><small>${this.tr('yourName')}</small><input id="myName" maxlength="14" value="${esc(d.name || '')}" placeholder="Saurabh"></label></div>
        <div class="mcard"><div class="mh"><span>📱</span><b>${this.tr('passPlay')}</b></div><p class="muted">${this.tr('passDesc')}</p>
          <div class="row"><label>${pl}</label><div class="seg" id="pn">${[2, 3, 4].map((n) => `<button class="${n === this.partyN ? 'sel' : ''}" data-n="${n}">${n}</button>`).join('')}</div></div>
          <div id="pnames">${Array.from({ length: this.partyN }, (_, i) => `<input class="pname" maxlength="12" value="P${i + 1}">`).join('')}</div>
          <button class="cta" id="bParty">▶ ${this.tr('start')}</button></div>`;
      $('#myName').onchange = (e) => { d.name = e.target.value.trim().slice(0, 14); IR.progress.save(); };
      box.querySelectorAll('#pn button').forEach((b) => (b.onclick = () => { this.click(); this.partyN = +b.dataset.n; this.renderMulti(); }));
      $('#bParty').onclick = () => {
        const names = [...box.querySelectorAll('.pname')].map((i, k) => i.value.trim() || 'P' + (k + 1));
        const seed = (Math.random() * 1e9) | 0, city = IR.progress.isUnlocked(d.city) ? d.city : 'varanasi';
        IR.mp.startParty(names, { seed, city, festival: d.mode === 'festival' ? d.festival : null });
        this.stack = [];
        this.partyNext();
      };
    },
    partyNext() {
      const P = IR.mp.party, pl = P.players[P.turn];
      this.hideAll();
      $('#overBody').innerHTML = `<div class="bigIcon">📱</div><h2>${esc(pl.name)}</h2><p class="muted">${this.tr('turn2')} · ${P.turn + 1}/${P.players.length}</p><button class="cta" id="bGo">▶ ${this.tr('play')}</button>`;
      this.show('over');
      $('#bGo').onclick = () => { this.hideAll(); this.g.startRun('city', { seed: P.opts.seed, city: P.opts.city, festival: P.opts.festival }); };
    },
    partyTurnOver() {
      const P = IR.mp.party, done = IR.mp.partyDone();
      const rows = P.players.map((x) => Object.assign({}, x)).sort((a, b) => (b.score === null ? -1 : b.score) - (a.score === null ? -1 : a.score));
      this.hideAll();
      $('#overBody').innerHTML = `<h2>${done ? '🏆 ' + this.tr('results') : this.tr('gameOver')}</h2>
        <div class="board">${rows.map((x, i) => `<div class="brow ${done && i === 0 ? 'win' : ''}"><span>${['🥇', '🥈', '🥉', '4️⃣'][i]}</span><b>${esc(x.name)}</b><em>${x.score === null ? '—' : fmt(x.score)}</em></div>`).join('')}</div>
        ${done ? `<p class="winTxt">🎉 ${this.tr('winner')}: ${esc(rows[0].name)}</p><button class="cta" id="bPA">🔁 ${this.tr('playAgain')}</button><button class="ghost" id="bPH">${this.tr('home')}</button>` : `<button class="cta" id="bPN">${this.tr('nextPlayer')}: ${esc(P.players[P.turn].name)} ›</button>`}`;
      this.show('over');
      if (done) { $('#bPA').onclick = () => { IR.mp.startParty(P.players.map((x) => x.name), Object.assign({}, P.opts, { seed: (Math.random() * 1e9) | 0 })); this.partyNext(); }; $('#bPH').onclick = () => this.g.toMenu(); }
      else $('#bPN').onclick = () => this.partyNext();
    },
    /* a runner model finished loading in the background: swap it in if it is the one on screen */
    onAvatarLoaded(id) {
      const g = this.g; if (!g || !(g.state === 'menu' || g.state === 'select' || g.state === 'over')) return;
      if ((g.previewChar || g.data.char) === id && !(g.runner instanceof IR.AvatarRunner || g.runner instanceof IR.AnimalRunner)) g.makeRunner();
    },
    incoming(info) {
      if (info && info.ch) IR.Avatars.ensure(info.ch);
      const th = IR.THEMES[info.c] || IR.THEMES.varanasi;
      $('#incomingBody').innerHTML = `<div class="bigIcon">👻</div><h2>${esc(info.n || 'Friend')} ${this.tr('challenges')}</h2>
        <p class="muted">${th.icon} ${th.names[this.lang]}${info.f && IR.FESTIVALS[info.f] ? ' · ' + IR.FESTIVALS[info.f].icon : ''}</p><div class="stats two"><div><small>${this.tr('beat')}</small><b>${fmt(info.sc || 0)}</b></div><div><small>${this.tr('distance')}</small><b>${fmt(info.ds || 0)} m</b></div></div>
        <button class="cta" id="bAcc">⚔️ ${this.tr('accept')}</button><button class="ghost" id="bLat">${this.tr('later')}</button>`;
      this.hideAll(); this.show('incoming');
      $('#bAcc').onclick = () => { this.hideAll(); try { history.replaceState(null, '', location.href.split('#')[0]); } catch (e) {} this.g.startRun(info.m === 'yatra' ? 'yatra' : 'city', { seed: info.s, city: info.c, festival: info.f || null, ghost: info, versus: info }); };
      $('#bLat').onclick = () => { IR.mp.challenge = null; this.toMenu(); };
    },

    /* ---------- shop ---------- */
    renderShop() {
      const list = $('#shopBody'); list.innerHTML = '';
      const d = this.g.data;
      for (const k of Object.keys(IR.POWERS)) {
        const lv = d.upgrades[k] || 0, cost = IR.progress.upCost(k);
        const row = h('div', 'item', `<span class="big">${IR.POWERS[k].icon}</span><div class="grow"><b>${this.tr(k)}</b><small>${this.tr('upDesc')} · ${IR.progress.duration(k).toFixed(1)}s</small><div class="pips">${[0, 1, 2, 3, 4].map((i) => `<i class="${i < lv ? 'on' : ''}"></i>`).join('')}</div></div>`);
        const b = h('button', 'buy' + (lv >= 5 ? ' maxed' : ''), lv >= 5 ? this.tr('max') : `🪙 ${fmt(cost)}`);
        b.onclick = () => {
          if (lv >= 5) return;
          if (d.coins < cost) { this.toast(this.tr('notEnough'), 'warn'); return; }
          d.coins -= cost; d.upgrades[k] = lv + 1; IR.progress.save(); IR.audio.play('power'); this.renderShop(); this.updateBank();
        };
        row.appendChild(b); list.appendChild(row);
      }
    },

    /* ---------- settings ---------- */
    renderSettings() {
      const g = this.g, s = g.data.settings, list = $('#settingsBody');
      const seg = (label, opts, cur, fn) => { const r = h('div', 'row', `<label>${label}</label>`), w = h('div', 'seg'); opts.forEach(([v, t]) => { const b = h('button', v === cur ? 'sel' : '', t); b.onclick = () => { this.click(); fn(v); this.renderSettings(); }; w.appendChild(b); }); r.appendChild(w); return r; };
      list.innerHTML = '';
      list.appendChild(seg(this.tr('quality'), [['low', this.tr('low')], ['med', this.tr('med')], ['high', this.tr('high')]], s.quality, (v) => { s.quality = v; s.manualQ = true; g.applySettings(); IR.progress.save(); }));
      const fr = h('div', 'row', `<label>${this.tr('fov')} <b>${s.fov}°</b></label>`), sl = h('input'); sl.type = 'range'; sl.min = 55; sl.max = 90; sl.value = s.fov;
      sl.oninput = () => { s.fov = +sl.value; fr.querySelector('b').textContent = s.fov + '°'; }; sl.onchange = () => IR.progress.save(); fr.appendChild(sl); list.appendChild(fr);
      list.appendChild(seg(this.tr('music'), [[true, this.tr('on')], [false, this.tr('off')]], s.music, (v) => { s.music = v; g.applySettings(); IR.progress.save(); }));
      list.appendChild(seg(this.tr('sfx'), [[true, this.tr('on')], [false, this.tr('off')]], s.sfx, (v) => { s.sfx = v; g.applySettings(); IR.progress.save(); }));
      list.appendChild(seg(this.tr('allCities'), [[true, this.tr('on')], [false, this.tr('off')]], !!s.allCities, (v) => { s.allCities = v; IR.progress.save(); this.refreshMenu(); }));
      list.appendChild(h('div', 'note small', this.tr('allCitiesD')));
      list.appendChild(seg(this.tr('language'), [['en', 'English'], ['hi', 'हिन्दी'], ['gu', 'ગુજરાતી']], s.lang, (v) => { s.lang = v; this.lang = v; IR.progress.save(); this.applyLang(); this.refreshMenu(); }));
      list.appendChild(h('div', 'note', `<b>${this.tr('controls')}</b><br>${this.tr('ctrlText')}`));
      const rs = h('button', 'ghost danger', this.tr('reset'));
      rs.onclick = () => {
        const c = h('div', 'confirm', `<span>${this.tr('resetQ')}</span>`); rs.replaceWith(c);
        const y = h('button', 'ghost danger', this.tr('yes')), n = h('button', 'ghost', this.tr('no'));
        y.onclick = () => { IR.progress.reset(); g.data = IR.progress.data; this.lang = g.data.settings.lang; g.applySettings(); g.makeRunner(); this.applyLang(); this.renderSettings(); this.refreshMenu(); };
        n.onclick = () => this.renderSettings(); c.append(y, n);
      };
      list.appendChild(rs);
      list.appendChild(h('div', 'note small', this.tr('placeholder') + ` · Rocketbox avatars & mocap (MIT) · monuments modelled in Blender · ${this.tr('fps')}: ${Math.round(g.fps)}`));
    },
    togs() { const s = this.g.data.settings; $('#pMusic').textContent = s.music ? this.tr('on') : this.tr('off'); $('#pSfx').textContent = s.sfx ? this.tr('on') : this.tr('off'); $('#pMusic').classList.toggle('sel', s.music); $('#pSfx').classList.toggle('sel', s.sfx); },

    /* ---------- HUD ---------- */
    showHUD(p, g) {
      this.hideAll(); this.show('hud');
      $('#hTimer').style.display = g.mode === 'timed' ? 'block' : 'none';
      $('#hMult').textContent = 'x' + g.mult; $('#hPowers').innerHTML = ''; this.powerEls = {};
      $('#hTok').style.display = g.festival ? 'flex' : 'none';
      const party = IR.mp.party;
      $('#hTag').textContent = party ? '📱 ' + party.players[party.turn].name : ''; $('#hTag').className = 'hTag';
      this.cityBanner(g.run.theme);
      this.togs();
    },
    hud(p, g) {
      if (this.livesShown !== p.lives || this.livesRun !== p) { this.livesShown = p.lives; this.livesRun = p; const L = $('#hLives'); L.innerHTML = Array.from({ length: IR.FREE_LIVES }, (_, i) => `<i class="${i < p.lives ? 'on' : ''}">${i < p.lives ? '❤️' : '🤍'}</i>`).join(''); }
      $('#hScore').textContent = fmt(p.score); $('#hDist').textContent = fmt(p.dist); $('#hCoins').textContent = fmt(p.coins);
      $('#hMult').textContent = 'x' + g.mult * (p.pw.multi > 0 ? 2 : 1);
      if (g.festival) $('#hTok').innerHTML = `<span>${IR.FESTIVALS[g.festival].token}</span><b>${p.tokens}</b>`;
      if (g.mode === 'timed') { const t = Math.ceil(p.timeLeft); $('#hTimer').textContent = Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); $('#hTimer').classList.toggle('low', t <= 10); }
      const G = IR.mp.ghost;
      if (G && G.lead !== undefined) { const v = Math.round(G.lead); $('#hTag').textContent = `👻 ${G.name}: ${Math.abs(v)} m ${v >= 0 ? this.tr('ahead') : this.tr('behind')}`; $('#hTag').className = 'hTag ' + (v >= 0 ? 'good' : 'bad'); }
      for (const k in p.pw) {
        const v = p.pw[k]; let el = this.powerEls[k];
        if (v > 0 && !el) { el = this.powerEls[k] = h('div', 'pw', `<span>${IR.POWERS[k].icon}</span><div class="pb"><i style="background:${IR.POWERS[k].col}"></i></div>`); el.dataset.max = v; $('#hPowers').appendChild(el); }
        if (el) { if (v <= 0) { el.remove(); delete this.powerEls[k]; } else el.querySelector('i').style.width = (v / el.dataset.max) * 100 + '%'; }
      }
      const run = g.run, show = !p.turnQ && p.d > run.L - 17 && p.d < run.L + 3;
      const th = $('#turnHint');
      if (show !== this._turnShow || run.turn !== this._turnDir) {
        this._turnShow = show; this._turnDir = run.turn;
        th.className = 'turnHint' + (show ? ' on' : '') + (run.turn < 0 ? ' left' : ' right');
        th.innerHTML = show ? `<span>${run.turn < 0 ? '⬅' : '➡'}</span><b>${this.tr('turn')}</b>` : '';
      }
    },
    powerToast(k) { this.toast(IR.POWERS[k].icon + ' ' + this.tr(k), 'power'); },
    toast(text, kind = '') {
      const t = h('div', 'toast ' + kind, esc(text)); $('#toasts').appendChild(t);
      while ($('#toasts').children.length > 3) $('#toasts').firstChild.remove();
      setTimeout(() => t.classList.add('out'), 2200); setTimeout(() => t.remove(), 2700);
    },
    cityBanner(th) {
      const b = $('#cityBanner');
      b.innerHTML = `<small>${this.tr('welcome')}</small><b>${th.icon} ${th.names[this.lang]}</b><i>${th.tag[this.lang]}</i>`;
      b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
    },
    factCard(th, fact, mon) {
      const f = $('#fact');
      f.innerHTML = `<div class="fh"><span>💡</span><b>${this.tr('dyk')}</b><em>${th.icon} ${esc(th.names[this.lang])}</em></div>${mon ? `<div class="fm">🏛️ ${esc(this.L(mon.name))}</div>` : ''}<p>${esc(this.L(fact))}</p>`;
      f.classList.remove('on'); void f.offsetWidth; f.classList.add('on');
      clearTimeout(this.factT); this.factT = setTimeout(() => f.classList.remove('on'), 6500);
    },
    pop(html, ms = 2600) {
      const c = $('#popCard'); c.innerHTML = html; c.classList.remove('on'); void c.offsetWidth; c.classList.add('on');
      clearTimeout(this.popT); this.popT = setTimeout(() => c.classList.remove('on'), ms);
    },
    treasureCard(item, isNew, th) { this.pop(`<div class="pi">${item[0]}</div><small>${this.tr('treasureFound')} · ${th.icon} ${esc(th.names[this.lang])}</small><b>${esc(this.L(item[1]))}</b>${isNew ? `<em>${this.tr('newItem')} +150 🪙</em>` : '<em>+40 🪙</em>'}`); },
    festivalCard(k) { const f = IR.FESTIVALS[k]; this.pop(`<div class="pi">${f.icon}</div><small>${this.tr('festival')}</small><b>${esc(this.L(f.name))}</b><p>${esc(this.L(f.fact))}</p><em>${f.token} ${esc(this.L(f.tokenName))}</em>`, 3200); },
    tutorial() {
      const t = $('#tut'); this.tutStep = 0;
      const steps = ['t1', 't2', 't3', 't4'];
      const next = () => { if (this.tutStep >= steps.length) { t.classList.remove('on'); return; } t.textContent = this.tr(steps[this.tutStep]); t.classList.add('on'); };
      this.tutNext = () => { this.tutStep++; next(); };
      setTimeout(next, 1500);
    },
    tutorialAction(a) {
      if (this.tutStep === undefined || this.tutStep > 3) return;
      const want = ['left|right', 'up', 'down', 'left|right'][this.tutStep];
      if (want.split('|').includes(a) && $('#tut').classList.contains('on')) this.tutNext();
    },
    lifeUsed(left) {
      this.livesShown = -1;
      const L = $('#hLives'); L.classList.remove('hit'); void L.offsetWidth; L.classList.add('hit');
      this.toast(left > 0 ? `❤️ ${this.tr('freeLife')} · ${left} ${this.tr('livesLeft')}` : `💔 ${this.tr('lastLife')}`, left > 0 ? 'mission' : 'warn');
      IR.audio.play('power');
    },
    revive(cost, can) {
      this.show('revive');
      $('#bRevive').innerHTML = `${this.tr('cont')} · 🪙 ${fmt(cost)}`;
      $('#bRevive').classList.toggle('done', !can);
      let n = 5; $('#rvNum').textContent = n; const bar = $('#rvBar'); bar.style.transition = 'none'; bar.style.strokeDashoffset = 0;
      requestAnimationFrame(() => { bar.style.transition = 'stroke-dashoffset 5s linear'; bar.style.strokeDashoffset = 276; });
      $('#bRevive').onclick = can ? () => { clearInterval(this.rvTimer); if (!this.g.revive()) this.toast(this.tr('notEnough')); } : () => this.toast(this.tr('notEnough'), 'warn');
      clearInterval(this.rvTimer);
      this.rvTimer = setInterval(() => { n--; $('#rvNum').textContent = Math.max(0, n); if (n <= 0) { clearInterval(this.rvTimer); this.hide('revive'); this.g.gameOver(); } }, 1000);
    },
    gameOver(p, best) {
      const g = this.g, d = g.data, vs = g.runOpts && g.runOpts.versus;
      this.hideAll();
      const vsHtml = vs ? `<div class="vs ${p.score > vs.sc ? 'win' : 'lose'}">👻 ${esc(vs.n || 'Friend')}: ${fmt(vs.sc)} — ${p.score > vs.sc ? this.tr('youWon') : this.tr('youLost')}</div>` : '';
      $('#overBody').innerHTML = `<h2>${p.cause === 'time' ? this.tr('timeUp') : this.tr('gameOver')}</h2><div class="newBest">${best ? '🏆 ' + this.tr('newBest') : ''}</div>${vsHtml}
        <div class="stats"><div><small>${this.tr('score')}</small><b>${fmt(p.score)}</b></div><div><small>${this.tr('distance')}</small><b>${fmt(p.dist)} m</b></div><div><small>${this.tr('coins')}</small><b>🪙 ${fmt(p.coins)}</b></div></div>
        ${g.festival || p.treasures ? `<div class="stats two">${g.festival ? `<div><small>${esc(this.L(IR.FESTIVALS[g.festival].tokenName))}</small><b>${IR.FESTIVALS[g.festival].token} ${p.tokens}</b></div>` : ''}<div><small>${this.tr('treasures')}</small><b>🏺 ${p.treasures}</b></div></div>` : ''}
        <div class="mlist">${d.missions.map((m) => `<div class="mrow ${m.done ? 'done' : ''}">${m.done ? '✅' : '◻️'} ${esc(IR.progress.missionText(m, this.lang))}</div>`).join('')}</div>
        <button class="cta" id="bAgain">🔁 ${this.tr('playAgain')}</button>
        <small class="muted c">👻 ${this.tr('challengeFriend')}</small>
        <div class="shareRow"><button class="ghost wa" id="bWA">💬 ${this.tr('whatsapp')}</button><button class="ghost" id="bCopy">🔗 ${this.tr('copyLink')}</button></div>
        <button class="ghost" id="bOHome">${this.tr('home')}</button>`;
      this.show('over');
      $('#bAgain').onclick = () => { this.hideAll(); g.startRun(g.mode, g.runOpts); };
      $('#bOHome').onclick = () => g.toMenu();
      const info = { v: 1, n: d.name || 'Friend', c: g.cityOverride || d.city, m: g.mode === 'yatra' ? 'yatra' : 'city', f: g.festival || null, s: g.runSeed, sc: Math.floor(p.score), ds: Math.floor(p.dist), ch: d.char };
      const url = IR.mp.makeLink(info), text = `🏃 INDIA RUN: ${info.n} scored ${fmt(info.sc)} (${fmt(info.ds)} m). Can you beat my ghost? 👻`;
      $('#bWA').onclick = () => { const a = document.createElement('a'); a.href = IR.mp.whatsapp(url, text); a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); };
      $('#bCopy').onclick = async () => { const r = await IR.mp.share(url, text); this.toast(r === 'manual' ? url.slice(0, 60) + '…' : '🔗 ' + this.tr('linkCopied')); };
    },
  });
})();
