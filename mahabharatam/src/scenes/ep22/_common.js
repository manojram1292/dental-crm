/*
 * Episode 22 · shared pieces (not a scene). Loads after ep21/_common (EP21.bay, EP21.coal, EP21.moon).
 * LOCATIONS, each with its own light:
 *   EP22.dusty(ctx, T, o)   the bay UNDER A STORM OF DUST: the moon dimmed to a copper coin, an ochre-grey haze
 *                           over the teal water, dust whirling (o.dust 0..1); the light goes warm and low
 *   EP22.peak(ctx, T, o)    a HIGH MOUNTAIN HERMITAGE AT DAWN: cold blue snow ridges, a rose sky, a ledge of rock
 *                           with a small fire and a tree; EP22.dawn(x, y) lights a figure from the rose east (left)
 *   EP22.lake(ctx, T, o)    the LAKE OF THE BROTHERS (episode 23's place, seen first in the vision): olive water
 *                           under a storm-green sky, reeds, spray thrown up by the fight (o.spray 0..1)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP21 = window.EP21;
  const { TAU, clamp, hash } = R;
  const EP22 = (window.EP22 = {});
  EP22.mouth = window.EP17.mouth; EP22.plaque = window.EP17.plaque;
  EP22.dawn = (x, y, k = 1.05) => ({ dir: Math.atan2(700 - (y - 600), -300 - x), intensity: k, front: 0.55 });

  EP22.dusty = (ctx, T, o = {}) => {
    const d = clamp(o.dust ?? 1);
    EP21.bay(ctx, T, { ...o, after: (g) => {
      if (o.after) o.after(g);
      g.save();
      g.fillStyle = `rgba(150,110,70,${0.38 * d})`; g.fillRect(-500, -600, R.W + 1000, R.H + 1200);
      for (let i = 0; i < 40; i++) {
        const a = hash(i, 1) * TAU + T * (0.4 + hash(i, 2) * 0.6), rr = 200 + hash(i, 3) * 700;
        const x = 540 + Math.cos(a) * rr * 1.2, y = 1100 + Math.sin(a) * rr * 0.5;
        g.globalAlpha = 0.25 * d; g.fillStyle = i % 3 ? '#b89060' : '#d8b080';
        g.beginPath(); g.ellipse(x, y, 90 + 80 * hash(i, 4), 22 + 14 * hash(i, 5), a + Math.PI / 2, 0, TAU); g.fill();
      }
      g.restore();
    } });
  };

  EP22.peak = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -500, 1300, [[0, '#1a2448'], [0.45, '#5a5a8a'], [0.75, '#e0909a'], [1, '#ffd0b0']], -400, R.W + 400);
    KIT.glow(ctx, -200, 1150, 900, '#ffb0a0', 0.6, 'lighter', 0.35);
    // snow ridges
    const ridge = (y0, amp, col, seed) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-500, R.H + 400); for (let x = -500; x <= R.W + 500; x += 60) ctx.lineTo(x, y0 - amp * Math.abs(Math.sin(x * 0.004 + seed)) - 40 * hash(Math.round(x), seed)); ctx.lineTo(R.W + 500, R.H + 400); ctx.fill(); };
    ridge(1050, 380, '#9aa8d0', 1); ridge(1180, 260, '#6a76a8', 2);
    ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = '#ffe8e0'; for (let i = 0; i < 6; i++) { const x = 60 + i * 190; ctx.beginPath(); ctx.moveTo(x - 60, 820 + (i % 2) * 40); ctx.lineTo(x, 700 + (i % 2) * 40); ctx.lineTo(x + 60, 820 + (i % 2) * 40); ctx.fill(); } ctx.restore();
    // the ledge
    ctx.fillStyle = '#2a2436'; ctx.beginPath(); ctx.moveTo(-500, 1400); ctx.quadraticCurveTo(300, 1330, 1600, 1420); ctx.lineTo(1600, R.H + 500); ctx.lineTo(-500, R.H + 500); ctx.fill();
    ctx.fillStyle = '#3a3048'; ctx.fillRect(-500, 1420, R.W + 1000, 12);
    // a twisted pine on the ledge, a small fire
    ctx.strokeStyle = '#1a1420'; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(960, 1420); ctx.quadraticCurveTo(900, 1200, 990, 1000); ctx.stroke();
    ctx.fillStyle = '#1e2a2a'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(990 - i * 30 + Math.sin(T + i) * 4, 1000 + i * 70, 150 - i * 20, 40, -0.2, 0, TAU); ctx.fill(); }
    const fl = KIT.flicker(T, 2); KIT.glow(ctx, 760, 1410, 160, '#ff9040', 0.5 * fl); ctx.fillStyle = '#ffb050'; ctx.beginPath(); ctx.ellipse(760, 1400, 14, 30 * fl, 0, 0, TAU); ctx.fill();
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP22.lake = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {}, sp = clamp(o.spray || 0);
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -500, 1100, [[0, '#1a2418'], [0.6, '#4a5a30'], [1, '#a8a060']], -400, R.W + 400);
    KIT.glow(ctx, 300, 1000, 600, '#e0d080', 0.35, 'lighter', 0.4);
    ctx.fillStyle = '#2a3420'; ctx.beginPath(); ctx.moveTo(-500, 1100); for (let x = -500; x <= R.W + 500; x += 80) ctx.lineTo(x, 1040 - 60 * Math.abs(Math.sin(x * 0.006)) - 30 * hash(Math.round(x), 4)); ctx.lineTo(R.W + 500, 1100); ctx.fill();
    KIT.vgrad(ctx, 1090, R.H + 500, [[0, '#7a8040'], [0.3, '#4a5228'], [1, '#141a0c']], -400, R.W + 400);
    for (let i = 0; i < 30; i++) { ctx.globalAlpha = 0.4; ctx.fillStyle = '#d8d890'; ctx.fillRect((hash(i, 6) * 1800 - 360 + T * 8) % 1800 - 360, 1110 + hash(i, 7) * 700, 50, 3); }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 26; i++) { const x = hash(i, 8) * 1700 - 300, h = 120 + hash(i, 9) * 160; ctx.strokeStyle = '#1e2a12'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, 1110 + (i % 3) * 10); ctx.quadraticCurveTo(x + 10 + Math.sin(T + i) * 10, 1110 - h * 0.5, x + 18 + Math.sin(T * 1.2 + i) * 16, 1110 - h); ctx.stroke(); }
    if (o.after) o.after(ctx);
    if (sp > 0) { for (let i = 0; i < 30; i++) { const life = (T * 0.9 + hash(i, 11)) % 1, a = hash(i, 12) * Math.PI - Math.PI; const x = 540 + Math.cos(a) * 500 * life, y = 1250 + Math.sin(a) * 450 * life + 600 * life * life; ctx.globalAlpha = sp * 0.7 * (1 - life); ctx.fillStyle = '#eef4d0'; ctx.beginPath(); ctx.arc(x, y, 10 + 14 * hash(i, 13), 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
    ctx.restore();
  };
})();
