/* =========================================================
   INPUT — keyboard, virtual joystick (touch), action edges
   ========================================================= */
const Input = {
  down: new Set(), edge: new Set(),
  map: {
    up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'], left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'],
    dash: ['Space', 'ShiftLeft', 'ShiftRight', 'KeyX'], ok: ['Enter', 'NumpadEnter', 'KeyZ', 'Space'], back: ['Escape', 'KeyP'], mute: ['KeyM'],
  },
  joy: { on: false, x: 0, y: 0, id: null, cx: 0, cy: 0 },
  touchDash: false,
  init() {
    window.addEventListener('keydown', (e) => {
      Sound.init();
      if (e.repeat) { if (this.isGameKey(e.code)) e.preventDefault(); return; }
      if (UI.onKey(e)) { e.preventDefault(); return; }
      this.down.add(e.code); this.edge.add(e.code);
      if (this.isGameKey(e.code) && !(e.target && e.target.tagName === 'INPUT')) e.preventDefault();
      if (e.code === 'KeyM' && !(e.target && e.target.tagName === 'INPUT')) { const m = Sound.toggleMute(); UI.toast(m ? 'SOUND OFF' : 'SOUND ON', 'Press M to toggle.', 'info'); }
    });
    window.addEventListener('keyup', (e) => { this.down.delete(e.code); });
    window.addEventListener('blur', () => { this.down.clear(); this.joy.on = false; this.joy.x = this.joy.y = 0; });
    window.addEventListener('pointerdown', () => Sound.init(), { capture: true });
    // virtual joystick
    const joy = document.getElementById('joy'), knob = document.getElementById('knob');
    const setKnob = (dx, dy) => { knob.style.transform = `translate(${dx}px, ${dy}px)`; };
    joy.addEventListener('pointerdown', (e) => {
      e.preventDefault(); try { joy.setPointerCapture(e.pointerId); } catch (err) { /* synthetic or lost pointer */ }
      const r = joy.getBoundingClientRect();
      this.joy.on = true; this.joy.id = e.pointerId; this.joy.cx = r.left + r.width / 2; this.joy.cy = r.top + r.height / 2; this.joyMove(e, setKnob, r.width / 2);
    });
    joy.addEventListener('pointermove', (e) => { if (this.joy.on && e.pointerId === this.joy.id) { const r = joy.getBoundingClientRect(); this.joyMove(e, setKnob, r.width / 2); } });
    const end = (e) => { if (e.pointerId === this.joy.id) { this.joy.on = false; this.joy.x = this.joy.y = 0; setKnob(0, 0); } };
    joy.addEventListener('pointerup', end); joy.addEventListener('pointercancel', end);
    const dashBtn = document.getElementById('tdash');
    dashBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); this.touchDash = true; });
    document.getElementById('tpause').addEventListener('click', (e) => { e.preventDefault(); if (Game.scene && Game.scene.togglePause) Game.scene.togglePause(); });
  },
  joyMove(e, setKnob, rad) {
    let dx = e.clientX - this.joy.cx, dy = e.clientY - this.joy.cy;
    const d = Math.hypot(dx, dy), max = rad * 0.75;
    if (d > max) { dx *= max / d; dy *= max / d; }
    this.joy.x = dx / max; this.joy.y = dy / max;
    const k = 23 / max; setKnob(dx * k, dy * k);
  },
  isGameKey(code) { for (const k in this.map) if (this.map[k].includes(code)) return true; return false; },
  isDown(a) { return this.map[a].some((c) => this.down.has(c)); },
  pressed(a) {
    if (a === 'dash' && this.touchDash) return true;
    return this.map[a].some((c) => this.edge.has(c));
  },
  axis() {
    let x = 0, y = 0;
    if (this.isDown('left')) x -= 1; if (this.isDown('right')) x += 1;
    if (this.isDown('up')) y -= 1; if (this.isDown('down')) y += 1;
    if (this.joy.on) { x = this.joy.x; y = this.joy.y; const m = Math.hypot(x, y); if (m < 0.18) { x = 0; y = 0; } }
    const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
    return { x, y };
  },
  endFrame() { this.edge.clear(); this.touchDash = false; },
};
