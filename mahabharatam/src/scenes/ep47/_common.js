/* Episodes 47–50 · shared (not a scene): EP47.island (an island in a river in mist: the poet's birthplace), EP47.strip (the
 * strip of small bright panels of the one-breath summary). Loads after ep41/_common. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage;
  const { TAU } = R;
  const EP47 = (window.EP47 = {});
  EP47.island = (ctx, T, cam, pal, figs, o = {}) => ST.shot(ctx, T, { pal, cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1050, sun: o.sun }) },
    { z: 0.2, draw: (g, p) => ST.hills(g, p, { y: 1050, h: 260, seed: 61 }) },
    { z: 0.4, draw: (g, p) => { ST.treeline(g, p, { y: 1070, h: 300, T, seed: 63, kind: 'mixed' }); ST.water(g, p, { y0: 1070, y1: 2000, T, flow: 46, count: 90 }); } },
    { z: 0.7, haze: false, draw: (g) => ST.mist(g, T, { y: 1090, h: 300, alpha: o.mist ?? 0.55 }) },
    { z: 1, haze: false, draw: (g, p) => { g.fillStyle = KIT.hex(p.near, '#000000', 0.35); g.beginPath(); g.moveTo(90, 1340); g.quadraticCurveTo(300, 1230, 540, 1250); g.quadraticCurveTo(800, 1230, 990, 1340); g.closePath(); g.fill(); g.beginPath(); g.ellipse(540, 1340, 450, 40, 0, 0, TAU); g.fill(); g.fillStyle = KIT.hex(p.near, '#000000', 0.3); g.beginPath(); g.ellipse(540, 1350, 430, 54, 0, 0, Math.PI); g.fill();
      ST.grass(g, p, { y: 1300, h: 150, T, count: 26, x0: 180, x1: 900, color: p.near }); figs(g, p); } },
    { z: 1.5, haze: false, draw: (g) => ST.mist(g, T, { y: 1500, h: 360, alpha: (o.mist ?? 0.55) * 0.8 }) },
    { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => ST.grass(g, p, { y: 1980, h: 380, T, count: 30 }) },
  ] });
  const PANELS = [['#e8c8a0', 'five'], ['#c8401a', 'fire'], ['#7a2a8a', 'dice'], ['#2a6a3a', 'forest'], ['#5a6a8a', 'field']];
  EP47.strip = (g, T, y, h, speed, a) => { if (a <= 0) return; g.save(); g.globalAlpha = a; g.beginPath(); g.rect(-200, y, 1500, h); g.clip();
    for (let i = -1; i < 7; i++) { const w = 360, x = ((i * (w + 26) - T * speed) % (5 * (w + 26)) + 5 * (w + 26)) % (5 * (w + 26)) - w, [c, kind] = PANELS[((i % 5) + 5) % 5];
      g.fillStyle = c; g.fillRect(x, y + 14, w, h - 28); g.strokeStyle = '#ffe08a'; g.lineWidth = 6; g.strokeRect(x, y + 14, w, h - 28); g.fillStyle = 'rgba(20,8,4,0.85)';
      if (kind === 'five') for (let q = 0; q < 5; q++) { g.beginPath(); g.ellipse(x + 60 + q * 60, y + h - 110, 20, 70, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(x + 60 + q * 60, y + h - 200, 18, 0, TAU); g.fill(); }
      if (kind === 'fire') { g.fillRect(x + 90, y + h * 0.45, 180, h * 0.4); g.fillStyle = '#ffd070'; for (let q = 0; q < 4; q++) { g.beginPath(); g.moveTo(x + 100 + q * 46, y + h * 0.46); g.quadraticCurveTo(x + 110 + q * 46, y + h * 0.2, x + 130 + q * 46 + 8 * Math.sin(T * 6 + q), y + h * 0.12); g.quadraticCurveTo(x + 150 + q * 46, y + h * 0.3, x + 146 + q * 46, y + h * 0.46); g.fill(); } }
      if (kind === 'dice') { g.fillStyle = '#fff4d8'; for (const [dx, dy, r] of [[130, 0.4, 0.3], [230, 0.6, -0.2]]) { g.save(); g.translate(x + dx, y + h * dy); g.rotate(r + T); g.fillRect(-34, -34, 68, 68); g.fillStyle = '#2a0a0a'; g.beginPath(); g.arc(0, 0, 8, 0, TAU); g.fill(); g.fillStyle = '#fff4d8'; g.restore(); } }
      if (kind === 'forest') for (let q = 0; q < 6; q++) { g.fillRect(x + 30 + q * 56, y + h * 0.3, 16, h * 0.6); g.beginPath(); g.arc(x + 38 + q * 56, y + h * 0.3, 40, 0, TAU); g.fill(); }
      if (kind === 'field') for (let q = 0; q < 10; q++) { g.fillRect(x + 20 + q * 33, y + h * (q % 2 ? 0.5 : 0.56), 8, h * 0.34); g.fillRect(x + 20 + q * 33, y + h * 0.3, 3, h * 0.3); } }
    g.restore(); };
})();
