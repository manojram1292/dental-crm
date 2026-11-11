/* Episode 42 · The Child Who Fell (CE Adi 1.6.1–13). One scene per line of script/ep42.en.json.
 * Loads after ep41/_common (EP41: hearth, hermitage, naimisha, lit, mouth). The fire has no face; no thrown water; no body
 * touches another by accident; every sound cue has its action on the same beat. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41;
  const { TAU, clamp, lerp, E, hash } = R;
  const GY = EP41.GY, HZ = EP41.HZ;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const names = (env, n) => [n, env.script.names[n]];
  const EP42 = (window.EP42 = {});

  // the dusk of the chase (boar-dusk), shared with episode 43's memory
  EP42.chase = EP41.chase; EP42.rider = EP41.rider;
  // the new-born, the brightest thing in the frame: a white-gold light with a small figure in it
  EP42.child = (g, T, x, y, s = 1, k = 1) => {
    KIT.glow(g, x, y - 200 * s, 900 * s * k, '#ffe890', 0.55 * k); KIT.glow(g, x, y - 200 * s, 380 * s * k, '#fffbe0', 0.9 * k);
    CH.chyavanaChild.draw(g, { x, y, scale: 0.92 * s, facing: 'left', pose: 'stand', light: { dir: -Math.PI / 2, intensity: 1.5, front: 1, fill: 0.9 }, expression: { emo: 'calm' }, t: T, key: 'ch' });
  };
  // the land in the child's light: everything else thrown into deep blue shadow (sun-white)
  const blaze = (ctx, T, cam, figs) => ST.shot(ctx, T, { pal: 'sun-white', cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ }) },
    { z: 0.3, draw: (g, p) => ST.hills(g, p, { y: HZ, h: 520, seed: 4, peaks: 0.5 }) },
    { z: 0.6, draw: (g, p) => ST.treeline(g, p, { y: HZ + 30, h: 700, T, seed: 7, kind: 'sal' }) },
    { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 30 }); figs(g, p); } },
    { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 40, cam }) },
    { z: 2.0, haze: false, soft: 0.35, draw: (g, p) => ST.trunks(g, p, { xs: [-280, 1360], w: 190 }) },
  ] });

  // 1 · HOOK: the child on the ground, blazing; the boar thrown back, dark
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.8, cam = CAM.drift(CAM.pull(clamp(t / 3.2), { from: 1.5, to: 1.06, focus: [470, 1150], ease: E.outCubic }), T, 0.5);
      const flare = 1 + 0.35 * Math.sin(Math.PI * clamp((t - b0) / 0.5));   // the light flares on "fell" (foley: flame@0)
      blaze(ctx, T, cam, (g, p) => {
        g.save(); g.translate(900, GY); g.rotate(0.32); g.translate(-900, -GY);
        CH.boar.draw(g, { x: 930, y: GY - 30, scale: 0.9, pose: { name: 'run', phase: 1.2 + 0.3 * Math.sin(T * 2) }, light: { dir: Math.PI, intensity: 1.2, front: 0.05, fill: 0, tint: ['#fff0b0', 0.8], wrap: 0.5 }, t: T, key: 'hk-b' }); g.restore();
        EP42.child(g, T, 430, GY + 6, 1, flare);
      });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, clamp(t / 0.25), line.text, { y: 1490, size: 72, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.15) / 0.6);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 1500, key: 'ep42-title' });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.5, vignette: 0.5, paper: 0.28 }) });

  // 2 · CARRIED: a moment earlier: the boar running with her through the dusk (a lateral track)
  R.scene({ id: 'carried', transition: { type: 'smoke', dur: 0.7, dir: Math.PI, color: '#8a5a88' },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 2, cam = CAM.slide(t / env.dur, { from: 150, to: -150, zoom: 1.12 });
      const surge = Math.sin(Math.PI * clamp((t - b0) / 0.5)), x = 700 - 20 * t - 70 * surge;   // the boar surges and tosses its head on "boar's" (foley: growl@0)
      EP42.chase(ctx, T, cam, (g, p) => { g.save(); g.translate(x, EP41.CG); g.rotate(-0.05 * surge); g.translate(-x, -EP41.CG);
        CH.boar.draw(g, { x, y: EP41.CG + 10, scale: 0.82, pose: { name: 'run', phase: T * 13 }, light: ST.light(p, { from: [200, 300], at: [x, EP41.CG], k: 1.1 }), t: T, key: 'ca-b' }); EP42.rider(g, p, T, x, EP41.CG + 10, 0.82); g.restore(); });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 3.2) / 0.4)), env.strings, { y: 190 });
      ST.vignette(ctx, { color: '#10041a', alpha: 0.5 }); fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.5, paper: 0.28 }) });

  // 3 · FELL: the child falls, a comet of white gold; a tilt down with him; he lands on "dropped" (foley: thud@1)
  R.scene({ id: 'fell', transition: { type: 'lamp', dur: 0.8, from: [540, 700], to: [560, 500] },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.6, b1 = env.beats[1] ?? 3, k = clamp((t - b0) / (b1 - b0)), cam = CAM.tilt(E.inOutSine(k), { from: -520, to: 60, zoom: 1.25 });
      const y = lerp(GY - 1300, GY, k * k), land = clamp((t - b1) / 0.3);
      blaze(ctx, T, cam, (g) => {
        if (k < 1) { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const u = i / 14; g.globalAlpha = 0.5 * (1 - u); g.fillStyle = '#fff2b0'; g.beginPath(); g.ellipse(560 + 30 * Math.sin(i * 1.3 + T * 5) * u, y - 220 - u * 620 * k, 60 * (1 - u) + 8, 90 * (1 - u) + 10, 0, 0, TAU); g.fill(); } g.restore(); }
        EP42.child(g, T, 560, y + 6, 1, 0.8 + 0.5 * Math.sin(Math.PI * land));
        if (land > 0 && land < 1) { g.save(); g.strokeStyle = '#fff6c8'; g.lineWidth = 10 * (1 - land); g.beginPath(); g.ellipse(560, GY, 520 * land, 80 * land, 0, 0, TAU); g.stroke(); g.restore(); }
      });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.5, vignette: 0.5, paper: 0.28 }) });

  // 4 · ASH: the colour drains; the rakshasa lets her go, greys, and blows away as ash; the child bright in the middle
  R.scene({ id: 'ash', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.2, b1 = env.beats[1] ?? 2.4, b2 = env.beats[2] ?? 3.9, cam = CAM.push(t / env.dur, { from: 1.04, to: 1.2, focus: [600, 900] });
      const burn = clamp((t - b1) / 0.5), gone = E.inOutSine(clamp((t - b2) / 0.9));
      ST.shot(ctx, T, { pal: 'ash-grey', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ }) },
        { z: 0.3, draw: (g, p) => ST.hills(g, p, { y: HZ, h: 520, seed: 4, peaks: 0.5 }) },
        { z: 0.6, draw: (g, p) => ST.treeline(g, p, { y: HZ + 30, h: 700, T, seed: 7, kind: 'sal' }) },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 30 });
          // she is set down, clear of him, on "let her go"
          CH.pulomaMother.draw(g, { x: 70, y: GY + 16, scale: 0.98, facing: 'right', pose: ACT.pose(t, [[0, 'recoil'], [b0, 'shield', { act: 0.5 }]]), light: { ...ST.light(p, { from: [520, 900], at: [70, GY], front: 0.95, k: 1.3 }), tint: ['#fff0b0', 0.5] }, expression: { emo: ACT.emo(t, [[0, 'fear'], [b2, 'wonder']]), gaze: [0.7, 0.4] }, t: T, key: 'as-p' });
          EP42.child(g, T, 470, GY + 6, 1, 0.75);
          if (gone < 0.98) { g.save(); g.globalAlpha = 1 - gone;
            CH.puloman.draw(g, { x: 990, y: GY + 20, scale: 0.9, facing: 'left', pose: ACT.pose(t, [[0, 'stand'], [b0 - 0.2, 'recoil', { act: 0.35 }], [b1, 'collapse', { act: 0.9 }]]), light: { dir: Math.PI, intensity: 1.3, front: lerp(0.5, 0.05, burn), fill: 0.1, tint: [burn > 0.5 ? '#b8b8b8' : '#fff0b0', 0.8], wrap: 0.5 }, expression: { emo: 'shock' }, t: T, key: 'as-n' });
            g.restore(); }
          if (burn > 0) { g.save(); for (let i = 0; i < 160; i++) { const u = clamp((t - b1 - 0.6 * hash(i, 1)) / 1.8); if (u <= 0) continue; const x0 = 870 + 260 * hash(i, 2), y0 = GY - 1000 * hash(i, 3); g.globalAlpha = (1 - u) * 0.9; g.fillStyle = i % 3 ? '#8a8a8a' : '#d0d0d0'; g.beginPath(); g.arc(x0 + 520 * u * (0.4 + hash(i, 4)), y0 - 160 * u + 60 * Math.sin(i + T * 2), 5 + 7 * hash(i, 5), 0, TAU); g.fill(); } g.restore(); }
        } },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.3 }) });

  // 5–6 · the river bank in jade: Puloma walks on with her son; her tears become a river behind her
  const bank = (ctx, T, cam, t, o = {}) => ST.shot(ctx, T, { pal: 'river-jade', cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ - 60 }) },
    { z: 0.12, draw: (g, p) => { ST.cloudBank(g, p, T, { y: 400, count: 5, size: 1.3 }); if (o.cloud) o.cloud(g, p); } },
    { z: 0.3, draw: (g, p) => ST.hills(g, p, { y: HZ - 60, h: 460, seed: 11 }) },
    { z: 0.55, draw: (g, p) => ST.treeline(g, p, { y: HZ - 20, h: 620, T, seed: 13, kind: 'mixed' }) },
    { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 }); if (o.river) o.river(g, p); if (o.figs) o.figs(g, p); } },
    { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'pollen', count: 26, cam }) },
    { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => ST.grass(g, p, { y: 1950, h: 300, T, count: 44 }) },
  ] });
  const PS = 0.98, walker = (g, p, T, t, x, d) => CH.pulomaMother.draw(g, { x, y: GY + 12, scale: PS, facing: 'left', pose: ACT.pose(t, [[0, 'carry']], { phase: ACT.stride(d, PS * 0.5), stride: 0.5 }), light: ST.light(p, { from: [200, 300], at: [x, GY], front: 0.55 }), expression: { emo: 'sorrow', gaze: [0.1, 0.5] }, t: T, key: 'wk-p' }), babe = (g, x) => { KIT.glow(g, x - 70, GY - 640, 170, '#ffe890', 0.75); KIT.glow(g, x - 70, GY - 640, 70, '#fffbe0', 1); };
  R.scene({ id: 'walk', transition: { type: 'brush', dur: 0.5, angle: 0.2, color: '#cfe8d8' },
    draw(ctx, t, env) {
      const T = env.T, d = 70 * t, cam = CAM.slide(t / env.dur, { from: 120, to: -120, zoom: 1.12 });
      bank(ctx, T, cam, t, { figs: (g, p) => { walker(g, p, T, t, 760 - d, d); babe(g, 760 - d); },
        cloud: (g) => { g.save(); g.globalAlpha = 0.8 * E.outCubic(clamp((t - 1.2) / 1.2)); CH.brahma.draw(g, { x: 280, y: 900, scale: 0.85, facing: 'right', pose: { name: 'bless', k: clamp((t - 2) / 1) }, light: { dir: -Math.PI / 2, intensity: 1.2, front: 0.8, fill: 0.6 }, t: T, key: 'wk-br' }); g.restore(); } });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.28, vignette: 0.42, paper: 0.3 }) });
  R.scene({ id: 'river', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.6, b1 = env.beats[1] ?? 2.3, b2 = env.beats[2] ?? 4.2, d = 70 * (4.45 + t), cam = CAM.crane(t / env.dur, { from: 1.4, to: 0.92, y0: 160, y1: -150, x0: -120, x1: 60 });
      const grow = E.inOutSine(clamp((t - b0 + 0.3) / 3.2)), xP = 760 - d;
      bank(ctx, T, cam, t, { figs: (g, p) => { walker(g, p, T, 4.45 + t, xP, d); babe(g, xP); },
        river: (g) => { if (grow <= 0) return; const x0 = xP + 90, x1 = lerp(x0 + 40, 2000, grow);   // the bright thread runs out behind her steps and widens (foley: drip@0, then water)
          g.save(); const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, '#f4fffb'); gr.addColorStop(1, '#3ab0a0'); g.fillStyle = gr;
          g.beginPath(); g.moveTo(x0, GY + 34); for (let i = 0; i <= 20; i++) { const u = i / 20, x = lerp(x0, x1, u); g.lineTo(x, GY + 34 - 6 * Math.sin(u * 9 + T * 2) - 4 * u * grow); } for (let i = 20; i >= 0; i--) { const u = i / 20, x = lerp(x0, x1, u); g.lineTo(x, GY + 44 + (30 + 520 * grow) * u * u + 8 * Math.sin(u * 7 - T * 2)); } g.closePath(); g.fill();
          g.globalAlpha = 0.7; g.fillStyle = '#ffffff'; for (let i = 0; i < 26; i++) { const u = hash(i, 3), x = lerp(x0, x1, u) + ((T * 60 * (0.5 + hash(i, 4))) % 120); g.beginPath(); g.ellipse(x, GY + 50 + (20 + 420 * grow) * u * u * hash(i, 5), 30 + 60 * u, 3, 0, 0, TAU); g.fill(); } g.restore(); } });
      TY.plaque(ctx, T, clamp((t - b1 + 0.2) / 0.6), ...names(env, 'Brahma'), { x: 300, y: 300, out: clamp((t - b2 + 0.1) / 0.3) });
      TY.plaque(ctx, T, clamp((t - b2) / 0.6), ...names(env, 'Vadhusara'), { x: 620, y: 300, out: clamp((t - (env.dur - 0.35)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.42, paper: 0.3 }) });

  // 7 · HOME: a rack focus from the mother and child (near) to Bhrigu arriving at the gate; he sets his water-pot down
  R.scene({ id: 'home', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.6, cam = CAM.rack(clamp((t - 0.2) / 0.8), { from: 1.0, to: 0.7, zoom: 1.1, x: 40 });
      const d = 200 * E.outCubic(clamp(t / 1.6)), bs = 0.82;
      EP41.hermitage(ctx, T, cam, { hutX: -140,
        far: (g, p) => CH.bhrigu.draw(g, { x: 1150 - d, y: HZ + 150, scale: bs, facing: 'left', pose: ACT.pose(t, [[0, 'walk'], [b0 + 0.5, 'stand', { act: 0.4 }]], { phase: ACT.stride(d, bs), prop: t < b0 + 0.6 ? 'pot' : false }), light: ST.light(p, { from: [860, 400], at: [1000, HZ], front: 0.4 }), expression: { emo: 'calm' }, t: T, key: 'hm-b' }),
        figs: (g, p) => { CH.pulomaMother.draw(g, { x: 230, y: GY + 60, scale: 1.12, facing: 'right', pose: 'carry', light: ST.light(p, { from: [860, 400], at: [230, GY], front: 0.5 }), expression: { emo: 'sorrow', gaze: [0.8, 0] }, t: T, key: 'hm-p' }); KIT.glow(g, 310, GY - 680, 190, '#ffe890', 0.75); KIT.glow(g, 310, GY - 680, 80, '#fffbe0', 1); } });
      TY.plaque(ctx, T, clamp((t - 0.5) / 0.5), ...names(env, 'Bhrigu'), { x: 800, y: 330, out: clamp((t - (env.dur - 0.3)) / 0.25) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.26, vignette: 0.4, paper: 0.3 }) });

  // 8 · WHO (the turn, after a silence; the close-up): relief at his son, then the brow comes down: a hunt for someone to blame
  R.scene({ id: 'who', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.2, sp0 = env.speech[0], cam = CAM.push(t / env.dur, { from: 1.0, to: 1.1, focus: [480, 760] });
      ST.shot(ctx, T, { pal: 'hermitage-green', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500 }) },
        { z: 0.3, soft: 0.45, draw: (g, p) => ST.treeline(g, p, { y: 1500, h: 1400, gap: 460, T, seed: 17, kind: 'mixed' }) },
        { z: 0.8, haze: false, draw: (g) => ST.shafts(g, T, { x: 760, angle: -0.4, alpha: 0.14 }) },
        { z: 1, haze: false, draw: (g, p) => CH.bhrigu.draw(g, { x: 380, y: 3230, scale: 2.5, facing: 'right', pose: ACT.pose(t, [[0, 'stand'], [sp0 - 0.2, 'speak', { act: 0.4 }]], { prop: false }), light: ST.light(p, { from: [980, 300], at: [480, 1200], k: 1.1, front: 0.72 }),
          expression: { emo: ACT.emo(t, [[0, 'tender'], [sp0 - 0.45, 'resolve', { dur: 0.35 }], [b0 - 0.1, 'wrath', { dur: 0.3 }]]), speak: EP41.mouth(env, t), ...ACT.lead(t, [[0, [0.3, 0.6]], [sp0 - 0.5, [0.9, 0.1]]], 0.3, 0.12) }, t: T, key: 'wh-b' }) },
        { z: 1.5, haze: false, draw: (g) => ST.particles(g, T, { kind: 'pollen', count: 20, cam }) },
      ] });
      TY.turnWord(ctx, T, clamp((t - b0) / 0.7), 'Who?', { x: 800, y: 240, size: 84, out: clamp((t - (env.dur - 0.3)) / 0.3), sub: 'Adi 1.6.9' });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.22, vignette: 0.42, paper: 0.3 }) });

  // 9 · TOLD: she looks toward the hut: a tilt from the daylight in the doorway down to the household fire burning inside
  R.scene({ id: 'told', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 2.5, cam = CAM.tilt(clamp(t / 2.6), { from: -300, to: 90, zoom: 1.22, x: 60 });
      EP41.hearth(ctx, T, cam, { fire: 1.0, fs: 1.5, fx: 430, door: { x: 900, w: 320, h: 1000 }, figs: (g, p, fl) =>
        CH.pulomaMother.draw(g, { x: 900, y: GY + 10, scale: 0.9, facing: 'left', pose: ACT.pose(t, [[0, 'point', { act: 0.5 }], [b1 - 0.15, 'carry', { act: 0.5 }]]), light: { ...EP41.lit(900, fl, 0.5, 430), fill: 0.25 }, expression: { emo: 'sorrow', speak: EP41.mouth(env, t), ...ACT.lead(t, [[0, [0.8, 0.3]], [b1, [0.2, 0.8]]]) }, t: T, key: 'tl-p' }) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.3 }) });

  // 10 · NAMED (the frame): Sauti to Shaunaka, who lowers his head: he is your ancestor
  R.scene({ id: 'named', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.9, b1 = env.beats[1] ?? 7.3, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 110, zoom: 1.12 });
      const tap = Math.sin(Math.PI * clamp((t - b0 + 0.1) / 0.24));
      EP41.naimisha(ctx, T, cam, { figs: (g, p, fl) => {
        CH.elder.draw(g, { x: 215, y: GY + 20, scale: 1.02, facing: 'right', pose: { name: 'bow', k: 0.25 * E.outCubic(clamp(t / 0.4)) + 0.6 * E.inOutSine(clamp((t - b1) / 0.6)), base: 'sit' }, light: { ...EP41.lit(215, fl, 0.85), fill: 0.45, intensity: 1.5 }, t: T, key: 'f-el' });
        CH.sauti.draw(g, { x: 880, y: GY + 20, scale: 1.02, facing: 'left', pose: { name: 'speak', k: 0.7 + 0.3 * tap, base: 'sit' }, light: { ...EP41.lit(880, fl, 0.6), fill: 0.3 }, expression: { speak: EP41.mouth(env, t) }, t: T, key: 'f-sa' });
      }, smoke: (g) => EP41.vision(g, 540, 500, 300, T, E.outCubic(clamp((t - b0 + 0.3) / 0.8)), (q) => {
        q.fillStyle = '#fff6c8'; q.beginPath(); q.arc(0, 60, 150, 0, TAU); q.fill();
        CH.chyavanaChild.draw(q, { x: 0, y: 210, scale: 0.6, facing: 'left', pose: 'stand', light: { dir: -Math.PI / 2, intensity: 1, front: 0, fill: 0 }, t: T, key: 'nm-c' }); }) });
      TY.plaque(ctx, T, clamp((t - b0) / 0.6), ...names(env, 'Chyavana'), { x: 540, y: 190, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.3 }) });

  // 11 · TURNED: from inside the hut, through the doorway: Bhrigu fills the door against a crimson sky; the fire between us and him
  const wrathOut = (g2, T) => { const p = ST.pal('wrath-crimson'); ST.shot(g2, T, { pal: p, layers: [{ z: 0, draw: (g, pp) => ST.sky(g, pp, { hz: 1500 }) }, { z: 0.4, draw: (g, pp) => ST.treeline(g, pp, { y: 1520, h: 700, T, seed: 3, kind: 'mixed' }) }] }); return p; };
  R.scene({ id: 'turned', transition: { type: 'ink', dur: 0.75, at: [540, 800] },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 3, fl = KIT.flicker(T, 3), come = E.outCubic(clamp(t / 1.4)), rise = E.outCubic(clamp((t - b1) / 0.4));
      ST.within(ctx, T, { shape: 'door', pal: 'wrath-crimson', box: [200, 200, 680, 1260], open: 1, draw: (c2) => { const p = wrathOut(c2, T);
        c2.fillStyle = '#2a0a0a'; c2.fillRect(-200, 1460, 1500, 600);
        CH.bhrigu.draw(c2, { x: 540, y: lerp(1500, 1560, come), scale: lerp(0.9, 1.22, come), facing: 'left', pose: ACT.pose(t, [[0, 'walk'], [1.3, 'stand', { act: 0.4 }]], { phase: ACT.stride(120 * come, 1), prop: false }), light: { dir: Math.PI / 2, intensity: 1.2 * fl, front: 0.2 + 0.25 * rise, fill: 0.05, wrap: 0.6, tint: ['#ff9040', 0.7], bounce: ['#5a1020', 0.2], minLum: 0 }, expression: { emo: 'wrath', gaze: [0.3, 0.7] }, t: T, key: 'tu-b' }); } });
      CH.hearthfire.draw(ctx, { x: 540, y: 1960, scale: 1.25, t: T, k: 0.8 + 0.5 * rise, key: 'tu-f' });   // the hearth, near; it leaps as he reaches it (foley: flame@1)
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.42, vignette: 0.55, paper: 0.3 }) });

  // 12 · CLIFF: raise (anticipation), then the arm thrown forward at the flames, the palm open; the fire sinks and darkens
  const curseKeys = (b0) => [[0, 'stand'], [b0 - 1.0, 'raise', { act: 0.42, an: 0.08 }], [b0 - 0.3, 'curse', { antic: 0.26, act: 0.13, settle: 0.5, an: 0.16, over: 0.1 }]];
  const cliff = (ctx, T, t, env, b0, b1) => {
    const cam = CAM.push(clamp(t / 4), { from: 1.02, to: 1.2, focus: [600, 800] }), hit = clamp((t - b1) / 1.0);
    ST.shot(ctx, T, { pal: 'wrath-crimson', cam, layers: [
      { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ }) },
      { z: 0.3, draw: (g, p) => { ST.hills(g, p, { y: HZ, h: 380, seed: 6 }); ST.treeline(g, p, { y: HZ + 20, h: 520, T, seed: 2, kind: 'mixed' }); } },
      { z: 0.5, haze: false, draw: (g) => KIT.glow(g, 200, GY - 500, 700, '#ff5a1e', 0.4 * (1 - 0.7 * hit)) },
      { z: 0.75, haze: false, draw: (g) => CH.hearthfire.draw(g, { x: 250, y: GY - 10, scale: 1.5, t: T, k: lerp(1.15, 0.6, E.inOutSine(hit)), dark: 0.75 * E.inOutSine(hit), lean: -0.35 * Math.sin(Math.PI * clamp((t - b0) / 0.8)), key: 'cl-f' }) },
      { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
        CH.bhrigu.draw(g, { x: 800, y: GY + 20, scale: 1.14, facing: 'left', pose: ACT.pose(t, curseKeys(b0), { wind: 0.6, prop: false }), light: ST.light(p, { from: [250, 900], at: [800, GY], k: KIT.flicker(T, 1) * 1.45, front: 1 }), expression: { emo: ACT.emo(t, [[0, 'resolve'], [0.5, 'wrath']]), speak: 0 }, t: T, key: 'cl-b' }); } },
      { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 40, cam }) },
      { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => ST.grass(g, p, { y: 1960, h: 260, T, count: 50 }) },
    ] });
    TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 110 });
    fin(ctx, T);
  };
  R.scene({ id: 'cliff', transition: { type: 'dissolve', dur: 0.25 }, draw(ctx, t, env) { cliff(ctx, env.T, t, env, env.beats[0] ?? 1.2, env.beats[1] ?? 2.7); }, post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.28 }) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, EP42.cliffDur + t, env, EP42.cliffB[0], EP42.cliffB[1]) });
  EP42.cliffDur = 3.92; EP42.cliffB = [1.18, 2.67];
})();
