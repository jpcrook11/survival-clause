/* =========================================================
   GRAPHICS — palette, sprites, bitmap fonts, effects, scaling
   ========================================================= */
const cv = document.getElementById('cv');
const g = cv.getContext('2d');
g.imageSmoothingEnabled = false;
const trCv = document.getElementById('tr');
const tg = trCv.getContext('2d');
tg.imageSmoothingEnabled = false;
const stageEl = document.getElementById('stage');

const PAL = {
  k: '#0e0c17', n: '#1a1c2c', N: '#29366f', b: '#3b5dc9', c: '#41a6f6', C: '#73eff7',
  w: '#f4f4f4', l: '#94b0c2', g: '#566c86', G: '#333c57', p: '#5d275d', v: '#7b3fb0', V: '#b57bd8',
  r: '#b13e53', R: '#e04050', o: '#ef7d57', y: '#ffcd75', Y: '#f8e7a0', e: '#efe3c4', E: '#c9b48a',
  h: '#8a5a3c', H: '#5b3a29', L: '#a7f070', m: '#38b764', M: '#257179', s: '#f0c8a0', S: '#c98f68',
  u: '#e8b44a', U: '#a8741a', t: '#3fbfa0', T: '#1f6f63', x: '#2a1e14', z: '#14121f', q: '#7a1f2e',
  d: '#d0344a', D: '#2a52d4', j: '#4a2a5e', J: '#9d7bc7',
};
const hexRGB = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const col = (c) => (c && c[0] === '#' ? c : PAL[c] || c);

/* ---------- sprites ---------- */
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; }
function compileRows(rows, map = {}) {
  const h = rows.length, w = Math.max(...rows.map((r) => r.length));
  const [c, x] = makeCanvas(w, h);
  const img = x.createImageData(w, h);
  for (let j = 0; j < h; j++) {
    const row = rows[j];
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '.' || ch === ' ') continue;
      const cc = map[ch] !== undefined ? map[ch] : PAL[ch];
      if (!cc) continue;
      const [r, gg, b] = hexRGB(col(cc));
      const o = (j * w + i) * 4;
      img.data[o] = r; img.data[o + 1] = gg; img.data[o + 2] = b; img.data[o + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);
  return { c, w, h };
}
const _flipCache = new WeakMap();
function flipX(s) {
  let f = _flipCache.get(s);
  if (!f) {
    const [c, x] = makeCanvas(s.w, s.h);
    x.translate(s.w, 0); x.scale(-1, 1); x.drawImage(s.c, 0, 0);
    f = { c, w: s.w, h: s.h }; _flipCache.set(s, f);
  }
  return f;
}
const _silCache = new Map();
function silhouette(s, color) {
  let m = _silCache.get(s);
  if (!m) { m = {}; _silCache.set(s, m); }
  if (!m[color]) {
    const [c, x] = makeCanvas(s.w, s.h);
    x.drawImage(s.c, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col(color); x.fillRect(0, 0, s.w, s.h);
    m[color] = { c, w: s.w, h: s.h };
  }
  return m[color];
}
/** add a 1px outline around all opaque pixels (sprite must have 1px transparent margin) */
function outlineSprite(s, color = PAL.k) {
  const [c, x] = makeCanvas(s.w, s.h);
  const sil = silhouette(s, color);
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) x.drawImage(sil.c, dx, dy);
  x.drawImage(s.c, 0, 0);
  return { c, w: s.w, h: s.h };
}
function spr(s, x, y, o) {
  if (!s) return;
  let src = s;
  if (o) {
    if (o.flip) src = flipX(src);
    if (o.flash) src = silhouette(src, o.flash);
    if (o.alpha !== undefined) g.globalAlpha = o.alpha;
    if (o.scale && o.scale !== 1) {
      g.drawImage(src.c, Math.round(x), Math.round(y), src.w * o.scale, src.h * o.scale);
      g.globalAlpha = 1; return;
    }
  }
  g.drawImage(src.c, Math.round(x), Math.round(y));
  if (o && o.alpha !== undefined) g.globalAlpha = 1;
}
function rect(x, y, w, h, c) { g.fillStyle = col(c); g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function rectO(x, y, w, h, c) { g.fillStyle = col(c); x = Math.round(x); y = Math.round(y); g.fillRect(x, y, w, 1); g.fillRect(x, y + h - 1, w, 1); g.fillRect(x, y, 1, h); g.fillRect(x + w - 1, y, 1, h); }
function px(x, y, c) { g.fillStyle = col(c); g.fillRect(Math.round(x), Math.round(y), 1, 1); }
function disc(cx, cy, r, c) {
  g.fillStyle = col(c);
  for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1); }
}
function ring(cx, cy, r, c) {
  g.fillStyle = col(c);
  const n = Math.max(12, Math.floor(r * 6));
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU; g.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1); }
}
function line(x0, y0, x1, y1, c) {
  g.fillStyle = col(c);
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (let i = 0; i < 2000; i++) {
    g.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}
function dither(x, y, w, h, c, phase = 0) {
  g.fillStyle = col(c);
  for (let j = 0; j < h; j++) for (let i = (j + phase) & 1; i < w; i += 2) g.fillRect(x + i, y + j, 1, 1);
}

/* ---------- bitmap fonts (rasterized from Press Start 2P and Silkscreen) ---------- */
const FONTS = {};
(function buildFonts() {
  for (const name of Object.keys(GLYPH_DATA)) {
    const data = GLYPH_DATA[name];
    const map = {}; let total = 0;
    for (const code in data.g) { const e = data.g[code]; map[code] = { x: total, w: e[0] }; total += e[0] + 1; }
    const [c, x] = makeCanvas(total, data.h);
    const img = x.createImageData(total, data.h);
    for (const code in data.g) {
      const e = data.g[code], ox = map[code].x;
      for (let j = 0; j < data.h; j++) {
        const bits = e[1 + j];
        for (let i = 0; i < e[0]; i++) if ((bits >> i) & 1) { const o = (j * total + ox + i) * 4; img.data[o] = img.data[o + 1] = img.data[o + 2] = img.data[o + 3] = 255; }
      }
    }
    x.putImageData(img, 0, 0);
    FONTS[name] = { h: data.h, map, atlas: c, tints: {} };
  }
})();
function fontTint(f, color) {
  const key = col(color);
  if (!f.tints[key]) {
    const [c, x] = makeCanvas(f.atlas.width, f.atlas.height);
    x.drawImage(f.atlas, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = key; x.fillRect(0, 0, c.width, c.height);
    f.tints[key] = c;
  }
  return f.tints[key];
}
function textW(str, font = 'silk') {
  const f = FONTS[font]; let w = 0;
  for (const ch of String(str)) { const m = f.map[ch.charCodeAt(0)] || f.map[63]; w += m.w; }
  return w;
}
/** draw bitmap text. o: {font, align:'left'|'center'|'right', shadow, scale, outline} */
function text(str, x, y, color = PAL.w, o = {}) {
  str = String(str);
  const font = o.font || 'silk', f = FONTS[font], sc = o.scale || 1;
  const w = textW(str, font) * sc;
  if (o.align === 'center') x -= Math.floor(w / 2); else if (o.align === 'right') x -= w;
  x = Math.round(x); y = Math.round(y);
  if (o.outline) { for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) text(str, x + dx * sc, y + dy * sc, o.outline, { font, scale: sc }); }
  if (o.shadow) text(str, x + sc, y + sc, o.shadow, { font, scale: sc });
  const atlas = fontTint(f, color);
  let cx = x;
  for (const ch of str) {
    const m = f.map[ch.charCodeAt(0)] || f.map[63];
    g.drawImage(atlas, m.x, 0, m.w, f.h, cx, y, m.w * sc, f.h * sc);
    cx += m.w * sc;
  }
  return w;
}
function wrapText(str, maxW, font = 'silk') {
  const out = [];
  for (const para of String(str).split('\n')) {
    const words = para.split(' '); let line = '';
    for (const wd of words) {
      const t = line ? line + ' ' + wd : wd;
      if (textW(t, font) > maxW && line) { out.push(line); line = wd; } else line = t;
    }
    out.push(line);
  }
  return out;
}

/* ---------- effects: particles, floating text, shake, flash ---------- */
const FX = {
  parts: [], floats: [], shakeT: 0, shakeMag: 0, flashT: 0, flashMax: 0, flashCol: '#fff', ox: 0, oy: 0,
  clear() { this.parts.length = 0; this.floats.length = 0; this.shakeT = 0; this.flashT = 0; },
  burst(x, y, n, colors, o = {}) {
    for (let i = 0; i < n; i++) {
      const a = o.ang !== undefined ? o.ang + rnd(-(o.spread || 0.5), o.spread || 0.5) : rnd(TAU);
      const sp = rnd(o.spdMin || 20, o.spd || 70);
      this.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0), life: rnd(o.lifeMin || 0.3, o.life || 0.8), t: 0, c: pick(colors), sz: o.size || 1, grav: o.grav !== undefined ? o.grav : 90, drag: o.drag || 0.9, shape: o.shape || 'px' });
    }
  },
  paper(x, y, n) { this.burst(x, y, n, ['#efe3c4', '#f4f4f4', '#c9b48a'], { spd: 80, life: 1.1, grav: 60, size: 2, shape: 'paper', up: 30 }); },
  coins(x, y, n) { this.burst(x, y, n, ['#ffcd75', '#e8b44a', '#a7f070'], { spd: 70, life: 0.7, grav: 140, size: 1, up: 40 }); },
  float(x, y, str, color = PAL.w, o = {}) {
    this.floats.push({ x, y, str, c: color, t: 0, life: o.life || 1.1, vy: o.vy || -22, font: o.font || 'silk', big: !!o.big, outline: o.outline || PAL.k });
  },
  shake(mag, t) { if (!Store.S.shake) return; if (mag >= this.shakeMag || this.shakeT <= 0) { this.shakeMag = mag; this.shakeT = t; } },
  flash(c, t) { if (REDUCED_MOTION) t = Math.min(t, 0.08); this.flashCol = c; this.flashT = t; this.flashMax = t; },
  update(dt) {
    for (const p of this.parts) { p.t += dt; p.vy += p.grav * dt; p.vx *= Math.pow(p.drag, dt * 10); p.x += p.vx * dt; p.y += p.vy * dt; }
    this.parts = this.parts.filter((p) => p.t < p.life);
    for (const f of this.floats) { f.t += dt; f.y += f.vy * dt; f.vy *= Math.pow(0.2, dt); }
    this.floats = this.floats.filter((f) => f.t < f.life);
    if (this.shakeT > 0) { this.shakeT -= dt; const m = this.shakeMag * clamp(this.shakeT * 4, 0, 1); this.ox = Math.round(rnd(-m, m)); this.oy = Math.round(rnd(-m, m)); } else { this.ox = 0; this.oy = 0; }
    if (this.flashT > 0) this.flashT -= dt;
  },
  drawParts() {
    for (const p of this.parts) {
      const a = 1 - p.t / p.life;
      g.globalAlpha = clamp(a * 1.5, 0, 1);
      if (p.shape === 'paper') { rect(p.x, p.y, p.sz + 1, p.sz, p.c); px(p.x, p.y, '#c9b48a'); }
      else rect(p.x, p.y, p.sz, p.sz, p.c);
    }
    g.globalAlpha = 1;
  },
  drawFloats() {
    for (const f of this.floats) {
      const a = 1 - Math.max(0, (f.t - f.life * 0.6) / (f.life * 0.4));
      g.globalAlpha = clamp(a, 0, 1);
      text(f.str, f.x, f.y, f.c, { font: f.font, align: 'center', outline: f.outline });
    }
    g.globalAlpha = 1;
  },
  drawFlash() {
    if (this.flashT > 0) { g.globalAlpha = clamp(this.flashT / this.flashMax, 0, 1) * 0.55; rect(0, 0, VW, VH, this.flashCol); g.globalAlpha = 1; }
  },
};

/* ---------- screen transitions (drawn on the top canvas, above the HTML UI) ---------- */
const Trans = {
  active: false, t: 0, dur: 0.42, phase: 0, onMid: null, onEnd: null, color: PAL.k,
  run(onMid, onEnd, color) {
    this.active = true; this.t = 0; this.phase = 0; this.onMid = onMid; this.onEnd = onEnd; this.color = color || PAL.k;
  },
  update(dt) {
    if (!this.active) return;
    this.t += dt;
    if (this.phase === 0 && this.t >= this.dur) {
      this.phase = 1; this.t = 0;
      try { this.onMid && this.onMid(); } catch (e) { console.error(e); }
    } else if (this.phase === 1 && this.t >= this.dur) {
      this.active = false; tg.clearRect(0, 0, VW, VH);
      const f = this.onEnd; this.onEnd = null; f && f();
    }
  },
  draw() {
    if (!this.active) return;
    tg.clearRect(0, 0, VW, VH);
    let p = clamp(this.t / this.dur, 0, 1);
    if (this.phase === 1) p = 1 - p;
    tg.fillStyle = this.color;
    const cs = 20, cols = Math.ceil(VW / cs) + 1, rows = Math.ceil(VH / cs) + 1;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const local = clamp(p * 2.2 - ((i + j) / (cols + rows)) * 1.2, 0, 1);
      if (local <= 0) continue;
      const r = local * cs * 0.75 + 0.5;
      const cx = i * cs, cy = j * cs;
      tg.beginPath(); tg.moveTo(cx, cy - r); tg.lineTo(cx + r, cy); tg.lineTo(cx, cy + r); tg.lineTo(cx - r, cy); tg.closePath(); tg.fill();
    }
  },
};

/* ---------- stage scaling ---------- */
let STAGE_SCALE = 1;
function fitStage() {
  const w = window.innerWidth, h = window.innerHeight;
  let s = Math.min(w / VW, h / VH);
  if (Store.data && Store.S.pixelPerfect && s >= 1) s = Math.max(1, Math.floor(s));
  STAGE_SCALE = s;
  stageEl.style.transform = `translate(${-VW * s / 2}px, ${-VH * s / 2}px) scale(${s})`;
}
window.addEventListener('resize', fitStage);
