/* Episode 55 · A Marriage Without Witnesses (CE Adi 1.67, 1.68.1–10). One scene per line of script/ep55.en.json.
 * Loads after ep41/_common, ep44/_common, ep46/_common, ep49/_common, ep51/_common.
 * The two stand apart throughout; the joined right hands of `wed` are the only touch, and the union is not shown. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41, EP51 = window.EP51;
  const { TAU, clamp, lerp, E, hash } = R;
  const GY = EP41.GY, HZ = EP41.HZ;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const names = (env, n) => [n, env.script.names[n]];
  const talk = (env, t) => EP41.mouth(env, t);
  const POST = (b = 0.3, v = 0.45) => () => ({ bloom: b, vignette: v, paper: 0.3 });
  const out = (t, env, d = 0.4) => clamp((t - (env.dur - d)) / 0.3);
  const F = EP51.fig;
  const yard = (ctx, T, cam, pal, figs, o = {}) => EP51.wood(ctx, T, cam, pal, { seed: 120, huts: [[820, 1.5, 0.2]], shaftX: o.shaftX ?? 300, shaftA: o.shaftA ?? 0.35, shafts: o.shafts, mist: o.mist, figs, dust: o.dust || 'pollen', near: o.near, trunks: o.trunks });
  const king = (g, p, T, x, y, s, o = {}) => F(g, T, 'dushyantaPlain', x, y, s, { f: o.f || 'right', pose: o.pose || 'stand', L: o.L || EP51.lit(p, x, y, { front: 0.38 }), ex: o.ex || { emo: 'resolve', gaze: [0.9, 0] }, key: o.key || 'kg' });
  const girl = (g, p, T, x, y, s, o = {}) => F(g, T, 'shakuntala', x, y, s, { f: o.f || 'left', pose: o.pose || 'attend', L: o.L || EP51.lit(p, x, y, { front: 0.4 }), ex: o.ex || { emo: 'tender' }, key: o.key || 'gl' });
  const shade = (g, c = '20,40,10') => { const gr = g.createLinearGradient(0, 1220, 0, 1700); gr.addColorStop(0, `rgba(${c},0)`); gr.addColorStop(0.5, `rgba(${c},0.85)`); gr.addColorStop(1, `rgba(${c},0.96)`); g.fillStyle = gr; g.fillRect(-900, 1220, 2880, 1600); };

  // 1 · HOOK: the yard at coral evening: the king, a hand held out, palm up; the girl three paces away, half turned from him
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.push(E.outCubic(clamp(t / 3.0)), { from: 1.02, to: 1.22, focus: [480, 900] }), T, 0.6);
      yard(ctx, T, cam, 'fishers-coral', (g, p) => {
        king(g, p, T, 260, GY + 10, 0.84, { pose: ACT.pose(t, [[0, 'stand'], [0.1, 'offer', { act: 0.4 }]]), L: EP51.lit(p, 260, GY, { from: [900, 500], front: 0.4 }), ex: { emo: 'tender', speak: talk(env, t), gaze: [0.9, 0] }, key: 'hk-k' });
        girl(g, p, T, 720, GY, 0.78, { f: t > 1.6 ? 'left' : 'right', pose: ACT.pose(t, [[0, 'attend'], [1.6, 'recoil', { act: 0.3, dur: 0.5 }]]), ex: { emo: ACT.emo(t, [[0, 'calm'], [1.6, 'wonder']]), gaze: [0.8, 0] }, key: 'hk-g' }); });
      EP51.hook(ctx, T, t, env, { y: 1500 });
      fin(ctx, T);
    },
    post: POST(0.32, 0.45) });

  // 2 · WHO: a crane down through the canopy to the small yard, the two of them and the empty hut
  R.scene({ id: 'who', transition: { type: 'brush', dur: 0.5, angle: 0.2, color: '#eef8d8' },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 2.1, cam = CAM.crane(E.inOutSine(clamp(t / env.dur)), { from: 1.3, to: 1.04, y0: -110, y1: 20 });
      yard(ctx, T, cam, 'hermitage-green', (g, p) => { king(g, p, T, 280, GY + 10, 0.74, { key: 'wh-k' }); girl(g, p, T, 690, GY, 0.7, { key: 'wh-g' }); });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.6) / 0.4)), env.strings, { y: 190 });
      TY.plaque(ctx, T, clamp((t - 0.9) / 0.5), ...names(env, 'Dushyanta'), { x: 270, y: 430, size: 40, out: clamp((t - b1 - 0.2) / 0.3) });
      TY.plaque(ctx, T, clamp((t - b1 - 0.4) / 0.5), ...names(env, 'Shakuntala'), { x: 760, y: 430, size: 40, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.3, 0.42) });

  // 3 · WAIT: she looks down the path toward the river, a hand lifted to it; he follows her look, then shakes his head
  R.scene({ id: 'wait', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 2.6, cam = CAM.slide(t / env.dur, { from: -70, to: 70, zoom: 1.2 });
      yard(ctx, T, cam, 'hermitage-green', (g, p) => {
        king(g, p, T, 280, GY + 10, 0.84, { ex: { emo: 'resolve', ...ACT.lead(t, [[0, [0.9, 0]], [1.2, [-0.8, 0]], [b1, [0.9, 0]]], 0.4, 0.3) }, key: 'wt-k' });
        girl(g, p, T, 700, GY, 0.8, { pose: ACT.pose(t, [[0, 'speak'], [0.8, 'point', { act: 0.5 }]]), ex: { emo: 'tender', speak: talk(env, t), gaze: [0.7, 0] }, key: 'wt-g' }); });
      fin(ctx, T);
    },
    post: POST(0.3, 0.42) });

  // 4 · SELF: the low sun through the trees: the king, earnest, a hand on his own chest and then opened toward her
  R.scene({ id: 'self', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.1, cam = CAM.push(t / env.dur, { from: 1.14, to: 1.3, focus: [420, 800] });
      yard(ctx, T, cam, 'wedding-turmeric', (g, p) => {
        king(g, p, T, 330, GY + 10, 0.92, { pose: ACT.pose(t, [[0, 'anjali'], [b0 + 0.4, 'offer', { act: 0.5 }]]), L: EP51.lit(p, 330, GY, { from: [900, 600], front: 0.45 }), ex: { emo: 'tender', speak: talk(env, t), gaze: [0.9, 0] }, key: 'sf-k' });
        girl(g, p, T, 800, GY, 0.84, { ex: { emo: 'wonder', gaze: [0.8, 0.3] }, key: 'sf-g' }); }, { shaftX: 900, shaftA: -0.6, shafts: 0.24 });
      fin(ctx, T);
    },
    post: POST(0.38, 0.4) });

  // 5 · GANDHARVA: evening mist shuts the yard off from the world: no fire, no priest, no guests; a ring of empty grass seats
  R.scene({ id: 'gandharva', transition: { type: 'smoke', dur: 0.7, dir: 0, color: '#e8e4f8' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 130, zoom: 1.12 }), m = E.inOutSine(clamp(t / 2.4));
      yard(ctx, T, cam, 'mist-lavender', (g, p) => {
        for (let i = 0; i < 7; i++) { const a = Math.PI + (i / 6) * Math.PI, x = 520 + Math.cos(a) * 430, y = GY - 20 + Math.sin(a) * -90; g.fillStyle = KIT.hex(p.near, '#c8b070', 0.4); g.beginPath(); g.ellipse(x, y, 70, 20, 0, 0, TAU); g.fill(); }
        king(g, p, T, 330, GY + 10, 0.8, { ex: { emo: 'tender', gaze: [0.9, 0] }, key: 'gd-k' }); girl(g, p, T, 720, GY, 0.76, { ex: { emo: 'wonder', gaze: [0.8, 0.4] }, key: 'gd-g' }); }, { mist: 0.75 * m, shafts: false, dust: 'firefly' });
      TY.tag(ctx, T, clamp((t - (env.beats[0] ?? 1.6)) / 0.4), 'gandharva marriage · lawful for a king · Adi 1.67.26', { x: 540, y: 250, size: 32, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.36, 0.38) });

  // 6 · TERMS (the turn; the close-up): her face: shy, eyes down; then the chin lifts and the eyes meet his, level
  R.scene({ id: 'terms', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 1.7, b2 = b[2] ?? 3.9, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.1, focus: [540, 780] });
      EP51.wood(ctx, T, cam, 'meadow-spring', { seed: 120, trunks: false, figs: (g, p) => {
        F(g, T, 'shakuntala', 640, 2960, 2.5, { f: 'left', pose: 'stand', L: ST.light(p, { from: [200, 200], at: [600, 1200], k: 1.0, front: 0.4 }), ex: { emo: ACT.emo(t, [[0, 'tender'], [b0 - 0.5, 'resolve', { dur: 0.6 }]]), speak: talk(env, t), ...ACT.lead(t, [[0, [0.5, 0.8]], [b0 - 0.5, [0.9, 0]]], 0.4, 0.25) }, key: 'tm-g' }); shade(g); } });
      TY.turnWord(ctx, T, clamp((t - (b[1] ?? 2.5) + 0.2) / 0.6), 'Promise', { x: 300, y: 1270, size: 84, out: out(t, env, 0.3), sub: 'Adi 1.67.16–17' });
      fin(ctx, T);
    },
    post: POST(0.3, 0.42) });

  // 7 · WED (the signature shot): through an arch of flowering branches: the two stand facing, their right hands joined
  //     between them at the centre of the frame; petals come down; no fire, no witness
  R.scene({ id: 'wed', transition: { type: 'lamp', dur: 0.7, from: [540, 760], to: [540, 800] },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 2.1, j = E.inOutSine(clamp((t - b1 + 0.9) / 0.9)), cam = CAM.push(t / env.dur, { from: 1.0, to: 1.1, focus: [540, 900] });
      ST.within(ctx, T, { shape: 'leaves', pal: 'island-gold', box: [80, 300, 920, 1080], open: 1, draw: (g) => {
        EP51.wood(g, T, cam, 'island-gold', { seed: 181, trunks: false, shafts: 0.22, dust: 'petal', dustN: 60, figs: (gg, p) => {
          KIT.glow(gg, 540, 900, 520, '#fff4c0', 0.4 * j);
          king(gg, p, T, 380, 1180, 0.64, { pose: ACT.pose(t, [[0, 'stand'], [b1 - 0.9, 'offer', { act: 0.6 }]]), L: EP51.bright('#fff0c0', 1.25), ex: { emo: 'joy', gaze: [0.9, 0] }, key: 'wd-k' });
          girl(gg, p, T, 700, 1180, 0.6, { pose: ACT.pose(t, [[0, 'attend'], [b1 - 0.7, 'offer', { act: 0.6 }]]), L: EP51.bright('#fff0c0', 1.25), ex: { emo: 'tender', gaze: [0.9, 0] }, key: 'wd-g' }); } }); } });
      fin(ctx, T);
    },
    post: POST(0.42, 0.42) });

  // 8 · ARMY: the next day's hard light: the king, crowned again, on his chariot at the forest's edge, a hand raised; she small
  R.scene({ id: 'army', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.pull(clamp(t / env.dur), { from: 1.4, to: 1.02, focus: [640, 950] }), d = 140 * E.inCubic(clamp(t / env.dur));
      EP51.land(ctx, T, cam, 'noon-ochre', { sun: [540, 300, 90], hz: 1040, treeH: 420, dust: 'dust', seed: 190,
        far: (g, p) => { F(g, T, 'shakuntala', 150, 1070, 0.3, { f: 'right', pose: 'attend', L: EP51.lit(p, 150, 1070, { front: 0.4 }), ex: { emo: 'tender' }, key: 'ar-g' }); },
        figs: (g, p) => { for (let i = 0; i < 12; i++) { g.fillStyle = '#3a2408'; g.fillRect(900 + i * 40 + d, 760 - 30 * hash(i, 3), 5, 400); }
          KIT.army.draw(g, 'chariot', { x: 640 + d, y: 1190, s: 1.3, dir: 1, t: T, gait: clamp(t / 2), fill: '#3a1a0c', line: '#120806', gold: '#f0c050', rim: '#fff0b0', light: -Math.PI / 2, banner: '#1f8a5a' });
          F(g, T, 'dushyanta', 590 + d, 1095, 0.27, { f: 'left', pose: { w: { bless: 0.7, stand: 0.3 } }, L: EP51.lit(p, 600, 1100, { front: 0.45 }), ex: { emo: 'tender' }, key: 'ar-k' }); } });
      TY.tag(ctx, T, clamp((t - 0.9) / 0.4), 'he promised it again and again · Adi 1.67.20', { x: 540, y: 250, size: 32, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.34, 0.4) });

  // 9 · KANVA: a rack focus from Shakuntala in the foreground, turned away, her head bent, to the old sage at the gate
  R.scene({ id: 'kanva', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.6, cam = CAM.rack(E.inOutSine(clamp((t - b0 + 0.4) / 1.2)), { from: 1.5, to: 1, zoom: 1.1 }), come = 120 * E.outCubic(clamp(t / 1.6));
      EP51.wood(ctx, T, cam, 'river-jade', { seed: 120, trunks: false,
        figs: (g, p) => F(g, T, 'kanva', 150 + come, GY - 40, 0.7, { f: 'right', pose: ACT.pose(t, [[0, 'walk'], [1.6, 'attend', { act: 0.5 }]], { phase: ACT.stride(come, 0.7), prop: 'bundle' }), L: EP51.lit(p, 300, GY, { front: 0.4 }), ex: { emo: ACT.emo(t, [[0, 'calm'], [b0 + 0.6, 'tender']]), gaze: [0.9, 0] }, key: 'kv-k' }),
        near: (g, p) => F(g, T, 'shakuntala', 860, 1900, 1.25, { f: 'right', pose: { w: { grieve: 0.5, stand: 0.5 } }, L: EP51.lit(p, 860, 1700, { front: 0.3 }), ex: { emo: 'sorrow', gaze: [0.4, 0.8] }, key: 'kv-g' }) });
      TY.plaque(ctx, T, clamp((t - b0 + 0.3) / 0.5), ...names(env, 'Kanva'), { x: 300, y: 330, size: 46, out: out(t, env) });
      TY.tag(ctx, T, clamp((t - b0 - 0.9) / 0.4), 'by his divine sight · Adi 1.67.24', { x: 300, y: 500, size: 30, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.3, 0.42) });

  // 10 · BLESS (a second silence): Kanva's hand raised over her bowed head; a tilt up from her face to his, grave and kind
  R.scene({ id: 'bless', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 2.1, b1 = b[1] ?? 3.4, cam = CAM.tilt(E.inOutSine(clamp((t - b0 + 0.6) / 2.6)), { from: 150, to: -170, zoom: 1.2 });
      yard(ctx, T, cam, 'release-gold', (g, p) => {
        F(g, T, 'kanva', 360, GY + 10, 1.02, { f: 'right', pose: ACT.pose(t, [[0, 'stand'], [0.9, 'bless', { act: 0.6 }]], { prop: false }), L: EP51.lit(p, 360, GY, { from: [900, 300], front: 0.45 }), ex: { emo: 'tender', speak: talk(env, t), gaze: [0.8, 0.4] }, key: 'bl-k' });
        girl(g, p, T, 830, GY + 10, 0.86, { pose: ACT.pose(t, [[0, 'bow'], [b1 + 0.3, 'anjali', { act: 0.6 }]]), ex: { emo: ACT.emo(t, [[0, 'sorrow'], [b1, 'joy', { dur: 0.7 }]]), gaze: [0.7, 0.3] }, key: 'bl-g' }); }, { shaftX: 800, shaftA: -0.5, shafts: 0.22 });
      fin(ctx, T);
    },
    post: POST(0.4, 0.4) });

  // 11 · CLIFF: the same yard, years on: Shakuntala at the door; across the foreground a small boy holding a rope; at the
  //      rope's end, a full-grown lion lying down
  const cliff = (ctx, T, t, env, b) => {
    const cam = CAM.drift(CAM.slide(clamp(t / 6.6), { from: -130, to: 130, zoom: 1.12 }), T, 1.4), a = E.outCubic(clamp((t - (b[1] ?? 2.1) + 0.5) / 0.8));
    yard(ctx, T, cam, 'hunt-emerald', (g, p) => {
      girl(g, p, T, 840, GY - 30, 0.66, { ex: { emo: 'calm', gaze: [0.8, 0.2] }, key: 'cl-g' });
      g.save(); g.globalAlpha = 1; g.translate(-600 * (1 - a), 0);
      EP51.beast(g, 'lion', 300, GY + 30, 1.0, { dir: 1, T, lie: 1, yawn: 0.5 + 0.5 * Math.sin(T * 1.2), rope: [585, GY - 255] });
      F(g, T, 'bharataChild', 640, GY + 30, 0.86, { f: 'left', pose: { w: { point: 0.4, stand: 0.6 } }, L: EP51.lit(p, 640, GY, { front: 0.5 }), ex: { emo: 'joy', gaze: [0.8, 0] }, key: 'cl-b' }); g.restore(); });
    TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 110 });
    fin(ctx, T);
  };
  const CL = { dur: 5.5, b: [0.7, 2.1, 3.3, 4.6] };
  R.scene({ id: 'cliff', transition: { type: 'brush', dur: 0.5, angle: 0.15, color: '#d0f4c8' }, draw(ctx, t, env) { cliff(ctx, env.T, t, env, env.beats.length > 2 ? env.beats : CL.b); }, post: POST(0.3, 0.45) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, CL.dur + t, env, CL.b) });
})();
