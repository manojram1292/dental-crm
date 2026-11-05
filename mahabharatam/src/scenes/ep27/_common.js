/*
 * Episode 27 · shared pieces (not a scene). Loads after ep26/_common (EP26.wheel, EP26.fireRing).
 * LOCATIONS, each with its own light:
 *   EP27.blaze(ctx, T, o)    THE INNER COURT ALL ON FIRE: a wall of flame floor to sky, the air orange-black; o.douse
 *                            (0..1) turns it to white steam; EP27.fireLight(x, y)
 *   EP27.vault(ctx, T, o)    THE AMRITA'S VAULT: a cold steel-blue chamber lit by the white pot and the wheel's glints;
 *                            EP27.steel(x, y)
 *   EP27.open(ctx, T, o)     THE OPEN SKY ABOVE HEAVEN at deep blue dusk, Narayana's light (o.vishnu 0..1)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP15 = window.EP15;
  const { TAU, clamp, lerp, hash } = R;
  const EP27 = (window.EP27 = {});
  EP27.mouth = window.EP17.mouth; EP27.plaque = window.EP17.plaque;
  EP27.fireLight = (x, y, k = 1.15) => ({ dir: Math.atan2(-200 - (y - 600), 540 - x), intensity: k, front: 0.6 });
  EP27.steel = (x, y, k = 1.1) => ({ dir: Math.atan2(900 - (y - 600), 540 - x), intensity: k, front: 0.55 });

  EP27.blaze = (ctx, T, o = {}) => {
    const d = clamp(o.douse || 0);
    KIT.vgrad(ctx, 0, R.H, [[0, R.mix('#1a0602', '#c8ccd4', d)], [0.6, R.mix('#6a1a06', '#e8ecf0', d)], [1, R.mix('#2a0a04', '#9aa0a8', d)]]);
    for (let i = 0; i < 22; i++) {
      const x = -60 + i * 56, h = (1200 + 500 * Math.sin(T * 3 + i * 1.3)) * (1 - d);
      for (const [c, w, f] of [['#a82008', 70, 1], ['#ff7a1a', 50, 0.8], ['#ffd870', 26, 0.55]]) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - w, R.H); ctx.quadraticCurveTo(x - w * 0.6, R.H - h * f * 0.6, x + Math.sin(T * 5 + i) * 30, R.H - h * f); ctx.quadraticCurveTo(x + w * 0.6, R.H - h * f * 0.6, x + w, R.H); ctx.fill(); }
    }
    if (d > 0) for (let i = 0; i < 30; i++) { const life = (T * 0.4 + hash(i, 1)) % 1; ctx.globalAlpha = 0.5 * d * (1 - life); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(hash(i, 2) * R.W, R.H - life * 1900, 180, 90, 0, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    if (o.after) o.after(ctx);
  };

  EP27.vault = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -600, R.H + 600, [[0, '#04060e'], [0.5, '#141e34'], [1, '#06080e']], -500, R.W + 500);
    for (let i = 0; i < 7; i++) { const x = -300 + i * 280; ctx.fillStyle = '#0c1220'; ctx.fillRect(x - 40, -600, 80, R.H + 1200); ctx.fillStyle = 'rgba(160,190,255,0.12)'; ctx.fillRect(x - 40, -600, 6, R.H + 1200); }
    KIT.glow(ctx, 540, 900, 900, '#c8dcff', 0.35, 'lighter', 0.4);
    if ((o.pot ?? 1) > 0.01) EP15.potGlow(ctx, 540, 900, 0.9, o.pot ?? 1);
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP27.open = (ctx, T, o = {}) => {
    KIT.vgrad(ctx, 0, R.H, [[0, '#060a2a'], [0.55, '#1a2a6a'], [1, '#6a7ac0']]);
    for (let i = 0; i < 70; i++) { ctx.globalAlpha = 0.5 * hash(i, 1); ctx.fillStyle = '#fff'; ctx.fillRect(hash(i, 2) * R.W, hash(i, 3) * 1400, 2, 2); }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 10; i++) { ctx.fillStyle = 'rgba(200,210,255,0.18)'; ctx.beginPath(); ctx.ellipse(hash(i, 4) * R.W, 1500 + hash(i, 5) * 400, 300, 60, 0, 0, TAU); ctx.fill(); }
    const v = clamp(o.vishnu || 0);
    if (v > 0) KIT.glow(ctx, o.vx ?? 380, o.vy ?? 800, 900 * v, '#6aa0ff', 0.6 * v, 'lighter', 0.4);
    if (o.after) o.after(ctx);
  };
  void lerp;
})();
