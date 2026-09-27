/*
 * S6b · RANGE, cuts 5–8 · 11.00–12.00 (frames 660–719) · id "montage-b"
 *
 * The back half of the rapid-fire montage: four 15-frame vignettes on the
 * 8th-note grid, hard cuts, each a different technique, all converging on the
 * frame centre so the eye never has to hunt between cuts.
 *
 *   11.00  TYPE FIELD  "MOVE" set in a 5×9 grid that behaves like a lens. A
 *                      separable gaussian warp travels through the columns and
 *                      rows; every word is fitted to its cell by its ink bounds
 *                      and gets heavier as its cell grows. It slams in on the
 *                      beat (a crisp impact pose), relaxes, then swells into
 *                      the centre word.
 *   11.25  SPEED       Three acts in 15 frames. Punch: tapered ink rays burst
 *                      open with a double shockwave. Cruise: rays spin and
 *                      recede, dashes stream past in perspective. Dive: the
 *                      signal dot rushes at us (inExpo, S1's move) and the
 *                      focus lines snap back in to frame it, into the downbeat.
 *   11.50  DATAMOSH    The reel rewinds: stills of every earlier scene, rendered
 *                      live from their own draw() into half-res buffers, flash
 *                      past in reverse, accelerating, torn apart by displaced
 *                      bands, pixel-sort smears, macroblocks and RGB split.
 *                      Flat blocks are stamped after the split in house colours.
 *                      The downbeat itself is a 1-bit flash frame.
 *   11.75  CRT OFF     The last, overexposed frame (HUD included) holds for a
 *                      frame, then snaps into a white-hot line; the line
 *                      retracts as a tapered spindle of light, lands as a
 *                      flare and the phosphor dot fades. 11.95 onward is pure
 *                      ink: the air before the drop.
 */
(function () {
  'use strict';
  const R = window.REEL;
  const { PAL, E, W, H, FPS, TAU, font, seg, clamp, lerp, remap, fract, hash, rgba } = R;

  const SLOT = 0.25; // one 8th note per cut
  const CUTS = ['Type field', 'Speed', 'Datamosh', 'CRT off'];
  const CX = W / 2, CY = H / 2;
  const frameOf = (T) => Math.floor(T * FPS + 1e-6);
  const snap = (v, step) => Math.round(v / step) * step;

  // ─── 5 · TYPE FIELD ────────────────────────────────────────────────────────
  const TF = { word: 'MOVE', cols: 5, rows: 9, size: 200, track: -4, gapX: 14, gapY: 12, bleedX: 70, bleedY: 40 };

  /** Set the word's font at a weight and return its ink bounds (memoised: measurement is pure). */
  const inkMemo = new Map();
  function setWordFont(ctx, weight) {
    ctx.font = font(TF.size, 'display', weight);
    let b = inkMemo.get(weight);
    if (!b) {
      const m = ctx.measureText(TF.word);
      b = { l: m.actualBoundingBoxLeft, r: m.actualBoundingBoxRight, a: m.actualBoundingBoxAscent, d: m.actualBoundingBoxDescent };
      inkMemo.set(weight, b);
    }
    return b;
  }

  function erf(x) { // Abramowitz–Stegun 7.1.26, |error| < 1.5e-7
    const s = x < 0 ? -1 : 1, a = Math.abs(x), t = 1 / (1 + 0.3275911 * a);
    return s * (1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a));
  }
  /**
   * Cell edges (0..1) for n cells whose sizes follow the density
   * 1 + amp·exp(−((x − c)/σ)²): a 1D lens centred on c, in cell units.
   * Integrated exactly, so the grid always fills the frame.
   */
  function lensEdges(n, c, sigma, amp) {
    const k = amp * sigma * Math.sqrt(Math.PI) / 2, e0 = erf(-c / sigma);
    const D = (x) => x + k * (erf((x - c) / sigma) - e0);
    const total = D(n), out = [];
    for (let i = 0; i <= n; i++) out.push(D(i) / total);
    return out;
  }

  function drawTypeField(ctx, u) {
    ctx.fillStyle = PAL.signal;
    ctx.fillRect(0, 0, W, H);
    // The lens drifts from lower-left to dead centre: slam on the beat, breathe, swell.
    const drift = E.inOutSine(seg(u, 0, 0.225));
    const cu = lerp(0.7, TF.cols / 2, drift), cv = lerp(7.3, TF.rows / 2, drift);
    const slam = 2.2 * Math.exp(-Math.max(0, u - 1 / FPS) * 22); // impact pose holds for the cut frame
    const swell = 10 * E.inQuad(seg(u, 0.04, 0.24));
    const amp = 1.6 + slam + swell;
    const xs = lensEdges(TF.cols, cu, 0.85, amp);
    const ys = lensEdges(TF.rows, cv, 1.05, amp * 0.85);
    const x0 = -TF.bleedX, x1 = W + TF.bleedX, y0 = -TF.bleedY, y1 = H + TF.bleedY;
    const cw0 = (x1 - x0) / TF.cols, ch0 = (y1 - y0) / TF.rows;

    ctx.fillStyle = PAL.ink;
    ctx.letterSpacing = `${TF.track}px`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    for (let r = 0; r < TF.rows; r++) {
      const top = lerp(y0, y1, ys[r]) + TF.gapY / 2, h = lerp(y0, y1, ys[r + 1]) - TF.gapY / 2 - top;
      if (h < 1.5) continue;
      for (let c = 0; c < TF.cols; c++) {
        const left = lerp(x0, x1, xs[c]) + TF.gapX / 2, w = lerp(x0, x1, xs[c + 1]) - TF.gapX / 2 - left;
        if (w < 1.5) continue;
        // Heavier as the cell grows, so the lens reads as depth rather than distortion.
        const grow = Math.sqrt((w / cw0) * (h / ch0));
        const weight = snap(clamp(remap(grow, 0.45, 1.9, 200, 900), 200, 900), 10);
        const b = setWordFont(ctx, weight);
        ctx.save();
        ctx.translate(left, top);
        ctx.scale(w / (b.l + b.r), h / (b.a + b.d));
        ctx.fillText(TF.word, b.l, b.a);
        ctx.restore();
      }
    }
  }

  // ─── 6 · SPEED ─────────────────────────────────────────────────────────────
  const SPEED = { rays: 210, dashes: 70, far: 1180, dot: 40 };

  /** A tapered radial wedge: a point at r0, `half` radians wide at r1. */
  function wedge(ctx, a, r0, r1, half) {
    ctx.moveTo(CX + Math.cos(a) * r0, CY + Math.sin(a) * r0);
    ctx.lineTo(CX + Math.cos(a - half) * r1, CY + Math.sin(a - half) * r1);
    ctx.lineTo(CX + Math.cos(a + half) * r1, CY + Math.sin(a + half) * r1);
    ctx.closePath();
  }

  function drawSpeed(ctx, u) {
    ctx.fillStyle = PAL.paper;
    ctx.fillRect(0, 0, W, H);
    const punch = E.outExpo(seg(u, 0, 0.16));             // the hole bursts open on the cut
    const rush = u + 3 * u * u;                              // then keeps opening as we travel
    const sd = seg(u, 0.09, SLOT), dive = lerp(E.inQuad(sd), E.inExpo(sd), 0.7); // second beat: we dive into the dot
    const spin = 1.1 * u; // steady: any faster and motion blur greys out the hairlines
    // The dot pops on the cut, then rushes up at us (inExpo, like S1's dot) into the downbeat.
    const dotR = SPEED.dot * E.backOut(2.4)(seg(u, 0, 0.1)) * lerp(1, 8.5, dive);
    ctx.fillStyle = PAL.ink;

    // Focus lines. Mostly hairlines, a few bold wedges. Their tips race outward
    // on the punch, then snap back in to frame the dot as it dives at us.
    ctx.beginPath();
    for (let i = 0; i < SPEED.rays; i++) {
      const a = ((i + (hash(i, 61) - 0.5) * 0.9) / SPEED.rays) * TAU + spin;
      const half = lerp(0.0016, 0.024, hash(i, 62) ** 3);
      const open = lerp(150, 470, hash(i, 63)) * lerp(0.08, 1, punch) + lerp(200, 900, hash(i, 64)) * rush;
      const r0 = lerp(open, dotR + lerp(14, 150, hash(i, 65) ** 2), dive);
      if (r0 < SPEED.far) wedge(ctx, a, r0, SPEED.far, half);
    }
    ctx.fill();

    // Dashes flying past in perspective: exponential radius = constant forward
    // speed, plus a kick of extra travel as we dive.
    const travel = u + 0.1 * dive;
    ctx.beginPath();
    for (let j = 0; j < SPEED.dashes; j++) {
      const a = hash(j, 71) * TAU + spin * 0.6;
      const ph = fract(hash(j, 72) + travel * lerp(2.4, 4.2, hash(j, 73)));
      const r = 140 * Math.pow(SPEED.far / 140, ph);
      if (r > dotR + 8) wedge(ctx, a, r, r * 1.28, lerp(0.004, 0.011, hash(j, 74)));
    }
    ctx.fill();

    // Double shockwave on the cut: a bold ring and a thin echo, fast out then easing.
    // Stroke width tracks speed (thick while fast, hairline once slow), so the
    // 8-sample shutter smears the early frames smoothly and the later ones read crisp.
    ctx.strokeStyle = PAL.ink;
    for (const [delay, w0, reach] of [[0, 70, 560], [0.025, 24, 420]]) {
      const ring = seg(u, delay, delay + 0.2);
      if (ring <= 0 || ring >= 1) continue;
      const e = E.outExpo(ring);
      ctx.globalAlpha = 1 - E.inQuad(seg(ring, 0.55, 1));
      ctx.lineWidth = lerp(w0, 1.5, e);
      ctx.beginPath();
      R.circlePath(ctx, CX, CY, lerp(SPEED.dot + 10, reach, e));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    R.fillCircle(ctx, CX, CY, dotR, PAL.signal);
  }

  // ─── 7 · DATAMOSH ──────────────────────────────────────────────────────────
  const HALF = 0.5, MW = W * HALF, MH = H * HALF;
  // The rewind: [scene id, local t, frames held]. Two-frame holds, then one per frame.
  const REWIND = [
    ['montage-a', 0.90, 2], // torus
    ['montage-a', 0.70, 2], // 2026
    ['montage-a', 0.35, 1], // op art
    ['montage-a', 0.14, 1], // liquid
    ['dimension', 1.62, 2], // city, the signal ring at its peak
    ['particles', 1.05, 1], // FLOW
    ['shapes', 1.00, 1],    // tiles
    ['type', 1.65, 1],      // echo
    ['type', 0.90, 1],      // is
    ['type', 0.42, 1],      // TIMING
    ['easing', 1.20, 1],    // the curve
    ['easing', 1.93, 1],    // the dot
  ];
  // The CRT's last picture: TIMING, torn with S1's dot filling the frame. Bright, signal-heavy.
  const CRT_STILLS = [['type', 0.42], ['easing', 1.975]];
  const REWIND_AT = []; // frame k → index into REWIND
  REWIND.forEach(([, , n], i) => { for (let j = 0; j < n; j++) REWIND_AT.push(i); });

  // Memoised half-res stills. Each is a pure function of (scene, t, scale), so the
  // cache only saves time: motion-blur sub-samples and neighbouring frames share stills.
  const STILL_SLOTS = 8;
  const stillLRU = [];
  function reelStill(id, t) {
    const key = `${id}@${t}@${R.scale}`;
    const hit = stillLRU.findIndex((e) => e.key === key);
    if (hit >= 0) {
      const e = stillLRU.splice(hit, 1)[0];
      stillLRU.push(e);
      return R.buffer(`s6b-still${e.slot}`, MW, MH);
    }
    const slot = stillLRU.length < STILL_SLOTS ? stillLRU.length : stillLRU.shift().slot;
    stillLRU.push({ key, slot });
    const buf = R.buffer(`s6b-still${slot}`, MW, MH);
    paintScene(buf, id, t);
    return buf;
  }

  /** Render another scene's frame into a half-res buffer; fall back to our own type field. */
  function paintScene(buf, id, t) {
    const g = buf.ctx, s = R.scale * HALF;
    const fresh = () => {
      if (g.reset) g.reset(); // also drops any save() a failed draw left behind
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = PAL.ink;
      g.fillRect(0, 0, buf.canvas.width, buf.canvas.height);
      g.setTransform(s, 0, 0, s, 0, 0);
    };
    fresh();
    const sc = R.scenes.find((x) => x.id === id);
    try {
      if (!sc || sc.id === 'montage-b') throw new Error(`no scene ${id}`);
      g.save();
      sc.draw(g, t, { T: sc.start + t, t, dur: sc.end - sc.start, p: t / (sc.end - sc.start), W, H, scene: sc, scale: R.scale });
      g.restore();
    } catch (e) {
      fresh();
      drawTypeField(g, 0.12);
    }
  }

  /** drawImage from a half-res full-frame buffer, with the source rect in logical px. */
  function blit(g, buf, sx, sy, sw, sh, dx, dy, dw, dh) {
    const k = R.scale * HALF;
    g.drawImage(buf.canvas, sx * k, sy * k, Math.max(1e-3, sw * k), Math.max(1e-3, sh * k), dx, dy, dw, dh);
  }
  /** Horizontal band shifted by dx with wrap-around. */
  function shiftBand(g, buf, y, h, dx) {
    blit(g, buf, 0, y, W, h, dx, y, W, h);
    blit(g, buf, 0, y, W, h, dx - Math.sign(dx || 1) * W, y, W, h);
  }

  const MOSH_TINTS = [PAL.signal, PAL.cobalt, PAL.lilac, PAL.paper, PAL.signal, PAL.cobalt, PAL.acid];

  /**
   * Compose datamosh frame k into the half-res buffer M (k = 15 is the CRT
   * picture). `chaos` (0..1) scales how much of the frame gets torn up.
   */
  function composeMosh(k, chaos = 1) {
    const M = R.buffer('s6b-mosh', MW, MH), g = M.ctx;
    M.clear(PAL.ink);
    g.scale(HALF, HALF); // draw in full-frame logical coords
    g.imageSmoothingEnabled = false;
    const i = REWIND_AT[k];
    const [cur, next] = i == null ? CRT_STILLS : [REWIND[i], REWIND[Math.min(REWIND.length - 1, i + 1)]];
    const A = reelStill(cur[0], cur[1]), B = reelStill(next[0], next[1]);
    const rnd = (n, salt) => hash(n * 31 + salt, 7100 + k); // per-frame layout
    const flats = [];

    // Base: the current still, slightly punched and offset each frame.
    const z = 1 + 0.08 * rnd(0, 1), ox = (rnd(0, 2) - 0.5) * 80, oy = (rnd(0, 3) - 0.5) * 40;
    g.drawImage(A.canvas, CX - (CX + ox) * z, CY - (CY + oy) * z, W * z, H * z);

    // The next still bleeds in through a large grid-aligned window, displaced.
    const bw = snap(lerp(W * 0.3, W * 0.62, rnd(1, 1)), 64), bh = snap(lerp(H * 0.25, H * 0.6, rnd(1, 2)), 32);
    const bx = snap(rnd(1, 3) * (W - bw), 64), by = snap(rnd(1, 4) * (H - bh), 32);
    if (chaos > 0.5) blit(g, B, bx + snap((rnd(1, 5) - 0.5) * 400, 32), by, bw, bh, bx, by, bw, bh);

    // Horizontal bands: displaced, or pixel-sorted (one column smeared sideways).
    let y = 0;
    for (let band = 0; y < H; band++) {
      const h = snap(lerp(6, 150, rnd(band, 4) ** 2), 2) + 2;
      const r = rnd(band, 5), dx = snap((rnd(band, 6) - 0.5) * 560, 8);
      if (r < 0.3 * chaos) shiftBand(g, M, y, h, dx);
      else if (r < 0.42 * chaos) shiftBand(g, B, y, h, dx);
      else if (r < 0.62 * chaos) {
        const sx = rnd(band, 7) * W, len = lerp(200, 1300, rnd(band, 8)) * (rnd(band, 9) < 0.5 ? -1 : 1);
        g.globalCompositeOperation = 'lighten';
        blit(g, M, sx, y, 1, h, sx, y, len, h);
        g.globalCompositeOperation = 'source-over';
      }
      y += h;
    }

    // Macroblocks on a 32 px grid, copied from elsewhere in the frame or flat-tinted.
    const blocks = Math.round((10 + rnd(2, 9) * 10) * chaos);
    for (let j = 0; j < blocks; j++) {
      const w = 32 * (1 + Math.floor(rnd(j, 10) * 5)), h = 32 * (1 + Math.floor(rnd(j, 11) * 3));
      const x = snap(rnd(j, 12) * (W - w), 32), yy = snap(rnd(j, 13) * (H - h), 32);
      if (rnd(j, 14) < 0.75) {
        const sx = clamp(x + snap((rnd(j, 15) - 0.5) * 640, 32), 0, W - w), sy = clamp(yy + snap((rnd(j, 16) - 0.5) * 320, 32), 0, H - h);
        blit(g, M, sx, sy, w, h, x, yy, w, h);
      } else {
        // Flat palette blocks are stamped after the RGB split (see present), so they
        // stay crisp house colours instead of splitting into rainbow test-card bars.
        const tall = rnd(j, 17) < 0.35;
        flats.push([x, yy, tall ? 16 : w, tall ? h * 2 : (rnd(j, 19) < 0.5 ? 8 : h), MOSH_TINTS[Math.floor(rnd(j, 18) * MOSH_TINTS.length)]]);
      }
    }
    g.imageSmoothingEnabled = true;
    return { M, flats };
  }

  /**
   * Present a half-res mosh frame: RGB split (each channel isolated with a
   * multiply, added back offset) and scanlines, all at half res, then one
   * nearest-neighbour upscale so the pixels stay crunchy. `flash` instead
   * renders a 1-bit threshold of the frame, paper on ink.
   */
  function present(ctx, { M, flats }, off, offY, scan, flash = false) {
    const S = R.buffer('s6b-split', MW, MH), C = R.buffer('s6b-chan', MW, MH), g = S.ctx;
    S.clear('#000');
    g.scale(HALF, HALF);
    if (flash) {
      g.filter = 'grayscale(1) contrast(12)';
      g.drawImage(M.canvas, 0, 0, W, H);
      g.filter = 'none';
      g.globalCompositeOperation = 'multiply'; // white → paper
      g.fillStyle = PAL.paper;
      g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'lighten'; // black → ink
      g.fillStyle = PAL.ink;
      g.fillRect(0, 0, W, H);
    } else {
      g.globalCompositeOperation = 'lighter';
      for (const [col, dx, dy] of [['#FF0000', -off, -offY], ['#00FF00', 0, 0], ['#0000FF', off, offY]]) {
        C.clear();
        C.ctx.drawImage(M.canvas, 0, 0, MW, MH);
        C.ctx.globalCompositeOperation = 'multiply';
        C.ctx.fillStyle = col;
        C.ctx.fillRect(0, 0, MW, MH);
        g.drawImage(C.canvas, dx, dy, W, H);
        // Clamp to edge, so the split never opens a raw one-channel strip (pure green
        // or magenta) along the frame border.
        const cw = C.canvas.width, ch = C.canvas.height;
        if (dx > 0) g.drawImage(C.canvas, 0, 0, 1, ch, 0, dy, dx, H);
        if (dx < 0) g.drawImage(C.canvas, cw - 1, 0, 1, ch, W + dx, dy, -dx, H);
        if (dy > 0) g.drawImage(C.canvas, 0, 0, cw, 1, dx, 0, W, dy);
        if (dy < 0) g.drawImage(C.canvas, 0, ch - 1, cw, 1, dx, H + dy, W, -dy);
      }
    }
    g.globalCompositeOperation = 'source-over';
    if (!flash) for (const [x, y, w, h, col] of flats) { g.fillStyle = col; g.fillRect(x, y, w, h); }
    g.fillStyle = `rgba(0,0,0,${scan})`;
    for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 2);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(S.canvas, 0, 0, W, H);
    ctx.imageSmoothingEnabled = true;
  }

  function drawDatamosh(ctx, u, env) {
    const k = clamp(frameOf(env.T) - 690, 0, 14); // glitch layouts step per frame, not per sub-sample
    const I = Math.max(Math.exp(-k * 0.5), (k / 14) ** 1.5); // hits on the beat, builds to the end
    const off = lerp(5, 28, I) * (hash(k, 91) < 0.5 ? 1 : -1);
    // The downbeat lands on a 1-bit flash frame: paper on ink, after SPEED's ink on paper.
    present(ctx, composeMosh(k), off, (hash(k, 92) - 0.5) * 10 * I, 0.2, k === 0);
  }

  // ─── 8 · CRT OFF ───────────────────────────────────────────────────────────
  const CRT = { collapse: 0.07, shrink: 0.06, fade: 0.07 }; // seconds from 11.75; ends 11.95
  const LINE = 4; // px, the picture's height once fully collapsed

  /** A full-frame canvas we can read back cheaply (CPU-backed), for the picture snapshot. */
  const snapshots = new Map();
  function snapshotBuffer() {
    const s = R.scale;
    let b = snapshots.get(s);
    if (!b) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(W * s);
      canvas.height = Math.round(H * s);
      b = { canvas, ctx: canvas.getContext('2d', { willReadFrequently: true }) };
      snapshots.set(s, b);
    }
    return b;
  }

  /**
   * Light sprites: a disc or a short bar, blurred once with REEL.blur and
   * memoised per render scale, then drawn additively ('lighter'). A live
   * ctx.filter blur on the main canvas costs 30–50 ms per draw.
   * Bars are drawn 3-slice (see glowCapsule) so their falloff never gets
   * squashed into a hard edge, however short the line gets.
   */
  const GLOWS = {
    halo: { shape: 'circle', core: [80, 80], pad: 140, blur: 34, color: PAL.lilac },
    core: { shape: 'circle', core: [24, 24], pad: 36, blur: 6, color: PAL.paper },
    bar: { shape: 'rect', core: [120, 28], pad: 70, blur: 24, color: PAL.lilac },
    rim: { shape: 'rect', core: [48, 10], pad: 22, blur: 5, color: PAL.paper },
  };
  const baked = new Set();
  function glowSprite(name) {
    const d = GLOWS[name], [cw, ch] = d.core, w = cw + 2 * d.pad, h = ch + 2 * d.pad;
    const buf = R.buffer(`s6b-glow-${name}`, w, h), id = `${name}@${R.scale}`;
    if (!baked.has(id)) {
      buf.clear();
      const g = buf.ctx;
      g.filter = R.blur(d.blur);
      g.fillStyle = d.color;
      g.beginPath();
      if (d.shape === 'circle') g.ellipse(w / 2, h / 2, cw / 2, ch / 2, 0, 0, TAU);
      else g.rect(d.pad, d.pad, cw, ch);
      g.fill();
      g.filter = 'none';
      baked.add(id);
    }
    return { buf, w, h, d };
  }
  /** Additive draws with gain: alpha > 1 stacks the sprite (light adds up). */
  function stack(ctx, alpha, draw) {
    for (let a = alpha; a > 0.002; a -= 1) { ctx.globalAlpha = Math.min(1, a); draw(); }
    ctx.globalAlpha = 1;
  }
  /** Sprite source rect in logical px → backing px, then drawImage. */
  function spr(ctx, buf, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (dw <= 0.01 || dh <= 0.01) return;
    const k = R.scale;
    ctx.drawImage(buf.canvas, sx * k, sy * k, sw * k, sh * k, dx, dy, dw, dh);
  }
  /** A round light: the sprite scaled so its painted core covers coreW × coreH. */
  function glowSpot(ctx, name, cx, cy, coreW, coreH, alpha) {
    if (alpha <= 0.002 || coreW <= 0 || coreH <= 0) return;
    const { buf, w, h, d } = glowSprite(name), sx = coreW / d.core[0], sy = coreH / d.core[1];
    stack(ctx, alpha, () => spr(ctx, buf, 0, 0, w, h, cx - (w * sx) / 2, cy - (h * sy) / 2, w * sx, h * sy));
  }
  /** Full-width band of light: only the sprite's vertical profile, stretched edge to edge. */
  function glowBand(ctx, name, cy, coreH, alpha) {
    if (alpha <= 0.002 || coreH <= 0) return;
    const { buf, w, h, d } = glowSprite(name), s = coreH / d.core[1];
    stack(ctx, alpha, () => spr(ctx, buf, w / 2 - 1, 0, 2, h, 0, cy - (h * s) / 2, W, h * s));
  }
  /**
   * A capsule of light around a horizontal line of length coreW: the sprite's
   * rounded ends are scaled (and optionally stretched along the line, `taper`)
   * and its middle column is stretched, so the glow keeps a soft falloff at any
   * length, down to a point. Long tapers keep fast-moving ends from strobing
   * into beads under the 8-sample shutter.
   */
  function glowCapsule(ctx, name, cx, cy, coreW, coreH, alpha, taper = 1) {
    if (alpha <= 0.002 || coreH <= 0) return;
    const { buf, w, h, d } = glowSprite(name), s = coreH / d.core[1], sx = s * taper, p = d.pad;
    const half = Math.max(0, coreW / 2), a = Math.min(d.core[0] / 2, half / sx); // source px of core per cap
    const top = cy - (h * s) / 2, hh = h * s, capW = (p + a) * sx;
    stack(ctx, alpha, () => {
      spr(ctx, buf, 0, 0, p + a, h, cx - half - p * sx, top, capW, hh);
      spr(ctx, buf, w - p - a, 0, p + a, h, cx + half - a * sx, top, capW, hh);
      const mid = 2 * (half - a * sx);
      if (mid > 0.01) spr(ctx, buf, w / 2 - 1, 0, 2, h, cx - mid / 2, top, mid, hh);
    });
  }

  function drawCrtOff(ctx, c, env) {
    const tA = CRT.collapse, tB = tA + CRT.shrink, tC = tB + CRT.fade;

    if (c < tA) {
      // The last picture, HUD and all, overexposes and is squeezed into a line.
      // Soft start, so frame 705 still reads as a clean picture; 706–708 crush it.
      const p = c / tA;
      const v = 1 - E.inOutSine(seg(p, 0, 0.9)); // vertical scale of the picture
      present(ctx, composeMosh(15, 0.45), 6, 0, 0.25);
      if (R.showHud) R.drawHud(ctx, env.T, env.scene, { label: `Range — ${CUTS[3]}` });
      // Overexpose toward the centre line as the beam converges.
      const heat = (1 - v) ** 0.7;
      const beam = ctx.createLinearGradient(0, 0, 0, H);
      beam.addColorStop(0, rgba(PAL.paper, heat * 0.25));
      beam.addColorStop(0.5, rgba(PAL.paper, heat));
      beam.addColorStop(1, rgba(PAL.paper, heat * 0.25));
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = beam;
      ctx.fillRect(0, 0, W, H);
      const snap = snapshotBuffer();
      snap.ctx.drawImage(ctx.canvas, 0, 0, snap.canvas.width, snap.canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = PAL.ink;
      ctx.fillRect(0, 0, W, H);
      const h = lerp(LINE, H, v);
      ctx.drawImage(snap.canvas, 0, CY - h / 2, W, h);
      // A white-hot core takes over as the band thins, so the energy only ever rises.
      ctx.globalCompositeOperation = 'lighter';
      // Glow sizes and gains land exactly where the retract picks up (no dip at 709).
      glowBand(ctx, 'bar', CY, Math.max(30, Math.min(h, 60) + 20), 2.2 * heat * heat);
      glowBand(ctx, 'rim', CY, Math.max(10, Math.min(h, 14)), 1.3 * R.smoothstep(0.4, 0.95, heat));
      ctx.fillStyle = rgba('#FFFFFF', R.smoothstep(0.55, 0.97, heat));
      ctx.fillRect(0, CY - Math.min(h, LINE) / 2, W, Math.min(h, LINE));
      ctx.globalCompositeOperation = 'source-over';
      return;
    }

    ctx.fillStyle = PAL.ink;
    ctx.fillRect(0, 0, W, H);
    if (c >= tC) return; // 11.95 onward: pure ink
    ctx.globalCompositeOperation = 'lighter';
    if (c < tB) {
      // The line retracts to the centre, getting hotter as it shortens.
      const p = (c - tA) / CRT.shrink;
      const hw = lerp(W / 2 + 40, 6, E.inOutCubic(p));
      const hot = lerp(1, 1.5, p);
      glowBand(ctx, 'bar', CY, 22, 0.6 * (1 - p) ** 2); // phosphor persistence of the full-width line
      glowCapsule(ctx, 'bar', CX, CY, hw * 2, 30, 1.6 * hot, 1.6);
      glowCapsule(ctx, 'rim', CX, CY, hw * 2, 10, 1.3 * hot, 5);
      // White-hot core as a spindle that tapers and fades at its tips: the retract
      // is fast, and hard caps would strobe into beads under the 8-sample shutter.
      const lw = lerp(LINE, 5, p), L = Math.min(hw, 120), f = L / (2 * hw);
      const core = ctx.createLinearGradient(CX - hw, 0, CX + hw, 0);
      core.addColorStop(0, 'rgba(255,255,255,0)');
      core.addColorStop(f, '#FFFFFF');
      core.addColorStop(1 - f, '#FFFFFF');
      core.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.moveTo(CX - hw, CY);
      ctx.lineTo(CX - hw + L, CY - lw / 2);
      ctx.lineTo(CX + hw - L, CY - lw / 2);
      ctx.lineTo(CX + hw, CY);
      ctx.lineTo(CX + hw - L, CY + lw / 2);
      ctx.lineTo(CX - hw + L, CY + lw / 2);
      ctx.closePath();
      ctx.fill();
    } else {
      // The line lands as a flare, then the phosphor dot fades out.
      const p = (c - tB) / CRT.fade;
      const I = (1 - p) ** 1.6, flare = Math.exp(-p * 7);
      glowSpot(ctx, 'halo', CX, CY, lerp(70, 190, flare) * lerp(0.7, 1, I), lerp(70, 190, flare) * lerp(0.7, 1, I), 0.8 * I + 0.9 * flare);
      glowCapsule(ctx, 'bar', CX, CY, lerp(60, 620, flare) * I, 7, 0.9 * I, 3); // anamorphic streak left by the line
      glowSpot(ctx, 'core', CX, CY, lerp(22, 34, flare), lerp(22, 34, flare), 1.3 * I);
      R.fillCircle(ctx, CX, CY, lerp(2.5, 8, I), rgba('#FFFFFF', Math.min(1, I * 1.4)));
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  // ─── Registration ──────────────────────────────────────────────────────────
  const VIGNETTES = [drawTypeField, drawSpeed, drawDatamosh, drawCrtOff];
  const cutOf = (t) => clamp(Math.floor(t / SLOT + 1e-9), 0, 3);

  R.scene({
    id: 'montage-b', index: 6, label: 'Range', start: 11, end: 12,
    draw(ctx, t, env) {
      const i = cutOf(t);
      VIGNETTES[i](ctx, t - i * SLOT, env); // each vignette runs on its own 0–0.25 s clock
    },
    hud(t, env) {
      const i = cutOf(t), f = frameOf(env.T) - 660 - i * 15;
      return {
        label: `Range — ${CUTS[i]}`,
        jitter: i === 2 ? 1 : f === 0 ? 0.35 : 0,
        alpha: i === 3 ? 0 : 1, // from 11.75 the HUD lives inside the collapsing picture
      };
    },
  });
})();
