'use strict';
/* =========================================================
   SURVIVAL CLAUSE — core utilities, persistence, scene base
   ========================================================= */
const VW = 480, VH = 270;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
const rndi = (a, b) => Math.floor(rnd(a, b + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const chance = (p) => Math.random() < p;
const dist2 = (ax, ay, bx, by) => (ax - bx) * (ax - bx) + (ay - by) * (ay - by);
const dist = (ax, ay, bx, by) => Math.sqrt(dist2(ax, ay, bx, by));
const angTo = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);
const approach = (v, target, d) => (v < target ? Math.min(v + d, target) : Math.max(v - d, target));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const money = (n) => (n < 0 ? '-' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-US');
const moneyS = (n) => (n >= 0 ? '+' : '-') + '$' + Math.abs(Math.round(n)).toLocaleString('en-US');
const moneyK = (n) => {
  const a = Math.abs(n), s = n < 0 ? '-' : '';
  if (a >= 1000) return s + '$' + (Math.round(a / 100) / 10).toFixed(a >= 100000 ? 0 : 1).replace(/\.0$/, '') + 'K';
  return s + '$' + Math.round(a);
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const Ease = {
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inCubic: (t) => t * t * t,
  inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  outBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outElastic: (t) => (t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
};
const REDUCED_MOTION = (() => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
const IS_TOUCH = (() => { try { return ('ontouchstart' in window) || window.matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } })();

/* ---------- persistence (one viewer's browser only; always optional) ---------- */
const Store = {
  key: 'survival-clause-v1',
  data: null,
  defaults() {
    return {
      settings: { music: 0.55, sfx: 0.8, textSpeed: 2, shake: !REDUCED_MOTION, crt: !REDUCED_MOTION, pixelPerfect: false },
      codex: {}, ach: {}, runs: 0, best: null, endings: {}, checkpoint: null,
    };
  },
  load(extra) {
    let d = null;
    try { const s = window.localStorage.getItem(this.key); if (s) d = JSON.parse(s); } catch (e) { d = null; }
    if (!d && extra) d = extra;
    const def = this.defaults();
    this.data = Object.assign(def, d || {});
    this.data.settings = Object.assign(def.settings, (d && d.settings) || {});
  },
  save() {
    try { window.localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { /* storage unavailable: play on */ }
  },
  get S() { return this.data.settings; },
};

/* ---------- scene base with abortable async scripting ---------- */
class Abort extends Error {}
class Scene {
  constructor() { this.alive = true; this.t = 0; }
  enter() {}
  exit() {}
  update(dt) { this.t += dt; }
  draw(g) {}
  wait(ms) {
    return new Promise((res, rej) => setTimeout(() => (this.alive ? res() : rej(new Abort())), ms));
  }
  guard(p) {
    return Promise.resolve(p).then((v) => { if (!this.alive) throw new Abort(); return v; });
  }
  run(fn) {
    Promise.resolve().then(() => fn.call(this)).catch((e) => { if (!(e instanceof Abort)) console.error(e); });
  }
}

/* ---------- tiny event log for tests ---------- */
const DEBUG = window.__SC_DEBUG || null;
const log = (...a) => { if (DEBUG) console.log('[SC]', ...a); };
