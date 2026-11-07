/*
 * Episode 36 · shared pieces (not a scene). Loads after ep31/_common (EPA), ep34/_common, ep35/_common.
 * NEW LIGHTS:
 *   EP36.birth(ctx, T, o)      THE BIRTH LIGHT: Vasuki's hall flooded with white-gold from the newborn (radial rays over the dawn
 *                              hall). o.k (0..1), o.cam, o.after(g)
 *   EP36.ashram(ctx, T, o)     A HERMITAGE OF BHRIGU'S LINE AT MORNING: green forest, a thatched hut, a sacred fire burning
 *                              ember-red, palm-leaf pages; o.cam, o.after(g)
 *   EP36.moons(ctx, T, o)      THE NIGHT SKY OVER THE SERPENT WORLD: deep blue, the moon in o.phase (0..1: crescent → full),
 *                              a rock in silhouette; o.cam, o.after(g)
 *   EP36.court(ctx, T, o)      JANAMEJAYA'S COURT AT NIGHT BY TORCHLIGHT (episode 6/8's court, re-lit blue-black with two
 *                              torch pools and a painted panel of Parikshit behind the throne); o.cam, o.after(g)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP6 = window.EP6;
  const { TAU, clamp, hash } = R;
  const CH = KIT.characters;
  const EP36 = (window.EP36 = {});

  EP36.birth = (ctx, T, o = {}) => {
    const k = clamp(o.k ?? 1);
    EPA.hall(ctx, T, { mood: 'dawn', cam: o.cam, after: (g) => {
      const c = o.center || [540, 1150];
      g.save(); g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU + T * 0.05; g.globalAlpha = 0.12 * k; g.fillStyle = '#fff4d0'; g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(c[0] + Math.cos(a - 0.05) * 1800, c[1] + Math.sin(a - 0.05) * 1800); g.lineTo(c[0] + Math.cos(a + 0.05) * 1800, c[1] + Math.sin(a + 0.05) * 1800); g.closePath(); g.fill(); }
      g.restore();
      KIT.glow(g, c[0], c[1], 900 * k, '#fff0c0', 0.6 * k);
      if (o.after) o.after(g);
    } });
  };

  EP36.ashram = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -800, 1300, [[0, '#a8d0c0'], [0.5, '#6aa080'], [1, '#3a6a3a']], -500, R.W + 500);
    for (let L = 0; L < 2; L++) { ctx.fillStyle = L ? '#2a5a2a' : '#4a7a4a'; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(-200 + i * 260 + L * 120, 700 + L * 200 + 60 * hash(i, L), 240 - L * 40, 0, TAU); ctx.fill(); } }
    // the hut
    ctx.fillStyle = '#5a3a1a'; ctx.fillRect(700, 1000, 300, 260); ctx.fillStyle = '#8a6a2a'; ctx.beginPath(); ctx.moveTo(660, 1010); ctx.lineTo(850, 820); ctx.lineTo(1040, 1010); ctx.fill();
    KIT.vgrad(ctx, 1260, R.H + 700, [[0, '#6a7a3a'], [0.3, '#4a5a2a'], [1, '#1a2010']], -500, R.W + 500);
    // the sacred fire
    const F = EP36.FIRE;
    KIT.glow(ctx, F.x, F.y - 60, 420, '#ff5020', 0.5 * KIT.flicker(T, 7));
    ctx.fillStyle = '#5a2a10'; ctx.fillRect(F.x - 90, F.y, 180, 40);
    for (let i = 0; i < 5; i++) { const ph = T * 2.4 + i, h = 130 + 50 * Math.sin(ph); ctx.fillStyle = i % 2 ? '#ff5a20' : '#ffb050'; const x = F.x + (i - 2) * 24; ctx.beginPath(); ctx.moveTo(x - 30, F.y); ctx.quadraticCurveTo(x, F.y - h, x + 30, F.y); ctx.fill(); }
    if (o.after) o.after(ctx);
    ctx.restore();
  };
  EP36.FIRE = { x: 540, y: 1260 };
  EP36.fireLit = (x, y, k = 1.1) => ({ dir: Math.atan2(EP36.FIRE.y - (y - 500), EP36.FIRE.x - x), intensity: k, front: 0.7, fill: 0.5 });

  EP36.moons = (ctx, T, o = {}) => {
    ctx.save();
    const cam = o.cam || {}, ph = clamp(o.phase ?? 1);
    KIT.camera(ctx, { x: 540, y: 1000, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    KIT.vgrad(ctx, -800, R.H + 700, [[0, '#020618'], [0.5, '#0a1a3a'], [1, '#04060e']], -500, R.W + 500);
    for (let k = 0; k < 60; k++) { ctx.globalAlpha = 0.4 + 0.4 * Math.sin(T + k * 3); ctx.fillStyle = '#e8f0ff'; ctx.beginPath(); ctx.arc(hash(k, 1) * 1400 - 160, hash(k, 2) * 1300 - 500, 2 + 2 * hash(k, 3), 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    const mx = 700, my = 420, mr = 150;
    KIT.glow(ctx, mx, my, 700, '#c8dcff', 0.25 + 0.35 * ph);
    ctx.fillStyle = '#f4f8ff'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
    // the shadow that wanes as the moon waxes
    ctx.fillStyle = '#0a1a3a'; ctx.beginPath(); ctx.ellipse(mx - mr * 2 * ph, my, mr * (1 + 0.1 * (1 - ph)), mr * 1.02, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#04060e'; ctx.beginPath(); ctx.moveTo(-500, R.H + 700); ctx.lineTo(-500, 1500); ctx.quadraticCurveTo(300, 1250, 560, 1300); ctx.quadraticCurveTo(800, 1360, 1600, 1500); ctx.lineTo(1600, R.H + 700); ctx.fill();
    if (o.after) o.after(ctx);
    ctx.restore();
  };

  EP36.court = (ctx, T, o = {}) => {
    EP6.court(ctx, T, { cam: o.cam, after: (g) => {
      g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#4a5070'; g.fillRect(-600, -900, R.W + 1200, R.H + 1800); g.restore();
      for (const tx of [150, 930]) { g.fillStyle = '#2a1408'; g.fillRect(tx - 10, 900, 20, 260); KIT.glow(g, tx, 880, 380, '#ffa040', 0.6 * KIT.flicker(T, tx)); g.fillStyle = '#ffc060'; g.beginPath(); g.moveTo(tx - 22, 900); g.quadraticCurveTo(tx, 820 - 20 * Math.sin(T * 7 + tx), tx + 22, 900); g.fill(); }
      // the painted panel of Parikshit behind the throne
      g.fillStyle = 'rgba(30,14,10,0.9)'; g.fillRect(380, 420, 320, 420); g.strokeStyle = '#c89a4a'; g.lineWidth = 6; g.strokeRect(380, 420, 320, 420);
      CH.parikshit.draw(g, { x: 540, y: 820, scale: 0.34, facing: 'left', pose: { name: 'stand' }, light: { dir: Math.PI / 2, intensity: 0.9, front: 0.5, fill: 0.3 }, t: 0, key: 'ct36-pk' });
      if (o.after) o.after(g);
    } });
  };
  EP36.torch = (x, y, k = 1.1) => ({ dir: Math.atan2(880 - (y - 500), (x < 540 ? 150 : 930) - x), intensity: k, front: 0.65, fill: 0.45 });
})();
