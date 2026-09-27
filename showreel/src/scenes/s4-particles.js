/*
 * S4 · PARTICLES & FLOW · 6.00–8.00 s (frames 360–479)
 * "Systems thinking: thousands of agents, one choreography."
 *
 *   6.00  Downbeat: the ink circle from S3 shatters. Five concentric shells of
 *         particles burst from the centre (house ramp, outer → inner: signal →
 *         lilac → cobalt) with a few acid sparks that burn out.
 *   6.10  A curl-noise field takes over and folds the shells into silky,
 *         luminous ribbons, held on an elliptical stage inside the safe area.
 *         6.50 beat: the field flares, a gust surges and a hairline shockwave
 *         (the stage's own ellipse) races out through the ribbons.
 *   6.67  The swarm peels off the field and swoops into the word FLOW, hitting
 *         on the 7.00 beat (a 36 ms left → right cascade). Tails shorten as each
 *         particle closes on its glyph, it flares on contact, slams ≤ 7 px past
 *         and cools into a designed signal → lilac → cobalt gradient across the
 *         word; the beat frame is a white-hot flash. Then shimmer, glint, push.
 *   7.38  The word is eaten from the centre outward: each patch condenses into
 *         one of 196 beads and winds up (pull-back) before launching.
 *   7.50  Beat: the lattice targets switch on centre-out (bright on their first
 *         frame, then faint until their bead closes in) and the first beads are
 *         magnetised in, a few members of each drawing its comet tail. Arrivals ripple centre-out 7.70 → 7.84, each a pop and
 *         a hairline ping; everything is settled by 7.91.
 *   7.92+ Exactly the flat S5 lattice: paper dots on ink, nothing else.
 *
 * The flow is pre-simulated in init() at 240 Hz through a gridded curl field and
 * stored at 120 Hz; draw() interpolates those samples and layers closed-form
 * choreography (formation, beads, lattice flight) on top, so every frame is a
 * pure function of t. Streaks are batched into one path per colour/alpha
 * bucket and drawn additively on black, bloomed, then lifted to ink.
 */
(function () {
  'use strict';
  const R = window.REEL;
  const { PAL, E, clamp, lerp, seg, smoothstep, hash, noise, shared } = R;
  const { W, H } = R;
  const LAT = shared.LATTICE;
  const TAU = Math.PI * 2;

  // ─── Choreography (local seconds; absolute T = 6 + t) ──────────────────────
  const ORIGIN = { x: 960, y: 540 };                      // where S3's circle closed
  const WORD = { text: 'FLOW', size: 430, tracking: -0.02, cx: 960, cy: 532, count: 6000,
    kern: [0, 10, 11, 17],                               // optical nudges per glyph (px): open F|L, O|W
    ramp: 0.42 };                                        // house-ramp direction across the word (rad)
  const BURST = {
    drag: 6.5,                                           // 1/s; a shell coasts to reach = v0 / drag
    stretch: [1.22, 0.72],                               // widen the burst to the 16:9 stage
    shells: [                                            // outer → inner
      { reach: 610, share: 0.23, color: 0 },
      { reach: 500, share: 0.21, color: 1 },
      { reach: 395, share: 0.2, color: 2 },
      { reach: 300, share: 0.19, color: 3 },
      { reach: 210, share: 0.17, color: 4 },
    ],
    sparkShare: 0.006, sparkReach: [860, 1250],
  };
  const FIELD = {
    big: { scale: 560, amp: 185, z: 0.3, dz: 0.35 },     // large swirls
    fine: { scale: 190, amp: 60, z: 4.1, dz: 0.8 },      // ribbon detail
    swirl: 0.5,                                          // rad/s global rotation
    gust: { at: 0.5, gain: 0.55, decay: 7, ring: 0.34,   // surge + pressure ring on the 6.5 beat
      r0: 0.2, r1: 1.0, width: 0.09, boost: 1.5,         // ring radii/width in stage units
      push: 0, pulse: 0.4 },                             // ring shoves the ribbons outward (px); beat brightening
    grid: { x0: -520, y0: -520, cell: 40, nx: 76, ny: 55, dt: 0.1, nt: 13 },
  };
  // The flow lives on an elliptical stage inside the safe area: ribbons that reach
  // its rim are turned along it (in the swirl direction) instead of leaving frame.
  const STAGE = { ax: 860, ay: 425, soft: 0.6, hard: 1.1, turn: 0.5, pull: 3 };
  const SWIRL_K = STAGE.ax / STAGE.ay;                   // orbits = the stage ellipses (ψ ∝ re²)
  const SIM = { dt: 1 / 240, every: 2, end: 1.1 };        // stored at 120 Hz
  const FORM = { match: 0.75, lock: 1.0, cascade: 0.012, spread: 0.012, dur: [0.26, 0.34], arc: 0.2,
    hit: 0.8, speed: 0.65,                               // hit at 80% of the move, then a small slam
    over: 7,                                             // slam overshoot never exceeds this (px)
    focus: [2.5, 0.22] };                                // streak cap = a + b · distance still to go
  const HOLD = { glint: [1.06, 1.36], glintW: 48, glintGain: 1.1, breathe: 0.012,
    contact: 22, flash: 0.6, flashDecay: 11,             // per-particle contact flare, beat flash
    level: 1.0, sparkle: 0.3 };                          // stipple brightness; share of particles that glitter
  const GATHER = { field: 1.5, condense: 0.12, flight: 0.2, lag: 0.025, first: 1.7, last: 1.84,
    pull: 0.07, arc: 0.1, spread: 7, beadR: 5.5, pop: 0.065, ring: 0.07, marks: 0.1,
    comet: 0.35 };                                       // share of a bead's members that draw its tail
  const LOCK = 1.92;                                     // from here on: the exact lattice

  /**
   * Swoop and slam: a Hermite ease-in that reaches the target at s = FORM.hit
   * still moving (slope FORM.speed), overshoots a touch, and settles at s = 1.
   */
  function FORM_EASE(s) {
    const H = FORM.hit, v = FORM.speed;
    if (s <= 0) return 0;
    if (s >= 1) return 1;
    if (s < H) { const u = s / H; return (v - 2) * u * u * u + (3 - v) * u * u; }
    const k = (s - H) / (1 - H);
    return 1 + FORM_OVER * Math.sin(Math.PI * k) * (1 - k);
  }
  const FORM_OVER = (FORM.speed * (1 - FORM.hit)) / (Math.PI * FORM.hit);   // C¹ at the hit
  const FORM_PEAK = FORM_OVER * 0.5801;                                   // max of sin(πk)(1-k)
  const MAGNET = E.bezier(0.6, 0, 0.9, 1);               // wind up, accelerate, brake hard on contact

  // ─── Palette buckets ───────────────────────────────────────────────────────
  const COLORS = [
    R.hexToRgb(PAL.signal), R.mixRgb(PAL.signal, PAL.lilac, 0.5), R.hexToRgb(PAL.lilac),
    R.mixRgb(PAL.lilac, PAL.cobalt, 0.5), R.hexToRgb(PAL.cobalt), R.hexToRgb(PAL.acid),
  ];
  const ACID = 5;
  const PAPER_MIX = [0, 0.45, 0.85];                     // quantised whitening toward paper
  const TIER0 = 0.09, TIER_STEP = 1.6, TIERS = 7;        // geometric alpha ladder (tops out at 1)
  const WIDTHS = [1, 2.2];                               // fine (hairline fast path) / bold streaks
  const DOT_WIDTHS = [3, 4.6];                           // the same particles as stipple in the word
  const DOT_STEPS = 3;                                   // streak → dot, quantised per particle
  const LINE_W = WIDTHS.flatMap((w, k) => Array.from({ length: DOT_STEPS }, (_, j) => lerp(w, DOT_WIDTHS[k], j / (DOT_STEPS - 1))));
  const STYLES = [];                                      // [colour][mix][tier] → rgba()
  {
    const paper = R.hexToRgb(PAL.paper);
    for (let c = 0; c < COLORS.length; c++) {
      STYLES.push(PAPER_MIX.map((m) => Array.from({ length: TIERS }, (_, k) => {
        const rgb = COLORS[c].map((v, j) => Math.round(lerp(v, paper[j], m)));
        return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${Math.min(1, TIER0 * Math.pow(TIER_STEP, k)).toFixed(3)})`;
      })));
    }
  }
  const BUCKETS = COLORS.length * PAPER_MIX.length * TIERS * LINE_W.length;

  // ─── Pre-simulated state (built once in init, read-only afterwards) ────────
  let N = 0, S = 0;                                      // particles, stored samples each
  let flowX, flowY;                                      // [i * S + k] at t = k / 120
  let wordX, wordY, formA, formB, hitAt, wordCol;       // word target, formation window, contact, cooled hue
  let group, beadX, beadY, lag, phase, dither, colorOf, sizeOf, turbX, turbY;
  let latX, latY, arrive, condenseAt, gcx, gcy, gcol;    // per lattice point (196)
  let glow;                                              // soft white sprite for bead glows
  let lattice = [], wordBox = { x0: 0, x1: W }, ready = false;
  // Per-draw scratch (fully overwritten every call, so draw stays pure).
  const TRAIL = 6;
  let trail, keyOf, order, counts;

  // ─── Field ────────────────────────────────────────────────────────────────
  /** Curl field sampled on a space-time grid; returns a trilinear sampler. */
  function buildField() {
    const g = FIELD.grid, n = g.nx * g.ny;
    const vx = new Float32Array(n * g.nt), vy = new Float32Array(n * g.nt);
    for (let s = 0; s < g.nt; s++) {
      const z = s * g.dt;
      for (let j = 0; j < g.ny; j++) for (let i = 0; i < g.nx; i++) {
        const x = g.x0 + i * g.cell, y = g.y0 + j * g.cell, o = s * n + j * g.nx + i;
        const a = noise.curl2(x / FIELD.big.scale, y / FIELD.big.scale, FIELD.big.z + z * FIELD.big.dz);
        const b = noise.curl2(x / FIELD.fine.scale + 19.7, y / FIELD.fine.scale - 7.3, FIELD.fine.z + z * FIELD.fine.dz);
        vx[o] = FIELD.big.amp * a[0] + FIELD.fine.amp * b[0];
        vy[o] = FIELD.big.amp * a[1] + FIELD.fine.amp * b[1];
      }
    }
    const out = [0, 0];
    return function sample(x, y, t) {
      const fx = clamp((x - g.x0) / g.cell, 0, g.nx - 1.001), fy = clamp((y - g.y0) / g.cell, 0, g.ny - 1.001);
      const ft = clamp(t / g.dt, 0, g.nt - 1.001);
      const i = fx | 0, j = fy | 0, s = ft | 0, u = fx - i, v = fy - j, w = ft - s;
      const o0 = s * n + j * g.nx + i, o1 = o0 + n;
      const bil = (a, o) => (a[o] * (1 - u) + a[o + 1] * u) * (1 - v) + (a[o + g.nx] * (1 - u) + a[o + g.nx + 1] * u) * v;
      out[0] = lerp(bil(vx, o0), bil(vx, o1), w);
      out[1] = lerp(bil(vy, o0), bil(vy, o1), w);
      // A slow global rotation turns the shells into spiral arms. It orbits on
      // ellipses shaped like the stage (still divergence-free), so the arms wheel
      // around inside it instead of being driven into its rim.
      out[0] -= FIELD.swirl * SWIRL_K * (y - ORIGIN.y);
      out[1] += FIELD.swirl / SWIRL_K * (x - ORIGIN.x);
      return out;
    };
  }

  /** Soft stage wall: bends outward motion along the rim and reels in strays. */
  function contain(x, y, out) {
    const ex = (x - ORIGIN.x) / STAGE.ax, ey = (y - ORIGIN.y) / STAGE.ay, re = Math.hypot(ex, ey);
    if (re <= STAGE.soft) return;
    let nx = ex / STAGE.ax, ny = ey / STAGE.ay;
    const nl = Math.hypot(nx, ny); nx /= nl; ny /= nl;
    const f = smoothstep(STAGE.soft, STAGE.hard, re), vn = out[0] * nx + out[1] * ny;
    if (vn > 0) {
      // (-ny, nx) is the swirl's own direction, so rim currents never meet head-on
      out[0] += f * vn * (-STAGE.turn * ny - nx);
      out[1] += f * vn * (STAGE.turn * nx - ny);
    }
    if (re > 1) { const k = STAGE.pull * (re - 1) * STAGE.ay; out[0] -= k * nx; out[1] -= k * ny; }
  }

  /** The 6.5 pressure ring at (x, y): 0..1 band strength, plus its outward unit normal. */
  let RNX = 0, RNY = 0;
  function gustRing(x, y, t) {
    const G = FIELD.gust, pk = (t - G.at) / G.ring;
    if (pk < 0 || pk >= 1) return 0;
    const ex = (x - ORIGIN.x) / STAGE.ax, ey = (y - ORIGIN.y) / STAGE.ay, r = Math.hypot(ex, ey) || 1e-6;
    RNX = ex / r; RNY = ey / r;
    const d = (r - lerp(G.r0, G.r1, E.outExpo(pk))) / G.width;
    return Math.exp(-d * d) * (1 - pk) * (1 - pk);
  }

  /** Field strength: fades in as the burst decays, surges on the 6.5 beat. */
  function fieldGain(t) {
    const G = FIELD.gust, d = t - G.at;
    const gust = d > 0 ? G.gain * Math.exp(-G.decay * d) * (1 - Math.exp(-60 * d)) : 0;
    return smoothstep(0.02, 0.3, t) * (1 + gust);
  }

  // ─── Word ─────────────────────────────────────────────────────────────────
  /** Stratified (jittered-grid) samples inside each glyph of the word. */
  function sampleWord(step) {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.font = R.font(WORD.size, 'display', 900);
    g.letterSpacing = `${WORD.tracking * WORD.size}px`;
    g.textBaseline = 'alphabetic';
    const glyphs = R.layoutLetters(g, WORD.text, 'left');
    const pts = [];
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    const ox = 200, base = 700;                          // provisional origin, recentred below
    glyphs.forEach((gl, li) => {
      g.clearRect(0, 0, W, H);
      g.fillStyle = '#fff';
      g.fillText(gl.ch, ox + gl.x + WORD.kern[li], base);
      const d = g.getImageData(0, 0, W, H).data;
      for (let gy = 0; gy < H; gy += step) for (let gx = 0; gx < W; gx += step) {
        const cell = (gy / step) * 4099 + gx / step;
        const x = gx + hash(cell, 11) * step, y = gy + hash(cell, 12) * step;
        const xi = Math.min(W - 1, x | 0), yi = Math.min(H - 1, y | 0);
        if (d[(yi * W + xi) * 4 + 3] > 127) {
          pts.push([x, y, li]);
          if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
    });
    // Centre on the ink bounding box (optical, not advance-width, centring).
    const dx = WORD.cx - (x0 + x1) / 2, dy = WORD.cy - (y0 + y1) / 2;
    for (const p of pts) { p[0] += dx; p[1] += dy; }
    return { pts, box: { x0: x0 + dx, x1: x1 + dx, y0: y0 + dy, y1: y1 + dy } };
  }

  /**
   * Pairs point set A with an equal-size set B by recursive median splits along
   * B's longer axis (a cheap stand-in for optimal transport). Neighbours stay
   * neighbours, so swarms travel as coherent streams instead of criss-crossing.
   * Returns pair[i] = index into B for point i of A.
   */
  function bisectMatch(ax, ay, bx, by) {
    const n = ax.length, ia = new Int32Array(n), ib = new Int32Array(n), pair = new Int32Array(n);
    for (let i = 0; i < n; i++) { ia[i] = i; ib[i] = i; }
    const split = (lo, hi) => {
      if (hi - lo === 1) { pair[ia[lo]] = ib[lo]; return; }
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (let k = lo; k < hi; k++) {
        const j = ib[k];
        if (bx[j] < x0) x0 = bx[j]; if (bx[j] > x1) x1 = bx[j];
        if (by[j] < y0) y0 = by[j]; if (by[j] > y1) y1 = by[j];
      }
      const useX = x1 - x0 >= y1 - y0, ka = useX ? ax : ay, kb = useX ? bx : by;
      ia.subarray(lo, hi).sort((p, q) => ka[p] - ka[q]);
      ib.subarray(lo, hi).sort((p, q) => kb[p] - kb[q]);
      const mid = (lo + hi) >> 1;
      split(lo, mid); split(mid, hi);
    };
    if (n) split(0, n);
    return pair;
  }

  /**
   * k bead centres spread evenly through the letters (Lloyd relaxation from a
   * stratified start), plus owner[i] = nearest centre for every point. Patches
   * stay inside the strokes, so the beads read as a dot-matrix FLOW.
   */
  function relaxBeads(px, py, k, iters) {
    const n = px.length, cx = new Float32Array(k), cy = new Float32Array(k), owner = new Int32Array(n);
    const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => px[a] - px[b] || py[a] - py[b]);
    for (let c = 0; c < k; c++) { const i = order[Math.floor(((c + 0.5) / k) * n)]; cx[c] = px[i]; cy[c] = py[i]; }
    const sx = new Float64Array(k), sy = new Float64Array(k), cnt = new Int32Array(k);
    for (let it = 0; it <= iters; it++) {
      for (let i = 0; i < n; i++) {
        let best = 0, bd = Infinity;
        for (let c = 0; c < k; c++) { const dx = px[i] - cx[c], dy = py[i] - cy[c], d = dx * dx + dy * dy; if (d < bd) { bd = d; best = c; } }
        owner[i] = best;
      }
      if (it === iters) break;
      sx.fill(0); sy.fill(0); cnt.fill(0);
      for (let i = 0; i < n; i++) { const c = owner[i]; sx[c] += px[i]; sy[c] += py[i]; cnt[c]++; }
      for (let c = 0; c < k; c++) if (cnt[c]) { cx[c] = sx[c] / cnt[c]; cy[c] = sy[c] / cnt[c]; }
    }
    return { x: cx, y: cy, owner };
  }

  // ─── init: sample, burst, simulate, match ─────────────────────────────────
  function init() {
    lattice = shared.latticePoints();
    // Word targets: pick the grid step that yields ~WORD.count points.
    let step = 6, word = sampleWord(step);
    for (let k = 0; k < 2; k++) {
      step *= Math.sqrt(word.pts.length / WORD.count);
      word = sampleWord(step);
    }
    wordBox = word.box;
    N = word.pts.length;

    // Launch conditions: shells by share, stratified angles, lumpy fronts.
    const speed = new Float32Array(N), ang = new Float32Array(N), r0 = new Float32Array(N);
    colorOf = new Uint8Array(N); sizeOf = new Uint8Array(N);
    phase = new Float32Array(N); dither = new Float32Array(N); lag = new Float32Array(N);
    const nSpark = Math.round(N * BURST.sparkShare);
    let cursor = 0;
    const plan = BURST.shells.map((s, k) => ({ ...s, n: k === BURST.shells.length - 1 ? 0 : Math.round((N - nSpark) * s.share) }));
    plan[plan.length - 1].n = N - nSpark - plan.slice(0, -1).reduce((a, s) => a + s.n, 0);
    const setup = (i, j, n) => {
      ang[i] = ((j + hash(i, 3)) / n) * TAU;
      phase[i] = hash(i, 4); dither[i] = hash(i, 5); lag[i] = hash(i, 6);
      r0[i] = 3 + 10 * hash(i, 7);
      sizeOf[i] = hash(i, 8) < 0.28 ? 1 : 0;
    };
    for (const s of plan) for (let j = 0; j < s.n; j++, cursor++) {
      const i = cursor;
      setup(i, j, s.n);
      // Coherent lumps in the front + a little per-particle scatter.
      const lump = 1 + 0.16 * noise.n2(Math.cos(ang[i]) * 1.6 + s.color * 5.1, Math.sin(ang[i]) * 1.6);
      speed[i] = s.reach * BURST.drag * lump * (1 + 0.05 * (hash(i, 9) - 0.5) * 2);
      const drift = hash(i, 10);                        // a few borrow the neighbouring hue
      colorOf[i] = drift < 0.12 ? Math.max(0, s.color - 1) : drift > 0.88 ? Math.min(4, s.color + 1) : s.color;
    }
    for (let j = 0; j < nSpark; j++, cursor++) {
      const i = cursor;
      setup(i, j, nSpark);
      speed[i] = lerp(BURST.sparkReach[0], BURST.sparkReach[1], hash(i, 9)) * BURST.drag;
      colorOf[i] = ACID; sizeOf[i] = 0;
    }

    // Pre-simulate: burst impulse with drag + curl field, RK2 at 240 Hz.
    const field = buildField();
    const steps = Math.round(SIM.end / SIM.dt);
    S = Math.floor(steps / SIM.every) + 1;
    flowX = new Float32Array(N * S); flowY = new Float32Array(N * S);
    const [sx, sy] = BURST.stretch;
    const vel = (i, x, y, t, out) => {
      const b = speed[i] * Math.exp(-BURST.drag * t), gain = fieldGain(t);
      const f = field(x, y, t);
      out[0] = Math.cos(ang[i]) * sx * b + gain * f[0];
      out[1] = Math.sin(ang[i]) * sy * b + gain * f[1];
      if (colorOf[i] !== ACID) contain(x, y, out);       // sparks are free to leave
    };
    const v1 = [0, 0], v2 = [0, 0];
    for (let i = 0; i < N; i++) {
      let x = ORIGIN.x + Math.cos(ang[i]) * r0[i] * sx, y = ORIGIN.y + Math.sin(ang[i]) * r0[i] * sy;
      flowX[i * S] = x; flowY[i * S] = y;
      for (let n = 0; n < steps; n++) {
        const t = n * SIM.dt;
        vel(i, x, y, t, v1);
        vel(i, x + v1[0] * SIM.dt / 2, y + v1[1] * SIM.dt / 2, t + SIM.dt / 2, v2);
        x += v2[0] * SIM.dt; y += v2[1] * SIM.dt;
        if ((n + 1) % SIM.every === 0) { const o = i * S + (n + 1) / SIM.every; flowX[o] = x; flowY[o] = y; }
      }
    }

    // Flow → word: match on positions at FORM.match so swarms stay coherent.
    const km = Math.round(FORM.match * 120);
    const ax = new Float32Array(N), ay = new Float32Array(N), bx = new Float32Array(N), by = new Float32Array(N);
    for (let i = 0; i < N; i++) { ax[i] = flowX[i * S + km]; ay[i] = flowY[i * S + km]; bx[i] = word.pts[i][0]; by[i] = word.pts[i][1]; }
    const toWord = bisectMatch(ax, ay, bx, by);
    wordX = new Float32Array(N); wordY = new Float32Array(N); formA = new Float32Array(N); formB = new Float32Array(N);
    hitAt = new Float32Array(N); wordCol = new Uint8Array(N);
    const B = word.box, rc = Math.cos(WORD.ramp), rs = Math.sin(WORD.ramp);
    const u0 = Math.min(B.x0 * rc + B.y0 * rs, B.x0 * rc + B.y1 * rs), u1 = Math.max(B.x1 * rc + B.y1 * rs, B.x1 * rc + B.y0 * rs);
    for (let i = 0; i < N; i++) {
      const p = word.pts[toWord[i]];
      wordX[i] = p[0]; wordY[i] = p[1];
      // Letters land in a quick left→right cascade that completes on the beat.
      const hit = FORM.lock - (3 - p[2]) * FORM.cascade - FORM.spread * hash(i, 13);
      const dur = lerp(FORM.dur[0], FORM.dur[1], clamp(Math.hypot(p[0] - ax[i], p[1] - ay[i]) / 900));
      formA[i] = hit - FORM.hit * dur;
      formB[i] = formA[i] + dur;
      hitAt[i] = hit;
      // On contact each particle flares white and cools into the house ramp laid
      // across the word (signal → lilac → cobalt), stochastically rounded so the
      // five hue buckets read as one continuous stipple gradient.
      const u = ((p[0] * rc + p[1] * rs) - u0) / (u1 - u0);
      wordCol[i] = Math.min(4, Math.floor(u * 4 + hash(i, 16)));
    }

    // Word → beads: 196 compact Voronoi patches of the letters (one per lattice
    // point), then beads → lattice with the same topology-preserving match.
    const L = lattice.length;
    const beads = relaxBeads(wordX, wordY, L, 10);
    const lx = Float32Array.from(lattice, (p) => p.x), ly = Float32Array.from(lattice, (p) => p.y);
    const toLat = bisectMatch(beads.x, beads.y, lx, ly);
    group = new Uint8Array(N);
    latX = lx; latY = ly; arrive = new Float32Array(L); condenseAt = new Float32Array(L);
    gcx = new Float32Array(L); gcy = new Float32Array(L);
    for (let b = 0; b < L; b++) { gcx[toLat[b]] = beads.x[b]; gcy[toLat[b]] = beads.y[b]; }
    for (let i = 0; i < N; i++) group[i] = toLat[beads.owner[i]];
    const h = (LAT.N - 1) / 2, rMax = Math.hypot(h, h);
    for (let g = 0; g < L; g++) {
      // Centre-out arrivals, measured on the ground plane so the wave is round in 3D.
      const rho = Math.hypot(lattice[g].i - h, lattice[g].j - h) / rMax;
      arrive[g] = lerp(GATHER.first, GATHER.last, rho);
      // Each patch of the word crumbles into its bead just before it is pulled in,
      // so the letters are eaten from the centre outward.
      condenseAt[g] = arrive[g] - GATHER.flight - GATHER.condense;
    }
    beadX = new Float32Array(N); beadY = new Float32Array(N);
    turbX = new Float32Array(N); turbY = new Float32Array(N);
    gcol = new Float32Array(L * 3);
    const tints = new Float32Array(L);
    for (let i = 0; i < N; i++) {
      const a = hash(i, 14) * TAU, r = GATHER.spread * Math.sqrt(hash(i, 15));
      beadX[i] = Math.cos(a) * r; beadY[i] = Math.sin(a) * r;
      const f = field(wordX[i], wordY[i], 1.2), m = Math.hypot(f[0], f[1]) || 1;
      turbX[i] = f[0] / m; turbY[i] = f[1] / m;
      if (colorOf[i] !== ACID) {
        const g = group[i], rgb = COLORS[wordCol[i]];
        gcol[g * 3] += rgb[0]; gcol[g * 3 + 1] += rgb[1]; gcol[g * 3 + 2] += rgb[2]; tints[g]++;
      }
    }
    for (let g = 0; g < L; g++) for (let k = 0; k < 3; k++) gcol[g * 3 + k] /= tints[g] || 1;

    glow = document.createElement('canvas');
    glow.width = glow.height = 64;
    const gg = glow.getContext('2d'), grad = gg.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.25, 'rgba(255,255,255,0.35)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    gg.fillStyle = grad; gg.fillRect(0, 0, 64, 64);

    trail = new Float32Array(N * (TRAIL + 1) * 2);
    keyOf = new Uint16Array(N); order = new Int32Array(N); counts = new Int32Array(BUCKETS + 1);
    ready = true;
  }

  // ─── Choreography as closed-form functions of time ─────────────────────────
  /** Word scale: settle after the lock, then a slow push while holding. */
  const wordScale = (t) => 1 + HOLD.breathe * E.outCubic(seg(t, FORM.lock, 1.45));
  const condenseOf = (g, t) => E.inOutCubic(seg(t, condenseAt[g], condenseAt[g] + GATHER.condense));
  /** Raw 0..1 flight progress of lattice point g's bead; members trail it by a lag. */
  const flightOf = (g, t, delay = 0) => seg(t, arrive[g] - GATHER.flight + delay, arrive[g]);

  let BX = 0, BY = 0;                                    // beadAt() output
  /** Centre of bead g at eased flight progress w: anticipation pull-back, then an arc in. */
  function beadAt(g, w, c) {
    const vx = latX[g] - gcx[g], vy = latY[g] - gcy[g];
    const m = w - GATHER.pull * c * (1 - w), a = GATHER.arc * Math.sin(Math.PI * w);
    BX = gcx[g] + vx * m - vy * a;
    BY = gcy[g] + vy * m + vx * a;
  }

  let PX = 0, PY = 0, REM = Infinity;                   // place() output (+ distance left to the glyph)
  /** Position of particle i at time t (flow → word → bead → lattice). */
  function place(i, t) {
    const f = clamp(t, 0, SIM.end) * 120;
    let k = f | 0; if (k > S - 2) k = S - 2;
    const u = f - k, o = i * S + k;
    let x = flowX[o] + (flowX[o + 1] - flowX[o]) * u, y = flowY[o] + (flowY[o + 1] - flowY[o]) * u;
    REM = Infinity;
    const ring = gustRing(x, y, t);
    if (ring > 0) { x += RNX * FIELD.gust.push * ring; y += RNY * FIELD.gust.push * ring; }
    if (t > formA[i]) {
      // Swoop off the field onto the word along an arc.
      let w = FORM_EASE(seg(t, formA[i], formB[i]));
      const sc = wordScale(t), jig = 0.6 * smoothstep(FORM.lock, 1.1, t);   // shimmer while holding
      const tx = WORD.cx + (wordX[i] - WORD.cx) * sc + jig * Math.sin(t * 23 + phase[i] * TAU);
      const ty = WORD.cy + (wordY[i] - WORD.cy) * sc + jig * Math.cos(t * 19 + phase[i] * 17);
      const dx = tx - x, dy = ty - y, d = Math.hypot(dx, dy);
      // The slam is a few crisp pixels however far the particle travelled.
      if (w > 1) w = 1 + (w - 1) * Math.min(1, FORM.over / (FORM_PEAK * d + 1e-6));
      const a = FORM.arc * Math.sin(Math.PI * clamp(w));
      x += dx * w - dy * a; y += dy * w + dx * a;
      REM = d * Math.hypot(1 - w, a);
    }
    const g = group[i];
    if (t > condenseAt[g]) {
      // Crumble into a halo around the group's bead, then chase it to the lattice.
      const c = condenseOf(g, t), w = MAGNET(flightOf(g, t, GATHER.lag * lag[i]));
      REM = 12 + 2400 * w;                                // condense as dots; comets only once in flight
      beadAt(g, w, c);
      const turb = 6 * Math.sin(Math.PI * c) * (1 - w), halo = 1 - w;
      const bx = BX + beadX[i] * halo + turbX[i] * turb, by = BY + beadY[i] * halo + turbY[i] * turb;
      x += (bx - x) * c; y += (by - y) * c;
    }
    PX = x; PY = y;
  }

  let ALPHA = 0, MIX = 0, DOT = 0, COL = 0, BOLD = 0;   // shade() output (MIX, COL, BOLD are bucket indices)
  /** Brightness and whitening of particle i at time t, currently at (x, y). */
  function shade(i, t, x, y) {
    // Dim while the shells are dense, so the burst keeps its colour instead of clipping.
    let a = smoothstep(0, 1 / 60, t) * lerp(0.42, 0.8, smoothstep(0.03, 0.35, t));
    let mix = 0, dot = stipple(t), col = colorOf[i], bold = sizeOf[i];
    const G = FIELD.gust;
    if (t >= G.at && t < G.at + G.ring) {
      // The 6.5 kick: the whole field brightens on the beat frame and a pressure
      // ring, born at the inner ribbons, races out to the rim of the stage.
      const ring = gustRing(x, y, t);
      a *= 1 + G.pulse * Math.exp(-12 * (t - G.at));
      a += G.boost * ring;
      mix = ring > 0.6 + 0.4 * dither[i] ? 2 : ring > 0.25 + 0.5 * dither[i] ? 1 : 0;
    }
    if (t > formA[i]) {
      const s = seg(t, formA[i], formB[i]), hold = smoothstep(FORM.hit - 0.12, FORM.hit + 0.05, s);
      const mid = Math.sin(Math.PI * clamp(s / FORM.hit));
      a *= 1 - 0.2 * mid;                                 // thin out while the swarm packs in...
      if (mid > 0.35) bold = 0;                           // ...as hairlines, so the swoop reads as silk, not fur
      const tw = Math.sin(t * 31 + phase[i] * TAU), twinkle = HOLD.level + 0.2 * tw;
      // Each particle flares as it makes contact; the whole word flashes on the beat frame.
      const dh = t - hitAt[i], contact = dh >= 0 ? Math.exp(-HOLD.contact * dh) : 0;
      const lockFlash = t >= FORM.lock ? HOLD.flash * Math.exp(-HOLD.flashDecay * (t - FORM.lock)) : 0;
      // Glint: a diagonal specular band sweeps the word left → right.
      const band = lerp(wordBox.x0 - 200, wordBox.x1 + 200, E.inOutSine(seg(t, HOLD.glint[0], HOLD.glint[1])));
      const u = wordX[i] + 0.35 * (wordY[i] - WORD.cy) - band;
      const glint = t > HOLD.glint[0] && t < HOLD.glint[1] ? Math.exp(-(u * u) / (2 * HOLD.glintW * HOLD.glintW)) : 0;
      const fieldOn = t >= GATHER.field ? 0.4 * Math.exp(-12 * (t - GATHER.field)) : 0;
      a = lerp(a, twinkle + 0.6 * contact + lockFlash + fieldOn + HOLD.glintGain * glint, hold);
      // Whiten stochastically (whole buckets only), so flashes decay particle by particle.
      const hot = Math.max(contact, 2 * lockFlash);
      mix = hot > 0.55 + 0.45 * dither[i] ? 2 : glint > 0.4 || hot > dither[i] ? 1 : 0;
      // Shimmer: a sparse subset catches the light at the crest of its twinkle.
      if (dh > 0.08 && lag[i] < HOLD.sparkle && tw > 0.8) mix = Math.max(mix, 1);
      if (dh >= 0) col = wordCol[i];                      // ...and cools into the designed ramp
    }
    const g = group[i];
    if (t > condenseAt[g]) {
      const c = condenseOf(g, t), s = flightOf(g, t, GATHER.lag * lag[i]);
      a *= (1 - 0.85 * c) * (1 - smoothstep(0.7, 1, s));
      // Only a few members stay lit as the bead's comet tail; the rest go dark at launch.
      if (phase[i] > GATHER.comet) a *= 1 - smoothstep(0, 0.25, s);
      dot *= 1 - c;
      mix = s >= 0.8 ? 1 : c > dither[i] ? 0 : mix;
    }
    if (colorOf[i] === ACID) a *= 1.3 * (1 - smoothstep(0.2, 0.42, t));   // sparks burn out
    ALPHA = a; MIX = mix; DOT = dot; COL = col; BOLD = bold;
  }

  /** Seconds between trail samples: crisp burst, long silky ribbons, dots at rest. */
  // (Short while the burst hands over to the field, so trails don't hook back
  // through that sharp turn; long once the ribbons are established.)
  const trailStep = (t) => R.tween(t, [[0, 1 / 420], [0.2, 1 / 320], [0.42, 1 / 100], [0.6, 1 / 100], [0.95, 1 / 300], [1.5, 1 / 300], [1.6, 1 / 160]]);
  /** Longest streak allowed (px): tight in the flow, longer comets in the lattice flight. */
  const trailCap = (t) => R.tween(t, [[1.45, 56], [1.6, 110]]);
  /** 0 → 1 as the particles settle into the word's stipple (each crumbles back on its own). */
  const stipple = (t) => smoothstep(0.93, 1.03, t);

  // ─── Drawing ──────────────────────────────────────────────────────────────
  function drawParticles(ctx, t) {
    const dt = trailStep(t), cap = trailCap(t), K = TRAIL, stride = (K + 1) * 2;
    const nMix = PAPER_MIX.length, lnStep = Math.log(TIER_STEP);
    counts.fill(0);
    for (let i = 0; i < N; i++) {
      place(i, t);
      const hx = PX, hy = PY;
      // Tails shorten as each particle closes on its glyph, so the word pulls into focus.
      const capI = Math.min(cap, FORM.focus[0] + FORM.focus[1] * REM);
      shade(i, t, hx, hy);
      if (ALPHA < TIER0 * 0.6) { keyOf[i] = BUCKETS; counts[BUCKETS]++; continue; }
      // Streaks are timed trails, but capped in length so fast swoops stay silky, not furry.
      const o = i * stride;
      trail[o] = hx; trail[o + 1] = hy;
      place(i, Math.max(0, t - K * dt));
      const len = Math.hypot(hx - PX, hy - PY), di = len > capI ? dt * capI / len : dt;
      for (let k = 1; k <= K; k++) {
        place(i, Math.max(0, t - k * di));
        trail[o + k * 2] = PX; trail[o + k * 2 + 1] = PY;
      }
      // Stochastic rounding onto the alpha ladder keeps group fades smooth.
      const q = Math.log(ALPHA / TIER0) / lnStep + dither[i] - 0.5;
      const tier = q < 0 ? 0 : q >= TIERS - 1 ? TIERS - 1 : Math.round(q);
      const width = BOLD * DOT_STEPS + Math.round(DOT * (DOT_STEPS - 1));
      const key = ((COL * nMix + MIX) * TIERS + tier) * LINE_W.length + width;
      keyOf[i] = key; counts[key]++;
    }
    // Counting sort into buckets, then one stroke per bucket.
    let acc = 0;
    for (let b = 0; b <= BUCKETS; b++) { const c = counts[b]; counts[b] = acc; acc += c; }
    for (let i = 0; i < N; i++) order[counts[keyOf[i]]++] = i;
    // Round caps are only needed once particles rest as dots; bevel joins are far cheaper.
    ctx.lineCap = t > 0.9 ? 'round' : 'butt'; ctx.lineJoin = 'bevel';
    let start = 0;
    for (let b = 0; b < BUCKETS; b++) {
      const end = counts[b];
      if (end === start) continue;
      const nW = LINE_W.length, width = b % nW, tier = ((b / nW) | 0) % TIERS;
      const mix = ((b / (nW * TIERS)) | 0) % nMix, col = (b / (nW * TIERS * nMix)) | 0;
      ctx.beginPath();
      for (let n = start; n < end; n++) {
        const o = order[n] * stride;
        ctx.moveTo(trail[o], trail[o + 1]);
        for (let k = 1; k <= K; k++) ctx.lineTo(trail[o + k * 2], trail[o + k * 2 + 1]);
        // A resting particle still needs a visible round dot.
        if (trail[o] === trail[o + K * 2] && trail[o + 1] === trail[o + K * 2 + 1]) ctx.lineTo(trail[o] + 0.01, trail[o + 1]);
      }
      ctx.lineWidth = LINE_W[width];
      ctx.strokeStyle = STYLES[col][mix][tier];
      ctx.stroke();
      start = end;
    }
  }

  /**
   * The 6.5 shockwave, drawn as geometry: a hairline ellipse (the stage's own
   * shape) born at the core on the beat frame, racing out to the rim and
   * thinning away, with a fainter echo one step behind it.
   */
  function drawGust(ctx, t) {
    const G = FIELD.gust, pk = (t - G.at) / G.ring;
    if (pk < 0 || pk >= 1) return;
    for (const [lagK, gain] of [[0, 1], [0.1, 0.4]]) {
      const q = pk - lagK;
      if (q < 0) continue;
      const e = E.outExpo(q), r = lerp(G.r0, G.r1, e), fade = Math.pow(1 - e, 1.2);   // gone once it slows
      ctx.beginPath();
      ctx.ellipse(ORIGIN.x, ORIGIN.y, STAGE.ax * r, STAGE.ay * r, 0, 0, TAU);
      ctx.lineWidth = lerp(3.2, 0.8, q);
      ctx.strokeStyle = `rgba(222,214,255,${(0.85 * gain * fade).toFixed(3)})`;
      ctx.stroke();
    }
  }

  /** The shatter: a hot core that blooms outward and dies within ~0.2 s. */
  function drawFlash(ctx, t) {
    if (t <= 0 || t > 0.25) return;
    const a = smoothstep(0, 1 / 60, t) * Math.exp(-18 * t);
    const r = 60 + 620 * E.outExpo(seg(t, 0, 0.3));
    const g = ctx.createRadialGradient(ORIGIN.x, ORIGIN.y, 0, ORIGIN.x, ORIGIN.y, r);
    g.addColorStop(0, `rgba(255,236,220,${0.55 * a})`);
    g.addColorStop(0.15, R.rgba(PAL.signal, 0.3 * a));
    g.addColorStop(0.5, R.rgba(PAL.lilac, 0.08 * a));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(ORIGIN.x - r, ORIGIN.y - r, 2 * r, 2 * r);
  }

  /** Bloom: blurred quarter-res copy of the particle layer, added back. */
  function drawBloom(ctx, t) {
    const b = R.buffer('s4-bloom', W / 4, H / 4);
    b.clear('#000');
    b.ctx.filter = R.blur(5);
    b.ctx.drawImage(ctx.canvas, 0, 0, W / 4, H / 4);
    b.ctx.filter = 'none';
    const kick = (at, k) => (t >= at ? Math.exp(-k * (t - at)) : 0);   // bloom swells on the 6.5 and 7.0 beats
    ctx.globalAlpha = 0.5 + 0.25 * Math.exp(-8 * t) + 0.3 * stipple(t) * (1 - smoothstep(1.5, 1.75, t))
      + 0.3 * kick(FIELD.gust.at, 12) + 0.35 * kick(FORM.lock, 10);
    ctx.drawImage(b.canvas, 0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  const bump = (k) => Math.sin(Math.PI * k) * (1 - k);   // 0 → peak ≈ 0.58 → 0

  /**
   * The 196 beads: they condense out of the letters, pull back, then are
   * magnetised onto their lattice point, whitening to paper and shrinking to
   * exactly LATTICE.dotR on contact, where they pop and ping a thin ring.
   */
  const PAPER_RGB = R.hexToRgb(PAL.paper);
  function drawBeads(ctx, t) {
    const paper = PAPER_RGB;
    for (let g = 0; g < lattice.length; g++) {
      if (t <= condenseAt[g]) continue;
      let x, y, r, rgb, glowA;
      if (t < arrive[g]) {
        const c = condenseOf(g, t), s = flightOf(g, t);
        beadAt(g, MAGNET(s), c);
        x = BX; y = BY;
        r = lerp(GATHER.beadR * E.outBack(c), LAT.dotR, s * s);
        const m = lerp(0.3, 1, smoothstep(0, 0.85, s));
        rgb = [0, 1, 2].map((k) => lerp(gcol[g * 3 + k], paper[k], m));
        glowA = c * lerp(0.22, 0.45, s);
      } else {
        const k = seg(t, arrive[g], arrive[g] + GATHER.pop);
        if (k >= 1) { R.fillCircle(ctx, latX[g], latY[g], LAT.dotR, LAT.dotColor); continue; }
        x = latX[g]; y = latY[g];
        r = LAT.dotR * (1 + 0.85 * bump(k));
        rgb = paper;
        glowA = 0.55 * (1 - k) * (1 - k);
      }
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = glowA;
      const gs = r * 5.5;
      ctx.drawImage(glow, x - gs / 2, y - gs / 2, gs, gs);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      R.fillCircle(ctx, x, y, r, `rgb(${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0})`);
    }
    // Contact pings: a hairline ring that expands and thins as each dot locks.
    ctx.strokeStyle = PAL.paper;
    for (let g = 0; g < lattice.length; g++) {
      const k = seg(t, arrive[g], arrive[g] + GATHER.ring);
      if (k <= 0 || k >= 1) continue;
      ctx.globalAlpha = 0.4 * (1 - k) * (1 - k);
      ctx.lineWidth = 1.1 * (1 - k) + 0.3;
      ctx.beginPath();
      ctx.arc(latX[g], latY[g], 5 + 10 * E.outCubic(k), 0, TAU);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /**
   * On the 7.5 beat the lattice's 196 targets switch on centre-out (the centre
   * mark lands on the beat frame): each pops in bright, settles to a faint mark,
   * then warms up again as its bead closes in.
   */
  function drawTargets(ctx, t) {
    if (t < GATHER.field) return;
    ctx.fillStyle = PAL.paper;
    for (const hot of [false, true]) {
      ctx.beginPath();
      for (let g = 0; g < lattice.length; g++) {
        if (t >= arrive[g]) continue;
        const at = GATHER.field + GATHER.marks * (arrive[g] - GATHER.first) / (GATHER.last - GATHER.first);
        if (t < at) continue;
        const k = seg(t, at, at + 0.12);
        const isHot = k < 0.5 || flightOf(g, t) > 0.55;
        if (isHot !== hot) continue;
        R.circlePath(ctx, latX[g], latY[g], lerp(2.8, 1.7, E.outCubic(k)));   // born bright on its frame
      }
      ctx.globalAlpha = hot ? 0.85 : 0.38;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /** The hand-off frame, drawn exactly as S5 expects it. */
  function drawLattice(ctx) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(0, 0, W, H);
    for (const p of lattice.length ? lattice : shared.latticePoints()) R.fillCircle(ctx, p.x, p.y, LAT.dotR, LAT.dotColor);
  }

  R.scene({
    id: 'particles', index: 4, label: 'Particles & Flow', start: 6, end: 8,
    init,
    draw(ctx, t) {
      if (t >= LOCK || !ready) { drawLattice(ctx); return; }
      // Everything luminous is added onto pure black, then the black is lifted to ink.
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      drawParticles(ctx, t);
      drawFlash(ctx, t);
      drawGust(ctx, t);
      drawBloom(ctx, t);
      ctx.fillStyle = PAL.ink;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';      // crisp paper from here on
      drawTargets(ctx, t);
      drawBeads(ctx, t);
    },
  });
})();
