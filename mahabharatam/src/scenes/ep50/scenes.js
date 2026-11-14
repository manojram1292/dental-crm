/* Episode 50 · Born on an Island (CE Adi 1.57.54–75, 1.54.3, 1.58.1–2). One scene per line of script/ep50.en.json.
 * Loads after ep41/_common, ep46/_common, ep47/_common (EP47.island) and ep49/_common (EP49.river, boat, infant).
 * RESTRAINT: the scene is told through mist, river and faces. Parashara and Satyavati sit a full boat-length apart and are
 * never drawn touching or overlapping; the mist closes before anything else; she is a grown young woman; her agreement is
 * the text's own (1.57.66) and is voiced. The new-born is a swaddled infant. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41, EP46 = window.EP46, EP47 = window.EP47, EP49 = window.EP49;
  const { TAU, clamp, lerp, E, hash } = R;
  const GY = EP41.GY, HZ = EP41.HZ;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const names = (env, n) => [n, env.script.names[n]];
  const talk = (env, t) => EP41.mouth(env, t);
  const BY = 1130;   // the boat's water line
  // the two in the boat: she in the stern with the oar (right), he seated in the bow (left): a boat-length between them
  const crew = (g, p, T, t, o = {}) => { g.fillStyle = 'rgba(20,12,8,0.9)'; g.beginPath(); g.ellipse(-60, BY + 30, 200, 60, 0, 0, TAU); g.fill(); EP49.boat(g, 500, BY, 0.9);
    if (o.sage !== false) CH.parashara.draw(g, { x: o.sageX ?? 250, y: BY - 30, scale: 0.56, facing: 'right', pose: o.sagePose || { w: { sit: 1 }, prop: 'staff' }, light: o.sageL || ST.light(p, { from: [820, 300], at: [230, BY], front: o.front ?? 0.25 }), expression: o.sageEx || { emo: 'calm', gaze: [0.8, 0] }, t: T, key: 'cr-p' });
    CH.satyavati.draw(g, { x: 770, y: BY - 30, scale: 0.58, facing: 'left', pose: o.girlPose || ACT.pose(t, [[0, 'row']], { prop: 'oar', phase: T * 1.6 }), light: o.girlL || ST.light(p, { from: [820, 300], at: [900, BY], front: o.front ?? 0.25 }), expression: o.girlEx || { emo: 'calm', gaze: [0.6, 0.1] }, t: T, key: 'cr-s' }); };
  const watchers = (g, p, y) => { for (const sg of [-1, 1]) for (let i = 0; i < 4; i++) { const x = 540 + sg * (330 + i * 70); g.fillStyle = KIT.hex(p.near, '#000000', 0.4); g.beginPath(); g.ellipse(x, y - 22, 20, 26, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(x, y - 58, 12, 0, TAU); g.fill(); } };

  // 1 · HOOK: a small island in a wide river at gold dawn, seen from above and coming closer; on it a dark child in his own light
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.4, cam = CAM.drift(CAM.crane(clamp(t / 3.4), { from: 0.92, to: 1.3, y0: -260, y1: 60, ease: E.outCubic }), T, 0.5), fl = 1 + 0.3 * Math.sin(Math.PI * clamp((t - b0) / 0.5));
      EP47.island(ctx, T, cam, 'island-gold', (g) => { KIT.glow(g, 540, 1040, 560 * fl, '#fff0b0', 0.6); CH.vyasaChild.draw(g, { x: 540, y: 1262, scale: 0.62, facing: 'left', pose: 'stand', light: { dir: -Math.PI / 2, intensity: 1.2, front: 0.55, fill: 0.4, tint: ['#ffd060', 0.6] }, expression: { emo: 'calm' }, t: T, key: 'hk-c' }); }, { sun: [540, 700, 130], mist: 0.35 });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, clamp(t / 0.2), line.text, { y: 1490, size: 76, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.15) / 0.6);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 1500, key: 'ep50-title' });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.4, vignette: 0.42, paper: 0.3 }) });

  // 2 · FERRY: the river at noon in deep blue: her boat crossing, she in the stern with the oar; a lateral track
  R.scene({ id: 'ferry', transition: { type: 'brush', dur: 0.5, angle: 0.2, color: '#c8e8f8' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.slide(t / env.dur, { from: 140, to: -140, zoom: 1.3 });
      EP49.river(ctx, T, cam, { figs: (g, p) => { g.save(); g.translate(60 - 30 * t, 6 * Math.sin(T * 1.6)); crew(g, p, T, t, { sage: false, front: 0.2 }); g.restore(); } });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 3.2) / 0.4)), env.strings, { y: 190 });
      TY.plaque(ctx, T, clamp((t - 0.5) / 0.6), ...names(env, 'Satyavati'), { x: 330, y: 300, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.42, paper: 0.3 }) });

  // 3 · SAGE: coral dusk: Parashara comes down the bank with his staff (staff@0), steps into the bow (steps@1, creak@1) and
  //     sits, a full boat-length from her; his head turns to her and stays
  R.scene({ id: 'sage', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 1.8, b1 = b[1] ?? 4.2, b2 = b[2] ?? 5.6, cam = CAM.push(t / env.dur, { from: 1.2, to: 1.36, focus: [420, 1000] });
      const d = 330 * E.inOutSine(clamp((t - 0.3) / (b1 - 0.5))), dip = Math.sin(Math.PI * clamp((t - b1) / 0.5));
      EP49.river(ctx, T, cam, { pal: 'fishers-coral', hz: 900, sun: [250, 760, 150], figs: (g, p) => { g.save(); g.translate(0, 10 * dip);
        crew(g, p, T, t, { front: 0.25, sageL: { dir: -0.5, intensity: 1.0, front: 0.03, fill: 0, tint: ['#3a1410', 0.5] }, sageX: -80 + d, girlPose: { w: { stand: 0.6, attend: 0.4 }, prop: 'oar' }, girlEx: { emo: 'calm', gaze: [0.5, 0.2] },
          sagePose: ACT.pose(t, [[0, 'walk'], [b1 - 0.1, 'stand', { act: 0.3 }], [b1 + 0.5, 'sit', { act: 0.7 }]], { phase: ACT.stride(d, 0.56), prop: 'staff' }),
          sageEx: { emo: ACT.emo(t, [[0, 'calm'], [b2, 'wonder']]), ...ACT.lead(t, [[0, [0.3, 0.4]], [b2 - 0.3, [0.95, 0]]]) } }); g.restore(); } });
      // (he walks in along the near bank: the same figure, offset until he steps aboard)
      TY.plaque(ctx, T, clamp((t - b0) / 0.6), ...names(env, 'Parashara'), { x: 540, y: 280, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.45, paper: 0.3 }) });

  // 4 · WATCHING (close-up, first half): her face, steady; her eyes go to one bank and the other, where small figures sit
  const faceShot = (ctx, T, cam, pal, draw, o = {}) => ST.shot(ctx, T, { pal, cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1050 }) },
    { z: 0.3, soft: 0.35, draw: (g, p) => { ST.treeline(g, p, { y: 1070, h: 300, T, seed: 113, kind: 'mixed' }); ST.water(g, p, { y0: 1070, y1: 2000, T, flow: 56, count: 70 }); if (o.far) o.far(g, p); } },
    { z: 0.7, haze: false, draw: (g) => { if (o.mist) ST.mist(g, T, { y: 300, h: 1500, alpha: o.mist }); } },
    { z: 1, haze: false, draw: (g, p) => draw(g, p) },
    { z: 1.4, haze: false, draw: (g) => { if (o.mist) ST.mist(g, T, { y: 1300, h: 600, alpha: o.mist * 0.7 }); } },
  ] });
  const herFace = (g, p, T, t, emo, lead, speak, key, L) => CH.satyavati.draw(g, { x: 640, y: 2960, scale: 2.5, facing: 'left', pose: { w: { stand: 1 }, prop: false }, light: L || ST.light(p, { from: [200, 200], at: [600, 1200], k: 1.0, front: 0.3 }), expression: { emo, speak, ...lead }, t: T, key });
  R.scene({ id: 'watching', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.4, b1 = env.beats[1] ?? 3.2, cam = CAM.drift(CAM.pull(clamp(t / env.dur), { from: 1.3, to: 1.0, focus: [540, 760] }), T, 1.2);
      faceShot(ctx, T, cam, 'yamuna-deep', (g, p) => herFace(g, p, T, t, 'resolve', ACT.lead(t, [[0, [0.8, 0.1]], [b0 - 0.3, [0.2, -0.3]], [b0 + 0.6, [-0.9, -0.2]], [b1, [0.8, 0]]], 0.35, 0.1), talk(env, t), 'wt-s'), { far: (g, p) => watchers(g, p, 1070) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.26, vignette: 0.45, paper: 0.3 }) });

  // 5 · MIST (the signature shot): his hand lifts; mist rises off the water in bands, plane behind plane; a slow orbit round the
  //     boat until banks, watchers and sky are gone and the boat hangs in white
  R.scene({ id: 'mist', transition: { type: 'smoke', dur: 0.7, dir: -Math.PI / 2, color: '#e8e4f8' },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.3, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 150, zoom: 1.3 }), m = E.inOutSine(clamp((t - b0 + 0.4) / 2.2));
      ST.shot(ctx, T, { pal: 'mist-lavender', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 900 }) },
        { z: 0.2, draw: (g, p) => { ST.hills(g, p, { y: 900, h: 240, seed: 111 }); } },
        { z: 0.3, haze: false, draw: (g) => ST.mist(g, T, { y: 500, h: 500, alpha: 0.9 * m }) },
        { z: 0.4, draw: (g, p) => { ST.treeline(g, p, { y: 920, h: 300, T, seed: 113, kind: 'mixed' }); watchers(g, p, 930); } },
        { z: 0.5, haze: false, draw: (g) => ST.mist(g, T, { y: 700, h: 420, alpha: m }) },
        { z: 0.6, haze: false, draw: (g, p) => { ST.water(g, p, { y0: 920, y1: 2000, T, flow: 56, count: 110 }); ST.mist(g, T, { y: 900, h: 500, alpha: 0.85 * m }); } },
        { z: 1, haze: false, draw: (g, p) => crew(g, p, T, t, { front: 0.12, girlPose: { w: { stand: 0.7, attend: 0.3 }, prop: 'oar' }, girlEx: { emo: 'wonder', gaze: [0.4, -0.4] }, sagePose: ACT.pose(t, [[0, 'sit'], [b0 - 0.5, 'bless', { act: 0.6 }]], { prop: 'staff' }), sageEx: { emo: 'resolve', gaze: [0.7, -0.3] } }) },
        { z: 1.5, haze: false, draw: (g) => ST.mist(g, T, { y: 1400, h: 600, alpha: 0.8 * m }) },
        { z: 1.8, haze: false, draw: (g) => { for (let i = 0; i < 5; i++) { const u = (T * 0.05 + i / 5) % 1; KIT.glow(g, -300 + 1700 * u, 400 + i * 300, 620, '#f4f0ff', 0.4 * m * Math.sin(Math.PI * u)); } g.globalAlpha = 1; } },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.36, paper: 0.3 }) });

  // 6 · MAIDEN (close-up, second half): her face in the mist: the steadiness gives way to worry, then lifts to him: she is bargaining
  R.scene({ id: 'maiden', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1, b1 = env.beats[1] ?? 3, cam = CAM.push(t / env.dur, { from: 1.38, to: 1.6, focus: [470, 700] });   // nearer than `watching`: the same face must not be the same picture
      faceShot(ctx, T, cam, 'mist-lavender', (g, p) => herFace(g, p, T, t, ACT.emo(t, [[0, 'resolve'], [b0 - 0.3, 'fear', { dur: 0.5 }], [b1 - 0.3, 'resolve', { dur: 0.5 }]]), ACT.lead(t, [[0, [0.8, 0]], [b0 - 0.2, [0.5, 0.8]], [b1 - 0.4, [0.9, -0.1]]], 0.35, 0.14), talk(env, t), 'md-s', ST.light(p, { from: [200, 200], at: [600, 1200], k: 0.95, front: 0.22 })), { mist: 0.75 });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.28, vignette: 0.4, paper: 0.3 }) });

  // 7 · GIFT (the turn, after a silence): Parashara alone in the frame, lit gold through the mist, a hand raised in blessing
  R.scene({ id: 'gift', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 2.1, b1 = env.beats[1] ?? 3.9, cam = CAM.push(t / env.dur, { from: 1.1, to: 1.3, focus: [520, 760] });
      ST.shot(ctx, T, { pal: 'release-gold', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1050, sun: [540, 560, 170] }) },
        { z: 0.4, haze: false, draw: (g, p) => { ST.water(g, p, { y0: 1070, y1: 2000, T, flow: 50, count: 70 }); ST.mist(g, T, { y: 300, h: 1300, alpha: 0.6 }); } },
        { z: 0.7, haze: false, draw: (g) => KIT.glow(g, 520, 700, 900, '#fff6c0', 0.5 + 0.2 * E.outCubic(clamp((t - b1) / 0.6))) },
        { z: 1, haze: false, draw: (g, p) => { EP49.boat(g, 760, BY, 0.9); CH.parashara.draw(g, { x: 500, y: BY - 30, scale: 0.8, facing: 'right', pose: ACT.pose(t, [[0, 'sit'], [b0 - 0.6, 'speak', { act: 0.5 }], [b1 - 0.35, 'bless', { act: 0.5 }]], { prop: 'staff' }), light: { dir: -Math.PI / 2 - 0.4, intensity: 1.1, front: 0.06, fill: 0, wrap: 0.6, tint: ['#ffcf7a', 0.6] }, expression: { emo: ACT.emo(t, [[0, 'tender'], [b1, 'joy']]), speak: talk(env, t), gaze: [0.8, 0.1] }, t: T, key: 'gf-p' }); } },
        { z: 1.5, haze: false, draw: (g) => ST.mist(g, T, { y: 1350, h: 600, alpha: 0.7 }) },
      ] });
      TY.turnWord(ctx, T, clamp((t - b1) / 0.7), 'Choose', { x: 830, y: 640, size: 84, out: clamp((t - (env.dur - 0.3)) / 0.3), sub: 'Adi 1.57.64' });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.4, vignette: 0.4, paper: 0.3 }) });

  // 8 · SCENT: she alone in the frame: a tilt up from her joined hands; the grey-silver haze round her turns to rose and gold
  //     petals that drift away over the water, far; her face lifts, glad; then the mist closes over the boat
  R.scene({ id: 'scent', transition: { type: 'lamp', dur: 0.8, from: [520, 700], to: [640, 760] },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 1.1, b1 = b[1] ?? 2.8, b2 = b[2] ?? 4.2, cam = CAM.tilt(E.inOutSine(clamp(t / 2.6)), { from: 200, to: -40, zoom: 1.14 }), k = E.inOutSine(clamp((t - b0 + 0.2) / 1.6)), close = E.inOutSine(clamp((t - b2 - 0.1) / 0.9));
      ST.shot(ctx, T, { pal: 'brahma-rose', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1050 }) },
        { z: 0.4, haze: false, draw: (g, p) => { ST.water(g, p, { y0: 1070, y1: 2000, T, flow: 50, count: 70 }); ST.mist(g, T, { y: 400, h: 1100, alpha: 0.5 }); } },
        { z: 1, haze: false, draw: (g, p) => { EP49.boat(g, 300, BY, 0.9);
          for (let i = 0; i < 40; i++) { const u = (T * 0.1 * (0.5 + hash(i, 1)) + hash(i, 2)) % 1, x = 600 + (hash(i, 3) - 0.5) * 300 + 700 * u * k * (hash(i, 4) - 0.3), y = BY - 150 - 620 * hash(i, 5) - 200 * u * k; g.globalAlpha = 0.85 * (1 - u * k); g.fillStyle = k < 0.5 ? '#c8c8d4' : (i % 2 ? '#ffb0c8' : '#ffe08a'); g.beginPath(); g.ellipse(x, y, 14, 8, i + T, 0, TAU); g.fill(); } g.globalAlpha = 1;
          CH.satyavati.draw(g, { x: 600, y: BY - 30, scale: 0.84, facing: 'left', pose: ACT.pose(t, [[0, 'anjali'], [b1, 'attend', { act: 0.6 }]], { prop: false }), light: ST.light(p, { from: [200, 200], at: [660, BY], front: 0.2 }), expression: { emo: ACT.emo(t, [[0, 'resolve'], [b0 + 0.4, 'wonder'], [b2 - 0.3, 'joy', { dur: 0.6 }]]), ...ACT.lead(t, [[0, [0.5, 0.6]], [b1, [0.6, -0.5]], [b2 - 0.3, [0.9, 0]]], 0.4, 0.2) }, t: T, key: 'sc-s' }); } },
        { z: 1.5, haze: false, draw: (g) => { ST.mist(g, T, { y: 1350, h: 600, alpha: 0.6 }); if (close > 0) { g.fillStyle = 'rgba(250,240,246,' + 0.97 * close + ')'; g.fillRect(-900, -900, 2880, 3720); } } },   // the mist closes
      ] });
      TY.tag(ctx, T, clamp((t - b1 + 0.2) / 0.5), 'her fragrance carried a league', { x: 540, y: 260, size: 38, out: clamp((t - b2) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.36, paper: 0.3 }) });

  // 9 · BORN (a second silence before it): the mist opens on gold dawn: the island: she kneels in the reeds, a new-born in her arms
  const isle = (ctx, T, cam, figs, o = {}) => EP47.island(ctx, T, cam, 'island-gold', figs, { sun: [540, 700, 130], mist: o.mist ?? 0.3 });
  R.scene({ id: 'born', transition: { type: 'brush', dur: 0.6, angle: -0.15, color: '#fff4d8' },
    draw(ctx, t, env) {
      const T = env.T, b2 = env.beats[2] ?? 4, cam = CAM.crane(t / env.dur, { from: 1.0, to: 1.3, y0: -200, y1: 60 }), a = E.outCubic(clamp((t - b2 + 0.6) / 0.8));
      isle(ctx, T, cam, (g, p) => {
        CH.satyavati.draw(g, { x: 600, y: 1268, scale: 0.9, facing: 'left', pose: { w: { kneel: 0.7, carry: 0.3 }, prop: false }, light: ST.light(p, { from: [540, 300], at: [600, 1260], front: 0.25 }), expression: { emo: 'tender', gaze: [0.3, 0.8], look: 0.1 }, t: T, key: 'bn-s' });
        EP49.infant(g, 520, 905, 1.3, 0.4 + 0.5 * a, '#fff4dc');
      }, { mist: lerp(0.9, 0.3, clamp(t / 1.2)) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.4, vignette: 0.42, paper: 0.3 }) });

  // 10 · GREW: the child stands; in one tilt upward he is a boy, a youth in bark cloth: Dvaipayana, the island-born: Vyasa
  R.scene({ id: 'grew', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 0.5, b1 = b[1] ?? 1.6, b2 = b[2] ?? 5.2, grow = E.inOutSine(clamp((t - b0) / 1.6)), cam = CAM.drift(CAM.tilt(grow, { from: 160, to: -60, zoom: 1.14 + 0.22 * clamp(t / env.dur) }), T, 1.6), s = lerp(0.5, 1.2, grow);
      isle(ctx, T, cam, (g, p) => {
        KIT.glow(g, 620, 1262 - 520 * s, 700, '#fff0b0', 0.5 + 0.2 * Math.sin(Math.PI * grow));
        CH.vyasaChild.draw(g, { x: 620, y: 1262, scale: s, facing: 'left', pose: ACT.pose(t, [[0, 'stand'], [b2 - 0.5, 'anjali', { act: 0.6 }]]), light: { dir: -Math.PI / 2 - 0.4, intensity: 1.2, front: 0.55, fill: 0.4, wrap: 0.6, tint: ['#ffcf7a', 0.6] }, expression: { emo: 'calm', gaze: [0.6, 0] }, t: T, key: 'gw-c' });
      });
      TY.plaque(ctx, T, clamp((t - b1) / 0.6), ...names(env, 'Dvaipayana'), { x: 290, y: 270, out: clamp((t - b2 + 0.3) / 0.3) });
      TY.plaque(ctx, T, clamp((t - b2) / 0.5), ...names(env, 'Vyasa'), { x: 290, y: 270, out: clamp((t - (env.dur - 0.3)) / 0.25) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.4, vignette: 0.42, paper: 0.3 }) });

  // 11 · PROMISE: the young Vyasa at the forest's edge, turned back toward her, palms joined; the focus racks from her hand in
  //      the foreground to him; then he walks in under the trees
  R.scene({ id: 'promise', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b2 = env.beats[2] ?? 3.8, cam = CAM.push(t / env.dur, { from: 1.04, to: 1.14, focus: [540, 1000] }), d = 150 * Math.max(0, t - b2) * E.outCubic(clamp((t - b2) / 0.5)), turned = t > b2 - 0.1;
      ST.shot(ctx, T, { pal: 'exile-forest', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ }) },
        { z: 0.4, draw: (g, p) => ST.treeline(g, p, { y: HZ + 20, h: 1100, gap: 300, T, seed: 81, kind: 'banyan' }) },
        { z: 0.8, haze: false, draw: (g) => { const mg = g.createLinearGradient(0, GY - 1000, 0, GY); mg.addColorStop(0, 'rgba(232,244,214,0)'); mg.addColorStop(1, 'rgba(232,244,214,0.8)'); g.fillStyle = mg; g.fillRect(-900, GY - 1000, 2880, 1000); ST.shafts(g, T, { x: 500, angle: 0.2, alpha: 0.14 }); } },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
          CH.vyasaChild.draw(g, { x: 330 - d, y: GY + 10, scale: 1.3, facing: turned ? 'left' : 'right', pose: ACT.pose(t, [[0, 'anjali'], [b2, 'walk', { act: 0.4 }]], { phase: ACT.stride(d, 0.9) }), light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.6, fill: 0.45 }, expression: { emo: 'tender', speak: talk(env, t), gaze: [0.8, 0] }, t: T, key: 'pm-v' }); } },
        { z: 1.2, haze: false, draw: (g, p) => CH.satyavati.draw(g, { x: 860, y: GY + 30, scale: 1.0, facing: 'left', pose: ACT.pose(t, [[0, 'attend'], [b2 - 0.2, 'bless', { act: 0.6 }]], { prop: false }), light: ST.light(p, { from: [300, 200], at: [860, GY], front: 0.2 }), expression: { emo: 'tender', gaze: [0.8, 0.1] }, t: T, key: 'pm-s' }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.28, vignette: 0.45, paper: 0.3 }) });

  // 12 · CLIFF: the frame returns: the king's lifted face; a night sky in iron blue: points of light fall like slow rain toward a dark earth
  const cliff = (ctx, T, t, env, b) => {
    const cam = CAM.drift(CAM.pull(clamp(t / 5.6), { from: 1.3, to: 1.02, focus: [300, 1100] }), T, 1.8);
    ST.shot(ctx, T, { pal: 'war-iron', cam, layers: [
      { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500 }) },
      { z: 0.2, haze: false, draw: (g) => { const a = 0.45 * clamp((t - 0.2) / 0.8) + 0.55 * clamp((t - b[1] + 0.4) / 0.8); for (let i = 0; i < 46; i++) { const u = (T * 0.07 * (0.5 + hash(i, 1)) + hash(i, 2)) % 1, x = 1080 * hash(i, 3), y = -100 + 1500 * u; g.globalAlpha = a * (1 - u * 0.6); g.strokeStyle = '#fff0c0'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y - 70); g.lineTo(x, y); g.stroke(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, 5 + 4 * hash(i, 4), 0, TAU); g.fill(); } g.globalAlpha = 1; } },
      { z: 0.5, draw: (g, p) => ST.hills(g, p, { y: 1500, h: 300, seed: 131 }) },
      { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: 1480 }); CH.kingJanamejaya.draw(g, { x: 300, y: 1470, scale: 1.0, facing: 'right', pose: ACT.pose(t, [[0, 'anjali'], [b[1] - 0.3, 'attend', { act: 0.5 }]]), light: { dir: -Math.PI / 2 - 0.3, intensity: 1.5, front: 1, fill: 0.8, tint: ['#e8ecff', 0.6], minLum: 0.5 }, expression: { emo: 'wonder', ...ACT.lead(t, [[0, [0.8, 0]], [b[1] - 0.4, [0.7, -1]]], 0.4, 0.3) }, t: T, key: 'cl-k' }); } },
    ] });
    TY.plaque(ctx, T, clamp((t - 0.6) / 0.6), ...names(env, 'Janamejaya'), { x: 760, y: 760, out: clamp((t - 3.2) / 0.3) });
    TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 110 });
    fin(ctx, T);
  };
  const CL = { dur: 5.53, b: [1.2, 3.35, 4.61] };
  R.scene({ id: 'cliff', transition: { type: 'dissolve', dur: 0.4 }, draw(ctx, t, env) { cliff(ctx, env.T, t, env, env.beats.length > 2 ? env.beats : CL.b); }, post: () => ({ bloom: 0.34, vignette: 0.5, paper: 0.3 }) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, CL.dur + t, env, CL.b) });
})();
