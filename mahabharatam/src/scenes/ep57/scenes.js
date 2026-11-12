/* Episode 57 · "I Do Not Know You" (CE Adi 1.68.18–80, 1.69.1–28). One scene per line of script/ep57.en.json.
 * Loads after ep41/_common, ep44/_common, ep46/_common, ep49/_common, ep51/_common.
 * In the epic the king does not forget her (no ring, no curse: those are Kalidasa's): a tag and the source line say so.
 * Each speech is one verse, cited under the picture. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41, EP51 = window.EP51;
  const { TAU, clamp, lerp, E, hash } = R;
  const GY = EP41.GY;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const names = (env, n) => [n, env.script.names[n]];
  const talk = (env, t) => EP41.mouth(env, t);
  const POST = (b = 0.3, v = 0.45) => () => ({ bloom: b, vignette: v, paper: 0.3 });
  const out = (t, env, d = 0.4) => clamp((t - (env.dur - d)) / 0.3);
  const F = EP51.fig;
  const shade = (g, c = '20,8,8') => { const gr = g.createLinearGradient(0, 1220, 0, 1700); gr.addColorStop(0, `rgba(${c},0)`); gr.addColorStop(0.5, `rgba(${c},0.85)`); gr.addColorStop(1, `rgba(${c},0.96)`); g.fillStyle = gr; g.fillRect(-900, 1220, 2880, 1600); };
  const court = (ctx, T, cam, pal, figs, o = {}) => EP51.court(ctx, T, cam, pal, { tx: o.tx === undefined ? 800 : o.tx, ty: 1310, ts: 0.9, crowd: o.crowd ?? 1, glow: o.glow ?? 0.2, gx: 800, figs, front: o.front, mid: o.mid, back: o.back, floor: o.floor });
  const king = (g, p, T, o = {}) => F(g, T, 'dushyanta', o.x ?? 800, o.y ?? 1035, o.s ?? 0.68, { f: 'left', pose: o.pose || 'sit', L: o.L || EP51.lit(p, 800, 1035, { from: [300, 300], front: 0.42 }), ex: o.ex || { emo: 'resolve', gaze: [0.8, 0.3] }, key: o.key || 'kg' });
  const girl = (g, p, T, x, y, s, o = {}) => F(g, T, 'shakuntala', x, y, s, { f: o.f || 'right', pose: o.pose || 'stand', L: o.L || EP51.lit(p, x, y, { from: [800, 300], front: 0.42 }), ex: o.ex || { emo: 'resolve', gaze: [0.9, -0.4] }, key: o.key || 'gl' });
  const boy = (g, p, T, x, y, s, o = {}) => F(g, T, 'bharataChild', x, y, s, { f: o.f || 'right', pose: o.pose || 'stand', L: o.L || EP51.lit(p, x, y, { from: [800, 300], front: 0.5 }), ex: o.ex || { emo: 'wonder', gaze: [0.8, -0.5] }, key: o.key || 'by' });

  // 1 · HOOK: the king's hand gripping the throne's arm, large in the foreground; the focus racks to a woman far down the hall
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.rack(E.inOutSine(clamp(t / 1.6)), { from: 1.9, to: 1, zoom: 1.1, x: 40 * Math.sin(t * 0.6) }), T, 0.8);
      court(ctx, T, cam, 'war-iron', (g, p) => { girl(g, p, T, 420, GY - 60, 0.62, { key: 'hk-g' }); boy(g, p, T, 520, GY - 50, 0.6, { key: 'hk-b' }); }, { tx: null, crowd: 0.8,
        front: (g) => { g.fillStyle = '#2a0e0a'; g.beginPath(); g.roundRect(520, 1500, 900, 150, 40); g.fill(); g.fillStyle = '#e7b54a'; g.fillRect(520, 1480, 900, 30);   // the throne's arm
          g.fillStyle = '#8a5a38'; g.beginPath(); g.ellipse(760, 1470, 150, 78, -0.1, 0, TAU); g.fill(); for (let i = 0; i < 4; i++) { g.beginPath(); g.roundRect(610 + i * 64, 1440 + 8 * Math.sin(T * 6 + i) * clamp(1.5 - t), 54, 150, 24); g.fill(); } g.fillStyle = '#e7b54a'; g.fillRect(880, 1400, 30, 150); } });
      EP51.hook(ctx, T, t, env, { y: 1250, ty: 1260, size: 70 });
      fin(ctx, T);
    },
    post: POST(0.3, 0.52) });

  // 2 · SCENE: a crane down the red-and-gold hall from the high throne to the two small figures on the floor
  R.scene({ id: 'scene', transition: { type: 'ink', dur: 0.6, at: [540, 900], color: '#3a0806' },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 3.5, cam = CAM.crane(E.inOutSine(clamp(t / env.dur)), { from: 1.22, to: 1.04, y0: -40, y1: 30 });
      court(ctx, T, cam, 'dice-vermilion', (g, p) => { king(g, p, T, { key: 'sn-k' }); girl(g, p, T, 290, GY - 120, 0.8, { key: 'sn-g' }); boy(g, p, T, 440, GY - 114, 0.76, { key: 'sn-b' }); });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.4) / 0.4)), env.strings, { y: 190 });
      TY.plaque(ctx, T, clamp((t - 0.9) / 0.5), ...names(env, 'Dushyanta'), { x: 420, y: 400, size: 40, out: clamp((t - b1 + 0.3) / 0.3) });
      TY.plaque(ctx, T, clamp((t - b1) / 0.5), ...names(env, 'Shakuntala'), { x: 400, y: 400, size: 40, out: out(t, env) });
      TY.tag(ctx, T, clamp((t - 2.9) / 0.4), "In the epic he never forgets her. The ring and the curse are Kalidasa's.", { x: 540, y: 250, size: 28, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.32, 0.5) });

  // 3 · STOOD (the close-up): her face: stunned, then the brows come down and the eyes burn; a sidelong look up at the throne
  R.scene({ id: 'stood', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 1.1, b2 = b[2] ?? 3.3, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.12, focus: [540, 780] });
      court(ctx, T, cam, 'wrath-crimson', (g, p) => {
        F(g, T, 'shakuntala', 440, 2960, 2.5, { f: 'right', pose: 'stand', L: { dir: -Math.PI / 2 + 0.6, intensity: 1.2, front: 0.6, fill: 0.3, tint: ['#ffb090', 0.4], minLum: 0.3 }, ex: { emo: ACT.emo(t, [[0, 'shock'], [b0, 'wrath', { dur: 0.6 }], [b2, 'resolve', { dur: 0.5 }]]), ...ACT.lead(t, [[0, [0.5, 0.5]], [b0 + 0.3, [0.9, -0.6]]], 0.4, 0.2) }, key: 'st-g' }); shade(g); }, { tx: null, crowd: 0, front: () => {} });
      fin(ctx, T);
    },
    post: POST(0.32, 0.5) });

  // 4 · HEART: a tilt up from the king on his throne, small now, to the vault above him, where a ring of watchers stands:
  //     sun and moon, wind and fire, day and night; and in his own chest a small steady light
  R.scene({ id: 'heart', transition: { type: 'lamp', dur: 0.7, from: [540, 700], to: [540, 760] },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b1 = b[1] ?? 2.5, cam = CAM.tilt(E.inOutSine(clamp(t / 3.4)), { from: 200, to: -200, zoom: 1.12 }), a = clamp((t - b1 + 0.8) / 0.8);
      EP51.court(ctx, T, cam, 'pure-flame', { tx: 540, ty: 1330, ts: 0.9, crowd: 0, glow: 0.12, gx: 540, front: () => {},
        back: (g) => { const W = [['#ffd060', 60], ['#f0f0ff', 46], ['#b8e0ff', 40], ['#ff8a3a', 44], ['#fff0c0', 50], ['#6a70c0', 50]]; W.forEach(([c, r], i) => { const an = Math.PI + ((i + 0.5) / 6) * Math.PI, x = 540 + Math.cos(an) * 430, y = 300 + Math.sin(an) * 330; KIT.glow(g, x, y, r * 4, c, 0.5 * a); g.globalAlpha = a; g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.globalAlpha = 1; }); },
        figs: (g, p) => { king(g, p, T, { x: 540, y: 1055, s: 0.66, L: { dir: -Math.PI / 2, intensity: 1.2, front: 0.6, fill: 0.4, tint: ['#d0d8ff', 0.5], minLum: 0.3 }, ex: { emo: 'fear', gaze: [0.3, -0.8] }, key: 'ht-k' }); KIT.glow(g, 520, 760, 110, '#fff6c0', 0.9 * a * (0.8 + 0.2 * Math.sin(T * 3))); g.fillStyle = '#ffffff'; g.globalAlpha = a; g.beginPath(); g.arc(520, 760, 9, 0, TAU); g.fill(); g.globalAlpha = 1; } });
      TY.tag(ctx, T, clamp((t - b1) / 0.4), 'Adi 1.68.27–29', { x: 540, y: 1130, size: 30, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.42, 0.5) });

  // 5 · WIFE: light from a high window falls on her and the boy: she stands straight; the boy steps out into the light
  R.scene({ id: 'wife', transition: { type: 'dissolve', dur: 0.35 },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 2.0, cam = CAM.slide(t / env.dur, { from: -80, to: 80, zoom: 1.16 }), st = 110 * E.outCubic(clamp((t - b1) / 1.0));
      court(ctx, T, cam, 'satra-teal-night', (g, p) => { ST.shafts(g, T, { x: 300, angle: 0.3, count: 3, alpha: 0.2 });
        girl(g, p, T, 430, GY - 100, 0.92, { pose: ACT.pose(t, [[0, 'speak'], [b1, 'attend', { act: 0.5 }]]), L: EP51.bright('#fff0c0', 1.25), ex: { emo: 'resolve', speak: talk(env, t), gaze: [0.9, -0.4] }, key: 'wf-g' });
        boy(g, p, T, 500 + st, GY - 90, 0.86, { L: EP51.bright('#fff0c0', 1.3), ex: { emo: 'wonder', gaze: [0.8, -0.5] }, key: 'wf-b' }); }, { tx: null, crowd: 0.7 });
      TY.tag(ctx, T, clamp((t - 0.8) / 0.4), 'Adi 1.68.40, 47', { x: 860, y: 1130, size: 30, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.36, 0.45) });

  // 6 · MIRROR: the hall's floor becomes still water: the boy at its edge looks down; the face that looks back wears a crown
  R.scene({ id: 'mirror', transition: { type: 'brush', dur: 0.5, angle: 0.1, color: '#c0e4f8' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.push(t / env.dur, { from: 1.04, to: 1.2, focus: [540, 1000] }), a = clamp((t - 0.7) / 0.9);
      EP51.void(ctx, T, cam, 'yamuna-deep', { ground: false, hz: 900,
        back: (g, p) => { ST.pillars(g, p, { y: 900, n: 5 }); },
        figs: (g, p) => { ST.water(g, p, { y0: 1040, y1: 2100, T, flow: 10, count: 60 });
          g.save(); g.translate(0, 2 * 1040); g.scale(1, -1); g.globalAlpha = 1; F(g, T, 'dushyanta', 540, 1040, 0.62, { f: 'left', pose: 'stand', L: { dir: -Math.PI / 2, intensity: 0.9, front: 0.5, fill: 0.4, tint: ['#a0d0ff', 0.5] }, ex: { emo: 'tender' }, key: 'mr-r' }); g.restore();
          g.fillStyle = 'rgba(8,62,98,' + (0.5 + 0.5 * (1 - a)) + ')'; g.fillRect(-900, 1040, 2880, 1200); for (let i = 0; i < 5; i++) { g.strokeStyle = 'rgba(216,248,255,0.5)'; g.lineWidth = 3; g.beginPath(); g.ellipse(540, 1260 + i * 16, 120 + i * 90 + 30 * Math.sin(T * 1.5), 14 + i * 5, 0, 0, TAU); g.stroke(); }
          boy(g, p, T, 540, 1040, 0.62, { f: 'left', pose: { w: { bow: 0.25, stand: 0.75 } }, L: EP51.bright('#e0f4ff', 1.3), ex: { emo: 'wonder', gaze: [0.4, 0.9] }, key: 'mr-b' }); } });
      TY.tag(ctx, T, clamp((t - 0.8) / 0.4), 'Adi 1.68.64', { x: 540, y: 250, size: 30, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.36, 0.45) });

  // 7 · INSULT (the turn): seen from the floor, a tilt up the throne steps to the king on his feet, an arm flung out; a
  //     withered garland drops down the steps into the foreground
  R.scene({ id: 'insult', transition: { type: 'dissolve', dur: 0.45 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 2.2, b2 = b[2] ?? 4.7, b3 = b[3] ?? 6.9, cam = CAM.tilt(E.inOutSine(clamp((t - 0.6) / 2.4)), { from: 190, to: -150, zoom: 1.14 }), fall = E.inCubic(clamp((t - b2) / 1.3));
      court(ctx, T, cam, 'dice-vermilion', (g, p) => {
        king(g, p, T, { x: 540, y: 1170, s: 0.9, pose: ACT.pose(t, [[0, 'stand'], [b0 - 0.4, 'curse', { act: 0.4 }], [b2 - 0.3, 'point', { act: 0.4 }]]), L: EP51.lit(p, 540, 1170, { from: [200, 300], front: 0.45 }), ex: { emo: 'wrath', speak: talk(env, t), gaze: [0.9, 0.5] }, key: 'in-k' });
        const gx = 420 - 160 * fall, gy = 900 + 640 * fall; g.save(); g.translate(gx, gy); g.rotate(fall * 2.4); g.strokeStyle = '#7a6a3a'; g.lineWidth = 20; g.beginPath(); g.ellipse(0, 0, 80, 54, 0, 0, TAU); g.stroke(); g.fillStyle = '#a08a5a'; for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; g.beginPath(); g.arc(Math.cos(a) * 80, Math.sin(a) * 54, 16, 0, TAU); g.fill(); } g.restore(); }, { tx: 540, crowd: 0.6 });
      TY.tag(ctx, T, clamp((t - b0) / 0.4), 'Adi 1.68.72–73', { x: 860, y: 250, size: 30, out: out(t, env) });
      TY.turnWord(ctx, T, clamp((t - b3 + 0.2) / 0.6), 'Denied', { x: 250, y: 860, size: 80, out: out(t, env, 0.3), sub: '"I do not know you" · 1.68.80' });
      fin(ctx, T);
    },
    post: POST(0.34, 0.5) });

  // 8 · TRUTH (the signature shot): a great pair of scales: in one pan a herd of small white horses and altar fires, piled
  //     high; in the other a single small flame; the flame's pan sinks slowly to the ground
  R.scene({ id: 'truth', transition: { type: 'smoke', dur: 0.6, dir: -Math.PI / 2, color: '#fbf0d8' },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 2.5, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 90, zoom: 1.1 }), k = E.inOutSine(clamp((t - b0 + 0.3) / 2.0)), tip = lerp(-0.12, 0.2, k);
      EP51.void(ctx, T, cam, 'riverbank-pearl', { gy: 1300, glow: [540, 700, 1000, '#ffffff', 0.3],
        back: (g, p) => ST.pillars(g, p, { y: 1320, n: 4 }),
        figs: (g) => { g.fillStyle = '#5a3a14'; g.fillRect(520, 480, 40, 800); g.beginPath(); g.moveTo(380, 1290); g.lineTo(700, 1290); g.lineTo(600, 1220); g.lineTo(480, 1220); g.closePath(); g.fill();
          g.save(); g.translate(540, 500); g.rotate(tip); g.fillStyle = '#e7b54a'; g.fillRect(-400, -14, 800, 28); g.beginPath(); g.arc(0, 0, 40, 0, TAU); g.fill();
          for (const sg of [-1, 1]) { g.save(); g.translate(sg * 380, 0); g.rotate(-tip); g.strokeStyle = '#c89a30'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); g.lineTo(-130, 330); g.moveTo(0, 0); g.lineTo(130, 330); g.stroke(); g.fillStyle = '#c89a30'; g.beginPath(); g.ellipse(0, 340, 160, 34, 0, 0, Math.PI); g.fill(); g.fillRect(-160, 330, 320, 12);
            if (sg < 0) { for (let i = 0; i < 9; i++) { const hx = -110 + (i % 5) * 54 + (i > 4 ? 26 : 0), hy = 320 - (i > 4 ? 78 : 0); g.fillStyle = '#fbf8f0'; g.beginPath(); g.ellipse(hx, hy - 30, 30, 18, 0, 0, TAU); g.fill(); g.fillRect(hx - 22, hy - 24, 6, 26); g.fillRect(hx + 14, hy - 24, 6, 26); g.beginPath(); g.ellipse(hx - 30, hy - 52, 12, 18, 0.5, 0, TAU); g.fill(); } }
            else { KIT.glow(g, 0, 270, 200, '#fff0a0', 0.8); g.fillStyle = '#ffb030'; g.beginPath(); g.moveTo(-24, 328); g.quadraticCurveTo(-34, 270, 6 * Math.sin(T * 7), 216); g.quadraticCurveTo(34, 270, 24, 328); g.closePath(); g.fill(); g.fillStyle = '#fff6c0'; g.beginPath(); g.ellipse(0, 304, 10, 22, 0, 0, TAU); g.fill(); }
            g.restore(); }
          g.restore(); } });
      TY.tag(ctx, T, clamp((t - 0.9) / 0.4), 'Adi 1.69.22', { x: 540, y: 250, size: 30, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.36, 0.4) });

  // 9 · LEAVE (a second silence): she takes the boy's hand and turns her back on the throne; a pull back as she walks toward us
  R.scene({ id: 'leave', transition: { type: 'dissolve', dur: 0.4 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.6, cam = CAM.pull(clamp(t / env.dur), { from: 1.3, to: 1.04, focus: [480, 900] }), d = 150 * E.inOutSine(clamp((t - b0 + 0.3) / 2.2));
      court(ctx, T, cam, 'wrath-crimson', (g, p) => { king(g, p, T, { pose: 'sit', ex: { emo: 'resolve', gaze: [0.8, 0.3] }, key: 'lv-k' });
        girl(g, p, T, 420 - d, GY - 110, 0.84, { f: t > b0 - 0.4 ? 'left' : 'right', pose: ACT.pose(t, [[0, 'speak'], [b0 - 0.3, 'walk', { act: 0.4 }]], { phase: ACT.stride(d, 0.84) }), ex: { emo: 'resolve', speak: talk(env, t), gaze: [0.9, 0] }, key: 'lv-g' });
        boy(g, p, T, 310 - d, GY - 102, 0.78, { f: t > b0 - 0.4 ? 'left' : 'right', pose: ACT.pose(t, [[0, 'stand'], [b0 - 0.3, 'walk', { act: 0.4 }]], { phase: ACT.stride(d, 0.5) + 1 }), key: 'lv-b' }); });
      TY.tag(ctx, T, clamp((t - 0.8) / 0.4), 'Adi 1.69.27', { x: 860, y: 250, size: 30, out: out(t, env) });
      fin(ctx, T);
    },
    post: POST(0.32, 0.5) });

  // 10 · CLIFF: she at the great doors; a tilt up: the hall's roof is gone into bright sky, and every head is lifting toward it
  const cliff = (ctx, T, t, env, b) => {
    const k = E.inOutSine(clamp((t - b[1] + 0.5) / 1.6)), cam = CAM.drift(CAM.tilt(k, { from: 150, to: -230, zoom: 1.12 }), T, 1.2);
    EP51.heaven(ctx, T, cam, 'crystal-sky', { sun: [540, 200, 120], floor: GY,
      back: (g, p) => { KIT.glow(g, 540, 200, 900, '#ffffff', 0.5 * k); for (const x of [60, 330, 750, 1020]) { g.fillStyle = KIT.hex(p.near, '#3a0806', 0.6); g.fillRect(x - 50, 500, 100, 1000); g.fillRect(x - 70, 480, 140, 40); } },
      figs: (g, p) => { g.fillStyle = '#4a1210'; g.fillRect(-900, GY - 150, 2880, 1100); for (let i = 0; i < 8; i++) EP51.mini(g, 60 + i * 140, GY + 40 + (i % 2) * 40, 1.0, '#2a0a0a', 'rgba(255,255,255,0.9)', false);
        girl(g, p, T, 430, GY - 120, 0.8, { f: 'left', pose: ACT.pose(t, [[0, 'walk'], [b[0], 'attend', { act: 0.4 }]], { phase: T * 3 }), L: EP51.bright('#ffffff', 1.3), ex: { emo: ACT.emo(t, [[0, 'resolve'], [b[1], 'wonder']]), ...ACT.lead(t, [[0, [0.8, 0]], [b[1], [0.2, -0.9]]], 0.4, 0.3) }, key: 'cl-g' });
        boy(g, p, T, 320, GY - 112, 0.76, { f: 'left', L: EP51.bright('#ffffff', 1.3), ex: { emo: 'wonder', gaze: [0.3, -0.9] }, key: 'cl-b' }); } });
    TY.source(ctx, T, clamp((t - 0.4) / 0.4), env.strings, { y: 110 });
    fin(ctx, T);
  };
  const CL = { dur: 4.76, b: [1.2, 2.4, 4.1] };
  R.scene({ id: 'cliff', transition: { type: 'lamp', dur: 0.7, from: [540, 700], to: [540, 200] }, draw(ctx, t, env) { cliff(ctx, env.T, t, env, env.beats.length > 2 ? env.beats : CL.b); }, post: POST(0.42, 0.4) });
  KIT.series.overlayNextScene({ id: 'next', y: 1120, picture: (ctx, T, env, t) => cliff(ctx, T, CL.dur + t, env, CL.b) });
})();
