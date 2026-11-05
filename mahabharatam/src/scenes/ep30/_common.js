/*
 * Episode 30 · shared pieces (not a scene). Loads after ep20/_common, ep17/_common, ep15/_common, ep08/_common.
 * LOCATIONS, each with its own light:
 *   EP30.dawnIsle(ctx, T, o)  RAMANIYAKA AT DAWN: a pink sky, pale-green palms, mist lying on the lagoon; soft light
 *                             from the low left (the east); EP30.dawn(x, y)
 *   EP30.kusha(ctx, x, y, s, T, o)   a bed of kusha grass: long sharp blades, dew; o.glow (0..1) its gold after the amrita
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, hash } = R;
  const EP30 = (window.EP30 = {});
  EP30.mouth = window.EP17.mouth; EP30.plaque = window.EP17.plaque;
  EP30.dawn = (x, y, k = 1.1) => ({ dir: Math.atan2(1100 - (y - 600), -300 - x), intensity: k, front: 0.6 });

  EP30.dawnIsle = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -700, 1250, [[0, '#4a5a9a'], [0.5, '#e8a0b0'], [1, '#ffe0c0']], -500, R.W + 500);
    KIT.glow(ctx, -100, 1200, 900, '#ffc0a0', 0.6, 'lighter', 0.4);
    for (let i = 0; i < 8; i++) { const x = -250 + i * 230, h = 520 + 180 * hash(i, 2); ctx.strokeStyle = '#7a8a70'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x, 1260); ctx.quadraticCurveTo(x + 14, 1260 - h * 0.5, x + 30 * Math.sin(i), 1260 - h); ctx.stroke(); ctx.fillStyle = '#a8c098'; for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.6 + 0.04 * Math.sin(T + i + k); ctx.beginPath(); ctx.ellipse(x + 30 * Math.sin(i) + Math.cos(a) * 70, 1260 - h + Math.sin(a) * 40 + 30, 80, 16, a, 0, TAU); ctx.fill(); } }
    KIT.vgrad(ctx, 1250, R.H + 600, [[0, '#c8d8c8'], [0.15, '#8ab8b8'], [1, '#2a5a6a']], -500, R.W + 500);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(255,240,240,0.35)'; ctx.beginPath(); ctx.ellipse((hash(i, 5) * 1600 - 260 + T * 10) % 1600 - 260, 1300 + i * 40, 420, 30, 0, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#f0e0c8'; ctx.beginPath(); ctx.ellipse(540, 1600, 900, 160, 0, Math.PI, TAU); ctx.lineTo(1440, R.H + 600); ctx.lineTo(-360, R.H + 600); ctx.fill();
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP30.kusha = (ctx, x, y, s, T, o = {}) => {
    const gl = clamp(o.glow || 0);
    if (gl > 0) KIT.glow(ctx, x, y - 60 * s, 380 * s, '#ffe090', 0.6 * gl);
    for (let i = 0; i < 40; i++) {
      const bx = x + (hash(i, 1) - 0.5) * 520 * s, h = (160 + 160 * hash(i, 2)) * s, lean = (hash(i, 3) - 0.5) * 0.6 + 0.05 * Math.sin(T * 1.5 + i);
      ctx.fillStyle = R.mix(i % 3 ? '#6a9a3a' : '#8ab048', '#f0d070', gl * 0.6);
      ctx.beginPath(); ctx.moveTo(bx - 5 * s, y); ctx.quadraticCurveTo(bx + lean * h * 0.4, y - h * 0.6, bx + lean * h, y - h); ctx.quadraticCurveTo(bx + lean * h * 0.4 + 4 * s, y - h * 0.6, bx + 5 * s, y); ctx.fill();
      if (i % 5 === 0) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(bx + lean * h * 0.7, y - h * 0.75, 4 * s, 0, TAU); ctx.fill(); }
    }
  };
  void lerp;
})();
