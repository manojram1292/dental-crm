/*
 * Episode 34 · shared pieces (not a scene). Loads after ep31/_common (EPA) and ep33/_common (EP33.wild for the road).
 * NEW LIGHTS:
 *   EP34.forest(ctx, T, o)    THE DEEP FOREST IN GREEN-GOLD SHAFTS: tall trunks, a high canopy, slanting gold light, motes;
 *                             o.rings (array of 0..1: the expanding rings of light of the three calls), o.cam, o.after(g)
 *   EP34.chamber(ctx, T, o)   THEIR CHAMBER IN VASUKI'S PALACE AT EVENING: violet walls, an arched window shaft high on the
 *                             left, one lamp; o.sun (0..1: a red-gold sunset shaft crawls across the floor), o.cam, o.after(g)
 *   (the wedding uses EPA.hall with mood 'gold': the hall's first wedding light)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA;
  const { TAU, clamp, hash, lerp } = R;
  const EP34 = (window.EP34 = {});
  EP34.shaft = (x, y, k = 1.1) => ({ dir: Math.atan2(-600 - (y - 600), 900 - x), intensity: k, front: 0.65, fill: 0.45 });
  EP34.lamp = (x, y, lx, ly, k = 1.05) => ({ dir: Math.atan2(ly - (y - 500), lx - x), intensity: k, front: 0.7, fill: 0.45 });

  EP34.forest = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -800, R.H + 700, [[0, '#0e2410'], [0.4, '#2a4a1a'], [0.7, '#3a5a20'], [1, '#0a1406']], -500, R.W + 500);
    // shafts of gold light from the upper right
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) { ctx.globalAlpha = 0.09 + 0.04 * Math.sin(T * 0.7 + i); ctx.fillStyle = '#ffe080'; const x = 300 + i * 220; ctx.beginPath(); ctx.moveTo(x + 400, -800); ctx.lineTo(x + 500, -800); ctx.lineTo(x - 300, R.H + 700); ctx.lineTo(x - 500, R.H + 700); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    for (let L = 0; L < 3; L++) {
      ctx.fillStyle = ['#2a3a18', '#1a2810', '#0a1206'][L];
      for (let i = 0; i < 5; i++) { const x = -150 + i * 300 + L * 110 + 50 * hash(i, L), w = 50 + L * 40; ctx.fillRect(x - w / 2, -800, w, 2700); }
      ctx.fillStyle = ['#3a5a20', '#2a4818', '#14240a'][L];
      for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(-200 + i * 260 + L * 80, -300 + L * 120 + 60 * hash(i, L + 3), 260, 160, 0, 0, TAU); ctx.fill(); }
    }
    KIT.vgrad(ctx, 1500, R.H + 700, [[0, '#2a3a14'], [1, '#0a1206']], -500, R.W + 500);
    for (let k = 0; k < 26; k++) { const y = ((hash(k, 2) * 2200 + T * 30) % 2200) - 300, x = hash(k, 1) * 1100; ctx.globalAlpha = 0.5 * (0.5 + 0.5 * Math.sin(T * 2 + k)); ctx.fillStyle = '#fff0a0'; ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    for (const [k, rv] of (o.rings || []).entries()) { if (rv <= 0 || rv >= 1) continue; ctx.strokeStyle = `rgba(255,240,180,${0.6 * (1 - rv)})`; ctx.lineWidth = 10 * (1 - rv) + 2; ctx.beginPath(); ctx.ellipse(o.ringAt?.[0] ?? 540, o.ringAt?.[1] ?? 900, 60 + rv * 900, 30 + rv * 450, 0, 0, TAU); ctx.stroke(); void k; }
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP34.chamber = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {}, sun = clamp(o.sun || 0);
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -800, 1500, [[0, '#0e0820'], [0.6, '#241640'], [1, '#3a2458']], -500, R.W + 500);
    // carved wall: hooded niches
    ctx.fillStyle = '#1a1030';
    for (let i = 0; i < 5; i++) { const x = 60 + i * 240; ctx.beginPath(); ctx.moveTo(x - 70, 1500); ctx.lineTo(x - 70, 760); ctx.bezierCurveTo(x - 110, 620, x + 110, 620, x + 70, 760); ctx.lineTo(x + 70, 1500); ctx.fill(); }
    // the high window
    ctx.fillStyle = R.mix('#3a3a6a', '#ff9a50', sun); ctx.beginPath(); ctx.moveTo(60, 520); ctx.lineTo(60, 300); ctx.quadraticCurveTo(160, 180, 260, 300); ctx.lineTo(260, 520); ctx.fill();
    KIT.vgrad(ctx, 1500, R.H + 700, [[0, '#2a1a3a'], [1, '#0a0614']], -500, R.W + 500);
    if (sun > 0) {
      // the red-gold shaft crawling across the floor toward the right
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35 * sun; ctx.fillStyle = '#ff8a40';
      const reach = lerp(300, 900, sun);
      ctx.beginPath(); ctx.moveTo(60, 520); ctx.lineTo(260, 520); ctx.lineTo(reach + 260, 1900); ctx.lineTo(reach - 140, 1900); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 0.5 * sun; ctx.beginPath(); ctx.ellipse(reach + 60, 1880, 260, 60, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
    // the lamp
    const lx = o.lampX ?? 860, ly = o.lampY ?? 1560;
    ctx.fillStyle = '#2a1808'; ctx.fillRect(lx - 14, ly, 28, 70); KIT.glow(ctx, lx, ly - 20, 300, '#ffc060', 0.6 * KIT.flicker(T, 5)); ctx.fillStyle = '#ffe8a0'; ctx.beginPath(); ctx.ellipse(lx, ly - 14, 9, 22, 0, 0, TAU); ctx.fill();
    if (o.after) o.after(ctx);
    ctx.restore();
  };
})();
