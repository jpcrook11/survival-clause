/* =========================================================
   CHAPTER 4 — AFTER YOU LEAVE (survival arena)
   ========================================================= */
const WAVES = [
  { key: 'y1', title: 'YEAR 1', sub: 'THE RESTRICTED PERIOD', months: 'MONTHS 1-12', dur: 50, ph: 4, subEvery: 0, lead: 'Your non-compete, non-solicit, and confidentiality clauses are all in force.' },
  { key: 'y2', title: 'YEAR 2', sub: 'THE SUBPOENA STORM', months: 'MONTHS 13-24', dur: 55, ph: 5, subEvery: 2.3, claw: true, lead: 'That internal investigation became litigation. Section 12 says you cooperate.' },
  { key: 'y3', title: 'YEAR 3', sub: 'THE LAWSUIT', months: 'MONTHS 25-36', boss: true, ph: 2, subEvery: 0, lead: 'Someone is suing over something you did at your old job.' },
  { key: 'y4', title: 'YEAR 4', sub: 'THE BONUS', months: 'MONTHS 37-48', dur: 46, ph: 6, subEvery: 6.5, arb: true, lead: 'Hereinafter still owes you money. Section 11 decides where you fight for it.' },
  { key: 'y7', title: 'YEAR 7', sub: 'FOREVER', months: 'AND BEYOND', dur: 30, ph: 12, subEvery: 7.5, lifetime: true, lead: 'Most restrictions have expired. The lifetime ones have not.' },
];
const Z = {
  thereto: { x: 30, y: 68, w: 80, h: 18, name: 'THERETO LOGISTICS' },
  meridian: { x: 200, y: 68, w: 80, h: 18, name: 'MERIDIAN HEALTH' },
  tower: { x: 380, y: 68, w: 72, h: 18, name: 'HEREINAFTER' },
  home: { x: 24, y: 208, w: 72, h: 18, name: 'HOME' },
  law: { x: 164, y: 208, w: 62, h: 18, name: 'PARK LAW' },
  court: { x: 372, y: 208, w: 80, h: 18, name: 'COURTHOUSE' },
};
const OBST = [{ x: 240, y: 148, r: 16 }, { x: 140, y: 112, r: 6 }, { x: 330, y: 188, r: 6 }, { x: 92, y: 168, r: 6 }, { x: 404, y: 130, r: 6 }];
const JOBZ = { competitor: 'thereto', other: 'meridian', consult: 'home' };
const SALARY = { competitor: 125000, other: 108000, consult: 115000 };
const BOARD = { x: 168, y: 140 };
const VAULT = { x: 338, y: 80 };
const LAPTOP = { x: 128, y: 214 };
const inZ = (z, x, y, pad = 0) => x >= z.x - pad && x <= z.x + z.w + pad && y >= z.y - pad && y <= z.y + z.h + pad;
const LOU = { id: 'lou', name: 'LOU', role: 'Accounting', skin: 1, hair: 'bald', hairC: '#6d6d7a', top: '#94b0c2', kind: 'sweater', glasses: true, pants: '#3a3f55' };
const COOPC = { id: 'coopc', name: 'YOUR COUNSEL', skin: 1, hair: 'long', hairC: '#7a4a2a', top: '#3b5dc9', kind: 'blazer', acc: 'folder' };
const JO_F = Object.assign({}, CAST.jo, { id: 'jo_f', acc: 'folder' });
const LEGAL_POPS = ['OBJECTION!', 'MOTION TO DISMISS!', 'HEARSAY!', 'SUSTAINED!', 'LACKS STANDING!', 'IRRELEVANT!', 'SO ORDERED!'];

class Ent { constructor(x, y) { this.x = x; this.y = y; this.t = rnd(3); this.dead = false; this.r = 6; } update() {} draw() {} }

class Player extends Ent {
  constructor(x, y) { super(x, y); this.dir = 'down'; this.flip = false; this.moving = false; this.inv = 0; this.dashT = 0; this.dashCd = 0; this.dvx = 0; this.dvy = 1; this.slow = 0; this.frozen = 0; this.frozenMax = 1; this.r = 5; this.trail = []; this.hist = []; }
  get dashing() { return this.dashT > 0; }
  update(dt, A, control) {
    this.t += dt;
    this.inv = Math.max(0, this.inv - dt); this.dashCd = Math.max(0, this.dashCd - dt); this.slow = Math.max(0, this.slow - dt);
    for (const tr of this.trail) tr.a -= dt * 3;
    this.trail = this.trail.filter((q) => q.a > 0);
    if (this.frozen > 0) { this.frozen -= dt; this.moving = false; this.dashT = 0; return; }
    let ax = 0, ay = 0;
    if (control) { const a = Input.axis(); ax = a.x; ay = a.y; }
    if (control && Input.pressed('dash') && this.dashCd <= 0) {
      let dx = ax, dy = ay;
      if (!dx && !dy) { dx = this.dir === 'side' ? (this.flip ? -1 : 1) : 0; dy = this.dir === 'down' ? 1 : this.dir === 'up' ? -1 : 0; }
      const m = Math.hypot(dx, dy) || 1; this.dvx = dx / m; this.dvy = dy / m; this.dashT = 0.16; this.dashCd = 0.8; Sound.sfx('dash');
    }
    let sp = 84 * (this.slow > 0 ? 0.5 : 1), vx = ax * sp, vy = ay * sp;
    if (this.dashT > 0) { this.dashT -= dt; vx = this.dvx * 270; vy = this.dvy * 270; this.trail.push({ x: this.x, y: this.y, a: 0.6, dir: this.dir, flip: this.flip }); }
    this.moving = Math.abs(vx) + Math.abs(vy) > 1;
    if (this.moving) { if (Math.abs(vx) > Math.abs(vy) * 1.1) { this.dir = 'side'; this.flip = vx < 0; } else this.dir = vy < 0 ? 'up' : 'down'; }
    A.moveEnt(this, vx * dt, vy * dt, true);
    if (this.moving) { this.hist.unshift({ x: this.x, y: this.y }); if (this.hist.length > 140) this.hist.pop(); }
  }
  draw(A) {
    const ps = playerSpec();
    for (const tr of this.trail) { g.globalAlpha = tr.a * 0.5; spr(silhouette(chibi(ps, tr.dir, 1), '#73eff7'), tr.x - 9, tr.y - 19, { flip: tr.dir === 'side' && tr.flip }); g.globalAlpha = 1; }
    shadow(this.x, this.y);
    if (this.frozen > 0) {
      spr(S.chair, this.x - 7, this.y - 14);
      spr(chibi(ps, 'down', 0), this.x - 9, this.y - 21);
      const k = this.frozen / this.frozenMax;
      text('DEPOSITION', this.x, this.y - 32, '#73eff7', { align: 'center', outline: '#0e0c17' });
      rect(this.x - 12, this.y - 24, 24, 3, '#0e0c17'); rect(this.x - 11, this.y - 23, 22 * k, 1, '#73eff7');
      return;
    }
    if (this.inv > 0 && Math.floor(this.t * 20) % 2) return;
    const fr = this.moving ? Math.floor(this.t * 8) % 4 : 0;
    spr(chibi(ps, this.dir, fr), this.x - 9, this.y - 19, { flip: this.dir === 'side' && this.flip });
    if (this.slow > 0) text('SHH...', this.x, this.y - 27, '#b57bd8', { align: 'center', outline: '#0e0c17' });
  }
}
function shadow(x, y, w = 10) { g.globalAlpha = 0.28; rect(x - w / 2, y - 1, w, 3, '#0e0c17'); g.globalAlpha = 1; }

class Phantom extends Ent {
  constructor(A, delay) { super(Z.tower.x + 36 + rnd(-10, 10), 76); this.delay = delay || 0; this.poof = 0; this.vx = 0; this.vy = 0; this.r = 6; this.born = A.t; }
  update(dt, A) {
    this.t += dt;
    if (this.delay > 0) { this.delay -= dt; return; }
    if (this.poof > 0) { this.poof -= dt; if (this.poof <= 0) { this.x = Z.tower.x + 36 + rnd(-12, 12); this.y = 76; } return; }
    const p = A.player;
    const sp = (20 + A.wi * 2.5) * A.d.spd * (A.W.lifetime ? 0.85 : 1);
    const a = angTo(this.x, this.y, p.x, p.y - 6) + Math.sin(this.t * 1.7) * 0.7;
    this.vx = lerp(this.vx, Math.cos(a) * sp, dt * 1.5); this.vy = lerp(this.vy, Math.sin(a) * sp, dt * 1.5);
    for (const o of A.ents) if (o !== this && o instanceof Phantom && o.poof <= 0 && o.delay <= 0) { const d = dist(this.x, this.y, o.x, o.y); if (d < 12 && d > 0.1) { this.vx += (this.x - o.x) / d * 20 * dt * 10; this.vy += (this.y - o.y) / d * 20 * dt * 10; } }
    this.x += this.vx * dt; this.y += this.vy * dt;
    this.x = clamp(this.x, 6, 474); this.y = clamp(this.y, 60, 230);
    if (A.mode === 'play' && dist(this.x, this.y, p.x, p.y - 6) < 10 && !p.dashing && p.frozen <= 0) {
      if (A.hurt(1, 'nda')) { p.slow = 1.4; Sound.sfx('gag'); FX.float(p.x, p.y - 30, '§6 CONFIDENTIALITY', '#b57bd8'); }
      this.poof = 2.6; FX.burst(this.x, this.y - 4, 14, ['#b57bd8', '#7b3fb0', '#f4f4f4'], { spd: 60, grav: -20 });
      A.intro('nda', 'NDA PHANTOMS: §6 confidentiality, "at all times thereafter." They never expire. Touch = stress + gag.', 'confidentiality');
    }
  }
  draw(A) {
    if (this.delay > 0 || this.poof > 0) return;
    const bob = Math.sin(this.t * 3) * 2;
    g.globalAlpha = 0.9; spr(Math.floor(this.t * 4) % 2 ? S.phantom1 : S.phantom0, this.x - 8, this.y - 16 + bob); g.globalAlpha = 1;
    if (A.t - this.born < 3 && A.wi === 0) text('NDA', this.x, this.y - 24 + bob, '#b57bd8', { align: 'center', outline: '#0e0c17' });
  }
}
class Lodestar extends Ent {
  constructor() { super(VAULT.x + 7, VAULT.y - 6); this.a = 0; this.state = 'orbit'; this.cd = 0; }
  update(dt, A) {
    this.t += dt; this.cd = Math.max(0, this.cd - dt);
    const p = A.player, cx = VAULT.x + 7, cy = VAULT.y + 4;
    const dp = dist(p.x, p.y, cx, cy);
    if (this.state === 'orbit' && dp < 62 && A.mode === 'play') this.state = 'chase';
    if (this.state === 'chase' && dp > 104) this.state = 'orbit';
    if (this.state === 'orbit') { this.a += dt * 2; this.x = lerp(this.x, cx + Math.cos(this.a) * 20, dt * 4); this.y = lerp(this.y, cy - 6 + Math.sin(this.a) * 10, dt * 4); }
    else { const a = angTo(this.x, this.y, p.x, p.y - 6), sp = 46 * A.d.spd; this.x += Math.cos(a) * sp * dt; this.y += Math.sin(a) * sp * dt; }
    if (A.mode === 'play' && this.cd <= 0 && dist(this.x, this.y, p.x, p.y - 6) < 10) {
      if (A.hurt(2, 'lodestar')) { FX.float(p.x, p.y - 30, 'GENUINE TRADE SECRET', '#ffcd75'); }
      this.cd = 1.5; this.state = 'orbit';
    }
    if (dp < 80) A.intro('lodestar', 'LODESTAR: a genuine trade secret. Protecting it for as long as it stays secret is fair. Stay out of the vault.', 'tradesecret');
  }
  draw() { const bob = Math.sin(this.t * 3) * 2; spr(Math.floor(this.t * 4) % 2 ? S.lodestar1 : S.lodestar0, this.x - 8, this.y - 16 + bob); }
}
class Letter extends Ent {
  constructor(A, tag) { super(Z.tower.x + 36, 40); this.tag = tag; const p = A.player; this.a = angTo(this.x, this.y, p.x, p.y); this.sp = 70 * A.d.spd; this.life = 5.2; this.r = 6; }
  update(dt, A) {
    this.t += dt; if (this.t > this.life) { this.dead = true; FX.paper(this.x, this.y, 5); return; }
    const p = A.player, want = angTo(this.x, this.y, p.x, p.y - 6);
    let da = want - this.a; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
    this.a += clamp(da, -1.7 * dt, 1.7 * dt);
    this.x += Math.cos(this.a) * this.sp * dt; this.y += Math.sin(this.a) * this.sp * dt;
    if (A.blockCheck(this)) return;
    if (dist(this.x, this.y, p.x, p.y - 6) < 9 && A.mode === 'play') {
      if (A.hurt(2, 'cd')) {
        const S = A.S; S.cds++; S.cdCost += 2500;
        if (this.tag === 'know') { S.cdKnow++; S.cdKnowCost += 2500; } else if (this.tag === 'solicit') { S.cdSolicit++; S.cdSolicitCost += 2500; }
        A.money(-2500, 'CEASE & DESIST -$2,500', '#e04050');
        Sound.sfx('stamp'); unlockCodex('cd');
      }
      this.dead = true; FX.paper(this.x, this.y, 10);
    }
  }
  draw() { spr(S.cd, this.x - 7, this.y - 5 + Math.sin(this.t * 8)); }
}
class Subpoena extends Ent {
  constructor(A, fromX, fromY) {
    super(fromX !== undefined ? fromX : Z.tower.x + 36, fromY !== undefined ? fromY : 40);
    const p = A.player; const tx = p.x + (Input.axis().x * 30), ty = p.y - 6 + (Input.axis().y * 30);
    const a = angTo(this.x, this.y, tx, ty), sp = 92 * A.d.spd; this.vx = Math.cos(a) * sp; this.vy = Math.sin(a) * sp; this.life = 4.4; this.r = 7;
  }
  update(dt, A) {
    this.t += dt; if (this.t > this.life) { this.dead = true; return; }
    this.x += this.vx * dt; this.y += this.vy * dt;
    if (A.blockCheck(this, true)) return;
    const p = A.player;
    if (A.mode === 'play' && dist(this.x, this.y, p.x, p.y - 6) < 10 && !p.dashing && p.frozen <= 0) { this.dead = true; A.depose(); }
  }
  draw() { spr(Math.floor(this.t * 8) % 2 ? S.subpoena1 : S.subpoena0, this.x - 8, this.y - 6); }
}
class EProj extends Ent {
  constructor(x, y, a, sp, kind, o = {}) { super(x, y); this.vx = Math.cos(a) * sp; this.vy = Math.sin(a) * sp; this.kind = kind; this.life = o.life || 4; this.home = o.home || 0; this.dmg = o.dmg || 1; this.r = o.r || 4; this.sp = sp; }
  update(dt, A) {
    this.t += dt; if (this.t > this.life) { this.dead = true; return; }
    const p = A.player;
    if (this.home && this.t < this.home) { const a = angTo(this.x, this.y, p.x, p.y - 6); this.vx = lerp(this.vx, Math.cos(a) * this.sp, dt * 2); this.vy = lerp(this.vy, Math.sin(a) * this.sp, dt * 2); }
    this.x += this.vx * dt; this.y += this.vy * dt;
    if (A.blockCheck(this)) return;
    if (dist(this.x, this.y, p.x, p.y - 6) < this.r + 4 && (A.mode === 'play' || A.mode === 'arb')) {
      if (A.hurt(this.dmg, this.kind)) { if (this.kind === 'invoice' && A.T.arb !== 'mutual') A.money(-400, 'INVOICE -$400', '#e04050'); }
      this.dead = true; FX.paper(this.x, this.y, 4);
    }
  }
  draw() {
    if (this.kind === 'dart') { g.save(); g.translate(Math.round(this.x), Math.round(this.y)); g.rotate(Math.atan2(this.vy, this.vx) + Math.PI / 4); g.drawImage(S.dart.c, -4, -4); g.restore(); }
    else if (this.kind === 'scrap') spr(S.scrap, this.x - 3, this.y - 3);
    else spr(S.invoice, this.x - 4, this.y - 5);
  }
}
class Shot extends Ent {
  constructor(x, y, target, dmg, label) { super(x, y); this.target = target; this.dmg = dmg; this.label = label; this.sp = 150; }
  update(dt, A) {
    this.t += dt; const b = this.target;
    if (!b || b.dead || b.hp <= 0) { this.dead = true; return; }
    const a = angTo(this.x, this.y, b.x, b.y - 24); this.x += Math.cos(a) * this.sp * dt; this.y += Math.sin(a) * this.sp * dt;
    if (dist(this.x, this.y, b.x, b.y - 24) < 16) { this.dead = true; b.damage(this.dmg, A); if (this.label) FX.float(b.x + rnd(-20, 20), b.y - 50, this.label, '#73eff7'); }
  }
  draw() { rect(this.x - 2, this.y - 2, 4, 4, '#f4f4f4'); rectO(this.x - 2, this.y - 2, 4, 4, '#94b0c2'); }
}
class Pickup extends Ent {
  constructor(kind, x, y, value, life) { super(x, y); this.kind = kind; this.value = value || 0; this.life = life || 0; this.r = 8; }
  update(dt, A) {
    this.t += dt;
    if (this.life && this.t > this.life) { this.dead = true; return; }
    const p = A.player;
    if (A.mode === 'play' && p.frozen <= 0 && dist(this.x, this.y, p.x, p.y - 4) < 11) { this.dead = true; A.collect(this); }
  }
  draw(A) {
    if (this.life && this.life - this.t < 2 && Math.floor(this.t * 10) % 2) return;
    const bob = Math.round(Math.sin(this.t * 4) * 1.5);
    shadow(this.x, this.y + 2, 8);
    switch (this.kind) {
      case 'check': spr(S.check, this.x - 6, this.y - 8 + bob); break;
      case 'gig': disc(this.x, this.y - 5 + bob, 4, '#ffcd75'); ring(this.x, this.y - 5 + bob, 4, '#a8741a'); text('$', this.x, this.y - 8 + bob, '#a8741a', { align: 'center' }); break;
      case 'orb': spr(A.T.conf === 'narrow' ? S.orb : S.orbC, this.x - 4, this.y - 9 + bob); break;
      case 'coffee': spr(S.coffee, this.x - 4, this.y - 9 + bob); break;
      case 'evidence': case 'folder': spr(S.folder, this.x - 5, this.y - 9 + bob); break;
      case 'lodefile': spr(S.lodefile, this.x - 5, this.y - 10 + bob); if (Math.floor(this.t * 3) % 2) text('LODESTAR', this.x, this.y - 20, '#ffcd75', { align: 'center', outline: '#0e0c17' }); break;
    }
  }
}
class NPC extends Ent {
  constructor(A, spec, kind, worked) {
    super(rnd(60, 420), rnd(110, 196)); this.spec = spec; this.kind = kind; this.worked = worked; this.state = 'wander'; this.tx = this.x; this.ty = this.y; this.wt = 0; this.r = 6; this.dir = 'down'; this.flip = false; this.moving = false; this.slot = 0; this.via = false;
  }
  update(dt, A) {
    this.t += dt;
    let tx = this.x, ty = this.y, sp = 26;
    if (this.state === 'wander') {
      this.wt -= dt; if (this.wt <= 0) { this.wt = rnd(2, 4); this.tx = clamp(this.x + rnd(-70, 70), 40, 440); this.ty = clamp(this.y + rnd(-40, 40), 100, 200); }
      tx = this.tx; ty = this.ty;
    } else if (this.state === 'approach') { tx = A.player.x; ty = A.player.y; sp = 48; }
    else if (this.state === 'follow') { const hh = A.player.hist[Math.min(A.player.hist.length - 1, 14 + this.slot * 14)]; if (hh) { tx = hh.x; ty = hh.y; } sp = 95; }
    else if (this.state === 'yank') { tx = Z.tower.x + 36; ty = 74; sp = 160; if (dist(this.x, this.y, tx, ty) < 8) { this.dead = true; return; } }
    const d = dist(this.x, this.y, tx, ty);
    this.moving = d > 3 && !(this.state === 'follow' && d < 6);
    if (this.moving) {
      const vx = (tx - this.x) / d * sp, vy = (ty - this.y) / d * sp;
      if (this.state === 'yank') { this.x += vx * dt; this.y += vy * dt; }
      else A.moveEnt(this, vx * dt, vy * dt, false);
      if (Math.abs(vx) > Math.abs(vy)) { this.dir = 'side'; this.flip = vx < 0; } else this.dir = vy < 0 ? 'up' : 'down';
    }
    if ((this.state === 'wander' || this.state === 'approach') && A.mode === 'play' && dist(this.x, this.y, A.player.x, A.player.y) < 12 && A.player.frozen <= 0) A.recruit(this, this.state === 'approach');
  }
  draw(A) {
    shadow(this.x, this.y);
    spr(chibi(this.spec, this.dir, this.moving ? Math.floor(this.t * 7) % 4 : 0), this.x - 9, this.y - 19, { flip: this.dir === 'side' && this.flip });
    if (this.state === 'yank') { line(this.x, this.y - 10, Z.tower.x + 36, 66, '#d0344a'); return; }
    if (this.state !== 'follow') {
      const restricted = A.nsRestricted(this, false);
      text(this.spec.name, this.x, this.y - 28, '#f4f4f4', { align: 'center', outline: '#0e0c17' });
      text(restricted ? '§8' : 'FREE', this.x, this.y - 36, restricted ? '#e04050' : '#a7f070', { align: 'center', outline: '#0e0c17' });
    }
  }
}
class Ally extends Ent {
  constructor(A, kind) {
    super(A.player.x - 16, A.player.y); this.kind = kind; this.fireCd = 1.2; this.blockCd = 0;
    this.spec = kind === 'defense' ? CAST.counsel : kind === 'hired' ? JO_F : COOPC;
    this.label = kind === 'defense' ? 'DEFENSE COUNSEL' : kind === 'hired' ? 'JO PARK $450/HR' : 'YOUR COUNSEL';
    this.dir = 'down'; this.flip = false; this.moving = false;
    FX.burst(this.x, this.y - 8, 16, ['#3fbfa0', '#73eff7', '#f4f4f4'], { spd: 60 });
  }
  update(dt, A) {
    this.t += dt; this.blockCd = Math.max(0, this.blockCd - dt);
    const p = A.player, ox = p.flip ? 16 : -16;
    const tx = p.x + ox, ty = p.y + 4, d = dist(this.x, this.y, tx, ty);
    this.moving = d > 4;
    if (this.moving) { const sp = Math.min(160, d * 5); this.x += (tx - this.x) / d * sp * dt; this.y += (ty - this.y) / d * sp * dt; this.dir = 'side'; this.flip = tx < this.x; }
    if (A.boss && A.boss.state === 'fight' && this.kind !== 'coop' && A.mode === 'play') {
      this.fireCd -= dt;
      if (this.fireCd <= 0) { this.fireCd = 1.15; A.ents.push(new Shot(this.x, this.y - 10, A.boss, 2.6, chance(0.35) ? pick(LEGAL_POPS) : null)); Sound.sfx('paper'); }
      this.dir = 'side'; this.flip = A.boss.x < this.x;
    }
  }
  draw() {
    shadow(this.x, this.y);
    spr(chibi(this.spec, this.dir, this.moving ? Math.floor(this.t * 8) % 4 : 0), this.x - 9, this.y - 19, { flip: this.dir === 'side' && this.flip });
    if (this.blockCd > 0) { g.globalAlpha = this.blockCd; ring(this.x, this.y - 10, 14 - this.blockCd * 4, '#73eff7'); g.globalAlpha = 1; }
    text(this.label, this.x, this.y - 27, this.kind === 'hired' ? '#ffcd75' : '#73eff7', { align: 'center', outline: '#0e0c17' });
  }
}
class Claw extends Ent {
  constructor(A, protectedApp) { super(LAPTOP.x, -40); this.prot = protectedApp; this.state = 'down'; this.holding = false; Sound.sfx('claw'); Sound.sfx('alarm'); }
  update(dt, A) {
    this.t += dt;
    if (this.state === 'down') { this.y += 110 * dt; if (this.y >= LAPTOP.y - 22) { this.y = LAPTOP.y - 22; this.state = this.prot ? 'bounce' : 'grab'; this.st = this.t; if (this.prot) { Sound.sfx('shield'); FX.shake(3, 0.3); A.clawBlocked(); } else { Sound.sfx('claw'); A.clawGrabbed(); this.holding = true; } } }
    else if (this.state === 'bounce') { if (this.t - this.st > 1.2) { this.y -= 160 * dt; if (this.y < -60) this.dead = true; } }
    else if (this.state === 'grab') { if (this.t - this.st > 0.6) { const tx = Z.tower.x + 36, ty = 20; this.x = lerp(this.x, tx, dt * 1.6); this.y = lerp(this.y, ty, dt * 1.6); if (dist(this.x, this.y, tx, ty) < 8) this.dead = true; } }
  }
  draw(A) {
    rect(this.x - 1, -10, 2, this.y + 12, '#566c86');
    rect(this.x - 8, this.y, 16, 6, '#94b0c2'); rectO(this.x - 8, this.y, 16, 6, '#0e0c17');
    const open = this.state === 'down' ? 4 : 1;
    rect(this.x - 9 - open, this.y + 6, 3, 10, '#94b0c2'); rect(this.x + 6 + open, this.y + 6, 3, 10, '#94b0c2');
    rect(this.x - 9 - open, this.y + 15, 5, 2, '#566c86'); rect(this.x + 4 + open, this.y + 15, 5, 2, '#566c86');
    if (this.holding) spr(S.laptop, this.x - 6, this.y + 10);
    text('§9', this.x, this.y - 8, '#e04050', { align: 'center', outline: '#0e0c17' });
    if (this.state === 'bounce') { g.globalAlpha = 0.6 + 0.3 * Math.sin(this.t * 20); ring(LAPTOP.x, LAPTOP.y - 4, 16, '#3fbfa0'); ring(LAPTOP.x, LAPTOP.y - 4, 17, '#73eff7'); g.globalAlpha = 1; }
  }
}
class Boss extends Ent {
  constructor(A) {
    super(Z.court.x + 40, 248); this.max = RUN.career.layoff === 'ran' ? 130 : 100; this.hp = this.max; this.state = 'emerge'; this.flash = 0; this.cd = { dart: 2.2, swarm: 4, sub: 3.5 }; this.r = 18; this.contactCd = 0;
  }
  get phase() { return this.hp > this.max * 0.66 ? 1 : this.hp > this.max * 0.33 ? 2 : 3; }
  update(dt, A) {
    this.t += dt; this.flash = Math.max(0, this.flash - dt); this.contactCd = Math.max(0, this.contactCd - dt);
    if (this.state === 'emerge') { this.x = lerp(this.x, 240, dt * 0.9); this.y = lerp(this.y, 118, dt * 0.9); if (dist(this.x, this.y, 240, 118) < 4) this.state = 'idle'; return; }
    if (this.state === 'idle' || this.state === 'dead') return;
    this.x = 240 + Math.sin(this.t * 0.42) * 150; this.y = 118 + Math.sin(this.t * 0.84) * 18;
    if (A.mode !== 'play') return;
    const p = A.player, ph = this.phase, sm = A.d.spawn;
    this.cd.dart -= dt * sm;
    if (this.cd.dart <= 0) {
      this.cd.dart = ph === 1 ? 2.4 : 2.9;
      const a0 = angTo(this.x, this.y - 20, p.x, p.y - 6), n = ph === 3 ? 7 : 5;
      for (let i = 0; i < n; i++) A.ents.push(new EProj(this.x, this.y - 20, a0 + (i - (n - 1) / 2) * 0.22, 84 * A.d.spd, 'dart', { dmg: 2, life: 4 }));
      Sound.sfx('paper');
    }
    if (ph >= 2) { this.cd.swarm -= dt * sm; if (this.cd.swarm <= 0) { this.cd.swarm = 4.6; for (let i = 0; i < 6; i++) A.ents.push(new EProj(this.x + rnd(-14, 14), this.y - 20, rnd(TAU), 55 * A.d.spd, 'scrap', { home: 2.6, life: 4.2, dmg: 1 })); A.tickMsg('DISCOVERY REQUESTS!', '#efe3c4', 2); } }
    if (ph >= 3) { this.cd.sub -= dt * sm; if (this.cd.sub <= 0) { this.cd.sub = 3.4; A.ents.push(new Subpoena(A, this.x, this.y - 20)); } }
    if (this.contactCd <= 0 && dist(this.x, this.y - 18, p.x, p.y - 6) < 22) { if (A.hurt(2, 'boss')) { const a = angTo(this.x, this.y, p.x, p.y); A.moveEnt(p, Math.cos(a) * 26, Math.sin(a) * 26, true); } this.contactCd = 1; }
  }
  damage(n, A) {
    if (this.state !== 'fight') return;
    this.hp = Math.max(0, this.hp - n); this.flash = 0.12; Sound.sfx('hit'); FX.paper(this.x, this.y - 24, 4);
    if (this.hp <= 0) { this.state = 'dead'; A.caseEnd('dismissed'); }
  }
  draw(A) {
    const x = Math.round(this.x - 24), y = Math.round(this.y - 54), t = this.t;
    shadow(this.x, this.y, 30);
    const step = Math.floor(t * 5) % 2;
    rect(x + 12, y + 50 + step, 7, 5, '#2b2118'); rect(x + 29, y + 51 - step, 7, 5, '#2b2118');
    const B = this.flash > 0 ? '#ffffff' : '#efe3c4';
    // red tape arms
    const sw = Math.sin(t * 6) * 4;
    for (let i = 0; i < 10; i++) { rect(x + 2 - i, y + 26 + Math.sin(i * 0.6 + t * 6) * 2 + (i * sw) / 10, 2, 2, '#d0344a'); rect(x + 44 + i, y + 26 + Math.cos(i * 0.6 + t * 6) * 2 - (i * sw) / 10, 2, 2, '#d0344a'); }
    rect(x + 3, y + 3, 42, 50, '#0e0c17'); rect(x + 4, y + 4, 40, 48, B);
    rect(x + 36, y + 4, 8, 8, '#c9b48a'); rect(x + 36, y + 4, 1, 8, '#0e0c17'); rect(x + 36, y + 11, 8, 1, '#0e0c17');
    text('COMPLAINT', x + 21, y + 7, '#d0344a', { align: 'center' });
    for (let i = 0; i < 4; i++) rect(x + 8, y + 15 + i * 3, 30 - (i % 3) * 7, 1, '#94b0c2');
    // eyes
    const angry = this.phase >= 2;
    rect(x + 10, y + 27, 9, 6, '#f4f4f4'); rect(x + 28, y + 27, 9, 6, '#f4f4f4');
    const p = A.player, lx = clamp((p.x - this.x) / 60, -1, 1), ly = clamp((p.y - this.y) / 60, -1, 1);
    rect(x + 13 + lx * 2, y + 29 + ly, 3, 3, '#d0344a'); rect(x + 31 + lx * 2, y + 29 + ly, 3, 3, '#d0344a');
    line(x + 9, y + (angry ? 23 : 25), x + 19, y + 26, '#0e0c17'); line(x + 28, y + 26, x + 38, y + (angry ? 23 : 25), '#0e0c17');
    // mouth with staple teeth
    const mo = 2 + Math.abs(Math.sin(t * 4)) * 3;
    rect(x + 13, y + 37, 22, 4 + mo, '#0e0c17');
    for (let i = 0; i < 5; i++) { rect(x + 14 + i * 4, y + 37, 3, 1, '#94b0c2'); rect(x + 14 + i * 4, y + 37, 1, 2, '#94b0c2'); rect(x + 16 + i * 4, y + 37, 1, 2, '#94b0c2'); }
    if (RUN.career.layoff === 'ran') { rect(x + 6, y + 44, 36, 6, '#7a1f2e'); text('+DUNN CLAIM', x + 24, y + 44, '#efe3c4', { align: 'center' }); }
  }
}

class ArenaScene extends Scene {
  constructor(wi) { super(); this.wi = wi; this.W = WAVES[wi]; }
  enter() {
    document.body.classList.add('arena');
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    this.S = RUN.stats; this.T = RUN.terms; this.C = RUN.career; this.d = DIFF[RUN.diff] || DIFF.standard;
    RUN.arena = RUN.arena || { peace: null, skill: 0, recruited: [], yanked: {}, app: null, posted: false };
    this.AR = RUN.arena;
    this.snap = JSON.parse(JSON.stringify(this.S));
    this.mode = 'intro'; this.modeT = 0; this.timer = 0; this.paused = false;
    this.ents = []; this.msg = null; this.seen = {}; this.fenceCd = 0; this.moneyFlash = 0; this.moneyCol = '#f4f4f4';
    this.player = new Player(240, 200);
    this.maxPeace = Math.max(4, (5 + (this.T.remote ? 1 : 0) + (this.T.pto ? 1 : 0) + this.d.hearts) * 2);
    this.peace = this.AR.peace === null || this.AR.peace === undefined ? this.maxPeace : Math.min(this.maxPeace, this.AR.peace);
    this.jobKey = JOBZ[this.C.exit]; this.jobZ = Z[this.jobKey]; this.salary = SALARY[this.C.exit];
    this.fenceOn = this.computeFence();
    const z = this.jobZ;
    this.fenceRect = z.y < 100 ? { x: z.x - 4, y: 64, w: z.w + 8, h: 28 } : { x: z.x - 4, y: z.y - 6, w: z.w + 8, h: 30 };
    this.timers = { pay: 1.2, gig: 4, orb: 5, coffee: 12, sub: 3, client: 4, app: 3, ev: 2, board: 0, home: 0 };
    this.durScale = DEBUG && DEBUG.fast ? 0.2 : 1;
    this.trial = 70 * this.durScale; this.boss = null; this.companyDefends = false;
    this.app = this.AR.app === 'kept' ? { state: 'live' } : null;
    this.buildMap();
    this.setupWave();
    Sound.play(this.W.boss ? 'boss' : 'arena');
    Sound.sfx('whoosh');
  }
  exit() { document.body.classList.remove('arena'); }
  computeFence() {
    const T = this.T, exit = this.C.exit;
    if (exit === 'other') return false;
    if (T.nc === 'narrow') return this.wi === 0 && exit === 'competitor';
    return this.wi <= 1;
  }
  nsRestricted(npc, viaPosting) {
    if (this.T.ns === 'narrow') { if (this.wi >= 1) return false; if (viaPosting) return false; return !!npc.worked; }
    return this.wi <= 1;
  }
  setupWave() {
    const T = this.T, C = this.C, W = this.W;
    if (T.conf === 'broad') for (let i = 0; i < W.ph; i++) this.ents.push(new Phantom(this, i * 1.1 + 0.5));
    if (C.lodestar) { this.ents.push(new Lodestar()); if (this.wi === 0 && !this.S.lodestar) this.ents.push(new Pickup('lodefile', VAULT.x + 7, VAULT.y + 20, 0, 0)); }
    // former colleagues and clients
    const roster = [];
    if (C.mentees) { roster.push([CAST.priya, 'colleague', true]); roster.push([CAST.marco, 'colleague', true]); }
    roster.push([LOU, 'colleague', false]);
    if (C.client && C.exit !== 'other') roster.push([CAST.okafor, 'client', true]);
    this.npcs = [];
    let slot = 0;
    for (const [spec, kind, worked] of roster) {
      const n = new NPC(this, spec, kind, worked);
      if (this.AR.recruited.includes(spec.id)) { n.state = 'follow'; n.slot = slot++; n.x = this.player.x - 10 * slot; n.y = this.player.y + 6; }
      else if (this.AR.yanked[spec.id] && this.nsRestricted(n, false)) continue;
      this.ents.push(n); this.npcs.push(n);
    }
    if (T.coop === 'paid' && (W.subEvery > 0 || W.boss)) this.coopAlly = this.addAlly('coop');
    this.posted = false;
  }
  addAlly(kind) { const a = new Ally(this, kind); this.ents.push(a); return a; }
  /* ---------- static map ---------- */
  buildMap() {
    const [c, x] = makeCanvas(VW, VH);
    const f = (a, b, w, hh, cl) => { x.fillStyle = cl; x.fillRect(a, b, w, hh); };
    // plaza tiles
    for (let yy = 64; yy < 230; yy += 16) for (let xx = 0; xx < VW; xx += 16) { f(xx, yy, 16, 16, ((xx + yy) / 16) % 2 ? '#6d7182' : '#676b7c'); f(xx, yy, 16, 1, '#5d6172'); f(xx, yy, 1, 16, '#5d6172'); }
    // grass patches
    const grass = [[40, 104, 70, 40], [370, 150, 80, 40], [270, 104, 50, 30], [120, 180, 60, 22]];
    for (const [gx, gy, gw, gh] of grass) { f(gx, gy, gw, gh, '#3f7a48'); for (let yy = gy; yy < gy + gh; yy += 2) for (let xx = gx + (yy % 4 ? 1 : 0); xx < gx + gw; xx += 4) f(xx, yy, 1, 1, '#4b8c55'); f(gx, gy, gw, 1, '#2f5e37'); }
    // sidewalks
    f(0, 62, VW, 26, '#8b8f9e'); for (let xx = 0; xx < VW; xx += 20) f(xx, 62, 1, 26, '#7a7e8c'); f(0, 87, VW, 1, '#5d6172');
    f(0, 204, VW, 26, '#8b8f9e'); for (let xx = 0; xx < VW; xx += 20) f(xx, 204, 1, 26, '#7a7e8c'); f(0, 204, VW, 1, '#5d6172');
    // top buildings
    // Thereto: red brick
    f(18, 16, 104, 48, '#7a3730'); for (let yy = 16; yy < 64; yy += 4) for (let xx = 18 + ((yy / 4) % 2) * 4; xx < 122; xx += 8) f(xx, yy, 7, 3, '#8a3f37');
    f(18, 16, 104, 9, '#3a1d1a'); f(54, 40, 32, 24, '#3a3f55'); for (let yy = 42; yy < 64; yy += 3) f(54, yy, 32, 1, '#2c3045');
    // Meridian: clean white
    f(188, 22, 104, 42, '#d8dde6'); f(188, 22, 104, 9, '#257179'); for (let xx = 196; xx < 288; xx += 14) { f(xx, 36, 9, 10, '#41a6f6'); f(xx, 36, 9, 1, '#2a7ab8'); }
    f(228, 48, 24, 16, '#41a6f6'); f(239, 48, 1, 16, '#257179');
    // little parks between
    f(122, 16, 66, 46, '#2f5e37'); f(292, 16, 76, 46, '#2f5e37');
    // Hereinafter tower
    f(368, 0, 96, 64, '#1f2440'); f(370, 0, 92, 64, '#262c4f');
    for (let yy = 6; yy < 50; yy += 8) for (let xx = 376; xx < 456; xx += 8) f(xx, yy, 5, 5, ((xx * 3 + yy * 5) % 7) < 3 ? '#ffcd75' : '#333c57');
    f(396, 44, 40, 20, '#0e0c17'); f(398, 46, 36, 18, '#3b5dc9'); f(416, 46, 1, 18, '#0e0c17');
    // bottom buildings (roofs seen from above, doors facing the plaza)
    f(14, 228, 92, 42, '#7a1f2e'); for (let yy = 232; yy < 270; yy += 4) f(14, yy, 92, 1, '#651a26'); f(14, 228, 92, 3, '#efe3c4'); f(48, 226, 22, 6, '#5b3a29');
    f(150, 228, 90, 42, '#5b3a29'); for (let yy = 232; yy < 270; yy += 5) f(150, yy, 90, 1, '#4a2f20'); f(150, 228, 90, 3, '#c9b48a'); f(186, 226, 18, 6, '#2b2118');
    f(352, 228, 116, 42, '#94b0c2'); for (let xx = 360; xx < 468; xx += 12) f(xx, 230, 4, 40, '#c2d3df'); f(352, 228, 116, 4, '#efe3c4'); f(398, 226, 24, 6, '#333c57');
    // fountain
    for (let yy = -16; yy <= 16; yy++) { const w = Math.floor(Math.sqrt(256 - yy * yy)); f(240 - w, 148 + yy, w * 2 + 1, 1, '#94b0c2'); }
    for (let yy = -12; yy <= 12; yy++) { const w = Math.floor(Math.sqrt(144 - yy * yy)); f(240 - w, 148 + yy, w * 2 + 1, 1, '#41a6f6'); }
    f(237, 140, 6, 12, '#c2d3df');
    this.mapCanvas = c;
  }
  drawMap() {
    g.drawImage(this.mapCanvas, 0, 0);
    // signs (bitmap text on the live canvas)
    const sign = (str, cx, y, fg, bg) => { const w = textW(str) + 6; rect(cx - w / 2, y - 1, w, 9, bg || '#0e0c17'); text(str, cx, y + 1, fg || '#ffcd75', { align: 'center' }); };
    sign('THERETO LOGISTICS', 70, 18, '#efe3c4', '#3a1d1a');
    sign('MERIDIAN HEALTH', 240, 24, '#f4f4f4', '#257179');
    sign('HEREINAFTER', 416, 21, '#ffcd75', '#0e0c17');
    sign(this.C.exit === 'consult' ? 'YOUR CONSULTANCY' : 'HOME', 60, 248, '#efe3c4', '#4a1420');
    sign('PARK LAW', 195, 248, '#ffcd75', '#2b2118');
    sign('COURTHOUSE', 410, 248, '#0e0c17', '#c2d3df');
    // fountain sparkle
    const t = this.t;
    for (let i = 0; i < 3; i++) { const a = t * 2 + i * 2.1; px(240 + Math.cos(a) * 7, 146 + Math.sin(a) * 5, '#c2ecff'); }
    // trees, lamps, benches
    for (const o of OBST.slice(1)) spr(S.tree, o.x - 7, o.y - 15);
    spr(S.bench, 300, 118); spr(S.bench, 170, 186); spr(S.lamp, 196, 96); spr(S.lamp, 290, 172);
    // job board
    rect(BOARD.x - 9, BOARD.y - 16, 18, 13, '#8a5a3c'); rectO(BOARD.x - 9, BOARD.y - 16, 18, 13, '#0e0c17'); rect(BOARD.x - 6, BOARD.y - 14, 5, 4, '#efe3c4'); rect(BOARD.x + 1, BOARD.y - 13, 5, 5, '#efe3c4'); rect(BOARD.x - 1, BOARD.y - 3, 2, 6, '#5b3a29');
    text('JOBS', BOARD.x, BOARD.y - 24, '#efe3c4', { align: 'center', outline: '#0e0c17' });
    // vault
    if (this.C.lodestar) spr(S.vault, VAULT.x, VAULT.y);
    // job zone highlight
    const z = this.jobZ;
    if (!this.fenceOn) { const a = 0.18 + 0.12 * Math.sin(t * 4); g.globalAlpha = a; rect(z.x, z.y, z.w, z.h, '#a7f070'); g.globalAlpha = 1; text('YOUR NEW JOB', z.x + z.w / 2, z.y + (z.y < 100 ? z.h + 2 : -8), '#a7f070', { align: 'center', outline: '#0e0c17' }); }
    // law office + court doors
    if (this.W.boss && !this.companyDefends && !this.S.hired && this.boss && this.boss.state === 'fight') { const a = 0.25 + 0.2 * Math.sin(t * 6); g.globalAlpha = a; rect(Z.law.x, Z.law.y, Z.law.w, Z.law.h, '#ffcd75'); g.globalAlpha = 1; text('HIRE A LAWYER', Z.law.x + Z.law.w / 2, Z.law.y - 8, '#ffcd75', { align: 'center', outline: '#0e0c17' }); }
    if (this.arbDoor && !this.S.arb) { const a = 0.25 + 0.2 * Math.sin(t * 6); g.globalAlpha = a; rect(Z.court.x, Z.court.y, Z.court.w, Z.court.h, '#73eff7'); g.globalAlpha = 1; text(this.T.arb === 'mutual' ? 'ARBITRATION (CO. PAYS FEES)' : 'ARBITRATION (FEES SPLIT)', Z.court.x + Z.court.w / 2, Z.court.y - 8, '#73eff7', { align: 'center', outline: '#0e0c17' }); }
    // laptop for the side project
    if (this.app && this.app.state !== 'live' && this.app.state !== 'gone') {
      spr(S.laptop, LAPTOP.x - 6, LAPTOP.y - 8);
      if (this.app.state === 'ready') { text('LAUNCH APP', LAPTOP.x, LAPTOP.y - 18, '#73eff7', { align: 'center', outline: '#0e0c17' }); if (this.app.prog > 0) { rect(LAPTOP.x - 10, LAPTOP.y + 2, 20, 3, '#0e0c17'); rect(LAPTOP.x - 9, LAPTOP.y + 3, 18 * this.app.prog, 1, '#73eff7'); } }
    } else if (this.app && this.app.state === 'live' && !this.app.claimed) {
      spr(S.laptop, LAPTOP.x - 6, LAPTOP.y - 8); text('BUDGETBUDDY: LIVE', LAPTOP.x, LAPTOP.y - 18, '#a7f070', { align: 'center', outline: '#0e0c17' });
    }
    // fence
    if (this.fenceOn) this.drawFence();
  }
  drawFence() {
    const f = this.fenceRect, t = this.t, top = f.y < 100;
    const post = (x, y) => { rect(x - 1, y - 8, 3, 10, '#333c57'); px(x, y - 9, '#e04050'); };
    const wire = (x0, y0, x1, y1) => { line(x0, y0 - 5, x1, y1 - 5, '#94b0c2'); line(x0, y0 - 2, x1, y1 - 2, '#94b0c2'); };
    const yb = top ? f.y + f.h : f.y, yo = top ? f.y + 4 : f.y + f.h;
    for (let x = f.x; x <= f.x + f.w; x += 10) post(x, yb);
    for (let y = Math.min(yo, yb); y <= Math.max(yo, yb); y += 8) { post(f.x, y); post(f.x + f.w, y); }
    wire(f.x, yb, f.x + f.w, yb); wire(f.x, yo, f.x, yb); wire(f.x + f.w, yo, f.x + f.w, yb);
    if (Math.floor(t * 6) % 3 === 0) { const sx = f.x + rnd(f.w); px(sx, yb - 4, '#ffcd75'); px(sx + 1, yb - 5, '#f4f4f4'); }
    const months = this.T.nc === 'narrow' ? '12 MO' : '24 MO';
    const lbl = `§7 RESTRICTED · ${months}` + (this.T.ncPay ? ' · PAID' : '');
    const w = textW(lbl) + 6, cx = f.x + f.w / 2, ly = top ? yb + 4 : yb - 16;
    rect(cx - w / 2, ly, w, 9, '#7a1f2e'); text(lbl, cx, ly + 2, '#ffcd75', { align: 'center' });
  }
  /* ---------- movement & collision ---------- */
  moveEnt(e, dx, dy, isPlayer) {
    const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 4) || 1;
    for (let i = 0; i < steps; i++) { e.x += dx / steps; this.collide(e, isPlayer, 'x'); e.y += dy / steps; this.collide(e, isPlayer, 'y'); }
  }
  collide(e, isPlayer) {
    const inArb = this.mode === 'arb';
    if (inArb) { e.x = clamp(e.x, 46, 434); e.y = clamp(e.y, 96, 236); return; }
    e.x = clamp(e.x, 8, 472); e.y = clamp(e.y, 70, 226);
    for (const o of OBST) { const d = dist(e.x, e.y, o.x, o.y), m = o.r + e.r; if (d < m) { if (d < 0.01) { e.y += m; continue; } e.x = o.x + (e.x - o.x) / d * m; e.y = o.y + (e.y - o.y) / d * m; } }
    if (this.C.lodestar) { const vx = VAULT.x, vy = VAULT.y; if (e.x > vx - e.r && e.x < vx + 14 + e.r && e.y > vy && e.y < vy + 12 + e.r) { const dl = e.x - (vx - e.r), dr = vx + 14 + e.r - e.x, db = vy + 12 + e.r - e.y; const m = Math.min(dl, dr, db); if (m === dl) e.x = vx - e.r; else if (m === dr) e.x = vx + 14 + e.r; else e.y = vy + 12 + e.r; } }
    if (this.fenceOn) {
      const f = this.fenceRect, top = f.y < 100;
      if (e.x > f.x - e.r && e.x < f.x + f.w + e.r && e.y > f.y - e.r && e.y < f.y + f.h + e.r) {
        const dl = e.x - (f.x - e.r), dr = f.x + f.w + e.r - e.x, dT = e.y - (f.y - e.r), dB = f.y + f.h + e.r - e.y;
        const opts = top ? [['l', dl], ['r', dr], ['b', dB]] : [['l', dl], ['r', dr], ['t', dT]];
        opts.sort((a, b) => a[1] - b[1]);
        const s = opts[0][0];
        if (s === 'l') e.x = f.x - e.r; else if (s === 'r') e.x = f.x + f.w + e.r; else if (s === 'b') e.y = f.y + f.h + e.r; else e.y = f.y - e.r;
        if (isPlayer) this.fenceTouch();
      }
    }
  }
  fenceTouch() {
    if (this.fenceCd > 0 || this.mode !== 'play') return;
    this.fenceCd = 1.1;
    this.hurt(1, 'fence');
    FX.burst(this.player.x, this.player.y - 6, 12, ['#ffcd75', '#f4f4f4', '#e04050'], { spd: 70 });
    FX.float(this.player.x, this.player.y - 30, '§7 NON-COMPETE', '#e04050');
    unlockCodex('noncompete');
    this.intro('fence', this.C.exit === 'consult' ? 'Your non-compete covers "any business competitive." That includes your own consultancy.' : 'Your non-compete fences off your new job.', 'noncompete');
  }
  /* ---------- damage, money, messages ---------- */
  hurt(n, src) {
    const p = this.player;
    if (p.inv > 0 || p.frozen > 0 || p.dashing) return false;
    if (this.mode !== 'play' && this.mode !== 'arb') return false;
    this.peace -= n; p.inv = 1.0; this.S.hits++;
    Sound.sfx('hurt'); FX.shake(3, 0.2); FX.flash('#d0344a', 0.1);
    if (this.peace <= 0) { this.peace = 0; this.burnout(); }
    return true;
  }
  hurtRaw(n) { this.peace -= n; if (this.peace <= 0) { this.peace = 0; this.burnout(); } }
  money(d, label, color, x, y) {
    this.S.savings += d;
    if (label) FX.float(x !== undefined ? x : this.player.x, y !== undefined ? y : this.player.y - 26, label, color || (d >= 0 ? '#a7f070' : '#e04050'));
    this.moneyFlash = 0.5; this.moneyCol = d >= 0 ? '#a7f070' : '#e04050';
  }
  tickMsg(str, color = '#f4f4f4', dur = 4) { this.msg = { str, color, t: 0, dur }; }
  intro(key, str, codex) { if (this.seen[key]) return; this.seen[key] = true; this.tickMsg(str, '#ffcd75', 5.5); if (codex) unlockCodex(codex); }
  blockCheck(e, isSubpoena) {
    const p = this.player;
    for (const a of this.ents) {
      if (!(a instanceof Ally) || a.blockCd > 0) continue;
      if (a.kind === 'coop' && !isSubpoena) continue;
      if (a.kind !== 'coop' && !this.boss) continue;
      if (dist(e.x, e.y, p.x, p.y - 6) < 30) {
        e.dead = true; a.blockCd = a.kind === 'coop' ? 2.6 : 1.3;
        this.S.blocks++; if (this.S.blocks >= 15) unlockAch('objection');
        FX.float(e.x, e.y - 8, a.kind === 'coop' ? 'OBJECTION: OVERBROAD!' : 'OBJECTION!', '#73eff7'); Sound.sfx('objection'); FX.paper(e.x, e.y, 6);
        return true;
      }
    }
    return false;
  }
  depose() {
    const T = this.T, S = this.S, p = this.player;
    const paid = T.coop === 'paid';
    p.frozen = p.frozenMax = paid ? 1.3 : 2.4;
    S.depos++;
    Sound.sfx('freeze'); FX.shake(2, 0.2);
    if (paid) { const pay = T.coopRate * 8; S.deposPaid++; S.depoPay += pay; this.money(pay, `PAID $${T.coopRate}/HR +$${pay.toLocaleString('en-US')}`, '#a7f070'); }
    else { S.deposUnpaid++; S.depoLost += 800; this.money(-800, 'UNPAID DAY -$800', '#e04050'); this.hurtRaw(1); if (S.deposUnpaid >= 5) unlockAch('probono'); }
    this.intro('depo', paid ? `SUBPOENAS: §12 cooperation. You get $${T.coopRate}/hour and your own counsel.` : 'SUBPOENAS: §12 cooperation. Unpaid, no end date. Each one costs you a day.', 'subpoena');
  }
  burnout() {
    if (this.mode === 'burnout') return;
    const prev = this.mode; this.mode = 'burnout';
    Sound.sfx('lose');
    const body = h('div', { style: { width: '320px' } },
      h('div', { class: 'p2p16 red', style: { marginBottom: '8px' } }, 'BURNOUT'),
      h('p', { class: 'vt', style: { margin: '0 0 8px' } }, 'The years after you left are wearing you down. You take a week off to recover.'),
      h('div', { class: 'row' }, h('span', { class: 'p2p red' }, '-$3,000'), h('div', { class: 'spacer' }), UI.btn('CONTINUE', () => { m.close(); }, { cls: 'teal', id: 'btn-burn' })));
    const m = UI.modal(body, { dismiss: false, focusSel: '#btn-burn', onClose: () => {
      this.S.burnouts++; this.S.burnoutCost += 3000; this.money(-3000);
      this.peace = Math.min(this.maxPeace, 6); this.player.inv = 2;
      this.mode = prev === 'burnout' ? 'play' : prev;
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    } });
  }
  /* ---------- pickups & recruiting ---------- */
  collect(p) {
    const S = this.S, T = this.T;
    switch (p.kind) {
      case 'check': { const v = Math.round(p.value * this.payMult()); S.income += v; this.money(v, '+$' + v.toLocaleString('en-US')); Sound.sfx('coin'); FX.coins(p.x, p.y, 6); break; }
      case 'gig': S.income += p.value; this.money(p.value, 'GIG +$' + p.value); Sound.sfx('coin'); break;
      case 'orb': {
        S.skills++; this.AR.skill = Math.min(0.32, (this.AR.skill || 0) + 0.04);
        Sound.sfx('heal');
        if (T.conf === 'broad') { this.ents.push(new Letter(this, 'know')); FX.float(p.x, p.y - 16, '"CONFIDENTIAL INFORMATION"?', '#b57bd8'); this.intro('orbC', 'SKILL ORBS: your own know-how. But §6 defines "know-how" as theirs. Using it draws letters.', 'knowhow'); }
        else { FX.float(p.x, p.y - 16, 'YOUR SKILLS. +4% PAY', '#a7f070'); this.intro('orb', 'SKILL ORBS: your general skills and know-how. Yours to use. +4% pay each.', 'knowhow'); }
        if (S.skills >= 8 && S.cdKnow === 0) unlockAch('skills');
        break;
      }
      case 'coffee': this.peace = Math.min(this.maxPeace, this.peace + 2); FX.float(p.x, p.y - 14, '+PEACE', '#ffcd75'); Sound.sfx('heal'); break;
      case 'evidence': this.ents.push(new Shot(p.x, p.y, this.boss, 7, 'EXHIBIT A')); Sound.sfx('paper'); FX.float(p.x, p.y - 14, 'EVIDENCE', '#ffcd75'); break;
      case 'lodefile': {
        S.lodestar = true; S.lodestarCost += 30000;
        this.money(-30000, 'TRADE SECRET CLAIM -$30,000', '#e04050'); this.hurtRaw(3); FX.shake(5, 0.4); Sound.sfx('alarm');
        unlockAch('tradesecret'); unlockCodex('tradesecret');
        this.tickMsg('You took the Lodestar pricing model. That one really is a trade secret, and protecting it is fair.', '#ffcd75', 6);
        break;
      }
    }
  }
  payMult() { const cols = this.ents.filter((e) => e instanceof NPC && e.state === 'follow' && e.kind === 'colleague').length; return 1 + (this.AR.skill || 0) + cols * 0.08; }
  recruit(npc, via) {
    const S = this.S;
    if (this.nsRestricted(npc, via)) {
      npc.state = 'yank'; this.AR.yanked[npc.spec.id] = true;
      const L = new Letter(this, 'solicit'); this.ents.push(L);
      FX.float(npc.x, npc.y - 30, '§8 NON-SOLICIT', '#e04050'); Sound.sfx('error'); unlockCodex('nonsolicit');
      this.intro('ns', via ? 'Even a public job posting counts: §8 bars hiring any employee for 24 months.' : (this.T.ns === 'narrow' ? 'You worked with them, so actively recruiting them is barred for 12 months. A public job posting would be fine.' : 'Former colleagues and clients are off-limits for 24 months under §8.'), 'nonsolicit');
      return;
    }
    npc.state = 'follow'; npc.slot = this.ents.filter((e) => e instanceof NPC && e.state === 'follow').length;
    if (!this.AR.recruited.includes(npc.spec.id)) this.AR.recruited.push(npc.spec.id);
    S.recruits++;
    Sound.sfx('confirm'); FX.burst(npc.x, npc.y - 8, 12, ['#a7f070', '#f4f4f4'], { spd: 50 });
    FX.float(npc.x, npc.y - 30, npc.kind === 'client' ? 'NEW CLIENT!' : 'JOINED YOUR TEAM', '#a7f070');
  }
  /* ---------- per-frame wave logic ---------- */
  waveLogic(dt) {
    const S = this.S, T = this.T, W = this.W, tm = this.timers, sm = this.d.spawn, p = this.player;
    this.fenceCd = Math.max(0, this.fenceCd - dt);
    const live = (k) => this.ents.filter((e) => e instanceof Pickup && e.kind === k).length;
    const plazaPt = () => { for (let i = 0; i < 20; i++) { const x = rnd(30, 450), y = rnd(100, 200); if (OBST.every((o) => dist(x, y, o.x, o.y) > o.r + 10) && !(this.fenceOn && x > this.fenceRect.x - 10 && x < this.fenceRect.x + this.fenceRect.w + 10 && y < this.fenceRect.y + this.fenceRect.h + 10 && y > this.fenceRect.y - 10)) return [x, y]; } return [240, 190]; };
    const payVal = Math.round(this.salary / 26);
    // paychecks / restricted-period pay
    tm.pay -= dt;
    if (tm.pay <= 0) {
      tm.pay = 2.4;
      if (this.fenceOn) {
        S.ncBlocked += payVal * 0.4; S.ncMonths += 2.4 / (W.dur / 12);
        if (T.ncPay) { const v = Math.round(payVal * T.ncPay); S.garden += v; this.money(v, 'RESTRICTED-PERIOD PAY +$' + v.toLocaleString('en-US'), '#a7f070', 420, 30); }
      } else if (live('check') < 4) {
        const z = this.jobZ; this.ents.push(new Pickup('check', z.x + rnd(8, z.w - 8), z.y + rnd(6, z.h - 2), payVal, 7));
      }
    }
    // gigs
    tm.gig -= dt;
    if (tm.gig <= 0) { tm.gig = this.fenceOn ? 4.2 : 8.5; if (live('gig') < 3) { const [x, y] = plazaPt(); this.ents.push(new Pickup('gig', x, y, 700, 8)); } }
    // skill orbs
    tm.orb -= dt;
    if (tm.orb <= 0) { tm.orb = 6.5; if (live('orb') < 2) { const [x, y] = plazaPt(); this.ents.push(new Pickup('orb', x, y, 0, 12)); } }
    // coffee
    tm.coffee -= dt;
    if (tm.coffee <= 0) { tm.coffee = 15; if (live('coffee') < 1) { const [x, y] = plazaPt(); this.ents.push(new Pickup('coffee', x, y, 0, 12)); } }
    // subpoenas
    if (W.subEvery > 0) { tm.sub -= dt * sm; if (tm.sub <= 0) { tm.sub = W.subEvery * rnd(0.85, 1.15); this.ents.push(new Subpoena(this)); } }
    // home regen
    if (!(this.fenceOn && this.jobKey === 'home') && inZ(Z.home, p.x, p.y)) { tm.home += dt; if (tm.home > 3.5 && this.peace < this.maxPeace) { tm.home = 0; this.peace++; FX.float(p.x, p.y - 26, '+PEACE (HOME)', '#ffcd75'); } } else tm.home = 0;
    // clients you recruited pay you
    const clients = this.ents.filter((e) => e instanceof NPC && e.state === 'follow' && e.kind === 'client').length;
    if (clients) { tm.client -= dt; if (tm.client <= 0) { tm.client = 4.5; const v = this.C.exit === 'consult' ? 2200 : 1500; S.clientIncome += v; this.money(v, 'CLIENT WORK +$' + v.toLocaleString('en-US')); } }
    // side project income
    if (this.app && this.app.state === 'live' && !this.app.claimed) { tm.app -= dt; if (tm.app <= 0) { tm.app = 3; S.appIncome += 900; this.money(900, 'APP +$900', '#73eff7', LAPTOP.x, LAPTOP.y - 26); } }
    // job board
    if (!this.posted && dist(p.x, p.y, BOARD.x, BOARD.y) < 13) {
      tm.board += dt;
      if (tm.board > 1.1) {
        this.posted = true; Sound.sfx('paper');
        const takers = this.ents.filter((e) => e instanceof NPC && e.state === 'wander' && e.kind === 'colleague');
        takers.forEach((n) => { n.state = 'approach'; });
        this.tickMsg(T.ns === 'narrow' ? 'JOB POSTED PUBLICLY. General postings are outside your non-solicit.' : 'JOB POSTED PUBLICLY. Under a broad §8, even hiring through a posting can be a violation.', '#ffcd75', 5);
      }
    } else tm.board = 0;
    // first-wave tutorial
    if (this.wi === 0) {
      if (this.timer > 1 && !this.seen.tut1) { this.seen.tut1 = true; this.tickMsg(IS_TOUCH ? 'MOVE: LEFT STICK. DASH: DASH BUTTON. COLLECT PAYCHECKS AT YOUR NEW JOB.' : 'MOVE: WASD / ARROWS. DASH: SPACE. COLLECT PAYCHECKS AT YOUR NEW JOB.', '#f4f4f4', 6); }
      if (this.timer > 7 && !this.seen.tut3) { this.seen.tut3 = true; this.tickMsg('TOP BAR ICONS: YOUR TERMS. GREEN = A PROTECTION YOU NEGOTIATED. RED = EXPOSED.', '#f4f4f4', 6); }
      if (this.timer > 14 && !this.seen.tut2 && this.npcs.length) { this.seen.tut2 = true; this.tickMsg('FORMER COLLEAGUES WANDER THE PLAZA. TOUCH TO RECRUIT. CHECK THEIR TAGS FIRST.', '#f4f4f4', 6); }
      if (this.timer > 3 && this.fenceOn && !this.seen.fenceTip) { this.seen.fenceTip = true; this.intro('fence', 'Your non-compete fences off your new job. Find gigs in the plaza instead.', 'noncompete'); }
    }
    // claw / side project (year 2)
    if (W.claw && this.C.side !== 'none' && !this.app && this.timer > 10) {
      this.app = { state: 'ready', prog: 0 };
      this.tickMsg('BUDGETBUDDY v1.0 IS READY. GO TO YOUR LAPTOP (BOTTOM LEFT) TO LAUNCH IT.', '#73eff7', 6); Sound.sfx('phone');
    }
    if (this.app && this.app.state === 'ready') {
      if (dist(p.x, p.y, LAPTOP.x, LAPTOP.y) < 14) { this.app.prog += dt / 2; if (this.app.prog >= 1) { this.app.state = 'live'; this.app.launchT = this.timer; this.S.side = 'launched'; Sound.sfx('levelup'); FX.float(LAPTOP.x, LAPTOP.y - 26, 'LAUNCHED!', '#73eff7'); } }
      else this.app.prog = Math.max(0, this.app.prog - dt);
    }
    if (this.app && this.app.state === 'live' && W.claw && !this.app.clawed && this.timer - this.app.launchT > 4.5) {
      this.app.clawed = true;
      const prot = T.inv === 'carve' && this.C.side === 'own';
      this.ents.push(new Claw(this, prot));
      this.tickMsg('ALERT: HEREINAFTER CLAIMS BUDGETBUDDY UNDER §9 (INVENTIONS).', '#e04050', 4);
      unlockCodex('inventions');
    }
    // arbitration door
    if (W.arb && !this.arbStarted && this.timer > 4) { this.arbStarted = true; this.run(this.arbEvent); }
    if (this.arbDoor && !S.arb && inZ(Z.court, p.x, p.y, 2)) this.enterArb();
    // boss: trial clock, legal fees, evidence, hiring
    if (W.boss && this.boss && this.boss.state === 'fight') {
      this.trial -= dt;
      const rate = 900;
      if (this.companyDefends) { S.defenseCo += rate * dt; S.defenseTotal += rate * dt; }
      else if (S.hired) { S.defenseYou += rate * dt; S.defenseTotal += rate * dt; this.S.savings -= rate * dt; }
      tm.ev -= dt;
      if (tm.ev <= 0) { tm.ev = Math.max(3, 6 - this.C.paper * 1.2); if (live('evidence') < 2) { const [x, y] = plazaPt(); this.ents.push(new Pickup('evidence', x, y, 0, 9)); } }
      if (!this.companyDefends && !S.hired && inZ(Z.law, p.x, p.y, 2)) {
        this.hireT = (this.hireT || 0) + dt;
        if (this.hireT > 0.8) {
          S.hired = true; S.retainer = 10000; S.defenseYou += 10000; S.defenseTotal += 10000;
          this.money(-10000, 'RETAINER -$10,000', '#e04050'); this.addAlly('hired'); Sound.sfx('confirm');
          this.tickMsg('JO PARK IS ON YOUR CASE. $450/HOUR, BILLED TO YOU.', '#ffcd75', 4.5);
        }
      } else this.hireT = 0;
      if (this.trial <= 0) { this.boss.state = 'dead'; this.caseEnd('settled'); }
      if (S.defenseYou >= 50000) unlockAch('selffunded');
    }
    // ghost town
    if (W.lifetime) { const n = this.ents.filter((e) => e instanceof Phantom && e.delay <= 0 && e.poof <= 0).length; S.maxPhantoms = Math.max(S.maxPhantoms, n); if (n >= 12) unlockAch('ghosttown'); }
  }
  clawBlocked() {
    this.S.side = 'kept'; this.AR.app = 'kept';
    FX.float(LAPTOP.x, LAPTOP.y - 40, 'CARVE-OUT: OWN TIME · OWN GEAR · UNRELATED', '#3fbfa0');
    this.tickMsg('Your carve-out held. BUDGETBUDDY is still yours.', '#3fbfa0', 5);
    unlockAch('stillmine');
  }
  clawGrabbed() {
    this.app.claimed = true; this.app.state = 'gone'; this.S.side = 'lost'; this.S.sideLost = 40000; this.AR.app = 'lost';
    FX.float(LAPTOP.x, LAPTOP.y - 40, 'ASSIGNED TO HEREINAFTER (EST. $40,000)', '#e04050');
    const why = this.T.inv === 'carve' ? 'You built it on a Company laptop. The carve-out doesn\'t cover that.' : '§9 assigned "all inventions conceived during employment," even weekend ones.';
    this.tickMsg(why, '#e04050', 6);
  }
  /* ---------- events ---------- */
  async bossIntro() {
    this.mode = 'event';
    const T = this.T, name = RUN.name;
    Sound.sfx('boss'); FX.shake(5, 0.9);
    this.boss = new Boss(this); this.ents.push(this.boss);
    await this.wait(2400);
    await this.guard(UI.say({ who: 'PROCESS SERVER', pf: CAST.courier, text: `${name}? You've been served.`, voice: 480 }));
    await this.guard(UI.say({ who: 'THE COMPLAINT', text: `PALISADE SUPPLY CO. v. HEREINAFTER HOLDINGS, LLC and ${name}, individually. That vendor termination letter you signed at your old job is now a lawsuit.`, voice: 200 }));
    if (this.C.layoff === 'ran') await this.guard(UI.say({ who: 'THE COMPLAINT', text: `R. Dunn has filed a claim too, naming you personally over the layoff meeting.`, voice: 200 }));
    unlockCodex('thirdparty'); unlockCodex('individual');
    await this.guard(UI.say({ who: '', text: 'Palisade never signed your arbitration agreement, so its case is in open court.', voice: 300 }));
    if (T.survivalIndem && T.indem === 'defend') {
      await sayAs(this, 'vance', 'Section 10 survived, and we have a duty to defend you. Counsel is on the way. We\'ll handle the fees as they come in.', 'neutral');
      this.companyDefends = true; this.addAlly('defense'); Sound.sfx('levelup');
    } else if (T.survivalIndem) {
      await sayAs(this, 'vance', 'Section 10 survived. We\'ll reimburse reasonable losses once the case is finally resolved. Until then, you front your own defense.', 'neutral');
    } else {
      await sayAs(this, 'vance', 'Our position is that Section 10 ended when you left. We won\'t be defending you. Best of luck.', 'smug');
      await this.guard(UI.say({ who: '', text: 'Some states require employers to cover employees\' work-related legal costs no matter what the contract says. Here, that would be another fight. For now, you\'re paying.', voice: 300 }));
    }
    if (!this.companyDefends) { unlockCodex('dno', true); this.tickMsg('D&O INSURANCE can cover managers too. Whether it covers a former employee in your role depends on the policy. You never asked.', '#94b0c2', 6); }
    if (!this.companyDefends) await this.guard(UI.say({ who: '', text: 'Hire a lawyer at PARK LAW (bottom middle), or fight it yourself by grabbing EVIDENCE folders. If the trial clock runs out, the case settles.', voice: 300 }));
    else await this.guard(UI.say({ who: '', text: 'Your counsel fights the case. Grab EVIDENCE folders to help. If the trial clock runs out, the case settles.', voice: 300 }));
    this.boss.state = 'fight'; this.mode = 'play'; this.timer = 0;
  }
  caseEnd(result) {
    if (this.caseDone) return; this.caseDone = true;
    this.run(async function () {
      this.mode = 'event';
      const S = this.S, T = this.T;
      this.ents = this.ents.filter((e) => !(e instanceof EProj) && !(e instanceof Subpoena));
      this.banner = { str: result === 'dismissed' ? 'CASE DISMISSED' : 'SETTLED', t: 0, col: result === 'dismissed' ? '#3fbfa0' : '#ffcd75' };
      Sound.sfx('bigstamp'); FX.shake(5, 0.4);
      S.caseResult = result;
      if (result === 'dismissed') { unlockAch('dismissed'); Sound.sfx('win'); }
      await this.wait(1400);
      if (result === 'settled') {
        const amt = 45000 + (this.C.layoff === 'ran' ? 20000 : 0);
        S.settlement = amt;
        if (T.survivalIndem) { S.settlementBy = 'company'; await this.guard(UI.say({ who: '', text: `The case settles for ${money(amt)}. Section 10 survived, so Hereinafter pays it.`, voice: 300 })); }
        else { S.settlementBy = 'you'; this.money(-amt, 'SETTLEMENT -' + money(amt), '#e04050', 240, 120); await this.guard(UI.say({ who: '', text: `The case settles for ${money(amt)}. Hereinafter says it owes you nothing under Section 10. You pay it.`, voice: 300 })); }
      }
      if (this.companyDefends) await this.guard(UI.say({ who: '', text: `Defense costs: ${money(S.defenseCo)}. Paid by Hereinafter, as they came in. Cost to you: $0.`, voice: 300 }));
      else if (S.hired) {
        if (T.survivalIndem) {
          const r = Math.round(S.defenseYou * 0.8); S.reimbursed = r;
          await this.guard(UI.say({ who: '', text: `You fronted ${money(S.defenseYou)} in legal fees. Fourteen months after final resolution, Hereinafter reimburses the 80% it deems "reasonable": ${money(r)}.`, voice: 300 }));
          this.money(r, 'REIMBURSED +' + money(r), '#a7f070', 240, 120);
        } else await this.guard(UI.say({ who: '', text: `You paid ${money(S.defenseYou)} in legal fees. Hereinafter says Section 10 ended when you left, so none of it comes back.`, voice: 300 }));
      } else await this.guard(UI.say({ who: '', text: 'You represented yourself. No legal bills, but you were on your own.', voice: 300 }));
      this.banner = null;
      this.endWave();
    });
  }
  async arbEvent() {
    this.mode = 'event';
    const T = this.T;
    await this.guard(UI.say({ who: 'A LETTER FROM HEREINAFTER', text: 'Hereinafter declines to pay your final-year bonus of $12,000.', voice: 300 }));
    await this.guard(UI.say({ who: '', text: T.arb === 'mutual' ? 'Section 11: binding arbitration. Mutual terms, and Hereinafter pays the forum costs.' : 'Section 11: binding arbitration. As written, you split the arbitrator\'s fees and Hereinafter keeps its own door to court. The split may not hold up, but fighting it costs time and money.', voice: 300 }));
    unlockCodex('arbitration');
    this.arbDoor = true; this.tickMsg('OPTIONAL: WALK INTO THE COURTHOUSE TO PRESS YOUR CLAIM.', '#73eff7', 6);
    this.mode = 'play';
  }
  enterArb() {
    if (this.mode !== 'play') return;
    this.mode = 'arb'; this.S.arb = 'started';
    this.saved = { x: this.player.x, y: this.player.y };
    this.player.x = 240; this.player.y = 226; this.player.dir = 'up';
    this.ents = this.ents.filter((e) => !(e instanceof EProj) && !(e instanceof Subpoena) && !(e instanceof Letter));
    this.arbState = { t: 0, dur: 32, got: 0, need: 6, ev: null, throwCd: 1.6, fees: 0, done: false, projs: [] };
    Sound.play('arb'); Sound.sfx('door');
    this.run(async function () {
      const st = this.arbState;
      st.paused = true;
      await sayAs(this, 'arb', `We're on the record. ${RUN.name} claims a $12,000 bonus. Bring me evidence.`, 'neutral');
      if (this.T.arb === 'mutual') await sayAs(this, 'arb', 'Per the agreement, Respondent pays my fees.', 'smile');
      else await sayAs(this, 'arb', 'The agreement says the parties split my fees, $400 an hour. Whether that holds up is a fight for another day. The meter is running.', 'smug');
      st.paused = false;
    });
  }
  updateArb(dt) {
    const st = this.arbState, p = this.player;
    if (st.paused || st.done) { p.update(dt, this, false); return; }
    st.t += dt;
    p.update(dt, this, true);
    if (this.T.arb !== 'mutual') { const fee = 220 * dt; st.fees += fee; this.S.arbFees += fee; this.S.savings -= fee; }
    if (!st.ev) st.ev = { x: rnd(70, 410), y: rnd(120, 220), t: 0 };
    st.ev.t += dt;
    if (dist(p.x, p.y - 4, st.ev.x, st.ev.y) < 12) { st.got++; st.ev = null; Sound.sfx('coin'); FX.float(p.x, p.y - 26, `EVIDENCE ${st.got}/${st.need}`, '#ffcd75'); }
    st.throwCd -= dt;
    if (st.throwCd <= 0) {
      st.throwCd = this.T.arb === 'mutual' ? 1.7 : 1.05;
      const a = angTo(110, 86, p.x, p.y - 6);
      this.ents.push(new EProj(110, 86, a + rnd(-0.15, 0.15), 95 * this.d.spd, 'invoice', { dmg: 1, life: 4 }));
    }
    for (const e of this.ents) if (e instanceof EProj) e.update(dt, this);
    this.ents = this.ents.filter((e) => !e.dead);
    if (st.got >= st.need) this.exitArb(true);
    else if (st.t >= st.dur) this.exitArb(false);
  }
  exitArb(won) {
    const st = this.arbState; st.done = true;
    this.run(async function () {
      this.ents = this.ents.filter((e) => !(e instanceof EProj));
      if (won) {
        Sound.sfx('win'); await sayAs(this, 'arb', 'Award for Claimant: $12,000.', 'smile');
        this.S.arb = 'won'; this.S.arbAward = 12000; this.money(12000, 'AWARD +$12,000', '#a7f070'); unlockAch('awarded');
      } else {
        Sound.sfx('lose'); await sayAs(this, 'arb', 'Claimant hasn\'t carried the burden. No award.', 'frown');
        this.S.arb = 'lost';
      }
      if (this.T.arb !== 'mutual') await this.guard(UI.say({ who: '', text: `Your half of the arbitrator's fees: ${money(st.fees)}.`, voice: 300 }));
      unlockCodex('efaa');
      this.player.x = this.saved.x; this.player.y = Math.min(200, this.saved.y - 10); this.player.inv = 1.5;
      this.mode = 'play'; Sound.play('arena');
    });
  }
  /* ---------- wave end ---------- */
  endWave() {
    if (this.mode === 'outro' || this.mode === 'summary') return;
    this.mode = 'outro'; this.modeT = 0;
    this.ents = this.ents.filter((e) => !(e instanceof EProj) && !(e instanceof Subpoena) && !(e instanceof Letter));
    if (this.W.claw && this.app && this.app.state === 'ready') { this.S.side = 'unlaunched'; }
    if (this.W.claw && !this.app && this.C.side !== 'none') this.S.side = 'unlaunched';
    if (this.W.arb && this.arbDoor && !this.S.arb) this.S.arb = 'abandoned';
    Sound.sfx('levelup');
  }
  lessons() {
    const S = this.S, s0 = this.snap, T = this.T, out = [];
    const d = (k) => S[k] - (s0[k] || 0);
    switch (this.W.key) {
      case 'y1':
        if (this.fenceOn) out.push(T.ncPay ? `Your non-compete fenced off your new job, but Hereinafter paid ${Math.round(T.ncPay * 100)}% of your salary while it did.` : 'Your non-compete fenced off your new job all year. Unpaid.');
        else if (this.C.exit === 'other') out.push('Meridian isn\'t a competitor, so the non-compete never touched you.');
        else out.push('Your narrowed non-compete didn\'t cover this job. You went straight to work.');
        out.push(T.conf === 'broad' ? 'Under §6, "know-how" belonged to Hereinafter. Using your own skills drew letters.' : 'Your general skills and know-how were yours to use.');
        if (d('cdSolicit')) out.push('Recruiting former colleagues or clients triggered §8.');
        break;
      case 'y2':
        out.push(T.coop === 'paid' ? `${d('depos')} depositions, paid at $${T.coopRate}/hour, with your own counsel.` : `${d('depos')} depositions. Unpaid, with no end date.`);
        if (this.C.side !== 'none') out.push({ kept: 'Your carve-out kept BUDGETBUDDY yours.', lost: 'BUDGETBUDDY was assigned to Hereinafter under §9.', unlaunched: 'You never launched BUDGETBUDDY.', launched: 'BUDGETBUDDY launched.' }[S.side] || '');
        break;
      case 'y3':
        out.push(S.caseResult === 'dismissed' ? 'The case was dismissed.' : `The case settled for ${money(S.settlement)}, paid by ${S.settlementBy === 'you' ? 'you' : S.settlementBy === 'insurer' ? 'the D&O insurer' : 'Hereinafter'}.`);
        out.push(this.companyDefends ? 'Hereinafter defended you and paid the fees as they came in.' : S.hired ? `You fronted ${money(S.defenseYou)} in legal fees.` : 'You defended yourself.');
        break;
      case 'y4':
        out.push({ won: 'You won your bonus in arbitration.', lost: 'You lost in arbitration.', abandoned: 'You never pressed your bonus claim.' }[S.arb] || 'You never pressed your bonus claim.');
        if (T.arb !== 'mutual' && S.arbFees > 0) out.push(`Splitting the arbitrator's fees cost you ${money(S.arbFees)}.`);
        break;
      case 'y7':
        out.push(T.conf === 'broad' ? 'As written, confidentiality "at all times thereafter" never expires. The phantoms are still here.' : 'Only the genuine trade secret is still protected. The rest of your career is yours.');
        out.push(T.coop === 'paid' ? 'Cooperation still has no end date, but you get paid for it.' : 'Cooperation has no end date. The subpoenas keep coming.');
        break;
    }
    return out.filter(Boolean);
  }
  showSummary() {
    this.mode = 'summary';
    const S = this.S, s0 = this.snap, d = (k) => S[k] - (s0[k] || 0);
    const earned = d('income') + d('garden') + d('appIncome') + d('clientIncome') + d('arbAward') + d('reimbursed');
    const net = S.savings - s0.savings;
    const rowsEl = h('table', { class: 'ledger' },
      h('tr', null, h('td', null, 'Earned'), h('td', { class: 'num teal' }, money(earned))),
      h('tr', null, h('td', null, 'Cease-and-desist letters'), h('td', { class: 'num' }, String(d('cds')))),
      h('tr', null, h('td', null, 'Depositions'), h('td', { class: 'num' }, String(d('depos')))),
      h('tr', null, h('td', null, 'Net change in savings'), h('td', { class: 'num ' + (net >= 0 ? 'teal' : 'red') }, (net >= 0 ? '+' : '') + money(net))),
      h('tr', null, h('td', null, 'Savings'), h('td', { class: 'num gold' }, money(S.savings))));
    const last = this.wi + 1 >= WAVES.length;
    const body = h('div', { style: { width: '360px' } },
      h('div', { class: 'p2p gold' }, `${this.W.title} COMPLETE`), h('div', { class: 'silk dim', style: { margin: '2px 0 8px' } }, this.W.sub),
      rowsEl,
      h('div', { style: { marginTop: '8px' } }, this.lessons().map((l) => h('p', { class: 'vt', style: { margin: '0 0 4px' } }, '- ' + l))),
      h('div', { class: 'row', style: { marginTop: '8px' } }, h('div', { class: 'spacer' }), UI.btn(last ? 'SEE YOUR VERDICT &gt;' : 'NEXT YEAR &gt;', () => { m.close(); this.next(); }, { cls: 'teal', id: 'btn-next' })));
    const m = UI.modal(body, { dismiss: false, focusSel: '#btn-next' });
    S.waveLog.push({ wave: this.W.key, net, earned });
  }
  next() {
    this.AR.peace = Math.min(this.maxPeace, this.peace + 4);
    if (this.wi + 1 < WAVES.length) { checkpoint('arena', { wave: this.wi + 1 }); Game.go(() => new ArenaScene(this.wi + 1)); }
    else { checkpoint('ending'); Game.go(() => new EndingScene()); }
  }
  togglePause() {
    if (this.paused) return;
    if (!['play', 'intro', 'arb'].includes(this.mode)) return;
    this.paused = true;
    openPauseMenu(() => { this.paused = false; if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
  }
  /* ---------- update & draw ---------- */
  update(dt) {
    super.update(dt);
    if (this.paused) return;
    if (Input.pressed('back')) { this.togglePause(); return; }
    this.modeT += dt;
    if (this.msg) { this.msg.t += dt; if (this.msg.t > this.msg.dur) this.msg = null; }
    if (this.moneyFlash > 0) this.moneyFlash -= dt;
    if (this.banner) this.banner.t += dt;
    switch (this.mode) {
      case 'intro':
        this.updateWorld(dt, false);
        if (this.modeT > 2.6) { this.modeT = 0; if (this.W.boss) { this.run(this.bossIntro); } else this.mode = 'play'; }
        break;
      case 'play':
        this.timer += dt; this.updateWorld(dt, true); this.waveLogic(dt);
        if (!this.W.boss && this.timer >= this.W.dur * this.durScale && this.mode === 'play') this.endWave();
        break;
      case 'arb': this.updateArb(dt); break;
      case 'event': case 'outro': this.updateWorld(dt, false); if (this.mode === 'outro' && this.modeT > 1.6) this.showSummary(); break;
      default: break;
    }
  }
  updateWorld(dt, control) {
    this.player.update(dt, this, control);
    for (const e of this.ents) e.update(dt, this);
    this.ents = this.ents.filter((e) => !e.dead);
  }
  draw() {
    if (this.mode === 'arb') return this.drawArb();
    g.save(); g.translate(FX.ox, FX.oy);
    this.drawMap();
    const all = this.ents.filter((e) => !(e instanceof Phantom) && !(e instanceof Lodestar) && !(e instanceof Letter) && !(e instanceof Subpoena) && !(e instanceof EProj) && !(e instanceof Shot) && !(e instanceof Claw));
    all.push(this.player);
    all.sort((a, b) => a.y - b.y);
    for (const e of all) e.draw(this);
    for (const e of this.ents) if (e instanceof Phantom || e instanceof Lodestar) e.draw(this);
    for (const e of this.ents) if (e instanceof Letter || e instanceof Subpoena || e instanceof EProj || e instanceof Shot || e instanceof Claw) e.draw(this);
    FX.drawParts();
    if (this.W.lifetime && this.T.conf === 'broad') this.drawDark();
    FX.drawFloats();
    g.restore();
    this.drawHud();
    if (this.mode === 'intro') this.drawBanner();
    if (this.banner) this.drawStampBanner();
    FX.drawFlash();
  }
  drawDark() {
    if (!this.darkC) {
      const [c, x] = makeCanvas(VW * 2, VH * 2);
      const gr = x.createRadialGradient(VW, VH, 30, VW, VH, 190);
      gr.addColorStop(0, 'rgba(14,12,23,0)'); gr.addColorStop(1, 'rgba(14,12,23,0.72)');
      x.fillStyle = gr; x.fillRect(0, 0, VW * 2, VH * 2); this.darkC = c;
    }
    g.drawImage(this.darkC, Math.round(this.player.x - VW), Math.round(this.player.y - VH));
  }
  drawHud() {
    g.globalAlpha = 0.86; rect(0, 0, VW, 18, '#0e0c17'); g.globalAlpha = 1; rect(0, 18, VW, 1, '#333c57');
    const W = this.W;
    text(`${W.title} · ${W.sub}`, 5, 3, '#ffcd75');
    if (W.boss) {
      const tt = Math.max(0, Math.ceil(this.trial));
      text(this.boss && this.boss.state === 'fight' ? `TRIAL IN ${tt}s` : 'IN COURT', 5, 11, '#e04050');
    } else {
      const k = clamp(this.timer / (W.dur * this.durScale), 0, 1);
      rect(5, 12, 100, 3, '#333c57'); rect(5, 12, 100 * k, 3, '#ffcd75');
      text(W.months, 110, 11, '#94b0c2');
    }
    // hearts
    const hx = 180 - Math.max(0, this.maxPeace / 2 - 7) * 8;
    for (let i = 0; i < this.maxPeace / 2; i++) {
      const v = this.peace - i * 2;
      spr(v >= 2 ? S.heart : v === 1 ? S.heartH : S.heartE, hx + i * 8, 5);
    }
    // savings
    const sc = this.moneyFlash > 0 ? this.moneyCol : (this.S.savings < 0 ? '#e04050' : '#f4f4f4');
    text(money(this.S.savings), 475, 5, sc, { font: 'p2p', align: 'right' });
    text('SAVINGS', 475 - textW(money(this.S.savings), 'p2p') - 4, 6, '#94b0c2', { align: 'right' });
    // protections, inside the top bar
    const T = this.T, prot = [
      ['shield', T.survivalIndem && T.indem === 'defend', T.survivalIndem],
      ['subpoena', T.coop === 'paid'], ['lock', T.conf === 'narrow'], ['fence', T.nc === 'narrow' || T.ncPay > 0], ['hand', T.ns === 'narrow'], ['bulb', T.inv === 'carve'], ['gavel', T.arb === 'mutual'],
    ];
    let px0 = 244;
    for (const [ic, ok, mid] of prot) {
      spr(ICONS[ic], px0, 3);
      rect(px0, 14, 10, 2, ok ? '#3fbfa0' : mid ? '#ffcd75' : '#e04050');
      px0 += 13;
    }
    // boss info strip
    if (W.boss && this.boss && this.boss.state === 'fight') {
      g.globalAlpha = 0.8; rect(0, 19, VW, 20, '#0e0c17'); g.globalAlpha = 1;
      const b = this.boss, bw = 200, bx = (VW - bw) / 2;
      text('CASE STRENGTH', bx - 6, 22, '#efe3c4', { align: 'right' });
      rect(bx - 1, 22, bw + 2, 7, '#0e0c17'); rect(bx, 23, bw * (b.hp / b.max), 5, '#d0344a'); rectO(bx - 1, 22, bw + 2, 7, '#566c86');
      const who = this.companyDefends ? 'HEREINAFTER' : this.S.hired ? 'YOU' : 'NOBODY (PRO SE)';
      const amt = this.companyDefends ? this.S.defenseCo : this.S.defenseYou;
      text(`LEGAL FEES ${money(amt)} · PAID BY ${who}`, VW / 2, 31, this.companyDefends ? '#3fbfa0' : this.S.hired ? '#e04050' : '#94b0c2', { align: 'center' });
    }
    // ticker
    if (this.msg) {
      const lines = wrapText(this.msg.str, 440);
      const hh = lines.length * 8 + 4;
      g.globalAlpha = 0.85; rect(0, VH - hh - 2, VW, hh + 2, '#0e0c17'); g.globalAlpha = 1;
      lines.forEach((l, i) => text(l, VW / 2, VH - hh + i * 8, this.msg.color, { align: 'center' }));
    }
  }
  drawBanner() {
    const k = this.modeT, a = k < 0.3 ? k / 0.3 : k > 2.2 ? Math.max(0, (2.6 - k) / 0.4) : 1;
    g.globalAlpha = a * 0.8; rect(0, 96, VW, 76, '#0e0c17'); g.globalAlpha = a;
    const sl = (1 - Ease.outCubic(clamp(k / 0.5, 0, 1))) * 60;
    text(this.W.title, VW / 2 - sl, 104, '#ffcd75', { font: 'p2p', scale: 2, align: 'center', outline: '#0e0c17' });
    text(this.W.sub, VW / 2 + sl, 128, '#efe3c4', { font: 'p2p', align: 'center' });
    text(this.W.months + ' AFTER YOU LEFT', VW / 2, 142, '#94b0c2', { align: 'center' });
    text(this.W.lead, VW / 2, 156, '#f4f4f4', { align: 'center' });
    g.globalAlpha = 1;
  }
  drawStampBanner() {
    const b = this.banner, k = clamp(b.t / 0.25, 0, 1), sc = lerp(2.5, 1, Ease.outBack(k));
    g.save(); g.translate(VW / 2, 110); g.rotate(-0.12); g.scale(sc, sc);
    const w = textW(b.str, 'p2p') * 2 + 20;
    g.globalAlpha = 0.85; rect(-w / 2, -16, w, 30, '#0e0c17'); g.globalAlpha = 1;
    rectO(-w / 2, -16, w, 30, b.col); rectO(-w / 2 + 2, -14, w - 4, 26, b.col);
    text(b.str, 0, -8, b.col, { font: 'p2p', scale: 2, align: 'center' });
    g.restore();
  }
  drawArb() {
    const st = this.arbState, t = this.t;
    g.save(); g.translate(FX.ox, FX.oy);
    rect(0, 0, VW, VH, '#3a2a22');
    for (let x = 0; x < VW; x += 20) rect(x, 0, 1, 90, '#2f2119');
    rect(0, 88, VW, 182, '#4a3a30'); for (let y = 96; y < VH; y += 12) for (let x = (y / 12) % 2 ? 0 : 12; x < VW; x += 24) rect(x, y, 12, 1, '#55443a');
    // arbitrator's bench
    rect(170, 40, 140, 44, '#5b3a29'); rect(170, 40, 140, 3, '#8a5a3c'); rectO(170, 40, 140, 44, '#2b2118');
    spr(chibi(CAST.arb, 'down', 0), 231, 22);
    spr(S.gavel, 280, 30);
    text('ARBITRATION', 240, 66, '#efe3c4', { font: 'p2p', align: 'center' });
    text('PRIVATE PROCEEDING · NO JURY · NO PUBLIC RECORD', 240, 76, '#c9b48a', { align: 'center' });
    rect(210, 100, 60, 170, '#5a2a2a'); for (let y = 100; y < VH; y += 6) rect(212, y, 56, 1, '#6a3434');
    for (let i = 0; i < 4; i++) { rect(330 + i * 26, 130, 16, 12, '#2f2119'); rect(330 + i * 26, 142, 16, 3, '#2a1d15'); }
    text('EMPTY GALLERY', 369, 120, '#55443a', { align: 'center' });
    // company counsel desk
    rect(70, 70, 80, 22, '#5b3a29'); rectO(70, 70, 80, 22, '#2b2118');
    spr(chibi(CAST.vance, 'down', Math.floor(t * 4) % 2), 101, 52);
    text('HEREINAFTER', 110, 94, '#ffcd75', { align: 'center', outline: '#0e0c17' });
    // your desk
    rect(200, 244, 80, 14, '#5b3a29'); text('CLAIMANT', 240, 248, '#ffcd75', { align: 'center' });
    if (st.ev) spr(S.folder, st.ev.x - 5, st.ev.y - 9 + Math.sin(t * 4) * 1.5);
    for (const e of this.ents) if (e instanceof EProj) e.draw(this);
    this.player.draw(this);
    FX.drawParts(); FX.drawFloats();
    g.restore();
    // arb HUD
    g.globalAlpha = 0.86; rect(0, 0, VW, 18, '#0e0c17'); g.globalAlpha = 1;
    text(`EVIDENCE ${st.got}/${st.need}`, 5, 3, '#ffcd75');
    text(`TIME ${Math.max(0, Math.ceil(st.dur - st.t))}s`, 5, 11, '#94b0c2');
    const fees = this.T.arb === 'mutual' ? 'FORUM COSTS: PAID BY HEREINAFTER' : `YOUR HALF OF THE FEES: ${money(st.fees)}`;
    text(fees, 240, 6, this.T.arb === 'mutual' ? '#3fbfa0' : '#e04050', { align: 'center' });
    const hx = 380;
    for (let i = 0; i < this.maxPeace / 2; i++) { const v = this.peace - i * 2; spr(v >= 2 ? S.heart : v === 1 ? S.heartH : S.heartE, hx + i * 8 - Math.max(0, this.maxPeace / 2 - 12) * 8, 5); }
    FX.drawFlash();
  }
}
