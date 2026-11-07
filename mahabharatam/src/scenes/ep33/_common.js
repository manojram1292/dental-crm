/*
 * Episode 33 · shared pieces (not a scene). Loads after ep31/_common (EPA).
 * NEW LIGHTS:
 *   EP33.wild(ctx, T, o)    THE WILDERNESS AT OCHRE DUSK: thorn trees, a dry riverbed, a low brown-gold sun (left). o.dawn (0..1:
 *                           the same place at first grey-rose dawn), o.cam, o.after(g)
 *   EP33.pit(ctx, T, o)     INSIDE THE PIT: black earth walls, a cold shaft of moonlight from the mouth above (top-light);
 *                           o.view 'up' (the mouth and the moon above, the default) · 'down' (looking down the shaft into dark),
 *                           o.cam, o.after(g)
 * PROPS:
 *   EP33.tuft(ctx, x, y, s, T, o)   the tuft of virana grass hanging from the pit's lip, its roots; o.glow, o.roots (1..4 left)
 *   EP33.rat(ctx, x, y, s, T, o)    a mural rat gnawing (o.gnaw 0..1 jaw speed), facing right
 *   EP33.hanging(g, x, y, s, T, i, o)   an ancestor (CH.pitr) hanging HEAD DOWN by the hands from (x, y)
 *   EP33.moonLight(x, y)    a light from the pit's mouth
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA;
  const { TAU, clamp, hash, lerp } = R;
  const CH = KIT.characters;
  const EP33 = (window.EP33 = {});
  const hex = EPA.hex;
  EP33.moonLight = (x, y, k = 1.05) => ({ dir: -Math.PI / 2, intensity: k, front: 0.6, fill: 0.4 });
  EP33.duskLight = (x, y, k = 1.05) => ({ dir: Math.atan2(1200 - (y - 600), -200 - x), intensity: k, front: 0.6, fill: 0.4 });

  EP33.wild = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {}, d = clamp(o.dawn || 0), hz = 1350;
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -800, hz, [[0, hex('#2a1a24', '#3a4a6a', d)], [0.6, hex('#8a4a2a', '#b8a0b0', d)], [1, hex('#e8a050', '#f0d0c0', d)]], -500, R.W + 500);
    const sx = d ? 900 : 160;
    KIT.glow(ctx, sx, hz - 80, 700, d ? '#ffe0d0' : '#ffb050', 0.6);
    ctx.fillStyle = hex('#ffd890', '#fff0e8', d); ctx.beginPath(); ctx.arc(sx, hz - 30, 70, Math.PI, 0); ctx.fill();
    ctx.fillStyle = hex('#4a2a1a', '#5a5060', d); ctx.beginPath(); ctx.moveTo(-500, hz); for (let x = -500; x <= 1600; x += 100) ctx.lineTo(x, hz - 40 - 50 * Math.abs(Math.sin(x * 0.005 + 2))); ctx.lineTo(1600, hz); ctx.fill();
    KIT.vgrad(ctx, hz, R.H + 700, [[0, hex('#a06a3a', '#8a7a80', d)], [0.3, hex('#5a3a20', '#4a4250', d)], [1, '#140a06']], -500, R.W + 500);
    // the dry riverbed: pale stones
    for (let k = 0; k < 30; k++) { const x = hash(k, 1) * 1500 - 200, y = hz + 60 + hash(k, 2) * 700; ctx.fillStyle = hex('#c89a6a', '#a8a0a8', d); ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.ellipse(x, y, 12 + 18 * hash(k, 3), 6 + 6 * hash(k, 4), 0, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    // thorn trees: black, spiky
    ctx.strokeStyle = '#1a0e08'; ctx.lineCap = 'round';
    for (const [x, y, s] of (o.trees || [[120, hz + 40, 1.1], [930, hz + 10, 0.8]])) {
      ctx.lineWidth = 16 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 10 * s, y - 300 * s); ctx.stroke();
      for (let b = 0; b < 6; b++) { const a = -Math.PI / 2 + (b - 2.5) * 0.45, l = (150 + 60 * hash(b, x)) * s; ctx.lineWidth = 7 * s; ctx.beginPath(); ctx.moveTo(x + 10 * s, y - (200 + b * 18) * s); ctx.lineTo(x + 10 * s + Math.cos(a) * l, y - (200 + b * 18) * s + Math.sin(a) * l); ctx.stroke(); }
      ctx.fillStyle = '#1a0e08'; ctx.beginPath(); ctx.ellipse(x + 10 * s, y - 420 * s, 200 * s, 50 * s, 0, 0, TAU); ctx.fill();
    }
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP33.pit = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {}, up = o.view !== 'down';
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    ctx.fillStyle = '#06050a'; ctx.fillRect(-500, -800, R.W + 1000, R.H + 1600);
    if (up) {
      // the mouth: a ragged opening at the top with the night sky and the moon
      KIT.vgrad(ctx, -800, 520, [[0, '#0a1430'], [1, '#2a3a6a']], 120, 960);
      ctx.fillStyle = '#e8f0ff'; ctx.beginPath(); ctx.arc(640, 180, 100, 0, TAU); ctx.fill(); KIT.glow(ctx, 640, 180, 500, '#c8dcff', 0.6);
    } else {
      KIT.glow(ctx, 540, 1900, 600, '#203050', 0.4);
    }
    // the shaft of light
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.16; ctx.fillStyle = '#c8dcff';
    ctx.beginPath(); ctx.moveTo(380, -800); ctx.lineTo(820, -800); ctx.lineTo(980, R.H + 700); ctx.lineTo(160, R.H + 700); ctx.closePath(); ctx.fill(); ctx.restore();
    // earth walls, ragged, with hanging roots
    for (const s of [-1, 1]) {
      ctx.fillStyle = '#1a120c'; ctx.beginPath(); ctx.moveTo(540 + s * 1100, -800);
      for (let y = -800; y <= R.H + 700; y += 70) ctx.lineTo(540 + s * (up && y < 520 ? 430 + 40 * hash(y, 3) : 330 + 60 * hash(y, s + 5) + (y > 1400 ? -40 : 0)), y);
      ctx.lineTo(540 + s * 1100, R.H + 700); ctx.fill();
      ctx.strokeStyle = '#2a1c12'; ctx.lineWidth = 4;
      for (let k = 0; k < 8; k++) { const y = 200 + k * 220, x = 540 + s * (340 + 40 * hash(k, s)); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - s * 40, y + 60, x - s * (30 + 10 * Math.sin(T + k)), y + 140); ctx.stroke(); }
    }
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP33.tuft = (ctx, x, y, s, T, o = {}) => {
    const gl = clamp(o.glow || 0), n = o.roots ?? 1;
    if (gl > 0) KIT.glow(ctx, x, y, 300 * s, '#ffe090', 0.7 * gl);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + (i - 7.5) * 0.09 + 0.03 * Math.sin(T * 1.2 + i); ctx.strokeStyle = R.mix('#7a8a4a', '#ffe090', gl); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(Math.cos(a) * 120, Math.sin(a) * 150, Math.cos(a) * 200, Math.sin(a) * 260 + 40); ctx.stroke(); }
    // roots: hanging down from the clump; the gnawed ones end in stubs
    for (let i = 0; i < 4; i++) { const rx = (i - 1.5) * 26, alive = i < n; ctx.strokeStyle = alive ? R.mix('#c8a870', '#ffd860', o.lastGold && i === 0 ? 1 : 0) : '#5a4a3a'; ctx.lineWidth = alive ? 9 : 6; ctx.beginPath(); ctx.moveTo(rx, 0); ctx.quadraticCurveTo(rx + 10, 60, rx + 4 * Math.sin(T + i), alive ? 160 : 50); ctx.stroke(); }
    ctx.restore();
  };

  EP33.rat = (ctx, x, y, s, T, o = {}) => {
    const g = clamp(o.gnaw ?? 1), j = g * Math.max(0, Math.sin(T * 18)) * 0.25;
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
    ctx.fillStyle = o.color || '#120c0a';
    ctx.beginPath(); ctx.ellipse(0, 0, 110, 60, -0.1, 0, TAU); ctx.fill();                      // body
    ctx.beginPath(); ctx.moveTo(70, -30); ctx.quadraticCurveTo(150, -40, 190, 0 - j * 40); ctx.quadraticCurveTo(140, 30, 70, 30); ctx.fill();   // head, snout right
    ctx.beginPath(); ctx.ellipse(95, -50, 22, 26, -0.3, 0, TAU); ctx.fill();                     // ear
    ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-100, 10); ctx.quadraticCurveTo(-220, 60 + 20 * Math.sin(T * 2), -300, 0); ctx.stroke();   // tail
    ctx.lineWidth = 10; for (const fx of [-60, 40]) { ctx.beginPath(); ctx.moveTo(fx, 40); ctx.lineTo(fx + 10, 70); ctx.stroke(); }
    ctx.fillStyle = '#ff6040'; ctx.beginPath(); ctx.arc(140, -18, 7, 0, TAU); ctx.fill();           // the eye, an ember
    ctx.fillStyle = '#f0e8d8'; ctx.fillRect(176, 4 - j * 30, 10, 14);                             // teeth
    ctx.restore();
  };

  EP33.hanging = (g, x, y, s, T, i, o = {}) => {
    g.save(); g.translate(x, y); g.rotate(Math.PI + 0.06 * Math.sin(T * 0.8 + i * 1.3));
    CH.pitr.draw(g, { x: 0, y: 0, scale: s, facing: 'front', index: i, pose: { name: 'stand' }, light: o.light || { dir: Math.PI / 2, intensity: 0.75, front: 0.5, fill: 0.3 }, alpha: (o.alpha ?? 1) * 0.5, t: T + i, key: (o.key || 'hg') + i });
    g.restore();
    void lerp;
  };
})();
