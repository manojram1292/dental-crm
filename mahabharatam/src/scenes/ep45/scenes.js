/* Episode 45 · Half a Life (CE Adi 1.9.1–22; Shunaka: 1.5.8, 1.8.2). One scene per line of script/ep45.en.json.
 * Loads after ep41/_common (EP41) and ep44/_common (EP44). Staging rule (snake and man): a waist-up two-shot on clear ground,
 * the snake two body-widths in front of him, rearing on an S-curve to his chest height. EP45.wood: the dry wood at noon. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41, EP44 = window.EP44;
  const { TAU, clamp, lerp, E, hash } = R;
  const GY = EP41.GY, HZ = EP41.HZ;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const names = (env, n) => [n, env.script.names[n]];
  const EP45 = (window.EP45 = window.EP45 || {});

  // the messenger of the gods: a luminous figure in a shaft of pale gold
  const shaft = (g, x, a, w = 300) => { if (a <= 0) return; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.45 * a; g.fillStyle = '#ffe9b0'; g.beginPath(); g.moveTo(x - w * 0.45, -600); g.lineTo(x + w * 0.45, -600); g.lineTo(x + w * 0.8, 1500); g.lineTo(x - w * 0.8, 1500); g.closePath(); g.fill(); g.restore(); KIT.glow(g, x, 500, 800 * a, '#ffe9b0', 0.45 * a); };
  const messenger = (g, T, x, y, s, pose, ex, key) => CH.devaduta.draw(g, { x, y, scale: s, facing: 'right', pose, light: { dir: -Math.PI / 2, intensity: 1.4, front: 1, fill: 0.8, tint: ['#fff6d8', 0.5] }, expression: ex, t: T, key: key || 'dd' });
  const ruruL = (p, x, k = 0) => ({ ...ST.light(p, { from: [300, 200], at: [x, GY], front: 0.4 + 0.4 * k, k: 1.15 }), tint: ['#ffe9b0', 0.5 * k] });
  // the thread of a life: gold, with a mark at its middle; part = 0..1 the half drifting away
  const thread = (g, T, x0, x1, y, a, part = 0) => { if (a <= 0) return; const xm = (x0 + x1) / 2; g.save(); g.globalAlpha = a; g.strokeStyle = '#ffe08a'; g.lineWidth = 7; g.lineCap = 'round'; g.shadowColor = '#ffd070'; g.shadowBlur = 18;
    const seg = (a0, a1, dy) => { g.beginPath(); for (let i = 0; i <= 24; i++) { const u = i / 24, x = lerp(a0, a1, u); g.lineTo(x, y + dy + 10 * Math.sin(u * 8 + T * 2)); } g.stroke(); };
    seg(x0, xm - 6 * part, 0); seg(xm + 6 * part - 240 * part, x1 - 240 * part, -260 * part);
    g.fillStyle = '#fff6d8'; g.beginPath(); g.arc(xm - 240 * part * 0, y + 10 * Math.sin(4 + T * 2), 13 * (1 - part), 0, TAU); g.fill(); g.restore(); };

  // 1 · HOOK: the messenger in his shaft of light, a hand held out, open; Ruru small below, looking up
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.9, cam = CAM.drift(CAM.tilt(E.outCubic(clamp(t / 2.6)), { from: -330, to: 30, zoom: 1.16 }), T, 0.5);
      ST.shot(ctx, T, { pal: 'messenger-dawn', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ }) },
        { z: 0.3, draw: (g, p) => ST.treeline(g, p, { y: HZ + 10, h: 900, gap: 320, T, seed: 41, kind: 'sal' }) },
        { z: 0.6, haze: false, draw: (g) => shaft(g, 300, 1, 380) },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
          messenger(g, T, 290, GY - 120 + 14 * Math.sin(T * 1.2), 1.0, ACT.pose(t, [[0, 'stand'], [b0 - 0.4, 'bless', { act: 0.5 }]]), { emo: 'calm', speak: EP41.mouth(env, t), gaze: [0.6, 0.5] });
          CH.ruru.draw(g, { x: 950, y: GY + 16, scale: 0.86, facing: 'left', pose: ACT.pose(t, [[0, 'grieve'], [b0, 'attend', { act: 0.4 }]], { prop: false }), light: { ...ruruL(p, 950, 0), front: 0.06, fill: 0 }, expression: { emo: 'wonder', gaze: [0.5, -0.9], look: -0.2 }, t: T, key: 'hk-r' }); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'pollen', count: 40, cam }) },
        { z: 1.9, haze: false, soft: 0.35, draw: (g, p) => ST.trunks(g, p, { xs: [-240, 1320], w: 200 }) },
      ] });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, clamp(t / 0.2), line.text, { y: 1480, size: 76, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.15) / 0.6);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 1500, key: 'ep45-title' });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.42, vignette: 0.45, paper: 0.3 }) });

  // 2 · DEAD: she lies as if asleep among fallen flowers, the colour drained; a pull back
  R.scene({ id: 'dead', transition: { type: 'smoke', dur: 0.7, dir: -Math.PI / 2, color: '#9a9aa0' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.pull(clamp(t / env.dur), { from: 1.3, to: 1.02, focus: [760, 960] });
      EP44.greyBed(ctx, T, cam, 1, { by: 1010 });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 3.2) / 0.4)), env.strings, { y: 190 });
      TY.plaque(ctx, T, clamp((t - 1.0) / 0.6), ...names(env, 'Pramadvara'), { x: 300, y: 620, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.2, vignette: 0.5, paper: 0.32 }) });

  // the night wood for the close-ups
  const nightFace = (ctx, T, cam, draw, extra) => ST.shot(ctx, T, { pal: 'grief-blue', cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500 }) },
    { z: 0.3, soft: 0.45, draw: (g, p) => ST.treeline(g, p, { y: 1500, h: 1500, gap: 400, T, seed: 43, kind: 'sal' }) },
    { z: 0.7, haze: false, draw: (g) => { if (extra) extra(g); } },
    { z: 1, haze: false, draw: (g, p) => draw(g, p) },
    { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 20, cam }) },
  ] });
  const face = (g, p, T, t, emo, lead, lit, speak, key) => CH.ruru.draw(g, { x: 660, y: 3040, scale: 2.5, facing: 'left', pose: ACT.pose(t, [[0, 'stand']], { prop: false }), light: { ...ST.light(p, { from: [200, 200], at: [600, 1200], k: 1.15, front: 0.7 }), tint: ['#ffe9b0', 0.5 * (lit || 0)] }, expression: { emo, speak, ...lead }, t: T, key });

  // 3 · LAMENT (close-up, first half): his face lifted in the blue night: sorrow, then pleading
  R.scene({ id: 'lament', transition: { type: 'ink', dur: 0.7, at: [600, 760], color: '#1c2a52' },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 3.5, cam = CAM.drift(CAM.push(t / env.dur, { from: 1.0, to: 1.24, focus: [560, 700] }), T, 2.2);
      nightFace(ctx, T, cam, (g, p) => face(g, p, T, t, ACT.emo(t, [[0, 'sorrow'], [b1 - 0.3, 'fear', { dur: 0.5 }]]), ACT.lead(t, [[0, [0.3, 0.5]], [0.5, [0.4, -0.9]], [b1, [0.1, -1]], [b1 + 1.2, [0.5, -0.7]]], 0.5, 0.3), 0, EP41.mouth(env, t), 'lm-r'));
      TY.plaque(ctx, T, clamp((t - 0.5) / 0.6), ...names(env, 'Ruru'), { x: 300, y: 250, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.22, vignette: 0.5, paper: 0.3 }) });

  // 4 · CAME: pale gold fills the frame: the messenger comes down; a crane down with him
  R.scene({ id: 'came', transition: { type: 'lamp', dur: 0.8, from: [600, 700], to: [420, 500] },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.5, b1 = env.beats[1] ?? 2.5, k = E.outCubic(clamp((t - b0) / (b1 - b0))), cam = CAM.crane(t / env.dur, { from: 1.25, to: 1.05, y0: -420, y1: 20 });
      ST.shot(ctx, T, { pal: 'messenger-dawn', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ }) },
        { z: 0.3, draw: (g, p) => ST.treeline(g, p, { y: HZ + 10, h: 900, gap: 320, T, seed: 41, kind: 'sal' }) },
        { z: 0.6, haze: false, draw: (g) => shaft(g, 300, clamp(t / 0.5), 380) },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
          messenger(g, T, 290, lerp(GY - 900, GY - 120, k) + 14 * Math.sin(T * 1.2), 1.0, ACT.pose(t, [[0, 'stand'], [b1 - 0.2, 'bless', { act: 0.5 }]], { wind: 1 - k }), { emo: 'calm', gaze: [0.6, 0.5] });
          CH.ruru.draw(g, { x: 950, y: GY + 16, scale: 0.86, facing: 'left', pose: ACT.pose(t, [[0, 'grieve'], [b0 + 0.2, 'attend', { act: 0.4 }]], { prop: false }), light: { ...ruruL(p, 950, 0), front: 0.06, fill: 0 }, expression: { emo: ACT.emo(t, [[0, 'sorrow'], [b0, 'shock'], [b1, 'wonder']]), gaze: [0.5, -0.8], look: -0.2 }, t: T, key: 'cm-r' }); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'pollen', count: 40, cam }) },
        { z: 1.9, haze: false, soft: 0.35, draw: (g, p) => ST.trunks(g, p, { xs: [-240, 1320], w: 200 }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.42, vignette: 0.45, paper: 0.3 }) });

  // 5 · VAIN: a slow orbit round the two: Ruru dark blue against the night, the messenger the only light; between them a life
  R.scene({ id: 'vain', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 4.5, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 130, zoom: 1.12 });
      EP44.night(ctx, T, cam, { far: (g) => shaft(g, 210, 0.7, 320), figs: (g, p) => {
        messenger(g, T, 200, GY - 110 + 14 * Math.sin(T * 1.2), 0.98, ACT.pose(t, [[0, 'speak'], [b1 - 0.3, 'bless', { act: 0.6 }]]), { emo: 'calm', speak: EP41.mouth(env, t), gaze: [0.7, 0.3] });
        CH.ruru.draw(g, { x: 930, y: GY + 16, scale: 0.94, facing: 'left', pose: ACT.pose(t, [[0, 'grieve'], [b1, 'attend', { act: 0.5 }]], { prop: false }), light: { ...ruruL(p, 930, 1), intensity: 1.4, front: 0.95 }, expression: { emo: ACT.emo(t, [[0, 'sorrow'], [b1, 'wonder']]), ...ACT.lead(t, [[0, [0.3, 0.6]], [b1 - 0.2, [0.9, -0.2]]]) }, t: T, key: 'vn-r' });
        thread(g, T, 420, 760, GY - 560, E.outCubic(clamp((t - b1 + 0.2) / 0.6)));
      } });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.3 }) });

  // 6 · GIVE (the turn, after a silence; the signature shot; close-up, second half): grief settles into resolve; the thread parts
  R.scene({ id: 'give', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.6, b1 = env.beats[1] ?? 3.3, sp0 = env.speech[0], cam = CAM.push(t / env.dur, { from: 1.0, to: 1.12, focus: [560, 760] }), part = E.inOutSine(clamp((t - b1) / 1.0));
      nightFace(ctx, T, cam, (g, p) => { face(g, p, T, t, ACT.emo(t, [[0, 'sorrow'], [sp0 - 0.4, 'resolve', { dur: 0.5 }]]), ACT.lead(t, [[0, [0.3, -0.6]], [sp0 - 0.5, [0.8, 0]]], 0.4, 0.2), 0.6, EP41.mouth(env, t), 'gv-r'); thread(g, T, -60, 420, 1260, 1, part); },
        (g) => KIT.glow(g, 60, 900, 900, '#ffe9b0', 0.35));
      TY.turnWord(ctx, T, clamp((t - b1) / 0.7), 'Half', { x: 250, y: 330, size: 92, out: clamp((t - (env.dur - 0.3)) / 0.3), sub: 'Adi 1.9.11' });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.5, paper: 0.3 }) });

  // 7 · COURT: Dharmaraja's court, black and copper: a tilt down a great stair; two bright figures small before the seated king;
  //     his staff comes down on his name (foley: staff@1); on "He agreed" his open hand lifts (sfx: bell-low@2)
  R.scene({ id: 'court', transition: { type: 'smoke', dur: 0.7, dir: Math.PI / 2, color: '#3a1a10' },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 5.6, b2 = env.beats[2] ?? 7.3, cam = CAM.tilt(E.inOutSine(clamp(t / 2.3)), { from: -560, to: 30, zoom: 1.14 }), fl = KIT.flicker(T, 4);
      const strike = Math.sin(Math.PI * clamp((t - b1 + 0.2) / 0.3));
      ST.shot(ctx, T, { pal: 'dharma-copper', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -900, 0, GY); gr.addColorStop(0, '#050302'); gr.addColorStop(0.6, '#1c0c06'); gr.addColorStop(1, '#5a240c'); g.fillStyle = gr; g.fillRect(-900, -1200, 2880, 3400);
          for (let i = 0; i < 6; i++) { const x = -300 + i * 340; g.fillStyle = '#0c0604'; g.fillRect(x - 46, -1200, 92, GY + 1200); g.fillStyle = 'rgba(224,120,50,0.22)'; g.fillRect(x - 46, -1200, 10, GY + 1200); }
          for (let i = 0; i < 9; i++) { const y = GY - 1150 + i * 110, w = 420 + i * 70; g.fillStyle = i % 2 ? '#241008' : '#1a0a05'; g.fillRect(540 - w, y, 2 * w, 112); g.fillStyle = 'rgba(224,120,50,0.25)'; g.fillRect(540 - w, y, 2 * w, 5); } } },   // the stair
        { z: 0.6, haze: false, draw: (g) => { KIT.glow(g, 540, GY - 120, 900, '#e0702a', 0.45 * fl); KIT.glow(g, 160, GY - 700, 240, '#3ad0c0', 0.5); g.fillStyle = '#7af0e0'; g.beginPath(); g.ellipse(160, GY - 700, 12, 26, 0, 0, TAU); g.fill(); } },   // one teal lamp
        { z: 1, haze: false, draw: (g, p) => { g.fillStyle = '#160804'; g.fillRect(-900, GY - 20, 2880, 1200);
          g.fillStyle = '#2a1208'; g.fillRect(360, GY - 390, 360, 390); g.fillStyle = 'rgba(224,120,50,0.4)'; g.fillRect(360, GY - 390, 360, 8);
          CH.dharma.draw(g, { x: 540, y: GY - 380, scale: 1.0, facing: 'left', pose: { w: { sit: 1 }, prop: 'staff' }, light: { dir: Math.PI / 2, intensity: 1.3 * fl, front: 0.55, fill: 0.2, wrap: 0.6, tint: ['#ff9a50', 0.7], bounce: ['#2a8a80', 0.25], minLum: 0 }, expression: { emo: 'resolve', gaze: [0.6, 0.5] }, t: T, key: 'ct-d' });
          g.save(); g.translate(0, -30 * strike); g.restore();
          const come = E.outCubic(clamp((t - 2.3) / 1.6));
          if (t > 2.3) CH.vishvavasu.draw(g, { x: 60 + 70 * come, y: GY - 60, scale: 0.66, facing: 'right', pose: 'anjali', light: { dir: -Math.PI / 2, intensity: 1.3, front: 0.9, fill: 0.6 }, expression: { emo: 'sorrow' }, t: T, key: 'ct-v' });
          if (t > 2.3) messenger(g, T, 215 + 70 * come, GY - 70, 0.66, 'speak', { emo: 'calm' }, 'ct-m');
          if (strike > 0.05) { g.save(); g.strokeStyle = 'rgba(255,190,110,' + 0.8 * strike + ')'; g.lineWidth = 6; g.beginPath(); g.ellipse(430, GY - 380, 120 * strike, 26 * strike, 0, 0, TAU); g.stroke(); g.restore(); }
        } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 24, cam }) },
      ] });
      TY.plaque(ctx, T, clamp((t - b1 + 0.2) / 0.6), ...names(env, 'Dharmaraja'), { x: 830, y: 800, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      TY.plaque(ctx, T, clamp((t - 2.9) / 0.6), ...names(env, 'Vishvavasu'), { x: 260, y: 1120, out: clamp((t - b1 + 0.4) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.4, vignette: 0.55, paper: 0.3 }) });

  // 8 · WOKE (a second silence before it): dawn colour floods back into the grey; she sits up among the flowers; Ruru kneeling
  R.scene({ id: 'woke', transition: { type: 'brush', dur: 0.6, angle: 0.15, color: '#f4f0c8' },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.1, b1 = env.beats[1] ?? 3.3, cam = CAM.pull(clamp(t / env.dur), { from: 1.2, to: 1.02, focus: [600, 1100] }), up = E.inOutSine(clamp((t - b0) / 1.2));
      EP44.meadow(ctx, T, cam, { hz: 900, sun: [820, 380, 60], figs: (g, p) => {
        g.save(); g.translate(430, 1380); g.rotate((-Math.PI / 2 + 0.06) * (1 - up)); g.translate(-430, -1380);
        CH.pramadvara.draw(g, { x: 430, y: 1380 + 360 * (1 - up), scale: 0.95, facing: 'right', pose: ACT.pose(t, [[0, 'stand'], [b0 + 0.6, 'sit', { act: 0.7 }], [b1, 'attend', { act: 0.6 }]]), light: ST.light(p, { from: [820, 300], at: [430, 1300], front: 0.8, k: 1.2 }), expression: { emo: ACT.emo(t, [[0, 'calm'], [b0 + 0.4, 'wonder'], [b1, 'tender']]), blink: t < b0 ? 1 : 0, gaze: [0.7, 0] }, t: T, key: 'wk-p' });
        g.restore();
        CH.ruru.draw(g, { x: 930, y: 1390, scale: 0.9, facing: 'left', pose: { w: { kneel: 1 }, prop: false }, light: ST.light(p, { from: [820, 300], at: [930, 1300], front: 0.6 }), expression: { emo: ACT.emo(t, [[0, 'sorrow'], [b0 + 0.3, 'shock'], [b1 - 0.4, 'joy']]), gaze: [0.7, 0.2] }, t: T, key: 'wk-r' });
        thread(g, T, 430, 560, 760, Math.sin(Math.PI * clamp((t - b0) / 1.6)));
      } });
      const grey = 1 - E.inOutSine(clamp((t - b0 + 0.2) / 1.2)); if (grey > 0.01) { ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = grey; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore(); }
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.4, paper: 0.3 }) });

  // 9 · SON (Sauti's voice over it): the two walk round the wedding fire, their cloths knotted; in the smoke, a small boy
  R.scene({ id: 'son', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 4.3, cam = CAM.slide(t / env.dur, { from: 120, to: -120, zoom: 1.1 }), fl = KIT.flicker(T, 6), d = 34 * t;
      ST.shot(ctx, T, { pal: 'wedding-turmeric', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ }) },
        { z: 0.3, draw: (g, p) => { ST.treeline(g, p, { y: HZ + 10, h: 620, T, seed: 51, kind: 'flame' }); ST.pillars(g, p, { y: HZ - 10, n: 4 }); } },
        { z: 0.7, haze: false, draw: (g) => { for (let i = 0; i < 14; i++) { const x = -100 + i * 100; g.strokeStyle = '#ffe08a'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, 330); g.quadraticCurveTo(x + 50, 400 + 10 * Math.sin(T + i), x + 100, 330); g.stroke(); g.fillStyle = i % 2 ? '#ff8a3a' : '#fff0c0'; g.beginPath(); g.arc(x + 50, 368, 12, 0, TAU); g.fill(); } } },   // garlands
        { z: 0.8, haze: false, draw: (g) => { KIT.glow(g, 540, GY - 260, 600, '#ff9a2a', 0.4 * fl); CH.hearthfire.draw(g, { x: 540, y: GY - 10, scale: 0.8, t: T, k: 1.0 + 0.15 * Math.sin(Math.PI * clamp(t / 0.5)), key: 'sn-f' });
          EP41.vision(g, 540, 560, 230, T, E.outCubic(clamp((t - b1 + 0.3) / 0.7)), (q) => CH.chyavanaChild.draw(q, { x: 0, y: 150, scale: 0.6, facing: 'left', pose: 'anjali', light: { dir: -Math.PI / 2, intensity: 1, front: 0, fill: 0 }, t: T, key: 'sn-c' })); } },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
          CH.ruru.draw(g, { x: 330 - d, y: GY + 14, scale: 0.98, facing: 'left', pose: ACT.pose(t, [[0, 'walk']], { phase: ACT.stride(d, 0.98 * 0.5), stride: 0.5, prop: false }), light: { ...EP41.lit(330, fl, 0.6), fill: 0.3 }, expression: { emo: 'joy' }, t: T, key: 'sn-r' });
          CH.pramadvara.draw(g, { x: 880 - d, y: GY + 14, scale: 0.95, facing: 'left', pose: ACT.pose(t, [[0, 'walk']], { phase: ACT.stride(d, 0.95 * 0.5) + 1.2, stride: 0.5 }), light: { ...EP41.lit(880, fl, 0.6), fill: 0.3 }, expression: { emo: 'joy', gaze: [0.6, 0.2] }, t: T, key: 'sn-p' }); } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 26, box: [300, 300, 480, 900], cam }) },
      ] });
      TY.plaque(ctx, T, clamp((t - b1) / 0.6), ...names(env, 'Shunaka'), { x: 540, y: 1250, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.38, vignette: 0.45, paper: 0.3 }) });

  EP45.wood = EP44.wood;
  // 10 · CLIFF: he swears; he raises his staff over the old snake (staff@0 on "swore": his hand closes on it); it rears and speaks
  const cliff = (ctx, T, t, env, b) => {
    const cam = CAM.mix(CAM.rack(clamp((t - b[1] + 0.3) / 0.9), { from: 1.0, to: 1.0, zoom: 1.0 }), CAM.push(clamp(t / 6.5), { from: 1.14, to: 1.3, focus: [600, 1050] }));
    EP45.wood(ctx, T, cam, (g, p) => {
      CH.ruru.draw(g, { x: 840, y: GY + 10, scale: 1.08, facing: 'left', pose: ACT.pose(t, [[0, 'stand'], [b[0] - 0.2, 'attend', { act: 0.3 }], [b[2] - 0.6, 'raise', { act: 0.5, an: 0.1 }], [b[3] - 0.1, 'recoil', { act: 0.4 }]], { prop: 'staff' }), light: ST.light(p, { from: [300, 300], at: [840, GY], front: 0.08, fill: 0 }), expression: { emo: ACT.emo(t, [[0, 'wrath'], [b[3], 'wonder']]), gaze: [0.2, 0.6] }, t: T, key: 'cl-r' });
      CH.dundubha.draw(g, { x: 290, y: GY - 30, scale: 0.95, facing: 'right', pose: { name: 'rise', k: lerp(0.62, 1, E.inOutSine(clamp((t - b[1] - 0.2) / 1.6))) }, light: ST.light(p, { from: [300, 300], at: [290, GY], front: 0.05, fill: 0, k: 1.0 }), expression: { speak: t > b[3] - 0.2 ? 0.5 + 0.5 * Math.sin(T * 12) : 0 }, t: T, key: 'cl-s' });
    });
    TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 110 });
    fin(ctx, T);
  };
  const CL = { dur: 6.52, b: [0.5, 2.03, 3.24, 5.4] };
  R.scene({ id: 'cliff', transition: { type: 'dissolve', dur: 0.35 }, draw(ctx, t, env) { cliff(ctx, env.T, t, env, env.beats.length > 3 ? env.beats : CL.b); }, post: () => ({ bloom: 0.26, vignette: 0.45, paper: 0.3 }) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, CL.dur + t, env, CL.b) });
})();
