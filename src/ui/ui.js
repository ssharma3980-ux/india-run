/* Menus, HUD, overlays */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
  const fmt = (n) => Math.floor(n).toLocaleString('en-IN');

  const UI = (IR.ui = {
    lang: 'en',
    tr(k) { return (IR.STR[this.lang] && IR.STR[this.lang][k]) || IR.STR.en[k] || k; },

    build(game) {
      this.g = game; this.lang = game.data.settings.lang;
      const root = $('#ui');
      root.innerHTML = `
      <div id="menu" class="screen">
        <div class="topbar"><div class="pill coins"><span class="ic">🪙</span><b id="mCoins">0</b></div><div class="pill"><span class="ic">🏆</span><b id="mBest">0</b></div></div>
        <div class="logo"><div class="l1">INDIA RUN</div><div class="l2" data-t="subtitle"></div></div>
        <div class="menuBody">
          <button class="cityCard" id="bCity"><span class="cIcon" id="mCityIcon"></span><span class="cTxt"><small data-t="chooseCity"></small><b id="mCity"></b><i id="mCityTag"></i></span><span class="chev">›</span></button>
          <div class="modes" id="modes"></div>
          <button class="playBtn" id="bPlay"><span data-t="play"></span> ▶</button>
          <div class="dock">
            <button data-go="chars"><span>🧍</span><small data-t="characters"></small></button>
            <button data-go="shop"><span>🛒</span><small data-t="shop"></small></button>
            <button data-go="missions"><span>🎯</span><small data-t="missions"></small></button>
            <button data-go="daily"><span>🎁</span><small data-t="rewards"></small><i class="badge" id="dailyBadge"></i></button>
            <button data-go="settings"><span>⚙️</span><small data-t="settings"></small></button>
          </div>
        </div>
      </div>
      <div id="cities" class="screen panelScreen"><div class="panel wide"><div class="ph"><h2 data-t="chooseCity"></h2><button class="x" data-back>✕</button></div><div class="cityGrid" id="cityGrid"></div></div></div>
      <div id="chars" class="screen">
        <div class="topbar"><button class="pill btnBack" data-back>‹ <span data-t="back"></span></button><div class="pill coins"><span class="ic">🪙</span><b class="bank">0</b></div></div>
        <div class="charPanel">
          <div class="charNav"><button id="cPrev">‹</button><div><h2 id="cName"></h2><small id="cFrom"></small></div><button id="cNext">›</button></div>
          <div class="outfits" id="cOutfits"></div>
          <button class="playBtn small" id="cAction"></button>
        </div>
      </div>
      <div id="shop" class="screen panelScreen"><div class="panel"><div class="ph"><h2 data-t="shop"></h2><div class="pill coins"><span class="ic">🪙</span><b class="bank">0</b></div><button class="x" data-back>✕</button></div><div id="shopList" class="list"></div></div></div>
      <div id="missions" class="screen panelScreen"><div class="panel"><div class="ph"><h2 data-t="missions"></h2><button class="x" data-back>✕</button></div><div id="mList"></div></div></div>
      <div id="daily" class="screen panelScreen"><div class="panel"><div class="ph"><h2 data-t="rewards"></h2><button class="x" data-back>✕</button></div><div class="days" id="days"></div><button class="playBtn small" id="bClaim"></button></div></div>
      <div id="settings" class="screen panelScreen"><div class="panel"><div class="ph"><h2 data-t="settings"></h2><button class="x" data-back>✕</button></div><div id="setList" class="list"></div></div></div>
      <div id="hud" class="screen">
        <div class="hudTop">
          <div class="hScore"><b id="hScore">0</b><small><span id="hDist">0</span> m · <span class="mult" id="hMult">x1</span></small></div>
          <div class="hTimer" id="hTimer"></div>
          <div class="hRight"><div class="pill coins"><span class="ic">🪙</span><b id="hCoins">0</b></div><button class="pauseBtn" id="bPause">❚❚</button></div>
        </div>
        <div class="powers" id="hPowers"></div>
        <div class="turnHint" id="turnHint"></div>
        <div class="tut" id="tut"></div>
      </div>
      <div id="pause" class="screen panelScreen"><div class="panel narrow"><h2 data-t="pause"></h2><button class="playBtn small" id="bResume"></button><button class="ghost" id="bRestart"></button><button class="ghost" id="bHome"></button>
        <div class="row"><label data-t="music"></label><button class="tog" id="pMusic"></button></div><div class="row"><label data-t="sfx"></label><button class="tog" id="pSfx"></button></div></div></div>
      <div id="revive" class="screen panelScreen"><div class="panel narrow"><h2 data-t="reviveQ"></h2><div class="ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" class="trk"/><circle cx="50" cy="50" r="44" class="bar" id="rvBar"/></svg><b id="rvNum">5</b></div><button class="playBtn small" id="bRevive"></button><button class="ghost" id="bSkip"></button></div></div>
      <div id="over" class="screen panelScreen"><div class="panel narrow"><h2 id="oTitle"></h2><div class="newBest" id="oBest"></div>
        <div class="stats"><div><small data-t="score"></small><b id="oScore"></b></div><div><small data-t="distance"></small><b id="oDist"></b></div><div><small data-t="coins"></small><b id="oCoins"></b></div></div>
        <div id="oMissions"></div>
        <button class="playBtn small" id="bAgain"></button><button class="ghost" id="bOHome"></button></div></div>
      <div id="toasts"></div>
      <div id="cityBanner"></div>`;
      this.applyLang();
      // mode chips
      const modes = $('#modes');
      for (const m of ['yatra', 'city', 'timed', 'daily']) {
        const b = h('button', 'mode', `<b>${{ yatra: '🗺️', city: '🏙️', timed: '⏱️', daily: '📅' }[m]}</b><span data-t="${m}">${this.tr(m)}</span><small data-t="${m}D">${this.tr(m + 'D')}</small>`);
        b.dataset.mode = m; b.onclick = () => { this.click(); game.data.mode = m; IR.progress.save(); this.refreshMenu(); };
        modes.appendChild(b);
      }
      $('#bPlay').onclick = () => { this.click(); this.hideAll(); game.startRun(game.data.mode); };
      $('#bCity').onclick = () => this.open('cities');
      root.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => this.open(b.dataset.go)));
      root.querySelectorAll('[data-back]').forEach((b) => (b.onclick = () => this.back()));
      $('#bPause').onclick = () => game.pause();
      $('#bResume').onclick = () => game.resume();
      $('#bRestart').onclick = () => { this.hideAll(); IR.audio.ctx && IR.audio.ctx.resume(); IR.audio.stopMusic(); game.startRun(game.mode); };
      $('#bHome').onclick = () => game.toMenu();
      $('#bOHome').onclick = () => game.toMenu();
      $('#bAgain').onclick = () => { this.hideAll(); game.startRun(game.mode); };
      $('#bRevive').onclick = () => { clearInterval(this.rvTimer); if (!game.revive()) this.toast(this.tr('notEnough')); };
      $('#bSkip').onclick = () => { clearInterval(this.rvTimer); this.hide('revive'); game.gameOver(); };
      $('#cPrev').onclick = () => this.charStep(-1);
      $('#cNext').onclick = () => this.charStep(1);
      $('#pMusic').onclick = () => { const s = game.data.settings; s.music = !s.music; game.applySettings(); IR.progress.save(); this.togs(); };
      $('#pSfx').onclick = () => { const s = game.data.settings; s.sfx = !s.sfx; game.applySettings(); IR.progress.save(); this.togs(); };
      this.stack = [];
      this.toMenu();
    },
    applyLang() {
      document.querySelectorAll('[data-t]').forEach((e) => (e.textContent = this.tr(e.dataset.t)));
      const set = (id, k) => { const e = $(id); if (e) e.textContent = this.tr(k); };
      set('#bResume', 'resume'); set('#bRestart', 'restart'); set('#bHome', 'home'); set('#bAgain', 'playAgain'); set('#bOHome', 'home'); set('#bSkip', 'skip');
      document.documentElement.lang = this.lang;
    },
    click() { IR.audio.init(); IR.audio.play('click'); },
    show(id) { $('#' + id).classList.add('on'); },
    hide(id) { $('#' + id).classList.remove('on'); },
    hideAll() { document.querySelectorAll('.screen').forEach((s) => s.classList.remove('on')); },
    open(id) {
      this.click(); this.stack.push(id);
      if (id === 'chars') { this.hide('menu'); this.g.state = 'select'; this.charIdx = Math.max(0, IR.CHARS.findIndex((c) => c.id === this.g.data.char)); this.outfitIdx = this.g.data.outfit; this.renderChar(); }
      if (id === 'cities') this.renderCities();
      if (id === 'shop') this.renderShop();
      if (id === 'missions') this.renderMissions();
      if (id === 'daily') this.renderDaily();
      if (id === 'settings') this.renderSettings();
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
    refreshMenu() {
      const d = this.g.data, th = IR.THEMES[d.city];
      $('#mCoins').textContent = fmt(d.coins); $('#mBest').textContent = fmt(d.best);
      $('#mCity').textContent = th.names[this.lang]; $('#mCityTag').textContent = th.tag[this.lang]; $('#mCityIcon').textContent = th.icon;
      $('#bCity').style.background = `linear-gradient(120deg, ${th.card[0]}cc, ${th.card[1]}cc 60%, ${th.card[2]}cc)`;
      document.querySelectorAll('.mode').forEach((b) => b.classList.toggle('sel', b.dataset.mode === d.mode));
      $('#dailyBadge').style.display = IR.progress.dailyState().can ? 'block' : 'none';
      const ch = IR.progress.challenge();
      const dm = document.querySelector('.mode[data-mode="daily"] small');
      if (dm) dm.textContent = (ch.done ? '✅ ' : '') + this.tr('target').replace('{n}', ch.target) + ' · ' + IR.THEMES[ch.city].names[this.lang];
      this.updateBank();
    },

    /* cities */
    renderCities() {
      const grid = $('#cityGrid'); grid.innerHTML = '';
      const d = this.g.data;
      for (const id of IR.CITY_ORDER) {
        const th = IR.THEMES[id], b = h('button', 'cityTile' + (d.city === id ? ' sel' : ''), `<span class="ci">${th.icon}</span><b>${th.names[this.lang]}</b><small>${th.tag[this.lang]}</small>${d.visited[id] ? '<i>✓</i>' : ''}`);
        b.style.background = `linear-gradient(150deg, ${th.card[0]}, ${th.card[1]} 55%, ${th.card[2]})`;
        b.onclick = () => { this.click(); d.city = id; IR.progress.save(); this.g.setupWorld(); this.g.snapCamera(); this.renderCities(); this.refreshMenu(); };
        grid.appendChild(b);
      }
      const li = this.lang === 'hi' ? 1 : this.lang === 'gu' ? 2 : 0;
      for (const c of IR.COMING) grid.appendChild(h('div', 'cityTile soon', `<span class="ci">🔒</span><b>${c[li]}</b><small>${this.tr('comingSoon')}</small>`));
    },

    /* characters */
    charStep(dir) { this.click(); this.charIdx = (this.charIdx + dir + IR.CHARS.length) % IR.CHARS.length; this.outfitIdx = 0; const c = IR.CHARS[this.charIdx]; if (this.g.data.char === c.id) this.outfitIdx = this.g.data.outfit; this.renderChar(); },
    renderChar() {
      const c = IR.CHARS[this.charIdx], d = this.g.data, owned = d.owned[c.id] || [];
      this.g.previewChar = c.id; this.g.previewOutfit = this.outfitIdx; this.g.makeRunner();
      $('#cName').textContent = c.name[this.lang]; $('#cFrom').textContent = this.tr('from') + ': ' + c.from[this.lang];
      const box = $('#cOutfits'); box.innerHTML = '';
      c.outfits.forEach((o, i) => {
        const has = true, b = h('button', 'outfit' + (i === this.outfitIdx ? ' sel' : ''), `<span class="sw" style="background:linear-gradient(135deg,${o.top} 0 45%,${o.scarf} 45% 60%,${o.bottom} 60%)"></span><small>${o.name[this.lang]}</small>${has ? '' : `<i>🪙 ${i === 0 ? c.price : 300}</i>`}`);
        b.onclick = () => { this.click(); this.outfitIdx = i; this.renderChar(); };
        box.appendChild(b);
      });
      const has = true, isSel = d.char === c.id && d.outfit === this.outfitIdx;
      const price = this.outfitIdx === 0 ? c.price : (owned.includes(0) ? 300 : c.price + 300);
      const act = $('#cAction');
      act.classList.toggle('done', isSel);
      act.innerHTML = isSel ? '✓ ' + this.tr('selected') : has ? this.tr('select') : `${this.tr('buy')} · 🪙 ${fmt(price)}`;
      act.onclick = () => {
        if (isSel) return;
        if (!has) {
          if (d.coins < price) { this.toast(this.tr('notEnough'), 'warn'); return; }
          d.coins -= price; d.owned[c.id] = Array.from(new Set([...(d.owned[c.id] || []), 0, this.outfitIdx]));
          IR.audio.play('power');
        } else this.click();
        d.char = c.id; d.outfit = this.outfitIdx; IR.progress.save(); this.renderChar(); this.updateBank();
      };
      this.updateBank();
    },

    /* shop */
    renderShop() {
      const list = $('#shopList'); list.innerHTML = '';
      const d = this.g.data;
      for (const k of Object.keys(IR.POWERS)) {
        const lv = d.upgrades[k], cost = IR.progress.upCost(k);
        const row = h('div', 'item', `<span class="big">${IR.POWERS[k].icon}</span><div class="grow"><b>${this.tr(k)}</b><small>${this.tr('upDesc')} · ${IR.progress.duration(k).toFixed(1)}s</small><div class="pips">${[0, 1, 2, 3, 4].map((i) => `<i class="${i < lv ? 'on' : ''}"></i>`).join('')}</div></div>`);
        const b = h('button', 'buy' + (lv >= 5 ? ' maxed' : ''), lv >= 5 ? this.tr('max') : `🪙 ${fmt(cost)}`);
        b.onclick = () => {
          if (lv >= 5) return;
          if (d.coins < cost) { this.toast(this.tr('notEnough'), 'warn'); return; }
          d.coins -= cost; d.upgrades[k]++; IR.progress.save(); IR.audio.play('power'); this.renderShop(); this.updateBank();
        };
        row.appendChild(b); list.appendChild(row);
      }
    },
    renderMissions() {
      const d = this.g.data, box = $('#mList');
      box.innerHTML = `<div class="lvl"><b>${this.tr('level')} ${d.mLevel + 1}</b><span>${this.tr('multiplier')} x${IR.progress.multiplier()}</span></div>` +
        d.missions.map((m) => `<div class="item mis ${m.done ? 'done' : ''}"><span class="big">${m.done ? '✅' : '🎯'}</span><div class="grow"><b>${IR.progress.missionText(m, this.lang)}</b><small>🪙 ${50 * (d.mLevel + 1)}</small></div></div>`).join('') +
        `<h3>${this.tr('achievements')}</h3><div class="achGrid">` + IR.progress.ACH.map((a) => `<div class="ach ${d.ach[a.id] ? 'on' : ''}"><span>${a.icon}</span><small>${a.t[this.lang] || a.t.en}</small></div>`).join('') + '</div>';
    },
    renderDaily() {
      const st = IR.progress.dailyState(), box = $('#days'); box.innerHTML = '';
      IR.progress.DAILY.forEach((amt, i) => {
        const cls = i < st.day ? 'got' : i === st.day && st.can ? 'today' : '';
        box.appendChild(h('div', 'dayc ' + cls, `<small>${this.tr('day')} ${i + 1}</small><span>${i === 6 ? '💰' : '🪙'}</span><b>${amt}</b>`));
      });
      const b = $('#bClaim');
      b.textContent = st.can ? this.tr('claim') + ' 🪙 ' + IR.progress.DAILY[st.day] : this.tr('claimed');
      b.classList.toggle('done', !st.can);
      b.onclick = () => { const a = IR.progress.claimDaily(); if (a) { IR.audio.play('mission'); this.toast('🎁 +' + a + ' 🪙'); this.renderDaily(); this.refreshMenu(); } };
    },
    renderSettings() {
      const g = this.g, s = g.data.settings, list = $('#setList');
      const seg = (label, opts, cur, fn) => { const r = h('div', 'row', `<label>${label}</label>`), w = h('div', 'seg'); opts.forEach(([v, t]) => { const b = h('button', v === cur ? 'sel' : '', t); b.onclick = () => { this.click(); fn(v); this.renderSettings(); }; w.appendChild(b); }); r.appendChild(w); return r; };
      list.innerHTML = '';
      list.appendChild(seg(this.tr('quality'), [['low', this.tr('low')], ['med', this.tr('med')], ['high', this.tr('high')]], s.quality, (v) => { s.quality = v; s.manualQ = true; g.applySettings(); IR.progress.save(); }));
      const fr = h('div', 'row', `<label>${this.tr('fov')} <b>${s.fov}°</b></label>`), sl = h('input'); sl.type = 'range'; sl.min = 55; sl.max = 90; sl.value = s.fov;
      sl.oninput = () => { s.fov = +sl.value; fr.querySelector('b').textContent = s.fov + '°'; }; sl.onchange = () => IR.progress.save(); fr.appendChild(sl); list.appendChild(fr);
      list.appendChild(seg(this.tr('music'), [[true, this.tr('on')], [false, this.tr('off')]], s.music, (v) => { s.music = v; g.applySettings(); IR.progress.save(); }));
      list.appendChild(seg(this.tr('sfx'), [[true, this.tr('on')], [false, this.tr('off')]], s.sfx, (v) => { s.sfx = v; g.applySettings(); IR.progress.save(); }));
      list.appendChild(seg(this.tr('language'), [['en', 'English'], ['hi', 'हिन्दी'], ['gu', 'ગુજરાતી']], s.lang, (v) => { s.lang = v; this.lang = v; IR.progress.save(); this.applyLang(); this.refreshMenu(); }));
      list.appendChild(h('div', 'note', `<b>${this.tr('controls')}</b><br>${this.tr('ctrlText')}`));
      const rs = h('button', 'ghost danger', this.tr('reset'));
      rs.onclick = () => {
        rs.replaceWith(Object.assign(h('div', 'confirm', `<span>${this.tr('resetQ')}</span>`), {}));
        const c = list.querySelector('.confirm'), y = h('button', 'ghost danger', this.tr('yes')), n = h('button', 'ghost', this.tr('no'));
        y.onclick = () => { IR.progress.reset(); g.data = IR.progress.data; this.lang = g.data.settings.lang; g.applySettings(); g.makeRunner(); this.applyLang(); this.renderSettings(); this.refreshMenu(); };
        n.onclick = () => this.renderSettings(); c.append(y, n);
      };
      list.appendChild(rs);
      list.appendChild(h('div', 'note small', this.tr('placeholder') + ` · ${this.tr('fps')}: ${Math.round(g.fps)}`));
    },
    togs() { const s = this.g.data.settings; $('#pMusic').textContent = s.music ? this.tr('on') : this.tr('off'); $('#pSfx').textContent = s.sfx ? this.tr('on') : this.tr('off'); $('#pMusic').classList.toggle('sel', s.music); $('#pSfx').classList.toggle('sel', s.sfx); },

    /* HUD */
    showHUD(p, g) {
      this.hideAll(); this.show('hud');
      $('#hTimer').style.display = g.mode === 'timed' ? 'block' : 'none';
      $('#hMult').textContent = 'x' + g.mult; $('#hPowers').innerHTML = ''; this.powerEls = {};
      this.cityBanner(g.run.theme);
      this.togs();
    },
    hud(p, g) {
      $('#hScore').textContent = fmt(p.score); $('#hDist').textContent = fmt(p.dist); $('#hCoins').textContent = fmt(p.coins);
      $('#hMult').textContent = 'x' + g.mult * (p.pw.multi > 0 ? 2 : 1);
      if (g.mode === 'timed') { const t = Math.ceil(p.timeLeft); $('#hTimer').textContent = Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); $('#hTimer').classList.toggle('low', t <= 10); }
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
      const t = h('div', 'toast ' + kind, text); $('#toasts').appendChild(t);
      setTimeout(() => t.classList.add('out'), 2200); setTimeout(() => t.remove(), 2700);
    },
    cityBanner(th) {
      const b = $('#cityBanner');
      b.innerHTML = `<small>${this.tr('welcome')}</small><b>${th.icon} ${th.names[this.lang]}</b><i>${th.tag[this.lang]}</i>`;
      b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
    },
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
    revive(cost, can) {
      this.show('revive');
      $('#bRevive').innerHTML = `${this.tr('cont')} · 🪙 ${fmt(cost)}`;
      $('#bRevive').classList.toggle('done', !can);
      let n = 5; $('#rvNum').textContent = n; const bar = $('#rvBar'); bar.style.transition = 'none'; bar.style.strokeDashoffset = 0;
      requestAnimationFrame(() => { bar.style.transition = 'stroke-dashoffset 5s linear'; bar.style.strokeDashoffset = 276; });
      if (!can) { $('#bRevive').onclick = () => this.toast(this.tr('notEnough'), 'warn'); } else $('#bRevive').onclick = () => { clearInterval(this.rvTimer); if (!this.g.revive()) this.toast(this.tr('notEnough')); };
      clearInterval(this.rvTimer);
      this.rvTimer = setInterval(() => { n--; $('#rvNum').textContent = Math.max(0, n); if (n <= 0) { clearInterval(this.rvTimer); this.hide('revive'); this.g.gameOver(); } }, 1000);
    },
    gameOver(p, best) {
      this.hideAll(); this.show('over');
      $('#oTitle').textContent = p.cause === 'time' ? this.tr('timeUp') : this.tr('gameOver');
      $('#oBest').textContent = best ? '🏆 ' + this.tr('newBest') : '';
      $('#oScore').textContent = fmt(p.score); $('#oDist').textContent = fmt(p.dist) + ' m'; $('#oCoins').textContent = '🪙 ' + fmt(p.coins);
      const d = this.g.data;
      $('#oMissions').innerHTML = d.missions.map((m) => `<div class="mrow ${m.done ? 'done' : ''}">${m.done ? '✅' : '◻️'} ${IR.progress.missionText(m, this.lang)}</div>`).join('');
    },
  });
})();
