/* Episode 49 · The King, the Fish and the Ferry Girl (CE Adi 1.57.1–56). One scene per line of script/ep49.en.json.
 * Loads after ep41/_common, ep44/_common (EP44.meadow) and ep49/_common (EP49.shore, river, boat, infant).
 * The new-born are swaddled infants; no knife, no wound (the light opens); the sage in the last shot is far from her. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41, EP49 = window.EP49;
  const { TAU, clamp, lerp, E, hash } = R;
  const GY = EP41.GY, HZ = EP41.HZ;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const names = (env, n) => [n, env.script.names[n]];
  const bright = { dir: -Math.PI / 2 - 0.3, intensity: 1.4, front: 1, fill: 0.8 };

  // under the river: deep blue, a shaft of light, weed in the foreground
  const under = (ctx, T, cam, figs, o = {}) => ST.shot(ctx, T, { pal: 'yamuna-deep', cam, layers: [
    { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -400, 0, 2000); gr.addColorStop(0, '#2a8ac0'); gr.addColorStop(0.4, '#0c4a78'); gr.addColorStop(1, '#03182c'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720);
      g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { g.globalAlpha = 0.1 + 0.05 * Math.sin(T * 0.8 + i); g.fillStyle = '#bfeaff'; const x = 200 + i * 150 + 30 * Math.sin(T * 0.4 + i); g.beginPath(); g.moveTo(x, -500); g.lineTo(x + 90, -500); g.lineTo(x + 260, 2000); g.lineTo(x + 40, 2000); g.closePath(); g.fill(); } g.restore(); } },
    { z: 0.5, haze: false, draw: (g) => { g.fillStyle = '#04263e'; g.beginPath(); g.moveTo(-900, 1600); for (let i = 0; i <= 12; i++) g.lineTo(-300 + i * 150, 1560 + 50 * Math.sin(i * 1.7)); g.lineTo(1980, 2400); g.lineTo(-900, 2400); g.closePath(); g.fill(); if (o.bed) o.bed(g); } },   // the river bed
    { z: 1, haze: false, draw: (g, p) => figs(g, p) },
    { z: 1.3, haze: false, draw: (g) => { g.fillStyle = 'rgba(220,244,255,0.6)'; for (let i = 0; i < 26; i++) { const u = (T * 0.12 * (0.5 + hash(i, 1)) + hash(i, 2)) % 1; g.beginPath(); g.arc(1080 * hash(i, 3) + 20 * Math.sin(T + i), 1700 - 1700 * u, 4 + 6 * hash(i, 4), 0, TAU); g.fill(); } } },
    { z: 1.9, haze: false, soft: o.weedSoft ?? 0.3, draw: (g) => { for (let i = 0; i < 12; i++) { const x = -40 + i * 100 + 40 * hash(i, 5), h = 500 + 400 * hash(i, 6), sw = 40 * Math.sin(T * 0.9 + i); g.strokeStyle = '#021a12'; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, 2000); g.bezierCurveTo(x + sw, 2000 - h * 0.4, x - sw, 2000 - h * 0.7, x + sw * 1.4, 2000 - h); g.stroke(); } } },
  ] });
  const fish = (g, T, x, y, s, key) => { KIT.glow(g, x + 60 * s, y - 150 * s, 200 * s, '#fff0e0', 0.15); CH.fish.draw(g, { x, y, scale: s, facing: 'left', pose: { name: 'swim', phase: T * 4 }, light: { dir: -Math.PI / 2, intensity: 1.4, front: 1, fill: 0.8 }, t: T, key: key || 'fi' }); };

  // 1 · HOOK: under the surface, a great silver fish turning in a shaft of light, a pearl glow in her side; a net coming down
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.8, cam = CAM.drift(CAM.tilt(E.outCubic(clamp(t / 2.8)), { from: -300, to: 40, zoom: 1.14 }), T, 0.6), net = E.outCubic(clamp((t - b0 + 0.1) / 1.6));
      under(ctx, T, cam, (g) => { fish(g, T, 560 + 60 * Math.sin(T * 0.7), 1080 + 30 * Math.sin(T * 1.1), 0.78);
        g.save(); g.strokeStyle = 'rgba(230,220,190,0.75)'; g.lineWidth = 4; const ny = lerp(-700, 520, net); for (let i = 0; i <= 10; i++) { g.beginPath(); g.moveTo(140 + i * 80, ny - 600); g.quadraticCurveTo(140 + i * 80 + 20 * Math.sin(T + i), ny - 200, 340 + i * 40, ny + 60 * Math.sin(i * 0.31 * Math.PI)); g.stroke(); } for (let j = 0; j < 6; j++) { g.beginPath(); g.moveTo(140, ny - 560 + j * 100); g.quadraticCurveTo(540, ny - 480 + j * 110, 940, ny - 560 + j * 100); g.stroke(); } g.restore();
        const sp = clamp((t - b0) / 0.5); if (sp > 0 && sp < 1) { g.strokeStyle = 'rgba(230,246,255,' + (1 - sp) + ')'; g.lineWidth = 8; g.beginPath(); g.ellipse(540, -260, 400 * sp, 60 * sp, 0, 0, TAU); g.stroke(); } });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, clamp(t / 0.2), line.text, { y: 300, size: 72, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.15) / 0.6);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 1500, key: 'ep49-title' });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.32, vignette: 0.5, paper: 0.3 }) });

  // 2 · KING: a chariot like cut glass crossing bright cloud; the king in royal blue and gold
  const car = (g, T, x, y, s) => { g.save(); g.translate(x, y); g.scale(s, s);
    KIT.glow(g, 0, -260, 700, '#eaf8ff', 0.5);
    g.fillStyle = '#7ec4ee'; g.beginPath(); g.moveTo(-430, -40); g.lineTo(-330, -160); g.lineTo(300, -170); g.lineTo(460, -60); g.lineTo(330, 60); g.lineTo(-300, 70); g.closePath(); g.fill();
    g.fillStyle = '#d6f0ff'; g.beginPath(); g.moveTo(-330, -160); g.lineTo(-200, -40); g.lineTo(200, -50); g.lineTo(300, -170); g.closePath(); g.fill();
    g.fillStyle = '#3a8ac8'; g.beginPath(); g.moveTo(-430, -40); g.lineTo(-200, -40); g.lineTo(-300, 70); g.closePath(); g.fill(); g.beginPath(); g.moveTo(460, -60); g.lineTo(200, -50); g.lineTo(330, 60); g.closePath(); g.fill();
    g.strokeStyle = '#ffe08a'; g.lineWidth = 7; g.beginPath(); g.moveTo(-430, -40); g.lineTo(-330, -160); g.lineTo(300, -170); g.lineTo(460, -60); g.stroke();
    g.strokeStyle = '#ffe08a'; g.lineWidth = 5; g.beginPath(); g.moveTo(-430, -40); g.lineTo(-300, 70); g.lineTo(330, 60); g.lineTo(460, -60); g.moveTo(-200, -40); g.lineTo(200, -50); g.stroke(); for (const px of [-300, 280]) { g.fillStyle = '#5aa8dc'; g.fillRect(px - 12, -900, 24, 740); } g.fillStyle = '#3a8ac8'; g.beginPath(); g.moveTo(-380, -900); g.quadraticCurveTo(0, -1080, 360, -900); g.lineTo(330, -860); g.quadraticCurveTo(0, -1000, -350, -860); g.closePath(); g.fill(); g.strokeStyle = '#ffe08a'; g.lineWidth = 6; g.stroke();
    for (let i = 0; i < 6; i++) { const a = T * 2 + i; g.fillStyle = 'rgba(255,255,255,' + (0.5 + 0.5 * Math.sin(a)) + ')'; g.beginPath(); g.arc(-360 + i * 150, -100 + 50 * Math.sin(i * 2), 9, 0, TAU); g.fill(); }
    g.restore(); };
  R.scene({ id: 'king', transition: { type: 'lamp', dur: 0.8, from: [600, 900], to: [800, 380] },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 2.7, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 130, zoom: 1.1 }), x = lerp(400, 620, E.inOutSine(clamp(t / env.dur))), y = 1300 + 22 * Math.sin(T * 1.1);
      ST.shot(ctx, T, { pal: 'crystal-sky', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1700, sun: [820, 380, 110] }) },
        { z: 0.2, draw: (g, p) => ST.cloudBank(g, p, T, { y: 1500, count: 6, size: 2, speed: 30 }) },
        { z: 1, haze: false, draw: (g, p) => { car(g, T, x, y, 0.9); CH.uparichara.draw(g, { x: x - 20, y: y - 140, scale: 0.72, facing: 'right', pose: ACT.pose(t, [[0, 'stand'], [b1 - 0.2, 'point', { act: 0.5 }]]), light: { dir: -0.9, intensity: 1.1, front: 0.3, fill: 0.1, tint: ['#fff8e0', 0.5] }, expression: { emo: 'joy', gaze: [0.8, 0] }, t: T, key: 'kg-u' }); } },
        { z: 1.5, haze: false, draw: (g, p) => ST.cloudBank(g, p, T, { y: 1960, count: 6, size: 2.4, speed: 60 }) },
        { z: 1.6, haze: false, draw: (g) => ST.particles(g, T, { kind: 'pollen', count: 30, cam }) },
      ] });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 3.2) / 0.4)), env.strings, { y: 190 });
      TY.plaque(ctx, T, clamp((t - b1) / 0.6), ...names(env, 'Uparichara'), { x: 800, y: 640, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      TY.tag(ctx, T, clamp((t - b1 - 1.2) / 0.5), 'the chariot: a gift of Indra, king of the gods', { x: 540, y: 1290, size: 34, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.36, paper: 0.3 }) });

  // 3 · LONGED (the close-up): the king's face under blossom: the hunter's set brow softens; his eyes go far
  R.scene({ id: 'longed', transition: { type: 'brush', dur: 0.5, angle: 0.2, color: '#d8f4c8' },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.6, b1 = env.beats[1] ?? 2.6, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.1, focus: [520, 760] });
      ST.shot(ctx, T, { pal: 'hunt-emerald', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500 }) },
        { z: 0.3, soft: 0.45, draw: (g, p) => ST.treeline(g, p, { y: 1500, h: 1400, gap: 440, T, seed: 121, kind: 'flame' }) },
        { z: 0.8, haze: false, draw: (g) => ST.shafts(g, T, { x: 700, angle: -0.35, alpha: 0.14 }) },
        { z: 1, haze: false, draw: (g, p) => CH.uparichara.draw(g, { x: 400, y: 3080, scale: 2.4, facing: 'right', pose: ACT.pose(t, [[0, 'stand']], { prop: false }), light: ST.light(p, { from: [960, 300], at: [520, 1200], k: 1.0, front: 0.3 }),
          expression: { emo: ACT.emo(t, [[0, 'resolve'], [b0, 'tender', { dur: 0.8 }]]), ...ACT.lead(t, [[0, [0.6, 0.4]], [b0 - 0.1, [0.9, -0.4]]], 0.5, 0.14) }, t: T, key: 'lg-u' }) },
        { z: 1.4, haze: false, draw: (g) => { for (let i = 0; i < 26; i++) { const u = (T * 0.12 * (0.6 + hash(i, 1)) + hash(i, 2)) % 1; g.globalAlpha = 0.9; g.fillStyle = i % 2 ? '#ffb0c8' : '#fff0f4'; g.beginPath(); g.ellipse(1080 * hash(i, 3) + 60 * Math.sin(T + i), 1500 * u, 12, 7, T + i, 0, TAU); g.fill(); } g.globalAlpha = 1; } },
      ] });
      TY.plaque(ctx, T, clamp((t - b1 + 0.2) / 0.5), 'Girika', 'his queen, far away', { x: 800, y: 300, out: clamp((t - (env.dur - 0.3)) / 0.25) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.24, vignette: 0.42, paper: 0.3 }) });

  // 4 · LEAF: his two hands fold a broad leaf into a packet; a hawk takes it; a crane up with the hawk into the open
  const packet = (g, x, y, s, k) => { g.save(); g.translate(x, y); g.fillStyle = '#3a9a3a'; g.beginPath(); g.ellipse(0, 0, lerp(120, 44, k) * s, lerp(60, 34, k) * s, 0.2, 0, TAU); g.fill(); g.strokeStyle = '#1c5a22'; g.lineWidth = 5 * s; g.beginPath(); g.moveTo(-lerp(120, 44, k) * s, 0); g.lineTo(lerp(120, 44, k) * s, 0); g.stroke(); if (k > 0.8) { g.strokeStyle = '#ffe08a'; g.lineWidth = 5 * s; g.beginPath(); g.moveTo(0, -34 * s); g.lineTo(0, 34 * s); g.stroke(); } g.restore(); };
  R.scene({ id: 'leaf', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.8, b1 = env.beats[1] ?? 3.9, fold = E.inOutSine(clamp((t - 0.3) / (b0 - 0.3))), up = E.inQuad ? E.inQuad(clamp((t - b1) / 1.2)) : clamp((t - b1) / 1.2) ** 2;
      const cam = CAM.crane(clamp((t - b1 + 0.2) / 1.4), { from: 1.14, to: 1.0, y0: 40, y1: -520 });
      ST.shot(ctx, T, { pal: 'hunt-emerald', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ }) },
        { z: 0.35, draw: (g, p) => ST.treeline(g, p, { y: HZ + 20, h: 1000, gap: 360, T, seed: 123, kind: 'flame' }) },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
          CH.uparichara.draw(g, { x: 330, y: GY + 10, scale: 1.0, facing: 'right', pose: ACT.pose(t, [[0, 'offer'], [b1 - 0.2, 'reach', { act: 0.4 }], [b1 + 0.6, 'stand', { act: 0.6 }]]), light: ST.light(p, { from: [860, 300], at: [330, GY], front: 0.3 }), expression: { emo: 'resolve', ...ACT.lead(t, [[0, [0.5, 0.6]], [b0 + 0.2, [0.9, -0.6]]]) }, t: T, key: 'lf-u' });
          if (t < b1 + 0.05) packet(g, 600, GY - 620, 0.7, fold);
          const hx = lerp(1300, 760, E.outCubic(clamp((t - b0 - 0.3) / (b1 - b0 - 0.3)))) , hy = lerp(200, GY - 560, E.outCubic(clamp((t - b0 - 0.3) / (b1 - b0 - 0.3)))) - 1500 * up;
          if (t > b0 + 0.3) { CH.hawk.draw(g, { x: hx, y: hy, scale: 0.7, facing: 'left', pose: { name: 'fly', phase: T * 9, packet: t > b1 }, light: bright, t: T, key: 'lf-h' }); }
        } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'pollen', count: 36, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.26, vignette: 0.42, paper: 0.3 }) });

  // 5 · FELL: two hawks tumbling against the bright sky; the green packet drops; a tilt down with it to the river
  R.scene({ id: 'fell', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 1.3, b1 = b[1] ?? 2.9, b2 = b[2] ?? 4.3, k = clamp((t - b1) / (b2 - b1)), cam = CAM.tilt(E.inOutSine(k), { from: -40, to: 1000, zoom: 1.08 });
      const strike = E.outCubic(clamp((t - b1 + 0.5) / 0.5)), py = lerp(520, 1960, k * k);
      ST.shot(ctx, T, { pal: 'crystal-sky', cam, layers: [
        { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 2100, sun: [820, 380, 110] }); } },
        { z: 0.2, draw: (g, p) => ST.cloudBank(g, p, T, { y: 760, count: 6, size: 2, speed: 30 }) },
        { z: 1, haze: false, draw: (g, p) => { ST.water(g, p, { y0: 1900, y1: 3200, T, flow: 60, count: 80 });
          CH.hawk.draw(g, { x: 430 + 60 * Math.sin(T * 5) * strike, y: 560 + 40 * Math.cos(T * 6) * strike, scale: 0.7, facing: 'right', pose: { name: 'fly', phase: T * 11, packet: t < b1 }, light: bright, t: T, key: 'fl-a' });
          CH.hawk.draw(g, { x: lerp(1400, 640, strike) - 50 * Math.sin(T * 5) * strike, y: lerp(200, 520, strike) - 30 * Math.cos(T * 6) * strike, scale: 0.74, facing: 'left', pose: { name: 'fly', phase: T * 12 + 1 }, light: { ...bright, tint: ['#5a3a2a', 0.5] }, t: T, key: 'fl-b' });
          if (t > b1) packet(g, 540 + 30 * Math.sin(k * 9), py, 1, 1);
          const sp = clamp((t - b2) / 0.6); if (sp > 0 && sp < 1) { g.strokeStyle = 'rgba(240,250,255,' + (1 - sp) + ')'; g.lineWidth = 8; g.beginPath(); g.ellipse(540, 1960, 300 * sp, 54 * sp, 0, 0, TAU); g.stroke(); }
        } },
        { z: 1.4, haze: false, draw: (g) => { const fe = Math.sin(Math.PI * clamp((t - b1) / 1.2)); g.fillStyle = '#c8a070'; for (let i = 0; i < 8; i++) { g.globalAlpha = fe; g.beginPath(); g.ellipse(520 + 200 * (hash(i, 1) - 0.5), 560 + 400 * hash(i, 2) * clamp((t - b1) / 1.2), 16, 5, i, 0, TAU); g.fill(); } g.globalAlpha = 1; } },
      ] });
      TY.plaque(ctx, T, clamp((t - b0) / 0.5), ...names(env, 'Yamuna'), { x: 300, y: 1250, out: clamp((t - b1) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.36, paper: 0.3 }) });

  // 6 · FISH (the signature shot): under water: the focus racks from the weed to the great fish rising to the sinking leaf;
  //     as she turns, her shadow on the river bed is a woman's, with a diadem
  R.scene({ id: 'fish', transition: { type: 'smoke', dur: 0.7, dir: Math.PI / 2, color: '#0c4a78' },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 0.4, b1 = b[1] ?? 2, b2 = b[2] ?? 3.4, cam = CAM.rack(clamp((t - 0.2) / 0.9), { from: 1.9, to: 1.0, zoom: 1.12, y: 60 });
      const rise = E.inOutSine(clamp((t - 1.0) / (b1 - 0.9))), ly = lerp(-200, 820, clamp(t / b1)), fx = lerp(1700, 600, rise), fy = lerp(1300, 980, rise), sh = E.outCubic(clamp((t - b1 - 0.2) / 0.8));
      under(ctx, T, cam, (g) => { if (t < b1) packet(g, 540 + 30 * Math.sin(t * 3), ly, 0.9, 1); fish(g, T, fx, fy, 0.9); },
        { weedSoft: 0, bed: (g) => { if (sh <= 0) return; g.save(); g.globalAlpha = 0.55 * sh; g.fillStyle = '#01101e'; g.translate(520, 1640); g.scale(1, 0.34);   // her shadow on the bed: a woman lying, a diadem at her brow
          g.beginPath(); g.ellipse(0, 0, 360, 110, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(-400, -10, 80, 0, TAU); g.fill(); g.beginPath(); g.moveTo(-470, -70); g.lineTo(-440, -200); g.lineTo(-410, -100); g.lineTo(-380, -220); g.lineTo(-350, -90); g.closePath(); g.fill(); g.restore(); } });
      TY.plaque(ctx, T, clamp((t - b1) / 0.5), ...names(env, 'Adrika'), { x: 540, y: 330, out: clamp((t - (env.dur - 0.35)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.32, vignette: 0.5, paper: 0.3 }) });

  // 7 · FOUND (the turn, after a silence): the fishers' shore at dusk: a fisherman kneeling, his face lit from below by a soft
  //     light in the basket before him: two small heads. (No knife, no wound: the light opens.)
  const basket = (g, x, y, open) => { g.fillStyle = '#5a3a1a'; g.beginPath(); g.moveTo(x - 190, y - 130); g.quadraticCurveTo(x - 170, y + 20, x, y + 24); g.quadraticCurveTo(x + 170, y + 20, x + 190, y - 130); g.closePath(); g.fill(); g.strokeStyle = '#8a6030'; g.lineWidth = 4; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(x - 170 + i * 56, y - 126); g.lineTo(x - 130 + i * 44, y + 14); g.stroke(); }
    if (open > 0) { KIT.glow(g, x, y - 170, 520 * open, '#fff0c0', 0.75 * open); EP49.infant(g, x - 40, y - 150, 0.9 * open, 0); EP49.infant(g, x + 90, y - 190, 0.8 * open, 0, '#ffe8f0'); } };
  R.scene({ id: 'found', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 1.2, b1 = b[1] ?? 3.3, b2 = b[2] ?? 5.2, cam = CAM.mix(CAM.push(clamp(t / env.dur), { from: 1.04, to: 1.24, focus: [560, 1000] }), CAM.still({ y: 190 })), open = E.outCubic(clamp((t - b1 - 0.1) / 0.9));
      EP49.shore(ctx, T, cam, { figs: (g, p) => {
        basket(g, 420, GY + 10, open);
        CH.dasha.draw(g, { x: 830, y: GY + 12, scale: 1.0, facing: 'left', pose: ACT.pose(t, [[0, 'carry'], [b0, 'kneel', { act: 0.6 }], [b2 - 0.2, 'recoil', { act: 0.35 }]], { prop: false }), light: { ...ST.light(p, { from: [420, 1300], at: [830, GY], front: 0.3 + 0.5 * open, k: 1.1 + 0.3 * open }), tint: ['#fff0c0', 0.6 * open] }, expression: { emo: ACT.emo(t, [[0, 'sorrow'], [b1, 'shock', { dur: 0.3 }], [b2, 'wonder']]), gaze: [0.6, 0.7] }, t: T, key: 'fd-d' });
      } });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.3 }) });

  // 8 · BOY: the king lifts a boy; beyond the pillars, in the pearl sky, the fish's silver skin falls back and a woman rises
  R.scene({ id: 'boy', transition: { type: 'lamp', dur: 0.8, from: [420, 1150], to: [540, 700] },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 1.2, b1 = b[1] ?? 2.4, b2 = b[2] ?? 4.4, cam = CAM.tilt(E.inOutSine(clamp((t - b1 + 0.3) / 1.6)), { from: 70, to: -70, zoom: 1.08 }), lift = E.inOutSine(clamp((t - b0 + 0.3) / 0.8)), rise = E.inOutSine(clamp((t - b1) / 2.2));
      ST.shot(ctx, T, { pal: 'riverbank-pearl', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1300 }) },
        { z: 0.3, draw: (g, p) => { ST.pillars(g, p, { y: 1320, n: 4 }); ST.cloudBank(g, p, T, { y: 300, count: 5, size: 1.6 }); } },
        { z: 0.6, haze: false, draw: (g, p) => { if (rise <= 0.02) return; const ax = 850, ay = lerp(1250, 760, rise);   // the apsara, freed: her own colours against a soft light
          KIT.glow(g, ax, ay - 380, 520, '#fff8e0', 0.55 * Math.min(1, rise * 2));
          CH.menaka.draw(g, { x: ax, y: ay, scale: 0.66, facing: 'left', pose: ACT.pose(t, [[0, 'stand'], [b2 - 0.5, 'bless', { act: 0.7 }]], { wind: 0.8 }), light: { ...ST.light(p, { from: [540, 100], at: [ax, ay], front: 0.35, k: 1.0 }) }, expression: { emo: 'joy' }, t: T, key: 'by-a' });
          g.fillStyle = '#d8e8f0'; for (let i = 0; i < 16; i++) { const u = clamp(rise * 1.6 - hash(i, 1) * 0.5); g.globalAlpha = 1 - u; g.beginPath(); g.ellipse(ax + 260 * (hash(i, 2) - 0.5), ay + 40 + 420 * u, 26, 10, i, 0, TAU); g.fill(); } g.globalAlpha = 1; } },
        { z: 0.7, haze: false, draw: (g) => ST.mist(g, T, { y: 1060, h: 300, alpha: 0.5 }) },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
          CH.uparichara.draw(g, { x: 560, y: GY + 10, scale: 0.94, facing: 'left', pose: ACT.pose(t, [[0, 'attend'], [b0 - 0.3, 'carry', { act: 0.6 }]]), light: ST.light(p, { from: [300, 200], at: [560, GY], front: 0.25 }), expression: { emo: 'tender', gaze: [0.5, 0.5] }, t: T, key: 'by-u' });
          EP49.infant(g, lerp(290, 470, lift), lerp(GY - 380, GY - 690, lift), 0.95, 0.7);
          CH.dasha.draw(g, { x: 130, y: GY + 12, scale: 0.88, facing: 'right', pose: ACT.pose(t, [[0, 'offer'], [b0 + 0.4, 'anjali', { act: 0.6 }]], { prop: false }), light: ST.light(p, { from: [300, 200], at: [130, GY], front: 0.25 }), expression: { emo: 'wonder' }, t: T, key: 'by-d' });
        } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'pollen', count: 40, cam }) },
      ] });
      TY.plaque(ctx, T, clamp((t - b0) / 0.5), ...names(env, 'Matsya'), { x: 300, y: 250, out: clamp((t - b1 - 0.1) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.38, vignette: 0.38, paper: 0.3 }) });

  // 9 · GIRL: the fisherman receives the small girl in both arms and turns away with her along the shore, past the hanging nets
  R.scene({ id: 'girl', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 1.5, b2 = env.beats[2] ?? 3.3, cam = CAM.slide(t / env.dur, { from: -120, to: 120, zoom: 1.1 }), d = 150 * Math.max(0, t - b2) * E.outCubic(clamp((t - b2) / 0.5)), turned = t > b2 - 0.1;
      EP49.shore(ctx, T, cam, { figs: (g, p) => { const x = 420 + d;
        CH.dasha.draw(g, { x, y: GY + 12, scale: 1.02, facing: turned ? 'right' : 'left', pose: ACT.pose(t, [[0, 'offer'], [b1 - 0.2, 'carry', { act: 0.6 }], [b2, 'walk', { act: 0.4 }]], { phase: ACT.stride(d, 1.0), prop: false }), light: ST.light(p, { from: [820, 800], at: [x, GY], front: 0.3 }), expression: { emo: 'tender', gaze: [0.4, 0.6] }, t: T, key: 'gl-d' });
        if (t > b1 - 0.2) EP49.infant(g, x + (turned ? 100 : -100), GY - 640, 1.0, 0.5, '#ffe8f0');
        else EP49.infant(g, lerp(-80, x - 100, E.outCubic(clamp(t / (b1 - 0.2)))), GY - 640, 1.0, 0.5, '#ffe8f0'); } });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.45, paper: 0.3 }) });

  // 10 · NAME (a second silence before it): years in one orbit: the child, a girl, a young woman with an oar in the stern of a boat
  R.scene({ id: 'name', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 2, b2 = b[2] ?? 5, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 130, zoom: 1.1 }), grow = E.inOutSine(clamp(t / (b1 + 0.6)));
      EP49.shore(ctx, T, cam, { nets: false, figs: (g, p) => {
        EP49.boat(g, 560, GY + 30, 1.0);
        const s = lerp(0.5, 1.0, grow);
        CH.satyavati.draw(g, { x: 760, y: GY - 30, scale: s, facing: 'left', pose: ACT.pose(t, [[0, 'stand'], [b1, 'row', { act: 0.8 }]], { prop: grow > 0.8 ? 'oar' : false, phase: T * 1.6 }), light: ST.light(p, { from: [820, 800], at: [760, GY], front: 0.3 }), expression: { emo: ACT.emo(t, [[0, 'joy'], [b1, 'resolve']]), gaze: [0.7, 0] }, t: T, key: 'nm-s' });
        const a = E.outCubic(clamp((t - b2 + 0.4) / 0.9)); if (a > 0) { KIT.glow(g, 180, 700, 380 * a, '#ffcf7a', 0.6 * a); g.save(); g.beginPath(); g.rect(-300, 1000 - 900 * a, 1000, 900 * a + 30); g.clip(); CH.vyasaSage.draw(g, { x: 180, y: 1010, scale: 0.42, facing: 'right', pose: { w: { stand: 1 }, prop: false }, light: { dir: -Math.PI / 2, intensity: 1.2, front: 0.05, fill: 0, tint: ['#ffcf7a', 0.6] }, expression: { emo: 'calm' }, t: T, key: 'nm-v' }); g.restore(); }   // far behind her, the poet she will bear
      } });
      TY.plaque(ctx, T, clamp((t - b1 + 0.6) / 0.6), ...names(env, 'Satyavati'), { x: 320, y: 420, out: clamp((t - (env.dur - 0.4)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.45, paper: 0.3 }) });

  // 11 · CLIFF: the river in lavender mist: her boat at the bank, she small in its stern; on the far path, back to us, a tall
  //      sage with a staff stops and looks out over the water (the text: he saw her as she plied the boat)
  const cliff = (ctx, T, t, env, b) => {
    const cam = CAM.drift(CAM.pull(clamp(t / 5.5), { from: 1.34, to: 1.02, focus: [700, 1150] }), T, 1.8), come = E.outCubic(clamp((t - b[2] + 0.5) / 1.4));
    EP49.river(ctx, T, cam, { pal: 'mist-lavender', hz: 860, mist: 0.5,
      far: (g, p) => { g.fillStyle = p.near; g.fillRect(-900, 860, 2880, 40); const sx = lerp(-200, 190, come); CH.parashara.draw(g, { x: sx, y: 884, scale: 0.36, facing: 'right', pose: ACT.pose(t, [[0, 'walk'], [b[2] + 0.5, 'stand', { act: 0.5 }]], { phase: ACT.stride(390 * come, 0.36), prop: 'staff' }), light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.04, fill: 0 }, expression: { emo: 'calm' }, t: T, key: 'cl-p' }); },
      figs: (g, p) => { EP49.boat(g, 700, 1290, 0.9); CH.satyavati.draw(g, { x: 880, y: 1240, scale: 0.8, facing: 'left', pose: ACT.pose(t, [[0, 'row']], { prop: 'oar', phase: T * 1.6 }), light: { ...ST.light(p, { from: [300, 300], at: [880, 1240], front: 0.2 }) }, expression: { emo: 'calm', gaze: [0.6, 0.1] }, t: T, key: 'cl-s' }); } });
    TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 110 });
    fin(ctx, T);
  };
  const CL = { dur: 5.18, b: [1.57, 3.18, 4.41] };
  R.scene({ id: 'cliff', transition: { type: 'smoke', dur: 0.7, dir: 0, color: '#8a7ec0' }, draw(ctx, t, env) { cliff(ctx, env.T, t, env, env.beats.length > 2 ? env.beats : CL.b); }, post: () => ({ bloom: 0.3, vignette: 0.42, paper: 0.3 }) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, CL.dur + t, env, CL.b) });
})();
