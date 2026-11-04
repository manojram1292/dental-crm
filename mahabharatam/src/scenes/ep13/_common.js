/*
 * Episode 13 · shared pieces (not a scene). Loads after ep11/ep12's _common.
 *
 * LOCATIONS AND LIGHT
 *   EP13.whiteSea(ctx, T, o)   THE WHITE SEA: the churned ocean turned to milk, lit from within:
 *                              a pearl sky, the water glowing up into every figure (EP13.seaGlow:
 *                              light from BELOW, a new key for this arc). o.ghee (0..1) gilds it,
 *                              o.whirl (0..1) a whirlpool at o.wx, o.dark (0..1) the poison's shadow.
 *   EP13.storm(ctx, T, o)      Indra's storm above the burning mountain: slate cloud banks,
 *                              lightning (o.flash), slanting silver rain (o.rain 0..1).
 *   EP13.sap(ctx, cx, y0, s, T, a)   golden streams of sap and herb-juice running down Mandara
 *   EP13.poison(ctx, x, y, T, k)     the black-blue smoke boiling up out of the sea (tradition)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11, EP12 = window.EP12;
  const { TAU, clamp, lerp, hash } = R;
  const EP13 = (window.EP13 = {});
  EP13.mouth = EP11.mouth; EP13.plaque = EP11.plaque;
  EP13.seaGlow = (x, y, k = 1.05) => ({ dir: Math.PI / 2 - (x - 540) * 0.0008, intensity: k, front: 0.55 });

  EP13.whiteSea = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const hz = o.hz ?? 1000, gh = clamp(o.ghee || 0), dk = clamp(o.dark || 0);
    const H = (a, b) => EP11.hex(a, b, gh);
    KIT.vgrad(ctx, -600, hz, [[0, EP11.hex(H('#3a3a6a', '#4a3a2a'), '#0a0a18', dk)], [0.6, EP11.hex(H('#a8a8d0', '#d8b880'), '#2a2a40', dk)], [1, EP11.hex(H('#fbfaff', '#fff4d8'), '#6a6a80', dk)]], -400, R.W + 400);
    KIT.glow(ctx, 540, hz, 1000, H('#ffffff', '#ffe8b0'), 0.7 * (1 - dk));
    KIT.vgrad(ctx, hz, R.H + 600, [[0, EP11.hex(H('#ffffff', '#fff0c8'), '#8a8aa0', dk)], [0.3, EP11.hex(H('#e8e8f6', '#f0d8a0'), '#4a4a60', dk)], [1, EP11.hex(H('#b8b8d8', '#c8a060'), '#1a1a28', dk)]], -400, R.W + 400);
    // slow rings of cream on the surface
    ctx.strokeStyle = EP11.hex(H('#ffffff', '#fff8e0'), '#9a9ab0', dk); ctx.lineWidth = 3;
    for (let i = 0; i < 16; i++) { const y = hz + 20 + Math.pow(i / 15, 1.5) * 900; ctx.globalAlpha = 0.5; for (let j = 0; j < 4; j++) { const x = ((j * 330 + i * 120 + T * (10 + i)) % 1700) - 300; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 70, y - 8, x + 150, y); ctx.stroke(); } }
    ctx.globalAlpha = 1;
    const wh = clamp(o.whirl || 0);
    if (wh > 0.01) {
      const wx = o.wx ?? 540, wy = o.wy ?? hz + 360;
      for (let i = 0; i < 9; i++) { ctx.globalAlpha = wh * (0.6 - i * 0.05); ctx.lineWidth = 6 - i * 0.4; ctx.beginPath(); ctx.ellipse(wx, wy, 60 + i * 50, 18 + i * 14, 0, T * (1.4 - i * 0.08) + i, T * (1.4 - i * 0.08) + i + 4.4); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP13.storm = (ctx, T, o = {}) => {
    const fl = clamp(o.flash || 0), rain = clamp(o.rain || 0);
    KIT.vgrad(ctx, 0, R.H, [[0, '#0e1220'], [0.5, '#22283c'], [1, '#3a3040']]);
    if (fl > 0.01) { ctx.save(); ctx.globalAlpha = fl * 0.6; ctx.fillStyle = '#dfe8ff'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore(); }
    for (let i = 0; i < 8; i++) window.EP5.cloud(ctx, ((i * 190 + T * 14) % 1500) - 200, 140 + (i % 4) * 130, 420, i * 5, EP11.hex('#3a4258', '#c8d4f0', fl), EP11.hex('#5a6280', '#ffffff', fl), 0.95);
    if (fl > 0.05) { ctx.save(); ctx.strokeStyle = '#f4f8ff'; ctx.lineWidth = 6; ctx.shadowColor = '#9ac0ff'; ctx.shadowBlur = R.px(20); ctx.globalAlpha = fl; ctx.beginPath(); let x = 760, y = 300; ctx.moveTo(x, y); for (let i = 0; i < 7; i++) { x += (hash(i, 91) - 0.5) * 120; y += 110; ctx.lineTo(x, y); } ctx.stroke(); ctx.restore(); }
    if (o.after) o.after(ctx);
    if (rain > 0.01) { ctx.save(); ctx.strokeStyle = '#cfdcff'; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.55 * rain; for (let i = 0; i < 180; i++) { const x = (hash(i, 1) * 1400 + T * 260) % 1400 - 200, y = (hash(i, 2) * 2100 + T * 1600) % 2100 - 100; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 26, y + 70); ctx.stroke(); } ctx.restore(); }
  };

  EP13.sap = (ctx, cx, y0, s, T, a = 1) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      const side = i % 2 ? 1 : -1, x0 = cx + side * (60 + hash(i, 3) * 220) * s, top = y0 - (300 + hash(i, 4) * 700) * s;
      const g = ctx.createLinearGradient(0, top, 0, y0);
      g.addColorStop(0, 'rgba(255,220,120,0)'); g.addColorStop(0.3, '#ffd870'); g.addColorStop(1, '#fff4c8');
      ctx.strokeStyle = g; ctx.lineWidth = (8 + 8 * hash(i, 5)) * s * 2;
      ctx.beginPath(); ctx.moveTo(x0, top);
      for (let k = 1; k <= 8; k++) { const u = k / 8; ctx.lineTo(x0 + side * u * u * 160 * s + Math.sin(u * 8 + T * 3 + i) * 6, lerp(top, y0, u)); }
      ctx.stroke();
      for (let d = 0; d < 3; d++) { const life = (T * 0.8 + d / 3 + hash(i, 6)) % 1; KIT.glow(ctx, x0 + side * life * life * 160 * s, lerp(top, y0, life), 30 * s * 2, '#fff0b0', 0.6 * (1 - life)); }
    }
    ctx.restore();
  };

  EP13.poison = (ctx, x, y, T, k) => {
    if (k <= 0.01) return;
    ctx.save();
    for (let i = 0; i < 26; i++) {
      const life = (T * 0.35 + hash(i, 11)) % 1, a = (hash(i, 12) - 0.5) * 2.2;
      const px = x + Math.sin(a) * life * 520 * k + Math.sin(T * 0.7 + i) * 30, py = y - life * 900 * k;
      const r = (60 + 160 * life) * (0.6 + 0.6 * k);
      ctx.globalAlpha = clamp(k * 1.3) * (0.75 - 0.5 * life);
      const g = ctx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, '#0a0c1e'); g.addColorStop(0.6, 'rgba(20,30,80,0.85)'); g.addColorStop(1, 'rgba(30,50,120,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.fill();
    }
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35 * k;
    for (let i = 0; i < 12; i++) { const life = (T * 0.5 + hash(i, 13)) % 1; KIT.glow(ctx, x + (hash(i, 14) - 0.5) * 500 * k, y - life * 700 * k, 50, '#3a6aff', 1 - life); }
    ctx.restore();
  };
  void EP12;
})();
