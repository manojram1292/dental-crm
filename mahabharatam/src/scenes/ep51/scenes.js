/* Episode 51 · The Burden of the Earth (CE Adi 1.58.1–51, 1.59.3–4). One scene per line of script/ep51.en.json.
 * Loads after ep41/_common, ep46/_common (the hall of the frame), ep49/_common and ep51/_common.
 * The Earth is a woman (never a cow: the text has none); she has no words; Brahma, Narayana and Indra are whole, large
 * figures (never emblems). No fire in the first frame. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41, EP46 = window.EP46, EP51 = window.EP51;
  const { TAU, clamp, lerp, E, hash } = R;
  const GY = EP41.GY;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const names = (env, n) => [n, env.script.names[n]];
  const talk = (env, t) => EP41.mouth(env, t);
  const POST = (b = 0.3, v = 0.45) => () => ({ bloom: b, vignette: v, paper: 0.3 });
  const out = (t, env, d = 0.4) => clamp((t - (env.dur - d)) / 0.3);

  // the burden: a dark hill of towers, spears and beasts that rests on her shoulders; a few green eyes
  const burden = (g, x, y, w, h, T, k = 1) => {
    { const gr = g.createLinearGradient(0, y - h, 0, y); gr.addColorStop(0, '#5a2a14'); gr.addColorStop(1, '#1c0c08'); g.fillStyle = gr; } g.beginPath(); g.moveTo(x - w / 2, y); g.quadraticCurveTo(x - w * 0.52, y - h * 0.6, x - w * 0.24, y - h * 0.84); g.quadraticCurveTo(x, y - h * 1.02, x + w * 0.26, y - h * 0.82); g.quadraticCurveTo(x + w * 0.54, y - h * 0.56, x + w / 2, y); g.closePath(); g.fill();
    for (let i = 0; i < 26; i++) { const u = i / 25, px = x - w * 0.44 + w * 0.88 * u, top = y - h * (0.5 + 0.48 * Math.sin(Math.PI * u)) - 10; g.fillStyle = '#3a1a0e';
      if (i % 3 === 0) { g.fillRect(px - 16, top - 70 - 40 * hash(i, 1), 32, 120); g.beginPath(); g.moveTo(px - 22, top - 70 - 40 * hash(i, 1)); g.lineTo(px, top - 120 - 40 * hash(i, 1)); g.lineTo(px + 22, top - 70 - 40 * hash(i, 1)); g.closePath(); g.fill(); }   // towers
      else { g.fillRect(px - 2, top - 90 - 50 * hash(i, 2), 4, 110); }   // spears
    }
    g.strokeStyle = 'rgba(255,170,90,0.9)'; g.lineWidth = 7; g.beginPath(); g.moveTo(x - w * 0.45, y - h * 0.3); g.quadraticCurveTo(x - w * 0.3, y - h * 0.86, x, y - h * 0.98); g.stroke();
    for (let i = 0; i < 9; i++) { const ex = x - w * 0.36 + w * 0.72 * hash(i, 5), ey = y - h * (0.2 + 0.5 * hash(i, 6)); g.globalAlpha = k * (0.5 + 0.5 * Math.sin(T * 2 + i * 1.7)); g.fillStyle = '#7aff5a'; g.beginPath(); g.arc(ex, ey, 7, 0, TAU); g.arc(ex + 26, ey, 7, 0, TAU); g.fill(); } g.globalAlpha = 1;
  };
  const earthBowed = (g, p, T, t, x, y, s, key, emo = 'weary', sink = 0) => { g.save(); g.translate(x, y + sink); g.rotate(-0.2); CH.bhumi.draw(g, { x: 0, y: 0, scale: s, facing: 'left', pose: { w: { bow: 0.45, carry: 0.55 }, prop: false }, light: { dir: -Math.PI / 2 - 0.6, intensity: 1.2, front: 0.55, fill: 0.3, tint: ['#ffb070', 0.5], minLum: 0.25 }, expression: { emo, gaze: [0.2, 0.7] }, t: T, key }); g.restore(); };

  const BUR = 760;
  // 1 · HOOK: the Earth, large, bent under a dark mass; a tilt up from her bowed head to the mass
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.tilt(E.outCubic(clamp(t / 3.0)), { from: 200, to: -260, zoom: 1.1 }), T, 0.6), sink = 14 * Math.sin(T * 1.1);
      EP51.void(ctx, T, cam, 'dharma-copper', { gy: GY + 40, glow: [540, 500, 1300, '#e8803a', 0.5],
        back: (g, p) => ST.hills(g, p, { y: 1500, h: 260, seed: 201 }),
        figs: (g, p) => { burden(g, 600, BUR + sink, 900, 620, T); earthBowed(g, p, T, t, 600, GY + 60, 1.0, 'hk-e', 'weary', sink); },
        dust: 'ash', dustN: 26 });
      EP51.hook(ctx, T, t, env, { y: 1500 });
      fin(ctx, T);
    },
    post: POST(0.3, 0.5) });

  // 2 · SECRET (the frame): the teal hall: Vaishampayana answers the king, a finger raised
  R.scene({ id: 'secret', transition: { type: 'smoke', dur: 0.7, dir: -Math.PI / 2, color: '#1a4a5a' },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.9, b1 = env.beats[1] ?? 3, cam = CAM.push(t / env.dur, { from: 1.04, to: 1.2, focus: [520, 860] });
      EP46.hall(ctx, T, cam, { pal: 'satra-teal-night', fx: 130, fire: 0.9, fs: 1.0, figs: (g, p, fl) => {
        CH.kingJanamejaya.draw(g, { x: 930, y: GY - 30, scale: 0.92, facing: 'left', pose: { w: { sit: 1 } }, light: EP46.lit(930, fl, 0.6, 130), expression: { emo: ACT.emo(t, [[0, 'calm'], [b1, 'wonder']]), gaze: [0.7, 0.2] }, t: T, key: 'sc-k' });
        CH.vaishampayanaSage.draw(g, { x: 500, y: GY + 10, scale: 1.04, facing: 'right', pose: ACT.pose(t, [[0, 'speak'], [b1 - 0.3, 'point', { act: 0.4 }]], { prop: false }), light: { ...EP46.lit(500, fl, 0.9, 130), fill: 0.5, intensity: 1.5 }, expression: { emo: 'resolve', speak: talk(env, t), gaze: [0.8, 0.1] }, t: T, key: 'sc-v' });
      } });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 3.2) / 0.4)), env.strings, { y: 190 });
      TY.plaque(ctx, T, clamp((t - 0.95) / 0.6), ...names(env, 'Vaishampayana'), { x: 344, y: 760, size: 50, out: clamp((t - 2.6) / 0.3) });
      TY.plaque(ctx, T, clamp((t - 2.9) / 0.6), ...names(env, 'Janamejaya'), { x: 800, y: 640, size: 46, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.38, 0.5) });

  // 3 · KINGS: a bright land: a young king gives judgment, children run; far off, an axe-bearer walks away over a hill
  R.scene({ id: 'kings', transition: { type: 'brush', dur: 0.5, angle: 0.2, color: '#f4f8c8' },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 2.4, b2 = b[2] ?? 4.2, cam = CAM.crane(t / env.dur, { from: 1.22, to: 1.0, y0: -200, y1: 0 });
      EP51.land(ctx, T, cam, 'meadow-spring', { sun: [820, 430, 70], dust: 'pollen',
        far: (g, p) => { g.save(); g.globalAlpha = 1 - clamp((t - 2.6) / 0.6); CH.parashurama.draw(g, { x: 210 - 30 * t, y: 1225, scale: 0.3, facing: 'left', pose: { name: 'stand' }, light: { dir: -Math.PI / 2, intensity: 1, front: 0.5, fill: 0.3 }, t: T, key: 'kg-p' }); g.restore(); },
        figs: (g, p) => {
          g.fillStyle = '#7a4a1a'; g.fillRect(600, GY - 440, 260, 110); g.fillStyle = '#e7b54a'; g.fillRect(590, GY - 456, 280, 22);   // the low seat of judgment
          EP51.fig(g, T, 'yudhishthira', 730, GY - 250, 0.6, { f: 'left', pose: ACT.pose(t, [[0, 'sit'], [b1 - 0.4, 'bless', { act: 0.5 }]]), L: EP51.lit(p, 710, GY, { front: 0.35 }), ex: { emo: 'tender', gaze: [0.7, 0.2] }, key: 'kg-k' });
          for (let i = 0; i < 2; i++) EP51.fig(g, T, 'kacha', 380 - i * 120, GY - 250 + i * 10, 0.5, { f: 'right', pose: 'anjali', L: EP51.lit(p, 300, GY), ex: { emo: 'calm' }, key: 'kg-s' + i });
          const run = 260 * clamp((t - b2 + 0.5) / 1.6);
          for (let i = 0; i < 3; i++) EP51.fig(g, T, 'bharataChild', 1150 - run - i * 110, GY - 330 + i * 10, 0.5, { f: 'left', pose: ACT.pose(t, [[0, 'run']], { phase: T * 9 + i * 2 }), L: EP51.lit(p, 900, GY), ex: { emo: 'joy' }, key: 'kg-c' + i });
        } });
      TY.plaque(ctx, T, clamp((t - 0.8) / 0.5), ...names(env, 'Parashurama'), { x: 330, y: 330, size: 46, out: clamp((t - 2.5) / 0.3) });
      fin(ctx, T);
    },
    post: POST(0.3, 0.4) });

  // 4 · ASURAS: a tilt down a dark sky: horned figures fall, turn to points of sickly green light and sink into the land
  R.scene({ id: 'asuras', transition: { type: 'ink', dur: 0.6, at: [540, 500], color: '#12061c' },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 2.6, cam = CAM.tilt(E.inOutSine(clamp(t / env.dur)), { from: -90, to: 90, zoom: 1.08 });
      EP51.void(ctx, T, cam, 'venom-violet', { hz: 1560, gy: 1560,
        sky: (g) => { for (let i = 0; i < 40; i++) { g.globalAlpha = 0.5 * hash(i, 81); g.fillStyle = '#d8c8ff'; g.beginPath(); g.arc(1080 * hash(i, 82), -300 + 1500 * hash(i, 83), 3, 0, TAU); g.fill(); } g.globalAlpha = 1; },
        back: (g, p) => { ST.hills(g, p, { y: 1560, h: 300, seed: 207 }); ST.treeline(g, p, { y: 1580, h: 260, T, seed: 209, kind: 'sal' }); },
        figs: (g, p) => {
          for (let i = 0; i < 11; i++) { const u = clamp((t + 0.9 - i * 0.42) / 2.6), x = 150 + ((i * 3) % 8) * 112 + 30 * Math.sin(i * 3), y = 440 + 1180 * Math.pow(u, 1.4), k = clamp((u - 0.5) / 0.22);
            if (u <= 0 || u >= 1) continue;
            if (k < 1) { g.save(); g.globalAlpha = 1 - k; { const hg = g.createRadialGradient(x, y, 20, x, y, 330); hg.addColorStop(0, 'rgba(214,198,255,0.95)'); hg.addColorStop(0.5, 'rgba(176,150,240,0.55)'); hg.addColorStop(1, 'rgba(120,90,200,0)'); g.fillStyle = hg; } g.beginPath(); g.arc(x, y, 330, 0, TAU); g.fill(); g.translate(x, y); g.rotate(0.3 * Math.sin(i * 2.1) + (u - 0.3) * 0.5); CH.asura.draw(g, { x: 0, y: 270, scale: 0.52, index: i % 6, facing: i % 2 ? 'left' : 'right', pose: { name: 'cower', k: 0.8 }, light: { dir: -Math.PI / 2, intensity: 1.0, front: 0.2, fill: 0.1, tint: ['#c8a0ff', 0.5] }, t: T, key: 'as-' + i }); g.restore(); }
            KIT.glow(g, x, y, 60 + 160 * k, '#7aff5a', 0.9 * k); g.fillStyle = '#eaffd8'; g.globalAlpha = k; g.beginPath(); g.arc(x, y, 12, 0, TAU); g.fill(); g.globalAlpha = 1; }
          for (let i = 0; i < 7; i++) { const a = clamp((t - b1 - i * 0.25) / 0.6); KIT.glow(g, 120 + i * 140, 1590 + 30 * hash(i, 9), 90, '#7aff5a', 0.5 * a * (0.7 + 0.3 * Math.sin(T * 3 + i))); }
        } });
      TY.tag(ctx, T, clamp((t - 0.7) / 0.4), "asuras · the gods' rivals", { x: 540, y: 120, size: 50, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.4, 0.5) });

  // 5 · CRUSHED: a lateral track: a huge crowned king on a chariot, green-eyed beasts behind him; small people run
  R.scene({ id: 'crushed', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.slide(t / env.dur, { from: 170, to: -170, zoom: 1.12 }), d = 260 * (t / env.dur);
      EP51.land(ctx, T, cam, 'dice-vermilion', { trees: 'sal', dust: 'dust', dustN: 60, clouds: false,
        figs: (g, p) => {
          EP51.beast(g, 'elephant', 1130 - d, GY + 20, 0.95, { dir: -1, T, run: 0.6, phase: T * 5, eye: '#7aff5a', cols: ['#1a1216', '#5a3a40', '#f0e0c0'] });
          EP51.beast(g, 'cow', 1500 - d * 1.2, GY + 60, 1.0, { dir: -1, T, run: 1, phase: T * 8, eye: '#7aff5a', cols: ['#2a1410', '#7a3a2a', '#f0e0c0'] });
          KIT.army.draw(g, 'chariot', { x: 620 - d, y: GY + 30, s: 1.7, dir: -1, t: T, gait: 1, fill: '#2a0c08', line: '#0a0403', gold: '#f0b040', rim: '#ffd080', light: -Math.PI / 2, banner: '#7aff5a' });
          EP51.fig(g, T, 'duryodhana', 700 - d, GY - 250, 0.78, { f: 'left', pose: { w: { point: 0.6, stand: 0.4 }, prop: 'club' }, L: EP51.bright('#ffd0a0', 1.2), ex: { emo: 'wrath', gaze: [0.9, 0.1] }, key: 'cr-k' });
          for (let i = 0; i < 4; i++) { const x = 250 - d * 1.5 - i * 100; EP51.fig(g, T, i % 2 ? 'kacha' : 'kanva', x, GY + 50 + i * 12, 0.5, { f: 'left', pose: ACT.pose(t, [[0, 'run']], { phase: T * 10 + i * 1.7, prop: false }), L: EP51.bright('#ffd0a0', 1.1), ex: { emo: 'fear' }, key: 'cr-r' + i }); }
        } });
      fin(ctx, T);
    },
    post: POST(0.34, 0.5) });

  // 6 · WEIGHT (the turn, after a silence; the close-up): the Earth's face under the mass: endurance, then fear
  R.scene({ id: 'weight', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.3, b1 = env.beats[1] ?? 3.2, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.1, focus: [540, 800] }), sink = 60 * E.inOutSine(clamp((t - b1 + 0.6) / 0.9));
      EP51.void(ctx, T, cam, 'dharma-copper', { ground: false, glow: [540, 1000, 1200, '#c8602a', 0.2],
        figs: (g, p) => { burden(g, 540, 300 + sink, 1500, 900, T, 0.6);
          CH.bhumi.draw(g, { x: 640, y: 2960 + sink, scale: 2.5, facing: 'left', pose: { w: { carry: 0.3, grieve: 0.2, stand: 0.5 }, prop: false }, light: { dir: -Math.PI / 2 - 0.7, intensity: 1.25, front: 0.7, fill: 0.4, tint: ['#ffb070', 0.45], minLum: 0.3 }, expression: { emo: ACT.emo(t, [[0, 'weary'], [b0, 'resolve', { dur: 0.5 }], [b1 - 0.5, 'fear', { dur: 0.6 }]]), ...ACT.lead(t, [[0, [0.3, 0.6]], [b0, [0.4, 0.1]], [b1 - 0.4, [0.2, -0.9]]], 0.4, 0.2) }, t: T, key: 'wt-e' }); },
        front: (g) => { const gr = g.createLinearGradient(0, 1220, 0, 1700); gr.addColorStop(0, 'rgba(14,6,4,0)'); gr.addColorStop(0.5, 'rgba(14,6,4,0.82)'); gr.addColorStop(1, 'rgba(14,6,4,0.95)'); g.fillStyle = gr; g.fillRect(-900, 1220, 2880, 1600); } });
      TY.plaque(ctx, T, clamp((t - 0.5) / 0.6), ...names(env, 'Earth'), { x: 300, y: 430, size: 50, out: clamp((t - b1 + 0.4) / 0.3) });
      TY.turnWord(ctx, T, clamp((t - b1 + 0.2) / 0.6), 'Burden', { x: 300, y: 1250, size: 90, out: out(t, env, 0.3), sub: 'Adi 1.58.29' });
      fin(ctx, T);
    },
    post: POST(0.3, 0.5) });

  // 7 · WENT (the signature shot): she climbs, small, a stair of cloud toward Brahma, large on his lotus, ringed by small gods
  const ring = (g, T, cx, cy, n, r0, a0, col, halo) => { for (let i = 0; i < n; i++) { const a = a0 + (i / (n - 1)) * (Math.PI - 2 * a0), x = cx - Math.cos(a) * r0, y = cy - Math.sin(a) * r0 * 0.42; EP51.mini(g, x, y + 150, 0.7, col, 'rgba(255,240,200,0.8)', true, halo); } };
  const brahma = (g, T, x, y, s, pose, speak, key) => CH.brahma.draw(g, { x, y, scale: s, facing: 'left', pose, light: { dir: -Math.PI / 2 - 0.3, intensity: 1.3, front: 0.9, fill: 0.6 }, expression: { speak: speak || 0 }, t: T, key: key || 'br' });
  R.scene({ id: 'went', transition: { type: 'lamp', dur: 0.8, from: [540, 800], to: [540, 520] },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 2.1, cam = CAM.crane(E.inOutSine(clamp(t / env.dur)), { from: 1.45, to: 1.04, y0: 330, y1: -60 }), u = E.inOutSine(clamp(t / (env.dur - 0.3)));
      EP51.heaven(ctx, T, cam, 'memory-indigo', { stars: true, floor: GY + 120,
        back: (g) => KIT.glow(g, 540, 620, 900, '#ffd0e0', 0.5),
        mid: (g, p) => { ring(g, T, 540, 900, 9, 470, 0.25, KIT.hex(p.near, '#000000', 0.2), '#ffe8b0'); brahma(g, T, 540, 980, 0.78, { name: 'sit' }, 0, 'wn-b'); },
        figs: (g, p) => {
          for (let i = 0; i < 7; i++) { const x = 130 + i * 90, y = GY + 150 - i * 62; g.fillStyle = 'rgba(244,240,255,0.9)'; g.beginPath(); g.ellipse(x, y, 110, 24, 0, 0, TAU); g.fill(); }   // the stair of cloud
          const x = lerp(150, 620, u), y = lerp(GY + 130, GY - 250, u);
          EP51.fig(g, T, 'bhumi', x, y, 0.5, { f: 'right', pose: ACT.pose(t, [[0, 'walk'], [env.dur - 0.8, 'anjali', { act: 0.5 }]], { phase: ACT.stride(u * 700, 0.5) }), L: EP51.bright('#fff0d8', 1.25), ex: { emo: 'fear', gaze: [0.6, -0.6] }, key: 'wn-e' });
        } });
      TY.plaque(ctx, T, clamp((t - b1) / 0.6), ...names(env, 'Brahma'), { x: 800, y: 300, size: 54, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.42, 0.42) });

  // 8 · KNEW: Brahma large and near, a hand lifting in reassurance; she kneels at the foot of the frame
  R.scene({ id: 'knew', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1, cam = CAM.push(t / env.dur, { from: 1.02, to: 1.14, focus: [560, 760] });
      EP51.heaven(ctx, T, cam, 'brahma-rose', { floor: GY + 60,
        back: (g) => KIT.glow(g, 600, 640, 1000, '#fff0c8', 0.45),
        figs: (g, p) => { brahma(g, T, 620, GY + 40, 1.12, { name: 'bless', k: E.outCubic(clamp((t - b0 + 0.5) / 0.8)) }, 0, 'kn-b');
          EP51.fig(g, T, 'bhumi', 210, GY + 130, 0.66, { f: 'right', pose: { w: { kneel: 0.6, anjali: 0.4 }, prop: false }, L: EP51.bright('#ffe8e0', 1.2), ex: { emo: ACT.emo(t, [[0, 'fear'], [b0 + 0.4, 'wonder']]), gaze: [0.7, -0.6] }, key: 'kn-e' }); } });
      fin(ctx, T);
    },
    post: POST(0.4, 0.4) });

  // 9 · COMMAND: Brahma's arm sweeps out over the ranks of gods; from each a second, smaller light steps out toward the earth
  R.scene({ id: 'command', transition: { type: 'brush', dur: 0.5, angle: -0.2, color: '#fff8dc' },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 2.2, b2 = b[2] ?? 5.1, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 120, zoom: 1.12 });
      EP51.heaven(ctx, T, cam, 'sun-white', { floor: GY + 40, sun: [860, 360, 90],
        figs: (g, p) => {
          brahma(g, T, 250, GY + 30, 0.9, { name: 'speak', k: E.outCubic(clamp(t / 0.6)) }, talk(env, t), 'cm-b');
          for (let i = 0; i < 4; i++) { const x = 560 + i * 150, y = GY + 20 + (i % 2) * 34, k = clamp((t - b1 - i * 0.35) / 1.4);
            CH.deva.draw(g, { x, y, scale: 0.56, index: i, facing: 'left', pose: { name: 'bow', k: 0.35 * clamp((t - b1 + 0.4) / 0.6) }, light: { dir: -Math.PI / 2 - 0.4, intensity: 1.3, front: 0.9, fill: 0.6, tint: ['#fff4d0', 0.5] }, t: T, key: 'cm-d' + i });
            if (k > 0) { const lx = x - 60 + 40 * k, ly = y - 380 + 760 * E.inCubic(k); KIT.glow(g, lx, ly, 150, '#fff6c0', 0.9 * (1 - 0.3 * k)); g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(lx, ly, 14, 30, 0, 0, TAU); g.fill(); } }
        },
        front: (g) => { const a = clamp((t - b2 + 0.6) / 0.8); if (a > 0) { g.globalAlpha = a; g.fillStyle = '#1c2a20'; g.beginPath(); g.ellipse(540, 2150, 900, 330, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(160,220,150,0.7)'; g.lineWidth = 6; g.beginPath(); g.ellipse(540, 2150, 900, 330, 0, Math.PI, TAU); g.stroke(); g.globalAlpha = 1; } } });
      fin(ctx, T);
    },
    post: POST(0.44, 0.36) });

  // 10 · AGREED (a second silence before it): the deep blue of Vaikuntha: Narayana large; Indra small before him, hands joined
  R.scene({ id: 'agreed', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 2.4, b2 = b[2] ?? 3.9, cam = CAM.pull(clamp(t / env.dur), { from: 1.3, to: 1.04, focus: [560, 700] });
      EP51.heaven(ctx, T, cam, 'crystal-sky', { floor: GY + 60, sun: [860, 300, 80],
        back: (g) => KIT.glow(g, 600, 640, 900, '#9ab8ff', 0.4),
        figs: (g, p) => {
          CH.vishnu.draw(g, { x: 730, y: GY + 40, scale: 0.92, facing: 'front', pose: { name: 'bless', k: E.outCubic(clamp((t - b2 + 0.5) / 0.7)) }, light: { dir: -Math.PI / 2 - 0.3, intensity: 1.3, front: 0.9, fill: 0.6 }, t: T, key: 'ag-v' });
          CH.indra.draw(g, { x: 200, y: GY + 110, scale: 0.5, facing: 'right', pose: { name: 'speak', k: clamp(1 - (t - b1) / 0.8) }, light: { dir: -Math.PI / 2 + 0.4, intensity: 1.3, front: 0.9, fill: 0.6 }, t: T, key: 'ag-i' }); } });
      TY.plaque(ctx, T, clamp((t - b1 + 0.6) / 0.6), ...names(env, 'Narayana'), { x: 215, y: 330, size: 46, out: out(t, env) });
      TY.plaque(ctx, T, clamp((t - 0.4) / 0.5), ...names(env, 'Indra'), { x: 180, y: 780, size: 36, out: clamp((t - b1 + 0.4) / 0.3) });
      fin(ctx, T);
    },
    post: POST(0.42, 0.42) });

  // 11 · CLIFF: a green earth by day: lights come down like slow rain; where each lands a small figure rises; two are green-eyed
  const CAST = [['arjuna', 150, 0.2, 'stand'], ['bhima', 330, 0.9, 'stand'], ['panchali', 520, 1.5, { w: { stand: 1 }, prop: false }], ['duryodhana', 720, 2.1, { w: { stand: 1 }, prop: false }], ['kaliShade', 930, 2.6, 'stand']];
  const cliff = (ctx, T, t, env, b) => {
    const cam = CAM.drift(CAM.push(clamp(t / 6.4), { from: 1.02, to: 1.16, focus: [540, 1000] }), T, 1.6);
    EP51.land(ctx, T, cam, 'hunt-emerald', { sun: [240, 420, 80], dust: 'pollen', hz: 1150, trees: 'sal',
      sky: (g) => { for (let i = 0; i < 30; i++) { const u = (T * 0.09 * (0.5 + hash(i, 1)) + hash(i, 2)) % 1, x = 1080 * hash(i, 3), y = -100 + 1250 * u; g.globalAlpha = 0.9 * (1 - u * 0.5); g.strokeStyle = '#fff6c0'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y - 70); g.lineTo(x, y); g.stroke(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, 5 + 4 * hash(i, 4), 0, TAU); g.fill(); } g.globalAlpha = 1; },
      figs: (g, p) => { CAST.forEach(([id, x, t0, pose], i) => { const k = E.outCubic(clamp((t - t0) / 0.9)); if (k <= 0) return; const y = 1250 + (i % 2) * 40; KIT.glow(g, x, y - 300, 300 * (1.2 - 0.5 * k), i > 2 ? '#7aff5a' : '#fff6c0', 0.8 * (1 - 0.7 * k));
        g.save(); g.globalAlpha = 1; g.beginPath(); g.rect(x - 400, y - 1200 * k - 20, 800, 1200 * k + 40); g.clip(); EP51.fig(g, T, id, x, y, 0.5, { f: i < 3 ? 'right' : 'left', pose, L: EP51.bright(i > 2 ? '#d8ffd0' : '#fff4d8', 1.25), ex: { emo: i > 2 ? 'wrath' : 'calm' }, key: 'cl-' + i }); g.restore(); }); } });
    TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 110 });
    fin(ctx, T);
  };
  const CL = { dur: 6.17, b: [0.5, 2.6, 3.7] };
  R.scene({ id: 'cliff', transition: { type: 'lamp', dur: 0.8, from: [620, 700], to: [240, 420] }, draw(ctx, t, env) { cliff(ctx, env.T, t, env, env.beats.length > 2 ? env.beats : CL.b); }, post: POST(0.34, 0.45) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, CL.dur + t, env, CL.b) });
})();
