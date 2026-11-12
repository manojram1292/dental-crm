/*
 * Episodes 51–60 · shared places, beasts and short-hands (not a scene). Loads after ep41/_common, ep46/_common, ep49/_common.
 *   EP51.heaven(ctx, T, cam, pal, o)   a court among clouds (Brahma's, Indra's, Vaikuntha): o = { sun, back(g, p), figs(g, p),
 *                                      front(g, p), floor (y of the cloud floor), stars }
 *   EP51.land(ctx, T, cam, pal, o)     open country: sky, hills, a tree line, ground; o = { hz, sun, trees, far, figs, near,
 *                                      dust, clouds, water: [y0, y1], grass }
 *   EP51.wood(ctx, T, cam, pal, o)     inside a forest: three planes of trees, shafts, near trunks; o = { figs, far, near, hut,
 *                                      shafts, dust, mist, huts: [[x, s]] }
 *   EP51.court(ctx, T, cam, pal, o)    a king's hall: pillars, a lit wall, the throne on its dais, courtiers; o = { tx (throne
 *                                      x, null = none), crowd, figs, back, front, floor (a polished floor: reflect(g)) }
 *   EP51.void(ctx, T, cam, pal, o)     a bare painted ground (a panel, a vision): o = { back, figs, glow: [x, y, r, color, a] }
 *   EP51.throne(g, x, y, s)            a throne (the seat's top at y − 330 s)
 *   EP51.beast(g, kind, x, y, s, o)    'lion' | 'tiger' | 'elephant' | 'boar' | 'deer' | 'cow' | 'horse': flat painted
 *                                      beasts, opaque; o = { dir (1 = facing right), T, lie, eye, rope: [x, y] (tied) }
 *   EP51.bird(g, kind, x, y, s, o)     'heron' | 'parrot' | 'goose' | 'peacock' | 'small'; o = { fly (0..1 wing), dir, T }
 *   EP51.fig(g, T, id, x, y, s, o)     an acting figure: o = { f (facing), pose, L (light), ex (expression), key }
 *   EP51.hook(ctx, T, t, env, o)       the hook card and the title lockup: o = { y, size, ty }
 *   EP51.lit(...) / EP51.say(env, t)   a soft front light; the mouth while the line speaks
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CH = KIT.characters, EP41 = window.EP41;
  const { TAU, clamp, lerp, hash, E } = R;
  const GY = EP41.GY, HZ = EP41.HZ;
  const EP51 = (window.EP51 = {});
  EP51.say = (env, t) => EP41.mouth(env, t);
  EP51.lit = (p, x, y, o = {}) => ST.light(p, { from: o.from || [200, 250], at: [x, y], front: o.front ?? 0.3, fill: o.fill, k: o.k });
  EP51.bright = (tint = '#fff4d8', k = 1.3) => ({ dir: -Math.PI / 2 - 0.3, intensity: k, front: 0.9, fill: 0.6, tint: [tint, 0.5], minLum: 0.4 });
  EP51.fig = (g, T, id, x, y, s, o = {}) => CH[id].draw(g, { x, y, scale: s, facing: o.f || 'left', pose: o.pose || 'stand', light: o.L || EP51.bright(), expression: o.ex || { emo: 'calm' }, t: T, key: o.key || id });
  EP51.hook = (ctx, T, t, env, o = {}) => {
    const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
    KIT.series.hookCard(ctx, T, clamp(t / 0.2), line.text, { y: o.y ?? 1490, size: o.size ?? 76, gold: line.hookGold, out });
    const tk = clamp((t - sp - 0.15) / 0.6);
    if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: o.ty ?? (o.y ?? 1490) + 10, key: 'ep' + env.script.episode + '-title' });
  };

  const clouds = (g, T, y, n, col, a, sp = 8, seed = 1, size = 1) => { g.save(); g.fillStyle = col; g.globalAlpha = a;
    for (let i = 0; i < n; i++) { const x = ((hash(i, seed) * 2600 + T * sp * (0.6 + hash(i, seed + 1))) % 2600) - 760, yy = y + 90 * (hash(i, seed + 2) - 0.5), w = (260 + 240 * hash(i, seed + 3)) * size; g.beginPath(); g.ellipse(x, yy, w, w * 0.26, 0, 0, TAU); g.ellipse(x - w * 0.45, yy + 14, w * 0.6, w * 0.2, 0, 0, TAU); g.ellipse(x + w * 0.5, yy + 10, w * 0.55, w * 0.18, 0, 0, TAU); g.fill(); }
    g.restore(); };
  EP51.clouds = clouds;

  EP51.heaven = (ctx, T, cam, pal, o = {}) => ST.shot(ctx, T, { pal, cam, layers: [
    { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 1700, sun: o.sun }); if (o.stars) for (let i = 0; i < 70; i++) { g.globalAlpha = 0.3 + 0.6 * hash(i, 71) * (0.6 + 0.4 * Math.sin(T * 1.5 + i)); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(-300 + 1700 * hash(i, 72), -200 + 1500 * hash(i, 73), 2 + 3 * hash(i, 74), 0, TAU); g.fill(); } g.globalAlpha = 1; } },
    { z: 0.15, draw: (g, p) => clouds(g, T, 520, 6, p.far, 0.85, 5, 11, 1.3) },
    { z: 0.35, draw: (g, p) => { clouds(g, T, 900, 6, p.mid, 0.8, 8, 21, 1.2); if (o.back) o.back(g, p); } },
    { z: 0.7, haze: false, draw: (g, p) => { if (o.mid) o.mid(g, p); clouds(g, T, (o.floor ?? GY) - 120, 7, KIT.hex(p.haze, '#ffffff', 0.3), 0.9, 10, 31, 1.3); } },
    { z: 1, haze: false, draw: (g, p) => { const fy = o.floor ?? GY; const gr = g.createLinearGradient(0, fy - 60, 0, fy + 700); gr.addColorStop(0, KIT.hex(p.haze, '#ffffff', 0.45)); gr.addColorStop(1, p.mid); g.fillStyle = gr; g.beginPath(); g.moveTo(-900, fy + 900); g.lineTo(-900, fy - 10); for (let x = -900; x <= 1980; x += 180) g.quadraticCurveTo(x + 90, fy - 70 - 30 * hash(x, 3), x + 180, fy - 10); g.lineTo(1980, fy + 900); g.closePath(); g.fill(); if (o.figs) o.figs(g, p); } },
    { z: 1.5, haze: false, draw: (g, p) => { clouds(g, T, 1760, 5, KIT.hex(p.haze, '#ffffff', 0.5), 0.95, 16, 41, 1.6); if (o.front) o.front(g, p); } },
  ] });

  EP51.land = (ctx, T, cam, pal, o = {}) => { const hz = o.hz ?? HZ - 120; return ST.shot(ctx, T, { pal, cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz, sun: o.sun }) },
    { z: 0.15, draw: (g, p) => { if (o.clouds !== false) ST.cloudBank(g, p, T, { y: 400, count: 4 }); ST.hills(g, p, { y: hz, h: o.hillH ?? 360, seed: o.seed ?? 54, peaks: o.peaks }); if (o.sky) o.sky(g, p); } },
    { z: 0.45, draw: (g, p) => { if (o.trees !== false) ST.treeline(g, p, { y: hz + 20, h: o.treeH ?? 460, T, seed: (o.seed ?? 54) + 1, kind: o.trees || 'mixed' }); if (o.water) ST.water(g, p, { y0: o.water[0], y1: o.water[1], T, flow: 44, count: 70 }); if (o.far) o.far(g, p); } },
    { z: 1, haze: false, draw: (g, p) => { if (o.ground !== false) ST.ground(g, p, { y: o.gy ?? hz + 10 }); if (o.figs) o.figs(g, p); } },
    { z: 1.3, haze: false, draw: (g) => { if (o.dust !== false) ST.particles(g, T, { kind: o.dust || 'dust', count: o.dustN ?? 30, cam }); } },
    { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => { if (o.grass !== false) ST.grass(g, p, { y: 1960, h: o.grassH ?? 320, T, count: 40 }); if (o.near) o.near(g, p); } },
  ] }); };

  EP51.wood = (ctx, T, cam, pal, o = {}) => ST.shot(ctx, T, { pal, cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: HZ, sun: o.sun }) },
    { z: 0.2, draw: (g, p) => ST.treeline(g, p, { y: HZ, h: 700, T, seed: (o.seed ?? 70), kind: o.kind || 'sal' }) },
    { z: 0.45, draw: (g, p) => { ST.treeline(g, p, { y: HZ + 20, h: 900, gap: 420, T, seed: (o.seed ?? 70) + 2, kind: 'mixed' }); if (o.far) o.far(g, p); } },
    { z: 0.7, draw: (g, p) => { ST.treeline(g, p, { y: HZ + 40, h: 1080, gap: 560, T, seed: (o.seed ?? 70) + 4, color: p.near, kind: 'banyan' }); for (const [x, s, lit] of o.huts || []) ST.hut(g, p, { x, y: HZ + 50, s, lit: lit ?? 0.5 }); if (o.mid) o.mid(g, p); } },
    { z: 0.85, haze: false, draw: (g) => { if (o.shafts !== false) ST.shafts(g, T, { x: o.shaftX ?? 760, angle: o.shaftA ?? -0.4, count: 5, alpha: o.shafts ?? 0.14 }); if (o.mist) ST.mist(g, T, { y: GY - 420, h: 520, alpha: o.mist }); } },
    { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 }); if (o.figs) o.figs(g, p); } },
    { z: 1.25, haze: false, draw: (g) => { if (o.dust !== false) ST.particles(g, T, { kind: o.dust || 'pollen', count: o.dustN ?? 34, cam }); } },
    { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => { if (o.trunks !== false) ST.trunks(g, p, { xs: o.trunks || [-180, 1260], w: 200 }); ST.grass(g, p, { y: 1950, h: 300, T }); if (o.near) o.near(g, p); } },
  ] });

  EP51.throne = (g, x, y, s = 1, col = '#5a1a14', gold = '#e7b54a') => { g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = '#2a0e0a'; g.fillRect(-330, -70, 660, 80); g.fillRect(-270, -140, 540, 76);   // the dais, two steps
    g.fillStyle = col; g.beginPath(); g.roundRect(-170, -900, 340, 780, [150, 150, 10, 10]); g.fill(); g.fillStyle = gold; g.beginPath(); g.roundRect(-170, -900, 340, 780, [150, 150, 10, 10]); g.roundRect(-140, -860, 280, 720, [124, 124, 6, 6]); g.fill('evenodd');
    g.fillStyle = KIT.hex(col, '#000000', 0.3); g.fillRect(-200, -370, 400, 240); g.fillStyle = gold; g.fillRect(-210, -390, 420, 26); g.fillRect(-230, -470, 46, 340); g.fillRect(184, -470, 46, 340); g.beginPath(); g.arc(0, -930, 44, 0, TAU); g.fill(); g.restore(); };

  EP51.court = (ctx, T, cam, pal, o = {}) => ST.shot(ctx, T, { pal, cam, layers: [
    { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 1500 }); g.fillStyle = KIT.hex(p.sky[0], '#000000', 0.4); g.fillRect(-900, -1200, 2880, 760); } },
    { z: 0.3, draw: (g, p) => { ST.pillars(g, p, { y: 1380, n: o.n ?? 5 }); if (o.back) o.back(g, p); } },
    { z: 0.55, haze: false, draw: (g, p) => { KIT.glow(g, o.gx ?? 540, 700, 1100, p.key, o.glow ?? 0.22); for (let i = 0; i < 4; i++) { const x = 130 + i * 270; g.fillStyle = KIT.hex(p.accent, p.mid, 0.5); g.globalAlpha = 0.5; g.fillRect(x - 6, 120, 12, 520); g.beginPath(); g.moveTo(x - 60, 640); g.lineTo(x + 60, 640); g.lineTo(x, 760); g.closePath(); g.fill(); } g.globalAlpha = 1; } },   // hanging banners
    { z: 0.75, draw: (g, p) => { const c = o.crowd ?? 1; if (c > 0) for (let r = 0; r < 2; r++) for (let i = 0; i < 10; i++) { const x = -120 + i * 140 + r * 60, y = 1270 + r * 60; if ((o.tx != null && Math.abs(x - o.tx) < 260) || hash(i, r + 15) > c) continue; g.fillStyle = KIT.hex(p.near, '#000000', 0.3); g.beginPath(); g.ellipse(x, y - 110, 44, 120, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(x, y - 260, 30, 0, TAU); g.fill(); g.fillStyle = KIT.hex(p.accent, p.key, 0.5); g.globalAlpha = 0.7; g.beginPath(); g.arc(x, y - 292, 16, Math.PI, TAU); g.fill(); g.globalAlpha = 1; }
      if (o.tx != null) EP51.throne(g, o.tx, o.ty ?? 1300, o.ts ?? 0.8); if (o.mid) o.mid(g, p); } },
    { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 }); if (o.floor) { g.save(); g.globalAlpha = 0.35; g.translate(0, 2 * (GY - 20)); g.scale(1, -1); o.floor(g, p); g.restore(); g.fillStyle = KIT.hex(p.near, '#000000', 0.2); g.globalAlpha = 0.45; g.fillRect(-900, GY - 20, 2880, 900); g.globalAlpha = 1; } if (o.figs) o.figs(g, p); } },
    { z: 1.9, haze: false, soft: 0.35, draw: (g, p) => { if (o.front) return o.front(g, p); g.fillStyle = KIT.hex(p.near, '#000000', 0.6); for (const x of [-230, 1310]) g.fillRect(x - 110, -900, 220, 3200); } },
  ] });

  EP51.void = (ctx, T, cam, pal, o = {}) => ST.shot(ctx, T, { pal, cam, layers: [
    { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: o.hz ?? 1500 }); if (o.sky) o.sky(g, p); } },
    { z: 0.4, draw: (g, p) => { if (o.back) o.back(g, p); } },
    { z: 0.7, haze: false, draw: (g) => { if (o.glow) KIT.glow(g, o.glow[0], o.glow[1], o.glow[2], o.glow[3], o.glow[4]); } },
    { z: 1, haze: false, draw: (g, p) => { if (o.ground !== false) ST.ground(g, p, { y: o.gy ?? GY - 20 }); if (o.figs) o.figs(g, p); } },
    { z: 1.4, haze: false, draw: (g) => { if (o.dust) ST.particles(g, T, { kind: o.dust, count: o.dustN ?? 30, cam }); } },
    { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => { if (o.front) o.front(g, p); } },
  ] });

  // ── beasts: flat painted, opaque, one dark tone and one lit tone; (x, y) = the ground under the middle; native facing LEFT ──
  const BE = { lion: ['#5a3410', '#d89a3a', '#8a4a14'], tiger: ['#6a3008', '#f08a20', '#1a0c06'], elephant: ['#2a2a34', '#7a7a8a', '#f0e8d0'], boar: ['#1a1418', '#5a4a50', '#f0e8d0'], deer: ['#5a3a1a', '#c8905a', '#fff4dc'], cow: ['#8a8478', '#f4f0e4', '#3a2a20'], horse: ['#3a1e0e', '#a8683a', '#1a0c06'] };
  EP51.beast = (g, kind, x, y, s = 1, o = {}) => {
    const [dk, lt, ac] = o.cols || BE[kind], T = o.T || 0, dir = o.dir || -1, lie = o.lie || 0, big = kind === 'elephant', L = big ? 520 : kind === 'deer' ? 300 : 380, Hh = big ? 420 : kind === 'boar' ? 190 : 230, leg = (big ? 300 : kind === 'boar' ? 120 : kind === 'deer' ? 260 : 200) * (1 - 0.8 * lie), ph = (o.phase ?? 0), run = o.run || 0;
    g.save(); g.translate(x, y); g.scale(-dir * s, s);
    if (o.rope) { g.strokeStyle = '#c8a878'; g.lineWidth = 9; g.beginPath(); g.moveTo(-L * 0.42, -leg - Hh * 0.55); g.quadraticCurveTo((-L * 0.42 + (o.rope[0] - x) / (-dir * s)) / 2, -leg + 40, (o.rope[0] - x) / (-dir * s), (o.rope[1] - y) / s); g.stroke(); }
    const by = -leg - Hh / 2;
    // legs (far pair darker)
    for (const [lx, far, k] of [[-L * 0.3, 1, 0], [L * 0.32, 1, 1], [-L * 0.36, 0, 2], [L * 0.26, 0, 3]]) { const sw = run ? Math.sin(ph + k * 1.6) * 0.5 * run : 0; g.save(); g.translate(lx, by + Hh * 0.2); g.rotate(sw); g.fillStyle = far ? KIT.hex(dk, '#000000', 0.25) : dk; const w = big ? 86 : kind === 'deer' ? 22 : 44; if (lie) g.fillRect(-w / 2, 0, w * 2.2, w * 0.9); else { g.beginPath(); g.roundRect(-w / 2, 0, w, leg + Hh * 0.3, w * 0.3); g.fill(); } g.restore(); }
    // tail
    g.strokeStyle = dk; g.lineWidth = big ? 16 : 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(L * 0.46, by - Hh * 0.2); g.quadraticCurveTo(L * 0.72, by - Hh * 0.5 + 20 * Math.sin(T * 2 + x), L * 0.66, by + Hh * (kind === 'deer' ? -0.2 : 0.5)); g.stroke();
    if (kind === 'lion') { g.fillStyle = ac; g.beginPath(); g.arc(L * 0.66, by + Hh * 0.5, 22, 0, TAU); g.fill(); }
    // body
    g.fillStyle = dk; g.beginPath(); g.ellipse(0, by, L / 2, Hh / 2, 0, 0, TAU); g.fill();
    g.fillStyle = lt; g.beginPath(); g.ellipse(-L * 0.02, by - Hh * 0.1, L * 0.46, Hh * 0.36, 0, Math.PI * 1.02, TAU * 0.99); g.ellipse(-L * 0.02, by - Hh * 0.02, L * 0.46, Hh * 0.2, 0, 0, Math.PI, true); g.fill();
    if (kind === 'tiger') { g.strokeStyle = ac; g.lineWidth = 12; for (let i = 0; i < 7; i++) { const sx = -L * 0.34 + i * L * 0.11; g.beginPath(); g.moveTo(sx, by - Hh * 0.46); g.quadraticCurveTo(sx + 16, by - Hh * 0.1, sx - 4, by + Hh * 0.2); g.stroke(); } }
    if (kind === 'boar') { g.strokeStyle = '#0c080a'; g.lineWidth = 8; for (let i = 0; i < 9; i++) { const sx = -L * 0.36 + i * L * 0.085; g.beginPath(); g.moveTo(sx, by - Hh * 0.44); g.lineTo(sx + 14, by - Hh * 0.72); g.stroke(); } }
    if (kind === 'cow') { g.fillStyle = lt; g.beginPath(); g.ellipse(-L * 0.24, by - Hh * 0.5, 60, 44, 0, 0, TAU); g.fill(); }
    // neck and head
    const hx = -L * (big ? 0.5 : kind === 'deer' ? 0.5 : 0.56), hy = by - Hh * (kind === 'deer' ? 0.95 : kind === 'boar' ? 0.02 : big ? 0.1 : 0.3) + (o.head || 0);
    if (kind === 'deer' || kind === 'horse' || kind === 'cow') { g.fillStyle = dk; g.beginPath(); g.moveTo(-L * 0.3, by - Hh * 0.4); g.lineTo(hx + 20, hy - 10); g.lineTo(hx + 70, hy + 50); g.lineTo(-L * 0.18, by + Hh * 0.1); g.closePath(); g.fill(); }
    if (kind === 'lion') { g.fillStyle = ac; g.beginPath(); KIT.scallopPath(g, hx + 40, hy, 150, 160, 11, 0, 0.14); g.fill(); }
    if (big) { g.fillStyle = dk; g.beginPath(); g.ellipse(hx + 10, hy, 170, 180, 0, 0, TAU); g.fill(); g.fillStyle = KIT.hex(dk, lt, 0.45); g.beginPath(); g.ellipse(hx + 120, hy - 10, 110, 150, 0.2, 0, TAU); g.fill();   // head, ear
      g.strokeStyle = dk; g.lineWidth = 62; g.beginPath(); g.moveTo(hx - 90, hy + 40); g.quadraticCurveTo(hx - 190, hy + 250, hx - 110 + 30 * Math.sin(T * 1.4 + x), hy + 400); g.stroke(); g.strokeStyle = ac; g.lineWidth = 20; g.beginPath(); g.moveTo(hx - 70, hy + 110); g.quadraticCurveTo(hx - 170, hy + 180, hx - 230, hy + 120); g.stroke();
      g.fillStyle = '#fff4d0'; g.beginPath(); g.arc(hx - 40, hy - 30, 12, 0, TAU); g.fill(); g.fillStyle = '#0a0606'; g.beginPath(); g.arc(hx - 42, hy - 30, 6, 0, TAU); g.fill(); g.restore(); return; }
    const hr = kind === 'deer' ? 44 : kind === 'boar' ? 80 : kind === 'cow' ? 64 : 84;
    g.fillStyle = kind === 'lion' || kind === 'tiger' ? lt : dk; g.beginPath(); g.ellipse(hx, hy, hr * 1.1, hr * 0.9, -0.15, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(hx - hr * 0.9, hy + hr * 0.2, hr * 0.6, hr * 0.46, -0.1, 0, TAU); g.fill();   // the muzzle
    g.fillStyle = dk; for (const ex of [hr * 0.2, hr * 0.7]) { g.beginPath(); g.moveTo(hx + ex - 20, hy - hr * 0.7); g.lineTo(hx + ex, hy - hr * (kind === 'deer' || kind === 'horse' ? 1.6 : 1.25)); g.lineTo(hx + ex + 22, hy - hr * 0.6); g.closePath(); g.fill(); }   // ears
    if (kind === 'deer') { g.strokeStyle = ac; g.lineWidth = 9; for (const ex of [0, 26]) { g.beginPath(); g.moveTo(hx + ex, hy - 50); g.quadraticCurveTo(hx + ex + 30, hy - 150, hx + ex - 10, hy - 210); g.moveTo(hx + ex + 18, hy - 130); g.lineTo(hx + ex + 60, hy - 170); g.stroke(); } }
    if (kind === 'cow') { g.strokeStyle = ac; g.lineWidth = 12; g.beginPath(); g.moveTo(hx + 10, hy - 50); g.quadraticCurveTo(hx - 20, hy - 120, hx + 30, hy - 150); g.stroke(); }
    if (kind === 'boar') { g.fillStyle = ac; g.beginPath(); g.moveTo(hx - hr * 1.2, hy + hr * 0.3); g.lineTo(hx - hr * 1.5, hy - hr * 0.3); g.lineTo(hx - hr * 1.0, hy + hr * 0.1); g.closePath(); g.fill(); }
    if (kind === 'tiger') { g.strokeStyle = ac; g.lineWidth = 9; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(hx - 10 + i * 30, hy - hr * 0.8); g.lineTo(hx + i * 30, hy - hr * 0.3); g.stroke(); } }
    g.fillStyle = o.eye || '#fff0b0'; g.beginPath(); g.arc(hx - hr * 0.3, hy - hr * 0.15, hr * 0.14, 0, TAU); g.fill(); g.fillStyle = '#0a0606'; g.beginPath(); g.arc(hx - hr * 0.33, hy - hr * 0.15, hr * 0.07, 0, TAU); g.fill();
    g.fillStyle = '#1a0c08'; g.beginPath(); g.arc(hx - hr * 1.4, hy + hr * 0.12, hr * 0.12, 0, TAU); g.fill();
    if (o.yawn) { g.fillStyle = '#7a1a14'; g.beginPath(); g.ellipse(hx - hr * 1.0, hy + hr * 0.5, hr * 0.4, hr * 0.3 * o.yawn, 0, 0, TAU); g.fill(); }
    g.restore();
  };
  const BD = { heron: ['#f4f4f0', '#e8b040', 1.5, 150], parrot: ['#3aa84a', '#e03a2a', 0.8, 30], goose: ['#f8f4e8', '#e88a20', 1.2, 50], peacock: ['#1a5ab8', '#3ad0a0', 1.3, 70], small: ['#c8803a', '#3a2a20', 0.55, 24], crow: ['#1a1a24', '#3a3a48', 0.8, 30] };
  EP51.bird = (g, kind, x, y, s = 1, o = {}) => { const [c, c2, k, leg] = BD[kind], dir = o.dir || -1, fly = o.fly || 0, T = o.T || 0; s *= k;
    g.save(); g.translate(x, y); g.scale(-dir * s, s);
    if (!fly) { g.strokeStyle = c2; g.lineWidth = 7; g.beginPath(); g.moveTo(-8, -leg); g.lineTo(-10, 0); g.moveTo(12, -leg); g.lineTo(14, 0); g.stroke(); }
    const by = fly ? 0 : -leg - 34;
    if (kind === 'peacock') { g.fillStyle = c2; g.beginPath(); g.moveTo(30, by); g.quadraticCurveTo(220, by - 60, 300, by + 90); g.quadraticCurveTo(180, by + 60, 30, by + 20); g.closePath(); g.fill(); g.fillStyle = '#1a3a8a'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(120 + i * 38, by + 16 + i * 14, 10, 0, TAU); g.fill(); } }
    g.fillStyle = c; g.beginPath(); g.ellipse(0, by, 62, 38, -0.15, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(-36, by - 10); g.quadraticCurveTo(-70, by - (kind === 'heron' || kind === 'goose' || kind === 'peacock' ? 110 : 50), -62, by - (kind === 'heron' || kind === 'goose' || kind === 'peacock' ? 128 : 58)); g.lineTo(-40, by - (kind === 'heron' || kind === 'goose' || kind === 'peacock' ? 120 : 52)); g.quadraticCurveTo(-40, by - 50, -10, by - 20); g.closePath(); g.fill();
    const hy = by - (kind === 'heron' || kind === 'goose' || kind === 'peacock' ? 130 : 60); g.beginPath(); g.arc(-56, hy, 22, 0, TAU); g.fill();
    g.fillStyle = c2; g.beginPath(); g.moveTo(-74, hy - 8); g.lineTo(-74 - (kind === 'heron' ? 70 : 34), hy + 4); g.lineTo(-74, hy + 10); g.closePath(); g.fill();
    g.fillStyle = '#0a0606'; g.beginPath(); g.arc(-62, hy - 4, 4, 0, TAU); g.fill();
    g.fillStyle = KIT.hex(c, '#000000', 0.18); const wa = fly ? Math.sin(T * 9 + x) * 0.9 * fly : 0; g.save(); g.translate(0, by - 8); g.rotate(-wa); g.beginPath(); g.moveTo(-30, 0); g.quadraticCurveTo(20, fly ? -110 : -34, 84, fly ? -70 : 6); g.quadraticCurveTo(30, 16, -30, 10); g.closePath(); g.fill(); g.restore();
    g.restore(); };
  // a small seated or standing crowd figure (a hermit, a god in a rank): one dark tone and a rim
  EP51.mini = (g, x, y, s, col, rim, seated = true, halo = null) => { g.fillStyle = col; if (halo) { g.save(); g.globalAlpha = 0.5; g.fillStyle = halo; g.beginPath(); g.arc(x, y - (seated ? 150 : 300) * s, 46 * s, 0, TAU); g.fill(); g.restore(); g.fillStyle = col; }
    g.beginPath(); if (seated) g.ellipse(x, y - 56 * s, 56 * s, 62 * s, 0, 0, TAU); else g.ellipse(x, y - 130 * s, 42 * s, 135 * s, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(x, y - (seated ? 150 : 300) * s, 30 * s, 0, TAU); g.fill();
    if (rim) { g.strokeStyle = rim; g.lineWidth = 3; g.beginPath(); g.arc(x, y - (seated ? 150 : 300) * s, 30 * s, -2.4, -0.6); g.stroke(); } };
  EP51.GY = GY; EP51.HZ = HZ;
})();
