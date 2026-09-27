/*
 * S7 · THE MARK · 22.5–30.0 s (frames 675–899) · s7-mark.js
 *
 * Darkness to light. The three makers become the mark.
 *
 *   22.500  IN. S6's ember, alone at riseSpark (960, 430) on the dark backdrop, still rising
 *           at 120 px/s. It slows to a hover where the mark's centre will be; the camera
 *           begins a slow dolly in and the room's glow drifts up to meet it.
 *   22.900  First rising tone: the ember divides with a small shower of sparks. A dark sibling
 *           (a charcoal coal, lit on the side that faces the copper) buds off; the pair circles.
 *   23.200  Second tone: the second dark sibling buds off, another shower. Three makers.
 *   23.500  Third tone: the three open into a wide, tilted orbit and swirl, trailing light.
 *           Each tone lifts the dark a notch: darkness to light begins here.
 *   23.750  Beat. Each spark is forged into its flame. The extruded flames grow out of the
 *           sparks white-hot, then cool to metal as they fly: the heat runs to their edges, the
 *           charcoal ones go dark with copper-red rims, and a moving softbox keeps the tumbling
 *           metal catching glints. The orbit tilts up to face us and spirals in.
 *   25.000  Downbeat. The flames seat into the exact logo with a small inward click against a
 *           burst of light; a warm light sweep runs along the bevels. Dawn: the room lifts
 *           through amber and peach while ivory pours out of the mark, fully ivory by 25.600.
 *   25.625  "Ribhu Labs" rises out of its mask under the mark (RB.wordmark, ink on ivory).
 *   26.250  "World-renewing craftsmanship." (RB.type.line, Manrope, ink).
 *   27.500  "ribhulabs.ai" types on in copper mono (the annotation voice, set at 32 px).
 *   27.5–30 Living hold: a slow push, the mark turns its last degrees to face-on, a second
 *           slow light sweep along the bevels, gilded motes glinting in the key light; the
 *           motes settle out with the music's tail. Frame 899 is the hero still: the whole
 *           lockup on ivory, the logo exact and face-on, nothing else.
 *
 * One draw3D per frame. The camera glides from a low three-quarter view onto the lockup
 * camera, which looks straight down −z, so the logo's front face is an undistorted copy of
 * the SVG. The flames use RB.mark3D's pivots, homes and materials; their geometry is rebuilt
 * from the same paths with the bevel turned inward, so the outline is the SVG outline exactly
 * (the kit's outward bevel fattens it ~2.5 px and closes the logo's gaps). The sparks are 2D
 * and are placed by projecting the same 3D formation the flames fly in, so the hand-off from
 * spark to flame lands on the same pixel.
 */
(function () {
  'use strict';
  const R = window.REEL, RB = window.RB, THREE = window.THREE, ADD = window.THREE_ADDONS;
  const { PAL, E, clamp, lerp, seg } = R;
  const DEG = Math.PI / 180;

  // ─── Timing (local seconds; t = 0 is 22.5 s absolute; one beat = 0.625 s) ───────────────
  const K = {
    split1: 0.4,    // 22.9  first tone: 1 → 2
    split2: 0.7,    // 23.2  second tone: 2 → 3
    open: 1.0,      // 23.5  third tone: the orbit opens
    forge: 1.25,    // 23.75 beat: sparks become flames
    lock: 2.5,      // 25.0  downbeat: the logo locks
    ivory: 3.1,     // 25.6  fully ivory
    word: 3.125,    // 25.625 wordmark
    line: 3.75,     // 26.25 tagline
    url: 5.0,       // 27.5  url
    end: 7.5,
  };
  const T0 = 22.5;

  // ─── Lockup layout (logical px, before the slow push) ─────────────────────────────────────
  const L = {
    cx: 960,
    markY: 386, markH: 292,          // mark centre and height on screen at the lock
    wordY: 668, wordSize: 100,       // wordmark baseline and size
    lineY: 766, lineSize: 52,        // tagline baseline and size (story lines are ≥ 52 px; was 756 / 44)
    urlY: 854, urlSize: 32,          // url centre line and size (≥ 30 px; was 846 / 12 px × 1.85 ≈ 22 px)
  };
  const URL_TRACK = (L.urlSize * 0.18).toFixed(1) + 'px'; // the address's open tracking (0.18 em, as before)
  const INK = '#141514';          // wordmark ink (storyboard)
  const INK_SOFT = '#34322d';     // tagline: the same ink, a step back in the hierarchy
  const RISE = RB.shots.riseSpark;   // S6 hands over the ember here (r 12), rising at 120 px/s
  const RISE_V = 120;
  const RISE_DUR = (2 * (RISE.y - L.markY)) / RISE_V; // decelerate evenly to a hover: 0.733 s

  // ─── Lockup camera: straight down −z at the origin; 1 world unit = markH px at z = 0 ──────
  const FOV = 26;
  const DIST = 540 / (L.markH * Math.tan((FOV * DEG) / 2));
  const MARK_Y = (540 - L.markY) / L.markH;

  // ─── Formation: the three makers (0 = copper, 1 = left charcoal, 2 = right charcoal) ──────
  const SPIN = 450 * DEG;                        // 1.25 turns; the first split reads horizontal
  const ORBIT_ANG = [90 * DEG, 210 * DEG, 330 * DEG];
  const TILT = 60 * DEG;                         // orbit plane tilted towards the floor
  const DZ = [0.28, -0.22, -0.4];                // depth staggers on the approach (no clipping)
  const TUMBLE = [[0.4, 1.15, 0.55], [-0.35, -1.2, -0.7], [0.45, 1.1, 0.8]]; // start Euler xyz
  // heat colour runs white-hot → forge orange → deep copper-red as a flame cools
  const HEAT_HOT = new THREE.Color('#ffc58f'), HEAT_MID = new THREE.Color('#ee6f34'), HEAT_LOW = new THREE.Color('#a8401c');
  // reflection strength per flame: copper is tuned so its face reads as brand copper on ivory
  const ENV_DARK = [1.55, 1.1, 1.1], ENV_LIT = [0.5, 1.0, 1.0];
  const RIM_HEAT = [0.8, 1, 1];      // how much of each flame's heat sits on its edges

  let S = null;

  // ─── Small helpers ──────────────────────────────────────────────────────────────────────
  const bump = (t, a, b) => Math.sin(Math.PI * seg(t, a, b));
  const quatA = new THREE.Quaternion(), quatB = new THREE.Quaternion(), quatC = new THREE.Quaternion();
  const eul = new THREE.Euler(), axX = new THREE.Vector3(1, 0, 0), axZ = new THREE.Vector3(0, 0, 1);
  const tmpV = new THREE.Vector3();

  /** Screen position of a point given in the mark group's local frame. */
  function toScreenLocal(p) {
    tmpV.set(p[0], p[1], p[2]).applyMatrix4(S.mark.group.matrixWorld);
    return RB.toScreen(S.camera, tmpV.x, tmpV.y, tmpV.z);
  }

  /** Slow push after the lock: a pure zoom about the frame centre, shared by 3D and 2D. */
  const pushAt = (t) => 1 + 0.03 * E.inOutSine(seg(t, K.lock, K.end));

  /** Camera: a low three-quarter glide that settles exactly on the lockup camera at the lock. */
  function shotAt(t) {
    const p = E.inOutCubic(seg(t, 0.3, K.lock));
    const yaw = lerp(13, 0, p) * DEG, pitch = lerp(-6, 0, p) * DEG;
    // close in on the makers, then pull back as they lock (decelerating onto the lockup camera)
    // a slow dolly in on the makers as they divide, then the pull back that lands on the lockup camera
    const dist = DIST * (t < 1.15 ? lerp(0.62, 0.52, E.inOutSine(seg(t, 0.25, 1.15))) : lerp(0.52, 1, E.inOutCubic(seg(t, 1.15, K.lock))));
    const fov0 = lerp(30, FOV, p);
    const fov = (2 * Math.atan(Math.tan((fov0 * DEG) / 2) / pushAt(t))) / DEG;
    return {
      pos: [dist * Math.sin(yaw) * Math.cos(pitch), dist * Math.sin(pitch), dist * Math.cos(yaw) * Math.cos(pitch)],
      look: [0, 0, 0], fov,
    };
  }

  /** Screen height of the swirl centre: S6's ember keeps rising, easing to a hover at the mark centre. */
  function centreScreenY(t) {
    if (t >= RISE_DUR) return L.markY;
    const u = t / RISE_DUR;
    return RISE.y - (RISE.y - L.markY) * (1 - (1 - u) * (1 - u)); // v(0) = RISE_V exactly
  }

  /** World position of the swirl centre: the ray through its screen point, met with the z = 0 plane. */
  function centreWorld(cam, t) {
    if (t >= K.lock) return new THREE.Vector3(0, MARK_Y, 0);
    const sy = centreScreenY(t);
    const p = new THREE.Vector3(0, 1 - (2 * sy) / R.H, 0.5).unproject(cam);
    const o = cam.position, d = p.sub(o);
    return o.clone().add(d.multiplyScalar(-o.z / d.z));
  }

  const spinAt = (t) => SPIN * (E.inOutSine(seg(t, K.split1, K.lock)) - 1);   // −1.25 turns → 0
  const tiltAt = (t) => TILT * (1 - E.inOutSine(seg(t, 1.3, 2.4)));
  const blendAt = (t) => E.inOutSine(seg(t, 1.3, 2.3));                     // orbit → exploded logo
  /** Exploded-logo spread: wide, then drawn in, arriving with speed; a small click inward at the lock. */
  function spreadAt(t) {
    if (t < K.lock) return 1 + 1.25 * (1 - E.inQuad(seg(t, K.forge, K.lock)));
    const u = seg(t, K.lock, K.lock + 0.5);
    return 1 - 0.028 * Math.sin(Math.PI * u) * (1 - u); // the pieces seat: a small inward click
  }
  function orbitRadius(t) {
    // the pair parts, holds close through the second division, then the orbit opens on the third tone
    return R.tween(t, [[K.split1, 0], [0.62, 0.08, E.outCubic], [0.72, 0.09], [K.open + 0.12, 0.46, E.inOutSine], [1.7, 0.6, E.inOutSine]]);
  }
  function orbitAngles(t) {
    const q = E.inOutCubic(seg(t, K.split2, 1.08));
    return [ORBIT_ANG[0], lerp(270 * DEG, ORBIT_ANG[1], q), lerp(90 * DEG, ORBIT_ANG[2] - 360 * DEG, q)];
  }

  /**
   * The formation in the mark's local frame at time t: each maker's offset from the centre.
   * Before the forge it is an orbit; it blends into the exploded logo, which spins down to
   * rotation 0 and contracts to the exact home positions at the lock.
   */
  function formation(t) {
    const psi = spinAt(t), tau = tiltAt(t), m = blendAt(t), k = spreadAt(t);
    const rho = orbitRadius(t), ang = orbitAngles(t);
    // depth staggers ease in during the swirl and out before the lock (continuous everywhere)
    const dzK = E.inOutSine(seg(t, 0.9, 1.5)) * (1 - E.inOutSine(seg(t, 1.6, 2.42)));
    const c = Math.cos(psi), s = Math.sin(psi);
    const pts = [];
    for (let i = 0; i < 3; i++) {
      const ox = rho * Math.cos(psi + ang[i]), oy = rho * Math.sin(psi + ang[i]);
      const hx = S.home[i].x * k, hy = S.home[i].y * k;
      const x = lerp(ox, hx * c - hy * s, m), y = lerp(oy, hx * s + hy * c, m);
      pts.push([x, y * Math.cos(tau), y * Math.sin(tau) + DZ[i] * dzK]);
    }
    return { pts, psi, tau };
  }

  // ─── Timelines for light and material ───────────────────────────────────────────────────
  const warmAt = (t) => E.inOutSine(seg(t, 1.2, K.lock));            // the room warms behind the makers
  /** Each rising tone lifts the dark a notch (a breath of light per maker), before the forge warms it. */
  const toneWarm = (t) => [K.split1, K.split2, K.open].reduce((acc, tk) =>
    acc + 0.15 * E.outCubic(seg(t, tk, tk + 0.55)) + (t > tk ? 0.1 * Math.exp(-(t - tk) * 7) : 0), 0);
  const glowAt = (t) => { const w = warmAt(t); return w + (1 - w) * toneWarm(t); };
  /** Ivory floods out of the mark from the lock: a quick first breath, then it pours to the edges. */
  const floodAt = (t) => { const u = seg(t, K.lock - 0.04, K.ivory); return 0.45 * E.outCubic(u) + 0.55 * E.inOutSine(u); };
  const ivoryAt = (t) => E.inOutSine(seg(t, 2.2, K.ivory));          // lighting towards the finale
  const envMixAt = (t) => E.inOutSine(seg(t, K.lock - 0.1, K.ivory));  // night studio → ivory studio reflections
  const flameScaleAt = (i, t) => E.outCubic(seg(t, K.forge + 0.07 * i, 2.28));
  /** The copper maker is the ember itself: it glows from within until the lock. The dark ones cool at the edges. */
  const heatAt = (i, t) => i === 0
    ? 1.15 * Math.pow(1 - seg(t, 1.3, 2.35), 1.6)
    : 1.25 * Math.pow(1 - seg(t, K.forge + 0.05, 2.1), 2.2);
  const sparkFadeAt = (t) => 1 - E.inOutSine(seg(t, 1.32, 1.95));

  /** Light sweeps (0..1 progress, amplitude): the lock sweep, then a slow one in the hold. */
  function sweepAt(t) {
    if (t < 4) return { p: seg(t, K.lock, 3.3), a: bump(t, K.lock, 3.3) };
    return { p: seg(t, 5.15, 7.05), a: 0.7 * bump(t, 5.15, 7.05) };
  }

  // ─── Posing the 3D mark ─────────────────────────────────────────────────────────────────
  function poseMark(t) {
    const shot = shotAt(t);
    S.camera.clearViewOffset(); // draw3D's sub-pixel jitter must not leak into this frame's projections
    RB.setCam(S.camera, shot);
    const g = S.mark.group;
    g.position.copy(centreWorld(S.camera, t));
    // the logo lands turned 3.5° and eases to face-on over the settle (≤ 4°)
    g.rotation.set(0, -3.5 * DEG * (1 - E.inOutSine(seg(t, K.lock, 5.6))), 0);
    g.scale.setScalar(1);

    const f = formation(t);
    const e = E.inOutCubic(seg(t, K.forge, 2.42));
    for (let i = 0; i < 3; i++) {
      const fl = S.mark.flames[i], p = f.pts[i], sc = flameScaleAt(i, t);
      fl.visible = sc > 0.002;
      fl.position.set(p[0], p[1], p[2]);
      fl.scale.setScalar(Math.max(1e-4, sc));
      // orientation = orbit tilt · formation spin · the flame's own tumble (→ identity at the lock)
      const tb = TUMBLE[i];
      eul.set(tb[0] * (1 - e), tb[1] * (1 - e), tb[2] * (1 - e));
      quatA.setFromAxisAngle(axX, f.tau);
      quatB.setFromAxisAngle(axZ, f.psi);
      quatC.setFromEuler(eul);
      fl.quaternion.copy(quatA).multiply(quatB).multiply(quatC);
      const m = S.flameMats[i];
      const hq = heatAt(i, t), hc = clamp(hq / 1.15);
      if (hc > 0.5) m.emissive.copy(HEAT_MID).lerp(HEAT_HOT, (hc - 0.5) * 2);
      else m.emissive.copy(HEAT_LOW).lerp(HEAT_MID, hc * 2);
      m.emissiveIntensity = hq;
      m.userData.rimHeat.value = RIM_HEAT[i];
      m.envMapIntensity = lerp(ENV_DARK[i], ENV_LIT[i], E.inOutSine(seg(t, 1.75, 2.3)));
      m.userData.envMix.value = envMixAt(t);
    }
    g.updateMatrixWorld(true);

    // light: dim workshop → bright room; a copper glow travels with the copper maker
    const lit = ivoryAt(t);
    S.key.intensity = lerp(1.3, 2.2, lit);
    S.rim.intensity = lerp(2.8, 1.7, lit);
    const glow = clamp(seg(t, K.forge, 1.5)) * (1 - E.inOutSine(seg(t, 2.0, 2.7)));
    // behind and above the copper maker: it rims its dark siblings instead of flaring its own face
    S.mark.flames[0].getWorldPosition(S.makerLight.position).add(tmpV.set(0, 0.12, -0.3));
    S.makerLight.intensity = 3.2 * glow;
    const sw = sweepAt(t);
    // the reflections turn a little with the sheen, so the bevels catch light as it passes
    const envTurn = 0.24 * Math.sin(Math.PI * 2 * E.inOutSine(sw.p)) * sw.a;
    // during the flight the studio light wheels round the makers (a moving softbox), so the
    // tumbling metal keeps catching glints; it comes to rest exactly at the lock
    const wheel = 1 - E.inOutSine(seg(t, K.forge, K.lock));
    for (const m of S.flameMats) m.envMapRotation.set(-0.35 * wheel, envTurn + 1.25 * wheel, 0);
    return f;
  }

  // ─── 2D: ground, glows, sparks ──────────────────────────────────────────────────────────
  /** Radial glow with a gaussian falloff (no visible edge). */
  function softGlow(ctx, x, y, r, color, a, op = 'screen', squash = 1) {
    if (a <= 0.001 || r <= 1) return;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r), e1 = Math.exp(-4.2);
    for (let k = 0; k <= 10; k++) {
      const u = k / 10;
      g.addColorStop(u, R.rgba(color, (a * (Math.exp(-4.2 * u * u) - e1)) / (1 - e1)));
    }
    ctx.save();
    ctx.globalCompositeOperation = op;
    ctx.translate(x, y); ctx.scale(1, squash);
    ctx.fillStyle = g; ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.restore();
  }

  function drawGround(ctx, t) {
    const warm = warmAt(t), flood = floodAt(t), glow = glowAt(t);
    if (flood >= 1) {
      ctx.fillStyle = PAL.ivory; ctx.fillRect(0, 0, R.W, R.H);
      return;
    }
    // the glow of the room drifts up with the rising ember, so the makers work in its heart
    const lift = E.inOutSine(seg(t, 0, 1.2));
    RB.atmos.backdrop(ctx, { gx: 960, gy: lerp(lerp(540, 450, lift), 440, warm), gr: lerp(900, 1150, warm), lift: lerp(0.7, 1, warm) });
    const cx = L.cx, cy = L.markY + 30;
    // pre-dawn: the makers' heat warms the room from the centre out (amber, the edges kept deep)
    softGlow(ctx, cx, cy, lerp(420, 1180, glow), '#7c4e31', 0.62 * glow, 'screen', 0.8);
    softGlow(ctx, cx, cy, lerp(240, 660, glow), '#f0bf8f', 0.42 * glow * glow, 'screen', 0.88);
    if (flood > 0) {
      // dawn: the whole room lifts through amber and peach (never through grey) ...
      const wash = R.ramp(['#6e4630', '#b27b53', '#dfbb96', '#ebdcc0'], flood);
      const wa = E.inOutSine(clamp(flood * 1.2));
      const w = ctx.createRadialGradient(cx, cy, 0, cx, cy, 1250);
      w.addColorStop(0, wash.replace(/,[^,]*\)$/, `,${wa})`));
      w.addColorStop(1, wash.replace(/,[^,]*\)$/, `,${wa * lerp(0.55, 1, flood)})`));
      ctx.fillStyle = w; ctx.fillRect(0, 0, R.W, R.H);
      // ... while ivory light pours out of the mark and fills it (solid core, very soft front)
      const r = lerp(240, 2600, flood), core = lerp(0.0, 0.46, flood);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, R.rgba(PAL.ivory, 1));
      for (let k = 0; k <= 8; k++) {
        const u = k / 8, v = core + (1 - core) * u, fall = (Math.exp(-4 * u * u) - Math.exp(-4)) / (1 - Math.exp(-4));
        g.addColorStop(v, R.mix('#f2d6b4', PAL.ivory, 1 - u * 0.85, fall));
      }
      ctx.save(); ctx.globalAlpha = clamp(flood * 3); ctx.fillStyle = g; ctx.fillRect(0, 0, R.W, R.H); ctx.restore();
    }
  }

  /** Soft luminous lift behind the lockup on ivory, so the ground reads as lit space, not a fill. */
  function drawIvoryLight(ctx, t, zoom) {
    const a = floodAt(t);
    if (a <= 0) return;
    ctx.save();
    const g = ctx.createRadialGradient(960, 470, 0, 960, 470, 980 * zoom);
    g.addColorStop(0, R.rgba('#fbf8ec', 0.62 * a));
    g.addColorStop(0.55, R.rgba('#f6f2e2', 0.22 * a));
    g.addColorStop(1, R.rgba('#f6f2e2', 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, R.W, R.H);
    // the room falls off warm towards its edges, so the vignette settles on sand, never olive-grey
    const e = ctx.createRadialGradient(960, 500, 560, 960, 500, 1240);
    e.addColorStop(0, R.rgba('#e2c6a0', 0)); e.addColorStop(1, R.rgba('#e2c6a0', 0.4 * a));
    ctx.fillStyle = e; ctx.fillRect(-200, -200, R.W + 400, R.H + 400);
    ctx.restore();
  }

  /**
   * A dark maker: a charcoal coal lit by the copper maker. Its body is dark; the side that faces
   * the copper ember burns as a hot crescent, and a thin copper rim closes the silhouette.
   */
  function darkEmber(ctx, x, y, r, a, lx, ly) {
    if (a <= 0.001 || r <= 0.05) return;
    let dx = lx - x, dy = ly - y; const dl = Math.hypot(dx, dy);
    if (dl < 1e-3) { dx = 1; dy = 0; } else { dx /= dl; dy /= dl; }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const h = ctx.createRadialGradient(x + dx * r * 0.6, y + dy * r * 0.6, 0, x, y, r * 5.5);
    h.addColorStop(0, R.rgba(PAL.copperHot, 0.42 * a)); h.addColorStop(0.3, R.rgba(PAL.copper, 0.15 * a)); h.addColorStop(1, R.rgba(PAL.copper, 0));
    ctx.fillStyle = h; ctx.fillRect(x - r * 5.5, y - r * 5.5, r * 11, r * 11);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = Math.min(1, a);
    const rb = r * 0.88;
    const body = ctx.createRadialGradient(x - dx * r * 0.3, y - dy * r * 0.3, 0, x, y, rb);
    body.addColorStop(0, '#2f2b27'); body.addColorStop(0.75, '#22211d'); body.addColorStop(1, '#171614');
    ctx.fillStyle = body; ctx.beginPath(); ctx.arc(x, y, rb, 0, Math.PI * 2); ctx.fill();
    // the lit crescent: a hot glow from the copper maker's side, clipped to the bead
    ctx.save();
    ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    const cx = x + dx * rb * 1.25, cy = y + dy * rb * 1.25;
    const c = ctx.createRadialGradient(cx, cy, rb * 0.55, cx, cy, rb * 1.35);
    c.addColorStop(0, R.rgba('#ffd2a8', 0.95 * a)); c.addColorStop(0.35, R.rgba(PAL.copperHot, 0.7 * a)); c.addColorStop(1, R.rgba(PAL.copperHot, 0));
    ctx.fillStyle = c; ctx.fillRect(x - rb, y - rb, rb * 2, rb * 2);
    ctx.restore();
    // a thin copper rim all round, so the dark side still reads against the dark room
    ctx.globalAlpha = 1;
    ctx.strokeStyle = R.rgba(PAL.copper, 0.45 * Math.min(1, a)); ctx.lineWidth = Math.max(0.8, r * 0.12);
    ctx.beginPath(); ctx.arc(x, y, rb, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  /**
   * Sparks thrown off as the ember divides (one small shower per rising tone), like a struck coal.
   * Deterministic: each shower is a fixed set of hashed sparks, integrated analytically.
   */
  const SHOWERS = [{ t: 0.4, from: 1, n: 10 }, { t: 0.7, from: 2, n: 10 }];
  function drawShowers(ctx, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    SHOWERS.forEach((sh, si) => {
      const age = t - sh.t;
      if (age < 0 || age > 0.75) return;
      const o = toScreenLocal(formation(sh.t).pts[sh.from]);
      for (let k = 0; k < sh.n; k++) {
        const h1 = R.hash(k, 300 + si * 7), h2 = R.hash(k, 301 + si * 7), h3 = R.hash(k, 302 + si * 7);
        const life = 0.32 + 0.4 * h3;
        const u = age / life;
        if (u >= 1) continue;
        const ang = h1 * Math.PI * 2, v0 = 150 + 230 * h2, drag = 5.5;
        // x(t) = v0/drag (1 − e^(−drag t)), with a little gravity pulling the arc down
        const d = (v0 / drag) * (1 - Math.exp(-drag * age));
        const g = 90 * age * age;
        const x = o[0] + Math.cos(ang) * d, y = o[1] + Math.sin(ang) * d + g;
        const sp = v0 * Math.exp(-drag * age);
        const tail = Math.min(12, sp * 0.028 + 1);
        const vx = Math.cos(ang) * sp, vy = Math.sin(ang) * sp + 180 * age, vl = Math.hypot(vx, vy) || 1;
        const al = (1 - u) * (1 - u) * (0.55 + 0.45 * h2);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - (vx / vl) * tail, y - (vy / vl) * tail);
        ctx.strokeStyle = R.rgba(PAL.copperHot, al * 0.3); ctx.lineWidth = 3.6; ctx.stroke();   // glow
        ctx.strokeStyle = R.rgba(u < 0.35 ? '#ffe6cc' : PAL.ember, al * 0.85); ctx.lineWidth = 1; ctx.stroke(); // core
      }
    });
    ctx.restore();
  }

  /** Where each maker's spark is, how big and how bright (the flames take over after the forge). */
  function sparkStates(t, f) {
    const born = [0, K.split1, K.split2];
    const fade = sparkFadeAt(t);
    const out = [];
    for (let i = 0; i < 3; i++) {
      if (t < born[i]) { out.push(null); continue; }
      const grow = i === 0 ? 1 : E.outCubic(seg(t, born[i], born[i] + 0.22));
      let r = i === 0 ? 12 - 1.8 * E.outCubic(seg(t, K.split1, K.split1 + 0.2)) - 0.8 * E.outCubic(seg(t, K.split2, K.split2 + 0.2)) : 10.5 * grow;
      // anticipation: the copper ember swells just before each division
      if (i === 0) r += 1.6 * bump(t, K.split1 - 0.14, K.split1 + 0.04) + 1.3 * bump(t, K.split2 - 0.14, K.split2 + 0.04);
      const flash = 0.55 * Math.exp(-Math.max(0, t - born[i]) * 9) * (i > 0 ? 1 : 0);
      out.push({ i, p: f.pts[i], r, a: fade * (i === 0 ? 1 : grow) + flash });
    }
    return out;
  }

  /** Light trails behind the swirling makers (analytic: the formation sampled back in time). */
  function drawTrails(ctx, t) {
    const amt = seg(t, K.split1 + 0.1, 0.9) * (1 - E.inOutSine(seg(t, 1.25, 1.7)));
    if (amt <= 0.001) return;
    const N = 22, dt = 0.015;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    const born = [0, K.split1, K.split2];
    const hist = [];
    for (let j = 0; j <= N; j++) hist.push(formation(Math.max(0, t - j * dt)).pts);
    for (let i = 0; i < 3; i++) {
      let prev = null;
      for (let j = 0; j <= N; j++) {
        if (t - j * dt < born[i] + 0.05) break;
        const s = toScreenLocal(hist[j][i]);
        if (prev) {
          const k = 1 - j / N, col = i === 0 ? PAL.ember : PAL.copperHot, a = (i === 0 ? 0.5 : 0.36) * amt * k * k;
          ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(s[0], s[1]);
          ctx.strokeStyle = R.rgba(PAL.copperHot, a * 0.22); ctx.lineWidth = (i === 0 ? 14 : 10) * (0.4 + 0.6 * k); ctx.stroke(); // glow
          ctx.strokeStyle = R.rgba(col, a); ctx.lineWidth = (i === 0 ? 3.2 : 2.4) * (0.35 + 0.65 * k); ctx.stroke();        // core
        }
        prev = s;
      }
    }
    ctx.restore();
  }

  /** Behind each forming flame: its own heat, so the dark flames read as silhouettes against it. */
  function drawForgeGlow(ctx, t, screens) {
    for (let i = 0; i < 3; i++) {
      const a = clamp(seg(t, K.forge, 1.45)) * (1 - E.inOutSine(seg(t, 1.9, 2.55))) * (1 - floodAt(t));
      if (a <= 0.001) continue;
      const [x, y] = screens[i], r = lerp(40, 190, flameScaleAt(i, t));
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, R.rgba(i === 0 ? PAL.ember : PAL.copperHot, 0.34 * a));
      g.addColorStop(0.5, R.rgba(PAL.copper, 0.12 * a));
      g.addColorStop(1, R.rgba(PAL.copper, 0));
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    }
  }

  /** The lock: a warm flash at the mark on the downbeat that opens into the dawn. */
  function drawLockFlash(ctx, t) {
    if (t < K.lock - 0.12 || t > K.lock + 0.9) return;
    const a = t < K.lock ? E.inQuad(seg(t, K.lock - 0.12, K.lock)) : Math.exp(-(t - K.lock) * 5);
    softGlow(ctx, L.cx, L.markY, 460 + 420 * E.outCubic(seg(t, K.lock, K.lock + 0.7)), '#fff3e2', 0.85 * a, 'screen', 0.92);
  }

  /**
   * A flame's front face on screen, as a 2D transform from SVG units: built from the real
   * camera and the flame's own pose, so 2D light sits exactly on the rendered logo (the push,
   * the seating click and the settle turn included). Meaningful once the flames face us.
   */
  function markFrontTransform(i) {
    const b = RB.MARK.bounds, s0 = 1 / (b.y1 - b.y0), cxS = (b.x0 + b.x1) / 2, cyS = (b.y0 + b.y1) / 2, zf = 0.057, d = 0.2;
    const fl = S.mark.flames[i], h = S.home[i];
    const P = (x, y) => { tmpV.set(x - h.x, y - h.y, zf).applyMatrix4(fl.matrixWorld); return RB.toScreen(S.camera, tmpV.x, tmpV.y, tmpV.z); };
    const O = P(0, 0), X = P(d, 0), Y = P(0, d);
    const ex = [(X[0] - O[0]) / d, (X[1] - O[1]) / d], ey = [(Y[0] - O[0]) / d, (Y[1] - O[1]) / d];
    return [s0 * ex[0], s0 * ex[1], -s0 * ey[0], -s0 * ey[1],
      O[0] - cxS * s0 * ex[0] + cyS * s0 * ey[0], O[1] - cxS * s0 * ex[1] + cyS * s0 * ey[1]];
  }

  /**
   * The light sweep: a narrow band of warm light that travels across the mark and lives on its
   * bevels (a thin ring just inside each flame's outline), with only a breath of it on the faces.
   */
  function drawSheen(ctx, t) {
    const sw = sweepAt(t);
    if (sw.a <= 0.01 || t < K.lock) return;
    const m = R.buffer('s7-sheen-mask', R.W, R.H);
    m.clear();
    const mg = m.ctx;
    S.paths.forEach((P, i) => {
      const M = markFrontTransform(i), unit = Math.hypot(M[0], M[1]); // px per SVG unit
      mg.save(); mg.transform(...M); mg.clip(P);
      mg.fillStyle = 'rgba(0,0,0,0.13)'; mg.fill(P);     // a breath on the face
      mg.lineWidth = 4.4 / unit; mg.strokeStyle = '#000'; mg.stroke(P); // the bevel ring
      mg.restore();
    });
    const b = R.buffer('s7-sheen', R.W, R.H);
    b.clear();
    const g = b.ctx, p = E.inOutSine(sw.p), h = L.markH * pushAt(t);
    const cx = lerp(L.cx - h * 0.95, L.cx + h * 0.95, p), cy = 540 - (540 - L.markY) * pushAt(t);
    g.save();
    g.translate(cx, cy); g.rotate(0.38);
    const bw = h * 0.24, gr = g.createLinearGradient(-bw, 0, bw, 0);
    gr.addColorStop(0, 'rgba(255,242,222,0)'); gr.addColorStop(0.4, 'rgba(255,242,222,0.5)');
    gr.addColorStop(0.5, 'rgba(255,250,238,1)'); gr.addColorStop(0.6, 'rgba(255,242,222,0.5)'); gr.addColorStop(1, 'rgba(255,242,222,0)');
    g.fillStyle = gr; g.fillRect(-bw, -h, bw * 2, h * 2);
    g.restore();
    g.globalCompositeOperation = 'destination-in';
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(m.canvas, 0, 0);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.9 * sw.a;
    ctx.drawImage(b.canvas, 0, 0, R.W, R.H);
    ctx.restore();
  }

  /** A soft, warm shadow of the mark on the ivory wall behind it (key light from the upper left). */
  function drawMarkShadow(ctx, t) {
    const a = floodAt(t);
    if (a <= 0.001) return;
    const h = L.markH, sc = h / S.shadow.markPx;
    const w = S.shadow.canvas.width * sc, hh = S.shadow.canvas.height * sc;
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.15 * a;
    ctx.drawImage(S.shadow.canvas, L.cx + 22 - w / 2, L.markY + 30 - hh / 2, w, hh);
    ctx.restore();
  }

  // ─── Type: the lockup ───────────────────────────────────────────────────────────────────
  function drawWordmark(ctx, t) {
    if (t < K.word) return;
    const p = E.outExpo(seg(t, K.word, K.word + 1.0));
    const size = L.wordSize, x = L.cx - S.wordInkOffset;
    ctx.save();
    ctx.beginPath();
    ctx.rect(L.cx - S.wordW / 2 - size, L.wordY - size * 1.02, S.wordW + size * 2, size * 1.3);
    ctx.clip();
    RB.wordmark(ctx, x, L.wordY + (1 - p) * size * 1.0, size, { color: INK, align: 'center', alpha: clamp(seg(t, K.word, K.word + 0.32)) });
    ctx.restore();
  }

  function drawTagline(ctx, T) {
    RB.type.line(ctx, T, {
      text: 'World-renewing craftsmanship.', x: L.cx - S.lineInkOffset, y: L.lineY, size: L.lineSize,
      family: 'body', weight: 500, color: INK_SOFT, align: 'center', tIn: T0 + K.line, stagger: 0.06, dur: 0.8,
    });
  }

  /**
   * The address, in the annotation voice (JetBrains Mono 500, open 0.18 em tracking, typed on
   * character by character), set at 32 px and in full-strength copper so it holds on ivory.
   */
  function drawUrl(ctx, T) {
    const tIn = T0 + K.url, text = 'ribhulabs.ai';
    if (T < tIn - 0.001) return;
    const n = Math.min(text.length, Math.floor(text.length * clamp(seg(T, tIn, tIn + text.length * 0.03))) + 1);
    const a = clamp(seg(T, tIn, tIn + 0.12));
    ctx.save();
    ctx.translate(L.cx, L.urlY);
    ctx.font = R.font(L.urlSize, 'mono', 500); ctx.letterSpacing = URL_TRACK; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillStyle = PAL.copper; ctx.globalAlpha = a;
    ctx.fillText(text.slice(0, n), -S.urlW / 2, 0);
    ctx.restore();
  }

  // The finale's key: a broad, soft shaft from the upper left (it also casts the mark's shadow).
  const SHAFT = { x: 470, y: -140, angle: -0.46, length: 1700, width: 900 };

  /** 0..1: how deep a point sits inside the light shaft (motes only show where the light is). */
  function inShaft(x, y) {
    const dx = x - SHAFT.x, dy = y - SHAFT.y, c = Math.cos(SHAFT.angle), s = Math.sin(SHAFT.angle);
    const lx = dx * c + dy * s, ly = -dx * s + dy * c;
    if (ly <= 0 || ly >= SHAFT.length) return 0;
    const hw = lerp(0.12, 0.5, ly / SHAFT.length) * SHAFT.width;
    return (1 - R.smoothstep(0.35, 1.05, Math.abs(lx) / hw)) * (1 - R.smoothstep(0.55, 1, ly / SHAFT.length));
  }

  /**
   * Warm motes glinting in the finale's light (deterministic in absolute time; kept off the type).
   * On ivory a mote must be *light*, not a speck: a bright point with a faint warm glow around
   * it that twinkles as it turns in the beam; a few larger ones drift out of focus near the lens.
   */
  function drawMotes(ctx, T, a) {
    if (a <= 0.001) return;
    ctx.save();
    const W2 = R.W + 200, H2 = R.H + 200;
    for (let i = 0; i < 46; i++) {
      const h1 = R.hash(i, 71), h2 = R.hash(i, 72), h3 = R.hash(i, 73), h4 = R.hash(i, 74);
      const depth = 0.5 + h3;
      const x = -100 + ((h1 * W2 + T * (6 + 10 * h4) * depth + R.noise.n2(i * 1.31, T * 0.16) * 34) % W2 + W2) % W2;
      const y = -100 + ((h2 * H2 + T * (3 + 6 * h3) * depth + R.noise.n2(i * 2.17 + 5, T * 0.13) * 26) % H2 + H2) % H2;
      const offType = R.smoothstep(0, 60, Math.max(560 - x, x - 1360, 560 - y, y - 890)); // 0 over the lockup
      const w = inShaft(x, y) * offType;
      if (w <= 0.01) continue;
      const tw = Math.pow(0.5 + 0.5 * Math.sin(T * (1.1 + h3 * 1.6) + h4 * 6.28), 2);
      const soft = h4 > 0.82;
      if (soft) {
        // out of focus: a pale disc of light with a warm edge
        const r = 8 + 9 * h1, al = a * w * 0.32;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, R.rgba('#fffaf0', al)); g.addColorStop(0.75, R.rgba('#fff4e2', al * 0.8));
        g.addColorStop(0.92, R.rgba('#f1d2ae', al * 0.45)); g.addColorStop(1, R.rgba('#f1d2ae', 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        continue;
      }
      // in focus: a gilded glint (warm glow, bright core) that flares as it turns in the beam
      const r = 0.9 + 0.9 * h3, al = a * w * (0.3 + 0.7 * tw);
      const gl = ctx.createRadialGradient(x, y, 0, x, y, r * 4.5);
      gl.addColorStop(0, R.rgba('#e3a868', 0.5 * al)); gl.addColorStop(0.35, R.rgba('#eab57c', 0.2 * al)); gl.addColorStop(1, R.rgba('#eab57c', 0));
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, r * 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = R.rgba('#fff8ec', al); ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // ─── Build (once) ───────────────────────────────────────────────────────────────────────
  /**
   * Two studios for the flames' reflections, blended in the shader as the room turns to ivory.
   * Both keep the workshop's softbox layout, lit neutral-warm (not the workshop's orange cast),
   * so the copper face reads as the brand copper and the charcoal stays charcoal.
   *   night: a dark umber room; the metal lives on its glints (the flight).
   *   ivory: the finale's bright room; the extrusion's walls and the lower bevels reflect lit
   *          ivory, so the edges read as a crafted object and never as a dark outline.
   * The face reflects the front fill, which is the same in both, so the face colour holds.
   */
  function studioEnv(ivory) {
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(new THREE.BoxGeometry(24, 14, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(ivory ? '#b8ad98' : '#4a3d33'), side: THREE.BackSide })));
    const panel = (w, h, color, k, pos) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(pos[0], pos[1], pos[2]); m.lookAt(0, 0, 0); scene.add(m);
    };
    panel(8, 6, '#fff6ea', 7.0, [-6, 6, 5]);      // key softbox, high front-left (the upper-left bevels catch it)
    panel(1.4, 9, '#ffe2c6', 5.0, [7, 2.5, -4]);  // copper-warm rim strip, right-back
    panel(9, 1.2, '#fff4e6', 2.2, [0, 6.5, -7]);  // top-back strip
    panel(24, 3, '#b9b19d', 0.9, [0, -6.5, 0]);   // floor bounce
    panel(12, 7, ivory ? '#eeefec' : '#f1eee3', 1.45, [1, 2.5, 10]);  // broad front fill (what the face reflects)
    panel(18, 0.5, '#fffaf0', 6.0, [0, 1.6, 9]);  // horizon strip: the product-shot line
    panel(4, 2.5, '#fff1e2', 3.0, [5, 4, 7]);     // front-right accent
    if (ivory) {
      panel(22, 12, '#eee6d2', 1.15, [0, 0, -11]); // the ivory wall behind the mark (the walls and edges see it)
      panel(7, 4, '#f3dcc2', 1.3, [5.5, -5, 5]);   // low warm bounce card: the lower-right bevels stay copper
    }
    const pm = new THREE.PMREMGenerator(RB.gl.renderer());
    const tex = pm.fromScene(scene, 0.035).texture;
    pm.dispose();
    return tex;
  }

  /**
   * Shader additions for the flames (the lit result is unchanged when both are at rest):
   *  · heat that lives on the edges: the emissive is scaled by a view-angle (fresnel) term, so a
   *    cooling flame glows at its bevels while its face turns to metal (emissive is 0 from the lock);
   *  · the reflection blends from the night studio to the ivory studio (uEnvMix).
   */
  function addShaderMods(mat, envIvory) {
    mat.userData.rimHeat = { value: 0 };
    mat.userData.envMix = { value: 0 };
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uRimHeat = mat.userData.rimHeat;
      sh.uniforms.uEnvMix = mat.userData.envMix;
      sh.uniforms.envMap2 = { value: envIvory };
      const pars = THREE.ShaderChunk.envmap_physical_pars_fragment
        .replace('vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );',
          'vec4 envMapColor = mix( textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 ), textureCubeUV( envMap2, envMapRotation * worldNormal, 1.0 ), uEnvMix );')
        .replace('vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );',
          'vec4 envMapColor = mix( textureCubeUV( envMap, envMapRotation * reflectVec, roughness ), textureCubeUV( envMap2, envMapRotation * reflectVec, roughness ), uEnvMix );');
      if (!/envMap2/.test(pars)) throw new Error('s7: env blend patch did not apply');
      sh.fragmentShader = 'uniform float uRimHeat;\nuniform float uEnvMix;\nuniform sampler2D envMap2;\n' + sh.fragmentShader
        .replace('#include <envmap_physical_pars_fragment>', pars)
        .replace('#include <emissivemap_fragment>',
          '#include <emissivemap_fragment>\n\t{ float fr = 1.0 - saturate( abs( dot( normal, normalize( vViewPosition ) ) ) );\n' +
          '\t  totalEmissiveRadiance *= mix( 1.0, 0.03 + 3.4 * pow( fr, 3.2 ), uRimHeat ); }');
    };
    mat.customProgramCacheKey = () => 'ribhu-s7-flame';
  }

  /**
   * The kit's RB.mark3D bevels outward, so its silhouette is ~2.5 px fatter than the logo at this
   * size and the logo's gaps close up (reported as a kit issue). Same paths, same depth and bevel,
   * the bevel turned inward (bevelOffset = −bevelSize): the outline is now the SVG outline exactly.
   * Each flame keeps the kit's pivot and home, so the world position of every point is unchanged.
   */
  function markShapeExact(d) {
    const b = RB.MARK.bounds, s = 1 / (b.y1 - b.y0), cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
    const X = (x) => (x - cx) * s, Y = (y) => -(y - cy) * s;
    const tok = d.match(/[MCZ]|-?\d*\.?\d+/g), shape = new THREE.Shape();
    let i = 0, cmd = '';
    while (i < tok.length) {
      if (/[MCZ]/.test(tok[i])) cmd = tok[i++];
      if (cmd === 'M') { shape.moveTo(X(+tok[i]), Y(+tok[i + 1])); i += 2; }
      else if (cmd === 'C') { shape.bezierCurveTo(X(+tok[i]), Y(+tok[i + 1]), X(+tok[i + 2]), Y(+tok[i + 3]), X(+tok[i + 4]), Y(+tok[i + 5])); i += 6; }
      else if (cmd === 'Z') { shape.closePath(); }
      else i++;
    }
    return shape;
  }
  /**
   * Extrude one flame with its bevel turned inward, so the outline is the SVG outline exactly.
   * The inset is clamped by the flame's local half-width, so at the sharp tips the bevel fades to
   * nothing instead of folding over itself; the tips stay as sharp as they are drawn.
   * Same depth and bevel profile as the kit (depth 0.09, bevel 0.012 deep × 0.0084 wide).
   */
  function extrudeExact(shape, { depth = 0.09, bevelT = 0.012, bevelW = 0.0084, segs = 5, n = 900 } = {}) {
    let P = shape.getSpacedPoints(n).slice(0, n);
    if (THREE.ShapeUtils.isClockWise(P)) P = P.reverse();
    const N = P.length;
    // inward normals (CCW contour: inward = left of travel)
    const nx = new Float32Array(N), ny = new Float32Array(N), inset = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const a = P[(i - 1 + N) % N], b = P[i], c = P[(i + 1) % N];
      let ex = c.x - a.x, ey = c.y - a.y; const l = Math.hypot(ex, ey) || 1;
      nx[i] = -ey / l; ny[i] = ex / l;
    }
    // local half-width: march along the inward normal to the opposite side of the flame
    for (let i = 0; i < N; i++) {
      let best = Infinity;
      const ox = P[i].x, oy = P[i].y, dx = nx[i], dy = ny[i];
      for (let j = 0; j < N; j++) {
        if (Math.abs(j - i) < 3 || Math.abs(j - i) > N - 3) continue;
        const a = P[j], b = P[(j + 1) % N];
        const sx = b.x - a.x, sy = b.y - a.y, den = dx * sy - dy * sx;
        if (Math.abs(den) < 1e-12) continue;
        const qx = a.x - ox, qy = a.y - oy;
        const tr = (qx * sy - qy * sx) / den, u = (qx * dy - qy * dx) / den;
        if (tr > 1e-6 && u >= 0 && u <= 1 && tr < best) best = tr;
      }
      inset[i] = Math.min(bevelW, 0.42 * best);
    }
    // soften the clamp along the contour so the bevel narrows smoothly into each tip
    for (let pass = 0; pass < 3; pass++) {
      const cp = inset.slice();
      for (let i = 0; i < N; i++) inset[i] = Math.min(cp[i], (cp[(i - 1 + N) % N] + 2 * cp[i] + cp[(i + 1) % N]) / 4);
    }
    // rings: front bevel (face edge → wall), wall, back bevel (wall → back face edge)
    const prof = [];
    for (let k = 0; k <= segs; k++) { const th = (k / segs) * Math.PI / 2; prof.push([1 - Math.sin(th), depth / 2 + bevelT * Math.cos(th)]); }
    for (let k = segs; k >= 0; k--) { const th = (k / segs) * Math.PI / 2; prof.push([1 - Math.sin(th), -depth / 2 - bevelT * Math.cos(th)]); }
    const R2 = prof.length, pos = [], idx = [];
    for (let r = 0; r < R2; r++) for (let i = 0; i < N; i++) {
      const w = prof[r][0] * inset[i];
      pos.push(P[i].x + nx[i] * w, P[i].y + ny[i] * w, prof[r][1]);
    }
    for (let r = 0; r < R2 - 1; r++) for (let i = 0; i < N; i++) {
      const a = r * N + i, b = r * N + ((i + 1) % N), c = (r + 1) * N + i, d = (r + 1) * N + ((i + 1) % N);
      idx.push(a, c, b, b, c, d);
    }
    const band = new THREE.BufferGeometry();
    band.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    band.setIndex(idx);
    band.computeVertexNormals();
    // caps: the inset face outline, flat
    const face = P.map((p, i) => new THREE.Vector2(p.x + nx[i] * inset[i], p.y + ny[i] * inset[i]));
    const tris = THREE.ShapeUtils.triangulateShape(face, []);
    const cap = (z, flip) => {
      const g = new THREE.BufferGeometry(), cp = [], cn = [];
      for (const t of tris) {
        const o = flip ? [t[0], t[2], t[1]] : t;
        for (const k of o) { cp.push(face[k].x, face[k].y, z); cn.push(0, 0, flip ? -1 : 1); }
      }
      g.setAttribute('position', new THREE.Float32BufferAttribute(cp, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(cn, 3));
      return g;
    };
    const top = depth / 2 + bevelT;
    return ADD.mergeGeometries([band.toNonIndexed(), cap(top, false), cap(-top, true)]);
  }

  function exactFlames() {
    RB.MARK.paths.forEach((p, i) => {
      const geo = extrudeExact(markShapeExact(p.d));
      const h = S.mark.home[i];
      geo.translate(-h.x, -h.y, -h.z);
      const mesh = S.mark.flames[i].children[0];
      mesh.geometry.dispose();
      mesh.geometry = geo;
    });
  }

  function buildShadow() {
    const markPx = 420, pad = 80;
    const b = RB.MARK.bounds, w = Math.ceil(markPx * (b.x1 - b.x0) / (b.y1 - b.y0)) + pad * 2, h = markPx + pad * 2;
    const src = document.createElement('canvas'); src.width = w; src.height = h;
    const sg = src.getContext('2d');
    const tone = '#8a6f5c';
    RB.mark2D(sg, w / 2, h / 2, markPx, { fills: [tone, tone, tone] });
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    const g = canvas.getContext('2d');
    g.filter = 'blur(22px)'; g.drawImage(src, 0, 0); g.filter = 'none';
    return { canvas, markPx };
  }

  function measureType() {
    const c = document.createElement('canvas').getContext('2d');
    c.font = R.font(L.wordSize, 'display', 500); c.letterSpacing = `${(-0.04 * L.wordSize).toFixed(2)}px`; c.textAlign = 'center';
    let m = c.measureText('Ribhu Labs');
    S.wordW = m.width;
    S.wordInkOffset = (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2; // centre the ink, not the advance
    c.font = R.font(L.lineSize, 'body', 500); c.letterSpacing = `${-0.018 * L.lineSize}px`; c.textAlign = 'center';
    m = c.measureText('World-renewing craftsmanship.');
    S.lineInkOffset = (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
    c.font = R.font(L.urlSize, 'mono', 500); c.letterSpacing = URL_TRACK; c.textAlign = 'left';
    S.urlW = c.measureText('ribhulabs.ai').width - parseFloat(URL_TRACK); // centre the ink, not the trailing track
  }

  // ─── Draw ───────────────────────────────────────────────────────────────────────────────
  function draw(ctx, t, env) {
    const T = env.T;
    const zoom = pushAt(t);
    const f = poseMark(t);

    drawGround(ctx, t);
    // everything that lives in the lockup plane shares the slow push about the frame centre
    ctx.save();
    ctx.translate(960, 540); ctx.scale(zoom, zoom); ctx.translate(-960, -540);
    drawIvoryLight(ctx, t, 1);
    if (floodAt(t) > 0.01) RB.atmos.shaft(ctx, { ...SHAFT, alpha: 0.5 * floodAt(t), color: '#fff7e8' });
    drawMarkShadow(ctx, t);
    ctx.restore();

    // dust in the warming light (screen motes read on the dark; they hand over to warm motes on ivory)
    const dustA = glowAt(t) * (1 - floodAt(t));
    if (dustA > 0.01) RB.atmos.dust(ctx, T, { count: 60, seed: 77, alpha: 0.5 * dustA, rect: [360, 60, 1200, 760] });

    // sparks, trails and forge glows (behind the flames)
    const flameScreens = S.mark.flames.map((fl) => {
      fl.getWorldPosition(tmpV);
      return RB.toScreen(S.camera, tmpV.x, tmpV.y, tmpV.z);
    });
    drawTrails(ctx, t);
    drawShowers(ctx, t);
    drawForgeGlow(ctx, t, flameScreens);
    const sparks = sparkStates(t, f).filter(Boolean)
      .map((s) => ({ ...s, scr: toScreenLocal(s.p) }))
      .sort((a, b) => a.p[2] - b.p[2]);
    const lead = sparks.find((s) => s.i === 0);
    for (const s of sparks) {
      const depth = 1 + 0.45 * clamp(s.p[2] / 0.6, -1, 1);
      if (s.a <= 0.001) continue;
      if (s.i === 0) RB.fx.ember(ctx, s.scr[0], s.scr[1], s.r * depth, { intensity: Math.min(1.4, s.a) });
      else darkEmber(ctx, s.scr[0], s.scr[1], s.r * depth, Math.min(1.3, s.a), lead ? lead.scr[0] : 960, lead ? lead.scr[1] : 386);
    }

    // the mark
    drawLockFlash(ctx, t); // behind the mark: it locks as a silhouette against a burst of light
    RB.draw3D(ctx, S.scene, S.camera, { exposure: 1 });
    drawSheen(ctx, t);

    // lockup type
    ctx.save();
    ctx.translate(960, 540); ctx.scale(zoom, zoom); ctx.translate(-960, -540);
    drawWordmark(ctx, t);
    drawTagline(ctx, T);
    drawUrl(ctx, T);
    ctx.restore();

    // motes drift in the light through the hold and settle out with the music's tail, so the
    // last frame (the hero still) is clean
    drawMotes(ctx, T, E.inOutSine(seg(t, 2.8, 3.8)) * (1 - E.inOutSine(seg(t, 6.8, 7.4))));
  }

  R.scene({
    id: 'mark', index: 7, label: 'The mark', start: 22.5, end: 30,
    init() {
      S = RB.stage({ fov: FOV });
      S.mark = RB.mark3D();
      S.scene.add(S.mark.group);
      S.home = S.mark.home.map((v) => v.clone());
      S.paths = RB.MARK.paths.map((p) => new Path2D(p.d));
      exactFlames();
      S.flameMats = S.mark.flames.map((fl) => fl.children[0].material);
      const night = studioEnv(false), ivory = studioEnv(true);
      S.flameMats.forEach((m) => { m.envMap = night; addShaderMods(m, ivory); });
      S.makerLight = new THREE.PointLight('#ffae78', 0, 0, 2);
      S.scene.add(S.makerLight);
      S.shadow = buildShadow();
      RB.setCam(S.camera, shotAt(K.lock));
      RB.gl.renderer().compile(S.scene, S.camera); // compile the flame programs now, not mid-shot
      RB.gl.render3D(S.scene, S.camera);           // and upload the geometry and both studios
      measureType();
    },
    draw,
    post: (t) => {
      const w = floodAt(t); // post follows the light: a black vignette must not linger on ivory
      return { bloom: lerp(0.35, 0.12, w), vignette: lerp(0.42, 0.16, w), grain: R.grain * lerp(1, 0.75, w) };
    },
  });
})();
