/* =========================================================
   CHAPTER 2 — THE JOB (career cards)
   CHAPTER 3 — THE EXIT (continuing-obligations letter)
   ========================================================= */
class CareerScene extends Scene {
  enter() {
    Sound.play('career');
    this.i = 0; this.typing = 0;
    this.hud = h('div', { class: 'abs panel frame row', style: { left: '8px', top: '8px', width: '464px', height: '20px', padding: '0 8px', gap: '8px' } });
    UI.add(this.hud);
    this.showCard();
  }
  renderHud() {
    const C = RUN.career;
    this.hud.innerHTML = '';
    const stars = h('span', { class: 'meter' });
    for (let i = 0; i < 6; i++) stars.append(h('span', { class: 'pip' + (i < C.perf ? '' : ' off') }));
    this.hud.append(h('span', { class: 'p2p gold' }, 'PERFORMANCE'), stars, h('span', { class: 'p2p', style: { marginLeft: '10px', color: '#9fc3e8' } }, 'PAPER TRAIL'), h('span', { class: 'p2p' }, String(C.paper)), h('div', { class: 'spacer' }), h('span', { class: 'silk dim' }, CO_SHORT.toUpperCase() + ' · CHAPTER 2'));
  }
  showCard() {
    this.renderHud();
    const old = UI.root.querySelector('.card'); if (old) old.remove();
    const c = CAREER[this.i];
    this.year = parseInt(c.yr.replace(/\D+/, ''), 10) || 1;
    const spec = c.who === 'you' ? playerSpec() : CAST[c.who];
    const pf = UI.portraitCanvas(spec, c.expr);
    const card = h('div', { class: 'card frame', style: { left: '84px', top: '40px', width: '312px' } });
    const choices = h('div', { class: 'optlist', style: { marginTop: '10px' } });
    for (const ch of c.choices) choices.append(UI.btn(esc(ch.label) + (ch.sub ? `<span class="sub">${esc(ch.sub)}</span>` : ''), () => this.choose(c, ch, card), {}));
    card.append(
      h('div', { class: 'row', style: { alignItems: 'flex-start' } }, pf.c,
        h('div', null, h('div', { class: 'yr' }, c.yr), h('div', { class: 'ttl' }, c.title.toUpperCase()), h('div', { class: 'silk', style: { color: '#8a6a3c' } }, c.who === 'you' ? RUN.name + ' · YOU' : spec.name + (spec.role ? ' · ' + spec.role.toUpperCase() : '')))),
      h('div', { class: 'txt', style: { marginTop: '8px' } }, c.text), choices);
    pf.talkUntil = performance.now() + 1500;
    UI.add(card);
    this.cardEl = card;
    UI.focusFirst(choices);
    Sound.sfx('paper');
  }
  choose(c, ch, card) {
    const C = RUN.career, fx = ch.fx || {};
    for (const k in fx) { if (k === 'perf' || k === 'paper') C[k] += fx[k]; else C[k] = fx[k]; }
    C.log.push(c.id + ':' + (ch.label));
    this.renderHud();
    if (fx.perf) FX.float(240, 30, `+${fx.perf} PERFORMANCE`, '#ffcd75', { font: 'silk' });
    if (fx.paper) FX.float(240, 40, '+1 PAPER TRAIL', '#9fc3e8', { font: 'silk' });
    if (c.id === 'lodestar' && fx.lodestar) unlockCodex('tradesecret');
    if (c.id === 'vendor' || c.id === 'layoff') unlockCodex('individual', true);
    if (!ch.out) return this.next();
    const box = card.querySelector('.optlist');
    box.innerHTML = '';
    card.querySelector('.txt').textContent = ch.out;
    const nb = UI.btn('CONTINUE', () => this.next(), { cls: 'teal', id: 'btn-continue-card' });
    box.append(nb); UI.focusFirst(box);
  }
  next() {
    this.i++;
    if (this.i >= CAREER.length) {
      checkpoint('exit');
      Game.go(() => new ExitScene());
      return;
    }
    this.showCard();
  }
  draw() {
    const t = this.t, yr = this.year || 1;
    const seasons = [['#9fd3f2', '#c6e7f7'], ['#f2d29f', '#f7e6c6'], ['#e8a46a', '#f2c79a'], ['#c3cbd6', '#e2e7ee']];
    const q = (this.i % 4);
    // office back wall + windows
    rect(0, 0, VW, VH, '#3a4466'); rect(0, 150, VW, 120, '#4a4f6a');
    for (let x = 16; x < VW; x += 96) {
      rect(x, 40, 72, 60, '#1a1c2c'); rect(x + 2, 42, 68, 56, seasons[q][0]); rect(x + 2, 70, 68, 28, seasons[q][1]);
      for (let k = 0; k < 4; k++) rect(x + 6 + k * 16, 78 - ((x + k * 7) % 3) * 6, 10, 20 + ((x + k * 7) % 3) * 6, '#7d93b5');
      rect(x + 35, 42, 2, 56, '#1a1c2c');
    }
    // cubicles
    for (let x = 0; x < VW; x += 120) {
      rect(x + 8, 150, 104, 6, '#8b8f9e'); rect(x + 8, 156, 104, 50, '#6b7180'); rect(x + 8, 156, 4, 50, '#5a5f6c');
      rect(x + 20, 176, 80, 6, '#8a5a3c');
      rect(x + 46, 160, 26, 16, '#14121f'); rect(x + 48, 162, 22, 12, '#3b5dc9');
    }
    // floor
    for (let y = 206; y < VH; y += 8) for (let x = (y / 8) % 2 ? 0 : 8; x < VW; x += 16) rect(x, y, 8, 8, '#454a63');
    // you at your desk + coworkers
    const typing = Math.floor(t * 8) % 2;
    spr(chibi(playerSpec(), 'up', typing), 228, 178);
    spr(chibi(CAST.priya, 'up', 0), 108, 178);
    spr(chibi(CAST.marco, 'up', Math.floor(t * 2) % 2 ? 1 : 0), 348, 178);
    // clock
    disc(440, 24, 9, '#efe3c4'); ring(440, 24, 9, '#2b2118'); line(440, 24, 440 + Math.cos(t * 0.8) * 6, 24 + Math.sin(t * 0.8) * 6, '#2b2118'); line(440, 24, 444, 21, '#2b2118');
    text('YEAR ' + yr, 42, 112, '#ffcd75', { font: 'p2p', outline: '#0e0c17', align: 'center' });
    text(['Q1', 'Q2', 'Q3', 'Q4'][(CAREER[this.i] && /Q(\d)/.test(CAREER[this.i].yr)) ? parseInt(CAREER[this.i].yr.match(/Q(\d)/)[1], 10) - 1 : 0], 42, 124, '#94b0c2', { align: 'center', outline: '#0e0c17' });
  }
}

class ExitScene extends Scene {
  enter() {
    Sound.play('offer');
    this.badgeOff = null;
    this.run(this.script);
  }
  async script() {
    await this.wait(300);
    await sayAs(this, 'dana', `Four years! We're sad to see you go, ${RUN.name}.`, 'smile');
    await sayAs(this, 'dana', 'Before you head out, here\'s a reminder of your continuing obligations. Legal makes us hand these out.', 'neutral');
    const T = RUN.terms;
    const rows = [
      ['6', 'CONFIDENTIALITY', T.conf === 'narrow' ? 'Trade secrets: as long as they stay secret. Everything else: 2 years. Your general skills stay yours.' : 'Forever, as written. Covers all information about the business, including know-how.'],
      ['7', 'NON-COMPETITION', (T.nc === 'narrow' ? '12 months. Named competitors only.' : '24 months. Anywhere in North America.') + (T.ncPay ? ` Paid at ${Math.round(T.ncPay * 100)}% of base salary.` : ' Unpaid.')],
      ['8', 'NON-SOLICITATION', T.ns === 'narrow' ? '12 months. Active solicitation of people you worked with.' : '24 months. Every customer and employee. No hiring, no accepting business.'],
      ['9', 'INVENTIONS', T.inv === 'carve' ? 'Own-time projects on your own equipment are excluded.' : 'Everything you conceived while employed.'],
      ['11', 'ARBITRATION', T.arb === 'mutual' ? 'Binding and mutual. Company pays the forum costs.' : 'Binding. As written, you split the costs, and the Company can still go to court.'],
      ['12', 'COOPERATION', T.coop === 'paid' ? `No end date. $${T.coopRate}/hour, expenses, and attorney fees.` : 'No end date. Unpaid.'],
    ];
    const list = h('div', { class: 'col', style: { gap: '5px', margin: '8px 0' } });
    const letter = h('div', { style: { width: '400px' } },
      h('h3', null, 'REMINDER OF CONTINUING OBLIGATIONS'),
      h('div', { class: 'muted' }, CO),
      h('p', { style: { margin: '6px 0 2px' } }, `Dear ${RUN.name}: Under Section 14.3 of your Employment Agreement, the following provisions survive the termination of your employment:`),
      list);
    const btnRow = h('div', { class: 'row', style: { marginTop: '6px' } });
    letter.append(btnRow);
    const m = UI.modal(letter, { cls: 'modal doc', dismiss: false, focus: false, style: { padding: '10px 12px', maxHeight: '258px' } });
    for (const [n, name, txt] of rows) {
      await this.wait(420);
      list.append(h('div', { class: 'row', style: { alignItems: 'flex-start', gap: '6px' } }, h('span', { class: 'stamp anim', style: { minWidth: '44px', textAlign: 'center' } }, '§' + n), h('div', null, h('b', null, name), ' ', h('span', null, txt))));
      Sound.sfx('stamp'); FX.shake(1, 0.1);
      m.el.scrollTop = m.el.scrollHeight;
    }
    await this.wait(700);
    if (T.survivalIndem) {
      list.append(h('div', { class: 'row', style: { alignItems: 'flex-start', gap: '6px' } }, h('span', { class: 'stamp teal anim', style: { minWidth: '44px', textAlign: 'center' } }, '§10'),
        h('div', null, h('b', null, 'INDEMNIFICATION'), ' ', h('span', null, T.indem === 'defend' ? 'The Company will continue to defend and indemnify you for your work here, advancing legal fees as incurred.' : 'The Company will continue to indemnify you, reimbursing reasonable losses after final resolution.'))));
      Sound.sfx('levelup');
    } else {
      const note = h('p', { class: 'muted', style: { margin: '4px 0', fontStyle: 'italic' } }, '');
      list.append(note);
      const full = 'P.S. Section 10 (Indemnification) is not listed in Section 14.3. The Company\'s position is that its obligations under Section 10 ended on your separation date.';
      for (let i = 0; i <= full.length; i += 3) { note.textContent = full.slice(0, i); if (i % 9 === 0) Sound.sfx('tick'); await this.wait(16); }
      note.textContent = full;
      await this.wait(900);
      note.style.transition = 'opacity 1.6s'; note.style.opacity = '0.35';
      Sound.sfx('lose');
    }
    m.el.scrollTop = m.el.scrollHeight;
    list.append(h('div', { style: { marginTop: '4px' } }, 'Sincerely, People Ops'));
    await new Promise((res) => { btnRow.append(h('div', { class: 'spacer' }), UI.btn('TAKE THE LETTER', () => { m.close(); res(); }, { cls: 'teal', id: 'btn-take' })); UI.focusFirst(btnRow); });
    if (!this.alive) return;
    await sayAs(this, 'dana', 'Badge, please. Good luck out there!', 'smile');
    this.badgeOff = this.t; Sound.sfx('error'); FX.flash('#d0344a', 0.3);
    await this.wait(1100);
    await this.guard(UI.say({ who: '', text: T.survivalIndem ? 'Just like that, you\'re out. The agreement isn\'t done with you yet. But this time, it isn\'t one-sided.' : 'Just like that, you\'re out. Every obligation of yours survived. Their promise to you, they say, didn\'t. The agreement isn\'t done with you yet.', voice: 300 }));
    // starting savings for life after
    const S = RUN.stats;
    S.savings = 20000 + RUN.terms.salary * 2 + RUN.terms.signing + RUN.career.perf * 2500;
    S.startSavings = S.savings;
    checkpoint('arena', { wave: 0 });
    Game.go(() => new ArenaScene(0));
  }
  draw() {
    const t = this.t;
    rect(0, 0, VW, VH, '#2c3352');
    for (let y = 8; y < 186; y += 8) for (let x = (y / 8) % 2 ? 0 : 8; x < VW; x += 16) px(x, y, '#323a5c');
    rect(0, 186, VW, 84, '#232842');
    // door with EXIT sign
    rect(360, 70, 70, 116, '#1a1c2c'); rect(364, 74, 62, 112, '#5b3a29'); rect(414, 128, 6, 4, '#e8b44a');
    rect(374, 52, 42, 12, '#7a1f2e'); text('EXIT', 395, 55, '#f4f4f4', { font: 'silk', align: 'center' });
    // box of belongings
    rect(150, 150, 44, 30, '#c9b48a'); rectO(150, 150, 44, 30, '#5b3a29'); rect(156, 138, 10, 14, '#38b764'); disc(161, 136, 6, '#a7f070'); rect(172, 142, 14, 10, '#efe3c4');
    // Dana
    drawBust(Object.assign({}, CAST.dana, { noBg: true, id: 'dana' }), 240, 70, 2, 'smile', false, (t % 3.5) < 0.12);
    rect(220, 132, 120, 54, '#5b3a29'); rect(220, 132, 120, 3, '#8a5a3c');
    if (this.badgeOff !== null) {
      const k = clamp((t - this.badgeOff) / 0.4, 0, 1);
      rect(250, 104, 34, 22, '#f4f4f4'); rectO(250, 104, 34, 22, '#0e0c17'); rect(253, 107, 10, 12, '#94b0c2');
      text('ACCESS', 274, 108, '#2b2118', { font: 'silk', align: 'center' });
      g.save(); g.translate(267, 115); g.rotate(-0.25); g.scale(lerp(2, 1, k), lerp(2, 1, k));
      rectO(-34, -7, 68, 14, '#d0344a'); text('DEACTIVATED', 0, -3, '#d0344a', { font: 'silk', align: 'center' }); g.restore();
    }
  }
}
