/* Episodes 44–46 · shared places (not a scene): EP44.meadow (spring, or the violet dusk), EP44.night (the forest at night,
 * one lamp), EP44.bed / EP44.greyBed (she lies as if asleep among fallen flowers, the colour drained). Loads after ep41/_common. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CH = KIT.characters, EP41 = window.EP41;
  const { TAU, clamp, lerp, E, hash } = R;
  const GY = EP41.GY, HZ = EP41.HZ;
  const EP44 = (window.EP44 = {});

  // an open meadow (spring or violet dusk): sky, hills, a far tree line, flowers in the grass, near grass
  EP44.meadow = (ctx, T, cam, o = {}) => ST.shot(ctx, T, { pal: o.pal || 'meadow-spring', cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: o.hz ?? HZ - 120, sun: o.sun }) },
    { z: 0.15, draw: (g, p) => { ST.cloudBank(g, p, T, { y: 380, count: 4 }); ST.hills(g, p, { y: o.hz ?? HZ - 120, h: 380, seed: 14 }); } },
    { z: 0.45, draw: (g, p) => ST.treeline(g, p, { y: (o.hz ?? HZ - 120) + 20, h: 520, T, seed: 15, kind: 'flame' }) },
    { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: (o.hz ?? HZ - 120) + 10 });
      for (let i = 0; i < 70; i++) { const u = hash(i, 61), x = -200 + 1500 * hash(i, 62), y = lerp((o.hz ?? HZ - 120) + 40, 1900, u * u); g.globalAlpha = 0.8; g.fillStyle = (o.flowers || ['#fff0f4', '#ffd070', '#ff8aa8'])[i % 3]; g.beginPath(); g.arc(x + 4 * Math.sin(T * 1.3 + i), y, 4 + 7 * u, 0, TAU); g.fill(); } g.globalAlpha = 1;
      if (o.figs) o.figs(g, p); } },
    { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: o.dust || 'pollen', count: 36, cam }) },
    { z: 1.9, haze: false, soft: o.nearSoft ?? 0.3, draw: (g, p) => { ST.grass(g, p, { y: 1960, h: o.grassH ?? 340, T, count: 46 }); if (o.near) o.near(g, p); } },
  ] });
  // the forest at night, one lamp (grief-blue)
  EP44.night = (ctx, T, cam, o = {}) => ST.shot(ctx, T, { pal: 'grief-blue', cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ }) },
    { z: 0.3, draw: (g, p) => ST.treeline(g, p, { y: HZ + 10, h: 900, gap: 300, T, seed: 41, kind: 'sal' }) },
    { z: 0.6, draw: (g, p) => { ST.treeline(g, p, { y: HZ + 40, h: 1200, gap: 420, T, seed: 43, color: p.near, kind: 'banyan' }); if (o.far) o.far(g, p); } },
    { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 }); if (o.figs) o.figs(g, p); } },
    { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 24, cam }) },
    { z: 1.9, haze: false, soft: 0.35, draw: (g, p) => { ST.trunks(g, p, { xs: o.trunks || [-220, 1300], w: 210 }); ST.grass(g, p, { y: 1960, h: 280, T, count: 36 }); } },
  ] });
  // she lies as if asleep among fallen flowers; the colour drained (ash-grey). k: 0..1 the petals settled
  EP44.bed = (g, p, T, x, y, s, o = {}) => {
    for (let i = 0; i < 40; i++) { const u = clamp((o.k ?? 1) * 1.4 - hash(i, 71) * 0.4), px = x - 620 * s + 1240 * s * hash(i, 72), py = lerp(y - 600 * s * hash(i, 73) - 200, y + 30 - 60 * hash(i, 74), E.outCubic(u)); g.globalAlpha = 0.9; g.fillStyle = i % 3 ? '#d8d0d0' : '#f4ecec'; g.beginPath(); g.ellipse(px + 20 * Math.sin(T + i) * (1 - u), py, 13, 7, i, 0, TAU); g.fill(); } g.globalAlpha = 1;
    g.save(); g.translate(x, y); g.rotate(-Math.PI / 2 + 0.06); g.translate(-x, -y);   // the standing figure laid on her back, face up: asleep
    CH.pramadvara.draw(g, { x, y: y + 360 * s, scale: s, facing: 'left', pose: { w: { stand: 0.7, anjali: 0.3 }, still: !!o.still }, light: { ...ST.light(p, { from: [x, 200], at: [x, y], front: 0.85, k: 1.2 }), tint: [o.tint || '#e8e8f0', 0.6] }, expression: { emo: 'calm', blink: 1, gaze: [0, 0] }, t: o.still ? 0 : T, key: o.key || 'bed' });
    g.restore();
  };

  const greyBed = (ctx, T, cam, k, o = {}) => ST.shot(ctx, T, { pal: 'ash-grey', cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 900 }) },
    { z: 0.4, draw: (g, p) => ST.treeline(g, p, { y: 920, h: 600, T, seed: 15, kind: 'flame' }) },
    { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: 910 }); EP44.bed(g, p, T, 560, 1150, 0.95, { k, ...o }); } },
    { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => ST.grass(g, p, { y: 1960, h: 380, T, count: 40 }) },
  ] });
  EP44.greyBed = greyBed;
})();
