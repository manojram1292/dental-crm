/* THE SERIES INTRODUCTION · "Mahabharatam: As Vyasa Told It" (script/intro.en.json; pipeline number 98, never a numbered
 * episode). One scene per script line. Loads after ep41/_common (EP41: hearth, hermitage, naimisha), ep46/_common
 * (EP46.hall) and ep49/_common (EP49.river, EP49.boat). Every claim on screen is in the script's `source`.
 * Fourteen shots, fourteen lights: amber fire · lapis night · green dusk · teal hall · storm violet · crimson · river blue ·
 * umber-gold · vermilion to iron · pearl dawn · ivory · hermitage green · the blue hour · first light. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41, EP46 = window.EP46, EP49 = window.EP49;
  const { TAU, clamp, lerp, E, hash } = R;
  const GY = EP41.GY, HZ = EP41.HZ;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const talk = (env, t) => EP41.mouth(env, t);

  // a line of verse as the murals would hint it: a head-stroke with letters hanging from it and a double bar at the end
  // (it suggests old script without being readable text: every word in the film comes from the script file)
  const verse = (g, x, y, w, s, seed, col, a = 1) => {
    if (a <= 0.01 || w < 6) return;
    g.save(); g.globalAlpha *= a; g.strokeStyle = col; g.lineCap = 'round'; g.lineWidth = Math.max(1, 3.2 * s);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y);
    const n = Math.max(3, Math.floor(w / (15 * s)));
    for (let i = 0; i < n; i++) {
      if (hash(i, seed) < 0.16) continue;
      const xx = x + ((i + 0.5) * w) / n, h = (9 + 11 * hash(i, seed + 1)) * s;
      g.moveTo(xx, y);
      if (hash(i, seed + 2) < 0.45) g.lineTo(xx, y + h); else g.quadraticCurveTo(xx + 7 * s, y + h * 0.5, xx - 4 * s, y + h);
    }
    g.moveTo(x + w + 9 * s, y - 2 * s); g.lineTo(x + w + 9 * s, y + 18 * s); g.moveTo(x + w + 16 * s, y - 2 * s); g.lineTo(x + w + 16 * s, y + 18 * s);
    g.stroke(); g.restore();
  };

  // ── 1 · HOOK: the fire fills the frame, a push into it; lines of verse rise out of the flame; the title from frame 1 ──
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 1.84, S = env.strings;
      const cam = CAM.drift(CAM.push(clamp(t / 3.2), { from: 1.62, to: 1.02, focus: [540, 1000], ease: E.outCubic }), T, 0.6);
      EP41.hearth(ctx, T, cam, { fire: 1.15 + 0.25 * Math.sin(Math.PI * clamp(t / 0.6)), fs: 1.85, lean: 0.12 * Math.sin(T * 0.9), key: 'intro-h',
        smoke: (g) => {   // the verses leave the fire as sparks do
          g.save(); g.globalCompositeOperation = 'lighter';
          for (let i = 0; i < 20; i++) { const u = (hash(i, 1) + (T + 3) * 0.2 * (0.6 + 0.7 * hash(i, 2))) % 1, s = 0.55 + 0.6 * hash(i, 4);
            const x = 540 + (hash(i, 3) - 0.5) * 1100 * (0.25 + 0.75 * u) + 30 * Math.sin(T * 1.3 + i), y = lerp(1180, -260, u);
            g.save(); g.translate(x, y); g.rotate((hash(i, 5) - 0.5) * 0.5); verse(g, -70 * s, 0, 140 * s, s, i * 7, i % 3 ? '#ffd27a' : '#fff0c0', Math.sin(Math.PI * u) * 0.8); g.restore(); }
          g.restore(); } });
      // the title: there from the first frame, low, on a dark ground of its own
      const a = clamp(t / 0.22), y = 1400;
      ctx.save(); ctx.globalAlpha = a; const gr = ctx.createLinearGradient(0, y - 230, 0, y + 250); gr.addColorStop(0, 'rgba(8,5,6,0)'); gr.addColorStop(0.3, 'rgba(8,5,6,0.72)'); gr.addColorStop(0.78, 'rgba(8,5,6,0.72)'); gr.addColorStop(1, 'rgba(8,5,6,0)'); ctx.fillStyle = gr; ctx.fillRect(0, y - 230, R.W, 480); ctx.restore();
      const sc = 1 + 0.05 * (1 - E.outCubic(clamp(t / 0.5)));
      ctx.save(); ctx.translate(540, y); ctx.scale(sc, sc); ctx.translate(-540, -y);
      KIT.goldText(ctx, (S.seriesTitle || '').toUpperCase(), 540, y, { size: 96, spacing: 7, weight: 700, alpha: a, glow: 0.4, sheen: clamp(t / 1.4) * 1.4 - 0.2, key: 'intro-title' });
      ctx.restore();
      const k2 = E.outCubic(clamp((t - b1 + 0.45) / 0.5));
      if (k2 > 0) {
        ctx.save(); ctx.globalAlpha = k2; ctx.fillStyle = '#e7b54a'; ctx.fillRect(540 - 230 * k2, y + 34, 460 * k2, 3); ctx.restore();
        KIT.goldText(ctx, (S.seriesSubtitle || '').toUpperCase(), 540, y + 104 + 14 * (1 - k2), { size: 50, spacing: 9, weight: 600, alpha: k2, glow: 0.2, key: 'intro-sub' });
      }
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }) });

  // ── 2 · VERSES (THE SIGNATURE SHOT): a crane up from the sparks into a lapis night where the verses lie in rows of gold to
  //        the horizon and flow toward us ──
  const VH = 760;   // the horizon of the land of verses
  R.scene({ id: 'verses', transition: { type: 'lamp', dur: 0.7, from: [540, 1000], to: [540, 700] },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.5;
      const cam = CAM.drift(CAM.crane(clamp(t / env.dur), { from: 1.5, to: 1.02, y0: 520, y1: -40, ease: E.outCubic }), T, 0.5);
      ST.shot(ctx, T, { pal: 'pure-flame', cam, haze: 0.3, layers: [
        { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: VH });
          for (let i = 0; i < 90; i++) { const x = -300 + 1700 * hash(i, 11), y = -500 + (VH + 420) * hash(i, 12); g.globalAlpha = 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(T * (1 + 2 * hash(i, 13)) + i)); g.fillStyle = '#e8ecff'; g.beginPath(); g.arc(x, y, 1.5 + 2.5 * hash(i, 14), 0, TAU); g.fill(); } g.globalAlpha = 1;
          KIT.glow(g, 540, VH, 900, '#ffd27a', 0.22); } },
        { z: 0.3, draw: (g, p) => ST.hills(g, p, { y: VH + 6, h: 150, seed: 71 }) },
        { z: 1, haze: false, draw: (g) => {
          const gr = g.createLinearGradient(0, VH, 0, 2400); gr.addColorStop(0, '#0c1670'); gr.addColorStop(0.4, '#080e48'); gr.addColorStop(1, '#03051c'); g.fillStyle = gr; g.fillRect(-900, VH, 2880, 2200);
          g.save(); g.globalCompositeOperation = 'lighter';
          const N = 30;
          for (let j = 0; j < N; j++) { const u = (j / N + T * 0.035) % 1, pz = Math.pow(u, 2.1), y = lerp(VH + 6, 2500, pz), s = lerp(0.1, 1.9, pz), a = Math.min(1, u * 5) * (0.5 + 0.5 * u);
            const jj = Math.floor(j + 1000 - Math.floor(T * 0.035 * N + j / N * 0)), row = (j * 37) % 101;
            for (let c = -5; c <= 5; c++) { const w = (150 + 90 * hash(c + 9, row)) * s, x = 540 + (c * 250 + 60 * (hash(row, 3) - 0.5)) * s - w / 2; if (x > 1500 || x + w < -420) continue;
              verse(g, x, y, w, s, row * 13 + c + jj * 0, (c + j) % 4 ? '#ffc860' : '#fff0c0', a * (0.75 + 0.25 * Math.sin(T * 2 + c + j))); } }
          g.restore();
        } },
        { z: 1.5, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 46, cam }) },
      ] });
      TY.turnWord(ctx, T, clamp((t - b0 + 0.5) / 0.9), '100,000', { x: 540, y: 470, size: 150, out: clamp((t - (env.dur - 0.3)) / 0.3), sub: 'verses · the count tradition gives', key: 'intro-100k' });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.5, vignette: 0.5, paper: 0.28 }) });

  // ── 3 · PLAN: a green dusk; a path of small lamps winds to the horizon and they light one by one, near to far ──
  const PH = 900, NL = 13;
  const lampAt = (i) => { const u = i / (NL - 1), d = Math.pow(1 - u, 1.7); return { x: 540 + 330 * Math.sin(u * 5.2 + 0.6) * (0.25 + 0.75 * d), y: lerp(PH + 16, 1900, d), s: lerp(0.34, 1.5, d), u }; };
  const diya = (g, x, y, s, k, T, i) => {
    g.fillStyle = '#1a0c06'; g.beginPath(); g.ellipse(x, y, 46 * s, 15 * s, 0, 0, TAU); g.fill(); g.fillStyle = '#6a3414'; g.beginPath(); g.ellipse(x, y - 5 * s, 40 * s, 11 * s, 0, 0, TAU); g.fill();
    if (k <= 0) return;
    const fl = KIT.flicker(T, i + 3), h = (74 + 10 * Math.sin(T * 7 + i)) * s * E.outBack(clamp(k));
    KIT.glow(g, x, y - 40 * s, 330 * s, '#ffb040', 0.5 * k * fl); KIT.glow(g, x, y - 30 * s, 120 * s, '#fff0b0', 0.6 * k * fl);
    for (const [c, q] of [['#f08a24', 1], ['#ffd070', 0.66], ['#fff8dc', 0.34]]) { g.fillStyle = c; g.beginPath(); g.moveTo(x - 17 * s * q, y - 8 * s); g.quadraticCurveTo(x - 22 * s * q, y - 8 * s - h * q * 0.5, x + 5 * s * Math.sin(T * 5 + i), y - 8 * s - h * q); g.quadraticCurveTo(x + 22 * s * q, y - 8 * s - h * q * 0.5, x + 17 * s * q, y - 8 * s); g.fill(); }
  };
  R.scene({ id: 'plan', transition: { type: 'brush', dur: 0.5, angle: -0.2, color: '#0c3a20' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.slide(t / env.dur, { from: 150, to: -150, zoom: 1.1, y: 20 }), T, 0.5);
      ST.shot(ctx, T, { pal: 'exile-forest', cam, layers: [
        { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: PH, sun: [760, 760, 60] }); KIT.glow(g, 760, 800, 700, '#e0ffc0', 0.25); } },
        { z: 0.2, draw: (g, p) => ST.hills(g, p, { y: PH, h: 300, seed: 31 }) },
        { z: 0.45, draw: (g, p) => ST.treeline(g, p, { y: PH + 16, h: 560, T, seed: 33, kind: 'sal' }) },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: PH });
          // the path: a pale ribbon, wide near and a thread at the horizon
          g.fillStyle = 'rgba(190,230,170,0.16)'; g.beginPath(); for (let i = 0; i <= 40; i++) { const L = lampAt((i / 40) * (NL - 1)); g.lineTo(L.x - 150 * L.s, L.y); } for (let i = 40; i >= 0; i--) { const L = lampAt((i / 40) * (NL - 1)); g.lineTo(L.x + 150 * L.s, L.y); } g.closePath(); g.fill();
          for (let i = NL - 1; i >= 0; i--) { const L = lampAt(i), side = i % 2 ? 1 : -1; diya(g, L.x + side * 190 * L.s, L.y, L.s, clamp((t - 0.2 - i * 0.2) / 0.3), T, i); }
        } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'firefly', count: 26, cam }) },
        { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => { ST.trunks(g, p, { xs: [-240, 1320], w: 200 }); } },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.42, vignette: 0.48, paper: 0.3 }) });

  // ── 4 · M1 the snake sacrifice: the hall in teal night, the fire high; serpents fall out of the dark toward it ──
  const serpent = (g, x, y, len, ph, s, hue) => {
    const pts = []; for (let i = 0; i <= 22; i++) { const u = i / 22; pts.push([x + Math.sin(u * 5.2 + ph) * 70 * s * (0.4 + u), y - u * len * s]); }
    const stroke = (w, col, o = 0) => { g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round'; for (let i = 0; i < 22; i++) { g.lineWidth = Math.max(2, w * s * (1 - 0.8 * (i / 22))); g.beginPath(); g.moveTo(pts[i][0] + o, pts[i][1]); g.lineTo(pts[i + 1][0] + o, pts[i + 1][1]); g.stroke(); } };
    stroke(50, '#ffd9a0'); stroke(42, hue ? '#1c1450' : '#0e2a3c'); stroke(14, hue ? '#6a5ad0' : '#3a8aa0', -9 * s);
    g.fillStyle = '#ffd9a0'; g.beginPath(); g.ellipse(pts[0][0], pts[0][1] + 6 * s, 54 * s, 44 * s, 0, 0, TAU); g.fill();
    g.fillStyle = hue ? '#1c1450' : '#0e2a3c'; g.beginPath(); g.ellipse(pts[0][0], pts[0][1] + 6 * s, 48 * s, 38 * s, 0, 0, TAU); g.fill();
    g.strokeStyle = '#ffd9a0'; g.lineWidth = 4 * s; g.beginPath(); g.arc(pts[0][0], pts[0][1] + 2 * s, 20 * s, 0.3, Math.PI - 0.3); g.stroke();   // the hood's mark
    g.fillStyle = '#ff5a3a'; g.beginPath(); g.arc(pts[0][0], pts[0][1] + 30 * s, 5 * s, 0, TAU); g.fill();
  };
  R.scene({ id: 'm1', transition: { type: 'smoke', dur: 0.6, dir: -Math.PI / 2, color: '#0c3040' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.tilt(clamp(t / env.dur), { from: -330, to: 60, zoom: 1.12, ease: E.inOutSine }), T, 0.6);
      EP46.hall(ctx, T, cam, { pal: 'satra-teal-night', fx: 540, fs: 1.5, fire: 1.25, glow: 0.5, key: 'intro-m1',
        figs: (g) => {   // they come down out of the roof's dark, turning, and the fire takes them
          for (let i = 0; i < 9; i++) { const u = clamp((t + 1.3 - i * 0.36) / 2.4); if (u <= 0 || u >= 1) continue;
            const x = 540 + (hash(i, 41) - 0.5) * 900 * (1 - 0.8 * u * u), y = lerp(-500, 1080, u * u), s = lerp(1.9, 0.8, u);
            g.save(); g.translate(x, y); g.rotate((hash(i, 42) - 0.5) * 1.2 + Math.sin(T * 3 + i) * 0.25); g.globalAlpha = 1; serpent(g, 0, 0, 520, T * 7 + i * 2, s, i % 2); g.restore(); } } });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.3 }) });

  // ── 5 · M2 Garuda storms heaven: blazing gold, large in a storm sky, the wings opening; an orbit ──
  R.scene({ id: 'm2', transition: { type: 'dissolve', dur: 0.1 },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.4, cam = CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 70, zoom: 1.0, turn: 0.02 }), open = E.outBack(clamp((t - 0.1) / 0.7)), fl = Math.max(0, 1 - Math.abs(t - b0 - 0.1) / 0.16);
      ST.shot(ctx, T, { pal: 'boar-dusk', cam, layers: [
        { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 1960 }); if (fl > 0) { g.fillStyle = `rgba(255,230,255,${0.4 * fl})`; g.fillRect(-900, -900, 2880, 3720); } } },
        { z: 0.15, draw: (g, p) => ST.cloudBank(g, p, T, { y: 500, count: 8, speed: 90, color: '#3a1440', alpha: 0.9, size: 1.7, spread: 900 }) },
        { z: 0.5, draw: (g, p) => ST.cloudBank(g, p, T, { y: 1500, count: 7, speed: 160, color: '#5a1c5a', alpha: 0.95, size: 2.0, spread: 500, seed: 5 }) },
        { z: 1, haze: false, draw: (g) => { const gy = 1230 + 16 * Math.sin(T * 2.2);
          KIT.glow(g, 540, gy - 420, 900, '#ffb030', 0.6); KIT.glow(g, 540, gy - 450, 420, '#fff4c0', 0.5);
          CH.garuda.draw(g, { x: 548, y: gy, scale: 0.5, facing: 'left', pose: { name: 'spread', k: lerp(0.25, 1, open) }, expression: { mood: 'wrath' }, light: { dir: -Math.PI / 2 - 0.4, intensity: 1.35, front: 0.75, fill: 0.4 }, t: T, key: 'intro-ga' }); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'rain', count: 110, cam, alpha: 0.45, wind: -30 }) },
        { z: 1.8, haze: false, soft: 0.4, draw: (g, p) => ST.cloudBank(g, p, T, { y: 1840, count: 5, speed: 260, color: '#1c0a24', alpha: 1, size: 2.4, spread: 160, seed: 9 }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.28 }) });

  // ── 6 · M3 the curse on fire: Bhrigu close, in crimson; the arm thrown forward on "curses" ──
  R.scene({ id: 'm3', transition: { type: 'ink', dur: 0.45, at: [600, 760] },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.0, cam = CAM.push(t / env.dur, { from: 1.0, to: 1.12, focus: [520, 760] }), hit = E.outCubic(clamp((t - b0 - 0.1) / 0.4));
      ST.shot(ctx, T, { pal: 'wrath-crimson', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500 }) },
        { z: 0.3, soft: 0.45, draw: (g, p) => ST.treeline(g, p, { y: 1500, h: 1300, gap: 480, T, seed: 5, kind: 'mixed' }) },
        { z: 0.6, haze: false, draw: (g) => KIT.glow(g, 80, 1300, 1100, '#ff6a20', 0.5 * (1 - 0.6 * hit)) },
        { z: 1, haze: false, draw: (g, p) => CH.bhrigu.draw(g, { x: 700, y: 3200, scale: 2.5, facing: 'left', pose: ACT.pose(t, [[0, 'stand'], [b0 - 0.75, 'raise', { act: 0.3, an: 0.08 }], [b0 - 0.3, 'curse', { antic: 0.1, act: 0.13, settle: 0.4, over: 0.1 }]], { prop: false, wind: 0.6 }),
          light: { ...ST.light(p, { from: [80, 1300], at: [600, 1200], k: 1.2 * KIT.flicker(T, 2), front: lerp(0.8, 0.5, hit) }), tint: ['#ffb050', 0.4] }, expression: { emo: 'wrath', speak: 0, gaze: [0.8, 0.4] }, t: T, key: 'intro-bh' }) },
        { z: 1.5, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 30, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.5, paper: 0.28 }) });

  // ── 7 · M4 the ferry girl: Satyavati rowing across the deep-blue Yamuna; a lateral track ──
  const BY = 1130;
  R.scene({ id: 'm4', transition: { type: 'brush', dur: 0.45, angle: 0.2, color: '#c8e8f8' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.slide(t / env.dur, { from: 150, to: -110, zoom: 1.3 });
      EP49.river(ctx, T, cam, { sun: [250, 420, 70], figs: (g, p) => { g.save(); g.translate(90 - 60 * t, 6 * Math.sin(T * 1.6));
        g.fillStyle = 'rgba(20,12,8,0.9)'; g.beginPath(); g.ellipse(-60, BY + 30, 200, 60, 0, 0, TAU); g.fill(); EP49.boat(g, 500, BY, 0.9);
        CH.satyavati.draw(g, { x: 770, y: BY - 30, scale: 0.6, facing: 'left', pose: ACT.pose(t, [[0, 'row']], { prop: 'oar', phase: T * 1.8 }), light: ST.light(p, { from: [250, 300], at: [900, BY], front: 0.5, k: 1.15 }), expression: { emo: 'calm', gaze: [0.6, 0.1] }, t: T, key: 'intro-sa' });
        g.restore(); } });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.42, paper: 0.3 }) });

  // ── 8 · M5 Vyasa's arrival, through a carved arch (the hall of episode 47, drawn here so this reel does not load that episode) ──
  const arrival = (ctx, T, cam, k, o = {}) => {
    const fl = KIT.flicker(T, 11), s = lerp(0.34, 1.06, k), x = lerp(600, 560, k), y = lerp(1180, GY + 60, k);
    ST.shot(ctx, T, { pal: 'arrival-umber-gold', cam, layers: [
      { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -400, 0, 1500); gr.addColorStop(0, '#0a0503'); gr.addColorStop(0.6, '#2a1608'); gr.addColorStop(1, '#5a3410'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720);
        g.fillStyle = '#ffe2a0'; g.beginPath(); g.moveTo(400, 1140); g.lineTo(400, 640); g.quadraticCurveTo(580, 460, 760, 640); g.lineTo(760, 1140); g.closePath(); g.fill(); KIT.glow(g, 580, 900, 700, '#ffcf7a', 0.6 * fl); } },
      { z: 0.3, draw: (g, p) => { ST.pillars(g, p, { y: 1330, n: 6, x0: 900, x1: 250 });
        for (let i = 0; i < 6; i++) for (const sg of [-1, 1]) { const u = i / 5, lx = 540 + sg * lerp(900, 250, u) * 0.86, ly = lerp(700, 960, u); KIT.glow(g, lx, ly, lerp(200, 60, u), '#ffb050', 0.55 * KIT.flicker(T, i + (sg > 0 ? 7 : 0))); g.fillStyle = '#ffe9b0'; g.beginPath(); g.ellipse(lx, ly, lerp(10, 4, u), lerp(22, 8, u), 0, 0, TAU); g.fill(); } } },
      { z: 0.6, haze: false, draw: (g) => { g.fillStyle = '#1a0c04'; g.beginPath(); g.moveTo(-900, 1960); g.lineTo(-900, 1300); g.lineTo(470, 1130); g.lineTo(690, 1130); g.lineTo(1980, 1300); g.lineTo(1980, 1960); g.closePath(); g.fill();
        g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.28 * fl; g.fillStyle = '#ffb050'; g.beginPath(); g.moveTo(480, 1130); g.lineTo(680, 1130); g.lineTo(1200, 1960); g.lineTo(-40, 1960); g.closePath(); g.fill(); g.restore(); } },
      { z: 1, haze: false, draw: (g) => { g.save(); g.globalAlpha = 0.9; const hg = g.createRadialGradient(x, y - 560 * s, 60 * s, x, y - 560 * s, 760 * s); hg.addColorStop(0, '#fff0c0'); hg.addColorStop(0.55, 'rgba(255,200,110,0.85)'); hg.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = hg; g.fillRect(x - 800 * s, y - 1400 * s, 1600 * s, 1700 * s); g.restore();
        CH.vyasaSage.draw(g, { x, y, scale: s, facing: 'left', pose: ACT.pose(0, [[0, 'walk']], { phase: o.phase || 0, stride: 0.7, prop: false }), light: { dir: -Math.PI / 2 - 0.5, intensity: 1.2, front: 0.07, fill: 0, wrap: 0.6, tint: ['#ffcf7a', 0.6] }, expression: { emo: 'calm', gaze: [0.6, 0.1] }, t: T, key: 'intro-ar' }); } },
      { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 34, cam }) },
    ] });
  };
  R.scene({ id: 'm5', transition: { type: 'lamp', dur: 0.6, from: [300, 900], to: [580, 900] },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 0.5, k = clamp(0.28 + 0.2 * t);
      ST.within(ctx, T, { shape: 'arch', pal: 'arrival-umber-gold', box: [60, 150, 960, 1330], open: 1, draw: (c2) => arrival(c2, T, CAM.push(clamp(t / env.dur), { from: 1.0, to: 1.12, focus: [570, 900] }), k, { phase: t * 3.4 }) });
      TY.plaque(ctx, T, clamp((t - b0) / 0.5), 'Vyasa', env.script.names.Vyasa, { x: 250, y: 300, out: clamp((t - (env.dur - 0.35)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }) });

  // ── 9 · M6 far ahead: from above, two dice fall on a red cloth; on "the war" the cloth's squares become a field and two
  //        lines of small spearmen close in, iron-cold. No blood, no triumph. A pull back. ──
  const soldier = (g, x, y, s, dir, col, T, i) => { const bob = 3 * Math.sin(T * 5 + i);
    g.fillStyle = col; g.beginPath(); g.ellipse(x, y - 46 * s + bob, 17 * s, 46 * s, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(x + dir * 4 * s, y - 104 * s + bob, 15 * s, 0, TAU); g.fill();
    g.strokeStyle = '#e8ecff'; g.lineWidth = 4 * s; g.beginPath(); g.moveTo(x + dir * 20 * s, y - 6 * s + bob); g.lineTo(x + dir * 44 * s, y - 190 * s + bob); g.stroke();
    g.fillStyle = '#e8ecff'; g.beginPath(); g.moveTo(x + dir * 44 * s, y - 214 * s + bob); g.lineTo(x + dir * 37 * s, y - 186 * s + bob); g.lineTo(x + dir * 52 * s, y - 186 * s + bob); g.fill(); };
  R.scene({ id: 'm6', transition: { type: 'ink', dur: 0.4, at: [540, 800], color: '#3a0a08' },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.67, b1 = env.beats[1] ?? 2.87, cam = CAM.drift(CAM.pull(clamp(t / env.dur), { from: 1.5, to: 1.0, focus: [540, 780] }), T, 0.5);
      const fall = clamp((t - 0.1) / (b0 - 0.1)), spin = (1 - E.outCubic(clamp(t / (b0 + 0.35)))) * 11, war = E.inOutSine(clamp((t - b1 + 0.45) / 0.7));
      ST.shot(ctx, T, { pal: 'dice-vermilion', cam, grade: 0.5 * (1 - war), layers: [
        { z: 0, haze: false, draw: (g) => { g.fillStyle = KIT.hex('#3a0a08', '#0a0c18', war); g.fillRect(-900, -900, 2880, 3720); } },
        { z: 1, haze: false, draw: (g) => {
          g.fillStyle = KIT.hex('#a81e14', '#2a2e4a', war); g.beginPath(); g.roundRect(70, 260, 940, 1000, 40); g.fill(); g.strokeStyle = KIT.hex('#ffe08a', '#c8d0f0', war); g.lineWidth = 10; g.stroke(); g.lineWidth = 3; g.beginPath(); g.roundRect(110, 300, 860, 920, 26); g.stroke();
          g.strokeStyle = KIT.hex('#ffe08a', '#8a94c0', war); g.globalAlpha = 0.5; g.lineWidth = 4; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(110 + i * 215, 300); g.lineTo(110 + i * 215, 1220); g.stroke(); g.beginPath(); g.moveTo(110, 300 + i * 230); g.lineTo(970, 300 + i * 230); g.stroke(); } g.globalAlpha = 1;
          if (war < 1) { g.save(); g.globalAlpha = 1 - war;   // the stakes on the cloth: five crowns and a small white city
            for (let i = 0; i < 5; i++) { const x = 190 + i * 52, y = 1090 + 30 * (i % 2); g.fillStyle = '#ffe08a'; g.beginPath(); g.moveTo(x - 22, y); g.lineTo(x - 22, y - 28); g.lineTo(x - 9, y - 13); g.lineTo(x, y - 38); g.lineTo(x + 9, y - 13); g.lineTo(x + 22, y - 28); g.lineTo(x + 22, y); g.fill(); }
            g.fillStyle = '#f4f8ff'; for (let i = 0; i < 5; i++) { g.fillRect(730 + i * 38, 470 - 24 * (i % 2), 30, 80 + 24 * (i % 2)); } g.restore(); }
          // the armies come onto the board from both sides (two ranks each), and stop a square apart
          if (war > 0) for (const dir of [1, -1]) for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) { const x = 540 - dir * lerp(800, 215 + r * 150, war), y = 560 + i * 200 + r * 90; soldier(g, x, y, 1.25, dir, dir > 0 ? '#c8d4f4' : '#7a2a24', T, i + r * 7 + (dir > 0 ? 0 : 20)); }
          if (war > 0) for (const dir of [1, -1]) { const x = 540 - dir * lerp(800, 330, war); g.fillStyle = '#e8ecff'; g.fillRect(x - 3, 330, 6, 150); g.fillStyle = dir > 0 ? '#e7b54a' : '#c8401a'; g.beginPath(); g.moveTo(x, 334); g.lineTo(x + dir * 96, 362 + 8 * Math.sin(T * 4)); g.lineTo(x, 398); g.fill(); }
          // the dice
          for (const [dx, dy, r0] of [[-60, 0, 0.3], [70, 70, -0.5]]) { g.save(); g.translate(540 + dx + 260 * (1 - fall) * (dx < 0 ? -1 : 1), lerp(120, 760 + dy, fall * fall)); g.scale(1 + 0.9 * (1 - fall), 1 + 0.9 * (1 - fall)); g.rotate(r0 + spin); g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.roundRect(-44, -36, 104, 104, 14); g.fill(); g.fillStyle = '#fff4d8'; g.beginPath(); g.roundRect(-52, -52, 104, 104, 16); g.fill(); g.fillStyle = '#2a0a0a'; for (const [px, py] of [[-24, -24], [24, 24], [0, 0]]) { g.beginPath(); g.arc(px, py, 10, 0, TAU); g.fill(); } g.restore(); }
          const hit = clamp((t - b0 + 0.05) / 0.35); if (hit > 0 && hit < 1) { g.strokeStyle = `rgba(255,240,200,${1 - hit})`; g.lineWidth = 8; g.beginPath(); g.ellipse(550, 800, 260 * hit, 180 * hit, 0, 0, TAU); g.stroke(); }
        } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: war > 0.5 ? 'dust' : 'ember', count: 26, cam }) },
      ] });
      if (war > 0.02) { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.5 * war; ctx.fillStyle = '#5a6ab0'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore(); }
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.55, paper: 0.32 }) });

  // ── 10 · VOW (THE TURN, after a real silence; the close-up): Vyasa's face against a pearl dawn: weary, then resolved,
  //         then a small warmth ──
  R.scene({ id: 'vow', transition: { type: 'lamp', dur: 0.7, from: [540, 800], to: [300, 600] },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.5, b1 = env.beats[1] ?? 3.0, sp0 = env.speech[0], cam = CAM.drift(CAM.push(t / env.dur, { from: 1.0, to: 1.13, focus: [520, 720] }), T, 1.1);
      ST.shot(ctx, T, { pal: 'riverbank-pearl', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500, sun: [230, 560, 90] }) },
        { z: 0.15, draw: (g, p) => { ST.cloudBank(g, p, T, { y: 420, count: 5, size: 1.5 }); ST.hills(g, p, { y: 1500, h: 520, seed: 81 }); } },
        { z: 0.35, soft: 0.5, draw: (g, p) => { ST.treeline(g, p, { y: 1520, h: 760, gap: 520, T, seed: 83, kind: 'mixed' }); } },
        { z: 0.6, haze: false, draw: (g) => ST.mist(g, T, { y: 1250, h: 500, alpha: 0.5 }) },
        { z: 1, haze: false, draw: (g, p) => CH.vyasaSage.draw(g, { x: 660, y: 3050, scale: 2.5, facing: 'left', pose: ACT.pose(t, [[0, 'stand']], { prop: false }),
          light: { ...ST.light(p, { from: [230, 500], at: [600, 1200], k: 1.15, front: 0.86 }), fill: 0.55, tint: ['#fff0d8', 0.35], minLum: 0.3 },
          expression: { emo: ACT.emo(t, [[0, 'weary'], [sp0 - 0.1, 'resolve', { dur: 0.6 }], [b1 + 0.5, 'tender', { dur: 0.7 }]]), speak: 0, ...ACT.lead(t, [[0, [0.9, 0.5]], [sp0 - 0.2, [0.7, 0.05]], [b1 - 0.2, [0.2, -0.05]]], 0.45, 0.2) }, t: T, key: 'intro-vow' }) },
        { z: 1.5, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 22, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.26, vignette: 0.4, paper: 0.3 }) });

  // ── 11 · EDITION: palm leaves of the text on ivory; the edition named; on "label" the series' own tag stamps onto one leaf ──
  R.scene({ id: 'edition', transition: { type: 'brush', dur: 0.5, angle: -0.2, color: '#f4e8c8' },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.07, b1 = env.beats[1] ?? 4.56, S = env.strings, cam = CAM.drift(CAM.slide(t / env.dur, { from: -90, to: 90, zoom: 1.08 }), T, 0.6);
      const st = clamp((t - b1 + 0.12) / 0.3), later = E.inOutSine(clamp((t - b1 + 1.9) / 0.8));
      ST.shot(ctx, T, { pal: 'seat-ivory', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -300, 0, 2100); gr.addColorStop(0, '#f6ecd0'); gr.addColorStop(0.6, '#e2cc98'); gr.addColorStop(1, '#a8884a'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); } },
        { z: 0.3, soft: 0.4, draw: (g, p) => { ST.pillars(g, p, { y: 1700, n: 4 }); KIT.glow(g, 880, 500, 700, '#fffbf0', 0.5); } },
        { z: 0.8, haze: false, draw: (g) => ST.shafts(g, T, { x: 860, angle: -0.4, count: 4, alpha: 0.14, color: '#fffbe8' }) },
        { z: 1, haze: false, draw: (g) => {
          g.fillStyle = 'rgba(70,44,14,0.22)'; g.beginPath(); g.ellipse(540, 1215, 520, 46, 0, 0, TAU); g.fill();   // the low reading-stand's shadow
          for (let i = 0; i < 5; i++) { const op = E.outCubic(clamp((t - 0.1 - i * 0.16) / 0.7)), y = 540 + i * 150, last = i === 3;
            if (last && later > 0) { g.save(); g.globalAlpha = 0.5 * later; g.fillStyle = '#c85a80'; g.beginPath(); g.roundRect(540 - 440 * op, y - 60, 880 * op, 120, 56); g.fill(); g.restore(); }   // the leaf from later tradition, marked
            KIT.manuscript.leaf(g, 540, y, 880, 112, op, { seed: 51 + i, light: 0.55, tilt: (i - 2) * 0.012 + 0.004 * Math.sin(T * 0.8 + i), ink: 1, alpha: 1 }); }
          g.strokeStyle = '#7a2a14'; g.lineWidth = 7; g.beginPath(); g.moveTo(330, 460); g.lineTo(330, 1180); g.moveTo(750, 460); g.lineTo(750, 1180); g.stroke();   // the binding cords
        } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 30, cam }) },
      ] });
      TY.plaque(ctx, T, clamp((t - b0 + 0.3) / 0.5), S.editionTag, S.editionSub, { x: 540, y: 262, size: 52, out: clamp((t - (env.dur - 0.35)) / 0.3) });
      if (st > 0) { const sc = lerp(1.5, 1, E.outCubic(st)); ctx.save(); ctx.translate(560, 995); ctx.rotate(-0.05); ctx.scale(sc, sc); TY.tag(ctx, T, st, S.traditionNote, { x: 0, y: 14, size: 50, color: '#ffd9a0', out: clamp((t - (env.dur - 0.3)) / 0.3) }); ctx.restore(); }
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.24, vignette: 0.36, paper: 0.34 }) });

  // ── 12 · MADE: a shot builds itself in the open: each plane rises into place as a bare shape with its guide lines; on
  //         "drawn in code" the light and the colour come on. Two small tags say what is synthetic. ──
  R.scene({ id: 'made', transition: { type: 'ink', dur: 0.55, at: [540, 900], color: '#16402a' },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 1.27, b1 = env.beats[1] ?? 3.66, S = env.strings;
      const cam = CAM.drift(CAM.mix(CAM.rack(clamp(t / 0.7), { from: 1.5, to: 1.0, zoom: 1.0, soft: Math.max(0.001, 1 - clamp((t - 0.4) / 0.8)) }), CAM.push(t / env.dur, { from: 1.0, to: 1.08, focus: [480, 900] })), T, 0.6);
      const on = E.inOutSine(clamp((t - b1 + 0.55) / 0.6));   // the light comes on
      const up = (i) => 1 - E.outBack(clamp((t - 0.1 - i * 0.3) / 0.55));   // plane i still below its place (1 → 0)
      const rise = (g, i) => { g.translate(0, 1500 * Math.max(0, up(i))); };
      const guide = (g, i, y) => { const a = clamp(1 - on) * clamp((t - 0.1 - i * 0.3) / 0.2); if (a <= 0) return; g.save(); g.globalAlpha = 0.8 * a; g.strokeStyle = '#ffe08a'; g.lineWidth = 3; g.setLineDash([18, 12]); g.beginPath(); g.moveTo(-200, y); g.lineTo(1280, y); g.stroke(); g.setLineDash([]); g.fillStyle = '#ffe08a'; for (const x of [70, 1010]) { g.fillRect(x - 9, y - 9, 18, 18); } g.restore(); };
      ST.shot(ctx, T, { pal: 'hermitage-green', cam, grade: 0.5 * on, layers: [
        { z: 0, haze: false, draw: (g, p) => { g.fillStyle = '#e9dfc4'; g.fillRect(-900, -900, 2880, 3720); g.save(); rise(g, 0); ST.sky(g, p, { hz: HZ, sun: on > 0.05 ? [860, 520, 56] : null }); g.restore(); } },
        { z: 0.15, draw: (g, p) => { g.save(); rise(g, 1); ST.cloudBank(g, p, T, { y: 420, count: 4 }); ST.hills(g, p, { y: HZ, h: 420, seed: 2 }); guide(g, 1, HZ - 420); g.restore(); } },
        { z: 0.4, draw: (g, p) => { g.save(); rise(g, 2); ST.treeline(g, p, { y: HZ + 10, h: 620, T, seed: 5, kind: 'mixed' }); guide(g, 2, HZ - 610); g.restore(); } },
        { z: 0.7, draw: (g, p) => { g.save(); rise(g, 3); ST.treeline(g, p, { y: HZ + 40, h: 900, gap: 520, T, seed: 9, color: p.near, kind: 'banyan' }); ST.hut(g, p, { x: 800, y: HZ + 50, s: 1.15, lit: 0.6 * on }); g.restore(); } },
        { z: 0.85, haze: false, draw: (g) => { if (on > 0.02) ST.shafts(g, T, { x: 780, angle: -0.42, count: 5, alpha: 0.18 * on }); } },
        { z: 1, haze: false, draw: (g, p) => { g.save(); rise(g, 4); ST.ground(g, p, { y: GY - 20 }); guide(g, 4, GY - 20); g.restore();
          g.save(); rise(g, 5);
          CH.puloma.draw(g, { x: 330, y: GY + 10, scale: 0.98, facing: 'right', pose: ACT.pose(t, [[0, 'attend'], [b1 - 0.2, 'carry', { act: 0.6 }]]), light: { ...ST.light(p, { from: [860, 400], at: [330, GY], front: lerp(0.06, 0.8, on), k: lerp(0.9, 1.15, on) }), fill: 0.3 * on }, expression: { emo: ACT.emo(t, [[0, 'calm'], [b1, 'joy']]), gaze: [0.5, 0] }, t: T, key: 'intro-pu' });
          g.restore(); } },
        { z: 1.25, haze: false, draw: (g) => { if (on > 0.02) ST.particles(g, T, { kind: 'pollen', count: Math.round(44 * on), cam }); } },
        { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => { g.save(); rise(g, 6); ST.trunks(g, p, { xs: [-170, 1250], w: 200 }); ST.grass(g, p, { y: 1940, h: 300, T }); g.restore(); } },
      ] });
      TY.tag(ctx, T, clamp((t - b0 + 0.3) / 0.4), S.voiceTag, { x: 300, y: 250, size: 42, out: clamp((t - (env.dur - 0.3)) / 0.3) });
      TY.tag(ctx, T, clamp((t - b1 + 0.3) / 0.4), S.codeTag, { x: 790, y: 250, size: 42, out: clamp((t - (env.dur - 0.3)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.26, vignette: 0.4, paper: 0.3 }) });

  // ── 13 · BEGIN (after a second silence): the forest at the blue hour, a small fire, the seated sages; Sauti comes in
  //         with his staff. A crane down through the trees. ──
  const sagesBack = (g, fl, front) => { for (const [x, i] of [[395, 2], [690, 5]]) CH.sage.draw(g, { x, y: GY - 70, scale: 0.6, index: i, facing: 'front', pose: 'sit', expression: { look: x < 540 ? 0.5 : 0.6 }, light: { dir: Math.atan2(200, 540 - x), intensity: 1.15 * fl, front: front ?? 0.62 }, t: 0, key: 'intro-sg' + i }); };
  const firelit = (x, fl) => ({ ...EP41.lit(x, fl, 0.85), fill: 0.45, intensity: 1.5 });
  R.scene({ id: 'begin', transition: { type: 'smoke', dur: 0.7, dir: -Math.PI / 2, color: '#243a6a' },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0] ?? 2.05, b1 = env.beats[1] ?? 5.28;
      const cam = CAM.drift(CAM.crane(clamp(t / 4.6), { from: 1.34, to: 1.04, y0: -420, y1: 0, ease: E.inOutSine }), T, 0.5);
      const arrive = E.outCubic(clamp((t - 0.3) / 3.3)), sx = lerp(1260, 850, arrive), moving = 1 - clamp((t - 3.3) / 0.5);
      EP41.naimisha(ctx, T, cam, { figs: (g, p, fl) => {
        sagesBack(g, fl, 0.04);   // soot-dark against the fire's glow, an amber rim
        CH.elder.draw(g, { x: 190, y: GY + 20, scale: 0.9, facing: 'right', pose: { name: 'sit', base: 'sit' }, expression: { look: -0.2 * clamp((t - 1.2) / 0.6) }, light: firelit(190, fl), t: T, key: 'intro-el' });
        CH.sauti.draw(g, { x: sx, y: GY + 20, scale: 0.94, facing: 'left', pose: { name: 'walk', phase: ACT.stride(1260 - sx, 0.94), stride: 0.9 * moving }, light: firelit(sx, fl), t: T, key: 'intro-sw' });
      } });
      TY.plaque(ctx, T, clamp((t - b1 + 0.9) / 0.5), 'Naimisha', env.script.names.Naimisha, { x: 330, y: 330, out: clamp((t - (env.dur - 0.35)) / 0.3) });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.38, vignette: 0.5, paper: 0.3 }) });

  // ── 14 · INVITE: the same fire at first light; Sauti seated, a hand open to us. The source line (fixed), then episode
  //         1's title. The shot keeps drifting to its last frame. ──
  R.scene({ id: 'invite', transition: { type: 'lamp', dur: 0.8, from: [540, 1200], to: [540, 1200] },
    draw(ctx, t, env) {
      const T = env.T, b1 = env.beats[1] ?? 2.3, S = env.strings, sp1 = env.speech[1];
      const cam = CAM.drift(CAM.push(clamp(t / (env.dur + 0.4)), { from: 1.02, to: 1.2, focus: [600, 980], ease: (x) => x }), T, 1.3);
      const tap = Math.sin(Math.PI * clamp((t - b1 + 0.1) / 0.3));
      const dawnlit = { dir: -2.4, intensity: 1.25, front: 0.1, fill: 0 };   // against first light they are dark shapes with a gold rim (they must stand off a pale ground)
      EP41.naimisha(ctx, T, cam, { pal: 'naimisha-firstlight', figs: (g, p, fl) => {
        sagesBack(g, fl, 0.04);
        CH.elder.draw(g, { x: 190, y: GY + 20, scale: 0.9, facing: 'right', pose: { name: 'sit', base: 'sit' }, light: dawnlit, t: T, key: 'intro-el2' });
        CH.sauti.draw(g, { x: 880, y: GY + 20, scale: 0.94, facing: 'left', pose: { name: 'speak', k: 0.55 + 0.35 * tap + 0.1 * Math.sin(T * 1.3), base: 'sit' }, light: dawnlit, expression: { speak: talk(env, t) }, t: T, key: 'intro-ss' });
      } });
      TY.source(ctx, T, clamp((t - 0.7) / 0.5), S);
      const k = clamp((t - sp1 + 0.5) / 0.7);
      if (k > 0) {
        KIT.series.episodeTitle(ctx, T, k, { ...S, episodeLabel: S.nextEpisodeLabel, episodeTitle: S.nextTitle }, { y: 560, key: 'intro-ep1' });
        TY.tag(ctx, T, clamp((t - sp1 - 0.1) / 0.5), S.followWord + ' · ' + S.nextEpisodeLabel + ' is next', { x: 540, y: 720, size: 44 });
      }
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.45, paper: 0.3 }) });
})();
