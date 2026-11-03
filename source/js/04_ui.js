/* =========================================================
   UI — HTML overlay: dialogue, choices, modals, toasts,
   keyboard spatial navigation
   ========================================================= */
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(3)) {
    if (kid === null || kid === undefined || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

const SEC = (n) => `<span class="sec">§</span>${n}`;
const UI = {
  root: document.getElementById('ui'),
  toasts: null,
  handlers: [],
  scopes: [],
  portraits: [],
  init() {
    this.toasts = h('div', { id: 'toasts' });
    stageEl.appendChild(this.toasts);
    this.root.addEventListener('mouseover', (e) => {
      const b = e.target.closest('.btn,.cx-item');
      if (b && !b.disabled && b !== this._hov) { this._hov = b; Sound.sfx('blip'); }
    });
  },
  clear() {
    this.root.innerHTML = '';
    this.handlers = []; this.scopes = []; this.portraits = [];
  },
  add(el) { this.root.appendChild(el); return el; },
  btn(label, onClick, o = {}) {
    const b = h('button', { class: 'btn ' + (o.cls || ''), type: 'button', disabled: !!o.disabled, title: o.title, id: o.id, 'aria-label': o.aria });
    b.innerHTML = label;
    if (o.style) Object.assign(b.style, o.style);
    b.addEventListener('click', (e) => {
      if (b.disabled) return;
      Sound.init();
      if (o.sfx !== false) Sound.sfx(o.sfx || 'select');
      onClick && onClick(e, b);
    });
    return b;
  },
  pushHandler(fn) { this.handlers.push(fn); return () => { const i = this.handlers.indexOf(fn); if (i >= 0) this.handlers.splice(i, 1); }; },
  pushScope(el) { this.scopes.push(el); return () => { const i = this.scopes.indexOf(el); if (i >= 0) this.scopes.splice(i, 1); }; },
  scope() {
    for (let i = this.scopes.length - 1; i >= 0; i--) if (this.scopes[i].isConnected) return this.scopes[i];
    return this.root;
  },
  onKey(e) {
    const tgt = e.target;
    const inInput = tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA');
    for (let i = this.handlers.length - 1; i >= 0; i--) { if (this.handlers[i](e)) return true; }
    if (inInput && !['Enter', 'Escape', 'ArrowUp', 'ArrowDown'].includes(e.code)) return false;
    const dirs = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right' };
    if (Game.scene && Game.scene.wantsKeys && Game.scene.wantsKeys(e)) return false;
    if (dirs[e.code] && !inInput) return this.navigate(dirs[e.code]);
    if (inInput && (e.code === 'ArrowUp' || e.code === 'ArrowDown')) return this.navigate(e.code === 'ArrowUp' ? 'up' : 'down');
    if ((e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter') && !inInput) {
      const a = document.activeElement;
      if (a && this.root.contains(a) && (a.tagName === 'BUTTON') && !a.disabled) { a.click(); return true; }
      const items = this.focusables();
      if (items.length && Game.scene && !Game.scene.noAutoFocus) { items[0].focus(); return true; }
    }
    return false;
  },
  focusables(scope) {
    scope = scope || this.scope();
    return [...scope.querySelectorAll('button:not([disabled]), input, [data-nav]')].filter((el) => el.offsetParent !== null && !el.closest('.hidden'));
  },
  navigate(dir) {
    const items = this.focusables();
    if (!items.length) return false;
    const cur = document.activeElement;
    if (!items.includes(cur)) { items[0].focus(); Sound.sfx('blip'); return true; }
    const r0 = cur.getBoundingClientRect(), x0 = r0.left + r0.width / 2, y0 = r0.top + r0.height / 2;
    let best = null, bs = Infinity;
    for (const el of items) {
      if (el === cur) continue;
      const r = el.getBoundingClientRect(), dx = r.left + r.width / 2 - x0, dy = r.top + r.height / 2 - y0;
      let p, s;
      if (dir === 'down') { if (dy <= 3) continue; p = dy; s = Math.abs(dx); }
      else if (dir === 'up') { if (dy >= -3) continue; p = -dy; s = Math.abs(dx); }
      else if (dir === 'right') { if (dx <= 3) continue; p = dx; s = Math.abs(dy); }
      else { if (dx >= -3) continue; p = -dx; s = Math.abs(dy); }
      const sc = p + s * 2.2;
      if (sc < bs) { bs = sc; best = el; }
    }
    if (!best) {
      const i = items.indexOf(cur);
      best = dir === 'down' || dir === 'right' ? items[(i + 1) % items.length] : items[(i - 1 + items.length) % items.length];
    }
    best.focus({ preventScroll: false });
    if (best.scrollIntoView) best.scrollIntoView({ block: 'nearest' });
    return true;
  },
  focusFirst(scope, sel) {
    const items = this.focusables(scope);
    const el = sel ? (scope || this.root).querySelector(sel) : items[0];
    if (el) setTimeout(() => { if (el.isConnected) el.focus({ preventScroll: true }); }, 30);
  },

  /* ---- portraits that animate while speaking ---- */
  portraitCanvas(spec, expr) {
    const c = h('canvas', { class: 'pf', width: 32, height: 32 });
    const p = { c, x: c.getContext('2d'), spec, expr: expr || 'neutral', talkUntil: 0, t: rnd(5) };
    p.x.imageSmoothingEnabled = false;
    this.portraits.push(p);
    drawPortrait(p.x, 0, 0, spec, p.expr, false, false);
    return p;
  },
  tick(dt) {
    const now = performance.now();
    this.portraits = this.portraits.filter((p) => p.c.isConnected || now - (p.born || (p.born = now)) < 2000);
    for (const p of this.portraits) {
      p.t += dt;
      const talking = now < p.talkUntil && Math.floor(p.t * 9) % 2 === 0;
      const blink = (p.t % 3.7) < 0.12;
      p.x.clearRect(0, 0, 32, 32);
      drawPortrait(p.x, 0, 0, p.spec, p.expr, talking, blink);
    }
  },

  /* ---- dialogue ---- */
  say(o) {
    return new Promise((resolve) => {
      const old = this.root.querySelector('.dlg'); if (old) old.remove();
      const box = h('div', { class: 'dlg frame ' + (o.cls || ''), role: 'dialog', 'aria-live': 'polite' });
      let pf = null;
      if (o.pf) { pf = this.portraitCanvas(o.pf, o.expr); box.append(pf.c); }
      const txt = h('div', { class: 'txt' });
      const body = h('div', { class: 'body' }, h('div', { class: 'who' }, o.who || '', o.role ? h('span', { class: 'role' }, o.role) : null), txt);
      const more = h('div', { class: 'more' });
      box.append(body, more);
      more.style.visibility = 'hidden';
      this.root.appendChild(box);
      const full = o.text; let shown = 0, done = false, closed = false;
      const cps = [0, 140, 70, 38][Store.S.textSpeed] || 70;
      const voice = o.voice || 520;
      const finish = () => { shown = full.length; txt.textContent = full; done = true; more.style.visibility = 'visible'; if (pf) pf.talkUntil = 0; };
      const close = () => {
        if (closed) return; closed = true; unh(); clearInterval(timer);
        if (!o.keep) box.remove();
        Sound.sfx('tick');
        resolve();
      };
      const adv = () => { if (!done) finish(); else close(); };
      box.addEventListener('click', (e) => { e.stopPropagation(); adv(); });
      const unh = this.pushHandler((e) => {
        if (['Enter', 'Space', 'NumpadEnter', 'KeyZ'].includes(e.code)) { adv(); return true; }
        if (e.code === 'Escape' && o.skippable) { finish(); close(); return true; }
        return false;
      });
      let timer = null;
      if (cps === 0) finish();
      else {
        if (pf) pf.talkUntil = performance.now() + (full.length / cps) * 1000;
        let acc = 0, last = performance.now();
        timer = setInterval(() => {
          if (!box.isConnected) { clearInterval(timer); if (!closed) { closed = true; unh(); resolve(); } return; }
          const now = performance.now(); acc += ((now - last) / 1000) * cps; last = now;
          const n = Math.floor(acc);
          if (n > 0 && !done) {
            acc -= n; shown = Math.min(full.length, shown + n);
            txt.textContent = full.slice(0, shown);
            if (shown % 3 === 0 && full[shown - 1] !== ' ') Sound.sfx('talk', voice + rnd(-20, 20));
            if (shown >= full.length) finish();
          }
        }, 16);
      }
      if (o.auto) setTimeout(() => { if (!closed) { finish(); close(); } }, o.auto);
    });
  },
  /** dialogue with choice buttons. options: [{label, sub, cost, value, disabled, cls}] */
  choose(o) {
    return new Promise((resolve) => {
      const old = this.root.querySelector('.dlg'); if (old) old.remove();
      const box = h('div', { class: 'dlg choices frame ' + (o.cls || '') });
      if (o.pf) box.append(this.portraitCanvas(o.pf, o.expr).c);
      const opts = h('div', { class: 'opts' });
      const body = h('div', { class: 'body' }, h('div', { class: 'who' }, o.who || ''), o.text ? h('div', { class: 'txt' }, o.text) : null, opts);
      box.append(body);
      const unscope = this.pushScope(box);
      for (const op of o.options) {
        const b = this.btn(op.label + (op.sub ? `<span class="sub">${op.sub}</span>` : ''), () => { unscope(); box.remove(); resolve(op.value !== undefined ? op.value : op); }, { cls: op.cls, disabled: op.disabled });
        opts.append(b);
      }
      this.root.appendChild(box);
      this.focusFirst(box);
    });
  },
  /** modal with scrim. returns {el, close} */
  modal(content, o = {}) {
    const scrim = h('div', { class: 'scrim' + (o.scrimCls ? ' ' + o.scrimCls : '') });
    const box = h('div', { class: (o.cls || 'modal panel frame') + ' scroll', role: 'dialog', 'aria-modal': 'true' }, content);
    if (o.style) Object.assign(box.style, o.style);
    scrim.append(box);
    this.root.appendChild(scrim);
    const unscope = this.pushScope(scrim);
    let closed = false;
    const close = (v) => {
      if (closed) return; closed = true;
      unscope(); unh(); scrim.remove();
      o.onClose && o.onClose(v);
    };
    const unh = this.pushHandler((e) => {
      if (e.code === 'Escape' && o.dismiss !== false) { Sound.sfx('cancel'); close(); return true; }
      return false;
    });
    if (o.dismiss !== false) scrim.addEventListener('click', (e) => { if (e.target === scrim) { Sound.sfx('cancel'); close(); } });
    if (o.focus !== false) this.focusFirst(box, o.focusSel);
    return { el: box, scrim, close };
  },
  toastPos(pos) {
    if (!this.toasts) return;
    const st = this.toasts.style;
    if (pos === 'bl') { st.left = '8px'; st.right = 'auto'; st.top = 'auto'; st.bottom = '8px'; st.alignItems = 'flex-start'; }
    else { st.left = ''; st.right = ''; st.top = ''; st.bottom = ''; st.alignItems = ''; }
  },
  toast(t1, t2, kind = 'info', ms = 3200) {
    if (!this.toasts) return;
    const el = h('div', { class: 'toast frame ' + kind }, h('div', { class: 't1' }, t1), t2 ? h('div', { class: 't2' }, t2) : null);
    if (/§/.test(t1)) el.firstChild.innerHTML = esc(t1).replace(/§/g, '<span class="sec">§</span>');
    this.toasts.appendChild(el);
    while (this.toasts.children.length > 3) this.toasts.firstChild.remove();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, ms);
  },
};
