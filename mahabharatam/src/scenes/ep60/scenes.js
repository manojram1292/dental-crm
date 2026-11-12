/* Episode 60 · Kacha Dies Twice (CE Adi 1.71.26–58, 1.72.1). One scene per line of script/ep60.en.json.
 * Loads after ep41/_common, ep44/_common, ep46/_common, ep49/_common, ep51/_common.
 * TWO deaths, as the constituted text has them (the third of later tellings is star passage 701*): a tag and the source line
 * say so. Neither killing is drawn, and Kacha comes out of his teacher through light, not a wound. */
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
  const shade = (g, c = '4,8,20') => { const gr = g.createLinearGradient(0, 1060, 0, 1560); gr.addColorStop(0, `rgba(${c},0)`); gr.addColorStop(0.5, `rgba(${c},0.85)`); gr.addColorStop(1, `rgba(${c},0.96)`); g.fillStyle = gr; g.fillRect(-900, 1060, 2880, 1800); };
  const asura = (g, T, i, x, y, s, pose, f = 'left', L) => CH.asura.draw(g, { x, y, scale: s, index: i % 6, facing: f, pose, light: L || { dir: -Math.PI / 2, intensity: 0.9, front: 0.2, fill: 0.15, tint: ['#b0ffa0', 0.6] }, t: T, key: 'as' + i });
  const shukra = (g, p, T, x, y, s, o = {}) => F(g, T, 'shukra', x, y, s, { f: o.f || 'left', pose: o.pose || 'stand', L: o.L || EP51.bright('#e8f4ff', 1.25), ex: o.ex || { emo: 'resolve' }, key: o.key || 'sk' });
  const kacha = (g, p, T, x, y, s, o = {}) => F(g, T, 'kacha', x, y, s, { f: o.f || 'right', pose: o.pose || 'stand', L: o.L || EP51.bright('#fff4d8', 1.25), ex: o.ex || { emo: 'calm' }, key: o.key || 'kc' });
  const dev = (g, p, T, x, y, s, o = {}) => F(g, T, 'devayani', x, y, s, { f: o.f || 'left', pose: o.pose || 'attend', L: o.L || EP51.bright('#e8e8ff', 1.2), ex: o.ex || { emo: 'sorrow' }, key: o.key || 'dv' });
  const staff = (g, x, y, a, s = 1) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = '#8a5a2a'; g.beginPath(); g.roundRect(-300 * s, -10 * s, 600 * s, 20 * s, 10 * s); g.fill(); g.restore(); };
  const wood = (ctx, T, cam, o) => EP51.wood(ctx, T, cam, 'venom-violet', { seed: 250, shafts: false, dust: 'firefly', trunks: [-120, 1200], ...o });
  // Shukra's house: one lamp (a lamp, not a fire)
  const house = (ctx, T, cam, pal, figs, o = {}) => EP51.court(ctx, T, cam, pal, { tx: null, crowd: 0, glow: o.glow ?? 0.3, gx: o.gx ?? 300, n: 4, front: o.front || (() => {}),
    figs: (g, p) => { if (o.lamp !== false) { const lx = o.gx ?? 300; g.fillStyle = '#5a3a14'; g.fillRect(lx - 8, GY - 420, 16, 420); g.fillRect(lx - 60, GY - 20, 120, 20); g.beginPath(); g.ellipse(lx, GY - 430, 50, 16, 0, 0, TAU); g.fill(); KIT.glow(g, lx, GY - 470, 240, '#ffc060', 0.6 * KIT.flicker(T, 5)); g.fillStyle = '#fff0b0'; g.beginPath(); g.ellipse(lx, GY - 462, 10, 24, 0, 0, TAU); g.fill(); } figs(g, p); } });

  // 1 · HOOK: a violet wood: a herdsman's staff lies on the path, white cows walking away without him; a tilt up to a pale
  //     green light gathering in the tree tops
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.tilt(E.inOutSine(clamp((t - 0.5) / 2.8)), { from: 170, to: -200, zoom: 1.12 }), T, 0.6), d = 60 * t;
      wood(ctx, T, cam, { mid: (g) => KIT.glow(g, 540, 300, 520, '#9aff9a', 0.25 + 0.3 * clamp(t / 3)),
        figs: (g) => { staff(g, 430, GY + 20, 0.12, 0.8); for (let i = 0; i < 3; i++) EP51.beast(g, 'cow', 600 + i * 200 + d, GY - 20 + (i % 2) * 20, 0.56, { dir: 1, T, run: 0.4, phase: T * 4 + i }); } });
      EP51.hook(ctx, T, t, env, { y: 1500 });
      fin(ctx, T);
    },
    post: POST(0.36, 0.52) });

  // 2 · FIRST: a rack focus from the dropped staff in the foreground to horned shapes closing over the place where he stood;
  //     then only the jackals' eyes, low among the trunks
  R.scene({ id: 'first', transition: { type: 'smoke', dur: 0.6, dir: Math.PI, color: '#24103a' },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b2 = b[2] ?? 4.6, cam = CAM.rack(E.inOutSine(clamp((t - 0.6) / 1.4)), { from: 1.8, to: 1, zoom: 1.1 }), cl = E.inOutSine(clamp((t - 1.0) / 2.6)), gone = clamp((t - b2 + 0.4) / 0.8);
      wood(ctx, T, cam, { trunks: false,
        figs: (g, p) => { if (gone < 1) { g.save(); g.globalAlpha = 1 - gone; kacha(g, p, T, 540, GY - 20, 0.7, { pose: ACT.pose(t, [[0, 'stand'], [1.4, 'recoil', { act: 0.4 }]], { prop: 'staff' }), L: EP51.lit(p, 540, GY, { front: 0.5 }), ex: { emo: ACT.emo(t, [[0, 'calm'], [1.3, 'fear']]) }, key: 'fs-k' }); g.restore(); }
          g.fillStyle = '#8a70c0'; g.beginPath(); g.ellipse(540, GY - 380, 640, 520, 0, 0, TAU); g.fill();
          for (const [x, dd, i] of [[-80, 1, 0], [1160, -1, 1], [200, 1, 2], [900, -1, 3]]) asura(g, T, i + 1, x + dd * 330 * cl, GY + 20 + (i % 2) * 30, 0.86, { name: 'raise', k: 0.6 * cl }, dd > 0 ? 'right' : 'left');
          for (let i = 0; i < 4; i++) { const a = gone * (0.6 + 0.4 * Math.sin(T * 2 + i)); g.globalAlpha = a; g.fillStyle = '#ffe060'; const x = 150 + i * 250, y = GY - 60 - 30 * (i % 2); g.beginPath(); g.ellipse(x, y, 9, 6, 0, 0, TAU); g.ellipse(x + 34, y, 9, 6, 0, 0, TAU); g.fill(); } g.globalAlpha = 1; },
        near: (g) => staff(g, 420, 1760, 0.1, 1.5) });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.6) / 0.4)), env.strings, { y: 190 });
      TY.plaque(ctx, T, clamp((t - 2.9) / 0.5), ...names(env, 'Kacha'), { x: 540, y: 300, size: 46, out: clamp((t - b2) / 0.3) });
      TY.tag(ctx, T, clamp((t - b2 - 0.1) / 0.4), 'cut small as sesame, given to the jackals', { x: 540, y: 250, size: 42, out: out(t, env, 0.3) });
      fin(ctx, T);
    },
    post: POST(0.34, 0.55) });

  // 3 · COWS (the close-up): Devayani's face: watching the gate, hope; then the cows pass and no one follows: fear
  R.scene({ id: 'cows', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 1.9, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.1, focus: [540, 780] });
      house(ctx, T, cam, 'grief-blue', (g, p) => { F(g, T, 'devayani', 640, 2960, 2.5, { f: 'left', pose: 'stand', L: { dir: -Math.PI / 2 - 0.6, intensity: 1.2, front: 0.6, fill: 0.3, tint: ['#ffd0a0', 0.35], minLum: 0.3 }, ex: { emo: ACT.emo(t, [[0, 'wonder'], [b1 - 0.5, 'fear', { dur: 0.6 }], [b1 + 0.6, 'sorrow', { dur: 0.6 }]]), speak: talk(env, t), ...ACT.lead(t, [[0, [0.9, 0]], [b1, [0.3, 0.2]]], 0.4, 0.25) }, key: 'cw-d' }); shade(g); }, { lamp: false, glow: 0.12 });
      TY.plaque(ctx, T, clamp((t - 0.7) / 0.5), ...names(env, 'Devayani'), { x: 280, y: 360, size: 42, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.3, 0.52) });

  // 4 · COME: Shukra standing, a hand flung out; a ring of pale green light opens in the air and Kacha steps out of it
  R.scene({ id: 'come', transition: { type: 'ink', dur: 0.6, at: [540, 800], color: '#04140e' },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 3.0, b2 = b[2] ?? 4.9, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 110, zoom: 1.12 }), ring = E.outCubic(clamp((t - b1) / 0.8)), step = E.outCubic(clamp((t - b2 + 0.5) / 1.0));
      house(ctx, T, cam, 'thicket-shade', (g, p) => {
        shukra(g, p, T, 700, GY + 10, 0.92, { pose: ACT.pose(t, [[0, 'stand'], [b1 - 0.5, 'curse', { act: 0.4 }], [b2, 'bless', { act: 0.5 }]]), L: EP51.lit(p, 800, GY, { from: [300, 400], front: 0.5 }), ex: { emo: 'resolve', speak: t > b1 - 0.3 && t < b1 + 0.5 ? 1 : 0, gaze: [0.8, 0] }, key: 'cm-s' });
        dev(g, p, T, 900, GY + 20, 0.74, { pose: 'anjali', ex: { emo: ACT.emo(t, [[0, 'sorrow'], [b2, 'joy']]) }, key: 'cm-d' });
        KIT.glow(g, 330, GY - 420, 520 * ring, '#9aff9a', 0.6 * ring); g.strokeStyle = 'rgba(190,255,190,0.9)'; g.lineWidth = 10; g.beginPath(); g.ellipse(330, GY - 400, 230 * ring, 430 * ring, 0, 0, TAU); g.stroke();
        if (step > 0) { g.save(); g.globalAlpha = 1; g.beginPath(); g.ellipse(330 + 60 * step, GY - 400, 330 * ring, 520 * ring, 0, 0, TAU); g.clip(); kacha(g, p, T, 300 + 80 * step, GY + 10, 0.84, { pose: ACT.pose(t, [[0, 'walk'], [b2 + 0.3, 'attend', { act: 0.5 }]], { phase: T * 3 }), L: EP51.bright('#e0ffe0', 1.35), ex: { emo: 'wonder', gaze: [0.5, 0.6] }, key: 'cm-k' }); g.restore(); } }, { gx: 1150, lamp: false, glow: 0.15 });
      TY.plaque(ctx, T, clamp((t - (b[0] ?? 1.2) + 0.3) / 0.5), ...names(env, 'Shukra'), { x: 300, y: 300, size: 46, out: clamp((t - b1 - 0.6) / 0.3) });
      TY.tag(ctx, T, clamp((t - b1 - 0.9) / 0.4), 'the art of raising the dead', { x: 540, y: 250, size: 42, out: out(t, env, 0.3) });
      fin(ctx, T);
    },
    post: POST(0.44, 0.5) });

  // 5 · SECOND: asura hands only, in red light: a pinch of grey ash falls into a gold cup; the cup is carried to the sage
  R.scene({ id: 'second', transition: { type: 'smoke', dur: 0.6, dir: -Math.PI / 2, color: '#5a0c18' },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b2 = b[2] ?? 4.3, cam = CAM.tilt(E.inOutSine(clamp((t - 1.6) / 2.2)), { from: 180, to: -130, zoom: 1.12 }), fall = clamp(t / 1.6), carry = E.inOutSine(clamp((t - 2.0) / 1.8));
      EP51.void(ctx, T, cam, 'wrath-crimson', { gy: 1500, glow: [540, 1100, 800, '#ff6a40', 0.3],
        back: (g, p) => ST.pillars(g, p, { y: 1500, n: 4 }),
        figs: (g, p) => {
          shukra(g, p, T, 760, 700, 0.9, { pose: ACT.pose(t, [[0, { sit: 1 }], [b2 - 0.6, { sit: 0.7, offer: 0.3 }, { act: 0.5 }]], { prop: false }), L: { dir: Math.PI / 2 + 0.3, intensity: 1.2, front: 0.6, fill: 0.3, tint: ['#ffb090', 0.5], minLum: 0.3 }, ex: { emo: 'calm', gaze: [0.6, 0.4] }, key: 'sc-s' }); g.fillStyle = '#3a0c0a'; g.fillRect(560, 700, 420, 40);
          const cx = lerp(380, 600, carry), cy = lerp(1280, 560, carry);
          g.fillStyle = '#1a0806'; g.beginPath(); g.roundRect(cx - 300, cy + 40, 250, 80, 40); g.fill(); g.beginPath(); g.ellipse(cx - 60, cy + 70, 70, 50, 0, 0, TAU); g.fill();   // an asura's dark hand under the cup
          g.fillStyle = '#e7b54a'; g.beginPath(); g.moveTo(cx - 70, cy - 60); g.lineTo(cx + 70, cy - 60); g.lineTo(cx + 44, cy + 40); g.lineTo(cx - 44, cy + 40); g.closePath(); g.fill(); g.fillRect(cx - 14, cy + 40, 28, 40); g.fillRect(cx - 50, cy + 76, 100, 12); g.fillStyle = '#5a0c18'; g.beginPath(); g.ellipse(cx, cy - 58, 66, 14, 0, 0, TAU); g.fill();
          if (fall < 1) { for (let i = 0; i < 16; i++) { const u = (fall * 1.4 + hash(i, 3)) % 1; g.globalAlpha = 0.9 * (1 - u); g.fillStyle = '#c8c4bc'; g.beginPath(); g.arc(cx + 30 * (hash(i, 4) - 0.5), cy - 360 + 300 * u, 6, 0, TAU); g.fill(); } g.globalAlpha = 1; g.fillStyle = '#1a0806'; g.beginPath(); g.ellipse(cx + 10, cy - 400, 80, 50, 0.3, 0, TAU); g.fill(); } } });
      TY.tag(ctx, T, clamp((t - 1.4) / 0.4), 'Other versions add a third death.', { x: 300, y: 150, size: 38, out: out(t, env, 0.3) });
      TY.tag(ctx, T, clamp((t - 1.4) / 0.4), 'The Critical Edition has two.', { x: 300, y: 210, size: 38, out: out(t, env, 0.3) });
      fin(ctx, T);
    },
    post: POST(0.36, 0.55) });

  // 6 · BELLY (the turn): Shukra stands calling toward the dark door; then stops, and slowly looks down at himself, a hand
  //     going to his own belly, where a small green light pulses
  R.scene({ id: 'belly', transition: { type: 'dissolve', dur: 0.45 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 1.9, b1 = b[1] ?? 3.8, b2 = b[2] ?? 6.1, cam = CAM.push(t / env.dur, { from: 1.04, to: 1.28, focus: [600, 850] }), a = clamp((t - b1) / 0.8);
      house(ctx, T, cam, 'hearth-amber', (g, p) => {
        shukra(g, p, T, 620, GY + 10, 1.0, { pose: ACT.pose(t, [[0, 'curse'], [b0 + 0.6, 'stand', { act: 0.5 }], [b1 + 0.3, { anjali: 0.5, stand: 0.5 }, { act: 0.6 }]], { prop: false }), L: EP51.lit(p, 620, GY, { from: [300, 700], front: 0.5 }), ex: { emo: ACT.emo(t, [[0, 'resolve'], [b1, 'shock', { dur: 0.6 }]]), speak: t > 0.9 && t < b0 ? 0.6 : 0, ...ACT.lead(t, [[0, [0.9, 0]], [b1 - 0.2, [0.4, 0.9]]], 0.5, 0.35) }, key: 'bl-s' });
        KIT.glow(g, 585, GY - 520, 150, '#9aff9a', 0.9 * a * (0.6 + 0.4 * Math.sin(T * 5))); g.fillStyle = '#eaffd8'; g.globalAlpha = a; g.beginPath(); g.arc(585, GY - 520, 10, 0, TAU); g.fill(); g.globalAlpha = 1;
        dev(g, p, T, 980, GY + 20, 0.78, { pose: 'attend', ex: { emo: 'fear', gaze: [0.8, 0] }, key: 'bl-d' }); });
      TY.turnWord(ctx, T, clamp((t - b2 + 0.2) / 0.6), 'Within', { x: 240, y: 260, size: 80, out: out(t, env, 0.3), sub: 'Adi 1.71.41' });
      fin(ctx, T);
    },
    post: POST(0.36, 0.5) });

  // 7 · TWO: Devayani on her knees between the lamp and the door, turned to her father; her hands go out to him and stop
  R.scene({ id: 'two', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 2.1, cam = CAM.slide(t / env.dur, { from: 90, to: -90, zoom: 1.2 });
      house(ctx, T, cam, 'grief-blue', (g, p) => {
        dev(g, p, T, 700, GY + 20, 0.96, { f: 'right', pose: ACT.pose(t, [[0, { kneel: 0.8, offer: 0.2 }], [b1 - 0.3, { kneel: 0.7, grieve: 0.3 }, { act: 0.5 }], [b1 + 0.9, { kneel: 0.7, reach: 0.3 }, { act: 0.5 }]]), L: EP51.lit(p, 700, GY, { from: [300, 700], front: 0.5 }), ex: { emo: 'plead', speak: talk(env, t), gaze: [0.8, -0.4] }, key: 'tw-d' }); }, { glow: 0.25 });
      fin(ctx, T);
    },
    post: POST(0.32, 0.52) });

  // 8 · TEACH (a second silence): Shukra seated, eyes closed, both hands over the light in his belly, his lips moving; the
  //     green light turns gold as it learns
  R.scene({ id: 'teach', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.push(t / env.dur, { from: 1.1, to: 1.3, focus: [540, 900] }), k = E.inOutSine(clamp((t - 1.6) / 2.2));
      house(ctx, T, cam, 'release-gold', (g, p) => {
        g.fillStyle = '#5a3a14'; g.fillRect(380, GY - 60, 340, 70);
        shukra(g, p, T, 560, GY - 60, 1.05, { pose: { w: { sit: 0.7, anjali: 0.3 }, prop: false }, L: EP51.bright('#fff0c0', 1.25), ex: { emo: 'tender', speak: talk(env, t) || (t > 3.4 ? 0.3 + 0.3 * Math.sin(T * 9) : 0), gaze: [0.3, 0.9] }, key: 'tc-s' });
        KIT.glow(g, 530, GY - 470, 190, KIT.hex('#9aff9a', '#ffe070', k), 0.9 * (0.7 + 0.3 * Math.sin(T * 5))); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(530, GY - 470, 11, 0, TAU); g.fill(); }, { lamp: false, glow: 0.3, gx: 540 });
      fin(ctx, T);
    },
    post: POST(0.4, 0.45) });

  // 9 · OUT (the signature shot): a white disc of light swells like a moon; out of it Kacha steps, whole; behind him the sage
  //     lies fallen; Kacha raises a hand as his teacher did, and Shukra's eyes open. No wound is drawn: light opens.
  R.scene({ id: 'out', transition: { type: 'lamp', dur: 0.8, from: [530, 900], to: [540, 760] },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 2.8, b3 = b[3] ?? 4.4, cam = CAM.crane(E.inOutSine(clamp(t / env.dur)), { from: 1.3, to: 1.03, y0: 110, y1: -40 }), moon = E.outCubic(clamp(t / 1.3)), fade = clamp((t - b1 + 0.6) / 0.8), wake = E.inOutSine(clamp((t - b3 + 0.3) / 0.7));
      EP51.heaven(ctx, T, cam, 'memory-indigo', { stars: true, floor: GY + 30,
        mid: (g) => { KIT.glow(g, 540, 620, 900 * moon, '#ffffff', 0.5 * (1 - 0.5 * fade)); g.fillStyle = '#fbfbff'; g.beginPath(); g.arc(540, 620, 400 * moon * (1 - 0.25 * fade), 0, TAU); g.fill(); },
        figs: (g, p) => {
          g.save(); g.translate(1040, GY - 330); g.rotate(-Math.PI / 2 * 0.92 * (1 - wake)); shukra(g, p, T, 0, 0, 0.72, { pose: { w: wake > 0.5 ? { attend: 1 } : { stand: 1 }, prop: false }, L: EP51.bright('#e8e8ff', 1.2), ex: { emo: wake > 0.5 ? 'wonder' : 'weary', gaze: [0.5, 0] }, key: 'ot-s' }); g.restore();
          KIT.glow(g, 900, GY - 200, 260, '#ffe070', 0.6 * wake);
          kacha(g, p, T, 260, GY + 20, 0.9, { f: t > b1 ? 'right' : 'left', pose: ACT.pose(t, [[0, 'walk'], [1.3, 'stand', { act: 0.5 }], [b3 - 0.6, 'bless', { act: 0.6 }]], { phase: T * 3 }), L: EP51.bright('#ffffff', 1.4), ex: { emo: ACT.emo(t, [[0, 'wonder'], [b1, 'sorrow'], [b3, 'resolve']]), gaze: [0.8, 0.2] }, key: 'ot-k' }); } });
      fin(ctx, T);
    },
    post: POST(0.5, 0.42) });

  // 10 · CLIFF: the garden at morning: Kacha with a traveller's staff and bundle, bowing farewell; Devayani steps into his path
  const cliff = (ctx, T, t, env, b) => {
    const cam = CAM.drift(CAM.pull(clamp(t / 6.2), { from: 1.3, to: 1.02, focus: [560, 900] }), T, 1.4), st = 150 * E.outCubic(clamp((t - b[2] + 0.4) / 1.0));
    EP44.meadow(ctx, T, cam, { pal: 'meadow-spring', figs: (g, p) => {
      kacha(g, p, T, 330, 1240, 0.84, { f: 'right', pose: ACT.pose(t, [[0, 'bow'], [b[1] - 0.2, 'walk', { act: 0.4 }], [b[2], 'recoil', { act: 0.3 }]], { phase: T * 3, prop: 'staff' }), L: EP51.lit(p, 330, 1240, { front: 0.45 }), ex: { emo: ACT.emo(t, [[0, 'calm'], [b[2], 'wonder']]), gaze: [0.9, 0] }, key: 'cl-k' });
      dev(g, p, T, 900 - st, 1240, 0.8, { pose: ACT.pose(t, [[0, 'attend'], [b[2] - 0.4, 'walk', { act: 0.3 }], [b[2] + 0.5, 'shield', { act: 0.5 }]], { phase: ACT.stride(st, 0.8) }), L: EP51.lit(p, 800, 1240, { front: 0.45 }), ex: { emo: 'resolve', gaze: [0.9, 0] }, key: 'cl-d' }); } });
    TY.tag(ctx, T, clamp((t - 0.8) / 0.4), 'after a thousand years', { x: 540, y: 330, size: 42, out: clamp((t - 2.6) / 0.3) });
    TY.tag(ctx, T, clamp((t - 2.9) / 0.4), 'Shukra then forbade wine to brahmins', { x: 540, y: 330, size: 42, out: clamp((t - 5.0) / 0.3) });
    TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 110 });
    fin(ctx, T);
  };
  const CL = { dur: 5.18, b: [0.6, 1.5, 2.3, 4.5] };
  R.scene({ id: 'cliff', transition: { type: 'brush', dur: 0.5, angle: 0.15, color: '#f4fbd0' }, draw(ctx, t, env) { cliff(ctx, env.T, t, env, env.beats.length > 3 ? env.beats : CL.b); }, post: POST(0.32, 0.4) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, CL.dur + t, env, CL.b) });
})();
