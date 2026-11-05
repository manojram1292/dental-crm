/*
 * Episode 23 · shared pieces (not a scene). Loads after ep22/_common (EP22.lake, EP22.peak, EP22.dawn).
 * LOCATIONS, each with its own light:
 *   EP23.panel(ctx, T, o)    KASHYAPA'S TALE as a RED-OCHRE MURAL PANEL: a painted terracotta wall with a lotus
 *                            border and plaster cracks, lit warm and flat from the front (a story inside a story)
 *   EP23.alamba(ctx, T, o)   THE HOLY GROVE OF ALAMBA AT VIOLET TWILIGHT: giant trees of the gods hung with gold
 *                            fruit-lamps; the great tree RAUHINA at the right with one vast branch across the
 *                            frame (o.crack 0..1 splits it, o.drop 0..1 lets it fall); EP23.dusk(x, y) lights a figure
 *   EP23.BRANCH              the branch's line in camera space (for figures that sit or hang on it)
 *   EP23.branchAt(u, o)      a point along the branch (0 = trunk … 1 = tip), after the crack/drop
 *   EP23.carry(g, x, y, s, T, o)   Garuda flying with the elephant and the tortoise in his talons
 *   EP23.hangers(g, T, n, a, o)    n Valakhilyas hanging head-down along the branch
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, hash } = R;
  const EP23 = (window.EP23 = {});
  EP23.mouth = window.EP17.mouth; EP23.plaque = window.EP17.plaque;
  EP23.dusk = (x, y, k = 1.05) => ({ dir: Math.atan2(500 - (y - 600), 300 - x), intensity: k, front: 0.55 });

  EP23.panel = (ctx, T, o = {}) => {
    KIT.vgrad(ctx, 0, R.H, [[0, '#6a2a14'], [0.5, '#9a4420'], [1, '#5a200e']]);
    // plaster mottling and cracks
    for (let i = 0; i < 60; i++) { ctx.globalAlpha = 0.08; ctx.fillStyle = i % 2 ? '#f0b080' : '#3a1006'; ctx.beginPath(); ctx.arc(hash(i, 1) * R.W, hash(i, 2) * R.H, 40 + 120 * hash(i, 3), 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 0.35; ctx.strokeStyle = '#3a1408'; ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) { let x = hash(i, 5) * R.W, y = hash(i, 6) * R.H; ctx.beginPath(); ctx.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (hash(i, k + 9) - 0.5) * 120; y += 40 + 40 * hash(i, k + 19); ctx.lineTo(x, y); } ctx.stroke(); }
    ctx.globalAlpha = 1;
    // a lotus border top and bottom
    for (const y of [150, 1770]) {
      ctx.fillStyle = '#2a0c04'; ctx.fillRect(0, y - 40, R.W, 80);
      ctx.fillStyle = '#e8b060';
      for (let i = 0; i < 12; i++) { const x = 45 + i * 90; ctx.beginPath(); ctx.moveTo(x - 30, y + 18); ctx.quadraticCurveTo(x - 20, y - 26, x, y - 30); ctx.quadraticCurveTo(x + 20, y - 26, x + 30, y + 18); ctx.closePath(); ctx.fill(); }
    }
    KIT.glow(ctx, 540, 1000, 900, '#ffc080', 0.25, 'lighter', 0.4);
    if (o.after) o.after(ctx);
  };

  EP23.BRANCH = { x0: 1180, y0: 900, x1: -200, y1: 1010 };
  EP23.branchAt = (u, o = {}) => {
    const B = EP23.BRANCH, c = clamp(o.crack || 0), d = clamp(o.drop || 0);
    let x = lerp(B.x0, B.x1, u), y = lerp(B.y0, B.y1, u) + Math.sin(u * Math.PI) * 30;
    if (u > 0.25) { const a = 0.06 * c + 0.5 * d, px = lerp(B.x0, B.x1, 0.25), py = lerp(B.y0, B.y1, 0.25); const dx = x - px, dy = y - py; x = px + dx * Math.cos(a) - dy * Math.sin(a); y = py + dx * Math.sin(a) + dy * Math.cos(a) + 260 * d; }
    return [x, y];
  };
  function tree(ctx, x, y, h, T, i) {
    ctx.fillStyle = '#1a1028'; ctx.beginPath(); ctx.moveTo(x - 40, y); ctx.quadraticCurveTo(x - 20, y - h * 0.5, x - 10, y - h); ctx.lineTo(x + 10, y - h); ctx.quadraticCurveTo(x + 20, y - h * 0.5, x + 40, y); ctx.fill();
    ctx.fillStyle = '#241838';
    for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.ellipse(x + (hash(i, k) - 0.5) * 260, y - h - 40 + k * 50 - 120, 200 - k * 20, 90, (hash(i, k + 5) - 0.5) * 0.4, 0, TAU); ctx.fill(); }
    for (let k = 0; k < 7; k++) { const fx = x + (hash(i, k + 10) - 0.5) * 380, fy = y - h - 140 + hash(i, k + 20) * 220, fl = 0.7 + 0.3 * Math.sin(T * 2 + i + k); KIT.glow(ctx, fx, fy, 40, '#ffc860', 0.6 * fl); ctx.fillStyle = '#ffe0a0'; ctx.beginPath(); ctx.arc(fx, fy, 7, 0, TAU); ctx.fill(); }
  }
  EP23.alamba = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {}, c = clamp(o.crack || 0), d = clamp(o.drop || 0);
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -600, 1500, [[0, '#120a2a'], [0.5, '#3a2060'], [0.85, '#9a5a8a'], [1, '#e8a080']], -500, R.W + 500);
    KIT.glow(ctx, 300, 1300, 800, '#ffb090', 0.4, 'lighter', 0.4);
    for (let i = 0; i < 5; i++) tree(ctx, -200 + i * 330, 1500, 500 + 200 * hash(i, 31), T, i);
    KIT.vgrad(ctx, 1480, R.H + 500, [[0, '#2a1a30'], [1, '#08060c']], -500, R.W + 500);
    // RAUHINA: a vast trunk at the right with aerial roots, its branch across the frame
    const B = EP23.BRANCH;
    ctx.fillStyle = '#140c18';
    ctx.beginPath(); ctx.moveTo(1080, R.H + 500); ctx.quadraticCurveTo(1120, 1300, 1100, 700); ctx.lineTo(1500, 600); ctx.lineTo(1600, R.H + 500); ctx.fill();
    ctx.strokeStyle = '#140c18'; ctx.lineWidth = 6; for (let i = 0; i < 9; i++) { const u = 0.35 + i * 0.07, [rx, ry] = EP23.branchAt(Math.min(u, 0.24), {}); ctx.beginPath(); ctx.moveTo(rx - i * 30, ry); ctx.lineTo(rx - i * 30 + Math.sin(T + i) * 6, 1500); ctx.stroke(); }
    // the branch itself (two pieces once cracked)
    const draw = (u0, u1) => { ctx.beginPath(); for (let i = 0; i <= 20; i++) { const u = lerp(u0, u1, i / 20), [x, y] = EP23.branchAt(u, { crack: c, drop: d }), w = lerp(70, 26, u); i ? ctx.lineTo(x, y - w / 2) : ctx.moveTo(x, y - w / 2); } for (let i = 20; i >= 0; i--) { const u = lerp(u0, u1, i / 20), [x, y] = EP23.branchAt(u, { crack: c, drop: d }), w = lerp(70, 26, u); ctx.lineTo(x, y + w / 2); } ctx.closePath(); ctx.fill(); };
    ctx.fillStyle = '#1e1224'; draw(0, 0.25); draw(0.25, 1);
    ctx.strokeStyle = '#d8a0c0'; ctx.globalAlpha = 0.35; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 30; i++) { const [x, y] = EP23.branchAt(i / 30, { crack: c, drop: d }); i ? ctx.lineTo(x, y - 30 + i * 0.6) : ctx.moveTo(x, y - 30); } ctx.stroke(); ctx.globalAlpha = 1;
    // leaves along it
    ctx.fillStyle = '#2a1a3a'; for (let i = 0; i < 26; i++) { const [x, y] = EP23.branchAt(0.28 + i * 0.027, { crack: c, drop: d }); ctx.beginPath(); ctx.ellipse(x, y - 50, 60, 26, (hash(i, 40) - 0.5), 0, TAU); ctx.fill(); }
    if (c > 0.01 && d < 0.99) { const [x, y] = EP23.branchAt(0.25, { crack: c, drop: d }); KIT.glow(ctx, x, y, 120, '#ffe0c0', 0.6 * c * (1 - d)); }
    if (o.after) o.after(ctx);
    ctx.restore();
    void B;
  };
  // the load and the hanging sages (used by episodes 23–24)
  const CH = KIT.characters, E = R.E;
  EP23.carry = (g, x, y, s, T, o = {}) => {
    const L = o.light || { dir: -2.3, intensity: 1.15, front: 0.6 };
    const ge = o.grab ?? 1;
    CH.vibhavasu.draw(g, { x: x + 400 * s, y: y + 60 * s, scale: 0.4 * s, facing: 'left', pose: { name: 'swim', phase: T, fight: 0.3 }, light: L, t: T, alpha: clamp(o.tortoise ?? 1), key: (o.key || 'cr') + '-vib' });
    CH.supratika.draw(g, { x: x + 170 * s, y: y + 170 * s, scale: 0.42 * s, facing: 'left', pose: { name: 'stand', seized: ge, trunk: Math.sin(T * 3) }, light: L, t: T, alpha: clamp(o.elephant ?? 1), key: (o.key || 'cr') + '-sup' });
    CH.garuda.draw(g, { x, y, scale: s, facing: 'left', pose: { name: 'carry', k: 1 }, light: L, t: T, key: (o.key || 'cr') + '-ga' });
  };
  EP23.hangers = (g, T, n, a, o = {}) => {
    for (let i = 0; i < n; i++) {
      const u = 0.3 + 0.68 * (i / n) + (hash(i, 3) - 0.5) * 0.01;
      const [x, y] = EP23.branchAt(u, o);
      CH.valakhilya.hang(g, { x: x + (hash(i, 4) - 0.5) * 16, y: y + 14, scale: (o.s || 0.07) * (0.85 + 0.3 * hash(i, 5)), index: i % 8, t: T, alpha: a, light: { dir: -Math.PI / 2, intensity: 1.05, front: 0.6 }, key: 'vk' + (i % 8) });
    }
  };
  void E;
})();
