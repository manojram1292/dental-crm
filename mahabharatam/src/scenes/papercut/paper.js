/* THE RED PAPER-CUT LOOK (pipeline 95, script/papercut.en.json; nothing else loads this file).
 * Indian sanjhi paper-cutting built in Canvas2D inside the series' frame-function renderer (the Lemo engine is not in this repository;
 * the rules are .claude/skills/lemo-styles/references/papercut-red.md, the series' rules win where they differ).
 *
 *   PC.tex(col)              a paper fill: the colour with dye mottling and fibres (a pattern that moves with the piece: the grain
 *                            is inside the paper; transparent pixels stay transparent, so holes stay holes)
 *   PC.ground(g, fam, o)     a full sheet of dyed ground paper (indigo, night, jade, turmeric, rice, iron, ochre)
 *   PC.piece(g, pts, col, o) one cut piece: hand-cut wobble edge, inset yin contour (o.inset, o.slit), holes cut out (o.holes)
 *   PC.layer(ctx, draw, o)   a stack of pieces composited as one sheet over what is below: tight paper shadow, a light cut rim upper-left
 *                            and a dark one lower-right; o.figs → the gate's figure probe (figure colour against its ground)
 *   PC.person(g, o)          a jointed cut-out in profile (head, torso, skirt, arms pinned at shoulder and elbow); expressions are
 *                            swapped face pieces ('still', 'speak', 'grief', 'closed', 'weary'); eyes are crescents with bridges
 *   PC.rosette(...)          an 8-fold window flower from one 45° wedge mirrored (D4: 4 rotations × a flip)
 *   PC.banner(ctx, ...)      the subtitle strip: darker red than the picture, serrated edges, swallow-tail ends, cream serif
 *   PC.stepT(T)              the 12 fps clock (a pose held 3, 2, 3, 2 frames at 30 fps; never between two motion-blur sub-samples)
 * Transitions 'peel' (a sheet peeled off from a corner) and 'turn' (a page turned on its left edge) are added to KIT.transitions.run
 * for this film only; every other transition goes to the kit's own code unchanged.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, E, hash, noise } = R;
  const W = R.W, H = R.H;
  const PC = (window.PC = {});

  // ── paper colours: red is the hero; depth by one-step tones; grounds are other families ──
  PC.C = {
    red: '#c8161d', near: '#d82a24', far: '#a3121a', deep: '#86101a', back: '#e36a58', pale: '#e89a86', banner: '#5c090e',
    cream: '#f1e4c6', creamDk: '#d9c7a2', gold: '#d2a13c', ink: '#24160f',
    vyasa: '#352b48', vyasaDk: '#271f36', bark: '#a8411e', hair: '#2a1a12', tawny: '#9a6a34',
  };
  PC.G = {
    indigo: { base: '#161d48', far: '#26336e', near: '#0f1435', rim: '#3b4a8e' },
    night: { base: '#22102c', far: '#3a2050', near: '#160a1e', rim: '#4c2c66' },
    jade: { base: '#0e4a3f', far: '#1f6a59', near: '#08332b', rim: '#2f8a74' },
    turmeric: { base: '#e2a42a', far: '#efc25e', near: '#c98618', rim: '#f6d88a' },
    rice: { base: '#ecdcba', far: '#f5ead2', near: '#dcc69c', rim: '#fff6e2' },
    iron: { base: '#1c1b21', far: '#2c2b34', near: '#121116', rim: '#3e3c48' },
  };
  const rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  PC.rgb = rgb;

  // ── the 12 fps clock: frame index → 12 fps step (frames 0,0,0,1,1 | 2,2,2,3,3 …) ──
  PC.stepT = (T) => Math.floor(Math.floor(T * 30 + 1e-4) / 2.5) / 12;
  PC.stepF = (T) => Math.floor(Math.floor(T * 30 + 1e-4) / 2.5);

  // ── textures (built once per page, at its scale) ──
  let grainC = null; const texCache = new Map();
  function grain() {
    if (grainC) return grainC;
    const n = 256, c = document.createElement('canvas'); c.width = c.height = n;
    const g = c.getContext('2d'), img = g.createImageData(n, n), d = img.data, r = R.rng(7171);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      // tileable mottling (sum of periodic noise) + fibres along x + specks
      const u = x / n, v = y / n;
      let m = 0;
      for (let k = 1; k <= 3; k++) m += Math.sin(TAU * (k * u + 0.3 * k)) * Math.cos(TAU * (k * v + 0.7)) * (0.5 / k) + Math.sin(TAU * (2 * k * v + k * u)) * 0.18 / k;
      const fib = Math.sin(TAU * (y * 0.37 + Math.sin(TAU * u * 3) * 1.2)) * 0.25 * (hash(y, 3) > 0.7 ? 1 : 0.2);
      const v0 = 128 + m * 26 + fib * 18 + r.gauss() * 7 + (r() > 0.996 ? -40 : 0);
      const i = (y * n + x) * 4; d[i] = d[i + 1] = d[i + 2] = v0; d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0); grainC = c; return c;
  }
  PC.tex = (col, amt = 0.55) => {
    const key = col + amt;
    let p = texCache.get(key);
    if (p) return p;
    const n = 256, c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d');
    g.fillStyle = col; g.fillRect(0, 0, n, n);
    g.globalCompositeOperation = 'soft-light'; g.globalAlpha = amt; g.drawImage(grain(), 0, 0);
    p = g.createPattern(c, 'repeat'); texCache.set(key, p); return p;
  };

  // ── shapes: dense point lists, then a hand-cut wobble along the normal ──
  PC.ell = (cx, cy, rx, ry, n = 40, a0 = 0, a1 = TAU) => { const p = []; const full = Math.abs(a1 - a0 - TAU) < 1e-6; for (let i = 0; i < (full ? n : n + 1); i++) { const a = a0 + ((a1 - a0) * i) / n; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; };
  PC.dense = (pts, step = 14, closed = true) => {   // resample straight segments so the wobble has points to move
    const out = []; const n = pts.length;
    for (let i = 0; i < (closed ? n : n - 1); i++) { const a = pts[i], b = pts[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.ceil(L / step)); for (let j = 0; j < k; j++) out.push([lerp(a[0], b[0], j / k), lerp(a[1], b[1], j / k)]); }
    if (!closed) out.push(pts[n - 1]);
    return out;
  };
  PC.wob = (pts, seed = 1, amp = 2.0, freq = 0.09) => {
    const n = pts.length, out = new Array(n);
    let acc = 0;
    for (let i = 0; i < n; i++) {
      const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      acc += Math.hypot(pts[i][0] - a[0], pts[i][1] - a[1]) * 0.5 + 1;
      const w = noise.n2(acc * freq, seed * 7.3) * amp + noise.n2(acc * freq * 3.1, seed * 3.1) * amp * 0.35;
      out[i] = [pts[i][0] - (dy / L) * w, pts[i][1] + (dx / L) * w];
    }
    return out;
  };
  PC.path = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  PC.xf = (pts, x, y, s = 1, a = 0, sx = 1) => { const c = Math.cos(a), si = Math.sin(a); return pts.map(([u, v]) => { u *= s * sx; v *= s; return [x + u * c - v * si, y + u * si + v * c]; }); };
  /** a crescent hole (a slit that leaves bridges: never an island) */
  PC.crescent = (cx, cy, r, a, w = 0.45, n = 14) => { const p = []; for (let i = 0; i <= n; i++) { const t = a - 1.2 + (2.4 * i) / n; p.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]); } for (let i = n; i >= 0; i--) { const t = a - 1.2 + (2.4 * i) / n, rr = r * (1 - w * Math.sin(Math.PI * i / n)); p.push([cx + Math.cos(t) * rr + Math.cos(a) * r * w * 0.6, cy + Math.sin(t) * rr + Math.sin(a) * r * w * 0.6]); } return p; };
  /** a tapered slit between two points */
  PC.slit = (x0, y0, x1, y1, w) => { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, p = []; for (let i = 0; i <= 8; i++) { const t = i / 8, ww = w * Math.sin(Math.PI * t); p.push([x0 + dx * t + nx * ww, y0 + dy * t + ny * ww]); } for (let i = 7; i > 0; i--) { const t = i / 8, ww = w * Math.sin(Math.PI * t); p.push([x0 + dx * t - nx * ww, y0 + dy * t - ny * ww]); } return p; };
  /** sawtooth edge along a polyline (teeth on the left of the direction of travel) */
  PC.saw = (pts, tooth = 14, depth = 12) => {
    const out = [];
    for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), k = Math.max(1, Math.round(L / tooth)), nx = dy / L, ny = -dx / L;
      for (let j = 0; j < k; j++) { const t0 = j / k, t1 = (j + 0.5) / k; out.push([a[0] + dx * t0, a[1] + dy * t0]); out.push([a[0] + dx * t1 + nx * depth, a[1] + dy * t1 + ny * depth]); } }
    out.push(pts[pts.length - 1]); return out;
  };

  /**
   * One cut piece into g (a layer buffer, logical px under g's transform).
   * o = { seed, wob (amp), inset (px, 0 = none), slit (px), holes: [pts…], plain (no wobble) }
   */
  PC.piece = (g, pts, col, o = {}) => {
    const sd = o.seed ?? 1, P = o.plain ? pts : PC.wob(pts, sd, o.wob ?? 1.8);
    g.save();
    g.beginPath(); PC.path(g, P);
    g.fillStyle = PC.tex(col); g.fill();
    if (o.inset) {
      g.save(); g.clip();
      g.lineJoin = 'round';
      g.globalCompositeOperation = 'destination-out'; g.lineWidth = 2 * (o.inset + (o.slit ?? 2.4)); g.strokeStyle = '#000'; g.stroke();
      g.globalCompositeOperation = 'source-over'; g.lineWidth = 2 * o.inset; g.strokeStyle = PC.tex(col); g.stroke();
      g.restore();
    }
    if (o.holes && o.holes.length) {
      g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000';
      g.beginPath(); for (const h of o.holes) PC.path(g, o.plain ? h : PC.wob(h, sd + 11, 0.7, 0.2)); g.fill();
      g.globalCompositeOperation = 'source-over';
    }
    g.restore();
  };
  /** holes only (cut through whatever is already in g) */
  PC.cut = (g, holes, seed = 3) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.beginPath(); for (const h of holes) PC.path(g, PC.wob(h, seed, 0.6, 0.2)); g.fill(); g.restore(); };

  // ── a ground sheet ──
  PC.ground = (g, fam, o = {}) => {
    const f = PC.G[fam] || fam;
    g.save(); R.resetCtx(g);
    g.fillStyle = PC.tex(f.base, 0.7); g.fillRect(-20, -20, W + 40, H + 40);
    // large soft dye clouds (paper is never flat): the grain texture drawn huge
    g.globalCompositeOperation = 'soft-light'; g.globalAlpha = 0.45; g.drawImage(grain(), -200 + (o.shift || 0) * 0.2, -200, W + 400, H + 400);
    g.restore();
  };

  // ── layers: a sheet of pieces over what is below (shadow, rims) ──
  let layerN = 0;
  PC.beginFrame = () => { layerN = 0; };
  PC.layer = (ctx, draw, o = {}) => {
    const k = layerN++ % 6;
    const B = R.buffer('pc-L' + k, W, H); B.clear();
    const figs = [];
    B.ctx.save(); if (o.cam) PC.applyCam(B.ctx, o.cam, o.z ?? 1); draw(B.ctx, figs); B.ctx.restore(); R.resetCtx(B.ctx);
    if (o.post) o.post(B);
    const S = R.buffer('pc-S', W, H); S.clear();
    const s = R.scale, cw = B.canvas.width, ch = B.canvas.height;
    S.ctx.setTransform(1, 0, 0, 1, 0, 0); S.ctx.drawImage(B.canvas, 0, 0); S.ctx.globalCompositeOperation = 'source-in'; S.ctx.fillStyle = o.shadowCol || '#05030a'; S.ctx.fillRect(0, 0, cw, ch); S.ctx.globalCompositeOperation = 'source-over';
    // the gate's figure probe: mean colour of the figure and of the ground in its own box, before the sheet is laid down
    const pr = R.probe;
    const bgs = pr && pr.figures && figs.length ? figs.map((f) => meanBox(ctx, f.box, false)) : null;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (o.filter) ctx.filter = o.filter;
    const sh = (o.shadow ?? 1) * s, al = o.alpha ?? 1;
    if (sh > 0) { ctx.globalAlpha = 0.34 * al; ctx.drawImage(S.canvas, 5 * sh, 7 * sh); ctx.globalAlpha = 0.22 * al; ctx.drawImage(S.canvas, 2.4 * sh, 3.2 * sh); }
    ctx.globalAlpha = 0.75 * al; ctx.drawImage(S.canvas, 1.3 * s, 1.5 * s);     // dark cut face, lower right
    if (o.rimLight !== false) {
      S.ctx.globalCompositeOperation = 'source-in'; S.ctx.fillStyle = o.rimCol || '#fff3dc'; S.ctx.fillRect(0, 0, cw, ch); S.ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.42 * al; ctx.drawImage(S.canvas, -1.1 * s, -1.2 * s);   // light cut face, upper left
    }
    ctx.globalAlpha = al; ctx.drawImage(B.canvas, 0, 0);
    ctx.restore(); R.resetCtx(ctx);
    if (bgs) figs.forEach((f, i) => { const fc = meanBox(B.ctx, f.box, true); if (fc) pr.figures.push({ id: f.id, key: f.id, fig: fc, bg: bgs[i] || [0, 0, 0], h: +f.h.toFixed(3) }); });
    return B;
  };
  function meanBox(g, box, alphaOnly) {   // box in backing px
    const cw = g.canvas.width, ch = g.canvas.height;
    const x0 = clamp(Math.floor(box[0]), 0, cw - 1), y0 = clamp(Math.floor(box[1]), 0, ch - 1), x1 = clamp(Math.ceil(box[2]), x0 + 1, cw), y1 = clamp(Math.ceil(box[3]), y0 + 1, ch);
    const d = g.getImageData(x0, y0, x1 - x0, y1 - y0).data; let r = 0, gg = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) { if (alphaOnly && d[i + 3] < 200) continue; r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; }
    return n > 4 ? [r / n, gg / n, b / n] : null;
  }
  /** register a figure (local box under g's transform) for the probe and its face for the caption check */
  PC.reg = (g, figs, id, box, face, fullH) => {
    const m = g.getTransform(), tp = (x, y) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f];
    const c = [tp(box[0], box[1]), tp(box[2], box[1]), tp(box[0], box[3]), tp(box[2], box[3])];
    const xs = c.map((p) => p[0]), ys = c.map((p) => p[1]);
    const bb = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    const hh = (fullH ?? (box[3] - box[1])) * Math.hypot(m.c, m.d) / g.canvas.height;
    if (figs) figs.push({ id, box: bb, h: hh });
    if (face && R.faces) { const f = tp(face[0], face[1]); R.faces.push({ x: f[0] / R.scale, y: f[1] / R.scale, r: face[2] * Math.hypot(m.a, m.b) / R.scale }); }
  };

  // ── camera: a kit move ({ zoom, px, py, rot }) applied to a layer of depth z (0 far … 1 the figures' plane … >1 near) ──
  const EV = (u) => 0.5 * E.inOutSine(u) + 0.5 * u;   // an eased move that never comes to rest (a still camera reads as a freeze)
  PC.cam = (type, p, o = {}) => { o = { ease: EV, ...o }; const c = KIT.cam[type] ? KIT.cam[type](p, o) : null; if (!KIT.cam[type] && R.probe) { R.probe.moves = R.probe.moves || {}; R.probe.moves[type] = (R.probe.moves[type] || 0) + 1; } return c || { zoom: o.zoom ?? 1, px: 0, py: 0, rot: 0 }; };
  PC.applyCam = (g, c, z = 1) => {
    const zl = 1 + (c.zoom - 1) * Math.min(1.4, Math.max(0.15, z)), sx = (c.shakeX || 0), sy = (c.shakeY || 0);
    g.translate(W / 2 + sx * z, H / 2 + sy * z); g.scale(zl, zl); g.rotate((c.rot || 0) * z); g.translate(-W / 2 - c.px * z, -H / 2 - c.py * z);
  };

  // ═══════════════════════════════ FIGURES ═══════════════════════════════
  // Profile, facing +x (o.facing −1 mirrors). Feet at (x, y). A standing figure is about 1030 tall at s = 1 (head about a sixth).
  // pose: { sh: near shoulder angle (rad, 0 = arm down, + forward), el: elbow bend, shF, elF (far arm), head: tilt, lean, sit: 0..1, belly }
  /** Catmull-Rom through the points (closed), resampled: organic cut outlines from a few control points */
  PC.smooth = (pts, k = 5, closed = true) => {
    const n = pts.length, out = [];
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      for (let j = 0; j < k; j++) { const t = j / k, t2 = t * t, t3 = t2 * t;
        out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
                  0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]); }
    }
    return out;
  };
  const SM = PC.smooth;
  const HEAD = [[-64, -930], [-58, -985], [-28, -1014], [14, -1020], [46, -1004], [60, -978], [64, -952], [70, -940], [90, -914], [74, -906], [72, -896], [80, -888], [70, -882], [72, -872], [64, -858], [36, -848], [6, -856], [-30, -880], [-54, -902]];
  function faceHoles(ex, blind) {
    const h = [];
    if (!blind) {
      if (ex === 'closed') { h.push(PC.crescent(42, -944, 15, Math.PI / 2, 0.55, 12)); h.push(PC.slit(24, -966, 60, -964, 2.6)); }
      else {
        const lid = ex === 'weary' ? 0.75 : 0.5;
        h.push(PC.crescent(44, -950, 15, -Math.PI / 2, lid, 12));   // upper lid
        h.push(PC.crescent(44, -938, 13, Math.PI / 2, 0.5, 12));    // lower lid (a bridge left at each corner)
        h.push(PC.ell(50, -943, 4, 4.5, 8));                         // the pupil
        h.push(ex === 'grief' || ex === 'weary' ? PC.slit(24, -964, 58, -976, 3) : PC.slit(22, -968, 60, -970, 2.8));
      }
    }
    if (ex === 'speak') h.push(PC.ell(70, -878, 6, 4, 10));
    else if (ex === 'grief') h.push(PC.slit(58, -874, 72, -880, 2.2));
    else h.push(PC.slit(58, -880, 72, -878, 2));
    h.push(PC.crescent(-12, -930, 13, 0, 0.5, 10));   // the ear
    if (ex === 'grief') h.push(PC.crescent(46, -912, 8, Math.PI * 0.55, 0.6, 8));   // a tear, cut
    return h;
  }
  /** an arm pinned at the shoulder (x, y); returns { hand matrix }; o.prop(g) is drawn in the hand's frame */
  function arm(g, x, y, sh, el, col, o) {
    const u = 240, f = 220, w = o.armW || 1;
    g.save(); g.translate(x, y); g.rotate(-sh);
    PC.piece(g, SM([[-26 * w, -14], [24 * w, -14], [20 * w, u * 0.6], [16 * w, u], [-16 * w, u], [-20 * w, u * 0.5]], 4), col, { seed: o.seed + 1, inset: o.inset, slit: o.slit, holes: o.bare ? [] : [PC.crescent(0, u * 0.25, 10, Math.PI / 2, 0.55, 8)] });
    g.translate(0, u - 6); g.rotate(-el);
    PC.piece(g, SM([[-17 * w, -10], [17 * w, -10], [14 * w, f * 0.6], [12 * w, f], [-12 * w, f], [-14 * w, f * 0.5]], 4), col, { seed: o.seed + 2, inset: o.inset, slit: o.slit, holes: [PC.slit(-11, f - 30, 11, f - 26, 2), PC.slit(-11, f - 18, 11, f - 14, 2)] });   // bangles as slits
    g.translate(0, f);
    const hp = o.hand === 'fist' ? SM([[-15, -4], [16, -4], [20, 22], [4, 36], [-14, 28]], 4)
      : SM([[-14, -4], [15, -4], [24, 30], [20, 58], [8, 66], [-6, 60], [-12, 40], [-26, 26], [-24, 16], [-14, 18]], 3);
    PC.piece(g, hp, col, { seed: o.seed + 3, inset: o.inset ? 3 : 0, slit: 1.6, holes: o.hand === 'fist' ? [] : [PC.slit(4, 30, 10, 58, 1.4), PC.slit(-4, 30, 0, 56, 1.4)] });
    if (o.prop) o.prop(g);
    const m = g.getTransform(); g.restore(); return m;
  }
  PC.person = (g, figs, o) => {
    const s = o.s || 1, fx = o.facing || 1, kind = o.kind || 'woman', po = o.pose || {}, sd = o.seed || 5;
    const col = o.col || PC.C.red, colF = o.colFar || PC.C.far, inset = o.inset ?? 6, slit = o.slit ?? 2.6;
    const sit = po.sit || 0, lean = po.lean || 0, fem = kind === 'woman' || kind === 'queen';
    const pin = { seed: sd, inset, slit };
    g.save(); g.translate(o.x, o.y); g.scale(s * fx, s);
    const hipY = sit ? -270 : -500;
    // ── lower body ──
    if (fem) {
      const skirt = sit ? [[-90, hipY - 6], [64, hipY - 10], [150, -150], [236, -40], [240, 0], [-170, 0], [-150, -110]] : [[-62, hipY], [58, hipY], [84, -380], [112, -200], [146, -40], [150, 0], [-150, 0], [-146, -40], [-108, -200], [-82, -380]];
      const hem = sit ? [[-170, -46], [240, -46]] : [[-148, -46], [150, -46]];
      const holes = [];
      for (let k = 0; k < (sit ? 12 : 9); k++) holes.push(PC.crescent(lerp(hem[0][0] + 26, hem[1][0] - 26, k / ((sit ? 12 : 9) - 1)), -24, 9, Math.PI / 2, 0.55, 8));
      if (!sit) { for (let k = 0; k < 5; k++) holes.push(PC.slit(-30 + k * 16, hipY + 50, -70 + k * 34, -110, 2.6)); for (let k = 0; k < 7; k++) holes.push(PC.xf([[0, -1], [0.55, 0], [0, 1], [-0.55, 0]], -100 + k * 34, -150 + Math.abs(k - 3) * 3, 9)); }
      else for (let k = 0; k < 6; k++) holes.push(PC.xf([[0, -1], [0.55, 0], [0, 1], [-0.55, 0]], -110 + k * 60, -100, 9));
      PC.piece(g, SM(skirt, 4), col, { ...pin, seed: sd + 10, holes });
      if (o.border) PC.piece(g, PC.saw(PC.dense([[hem[1][0], -10], [hem[0][0], -10]], 14), 16, -10).concat([[hem[0][0], 0], [hem[1][0], 0]]), PC.C.cream, { seed: sd + 11, wob: 0.8 });
      if (!sit) PC.piece(g, SM([[100, -16], [176, -10], [186, 0], [96, 0]], 3), colF, { seed: sd + 12 });
    } else if (kind === 'sage') {
      const wrap = [[-66, hipY], [64, hipY], [80, -300], [96, -60], [118, -10], [-110, -10], [-92, -60], [-80, -300]];
      PC.piece(g, SM(wrap, 4), o.lower || col, { ...pin, seed: sd + 13, holes: [PC.slit(-40, hipY + 60, -50, -80, 3), PC.slit(10, hipY + 60, 20, -90, 3), PC.slit(50, hipY + 80, 70, -120, 3)] });
      PC.piece(g, PC.saw(PC.dense([[118, -30], [-110, -30]], 12), 14, -14).concat([[-110, -10], [118, -10]]), o.lower || col, { seed: sd + 14, wob: 0.6 });
      PC.piece(g, SM([[60, -20], [150, -14], [156, 0], [52, 0]], 3), o.skin || col, { seed: sd + 15 });
    } else {
      // dhoti to the calf, then legs and feet
      PC.piece(g, SM([[30, -230], [50, -230], [56, -30], [124, -14], [128, 0], [26, 0], [24, -30]], 3), o.skin || colF, { seed: sd + 16, inset: inset * 0.6, slit });
      PC.piece(g, SM([[-40, -230], [-20, -230], [-16, -30], [52, -14], [56, 0], [-46, 0], [-46, -30]], 3), o.skin || col, { seed: sd + 17, inset: inset * 0.6, slit });
      if (!sit) PC.piece(g, SM([[-70, hipY], [66, hipY], [86, -330], [70, -210], [20, -240], [-30, -200], [-80, -220], [-84, -330]], 4), o.lower || col, { ...pin, seed: sd + 18, holes: [PC.slit(-50, hipY + 40, -10, -260, 3), PC.slit(10, hipY + 50, 40, -270, 3), PC.crescent(0, -380, 26, Math.PI / 2, 0.5, 10)] });
    }
    // ── upper body, leaning about the hip ──
    g.save(); g.translate(0, hipY); g.rotate(lean); g.translate(0, -hipY);
    const dy = hipY + 500;   // everything above the hip moves with it
    g.translate(0, dy);
    const shX = 8, shY = -770;
    const farM = arm(g, shX - 18, shY + 14, po.shF ?? 0.15, po.elF ?? 0.3, colF, { seed: sd + 20, inset, slit, hand: po.handF || 'open', bare: !fem });
    if (o.veil) {   // Gandhari's pallu, behind the body: cream, as the series' white sari
      PC.piece(g, PC.saw(SM([[-30, -1024], [30, -1026], [-16, -990], [-50, -930], [-62, -800], [-70, -620], [-74, -470], [-160, -470], [-150, -640], [-126, -830], [-100, -950], [-70, -1006]], 3), 26, 7), o.veilCol || PC.C.cream, { seed: sd + 32, inset: 5, slit: 2, holes: [0, 1, 2, 3, 4].map((k) => PC.ell(-100 - k * 6, -880 + k * 90, 7, 7, 8)).concat([0, 1, 2, 3].map((k) => PC.crescent(-130 + k * 18, -500, 8, Math.PI / 2, 0.55, 8))) });
    }
    const belly = po.belly || 0;
    const tor = fem ? [[-58, -500], [54, -500], [52 + belly * 60, -560], [56 + belly * 30, -640], [72, -700], [62, -760], [30, -800], [-36, -804], [-64, -760], [-66, -640]]
                    : [[-62, -500], [58, -500], [62 + belly * 50, -600], [74, -700], [70, -770], [36, -806], [-44, -808], [-76, -770], [-74, -640]];
    const tHoles = fem ? [PC.crescent(36, -690, 30, Math.PI / 2, 0.45, 12), ...[0, 1, 2, 3].map((k) => PC.ell(-36 + k * 26, -530, 5, 5, 8))]
                       : kind === 'king' ? [...[0, 1, 2, 3, 4].map((k) => PC.crescent(-30 + k * 22, -740 + Math.abs(k - 2) * 8, 9, Math.PI / 2, 0.55, 8)), PC.slit(-50, -540, 50, -540, 3)] : [PC.slit(-50, -540, 50, -540, 3)];
    PC.piece(g, SM(tor, 4), o.top || col, { ...pin, seed: sd + 30, holes: tHoles });
    if (o.thread) PC.piece(g, PC.dense([[38, -800], [48, -798], [-40, -506], [-50, -508]], 14), PC.C.cream, { seed: sd + 31 });
    PC.piece(g, SM([[-16, -790], [24, -790], [28, -852], [-12, -858]], 3), o.skin || col, { seed: sd + 33 });   // the neck
    // ── head ──
    g.save(); g.translate(10, -846); g.rotate(po.head || 0); g.translate(-10, 846);
    const hc = o.skin || col, hairC = o.hairCol || PC.C.deep;
    if (o.hair === 'jata') {
      PC.piece(g, PC.saw(SM([[-40, -1010], [10, -1030], [-30, -990], [-66, -930], [-80, -760], [-92, -560], [-140, -520], [-130, -700], [-112, -900], [-80, -990]], 3), 18, 9), hairC, { seed: sd + 41, inset: 5, slit: 2.2, holes: [PC.slit(-104, -900, -110, -600, 3), PC.slit(-88, -880, -96, -640, 2.6), PC.slit(-120, -820, -124, -600, 2.4)] });
      PC.piece(g, SM([[-60, -1010], [-10, -1050], [30, -1046], [20, -1010], [-30, -996]], 4), hairC, { seed: sd + 42, inset: 4, slit: 2, holes: [PC.crescent(-8, -1022, 18, 0.3, 0.5, 10), PC.crescent(-8, -1022, 18, 3.4, 0.5, 10)] });
    }
    if (o.hair === 'bun') PC.piece(g, SM(PC.ell(-74, -958, 40, 36, 8), 3), hairC, { seed: sd + 40, inset: 4, slit: 2, holes: [PC.crescent(-74, -958, 22, 2.2, 0.5, 10), PC.ell(-74, -958, 5, 5, 6)] });
    if (o.hair === 'braid') PC.piece(g, PC.saw(SM([[-50, -960], [-70, -940], [-86, -800], [-80, -700], [-64, -700], [-66, -800], [-44, -930]], 3), 14, 6), hairC, { seed: sd + 39, inset: 3, slit: 1.6 });
    PC.piece(g, SM(HEAD, 4), hc, { seed: sd + 43, inset: inset * 0.7, slit, holes: faceHoles(o.face || 'still', !!o.blindfold) });
    if (o.hair === 'bun' || o.hair === 'braid' || o.hair === 'cap') PC.piece(g, SM([[-66, -930], [-60, -990], [-28, -1022], [16, -1028], [50, -1008], [60, -986], [28, -994], [-4, -984], [-30, -958], [-44, -920]], 4), hairC, { seed: sd + 45, inset: 0, holes: [PC.slit(-20, -1006, 30, -1004, 2)] });
    if (o.beard) { const L = o.beard === 'long' ? 170 : 50; PC.piece(g, PC.saw(SM([[72, -872], [66, -850], [40, -846 + L * 0.6], [10, -846 + L], [-6, -846 + L * 0.7], [-10, -870], [20, -864], [50, -862]], 3), 14, 7), o.beardCol || hairC, { seed: sd + 44, holes: [PC.slit(30, -840, 14, -846 + L * 0.8, 2)] }); }
    if (o.earring !== false) PC.piece(g, PC.ell(-12, -896, 11, 11, 12), o.earCol || PC.C.cream, { seed: sd + 46, holes: [PC.crescent(-12, -896, 6, 0, 0.5, 8)] });
    if (o.blindfold) {   // the cream band across the eyes (CE 1.103.13), two tails behind the head
      PC.piece(g, SM([[-62, -962], [68, -966], [74, -928], [-60, -930]], 3), PC.C.cream, { seed: sd + 47, holes: [PC.slit(-40, -948, 50, -948, 1.8)] });
      PC.piece(g, SM([[-60, -958], [-120, -920], [-140, -860], [-118, -866], [-100, -910], [-58, -936]], 3), PC.C.cream, { seed: sd + 48 });
    }
    if (o.crown) {
      const cr = PC.saw(PC.dense([[54, -1000], [-56, -990]], 10), 18, 34).concat([[-58, -960], [56, -970]]);
      PC.piece(g, cr, o.crownCol || PC.C.deep, { seed: sd + 49, inset: 3, slit: 1.8, holes: [PC.ell(0, -982, 7, 7, 8), PC.ell(30, -984, 5, 5, 8), PC.ell(-30, -980, 5, 5, 8)] });
    }
    if (o.topknot) PC.piece(g, SM(PC.ell(-30, -1030, 28, 22, 6), 3), hairC, { seed: sd + 50, holes: [PC.crescent(-30, -1030, 12, 1, 0.5, 8)] });
    const headM = g.getTransform();
    g.restore();
    const nearM = arm(g, shX + 4, shY + 20, po.sh ?? 0.2, po.el ?? 0.4, col, { seed: sd + 60, inset, slit, hand: po.hand || 'open', prop: o.prop, bare: !fem });
    g.restore();
    const top = hipY - 540;
    PC.reg(g, figs, o.id || kind, [-150, top, 170, 0], null, -top);
    { const m = headM, cx = m.a * 10 + m.c * -935 + m.e, cy = m.b * 10 + m.d * -935 + m.f; if (R.faces) R.faces.push({ x: cx / R.scale, y: cy / R.scale, r: 95 * Math.hypot(m.a, m.b) / R.scale }); }
    g.restore();
    return { nearM, farM, headM };
  };
  /** THE SIGNATURE's clock (local seconds), shared by the picture and tools/score_papercut.py (which computes the same numbers):
   *  the sheet unfolds on "hundred" (word 4); the cut, the three folds and the flattening are laid back from it. */
  PC.splitSchedule = (words) => {
    const un = Math.max(2.3, (words[4] ? words[4].t0 : 2.4) - 0.06), cut1 = un - 0.1, cut0 = cut1 - 0.7, fd = 0.3;
    const folds = [cut0 - 0.96, cut0 - 0.64, cut0 - 0.32];
    return { flat: folds[0] - 0.3, folds, foldDur: fd, cut: [cut0, cut1], unfold: un };
  };
  /** a point in a stored matrix (backing px) → logical px */
  PC.at = (m, x, y) => [(m.a * x + m.c * y + m.e) / R.scale, (m.b * x + m.d * y + m.f) / R.scale];

  // ── 8-fold rosette (one 45° wedge, mirrored by D4) ──
  /** draw holes defined in one wedge (angles 0..π/4) mirrored 8×: fn(g) draws wedge-local paths into the current path */
  PC.mirror8 = (g, cx, cy, fn) => {
    for (let k = 0; k < 4; k++) for (const f of [1, -1]) { g.save(); g.translate(cx, cy); g.rotate((k * Math.PI) / 2); g.scale(1, f); fn(g); g.restore(); }
  };
  PC.rosette = (g, cx, cy, r, col, o = {}) => {
    const sd = o.seed || 9;
    // the outline: a sawtooth-scalloped disc
    const n = o.teeth || 64, out = [];
    for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * TAU, rr = i % 2 ? r : r * (o.toothDepth ?? 0.93); out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    PC.piece(g, out, col, { seed: sd, wob: 1.2 });
    g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000';
    PC.mirror8(g, cx, cy, (q) => {
      q.beginPath();
      // ring 1 (yin): petal slits
      for (const a of [Math.PI / 16, (3 * Math.PI) / 16]) { const p = PC.slit(Math.cos(a) * r * 0.2, Math.sin(a) * r * 0.2, Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42, r * 0.035); PC.path(q, p); }
      // ring 2 (yang band): a band cut away leaving radial bridges
      { const a0 = 0.03, a1 = Math.PI / 4 - 0.03, r0 = r * 0.47, r1 = r * 0.53; q.moveTo(Math.cos(a0) * r0, Math.sin(a0) * r0); q.arc(0, 0, r0, a0, a1); q.lineTo(Math.cos(a1) * r1, Math.sin(a1) * r1); q.arc(0, 0, r1, a1, a0, true); q.closePath(); }
      // ring 3: crescents
      for (const a of [Math.PI / 16, (3 * Math.PI) / 16]) PC.path(q, PC.crescent(Math.cos(a) * r * 0.66, Math.sin(a) * r * 0.66, r * 0.07, a + Math.PI, 0.5, 10));
      // ring 4: lotus petals (a teardrop hole)
      { const a = Math.PI / 8, x = Math.cos(a) * r * 0.8, y = Math.sin(a) * r * 0.8; PC.path(q, PC.xf([[0, -1], [0.45, -0.3], [0.38, 0.4], [0, 1], [-0.38, 0.4], [-0.45, -0.3]], x, y, r * 0.075, a + Math.PI / 2)); }
      q.fill();
    });
    // the centre: a small eight-petal flower of slits
    g.beginPath(); for (let k = 0; k < 8; k++) { const a = (k * TAU) / 8 + Math.PI / 8; PC.path(g, PC.slit(cx + Math.cos(a) * r * 0.05, cy + Math.sin(a) * r * 0.05, cx + Math.cos(a) * r * 0.15, cy + Math.sin(a) * r * 0.15, r * 0.022)); } g.fill();
    g.restore();
  };

  // ── a pot (kumbha) with jali holes, local coords: base at (0,0), about 200 tall at s = 1 ──
  PC.potPts = () => PC.dense([[-26, -200], [26, -200], [24, -184], [40, -176], [40, -168], [26, -162], [80, -128], [100, -80], [86, -30], [50, -4], [-50, -4], [-86, -30], [-100, -80], [-80, -128], [-26, -162], [-40, -168], [-40, -176], [-24, -184]], 10);
  PC.potHoles = () => { const h = []; for (let k = -3; k <= 3; k++) h.push(PC.crescent(k * 24, -78, 10, Math.PI / 2, 0.55, 8)); for (let k = -2; k <= 2; k++) h.push(PC.xf([[0, -1], [0.5, 0], [0, 1], [-0.5, 0]], k * 28, -118, 13)); for (let k = -2; k <= 2; k++) h.push(PC.ell(k * 30 + 15, -40, 6, 6, 8)); return h; };

  // ── the subtitle strip ──
  PC.bannerPts = (x0, y0, x1, y1) => {
    const tail = 46, notch = 26, top = [], bot = [];
    for (let x = x0; x <= x1; x += 18) { top.push([x, y0 + ((x - x0) / 18) % 2 * 0]); }
    const P = [];
    P.push([x0 - tail, y0 - 4]);
    const nT = Math.round((x1 - x0) / 16);
    for (let i = 0; i <= nT; i++) { const x = lerp(x0, x1, i / nT); P.push([x, y0 + (i % 2 ? -5 : 0)]); }
    P.push([x1 + tail, y0 - 4]); P.push([x1 + tail - notch, (y0 + y1) / 2]); P.push([x1 + tail, y1 + 4]);
    for (let i = nT; i >= 0; i--) { const x = lerp(x0, x1, i / nT); P.push([x, y1 + (i % 2 ? 5 : 0)]); }
    P.push([x0 - tail, y1 + 4]); P.push([x0 - tail + notch, (y0 + y1) / 2]);
    return P;
  };

  // ═══════════════════════════════ TRANSITIONS (this film only) ═══════════════════════════════
  const run0 = KIT.transitions.run;
  KIT.transitions.run = (ctx, tr, k, T, drawOld, drawNew) => {
    if (tr.type !== 'peel' && tr.type !== 'turn') return run0(ctx, tr, k, T, drawOld, drawNew);
    if (R.probe) { R.probe.transitions = R.probe.transitions || {}; R.probe.transitions[tr.type] = (R.probe.transitions[tr.type] || 0) + 1; }
    const A = R.buffer('tr-a', W, H), B = R.buffer('tr-b', W, H);
    A.clear('#0b0806'); drawOld(A.ctx); R.resetCtx(A.ctx);
    B.clear('#0b0806'); drawNew(B.ctx); R.resetCtx(B.ctx);
    const e = E.inOutCubic(clamp(k));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(B.canvas, 0, 0); ctx.restore(); R.resetCtx(ctx);
    const back = tr.back || '#efe0c2';
    if (tr.type === 'peel') {
      // fold line perpendicular to the diagonal from the bottom-right corner, travelling to beyond the top-left corner
      const dx = -1 / Math.SQRT2, dy = -1 / Math.SQRT2, Lmax = (W + H) / Math.SQRT2 + 120, d = e * Lmax;
      const ox = W, oy = H;   // corner
      const lx = ox + dx * d, ly = oy + dy * d;   // a point on the fold line
      const side = (x, y) => (x - lx) * dx + (y - ly) * dy;   // > 0: not yet peeled (beyond the line toward the top-left)
      const big = 4000, px = -dy, py = dx;
      const keep = [[lx + px * big, ly + py * big], [lx + px * big + dx * big, ly + py * big + dy * big], [lx - px * big + dx * big, ly - py * big + dy * big], [lx - px * big, ly - py * big]];
      ctx.save(); ctx.beginPath(); PC.path(ctx, keep); ctx.clip(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(A.canvas, 0, 0); ctx.restore(); R.resetCtx(ctx);
      // the flap: the peeled part reflected over the fold line (its back), with a shadow on the new picture
      const corners = [[0, 0], [W, 0], [W, H], [0, H]].filter(([x, y]) => side(x, y) < 0);
      if (d > 0 && corners.length) {
        const refl = ([x, y]) => { const s = side(x, y); return [x - 2 * s * dx, y - 2 * s * dy]; };
        // the peeled polygon: frame ∩ half-plane side < 0
        const poly = clipHalf([[0, 0], [W, 0], [W, H], [0, H]], side);
        const fl = poly.map(refl);
        ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#000'; ctx.beginPath(); PC.path(ctx, fl.map(([x, y]) => [x + 14, y + 18])); ctx.fill(); ctx.restore();
        ctx.save(); ctx.beginPath(); PC.path(ctx, PC.wob(PC.dense(fl, 24), 5, 1.5)); ctx.fillStyle = PC.tex(back); ctx.fill();
        ctx.globalAlpha = 0.18 * (1 - e); ctx.fillStyle = '#3a1a10'; ctx.fill(); ctx.restore();
      }
    } else {
      // a page turned on its left edge: the old picture narrows toward the spine (front, darkening), then its back narrows away
      const th = e * Math.PI, c = Math.cos(th), sc = R.scale;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 0.35 * Math.sin(th); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, (W * Math.abs(c) + 46) * sc, H * sc); ctx.restore();
      ctx.save();
      if (c > 0) { ctx.setTransform(c, 0, 0, 1, 0, 0); ctx.drawImage(A.canvas, 0, 0); ctx.setTransform(sc * c, 0, 0, sc, 0, 0); ctx.globalAlpha = 0.5 * (1 - c); ctx.fillStyle = '#1a0a08'; ctx.fillRect(0, 0, W, H); }
      else { ctx.setTransform(sc * -c, 0, 0, sc, 0, 0); ctx.beginPath(); PC.path(ctx, PC.wob(PC.dense([[0, 0], [W, 0], [W, H], [0, H]], 40), 8, 2)); ctx.fillStyle = PC.tex(back); ctx.fill(); ctx.globalAlpha = 0.35 * (1 + c); ctx.fillStyle = '#3a1a10'; ctx.fill(); }
      ctx.restore(); R.resetCtx(ctx);
    }
  };
  function clipHalf(poly, side) {   // keep side < 0
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], sa = side(...a), sb = side(...b);
      if (sa < 0) out.push(a);
      if ((sa < 0) !== (sb < 0)) { const t = sa / (sa - sb); out.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t)]); }
    }
    return out;
  }
  PC.clipHalf = clipHalf;
})();
