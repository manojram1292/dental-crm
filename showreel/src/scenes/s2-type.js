/*
 * S2 · KINETIC TYPE · 2.00–4.00 s (frames 120–239)
 *
 * "TIMING IS EVERYTHING": three words, three beats, three typographic ideas,
 * all hung on one grid (a 1440 px measure, kicker labels on its edges).
 *
 *   2.00  TIMING      ink on signal. A mask line draws on left → right a hair
 *                     ahead of the letters; each glyph rises out of its own box
 *                     above it, 35 ms stagger, outExpo, with a skew that settles
 *                     upright. The line wipes off to the right once they land.
 *   2.50  is          hard cut to ink. Instrument Serif Italic, huge, scaling
 *                     1.25 → 1 and un-rotating, then drifting on. The s trails
 *                     the ı by two frames and the tittle (S1's signal dot, there
 *                     from the very first frame) trails further and springs home.
 *   3.00  EVERYTHING  hard cut to paper. A variable-weight wave (100 ↔ 900) runs
 *                     through the word while tracking tightens. The layout is
 *                     re-measured every frame so glyphs never collide and the
 *                     ink stays optically centred. The wave dies into solid 900
 *                     exactly on the 3.50 beat.
 *   3.50  echo        outline copies telescope out above and below, one ring
 *                     per 32nd note. Each ring is masked to the slot beyond its
 *                     inner neighbour, so it really slides out from behind it and
 *                     rings never cross. Each ring is a *time-delayed* copy of the
 *                     word, so the weight wave replays outward. The camera pulls
 *                     back so the stack lands inside the safe area.
 *   3.80  exit        every row is split along its cap-height centre line; the
 *                     halves shear off alternately left and right, centre row
 *                     first, with anticipation and a speed-driven stretch.
 *
 * Contracts: frame 120 is solid signal (S1's circle), frame 239 solid paper (S3).
 */
(function () {
  'use strict';
  const R = window.REEL;
  const { PAL, E, W, H, TAU, font, seg, lerp } = R;

  // ── Timeline (local seconds; absolute = +2) ───────────────────────────────
  const T_IS = 0.5;        // 2.50 beat
  const T_EVERY = 1.0;     // 3.00 beat
  const T_ECHO = 1.5;      // 3.50 beat
  const T_EXIT = 1.8;      // 3.80
  const SHUTTER = 0.5 / R.FPS; // motion-blur sub-samples reach this far past a frame

  // ── Grid ──────────────────────────────────────────────────────────────────
  const MEASURE = 1440;                 // shared column width
  const COL_L = (W - MEASURE) / 2;      // 240
  const COL_R = COL_L + MEASURE;        // 1680
  const KICKER_GAP = 62;                // kicker baseline sits this far above the word's top ink
  const CX = W / 2, MID = H / 2;
  const SAFE_T = 124, SAFE_B = H - 124; // the echo stack must stay clear of the HUD bands

  // ── Type specs (sizes are fitted to the measure in init) ──────────────────
  const TIMING = { text: 'TIMING', size: 0, baseline: 0, glyphs: [] };
  const IS = { size: 660, baseline: 0, x: 0, sx: 0, tittle: null, kickerY: 0 };
  const EVERY = { text: 'EVERYTHING', size: 0, capH: 0, gap: 0, pitch: 0, zoomOut: 1 };

  const KICKERS = [
    { num: '01', name: 'MASK REVEAL', time: '02.00 S' },
    { num: '02', name: 'SERIF ITALIC', time: '02.50 S' },
    { num: '03', name: 'VARIABLE WEIGHT', time: '03.00 S' },
  ];

  // Measuring happens on a private canvas so draw-state never leaks into it.
  let mctx = null;

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Metrics of one glyph at a given font (memoised: pure, so no hidden state). */
  const glyphCache = new Map();
  function glyph(ch, size, weight) {
    const key = ch + size + '|' + weight;
    let g = glyphCache.get(key);
    if (!g) {
      mctx.font = font(size, 'display', weight);
      const m = mctx.measureText(ch);
      g = { adv: m.width, l: m.actualBoundingBoxLeft, r: m.actualBoundingBoxRight };
      glyphCache.set(key, g);
    }
    return g;
  }
  /** Pair kerning, measured at the pair's mean weight. */
  const kernCache = new Map();
  function kern(a, b, size, weight) {
    const key = a + b + size + '|' + weight;
    let k = kernCache.get(key);
    if (k === undefined) {
      mctx.font = font(size, 'display', weight);
      k = mctx.measureText(a + b).width - mctx.measureText(a).width - mctx.measureText(b).width;
      kernCache.set(key, k);
    }
    return k;
  }

  /**
   * Lay out a word whose glyphs each have their own weight. Returns glyph x
   * positions such that the *ink* (not the advance box) is centred on cx.
   */
  function layoutVariable(text, size, weights, tracking, cx) {
    const xs = new Array(text.length);
    let x = 0;
    for (let i = 0; i < text.length; i++) {
      xs[i] = x;
      x += glyph(text[i], size, weights[i]).adv + tracking;
      if (i < text.length - 1) x += kern(text[i], text[i + 1], size, Math.round((weights[i] + weights[i + 1]) / 2));
    }
    const n = text.length - 1;
    const inkL = xs[0] - glyph(text[0], size, weights[0]).l;
    const inkR = xs[n] + glyph(text[n], size, weights[n]).r;
    const off = cx - (inkL + inkR) / 2;
    for (let i = 0; i <= n; i++) xs[i] += off;
    return xs;
  }

  /**
   * Kicker row on the measure edges: bold number + technique on the left, the
   * beat it lands on at the right. Rises out of its own mask like the words.
   */
  function drawKicker(ctx, k, color, y, t0, t) {
    const p = E.outExpo(seg(t, t0, t0 + 0.35));
    if (p <= 0) return;
    const rise = (1 - p) * 22;
    ctx.save();
    ctx.beginPath();
    ctx.rect(COL_L - 10, y - 22, MEASURE + 20, 28);
    ctx.clip();
    ctx.fillStyle = color;
    ctx.textBaseline = 'alphabetic';
    ctx.letterSpacing = '3px';
    ctx.textAlign = 'left';
    ctx.font = font(15, 'mono', 700);
    ctx.fillText(k.num, COL_L, y + rise);
    const wNum = ctx.measureText(k.num).width;
    ctx.font = font(15, 'mono', 400);
    ctx.fillText('— ' + k.name, COL_L + wNum + 10, y + rise);
    ctx.textAlign = 'right';
    // the right label trails by one 32nd so the row reads as a little cascade
    const p2 = E.outExpo(seg(t, t0 + 0.035, t0 + 0.385));
    ctx.fillText(k.time, COL_R, y + (1 - p2) * 22);
    ctx.restore();
  }

  // ── 2.00 TIMING ───────────────────────────────────────────────────────────
  const TIMING_STAGGER = 0.035;
  const TIMING_START = SHUTTER; // first glyph moves only after frame 120's shutter closes

  function drawTiming(ctx, t) {
    ctx.fillStyle = PAL.signal;
    ctx.fillRect(0, 0, W, H);

    const { size, baseline, glyphs } = TIMING;
    const capH = size * 0.73;
    const maskY = baseline + size * 0.03; // just under the G's overshoot
    // a slow push-in during the hold keeps the still word alive into the cut
    const push = 1 + 0.018 * E.inOutSine(seg(t, 0.22, T_IS));
    ctx.save();
    ctx.translate(CX, baseline - capH / 2);
    ctx.scale(push, push);
    ctx.translate(-CX, -(baseline - capH / 2));

    // The mask line draws on left → right, its tip always a little ahead of
    // the glyph that is rising, then wipes off in the same direction.
    const grow = E.outExpo(seg(t, TIMING_START, TIMING_START + 0.3));
    const wipe = E.inOutQuint(seg(t, 0.3, 0.45)); // passes each glyph only once it has cleared the mask
    const lineL = lerp(COL_L, COL_R, wipe);
    const lineR = lerp(COL_L, COL_R, grow);
    if (lineR - lineL > 0.5) {
      ctx.fillStyle = PAL.ink;
      ctx.fillRect(lineL, maskY, lineR - lineL, 5);
    }

    ctx.font = font(size, 'display', 900);
    ctx.fillStyle = PAL.ink;
    for (const g of glyphs) {
      const s = TIMING_START + g.i * TIMING_STAGGER;
      const rise = E.outExpo(seg(t, s, s + 0.42));
      if (rise <= 0) continue;
      const lean = 1 - E.outQuint(seg(t, s, s + 0.5)); // skew trails the rise: follow-through
      ctx.save();
      ctx.beginPath();
      ctx.rect(g.clipL, baseline - capH * 1.5, g.clipR - g.clipL, maskY - (baseline - capH * 1.5));
      ctx.clip();
      ctx.translate(g.x, baseline + (1 - rise) * capH * 1.12);
      ctx.transform(1, 0, -Math.tan(0.2) * lean, 1, 0, 0);
      ctx.fillText(g.ch, 0, 0);
      ctx.restore();
    }
    ctx.restore();
    drawKicker(ctx, KICKERS[0], PAL.ink, baseline - capH - KICKER_GAP, 0.1, t);
  }

  // ── 2.50 is ───────────────────────────────────────────────────────────────
  const IS_S_LAG = 0.03;     // the s trails the ı: overlapping action
  const IS_DOT_LAG = 0.075;  // the tittle trails further, then springs home
  const dotSpring = E.spring(1, 0.5);

  /** Transform of the word u seconds after the cut: a big outExpo settle that never quite stops. */
  function isXform(ctx, u) {
    const uc = Math.max(0, u);
    const s = lerp(1.25, 1, E.outExpo(seg(uc, 0, 0.6))) * (1 - 0.06 * uc);
    const rot = lerp(-0.12, 0, E.outQuint(seg(uc, 0, 0.6)));
    const pivotY = IS.baseline - IS.size * 0.26; // middle of the x-height
    ctx.translate(CX, pivotY);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.translate(-CX, -pivotY);
  }

  function drawIs(ctx, t) {
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(0, 0, W, H);

    const u = t - T_IS;
    const { size, baseline, x, sx, tittle } = IS;
    ctx.font = font(size, 'serif', 400, 'italic');
    ctx.fillStyle = PAL.paper;
    ctx.save();
    isXform(ctx, u);
    ctx.fillText('ı', x, baseline); // dotless i: the tittle is ours
    ctx.restore();
    ctx.save();
    isXform(ctx, u - IS_S_LAG);
    ctx.fillText('s', x + sx, baseline);
    ctx.restore();

    // The tittle is S1's signal dot. It is there on the downbeat frame (so the
    // word never reads as "ıs"), arriving small and springing up to size.
    ctx.save();
    isXform(ctx, u - IS_DOT_LAG);
    const pop = lerp(0.4, 1, dotSpring(seg(u, 0, 0.45)));
    R.fillCircle(ctx, x + tittle.x * size, baseline + tittle.y * size, tittle.r * size * pop, PAL.signal);
    ctx.restore();
    drawKicker(ctx, KICKERS[1], PAL.paper, IS.kickerY, T_IS + 0.06, t);
  }

  // ── 3.00 EVERYTHING ───────────────────────────────────────────────────────

  /** Weight of glyph i at local time t: a travelling wave that dies into 900 on the 3.50 beat. */
  function waveWeight(i, t) {
    const tau = t - T_EVERY;
    const amp = 1 - E.inOutSine(seg(tau, 0.2, 0.5));
    const wave = 0.5 - 0.5 * Math.cos(TAU * 2.1 * tau - i * 0.78);
    return Math.round(lerp(900, lerp(100, 900, wave), amp));
  }
  function trackingAt(t) {
    return lerp(0.08, -0.012, E.outQuint(seg(t - T_EVERY, 0, 0.5))) * EVERY.size;
  }
  /** Weights + glyph x positions of the word as it was at local time t. */
  function everyState(t) {
    const n = EVERY.text.length, weights = new Array(n);
    for (let i = 0; i < n; i++) weights[i] = waveWeight(i, t);
    return { weights, xs: layoutVariable(EVERY.text, EVERY.size, weights, trackingAt(t), CX) };
  }
  function eachGlyph(ctx, state, baseline, paint) {
    const { text, size } = EVERY;
    for (let i = 0; i < text.length; i++) {
      ctx.font = font(size, 'display', state.weights[i]);
      paint(text[i], state.xs[i], baseline);
    }
  }
  /**
   * Outline of the whole word. Variable fonts keep overlapping contours (R's
   * leg, kerned pairs), so a plain strokeText shows internal lines. Instead:
   * stroke every glyph at double width, then knock the union out with paper.
   * Only the outer half of the stroke survives: a clean outline of the word.
   */
  function outlineWord(ctx, state, baseline, lineW) {
    ctx.lineWidth = lineW * 2;
    ctx.strokeStyle = PAL.ink;
    eachGlyph(ctx, state, baseline, (ch, x, y) => ctx.strokeText(ch, x, y));
    ctx.fillStyle = PAL.paper;
    eachGlyph(ctx, state, baseline, (ch, x, y) => ctx.fillText(ch, x, y));
  }

  // Echo rings ±1..±RINGS. Each opens on a 32nd note, slides out from behind
  // its inner neighbour on a spring, and shows the word as it was
  // ECHO_DELAY·ring seconds ago, so the weight wave replays outward.
  const ECHO_RINGS = 3;
  const ECHO_32ND = 0.0625;
  const ECHO_DELAY = 0.2;
  const echoSpring = E.spring(1, 0.45);

  /** Camera zoom and ring offsets (from the main row, scene px) at local time t. */
  function echoGeom(t) {
    const slam = lerp(1.045, 1, E.outExpo(seg(t, T_EVERY, T_EVERY + 0.3)));
    const zoom = slam * lerp(1, EVERY.zoomOut, E.outExpo(seg(t, T_ECHO, T_ECHO + 0.5)));
    const dy = [0];
    for (let r = 1; r <= ECHO_RINGS; r++) {
      const t0 = T_ECHO + (r - 1) * ECHO_32ND;
      dy[r] = dy[r - 1] + EVERY.pitch * echoSpring(seg(t, t0, t0 + 0.3));
    }
    return { slam, zoom, dy };
  }

  function drawEverything(ctx, t) {
    ctx.fillStyle = PAL.paper;
    ctx.fillRect(0, 0, W, H);
    const { size, capH, gap } = EVERY;
    const baseline = MID + capH / 2;
    const echoOn = t >= T_ECHO;
    const { slam, zoom, dy } = echoGeom(t);

    ctx.save();
    ctx.translate(CX, MID);
    ctx.scale(zoom, zoom);
    ctx.translate(-CX, -MID);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';       // set explicitly: this also draws into a reused buffer
    ctx.letterSpacing = '0px';
    ctx.lineJoin = 'round';

    if (echoOn) {
      for (let r = ECHO_RINGS; r >= 1; r--) {
        if (dy[r] - dy[r - 1] < 0.5) continue; // still tucked behind its neighbour
        const state = everyState(t - r * ECHO_DELAY);
        // Slot masks: a ring only exists beyond its inner neighbour's edge.
        const yTop = baseline - dy[r - 1] - capH - gap / 2;
        ctx.save();
        ctx.beginPath();
        ctx.rect(-W, yTop - 3 * H, 3 * W, 3 * H);
        ctx.clip();
        outlineWord(ctx, state, baseline - dy[r], 2 / zoom);
        ctx.restore();
        const yBot = baseline + dy[r - 1] + gap / 2;
        ctx.save();
        ctx.beginPath();
        ctx.rect(-W, yBot, 3 * W, 3 * H);
        ctx.clip();
        outlineWord(ctx, state, baseline + dy[r], 2 / zoom);
        ctx.restore();
      }
    }
    const state = everyState(t);
    ctx.fillStyle = PAL.ink;
    eachGlyph(ctx, state, baseline, (ch, x, y) => ctx.fillText(ch, x, y));

    // live weight read-out under each glyph: the word's own spec sheet. The
    // crest of the wave is picked out in signal.
    if (!echoOn) {
      const p = E.outExpo(seg(t, T_EVERY + 0.05, T_EVERY + 0.35));
      const amp = 1 - E.inOutSine(seg(t - T_EVERY, 0.2, 0.5));
      let crest = 0;
      for (let i = 1; i < EVERY.text.length; i++) if (state.weights[i] > state.weights[crest]) crest = i;
      ctx.font = font(14, 'mono', 500);
      ctx.letterSpacing = '1px';
      ctx.textAlign = 'center';
      const y = baseline + 62 + (1 - p) * 10;
      for (let i = 0; i < EVERY.text.length; i++) {
        const g = glyph(EVERY.text[i], size, state.weights[i]);
        const gx = state.xs[i] + (g.r - g.l) / 2;
        const hot = i === crest && amp > 0.35;
        ctx.fillStyle = hot ? R.rgba(PAL.signal, p) : R.rgba(PAL.ink, 0.45 * p);
        ctx.fillText(String(state.weights[i]), gx, y);
      }
      ctx.textAlign = 'left';
      ctx.letterSpacing = '0px';
    }
    ctx.restore();
    if (!echoOn) drawKicker(ctx, KICKERS[2], PAL.ink, MID + (baseline - capH - KICKER_GAP - MID) * slam, T_EVERY + 0.06, t);
  }

  // ── 3.80 exit ─────────────────────────────────────────────────────────────
  // Every row is cut along its cap-height centre line and at the gaps between
  // rows. Strips alternate left/right (so each row's top half goes left and its
  // bottom half right), and the rows leave centre-out, one per 1/80 s.
  const EXIT_GROUP = 0.0125;
  const EXIT_DUR = 0.14;
  const EXIT_WINDUP = 18;       // px of anticipation against the throw
  const EXIT_STRETCH = 300;     // px/frame of speed per +100% horizontal stretch
  const EXIT_DONE = T_EXIT + ECHO_RINGS * EXIT_GROUP + EXIT_DUR;

  /** Throw distance (px, along the strip's direction) at progress p. */
  function throwX(p, travel) {
    return travel * E.inExpo(p) - EXIT_WINDUP * E.outQuad(seg(p, 0, 0.45));
  }

  /** Strip boundaries in screen px: row cap-centres and the gaps between rows. */
  function stripBands(t) {
    const { zoom, dy } = echoGeom(t);
    const k = R.scale;
    const snap = (y) => Math.round((MID + (y - MID) * zoom) * k) / k; // whole backing pixels: no seams
    const centres = [];
    for (let r = ECHO_RINGS; r >= 1; r--) centres.push(MID - dy[r]);
    centres.push(MID);
    for (let r = 1; r <= ECHO_RINGS; r++) centres.push(MID + dy[r]);
    const ys = [0];
    for (let i = 0; i < centres.length; i++) {
      if (i > 0) ys.push(snap((centres[i - 1] + centres[i]) / 2));
      ys.push(snap(centres[i]));
    }
    ys.push(H);
    return { ys, zoom };
  }

  function drawExit(ctx, t) {
    ctx.fillStyle = PAL.paper;
    ctx.fillRect(0, 0, W, H);
    if (t >= EXIT_DONE) return; // every strip is gone: frame 239 is solid paper
    const buf = R.buffer('s2-exit', W, H);
    drawEverything(buf.ctx, t);
    const k = R.scale;
    const { ys, zoom } = stripBands(t);
    const half = (MEASURE / 2) * zoom + 30;          // centre → trailing ink edge (+ margin)
    const travel = CX + half + EXIT_WINDUP + 20;     // enough for the trailing edge to clear the frame
    for (let s = 0; s < ys.length - 1; s++) {
      const row = Math.floor(s / 2) - ECHO_RINGS;
      const t0 = T_EXIT + Math.abs(row) * EXIT_GROUP;
      const p = seg(t, t0, t0 + EXIT_DUR);
      const dir = s % 2 ? 1 : -1;
      const x = throwX(p, travel);
      const anchor = CX - dir * half;                // stretch hangs off the trailing edge
      if (dir * (anchor + dir * x) > (dir > 0 ? W : 0)) continue; // fully off-frame
      const v = (throwX(Math.min(1, p + 0.004), travel) - throwX(Math.max(0, p - 0.004), travel)) /
        ((Math.min(1, p + 0.004) - Math.max(0, p - 0.004)) || 1) / EXIT_DUR / R.FPS; // px per frame
      // squash & stretch: the faster a strip goes, the longer and thinner it
      // gets (area preserved), collapsing onto its row's cut line
      const sx = p > 0 && p < 1 ? 1 + Math.max(0, v) / EXIT_STRETCH : 1;
      const sy = 1 / sx;
      const y0 = ys[s], h = ys[s + 1] - y0;
      if (h <= 0) continue;
      const pinY = dir < 0 ? ys[s + 1] : y0; // top halves pin to their bottom edge, bottom halves to their top
      ctx.drawImage(buf.canvas, 0, y0 * k, W * k, h * k,
        anchor * (1 - sx) + dir * x, pinY + (y0 - pinY) * sy, W * sx, h * sy);
    }
  }

  // ── Scene ─────────────────────────────────────────────────────────────────
  R.scene({
    id: 'type', index: 2, label: 'Kinetic Type', start: 2, end: 4,

    init() {
      mctx = document.createElement('canvas').getContext('2d');

      // TIMING: fit the ink to the measure, then fix each glyph's own mask box
      mctx.font = font(100, 'display', 900);
      const m100 = mctx.measureText(TIMING.text);
      TIMING.size = Math.round(100 * MEASURE / (m100.actualBoundingBoxLeft + m100.actualBoundingBoxRight));
      mctx.font = font(TIMING.size, 'display', 900);
      const letters = R.layoutLetters(mctx, TIMING.text, 'left');
      const inkL = -mctx.measureText(TIMING.text[0]).actualBoundingBoxLeft;
      const last = letters[letters.length - 1];
      const inkR = last.x + mctx.measureText(last.ch).actualBoundingBoxRight;
      const off = CX - (inkL + inkR) / 2;
      const capH = TIMING.size * 0.73;
      TIMING.baseline = Math.round(H / 2 + 20 + capH / 2);
      const pad = TIMING.size * 0.2; // room for the settling skew
      TIMING.glyphs = letters.map((L) => {
        const mm = mctx.measureText(L.ch);
        const x = L.x + off;
        return { ch: L.ch, i: L.i, x, clipL: x - mm.actualBoundingBoxLeft - pad * 0.15, clipR: x + mm.actualBoundingBoxRight + pad };
      });

      // is: find the real tittle of the italic i by diffing "i" against dotless "ı"
      const ref = 400, c = document.createElement('canvas');
      c.width = 600; c.height = 600;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.font = font(ref, 'serif', 400, 'italic');
      g.fillStyle = '#fff';
      g.fillText('i', 100, 500);
      const a = g.getImageData(0, 0, 600, 600).data;
      g.clearRect(0, 0, 600, 600);
      g.fillText('ı', 100, 500);
      const b = g.getImageData(0, 0, 600, 600).data;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (let y = 0; y < 600; y++) for (let x = 0; x < 600; x++) {
        const k = (y * 600 + x) * 4 + 3;
        if (a[k] > 127 && b[k] < 64) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      }
      IS.tittle = x1 > x0
        ? { x: ((x0 + x1) / 2 - 100) / ref, y: ((y0 + y1) / 2 - 500) / ref, r: ((x1 - x0) + (y1 - y0)) / 4 / ref * 1.08 }
        : { x: 0.2, y: -0.64, r: 0.05 };
      mctx.font = font(IS.size, 'serif', 400, 'italic');
      const mi = mctx.measureText('ıs');
      IS.x = Math.round(CX - (mi.actualBoundingBoxRight - mi.actualBoundingBoxLeft) / 2);
      IS.sx = mi.width - mctx.measureText('s').width; // the s's pen position, pair kerning included
      IS.baseline = Math.round(H / 2 + IS.size * 0.31); // x-height mass a touch low, tittle above: optical centre
      // labels share the tittle's centre line (where the drifting word sits mid-hold)
      const pivotY = IS.baseline - IS.size * 0.26;
      IS.kickerY = Math.round(pivotY + (IS.baseline + IS.tittle.y * IS.size - pivotY) * 0.985 + 5.5);

      // EVERYTHING: fit its settled state (900, tight) to the measure
      mctx.font = font(100, 'display', 900);
      mctx.letterSpacing = '-1.2px';
      const e100 = mctx.measureText(EVERY.text);
      mctx.letterSpacing = '0px';
      EVERY.size = Math.round(100 * MEASURE / (e100.actualBoundingBoxLeft + e100.actualBoundingBoxRight));
      EVERY.capH = EVERY.size * 0.73;
      EVERY.gap = Math.round(EVERY.size * 0.07);
      EVERY.pitch = EVERY.capH + EVERY.gap;
      // the camera pulls back just far enough for the whole stack (plus the
      // G's overshoot and the outline) to sit inside the safe area
      const stackH = 2 * ECHO_RINGS * EVERY.pitch + EVERY.capH + EVERY.size * 0.04;
      EVERY.zoomOut = Math.min(1, (SAFE_B - SAFE_T) / stackH);
    },

    draw(ctx, t) {
      if (t < T_IS) drawTiming(ctx, t);
      else if (t < T_EVERY) drawIs(ctx, t);
      else if (t < T_EXIT) drawEverything(ctx, t);
      else drawExit(ctx, t);
    },
  });
})();
