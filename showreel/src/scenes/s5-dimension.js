/*
 * S5 · 3D & DIMENSION · 8.00–10.00 s (frames 480–599)
 * "The flat becomes volume." Software 3D in Canvas2D: 196 flat-shaded columns
 * on S4's lattice, orthographic iso camera, painter's algorithm.
 *
 *   8.00  Frame 480 is S4's flat lattice, untouched (held until its shutter
 *         closes, so the motion-blurred frame is exact too).
 *   8.01  The hit (frame 481): every dot extrudes into a square column, centre
 *         first, the rise rippling out over 0.18 s. Each column shoots past
 *         its rest height and settles on a damped spring; tops cool from paper
 *         into the height ramp. The camera dollies in on the impact, then
 *         orbits slowly (yaw 45° → 72°) and creeps in. The lattice carries on
 *         past the city as a faint floor, revealed outward; a viewport gizmo
 *         and live camera readout draw on bottom-left, on the HUD's column.
 *   8.36  Anticipation: the centre sinks, then snaps up with a white-hot flash
 *         on the 8.50 kick and a decelerating shock ring punches out across the
 *         city, a trough riding behind the crest. Again on 9.00 and 9.50, each
 *         kick harder (lilac → signal → signal with acid rim-lit tips). A
 *         hairline ring leaves the city along the floor, lighting the floor
 *         dots as it passes; the camera bumps. A slow sine keeps the field alive.
 *   9.70  The signal corrupts, in lockstep with the audio's buffer-repeat
 *         stutter: every stutter slice replays the picture from the 9.50 kick
 *         (a touch faster each time) while a signal/cobalt channel split,
 *         quantised slice displacement, macroblocks, smear streaks and
 *         scanlines ramp up. HUD jitter and label corruption ramp with it.
 *   9.98  Peak corruption on frame 599 (the audio's breath): a few slices
 *         already invert to ink on lilac, S6a's opening palette. Hard cut.
 *
 * Shading: top faces carry the height ramp (deep cobalt → cobalt → lilac →
 * signal, acid only on the tallest tips at the kick peaks), the left (+z) face
 * is mid, the right (+x) face darkest. Side faces fade to ink toward the floor
 * (drawn in each face's own affine frame, so the fade follows true height),
 * back rows sit in a little atmosphere, and each top catches a bevel light on
 * its two front edges.
 */
(function () {
  'use strict';
  const R = window.REEL;
  const { PAL, E, TAU, clamp, lerp, seg, smoothstep, hash, shared } = R;
  const { W, H } = R;
  const LAT = shared.LATTICE;
  const DEG = Math.PI / 180;
  const FPS = 60;

  // ─── Choreography (local seconds; absolute T = 8 + t) ──────────────────────
  const WAKE = 0.5 / FPS;               // frame 480's shutter closes here
  const LAST = 2 - 1 / FPS;             // frame 599
  const CAM = {
    yaw: [45 * DEG, 72 * DEG], orbit: [0, 1.95],        // slow orbit over the whole shot
    dolly: 4.5, dollyDur: 0.7,                          // push on the hit (outExpo) …
    drift: 2.5,                                         // … then a slow creep
    lift: -12, settle: 14,                              // cy: rise with the dolly, sink with the orbit
    bump: 0.014,                                        // scale kick on each beat
  };
  const COLUMN = { size: 0.72, dotSize: 0.05 };         // footprint, in lattice spacings
  const RISE = {
    spread: 0.18, grow: 0.16, decay: 0.085, period: 0.32, cool: [0.03, 0.3],
    launch: 1.9, launchPeak: 0.07,                      // each column shoots past its rest height, then settles
  };
  const FIELD = {
    base: 0.32, dome: 0.95, domeR: 4.4,                 // resting skyline
    ripple: 0.6, k: TAU / 5.6, w: TAU, fadeIn: [0.12, 0.55], // travelling sine, 1 Hz outward
    calm: [5.6, 9.4, 0.85],                             // motion fades past the inscribed circle (no corner spikes)
  };
  // Each kick's snap is launched LEAD s early so the crown peaks on the beat frame itself.
  const LEAD = 0.025;
  const KICKS = [{ t: 0.5 - LEAD, amp: 3.0 }, { t: 1.0 - LEAD, amp: 3.6 }, { t: 1.5 - LEAD, amp: 4.3 }];
  const WAVE = {
    reach: 11.5, tau: 0.3,              // front = reach·(1 − e^(−τ/tau)): a decelerating shock
    width: 0.95, spread: 1.2,           // crest width grows as it travels
    decay: 0.42, trough: 0.42, lag: 1.5,
    antic: 0.14, dip: 0.3, coreR2: 5,   // wind-up: the centre sinks before the kick
  };
  // The shock leaves the city as a hairline ring on the floor and sweeps the frame.
  const FLOOR_RING = { reach: 15.5, tau: 0.36, life: 0.62, width: 1.6 };
  // S4's lattice carries on past the city as a faint floor, revealed outward on the hit.
  const FLOOR_DOTS = { reach: 14, r: 1.7, alpha: 0.2, fade: [8, 14], reveal: [0.04, 0.034], litR: 0.75, steps: 8 };
  // Viewport overlay, stacked on the HUD's x = 80 column above the chapter label.
  const GIZMO = { x: 112, y: 862, len: 26, at: 0.14, stagger: 0.05, textX: 80, textY: [910, 931], textW: 440 };
  const HEAT = { lo: 0.3, hi: 4.6, acid: [4.75, 5.1], flash: 0.03 };   // acid: rim-light on the tallest tips at kick peaks
  const SHADE = { left: 0.42, right: 0.68, fogH: 2.4, fog: 0.9, haze: 0.22, bevel: 0.55 };

  // Stutter slices of the audio (tools/synth.py: 9.70 → 9.98, source = the 9.50 kick).
  const S16 = 0.125;
  const STUTTER = {
    from: 1.7, src: 1.5, pitch: 0.045,
    lens: [S16 / 2, S16 / 2, S16 / 4, S16 / 4, S16 / 4, S16 / 8, S16 / 8, S16 / 8, S16 / 8],
  };
  const SLICE_AT = STUTTER.lens.reduce((a, len) => (a.push(a[a.length - 1] + len), a), [STUTTER.from]);

  // ─── Palette as rgb triples ────────────────────────────────────────────────
  const rgb = (hex) => R.hexToRgb(hex).slice();
  const INK = rgb(PAL.ink), PAPER = rgb(PAL.paper), ACID = rgb(PAL.acid);
  const mixA = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const css = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
  // Resting columns stay deep and quiet; only energy (height) earns light.
  const RAMP = [
    [0.0, mixA(INK, rgb(PAL.lilac), 0.26)],             // slate
    [0.24, mixA(rgb(PAL.cobalt), INK, 0.5)],            // deep cobalt
    [0.46, rgb(PAL.cobalt)],
    [0.7, rgb(PAL.lilac)],
    [0.93, rgb(PAL.signal)],
    [1.0, rgb(PAL.signal)],
  ];
  // Shadows lean cool: side faces sink toward a deep indigo, not grey.
  const SHADOW = mixA(rgb(PAL.cobalt), INK, 0.84);
  function heatColor(u) {
    u = clamp(u);
    let k = 1;
    while (k < RAMP.length - 1 && RAMP[k][0] < u) k++;
    const [u0, c0] = RAMP[k - 1], [u1, c1] = RAMP[k];
    return mixA(c0, c1, (u - u0) / (u1 - u0));
  }

  // ─── The lattice as columns ────────────────────────────────────────────────
  const HALF = (LAT.N - 1) / 2;
  const R_MAX = Math.hypot(HALF, HALF) * LAT.spacing;
  const R_MIN = Math.SQRT1_2 * LAT.spacing;             // the four centre columns go first, on the hit
  const COLS = [];
  for (let j = 0; j < LAT.N; j++) for (let i = 0; i < LAT.N; i++) {
    const x = (i - HALF) * LAT.spacing, z = (j - HALF) * LAT.spacing, r = Math.hypot(x, z);
    COLS.push({ i, j, x, z, r, delay: RISE.spread * Math.pow((r - R_MIN) / (R_MAX - R_MIN), 0.85) });
  }
  // The floor lattice around it (same half-integer grid); `edge` = distance out from the city's footprint.
  const FLOOR_GRID = [];
  for (let j = -FLOOR_DOTS.reach; j < FLOOR_DOTS.reach; j++) for (let i = -FLOOR_DOTS.reach; i < FLOOR_DOTS.reach; i++) {
    const x = (i + 0.5) * LAT.spacing, z = (j + 0.5) * LAT.spacing;
    const edge = Math.max(Math.abs(x), Math.abs(z)) - HALF * LAT.spacing;
    const r = Math.hypot(x, z);
    if (edge > 0 && r < FLOOR_DOTS.reach) FLOOR_GRID.push({ x, z, r, edge });
  }

  // ─── Timing helpers ────────────────────────────────────────────────────────
  /** Damped spring 0 → 1 that leaves the ground with velocity (an impact, not an ease-in). */
  const springRise = (tau) => (tau <= 0 ? 0 : 1 - Math.exp(-tau / RISE.decay) * Math.cos((TAU * tau) / RISE.period));
  /** Launch crest of the extrusion: τ·e^(1−τ), peaking at 1 after launchPeak seconds. */
  const launchBump = (tau) => { const x = tau / RISE.launchPeak; return tau <= 0 ? 0 : x * Math.exp(1 - x); };

  /** Beat bump for camera/lights: 1 on each kick, fast decay. */
  function kickPulse(t, decay = 0.09) {
    let p = 0;
    for (const k of KICKS) if (t >= k.t) p = Math.max(p, Math.exp(-(t - k.t) / decay));
    return p;
  }

  /** Stutter slice index at t: −1 before the glitch, lens.length in the final breath. */
  function sliceAt(t) {
    t += 1e-6;                                         // frame times are inexact (582/60 − 8 < 1.7)
    if (t < STUTTER.from) return -1;
    for (let k = 0; k < STUTTER.lens.length; k++) if (t < SLICE_AT[k + 1]) return k;
    return STUTTER.lens.length;
  }
  /** Buffer-repeat: inside the stutter, the picture replays from the 9.50 kick. */
  function cityTime(t) {
    const k = sliceAt(t);
    if (k < 0) return t;
    if (k >= STUTTER.lens.length) return STUTTER.src + 0.045;         // frozen in the breath
    return STUTTER.src + (t - SLICE_AT[k]) * (1 + STUTTER.pitch * k);
  }

  // ─── Camera & height field ─────────────────────────────────────────────────
  function camera(t) {
    const u = t - WAKE;
    const orbit = E.inOutSine(seg(u, CAM.orbit[0], CAM.orbit[1]));
    const dolly = E.outExpo(seg(u, 0, CAM.dollyDur));
    const scale = (LAT.scale + CAM.dolly * dolly + CAM.drift * orbit) * (1 + CAM.bump * kickPulse(t));
    const yaw = lerp(CAM.yaw[0], CAM.yaw[1], orbit);
    const cy = LAT.cy + CAM.lift * dolly + CAM.settle * orbit;
    const sy = Math.sin(yaw), cyw = Math.cos(yaw), sp = Math.sin(LAT.pitch), cp = Math.cos(LAT.pitch);
    // Screen deltas per world unit along x, z and height (orthographic).
    return { cx: LAT.cx, cy, scale, yaw, ex: [scale * cyw, scale * sy * sp], ez: [-scale * sy, scale * cyw * sp], ey: -scale * cp };
  }

  /** One kick: the centre winds down, snaps up, and a shock ring runs outward. */
  function kickHeight(r, tau, amp) {
    if (tau < -WAVE.antic) return 0;
    const core = Math.exp(-(r * r) / WAVE.coreR2);
    if (tau < 0) return -WAVE.dip * amp * core * E.inOutSine(seg(tau, -WAVE.antic, 0));
    const release = 1 - E.outCubic(seg(tau, 0, 0.07));
    const front = WAVE.reach * (1 - Math.exp(-tau / WAVE.tau));
    const w = WAVE.width + WAVE.spread * tau;
    const x = (r - front) / w, y = (r - front + WAVE.lag * w) / w;
    const env = Math.exp(-tau / WAVE.decay) * (1 - Math.exp(-tau / 0.014));
    return amp * (env * (Math.exp(-x * x) - WAVE.trough * Math.exp(-y * y)) - WAVE.dip * core * release);
  }

  /** White-hot flash on the core tops, anchored to the beat frame itself (not the early launch). */
  function kickFlash(r, t) {
    let fl = 0;
    for (const k of KICKS) {
      const tau = t - (k.t + LEAD);
      if (tau >= -0.004 && tau < 0.2) fl = Math.max(fl, Math.exp(-Math.max(0, tau) / HEAT.flash) * Math.exp(-(r * r) / 3));
    }
    return fl;
  }

  function fieldHeight(r, t) {
    let live = FIELD.ripple * smoothstep(FIELD.fadeIn[0], FIELD.fadeIn[1], t) * (0.5 + 0.5 * Math.sin(FIELD.k * r - FIELD.w * (t - 0.25)));
    for (const k of KICKS) live += kickHeight(r, t - k.t, k.amp);
    live *= 1 - FIELD.calm[2] * smoothstep(FIELD.calm[0], FIELD.calm[1], r);
    return Math.max(0.04, FIELD.base + FIELD.dome * Math.exp(-(r * r) / (FIELD.domeR * FIELD.domeR)) + live);
  }

  // ─── Drawing ───────────────────────────────────────────────────────────────
  /** Exactly S4's last frame. */
  function drawFlatLattice(ctx) {
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(0, 0, W, H);
    for (const p of shared.latticePoints()) R.fillCircle(ctx, p.x, p.y, LAT.dotR, LAT.dotColor);
  }

  /**
   * Floor light: a faint cool pool under the city, and per kick a hairline
   * shock ring painted on the floor (a ground circle is an axis-aligned ellipse
   * in this camera, whatever the yaw) that outruns the city and fades.
   */
  function drawFloor(ctx, t, cam, base) {
    const [a, b, c, d, e, f] = base;
    const sinP = Math.sin(LAT.pitch);
    // Pool, in the ground plane's own frame (world units).
    ctx.setTransform(a * cam.ex[0] + c * cam.ex[1], b * cam.ex[0] + d * cam.ex[1], a * cam.ez[0] + c * cam.ez[1], b * cam.ez[0] + d * cam.ez[1], a * cam.cx + c * cam.cy + e, b * cam.cx + d * cam.cy + f);
    const on = smoothstep(0.05, 0.6, t);
    const pool = ctx.createRadialGradient(0, 0, 0, 0, 0, 12);
    pool.addColorStop(0, R.rgba(PAL.cobalt, 0.1 * on));
    pool.addColorStop(0.6, R.rgba(PAL.cobalt, 0.03 * on));
    pool.addColorStop(1, R.rgba(PAL.cobalt, 0));
    ctx.fillStyle = pool;
    ctx.fillRect(-13, -13, 26, 26);
    ctx.setTransform(a, b, c, d, e, f);
    for (const k of KICKS) {
      const tau = t - k.t;
      if (tau < 0 || tau > FLOOR_RING.life) continue;
      const rr = FLOOR_RING.reach * (1 - Math.exp(-tau / FLOOR_RING.tau)) * cam.scale;
      const alpha = (1 - E.inQuad(tau / FLOOR_RING.life)) * (0.45 + 0.4 * k.amp / 4.3);
      ctx.strokeStyle = R.rgba(PAL.signal, alpha);
      ctx.lineWidth = FLOOR_RING.width * (1 - 0.5 * tau / FLOOR_RING.life);
      ctx.beginPath();
      ctx.ellipse(cam.cx, cam.cy, rr, rr * sinP, 0, 0, TAU);
      ctx.stroke();
    }
  }

  /** The floor lattice: paper pin-pricks that flare signal as a shock ring rolls over them. */
  function drawFloorDots(ctx, t, cam) {
    const [exx, exy] = cam.ex, [ezx, ezy] = cam.ez;
    const rings = [];
    for (const k of KICKS) {
      const tau = t - k.t;
      if (tau >= 0 && tau < FLOOR_RING.life) rings.push([FLOOR_RING.reach * (1 - Math.exp(-tau / FLOOR_RING.tau)), 1 - E.inQuad(tau / FLOOR_RING.life)]);
    }
    const buckets = Array.from({ length: FLOOR_DOTS.steps }, () => new Path2D());
    const dr = FLOOR_DOTS.r;
    ctx.fillStyle = PAL.signal;
    for (const d of FLOOR_GRID) {
      const on = E.outCubic(seg(t - FLOOR_DOTS.reveal[0] - FLOOR_DOTS.reveal[1] * d.edge, 0, 0.12));
      if (on <= 0) continue;
      const x = cam.cx + d.x * exx + d.z * ezx, y = cam.cy + d.x * exy + d.z * ezy;
      const a = on * FLOOR_DOTS.alpha * (1 - smoothstep(FLOOR_DOTS.fade[0], FLOOR_DOTS.fade[1], d.r)) * smoothstep(120, 220, y) * (1 - smoothstep(860, 960, y));
      if (a <= 0.004) continue;
      let lit = 0;
      for (const [rr, fade] of rings) { const q = (d.r - rr) / FLOOR_DOTS.litR; lit = Math.max(lit, fade * Math.exp(-q * q)); }
      if (lit > 0.05) {
        ctx.globalAlpha = Math.min(1, a / FLOOR_DOTS.alpha * lit);
        ctx.beginPath(); ctx.arc(x, y, dr * (1 + 0.6 * lit), 0, TAU); ctx.fill();
      }
      const b = Math.min(FLOOR_DOTS.steps - 1, Math.round((a / FLOOR_DOTS.alpha) * (FLOOR_DOTS.steps - 1)));
      if (b > 0) { buckets[b].moveTo(x + dr, y); buckets[b].arc(x, y, dr, 0, TAU); }
    }
    ctx.fillStyle = PAL.paper;
    for (let b = 1; b < FLOOR_DOTS.steps; b++) { ctx.globalAlpha = (b / (FLOOR_DOTS.steps - 1)) * FLOOR_DOTS.alpha; ctx.fill(buckets[b]); }
    ctx.globalAlpha = 1;
  }

  /**
   * Fill one side face (a parallelogram: bottom edge P→Q, extruded by h) in its
   * own affine frame, u along the edge and v = world height, so the floor fade
   * is a single shared gradient that follows true height.
   */
  function sideFace(ctx, base, px, py, qx, qy, ey, h, color, fog) {
    const [a, b, c, d, e, f] = base;
    const ux = qx - px, uy = qy - py;
    ctx.setTransform(a * ux + c * uy, b * ux + d * uy, c * ey, d * ey, a * px + c * py + e, b * px + d * py + f);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, h);
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, 1, Math.min(h, SHADE.fogH));
  }

  /** The city at city-time t (may be a replayed time during the stutter). */
  function drawCity(ctx, t) {
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(0, 0, W, H);
    const cam = camera(t);
    const m = ctx.getTransform();
    const base = [m.a, m.b, m.c, m.d, m.e, m.f];
    drawFloor(ctx, t, cam, base);
    drawFloorDots(ctx, t, cam);

    // Painter's algorithm: far (small depth) first.
    const sy = Math.sin(cam.yaw), cyw = Math.cos(cam.yaw);
    const order = COLS.map((col) => ({ col, depth: col.x * sy + col.z * cyw })).sort((p, q) => p.depth - q.depth);

    const fog = ctx.createLinearGradient(0, 0, 0, SHADE.fogH);
    fog.addColorStop(0, R.rgba(PAL.ink, SHADE.fog));
    fog.addColorStop(0.45, R.rgba(PAL.ink, SHADE.fog * 0.35));
    fog.addColorStop(1, R.rgba(PAL.ink, 0));

    const [exx, exy] = cam.ex, [ezx, ezy] = cam.ez, ey = cam.ey;
    const acidGate = kickPulse(t, 0.22);

    for (const { col, depth } of order) {
      const bx = cam.cx + col.x * exx + col.z * ezx, by = cam.cy + col.x * exy + col.z * ezy;
      const tau = t - WAKE - col.delay;
      if (tau <= 0) { R.fillCircle(ctx, bx, by, LAT.dotR, LAT.dotColor); continue; }

      const grow = E.outExpo(seg(tau, 0, RISE.grow));
      const rise = springRise(tau), launch = launchBump(tau);
      const h = fieldHeight(col.r, t) * rise + RISE.launch * (1 - 0.45 * col.r / R_MAX) * launch;
      const half = lerp(COLUMN.dotSize, COLUMN.size, grow) / 2 * (1 - 0.1 * launch);  // stretch thins it a hair

      // Colour: height ramp, cooled in from paper, hazed toward ink at the back.
      let top = heatColor((h - HEAT.lo) / (HEAT.hi - HEAT.lo));
      const acid = smoothstep(HEAT.acid[0], HEAT.acid[1], h) * acidGate;
      top = mixA(top, ACID, 0.1 * acid);
      top = mixA(top, PAPER, 0.7 * kickFlash(col.r, t));
      top = mixA(PAPER, top, E.outCubic(seg(tau, RISE.cool[0], RISE.cool[1])));
      const haze = SHADE.haze * clamp(0.5 - depth / (2 * R_MAX));
      top = mixA(top, INK, haze);
      const left = mixA(top, SHADOW, SHADE.left), right = mixA(top, SHADOW, SHADE.right);

      // Footprint corners (screen): back, right, front, left.
      const ax = half * exx, ay = half * exy, bzx = half * ezx, bzy = half * ezy;
      const Rx = bx + ax - bzx, Ry = by + ay - bzy;   // (+x, −z)
      const Fx = bx + ax + bzx, Fy = by + ay + bzy;   // (+x, +z) nearest corner
      const Lx = bx - ax + bzx, Ly = by - ay + bzy;   // (−x, +z)
      const Bx = bx - ax - bzx, By = by - ay - bzy;   // (−x, −z)
      const hy = h * ey;

      // Silhouette underlay in the mid tone hides AA seams between faces.
      ctx.setTransform(base[0], base[1], base[2], base[3], base[4], base[5]);
      ctx.fillStyle = css(left);
      ctx.beginPath();
      ctx.moveTo(Bx, By + hy); ctx.lineTo(Rx, Ry + hy); ctx.lineTo(Rx, Ry); ctx.lineTo(Fx, Fy); ctx.lineTo(Lx, Ly); ctx.lineTo(Lx, Ly + hy);
      ctx.closePath();
      ctx.fill();
      sideFace(ctx, base, Lx, Ly, Fx, Fy, ey, h, css(left), fog);    // +z face (left)
      sideFace(ctx, base, Fx, Fy, Rx, Ry, ey, h, css(right), fog);   // +x face (right)
      ctx.setTransform(base[0], base[1], base[2], base[3], base[4], base[5]);

      // Top face + bevel light on its two front edges.
      ctx.fillStyle = css(top);
      ctx.beginPath();
      ctx.moveTo(Bx, By + hy); ctx.lineTo(Rx, Ry + hy); ctx.lineTo(Fx, Fy + hy); ctx.lineTo(Lx, Ly + hy);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = css(mixA(mixA(top, PAPER, SHADE.bevel), ACID, acid));
      ctx.globalAlpha = 0.7 + 0.3 * acid;
      ctx.lineWidth = 1.25 + 1.25 * acid;
      ctx.beginPath();
      ctx.moveTo(Lx, Ly + hy); ctx.lineTo(Fx, Fy + hy); ctx.lineTo(Rx, Ry + hy);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    drawGizmo(ctx, t, cam);
  }

  /**
   * Viewport overlay, bottom-left: an axis gizmo that turns with the orbit
   * (X signal, Y acid, Z cobalt: the RGB convention, in house colours) and a
   * live camera readout in mono.
   */
  const PITCH_DEG = (LAT.pitch / DEG).toFixed(1);
  function drawGizmo(ctx, t, cam) {
    const { x: ox, y: oy, len } = GIZMO;
    const s = 1 / cam.scale;
    const axes = [
      { v: [cam.ex[0] * s, cam.ex[1] * s], depth: Math.sin(cam.yaw), color: PAL.signal, label: 'X' },
      { v: [0, cam.ey * s], depth: 0, color: PAL.acid, label: 'Y' },
      { v: [cam.ez[0] * s, cam.ez[1] * s], depth: Math.cos(cam.yaw), color: PAL.cobalt, label: 'Z' },
    ].map((a, i) => ({ ...a, grow: E.outExpo(seg(t, GIZMO.at + i * GIZMO.stagger, GIZMO.at + i * GIZMO.stagger + 0.3)) }))
      .sort((a, b) => a.depth - b.depth);
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;
    ctx.font = R.font(11, 'mono', 700);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '0px';
    for (const a of axes) {
      if (a.grow <= 0) continue;
      const tipX = ox + a.v[0] * len * a.grow, tipY = oy + a.v[1] * len * a.grow;
      ctx.strokeStyle = a.color;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(tipX, tipY); ctx.stroke();
      ctx.globalAlpha = smoothstep(0.6, 1, a.grow);
      ctx.fillStyle = a.color;
      ctx.fillText(a.label, ox + a.v[0] * (len + 13), oy + a.v[1] * (len + 13));
      ctx.globalAlpha = 1;
    }
    R.fillCircle(ctx, ox, oy, 2.5 * E.outBack(seg(t, GIZMO.at - 0.04, GIZMO.at + 0.12)), PAL.paper);

    // Readout: revealed left → right behind a moving edge, values live.
    const reveal = E.outExpo(seg(t, GIZMO.at + 0.1, GIZMO.at + 0.5));
    if (reveal <= 0) return;
    const yawDeg = (cam.yaw / DEG).toFixed(1).padStart(5, '0');
    const zoom = (cam.scale / LAT.scale).toFixed(2);
    ctx.save();
    ctx.beginPath();
    const [y0, y1] = GIZMO.textY;
    ctx.rect(GIZMO.textX - 4, y0 - 14, GIZMO.textW * reveal, y1 - y0 + 28);
    ctx.clip();
    ctx.textAlign = 'left';
    ctx.letterSpacing = '2.5px';
    ctx.font = R.font(12, 'mono', 700);
    ctx.fillStyle = R.rgba(PAL.paper, 0.85);
    ctx.fillText('ORTHO', GIZMO.textX, y0);
    const w = ctx.measureText('ORTHO').width;
    ctx.font = R.font(12, 'mono', 400);
    ctx.fillStyle = R.rgba(PAL.paper, 0.55);
    ctx.fillText('196 COLUMNS · Z-SORTED', GIZMO.textX + w + 14, y0);
    ctx.fillText(`YAW ${yawDeg}°   PITCH ${PITCH_DEG}°   ZOOM ${zoom}×`, GIZMO.textX, y1);
    ctx.restore();
  }

  // ─── Glitch-out ────────────────────────────────────────────────────────────
  const frameOf = (t) => 480 + Math.floor(t * FPS + 1e-6);

  /** 0 before 9.70; builds to exactly 1 on frame 599, with a burst on each stutter re-trigger. */
  function glitchAmount(t) {
    const k = sliceAt(t);
    if (k < 0) return 0;
    if (t >= LAST - 1e-6) return 1;
    const since = k < STUTTER.lens.length ? t - SLICE_AT[k] : 1;
    return clamp(0.1 + 0.72 * Math.pow(seg(t, STUTTER.from, LAST), 1.5) + 0.22 * Math.exp(-since / 0.022));
  }

  const GLITCH = {
    bands: [4, 8, 12, 20, 32, 48, 72, 104, 144],   // px; drawn by weighted hash, snapped to a 4 px grid
    shove: [24, 380], quant: 8,                     // band displacement, quantised
    split: [5, 34],                                 // signal / cobalt channel offset
    block: 16,                                      // macroblock grid
    area: [420, 1500, 230, 880],                    // blocks stay on the city (x0, x1, y0, y1)
    future: 0.3,                                    // share of lilac slices at the peak (on the city only)
  };

  /**
   * Full-frame offscreen canvas at the render scale. Like R.buffer, but pinned
   * to CPU raster (willReadFrequently, as the main canvas is in render mode):
   * a fresh R.buffer canvas can switch raster backend after its first draws,
   * and a reused context keeps whatever state the last frame left, so it is
   * fully reset here. Returned with an identity transform: device pixels.
   */
  const BUFFERS = new Map();
  function cpuBuffer(key) {
    const id = `${key}@${R.scale}`;
    let b = BUFFERS.get(id);
    if (!b) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(W * R.scale);
      canvas.height = Math.round(H * R.scale);
      b = { canvas, ctx: canvas.getContext('2d', { willReadFrequently: true }) };
      BUFFERS.set(id, b);
    }
    R.resetCtx(b.ctx);
    b.ctx.setTransform(1, 0, 0, 1, 0, 0);
    return b;
  }

  /** Blit a full-frame buffer's source rect (logical px) to the context. */
  function blit(ctx, buf, sx, sy, sw, sh, dx, dy, dw, dh) {
    const s = R.scale;
    ctx.drawImage(buf.canvas, sx * s, sy * s, Math.max(1e-3, sw * s), Math.max(1e-3, sh * s), dx, dy, dw, dh);
  }
  /** A horizontal band shifted by dx, wrapping around the frame. */
  function bandShift(ctx, buf, y, h, dx) {
    blit(ctx, buf, 0, y, W, h, dx, y, W, h);
    if (dx) blit(ctx, buf, 0, y, W, h, dx - Math.sign(dx) * W, y, W, h);
  }

  /**
   * The picture split into two "channels" in house colours: a signal and a
   * cobalt copy of its luminance. Screened back over the image with opposite
   * offsets they read as chromatic fringes, the same pair S6a's glitch-in uses.
   */
  function channelGhosts(city) {
    // Luminance, contrast-shaped as 2·L²: white, then the city as 'luminosity', squared, doubled.
    const luma = cpuBuffer('s5-luma'), g = luma.ctx, cw = luma.canvas.width, ch = luma.canvas.height;
    g.fillStyle = '#fff';
    g.fillRect(0, 0, cw, ch);
    g.globalCompositeOperation = 'luminosity';
    g.drawImage(city.canvas, 0, 0);
    g.globalCompositeOperation = 'multiply';
    g.drawImage(luma.canvas, 0, 0);
    g.globalCompositeOperation = 'lighter';
    g.drawImage(luma.canvas, 0, 0);
    return [PAL.signal, PAL.cobalt].map((tint, i) => {
      const b = cpuBuffer(`s5-ghost${i}`);
      b.ctx.drawImage(luma.canvas, 0, 0);
      b.ctx.globalCompositeOperation = 'multiply';
      b.ctx.fillStyle = tint;
      b.ctx.fillRect(0, 0, cw, ch);
      b.ctx.globalCompositeOperation = 'source-over';
      return b;
    });
  }

  function drawGlitch(ctx, t, g) {
    const f = frameOf(t), seed = f * 131 + 7;
    const city = cpuBuffer('s5-city');
    city.ctx.setTransform(R.scale, 0, 0, R.scale, 0, 0);
    drawCity(city.ctx, cityTime(t));                   // paints its own full background
    const [sig, cob] = channelGhosts(city);

    ctx.fillStyle = PAL.ink;
    ctx.fillRect(0, 0, W, H);

    // 1 · Slices: chunky bands shoved sideways on a quantised grid, each with
    //     its own channel split. A few lose colour sync and survive as one channel.
    const quant = GLITCH.quant;
    for (let y = 0, band = 0; y < H; band++) {
      const pick = Math.floor(Math.pow(hash(band, seed), 0.8 + 0.8 * g) * GLITCH.bands.length);
      const bh = Math.min(H - y, GLITCH.bands[GLITCH.bands.length - 1 - pick]);
      const moved = hash(band, seed + 1) < 0.15 + 0.55 * g;
      const reach = lerp(GLITCH.shove[0], GLITCH.shove[1], g * g * hash(band, seed + 2));
      const dx = moved ? quant * Math.round(((hash(band, seed + 3) < 0.5 ? -1 : 1) * reach) / quant) : 0;
      const s = lerp(GLITCH.split[0], GLITCH.split[1], g) * (0.4 + 1.2 * hash(band, seed + 4));
      const roll = hash(band, seed + 5);
      const mono = roll < 0.1 * g;
      const future = !mono && bh <= 72 && y > GLITCH.area[2] && y < GLITCH.area[3] && roll < 0.1 * g + GLITCH.future * smoothstep(0.7, 1, g);
      if (!mono) bandShift(ctx, city, y, bh, dx);
      ctx.globalCompositeOperation = 'screen';
      bandShift(ctx, sig, y, bh, dx + s);
      if (!mono) bandShift(ctx, cob, y, bh, dx - s);
      if (future) {
        // S6a bleeding in: the slice inverts to ink columns on lilac, the next shot's palette.
        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = PAL.lilac;
        ctx.fillRect(0, y, W, bh);
      }
      ctx.globalCompositeOperation = 'source-over';
      y += bh;
    }

    // 2 · Macroblocks: grid-snapped chunks of the picture from somewhere else; a rare few decode flat.
    const B = GLITCH.block, [ax0, ax1, ay0, ay1] = GLITCH.area, tints = [PAL.signal, PAL.cobalt, PAL.paper, PAL.acid];
    const nBlocks = Math.floor(2 + 12 * g);
    for (let k = 0; k < nBlocks; k++) {
      const bw = B * (3 + Math.floor(hash(k, seed + 20) * 12)), bh = B * (1 + Math.floor(hash(k, seed + 21) * 4));
      const x = B * Math.floor(lerp(ax0, ax1 - bw, hash(k, seed + 22)) / B);
      const y = B * Math.floor(lerp(ay0, ay1 - bh, hash(k, seed + 23)) / B);
      const sx = clamp(x + B * Math.round((hash(k, seed + 24) - 0.5) * 20), 0, W - bw);
      const sy = clamp(y + B * Math.round((hash(k, seed + 25) - 0.5) * 6), 0, H - bh);
      blit(ctx, city, sx, sy, bw, bh, x, y, bw, bh);
      const flat = hash(k, seed + 26);
      if (flat < 0.16 * g) {
        ctx.fillStyle = tints[Math.min(tints.length - 1, Math.floor(flat / (0.16 * g) * (g > 0.9 ? 4 : 3)))];
        ctx.fillRect(x, y, bw, Math.max(4, bh / 4));
      }
    }

    // 3 · Smear streaks: a 2 px sliver of a row dragged across (pixel-sort feel).
    const nSmear = Math.floor(1 + 7 * g);
    for (let k = 0; k < nSmear; k++) {
      const y = 4 * Math.floor(lerp(0.25, 0.8, hash(k, seed + 40)) * H / 4), sh = 2 + 2 * Math.floor(hash(k, seed + 41) * 4);
      const sx = lerp(520, 1400, hash(k, seed + 42)), dw = lerp(240, 900, hash(k, seed + 43));
      blit(ctx, city, sx, y, 2, sh, sx - dw * hash(k, seed + 44), y, dw, sh);
    }

    // 4 · Scanlines, and on the peak frames a bright tear.
    ctx.fillStyle = `rgba(0,0,0,${0.08 + 0.24 * g})`;
    ctx.beginPath();
    for (let y = 0; y < H; y += 4) ctx.rect(0, y, W, 2);
    ctx.fill();
    for (let k = 0; k < 2; k++) {
      if (hash(k, seed + 60) > g * g) continue;
      ctx.globalAlpha = 0.35 + 0.4 * hash(k, seed + 61);
      ctx.fillStyle = PAL.paper;
      ctx.fillRect(0, 4 * Math.floor(lerp(0.2, 0.85, hash(k, seed + 62)) * H / 4), W, 2);
    }
    ctx.globalAlpha = 1;
  }

  // ─── HUD label corruption ──────────────────────────────────────────────────
  const LABEL = '3D & Dimension';
  const JUNK = '#%/_=+01<>';
  function corruptLabel(g, f) {
    if (g < 0.45) return undefined;
    let out = '';
    for (let i = 0; i < LABEL.length; i++) {
      const c = LABEL[i];
      out += c !== ' ' && hash(i, f * 17 + 3) < (g - 0.45) * 0.9 ? JUNK[Math.floor(hash(i, f * 17 + 4) * JUNK.length)] : c;
    }
    return out;
  }

  R.scene({
    id: 'dimension', index: 5, label: LABEL, start: 8, end: 10,
    draw(ctx, t) {
      if (t < WAKE) { drawFlatLattice(ctx); return; }
      const g = glitchAmount(t);
      if (g > 0) drawGlitch(ctx, t, g);
      else drawCity(ctx, t);
    },
    hud(t) {
      const g = glitchAmount(t);
      if (g <= 0) return {};
      const f = frameOf(t);
      return { jitter: g >= 1 ? 1 : g * (0.75 + 0.25 * hash(f, 5)), label: corruptLabel(g, f) };
    },
  });
})();
