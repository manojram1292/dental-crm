/* Episode 43 · The Curse on Fire (CE Adi 1.6.13, 1.7.1–26). One scene per line of script/ep43.en.json.
 * Loads after ep41/_common (EP41). Agni is the series' flame and a voice: no face. No thrown water. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41;
  const { TAU, clamp, lerp, E, hash } = R;
  const GY = EP41.GY, HZ = EP41.HZ;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const names = (env, n) => [n, env.script.names[n]];
  const FIRE = { bloom: 0.46, vignette: 0.5, paper: 0.3 };

  // a small altar and its layered flame (k: 0 = out, a thread of grey smoke; pure: clear gold-white)
  const altar = (g, x, y, s, T, k, seed, pure = 0, smoke = 1) => {
    g.fillStyle = '#3a2418'; g.beginPath(); g.moveTo(x - 70 * s, y); g.lineTo(x + 70 * s, y); g.lineTo(x + 54 * s, y - 44 * s); g.lineTo(x - 54 * s, y - 44 * s); g.closePath(); g.fill();
    g.fillStyle = '#5a3a26'; g.fillRect(x - 60 * s, y - 52 * s, 120 * s, 10 * s);
    if (k < 0) return;
    if (k > 0.03) { const h = 230 * s * k, w = 60 * s * (0.6 + 0.4 * k), sw = 10 * s * Math.sin(T * 6 + seed), cols = pure > 0.5 ? ['#ffd070', '#fff0b0', '#ffffff'] : ['#c8341a', '#f08a24', '#ffe08a'];
      KIT.glow(g, x, y - 60 * s - h * 0.4, h * 1.6, pure > 0.5 ? '#fff0c0' : '#f08a24', 0.35 * k);
      cols.forEach((c, i) => { const q = 1 - i * 0.3; g.fillStyle = c; g.beginPath(); g.moveTo(x - w * q, y - 50 * s); g.quadraticCurveTo(x - w * q * 1.1, y - 50 * s - h * q * 0.5, x + sw * q, y - 50 * s - h * q); g.quadraticCurveTo(x + w * q * 1.1, y - 50 * s - h * q * 0.5, x + w * q, y - 50 * s); g.closePath(); g.fill(); });
    } else if (smoke > 0) { g.save(); g.strokeStyle = 'rgba(190,196,210,0.55)'; g.lineWidth = 5 * s; g.beginPath(); g.moveTo(x, y - 54 * s); for (let i = 1; i <= 8; i++) g.lineTo(x + 16 * s * Math.sin(i * 0.9 + T * 1.3 + seed), y - 54 * s - i * 46 * s * smoke); g.stroke(); g.restore(); }
  };
  // a land of altars and hearths, far to near; lit(i, u) → the flame's size for altar i at depth u (0 far … 1 near)
  const LH = 840;   // the land's horizon: high, so the field of altars fills the frame
  const SPOTS = Array.from({ length: 13 }, (_, i) => { const u = i / 12; return { u, x: 540 + (hash(i, 31) - 0.5) * (420 + 500 * u) + (i % 2 ? 150 : -150), y: lerp(LH + 50, 1840, Math.pow(u, 1.4)), s: lerp(0.34, 1.25, u) }; });
  const land = (ctx, T, cam, pal, lit, o = {}) => ST.shot(ctx, T, { pal, cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: LH }) },
    { z: 0.2, draw: (g, p) => { ST.cloudBank(g, p, T, { y: 300, count: 5, size: 1.4 }); ST.hills(g, p, { y: LH, h: 360, seed: 21 }); } },
    { z: 0.5, draw: (g, p) => ST.treeline(g, p, { y: LH + 20, h: 420, T, seed: 23, kind: 'mixed' }) },
    { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: LH + 10 });
      for (const [i, sp] of SPOTS.entries()) { if (sp.u > 0.8) continue; altar(g, sp.x, sp.y, sp.s, T, lit(i, sp.u), i, o.pure || 0); }
      if (o.figs) o.figs(g, p); } },
    { z: 1.5, haze: false, draw: (g) => { for (const [i, sp] of SPOTS.entries()) if (sp.u > 0.8) altar(g, sp.x, sp.y, sp.s, T, lit(i, sp.u), i, o.pure || 0); } },
  ] });

  // 1 · HOOK: a fire on its altar against lapis night, eating whatever falls into it
  const THINGS = [['#7a4a2a', 60, 16], ['#b02a3a', 46, 30], ['#f0c040', 40, 40], ['#e8e0d0', 56, 12]];   // wood, cloth, a garland, a bone
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.8, cam = CAM.drift(CAM.push(clamp(t / 3.2), { from: 0.9, to: 1.25, focus: [330, 1000], ease: E.outCubic }), T, 0.5);
      const flare = Math.sin(Math.PI * clamp((t - b0) / 0.45));
      ST.shot(ctx, T, { pal: 'pure-flame', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ }) },
        { z: 0.4, draw: (g, p) => ST.hills(g, p, { y: HZ, h: 300, seed: 3 }) },
        { z: 0.6, haze: false, draw: (g) => { KIT.glow(g, 330, GY - 560, 1300, '#ff7a1e', 0.42 + 0.2 * flare); } },
        { z: 0.8, haze: false, draw: (g) => { CH.hearthfire.draw(g, { x: 330, y: GY - 10, scale: 1.7, t: T, k: 1.1 + 0.22 * flare, key: 'hk' });
          THINGS.forEach(([c, w, h], i) => { const t0 = b0 - 0.45 + i * 0.75 - (i ? 0.2 : 0), u = clamp((t - t0) / 0.45); if (u <= 0 || u >= 1) return; g.save(); g.translate(lerp(330 + (i % 2 ? 420 : -420), 330, u), lerp(GY - 900, GY - 330, u * u)); g.rotate(u * 5 + i); g.fillStyle = c; g.globalAlpha = 1 - u * u * 0.6; g.fillRect(-w / 2, -h / 2, w, h); g.restore(); }); } },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 }); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(330, GY + 50); g.scale(1, 0.2); KIT.glow(g, 0, 0, 1000, '#ff8a2a', 0.5); g.restore(); } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 70, box: [-90, 60, 860, 1180], cam }) },
      ] });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, clamp(t / 0.25), line.text, { y: 1480, size: 76, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.15) / 0.6);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 1500, key: 'ep43-title' });
      fin(ctx, T);
    },
    post: () => FIRE });

  // 2 · BECAUSE: the hut's fire; in its smoke, the boar and the woman (a memory, one image)
  R.scene({ id: 'because', transition: { type: 'smoke', dur: 0.7, dir: -Math.PI / 2, color: '#7a3a1a' },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 5, cam = CAM.slide(t / env.dur, { from: 110, to: -110, zoom: 1.1 });
      // the memory, one image: the boar running with her through the dusk; it surges on "demon" (foley: hooves@1)
      const surge = Math.sin(Math.PI * clamp((t - b1) / 0.5)), x = 720 - 26 * t - 70 * surge;
      EP41.chase(ctx, T, cam, (g, p) => { CH.boar.draw(g, { x, y: EP41.CG + 10, scale: 0.82, pose: { name: 'run', phase: T * 13 }, light: ST.light(p, { from: [200, 300], at: [x, EP41.CG], k: 1.1 }), t: T, key: 'be-b' }); EP41.rider(g, p, T, x, EP41.CG + 10, 0.82); });
      ST.vignette(ctx, { color: '#10041a', alpha: 0.5 });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 3.2) / 0.4)), env.strings, { y: 190 });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.5, paper: 0.28 }) });

  // 3 · CURSE (the close-up): Bhrigu's face, wrath; the arm thrown forward on "eat" (foley: whoosh@0), the fire's light drops (sizzle@1)
  R.scene({ id: 'curse', transition: { type: 'ink', dur: 0.6, at: [600, 760] },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.7, b1 = env.beats[1] ?? 2, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.12, focus: [520, 760] }), hit = E.outCubic(clamp((t - b1) / 0.4));
      ST.shot(ctx, T, { pal: 'wrath-crimson', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500 }) },
        { z: 0.3, soft: 0.45, draw: (g, p) => ST.treeline(g, p, { y: 1500, h: 1300, gap: 480, T, seed: 5, kind: 'mixed' }) },
        { z: 0.6, haze: false, draw: (g) => KIT.glow(g, 80, 1300, 1100, '#ff6a20', 0.5 * (1 - 0.6 * hit)) },
        { z: 1, haze: false, draw: (g, p) => CH.bhrigu.draw(g, { x: 700, y: 3200, scale: 2.5, facing: 'left', pose: ACT.pose(t, [[0, 'stand'], [b0 - 0.5, 'raise', { act: 0.3, an: 0.08 }], [b0 - 0.12, 'curse', { antic: 0.1, act: 0.13, settle: 0.4, over: 0.1 }]], { prop: false, wind: 0.6 }),
          light: { ...ST.light(p, { from: [80, 1300], at: [600, 1200], k: 1.2 * KIT.flicker(T, 2), front: lerp(0.8, 0.5, hit) }), tint: ['#ffb050', 0.4] }, expression: { emo: 'wrath', speak: EP41.mouth(env, t), gaze: [0.8, 0.4] }, t: T, key: 'cu-b' }) },
        { z: 1.5, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 30, cam }) },
      ] });
      TY.plaque(ctx, T, clamp((t - 0.3) / 0.5), ...names(env, 'Bhrigu'), { x: 250, y: 250, out: clamp((t - (env.dur - 0.35)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.5, paper: 0.28 }) });

  // 4 · TRUTH: the flame drawn up tall and steady; above it, in its smoke, the gods who are fed through it
  R.scene({ id: 'truth', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 3, b2 = env.beats[2] ?? 4.9, cam = CAM.tilt(clamp(t / 3.2), { from: 120, to: -330, zoom: 1.2 });
      EP41.hearth(ctx, T, cam, { fire: 1.3, fs: 1.6, fx: 540, lean: 0.03 * Math.sin(T * 1.2), smoke: (g) => {
        g.save(); g.fillStyle = '#ffe08a'; for (let i = 0; i < 16; i++) { const u = (T * 0.22 + hash(i, 5)) % 1, a = clamp((t - b1 + 0.3) / 0.7) * (1 - u); g.globalAlpha = a; g.beginPath(); g.arc(540 + 150 * (hash(i, 6) - 0.5) + 40 * Math.sin(T + i), GY - 700 - 900 * u, 7 + 5 * hash(i, 7), 0, TAU); g.fill(); } g.restore();   // what is offered rises through him to the gods
        // on "everything": a bone and a rag fall in at the edge
        [[b2, -330, '#e8e0d0'], [b2 + 0.25, 330, '#7a2a3a']].forEach(([t0, dx, c], i) => { const u = clamp((t - t0) / 0.5); if (u <= 0 || u >= 1) return; g.save(); g.translate(540 + dx * (1 - u), lerp(GY - 800, GY - 300, u * u)); g.rotate(u * 4 + i); g.fillStyle = c; g.fillRect(-28, -8, 56, 16); g.restore(); });
      } });
      fin(ctx, T);
    },
    post: () => FIRE });

  // 5 · GONE (the signature shot, after a silence): a crane up over a land of altars; flame after flame goes out, far to near
  const outAt = (u) => 1.2 + 2.6 * u;
  R.scene({ id: 'gone', transition: { type: 'dissolve', dur: 0.5 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.crane(t / env.dur, { from: 1.3, to: 1.0, y0: 260, y1: -40 });
      land(ctx, T, cam, 'cold-slate', (i, u) => 1 - E.outCubic(clamp((t - outAt(u)) / 0.35)));
      const dim = E.inOutSine(clamp((t - 1) / 3)); ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = KIT.hex('#ffffff', '#8a94b0', dim); ctx.fillRect(0, 0, R.W, R.H); ctx.restore();
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.26, vignette: 0.5, paper: 0.3 }) });

  // 6 · DARK: priests over cold altars; no offering rises; a lateral track past them
  R.scene({ id: 'dark', transition: { type: 'dissolve', dur: 0.3 },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 2.5, cam = CAM.slide(t / env.dur, { from: -130, to: 130, zoom: 1.14, y: 60 });
      land(ctx, T, cam, 'cold-slate', (i, u) => (u > 0.45 && u < 0.8 ? -1 : 0), { figs: (g, p) => {
        // two forest sages before a cold altar: one bowed, one with empty hands held out; the ladle's motion on "world" (foley: drip@1)
        const L = (x) => ({ ...ST.light(p, { from: [540, 300], at: [x, 1380], front: 0.9, k: 1.3 }), tint: ['#dfe8ff', 0.5] });
        CH.khagama.draw(g, { x: 250, y: 1385, scale: 0.9, facing: 'right', pose: ACT.pose(t, [[0, 'offer'], [b1 - 0.2, 'grieve', { act: 0.6 }]]), light: L(250), expression: { emo: 'sorrow', gaze: [0.4, 0.6] }, t: T, key: 'dk-1' });
        altar(g, 560, 1390, 1.7, T, 0, 5, 0, 1);
        CH.sahasrapat.draw(g, { x: 870, y: 1385, scale: 0.9, facing: 'left', pose: 'kneel', light: L(870), expression: { emo: 'sorrow', gaze: [0.3, 0.7] }, t: T, key: 'dk-2' });
      } });
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#8a94b0'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore();
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.2, vignette: 0.5, paper: 0.3 }) });

  // 7–8 · Brahma's court (brahma-rose): a tilt up through cloud; then Brahma and the small dark flame that stands before him
  const court = (ctx, T, cam, figs) => ST.shot(ctx, T, { pal: 'brahma-rose', cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500, sun: [540, 300, 120] }) },
    { z: 0.2, draw: (g, p) => ST.cloudBank(g, p, T, { y: 500, count: 6, size: 1.6 }) },
    { z: 0.5, draw: (g, p) => { ST.pillars(g, p, { y: 1420, n: 4 }); ST.cloudBank(g, p, T, { y: 1500, count: 5, size: 1.8 }); } },
    { z: 1, haze: false, draw: (g, p) => figs(g, p) },
    { z: 1.5, haze: false, draw: (g, p) => ST.cloudBank(g, p, T, { y: 1900, count: 6, size: 2.2, speed: 20 }) },
    { z: 1.6, haze: false, draw: (g) => ST.particles(g, T, { kind: 'pollen', count: 30, cam }) },
  ] });
  const brahma = (g, p, T, x, y, s, pose, speak) => CH.brahma.draw(g, { x, y, scale: s, facing: 'left', pose, light: { dir: -Math.PI / 2 - 0.3, intensity: 1.25, front: 0.85, fill: 0.55 }, expression: { speak: speak || 0 }, t: T, key: 'br' });
  R.scene({ id: 'went', transition: { type: 'brush', dur: 0.5, angle: -0.3, color: '#f4d8e0' },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 3.3, cam = CAM.tilt(E.inOutSine(clamp(t / 3.2)), { from: 560, to: -40, zoom: 1.12 });
      court(ctx, T, cam, (g, p) => {
        brahma(g, p, T, 720, 1380, 0.95, { name: 'sit' });
        const L = (x) => ({ ...ST.light(p, { from: [540, 200], at: [x, 1700], front: 0.6 }) }), come = E.outCubic(clamp(t / 2.4));
        for (let i = 0; i < 2; i++) CH.deva.draw(g, { x: 150 + i * 150 - 60 * (1 - come), y: 1560, scale: 0.62, facing: 'right', pose: { name: 'stand' }, light: L(200), t: T, key: 'w-d' + i });
        for (let i = 0; i < 2; i++) CH.sage.draw(g, { x: 90 + i * 190 - 90 * (1 - come), y: 1900, scale: 0.7, facing: 'right', pose: { name: 'stand' }, light: L(200), t: T, key: 'w-s' + i });
      });
      TY.plaque(ctx, T, clamp((t - b1 + 0.2) / 0.6), ...names(env, 'Brahma'), { x: 330, y: 330, out: clamp((t - (env.dur - 0.35)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.4, paper: 0.3 }) });
  R.scene({ id: 'pure', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 3.2, b1 = env.beats[1] ?? 7.4, cam = CAM.push(clamp(t / env.dur), { from: 1.0, to: 1.22, focus: [520, 900] }), pure = E.outCubic(clamp((t - b1) / 0.6));
      court(ctx, T, cam, (g, p) => {
        brahma(g, p, T, 760, 1180, 1.0, { name: ACT ? 'speak' : 'sit', k: 0.6 + 0.4 * E.outCubic(clamp((t - 1) / 0.6)) }, EP41.mouth(env, t));
        if (pure > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5 * pure; g.fillStyle = '#fff6d0'; g.beginPath(); g.moveTo(520, -400); g.lineTo(640, -400); g.lineTo(330, 1130); g.lineTo(150, 1130); g.closePath(); g.fill(); g.restore(); }   // the ray: as the sun's rays make clean what they touch
        CH.hearthfire.draw(g, { x: 240, y: 1180, scale: 0.78, t: T, k: lerp(0.62, 1.05, pure), dark: 0.85 * (1 - pure), pure, key: 'pu-f' });   // it turns clear gold-white on "pure" (foley: flame@1)
      });
      TY.turnWord(ctx, T, clamp((t - b1 - 0.1) / 0.6), 'Pure', { x: 260, y: 330, size: 88, out: clamp((t - (env.dur - 0.3)) / 0.3), sub: 'Adi 1.7.21' });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.4, paper: 0.3 }) });

  // 9 · BACK: the hearths and altars light again, near to far (the reverse of the signature shot), clear gold on lapis
  R.scene({ id: 'back', transition: { type: 'lamp', dur: 0.8, from: [260, 1000], to: [540, 1500] },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.9, b1 = env.beats[1] ?? 3.2, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 120, zoom: 1.1 });
      land(ctx, T, cam, 'pure-flame', (i, u) => E.outCubic(clamp((t - (b0 + (b1 - b0) * (1 - u))) / 0.35)) * 1.05, { pure: 1 });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.44, vignette: 0.45, paper: 0.3 }) });

  // 10 · FRAME: Sauti by the Naimisha fire at first light, a hand open to the flames; Shaunaka listening
  R.scene({ id: 'frame', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.6, cam = CAM.push(t / env.dur, { from: 1.04, to: 1.2, focus: [640, 800] }), tap = Math.sin(Math.PI * clamp((t - b0 + 0.1) / 0.24));
      EP41.naimisha(ctx, T, cam, { pal: 'naimisha-firstlight', figs: (g, p, fl) => {
        CH.elder.draw(g, { x: 215, y: GY + 20, scale: 1.02, facing: 'right', pose: { name: 'sit', base: 'sit' }, light: { dir: -2.4, intensity: 1.2, front: 0.04, fill: 0 }, t: T, key: 'f-el' });
        CH.sauti.draw(g, { x: 880, y: GY + 20, scale: 1.02, facing: 'left', pose: { name: 'speak', k: 0.7 + 0.3 * tap, base: 'sit' }, light: { dir: -2.4, intensity: 1.2, front: 0.04, fill: 0 }, expression: { speak: EP41.mouth(env, t) }, t: T, key: 'f-sa' });
      } });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.32, vignette: 0.45, paper: 0.3 }) });

  // 11 · CLIFF: a meadow path at dusk gone violet: an anklet in the near grass, out of focus; the focus racks to a small banded
  //      snake asleep across the path; it stirs on "snake"
  const cliff = (ctx, T, t, env, b0, b1) => {
    const cam = CAM.rack(clamp((t - b0 + 0.2) / 0.9), { from: 1.9, to: 1.0, zoom: 1.12, y: 0 }), stir = Math.sin(Math.PI * clamp((t - b1) / 0.7));
    ST.shot(ctx, T, { pal: 'venom-violet', cam, layers: [
      { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 940 }) },
      { z: 0.3, draw: (g, p) => ST.treeline(g, p, { y: 960, h: 640, T, seed: 31, kind: 'mixed' }) },
      { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: 950 });
        g.fillStyle = 'rgba(255,240,255,0.10)'; g.beginPath(); g.moveTo(420, 950); g.lineTo(540, 950); g.lineTo(1000, 1960); g.lineTo(60, 1960); g.closePath(); g.fill();   // the path
        CH.viper.draw(g, { x: 660, y: 1160, scale: 0.8, facing: 'left', pose: { name: 'strike', k: 0.12 * stir }, light: ST.light(p, { from: [200, 300], at: [660, 1160], front: 0.9, k: 1.3 }), t: T, key: 'cl-v' }); } },
      { z: 1.9, haze: false, draw: (g, p) => { ST.grass(g, p, { y: 1960, h: 520, T: T + 2 * Math.sin(Math.PI * clamp((t - b0) / 0.6)), count: 40 });   // the grass moves on "later" (foley: rustle@0)
        g.strokeStyle = '#ffe08a'; g.lineWidth = 12; g.beginPath(); g.ellipse(250, 1700, 90, 34, -0.2, 0, TAU); g.stroke(); g.fillStyle = '#ffe08a'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(250 + 90 * Math.cos(i * 1.05), 1700 + 40 * Math.sin(i * 1.05) + 14, 10, 0, TAU); g.fill(); } } },
    ] });
    TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 150 });
    fin(ctx, T);
  };
  const CL = { dur: 5.43, b: [1.17, 4.66] };
  R.scene({ id: 'cliff', transition: { type: 'smoke', dur: 0.7, dir: 0, color: '#4a2a6a' }, draw(ctx, t, env) { cliff(ctx, env.T, t, env, env.beats[0] ?? CL.b[0], env.beats[1] ?? CL.b[1]); }, post: () => ({ bloom: 0.28, vignette: 0.5, paper: 0.3 }) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, CL.dur + t, env, CL.b[0], CL.b[1]) });
})();
