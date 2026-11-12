/* Episode 44 · Ruru and Pramadvara (CE Adi 1.8.1–22, 1.9.1). One scene per line of script/ep44.en.json.
 * Loads after ep41/_common (EP41) and ep44/_common (EP44: the meadow, the night forest, the grey bed of flowers). Staging: the foot and the snake never touch or overlap; no wound is shown; the dead girl
 * lies as if asleep. EP44 exports the meadow, the night forest and the grey bed of flowers for episodes 45–46. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41;
  const { TAU, clamp, lerp, E, hash } = R;
  const GY = EP41.GY, HZ = EP41.HZ;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const names = (env, n) => [n, env.script.names[n]];
  const EP44 = window.EP44;

  const girl = (g, p, T, x, y, s, pose, ex, key, light) => CH.pramadvara.draw(g, { x, y, scale: s, facing: ex.facing || 'left', pose, light: light || ST.light(p, { from: [860, 300], at: [x, y], front: 0.6 }), expression: ex, t: T, key: key || 'pv' });

  // 1 · HOOK: three fragments in one moving shot: her step in the violet grass; a banded snake asleep across the path; the garland
  const dusk = (ctx, T, cam, figs, near) => EP44.meadow(ctx, T, cam, { pal: 'venom-violet', flowers: ['#e8d0ff', '#b890e8', '#f4ecff'], dust: 'dust', figs, near, nearSoft: 0.2 });
  const garland = (g, x, y, s = 1, a = 0) => { g.save(); g.translate(x, y); g.rotate(a); g.strokeStyle = '#ffe08a'; g.lineWidth = 10 * s; g.beginPath(); g.ellipse(0, 0, 80 * s, 30 * s, 0, 0.5, TAU - 0.5); g.stroke(); for (let i = 0; i < 9; i++) { const an = 0.5 + i * (TAU - 1) / 8; g.fillStyle = i % 2 ? '#ff8aa8' : '#fff0c0'; g.beginPath(); g.arc(80 * s * Math.cos(an), 30 * s * Math.sin(an), 13 * s, 0, TAU); g.fill(); } g.restore(); };
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 0.4, b1 = b[1] ?? 1.4, b2 = b[2] ?? 2.4, cam = CAM.drift(CAM.rack(clamp((t - b0) / (b1 - b0 + 0.2)), { from: 1.0, to: 1.0, zoom: 1.14, x: lerp(120, -90, E.inOutSine(clamp(t / 3))) }), T, 0.5);
      const d = 150 * E.outCubic(clamp(t / 1.2)), stir = Math.sin(Math.PI * clamp((t - b1) / 0.5));
      dusk(ctx, T, cam, (g, p) => {
        girl(g, p, T, 1010 - d, GY - 10, 1.0, ACT.pose(t, [[0, 'walk'], [1.2, 'attend', { act: 0.4 }]], { phase: ACT.stride(d, 0.97) }), { emo: 'tender', gaze: [0.3, -0.2] }, 'hk-p', ST.light(p, { from: [200, 300], at: [900, GY], front: 0.7, k: 1.2 }));
        CH.viper.draw(g, { x: 330, y: GY + 10, scale: 0.7, facing: 'left', pose: { name: 'strike', k: 0.1 * stir }, light: ST.light(p, { from: [200, 300], at: [330, GY], front: 0.9, k: 1.3 }), t: T, key: 'hk-v' });
        garland(g, 870 - d, GY - 600, 0.5 * E.outCubic(clamp((t - b2 + 0.2) / 0.4)), 0.3);
      });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, clamp(t / 0.2), line.text, { y: 1480, size: 80, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.15) / 0.6);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 1500, key: 'ep44-title' });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.28, vignette: 0.5, paper: 0.3 }) });

  // 2 · FAMILY: Ruru walking through a hermitage wood with his staff (feet planted)
  R.scene({ id: 'family', transition: { type: 'brush', dur: 0.5, angle: 0.25, color: '#d8ecc0' },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.3, d = 110 * t, cam = CAM.slide(t / env.dur, { from: 140, to: -140, zoom: 1.1 });
      EP41.hermitage(ctx, T, cam, { hutX: 1500, figs: (g, p) => CH.ruru.draw(g, { x: 740 - d, y: GY + 12, scale: 1.06, facing: 'left', pose: ACT.pose(t, [[0, 'walk']], { phase: ACT.stride(d, 1.06), prop: 'staff' }), light: ST.light(p, { from: [860, 400], at: [700, GY], front: 0.5 }), expression: { emo: 'calm', gaze: [0.5, 0] }, t: T, key: 'fm-r' }) });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 3.2) / 0.4)), env.strings, { y: 190 });
      TY.plaque(ctx, T, clamp((t - b0 - 0.2) / 0.6), ...names(env, 'Ruru'), { x: 270, y: 640, out: clamp((t - (env.dur - 0.35)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.26, vignette: 0.4, paper: 0.3 }) });

  // 3–4 · the river bank in pearl mist: the apsara leaves her new-born among the reeds; the old sage finds her
  const bank = (ctx, T, cam, figs) => ST.shot(ctx, T, { pal: 'riverbank-pearl', cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1000 }) },
    { z: 0.2, draw: (g, p) => ST.hills(g, p, { y: 1000, h: 300, seed: 9 }) },
    { z: 0.4, draw: (g, p) => { ST.treeline(g, p, { y: 1030, h: 420, T, seed: 8, kind: 'mixed' }); ST.water(g, p, { y0: 1030, y1: 1320, T, flow: 50 }); } },
    { z: 0.7, haze: false, draw: (g) => ST.mist(g, T, { y: 1080, h: 260, alpha: 0.5 }) },
    { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: 1300 }); figs(g, p); } },
    { z: 1.5, haze: false, draw: (g, p) => ST.grass(g, p, { y: 1500, h: 300, T, count: 30, color: p.near }) },
    { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => ST.grass(g, p, { y: 1960, h: 420, T, count: 40 }) },
  ] });
  const babe = (g, x, y, k = 1) => { KIT.glow(g, x, y, 240 * k, '#fff0c0', 0.8); KIT.glow(g, x, y, 90 * k, '#ffffff', 1); g.fillStyle = '#fff6e0'; g.beginPath(); g.ellipse(x, y, 46, 26, 0.1, 0, TAU); g.fill(); };
  R.scene({ id: 'left', transition: { type: 'lamp', dur: 0.8, from: [300, 800], to: [620, 1250] },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.4, b1 = env.beats[1] ?? 4.7, cam = CAM.tilt(E.inOutSine(clamp((t - b1 + 0.6) / 1.4)), { from: -120, to: 150, zoom: 1.12 });
      const rise = E.inOutSine(clamp((t - b1 + 0.4) / 1.6));
      bank(ctx, T, cam, (g, p) => {
        babe(g, 620, 1290, clamp((t - b0) / 0.4));
        g.save(); g.globalAlpha = 1;
        CH.menaka.draw(g, { x: 330, y: 1320 - 60 * rise, scale: 0.88, facing: 'right', pose: ACT.pose(t, [[0, 'carry'], [b0 - 0.3, 'kneel', { act: 0.5 }], [b1 - 0.5, 'stand', { act: 0.8 }]]), light: { ...ST.light(p, { from: [540, 100], at: [330, 1300], front: 0.35, k: 1.0 }) }, expression: { emo: 'sorrow', gaze: [0.6, 0.6] }, t: T, key: 'lf-m' });
        g.restore();
      });
      TY.plaque(ctx, T, clamp((t - b0 - 0.3) / 0.6), ...names(env, 'Menaka'), { x: 760, y: 420, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.4, paper: 0.3 }) });
  R.scene({ id: 'found', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.8, b1 = env.beats[1] ?? 2, cam = CAM.push(t / env.dur, { from: 1.08, to: 1.3, focus: [600, 1050] }), lift = E.inOutSine(clamp((t - b1) / 0.7));
      const d = 170 * E.outCubic(clamp(t / (b0 + 0.1)));
      bank(ctx, T, cam, (g, p) => {
        CH.sthulakesha.draw(g, { x: 960 - d, y: 1320, scale: 1.0, facing: 'left', pose: ACT.pose(t, [[0, 'walk'], [b0, 'kneel', { act: 0.5 }], [b1, 'carry', { act: 0.7 }]], { phase: ACT.stride(d, 1.0), prop: false }), light: ST.light(p, { from: [540, 100], at: [800, 1300], front: 0.7 }), expression: { emo: ACT.emo(t, [[0, 'calm'], [b0, 'wonder'], [b1, 'tender']]), gaze: [0.5, 0.7] }, t: T, key: 'fd-s' });
        babe(g, lerp(620, 700, lift), lerp(1290, 700, lift));
      });
      TY.plaque(ctx, T, clamp((t - 0.6) / 0.6), ...names(env, 'Sthulakesha'), { x: 340, y: 880, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.4, paper: 0.3 }) });

  // 5 · NAMED: the girl grown, turning among flowers; an orbit round her
  R.scene({ id: 'named', transition: { type: 'brush', dur: 0.5, angle: -0.2, color: '#f4f0c8' },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.2, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 150, zoom: 1.16 });
      EP44.meadow(ctx, T, cam, { sun: [820, 380, 60], figs: (g, p) => { const flip = t > b0;
        girl(g, p, T, 560, GY - 6, 1.12, ACT.pose(t, [[0, 'reach'], [b0 - 0.15, 'attend', { act: 0.4 }], [b0 + 0.9, 'offer', { act: 0.6 }]], { wind: 0.8 }), { emo: 'joy', facing: flip ? 'right' : 'left', ...ACT.lead(t, [[0, [0.3, -0.3]], [b0 + 0.2, [0.7, 0]]]) }, 'nm-p');
        garland(g, flip ? 700 : 420, GY - 700, 0.6, 0.2 * Math.sin(T * 2)); } });
      TY.plaque(ctx, T, clamp((t - b0) / 0.6), ...names(env, 'Pramadvara'), { x: 310, y: 700, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.38, paper: 0.3 }) });

  // 6 · LOVED (the close-up): Ruru's face between two trunks: calm, wonder, a small smile; his gaze follows her; the shot holds
  R.scene({ id: 'loved', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1, b1 = env.beats[1] ?? 2.6, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.1, focus: [520, 760] });
      ST.shot(ctx, T, { pal: 'riverbank-pearl', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500 }) },
        { z: 0.3, soft: 0.45, draw: (g, p) => ST.treeline(g, p, { y: 1500, h: 1400, gap: 440, T, seed: 19, kind: 'mixed' }) },
        { z: 0.8, haze: false, draw: (g) => ST.shafts(g, T, { x: 700, angle: -0.35, alpha: 0.14 }) },
        { z: 1, haze: false, draw: (g, p) => CH.ruru.draw(g, { x: 430, y: 3080, scale: 2.5, facing: 'right', pose: ACT.pose(t, [[0, 'stand']], { prop: false }), light: ST.light(p, { from: [960, 300], at: [520, 1200], k: 1.1, front: 0.75 }),
          expression: { emo: ACT.emo(t, [[0, 'calm'], [b0 - 0.2, 'wonder', { dur: 0.4 }], [b1, 'joy', { dur: 0.6 }]]), ...ACT.lead(t, [[0, [0.2, 0.3]], [b0 - 0.3, [0.9, -0.1]], [b1, [0.6, 0.1]], [b1 + 0.9, [0.95, 0]]], 0.4, 0.1) }, t: T, key: 'lv-r' }) },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'pollen', count: 26, cam }) },
        { z: 2.0, haze: false, soft: 0.5, draw: (g, p) => ST.trunks(g, p, { xs: [-120, 1180], w: 260 }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.24, vignette: 0.42, paper: 0.3 }) });

  // 7 · PLAY: the meadow, a crane down: three girls running; a ball of flowers thrown; low in the path, a small dark coil
  R.scene({ id: 'play', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.8, cam = CAM.crane(t / env.dur, { from: 0.94, to: 1.14, y0: -260, y1: 60 }), d = 150 * t;
      const bu = clamp((t - b0) / 1.3), bx = lerp(900, 200, bu), by = GY - 700 - 500 * Math.sin(Math.PI * bu);
      EP44.meadow(ctx, T, cam, { sun: [820, 380, 60], figs: (g, p) => {
        CH.viper.draw(g, { x: 330, y: GY - 150, scale: 0.34, facing: 'left', pose: { name: 'strike', k: 0 }, light: ST.light(p, { from: [860, 300], at: [150, GY], front: 0.8 }), t: T, key: 'pl-v' });
        CH.girika.draw(g, { x: 1040 - d * 0.12, y: GY - 60, scale: 0.64, facing: 'left', pose: ACT.pose(t, [[0, 'run']], { phase: ACT.stride(d * 0.22, 0.72), stride: 0.6, wind: 1 }), light: ST.light(p, { from: [860, 300], at: [900, GY], front: 0.6 }), expression: { emo: 'joy' }, t: T, key: 'pl-1' });
        CH.panchali.draw(g, { x: 40 + d * 0.1, y: GY - 80, scale: 0.62, facing: 'right', pose: ACT.pose(t, [[0, 'run']], { phase: ACT.stride(d * 0.2, 0.68), stride: 0.6, wind: 1 }), light: ST.light(p, { from: [860, 300], at: [300, GY], front: 0.6 }), expression: { emo: 'joy' }, t: T, key: 'pl-2' });
        girl(g, p, T, 600 - d * 0.1, GY + 20, 0.8, ACT.pose(t, [[0, 'run']], { phase: ACT.stride(d * 0.18, 0.86), stride: 0.6, wind: 1 }), { emo: 'joy' }, 'pl-p');
        if (bu > 0 && bu < 1) { g.fillStyle = '#ff8aa8'; g.beginPath(); g.arc(bx, by, 26, 0, TAU); g.fill(); g.fillStyle = '#fff0c0'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(bx + 20 * Math.cos(i * 1.26 + T * 6), by + 20 * Math.sin(i * 1.26 + T * 6), 9, 0, TAU); g.fill(); } }
      } });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.38, paper: 0.3 }) });

  // 8 · SNAKE (the turn, after a silence; the signature shot): through a dark arch of grass, her step coming down in the middle
  //     distance; the sleeping snake near, a clear stretch of ground between them (they never touch or overlap)
  const stepIn = (c2, T, t, b0, b1) => { const d = 210 * E.inOutSine(clamp(t / (b1 + 0.2)));
    dusk(c2, T, CAM.still({ zoom: 0.9, y: 100 }), (g, p) => {
      girl(g, p, T, 1040 - d, GY - 30, 0.9, ACT.pose(t, [[0, 'walk'], [b1 + 0.15, 'attend', { act: 0.3 }]], { phase: ACT.stride(d, 0.87), stride: 0.8 }), { emo: 'joy', gaze: [0.2, -0.6], look: -0.08 }, 'sn-p', ST.light(p, { from: [200, 300], at: [900, GY], front: 0.75, k: 1.2 }));
      CH.viper.draw(g, { x: 330, y: GY + 60, scale: 0.9, facing: 'left', pose: { name: 'strike', k: 0.14 * Math.sin(Math.PI * clamp((t - b1) / 0.6)) }, light: ST.light(p, { from: [200, 300], at: [330, GY], front: 0.9, k: 1.3 }), t: T, key: 'sn-v' });
    }); };
  R.scene({ id: 'snake', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 2.2, b1 = env.beats[1] ?? 3.7;
      ST.within(ctx, T, { shape: 'arch', pal: 'venom-violet', box: [110, 250, 860, 1180], open: 1, draw: (c2) => stepIn(c2, T, t, b0, b1) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.26, vignette: 0.5, paper: 0.3 }) });

  // 9 · BIT: one flash of the strike (two frames of green on black; no wound); the garland falls; a tilt down with it
  R.scene({ id: 'bit',
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.5, b1 = env.beats[1] ?? 2.2, k = clamp((t - b0 - 0.1) / (b1 - b0 - 0.1)), cam = CAM.tilt(E.inOutSine(k), { from: -330, to: 140, zoom: 1.2 });
      const y = lerp(GY - 1100, GY - 20, k * k), land = clamp((t - b1) / 0.3);
      dusk(ctx, T, cam, (g) => { garland(g, 560 + 40 * Math.sin(k * 5), y, 1.3, k < 1 ? k * 4 : 0.2);
        if (land > 0 && land < 1) { g.fillStyle = '#f4ecff'; for (let i = 0; i < 12; i++) { g.globalAlpha = 1 - land; g.beginPath(); g.arc(560 + (i - 6) * 40 * land * 2, GY - 30 - 120 * Math.sin(Math.PI * land) * hash(i, 3), 9, 0, TAU); g.fill(); } g.globalAlpha = 1; } });
      const fl = t - b0; if (fl >= -0.034 && fl < 0.068) { ctx.fillStyle = '#050805'; ctx.fillRect(0, 0, R.W, R.H); ctx.save(); ctx.strokeStyle = '#7dff5a'; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(200, 1100); ctx.quadraticCurveTo(520, 640, 900, 820); ctx.stroke(); ctx.restore(); }
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.5, paper: 0.3 }) });

  // 10 · LAY (a second silence before it): the colour drains: she lies dead, as if asleep, among fallen flowers; a slow push
  const greyBed = EP44.greyBed;
  R.scene({ id: 'lay', transition: { type: 'ink', dur: 0.8, at: [560, 1100], color: '#8a8a90' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.22, focus: [300, 1120] });
      greyBed(ctx, T, cam, clamp(t / 2.2));
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.2, vignette: 0.5, paper: 0.32 }) });

  // 11 · WEPT: the forest at night, one lamp: a pull back to the circle of seated sages, heads bowed; Ruru apart, at the edge of the light
  R.scene({ id: 'wept', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.6, cam = CAM.pull(clamp(t / env.dur), { from: 1.5, to: 1.02, focus: [470, 1150] }), fl = KIT.flicker(T, 5);
      EP44.night(ctx, T, cam, { figs: (g, p) => {
        KIT.glow(g, 470, GY - 240, 620, '#ffd27a', 0.4 * fl); g.fillStyle = '#ffe08a'; g.beginPath(); g.ellipse(470, GY - 190, 12, 26, 0, 0, TAU); g.fill(); g.fillStyle = '#3a2418'; g.fillRect(455, GY - 166, 30, 150);
        const L = (x) => ({ dir: Math.atan2(-100, 470 - x), intensity: 1.2 * fl, front: 0.5, fill: 0.2 });
        [[150, 'right'], [330, 'right'], [640, 'left']].forEach(([x, f], i) => CH.sage.draw(g, { x, y: GY + 30, scale: 0.8, facing: f, pose: { name: 'sit', lean: 0.2 * E.outCubic(clamp((t - b0 + 0.3) / 0.6)) }, light: L(x), t: T, key: 'wp-' + i }));
        CH.ruru.draw(g, { x: 930, y: GY + 16, scale: 1.0, facing: 'left', pose: ACT.pose(t, [[0, 'stand'], [b0, 'grieve', { act: 0.8 }]], { prop: false }), light: { ...ST.light(p, { from: [470, 1100], at: [930, GY], front: 0.5, k: 1.2 }), tint: ['#ffd27a', 0.4] }, expression: { emo: 'sorrow', gaze: [0.2, 0.8] }, t: T, key: 'wp-r' });
      } });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.55, paper: 0.3 }) });

  // 12 · CLIFF: Ruru among black trunks, his head thrown back; on "answered" a shaft of pale gold comes down through the canopy
  const cliff = (ctx, T, t, env, b) => {
    const d = 160 * E.outCubic(clamp(t / 2.4)), cam = CAM.slide(clamp(t / 7.5), { from: 120, to: -100, zoom: 1.12 }), ans = E.outCubic(clamp((t - b[2]) / 0.7));
    EP44.night(ctx, T, cam, { trunks: [-260, 420, 1340], far: (g) => { if (ans > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5 * ans; g.fillStyle = '#ffe9b0'; g.beginPath(); g.moveTo(560, -500); g.lineTo(820, -500); g.lineTo(900, 1500); g.lineTo(520, 1500); g.closePath(); g.fill(); g.restore(); KIT.glow(g, 700, 300, 700 * ans, '#ffe9b0', 0.5 * ans); } },
      figs: (g, p) => CH.ruru.draw(g, { x: 880 - d, y: GY + 16, scale: 1.08, facing: 'left', pose: ACT.pose(t, [[0, 'walk'], [2.2, 'stand', { act: 0.4 }], [b[1] - 0.5, 'grieve', { act: 0.6 }], [b[2] - 0.1, 'recoil', { act: 0.5 }]], { phase: ACT.stride(d, 1.08), prop: false }),
        light: { ...ST.light(p, { from: [700, 100], at: [720, GY], front: 0.45 + 0.4 * ans, k: 1.2 }), tint: ['#ffe9b0', 0.5 * ans] }, expression: { emo: ACT.emo(t, [[0, 'sorrow'], [b[2], 'wonder']]), speak: t > b[1] - 0.6 && t < b[1] + 0.2 ? 1 : 0, ...ACT.lead(t, [[0, [0.3, 0.6]], [b[1] - 0.6, [0.2, -1]], [b[2], [-0.3, -1]]], 0.4, 0.3) }, t: T, key: 'cl-r' }) });
    TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 110 });
    fin(ctx, T);
  };
  const CL = { dur: 7.53, b: [0.6, 3.49, 6.21] };
  R.scene({ id: 'cliff', transition: { type: 'dissolve', dur: 0.3 }, draw(ctx, t, env) { cliff(ctx, env.T, t, env, env.beats.length > 2 ? env.beats : CL.b); }, post: () => ({ bloom: 0.34, vignette: 0.55, paper: 0.3 }) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, CL.dur + t, env, CL.b) });
})();
