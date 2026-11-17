/* THE RED PAPER-CUT SAMPLE · "Mahabharatam: As Vyasa Told It" (script/papercut.en.json; pipeline number 95, never a numbered episode).
 * The birth of Gandhari's hundred sons (CE 1.107; verse check script/papercut-CHECK.md) in the look of Indian sanjhi paper-cutting,
 * built on src/scenes/papercut/paper.js. ONE SCENE PER LINE. Characters step at 12 fps (PC.stepT); camera, light and flying pieces
 * move on every frame. Captions are a paper banner drawn here (R.overlay is replaced for this film only).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, PC = window.PC;
  const { TAU, clamp, lerp, E, hash } = R;
  const W = R.W, H = R.H, C = PC.C, G = PC.G;
  const SMp = (p) => PC.smooth(p, 4);
  const ss = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
  const after = (t, a) => t >= a;
  const pop = (st, a) => (st < a ? 0 : st < a + 1 / 12 ? 1.15 : 1);   // a piece arrives: one 12 fps step at 1.15×, then 1
  const lineOf = (id) => R.lines.find((l) => l.id === id);
  const POST = { bloom: 0.08, vignette: 0.22, grain: 0, paper: 0 };   // no film grain: the paper is the texture

  function shot(id, draw, o = {}) {
    R.scene({
      id,
      init(env) { const l = env.script.lines.find((q) => q.id === id); if (l && (l.tr === 'peel' || l.tr === 'turn')) this.transition = { type: l.tr, dur: 0.5, back: o.back }; },
      draw(ctx, t, env) {
        PC.beginFrame();
        const st = PC.stepT(env.T) - env.line.start;   // the 12 fps clock, local
        const b = env.beats;
        draw(ctx, t, env, st, b);
      },
      post: () => ({ ...POST, ...(o.post || {}) }),
    });
  }
  const bg = (ctx, fam, cam) => { ctx.save(); if (cam) PC.applyCam(ctx, cam, 0.15); PC.ground(ctx, fam); ctx.restore(); R.resetCtx(ctx); };
  const tag = (ctx, x, y, name, sub, a = 1, col = C.cream) => {   // a printed paper tag (name and identifier), small
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    ctx.font = R.font(40, 'display', 700); const w1 = ctx.measureText(name).width; ctx.font = R.font(34, 'caption', 600); const w2 = ctx.measureText(sub).width;
    const w = Math.max(w1, w2) + 56;
    PC.layer(ctx, (g) => { PC.piece(g, PC.dense([[x - w / 2, y - 52], [x + w / 2, y - 52], [x + w / 2, y + 56], [x - w / 2, y + 56]], 20), col, { seed: 77, wob: 1.4 }); }, { shadow: 0.6, alpha: a });
    ctx.fillStyle = '#4a0a0e'; ctx.textAlign = 'center'; ctx.font = R.font(40, 'display', 700); ctx.fillText(name, x, y - 6);
    ctx.fillStyle = '#3a2418'; ctx.font = R.font(34, 'caption', 600); ctx.fillText(sub, x, y + 38);
    ctx.restore(); R.resetCtx(ctx);
  };
  const tagA = (t, a, b) => ss(a, a + 0.15, t) * (1 - ss(b - 0.2, b, t));

  // ── recurring pieces ──
  function border(g, col, seed = 31) {   // a sanjhi creeper border: four strips, sawtooth inner edge, leaf and kadamba-ball holes
    const m = 40, d = 34;
    const strips = [
      [[0, 0], [W, 0], [W, m], [0, m]], [[0, H - m], [W, H - m], [W, H], [0, H]],
      [[0, 0], [m, 0], [m, H], [0, H]], [[W - m, 0], [W, 0], [W, H], [W - m, H]],
    ];
    strips.forEach((s, i) => {
      const holes = [];
      const vert = i >= 2, L = vert ? H : W;
      for (let k = 30; k < L - 30; k += 70) { const cx = vert ? (i === 2 ? m / 2 : W - m / 2) : k, cy = vert ? k : (i === 0 ? m / 2 : H - m / 2); holes.push(k / 70 % 2 < 1 ? PC.crescent(cx, cy, 11, (k * 0.1) % TAU, 0.5, 8) : PC.xf([[0, -1], [0.5, 0], [0, 1], [-0.5, 0]], cx, cy, 13, vert ? 0 : Math.PI / 2)); }
      PC.piece(g, PC.dense(s, 20), col, { seed: seed + i, wob: 1, holes });
    });
    // sawtooth inner edges
    const tooth = (a, b) => PC.piece(g, [...PC.saw([a, b], 22, 16), b, a], col, { seed: seed + 9, wob: 0.6, plain: true });
    tooth([m, m], [W - m, m]); tooth([W - m, H - m], [m, H - m]); tooth([m, H - m], [m, m]); tooth([W - m, m], [W - m, H - m]);
    void d;
  }
  function archPanel(g, col, cx, yb, w, h, o = {}) {   // a temple panel with a cusped arch opening (the opening reaches its lower edge)
    const x0 = cx - w / 2, x1 = cx + w / 2, top = yb - h;
    const panel = PC.dense([[0, o.top ?? -10], [W, o.top ?? -10], [W, yb], [x1, yb], [x1, top + h * 0.45], ...cusps(cx, top, w), [x0, top + h * 0.45], [x0, yb], [0, yb]], 18);
    const holes = [];
    for (let k = 0; k < 9; k++) holes.push(PC.xf([[0, -1], [0.5, 0], [0, 1], [-0.5, 0]], 60 + k * 120, (o.top ?? 0) + 70, 18));
    PC.piece(g, panel, col, { seed: o.seed || 51, inset: 6, slit: 2.4, holes: o.noHoles ? [] : holes });
  }
  function cusps(cx, top, w) {   // a multi-foil arch from the right spring to the left (points, top-down)
    const pts = [], r = w / 2, n = 7;
    for (let i = 0; i <= n; i++) {
      const a = -Math.PI * (i / n), x = cx + Math.cos(a) * r, y = top + w * 0.5 + Math.sin(a) * w * 0.55;
      pts.push([x, y]);
      if (i < n) { const am = -Math.PI * ((i + 0.5) / n); pts.push([cx + Math.cos(am) * r * 0.86, top + w * 0.5 + Math.sin(am) * w * 0.55 * 0.86]); }
    }
    return pts.reverse().reverse();
  }
  function jali(g, col, x0, y0, x1, y1, cell = 46, seed = 61) {   // a lattice panel: diamond and rosette holes on a grid, a border left whole
    const holes = [];
    for (let y = y0 + cell; y < y1 - cell * 0.6; y += cell) for (let x = x0 + cell; x < x1 - cell * 0.6; x += cell) holes.push(((x + y) / cell) % 2 < 1 ? PC.xf([[0, -1], [0.55, 0], [0, 1], [-0.55, 0]], x, y, cell * 0.36) : PC.ell(x, y, cell * 0.18, cell * 0.18, 8));
    PC.piece(g, PC.dense([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 20), col, { seed, inset: 5, slit: 2, holes });
  }
  function lotus(g, cx, cy, r, col, open = 1, seed = 71, rot = 0) {   // an 8-petal lotus, petals as separate pieces with a slit vein
    for (let k = 0; k < 8; k++) {
      const a = rot + (k * TAU) / 8, rr = r * lerp(0.55, 1, open);
      const pet = PC.xf([[0, 0], [0.32, -0.35], [0.26, -0.8], [0, -1], [-0.26, -0.8], [-0.32, -0.35]], cx, cy, rr, a + Math.PI / 2);
      PC.piece(g, PC.dense(pet, 12), col, { seed: seed + k, inset: 4, slit: 2, holes: [PC.slit(cx + Math.cos(a) * rr * 0.25, cy + Math.sin(a) * rr * 0.25, cx + Math.cos(a) * rr * 0.8, cy + Math.sin(a) * rr * 0.8, rr * 0.03)] });
    }
  }
  function mass(g, cx, cy, r, col, seed = 81, sq = 1) {   // the lump: an irregular hard mass, cut with rows of crescent rivets (hammered iron)
    const pts = []; for (let i = 0; i < 44; i++) { const a = (i / 44) * TAU, k = 1 + 0.09 * Math.sin(a * 3 + 1) + 0.06 * Math.sin(a * 5 + 2); pts.push([cx + Math.cos(a) * r * k * (1 / sq), cy + Math.sin(a) * r * k * sq]); }
    const holes = [];
    for (let row = -2; row <= 2; row++) for (let c = -2; c <= 2; c++) { if (Math.abs(row) + Math.abs(c) > 3) continue; holes.push(PC.crescent(cx + c * r * 0.3 + row * 8, cy + row * r * 0.3 * sq, r * 0.07, -Math.PI / 2 + row * 0.2, 0.5, 8)); }
    PC.piece(g, pts, col, { seed, inset: 8, slit: 3, holes });
  }
  function moonPts(cx, cy, r, ph) {   // a crescent moon piece, phase 0..1 (thin → full)
    const p = []; for (let i = 0; i <= 24; i++) { const a = -Math.PI / 2 + (Math.PI * i) / 24; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    const k = lerp(-0.85, 0.95, ph); for (let i = 24; i >= 0; i--) { const a = -Math.PI / 2 + (Math.PI * i) / 24; p.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r]); }
    return p;
  }
  function infant(g, x, y, s, col, seed = 91) {   // a swaddled child, upright piece
    PC.piece(g, PC.dense(PC.xf([[0, -1], [0.42, -0.62], [0.36, 0.5], [0, 0.72], [-0.36, 0.5], [-0.42, -0.62]], x, y, 60 * s), 10), col, { seed, inset: 4, slit: 2, holes: [PC.slit(x - 18 * s, y - 10 * s, x + 18 * s, y + 20 * s, 2), PC.slit(x - 18 * s, y + 14 * s, x + 18 * s, y + 38 * s, 2)] });
    PC.piece(g, PC.dense(PC.ell(x + 4 * s, y - 70 * s, 26 * s, 24 * s, 16), 8), col, { seed: seed + 1, inset: 3, slit: 1.6, holes: [PC.crescent(x + 14 * s, y - 72 * s, 6 * s, Math.PI / 2, 0.55, 8)] });
  }
  function scraps(g, t, n, col, seed, area = [0, 0, W, H], fall = 120) {   // flying offcuts: move on every frame
    for (let i = 0; i < n; i++) {
      const u = hash(i, seed), v = hash(i, seed + 1), sp = 0.4 + hash(i, seed + 2);
      const x = area[0] + u * (area[2] - area[0]) + Math.sin(t * sp * 2 + i) * 30, y = area[1] + ((v * (area[3] - area[1]) + t * fall * sp) % (area[3] - area[1]));
      const a = t * sp * 2 + i, sz = 10 + 16 * hash(i, seed + 3);
      PC.piece(g, PC.xf([[0, -1], [0.9, 0.6], [-0.7, 0.8]], x, y, sz, a), col, { seed: seed + i, wob: 0.6 });
    }
  }
  function peacock(g, x, y, s, f, col, seed = 101) {   // a profile peacock (feet at x, y): tail sweeping behind with crescent eyes, crest of three
    g.save(); g.translate(x, y); g.scale(s * f, s);
    const eyes = []; for (let k = 0; k < 6; k++) { const u = 0.15 + k * 0.14, tx = lerp(-60, -400, u), ty = lerp(-60, 30, u * u); eyes.push(PC.crescent(tx, ty, 15, Math.PI, 0.55, 8)); eyes.push(PC.ell(tx - 4, ty, 5, 5, 6)); }
    PC.piece(g, PC.saw(SMp([[-30, -80], [-220, -70], [-400, -10], [-440, 40], [-380, 60], [-220, 20], [-40, -30]]), 22, 8), col, { seed, inset: 5, slit: 2.2, holes: eyes });
    PC.piece(g, SMp([[-50, -60], [10, -110], [62, -120], [82, -160], [84, -230], [100, -262], [124, -262], [140, -250], [116, -242], [106, -220], [104, -160], [96, -100], [56, -40], [-20, -26]]), col, { seed: seed + 1, inset: 5, slit: 2.2, holes: [PC.crescent(108, -248, 5, Math.PI / 2, 0.55, 6), PC.crescent(10, -76, 30, Math.PI / 2, 0.5, 10), PC.crescent(30, -70, 18, Math.PI / 2, 0.5, 8)] });
    for (let k = 0; k < 3; k++) { PC.piece(g, PC.slit(100 + k * 6, -262, 92 + k * 12, -310, 3), col, { seed: seed + 5 + k, wob: 0.3, plain: true }); PC.piece(g, PC.ell(92 + k * 12, -314, 7, 7, 8), col, { seed: seed + 8 + k, wob: 0.3 }); }
    for (const lx of [10, 40]) PC.piece(g, PC.dense([[lx, -40], [lx + 8, -40], [lx + 10, 0], [lx + 28, 0], [lx + 28, 6], [lx - 2, 6]], 8), col, { seed: seed + 12 + lx, wob: 0.4 });
    g.restore();
  }
  function jackal(g, howl, seed) {   // a profile jackal (feet at 0, facing +x): pointed ears, long snout, bushy tail; the head lifts to howl
    PC.piece(g, PC.saw(SMp([[-118, -150], [-180, -120], [-236, -50], [-214, -42], [-166, -96], [-112, -122]]), 16, 7), C.red, { seed: seed + 1, inset: 3, slit: 1.8 });
    PC.piece(g, SMp([[-130, -150], [-40, -168], [60, -164], [112, -178], [128, -150], [116, -104], [100, -80], [106, 0], [86, 0], [78, -66], [20, -88], [-60, -88], [-80, -58], [-68, 0], [-88, 0], [-98, -66], [-124, -100]]), C.red, { seed, inset: 5, slit: 2.2, holes: [PC.slit(-60, -130, 60, -134, 3), PC.crescent(-20, -120, 14, Math.PI / 2, 0.5, 8)] });
    g.save(); g.translate(110, -170); g.rotate(howl ? -0.7 : -0.1);
    const mouth = howl ? [[118, -14], [96, -4], [118, 4]] : [[118, -8], [112, -6], [118, -4]];
    PC.piece(g, SMp([[-20, 10], [-6, -40], [6, -96], [26, -56], [40, -98], [56, -50], [96, -40], [140, -28], [142, -14], ...mouth, [130, 10], [60, 22], [0, 40]]), C.red, { seed: seed + 2, inset: 4, slit: 2, holes: [PC.crescent(60, -30, 7, Math.PI / 2, 0.55, 8)] });
    g.restore();
  }
  let boySprite = null;
  function boy_() {   // one of the hundred: a small standing boy, drawn once and stamped (the same cut, as a folded sheet gives)
    if (boySprite && boySprite.s === R.scale) return boySprite;
    const c = document.createElement('canvas'), w = 90, h = 190; c.width = Math.ceil(w * R.scale); c.height = Math.ceil(h * R.scale);
    const g = c.getContext('2d'); g.setTransform(R.scale, 0, 0, R.scale, 0, 0);
    PC.person(g, null, { id: 'boy', kind: 'man', x: 42, y: 186, s: 0.17, facing: 1, hair: 'cap', face: 'still', earring: false, col: C.red, colFar: C.far, inset: 9, slit: 4, pose: { sh: 0.5, el: 0.5, shF: 0.3, elF: 0.4 }, seed: 700 });
    boySprite = { c, s: R.scale, w, h }; return boySprite;
  }

  // ═══════════════════════════════ THE CAPTION BANNER (replaces the kit's captions for this film) ═══════════════════════════════
  const CAP = { size: 54, lineH: 64, maxW: 840, y: 1400 };
  const segCache = new Map();
  function segments(ctx, L) {
    const key = L.id + '|' + R.scale; if (segCache.has(key)) return segCache.get(key);
    ctx.save(); ctx.font = R.font(CAP.size, 'caption', 700);
    const sp = ctx.measureText(' ').width;
    const rowsOf = (ws) => { const rows = [[]]; let x = 0; for (const w of ws) { const ww = ctx.measureText(w.w).width; if (x > 0 && x + ww > CAP.maxW) { rows.push([]); x = 0; } rows[rows.length - 1].push(w.w); x += ww + sp; } return rows.map((r) => ({ text: r.join(' '), w: ctx.measureText(r.join(' ')).width })); };
    const balance = (ws) => { const r = rowsOf(ws); if (r.length !== 2) return r; let best = null;   // two rows of near equal width (no widow word)
      for (let k = 1; k < ws.length; k++) { const a = ctx.measureText(ws.slice(0, k).map((w) => w.w).join(' ')).width, b = ctx.measureText(ws.slice(k).map((w) => w.w).join(' ')).width; if (a > CAP.maxW || b > CAP.maxW) continue; const m = Math.max(a, b); if (!best || m < best.m) best = { m, k, a, b }; }
      return best ? [{ text: ws.slice(0, best.k).map((w) => w.w).join(' '), w: best.a }, { text: ws.slice(best.k).map((w) => w.w).join(' '), w: best.b }] : r; };
    let segs = [{ i0: 0, i1: L.words.length }];
    if (rowsOf(L.words).length > 2) {   // split at the sentence (or colon) nearest the middle
      let best = -1, bd = 1e9;
      L.words.forEach((w, i) => { if (i + 1 < L.words.length && /[.:;!?]["”]?$/.test(w.w)) { const d = Math.abs(i + 1 - L.words.length / 2); if (d < bd) { bd = d; best = i + 1; } } });
      if (best > 0) segs = [{ i0: 0, i1: best }, { i0: best, i1: L.words.length }];
    }
    segs.forEach((s) => { s.rows = balance(L.words.slice(s.i0, s.i1)); });
    ctx.restore(); segCache.set(key, segs); return segs;
  }
  R.overlay = (ctx, T) => {
    const i = R.lineIndexAt(T), L = R.lines[i];
    if (!L || L.caption === false || !L.words || !L.words.length || L.voice === false) return;
    const segs = segments(ctx, L);
    let k = 0; for (let j = 1; j < segs.length; j++) if (T >= L.words[segs[j].i0].t0 - 0.12) k = j;
    const sg = segs[k], a = k === 0 ? Math.max(L.start + 1 / 30, L.speechStart - 0.15) : L.words[sg.i0].t0 - 0.12, b = k + 1 < segs.length ? L.words[segs[k + 1].i0].t0 - 0.12 : L.end - 0.07;
    if (T < a || T >= b) return;
    // dropped in on two 12 fps steps (like a strip being pasted); lifted off on two steps before the cut
    const fi = Math.floor((T - a) * 12), fo = Math.floor((b - T) * 12);
    let dy = fi === 0 ? -34 : fi === 1 ? -9 : 0, rot = fi === 0 ? -0.022 : fi === 1 ? 0.007 : 0, al = 1;
    if (k + 1 === segs.length && fo <= 1) { dy = fo === 1 ? -10 : -26; al = fo === 1 ? 0.75 : 0.4; rot = fo === 1 ? 0.005 : -0.01; }
    const n = sg.rows.length, wmax = Math.max(...sg.rows.map((r) => r.w)), cx = KIT.CX;
    const yb = CAP.y, top = yb - (n - 1) * CAP.lineH - CAP.size + 4;
    const x0 = cx - wmax / 2 - 34, x1 = cx + wmax / 2 + 34, y0 = top - 26, y1 = yb + 26;
    if (R.probe) {
      R.probe.cap = { line: L.id, alpha: al, rows: n };
      if (R.faces && R.faces.some((f) => f.y + f.r * 0.8 > y0 && f.y - f.r * 0.8 < y1 && f.x + f.r * 0.8 > x0 - 46 && f.x - f.r * 0.8 < x1 + 46)) R.probe.type.captionFace = (R.probe.type.captionFace || 0) + 1;
    }
    ctx.save();
    PC.layer(ctx, (g) => { g.translate(cx, (y0 + y1) / 2 + dy); g.rotate(rot); g.translate(-cx, -(y0 + y1) / 2); PC.piece(g, PC.bannerPts(x0, y0, x1, y1), C.banner, { seed: 5 + k, wob: 1.1, inset: 5, slit: 2 }); }, { shadow: 0.8, alpha: al, rimCol: '#ffd8c0' });
    ctx.translate(cx, (y0 + y1) / 2 + dy); ctx.rotate(rot); ctx.translate(-cx, -(y0 + y1) / 2);
    ctx.globalAlpha = al; ctx.fillStyle = '#f6e8c8'; ctx.textAlign = 'center'; ctx.font = R.font(CAP.size, 'caption', 700);
    sg.rows.forEach((r, j) => ctx.fillText(r.text, cx, top + CAP.size - 4 + j * CAP.lineH));
    ctx.restore(); R.resetCtx(ctx);
  };

  // ═══════════════════════════════ 1 · HOOK ═══════════════════════════════
  shot('hook', (ctx, t, env, st, b) => {
    const cam = PC.cam('push', t / env.dur, { from: 1.0, to: 1.16, focus: [540, 900], ease: (u) => u });
    bg(ctx, 'indigo', cam);
    PC.layer(ctx, (g) => { lotus(g, 540, 900, 470, G.indigo.far, 0.55 + 0.45 * ss(0, 1.5, t), 71, t * 0.14); }, { cam, z: 0.4, shadow: 0.5, rimCol: '#9aa8e0' });
    const beat = (st % 0.75) < 1 / 12 ? 1.07 : 1;   // the heartbeat, on 12 fps steps
    PC.layer(ctx, (g, figs) => { g.translate(540, 900); g.scale(beat, beat); g.translate(-540, -900); mass(g, 540, 900, 190, C.red); }, { cam, z: 1 });
    PC.layer(ctx, (g) => scraps(g, t, 18, C.red, 3, [80, 0, 1000, 1900], 260), { cam, z: 1.3, shadow: 0.6 });
    // the hook as cut-out letters: popping in on 12 fps steps from frame 0
    const L1 = ['ONE LUMP', 'OF FLESH.'], L2 = ['A HUNDRED', 'SONS.'];
    const nOn = (from, per) => Math.max(0, Math.floor((st - from) * 12 * per) + 2);
    PC.layer(ctx, (g) => {
      g.font = R.font(124, 'display', 800); g.textAlign = 'center';
      let c1 = nOn(0, 3);
      L1.forEach((s, r) => { const vis = s.slice(0, Math.max(0, c1)); c1 -= s.length; g.fillStyle = PC.tex(C.cream); g.fillText(vis.padEnd(s.length, ' '), 495 + (g.measureText(vis).width - g.measureText(s).width) / 2 * 0 , 330 + r * 140); });
      const t2 = (env.words[4] ? env.words[4].t0 : 1.4) - 0.05;
      if (st >= t2) { let c2 = nOn(t2, 4); g.font = R.font(118, 'display', 800);
        L2.forEach((s, r) => { const vis = s.slice(0, Math.max(0, c2)); c2 -= s.length; const p = pop(st, t2 + (r ? 0.25 : 0)); g.save(); g.translate(495, 1310 + r * 150); g.scale(p, p); g.fillStyle = PC.tex(C.cream); g.fillText(vis, -(g.measureText(s).width - g.measureText(vis).width) / 2, 0); g.restore(); }); }
    }, { cam: { ...cam, zoom: 1 + (cam.zoom - 1) * 0.3 }, z: 1, shadow: 0.9 });
  });

  // ═══════════════════════════════ 2 · BOON ═══════════════════════════════
  shot('boon', (ctx, t, env, st, b) => {
    const cam = PC.cam('slide', t / env.dur, { from: -50, to: 50, zoom: 1.08 });
    bg(ctx, 'rice', cam);
    PC.layer(ctx, (g) => { archPanel(g, C.pale, 540, 640, 760, 560, { top: 120 }); }, { cam, z: 0.3, shadow: 0.5 });
    PC.layer(ctx, (g) => border(g, C.far), { shadow: 0.5 });
    const bless = after(st, b[1] - 0.1);
    PC.layer(ctx, (g, figs) => {
      PC.person(g, figs, { id: 'vyasa', kind: 'sage', x: 250, y: 1240, s: 0.98, facing: 1, skin: C.vyasa, col: C.vyasa, colFar: C.vyasaDk, lower: C.bark, top: C.vyasa, hair: 'jata', hairCol: C.tawny, beard: 'long', thread: true,
        face: bless ? 'speak' : 'weary', pose: bless ? { sh: 1.95, el: -0.55, hand: 'open', shF: 0.4, elF: 0.8, lean: 0.02 } : { sh: 0.5, el: 0.8, shF: 0.2, elF: 0.6, lean: 0.1, head: 0.1 }, seed: 11 });
      PC.person(g, figs, { id: 'gandhari', kind: 'queen', x: 850, y: 1240, s: 1.0, facing: -1, blindfold: true, hair: 'bun', border: true, face: 'still', veil: true,
        pose: { sit: 1, sh: 1.05, el: 0.6, shF: 0.95, elF: 0.75, head: 0.1, lean: 0.1 }, seed: 21 });
    }, { cam, z: 1 });
    // on "hundred": a flower of a hundred small buds between them
    const tf = b[2] - 0.15;
    if (st >= tf) PC.layer(ctx, (g) => { const p = pop(st, tf); g.translate(530, 440); g.scale(p * 0.9, p * 0.9); g.rotate(t * 0.1);
      for (let k = 0; k < 100; k++) { const ring = k < 10 ? 0 : k < 30 ? 1 : k < 60 ? 2 : 3, nR = [10, 20, 30, 40][ring], j = k - [0, 10, 30, 60][ring], a = (j / nR) * TAU + ring * 0.1, rr = 40 + ring * 46;
        PC.piece(g, PC.xf([[0, -1], [0.5, -0.1], [0, 1], [-0.5, -0.1]], Math.cos(a) * rr, Math.sin(a) * rr, 12 + ring * 2, a + Math.PI / 2), C.red, { seed: k, wob: 0.4 }); } }, { cam, z: 1.05, shadow: 0.7 });
    tag(ctx, 720, 250, 'GANDHARI', "the blind king's wife", tagA(t, 0.5, env.dur));
  }, { back: C.cream });

  // ═══════════════════════════════ 3 · CARRY (two years) ═══════════════════════════════
  shot('carry', (ctx, t, env, st, b) => {
    const cam = { ...PC.cam('rack', t / env.dur, {}), zoom: lerp(1.04, 1.16, t / env.dur) };   // the focus racks while the camera creeps in (a still frame read as a freeze)
    const u = ss(0.3, env.dur - 0.4, t);   // the focus racks from the window (the moons) to her
    bg(ctx, 'jade', cam);
    // the moons, one phase a 12 fps step, crossing the round window: the months passing
    const n = Math.floor(st * 12), ph = (n % 8) / 7, mx = lerp(330, 750, clamp(st / env.dur));
    PC.layer(ctx, (g) => { PC.piece(g, moonPts(mx, 560, 96, ph), C.cream, { seed: 3 + (n % 5), wob: 1 }); }, { cam, z: 0.2, shadow: 0.4 });
    PC.layer(ctx, (g) => {   // a jali wall with one great round window
      const holes = [PC.ell(540, 560, 300, 300, 60)];
      for (let y = 140; y < 1140; y += 76) for (let x = 90; x < 1000; x += 76) { if (Math.hypot(x - 540, y - 560) < 350) continue; holes.push(((x + y) / 76) % 2 < 1 ? PC.xf([[0, -1], [0.55, 0], [0, 1], [-0.55, 0]], x, y, 24) : PC.ell(x, y, 10, 10, 8)); }
      PC.piece(g, PC.dense([[40, 60], [1040, 60], [1040, 1180], [40, 1180]], 30), G.jade.near, { seed: 57, inset: 7, slit: 2.6, holes });
      PC.piece(g, PC.saw(PC.dense([[1040, 1180], [40, 1180]], 20), 22, -16).concat([[40, 1200], [1040, 1200]]), G.jade.near, { seed: 58, wob: 0.6 });
    }, { cam, z: 0.35, shadow: 0.8, rimCol: '#9fd8c0', filter: `blur(${(R.scale * 6 * u).toFixed(2)}px)` });
    const tired = after(st, b[1] - 0.1);
    PC.layer(ctx, (g, figs) => {
      PC.person(g, figs, { id: 'gandhari', kind: 'queen', x: 470, y: 1250, s: 1.0, facing: 1, blindfold: true, hair: 'bun', border: true, veil: true, face: tired ? 'weary' : 'still',
        pose: { sit: 1, belly: 1, sh: 0.55, el: 1.95, shF: 0.45, elF: 1.85, head: tired ? 0.2 : 0.04, lean: tired ? 0.07 : 0 }, seed: 21 });
    }, { cam, z: 1, filter: `blur(${(R.scale * 6 * (1 - u)).toFixed(2)}px)` });
  });

  // ═══════════════════════════════ 4 · KUNTI'S SON ═══════════════════════════════
  shot('kunti', (ctx, t, env, st, b) => {
    const cam = PC.cam('crane', t / env.dur, { from: 1.16, to: 1.04, y0: 140, y1: -60 });
    bg(ctx, 'turmeric', cam);
    const sy = lerp(760, 470, ss(0, env.dur, t));   // the sun rises (camera and light move every frame)
    PC.layer(ctx, (g) => { g.save(); g.translate(660, sy); g.rotate(t * 0.12); g.translate(-660, -sy); PC.rosette(g, 660, sy, 230, C.red, { seed: 13 }); g.restore(); }, { cam, z: 0.2, shadow: 0.6 });
    PC.layer(ctx, (g) => { PC.piece(g, SMp([[-40, 1010], [180, 920], [380, 970], [600, 900], [820, 960], [1120, 900], [1120, 1960], [-40, 1960]]), C.cream, { seed: 41 }); }, { cam, z: 0.45, shadow: 0.5 });
    PC.layer(ctx, (g, figs) => {
      // the far pavilion: a small arched shelter, Kunti with the child
      PC.piece(g, PC.dense([[500, 700], [840, 700], [840, 1040], [500, 1040]], 16), G.turmeric.far, { seed: 43, inset: 5, slit: 2, holes: [PC.dense([[550, 1042], [550, 880], ...cusps(670, 760, 240).reverse(), [790, 880], [790, 1042]], 10)] });
      PC.piece(g, PC.saw(PC.dense([[480, 700], [860, 700]], 20), 20, -30).concat([[860, 712], [480, 712]]), G.turmeric.far, { seed: 44 });
    }, { cam, z: 0.6, shadow: 0.6 });
    PC.layer(ctx, (g, figs) => {
      PC.person(g, figs, { id: 'kunti', kind: 'woman', x: 690, y: 1035, s: 0.33, facing: -1, hair: 'bun', face: 'still', col: C.deep, colFar: '#6a0c14', pose: { sh: 0.7, el: 1.6, shF: 0.6, elF: 1.6 }, prop: (q) => { q.rotate(2.3); infant(q, 0, -20, 1.6, C.red, 93); }, seed: 31 });
    }, { cam, z: 0.6, shadow: 0.6 });
    // near: Gandhari, head turned toward the news
    const turn = after(st, b[0] - 0.05);
    PC.layer(ctx, (g, figs) => {
      PC.person(g, figs, { id: 'gandhari', kind: 'queen', x: 250, y: 1960, s: 0.95, facing: 1, blindfold: true, hair: 'bun', border: true, veil: true, col: C.near, colFar: C.red, face: turn ? 'grief' : 'still', pose: { sh: 0.25, el: 0.3, shF: 0.2, elF: 0.3, head: turn ? -0.1 : 0.06, lean: turn ? -0.04 : 0.02 }, seed: 21 });
    }, { cam, z: 1.2 });
    tag(ctx, 690, 1150, 'KUNTI', 'wife of Pandu', tagA(t, b[0], env.dur));
  }, { back: C.cream });

  // ═══════════════════════════════ 5 · FORCED (the close-up) ═══════════════════════════════
  shot('forced', (ctx, t, env, st, b) => {
    const cam = PC.cam('push', t / env.dur, { from: 1.0, to: 1.16, focus: [520, 700] });
    const shake = after(st, b[2] - 0.1) && st < b[2] + 0.35 ? (PC.stepF(env.T) % 2 ? 6 : -6) : 0;
    cam.shakeX = shake;
    bg(ctx, 'night', cam);
    PC.layer(ctx, (g) => { jali(g, G.night.far, 60, 140, 1020, 1500, 84, 63); }, { cam, z: 0.3, shadow: 0.6 });
    const grief = after(st, b[0] - 0.05);
    PC.layer(ctx, (g, figs) => {
      PC.person(g, figs, { id: 'gandhari', kind: 'queen', x: 400, y: 3330, s: 2.85, facing: 1, blindfold: true, hair: 'bun', border: true, veil: false, face: grief ? 'grief' : 'still',
        pose: { sh: grief ? 0.3 : 0.1, el: grief ? 0.9 : 0.2, shF: 0.2, elF: 0.6, head: grief ? 0.16 : 0.02, lean: grief ? 0.06 : 0, belly: 1 }, seed: 21 });
    }, { cam, z: 1 });
    PC.layer(ctx, (g) => scraps(g, t, 12, '#5a3a78', 11, [0, 0, W, 1250], 90), { cam, z: 1.3, shadow: 0.4 });
  });

  // ═══════════════════════════════ 6 · THE MASS ═══════════════════════════════
  shot('mass', (ctx, t, env, st, b) => {
    const cam = PC.cam('tilt', t / env.dur, { from: -140, to: 60, zoom: 1.12 });
    const land = 0.30, hit = st >= land && st < land + 0.3;
    cam.shakeY = hit ? (PC.stepF(env.T) % 2 ? 14 : -10) : 0;
    bg(ctx, 'iron', cam);
    PC.layer(ctx, (g) => { lotus(g, 540, 980, 420, G.iron.far, 1, 72, 0.2 + t * 0.06); }, { cam, z: 0.4, shadow: 0.7, rimCol: '#8a8a9a' });
    const my = st < land ? lerp(200, 980, Math.min(1, (Math.floor(st * 12) + 1) / (land * 12))) : 980;   // falls on three 12 fps steps
    const sq = hit ? 0.88 : 1;
    PC.layer(ctx, (g) => { mass(g, 540, my, 260, C.red, 81, sq); }, { cam, z: 1 });
    PC.layer(ctx, (g) => { scraps(g, t, 14, '#5a5866', 21, [0, 0, W, 1300], 150); if (st >= land) scraps(g, t - land, 10, C.far, 22, [300, 700, 800, 1300], 260); }, { cam, z: 1.2, shadow: 0.5 });
  }, { back: C.cream });

  // ═══════════════════════════════ 7 · VYASA (the only gold) ═══════════════════════════════
  shot('vyasa', (ctx, t, env, st, b) => {
    const cam = PC.cam('pull', t / env.dur, { from: 1.18, to: 1.0, focus: [420, 760] });
    bg(ctx, 'rice', cam);
    PC.layer(ctx, (g) => border(g, C.far), { shadow: 0.5 });
    // GOLD FOIL: the halo, 8-fold; a specular band moves across the foil every frame
    const hx = 300 + 10 * 0.95, hy = 1230 - 950 * 0.95;
    PC.layer(ctx, (g) => { g.save(); g.translate(hx, hy); g.rotate(-t * 0.08); g.translate(-hx, -hy); PC.rosette(g, hx, hy, 210, C.gold, { seed: 17, teeth: 48 }); g.restore(); }, { cam, z: 0.9, shadow: 0.7, rimCol: '#fff6c8',
      post: (B) => { const q = B.ctx; q.save(); q.globalCompositeOperation = 'source-atop'; const x = lerp(-200, 700, (t * 0.35) % 1); const gr = q.createLinearGradient(x - 120, 0, x + 120, 300); gr.addColorStop(0, 'rgba(255,248,210,0)'); gr.addColorStop(0.5, 'rgba(255,248,210,0.55)'); gr.addColorStop(1, 'rgba(255,248,210,0)'); q.fillStyle = gr; q.fillRect(0, 0, W, 1000); q.restore(); } });
    const speak = after(st, b[0] - 0.05);
    PC.layer(ctx, (g, figs) => {
      PC.person(g, figs, { id: 'vyasa', kind: 'sage', x: 300, y: 1230, s: 0.95, facing: 1, skin: C.vyasa, col: C.vyasa, colFar: C.vyasaDk, lower: C.bark, top: C.vyasa, hair: 'jata', hairCol: C.tawny, beard: 'long', thread: true,
        face: speak ? 'speak' : 'still', pose: speak ? { sh: 1.3, el: 0.35, hand: 'open', shF: 0.3, elF: 0.7 } : { sh: 0.4, el: 0.5, shF: 0.3, elF: 0.6 }, seed: 11 });
    }, { cam, z: 1 });
    // the mass on a cut leaf; cold water falls on it on the second sentence
    PC.layer(ctx, (g) => {
      PC.piece(g, PC.dense(PC.ell(790, 1110, 170, 40, 30), 12), C.far, { seed: 131, inset: 5, slit: 2, holes: [PC.slit(640, 1110, 940, 1110, 3)] });
      mass(g, 790, 1020, 110, C.red, 83);
      const tw = b[2] - 0.3;
      if (st >= tw) for (let k = 0; k < 9; k++) { const ph = ((st - tw) * 1.6 + hash(k, 5)) % 1, x = 700 + hash(k, 6) * 180, y = lerp(560, 990, ph);
        PC.piece(g, PC.xf([[0, -1], [0.5, 0.3], [0, 0.8], [-0.5, 0.3]], x, y, 22), C.cream, { seed: 140 + k, wob: 0.5 }); }
      // the pots he asks for: a row, popping in
      const tp = b[1] - 0.1;
      for (let k = 0; k < 7; k++) if (st >= tp + k * 0.08) { g.save(); g.translate(150 + k * 130, 1250); const p = pop(st, tp + k * 0.08) * 0.42; g.scale(p, p); PC.piece(g, PC.potPts(), C.far, { seed: 150 + k, inset: 4, slit: 2, holes: PC.potHoles() }); g.restore(); }
    }, { cam, z: 1.05 });
    PC.layer(ctx, (g) => scraps(g, t, 8, C.gold, 35, [100, 0, 1000, 900], 90), { cam, z: 1.2, shadow: 0.4 });
    tag(ctx, 760, 330, 'VYASA', "the sage, the epic's author", tagA(t, b[0], env.dur - 0.2));
  }, { back: C.cream });

  // ═══════════════════════════════ 8 · SPLIT: fold, cut, unfold (THE SIGNATURE) ═══════════════════════════════
  // 101 pieces: 1 + 4 + 8 + 16 + 32 + 40, every ring invariant under the 8 mirrors of the 45° wedge.
  const RINGS = [[1, 0, 0, 46], [4, 0, 92, 30], [8, Math.PI / 8, 158, 30], [16, Math.PI / 16, 218, 24], [32, Math.PI / 32, 272, 18], [40, Math.PI / 40, 318, 15]];
  const PIECES = []; RINGS.forEach(([n, a0, r, sz], ri) => { for (let k = 0; k < n; k++) PIECES.push({ a: a0 + (k * TAU) / n, r, sz, ri }); });
  function sheetPieces(g, cx, cy, spread, bridges, col) {   // the 101 parts (and, until they part, the bridges that hold them as one sheet)
    PIECES.forEach((p, i) => {
      const r = p.r * (1 + spread * (0.15 + 0.05 * p.ri)), x = cx + Math.cos(p.a) * r, y = cy + Math.sin(p.a) * r;
      const shape = p.ri === 0 ? PC.ell(x, y, p.sz, p.sz, 16) : PC.xf([[0, -1], [0.55, -0.3], [0.45, 0.45], [0, 1], [-0.45, 0.45], [-0.55, -0.3]], x, y, p.sz, p.a + Math.PI / 2);
      PC.piece(g, PC.dense(shape, 6), col, { seed: 200 + i, wob: 0.5, inset: spread > 0 ? 2.5 : 0, slit: 1.4, holes: [PC.crescent(x, y, p.sz * 0.42, p.a + Math.PI, 0.5, 6)] });
    });
    if (bridges > 0) { g.save(); g.globalAlpha = bridges; g.fillStyle = PC.tex(col); g.beginPath(); for (let k = 0; k < 16; k++) { const a = (k * TAU) / 16; g.save(); g.translate(cx, cy); g.rotate(a); g.rect(0, -3, 340, 6); g.restore(); } g.arc(cx, cy, 340, 0, TAU); g.arc(cx, cy, 335, 0, TAU, true); g.fill('evenodd'); g.restore(); }
  }
  shot('split', (ctx, t, env, st, b) => {
    const SCH = PC.splitSchedule(env.words), T_FLAT = SCH.flat, T_F = SCH.folds, T_CUT = SCH.cut, T_UN = SCH.unfold, FD = SCH.foldDur;
    const cam = PC.cam('frame', 0, {});
    const rot = st > T_UN + 0.6 ? (t - T_UN - 0.6) * 0.06 : 0;   // then a slow turn around the rosette's centre
    const zoom = st > T_UN + 0.4 ? lerp(1.06, 1.18, ss(T_UN + 0.4, env.dur, t)) : lerp(1.0, 1.06, Math.min(1, t / (T_UN + 0.4)));   // a slow push through the rest and the folds, never still
    const cv = { zoom, px: 0, py: 0, rot };
    bg(ctx, 'indigo', cv);
    const cx = 540, cy = 860, half = 330;
    // the light behind the sheet (holes are light once it is cut and opened)
    const open = st >= T_UN;
    if (open) { ctx.save(); const gl = ctx.createRadialGradient(cx, cy, 40, cx, cy, 560); gl.addColorStop(0, 'rgba(255,190,110,0.55)'); gl.addColorStop(1, 'rgba(255,150,80,0)'); ctx.fillStyle = gl; ctx.globalAlpha = ss(T_UN, T_UN + 0.3, t); ctx.fillRect(0, 0, W, H); ctx.restore(); }
    // the water drops of the rest, then the mass flattening into a sheet
    if (st < T_FLAT) {
      PC.layer(ctx, (g) => { const f = ss(0, T_FLAT, st); if (st > T_FLAT - 0.17) { const k = st > T_FLAT ? 1 : 0.5; PC.piece(g, PC.smooth([[-half, -half], [half, -half], [half, half], [-half, half]].map(([x, y]) => [cx + x * lerp(0.75, 1, k), cy + y * lerp(0.75, 1, k)]), k > 0.9 ? 1 : 3), C.red, { seed: 412, wob: lerp(4, 0.8, k) }); } else { const j = (PC.stepF(env.T) % 2 ? 4 : -4); mass(g, cx + j, cy, lerp(250, 300, f), C.red, 84, lerp(1, 0.7, f)); }
        for (let k = 0; k < 7; k++) { const ph = (t * 1.7 + hash(k, 8)) % 1, x = cx - 200 + hash(k, 9) * 400; PC.piece(g, PC.xf([[0, -1], [0.5, 0.3], [0, 0.8], [-0.5, 0.3]], x, lerp(300, cy - 120, ph), 20), C.cream, { seed: 300 + k, wob: 0.5 }); } }, { cv, cam: cv, z: 1 });
      return;
    }
    // FOLD (three folds, 0.4 s each, on ones: a flap is the sheet reflected over the fold line, scaled by cos θ; past 90° its back shows)
    const folds = [{ ax: [0, -1], keep: (x, y) => x <= 0 }, { ax: [1, 0], keep: (x, y) => y <= 0 }, { ax: [1, 1], keep: (x, y) => y <= x }];
    const fk = T_F.filter((a) => st >= a).length;   // folds begun
    PC.layer(ctx, (g) => {
      g.translate(cx, cy); if (fk === 0) g.rotate(-0.18 * clamp((T_F[0] - st) / (T_F[0] - T_FLAT)));   // the new sheet settles as it lands, before the first fold
      const sq = [[-half, -half], [half, -half], [half, half], [-half, half]];
      // the region still showing after k folds: the square ∩ the kept half-planes
      const region = (k) => { let p = sq; const sides = [(x, y) => x, (x, y) => y, (x, y) => x - y]; for (let i = 0; i < k; i++) p = PC.clipHalf(p, (x, y) => sides[i](x, y) - 0 + (i === 2 ? 0 : 0)); return p; };
      void region;
      // a simpler, exact construction: draw the folded stack as polygons
      const S1 = [[-half, -half], [0, -half], [0, half], [-half, half]], S2 = [[-half, -half], [0, -half], [0, 0], [-half, 0]], S3 = [[-half, -half], [0, 0], [-half, 0]];
      const base = [sq, S1, S2, S3];
      const cutting = st >= T_CUT[0] && !open;
      if (!open) {
        const k = Math.min(3, fk), cur = fk > 0 && st < T_F[fk - 1] + FD ? fk - 1 : -1;
        const th = cur >= 0 ? E.inOutSine(clamp((st - T_F[cur]) / FD)) * Math.PI : 0;
        const stay = cur >= 0 ? base[cur + 1] : base[k];
        // the stack: thickness as 1–4 offset darker edges
        const layers = cur >= 0 ? cur : k;
        for (let j = Math.min(4, layers + (layers ? 1 : 0)); j > 0; j--) PC.piece(g, PC.dense(stay.map(([x, y]) => [x + j * 3, y + j * 3]), 16), C.deep, { seed: 400 + j, wob: 0.8 });
        PC.piece(g, PC.dense(stay, 16), C.red, { seed: 410, wob: 0.8 });
        if (cur >= 0) {
          // the flap: the part beyond the fold line of the previous shape, reflected and scaled by cos θ about the line
          const prev = base[cur], flap = cur === 0 ? [[0, -half], [half, -half], [half, half], [0, half]] : cur === 1 ? [[-half, 0], [0, 0], [0, half], [-half, half]] : [[-half, -half], [0, -half], [0, 0]];
          void prev;
          const ca = Math.cos(th), ax = cur === 0 ? [0, 1] : cur === 1 ? [1, 0] : [Math.SQRT1_2, Math.SQRT1_2];
          // transform: component along the axis kept, the normal component × cos θ (an affine map about a line through the origin)
          const nx = -ax[1], ny = ax[0];
          const tf = ([x, y]) => { const u = x * ax[0] + y * ax[1], v = x * nx + y * ny, h = 1 + 0.28 * Math.abs(Math.sin(th)) * Math.abs(v) / half; return [ax[0] * u * h + nx * v * ca, ax[1] * u * h + ny * v * ca]; };
          const fp = PC.dense(flap, 12).map(tf);
          g.save(); g.globalAlpha = 0.3 * Math.sin(th); g.fillStyle = '#000'; g.beginPath(); PC.path(g, fp.map(([x, y]) => [x + 10, y + 14])); g.fill(); g.restore();
          PC.piece(g, fp, ca >= 0 ? C.red : C.back, { seed: 420 + cur, wob: 0.8, plain: true });
          if (Math.abs(ca) < 0.98) { g.save(); g.globalAlpha = 0.35 * (1 - Math.abs(ca)); g.fillStyle = '#2a0408'; g.beginPath(); PC.path(g, fp); g.fill(); g.restore(); }
        }
        if (k >= 3 && cur < 0) {
          // CUT: the wedge's pattern revealed along the scissor path; offcuts drop; the blades follow the direction of travel
          const u = ss(T_CUT[0], T_CUT[1], st);
          if (cutting || st >= T_CUT[1]) {
            g.save(); g.beginPath(); PC.path(g, S3); g.clip();
            const path = []; for (let i = 0; i <= 40; i++) { const q = i / 40; path.push(q < 0.55 ? [-half + 8 + Math.abs(Math.sin(q * 40)) * 34, lerp(-half + 30, -24, q / 0.55)] : [lerp(-half + 60, -110, (q - 0.55) / 0.45) + Math.sin(q * 30) * 20, lerp(-60, -half * 0.55, (q - 0.55) / 0.45)]); }
            const nUp = Math.floor(u * 40);
            g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.beginPath();
            for (let i = 0; i <= nUp; i++) { const [x, y] = path[i]; g.moveTo(x + 20, y); g.arc(x, y, 20, 0, TAU); }
            g.fill(); g.restore();
            // the scissors (two cut-paper blades in grey, a rivet behind the cutting point)
            if (u < 1) { const i = Math.min(39, nUp), [x, y] = path[i], [x2, y2] = path[i + 1], a = Math.atan2(y2 - y, x2 - x), op = (PC.stepF(env.T) % 2) * 0.22 + 0.05;
              for (const sgn of [1, -1]) PC.piece(g, PC.xf([[0, -6], [-160, -12], [-170, 0], [-150, 8], [0, 6]], x, y, 1.7, a + sgn * op), sgn > 0 ? '#9ea2ad' : '#7d808c', { seed: 430 + sgn, wob: 0.4 });
              PC.piece(g, PC.ell(x - Math.cos(a) * 120, y - Math.sin(a) * 120, 15, 15, 10), '#5a5c66', { seed: 433 }); for (const sgn of [1, -1]) PC.piece(g, PC.ell(x - Math.cos(a + sgn * 0.12) * 300, y - Math.sin(a + sgn * 0.12) * 300, 34, 22, 14), sgn > 0 ? '#7d808c' : '#5a5c66', { seed: 434 + sgn, holes: [PC.ell(x - Math.cos(a + sgn * 0.12) * 300, y - Math.sin(a + sgn * 0.12) * 300, 18, 10, 12)] }); }
          }
        }
      }
    }, { cam: cv, z: 1 });
    // offcuts falling (scraps have a future)
    if (st >= T_CUT[0]) PC.layer(ctx, (g) => scraps(g, t - T_CUT[0], 12, C.red, 41, [200, 500, 700, 1300], 300), { cam: cv, z: 1.1, shadow: 0.5 });
    // UNFOLD: three snaps 0.1 s apart, a 1.15× bump, then the 101 parts let go of their bridges and stand apart
    if (open) {
      const k = st - T_UN, bump = k < 1 / 12 ? 1.15 : 1, spread = ss(0.45, 1.3, k), bridges = 1 - ss(0.35, 0.6, k);
      const unf = Math.min(1, Math.floor(k * 30) / 9);   // the last flaps swing open on ones
      PC.layer(ctx, (g) => {
        g.translate(cx, cy); g.scale(bump * lerp(0.7, 1, E.outBack(unf)), bump * lerp(0.7, 1, E.outBack(unf))); g.translate(-cx, -cy);
        sheetPieces(g, cx, cy, spread, bridges, C.red);
      }, { cam: cv, z: 1, rimCol: '#ffe0b0' });
    }
  });

  // ═══════════════════════════════ 9 · POTS (holes are light) ═══════════════════════════════
  let potSprite = null;
  function potSprite_() {
    if (potSprite && potSprite.s === R.scale) return potSprite;
    const c = document.createElement('canvas'), w = 240, h = 240; c.width = Math.ceil(w * R.scale); c.height = Math.ceil(h * R.scale);
    const g = c.getContext('2d'); g.setTransform(R.scale, 0, 0, R.scale, 0, 0); g.translate(120, 225);
    PC.piece(g, PC.potPts(), C.far, { seed: 501, inset: 7, slit: 4, holes: PC.potHoles() });
    potSprite = { c, s: R.scale }; return potSprite;
  }
  // a hundred pots in five rows, the far rows smaller (24 + 22 + 20 + 18 + 16), wider than the frame: the camera slides along them
  const POTROWS = [[24, 300, 0.19], [22, 440, 0.22], [20, 600, 0.25], [18, 780, 0.29], [16, 980, 0.33]];
  const CRACK = [[-110, -120], [-60, -136], [-30, -112], [10, -140], [40, -116], [80, -134], [110, -120]];
  shot('pots', (ctx, t, env, st, b) => {
    const cam = PC.cam('slide', t / env.dur, { from: 70, to: -70, zoom: 1.08 });
    bg(ctx, 'indigo', cam);
    const tb = b[1] - 0.15;   // "Duryodhana": the near pot opens
    const sp = potSprite_();
    ctx.save(); PC.applyCam(ctx, cam, 0.5); for (const [, y, s] of POTROWS) { const y0 = y - 200 * s, y1 = y; const gl = ctx.createLinearGradient(0, y0, 0, y1); gl.addColorStop(0, 'rgba(255,170,80,0)'); gl.addColorStop(0.55, 'rgba(255,180,95,0.55)'); gl.addColorStop(1, 'rgba(255,170,80,0.1)'); ctx.fillStyle = gl; ctx.fillRect(-300, y0, W + 600, y1 - y0); } ctx.restore(); R.resetCtx(ctx);
    const px = (n, k) => 540 + (k - (n - 1) / 2) * (1320 / n);
    // the light inside every pot: holes are light
    ctx.save(); PC.applyCam(ctx, cam, 0.55); ctx.globalCompositeOperation = 'screen';
    for (const [n, y, s] of POTROWS) for (let k = 0; k < n; k++) { const x = px(n, k), cy = y - 90 * s; const gl = ctx.createRadialGradient(x, cy, 2, x, cy, 95 * s); gl.addColorStop(0, `rgba(255,214,140,${0.95 + 0.05 * Math.sin(t * 3 + k)})`); gl.addColorStop(0.6, 'rgba(255,170,90,0.6)'); gl.addColorStop(1, 'rgba(255,150,80,0)'); ctx.fillStyle = gl; ctx.fillRect(x - 100 * s, cy - 100 * s, 200 * s, 200 * s); }
    ctx.restore(); R.resetCtx(ctx);
    PC.layer(ctx, (g) => {
      for (const [n, y, s] of POTROWS) {
        PC.piece(g, [...PC.saw([[-300, y + 2], [W + 300, y + 2]], 14, 8), [W + 300, y + 12], [-300, y + 12]], '#3a0c18', { seed: 520 + n, wob: 0.6, plain: true });
        for (let k = 0; k < n; k++) { const x = px(n, k); g.drawImage(sp.c, x - 120 * s, y - 225 * s, 240 * s, 240 * s); }
      }
    }, { cam, z: 0.55, shadow: 0.7, rimCol: '#ffd0a0' });
    // the near pot: on "Duryodhana" its top breaks away along a zigzag and the child stands up out of it, on steps
    const open = st >= tb, rise = open ? Math.min(1, (Math.floor((st - tb) * 12) + 1) / 6) : 0;
    PC.layer(ctx, (g) => {
      const x = 540, y = 1240, s = 1.35;
      g.save(); g.translate(x, y); g.scale(s, s);
      if (open) { const gl = g.createRadialGradient(0, -150, 4, 0, -150, 160); gl.addColorStop(0, 'rgba(255,220,150,0.9)'); gl.addColorStop(1, 'rgba(255,170,90,0)'); g.fillStyle = gl; g.fillRect(-170, -320, 340, 260);
        infant(g, 0, -150 - 170 * rise, 1.25, C.near, 95); }
      const pts = PC.potPts(), holes = PC.potHoles();
      if (!open) PC.piece(g, pts, C.red, { seed: 530, inset: 6, slit: 3, holes });
      else {
        const below = [[-200, 40], [200, 40], [200, CRACK[CRACK.length - 1][1]], ...[...CRACK].reverse(), [-200, CRACK[0][1]]];
        g.save(); g.beginPath(); PC.path(g, below); g.clip(); PC.piece(g, pts, C.red, { seed: 530, inset: 6, slit: 3, holes }); g.restore();
        const above = [[-200, -260], [200, -260], [200, CRACK[CRACK.length - 1][1]], ...[...CRACK].reverse(), [-200, CRACK[0][1]]];
        g.save(); g.translate(60 * rise, -120 * rise); g.rotate(0.5 * rise); g.beginPath(); PC.path(g, above); g.clip(); PC.piece(g, pts, C.red, { seed: 530, inset: 6, slit: 3, holes }); g.restore();
      }
      g.restore();
    }, { cam, z: 1, rimCol: '#ffe0b0' });
    PC.layer(ctx, (g) => scraps(g, t, 10, '#c88a50', 31, [0, 0, W, 1250], -70), { cam, z: 1.3, shadow: 0.3 });
    tag(ctx, 495, 190, 'DURYODHANA', 'eldest of the hundred', tagA(t, b[1], env.dur));
  }, { post: { bloom: 0.2 } });

  // ═══════════════════════════════ 10 · OMENS (the one gong) ═══════════════════════════════
  shot('omens', (ctx, t, env, st, b) => {
    const cam = PC.cam('orbit', t / env.dur, { from: -0.6, to: 0.6, amp: 70, zoom: 1.1 });
    const g0 = 0.0, hit = st >= g0 && st < g0 + 0.25;
    cam.shakeX = hit ? (PC.stepF(env.T) % 2 ? 9 : -9) : 0;
    bg(ctx, 'night', cam);
    PC.layer(ctx, (g) => { PC.piece(g, moonPts(820, 300, 70, 0.25), C.cream, { seed: 601 }); }, { cam, z: 0.15, shadow: 0.4 });
    // the palace: domes, arches, lit windows (holes are light)
    const fl = 1 + 0.6 * (1 - ss(0, 0.8, t));
    ctx.save(); PC.applyCam(ctx, cam, 0.4); ctx.globalAlpha = 0.5 * fl; for (let k = 0; k < 5; k++) { const gl = ctx.createRadialGradient(220 + k * 160, 760, 10, 220 + k * 160, 760, 120); gl.addColorStop(0, 'rgba(255,170,80,0.9)'); gl.addColorStop(1, 'rgba(255,170,80,0)'); ctx.fillStyle = gl; ctx.fillRect(80 + k * 160, 620, 280, 280); } ctx.restore(); R.resetCtx(ctx);
    PC.layer(ctx, (g) => {
      const sk = [[60, 980], [60, 700], [120, 640], [180, 700], [180, 620], [260, 520], [340, 620], [340, 600], [430, 480], [540, 380], [650, 480], [740, 600], [740, 620], [820, 520], [900, 620], [900, 700], [960, 640], [1020, 700], [1020, 980]];
      const holes = []; for (let k = 0; k < 5; k++) holes.push(PC.dense([[200 + k * 160, 860], [200 + k * 160, 760], ...cusps(240 + k * 160, 720, 80).slice(1, -1), [280 + k * 160, 760], [280 + k * 160, 860]], 8));
      for (let k = 0; k < 6; k++) holes.push(PC.xf([[0, -1], [0.5, 0], [0, 1], [-0.5, 0]], 180 + k * 144, 940, 16));
      PC.piece(g, PC.dense(sk, 18), G.night.far, { seed: 611, inset: 6, slit: 2.4, holes });
    }, { cam, z: 0.4, shadow: 0.6, rimCol: '#a08ac0' });
    // the jackals: a ring of cut-outs howling, heads up, on steps
    PC.layer(ctx, (g) => {
      for (let k = 0; k < 5; k++) {
        const f = k % 2 ? -1 : 1, x = 90 + k * 225, y = 1190 + (k % 2) * 50, howl = (PC.stepF(env.T) + k * 2) % 6 < 4;
        g.save(); g.translate(x, y); g.scale(0.6 * f, 0.6);
        jackal(g, howl, 640 + k);
        g.restore();
      }
    }, { cam, z: 1 });
    // the brahmins (and Vidura with them) point at the palace: give this one up
    const tb = b[1] - 0.15;
    if (st >= tb) PC.layer(ctx, (g, figs) => {
      for (let k = 0; k < 2; k++) PC.person(g, figs, { id: 'brahmin' + k, kind: 'priest', x: 760 + k * 170, y: 1260 + k * 10, s: 0.42, facing: -1, col: C.near, colFar: C.red, topknot: true, thread: true, face: 'speak', pose: { sh: 2.0 - k * 0.3, el: 0.2, hand: 'open', shF: 0.3, elF: 0.4 }, seed: 70 + k * 9 });
    }, { cam, z: 1.1 });
  }, { post: { bloom: 0.15 } });

  // ═══════════════════════════════ 11 · REFUSE ═══════════════════════════════
  shot('refuse', (ctx, t, env, st, b) => {
    const cam = PC.cam('push', t / env.dur, { from: 1.0, to: 1.14, focus: [640, 760] });
    bg(ctx, 'rice', cam);
    PC.layer(ctx, (g) => { archPanel(g, C.pale, 640, 700, 620, 520, { top: 100, seed: 53 }); }, { cam, z: 0.3, shadow: 0.5 });
    PC.layer(ctx, (g) => border(g, C.far, 37), { shadow: 0.5 });
    const turn = after(st, b[0] - 0.1);
    PC.layer(ctx, (g, figs) => {
      for (let k = 0; k < 2; k++) PC.person(g, figs, { id: 'brahmin' + k, kind: 'priest', x: 150 + k * 140, y: 1230, s: 0.62, facing: 1, col: C.far, colFar: C.deep, topknot: true, thread: true, face: 'speak', pose: { sh: 1.6 + k * 0.2, el: 0.2, hand: 'open', shF: 0.3, elF: 0.4 }, seed: 80 + k * 9 });
      PC.person(g, figs, { id: 'dhritarashtra', kind: 'king', x: 700, y: 1240, s: 0.95, facing: turn ? 1 : -1, crown: true, beard: 'short', face: 'closed', top: C.red,
        pose: { sh: 0.45, el: 2.3, shF: 0.4, elF: 2.2, head: turn ? 0.06 : 0, lean: turn ? -0.04 : 0 }, prop: (q) => { q.rotate(2.75); infant(q, 0, -20, 1.3, C.cream, 97); }, seed: 41 });
    }, { cam, z: 1 });
  }, { back: C.cream });

  // ═══════════════════════════════ 12 · DAUGHTER (the payoff: symmetry replicates) ═══════════════════════════════
  const BOYS = []; [[4, 0, 150], [8, Math.PI / 8, 225], [16, Math.PI / 16, 300], [32, Math.PI / 32, 375], [40, Math.PI / 40, 445]].forEach(([n, a0, r], ri) => { for (let k = 0; k < n; k++) BOYS.push({ a: a0 + (k * TAU) / n, r, ri }); });
  function boy(g, x, y, s, a, col, seed) { g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
    PC.piece(g, PC.dense([[-14, 0], [14, 0], [16, -40], [10, -60], [-10, -60], [-16, -40]], 6), col, { seed, wob: 0.4 });
    PC.piece(g, PC.ell(0, -74, 13, 13, 12), col, { seed: seed + 1, wob: 0.3, holes: [PC.crescent(4, -76, 3.5, Math.PI / 2, 0.55, 6)] });
    g.restore(); }
  shot('daughter', (ctx, t, env, st, b) => {
    const cam = PC.cam('pull', t / env.dur, { from: 1.35, to: 1.0, focus: [540, 880] });
    bg(ctx, 'turmeric', cam);
    PC.layer(ctx, (g) => border(g, C.red, 41), { shadow: 0.5 });
    const cx = 540, cy = 800;
    // the hundred appear ring by ring ("within a month all hundred were born"), the daughter at the centre on "daughter"
    const t0 = b[0] - 0.3, t1 = b[1] + 0.2;
    PC.layer(ctx, (g) => {
      g.translate(cx, cy); g.rotate(t * 0.12); g.translate(-cx, -cy);
      const n = st < t0 ? 4 + 8 * Math.min(1, Math.floor(st * 12 / 4)) : Math.min(100, 4 + Math.floor((st - t0) / (t1 - t0) * 96 / 8) * 8), bs = boy_();
      BOYS.slice(0, n).forEach((p) => { g.save(); g.translate(cx + Math.cos(p.a) * p.r, cy + Math.sin(p.a) * p.r); g.rotate(p.a + Math.PI / 2); const k = 0.8 + 0.08 * p.ri; g.drawImage(bs.c, -bs.w / 2 * k, -bs.h * k, bs.w * k, bs.h * k); g.restore(); });
    }, { cam, z: 1 });
    const td = b[2] - 0.15;
    PC.layer(ctx, (g, figs) => {
      PC.piece(g, PC.saw(PC.dense(PC.ell(cx, cy, 100, 100, 40), 10), 14, 8), C.cream, { seed: 790, wob: 1 });
      if (st >= td) { const p = pop(st, td); g.translate(cx, cy + 82); g.scale(p, p); g.translate(-cx, -(cy + 82));
        PC.person(g, figs, { id: 'duhshala', kind: 'woman', x: cx - 6, y: cy + 82, s: 0.16, facing: 1, hair: 'braid', face: 'still', col: C.near, colFar: C.red, inset: 10, slit: 4, pose: { sh: 0.7, el: 0.6 }, seed: 91 }); }
    }, { cam, z: 1.02 });
    PC.layer(ctx, (g) => scraps(g, t, 12, C.red, 39, [0, 0, W, 1300], 120), { cam, z: 1.3, shadow: 0.4 });
    tag(ctx, 495, 200, 'DUHSHALA', 'the only daughter', tagA(t, b[2], env.dur));
  });

  // ═══════════════════════════════ END CARD ═══════════════════════════════
  shot('endcard', (ctx, t, env, st) => {
    PC.cam('still', 0, {});
    const cv = { zoom: 1, px: 0, py: 0, rot: 0 };
    bg(ctx, 'indigo', cv);
    PC.layer(ctx, (g) => { g.translate(540, 900); g.rotate(t * 0.22); g.translate(-540, -900); sheetPieces(g, 540, 900, 1, 0, G.indigo.far); }, { shadow: 0.5, rimCol: '#8a98d0' });
    PC.layer(ctx, (g) => scraps(g, t, 14, C.red, 47, [60, 0, 1020, 1880], 140), { shadow: 0.5 });
    PC.layer(ctx, (g) => border(g, C.red, 45), { shadow: 0.6 });
    PC.layer(ctx, (g) => { const bob = (PC.stepF(env.T) % 6 < 3) ? 0 : -6; peacock(g, 300, 480 + bob, 0.5, 1, C.red, 101); peacock(g, 690, 480 - bob, 0.5, -1, C.red, 111); }, { shadow: 0.8 });
    // the title strip, letters popping in on 12 fps steps
    const n = Math.floor(st * 12 * 2) + 3;
    PC.layer(ctx, (g) => { PC.piece(g, PC.bannerPts(120, 570, 870, 760), C.red, { seed: 801, inset: 6, slit: 2.4 }); }, { shadow: 1 });
    ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = PC.tex(C.cream); ctx.font = R.font(80, 'display', 800);
    const ttl = 'MAHABHARATAM'; ctx.fillText(ttl.slice(0, n), 495 - (ctx.measureText(ttl).width - ctx.measureText(ttl.slice(0, n)).width) / 2, 700);
    if (st > 0.5) { ctx.font = R.font(46, 'display', 700); ctx.fillStyle = PC.tex(C.cream); ctx.fillText('AS VYASA TOLD IT', 495, 850); }
    ctx.restore(); R.resetCtx(ctx);
    if (st > 0.9) { const p = pop(st, 0.9); PC.layer(ctx, (g) => { g.translate(495, 1120); g.scale(p, p); g.translate(-495, -1120); PC.piece(g, PC.bannerPts(370, 1060, 620, 1170), C.near, { seed: 811, inset: 5, slit: 2 }); }, { shadow: 1 });
      ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = '#f6e8c8'; ctx.font = R.font(64, 'display', 800); ctx.translate(495, 1140); ctx.scale(p, p); ctx.fillText('FOLLOW', 0, 0); ctx.restore(); R.resetCtx(ctx); }
    ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = '#e8dcc0'; ctx.font = R.font(36, 'caption', 600); ctx.fillText(env.strings.sourceLine, 495, 1440); ctx.restore(); R.resetCtx(ctx);
    if (R.probe) R.probe.type.source = 1;
  });
})();
