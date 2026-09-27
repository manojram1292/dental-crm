/*
 * S5 · ONE SYSTEM · 15.0–17.5 s (frames 450–524) · rail: 02 MAKE
 *
 * The thesis beat: four kinds of work become one system, and the system becomes
 * one point of intelligence that is put to work.
 *
 *   15.000  The four bowls chime together. Each cup's glow swells, and its light
 *           spills onto the inner wall behind it.
 *   15.080 · 15.240 · 15.400  Copper hairlines arch from glow to glow, left to
 *           right, one per ping in the score: four kinds of work, linked.
 *   15.300–15.620  Then the arc above them: from every glow a finer hairline climbs
 *           and curls in to one point over the row, where a pin of light waits.
 *   15.500  Anticipation: the lights settle a hair deeper into their cups.
 *   15.625  (beat) The lights lift out (the outer pair on the beat, the inner pair a
 *           64th later). The links stretch and let go; the arcs are drawn up into
 *           the waiting point. The key and the fill fall away: the cups dim and are
 *           lit only by the rising lights. The camera cranes up with them.
 *   15.650  "Intelligence. Put to work." rises in, centred above the row
 *           ("Intelligence." in ember).
 *   15.95   The four have gathered on one ring over the row, evenly spaced; the
 *           ring spins faster and faster as it rises and closes: a spiral of light.
 *   16.250  (beat) The ring closes into one ember, with a soft flare. It hangs just
 *           above the row, the only light in the room, lighting the dust around it
 *           and the insides of the four cups below.
 *   16.875  The groove drops away. The line lifts out, the camera tilts down after
 *           the ember as it drifts down, and the row sinks away from its light into
 *           the dark.
 *   17.500  Hand-off: the ember alone at palmSpark on the S6 backdrop.
 *
 * Contracts.
 *   IN  (frame 450): exactly S4's out frame. Four cups at rowX (rotation 0), camera
 *       exactly RB.shots.row4Wide, kit-default lights and materials, default
 *       backdrop, RB.fx.ember(r = 26/6, intensity 0.5) at each mouth centre
 *       (y = 0.9 × cup height), no text. Rail 02 active.
 *   OUT (frame 524 → S6 at 17.5): only RB.fx.ember at RB.shots.palmSpark (960, 500),
 *       r = 13, intensity 1, at rest, on RB.atmos.backdrop({ gx: 960, gy: 540,
 *       gr: 900, lift: 0.7 }). No cups (3D layer skipped from 17.43), no line
 *       work, no dust, no text (the last word clears at 17.455). Rail 02, progress
 *       (T − 7.5) / 10, reaching 1 at 17.5.
 *
 * One draw3D per frame (four kit cups, ~170k triangles, five lights).
 */
(function () {
  'use strict';
  const R = window.REEL, RB = window.RB, THREE = window.THREE;
  const { PAL, E, clamp, lerp, seg } = R;
  const TAU = Math.PI * 2;

  // ─── Timing (absolute seconds; one beat = 0.625 s) ──────────────────────────
  const CHIME = 15.0;                          // the four bowls, together
  const LINKS = [15.08, 15.24, 15.4];          // the three hairline pings (0.2 s each)
  const LINK_DUR = 0.2;
  const PATHS = [15.3, 15.62];                 // the four plan arcs climb to the meeting point
  const DIP = 15.5;                            // anticipation before the lift
  const LIFT = 15.625;                         // beat: the lights lift …
  const LIFT_LAG = R.BEAT / 16;                // … the outer pair on the beat, the inner pair a 64th later
  const MERGE = 16.25;                         // beat: one ember
  const SINK = [16.875, 17.5];                 // the groove drops away; the row sinks
  const END = 17.5;
  // The storyboard's tOut is 17.05; starting the exit 75 ms earlier lets the last
  // word clear completely by frame 524 (the kit's exit runs 0.42 s plus stagger).
  const LINE = { text: 'Intelligence. Put to work.', x: 960, y: 300, size: 64, tIn: 15.65, tOut: 16.975, stagger: 0.05, dur: 0.7 };

  // ─── World ──────────────────────────────────────────────────────────────────
  const XS = RB.shots.rowX;
  const MOUTH_Y = RB.CUP.height * 0.9;         // S4's glow height
  const GLOW = { r: 26 / 6, i: 0.5 };          // S4's glow at the wide shot
  const MEET = [0, 1.4, 0.1];                  // where the four lights become one
  const EMBER_END = [0, 1.01, 0.2];            // where the ember drifts to (≈ palmSpark on the end camera)
  const DIP_DEPTH = 0.04;
  const EMBER_HOLD = 1.15;                     // the ember is a touch larger while it hangs over the row
  const PLAN_TWIST = 0.5 * Math.PI;            // the plan arcs curl a quarter turn round the axis
  const RING_R = 0.85;                         // the ring the four lights gather on
  const SWIRL = 1.05 * Math.PI;                // how far that ring turns as it closes
  const ARCH = 0.2;                            // height of the links between neighbouring cups
  const SINK_DEPTH = 2.5;                      // how far the row sinks
  const WIDE = RB.shots.row4Wide;
  const SPARK = RB.shots.palmSpark;
  const BACK_IN = { gx: 1060, gy: 520, gr: 900, lift: 1 };   // RB.atmos.backdrop defaults (S4's wide shot)
  const BACK_OUT = { gx: 960, gy: 540, gr: 900, lift: 0.7 }; // the S6 contract
  const KEY_I = 2.2, RIM_I = 2.2 * 0.9;                      // RB.stage() defaults

  let S = null; // built once in init()

  // ─── Small helpers ──────────────────────────────────────────────────────────
  const _v = new THREE.Vector3();
  /** Screen position (logical px) of a world point for the posed camera. */
  function proj(cam, p) {
    _v.set(p[0], p[1], p[2]).project(cam);
    return [(_v.x * 0.5 + 0.5) * R.W, (-_v.y * 0.5 + 0.5) * R.H];
  }
  /** Pixels per world unit at a world point (perspective-correct 2D sizes). */
  function pxPerUnit(cam, p) {
    const d = Math.hypot(cam.position.x - p[0], cam.position.y - p[1], cam.position.z - p[2]);
    return (R.H / 2) / Math.tan((cam.fov * Math.PI) / 360) / d;
  }
  /** A struck pulse: fast attack at t0, exponential ring-out. */
  const strike = (T, t0, attack, decay) => (T < t0 ? 0 : seg(T, t0, t0 + attack) * Math.exp(-Math.max(0, T - t0 - attack) * decay));
  const mix3 = (a, b, p) => [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)];

  // ─── Camera: crane up with the lights, then bow after the ember ─────────────
  function camShot(T) {
    const rise = E.inOutSine(seg(T, CHIME, 16.5));            // follows the lights up
    const drift = E.inSine(seg(T, 16.0, END)) * 0.85 + 0.15 * seg(T, 16.0, END); // never settles dead
    const sink = E.inOutSine(seg(T, SINK[0], SINK[1]));       // the bow
    return {
      pos: [0, lerp(WIDE.pos[1], 2.2, rise) - 0.17 * sink, lerp(WIDE.pos[2], 7.75, rise) - 0.2 * drift],
      look: [0, lerp(WIDE.look[1], 0.98, rise) - 0.16 * sink, 0],
      fov: WIDE.fov,
    };
  }

  // ─── The plan: four arcs from the glows to one point ────────────────────────
  /** World point at u ∈ [0, 1] along plan arc i (u = 0 at glow i, 1 at MEET): up out of the cup, then curling in. */
  function planPoint(i, u) {
    const r0 = Math.abs(XS[i]), th0 = XS[i] < 0 ? Math.PI : 0;
    const r = r0 * (1 - Math.pow(u, 1.5));
    const th = th0 + PLAN_TWIST * u * u;
    const y = lerp(MOUTH_Y, MEET[1], 0.65 * (1 - (1 - u) * (1 - u)) + 0.35 * u);
    return [MEET[0] + r * Math.cos(th), y, MEET[2] * u + r * Math.sin(th) * 0.7];
  }

  // ─── The flight: out of the cups, onto one ring, the ring spins and closes ──
  /** Start of light i's lift: the outer pair on the beat, the inner pair a 64th later. */
  const liftAt = (i) => LIFT + (i === 0 || i === 3 ? 0 : LIFT_LAG);
  /**
   * World point of light i at flight time f ∈ [0, 1] (its lift → MERGE), in cylindrical
   * coordinates round the axis through MEET. Each light rises straight out of its cup, then
   * the four gather onto one ring, evenly spaced (the outer pair swing round to the back and
   * the front), and the ring turns faster and faster as it rises and closes to a point.
   */
  function flightPoint(i, f) {
    const outer = Math.abs(XS[i]) > 1;
    const r0 = Math.abs(XS[i]), th0 = XS[i] < 0 ? Math.PI : 0;
    const gather = E.inOutSine(seg(f, 0.08, 0.58));
    const close = E.inQuad(seg(f, 0.3, 1));
    const r = lerp(r0, RING_R, gather) * (1 - close);
    const th = th0 + (outer ? Math.PI / 2 : 0) * E.inOutSine(seg(f, 0.05, 0.62)) + SWIRL * Math.pow(f, 2.2);
    const y = lerp(MOUTH_Y - DIP_DEPTH, MEET[1], 0.7 * E.outCubic(seg(f, 0, 0.5)) + 0.3 * E.inOutSine(seg(f, 0.3, 1)));
    return [MEET[0] + r * Math.cos(th), y, MEET[2] + r * Math.sin(th)];
  }
  const flightF = (i, T) => seg(T, liftAt(i), MERGE);
  /** World position of light i at T (the glow in its cup before the lift). */
  function lightWorld(i, T) {
    if (T < liftAt(i)) {
      const dip = DIP_DEPTH * E.inOutSine(seg(T, DIP, liftAt(i)));
      return [XS[i], MOUTH_Y - dip, 0];
    }
    return flightPoint(i, flightF(i, T));
  }
  /** World position of the single ember (after MERGE). */
  function emberWorld(T) {
    const hold = seg(T, MERGE, SINK[0]);
    const bob = 0.012 * Math.sin(TAU * (T - MERGE) / 1.25) * hold * (1 - seg(T, SINK[0], 17.2));
    return mix3([MEET[0], MEET[1] + bob, MEET[2]], EMBER_END, E.inOutSine(seg(T, SINK[0], SINK[1])));
  }

  // ─── 3D: the row and its lights ─────────────────────────────────────────────
  function poseWorld(T) {
    const sinkP = E.inQuad(seg(T, SINK[0], 17.46));
    for (const c of S.cups) {
      c.group.position.set(c.x, -SINK_DEPTH * sinkP, 0);
      c.group.rotation.set(0, 0, 0);
    }
    // The room's light falls away as the lights leave the cups; only they are left.
    const dim = E.inOutSine(seg(T, LIFT - 0.05, MERGE + 0.25));
    const out = E.inOutSine(seg(T, 16.95, 17.27));
    S.key.intensity = KEY_I * lerp(1, 0.28, dim) * (1 - out);
    S.rim.intensity = RIM_I * lerp(1, 0.4, dim) * (1 - out);
    S.scene.environmentIntensity = lerp(1, 0.32, dim) * (1 - out);
    // One point light per light: inside its cup while it glows, riding it on the way up.
    const chime = strike(T, CHIME, 0.05, 3.2);
    const merged = T >= MERGE;
    for (let i = 0; i < 4; i++) {
      const L = S.lights[i];
      if (merged) {
        const e = emberWorld(T);
        L.position.set(e[0], e[1], e[2]);
        L.intensity = 0.45 + 0.6 * strike(T, MERGE, 0.02, 5);
      } else {
        const p = lightWorld(i, T), lifted = T >= liftAt(i);
        L.position.set(p[0], p[1] - (lifted ? 0 : 0.05), p[2]);
        const glow = 0.06 * E.outCubic(seg(T, CHIME, CHIME + 0.3)) + 0.12 * chime + 0.04 * linkedAt(i, T);
        L.intensity = lifted ? lerp(glow, 0.45, E.outCubic(seg(T, liftAt(i), liftAt(i) + 0.3))) : glow;
      }
    }
  }

  // ─── 2D: hairlines ──────────────────────────────────────────────────────────
  /** 0..1: how far link k (light k → k+1) has drawn. */
  const linkDraw = (k, T) => E.outCubic(seg(T, LINKS[k], LINKS[k] + LINK_DUR));
  /** 0..1: light i has been reached by a link (brightens a touch when connected). */
  function linkedAt(i, T) {
    const a = i > 0 ? seg(T, LINKS[i - 1] + LINK_DUR * 0.7, LINKS[i - 1] + LINK_DUR) : 0;
    const b = i < 3 ? seg(T, LINKS[i], LINKS[i] + 0.05) : 0;
    return Math.max(a, b);
  }
  /** Stroke a projected polyline twice: a faint ember glow under a crisp copper hairline. */
  function hairline(ctx, pts, alpha, width = 1.2) {
    if (pts.length < 2 || alpha <= 0.002) return;
    ctx.beginPath(); R.polyPath(ctx, pts, false);
    ctx.strokeStyle = R.rgba(PAL.ember, 0.16 * alpha); ctx.lineWidth = width + 3.5; ctx.stroke();
    ctx.strokeStyle = R.rgba(PAL.copperHot, 0.9 * alpha); ctx.lineWidth = width; ctx.stroke();
  }
  /** The links: arches between neighbouring lights, drawn left to right; they stretch and let go on the lift. */
  function drawLinks(ctx, T, cam) {
    const release = E.inOutSine(seg(T, LIFT - 0.02, LIFT + 0.2));
    if (T < LINKS[0] || release >= 1) return;
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let k = 0; k < 3; k++) {
      const f = linkDraw(k, T);
      if (f <= 0) continue;
      const A = lightWorld(k, T), B = lightWorld(k + 1, T), pts = [];
      const n = 28;
      for (let j = 0; j <= n; j++) {
        const v = (j / n) * f;
        const w = mix3(A, B, v);
        w[1] += ARCH * Math.sin(Math.PI * v) * (1 - 0.6 * release);
        pts.push(proj(cam, w));
      }
      hairline(ctx, pts, 1 - release);
      if (f < 1) { const tip = pts[pts.length - 1]; RB.fx.ember(ctx, tip[0], tip[1], 2.6, { intensity: 0.9 }); }
    }
    ctx.restore();
  }
  /** The plan: arcs climb from each glow to the meeting point; on the lift they are drawn up into it. */
  function drawPlan(ctx, T, cam) {
    const draw = E.inOutCubic(seg(T, PATHS[0], PATHS[1]));
    if (draw <= 0 || T >= MERGE) return;
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 0; i < 4; i++) {
      const u0 = E.inOutCubic(seg(T, liftAt(i), liftAt(i) + 0.32));
      const u1 = draw;
      if (u1 - u0 < 0.004) continue;
      const pts = [], n = 44;
      for (let j = 0; j <= n; j++) pts.push(proj(cam, planPoint(i, lerp(u0, u1, j / n))));
      hairline(ctx, pts, 0.55 * (1 - u0 * u0), 0.9);
      if (draw < 1) { const tip = pts[pts.length - 1]; RB.fx.ember(ctx, tip[0], tip[1], 2.2, { intensity: 0.8 }); }
    }
    ctx.restore();
    // The meeting point waits for them: a pin of light once the paths arrive.
    const pin = seg(T, PATHS[1] - 0.06, PATHS[1] + 0.05) * (1 - seg(T, MERGE - 0.12, MERGE));
    if (pin > 0) { const m = proj(cam, MEET); RB.fx.ember(ctx, m[0], m[1], 2.4, { intensity: 0.7 * pin }); }
  }

  // ─── 2D: the lights ─────────────────────────────────────────────────────────
  /** A comet tail behind a travelling light: its own recent path, fading back. */
  function drawTrail(ctx, i, T, cam) {
    const f = flightF(i, T);
    if (f <= 0.002) return;
    const f0 = Math.max(0, f - 0.3), n = 18;
    const pts = [];
    for (let j = 0; j <= n; j++) pts.push(proj(cam, flightPoint(i, lerp(f0, f, j / n))));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    const fade = 1 - seg(T, MERGE - 0.1, MERGE);
    for (let j = 1; j <= n; j++) {
      const a = (j / n) ** 2 * fade;
      ctx.strokeStyle = R.rgba(PAL.ember, 0.7 * a);
      ctx.lineWidth = 1 + 3 * (j / n);
      ctx.beginPath(); ctx.moveTo(pts[j - 1][0], pts[j - 1][1]); ctx.lineTo(pts[j][0], pts[j][1]); ctx.stroke();
    }
    ctx.restore();
  }
  /** Size and brightness of light i before the merge. */
  function lightLook(i, T, cam, w) {
    const dWide = Math.hypot(WIDE.pos[0] - XS[i], WIDE.pos[1] - MOUTH_Y, WIDE.pos[2]);
    const d = Math.hypot(cam.position.x - w[0], cam.position.y - w[1], cam.position.z - w[2]);
    const chime = strike(T, CHIME, 0.05, 3.2);
    const lifted = E.outCubic(seg(T, liftAt(i), liftAt(i) + 0.28));
    const dip = seg(T, DIP, liftAt(i)) * (1 - lifted);
    const r = GLOW.r * (dWide / d) * (1 + 0.45 * chime + 0.12 * linkedAt(i, T) - 0.12 * dip) * lerp(1, 2.1, lifted);
    const I = (GLOW.i + 0.45 * chime + 0.12 * linkedAt(i, T) - 0.08 * dip) * lerp(1, 1.9, lifted);
    return { r, I };
  }
  function drawLights(ctx, T, cam) {
    if (T >= MERGE) return;
    const toOne = seg(T, MERGE - 0.1, MERGE);                 // the four hand over to one ember
    for (let i = 0; i < 4; i++) drawTrail(ctx, i, T, cam);
    for (let i = 0; i < 4; i++) {
      const w = lightWorld(i, T), s = proj(cam, w), { r, I } = lightLook(i, T, cam, w);
      RB.fx.ember(ctx, s[0], s[1], r, { intensity: I * (1 - toOne) });
    }
    // … handing over to the ember at exactly the size and brightness drawEmber() starts from
    if (toOne > 0) { const m = proj(cam, MEET); RB.fx.ember(ctx, m[0], m[1], SPARK.r * lerp(0.6, 1.5 * EMBER_HOLD, toOne), { intensity: 1.4 * toOne }); }
  }
  /** Screen position of the ember: projected from the world, eased onto palmSpark exactly by 17.5. */
  function emberScreen(T, cam) {
    const s = proj(cam, emberWorld(T)), k = E.inOutSine(seg(T, SINK[0], END));
    return [lerp(s[0], SPARK.x, k), lerp(s[1], SPARK.y, k)];
  }
  function drawEmber(ctx, T, cam) {
    if (T < MERGE) return;
    const s = emberScreen(T, cam);
    const settle = 1 - seg(T, SINK[0], 17.3);                 // no flare or breath left at the hand-off
    const flare = Math.exp(-(T - MERGE) * 4.2) * settle;     // the four arrive at full brightness, then settle
    const breath = 0.035 * Math.sin(TAU * (T - MERGE) / 0.625) * seg(T, MERGE + 0.2, MERGE + 0.5) * settle;
    const r = SPARK.r * (1 + 0.5 * flare + breath) * lerp(EMBER_HOLD, 1, E.inOutSine(seg(T, SINK[0], 17.35)));
    const I = lerp(0.9, 1, seg(T, MERGE, SINK[0])) + 0.5 * flare;
    // The air around it takes the light (gone again before the hand-off: the contract is the ember alone).
    const air = (0.5 * seg(T, MERGE - 0.05, MERGE + 0.3) + 0.5 * flare) * (1 - E.inOutSine(seg(T, SINK[0], 17.3)));
    if (air > 0.001) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const g = ctx.createRadialGradient(s[0], s[1], 0, s[0], s[1], 340);
      g.addColorStop(0, R.rgba(PAL.copper, 0.16 * air)); g.addColorStop(0.4, R.rgba(PAL.umber, 0.12 * air)); g.addColorStop(1, R.rgba(PAL.umber, 0));
      ctx.fillStyle = g; ctx.fillRect(s[0] - 340, s[1] - 340, 680, 680);
      ctx.restore();
    }
    RB.fx.ember(ctx, s[0], s[1], r, { intensity: I });
  }

  // ─── 2D: dust lit by the ember ──────────────────────────────────────────────
  const MOTES = [];
  function buildMotes() {
    const r = R.rng(515);
    for (let i = 0; i < 64; i++) {
      MOTES.push({ p: [(r() - 0.5) * 2.4, MEET[1] - 0.7 + r() * 0.98, MEET[2] + (r() - 0.5) * 1.2], sp: 0.4 + r(), ph: r() * TAU, k: r() });
    }
  }
  function drawMotes(ctx, T, cam) {
    const on = seg(T, MERGE - 0.15, MERGE + 0.35) * (1 - E.inOutSine(seg(T, SINK[0], 17.3)));
    if (on <= 0.001) return;
    const e = emberWorld(T);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    MOTES.forEach((m, i) => {
      const t = T - 15;
      const w = [
        m.p[0] + 0.08 * R.noise.n2(i * 1.9, t * 0.3 * m.sp),
        m.p[1] + 0.05 * t * (m.sp - 0.9) + 0.05 * R.noise.n2(i * 3.7 + 5, t * 0.25),
        m.p[2] + 0.08 * R.noise.n2(i * 2.3 + 11, t * 0.3),
      ];
      const d = Math.hypot(w[0] - e[0], w[1] - e[1], w[2] - e[2]);
      const lit = 1 / (1 + (d / 0.5) ** 2);
      const tw = 0.55 + 0.45 * Math.sin(T * (1.1 + m.k * 1.7) + m.ph);
      const a = on * lit * tw;
      if (a < 0.01) return;
      const s = proj(cam, w), rad = 0.0065 * pxPerUnit(cam, w) * (0.6 + m.k * 0.8);
      R.fillCircle(ctx, s[0], s[1], rad, R.rgba(m.k > 0.7 ? PAL.ember : '#fff1dc', clamp(a)));
    });
    ctx.restore();
  }

  // ─── Backdrop: the warm pool follows the light ──────────────────────────────
  function backdropAt(T) {
    const gather = E.inOutSine(seg(T, 15.3, 16.5));
    const out = E.inOutSine(seg(T, SINK[0], END));
    return {
      gx: lerp(BACK_IN.gx, BACK_OUT.gx, gather),
      gy: lerp(lerp(BACK_IN.gy, 470, gather), BACK_OUT.gy, out),
      gr: BACK_IN.gr,
      lift: lerp(lerp(BACK_IN.lift, 0.84, E.inOutSine(seg(T, LIFT, MERGE + 0.3))), BACK_OUT.lift, out),
    };
  }

  // ─── Scene ──────────────────────────────────────────────────────────────────
  R.scene({
    id: 'system', index: 5, label: 'One system', start: 15, end: 17.5,

    init() {
      S = RB.stage();
      S.cups = XS.map((x) => {
        const c = RB.cup();
        c.x = x;
        c.group.position.set(x, 0, 0);
        S.scene.add(c.group);
        return c;
      });
      S.lights = XS.map(() => {
        const L = new THREE.PointLight('#ffb27f', 0, 0, 2);
        S.scene.add(L);
        return L;
      });
      buildMotes();
      RB.gl.renderer().compile(S.scene, S.camera); // no first-use shader stall mid-scene
    },

    draw(ctx, t, env) {
      const T = env.T;
      RB.setCam(S.camera, camShot(T));
      S.camera.clearViewOffset(); // projections below must not carry the previous draw's AA jitter
      const cam = S.camera;

      RB.atmos.backdrop(ctx, backdropAt(T));

      poseWorld(T);
      const alpha3D = 1 - E.inOutSine(seg(T, 17.18, 17.43)); // the row is already dark and low: the last of it dissolves into the dark
      if (alpha3D > 0.001) {
        RB.draw3D(ctx, S.scene, cam, { exposure: 1, alpha: alpha3D });
        cam.clearViewOffset();
      }

      drawMotes(ctx, T, cam);
      drawLinks(ctx, T, cam);
      drawPlan(ctx, T, cam);
      drawLights(ctx, T, cam);
      drawEmber(ctx, T, cam);

      RB.type.line(ctx, T, { ...LINE, align: 'center', accent: { word: 'Intelligence.', color: PAL.ember } });
    },

    rail: (t, env) => ({ alpha: 1, active: 2, progress: (env.T - 7.5) / 10 }),
  });
})();
