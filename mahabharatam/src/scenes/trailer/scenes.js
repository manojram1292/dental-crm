/* THE FULL-EPIC TRAILER · "Mahabharatam: As Vyasa Told It" (script/trailer.en.json; pipeline number 97, never a numbered
 * episode). One scene per script line; every image was read in the Critical Edition first (script/TRAILER-CHECK.md).
 * Loads after ep41/_common (EP41), ep46/_common and ep49/_common (EP49.boat). Figures: src/kit/characters/epic-cast.js.
 * Rules of this cut: one colour world per beat, one strong light source, big figures (heads under y ≈ 450 so a plaque fits
 * above them at y ≈ 250), the camera always moving, picture timing taken from the line's own length and beats. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41, EP49 = window.EP49;
  const { TAU, clamp, lerp, E, hash } = R;
  const GY = EP41.GY;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const nm = (env, n) => [n, env.script.names[n]];
  const lit = (p, from, x, front = 0.8, k = 1.15, o = {}) => ({ ...ST.light(p, { from, at: [x, GY], front, k }), fill: 0.3, ...o });
  const fig = (id, g, T, x, y, s, facing, pose, L, ex, key) => CH[id].draw(g, { x, y, scale: s, facing, pose, light: L, expression: ex || { emo: 'calm' }, t: T, key: key || id });
  const plaque = (ctx, T, env, t, name, x, y, o = {}) => TY.plaque(ctx, T, clamp((t - (o.at ?? 0.25)) / 0.42), ...nm(env, name), { x, y, size: o.size ?? 58, out: clamp((t - (env.dur - 0.3)) / 0.25) });
  const beat = (env, i, d) => env.beats[i] ?? d;
  const bare = (pose) => ({ ...pose, bare: true });   // the hand-prop laid aside (epic-cast.js)

  // ── things ──
  // the wheel (sudarśana: "sun-bright, razor-edged", CE 6.55.86): a serrated ring of gold fire with spokes, turning
  const chakra = (g, x, y, r, T, a = 1) => { if (a <= 0.01) return;
    g.save(); g.globalAlpha = a; KIT.glow(g, x, y, r * 3.4, '#ffb030', 0.55); KIT.glow(g, x, y, r * 1.7, '#fff4c0', 0.6);
    g.translate(x, y); g.rotate(T * 9);
    g.fillStyle = '#ff9a1e'; g.beginPath(); for (let i = 0; i < 24; i++) { const an = (i / 24) * TAU; g.lineTo(Math.cos(an) * r * 1.2, Math.sin(an) * r * 1.2); g.lineTo(Math.cos(an + 0.13) * r * 0.96, Math.sin(an + 0.13) * r * 0.96); } g.closePath(); g.fill();
    g.fillStyle = '#ffe890'; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.arc(0, 0, r * 0.74, 0, TAU, true); g.fill();
    g.strokeStyle = '#fff8dc'; g.lineWidth = r * 0.07; for (let i = 0; i < 8; i++) { const an = (i / 8) * TAU; g.beginPath(); g.moveTo(Math.cos(an) * r * 0.2, Math.sin(an) * r * 0.2); g.lineTo(Math.cos(an) * r * 0.76, Math.sin(an) * r * 0.76); g.stroke(); }
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, 0, r * 0.22, 0, TAU); g.fill(); g.restore(); };
  // a war chariot, side on (dir: +1 = it faces right). (x, y) = the ground under its axle
  const chariot = (g, x, y, s, dir, T, o = {}) => { g.save(); g.translate(x, y); g.scale(dir * s, s);
    const body = o.body || '#5a2a14', trim = o.trim || '#e7b54a';
    g.strokeStyle = '#2a140a'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(120, -230); g.lineTo(620, -300); g.stroke();   // the pole
    g.fillStyle = body; g.beginPath(); g.moveTo(-250, -230); g.lineTo(-270, -470); g.lineTo(-210, -470); g.lineTo(-180, -330); g.lineTo(190, -330); g.quadraticCurveTo(250, -330, 250, -230); g.closePath(); g.fill();
    g.fillStyle = trim; g.fillRect(-250, -246, 500, 14); g.fillRect(-274, -482, 70, 14);
    if (o.flag) { g.fillStyle = '#2a140a'; g.fillRect(-262, -1010, 12, 540); g.fillStyle = o.flag; g.beginPath(); g.moveTo(-250, -1000); g.lineTo(-60 + 16 * Math.sin(T * 4), -950); g.lineTo(-250, -880); g.fill(); }
    g.save(); g.translate(0, -170); g.rotate((o.roll ?? 0)); g.strokeStyle = '#1a0c06'; g.lineWidth = 30; g.beginPath(); g.arc(0, 0, 160, 0, TAU); g.stroke(); g.strokeStyle = trim; g.lineWidth = 8; g.beginPath(); g.arc(0, 0, 160, 0, TAU); g.stroke();
    g.strokeStyle = '#3a1c0c'; g.lineWidth = 14; for (let i = 0; i < 8; i++) { const an = (i / 8) * TAU; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(an) * 150, Math.sin(an) * 150); g.stroke(); } g.fillStyle = trim; g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.fill(); g.restore();
    g.restore(); };
  // a line of an army, far off: heads, spears and a few banners (dir: the way it faces)
  const army = (g, x0, x1, y, n, dir, col, T, o = {}) => { for (let i = 0; i < n; i++) { const u = i / (n - 1), x = lerp(x0, x1, u) + 8 * (hash(i, 3) - 0.5), yy = y + 16 * (hash(i, 4) - 0.5), s = (o.s ?? 1) * (0.9 + 0.2 * hash(i, 5)), bob = 3 * Math.sin(T * 3 + i);
      g.fillStyle = col; g.beginPath(); g.ellipse(x, yy - 60 * s + bob, 22 * s, 62 * s, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(x + dir * 5 * s, yy - 138 * s + bob, 19 * s, 0, TAU); g.fill();
      g.strokeStyle = o.spear || '#d8dcf0'; g.lineWidth = 4 * s; g.beginPath(); g.moveTo(x + dir * 24 * s, yy - 10 * s); g.lineTo(x + dir * 50 * s, yy - 290 * s + bob); g.stroke();
      if (i % 5 === 2) { g.fillStyle = o.flag || '#c8401a'; g.beginPath(); g.moveTo(x + dir * 50 * s, yy - 290 * s); g.lineTo(x + dir * (50 + 90) * s, yy - 262 * s + 6 * Math.sin(T * 4 + i)); g.lineTo(x + dir * 46 * s, yy - 232 * s); g.fill(); } } };
  // rows of seated listeners (a court, the hall): dark shapes with a rim; `bow` tips the heads down
  const court = (g, y, col, rimc, bow = 0, n = 9) => { for (let r = 0; r < 2; r++) for (let i = 0; i < n; i++) { const x = -40 + i * (1160 / (n - 1)) + r * 60, yy = y + r * 80; g.fillStyle = col; g.beginPath(); g.ellipse(x, yy - 60, 56, 70, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(x + 14 * bow, yy - 150 + 26 * bow, 34, 0, TAU); g.fill(); g.strokeStyle = rimc; g.lineWidth = 3; g.beginPath(); g.arc(x + 14 * bow, yy - 150 + 26 * bow, 34, -2.4, -0.6); g.stroke(); } };
  const fires = (g, T, hz, n, seedK = 0) => { for (let i = 0; i < n; i++) { const u = hash(i, 61 + seedK), d = u * u, x = -100 + 1280 * hash(i, 62 + seedK), y = lerp(hz + 20, 1900, d), s = lerp(0.25, 1.5, d), fl = KIT.flicker(T, i);
      KIT.glow(g, x, y - 40 * s, 240 * s, '#ff7a1e', 0.42 * fl); for (const [c, q] of [['#c8341a', 1], ['#f08a24', 0.68], ['#ffe08a', 0.36]]) { g.fillStyle = c; g.beginPath(); g.moveTo(x - 34 * s * q, y); g.quadraticCurveTo(x - 40 * s * q, y - 60 * s * q, x + 8 * s * Math.sin(T * 5 + i), y - (130 + 18 * Math.sin(T * 7 + i)) * s * q); g.quadraticCurveTo(x + 40 * s * q, y - 60 * s * q, x + 34 * s * q, y); g.fill(); }
      g.fillStyle = '#1a100c'; g.fillRect(x - 46 * s, y - 4 * s, 92 * s, 12 * s); } };
  const titleBand = (ctx, y, a) => { ctx.save(); ctx.globalAlpha = a; const gr = ctx.createLinearGradient(0, y - 230, 0, y + 250); gr.addColorStop(0, 'rgba(6,5,10,0)'); gr.addColorStop(0.3, 'rgba(6,5,10,0.74)'); gr.addColorStop(0.78, 'rgba(6,5,10,0.74)'); gr.addColorStop(1, 'rgba(6,5,10,0)'); ctx.fillStyle = gr; ctx.fillRect(0, y - 230, R.W, 480); ctx.restore(); };

  // ── 1 · HOOK (CE 6.55.86–98): Krishna down from the chariot, the wheel raised, running at Bhishma; Arjuna has his arm ──
  R.scene({ id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, b1 = beat(env, 1, 1.9), S = env.strings, run = E.outCubic(clamp(t / 2.4)), kx = lerp(120, 470, run), shake = 5 * Math.sin(T * 31) * (1 - clamp(t / 2.6));
      const cam = CAM.drift(CAM.push(clamp(t / 3.0), { from: 1.5, to: 1.04, focus: [560, 620], ease: E.outCubic }), T, 1.2);
      cam.py += shake;
      ST.shot(ctx, T, { pal: 'war-iron', cam, layers: [
        { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 1180 }); KIT.glow(g, 900, 1120, 900, '#ff5a2a', 0.5); g.fillStyle = '#ff8a4a'; g.beginPath(); g.arc(900, 1130, 120, 0, TAU); g.fill(); } },
        { z: 0.2, draw: (g, p) => ST.cloudBank(g, p, T, { y: 420, count: 7, speed: 60, color: '#2a2a48', alpha: 0.9, size: 1.6 }) },
        { z: 0.45, draw: (g) => { army(g, -200, 380, 1210, 14, 1, '#14142a', T, { s: 0.8, flag: '#e7b54a' }); army(g, 700, 1300, 1210, 14, -1, '#1c1222', T, { s: 0.8 }); } },
        { z: 0.8, haze: false, draw: (g, p) => {   // Bhishma on his chariot, bow in hand, unafraid (6.55.93)
          chariot(g, 940, GY - 150, 0.62, -1, T, { body: '#3a3a52', trim: '#c8d0e0', flag: '#f0f0f8' });
          fig('epicBhishma', g, T, 930, GY - 350, 0.52, 'left', ACT.pose(t, [[0, 'stand'], [1.2, 'bless', { act: 0.6 }]]), lit(p, [900, 900], 930, 0.6, 1.2), { emo: 'calm', gaze: [0.8, 0.2] }, 'hk-bh'); } },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 40, color: '#2a2438', color2: '#0c0a16' });
          const ph = ACT.stride(kx, 0.92) * 1.0, moving = 1 - clamp((t - 2.0) / 0.5);
          // Arjuna behind, both hands on him (6.55.96)
          fig('epicArjuna', g, T, kx - 250, GY + 26, 0.86, 'right', bare(ACT.pose(t, [[0, 'run'], [1.1, 'reach', { act: 0.3 }]], { phase: ph + 1.4 })), lit(p, [900, 900], kx - 250, 0.7), { emo: 'fear', gaze: [0.8, -0.2] }, 'hk-ar');
          const wx = kx + 30, wy = GY + 26 - 1046 * 0.92 - 150;
          chakra(g, wx, wy, 150, T);
          fig('epicKrishna', g, T, kx, GY + 26, 0.92, 'right', ACT.pose(t, [[0, { run: 0.55, raise: 0.45 }], [2.1, 'raise', { act: 0.4 }]], { phase: ph, stride: 0.9 * moving, wind: 1 }), { ...lit(p, [wx, wy], kx, 0.85, 1.3), tint: ['#ffd070', 0.5] }, { emo: 'wrath', gaze: [0.9, -0.1] }, 'hk-kr'); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 60, cam }) },
        { z: 1.6, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 30, cam }) },
      ] });
      const a = clamp(t / 0.2), y = 1420; titleBand(ctx, y, a);
      const sc = 1 + 0.05 * (1 - E.outCubic(clamp(t / 0.5)));
      ctx.save(); ctx.translate(540, y); ctx.scale(sc, sc); ctx.translate(-540, -y);
      KIT.goldText(ctx, (S.seriesTitle || '').toUpperCase(), 540, y, { size: 96, spacing: 7, weight: 700, alpha: a, glow: 0.4, sheen: clamp(t / 1.4) * 1.4 - 0.2, key: 'tr-title' }); ctx.restore();
      const k2 = E.outCubic(clamp((t - b1 + 0.3) / 0.4));
      if (k2 > 0) { ctx.save(); ctx.globalAlpha = k2; ctx.fillStyle = '#e7b54a'; ctx.fillRect(540 - 230 * k2, y + 34, 460 * k2, 3); ctx.restore(); KIT.goldText(ctx, 'ALL OF IT', 540, y + 108 + 14 * (1 - k2), { size: 58, spacing: 12, weight: 700, alpha: k2, glow: 0.25, key: 'tr-sub' }); }
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.3 }) });

  // ── 2 · VOW (CE 1.94.86–90): the young prince, a hand raised, before the fisher-king; flowers rain ──
  R.scene({ id: 'vow', transition: { type: 'lamp', dur: 0.5, from: [500, 300], to: [420, 520] },
    draw(ctx, t, env) {
      const T = env.T, b0 = beat(env, 0, 0.8), cam = CAM.drift(CAM.crane(clamp(t / env.dur), { from: 1.28, to: 1.06, y0: -160, y1: 30, ease: E.outCubic }), T, 0.8), fall = clamp((t - b0) / 1.0);
      ST.shot(ctx, T, { pal: 'island-gold', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1120, sun: [300, 760, 110] }) },
        { z: 0.2, draw: (g, p) => { ST.cloudBank(g, p, T, { y: 380, count: 5, size: 1.4 }); ST.hills(g, p, { y: 1120, h: 300, seed: 12 }); } },
        { z: 0.5, draw: (g, p) => { ST.water(g, p, { y0: 1120, y1: 1420, T, flow: 50, count: 70 }); EP49.boat(g, 760, 1260, 0.6); } },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 30 });
          fig('dasha', g, T, 850, GY + 20, 0.84, 'left', ACT.pose(t, [[0, 'stand'], [b0 + 0.2, 'anjali', { act: 0.5 }]], { prop: false }), lit(p, [300, 700], 850, 0.75), { emo: ACT.emo(t, [[0, 'calm'], [b0 + 0.3, 'wonder']]), gaze: [0.8, -0.1] }, 'vw-d');
          fig('epicDevavrata', g, T, 360, GY + 24, 0.9, 'right', ACT.pose(t, [[0, 'stand'], [b0 - 0.55, 'raise', { antic: 0.2, act: 0.3, an: 0.1 }]]), lit(p, [300, 700], 360, 0.8, 1.2), { emo: 'resolve', gaze: [0.8, 0] }, 'vw-b'); } },
        { z: 1.3, haze: false, draw: (g) => { ST.particles(g, T, { kind: 'petal', count: Math.round(70 * fall) + 2, cam }); } },
        { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => ST.grass(g, p, { y: 1960, h: 300, T, count: 40 }) },
      ] });
      plaque(ctx, T, env, t, 'Bhishma', 700, 262);
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.42, paper: 0.3 }) });

  // ── 3 · KARNA (CE 1.104.10–15; 3.292.6–7): the girl at the water; the basket goes out, the child shining in it ──
  R.scene({ id: 'karna', transition: { type: 'dissolve', dur: 0.08 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.slide(t / env.dur, { from: -120, to: 130, zoom: 1.12 }), T, 0.6), bx = lerp(520, 800, E.inOutSine(clamp(t / env.dur))), by = 1150 + 8 * Math.sin(T * 1.7);
      ST.shot(ctx, T, { pal: 'riverbank-pearl', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 960, sun: [820, 900, 130], sunColor: '#fff0c0' }) },
        { z: 0.2, draw: (g, p) => { ST.cloudBank(g, p, T, { y: 360, count: 5, size: 1.4 }); ST.hills(g, p, { y: 960, h: 240, seed: 22 }); } },
        { z: 0.45, draw: (g, p) => ST.treeline(g, p, { y: 980, h: 300, T, seed: 23, kind: 'mixed' }) },
        { z: 0.7, haze: false, draw: (g, p) => { ST.water(g, p, { y0: 980, y1: 2100, T, flow: 70, count: 110 }); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35; g.fillStyle = '#ffe0a0'; g.beginPath(); g.moveTo(760, 980); g.lineTo(880, 980); g.lineTo(1040, 1900); g.lineTo(560, 1900); g.fill(); g.restore(); } },
        { z: 1, haze: false, draw: (g, p) => {
          // the basket and the child: gold armour, the earrings two points of light
          KIT.glow(g, bx, by - 70, 420, '#ffd060', 0.6);
          g.fillStyle = '#fff4dc'; g.beginPath(); g.ellipse(bx, by - 78, 96, 44, 0, 0, TAU); g.fill(); g.fillStyle = '#f0b020'; g.beginPath(); g.ellipse(bx + 10, by - 84, 62, 30, 0, 0, TAU); g.fill();
          g.fillStyle = '#c8905a'; g.beginPath(); g.arc(bx - 78, by - 104, 34, 0, TAU); g.fill(); g.fillStyle = '#1a100a'; g.beginPath(); g.arc(bx - 78, by - 116, 30, Math.PI, TAU); g.fill();
          for (const dx of [-100, -58]) { KIT.glow(g, bx + dx, by - 84, 46, '#fff4c0', 0.9); g.fillStyle = '#ffe060'; g.beginPath(); g.arc(bx + dx, by - 84, 9, 0, TAU); g.fill(); }
          g.fillStyle = '#6a421c'; g.beginPath(); g.moveTo(bx - 170, by - 70); g.quadraticCurveTo(bx - 150, by + 30, bx, by + 34); g.quadraticCurveTo(bx + 150, by + 30, bx + 170, by - 70); g.closePath(); g.fill();
          g.strokeStyle = '#c8905a'; g.lineWidth = 5; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(bx - 150 + i * 42, by - 66); g.lineTo(bx - 126 + i * 36, by + 24); g.stroke(); } g.beginPath(); g.moveTo(bx - 168, by - 68); g.lineTo(bx + 168, by - 68); g.stroke();
          g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 4; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(bx, by + 40, 210 + i * 70 + 30 * Math.sin(T * 2 + i), 20 + i * 8, 0, 0, TAU); g.stroke(); }
          // the bank and the girl
          g.fillStyle = KIT.hex(p.near, '#000000', 0.2); g.beginPath(); g.moveTo(-900, 2400); g.lineTo(-900, 1270); g.quadraticCurveTo(100, 1230, 420, 1330); g.quadraticCurveTo(520, 1400, 300, 2400); g.fill();
          fig('epicKunti', g, T, 190, 1330, 0.86, 'right', ACT.pose(t, [[0, { kneel: 0.8, reach: 0.4 }], [1.0, { kneel: 1, grieve: 0.5 }, { act: 0.9 }]]), lit(p, [820, 700], 190, 0.85, 1.2), { emo: ACT.emo(t, [[0, 'plead'], [1.2, 'sorrow']]), gaze: [0.9, 0.2] }, 'ka-k'); } },
        { z: 1.5, haze: false, draw: (g) => ST.mist(g, T, { y: 1560, h: 380, alpha: 0.4 }) },
      ] });
      plaque(ctx, T, env, t, 'Karna', 540, 250, { size: 50 });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.4, paper: 0.3 }) });

  // ── 4 · RIVALS (CE 1.107): Duryodhana in the foreground, grave, the mace upright; across the hall the five; one seat ──
  R.scene({ id: 'rivals', transition: { type: 'dissolve', dur: 0.08 },
    draw(ctx, t, env) {
      const T = env.T, b1 = beat(env, 1, 1.4), b2 = beat(env, 2, 2.6), rk = E.inOutSine(clamp((t - b1 + 0.5) / 0.6)), back = E.inOutSine(clamp((t - b2 + 0.2) / 0.5));
      const cam = CAM.drift(CAM.mix(CAM.rack(rk - back, { from: 1.0, to: 0.62, zoom: 1.0, soft: 0.9 }), CAM.slide(t / env.dur, { from: -70, to: 80, zoom: 1.1 })), T, 0.6);
      ST.shot(ctx, T, { pal: 'seat-ivory', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -400, 0, 1500); gr.addColorStop(0, '#8a6a30'); gr.addColorStop(1, '#f4e4b8'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); } },
        { z: 0.3, draw: (g, p) => ST.pillars(g, p, { y: 1380, n: 5 }) },
        { z: 0.5, haze: false, draw: (g) => { KIT.glow(g, 600, 900, 520, '#fffbe0', 0.7 * (0.4 + 0.6 * back)); g.fillStyle = '#c8902a'; g.fillRect(520, 1010, 160, 250); g.fillRect(500, 900, 200, 120); g.fillStyle = '#ffe08a'; g.fillRect(490, 1000, 220, 20); g.fillStyle = '#8a2a14'; g.fillRect(530, 930, 140, 70); } },   // the one seat
        { z: 0.62, haze: false, draw: (g, p) => { g.fillStyle = '#0a1030'; g.fillRect(700, 640, 520, 720); g.fillStyle = '#c8902a'; g.fillRect(700, 630, 520, 16); g.strokeStyle = 'rgba(4,14,24,0.5)'; g.lineWidth = 6; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(720 + i * 58, 650); g.lineTo(716 + i * 58, 1360); g.stroke(); }   // a dark blue hanging behind the five: pale cloth must not stand on a pale wall
          const L = (x) => lit(p, [600, 500], x, 0.8, 1.15); const ids = ['epicYudhishthira', 'epicBhima', 'epicArjuna', 'nakula', 'sahadeva'], sc = [0.5, 0.56, 0.52, 0.5, 0.5];
          ids.forEach((id, i) => fig(id, g, T, 760 + i * 92, 1320 + (i % 2) * 14, sc[i], 'left', bare(ACT.pose(t, [[0, 'stand']], { prop: false })), L(760 + i * 92), { emo: 'calm', gaze: [0.8, 0] }, 'rv-' + i)); } },
        { z: 1, haze: false, draw: (g, p) => { g.fillStyle = '#4a3410'; g.fillRect(-900, GY + 20, 2880, 1200);
          fig('epicDuryodhana', g, T, 300, GY + 40, 0.96, 'right', ACT.pose(t, [[0, 'stand'], [b2 - 0.3, 'attend', { act: 0.5 }]]), lit(p, [900, 300], 300, 0.82, 1.2), { emo: ACT.emo(t, [[0, 'calm'], [b1, 'resolve']]), ...ACT.lead(t, [[0, [0.3, 0]], [b1 - 0.4, [0.9, 0]]]) }, 'rv-d'); } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 26, cam }) },
      ] });
      plaque(ctx, T, env, t, 'Duryodhana', 770, 250);
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.28, vignette: 0.4, paper: 0.32 }) });

  // ── 5 · LAC (CE 1.132, 1.136): the lacquered house burns; under the ground six small figures leave by a tunnel ──
  R.scene({ id: 'lac', transition: { type: 'dissolve', dur: 0.08 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.tilt(E.inOutSine(clamp((t - 0.4) / (env.dur - 0.6))), { from: -330, to: -70, zoom: 1.12 }), T, 0.8), burn = E.outCubic(clamp(t / 0.5)), walk = 90 * t;
      ST.shot(ctx, T, { pal: 'wrath-crimson', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -600, 0, 1300); gr.addColorStop(0, '#120306'); gr.addColorStop(1, '#7a1410'); g.fillStyle = gr; g.fillRect(-900, -1200, 2880, 2700); } },
        { z: 0.4, draw: (g, p) => ST.treeline(g, p, { y: 670, h: 520, T, seed: 44, kind: 'sal', color: '#2a060a' }) },
        { z: 1, haze: false, draw: (g) => { g.translate(0, -430);
          KIT.glow(g, 560, 420, 1200, '#ff6a1e', 0.55 * burn);
          g.fillStyle = '#8a1a10'; g.fillRect(190, 560, 720, 520); g.fillStyle = '#5a0e08'; g.beginPath(); g.moveTo(130, 572); g.lineTo(550, 300); g.lineTo(970, 572); g.closePath(); g.fill(); g.strokeStyle = '#ffe08a'; g.lineWidth = 6; g.strokeRect(190, 560, 720, 520);
          g.fillStyle = '#ffd070'; for (let i = 0; i < 4; i++) g.fillRect(260 + i * 165, 690, 80, 150); g.fillStyle = '#2a0806'; g.fillRect(480, 860, 140, 220);
          for (let i = 0; i < 12; i++) { const x = 170 + i * 68, h = (360 + 240 * hash(i, 3)) * burn * (0.8 + 0.2 * Math.sin(T * 7 + i)); for (const [c, q] of [['#c8341a', 1], ['#f08a24', 0.7], ['#ffe08a', 0.4]]) { g.fillStyle = c; g.beginPath(); g.moveTo(x - 56 * q, 600); g.quadraticCurveTo(x - 60 * q, 600 - h * q * 0.5, x + 18 * Math.sin(T * 5 + i), 600 - h * q); g.quadraticCurveTo(x + 60 * q, 600 - h * q * 0.5, x + 56 * q, 600); g.fill(); } }
          g.fillStyle = '#1c0a06'; g.fillRect(-900, 1080, 2880, 1500); g.fillStyle = '#060201'; g.beginPath(); g.roundRect(-300, 1250, 1700, 300, 140); g.fill();   // the earth and the tunnel
          const lx = 930 - walk; KIT.glow(g, lx, 1390, 320, '#ffd070', 0.75); g.fillStyle = '#ffe9b0'; g.beginPath(); g.ellipse(lx, 1372, 11, 22, 0, 0, TAU); g.fill();
          const cols = ['#f4ecd4', '#b8421c', '#f4f4ec', '#3aa8b8', '#3aa8b8', '#e8d8a0'], hs = [1, 1.25, 1.02, 0.94, 0.94, 0.9];
          for (let i = 0; i < 6; i++) { const x = lx + 60 + i * 84, ph = T * 7 + i * 1.3, b = 5 * Math.abs(Math.sin(ph)), h = hs[i]; g.fillStyle = cols[i]; g.beginPath(); g.ellipse(x, 1470 - 62 * h - b, 22 * h, 62 * h, 0.1, 0, TAU); g.fill(); g.fillStyle = '#b8805a'; g.beginPath(); g.arc(x - 8, 1470 - 142 * h - b, 20 * h, 0, TAU); g.fill(); g.fillStyle = '#1a100a'; g.beginPath(); g.arc(x - 6, 1470 - 152 * h - b, 19 * h, Math.PI, TAU); g.fill(); }
        } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: Math.round(80 * burn) + 4, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }) });

  // ── 6 · DEMON (CE 1.139.1–4; 1.142.28–31): the rakshasa reaches; Bhima takes him by the arms and bends him back ──
  R.scene({ id: 'demon', transition: { type: 'dissolve', dur: 0.08 },
    draw(ctx, t, env) {
      const T = env.T, b0 = beat(env, 0, 1.4), cam = CAM.drift(CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 110, zoom: 1.1, turn: 0.016 }), T, 0.9), br = E.outCubic(clamp((t - b0 + 0.15) / 0.35));
      ST.shot(ctx, T, { pal: 'thicket-shade', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1330, sun: [540, 420, 70], sunColor: '#f0ffd0' }) },
        { z: 0.35, draw: (g, p) => ST.treeline(g, p, { y: 1350, h: 1100, gap: 330, T, seed: 12, kind: 'sal' }) },
        { z: 0.8, haze: false, draw: (g) => ST.shafts(g, T, { x: 540, angle: 0.05, count: 5, alpha: 0.16, color: '#e0ffb0' }) },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
          g.save(); g.translate(740, GY + 20); g.rotate(0.2 * br); g.translate(-740, -(GY + 20));
          fig('epicHidimba', g, T, 740, GY + 20, 0.74, 'left', ACT.pose(t, [[0, 'reach'], [b0 - 0.15, 'recoil', { act: 0.2, over: 0.2 }]]), lit(p, [540, 300], 740, 0.95, 1.35, { fill: 0.5 }), { emo: ACT.emo(t, [[0, 'wrath'], [b0, 'shock']]), gaze: [0.8, 0] }, 'dm-h'); g.restore();
          fig('epicBhima', g, T, lerp(170, 330, E.outCubic(clamp(t / (b0 + 0.1)))), GY + 24, 0.8, 'right', ACT.pose(t, [[0, 'run'], [b0 - 0.5, 'reach', { act: 0.25 }], [b0 - 0.1, 'strike', { antic: 0.1, act: 0.13 }]], { phase: T * 9 }), lit(p, [540, 300], 300, 0.85, 1.2), { emo: 'wrath', gaze: [0.9, -0.2] }, 'dm-b'); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 44, cam }) },
        { z: 1.9, haze: false, soft: 0.35, draw: (g, p) => ST.trunks(g, p, { xs: [-240, 1310], w: 210 }) },
      ] });
      plaque(ctx, T, env, t, 'Hidimba', 740, 230);
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.5, paper: 0.3 }) });

  // ── 7 · ALTAR (CE 1.155.41): Draupadi rises out of the middle of the fire-altar ──
  R.scene({ id: 'altar', transition: { type: 'lamp', dur: 0.5, from: [540, 900], to: [540, 1000] },
    draw(ctx, t, env) {
      const T = env.T, up = E.outCubic(clamp(t / 1.5)), cam = CAM.drift(CAM.tilt(up, { from: 260, to: -30, zoom: 1.12 }), T, 0.7);
      EP41.hearth(ctx, T, cam, { fire: 1.25, fs: 1.9, key: 'tr-altar', figs: (g, p, fl) => {
        g.save(); g.beginPath(); g.rect(-900, -900, 2880, GY + 900 + 30); g.clip();
        fig('epicDraupadi', g, T, 540, GY + 30 + 760 * (1 - up), 0.94, 'left', ACT.pose(t, [[0, 'anjali'], [1.3, 'stand', { act: 0.7 }]], { wind: 0.8 }), { ...ST.backlight(p, { from: [540, 700], at: [540, GY], k: fl, front: 0.72, fill: 0.45 }), bounce: ['#6a7ab0', 0.5] }, { emo: ACT.emo(t, [[0, 'calm'], [1.2, 'resolve']]), gaze: [0.6, 0] }, 'al-d');
        g.restore();
        g.fillStyle = '#3a1608'; g.fillRect(250, GY + 10, 580, 70); g.fillStyle = '#c8802a'; g.fillRect(230, GY, 620, 16);   // the altar's rim
      } });
      plaque(ctx, T, env, t, 'Draupadi', 770, 250, { at: 0.9 });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }) });

  // ── 8 · BOW (CE 1.179.14–22): Arjuna looses five arrows; the mark comes down; she comes with the white garland ──
  R.scene({ id: 'bow', transition: { type: 'dissolve', dur: 0.08 },
    draw(ctx, t, env) {
      const T = env.T, b0 = beat(env, 0, 1.1), cam = CAM.drift(CAM.crane(clamp(t / env.dur), { from: 1.16, to: 1.06, y0: -220, y1: 40, ease: E.outCubic }), T, 0.7), hitT = b0, drop = clamp((t - hitT) / 0.6);
      ST.shot(ctx, T, { pal: 'crystal-sky', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1330 }) },
        { z: 0.15, draw: (g, p) => ST.cloudBank(g, p, T, { y: 360, count: 6, size: 1.5 }) },
        { z: 0.4, draw: (g, p) => { ST.pillars(g, p, { y: 1380, n: 4, color: '#e8f4ff' }); } },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
          g.fillStyle = '#5a3a1a'; g.fillRect(612, 250, 16, GY - 250); g.save(); g.translate(620, 250); g.rotate(T * 5); g.fillStyle = '#ffe08a'; for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.fillRect(-7, -86, 14, 70); } g.restore();   // the turning device on its pole
          const my = lerp(170, GY - 60, drop * drop); g.save(); g.translate(620 + 60 * drop, my); g.rotate(drop * 5); g.fillStyle = '#ffd040'; g.beginPath(); g.ellipse(0, 0, 44, 22, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(36, 0); g.lineTo(70, -22); g.lineTo(70, 22); g.fill(); g.restore();   // the golden mark
          for (let i = 0; i < 5; i++) { const u = clamp((t - (hitT - 0.42) - i * 0.05) / 0.26); if (u > 0 && u < 1) { const ax = lerp(360, 610, u), ay = lerp(760, 190, u) - 60 * Math.sin(u * Math.PI); g.strokeStyle = '#fff8e0'; g.lineWidth = 6; g.beginPath(); g.moveTo(ax - 60, ay + 110); g.lineTo(ax, ay); g.stroke(); } }
          fig('epicArjuna', g, T, 250, GY + 24, 0.9, 'right', ACT.pose(t, [[0, 'raise'], [hitT - 0.35, 'point', { act: 0.2 }]]), lit(p, [900, 200], 250, 0.85, 1.2), { emo: 'resolve', gaze: [0.8, -0.8] }, 'bw-a');
          const dk = E.outCubic(clamp((t - hitT - 0.1) / 1.0)), dx = lerp(1180, 880, dk);
          fig('epicDraupadi', g, T, dx, GY + 24, 0.86, 'left', ACT.pose(t, [[0, 'walk'], [hitT + 0.9, 'offer', { act: 0.4 }]], { phase: ACT.stride(1180 - dx, 0.86) }), lit(p, [300, 200], dx, 0.85, 1.2), { emo: 'joy', gaze: [0.8, 0] }, 'bw-d');
          if (dk > 0.5) { g.strokeStyle = '#ffffff'; g.lineWidth = 16; g.beginPath(); g.ellipse(dx - 230 * 0.86, GY - 520, 46, 66, 0.2, 0, TAU); g.stroke(); }   // the white garland
        } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'petal', count: Math.round(50 * drop) + 2, cam }) },
      ] });
      plaque(ctx, T, env, t, 'Arjuna', 300, 250);
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.38, paper: 0.32 }) });

  // ── 9 · WHEEL, THE SIGNATURE SHOT (CE 2.42.21–25): the wheel leaves Krishna's hand; where it went a light rises, comes
  //        back across the hall, bows and enters him ──
  R.scene({ id: 'wheel', transition: { type: 'ink', dur: 0.35, at: [420, 500], color: '#060a30' },
    draw(ctx, t, env) {
      const T = env.T, b0 = beat(env, 0, 0.5), b1 = beat(env, 1, 1.5), th = b1 - 0.12, cam = CAM.drift(CAM.push(clamp(t / env.dur), { from: 1.0, to: 1.14, focus: [470, 640] }), T, 0.9);
      const fly = clamp((t - th) / 0.45), back = E.inOutSine(clamp((t - th - 0.75) / 0.9));
      const KX = 360, hand = [KX + 14 * 0.94, GY + 24 - 1046 * 0.94];
      ST.shot(ctx, T, { pal: 'pure-flame', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500, stars: 0.6, T }) },
        { z: 0.3, draw: (g, p) => ST.pillars(g, p, { y: 1380, n: 5 }) },
        { z: 0.6, draw: (g) => court(g, 1300, '#070a34', 'rgba(255,208,112,0.7)', 0, 9) },
        { z: 1, haze: false, draw: (g, p) => { g.fillStyle = '#050824'; g.fillRect(-900, GY + 10, 2880, 1200);
          // the wheel: turning over his hand, then gone across the frame, a ring of fire with a tail
          if (fly <= 0) chakra(g, hand[0], hand[1] - 150, 150, T);
          else if (fly < 1) { const cx = lerp(hand[0], 1500, E.inCubic ? E.inCubic(fly) : fly * fly), cy = hand[1] - 150 + 260 * fly * fly; g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = '#ffb030'; g.lineCap = 'round'; for (let i = 0; i < 6; i++) { g.globalAlpha = 0.5 - i * 0.07; g.lineWidth = 120 - i * 16; g.beginPath(); g.moveTo(cx, cy); g.lineTo(lerp(cx, hand[0], 0.25 + i * 0.12), lerp(cy, hand[1] - 150, 0.25 + i * 0.12)); g.stroke(); } g.restore(); chakra(g, cx, cy, 150, T); }
          const flash = Math.max(0, 1 - Math.abs(t - th - 0.5) / 0.2); if (flash > 0) { g.fillStyle = `rgba(255,236,190,${0.5 * flash})`; g.fillRect(-900, -900, 2880, 3720); }
          // the light of the fallen king (2.42.22–23): it rises at the frame's edge and enters Krishna
          if (back > 0 && back < 1) { const lx = lerp(1180, KX + 10, back), ly = lerp(1150, GY - 560, back) - 240 * Math.sin(back * Math.PI); KIT.glow(g, lx, ly, 420, '#fff4d0', 0.9); KIT.glow(g, lx, ly, 150, '#ffffff', 1); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(lx, ly, 34, 0, TAU); g.fill(); }
          if (back >= 1) KIT.glow(g, KX, GY - 560, 620 + 80 * Math.sin(T * 3), '#fff0c0', 0.5 * (1 - clamp((t - th - 1.65) / 1.2) * 0.6));
          fig('epicKrishna', g, T, KX, GY + 24, 0.94, 'right', ACT.pose(t, [[0, 'raise'], [th - 0.36, 'curse', { antic: 0.2, act: 0.14, settle: 0.5, an: 0.14, over: 0.12 }], [th + 0.9, 'stand', { act: 0.8 }]], { wind: 0.7 }), { ...lit(p, [hand[0] + 200, hand[1]], KX, 0.9, 1.3), tint: ['#ffd070', 0.5] }, { emo: ACT.emo(t, [[0, 'wrath'], [th + 0.9, 'calm', { dur: 0.6 }]]), gaze: [0.9, 0] }, 'wh-k'); } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 50, cam }) },
      ] });
      plaque(ctx, T, env, t, 'Krishna', 770, 470, { size: 48, at: 0.6 });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.5, vignette: 0.5, paper: 0.28 }) });

  // ── 10 · DICE (CE 2.53–54; 2.58): Shakuni throws; the stakes cross the cloth one after another ──
  R.scene({ id: 'dice', transition: { type: 'dissolve', dur: 0.08 },
    draw(ctx, t, env) {
      const T = env.T, b = env.beats, b0 = b[0] ?? 0.7, bs = [b[1] ?? 2.3, b[2] ?? 3.2, b[3] ?? 4.1], cam = CAM.drift(CAM.pull(clamp(t / env.dur), { from: 1.18, to: 1.0, focus: [540, 900] }), T, 0.7);
      const fall = clamp((t - b0 + 0.5) / 0.5), spin = (1 - E.outCubic(clamp((t - b0 + 0.5) / 0.9))) * 12;
      ST.shot(ctx, T, { pal: 'dice-vermilion', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -300, 0, 1900); gr.addColorStop(0, '#1c0404'); gr.addColorStop(1, '#6a100a'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); } },
        { z: 0.3, draw: (g, p) => { ST.pillars(g, p, { y: 1380, n: 4 }); for (const lx of [200, 880]) KIT.glow(g, lx, 520, 320, '#ffb050', 0.45 * KIT.flicker(T, lx)); } },
        { z: 1, haze: false, draw: (g, p) => { g.fillStyle = '#2a0806'; g.fillRect(-900, GY - 10, 2880, 1200);
          g.fillStyle = '#3a1408'; g.fillRect(330, 1060, 420, 340); g.fillStyle = '#5a2410'; g.fillRect(300, 1040, 480, 40);   // the low table
          g.save(); g.translate(0, -240);
          // the dicing cloth on it, tipped toward us
          g.fillStyle = '#b02216'; g.beginPath(); g.moveTo(300, 1090); g.lineTo(780, 1090); g.lineTo(900, 1290); g.lineTo(180, 1290); g.closePath(); g.fill(); g.strokeStyle = '#ffe08a'; g.lineWidth = 8; g.stroke();
          g.lineWidth = 3; g.globalAlpha = 0.6; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(300 + i * 120, 1090); g.lineTo(180 + i * 180, 1290); g.stroke(); } g.beginPath(); g.moveTo(244, 1180); g.lineTo(836, 1180); g.stroke(); g.globalAlpha = 1;
          // the stakes: a small white city, five crowns, a red cloth: each slides to Shakuni's side on its word
          const sl = (i) => E.inOutSine(clamp((t - bs[i] + 0.12) / 0.4));
          { const x = lerp(300, 720, sl(0)); g.fillStyle = '#f4f8ff'; for (let i = 0; i < 4; i++) g.fillRect(x + i * 24, 1140 - 22 * (i % 2), 20, 60 + 22 * (i % 2)); }
          { const x = lerp(280, 700, sl(1)); g.fillStyle = '#ffd860'; for (let i = 0; i < 5; i++) { const cx = x + i * 34, cy = 1262; g.beginPath(); g.moveTo(cx - 14, cy); g.lineTo(cx - 14, cy - 20); g.lineTo(cx - 6, cy - 9); g.lineTo(cx, cy - 26); g.lineTo(cx + 6, cy - 9); g.lineTo(cx + 14, cy - 20); g.lineTo(cx + 14, cy); g.fill(); } }
          { const x = lerp(400, 800, sl(2)); g.fillStyle = '#ff5030'; g.beginPath(); g.ellipse(x, 1216, 34, 15, 0, 0, TAU); g.fill(); g.strokeStyle = '#ffd860'; g.lineWidth = 3; g.stroke(); }
          for (const [dx, dy, r0] of [[-40, 0, 0.3], [50, 30, -0.5]]) { g.save(); g.translate(lerp(760, 540, fall) + dx, lerp(760, 1180, fall * fall) + dy - 180 * Math.sin(Math.PI * fall)); g.rotate(r0 + spin); g.fillStyle = '#fff4d8'; g.beginPath(); g.roundRect(-30, -30, 60, 60, 10); g.fill(); g.fillStyle = '#2a0a0a'; for (const [px, py] of [[-13, -13], [13, 13], [0, 0]]) { g.beginPath(); g.arc(px, py, 6, 0, TAU); g.fill(); } g.restore(); }
          g.restore();
          fig('epicYudhishthira', g, T, 215, GY + 30, 0.8, 'right', ACT.pose(t, [[0, 'attend'], [bs[0], 'offer', { act: 0.5 }], [bs[2], 'grieve', { act: 0.6 }]]), lit(p, [200, 500], 215, 0.8, 1.15), { emo: ACT.emo(t, [[0, 'calm'], [bs[0], 'fear'], [bs[2], 'sorrow']]), gaze: [0.7, 0.5] }, 'dc-y');
          fig('epicShakuni', g, T, 860, GY + 30, 0.82, 'left', ACT.pose(t, [[0, 'offer'], [b0 - 0.5, 'strike', { antic: 0.14, act: 0.14 }], [b0 + 0.5, 'attend', { act: 0.5 }], [bs[2] + 0.1, 'point', { act: 0.3 }]]), lit(p, [880, 500], 860, 0.82, 1.2), { emo: ACT.emo(t, [[0, 'calm'], [b0 + 0.3, 'joy']]), gaze: [0.7, 0.5] }, 'dc-s'); } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 24, cam }) },
      ] });
      plaque(ctx, T, env, t, 'Shakuni', 720, 250, { size: 52 });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.52, paper: 0.32 }) });

  // ── 11 · HALL (CE 2.60.22–28): she is pulled across the hall, her hair loose; the seated kings ──
  R.scene({ id: 'hall', transition: { type: 'dissolve', dur: 0.08 },
    draw(ctx, t, env) {
      const T = env.T, mv = 150 * t, cam = CAM.drift(CAM.slide(t / env.dur, { from: -130, to: 130, zoom: 1.14 }), T, 0.9);
      ST.shot(ctx, T, { pal: 'cold-slate', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -300, 0, 1500); gr.addColorStop(0, '#0a0e16'); gr.addColorStop(1, '#3a4658'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); } },
        { z: 0.3, draw: (g, p) => { ST.pillars(g, p, { y: 1380, n: 6 }); KIT.glow(g, 1000, 600, 700, '#c8d8f0', 0.3); } },
        { z: 0.6, draw: (g) => court(g, 1290, '#10151e', 'rgba(200,216,240,0.6)', 0.6, 9) },
        { z: 1, haze: false, draw: (g, p) => { g.fillStyle = '#161c26'; g.fillRect(-900, GY + 10, 2880, 1200);
          const dx = 190 + mv, px = dx + 450;
          fig('kuruPrince', g, T, px, GY + 26, 0.86, 'left', ACT.pose(t, [[0, 'reach']], { phase: T * 6 }), lit(p, [1000, 500], px, 0.25, 1.1), { emo: 'wrath', gaze: [0.6, 0.2] }, 'hl-p');
          fig('epicDraupadi', g, T, dx, GY + 26, 0.9, 'right', ACT.pose(t, [[0, { recoil: 0.6, reach: 0.5 }]], { wind: 1.4 }), lit(p, [1000, 500], dx, 0.9, 1.25), { emo: ACT.emo(t, [[0, 'fear'], [1.0, 'wrath']]), gaze: [0.8, 0] }, 'hl-d'); } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 30, cam }) },
        { z: 2.0, haze: false, soft: 0.35, draw: (g) => { g.fillStyle = '#05070a'; for (const x of [-120, 1200]) g.fillRect(x - 110, -900, 220, 3720); } },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.26, vignette: 0.55, paper: 0.3 }) });

  // ── 12 · CLOTH (CE 2.61.40–41): the cloth is pulled, and there is more, and more. No cause is shown. ──
  R.scene({ id: 'cloth', transition: { type: 'dissolve', dur: 0.08 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 100, zoom: 1.08, turn: 0.012 }), T, 0.8), DX = 330, more = clamp(t / env.dur);
      ST.shot(ctx, T, { pal: 'boar-dusk', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -300, 0, 1500); gr.addColorStop(0, '#12061c'); gr.addColorStop(1, '#5a1c5a'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); } },
        { z: 0.3, draw: (g, p) => { ST.pillars(g, p, { y: 1380, n: 5 }); KIT.glow(g, 330, 600, 800, '#ffd0f0', 0.3); } },
        { z: 0.6, draw: (g) => court(g, 1290, '#1c0a24', 'rgba(255,208,240,0.55)', 1, 9) },
        { z: 1, haze: false, draw: (g, p) => { g.fillStyle = '#1a0a20'; g.fillRect(-900, GY + 10, 2880, 1200);
          // the cloth: from her waist out of the frame, taut, running; and the heap of it that grows on the floor
          const wy = GY - 430, run = T * 520;
          for (let k = 0; k < 2; k++) { g.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40, x = DX + 40 + u * 1500, y = wy + 60 * u + 34 * Math.sin(u * 9 - T * 9) * u + (k ? 62 : 0); g.lineTo(x, y); } for (let i = 40; i >= 0; i--) { const u = i / 40, x = DX + 40 + u * 1500, y = wy + 60 * u + 34 * Math.sin(u * 9 - T * 9) * u + 62 + (k ? 10 : 0); g.lineTo(x, y); } g.closePath(); g.fillStyle = k ? '#ffd060' : '#e03a20'; g.fill(); }
          g.strokeStyle = 'rgba(120,10,10,0.6)'; g.lineWidth = 4; for (let i = 0; i < 16; i++) { const x = DX + 60 + ((i * 100 + run) % 1500), u = (x - DX - 40) / 1500, y = wy + 60 * u + 34 * Math.sin(u * 9 - T * 9) * u; g.beginPath(); g.moveTo(x, y + 4); g.lineTo(x + 16, y + 58); g.stroke(); }
          for (let i = 0; i < Math.round(3 + 12 * more); i++) { const x = 760 + 70 * hash(i, 5) + (i % 3) * 60, y = GY + 30 - i * 13; g.fillStyle = i % 2 ? '#e03a20' : '#c02a18'; g.beginPath(); g.ellipse(x, y, 190 - i * 6, 26, 0.05 * Math.sin(i), 0, TAU); g.fill(); g.strokeStyle = '#ffd060'; g.lineWidth = 3; g.stroke(); }
          fig('epicDraupadi', g, T, DX, GY + 26, 0.94, 'right', ACT.pose(t, [[0, 'shield'], [1.3, 'anjali', { act: 0.9 }]], { wind: 1.0 }), lit(p, [330, 300], DX, 0.92, 1.3), { emo: ACT.emo(t, [[0, 'fear'], [1.4, 'resolve']]), gaze: [0.2, -0.6] }, 'cl-d'); } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 30, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.5, paper: 0.3 }) });

  // ── 13 · EXILE (CE 2.67.9–10): six walk away under great trees ──
  R.scene({ id: 'exile', transition: { type: 'brush', dur: 0.35, angle: 0.2, color: '#0c3a20' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.slide(t / env.dur, { from: 140, to: -120, zoom: 1.12 }), T, 0.6), d = 70 * t;
      ST.shot(ctx, T, { pal: 'exile-forest', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1330, sun: [760, 520, 70] }) },
        { z: 0.3, draw: (g, p) => ST.treeline(g, p, { y: 1340, h: 900, gap: 300, T, seed: 71, kind: 'sal' }) },
        { z: 0.6, draw: (g, p) => ST.treeline(g, p, { y: 1370, h: 1300, gap: 520, T, seed: 73, color: p.near, kind: 'banyan' }) },
        { z: 0.85, haze: false, draw: (g) => ST.shafts(g, T, { x: 760, angle: -0.4, count: 6, alpha: 0.2 }) },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
          { const gr = g.createLinearGradient(0, 640, 0, GY + 30); gr.addColorStop(0, 'rgba(244,255,216,0)'); gr.addColorStop(0.3, 'rgba(244,255,216,0.9)'); gr.addColorStop(1, 'rgba(244,255,216,0.96)'); g.fillStyle = gr; g.fillRect(-900, 640, 2880, GY - 610); }   // the sunlit clearing they cross: figures in forest colours need a pale ground
          const ids = ['epicYudhishthira', 'epicDraupadi', 'epicBhima', 'epicArjuna', 'nakula', 'sahadeva'], sc = [0.52, 0.5, 0.6, 0.54, 0.52, 0.52];
          ids.forEach((id, i) => { const x = 840 - i * 128 + d; fig(id, g, T, x, GY + 16 + (i % 2) * 10, sc[i], 'right', bare(ACT.pose(t, [[0, 'walk']], { phase: ACT.stride(d, sc[i]) + i * 1.1, stride: 0.75, prop: false })), { ...ST.light(p, { from: [760, 400], at: [x, GY], front: 0.08, k: 1.2 }), fill: 0.04 }, { emo: 'sorrow', gaze: [0.6, 0.3] }, 'ex-' + i); }); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'pollen', count: 40, cam }) },
        { z: 1.9, haze: false, soft: 0.35, draw: (g, p) => ST.trunks(g, p, { xs: [-200, 1290], w: 230 }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.48, paper: 0.3 }) });

  // ── 14 · NEEDLE, THE CLOSE-UP (CE 5.125.26): Duryodhana's face by lamp-light: a king who will not move ──
  R.scene({ id: 'needle', transition: { type: 'dissolve', dur: 0.08 },
    draw(ctx, t, env) {
      const T = env.T, b0 = beat(env, 0, 1.6), cam = CAM.drift(CAM.push(t / env.dur, { from: 1.0, to: 1.14, focus: [520, 760] }), T, 1.1);
      ST.shot(ctx, T, { pal: 'dharma-copper', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -400, 0, 1920); gr.addColorStop(0, '#0a0604'); gr.addColorStop(1, '#4a2212'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); } },
        { z: 0.3, soft: 0.5, draw: (g, p) => { ST.pillars(g, p, { y: 1700, n: 4 }); KIT.glow(g, 120, 760, 620, '#ffb070', 0.6 * KIT.flicker(T, 4)); } },
        { z: 1, haze: false, draw: (g, p) => fig('epicDuryodhana', g, T, 660, 3120, 2.45, 'left', bare(ACT.pose(t, [[0, 'stand']])), { ...lit(p, [120, 760], 660, 0.86, 1.2 * KIT.flicker(T, 4)), tint: ['#ffb070', 0.45], minLum: 0.25 },
          { emo: ACT.emo(t, [[0, 'calm'], [0.5, 'resolve', { dur: 0.5 }], [b0 - 0.2, 'wrath', { dur: 0.5 }]]), speak: 0, ...ACT.lead(t, [[0, [0.3, 0.2]], [b0 - 0.5, [0.95, 0]]], 0.4, 0.2) }, 'nd-d') },
        { z: 1.5, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 16, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.55, paper: 0.3 }) });

  // ── 15a · WAR, THE TURN (unvoiced; CE 6.1.1–3): after the silence, the conch: two armies on the plain; one chariot comes
  //         out between them ──
  R.scene({ id: 'war', transition: { type: 'smoke', dur: 0.5, dir: -Math.PI / 2, color: '#22223a' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.crane(clamp(t / env.dur), { from: 1.5, to: 1.08, y0: -420, y1: 30, ease: E.outCubic }), T, 0.8), cx = lerp(1180, 600, E.outCubic(clamp(t / env.dur)));
      ST.shot(ctx, T, { pal: 'war-iron', cam, layers: [
        { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 1180 }); KIT.glow(g, 540, 1150, 1100, '#ffd0a0', 0.5); g.fillStyle = '#ffe0b0'; g.beginPath(); g.arc(540, 1150, 90, 0, TAU); g.fill(); } },
        { z: 0.2, draw: (g, p) => ST.cloudBank(g, p, T, { y: 300, count: 7, speed: 16, color: '#34344e', alpha: 0.9, size: 1.7 }) },
        { z: 0.4, draw: (g) => { army(g, -260, 380, 1190, 18, 1, '#16163a', T, { s: 0.6, flag: '#e7b54a' }); army(g, 700, 1340, 1190, 18, -1, '#241428', T, { s: 0.6 }); } },
        { z: 0.7, draw: (g) => { army(g, -300, 330, 1270, 12, 1, '#0c0c1e', T, { s: 1.15, flag: '#e7b54a' }); army(g, 760, 1380, 1270, 12, -1, '#140a1a', T, { s: 1.15 }); } },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 60, color: '#3a3448', color2: '#0e0c18' });
          const L = lit(p, [540, 300], cx, 0.85, 1.2);
          fig('epicArjuna', g, T, cx + 60, GY - 145, 0.5, 'left', ACT.pose(t, [[0, 'stand']]), L, { emo: 'resolve' }, 'wr-a');
          fig('epicKrishna', g, T, cx - 110, GY - 145, 0.5, 'left', ACT.pose(t, [[0, 'offer']]), L, { emo: 'calm' }, 'wr-k');
          chariot(g, cx, GY + 10, 0.68, -1, T, { flag: '#f0c020', roll: -T * 5 }); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 70, cam }) },
        { z: 1.9, haze: false, soft: 0.4, draw: (g) => { for (const [x, dir] of [[-40, 1], [1120, -1]]) { g.fillStyle = '#05050c'; g.fillRect(x - 10, 300, 20, 1700); g.fillStyle = dir > 0 ? '#e7b54a' : '#c8401a'; g.beginPath(); g.moveTo(x, 320); g.lineTo(x + dir * 300, 420 + 30 * Math.sin(T * 3)); g.lineTo(x, 560); g.fill(); } } },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.3 }) });

  // ── 15 · FIELD, THE TURN (CE 6.23.21–47; 6.24.9–11): between two armies Arjuna sits and lets the bow fall; Krishna speaks ──
  R.scene({ id: 'field', transition: { type: 'dissolve', dur: 0.08 },
    draw(ctx, t, env) {
      const T = env.T, sp0 = env.speech[0], b1 = beat(env, 1, sp0 + 1.8), b2 = beat(env, 2, sp0 + 3.4), cam = CAM.drift(CAM.push(clamp(t / env.dur), { from: 1.04, to: 1.2, focus: [570, 760] }), T, 0.7);
      const sit = E.inOutSine(clamp((t - b1 + 0.5) / 0.6)), dropB = clamp((t - b1 + 0.1) / 0.5);
      ST.shot(ctx, T, { pal: 'war-iron', cam, layers: [
        { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 1180 }); KIT.glow(g, 540, 1150, 1000, '#ffd0a0', 0.45); } },
        { z: 0.2, draw: (g, p) => ST.cloudBank(g, p, T, { y: 300, count: 7, speed: 16, color: '#34344e', alpha: 0.9, size: 1.7 }) },
        { z: 0.4, draw: (g) => { army(g, -260, 330, 1200, 16, 1, '#12122a', T, { s: 0.7, flag: '#e7b54a' }); army(g, -220, 300, 1250, 12, 1, '#0c0c1e', T, { s: 0.95, flag: '#e7b54a' }); army(g, 750, 1340, 1200, 16, -1, '#1e1226', T, { s: 0.7 }); army(g, 780, 1300, 1250, 12, -1, '#140a1a', T, { s: 0.95 }); } },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 40, color: '#3a3448', color2: '#0e0c18' });
          const L = (x) => lit(p, [540, 300], x, 0.85, 1.2);
          // the bow leaves his hand (6.23.47)
          if (dropB > 0) { g.save(); g.translate(700, lerp(GY - 700, GY - 60, dropB * dropB)); g.rotate(1.2 * dropB + 0.2); g.strokeStyle = '#1a1008'; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(30, -300); g.quadraticCurveTo(-120, 0, 30, 300); g.stroke(); g.strokeStyle = '#e7b54a'; g.lineWidth = 12; g.stroke(); g.restore(); }
          fig('epicArjuna', g, T, 690, GY - 215, 0.74, 'left', (dropB > 0 ? bare : (q) => q)(ACT.pose(t, [[0, 'stand'], [b1 - 0.5, { sit: 0.9, grieve: 0.5 }, { act: 0.6 }]])), L(640), { emo: ACT.emo(t, [[0, 'fear'], [b1, 'sorrow']]), gaze: [0.5, 0.6] }, 'fd-a');
          fig('epicKrishna', g, T, 450, GY - 215, 0.74, 'right', ACT.pose(t, [[0, 'stand'], [b2 - 0.5, 'speak', { act: 0.5 }]]), L(420), { emo: ACT.emo(t, [[0, 'calm'], [b2 - 0.2, 'tender']]), speak: t > b2 ? 0.5 + 0.5 * Math.sin(T * 12) : 0, gaze: [0.8, 0.1] }, 'fd-k'); void sit;
          chariot(g, 560, GY + 10, 1.0, -1, T, { flag: '#f0c020' }); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 50, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.5, paper: 0.3 }) });

  // ── 16 · ARROWS (CE 6.114.81–85): at sunset he lies on the arrows and does not touch the ground ──
  R.scene({ id: 'arrows', transition: { type: 'dissolve', dur: 0.08 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.pull(clamp(t / env.dur), { from: 1.36, to: 1.03, focus: [540, 960] }), T, 0.6), BYY = 1010;
      ST.shot(ctx, T, { pal: 'fishers-coral', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1120, sun: [800, 1040, 150], sunColor: '#ff9a5a' }) },
        { z: 0.2, draw: (g, p) => { ST.cloudBank(g, p, T, { y: 360, count: 6, size: 1.6 }); ST.hills(g, p, { y: 1120, h: 200, seed: 91 }); } },
        { z: 0.45, draw: (g) => { army(g, -200, 300, 1160, 9, 1, '#3a1a2a', T, { s: 0.7, spear: '#ffd0b0' }); army(g, 800, 1300, 1160, 9, -1, '#3a1a2a', T, { s: 0.7, spear: '#ffd0b0' }); } },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: 1150, color: '#6a2c38', color2: '#1c0a14' });
          // the bed: shafts standing out of the ground under him, their feathers above him
          for (let i = 0; i < 34; i++) { const x = 130 + i * 25 + 10 * hash(i, 3), lean = (hash(i, 4) - 0.5) * 0.24; g.strokeStyle = i % 3 ? '#f4e0c8' : '#ffd0a0'; g.lineWidth = 5; g.beginPath(); g.moveTo(x + lean * 300, 1250); g.lineTo(x - lean * 260, BYY - 150 - 90 * hash(i, 5)); g.stroke(); g.fillStyle = '#c8402a'; g.beginPath(); const tx = x - lean * 260, ty = BYY - 150 - 90 * hash(i, 5); g.moveTo(tx, ty); g.lineTo(tx - 12, ty + 40); g.lineTo(tx + 12, ty + 40); g.fill(); }
          g.save(); g.translate(540, BYY); g.rotate(-Math.PI / 2 + 0.03); g.translate(-540, -BYY);
          fig('epicBhishma', g, 0, 540, BYY + 520 * 0.84, 0.84, 'right', { w: { stand: 0.8, anjali: 0.2 }, bare: true, still: true }, lit(p, [800, 900], 540, 0.85, 1.25, { tint: ['#ffb080', 0.5] }), { emo: 'calm', blink: 1, gaze: [0, 0] }, 'ar-b'); g.restore();
          for (let i = 0; i < 12; i++) { const x = 190 + i * 62 + 14 * hash(i, 7); g.strokeStyle = '#f4e0c8'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, BYY + 10); g.lineTo(x + 8, 1250); g.stroke(); }
        } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 36, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.38, vignette: 0.45, paper: 0.3 }) });

  // ── 17 · BOY (CE 7.33.12; 7.48.13): alone inside the wheel formation; the ring closes. The blow is not shown. ──
  R.scene({ id: 'boy', transition: { type: 'dissolve', dur: 0.08 },
    draw(ctx, t, env) {
      const T = env.T, b1 = beat(env, 1, 2.2), close = E.inOutSine(clamp(t / env.dur)), cam = CAM.drift(CAM.orbit(t / env.dur, { from: -1, to: 1, amp: 120, zoom: 1.1, turn: 0.03 }), T, 1.0);
      ST.shot(ctx, T, { pal: 'cold-slate', cam, layers: [
        { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 1230 }); KIT.glow(g, 540, 800, 760, '#c8d8f0', 0.4); } },
        { z: 0.2, draw: (g, p) => ST.cloudBank(g, p, T, { y: 320, count: 7, speed: 70, color: '#1c2430', alpha: 0.95, size: 1.7 }) },
        { z: 0.5, draw: (g) => { army(g, -200, 1280, 1250, 26, 1, '#0c1018', T, { s: 0.8, spear: '#a8b8d0' }); } },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 40, color: '#2a3240', color2: '#0a0c12' });
          // the ring: chariot wheels and levelled spears on both sides, closing on him
          for (const dir of [-1, 1]) { const off = lerp(560, 300, close); for (let i = 0; i < 6; i++) { const y = GY - 760 + i * 150, x0 = 540 + dir * (off + 520), x1 = 540 + dir * (off - 30 + 26 * Math.sin(T * 6 + i)); g.strokeStyle = '#06080c'; g.lineWidth = 16; g.beginPath(); g.moveTo(x0, y + 40); g.lineTo(x1, y); g.stroke(); g.strokeStyle = '#c8d8f0'; g.lineWidth = 5; g.stroke(); g.fillStyle = '#e8f0ff'; g.beginPath(); g.moveTo(x1 - dir * 60, y - 6); g.lineTo(x1 - dir * 4, y - 16); g.lineTo(x1 - dir * 4, y + 14); g.fill(); }
            g.save(); g.translate(540 + dir * (off + 150), GY - 150); g.rotate(dir * T * 3); g.strokeStyle = '#06080c'; g.lineWidth = 34; g.beginPath(); g.arc(0, 0, 170, 0, TAU); g.stroke(); g.strokeStyle = '#8a9ab0'; g.lineWidth = 8; g.stroke(); g.strokeStyle = '#06080c'; g.lineWidth = 16; for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(k * TAU / 8) * 160, Math.sin(k * TAU / 8) * 160); g.stroke(); } g.restore(); }
          KIT.glow(g, 540, GY - 500, 520, '#e8f4ff', 0.45);
          fig('epicAbhimanyu', g, T, 540, GY + 24, 0.98, 'left', ACT.pose(t, [[0, 'raise'], [b1 - 0.5, 'shield', { act: 0.3 }], [b1 + 0.2, 'raise', { act: 0.25 }]], { wind: 0.8 }), lit(p, [540, 200], 540, 0.9, 1.3), { emo: ACT.emo(t, [[0, 'resolve'], [b1, 'wrath']]), ...ACT.lead(t, [[0, [0.8, 0]], [b1 - 0.3, [-0.8, 0]], [b1 + 0.5, [0.8, -0.2]]]) }, 'by-a'); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 70, cam }) },
      ] });
      plaque(ctx, T, env, t, 'Abhimanyu', 540, 250);
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.55, paper: 0.3 }) });

  // ── 18 · MUD (CE 8.66.60–65; 8.67.24): the wheel in the earth, his hands on it; the red sun going down ──
  R.scene({ id: 'mud', transition: { type: 'dissolve', dur: 0.08 },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.tilt(E.inOutSine(clamp(t / (env.dur * 0.7))), { from: -200, to: 30, zoom: 1.1 }), T, 0.7), heave = Math.sin(T * 4.2) * 0.5 + 0.5, sunY = lerp(330, 620, clamp(t / env.dur));
      ST.shot(ctx, T, { pal: 'island-gold', cam, layers: [
        { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 860 }); KIT.glow(g, 560, sunY, 900, '#ff5a2a', 0.6); g.fillStyle = '#e8401c'; g.beginPath(); g.arc(560, sunY, 230, 0, TAU); g.fill(); g.fillStyle = '#ff7a3a'; g.beginPath(); g.arc(560, sunY, 200, 0, TAU); g.fill(); } },
        { z: 0.2, draw: (g, p) => ST.hills(g, p, { y: 860, h: 200, seed: 5, color: '#5a2a18' }) },
        { z: 1, haze: false, draw: (g, p) => { g.translate(0, -300); ST.ground(g, p, { y: 1170, color: '#4a2410', color2: '#140804' });
          g.save(); g.translate(700, 1420); g.rotate(-0.07); chariot(g, 0, 0, 1.08, -1, T, { body: '#6a2a14', flag: '#f0b020', roll: 0.05 * heave }); g.restore();
          g.fillStyle = '#2c1408'; g.beginPath(); g.ellipse(700, 1345, 330, 46, 0, Math.PI, 0); g.fill(); g.fillStyle = '#1c0c04';   // the earth that has taken the wheel
          g.fillRect(-900, 1330, 2880, 1200);
          fig('epicKarna', g, T, 300, 1320, 0.9, 'right', ACT.pose(t, [[0, { kneel: 0.7, reach: 0.7 }]], { wind: 0.4 }), { ...ST.backlight(p, { from: [560, sunY], at: [320, 1100], front: 0.04, fill: 0.02, warm: '#ffb060' }), bounce: ['#3a2a60', 0.15] }, { emo: ACT.emo(t, [[0, 'wrath'], [1.4, 'sorrow']]), gaze: [0.8, 0.5] }, 'md-k'); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 40, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }) });

  // ── 19 · RAID (CE 10.8.5–12): night; the sleeping camp; one man with a blade goes in, not by the gate ──
  R.scene({ id: 'raid', transition: { type: 'ink', dur: 0.4, at: [540, 900], color: '#04121a' },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.slide(t / env.dur, { from: 150, to: -150, zoom: 1.14 }), T, 0.6), x = lerp(1180, 620, E.inOutSine(clamp(t / env.dur)));
      const tent = (g, tx, ty, s, lamp) => { g.fillStyle = '#0a2630'; g.beginPath(); g.moveTo(tx - 230 * s, ty); g.lineTo(tx, ty - 330 * s); g.lineTo(tx + 230 * s, ty); g.fill(); g.strokeStyle = 'rgba(184,224,232,0.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(tx - 230 * s, ty); g.lineTo(tx, ty - 330 * s); g.lineTo(tx + 230 * s, ty); g.stroke(); g.fillStyle = '#041016'; g.beginPath(); g.moveTo(tx - 50 * s, ty); g.lineTo(tx, ty - 170 * s); g.lineTo(tx + 50 * s, ty); g.fill(); if (lamp) { KIT.glow(g, tx, ty - 60 * s, 160 * s, '#ffc878', 0.5 * KIT.flicker(T, tx)); } g.fillStyle = '#1a3a44'; g.fillRect(tx - 3, ty - 420 * s, 6, 100 * s); g.fillStyle = '#c8401a'; g.beginPath(); g.moveTo(tx, ty - 420 * s); g.lineTo(tx + 60 * s, ty - 400 * s); g.lineTo(tx, ty - 380 * s); g.fill(); };
      ST.shot(ctx, T, { pal: 'satra-teal-night', cam, layers: [
        { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 1200, stars: 0.8, T }); g.fillStyle = '#e8f4ff'; g.beginPath(); g.arc(250, 420, 60, 0, TAU); g.fill(); KIT.glow(g, 250, 420, 300, '#b8e0e8', 0.4); } },
        { z: 0.35, draw: (g) => { for (let i = 0; i < 7; i++) tent(g, -100 + i * 220, 1230, 0.55, i % 3 === 1); } },
        { z: 0.65, draw: (g) => { for (let i = 0; i < 4; i++) tent(g, 60 + i * 380, 1330, 0.9, i === 2); } },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 30 });
          tent(g, 190, GY + 40, 1.5, true);
          KIT.glow(g, x - 120, GY - 520, 300, '#ff5a2a', 0.35);
          fig('epicDevavrata', g, T, x, GY + 26, 0.86, 'left', ACT.pose(t, [[0, 'walk']], { phase: ACT.stride(1180 - x, 0.86), stride: 0.6 }), { dir: 2.6, intensity: 1.25, front: 0.05, fill: 0.02, tint: ['#b8e0e8', 0.6] }, { emo: 'wrath' }, 'rd-a');
          g.save(); g.translate(x - 150, GY - 430); g.rotate(-0.5); g.fillStyle = '#e8f4ff'; g.beginPath(); g.moveTo(0, -8); g.lineTo(-330, -4); g.lineTo(-380, 0); g.lineTo(-330, 4); g.lineTo(0, 8); g.fill(); g.restore();   // the blade catches the moon
        } },
        { z: 1.5, haze: false, draw: (g) => ST.mist(g, T, { y: 1380, h: 300, alpha: 0.35 }) },
        { z: 1.9, haze: false, soft: 0.35, draw: (g) => { g.fillStyle = '#020a0e'; g.beginPath(); g.moveTo(1500, 2000); g.lineTo(1500, 500); g.lineTo(1040, 1960); g.fill(); } },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.55, paper: 0.3 }) });

  // ── 20 · CURSE (CE 11.16.1–4; 11.25.36–42): Gandhari, blindfolded, a hand raised toward Krishna; a field of fires ──
  R.scene({ id: 'curse', transition: { type: 'dissolve', dur: 0.08 },
    draw(ctx, t, env) {
      const T = env.T, b0 = beat(env, 0, 2.2), cam = CAM.drift(CAM.push(clamp(t / env.dur), { from: 1.02, to: 1.16, focus: [480, 760] }), T, 0.8);
      ST.shot(ctx, T, { pal: 'ash-grey', cam, layers: [
        { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 1000 }); KIT.glow(g, 540, 1000, 900, '#ff7a3a', 0.3); } },
        { z: 0.2, draw: (g, p) => ST.cloudBank(g, p, T, { y: 380, count: 8, speed: 10, color: '#5a5650', alpha: 0.9, size: 1.8 }) },
        { z: 0.6, haze: false, draw: (g) => { g.fillStyle = '#2a2622'; g.fillRect(-900, 1000, 2880, 1500); fires(g, T, 1000, 26); } },
        { z: 1, haze: false, draw: (g, p) => {
          fig('epicKrishna', g, T, 850, GY + 26, 0.88, 'left', ACT.pose(t, [[0, 'stand'], [b0, 'anjali', { act: 0.7 }]]), lit(p, [540, 300], 850, 0.85, 1.15), { emo: ACT.emo(t, [[0, 'calm'], [b0 - 0.2, 'sorrow']]), gaze: [0.8, 0.3], look: 0.12 * clamp((t - b0) / 0.5) }, 'cu-k');
          fig('epicGandhari', g, T, 270, GY + 26, 0.9, 'right', ACT.pose(t, [[0, 'grieve'], [b0 - 0.65, 'curse', { antic: 0.22, act: 0.16, settle: 0.5 }]], { wind: 0.5 }), lit(p, [540, 300], 270, 0.9, 1.25), { emo: ACT.emo(t, [[0, 'sorrow'], [b0 - 0.5, 'wrath']]), gaze: [0.8, 0] }, 'cu-g'); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 40, cam }) },
        { z: 1.6, haze: false, draw: (g) => ST.mist(g, T, { y: 1500, h: 400, alpha: 0.35 }) },
      ] });
      plaque(ctx, T, env, t, 'Gandhari', 340, 250);
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.32 }) });

  // ── 21 · DOG (CE 17.1.23–31; 17.3.7): snow, the mountain; the old king stops and turns to the dog at his heel ──
  const dog = (g, x, y, s, T, wag) => { g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = '#7a5a3a'; g.beginPath(); g.ellipse(0, -118, 124, 54, -0.05, 0, TAU); g.fill();   // the body
    for (const [lx, ph] of [[-86, 0], [-54, 1.6], [62, 0.8], [92, 2.4]]) { const a = 0.12 * Math.sin(T * 3 + ph); g.save(); g.translate(lx, -96); g.rotate(a); g.fillRect(-13, 0, 26, 98); g.restore(); }
    g.beginPath(); g.ellipse(132, -176, 56, 44, -0.5, 0, TAU); g.fill(); g.beginPath(); g.moveTo(160, -190); g.lineTo(226, -166); g.lineTo(222, -142); g.lineTo(150, -150); g.fill();   // head and muzzle, lifted to him
    g.beginPath(); g.moveTo(104, -208); g.lineTo(92, -262); g.lineTo(134, -220); g.fill();   // the ear
    g.save(); g.translate(-118, -140); g.rotate(-0.9 + 0.5 * Math.sin(T * 9) * wag); g.fillRect(-84, -11, 90, 22); g.restore();   // the tail
    g.fillStyle = '#e8d8c0'; g.beginPath(); g.ellipse(20, -98, 84, 26, 0, 0, Math.PI); g.fill(); g.fillStyle = '#fff8e8'; g.beginPath(); g.arc(150, -184, 7, 0, TAU); g.fill(); g.fillStyle = '#0a0604'; g.beginPath(); g.arc(152, -184, 4, 0, TAU); g.fill(); g.beginPath(); g.arc(224, -156, 8, 0, TAU); g.fill();
    g.restore(); };
  R.scene({ id: 'dog', transition: { type: 'brush', dur: 0.4, angle: -0.2, color: '#ece8fb' },
    draw(ctx, t, env) {
      const T = env.T, b0 = beat(env, 0, 1.4), b1 = beat(env, 1, 2.6), cam = CAM.drift(CAM.crane(clamp(t / env.dur), { from: 1.2, to: 1.06, y0: 40, y1: -60, ease: E.outCubic }), T, 0.6);
      const go = E.outCubic(clamp(t / (b0 + 0.2))), kx = lerp(480, 700, go), turned = t > b0 + 0.25, stop = clamp((t - b0) / 0.4);
      ST.shot(ctx, T, { pal: 'mist-lavender', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1250, sun: [300, 380, 70] }) },
        { z: 0.15, draw: (g, p) => { ST.hills(g, p, { y: 1260, h: 1500, seed: 41, peaks: 0.9, snow: true, color: '#6a5eac' }); } },
        { z: 0.4, draw: (g, p) => { ST.hills(g, p, { y: 1290, h: 620, seed: 43, peaks: 0.5, snow: true, color: '#8a7ec8' }); ST.mist(g, T, { y: 1150, h: 300, alpha: 0.5 }); } },
        { z: 1, haze: false, draw: (g, p) => {
          g.translate(0, -170); g.fillStyle = '#f4f2fb'; g.beginPath(); g.moveTo(-900, 2600); g.lineTo(-900, GY + 60); g.quadraticCurveTo(300, GY + 40, 1980, GY - 160); g.lineTo(1980, 2600); g.fill(); g.fillStyle = 'rgba(138,126,192,0.35)'; g.beginPath(); g.ellipse(kx - 60, GY + 44, 420, 26, -0.05, 0, TAU); g.fill();
          dog(g, lerp(60, 300, go), GY + 44, 0.95, T, stop);
          fig('epicPilgrim', g, T, kx, GY + 30 - (kx - 380) * 0.06, 0.84, turned ? 'left' : 'right', ACT.pose(t, [[0, 'walk'], [b0, 'stand', { act: 0.35 }], [b1 - 0.5, 'offer', { act: 0.6 }]], { phase: ACT.stride(kx - 380, 0.84), stride: 0.7 * (1 - stop) }), lit(p, [300, 300], kx, 0.9, 1.25), { emo: ACT.emo(t, [[0, 'weary'], [b0 + 0.3, 'tender']]), gaze: [0.7, 0.6] }, 'dg-y'); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'snow', count: 90, cam }) },
      ] });
      plaque(ctx, T, env, t, 'Yudhishthira', 270, 250, { size: 48, at: 1.5 });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.38, paper: 0.32 }) });

  // ── 22–23 · THE WORD: dark; itihasa in gold; then it opens into its three parts, each with its gloss; then the meaning ──
  const wordShot = (ctx, T, env, u, sp, mean, zoom) => {
    const S = env.strings, cam = CAM.drift(CAM.push(clamp(zoom), { from: 1.0, to: 1.1, focus: [540, 800] }), T, 0.8);
    ST.shot(ctx, T, { pal: 'arrival-umber-gold', cam, layers: [
      { z: 0, haze: false, draw: (g) => { const gr = g.createRadialGradient(540, 800, 80, 540, 800, 1300); gr.addColorStop(0, '#4a2c0a'); gr.addColorStop(0.5, '#1c1006'); gr.addColorStop(1, '#060302'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); } },
      { z: 0.5, haze: false, draw: (g) => { KIT.glow(g, 540, 800, 760, '#ffb040', 0.2 + 0.16 * u); } },
      { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 46, cam }) },
    ] });
    const parts = S.wordParts.map((w) => w.toUpperCase()), gl = S.wordGloss, size = 150, y = 820;
    ctx.save(); ctx.font = R.font(size, 'display', 700); ctx.letterSpacing = '10px'; const ws = parts.map((w) => ctx.measureText(w).width); ctx.restore();
    const tot = ws[0] + ws[1] + ws[2], gap = 86 * E.inOutSine(clamp(sp)), x0 = 540 - (tot + 2 * gap) / 2;
    let x = x0;
    if (sp <= 0.03) { KIT.goldText(ctx, S.wordWhole.toUpperCase(), 540, y, { size, spacing: 10, weight: 700, alpha: clamp(u * 1.6), reveal: clamp(u * 1.3), glow: 0.45, sheen: clamp(u) * 1.5 - 0.25, key: 'tr-whole' }); fin(ctx, T); return; }
    parts.forEach((w, i) => { const cx = x + ws[i] / 2, lift = sp > 0 ? 1 + 0.08 * Math.sin(Math.PI * clamp((sp * 3 - i))) : 1;
      ctx.save(); ctx.translate(cx, y - 50); ctx.scale(lift, lift); ctx.translate(-cx, -(y - 50));
      KIT.goldText(ctx, w, cx, y, { size, spacing: 10, weight: 700, alpha: 1, glow: 0.45, sheen: clamp(u) * 1.5 - 0.25, key: 'tr-w' + i }); ctx.restore();
      const ga = clamp((sp * 3 - i) / 0.6);
      if (ga > 0) { ctx.save(); ctx.globalAlpha = ga; ctx.fillStyle = '#e7b54a'; ctx.fillRect(cx - ws[i] / 2, y + 34, ws[i] * E.outCubic(ga), 4); ctx.font = R.font(54, 'caption', 600, 'italic'); ctx.textAlign = 'center'; ctx.fillStyle = '#fff0d0'; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(8); ctx.fillText(gl[i], cx, y + 104 + 10 * (1 - ga)); ctx.restore(); }
      x += ws[i] + gap; });
    if (mean > 0) { const m = E.outCubic(clamp(mean)); KIT.goldText(ctx, S.wordMeaning.toUpperCase(), 540, 1130 + 16 * (1 - m), { size: 74, spacing: 8, weight: 700, alpha: m, glow: 0.35, sheen: clamp(mean * 0.7) * 1.5 - 0.25, key: 'tr-mean' }); }
    fin(ctx, T);
  };
  R.scene({ id: 'word', transition: { type: 'dissolve', dur: 0.08 }, draw(ctx, t, env) { wordShot(ctx, env.T, env, clamp((t - env.speech[0] + 0.5) / 1.2), 0, 0, t / (env.dur * 2.2)); }, post: () => ({ bloom: 0.5, vignette: 0.55, paper: 0.3 }) });
  R.scene({ id: 'means', draw(ctx, t, env) { const b = env.beats, b0 = b[0] ?? 0.2, b2 = b[2] ?? 1.8, b3 = b[3] ?? 2.6; wordShot(ctx, env.T, env, 1, clamp((t - b0 + 0.15) / Math.max(0.9, b2 - b0 + 0.5)), (t - b3 + 0.15) / 0.6, 0.45 + t / (env.dur * 2.2)); }, post: () => ({ bloom: 0.5, vignette: 0.55, paper: 0.3 }) });

  // ── 24 · PROMISE: the Naimisha fire at the blue hour; the storyteller comes to it ──
  const firelit = (x, fl) => ({ ...EP41.lit(x, fl, 0.85), fill: 0.45, intensity: 1.5 });
  R.scene({ id: 'promise', transition: { type: 'lamp', dur: 0.6, from: [540, 800], to: [540, 1200] },
    draw(ctx, t, env) {
      const T = env.T, cam = CAM.drift(CAM.crane(clamp(t / env.dur), { from: 1.3, to: 1.06, y0: -380, y1: 0, ease: E.inOutSine }), T, 0.6);
      const arrive = E.outCubic(clamp(t / (env.dur * 0.75))), sx = lerp(1240, 850, arrive), moving = 1 - clamp((t - env.dur * 0.7) / 0.4);
      EP41.naimisha(ctx, T, cam, { figs: (g, p, fl) => {
        CH.elder.draw(g, { x: 190, y: GY + 20, scale: 0.9, facing: 'right', pose: { name: 'sit', base: 'sit' }, light: firelit(190, fl), t: T, key: 'pr-el' });
        CH.sauti.draw(g, { x: sx, y: GY + 20, scale: 0.94, facing: 'left', pose: { name: 'walk', phase: ACT.stride(1240 - sx, 0.94), stride: 0.9 * moving }, light: firelit(sx, fl), t: T, key: 'pr-sa' });
      } });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.38, vignette: 0.5, paper: 0.3 }) });

  // ── 25 · FOLLOW: first light; Vyasa, lit, a hand open to us, by the great fire; the source line (fixed); episode 1 ──
  R.scene({ id: 'follow', transition: { type: 'dissolve', dur: 0.08 },
    draw(ctx, t, env) {
      const T = env.T, S = env.strings, b1 = beat(env, 1, 1.0), cam = CAM.drift(CAM.push(clamp(t / (env.dur + 0.5)), { from: 1.02, to: 1.18, focus: [560, 1000], ease: (x) => x }), T, 1.3), fl = KIT.flicker(T, 5);
      ST.shot(ctx, T, { pal: 'naimisha-firstlight', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1330, sun: [240, 1180, 90] }) },
        { z: 0.25, draw: (g, p) => { ST.cloudBank(g, p, T, { y: 400, count: 5, size: 1.5 }); ST.treeline(g, p, { y: 1340, h: 760, T, seed: 21, kind: 'sal' }); } },
        { z: 0.6, draw: (g, p) => ST.treeline(g, p, { y: 1370, h: 1050, gap: 520, T, seed: 23, color: p.near, kind: 'banyan' }) },
        { z: 0.9, haze: false, draw: (g) => { g.fillStyle = '#0a0604'; g.beginPath(); g.moveTo(690, -900); g.bezierCurveTo(710, 600, 680, 1200, 640, GY + 40); g.lineTo(980, GY + 40); g.bezierCurveTo(930, 1200, 900, 600, 930, -900); g.fill(); g.fillStyle = 'rgba(255,200,140,0.12)'; g.fillRect(700, -900, 26, GY + 900); } },   // the great trunk behind him: a pale, lit figure needs a dark ground
        { z: 0.8, haze: false, draw: (g) => { KIT.glow(g, 300, GY - 300, 700, '#ff8a2a', 0.4 * fl); CH.hearthfire.draw(g, { x: 300, y: GY - 10, scale: 0.78, t: T, k: 1.1, key: 'fo-f' }); } },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
          g.save(); g.globalCompositeOperation = 'lighter'; g.translate(300, GY + 40); g.scale(1, 0.2); KIT.glow(g, 0, 0, 700, '#ff8a2a', 0.4 * fl); g.restore();
          fig('vyasaSage', g, T, 800, GY + 30, 0.8, 'left', ACT.pose(t, [[0, 'stand'], [b1 - 0.4, 'offer', { act: 0.6 }]], { prop: false }), { dir: Math.atan2(200, -500), intensity: 1.6 * fl, front: 1, fill: 0.75, tint: ['#fff0d0', 0.35], minLum: 0.4 }, { emo: ACT.emo(t, [[0, 'calm'], [b1, 'tender']]), gaze: [0.7, 0.1] }, 'fo-v'); } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 34, box: [0, 300, 640, 1000], cam }) },
        { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => { ST.trunks(g, p, { xs: [-230, 1300], w: 190 }); ST.grass(g, p, { y: 1950, h: 280, T, count: 40 }); } },
      ] });
      TY.source(ctx, T, clamp((t - 0.5) / 0.5), S);
      const k = clamp((t - b1 + 0.1) / 0.6);
      if (k > 0) KIT.series.episodeTitle(ctx, T, k, { ...S, episodeLabel: S.nextEpisodeLabel, episodeTitle: S.nextTitle }, { y: 470, key: 'tr-ep1' });
      const kf = clamp(t / 0.35);
      ctx.save(); ctx.globalAlpha = 0.62 * kf; ctx.fillStyle = '#120a08'; ctx.beginPath(); ctx.roundRect(60, 600, 600, 150, 22); ctx.fill(); ctx.restore();
      KIT.goldText(ctx, (S.followWord || '').toUpperCase(), 360, 700, { size: 104, spacing: 10, weight: 700, alpha: kf, glow: 0.4, sheen: clamp(t / 1.2) * 1.5 - 0.25, key: 'tr-follow' });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.45, paper: 0.3 }) });
})();
