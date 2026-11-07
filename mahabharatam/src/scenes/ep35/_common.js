/*
 * Episode 35 · shared pieces (not a scene). Loads after ep31/_common (EPA), ep34/_common (EP34.chamber, EP34.sleep).
 * NEW LIGHTS:
 *   EP35.sandhya(ctx, T, o)   THE WORLD ABOVE AT THE SANDHYA HOUR: the red sun disc touching a forest horizon, a crimson-to-
 *                             indigo sky, birds going home; o.sink (0..1), o.cam, o.after(g)
 *   EP35.night(ctx, T, o)     THE CHAMBER AT NIGHT, ONE LAMP: EP34.chamber darkened to blue-black, the lamp the only light
 *   EP35.flame(ctx, x, y, s, T, a)   the small gold flame of the promised child (the word "asti" made visible)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP34 = window.EP34;
  const { TAU, clamp, hash } = R;
  const EP35 = (window.EP35 = {});
  EP35.red = (x, y, k = 1.1) => ({ dir: Math.atan2(560 - (y - 600), -200 - x), intensity: k, front: 0.65, fill: 0.45 });

  EP35.sandhya = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {}, s = clamp(o.sink ?? 0.5), hz = 1250;
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -800, hz, [[0, '#0a0a2a'], [0.5, '#4a1a3a'], [0.8, '#c03a2a'], [1, '#ff8a3a']], -500, R.W + 500);
    const sy = hz - 150 + s * 120;
    KIT.glow(ctx, 540, sy, 800, '#ff6030', 0.6);
    ctx.fillStyle = '#ffd0a0'; ctx.beginPath(); ctx.arc(540, sy, 130, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ff7a40'; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(540, sy, 130, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    // forest horizon in silhouette
    ctx.fillStyle = '#1a0810'; ctx.beginPath(); ctx.moveTo(-500, R.H + 700); ctx.lineTo(-500, hz);
    for (let x = -500; x <= 1600; x += 40) ctx.lineTo(x, hz - 30 - 60 * Math.abs(Math.sin(x * 0.02)) - 40 * hash(x, 2));
    ctx.lineTo(1600, R.H + 700); ctx.fill();
    for (let i = 0; i < 9; i++) { const u = (T * 0.05 + i / 9) % 1, x = 200 + u * 700 + i * 20, y = 600 + 80 * Math.sin(i) - u * 200; ctx.strokeStyle = '#1a0810'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 18, y + 8 * Math.sin(T * 10 + i)); ctx.lineTo(x, y); ctx.lineTo(x + 18, y + 8 * Math.sin(T * 10 + i)); ctx.stroke(); }
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP35.night = (ctx, T, o = {}) => {
    EP34.chamber(ctx, T, { ...o, after: (g) => { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#4a5a8a'; g.fillRect(-600, -900, R.W + 1200, R.H + 1800); g.restore(); KIT.glow(g, o.lampX ?? 860, (o.lampY ?? 1560) - 20, 380, '#ffc060', 0.5 * KIT.flicker(T, 5)); if (o.after) o.after(g); } });
  };

  EP35.flame = (ctx, x, y, s, T, a) => {
    if (a <= 0.003) return;
    ctx.save(); ctx.globalAlpha = a;
    KIT.glow(ctx, x, y, 160 * s, '#ffd060', 0.8);
    ctx.fillStyle = '#ffe8a0'; ctx.beginPath(); ctx.moveTo(x - 22 * s, y + 10 * s); ctx.quadraticCurveTo(x - 20 * s, y - 30 * s, x + 4 * s * Math.sin(T * 7), y - 60 * s); ctx.quadraticCurveTo(x + 20 * s, y - 30 * s, x + 22 * s, y + 10 * s); ctx.quadraticCurveTo(x, y + 26 * s, x - 22 * s, y + 10 * s); ctx.fill();
    ctx.restore();
  };
})();
