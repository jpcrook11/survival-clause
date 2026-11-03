/* =========================================================
   SPRITES — portrait generator, chibi generator, hand-drawn
   enemies/pickups/icons
   ========================================================= */
function shade(hex, amt) {
  const [r, g2, b] = hexRGB(col(hex));
  const f = (v) => clamp(Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt), 0, 255);
  return '#' + [f(r), f(g2), f(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
}
const SKINS = [
  { s: '#f3cfa8', S: '#d19a72', m: '#8e3b3b' },
  { s: '#e3aa7c', S: '#b77c53', m: '#7e3030' },
  { s: '#b47a52', S: '#8a5636', m: '#5a2222' },
  { s: '#7c5034', S: '#5a3822', m: '#3e1616' },
];
const K = '#0e0c17';

/* ---------- 32x32 portrait generator ---------- */
function drawPortrait(c, ox, oy, P, expr = 'neutral', talking = false, blink = false) {
  const f = (x, y, w, h, color) => { c.fillStyle = color; c.fillRect(ox + x, oy + y, w, h); };
  const sk = SKINS[P.skin || 0];
  const hc = P.hairC || '#3a2418', hd = shade(hc, -0.35), hh = shade(hc, 0.25);
  const bg = P.bg || '#29366f';
  // background with a soft window glow
  if (!P.noBg) {
    f(0, 0, 32, 32, bg); f(0, 0, 32, 3, shade(bg, 0.12)); f(0, 22, 32, 10, shade(bg, -0.18));
    for (let i = 0; i < 32; i += 4) f(i, 3, 1, 1, shade(bg, 0.25));
  }
  const hair = P.hair || 'short';
  // hair that sits behind the head
  if (hair === 'long' || hair === 'bob') { f(6, 6, 20, hair === 'long' ? 22 : 16, K); f(7, 7, 18, hair === 'long' ? 20 : 14, hd); }
  if (hair === 'pony') { f(22, 9, 5, 12, K); f(23, 10, 3, 10, hd); }
  if (hair === 'hijab') { f(5, 3, 22, 26, K); f(6, 4, 20, 24, hc); f(6, 4, 20, 2, hh); }
  // shoulders / clothing
  const top = P.top || '#29366f', td = shade(top, -0.3), shirt = P.shirt || '#f4f4f4';
  f(7, 24, 18, 1, K); f(5, 25, 22, 1, K); f(3, 26, 26, 6, K);
  f(8, 25, 16, 1, top); f(6, 26, 20, 1, top); f(4, 27, 24, 5, top);
  const kind = P.kind || 'suit';
  if (kind === 'suit' || kind === 'blazer') {
    f(13, 24, 6, 2, shirt); f(14, 26, 4, 1, shirt); f(15, 27, 2, 1, shirt);
    f(12, 25, 1, 4, td); f(19, 25, 1, 4, td); f(13, 29, 1, 2, td); f(18, 29, 1, 2, td);
    if (P.tie) { f(15, 25, 2, 1, shade(P.tie, -0.25)); f(15, 26, 2, 6, P.tie); f(15, 30, 2, 2, shade(P.tie, -0.2)); }
  } else if (kind === 'sweater') {
    f(12, 24, 8, 2, td); f(13, 24, 6, 1, shirt);
    for (let i = 6; i < 26; i += 3) f(i, 29, 1, 1, shade(top, 0.15));
  } else if (kind === 'robe') {
    f(12, 24, 8, 3, '#f4f4f4'); f(14, 27, 4, 1, '#f4f4f4'); f(15, 24, 2, 8, shade(top, 0.12));
  } else if (kind === 'tee') {
    f(12, 24, 8, 1, td);
  }
  // neck
  f(13, 20, 6, 5, sk.s); f(13, 20, 6, 2, sk.S); f(12, 22, 1, 3, K); f(19, 22, 1, 3, K);
  if (hair === 'hijab') { f(9, 20, 14, 6, hc); f(9, 25, 14, 1, hd); }
  // head
  const rows = [[6, 11, 10], [7, 10, 12], [8, 9, 14], [9, 9, 14], [10, 9, 14], [11, 9, 14], [12, 9, 14], [13, 9, 14], [14, 9, 14], [15, 9, 14], [16, 9, 14], [17, 9, 14], [18, 10, 12], [19, 11, 10], [20, 12, 8], [21, 13, 6]];
  for (const [y, x, w] of rows) f(x - 1, y, w + 2, 1, K);
  f(11, 5, 10, 1, K); f(13, 22, 6, 1, K);
  for (const [y, x, w] of rows) f(x, y, w, 1, sk.s);
  for (const [y, x, w] of rows) if (y > 7) f(x + w - 2, y, 2, 1, sk.S);
  f(12, 20, 8, 1, sk.S); f(13, 21, 6, 1, sk.S);
  // ears
  f(7, 12, 2, 4, K); f(8, 13, 1, 2, sk.S); f(23, 12, 2, 4, K); f(23, 13, 1, 2, sk.S);
  if (P.earring) { f(8, 16, 1, 1, '#e8b44a'); f(23, 16, 1, 1, '#e8b44a'); }
  // eyes
  const look = P.look || 0;
  if (blink) { f(11, 14, 3, 1, K); f(18, 14, 3, 1, K); }
  else {
    f(11, 13, 3, 2, '#f4f4f4'); f(18, 13, 3, 2, '#f4f4f4');
    f(12 + look, 13, 1, 2, K); f(19 + look, 13, 1, 2, K);
    if (expr === 'shock') { f(11, 12, 3, 1, '#f4f4f4'); f(18, 12, 3, 1, '#f4f4f4'); }
  }
  // brows
  const bc = hair === 'bald' ? shade(sk.S, -0.3) : (hair === 'hijab' ? (P.browC || '#2a1a12') : hd);
  if (expr === 'angry' || expr === 'frown') { f(10, 10, 1, 1, bc); f(11, 11, 3, 1, bc); f(18, 11, 3, 1, bc); f(21, 10, 1, 1, bc); }
  else if (expr === 'worried') { f(11, 11, 2, 1, bc); f(13, 10, 1, 1, bc); f(18, 10, 1, 1, bc); f(19, 11, 2, 1, bc); }
  else if (expr === 'shock') { f(11, 9, 3, 1, bc); f(18, 9, 3, 1, bc); }
  else if (expr === 'smug') { f(11, 10, 3, 1, bc); f(18, 11, 3, 1, bc); }
  else { f(11, 11, 3, 1, bc); f(18, 11, 3, 1, bc); }
  // nose
  f(16, 15, 1, 2, sk.S); f(15, 17, 2, 1, sk.S);
  // beard (under mouth)
  if (P.beard) { const bh = P.beardC || hc; f(9, 16, 2, 4, bh); f(21, 16, 2, 4, bh); f(10, 19, 12, 2, bh); f(12, 21, 8, 1, bh); f(13, 18, 6, 1, bh); }
  // mouth
  const mc = sk.m;
  const open = talking || expr === 'shock';
  if (open) {
    if (expr === 'smile' || expr === 'happy') { f(14, 18, 5, 1, mc); f(15, 19, 3, 1, mc); f(15, 18, 3, 1, '#f4f4f4'); }
    else { f(15, 18, 3, 2, mc); f(15, 18, 3, 1, shade(mc, -0.4)); }
  } else if (expr === 'smile') { f(14, 18, 1, 1, mc); f(18, 18, 1, 1, mc); f(15, 19, 3, 1, mc); }
  else if (expr === 'happy') { f(14, 18, 5, 1, mc); f(15, 19, 3, 1, mc); f(15, 18, 3, 1, '#f4f4f4'); }
  else if (expr === 'frown' || expr === 'angry') { f(15, 18, 3, 1, mc); f(14, 19, 1, 1, mc); f(18, 19, 1, 1, mc); }
  else if (expr === 'smug') { f(15, 19, 3, 1, mc); f(18, 18, 1, 1, mc); }
  else if (expr === 'worried') { f(15, 19, 3, 1, mc); f(14, 18, 1, 1, shade(sk.S, -0.1)); }
  else f(15, 19, 3, 1, mc);
  if (expr === 'smile' || expr === 'happy') { f(10, 17, 1, 1, shade(sk.s, -0.12)); f(21, 17, 1, 1, shade(sk.s, -0.12)); }
  // front hair
  const H = (x, y, w, h2) => f(x, y, w, h2, hc);
  if (hair === 'short' || hair === 'side' || hair === 'long' || hair === 'bob' || hair === 'pony' || hair === 'bun') {
    f(10, 3, 12, 1, K); f(9, 4, 14, 1, K); f(8, 5, 16, 3, K);
    H(10, 4, 12, 1); H(9, 5, 14, 3); H(9, 8, 4, 1); H(16, 8, 7, 1); H(9, 9, 2, 1); H(21, 9, 2, 1);
    H(9, 10, 1, 3); H(22, 10, 1, 3);
    f(11, 5, 5, 1, hh); f(10, 6, 2, 1, hh);
    if (hair === 'side') { H(13, 8, 3, 1); H(9, 9, 8, 1); f(9, 9, 8, 1, hc); f(12, 7, 6, 1, hh); }
    if (hair === 'long' || hair === 'bob') { H(8, 9, 2, 10); H(22, 9, 2, 10); f(8, 19, 2, 1, hd); f(22, 19, 2, 1, hd); }
    if (hair === 'bun') { f(12, 0, 8, 4, K); H(13, 0, 6, 4); f(14, 1, 2, 1, hh); }
  } else if (hair === 'curly') {
    f(10, 1, 12, 1, K); f(8, 2, 16, 1, K); f(7, 3, 18, 6, K);
    H(10, 1, 3, 1); H(14, 1, 4, 1); H(19, 1, 3, 1);
    H(8, 2, 16, 1); H(7, 3, 18, 5); H(7, 8, 3, 1); H(12, 8, 3, 1); H(17, 8, 3, 1); H(22, 8, 3, 1);
    H(7, 9, 2, 6); H(23, 9, 2, 6);
    for (const [x, y] of [[9, 3], [13, 4], [17, 3], [21, 5], [10, 6], [15, 6], [19, 7], [8, 9], [23, 11]]) f(x, y, 1, 1, hh);
    for (const [x, y] of [[11, 4], [16, 5], [20, 3], [12, 7], [22, 7]]) f(x, y, 1, 1, hd);
  } else if (hair === 'bald') {
    f(13, 7, 3, 1, shade(sk.s, 0.3)); f(12, 8, 1, 1, shade(sk.s, 0.3));
    H(9, 11, 1, 4); H(22, 11, 1, 4); f(9, 10, 2, 1, hc); f(21, 10, 2, 1, hc);
  } else if (hair === 'buzz') {
    f(10, 4, 12, 1, K); f(9, 5, 14, 1, K);
    H(10, 5, 12, 1); H(9, 6, 14, 2); H(9, 8, 1, 4); H(22, 8, 1, 4);
    for (let i = 10; i < 22; i += 2) f(i, 6, 1, 1, hh);
  } else if (hair === 'hijab') {
    f(8, 5, 16, 3, hc); f(8, 8, 2, 13, hc); f(22, 8, 2, 13, hc); f(9, 8, 14, 1, hc);
    f(10, 5, 10, 1, hh); f(8, 8, 1, 12, hd); f(23, 8, 1, 12, hd);
  }
  if (P.gray) { for (const [x, y] of [[12, 5], [17, 6], [20, 5]]) f(x, y, 1, 1, '#d8d8d8'); }
  // glasses
  if (P.glasses) {
    const gc = P.glasses === true ? K : P.glasses;
    f(10, 12, 5, 1, gc); f(10, 15, 5, 1, gc); f(10, 12, 1, 4, gc); f(14, 12, 1, 4, gc);
    f(17, 12, 5, 1, gc); f(17, 15, 5, 1, gc); f(17, 12, 1, 4, gc); f(21, 12, 1, 4, gc);
    f(15, 13, 2, 1, gc);
  }
}

/* ---------- 16x18 chibi generator (arena characters) ---------- */
const _chibiCache = new Map();
function chibi(P, dir = 'down', frame = 0) {
  const key = (P.id || JSON.stringify(P)) + dir + (frame % 4);
  if (_chibiCache.has(key)) return _chibiCache.get(key);
  const [c, x] = makeCanvas(18, 20);
  const f = (X, Y, W, H, color) => { x.fillStyle = color; x.fillRect(X + 1, Y + 1, W, H); };
  const sk = SKINS[P.skin || 0];
  const hc = P.hairC || '#3a2418', hd = shade(hc, -0.3), hh = shade(hc, 0.25);
  const top = P.top || '#29366f', td = shade(top, -0.3), pants = P.pants || '#333c57', shoe = '#1b1626';
  const st = frame % 4;
  const hair = P.hair || 'short';
  if (dir === 'down' || dir === 'up') {
    const lUp = st === 1, rUp = st === 3;
    // legs
    f(5, 14, 2, lUp ? 1 : 2, pants); f(9, 14, 2, rUp ? 1 : 2, pants);
    f(5, lUp ? 15 : 16, 2, 1, shoe); f(9, rUp ? 15 : 16, 2, 1, shoe);
    // torso
    f(4, 9, 8, 4, top); f(4, 13, 8, 1, shade(pants, -0.2));
    // arms swing
    const la = st === 1 ? 1 : st === 3 ? -1 : 0;
    f(3, 9 + Math.max(0, la), 1, 3, td); f(12, 9 + Math.max(0, -la), 1, 3, td);
    f(3, 12 + Math.max(0, la), 1, 1, sk.s); f(12, 12 + Math.max(0, -la), 1, 1, sk.s);
    if (dir === 'down') {
      if (P.kind === 'robe') { f(7, 9, 2, 1, '#f4f4f4'); }
      else if (P.kind === 'sweater' || P.kind === 'tee') { f(6, 9, 4, 1, td); }
      else { f(6, 9, 4, 1, P.shirt || '#f4f4f4'); f(7, 10, 2, 1, P.shirt || '#f4f4f4'); if (P.tie) { f(7, 10, 2, 3, P.tie); } f(5, 10, 1, 3, td); f(10, 10, 1, 3, td); }
    } else { f(4, 9, 8, 1, td); }
    // head
    f(4, 2, 8, 7, sk.s); f(10, 3, 2, 6, sk.S); f(5, 8, 6, 1, sk.S);
    if (dir === 'down') {
      f(5, 5, 1, 2, K); f(9, 5, 1, 2, K);
      if (P.glasses) { f(4, 5, 3, 1, P.glasses === true ? K : P.glasses); f(8, 5, 3, 1, P.glasses === true ? K : P.glasses); f(7, 5, 1, 1, P.glasses === true ? K : P.glasses); }
      f(7, 7, 2, 1, sk.m);
      if (P.beard) { f(4, 6, 1, 3, P.beardC || hc); f(11, 6, 1, 3, P.beardC || hc); f(5, 8, 6, 1, P.beardC || hc); }
    }
    // hair
    if (hair === 'bald') { if (dir === 'down') { f(4, 4, 1, 2, hc); f(11, 4, 1, 2, hc); } else { f(4, 4, 8, 3, sk.s); f(4, 5, 1, 2, hc); f(11, 5, 1, 2, hc); } f(6, 2, 2, 1, shade(sk.s, 0.3)); }
    else if (hair === 'hijab') { f(3, 1, 10, 3, hc); f(3, 4, 2, 6, hc); f(11, 4, 2, 6, hc); f(4, 9, 8, 1, hc); if (dir === 'up') f(4, 2, 8, 7, hc); f(4, 1, 6, 1, hh); }
    else if (hair === 'curly') { f(3, 0, 10, 4, hc); f(3, 4, 2, 3, hc); f(11, 4, 2, 3, hc); f(4, 0, 2, 1, hh); f(8, 1, 2, 1, hh); f(6, 2, 1, 1, hd); if (dir === 'up') f(3, 3, 10, 5, hc); }
    else {
      f(4, 1, 8, 3, hc); f(3, 2, 1, 4, hc); f(12, 2, 1, 4, hc); f(5, 1, 3, 1, hh);
      if (dir === 'down') { f(4, 4, 2, 1, hc); f(10, 4, 2, 1, hc); }
      if (dir === 'up') f(4, 3, 8, 5, hc);
      if (hair === 'long' || hair === 'bob') { f(3, 6, 1, hair === 'long' ? 6 : 3, hc); f(12, 6, 1, hair === 'long' ? 6 : 3, hc); if (dir === 'up') f(4, 8, 8, hair === 'long' ? 3 : 1, hc); }
      if (hair === 'bun') { f(6, -1, 4, 2, hc); f(7, -1, 1, 1, hh); }
      if (hair === 'pony') { if (dir === 'up') f(7, 8, 2, 4, hd); }
      if (hair === 'side') { f(4, 4, 4, 1, hc); }
      if (hair === 'buzz') { f(4, 1, 8, 2, hc); }
    }
    if (P.gray && hair !== 'bald') f(9, 1, 2, 1, '#d8d8d8');
  } else {
    // side view facing right
    const s1 = st === 1, s3 = st === 3;
    if (s1 || s3) {
      const back = s1 ? pants : shade(pants, -0.25), front = s1 ? shade(pants, -0.25) : pants;
      f(5, 14, 2, 2, back); f(4, 16, 3, 1, shoe);
      f(9, 14, 2, 2, front); f(9, 16, 3, 1, shoe);
    } else { f(7, 14, 2, 2, pants); f(7, 16, 3, 1, shoe); }
    f(5, 9, 6, 4, top); f(5, 13, 6, 1, shade(pants, -0.2));
    if (P.kind !== 'sweater' && P.kind !== 'tee' && P.kind !== 'robe') { f(10, 9, 1, 2, P.shirt || '#f4f4f4'); if (P.tie) f(10, 10, 1, 2, P.tie); }
    const ax = s1 ? 9 : s3 ? 6 : 7;
    f(ax, 9, 2, 3, td); f(ax, 12, 2, 1, sk.s);
    f(5, 2, 7, 7, sk.s); f(5, 3, 2, 6, sk.S);
    f(10, 5, 1, 2, K); f(11, 7, 1, 1, sk.m);
    if (P.glasses) f(9, 5, 3, 1, P.glasses === true ? K : P.glasses);
    if (P.beard) { f(8, 7, 4, 2, P.beardC || hc); }
    if (hair === 'bald') { f(5, 4, 2, 3, hc); f(7, 2, 2, 1, shade(sk.s, 0.3)); }
    else if (hair === 'hijab') { f(4, 1, 8, 3, hc); f(4, 1, 3, 9, hc); f(5, 8, 6, 2, hc); f(5, 1, 4, 1, hh); }
    else if (hair === 'curly') { f(4, 0, 8, 4, hc); f(4, 4, 3, 4, hc); f(6, 0, 2, 1, hh); }
    else {
      f(5, 1, 7, 3, hc); f(4, 2, 2, 5, hc); f(6, 1, 3, 1, hh);
      if (hair === 'long' || hair === 'bob') f(4, 7, 3, hair === 'long' ? 5 : 2, hc);
      if (hair === 'bun') { f(3, 1, 3, 3, hc); }
      if (hair === 'pony') { f(2, 4, 3, 2, hc); f(2, 6, 2, 4, hd); }
    }
  }
  // accessory
  if (P.acc === 'case') {
    if (dir === 'side') { f(9, 12, 4, 3, '#8a5a3c'); f(10, 11, 2, 1, '#5b3a29'); }
    else if (dir === 'down') { f(12, 12, 3, 3, '#8a5a3c'); f(13, 11, 1, 1, '#5b3a29'); }
  } else if (P.acc === 'shield') {
    if (dir !== 'up') { const sx = dir === 'side' ? 10 : -1; f(sx, 8, 5, 6, '#3fbfa0'); f(sx + 1, 9, 3, 4, '#1f6f63'); f(sx + 2, 9, 1, 4, '#e8b44a'); f(sx + 1, 10, 3, 1, '#e8b44a'); f(sx + 1, 14, 3, 1, '#3fbfa0'); }
  } else if (P.acc === 'folder') {
    if (dir !== 'up') f(dir === 'side' ? 10 : 12, 11, 3, 4, '#e9c46a');
  } else if (P.acc === 'gavel') {
    if (dir !== 'up') { f(12, 9, 4, 2, '#8a5a3c'); f(13, 11, 1, 3, '#5b3a29'); }
  }
  const s = outlineSprite({ c, w: 18, h: 20 });
  _chibiCache.set(key, s);
  return s;
}

/* ---------- characters ---------- */
const AVATARS = [
  { id: 'av0', name: 'Navy suit', skin: 0, hair: 'side', hairC: '#5a3a24', top: '#29366f', tie: '#d0344a', pants: '#29243a', acc: 'case' },
  { id: 'av1', name: 'Teal blazer', skin: 2, hair: 'bun', hairC: '#1d1414', top: '#1f6f63', tie: null, shirt: '#f4f4f4', kind: 'blazer', pants: '#2a2236', acc: 'case', earring: true },
  { id: 'av2', name: 'Charcoal suit', skin: 3, hair: 'buzz', hairC: '#120d0d', top: '#3a3f55', tie: '#e8b44a', pants: '#20202c', acc: 'case', beard: true, beardC: '#120d0d' },
  { id: 'av3', name: 'Plum blazer', skin: 1, hair: 'hijab', hairC: '#7b3fb0', top: '#5d275d', kind: 'blazer', pants: '#251c30', acc: 'case' },
  { id: 'av4', name: 'Sweater', skin: 1, hair: 'curly', hairC: '#7a4a2a', top: '#a8741a', kind: 'sweater', pants: '#2d3a5c', acc: 'case', glasses: true },
  { id: 'av5', name: 'Gray suit', skin: 0, hair: 'long', hairC: '#c98f3a', top: '#566c86', tie: '#257179', pants: '#2b2f40', acc: 'case' },
];
const CAST = {
  dana: { id: 'dana', name: 'DANA', role: 'People Ops', skin: 1, hair: 'curly', hairC: '#2a1810', top: '#257179', kind: 'blazer', bg: '#3b5dc9', earring: true, voice: 620 },
  vance: { id: 'vance', name: 'M. VANCE', role: 'General Counsel', skin: 0, hair: 'side', hairC: '#6d6d7a', gray: true, top: '#2b2b3a', tie: '#7a1f2e', glasses: true, bg: '#5d275d', voice: 300 },
  jo: { id: 'jo', name: 'JO PARK', role: 'Employment lawyer · your friend', skin: 0, hair: 'bob', hairC: '#16121a', top: '#7b3fb0', kind: 'blazer', bg: '#1f6f63', voice: 700 },
  rex: { id: 'rex', name: 'REX HOLLIS', role: 'VP Operations · your boss', skin: 3, hair: 'bald', hairC: '#2a1a12', beard: true, beardC: '#2a1a12', top: '#1d2a55', tie: '#e8b44a', bg: '#333c57', voice: 260 },
  priya: { id: 'priya', name: 'PRIYA', role: 'Analyst · your team', skin: 2, hair: 'long', hairC: '#120c0c', top: '#ef7d57', kind: 'tee', bg: '#a8741a', voice: 760 },
  marco: { id: 'marco', name: 'MARCO', role: 'Coordinator · your team', skin: 1, hair: 'curly', hairC: '#3a2216', top: '#38b764', kind: 'sweater', glasses: true, bg: '#257179', voice: 560 },
  okafor: { id: 'okafor', name: 'MR. OKAFOR', role: 'Bramblewood Foods · client', skin: 3, hair: 'buzz', hairC: '#bdbdbd', gray: false, top: '#6e4a2e', tie: '#3fbfa0', bg: '#8a5a3c', voice: 340 },
  arb: { id: 'arb', name: 'ARBITRATOR', role: 'Hon. L. Reyes (ret.)', skin: 1, hair: 'bun', hairC: '#9a9aa8', top: '#1a1a24', kind: 'robe', glasses: true, bg: '#333c57', voice: 420 },
  courier: { id: 'courier', name: 'PROCESS SERVER', role: '', skin: 2, hair: 'buzz', hairC: '#2a1810', top: '#d0344a', kind: 'tee', bg: '#7a1f2e', voice: 480 },
  counsel: { id: 'counsel', name: 'DEFENSE COUNSEL', role: 'Paid for by Hereinafter', skin: 2, hair: 'side', hairC: '#1d1414', top: '#1f6f63', tie: '#e8b44a', bg: '#257179', acc: 'shield', voice: 450 },
  hired: { id: 'hired', name: 'YOUR LAWYER', role: '$450/hour', skin: 0, hair: 'short', hairC: '#7a4a2a', top: '#566c86', tie: '#d0344a', bg: '#333c57', acc: 'folder', voice: 480 },
  narrator: null,
};
function playerSpec() { const a = AVATARS[(RUN && RUN.avatar) || 0]; return Object.assign({}, a, { bg: '#29366f', voice: 540, id: a.id }); }
const _icoURL = {};
function icoImg(name, big) { if (!_icoURL[name]) _icoURL[name] = ICONS[name].c.toDataURL(); return h('img', { class: big ? 'ico2' : 'ico', src: _icoURL[name], alt: '' }); }

/* ---------- hand-drawn sprites ---------- */
const S = {};
function defSprite(name, rows, map) {
  const w = rows[0].length;
  rows.forEach((r, i) => { if (r.length !== w) console.warn('sprite', name, 'row', i, 'len', r.length, 'expected', w); });
  S[name] = compileRows(rows, map);
}
defSprite('phantom0', [
  '................',
  '.....kkkkkk.....',
  '...kkVVVVVVkk...',
  '..kVVVVVVVVVVk..',
  '..kVwwVVVVwwVk..',
  '.kVVwkVVVVwkVVk.',
  '.kVVVVVVVVVVVVk.',
  '.kVVklklklklVVk.',
  '.kVVVVVVVVVVVvk.',
  '.kVVVVVVVVVVvvk.',
  '.kvVVVVVVVVVvvk.',
  '.kvvVVVVVVVvvvk.',
  '.kvvvVVvvVvvvvk.',
  '.kvvkvvkkvvkvvk.',
  '..kk.kk..kk.kk..',
  '................',
]);
defSprite('phantom1', [
  '................',
  '.....kkkkkk.....',
  '...kkVVVVVVkk...',
  '..kVVVVVVVVVVk..',
  '..kVwwVVVVwwVk..',
  '.kVVwkVVVVwkVVk.',
  '.kVVVVVVVVVVVVk.',
  '.kVVlklklklkVVk.',
  '.kVVVVVVVVVVVvk.',
  '.kVVVVVVVVVVvvk.',
  '.kvVVVVVVVVVvvk.',
  '.kvvVVVVVVVvvvk.',
  '.kvvvVVvvVvvvvk.',
  '.kkvvkvvkkvvkkk.',
  '...kk.kk..kk....',
  '................',
]);
const GOLD_MAP = { V: '#ffcd75', v: '#a8741a', l: '#f4f4f4' };
defSprite('lodestar0', S_rows_phantom(0), GOLD_MAP);
defSprite('lodestar1', S_rows_phantom(1), GOLD_MAP);
function S_rows_phantom(i) {
  return i === 0 ? [
    '................', '.....kkkkkk.....', '...kkVVVVVVkk...', '..kVVVVVVVVVVk..', '..kVwwVVVVwwVk..', '.kVVwkVVVVwkVVk.', '.kVVVVVVVVVVVVk.', '.kVVVVVkkVVVVVk.', '.kVVVVVVVVVVVvk.', '.kVVVVVVVVVVvvk.', '.kvVVVVVVVVVvvk.', '.kvvVVVVVVVvvvk.', '.kvvvVVvvVvvvvk.', '.kvvkvvkkvvkvvk.', '..kk.kk..kk.kk..', '................',
  ] : [
    '................', '.....kkkkkk.....', '...kkVVVVVVkk...', '..kVVVVVVVVVVk..', '..kVwwVVVVwwVk..', '.kVVwkVVVVwkVVk.', '.kVVVVVVVVVVVVk.', '.kVVVVVkkVVVVVk.', '.kVVVVVVVVVVVvk.', '.kVVVVVVVVVVvvk.', '.kvVVVVVVVVVvvk.', '.kvvVVVVVVVvvvk.', '.kvvvVVvvVvvvvk.', '.kkvvkvvkkvvkkk.', '...kk.kk..kk....', '................',
  ];
}
defSprite('sect', [
  '..kkkkk..',
  '.kuuuuuk.',
  'kuukkkuuk',
  'kuuk.kkk.',
  '.kuuuuk..',
  'kuukkuuk.',
  'kuuk.kuuk',
  '.kuukkuuk',
  '..kuuuuk.',
  '.kkk.kuuk',
  'kuukkkuuk',
  '.kuuuuuk.',
  '..kkkkk..',
]);
defSprite('cd', [
  '.kkkkkkkkkkkk.',
  'keeeeeeeeeeeek',
  'kEeeeeeeeeeeEk',
  'keEeeeeeeeeEek',
  'keeEeeeeeeEeek',
  'keeeEeRReEeeek',
  'keeeeRddReeeek',
  'keeeeRddReeeek',
  'keeeeeRReeeeek',
  '.kkkkkkkkkkkk.',
]);
defSprite('subpoena0', [
  'w..............w',
  'ww.kkkkkkkkkk.ww',
  'wwwkeeeeeeeekwww',
  '.wwkeDDDDDDekww.',
  '..wkeeeeeeeekw..',
  '...keDDDDeeek...',
  '...keeeeeeeek...',
  '...keDDDDDDek...',
  '...keeeeeDDek...',
  '...keeeeeDDek...',
  '...kkkkkkkkkk...',
]);
defSprite('subpoena1', [
  '................',
  '...kkkkkkkkkk...',
  '...keeeeeeeek...',
  'wwwkeDDDDDDekwww',
  'wwwkeeeeeeeekwww',
  '.wwkeDDDDeeekww.',
  '...keeeeeeeek...',
  '...keDDDDDDek...',
  '...keeeeeDDek...',
  '...keeeeeDDek...',
  '...kkkkkkkkkk...',
]);
defSprite('dart', [
  '.......k',
  '.....kke',
  '...kkeek',
  '.kkeeekE',
  'kkkkkEEk',
  '....kEk.',
  '....kk..',
]);
defSprite('scrap', [
  'kkkkk.',
  'keeekk',
  'keEeek',
  'keeeek',
  'kkkkkk',
]);
defSprite('invoice', [
  'kkkkkkkk',
  'keeeeeek',
  'kerreeek',
  'keeeeeek',
  'keEEEEek',
  'keeeeeek',
  'keEEEEek',
  'keeeemek',
  'keeemmek',
  'kkkkkkkk',
]);
defSprite('check', [
  'kkkkkkkkkkkk',
  'kLLLLLLLLLLk',
  'kLmmmLLLLLLk',
  'kLLLLLLmmmLk',
  'kLmmmmmmLLLk',
  'kLLLLLLLLmLk',
  'kkkkkkkkkkkk',
]);
defSprite('orb', [
  '..kkkk..',
  '.kLLLLk.',
  'kLwLLLmk',
  'kLLLLmmk',
  'kLLLmmmk',
  'kmLmmmmk',
  '.kmmmmk.',
  '..kkkk..',
]);
defSprite('orbC', [
  '..kkkk..',
  '.kVVVVk.',
  'kVwkkVvk',
  'kVVVkvvk',
  'kVVkvvvk',
  'kvVvvvvk',
  '.kvkvvk.',
  '..kkkk..',
]);
defSprite('coffee', [
  '..w.w...',
  '.w.w....',
  'kkkkkk..',
  'kwwwwkkk',
  'khhhhk.k',
  'kwwwwkkk',
  'kwwwwk..',
  '.kkkk...',
]);
defSprite('folder', [
  'kkkk......',
  'kyyykkkkkk',
  'kyyyyyyyyk',
  'kuuuuuuuuk',
  'kyyyyyyyyk',
  'kyyRRyyyyk',
  'kyyyyyyyyk',
  'kkkkkkkkkk',
]);
defSprite('lodefile', [
  'kkkkkkkkk.',
  'kuuuuuuuuk',
  'kuyyyyyyuk',
  'kuykkkkyuk',
  'kuyyyyyyuk',
  'kuykkkyyuk',
  'kuyyyyyyuk',
  'kuuuuuuuuk',
  'kkkkkkkkkk',
]);
defSprite('heart', [
  '.kk.kk.',
  'kRRkRRk',
  'kRwRRRk',
  'kRRRRRk',
  '.kRRRk.',
  '..kRk..',
  '...k...',
]);
defSprite('heartH', [
  '.kk.kk.',
  'kRRkGGk',
  'kRwRGGk',
  'kRRRGGk',
  '.kRRGk.',
  '..kRk..',
  '...k...',
]);
defSprite('heartE', [
  '.kk.kk.',
  'kGGkGGk',
  'kGGGGGk',
  'kGGGGGk',
  '.kGGGk.',
  '..kGk..',
  '...k...',
]);
defSprite('laptop', [
  '..kkkkkkkk..',
  '..kccccccck.',
  '..kcCcccck..',
  '..kccccccck.',
  '..kkkkkkkkk.',
  '.kllllllllk.',
  'kgggggggggk.',
  'kkkkkkkkkkk.',
]);
defSprite('vault', [
  '.kkkkkkkkkkkk.',
  'kGGGGGGGGGGGGk',
  'kGllllllllllGk',
  'kGlgggggggglGk',
  'kGlgkuuuukglGk',
  'kGlgkuyyukglGk',
  'kGlgkuuuukglGk',
  'kGlggggkgglGGk',
  'kGllllllllllGk',
  'kGGGGGGGGGGGGk',
  '.kk........kk.',
]);
defSprite('tree', [
  '.....kkkkk......',
  '...kkmmmmmkk....',
  '..kmmLmmmmmmk...',
  '.kmLLmmmmmmMmk..',
  '.kmLmmmmmMmmmk..',
  'kmmmmmmmmmmMMmk.',
  'kmLmmmmmMmmmMmk.',
  'kmmmmmmmmmmMMMk.',
  '.kmmmMmmmmMMMk..',
  '.kMmmmmmMMMMMk..',
  '..kkMMMMMMMkk...',
  '....kkhhkkk.....',
  '......hH........',
  '......hH........',
  '.....khHk.......',
  '....kkkkkk......',
]);
defSprite('bench', [
  'kkkkkkkkkkkkkkkk',
  'khhhhhhhhhhhhhhk',
  'kkkkkkkkkkkkkkkk',
  'khhhhhhhhhhhhhhk',
  'kkkkkkkkkkkkkkkk',
  '.kG..........Gk.',
  '.kG..........Gk.',
]);
defSprite('lamp', [
  '.kkk.',
  'kyYyk',
  '.kGk.',
  '..G..',
  '..G..',
  '..G..',
  '..G..',
  '..G..',
  '..G..',
  '..G..',
  '.kGk.',
  'kkkkk',
]);
defSprite('chair', [
  '..kkkkkkkkkk..',
  '..khhhhhhhhk..',
  '..khHHHHHHhk..',
  '..khHHHHHHhk..',
  '..khhhhhhhhk..',
  'kkkkkkkkkkkkkk',
  'khhhhhhhhhhhhk',
  'kkkkkkkkkkkkkk',
  '.kk........kk.',
  '.kk........kk.',
]);
defSprite('gavel', [
  '..kkkkk...',
  '.khhhhhk..',
  '.khHHHhk..',
  '..kkkkkk..',
  '....khk...',
  '....khk...',
  '....khk...',
  '...kkkkk..',
]);
defSprite('stampIcon', [
  '...kkkk...',
  '...khhk...',
  '...khhk...',
  '..kkkkkk..',
  '.kddddddk.',
  'kddddddddk',
  'kkkkkkkkkk',
]);
// 10x10 clause icons
const ICONS = {};
function defIcon(name, rows, map) { ICONS[name] = compileRows(rows, map); }
defIcon('shield', ['.kkkkkkkk.', 'kttttttttk', 'ktTTuuTTtk', 'ktTTuuTTtk', 'ktuuuuuutk', 'ktTTuuTTtk', '.ktTuuTtk.', '.kttuuttk.', '..kttttk..', '...kkkk...']);
defIcon('lock', ['...kkkk...', '..kggggk..', '..kg..gk..', '..kg..gk..', '.kkkkkkkk.', '.kuuuuuuk.', '.kuuUUuuk.', '.kuuUUuuk.', '.kuuuuuuk.', '.kkkkkkkk.']);
defIcon('fence', ['k..k..k..k', 'kRkRkRkRkR', 'k..k..k..k', 'kGGkGGkGGk', 'k..k..k..k', 'kRkRkRkRkR', 'k..k..k..k', 'kGGkGGkGGk', 'k..k..k..k', 'kkkkkkkkkk']);
defIcon('hand', ['..........', '.kkk..kkk.', 'kssskksSSk', 'ksssskSSSk', 'kssskSSSSk', '.kssSSSSk.', '..kssSSk..', '...kkkk...', '..........', '..........']);
defIcon('bulb', ['...kkkk...', '..kyyyyk..', '.kyYYyyyk.', '.kyYyyyyk.', '.kyyyyyyk.', '..kyyyyk..', '...kuuk...', '...kllk...', '...kllk...', '....kk....']);
defIcon('gavel', ['.kkkkk....', 'khhhhhk...', 'khHHHhk...', '.kkkkkkk..', '....kkhk..', '.....khk..', '......khk.', '.......khk', '..kkkk..kk', '.kGGGGk...']);
defIcon('subpoena', ['kkkkkkkk..', 'keeeeeekk.', 'keDDDDeeek', 'keeeeeeeek', 'keDDDDDDek', 'keeeeeeeek', 'keDDDeeeek', 'keeeeeDDek', 'keeeeeDDek', 'kkkkkkkkkk']);
defIcon('coin', ['...kkkk...', '..kyyyyk..', '.kyuuuuyk.', 'kyuyyyyuyk', 'kyuyuuuuyk', 'kyuyyyuuyk', 'kyuuuuyuyk', '.kyyyyyyk.', '..kuuuuk..', '...kkkk...']);
defIcon('scroll', ['.kkkkkkkk.', 'keeeeeeeek', '.keEEEEek.', '.keeeeeek.', '.keEEEeek.', '.keeeeeek.', '.keEEEEek.', '.keeeeeek.', 'keeeeeeeek', '.kkkkkkkk.']);
defIcon('star', ['....kk....', '....ky....', '...kyyk...', 'kkkyyyykkk', 'kyyyyyyyyk', '.kyyyyyyk.', '..kyyyyk..', '.kyykkyyk.', '.kyk..kyk.', '.kk....kk.']);
defIcon('x', ['kk......kk', 'kRk....kRk', '.kRk..kRk.', '..kRkkRk..', '...kRRk...', '...kRRk...', '..kRkkRk..', '.kRk..kRk.', 'kRk....kRk', 'kk......kk']);
defIcon('check', ['........kk', '.......kLk', '......kLk.', 'kk...kLk..', 'kLk.kLk...', '.kLkLk....', '..kLk.....', '...k......', '..........', '..........']);
defIcon('heartI', ['.kk..kk...', 'kRRkkRRk..', 'kRRRRRRk..', 'kRRRRRRk..', '.kRRRRk...', '..kRRk....', '...kk.....', '..........', '..........', '..........']);
defIcon('ghost', ['..kkkkkk..', '.kVVVVVVk.', 'kVwkVVwkVk', 'kVVVVVVVVk', 'kVlklklkVk', 'kVVVVVVVVk', 'kvVVVVVVvk', 'kvvVVVVvvk', 'kvkvkkvkvk', '.k.k..k.k.']);
defIcon('claw', ['....kk....', '....kk....', '..kkllkk..', '.klllllk..', 'klgkkkglk.', 'klk...klk.', 'klk...klk.', '.kk...kk..', '..........', '..........']);
