/* Episode 53 · The King and the Hermitage (CE Adi 1.62–65.17). One scene per line of script/ep53.en.json.
 * Loads after ep41/_common, ep44/_common, ep46/_common, ep49/_common, ep51/_common.
 * The king enters the hermitage with the royal signs laid aside (dushyantaPlain); the young woman is not named here; the two
 * stand three paces apart and never touch. */
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
  EP51.GROUND = { 'ch-k': 'pit' };
  // the yard of Kanva's hut: the hut large on the right, its doorway dark
  const yard = (ctx, T, cam, pal, figs, o = {}) => EP51.wood(ctx, T, cam, pal, { seed: 120, huts: [[820, 1.5, o.lit ?? 0.15]], shaftX: 300, shaftA: 0.35, figs, dust: 'pollen', near: o.near });
  const king = (g, p, T, x, y, s, o = {}) => F(g, T, 'dushyantaPlain', x, y, s, { f: o.f || 'right', pose: o.pose || 'stand', L: o.L || EP51.lit(p, x, y, { front: 0.35 }), ex: o.ex || { emo: 'calm' }, key: o.key || 'kg' });
  const girl = (g, p, T, x, y, s, o = {}) => F(g, T, 'shakuntala', x, y, s, { f: o.f || 'left', pose: o.pose || 'attend', L: o.L || EP51.lit(p, x, y, { front: 0.4 }), ex: o.ex || { emo: 'tender' }, key: o.key || 'gl' });

  // 1 · HOOK: a plainly dressed man stands in the yard of an empty forest hut and calls; only birds answer
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.push(E.outCubic(clamp(t / 2.4)), { from: 1.0, to: 1.22, focus: [700, 900] }), T, 0.6);
      yard(ctx, T, cam, 'hermitage-green', (g, p) => {
        king(g, p, T, 330, GY + 10, 0.9, { pose: ACT.pose(t, [[0, 'stand'], [0.1, 'speak', { act: 0.3 }]]), ex: { emo: 'wonder', speak: talk(env, t), gaze: [0.9, -0.1] }, key: 'hk-k' });
        for (let i = 0; i < 4; i++) EP51.bird(g, i % 2 ? 'parrot' : 'small', 560 + i * 130 + 60 * t * (i % 2 ? 1 : -1), 520 + 80 * hash(i, 3) - 30 * t, 0.9, { fly: 1, T, dir: i % 2 ? 1 : -1 }); });
      EP51.hook(ctx, T, t, env, { y: 1500 });
      fin(ctx, T);
    },
    post: POST(0.3, 0.45) });

  // 2 · LINE: a tilt down a pale palace wall with a painted line of kings to the living king on his throne
  R.scene({ id: 'line', transition: { type: 'brush', dur: 0.5, angle: 0.2, color: '#f4e8c8' },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 3.3, cam = CAM.drift(CAM.tilt(E.inOutSine(clamp(t / 3.6)), { from: -330, to: 60, zoom: 1.12 + 0.14 * clamp((t - 2.4) / (env.dur - 2.4)) }), T, 1.8);
      EP51.court(ctx, T, cam, 'seat-ivory', { tx: 540, ty: 1330, ts: 0.95, tcol: '#3a100c', crowd: 0.6, glow: 0.3,
        back: (g, p) => { for (let i = 0; i < 6; i++) { const x = 140 + i * 160, y = 150 - 60 * (i % 2); g.fillStyle = KIT.hex(p.near, p.accent, 0.3); g.beginPath(); g.ellipse(x, y, 44, 110, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(x, y - 150, 30, 0, TAU); g.fill(); g.fillStyle = '#c89a30'; g.beginPath(); g.moveTo(x - 26, y - 176); g.lineTo(x, y - 230); g.lineTo(x + 26, y - 176); g.closePath(); g.fill(); if (i < 5) { g.strokeStyle = '#c89a30'; g.lineWidth = 5; g.beginPath(); g.moveTo(x + 46, y); g.lineTo(x + 114, y + (i % 2 ? -60 : 60)); g.stroke(); } } },
        figs: (g, p) => F(g, T, 'dushyanta', 540, 1040, 0.72, { f: 'left', pose: 'sit', L: { dir: -Math.PI / 2 - 0.3, intensity: 0.38, front: 0.3, fill: 0.14, minLum: 0.05 }, ex: { emo: 'resolve', gaze: [0.7, 0] }, key: 'ln-k' }) });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 3.0) / 0.4)), env.strings, { y: 190 });
      TY.plaque(ctx, T, clamp((t - b1 + 0.6) / 0.6), ...names(env, 'Dushyanta'), { x: 250, y: 330, size: 40, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.3, 0.42) });

  // 3 · HUNT: a fast lateral track: the king's chariot in front, behind it horses, elephants and spear tips; deer leap ahead
  R.scene({ id: 'hunt', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.slide(t / env.dur, { from: 190, to: -190, zoom: 1.12 }), d = 520 * (t / env.dur);
      EP51.wood(ctx, T, cam, 'hunt-emerald', { seed: 91, dust: 'dust', dustN: 50, figs: (g, p) => {
        for (let i = 0; i < 12; i++) { g.fillStyle = '#0c1a10'; g.fillRect(1180 + i * 50 - d, GY - 800 - 40 * hash(i, 4), 5, 460); }
        for (let i = 0; i < 3; i++) EP51.beast(g, 'elephant', 1560 + i * 330 - d, GY - 240, 0.6, { dir: -1, T, run: 0.5, phase: T * 5 + i });
        for (let i = 0; i < 4; i++) KIT.army.draw(g, 'horse', { x: 1160 + i * 150 - d, y: GY - 250 + (i % 2) * 20, s: 1.2, dir: -1, t: T, phase: i, gait: 1, fill: '#2a1408', line: '#0a0604', gold: '#e0b040', rim: '#fff0b0', light: -Math.PI / 2 });
        KIT.army.draw(g, 'chariot', { x: 800 - d, y: GY - 240, s: 1.5, dir: -1, t: T, gait: 1, fill: '#3a1a0c', line: '#120806', gold: '#f0c050', rim: '#fff0b0', light: -Math.PI / 2, banner: '#1f8a5a' });
        F(g, T, 'dushyanta', 850 - d, GY - 345, 0.3, { f: 'left', pose: { w: { point: 0.5, stand: 0.5 } }, L: EP51.bright('#fff4d8', 1.45), ex: { emo: 'resolve', gaze: [0.9, 0] }, key: 'hn-k' });
        for (let i = 0; i < 3; i++) EP51.beast(g, 'deer', 420 - d * 0.75 - i * 170, GY - 250 - 70 * Math.abs(Math.sin(T * 5 + i * 1.3)), 0.8, { dir: -1, T, run: 1, phase: T * 11 + i * 2 });
        for (let i = 0; i < 6; i++) EP51.bird(g, 'small', 200 + i * 150 - d * 0.3, 420 - 50 * t + 60 * hash(i, 7), 0.9, { fly: 1, T, dir: -1 }); } });
      fin(ctx, T);
    },
    post: POST(0.3, 0.45) });

  // 4 · DEEPER: a dry open waste at noon: the king alone on his chariot, slowing; far ahead a dark green line of trees
  R.scene({ id: 'deeper', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.pull(clamp(t / env.dur), { from: 1.5, to: 1.02, focus: [640, 1000] }), d = 160 * E.outCubic(t / env.dur);
      EP51.land(ctx, T, cam, 'noon-ochre', { sun: [540, 300, 90], trees: false, hz: 1100, hillH: 160, dust: 'dust', clouds: false,
        far: (g) => { g.fillStyle = '#2a5a2a'; for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(-80 + i * 44, 1100 - 10 * hash(i, 2), 40, 0, TAU); g.fill(); } },
        figs: (g, p) => { KIT.army.draw(g, 'chariot', { x: 780 - d, y: 1290, s: 2.0, dir: -1, t: T, gait: 1 - 0.7 * (t / env.dur), fill: '#7a3f1c', line: '#2a1408', gold: '#f0c050', rim: '#fff0b0', light: -Math.PI / 2, banner: '#1f8a5a' });
          if (t < env.dur) F(g, T, 'dushyanta', 847 - d, 1150, 0.4, { f: 'left', pose: { w: { attend: 0.6, stand: 0.4 } }, L: { dir: -Math.PI / 2 - 0.3, intensity: 0.95, front: 0.62, fill: 0.3 }, ex: { emo: 'weary', gaze: [0.9, 0.1] }, key: 'dp-k' });   // the king in colour: no black-silhouette principal
          } });
      fin(ctx, T);
    },
    post: POST(0.36, 0.4) });

  // 5 · LOVELY (the signature shot): a crane up over the tree tops: a bright river bending through the wood, huts on its bank
  R.scene({ id: 'lovely', transition: { type: 'lamp', dur: 0.8, from: [540, 300], to: [760, 520] },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 1.2, b3 = b[3] ?? 5.9, cam = CAM.crane(E.inOutSine(clamp(t / env.dur)), { from: 1.5, to: 1.03, y0: 330, y1: -80 });
      EP51.land(ctx, T, cam, 'river-jade', { sun: [780, 380, 80], hz: 980, treeH: 520, water: [1040, 1330], dust: 'pollen', seed: 140,
        far: (g, p) => { for (const [x, s] of [[240, 0.5], [420, 0.62], [610, 0.5]]) { ST.hut(g, p, { x, y: 1040, s, lit: 0.6 }); g.strokeStyle = 'rgba(244,250,240,0.7)'; g.lineWidth = 9; g.beginPath(); g.moveTo(x + 20, 1040 - 260 * s); g.quadraticCurveTo(x + 50 + 20 * Math.sin(T + x), 760, x + 30, 620); g.stroke(); }
          for (let i = 0; i < 9; i++) { const a = T * 0.5 + i * 0.7; EP51.bird(g, i % 3 ? 'small' : 'goose', 620 + 300 * Math.cos(a), 560 + 110 * Math.sin(a * 1.3), 0.7, { fly: 1, T, dir: Math.sin(a) > 0 ? -1 : 1 }); } },
        figs: (g, p) => { ST.treeline(g, p, { y: 1500, h: 520, T, seed: 143, kind: 'flame', color: p.near }); } });
      TY.plaque(ctx, T, clamp((t - b0 - 0.6) / 0.6), ...names(env, 'Malini'), { x: 300, y: 300, size: 46, out: clamp((t - b3 + 1.0) / 0.3) });
      TY.plaque(ctx, T, clamp((t - b3 + 0.6) / 0.6), ...names(env, 'Kanva'), { x: 300, y: 300, size: 54, out: out(t, env, 0.3) });
      fin(ctx, T);
    },
    post: POST(0.36, 0.4) });

  // 6 · LEFT (the turn): a rack focus from the crown and sash laid on a cloth to the king walking away in a plain dhoti
  R.scene({ id: 'left', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 3.3, b2 = b[2] ?? 5.9, cam = CAM.drift(CAM.rack(E.inOutSine(clamp((t - 0.5) / 1.2)), { from: 1.4, to: 1, zoom: 1.1 + 0.1 * clamp(t / env.dur) }), T, 2.2), d = 200 * clamp(t / env.dur);
      EP51.wood(ctx, T, cam, 'hermitage-green', { seed: 125, trunks: [-220, 1300],
        far: (g) => { for (let i = 0; i < 16; i++) { g.fillStyle = '#143a1c'; g.fillRect(40 + i * 28, HZ - 330 - 30 * hash(i, 3), 4, 330); } },
        figs: (g, p) => king(g, p, T, 560 + d, GY - 60, 0.62, { pose: ACT.pose(t, [[0, 'walk']], { phase: ACT.stride(d, 0.62) }), ex: { emo: 'calm', gaze: [0.8, 0] }, key: 'lf-k' }),
        near: (g) => { g.fillStyle = '#e8dcc0'; g.beginPath(); g.ellipse(330, 1790, 330, 80, 0, 0, TAU); g.fill();   // the folded cloth
          g.fillStyle = '#e7b54a'; g.beginPath(); g.moveTo(210, 1780); g.lineTo(240, 1560); g.lineTo(290, 1680); g.lineTo(330, 1520); g.lineTo(370, 1680); g.lineTo(420, 1560); g.lineTo(450, 1780); g.closePath(); g.fill();   // the crown
          g.fillStyle = '#c8402a'; for (const x of [260, 330, 400]) { g.beginPath(); g.arc(x, 1730, 16, 0, TAU); g.fill(); } g.strokeStyle = '#1f8a5a'; g.lineWidth = 34; g.beginPath(); g.moveTo(470, 1800); g.quadraticCurveTo(600, 1740, 700, 1830); g.stroke(); } });
      TY.turnWord(ctx, T, clamp((t - b2 + 0.3) / 0.6), 'Guest', { x: 300, y: 560, size: 100, out: out(t, env, 0.3), sub: 'Adi 1.64.29' });
      fin(ctx, T);
    },
    post: POST(0.3, 0.45) });

  // 7 · CHANT: rows of seated hermits chanting by small altar fires, deer lying among them; the king passes, hands joined
  R.scene({ id: 'chant', transition: { type: 'smoke', dur: 0.6, dir: 0, color: '#fff0c0' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 130, zoom: 1.14 }), d = 300 * (t / env.dur);
      EP51.wood(ctx, T, cam, 'wedding-turmeric', { seed: 131, huts: [[160, 0.9, 0.6], [930, 1.0, 0.6]], shafts: 0.2, figs: (g, p) => {
        for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) { const x = 80 + i * 230 + r * 110, y = GY - 330 + r * 110; EP51.mini(g, x, y, 1.1, KIT.hex(p.near, '#000000', 0.25), 'rgba(255,240,180,0.9)', true); if (i % 2 === r) { KIT.glow(g, x + 110, y - 50, 150, '#ffb040', 0.5 * KIT.flicker(T, i)); CH.hearthfire.draw(g, { x: x + 110, y: y + 4, scale: 0.2, t: T + i, k: 0.8, key: 'ch-f' + r + i }); } }
        EP51.beast(g, 'deer', 840, GY - 40, 0.7, { dir: -1, T, lie: 1 });
        king(g, p, T, 200 + d, GY + 20, 0.86, { pose: ACT.pose(t, [[0, 'walk'], [1.2, { walk: 0.5, anjali: 0.5 }, { act: 0.5 }]], { phase: ACT.stride(d, 0.86) }), ex: { emo: 'wonder', gaze: [0.6, -0.3] }, key: 'ch-k' }); } });
      TY.tag(ctx, T, clamp((t - 1.0) / 0.4), "he thought himself in Brahma's world", { x: 540, y: 250, size: 42, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.4, 0.4) });

  // 8 · EMPTY: seen through the hut's dark doorway: the king small in the bright yard, looking about
  R.scene({ id: 'empty', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.4, cam = CAM.drift(CAM.push(t / env.dur, { from: 1.0, to: 1.16, focus: [540, 900] }), T, 2.0);
      // full frame (was a small picture inside a door-shaped frame on black: it read as a shrunken video)
      EP51.wood(ctx, T, cam, 'thicket-shade', { seed: 127, trunks: false, shafts: 0.22, figs: (gg, p) => king(gg, p, T, 540, GY - 40, 0.72, { f: t > b0 ? 'left' : 'right', pose: ACT.pose(t, [[0, 'attend'], [b0, 'speak', { act: 0.4 }]]), L: EP51.bright('#f0ffb0', 1.3), ex: { emo: 'wonder', gaze: [0.8, -0.2] }, key: 'em-k' }) });
      fin(ctx, T);
    },
    post: POST(0.3, 0.5) });

  // 9 · CAME (a second silence; the close-up): she steps from the doorway with a water jar; his face: weariness, then wonder;
  //     last, she points down the path toward the river (her father is out gathering fruit)
  R.scene({ id: 'came', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b2 = b[2] ?? 5.0, b3 = b[3] ?? 6.0, cu = t > b2 - 1.2 && t < b3 + 0.5;
      if (cu) { const u = t - (b2 - 1.2), cam = CAM.drift(CAM.push(clamp(u / 2.6), { from: 1.0, to: 1.1, focus: [540, 780] }), T, 1.6);
        EP51.wood(ctx, T, cam, 'meadow-spring', { seed: 120, trunks: false, figs: (g, p) => {
          F(g, T, 'dushyantaPlain', 430, 2960, 2.5, { f: 'right', pose: 'stand', L: ST.light(p, { from: [860, 200], at: [500, 1200], k: 1.0, front: 0.4 }), ex: { emo: ACT.emo(u, [[0, 'weary'], [0.8, 'wonder', { dur: 0.6 }], [1.9, 'tender', { dur: 0.5 }]]), ...ACT.lead(u, [[0, [0.5, 0.4]], [0.7, [0.9, 0]]], 0.4, 0.2) }, key: 'cm-kc' });
          const gr = g.createLinearGradient(0, 1060, 0, 1560); gr.addColorStop(0, 'rgba(20,40,10,0)'); gr.addColorStop(0.5, 'rgba(20,40,10,0.85)'); gr.addColorStop(1, 'rgba(20,40,10,0.96)'); g.fillStyle = gr; g.fillRect(-900, 1060, 2880, 1800); } });
      } else { const late = t >= b3 + 0.5, cam = CAM.drift(CAM.push(clamp(t / env.dur), { from: 1.04, to: 1.14, focus: [600, 900] }), T, 1.6), step = 170 * E.outCubic(clamp((t - 0.6) / 1.6));
        yard(ctx, T, cam, 'meadow-spring', (g, p) => {
          king(g, p, T, 250, GY + 10, 0.8, { pose: late ? { w: { attend: 1 } } : 'stand', ex: { emo: 'wonder', gaze: [0.9, 0] }, key: 'cm-k' });
          girl(g, p, T, 860 - step, GY, 0.76, { pose: late ? ACT.pose(t, [[0, 'attend'], [b3 + 0.9, 'point', { act: 0.5 }]]) : ACT.pose(t, [[0, 'walk'], [2.0, 'offer', { act: 0.5 }]], { phase: ACT.stride(step, 0.76) }), ex: { emo: 'tender', gaze: [0.8, 0] }, key: 'cm-g' });
          if (!late) { g.fillStyle = '#b06a3a'; g.beginPath(); g.ellipse(860 - step - 150, GY - 400, 34, 44, 0, 0, TAU); g.fill(); g.fillStyle = '#7a4420'; g.fillRect(860 - step - 168, GY - 452, 36, 14); } }, { lit: 0.2 });
      }
      fin(ctx, T);
    },
    post: POST(0.3, 0.42) });

  // 10 · CLIFF: far off by the river, an old sage with a basket of fruit walks home alone; birds circle over the girl's head
  const cliff = (ctx, T, t, env) => {
    const cam = CAM.drift(CAM.pull(clamp(t / 6.4), { from: 1.26, to: 1.02, focus: [700, 900] }), T, 1.4), d = 110 * (t / 6.4);
    EP51.land(ctx, T, cam, 'riverbank-pearl', { sun: [240, 420, 70], hz: 1000, water: [1040, 1240], dust: 'pollen', seed: 140,
      far: (g, p) => F(g, T, 'kanva', 200 + d, 1035, 0.26, { f: 'right', pose: ACT.pose(t, [[0, 'walk']], { phase: ACT.stride(d, 0.26), prop: 'bundle' }), L: EP51.lit(p, 300, 1000, { front: 0.4 }), ex: { emo: 'calm' }, key: 'cl-s' }),
      figs: (g, p) => { king(g, p, T, 330, GY - 30, 0.7, { pose: { w: { sit: 0.7, attend: 0.3 } }, ex: { emo: 'wonder', gaze: [0.9, -0.2] }, key: 'cl-k' });
        girl(g, p, T, 800, GY - 40, 0.72, { pose: 'attend', ex: { emo: 'tender', gaze: [0.6, 0] }, key: 'cl-g' });
        for (let i = 0; i < 5; i++) { const a = T * 1.1 + i * 1.26; EP51.bird(g, i % 2 ? 'parrot' : 'small', 800 + 170 * Math.cos(a), 480 + 60 * Math.sin(a), 0.7, { fly: 1, T, dir: Math.sin(a) > 0 ? -1 : 1 }); } } });
    TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 110 });
    fin(ctx, T);
  };
  R.scene({ id: 'cliff', transition: { type: 'brush', dur: 0.5, angle: -0.15, color: '#e4eef8' }, draw(ctx, t, env) { cliff(ctx, env.T, t, env); }, post: POST(0.3, 0.42) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, 5.53 + t, env) });
})();
