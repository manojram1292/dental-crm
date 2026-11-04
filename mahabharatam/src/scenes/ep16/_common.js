/*
 * Episode 16 · shared pieces (not a scene). Loads after ep11–ep15's _common.
 *
 * LOCATION AND LIGHT: THE SHORE IN BATTLE AT NIGHT (EP16.battle): a sky lit red from below by
 * fires along the shore, banks of smoke, streaks of weapons crossing it (o.streaks 0..1), the
 * dark salt sea; the key light is the fire-glow low on the horizon (EP16.fireLight), with the
 * discus's white-gold as a second light when it is up.
 *   EP16.peak(ctx, x, y, s, rot, T, a)   a hurled mountain peak (rock with a rim of fire-light)
 *   EP16.burst(ctx, x, y, k, T)           a peak split by an arrow: shards of light
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11, EP15 = window.EP15;
  const { TAU, clamp, lerp, hash } = R;
  const EP16 = (window.EP16 = {});
  EP16.mouth = EP15.mouth; EP16.plaque = EP15.plaque;
  EP16.fireLight = (x, y, k = 1.1) => ({ dir: Math.atan2(1250 - (y - 600), 540 - x) * 0.4 + Math.PI / 2 * 0.6, intensity: k, front: 0.45 });

  EP16.battle = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const hz = o.hz ?? 1250;
    KIT.vgrad(ctx, -600, hz, [[0, '#0a0610'], [0.5, '#2a0e14'], [0.85, '#8a2a14'], [1, '#e86a2a']], -400, R.W + 400);
    for (let i = 0; i < 9; i++) { const x = ((i * 230 + T * (10 + i)) % 1700) - 300, y = 200 + (i % 4) * 220; KIT.glow(ctx, x, y, 420, '#1a0a10', 0.5, 'source-over'); }
    const sk = clamp(o.streaks ?? 0.6);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (let i = 0; i < 22; i++) {
      const life = (T * (0.5 + hash(i, 1) * 0.5) + hash(i, 2)) % 1, dir = hash(i, 3) > 0.5 ? 1 : -1;
      const x = lerp(dir > 0 ? -200 : 1280, dir > 0 ? 1280 : -200, life), y = 150 + hash(i, 4) * 900 - Math.sin(Math.PI * life) * 120;
      ctx.strokeStyle = i % 3 ? '#ffb070' : '#fff0c0'; ctx.globalAlpha = sk * 0.7 * Math.sin(Math.PI * life); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - dir * 80, y + 10); ctx.stroke();
    }
    ctx.restore();
    // the sea and the burning shore line
    KIT.vgrad(ctx, hz, hz + 300, [[0, '#3a1a20'], [1, '#0c0812']], -400, R.W + 400);
    for (let i = 0; i < 12; i++) { const x = -100 + i * 110; KIT.glow(ctx, x, hz + 10, 160, '#ff7a2a', 0.5 + 0.2 * Math.sin(T * 5 + i)); }
    KIT.vgrad(ctx, hz + 280, R.H + 600, [[0, '#4a2a20'], [0.2, '#24140e'], [1, '#080406']], -400, R.W + 400);
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP16.peak = (ctx, x, y, s, rot, T, a = 1) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.fillStyle = '#1a1210'; ctx.strokeStyle = '#ffa060'; ctx.lineWidth = 6; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-160, 90); ctx.lineTo(-90, -40); ctx.lineTo(-40, -150); ctx.lineTo(20, -60); ctx.lineTo(70, -110); ctx.lineTo(160, 90); ctx.quadraticCurveTo(0, 140, -160, 90); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(90,150,80,0.6)'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-110 + i * 44, 40 - (i % 2) * 30, 16, 0, TAU); ctx.fill(); }
    ctx.restore();
  };

  EP16.burst = (ctx, x, y, k, T) => {
    if (k <= 0.01 || k >= 1) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    KIT.glow(ctx, x, y, 500 * (0.4 + k), '#fff0c0', 0.9 * (1 - k));
    for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU + hash(i, 5); const d = k * (240 + 160 * hash(i, 6)); ctx.fillStyle = i % 2 ? '#ffe0a0' : '#ff9a50'; ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d); ctx.lineTo(x + Math.cos(a + 0.1) * (d + 40), y + Math.sin(a + 0.1) * (d + 40)); ctx.lineTo(x + Math.cos(a - 0.1) * (d + 30), y + Math.sin(a - 0.1) * (d + 30)); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  };
  void EP11;
})();
