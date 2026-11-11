/* Episode 41 · The Bride and the Demon (CE Adi 1.5–6.2). One scene per line of script/ep41.en.json.
 * Staging rules (script/ARC-41-50.md 9.2): the fire has no face; a clear gap between the three figures; no text on a face;
 * every sound cue has its action on the same beat (env.beats). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41;
  const { clamp, lerp, E } = R;
  const GY = EP41.GY, HZ = EP41.HZ;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const FIRE = { bloom: 0.46, vignette: 0.5, paper: 0.3 }, DAY = { bloom: 0.26, vignette: 0.4, paper: 0.3 };
  const names = (env, n) => [n, env.script.names[n]];

  // the three by the fire. a = { px, pose, emo, gaze, speak } for the rakshasa; b = the same for Puloma
  const three = (g, T, fl, a = {}, b = {}, s = 1) => {
    CH.puloma.draw(g, { x: b.x ?? 150, y: GY + 16, scale: 0.9 * s, facing: 'right', pose: b.pose || 'shield', light: EP41.lit(b.x ?? 150, fl, 0.5), expression: { emo: b.emo || 'fear', gaze: b.gaze || [0.5, 0], look: b.look || 0 }, t: T, key: 'pm' });
    CH.puloman.draw(g, { x: a.x ?? 900, y: GY + 24, scale: 0.86 * s, facing: 'left', pose: a.pose || 'stand', light: { ...EP41.lit(a.x ?? 900, fl, a.front ?? 0.4), bounce: ['#4a6ab0', 0.6], tint: ['#ffb050', 0.3], ...(a.L || {}) }   /* a cool bounce keeps his blue-black body off the orange wall */, expression: { emo: a.emo || 'resolve', gaze: a.gaze || [0.4, 0.3], look: a.look || 0, speak: a.speak || 0 }, t: T, key: 'pn' });
  };

  // 1 · HOOK: the rakshasa before the household fire; the question low in the frame; then the title
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1, cam = CAM.drift(CAM.push(clamp(t / 3.4), { from: 1.2, to: 1.06, focus: [600, 820], ease: E.outCubic }), T, 0.6);
      const step = E.outCubic(clamp((t - b0) / 0.3));   // the step toward the fire lands on "Fire" (foley: step@0)
      EP41.hearth(ctx, T, cam, { fire: 1.12 + 0.1 * Math.sin(T * 2.1), fs: 1.75, fx: 560, lean: 0.12 * Math.sin(T * 0.9), figs: (g, p, fl) =>
        three(g, T, fl, { x: lerp(990, 930, step), pose: ACT.pose(t, [[0, 'stand'], [b0 - 0.12, 'point', { act: 0.3, antic: 0.12 }]]), emo: 'wrath', speak: EP41.mouth(env, t), ...ACT.lead(t, [[0, [-0.4, 0]], [b0 - 0.2, [0.6, 0.5]]]) }, { x: 215, pose: 'shield', emo: 'fear' }) });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, clamp(t / 0.25), line.text, { y: 1470, size: 74, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.15) / 0.6);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 1500, key: 'ep41-title' });
      fin(ctx, T);
    },
    post: () => FIRE });

  // 2 · ASK: the Naimisha fire at the blue hour; Shaunaka turns to Sauti. The recap band says the true order of telling.
  const frame = (ctx, T, t, env, cam, o = {}) => EP41.naimisha(ctx, T, cam, { smoke: o.smoke, figs: (g, p, fl) => {
    CH.elder.draw(g, { x: 215, y: GY + 20, scale: 1.02, facing: 'right', pose: { name: o.elder || 'sit', k: o.ek ?? 1, base: 'sit' }, light: { ...EP41.lit(215, fl, 0.6), fill: 0.3 }, expression: { speak: o.espeak || 0 }, t: T, key: 'f-el' });
    CH.sauti.draw(g, { x: 880, y: GY + 20, scale: 1.02, facing: 'left', pose: { name: o.sauti || 'sit', k: o.sk ?? 1, base: 'sit' }, light: { ...EP41.lit(880, fl, 0.6), fill: 0.3 }, expression: { speak: o.sspeak || 0 }, t: T, key: 'f-sa' });
  } });
  R.scene({ id: 'ask', transition: { type: 'smoke', dur: 0.7, dir: -Math.PI / 2, color: '#3a4a7a' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.slide(t / env.dur, { from: 120, to: -90, zoom: 1.1, y: 0 }), T, 0.5);
      frame(ctx, T, t, env, cam, { elder: 'speak', ek: E.outCubic(clamp(t / 0.35)), espeak: EP41.mouth(env, t) });   // he turns at once (foley: cloth)
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - (env.dur - 0.45)) / 0.4)), env.strings, { y: 190 });
      TY.plaque(ctx, T, clamp((t - 0.5) / 0.6), ...names(env, 'Shaunaka'), { x: 290, y: 500, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.3 }) });

  // 3 · BEGIN: Sauti answers; in the smoke over the fire, a tall sage and a woman with child (shadow-figures, opaque)
  R.scene({ id: 'begin', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 2, b1 = env.beats[1] ?? 4, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.14, focus: [600, 700] });
      const tap = Math.sin(Math.PI * clamp((t - b0 + 0.1) / 0.24));   // the staff comes down on "Bhrigu" (foley: staff@0)
      frame(ctx, T, t, env, cam, { sauti: 'speak', sk: 0.7 + 0.3 * tap, sspeak: EP41.mouth(env, t), smoke: (g) =>
        EP41.vision(g, 540, 500, 330, T, E.outCubic(clamp((t - b0 + 0.3) / 0.9)), (q) => {
          const L = { dir: -Math.PI / 2, intensity: 1, front: 0, fill: 0 };
          CH.bhrigu.draw(q, { x: -120, y: 250, scale: 0.44, facing: 'right', pose: 'stand', light: L, t: T, key: 'v-b' });
          const a2 = clamp((t - b1 + 0.3) / 0.6); if (a2 > 0) { q.globalAlpha = a2; CH.puloma.draw(q, { x: 130, y: 250, scale: 0.4, facing: 'left', pose: 'shield', light: L, t: T, key: 'v-p' }); q.globalAlpha = 1; }
        }) });
      TY.plaque(ctx, T, clamp((t - b0) / 0.6), ...names(env, 'Bhrigu'), { x: 300, y: 220, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      TY.plaque(ctx, T, clamp((t - b1) / 0.6), 'Puloma', 'his wife', { x: 790, y: 220, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.3 }) });

  // 4 · ALONE: the hermitage at morning; Puloma at the door; Bhrigu walks away to the river with his water-pot (feet planted)
  const BS = 0.96;
  R.scene({ id: 'alone', transition: { type: 'ink', dur: 0.75, at: [560, 760] },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 1.6, cam = CAM.crane(t / env.dur, { from: 1.32, to: 1.04, y0: -380, y1: 20 });
      const d = 150 * Math.max(0, t - b1) * E.outCubic(clamp((t - b1) / 0.5));   // he sets off on "Bhrigu" (foley: steps@1)
      EP41.hermitage(ctx, T, cam, { hutX: 860, figs: (g, p) => {
        CH.bhrigu.draw(g, { x: 400 - d, y: GY + 14, scale: BS, facing: 'left', pose: ACT.pose(t, [[0, 'stand'], [b1 - 0.1, 'walk', { act: 0.35 }]], { phase: ACT.stride(d, BS), prop: 'pot' }), light: ST.light(p, { from: [860, 400], at: [400 - d, GY] }), expression: { emo: 'calm' }, t: T, key: 'al-b' });
        CH.puloma.draw(g, { x: 860, y: GY + 10, scale: 1.02, facing: 'left', pose: ACT.pose(t, [[0, 'attend'], [1.2, 'shield', { act: 0.6 }]]), light: ST.light(p, { from: [860, 400], at: [800, GY], front: 0.5 }), expression: { emo: 'tender', ...ACT.lead(t, [[0, [0.2, 0.2]], [b1, [0.9, 0]]]) }, t: T, key: 'al-p' });
      } });
      fin(ctx, T);
    },
    post: () => DAY });

  // 5 · CAME: a rack focus from Puloma (near) to the rakshasa coming through the trees; she receives him as a guest
  R.scene({ id: 'came', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.6, cam = CAM.mix(CAM.rack(clamp((t - b0) / 0.9), { from: 1.0, to: 0.7, zoom: 1.12, x: -60, soft: 0.45 }), CAM.still({}));
      const d = 260 * E.inOutSine(clamp(t / 2.6)), ps = 0.8;
      EP41.hermitage(ctx, T, cam, { hutX: 1180,
        far: (g, p) => CH.puloman.draw(g, { x: -110 + d, y: HZ + 150, scale: ps, facing: 'right', pose: ACT.pose(t, [[0, 'walk'], [2.6, 'stand', { act: 0.5 }]], { phase: ACT.stride(d, ps * 1.2) }), light: ST.light(p, { from: [860, 400], at: [-110 + d, HZ], front: 0.3 }), expression: { emo: 'resolve', gaze: [0.7, 0.1] }, t: T, key: 'cm-n' }),
        figs: (g, p) => CH.puloma.draw(g, { x: 900, y: GY + 60, scale: 1.14, facing: 'left', pose: ACT.pose(t, [[0, 'attend'], [2.4, 'offer', { act: 0.6 }]]), light: ST.light(p, { from: [860, 400], at: [840, GY], front: 0.5 }), expression: { emo: ACT.emo(t, [[0, 'calm'], [b0 + 0.3, 'wonder'], [2.6, 'calm']]), ...ACT.lead(t, [[0, [0.2, 0.2]], [b0, [0.9, -0.1]]]) }, t: T, key: 'cm-p' }) });
      TY.plaque(ctx, T, clamp((t - b0 - 0.5) / 0.6), ...names(env, 'Puloman'), { x: 300, y: 330, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => DAY });

  // 6 · GIVEN: inside, by the fire (a lamp-glow match cut from the sun); in the smoke, the rite that gave her to Bhrigu
  R.scene({ id: 'given', transition: { type: 'lamp', dur: 0.8, from: [860, 520], to: [470, 900] },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1, cam = CAM.slide(t / env.dur, { from: 110, to: -80, zoom: 1.12, y: 40 });
      EP41.hearth(ctx, T, cam, { fire: 1.05, fs: 1.6, fx: 470, figs: (g, p, fl) => {
        three(g, T, fl, { x: 880, emo: 'sorrow', gaze: [0.3, -0.5], look: -0.06 }, { x: 80, pose: 'attend', emo: 'fear', gaze: [0.8, 0] });
      },
      // the memory, over the flames (foley: cloth@0 as it opens)
      smoke: (g) => EP41.vision(g, 470, 420, 250, T, E.outCubic(clamp((t - b0) / 0.6)), (q) => {
        const L = { dir: -Math.PI / 2, intensity: 1, front: 0, fill: 0 };
        CH.bhrigu.draw(q, { x: -110, y: 230, scale: 0.4, facing: 'right', pose: 'anjali', light: L, t: T, key: 'g-b' });
        CH.puloma.draw(q, { x: 110, y: 230, scale: 0.37, facing: 'left', pose: 'anjali', light: L, t: T, key: 'g-p' });
        q.fillStyle = '#ffb040'; q.beginPath(); q.moveTo(-26, 232); q.quadraticCurveTo(-30, 150, 0, 96 + 10 * Math.sin(T * 6)); q.quadraticCurveTo(30, 150, 26, 232); q.closePath(); q.fill();
      }) });
      fin(ctx, T);
    },
    post: () => FIRE });

  // 7 · FIRE (the turn, after a silence): he turns from her to the fire; the flame rises to meet him; Agni is named
  R.scene({ id: 'fire', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 3, b1 = env.beats[1] ?? 5, cam = CAM.push(clamp(t / env.dur), { from: 1.12, to: 1.42, focus: [640, 760] });
      const rise = E.outCubic(clamp((t - b0) / 0.5));   // the flame rises on "fire" (foley: flame@0)
      EP41.hearth(ctx, T, cam, { fire: 0.9 + 0.38 * rise, fs: 1.7, fx: 480, lean: 0.2 * rise, figs: (g, p, fl) =>
        three(g, T, fl, { x: lerp(960, 890, E.inOutSine(clamp(t / 0.5))), pose: ACT.pose(t, [[0, 'stand'], [b0 - 0.3, 'speak', { act: 0.5 }]]), emo: ACT.emo(t, [[0, 'sorrow'], [0.9, 'resolve']]), speak: 0, ...ACT.lead(t, [[0, [0.9, -0.2]], [0.1, [0.3, 0.6]]], 0.5) }, { x: -330, pose: 'shield', emo: 'fear' }) });
      TY.plaque(ctx, T, clamp((t - b1 + 0.2) / 0.6), ...names(env, 'Agni'), { x: 330, y: 300, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => FIRE });

  // 8 · PRESS (the close-up): Puloma's face in the doorway's daylight as she hears him: calm → fear, a glance to the fire
  R.scene({ id: 'press', transition: { type: 'brush', dur: 0.5, angle: -0.25, color: '#e8d4a8' },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 2.4, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.09, focus: [600, 760] });
      ST.shot(ctx, T, { pal: 'hermitage-green', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500 }) },
        { z: 0.3, soft: 0.45, draw: (g, p) => ST.treeline(g, p, { y: 1500, h: 1400, gap: 460, T, seed: 3, kind: 'mixed' }) },
        { z: 0.8, haze: false, draw: (g) => ST.shafts(g, T, { x: 300, angle: 0.4, alpha: 0.14 }) },
        { z: 1, haze: false, draw: (g, p) => CH.puloma.draw(g, { x: 700, y: 3050, scale: 2.6, facing: 'left', pose: ACT.pose(t, [[0, 'attend'], [b1 - 0.15, 'shield', { act: 0.4 }]]), light: { ...ST.light(p, { from: [100, 300], at: [600, 1200], k: 1.1, front: 0.72 }), tint: ['#ffb050', 0.25] },
          expression: { emo: ACT.emo(t, [[0, 'calm'], [0.9, 'wonder', { dur: 0.5 }], [b1 - 0.1, 'shock', { dur: 0.25 }], [b1 + 0.5, 'fear']]), ...ACT.lead(t, [[0, [0.1, 0.2]], [1.0, [-0.8, 0.1]], [b1 + 0.3, [-0.9, 0.5]]], 0.3, 0.1) }, t: T, key: 'pr-p' }) },
        { z: 1.5, haze: false, draw: (g) => ST.particles(g, T, { kind: 'pollen', count: 20, cam }) },
        { z: 2.0, haze: false, soft: 0.5, draw: (g) => { g.fillStyle = '#140805'; g.fillRect(-300, -400, 420, 2800); } },   // the door post, near and dark
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.22, vignette: 0.42, paper: 0.3 }) });

  // 9 · FEAR: the fire troubled: a tilt down from the smoke to the flame's heart; it sinks, leans away and wavers
  R.scene({ id: 'fear', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, k = E.inOutSine(clamp(t / 3.2)), cam = CAM.tilt(clamp(t / 3.4), { from: -430, to: 40, zoom: 1.5, x: -40 });
      EP41.hearth(ctx, T, cam, { fire: lerp(1.25, 0.72, k), fs: 1.7, fx: 500, lean: -0.34 * k + 0.1 * Math.sin(T * 5.2) * k, dark: 0.3 * k });
      fin(ctx, T);
    },
    post: () => FIRE });

  // 10 · TRUTH (signature; a second silence before it): the three through the hut's dark doorway; the flame bends once toward
  //      the rakshasa and one tongue of it points at her
  const truthIn = (c2, T, t, b0) => { const bend = Math.sin(Math.PI * clamp((t - b0) / 1.6)), k = E.outCubic(clamp((t - b0) / 0.5));
    EP41.hearth(c2, T, CAM.still({ zoom: 0.8, y: 240 }), { fire: 1.25 + 0.15 * k, fs: 1.9, fx: 560, lean: 0.3 * bend + 0.12, figs: (g, p, fl) =>
      three(g, T, fl, { x: 800, front: 0.06, L: { bounce: ['#4a6ab0', 0.7], tint: ['#ffb050', 0.15] }, pose: ACT.pose(t, [[0, 'speak'], [b0 + 1.0, 'stand', { act: 0.5 }]]), emo: ACT.emo(t, [[0, 'resolve'], [b0 + 1.2, 'wrath']]), ...ACT.lead(t, [[0, [0.3, 0.6]], [b0 + 1.4, [0.9, 0]]]) }, { x: 210, pose: ACT.pose(t, [[0, 'shield'], [b0 + 1.3, 'recoil', { act: 0.4 }]]), emo: 'fear', gaze: [0.6, 0.2] }) }); };
  R.scene({ id: 'truth', transition: { type: 'dissolve', dur: 0.2 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.2;
      ST.within(ctx, T, { shape: 'door', pal: 'hearth-amber', box: [150, 230, 780, 1230], open: 1, draw: (c2) => truthIn(c2, T, t, b0) });
      TY.turnWord(ctx, T, clamp((t - b0 - 0.4) / 0.8), 'Truth', { x: 540, y: 1640, size: 84, out: clamp((t - (env.dur - 0.3)) / 0.3), sub: 'the fire is the witness · Adi 1.5' });
      fin(ctx, T);
    },
    post: () => FIRE });

  const CG = 1235, CH_HZ = 1170;   // the chase has its own, higher ground line: the boar's head stays above the caption band
  // 11 · BOAR: a bruised dusk; the rakshasa is a boar (on "boar"), she is on its shoulders (on "seized"), and it runs
  const chase = (ctx, T, cam, figs, extra) => ST.shot(ctx, T, { pal: 'boar-dusk', cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: CH_HZ }) },
    { z: 0.12, draw: (g, p) => ST.cloudBank(g, p, T, { y: 460, count: 7, speed: 40, color: '#3a1440', alpha: 0.9, size: 1.5 }) },
    { z: 0.3, draw: (g, p) => ST.hills(g, p, { y: CH_HZ, h: 520, seed: 4, peaks: 0.5 }) },
    { z: 0.6, draw: (g, p) => ST.treeline(g, p, { y: CH_HZ + 30, h: 700, T: T * 3, sway: 26, seed: 7, kind: 'sal' }) },
    { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: CG - 30 }); figs(g, p); } },
    { z: 1.3, haze: false, draw: (g) => { ST.particles(g, T, { kind: 'dust', count: 50, cam }); if (extra) extra(g); } },
    { z: 2.0, haze: false, soft: 0.35, draw: (g, p) => ST.trunks(g, p, { xs: [-280, 1360], w: 190 }) },
  ] });
  const rider = (g, p, T, x, y, s, emo) => CH.puloma.draw(g, { x: x + 110 * s, y: y - 560 * s, scale: 0.56 * s, facing: 'left', pose: { w: { kneel: 0.75, recoil: 0.25 }, wind: 1 }, light: ST.light(p, { from: [200, 300], at: [x, y], front: 0.85, k: 1.25 }), expression: { emo: emo || 'fear', gaze: [-0.6, -0.2] }, t: T, key: 'rd' });
  R.scene({ id: 'boar', transition: { type: 'smoke', dur: 0.7, dir: Math.PI, color: '#8a5a88' },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.3, b1 = env.beats[1] ?? 2.2, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 150, zoom: 1.12 });
      const run = Math.max(0, t - b1 - 0.15), x = 960 - 130 * run * run - 240 * run, ph = T * 13 * clamp((t - b1) / 0.5);
      chase(ctx, T, cam, (g, p) => {
        // the rakshasa is already inside the smoke of his change when the shot opens (he is never drawn on this purple: a dark figure on a dark ground)
        if (t < b1 + 0.1) CH.puloma.draw(g, { x: 250, y: CG + 16, scale: 0.9, facing: 'right', pose: ACT.pose(t, [[0, 'shield'], [b0, 'recoil', { act: 0.3 }]]), light: ST.light(p, { from: [200, 300], at: [250, CG], front: 0.85, k: 1.25 }), expression: { emo: 'fear' }, t: T, key: 'bo-p' });
        if (t >= b0) { const s = 0.82; CH.boar.draw(g, { x, y: CG + 10, scale: s, pose: { name: 'run', phase: ph }, light: ST.light(p, { from: [200, 300], at: [x, CG], k: 1.1 }), t: T, key: 'bo-b' }); if (t >= b1 + 0.1) rider(g, p, T, x, CG + 10, s); }
      }, (g) => { { const a0 = 1 - clamp((t - b0 - 0.1) / 0.35); if (a0 > 0.01) { g.save(); g.globalAlpha = a0; g.fillStyle = '#5a3a60'; for (let i = 0; i < 11; i++) { g.beginPath(); g.arc(800 + 130 * Math.cos(i * 2.4 + T * 0.6), CG - 460 + 400 * Math.sin(i * 1.7), 200 + 40 * Math.sin(T * 3 + i), 0, 7); g.fill(); } g.fillStyle = '#ff5a30'; g.globalAlpha = a0 * (0.6 + 0.4 * Math.sin(T * 7)); g.beginPath(); g.arc(770, CG - 900, 14, 0, 7); g.fill(); g.restore(); } }
        for (const [t0, cx, cy, rr] of [[b0, 800, CG - 420, 190], [b1 + 0.1, 250, CG - 420, 150], [b1 + 0.1, 1040, CG - 600, 120]]) { const a = Math.sin(Math.PI * clamp((t - t0 + 0.25) / 0.6)); if (a > 0.01) { g.save(); g.globalAlpha = a; g.fillStyle = '#5a3a60'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(cx + 0.63 * rr * Math.cos(i * 2.4), cy + 1.7 * rr * Math.sin(i * 1.7), rr + 40 * Math.sin(T * 3 + i), 0, 7); g.fill(); } g.restore(); } } });
      ST.vignette(ctx, { color: '#10041a', alpha: 0.5 }); fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.5, paper: 0.28 }) });

  // 12 · CLIFF: the boar running with her; on "fell" a white-gold light drops to the ground under it and it rears; a pull back
  const cliff = (ctx, T, t, env, src) => {
    const b0 = (env.beats && env.beats[0]) ?? 0.8, b1 = (env.beats && env.beats[1]) ?? 2.6, cam = CAM.pull(clamp(t / 4.6), { from: 1.36, to: 1.02, focus: [560, 1000] });
    const hit = clamp((t - b1) / 0.25), fall = E.inQuad ? E.inQuad(clamp((t - b0) / (b1 - b0))) : clamp((t - b0) / (b1 - b0)) ** 2, rear = E.outCubic(clamp((t - b1) / 0.4));
    const x = lerp(860, 600, E.outCubic(clamp(t / 2.4))), blaze = t > b1 ? 0.75 + 0.25 * Math.sin(T * 9) : 0;
    chase(ctx, T, cam, (g, p) => {
      g.save(); g.translate(x, CG + 10); g.rotate(0.3 * rear); g.translate(-x, -(CG + 10));
      CH.boar.draw(g, { x, y: CG + 10 - 40 * rear, scale: 0.82, pose: { name: 'run', phase: T * 13 * (1 - 0.8 * rear) }, light: { ...ST.light(p, { from: [x - 200, CG], at: [x, CG], k: 1.1 + 0.6 * blaze }), tint: ['#fff0b0', 0.7 * blaze + 0.2] }, t: T, key: 'cl-b' });
      rider(g, p, T, x, CG + 10 - 40 * rear, 0.82, 'shock'); g.restore();
      if (t > b0) { const cx = x - 250, cy = lerp(CG - 520, CG - 40, fall); // the child, a falling light
        KIT.glow(g, cx, cy, 160 + 520 * hit, '#fff2b0', 0.9); KIT.glow(g, cx, cy, 60 + 200 * hit, '#ffffff', 1);
        if (hit > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(cx, CG); g.scale(1, 0.18); KIT.glow(g, 0, 0, 1100 * hit, '#ffe890', 0.7 * blaze); g.restore(); } }
    });
    ST.vignette(ctx, { color: '#10041a', alpha: 0.45 });
    if (src) TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 110 });
    fin(ctx, T);
  };
  R.scene({ id: 'cliff', transition: { type: 'dissolve', dur: 0.25 }, draw(ctx, t, env) { cliff(ctx, env.T, t, env, true); }, post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.28 }) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, 4.89 + t, { ...env, beats: [0.81, 2.85] }, true) });
})();
