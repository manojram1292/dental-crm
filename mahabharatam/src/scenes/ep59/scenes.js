/* Episode 59 · The Secret of Reviving the Dead (CE Adi 1.71.1–26). One scene per line of script/ep59.en.json.
 * Loads after ep41/_common, ep44/_common, ep46/_common, ep49/_common, ep51/_common.
 * Kacha hides nothing: he names his father at Shukra's door (1.71.17). The blow that kills him is not shown. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41, EP44 = window.EP44, EP51 = window.EP51;
  const { TAU, clamp, lerp, E, hash } = R;
  const GY = EP41.GY;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const names = (env, n) => [n, env.script.names[n]];
  const talk = (env, t) => EP41.mouth(env, t);
  const POST = (b = 0.3, v = 0.45) => () => ({ bloom: b, vignette: v, paper: 0.3 });
  const out = (t, env, d = 0.4) => clamp((t - (env.dur - d)) / 0.3);
  const F = EP51.fig;
  const shade = (g, c = '14,8,4') => { const gr = g.createLinearGradient(0, 1220, 0, 1700); gr.addColorStop(0, `rgba(${c},0)`); gr.addColorStop(0.5, `rgba(${c},0.85)`); gr.addColorStop(1, `rgba(${c},0.96)`); g.fillStyle = gr; g.fillRect(-900, 1220, 2880, 1600); };
  const GL = { dir: -Math.PI / 2 - 0.3, intensity: 1.3, front: 0.9, fill: 0.6, tint: ['#fff4d8', 0.5] };
  const AL = (c = '#b0ffa0') => ({ dir: -Math.PI / 2, intensity: 1.2, front: 0.7, fill: 0.5, tint: [c, 0.6] });
  const deva = (g, T, i, x, y, s, pose, f = 'right') => CH.deva.draw(g, { x, y, scale: s, index: i % 6, facing: f, pose, light: GL, t: T, key: 'dv' + i });
  const asura = (g, T, i, x, y, s, pose, f = 'left', L) => CH.asura.draw(g, { x, y, scale: s, index: i % 6, facing: f, pose, light: L || AL('#ffb0a0'), t: T, key: 'as' + i });
  // a figure lying on the ground (rotated about its feet)
  const lying = (g, x, y, draw, dir = 1) => { g.save(); g.translate(x, y); g.rotate(dir * Math.PI / 2 * 0.94); draw(); g.restore(); };
  const field = (ctx, T, cam, figs, o = {}) => EP51.land(ctx, T, cam, 'thicket-shade', { hz: 1000, trees: 'sal', treeH: 420, dust: 'firefly', dustN: 24, clouds: false, seed: 240, gy: 1010, figs, near: o.near, grass: o.grass });
  const shukra = (g, p, T, x, y, s, o = {}) => F(g, T, 'shukra', x, y, s, { f: o.f || 'left', pose: o.pose || 'stand', L: o.L || EP51.bright('#e8f4ff', 1.25), ex: o.ex || { emo: 'resolve' }, key: o.key || 'sk' });
  const kacha = (g, p, T, x, y, s, o = {}) => F(g, T, 'kacha', x, y, s, { f: o.f || 'right', pose: o.pose || 'stand', L: o.L || EP51.bright('#fff4d8', 1.25), ex: o.ex || { emo: 'calm' }, key: o.key || 'kc' });

  // 1 · HOOK: a battlefield at green dusk, low along the ground: a fallen warrior's open hand; a pale green light passes over
  //     it and the fingers close
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.1, cam = CAM.drift(CAM.push(E.outCubic(clamp(t / 3.2)), { from: 1.0, to: 1.18, focus: [540, 1150] }), T, 0.6), sweep = -300 + 1700 * clamp(t / 2.4), cl = E.inOutSine(clamp((t - b0 - 0.3) / 0.8));
      field(ctx, T, cam, (g, p) => { for (let i = 0; i < 3; i++) lying(g, 250 + i * 330, 1120 + i * 20, () => asura(g, T, i, 0, 0, 0.5, { name: 'stand' }, 'left', AL('#80c0a0')), i % 2 ? 1 : -1);
        KIT.glow(g, sweep, 1250, 520, '#9aff9a', 0.55);
        g.save(); g.translate(560, 1330); g.fillStyle = '#5a4a40'; g.beginPath(); g.ellipse(0, 40, 190, 100, 0.1, 0, TAU); g.fill(); g.fillRect(140, -10, 900, 130);   // the palm and the forearm
        for (let i = 0; i < 4; i++) { g.save(); g.translate(-130 + i * 80, -10); g.rotate(-0.25 + i * 0.12 + cl * (1.5 + i * 0.1)); g.beginPath(); g.roundRect(-34, -230, 68, 250, 32); g.fill(); g.restore(); } g.save(); g.translate(150, 0); g.rotate(0.9 - cl * 1.2); g.beginPath(); g.roundRect(-34, -180, 68, 200, 32); g.fill(); g.restore();
        g.fillStyle = '#c8a040'; g.fillRect(300, -20, 60, 150); g.restore(); }, { grass: false });
      EP51.hook(ctx, T, t, env, { y: 430, ty: 440, size: 70 });
      fin(ctx, T);
    },
    post: POST(0.4, 0.5) });

  // 2 · WAR: two hosts crash across the frame: bright gods from the left, dark horned asuras from the right
  R.scene({ id: 'war', transition: { type: 'smoke', dur: 0.6, dir: 0, color: '#2e2e4a' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.slide(t / env.dur, { from: -130, to: 130, zoom: 1.14 }), ch = 150 * E.outCubic(clamp(t / 1.6));
      EP51.land(ctx, T, cam, 'war-iron', { hz: 980, trees: false, hillH: 300, peaks: 0.6, dust: 'ash', dustN: 50, seed: 245, gy: 1000, sun: [540, 420, 60],
        sky: (g) => { g.fillStyle = 'rgba(255,208,160,0.25)'; g.fillRect(-900, 560, 2880, 6); g.fillRect(-900, 760, 2880, 4); },   // the three worlds: bands
        figs: (g) => { for (let i = 0; i < 3; i++) deva(g, T, i, 60 + i * 130 + ch, 1250 + (i % 2) * 30, 0.62, { name: 'strike', k: 0.5 + 0.5 * Math.sin(T * 5 + i) });
          for (let i = 0; i < 3; i++) asura(g, T, i, 1020 - i * 130 - ch, 1250 + (i % 2) * 30, 0.66, { name: 'raise', k: 0.5 + 0.5 * Math.sin(T * 5 + i + 2) });
          KIT.glow(g, 540, 900, 300, '#fff0c0', 0.5 * Math.abs(Math.sin(T * 6))); } });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.8) / 0.4)), env.strings, { y: 190 });
      TY.tag(ctx, T, clamp((t - 3.1) / 0.4), "asuras · the gods' rivals", { x: 540, y: 250, size: 36, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.36, 0.5) });

  // 3 · PRIESTS: a pale panel: a rack focus from the gods' gold-robed priest to the asuras' white-haired one
  R.scene({ id: 'priests', transition: { type: 'brush', dur: 0.5, angle: 0.2, color: '#fbf0d8' },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.8, b1 = env.beats[1] ?? 4.4, cam = CAM.rack(E.inOutSine(clamp((t - b1 + 1.3) / 1.0)), { from: 0.8, to: 1, zoom: 1.08 });
      ST.shot(ctx, T, { pal: 'seat-ivory', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500 }) },
        { z: 0.3, draw: (g, p) => ST.pillars(g, p, { y: 1380, n: 4 }) },
        { z: 0.8, haze: false, draw: (g, p) => { ST.ground(g, p, { y: 1250 }); CH.brihaspati.draw(g, { x: 280, y: 1250, scale: 0.78, facing: 'right', pose: { name: 'speak', k: clamp(1 - (t - b0) / 1.0) }, light: { dir: -Math.PI / 2 + 0.3, intensity: 1.1, front: 0.6, fill: 0.4 }, t: T, key: 'pr-b' }); } },
        { z: 1, haze: false, draw: (g, p) => { shukra(g, p, T, 780, 1270, 0.86, { pose: ACT.pose(t, [[0, 'stand'], [b1 - 0.4, 'attend', { act: 0.4 }]]), L: EP51.lit(p, 780, 1270, { from: [300, 300], front: 0.5 }), ex: { emo: 'resolve', gaze: [0.8, 0] }, key: 'pr-s' }); } },
      ] });
      TY.plaque(ctx, T, clamp((t - b0 + 0.3) / 0.5), ...names(env, 'Brihaspati'), { x: 290, y: 330, size: 44, out: clamp((t - b1 + 0.5) / 0.3) });
      TY.plaque(ctx, T, clamp((t - b1 + 0.2) / 0.5), ...names(env, 'Shukra'), { x: 780, y: 270, size: 44, out: out(t, env, 0.3) });
      fin(ctx, T);
    },
    post: POST(0.32, 0.4) });

  // 4 · REVIVE (the signature shot): Shukra among the fallen with a hand raised; a ring of pale green light spreads from him,
  //     and as it passes, warrior after warrior sits up and stands
  R.scene({ id: 'revive', transition: { type: 'ink', dur: 0.6, at: [540, 1000], color: '#04140e' },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 3.3, cam = CAM.crane(E.inOutSine(clamp(t / env.dur)), { from: 1.36, to: 1.02, y0: 130, y1: -60 }), r = 900 * E.outCubic(clamp((t - b1 + 1.2) / 2.6));
      field(ctx, T, cam, (g, p) => {
        g.save(); g.strokeStyle = 'rgba(170,255,170,0.8)'; g.lineWidth = 12; g.beginPath(); g.ellipse(540, 1200, r, r * 0.3, 0, 0, TAU); g.stroke(); g.restore(); KIT.glow(g, 540, 1100, 200 + r * 0.6, '#9aff9a', 0.35);
        const P = [[150, 1150, 1], [330, 1300, -1], [800, 1160, 1], [960, 1300, -1], [60, 1320, 1]];
        P.forEach(([x, y, d], i) => { const up = E.inOutSine(clamp((r - Math.abs(x - 540) - 60) / 240)); if (up <= 0.02) lying(g, x, y, () => asura(g, T, i, 0, 0, 0.5, { name: 'stand' }, 'left', AL('#80c0a0')), d);
          else { g.save(); g.translate(x, y); g.rotate(d * Math.PI / 2 * 0.94 * (1 - up)); asura(g, T, i, 0, 0, 0.5, { name: 'raise', k: up }, x < 540 ? 'right' : 'left', AL('#c0ffb0')); g.restore(); } });
        shukra(g, p, T, 540, 1240, 0.72, { pose: ACT.pose(t, [[0, 'stand'], [b1 - 1.3, 'bless', { act: 0.6 }]]), L: EP51.bright('#e0ffe0', 1.35), ex: { emo: 'resolve', gaze: [0.5, 0.3] }, key: 'rv-s' }); }, { grass: false });
      TY.tag(ctx, T, clamp((t - (b[2] ?? 5.3) + 0.6) / 0.4), 'sanjivani · the art of raising the dead', { x: 540, y: 250, size: 34, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.44, 0.5) });

  // 5 · NOT: a tilt down from Brihaspati, his hands open and empty, to bright fallen gods laid in a row, still
  R.scene({ id: 'not', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.tilt(E.inOutSine(clamp((t - 0.6) / 2.2)), { from: -150, to: 150, zoom: 1.14 });
      EP51.heaven(ctx, T, cam, 'grief-blue', { stars: true, floor: 1180, figs: (g) => {
        CH.brihaspati.draw(g, { x: 540, y: 1000, scale: 0.72, facing: 'left', pose: { name: 'speak', k: 0.6 }, light: { dir: -Math.PI / 2, intensity: 1.2, front: 0.8, fill: 0.5, tint: ['#c8d8ff', 0.5] }, t: T, key: 'nt-b' });
        for (let i = 0; i < 4; i++) lying(g, 170 + i * 250, 1330 + (i % 2) * 40, () => deva(g, T, i, 0, 0, 0.44, { name: 'stand' }, 'left'), 1); } });
      fin(ctx, T);
    },
    post: POST(0.36, 0.5) });

  // 6 · SEND (the turn): a ring of tall gods round one slight young man in a student's pale gold; between their hands, in a rose
  //     glow, a young woman with flowers in her long hair
  R.scene({ id: 'send', transition: { type: 'dissolve', dur: 0.45 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 2.2, b1 = b[1] ?? 4.1, b2 = b[2] ?? 5.4, cam = CAM.push(t / env.dur, { from: 1.04, to: 1.2, focus: [540, 850] }), v = E.outCubic(clamp((t - b1 + 0.2) / 0.8));
      EP51.heaven(ctx, T, cam, 'crystal-sky', { sun: [820, 300, 90], floor: GY + 20,
        mid: (g) => { if (v > 0) { KIT.glow(g, 800, 560, 330, '#ffb0c8', 0.7 * v); g.save(); g.globalAlpha = 1; g.beginPath(); g.arc(800, 560, 210 * v, 0, TAU); g.clip(); g.fillStyle = '#f0b8c0'; g.fillRect(500, 300, 600, 600); F(g, T, 'devayani', 810, 900, 0.62, { f: 'left', pose: 'attend', L: EP51.bright('#ffe8f0', 1.3), ex: { emo: 'resolve', gaze: [0.6, -0.2] }, key: 'sd-d' }); g.restore(); g.strokeStyle = '#e7b54a'; g.lineWidth = 6; g.beginPath(); g.arc(800, 560, 210 * v, 0, TAU); g.stroke(); } },
        figs: (g, p) => { for (let i = 0; i < 4; i++) deva(g, T, i, [90, 250, 800, 980][i], GY + 10 + (i % 2) * 30, 0.8, { name: 'point', k: 0.5 }, i < 2 ? 'right' : 'left');
          kacha(g, p, T, 520, GY + 20, 0.82, { f: 'right', pose: ACT.pose(t, [[0, 'anjali'], [b1, 'attend', { act: 0.4 }]]), ex: { emo: ACT.emo(t, [[0, 'calm'], [b1 + 0.3, 'wonder']]), ...ACT.lead(t, [[0, [-0.6, -0.3]], [1.2, [0.7, -0.3]], [b1, [0.8, -0.8]]], 0.4, 0.3) }, key: 'sd-k' }); } });
      TY.plaque(ctx, T, clamp((t - b0 + 0.3) / 0.5), ...names(env, 'Kacha'), { x: 300, y: 330, size: 48, out: clamp((t - b1 + 0.2) / 0.3) });
      TY.plaque(ctx, T, clamp((t - b1 - 0.4) / 0.5), ...names(env, 'Devayani'), { x: 320, y: 330, size: 44, out: out(t, env, 0.3) });
      TY.turnWord(ctx, T, clamp((t - b2) / 0.6), 'Go', { x: 250, y: 620, size: 110, out: out(t, env, 0.3), sub: 'Adi 1.71.11' });
      fin(ctx, T);
    },
    post: POST(0.4, 0.38) });

  // the asura city: dark copper walls, a heavy gateway, Shukra's seat; horned guards
  const city = (ctx, T, cam, figs, o = {}) => EP51.court(ctx, T, cam, 'dharma-copper', { tx: null, crowd: 0, glow: 0.25, gx: 760, n: 4, figs, front: o.front || (() => {}), mid: o.mid });
  const seat = (g, x, y) => { g.fillStyle = '#3a1a0c'; g.fillRect(x - 170, y - 150, 340, 150); g.fillStyle = '#c8802a'; g.fillRect(x - 180, y - 166, 360, 22); };

  // 7 · CAME: Kacha, alone and small, bows with joined palms before Shukra's seat; huge horned guards lean to look at him
  R.scene({ id: 'came', transition: { type: 'lamp', dur: 0.7, from: [800, 560], to: [760, 700] },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.7, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 100, zoom: 1.12 }), come = 130 * E.outCubic(clamp(t / 1.2));
      city(ctx, T, cam, (g, p) => { seat(g, 800, GY - 10);
        shukra(g, p, T, 800, GY - 160, 0.8, { pose: { w: { sit: 1 }, prop: 'staff' }, L: EP51.lit(p, 800, GY, { from: [300, 300], front: 0.5 }), ex: { emo: 'resolve', gaze: [0.8, 0.2] }, key: 'cm-s' });
        for (const [x, f] of [[80, 'right'], [1030, 'left']]) asura(g, T, x > 500 ? 1 : 4, x, GY + 40, 0.96, { name: 'bow', k: 0.25 + 0.1 * Math.sin(T * 1.2 + x) }, f, AL('#ffb070'));
        kacha(g, p, T, 240 + come, GY + 20, 0.74, { pose: ACT.pose(t, [[0, 'walk'], [1.1, 'anjali', { act: 0.5 }], [(env.beats[2] ?? 3.5) - 0.3, 'bow', { act: 0.5 }]], { phase: ACT.stride(come, 0.74) }), L: EP51.lit(p, 300, GY, { from: [800, 300], front: 0.55 }), ex: { emo: 'resolve', speak: talk(env, t), gaze: [0.8, -0.2] }, key: 'cm-k' }); });
      TY.tag(ctx, T, clamp((t - b0 - 0.6) / 0.4), 'he names his father · Adi 1.71.17', { x: 540, y: 250, size: 32, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.34, 0.5) });

  // 8 · WELCOME (the close-up): Shukra's face: hard and measuring, one brow up; then it opens and he inclines his head
  R.scene({ id: 'welcome', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 2.0, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.1, focus: [540, 780] });
      city(ctx, T, cam, (g, p) => { F(g, T, 'shukra', 640, 2960, 2.5, { f: 'left', pose: { w: { stand: 1 }, prop: false }, L: { dir: -Math.PI / 2 - 0.5, intensity: 1.2, front: 0.65, fill: 0.3, tint: ['#ffc890', 0.4], minLum: 0.3 }, ex: { emo: ACT.emo(t, [[0, 'resolve'], [b1 - 0.6, 'tender', { dur: 0.7 }]]), speak: talk(env, t), ...ACT.lead(t, [[0, [0.8, 0.2]], [b1, [0.8, 0.5]]], 0.4, 0.3) }, key: 'wl-s' }); shade(g); });
      fin(ctx, T);
    },
    post: POST(0.3, 0.5) });

  // 9 · SERVED (a second silence): a garden: Kacha carries firewood past, then offers flowers, then dances a turn; Devayani,
  //     seated, tries not to smile and then does
  R.scene({ id: 'served', transition: { type: 'lamp', dur: 0.7, from: [540, 760], to: [300, 500] },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 2.9, b2 = b[2] ?? 4.8, cam = CAM.slide(t / env.dur, { from: -110, to: 110, zoom: 1.12 }), walk = 260 * E.inOutSine(clamp(t / (b1 - 0.2)));
      EP44.meadow(ctx, T, cam, { pal: 'meadow-spring', figs: (g, p) => {
        g.fillStyle = '#8a6a3a'; g.fillRect(700, 1210, 260, 30); F(g, T, 'devayani', 830, 1210, 0.8, { f: 'left', pose: ACT.pose(t, [[0, 'sit'], [b2, { sit: 0.7, speak: 0.3 }, { act: 0.5 }]]), L: EP51.lit(p, 830, 1210, { front: 0.45 }), ex: { emo: ACT.emo(t, [[0, 'calm'], [b1 + 0.4, 'wonder'], [b2, 'joy', { dur: 0.6 }]]), speak: t > b2 ? 0.5 + 0.5 * Math.sin(T * 8) : 0, gaze: [0.8, 0] }, key: 'sv-d' });
        kacha(g, p, T, 160 + walk, 1240, 0.84, { pose: ACT.pose(t, [[0, 'walk', { prop: 'bundle' }], [b1 - 0.3, 'offer', { act: 0.5 }], [b2 - 0.3, 'raise', { act: 0.3 }], [b2 + 0.3, 'point', { act: 0.3 }], [b2 + 0.9, 'raise', { act: 0.3 }]], { phase: ACT.stride(walk, 0.84), prop: t < b1 - 0.3 ? 'bundle' : t < b2 - 0.3 ? 'leaves' : false }), L: EP51.lit(p, 400, 1240, { front: 0.45 }), ex: { emo: 'joy', speak: t > b2 ? 0.5 + 0.5 * Math.sin(T * 8 + 1) : 0, gaze: [0.9, 0] }, key: 'sv-k' }); } });
      TY.tag(ctx, T, clamp((t - 1.2) / 0.4), 'a vow of a thousand years · Adi 1.71.18', { x: 540, y: 250, size: 32, out: clamp((t - b2 + 0.3) / 0.3) });
      TY.plaque(ctx, T, clamp((t - b2 + 0.1) / 0.5), ...names(env, 'Devayani'), { x: 800, y: 430, size: 44, out: out(t, env, 0.3) });
      fin(ctx, T);
    },
    post: POST(0.34, 0.4) });

  // 10 · CLIFF: a wood at violet dusk: Kacha alone with a few white cows; among the trunks, horned shapes closing in
  const cliff = (ctx, T, t, env, b) => {
    const cam = CAM.drift(CAM.pull(clamp(t / 7.6), { from: 1.34, to: 1.02, focus: [520, 950] }), T, 1.4), cl = E.inOutSine(clamp((t - b[1]) / 3.2));
    EP51.wood(ctx, T, cam, 'venom-violet', { seed: 250, shafts: false, dust: 'firefly', trunks: [-120, 1200],
      mid: (g) => { for (const [x, d] of [[-60, 1], [1140, -1], [560, 1]]) asura(g, T, x > 500 ? 2 : 5, x + d * 190 * cl, 1380, 0.8, { name: 'raise', k: 0.5 * cl }, d > 0 ? 'right' : 'left', { dir: -Math.PI / 2, intensity: 0.9, front: 0.2, fill: 0.15, tint: ['#b0ffa0', 0.6] }); },
      figs: (g, p) => { for (let i = 0; i < 3; i++) EP51.beast(g, 'cow', 300 + i * 250, GY + 10 + (i % 2) * 20, 0.62, { dir: i % 2 ? 1 : -1, T, head: -30 * cl });
        kacha(g, p, T, 560, GY - 10, 0.72, { f: 'right', pose: ACT.pose(t, [[0, 'stand'], [b[1] + 1.2, 'recoil', { act: 0.4 }]], { prop: 'staff' }), L: EP51.lit(p, 560, GY, { front: 0.5 }), ex: { emo: ACT.emo(t, [[0, 'calm'], [b[1] + 1.0, 'fear']]), gaze: [0.8, 0] }, key: 'cl-k' }); } });
    TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 110 });
    fin(ctx, T);
  };
  const CL = { dur: 6.66, b: [1.1, 2.8, 4.5, 6.0] };
  R.scene({ id: 'cliff', transition: { type: 'smoke', dur: 0.7, dir: Math.PI, color: '#24103a' }, draw(ctx, t, env) { cliff(ctx, env.T, t, env, env.beats.length > 3 ? env.beats : CL.b); }, post: POST(0.36, 0.52) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, CL.dur + t, env, CL.b) });
})();
