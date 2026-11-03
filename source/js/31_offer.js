/* =========================================================
   CHAPTER 1 — THE OFFER (negotiation)
   ========================================================= */
const SPEAK = {
  dana: () => CAST.dana, vance: () => CAST.vance, jo: () => CAST.jo, rex: () => CAST.rex,
  priya: () => CAST.priya, marco: () => CAST.marco, okafor: () => CAST.okafor, arb: () => CAST.arb, counsel: () => CAST.counsel, hired: () => CAST.hired,
  you: () => Object.assign(playerSpec(), { name: RUN.name, role: 'You' }),
};
function sayAs(scene, who, text, expr, extra) {
  const sp = SPEAK[who] ? SPEAK[who]() : null;
  if (scene) scene.talk = { who, until: performance.now() + (text.length / ([1e9, 140, 70, 38][Store.S.textSpeed] || 70)) * 1000, expr };
  const o = Object.assign({ who: sp ? (sp.name || RUN.name) : '', role: sp ? sp.role : '', pf: sp, expr: expr || 'neutral', text, voice: sp ? sp.voice : 300 }, extra || {});
  const p = UI.say(o);
  return scene ? scene.guard(p) : p;
}
const pips = (n) => (n > 0 ? '<i class="cp"></i>'.repeat(n) : '<span class="free">FREE</span>');

class OfferScene extends Scene {
  enter() {
    Sound.play('offer');
    this.busy = false; this.rescinded = false; this.signing = null;
    this.talk = { who: null, until: 0 };
    this.vanceT = RUN.neg.vanceIn ? -10 : null;
    this.build();
    if (!RUN.neg.started) { RUN.neg.started = true; this.run(this.intro); }
  }
  async intro() {
    this.busy = true; this.lock(true);
    await this.wait(350);
    await sayAs(this, 'dana', `Hi ${RUN.name}! Congratulations again. We're so excited to have you as our next Senior Operations Manager.`, 'happy');
    await sayAs(this, 'dana', 'Here\'s our standard employment agreement. Everyone signs it. Take a look, and let me know if you have any questions!', 'smile');
    await this.guard(UI.say({ who: 'HOW THIS WORKS', text: 'Click a section to read it. Spend LEVERAGE to ask for changes. Fair asks usually get a yes. Overreaching costs GOODWILL. If goodwill hits zero, the offer is gone.', voice: 300 }));
    unlockCodex('leverage');
    this.busy = false; this.lock(false); this.refresh();
    UI.focusFirst(this.doc, '.secrow');
  }
  build() {
    UI.clear();
    const hud = h('div', { class: 'abs panel frame row', style: { left: '8px', top: '8px', width: '464px', height: '20px', padding: '0 8px', gap: '6px' } });
    this.levEl = h('div', { class: 'meter', 'aria-label': 'Leverage' });
    this.gwEl = h('div', { class: 'meter', 'aria-label': 'Goodwill' });
    hud.append(h('span', { class: 'p2p gold' }, 'LEVERAGE'), this.levEl, h('span', { class: 'p2p', style: { marginLeft: '8px', color: '#f19aa6' } }, 'GOODWILL'), this.gwEl, h('div', { class: 'spacer' }), h('span', { class: 'silk dim' }, 'DUE FRIDAY'));
    UI.add(hud);
    this.doc = h('div', { class: 'abs doc scroll', style: { left: '8px', top: '36px', width: '240px', height: '146px', padding: '6px 6px 6px 7px' } });
    UI.add(this.doc);
    const acts = h('div', { class: 'abs col', style: { left: '264px', top: '113px', width: '204px', gap: '9px' } });
    this.btnQ = UI.btn('ASK A QUESTION', () => this.questions(), { style: { width: '100%' }, id: 'btn-ask' });
    this.btnJo = UI.btn('CALL A LAWYER FRIEND', () => this.callJo(), { style: { width: '100%' }, id: 'btn-jo' });
    this.btnSign = UI.btn('SIGN THE AGREEMENT', () => this.signFlow(), { cls: 'teal', style: { width: '100%' }, id: 'btn-sign' });
    acts.append(this.btnQ, this.btnJo, this.btnSign);
    UI.add(acts);
    this.acts = acts; this.hud = hud;
    this.hint = h('div', { class: 'hintbar frame' });
    UI.add(this.hint);
    this.refresh();
  }
  lock(on) {
    for (const b of [this.btnQ, this.btnJo, this.btnSign]) if (b) b.disabled = on;
    if (this.btnJo && RUN.neg.joCalled) this.btnJo.disabled = true;
    if (this.doc) this.doc.querySelectorAll('.secrow').forEach((r) => { r.disabled = on; });
  }
  refresh() {
    // meters
    this.levEl.innerHTML = '';
    for (let i = 0; i < RUN.leverageMax; i++) this.levEl.append(h('span', { class: 'pip' + (i < RUN.leverage ? '' : ' off') }));
    this.gwEl.innerHTML = '';
    for (let i = 0; i < RUN.goodwillMax; i++) this.gwEl.append(h('span', { class: 'pip', style: { background: i < RUN.goodwill ? '#e04050' : '#3a3550', transform: 'none', width: '7px', height: '6px', borderRadius: '0 0 3px 3px' } }));
    if (RUN.neg.joCalled && this.btnJo) { this.btnJo.innerHTML = 'LAWYER CALLED'; this.btnJo.disabled = true; }
    this.renderDoc();
    this.renderHint();
  }
  renderHint() {
    if (!this.hint) return;
    const N = RUN.neg, T = RUN.terms;
    const read = CONTRACT.filter((s) => N.inspected[s.id]).length;
    let tip;
    if (RUN.leverage === 0) tip = 'Out of leverage. Questions are still free. Sign when you\'re ready.';
    else if (read === 0) tip = 'Click any section to read it. Reading closely is free and highlights the risky language.';
    else if (N.crossref && !T.survivalIndem) tip = 'Section 10 is the company\'s promise to you, and it isn\'t on the survival list.';
    else if (!N.inspected.s14) tip = 'Survival clauses usually hide near the end of the agreement.';
    else if (read < 6) tip = 'Ask yourself which sections still bind you after you leave, and which protect you.';
    else tip = 'Spend leverage on what bites years from now. Questions are free. Signing ends the negotiation.';
    this.hint.innerHTML = '';
    this.hint.append(
      h('div', { class: 'col', style: { gap: '2px' } },
        h('div', { class: 'stat' }, 'READ ', h('b', null, `${read}/${CONTRACT.length}`)),
        h('div', { class: 'stat' }, 'AMENDED ', h('b', null, String(Object.values(N.sec).filter((x) => x.amended).length))),
        h('div', { class: 'stat' }, 'LEVERAGE ', h('b', null, `${RUN.leverage}/${RUN.leverageMax}`))),
      h('div', { class: 'tip' }, h('span', { class: 'lbl' }, 'TIP'), tip));
  }
  status(s) {
    const N = RUN.neg, st = N.sec[s.id] || {};
    const chips = [];
    if (N.stars[s.id]) chips.push(['*', 'star']);
    if (st.amended) chips.push(['AMENDED', 'ok']);
    else if (st.rejected) chips.push(['REJECTED', 'red']);
    else if (N.inspected[s.id]) chips.push(['READ', 'read']);
    if (s.theirs && N.inspected[s.id]) chips.push(['THEIRS', 'no']);
    return { chips, st };
  }
  renderDoc() {
    const d = this.doc, sc = d.scrollTop;
    d.innerHTML = '';
    d.append(h('h3', null, 'EMPLOYMENT AGREEMENT'), h('div', { class: 'muted', style: { marginBottom: '5px' } }, CO + ' ("the Company")'));
    for (const s of CONTRACT) {
      const { chips, st } = this.status(s);
      const tt = h('span', { class: 'tt' }, s.title);
      if (st.amended && st.notes) for (const n of st.notes) tt.append(h('span', { class: 'am' }, '+ ' + n));
      const row = h('button', { class: 'secrow', type: 'button', 'data-sec': s.id, disabled: this.busy },
        h('span', { class: 'n' }, '§' + s.n), tt, h('span', { class: 'chips' }, chips.map(([t, c]) => h('span', { class: 'chip ' + c }, t))));
      row.addEventListener('click', () => { Sound.sfx('paper'); this.openSection(s.id); });
      d.append(row);
    }
    d.append(h('div', { class: 'muted', style: { marginTop: '6px' } }, 'EMPLOYEE: ________________'));
    d.scrollTop = sc;
  }
  legalHTML(s, insp) {
    const st = RUN.neg.sec[s.id] || {};
    let html = esc(s.text).replace(/\[\[(.+?)\]\]/g, (m, p) => {
      if (st.strike) return `<span class="del">${p}</span>`;
      return insp ? `<mark class="bad">${p}</mark>` : p;
    });
    if (st.ins && st.ins.length) html += st.ins.map((t) => `<br><span class="ins">${esc(t)}</span>`).join('');
    return html;
  }
  inspect(s) {
    const N = RUN.neg;
    if (!N.inspected[s.id]) {
      N.inspected[s.id] = true;
      if (s.codex) unlockCodex(s.codex);
      if (CONTRACT.every((x) => N.inspected[x.id])) unlockAch('fineprint');
    }
  }
  openSection(id) {
    if (this.busy || this.rescinded) return;
    const s = SECTION[id], N = RUN.neg;
    const insp = !!N.inspected[id];
    const body = h('div', { style: { width: '424px' } });
    const tag = s.theirs ? h('span', { class: 'chip no' }, 'THE COMPANY\'S PROMISE TO YOU') : (s.key ? h('span', { class: 'chip' }, 'YOUR OBLIGATION') : null);
    body.append(h('div', { class: 'row' }, h('div', { class: 'p2p gold', html: SEC(s.n) + ' ' + esc(s.title.toUpperCase()) }), h('div', { class: 'spacer' }), tag));
    body.append(h('div', { class: 'doc', style: { padding: '7px 8px', margin: '9px 0 10px' }, html: this.legalHTML(s, insp) }));
    let m;
    const reopen = () => { m.close(); this.openSection(id); };
    if (!insp) {
      body.append(h('div', { class: 'row', style: { marginBottom: '10px' } }, UI.btn('READ IT CLOSELY', () => { Sound.sfx('paper'); this.inspect(s); reopen(); }, { cls: 'small', id: 'btn-inspect' }), h('span', { class: 'vt dim' }, 'Free. Highlights the risky language.')));
    } else {
      body.append(h('div', { class: 'plain' }, h('span', { class: 'lbl' }, 'PLAIN ENGLISH'), s.plain));
      if (s.hidden) {
        let label = s.hidden.label;
        if (s.id === 's10' && RUN.terms.survivalIndem) label = 'Now listed in the survival clause (14.3).';
        if (s.id === 's6' && RUN.terms.dtsa) label = 'Whistleblower immunity notice: added.';
        body.append(h('div', { class: 'warnline' }, '! ' + label));
        if (s.hidden.codex) unlockCodex(s.hidden.codex);
      }
      if (s.crossref) {
        if (!N.crossref) body.append(h('div', { class: 'row', style: { marginBottom: '10px' } }, UI.btn('CROSS-REFERENCE 14.3', () => { this.crossref(); reopen(); }, { cls: 'small', id: 'btn-xref' }), h('span', { class: 'vt dim' }, 'Check the list against the whole agreement.')));
        else body.append(this.xrefTable());
      }
    }
    const opts = h('div', { class: 'optlist' });
    let any = false;
    for (const o of s.options) {
      if (o.needsInspect && !insp) continue;
      if (o.needsCrossref && !N.crossref) continue;
      any = true;
      const done = N.done[o.id];
      const amended = (N.sec[s.id] || {}).amended;
      const blockedStrike = o.overreach && amended;
      const afford = RUN.leverage >= o.cost;
      let label = `<span class="cost">${pips(o.cost)}</span>${esc(o.label)}`;
      if (done) label = `<span class="cost">${done === 'rejected' ? 'REJECTED' : 'DONE'}</span>${esc(o.label)}`;
      const sub = done ? '' : (!afford ? 'Not enough leverage.' : blockedStrike ? 'You already amended this section.' : o.sub);
      const b = UI.btn(label + (sub ? `<span class="sub">${esc(sub)}</span>` : ''), () => { m.close(); this.resolve(s, o); }, { disabled: !!done || !afford || blockedStrike, cls: o.overreach ? 'red' : '', id: 'opt-' + o.id });
      opts.append(b);
    }
    if (any) body.append(h('div', { class: 'silk dim', style: { margin: '2px 0 4px' } }, 'ASK FOR A CHANGE'), opts);
    else if (insp && !s.options.length) body.append(h('div', { class: 'vt dim' }, 'Nothing here worth spending leverage on.'));
    body.append(h('div', { class: 'row', style: { marginTop: '12px' } }, h('div', { class: 'spacer' }), UI.btn('BACK', () => { Sound.sfx('cancel'); m.close(); }, { cls: 'ghost small', sfx: false })));
    m = UI.modal(body, { cls: 'modal panel frame', style: { maxHeight: '254px' }, onClose: () => { const r = this.doc.querySelector(`[data-sec="${id}"]`); if (r) setTimeout(() => r.focus({ preventScroll: true }), 20); } });
  }
  xrefTable() {
    const t = RUN.terms;
    const rows = [['6', 'Confidentiality', 'YOURS', true], ['7', 'Non-Competition', 'YOURS', true], ['8', 'Non-Solicitation', 'YOURS', true], ['9', 'Inventions', 'YOURS', true], ['10', 'Indemnification', 'THEIRS', t.survivalIndem], ['11', 'Arbitration', 'YOURS', true], ['12', 'Cooperation', 'YOURS', true]];
    const tb = h('table', { class: 'xref' });
    for (const [n, name, whose, surv] of rows) {
      const tr = h('tr', { class: n === '10' ? (surv ? 'good' : 'bad') : '' }, h('td', null, '§' + n), h('td', null, name), h('td', null, whose), h('td', null, surv ? 'SURVIVES' : 'NOT LISTED'));
      tb.append(tr);
    }
    return h('div', { class: 'doc', style: { padding: '6px 7px', marginBottom: '10px' } }, tb,
      h('div', { style: { marginTop: '5px' } }, t.survivalIndem ? 'Your obligations survive. So does their promise to you.' : 'Every obligation that survives is yours. The one promise that\'s theirs isn\'t on the list.'));
  }
  crossref() {
    const N = RUN.neg;
    if (N.crossref) return;
    N.crossref = true;
    Sound.sfx('alarm'); FX.shake(2, 0.25);
    unlockCodex('survival'); unlockCodex('indemnification');
    if (!N.joCalled) { N.foundSelf = true; unlockAch('section10'); }
  }
  async say(who, text, expr) { return sayAs(this, who, text, expr); }
  async spend(cost, kind) {
    for (let i = 0; i < cost; i++) {
      RUN.leverage--; this.refresh();
      const p = this.levEl.children[RUN.leverage]; if (p) p.classList.add('burn');
      Sound.sfx('burn'); await this.wait(170);
    }
    if (kind === 'money' || kind === 'perk') RUN.spentMoney += cost; else RUN.spentLegal += cost;
  }
  setGoodwill(d) {
    RUN.goodwill = clamp(RUN.goodwill + d, 0, RUN.goodwillMax);
    this.refresh();
    if (d < 0) { Sound.sfx('hurt'); FX.shake(3, 0.25); }
    if (RUN.goodwill <= 0) { this.rescind(); return false; }
    return true;
  }
  apply(s, o, fx, ins, countered) {
    const N = RUN.neg;
    Object.assign(RUN.terms, fx || {});
    N.done[o.id] = 'accepted'; N.changes++;
    const st = N.sec[s.id] || (N.sec[s.id] = {});
    st.amended = true;
    if (o.del) st.strike = true;
    (st.ins || (st.ins = [])).push(ins || o.ins);
    const note = countered && o.noteC ? o.noteC : (o.note || o.label.replace(/^Ask for /, '').replace(/^Put /, ''));
    (st.notes || (st.notes = [])).push(note);
    (N.notes || (N.notes = {}))[o.id] = note;
    Sound.sfx('stamp'); FX.shake(1.5, 0.15);
    UI.toast('AMENDED §' + s.n, note, 'info', 2400);
    const cx = { ncPay: ['gardenleave'], defend: ['dutytodefend', 'advancement'], dtsa: ['dtsa'], conf: ['tradesecret', 'knowhow'], surv10: ['indemnification'], nsNarrow: ['nonsolicit'], invCarve: ['inventions'], arbMutual: ['arbitration', 'efaa'], coop: ['cooperation', 'subpoena'] }[o.id];
    if (cx) cx.forEach((c) => unlockCodex(c));
    if (o.id === 'dtsa') unlockAch('dtsa');
    this.refresh();
  }
  async resolve(s, o) {
    if (this.busy) return;
    this.busy = true; this.lock(true);
    const N = RUN.neg;
    try {
      if (o.kind === 'legal' && !N.vanceIn) await this.bringVance('Ooh, contract language. Let me grab Legal.');
      await this.say('you', o.pitch, 'neutral');
      if (o.cost > 0) await this.spend(o.cost, o.kind);
      const resp = o.kind === 'legal' ? 'vance' : 'dana';
      if (o.result === 'accept') {
        await this.say(resp, o.reply, resp === 'dana' ? 'happy' : 'smug');
        this.apply(s, o, o.fx, o.ins);
        if (o.goodwill) { this.setGoodwill(o.goodwill); UI.toast('GOODWILL +1', 'Legal appreciates a careful reader.', 'info'); }
      } else if (o.result === 'counter') {
        await this.say(resp, o.reply, 'neutral');
        const pick = await this.guard(UI.choose({ who: RUN.name, pf: playerSpec(), expr: 'neutral', options: [{ label: 'ACCEPT THE COUNTER', value: 'accept', sub: 'Take the deal.' }, { label: 'PUSH BACK', value: 'push', sub: 'Costs 1 goodwill.', cls: 'red' }] }));
        if (pick === 'accept') { this.apply(s, o, o.counterFx, o.insCounter, true); }
        else {
          await this.say('you', 'I hear you. I\'d really like to get to the full ask.', 'worried');
          if (!this.setGoodwill(-1)) return;
          if (RUN.goodwill >= 2) { await this.say(resp, o.pushReply, 'smug'); this.apply(s, o, o.pushFx, o.ins); }
          else { await this.say(resp, o.pushFail, 'frown'); this.apply(s, o, o.counterFx, o.insCounter, true); }
        }
      } else {
        await this.say(resp, o.reply, 'frown');
        N.done[o.id] = 'rejected'; N.rejected++;
        (N.sec[s.id] || (N.sec[s.id] = {})).rejected = true;
        Sound.sfx('error');
        if (!this.setGoodwill(-(o.overreach || 1))) return;
        UI.toast('GOODWILL -' + (o.overreach || 1), 'Overreaching burns goodwill. Leverage spent anyway.', 'info', 3000);
      }
      if (RUN.goodwill === 1 && !N.warned) { N.warned = true; await this.say('dana', '(Psst. Legal is getting twitchy. Maybe ease up.)', 'worried'); }
      if (RUN.leverage === 0 && !N.outOfLev) { N.outOfLev = true; UI.toast('OUT OF LEVERAGE', 'Questions are still free. Sign when ready.', 'info'); }
    } finally {
      if (this.alive && !this.rescinded) { this.busy = false; this.lock(false); this.refresh(); UI.focusFirst(this.doc, `[data-sec="${s.id}"]`); }
    }
  }
  async bringVance(line) {
    const N = RUN.neg;
    if (line) await this.say('dana', line, 'smile');
    N.vanceIn = true; this.vanceT = this.t; Sound.sfx('door');
    await this.wait(550);
    await this.say('vance', 'Margaret Vance, General Counsel. I hear you have notes on my agreement.', 'smug');
  }
  questions() {
    if (this.busy) return;
    const N = RUN.neg;
    const list = h('div', { class: 'optlist' });
    let m;
    for (const q of QUESTIONS) {
      const asked = N.asked[q.id];
      list.append(UI.btn(esc(q.q) + (asked ? '<span class="sub">Asked.</span>' : ''), () => { m.close(); this.ask(q); }, { cls: asked ? 'ghost' : '' }));
    }
    const body = h('div', { style: { width: '360px' } }, h('div', { class: 'p2p gold', style: { marginBottom: '4px' } }, 'ASK A QUESTION'), h('div', { class: 'vt dim', style: { marginBottom: '8px' } }, 'Questions are free. Asking is always allowed.'), list,
      h('div', { class: 'row', style: { marginTop: '12px' } }, h('div', { class: 'spacer' }), UI.btn('BACK', () => m.close(), { cls: 'ghost small' })));
    m = UI.modal(body);
  }
  async ask(q) {
    if (this.busy) return;
    this.busy = true; this.lock(true);
    try {
      await this.say('you', q.q, 'neutral');
      for (const [who, line, ex] of q.a) {
        if (who === 'vance' && !RUN.neg.vanceIn) await this.bringVance('Good question. Let me grab Legal for that one.');
        await this.say(who, line, ex);
      }
      RUN.neg.asked[q.id] = true;
      if (q.codex) unlockCodex(q.codex);
      if (q.hint) { this.refresh(); const r = this.doc.querySelector(`[data-sec="${q.hint}"]`); if (r) { r.classList.add('hint'); r.scrollIntoView({ block: 'nearest' }); } }
    } finally {
      if (this.alive) { this.busy = false; this.lock(false); if (q.hint) { const r = this.doc.querySelector(`[data-sec="${q.hint}"]`); if (r) r.classList.add('hint'); } }
    }
  }
  async callJo() {
    const N = RUN.neg;
    if (this.busy || N.joCalled) return;
    this.busy = true; this.lock(true);
    try {
      await this.say('you', 'Could I take a day to have a lawyer look this over?', 'neutral');
      await this.say('dana', 'Of course! That\'s totally normal. Just get it back to us by Friday.', 'smile');
      this.phone = true; Sound.sfx('phone'); await this.wait(900);
      for (const [who, line, ex] of JO_REVIEW) await this.say(who, line, ex);
      this.phone = false;
      N.joCalled = true; N.crossref = true;
      N.stars = { s14: 1, s10: 1, s12: 1, s6: 1, s7: 1 };
      ['survival', 'indemnification', 'dutytodefend', 'cooperation', 'confidentiality', 'offerstage'].forEach((c) => unlockCodex(c, true));
      UI.toast('JO FLAGGED 5', 'See the * marks', 'codex', 3200);
    } finally {
      this.phone = false;
      if (this.alive) { this.busy = false; this.lock(false); this.refresh(); }
    }
  }
  signFlow() {
    if (this.busy) return;
    const N = RUN.neg;
    const wins = [];
    for (const s of CONTRACT) for (const o of s.options) if (N.done[o.id] === 'accepted') wins.push(`§${s.n}: ${(N.notes && N.notes[o.id]) || o.label}`);
    const list = h('div', { class: 'doc scroll', style: { padding: '6px 8px', maxHeight: '96px', margin: '8px 0' } },
      wins.length ? wins.map((w) => h('div', { class: 'ins' }, '+ ' + w)) : h('div', { class: 'muted' }, 'No changes. You\'re signing it exactly as written.'));
    let m;
    const body = h('div', { style: { width: '380px' } },
      h('div', { class: 'p2p gold' }, 'READY TO SIGN?'), list,
      RUN.leverage > 0 ? h('div', { class: 'vt', style: { color: '#ffcd75', marginBottom: '6px' } }, `You still have ${RUN.leverage} leverage. It doesn't carry over. Once you sign, it's gone.`) : h('div', { class: 'vt dim', style: { marginBottom: '6px' } }, 'Once you sign, your leverage is gone for good.'),
      h('div', { class: 'row', style: { marginTop: '10px' } }, h('div', { class: 'spacer' }), UI.btn('KEEP READING', () => m.close(), { cls: 'ghost small' }), UI.btn('SIGN IT', () => { m.close(); this.doSign(); }, { cls: 'teal', id: 'btn-sign-confirm' })));
    m = UI.modal(body, { focusSel: '#btn-sign-confirm' });
  }
  async doSign() {
    this.busy = true; this.lock(true);
    this.acts.style.visibility = 'hidden'; this.doc.style.visibility = 'hidden';
    const old = UI.root.querySelector('.dlg'); if (old) old.remove();
    this.signing = { t: 0, stamped: false };
    Sound.sfx('sign');
    await this.wait(1700);
    this.signing.stamped = true; this.signing.st = this.t;
    Sound.sfx('bigstamp'); FX.shake(5, 0.35); FX.paper(240, 150, 30);
    await this.wait(700);
    const lev = RUN.leverage;
    for (let i = 0; i < RUN.leverageMax; i++) { const p = this.levEl.children[i]; if (p) { p.classList.add('off'); p.classList.add('burn'); } }
    if (lev > 0) Sound.sfx('burn');
    RUN.leverage = 0;
    await this.wait(400);
    await this.guard(UI.say({ who: 'LEVERAGE: 0', text: lev > 0 ? `${lev} unspent leverage just evaporated. You will never have this much bargaining power with this company again.` : 'Every bit of leverage is spent. You will never have this much bargaining power with this company again.', voice: 300 }));
    await sayAs(this, 'dana', 'Welcome to Hereinafter! You start Monday.', 'happy');
    const N = RUN.neg, b = balancedAsks();
    if (N.changes === 0) unlockAch('asis');
    if (RUN.spentMoney >= 5) unlockAch('goblin');
    if (b.indem && b.coop && b.conf) unlockAch('balanced');
    checkpoint('career');
    Game.go(() => new CareerScene());
  }
  rescind() {
    if (this.rescinded) return;
    this.rescinded = true; this.busy = true; this.lock(true);
    this.run(async function () {
      await this.wait(300);
      await sayAs(this, 'dana', 'Hey... so. Legal and I talked.', 'worried');
      if (RUN.neg.vanceIn) await sayAs(this, 'vance', 'We\'ve decided to go in a different direction.', 'frown');
      else await sayAs(this, 'dana', 'We\'ve decided to go in a different direction.', 'worried');
      Sound.play('bad'); Sound.sfx('lose');
      unlockAch('rescinded');
      const body = h('div', { style: { width: '360px' } },
        h('div', { class: 'p2p16 red', style: { marginBottom: '10px' } }, 'OFFER RESCINDED'),
        h('p', { class: 'vt', style: { margin: '0 0 8px' } }, 'Leverage is real, but it isn\'t a weapon. Companies say yes to balanced, market-standard asks. They walk away from rewrites.'),
        h('p', { class: 'vt', style: { margin: '0 0 8px' } }, 'Ask for the terms that protect you years from now. Ask respectfully. Skip the strike-it-all demands.'),
        h('div', { class: 'row', style: { marginTop: '10px' } }, h('div', { class: 'spacer' }),
          UI.btn('TITLE', () => Game.go(() => new TitleScene()), { cls: 'ghost small' }),
          UI.btn('TRY AGAIN', () => { const s = Store.data.lastSetup || {}; newRun({ avatar: RUN.avatar, name: RUN.name, offers: RUN.offers, diff: RUN.diff }); Game.go(() => new OfferScene()); }, { cls: 'teal', id: 'btn-retry' })));
      UI.modal(body, { dismiss: false, focusSel: '#btn-retry' });
    });
  }
  /* ---- canvas ---- */
  draw() {
    const t = this.t;
    // wall + wainscot
    rect(0, 0, VW, VH, '#2c3352'); rect(0, 0, VW, 4, '#232842');
    for (let y = 8; y < 186; y += 8) for (let x = (y / 8) % 2 ? 0 : 8; x < VW; x += 16) px(x, y, '#323a5c');
    rect(0, 186, VW, 84, '#232842');
    // window behind the people
    const wx = 256, wy = 34, ww = 216, wh = 72;
    rect(wx - 2, wy - 2, ww + 4, wh + 4, '#1a1c2c');
    const sky = ['#73b6e8', '#7dc0ee', '#88c9f2', '#95d2f5', '#a3dbf7'];
    sky.forEach((c, i) => rect(wx, wy + i * 14, ww, 15, c));
    const r = srand(11);
    for (let x = wx; x < wx + ww;) { const w = 10 + Math.floor(r() * 20), hh = 18 + Math.floor(r() * 40); rect(x, wy + wh - hh, w, hh, '#7d93b5'); for (let yy = wy + wh - hh + 3; yy < wy + wh - 2; yy += 5) for (let xx = x + 2; xx < x + w - 2; xx += 4) px(xx, yy, '#a9bbd6'); x += w + 1; }
    rect(wx + ww / 2 - 1, wy, 2, wh, '#1a1c2c'); rect(wx, wy + 30, ww, 2, '#1a1c2c');
    // the people
    const now = performance.now();
    const tk = (who) => this.talk.who === who && now < this.talk.until && Math.floor(t * 9) % 2 === 0;
    const blink = (o) => ((t + o) % 3.9) < 0.12;
    const ex = (who, d) => (this.talk.who === who && this.talk.expr ? this.talk.expr : d);
    drawBust(Object.assign({}, CAST.dana, { noBg: true, id: 'dana' }), 270, 40, 2, ex('dana', 'smile'), tk('dana'), blink(0));
    if (RUN.neg.vanceIn) {
      const k = this.vanceT === null ? 1 : clamp((t - this.vanceT) / 0.5, 0, 1);
      const vx = lerp(480, 384, Ease.outCubic(k));
      drawBust(Object.assign({}, CAST.vance, { noBg: true, id: 'vance' }), vx, 40, 2, ex('vance', 'neutral'), tk('vance'), blink(1.7));
    }
    // table + nameplates
    rect(252, 102, 224, 6, '#6e4a2e'); rect(252, 108, 224, 80, '#5b3a29'); rect(252, 102, 224, 1, '#8a5a3c');
    rect(276, 96, 52, 8, '#1a1c2c'); text('DANA', 302, 98, '#ffcd75', { align: 'center' });
    if (RUN.neg.vanceIn) { rect(384, 96, 64, 8, '#1a1c2c'); text('M. VANCE', 416, 98, '#ffcd75', { align: 'center' }); }
    // phone call overlay
    if (this.phone) { g.globalAlpha = 0.25; rect(0, 0, VW, VH, '#257179'); g.globalAlpha = 1; rect(300, 34, 120, 10, '#0e0c17'); text('ON THE PHONE WITH JO', 360, 36, '#73eff7', { align: 'center' }); }
    if (this.signing) this.drawSigning();
  }
  drawSigning() {
    const s = this.signing, t = this.t;
    s.t += 1 / 60;
    g.globalAlpha = 0.65; rect(0, 0, VW, VH, '#0e0c17'); g.globalAlpha = 1;
    const x = 110, y = 34, w = 260, hh = 206;
    rect(x + 4, y + 4, w, hh, '#0e0c17'); rect(x, y, w, hh, '#efe3c4'); rectO(x, y, w, hh, '#8a6a3c');
    text('EMPLOYMENT AGREEMENT', x + w / 2, y + 10, '#2b2118', { font: 'p2p', align: 'center' });
    text(CO.toUpperCase(), x + w / 2, y + 22, '#8a6a3c', { align: 'center' });
    const rr = srand(3);
    for (let ly = y + 36; ly < y + 140; ly += 7) { const lw = 200 + Math.floor(rr() * 30); rect(x + 15, ly, lw, 2, '#c9b48a'); if (rr() < 0.25 && RUN.neg.changes) rect(x + 15 + Math.floor(rr() * 120), ly - 1, 50, 1, '#2a52d4'); }
    text('EMPLOYEE SIGNATURE', x + 20, y + 178, '#8a6a3c');
    rect(x + 20, y + 172, 150, 1, '#2b2118');
    const k = clamp(s.t / 1.5, 0, 1);
    let lx = x + 24, ly = y + 166;
    for (let i = 0; i < Math.floor(k * 120); i++) {
      const nx = x + 24 + i * 1.15, ny = y + 164 + Math.sin(i * 0.33) * 5 * Math.sin(i * 0.05) + Math.cos(i * 0.8) * 2;
      line(lx, ly, nx, ny, '#1d2a6b'); lx = nx; ly = ny;
    }
    if (k < 1) { rect(lx, ly - 10, 2, 10, '#2b2118'); rect(lx - 1, ly - 12, 4, 3, '#e8b44a'); }
    if (s.stamped) {
      const sk = clamp((t - s.st) / 0.25, 0, 1), sc = lerp(2.4, 1, Ease.outBack(sk));
      g.save(); g.translate(x + 200, y + 150); g.rotate(-0.2); g.scale(sc, sc);
      rectO(-38, -10, 76, 20, '#d0344a'); rectO(-37, -9, 74, 18, '#d0344a');
      text('EXECUTED', 0, -4, '#d0344a', { font: 'p2p', align: 'center' });
      g.restore();
    }
  }
}
