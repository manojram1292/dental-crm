/* THE FULL-EPIC TRAILER, SECOND CUT · "Mahabharatam: As Vyasa Told It" (script/trailer.en.json; pipeline number 97, never a
 * numbered episode). ONE SCENE PER SHOT: every script line is a shot, built to the plan in script/TRAILER-EDIT.md; every image
 * was read in the Critical Edition first (script/TRAILER-CHECK.md). Loads after ep41/_common (EP41), ep46/_common and
 * ep49/_common (EP49.boat). Figures: src/kit/characters/epic-cast.js.
 *
 * Rules of this cut:
 *   · every camera move has a job (a push-in on a decision, a pull-back on a consequence, a cut three frames after an impact);
 *     no two neighbouring shots use the same move; nothing ever stands still (the gate fails a freeze over 0.3 s);
 *   · THE SPINE: the chariot between the armies (fieldWorld) in one blue-iron light: the opening, three wordless inserts, each
 *     closer, the turn, and the start of the universal form;
 *   · Krishna's lit face is withheld until the universal form: before it he is a dark shape, in profile or from behind;
 *   · captions are drawn here, not by kit/captions.js: one phrase at a time, at most two rows, cut with the shot (never after
 *     it), none on an insert; a plaque's box and letters arrive together.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, ST = KIT.stage, CAM = KIT.cam, ACT = KIT.act, TY = KIT.type, CH = KIT.characters, EP41 = window.EP41, EP49 = window.EP49;
  const { TAU, clamp, lerp, E, hash, PAL } = R;
  const W = R.W, H = R.H, GY = EP41.GY;
  const fin = (ctx, T) => ST.finish(ctx, T, {});
  const lit = (p, from, x, front = 0.8, k = 1.15, o = {}) => ({ ...ST.light(p, { from, at: [x, GY], front, k }), fill: 0.3, ...o });
  const dark = (p, from, x, o = {}) => ({ ...ST.backlight(p, { from, at: [x, GY], front: 0.03, fill: 0.03, warm: o.warm || '#ffd070' }), ...o });   // a shape with a rim: the face is not lit
  // A figure is painted into a buffer at its own scale and then laid in: under a zoomed camera it would be enlarged and go soft.
  // So it is painted q times larger (q = the zoom on this canvas, in steps of √2 so that few buffers are made) and laid in at 1/q.
  const fig = (id, g, T, x, y, s, facing, pose, L, ex, key) => { const m = g.getTransform(), eff = Math.hypot(m.a, m.b) / R.scale; let q = eff > 1.25 ? Math.pow(2, Math.round(Math.log2(eff) * 2) / 2) : 1; q = Math.max(1, Math.min(q, 2.8 / s));
    if (q === 1) return CH[id].draw(g, { x, y, scale: s, facing, pose, light: L, expression: ex || { emo: 'calm' }, t: T, key: key || id });
    g.save(); g.scale(1 / q, 1 / q); CH[id].draw(g, { x: x * q, y: y * q, scale: s * q, facing, pose, light: L, expression: ex || { emo: 'calm' }, t: T, key: key || id }); g.restore(); };
  // a figure as a SHAPE: drawn aside, darkened to `a`, then laid in. Krishna before the universal form: no lit face.
  const shape = (g, a, col, draw, noProbe) => { const b = R.buffer('tr-shape', W, H); b.clear(); const q = b.ctx, pr = R.probe;
    if (pr && pr.figures && !noProbe) {   // the gate's contrast probe reads the ground under a figure from the canvas it is drawn on: give it the picture, and the darkened colour
      const n0 = pr.figures.length, c = [parseInt(col.slice(1, 3), 16), parseInt(col.slice(3, 5), 16), parseInt(col.slice(5, 7), 16)];
      q.save(); q.setTransform(1, 0, 0, 1, 0, 0); q.drawImage(g.canvas, 0, 0); q.restore(); q.save(); q.setTransform(g.getTransform()); draw(q); q.restore(); R.resetCtx(q);
      for (let k = n0; k < pr.figures.length; k++) pr.figures[k].fig = pr.figures[k].fig.map((v, i) => v * (1 - a) + c[i] * a);
      b.clear(); }
    R.probe = null; q.save(); q.setTransform(g.getTransform()); draw(q); q.restore(); R.resetCtx(q); R.probe = pr;
    q.save(); q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-atop'; q.globalAlpha = a; q.fillStyle = col; q.fillRect(0, 0, b.canvas.width, b.canvas.height); q.restore();
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(b.canvas, 0, 0); g.restore(); };
  const beat = (env, i, d) => env.beats[i] ?? d;
  const bare = (pose) => ({ ...pose, bare: true });
  const ss = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
  const SPOT = [540, 1000];   // the round thing of the three rhymed shots sits here: the basket, the dice, the wheel

  // ── the camera: a move of a named type (reported to the gate's probe) from one framing to another. A framing is
  //    { z, f: [world x, y on the figures' plane], s: [where that point sits on screen] } ──
  const frame = (type, u, a, b, ease = E.inOutSine) => { const c = CAM[type](0, {}), e = ease(clamp(u));
    const z = Math.exp(lerp(Math.log(a.z), Math.log(b.z), e)), fx = lerp(a.f[0], b.f[0], e), fy = lerp(a.f[1], b.f[1], e), sx = lerp((a.s || [540, 960])[0], (b.s || [540, 960])[0], e), sy = lerp((a.s || [540, 960])[1], (b.s || [540, 960])[1], e);
    return { ...c, zoom: z, px: fx - W / 2 - (sx - W / 2) / z, py: fy - H / 2 - (sy - H / 2) / z, rot: 0 }; };
  const ev = (f) => (u) => 0.55 * f(u) + 0.45 * u;   // an eased move that never comes to rest (a camera at rest reads as a freeze)
  const shake = (c, T, amt) => ({ ...c, px: c.px + amt * Math.sin(T * 37), py: c.py + amt * 0.7 * Math.sin(T * 29 + 1) });

  // ── THE CAPTION: one phrase at a time, large, in the fixed band; it appears with its first word and is gone with its shot ──
  const phrasesOf = (L) => { if (L._ph) return L._ph; const out = []; let cur = [];
    L.words.forEach((w, i) => { cur.push(i); if (/[.!?]["”’)]?$/.test(w.w) || i === L.words.length - 1) { out.push(cur); cur = []; } });
    const keep = L.capOnly ? out.slice(0, L.capOnly) : out; return (L._ph = keep.map((ix) => ({ ix, t0: L.words[ix[0]].t0, t1: L.words[ix[ix.length - 1]].t1 }))); };
  const capCore = (w) => w.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
  R.overlay = (ctx, T) => {
    const i = R.lineIndexAt(T), L = R.lines[i];
    if (!L || L.caption === false || !L.text) return;
    const ph = phrasesOf(L); let k = -1;
    for (let q = 0; q < ph.length; q++) if (T >= Math.max(L.start, ph[q].t0 - 0.06)) k = q;
    if (k < 0) return;
    const P = ph[k], tIn = Math.max(L.start, P.t0 - 0.06), last = k === ph.length - 1;
    const vis = clamp((T - tIn) / 0.09) * (last ? 1 - clamp((T - (P.t1 + 0.55)) / 0.2) : 1);
    if (vis <= 0.004) return;
    const big = !!L.fast || P.ix.length <= 4, emph = (L.emphasis || []).map(capCore);
    let size = big ? 82 : 68, rows, space;
    for (;;) { ctx.save(); ctx.font = R.font(size, 'caption', 700); space = ctx.measureText(' ').width; rows = [[]]; let x = 0;
      for (const wi of P.ix) { const w = L.words[wi].w, ww = ctx.measureText(w).width; if (x > 0 && x + ww > 800) { rows.push([]); x = 0; } rows[rows.length - 1].push({ wi, w, x, ww }); x += ww + space; }
      ctx.restore(); if (rows.length <= 2 || size <= 50) break; size -= 4; }
    const lineH = size * 1.2, bottom = 1400, top = bottom - (rows.length - 1) * lineH, CX = KIT.CX;
    if (R.probe) R.probe.cap = { line: L.id, alpha: vis, rows: rows.length };
    ctx.save(); ctx.globalAlpha = vis * 0.95; const g = ctx.createLinearGradient(0, top - 190, 0, bottom + 120);
    g.addColorStop(0, 'rgba(10,7,6,0)'); g.addColorStop(0.45, 'rgba(10,7,6,0.8)'); g.addColorStop(0.8, 'rgba(10,7,6,0.8)'); g.addColorStop(1, 'rgba(10,7,6,0)');
    ctx.fillStyle = g; ctx.fillRect(0, top - 190, W, bottom + 120 - (top - 190)); ctx.restore();
    ctx.save(); ctx.font = R.font(size, 'caption', 700); ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    const pop = 1 + 0.04 * (1 - E.outCubic(clamp((T - tIn) / 0.16)));
    ctx.translate(CX, top - size * 0.3); ctx.scale(pop, pop); ctx.translate(-CX, -(top - size * 0.3));
    rows.forEach((row, r) => { const lastW = row[row.length - 1], x0 = CX - (lastW.x + lastW.ww) / 2, y = top + r * lineH;
      for (const w of row) { const wt = L.words[w.wi], sp = clamp((T - wt.t0) / 0.07) * (1 - clamp((T - wt.t1) / 0.3)), gold = emph.some((e) => e && capCore(w.w).startsWith(e));
        ctx.globalAlpha = vis; ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(12,8,6,0.9)'; ctx.strokeText(w.w, x0 + w.x, y);
        ctx.fillStyle = gold ? R.mix(PAL.gold, '#ffe6a6', 0.25 + 0.6 * sp) : R.mix(PAL.cream, '#fff2c8', sp * 0.9); ctx.fillText(w.w, x0 + w.x, y); } });
    ctx.restore();
  };

  // ── THE PLAQUE: box and letters together, in four frames; it leaves with the shot ──
  const plq = (ctx, env, t, name, x, y, at = 0.3) => { const k = clamp((t - at) / 0.13); if (k <= 0) return;
    const ep = env.script.names[name] || '', size = 54, e = E.outCubic(k);
    ctx.save(); ctx.font = R.font(size, 'display', 700); ctx.letterSpacing = '5px'; const tw = ctx.measureText(name.toUpperCase()).width;
    ctx.font = R.font(30, 'caption', 600); ctx.letterSpacing = '0px'; const ew = ctx.measureText(ep).width, w = Math.max(tw, ew) + 70, h = 132;
    x = clamp(x, 30 + w / 2, W - 30 - w / 2);
    ctx.translate(x, y); ctx.scale(lerp(1.08, 1, e), lerp(1.08, 1, e)); ctx.globalAlpha = e;
    ctx.fillStyle = 'rgba(14,8,6,0.88)'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.fillStyle = PAL.gold; ctx.fillRect(-w / 2, -h / 2, w, 4); ctx.fillRect(-w / 2, h / 2 - 4, w, 4);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(6);
    ctx.font = R.font(size, 'display', 700); ctx.letterSpacing = '5px'; ctx.fillStyle = PAL.goldPale; ctx.fillText(name.toUpperCase(), 2, 8);
    ctx.font = R.font(30, 'caption', 600); ctx.letterSpacing = '0px'; ctx.fillStyle = PAL.cream; ctx.fillText(ep, 0, 48);
    ctx.restore(); };

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
    g.strokeStyle = '#2a140a'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(120, -230); g.lineTo(620, -300); g.stroke();
    g.fillStyle = body; g.beginPath(); g.moveTo(-250, -230); g.lineTo(-270, -470); g.lineTo(-210, -470); g.lineTo(-180, -330); g.lineTo(190, -330); g.quadraticCurveTo(250, -330, 250, -230); g.closePath(); g.fill();
    g.fillStyle = trim; g.fillRect(-250, -246, 500, 14); g.fillRect(-274, -482, 70, 14);
    if (o.flag) { g.fillStyle = '#2a140a'; g.fillRect(-262, -1010, 12, 540); g.fillStyle = o.flag; g.beginPath(); g.moveTo(-250, -1000); g.lineTo(-60 + 16 * Math.sin(T * 4), -950 + 10 * Math.sin(T * 5.3)); g.lineTo(-250, -880); g.fill(); }
    g.save(); g.translate(0, -170); g.rotate((o.roll ?? 0)); g.strokeStyle = '#1a0c06'; g.lineWidth = 30; g.beginPath(); g.arc(0, 0, 160, 0, TAU); g.stroke(); g.strokeStyle = trim; g.lineWidth = 8; g.beginPath(); g.arc(0, 0, 160, 0, TAU); g.stroke();
    g.strokeStyle = '#3a1c0c'; g.lineWidth = 14; for (let i = 0; i < 8; i++) { const an = (i / 8) * TAU; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(an) * 150, Math.sin(an) * 150); g.stroke(); } g.fillStyle = trim; g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.fill(); g.restore();
    g.restore(); };
  // a line of an army, far off: heads, spears and a few banners (dir: the way it faces)
  const army = (g, x0, x1, y, n, dir, col, T, o = {}) => { for (let i = 0; i < n; i++) { const u = i / (n - 1), x = lerp(x0, x1, u) + 8 * (hash(i, 3) - 0.5) + (o.march || 0), yy = y + 16 * (hash(i, 4) - 0.5), s = (o.s ?? 1) * (0.9 + 0.2 * hash(i, 5)), bob = 4 * Math.sin(T * 3 + i);
      g.fillStyle = col; g.beginPath(); g.ellipse(x, yy - 60 * s + bob, 22 * s, 62 * s, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(x + dir * 5 * s, yy - 138 * s + bob, 19 * s, 0, TAU); g.fill();
      g.strokeStyle = o.spear || '#d8dcf0'; g.lineWidth = 4 * s; g.beginPath(); g.moveTo(x + dir * 24 * s, yy - 10 * s); g.lineTo(x + dir * (50 + 6 * Math.sin(T * 2 + i)) * s, yy - 290 * s + bob); g.stroke();
      if (i % 5 === 2) { g.fillStyle = o.flag || '#c8401a'; g.beginPath(); g.moveTo(x + dir * 50 * s, yy - 290 * s); g.lineTo(x + dir * (50 + 90) * s, yy - 262 * s + 9 * Math.sin(T * 4 + i)); g.lineTo(x + dir * 46 * s, yy - 232 * s); g.fill(); } } };
  // rows of seated listeners (a court, the hall): dark shapes with a rim; `bow` tips the heads down
  const court = (g, y, col, rimc, bow = 0, n = 9, T = 0) => { for (let r = 0; r < 2; r++) for (let i = 0; i < n; i++) { const x = -40 + i * (1160 / (n - 1)) + r * 60, yy = y + r * 80 + 2 * Math.sin(T * 1.7 + i + r); g.fillStyle = col; g.beginPath(); g.ellipse(x, yy - 60, 56, 70, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(x + 14 * bow, yy - 150 + 26 * bow, 34, 0, TAU); g.fill(); g.strokeStyle = rimc; g.lineWidth = 3; g.beginPath(); g.arc(x + 14 * bow, yy - 150 + 26 * bow, 34, -2.4, -0.6); g.stroke(); } };
  const fires = (g, T, hz, n, seedK = 0) => { for (let i = 0; i < n; i++) { const u = hash(i, 61 + seedK), d = u * u, x = -100 + 1280 * hash(i, 62 + seedK), y = lerp(hz + 20, 1900, d), s = lerp(0.25, 1.5, d), fl = KIT.flicker(T, i);
      KIT.glow(g, x, y - 40 * s, 240 * s, '#ff7a1e', 0.42 * fl); for (const [c, q] of [['#c8341a', 1], ['#f08a24', 0.68], ['#ffe08a', 0.36]]) { g.fillStyle = c; g.beginPath(); g.moveTo(x - 34 * s * q, y); g.quadraticCurveTo(x - 40 * s * q, y - 60 * s * q, x + 8 * s * Math.sin(T * 5 + i), y - (130 + 18 * Math.sin(T * 7 + i)) * s * q); g.quadraticCurveTo(x + 40 * s * q, y - 60 * s * q, x + 34 * s * q, y); g.fill(); }
      g.fillStyle = '#1a100c'; g.fillRect(x - 46 * s, y - 4 * s, 92 * s, 12 * s); } };
  const flames = (g, T, x0, x1, y, h, n, k = 1) => { for (let i = 0; i < n; i++) { const x = lerp(x0, x1, i / (n - 1)), hh = h * (0.6 + 0.4 * hash(i, 3)) * k * (0.8 + 0.2 * Math.sin(T * 7 + i)); for (const [c, q] of [['#c8341a', 1], ['#f08a24', 0.7], ['#ffe08a', 0.4]]) { g.fillStyle = c; g.beginPath(); g.moveTo(x - 56 * q, y); g.quadraticCurveTo(x - 60 * q, y - hh * q * 0.5, x + 18 * Math.sin(T * 5 + i), y - hh * q); g.quadraticCurveTo(x + 60 * q, y - hh * q * 0.5, x + 56 * q, y); g.fill(); } } };

  // ══ THE SPINE: the chariot standing between the two armies (CE 6.23.21: senayor ubhayor madhye). One light, one palette. ══
  //    o = { bow: 0..1 (the bow leaving his hand, 6.23.47), sit: 0..1, turn: 0..1 (Krishna turning to him), noKrishna, glow }
  const AR = [690, GY - 215, 0.74], KR = [450, GY - 215, 0.74];
  const fieldWorld = (ctx, T, cam, o = {}) => {
    const bow = o.bow || 0, sit = o.sit || 0, turn = o.turn || 0;
    ST.shot(ctx, T, { pal: 'war-iron', cam, layers: [
      { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 1180 }); KIT.glow(g, 560, 1150, 1050, '#ffb890', 0.55); KIT.glow(g, 560, 1160, 420, '#ffe0c0', 0.5); g.fillStyle = '#ffd0a0'; g.beginPath(); g.arc(560, 1168, 84, Math.PI, TAU); g.fill(); } },
      { z: 0.2, draw: (g, p) => ST.cloudBank(g, p, T, { y: 300, count: 7, speed: 26, color: '#34344e', alpha: 0.9, size: 1.7 }) },
      { z: 0.4, draw: (g) => { army(g, -560, 330, 1200, 24, 1, '#12122a', T, { s: 0.7, flag: '#e7b54a' }); army(g, 750, 1640, 1200, 24, -1, '#1e1226', T, { s: 0.7 }); } },
      { z: 0.7, draw: (g) => { army(g, -620, 290, 1262, 18, 1, '#0c0c1e', T, { s: 1.0, flag: '#e7b54a' }); army(g, 800, 1700, 1262, 18, -1, '#140a1a', T, { s: 1.0 }); } },
      { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 40, color: '#3a3448', color2: '#0e0c18' });
        if (bow > 0) { g.save(); g.translate(742, lerp(GY - 700, GY - 60, bow * bow)); g.rotate(1.25 * bow + 0.2); g.strokeStyle = '#1a1008'; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(30, -300); g.quadraticCurveTo(-120, 0, 30, 300); g.stroke(); g.strokeStyle = '#e7b54a'; g.lineWidth = 12; g.stroke(); g.restore(); }
        const ap = { w: { stand: 1 - sit, sit: 0.9 * sit, grieve: 0.55 * sit + 0.25 * bow * (1 - sit) }, bare: bow > 0 };
        fig('epicArjuna', g, T, AR[0], AR[1], AR[2], 'left', ap, lit(p, [560, 900], 640, 0.62, 1.2, { tint: ['#ffc8a0', 0.4] }), { emo: sit > 0.4 ? 'sorrow' : 'fear', gaze: [0.5, 0.2 + 0.5 * sit] }, 'fw-a');
        if (!o.noKrishna) { const sx = Math.cos(Math.PI * E.inOutSine(turn));   // he turns on the spot: the shape narrows and opens the other way
          g.save(); g.translate(KR[0], 0); g.scale(Math.max(0.08, Math.abs(sx)), 1); g.translate(-KR[0], 0);
          shape(g, 0.86, '#080a1c', (q) => fig('epicKrishna', q, T, KR[0], KR[1], KR[2], sx > 0 ? 'left' : 'right', { w: { stand: 1 - 0.5 * turn, offer: 0.5 * turn } }, dark(p, [560, 1000], KR[0], { warm: '#ffc890' }), { emo: 'calm', gaze: [0.8, 0.1] }, 'fw-k')); g.restore(); }
        chariot(g, 560, GY + 10, 1.0, -1, T, { flag: '#f0c020' }); } },
      { z: 1.3, haze: false, draw: (g) => ST.particles(g, T * 1.8, { kind: 'dust', count: 110, cam }) },
    ] });
  };

  // ── 0 · TITLE (no voice): from above the spears, down through the banners toward the red dawn; the name arrives large ──
  R.scene({ id: 'title',
    draw(ctx, t, env) {
      const T = env.T, S = env.strings, u = t / env.dur, cam = frame('crane', u, { z: 1.5, f: [540, 420] }, { z: 1.06, f: [540, 930] }, ev(E.outCubic)), mar = 130 * t;
      ST.shot(ctx, T, { pal: 'war-iron', cam, layers: [
        { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 1240 }); const rise = lerp(1330, 1150, E.outCubic(u)); KIT.glow(g, 540, rise, 1200, '#ff5a2a', 0.55); KIT.glow(g, 540, rise, 480, '#ffc890', 0.6); g.fillStyle = '#ff9a5a'; g.beginPath(); g.arc(540, rise, 150, 0, TAU); g.fill(); g.fillStyle = PAL.soot; g.fillRect(-900, 1240, 2880, 1500); } },
        { z: 0.2, draw: (g, p) => ST.cloudBank(g, p, T, { y: 380, count: 8, speed: 90, color: '#2a2a48', alpha: 0.92, size: 1.7 }) },
        { z: 0.45, draw: (g) => { army(g, -900, 1900, 1250, 46, 1, '#16162e', T, { s: 0.75, flag: '#e7b54a', march: (mar * 0.5) % 61 }); } },
        { z: 0.75, draw: (g) => { army(g, -900, 1900, 1340, 30, 1, '#0c0c1e', T, { s: 1.25, flag: '#c8401a', march: mar % 96 }); } },
        { z: 1, haze: false, draw: (g) => { g.fillStyle = '#07060e'; g.fillRect(-900, 1420, 2880, 1500); army(g, -900, 1900, 1560, 18, 1, '#05050c', T, { s: 2.3, flag: '#e7b54a', spear: '#8a90b0', march: (mar * 1.6) % 164 }); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 70, cam }) },
        { z: 1.6, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 34, cam }) },
      ] });
      // the name: struck in on the second drum, fully there by 1.2 s
      const a = clamp((t - 0.32) / 0.5), y = 760, sc = lerp(1.1, 0.97, E.outCubic(clamp((t - 0.32) / 1.0))) * (1 + 0.035 * u);
      ctx.save(); ctx.globalAlpha = a; const gr = ctx.createLinearGradient(0, y - 300, 0, y + 250); gr.addColorStop(0, 'rgba(6,5,12,0)'); gr.addColorStop(0.35, 'rgba(6,5,12,0.78)'); gr.addColorStop(0.72, 'rgba(6,5,12,0.78)'); gr.addColorStop(1, 'rgba(6,5,12,0)'); ctx.fillStyle = gr; ctx.fillRect(0, y - 300, W, 550); ctx.restore();
      ctx.save(); ctx.translate(540, y - 30); ctx.scale(sc, sc); ctx.translate(-540, -(y - 30));
      KIT.goldText(ctx, (S.seriesTitle || '').toUpperCase(), 540, y, { size: 108, spacing: 6, weight: 700, alpha: a, glow: 0.45, sheen: ((t * 0.55) % 1.6) * 1.4 - 0.4, key: 'tr-title' });
      const k2 = E.outCubic(clamp((t - 1.7) / 0.4));
      if (k2 > 0) { ctx.globalAlpha = k2; ctx.fillStyle = PAL.gold; ctx.fillRect(540 - 250 * k2, y + 40, 500 * k2, 3); KIT.goldText(ctx, (S.seriesSubtitle || '').toUpperCase(), 540, y + 108, { size: 44, spacing: 12, weight: 600, alpha: k2, glow: 0.25, key: 'tr-sub' }); }
      ctx.restore();
      if (R.probe) R.probe.title = { alpha: a, box: [70, y - 100, 1010, y + 24] };
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.3 }) });

  // ── 1 · FIELD, NOW (CE 6.23.21, 6.23.47, 6.24.9): down the banner to the one chariot between the armies ──
  R.scene({ id: 'field',
    draw(ctx, t, env) {
      const T = env.T, u = t / env.dur, cam = frame('tilt', u, { z: 1.5, f: [560, 420], s: [540, 700] }, { z: 1.12, f: [570, 900], s: [540, 900] }, ev(E.outCubic));
      fieldWorld(ctx, T, cam, { bow: 0.34 * ss(0.5, 1.0, u), turn: ss(0.55, 1.0, u) });
      plq(ctx, env, t, 'Arjuna', 760, 330, env.dur * 0.45);
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.3 }) });

  // ── INSERTS (wordless): the same chariot, each time closer. A: wide. B: the two figures. C: the hand on the bow. ──
  R.scene({ id: 'insA', draw(ctx, t, env) { const T = env.T; fieldWorld(ctx, T, frame('push', t / env.dur, { z: 1.0, f: [560, 930] }, { z: 1.07, f: [560, 930] }, (x) => x), { bow: 0.36 + 0.03 * t, turn: 1 }); fin(ctx, T); }, post: () => ({ bloom: 0.36, vignette: 0.55, paper: 0.3 }) });
  R.scene({ id: 'insB', draw(ctx, t, env) { const T = env.T; fieldWorld(ctx, T, frame('push', t / env.dur, { z: 1.9, f: [585, 700], s: [540, 800] }, { z: 2.08, f: [585, 700], s: [540, 800] }, (x) => x), { bow: 0.4 + 0.04 * t, turn: 1 }); fin(ctx, T); }, post: () => ({ bloom: 0.36, vignette: 0.55, paper: 0.3 }) });
  const handShot = (ctx, T, t, dur) => {   // the hand opening on the bow (6.23.47: visṛjya saśaraṃ cāpam)
    const u = t / dur, open = E.inOutSine(clamp(u * 1.15)), cam = frame('push', u, { z: 1.0, f: [540, 960] }, { z: 1.1, f: [560, 900] }, (x) => x), slip = 150 * open * open;
    ST.shot(ctx, T, { pal: 'war-iron', cam, layers: [
      { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 1500 }); KIT.glow(g, 300, 1250, 1200, '#ffb890', 0.6); } },
      { z: 0.4, soft: 0.6, draw: (g) => army(g, -300, 1400, 1700, 9, 1, '#12122a', T, { s: 3.2, flag: '#e7b54a' }) },
      { z: 1, haze: false, draw: (g) => {
        // the bow: a great gold curve through the frame, slipping down
        g.save(); g.translate(0, slip); g.lineCap = 'round'; g.strokeStyle = '#1a1008'; g.lineWidth = 110; g.beginPath(); g.moveTo(760, -500); g.quadraticCurveTo(330, 900, 800, 2300); g.stroke(); g.strokeStyle = '#e7b54a'; g.lineWidth = 74; g.stroke(); g.strokeStyle = '#fff0c0'; g.lineWidth = 12; g.beginPath(); g.moveTo(735, -500); g.quadraticCurveTo(305, 900, 775, 2300); g.stroke();
        g.strokeStyle = '#fff8e0'; g.lineWidth = 7; g.beginPath(); g.moveTo(905, -500); g.lineTo(905, 2300); g.stroke(); g.restore();
        // the forearm from the right, the palm, four fingers and a thumb letting go
        const skin = '#b8845a', sh = '#6a4428';
        g.fillStyle = '#f4f4ec'; g.beginPath(); g.moveTo(1500, 760); g.lineTo(930, 850); g.lineTo(930, 1090); g.lineTo(1500, 1190); g.fill(); g.fillStyle = '#3a8a4a'; g.fillRect(930, 850, 46, 240);
        g.fillStyle = sh; g.beginPath(); g.ellipse(760, 975, 190, 150, 0, 0, TAU); g.fill(); g.fillStyle = skin; g.beginPath(); g.ellipse(770, 962, 180, 138, 0, 0, TAU); g.fill();
        for (let i = 0; i < 4; i++) { g.save(); g.translate(640 - i * 6, 868 + i * 62); g.rotate(Math.PI - 0.5 + 1.0 * open + 0.08 * i + 0.03 * Math.sin(T * 9 + i)); g.fillStyle = sh; g.beginPath(); g.roundRect(-10, -30, 250, 60, 30); g.fill(); g.fillStyle = skin; g.beginPath(); g.roundRect(-10, -34, 244, 54, 27); g.fill(); g.restore(); }
        g.save(); g.translate(800, 850); g.rotate(-2.0 - 0.6 * open); g.fillStyle = skin; g.beginPath(); g.roundRect(0, -30, 210, 62, 30); g.fill(); g.restore();
        g.fillStyle = '#e7b54a'; g.fillRect(900, 846, 30, 250); } },
      { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 40, cam }) },
    ] });
  };
  R.scene({ id: 'insC', draw(ctx, t, env) { handShot(ctx, env.T, t, env.dur); fin(ctx, env.T); }, post: () => ({ bloom: 0.36, vignette: 0.55, paper: 0.3 }) });

  // ── 2 · VOW (CE 1.94.86–90): a slow push-in on the prince as the hand goes up; flowers begin to fall ──
  const vowWorld = (ctx, T, t, cam, b0, fall) => ST.shot(ctx, T, { pal: 'island-gold', cam, layers: [
    { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1120, sun: [300, 760, 110] }) },
    { z: 0.2, draw: (g, p) => { ST.cloudBank(g, p, T, { y: 380, count: 5, size: 1.4, speed: 14 }); ST.hills(g, p, { y: 1120, h: 300, seed: 12 }); } },
    { z: 0.5, draw: (g, p) => { ST.water(g, p, { y0: 1120, y1: 1420, T, flow: 130, count: 90 }); EP49.boat(g, 760, 1260 + 4 * Math.sin(T * 1.6), 0.6); } },
    { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 30 });
      fig('dasha', g, T, 850, GY + 20, 0.84, 'left', ACT.pose(t, [[0, 'stand'], [b0 + 0.2, 'anjali', { act: 0.5 }]], { prop: false }), lit(p, [300, 700], 850, 0.75), { emo: ACT.emo(t, [[0, 'calm'], [b0 + 0.3, 'wonder']]), gaze: [0.8, -0.1] }, 'vw-d');
      fig('epicDevavrata', g, T, 360, GY + 24, 0.9, 'right', ACT.pose(t, [[0, 'stand'], [b0 - 0.55, 'raise', { antic: 0.2, act: 0.3, an: 0.1 }]]), lit(p, [300, 700], 360, 0.8, 1.2), { emo: 'resolve', gaze: [0.8, 0] }, 'vw-b'); } },
    { z: 1.3, haze: false, draw: (g) => { ST.particles(g, T * 1.5, { kind: 'pollen', count: 50, cam }); ST.particles(g, T, { kind: 'petal', count: Math.round(80 * fall) + 2, cam }); } },
    { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => ST.grass(g, p, { y: 1960, h: 300, T, count: 40 }) },
  ] });
  R.scene({ id: 'vow', transition: { type: 'lamp', dur: 0.4, from: [500, 300], to: [420, 520] },
    draw(ctx, t, env) {
      const T = env.T, b0 = env.speech[0] + 0.55 * (env.speech[1] - env.speech[0]), cam = frame('push', t / env.dur, { z: 1.0, f: [560, 880] }, { z: 1.85, f: [400, 640], s: [470, 760] }, (x) => x);
      vowWorld(ctx, T, t, cam, b0, clamp((t - b0) / 1.0));
      plq(ctx, env, t, 'Bhishma', 700, 262, 0.5);
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.42, paper: 0.3 }) });

  // ── 3 · RIVER (CE 1.104.10–15; 3.292.6–7): the basket, close; the pull-back, and the river takes it ──
  R.scene({ id: 'river',
    draw(ctx, t, env) {
      const T = env.T, u = t / env.dur, bx = lerp(560, 800, E.inOutSine(u)), by = 1150 + 8 * Math.sin(T * 1.7);
      const cam = frame('pull', u, { z: 2.2, f: [560, 1080], s: SPOT }, { z: 1.0, f: [540, 1000], s: [540, 1000] }, ev(E.inOutCubic));
      ST.shot(ctx, T, { pal: 'riverbank-pearl', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 960, sun: [820, 900, 130], sunColor: '#fff0c0' }) },
        { z: 0.2, draw: (g, p) => { ST.cloudBank(g, p, T, { y: 360, count: 5, size: 1.4, speed: 12 }); ST.hills(g, p, { y: 960, h: 240, seed: 22 }); } },
        { z: 0.45, draw: (g, p) => ST.treeline(g, p, { y: 980, h: 300, T, seed: 23, kind: 'mixed' }) },
        { z: 0.7, haze: false, draw: (g, p) => { ST.water(g, p, { y0: 980, y1: 2100, T, flow: 170, count: 150 }); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35; g.fillStyle = '#ffe0a0'; g.beginPath(); g.moveTo(760, 980); g.lineTo(880, 980); g.lineTo(1040, 1900); g.lineTo(560, 1900); g.fill(); g.restore(); } },
        { z: 1, haze: false, draw: (g, p) => {
          KIT.glow(g, bx, by - 70, 420, '#ffd060', 0.6);
          g.fillStyle = '#fff4dc'; g.beginPath(); g.ellipse(bx, by - 78, 96, 44, 0, 0, TAU); g.fill(); g.fillStyle = '#f0b020'; g.beginPath(); g.ellipse(bx + 10, by - 84, 62, 30, 0, 0, TAU); g.fill();
          g.fillStyle = '#c8905a'; g.beginPath(); g.arc(bx - 78, by - 104, 34, 0, TAU); g.fill(); g.fillStyle = '#1a100a'; g.beginPath(); g.arc(bx - 78, by - 116, 30, Math.PI, TAU); g.fill();
          for (const dx of [-100, -58]) { KIT.glow(g, bx + dx, by - 84, 46, '#fff4c0', 0.9); g.fillStyle = '#ffe060'; g.beginPath(); g.arc(bx + dx, by - 84, 9, 0, TAU); g.fill(); }
          g.fillStyle = '#6a421c'; g.beginPath(); g.moveTo(bx - 170, by - 70); g.quadraticCurveTo(bx - 150, by + 30, bx, by + 34); g.quadraticCurveTo(bx + 150, by + 30, bx + 170, by - 70); g.closePath(); g.fill();
          g.strokeStyle = '#c8905a'; g.lineWidth = 5; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(bx - 150 + i * 42, by - 66); g.lineTo(bx - 126 + i * 36, by + 24); g.stroke(); } g.beginPath(); g.moveTo(bx - 168, by - 68); g.lineTo(bx + 168, by - 68); g.stroke();
          g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 4; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(bx, by + 40, 210 + i * 70 + 30 * Math.sin(T * 2 + i), 20 + i * 8, 0, 0, TAU); g.stroke(); }
          g.fillStyle = KIT.hex(p.near, '#000000', 0.2); g.beginPath(); g.moveTo(-900, 2400); g.lineTo(-900, 1270); g.quadraticCurveTo(100, 1230, 420, 1330); g.quadraticCurveTo(520, 1400, 300, 2400); g.fill();
          fig('epicKunti', g, T, 190, 1330, 0.86, 'right', ACT.pose(t, [[0, { kneel: 0.8, reach: 0.5 }], [env.dur * 0.5, { kneel: 1, grieve: 0.5 }, { act: 0.9 }]]), lit(p, [820, 700], 190, 0.85, 1.2), { emo: ACT.emo(t, [[0, 'plead'], [env.dur * 0.5, 'sorrow']]), gaze: [0.9, 0.2] }, 'ka-k'); } },
        { z: 1.5, haze: false, draw: (g) => ST.mist(g, T, { y: 1560, h: 380, alpha: 0.4 }) },
      ] });
      plq(ctx, env, t, 'Karna', 540, 300, env.dur * 0.42);
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.4, paper: 0.3 }) });

  // ── 4 · COUSINS (CE 1.107.1): Duryodhana in the foreground; the focus goes to the five, then to the one seat ──
  R.scene({ id: 'cousins',
    draw(ctx, t, env) {
      const T = env.T, b1 = beat(env, 0, 1.2), b2 = beat(env, 1, 2.2), rk = E.inOutSine(clamp((t - b1 + 0.35) / 0.45)), back = E.inOutSine(clamp((t - b2 + 0.25) / 0.4));
      const cam = { ...CAM.rack(rk - back, { from: 1.0, to: 0.62, zoom: 1.0, soft: 0.9 }), zoom: lerp(1.08, 1.26, t / env.dur), px: lerp(-110, 120, t / env.dur) };
      ST.shot(ctx, T, { pal: 'seat-ivory', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -400, 0, 1500); gr.addColorStop(0, '#8a6a30'); gr.addColorStop(1, '#f4e4b8'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); } },
        { z: 0.3, draw: (g, p) => ST.pillars(g, p, { y: 1380, n: 5 }) },
        { z: 0.5, haze: false, draw: (g) => { KIT.glow(g, 600, 900, 520, '#fffbe0', 0.7 * (0.4 + 0.6 * back) * (0.9 + 0.1 * Math.sin(T * 5))); g.fillStyle = '#c8902a'; g.fillRect(520, 1010, 160, 250); g.fillRect(500, 900, 200, 120); g.fillStyle = '#ffe08a'; g.fillRect(490, 1000, 220, 20); g.fillStyle = '#8a2a14'; g.fillRect(530, 930, 140, 70); } },
        { z: 0.62, haze: false, draw: (g, p) => { g.fillStyle = '#0a1030'; g.fillRect(700, 640, 520, 720); g.fillStyle = '#c8902a'; g.fillRect(700, 630, 520, 16); g.strokeStyle = 'rgba(4,14,24,0.5)'; g.lineWidth = 6; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(720 + i * 58, 650); g.lineTo(716 + i * 58 + 5 * Math.sin(T * 1.4 + i), 1360); g.stroke(); }
          const L = (x) => lit(p, [600, 500], x, 0.8, 1.15); const ids = ['epicYudhishthira', 'epicBhima', 'epicArjuna', 'nakula', 'sahadeva'], sc = [0.5, 0.56, 0.52, 0.5, 0.5];
          ids.forEach((id, i) => fig(id, g, T, 760 + i * 92, 1320 + (i % 2) * 14, sc[i], 'left', bare(ACT.pose(t, [[0, 'stand']], { prop: false })), L(760 + i * 92), { emo: 'calm', gaze: [0.8, 0] }, 'rv-' + i)); } },
        { z: 1, haze: false, draw: (g, p) => { g.fillStyle = '#4a3410'; g.fillRect(-900, GY + 20, 2880, 1200);
          fig('epicDuryodhana', g, T, 300, GY + 40, 0.96, 'right', ACT.pose(t, [[0, 'stand'], [b2 - 0.3, 'attend', { act: 0.5 }]]), lit(p, [900, 300], 300, 0.82, 1.2), { emo: ACT.emo(t, [[0, 'calm'], [b1, 'resolve']]), ...ACT.lead(t, [[0, [0.3, 0]], [b1 - 0.4, [0.9, 0]]]) }, 'rv-d'); } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T * 1.6, { kind: 'dust', count: 70, cam }) },
      ] });
      plq(ctx, env, t, 'Duryodhana', 770, 250, 0.35);
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.28, vignette: 0.4, paper: 0.32 }) });

  // ── 5 · LAC (CE 1.132, 1.136): the lacquered house burns; down through the earth, six leave by a tunnel with one lamp ──
  R.scene({ id: 'lac',
    draw(ctx, t, env) {
      const T = env.T, u = t / env.dur, cam = frame('tilt', u, { z: 1.12, f: [540, 520], s: [540, 960] }, { z: 1.12, f: [540, 1090], s: [540, 960] }, ev(E.inOutSine)), burn = E.outCubic(clamp(t / 0.4)), walk = 150 * t;
      ST.shot(ctx, T, { pal: 'wrath-crimson', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -600, 0, 1300); gr.addColorStop(0, '#120306'); gr.addColorStop(1, '#7a1410'); g.fillStyle = gr; g.fillRect(-900, -1200, 2880, 2700); } },
        { z: 0.4, draw: (g, p) => ST.treeline(g, p, { y: 600, h: 520, T, seed: 44, kind: 'sal', color: '#2a060a' }) },
        { z: 1, haze: false, draw: (g) => {
          KIT.glow(g, 560, 300, 1200, '#ff6a1e', 0.55 * burn);
          g.fillStyle = '#8a1a10'; g.fillRect(190, 300, 720, 420); g.fillStyle = '#5a0e08'; g.beginPath(); g.moveTo(130, 312); g.lineTo(550, 60); g.lineTo(970, 312); g.closePath(); g.fill(); g.strokeStyle = '#ffe08a'; g.lineWidth = 6; g.strokeRect(190, 300, 720, 420);
          g.fillStyle = '#ffd070'; for (let i = 0; i < 4; i++) g.fillRect(260 + i * 165, 400, 80, 150); g.fillStyle = '#2a0806'; g.fillRect(480, 520, 140, 200);
          flames(g, T, 170, 920, 340, 560, 12, burn);
          g.fillStyle = '#1c0a06'; g.fillRect(-900, 720, 2880, 1900); g.fillStyle = '#060201'; g.beginPath(); g.roundRect(-400, 800, 1900, 430, 170); g.fill();   // the earth and the tunnel
          const lx = 800 - walk * 0.9; KIT.glow(g, lx, 1020, 420, '#ffd070', 0.8 * KIT.flicker(T, 3)); g.fillStyle = '#ffe9b0'; g.beginPath(); g.ellipse(lx, 1000, 14, 28, 0, 0, TAU); g.fill();
          const cols = ['#f4ecd4', '#b8421c', '#f4f4ec', '#3aa8b8', '#3aa8b8', '#e8d8a0'], hs = [1, 1.25, 1.02, 0.94, 0.94, 0.9];
          for (let i = 0; i < 6; i++) { const x = lx + 80 + i * 108, ph = T * 8 + i * 1.3, b = 8 * Math.abs(Math.sin(ph)), h = hs[i] * 1.65, yb = 1200;
            g.strokeStyle = '#3a2418'; g.lineWidth = 16 * h; g.lineCap = 'round'; for (const sg of [-1, 1]) { g.beginPath(); g.moveTo(x, yb - 62 * h); g.lineTo(x + sg * 22 * h * Math.sin(ph), yb); g.stroke(); }
            g.fillStyle = cols[i]; g.beginPath(); g.ellipse(x, yb - 92 * h - b, 24 * h, 50 * h, 0.12, 0, TAU); g.fill(); g.fillStyle = '#b8805a'; g.beginPath(); g.arc(x - 8 * h, yb - 158 * h - b, 19 * h, 0, TAU); g.fill(); g.fillStyle = '#1a100a'; g.beginPath(); g.arc(x - 6 * h, yb - 166 * h - b, 18 * h, Math.PI, TAU); g.fill(); }
        } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: Math.round(80 * burn) + 4, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }) });

  // ── 6 · DEMON (CE 1.139.1–4; 1.142.28–31): the rakshasa reaches; the blow lands; CUT three frames after the contact ──
  R.scene({ id: 'demon',
    draw(ctx, t, env) {
      const T = env.T, hitT = env.dur - 0.1, u = t / env.dur, br = E.outCubic(clamp((t - hitT) / 0.1));
      const cam = shake({ ...CAM.orbit(u, { from: -1, to: 0.6, amp: 120, zoom: lerp(1.1, 1.32, u * u), turn: 0.02 }) }, T, 3 + 26 * br);
      ST.shot(ctx, T, { pal: 'thicket-shade', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1330, sun: [540, 420, 70], sunColor: '#f0ffd0' }) },
        { z: 0.35, draw: (g, p) => ST.treeline(g, p, { y: 1350, h: 1100, gap: 330, T, seed: 12, kind: 'sal' }) },
        { z: 0.8, haze: false, draw: (g) => ST.shafts(g, T, { x: 540, angle: 0.05, count: 5, alpha: 0.16, color: '#e0ffb0' }) },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
          g.save(); g.translate(740, GY + 20); g.rotate(0.3 * br); g.translate(-740, -(GY + 20));
          fig('epicHidimba', g, T, 740, GY + 20, 0.74, 'left', ACT.pose(t, [[0, 'reach'], [hitT - 0.02, 'recoil', { act: 0.1, over: 0.2 }]]), lit(p, [540, 300], 740, 0.95, 1.35, { fill: 0.5 }), { emo: ACT.emo(t, [[0, 'wrath'], [hitT, 'shock']]), gaze: [0.8, 0] }, 'dm-h'); g.restore();
          fig('epicBhima', g, T, lerp(120, 400, E.inQuad(clamp(t / hitT))), GY + 24, 0.8, 'right', ACT.pose(t, [[0, 'run'], [hitT - 0.55, 'reach', { act: 0.2 }], [hitT - 0.13, 'strike', { antic: 0.08, act: 0.12 }]], { phase: T * 9 }), lit(p, [540, 300], 300, 0.85, 1.2), { emo: 'wrath', gaze: [0.9, -0.2] }, 'dm-b');
          if (br > 0) { KIT.glow(g, 640, GY - 620, 300 * br, '#fffbe0', 0.8); } } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 54, cam }) },
        { z: 1.9, haze: false, soft: 0.35, draw: (g, p) => ST.trunks(g, p, { xs: [-240, 1310], w: 210 }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.5, paper: 0.3 }) });

  // ── 7 · ALTAR (CE 1.155.41): Draupadi rises out of the middle of the fire-altar; the camera rises with her ──
  R.scene({ id: 'altar', transition: { type: 'smoke', dur: 0.36, dir: -Math.PI / 2, color: '#3a1608' },
    draw(ctx, t, env) {
      const T = env.T, up = E.outCubic(clamp(t / 1.5)), cam = frame('crane', t / env.dur, { z: 1.3, f: [540, 1250] }, { z: 1.1, f: [540, 900] }, ev(E.outCubic));
      EP41.hearth(ctx, T, cam, { fire: 1.25, fs: 1.9, key: 'tr-altar', figs: (g, p, fl) => {
        g.save(); g.beginPath(); g.rect(-900, -900, 2880, GY + 900 + 30); g.clip();
        fig('epicDraupadi', g, T, 540, GY + 30 + 760 * (1 - up), 0.94, 'left', ACT.pose(t, [[0, 'anjali'], [1.3, 'stand', { act: 0.7 }]], { wind: 0.8 }), { ...ST.backlight(p, { from: [540, 700], at: [540, GY], k: fl, front: 0.72, fill: 0.45 }), bounce: ['#6a7ab0', 0.5] }, { emo: ACT.emo(t, [[0, 'calm'], [1.2, 'resolve']]), gaze: [0.6, 0] }, 'al-d');
        g.restore();
        g.fillStyle = '#3a1608'; g.fillRect(250, GY + 10, 580, 70); g.fillStyle = '#c8802a'; g.fillRect(230, GY, 620, 16);
      } });
      plq(ctx, env, t, 'Draupadi', 770, 250, 0.9);
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }) });

  // ── 8 · WHEEL (CE 2.42.21–25): Krishna a dark shape lit only by the wheel; it leaves his hand and the camera goes with it;
  //        the fallen king's light comes back across the hall and enters him ──
  R.scene({ id: 'wheel',
    draw(ctx, t, env) {
      const T = env.T, th = Math.min(env.speech[1] - 0.25, env.dur - 1.5), fly = clamp((t - th) / 0.4), back = E.inOutSine(clamp((t - th - 0.55) / 0.8));
      const cam = frame('slide', clamp((t - th + 0.1) / 0.5) - 0.75 * ss(th + 0.5, th + 1.3, t), { z: 1.12, f: [470, 900] }, { z: 1.12, f: [760, 900] }, ev(E.inOutSine));
      const KX = 360, hand = [KX + 14 * 0.94, GY + 24 - 1046 * 0.94], wp = fly <= 0 ? [hand[0], hand[1] - 150] : [lerp(hand[0], 1700, fly * fly), hand[1] - 150 + 260 * fly * fly];
      ST.shot(ctx, T, { pal: 'pure-flame', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1500, stars: 0.6, T }) },
        { z: 0.3, draw: (g, p) => ST.pillars(g, p, { y: 1380, n: 5 }) },
        { z: 0.6, draw: (g) => court(g, 1300, '#070a34', 'rgba(255,208,112,0.7)', 0, 9, T) },
        { z: 1, haze: false, draw: (g, p) => { g.fillStyle = '#050824'; g.fillRect(-900, GY + 10, 2880, 1200);
          if (fly > 0 && fly < 1) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = '#ffb030'; g.lineCap = 'round'; for (let i = 0; i < 6; i++) { g.globalAlpha = 0.5 - i * 0.07; g.lineWidth = 120 - i * 16; g.beginPath(); g.moveTo(wp[0], wp[1]); g.lineTo(lerp(wp[0], hand[0], 0.25 + i * 0.12), lerp(wp[1], hand[1] - 150, 0.25 + i * 0.12)); g.stroke(); } g.restore(); }
          if (fly < 1) chakra(g, wp[0], wp[1], 150, T);
          const flash = Math.max(0, 1 - Math.abs(t - th - 0.45) / 0.18); if (flash > 0) { g.fillStyle = `rgba(255,236,190,${0.5 * flash})`; g.fillRect(-900, -900, 2880, 3720); }
          if (back > 0 && back < 1) { const lx = lerp(1380, KX + 10, back), ly = lerp(1150, GY - 560, back) - 240 * Math.sin(back * Math.PI); KIT.glow(g, lx, ly, 420, '#fff4d0', 0.9); KIT.glow(g, lx, ly, 150, '#ffffff', 1); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(lx, ly, 34, 0, TAU); g.fill(); }
          KIT.glow(g, KX, GY - 520, 620 + 60 * Math.sin(T * 4), back >= 1 ? '#ffe6a0' : '#8aa4ff', back >= 1 ? 0.6 : 0.5);
          shape(g, 0.84, '#04061c', (q) => fig('epicKrishna', q, T, KX, GY + 24, 0.94, 'right', ACT.pose(t, [[0, 'raise'], [th - 0.3, 'curse', { antic: 0.16, act: 0.14, settle: 0.4, an: 0.14, over: 0.12 }], [th + 0.8, 'stand', { act: 0.7 }]], { wind: 0.7 }), dark(p, [wp[0], wp[1]], KX, { warm: '#ffd070' }), { emo: 'calm', gaze: [0.9, 0] }, 'wh-k')); } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 50, cam }) },
      ] });
      plq(ctx, env, t, 'Krishna', 760, 640, 0.25);
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.5, vignette: 0.5, paper: 0.28 }) });

  // ── 9 · DICE (CE 2.53–54; 2.58). dice1: the push-in on Yudhishthira deciding. dice2: from above, the dice strike the cloth; cut.
  //        dice3: the stakes swept across to Shakuni's side. ──
  const diceHall = (ctx, T, t, cam, env) => ST.shot(ctx, T, { pal: 'dice-vermilion', cam, layers: [
    { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -300, 0, 1900); gr.addColorStop(0, '#1c0404'); gr.addColorStop(1, '#6a100a'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); } },
    { z: 0.3, draw: (g, p) => { ST.pillars(g, p, { y: 1380, n: 4 }); for (const lx of [200, 880]) KIT.glow(g, lx, 520, 320, '#ffb050', 0.45 * KIT.flicker(T, lx)); } },
    { z: 1, haze: false, draw: (g, p) => { g.fillStyle = '#2a0806'; g.fillRect(-900, GY - 10, 2880, 1200);
      g.fillStyle = '#3a1408'; g.fillRect(330, 1060, 420, 340); g.fillStyle = '#5a2410'; g.fillRect(300, 1040, 480, 40);
      g.fillStyle = '#b02216'; g.beginPath(); g.moveTo(300, 850); g.lineTo(780, 850); g.lineTo(900, 1050); g.lineTo(180, 1050); g.closePath(); g.fill(); g.strokeStyle = '#ffe08a'; g.lineWidth = 8; g.stroke();
      fig('epicYudhishthira', g, T, 215, GY + 30, 0.8, 'right', ACT.pose(t, [[0, 'attend'], [env.dur * 0.55, 'offer', { act: 0.5 }]]), lit(p, [200, 500], 215, 0.8, 1.15), { emo: ACT.emo(t, [[0, 'calm'], [env.dur * 0.5, 'fear']]), ...ACT.lead(t, [[0, [0.7, 0.5]], [env.dur * 0.5, [0.9, 0.1]]]) }, 'dc-y');
      const rt = 0.5 + 0.5 * Math.sin(T * 22);   // Shakuni shakes the dice in his fist
      fig('epicShakuni', g, T, 860, GY + 30, 0.82, 'left', { w: { offer: 0.6 + 0.2 * rt, strike: 0.25 * (1 - rt), stand: 0.15 } }, lit(p, [880, 500], 860, 0.82, 1.2), { emo: 'joy', gaze: [0.7, 0.3] }, 'dc-s'); } },
    { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 26, cam }) },
  ] });
  R.scene({ id: 'dice1',
    draw(ctx, t, env) { const T = env.T; diceHall(ctx, T, t, frame('push', t / env.dur, { z: 1.45, f: [300, 760], s: [470, 800] }, { z: 2.2, f: [245, 640], s: [470, 760] }, (x) => x), env); plq(ctx, env, t, 'Yudhishthira', 640, 300, 0.3); fin(ctx, T); },
    post: () => ({ bloom: 0.34, vignette: 0.52, paper: 0.32 }) });
  // the cloth from above (both dice2 and dice3): k = how far the hand has swept the stakes
  const die = (g, x, y, s, rot, face) => { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.fillStyle = 'rgba(40,4,4,0.35)'; g.beginPath(); g.roundRect(-52, -46, 116, 116, 18); g.fill(); g.fillStyle = '#fff4d8'; g.beginPath(); g.roundRect(-56, -56, 112, 112, 18); g.fill(); g.strokeStyle = '#c8a070'; g.lineWidth = 4; g.stroke(); g.fillStyle = '#2a0a0a'; for (const [px, py] of face) { g.beginPath(); g.arc(px, py, 11, 0, TAU); g.fill(); } g.restore(); };
  const clothTop = (ctx, T, cam, o) => ST.shot(ctx, T, { pal: 'dice-vermilion', cam, layers: [
    { z: 0, haze: false, draw: (g) => { g.fillStyle = '#1c0404'; g.fillRect(-900, -900, 2880, 3720); } },
    { z: 1, haze: false, draw: (g) => {
      const gr = g.createRadialGradient(540, 960, 100, 540, 960, 1100); gr.addColorStop(0, '#c82a1a'); gr.addColorStop(1, '#7a1410'); g.fillStyle = gr; g.fillRect(-60, 100, 1200, 1500); g.strokeStyle = '#ffe08a'; g.lineWidth = 12; g.strokeRect(-60, 100, 1200, 1500);
      g.lineWidth = 4; g.globalAlpha = 0.55; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(-60 + i * 300, 100); g.lineTo(-60 + i * 300, 1600); g.stroke(); } for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(-60, 100 + i * 300); g.lineTo(1140, 100 + i * 300); g.stroke(); } g.globalAlpha = 1;
      KIT.glow(g, 540, 900, 900, '#ffb050', 0.25 * KIT.flicker(T, 2));
      o.things(g); } },
    { z: 1.5, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 24, cam }) },
  ] });
  const crowns = (g, x, y) => { g.fillStyle = '#ffd860'; g.strokeStyle = '#7a4a10'; g.lineWidth = 4; for (let i = 0; i < 5; i++) { const cx = x + i * 92, cy = y + (i % 2) * 26; g.beginPath(); g.moveTo(cx - 38, cy); g.lineTo(cx - 38, cy - 54); g.lineTo(cx - 17, cy - 26); g.lineTo(cx, cy - 70); g.lineTo(cx + 17, cy - 26); g.lineTo(cx + 38, cy - 54); g.lineTo(cx + 38, cy); g.closePath(); g.fill(); g.stroke(); } };
  const city = (g, x, y) => { g.fillStyle = '#f4f8ff'; g.strokeStyle = '#8a8ea8'; g.lineWidth = 3; for (let i = 0; i < 5; i++) { const h = 90 + 50 * (i % 2); g.fillRect(x + i * 46, y - h, 40, h); g.strokeRect(x + i * 46, y - h, 40, h); g.beginPath(); g.moveTo(x + i * 46 - 4, y - h); g.lineTo(x + i * 46 + 20, y - h - 30); g.lineTo(x + i * 46 + 44, y - h); g.fill(); } };
  const veil = (g, x, y, T) => { g.fillStyle = '#ff5030'; g.strokeStyle = '#ffd860'; g.lineWidth = 6; g.beginPath(); for (let i = 0; i <= 20; i++) { const a = (i / 20) * TAU, r = 96 + 14 * Math.sin(a * 5 + T * 3); g.lineTo(x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 0.8); } g.closePath(); g.fill(); g.stroke(); };
  R.scene({ id: 'dice2',
    draw(ctx, t, env) {
      const T = env.T, land = env.dur - 0.1, f = clamp(t / land), hit = clamp((t - land) / 0.1);
      const cam = shake(frame('tilt', t / env.dur, { z: 1.25, f: [540, 800], s: [540, 960] }, { z: 1.25, f: [540, 1000], s: [540, 960] }, ev(E.inQuad)), T, 22 * hit * (1 - hit) * 4);
      clothTop(ctx, T, cam, { things: (g) => { city(g, 150, 520); crowns(g, 90, 1250);
        // the two dice fall toward us-and-down: large and blurred high above, small and sharp as they strike at the SPOT
        const s = lerp(3.4, 1, f * f), sp = (1 - f) * 14;
        g.fillStyle = `rgba(30,2,2,${0.5 * f})`; g.beginPath(); g.ellipse(SPOT[0], SPOT[1] + 14, 150 * lerp(2.2, 1, f), 60 * lerp(2.2, 1, f), 0, 0, TAU); g.fill();
        die(g, SPOT[0] - 74 - 300 * (1 - f), SPOT[1] - 6 - 520 * (1 - f) * (1 - f) - 30 * Math.sin(Math.PI * hit), s, 0.3 + sp, [[-24, -24], [24, 24], [0, 0]]);
        die(g, SPOT[0] + 84 + 240 * (1 - f), SPOT[1] + 20 - 700 * (1 - f) * (1 - f) - 22 * Math.sin(Math.PI * hit), s, -0.5 - sp * 1.2, [[-26, -26], [26, 26], [-26, 26], [26, -26]]);
        if (hit > 0) { g.strokeStyle = `rgba(255,224,160,${0.7 * (1 - hit)})`; g.lineWidth = 10; g.beginPath(); g.ellipse(SPOT[0], SPOT[1], 200 + 260 * hit, 90 + 110 * hit, 0, 0, TAU); g.stroke(); } } });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.52, paper: 0.32 }) });
  R.scene({ id: 'dice3',
    draw(ctx, t, env) {
      const T = env.T, u = t / env.dur, b1 = beat(env, 0, env.dur * 0.5), s1 = E.inOutSine(clamp(t / Math.max(0.3, b1 - 0.05))), s2 = E.inOutSine(clamp((t - b1 + 0.05) / Math.max(0.3, env.dur - b1 - 0.1)));
      const cam = frame('slide', u, { z: 1.25, f: [380, 1040] }, { z: 1.25, f: [700, 1040] }, (x) => x);
      clothTop(ctx, T, cam, { things: (g) => {
        die(g, SPOT[0] - 74, SPOT[1] - 6, 1, 0.3, [[-24, -24], [24, 24], [0, 0]]); die(g, SPOT[0] + 84, SPOT[1] + 20, 1, -0.5, [[-26, -26], [26, 26], [-26, 26], [26, -26]]);
        city(g, 880 + 20 * Math.sin(T * 2), 520);
        const cx = lerp(90, 700, s1), vx = lerp(-260, 800, s2); crowns(g, cx, 1250); veil(g, vx, 760, T);
        // the hand that takes them: a teal sleeve and a fist, behind each stake in turn
        const hx = s2 > 0.01 ? vx - 230 : cx - 150, hy = s2 > 0.01 ? 760 : 1230;
        g.fillStyle = '#126a6a'; g.beginPath(); g.moveTo(hx - 900, hy - 120); g.lineTo(hx - 60, hy - 80); g.lineTo(hx - 60, hy + 80); g.lineTo(hx - 900, hy + 160); g.fill(); g.fillStyle = '#7a3aa0'; g.fillRect(hx - 100, hy - 84, 44, 168);
        g.fillStyle = '#b8845a'; g.beginPath(); g.ellipse(hx, hy, 86, 72, 0, 0, TAU); g.fill(); g.strokeStyle = '#6a4428'; g.lineWidth = 5; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(hx + 30, hy - 40 + i * 34); g.lineTo(hx + 80, hy - 34 + i * 34); g.stroke(); } } });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.52, paper: 0.32 }) });

  // ── 10 · CLOTH (CE 2.61.40–41). cloth1: close, the cloth hauled across the frame. cloth2: the pull-back: the hall of kings
  //         around her, heads bowed; there is more cloth, and more. No cause is shown. ──
  const clothHall = (ctx, T, t, cam, more, pullK) => { const DX = 330;
    ST.shot(ctx, T, { pal: 'boar-dusk', cam, layers: [
      { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -300, 0, 1500); gr.addColorStop(0, '#12061c'); gr.addColorStop(1, '#5a1c5a'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); } },
      { z: 0.3, draw: (g, p) => { ST.pillars(g, p, { y: 1380, n: 5 }); KIT.glow(g, 330, 600, 800, '#ffd0f0', 0.3); } },
      { z: 0.6, draw: (g) => court(g, 1290, '#1c0a24', 'rgba(255,208,240,0.55)', 1, 9, T) },
      { z: 1, haze: false, draw: (g, p) => { g.fillStyle = '#1a0a20'; g.fillRect(-900, GY + 10, 2880, 1200);
        const wy = GY - 430, run = T * 620, sl = 60 - 640 * pullK;
        for (let k = 0; k < 2; k++) { g.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40, x = DX + 40 + u * 1500, y = wy + sl * u + 34 * Math.sin(u * 9 - T * 11) * u + (k ? 62 : 0); g.lineTo(x, y); } for (let i = 40; i >= 0; i--) { const u = i / 40, x = DX + 40 + u * 1500, y = wy + sl * u + 34 * Math.sin(u * 9 - T * 11) * u + 62 + (k ? 10 : 0); g.lineTo(x, y); } g.closePath(); g.fillStyle = k ? '#ffd060' : '#e03a20'; g.fill(); }
        g.strokeStyle = 'rgba(120,10,10,0.6)'; g.lineWidth = 4; for (let i = 0; i < 16; i++) { const x = DX + 60 + ((i * 100 + run) % 1500), u = (x - DX - 40) / 1500, y = wy + sl * u + 34 * Math.sin(u * 9 - T * 11) * u; g.beginPath(); g.moveTo(x, y + 4); g.lineTo(x + 16, y + 58); g.stroke(); }
        for (let i = 0; i < Math.round(3 + 12 * more); i++) { const x = 760 + 70 * hash(i, 5) + (i % 3) * 60, y = GY + 30 - i * 13; g.fillStyle = i % 2 ? '#e03a20' : '#c02a18'; g.beginPath(); g.ellipse(x, y, 190 - i * 6, 26, 0.05 * Math.sin(i), 0, TAU); g.fill(); g.strokeStyle = '#ffd060'; g.lineWidth = 3; g.stroke(); }
        if (pullK > 0) { const px = 930 + 40 * Math.sin(T * 6);   // the one who pulls: a dark arm and shoulder at the frame's edge, hauling hand over hand
          fig('kuruPrince', g, T, px, GY + 26, 0.9, 'left', { w: { reach: 0.6 + 0.3 * Math.sin(T * 6), recoil: 0.3 } }, lit(p, [330, 300], px, 0.2, 1.1), { emo: 'wrath', gaze: [0.6, 0.2] }, 'cl-p'); }
        fig('epicDraupadi', g, T, DX, GY + 26, 0.94, 'right', ACT.pose(t, [[0, 'shield'], [1.9, 'anjali', { act: 0.9 }]], { wind: 1.0 }), lit(p, [330, 300], DX, 0.92, 1.3), { emo: ACT.emo(t, [[0, 'fear'], [2.0, 'resolve']]), gaze: [0.2, -0.6] }, 'cl-d'); } },
      { z: 1.4, haze: false, draw: (g) => ST.particles(g, T * 2, { kind: 'dust', count: 70, cam }) },
    ] }); };
  R.scene({ id: 'cloth1',
    draw(ctx, t, env) { const T = env.T, u = t / env.dur; clothHall(ctx, T, t, { ...CAM.orbit(u, { from: -0.2, to: 1, amp: 70, zoom: 1.5, turn: 0.014 }), py: -150 }, 0.1 * u, 1); fin(ctx, T); },
    post: () => ({ bloom: 0.3, vignette: 0.5, paper: 0.3 }) });
  R.scene({ id: 'cloth2',
    draw(ctx, t, env) { const T = env.T, u = t / env.dur, d0 = R.lines[env.index - 1] ? R.lines[env.index - 1].end - R.lines[env.index - 1].start : 1.7;
      clothHall(ctx, T, t + d0, frame('pull', u, { z: 1.6, f: [400, 900], s: [540, 900] }, { z: 1.0, f: [540, 960] }, ev(E.outCubic)), 0.1 + 0.9 * u, 0); fin(ctx, T); },
    post: () => ({ bloom: 0.3, vignette: 0.5, paper: 0.3 }) });

  // ── 11 · EXILE (CE 2.67.9–10; 2.68.1 ajināny uttarīyāṇi): six walk away under great trees, deerskins on their shoulders ──
  R.scene({ id: 'exile',
    draw(ctx, t, env) {
      const T = env.T, cam = frame('slide', t / env.dur, { z: 1.14, f: [420, 960] }, { z: 1.14, f: [640, 960] }, (x) => x), d = 110 * t;
      ST.shot(ctx, T, { pal: 'exile-forest', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1330, sun: [760, 520, 70] }) },
        { z: 0.3, draw: (g, p) => ST.treeline(g, p, { y: 1340, h: 900, gap: 300, T, seed: 71, kind: 'sal' }) },
        { z: 0.6, draw: (g, p) => ST.treeline(g, p, { y: 1370, h: 1300, gap: 520, T, seed: 73, color: p.near, kind: 'banyan' }) },
        { z: 0.85, haze: false, draw: (g) => ST.shafts(g, T, { x: 760, angle: -0.4, count: 6, alpha: 0.2 }) },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
          { const gr = g.createLinearGradient(0, 640, 0, GY + 30); gr.addColorStop(0, 'rgba(244,255,216,0)'); gr.addColorStop(0.3, 'rgba(244,255,216,0.86)'); gr.addColorStop(1, 'rgba(244,255,216,0.94)'); g.fillStyle = gr; g.fillRect(-900, 640, 2880, GY - 610); }
          const ids = ['epicYudhishthira', 'epicDraupadi', 'epicBhima', 'epicArjuna', 'nakula', 'sahadeva'], sc = [0.6, 0.57, 0.68, 0.62, 0.6, 0.6];
          shape(g, 0.38, '#0a1a0c', (g) => ids.forEach((id, i) => { const x = 700 - i * 140 + d, y = GY + 16 + (i % 2) * 10, s = sc[i], ph = ACT.stride(d, s) + i * 1.1;
            fig(id, g, T, x, y, s, 'right', bare(ACT.pose(t, [[0, 'walk']], { phase: ph, stride: 0.75, prop: false })), { ...ST.light(p, { from: [760, 400], at: [x, GY], front: 0.03, k: 1.2 }), fill: 0.0 }, { emo: 'sorrow', gaze: [0.6, 0.3] }, 'ex-' + i);
            // the deerskin worn as the upper cloth: a tawny hide from the far shoulder across the chest, a dark edge and a few spots
            g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#4a2e14'; g.strokeStyle = '#1a0e04'; g.lineWidth = 6; g.beginPath(); g.moveTo(-66, -800); g.lineTo(44, -790); g.lineTo(64, -660); g.lineTo(34, -560); g.lineTo(-20, -540); g.lineTo(-72, -640); g.closePath(); g.fill(); g.stroke();
            g.fillStyle = '#9a7a48'; for (const [sx, sy] of [[-24, -740], [22, -700], [-34, -650], [26, -620], [-6, -590]]) { g.beginPath(); g.arc(sx, sy, 6, 0, TAU); g.fill(); } g.restore(); })); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'pollen', count: 40, cam }) },
        { z: 1.9, haze: false, soft: 0.35, draw: (g, p) => ST.trunks(g, p, { xs: [-200, 1290], w: 230 }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.48, paper: 0.3 }) });

  // ── 12 · NEEDLE (CE 5.125.26). needle1: the court; the envoy a dark back in front; the focus goes to the king.
  //         needle2, THE CLOSE-UP: the push-in on his face; it goes on through the silence. ──
  const needleBg = [{ z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -400, 0, 1920); gr.addColorStop(0, '#0a0604'); gr.addColorStop(1, '#4a2212'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); } }];
  R.scene({ id: 'needle1',
    draw(ctx, t, env) {
      const T = env.T, u = t / env.dur, cam = { ...CAM.rack(E.inOutSine(clamp(u * 1.6)), { from: 1.5, to: 0.8, zoom: 1.0, soft: 1 }), zoom: lerp(1.04, 1.24, u), px: lerp(70, -50, u) };
      ST.shot(ctx, T, { pal: 'dharma-copper', cam, layers: [
        ...needleBg,
        { z: 0.3, draw: (g, p) => { ST.pillars(g, p, { y: 1500, n: 5 }); KIT.glow(g, 760, 760, 620, '#ffb070', 0.6 * KIT.flicker(T, 4)); } },
        { z: 0.8, haze: false, draw: (g, p) => { g.fillStyle = '#2a140a'; g.fillRect(-900, 1330, 2880, 1200); g.fillStyle = '#6a3414'; g.fillRect(560, 1090, 420, 250); g.fillStyle = '#c8902a'; g.fillRect(540, 1070, 460, 26); g.fillRect(560, 700, 30, 380); g.fillRect(950, 700, 30, 380); g.fillStyle = '#140a06'; g.fillRect(590, 716, 360, 356); g.fillStyle = '#c8902a'; g.fillRect(560, 700, 420, 18);   // the dark back of the seat: he is lit against it
          fig('epicDuryodhana', g, T, 770, 1300, 0.66, 'left', { w: { sit: 0.9, attend: 0.3 } }, lit(p, [760, 500], 770, 0.85, 1.2, { tint: ['#ffb070', 0.4] }), { emo: 'resolve', gaze: [0.9, 0] }, 'n1-d'); } },
        { z: 1.5, haze: false, draw: (g, p) => shape(g, 0.9, '#0a0604', (q) => fig('epicKrishna', q, T, 150, 2250, 1.5, 'right', { w: { stand: 0.8, offer: 0.2 + 0.05 * Math.sin(T * 2) } }, dark(p, [760, 760], 150, { warm: '#ffb070' }), { emo: 'calm' }, 'n1-k'), true) },
        { z: 1.7, haze: false, draw: (g) => ST.particles(g, T * 2, { kind: 'ember', count: 70, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.55, paper: 0.3 }) });
  R.scene({ id: 'needle2',
    draw(ctx, t, env) {
      const T = env.T, b0 = env.speech[1] - 0.5, cam = frame('push', t / env.dur, { z: 1.0, f: [520, 760], s: [540, 880] }, { z: 1.42, f: [500, 740], s: [540, 880] }, (x) => x);
      ST.shot(ctx, T, { pal: 'dharma-copper', cam, layers: [
        ...needleBg,
        { z: 0.3, soft: 0.5, draw: (g, p) => { ST.pillars(g, p, { y: 1700, n: 4 }); KIT.glow(g, 120, 760, 620, '#ffb070', 0.6 * KIT.flicker(T, 4)); } },
        { z: 1, haze: false, draw: (g, p) => fig('epicDuryodhana', g, T, 660, 3120, 2.45, 'left', bare({ w: { stand: 1 } }), { ...lit(p, [120, 760], 660, 0.86, 1.2 * KIT.flicker(T, 4)), tint: ['#ffb070', 0.45], minLum: 0.25 },
          { emo: ACT.emo(t, [[0, 'resolve'], [b0, 'wrath', { dur: 0.5 }]]), speak: 0, ...ACT.lead(t, [[0, [0.6, 0.1]], [b0, [0.95, 0]]], 0.4, 0.2) }, 'nd-d') },
        { z: 1.5, haze: false, draw: (g) => ST.particles(g, T * 1.8, { kind: 'ember', count: 70, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.55, paper: 0.3 }) });

  // ── 13 · ARMIES, THE TURN (CE 6.23.21): the conch, then the wide of the inserts, now held ──
  R.scene({ id: 'armies',
    draw(ctx, t, env) { const T = env.T; fieldWorld(ctx, T, frame('crane', t / env.dur, { z: 1.5, f: [560, 500], s: [540, 760] }, { z: 1.0, f: [560, 940] }, ev(E.outCubic)), { bow: 0.42, turn: 1 }); fin(ctx, T); },
    post: () => ({ bloom: 0.38, vignette: 0.5, paper: 0.3 }) });
  // ── 14 · BOW (CE 6.23.47): the push-in on Arjuna as he sits and the bow leaves his hand ──
  R.scene({ id: 'bow',
    draw(ctx, t, env) { const T = env.T, u = t / env.dur;
      fieldWorld(ctx, T, frame('push', u, { z: 1.45, f: [640, 760], s: [540, 820] }, { z: 2.1, f: [690, 640], s: [540, 760] }, (x) => x), { bow: 0.42 + 0.58 * E.inQuad(clamp(u * 1.5)), sit: ss(0.2, 0.8, u), turn: 1 }); fin(ctx, T); },
    post: () => ({ bloom: 0.36, vignette: 0.52, paper: 0.3 }) });

  // ── 15 · ARROWS (CE 6.114.81–85): from his face, back to the whole bed of arrows in the field at sunset ──
  const arrowsWorld = (ctx, T, t, cam) => { const BYY = 1010;
      ST.shot(ctx, T, { pal: 'fishers-coral', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1120, sun: [800, 1040, 150], sunColor: '#ff9a5a' }) },
        { z: 0.2, draw: (g, p) => { ST.cloudBank(g, p, T, { y: 360, count: 6, size: 1.6, speed: 30 }); ST.hills(g, p, { y: 1120, h: 200, seed: 91 }); } },
        { z: 0.45, draw: (g) => { army(g, -200, 300, 1160, 9, 1, '#3a1a2a', T, { s: 0.7, spear: '#ffd0b0' }); army(g, 800, 1300, 1160, 9, -1, '#3a1a2a', T, { s: 0.7, spear: '#ffd0b0' }); } },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: 1150, color: '#6a2c38', color2: '#1c0a14' });
          for (let i = 0; i < 34; i++) { const x = 130 + i * 25 + 10 * hash(i, 3), lean = (hash(i, 4) - 0.5) * 0.24; g.strokeStyle = i % 3 ? '#f4e0c8' : '#ffd0a0'; g.lineWidth = 5; g.beginPath(); g.moveTo(x + lean * 300, 1250); g.lineTo(x - lean * 260, BYY - 150 - 90 * hash(i, 5)); g.stroke(); g.fillStyle = '#c8402a'; g.beginPath(); const tx = x - lean * 260, ty = BYY - 150 - 90 * hash(i, 5); g.moveTo(tx, ty); g.lineTo(tx - 12, ty + 40); g.lineTo(tx + 12, ty + 40); g.fill(); }
          g.save(); g.translate(540, BYY); g.rotate(-Math.PI / 2 + 0.03); g.translate(-540, -BYY);
          fig('epicBhishma', g, T, 540, BYY + 520 * 0.84, 0.84, 'right', { w: { stand: 0.8, anjali: 0.2 }, bare: true }, lit(p, [800, 900], 540, 0.85, 1.25, { tint: ['#ffb080', 0.5] }), { emo: 'calm', blink: 1, gaze: [0, 0] }, 'ar-b'); g.restore();
          for (let i = 0; i < 12; i++) { const x = 190 + i * 62 + 14 * hash(i, 7); g.strokeStyle = '#f4e0c8'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, BYY + 10); g.lineTo(x + 8, 1250); g.stroke(); }
          // the last arrows still coming in, left to right
          for (let i = 0; i < 7; i++) { const q = (t * 1.6 + i * 0.37) % 1.4; if (q < 1) { const ax = lerp(-700, 200 + i * 110, q), ay = lerp(300 + i * 40, BYY - 40, q * q); g.strokeStyle = '#fff4e0'; g.lineWidth = 6; g.beginPath(); g.moveTo(ax - 150, ay - 60 * (1 - q) - 30); g.lineTo(ax, ay); g.stroke(); } }
        } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 46, cam }) },
      ] }); };
  const prevDur = (env) => (R.lines[env.index - 1] ? R.lines[env.index - 1].end - R.lines[env.index - 1].start : 1);
  // arrows1: close, along his body toward the face, the arrows coming in. arrows2: the pull-back to the whole bed.
  R.scene({ id: 'arrows1', draw(ctx, t, env) { const T = env.T; arrowsWorld(ctx, T, t, frame('slide', t / env.dur, { z: 2.3, f: [330, 960], s: [540, 900] }, { z: 2.3, f: [800, 960], s: [540, 900] }, (x) => x)); fin(ctx, T); }, post: () => ({ bloom: 0.38, vignette: 0.45, paper: 0.3 }) });
  R.scene({ id: 'arrows2', draw(ctx, t, env) { const T = env.T; arrowsWorld(ctx, T, t + prevDur(env), frame('pull', t / env.dur, { z: 1.9, f: [800, 960], s: [540, 900] }, { z: 1.03, f: [540, 960] }, ev(E.outCubic))); fin(ctx, T); }, post: () => ({ bloom: 0.38, vignette: 0.45, paper: 0.3 }) });

  // ── 16 · BOY (CE 7.33.12; 7.48.13 eko bahubhiḥ): alone inside the wheel formation; the ring closes. The blow is not shown. ──
  const boyWorld = (ctx, T, cam, close) => {
      ST.shot(ctx, T, { pal: 'cold-slate', cam, layers: [
        { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 1230 }); KIT.glow(g, 540, 800, 760, '#c8d8f0', 0.4); } },
        { z: 0.2, draw: (g, p) => ST.cloudBank(g, p, T, { y: 320, count: 7, speed: 110, color: '#1c2430', alpha: 0.95, size: 1.7 }) },
        { z: 0.5, draw: (g) => { army(g, -200, 1280, 1250, 26, 1, '#0c1018', T, { s: 0.8, spear: '#a8b8d0' }); } },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 40, color: '#2a3240', color2: '#0a0c12' });
          for (const dir of [-1, 1]) { const off = lerp(600, 250, close); for (let i = 0; i < 6; i++) { const y = GY - 760 + i * 150, x0 = 540 + dir * (off + 520), x1 = 540 + dir * (off - 30 + 26 * Math.sin(T * 9 + i)); g.strokeStyle = '#06080c'; g.lineWidth = 16; g.beginPath(); g.moveTo(x0, y + 40); g.lineTo(x1, y); g.stroke(); g.strokeStyle = '#c8d8f0'; g.lineWidth = 5; g.stroke(); g.fillStyle = '#e8f0ff'; g.beginPath(); g.moveTo(x1 - dir * 60, y - 6); g.lineTo(x1 - dir * 4, y - 16); g.lineTo(x1 - dir * 4, y + 14); g.fill(); }
            g.save(); g.translate(540 + dir * (off + 150), GY - 150); g.rotate(T * 5); g.strokeStyle = '#06080c'; g.lineWidth = 34; g.beginPath(); g.arc(0, 0, 170, 0, TAU); g.stroke(); g.strokeStyle = '#8a9ab0'; g.lineWidth = 8; g.stroke(); g.strokeStyle = '#06080c'; g.lineWidth = 16; for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(k * TAU / 8) * 160, Math.sin(k * TAU / 8) * 160); g.stroke(); } g.restore(); }
          KIT.glow(g, 540, GY - 500, 520, '#e8f4ff', close > 0 ? 0.45 : 0.04);
          fig('epicAbhimanyu', g, T, 540, GY + 24, 0.98, 'right', { w: { raise: 0.6 + 0.4 * Math.sin(T * 7), shield: 0.4 - 0.4 * Math.sin(T * 7) }, wind: 0.8 }, lit(p, [540, 200], 540, 0.9, 1.3), { emo: 'wrath', gaze: [0.8 * Math.sin(T * 5), 0] }, 'by-a'); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 70, cam }) },
      ] }); };
  // boy1: close on him. boy2: wide, the ring closing.
  R.scene({ id: 'boy1', draw(ctx, t, env) { const T = env.T; boyWorld(ctx, T, shake(frame('push', t / env.dur, { z: 1.9, f: [540, 620], s: [540, 760] }, { z: 2.25, f: [540, 600], s: [540, 760] }, (x) => x), T, 3), 0); fin(ctx, T); }, post: () => ({ bloom: 0.3, vignette: 0.55, paper: 0.3 }) });
  R.scene({ id: 'boy2', draw(ctx, t, env) { const T = env.T, u = t / env.dur; boyWorld(ctx, T, shake({ ...CAM.orbit(u, { from: -1, to: 1, amp: 150, zoom: 1.12, turn: 0.035 }) }, T, 4), E.inQuad(0.15 + 0.85 * u)); fin(ctx, T); }, post: () => ({ bloom: 0.3, vignette: 0.55, paper: 0.3 }) });

  // ── 17 · MUD (CE 8.66.60–65; 8.67.24): the wheel drops into the earth; CUT three frames after it stops. The red sun behind. ──
  const mudWorld = (ctx, T, cam, u, d, hit) => { const sunY = lerp(330, 520, u), sink = 30 * u + 120 * d;
      ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1);   // the war run moves left to right: he faces right
      ST.shot(ctx, T, { pal: 'island-gold', cam, layers: [
        { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 860 }); KIT.glow(g, 560, sunY, 900, '#ff5a2a', 0.6); g.fillStyle = '#e8401c'; g.beginPath(); g.arc(560, sunY, 230, 0, TAU); g.fill(); g.fillStyle = '#ff7a3a'; g.beginPath(); g.arc(560, sunY, 200, 0, TAU); g.fill(); } },
        { z: 0.2, draw: (g, p) => ST.hills(g, p, { y: 860, h: 200, seed: 5, color: '#5a2a18' }) },
        { z: 1, haze: false, draw: (g, p) => { g.translate(0, -300); ST.ground(g, p, { y: 1170, color: '#4a2410', color2: '#140804' });
          g.save(); g.translate(700, 1420 + sink); g.rotate(-0.07 - 0.1 * d); chariot(g, 0, 0, 1.08, -1, T, { body: '#6a2a14', flag: '#f0b020', roll: 0.6 * u }); g.restore();
          g.fillStyle = '#1c0c04'; g.fillRect(-900, 1330, 2880, 1200); g.fillStyle = '#2c1408'; g.beginPath(); g.ellipse(700, 1335, 330, 40, 0, Math.PI, 0); g.fill();
          if (hit > 0) for (let i = 0; i < 9; i++) { const a = -Math.PI * (0.1 + 0.8 * hash(i, 2)), r = 260 * hit; g.fillStyle = `rgba(90,50,24,${0.9 * (1 - hit)})`; g.beginPath(); g.arc(700 + Math.cos(a) * r * 1.4, 1330 + Math.sin(a) * r, 30 + 30 * hash(i, 3), 0, TAU); g.fill(); }
          fig('epicKarna', g, T, 300, 1320, 0.9, 'right', { w: { kneel: 0.7, reach: 0.7 + 0.2 * Math.sin(T * 8) }, wind: 0.4 }, { ...ST.backlight(p, { from: [560, sunY], at: [320, 1100], front: 0.04, fill: 0.02, warm: '#ffb060' }), bounce: ['#3a2a60', 0.15] }, { emo: 'wrath', gaze: [0.8, 0.5] }, 'md-k'); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T, { kind: 'dust', count: 50, cam }) },
      ] });
      ctx.restore(); };
  // mud1: Karna heaving, the focus coming to him. mud2: down to the wheel; it drops; the hub is at the SPOT when it strikes (the basket, the dice).
  R.scene({ id: 'mud1', draw(ctx, t, env) { const T = env.T, u = t / env.dur; mudWorld(ctx, T, { ...frame('rack', u, { z: 1.55, f: [360, 720], s: [540, 800] }, { z: 1.7, f: [380, 740], s: [540, 800] }, (x) => x), focus: lerp(0.5, 1, clamp(u * 2.5)), soft: 0.8 }, 0.3 * u, 0, 0); fin(ctx, T); }, post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }) });
  R.scene({ id: 'mud2',
    draw(ctx, t, env) { const T = env.T, u = t / env.dur, dropT = env.dur - 0.1, d = E.inQuad(clamp((t - (dropT - 0.22)) / 0.22)), hit = clamp((t - dropT) / 0.1);
      mudWorld(ctx, T, shake(frame('tilt', u, { z: 1.25, f: [640, 800], s: [540, 800] }, { z: 1.25, f: [700, 1086], s: SPOT }, ev(E.inOutSine)), T, 26 * hit * (1 - hit) * 4), 0.3 + 0.7 * u, d, hit); fin(ctx, T); },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }) });

  // ── 18 · RAID (CE 10.8.9–11): night; the sleeping camp; one man with a blade goes in, left to right, not by the gate ──
  R.scene({ id: 'raid',
    draw(ctx, t, env) {
      const T = env.T, u = t / env.dur, cam = frame('slide', u, { z: 1.14, f: [690, 960] }, { z: 1.14, f: [390, 960] }, (x) => x), x = lerp(1180, 560, u);
      const tent = (g, tx, ty, s, lamp) => { g.fillStyle = '#0a2630'; g.beginPath(); g.moveTo(tx - 230 * s, ty); g.lineTo(tx, ty - 330 * s); g.lineTo(tx + 230 * s, ty); g.fill(); g.strokeStyle = 'rgba(184,224,232,0.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(tx - 230 * s, ty); g.lineTo(tx, ty - 330 * s); g.lineTo(tx + 230 * s, ty); g.stroke(); g.fillStyle = '#041016'; g.beginPath(); g.moveTo(tx - 50 * s, ty); g.lineTo(tx, ty - 170 * s); g.lineTo(tx + 50 * s, ty); g.fill(); if (lamp) { KIT.glow(g, tx, ty - 60 * s, 160 * s, '#ffc878', 0.5 * KIT.flicker(T, tx)); } g.fillStyle = '#1a3a44'; g.fillRect(tx - 3, ty - 420 * s, 6, 100 * s); g.fillStyle = '#c8401a'; g.beginPath(); g.moveTo(tx, ty - 420 * s); g.lineTo(tx + 60 * s, ty - 400 * s + 6 * Math.sin(T * 5 + tx)); g.lineTo(tx, ty - 380 * s); g.fill(); };
      ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1);   // mirrored: he walks left to right
      ST.shot(ctx, T, { pal: 'satra-teal-night', cam, layers: [
        { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 1200, stars: 0.8, T }); g.fillStyle = '#e8f4ff'; g.beginPath(); g.arc(250, 420, 60, 0, TAU); g.fill(); KIT.glow(g, 250, 420, 300, '#b8e0e8', 0.4); } },
        { z: 0.35, draw: (g) => { for (let i = 0; i < 8; i++) tent(g, -100 + i * 220, 1230, 0.55, i % 3 === 1); } },
        { z: 0.65, draw: (g) => { for (let i = 0; i < 5; i++) tent(g, 60 + i * 380, 1330, 0.9, i === 2); } },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 30 });
          tent(g, 190, GY + 40, 1.5, true);
          KIT.glow(g, x - 120, GY - 520, 300, '#ff5a2a', 0.35);
          fig('epicDevavrata', g, T, x, GY + 26, 0.86, 'left', ACT.pose(t, [[0, 'walk']], { phase: ACT.stride(1180 - x, 0.86), stride: 0.7 }), { dir: 2.6, intensity: 1.25, front: 0.05, fill: 0.02, tint: ['#b8e0e8', 0.6] }, { emo: 'wrath' }, 'rd-a');
          g.save(); g.translate(x - 150, GY - 430); g.rotate(-0.5 + 0.06 * Math.sin(T * 9)); g.fillStyle = '#e8f4ff'; g.beginPath(); g.moveTo(0, -8); g.lineTo(-330, -4); g.lineTo(-380, 0); g.lineTo(-330, 4); g.lineTo(0, 8); g.fill(); g.restore();
        } },
        { z: 1.5, haze: false, draw: (g) => ST.mist(g, T, { y: 1380, h: 300, alpha: 0.35 }) },
        { z: 1.9, haze: false, soft: 0.35, draw: (g) => { g.fillStyle = '#020a0e'; g.beginPath(); g.moveTo(1500, 2000); g.lineTo(1500, 500); g.lineTo(1040, 1960); g.fill(); } },
      ] });
      ctx.restore();
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.34, vignette: 0.55, paper: 0.3 }) });

  // ── 19 · CURSE (CE 11.25.36–42): Gandhari, blindfolded, her hand rising toward a dark figure; a field of fires ──
  R.scene({ id: 'curse',
    draw(ctx, t, env) {
      const T = env.T, b0 = env.speech[0] + 0.6 * (env.speech[1] - env.speech[0]), cam = frame('push', t / env.dur, { z: 1.0, f: [560, 920] }, { z: 1.42, f: [450, 700], s: [520, 800] }, (x) => x);
      ST.shot(ctx, T, { pal: 'ash-grey', cam, layers: [
        { z: 0, draw: (g, p) => { ST.sky(g, p, { hz: 1000 }); KIT.glow(g, 540, 1000, 900, '#ff7a3a', 0.3); } },
        { z: 0.2, draw: (g, p) => ST.cloudBank(g, p, T, { y: 380, count: 8, speed: 22, color: '#5a5650', alpha: 0.9, size: 1.8 }) },
        { z: 0.6, haze: false, draw: (g) => { g.fillStyle = '#2a2622'; g.fillRect(-900, 1000, 2880, 1500); fires(g, T, 1000, 26); } },
        { z: 1, haze: false, draw: (g, p) => {
          KIT.glow(g, 850, GY - 520, 420, '#ff9a4a', 0.4);
          shape(g, 0.86, '#0c0806', (q) => fig('epicKrishna', q, T, 850, GY + 26, 0.88, 'left', ACT.pose(t, [[0, 'stand'], [b0, 'anjali', { act: 0.7 }]]), dark(p, [540, 1000], 850, { warm: '#ff9a4a' }), { emo: 'calm', gaze: [0.8, 0.3] }, 'cu-k'));
          fig('epicGandhari', g, T, 270, GY + 26, 0.9, 'right', ACT.pose(t, [[0, 'grieve'], [b0 - 0.65, 'curse', { antic: 0.22, act: 0.16, settle: 0.5 }]], { wind: 0.5 }), lit(p, [540, 300], 270, 0.9, 1.25), { emo: ACT.emo(t, [[0, 'sorrow'], [b0 - 0.5, 'wrath']]), gaze: [0.8, 0] }, 'cu-g'); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T * 1.8, { kind: 'ember', count: 90, cam }) },
        { z: 1.6, haze: false, draw: (g) => ST.mist(g, T * 4, { y: 1500, h: 400, alpha: 0.4 }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.32 }) });

  // ── 20 · DOG (CE 17.1.23–31; 17.3.7): snow, the mountain; the old king stops and turns to the dog at his heel ──
  const dog = (g, x, y, s, T, wag) => { g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = '#7a5a3a'; g.beginPath(); g.ellipse(0, -118 + 3 * Math.sin(T * 5), 124, 54, -0.05, 0, TAU); g.fill();
    for (const [lx, ph] of [[-86, 0], [-54, 1.6], [62, 0.8], [92, 2.4]]) { const a = 0.12 * Math.sin(T * 3 + ph) * (1 - 0.7 * wag); g.save(); g.translate(lx, -96); g.rotate(a); g.fillRect(-13, 0, 26, 98); g.restore(); }
    g.save(); g.translate(120, -160); g.rotate(0.07 * Math.sin(T * 2.3)); g.beginPath(); g.ellipse(12, -16, 56, 44, -0.5, 0, TAU); g.fill(); g.beginPath(); g.moveTo(40, -30); g.lineTo(106, -6); g.lineTo(102, 18); g.lineTo(30, 10); g.fill();
    g.beginPath(); g.moveTo(-16, -48); g.lineTo(-28, -102); g.lineTo(14, -60); g.fill(); g.fillStyle = '#fff8e8'; g.beginPath(); g.arc(30, -24, 7, 0, TAU); g.fill(); g.fillStyle = '#0a0604'; g.beginPath(); g.arc(32, -24, 4, 0, TAU); g.fill(); g.beginPath(); g.arc(104, 4, 8, 0, TAU); g.fill(); g.restore();
    g.fillStyle = '#7a5a3a'; g.save(); g.translate(-118, -140); g.rotate(-0.9 + 0.55 * Math.sin(T * 11) * (0.25 + 0.75 * wag)); g.fillRect(-84, -11, 90, 22); g.restore();
    g.fillStyle = '#e8d8c0'; g.beginPath(); g.ellipse(20, -98, 84, 26, 0, 0, Math.PI); g.fill();
    g.restore(); };
  R.scene({ id: 'dog',
    draw(ctx, t, env) {
      const T = env.T, u = t / env.dur, b0 = env.dur * 0.42, cam = frame('crane', u, { z: 1.62, f: [500, 1120] }, { z: 1.0, f: [560, 880] }, (x) => x);
      const go = E.outCubic(clamp(t / (b0 + 0.2))), kx = lerp(480, 700, go), turned = t > b0 + 0.25, stop = clamp((t - b0) / 0.4);
      ST.shot(ctx, T, { pal: 'mist-lavender', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1250, sun: [300, 380, 70] }) },
        { z: 0.15, draw: (g, p) => { ST.hills(g, p, { y: 1260, h: 1500, seed: 41, peaks: 0.9, snow: true, color: '#6a5eac' }); } },
        { z: 0.25, haze: false, draw: (g, p) => ST.cloudBank(g, p, T, { y: 420, count: 7, speed: 170, color: '#e4e0fb', alpha: 0.75, size: 1.5, spread: 520 }) },
        { z: 0.4, draw: (g, p) => { ST.hills(g, p, { y: 1290, h: 620, seed: 43, peaks: 0.5, snow: true, color: '#8a7ec8' }); ST.mist(g, T * 6, { y: 1150, h: 300, alpha: 0.55 }); } },
        { z: 1, haze: false, draw: (g, p) => {
          g.translate(0, -170); g.fillStyle = '#f4f2fb'; g.beginPath(); g.moveTo(-900, 2600); g.lineTo(-900, GY + 60); g.quadraticCurveTo(300, GY + 40, 1980, GY - 160); g.lineTo(1980, 2600); g.fill(); g.fillStyle = 'rgba(138,126,192,0.35)'; g.beginPath(); g.ellipse(kx - 60, GY + 44, 420, 26, -0.05, 0, TAU); g.fill();
          for (let i = 0; i < 4; i++) { const sx = ((T * 430 + i * 760) % 3040) - 900; g.fillStyle = 'rgba(106,94,172,0.3)'; g.beginPath(); g.ellipse(sx, GY + 170 + i * 130, 560, 120, -0.08, 0, TAU); g.fill(); }   // cloud shadows crossing the snow
          dog(g, lerp(60, 300, go), GY + 44, 0.95, T, stop);
          fig('epicPilgrim', g, T, kx, GY + 30 - (kx - 380) * 0.06, 0.84, turned ? 'left' : 'right', ACT.pose(t, [[0, 'walk'], [b0, 'stand', { act: 0.35 }], [b0 + 0.5, 'offer', { act: 0.9 }]], { phase: ACT.stride(kx - 380, 0.84), stride: 0.7 * (1 - stop), wind: 0.9 }), lit(p, [300, 300], kx, 0.9, 1.25), { emo: ACT.emo(t, [[0, 'weary'], [b0 + 0.3, 'tender']]), gaze: [0.7, 0.6] }, 'dg-y'); } },
        { z: 1.3, haze: false, draw: (g) => ST.particles(g, T * 1.6, { kind: 'snow', count: 130, cam }) },
        { z: 1.7, haze: false, draw: (g) => ST.particles(g, T * 2.2 + 7, { kind: 'snow', count: 50, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.3, vignette: 0.38, paper: 0.32 }) });

  // ══ 21 · VISHVARUPA, THE SIGNATURE SHOT (CE 6.33 = Gita 11; every element cited in script/TRAILER-CHECK.md) ══
  // Drawn in the coordinates of its LAST frame; the camera starts about twenty times closer, on Arjuna's face.
  const VA = [540, 1232, 0.118];   // Arjuna, a speck on his chariot, in the last frame
  const FACE_COLS = [['#1a3a9a', '#3a6ae0'], ['#8a1a14', '#e0503a'], ['#a8741a', '#f0c050'], ['#1a6a4a', '#4ac08a'], ['#c8c8d8', '#ffffff'], ['#5a2a8a', '#a070e0'], ['#0e2a6a', '#3a7ae0']];
  const vFace = (g, x, y, s, T, i, o = {}) => {   // one of the many faces (6.33.10 anekavaktranayanam): crowned (17), eyes blazing (24), mouth a fire (19, 25)
    const [c0, c1] = FACE_COLS[i % FACE_COLS.length], open = 0.55 + 0.45 * Math.sin(T * 1.7 + i * 1.3), bl = !o.sunMoon && Math.sin(T * 0.9 + i * 2.1) > 0.93 ? 0.15 : 1;
    g.save(); g.translate(x, y); g.scale(s * (o.turn || 1), s);
    g.fillStyle = '#e7b54a'; g.beginPath(); g.moveTo(-150, -150); g.lineTo(-120, -330); g.lineTo(-60, -250); g.lineTo(0, -420); g.lineTo(60, -250); g.lineTo(120, -330); g.lineTo(150, -150); g.closePath(); g.fill(); g.fillStyle = '#fff0b0'; g.fillRect(-152, -176, 304, 34); g.fillStyle = '#c8401a'; g.beginPath(); g.arc(0, -282, 22, 0, TAU); g.fill();   // the crown (kirīṭin)
    const gr = g.createLinearGradient(0, -170, 0, 230); gr.addColorStop(0, c1); gr.addColorStop(1, c0); g.fillStyle = gr; g.beginPath(); g.moveTo(-158, -150); g.quadraticCurveTo(-190, 60, -90, 190); g.quadraticCurveTo(0, 250, 90, 190); g.quadraticCurveTo(190, 60, 158, -150); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,240,190,0.85)'; g.lineWidth = 7; g.stroke();
    for (const sx of [-1, 1]) { g.fillStyle = '#fffbe8'; g.beginPath(); g.ellipse(sx * 72, -40, 46, 26 * bl, sx * -0.12, 0, TAU); g.fill();
      if (o.sunMoon) { if (sx < 0) { g.fillStyle = '#ffb020'; g.beginPath(); g.arc(sx * 72, -40, 22 * bl, 0, TAU); g.fill(); g.strokeStyle = '#ff8a10'; g.lineWidth = 5; for (let k = 0; k < 10; k++) { const a = k * TAU / 10 + T; g.beginPath(); g.moveTo(sx * 72 + Math.cos(a) * 26, -40 + Math.sin(a) * 26 * bl); g.lineTo(sx * 72 + Math.cos(a) * 40, -40 + Math.sin(a) * 40 * bl); g.stroke(); } }   // the sun for one eye,
        else { g.fillStyle = '#c8d8ff'; g.beginPath(); g.arc(sx * 72, -40, 22 * bl, 0, TAU); g.fill(); g.fillStyle = '#fffbe8'; g.beginPath(); g.arc(sx * 72 + 9, -44, 18 * bl, 0, TAU); g.fill(); } }   // the moon for the other (19 śaśisūryanetram)
      else { g.fillStyle = '#ff7a10'; g.beginPath(); g.arc(sx * 72, -40, 17 * bl, 0, TAU); g.fill(); g.fillStyle = '#1a0806'; g.beginPath(); g.arc(sx * 72, -40, 8 * bl, 0, TAU); g.fill(); }
      g.strokeStyle = '#0a0612'; g.lineWidth = 9; g.beginPath(); g.moveTo(sx * 24, -86); g.quadraticCurveTo(sx * 76, -112, sx * 128, -80); g.stroke(); }
    g.fillStyle = '#ffe890'; g.beginPath(); g.ellipse(0, -112, 9, 26, 0, 0, TAU); g.fill();   // the mark on the brow
    g.fillStyle = c0; g.beginPath(); g.moveTo(-14, -20); g.lineTo(0, 46); g.lineTo(14, -20); g.fill();
    // the mouth: open, a fire in it (19 dīptahutāśavaktram; 25 kālānalasaṃnibhāni)
    const mh = 30 + 46 * open; g.fillStyle = '#1a0406'; g.beginPath(); g.ellipse(0, 112, 70, mh, 0, 0, TAU); g.fill();
    g.save(); g.beginPath(); g.ellipse(0, 112, 66, mh - 4, 0, 0, TAU); g.clip(); for (const [c, q] of [['#e8401c', 1], ['#ffa030', 0.7], ['#fff0a0', 0.4]]) { g.fillStyle = c; g.beginPath(); g.moveTo(-64 * q, 112 + mh); for (let k = 0; k <= 6; k++) g.lineTo(-64 * q + (128 * q * k) / 6, 112 + mh - (k % 2 ? 1.7 : 0.9) * mh * q * (0.8 + 0.3 * Math.sin(T * 9 + k + i))); g.lineTo(64 * q, 112 + mh); g.fill(); } g.restore();
    if (o.tusks) { g.fillStyle = '#fffbe8'; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * 58, 104); g.quadraticCurveTo(sx * 84, 60, sx * 62, 36); g.quadraticCurveTo(sx * 60, 72, sx * 40, 100); g.fill(); } }   // 23, 25 daṃṣṭrākarāla
    g.restore(); };
  const vArm = (g, sx, sy, a, len, T, i, what) => {   // one of the many arms (16 anekabāhu), a raised weapon in the hand (10 divyānekodyatāyudham)
    const a2 = a + 0.1 * Math.sin(T * 0.8 + i), ex = sx + Math.cos(a2) * len * 0.52, ey = sy + Math.sin(a2) * len * 0.52, a3 = a2 - Math.sign(Math.cos(a)) * 0.35 + 0.08 * Math.sin(T * 1.1 + i * 2), hx = ex + Math.cos(a3) * len * 0.5, hy = ey + Math.sin(a3) * len * 0.5;
    g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#fff0c0'; g.lineWidth = 54; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.lineTo(hx, hy); g.stroke(); g.strokeStyle = i % 2 ? '#1c3aa0' : '#122a80'; g.lineWidth = 42; g.stroke();
    g.strokeStyle = '#e7b54a'; g.lineWidth = 12; g.beginPath(); g.arc(ex, ey, 30, 0, TAU); g.stroke(); g.beginPath(); g.arc(lerp(ex, hx, 0.86), lerp(ey, hy, 0.86), 28, 0, TAU); g.stroke();
    g.save(); g.translate(hx, hy); g.rotate(a3);
    if (what === 0) { g.rotate(-a3 + T * 4); g.strokeStyle = '#ffe890'; g.lineWidth = 16; g.beginPath(); g.arc(0, 0, 56, 0, TAU); g.stroke(); g.fillStyle = '#ff9a1e'; for (let k = 0; k < 12; k++) { g.rotate(TAU / 12); g.beginPath(); g.moveTo(58, -9); g.lineTo(82, 0); g.lineTo(58, 9); g.fill(); } }   // the discus (17 cakriṇam)
    else if (what === 1) { g.fillStyle = '#7a4a10'; g.fillRect(-20, -9, 150, 18); g.fillStyle = '#e7b54a'; g.beginPath(); g.ellipse(160, 0, 54, 38, 0, 0, TAU); g.fill(); g.fillStyle = '#fff0b0'; g.beginPath(); g.arc(212, 0, 12, 0, TAU); g.fill(); }   // the mace (17 gadinam)
    else if (what === 2) { g.fillStyle = '#e8f0ff'; g.beginPath(); g.moveTo(0, -11); g.lineTo(200, -5); g.lineTo(236, 0); g.lineTo(200, 5); g.lineTo(0, 11); g.fill(); g.fillStyle = '#e7b54a'; g.fillRect(-6, -24, 12, 48); }
    else if (what === 3) { g.strokeStyle = '#e7b54a'; g.lineWidth = 9; g.beginPath(); g.moveTo(-90, 0); g.lineTo(240, 0); g.stroke(); g.fillStyle = '#e8f0ff'; g.beginPath(); g.moveTo(240, -16); g.lineTo(290, 0); g.lineTo(240, 16); g.fill(); }
    else { g.fillStyle = '#e8b890'; g.beginPath(); g.ellipse(26, 0, 34, 24, 0, 0, TAU); g.fill(); }
    g.restore(); };
  const vishForm = (g, T, k, far) => {   // k: 0..1 how far the light has come up
    // the light of a thousand suns risen at once (12): a white core, gold, then fire; rays turning
    const sky = g.createRadialGradient(540, 560, 60, 540, 560, 1900); sky.addColorStop(0, '#ffffff'); sky.addColorStop(0.16, '#fff4c0'); sky.addColorStop(0.4, '#ffc040'); sky.addColorStop(0.7, '#e0541a'); sky.addColorStop(1, '#5a1030'); g.fillStyle = sky; g.fillRect(-2600, -3200, 6300, 7400);
    g.save(); g.translate(540, 560); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 28; i++) { const a = (i / 28) * TAU + T * 0.07 * (i % 2 ? 1 : -1.3), w = 0.03 + 0.04 * hash(i, 9); g.fillStyle = `rgba(255,236,170,${0.11 + 0.1 * hash(i, 8)})`; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a - w) * 3600, Math.sin(a - w) * 3600); g.lineTo(Math.cos(a + w) * 3600, Math.sin(a + w) * 3600); g.fill(); } g.restore();
    // the body with no beginning, middle or end (16, 19): it rises from below the earth and leaves the frame above and on both sides (20, 24 nabhaḥspṛśam)
    { const bg = g.createLinearGradient(0, 760, 0, 1300); bg.addColorStop(0, '#1a3a9a'); bg.addColorStop(1, '#0a1648'); g.fillStyle = bg; g.beginPath(); g.moveTo(350, 1900); g.quadraticCurveTo(390, 1060, 250, 850); g.quadraticCurveTo(540, 700, 830, 850); g.quadraticCurveTo(690, 1060, 730, 1900); g.fill(); g.strokeStyle = 'rgba(255,244,200,0.95)'; g.lineWidth = 9; g.stroke(); }
    g.strokeStyle = '#e7b54a'; g.lineWidth = 16; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(330 - i * 34, 800 + i * 20); g.quadraticCurveTo(540, 990 + i * 120, 750 + i * 34, 800 + i * 20); g.stroke(); }   // ornaments and garlands (10–11)
    g.fillStyle = '#ff5a2a'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(360 + i * 45, 905 + 90 * Math.sin((i / 8) * Math.PI), 14, 0, TAU); g.fill(); }
    // the arms (16, 19 anantabāhum, 23 bahubāhu): nine a side, the back ones first
    const WHAT = [0, 1, 2, 3, 4, 2, 3, 1, 4];
    for (let i = 8; i >= 0; i--) for (const sd of [-1, 1]) { const a = lerp(-1.42, 0.62, i / 8), ang = sd > 0 ? a : Math.PI - a; vArm(g, 540 + sd * 215, 850 + i * 5, ang, 400 + 45 * ((i * 3) % 4), T, i + (sd > 0 ? 0 : 9), sd > 0 ? WHAT[i] : WHAT[(i + 4) % 9]); }
    // the faces (10, 16, 23): three rows going out of the frame, the great face in the middle
    const row = (y, s, xs, seed, turn) => xs.forEach((x, j) => vFace(g, x, y + 10 * Math.sin(T * 0.7 + j + seed), s, T, j + seed, { tusks: true, turn: x < 540 ? turn : turn }));
    row(40, 0.62, [-80, 150, 380, 700, 930, 1160], 11, 0.94);
    row(250, 0.78, [20, 270, 810, 1060], 5, 0.92);
    row(540, 0.95, [-60, 180, 900, 1140], 1, 0.88);
    vFace(g, 540, 470 + 6 * Math.sin(T * 0.6), 1.5, T, 0, { sunMoon: true });
    // the earth and the two armies, small; the heroes run into the mouths like rivers to the sea, like moths into a flame (26–29)
    g.fillStyle = '#1a0a1e'; g.fillRect(-2600, 1235, 6300, 3000); const gg = g.createLinearGradient(0, 1235, 0, 1420); gg.addColorStop(0, 'rgba(255,190,90,0.55)'); gg.addColorStop(1, 'rgba(255,190,90,0)'); g.fillStyle = gg; g.fillRect(-2600, 1235, 6300, 190);
    for (const sd of [-1, 1]) for (let i = 0; i < 40; i++) { const x = 540 + sd * (110 + i * 13 + 5 * hash(i, 7)), y = 1238 + 8 * hash(i, 6); g.strokeStyle = '#0a0612'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 22); g.stroke(); g.strokeStyle = '#ffe0a0'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x + sd * 2, y - 16); g.lineTo(x + sd * 5, y - 40 - 3 * Math.sin(T * 3 + i)); g.stroke(); }
    const mouths = [[540, 640], [171, 646], [909, 646], [278, 337], [802, 337]];
    for (let i = 0; i < 150; i++) { const sd = i % 2 ? 1 : -1, m = mouths[sd < 0 ? [0, 1, 3][i % 3] : [0, 2, 4][i % 3]], u = (T * (0.16 + 0.1 * hash(i, 3)) + hash(i, 4)) % 1, x0 = 540 + sd * (130 + 420 * hash(i, 5)), y0 = 1222;
      const cx = lerp(x0, m[0], 0.2) + sd * 260 * hash(i, 12), cy = 1000, q = u * u, x = (1 - q) * (1 - q) * x0 + 2 * q * (1 - q) * cx + q * q * m[0], y = (1 - q) * (1 - q) * y0 + 2 * q * (1 - q) * cy + q * q * m[1], s = lerp(9, 3, q), onBody = Math.abs(x - 540) < 170 && y > 860;
      g.fillStyle = q > 0.8 ? `rgba(255,${200 - 120 * (q - 0.8) * 5},60,${1 - (q - 0.8) * 4})` : onBody ? '#ffe9a8' : '#140818'; g.beginPath(); g.ellipse(x, y, s * 0.6, s * 1.5, 0, 0, TAU); g.fill(); if (q < 0.8) { g.fillStyle = onBody ? '#ffffff' : 'rgba(60,20,10,0.9)'; g.fillRect(x + 1, y - s * 2.6, 1.6, s * 1.6); } }
    KIT.glow(g, VA[0], VA[1] - 40, 150, '#fff4c0', 0.7 * (far || 0));   // a pool of light round the speck, only once he is small
    void k;
  };
  R.scene({ id: 'vish',
    draw(ctx, t, env) {
      const T = env.T, w = env.words, sp2 = w[6] ? w[6].t0 : 2.4, lightK = ss(0.2, sp2 - 0.9, t), moveT = sp2 - 1.5;
      // the camera: the point of his face stays under it while it draws back and up, about twenty-one times
      const e = E.inOutCubic(clamp((t - moveT) / 2.3)), creep = clamp((t - moveT - 2.3) / Math.max(0.5, env.dur - moveT - 2.3));
      const Z = Math.exp(lerp(Math.log(30), Math.log(1.075), e)) * lerp(1, 0.86, clamp(t / moveT) * (1 - e)) * lerp(1, 1 / 1.075, creep * e);
      const face = [VA[0] - 3.2, VA[1] - 107.5], scr = [lerp(540, face[0], e), lerp(800, face[1], e)];
      CAM.pull(0); CAM.crane(0);
      ctx.save(); ctx.fillStyle = '#12122a'; ctx.fillRect(0, 0, W, H);
      ctx.translate(scr[0], scr[1]); ctx.scale(Z, Z); ctx.translate(-face[0], -face[1]);
      // before the light: the field's blue-iron dusk around him
      if (lightK < 1) { const bg = ctx.createLinearGradient(0, 900, 0, 1260); bg.addColorStop(0, '#10102a'); bg.addColorStop(1, '#3a3050'); ctx.fillStyle = bg; ctx.fillRect(-2600, -3200, 6300, 7400); ctx.fillStyle = '#16142a'; ctx.fillRect(-2600, 1235, 6300, 3000); }
      if (lightK > 0) { ctx.save(); ctx.globalAlpha = lightK; vishForm(ctx, T, lightK, e); ctx.restore(); }
      // Arjuna on the chariot: bowed, palms joined (14 praṇamya śirasā … kṛtāñjaliḥ), trembling (35 vepamānaḥ)
      const tr = 0.5 * Math.sin(T * 41) * lightK, p = ST.pal('war-iron');
      chariot(ctx, VA[0] - 12, VA[1] + 26, 0.135, -1, T, { flag: '#f0c020' });
      fig('epicArjuna', ctx, T, VA[0] + tr * 0.12, VA[1], VA[2], 'left', { w: { stand: 1 - 0.75 * lightK, anjali: 0.9 * lightK, kneel: 0.25 * lightK }, bare: true }, { dir: -Math.PI / 2 - 0.5, intensity: lerp(0.9, 1.7, lightK), front: lerp(0.5, 0.96, lightK), fill: 0.4, tint: [lightK > 0.3 ? '#fff0b0' : '#ffc8a0', 0.3 + 0.4 * lightK], minLum: 0.2 }, { emo: ACT.emo(t, [[0, 'fear'], [sp2 - 0.6, 'wonder', { dur: 0.5 }]]), gaze: [0.6, -0.9 * lightK] }, 'vi-a');
      ctx.restore();
      // the flood of light across the lens as it comes up
      const fl = Math.max(0, 1 - Math.abs(t - (sp2 - 1.0)) / 0.45); if (fl > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,244,200,${0.55 * fl})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
      // the ground under the caption band stays dark enough for the words
      const sh = ctx.createLinearGradient(0, 1240, 0, 1560); sh.addColorStop(0, 'rgba(10,4,14,0)'); sh.addColorStop(1, `rgba(10,4,14,${0.6 * e})`); ctx.fillStyle = sh; ctx.fillRect(0, 1240, W, 700);
      fin(ctx, T);
    },
    post: (t) => ({ bloom: 0.55, vignette: 0.42, paper: 0.26 }) });

  // ── 22 · THE WORD: dark, embers; itihasa in gold; it opens into its three parts as each is said; then the meaning ──
  R.scene({ id: 'word',
    draw(ctx, t, env) {
      const T = env.T, S = env.strings, b = env.beats, w = env.words, u = t / env.dur, cam = frame('push', u, { z: 1.0, f: [540, 800] }, { z: 1.5, f: [540, 800] }, (x) => x);
      const tW = w[3] ? w[3].t0 : 0.9, tI = [w[4], w[5], w[6]].map((q, i) => (q ? q.t0 : 2 + i * 0.6)), tM = w[7] ? w[7].t0 : 4;
      ST.shot(ctx, T, { pal: 'arrival-umber-gold', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createRadialGradient(540, 800, 80, 540, 800, 1300); gr.addColorStop(0, '#4a2c0a'); gr.addColorStop(0.5, '#1c1006'); gr.addColorStop(1, '#060302'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); } },
        { z: 0.5, haze: false, draw: (g) => { KIT.glow(g, 540, 800, 760 + 120 * Math.sin(T * 1.7), '#ffb040', 0.26 + 0.14 * u + 0.1 * Math.sin(T * 2.6));
          g.save(); g.translate(540, 800); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU + T * 0.5; g.fillStyle = 'rgba(255,170,60,0.13)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a - 0.06) * 1700, Math.sin(a - 0.06) * 1700); g.lineTo(Math.cos(a + 0.06) * 1700, Math.sin(a + 0.06) * 1700); g.fill(); } g.restore(); } },
        { z: 1.2, haze: false, draw: (g) => ST.particles(g, T * 2.2, { kind: 'ember', count: 120, cam }) },
        { z: 1.6, haze: false, draw: (g) => ST.particles(g, T * 3 + 3, { kind: 'ember', count: 70, cam }) },
      ] });
      const parts = S.wordParts.map((q) => q.toUpperCase()), gl = S.wordGloss, size = 150, y = 820, sheen = ((t * 0.8) % 1.5) * 1.5 - 0.4, zs = lerp(0.86, 0.98, u);
      ctx.save(); ctx.translate(540, y); ctx.scale(zs, zs); ctx.translate(-540, -y);
      ctx.save(); ctx.font = R.font(size, 'display', 700); ctx.letterSpacing = '10px'; const ws = parts.map((q) => ctx.measureText(q).width); ctx.restore();
      const a0 = clamp((t - 0.03) / 0.22), sp = E.inOutSine(clamp((t - tI[0] + 0.12) / 0.3));
      const tot = ws[0] + ws[1] + ws[2], gap = 86 * sp, x0 = 540 - (tot + 2 * gap) / 2; let x = x0;
      if (sp <= 0.02) KIT.goldText(ctx, S.wordWhole.toUpperCase(), 540, y, { size, spacing: 10, weight: 700, alpha: a0, glow: 0.45, sheen, key: 'tr-whole' });
      else parts.forEach((q, i) => { const cx = x + ws[i] / 2, said = clamp((t - tI[i] + 0.04) / 0.14), lift = 1 + 0.12 * Math.sin(Math.PI * clamp((t - tI[i] + 0.04) / 0.4));
        ctx.save(); ctx.translate(cx, y - 50); ctx.scale(lift, lift); ctx.translate(-cx, -(y - 50));
        KIT.goldText(ctx, q, cx, y, { size, spacing: 10, weight: 700, alpha: a0 * (sp > 0 ? lerp(0.45, 1, Math.max(said, 0)) : 1), glow: 0.45, sheen, key: 'tr-w' + i }); ctx.restore();
        if (said > 0) { ctx.save(); ctx.globalAlpha = said; ctx.fillStyle = '#e7b54a'; ctx.fillRect(cx - ws[i] / 2, y + 34, ws[i], 4); ctx.font = R.font(54, 'caption', 600, 'italic'); ctx.textAlign = 'center'; ctx.fillStyle = '#fff0d0'; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = R.px(8); ctx.fillText(gl[i], cx, y + 104); ctx.restore(); }
        x += ws[i] + gap; });
      const m = clamp((t - tM + 0.08) / 0.2); if (m > 0) KIT.goldText(ctx, S.wordMeaning.toUpperCase(), 540, 1130, { size: 76, spacing: 8, weight: 700, alpha: m, glow: 0.35, sheen: sheen - 0.2, key: 'tr-mean' });
      ctx.restore(); void b;
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.5, vignette: 0.55, paper: 0.3 }) });

  // ── 23 · THE PROMISE. p1: the eighteen books run up the frame. p2: the vow again, closer. p3: the spears again. ──
  R.scene({ id: 'p1',
    draw(ctx, t, env) {
      const T = env.T, S = env.strings, u = t / env.dur, cam = frame('tilt', u, { z: 1.06, f: [540, 700] }, { z: 1.06, f: [540, 1100] }, (x) => x);
      ST.shot(ctx, T, { pal: 'memory-indigo', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createLinearGradient(0, -400, 0, 2200); gr.addColorStop(0, '#05061c'); gr.addColorStop(1, '#1a2470'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); KIT.glow(g, 540, 900, 900, '#4a6ae0', 0.3); } },
        { z: 1, haze: false, draw: (g) => { const B = S.books || []; g.textAlign = 'center'; g.font = R.font(58, 'display', 700);
          B.forEach((nm, i) => { const col = i % 2, r = Math.floor(i / 2), x = col ? 790 : 290, y = 330 + r * 112 + (col ? 34 : 0), k = clamp((t - i * 0.022) / 0.1); if (k <= 0) return;
            g.globalAlpha = k; g.fillStyle = 'rgba(8,10,40,0.7)'; g.fillRect(x - 235, y - 62, 470, 92); g.fillStyle = '#e7b54a'; g.fillRect(x - 235, y - 62, 470, 4); g.fillRect(x - 235, y + 26, 470, 4);
            let fs = 58; g.font = R.font(fs, 'display', 700); while (g.measureText(nm.toUpperCase()).width > 440 && fs > 30) { fs -= 2; g.font = R.font(fs, 'display', 700); } g.fillStyle = '#ffe9a8'; g.fillText(nm.toUpperCase(), x, y); }); g.globalAlpha = 1; } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T * 2, { kind: 'ember', count: 40, cam }) },
      ] });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.3 }) });
  R.scene({ id: 'p2',
    draw(ctx, t, env) { const T = env.T; vowWorld(ctx, T, 2.2 + t, frame('pull', t / env.dur, { z: 2.3, f: [380, 520], s: [540, 760] }, { z: 1.7, f: [400, 640], s: [540, 800] }, (x) => x), 0.6, 1); fin(ctx, T); },
    post: () => ({ bloom: 0.36, vignette: 0.42, paper: 0.3 }) });
  R.scene({ id: 'p3',
    draw(ctx, t, env) { const T = env.T; fieldWorld(ctx, T, frame('slide', t / env.dur, { z: 1.7, f: [60, 1050] }, { z: 1.7, f: [330, 1050] }, (x) => x), { bow: 1, sit: 1, turn: 1 }); fin(ctx, T); },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.3 }) });

  // ── 24 · FIRST: the Naimisha fire at the blue hour; the storyteller comes to it ──
  const firelit = (x, fl) => ({ ...EP41.lit(x, fl, 0.85), fill: 0.45, intensity: 1.5 });
  R.scene({ id: 'first',
    draw(ctx, t, env) {
      const T = env.T, cam = frame('crane', t / env.dur, { z: 1.34, f: [540, 560] }, { z: 1.06, f: [540, 960] }, ev(E.outCubic));
      const arrive = E.outCubic(clamp(t / (env.dur * 0.9))), sx = lerp(1240, 850, arrive);
      EP41.naimisha(ctx, T, cam, { figs: (g, p, fl) => {
        CH.elder.draw(g, { x: 190, y: GY + 20, scale: 0.9, facing: 'right', pose: { name: 'sit', base: 'sit' }, light: firelit(190, fl), t: T, key: 'pr-el' });
        CH.sauti.draw(g, { x: sx, y: GY + 20, scale: 0.94, facing: 'left', pose: { name: 'walk', phase: ACT.stride(1240 - sx, 0.94), stride: 0.9 }, light: firelit(sx, fl), t: T, key: 'pr-sa' });
      } });
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.38, vignette: 0.5, paper: 0.3 }) });

  // ── 25 · FOLLOW: first light; Vyasa by the great fire, a hand opening to us; FOLLOW arrives on its word ──
  R.scene({ id: 'follow',
    draw(ctx, t, env) {
      const T = env.T, S = env.strings, w = env.words, b1 = w[4] ? w[4].t0 : env.dur * 0.6, cam = frame('push', t / env.dur, { z: 1.02, f: [560, 1000] }, { z: 1.22, f: [600, 940] }, (x) => x), fl = KIT.flicker(T, 5);
      ST.shot(ctx, T, { pal: 'naimisha-firstlight', cam, layers: [
        { z: 0, draw: (g, p) => ST.sky(g, p, { hz: 1330, sun: [240, 1180, 90] }) },
        { z: 0.25, draw: (g, p) => { ST.cloudBank(g, p, T, { y: 400, count: 5, size: 1.5, speed: 16 }); ST.treeline(g, p, { y: 1340, h: 760, T, seed: 21, kind: 'sal' }); } },
        { z: 0.6, draw: (g, p) => ST.treeline(g, p, { y: 1370, h: 1050, gap: 520, T, seed: 23, color: p.near, kind: 'banyan' }) },
        { z: 0.9, haze: false, draw: (g) => { g.fillStyle = '#0a0604'; g.beginPath(); g.moveTo(690, -900); g.bezierCurveTo(710, 600, 680, 1200, 640, GY + 40); g.lineTo(980, GY + 40); g.bezierCurveTo(930, 1200, 900, 600, 930, -900); g.fill(); g.fillStyle = 'rgba(255,200,140,0.12)'; g.fillRect(700, -900, 26, GY + 900); } },
        { z: 0.8, haze: false, draw: (g) => { KIT.glow(g, 300, GY - 300, 700, '#ff8a2a', 0.4 * fl); CH.hearthfire.draw(g, { x: 300, y: GY - 10, scale: 0.78, t: T, k: 1.1, key: 'fo-f' }); } },
        { z: 1, haze: false, draw: (g, p) => { ST.ground(g, p, { y: GY - 20 });
          g.save(); g.globalCompositeOperation = 'lighter'; g.translate(300, GY + 40); g.scale(1, 0.2); KIT.glow(g, 0, 0, 700, '#ff8a2a', 0.4 * fl); g.restore();
          fig('vyasaSage', g, T, 800, GY + 30, 0.8, 'left', ACT.pose(t, [[0, 'stand'], [b1 - 0.4, 'offer', { act: 0.6 }]], { prop: false }), { dir: Math.atan2(200, -500), intensity: 1.6 * fl, front: 1, fill: 0.75, tint: ['#fff0d0', 0.35], minLum: 0.4 }, { emo: ACT.emo(t, [[0, 'calm'], [b1, 'tender']]), gaze: [0.7, 0.1] }, 'fo-v'); } },
        { z: 1.4, haze: false, draw: (g) => ST.particles(g, T, { kind: 'ember', count: 44, box: [0, 300, 640, 1000], cam }) },
        { z: 1.9, haze: false, soft: 0.3, draw: (g, p) => { ST.trunks(g, p, { xs: [-230, 1300], w: 190 }); ST.grass(g, p, { y: 1950, h: 280, T, count: 40 }); } },
      ] });
      const kf = clamp((t - b1 + 0.05) / 0.12);
      if (kf > 0) { ctx.save(); ctx.globalAlpha = 0.62 * kf; ctx.fillStyle = '#120a08'; ctx.beginPath(); ctx.roundRect(60, 600, 600, 150, 22); ctx.fill(); ctx.restore();
        KIT.goldText(ctx, (S.followWord || '').toUpperCase(), 360, 700, { size: 104, spacing: 10, weight: 700, alpha: kf, glow: 0.4, sheen: clamp((t - b1) / 0.8) * 1.5 - 0.25, key: 'tr-follow' }); }
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.36, vignette: 0.45, paper: 0.3 }) });

  // ── 26 · THE END CARD: on the last word and one struck note. The source line, episode 1, FOLLOW. Embers and a slow pull. ──
  R.scene({ id: 'endcard',
    draw(ctx, t, env) {
      const T = env.T, S = env.strings, u = t / env.dur, cam = frame('pull', u, { z: 1.14, f: [540, 960] }, { z: 1.0, f: [540, 960] }, ev(E.outCubic)), z = lerp(1.05, 1, E.outCubic(u));
      ST.shot(ctx, T, { pal: 'arrival-umber-gold', cam, layers: [
        { z: 0, haze: false, draw: (g) => { const gr = g.createRadialGradient(540, 900, 80, 540, 900, 1400); gr.addColorStop(0, '#5a340c'); gr.addColorStop(0.5, '#1c1006'); gr.addColorStop(1, '#060302'); g.fillStyle = gr; g.fillRect(-900, -900, 2880, 3720); } },
        { z: 0.5, haze: false, draw: (g) => { KIT.glow(g, 540, 900, 800, '#ffb040', 0.3 * (1 - 0.4 * u) + 0.04 * Math.sin(T * 3)); g.save(); g.translate(540, 900); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU - T * 0.2; g.fillStyle = 'rgba(255,170,60,0.06)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a - 0.06) * 1700, Math.sin(a - 0.06) * 1700); g.lineTo(Math.cos(a + 0.06) * 1700, Math.sin(a + 0.06) * 1700); g.fill(); } g.restore(); } },
        { z: 0.8, haze: false, draw: (g) => CH.hearthfire.draw(g, { x: 540, y: 1700, scale: 0.9, t: T, k: 1.1, key: 'ec-f' }) },
        { z: 1.2, haze: false, draw: (g) => ST.particles(g, T * 1.6, { kind: 'ember', count: 80, cam }) },
        { z: 1.6, haze: false, draw: (g) => ST.particles(g, T * 2.2 + 5, { kind: 'ember', count: 40, cam }) },
      ] });
      TY.source(ctx, T, 1, S, { y: 300 });
      ctx.save(); ctx.translate(540, 800); ctx.scale(z, z); ctx.translate(-540, -800);
      KIT.series.episodeTitle(ctx, T, 1, { ...S, episodeLabel: S.nextEpisodeLabel, episodeTitle: S.nextTitle }, { y: 640, key: 'tr-ep1' });
      KIT.goldText(ctx, (S.followWord || '').toUpperCase(), 540, 960, { size: 150, spacing: 14, weight: 700, alpha: 1, glow: 0.45, sheen: ((t * 0.7) % 1.5) * 1.5 - 0.4, key: 'tr-follow2' });
      ctx.fillStyle = PAL.gold; ctx.fillRect(540 - 260, 1010, 520, 4);
      ctx.restore();
      fin(ctx, T);
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }) });
})();
