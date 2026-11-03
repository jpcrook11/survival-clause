/* =========================================================
   SCENES — title, new-hire setup, intro
   ========================================================= */
function srand(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
const _bustCache = new Map();
function bust(spec, expr = 'neutral', talking = false, blink = false) {
  const key = (spec.id || 'x') + (spec.noBg ? '_nb' : '') + '|' + expr + '|' + (talking ? 1 : 0) + (blink ? 1 : 0);
  let c = _bustCache.get(key);
  if (!c) { const [cc, x] = makeCanvas(32, 32); drawPortrait(x, 0, 0, spec, expr, talking, blink); c = cc; _bustCache.set(key, c); }
  return c;
}
function drawBust(spec, x, y, scale, expr, talking, blink, flip) {
  const c = bust(spec, expr, talking, blink);
  if (flip) { g.save(); g.translate(Math.round(x) + 32 * scale, Math.round(y)); g.scale(-1, 1); g.drawImage(c, 0, 0, 32 * scale, 32 * scale); g.restore(); }
  else g.drawImage(c, Math.round(x), Math.round(y), 32 * scale, 32 * scale);
}

/* ---------- city backdrop (shared by title + intro) ---------- */
const City = {
  built: null,
  build() {
    const [c, x] = makeCanvas(VW, VH);
    const r = srand(7);
    const f = (a, b, w, h2, cl) => { x.fillStyle = cl; x.fillRect(a, b, w, h2); };
    const bands = ['#0e0c17', '#110f1d', '#141226', '#18162f', '#1c1b38', '#211f42', '#29284f'];
    for (let i = 0; i < bands.length; i++) f(0, i * 30, VW, 30, bands[i]);
    for (let i = 0; i < bands.length - 1; i++) for (let xx = (i % 2); xx < VW; xx += 2) f(xx, i * 30 + 29, 1, 1, bands[i + 1]);
    // moon
    x.fillStyle = '#f8e7a0'; for (let yy = -13; yy <= 13; yy++) { const w = Math.floor(Math.sqrt(169 - yy * yy)); x.fillRect(408 - w, 46 + yy, w * 2 + 1, 1); }
    f(402, 40, 3, 3, '#e3cf86'); f(411, 50, 4, 3, '#e3cf86'); f(409, 38, 2, 2, '#e3cf86');
    // far skyline
    let xx = 0;
    while (xx < VW) {
      const w = 14 + Math.floor(r() * 26), h2 = 40 + Math.floor(r() * 70);
      f(xx, 230 - h2, w, h2 + 40, '#1d1c33');
      for (let wy = 230 - h2 + 4; wy < 228; wy += 6) for (let wx = xx + 3; wx < xx + w - 3; wx += 5) if (r() < 0.22) f(wx, wy, 2, 2, r() < 0.8 ? '#4a4670' : '#ffcd75');
      xx += w + 2;
    }
    // near skyline
    xx = -10;
    while (xx < VW) {
      const w = 22 + Math.floor(r() * 34), h2 = 26 + Math.floor(r() * 50);
      f(xx, 244 - h2, w, h2 + 30, '#13111f');
      for (let wy = 244 - h2 + 5; wy < 240; wy += 7) for (let wx = xx + 4; wx < xx + w - 4; wx += 6) if (r() < 0.3) f(wx, wy, 3, 3, r() < 0.6 ? '#ffcd75' : '#2c2944');
      xx += w + 1;
    }
    // street
    f(0, 244, VW, 26, '#1a1826'); f(0, 244, VW, 1, '#333c57');
    for (let i = 0; i < VW; i += 24) f(i, 257, 12, 1, '#4a4a5e');
    this.built = c;
    this.stars = Array.from({ length: 70 }, () => ({ x: Math.floor(r() * VW), y: Math.floor(r() * 140), p: r() * 6 }));
  },
  draw(t, tower = true) {
    if (!this.built) this.build();
    g.drawImage(this.built, 0, 0);
    for (const s of this.stars) { const a = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + s.p)); g.globalAlpha = a; px(s.x, s.y, '#f4f4f4'); }
    g.globalAlpha = 1;
    if (tower) this.drawTower(t, 336, 96);
  },
  drawTower(t, x, y) {
    // Hereinafter tower with a glowing section sign
    rect(x, y, 64, VH - y, '#1f2440'); rect(x + 2, y + 2, 60, VH - y, '#262c4f');
    rect(x + 6, y - 14, 52, 16, '#1f2440'); rect(x + 18, y - 30, 28, 18, '#1f2440');
    for (let wy = y + 8; wy < 240; wy += 8) for (let wx = x + 6; wx < x + 58; wx += 7) {
      const on = ((wx * 7 + wy * 13) % 11) < 4;
      rect(wx, wy, 4, 4, on ? '#ffcd75' : '#333c57');
    }
    const glow = 0.5 + 0.5 * Math.sin(t * 2);
    rect(x + 19, y - 48, 26, 32, '#0e0c17'); rectO(x + 19, y - 48, 26, 32, glow > 0.5 ? '#ffcd75' : '#a8741a'); rectO(x + 20, y - 47, 24, 30, '#5a3a00');
    g.drawImage(S.sect.c, x + 23, y - 45, 18, 26);
  },
};

/* ---------- TITLE ---------- */
class TitleScene extends Scene {
  enter() {
    Sound.play('title');
    this.pages = Array.from({ length: 14 }, () => ({ x: rnd(VW), y: rnd(VH), vx: rnd(-6, 6), vy: rnd(8, 18), r: rnd(TAU), vr: rnd(-1, 1) }));
    this.ghosts = Array.from({ length: 3 }, (_, i) => ({ x: 60 + i * 160, y: 150 + i * 14, p: i * 2 }));
    this.walker = { x: -20 };
    const ck = Store.data.checkpoint;
    const menu = h('div', { class: 'abs col', style: { left: '50%', top: '128px', transform: 'translateX(-50%)', alignItems: 'center', gap: '12px' } });
    menu.append(UI.btn('NEW GAME', () => Game.go(() => new SetupScene()), { id: 'btn-new', style: { minWidth: '150px', textAlign: 'center', padding: '7px 10px' } }));
    if (ck && ck.run && ck.scene && ck.scene !== 'ending') {
      const label = { offer: 'THE OFFER', career: 'THE JOB', exit: 'THE EXIT', arena: 'YEAR ' + ((ck.extra && WAVES[ck.extra.wave]) ? WAVES[ck.extra.wave].title.replace('YEAR ', '') : '') }[ck.scene] || '';
      menu.append(UI.btn('CONTINUE<span class="sub">' + esc(label) + '</span>', () => resumeCheckpoint(), { id: 'btn-continue', style: { minWidth: '150px', textAlign: 'center' } }));
    }
    const row = h('div', { class: 'abs row', style: { left: '50%', bottom: '36px', transform: 'translateX(-50%)', gap: '12px' } });
    const cx = CODEX.filter((c) => Store.data.codex[c.id]).length, ac = ACHIEVEMENTS.filter((a) => Store.data.ach[a.id]).length;
    row.append(
      UI.btn('HOW TO PLAY', () => openHowTo(), { cls: 'small' }),
      UI.btn(`CODEX ${cx}/${CODEX.length}`, () => openCodex(), { cls: 'small' }),
      UI.btn(`AWARDS ${ac}/${ACHIEVEMENTS.length}`, () => openAchievements(), { cls: 'small' }),
      UI.btn('SETTINGS', () => openSettings(), { cls: 'small' }),
    );
    UI.add(menu); UI.add(row);
    UI.add(h('div', { class: 'abs silk dim center', style: { left: 0, right: 0, bottom: '4px' } }, 'AN EDUCATIONAL GAME. NOT LEGAL ADVICE.'));
    UI.focusFirst(menu);
  }
  update(dt) {
    super.update(dt);
    for (const p of this.pages) { p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; if (p.y > VH + 10) { p.y = -10; p.x = rnd(VW); } }
    this.walker.x += 22 * dt; if (this.walker.x > VW + 20) this.walker.x = -20;
  }
  draw() {
    const t = this.t;
    City.draw(t);
    for (const gh of this.ghosts) {
      g.globalAlpha = 0.35; spr(Math.floor(t * 3 + gh.p) % 2 ? S.phantom1 : S.phantom0, gh.x + Math.sin(t * 0.6 + gh.p) * 30, gh.y + Math.sin(t * 1.4 + gh.p) * 6); g.globalAlpha = 1;
    }
    for (const p of this.pages) { const w = Math.abs(Math.cos(p.r)) * 5 + 1; rect(p.x, p.y, w, 6, '#efe3c4'); rect(p.x, p.y + 2, Math.max(1, w - 1), 1, '#c9b48a'); }
    // walker carrying a box
    const wk = chibi(playerSpec(), 'side', Math.floor(t * 6) % 4);
    spr(wk, this.walker.x, 237);
    rect(this.walker.x + 11, 247, 7, 6, '#c9b48a'); rectO(this.walker.x + 11, 247, 7, 6, '#5b3a29');
    // logo
    const lx = VW / 2;
    const bob = Math.sin(t * 1.6) * 1.5;
    text('SURVIVAL', lx, 26 + bob, '#ffcd75', { font: 'p2p', scale: 3, align: 'center', outline: '#0e0c17', shadow: '#a8741a' });
    text('CLAUSE', lx, 54 + bob, '#efe3c4', { font: 'p2p', scale: 3, align: 'center', outline: '#0e0c17', shadow: '#8a6a3c' });
    // red pen underline that redraws itself
    const ul = clamp((t % 6) / 1.2, 0, 1);
    const x0 = lx - 70, x1 = x0 + 140 * ul;
    for (let xx = x0; xx < x1; xx++) { const yy = 82 + bob + Math.round(Math.sin(xx * 0.18) * 1.2); rect(xx, yy, 1, 2, '#d0344a'); }
    // stamp
    g.save(); g.translate(lx - 118, 66 + bob); g.rotate(-0.22);
    rectO(-22, -7, 44, 13, '#d0344a'); rectO(-21, -6, 42, 11, '#d0344a');
    text('§14.3', 0, -3, '#d0344a', { font: 'silk', align: 'center' });
    g.restore();
    if (Store.data.best) text('BEST GRADE: ' + Store.data.best, 472, 206, '#3fbfa0', { align: 'right', outline: '#0e0c17' });
    text('WHICH PARTS OF YOUR EMPLOYMENT AGREEMENT', lx, 94, '#94b0c2', { align: 'center' });
    text('STILL BIND YOU AFTER YOU LEAVE?', lx, 103, '#94b0c2', { align: 'center' });
  }
}

/* ---------- NEW-HIRE SETUP ---------- */
class SetupScene extends Scene {
  enter() {
    Sound.play('title');
    const prev = Store.data.lastSetup || {};
    this.sel = { avatar: prev.avatar || 0, name: prev.name || '', offers: prev.offers || 2, diff: prev.diff || 'standard' };
    const panel = h('div', { class: 'abs panel frame', style: { left: '20px', top: '14px', width: '440px', height: '242px', padding: '10px 12px' } });
    panel.append(h('div', { class: 'row' }, h('div', { class: 'p2p gold' }, 'NEW-HIRE PAPERWORK'), h('div', { class: 'spacer' }), h('div', { class: 'silk dim' }, 'FORM I-HIRE-U')));
    // avatar
    this.pfCanvas = h('canvas', { width: 32, height: 32, style: { width: '64px', height: '64px', imageRendering: 'pixelated', background: '#29366f' } });
    this.chCanvas = h('canvas', { width: 18, height: 20, style: { width: '36px', height: '40px', imageRendering: 'pixelated' } });
    this.avName = h('div', { class: 'silk dim center', style: { width: '64px' } }, '');
    const av = h('div', { class: 'row', style: { marginTop: '10px', alignItems: 'center' } },
      UI.btn('&lt;', () => this.setAvatar(-1), { cls: 'small', aria: 'Previous look' }),
      h('div', { class: 'col', style: { alignItems: 'center', gap: '3px' } }, this.pfCanvas, this.avName),
      this.chCanvas,
      UI.btn('&gt;', () => this.setAvatar(1), { cls: 'small', aria: 'Next look' }),
    );
    this.nameIn = h('input', { class: 'name', id: 'name-input', maxlength: 10, placeholder: 'YOUR NAME', value: this.sel.name, autocomplete: 'off', spellcheck: 'false' });
    this.nameIn.addEventListener('input', () => { this.nameIn.value = this.nameIn.value.replace(/[^A-Za-z .'-]/g, '').toUpperCase(); this.sel.name = this.nameIn.value; });
    this.nameIn.addEventListener('keydown', (e) => { if (e.code === 'Enter') { e.preventDefault(); this.nameIn.blur(); UI.navigate('down'); } });
    const nameCol = h('div', { class: 'col', style: { gap: '6px', marginLeft: '14px' } },
      h('div', { class: 'p2p' }, 'NAME'), this.nameIn,
      h('div', { class: 'vt dim', style: { width: '200px' } }, 'It goes on the lawsuit caption. Yes, there will be a lawsuit.'));
    av.append(nameCol);
    panel.append(av);
    // offers
    this.offerBtns = [1, 2, 3].map((n) => UI.btn(`${n} OFFER${n > 1 ? 'S' : ''}<span class="sub">${LEVERAGE_BY_OFFERS[n]} leverage</span>`, () => { this.sel.offers = n; this.refresh(); }, { cls: 'small', style: { minWidth: '92px' } }));
    panel.append(h('div', { class: 'p2p', style: { marginTop: '12px' } }, 'HOW MANY OFFERS DO YOU HAVE?'),
      h('div', { class: 'vt dim', style: { margin: '2px 0 8px' } }, 'Alternatives are leverage. More offers, more room to negotiate.'),
      h('div', { class: 'row', style: { gap: '12px' } }, this.offerBtns));
    this.diffBtns = ['story', 'standard', 'litigator'].map((d) => UI.btn(DIFF[d].name.toUpperCase(), () => { this.sel.diff = d; this.refresh(); }, { cls: 'small' }));
    panel.append(h('div', { class: 'row', style: { marginTop: '14px', gap: '12px' } }, h('div', { class: 'p2p' }, 'ACTION'), this.diffBtns,
      h('div', { class: 'spacer' }), UI.btn('START &gt;', () => this.start(), { cls: 'teal', id: 'btn-start' })));
    UI.add(panel);
    this.refresh(); this.setAvatar(0);
    UI.focusFirst(panel, '#btn-start');
  }
  wantsKeys(e) { return document.activeElement === this.nameIn && (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code.startsWith('Key')); }
  setAvatar(d) {
    this.sel.avatar = (this.sel.avatar + d + AVATARS.length) % AVATARS.length;
    const a = AVATARS[this.sel.avatar];
    const x = this.pfCanvas.getContext('2d'); x.imageSmoothingEnabled = false; x.clearRect(0, 0, 32, 32);
    drawPortrait(x, 0, 0, Object.assign({}, a, { bg: '#29366f' }), 'smile', false, false);
    this.avName.textContent = a.name.toUpperCase();
  }
  refresh() {
    this.offerBtns.forEach((b, i) => b.classList.toggle('sel', this.sel.offers === i + 1));
    ['story', 'standard', 'litigator'].forEach((d, i) => this.diffBtns[i].classList.toggle('sel', this.sel.diff === d));
  }
  start() {
    Store.data.lastSetup = Object.assign({}, this.sel); Store.save();
    newRun(this.sel);
    Store.data.runs++; Store.save();
    Game.go(() => new IntroScene());
  }
  update(dt) {
    super.update(dt);
    const x = this.chCanvas.getContext('2d'); x.clearRect(0, 0, 18, 20);
    x.drawImage(chibi(AVATARS[this.sel.avatar], 'down', Math.floor(this.t * 5) % 4).c, 0, 0);
  }
  draw() { City.draw(this.t, false); g.globalAlpha = 0.5; rect(0, 0, VW, VH, '#0e0c17'); g.globalAlpha = 1; }
}

/* ---------- INTRO ---------- */
class IntroScene extends Scene {
  enter() {
    Sound.play('offer');
    this.glow = 0;
    this.run(async function () {
      await this.wait(400);
      const N = (t) => this.guard(UI.say({ who: '', text: t, voice: 300 }));
      await N('Six months of job hunting.');
      this.mail = true; Sound.sfx('phone');
      await N('Then an email from Hereinafter Holdings: "Congratulations! Your offer is attached."');
      await N('Near the end of most employment agreements is a survival clause. It lists which parts of the agreement still bind you after you leave.');
      await N('Right now, before you sign, is when you have the most leverage you will ever have. After you sign, it\'s gone.');
      await this.guard(UI.say({ who: RUN.name, pf: playerSpec(), expr: 'smile', text: 'Okay. Let\'s read the fine print.', voice: 540 }));
      checkpoint('offer');
      Game.go(() => new OfferScene());
    });
  }
  draw() {
    const t = this.t;
    // apartment at night
    rect(0, 0, VW, VH, '#1b1930');
    rect(0, 196, VW, 74, '#2a2238'); for (let i = 0; i < VW; i += 32) rect(i, 196, 1, 74, '#241d31');
    // window with city
    rect(56, 24, 200, 130, '#0e0c17');
    g.save(); g.beginPath(); g.rect(60, 28, 192, 122); g.clip(); g.drawImage(City.built || (City.build(), City.built), -40, -80); g.restore();
    rect(154, 24, 4, 130, '#0e0c17'); rect(56, 86, 200, 4, '#0e0c17'); rectO(55, 23, 202, 132, '#4a3f63');
    // desk + laptop
    rect(260, 150, 190, 10, '#5b3a29'); rect(266, 160, 8, 50, '#4a2f20'); rect(436, 160, 8, 50, '#4a2f20');
    rect(320, 116, 64, 34, '#14121f'); rect(323, 119, 58, 28, this.mail ? '#3b5dc9' : '#29366f'); rect(314, 148, 76, 4, '#566c86');
    if (this.mail) { rect(330, 125, 44, 16, '#efe3c4'); line(330, 125, 352, 135, '#c9b48a'); line(374, 125, 352, 135, '#c9b48a'); if (Math.floor(t * 3) % 2) text('1 NEW', 352, 106, '#ffcd75', { align: 'center' }); }
    g.globalAlpha = 0.15; disc(352, 132, 40, '#41a6f6'); g.globalAlpha = 1;
    // player at desk
    spr(chibi(playerSpec(), 'up', 0), 343, 150);
    // plant + lamp
    rect(410, 132, 10, 18, '#8a5a3c'); disc(415, 126, 8, '#38b764'); disc(411, 122, 5, '#a7f070');
  }
}
