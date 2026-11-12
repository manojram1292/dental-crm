/* Episode 56 · The Boy Who Tamed Lions (CE Adi 1.68.1–19). One scene per line of script/ep56.en.json.
 * Loads after ep41/_common, ep44/_common, ep46/_common, ep49/_common, ep51/_common.
 * The new-born is a swaddled infant and Shakuntala is drawn slim once he is born; every beast stands above the caption
 * band; the king remembers (CE 1.68.18) and says he does not. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41, EP49 = window.EP49, EP51 = window.EP51;
  const { TAU, clamp, lerp, E, hash } = R;
  const GY = EP41.GY, HZ = EP41.HZ;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const names = (env, n) => [n, env.script.names[n]];
  const talk = (env, t) => EP41.mouth(env, t);
  const POST = (b = 0.3, v = 0.45) => () => ({ bloom: b, vignette: v, paper: 0.3 });
  const out = (t, env, d = 0.4) => clamp((t - (env.dur - d)) / 0.3);
  const F = EP51.fig;
  const shade = (g, c = '20,40,10') => { const gr = g.createLinearGradient(0, 1060, 0, 1560); gr.addColorStop(0, `rgba(${c},0)`); gr.addColorStop(0.5, `rgba(${c},0.85)`); gr.addColorStop(1, `rgba(${c},0.96)`); g.fillStyle = gr; g.fillRect(-900, 1060, 2880, 1800); };
  const yard = (ctx, T, cam, pal, figs, o = {}) => EP51.wood(ctx, T, cam, pal, { seed: 120, huts: [[o.hutX ?? 820, 1.5, 0.2]], shaftX: 300, shaftA: 0.35, figs, dust: 'pollen', trunks: o.trunks });
  const girl = (g, p, T, x, y, s, o = {}) => F(g, T, 'shakuntala', x, y, s, { f: o.f || 'left', pose: o.pose || 'attend', L: o.L || EP51.bright('#fff0dc', 1.5), ex: o.ex || { emo: 'tender' }, key: o.key || 'gl' });
  const boy = (g, p, T, x, y, s, o = {}) => F(g, T, 'bharataChild', x, y, s, { f: o.f || 'left', pose: o.pose || 'stand', L: o.L || EP51.bright('#fff0dc', 1.5), ex: o.ex || { emo: 'joy' }, key: o.key || 'by' });
  // the line of great trees with beasts tied to them (ground line y0, well above the caption band)
  const tree = (g, x, y0, s = 1) => { g.fillStyle = '#3a2410'; g.fillRect(x - 34 * s, y0 - 760 * s, 68 * s, 770 * s); g.fillStyle = '#5a7a1c'; g.beginPath(); KIT.scallopPath(g, x, y0 - 800 * s, 250 * s, 200 * s, 11, x, 0.2); g.fill(); g.fillStyle = '#8aa832'; g.beginPath(); KIT.scallopPath(g, x - 30 * s, y0 - 850 * s, 170 * s, 120 * s, 9, x + 3, 0.2); g.fill(); };
  const court = (ctx, T, cam, pal, figs, o = {}) => EP51.court(ctx, T, cam, pal, { tx: o.tx ?? 800, ty: 1310, ts: 0.9, crowd: o.crowd ?? 1, glow: 0.2, gx: 800, figs, front: o.front, mid: o.mid });
  const throneKing = (g, p, T, t, o = {}) => F(g, T, 'dushyanta', o.x ?? 800, o.y ?? 1035, 0.68, { f: 'left', pose: o.pose || 'sit', L: EP51.bright('#fff0dc', 1.5), ex: o.ex || { emo: 'calm', gaze: [0.8, 0.3] }, key: o.key || 'tk' });

  // 1 · HOOK: a small boy's back, a rope over his shoulder; a pull back shows a great maned lion tied to a tree, and a tiger
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.pull(E.outCubic(clamp(t / 3.0)), { from: 1.7, to: 1.02, focus: [760, 1000] }), T, 0.5);
      EP51.land(ctx, T, cam, 'noon-ochre', { sun: [240, 380, 80], hz: 1040, treeH: 420, dust: 'dust', seed: 195, gy: 1050,
        figs: (g, p) => { tree(g, 170, 1220, 0.9); tree(g, 520, 1220, 1.0);
          EP51.beast(g, 'tiger', 60, 1230, 0.8, { dir: 1, T, rope: [170, 900] });
          EP51.beast(g, 'lion', 400, 1240, 0.9, { dir: 1, T, yawn: clamp(Math.sin(T * 1.4)), rope: [520, 880] });
          KIT.glow(g, 800, 860, 520, '#fff8d8', 0.8); boy(g, p, T, 800, 1260, 0.9, { L: { dir: -Math.PI / 2 - 0.3, intensity: 0.42, front: 0.3, fill: 0.15, minLum: 0.04 }, pose: { w: { point: 0.3, stand: 0.7 } }, ex: { emo: 'joy', gaze: [0.8, 0] }, key: 'hk-b' }); } });
      EP51.hook(ctx, T, t, env, { y: 420, ty: 430, size: 70 });
      fin(ctx, T);
    },
    post: POST(0.34, 0.42) });

  // 2 · BORN: the hermitage at morning: Shakuntala seated at the hut's door with a swaddled new-born in her arms
  R.scene({ id: 'born', transition: { type: 'brush', dur: 0.5, angle: 0.2, color: '#eef8d8' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.tilt(E.inOutSine(clamp(t / 3.2)), { from: -230, to: 40, zoom: 1.16 });
      yard(ctx, T, cam, 'hermitage-green', (g, p) => { girl(g, p, T, 600, GY, 0.92, { pose: { w: { sit: 0.75, carry: 0.25 }, prop: false }, ex: { emo: 'tender', gaze: [0.4, 0.8] }, key: 'bn-g' }); EP49.infant(g, 520, GY - 460, 1.2, 0.6); }, { hutX: 860 });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.6) / 0.4)), env.strings, { y: 190 });
      TY.plaque(ctx, T, clamp((t - 1.0) / 0.5), ...names(env, 'Shakuntala'), { x: 290, y: 430, size: 42, out: out(t, env) });
      TY.tag(ctx, T, clamp((t - 2.4) / 0.4), 'after three full years', { x: 290, y: 590, size: 42, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.3, 0.42) });

  // 3 · GREW (the close-up): the boy's face: curiosity, then a wide fearless grin; an open palm with a small gold wheel
  R.scene({ id: 'grew', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 2.4, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.1, focus: [540, 780] }), k = E.outCubic(clamp((t - 1.3) / 0.6));
      EP51.wood(ctx, T, cam, 'hunt-emerald', { seed: 120, trunks: false, figs: (g, p) => {
        F(g, T, 'bharataChild', 600, 2520, 3.6, { f: 'left', pose: 'stand', L: ST.light(p, { from: [200, 200], at: [600, 1200], k: 1.05, front: 0.45 }), ex: { emo: ACT.emo(t, [[0, 'wonder'], [b1 - 1.2, 'joy', { dur: 0.6 }]]), ...ACT.lead(t, [[0, [0.6, -0.3]], [1.2, [0.9, 0.1]]], 0.4, 0.2) }, key: 'gw-b' });
        if (k > 0) { g.save(); g.globalAlpha = k; g.fillStyle = '#d09a62'; g.beginPath(); g.ellipse(190, 1010 + 60 * (1 - k), 110, 130, -0.2, 0, TAU); g.fill(); for (let i = 0; i < 4; i++) { g.beginPath(); g.roundRect(100 + i * 46, 800 + 60 * (1 - k) + 10 * Math.abs(i - 1.5), 38, 130, 18); g.fill(); }
          g.strokeStyle = '#e7b54a'; g.lineWidth = 7; g.beginPath(); g.arc(190, 1020 + 60 * (1 - k), 50, 0, TAU); for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + T; g.moveTo(190, 1020 + 60 * (1 - k)); g.lineTo(190 + Math.cos(a) * 50, 1020 + 60 * (1 - k) + Math.sin(a) * 50); } g.stroke(); g.restore(); }
        shade(g, '8,30,12'); } });
      TY.tag(ctx, T, clamp((t - 1.5) / 0.4), "the wheel's mark on his palm", { x: 540, y: 250, size: 42, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.36, 0.42) });

  // 4 · TIED (the signature shot): a long lateral track down a line of great trees: a tiger, a lion, a boar, an elephant tied;
  //     and the boy, small, riding the lion's back across the frame
  R.scene({ id: 'tied', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.slide(E.inOutSine(clamp(t / env.dur)), { from: -330, to: 330, zoom: 1.1 }), ride = -260 + 900 * E.inOutSine(clamp((t - 2.6) / 3.6));
      EP51.land(ctx, T, cam, 'noon-ochre', { sun: [820, 380, 80], hz: 1000, treeH: 400, dust: 'dust', seed: 195, gy: 1010,
        figs: (g, p) => { const y0 = 1190; for (const x of [-240, 150, 560, 980, 1400]) tree(g, x, y0, 0.86);
          EP51.beast(g, 'tiger', -120, y0 + 14, 0.72, { dir: 1, T, rope: [-240, y0 - 300] });
          EP51.beast(g, 'boar', 700, y0 + 14, 0.8, { dir: -1, T, rope: [560, y0 - 240] });
          EP51.beast(g, 'elephant', 1200, y0 + 14, 0.6, { dir: -1, T, rope: [980, y0 - 300] });
          EP51.beast(g, 'lion', 150 + ride, y0 + 20, 0.78, { dir: 1, T, run: 0.8, phase: T * 7, cols: ['#4a2a0c', '#6e4414', '#f0e0c0'] });
          boy(g, p, T, 150 + ride + 10, y0 - 185, 0.5, { f: 'right', pose: { w: { sit: 0.6, raise: 0.4 } }, L: { dir: -Math.PI / 2 - 0.3, intensity: 0.36, front: 0.25, fill: 0.12, minLum: 0.03 }, ex: { emo: 'joy' }, key: 'td-b' });
          for (let i = 0; i < 3; i++) F(g, T, i % 2 ? 'kacha' : 'kanva', 1500 + i * 80, y0 + 24, 0.36, { f: 'left', pose: 'recoil', L: EP51.bright('#fff4d8', 1.5), ex: { emo: 'fear' }, key: 'td-h' + i }); } });
      fin(ctx, T);
    },
    post: POST(0.34, 0.4) });

  // 5 · NAMED: the boy stands on a rock among seated hermits who look up at him
  R.scene({ id: 'named', transition: { type: 'lamp', dur: 0.7, from: [820, 380], to: [540, 700] },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.6, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 110, zoom: 1.14 });
      EP51.wood(ctx, T, cam, 'river-jade', { seed: 131, huts: [[150, 0.9, 0.5]], figs: (g, p) => {
        g.fillStyle = KIT.hex(p.near, '#000000', 0.25); g.beginPath(); g.ellipse(560, GY - 150, 190, 110, 0, 0, TAU); g.fill();
        boy(g, p, T, 560, GY - 240, 0.94, { pose: ACT.pose(t, [[0, 'stand'], [b0, 'raise', { act: 0.5 }]]), ex: { emo: 'joy', gaze: [0.6, -0.2] }, key: 'nm-b' });
        for (let i = 0; i < 5; i++) { const x = 110 + i * 215 + (i > 1 ? 120 : 0); EP51.mini(g, x, GY + 30, 1.2, KIT.hex(p.near, '#000000', 0.3), 'rgba(230,255,240,0.9)', true); } } });
      TY.plaque(ctx, T, clamp((t - b0 + 0.2) / 0.5), ...names(env, 'Sarvadamana'), { x: 540, y: 330, size: 54, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.32, 0.42) });

  // 6 · TIME (the turn): the old sage, grave; then he turns to Shakuntala and two young students and points down the path
  R.scene({ id: 'time', transition: { type: 'dissolve', dur: 0.45 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 3.9, b2 = b[2] ?? 6.6, cam = CAM.push(t / env.dur, { from: 1.04, to: 1.2, focus: [460, 850] });
      yard(ctx, T, cam, 'meadow-spring', (g, p) => {
        F(g, T, 'kanva', 330, GY + 10, 0.96, { f: 'right', pose: ACT.pose(t, [[0, 'speak'], [b1 - 0.3, 'point', { act: 0.5 }]], { prop: false }), L: EP51.bright('#fff0dc', 1.5), ex: { emo: 'resolve', speak: talk(env, t), gaze: [0.8, 0] }, key: 'tm-k' });
        girl(g, p, T, 760, GY, 0.8, { pose: ACT.pose(t, [[0, 'attend'], [b1 + 0.6, 'anjali', { act: 0.5 }]]), ex: { emo: ACT.emo(t, [[0, 'calm'], [b1, 'fear'], [b2, 'resolve']]), gaze: [0.8, 0] }, key: 'tm-g' });
        for (let i = 0; i < 2; i++) F(g, T, 'kacha', 930 + i * 90, GY - 20 - i * 10, 0.66, { f: 'left', pose: 'attend', L: EP51.bright('#fff0dc', 1.5), ex: { emo: 'calm' }, key: 'tm-s' + i }); });
      TY.plaque(ctx, T, clamp((t - 0.9) / 0.5), ...names(env, 'Kanva'), { x: 300, y: 300, size: 44, out: clamp((t - b1) / 0.3) });
      TY.turnWord(ctx, T, clamp((t - b2 + 0.3) / 0.6), 'Time', { x: 780, y: 420, size: 100, out: out(t, env, 0.3), sub: 'Adi 1.68.9–10' });
      fin(ctx, T);
    },
    post: POST(0.3, 0.42) });

  // 7 · WALK: a crane up: Shakuntala and the boy on a road beside a pale river, two students behind; far ahead, a great city
  R.scene({ id: 'walk', transition: { type: 'brush', dur: 0.5, angle: -0.2, color: '#e4eef8' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.crane(E.inOutSine(clamp(t / env.dur)), { from: 1.3, to: 1.03, y0: 160, y1: -50 }), d = 150 * (t / env.dur);
      EP51.land(ctx, T, cam, 'riverbank-pearl', { sun: [820, 360, 70], hz: 960, trees: false, hillH: 200, water: [980, 1080], gy: 1070, dust: 'pollen', seed: 197,
        far: (g, p) => { g.fillStyle = KIT.hex(p.mid, '#ffffff', 0.25); g.fillRect(110, 800, 330, 170); for (let i = 0; i < 6; i++) { g.fillRect(110 + i * 62, 770, 40, 40); } g.beginPath(); g.moveTo(200, 800); g.lineTo(275, 690); g.lineTo(350, 800); g.closePath(); g.fill(); g.fillStyle = KIT.hex(p.near, '#000000', 0.2); g.beginPath(); g.roundRect(245, 880, 60, 90, [30, 30, 0, 0]); g.fill(); },
        figs: (g, p) => { girl(g, p, T, 760 - d, 1230, 0.6, { pose: ACT.pose(t, [[0, 'walk']], { phase: ACT.stride(d, 0.6) }), ex: { emo: 'resolve', gaze: [0.8, 0] }, key: 'wk-g' });
          boy(g, p, T, 670 - d, 1236, 0.6, { pose: ACT.pose(t, [[0, 'walk']], { phase: ACT.stride(d, 0.4) + 1 }), key: 'wk-b' });
          for (let i = 0; i < 2; i++) F(g, T, 'kacha', 900 + i * 90 - d, 1226, 0.52, { f: 'left', pose: ACT.pose(t, [[0, 'walk']], { phase: ACT.stride(d, 0.52) + i * 2 }), L: EP51.bright('#fff0dc', 1.5), ex: { emo: 'calm' }, key: 'wk-s' + i }); } });
      TY.plaque(ctx, T, clamp((t - (env.beats[1] ?? 2.2) + 0.9) / 0.5), ...names(env, 'Hastinapura'), { x: 310, y: 560, size: 44, out: out(t, env, 0.3) });
      fin(ctx, T);
    },
    post: POST(0.34, 0.4) });

  // 8 · COURT: seen between two dark pillars: the long hall, the throne high at the far end; she walks up the middle, the boy's
  //     hand in hers, a light about him
  R.scene({ id: 'court', transition: { type: 'ink', dur: 0.6, at: [540, 900], color: '#3a0806' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.08, focus: [540, 950] }), d = 160 * E.outCubic(clamp(t / env.dur));
      ST.within(ctx, T, { shape: 'arch', pal: 'dice-vermilion', box: [130, 300, 820, 1240], open: 1, color: '#1a0504', draw: (g) => {
        court(g, T, cam, 'dice-vermilion', (gg, p) => { throneKing(gg, p, T, t, { key: 'ct-k' });
          girl(gg, p, T, 250 + d, GY - 60, 0.62, { f: 'right', pose: ACT.pose(t, [[0, 'walk']], { phase: ACT.stride(d, 0.62) }), ex: { emo: 'resolve', gaze: [0.9, -0.2] }, key: 'ct-g' });
          KIT.glow(gg, 330 + d, GY - 300, 240, '#fff0c0', 0.45); boy(gg, p, T, 340 + d, GY - 50, 0.62, { f: 'right', pose: ACT.pose(t, [[0, 'walk']], { phase: ACT.stride(d, 0.4) + 1 }), key: 'ct-b' }); }, { front: () => {} }); } });
      TY.plaque(ctx, T, clamp((t - 1.0) / 0.5), ...names(env, 'Dushyanta'), { x: 540, y: 250, size: 40, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.34, 0.5) });

  // 9 · CLAIM: she at the foot of the throne steps, a hand toward the boy, looking up; the king's hands tighten on the throne
  R.scene({ id: 'claim', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 1.6, cam = CAM.slide(t / env.dur, { from: -80, to: 80, zoom: 1.12 });
      court(ctx, T, cam, 'dice-vermilion', (g, p) => { throneKing(g, p, T, t, { ex: { emo: ACT.emo(t, [[0, 'calm'], [b1, 'shock', { dur: 0.5 }]]), gaze: [0.8, 0.5] }, key: 'cm-k' });
        girl(g, p, T, 300, GY + 10, 0.84, { f: 'right', pose: ACT.pose(t, [[0, 'anjali'], [0.4, 'speak', { act: 0.4 }], [b1, 'point', { act: 0.4 }]]), ex: { emo: 'resolve', speak: talk(env, t), gaze: [0.9, -0.4] }, key: 'cm-g' });
        boy(g, p, T, 470, GY + 16, 0.8, { f: 'right', ex: { emo: 'wonder', gaze: [0.8, -0.5] }, key: 'cm-b' }); });
      fin(ctx, T);
    },
    post: POST(0.32, 0.5) });

  // 10 · KNEW (a second silence): the king's face, near: recognition, then the face shuts
  R.scene({ id: 'knew', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 2.0, b1 = env.beats[1] ?? 3.8, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.12, focus: [540, 780] });
      EP51.court(ctx, T, cam, 'war-iron', { crowd: 0, glow: 0.1, front: () => {}, figs: (g, p) => {
        F(g, T, 'dushyanta', 640, 2960, 2.5, { f: 'left', pose: 'stand', L: { dir: -Math.PI / 2 - 0.5, intensity: 1.5, front: 0.8, fill: 0.5, tint: ['#aab8ff', 0.6], minLum: 0.4 }, ex: { emo: ACT.emo(t, [[0, 'wonder'], [b0 - 0.5, 'shock', { dur: 0.5 }], [b1 - 0.8, 'resolve', { dur: 0.7 }]]), ...ACT.lead(t, [[0, [0.8, 0.3]], [b0 - 0.5, [0.9, 0.5]], [b1 - 0.6, [0.2, -0.2]]], 0.4, 0.2) }, key: 'kn-k' }); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#aab4f0'; g.fillRect(-900, -900, 2880, 3800); g.restore(); shade(g, '8,8,18'); } });
      TY.tag(ctx, T, clamp((t - b0) / 0.4), '"though he remembered"', { x: 540, y: 250, size: 42, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.3, 0.52) });

  // 11 · CLIFF: the king stands, an arm thrown out toward the door; a pull back down the hall: she has not moved
  const cliff = (ctx, T, t, env, b) => {
    const cam = CAM.drift(CAM.pull(clamp(t / 5.8), { from: 1.3, to: 1.02, focus: [760, 800] }), T, 1.4);
    court(ctx, T, cam, 'wrath-crimson', (g, p) => { throneKing(g, p, T, t, { y: lerp(1035, 1170, E.outCubic(clamp((t - 0.3) / 0.5))), x: lerp(800, 700, E.outCubic(clamp((t - 0.3) / 0.5))), pose: ACT.pose(t, [[0, 'sit'], [0.3, 'stand', { act: 0.4 }], [b[0] - 0.3, 'curse', { act: 0.4 }]]), ex: { emo: 'wrath', speak: t < 4.6 ? EP41.mouth(env, t) : 0, gaze: [0.9, 0.3] }, key: 'cl-k' });
      girl(g, p, T, 300, GY + 10, 0.84, { f: 'right', pose: 'stand', ex: { emo: ACT.emo(t, [[0, 'resolve'], [b[0], 'shock']]), gaze: [0.9, -0.4] }, key: 'cl-g' });
      boy(g, p, T, 470, GY + 16, 0.8, { f: 'right', ex: { emo: 'wonder', gaze: [0.8, -0.5] }, key: 'cl-b' }); });
    TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 110 });
    fin(ctx, T);
  };
  const CL = { dur: 4.89, b: [1.1, 3.9] };
  R.scene({ id: 'cliff', transition: { type: 'dissolve', dur: 0.35 }, draw(ctx, t, env) { cliff(ctx, env.T, t, env, env.beats.length > 1 ? env.beats : CL.b); }, post: POST(0.36, 0.52) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, CL.dur + t, env, CL.b) });
})();
