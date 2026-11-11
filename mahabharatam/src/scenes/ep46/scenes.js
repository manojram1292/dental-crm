/* Episode 46 · The Snake Who Was a Sage (CE Adi 1.9.18–1.12.5) · THE ARC FINALE. One scene per line of script/ep46.en.json.
 * Loads after ep41/_common, ep44/_common (EP44.wood) and ep46/_common (EP46.hall, EP46.arcCard).
 * Staging rule (snake and man): a waist-up two-shot on clear ground, the snake two body-widths in front of him, rearing on an
 * S-curve to his chest height; in `plea` the snake is alone in the frame. The payoff (`freed`) is lit, close and ≥ 4 s. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41, EP44 = window.EP44, EP46 = window.EP46;
  const { TAU, clamp, lerp, E, hash } = R;
  const GY = EP41.GY, HZ = EP41.HZ;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const names = (env, n) => [n, env.script.names[n]];
  const RX = 900, SX = 270;

  // the green shade where the old snake lies (thicket-shade)
  const shade = (ctx, T, cam, figs, o = {}) => ST.shot(ctx, T, { pal: 'thicket-shade', cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ }) },
    { z: 0.35, draw: (g, p) => { ST.treeline(g, p, { y: HZ + 20, h: 1000, gap: 340, T, seed: 12, kind: 'mixed' }); if (o.far) o.far(g, p); } },
    { z: 0.8, haze: false, draw: (g) => ST.shafts(g, T, { x: o.sx ?? 300, angle: 0.3, alpha: 0.14, color: '#f0f4a0' }) },
    { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 }); figs(g, p); } },
    { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 30, cam }) },
    { z: 1.8, haze: false, soft: 0.3, draw: (g, p) => ST.grass(g, p, { y: 1940, h: 320, T, count: 46 }) },
  ] });
  const snake = (g, p, T, k, speak, o = {}) => CH.dundubha.draw(g, { x: o.x ?? SX, y: o.y ?? GY - 30, scale: o.s ?? 0.95, facing: 'right', pose: { name: 'rise', k }, light: ST.light(p, { from: [300, 300], at: [o.x ?? SX, GY], front: o.front ?? 0.6, k: 1.15 }), expression: { speak }, t: T, key: o.key || 'sn' });
  const talk = (env, t) => (t > env.speech[0] && t < env.speech[1] ? 0.5 + 0.5 * Math.sin(env.T * 12) : 0);

  // 1 · HOOK: the old snake's head raised, its mild eye open, in deep green shade; Ruru's staff a hard diagonal above
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.8, cam = CAM.drift(CAM.rack(clamp((t - 0.2) / 0.8), { from: 1.8, to: 1.0, zoom: 1.5, x: -220, y: 170 }), T, 0.5);
      const drop = E.outCubic(clamp((t - b0 + 0.1) / 0.25));   // the staff comes into frame on "snake" (foley: staff@0)
      shade(ctx, T, cam, (g, p) => { snake(g, p, T, 0.9 + 0.1 * Math.sin(T * 1.1), 0);
        g.save(); g.strokeStyle = '#2a1a0c'; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(1100, 420 - 300 * (1 - drop)); g.lineTo(560, 860 - 300 * (1 - drop)); g.stroke(); g.strokeStyle = 'rgba(240,244,160,0.6)'; g.lineWidth = 4; g.beginPath(); g.moveTo(1096, 408 - 300 * (1 - drop)); g.lineTo(556, 848 - 300 * (1 - drop)); g.stroke(); g.restore(); });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, clamp(t / 0.2), line.text, { y: 1480, size: 76, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.15) / 0.6);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 1500, key: 'ep46-title' });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.24, vignette: 0.5, paper: 0.3 }) });

  // 2 · VOW: Ruru striding through the dry wood at noon; then the staff goes up over the old snake (a crane down to the two)
  R.scene({ id: 'vow', transition: { type: 'brush', dur: 0.5, angle: 0.2, color: '#f4e0a8' },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 2, b2 = b[2] ?? 3.8, d = 300 * E.inOutSine(clamp(t / (b1 + 0.4))), cam = CAM.crane(t / env.dur, { from: 1.0, to: 1.22, y0: -260, y1: 60, x0: 60, x1: -40 });
      EP44.wood(ctx, T, cam, (g, p) => {
        CH.ruru.draw(g, { x: RX + 300 - d, y: GY + 10, scale: 1.08, facing: 'left', pose: ACT.pose(t, [[0, 'walk'], [b1, 'stand', { act: 0.3 }], [b2 - 0.5, 'raise', { act: 0.5, an: 0.1 }]], { phase: ACT.stride(d, 1.08), prop: 'staff' }), light: ST.light(p, { from: [300, 300], at: [RX, GY], front: 0.08, fill: 0 }), expression: { emo: 'wrath', ...ACT.lead(t, [[0, [0.5, 0]], [b1 - 0.2, [0.3, 0.7]]]) }, t: T, key: 'vw-r' });
        snake(g, p, T, lerp(0.74, 0.9, E.inOutSine(clamp((t - b2) / 0.8))), 0, { front: 0.05, y: GY - 120 });
      });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 3.2) / 0.4)), env.strings, { y: 190 });
      TY.plaque(ctx, T, clamp((t - 0.5) / 0.6), ...names(env, 'Ruru'), { x: 300, y: 560, out: clamp((t - 3.4) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.26, vignette: 0.45, paper: 0.3 }) });

  // 3 · PLEA: the snake alone in the frame, reared on its S-curve, speaking; Ruru's staff only as a shadow
  R.scene({ id: 'plea', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.8, cam = CAM.push(t / env.dur, { from: 1.3, to: 1.55, focus: [420, 900] });
      shade(ctx, T, cam, (g, p) => { snake(g, p, T, lerp(0.8, 1, E.outCubic(clamp(t / 0.6))) + 0.03 * Math.sin(T * 1.4), talk(env, t));
        g.save(); g.globalAlpha = 0.35; g.strokeStyle = '#06140a'; g.lineWidth = 40; g.lineCap = 'round'; g.beginPath(); g.moveTo(980, GY + 60); g.lineTo(520 + 60 * Math.sin(Math.PI * clamp((t - b0) / 0.5)), GY + 150); g.stroke(); g.restore(); });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.24, vignette: 0.5, paper: 0.3 }) });

  // 4 · WHO (the close-up): wrath breaks into wonder; the staff sinks out of frame
  R.scene({ id: 'who', transition: { type: 'dissolve', dur: 0.25 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.25, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.08, focus: [560, 760] }), sink = E.inOutSine(clamp((t - b0) / 0.6));
      ST.shot(ctx, T, { pal: 'noon-ochre', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500 }) },
        { z: 0.3, soft: 0.45, draw: (g, p) => ST.treeline(g, p, { y: 1500, h: 1400, gap: 420, T, seed: 12, kind: 'sal' }) },
        { z: 0.9, haze: false, draw: (g) => { g.save(); g.strokeStyle = '#2a1a0c'; g.lineWidth = 46; g.lineCap = 'round'; g.beginPath(); g.moveTo(330, -200 + 1500 * sink); g.lineTo(250, 1500 + 1500 * sink); g.stroke(); g.restore(); } },
        { z: 1, haze: false, draw: (g, p) => CH.ruru.draw(g, { x: 660, y: 3040, scale: 2.5, facing: 'left', pose: ACT.pose(t, [[0, 'stand']], { prop: false }), light: { ...ST.light(p, { from: [200, 200], at: [600, 1200], k: 1.0, front: 0.3 }) },
          expression: { emo: ACT.emo(t, [[0, 'wrath'], [b0, 'shock', { dur: 0.3 }], [b0 + 0.7, 'wonder']]), speak: talk(env, t), ...ACT.lead(t, [[0, [0.3, 0.7]], [b0, [0.5, 0.5]]], 0.3, 0.15) }, t: T, key: 'wh-r' }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.22, vignette: 0.45, paper: 0.3 }) });

  // 5 · WAS (after a silence): a slow orbit round the snake; behind it, in the shade, the dark shape of a seated sage
  R.scene({ id: 'was', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 2.4, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 130, zoom: 1.2, y: 60 }), a = E.outCubic(clamp((t - b0 + 0.2) / 1.2));
      shade(ctx, T, cam, (g, p) => {
        if (a > 0) { g.save(); g.beginPath(); g.rect(-400, GY + 20 - 1300 * a, 1900, 1300 * a + 60); g.clip();   // his own shape rises in the shade behind: dark, solid, clear of the snake
          CH.sahasrapat.draw(g, { x: 850, y: GY + 20, scale: 1.0, facing: 'left', pose: { w: { sit: 1 }, prop: false }, light: { dir: -2, intensity: 0.9, front: 0, fill: 0 }, expression: { emo: 'calm' }, t: T, key: 'ws-s' }); g.restore(); }
        snake(g, p, T, 1 + 0.03 * Math.sin(T * 1.4), talk(env, t), { x: 300 });
      }, { sx: 700 });
      TY.plaque(ctx, T, clamp((t - b0) / 0.6), ...names(env, 'Sahasrapat'), { x: 500, y: 260, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.24, vignette: 0.5, paper: 0.3 }) });

  // 6 · GRASS: the memory, an ink-wash panel in indigo: two young sages; the grass snake thrown (rustle@0); the friend falls
  //     back (thud@1), rises, an arm out: the curse; the joker sinks into a snake's line
  R.scene({ id: 'grass', transition: { type: 'ink', dur: 0.8, at: [540, 800], color: '#1c2060' },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 2.8, b1 = b[1] ?? 4.7, b2 = b[2] ?? 6.1, cam = CAM.slide(t / env.dur, { from: 100, to: -100, zoom: 1.1 });
      const fly = clamp((t - b0) / (b1 - b0)), sink = E.inOutSine(clamp((t - b2 - 0.2) / 0.35));
      ST.shot(ctx, T, { pal: 'memory-indigo', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ }) },
        { z: 0.3, draw: (g, p) => { ST.hills(g, p, { y: HZ, h: 360, seed: 33 }); ST.treeline(g, p, { y: HZ + 20, h: 560, T, seed: 35, kind: 'mixed' }); } },
        { z: 0.8, haze: false, draw: (g) => { KIT.glow(g, 800, GY - 200, 420, '#ff9a3a', 0.35); CH.hearthfire.draw(g, { x: 800, y: GY - 10, scale: 0.5, t: T, k: 1, key: 'gr-f' }); } },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
          const L = (x) => ({ ...ST.light(p, { from: [800, 1000], at: [x, GY], front: 0.75, k: 1.2 }), tint: ['#ffd0a0', 0.4] });
          if (sink < 0.98) { g.save(); g.translate(230, GY + 10); g.scale(1, 1 - 0.9 * sink); g.translate(-230, -(GY + 10));
            CH.sahasrapat.draw(g, { x: 230, y: GY + 10, scale: 0.9, facing: 'right', pose: ACT.pose(t, [[0, 'kneel'], [b0 - 0.7, 'raise', { act: 0.4 }], [b0 - 0.12, 'strike', { act: 0.15 }], [b1 + 0.3, 'recoil', { act: 0.5 }], [b2, 'kneel', { act: 0.5 }]], { prop: false }), light: L(230), expression: { emo: ACT.emo(t, [[0, 'joy'], [b1 + 0.2, 'shock'], [b2, 'fear']]) }, t: T, key: 'gr-s' }); g.restore(); }
          if (sink > 0.3) { g.save(); g.globalAlpha = clamp((sink - 0.3) / 0.4); g.strokeStyle = '#c8d0a0'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= 20; i++) g.lineTo(90 + i * 16, GY - 14 + 12 * Math.sin(i * 0.9 + T * 2)); g.stroke(); g.restore(); }
          CH.khagama.draw(g, { x: 960, y: GY + 10, scale: 0.9, facing: 'left', pose: ACT.pose(t, [[0, 'kneel'], [b1 - 0.1, 'collapse', { act: 0.25 }], [b1 + 1.0, 'stand', { act: 0.6 }], [b2 - 0.25, 'point', { act: 0.3, antic: 0.15 }]], { prop: false }), light: L(960), expression: { emo: ACT.emo(t, [[0, 'calm'], [b1 - 0.1, 'shock'], [b2 - 0.3, 'wrath']]) }, t: T, key: 'gr-k' });
          if (fly > 0 && fly < 1) { const x = lerp(330, 760, fly), y = GY - 600 - 260 * Math.sin(Math.PI * fly); g.save(); g.strokeStyle = '#a8c060'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= 10; i++) g.lineTo(x + i * 14, y + 14 * Math.sin(i * 1.1 + fly * 20)); g.stroke(); g.restore(); }
        } },
        { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => ST.grass(g, p, { y: 1950, h: 300, T, count: 40 }) },
      ] });
      TY.plaque(ctx, T, clamp((t - b1 - 0.3) / 0.6), ...names(env, 'Khagama'), { x: 560, y: 300, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.26, vignette: 0.5, paper: 0.34 }) });

  // 7 · FREED (the turn, after a silence; the arc's payoff; the signature shot): the coil opens like a skin of light and the
  //     sage rises through it, aqua-white on gold; a pull back from his face, calm to joy, held through the long post
  const gold = (ctx, T, cam, figs) => ST.shot(ctx, T, { pal: 'release-gold', cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ, sun: [540, 500, 150] }) },
    { z: 0.35, draw: (g, p) => ST.treeline(g, p, { y: HZ + 20, h: 1000, gap: 340, T, seed: 12, kind: 'mixed' }) },
    { z: 0.8, haze: false, draw: (g) => { ST.shafts(g, T, { x: 540, angle: 0.05, count: 6, alpha: 0.2, color: '#fff8c8' }); } },
    { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 }); figs(g, p); } },
    { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'pollen', count: 60, cam }) },
    { z: 1.8, haze: false, soft: 0.3, draw: (g, p) => ST.grass(g, p, { y: 1940, h: 320, T, count: 46 }) },
  ] });
  const sage = (g, p, T, x, pose, ex, s = 1.12) => CH.sahasrapat.draw(g, { x, y: GY + 12, scale: s, facing: 'right', pose, light: { dir: -Math.PI / 2 - 0.3, intensity: 1.35, front: 1, fill: 0.7, tint: ['#e8fff8', 0.5] }, expression: ex, t: T, key: 'fr-s' });
  R.scene({ id: 'freed', transition: { type: 'lamp', dur: 0.8, from: [380, 900], to: [520, 640] },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 2.3, b1 = env.beats[1] ?? 4.2, open = E.inOutSine(clamp((t - b0 + 0.3) / 1.2)), rise = E.outCubic(clamp((t - b0) / 1.6));
      const cam = CAM.pull(E.inOutSine(clamp((t - b1 + 0.6) / 3.2)), { from: 1.75, to: 1.1, focus: [600, 520] });
      gold(ctx, T, cam, (g, p) => {
        KIT.glow(g, 560, GY - 620, 1100 * open, '#fff6c0', 0.5 * open);
        if (open < 1) { g.save(); g.beginPath(); g.rect(-400, GY - 1100 + 1200 * open, 1900, 1400); g.clip(); snake(g, p, T, 1, 0, { x: 300, key: 'fr-sn' }); g.restore(); }   // the snake's shape falls away downward (never a see-through fade)
        if (rise > 0.02) { g.save(); g.beginPath(); g.rect(-400, GY - 1500 * rise - 40, 1900, 1500 * rise + 80); g.clip(); sage(g, p, T, 560, ACT.pose(t, [[0, 'stand'], [b1 - 0.2, 'anjali', { act: 0.7 }], [b1 + 1.6, 'bless', { act: 0.8 }]], { prop: false }), { emo: ACT.emo(t, [[0, 'calm'], [b1, 'joy', { dur: 0.9 }]]), ...ACT.lead(t, [[0, [0.4, -0.5]], [b1, [0.8, 0]]]) }); g.restore(); }
        // the skin of light falling away
        if (open > 0 && open < 1) { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 26; i++) { const an = (i / 26) * TAU; g.globalAlpha = (1 - open) * 0.8; g.fillStyle = '#fff6c0'; g.beginPath(); g.ellipse(560 + Math.cos(an) * 520 * open, GY - 620 + Math.sin(an) * 620 * open, 40, 16, an, 0, TAU); g.fill(); } g.restore(); }
      });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.44, vignette: 0.4, paper: 0.3 }) });

  // 8 · TEACH: the sage, an open hand raised, facing Ruru across a clear gap; Ruru has laid his staff on the ground
  R.scene({ id: 'teach', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.7, cam = CAM.push(t / env.dur, { from: 1.1, to: 1.24, focus: [560, 900] });
      gold(ctx, T, cam, (g, p) => {
        sage(g, p, T, 190, ACT.pose(t, [[0, 'stand'], [0.4, 'bless', { act: 0.6 }]], { prop: false }), { emo: 'joy', speak: talk(env, t), gaze: [0.8, 0.1] }, 1.06);
        g.save(); g.strokeStyle = '#3a2410'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(520, GY + 34); g.lineTo(800, GY + 44); g.stroke(); g.restore();   // the staff, laid down
        CH.ruru.draw(g, { x: 930, y: GY + 12, scale: 1.02, facing: 'left', pose: ACT.pose(t, [[0, 'stand'], [b0 + 0.6, 'anjali', { act: 0.7 }]], { prop: false }), light: ST.light(p, { from: [540, 300], at: [880, GY], front: 0.12, fill: 0 }), expression: { emo: 'wonder', gaze: [0.9, -0.1] }, t: T, key: 'tc-r' });
      });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.4, vignette: 0.4, paper: 0.3 }) });

  // 9 · HOME: father and son by the hall of the tale he tells: the great sacrifice at night in teal, the fire high, a boy before the king
  const tale = (ctx, T, cam, t, extra) => EP46.hall(ctx, T, cam, { pal: 'satra-teal-night', fx: 150, fire: 1.0, fs: 0.85, glow: 0.16, figs: (g, p, fl) => {
    CH.kingJanamejaya.draw(g, { x: 880, y: GY + 10, scale: 0.96, facing: 'left', pose: 'attend', light: EP46.lit(880, fl, 0.5, 150), expression: { emo: 'wonder', gaze: [0.7, 0.4] }, t: T, key: 'hm-k' });
    CH.astika.draw(g, { x: 540, y: GY + 10, scale: 0.66, facing: 'right', pose: { name: 'stand' }, light: { dir: Math.PI, intensity: 1.7, front: 1, fill: 1 }, t: T, key: 'hm-a' });
    if (extra) extra(g, p, fl); } });
  R.scene({ id: 'home', transition: { type: 'smoke', dur: 0.8, dir: -Math.PI / 2, color: '#1a4a5a' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.tilt(E.inOutSine(clamp(t / 3.4)), { from: 260, to: -30, zoom: 1.12 });
      tale(ctx, T, cam, t);
      TY.plaque(ctx, T, clamp((t - 0.4) / 0.6), ...names(env, 'Pramati'), { x: 300, y: 1210, out: clamp((t - 3.4) / 0.3) });   // the two dark backs in the foreground: the father telling, the son listening
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }) });

  // 10 · ARCEND (silent): the arc-end card over the sacrifice at night
  R.scene({ id: 'arcend', draw(ctx, t, env) { const T = env.T; tale(ctx, T, CAM.still({ zoom: 1.12, y: -30 }), 6 + t); ctx.fillStyle = 'rgba(4,10,14,0.45)'; ctx.fillRect(0, 0, R.W, R.H); EP46.arcCard(ctx, T, clamp(t / 0.25) * (1 - clamp((t - (env.dur - 0.2)) / 0.2)), env.strings); fin(ctx, T); }, post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.3 }) });

  // 11 · CLIFF: the same sacrifice, its fire still high between the pillars, in umber and gold; far off a tall dark figure with a gold halo walks in
  const cliff = (ctx, T, t, env, b) => {
    const cam = CAM.push(clamp(t / 6), { from: 1.04, to: 1.26, focus: [640, 900] }), d = 130 * E.outCubic(clamp((t - b[0]) / 3));
    EP46.hall(ctx, T, cam, { pal: 'arrival-umber-gold', fx: 240, fire: 1.2, fs: 1.3, back: (g, p) => { if (t < b[0] - 0.1) return;
      KIT.glow(g, 700 - d * 0.5, 760, 260, '#ffcf7a', 0.2 * clamp((t - b[0]) / 0.8));
      CH.vyasaSage.draw(g, { x: 700 - d * 0.5, y: 1330, scale: 0.5, facing: 'left', pose: ACT.pose(t, [[0, 'walk']], { phase: ACT.stride(d * 0.5, 0.5), prop: false }), light: { dir: -Math.PI / 2, intensity: 1.5, front: 1, fill: 0.85, tint: ['#fff0c8', 0.6], minLum: 0.5 }, expression: { emo: 'calm' }, t: T, key: 'cl-v' }); } });
    TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 110 });
    fin(ctx, T);
  };
  const CL = { dur: 5.88, b: [1.78, 2.63, 4.3] };
  R.scene({ id: 'cliff', transition: { type: 'dissolve', dur: 0.35 }, draw(ctx, t, env) { cliff(ctx, env.T, t, env, env.beats.length > 2 ? env.beats : CL.b); }, post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.3 }) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, CL.dur + t, env, CL.b) });
})();
