/*
 * Episode 9 · shared pieces for its scenes (not a scene itself). Loads after ep05–ep08's
 * _common (EP5.ghost/label/mouth/hex/cloud; EP8.satra, EP8.fallers, EP8.serpent; EP7.label).
 * Episode 10 loads it too (the same hermitage, the jars, the eggs).
 *
 * LOCATION, with its own light:
 *   EP9.hermitage(ctx, T, o)  KASHYAPA'S HERMITAGE before sunrise: a cool blue-violet sky
 *                             with the eastern glow low on the right, far Himalayan ridges,
 *                             a great banyan with aerial roots, a lotus pool, a grass hut.
 *                             o = { glow (0..1: the east brightens), years (a float: the sky
 *                             wheels through days, sun and moon arcing over: time passing),
 *                             cam, after(g) }. Light: EP9.light(x, y) toward the east glow.
 * PROPS:
 *   EP9.egg(ctx, x, y, r, kind, T, o)    an egg: 'serpent' (small, olive with green veins),
 *                                        'rose' (Aruna's, rose-red), 'gold' (Garuda's, gold)
 *   EP9.jar(ctx, x, y, s, T, o)          a tall clay jar, steam curling, its egg glowing through
 *                                        the clay (o.kind, o.glow, o.crack 0..1)
 *   EP9.hoods(ctx, T, cx, cy, n, a, o)   a thousand small cobra hoods glinting in the dawn
 *   EP9.lightBird(ctx, x, y, s, col, T, a)  a bird of light (Vinata's wish: two great sons)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP5 = window.EP5;
  const { TAU, clamp, lerp, hash, fract } = R;
  const EP9 = (window.EP9 = {});
  const hex = EP5.hex;
  EP9.mouth = EP5.mouth; EP9.ghost = EP5.ghost; EP9.label = window.EP7.label;

  EP9.EAST = { x: 1000, y: 1060 };
  EP9.light = (x, y, k = 1, front = 0.3) => ({ dir: Math.atan2(EP9.EAST.y - (y - 600), EP9.EAST.x - x), intensity: k, front });

  let TREE = null;
  EP9.hermitage = (ctx, T, o = {}) => {
    if (!TREE) TREE = { banyan: KIT.forest.makeTree(909, { kind: 'tall' }), far: [0, 1, 2].map((i) => KIT.forest.makeTree(920 + i, { kind: 'tall' })) };
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const gl = clamp(o.glow ?? 0.4), hz = 1120, E_ = EP9.EAST;
    let day = 0;
    if (o.years != null) day = 0.5 - 0.5 * Math.cos(fract(o.years) * TAU);   // 0 night … 1 noon
    const top = hex(hex('#141838', '#3a5a9a', gl), '#6a9ad8', day), mid = hex(hex('#3a3a6a', '#8a7aa8', gl), '#b8d0f0', day), low = hex(hex('#7a5a7a', '#f0b890', gl), '#f8ecd0', day);
    KIT.vgrad(ctx, -400, hz, [[0, top], [0.6, mid], [1, low]], -300, R.W + 300);
    KIT.glow(ctx, E_.x, E_.y, 800, '#ffc890', 0.25 + 0.4 * gl);
    if (o.years != null) {
      // sun and moon arc over: time passing
      const f = fract(o.years), a = Math.PI * (1 - f * 2);
      const sx = 540 + Math.cos(a) * 640, sy = hz - Math.abs(Math.sin(a)) * 820;
      if (f < 0.5) { KIT.glow(ctx, sx, sy, 300, '#fff0c0', 0.7); ctx.fillStyle = '#fff6d8'; ctx.beginPath(); ctx.arc(sx, sy, 40, 0, TAU); ctx.fill(); }
      else { KIT.glow(ctx, sx, sy, 200, '#d8e4ff', 0.5); ctx.fillStyle = '#eef2ff'; ctx.beginPath(); ctx.arc(sx, sy, 32, 0, TAU); ctx.fill(); }
    } else {
      for (let i = 0; i < 40; i++) { const tw = 0.5 + 0.5 * Math.sin(T * 2 + i); ctx.fillStyle = `rgba(230,236,255,${0.5 * tw * (1 - gl)})`; ctx.fillRect(hash(i, 51) * 1080, hash(i, 52) * 700 - 300, 3, 3); }
    }
    // far ridges with snow
    for (let L = 0; L < 2; L++) {
      ctx.fillStyle = hex(L ? '#2a2a4a' : '#4a4a6a', L ? '#5a6a8a' : '#8a9ab8', Math.max(gl * 0.6, day));
      ctx.beginPath(); ctx.moveTo(-300, hz);
      for (let x = -300; x <= R.W + 300; x += 60) ctx.lineTo(x, hz - 200 + L * 90 - 160 * Math.abs(Math.sin(x * 0.004 + L * 2.1)) * (1 - L * 0.4));
      ctx.lineTo(R.W + 300, hz + 20); ctx.closePath(); ctx.fill();
    }
    for (let i = 0; i < 3; i++) KIT.forest.drawTree(ctx, TREE.far[i], [60, 900, 1040][i], hz + 30, [600, 520, 700][i], hex('#141428', '#2a3a3a', day), hex('#ffc890', '#fff0c8', day), [3, -2]);
    KIT.vgrad(ctx, hz, R.H + 300, [[0, hex('#2a3a3a', '#5a7a4a', day)], [0.3, hex('#18221e', '#3a4a2a', day)], [1, '#06080a']], -300, R.W + 300);
    // the lotus pool (right)
    ctx.save(); ctx.beginPath(); ctx.ellipse(820, 1330, 300, 60, 0, 0, TAU); ctx.clip();
    KIT.vgrad(ctx, 1270, 1390, [[0, hex('#7a6a8a', '#c8d8f0', day)], [1, hex('#2a2a4a', '#5a7aa0', day)]], 500, 1140);
    ctx.restore();
    for (let i = 0; i < 6; i++) {
      const x = 620 + i * 70, y = 1320 + (i % 2) * 18;
      ctx.fillStyle = hex('#1a3a2a', '#3a6a3a', day); ctx.beginPath(); ctx.ellipse(x, y, 30, 9, 0, 0, TAU); ctx.fill();
      if (i % 2 === 0) { ctx.fillStyle = '#f0a8c0'; ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.quadraticCurveTo(x - 14, y - 22, x, y - 40); ctx.quadraticCurveTo(x + 14, y - 22, x, y - 8); ctx.fill(); }
    }
    // the great banyan (left) with aerial roots
    KIT.forest.drawTree(ctx, TREE.banyan, -10, 1560, 1600, hex('#0c0e14', '#141a14', day), hex('#ffc890', '#fff0c8', day), [4, -2]);
    ctx.strokeStyle = hex('#0c0e14', '#141a14', day); ctx.lineWidth = 7;
    for (let i = 0; i < 7; i++) { const x = -80 + i * 34 + hash(i, 61) * 20, sw = Math.sin(T * 0.7 + i) * 6; ctx.beginPath(); ctx.moveTo(x, 300 + hash(i, 62) * 200); ctx.quadraticCurveTo(x + sw, 900, x + sw * 0.5, 1560); ctx.stroke(); }
    // the grass hut (far right)
    ctx.fillStyle = hex('#2a2220', '#5a4a3a', day); ctx.fillRect(900, 1140, 160, 120);
    ctx.fillStyle = hex('#3a2a20', '#7a6040', day); ctx.beginPath(); ctx.moveTo(870, 1150); ctx.quadraticCurveTo(980, 1010, 1090, 1150); ctx.closePath(); ctx.fill();
    // morning mist
    for (let i = 0; i < 4; i++) KIT.glow(ctx, ((i * 330 + T * 14) % 1500) - 200, hz + 100 + i * 50, 420, '#e8e4f4', 0.14, 'screen', 0.25);
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  // ─── eggs, jars, hoods, birds of light ─────────────────────────────────────
  const EGG = {
    serpent: ['#e0e8b0', '#8a9a48', '#2a3010', '#5aff9a'],
    rose: ['#ffe8ec', '#e06a7a', '#4a1018', '#ff7a6a'],
    gold: ['#fffbe8', '#e8b440', '#5a3a08', '#ffd060'],
  };
  EP9.egg = (ctx, x, y, r, kind, T, o = {}) => {
    const [hi, mid, dk, glow] = EGG[kind] || EGG.gold;
    const a = o.alpha ?? 1;
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a;
    if (o.glow) KIT.glow(ctx, x, y, r * 3.5, glow, o.glow * (0.8 + 0.2 * Math.sin(T * 2 + x)));
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.45, r * 0.08, x, y, r * 1.25);
    g.addColorStop(0, hi); g.addColorStop(0.55, mid); g.addColorStop(1, dk);
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r * 0.78, r, 0, 0, TAU); ctx.fill();
    if (kind === 'serpent' && r > 10) { ctx.strokeStyle = 'rgba(60,120,40,0.6)'; ctx.lineWidth = Math.max(1, r * 0.06); ctx.beginPath(); ctx.moveTo(x - r * 0.4, y - r * 0.3); ctx.quadraticCurveTo(x, y, x + r * 0.3, y + r * 0.5); ctx.stroke(); }
    if (o.crack) {
      const c = clamp(o.crack);
      ctx.strokeStyle = '#1a0606'; ctx.lineWidth = Math.max(1.5, r * 0.05);
      ctx.beginPath(); ctx.moveTo(x - r * 0.7, y - r * 0.1);
      const n = 7; for (let i = 1; i <= n * c; i++) ctx.lineTo(x - r * 0.7 + (i / n) * r * 1.4, y - r * 0.1 + (i % 2 ? -1 : 1) * r * 0.16);
      ctx.stroke();
      if (c > 0.6) KIT.glow(ctx, x, y - r * 0.1, r * 2.5, glow, (c - 0.6) * 1.8);
    }
    ctx.restore();
  };

  EP9.jar = (ctx, x, y, s, T, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const kind = o.kind || 'serpent', [, , , gc] = EGG[kind];
    // steam
    for (let i = 0; i < 3; i++) {
      const ph = fract(T * 0.25 + i / 3 + hash(x, i)), sw = Math.sin(T * 1.5 + i * 2 + x) * 20;
      ctx.save(); ctx.globalAlpha = 0.35 * Math.sin(Math.PI * ph); ctx.strokeStyle = '#f4f0ff'; ctx.lineWidth = 10 - 6 * ph; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sw * 0.3, -300 - ph * 40); ctx.quadraticCurveTo(sw, -360 - ph * 120, sw * 0.6, -400 - ph * 220); ctx.stroke(); ctx.restore();
    }
    // body
    const g = ctx.createLinearGradient(-110, 0, 110, 0);
    g.addColorStop(0, '#3a1e10'); g.addColorStop(0.35, '#8a4a24'); g.addColorStop(0.6, '#6a3418'); g.addColorStop(1, '#2a140a');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-50, -290); ctx.bezierCurveTo(-60, -250, -130, -220, -120, -120); ctx.bezierCurveTo(-110, -30, -60, 0, 0, 0); ctx.bezierCurveTo(60, 0, 110, -30, 120, -120); ctx.bezierCurveTo(130, -220, 60, -250, 50, -290); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a85a2a'; ctx.fillRect(-62, -306, 124, 20);
    ctx.strokeStyle = 'rgba(240,200,140,0.5)'; ctx.lineWidth = 3; for (const yy of [-200, -150]) { ctx.beginPath(); ctx.ellipse(0, yy, 112, 14, 0, 0, Math.PI); ctx.stroke(); }
    // the egg glowing through the clay
    const gw = o.glow ?? 0.5;
    if (gw > 0.01) KIT.glow(ctx, 0, -120, 160, gc, gw * (0.7 + 0.3 * Math.sin(T * 1.7 + x)), 'screen');
    if (o.crack) {
      ctx.strokeStyle = '#120804'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-20, -290);
      const c = clamp(o.crack); for (let i = 1; i <= 8 * c; i++) ctx.lineTo(-20 + (i % 2 ? 22 : -10), -290 + i * 34);
      ctx.stroke();
      if (c > 0.5) KIT.glow(ctx, 0, -150, 200, gc, (c - 0.5) * 1.4);
    }
    ctx.restore();
  };

  EP9.hoods = (ctx, T, cx, cy, n, a, o = {}) => {
    if (a <= 0.01) return;
    ctx.save();
    for (let i = 0; i < n; i++) {
      const u = hash(i, 71), v = hash(i, 72);
      if (u > a) continue;
      const ang = v * TAU, rad = Math.sqrt(hash(i, 73)) * (o.r || 420);
      const x = cx + Math.cos(ang) * rad, y = cy + Math.sin(ang) * rad * 0.7;
      const s = (o.size || 14) * (0.6 + 0.6 * hash(i, 74)), sw = Math.sin(T * 2 + i) * 2;
      ctx.globalAlpha = clamp((a - u) * 6) * (0.5 + 0.5 * (1 - rad / (o.r || 420)));
      ctx.fillStyle = hash(i, 75) > 0.5 ? '#c8d070' : '#5aff9a';
      ctx.beginPath(); ctx.ellipse(x + sw, y, s * 0.75, s, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#0a0c06'; ctx.beginPath(); ctx.ellipse(x + sw, y + s * 0.1, s * 0.55, s * 0.8, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#e8ffb0'; ctx.beginPath(); ctx.arc(x + sw - s * 0.2, y - s * 0.2, s * 0.1, 0, TAU); ctx.arc(x + sw + s * 0.2, y - s * 0.2, s * 0.1, 0, TAU); ctx.fill();
    }
    ctx.restore();
  };

  EP9.lightBird = (ctx, x, y, s, col, T, a = 1) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = a;
    KIT.glow(ctx, 0, 0, 260, col, 0.5);
    const flap = Math.sin(T * 3 + x) * 0.35;
    ctx.fillStyle = col;
    for (const sd of [-1, 1]) {
      ctx.save(); ctx.scale(sd, 1); ctx.rotate(-flap);
      ctx.beginPath(); ctx.moveTo(10, -10);
      ctx.bezierCurveTo(80, -90, 180, -80, 240, -30);
      for (let i = 0; i < 5; i++) ctx.lineTo(220 - i * 40, -10 + i * 6 + (i % 2) * 18);
      ctx.lineTo(20, 10); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.beginPath(); ctx.ellipse(0, 10, 26, 60, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -56, 22, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-8, -50); ctx.lineTo(0, -24); ctx.lineTo(8, -50); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-20, 60); ctx.lineTo(0, 140); ctx.lineTo(20, 60); ctx.fill();
    ctx.fillStyle = '#fffbe8'; ctx.globalAlpha = a * 0.8; ctx.beginPath(); ctx.ellipse(0, 0, 10, 36, 0, 0, TAU); ctx.fill();
    ctx.restore();
  };

  void lerp;
})();
