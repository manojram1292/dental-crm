/* KIT LAB REEL (ep 99; never published): one shot per kit feature added for episodes 41–50. Each scene is the test
 * still of a feature (see REVIEW_LOG.md "Episode 41 step-up") and together they let tools/gate.mjs run its new checks.
 * v2 (after the independent visual review, review/independent-kit41-visual.md): silhouette-first figures at 60–70 % of the
 * frame's height, the horizon at about 70 %, a filled foreground, the series' own flame (no face), moving holds, text kept
 * off faces, the snake and the man re-staged with clear ground between them. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters;
  const { clamp, lerp, E } = R;
  const GY = 1390, HZ = 1330;   // the ground line and the horizon (≈ 70 % of the frame's height)
  const fin = (ctx, T) => ST.finish(ctx, T, {});

  // 1 · BACK-LIGHT: the old rule (left: a flat black cut-out) against the new rule (right: a dark, rich shape with a rim on
  //     both edges, its own deep colours and its ornaments catching the fire)
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, pal = 'hearth-amber', fl = KIT.flicker(T, 2), cam = CAM.push(clamp(t / 2.6), { from: 1.2, to: 1.0, focus: [540, 900], ease: E.outCubic });
      ST.shot(ctx, T, { pal, cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ }) },
        { z: 0.5, draw: (g, p) => ST.pillars(g, p, { y: HZ - 20, n: 4 }) },
        { z: 0.8, haze: false, draw: (g) => CH.hearthfire.draw(g, { x: 540, y: GY - 10, scale: 1.25, t: T, k: 1.15, lean: 0.15 * Math.sin(T * 0.7) }) },
        { z: 1, haze: false, draw: (g, p) => {
          ST.ground(g, p, { y: GY });
          const pose = ACT.pose(t, [[0, 'stand'], [0.3, 'point', { act: 0.5 }]]);
          CH.puloman.draw(g, { x: 215, y: GY + 30, scale: 0.94, facing: 'right', pose, light: { dir: Math.atan2(-300, 300), intensity: fl, front: 0 }, expression: { emo: 'wrath' }, t: T, key: 'old' });
          CH.puloman.draw(g, { x: 880, y: GY + 30, scale: 0.94, facing: 'left', pose, light: ST.backlight(p, { from: [540, 800], at: [880, GY], k: fl }), expression: { emo: 'wrath' }, t: T, key: 'new' });
        } },
        { z: 1.5, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 40, box: [100, 200, 880, 1000], cam }) },
      ] });
      TY.tag(ctx, T, 1, 'old rule', { x: 215, y: 250 }); TY.tag(ctx, T, 1, 'back-light rule', { x: 860, y: 250 });
      KIT.series.hookCard(ctx, T, 1, env.script.lines[0].text, { y: 1500, size: 70 });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.5, paper: 0.3 }) });

  // 2 · COLOUR SCRIPT + DEPTH: the hermitage in green, six planes, shafts and pollen; a lateral slide. Her feet are planted.
  const hermitage = (ctx, T, t, cam, extra) => ST.shot(ctx, T, { pal: 'hermitage-green', cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ, sun: [860, 520, 56] }) },
    { z: 0.15, draw: (g, p) => { ST.cloudBank(g, p, T, { y: 420, count: 4 }); ST.hills(g, p, { y: HZ, h: 420, seed: 2 }); } },
    { z: 0.4, draw: (g, p) => ST.treeline(g, p, { y: HZ + 10, h: 620, T, seed: 5, kind: 'mixed' }) },
    { z: 0.7, draw: (g, p) => { ST.treeline(g, p, { y: HZ + 40, h: 900, gap: 520, T, seed: 9, color: p.near, kind: 'banyan' }); ST.hut(g, p, { x: 820, y: HZ + 50, s: 1.15, lit: 0.6 }); } },
    { z: 0.85, haze: false, draw: (g) => ST.shafts(g, T, { x: 780, angle: -0.42, count: 5, alpha: 0.16 }) },
    { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 }); if (extra) extra(g, p); } },
    { z: 1.25, haze: false, draw: (g) => ST.particles(g, T, { kind: 'pollen', count: 40, cam }) },
    { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => { ST.trunks(g, p, { xs: [-170, 1250], w: 200 }); ST.grass(g, p, { y: 1940, h: 300, T }); } },
  ] });
  R.scene({ id: 'colour', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.slide(t / env.dur, { from: -170, to: 150, zoom: 1.08 }), T);
      hermitage(ctx, T, t, cam, (g, p) => {
        CH.puloma.draw(g, { x: 400, y: GY + 10, scale: 1.16, facing: 'right', pose: ACT.pose(t, [[0, 'attend'], [0.8, 'carry', { act: 0.6 }], [2.5, 'shield', { act: 0.4 }]]), light: ST.light(p, { from: [860, 400], at: [400, GY] }), expression: { emo: ACT.emo(t, [[0, 'tender'], [2.5, 'fear']]), gaze: [0.4, 0] }, t: T });
      });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.6) / 0.4)), env.strings, { y: 1150 });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.26, vignette: 0.4, paper: 0.3 }) });

  // 3 · PARALLAX under an orbit: the boar in the storm, in and out in under 1.5 s of gallop (smoke carry in)
  R.scene({ id: 'depth', transition: { type: 'smoke', dur: 0.7, dir: Math.PI, color: '#8a5a88' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 170, zoom: 1.14 });
      ST.shot(ctx, T, { pal: 'boar-dusk', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ }) },
        { z: 0.12, draw: (g, p) => ST.cloudBank(g, p, T, { y: 460, count: 7, speed: 40, color: '#3a1440', alpha: 0.9, size: 1.5 }) },
        { z: 0.3, draw: (g, p) => ST.hills(g, p, { y: HZ, h: 520, seed: 4, peaks: 0.5 }) },
        { z: 0.6, draw: (g, p) => ST.treeline(g, p, { y: HZ + 30, h: 700, T: T * 3, sway: 26, seed: 7, kind: 'sal' }) },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 30 });
          CH.boar.draw(g, { x: lerp(1500, -260, E.inOutSine(clamp((t - 0.5) / 1.9))), y: GY + 10, scale: 0.95, pose: { name: 'run', phase: T * 13 }, light: ST.light(p, { from: [200, 300], at: [600, GY], k: 1.1 }), t: T }); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'rain', count: 140, cam, alpha: 0.5, wind: -30 }) },
        { z: 2.0, haze: false, soft: 0.35, draw: (g, p) => ST.trunks(g, p, { xs: [-280, 1360], w: 190 }) },
      ] });
      ST.vignette(ctx, { color: '#10041a', alpha: 0.5 }); fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.5, paper: 0.28 }) });

  // 4 · ACTING: Bhrigu's curse: anticipation (7 frames back) → the throw (4 frames, a smear) → overshoot and settle; then a
  //     MOVING HOLD (breath, weight, beard and shawl still settling). The fire has no face: it sinks and darkens.
  const curseKeys = [[0, 'stand'], [0.7, 'raise', { act: 0.42, an: 0.08 }], [1.75, 'curse', { antic: 0.26, act: 0.13, settle: 0.5, an: 0.16, over: 0.1 }]];
  R.scene({ id: 'acting', transition: { type: 'ink', dur: 0.75, at: [600, 800] },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.mix(CAM.push(clamp((t - 1.0) / 2.6), { from: 1.0, to: 1.12, focus: [560, 760] }), CAM.tilt(clamp(t / 1.2), { from: 100, to: 0, zoom: 1 }));
      const hit = clamp((t - 2.2) / 1.4);
      ST.shot(ctx, T, { pal: 'wrath-crimson', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ }) },
        { z: 0.3, draw: (g, p) => { ST.hills(g, p, { y: HZ, h: 380, seed: 6 }); ST.treeline(g, p, { y: HZ + 20, h: 520, T, seed: 2, kind: 'mixed' }); } },
        { z: 0.75, haze: false, draw: (g) => CH.hearthfire.draw(g, { x: 220, y: GY - 10, scale: 1.0, t: T, k: lerp(1.1, 0.62, E.inOutSine(hit)), dark: 0.75 * E.inOutSine(hit), lean: -0.3 * Math.sin(Math.PI * clamp((t - 2.1) / 0.8)) }) },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
          CH.bhrigu.draw(g, { x: 730, y: GY + 20, scale: 1.14, facing: 'left', pose: ACT.pose(t, curseKeys, { wind: 0.6 }), light: ST.light(p, { from: [220, 900], at: [730, GY], k: KIT.flicker(T, 1) * 1.15, front: 0.3 }), expression: { emo: ACT.emo(t, [[0, 'resolve'], [0.8, 'wrath']]), speak: t > 2.0 && t < 3.4 ? 0.5 + 0.5 * Math.sin(T * 14) : 0 }, t: T });
          // the water leaves the pot on the throw (m9)
          const w = clamp((t - 2.12) / 0.5); if (w > 0 && w < 1) { g.save(); g.globalAlpha = 1 - w; g.fillStyle = '#d8f0ff'; for (let i = 0; i < 9; i++) { const u = w * (0.6 + 0.05 * i); g.beginPath(); g.ellipse(lerp(420, 250, u) + i * 6, lerp(700, GY - 300, u * u) - 30 * Math.sin(u * 3) + i * 9, 14 - i, 7, -0.5, 0, 7); g.fill(); } g.restore(); }
        } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 40, cam }) },
        { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => ST.grass(g, p, { y: 1960, h: 260, T, count: 50 }) },
      ] });
      TY.turnWord(ctx, T, clamp((t - 2.3) / 1.2), 'Eat everything', { x: 360, y: 470, size: 66, out: clamp((t - (env.dur - 0.3)) / 0.3), sub: 'the curse on Agni · Adi 1.6' });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.5, paper: 0.28 }) });

  // 5 · FACE CLOSE-UP: calm → fear; the whole head in frame, looking into the space, the chin above the caption band
  R.scene({ id: 'closeup', transition: { type: 'brush', dur: 0.5, angle: -0.25, color: '#e8d4a8' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.08, focus: [600, 760] });
      ST.shot(ctx, T, { pal: 'hermitage-green', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500 }) },
        { z: 0.3, soft: 0.45, draw: (g, p) => ST.treeline(g, p, { y: 1500, h: 1400, gap: 460, T, seed: 3, kind: 'mixed' }) },
        { z: 0.8, haze: false, draw: (g) => ST.shafts(g, T, { x: 300, angle: 0.4, alpha: 0.14 }) },
        { z: 1, haze: false, draw: (g, p) => CH.puloma.draw(g, { x: 700, y: 3050, scale: 2.6, facing: 'left', pose: ACT.pose(t, [[0, 'attend'], [1.5, 'shield', { act: 0.45 }]]), light: ST.light(p, { from: [100, 300], at: [600, 1200], k: 1.1, front: 0.72 }),
          expression: { emo: ACT.emo(t, [[0, 'tender'], [1.6, 'shock', { dur: 0.3 }], [2.5, 'fear']]), gaze: ACT.gaze(t, [[0, [0.1, 0.3]], [1.4, [-0.9, -0.2]]]) }, t: T }) },
        { z: 1.5, haze: false, draw: (g) => ST.particles(g, T, { kind: 'pollen', count: 20, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.22, vignette: 0.42, paper: 0.3 }) });

  // 6 · FRAME-WITHIN-FRAME + RACK FOCUS: the river through a carved niche; the reeds start sharp and end soft as she comes into focus
  R.scene({ id: 'camera', transition: { type: 'dissolve', dur: 0.5 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.rack(clamp((t - 0.5) / 0.8), { from: 1.9, to: 1.0, zoom: 1.06 });
      ST.within(ctx, T, { shape: 'arch', pal: 'island-gold', box: [110, 250, 860, 1180], open: 1, draw: (c2) => ST.shot(c2, T, { pal: 'island-gold', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1000 }) },
        { z: 0.25, draw: (g, p) => ST.hills(g, p, { y: 1000, h: 320, seed: 8 }) },
        { z: 0.5, draw: (g, p) => { ST.treeline(g, p, { y: 1040, h: 420, T, seed: 4, kind: 'mixed' }); ST.water(g, p, { y0: 1040, y1: 1500, T, flow: 70 }); } },
        { z: 1, haze: false, draw: (g, p) => { CH.puloma.draw(g, { x: 560, y: 1400, scale: 0.92, facing: 'left', pose: ACT.pose(t, [[0, 'carry'], [1.6, 'grieve', { act: 0.7 }]]), light: ST.light(p, { from: [200, 300], at: [560, 1300] }), expression: { emo: 'sorrow' }, t: T }); } },
        { z: 1.9, haze: false, draw: (g, p) => ST.grass(g, p, { y: 1500, h: 520, T, count: 30, color: p.near }) },
      ] }) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.24, vignette: 0.42, paper: 0.3 }) });

  // 7 · TYPE + CREATURES: Ruru and the old snake, RE-STAGED: 200 px of clear ground between them; the snake rears on an S-curve
  //     to the height of his chest, its head turned up to his face. A name plaque; a lamp-glow match cut in.
  const RX = 820, SX = 300;
  const thicket = (ctx, T, t, cam) => {
    ST.shot(ctx, T, { pal: 'thicket-shade', cam, layers: [
      { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ }) },
      { z: 0.35, draw: (g, p) => ST.treeline(g, p, { y: HZ + 20, h: 1000, gap: 340, T, seed: 12, kind: 'mixed' }) },
      { z: 0.8, haze: false, draw: (g) => ST.shafts(g, T, { x: 300, angle: 0.3, alpha: 0.14, color: '#f0f4a0' }) },
      { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
        CH.ruru.draw(g, { x: RX, y: GY + 10, scale: 1.1, facing: 'left', pose: ACT.pose(t, [[0, 'walk'], [0.5, 'raise', { act: 0.45 }], [3.3, 'recoil', { act: 0.4 }]], { phase: T * 5 }), light: ST.light(p, { from: [300, 300], at: [RX, GY] }), expression: { emo: ACT.emo(t, [[0, 'wrath'], [3.3, 'wonder']]), gaze: [0, 0.6] }, t: T });
        CH.dundubha.draw(g, { x: SX, y: GY + 20, scale: 0.95, facing: 'right', pose: { name: 'rise', k: lerp(0.45, 1, E.inOutSine(clamp((t - 2.3) / 1.3))) }   /* never flat under the caption band: its head stays above it */, light: ST.light(p, { from: [300, 300], at: [SX, GY], front: 0.5 }), expression: { speak: t > 4 ? 0.5 + 0.5 * Math.sin(T * 12) : 0 }, t: T }); } },
      { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 30, cam }) },
      { z: 1.8, haze: false, soft: 0.3, draw: (g, p) => ST.grass(g, p, { y: 1940, h: 320, T, count: 46 }) },
    ] });
  };
  R.scene({ id: 'type', transition: { type: 'lamp', dur: 0.8, from: [540, 800], to: [760, 620] },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.crane(t / env.dur, { from: 1.2, to: 1.0, y0: 120, y1: 0 });
      thicket(ctx, T, t, cam);
      TY.plaque(ctx, T, clamp((t - 0.5) / 0.9), 'Ruru', 'a young ascetic', { x: 300, y: 520, out: clamp((t - 3.2) / 0.4) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.24, vignette: 0.45, paper: 0.3 }) });
  // the cliffhanger: a waist-up two-shot; the snake's head in the lower-left third, looking up at his face
  const cliff = (ctx, T, t, env) => { thicket(ctx, T, 4.0 + t, CAM.push(clamp(t / 4), { from: 1.22, to: 1.34, focus: [600, 1150] })); TY.source(ctx, T, clamp(t / 0.4), env.strings); fin(ctx, T); };
  R.scene({ id: 'cliff', draw(ctx, t, env) { cliff(ctx, env.T, t, env); }, post: () => ({ bloom: 0.24, vignette: 0.45, paper: 0.3 }) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, 3 + t, env) });
})();
