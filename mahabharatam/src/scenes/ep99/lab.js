/* KIT LAB REEL (ep 99; never published): one shot per kit feature added for episodes 41–50. Each scene is the test
 * still of a feature (see REVIEW_LOG.md "Episode 41 step-up") and together they let tools/gate.mjs run its new checks. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters;
  const { clamp, lerp, E } = R;
  const GY = 1250;   // the ground line: figures stand above the fixed caption band

  // 1 · BACK-LIGHT: old rule (left: the dark cut-out) against the new rule (right)
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, pal = 'hearth-amber', fl = KIT.flicker(T, 2), cam = CAM.push(clamp(t / 2.6), { from: 1.22, to: 1.0, focus: [540, 900], ease: E.outCubic });
      ST.shot(ctx, T, { pal, cam, layers: [
        { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 1000 }); } },
        { z: 0.5, draw: (g, p) => { ST.pillars(g, p, { y: 1180, n: 4 }); } },
        { z: 0.8, haze: false, draw: (g) => { CH.hearthfire.draw(g, { x: 540, y: GY - 40, scale: 1.25, t: T, k: 1.2, expression: { emo: ACT.emo(t, [[0, 'calm'], [1.2, 'fear']]), gaze: [Math.sin(T) * 0.6, 0] } }); } },
        { z: 1, haze: false, draw: (g, p) => {
          ST.ground(g, p, { y: GY });
          CH.puloman.draw(g, { x: 250, y: GY + 60, scale: 0.78, facing: 'right', pose: ACT.pose(t, [[0, 'stand'], [0.5, 'point']]), light: { dir: Math.atan2(-300, 300), intensity: fl, front: 0.05 }, expression: { emo: 'wrath' }, t: T, key: 'old' });
          CH.puloman.draw(g, { x: 850, y: GY + 60, scale: 0.78, facing: 'left', pose: ACT.pose(t, [[0, 'stand'], [0.5, 'point']]), light: ST.backlight(p, { from: [540, 800], at: [850, GY], k: fl }), expression: { emo: 'wrath' }, t: T, key: 'new' });
        } },
        { z: 1.5, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 40, box: [100, 200, 880, 1100], cam }) },
      ] });
      TY.tag(ctx, T, 1, 'old rule', { x: 250, y: 300 }); TY.tag(ctx, T, 1, 'back-light rule', { x: 800, y: 300 });
      KIT.series.hookCard(ctx, T, 1, env.script.lines[0].text, { y: 1500, size: 70 });
      ST.finish(ctx, T, { grain: 0.5 });
    },
    post: () => ({ bloom: 0.4, vignette: 0.45, paper: 0.34 }) });

  // 2 · COLOUR SCRIPT + DEPTH: the hermitage in green, five planes, shafts and pollen; a lateral slide
  const hermitage = (ctx, T, t, cam, extra) => ST.shot(ctx, T, { pal: 'hermitage-green', cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1050, sun: [860, 420, 60] }) },
    { z: 0.15, draw: (g, p) => { ST.cloudBank(g, p, T, { y: 360, count: 4 }); ST.hills(g, p, { y: 1060, h: 380, seed: 2 }); } },
    { z: 0.4, draw: (g, p) => ST.treeline(g, p, { y: 1120, h: 520, T, seed: 5 }) },
    { z: 0.7, draw: (g, p) => { ST.treeline(g, p, { y: 1200, h: 700, gap: 420, T, seed: 9, color: p.near }); ST.hut(g, p, { x: 800, y: 1215, s: 1.05, lit: 0.6 }); } },
    { z: 0.85, haze: false, draw: (g) => ST.shafts(g, T, { x: 780, angle: -0.42, count: 5, alpha: 0.2 }) },
    { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY }); if (extra) extra(g, p); } },
    { z: 1.25, haze: false, draw: (g) => ST.particles(g, T, { kind: 'pollen', count: 50, cam }) },
    { z: 1.9, haze: false, soft: 0.35, draw: (g, p) => { ST.trunks(g, p, { xs: [-150, 1210], w: 190 }); ST.grass(g, p, { y: 1900, h: 240, T }); } },
  ] });
  R.scene({ id: 'colour', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.slide(t / env.dur, { from: -170, to: 150, zoom: 1.12 }), T);
      hermitage(ctx, T, t, cam, (g, p) => {
        CH.puloma.draw(g, { x: 430, y: GY + 20, scale: 0.86, facing: 'right', pose: ACT.pose(t, [[0, 'attend'], [1.0, 'carry'], [2.4, 'shield']]), light: ST.light(p, { from: [860, 300], at: [430, GY] }), expression: { emo: ACT.emo(t, [[0, 'tender'], [2.3, 'fear']]), gaze: [0.4, 0] }, t: T });
      });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.6) / 0.4)), env.strings, {});
      ST.finish(ctx, T, { grain: 0.5 });
    },
    post: () => ({ bloom: 0.3, vignette: 0.35, paper: 0.36 }) });

  // 3 · PARALLAX under an orbit: the boar in the storm (smoke carry in)
  R.scene({ id: 'depth', transition: { type: 'smoke', dur: 0.7, dir: Math.PI, color: '#8a5a88' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 190, zoom: 1.18 });
      ST.shot(ctx, T, { pal: 'boar-dusk', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1100 }) },
        { z: 0.12, draw: (g, p) => ST.cloudBank(g, p, T, { y: 420, count: 7, speed: 40, color: '#3a1440', alpha: 0.9, size: 1.5 }) },
        { z: 0.3, draw: (g, p) => ST.hills(g, p, { y: 1100, h: 460, seed: 4, peaks: 0.5 }) },
        { z: 0.6, draw: (g, p) => ST.treeline(g, p, { y: 1180, h: 560, T: T * 3, sway: 26, seed: 7, kind: 'sal' }) },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY });
          CH.boar.draw(g, { x: lerp(980, 380, clamp(t / env.dur)), y: GY + 30, scale: 0.72, pose: { name: 'run', phase: T * 9 }, light: ST.light(p, { from: [200, 200], at: [600, GY], k: 1.1 }), t: T }); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'rain', count: 110, cam, alpha: 0.5 }) },
        { z: 2.0, haze: false, soft: 0.4, draw: (g, p) => ST.trunks(g, p, { xs: [-260, 1340], w: 190 }) },
      ] });
      ST.vignette(ctx, { color: '#10041a', alpha: 0.5 }); ST.finish(ctx, T, { grain: 0.5 });
    },
    post: () => ({ bloom: 0.34, vignette: 0.5, paper: 0.3 }) });

  // 4 · ACTING: Bhrigu's curse (anticipation → action → follow-through), ink bleed in
  R.scene({ id: 'acting', transition: { type: 'ink', dur: 0.75, at: [600, 800] },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.mix(CAM.push(clamp((t - 1.0) / 1.6), { from: 1.0, to: 1.22, focus: [520, 760] }), CAM.tilt(clamp(t / 1.2), { from: 120, to: 0, zoom: 1 }));
      ST.shot(ctx, T, { pal: 'wrath-crimson', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1050 }) },
        { z: 0.3, draw: (g, p) => { ST.hills(g, p, { y: 1080, h: 340, seed: 6 }); ST.treeline(g, p, { y: 1110, h: 420, T, seed: 2 }); } },
        { z: 0.75, haze: false, draw: (g) => CH.hearthfire.draw(g, { x: 220, y: GY - 10, scale: 0.9, t: T, k: lerp(1.1, 0.75, clamp((t - 1.6) / 1)), expression: { emo: ACT.emo(t, [[0, 'calm'], [1.5, 'shock'], [2.6, 'sorrow']]), gaze: [0.8, -0.3] } }) },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY });
          CH.bhrigu.draw(g, { x: 700, y: GY + 30, scale: 0.92, facing: 'left', pose: ACT.pose(t, [[0, 'stand'], [0.9, 'raise', { dur: 0.7 }], [1.75, 'curse', { dur: 0.5, antic: 0.2, over: 0.16 }]], { wind: 0.5 }), light: ST.light(p, { from: [220, 700], at: [700, GY], k: KIT.flicker(T, 1) * 1.15 }), expression: { emo: ACT.emo(t, [[0, 'resolve'], [0.9, 'wrath']]), speak: t > 1.7 ? 0.5 + 0.5 * Math.sin(T * 14) : 0 }, t: T }); } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 46, cam }) },
      ] });
      TY.turnWord(ctx, T, clamp((t - 2.0) / 1.2), 'Devour all', { y: 400, size: 110, out: clamp((t - (env.dur - 0.3)) / 0.3), sub: 'the curse on Agni · Adi 1.6' });
      ST.finish(ctx, T, { grain: 0.5 });
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.32 }) });

  // 5 · FACE CLOSE-UP: calm → fear; brush wipe in
  R.scene({ id: 'closeup', transition: { type: 'brush', dur: 0.6, angle: -0.25 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.12, focus: [470, 800] });
      ST.shot(ctx, T, { pal: 'hermitage-green', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500 }) },
        { z: 0.3, soft: 0.5, draw: (g, p) => ST.treeline(g, p, { y: 1500, h: 1300, gap: 420, T, seed: 3 }) },
        { z: 0.8, haze: false, draw: (g) => ST.shafts(g, T, { x: 820, angle: -0.4, alpha: 0.18 }) },
        { z: 1, haze: false, draw: (g, p) => CH.puloma.draw(g, { x: 760, y: 3560, scale: 3.1, facing: 'left', pose: ACT.pose(t, [[0, 'attend'], [1.7, 'shield', { dur: 0.6 }]]), light: ST.light(p, { from: [100, 300], at: [600, 1200], k: 1.12, front: 0.8 }),
          expression: { emo: ACT.emo(t, [[0, 'tender'], [1.6, 'shock', { dur: 0.35 }], [2.5, 'fear']]), gaze: ACT.gaze(t, [[0, [0.1, 0.3]], [1.4, [-0.9, -0.2]]]) }, t: T }) },
        { z: 1.5, haze: false, draw: (g) => ST.particles(g, T, { kind: 'pollen', count: 24, cam }) },
      ] });
      ST.finish(ctx, T, { grain: 0.5 });
    },
    post: () => ({ bloom: 0.26, vignette: 0.4, paper: 0.36 }) });

  // 6 · FRAME-WITHIN-FRAME + RACK FOCUS: the river through an arch of leaves
  R.scene({ id: 'camera', transition: { type: 'dissolve', dur: 0.5 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.rack(clamp((t - 0.6) / 1.6), { from: 1.9, to: 0.6, zoom: 1.08 });
      ST.within(ctx, T, { shape: 'leaves', pal: 'riverbank-pearl', box: [90, 250, 900, 1250], open: clamp(t / 0.8) * 0.4 + 0.6, draw: (c2) => ST.shot(c2, T, { pal: 'riverbank-pearl', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 900 }) },
        { z: 0.25, draw: (g, p) => ST.hills(g, p, { y: 900, h: 300, seed: 8 }) },
        { z: 0.6, draw: (g, p) => { ST.treeline(g, p, { y: 960, h: 360, T, seed: 4 }); ST.water(g, p, { y0: 960, y1: 1500, T, flow: 70 }); } },
        { z: 1, haze: false, draw: (g, p) => { CH.puloma.draw(g, { x: 560, y: 1330, scale: 0.6, facing: 'left', pose: ACT.pose(t, [[0, 'carry'], [1.5, 'grieve']], { phase: T * 3 }), light: ST.light(p, { from: [200, 200], at: [560, 1300] }), expression: { emo: 'sorrow' }, t: T }); } },
        { z: 1.9, haze: false, draw: (g, p) => ST.grass(g, p, { y: 1600, h: 420, T, count: 40, color: p.near }) },
      ] }) });
      ST.finish(ctx, T, { grain: 0.5 });
    },
    post: () => ({ bloom: 0.3, vignette: 0.4, paper: 0.36 }) });

  // 7 · TYPE + CREATURES: Ruru and the dundubha; a name plaque; lamp-glow match cut in
  const thicket = (ctx, T, t, cam, env) => {
    ST.shot(ctx, T, { pal: 'thicket-shade', cam, layers: [
      { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1000 }) },
      { z: 0.35, draw: (g, p) => ST.treeline(g, p, { y: 1100, h: 800, gap: 300, T, seed: 12 }) },
      { z: 0.8, haze: false, draw: (g) => ST.shafts(g, T, { x: 300, angle: 0.3, alpha: 0.16, color: '#f0f4a0' }) },
      { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY });
        CH.ruru.draw(g, { x: 760, y: GY + 20, scale: 0.84, facing: 'left', pose: ACT.pose(t, [[0, 'walk'], [0.7, 'raise', { dur: 0.6 }], [3.2, 'recoil', { dur: 0.5 }]], { phase: T * 5 }), light: ST.light(p, { from: [300, 200], at: [760, GY] }), expression: { emo: ACT.emo(t, [[0, 'wrath'], [3.2, 'wonder']]), gaze: [0, 0.6] }, t: T });
        CH.dundubha.draw(g, { x: 330, y: GY + 30, scale: 0.8, facing: 'right', pose: { name: 'rise', k: E.inOutSine(clamp((t - 2.6) / 1.2)) }, light: ST.light(p, { from: [300, 200], at: [330, GY] }), expression: { speak: t > 4 ? 0.5 + 0.5 * Math.sin(T * 12) : 0 }, t: T }); } },
      { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 40, cam }) },
      { z: 1.8, haze: false, soft: 0.3, draw: (g, p) => ST.grass(g, p, { y: 1880, h: 300, T, count: 46 }) },
    ] });
  };
  R.scene({ id: 'type', transition: { type: 'lamp', dur: 0.8, from: [540, 800], to: [760, 620] },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.crane(t / env.dur, { from: 1.3, to: 1.05, y0: 160, y1: -20 });
      thicket(ctx, T, t, cam, env);
      TY.plaque(ctx, T, clamp((t - 0.5) / 0.9), 'Ruru', 'a young ascetic', { x: 300, y: 520, out: clamp((t - 3.2) / 0.4) });
      ST.finish(ctx, T, { grain: 0.5 });
    },
    post: () => ({ bloom: 0.3, vignette: 0.42, paper: 0.36 }) });
  const cliff = (ctx, T, t, env) => { thicket(ctx, T, 4.0 + t, CAM.push(clamp(t / 4), { from: 1.5, to: 1.8, focus: [560, 1000] }), env); TY.source(ctx, T, clamp(t / 0.4), env.strings); ST.finish(ctx, T, { grain: 0.5 }); };
  R.scene({ id: 'cliff', draw(ctx, t, env) { cliff(ctx, env.T, t, env); }, post: () => ({ bloom: 0.3, vignette: 0.42, paper: 0.36 }) });
  KIT.series.overlayNextScene({ id: 'next', y: 420, picture: (ctx, T, env, t) => cliff(ctx, T, 3 + t, env) });
})();
