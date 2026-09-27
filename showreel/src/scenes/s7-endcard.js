/*
 * S7 · CONTACT · 12.00–15.00 s (frames 720–899) · the signature
 *
 * Calm and confident after the chaos. S6 ended on a dying dot at the centre
 * and three frames of black; the drop re-ignites that point.
 *
 *   12.00  Impact from the centre: a flash, an anamorphic streak (the CRT line
 *          switching back on, landing on the name's baseline), a paper
 *          shockwave that is born as a disc and hollows into a ring, a signal
 *          echo ring and a spray of fine sparks. The camera punches and settles.
 *   12.00  CLAUDE rises out of its baseline mask left→right, one letter per
 *          letter tick in the mix (60 ms apart), while the tracking closes in.
 *   12.25  The signal dot pops in at the start of the underline and the S1
 *          bezier handles draw out of the curve's end points.
 *   12.50  Beat. After a small wind-up the dot plays the S1 curve exactly as it
 *          did in S1 (x linear in time, y = cubic-bezier(0.83, 0, 0.17, 1)),
 *          the stroke drawing on behind it. "Motion Designer" settles in letter
 *          by letter as the dot passes under it.
 *   13.00  Beat. The dot lands at the end of the curve with a squash; the
 *          handles fold away and the mono credit types on under the shelf.
 *   13.00 / 13.50 / 14.00 / 14.50  One accent per pluck, alternating left and
 *          right like the plucks' panning: a signal circle, a cobalt triangle,
 *          an acid square, a lilac ring.
 *   13.50–15.00  Hold: a slow push-in with parallax, the accents float, the dot
 *          breathes on the beat. Frame 899 is the hero still / thumbnail.
 */
(function () {
  'use strict';
  const R = window.REEL;
  const { PAL, E, TAU, clamp, lerp, seg, smoothstep, font, rgba } = R;

  const W = R.W, H = R.H, CX = W / 2, CY = H / 2;
  const COMP_Y = 532;                 // optical centre of the type block (slightly above the middle)

  // ─── Timeline (local seconds; the scene starts on beat 24, so every 0.5 is a beat)
  const TL = {
    // The drop lands half a shutter after the cut, so frame 720 is still black
    // even in the motion-blurred render (its sub-samples span 0–7.3 ms).
    drop: 0.008,
    letter0: 0.008, letterGap: 0.06, letterDur: 0.5, // tick i lands at 0.05 + 0.06 i
    trackDur: 1.0,
    dotPop: 0.25, handlesIn: 0.25, windup: 0.40,
    launch: 0.50, land: 1.00,                         // the ride: exactly one beat
    handlesOut: 1.0,                                  // the handles snap home on the landing beat
    type: 1.04, cps: 105, caretOff: 2.25,
    accents: [1.0, 1.5, 2.0, 2.5],
  };
  const RIDE = TL.land - TL.launch;

  // ─── Type ───────────────────────────────────────────────────────────────────
  const NAME = 'CLAUDE', NAME_SIZE = 272, NAME_TRACK = -6, TRACK_FROM = 30;
  const NAME_KERN = { 2: 3, 3: 3 };   // extra px before glyph i: L|A, A|U
  const SUB = 'Motion Designer', SUB_SIZE = 70;
  const CREDIT = [['SHOWREEL 2026', 700, 0.88], ['EVERY FRAME RENDERED IN CODE', 400, 0.55]];
  const CREDIT_SIZE = 15, CREDIT_TRACK = 4, CREDIT_LEAD = 25;
  const NAME_FONT = font(NAME_SIZE, 'display', 900);
  const SUB_FONT = font(SUB_SIZE, 'serif', 400, 'italic');

  // ─── The S1 curve, reprised as the underline ───────────────────────────────
  const [K1X, K1Y, K2X, K2Y] = R.shared.CURVE;
  const CURVE_H = 132, STROKE = 6, DOT_R = 11;
  const bx = (s) => { const u = 1 - s; return 3 * u * u * s * K1X + 3 * u * s * s * K2X + s * s * s; };
  /** Bezier parameter s at which the curve's normalised x equals u (bx is monotonic). */
  function sAtX(u) {
    if (u <= 0) return 0;
    if (u >= 1) return 1;
    let lo = 0, hi = 1;
    for (let i = 0; i < 32; i++) { const m = (lo + hi) / 2; if (bx(m) < u) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  const lerp2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  /** Control points of the sub-curve s ∈ [0, b] (de Casteljau), so a partial stroke is the exact cubic. */
  function headCubic(p, b) {
    const q0 = lerp2(p[0], p[1], b), q1 = lerp2(p[1], p[2], b), q2 = lerp2(p[2], p[3], b);
    const r0 = lerp2(q0, q1, b), r1 = lerp2(q1, q2, b);
    return [p[0], q0, r0, lerp2(r0, r1, b)];
  }

  /** Damped harmonic spring 0 → 1, `dt` seconds after release. */
  function spring(dt, freq, zeta) {
    if (dt <= 0) return 0;
    const w = TAU * freq, wd = w * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w * dt) * (Math.cos(wd * dt) + (zeta * w / wd) * Math.sin(wd * dt));
  }

  // ─── Layout: measured once from the real fonts (pure values, safe to cache) ─
  //
  //     C L A U D E
  //                          ___________●      ← the curve's high shelf …
  //                         /  SHOWREEL 2026   … hangs the credit, right-aligned,
  //     Motion Designer    /   EVERY FRAME …   its last line on the serif baseline
  //     __________________/
  //     ↑ the low run is the serif line's baseline rule
  //
  // The S-curve is the lockup's structure: its two flat runs make two pockets,
  // and each text line sits in one. Everything hangs off two verticals, the
  // C's bowl on the left and the E's arms on the right (accents included).
  let L = null;
  function measure() {
    const g = document.createElement('canvas').getContext('2d');
    const ink = (text) => { const m = g.measureText(text); return { l: m.actualBoundingBoxLeft, r: m.actualBoundingBoxRight, a: m.actualBoundingBoxAscent, d: m.actualBoundingBoxDescent }; };

    // Name: kerned glyph origins at the final tracking, centred on the ink box.
    g.font = NAME_FONT;
    g.letterSpacing = `${NAME_TRACK}px`;
    const glyphs = R.layoutLetters(g, NAME, 'left');
    g.letterSpacing = '0px';
    for (const gl of glyphs) Object.assign(gl, ink(gl.ch));
    // Optical kerning: at −6 px tracking the diagonal feet of L|A and A|U close
    // to a 3 px sliver that fills in at thumbnail size. Open just those pairs.
    let kern = 0;
    for (const gl of glyphs) { kern += NAME_KERN[gl.i] || 0; gl.x += kern; }
    const first = glyphs[0], last = glyphs[glyphs.length - 1];
    const shift = CX - (first.x - first.l + last.x + last.r) / 2;
    for (const gl of glyphs) gl.x += shift;
    const capH = ink('H').a;
    const inkL = first.x - first.l, inkR = last.x + last.r;
    const maskBelow = Math.max(...glyphs.map((gl) => gl.d)) + 2;

    // Vertical: cap height, gap, curve. The block is centred on COMP_Y.
    const GAP_CURVE = 50, SUB_LIFT = 42;
    const capTop = Math.round(COMP_Y - (capH + GAP_CURVE + CURVE_H) / 2);
    const nameBase = capTop + capH;
    const curveTop = nameBase + GAP_CURVE, curveBot = curveTop + CURVE_H;

    // Underline spans the name's ink: the round cap starts flush with the C's
    // bowl, and the resting dot's right edge lines up with the E's arms.
    const x0 = inkL + STROKE / 2, x1 = inkR - DOT_R;
    const w = x1 - x0;
    const P = [[x0, curveBot], [x0 + K1X * w, curveBot - K1Y * CURVE_H], [x0 + K2X * w, curveBot - K2Y * CURVE_H], [x1, curveTop]];

    // Serif line: left-aligned to the C, standing on the curve's low run.
    g.font = SUB_FONT;
    const subGlyphs = R.layoutLetters(g, SUB, 'left');
    const subShift = inkL + ink(SUB).l;
    const subBase = curveBot - SUB_LIFT;
    // Each letter starts to settle the moment the dot passes under its centre.
    for (const gl of subGlyphs) {
      gl.x += subShift;
      gl.t0 = TL.launch + clamp((gl.x + gl.w / 2 - x0) / w) * RIDE;
    }

    // Mono credit: two lines hung under the shelf, right-aligned to the E. Its
    // last line shares the serif line's baseline, so the two sub-lines read
    // as one typographic row broken by the curve's rise.
    const creditBase = subBase - (CREDIT.length - 1) * CREDIT_LEAD;
    const chars = [], lines = [];
    CREDIT.forEach(([text, weight, alpha], li) => {
      g.font = font(CREDIT_SIZE, 'mono', weight);
      g.letterSpacing = `${CREDIT_TRACK}px`;
      const row = [];
      let x = 0;
      for (const ch of text) { row.push({ ch, x, weight, alpha, line: li }); x += g.measureText(ch).width; }
      const lineW = x - CREDIT_TRACK;                 // the last letter's tracking is not ink
      const y = creditBase + li * CREDIT_LEAD;
      for (const c of row) { c.x += inkR - lineW; c.y = y; chars.push(c); }
      lines.push({ end: inkR, y });
    });
    g.letterSpacing = '0px';

    L = { glyphs, capH, capTop, nameBase, inkL, inkR, maskBelow, subGlyphs, subBase, curveTop, curveBot, P, x0, w, chars, lines };
    L.accents = placeAccents(L);
  }

  // ─── Accents: one per pluck (A4, C5, E5, A5; panned L, R, L, R) ─────────────
  // A pinwheel locked to the lockup's own grid, with the same half-turn
  // symmetry as the S-curve:
  //   · circle and triangle extend the curve's two flat runs outward (low run
  //     on the left, shelf on the right), so the curve reads as one long line;
  //   · square and ring sit on the lockup's two verticals (the C's bowl and
  //     the E's arms / dot / credit edge), above and below the block, equally
  //     far from its top and bottom.
  // Sizes are optical, not numeric: the triangle is larger than the circle
  // and the ring's stroke is weighted to match the solid shapes.
  // `depth` drives parallax under the push-in.
  const ACC_OUT = 170, ACC_GAP = 78;
  function placeAccents(l) {
    const lx = l.inkL, rx = l.inkR;
    return [
      { kind: 'circle', color: PAL.signal, x: lx - ACC_OUT, y: l.curveBot, size: 19, depth: 1.8, rot: 0, spin: 0 },
      { kind: 'triangle', color: PAL.cobalt, x: rx + ACC_OUT, y: l.curveTop, size: 29, depth: 1.5, rot: 0, spin: 1.0 },
      { kind: 'square', color: PAL.acid, x: lx, y: l.capTop - ACC_GAP, size: 14.5, depth: 0.7, rot: 0.26, spin: -1.2 },
      { kind: 'ring', color: PAL.lilac, x: rx, y: l.curveBot + ACC_GAP, size: 19.5, depth: 1.1, rot: 0, spin: 0 },
    ].map((a, i) => ({ ...a, t0: TL.accents[i], seed: i * 1.7 + 0.4 }));
  }

  // ─── Impact sparks (fixed at load; drawn analytically with drag) ───────────
  const SPARKS = (() => {
    const r = R.rng(7207), out = [], N = 96;
    for (let i = 0; i < N; i++) {
      out.push({
        a: ((i + r.range(-0.4, 0.4)) / N) * TAU,
        v: lerp(700, 3400, Math.pow(r(), 1.8)),
        k: r.range(3.6, 6.4),                       // drag
        life: r.range(0.3, 0.75),
        w: r.range(1, 2.3),
        color: r() < 0.2 ? PAL.signal : PAL.paper,
      });
    }
    return out;
  })();
  const sparkR = (s, t) => (s.v / s.k) * (1 - Math.exp(-s.k * t));

  // ─── Camera: the drop's punch, then a slow push-in (≤ 1 %) ─────────────────
  const punch = (t) => 0.035 * (1 - E.outExpo(seg(t, TL.drop, TL.drop + 1.2)));
  const push = (t) => 0.009 * E.inOutSine(seg(t, 0.7, 3.0));

  // ═══ Drawing ═══════════════════════════════════════════════════════════════

  /** Flash intensity: instant attack at the drop, fast exponential decay. */
  const flashI = (t) => (t <= 0 ? 0 : (1 - Math.exp(-t / 0.004)) * Math.exp(-t / 0.075));

  // ─── Shockwave rings: [inner, outer] radius at time t since the drop ───────
  function paperRing(t) {
    const pw = seg(t, 0, 0.8);
    const ro = 1300 * E.outQuart(pw);
    const w = Math.min(ro, ro * Math.pow(1 - seg(t, 0, 0.085), 2.4) + lerp(16, 1, E.outCubic(pw)));
    return [ro - w, ro];
  }
  function signalRing(t) {
    const ps = seg(t, 0.05, 0.85);
    const r = 1350 * E.outQuart(ps), w = lerp(10, 0.75, E.outCubic(ps));
    return [r - w / 2, r + w / 2];
  }
  // The final render's 8 sub-samples are ~1.04 ms apart; an edge feathered by
  // its travel over ~1.4 ms overlaps its neighbours and the steps disappear.
  const FEATHER_DT = 0.0014;

  /**
   * Annulus [rIn, rOut] with linear ramps outside each edge, as wide as that
   * edge's travel (dIn, dOut px) plus a hairline of anti-aliasing.
   */
  function softRing(ctx, cx, cy, rIn, rOut, dIn, dOut, color, alpha) {
    if (alpha <= 0.002 || rOut <= 0) return;
    const fIn = 0.6 + Math.abs(dIn), fOut = 0.6 + Math.abs(dOut);
    const a = Math.max(0, rIn - fIn), b = rOut + fOut, span = b - a;
    const g = ctx.createRadialGradient(cx, cy, a, cx, cy, b);
    // A disc (rIn ≤ 0) or a hole smaller than its feather starts partly lit.
    g.addColorStop(0, rgba(color, a > 0 ? 0 : alpha * clamp(1 - rIn / fIn)));
    g.addColorStop(clamp((Math.max(0, rIn) - a) / span), rgba(color, alpha));
    g.addColorStop(clamp((rOut - a) / span), rgba(color, alpha));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, b, 0, TAU);
    if (a > 0) { ctx.moveTo(cx + a, cy); ctx.arc(cx, cy, a, TAU, 0, true); }
    ctx.fill();
  }

  function drawBackdrop(ctx, t) {
    // A soft warm pool of light behind the type, lit by the flash and left glowing.
    const a = 0.045 * smoothstep(0, 0.35, t) + 0.25 * flashI(t);
    if (a <= 0.001) return;
    const g = ctx.createRadialGradient(CX, COMP_Y, 0, CX, COMP_Y, 980);
    g.addColorStop(0, rgba(PAL.paper, a));
    g.addColorStop(0.45, rgba(PAL.paper, a * 0.35));
    g.addColorStop(1, rgba(PAL.paper, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawImpact(ctx, t) {
    if (t <= 0 || t > 1.2) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const I = flashI(t);
    // Flash: a hot bloom at the centre and a slight lift of the whole frame.
    if (I > 0.002) {
      ctx.fillStyle = rgba(PAL.paper, 0.04 * I);
      ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, 620);
      g.addColorStop(0, rgba('#FFFFFF', 0.7 * I));
      g.addColorStop(0.12, rgba(PAL.paper, 0.32 * I));
      g.addColorStop(0.45, rgba(PAL.paper, 0.06 * I));
      g.addColorStop(1, rgba(PAL.paper, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      // Anamorphic streak: the CRT line switching back on.
      const sw = W * E.outExpo(seg(t, 0, 0.14));
      const sg = ctx.createLinearGradient(CX - sw / 2, 0, CX + sw / 2, 0);
      sg.addColorStop(0, rgba(PAL.paper, 0));
      sg.addColorStop(0.5, rgba('#FFFFFF', 0.9 * I));
      sg.addColorStop(1, rgba(PAL.paper, 0));
      ctx.fillStyle = sg;
      ctx.fillRect(CX - sw / 2, L.nameBase - 1.5, sw, 3);   // lands on the mask line the letters rise from
    }
    // Shockwave: born as a solid disc (the flash core) that hollows out into a
    // thinning paper ring; a thinner signal ring follows it out. Each edge is
    // feathered by how far it travels between motion-blur sub-samples, so the
    // 8-sample shutter fuses into one smooth smear instead of 8 stepped rings.
    if (t < 0.8) {
      const [i0, o0] = paperRing(t), [i1, o1] = paperRing(t + FEATHER_DT);
      softRing(ctx, CX, CY, i0, o0, i1 - i0, o1 - o0, PAL.paper, 0.95 * Math.pow(1 - seg(t, 0, 0.8), 1.3));
    }
    const ps = seg(t, 0.05, 0.85);
    if (ps > 0 && ps < 1) {
      const [i0, o0] = signalRing(t), [i1, o1] = signalRing(t + FEATHER_DT);
      softRing(ctx, CX, CY, i0, o0, i1 - i0, o1 - o0, PAL.signal, 0.85 * Math.pow(1 - ps, 1.3));
    }
    // Sparks: fine streaks thrown out of the centre, decelerating with drag.
    ctx.lineCap = 'round';
    for (const s of SPARKS) {
      const life = seg(t, 0, s.life);
      if (life >= 1) continue;
      const r1 = sparkR(s, t), r0 = sparkR(s, Math.max(0, t - 0.028));
      if (r1 - r0 < 0.3) continue;
      const c = Math.cos(s.a), sn = Math.sin(s.a);
      ctx.strokeStyle = rgba(s.color, Math.pow(1 - life, 1.5));
      ctx.lineWidth = s.w;
      ctx.beginPath(); ctx.moveTo(CX + c * r0, CY + sn * r0); ctx.lineTo(CX + c * r1, CY + sn * r1); ctx.stroke();
    }
    ctx.restore();
  }

  function drawName(ctx, t) {
    const extra = TRACK_FROM * (1 - E.outExpo(seg(t, TL.letter0, TL.letter0 + TL.trackDur)));
    const mid = (L.glyphs.length - 1) / 2;
    const top = L.capTop - 80, bottom = L.nameBase + L.maskBelow;
    ctx.font = NAME_FONT;
    ctx.fillStyle = PAL.paper;
    for (const gl of L.glyphs) {
      const t0 = TL.letter0 + gl.i * TL.letterGap;
      const p = E.outExpo(seg(t, t0, t0 + TL.letterDur));
      if (p <= 0) continue;
      const x = gl.x + (gl.i - mid) * extra;
      const rise = (1 - p) * (L.capH + L.maskBelow + 12);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x - gl.l - 30, top, gl.l + gl.r + 60, bottom - top);   // mask: glyph box, cut at the baseline
      ctx.clip();
      ctx.fillText(gl.ch, x, L.nameBase + rise);
      ctx.restore();
    }
  }

  /** Normalised position of the dot along the curve's x at time t (0 before launch, 1 after landing). */
  const rideU = (t) => seg(t, TL.launch, TL.land);

  function drawHandles(ctx, t) {
    const inP = E.outExpo(seg(t, TL.handlesIn, TL.handlesIn + 0.3));
    const out = E.inOutQuart(seg(t, TL.handlesOut + 0.03, TL.handlesOut + 0.23));
    const k = inP * (1 - out);
    if (k <= 0.001) return;
    const [P0, P1, P2, P3] = L.P;
    const h1 = lerp2(P0, P1, k), h2 = lerp2(P3, P2, k);
    ctx.strokeStyle = rgba(PAL.paper, 0.42);
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(P0[0], P0[1] + 0.5); ctx.lineTo(h1[0], h1[1] + 0.5);
    ctx.moveTo(P3[0], P3[1] + 0.5); ctx.lineTo(h2[0], h2[1] + 0.5);
    ctx.stroke();
    // Square knobs, as in the S1 graph editor. They let go first (deselected on
    // the landing beat) before the lines zip home: small hard squares moving
    // fast would strobe under the 8-sample blur.
    const knob = E.outBack(seg(t, TL.handlesIn + 0.12, TL.handlesIn + 0.3)) * (1 - E.outCubic(seg(t, TL.handlesOut, TL.handlesOut + 0.07)));
    if (knob <= 0) return;
    ctx.lineWidth = 1.5;
    for (const B of [h1, h2]) {
      const s = 5.5 * knob;
      ctx.fillStyle = PAL.ink;
      ctx.fillRect(B[0] - s, B[1] - s, 2 * s, 2 * s);
      ctx.strokeStyle = rgba(PAL.paper, 0.9);
      ctx.strokeRect(B[0] - s, B[1] - s, 2 * s, 2 * s);
    }
  }

  function drawCurve(ctx, t) {
    const u = rideU(t);
    if (u <= 0) return;
    const c = headCubic(L.P, sAtX(u));
    ctx.strokeStyle = PAL.signal;
    ctx.lineWidth = STROKE;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(c[0][0], c[0][1]);
    ctx.bezierCurveTo(c[1][0], c[1][1], c[2][0], c[2][1], c[3][0], c[3][1]);
    ctx.stroke();
    ctx.lineCap = 'butt';
  }

  function drawDot(ctx, t, T) {
    const pop = t - TL.dotPop;
    if (pop <= 0) return;
    const u = rideU(t), s = sAtX(u);
    let [x, y] = R.cubicPoint(L.P[0], L.P[1], L.P[2], L.P[3], s);
    let sx = 1, sy = 1, rot = 0;
    const size = spring(pop, 4.5, 0.4);
    if (t < TL.launch) {
      // Wind-up: pull back and squash, then release on the beat.
      const k = E.inOutSine(seg(t, TL.windup, TL.launch - 0.04)) * (1 - E.inQuad(seg(t, TL.launch - 0.04, TL.launch)));
      x -= 9 * k; sx = 1 - 0.22 * k; sy = 1 + 0.16 * k;
    } else if (t < TL.land) {
      // Stretch along the direction of travel.
      const dt = 1 / 240, s2 = sAtX(rideU(t + dt));
      const [x2, y2] = R.cubicPoint(L.P[0], L.P[1], L.P[2], L.P[3], s2);
      const v = Math.hypot(x2 - x, y2 - y) / dt;
      rot = Math.atan2(y2 - y, x2 - x);
      sx = 1 + Math.min(0.14, v / 16000); sy = 1 / sx;
    } else {
      // Landing: squash against the stop, spring back.
      const dt = t - TL.land, e = Math.exp(-dt * 11) * Math.cos(TAU * 4.2 * dt);
      sx = 1 - 0.3 * e; sy = 1 + 0.22 * e;
      x += 3 * e;
      // Subtle life in the hold: the dot breathes on the beat.
      const b = t > TL.land + 0.4 ? 0.07 * R.beatPulse(T, 9) : 0;
      sx *= 1 + b; sy *= 1 + b;
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(sx * size, sy * size);
    R.fillCircle(ctx, 0, 0, DOT_R, PAL.signal);
    ctx.restore();
    // A ring off the landing.
    const lp = seg(t, TL.land, TL.land + 0.45);
    if (lp > 0 && lp < 1) {
      ctx.strokeStyle = rgba(PAL.signal, 0.5 * (1 - lp));
      ctx.lineWidth = lerp(2.5, 0.75, lp);
      ctx.beginPath(); R.circlePath(ctx, L.P[3][0], L.P[3][1], lerp(DOT_R, 34, E.outExpo(lp))); ctx.stroke();
    }
  }

  function drawSubline(ctx, t) {
    ctx.font = SUB_FONT;
    for (const gl of L.subGlyphs) {
      const a = E.outCubic(seg(t, gl.t0, gl.t0 + 0.28));
      if (a <= 0) continue;
      const p = E.outExpo(seg(t, gl.t0, gl.t0 + 0.6));
      ctx.fillStyle = rgba(PAL.paper, 0.94 * a);
      ctx.fillText(gl.ch, gl.x, L.subBase - 18 * (1 - p));
    }
  }

  function drawCredit(ctx, t, T) {
    const n = Math.floor((t - TL.type) * TL.cps);
    if (n <= 0) return;
    const shown = Math.min(n, L.chars.length);
    ctx.letterSpacing = `${CREDIT_TRACK}px`;
    let weight = 0;
    for (let i = 0; i < shown; i++) {
      const c = L.chars[i];
      if (c.weight !== weight) { weight = c.weight; ctx.font = font(CREDIT_SIZE, 'mono', weight); }
      ctx.fillStyle = rgba(PAL.paper, c.alpha);
      ctx.fillText(c.ch, c.x, c.y);
    }
    ctx.letterSpacing = '0px';
    // Caret: rides the type-on, blinks on the 8th-note grid, then leaves.
    if (t >= TL.caretOff) return;
    const done = shown >= L.chars.length;
    if (done && R.fract(T / 0.25) >= 0.5) return;
    const c = L.chars[shown - 1];
    const x = done ? L.lines[c.line].end + 7 : c.x + 13;
    ctx.fillStyle = PAL.signal;
    ctx.fillRect(x, c.y - 13, 2, 16);
  }

  function drawAccent(ctx, a, t, T, cam) {
    const dt = t - a.t0;
    if (dt <= 0) return;
    const s = spring(dt, 5.5, 0.35);          // ~60 ms to full size, one soft overshoot
    // Float: a slow Lissajous drift that fades in after the pop.
    const f = smoothstep(0, 0.8, dt);
    const fx = 5 * f * Math.sin(TAU * 0.23 * T + a.seed);
    const fy = 7 * f * Math.sin(TAU * 0.31 * T + a.seed * 2.1);
    // Parallax: nearer accents spread more under the push-in.
    const k = 1 + cam * a.depth;
    const x = CX + (a.x - CX) * k + fx, y = COMP_Y + (a.y - COMP_Y) * k + fy;
    const rot = a.rot + a.spin * (1 - spring(dt, 2.8, 0.55)) + 0.05 * f * Math.sin(TAU * 0.17 * T + a.seed);
    // A thin ripple off the pop.
    const rp = seg(dt, 0, 0.4);
    if (rp < 1) {
      ctx.strokeStyle = R.mix(a.color, PAL.paper, a.kind === 'triangle' ? 0.4 : 0.15, 0.6 * Math.pow(1 - rp, 2));   // lift cobalt off the ink
      ctx.lineWidth = lerp(2.5, 0.75, rp);
      ctx.beginPath(); R.circlePath(ctx, x, y, a.size * lerp(0.9, 2.8, E.outExpo(rp))); ctx.stroke();
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.beginPath();
    accentPath(ctx, a.kind, a.size);
    if (a.kind === 'ring') {
      ctx.strokeStyle = a.color;
      ctx.lineWidth = 5;
      ctx.stroke();
    } else {
      ctx.fillStyle = a.color;
      ctx.fill();
    }
    ctx.restore();
  }

  /** Accent outline centred on the origin; `r` is the circumradius (half-side for the square). */
  function accentPath(ctx, kind, r) {
    if (kind === 'triangle') { ctx.moveTo(0, -r); ctx.lineTo(r * 0.866, r * 0.5); ctx.lineTo(-r * 0.866, r * 0.5); ctx.closePath(); }
    else if (kind === 'square') ctx.rect(-r, -r, 2 * r, 2 * r);
    else R.circlePath(ctx, 0, 0, r);                 // circle and ring
  }

  R.scene({
    id: 'endcard', index: 7, label: 'Contact', start: 12, end: 15,
    init() { measure(); },
    draw(ctx, t, env) {
      if (!L) measure();
      ctx.fillStyle = PAL.ink;
      ctx.fillRect(0, 0, W, H);
      const ti = t - TL.drop;                       // time since the drop
      drawBackdrop(ctx, ti);
      drawImpact(ctx, ti);

      const cam = push(t);
      const z = 1 + punch(t) + cam;
      ctx.save();
      ctx.translate(CX, COMP_Y); ctx.scale(z, z); ctx.translate(-CX, -COMP_Y);
      drawName(ctx, t);
      drawHandles(ctx, t);
      drawCurve(ctx, t);
      drawSubline(ctx, t);
      drawCredit(ctx, t, env.T);
      drawDot(ctx, t, env.T);
      ctx.restore();

      for (const a of L.accents) drawAccent(ctx, a, t, env.T, cam + punch(t));
    },
    hud(t) {
      // The HUD went dark with the CRT; it comes back on with the drop.
      return { alpha: E.outCubic(seg(t, 0.04, 0.5)) };
    },
  });
})();
