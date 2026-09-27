/*
 * S3 · SHAPE & RHYTHM · 4.00–6.00 s (frames 240–359)
 *
 * A Swiss specimen sheet of motion: fifteen flat, beat-locked micro-loops on
 * a 5×3 grid, then everything is swallowed by a single ink dot.
 *
 *   4.00  Paper. Registration crosses mark the gutters, then the tiles bloom
 *         in lockstep with the soundtrack's 15 pentatonic plucks
 *         (tools/synth.py TILE_PLUCKS = 4.00 + k/32 s, in its diagonal order
 *         sorted by (row + col, row, col), each pluck panned to its tile's
 *         column): top-left first, sweeping to the bottom-right corner, the
 *         last tile landing on the 4.50 clap. Each opens from a dot into a
 *         square on a spring; its loop scales in a few frames later
 *         (secondary action) and its specimen tag types on at one character
 *         per frame.
 *   4.0–5.5  Every loop runs off absolute time, so hits land on the 120 BPM
 *         grid (4.5, 5.0, 5.5) and the 16th-note LED meter even plays the
 *         groove (kick on beats, clap on 4.5 / 5.5, hats on 16ths).
 *   5.00  Beat 3: a spring kick ripples out across the grid from the centre.
 *   5.42  The grid inhales (+4 %).
 *   5.50  On the clap, an ink iris punches through every tile, centre-out,
 *         and each tile snaps down into an ink dot.
 *   5.53–5.80  The dots spiral into the centre (inOutQuint, one vortex) and
 *         merge liquidly (metaball necks) into a nucleus whose area is the
 *         sum of theirs: 15 dots of r 18 make exactly r ≈ 70. Every arrival
 *         dents the nucleus from its side, so it wobbles like a droplet.
 *   5.76–5.87  The RIPPLE tile's rings return in reverse, converging on the
 *         nucleus (the reverse "suck"), which crouches 20 % (anticipation)…
 *   5.87–5.98  …then floods the frame on E.inExpo.
 *
 * Palette layout (rows top → bottom). Signal runs a diagonal through the
 * centre, paper frames the centre vertically, ink anchors opposite corners,
 * acid appears once:
 *
 *        INK     SIGNAL  PAPER   COBALT  LILAC
 *        LILAC   INK     SIGNAL  INK     COBALT
 *        ACID    COBALT  PAPER   SIGNAL  INK
 *
 * Contracts: frame 240 is solid paper, frame 359 is solid ink.
 */
(function () {
  'use strict';
  const R = window.REEL;
  const { PAL, E, W, H, TAU, BEAT, clamp, lerp, seg, smoothstep, hash, mix } = R;
  const HALF_PI = Math.PI / 2;

  // ── Timeline (local seconds; absolute = +4) ───────────────────────────────
  // Pop-in = the soundtrack's tile plucks (synth.py TILE_PLUCKS: 4.00 + k/32).
  // The 8 ms offset keeps frame 240 clean: its last motion-blur sub-sample is
  // at +7.3 ms (7/8 of a 180° shutter), so the first bloom starts after it.
  const POP_T0 = 0.008;
  const POP_STEP = BEAT / 16; // 1/64 note = 31.25 ms → plucks at 4.000 … 4.4375
  const POP_DUR = 0.38;       // spring reaches full size in ~76 ms: the last tile lands on the 4.50 clap
  const INHALE = 1.42;        // the grid swells into the collapse…
  const KICK = 1.0;           // 5.00, beat 3: a spring kick ripples out across the grid
  const COLLAPSE = 1.5;       // …which snaps on the 5.50 clap
  const CASCADE = 0.05;       // centre → corner delay of the collapse (3 frames)
  const CROUCH = 1.815;       // nucleus anticipation: squeezes 20 % …
  const EXPAND = 1.87;        // … then the ink floods out
  const SOLID = 1.98;         // frame 359 (t = 1.9833) and later: solid ink

  // ── Grid ──────────────────────────────────────────────────────────────────
  const S = 250, GAP = 28, COLS = 5, ROWS = 3;
  const GX = (W - (COLS * S + (COLS - 1) * GAP)) / 2;
  const GY = (H - (ROWS * S + (ROWS - 1) * GAP)) / 2;
  const DOT_R = 18;           // collapsed tile; 18·√15 ≈ 70 once all fifteen merge
  const SWIRL = 1.35;         // radians each dot turns on its way to the centre (one vortex)

  const mod = (i, n) => ((i % n) + n) % n;

  // ── Beat helpers (always absolute time) ───────────────────────────────────
  /** Beat counter at `div` subdivisions per beat: { i, ph } with ph ∈ [0,1). */
  function clock(T, div = 1) {
    const b = (T / BEAT) * div + 1e-9;
    const i = Math.floor(b);
    return { i, ph: b - i };
  }
  /** Stepped counter: holds, then snaps one unit forward at every subdivision. */
  function steps(T, div = 1, fn = E.snap, len = 0.6) {
    const { i, ph } = clock(T, div);
    return i + fn(clamp(ph / len));
  }

  // ── Drawing helpers ───────────────────────────────────────────────────────
  function disc(ctx, x, y, r, color) {
    ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); ctx.fillStyle = color; ctx.fill();
  }
  function line(ctx, x0, y0, x1, y1) {
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  }
  /** Parallel stripes (half-period thick) at `angle`, scrolled by `offset`. */
  function stripes(ctx, period, offset, angle, reach) {
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    const o = ((offset % period) + period) % period;
    for (let x = -reach - period + o; x < reach; x += period) ctx.rect(x, -reach, period / 2, reach * 2);
    ctx.fill();
    ctx.restore();
  }

  // ══ The fifteen loops ═════════════════════════════════════════════════════
  // Each draws centred on (0, 0) in a 250 px tile (clipped), colours from `c`.

  /** Tilted orrery: planets pass behind the sun, a moon circles the outer one. */
  function loopOrbit(ctx, T, c) {
    const b = T / BEAT, TILT = -0.34, FLAT = 0.36;
    const orbits = [{ a: 98, period: 2, r: 11, phase: 0.15 }, { a: 60, period: 1, r: 6.5, phase: 0.62 }];
    ctx.rotate(TILT);
    ctx.strokeStyle = c.line; ctx.lineWidth = 1.5;
    for (const o of orbits) { ctx.beginPath(); ctx.ellipse(0, 0, o.a, o.a * FLAT, 0, 0, TAU); ctx.stroke(); }
    const bodies = [];
    orbits.forEach((o, k) => {
      const th = TAU * (b / o.period + o.phase), z = Math.sin(th);
      const x = o.a * Math.cos(th), y = o.a * FLAT * z;
      bodies.push({ x, y, z, r: o.r * (1 + 0.14 * z), col: c.fg });
      if (k === 0) { // moon: two laps per beat around the outer planet
        const m = TAU * (b * 2 + 0.3), mz = Math.sin(m);
        bodies.push({ x: x + 21 * Math.cos(m), y: y + 21 * FLAT * mz, z: z + mz * 0.05, r: 3.5, col: c.fg });
      }
    });
    bodies.sort((p, q) => p.z - q.z);
    const sunR = 25 * (1 + 0.12 * R.beatPulse(T, 12));
    let sunDrawn = false;
    for (const p of bodies) {
      if (!sunDrawn && p.z >= 0) { disc(ctx, 0, 0, sunR, c.ac); sunDrawn = true; }
      disc(ctx, p.x, p.y, p.r, p.col);
    }
    if (!sunDrawn) disc(ctx, 0, 0, sunR, c.ac);
  }

  /** Bouncing ball: floor contact on every beat, squash on impact, stretch in flight. */
  function loopBounce(ctx, T, c) {
    const { ph } = clock(T);
    const r = 23, FLOOR = 84, APEX = 126, CONTACT = 0.045; // contact half-width in beats
    const inContact = ph < CONTACT || ph > 1 - CONTACT;
    let h = 0, sy = 1;
    if (inContact) {
      const u = ((ph + CONTACT) % 1) / (2 * CONTACT);   // 0..1 across the contact
      sy = 1 - 0.42 * Math.sin(Math.PI * u);
    } else {
      const p = (ph - CONTACT) / (1 - 2 * CONTACT);
      h = 4 * p * (1 - p);
      sy = 1 + 0.32 * Math.pow(Math.abs(1 - 2 * p), 5); // fastest near the floor
    }
    const sx = Math.pow(sy, -0.75);
    // shadow tightens as the ball rises
    ctx.fillStyle = c.line;
    ctx.beginPath(); ctx.ellipse(0, FLOOR + 1, r * 1.35 * (1 - 0.55 * h) * Math.max(sx, 1), 5 * (1 - 0.5 * h), 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = c.fg; ctx.lineWidth = 3;
    line(ctx, -64, FLOOR + 1.5, 64, FLOOR + 1.5);
    ctx.fillStyle = c.fg;
    ctx.beginPath(); ctx.ellipse(0, FLOOR - r * sy - h * APEX, r * sx, r * sy, 0, 0, TAU); ctx.fill();
  }

  /** Op art: 45° stripes step on the beat; a perpendicular disc steps on the off-beat. */
  function loopOpArt(ctx, T, c) {
    const P = 18;
    ctx.fillStyle = c.fg;
    stripes(ctx, P, steps(T) * P, Math.PI / 4, 190);
    ctx.save();
    ctx.beginPath(); ctx.arc(0, 0, 70, 0, TAU); ctx.clip();
    ctx.fillStyle = c.bg; ctx.fillRect(-72, -72, 144, 144);
    ctx.fillStyle = c.fg;
    stripes(ctx, P, -steps(T - BEAT / 2) * P, -Math.PI / 4, 80);
    ctx.restore();
  }

  /**
   * DNA helix of dots: two strands in counter-phase, a turn and a half in
   * view so the twist reads at a glance; sized and toned by depth, one full
   * turn per two beats, the strands breathing wider on every beat.
   */
  function loopHelix(ctx, T, c) {
    const b = T / BEAT, N = 13, SP = 14.5, TWIST = 0.78, AMP = 56 * (1 + 0.1 * R.beatPulse(T, 10));
    const dots = [], x0 = -((N - 1) / 2) * SP;
    // the two backbones, so the double helix reads as a ribbon, not a dot plot
    ctx.strokeStyle = c.line; ctx.lineWidth = 2;
    ctx.beginPath();
    for (const sgn of [1, -1]) {
      for (let j = 0; j <= 72; j++) {
        const u = (j / 72) * (N - 1), y = sgn * AMP * Math.sin(TAU * (b / 2) - u * TWIST);
        j ? ctx.lineTo(x0 + u * SP, y) : ctx.moveTo(x0 + u * SP, y);
      }
    }
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = x0 + i * SP, phi = TAU * (b / 2) - i * TWIST;
      const y = AMP * Math.sin(phi), z = Math.cos(phi);
      ctx.moveTo(x, y); ctx.lineTo(x, -y);
      dots.push({ x, y, z, col: c.fg }, { x, y: -y, z: -z, col: c.ac });
    }
    ctx.stroke();
    dots.sort((p, q) => p.z - q.z);
    for (const d of dots) {
      const k = (d.z + 1) / 2; // 0 far … 1 near
      disc(ctx, d.x, d.y, 2.5 + 6.5 * k * k, mix(c.bg, d.col, 0.35 + 0.65 * k));
    }
  }

  /** Newton's cradle: an end ball swings out and back every beat, click on the beat. */
  function loopCradle(ctx, T, c) {
    const { i, ph } = clock(T);
    const r = 13, BAR = -72, L = 114, AMAX = 0.43;
    const swing = AMAX * Math.sin(Math.PI * ph);
    const side = i % 2 === 0 ? 1 : -1;
    ctx.strokeStyle = c.fg; ctx.lineCap = 'round';
    ctx.lineWidth = 4; line(ctx, -74, BAR, 74, BAR);
    ctx.lineWidth = 1.5;
    for (let k = 0; k < 5; k++) {
      const x0 = (k - 2) * 2 * r;
      const th = (k === 4 && side === 1) ? swing : (k === 0 && side === -1) ? -swing : 0;
      const bx = x0 + L * Math.sin(th), by = BAR + L * Math.cos(th);
      line(ctx, x0, BAR, bx, by);
      disc(ctx, bx, by, r, c.fg);
    }
  }

  /** Lissajous 3:2 drawn by a tapering pen, its phase slowly precessing. */
  function loopLissajous(ctx, T, c) {
    const b = T / BEAT, A = 82, N = 70;
    const delta = HALF_PI + (b - 10) * 0.14;
    const P = (u) => [A * Math.sin(3 * u + delta), A * Math.sin(2 * u)];
    ctx.strokeStyle = c.line; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const p = P((i / 120) * TAU); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    ctx.stroke();
    const head = TAU * (b / 2), tail = TAU * 0.38;
    ctx.strokeStyle = c.fg; ctx.lineCap = 'round';
    let prev = P(head - tail);
    for (let i = 1; i <= N; i++) {
      const k = i / N, p = P(head - tail + tail * k);
      ctx.lineWidth = 0.8 + 6.2 * k * k;
      line(ctx, prev[0], prev[1], p[0], p[1]);
      prev = p;
    }
    disc(ctx, prev[0], prev[1], 7.5, c.fg);
  }

  /** Level meter playing the groove: kick lows, clap mids, hat highs, falling peak caps. */
  function meterHit(i, s) {
    const n = mod(s, 16), r = hash(i * 977 + s * 131, 41);
    const beat = n % 4 === 0, clap = n === 4 || n === 12;
    if (i <= 1) return beat ? 0.86 + 0.14 * r : 0.1 + 0.16 * r;
    if (i <= 4) return clap ? 0.72 + 0.22 * r : beat ? 0.42 + 0.2 * r : 0.12 + 0.24 * r;
    return (n % 2 === 0 ? 0.4 : 0.22) + 0.3 * r;
  }
  /**
   * LED ladder: every bar is a column of 12 cells (unlit cells stay faintly
   * visible, so the instrument has a shape even in silence). Levels light
   * whole cells; the peak-hold cell holds for 100 ms, then drops cell by
   * cell under gravity until it rests on the bar.
   */
  function loopMeter(ctx, T, c) {
    const STEP = BEAT / 4, s = Math.floor(T / STEP + 1e-9);
    const N = 7, BW = 20, BAR_GAP = 7, CELLS = 12, CELL = 9, PITCH = 12, BASE = 82;
    const x0 = -(N * BW + (N - 1) * BAR_GAP) / 2;
    const cellY = (j) => BASE - (j + 1) * PITCH + (PITCH - CELL);
    for (let i = 0; i < N; i++) {
      let lvl = 0, peak = 0;
      for (let k = 0; k < 12; k++) {
        const dt = T - (s - k) * STEP, a = meterHit(i, s - k);
        const attack = clamp(dt / 0.02);
        lvl = Math.max(lvl, a * attack * Math.exp(-Math.max(0, dt - 0.02) * 6.5));
        peak = Math.max(peak, a * attack - 10 * Math.pow(Math.max(0, dt - 0.1), 2));
      }
      const lit = Math.round(lvl * CELLS);
      const cap = Math.max(lit, Math.min(CELLS, Math.round(peak * CELLS)));
      const x = x0 + i * (BW + BAR_GAP);
      ctx.fillStyle = c.line;
      for (let j = lit; j < CELLS; j++) if (j !== cap - 1 || cap === lit) ctx.fillRect(x, cellY(j), BW, CELL);
      ctx.fillStyle = c.fg;
      for (let j = 0; j < lit; j++) ctx.fillRect(x, cellY(j), BW, CELL);
      if (cap > lit) { ctx.fillStyle = c.ac; ctx.fillRect(x, cellY(cap - 1), BW, CELL); }
    }
    ctx.fillStyle = c.fg; ctx.fillRect(x0, BASE + 6, N * BW + (N - 1) * BAR_GAP, 2);
  }

  /** Circle → square → triangle on every 8th note, turning a quarter each time. */
  const MORPH_SHAPES = ['circle', 'square', 'triangle'].map((k) => R.shapePts(k, 0, 0, 1, 144)); // unit radius
  function loopMorph(ctx, T, c) {
    const { i, ph } = clock(T, 2);
    const m = E.backOut(1.6)(clamp(ph / 0.7));
    const pts = R.morphPts(MORPH_SHAPES[mod(i, 3)], MORPH_SHAPES[mod(i + 1, 3)], m);
    ctx.rotate(HALF_PI * (i + m));
    ctx.scale(80, 80);
    ctx.beginPath(); R.polyPath(ctx, pts); ctx.fillStyle = c.fg; ctx.fill();
  }

  /**
   * Nested squares twisting a quarter turn per beat, outer ring leading.
   * Thin paper rings on ink with a signal core: the tile reads as ink (it
   * mirrors METER across the centre) and the rings make the stagger legible.
   */
  function loopTwist(ctx, T, c) {
    const sizes = [184, 146, 106, 60], cols = [c.fg, c.bg, c.fg, c.ac];
    for (let k = 0; k < sizes.length; k++) {
      const { i, ph } = clock(T - k * 0.045);
      ctx.save();
      ctx.rotate(HALF_PI * (i + E.backOut(1.4)(clamp(ph / 0.42))));
      ctx.fillStyle = cols[k];
      ctx.fillRect(-sizes[k] / 2, -sizes[k] / 2, sizes[k], sizes[k]);
      ctx.restore();
    }
  }

  /** Ripple rings: a heavy ring on each beat, a light one on each off-beat. */
  function loopRipple(ctx, T, c) {
    const { i } = clock(T, 2);
    for (let k = 3; k >= 0; k--) {
      const n = i - k, age = T - n * (BEAT / 2), p = age / 1.2;
      if (p < 0 || p > 1) continue;
      const onBeat = n % 2 === 0;
      const rad = 14 + (onBeat ? 150 : 90) * E.outCubic(p);
      const lw = (onBeat ? 15 : 6) * Math.pow(1 - p, 1.4);
      ctx.strokeStyle = onBeat ? c.fg : c.ac; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.arc(0, 0, rad, 0, TAU); ctx.stroke();
    }
    disc(ctx, 0, 0, 13 * (1 + 0.45 * R.beatPulse(T, 14)), c.fg);
  }

  /** Truchet quarter-circles: cells flip a quarter turn per beat in a diagonal wave. */
  const TRUCHET_FROM = 6; // count flips from beat 6 (T = 3.0) so orientation is a pure function of T
  const truchetFlips = (gx, gy, m) => hash(gx * 31 + gy * 7 + m * 101, 5) < 0.55;
  function loopTruchet(ctx, T, c) {
    const N = 5, CS = 50, HC = CS / 2;
    ctx.strokeStyle = c.fg; ctx.lineWidth = 10; ctx.lineCap = 'butt';
    ctx.beginPath();
    for (let gy = 0; gy < N; gy++) for (let gx = 0; gx < N; gx++) {
      const { i, ph } = clock(T - (gx + (N - 1 - gy)) * 0.022);
      let turns = hash(gx + gy * 5, 9) < 0.5 ? 0 : 1;
      for (let m = TRUCHET_FROM; m < i; m++) if (truchetFlips(gx, gy, m)) turns++;
      if (truchetFlips(gx, gy, i)) turns += E.backOut(1.5)(clamp(ph / 0.4));
      const th = turns * HALF_PI, cs = Math.cos(th), sn = Math.sin(th);
      const cx = (gx - 2) * CS, cy = (gy - 2) * CS;
      for (const [ox, oy, a0] of [[-HC, -HC, 0], [HC, HC, Math.PI]]) {
        const ax = cx + ox * cs - oy * sn, ay = cy + ox * sn + oy * cs;
        ctx.moveTo(ax + HC * Math.cos(th + a0), ay + HC * Math.sin(th + a0));
        ctx.arc(ax, ay, HC, th + a0, th + a0 + HALF_PI);
      }
    }
    ctx.stroke();
  }

  /** Clock wipe: a colour sweeps round the dial each beat, completing on the next. */
  function loopWipe(ctx, T, c) {
    const { i, ph } = clock(T), RD = 84;
    const cols = [c.fg, c.ac];
    disc(ctx, 0, 0, RD, cols[i % 2]);
    const a = TAU * E.inOutQuart(ph);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, RD, -HALF_PI, -HALF_PI + a); ctx.closePath();
    ctx.fillStyle = cols[(i + 1) % 2]; ctx.fill();
    ctx.strokeStyle = c.fg; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let k = 0; k < 12; k++) {
      const ang = (k / 12) * TAU, r0 = k % 3 === 0 ? 94 : 97;
      ctx.moveTo(Math.cos(ang) * r0, Math.sin(ang) * r0); ctx.lineTo(Math.cos(ang) * 104, Math.sin(ang) * 104);
    }
    ctx.stroke();
    disc(ctx, 0, 0, 5, c.bg);
  }

  /** Marching chevrons: rows step on 8th notes, the centre row leading like an arrowhead. */
  function loopChevrons(ctx, T, c) {
    const SP = 48, RH = 48, HH = 13;
    ctx.strokeStyle = c.fg; ctx.lineWidth = 10; ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
    ctx.beginPath();
    for (let r = 0; r < 5; r++) {
      const y = (r - 2) * RH, off = (steps(T - Math.abs(r - 2) * 0.03, 2, E.snap, 0.8) * SP) % SP;
      for (let k = -4; k <= 3; k++) {
        const x = k * SP + off + (r % 2) * SP / 2;
        ctx.moveTo(x - HH, y - HH); ctx.lineTo(x, y); ctx.lineTo(x - HH, y + HH);
      }
    }
    ctx.stroke();
  }

  /** Plus field: a wave of quarter-flips (+ ↔ ×) radiates from the centre every beat. */
  function loopPlus(ctx, T, c) {
    const N = 5, SP = 37, ARM = 11.5, TH = 5.5;   // field clears the tag even at the 1.45× wavefront
    for (let gy = 0; gy < N; gy++) for (let gx = 0; gx < N; gx++) {
      const x = (gx - 2) * SP, y = (gy - 2) * SP;
      const { i, ph } = clock(T - Math.hypot(gx - 2, gy - 2) * 0.05);
      const k = clamp(ph / 0.4);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.PI / 4) * (i + E.backOut(1.8)(k)));
      const s = 1 + 0.45 * Math.sin(Math.PI * k);
      ctx.scale(s, s);
      ctx.fillStyle = k > 0 && k < 0.3 ? c.ac : c.fg;   // acid only on the wavefront
      ctx.fillRect(-ARM, -TH / 2, ARM * 2, TH);
      ctx.fillRect(-TH / 2, -ARM, TH, ARM * 2);
      ctx.restore();
    }
  }

  /** Tumbling block: rolls a quarter turn per beat, lands on the beat, camera tracks. */
  function loopTumble(ctx, T, c) {
    const { i, ph } = clock(T);
    const A = 72, FLOOR = 34;
    const roll = E.inCubic(seg(ph, 0.1, 1));
    const squash = ph < 0.12 ? Math.sin(Math.PI * ph / 0.12) : 0;
    // floor ticks scroll with the camera
    const pan = roll * A;   // one block per beat = two ticks, so the long/short pattern stays put
    ctx.strokeStyle = c.line; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let k = -4; k <= 6; k++) { const x = k * (A / 2) - pan; ctx.moveTo(x, FLOOR + 10); ctx.lineTo(x, FLOOR + (k % 2 ? 16 : 22)); }
    ctx.stroke();
    ctx.fillStyle = c.line; ctx.fillRect(-125, FLOOR, 250, 2);
    // block: pivot on its bottom-right corner, camera counter-pans
    ctx.save();
    ctx.translate(-roll * A + A / 2, FLOOR);
    ctx.rotate(roll * HALF_PI);
    ctx.scale(1 + 0.12 * squash, 1 - 0.14 * squash);
    ctx.translate(-A / 2, 0);
    ctx.beginPath();
    ctx.rect(-A / 2, -A, A, A);
    ctx.fillStyle = c.fg; ctx.fill();
    // The bite shows which way up the block is. Each roll turns it a quarter
    // clockwise, so at rest it sits one corner further round per beat.
    const corners = [[A / 2, -A], [A / 2, 0], [-A / 2, 0], [-A / 2, -A]]; // TR, BR, BL, TL
    const [bx, by] = corners[mod(i, 4)];
    ctx.beginPath(); ctx.arc(bx, by, A * 0.5, 0, TAU); ctx.clip();
    ctx.fillStyle = c.bg; ctx.fillRect(-A / 2, -A, A, A);
    ctx.restore();
  }

  // ── The sheet: palette arrangement + loop per tile ────────────────────────
  // bg / fg / ac (accent) / line (a quiet tone of the tile) per tile.
  const tone = (bg, fg, k) => mix(bg, fg, k);
  const TILES = [
    // row 0
    { r: 0, c: 0, loop: loopOrbit, name: 'ORBIT', bg: PAL.ink, fg: PAL.paper, ac: PAL.signal, line: tone(PAL.ink, PAL.paper, 0.28) },
    { r: 0, c: 1, loop: loopBounce, name: 'SQUASH', bg: PAL.signal, fg: PAL.ink, ac: PAL.ink, line: tone(PAL.signal, PAL.ink, 0.22) },
    { r: 0, c: 2, loop: loopOpArt, name: 'OP ART', bg: PAL.paper, fg: PAL.ink, ac: PAL.ink, line: PAL.ink, outline: true, tab: true, bleed: true },
    { r: 0, c: 3, loop: loopHelix, name: 'HELIX', bg: PAL.cobalt, fg: PAL.paper, ac: PAL.lilac, line: tone(PAL.cobalt, PAL.paper, 0.3) },
    { r: 0, c: 4, loop: loopCradle, name: 'CRADLE', bg: PAL.lilac, fg: PAL.ink, ac: PAL.ink, line: PAL.ink },
    // row 1
    { r: 1, c: 0, loop: loopLissajous, name: 'LISSAJOUS', bg: PAL.lilac, fg: PAL.ink, ac: PAL.ink, line: tone(PAL.lilac, PAL.ink, 0.3) },
    { r: 1, c: 1, loop: loopMeter, name: 'METER', bg: PAL.ink, fg: PAL.paper, ac: PAL.signal, line: tone(PAL.ink, PAL.paper, 0.09) },
    { r: 1, c: 2, loop: loopMorph, name: 'MORPH', bg: PAL.signal, fg: PAL.ink, ac: PAL.ink, line: PAL.ink },
    { r: 1, c: 3, loop: loopTwist, name: 'TWIST', bg: PAL.ink, fg: PAL.paper, ac: PAL.signal, line: PAL.paper },
    { r: 1, c: 4, loop: loopPlus, name: 'WAVE', bg: PAL.cobalt, fg: PAL.paper, ac: PAL.acid, line: PAL.paper },
    // row 2
    { r: 2, c: 0, loop: loopTruchet, name: 'TRUCHET', bg: PAL.acid, fg: PAL.ink, ac: PAL.ink, line: PAL.ink, tab: true, bleed: true },
    { r: 2, c: 1, loop: loopRipple, name: 'RIPPLE', bg: PAL.cobalt, fg: PAL.paper, ac: PAL.lilac, line: PAL.paper },
    { r: 2, c: 2, loop: loopWipe, name: 'WIPE', bg: PAL.paper, fg: PAL.ink, ac: PAL.signal, line: PAL.ink, outline: true },
    { r: 2, c: 3, loop: loopChevrons, name: 'MARCH', bg: PAL.signal, fg: PAL.ink, ac: PAL.ink, line: PAL.ink, tab: true, bleed: true, tabClear: 48 }, // knockout swallows the top row's tips whole
    { r: 2, c: 4, loop: loopTumble, name: 'TUMBLE', bg: PAL.ink, fg: PAL.acid, ac: PAL.acid, line: tone(PAL.ink, PAL.paper, 0.35) },
  ];

  // Static per-tile choreography: position, pop-in rank, collapse / flight timing.
  (function layout() {
    const maxD = Math.hypot(2 * (S + GAP), S + GAP);
    // Pop order = the soundtrack's pluck order (synth.py: sorted by (r + c, r, c)),
    // so pluck k is heard panned to the column of the tile that blooms with it.
    const order = TILES.slice().sort((a, b) => (a.r + a.c) - (b.r + b.c) || a.r - b.r || a.c - b.c);
    order.forEach((tile, k) => { tile.rank = k; });
    for (const tile of TILES) {
      tile.x = GX + tile.c * (S + GAP) + S / 2;
      tile.y = GY + tile.r * (S + GAP) + S / 2;
      tile.dx = tile.x - W / 2; tile.dy = tile.y - H / 2;
      tile.dist = Math.hypot(tile.dx, tile.dy) / maxD;          // 0 centre … 1 corner
      tile.c0 = COLLAPSE + tile.dist * CASCADE;                  // collapse ripples centre-out
      // flight overlaps the shrink; a little jitter so symmetric tiles don't arrive in lockstep
      tile.f0 = tile.c0 + 0.025 + (hash(tile.rank, 71) - 0.5) * 0.03;
      tile.fDur = 0.22 + 0.08 * tile.dist + (hash(tile.rank, 72) - 0.5) * 0.03;
      // where and when it joins the nucleus (inOutQuint is within ~4 % of home at 0.7)
      tile.arrive = tile.f0 + tile.fDur * 0.7;
      tile.inAng = Math.atan2(tile.dy, tile.dx) + SWIRL;
    }
  })();

  const CENTRE = TILES.find((tile) => tile.dist === 0);   // the nucleus forms from this tile

  const popEase = E.spring(1, 0.5);    // ~6 % overshoot: lively, but gutters stay open
  /** Damped kick: peaks at 1 after ~60 ms, undershoots slightly, settles in ~0.35 s. */
  const springKick = (a) => (a <= 0 ? 0 : 2 * Math.exp(-a * 11) * Math.sin((a * TAU) / 0.28));
  const contentEase = E.backOut(1.7);

  /** Everything about a tile at local time t, before drawing. */
  function tileState(tile, t) {
    const s0 = POP_T0 + tile.rank * POP_STEP;
    const pop = popEase(seg(t, s0, s0 + POP_DUR));
    const inhale = 1 + 0.04 * E.inOutSine(seg(t, INHALE, COLLAPSE));
    const shrink = E.outExpo(seg(t, tile.c0, tile.c0 + 0.24));
    const kick = 1 + 0.05 * springKick(t - KICK - tile.dist * 0.09);
    const size = lerp(S * inhale * kick, DOT_R * 2, shrink) * pop;
    const bloom = 1 - E.outQuad(seg(t, s0, s0 + 0.11));          // dot → square on entry
    const round = Math.max(bloom, E.outCubic(seg(t, tile.c0, tile.c0 + 0.14)));
    const iris = E.outCubic(seg(t, tile.c0, tile.c0 + 0.06));    // ink punches out from the centre
    // Objects scale up out of their tile (secondary action); full-bleed patterns
    // can't (they'd show as a shrunken patch), so they zoom down 1.3× → 1× instead.
    const content = tile.bleed
      ? (t > s0 ? 1 + 0.3 * (1 - E.outCubic(seg(t, s0, s0 + 0.36))) : 0)
      : contentEase(seg(t, s0 + 0.06, s0 + 0.34));
    const typed = seg(t, s0 + 0.14, s0 + 0.14 + tile.name.length / 60);   // one character per frame
    // flight: a polar spiral into the centre
    const f = E.inOutQuint(seg(t, tile.f0, tile.f0 + tile.fDur));
    const rho = Math.hypot(tile.dx, tile.dy) * (1 - f), ang = Math.atan2(tile.dy, tile.dx) + SWIRL * f;
    return {
      size, round, iris, content, typed, f, rho,
      x: W / 2 + rho * Math.cos(ang), y: H / 2 + rho * Math.sin(ang),
      dotR: iris >= 1 ? size / 2 : 0,   // radius once the tile is all ink
    };
  }

  const DARK = new Set([PAL.ink, PAL.cobalt]);

  /**
   * Specimen tag in the tile's top-left corner: index + technique. On flat
   * tiles it sits on a chip of the tile colour; on the patterned ones (OP ART,
   * TRUCHET, MARCH) it becomes a solid corner tab, flush to the tile edge and
   * keylined in the tile colour, so it reads as designed, not as a hole.
   */
  function drawLabel(ctx, tile, k, shown, typed) {
    if (k < 0.2 || shown < 0.5 || typed <= 0) return;
    const name = tile.name.slice(0, Math.floor(typed * tile.name.length + 1e-6));
    ctx.save();
    ctx.scale(k, k);
    ctx.letterSpacing = '2px'; ctx.textBaseline = 'middle';
    const num = String(TILES.indexOf(tile) + 1).padStart(2, '0');
    const x = -S / 2 + 14, y = -S / 2 + 18;
    ctx.font = R.font(11, 'mono', 700);
    const wNum = ctx.measureText(num).width;
    ctx.font = R.font(11, 'mono', 400);
    const wAll = wNum + (name ? 8 + ctx.measureText(name).width : 0);
    let textCol = DARK.has(tile.bg) ? PAL.paper : PAL.ink;
    if (tile.tab) {
      const tw = 14 + wAll + 10, th = 36, key = 4;
      ctx.fillStyle = tile.bg; ctx.fillRect(-S / 2, -S / 2, tw + key, Math.max(th + key, tile.tabClear || 0));
      ctx.fillStyle = tile.fg; ctx.fillRect(-S / 2, -S / 2, tw, th);
      textCol = tile.bg;
    } else {
      ctx.fillStyle = tile.bg; ctx.fillRect(x - 6, y - 9, wAll + 10, 18);
    }
    ctx.fillStyle = textCol;
    ctx.fillText(name, x + wNum + 8, y);
    ctx.font = R.font(11, 'mono', 700);
    ctx.fillText(num, x, y);
    ctx.restore();
  }

  function drawTile(ctx, tile, st, T) {
    if (st.size < 0.5) return;
    const half = st.size / 2, k = st.size / S;
    ctx.save();
    ctx.translate(st.x, st.y);
    ctx.beginPath(); R.roundRectPath(ctx, -half, -half, st.size, st.size, half * st.round);
    if (st.iris >= 1) { ctx.fillStyle = PAL.ink; ctx.fill(); ctx.restore(); return; }   // all ink now: a dot
    ctx.fillStyle = tile.bg; ctx.fill();
    ctx.save();
    ctx.clip();
    if (st.content > 0.001) {
      ctx.save();
      ctx.scale(k * st.content, k * st.content);
      tile.loop(ctx, T, tile);
      ctx.restore();
      drawLabel(ctx, tile, k, st.content, st.typed);
    }
    if (tile.outline) {
      ctx.beginPath(); R.roundRectPath(ctx, -half + 1.25 * k, -half + 1.25 * k, st.size - 2.5 * k, st.size - 2.5 * k, (half - 1.25 * k) * st.round);
      ctx.strokeStyle = PAL.ink; ctx.lineWidth = 2.5 * Math.max(k, 0.4); ctx.stroke();
    }
    if (st.iris > 0) disc(ctx, 0, 0, st.iris * (half * Math.SQRT2 + 1), PAL.ink);
    ctx.restore();
    ctx.restore();
  }

  /**
   * Liquid bridge between two circles (the classic metaball tangent construction).
   * `v` spreads the neck; it thins to nothing as the circles part.
   */
  function metaball(ctx, x1, y1, r1, x2, y2, r2, reach) {
    const d = Math.hypot(x2 - x1, y2 - y1);
    if (r1 <= 0 || r2 <= 0 || d > reach || d <= Math.abs(r1 - r2)) return;
    const v = 0.5 * (1 - smoothstep(r1 + r2, reach, d) * 0.6);
    let u1 = 0, u2 = 0;
    if (d < r1 + r2) {
      u1 = Math.acos(clamp((r1 * r1 + d * d - r2 * r2) / (2 * r1 * d), -1, 1));
      u2 = Math.acos(clamp((r2 * r2 + d * d - r1 * r1) / (2 * r2 * d), -1, 1));
    }
    const base = Math.atan2(y2 - y1, x2 - x1), spread = Math.acos(clamp((r1 - r2) / d, -1, 1));
    const a1 = base + u1 + (spread - u1) * v, a2 = base - u1 - (spread - u1) * v;
    const a3 = base + Math.PI - u2 - (Math.PI - u2 - spread) * v, a4 = base - Math.PI + u2 + (Math.PI - u2 - spread) * v;
    const P = (x, y, a, r) => [x + r * Math.cos(a), y + r * Math.sin(a)];
    const p1 = P(x1, y1, a1, r1), p2 = P(x1, y1, a2, r1), p3 = P(x2, y2, a3, r2), p4 = P(x2, y2, a4, r2);
    const hs = Math.min(v * 2.4, Math.hypot(p1[0] - p3[0], p1[1] - p3[1]) / (r1 + r2)) * Math.min(1, (d * 2) / (r1 + r2));
    const h1 = P(p1[0], p1[1], a1 - HALF_PI, r1 * hs), h2 = P(p2[0], p2[1], a2 + HALF_PI, r1 * hs);
    const h3 = P(p3[0], p3[1], a3 + HALF_PI, r2 * hs), h4 = P(p4[0], p4[1], a4 - HALF_PI, r2 * hs);
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.bezierCurveTo(h1[0], h1[1], h3[0], h3[1], p3[0], p3[1]);
    ctx.lineTo(p4[0], p4[1]);
    ctx.bezierCurveTo(h4[0], h4[1], h2[0], h2[1], p2[0], p2[1]);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Registration crosses at the eight inner gutter intersections: the layout
   * grid shows first, tiles land around it, and it leaves with the collapse.
   */
  function drawRegistration(ctx, t) {
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1.5;
    for (let gy = 1; gy < ROWS; gy++) for (let gx = 1; gx < COLS; gx++) {
      const k = gx + gy - 2;                                  // same top-left → bottom-right sweep as the tiles
      const on = E.outBack(seg(t, 0.01 + k * 0.09, 0.13 + k * 0.09));
      const off = 1 - E.inBack(seg(t, COLLAPSE - 0.06, COLLAPSE + 0.02));
      const a = 8 * on * off;
      if (a <= 0.05) continue;
      const x = GX + gx * (S + GAP) - GAP / 2, y = GY + gy * (S + GAP) - GAP / 2;
      ctx.beginPath(); ctx.moveTo(x - a, y); ctx.lineTo(x + a, y); ctx.moveTo(x, y - a); ctx.lineTo(x, y + a); ctx.stroke();
    }
  }

  // Reverse ripple: the RIPPLE tile's rings played backwards, converging on the nucleus.
  const SUCK_RINGS = [{ a: 1.735, b: 1.835, r0: 260 }, { a: 1.775, b: 1.865, r0: 200 }];

  /**
   * The collapse: dots spiral into a nucleus whose area is the sum of theirs.
   * Each arrival dents it along its incoming direction (a quadrupole wobble,
   * like a droplet swallowing another), rings converge, it crouches, it floods.
   */
  function drawNucleus(ctx, t, states) {
    const cx = W / 2, cy = H / 2, core = states.get(CENTRE);
    if (core.dotR <= 0) return;                       // the centre tile is still irising
    let area = 0, qx = 0, qy = 0;
    for (const tile of TILES) {
      if (tile === CENTRE) continue;
      area += 1 - smoothstep(0, DOT_R * 2.2, states.get(tile).rho);   // merges as it touches
      const a = t - tile.arrive;
      if (a > 0) {
        const w = 0.014 * Math.exp(-a * 15) * Math.sin((a * TAU) / 0.13);
        qx += w * Math.cos(2 * tile.inAng); qy += w * Math.sin(2 * tile.inAng);
      }
    }
    let rn = Math.sqrt(core.dotR * core.dotR + area * DOT_R * DOT_R);
    rn *= 1 - 0.2 * E.inOutCubic(seg(t, CROUCH, EXPAND));               // anticipation
    const grow = E.inExpo(seg(t, EXPAND, SOLID + 0.0033));
    const r = lerp(rn, 1200, grow);                                      // corners are 1101 px out
    ctx.fillStyle = PAL.ink;
    for (const tile of TILES) {
      if (tile === CENTRE) continue;
      const st = states.get(tile);
      if (st.f > 0 && st.rho > 1) metaball(ctx, cx, cy, rn, st.x, st.y, st.dotR, (rn + DOT_R) * 1.45);
    }
    ctx.strokeStyle = PAL.ink;
    for (const ring of SUCK_RINGS) {
      const p = seg(t, ring.a, ring.b);
      if (p <= 0 || p >= 1) continue;
      ctx.lineWidth = 12 * Math.pow(p, 1.4);
      ctx.beginPath(); ctx.arc(cx, cy, lerp(ring.r0, rn, E.inQuad(p)), 0, TAU); ctx.stroke();
    }
    const q = Math.min(0.06, Math.hypot(qx, qy)) * (1 - grow), psi = Math.atan2(qy, qx) / 2;
    ctx.beginPath(); ctx.ellipse(cx, cy, r * (1 + q), r * (1 - q), psi, 0, TAU); ctx.fill();
  }

  R.scene({
    id: 'shapes', index: 3, label: 'Shape & Rhythm', start: 4, end: 6,
    draw(ctx, t, env) {
      if (t >= SOLID) { ctx.fillStyle = PAL.ink; ctx.fillRect(0, 0, W, H); return; } // hand-off to S4
      ctx.fillStyle = PAL.paper; ctx.fillRect(0, 0, W, H);
      const T = env.T;
      const states = new Map();
      for (const tile of TILES) states.set(tile, tileState(tile, t));
      drawRegistration(ctx, t);
      // Flying dots are drawn outermost-first so late arrivals pass over early ones.
      const order = t < COLLAPSE ? TILES : TILES.slice().sort((a, b) => b.dist - a.dist);
      for (const tile of order) drawTile(ctx, tile, states.get(tile), T);
      if (t >= COLLAPSE) drawNucleus(ctx, t, states);
    },
  });
})();
