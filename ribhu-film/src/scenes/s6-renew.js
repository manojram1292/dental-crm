/*
 * S6 · 03 RENEW · 17.5–22.5 s (frames 525–674) · rail: 03 RENEW
 *
 * The emotional heart of the film: the machine hands the flame to a person.
 *
 *   17.500  IN. S5's ember alone at palmSpark (960, 500), at rest, on the dark backdrop. The
 *           robotic hand is already there, below it in the dark. The ember's own pool of light
 *           brightens and widens (17.58–18.75) while the workshop key comes up, so the whole
 *           hand emerges from the dark as it rises, palm up, straight along its palm normal
 *           (nothing crosses the ember), decelerating under it (servo cue). The camera starts
 *           its one continuous move: a slow glide from the machine toward the person.
 *   17.700  Kicker "03 · RENEW" (upper-left column).
 *   18.000  "Renew the people,\nnot just the tools." rises in under it.
 *   18.280  Contact: the ember settles into the palm (by 18.46, with the piano's D5) and lights
 *           the pads and the insides of the fingers (RB.hand setGlow, palm side only).
 *   18.400  From the left, a human hand draws itself in one continuous ivory line (the pencil
 *           cue, 18.4–19.4): the forearm's underside reaching in, the heel, four fingers traced
 *           tip by tip, the thumb, back along the arm. A hot nib leads; fresh ink cools to ivory.
 *   19.160  The robotic hand tips its palm toward its fingertips, which come to rest on the
 *           drawn fingertips: a bridge between the two hands.
 *   19.300  The ember rolls down the metal fingers (glass roll 19.5–19.86), crosses the touching
 *           fingertips at 19.72 without a seam (the drawing is placed in init() so its middle
 *           finger pad sits exactly where the ember leaves the metal, and the roll keeps its
 *           speed), and runs down the drawn fingers; the line catches its light as it comes.
 *   20.000  Beat: THE HAND-OFF. The ember comes to rest in the drawn palm with a small settle
 *           (bell + bloom, and a breath of post bloom); the drawing fills with warm light from
 *           the palm outward and its line warms from ivory to ember.
 *   20.300  The robotic hand un-tips, folds its fingers a little and withdraws slowly, back
 *           along its forearm, out of the ember's light (a hand-off, not a takeover). Gone ≈ 21.6.
 *   21.250  Beat: the ember gathers itself and lifts straight up out of the palm (riser), then
 *           drifts to centre; the camera tilts up after it; the drawing settles to a faint glow
 *           and is gone by 22.4. The kicker and the line leave from 21.72 / 21.8.
 *   22.500  OUT. Only the ember at riseSpark (960, 430), r = 12, intensity 1, rising at 120 px/s
 *           and decelerating at S7's rate (a quintic lands position, velocity and acceleration),
 *           on RB.atmos.backdrop({ gx: 960, gy: 540, gr: 900, lift: 0.7 }). No hands, no text,
 *           rail faded out (22.0–22.5), post back to the defaults.
 *
 * One draw3D per frame (the robot hand, ~56k triangles), into a buffer masked by the ember's
 * pool of light, and skipped entirely once the hand is out of it. The drawn hand is 2D but lives
 * on a plane in the 3D world, so the camera moves it with the same perspective as the robot.
 * Geometry, materials and the sketch are built once in init(); every animated property (pose,
 * placement, glow, lights, camera) is set from time in every draw.
 */
(function () {
  'use strict';
  const R = window.REEL, RB = window.RB, THREE = window.THREE;
  const { PAL, E, clamp, lerp, seg } = R;
  const TAU = Math.PI * 2;

  // ─── Timing (absolute seconds; one beat = 0.625 s) ───────────────────────────
  const T0 = 17.5, T1 = 22.5;
  const RISE = [17.5, 18.34];          // the hand rises under the ember
  const REVEAL = [17.5, 18.75];        // the ember's pool of light spreads over it
  const SETTLE = [18.28, 18.46];       // the ember settles into the palm
  const SKETCH = [18.4, 19.4];         // the drawn hand (pencil cue)
  const TIP = [19.16, 19.66];          // the robot tips its palm toward its fingertips
  const ROLL_A = [19.3, 19.72];        // the ember rolls down the metal fingers …
  const ROLL_B = [19.72, 20.0];        // … across the touching fingertips, down the drawn fingers
  const HANDOFF = 20.0;                // beat: it comes to rest in the drawn palm
  const FILL = [20.0, 20.95];          // the drawing fills with light, palm outward
  const UNTIP = [20.08, 20.8];
  const WITHDRAW = [20.3, 22.0];       // the robot backs away along its forearm …
  const EXIT = [20.65, 21.55];         // … and goes back into the dark
  const LIFT = [21.25, 22.5];          // beat: the ember lifts and rises
  const KICKER = { index: '03', label: 'RENEW', x: 150, y: 256, tIn: 17.7, tOut: 21.72 };
  const LINE = { text: 'Renew the people,\nnot just the tools.', x: 150, y: 342, size: 60, tIn: 18.0, tOut: 21.8, stagger: 0.045, dur: 0.7 };

  // ─── Contracts ──────────────────────────────────────────────────────────────
  const SPARK_IN = RB.shots.palmSpark;       // (960, 500) r 13
  const SPARK_OUT = RB.shots.riseSpark;      // (960, 430) r 12
  const RISE_V = 120;                        // px/s upward at the cut …
  const RISE_A = (RISE_V * RISE_V) / (SPARK_OUT.y - 386); // … decelerating as S7 does (≈ 164 px/s²)
  const BACK = { gx: 960, gy: 540, gr: 900, lift: 0.7 };
  const LIFT_KICK = 1400;                    // px/s²: the ember leaves the palm on the beat, not after it

  // ─── World layout ───────────────────────────────────────────────────────────
  // One continuous camera move: a slow glide from the machine to the person that never settles;
  // when the ember rolls across, the camera follows it (lagging, like an operator), so the person
  // arrives near the centre of frame and the ember rises almost straight up out of their palm;
  // at the end a tilt up after it.
  const CAM_A = { pos: [0.62, 1.52, 6.0], look: [0.34, 0.38, 0] };   // 17.5
  const GLIDE = [-0.5, -0.02, 0.3];        // the slow glide over the whole shot (pos; look moves in x, y)
  const FOLLOW = [19.25, 21.75, -0.9];    // the follow: window, and how far it trucks (world x)
  const FOV = 28, TILT_UP = 0.2;
  const PALM_DIR = [-0.05, 1, 0.3];        // robot palm normal: up, a little toward the lens
  const ARM_DIR = [0.96, -0.26, 0.1];      // robot forearm: out to the right, a little down
  const RISE_DEPTH = 0.52;                 // the hand rises this far, straight along its palm normal (nothing crosses the ember)
  const BACK_OFF = [1.05, -0.28, 0.03];   // how far it withdraws, back along its forearm (the camera's follow adds to it on screen)
  const EMBER_LIFT = 0.017;                // ember centre above the palm point (kit tip)

  // ─── Drawn hand (design units = px at the 20.0 framing) ──────────────────────
  const SKETCH_SCALE = 0.86;
  const SKETCH_TILT = -10;                 // degrees: fingers reaching up and to the right
  const PALM_IN_SKETCH = [24, 4];          // where the ember comes to rest (the hollow of the palm), in contour units

  let S = null;

  // ─── Small helpers ──────────────────────────────────────────────────────────
  const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  const _v = new THREE.Vector3();
  function proj(cam, p) {
    _v.copy(p).project(cam);
    return [(_v.x * 0.5 + 0.5) * R.W, (-_v.y * 0.5 + 0.5) * R.H];
  }
  function pxPerUnit(cam, p) {
    return (R.H / 2) / Math.tan((cam.fov * Math.PI) / 360) / cam.position.distanceTo(p);
  }
  /** The world point on the plane z = zp under screen point (sx, sy). */
  function unprojectZ(cam, sx, sy, zp = 0) {
    const a = new THREE.Vector3((sx / R.W) * 2 - 1, 1 - (sy / R.H) * 2, 0.5).unproject(cam);
    const d = a.sub(cam.position).normalize();
    return cam.position.clone().addScaledVector(d, (zp - cam.position.z) / d.z);
  }
  /** Quintic Hermite on [0,1]: position, velocity, acceleration at both ends (per unit u). */
  function hermite5(u, p0, v0, a0, p1, v1, a1) {
    const u2 = u * u, u3 = u2 * u, u4 = u3 * u, u5 = u4 * u;
    const h0 = 1 - 10 * u3 + 15 * u4 - 6 * u5, h1 = u - 6 * u3 + 8 * u4 - 3 * u5, h2 = 0.5 * u2 - 1.5 * u3 + 1.5 * u4 - 0.5 * u5;
    const h3 = 0.5 * u3 - u4 + 0.5 * u5, h4 = -4 * u3 + 7 * u4 - 3 * u5, h5 = 10 * u3 - 15 * u4 + 6 * u5;
    return h0 * p0 + h1 * v0 + h2 * a0 + h3 * a1 + h4 * v1 + h5 * p1;
  }
  /** Cubic Hermite on [0,1] from 0 to 1 with end slopes m0, m1. */
  const hermite3 = (u, m0, m1) => (u * u * u - 2 * u * u + u) * m0 + (-2 * u * u * u + 3 * u * u) + (u * u * u - u * u) * m1;

  // ─── Camera ─────────────────────────────────────────────────────────────────
  function camAt(T) {
    const g = E.inOutSine(seg(T, T0, 23.0));        // never settles inside the shot
    const f = E.inOutSine(seg(T, FOLLOW[0], FOLLOW[1]));
    const tilt = E.inOutSine(seg(T, 20.9, 23.1));
    const dx = GLIDE[0] * g + FOLLOW[2] * f, dy = GLIDE[1] * g;
    const pos = [CAM_A.pos[0] + dx, CAM_A.pos[1] + dy + 0.1 * tilt, CAM_A.pos[2] + GLIDE[2] * g];
    const look = [CAM_A.look[0] + dx, CAM_A.look[1] + dy + TILT_UP * tilt, CAM_A.look[2]];
    return { pos, look, fov: FOV };
  }
  function poseCamera(T) {
    RB.setCam(S.camera, camAt(T));
    S.camera.clearViewOffset();
    return S.camera;
  }

  // ─── The robotic hand ───────────────────────────────────────────────────────
  /** The pose (before placement) at T: cradle → tip toward the fingers → rest, with servo life. */
  function robotPose(T) {
    const P = S.poses;
    let pose = RB.hand.blend(P.open, P.palmUp, E.inOutSine(seg(T, 17.55, 18.3)));
    const tip = E.inOutSine(seg(T, TIP[0], TIP[1])) * (1 - E.inOutSine(seg(T, UNTIP[0], UNTIP[1])));
    pose = RB.hand.blend(pose, P.offer, 0.68 * tip);
    // at rest again, the fingers fold in a little (the wrist stays where palmUp put it)
    const fold = E.inOutSine(seg(T, UNTIP[0] + 0.1, WITHDRAW[1]));
    pose.curl = pose.curl.map((c, i) => lerp(c, P.relaxed.curl[i], 0.7 * fold));
    // servo life: the wrist is never quite still (quieter while it carries the ember)
    const life = 1 - 0.7 * seg(T, 19.0, 19.2) + 0.7 * seg(T, 20.1, 20.5);
    pose.wrist[0] += 0.02 * Math.sin((TAU * (T - T0)) / 2.3) * life;
    pose.wrist[1] += 0.012 * Math.sin((TAU * (T - T0)) / 3.1 + 1.1) * life;
    return pose;
  }
  /** Palm target (world) at T: rises in, rests, withdraws. */
  function robotPalmAt(T) {
    const rise = 1 - E.inOutSine(seg(T, RISE[0], RISE[1]));
    const settle = 0.006 * E.inOutSine(seg(T, SETTLE[0], SETTLE[1]));
    const out = E.inOutSine(seg(T, WITHDRAW[0], WITHDRAW[1]));
    const p = S.palmRest.clone().addScaledVector(S.palmN, -RISE_DEPTH * rise).addScaledVector(V(BACK_OFF), out);
    p.y -= settle;
    return p;
  }
  /** Pose and place the robot for time T. Returns its palm point, palm normal and fingertip lip. */
  function poseRobot(T) {
    const h = S.hand;
    h.setPose(S.poses.palmUp).place({ palm: PALM_DIR, forearm: ARM_DIR, palmAt: robotPalmAt(T).toArray() });
    h.setPose(robotPose(T));
    const pp = h.palmPoint(new THREE.Vector3()), pn = h.palmNormal(new THREE.Vector3());
    const tips = h.fingertips();
    const lip = tips[2].clone().lerp(tips[3], 0.35).addScaledVector(pn, 0.024);
    return { pp, pn, lip };
  }
  /** Lights on the robot: it rises into the light, and goes back into the dark. */
  function lightRobot(T) {
    const up = E.inOutSine(seg(T, 17.55, 18.6)), down = E.inOutSine(seg(T, 20.4, EXIT[1]));
    const k = up * (1 - 0.8 * down);
    S.key.intensity = 2.0 * k;
    S.rim.intensity = 1.7 * k;
    S.scene.environmentIntensity = 0.55 * k;
  }

  // ─── The ember ──────────────────────────────────────────────────────────────
  /** Roll down the metal: from rest, leaving the fingertips at its mean speed. */
  const rollA = (u) => 0.5 * u * u * (3 - 2 * u) + 0.5 * u * u;
  /** Design-space point on the drawn hand → world (the sketch plane). */
  function sketchWorld(x, y, out = new THREE.Vector3()) {
    const o = S.palmH, ex = S.sketchX, ey = S.sketchY, k = S.sketchUnit;
    return out.set(o.x + (ex.x * x + ey.x * y) * k, o.y + (ex.y * x + ey.y * y) * k, o.z + (ex.z * x + ey.z * y) * k);
  }
  /** World position of the ember at T (before the lift), given the robot's pose at T. */
  function emberWorld(T, robot) {
    if (T < SETTLE[0]) return S.hover.clone();
    const rest = robot.pp.clone().addScaledVector(robot.pn, EMBER_LIFT);
    if (T < SETTLE[1]) return S.hover.clone().lerp(rest, E.inOutSine(seg(T, SETTLE[0], SETTLE[1])));
    if (T < ROLL_A[0]) return rest;
    if (T < ROLL_B[0]) return rest.lerp(robot.lip, rollA(seg(T, ROLL_A[0], ROLL_A[1])));
    // across the touching fingertips and down the drawn fingers into the palm
    const C = S.contact;
    if (T < HANDOFF) {
      const s = hermite3(seg(T, ROLL_B[0], ROLL_B[1]), S.rollB.m0, 0.15);
      return sketchWorld(C[0] * (1 - s), C[1] * (1 - s));
    }
    // at rest in the palm: a small damped settle as it lands
    const d = T - HANDOFF;
    return sketchWorld(0, 4.5 * Math.exp(-d * 9) * Math.sin(d * 24));
  }
  /**
   * The ember on screen at T: { x, y, r, I, world } (world is null once it rises in screen space).
   */
  function emberAt(T, cam, robot) {
    let w = T < LIFT[0] ? emberWorld(T, robot) : null;
    let x, y;
    if (w) [x, y] = proj(cam, w);
    else {
      // the lift: a screen-space quintic from the palm (matching its drift) to riseSpark,
      // arriving with S7's velocity and deceleration
      const Dt = LIFT[1] - LIFT[0], u = seg(T, LIFT[0], LIFT[1]), a = S.liftFrom;
      const ux = seg(u, 0.22, 1), sx = ux * ux * ux * (ux * (ux * 6 - 15) + 10);   // up first, then across
      x = a.x + a.vx * Dt * u * (1 - u) * (1 - u) + (SPARK_OUT.x - a.x) * sx;
      y = hermite5(u, a.y, a.vy * Dt, -LIFT_KICK * Dt * Dt, SPARK_OUT.y, -RISE_V * Dt, RISE_A * Dt * Dt);
      w = null;
    }
    // size and brightness: a breath in each palm, a flare on landing, exact at both cuts
    const land = T >= HANDOFF ? Math.exp(-(T - HANDOFF) * 5.5) : 0;
    const breathe = 0.5 - 0.5 * Math.cos(TAU * seg(T, 18.5, 19.3)) + (0.5 - 0.5 * Math.cos(TAU * seg(T, 20.35, 21.2)));
    let r = lerp(SPARK_IN.r, 12.4, E.inOutSine(seg(T, 17.8, 18.5)));
    r = lerp(r, 11.4, E.inOutSine(seg(T, ROLL_A[0], ROLL_B[0])) * (1 - seg(T, HANDOFF - 0.04, HANDOFF + 0.08)));
    r += 0.7 * breathe + 4 * land;
    r = lerp(r, SPARK_OUT.r, E.inOutSine(seg(T, LIFT[0] + 0.3, T1)));
    const gather = Math.sin(Math.PI * seg(T, LIFT[0] - 0.12, LIFT[0] + 0.3));      // it gathers itself to leave
    r += 1.6 * gather;
    const I = lerp(1 + 0.12 * breathe + 0.7 * land + 0.35 * gather, 1, E.inOutSine(seg(T, LIFT[0] + 0.3, T1)));
    return { x, y, r, I, world: w };
  }

  // ─── The drawn hand: one continuous line ────────────────────────────────────
  /**
   * A left hand, palm up, open and reaching to the right, as a maker would sketch it: the thumb
   * swung out on the far side (top), the four fingers a little apart and curling gently up at the
   * tips, the pinky nearest. One continuous line: the forearm's underside (from the far left) →
   * the heel of the hand → out and back along each finger, pinky first, over the rounded tips and
   * into softly rounded crotches → the index back to its knuckle → the palm's edge into the web →
   * out along the thumb and back → the thenar → the forearm's upper edge (off to the left).
   * Returns points in design units (y down, palm hollow near 0,0) and the middle finger's pad,
   * where the ember crosses over.
   */
  function sketchContour() {
    const D = Math.PI / 180;
    function digit({ base, a0, segs, bends, r0, r1 }) {
      const c = []; let x = base[0], y = base[1], a = a0 * D;
      const total = segs.reduce((s, v) => s + v, 0); let run = 0;
      c.push([x, y, a, r0]);
      segs.forEach((L, i) => {
        const n = 10, a1 = a + bends[i] * D;
        for (let k = 1; k <= n; k++) {
          const aa = lerp(a, a1, Math.min(1, k / 4));
          x += Math.cos(aa) * L / n; y += Math.sin(aa) * L / n; run += L / n;
          c.push([x, y, aa, lerp(r0, r1, run / total) * (1 + 0.035 * Math.sin(Math.PI * k / n))]);
        }
        a = a1;
      });
      const lower = c.map(([px, py, pa, r]) => [px - Math.sin(pa) * r, py + Math.cos(pa) * r]);
      const upper = c.map(([px, py, pa, r]) => [px + Math.sin(pa) * r, py - Math.cos(pa) * r]);
      const [tx, ty, ta, tr] = c[c.length - 1];
      const tip = [];
      for (let i = 1; i < 14; i++) {
        const th = (i / 14) * Math.PI, along = Math.sin(th) * tr * 1.1, across = Math.cos(th) * tr;
        tip.push([tx + Math.cos(ta) * along - Math.sin(ta) * across, ty + Math.sin(ta) * along + Math.cos(ta) * across]);
      }
      return { lower, upper, tip, centre: c };
    }
    function segX(p, q, r, s) {
      const d = (q[0] - p[0]) * (s[1] - r[1]) - (q[1] - p[1]) * (s[0] - r[0]);
      if (Math.abs(d) < 1e-9) return null;
      const t = ((r[0] - p[0]) * (s[1] - r[1]) - (r[1] - p[1]) * (s[0] - r[0])) / d;
      const u = ((r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])) / d;
      return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])] : null;
    }
    /** Where edge A (base→tip) meets edge B (base→tip), furthest out from the base. */
    function meet(A, B) {
      for (let i = A.length - 2; i >= 0; i--) for (let j = B.length - 2; j >= 0; j--) {
        const p = segX(A[i], A[i + 1], B[j], B[j + 1]);
        if (p) return { i, j, p };
      }
      return null;
    }
    /** A point `d` along polyline P from its start (P[0]), and the index after it. */
    function along(P, d) {
      for (let i = 1; i < P.length; i++) {
        const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
        if (d <= l) { const f = d / l; return { p: [lerp(P[i - 1][0], P[i][0], f), lerp(P[i - 1][1], P[i][1], f)], i }; }
        d -= l;
      }
      return { p: P[P.length - 1], i: P.length };
    }
    const path = [];
    const push = (arr) => arr.forEach((p) => path.push(p));
    /**
     * Run into the corner where `into` (drawn up to its end) meets `out` (drawn from its start)
     * and round it with radius-ish r: a quadratic through the corner point. Returns the index in
     * `out` to continue from, and the rounded join's points.
     */
    function corner(into, out, r) {
      const hit = meet(into.slice().reverse(), out) || { i: 0, j: 0, p: into[into.length - 1] };
      // `into` reversed: hit.i counts back from its end
      const back = into.slice(0, into.length - 1 - hit.i).concat([hit.p]).reverse();
      const fwd = [hit.p].concat(out.slice(hit.j + 1));
      const a = along(back, r), b = along(fwd, r);
      const keep = into.slice(0, into.length - hit.i - a.i);
      const join = [];
      for (let k = 0; k <= 8; k++) {
        const u = k / 8, w0 = (1 - u) * (1 - u), w1 = 2 * u * (1 - u), w2 = u * u;
        join.push([w0 * a.p[0] + w1 * hit.p[0] + w2 * b.p[0], w0 * a.p[1] + w1 * hit.p[1] + w2 * b.p[1]]);
      }
      return { keep, join, rest: out.slice(hit.j + b.i) };
    }
    const F = [
      { base: [90, 36], a0: 11, segs: [54, 35, 30], bends: [-4, -8, -8], r0: 14.5, r1: 11.5 },    // pinky (near)
      { base: [100, 10], a0: 3, segs: [70, 46, 37], bends: [-3, -8, -7], r0: 16, r1: 12.5 },      // ring
      { base: [102, -18], a0: -4, segs: [76, 50, 40], bends: [-3, -8, -7], r0: 16.5, r1: 13 },    // middle
      { base: [96, -46], a0: -11, segs: [68, 44, 36], bends: [-3, -8, -7], r0: 16, r1: 12.5 },    // index (far)
    ].map(digit);
    const thumb = digit({ base: [-78, -38], a0: -52, segs: [62, 44, 36], bends: [8, 12, 10], r0: 25, r1: 12 });
    // forearm's underside (from the far left), the wrist, the heel of the hand, into the pinky
    let cur = [[-420, 116], [-340, 96], [-270, 79], [-210, 67], [-160, 61], [-110, 65], [-60, 68], [-10, 67], [36, 62], [70, 54]].concat(F[0].lower.slice(2));
    // each finger out and back, over the tips, the crotches rounded
    for (let k = 0; k < 4; k++) {
      cur = cur.concat(F[k].tip);
      const next = k < 3 ? F[k + 1].lower : null;
      if (!next) break;
      const c = corner(cur.concat(F[k].upper.slice().reverse()), next, 4);
      push(c.keep); push(c.join); cur = c.rest;
    }
    // the index back to its knuckle, the palm's edge to the web, the thumb out and back
    const web = cur.concat(F[3].upper.slice().reverse(), [[74, -64], [44, -70], [14, -75], [-16, -80], [-46, -86]]);
    const cw = corner(web, thumb.lower, 12);
    push(cw.keep); push(cw.join); push(cw.rest);
    push(thumb.tip);
    push(thumb.upper.slice(2).reverse());
    // the thenar, the wrist, the forearm's upper edge (off to the left)
    push([[-114, -48], [-150, -42], [-200, -37], [-265, -27], [-335, -11], [-420, 10]]);
    const mc = F[2].centre[Math.round(F[2].centre.length * 0.84)];
    return { path, sharp: new Set(), contact: [mc[0], mc[1]] };
  }
  /** Centripetal Catmull-Rom through pts (corners in `sharp` kept), n samples per span. */
  function smoothPath(pts, sharp, n = 6) {
    const out = [];
    const d = (a, b) => Math.max(1e-4, Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1])));
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i], p2 = pts[i + 1];
      const p0 = i > 0 && !sharp.has(i) ? pts[i - 1] : [2 * p1[0] - p2[0], 2 * p1[1] - p2[1]];
      const p3 = i + 2 < pts.length && !sharp.has(i + 1) ? pts[i + 2] : [2 * p2[0] - p1[0], 2 * p2[1] - p1[1]];
      const t0 = 0, t1 = d(p0, p1), t2 = t1 + d(p1, p2), t3 = t2 + d(p2, p3);
      for (let k = 0; k < n; k++) {
        const t = t1 + ((t2 - t1) * k) / n;
        const L = (A, B, ta, tb) => [((tb - t) * A[0] + (t - ta) * B[0]) / (tb - ta), ((tb - t) * A[1] + (t - ta) * B[1]) / (tb - ta)];
        const A1 = L(p0, p1, t0, t1), A2 = L(p1, p2, t1, t2), A3 = L(p2, p3, t2, t3);
        out.push(L(L(A1, A2, t0, t2), L(A2, A3, t1, t3), t1, t2));
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  /**
   * Build the sketch once: resample the smoothed contour evenly, pose it (tilt, scale, palm at
   * the origin), and precompute each point's pen "effort" (arc length plus a toll for turning,
   * so the pen slows round the fingertips and flies along the arm), its pressure, the contact
   * pad where the ember crosses over, and the fill region.
   */
  function buildSketch() {
    const { path, sharp, contact } = sketchContour();
    const sm = R.resample(smoothPath(path, sharp), 900, false);
    const t = SKETCH_TILT * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
    const pose = ([x, y]) => {
      const X = (x - PALM_IN_SKETCH[0]) * SKETCH_SCALE, Y = (y - PALM_IN_SKETCH[1]) * SKETCH_SCALE;
      return [X * c - Y * s, X * s + Y * c];
    };
    const pts = sm.map(pose);
    const n = pts.length, effort = new Float32Array(n), press = new Float32Array(n);
    let acc = 0;
    for (let i = 0; i < n; i++) {
      if (i > 0) {
        const a = pts[i - 1], b = pts[i], seglen = Math.hypot(b[0] - a[0], b[1] - a[1]);
        let turn = 0;
        if (i < n - 1) {
          const q = pts[i + 1];
          const a1 = Math.atan2(b[1] - a[1], b[0] - a[0]), a2 = Math.atan2(q[1] - b[1], q[0] - b[0]);
          turn = Math.abs(((a2 - a1 + 3 * Math.PI) % TAU) - Math.PI);
        }
        acc += seglen + 26 * turn;
      }
      effort[i] = acc;
      const u = i / (n - 1);
      // pen pressure: lands light, presses through the hand, lifts off along the arm
      press[i] = clamp(u / 0.07) ** 0.7 * clamp((1 - u) / 0.16) ** 0.8 * (0.86 + 0.14 * R.noise.n2(u * 9, 3.1));
    }
    for (let i = 0; i < n; i++) effort[i] /= acc;
    // the fill region: the contour with both arm lines carried on well past where the line
    // fades, so the light never meets a closing edge
    const ext = (i, j) => { const a = pts[i], b = pts[j], l = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1; return [a[0] + ((a[0] - b[0]) / l) * 600, a[1] + ((a[1] - b[1]) / l) * 600]; };
    const fillPts = [ext(0, 12)].concat(pts, [ext(n - 1, n - 13)]);
    return { pts, effort, press, n, contact: pose(contact), fillPts };
  }
  /** Index (fractional) the pen has reached at draw progress p ∈ [0,1]. */
  function penIndex(sk, p) {
    const e = sk.effort;
    if (p <= 0) return 0;
    if (p >= 1) return sk.n - 1;
    let lo = 0, hi = sk.n - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (e[m] < p) lo = m; else hi = m; }
    return lo + (p - e[lo]) / Math.max(1e-6, e[hi] - e[lo]);
  }
  /** Screen points of the sketch for this camera (the sketch plane is anchored in the world). */
  function projectSketch(cam) {
    const sk = S.sketch, out = S.sketchScr, fill = S.sketchFill;
    for (let i = 0; i < sk.n; i++) {
      sketchWorld(sk.pts[i][0], sk.pts[i][1], _v).project(cam);
      out[i][0] = (_v.x * 0.5 + 0.5) * R.W; out[i][1] = (-_v.y * 0.5 + 0.5) * R.H;
    }
    for (let i = 0; i < sk.fillPts.length; i++) {
      sketchWorld(sk.fillPts[i][0], sk.fillPts[i][1], _v).project(cam);
      fill[i][0] = (_v.x * 0.5 + 0.5) * R.W; fill[i][1] = (-_v.y * 0.5 + 0.5) * R.H;
    }
    return out;
  }
  /** Fill a variable-width ribbon along scr[0..end] (end fractional). */
  function ribbon(ctx, scr, press, end, width, from = 0) {
    const last = Math.floor(end), f = end - last;
    const P = [], W = [];
    for (let i = from; i <= last; i++) { P.push(scr[i]); W.push(press[i] * width); }
    if (f > 0 && last + 1 < scr.length) {
      const a = scr[last], b = scr[last + 1];
      P.push([lerp(a[0], b[0], f), lerp(a[1], b[1], f)]); W.push(lerp(press[last], press[last + 1], f) * width);
    }
    if (P.length < 2) return;
    const L = [], Rr = [];
    for (let i = 0; i < P.length; i++) {
      const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const w = W[i] / 2;
      L.push([P[i][0] - dy * w, P[i][1] + dx * w]); Rr.push([P[i][0] + dy * w, P[i][1] - dx * w]);
    }
    ctx.beginPath();
    ctx.moveTo(L[0][0], L[0][1]);
    for (let i = 1; i < L.length; i++) ctx.lineTo(L[i][0], L[i][1]);
    for (let i = Rr.length - 1; i >= 0; i--) ctx.lineTo(Rr[i][0], Rr[i][1]);
    ctx.closePath();
    ctx.fill();
  }
  /** Draw the sketch at T: the line drawing itself, the light fill, and the fade to a glow. */
  function drawSketch(ctx, T, cam, ember) {
    if (T < SKETCH[0]) return;
    const sk = S.sketch, scr = projectSketch(cam);
    const su = seg(T, SKETCH[0], SKETCH[1]), drawP = 0.3 * su + 0.7 * E.inOutSine(su); // a decisive start, an unhurried finish
    const end = penIndex(sk, drawP);
    const fillP = E.outCubic(seg(T, FILL[0], FILL[1]));
    const fade = 1 - E.inOutSine(seg(T, 21.3, 22.35));          // to a faint glow …
    const gone = 1 - E.inOutSine(seg(T, 21.9, 22.4));            // … and gone
    const lineA = lerp(1, 0.32, 1 - fade) * gone;
    if (lineA <= 0.002) return;
    const palm = proj(cam, S.palmH), unit = pxPerUnit(cam, S.palmH) * S.sketchUnit;

    // 1 · the light fill, from the palm outward (behind the line): a warm core that stays in the
    //     palm, a front of light that runs out to the fingertips and the arm, then a soft glow
    if (fillP > 0) {
      const Rmax = 330 * unit, rad = Math.max(1, Rmax * fillP);
      const warm = lerp(0.3, 1, fade) * gone;
      const settle = 1 - 0.4 * E.inOutSine(seg(T, 20.5, 21.3));
      ctx.save();
      ctx.beginPath(); R.polyPath(ctx, S.sketchFill, true); ctx.clip();
      ctx.globalCompositeOperation = 'screen';
      const g = ctx.createRadialGradient(palm[0], palm[1], 0, palm[0], palm[1], rad);
      g.addColorStop(0, R.rgba('#ffe0c2', 0.46 * warm * settle));
      g.addColorStop(0.18, R.rgba(PAL.ember, 0.28 * warm * settle));
      g.addColorStop(0.5, R.rgba(PAL.copperHot, 0.1 * warm * settle));
      g.addColorStop(1, R.rgba(PAL.copper, 0));
      ctx.fillStyle = g; ctx.fillRect(palm[0] - rad, palm[1] - rad, rad * 2, rad * 2);
      ctx.restore();
    }

    // 2 · the line: a soft warm glow under a crisp ivory ribbon (both follow the pen's pressure,
    //     so the ends taper to nothing); it warms as the light passes
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = R.rgba(PAL.copper, 0.17 * lineA);
    ribbon(ctx, scr, sk.press, end, 10 * unit);
    ctx.globalCompositeOperation = 'source-over';
    let style = R.rgba(PAL.ivory, 0.94 * lineA);
    const near = E.inOutSine(seg(T, 19.45, 19.8));
    if (fillP > 0) {
      const rad = Math.max(1, 520 * unit * fillP);
      const g = ctx.createRadialGradient(palm[0], palm[1], 0, palm[0], palm[1], rad);
      g.addColorStop(0, R.rgba('#ffe2c6', lineA)); g.addColorStop(0.7, R.rgba(PAL.ember, 0.96 * lineA));
      g.addColorStop(0.93, R.rgba('#ffc9a4', 0.96 * lineA)); g.addColorStop(1, R.rgba(PAL.ivory, 0.94 * lineA));
      style = g;
    } else if (near > 0) {
      // the ember's light reaches the drawn fingers before it does
      const rad = 150 * unit;
      const g = ctx.createRadialGradient(ember.x, ember.y, 0, ember.x, ember.y, rad);
      g.addColorStop(0, R.rgba('#ffe6cc', lineA)); g.addColorStop(0.45, R.mix(PAL.ivory, PAL.ember, 0.75 * near, 0.96 * lineA));
      g.addColorStop(1, R.rgba(PAL.ivory, 0.94 * lineA));
      style = g;
    }
    ctx.fillStyle = style;
    ribbon(ctx, scr, sk.press, end, 3.1 * unit);
    // fresh ink runs hot behind the nib and cools to ivory
    if (su > 0 && su < 1) {
      ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 4; k++) {
        ctx.fillStyle = R.rgba(PAL.ember, 0.22 * lineA);
        ribbon(ctx, scr, sk.press, end, (3.1 + 0.6 * k) * unit, Math.max(0, Math.floor(end - 34 + 8 * k)));
      }
    }
    ctx.restore();

    // 3 · the nib: a hot point leading the line while it draws
    if (drawP > 0 && drawP < 1) {
      const i = Math.floor(end), f = end - i, a = scr[i], b = scr[Math.min(sk.n - 1, i + 1)];
      const nx = lerp(a[0], b[0], f), ny = lerp(a[1], b[1], f);
      const on = seg(T, SKETCH[0], SKETCH[0] + 0.06) * (1 - seg(T, SKETCH[1] - 0.08, SKETCH[1]));
      RB.fx.ember(ctx, nx, ny, 3.2, { intensity: on });
    }
  }

  /**
   * The robot, visible only inside the ember's pool of light: it brightens and widens from the
   * ember as the hand rises (the whole hand emerges from the dark together). While it is barely
   * lit — rising into the light, and backing out of it after the hand-off — it is composited
   * additively, so it appears (and goes) by its highlights and never reads as a dark cut-out
   * against the pool of light. The forearm falls away into shadow toward the frame edge.
   * Skipped (no draw3D) when nothing of it can be seen.
   */
  function drawRobot(ctx, T, cam, robot, ember) {
    const reveal = E.inOutSine(seg(T, REVEAL[0], REVEAL[1]));
    const gone = E.inOutSine(seg(T, EXIT[0], EXIT[1]));
    if (reveal <= 0.001 || gone >= 0.999) { S.hand.setGlow(null); return; }
    S.hand.setGlow(ember.world ? { at: ember.world.clone().addScaledVector(robot.pn, 0.05), intensity: 2.2 * ember.I, range: 2.2 } : null);
    const b = R.buffer('s6-robot');
    b.clear();
    RB.draw3D(b.ctx, S.scene, cam, { exposure: 1 });
    cam.clearViewOffset();
    const m = b.ctx;
    m.globalCompositeOperation = 'destination-in';
    const r0 = lerp(300, 2400, Math.pow(reveal, 1.8)), a = E.inOutSine(seg(T, 17.58, 18.3));
    if (r0 < 2300 || a < 1) {
      const g = m.createRadialGradient(ember.x, ember.y, 0, ember.x, ember.y, Math.max(1, r0));
      g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(0.5, `rgba(0,0,0,${0.82 * a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      m.fillStyle = g; m.fillRect(0, 0, R.W, R.H);
    }
    const sh = m.createLinearGradient(1180, 0, 1920, 0);
    sh.addColorStop(0, 'rgba(0,0,0,1)'); sh.addColorStop(1, 'rgba(0,0,0,0.3)');
    m.fillStyle = sh; m.fillRect(0, 0, R.W, R.H);
    m.globalCompositeOperation = 'source-over';
    // solid once the key has caught it; light-only while it rises into the light and leaves it
    const solid = E.inOutSine(seg(T, 17.8, 18.4)) * (1 - E.inOutSine(seg(T, EXIT[0] - 0.15, EXIT[0] + 0.45)));
    const vis = 1 - gone;
    ctx.save();
    if (solid > 0.001) { ctx.globalAlpha = solid * vis; ctx.drawImage(b.canvas, 0, 0, R.W, R.H); }
    if (solid < 0.999) { ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = (1 - solid) * vis; ctx.drawImage(b.canvas, 0, 0, R.W, R.H); }
    ctx.restore();
  }

  // ─── Atmosphere ─────────────────────────────────────────────────────────────
  function softGlow(ctx, x, y, r, color, a) {
    if (a <= 0.002) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, R.rgba(color, a)); g.addColorStop(0.45, R.rgba(color, a * 0.35)); g.addColorStop(1, R.rgba(color, 0));
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
  }
  /** The room: the contract backdrop at both cuts; the ember warms the air around it between. */
  function drawRoom(ctx, T, ember) {
    RB.atmos.backdrop(ctx, BACK);
    const mid = E.inOutSine(seg(T, 17.6, 18.6)) * (1 - E.inOutSine(seg(T, 21.6, 22.4)));
    softGlow(ctx, ember.x, ember.y, 420, PAL.umber, 0.55 * mid);
    const lit = Math.exp(-Math.max(0, T - HANDOFF) * 2.2) * (T >= HANDOFF ? 1 : 0);
    softGlow(ctx, ember.x, ember.y, 300, PAL.copper, 0.22 * lit * mid);
    // a soft shaft of the workshop key falls across the hand-off
    const shaftA = E.inOutSine(seg(T, 17.7, 18.8)) * (1 - E.inOutSine(seg(T, 21.2, 22.2)));
    if (shaftA > 0.002) {
      RB.atmos.shaft(ctx, { x: 820, y: -120, angle: -0.26, length: 1300, width: 760, alpha: 0.075 * shaftA });
      RB.atmos.dust(ctx, T, { count: 46, seed: 61, rect: [760, 40, 700, 780], alpha: 0.32 * shaftA, size: 1.4, drift: 10 });
    }
  }

  // ─── Scene ──────────────────────────────────────────────────────────────────
  R.scene({
    id: 'renew', index: 6, label: 'Renew', start: T0, end: T1,

    init() {
      S = RB.stage({ fov: FOV });
      S.hand = RB.hand.create({ side: 'right', forearm: 2.6 });
      S.scene.add(S.hand.group);
      S.hand.materials.ivory.color.set('#a8a292');   // the module sits under the palm: keep it quiet
      const P = RB.hand.poses;
      S.poses = { open: P.open, palmUp: P.palmUp, offer: P.offer, relaxed: P.relaxed };

      // the ember hovers exactly on palmSpark at 17.5; the palm rests just under it
      const cam0 = poseCamera(T0);
      S.hover = unprojectZ(cam0, SPARK_IN.x, SPARK_IN.y, 0);
      S.palmRest = new THREE.Vector3();
      S.hand.setPose(P.palmUp).place({ palm: PALM_DIR, forearm: ARM_DIR, palmAt: [0, 0, 0] });
      const n0 = S.hand.palmNormal(new THREE.Vector3());
      S.palmRest.copy(S.hover).addScaledVector(n0, -EMBER_LIFT);
      S.palmN = n0.clone();

      // the sketch plane faces the 20.0 camera; 1 design unit = 1 px there
      S.sketch = buildSketch();
      S.sketchScr = S.sketch.pts.map(() => [0, 0]);
      S.sketchFill = S.sketch.fillPts.map(() => [0, 0]);
      const camM = poseCamera(HANDOFF);
      S.sketchX = new THREE.Vector3(1, 0, 0).applyQuaternion(camM.quaternion);
      S.sketchY = new THREE.Vector3(0, -1, 0).applyQuaternion(camM.quaternion);
      // the fingertips meet: the drawn middle finger's pad sits exactly where the ember leaves the
      // metal, so the roll crosses from one hand to the other without a seam
      const cross = poseRobot(ROLL_B[0]), lip = cross.lip;
      S.sketchUnit = 1 / pxPerUnit(camM, lip);
      S.contact = S.sketch.contact;
      const C = S.contact;
      S.palmH = lip.clone().addScaledVector(S.sketchX, -C[0] * S.sketchUnit).addScaledVector(S.sketchY, -C[1] * S.sketchUnit);
      // speed at the crossing carries on down the drawn fingers
      const restA = cross.pp.clone().addScaledVector(cross.pn, EMBER_LIFT);
      const vA = restA.distanceTo(lip) / (ROLL_A[1] - ROLL_A[0]);          // rollA'(1) = 1
      S.rollB = { m0: (vA * (ROLL_B[1] - ROLL_B[0])) / (Math.hypot(C[0], C[1]) * S.sketchUnit) };

      // where the ember starts its lift: the palm's screen position and drift at 21.25
      const camA = poseCamera(LIFT[0]), pa = proj(camA, S.palmH);
      const camB = poseCamera(LIFT[0] + 0.01), pb = proj(camB, S.palmH);
      S.liftFrom = { x: pa[0], y: pa[1], vx: (pb[0] - pa[0]) / 0.01, vy: (pb[1] - pa[1]) / 0.01 };

      poseRobot(18.5);
      RB.gl.renderer().compile(S.scene, poseCamera(18.5));
      window.__s6dbg = { S, camAt, poseCamera, poseRobot, emberAt, proj, sketchWorld }; // DEBUG-REMOVE
    },

    draw(ctx, t, env) {
      const T = env.T;
      const cam = poseCamera(T);
      const robot = poseRobot(T);
      lightRobot(T);
      const ember = emberAt(T, cam, robot);

      drawRoom(ctx, T, ember);
      drawSketch(ctx, T, cam, ember);

      drawRobot(ctx, T, cam, robot, ember);

      RB.fx.ember(ctx, ember.x, ember.y, ember.r, { intensity: ember.I });

      RB.type.kicker(ctx, T, KICKER);
      RB.type.line(ctx, T, LINE);
    },

    post: (t, env) => {
      const T = env.T, hit = T >= HANDOFF ? Math.exp(-(T - HANDOFF) * 2.6) : 0;
      return { bloom: 0.35 + 0.16 * hit * (1 - seg(T, 21.6, 22.3)) };
    },
    rail: (t, env) => ({ alpha: 1 - E.inOutSine(seg(env.T, 22.0, T1)), active: 3, progress: (env.T - T0) / (T1 - T0) }),
  });
})();
