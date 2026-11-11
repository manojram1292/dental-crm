/* Episode 48 · The Whole Story in One Breath (CE Adi 1.55.1–43, 1.56.1–33). One scene per line of script/ep48.en.json.
 * Loads after ep41/_common, ep46/_common (EP46.hall) and ep47/_common (EP47.strip). Six painted panels, each with its own
 * colour and its own move; no manuscript (an oral recital); the war has no blood and no triumph: a land laid waste. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41, EP46 = window.EP46, EP47 = window.EP47;
  const { TAU, clamp, lerp, E, hash } = R;
  const GY = EP41.GY, HZ = EP41.HZ;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const names = (env, n) => [n, env.script.names[n]];
  const talk = (env, t) => EP41.mouth(env, t);
  const prince = (g, T, x, y, s, pose, facing, key, L, emo) => CH.kuruPrince.draw(g, { x, y, scale: s, facing, pose, light: L, expression: { emo: emo || 'calm' }, t: T, key });
  const lit = (p, x, front = 0.7) => ST.light(p, { from: [540, 200], at: [x, GY], front, k: 1.15 });
  const dark = () => ({ dir: -Math.PI / 2, intensity: 1.1, front: 0.03, fill: 0 });
  const teal = (ctx, T, cam, figs, o = {}) => EP46.hall(ctx, T, cam, { pal: 'satra-teal-night', fx: o.fx ?? 130, fire: 1.05, fs: o.fs ?? 0.9, glow: 0.16, figs, key: 'teal' });

  // 1 · HOOK: the strip of small painted panels runs across the frame like a scroll being pulled
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.8, cam = CAM.drift(CAM.slide(t / env.dur, { from: -60, to: 60, zoom: 1.06 }), T, 0.5), fl = Math.sin(Math.PI * clamp((t - b0) / 0.4));
      ST.shot(ctx, T, { pal: 'dice-vermilion', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500 }) },
        { z: 0.3, draw: (g, p) => ST.pillars(g, p, { y: 1380, n: 4 }) },
        { z: 1, haze: false, draw: (g) => { EP47.strip(g, T, 380, 760, 520 + 500 * E.outCubic(clamp(1 - t / 1.2)), 1); KIT.glow(g, 540, 760, 900, '#ffb050', 0.18 + 0.2 * fl); } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 30, cam }) },
      ] });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, clamp(t / 0.2), line.text, { y: 1340, size: 76, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.15) / 0.6);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 1400, key: 'ep48-title' });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.5, paper: 0.3 }) });

  // 2 · BEFORE: the teal hall: Vaishampayana before the seated king, Vyasa beside him; he opens his hands
  R.scene({ id: 'before', transition: { type: 'smoke', dur: 0.7, dir: -Math.PI / 2, color: '#1a4a5a' },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.25, cam = CAM.push(t / env.dur, { from: 1.04, to: 1.2, focus: [520, 860] });
      teal(ctx, T, cam, (g, p, fl) => {
        CH.kingJanamejaya.draw(g, { x: 930, y: GY - 30, scale: 0.92, facing: 'left', pose: { w: { sit: 1 } }, light: EP46.lit(930, fl, 0.6, 130), expression: { emo: 'wonder', gaze: [0.7, 0.2] }, t: T, key: 'bf-k' });
        CH.vaishampayanaSage.draw(g, { x: 500, y: GY + 10, scale: 1.04, facing: 'right', pose: ACT.pose(t, [[0, 'anjali'], [b0, 'speak', { act: 0.5 }]], { prop: false }), light: { ...EP46.lit(500, fl, 0.9, 130), fill: 0.5, intensity: 1.5 }, expression: { emo: 'resolve', gaze: [0.8, 0.1] }, t: T, key: 'bf-s' });
      });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 3.2) / 0.4)), env.strings, { y: 190 });
      TY.plaque(ctx, T, clamp((t - 0.5) / 0.6), ...names(env, 'Vaishampayana'), { x: 300, y: 620, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.38, vignette: 0.5, paper: 0.3 }) });

  // 3 · PANEL 1 (ivory court): five young men in a row, entering; across from them one prince turned away, his hand a fist
  R.scene({ id: 'five', transition: { type: 'brush', dur: 0.5, angle: 0.2, color: '#f4e8c8' },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 0.7, b1 = b[1] ?? 3.2, b2 = b[2] ?? 5.6, cam = CAM.slide(t / env.dur, { from: 150, to: -150, zoom: 1.1 }), d = 120 * E.outCubic(clamp(t / (b1 - 0.3)));
      ST.shot(ctx, T, { pal: 'seat-ivory', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500 }) },
        { z: 0.35, draw: (g, p) => ST.pillars(g, p, { y: 1380, n: 5 }) },
        { z: 0.6, haze: false, draw: (g) => { g.fillStyle = 'rgba(255,248,224,0.8)'; g.fillRect(-900, 200, 2880, 1300); } },   // the court's pale wall, lit: the figures are dark shapes against it
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
          for (let i = 4; i >= 0; i--) prince(g, T, 20 + i * 105 + d, GY + 10 - i * 6, 0.86 + 0.03 * (i % 2), ACT.pose(t, [[0, 'walk'], [b1 - 0.3, 'stand', { act: 0.4 }]], { phase: ACT.stride(d, 0.86) + i * 0.9, stride: 0.7 }), 'right', 'fv-' + i, dark(), 'calm');
          const turnAway = t > b1 - 0.2;
          prince(g, T, 960, GY + 14, 0.96, ACT.pose(t, [[0, 'stand'], [b2 - 0.4, 'curse', { act: 0.4 }]]), turnAway ? 'right' : 'left', 'fv-d', { ...dark(), intensity: 0.9 }, 'wrath');
        } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 24, cam }) },
      ] });
      TY.plaque(ctx, T, clamp((t - b1) / 0.6), ...names(env, 'Duryodhana'), { x: 760, y: 300, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.42, paper: 0.32 }) });

  // 4 · PANEL 2 (amber): a cup; a great house of red lacquer going up in flames; under the ground line, six small figures
  //     walking a tunnel by one lamp. A tilt from the roof to the tunnel
  R.scene({ id: 'poison', transition: { type: 'ink', dur: 0.7, at: [540, 700], color: '#5a1a08' },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 0.25, b1 = b[1] ?? 2.8, b2 = b[2] ?? 3.8, cam = CAM.tilt(E.inOutSine(clamp((t - b1) / (b2 - b1 + 0.5))), { from: -280, to: 330, zoom: 1.14 });
      const burn = E.outCubic(clamp((t - b1 + 0.1) / 0.5)), walk = 60 * Math.max(0, t - b2);
      ST.shot(ctx, T, { pal: 'hearth-amber', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -600, 0, 1300); gr.addColorStop(0, '#1a0804'); gr.addColorStop(1, '#8a3a10'); g.fillStyle = gr; g.fillRect(-900, -1200, 2880, 2600); } },
        { z: 1, haze: false, draw: (g) => {
          // the cup (on "Poison"): a drop falls into it
          const cu = Math.sin(Math.PI * clamp((t - b0 + 0.3) / 2.0)); if (cu > 0.01) { g.save(); g.globalAlpha = Math.min(1, cu * 3); g.fillStyle = '#ffe08a'; g.beginPath(); g.moveTo(150, 420); g.lineTo(350, 420); g.quadraticCurveTo(330, 560, 270, 580); g.lineTo(270, 640); g.lineTo(320, 660); g.lineTo(180, 660); g.lineTo(230, 640); g.lineTo(230, 580); g.quadraticCurveTo(170, 560, 150, 420); g.fill(); const dr = clamp((t - b0 + 0.25) / 0.3); g.fillStyle = '#7dff5a'; g.beginPath(); g.ellipse(250, lerp(140, 410, dr * dr), 10, 16, 0, 0, TAU); g.fill(); g.restore(); }
          // the house of lac
          g.fillStyle = '#8a1a10'; g.fillRect(380, 560, 600, 520); g.fillStyle = '#5a0e08'; g.beginPath(); g.moveTo(330, 570); g.lineTo(680, 330); g.lineTo(1030, 570); g.closePath(); g.fill(); g.fillStyle = '#ffd070'; for (let i = 0; i < 4; i++) g.fillRect(440 + i * 140, 700, 60, 110);
          g.strokeStyle = '#ffe08a'; g.lineWidth = 5; g.strokeRect(380, 560, 600, 520);
          if (burn > 0) for (let i = 0; i < 9; i++) { const x = 400 + i * 70, h = (260 + 160 * hash(i, 3)) * burn * (0.8 + 0.2 * Math.sin(T * 7 + i)); for (const [c, q] of [['#c8341a', 1], ['#f08a24', 0.7], ['#ffe08a', 0.4]]) { g.fillStyle = c; g.beginPath(); g.moveTo(x - 46 * q, 580); g.quadraticCurveTo(x - 50 * q, 580 - h * q * 0.5, x + 14 * Math.sin(T * 5 + i), 580 - h * q); g.quadraticCurveTo(x + 50 * q, 580 - h * q * 0.5, x + 46 * q, 580); g.fill(); } }
          if (burn > 0) KIT.glow(g, 680, 500, 900, '#ff7a1e', 0.4 * burn);
          // the ground line and the tunnel in section
          g.fillStyle = '#2a1206'; g.fillRect(-900, 1080, 2880, 1400); g.fillStyle = '#0c0502'; g.beginPath(); g.roundRect(-200, 1230, 1500, 250, 120); g.fill();
          KIT.glow(g, 880 - walk, 1340, 260, '#ffd070', 0.7); g.fillStyle = '#ffe9b0'; g.beginPath(); g.ellipse(880 - walk, 1330, 9, 18, 0, 0, TAU); g.fill();
          for (let i = 0; i < 6; i++) { const x = 840 - walk + i * 62, ph = T * 6 + i; g.fillStyle = '#c89a6a'; g.beginPath(); g.ellipse(x, 1400 - 4 * Math.abs(Math.sin(ph)), 15, 44, 0.12, 0, TAU); g.fill(); g.beginPath(); g.arc(x - 6, 1338 - 4 * Math.abs(Math.sin(ph)), 14, 0, TAU); g.fill(); }
        } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: Math.round(50 * burn) + 4, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.32 }) });

  // 5 · PANEL 3 (crystal sky): a bow drawn at a target high on a pole; a woman with a garland; a crane up to a white city on a river
  R.scene({ id: 'won', transition: { type: 'brush', dur: 0.5, angle: -0.25, color: '#e8f4ff' },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.6, b1 = env.beats[1] ?? 3.7, cam = CAM.crane(E.inOutSine(clamp((t - b1 + 0.6) / 1.5)), { from: 1.12, to: 1.06, y0: 60, y1: -560 }), fly = clamp((t - 0.5) / 0.35);
      ST.shot(ctx, T, { pal: 'crystal-sky', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ }) },
        { z: 0.15, draw: (g, p) => ST.cloudBank(g, p, T, { y: 360, count: 5, size: 1.4 }) },
        { z: 0.4, draw: (g, p) => {   // the white city on its river, above (the crane rises to it)
          ST.water(g, p, { y0: -160, y1: 40, T, flow: 40, count: 30 }); g.fillStyle = '#f4f8ff'; for (let i = 0; i < 9; i++) { const x = 60 + i * 120, h = 200 + 160 * hash(i, 4); g.fillRect(x, -160 - h, 90, h); g.beginPath(); g.moveTo(x - 10, -160 - h); g.lineTo(x + 45, -160 - h - 80); g.lineTo(x + 100, -160 - h); g.fill(); } g.fillStyle = '#ffe08a'; for (let i = 0; i < 9; i++) g.fillRect(60 + i * 120 + 38, -160 - 120, 14, 40); } },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
          g.fillStyle = '#5a3a1a'; g.fillRect(532, 300, 16, GY - 300); g.fillStyle = '#ffe08a'; g.save(); g.translate(540, 300); g.rotate(T * 3); for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.fillRect(-6, -70, 12, 60); } g.restore(); g.fillStyle = '#c8401a'; g.beginPath(); g.arc(540, 300, 20, 0, TAU); g.fill();   // the turning mark on its pole
          prince(g, T, 190, GY + 10, 0.98, ACT.pose(t, [[0, 'raise'], [0.5, 'stand', { act: 0.3 }]]), 'right', 'wn-a', lit(p, 190, 0.75), 'resolve');
          if (fly > 0 && fly < 1) { g.strokeStyle = '#fff8e0'; g.lineWidth = 6; g.beginPath(); const ax = lerp(300, 530, fly), ay = lerp(GY - 900, 320, fly); g.moveTo(ax - 70, ay + 46); g.lineTo(ax, ay); g.stroke(); }
          CH.panchali.draw(g, { x: 900, y: GY + 10, scale: 0.94, facing: 'left', pose: ACT.pose(t, [[0, 'attend'], [b0 - 0.3, 'anjali', { act: 0.6 }]]), light: lit(p, 900, 0.8), expression: { emo: 'joy', gaze: [0.8, 0] }, t: T, key: 'wn-p' });
        } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'pollen', count: 40, cam }) },
      ] });
      TY.plaque(ctx, T, clamp((t - b0) / 0.5), ...names(env, 'Draupadi'), { x: 760, y: 300, out: clamp((t - b1 + 0.3) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.38, paper: 0.32 }) });

  // 6 · PANEL 4 (the turn, after a silence; the signature shot): from directly above, a dicing cloth: the dice fall, turn and
  //     stop; the city, the crowns, the brothers' ornaments slide across the cloth to one side. A push in on the dice
  R.scene({ id: 'dice', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 2.4, b1 = env.beats[1] ?? 3.6, cam = CAM.push(clamp(t / env.dur), { from: 1.0, to: 1.3, focus: [540, 820] });
      const fall = clamp((t - b0 + 0.45) / 0.45), spin = (1 - E.outCubic(clamp((t - b0) / 0.5))) * 9, take = E.inOutSine(clamp((t - b1) / 0.9));
      ST.shot(ctx, T, { pal: 'dice-vermilion', cam, layers: [
        { z: 0, haze: false, draw: (g) => { g.fillStyle = '#3a0a08'; g.fillRect(-900, -900, 2880, 3720); } },
        { z: 1, haze: false, draw: (g) => {
          g.fillStyle = '#a81e14'; g.beginPath(); g.roundRect(90, 300, 900, 1040, 40); g.fill(); g.strokeStyle = '#ffe08a'; g.lineWidth = 10; g.stroke(); g.lineWidth = 3; g.beginPath(); g.roundRect(130, 340, 820, 960, 26); g.stroke();
          g.strokeStyle = 'rgba(255,224,138,0.5)'; g.lineWidth = 4; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(130 + i * 205, 340); g.lineTo(130 + i * 205, 1300); g.stroke(); g.beginPath(); g.moveTo(130, 340 + i * 240); g.lineTo(950, 340 + i * 240); g.stroke(); }
          // the stakes: a small white city, five crowns, ornaments: they slide to the right-hand player
          const sx = (x) => lerp(x, 860 - (x % 97), take);
          g.fillStyle = '#f4f8ff'; for (let i = 0; i < 4; i++) g.fillRect(sx(190 + i * 30), 520 - 20 * (i % 2), 24, 70 + 20 * (i % 2));
          for (let i = 0; i < 5; i++) { const x = sx(180 + i * 46), y = 1040 + 30 * (i % 2); g.fillStyle = '#ffe08a'; g.beginPath(); g.moveTo(x - 20, y); g.lineTo(x - 20, y - 26); g.lineTo(x - 8, y - 12); g.lineTo(x, y - 34); g.lineTo(x + 8, y - 12); g.lineTo(x + 20, y - 26); g.lineTo(x + 20, y); g.fill(); }
          for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#ffd070' : '#7af0e0'; g.beginPath(); g.arc(sx(200 + i * 34), 760 + 60 * hash(i, 5), 11, 0, TAU); g.fill(); }
          // hands at each side (shapes only)
          g.fillStyle = '#6a3a22'; g.beginPath(); g.ellipse(60, 820, 110, 70, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(1020, 820 + 30 * Math.sin(Math.PI * take), 110, 70, 0, 0, TAU); g.fill();
          // the dice
          for (const [dx, dy, r0] of [[-50, 0, 0.3], [70, 60, -0.5]]) { g.save(); g.translate(540 + dx, lerp(-200, 800 + dy, fall * fall)); g.rotate(r0 + spin); g.fillStyle = '#fff4d8'; g.beginPath(); g.roundRect(-46, -46, 92, 92, 14); g.fill(); g.fillStyle = '#2a0a0a'; for (const [px, py] of [[-20, -20], [20, 20], [0, 0]]) { g.beginPath(); g.arc(px, py, 9, 0, TAU); g.fill(); } g.restore(); }
          const hit = clamp((t - b0) / 0.3); if (hit > 0 && hit < 1) { g.strokeStyle = 'rgba(255,240,200,' + (1 - hit) + ')'; g.lineWidth = 8; g.beginPath(); g.ellipse(550, 830, 220 * hit, 150 * hit, 0, 0, TAU); g.stroke(); }
        } },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.55, paper: 0.32 }) });

  // 7 · PANEL 5 (the forest of exile): six figures walking away under great trees; twelve moons cross the canopy; a thirteenth is hidden by a leaf
  R.scene({ id: 'exile', transition: { type: 'smoke', dur: 0.7, dir: Math.PI, color: '#1a3a24' },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 2.3, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 120, zoom: 1.1 }), d = 46 * Math.min(t, 4.2), moon = { dir: -Math.PI / 2 - 0.4, intensity: 1.5, front: 1, fill: 0.8, tint: ['#f0f8e0', 0.6], minLum: 0.5 };
      ST.shot(ctx, T, { pal: 'exile-forest', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ }) },
        { z: 0.2, haze: false, draw: (g) => { for (let i = 0; i < 12; i++) { const a = Math.PI * (0.08 + 0.84 * i / 11), on = clamp((t - 0.2 - i * 0.14) / 0.2); if (on <= 0) continue; g.globalAlpha = on; g.fillStyle = '#f4f8e0'; g.beginPath(); g.arc(540 - 460 * Math.cos(a), 560 - 300 * Math.sin(a), 20, 0, TAU); g.fill(); } g.globalAlpha = clamp((t - b1) / 0.3); g.fillStyle = '#f4f8e0'; g.beginPath(); g.arc(880, 760, 20, 0, TAU); g.fill(); g.fillStyle = '#1c5a2a'; g.beginPath(); g.ellipse(892, 752, 44, 22, -0.5, 0, TAU); g.fill(); g.globalAlpha = 1; } },
        { z: 0.4, draw: (g, p) => ST.treeline(g, p, { y: HZ + 20, h: 1100, gap: 300, T, seed: 81, kind: 'banyan' }) },
        { z: 0.8, haze: false, draw: (g) => { const mg = g.createLinearGradient(0, GY - 1000, 0, GY); mg.addColorStop(0, 'rgba(232,244,214,0)'); mg.addColorStop(0.5, 'rgba(232,244,214,0.75)'); mg.addColorStop(1, 'rgba(232,244,214,0.85)'); g.fillStyle = mg; g.fillRect(-900, GY - 1000, 2880, 1000); } },   // moonlit mist between the trunks: the walkers are dark shapes against it
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
          for (let i = 0; i < 5; i++) prince(g, T, 800 - i * 150 - d * 0.6, GY + 10 - i * 5, 0.66, ACT.pose(t, [[0, 'walk']], { phase: ACT.stride(d * 0.6, 0.66) + i * 0.9, stride: 0.7 }), 'left', 'ex-' + i, dark());
          CH.panchali.draw(g, { x: 960 - d * 0.6, y: GY + 14, scale: 0.66, facing: 'left', pose: ACT.pose(t, [[0, 'walk']], { phase: ACT.stride(d * 0.6, 0.66) + 2, stride: 0.6 }), light: dark(), expression: { emo: 'sorrow' }, t: T, key: 'ex-p' }); } },
        { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => { ST.trunks(g, p, { xs: [-240, 1320], w: 210 }); ST.grass(g, p, { y: 1950, h: 300, T, count: 40 }); } },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.26, vignette: 0.5, paper: 0.32 }) });

  // 8 · PANEL 6 (war-iron): an open hand, a closed door; a tilt down from banners to two armies, small, no blood; on "laid
  //     waste" the field is empty and grey: five small figures and one woman, a crown on the ground, empty houses
  R.scene({ id: 'war', transition: { type: 'ink', dur: 0.7, at: [540, 800], color: '#1a2038' },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 1.4, b1 = b[1] ?? 2.7, b2 = b[2] ?? 4.5, b3 = b[3] ?? 7.4;
      const cam = CAM.tilt(E.inOutSine(clamp((t - b1 - 0.2) / 1.4)), { from: -900, to: 0, zoom: 1.1 }), waste = E.inOutSine(clamp((t - b3 + 0.9) / 1.0)), shut = E.outCubic(clamp((t - b0 - 0.2) / 0.35));
      ST.shot(ctx, T, { pal: 'war-iron', cam, layers: [
        { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 760 }); g.fillStyle = KIT.hex(p.sky[0], '#000000', 0.2); g.fillRect(-900, -2000, 2880, 1300); } },
        { z: 0.3, draw: (g, p) => ST.hills(g, p, { y: 760, h: 260, seed: 91 }) },
        { z: 1, haze: false, draw: (g, p) => {
          // above (the first picture): the hand held out; the door closing on it
          g.fillStyle = '#3a2a1a'; g.fillRect(560, -820, 420, 640); g.fillStyle = '#ffd9a0'; g.fillRect(600, -780, 340 * (1 - shut), 560); g.fillStyle = '#5a3a22'; g.fillRect(600 + 340 * (1 - shut), -780, 340 * shut, 560); g.strokeStyle = '#e7b54a'; g.lineWidth = 8; g.strokeRect(560, -820, 420, 640);
          g.fillStyle = '#c08a5e'; g.beginPath(); g.ellipse(330, -470, 130, 46, -0.1, 0, TAU); g.fill(); for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(440 + i * 4, -520 + i * 26, 70, 15, -0.12, 0, TAU); g.fill(); } g.fillRect(40, -510, 220, 90);
          // below: the field; banners; two armies as rows of small spears, dimming to nothing
          ST.ground(g, p, { y: 770 });
          const army = 1 - waste; if (army > 0.02) { g.save(); g.globalAlpha = army;
            for (const sg of [-1, 1]) { for (let i = 0; i < 26; i++) { const x = 540 + sg * (90 + i * 19 + 30 * hash(i, 2)), y = 900 + 330 * hash(i, 3), adv = sg * -30 * clamp((t - b2) / 1.2); g.fillStyle = sg < 0 ? '#ffd9a0' : '#c8d0ff'; g.fillRect(x + adv - 6, y - 64, 12, 64); g.beginPath(); g.arc(x + adv, y - 76, 11, 0, TAU); g.fill(); g.fillRect(x + adv + sg * -10, y - 140, 4, 90); }
              for (let i = 0; i < 3; i++) { const x = 540 + sg * (220 + i * 150); g.fillStyle = '#2a2a3a'; g.fillRect(x, 440, 6, 460); g.fillStyle = sg < 0 ? '#e7b54a' : '#c8401a'; g.beginPath(); g.moveTo(x + 6, 450); g.lineTo(x + 6 + sg * -130, 490 + 10 * Math.sin(T * 4 + i)); g.lineTo(x + 6, 540); g.fill(); } }
            const fl = Math.sin(Math.PI * clamp((t - b2) / 0.3)); if (fl > 0) { g.globalAlpha = fl * 0.7; g.fillStyle = '#ffffff'; g.fillRect(-900, 300, 2880, 1200); } g.restore(); }
          if (waste > 0.02) { g.save(); g.globalAlpha = waste;
            for (let i = 0; i < 5; i++) { const x = 140 + i * 190, h = 120 + 60 * hash(i, 7); g.fillStyle = '#4a4a56'; g.fillRect(x, 780 - h, 120, h); g.fillStyle = '#16161c'; g.fillRect(x + 40, 780 - h * 0.6, 40, h * 0.6); }   // empty houses
            g.fillStyle = '#e7b54a'; g.save(); g.translate(540, 1240); g.rotate(0.5); g.beginPath(); g.moveTo(-30, 0); g.lineTo(-30, -34); g.lineTo(-12, -16); g.lineTo(0, -44); g.lineTo(12, -16); g.lineTo(30, -34); g.lineTo(30, 0); g.fill(); g.restore();   // a crown on the ground
            for (let i = 0; i < 5; i++) prince(g, T, 230 + i * 110, 1130, 0.42, 'stand', 'right', 'wr-' + i, { dir: -Math.PI / 2, intensity: 1.6, front: 1, fill: 0.9, tint: ['#f0f0f8', 0.8], minLum: 0.7 });
            CH.panchali.draw(g, { x: 850, y: 1130, scale: 0.42, facing: 'left', pose: 'grieve', light: { dir: -Math.PI / 2, intensity: 1.6, front: 1, fill: 0.9, tint: ['#f0f0f8', 0.8], minLum: 0.7 }, t: T, key: 'wr-p' });
            g.restore(); }
        } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 40, cam }) },
      ] });
      if (waste > 0.01) { ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = waste * 0.8; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore(); }
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.28, vignette: 0.5, paper: 0.32 }) });

  // 9 · MORE (a second silence before it; the close-up): the king's face: struck, then hungry for more
  R.scene({ id: 'more', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.4, sp0 = env.speech[0], cam = CAM.push(t / env.dur, { from: 1.0, to: 1.12, focus: [540, 760] }), fl = KIT.flicker(T, 3);
      ST.shot(ctx, T, { pal: 'satra-teal-night', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500 }) },
        { z: 0.3, soft: 0.5, draw: (g, p) => ST.pillars(g, p, { y: 1700, n: 4 }) },
        { z: 0.6, haze: false, draw: (g) => KIT.glow(g, 60, 1200, 700, '#ff8a2a', 0.3 * fl) },
        { z: 1, haze: false, draw: (g) => CH.kingJanamejaya.draw(g, { x: 660, y: 3000, scale: 2.4, facing: 'left', pose: ACT.pose(t, [[0, 'stand']], { prop: false }), light: { dir: Math.atan2(200, -600), intensity: 1.3 * fl, front: 0.8, fill: 0.3, tint: ['#ffb050', 0.4], bounce: ['#2a8a90', 0.3], wrap: 0.5, minLum: 0 },
          expression: { emo: ACT.emo(t, [[0, 'sorrow'], [sp0 - 0.3, 'wonder', { dur: 0.4 }], [b0 + 0.6, 'resolve']]), speak: talk(env, t), ...ACT.lead(t, [[0, [0.4, 0.6]], [sp0 - 0.4, [0.9, 0]]], 0.4, 0.15) }, t: T, key: 'mr-k' }) },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 18, cam }) },
      ] });
      TY.plaque(ctx, T, clamp((t - 0.4) / 0.6), ...names(env, 'Janamejaya'), { x: 300, y: 330, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.32, vignette: 0.5, paper: 0.3 }) });

  // 10 · HERE: Vaishampayana, an open hand lifted, reciting; behind him Vyasa, eyes closed, in his own gold light
  R.scene({ id: 'here', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 4.3, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 110, zoom: 1.12 }), fl = KIT.flicker(T, 5);
      EP46.hall(ctx, T, cam, { pal: 'arrival-umber-gold', fx: -160, fire: 1.0, fs: 0.8, glow: 0.3, key: 'hr', figs: (g) => {
        const hg = g.createRadialGradient(840, GY - 560, 50, 840, GY - 560, 620); hg.addColorStop(0, '#fff0c0'); hg.addColorStop(0.55, 'rgba(255,200,110,0.8)'); hg.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = hg; g.fillRect(200, GY - 1300, 1300, 1500);
        CH.vyasaSage.draw(g, { x: 840, y: GY - 60, scale: 0.94, facing: 'left', pose: { w: { sit: 1 }, prop: false }, light: { dir: -Math.PI / 2 - 0.5, intensity: 1.2, front: 0.07, fill: 0, wrap: 0.6, tint: ['#ffcf7a', 0.6] }, expression: { emo: 'calm', blink: 1 }, t: T, key: 'hr-v' });
        CH.vaishampayanaSage.draw(g, { x: 330, y: GY + 10, scale: 1.06, facing: 'right', pose: ACT.pose(t, [[0, 'speak'], [b1 - 0.4, 'bless', { act: 0.6 }]], { prop: false }), light: { dir: -2.2, intensity: 1.6, front: 1, fill: 0.9, tint: ['#fff4e0', 0.5], minLum: 0.5 }, expression: { emo: 'resolve', speak: talk(env, t), gaze: [0.7, -0.1] }, t: T, key: 'hr-s' });
      } });
      TY.plaque(ctx, T, clamp((t - 1.2) / 0.6), 'Vyasa', 'composed it in three years', { x: 840, y: 300, out: clamp((t - b1 + 0.2) / 0.3) });
      TY.tag(ctx, T, clamp((t - b1) / 0.5), 'on law, wealth, love and freedom', { x: 540, y: 1250, size: 40, out: clamp((t - (env.dur - 0.3)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.3 }) });

  // 11 · CLIFF: deep river blue: three images on the three beats: a crown in the sky, a silver fish turning, a hand on an oar
  const cliff = (ctx, T, t, env, b) => {
    const cam = CAM.slide(clamp(t / 5.2), { from: 110, to: -110, zoom: 1.1 }), a0 = E.outCubic(clamp((t - b[0] + 0.15) / 0.4)), a1 = clamp((t - b[1] + 0.15) / 0.3), a2 = E.outCubic(clamp((t - b[2] + 0.15) / 0.4));
    ST.shot(ctx, T, { pal: 'yamuna-deep', cam, layers: [
      { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 760 }) },
      { z: 0.2, draw: (g, p) => { ST.cloudBank(g, p, T, { y: 300, count: 4, size: 1.3 }); ST.hills(g, p, { y: 760, h: 240, seed: 95 }); } },
      { z: 0.5, haze: false, draw: (g) => { if (a0 <= 0) return; KIT.glow(g, 300, 340, 300 * a0, '#ffe08a', 0.6 * a0); g.save(); g.translate(300, 380 - 40 * a0); g.scale(a0, a0); g.fillStyle = '#ffe08a'; g.beginPath(); g.moveTo(-70, 0); g.lineTo(-70, -70); g.lineTo(-30, -34); g.lineTo(0, -100); g.lineTo(30, -34); g.lineTo(70, -70); g.lineTo(70, 0); g.closePath(); g.fill(); g.fillStyle = '#c8401a'; g.beginPath(); g.arc(0, -40, 12, 0, TAU); g.fill(); g.restore(); } },
      { z: 1, haze: false, draw: (g, p) => { ST.water(g, p, { y0: 770, y1: 2000, T, flow: 60, count: 110 });
        if (a1 > 0) { const jump = Math.sin(Math.PI * clamp((t - b[1] + 0.15) / 0.9)); CH.fish.draw(g, { x: 620, y: 1120 - 150 * jump, scale: 0.5, facing: 'left', pose: { name: 'swim', phase: T * 6 }, light: { dir: -Math.PI / 2, intensity: 1.4, front: 1, fill: 0.8 }, t: T, key: 'cl-f' });
          const sp = clamp((t - b[1]) / 0.5); if (sp > 0 && sp < 1) { g.strokeStyle = 'rgba(240,250,255,' + (1 - sp) + ')'; g.lineWidth = 7; g.beginPath(); g.ellipse(620, 1130, 260 * sp, 50 * sp, 0, 0, TAU); g.stroke(); } }
        if (a2 > 0) { g.save(); g.translate(0, 120 * (1 - a2));   // the stern of a boat, an oar, a hand on it
          g.fillStyle = '#3a2412'; g.beginPath(); g.moveTo(560, 1320); g.quadraticCurveTo(820, 1420, 1300, 1330); g.lineTo(1300, 1250); g.lineTo(600, 1250); g.closePath(); g.fill();
          g.save(); g.translate(860, 1180); g.rotate(-0.5 + 0.12 * Math.sin(T * 2.4)); g.fillStyle = '#6a4a2a'; g.fillRect(-10, -260, 20, 560); g.beginPath(); g.ellipse(0, 330, 34, 70, 0, 0, TAU); g.fill(); g.fillStyle = '#b07a52'; g.beginPath(); g.ellipse(0, -150, 34, 26, 0, 0, TAU); g.fill(); g.restore(); g.restore(); } } },
      { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => ST.grass(g, p, { y: 1980, h: 340, T, count: 30 }) },
    ] });
    TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 110 });
    fin(ctx, T);
  };
  const CL = { dur: 5.04, b: [2.05, 2.71, 4.06] };
  R.scene({ id: 'cliff', transition: { type: 'lamp', dur: 0.8, from: [840, 800], to: [300, 340] }, draw(ctx, t, env) { cliff(ctx, env.T, t, env, env.beats.length > 2 ? env.beats : CL.b); }, post: () => ({ bloom: 0.32, vignette: 0.45, paper: 0.3 }) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, CL.dur + t, env, CL.b) });
})();
