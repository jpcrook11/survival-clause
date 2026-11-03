/* =========================================================
   MAIN — scene manager, pause menu, checkpoints, boot
   ========================================================= */
const Game = {
  scene: null, busy: false,
  set(s) {
    if (this.scene) { this.scene.alive = false; try { this.scene.exit(); } catch (e) { console.error(e); } }
    UI.clear(); FX.clear();
    this.scene = s; s.alive = true;
    try { s.enter(); } catch (e) { console.error(e); }
  },
  go(make, color) {
    if (this.busy) return;
    this.busy = true;
    Trans.run(() => { this.set(make()); }, () => { this.busy = false; }, color);
  },
};

function openPauseMenu(onResume) {
  let m;
  const body = h('div', { style: { width: '220px' } },
    h('div', { class: 'p2p gold', style: { marginBottom: '10px' } }, 'PAUSED'),
    h('div', { class: 'optlist' },
      UI.btn('RESUME', () => m.close(), { id: 'btn-resume' }),
      UI.btn('CLAUSE CODEX', () => openCodex()),
      UI.btn('HOW TO PLAY', () => openHowTo()),
      UI.btn('SETTINGS', () => openSettings()),
      UI.btn('QUIT TO TITLE', () => { m.close(); Game.go(() => new TitleScene()); }, { cls: 'red' })),
    h('div', { class: 'silk dim', style: { marginTop: '10px' } }, 'PROGRESS SAVES AT EACH CHAPTER AND YEAR.'));
  m = UI.modal(body, { onClose: () => onResume && onResume(), focusSel: '#btn-resume' });
  return m;
}

function resumeCheckpoint() {
  const ck = Store.data.checkpoint;
  if (!ck || !ck.run) return;
  RUN = JSON.parse(JSON.stringify(ck.run));
  if (!RUN.stats) RUN.stats = newStats();
  const map = {
    offer: () => new OfferScene(),
    career: () => new CareerScene(),
    exit: () => new ExitScene(),
    arena: () => new ArenaScene((ck.extra && ck.extra.wave) || 0),
  };
  Game.go(map[ck.scene] || (() => new TitleScene()));
}

let _last = 0;
function loop(now) {
  const dt = Math.min(0.05, Math.max(0, (now - _last) / 1000));
  _last = now;
  try {
    const sc = Game.scene;
    if (sc) {
      const arena = sc instanceof ArenaScene;
      if (!arena && !(sc instanceof TitleScene) && Input.pressed('back') && !UI.scopes.some((s) => s.isConnected) && !Trans.active) openPauseMenu();
      sc.update(dt);
    }
    FX.update(dt); Trans.update(dt); UI.tick(dt);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, VW, VH);
    if (Game.scene) {
      if (Game.scene instanceof ArenaScene) Game.scene.draw();
      else { g.save(); g.translate(FX.ox, FX.oy); Game.scene.draw(); FX.drawParts(); FX.drawFloats(); g.restore(); FX.drawFlash(); }
    }
    Trans.draw();
  } catch (e) { console.error(e); }
  Input.endFrame();
  requestAnimationFrame(loop);
}

function boot(hot) {
  Store.load(hot && hot.store);
  document.body.classList.toggle('crt', !!Store.S.crt);
  if (IS_TOUCH) document.body.classList.add('touch');
  fitStage(); UI.init(); Input.init();
  document.getElementById('rotate').addEventListener('click', () => document.body.classList.add('rot-ok'));
  try { if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => ({ store: Store.data })); } catch (e) { /* not in viewer */ }
  let started = false;
  const start = () => {
    if (started) return; started = true;
    Game.set(new TitleScene());
    requestAnimationFrame((t) => { _last = t; loop(t); });
  };
  try {
    if (document.fonts && document.fonts.load) {
      Promise.all([document.fonts.load("8px 'Press Start 2P'"), document.fonts.load("16px 'VT323'"), document.fonts.load("8px 'Silkscreen'")]).then(start, start);
      setTimeout(start, 1500);
    } else start();
  } catch (e) { start(); }
}

if (!window.__SC_PREVIEW) {
  const hot = window.claude && window.claude.hot;
  if (hot && hot.ready) hot.ready(boot); else boot((hot && hot.data) || {});
}
