/*
 * S6a · RANGE, cuts 1–4 · 10.00–11.00 s · frames 600–659
 *
 * The first half of the rapid-fire montage: four techniques, one per 8th note
 * (0.25 s = 15 frames), hard cuts on the grid. Each vignette is a pure function
 * of its own local time u ∈ [0, 0.25):
 *
 *   600–614  LIQUID      Ink metaballs on lilac, contoured by marching squares on
 *                        a 6 px grid. Gather → merge → burst: ten scattered drops
 *                        are sucked into one jelly mass, which flings five back
 *                        out on snapping necks, ending on a single central drop.
 *                        S5's glitch tears through the first three frames, with
 *                        slices of S5's ink world still showing.
 *   615–629  OP ART      Two concentric ring sets XOR'd by a single even-odd fill,
 *                        inside a disc on ink. Match cut: the disc starts at the
 *                        exact size of that last drop and springs open. The
 *                        centres drift apart and orbit, so the fringes bloom and
 *                        rotate.
 *   630–644  SPLIT-FLAP  Four slot reels spin, brake and clunk left→right onto
 *                        2026, 35 ms apart, locked to the four flap-land clacks.
 *   645–659  WIREFRAME   One paper flash frame, then the camera rockets back out
 *                        of the hole of a tumbling torus, catches, and drifts back
 *                        in: paper lines on cobalt, far edges thinner and dimmer,
 *                        one tube section picked out in acid.
 */
(function () {
  'use strict';
  const R = window.REEL;
  const { PAL, E, TAU, clamp, lerp, seg, hash, font, v3 } = R;

  const W = 1920, H = 1080, CX = W / 2, CY = H / 2;
  const SLOT = 0.25;         // one 8th note at 120 BPM
  const FRAME = 1 / 60;
  const DEG = Math.PI / 180;

  /** Vignette index at scene time t (the epsilon keeps exact cut times on the right side). */
  const cutAt = (t) => clamp(Math.floor(t / SLOT + 1e-6), 0, 3);
  const mod = (x, m) => ((x % m) + m) % m;

  // ═══ 1 · LIQUID ════════════════════════════════════════════════════════════

  const CELL = 6;
  const GX = W / CELL + 1, GY = H / CELL + 1;            // 321 × 181 field samples
  const SUPPORT = 2.0;                                    // kernel reach in blob radii; > ~1.6 gives gooey necks
  const ISO = Math.pow(1 - 1 / (SUPPORT * SUPPORT), 3);  // puts a lone blob's surface exactly at its radius
  // Scratch buffers, fully rewritten on every call (no state survives between frames).
  const field = new Float32Array(GX * GY);
  const nextEdge = new Int32Array(GX * GY * 2);
  const edgeX = new Float32Array(GX * GY * 2);
  const edgeY = new Float32Array(GX * GY * 2);

  // Two interleaved, counter-rotating rings of drops tell one idea in two acts:
  // GATHER (10.000–10.075) every drop is sucked into the centre and they fuse
  // into a single mass; it swells and pulls in (anticipation), then
  // BURST (10.125, the 16th) flings ring B back out on stretched necks that
  // snap, leaving one heavy central drop with five satellites still flying at
  // the cut. The three "bloop" SFX land at 10.00 / 10.07 / 10.14.
  const RING_A = [[0, 100], [72, 84], [144, 110], [216, 90], [288, 96]];   // [angle°, radius]: heavy drops, become the core
  const RING_B = [[36, 68], [108, 56], [180, 74], [252, 60], [324, 64]];   // light drops, get flung out
  const YSQUASH = 0.8; // orbits are ellipses, so the cluster sits inside the safe area
  const TAIL_LAG = 0.035;   // s: each drop drags a small tail that catches up late (follow-through)
  const RADII = RING_A.concat(RING_B).map((d) => d[1]);

  // Accelerating pull: moves from the very first frame, fastest at the collision.
  const gather = (x) => 0.2 * x + 0.8 * x * x * x;
  const RING_A_D = [[0, 410], [0.075, 26, gather], [0.1, 58, E.outQuad], [0.125, 34, E.inOutQuad], [0.25, 44, E.inOutSine]];
  const RING_B_D = [[0, 330], [0.075, 70, gather], [0.1, 112, E.outQuad], [0.125, 78, E.inOutQuad], [0.29, 470, E.outCubic]];

  /** Jelly: after the collision the fused mass squashes wide, then tall, and rings down. */
  const jelly = (v) => (v < 0.07 ? 0 : 0.3 * Math.exp(-(v - 0.07) / 0.045) * Math.sin((v - 0.07) * 70));

  /** Drop centres at time v, in RING_A then RING_B order. */
  function dropCentres(v) {
    v = Math.max(0, v);
    const x = clamp(v / SLOT), spin = 0.45 * x + 0.55 * E.inOutCubic(x); // never at rest
    const dA = R.tween(v, RING_A_D), dB = R.tween(v, RING_B_D), j = jelly(v);
    const out = [];
    const place = (deg, d, rot, i) => {
      const a = deg * DEG + rot;
      d = (d + 12 * Math.sin(v * 38 + i * 1.7)) * (1 + j * Math.cos(2 * a)); // per-drop wobble + jelly squash
      out.push([CX + Math.cos(a) * d, CY + Math.sin(a) * d * YSQUASH]);
    };
    RING_A.forEach(([deg], i) => place(deg, dA, 0.8 * spin, i));
    RING_B.forEach(([deg], i) => place(deg, dB, -0.8 * spin, i + 5));
    return out;
  }

  function liquidBlobs(u) {
    const now = dropCentres(u), was = dropCentres(u - TAIL_LAG);
    const blobs = [];
    now.forEach(([x, y], i) => {
      // The tail trails where the drop was, but never further than ~one radius
      // back, so fast drops stretch into teardrops instead of shedding dots.
      const r = RADII[i], dx = was[i][0] - x, dy = was[i][1] - y, len = Math.hypot(dx, dy);
      const k = len > r * 0.95 ? (r * 0.95) / len : 1;
      blobs.push([x + dx * k, y + dy * k, r * 0.5]);
      blobs.push([x, y, r]);
    });
    return blobs;
  }

  /** Accumulates the compact kernel (1 − d²/S²)³ of every blob onto the grid. Border samples stay 0. */
  function computeField(blobs) {
    field.fill(0);
    for (const [bx, by, r] of blobs) {
      const S = r * SUPPORT, inv = 1 / (S * S);
      const i0 = Math.max(1, Math.ceil((bx - S) / CELL)), i1 = Math.min(GX - 2, Math.floor((bx + S) / CELL));
      const j0 = Math.max(1, Math.ceil((by - S) / CELL)), j1 = Math.min(GY - 2, Math.floor((by + S) / CELL));
      for (let j = j0; j <= j1; j++) {
        const dy = j * CELL - by, dy2 = dy * dy, row = j * GX;
        for (let i = i0; i <= i1; i++) {
          const dx = i * CELL - bx, q = 1 - (dx * dx + dy2) * inv;
          if (q > 0) field[row + i] += q * q * q;
        }
      }
    }
  }

  /**
   * Marching squares with contour tracing. Edge ids: 2·v is the horizontal edge
   * right of sample v, 2·v+1 the vertical edge below it. Walking each cell's
   * corners clockwise (tl, tr, br, bl), the contour runs from the edge where we
   * leave the inside to the edge where we re-enter it, so every loop comes out
   * clockwise around ink and holes come out reversed (non-zero fill just works).
   */
  function metaballPath(blobs) {
    computeField(blobs);
    nextEdge.fill(-1);
    const starts = [];
    const link = (from, to) => {
      nextEdge[from] = to;
      starts.push(from);
      const v = from >> 1, i = v % GX, j = (v - i) / GX, a = field[v];
      if ((from & 1) === 0) { edgeX[from] = (i + (ISO - a) / (field[v + 1] - a)) * CELL; edgeY[from] = j * CELL; }
      else { edgeX[from] = i * CELL; edgeY[from] = (j + (ISO - a) / (field[v + GX] - a)) * CELL; }
    };
    for (let j = 0; j < GY - 1; j++) {
      for (let i = 0; i < GX - 1; i++) {
        const v = j * GX + i;
        const a = field[v] >= ISO, b = field[v + 1] >= ISO, c = field[v + GX + 1] >= ISO, d = field[v + GX] >= ISO;
        const code = (a << 3) | (b << 2) | (c << 1) | d;
        if (code === 0 || code === 15) continue;
        const e0 = 2 * v, e1 = 2 * (v + 1) + 1, e2 = 2 * (v + GX), e3 = 2 * v + 1;
        if (code === 10 || code === 5) {
          // Saddle: the cell centre decides whether the two inside corners join.
          const joined = (field[v] + field[v + 1] + field[v + GX + 1] + field[v + GX]) / 4 >= ISO;
          if (code === 10) { if (joined) { link(e0, e1); link(e2, e3); } else { link(e0, e3); link(e2, e1); } }
          else if (joined) { link(e1, e2); link(e3, e0); } else { link(e1, e0); link(e3, e2); }
          continue;
        }
        let out = -1, back = -1;
        if (a && !b) out = e0; else if (!a && b) back = e0;
        if (b && !c) out = e1; else if (!b && c) back = e1;
        if (c && !d) out = e2; else if (!c && d) back = e2;
        if (d && !a) out = e3; else if (!d && a) back = e3;
        link(out, back);
      }
    }
    // Chain segments into loops; midpoint quadratics round off the 6 px chords.
    const path = new Path2D(), loop = [];
    for (const s of starts) {
      if (nextEdge[s] < 0) continue;
      loop.length = 0;
      for (let id = s; nextEdge[id] >= 0;) { loop.push(id); const n = nextEdge[id]; nextEdge[id] = -1; id = n; }
      const n = loop.length;
      if (n < 3) continue;
      const last = loop[n - 1];
      path.moveTo((edgeX[last] + edgeX[loop[0]]) / 2, (edgeY[last] + edgeY[loop[0]]) / 2);
      for (let k = 0; k < n; k++) {
        const p = loop[k], q = loop[(k + 1) % n];
        path.quadraticCurveTo(edgeX[p], edgeY[p], (edgeX[p] + edgeX[q]) / 2, (edgeY[p] + edgeY[q]) / 2);
      }
      path.closePath();
    }
    return path;
  }

  /**
   * Residual S5 glitch energy: 1 on the cut, gone by the fourth frame. Digital
   * damage steps per frame (1 → 0.54 → 0.19 → 0), so every motion-blur
   * sub-sample of a frame shows the same tear and slices stay crisp, not smeared.
   */
  const glitchAt = (u) => Math.pow(clamp(1 - Math.floor(u / FRAME + 1e-6) / 3), 1.5);

  function drawLiquid(ctx, u) {
    ctx.fillStyle = PAL.lilac;
    ctx.fillRect(0, 0, W, H);
    const blob = metaballPath(liquidBlobs(u));
    const g = glitchAt(u);
    if (g <= 0) { ctx.fillStyle = PAL.ink; ctx.fill(blob); return; }

    // Torn horizontal slices, each with its own shove and a signal/cobalt channel
    // split. Some slices are still S5's ink world with the image inverted, so
    // the hand-off literally tears from ink into lilac over three frames.
    const seed = Math.floor(u / FRAME + 1e-6) * 97 + 13;
    for (let y = 0, band = 0; y < H; band++) {
      const h = 18 + Math.floor(hash(band, seed) * 110);
      const big = hash(band, seed + 1) < 0.5;
      const dx = (hash(band, seed + 2) - 0.5) * (big ? 300 : 40) * g;
      const split = (10 + 22 * hash(band, seed + 3)) * g;
      const inv = hash(band, seed + 4) < 0.42 * g * g;
      ctx.save();
      ctx.beginPath(); ctx.rect(0, y, W, h); ctx.clip();
      if (inv) { ctx.fillStyle = PAL.ink; ctx.fillRect(0, y, W, h); }
      ctx.translate(dx + split, 0); ctx.fillStyle = PAL.signal; ctx.fill(blob);
      ctx.translate(-2 * split, 0); ctx.fillStyle = PAL.cobalt; ctx.fill(blob);
      ctx.translate(split, 0); ctx.fillStyle = inv ? PAL.lilac : PAL.ink; ctx.fill(blob);
      ctx.restore();
      y += h;
    }
    // A few hairline tears in the channel colours.
    for (let k = 0; k < 6; k++) {
      if (hash(k, seed + 7) > g + 0.15) continue;
      ctx.globalAlpha = 0.55 + 0.45 * hash(k, seed + 8);
      ctx.fillStyle = [PAL.paper, PAL.signal, PAL.cobalt][k % 3];
      ctx.fillRect(0, Math.round(hash(k, seed + 9) * H), W, 1 + Math.round(2 * hash(k, seed + 10)));
    }
    ctx.globalAlpha = 1;
  }

  // ═══ 2 · OP ART ════════════════════════════════════════════════════════════

  const BAND = 15;         // ink and paper bands are 15 px each (30 px period)
  const DISC_R = 400;

  /**
   * One ring set as paired circles (annuli). Pairs keep the even-odd parity
   * local to each band, so bands can stream in and out of the set without the
   * whole disc flipping, and two sets in one path XOR for free.
   */
  function addRings(path, x, y, phase, maxR) {
    for (let a = phase - 2 * BAND; a < maxR; a += 2 * BAND) {
      const r0 = a, r1 = a + BAND;
      if (r1 <= 0) continue;
      path.moveTo(x + r1, y); path.arc(x, y, r1, 0, TAU);
      if (r0 > 0) { path.moveTo(x + r0, y); path.arc(x, y, r0, 0, TAU, true); }
    }
  }

  function drawOpArt(ctx, u) {
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(0, 0, W, H);
    // Match cut: the disc starts at exactly the size of the ink drop we just cut
    // from (r ≈ 157 px), inverted, and springs open from there.
    const rad = DISC_R * lerp(0.4, 1, E.backOut(1.3)(seg(u, 0, 0.15)));
    const sep = lerp(30, 180, E.outExpo(seg(u, 0, 0.21)));
    const x = seg(u, 0, SLOT);
    // Keeps turning through the last frame. The pair starts on a diagonal and swings
    // through vertical, never horizontal: two dots side by side read as eyes.
    const th = 0.62 + 1.75 * (0.35 * x + 0.65 * E.outCubic(x));
    const ox = Math.cos(th) * sep / 2, oy = Math.sin(th) * sep / 2;
    const flow = u * 340; // px/s: set A breathes out while set B breathes in
    const rings = new Path2D();
    addRings(rings, CX + ox, CY + oy, mod(flow, 2 * BAND), rad + sep);
    addRings(rings, CX - ox, CY - oy, mod(-flow, 2 * BAND), rad + sep);
    ctx.save();
    ctx.beginPath(); ctx.arc(CX, CY, rad, 0, TAU); ctx.clip();
    ctx.fillStyle = PAL.paper;
    ctx.fill(rings, 'evenodd');
    ctx.restore();
    // The two ring centres: the cause of the interference, in signal.
    R.fillCircle(ctx, CX + ox, CY + oy, 6, PAL.signal);
    R.fillCircle(ctx, CX - ox, CY - oy, 6, PAL.signal);
  }

  // ═══ 3 · SPLIT-FLAP ════════════════════════════════════════════════════════

  const FLAP = { digits: [2, 0, 2, 6], size: 470, w: 272, h: 436, gap: 28, radius: 20 };
  FLAP.x0 = CX - (4 * FLAP.w + 3 * FLAP.gap) / 2;
  FLAP.y0 = CY - FLAP.h / 2;
  // Reel physics, per reel: constant spin → linear brake → the digit clunks in
  // at impact speed, overshoots once and is caught by a stiff, heavily damped
  // detent. Position and velocity are continuous across all three phases.
  // Landings keep the 35 ms spacing of the four "flap land" clacks in
  // tools/synth.py (10.620 / .655 / .690 / .725) and sit 25 ms ahead of them:
  // sound trailing picture by 1.5 frames reads as locked (EBU R37 allows 60 ms),
  // and it buys the finished 2026 a few frames before the cut.
  const LAND = [0.095, 0.13, 0.165, 0.2];        // local landing times (s)
  const V_SPIN = 34;                              // cards/s while spinning (≈0.57 card per frame)
  const V_LAND = 14;                              // cards/s at impact
  const T_BRAKE = 0.07;                           // s of braking before impact
  const D_BRAKE = V_LAND * T_BRAKE + (V_SPIN - V_LAND) * T_BRAKE / 2;
  const DET_W = TAU / 0.1, DET_B = 40;            // detent: 50 ms half-period, settles in ≈80 ms
  let digitDy = 0; // baseline offset that optically centres a digit (measured in init)

  /** Cards still to travel for reel i (positive = the target digit is above the window). */
  function reelOffset(u, i) {
    const x = LAND[i] - u; // time until impact
    if (x >= T_BRAKE) return D_BRAKE + V_SPIN * (x - T_BRAKE);
    if (x >= 0) return V_LAND * x + (V_SPIN - V_LAND) * x * x / (2 * T_BRAKE);
    return -(V_LAND / DET_W) * Math.sin(-DET_W * x) * Math.exp(DET_B * x);
  }
  /** Card faces on the reel: the target at n = 0, never repeated nearby, so it only appears on landing. */
  const reelDigit = (n, i) => (n === 0 ? FLAP.digits[i] : (FLAP.digits[i] + 1 + Math.floor(hash(n * 7 + i, 404) * 9)) % 10);
  /** The whole card kicks down a few px at impact and springs back: the clunk has weight. */
  const cardJolt = (u, i) => { const y = (u - LAND[i]) / 0.014; return y <= 0 ? 0 : 7 * y * Math.exp(1 - y); };

  function drawSplitFlap(ctx, u) {
    const bg = PAL.acid, fg = PAL.ink;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    // Beat punch on the downbeat, plus a slow push so the landed 2026 never sits dead.
    const punch = lerp(1.07, 1, E.outExpo(seg(u, 0, 0.12))) + 0.02 * seg(u, 0, SLOT);
    ctx.translate(CX, CY); ctx.scale(punch, punch); ctx.translate(-CX, -CY);
    ctx.font = font(FLAP.size, 'mono', 800);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const { w, h, gap, radius } = FLAP;
    const cy0 = FLAP.y0 + h / 2;
    // The axle first, so the cards sit on it: ink links through the gaps, short pins outside.
    ctx.fillStyle = fg;
    for (let i = 0; i <= 4; i++) {
      const edge = i === 0 || i === 4;
      const xa = i === 0 ? FLAP.x0 - 18 : FLAP.x0 + i * (w + gap) - gap;
      ctx.fillRect(xa, cy0 - 5, edge ? 18 : gap, 10);
    }
    for (let i = 0; i < 4; i++) {
      const x = FLAP.x0 + i * (w + gap), y = FLAP.y0 + cardJolt(u, i), cx = x + w / 2, cy = y + h / 2;
      const s = reelOffset(u, i);
      ctx.save();
      ctx.beginPath(); R.roundRectPath(ctx, x, y, w, h, radius);
      ctx.fillStyle = bg; ctx.fill();
      ctx.clip();
      // Lower flap sits in the upper flap's shadow.
      ctx.fillStyle = R.rgba(fg, 0.07);
      ctx.fillRect(x, cy, w, h / 2);
      ctx.fillStyle = fg;
      for (let n = Math.floor(s) - 1; n <= Math.ceil(s) + 1; n++) {
        ctx.fillText(String(reelDigit(n, i)), cx, cy + (n - s) * h + digitDy);
      }
      // The split: an acid gap through the glyph where the two flaps meet.
      ctx.fillStyle = bg;
      ctx.fillRect(x, cy - 4, w, 8);
      ctx.restore();
      ctx.strokeStyle = fg; ctx.lineWidth = 4;
      ctx.beginPath(); R.roundRectPath(ctx, x, y, w, h, radius); ctx.stroke();
    }
  }

  // ═══ 4 · WIREFRAME ═════════════════════════════════════════════════════════

  const TORUS = { R: 1, r: 0.4, nu: 60, nv: 24 };
  let torusVerts = [], torusEdges = [];
  const DEPTH_BINS = 12;
  // The acid tube section starts on the left rim (θ = π); the spin sweeps it round to the front.
  const ACCENT = TORUS.nu / 2;
  // Screen y of the torus centre. On axis we look straight down the hole, so it
  // starts centred; as the ring tips over, perspective drops its near rim, so
  // the camera cranes up to keep the silhouette optically centred.
  const TY0 = CY, TY1 = CY - 100;
  /** Camera distance: rocket out of the hole, catch, then drift back in (still moving at the cut). */
  const DOLLY = [[0, 1.25], [0.1, 3.55, E.outExpo], [0.3, 3.0, E.inOutQuad]];

  function buildTorus() {
    const { R: RR, r, nu, nv } = TORUS;
    torusVerts = []; torusEdges = [];
    for (let a = 0; a < nu; a++) {
      for (let b = 0; b < nv; b++) {
        const th = (a / nu) * TAU, ph = (b / nv) * TAU, ring = RR + r * Math.cos(ph);
        torusVerts.push([ring * Math.cos(th), ring * Math.sin(th), r * Math.sin(ph)]);
        const k = a * nv + b;
        torusEdges.push([k, ((a + 1) % nu) * nv + b]);  // along the major circle
        torusEdges.push([k, a * nv + ((b + 1) % nv), a === ACCENT]);  // around the tube
      }
    }
  }

  function drawWireframe(ctx, u) {
    // The cut lands on a single paper flash frame (inverted palette), then cobalt.
    const flash = u < FRAME;
    ctx.fillStyle = flash ? PAL.paper : PAL.cobalt;
    ctx.fillRect(0, 0, W, H);
    // Pull back out of the hole while the ring tips over and keeps spinning.
    const x = seg(u, 0, SLOT);
    // Rocket out of the hole, overshoot, and let the camera drift back in: the
    // ring grows into the frame on the last frames instead of parking.
    const dist = R.tween(u, DOLLY);
    const turn = E.outCubic(x);
    const tilt = lerp(0.12, 1.1, turn), yaw = lerp(-0.45, 0.3, turn), ty = lerp(TY0, TY1, turn);
    const spin = 1.9 * (0.5 * x + 0.5 * E.outCubic(x));
    const f = 1200, near = 0.12, extent = TORUS.R + TORUS.r;
    const cam = torusVerts.map((p) => {
      const q = v3.rotY(v3.rotX(v3.rotZ(p, spin), tilt), yaw);
      return [q[0], q[1], q[2] + dist];
    });
    const mesh = Array.from({ length: DEPTH_BINS }, () => new Path2D());
    const accent = Array.from({ length: DEPTH_BINS }, () => new Path2D());
    for (const [ia, ib, isAccent] of torusEdges) {
      let a = cam[ia], b = cam[ib];
      if (a[2] < near && b[2] < near) continue;
      if (a[2] < near || b[2] < near) { // clip against the near plane
        if (a[2] < near) [a, b] = [b, a];
        const k = (a[2] - near) / (a[2] - b[2]);
        b = [lerp(a[0], b[0], k), lerp(a[1], b[1], k), near];
      }
      const depth = clamp(((a[2] + b[2]) / 2 - (dist - extent)) / (2 * extent));
      const bin = (isAccent ? accent : mesh)[Math.min(DEPTH_BINS - 1, Math.floor(depth * DEPTH_BINS))];
      bin.moveTo(CX + (a[0] * f) / a[2], ty - (a[1] * f) / a[2]);
      bin.lineTo(CX + (b[0] * f) / b[2], ty - (b[1] * f) / b[2]);
    }
    ctx.lineCap = 'butt'; // round caps would stack into bright dots at the joints
    ctx.lineJoin = 'round';
    for (let k = DEPTH_BINS - 1; k >= 0; k--) { // far → near
      const near01 = 1 - (k + 0.5) / DEPTH_BINS;
      ctx.globalAlpha = lerp(0.14, 1, near01 * near01);
      ctx.lineWidth = lerp(0.7, 3.2, near01);
      ctx.strokeStyle = flash ? PAL.cobalt : PAL.paper;
      ctx.stroke(mesh[k]);
      // One tube section in acid: the spin reads even though the silhouette never changes.
      ctx.globalAlpha = lerp(0.6, 1, near01);
      ctx.lineWidth = lerp(2.2, 5.5, near01);
      ctx.strokeStyle = flash ? PAL.cobalt : PAL.acid;
      ctx.stroke(accent[k]);
    }
    ctx.globalAlpha = 1;
  }

  // ═══ Registration ══════════════════════════════════════════════════════════

  const LABEL_JUNK = '#%/_=+01<>'; // S5's corruption glyphs
  const CUTS = [
    { label: 'Range — Liquid', draw: drawLiquid },
    { label: 'Range — Op Art', draw: drawOpArt },
    { label: 'Range — Split-Flap', draw: drawSplitFlap },
    { label: 'Range — Wireframe', draw: drawWireframe },
  ];

  R.scene({
    id: 'montage-a', index: 6, label: 'Range', start: 10, end: 11,
    init() {
      buildTorus();
      const g = document.createElement('canvas').getContext('2d');
      g.font = font(FLAP.size, 'mono', 800);
      const m = g.measureText('0');
      digitDy = (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
    },
    draw(ctx, t) {
      const i = cutAt(t);
      CUTS[i].draw(ctx, t - i * SLOT);
    },
    hud(t) {
      const i = cutAt(t);
      if (i > 0) return { label: CUTS[i].label, jitter: 0 };
      // S5 exits with its chapter label corrupted; ours decodes out of the same junk.
      const g = glitchAt(t), f = Math.floor(t / FRAME + 1e-6), label = CUTS[0].label;
      let out = '';
      for (let k = 0; k < label.length; k++) {
        const c = label[k];
        out += c !== ' ' && hash(k, f * 31 + 5) < 0.55 * g * g ? LABEL_JUNK[Math.floor(hash(k, f * 31 + 6) * LABEL_JUNK.length)] : c;
      }
      return { label: out, jitter: g };
    },
  });
})();
