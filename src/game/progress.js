/* Save data, missions, achievements, daily rewards, upgrades */
(function () {
  const KEY = 'indiarun_save_v1';
  const def = () => ({
    coins: 0, best: 0, totalCoins: 0, totalDist: 0, runs: 0, totalJumps: 0,
    owned: { arjun: [0] }, char: 'arjun', outfit: 0, city: 'varanasi', mode: 'yatra',
    upgrades: { magnet: 0, shield: 0, double: 0, multi: 0, boost: 0, glide: 0 },
    mLevel: 0, missions: null, ach: {}, visited: {},
    daily: { last: '', streak: 0 }, challenge: { day: '', done: false },
    settings: { quality: 'high', fov: 70, music: true, sfx: true, lang: 'en', tutorial: true },
  });
  const P = (IR.progress = { data: null });
  P.load = () => {
    const d = IR.store.get(KEY, null), base = def();
    P.data = d ? Object.assign(base, d, { settings: Object.assign(base.settings, d.settings || {}), upgrades: Object.assign(base.upgrades, d.upgrades || {}) }) : base;
    if (!P.data.missions) P.newMissions();
    return P.data;
  };
  P.save = () => IR.store.set(KEY, P.data);
  P.reset = () => { P.data = def(); P.newMissions(); P.save(); };
  P.today = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };

  /* missions */
  const POOL = [
    { id: 'coins', base: 60, step: 40, t: { en: 'Collect {n} coins in one run', hi: 'एक दौड़ में {n} सिक्के जमा करें', gu: 'એક દોડમાં {n} સિક્કા ભેગા કરો' } },
    { id: 'dist', base: 600, step: 400, t: { en: 'Run {n} m in one run', hi: 'एक दौड़ में {n} मीटर दौड़ें', gu: 'એક દોડમાં {n} મીટર દોડો' } },
    { id: 'jumps', base: 10, step: 6, t: { en: 'Jump {n} times in one run', hi: 'एक दौड़ में {n} बार कूदें', gu: 'એક દોડમાં {n} વાર કૂદો' } },
    { id: 'slides', base: 8, step: 5, t: { en: 'Slide {n} times in one run', hi: 'एक दौड़ में {n} बार फिसलें', gu: 'એક દોડમાં {n} વાર સરકો' } },
    { id: 'turns', base: 4, step: 2, t: { en: 'Make {n} turns in one run', hi: 'एक दौड़ में {n} मोड़ लें', gu: 'એક દોડમાં {n} વળાંક લો' } },
    { id: 'powers', base: 2, step: 1, t: { en: 'Grab {n} power-ups in one run', hi: 'एक दौड़ में {n} पावर-अप लें', gu: 'એક દોડમાં {n} પાવર-અપ લો' } },
    { id: 'score', base: 5000, step: 4000, t: { en: 'Score {n} in one run', hi: 'एक दौड़ में {n} अंक बनाएं', gu: 'એક દોડમાં {n} ગુણ મેળવો' } },
  ];
  P.newMissions = () => {
    const lv = P.data.mLevel, ids = POOL.slice().sort(() => Math.random() - 0.5).slice(0, 3);
    P.data.missions = ids.map((m) => ({ id: m.id, n: m.base + m.step * lv, done: false }));
  };
  P.missionText = (m, lang) => { const p = POOL.find((q) => q.id === m.id); return (p.t[lang] || p.t.en).replace('{n}', m.n); };
  P.checkMissions = (stats, onDone) => {
    for (const m of P.data.missions) if (!m.done && (stats[m.id] || 0) >= m.n) { m.done = true; P.data.coins += 50 * (P.data.mLevel + 1); onDone(m); }
    if (P.data.missions.every((m) => m.done)) { P.data.mLevel++; P.newMissions(); onDone(null, true); }
  };
  P.multiplier = () => 1 + P.data.mLevel;

  /* achievements */
  P.ACH = [
    { id: 'first', icon: '👟', t: { en: 'First Steps', hi: 'पहले कदम', gu: 'પહેલાં પગલાં' }, test: (d) => d.runs >= 1 },
    { id: 'k1', icon: '🛕', t: { en: 'Run 1,000 m', hi: '1,000 मी दौड़ें', gu: '1,000 મી દોડો' }, test: (d, s) => s.dist >= 1000 },
    { id: 'k5', icon: '🏆', t: { en: 'Run 5,000 m', hi: '5,000 मी दौड़ें', gu: '5,000 મી દોડો' }, test: (d, s) => s.dist >= 5000 },
    { id: 'c500', icon: '🪙', t: { en: '500 coins collected', hi: '500 सिक्के', gu: '500 સિક્કા' }, test: (d) => d.totalCoins >= 500 },
    { id: 'c5000', icon: '💰', t: { en: '5,000 coins collected', hi: '5,000 सिक्के', gu: '5,000 સિક્કા' }, test: (d) => d.totalCoins >= 5000 },
    { id: 'yatra', icon: '🗺️', t: { en: 'Visit all 5 cities', hi: 'सभी 5 शहर घूमें', gu: 'બધા 5 શહેર ફરો' }, test: (d) => Object.keys(d.visited).length >= 5 },
    { id: 'jump100', icon: '🦘', t: { en: '100 total jumps', hi: '100 छलांग', gu: '100 કૂદકા' }, test: (d) => d.totalJumps >= 100 },
    { id: 'm3', icon: '⭐', t: { en: 'Mission level 3', hi: 'मिशन स्तर 3', gu: 'મિશન સ્તર 3' }, test: (d) => d.mLevel >= 3 },
  ];
  P.checkAch = (stats, onNew) => { for (const a of P.ACH) if (!P.data.ach[a.id] && a.test(P.data, stats)) { P.data.ach[a.id] = 1; onNew(a); } };

  /* daily reward */
  P.DAILY = [50, 100, 150, 200, 300, 400, 1000];
  P.dailyState = () => {
    const d = P.data.daily, today = P.today();
    if (d.last === today) return { can: false, day: d.streak };
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yest = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate();
    const streak = d.last === yest ? d.streak % 7 : 0;
    return { can: true, day: streak };
  };
  P.claimDaily = () => {
    const s = P.dailyState(); if (!s.can) return 0;
    const amt = P.DAILY[s.day]; P.data.coins += amt; P.data.daily = { last: P.today(), streak: s.day + 1 }; P.save(); return amt;
  };

  /* upgrades */
  P.UP = {
    magnet: { base: 8 }, shield: { base: 10 }, double: { base: 10 }, multi: { base: 10 }, boost: { base: 4 }, glide: { base: 6 },
  };
  P.duration = (k) => P.UP[k].base + P.data.upgrades[k] * (k === 'boost' ? 0.8 : 1.6);
  P.upCost = (k) => [250, 600, 1200, 2500, 5000][P.data.upgrades[k]];

  /* daily challenge */
  P.challenge = () => {
    const day = P.today(); let h = 0; for (const ch of day) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    if (P.data.challenge.day !== day) P.data.challenge = { day, done: false };
    return { city: IR.CITY_ORDER[h % IR.CITY_ORDER.length], target: 120 + (h % 5) * 20, seed: h, done: P.data.challenge.done, reward: 400 };
  };
})();
