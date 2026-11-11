/* Episodes 49–50 · shared places (not a scene). Loads after ep41/_common.
 *   EP49.shore(ctx, T, cam, o)   the fishers' shore at dusk (fishers-coral): the river, boats drawn up, nets on poles
 *   EP49.river(ctx, T, cam, o)   the Yamuna from a boat's height (yamuna-deep, or mist-lavender): far bank, water, reeds
 *   EP49.boat(g, x, y, s)        a river boat, side on (the stern to the right)
 *   EP49.infant(g, x, y, s, glow) a swaddled new-born: a bundle and a small round head */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, EP41 = window.EP41;
  const { TAU, hash } = R;
  const GY = EP41.GY;
  const EP49 = (window.EP49 = {});
  EP49.infant = (g, x, y, s = 1, glow = 0.8, cloth = '#fff4dc') => {
    if (glow > 0) { KIT.glow(g, x, y - 20 * s, 220 * s, '#fff0c0', 0.7 * glow); }
    g.save(); g.translate(x, y); g.rotate(-0.25); g.fillStyle = cloth; g.beginPath(); g.ellipse(0, 0, 64 * s, 34 * s, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(200,150,60,0.7)'; g.lineWidth = 3 * s; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(-30 * s + i * 24 * s, -30 * s); g.lineTo(-10 * s + i * 24 * s, 30 * s); g.stroke(); }
    g.fillStyle = '#b07a52'; g.beginPath(); g.arc(-62 * s, -6 * s, 26 * s, 0, TAU); g.fill(); g.fillStyle = '#2a1810'; g.beginPath(); g.arc(-66 * s, -16 * s, 22 * s, Math.PI, TAU); g.fill(); g.restore();
  };
  EP49.boat = (g, x, y, s = 1, col = '#3a2412') => {
    g.fillStyle = col; g.beginPath(); g.moveTo(x - 420 * s, y - 70 * s); g.quadraticCurveTo(x - 300 * s, y + 40 * s, x, y + 46 * s); g.quadraticCurveTo(x + 320 * s, y + 40 * s, x + 440 * s, y - 100 * s); g.lineTo(x + 380 * s, y - 60 * s); g.lineTo(x - 360 * s, y - 50 * s); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,220,160,0.5)'; g.lineWidth = 4 * s; g.beginPath(); g.moveTo(x - 360 * s, y - 50 * s); g.lineTo(x + 380 * s, y - 60 * s); g.stroke();
  };
  const nets = (g, T) => { for (const x of [120, 520, 940]) { g.fillStyle = '#2a1410'; g.fillRect(x - 8, GY - 620, 16, 640); } g.strokeStyle = 'rgba(40,20,16,0.9)'; g.lineWidth = 3;
    for (const [x0, x1] of [[120, 520], [520, 940]]) for (let i = 0; i < 9; i++) { const u = i / 8; g.beginPath(); g.moveTo(x0 + (x1 - x0) * u, GY - 610); g.quadraticCurveTo(x0 + (x1 - x0) * u + 20 * Math.sin(T + i), GY - 400, x0 + (x1 - x0) * (0.5 + (u - 0.5) * 0.7), GY - 230 + 60 * Math.sin(u * Math.PI)); g.stroke(); }
    for (const [x0, x1] of [[120, 520], [520, 940]]) for (let j = 0; j < 4; j++) { g.beginPath(); g.moveTo(x0, GY - 600 + j * 90); g.quadraticCurveTo((x0 + x1) / 2, GY - 520 + j * 100, x1, GY - 600 + j * 90); g.stroke(); } };
  EP49.shore = (ctx, T, cam, o = {}) => ST.shot(ctx, T, { pal: o.pal || 'fishers-coral', cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1000, sun: o.sun ?? [820, 880, 90] }) },
    { z: 0.2, draw: (g, p) => { ST.cloudBank(g, p, T, { y: 420, count: 4, size: 1.3 }); ST.hills(g, p, { y: 1000, h: 220, seed: 101 }); } },
    { z: 0.45, draw: (g, p) => { ST.water(g, p, { y0: 1000, y1: 1300, T, flow: 40, count: 50 }); EP49.boat(g, 230, 1180, 0.5); EP49.boat(g, 900, 1150, 0.4); } },
    { z: 0.7, draw: (g) => { if (o.nets !== false) nets(g, T); } },
    { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 30 }); if (o.figs) o.figs(g, p); } },
    { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 22, cam }) },
    { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => { ST.grass(g, p, { y: 1960, h: 300, T, count: 36 }); EP49.boat(g, -160, 2000, 0.9, '#140a08'); } },
  ] });
  EP49.river = (ctx, T, cam, o = {}) => ST.shot(ctx, T, { pal: o.pal || 'yamuna-deep', cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: o.hz ?? 900, sun: o.sun }) },
    { z: 0.2, draw: (g, p) => { ST.cloudBank(g, p, T, { y: 340, count: 4, size: 1.3 }); ST.hills(g, p, { y: o.hz ?? 900, h: 240, seed: 111 }); } },
    { z: 0.4, draw: (g, p) => { ST.treeline(g, p, { y: (o.hz ?? 900) + 20, h: 300, T, seed: 113, kind: 'mixed' }); if (o.far) o.far(g, p); } },
    { z: 0.6, haze: false, draw: (g, p) => { ST.water(g, p, { y0: (o.hz ?? 900) + 20, y1: 2000, T, flow: 56, count: 110 }); if (o.mist) ST.mist(g, T, { y: (o.hz ?? 900) + 40, h: 360, alpha: o.mist }); } },
    { z: 1, haze: false, draw: (g, p) => { if (o.figs) o.figs(g, p); } },
    { z: 1.5, haze: false, draw: (g) => { if (o.mist) ST.mist(g, T, { y: 1500, h: 420, alpha: o.mist * 0.8 }); } },
    { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => { for (let i = 0; i < 16; i++) { const x = -60 + i * 78 + 30 * hash(i, 3), h = 300 + 260 * hash(i, 4), sw = 14 * Math.sin(T * 1.2 + i); g.strokeStyle = KIT.hex(p.near, '#000000', 0.3); g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, 1960); g.quadraticCurveTo(x + sw, 1960 - h * 0.6, x + sw * 2, 1960 - h); g.stroke(); } } },
  ] });
})();
