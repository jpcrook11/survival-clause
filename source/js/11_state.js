/* =========================================================
   STATE — the current run, codex/achievement unlocks,
   checkpoints, shared menus
   ========================================================= */
let RUN = null;
const LEVERAGE_BY_OFFERS = { 1: 7, 2: 9, 3: 11 };
const DIFF = {
  story: { name: 'Story', spd: 0.78, spawn: 0.7, hearts: 2, dmg: 1 },
  standard: { name: 'Standard', spd: 1, spawn: 1, hearts: 0, dmg: 1 },
  litigator: { name: 'Litigator', spd: 1.18, spawn: 1.3, hearts: -1, dmg: 1 },
};

function newRun(setup) {
  const lev = LEVERAGE_BY_OFFERS[setup.offers] || 9;
  RUN = {
    v: 1, name: (setup.name || 'YOU').toUpperCase().slice(0, 10), avatar: setup.avatar || 0, offers: setup.offers || 2, diff: setup.diff || 'standard',
    leverage: lev, leverageMax: lev, goodwill: 4, goodwillMax: 5, spentMoney: 0, spentLegal: 0,
    terms: { salary: 0, signing: 0, remote: false, pto: false, conf: 'broad', dtsa: false, nc: 'broad', ncPay: 0, ns: 'broad', inv: 'broad', arb: 'oneSided', coop: 'free', coopRate: 0, indem: 'reimburse', dno: false, survivalIndem: false },
    neg: { done: {}, sec: {}, inspected: {}, crossref: false, joCalled: false, foundSelf: false, asked: {}, vanceIn: false, changes: 0, rejected: 0, stars: {} },
    career: { perf: 0, paper: 0, vendor: 'signed', side: 'none', lodestar: false, mentees: false, client: false, layoff: 'reviewed', exit: 'other', interviewed: false, log: [] },
    stats: newStats(),
    chapter: 'offer', wave: 0,
  };
  return RUN;
}
function newStats() {
  return {
    savings: 0, startSavings: 0, income: 0, garden: 0, appIncome: 0, clientIncome: 0,
    defenseTotal: 0, defenseYou: 0, defenseCo: 0, retainer: 0, reimbursed: 0, hired: false,
    settlement: 0, settlementBy: null, caseResult: null,
    depos: 0, deposUnpaid: 0, deposPaid: 0, depoPay: 0, depoLost: 0,
    cds: 0, cdCost: 0, cdKnow: 0, cdKnowCost: 0, cdSolicit: 0, cdSolicitCost: 0,
    ncBlocked: 0, ncMonths: 0,
    side: 'none', sideLost: 0,
    arb: null, arbFees: 0, arbAward: 0,
    lodestar: false, lodestarCost: 0,
    skills: 0, recruits: 0, blocks: 0, burnouts: 0, burnoutCost: 0, hits: 0, maxPhantoms: 0,
    waveLog: [],
  };
}
function balancedAsks(t) {
  t = t || RUN.terms;
  return { indem: t.survivalIndem && t.indem === 'defend', coop: t.coop === 'paid', conf: t.conf === 'narrow' };
}

/* ---------- unlocks ---------- */
function unlockCodex(id, quiet) {
  if (!CODEX_BY[id]) return;
  if (Store.data.codex[id]) return;
  Store.data.codex[id] = 1; Store.save();
  if (!quiet) UI.toast('CODEX +1', CODEX_BY[id].t, 'codex', 2600);
  if (CODEX.every((c) => Store.data.codex[c.id])) unlockAch('codex');
}
function unlockAch(id) {
  const a = ACHIEVEMENTS.find((x) => x.id === id);
  if (!a || Store.data.ach[id]) return;
  Store.data.ach[id] = Date.now(); Store.save();
  UI.toast('ACHIEVEMENT', a.t, 'ach', 3600);
  Sound.sfx('levelup');
}
function checkpoint(scene, extra) {
  if (!RUN) return;
  RUN.chapter = scene;
  Store.data.checkpoint = { scene, run: JSON.parse(JSON.stringify(RUN)), extra: extra || null, at: Date.now() };
  Store.save();
}

/* ---------- shared menus (title + pause) ---------- */
function openCodex(onClose) {
  const unlocked = CODEX.filter((c) => Store.data.codex[c.id]).length;
  const list = h('div', { class: 'cx-list scroll', style: { width: '150px', height: '196px', paddingRight: '4px' } });
  const detail = h('div', { class: 'scroll', style: { flex: '1', height: '196px', paddingRight: '6px' } });
  const show = (c) => {
    detail.innerHTML = '';
    if (!Store.data.codex[c.id]) {
      detail.append(h('div', { class: 'p2p dim', style: { marginTop: '8px' } }, '???'), h('p', { class: 'vt dim' }, 'Not discovered yet. Read the agreement closely, ask questions, and survive the years after you leave.'));
      return;
    }
    detail.append(
      h('div', { class: 'p2p gold', style: { margin: '2px 0 8px' } }, c.t.toUpperCase()),
      h('p', { class: 'vt', style: { margin: '0 0 8px' } }, c.b),
      h('div', { class: 'silk teal' }, 'WHAT TO ASK FOR'),
      h('p', { class: 'vt', style: { margin: '3px 0 0' } }, c.tip),
    );
  };
  CODEX.forEach((c, i) => {
    const on = !!Store.data.codex[c.id];
    const b = h('button', { class: 'cx-item' + (on ? '' : ' locked'), type: 'button' }, on ? c.t : '? ? ?');
    b.addEventListener('click', () => { list.querySelectorAll('.sel').forEach((e) => e.classList.remove('sel')); b.classList.add('sel'); show(c); Sound.sfx('blip'); });
    b.addEventListener('focus', () => { list.querySelectorAll('.sel').forEach((e) => e.classList.remove('sel')); b.classList.add('sel'); show(c); });
    list.append(b);
  });
  const first = CODEX.find((c) => Store.data.codex[c.id]) || CODEX[0];
  show(first);
  const body = h('div', { style: { width: '430px' } },
    h('div', { class: 'row', style: { marginBottom: '8px' } }, h('div', { class: 'p2p gold' }, 'CLAUSE CODEX'), h('div', { class: 'spacer' }), h('div', { class: 'silk dim' }, `${unlocked}/${CODEX.length} DISCOVERED`)),
    h('div', { class: 'row', style: { alignItems: 'flex-start', gap: '12px' } }, list, detail),
    h('div', { class: 'silk dim', style: { marginTop: '6px' } }, 'Educational content, not legal advice. Laws vary by state.'),
  );
  const m = UI.modal(body, { onClose });
  return m;
}
function openAchievements(onClose) {
  const got = ACHIEVEMENTS.filter((a) => Store.data.ach[a.id]).length;
  const grid = h('div', { class: 'scroll', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', maxHeight: '200px', paddingRight: '4px' } });
  for (const a of ACHIEVEMENTS) {
    const on = !!Store.data.ach[a.id];
    grid.append(h('div', { style: { opacity: on ? 1 : 0.55 } },
      h('div', { class: 'p2p ' + (on ? 'gold' : 'dim') }, (on ? '* ' : '- ') + a.t.toUpperCase()),
      h('div', { class: 'vt', style: { marginTop: '2px' } }, a.d)));
  }
  const ENDS = [['balanced', 'BALANCED'], ['partial', 'HALF A SHIELD'], ['goblin', 'THE SALARY GOBLIN'], ['onesided', 'OBLIGATIONS SURVIVE IN FULL']];
  const found = ENDS.filter(([k]) => Store.data.endings && Store.data.endings[k]).length;
  const ends = h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '4px 10px', marginTop: '8px' } },
    h('span', { class: 'silk dim' }, `ENDINGS ${found}/${ENDS.length}:`),
    ENDS.map(([k, t]) => h('span', { class: 'silk ' + (Store.data.endings && Store.data.endings[k] ? 'gold' : 'dim') }, Store.data.endings && Store.data.endings[k] ? t : '???')),
    Store.data.best ? h('span', { class: 'silk teal' }, 'BEST GRADE: ' + Store.data.best) : null);
  const body = h('div', { style: { width: '430px' } },
    h('div', { class: 'row', style: { marginBottom: '8px' } }, h('div', { class: 'p2p gold' }, 'ACHIEVEMENTS'), h('div', { class: 'spacer' }), h('div', { class: 'silk dim' }, `${got}/${ACHIEVEMENTS.length}`)),
    grid, ends);
  return UI.modal(body, { onClose });
}
function openSettings(onClose) {
  const S = Store.S;
  const rowEl = (label, ctl) => h('div', { class: 'row', style: { justifyContent: 'space-between', margin: '6px 0' } }, h('span', { class: 'p2p' }, label), ctl);
  const slider = (key) => {
    const r = h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: S[key], id: 'set-' + key, 'aria-label': key });
    r.addEventListener('input', () => { S[key] = parseFloat(r.value); Sound.applyVolumes(); Store.save(); });
    r.addEventListener('change', () => Sound.sfx('coin'));
    return r;
  };
  const toggle = (key, after) => {
    const b = UI.btn(S[key] ? 'ON' : 'OFF', () => { S[key] = !S[key]; b.innerHTML = S[key] ? 'ON' : 'OFF'; Store.save(); after && after(); }, { cls: 'small', id: 'set-' + key });
    return b;
  };
  const speeds = ['INSTANT', 'FAST', 'NORMAL', 'SLOW'];
  const sp = UI.btn(speeds[S.textSpeed], () => { S.textSpeed = (S.textSpeed + 1) % 4; sp.innerHTML = speeds[S.textSpeed]; Store.save(); }, { cls: 'small', id: 'set-text' });
  const body = h('div', { style: { width: '300px' } },
    h('div', { class: 'p2p gold', style: { marginBottom: '8px' } }, 'SETTINGS'),
    rowEl('MUSIC', slider('music')),
    rowEl('SOUND FX', slider('sfx')),
    rowEl('TEXT SPEED', sp),
    rowEl('SCREEN SHAKE', toggle('shake')),
    rowEl('CRT SCANLINES', toggle('crt', () => document.body.classList.toggle('crt', Store.S.crt))),
    rowEl('PIXEL-PERFECT SCALE', toggle('pixelPerfect', fitStage)),
    h('div', { class: 'silk dim', style: { marginTop: '8px' } }, 'M mutes sound anytime. Esc pauses.'),
  );
  return UI.modal(body, { onClose });
}
function openHowTo(onClose) {
  const P = (t) => h('p', { class: 'vt', style: { margin: '0 0 7px' } }, t);
  const body = h('div', { style: { width: '420px' } },
    h('div', { class: 'p2p gold', style: { marginBottom: '8px' } }, 'HOW TO PLAY'),
    h('div', { class: 'p2p teal' }, '1. THE OFFER'),
    P('Read your employment agreement. Spend LEVERAGE to redline it. Ask for balanced terms and the company says yes. Overreach and GOODWILL drops. At zero, the offer is gone.'),
    h('div', { class: 'p2p teal' }, '2. THE JOB'),
    P('Four years of decisions. Some of them come back later.'),
    h('div', { class: 'p2p teal' }, '3. AFTER YOU LEAVE'),
    P('Survive the years after you quit. The clauses that survived come after you. The protections you negotiated fight for you. Collect paychecks, dodge threats.'),
    h('div', { class: 'p2p teal' }, 'CONTROLS'),
    P('Move: WASD / arrows / left stick. Dash: SPACE (or DASH). Menus: arrows + ENTER, or click. Pause: ESC. Mute: M.'),
    h('div', { class: 'silk dim' }, 'An educational game. Not legal advice. Laws vary by state.'),
  );
  return UI.modal(body, { onClose });
}
