/* Episode 54 · The Girl the Birds Protected (CE Adi 1.65.12–66.17, 1.67.1). One scene per line of script/ep54.en.json.
 * Loads after ep41/_common, ep44/_common, ep46/_common, ep49/_common, ep51/_common.
 * The tale is Shakuntala's own, at second hand. The new-born is a swaddled infant (EP49.infant), never a standing child.
 * Menaka and the ascetic are never drawn touching. The birds stand round the child and guard her (the text says no more). */
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
  EP51.GROUND = { 'tp-v': 'pit', 'fd-k': 'glow' };
  const KINDS = ['heron', 'parrot', 'goose', 'peacock', 'small', 'goose', 'heron', 'parrot', 'small', 'goose', 'parrot', 'heron'];
  // a ring of birds standing wing to wing round (x, y); k = how complete the ring is (0..1); open = a gap toward +x (0..1)
  const birdRing = (g, T, x, y, rx, ry, s, k = 1, open = 0) => { const n = 12; for (let pass = 0; pass < 2; pass++) for (let i = 0; i < n; i++) { const a = (i / n) * TAU + 0.26, back = Math.sin(a) < 0; if ((pass === 0) !== back) continue; if (i / n > k) continue; if (open && Math.cos(a) > 1 - open * 1.2) continue;
    EP51.bird(g, KINDS[i], x + Math.cos(a) * rx, y + Math.sin(a) * ry, s * (0.85 + 0.25 * (Math.sin(a) + 1) / 2), { dir: Math.cos(a) > 0 ? -1 : 1, T }); } };
  const yard = (ctx, T, cam, pal, figs) => EP51.wood(ctx, T, cam, pal, { seed: 120, huts: [[820, 1.5, 0.2]], shaftX: 300, shaftA: 0.35, figs, dust: 'pollen' });
  const king = (g, p, T, x, y, s, o = {}) => F(g, T, 'dushyantaPlain', x, y, s, { f: 'right', pose: o.pose || { w: { sit: 0.8, attend: 0.2 } }, L: EP51.lit(p, x, y, { front: 0.35 }), ex: o.ex || { emo: 'wonder', gaze: [0.9, -0.2] }, key: o.key || 'kg' });
  const girl = (g, p, T, x, y, s, o = {}) => F(g, T, 'shakuntala', x, y, s, { f: 'left', pose: o.pose || 'attend', L: o.L || EP51.lit(p, x, y, { front: 0.4 }), ex: o.ex || { emo: 'tender' }, key: o.key || 'gl' });
  const bank = (ctx, T, cam, pal, figs, o = {}) => EP51.land(ctx, T, cam, pal, { sun: o.sun, hz: 800, water: [830, 990], gy: 980, dust: 'pollen', seed: 150, treeH: 480, figs, near: o.near, sky: o.sky, grassH: 260 });

  // 1 · HOOK: from above, a river bank: a tiny bundle on the grass, ringed by a great wheel of birds; a crane down toward it
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.crane(E.outCubic(clamp(t / 3.2)), { from: 1.0, to: 1.4, y0: -200, y1: 200 }), T, 0.5);
      bank(ctx, T, cam, 'riverbank-pearl', (g) => { birdRing(g, T, 540, 1260, 270, 95, 0.6); EP49.infant(g, 560, 1260, 1.0, 0.8); for (let i = 0; i < 5; i++) EP51.bird(g, KINDS[i + 2], 200 + i * 170, 700 - 90 * i + 160 * clamp(t / 3) * (1 + i * 0.2), 0.8, { fly: 1, T, dir: i % 2 ? 1 : -1 }); }, { sun: [820, 380, 70] });
      EP51.hook(ctx, T, t, env, { y: 430, ty: 440, size: 70 });
      fin(ctx, T);
    },
    post: POST(0.32, 0.42) });

  // 2 · ASKED: the hermitage yard: the king seated on a grass seat, the girl standing three paces off with a water jar
  R.scene({ id: 'asked', transition: { type: 'brush', dur: 0.5, angle: 0.2, color: '#f4fbd0' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.slide(t / env.dur, { from: -90, to: 90, zoom: 1.1 });
      yard(ctx, T, cam, 'meadow-spring', (g, p) => { king(g, p, T, 260, GY + 10, 0.8, { key: 'ak-k' }); girl(g, p, T, 700, GY, 0.76, { ex: { emo: 'tender', gaze: [0.8, 0.1] }, key: 'ak-g' }); });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.6) / 0.4)), env.strings, { y: 190 });
      TY.plaque(ctx, T, clamp((t - 0.9) / 0.5), ...names(env, 'Dushyanta'), { x: 270, y: 470, size: 40, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.3, 0.42) });

  // 3 · SAID (the close-up): her face: a smile, then the look turns inward and grave as she begins
  R.scene({ id: 'said', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 2.6, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.1, focus: [540, 780] });
      EP51.wood(ctx, T, cam, 'meadow-spring', { seed: 120, trunks: false, figs: (g, p) => {
        F(g, T, 'shakuntala', 640, 2960, 2.5, { f: 'left', pose: 'stand', L: ST.light(p, { from: [200, 200], at: [600, 1200], k: 1.0, front: 0.4 }), ex: { emo: ACT.emo(t, [[0, 'joy'], [b1 - 0.5, 'resolve', { dur: 0.6 }]]), speak: talk(env, t), ...ACT.lead(t, [[0, [0.8, 0]], [b1 - 0.4, [0.4, 0.6]]], 0.4, 0.2) }, key: 'sd-g' });
        const gr = g.createLinearGradient(0, 1060, 0, 1560); gr.addColorStop(0, 'rgba(20,40,10,0)'); gr.addColorStop(0.5, 'rgba(20,40,10,0.85)'); gr.addColorStop(1, 'rgba(20,40,10,0.96)'); g.fillStyle = gr; g.fillRect(-900, 1060, 2880, 1800); } });
      fin(ctx, T);
    },
    post: POST(0.3, 0.42) });

  // 4 · TAPAS: a tilt up: a gaunt ascetic motionless, arms raised, heat shimmering off him; above, a crowned god grips his seat
  R.scene({ id: 'tapas', transition: { type: 'ink', dur: 0.6, at: [540, 1100], color: '#2a140c' },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.8, cam = CAM.tilt(E.inOutSine(clamp((t - 0.8) / 2.6)), { from: 200, to: -230, zoom: 1.12 });
      EP51.void(ctx, T, cam, 'dharma-copper', { gy: 1300, glow: [540, 900, 800, '#ff9a40', 0.3 + 0.1 * Math.sin(T * 5)],
        back: (g, p) => { ST.hills(g, p, { y: 1320, h: 300, seed: 161, peaks: 0.5 }); EP51.clouds(g, T, 380, 5, '#5a3a40', 0.95, 6, 61, 1.4); CH.indra.draw(g, { x: 560, y: 330, scale: 0.5, facing: 'left', pose: { name: 'sit' }, light: { dir: Math.PI / 2, intensity: 1.2, front: 0.8, fill: 0.5, tint: ['#ffb070', 0.5] }, t: T, key: 'tp-i' }); },
        figs: (g, p) => { for (let i = 0; i < 6; i++) { g.strokeStyle = 'rgba(255,170,80,0.35)'; g.lineWidth = 6; g.beginPath(); const x = 400 + i * 56; g.moveTo(x, 700); g.bezierCurveTo(x + 30 * Math.sin(T * 3 + i), 520, x - 30 * Math.sin(T * 3 + i), 360, x + 10, 160); g.stroke(); }
          F(g, T, 'vishvamitra', 540, 1310, 0.86, { f: 'left', pose: { w: { raise: 0.8, stand: 0.2 }, prop: false }, L: { dir: -Math.PI / 2 - 0.4, intensity: 1.4, front: 0.95, fill: 0.6, tint: ['#ffe0b0', 0.4], minLum: 0.5 }, ex: { emo: 'resolve', gaze: [0.2, -0.8] }, key: 'tp-v' }); },
        dust: 'ember', dustN: 30 });
      TY.plaque(ctx, T, clamp((t - 0.6) / 0.5), ...names(env, 'Vishvamitra'), { x: 220, y: 880, size: 38, out: clamp((t - b0 - 0.6) / 0.3) });
      TY.plaque(ctx, T, clamp((t - b0 - 0.8) / 0.5), ...names(env, 'Indra'), { x: 830, y: 300, size: 46, out: out(t, env, 0.3) });
      fin(ctx, T);
    },
    post: POST(0.4, 0.5) });

  // 5 · SENT: Indra's bright court: Menaka before the throne; she hesitates, then steps off the cloud's edge, scarves in the wind
  R.scene({ id: 'sent', transition: { type: 'lamp', dur: 0.7, from: [540, 300], to: [300, 500] },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 2.4, b2 = b[2] ?? 3.7, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 110, zoom: 1.12 }), go = E.inOutSine(clamp((t - b2 + 0.6) / 1.2));
      EP51.heaven(ctx, T, cam, 'crystal-sky', { sun: [820, 300, 90], floor: GY + 30, figs: (g, p) => {
        CH.indra.draw(g, { x: 230, y: GY - 10, scale: 0.86, facing: 'right', pose: { name: 'speak', k: clamp(1 - (t - b1) / 0.8) }, light: { dir: -Math.PI / 2 + 0.4, intensity: 1.3, front: 0.9, fill: 0.6 }, t: T, key: 'sn-i' });
        const x = 700 + 150 * go, y = GY + 20 + 70 * go;
        for (let i = 0; i < 3; i++) { g.strokeStyle = ['#e8fbff', '#b8f0f0', '#ffffff'][i]; g.lineWidth = 16 - i * 3; g.globalAlpha = 0.9 * go; g.beginPath(); g.moveTo(x - 40, y - 560 + i * 60); g.bezierCurveTo(x - 220, y - 640 + 40 * Math.sin(T * 3 + i), x - 360, y - 500 + 60 * Math.sin(T * 2.4 + i), x - 520, y - 600 + i * 70); g.stroke(); } g.globalAlpha = 1;
        F(g, T, 'menaka', x, y, 0.82, { f: go > 0.3 ? 'right' : 'left', pose: ACT.pose(t, [[0, 'anjali'], [b1 - 0.5, 'recoil', { act: 0.4 }], [b2 - 0.5, 'walk', { act: 0.5 }]], { phase: T * 3 }), L: EP51.bright('#b0e0e8', 0.8), ex: { emo: ACT.emo(t, [[0, 'calm'], [b1 - 0.5, 'fear'], [b2 - 0.3, 'resolve']]), gaze: [0.7, 0] }, key: 'sn-m' }); } });
      TY.plaque(ctx, T, clamp((t - (b[0] ?? 0.9) + 0.2) / 0.5), ...names(env, 'Menaka'), { x: 760, y: 300, size: 46, out: out(t, env, 0.3) });
      TY.tag(ctx, T, clamp((t - b1) / 0.4), 'the finest of the apsarases', { x: 720, y: 470, size: 42, out: out(t, env, 0.3) });
      fin(ctx, T);
    },
    post: POST(0.4, 0.38) });

  // 6 · SAW: a rack focus from blowing leaves and her scarf in the foreground to the ascetic, far, whose arms come down
  R.scene({ id: 'saw', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.9, cam = CAM.rack(E.inOutSine(clamp((t - 0.2) / 1.0)), { from: 1.4, to: 1, zoom: 1.1 });
      EP51.wood(ctx, T, cam, 'hermitage-green', { seed: 165, trunks: [-260, 1340], dust: 'petal',
        figs: (g, p) => { KIT.glow(g, 300, GY - 520, 420, '#fff4c0', 0.3); g.fillStyle = 'rgba(10,40,20,0.5)'; g.beginPath(); g.ellipse(800, GY - 420, 230, 520, 0, 0, TAU); g.fill();
          F(g, T, 'vishvamitra', 300, GY - 40, 0.86, { f: 'right', pose: ACT.pose(t, [[0, 'raise'], [b0, 'attend', { act: 0.7 }]], { prop: false }), L: EP51.bright('#fff0d0', 1.45), ex: { emo: ACT.emo(t, [[0, 'resolve'], [b0 + 0.3, 'wonder']]), ...ACT.lead(t, [[0, [0.2, -0.8]], [b0, [0.9, 0]]], 0.4, 0.2) }, key: 'sw-v' });
          F(g, T, 'menaka', 790, GY - 40, 0.82, { f: 'left', pose: ACT.pose(t, [[0, 'stand'], [b0 + 0.6, 'anjali', { act: 0.6 }]]), L: EP51.bright('#f4ffff', 1.35), ex: { emo: ACT.emo(t, [[0, 'fear'], [b0 + 0.8, 'tender']]), gaze: [0.8, 0] }, key: 'sw-m' }); },
        near: (g) => { for (let i = 0; i < 3; i++) { g.strokeStyle = ['#e8fbff', '#b8f0f0', '#ffffff'][i]; g.lineWidth = 46 - i * 10; g.beginPath(); g.moveTo(1200, 1500 + i * 80); g.bezierCurveTo(1000, 1420 + 60 * Math.sin(T * 3 + i), 860, 1640 + 60 * Math.sin(T * 2.2 + i), 660, 1540 + i * 90); g.stroke(); } } });
      fin(ctx, T);
    },
    post: POST(0.3, 0.45) });

  // 7 · LEFT (the turn): Menaka kneels and lays a swaddled new-born on the grass by the water; she rises into the pale sky
  R.scene({ id: 'left', transition: { type: 'dissolve', dur: 0.45 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 3.4, b2 = b[2] ?? 5.1, b3 = b[3] ?? 6.6, up = E.inCubic(clamp((t - b2) / 2.2)), cam = CAM.tilt(E.inOutSine(clamp((t - b2) / 2.2)), { from: 60, to: -260, zoom: 1.12 });
      bank(ctx, T, cam, 'riverbank-pearl', (g, p) => {
        EP49.infant(g, 470, 1120, 1.1, 0.5 * clamp((t - 1.2) / 0.6));
        KIT.glow(g, 620, 800 - 800 * up, 300, '#d8fbff', 0.5 * up);
        F(g, T, 'menaka', 640, 1140 - 900 * up, 0.8 * (1 - 0.6 * up), { f: 'left', pose: ACT.pose(t, [[0, { kneel: 0.8, offer: 0.2 }], [b1 - 0.6, 'stand', { act: 0.6 }]]), L: EP51.bright('#f4ffff', 1.3), ex: { emo: 'sorrow', gaze: [0.3, up > 0 ? -0.8 : 0.7] }, key: 'lf-m' }); }, { sun: [540, 260, 70] });
      TY.plaque(ctx, T, clamp((t - 0.7) / 0.5), ...names(env, 'Malini'), { x: 300, y: 300, size: 44, out: clamp((t - b1 + 0.4) / 0.3) });
      TY.turnWord(ctx, T, clamp((t - b3 + 0.3) / 0.6), 'Alone', { x: 290, y: 760, size: 96, out: out(t, env, 0.3), sub: 'Adi 1.66.9' });
      fin(ctx, T);
    },
    post: POST(0.34, 0.42) });

  // 8 · BIRDS (the signature shot): through dark leaves: a tiger's shoulder and two pairs of eyes in the shade; beyond, in a
  //     pool of last light, the infant ringed by birds standing wing to wing, more dropping in from above
  R.scene({ id: 'birds', transition: { type: 'smoke', dur: 0.7, dir: Math.PI, color: '#24103a' },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 2.4, k = clamp(0.35 + (t - b1 + 0.8) / 1.6), cam = CAM.push(t / env.dur, { from: 1.0, to: 1.12, focus: [540, 1000] });
      ST.within(ctx, T, { shape: 'leaves', pal: 'venom-violet', box: [90, 300, 900, 1000], open: 1, draw: (g) => {
        EP51.wood(g, T, cam, 'venom-violet', { seed: 171, trunks: false, shafts: false, dust: 'firefly', figs: (gg) => {
          KIT.glow(gg, 540, 1000, 620, '#fff0c0', 0.5); gg.fillStyle = 'rgba(255,236,190,0.5)'; gg.beginPath(); gg.ellipse(540, 1080, 430, 130, 0, 0, TAU); gg.fill();
          birdRing(gg, T, 540, 1060, 290, 95, 0.75, k); EP49.infant(gg, 560, 1060, 1.0, 0.7);
          for (let i = 0; i < 4; i++) { const u = clamp((t - b1 - i * 0.5) / 1.2); if (u > 0 && u < 1) EP51.bird(gg, KINDS[i + 5], 300 + i * 160, 400 + 560 * u, 0.8, { fly: 1 - u * 0.5, T, dir: i % 2 ? 1 : -1 }); } } }); } });
      // the beasts in the foreground shade (outside the opening): a tiger's shoulder, low eyes
      ctx.save(); EP51.beast(ctx, 'tiger', 130, 1700, 1.5, { dir: 1, T, cols: ['#1a0c06', '#7a4410', '#0a0604'], eye: '#ffe060' }); EP51.beast(ctx, 'lion', 1010, 1560, 1.2, { dir: -1, T, lie: 1, cols: ['#1a1006', '#6a4a1c', '#3a2408'], eye: '#ffe060' }); ctx.restore();
      fin(ctx, T);
    },
    post: POST(0.36, 0.5) });

  // 9 · FOUND: morning: an old sage with a water-pot, come to bathe, stops; the birds part; he kneels and lifts the infant
  R.scene({ id: 'found', transition: { type: 'brush', dur: 0.5, angle: 0.2, color: '#fff0c8' },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 2.0, b2 = b[2] ?? 3.9, cam = CAM.push(t / env.dur, { from: 1.04, to: 1.2, focus: [560, 900] }), come = 200 * E.outCubic(clamp(t / 1.6)), lift = E.inOutSine(clamp((t - b1 - 0.2) / 1.0));
      bank(ctx, T, cam, 'island-gold', (g, p) => {
        birdRing(g, T, 620, 1120, 290, 95, 0.75, 1, clamp(t / 1.4));
        F(g, T, 'kanva', 130 + come, 1130, 0.8, { f: 'right', pose: ACT.pose(t, [[0, 'walk'], [1.5, 'kneel', { act: 0.5 }], [b1 + 0.9, 'carry', { act: 0.6 }]], { phase: ACT.stride(come, 0.82), prop: t > 1.3 ? false : 'pot' }), L: EP51.lit(p, 330, 1130, { from: [820, 300], front: 0.4 }), ex: { emo: ACT.emo(t, [[0, 'calm'], [1.2, 'wonder'], [b2 - 0.4, 'tender']]), gaze: [0.6, 0.5] }, key: 'fd-k' });
        EP49.infant(g, lerp(620, 430, lift), lerp(1120, 700, lift), 1.1, 0.7); }, { sun: [820, 360, 80] });
      TY.plaque(ctx, T, clamp((t - 0.6) / 0.5), ...names(env, 'Kanva'), { x: 760, y: 320, size: 50, out: out(t, env, 0.3) });
      fin(ctx, T);
    },
    post: POST(0.36, 0.42) });

  // 10 · NAME (a second silence): the yard again: she lifts a hand and a small bird alights on it; others on the thatch
  R.scene({ id: 'name', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 2.4, b2 = b[2] ?? 4.5, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 100, zoom: 1.16 }), land = E.outCubic(clamp((t - b1 + 0.9) / 0.9));
      yard(ctx, T, cam, 'meadow-spring', (g, p) => {
        for (let i = 0; i < 4; i++) EP51.bird(g, KINDS[i + 1], 640 + i * 110, HZ - 360 - 30 * (i % 2), 0.6, { T, dir: i % 2 ? 1 : -1 });
        girl(g, p, T, 520, GY + 10, 0.9, { pose: ACT.pose(t, [[0, 'speak'], [b1 - 1.0, 'bless', { act: 0.5 }]]), ex: { emo: ACT.emo(t, [[0, 'tender'], [b2 - 0.4, 'joy']]), speak: talk(env, t), gaze: [0.5, -0.4] }, key: 'nm-g' });
        EP51.bird(g, 'small', lerp(120, 325, land), lerp(300, 610, land), 0.9, { fly: 1 - land, T, dir: 1 }); });
      TY.plaque(ctx, T, clamp((t - b2 + 0.2) / 0.5), ...names(env, 'Shakuntala'), { x: 800, y: 420, size: 50, out: out(t, env, 0.3) });
      fin(ctx, T);
    },
    post: POST(0.34, 0.4) });

  // 11 · CLIFF: the light gone to late coral: the king rises from the grass seat, a hand held out; she has gone very still
  const cliff = (ctx, T, t, env, b) => {
    const cam = CAM.drift(CAM.push(clamp(t / 5.6), { from: 1.04, to: 1.2, focus: [480, 900] }), T, 1.4);
    yard(ctx, T, cam, 'fishers-coral', (g, p) => {
      F(g, T, 'dushyantaPlain', 260, GY + 10, 0.84, { f: 'right', pose: ACT.pose(t, [[0, { sit: 0.8, attend: 0.2 }], [b[1] - 0.6, 'stand', { act: 0.5 }], [b[2] - 0.5, 'offer', { act: 0.5 }]]), L: EP51.bright('#ffe8d0', 1.5), ex: { emo: 'resolve', gaze: [0.9, 0] }, key: 'cl-k' });
      girl(g, p, T, 720, GY, 0.78, { pose: ACT.pose(t, [[0, 'attend'], [b[2], 'recoil', { act: 0.3, dur: 0.5 }]]), ex: { emo: ACT.emo(t, [[0, 'tender'], [b[2], 'shock']]), gaze: [0.8, 0] }, key: 'cl-g', L: EP51.bright('#ffe8d0', 1.5) });
      const fl = clamp((t - b[2]) / 0.8); EP51.bird(g, 'small', 880 + 300 * fl, 640 - 400 * fl, 0.9, { fly: fl > 0 ? 1 : 0, T, dir: 1 }); });
    TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 110 });
    fin(ctx, T);
  };
  const CL = { dur: 4.44, b: [0.8, 2.4, 3.6] };
  R.scene({ id: 'cliff', transition: { type: 'dissolve', dur: 0.4 }, draw(ctx, t, env) { cliff(ctx, env.T, t, env, env.beats.length > 2 ? env.beats : CL.b); }, post: POST(0.32, 0.45) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, CL.dur + t, env, CL.b) });
})();
