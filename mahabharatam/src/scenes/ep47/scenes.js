/* Episode 47 · Vyasa Comes to the Sacrifice (CE Adi 1.53.27–36, 1.54.1–24, 1.55.1). One scene per line of script/ep47.en.json.
 * Loads after ep41/_common (EP41.naimisha) and ep46/_common (EP46.hall). The rite is in session (the fire is high); no
 * manuscript is drawn (an oral recital); Vyasa is the dark, island-born sage with the soft gold halo of episodes 4 and 40. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41, EP46 = window.EP46;
  const { TAU, clamp, lerp, E, hash } = R;
  const GY = EP41.GY, HZ = EP41.HZ;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const names = (env, n) => [n, env.script.names[n]];
  const talk = (env, t) => EP41.mouth(env, t);
  const EP47 = window.EP47;
  // Vyasa's light: he carries his own (a pale gold on the dark body), so he stands off the hall wherever he is
  const VL = (k = 1) => ({ dir: -Math.PI / 2 - 0.4, intensity: 1.35 * k, front: 0.92, fill: 0.6, tint: ['#fff0c8', 0.45], minLum: 0.3 });
  const vyasa = (g, T, x, y, s, pose, ex, facing, key) => CH.vyasaSage.draw(g, { x, y, scale: s, facing: facing || 'left', pose, light: VL(), expression: ex || { emo: 'calm' }, t: T, key: key || 'vy' });
  const student = (g, T, x, y, s, pose, ex, fl, facing, key, L) => CH.vaishampayanaSage.draw(g, { x, y, scale: s, facing: facing || 'left', pose, light: L || { ...EP46.lit(x, fl, 0.75, 250), fill: 0.35 }, expression: ex || { emo: 'calm' }, t: T, key: key || 'vs' });
  const king = (g, T, x, y, s, pose, ex, fl, facing, key, front) => CH.kingJanamejaya.draw(g, { x, y, scale: s, facing: facing || 'right', pose, light: EP46.lit(x, fl, front ?? 0.55, 250), expression: ex || { emo: 'calm' }, t: T, key: key || 'kg' });

  // THE ARRIVAL: the long hall seen down its length: pairs of painted pillars with a lamp on each, a doorway of lamp-light at
  // the far end, and the dark sage with the gold halo walking up it toward the fire; his students behind him
  EP47.arrival = (ctx, T, cam, k, o = {}) => {
    const fl = KIT.flicker(T, 11), s = lerp(0.34, 1.06, k), x = lerp(600, 560, k), y = lerp(1180, GY + 60, k);
    ST.shot(ctx, T, { pal: 'arrival-umber-gold', cam, layers: [
      { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -400, 0, 1500); gr.addColorStop(0, '#0a0503'); gr.addColorStop(0.6, '#2a1608'); gr.addColorStop(1, '#5a3410'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720);
        g.fillStyle = '#ffe2a0'; g.beginPath(); g.moveTo(400, 1140); g.lineTo(400, 640); g.quadraticCurveTo(580, 460, 760, 640); g.lineTo(760, 1140); g.closePath(); g.fill(); KIT.glow(g, 580, 900, 700, '#ffcf7a', 0.6 * fl); } },   // the far doorway
      { z: 0.3, draw: (g, p) => { ST.pillars(g, p, { y: 1330, n: 6, x0: 900, x1: 250 });
        for (let i = 0; i < 6; i++) for (const sg of [-1, 1]) { const u = i / 5, lx = 540 + sg * lerp(900, 250, u) * 0.86, ly = lerp(700, 960, u); KIT.glow(g, lx, ly, lerp(200, 60, u), '#ffb050', 0.55 * KIT.flicker(T, i + (sg > 0 ? 7 : 0))); g.fillStyle = '#ffe9b0'; g.beginPath(); g.ellipse(lx, ly, lerp(10, 4, u), lerp(22, 8, u), 0, 0, TAU); g.fill(); } } },
      { z: 0.6, haze: false, draw: (g) => { g.fillStyle = '#1a0c04'; g.beginPath(); g.moveTo(-900, 1960); g.lineTo(-900, 1300); g.lineTo(470, 1130); g.lineTo(690, 1130); g.lineTo(1980, 1300); g.lineTo(1980, 1960); g.closePath(); g.fill();   // the floor, and the lamp-light running down it
        g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.28 * fl; g.fillStyle = '#ffb050'; g.beginPath(); g.moveTo(480, 1130); g.lineTo(680, 1130); g.lineTo(1200, 1960); g.lineTo(-40, 1960); g.closePath(); g.fill(); g.restore(); } },
      { z: 0.5, haze: false, draw: (g) => { if (o.students === false) return;   // his students, small in the far doorway behind him
        for (const [sx, ph] of [[530, 1.3], [640, 2.6]]) CH.vaishampayanaSage.draw(g, { x: sx, y: 1140, scale: 0.17, facing: 'left', pose: ACT.pose(0, [[0, 'walk']], { phase: (o.phase || 0) * 0.5 + ph, stride: 0.4, prop: false }), light: { dir: -Math.PI / 2, intensity: 1.3, front: 0.03, fill: 0 }, expression: { emo: 'calm' }, t: T, key: 'ar-s' + ph }); } },
      { z: 1, haze: false, draw: (g) => { if (!o.dark) { g.save(); g.globalAlpha = 0.9; const hg = g.createRadialGradient(x, y - 560 * s, 60 * s, x, y - 560 * s, 760 * s); hg.addColorStop(0, '#fff0c0'); hg.addColorStop(0.55, 'rgba(255,200,110,0.85)'); hg.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = hg; g.fillRect(x - 800 * s, y - 1400 * s, 1600 * s, 1700 * s); g.restore(); }   // he walks in his own light: a dark, rimmed figure against it
        CH.vyasaSage.draw(g, { x, y, scale: s, facing: 'left', pose: o.pose || ACT.pose(0, [[0, 'walk']], { phase: o.phase || 0, stride: 0.7, prop: false }), light: o.dark ? { dir: -Math.PI / 2, intensity: 1.2, front: 0.03, fill: 0 } : { dir: -Math.PI / 2 - 0.5, intensity: 1.2, front: 0.07, fill: 0, wrap: 0.6, tint: ['#ffcf7a', 0.6] }, expression: o.ex || { emo: 'calm', gaze: [0.6, 0.1] }, t: T, key: 'ar-v' }); } },
      { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 34, cam }) },
      { z: 2.0, haze: false, soft: 0.3, draw: (g) => { if (o.heads === false) return; g.fillStyle = '#050302';   // near: the assembly's heads, turned to him
        for (const [hx, r] of [[-40, 150], [230, 120], [870, 124], [1120, 150]]) { g.beginPath(); g.ellipse(hx, 1960, r * 1.5, r * 1.9, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(hx + (hx < 540 ? 26 : -26) * (o.turn ?? 1), 1960 - r * 2.3, r * 0.62, 0, TAU); g.fill(); } } },
    ] });
  };

  // 1 · HOOK: far off between the pillars and coming on, a tall dark figure with a soft gold halo; his face not yet seen
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.5, cam = CAM.drift(CAM.push(clamp(t / 3.6), { from: 1.22, to: 1.5, focus: [620, 1040], ease: E.outCubic }), T, 0.5);
      EP47.arrival(ctx, T, cam, 0.02 + 0.09 * clamp(t / 4), { dark: true, phase: t * 3.2, students: false, turn: E.outCubic(clamp((t - b0 + 0.15) / 0.3)) });   // every head turns on "poet" (foley: cloth@0)
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, clamp(t / 0.2), line.text, { y: 1440, size: 72, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.15) / 0.6);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 1480, key: 'ep47-title' });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.44, vignette: 0.55, paper: 0.3 }) });

  // 2 · SAT: the hall at night in teal: a crane down over the seated ranks to the king; the fire high and to one side
  const teal = (ctx, T, cam, figs, o = {}) => EP46.hall(ctx, T, cam, { pal: 'satra-teal-night', fx: o.fx ?? 130, fire: 1.05, fs: o.fs ?? 0.9, glow: 0.16, figs, key: 'teal', ...o });
  R.scene({ id: 'sat', transition: { type: 'smoke', dur: 0.7, dir: -Math.PI / 2, color: '#1a4a5a' },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.6, cam = CAM.crane(t / env.dur, { from: 1.0, to: 1.22, y0: -330, y1: 40, x0: -40, x1: 60 });
      teal(ctx, T, cam, (g, p, fl) => king(g, T, 640, GY - 40, 0.96, { w: { sit: 1 } }, { emo: 'resolve', gaze: [0.6, 0.3] }, fl, 'left', 'st-k'));
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 3.2) / 0.4)), env.strings, { y: 190 });
      TY.plaque(ctx, T, clamp((t - b0) / 0.6), ...names(env, 'Janamejaya'), { x: 330, y: 400, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.38, vignette: 0.5, paper: 0.3 }) });

  // 3 · CAME (THE SIGNATURE SHOT): through a carved arch, the whole length of the hall: he walks up it out of the lamp-light,
  //     dark-skinned, grey jata, the gold halo, his students behind; the name arrives on "Vyasa"
  R.scene({ id: 'came', transition: { type: 'lamp', dur: 0.8, from: [300, 900], to: [580, 900] },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 3.7, k = E.inOutSine(clamp(t / (b1 + 0.2))), stop = clamp((t - b1) / 0.5);
      ST.within(ctx, T, { shape: 'arch', pal: 'arrival-umber-gold', box: [60, 150, 960, 1330], open: 1, draw: (c2) =>
        EP47.arrival(c2, T, CAM.push(k, { from: 1.0, to: 1.12, focus: [570, 900] }), 0.2 + 0.8 * k, { phase: t * 3.4, pose: ACT.pose(t, [[0, 'walk'], [b1, 'stand', { act: 0.5 }]], { phase: t * 3.4 * (1 - stop), stride: 0.7, prop: false }), ex: { emo: 'calm', ...ACT.lead(t, [[0, [0.5, 0.2]], [b1 - 0.4, [0.8, 0]]]) } }) });
      TY.plaque(ctx, T, clamp((t - b1) / 0.5), ...names(env, 'Vyasa'), { x: 220, y: 245, out: clamp((t - (env.dur - 0.35)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }) });

  // 4 · WHO (Sauti's voice): an island in a river in mist, a dark child standing on it in his own light
  R.scene({ id: 'who', transition: { type: 'ink', dur: 0.8, at: [540, 1000], color: '#3a2e70' },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.4, cam = CAM.slide(t / env.dur, { from: 130, to: -130, zoom: 1.14 }), a = E.outCubic(clamp((t - b0 + 0.2) / 0.6));
      EP47.island(ctx, T, cam, 'mist-lavender', (g) => { if (a <= 0) return; KIT.glow(g, 540, 1080, 520 * a, '#ffd060', 0.5 * a);
        g.save(); g.beginPath(); g.rect(-200, 1262 - 700 * a, 1500, 700 * a + 20); g.clip(); CH.vyasaChild.draw(g, { x: 540, y: 1262, scale: 0.95, facing: 'left', pose: 'stand', light: { dir: -Math.PI / 2, intensity: 1.3, front: 0.6, fill: 0.3, tint: ['#ffd060', 0.5] }, expression: { emo: 'calm' }, t: T, key: 'wh-c' }); g.restore(); });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.45, paper: 0.34 }) });

  // 5 · GRAND: a tilt down a painted family tree: Vyasa at the top; at the foot two lines of small armed figures facing each other
  R.scene({ id: 'grand', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.5, cam = CAM.tilt(E.inOutSine(clamp(t / 2.8)), { from: -520, to: 40, zoom: 1.1 }), grow = E.inOutSine(clamp((t - 0.2) / 2.2));
      ST.shot(ctx, T, { pal: 'war-iron', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500 }) },
        { z: 0.3, draw: (g, p) => ST.hills(g, p, { y: 1500, h: 300, seed: 71 }) },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: 1300 });
          g.save(); g.strokeStyle = '#e7b54a'; g.lineWidth = 9; g.lineCap = 'round'; const yT = 60, yM = 520, yB = lerp(yT, 900, grow);   // the tree: one line down, then two
          g.beginPath(); g.moveTo(540, yT); g.lineTo(540, Math.min(yB, yM)); g.stroke();
          if (yB > yM) for (const sg of [-1, 1]) { g.beginPath(); g.moveTo(540, yM); g.quadraticCurveTo(540 + sg * 300, yM + 40, 540 + sg * 300, Math.min(yB, 900)); g.stroke(); }
          g.restore();
          KIT.glow(g, 540, -160, 420, '#ffcf7a', 0.4); vyasa(g, T, 540, 60, 0.5, 'bless', { emo: 'calm' }, 'left', 'gr-v');
          const side = (sg, n, col) => { for (let i = 0; i < n; i++) { const x = 540 + sg * (150 + i * 95), a2 = clamp((grow - 0.75) * 6 - i * 0.2); if (a2 <= 0) continue; CH.kuruPrince.draw(g, { x, y: 1290 + 8 * (i % 2), scale: 0.36, facing: sg < 0 ? 'right' : 'left', pose: ACT.pose(t, [[0, 'stand'], [b0 + 2.2, 'point', { act: 0.3 }]]), light: { dir: -Math.PI / 2, intensity: 1.2, front: 0.9, fill: 0.5, tint: [col, 0.5] }, expression: { emo: 'wrath' }, t: T + i, key: 'gr-' + sg + i }); } };
          side(-1, 5, '#ffd9a0'); side(1, 5, '#c8d0ff');
        } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 30, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.5, paper: 0.3 }) });

  // 6 · SEAT: the hall's pale stone at lamp height: the king rises (cloth@0); the golden seat; water for the guest's feet (pot@1)
  const ivory = (ctx, T, cam, figs) => EP46.hall(ctx, T, cam, { pal: 'seat-ivory', fx: -200, fire: 0.9, fs: 0.8, glow: 0.2, crowd: 0.6, figs, key: 'iv' });
  const seat = (g, x, y) => { g.fillStyle = '#c8902a'; g.fillRect(x - 130, y - 150, 260, 150); g.fillStyle = '#ffe08a'; g.fillRect(x - 140, y - 164, 280, 22); g.fillRect(x - 130, y - 150, 14, 150); g.fillRect(x + 116, y - 150, 14, 150); g.fillStyle = '#8a2a14'; g.fillRect(x - 120, y - 190, 240, 30); };
  R.scene({ id: 'seat', transition: { type: 'brush', dur: 0.5, angle: -0.2, color: '#f4e8c8' },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1, b1 = env.beats[1] ?? 2.8, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 120, zoom: 1.08, y: 190 });
      ivory(ctx, T, cam, (g, p, fl) => {
        seat(g, 320, GY + 10);
        CH.vyasaSage.draw(g, { x: 320, y: GY - 150, scale: 0.98, facing: 'right', pose: ACT.pose(t, [[0, 'stand'], [b0 + 0.5, 'sit', { act: 0.8 }]], { prop: false }), light: { dir: -0.6, intensity: 1.1, front: 0.12, fill: 0.04, tint: ['#ffb050', 0.5] }, expression: { emo: 'calm', gaze: [0.7, 0.1] }, t: T, key: 'se-v' });   // dark against the pale stone
        king(g, T, 860, GY + 10, 0.98, ACT.pose(t, [[0, 'sit'], [b0 - 0.25, 'stand', { act: 0.4, antic: 0.2 }], [b0 + 0.7, 'offer', { act: 0.6 }], [b1 + 0.6, 'anjali', { act: 0.6 }]], { wind: 0.5 }), { emo: 'wonder', gaze: [0.8, 0.1] }, fl, 'left', 'se-k', 0.04);
        const w = clamp((t - b1) / 0.7); if (w > 0 && w < 1) { g.save(); g.strokeStyle = '#d8f0ff'; g.lineWidth = 8; g.lineCap = 'round'; g.globalAlpha = 1 - w * 0.5; g.beginPath(); g.moveTo(560, GY - 330); g.quadraticCurveTo(480, GY - 240, 440, GY - 330 + 330 * w); g.stroke(); g.restore(); }
        g.fillStyle = '#c8902a'; g.beginPath(); g.ellipse(580, GY - 340, 44, 54, 0.3, 0, TAU); g.fill();
      });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.42, paper: 0.3 }) });

  // 7 · ASKED: the king, hands joined, the fire's light on him from the side; the assembly behind
  R.scene({ id: 'asked', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.5, cam = CAM.push(t / env.dur, { from: 1.2, to: 1.42, focus: [640, 700] });
      teal(ctx, T, cam, (g, p, fl) => king(g, T, 640, GY + 10, 1.12, ACT.pose(t, [[0, 'anjali'], [b0 + 1.6, 'speak', { act: 0.5 }]]), { emo: ACT.emo(t, [[0, 'wonder'], [b0, 'sorrow']]), speak: talk(env, t), gaze: [0.8, 0] }, fl, 'left', 'as-k', 0.75), { fx: 60, fs: 0.8 });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.38, vignette: 0.5, paper: 0.3 }) });

  // 8 · TURNED (the turn, after a silence; the close-up): Vyasa's face, gold on blue-black: weary, then a small warmth; his eye
  //     goes from the king to the student beside him, and the head follows
  const closeHall = (ctx, T, cam, draw) => ST.shot(ctx, T, { pal: 'arrival-umber-gold', cam, layers: [
    { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -400, 0, 1920); gr.addColorStop(0, '#0a0604'); gr.addColorStop(1, '#3a200c'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); } },
    { z: 0.3, soft: 0.5, draw: (g, p) => { ST.pillars(g, p, { y: 1700, n: 4 }); for (const lx of [150, 930]) { KIT.glow(g, lx, 700, 300, '#ffb050', 0.5 * KIT.flicker(T, lx)); } } },
    { z: 1, haze: false, draw: (g, p) => draw(g, p) },
    { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 18, cam }) },
  ] });
  R.scene({ id: 'turned', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 2, b1 = env.beats[1] ?? 3.4, cam = CAM.drift(CAM.push(t / env.dur, { from: 1.0, to: 1.14, focus: [520, 720] }), T, 1.2);
      closeHall(ctx, T, cam, (g) => CH.vyasaSage.draw(g, { x: 640, y: 2930, scale: 2.4, facing: 'left', pose: ACT.pose(t, [[0, 'stand']], { prop: false }), light: VL(1.05),
        expression: { emo: ACT.emo(t, [[0, 'sorrow'], [b0 - 0.2, 'calm', { dur: 0.6 }], [b1, 'tender', { dur: 0.7 }]]), ...ACT.lead(t, [[0, [0.9, 0.1]], [b0 + 0.25, [0.9, 0.5]], [b1 - 0.3, [-0.8, 0.3]]], 0.45, 0.2) }, t: T, key: 'tu-v' }));
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.5, paper: 0.3 }) });

  // 9 · TELL: a rack focus from Vyasa's raised hand to the young man beside him, who looks up, startled
  R.scene({ id: 'tell', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1, cam = CAM.rack(clamp((t - b0 - 0.3) / 0.9), { from: 1.3, to: 1.0, zoom: 1.08, x: 0, y: 20, soft: 0.6 });
      const fl = KIT.flicker(T, 3);
      ST.shot(ctx, T, { pal: 'arrival-umber-gold', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -400, 0, 1920); gr.addColorStop(0, '#0a0604'); gr.addColorStop(1, '#4a2a10'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); } },
        { z: 0.3, draw: (g, p) => { ST.pillars(g, p, { y: 1380, n: 5 }); KIT.glow(g, 160, 760, 320, '#ffb050', 0.5 * fl); } },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 }); student(g, T, 230, GY + 10, 1.0, ACT.pose(t, [[0, 'sit'], [b0 + 0.5, 'attend', { act: 0.4 }]], { prop: false }), { emo: ACT.emo(t, [[0, 'calm'], [b0 + 0.4, 'shock', { dur: 0.3 }], [b0 + 1.4, 'wonder']]), ...ACT.lead(t, [[0, [0.2, 0.5]], [b0 + 0.3, [0.9, -0.5]]]) }, fl, 'right', 'tl-s'); } },
        { z: 1.3, haze: false, draw: (g) => { vyasa(g, T, 820, GY + 90, 1.16, ACT.pose(t, [[0, 'stand'], [b0 - 0.3, 'bless', { act: 0.5 }]], { prop: false }), { emo: 'tender', speak: talk(env, t), gaze: [0.8, 0.3] }, 'left', 'tl-v'); } },
        { z: 1.5, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 18, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.3 }) });

  // 10 · BOWED: Vaishampayana, in dawn-rose against the teal hall, bows to his teacher; his hands empty and joined
  R.scene({ id: 'bowed', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.2, b1 = env.beats[1] ?? 2.5, cam = CAM.tilt(E.inOutSine(clamp(t / 2.4)), { from: -200, to: 60, zoom: 1.2 });
      teal(ctx, T, cam, (g, p, fl) => student(g, T, 600, GY + 10, 1.12, ACT.pose(t, [[0, 'stand'], [b0 - 0.2, 'anjali', { act: 0.5 }], [b1 - 0.1, 'bow', { act: 0.8 }]], { prop: false }), { emo: 'resolve', gaze: [0.7, 0.3] }, fl, 'right', 'bw-s'), { fx: 1040, fs: 0.8 });
      TY.plaque(ctx, T, clamp((t - b0) / 0.6), ...names(env, 'Vaishampayana'), { x: 344, y: 900, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.38, vignette: 0.5, paper: 0.3 }) });

  // 11 · FRAME (a second silence before it): Sauti by the Naimisha fire, a hand on his chest; a pull back until the fire is small
  R.scene({ id: 'frame', transition: { type: 'dissolve', dur: 0.45 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.4, cam = CAM.pull(clamp(t / env.dur), { from: 1.5, to: 0.94, focus: [700, 900] }), tap = Math.sin(Math.PI * clamp((t - b0 + 0.1) / 0.24));
      EP41.naimisha(ctx, T, cam, { figs: (g, p, fl) => {
        CH.elder.draw(g, { x: 215, y: GY + 20, scale: 1.02, facing: 'right', pose: { name: 'sit', base: 'sit' }, light: { ...EP41.lit(215, fl, 0.85), fill: 0.45, intensity: 1.5 }, t: T, key: 'f-el' });
        CH.sauti.draw(g, { x: 880, y: GY + 20, scale: 1.02, facing: 'left', pose: { name: 'speak', k: 0.6 + 0.4 * tap, base: 'sit' }, light: { ...EP41.lit(880, fl, 0.85), fill: 0.45, intensity: 1.5 }, expression: { speak: talk(env, t) }, t: T, key: 'f-sa' });
      } });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.3 }) });

  // 12 · CLIFF: Vaishampayana draws breath; behind him the hall's wall opens into a strip of small bright panels rushing past
  const cliff = (ctx, T, t, env, b) => {
    const cam = CAM.push(clamp(t / 5), { from: 1.02, to: 1.2, focus: [540, 900] }), open = E.outCubic(clamp((t - b[1] + 0.2) / 0.7)), fl = KIT.flicker(T, 4), breath = Math.sin(Math.PI * clamp((t - b[1] + 0.5) / 0.7));
    ST.shot(ctx, T, { pal: 'dice-vermilion', cam, layers: [
      { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500 }) },
      { z: 0.3, draw: (g, p) => ST.pillars(g, p, { y: 1380, n: 4 }) },
      { z: 0.6, haze: false, draw: (g) => EP47.strip(g, T, lerp(700, 420, open), lerp(20, 560, open), 420, open) },
      { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 }); student(g, T, 540, GY + 10 - 14 * breath, 1.1, ACT.pose(t, [[0, 'anjali'], [b[1] - 0.5, 'stand', { act: 0.4 }], [b[1] + 0.2, 'speak', { act: 0.5 }]], { prop: false }), { emo: 'resolve', speak: t > b[1] + 0.3 ? 0.5 + 0.5 * Math.sin(T * 13) : 0, gaze: [0.7, 0] }, fl, 'right', 'cl-s', { dir: -2.2, intensity: 1.1, front: 0.04, fill: 0 }); } },
      { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 26, cam }) },
    ] });
    TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 110 });
    fin(ctx, T);
  };
  const CL = { dur: 4.72, b: [1.38, 3.78] };
  R.scene({ id: 'cliff', transition: { type: 'dissolve', dur: 0.35 }, draw(ctx, t, env) { cliff(ctx, env.T, t, env, env.beats.length > 1 ? env.beats : CL.b); }, post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.3 }) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, CL.dur + t, env, CL.b) });
})();
