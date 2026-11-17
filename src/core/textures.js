/* Procedural textures — every pixel generated in code, no external images */
(function () {
  const T = (IR.tex = {});
  const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h || w; return c; };
  const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;
  T.cv = cv;

  function grain(x, w, h, amt, r) {
    const id = x.getImageData(0, 0, w, h), d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() - 0.5) * amt;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    x.putImageData(id, 0, 0);
  }
  function blot(x, S, n, r, colFn, rmin, rmax, H) {
    H = H || S;
    for (let i = 0; i < n; i++) {
      const px = r() * S, py = r() * H, rad = rmin + r() * (rmax - rmin), col = colFn(r);
      for (const ox of [-S, 0, S]) for (const oy of [-H, 0, H]) {
        const cx = px + ox, cy = py + oy;
        if (cx + rad < 0 || cx - rad > S || cy + rad < 0 || cy - rad > H) continue;
        const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g; x.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
      }
    }
  }
  function rrect(x, X, Y, W, H, rad) {
    x.beginPath();
    if (x.roundRect) x.roundRect(X, Y, W, H, rad); else x.rect(X, Y, W, H);
  }
  function tex(c, srgb = true) {
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = IR.maxAniso || 4;
    return t;
  }
  T.tex = tex;

  /* Normal map derived from a texture's luminance (height) */
  T.normalFrom = (srcTex, strength = 2.5, invert = false) => {
    const img = srcTex.image, S = img.width, H = img.height, c = cv(S, H), x = c.getContext('2d', { willReadFrequently: true });
    const sx = img.getContext ? img.getContext('2d', { willReadFrequently: true }) : (() => { const t = cv(S, H).getContext('2d'); t.drawImage(img, 0, 0); return t; })();
    const src = sx.getImageData(0, 0, S, H).data, out = x.createImageData(S, H), d = out.data;
    const L = new Float32Array(S * H);
    for (let i = 0; i < S * H; i++) L[i] = (src[i * 4] * 0.3 + src[i * 4 + 1] * 0.59 + src[i * 4 + 2] * 0.11) / 255;
    const at = (px, py) => L[((py + H) % H) * S + ((px + S) % S)];
    const k = invert ? -strength : strength;
    for (let py = 0; py < H; py++) for (let px = 0; px < S; px++) {
      const dx = (at(px + 1, py) - at(px - 1, py)) * k, dy = (at(px, py + 1) - at(px, py - 1)) * k;
      const len = Math.hypot(dx, dy, 1), i = (py * S + px) * 4;
      d[i] = (-dx / len * 0.5 + 0.5) * 255; d[i + 1] = (dy / len * 0.5 + 0.5) * 255; d[i + 2] = (1 / len * 0.5 + 0.5) * 255; d[i + 3] = 255;
    }
    x.putImageData(out, 0, 0);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = IR.maxAniso || 4;
    return t;
  };
  /* Roughness variation (wet/polished patches) */
  T.roughFrom = (srcTex, base = 0.8, varr = 0.25) => {
    const img = srcTex.image, S = img.width, c = cv(S), x = c.getContext('2d', { willReadFrequently: true });
    x.filter = 'grayscale(1) contrast(1.4)'; x.drawImage(img, 0, 0); x.filter = 'none';
    const id = x.getImageData(0, 0, S, S), d = id.data;
    for (let i = 0; i < d.length; i += 4) { const v = (base + (0.5 - d[i] / 255) * varr) * 255; d[i] = d[i + 1] = d[i + 2] = v; }
    x.putImageData(id, 0, 0);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  };

  /* Ghat flagstones / paving */
  T.flagstone = (o = {}) => {
    const S = 512, c = cv(S), x = c.getContext('2d', { willReadFrequently: true }), r = IR.rng(o.seed || 11);
    const [H, Sa, L] = o.hsl || [32, 30, 60];
    x.fillStyle = hsl(H, Sa - 10, L - 32); x.fillRect(0, 0, S, S);
    const rows = o.rows || 4, rh = S / rows;
    for (let row = 0; row < rows; row++) {
      const ws = []; let tot = 0;
      while (tot < S - 40) { const w = (o.minW || 80) + r() * (o.varW || 120); ws.push(w); tot += w; }
      const k = S / tot; let cx = r() * S;
      for (const w0 of ws) {
        const w = w0 * k, l = L + (r() - 0.5) * 16, h = H + (r() - 0.5) * 8, sat = Sa + (r() - 0.5) * 12;
        for (const ox of [0, -S]) {
          const X = cx + ox + 3, Y = row * rh + 3, W = w - 6, Hh = rh - 6;
          const g = x.createLinearGradient(X, Y, X + W * 0.4, Y + Hh);
          g.addColorStop(0, hsl(h, sat, l + 7)); g.addColorStop(1, hsl(h, sat, l - 7));
          x.fillStyle = g; rrect(x, X, Y, W, Hh, 7); x.fill();
          x.strokeStyle = hsl(h, sat, l + 18, 0.35); x.lineWidth = 2;
          x.beginPath(); x.moveTo(X + 5, Y + 2); x.lineTo(X + W - 5, Y + 2); x.stroke();
          x.strokeStyle = hsl(h, sat, l - 25, 0.4);
          x.beginPath(); x.moveTo(X + 5, Y + Hh - 1); x.lineTo(X + W - 5, Y + Hh - 1); x.stroke();
        }
        cx = (cx + w) % S;
      }
    }
    blot(x, S, 40, r, (r) => `rgba(${r() < 0.55 ? '45,28,15' : '255,236,205'},${0.05 + r() * 0.09})`, 20, 90);
    x.strokeStyle = 'rgba(30,20,10,.32)'; x.lineWidth = 1;
    for (let i = 0; i < 16; i++) {
      let px = r() * S, py = r() * S; x.beginPath(); x.moveTo(px, py);
      for (let j = 0; j < 5; j++) { px += (r() - 0.5) * 34; py += (r() - 0.5) * 34; x.lineTo(px, py); }
      x.stroke();
    }
    grain(x, S, S, o.grain || 28, r);
    return tex(c);
  };

  /* Wooden planks (rows across the path) */
  T.planks = (o = {}) => {
    const S = 512, c = cv(S), x = c.getContext('2d', { willReadFrequently: true }), r = IR.rng(o.seed || 5);
    const [H, Sa, L] = o.hsl || [26, 40, 34];
    const rows = o.rows || 8, rh = S / rows;
    x.fillStyle = '#1a100a'; x.fillRect(0, 0, S, S);
    for (let i = 0; i < rows; i++) {
      const l = L + (r() - 0.5) * 12, h = H + (r() - 0.5) * 6;
      x.fillStyle = hsl(h, Sa, l); x.fillRect(0, i * rh + 3, S, rh - 6);
      for (let k = 0; k < 26; k++) {
        x.strokeStyle = hsl(h, Sa, l + (r() - 0.5) * 14, 0.5); x.lineWidth = 1 + r() * 2;
        const y0 = i * rh + 6 + r() * (rh - 12), ph = r() * 6, amp = r() * 3;
        x.beginPath();
        for (let px = 0; px <= S; px += 16) x.lineTo(px, y0 + Math.sin(px / 40 + ph) * amp);
        x.stroke();
      }
      if (r() < 0.5) { x.fillStyle = 'rgba(40,22,10,.5)'; x.beginPath(); x.ellipse(r() * S, i * rh + rh / 2, 10, 5, 0, 0, 7); x.fill(); }
      x.fillStyle = '#2b2b2b';
      for (const px of [30, S / 2 + 30]) { x.beginPath(); x.arc(px, i * rh + 12, 3, 0, 7); x.arc(px, i * rh + rh - 12, 3, 0, 7); x.fill(); }
    }
    blot(x, S, 20, r, () => 'rgba(0,0,0,.12)', 30, 90);
    grain(x, S, S, 18, r);
    return tex(c);
  };

  /* Asphalt */
  T.asphalt = (o = {}) => {
    const S = 512, c = cv(S), x = c.getContext('2d', { willReadFrequently: true }), r = IR.rng(o.seed || 3);
    x.fillStyle = o.base || '#3b3d42'; x.fillRect(0, 0, S, S);
    blot(x, S, 60, r, (r) => `rgba(${r() < 0.5 ? '20,20,25' : '90,90,95'},${0.12 + r() * 0.12})`, 20, 90);
    for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '160,160,160' : '20,20,20'},.5)`; x.fillRect(r() * S, r() * S, 2, 2); }
    grain(x, S, S, 30, r);
    return tex(c);
  };

  /* Ground: sand / grass / snow */
  T.ground = (o = {}) => {
    const S = 512, c = cv(S), x = c.getContext('2d', { willReadFrequently: true }), r = IR.rng(o.seed || 9);
    x.fillStyle = o.base; x.fillRect(0, 0, S, S);
    blot(x, S, 80, r, (r) => (r() < 0.5 ? o.dark : o.light), 20, 110);
    if (o.blades) for (let i = 0; i < 2500; i++) { x.strokeStyle = r() < 0.5 ? o.dark : o.light; x.lineWidth = 1; const px = r() * S, py = r() * S; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - 0.5) * 4, py - 4 - r() * 6); x.stroke(); }
    grain(x, S, S, o.grain || 20, r);
    return tex(c);
  };

  /* Building facades (8m x 8m per tile: 2 floors x 2 bays) */
  T.facade = (o) => {
    const S = 512, c = cv(S), x = c.getContext('2d', { willReadFrequently: true }), r = IR.rng(o.seed || 1);
    x.fillStyle = o.wall; x.fillRect(0, 0, S, S);
    blot(x, S, 30, r, (r) => `rgba(${r() < 0.6 ? '60,40,25' : '255,245,225'},${0.06 + r() * 0.08})`, 30, 120);
    const trim = o.trim, dark = o.win || '#2a1a14';
    for (let f = 0; f < 2; f++) for (let b = 0; b < 2; b++) {
      const X = b * 256, Y = f * 256;
      if (o.style === 'arch') {
        x.fillStyle = trim; rrect(x, X + 70, Y + 58, 116, 158, 4); x.fill();
        x.beginPath(); x.arc(X + 128, Y + 92, 58, Math.PI, 0); x.fill();
        const g = x.createLinearGradient(0, Y + 60, 0, Y + 210); g.addColorStop(0, '#120a06'); g.addColorStop(1, dark);
        x.fillStyle = g; x.fillRect(X + 82, Y + 92, 92, 116); x.beginPath(); x.arc(X + 128, Y + 92, 46, Math.PI, 0); x.fill();
        x.fillStyle = o.shutter || '#2f6f6a'; x.fillRect(X + 82, Y + 120, 20, 88); x.fillRect(X + 154, Y + 120, 20, 88);
        x.fillStyle = trim; x.fillRect(X + 60, Y + 212, 136, 12);
        x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = 2;
        for (let k = 0; k < 8; k++) { x.beginPath(); x.moveTo(X + 66 + k * 17, Y + 196); x.lineTo(X + 66 + k * 17, Y + 212); x.stroke(); }
      } else if (o.style === 'jharokha') {
        for (let k = 0; k < 3; k++) {
          const wx = X + 22 + k * 80, wy = Y + 80;
          x.fillStyle = trim; x.beginPath(); x.ellipse(wx + 28, wy, 34, 26, 0, Math.PI, 0); x.fill();
          x.fillRect(wx - 6, wy, 68, 104);
          x.fillStyle = dark; x.fillRect(wx + 4, wy + 6, 48, 86);
          x.strokeStyle = trim; x.lineWidth = 2;
          for (let q = 1; q < 4; q++) { x.beginPath(); x.moveTo(wx + 4 + q * 12, wy + 6); x.lineTo(wx + 4 + q * 12, wy + 92); x.stroke(); }
          for (let q = 1; q < 6; q++) { x.beginPath(); x.moveTo(wx + 4, wy + 6 + q * 15); x.lineTo(wx + 52, wy + 6 + q * 15); x.stroke(); }
          x.fillStyle = trim; x.fillRect(wx - 10, wy + 100, 76, 10);
        }
      } else if (o.style === 'grid') {
        const g = x.createLinearGradient(X, Y, X + 256, Y + 256);
        g.addColorStop(0, o.glass || '#4d6a85'); g.addColorStop(0.5, '#9fb9cf'); g.addColorStop(1, o.glass || '#3a556e');
        x.fillStyle = g; x.fillRect(X + 20, Y + 40, 216, 180);
        x.fillStyle = trim; for (let q = 0; q < 4; q++) x.fillRect(X + 20 + q * 72, Y + 40, 6, 180);
        x.fillRect(X + 20, Y + 128, 216, 5);
        if (o.lit) for (let q = 0; q < 3; q++) if (r() < 0.45) { x.fillStyle = 'rgba(255,214,140,.85)'; x.fillRect(X + 28 + q * 72, Y + 48 + (r() < 0.5 ? 0 : 88), 62, 76); }
      } else if (o.style === 'deco') {
        x.fillStyle = trim; x.fillRect(X, Y + 30, 256, 8);
        for (let q = 0; q < 3; q++) {
          x.fillStyle = trim; rrect(x, X + 18 + q * 78, Y + 60, 64, 140, 18); x.fill();
          x.fillStyle = o.lit && r() < 0.5 ? '#f3c77d' : dark; rrect(x, X + 24 + q * 78, Y + 66, 52, 128, 14); x.fill();
        }
        x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(X, Y + 214, 256, 18);
      } else if (o.style === 'chalet') {
        for (let q = 0; q < 16; q++) { x.fillStyle = hsl(24, 40, 22 + r() * 10); x.fillRect(X, Y + q * 16, 256, 14); }
        x.fillStyle = trim; x.fillRect(X + 60, Y + 70, 136, 120);
        x.fillStyle = o.lit ? '#ffcf7a' : dark; x.fillRect(X + 72, Y + 82, 112, 96);
        x.fillStyle = trim; x.fillRect(X + 125, Y + 82, 6, 96); x.fillRect(X + 72, Y + 127, 112, 6);
        x.strokeStyle = trim; x.lineWidth = 3; for (let q = 0; q < 6; q++) { x.beginPath(); x.arc(X + 60 + q * 27, Y + 200, 10, 0, Math.PI); x.stroke(); }
      } else if (o.style === 'colonial') {
        x.fillStyle = trim; x.fillRect(X + 4, Y + 20, 26, 236); x.fillRect(X + 226, Y + 20, 26, 236);
        x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(X + 28, Y + 20, 4, 236);
        x.fillStyle = trim; x.fillRect(X + 78, Y + 44, 100, 176); x.beginPath(); x.arc(X + 128, Y + 48, 50, Math.PI, 0); x.fill();
        x.fillStyle = o.shutter || '#2f6a3a';
        for (let q = 0; q < 2; q++) { x.fillRect(X + 86 + q * 44, Y + 56, 40, 156); }
        x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 2;
        for (let q = 0; q < 2; q++) for (let k = 0; k < 18; k++) { x.beginPath(); x.moveTo(X + 88 + q * 44, Y + 62 + k * 8.5); x.lineTo(X + 124 + q * 44, Y + 62 + k * 8.5); x.stroke(); }
        x.fillStyle = trim; x.fillRect(X + 66, Y + 214, 124, 12);
      } else if (o.style === 'pol') {
        const cols = o.cols || ['#2a8aa8', '#d9483a', '#f2b31c', '#3a9a5a'];
        x.fillStyle = cols[(f + b) % cols.length]; x.fillRect(X + 10, Y + 24, 236, 220);
        x.fillStyle = trim; for (let q = 0; q < 6; q++) { x.beginPath(); x.moveTo(X + 20 + q * 40, Y + 24); x.lineTo(X + 34 + q * 40, Y + 54); x.lineTo(X + 48 + q * 40, Y + 24); x.fill(); }
        x.fillStyle = '#3a2214'; x.fillRect(X + 60, Y + 70, 136, 130);
        x.strokeStyle = trim; x.lineWidth = 5; x.strokeRect(X + 60, Y + 70, 136, 130);
        x.lineWidth = 2; for (let q = 1; q < 6; q++) { x.beginPath(); x.moveTo(X + 60 + q * 22.6, Y + 70); x.lineTo(X + 60 + q * 22.6, Y + 200); x.stroke(); }
        x.fillStyle = trim; x.fillRect(X + 40, Y + 200, 176, 14);
        for (let q = 0; q < 8; q++) x.fillRect(X + 46 + q * 22, Y + 214, 6, 26);
      } else if (o.style === 'fort') {
        x.strokeStyle = 'rgba(60,15,10,.35)'; x.lineWidth = 2;
        for (let q = 0; q < 8; q++) { x.beginPath(); x.moveTo(X, Y + q * 32); x.lineTo(X + 256, Y + q * 32); x.stroke(); }
        x.fillStyle = trim;
        x.beginPath(); x.moveTo(X + 70, Y + 230); x.lineTo(X + 70, Y + 120); x.quadraticCurveTo(X + 128, Y + 40, X + 186, Y + 120); x.lineTo(X + 186, Y + 230); x.fill();
        x.fillStyle = 'rgba(70,18,12,.85)';
        x.beginPath(); x.moveTo(X + 84, Y + 230); x.lineTo(X + 84, Y + 126); x.quadraticCurveTo(X + 128, Y + 62, X + 172, Y + 126); x.lineTo(X + 172, Y + 230); x.fill();
      }
      x.fillStyle = trim; x.fillRect(0, Y, S, 12);
      x.fillStyle = 'rgba(0,0,0,.22)'; x.fillRect(0, Y + 12, S, 6);
    }
    const g = x.createLinearGradient(0, S * 0.75, 0, S);
    g.addColorStop(0, 'rgba(40,25,15,0)'); g.addColorStop(1, 'rgba(40,25,15,.22)');
    x.fillStyle = g; x.fillRect(0, S * 0.75, S, S * 0.25);
    grain(x, S, S, 18, r);
    return tex(c);
  };

  /* Cloth with border pattern */
  T.cloth = (o) => {
    const S = 256, c = cv(S), x = c.getContext('2d', { willReadFrequently: true }), r = IR.rng(o.seed || 2);
    x.fillStyle = o.base; x.fillRect(0, 0, S, S);
    if (o.dots) { x.fillStyle = o.dots; for (let i = 0; i < 260; i++) { x.beginPath(); x.arc(r() * S, r() * S, 2 + r() * 2, 0, 7); x.fill(); } }
    if (o.border) {
      x.fillStyle = o.border; x.fillRect(0, 0, S, 22); x.fillRect(0, S - 22, S, 22);
      x.fillStyle = o.base; for (let i = 0; i < 16; i++) { x.beginPath(); x.moveTo(i * 16, 22); x.lineTo(i * 16 + 8, 10); x.lineTo(i * 16 + 16, 22); x.fill(); }
    }
    if (o.motif) { x.strokeStyle = o.motif; x.lineWidth = 3; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { x.beginPath(); x.arc(32 + i * 64, 64 + j * 64, 14, 0, 7); x.stroke(); } }
    grain(x, S, S, 16, r);
    return tex(c);
  };

  /* Lotus coin face */
  T.coin = () => {
    const S = 256, c = cv(S), x = c.getContext('2d', { willReadFrequently: true });
    const g = x.createRadialGradient(100, 90, 10, 128, 128, 128);
    g.addColorStop(0, '#fff2a6'); g.addColorStop(0.5, '#f2c230'); g.addColorStop(1, '#b07a10');
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    x.strokeStyle = '#8a5a08'; x.lineWidth = 10; x.beginPath(); x.arc(128, 128, 112, 0, 7); x.stroke();
    x.strokeStyle = '#ffe680'; x.lineWidth = 3; x.beginPath(); x.arc(128, 128, 100, 0, 7); x.stroke();
    x.save(); x.translate(128, 150);
    const petal = (a, len, w) => { x.save(); x.rotate(a); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(w, -len * 0.5, 0, -len); x.quadraticCurveTo(-w, -len * 0.5, 0, 0); x.fill(); x.stroke(); x.restore(); };
    x.fillStyle = '#d99a14'; x.strokeStyle = '#7a4d05'; x.lineWidth = 3;
    [-1.1, 1.1, -0.65, 0.65, 0].forEach((a, i) => petal(a, i === 4 ? 82 : 70, 22));
    x.fillStyle = '#7a4d05'; x.fillRect(-46, 4, 92, 6);
    x.restore();
    return tex(c);
  };

  T.glow = () => {
    const S = 64, c = cv(S), x = c.getContext('2d', { willReadFrequently: true });
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,220,150,.7)'); g.addColorStop(1, 'rgba(255,160,60,0)');
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  T.dot = () => {
    const S = 32, c = cv(S), x = c.getContext('2d', { willReadFrequently: true });
    const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    return new THREE.CanvasTexture(c);
  };

  /* Emoji/text icon sprite */
  T.icon = (txt, ring) => {
    const S = 128, c = cv(S), x = c.getContext('2d', { willReadFrequently: true });
    const g = x.createRadialGradient(64, 64, 10, 64, 64, 62);
    g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.7, ring); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill();
    x.font = 'bold 64px "Segoe UI Emoji","Noto Color Emoji",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#222'; x.fillText(txt, 64, 70);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };

  /* Banner with text (city welcome gates) */
  T.banner = (lines, bg, fg) => {
    const c = cv(1024, 256), x = c.getContext('2d', { willReadFrequently: true });
    const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, bg[0]); g.addColorStop(1, bg[1]);
    x.fillStyle = g; x.fillRect(0, 0, 1024, 256);
    x.strokeStyle = fg; x.lineWidth = 10; x.strokeRect(14, 14, 996, 228);
    x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '900 92px system-ui,"Noto Sans Devanagari",sans-serif'; x.fillText(lines[0], 512, 104);
    x.font = '700 54px "Noto Sans Devanagari","Noto Sans Gujarati",system-ui,sans-serif'; x.fillText(lines[1], 512, 192);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = IR.maxAniso || 4; return t;
  };

  /* Water normal map — seamless analytic waves */
  T.waterNormal = (seed = 1) => {
    const S = 256, c = cv(S), x = c.getContext('2d', { willReadFrequently: true }), id = x.createImageData(S, S), r = IR.rng(seed);
    const waves = [];
    for (let i = 0; i < 14; i++) {
      const kx = Math.round((r() - 0.5) * 16) || 1, ky = Math.round((r() - 0.5) * 16);
      waves.push([kx, ky, (0.8 / Math.hypot(kx, ky)) * (0.5 + r()), r() * 6.28]);
    }
    for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
      let dx = 0, dy = 0;
      for (const [kx, ky, a, ph] of waves) {
        const t = ((kx * px + ky * py) / S) * Math.PI * 2 + ph, cc = Math.cos(t) * a;
        dx += cc * kx; dy += cc * ky;
      }
      const n = new THREE.Vector3(-dx * 0.12, -dy * 0.12, 1).normalize(), i = (py * S + px) * 4;
      id.data[i] = (n.x * 0.5 + 0.5) * 255; id.data[i + 1] = (n.y * 0.5 + 0.5) * 255; id.data[i + 2] = (n.z * 0.5 + 0.5) * 255; id.data[i + 3] = 255;
    }
    x.putImageData(id, 0, 0);
    return tex(c, false);
  };

  /* Distant panoramas painted procedurally */
  T.panorama = (kind, cols, seed = 4) => {
    const W = 2048, H = 512, c = cv(W, H), x = c.getContext('2d', { willReadFrequently: true }), r = IR.rng(seed);
    const base = H - 6;
    const wrapFill = (fn) => { for (const ox of [0, -W, W]) { x.save(); x.translate(ox, 0); fn(); x.restore(); } };
    const layer = (col, scale, alpha) => {
      x.globalAlpha = alpha; x.fillStyle = col;
      if (kind === 'ghats' || kind === 'delhi' || kind === 'pink') {
        let px = 0;
        while (px < W) {
          const w = 20 + r() * 60 * scale, h = (25 + r() * 80) * scale, t = r(), X = px;
          wrapFill(() => {
            x.fillRect(X, base - h, w, h + 10);
            if (t < 0.22) {
              const bw = 26 + r() * 30, bh = (90 + r() * 120) * scale, cx = X + w / 2;
              x.beginPath(); x.moveTo(cx - bw / 2, base - h); x.quadraticCurveTo(cx - bw * 0.55, base - h - bh * 0.6, cx, base - h - bh);
              x.quadraticCurveTo(cx + bw * 0.55, base - h - bh * 0.6, cx + bw / 2, base - h); x.fill();
              x.fillRect(cx - 1.5, base - h - bh - 14, 3, 14);
            } else if (t < 0.4) {
              const rad = 10 + r() * 22 * scale; x.beginPath(); x.arc(X + w / 2, base - h, rad, Math.PI, 0); x.fill();
              x.fillRect(X + w / 2 - 1, base - h - rad - 10, 2, 10);
            } else if (t < 0.48 && kind === 'delhi') {
              x.fillRect(X + w / 2 - 4, base - h - 140 * scale, 8, 140 * scale);
              x.beginPath(); x.arc(X + w / 2, base - h - 140 * scale, 9, Math.PI, 0); x.fill();
            }
          });
          px += w * (0.7 + r() * 0.5);
        }
        if (kind === 'delhi') wrapFill(() => {
          const cx = W * 0.3, h = 210 * scale, w = 120 * scale;
          x.fillRect(cx - w / 2, base - h, w, h);
          x.globalCompositeOperation = 'destination-out';
          x.beginPath(); x.moveTo(cx - w * 0.22, base); x.lineTo(cx - w * 0.22, base - h * 0.55); x.arc(cx, base - h * 0.55, w * 0.22, Math.PI, 0); x.lineTo(cx + w * 0.22, base); x.fill();
          x.globalCompositeOperation = 'source-over';
        });
      } else if (kind === 'mountains' || kind === 'hills') {
        const pts = []; let h = 0.5;
        for (let i = 0; i <= 64; i++) { h = IR.clamp(h + (r() - 0.5) * (kind === 'mountains' ? 0.6 : 0.25), 0.15, 1); pts.push(h); }
        pts[64] = pts[0];
        const peak = (kind === 'mountains' ? 360 : 150) * scale;
        wrapFill(() => {
          x.beginPath(); x.moveTo(0, H);
          for (let i = 0; i <= 64; i++) x.lineTo((i / 64) * W, base - pts[i] * peak);
          x.lineTo(W, H); x.fill();
          if (kind === 'mountains' && scale > 0.8) {
            x.save(); x.clip();
            const g = x.createLinearGradient(0, base - peak, 0, base - peak * 0.35);
            g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
            x.fillStyle = g; x.fillRect(0, 0, W, H); x.restore();
          }
          if (kind === 'hills' && scale > 0.8) {
            x.fillStyle = cols[2] || col;
            for (let i = 6; i < 60; i += 1) {
              const yy = base - pts[i] * peak; x.fillRect((i / 64) * W, yy - 16, W / 64 + 1, 16);
              if (i % 2) x.fillRect((i / 64) * W + 4, yy - 24, 10, 8);
              if (i % 9 === 0) { x.fillRect((i / 64) * W, yy - 40, 22, 40); x.beginPath(); x.arc((i / 64) * W + 11, yy - 40, 11, Math.PI, 0); x.fill(); }
            }
            x.fillStyle = col;
          }
        });
      } else if (kind === 'skyline') {
        let px = 0;
        while (px < W) {
          const w = 30 + r() * 70, h = (60 + r() * 260) * scale, X = px;
          wrapFill(() => {
            x.fillStyle = col; x.fillRect(X, base - h, w, h + 10);
            if (r() < 0.25) x.fillRect(X + w / 2 - 1, base - h - 30, 2, 30);
            if (scale > 0.8) for (let wy = base - h + 8; wy < base - 6; wy += 9) for (let wx = X + 4; wx < X + w - 4; wx += 8) if (r() < 0.3) { x.fillStyle = r() < 0.7 ? '#ffd890' : '#bfe3ff'; x.fillRect(wx, wy, 3, 4); }
          });
          px += w * (0.8 + r() * 0.5);
        }
      }
      x.globalAlpha = 1;
    };
    layer(cols[0], 1.25, 0.55);
    layer(cols[1], 0.85, 0.9);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.repeat.x = 2;
    return t;
  };
})();
