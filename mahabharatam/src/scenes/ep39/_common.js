/*
 * Episode 39 · shared pieces (not a scene). Loads after ep31/_common (EPA), ep37/_common (EP37.blaze), ep08/_common (EP8).
 * NEW LIGHTS:
 *   EP39.heaven(ctx, T, o)    INDRA'S HEAVEN BY DAY UNDER A RUMOUR OF SMOKE: episode 8's white-gold heaven with a black smoke
 *                             band rising at the horizon and a red under-glow; o.cam, o.after(g)
 *   EP39.storm(ctx, T, o)     THE SKY OVER THE SACRIFICE: storm-black smoke lit from below, GOLD CHANT-ROPES (the mantras as
 *                             spiralling gold syllables) rising from the fire; o.ropes (0..1), o.cam, o.after(g)
 * PROPS:
 *   EP39.car(g, x, y, s, T, o)   Indra's aerial car (vimana): a white-gold canopy on a cloud base; o.tilt
 *   EP39.rings(g, x, y, r, T, a) the rings of gold light of Astika's "Stay!"
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP8 = window.EP8;
  const { TAU, clamp, hash } = R;
  const EP39 = (window.EP39 = {});
  EP39.skyLit = (x, y, k = 1.15) => ({ dir: -Math.PI / 2 - 0.3, intensity: k, front: 0.7, fill: 0.5 });
  EP39.fireLit = (x, y, k = 1.2) => ({ dir: Math.atan2(1500 - (y - 500), 540 - x), intensity: k, front: 0.75, fill: 0.5 });

  EP39.heaven = (ctx, T, o = {}) => {
    EP8.svarga(ctx, T, { cam: o.cam, after: (g) => {
      KIT.vgrad(g, 1100, 1700, [[0, 'rgba(20,8,6,0)'], [0.5, 'rgba(40,12,8,0.6)'], [1, 'rgba(90,20,10,0.75)']], -600, R.W + 600);
      for (let i = 0; i < 8; i++) { const x = -200 + i * 200 + 40 * Math.sin(T * 0.3 + i), y = 1500 - 80 * hash(i, 2); g.fillStyle = 'rgba(20,10,10,0.55)'; g.beginPath(); g.ellipse(x, y, 220, 120, 0, 0, TAU); g.fill(); }
      if (o.after) o.after(g);
    } });
  };

  EP39.storm = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {}, rp = clamp(o.ropes ?? 1);
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -800, R.H + 700, [[0, '#06040a'], [0.5, '#1a0a0a'], [0.85, '#5a1a0a'], [1, '#a03a10']], -500, R.W + 500);
    for (let i = 0; i < 14; i++) { const x = hash(i, 1) * 1500 - 200, y = hash(i, 2) * 2200 - 600 + Math.sin(T * 0.2 + i) * 30; ctx.fillStyle = `rgba(${30 + 40 * (y / 2000)},${14},${10},0.6)`; ctx.beginPath(); ctx.ellipse(x, y, 320, 180, 0, 0, TAU); ctx.fill(); }
    KIT.glow(ctx, 540, R.H + 300, 1200, '#ff5020', 0.5);
    // the chant-ropes: gold syllable dots spiralling up
    if (rp > 0) for (let k = 0; k < 3; k++) for (let j = 0; j < 40; j++) {
      const u = ((j / 40) + T * 0.25 + k / 3) % 1, y = R.H + 400 - u * 2600, x = 540 + Math.sin(u * 12 + k * 2.1 + T) * (120 + 200 * u);
      ctx.globalAlpha = rp * (1 - u) * 0.9; ctx.fillStyle = '#ffd860'; ctx.beginPath(); ctx.arc(x, y, 9 - 4 * u, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP39.car = (g, x, y, s, T, o = {}) => {
    g.save(); g.translate(x, y); g.rotate(o.tilt || 0); g.scale(s, s);
    KIT.glow(g, 0, -150, 420, '#fff0c0', 0.4);
    g.fillStyle = '#f4f0e0'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(-240 + i * 96, 20 + 14 * Math.sin(i), 80, 0, TAU); g.fill(); }
    g.fillStyle = '#e8c860'; g.fillRect(-220, -30, 440, 40);
    g.fillStyle = '#d8b040'; g.beginPath(); g.moveTo(-200, -360); g.quadraticCurveTo(0, -520, 200, -360); g.lineTo(220, -330); g.lineTo(-220, -330); g.closePath(); g.fill();
    g.fillRect(-200, -330, 16, 300); g.fillRect(184, -330, 16, 300);
    g.restore();
  };

  EP39.rings = (g, x, y, r, T, a) => {
    if (a <= 0.003) return;
    g.save(); g.strokeStyle = '#ffe080';
    for (let k = 0; k < 3; k++) { const u = (T * 0.6 + k / 3) % 1; g.globalAlpha = a * (1 - u); g.lineWidth = 8 * (1 - u) + 2; g.beginPath(); g.ellipse(x, y, r * (0.6 + u), r * 0.35 * (0.6 + u), 0, 0, TAU); g.stroke(); }
    g.restore();
  };
})();
