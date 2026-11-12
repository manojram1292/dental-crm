/* Episode 58 · The Voice from the Sky (CE Adi 1.69.28–51; 1.71.1; the arc finale of Shakuntala). One scene per line of
 * script/ep58.en.json. Loads after ep41/_common, ep44/_common, ep46/_common, ep49/_common, ep51/_common.
 * The voice has no body (1.69.28): it is only light. The embrace is father and small child. The king's "forgiveness" of her
 * angry words is the text's own (1.69.42) and is on a tag. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41, EP46 = window.EP46, EP51 = window.EP51;
  const { TAU, clamp, lerp, E, hash } = R;
  const GY = EP41.GY;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const names = (env, n) => [n, env.script.names[n]];
  const talk = (env, t) => EP41.mouth(env, t);
  const POST = (b = 0.3, v = 0.45) => () => ({ bloom: b, vignette: v, paper: 0.3 });
  const out = (t, env, d = 0.4) => clamp((t - (env.dur - d)) / 0.3);
  const F = EP51.fig;
  EP51.GROUND = { 'sn-g': 'pit', 'nm-b': 'glow', 'wy-6': 'pit', 'tr-b': 'glow', 'cl-d': 'pit' };
  const shade = (g, c = '8,8,18') => { const gr = g.createLinearGradient(0, 1060, 0, 1560); gr.addColorStop(0, `rgba(${c},0)`); gr.addColorStop(0.5, `rgba(${c},0.85)`); gr.addColorStop(1, `rgba(${c},0.96)`); g.fillStyle = gr; g.fillRect(-900, 1060, 2880, 1800); };
  const court = (ctx, T, cam, pal, figs, o = {}) => EP51.court(ctx, T, cam, pal, { tx: o.tx === undefined ? 800 : o.tx, ty: 1310, ts: 0.9, crowd: o.crowd ?? 1, glow: o.glow ?? 0.2, gx: o.gx ?? 800, figs, front: o.front, mid: o.mid, back: o.back });
  const king = (g, p, T, o = {}) => F(g, T, 'dushyanta', o.x ?? 700, o.y ?? 1170, o.s ?? 0.7, { f: o.f || 'left', pose: o.pose || 'stand', L: o.L || EP51.bright('#fff0dc', 1.5), ex: o.ex || { emo: 'resolve', gaze: [0.8, 0.3] }, key: o.key || 'kg' });
  const girl = (g, p, T, x, y, s, o = {}) => F(g, T, 'shakuntala', x, y, s, { f: o.f || 'right', pose: o.pose || 'stand', L: o.L || EP51.bright('#fff0dc', 1.5), ex: o.ex || { emo: 'resolve', gaze: [0.9, -0.4] }, key: o.key || 'gl' });
  const boy = (g, p, T, x, y, s, o = {}) => F(g, T, 'bharataChild', x, y, s, { f: o.f || 'right', pose: o.pose || 'stand', L: o.L || EP51.bright('#fff0dc', 1.5), ex: o.ex || { emo: 'wonder', gaze: [0.5, -0.9] }, key: o.key || 'by' });
  const beam = (g, x, w, a) => { if (a <= 0) return; const gr = g.createLinearGradient(x - w, 0, x + w, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,252,236,${0.75 * a})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.beginPath(); g.moveTo(x - w * 0.5, -900); g.lineTo(x + w * 0.5, -900); g.lineTo(x + w, GY + 40); g.lineTo(x - w, GY + 40); g.closePath(); g.fill(); g.restore(); };

  // 1 · HOOK: looking straight up from the floor of a hall: pillars converge on an opening full of bright cloud; light pours down
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.tilt(E.outCubic(clamp(t / 3.4)), { from: 150, to: -60, zoom: 1.12 }), T, 0.6), a = E.outCubic(clamp(t / 1.2));
      EP51.void(ctx, T, cam, 'crystal-sky', { ground: false, hz: 2400,
        sky: (g) => { KIT.glow(g, 540, 700, 900, '#ffffff', 0.7 * a); EP51.clouds(g, T, 700, 5, '#ffffff', 0.9, 12, 5, 0.9); },
        figs: (g) => { g.fillStyle = '#3a0c08'; g.beginPath(); g.rect(-900, -900, 2880, 3800); g.moveTo(540 + 330, 700); g.arc(540, 700, 330, 0, TAU, true); g.fill('evenodd');
          for (let i = 0; i < 10; i++) { const an = (i / 10) * TAU + 0.16, x0 = 540 + Math.cos(an) * 340, y0 = 700 + Math.sin(an) * 340, x1 = 540 + Math.cos(an) * 1900, y1 = 700 + Math.sin(an) * 1900; g.strokeStyle = '#8a1c10'; g.lineWidth = 90; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = '#e7b54a'; g.lineWidth = 8; g.beginPath(); g.moveTo(x0 + 30, y0); g.lineTo(x1 + 200, y1); g.stroke();
            g.fillStyle = '#1a0604'; g.beginPath(); g.arc(540 + Math.cos(an + 0.3) * 350, 700 + Math.sin(an + 0.3) * 350, 30, 0, TAU); g.fill(); }
          g.strokeStyle = '#e7b54a'; g.lineWidth = 12; g.beginPath(); g.arc(540, 700, 334, 0, TAU); g.stroke();
          g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { const an = (i / 7) * TAU + T * 0.1; g.strokeStyle = `rgba(255,250,220,${0.12 * a})`; g.lineWidth = 120; g.beginPath(); g.moveTo(540, 700); g.lineTo(540 + Math.cos(an) * 1700, 700 + Math.sin(an) * 1700); g.stroke(); } g.restore(); } });
      EP51.hook(ctx, T, t, env, { y: 1500 });
      fin(ctx, T);
    },
    post: POST(0.5, 0.45) });

  // 2 · SCENE: the red-and-gold hall: the king on his feet at the throne; at the doors, about to leave, the woman and her boy
  R.scene({ id: 'scene', transition: { type: 'ink', dur: 0.6, at: [540, 700], color: '#3a0806' },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 3.0, cam = CAM.slide(E.inOutSine(clamp(t / env.dur)), { from: 150, to: -150, zoom: 1.14 });
      court(ctx, T, cam, 'dice-vermilion', (g, p) => { king(g, p, T, { key: 'sn-k' }); girl(g, p, T, 250, GY + 10, 0.8, { f: 'left', key: 'sn-g' }); boy(g, p, T, 130, GY + 16, 0.76, { f: 'left', ex: { emo: 'wonder' }, key: 'sn-b' }); });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.4) / 0.4)), env.strings, { y: 190 });
      TY.plaque(ctx, T, clamp((t - 0.9) / 0.5), ...names(env, 'Dushyanta'), { x: 270, y: 410, size: 38, out: clamp((t - b1 + 0.3) / 0.3) });
      TY.plaque(ctx, T, clamp((t - b1) / 0.5), ...names(env, 'Shakuntala'), { x: 270, y: 440, size: 38, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.32, 0.5) });

  // 3 · VOICE (the signature shot): a column of white light comes down through the roof onto mother and son; everyone else
  //     falls into blue shadow
  R.scene({ id: 'voice', transition: { type: 'lamp', dur: 0.8, from: [300, 800], to: [540, 300] },
    draw(ctx, t, env) {
      const T = env.T, a = E.outCubic(clamp(t / 1.0)), cam = CAM.crane(E.inOutSine(clamp(t / env.dur)), { from: 1.3, to: 1.02, y0: 100, y1: -70 });
      court(ctx, T, cam, 'sun-white', (g, p) => {
        beam(g, 480, 360, a);
        girl(g, p, T, 540, GY - 96, 0.86, { f: 'right', pose: ACT.pose(t, [[0, 'stand'], [1.0, 'attend', { act: 0.5 }]]), L: EP51.bright('#ffffff', 1.4), ex: { emo: 'wonder', ...ACT.lead(t, [[0, [0.8, 0]], [0.8, [0.2, -0.9]]], 0.4, 0.3) }, key: 'vc-g' });
        boy(g, p, T, 410, GY - 90, 0.8, { L: EP51.bright('#ffffff', 1.45), key: 'vc-b' });
        for (let i = 0; i < 6; i++) { const x = i < 3 ? 40 + i * 90 : 800 + (i - 3) * 100; EP51.mini(g, x, GY + 30 + (i % 2) * 30, 1.1, '#141c4a', 'rgba(255,255,255,0.9)', false); } }, { tx: null, crowd: 0.8, glow: 0.05 });
      TY.tag(ctx, T, clamp((t - 1.0) / 0.4), 'a bodiless voice', { x: 540, y: 250, size: 42, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.5, 0.42) });

  // 4 · NAME: the boy alone in the light, looking up, unafraid, a hand shading his eyes
  R.scene({ id: 'name', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 4.0, cam = CAM.push(t / env.dur, { from: 1.1, to: 1.3, focus: [540, 820] });
      court(ctx, T, cam, 'messenger-dawn', (g, p) => { beam(g, 540, 300, 1); boy(g, p, T, 540, GY + 10, 1.2, { f: 'left', pose: ACT.pose(t, [[0, 'stand'], [1.0, 'shield', { act: 0.5 }]]), L: EP51.bright('#fffbe8', 1.4), ex: { emo: ACT.emo(t, [[0, 'wonder'], [b1 - 0.5, 'joy']]), gaze: [0.4, -0.9] }, key: 'nm-b' }); }, { tx: null, crowd: 0.5, glow: 0.3, gx: 540 });
      TY.plaque(ctx, T, clamp((t - b1 + 0.4) / 0.5), ...names(env, 'Bharata'), { x: 540, y: 330, size: 56, out: out(t, env, 0.3) });
      TY.tag(ctx, T, clamp((t - (env.beats[0] ?? 1.5)) / 0.4), 'bhara · support', { x: 540, y: 250, size: 42, out: clamp((t - b1 + 0.6) / 0.3) });
      fin(ctx, T);
    },
    post: POST(0.46, 0.4) });

  // 5 · GLAD: the king swings round to the rows of priests and ministers, both arms opening, his whole face alight
  R.scene({ id: 'glad', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 120, zoom: 1.14 }), turned = t > 0.7;
      court(ctx, T, cam, 'fishers-coral', (g, p) => {
        for (let i = 0; i < 5; i++) F(g, T, 'kanva', 640 + i * 95, GY + 10 + (i % 2) * 14, 0.66, { f: 'left', pose: i % 2 ? 'attend' : 'recoil', L: { dir: -Math.PI / 2, intensity: 0.36, front: 0.25, fill: 0.12, minLum: 0.04 }, ex: { emo: 'wonder' }, key: 'gd-m' + i });
        king(g, p, T, { x: 330, y: GY + 10, s: 0.96, f: turned ? 'right' : 'left', pose: ACT.pose(t, [[0, 'stand'], [0.5, 'offer', { act: 0.5 }]]), ex: { emo: 'joy', gaze: [0.9, 0] }, key: 'gd-k' }); }, { tx: null, crowd: 0.6 });
      fin(ctx, T);
    },
    post: POST(0.34, 0.45) });

  // 6 · KNEW (the turn; the close-up): the king's face: triumph, then the mask comes off: relief and shame together
  R.scene({ id: 'knew', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 3.1, b2 = b[2] ?? 4.1, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.12, focus: [540, 780] });
      EP51.court(ctx, T, cam, 'war-iron', { crowd: 0, glow: 0.1, front: () => {}, figs: (g, p) => {
        F(g, T, 'dushyanta', 640, 2960, 2.5, { f: 'left', pose: 'stand', L: { dir: -Math.PI / 2 - 0.5, intensity: 1.5, front: 0.8, fill: 0.5, tint: ['#aab8ff', 0.6], minLum: 0.4 }, ex: { emo: ACT.emo(t, [[0, 'joy'], [b1 - 0.5, 'sorrow', { dur: 0.7 }]]), speak: talk(env, t), ...ACT.lead(t, [[0, [0.8, -0.2]], [b1 - 0.3, [0.5, 0.8]]], 0.4, 0.25) }, key: 'kn-k' }); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#aab4f0'; g.fillRect(-900, -900, 2880, 3800); g.restore(); shade(g); } });
      TY.turnWord(ctx, T, clamp((t - b2) / 0.6), 'Knew', { x: 290, y: 1260, size: 96, out: out(t, env, 0.3), sub: 'Adi 1.69.35' });
      fin(ctx, T);
    },
    post: POST(0.3, 0.52) });

  // 7 · WHY: a rack focus from the king's open hand in the foreground to the ranks of courtiers behind, whispering
  R.scene({ id: 'why', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.rack(E.inOutSine(clamp((t - 0.2) / 0.9)), { from: 1.4, to: 1, zoom: 1.1 });
      court(ctx, T, cam, 'dice-vermilion', (g, p) => { for (let i = 0; i < 7; i++) F(g, T, ['kacha', 'kanva', 'yudhishthira'][i % 3], 110 + i * 150, GY - 30 + (i % 2) * 30, 0.7, { f: i % 2 ? 'left' : 'right', pose: i % 3 === 0 ? 'point' : 'attend', L: EP51.bright('#fff0dc', 1.5), ex: { emo: i % 2 ? 'wonder' : 'calm', speak: i % 3 === 1 ? 0.5 + 0.5 * Math.sin(T * 9 + i) : 0 }, key: 'wy-' + i }); }, { tx: null, crowd: 1,
        front: () => {} });
      fin(ctx, T);
    },
    post: POST(0.32, 0.5) });

  // 8 · EMBRACE: the king comes down the steps, kneels and gathers the boy in both arms; Shakuntala stands a pace away
  R.scene({ id: 'embrace', transition: { type: 'brush', dur: 0.5, angle: 0.2, color: '#ffe0e4' },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 1.9, cam = CAM.push(t / env.dur, { from: 1.06, to: 1.24, focus: [460, 900] }), come = 180 * E.outCubic(clamp(t / 0.9));
      court(ctx, T, cam, 'brahma-rose', (g, p) => {
        girl(g, p, T, 830, GY + 10, 0.86, { f: 'left', pose: 'attend', ex: { emo: 'resolve', gaze: [0.8, 0.4] }, key: 'eb-g' });
        king(g, p, T, { x: 180 + come, y: GY + 10, s: 0.96, f: 'right', pose: ACT.pose(t, [[0, 'walk'], [0.8, { kneel: 0.75, embrace: 0.25 }, { act: 0.6 }]], { phase: ACT.stride(come, 0.96) }), ex: { emo: 'tender', gaze: [0.7, 0.4] }, key: 'eb-k' });
        boy(g, p, T, 520, GY + 16, 0.84, { f: 'left', pose: ACT.pose(t, [[0, 'stand'], [0.9, 'embrace', { act: 0.5 }]]), ex: { emo: 'joy', gaze: [0.8, -0.2] }, key: 'eb-b' }); }, { tx: null, crowd: 0.7 });
      TY.tag(ctx, T, clamp((t - b1) / 0.4), '"what you said in anger, I forgive"', { x: 540, y: 250, size: 42, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.36, 0.42) });

  // 9 · LINE (the lit payoff) and 10 · ARCEND: Bharata grown, a great bright wheel turning before his chariot; then a tilt up
  //     a painted family tree in gold light: Bharata at its root, branch on branch of small kings above
  const tree = (ctx, T, t, env, cam, bare) => EP51.void(ctx, T, cam, 'release-gold', { ground: false, glow: [540, 600, 1200, '#fff8d0', 0.5],
    figs: (g, p) => {
      g.strokeStyle = '#7a4a10'; g.lineCap = 'round'; const br = (x0, y0, x1, y1, w, d) => { g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0, (y0 + y1) / 2, x1, y1); g.stroke(); if (d > 0) { br(x1, y1, x1 - 150 - 40 * d, y1 - 300, w * 0.66, d - 1); br(x1, y1, x1 + 150 + 40 * d, y1 - 300, w * 0.66, d - 1); } g.fillStyle = '#3a2408'; g.beginPath(); g.ellipse(x1, y1 - 60, 22, 50, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(x1, y1 - 130, 16, 0, TAU); g.fill(); g.fillStyle = '#e7b54a'; g.beginPath(); g.moveTo(x1 - 14, y1 - 142); g.lineTo(x1, y1 - 176); g.lineTo(x1 + 14, y1 - 142); g.closePath(); g.fill(); };
      br(540, 1250, 540, 760, 44, 3);
      const wheel = clamp(1 - (t - 2.4) / 0.8); if (wheel > 0) { g.save(); g.globalAlpha = wheel; g.translate(250 + 60 * t, 1080); g.rotate(T * 3); g.strokeStyle = '#fff0a0'; g.lineWidth = 14; g.beginPath(); g.arc(0, 0, 120, 0, TAU); for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; g.moveTo(0, 0); g.lineTo(Math.cos(a) * 120, Math.sin(a) * 120); } g.stroke(); g.restore(); KIT.glow(g, 250 + 60 * t, 1080, 300, '#fff6c0', 0.5 * wheel); }
      if (bare) return;
      F(g, T, 'bharataKing', 600, 1290, 0.72, { f: 'left', pose: ACT.pose(t, [[0, 'point'], [2.6, 'stand', { act: 0.6 }]]), L: EP51.bright('#fff6d0', 1.35), ex: { emo: 'resolve', gaze: [0.8, 0] }, key: 'tr-b' });
      F(g, T, 'shakuntalaQueen', 800, 1290, 0.62, { f: 'left', pose: 'attend', L: EP51.bright('#fff6d0', 1.3), ex: { emo: 'tender' }, key: 'tr-s' }); } });
  R.scene({ id: 'line', transition: { type: 'dissolve', dur: 0.45 },
    draw(ctx, t, env) { const T = env.T, b1 = env.beats[1] ?? 2.5, b3 = env.beats[3] ?? 6.1, cam = CAM.tilt(E.inOutSine(clamp((t - b1) / 3.2)), { from: 190, to: -150, zoom: 1.12 }); tree(ctx, T, t, env, cam);
      TY.tag(ctx, T, clamp((t - 0.6) / 0.4), 'his wheel rolled unconquered', { x: 540, y: 250, size: 42, out: clamp((t - b1) / 0.3) });
      TY.plaque(ctx, T, clamp((t - b3 + 0.5) / 0.5), 'The Bharatas', env.script.names.Bharatas, { x: 540, y: 330, size: 50, out: out(t, env, 0.3) });
      fin(ctx, T); },
    post: POST(0.48, 0.36) });
  R.scene({ id: 'arcend', draw(ctx, t, env) { const T = env.T; tree(ctx, T, 30 + t, env, CAM.still({ zoom: 1.12, y: -150 }), true); ctx.fillStyle = 'rgba(24,14,4,0.72)'; ctx.fillRect(0, 0, R.W, R.H); EP46.arcCard(ctx, T, clamp(t / 0.25) * (1 - clamp((t - (env.dur - 0.2)) / 0.2)), env.strings); fin(ctx, T); }, post: POST(0.36, 0.5) });

  // 11 · CLIFF: an older root of the same line: a crowned king and a proud young woman; behind her, vast and dim in violet, a
  //      gaunt white-haired sage with a raised hand, and at his feet a fallen warrior sitting up
  const cliff = (ctx, T, t, env, b) => {
    const cam = CAM.drift(CAM.pull(clamp(t / 8.4), { from: 1.34, to: 1.02, focus: [420, 900] }), T, 1.4), up = E.inOutSine(clamp((t - b[2]) / 1.4));
    EP51.void(ctx, T, cam, 'venom-violet', { gy: 1300, glow: [700, 600, 800, '#9aff9a', 0.14 + 0.2 * up],
      back: (g, p) => { ST.hills(g, p, { y: 1320, h: 260, seed: 231 }); F(g, T, 'shukra', 780, 1330, 1.02, { f: 'left', pose: ACT.pose(t, [[0, 'stand'], [b[2] - 0.5, 'bless', { act: 0.6 }]]), L: { dir: -Math.PI / 2, intensity: 1.1, front: 0.5, fill: 0.3, tint: ['#b0ffa0', 0.5], minLum: 0.25 }, ex: { emo: 'resolve', gaze: [0.5, 0.6] }, key: 'cl-s' }); },
      figs: (g, p) => { F(g, T, 'yayati', 250, 1330, 0.7, { f: 'right', pose: 'stand', L: EP51.bright('#fff0dc', 1.5), ex: { emo: 'calm', gaze: [0.8, 0] }, key: 'cl-y' });
        F(g, T, 'devayani', 430, 1330, 0.64, { f: 'left', pose: 'attend', L: EP51.bright('#fff0ff', 1.45), ex: { emo: 'resolve', gaze: [0.8, 0] }, key: 'cl-d' });
        KIT.glow(g, 900, 1250, 260, '#9aff9a', 0.5 * up); CH.asura.draw(g, { x: 900, y: 1340, scale: 0.5, index: 2, facing: 'left', pose: { name: 'cower', k: 1 - up }, light: { dir: -Math.PI / 2, intensity: 1.6, front: 0.8, fill: 0.6, tint: ['#b0ffa0', 0.7], minLum: 0.38 }, t: T, key: 'cl-a' }); } });
    TY.plaque(ctx, T, clamp((t - b[0] - 0.2) / 0.5), ...names(env, 'Yayati'), { x: 280, y: 420, size: 44, out: clamp((t - b[2] + 0.2) / 0.3) });
    TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 110 });
    fin(ctx, T);
  };
  const CL = { dur: 7.27, b: [1.1, 2.9, 5.0, 6.5] };
  R.scene({ id: 'cliff', transition: { type: 'ink', dur: 0.6, at: [540, 900], color: '#12061c' }, draw(ctx, t, env) { cliff(ctx, env.T, t, env, env.beats.length > 3 ? env.beats : CL.b); }, post: POST(0.36, 0.5) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, CL.dur + t, env, CL.b) });
})();
