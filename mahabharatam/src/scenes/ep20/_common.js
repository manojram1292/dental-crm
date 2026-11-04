/*
 * Episode 20 · shared pieces (not a scene).
 *   EP20.carrier(ctx, x, y, s, T, o)   Garuda in flight with the serpents coiled on his back (o.faint
 *                                       0..1 droops and dims them; o.blaze; o.key)
 *   EP20.island(ctx, T, o)              RAMANIYAKA: a green island in the bright noon sea, palms and
 *                                       a white beach; clear tropical light from high above (EP20.noon)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17;
  const { TAU, clamp, lerp, hash } = R;
  const CH = KIT.characters;
  const EP20 = (window.EP20 = {});
  EP20.mouth = EP17.mouth; EP20.plaque = EP17.plaque;
  EP20.noon = (x, y, k = 1.1) => ({ dir: -Math.PI / 2 - 0.2, intensity: k, front: 0.5 });
  EP20.carrier = (ctx, x, y, s, T, o = {}) => {
    const fa = clamp(o.faint || 0), L = o.light || { dir: -0.7, intensity: 1.1, front: 0.5 };
    CH.garuda.draw(ctx, { x, y, scale: s, facing: o.facing || 'left', pose: { name: 'fly', phase: T * 4, blaze: o.blaze || 0 }, light: L, t: T, key: (o.key || 'car') + '-ga' });
    const sx = o.facing === 'right' ? -1 : 1;
    for (let i = 0; i < 4; i++) {
      const bx = x + sx * (60 + i * 70) * s, by = y - (760 - i * 40) * s;
      CH.naga.draw(ctx, { x: bx, y: by, scale: s * 0.32, facing: o.facing || 'left', index: i, pose: { name: 'rise', k: lerp(0.8, 0.15, fa) }, light: { ...L, intensity: lerp(1, 0.5, fa) }, t: T + i, key: (o.key || 'car') + '-n' + i });
    }
  };
  EP20.island = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -600, 1100, [[0, '#2a6ab8'], [0.7, '#8ac8f0'], [1, '#e8f6ff']], -400, R.W + 400);
    for (let i = 0; i < 4; i++) window.EP5.cloud(ctx, ((i * 320 + T * 10) % 1600) - 250, 200 + i * 120, 320, i * 9, '#ffffff', '#c8e0f8', 0.9);
    KIT.vgrad(ctx, 1100, R.H + 600, [[0, '#7ad8e0'], [0.3, '#2a9ab8'], [1, '#0a3a6a']], -400, R.W + 400);
    // the island: a green hump with palms and a white beach
    ctx.fillStyle = '#f4e8c8'; ctx.beginPath(); ctx.ellipse(540, 1290, 560, 70, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2a7a3a'; ctx.beginPath(); ctx.moveTo(60, 1280); ctx.quadraticCurveTo(300, 1000, 540, 1040); ctx.quadraticCurveTo(820, 980, 1020, 1280); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 9; i++) { const x = 150 + i * 100, y = 1180 - Math.sin(i / 8 * Math.PI) * 150; ctx.strokeStyle = '#3a2a14'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x, y + 80); ctx.quadraticCurveTo(x + 10, y + 30, x + 4, y - 40); ctx.stroke(); ctx.fillStyle = '#1e5a2a'; for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * 0.6; ctx.beginPath(); ctx.ellipse(x + 4 + Math.cos(a) * 40, y - 40 + Math.sin(a) * 26, 46, 12, a, 0, TAU); ctx.fill(); } }
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(540, 1300, 600, 90, 0, 0.1, Math.PI - 0.1); ctx.stroke();
    for (let i = 0; i < 20; i++) { const x = hash(i, 3) * R.W, y = 1400 + hash(i, 4) * 500; ctx.globalAlpha = 0.6 * (0.5 + 0.5 * Math.sin(T * 3 + i)); ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, 30, 3); }
    ctx.globalAlpha = 1;
    if (o.after) o.after(ctx);
    ctx.restore();
  };
})();
