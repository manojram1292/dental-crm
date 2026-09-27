/*
 * S3 · 02 MAKE · 7.5–10.0 s (frames 225–299) · rail: 02 MAKE
 *
 * Make one thing into four. The workshop's instrument, the robotic hand, comes down out of
 * the dark at the upper right as the workshop light comes up on the work, takes the cup by
 * the rim the way a maker lifts a wide bowl, raises it, tips it toward us in the light and
 * sets it down one step to the right — its place in the row — on the beat. The touch-down
 * rings the cup, and it divides: a seam of warm light opens down its middle and flares, the
 * one bowl stretches into two joined at the seam like a cup and its reflection, the feet part
 * first, the rims pinch off last, and the second cup slides away on its own weight, born a
 * little warm and cooling to copper. On the next beat both divide again, and the four settle
 * into the row as the camera draws back and the working light goes down.
 *
 *   7.500  S2's out frame: the solid cup at the origin in shots.cupMake, no hand.
 *   7.50–8.35  The camera eases back and up from rest (room for the hand and the title); the
 *          shaft, its warm spot on the work and a low front card fade up (7.5–8.1).
 *          The hand is already travelling as it enters from just past the upper-right edge:
 *          one long deceleration on an arc that bends into a short straight descent down
 *          the cup's axis onto the rim (servo whir 7.5–8.1), turned a little about the
 *          wrist and aligning as it slows; the fingers open to the pre-grasp on the way.
 *   7.600  Kicker "02 ── MAKE".  7.800 → 9.550  "Make one thing into four." — top left,
 *          in the shaft above the work; neither the lifted cup nor the row reaches that band.
 *   8.125  (beat) Contact: the fingers close on the bowl, thumb over the rim (the clack).
 *   8.15–8.75  Lift (0.24), a breath at the top tipped toward the lens and turned a little,
 *          carried one step right (the camera follows about half of it) and set straight
 *          down at x = rowX[2], touching down ON the 8.75 beat (inspect servo 8.2).
 *   8.750  (beat) 1 → 2 (the bowl strikes D + A). The touch-down rings the cup: the seam
 *          lights and flares; the child slides left, away from the hand, parts from its
 *          parent at ≈9.19, and both rock once on their feet (the child more as it stops).
 *   8.77–9.32  The fingers open first, then the hand lifts straight off the rim, opening flat,
 *          and without a pause turns into the departure …
 *   8.62–9.967  The camera draws back to shots.row4: its peak comes early, while one becomes
 *          two, and it settles long and soft, landing with zero velocity on frame 299.
 *   8.88–9.80  … up and away to the upper right, gathering speed the whole way (servo
 *          9.38); out of frame by ≈9.53.
 *   9.375  (beat) 2 → 4 (C + F join): both cups divide outward at once, mirror images.
 *   9.45–9.93  The working light goes down (to S4's standard look) as the four land.
 *   9.79–9.963  The last two part, stop and rock; every cup is still from frame 299, in
 *          the row, for the 10.0 chord.
 *
 * Contracts (checked pixel-exact with --post 0 --hud 0)
 *   IN   frame 225 = S2's frame 224: solid cup at the origin, rotation 0, camera exactly
 *        shots.cupMake, backdrop defaults, stage-default lights, no hand, no text; the
 *        lathe seam normals welded exactly as S1/S2 weld them.
 *   OUT  frame 299 = S4's frame 300: four plain kit cups at x = shots.rowX, y 0, rotation 0,
 *        camera exactly shots.row4, no hand, no text, no shaft, dust or contact shadows,
 *        the working spot and card at exactly 0, backdrop defaults. The seam re-weld eases
 *        to the kit's own normals during the draw-back (8.95–9.65), as S4 builds them.
 *   Frame 225 with --mb 8 differs from its single sample only along the cup's edges (AA):
 *        the hand's fingertips are still above the frame at the last sub-sample.
 *   Rail: 02 active, progress (T − 7.5) / 10.
 *
 * One draw3D per frame (≤ ~225k triangles): the hand, four cups (each with its plain kit
 * materials and a patched "making" set used only while it is divided or still warm),
 * their contact shadows, the stage lights plus a working spot and card (always present,
 * dimmed to 0 at both hand-offs, so no program swaps). 2D after the render: the seam's
 * glow, dust and type. Everything is built in init() and posed from T in draw().
 */
(function () {
  'use strict';
  const R = window.REEL, RB = window.RB, THREE = window.THREE;
  const { PAL, E, clamp, lerp, seg } = R;

  // ─── Timing (absolute seconds; one beat = 0.625 s) ──────────────────────────
  const T0 = 7.5;
  const T_END = 299 / 30;                 // the last frame of the scene: the hand-off pose is exact from here
  const GRIP_T = 8.125;                   // (beat) contact
  const SPLIT = [8.75, 9.375];            // (beats) 1 → 2, 2 → 4

  // ─── Copy (verbatim from the storyboard) ────────────────────────────────────
  const KICKER = { index: '02', label: 'MAKE', x: 150, y: 176, tIn: 7.6, tOut: 9.55 };
  const LINE = { text: 'Make one thing into four.', x: 150, y: 262, size: 60, tIn: 7.8, tOut: 9.55, stagger: 0.04, dur: 0.6 };
  const TYPE_GONE = 9.93;                 // the type has cleared before S4's first frame
  const TYPE_BOX = { x: 0, y: 110, w: 1000, h: 200 };

  // ─── The row ────────────────────────────────────────────────────────────────
  const XS = RB.shots.rowX;               // [-2.1, -0.7, 0.7, 2.1]
  const HOME = XS[2];                     // where the hand sets the first cup down
  // The family tree. The first cup (index 0) is carried to HOME; each child slides out of
  // its parent at a split beat. `slot` is the child's place in the row.
  const CUPS = [
    { parent: -1, slot: 2 },                                     // the original
    { parent: 0, slot: 1, born: SPLIT[0], dur: 0.6 },            // 1 → 2: out to the left, away from the hand
    { parent: 1, slot: 0, born: SPLIT[1], dur: 0.56 },           // 2 → 4: left …
    { parent: 0, slot: 3, born: SPLIT[1], dur: 0.56 },           // … and right
  ];
  const HEAT_LIFE = 0.55;                 // a new cup cools to plain copper over this long
  const SEAM_GAIN = 2.0;                  // brightness of the division's seam of light

  // ─── Shots ──────────────────────────────────────────────────────────────────
  /** A shot as orbit parameters about its look point. */
  function orbitOf(shot) {
    const d = [shot.pos[0] - shot.look[0], shot.pos[1] - shot.look[1], shot.pos[2] - shot.look[2]];
    const D = Math.hypot(d[0], d[1], d[2]);
    return { lx: shot.look[0], ly: shot.look[1], lz: shot.look[2], az: Math.atan2(d[0], d[2]), el: Math.asin(d[1] / D), D, fov: shot.fov };
  }
  function shotOf(o) {
    const ce = Math.cos(o.el);
    return {
      pos: [o.lx + o.D * ce * Math.sin(o.az), o.ly + o.D * Math.sin(o.el), o.lz + o.D * ce * Math.cos(o.az)],
      look: [o.lx, o.ly, o.lz], fov: o.fov,
    };
  }
  // The working camera: off cupMake, back and up to give the hand and the title room, then
  // drifting with the carry. From PULL[0] the draw-back to row4 is blended over it, on an
  // ease whose peak comes early (while one cup becomes two) and which settles long and
  // soft into row4 as the four land, with zero velocity on frame 299.
  const CAM_KEYS = [
    [T0, orbitOf(RB.shots.cupMake)],
    [8.35, { lx: 0.1, ly: 0.74, lz: 0, az: 0.13, el: 0.22, D: 4.0, fov: 32 }],       // room for the hand and the title
    [8.9, { lx: 0.12, ly: 0.73, lz: 0, az: 0.12, el: 0.21, D: 4.15, fov: 32 }],      // (+ the carry follow below)
  ];
  const FOLLOW = 0.55;                    // how much of the carry the camera follows (the rest reads as the placing)
  const ROW4 = orbitOf(RB.shots.row4);
  const PULL = [8.62, T_END];
  const pullEase = E.bezier(0.42, 0, 0.16, 1);
  const CAM_PARAMS = ['lx', 'ly', 'lz', 'az', 'el', 'D', 'fov'];
  /** The working camera: monotone Hermite through the keys (zero velocity at both ends), log distance. */
  function workOrbit(T) {
    const K = CAM_KEYS, n = K.length;
    T = clamp(T, K[0][0], K[n - 1][0]);
    let i = 0;
    while (i < n - 2 && T > K[i + 1][0]) i++;
    const [t0, a] = K[i], [t1, b] = K[i + 1];
    const h = t1 - t0, u = (T - t0) / h, u2 = u * u, u3 = u2 * u;
    const val = (k, j) => (k === 'D' ? Math.log(K[j][1].D) : K[j][1][k]);
    const tan = (k, j) => {
      if (j === 0 || j === n - 1) return 0;
      const p = val(k, j - 1), c = val(k, j), q = val(k, j + 1);
      const dl = (c - p) / (K[j][0] - K[j - 1][0]), dr = (q - c) / (K[j + 1][0] - K[j][0]);
      if (dl * dr <= 0) return 0;
      const m = (q - p) / (K[j + 1][0] - K[j - 1][0]);
      return Math.sign(m) * Math.min(Math.abs(m), 3 * Math.abs(dl), 3 * Math.abs(dr));
    };
    const o = {};
    for (const k of CAM_PARAMS) {
      const v = (2 * u3 - 3 * u2 + 1) * val(k, i) + (u3 - 2 * u2 + u) * h * tan(k, i)
        + (-2 * u3 + 3 * u2) * val(k, i + 1) + (u3 - u2) * h * tan(k, i + 1);
      o[k] = k === 'D' ? Math.exp(v) : v;
    }
    return o;
  }
  /** The camera at T: exactly cupMake on frame 225, exactly row4 from frame 299. */
  function camShot(T) {
    if (T <= T0) return RB.shots.cupMake;
    if (T >= T_END) return RB.shots.row4;
    const w = workOrbit(T), p = pullEase(seg(T, PULL[0], PULL[1]));
    w.lx += FOLLOW * carryX(T);
    if (p <= 0) return shotOf(w);
    const o = {};
    for (const k of CAM_PARAMS) o[k] = k === 'D' ? Math.exp(lerp(Math.log(w.D), Math.log(ROW4.D), p)) : lerp(w[k], ROW4[k], p);
    return shotOf(o);
  }

  // ─── The first cup: lift, inspect, carry, set down ──────────────────────────
  // Taken on the 8.125 beat, set down ON the 8.75 beat: the touch-down is the strike that
  // divides it. Up, a breath at the top tipped toward the lens, and down one step to the right.
  const LIFT = { up: [8.15, 8.43], down: [8.46, SPLIT[0]], h: 0.24 };
  const CARRY = [8.18, 8.71];
  const carryX = (T) => HOME * (0.5 * E.inOutSine(seg(T, CARRY[0], CARRY[1])) + 0.5 * E.inOutCubic(seg(T, CARRY[0], CARRY[1])));
  // set down with a little weight left in it (a soft "tock" on the beat, not a float to a stop)
  const setDown = (u) => 0.86 * E.inOutSine(u) + 0.14 * E.inSine(u);
  const INSPECT = { turn: 0.14, tilt: 0.17, pivot: [0, 0.72, 0] };
  const _m1 = new THREE.Matrix4(), _m2 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3();
  /** The original cup's world matrix at T (while the hand has it). */
  function firstCupMatrix(T, out) {
    const up = E.inOutSine(seg(T, LIFT.up[0], LIFT.up[1])), down = setDown(seg(T, LIFT.down[0], LIFT.down[1]));
    const lift = up * (1 - down);
    const x = carryX(T);
    const y = LIFT.h * lift;
    // the inspection: tipped toward the lens and turned a little while it is up, squared again as it lands
    // (a raised-cosine bump: the wrist starts and ends the gesture from rest, no kick)
    const look = 0.5 - 0.5 * Math.cos(2 * Math.PI * seg(T, LIFT.up[0] + 0.03, LIFT.down[1] - 0.04));
    const turn = INSPECT.turn * look, tilt = INSPECT.tilt * look;
    const [px, py, pz] = INSPECT.pivot;
    _q.setFromEuler(_e.set(tilt, turn, 0, 'XYZ'));
    out.makeTranslation(x + px, y + py, pz).multiply(_m1.makeRotationFromQuaternion(_q)).multiply(_m2.makeTranslation(-px, -py, -pz));
    return out;
  }

  // ─── The copies: divide, slide, stop, rock ──────────────────────────────────
  // A division is a mirror plane between parent and child, travelling at half the child's
  // speed: the parent is drawn only on its side of it, the child only on the other. At the
  // split the two halves are the one cup; as the child slides away the union stretches into
  // two bowls joined at a glowing seam, the feet part first, the rims pinch off last — one
  // cup becoming two, its reflection stepping out of it. Past 2 × rim radius they are whole.
  const RIM_R = RB.CUP.rimRadius, PINCH = 2 * RIM_R + 0.012;
  /** The slide: pushed out by the division, carried on its own weight, eased into its place. */
  const slideBez = E.bezier(0.3, 0.1, 0.3, 1);
  const slideEase = (u) => 0.65 * E.inOutSine(u) + 0.35 * slideBez(u);
  /** Slide progress u at which a child has covered `frac` of its run (bisection; used once, at load). */
  function slideAt(frac) {
    let lo = 0, hi = 1;
    for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (slideEase(m) < frac) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  /** Rock on the foot (radians, + = forward): over onto the leading edge, back past level onto the
   *  trailing edge a little, and still — all inside `len` seconds. */
  function rock(tau, amp, len) {
    if (tau <= 0 || tau >= len) return 0;
    const u = tau / len;
    return amp * Math.sin(2 * Math.PI * u) * Math.pow(1 - u, 1.5);
  }
  const ROCK = { stop: 0.04, stopAt: 0.8, stopLen: 0.14, recoil: 0.03, recoilLen: 0.16 };
  /** Where cup i rests once made (the original: HOME once set down). */
  const restX = (i) => XS[CUPS[i].slot];
  CUPS.forEach((c, i) => {
    if (c.parent < 0) return;
    c.dir = Math.sign(restX(i) - restX(c.parent));
    c.pinch = c.born + c.dur * slideAt(PINCH / Math.abs(restX(i) - restX(c.parent)));   // the moment the two part
  });
  /** Child i's x at T (its parent's rest x before it is born). */
  function childX(i, T) {
    const c = CUPS[i];
    return lerp(restX(c.parent), restX(i), slideEase(clamp((T - c.born) / c.dur)));
  }
  /** The division plane between child i and its parent at T, or null once they have parted. */
  function divisionOf(i, T) {
    const c = CUPS[i];
    if (c.parent < 0 || T < c.born || T >= c.pinch) return null;
    const px = restX(c.parent), sep = Math.abs(childX(i, T) - px);
    // the seam's light: it flares with the strike and fades as the waist pinches off
    const seam = R.smoothstep(0, 0.035, sep) * (1 - R.smoothstep(0.55, 1.0, sep / PINCH)) + 0.35 * (1 - R.smoothstep(0, 0.4, sep));
    return { x: px + c.dir * sep / 2, dir: c.dir, seam };
  }
  /**
   * Pose of cup i at T: { visible, x, tip (signed rock, + = toward +x), heat, cut }.
   * cut = { x, dir, side, seam }: the division plane this cup is drawn on one side of.
   * Once made, a cup moves only along x on the ground (rotation 0 except for the rock).
   */
  function cupState(i, T) {
    const c = CUPS[i];
    if (T >= T_END) return { visible: true, x: restX(i), tip: 0, heat: 0, cut: null };   // the hand-off row, exactly
    let tip = 0, cut = null;
    // as a parent: cut by a child that is still being born; rocks back as the child parts from it
    CUPS.forEach((k, j) => {
      if (k.parent !== i) return;
      const d = divisionOf(j, T);
      if (d) cut = { ...d, side: -1 };
      tip -= k.dir * rock(T - k.pinch, ROCK.recoil, ROCK.recoilLen);
    });
    if (c.parent < 0) return { visible: true, x: HOME, tip, heat: strikeGlow(T, SPLIT[0]), cut };
    const tau = T - c.born;
    if (tau < 0) return { visible: false };
    const own = divisionOf(i, T);
    if (own) cut = { ...own, side: 1 };
    tip += c.dir * (rock(T - c.pinch, ROCK.recoil, ROCK.recoilLen) + rock(tau - c.dur * ROCK.stopAt, ROCK.stop, ROCK.stopLen));
    const heat = 0.7 * Math.pow(1 - clamp(tau / HEAT_LIFE), 2);
    return { visible: true, x: childX(i, T), tip, heat, cut };
  }
  /** The first cup's strike at 8.75: a brief flare of warmth as it is struck. */
  function strikeGlow(T, t0) {
    const tau = T - t0;
    if (tau < -0.02 || tau > 0.5) return 0;
    return 0.7 * Math.exp(-Math.max(0, tau) / 0.14) * clamp((tau + 0.02) / 0.03);
  }
  /** World matrix of a copy (or the settled original): at x on the ground, rocking on the edge of its foot. */
  const FOOT_R = 0.3;
  function restMatrix(x, tip, out) {
    // pivot on the foot's edge on the side it tips toward; the cup rises by FOOT_R·sin(a)
    const a = Math.abs(tip), dir = tip >= 0 ? 1 : -1, s = Math.sin(a), co = Math.cos(a);
    out.makeRotationZ(-dir * a);
    out.setPosition(x + dir * FOOT_R * (1 - co), FOOT_R * s, 0);
    return out;
  }

  // ─── The hand ───────────────────────────────────────────────────────────────
  const AROUND = 0.8;                     // the hand on the cup's right-front: 3/4 of its back to the lens
  const SWAY = { roll: 0.35, pitch: -0.18 }; // the hand comes in turned a little and aligns as it arrives
  const bez = (p0, p1, p2, p3, s) => { const m = 1 - s; return m * m * m * p0 + 3 * m * m * s * p1 + 3 * m * s * s * p2 + s * s * s * p3; };
  // The reach is ONE decelerating move: already travelling as it enters from just past the upper
  // right edge, it falls in on an arc that bends into a short, straight descent down the cup's
  // axis onto the rim (so the thumb comes over the rim from above, never through it). As a curve
  // in (α = `away` along the grip's approach axis, β = share of ENTRY), ending tangent to α.
  const ENTRY = [0.72, 0.86, 0.17];         // added to the grip at β = 1: just off frame, upper right
  const REACH = { t: [7.5, 8.1], a: [0.34, 0.34, 0.26, 0], b: [1, 0.5, 0.06, 0] };
  const reachEase = E.bezier(0.3, 0.45, 0.35, 1);
  // The exit, the same way round: straight up off the rim until the fingers clear it (the thumb
  // lifts out of the bowl), handing over, without a pause, to a departure up and away to the
  // upper right that gathers speed the whole way (servo 9.38).
  const EXIT = { lift: [8.8, 9.32], h: 0.46, go: [8.88, 9.8], len: 3.6, dir: [0.5, 1, 0.2] };
  const exitEase = (u) => 0.5 * E.inQuad(u) + 0.5 * E.inCubic(u);
  const HAND_T = {
    shape: [7.56, 7.98],     // relaxed → open pre-grasp as it slows (the aperture opens before the close)
    close: [7.98, GRIP_T],   // contact on the beat
    release: [8.77, 8.9],    // set down on 8.75; the fingers open first …
    open: [8.82, 9.22],      // … the hand opens fully as it lifts off
    relax: [9.25, 9.7],
  };
  const _v = new THREE.Vector3();
  function poseHand(T) {
    const h = S.hand, P = S.poses, HT = HAND_T;
    const visible = T < EXIT.go[1] + 0.05;
    h.group.visible = visible;
    if (!visible) return;
    const shape = E.inOutSine(seg(T, HT.shape[0], HT.shape[1])) * (1 - E.inOutSine(seg(T, HT.open[0], HT.open[1])));
    const uc = seg(T, HT.close[0], HT.close[1]);
    const close = (0.5 * E.inOutSine(uc) + 0.5 * E.inSine(uc)) * (1 - E.inOutSine(seg(T, HT.release[0], HT.release[1])));
    const reach = T < HT.release[0];
    // before the grasp: relaxed → pre-grasp; after it: open → relaxed
    const base = reach ? RB.hand.blend(P.relaxed, P.ready, E.inOutSine(seg(T, HT.shape[0], HT.shape[1])))
      : RB.hand.blend(RB.hand.blend(P.open, P.ready, shape), P.relaxed, E.inOutSine(seg(T, HT.relax[0], HT.relax[1])));
    h.setPose(RB.hand.blend(base, P.grip, close));
    const r = reachEase(seg(T, REACH.t[0], REACH.t[1]));
    const away = bez(...REACH.a, r) + EXIT.h * E.inOutSine(seg(T, EXIT.lift[0], EXIT.lift[1]));
    const arc = bez(...REACH.b, r), ex = EXIT.len * exitEase(seg(T, EXIT.go[0], EXIT.go[1]));
    // while it holds the cup the hand follows it; once it has let go it works from the cup's
    // resting place, so the cup's later rocking doesn't shake the departing hand
    h.graspCup(T < HT.release[1] ? S.cups[0].group : S.homeMatrix, { around: AROUND, away });
    _v.set(ENTRY[0] * arc + EXIT.dir[0] * ex, ENTRY[1] * arc + EXIT.dir[1] * ex, ENTRY[2] * arc + EXIT.dir[2] * ex);
    h.group.position.add(_v);
    // overlapping action: the hand trails the arm a little, turned about the wrist, and aligns as it arrives
    const sw = 1 - r;
    if (sw > 0) h.group.quaternion.multiply(_q.setFromEuler(_e.set(SWAY.pitch * sw, SWAY.roll * sw * sw, 0, 'XYZ')));
  }

  // ─── The "making" material patch ────────────────────────────────────────────
  // Used only while a cup is being made or struck: the division plane (fragments on the far
  // side are discarded, so parent and child together are exactly one surface), a thin seam
  // of warm light along the plane, and a little heat at the new cup's grazing edges that
  // cools to plain copper. With the plain kit materials swapped back in, the hand-off frames
  // are exactly the kit cup.
  function patchMaking(material, U) {
    material.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vMkW;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvMkW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', `#include <common>
varying vec3 vMkW;
uniform float uMkHeat, uMkSeam, uMkSide;
uniform vec3 uMkColor, uMkHot;
uniform vec4 uMkPlane;`)
        .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
float mkD = 10.0;
if (uMkSide != 0.0) {
  mkD = uMkSide * (dot(uMkPlane.xyz, vMkW) - uMkPlane.w);
  if (mkD < 0.0) discard;
}`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
float mkF = 1.0 - clamp(abs(dot(normalize(normal), normalize(vViewPosition))), 0.0, 1.0);
float mkF2 = mkF * mkF;
// heat: a whisper over the body, warmer at the grazing edges (tight, so the silhouette stays crisp)
totalEmissiveRadiance += uMkColor * uMkHeat * (0.004 + 0.6 * mkF2 * mkF2 * mkF2);
// the seam: a hot hairline where parent and reflection meet, and the light it throws onto the copper
// either side of it — a band of light, not a crack
totalEmissiveRadiance += uMkSeam * (uMkHot * exp(-mkD / 0.0042) + uMkColor * (0.16 * exp(-mkD / 0.022) + 0.022 * exp(-mkD / 0.08)));`);
    };
  }

  // ─── Build (once) ───────────────────────────────────────────────────────────
  let S = null;
  /**
   * The lathe seam (φ = 0 / 2π, facing the lens at rotation 0). RB.cup() now welds it itself;
   * S1 and S2 weld it once more on top (normalize(n + n), which can differ from the kit's
   * normals in the last bit) while S4 shows the kit cup as built. To stay bit-exact at both
   * hand-offs we start with S2's re-weld and ease to the kit's own normals during the
   * draw-back — a change far below anything visible, but it keeps both contracts at 0 diff.
   */
  function seamNormals(mesh, segments = 160) {
    const nrm = mesh.geometry.attributes.normal, n = nrm.count / (segments + 1);
    const plain = Float32Array.from(nrm.array), welded = new Float32Array(n * 3), cols = [0, segments * n * 3];
    for (let j = 0; j < n; j++) {
      const a = j * 3, b = cols[1] + j * 3;
      const v = new THREE.Vector3(plain[a] + plain[b], plain[a + 1] + plain[b + 1], plain[a + 2] + plain[b + 2]).normalize();
      welded[j * 3] = v.x; welded[j * 3 + 1] = v.y; welded[j * 3 + 2] = v.z;
    }
    return { attr: nrm, plain, welded, cols, n, state: -1 };
  }
  /** Seam normals at weld amount w (1 = welded as S2, 0 = the plain kit cup): absolute, uploaded only on change. */
  const _n = new THREE.Vector3();
  function setWeld(cup, w) {
    for (const sn of cup.seams) {
      if (sn.state === w) continue;
      const arr = sn.attr.array;
      for (const c0 of sn.cols) {
        for (let j = 0; j < sn.n; j++) {
          const k = c0 + j * 3;
          if (w >= 1) { arr[k] = sn.welded[j * 3]; arr[k + 1] = sn.welded[j * 3 + 1]; arr[k + 2] = sn.welded[j * 3 + 2]; }
          else if (w <= 0) { arr[k] = sn.plain[k]; arr[k + 1] = sn.plain[k + 1]; arr[k + 2] = sn.plain[k + 2]; }
          else {
            _n.set(lerp(sn.plain[k], sn.welded[j * 3], w), lerp(sn.plain[k + 1], sn.welded[j * 3 + 1], w), lerp(sn.plain[k + 2], sn.welded[j * 3 + 2], w)).normalize();
            arr[k] = _n.x; arr[k + 1] = _n.y; arr[k + 2] = _n.z;
          }
        }
      }
      sn.attr.clearUpdateRanges();
      for (const c0 of sn.cols) sn.attr.addUpdateRange(c0, sn.n * 3);
      sn.attr.needsUpdate = true;
      sn.state = w;
    }
  }

  function init() {
    S = RB.stage();
    S.cups = CUPS.map(() => {
      const c = RB.cup();
      c.seams = [c.outer, c.rim, c.inner].map((m) => seamNormals(m));
      c.U = {
        uMkHeat: { value: 0 }, uMkSeam: { value: 0 }, uMkSide: { value: 0 },
        uMkColor: { value: new THREE.Color(PAL.ember) }, uMkHot: { value: new THREE.Color('#ffe9d2') }, uMkPlane: { value: new THREE.Vector4() },
      };
      c.plainMat = {}; c.makeMat = {};
      for (const k of ['outer', 'rim', 'inner']) {
        c.plainMat[k] = c[k].material;
        c.makeMat[k] = c[k].material.clone();
        patchMaking(c.makeMat[k], c.U);
      }
      c.shadow = RB.contactShadow(0.78, 0.5);
      S.scene.add(c.group, c.shadow);
      return c;
    });

    S.hand = RB.hand.create({ side: 'right' });
    S.scene.add(S.hand.group);
    S.poses = { open: RB.hand.poses.open, relaxed: RB.hand.poses.relaxed, ready: RB.hand.poses.cupReady, grip: RB.hand.poses.cupGrip };

    // The shaft's light on the work (as S1's museum spot): a soft warm spot from high upper left
    // that rakes the hammered copper and draws the hand's edges while the work is under way.
    // It is never hidden (that would swap shader programs), only dimmed to exactly 0 at both
    // hand-offs, where it adds nothing.
    S.spot = new THREE.SpotLight('#ffd6ad', 0, 0, 0.34, 0.9, 2);
    S.spot.position.set(-1.7, 6.0, 1.9);
    S.spot.target.position.set(0.4, 0.45, 0);
    S.scene.add(S.spot, S.spot.target);
    // … and a low warm card from the front left, the product-shot kicker: the bowl's front,
    // which otherwise mirrors the dark floor, takes a soft highlight that shows the hammering.
    S.card = new THREE.DirectionalLight('#ffd2a6', 0);
    S.card.position.set(-3.0, 1.0, 4.0);
    S.card.target.position.set(0.3, 0.45, 0);
    S.scene.add(S.card, S.card.target);

    // Compile both material sets now, and draw each once into a 2×2 scissor so the software
    // rasteriser also builds its routines here: no frame pays for a shader build or a JIT.
    const r = RB.gl.renderer();
    RB.setCam(S.camera, RB.shots.cupMake);
    for (const set of ['makeMat', 'plainMat']) {
      S.cups.forEach((c) => { for (const k of ['outer', 'rim', 'inner']) c[k].material = c[set][k]; });
      r.compile(S.scene, S.camera);
      try {
        r.setScissorTest(true); r.setScissor(0, 0, 2, 2);
        r.render(S.scene, S.camera);
      } finally { r.setScissorTest(false); }
    }
    S.m = new THREE.Matrix4();
    S.homeMatrix = new THREE.Matrix4().makeTranslation(HOME, 0, 0);
  }

  // ─── Pose everything from T ─────────────────────────────────────────────────
  /** How much the working light (shaft, dust, contact shadows, warm pool) is up: 0 at both hand-offs. */
  const workLight = (T) => E.inOutSine(seg(T, T0, 8.1)) * (1 - E.inOutSine(seg(T, 9.45, 9.93)));
  const SPOT_I = 70;                       // the shaft's light on the work, at full working light
  const CARD_I = 2.8;                      // the low front card on the copper
  const WELD_OFF = [8.95, 9.65];           // the seam welding is released here, while everything moves

  function poseCups(T) {
    const wl = workLight(T), weld = 1 - E.inOutSine(seg(T, WELD_OFF[0], WELD_OFF[1]));
    S.cups.forEach((c, i) => {
      const st = cupState(i, T);
      c.group.visible = !!st.visible;
      c.shadow.visible = false;              // (shown below once the cup exists)
      setWeld(c, weld);
      if (!st.visible) return;
      if (i === 0 && T < LIFT.down[1] + 0.01) firstCupMatrix(T, S.m);
      else restMatrix(st.x, st.tip, S.m);
      S.m.decompose(c.group.position, c.group.quaternion, _s);
      c.group.scale.set(1, 1, 1);
      // the making materials only while it is cut by a division or still warm
      const cut = st.cut, making = st.heat > 0.002 || !!cut;
      for (const k of ['outer', 'rim', 'inner']) c[k].material = making ? c.makeMat[k] : c.plainMat[k];
      c.U.uMkHeat.value = st.heat || 0;
      c.U.uMkSide.value = cut ? cut.side : 0;
      c.U.uMkSeam.value = cut ? SEAM_GAIN * cut.seam : 0;
      if (cut) c.U.uMkPlane.value.set(cut.dir, 0, 0, cut.dir * cut.x);
      // contact shadow: fades as the cup leaves the ground
      const lift = c.group.position.y;
      c.shadow.visible = wl > 0.002;
      c.shadow.position.set(c.group.position.x, 0.002, c.group.position.z);
      c.shadow.material.opacity = 0.42 * wl * (1 - clamp(lift / 0.22) * 0.65);
    });
  }

  // ─── 2D layers ──────────────────────────────────────────────────────────────
  /** The workshop shaft from the upper left, drawn once into a buffer and reused (as S4 does). */
  function drawShaft(ctx, alpha) {
    if (alpha <= 0.002) return;
    const b = R.buffer('s3-shaft');
    if (!b.ready) {
      b.clear();
      RB.atmos.shaft(b.ctx, { x: 560, y: -90, angle: -0.36, length: 1400, width: 560, alpha: 1 });
      b.ready = true;
    }
    ctx.save();
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = alpha;
    ctx.drawImage(b.canvas, 0, 0, R.W, R.H);
    ctx.restore();
  }
  /**
   * The light in the seam, as the lens sees it: on each split beat the division line flares —
   * light spilling out of the plane where the cup meets its reflection — and settles to a glow
   * that fades as the two pinch apart. Traced along the real outer profile (RB.cup()'s lathe
   * points, foot to rim) where it crosses the division plane, on the side facing the lens.
   */
  const PROFILE = [[0.27, 0.0], [0.305, 0.012], [0.3, 0.05], [0.2, 0.085], [0.125, 0.13], [0.115, 0.19], [0.17, 0.25], [0.33, 0.33], [0.47, 0.45], [0.555, 0.6], [0.595, 0.75], [0.612, 0.87], [0.61, 0.9]];
  const _p3 = new THREE.Vector3();
  function drawSeamGlow(ctx, T) {
    CUPS.forEach((c, i) => {
      const d = divisionOf(i, T);
      if (!d) return;
      const tau = T - c.born, flare = clamp(tau / 0.035) * Math.exp(-Math.max(0, tau) / 0.22);
      const k = 0.9 * flare + 0.4 * d.seam;
      if (k < 0.01) return;
      const par = S.cups[c.parent].group, lx = d.x - par.position.x, ax = Math.abs(lx);   // the plane, off the parent's axis
      // the seam is the profile's crossing of the plane: where the feet (then the stems) have
      // already parted it breaks into separate runs — never a line drawn across the gap
      const runs = [];
      let run = null;
      const at = (r, y) => {
        _p3.set(lx, y, Math.sqrt(Math.max(0, r * r - ax * ax))).applyMatrix4(par.matrixWorld);
        return RB.toScreen(S.camera, _p3.x, _p3.y, _p3.z);
      };
      PROFILE.forEach(([r, y], j) => {
        const inside = r > ax;
        if (j > 0) {
          const [r0, y0] = PROFILE[j - 1];
          if (inside !== (r0 > ax)) {   // the plane grazes the profile here: end or start a run at the silhouette
            const f = (ax - r0) / (r - r0), yc = lerp(y0, y, f);
            if (inside) run = [at(ax, yc)];
            else if (run) { run.push(at(ax, yc)); runs.push(run); run = null; }
          }
        }
        if (inside) (run || (run = [])).push(at(r, y));
      });
      if (run) runs.push(run);
      if (!runs.length) return;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const [w, a, col] of [[64, 0.06, PAL.copperHot], [28, 0.11, PAL.ember], [9, 0.2, '#ffe9d2']]) {
        ctx.strokeStyle = R.rgba(col, a * k);
        ctx.lineWidth = w;
        ctx.beginPath();
        for (const pts of runs) pts.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
      }
      ctx.restore();
    });
  }
  /** Kicker and line through the kit, into a buffer so their exit can finish before the cut. */
  function drawType(ctx, T) {
    if (T < KICKER.tIn || T > TYPE_GONE) return;
    const fade = 1 - E.inOutSine(seg(T, LINE.tOut + 0.12, TYPE_GONE));
    const b = R.buffer('s3-type', TYPE_BOX.w, TYPE_BOX.h);
    b.clear();
    RB.type.kicker(b.ctx, T, { ...KICKER, x: KICKER.x - TYPE_BOX.x, y: KICKER.y - TYPE_BOX.y });
    RB.type.line(b.ctx, T, { ...LINE, x: LINE.x - TYPE_BOX.x, y: LINE.y - TYPE_BOX.y });
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.drawImage(b.canvas, TYPE_BOX.x, TYPE_BOX.y, TYPE_BOX.w, TYPE_BOX.h);
    ctx.restore();
  }

  // ─── Frame ──────────────────────────────────────────────────────────────────
  function draw(ctx, t, env) {
    const T = env.T;
    const shot = camShot(T);
    RB.setCam(S.camera, shot);

    poseCups(T);
    poseHand(T);

    const wl = workLight(T);
    S.spot.intensity = SPOT_I * wl;
    S.card.intensity = CARD_I * wl;
    RB.atmos.backdrop(ctx, { gx: lerp(1060, 1120, wl), gy: lerp(520, 470, wl), gr: 900 });
    drawShaft(ctx, 0.11 * wl);
    RB.draw3D(ctx, S.scene, S.camera);
    drawSeamGlow(ctx, T);
    RB.atmos.dust(ctx, T, { count: 70, alpha: 0.4 * wl, rect: [0, 0, R.W, 900] });
    drawType(ctx, T);
  }

  R.scene({
    id: 'make', index: 3, label: 'Make', start: 7.5, end: 10,
    init,
    draw,
    rail: (t, env) => ({ alpha: 1, active: 2, progress: (env.T - 7.5) / 10 }),
  });
})();
