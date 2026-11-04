/*
 * Episode 17 · shared pieces (not a scene). Loads after ep05–ep16's _common; the Garuda arc
 * (episodes 18–20) reuses it.
 *
 * LOCATIONS AND LIGHT
 *   EP17.sunset(ctx, T, o)  THE SHORE AT SUNSET: the wager's light. A low gold sun at the right
 *                           over the white sea, long amber light, the sky banded rose to violet;
 *                           o.night (0..1) brings the night down. Light: EP17.sunLight.
 *   EP17.grove(ctx, T, o)   THE SERPENTS' GROVE AT NIGHT: great arching roots of a banyan, deep
 *                           green moonlight from above-left, glow-worms, mist on the ground.
 *                           Light: EP17.moonLight (cold green-white, from above).
 *   EP17.ocean(ctx, T, o)   the endless ocean at dawn seen from above the waves (for the flight),
 *                           o.deep (0..1) shows its depths: jewels and monsters below the surface.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11, EP15 = window.EP15;
  const { TAU, clamp, lerp, hash } = R;
  const EP17 = (window.EP17 = {});
  EP17.mouth = EP15.mouth; EP17.plaque = EP15.plaque;
  EP17.SUN = { x: 960, y: 1180 };
  EP17.sunLight = (x, y, k = 1.05) => ({ dir: Math.atan2(EP17.SUN.y - (y - 600), EP17.SUN.x - x), intensity: k, front: 0.42 });
  EP17.moonLight = (x, y, k = 1.0) => ({ dir: -Math.PI / 2 - 0.5, intensity: k, front: 0.35 });

  EP17.sunset = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const nt = clamp(o.night || 0), hz = 1200, S = EP17.SUN, sy = S.y + nt * 160;
    KIT.vgrad(ctx, -600, hz, [[0, EP11.hex('#2a1a4a', '#06061a', nt)], [0.5, EP11.hex('#8a3a5a', '#141432', nt)], [0.85, EP11.hex('#ff8a4a', '#2a2a4a', nt)], [1, EP11.hex('#ffd890', '#4a4a6a', nt)]], -400, R.W + 400);
    KIT.glow(ctx, S.x, sy, 900, '#ffb060', 0.7 * (1 - nt));
    ctx.fillStyle = EP11.hex('#fff0c0', '#4a4a6a', nt); ctx.beginPath(); ctx.arc(S.x, sy, 110, Math.PI, 0); ctx.fill();
    for (let i = 0; i < 5; i++) { ctx.globalAlpha = 0.6 * (1 - nt); ctx.fillStyle = '#ffc890'; ctx.fillRect(-400, 500 + i * 120 + Math.sin(i * 2 + T * 0.1) * 10, 1880, 10 + i * 4); }
    ctx.globalAlpha = 1;
    KIT.vgrad(ctx, hz, hz + 380, [[0, EP11.hex('#ffe0b0', '#3a3a5a', nt)], [1, EP11.hex('#a8708a', '#141428', nt)]], -400, R.W + 400);
    ctx.strokeStyle = EP11.hex('#fff0d0', '#5a5a7a', nt); ctx.lineWidth = 3;
    for (let i = 0; i < 10; i++) { const y = hz + 14 + i * 36; ctx.globalAlpha = 0.6; for (let j = 0; j < 4; j++) { const x = ((j * 330 + i * 140 + T * (8 + i)) % 1700) - 300; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 60, y - 6, x + 130, y); ctx.stroke(); } }
    ctx.globalAlpha = 1;
    // a glitter path on the water toward the sun
    for (let i = 0; i < 26; i++) { const y = hz + 10 + hash(i, 1) * 360, x = S.x + (hash(i, 2) - 0.5) * (60 + (y - hz) * 0.8); ctx.globalAlpha = (1 - nt) * (0.5 + 0.5 * Math.sin(T * 4 + i)); ctx.fillStyle = '#fff4d0'; ctx.fillRect(x - 14, y, 28, 3); }
    ctx.globalAlpha = 1;
    KIT.vgrad(ctx, hz + 370, R.H + 600, [[0, EP11.hex('#c8a078', '#3a3040', nt)], [0.2, EP11.hex('#7a5038', '#1a1420', nt)], [1, '#140a08']], -400, R.W + 400);
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP17.grove = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -600, R.H + 600, [[0, '#020806'], [0.4, '#06140e'], [0.8, '#0c2016'], [1, '#040a06']], -400, R.W + 400);
    KIT.glow(ctx, 260, 200, 900, '#9af0c0', 0.28);
    // shafts of moonlight
    ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#c8ffe0';
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(100 + i * 160, -400); ctx.lineTo(160 + i * 160, -400); ctx.lineTo(500 + i * 220, 2000); ctx.lineTo(360 + i * 220, 2000); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    // great banyan roots arching across the frame
    ctx.strokeStyle = '#0a160e'; ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const x0 = -200 + i * 230, w = 50 + 30 * hash(i, 4);
      ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, 2100); ctx.bezierCurveTo(x0 + 80, 1400, x0 - 120 + 240 * hash(i, 5), 600, x0 + 60, -400); ctx.stroke();
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(140,230,180,0.35)'; ctx.beginPath(); ctx.moveTo(x0 - w * 0.45, 2100); ctx.bezierCurveTo(x0 + 80 - w * 0.45, 1400, x0 - 120 + 240 * hash(i, 5) - w * 0.45, 600, x0 + 60 - w * 0.45, -400); ctx.stroke(); ctx.strokeStyle = '#0a160e';
    }
    // glow-worms
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 40; i++) { const x = hash(i, 7) * R.W + Math.sin(T * 0.7 + i) * 20, y = 300 + hash(i, 8) * 1500 + Math.cos(T * 0.5 + i) * 20; KIT.glow(ctx, x, y, 22, '#c8ff90', 0.6 * (0.5 + 0.5 * Math.sin(T * 2 + i * 3))); }
    ctx.restore();
    // ground mist
    KIT.vgrad(ctx, 1700, R.H + 600, [[0, 'rgba(120,200,160,0)'], [0.2, 'rgba(120,200,160,0.25)'], [1, 'rgba(10,30,20,0.9)']], -400, R.W + 400);
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP17.ocean = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const hz = o.hz ?? 700, dp = clamp(o.deep || 0);
    KIT.vgrad(ctx, -600, hz, [[0, '#2a3a6a'], [0.6, '#e8a0a0'], [1, '#ffe0b0']], -400, R.W + 400);
    KIT.glow(ctx, 700, hz, 700, '#fff0c8', 0.7);
    KIT.vgrad(ctx, hz, R.H + 600, [[0, '#c8d8f0'], [0.15, '#4a6aa8'], [0.6, '#1a2a6a'], [1, '#060a24']], -400, R.W + 400);
    ctx.strokeStyle = 'rgba(230,240,255,0.6)'; ctx.lineWidth = 3;
    for (let i = 0; i < 22; i++) { const y = hz + 10 + Math.pow(i / 21, 1.5) * 1300, w = 60 + i * 12; for (let j = 0; j < 5; j++) { const x = ((j * 300 + i * 97 + T * (40 + i * 6)) % 1800) - 400; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + w * 0.5, y - 6, x + w, y); ctx.stroke(); } }
    if (dp > 0.01) {
      for (let i = 0; i < 30; i++) { const x = hash(i, 11) * R.W, y = hz + 400 + hash(i, 12) * 1100, tw = 0.5 + 0.5 * Math.sin(T * 2.2 + i * 1.9); KIT.glow(ctx, x, y, 40 + 30 * tw, ['#ff6a8a', '#6affd8', '#ffe46a', '#8ab0ff'][i % 4], 0.55 * tw * dp); }
      EP11.makara(ctx, 300, 1500, 0.8, T, dp);
      EP11.makara(ctx, 860, 1250, 0.6, T + 2, dp * 0.8);
    }
    if (o.after) o.after(ctx);
    ctx.restore();
  };
  /** A sister in flight: the figure pitched forward about its waist, sari streaming (draw = CH.x.draw). */
  EP17.flyer = (g, draw, x, y, s, T, L, key, pitch = -0.9) => {
    g.save(); g.translate(x, y - 500 * s); g.rotate(pitch); g.translate(-x, -(y - 500 * s));
    draw(g, { x, y, scale: s, facing: 'left', pose: { name: 'walk', phase: 0.3, wind: 1.6 }, light: L, t: T, key });
    g.restore();
  };
  void TAU; void lerp;
})();
