/*
 * S1 · EASING & TIMING · 0.00–2.00 s (frames 0–119)
 *
 * The thesis of the reel: "it starts with a curve".
 *
 *   0.00  Ink. A crosshair sparks at the centre and the graph editor sweeps
 *         out of it, line by line, followed by ticks and mono labels.
 *   0.10  The signal dot pops in at P0.
 *   0.14  A straight (linear) curve draws on; handle knobs pop as it passes them.
 *   0.37  The handles swing out on a spring and the curve re-shapes live into
 *         cubic-bezier(0.83, 0, 0.17, 1), passing through a back-ease shape
 *         (anticipation and overshoot) before it settles. The spring's first
 *         crossing lands on beat 1 (0.50).
 *   0.46  The CSS for the curve types on under the graph. The last key lands
 *         on beat 2 (1.00) and the values "apply": a colour wave turns them signal.
 *   0.75  Playback: the playhead steps frame by frame, the dot rides the
 *         curve, frame dots are stamped along the path, and the spacing chart
 *         on the right leaves an onion-skin ghost every 3 frames: bunched at
 *         the ends, spread in the middle.
 *   1.50  Beat 3: the dot lands on P3 with a squash and a small camera punch
 *         (the camera has been pushing in slowly since frame 0). A highlight
 *         reads the spacing chart back in time order (its speed up the rail is
 *         the ease), then the chart folds up into the value dot, which zips into
 *         the hero dot (1.64–1.70). The impact sends a wave across the graph;
 *         each piece scales out or drops as it passes, brightest type first.
 *   1.53  The dot reels the curve in (its handles become the sub-curve's), winds
 *         up (pull-back and squash), holds, and at 1.75 whips along an arc to the
 *         centre, expanding (in-expo) until it floods the frame. Frame 119 is
 *         solid signal for the cut into S2.
 *
 * Graph fidelity: the stroke is always the true cubic of the live handles
 * (partial strokes are cut with de Casteljau, never approximated), and the
 * dot's height is solved from that same cubic, so it rides the stroke exactly.
 *
 * Final-render fidelity: UI (playhead, readouts) steps per frame so it stays
 * legible under motion blur, and the dots fill each blur sub-sample slice with
 * their true coverage (sweptBlob), so fast moves blur continuously.
 */
(function () {
  'use strict';
  const R = window.REEL;
  const { PAL, E, TAU, lerp, seg, smoothstep, font, rgba, hash } = R;

  // ─── Layout (logical px) ────────────────────────────────────────────────────
  const GX0 = 460, GX1 = 1460, GY0 = 240, GY1 = 840;   // graph box, 1000×600
  const GW = GX1 - GX0, GH = GY1 - GY0, CELL = 100;
  const CX = 960, CY = 540;                           // graph centre = frame centre
  const RAIL_X = 1560;                                // spacing chart
  const BASE = 922;                                   // baseline of the caption row
  const P0 = [GX0, GY1], P3 = [GX1, GY0];
  const gx = (u) => GX0 + u * GW;                     // normalised time  → x
  const gy = (v) => GY1 - v * GH;                     // normalised value → y
  const DOT_R = 11;

  // ─── Timeline (local seconds; the scene starts at 0, so beats are every 0.5)
  const TL = {
    grid: 0.04, pop: 0.10, drawOn: 0.14, drawEnd: 0.44,
    swing: 0.372, settle: 0.86,
    typeIn: 0.46, typeEnd: 1.00,
    rail: 0.52, playhead: 0.60, play: 0.75, land: 1.50,
    readback: 1.50, fold: 1.555, foldEnd: 1.655, merge: 1.64, mergeEnd: 1.70,
    reelIn: 1.53, windup: 1.56, launch: 1.75, reach: 1.92, cover: 1.975,
  };
  const PLAY_DUR = TL.land - TL.play;
  const GHOSTS = 15;                                  // intervals: one ghost every 3 frames

  /**
   * UI time. A graph editor's playhead and readouts step once per frame, so
   * they are evaluated at the start of the current frame: the final render's
   * motion-blur sub-samples then agree and the numbers stay legible, while the
   * dots (physical objects) keep their true blur.
   */
  const qt = (t) => Math.floor(t * 60 + 1e-6) / 60;
  /** One motion-blur sub-sample slice of the final render (180° shutter, 8 samples). */
  const SUB = 0.5 / 60 / 8;

  // ─── Small maths ────────────────────────────────────────────────────────────
  /** Damped harmonic spring 0 → 1, `dt` seconds after release. */
  function spring(dt, freq, zeta) {
    if (dt <= 0) return 0;
    const w = TAU * freq, wd = w * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w * dt) * (Math.cos(wd * dt) + (zeta * w / wd) * Math.sin(wd * dt));
  }
  const lerp2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  /** Control points of the sub-curve s ∈ [a, b] of a cubic (exact, de Casteljau). */
  function subCubic(p, a, b) {
    if (b <= a) return null;
    let c = p;
    if (b < 1) {
      const q0 = lerp2(c[0], c[1], b), q1 = lerp2(c[1], c[2], b), q2 = lerp2(c[2], c[3], b);
      const r0 = lerp2(q0, q1, b), r1 = lerp2(q1, q2, b);
      c = [c[0], q0, r0, lerp2(r0, r1, b)];
    }
    const s = a / b;
    if (s > 0) {
      const q0 = lerp2(c[0], c[1], s), q1 = lerp2(c[1], c[2], s), q2 = lerp2(c[2], c[3], s);
      const r0 = lerp2(q0, q1, s), r1 = lerp2(q1, q2, s);
      c = [lerp2(r0, r1, s), r1, q2, c[3]];
    }
    return c;
  }
  /** Time at which an eased 0→1 tween over [t0, t1] reaches `y` (bisection). */
  function timeAt(fn, t0, t1, y) {
    let lo = 0, hi = 1;
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (fn(m) < y) lo = m; else hi = m; }
    return lerp(t0, t1, lo);
  }
  const fix2 = (v) => { const s = v.toFixed(2); return s === '-0.00' ? '0.00' : s; };
  /** Sets the mono text state used by every label in this scene. */
  function textStyle(ctx, size, weight, tracking, align = 'left', baseline = 'alphabetic') {
    ctx.font = font(size, 'mono', weight);
    ctx.letterSpacing = `${tracking}px`;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
  }

  // ─── Handles: linear (on the diagonal) → CURVE, swung in polar coordinates ─
  const [BX1, BY1, BX2, BY2] = R.shared.CURVE;
  const polar = (dx, dy, near) => {
    let a = Math.atan2(dy, dx);
    if (near != null) { while (a - near > Math.PI) a -= TAU; while (near - a > Math.PI) a += TAU; }
    return { a, l: Math.hypot(dx, dy) };
  };
  // Vectors in screen px relative to their anchors (P0 for h1, P3 for h2).
  const H1_FROM = polar(GW / 3, -GH / 3), H1_TO = polar(BX1 * GW, -BY1 * GH, H1_FROM.a);
  const H2_FROM = polar(-GW / 3, GH / 3), H2_TO = polar((BX2 - 1) * GW, (1 - BY2) * GH, H2_FROM.a);

  const DRAW_EASE = E.inOutQuart;
  const T_KNOB1 = timeAt(DRAW_EASE, TL.drawOn, TL.drawEnd, 1 / 3);  // draw-on passes each knob
  const T_KNOB2 = timeAt(DRAW_EASE, TL.drawOn, TL.drawEnd, 2 / 3);

  function swingVec(t, from, to, delay) {
    const dt = t - TL.swing - delay;
    const fold = smoothstep(TL.settle - 0.14, TL.settle, t);      // land exactly on the target
    const sa = lerp(spring(dt, 3.0, 0.5), 1, fold);
    const sl = lerp(spring(dt, 2.6, 0.6), 1, fold);
    const a = lerp(from.a, to.a, sa), l = lerp(from.l, to.l, sl);
    return [Math.cos(a) * l, Math.sin(a) * l];
  }

  /** Handle state at t: control points in px and the normalised CSS params. */
  function handlesAt(t) {
    const d1 = swingVec(t, H1_FROM, H1_TO, 0);
    const d2 = swingVec(t, H2_FROM, H2_TO, 0.03);
    const p1 = [P0[0] + d1[0], P0[1] + d1[1]];
    const p2 = [P3[0] + d2[0], P3[1] + d2[1]];
    return { p1, p2, n: [(p1[0] - GX0) / GW, (GY1 - p1[1]) / GH, (p2[0] - GX0) / GW, (GY1 - p2[1]) / GH] };
  }
  /** Normalised playback time and eased value at t, solved from the live handles. */
  function playAt(t) {
    const u = seg(t, TL.play, TL.land);
    const n = handlesAt(Math.min(t, TL.land)).n;
    return { u, v: E.bezier(n[0], n[1], n[2], n[3])(u) };
  }
  const ghostTime = (i) => TL.play + (i / GHOSTS) * PLAY_DUR;

  // ─── Impact wave: pieces of the graph leave as it passes them ───────────────
  const WAVE_SPEED = 10000, FALL_DUR = 0.12;          // the far corner clears by ~1.76
  /** 0 (untouched) → 1 (gone) for an element anchored at (x, y); `lead` starts it early. */
  function fallK(t, x, y, lead = 0) {
    if (t < TL.land) return 0;
    const start = TL.land + 0.025 + Math.hypot(x - P3[0], y - P3[1]) / WAVE_SPEED - lead;
    return seg(t, start, start + FALL_DUR);
  }
  const shrink = (k) => 1 - E.inOutCubic(k);          // lines, ticks, marks scale out
  const dropY = (k) => 34 * E.inQuad(k);               // type drops away...
  const dropA = (k) => 1 - E.inQuad(k);                // ...while it fades

  // ─── Grid: lines sweep out from the centre, split into cell-sized segments ─
  const H_LINES = [], V_LINES = [];
  for (let y = GY0; y <= GY1; y += CELL) H_LINES.push(y);
  for (let x = GX0; x <= GX1; x += CELL) V_LINES.push(x);
  const lineAlpha = (edge, axis) => (axis ? 0.34 : edge ? 0.13 : 0.075);

  /** Visible part [a, b] of a segment [s0, s1], clipped to the draw-on window and scaled out by the wave. */
  function segSpan(s0, s1, lo, hi, k) {
    const m = (s0 + s1) / 2, h = ((s1 - s0) / 2) * shrink(k);
    const a = Math.max(m - h, lo), b = Math.min(m + h, hi);
    return b > a ? [a, b] : null;
  }

  /**
   * Bright leading tips on a line while it sweeps out (they fade as it slows),
   * so a 7% grid still reads as motion. `horiz`: line along x at `pos`.
   */
  function sweepTips(ctx, horiz, pos, half, p) {
    const a = 0.7 * Math.sqrt(1 - p);
    if (a < 0.01) return;
    const len = Math.min(48, half);
    for (const dir of [-1, 1]) {
      const tip = (horiz ? CX : CY) + dir * half, tail = tip - dir * len;
      const g = horiz ? ctx.createLinearGradient(tail, 0, tip, 0) : ctx.createLinearGradient(0, tail, 0, tip);
      g.addColorStop(0, rgba(PAL.paper, 0));
      g.addColorStop(1, rgba(PAL.paper, a));
      ctx.strokeStyle = g;
      ctx.beginPath();
      if (horiz) { ctx.moveTo(tail, pos + 0.5); ctx.lineTo(tip, pos + 0.5); } else { ctx.moveTo(pos + 0.5, tail); ctx.lineTo(pos + 0.5, tip); }
      ctx.stroke();
    }
  }

  function drawGrid(ctx, t, pulse) {
    ctx.lineWidth = 1;
    for (const y of H_LINES) {
      const t0 = TL.grid + (Math.abs(y - CY) / (GH / 2)) * 0.14;
      const p = E.outQuint(seg(t, t0, t0 + 0.42)), half = (GW / 2) * p;
      if (half <= 0) continue;
      const a = lineAlpha(y === GY0, y === GY1) * pulse;
      for (let x = GX0; x < GX1; x += CELL) {
        const k = fallK(t, x + CELL / 2, y);
        const s = segSpan(x, x + CELL, CX - half, CX + half, k);
        if (!s) continue;
        ctx.strokeStyle = rgba(PAL.paper, a * (1 - 0.4 * k));
        ctx.beginPath(); ctx.moveTo(s[0], y + 0.5); ctx.lineTo(s[1], y + 0.5); ctx.stroke();
      }
      sweepTips(ctx, true, y, half, p);
    }
    for (const x of V_LINES) {
      const t0 = TL.grid + 0.02 + (Math.abs(x - CX) / (GW / 2)) * 0.18;
      const p = E.outQuint(seg(t, t0, t0 + 0.42)), half = (GH / 2) * p;
      if (half <= 0) continue;
      const a = lineAlpha(x === GX1, x === GX0) * pulse;
      for (let y = GY0; y < GY1; y += CELL) {
        const k = fallK(t, x, y + CELL / 2);
        const s = segSpan(y, y + CELL, CY - half, CY + half, k);
        if (!s) continue;
        ctx.strokeStyle = rgba(PAL.paper, a * (1 - 0.4 * k));
        ctx.beginPath(); ctx.moveTo(x + 0.5, s[0]); ctx.lineTo(x + 0.5, s[1]); ctx.stroke();
      }
      sweepTips(ctx, false, x, half, p);
    }
    // The origin crosshair the grid grows out of.
    // Starts on frame 1, so the motion-blurred frame 0 of the reel stays pure ink.
    const c = seg(t, 1 / 60, 0.1), cOut = seg(t, 0.12, 0.3);
    if (c > 0 && cOut < 1) {
      const arm = 11 * E.outBack(c);
      ctx.strokeStyle = rgba(PAL.paper, 0.85 * (1 - cOut));
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(CX - arm, CY + 0.5); ctx.lineTo(CX + arm, CY + 0.5);
      ctx.moveTo(CX + 0.5, CY - arm); ctx.lineTo(CX + 0.5, CY + arm);
      ctx.stroke();
    }
  }

  // ─── Axes: ticks, tick labels and titles ────────────────────────────────────
  function drawAxes(ctx, t) {
    ctx.lineWidth = 1;
    // Time-axis ticks every 20 px (major every 100), drawn on from the origin.
    for (let i = 0; i <= 50; i++) {
      const x = GX0 + i * 20, major = i % 5 === 0, t0 = 0.26 + i * 0.0045;
      const p = E.outExpo(seg(t, t0, t0 + 0.2)) * shrink(fallK(t, x, GY1 + 6));
      if (p <= 0) continue;
      ctx.strokeStyle = rgba(PAL.paper, major ? 0.42 : 0.2);
      ctx.beginPath(); ctx.moveTo(x + 0.5, GY1 + 1); ctx.lineTo(x + 0.5, GY1 + 1 + (major ? 10 : 5) * p); ctx.stroke();
    }
    // Value-axis ticks, bottom → top.
    for (let i = 0; i <= 30; i++) {
      const y = GY1 - i * 20, major = i % 5 === 0, t0 = 0.28 + i * 0.0065;
      const p = E.outExpo(seg(t, t0, t0 + 0.2)) * shrink(fallK(t, GX0 - 6, y));
      if (p <= 0) continue;
      ctx.strokeStyle = rgba(PAL.paper, major ? 0.42 : 0.2);
      ctx.beginPath(); ctx.moveTo(GX0 - 1, y + 0.5); ctx.lineTo(GX0 - 1 - (major ? 10 : 5) * p, y + 0.5); ctx.stroke();
    }

    textStyle(ctx, 12, 400, 1, 'center');
    for (let i = 0; i <= 5; i++) {                        // time labels every 0.2
      const x = GX0 + i * 200, t0 = 0.34 + i * 0.03;
      const p = E.outCubic(seg(t, t0, t0 + 0.22)), k = fallK(t, x, GY1 + 26);
      if (p <= 0 || k >= 1) continue;
      ctx.fillStyle = rgba(PAL.paper, 0.4 * p * dropA(k));
      ctx.fillText((i / 5).toFixed(1), x + 0.5, GY1 + 32 + (1 - p) * 6 + dropY(k));
    }
    ctx.textAlign = 'right';
    for (let i = 0; i <= 2; i++) {                        // value labels 0 / 0.5 / 1
      const y = GY1 - i * 300, t0 = 0.36 + i * 0.05;
      const p = E.outCubic(seg(t, t0, t0 + 0.22)), k = fallK(t, GX0 - 26, y);
      if (p <= 0 || k >= 1) continue;
      ctx.fillStyle = rgba(PAL.paper, 0.4 * p * dropA(k));
      ctx.fillText((i / 2).toFixed(1), GX0 - 18 - (1 - p) * 6, y + 4 + dropY(k));
    }

    // Axis titles sit at the positive end of each axis. TIME waits until the
    // handle swing is done, because the swinging h1 label passes through its spot.
    textStyle(ctx, 12, 700, 3, 'right');
    const pT = E.outCubic(seg(t, 0.74, 0.96));
    let k = fallK(t, GX1 - 40, BASE);
    if (pT > 0 && k < 1) {
      ctx.fillStyle = rgba(PAL.paper, 0.55 * pT * dropA(k));
      ctx.fillText('TIME →', GX1 + 3 - (1 - pT) * 12, BASE + dropY(k));   // +3 cancels trailing tracking
    }
    const pV = E.outCubic(seg(t, 0.44, 0.68));
    k = fallK(t, GX0 - 56, GY0 + 40);
    if (pV > 0 && k < 1) {
      ctx.save();
      ctx.translate(GX0 - 52, GY0 - 3 + (1 - pV) * 12 + dropY(k));
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = rgba(PAL.paper, 0.55 * pV * dropA(k));
      ctx.fillText('VALUE →', 0, 0);
      ctx.restore();
    }
    ctx.letterSpacing = '0px';
  }

  // ─── Spacing chart: equal time steps, eased value ───────────────────────────
  /** After the landing the chart folds up like an accordion into the value dot (0 → 1). */
  const foldK = (t) => E.inOutQuart(seg(t, TL.fold, TL.foldEnd));
  const READBACK_STEP = 0.006;                        // s between ghosts in the landing read-back

  function drawSpacing(ctx, t) {
    const grow = E.outExpo(seg(t, TL.rail, TL.rail + 0.34));
    if (grow <= 0) return;
    const kf = foldK(t);
    ctx.lineWidth = 1;
    // Rail: grows bottom → top, then retracts upward with the folding ghosts.
    const top = GY1 - GH * grow, bottom = lerp(GY1, GY0, kf);
    if (bottom - top > 0.5) {
      ctx.strokeStyle = rgba(PAL.paper, 0.2);
      ctx.beginPath(); ctx.moveTo(RAIL_X + 0.5, top); ctx.lineTo(RAIL_X + 0.5, bottom); ctx.stroke();
    }
    // End stops at value 0 and 1 (the top one goes when the value dot leaves).
    ctx.strokeStyle = rgba(PAL.paper, 0.45);
    for (const [y, t0, t1] of [[GY1, TL.rail, TL.fold - 0.02], [GY0, TL.rail + 0.2, TL.merge]]) {
      const p = E.outBack(seg(t, t0, t0 + 0.16)) * (1 - E.inCubic(seg(t, t1, t1 + 0.07)));
      if (p <= 0) continue;
      ctx.beginPath(); ctx.moveTo(RAIL_X - 10 * p, y + 0.5); ctx.lineTo(RAIL_X + 10 * p, y + 0.5); ctx.stroke();
    }
    // Onion-skin ghosts: one per equal time step, stamped as the playhead passes.
    // On the landing a highlight reads them back in time order, so its speed up
    // the rail is the ease itself; then they fold into the value dot.
    if (kf < 1) {
      for (let i = 0; i <= GHOSTS; i++) {
        const ti = ghostTime(i);
        if (t < ti) break;
        const y = lerp(gy(playAt(ti).v), GY0, kf);
        const p = E.outBack(seg(t, ti, ti + 0.1));
        if (p <= 0) continue;
        const th = TL.readback + i * READBACK_STEP, h = t < th ? 0 : Math.exp(-(t - th) * 26);
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(PAL.paper, 0.6 + 0.4 * h);
        ctx.beginPath(); ctx.moveTo(RAIL_X - (20 + 10 * h) * p, y + 0.5); ctx.lineTo(RAIL_X - 9 * p, y + 0.5); ctx.stroke();
        ctx.fillStyle = rgba(PAL.signal, 0.16 + 0.84 * h);
        ctx.strokeStyle = rgba(PAL.signal, 0.8 + 0.2 * h);
        ctx.lineWidth = 1.5;
        ctx.beginPath(); R.circlePath(ctx, RAIL_X, y, (6 + 1.5 * h) * p); ctx.fill(); ctx.stroke();
      }
    }
    // Labels: the step label leaves on the landing, the title as the chart folds.
    const pL = E.outCubic(seg(t, TL.rail + 0.08, TL.rail + 0.3));
    if (pL <= 0) return;
    textStyle(ctx, 12, 700, 3, 'center');
    let k = seg(t, TL.fold, TL.fold + FALL_DUR);
    if (k < 1) {
      ctx.fillStyle = rgba(PAL.paper, 0.55 * pL * dropA(k));
      ctx.fillText('SPACING', RAIL_X + 1.5, GY0 - 26 + (1 - pL) * 6 + dropY(k));
    }
    textStyle(ctx, 12, 400, 1, 'center');
    k = seg(t, TL.land + 0.02, TL.land + 0.02 + FALL_DUR);
    if (k < 1) {
      ctx.fillStyle = rgba(PAL.paper, 0.4 * pL * dropA(k));
      ctx.fillText('Δt 3F', RAIL_X + 0.5, GY1 + 32 + (1 - pL) * 6 + dropY(k));
    }
    ctx.letterSpacing = '0px';
  }

  // ─── The curve, its handles and keyframes ───────────────────────────────────
  /** Drawn parameter range [a, b]: draws on from P0, later reeled into the dot at P3. */
  const curveRange = (t) => [E.inOutCubic(seg(t, TL.reelIn, TL.reelIn + 0.17)), DRAW_EASE(seg(t, TL.drawOn, TL.drawEnd))];

  function drawCurve(ctx, t, hs) {
    const [a, b] = curveRange(t);
    const c = subCubic([P0, hs.p1, hs.p2, P3], a, b);
    if (!c) return;
    ctx.strokeStyle = PAL.signal;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(c[0][0], c[0][1]);
    ctx.bezierCurveTo(c[1][0], c[1][1], c[2][0], c[2][1], c[3][0], c[3][1]);
    ctx.stroke();
    ctx.lineCap = 'butt';
    // Motion-path frame dots (as in a 2D app's motion path): one per ghost,
    // equal in x, so they bunch where the value is slow. They leave with the curve.
    const tail = c[0][0];
    ctx.fillStyle = rgba(PAL.paper, 0.9);
    for (let i = 1; i < GHOSTS; i++) {
      const ti = ghostTime(i);
      if (t < ti) break;
      const { u, v } = playAt(ti), x = gx(u);
      if (x < tail + 4) continue;
      const r = 2.2 * E.outBack(seg(t, ti, ti + 0.08));
      ctx.beginPath(); ctx.arc(x, gy(v), r, 0, TAU); ctx.fill();
    }
  }

  /** Faint dashed diagonal: the "linear" the curve started as. */
  function drawLinearRef(ctx, t) {
    const p = seg(t, TL.swing, TL.swing + 0.2);
    if (p <= 0) return;
    const a = E.inOutCubic(seg(t, TL.land, TL.land + 0.2));     // retracts toward P3
    if (a >= 1) return;
    ctx.strokeStyle = rgba(PAL.paper, 0.2 * p);
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 7]);
    const s = lerp2(P0, P3, a);
    ctx.beginPath(); ctx.moveTo(P3[0], P3[1]); ctx.lineTo(s[0], s[1]); ctx.stroke();
    ctx.setLineDash([]);
  }

  /**
   * Handles and knobs. While the dot reels the curve in, the handles shown are
   * those of the remaining sub-curve (exactly what splitting a path gives), so
   * they shorten with it and fold into the dot. This is editor chrome, so the
   * scene draws it at frame time (qt): under the final 8-sample motion blur the
   * thin lines and knob outlines stay crisp instead of fanning into stepped copies.
   */
  function drawHandles(ctx, t, hs) {
    const [a] = curveRange(t);
    if (t < T_KNOB1 || a >= 1) return;
    const c = a > 0 ? subCubic([P0, hs.p1, hs.p2, P3], a, 1) : [P0, hs.p1, hs.p2, P3];
    const fold = 1 - E.inCubic(a);
    // Until the swing the handle lines lie under the stroke, so they only need
    // drawing from then on; the knobs pop as the draw-on passes them.
    const lines = seg(t, TL.swing - 0.02, TL.swing);
    const handles = [[c[0], c[1], T_KNOB1, 0], [c[3], c[2], T_KNOB2, 2]];
    if (lines > 0) {
      ctx.strokeStyle = rgba(PAL.paper, 0.75 * lines);
      ctx.lineWidth = 1.5;
      for (const [A, B] of handles) { ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); }
    }
    textStyle(ctx, 12, 500, 0.5, 'center', 'middle');
    // Readouts wait until the knobs have swung clear of the stroke.
    const lp = seg(t, TL.swing + 0.05, TL.swing + 0.14) * (1 - seg(t, TL.land, TL.land + 0.06));
    for (const [, B, t0, ni] of handles) {
      const s = E.outBack(seg(t, t0 + 0.01, t0 + 0.2)) * fold;
      if (s <= 0) continue;
      const h = 6 * s;
      ctx.fillStyle = PAL.ink;
      ctx.fillRect(B[0] - h, B[1] - h, 2 * h, 2 * h);
      ctx.strokeStyle = PAL.paper;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(B[0] - h, B[1] - h, 2 * h, 2 * h);
      if (lp <= 0) continue;                                  // h1 reads above its knob, h2 below
      const L = B, txt = `${fix2(hs.n[ni])}, ${fix2(hs.n[ni + 1])}`;
      let tx = L[0], ty = L[1] + (ni === 0 ? -24 : 24);
      if (ni === 0 && L[1] > GY1 + 4) {
        // While h1 overshoots below the time axis its readout flips to the right
        // of the knob (clear of the ticks) instead of landing on the tick labels.
        tx = L[0] + 16 + ctx.measureText(txt).width / 2; ty = Math.max(L[1], GY1 + 20);
      }
      ctx.fillStyle = rgba(PAL.paper, 0.7 * lp);
      ctx.fillText(txt, Math.round(tx), Math.round(ty));
    }
    ctx.letterSpacing = '0px';
    ctx.textBaseline = 'alphabetic';
  }

  /** Keyframe markers (small paper diamonds) on P0 and P3. */
  function drawKeys(ctx, t) {
    for (const [P, t0] of [[P0, TL.pop + 0.04], [P3, TL.drawEnd - 0.03]]) {
      const s = E.outBack(seg(t, t0, t0 + 0.16)) * shrink(fallK(t, P[0], P[1] + 1));
      if (s <= 0) continue;
      const h = 5 * s;
      ctx.fillStyle = PAL.paper;
      ctx.save();
      ctx.translate(P[0], P[1]);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-h, -h, 2 * h, 2 * h);
      ctx.restore();
    }
  }

  // ─── Playhead ───────────────────────────────────────────────────────────────
  function drawPlayhead(ctx, t, u) {
    const pIn = seg(t, TL.playhead, TL.playhead + 0.15);
    const out = E.inCubic(seg(t, TL.land, TL.land + 0.09));        // line retracts, flag shrinks away
    if (pIn <= 0 || out >= 1) return;
    const x = Math.round(gx(u)) + 0.5;
    const len = (GY1 - GY0 + 12) * E.outExpo(seg(t, TL.playhead + 0.04, TL.playhead + 0.3)) * (1 - E.inOutCubic(seg(t, TL.land, TL.land + 0.07)));
    ctx.strokeStyle = rgba(PAL.paper, 0.55);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, GY0 - 12); ctx.lineTo(x, GY0 - 12 + len); ctx.stroke();
    // Flag with the normalised time.
    const fy = GY0 - 37 - (1 - E.outBack(pIn)) * 14, s = 1 - out;
    ctx.save();
    ctx.translate(x, fy + 12);
    ctx.scale(s, s);
    ctx.globalAlpha = E.outCubic(pIn);
    ctx.fillStyle = PAL.paper;
    ctx.beginPath();
    R.roundRectPath(ctx, -25, -12, 50, 20, 2);
    ctx.moveTo(-5, 8); ctx.lineTo(5, 8); ctx.lineTo(0, 13); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = PAL.ink;
    textStyle(ctx, 12, 700, 0.5, 'center', 'middle');
    ctx.fillText(u.toFixed(2), 0.25, -1.5);
    ctx.restore();
    ctx.letterSpacing = '0px';
    ctx.textBaseline = 'alphabetic';
  }

  // ─── Caption: the CSS types on under the graph ──────────────────────────────
  const CAPTION = `cubic-bezier(${R.shared.CURVE.join(', ')})`;
  // Deterministic, slightly human keystroke rhythm (a beat after the paren).
  const KEY_TIMES = (() => {
    const w = [...CAPTION].map((ch, i) => 0.65 + 0.7 * hash(i, 31) + (CAPTION[i - 1] === '(' ? 1.6 : 0) + (CAPTION[i - 1] === ',' ? 0.5 : 0));
    const total = w.reduce((s, x) => s + x, 0);
    let acc = 0;
    return w.map((x) => { acc += x; return TL.typeIn + (TL.typeEnd - TL.typeIn) * (acc / total); });
  })();
  // The values type in paper and "apply" on the closing paren (beat 2): a colour
  // wave runs left → right and turns them signal, like highlighting on a parse.
  const T_COMMIT = KEY_TIMES[KEY_TIMES.length - 1];
  const FIRST_NUM = CAPTION.indexOf('(') + 1;
  function charColor(ch, i, t) {
    if (/[(),]/.test(ch)) return rgba(PAL.paper, 0.45);
    if (!/[0-9.]/.test(ch)) return PAL.paper;
    const c0 = T_COMMIT + 0.004 * (i - FIRST_NUM), k = seg(t, c0, c0 + 0.05);
    return k >= 1 ? PAL.signal : R.mix(PAL.paper, PAL.signal, E.outCubic(k));
  }

  function drawCaption(ctx, t, T) {
    if (t < TL.typeIn - 0.04) return;
    textStyle(ctx, 24, 500, 0);
    const adv = ctx.measureText('0').width;             // monospace advance
    let shown = 0;
    for (let i = 0; i < CAPTION.length; i++) {
      if (t < KEY_TIMES[i]) break;
      shown = i + 1;
      const x = GX0 + i * adv, k = fallK(t, x, BASE, 0.07);   // the brightest type leaves early, so the eye goes to the dot
      if (k >= 1 || CAPTION[i] === ' ') continue;
      const pop = seg(t, KEY_TIMES[i], KEY_TIMES[i] + 0.05);
      ctx.fillStyle = charColor(CAPTION[i], i, t);
      ctx.globalAlpha = (0.35 + 0.65 * pop) * dropA(k);
      ctx.fillText(CAPTION[i], x, BASE + (1 - E.outCubic(pop)) * 3 + dropY(k));
    }
    ctx.globalAlpha = 1;
    // Caret: solid while typing, then blinks on the 8th-note grid until the landing.
    const lastKey = shown ? KEY_TIMES[shown - 1] : TL.typeIn;
    const typing = t - lastKey < 0.08 && shown < CAPTION.length;
    if (t < TL.land && (typing || shown === 0 || R.fract(T / 0.25) < 0.5)) {
      ctx.fillStyle = PAL.signal;
      ctx.fillRect(GX0 + shown * adv + 1, BASE - 20, 2, 25);
    }
  }

  // ─── The dot ────────────────────────────────────────────────────────────────
  const LAUNCH_DIR = (() => { const dx = CX - P3[0], dy = CY - P3[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; })();
  const WINDUP = 34;
  const WIND_P = [P3[0] - LAUNCH_DIR[0] * WINDUP, P3[1] - LAUNCH_DIR[1] * WINDUP];
  // The whip follows an arc that bows down-right of the straight line.
  const WHIP_CTRL = [lerp(WIND_P[0], CX, 0.4) + LAUNCH_DIR[1] * 120, lerp(WIND_P[1], CY, 0.4) - LAUNCH_DIR[0] * 120];
  // Released like a spring: one frame of ramp, then a snap and a long settle into centre.
  const WHIP_EASE = E.bezier(0.3, 0, 0.15, 1);
  const quad = (a, c, b, s) => { const u = 1 - s; return [u * u * a[0] + 2 * u * s * c[0] + s * s * b[0], u * u * a[1] + 2 * u * s * c[1] + s * s * b[1]]; };

  /** Dot centre at t (pure, so velocity can be sampled from it). */
  function dotPos(t) {
    if (t < TL.play) return P0;
    if (t <= TL.land) { const { u, v } = playAt(t); return [gx(u), gy(v)]; }
    if (t < TL.launch) return lerp2(P3, WIND_P, E.outCubic(seg(t, TL.windup, TL.launch)));
    return quad(WIND_P, WHIP_CTRL, [CX, CY], WHIP_EASE(seg(t, TL.launch, TL.reach)));
  }
  function velocity(t) {
    const a = dotPos(t - 0.004), b = dotPos(t + 0.004);
    return [(b[0] - a[0]) / 0.008, (b[1] - a[1]) / 0.008];
  }

  /**
   * A blob (circle of radius r, scaled by `along` in direction `ang` and by
   * `across` perpendicular) drawn as its exact coverage while it moves from
   * state a to state b one motion-blur sub-sample later. The final render
   * averages 8 samples per frame; on very fast moves those showed as stepped
   * copies and concentric rings. Filling each slice with its true coverage
   * joins them into continuous blur (same shutter, just better sampled). The
   * cores are painted solid on top so the hero colour stays exact.
   */
  const SWEPT_HALF = 128, SWEPT_K = 8;                 // supersampling buffer (logical px) and sub-samples
  function sweptBlob(ctx, a, b, color) {
    const dx = b.c[0] - a.c[0], dy = b.c[1] - a.c[1];
    const ca = Math.cos(a.ang), sa = Math.sin(a.ang);
    const lx = (dx * ca + dy * sa) / a.along, ly = (-dx * sa + dy * ca) / a.across;   // displacement in blob space
    const dl = Math.hypot(lx, ly), dr = b.r - a.r, r0 = Math.max(0, a.r);
    ctx.save();
    ctx.translate(a.c[0], a.c[1]);
    ctx.rotate(a.ang);
    ctx.scale(a.along, a.across);
    if (dr >= dl && dr > 0.3) {
      // Growing faster than it moves: the circles nest, so a pixel on the circle
      // at fraction w of the slice is covered for (1 − w) of it. That is exactly
      // a two-circle radial gradient.
      const g = ctx.createRadialGradient(0, 0, r0, lx, ly, b.r);
      g.addColorStop(0, rgba(color, 1)); g.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(lx, ly, b.r, 0, TAU); ctx.fill();
      // (falls through to paint the solid core r0 on top)
    } else if (dl > 0.3 && 0.9 * SWEPT_HALF > (Math.max(a.r, b.r) * Math.max(a.along, a.across, b.along, b.across)) + Math.hypot(dx, dy)) {
      // Moving: supersample the slice. Additive blending of K discs at 1/K
      // alpha on a transparent buffer sums coverage exactly (source-over would not).
      // The buffer shares the canvas transform, offset by whole device pixels, so
      // it lands 1:1 on the frame without resampling.
      ctx.restore();
      const buf = R.buffer('s1-swept', 2 * SWEPT_HALF, 2 * SWEPT_HALF), g = buf.ctx;
      const M = ctx.getTransform(), size = buf.canvas.width;
      const mid = M.transformPoint(new DOMPoint((a.c[0] + b.c[0]) / 2, (a.c[1] + b.c[1]) / 2));
      const ox = Math.round(mid.x) - size / 2, oy = Math.round(mid.y) - size / 2;
      buf.clear();
      g.setTransform(M.a, M.b, M.c, M.d, M.e - ox, M.f - oy);
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 1 / SWEPT_K;
      g.fillStyle = color;
      for (let j = 0; j < SWEPT_K; j++) {
        const s = (j + 0.5) / SWEPT_K;
        g.save();
        g.translate(lerp(a.c[0], b.c[0], s), lerp(a.c[1], b.c[1], s));
        g.rotate(R.lerpAngle(a.ang, b.ang, s));
        g.scale(lerp(a.along, b.along, s), lerp(a.across, b.across, s));
        g.beginPath(); g.arc(0, 0, Math.max(0, lerp(a.r, b.r, s)), 0, TAU); g.fill();
        g.restore();
      }
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(buf.canvas, ox, oy);
      ctx.restore();
      // Solid core (inside every sub-sample) keeps the hero colour exact.
      const rc = Math.min(r0, b.r) - dl / 2;
      if (rc > 0) {
        ctx.save();
        ctx.translate(a.c[0], a.c[1]);
        ctx.rotate(a.ang);
        ctx.scale(a.along, a.across);
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(lx / 2, ly / 2, rc, 0, TAU); ctx.fill();
        ctx.restore();
      }
      return;
    }
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(0, 0, r0, 0, TAU); ctx.fill();
    ctx.restore();
  }

  /** The hero dot at t: centre, radius and squash/stretch (pure, so it can be sampled). */
  function dotState(t) {
    const c = dotPos(t);
    let r = DOT_R * spring(t - TL.pop, 4.2, 0.36);
    r *= 1 + 0.5 * E.inOutCubic(seg(t, TL.reelIn, TL.reelIn + 0.17));    // gains mass as it swallows the curve...
    const dm = t - TL.mergeEnd;                                           // ...and gulps the value dot
    if (dm > 0) r *= 1 + 0.24 * Math.exp(-dm * 20) * (1 - Math.exp(-dm * 150));
    let ang = 0, along = 1, across = 1;
    if (t > TL.play && t < TL.land) {
      // Stretch along the velocity: the dot has mass.
      const [vx, vy] = velocity(t), s = 0.28 * smoothstep(1400, 4800, Math.hypot(vx, vy));
      ang = Math.atan2(vy, vx); along = 1 + s; across = 1 / Math.sqrt(1 + s);
    } else if (t >= TL.land && t < TL.windup) {
      // Impact: squash against the stop, then a damped rebound.
      const dt = t - TL.land, sq = 0.32 * Math.exp(-dt * 24) * Math.cos(dt * TAU * 7);
      along = 1 - sq; across = 1 + sq * 0.8;
    } else if (t >= TL.windup && t < TL.launch) {
      // Wind-up: compress along the launch axis.
      const w = E.outCubic(seg(t, TL.windup, TL.launch));
      ang = Math.atan2(LAUNCH_DIR[1], LAUNCH_DIR[0]); along = 1 - 0.24 * w; across = 1 + 0.16 * w;
    } else if (t >= TL.launch) {
      // Whip: stretch along the path, relaxing as it swells.
      const [vx, vy] = velocity(t), s = 0.5 * smoothstep(300, 5000, Math.hypot(vx, vy)) * (1 - seg(t, TL.reach - 0.06, TL.reach));
      ang = Math.atan2(vy, vx); along = 1 + s; across = 1 / Math.sqrt(1 + s);
      r = lerp(r, 1250, E.inExpo(seg(t, TL.launch, TL.cover)));
    }
    return { c, r, ang, along, across };
  }

  function drawDot(ctx, t) {
    if (t < TL.pop) return;
    sweptBlob(ctx, dotState(t), dotState(t + SUB), PAL.signal);

    // Pop and impact rings.
    for (const [t0, P, r0, r1, dur] of [[TL.pop, P0, 12, 40, 0.3], [TL.land, P3, 14, 50, 0.18]]) {
      const p = seg(t, t0, t0 + dur);
      if (p <= 0 || p >= 1) continue;
      ctx.strokeStyle = rgba(PAL.paper, 0.7 * (1 - p));
      ctx.lineWidth = 2 * (1 - p) + 0.5;
      ctx.beginPath(); R.circlePath(ctx, P[0], P[1], lerp(r0, r1, E.outExpo(p))); ctx.stroke();
    }
  }

  // ─── Value dot on the spacing chart, plus the guide that links it ──────────
  /**
   * The value dot at t, or null. It rides the rail with the eased value, and
   * once the chart has folded into it, it zips left (with a little
   * anticipation) and is swallowed by the hero dot.
   */
  const MERGE_EASE = E.backIn(1.4);
  function valueDotState(t) {
    const km = seg(t, TL.merge, TL.mergeEnd);
    let s = spring(t - (TL.rail + 0.18), 4.4, 0.38);
    if (s <= 0 || km >= 1) return null;
    let c = [RAIL_X, gy(playAt(t).v)], ang = Math.PI / 2, along = 1, across = 1;
    if (t > TL.play && t < TL.land) {
      const vy = (playAt(t + 0.004).v - playAt(t - 0.004).v) * GH / 0.008;
      const st = 0.3 * smoothstep(1400, 4800, Math.abs(vy));
      along = 1 + st; across = 1 / Math.sqrt(1 + st);
    } else if (km > 0) {
      const target = dotPos(t), from = [RAIL_X, GY0];
      c = lerp2(from, target, MERGE_EASE(km));
      ang = Math.atan2(target[1] - from[1], target[0] - from[0]);
      const st = 0.4 * E.inCubic(km);
      along = 1 + st; across = 1 / Math.sqrt(1 + st);
      s *= 1 - 0.4 * E.inCubic(km);
    }
    return { c, r: 8.5 * s, ang, along, across };
  }

  function drawValueDot(ctx, t) {
    const a = valueDotState(t);
    if (!a) return;
    // Dashed guide from the hero dot (UI: steps per frame, like the playhead).
    const tq = qt(t), { u: uq, v: vq } = playAt(tq);
    if (t > TL.play && t < TL.land + 0.05) {
      const g = seg(t, TL.play, TL.play + 0.08) * (1 - seg(t, TL.land, TL.land + 0.05));
      const yy = Math.round(gy(vq)) + 0.5;
      ctx.strokeStyle = rgba(PAL.paper, 0.28 * g);
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 5]);
      ctx.beginPath(); ctx.moveTo(gx(uq) + 16, yy); ctx.lineTo(RAIL_X - 22, yy); ctx.stroke();
      ctx.setLineDash([]);
    }
    const b = valueDotState(t + SUB) || a;
    sweptBlob(ctx, a, b, PAL.signal);
    // Live value readout; it leaves as the chart starts to fold.
    const k = seg(t, TL.fold, TL.fold + 0.1);
    const al = seg(t, TL.play - 0.05, TL.play + 0.05) * dropA(k);
    if (al <= 0) return;
    ctx.fillStyle = rgba(PAL.paper, al);
    textStyle(ctx, 12, 500, 0.5, 'left', 'middle');
    ctx.fillText(vq.toFixed(2), RAIL_X + 20, Math.round(gy(vq)) + 0.5 + dropY(k));
    ctx.letterSpacing = '0px';
    ctx.textBaseline = 'alphabetic';
  }

  // ─── Scene ──────────────────────────────────────────────────────────────────
  /**
   * Camera: a slow push-in across the shot, plus a short zoom punch when the
   * dot lands on beat 3. Scale about the frame centre.
   */
  function cameraZoom(t) {
    const push = 0.025 * E.inOutSine(seg(t, 0, TL.land));
    const dt = t - TL.land;
    const punch = dt > 0 ? 0.014 * Math.exp(-dt * 14) * (1 - Math.exp(-dt * 120)) : 0;
    return 1 + push + punch;
  }

  R.scene({
    id: 'easing', index: 1, label: 'Easing & Timing', start: 0, end: 2,
    draw(ctx, t, env) {
      const { W, H } = env;
      // Hand-off to S2: from here the dot has swallowed the frame.
      if (t >= TL.cover) { ctx.fillStyle = PAL.signal; ctx.fillRect(0, 0, W, H); return; }
      ctx.fillStyle = PAL.ink;
      ctx.fillRect(0, 0, W, H);

      const z = cameraZoom(t);
      ctx.translate(CX, CY);
      ctx.scale(z, z);
      ctx.translate(-CX, -CY);

      const hs = handlesAt(t);
      // The grid breathes on beats 1 and 2.
      const pulse = 1 + (env.T > 0.45 && env.T < 1.45 ? 0.6 * R.beatPulse(env.T, 10) : 0);

      drawGrid(ctx, t, pulse);
      drawAxes(ctx, t);
      drawLinearRef(ctx, t);
      drawSpacing(ctx, t);
      drawCaption(ctx, t, env.T);
      drawHandles(ctx, qt(t), handlesAt(qt(t)));            // editor chrome steps per frame
      drawCurve(ctx, t, hs);
      drawKeys(ctx, t);
      drawPlayhead(ctx, t, seg(qt(t), TL.play, TL.land));     // the playhead steps per frame
      drawValueDot(ctx, t);
      drawDot(ctx, t);
    },
  });
})();
