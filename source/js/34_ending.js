/* =========================================================
   ENDING — the verdict, the ledger, the balanced clause
   ========================================================= */
function computeVerdict() {
  const S = RUN.stats, T = RUN.terms, C = RUN.career, b = balancedAsks();
  const rows = [];
  const indemCost = Math.max(0, Math.round(S.defenseYou - S.reimbursed)) + (S.settlementBy === 'you' ? S.settlement : 0);
  let indemWhat = (S.caseResult === 'dismissed' ? 'Lawsuit dismissed. ' : `Settled for ${moneyK(S.settlement)}${S.settlementBy ? ' (paid by ' + (S.settlementBy === 'you' ? 'you' : S.settlementBy === 'insurer' ? 'D&O insurer' : 'Hereinafter') + ')' : ''}. `);
  indemWhat += S.defenseCo > 0 ? `Hereinafter paid ${moneyK(S.defenseCo)} in defense costs.` : S.hired ? `You paid ${moneyK(S.defenseYou)} in fees${S.reimbursed ? `, ${moneyK(S.reimbursed)} reimbursed later` : ''}.` : 'You defended yourself.';
  rows.push({ n: '§10', t: 'Indemnification', what: indemWhat, cost: indemCost, ask: true });
  rows.push({ n: '§12', t: 'Cooperation', what: `${S.depos} deposition${S.depos === 1 ? '' : 's'}, ${T.coop === 'paid' ? `paid at $${T.coopRate}/hr with your own counsel` : 'unpaid'}.`, cost: Math.round(S.depoLost - S.depoPay), ask: true });
  rows.push({ n: '§6', t: 'Confidentiality', what: T.conf === 'narrow' ? `Trade secrets only. You used your skills freely (${S.skills} orbs).` : `${S.cdKnow} letter${S.cdKnow === 1 ? '' : 's'} for using your own know-how.` + (S.lodestar ? ' Plus a real trade secret claim.' : ''), cost: S.cdKnowCost + S.lodestarCost, ask: true });
  const ncCost = Math.round(S.ncBlocked - S.garden);
  rows.push({ n: '§7', t: 'Non-compete', what: S.ncBlocked > 0 ? `Locked out of your new job${S.garden ? `, paid ${moneyK(S.garden)} while restricted` : ', unpaid'}.` : 'Never kept you from working.', cost: ncCost });
  rows.push({ n: '§8', t: 'Non-solicitation', what: S.cdSolicit ? `${S.cdSolicit} letter${S.cdSolicit === 1 ? '' : 's'} for recruiting.` : `No violations. ${S.recruits} recruited.`, cost: S.cdSolicitCost });
  rows.push({ n: '§9', t: 'Inventions', what: { kept: 'BudgetBuddy stayed yours.', lost: 'BudgetBuddy was assigned to Hereinafter.', unlaunched: 'BudgetBuddy never launched.', launched: 'BudgetBuddy launched.', none: 'No side project.' }[S.side] || 'No side project.', cost: S.sideLost });
  rows.push({ n: '§11', t: 'Arbitration', what: ({ won: 'Won your $12,000 bonus.', lost: 'Lost your bonus claim.', abandoned: 'Never pressed your bonus claim.', started: 'Bonus claim unresolved.' }[S.arb] || 'Never pressed your bonus claim.') + (S.arbFees > 1 ? ` Fees: ${moneyK(S.arbFees)}.` : ''), cost: Math.round(S.arbFees) + (S.arb === 'won' ? 0 : 12000) });
  if (S.burnouts) rows.push({ n: '', t: 'Burnout', what: `${S.burnouts} week${S.burnouts === 1 ? '' : 's'} off to recover.`, cost: S.burnoutCost });
  const total = rows.reduce((a, r) => a + r.cost, 0);
  const grade = total <= 20000 ? 'S' : total <= 60000 ? 'A' : total <= 110000 ? 'B' : total <= 170000 ? 'C' : total <= 240000 ? 'D' : 'F';
  let askValue = 0;
  askValue += b.indem ? Math.round(S.defenseCo + (S.settlementBy === 'company' ? S.settlement : 0)) : indemCost;
  askValue += b.coop ? Math.round(S.deposPaid * 800 + S.depoPay) : Math.round(S.depoLost + S.deposUnpaid * 150 * 8);
  askValue += b.conf ? Math.round(S.skills * 2500 * 0.5) : S.cdKnowCost;
  const nAsks = [b.indem, b.coop, b.conf].filter(Boolean).length;
  const upfront = T.salary * 4 + T.signing;
  let ending;
  if (nAsks === 3) ending = { key: 'balanced', t: 'BALANCED', s: 'Your obligations survived. So did theirs.' };
  else if (RUN.spentMoney >= 5) ending = { key: 'goblin', t: 'THE SALARY GOBLIN', s: `You won ${money(upfront)} more up front. The years after cost you ${money(total)}.` };
  else if (nAsks === 0) ending = { key: 'onesided', t: 'OBLIGATIONS SURVIVE IN FULL', s: 'Everything that bound you survived. Everything that protected you didn\'t.' };
  else ending = { key: 'partial', t: 'HALF A SHIELD', s: 'Some of their promises survived. The gaps cost you.' };
  return { rows, total, grade, askValue, b, nAsks, ending };
}

class EndingScene extends Scene {
  exit() { UI.toastPos('tr'); }
  enter() {
    UI.toastPos('bl');
    const V = this.V = computeVerdict();
    Sound.play(V.nAsks === 3 ? 'good' : 'bad');
    Store.data.endings[V.ending.key] = 1;
    const order = 'SABCDF';
    if (!Store.data.best || order.indexOf(V.grade) < order.indexOf(Store.data.best)) Store.data.best = V.grade;
    Store.data.checkpoint = null; Store.save();
    if (V.grade === 'S') unlockAch('srank');
    if (RUN.stats.cds === 0) unlockAch('clean');
    if (V.nAsks === 3) unlockAch('balanced');
    ['offerstage', 'survival', 'indemnification', 'dutytodefend', 'cooperation', 'confidentiality'].forEach((c) => unlockCodex(c, true));
    this.buildUI();
  }
  buildUI() {
    const V = this.V, T = RUN.terms;
    const panel = h('div', { class: 'abs panel frame', style: { left: '186px', top: '8px', width: '286px', height: '254px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px' } });
    const gradeCol = { S: '#ffcd75', A: '#a7f070', B: '#73eff7', C: '#f4f4f4', D: '#ef7d57', F: '#e04050' }[V.grade];
    panel.append(h('div', { class: 'row', style: { alignItems: 'flex-start' } },
      h('div', { style: { flex: 1 } }, h('div', { class: 'silk dim' }, 'YOUR VERDICT'), h('div', { class: 'p2p gold', style: { marginTop: '3px', lineHeight: '11px' } }, V.ending.t), h('div', { class: 'vt', style: { marginTop: '4px' } }, V.ending.s)),
      h('div', { class: 'col', style: { alignItems: 'center', gap: '2px' } }, h('div', { class: 'p2p16', style: { fontSize: '24px', lineHeight: '24px', color: gradeCol } }, V.grade), h('div', { class: 'silk dim' }, 'GRADE'))));
    const tb = h('table', { class: 'ledger' }, h('tr', null, h('th', null, ''), h('th', null, 'WHAT HAPPENED'), h('th', { style: { textAlign: 'right' } }, 'COST')));
    for (const r of V.rows) {
      tb.append(h('tr', null, h('td', { class: r.ask ? 'gold' : 'dim', style: { whiteSpace: 'nowrap' } }, r.n || '+'), h('td', null, h('span', { class: r.ask ? 'gold' : '' }, r.t + '. '), r.what), h('td', { class: 'num ' + (r.cost > 0 ? 'red' : 'teal') }, r.cost > 0 ? money(r.cost) : r.cost < 0 ? '+' + money(-r.cost) : '$0')));
    }
    tb.append(h('tr', null, h('td', null, ''), h('td', { class: 'p2p' }, 'TOTAL COST'), h('td', { class: 'num p2p ' + (V.total > 0 ? 'red' : 'teal') }, money(V.total))));
    const check = (ok, txt) => h('div', { class: 'row', style: { alignItems: 'flex-start', gap: '6px', margin: '3px 0' } }, icoImg(ok ? 'check' : 'x'), h('span', { class: 'vt' }, txt));
    const scroll = h('div', { class: 'scroll', style: { flex: 1, paddingRight: '4px' } },
      tb,
      h('div', { class: 'plain', style: { marginTop: '8px' } }, h('span', { class: 'lbl' }, 'THE THREE ASKS'), V.nAsks === 3 ? `Your balanced survival clause was worth about ${money(V.askValue)}.` : `Balancing the survival clause would have saved you about ${money(V.askValue)}.`),
      h('div', { class: 'p2p teal', style: { margin: '8px 0 4px' } }, 'THE BALANCED SURVIVAL CLAUSE'),
      check(V.b.indem, 'Indemnification that survives termination, including a duty to defend in third-party lawsuits.'),
      check(V.b.coop, 'Cooperation that compensates you for your time, including attorney fees if you need separate counsel.'),
      check(V.b.conf, 'Lifetime confidentiality limited to genuine trade secrets, not general business information.'),
      h('p', { class: 'vt gold', style: { margin: '8px 0 4px' } }, 'The best time to balance it is at the offer stage, long before you ever need it.'),
      h('p', { class: 'vt', style: { margin: '0 0 4px' } }, 'Before you sign, ask for time to review, and have an employment lawyer read the agreement.'),
      h('p', { class: 'silk dim', style: { margin: '6px 0 0' } }, 'AN EDUCATIONAL GAME, NOT LEGAL ADVICE. LAWS VARY BY STATE, AND DOLLAR FIGURES HERE ARE ILLUSTRATIVE.'));
    panel.append(scroll);
    panel.append(h('div', { class: 'row', style: { gap: '10px', marginTop: '2px' } },
      UI.btn('PLAY AGAIN', () => { newRun({ avatar: RUN.avatar, name: RUN.name, offers: RUN.offers, diff: RUN.diff }); Store.data.runs++; Store.save(); Game.go(() => new OfferScene()); }, { cls: 'teal small', id: 'btn-again' }),
      UI.btn('CODEX', () => openCodex(), { cls: 'small' }),
      h('div', { class: 'spacer' }),
      UI.btn('TITLE', () => Game.go(() => new TitleScene()), { cls: 'ghost small' })));
    UI.add(panel);
    UI.focusFirst(panel, '#btn-again');
  }
  draw() {
    const t = this.t, V = this.V, T = RUN.terms;
    rect(0, 0, VW, VH, '#14121f');
    for (let y = 0; y < VH; y += 8) for (let x = (y / 8) % 2 ? 0 : 8; x < 186; x += 16) px(x, y, '#1c1a2c');
    // the balance scale
    const cx = 92, cy = 92;
    const yours = ['lock', 'fence', 'hand', 'bulb', 'gavel', 'subpoena'];
    const theirs = []; if (T.survivalIndem) theirs.push('shield'); if (T.coop === 'paid') theirs.push('coin');
    const target = clamp((yours.length - theirs.length * 3) * 0.035, -0.3, 0.3);
    const ang = target * Ease.outElastic(clamp(t / 2.2, 0, 1));
    rect(cx - 2, cy, 4, 110, '#a8741a'); rect(cx - 20, cy + 108, 40, 6, '#a8741a'); disc(cx, cy, 4, '#ffcd75');
    const L = 50, lx = cx - Math.cos(ang) * L, ly = cy - Math.sin(ang) * L, rx = cx + Math.cos(ang) * L, ry = cy + Math.sin(ang) * L;
    line(lx, ly, rx, ry, '#ffcd75'); line(lx, ly + 1, rx, ry + 1, '#a8741a');
    const pan = (x, y, icons, label, colr) => {
      line(x, y, x - 17, y + 30, '#94b0c2'); line(x, y, x + 17, y + 30, '#94b0c2');
      rect(x - 19, y + 30, 38, 4, '#a8741a');
      icons.forEach((ic, i) => spr(ICONS[ic], x - 17 + (i % 3) * 12, y + 19 - Math.floor(i / 3) * 11));
      text(label, x, y + 38, colr, { align: 'center' });
    };
    pan(lx, ly, yours, 'BOUND YOU', '#e04050');
    pan(rx, ry, theirs, theirs.length ? 'PROTECTED YOU' : 'NOTHING', theirs.length ? '#3fbfa0' : '#566c86');
    text('SURVIVAL CLAUSE', 92, 14, '#ffcd75', { font: 'p2p', align: 'center' });
    text(`${RUN.name} · ${DIFF[RUN.diff].name.toUpperCase()} · ${RUN.offers} OFFER${RUN.offers > 1 ? 'S' : ''}`, 92, 26, '#94b0c2', { align: 'center' });
    text('FINAL SAVINGS', 92, 226, '#94b0c2', { align: 'center' });
    text(money(RUN.stats.savings), 92, 236, RUN.stats.savings >= 0 ? '#f4f4f4' : '#e04050', { font: 'p2p', align: 'center' });
    text('YEARS AFTER YOU LEFT: 7', 92, 250, '#566c86', { align: 'center' });
  }
}
