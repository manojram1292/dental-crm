/*
 * S1 · THE TALE · 0.0–5.0 s (frames 0–149)
 *
 * A museum reveal of a precious object, then the tale in three sparks.
 *
 *   0.00–0.35  Black. Room tone. The camera is already creeping in.
 *   0.35–1.00  A thin warm line of light runs along the lip of the unseen cup, left to
 *              right: a copper glint with a comet tail, lighting the real rim as it goes.
 *   1.00       Cup strike #1. The traced lip flares; the rim light catches the silhouette,
 *              then the shaft (upper left) and the key rise, dust turning in the beam, and
 *              the cup emerges on a dark stone plinth. Cup right of centre, story column left.
 *   0.35–2.40  "One of the oldest stories / is about makers."
 *   2.50 · 3.125 · 3.75   Three sparks ignite, one per beat, as the lines land: a dark ember
 *              with a copper rim (left), a second dark ember (right), and the copper ember
 *              above the mouth: the logo's three flames. They circle the cup like makers at
 *              work, leaving faint trails and lighting the copper as they pass.
 *   2.55 / 3.15 → 4.25   "Three brothers." / "One cup."
 *   4.375      Last beat of the bar: the sparks spiral into one braided vortex over the
 *              mouth and dive into the cup (lip crossed ≈ 4.7). The cup glows from within
 *              for a moment. The plinth, beam and dust go dark, and the camera settles.
 *   4.967      (frame 149) Hand-off: exactly RB.shots.cupHero.
 *
 * Contracts
 *   IN   frame 0 is black (the room, the cup and the type all come out of darkness).
 *   OUT  frame 149 → S2: cup at the world origin with rotation 0; camera exactly
 *        RB.shots.cupHero; RB.atmos.backdrop() defaults; stage-default key/rim/env;
 *        no text, no plinth (fully faded by 4.9), no shaft or dust; inner glow ≤ 0.2
 *        (0.064 at frame 149).
 */
(function () {
  'use strict';
  const R = window.REEL, RB = window.RB, THREE = window.THREE;
  const { PAL, E, clamp, lerp, seg } = R;
  const TAU = Math.PI * 2;

  // ─── Timing (absolute seconds; one beat = 0.625 s) ───────────────────────────
  const T_END = 149 / 30;              // last frame of the scene: the hand-off pose is exact here
  const TRACE = [0.35, 1.0];           // the glint crosses the lip; it lands on cup strike #1
  const STRIKE = 1.0;
  const IGNITE = [2.5, 3.125, 3.75];   // one spark per beat
  const SPIRAL = 4.375;                // the last beat of the bar
  const BRAID = 4.62;                  // the three are braided over the mouth
  const SPIN = 34;                     // rad/s of extra spin once braided
  const DIVE = [4.6, 4.76];            // plunge window (staggered per spark)
  const GLOW = { rise: [4.68, 4.76], tau: 0.075 };
  const FADE_WORLD = [4.3, 4.9];       // plinth, beam and dust go dark

  // ─── Hand-off shot ──────────────────────────────────────────────────────────
  const HERO = RB.shots.cupHero;
  const HERO_D = Math.hypot(HERO.pos[1] - HERO.look[1], HERO.pos[2] - HERO.look[2]);
  const HERO_EL = Math.atan2(HERO.pos[1] - HERO.look[1], HERO.pos[2] - HERO.look[2]);
  const HALF_FOV_TAN = (fov) => Math.tan((fov * Math.PI) / 360);

  // ─── Stage geometry constants ───────────────────────────────────────────────
  const RIM_R = 0.607, RIM_Y = 0.908;  // the lip the glint runs along
  const MOUTH = [0, 0.93, 0];
  const PLINTH = { w: 1.5, h: 3.4, d: 1.5 };
  const KEY_RAKE = [-4.6, 2.6, 1.9];    // tale key: low, raking across the hammered bowl
                                       // (RB.stage()'s own key position is restored for the hand-off)
  const CUP_SEGMENTS = 160;            // RB.cup()'s default lathe segments

  // The three makers. Orbits are tilted circles around the cup (world units, cup at origin).
  // θ decreases over time: in front of the cup they travel left → right.
  const SPARKS = [
    { kind: 'dark', tIgn: IGNITE[0], r: 0.84, cy: 0.6, tilt: 0.26, yaw: 0.28, w: -0.95, th0: Math.PI + 0.18, size: 0.028, light: 0.006, bob: 0.0 },
    { kind: 'dark', tIgn: IGNITE[1], r: 0.84, cy: 0.74, tilt: 0.36, yaw: -0.5, w: -1.1, th0: 0.05, size: 0.028, light: 0.006, bob: 2.1 },
    { kind: 'copper', tIgn: IGNITE[2], r: 0.32, cy: 1.24, tilt: 0.14, yaw: 0.0, w: -1.55, th0: Math.PI / 2, size: 0.025, light: 0.014, bob: 4.2 },
  ];

  let S = null; // everything built once in init()

  // ─── Small maths ────────────────────────────────────────────────────────────
  const smooth = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
  const rotX = (p, a) => [p[0], p[1] * Math.cos(a) - p[2] * Math.sin(a), p[1] * Math.sin(a) + p[2] * Math.cos(a)];
  const rotY = (p, a) => [p[0] * Math.cos(a) + p[2] * Math.sin(a), p[1], -p[0] * Math.sin(a) + p[2] * Math.cos(a)];

  // ─── Camera: one continuous move (push in from front-left, then glide onto hero) ─
  /**
   * Shot at absolute time T. Channels: distance to the look point, azimuth, elevation,
   * look height and a lateral screen offset that holds the cup right of centre.
   * One unbroken dolly from the first frame to the last: the push-in and the quarter
   * orbit share a single decelerating curve (never a dead frame, never a lunge), so the
   * cup arrives at hero scale as the tale ends. The only late move is the lateral glide
   * that re-centres the cup as the sparks dive: a weighted curve that sets off on the
   * text's exit, peaks early and lands softly (zero velocity and acceleration) on frame
   * 149, which is exactly cupHero.
   */
  const PUSH_D0 = 5.0;
  const GLIDE = [4.2, T_END];
  const pushAt = (T) => { const u = clamp(T / T_END); return 1 - (1 - u) * (1 - u); };
  const landing = (s) => s * s * (6 - 8 * s + 3 * s * s); // ∫ s(1−s)²: early peak, long soft landing
  function shotAt(T) {
    if (T >= T_END) return { pos: HERO.pos.slice(), look: HERO.look.slice(), fov: HERO.fov };
    const p = pushAt(T), glide = landing(seg(T, GLIDE[0], GLIDE[1]));
    const D = lerp(PUSH_D0, HERO_D, p);
    const az = lerp(-0.36, 0, p);
    const el = lerp(0.2, HERO_EL, p);
    const ly = lerp(0.4, HERO.look[1], p);
    const dx = 350 * (1 - glide);                         // cup right of centre (logical px)
    const ox = (dx * 2 * HALF_FOV_TAN(HERO.fov) * D) / R.H; // → world units at the look plane
    const right = [Math.cos(az), 0, -Math.sin(az)];
    const look = [-ox * right[0], ly, -ox * right[2]];
    const pos = [look[0] + D * Math.sin(az) * Math.cos(el), ly + D * Math.sin(el), look[2] + D * Math.cos(az) * Math.cos(el)];
    return { pos, look, fov: HERO.fov };
  }

  /** The cup's slow turntable rotation; exactly 0 from frame 149. */
  const cupYaw = (T) => (T >= T_END ? 0 : 0.5 * (1 - E.inOutSine(seg(T, 0, T_END))));

  // ─── Light levels over time ────────────────────────────────────────────────
  function lightsAt(T) {
    const trace = seg(T, TRACE[0] - 0.05, TRACE[0] + 0.1) * (1 - E.inOutSine(seg(T, 1.05, 1.9)));
    const rim = E.outCubic(seg(T, 0.96, 1.6));
    const key = E.inOutSine(seg(T, 0.98, 2.6));
    const envTale = lerp(0.03 * seg(T, 0.45, 0.9), 1.12, E.inOutSine(seg(T, 0.95, 2.8)));
    const envOut = E.inOutSine(seg(T, 4.2, 4.9));
    const env = envOut >= 1 ? 1 : lerp(envTale, 1, envOut); // exactly the stage default from 4.9
    const ground = E.inOutSine(seg(T, 0.55, 1.7));      // the room itself comes out of black
    const worldOut = E.inOutSine(seg(T, FADE_WORLD[0], FADE_WORLD[1]));
    const beam = E.inOutSine(seg(T, 0.7, 2.1)) * (1 - worldOut);
    const spot = E.inOutSine(seg(T, 0.9, 2.3)) * (1 - E.inOutSine(seg(T, 4.25, 4.85)));
    // During the tale the key rakes low across the hammered bowl (museum light); it swings
    // back to the stage position as the plinth goes, so the hand-off frame is standard.
    const keyHome = E.inOutSine(seg(T, 4.15, 4.9));
    // The bowl's outer surface faces down, so it mirrors the dark floor of the kit's room.
    // During the tale the room is pitched so the warm front panels fall across the upper
    // bowl (the hammered texture comes alive), sliding slowly; exactly 0 for the hand-off.
    const envPitch = lerp(0.78, 0.56, E.inOutSine(seg(T, 0.9, 4.1))) * (1 - E.inOutSine(seg(T, 4.2, 4.9)));
    return { trace, rim, key, keyHome, env, envPitch, ground, beam, spot, worldOut };
  }

  /** Inner glow after the sparks enter: fast rise, quick decay (≈0.064 at frame 149). */
  function glowAt(T) {
    if (T < GLOW.rise[0]) return 0;
    return E.outCubic(seg(T, GLOW.rise[0], GLOW.rise[1])) * Math.exp(-Math.max(0, T - GLOW.rise[1]) / GLOW.tau);
  }

  // ─── Spark paths (pure functions of T) ─────────────────────────────────────
  /** World position of spark i at time T (valid for T ≥ its ignition), plus whether it is inside the cup. */
  function sparkPos(i, T) {
    const s = SPARKS[i];
    const pS = seg(T, SPIRAL, BRAID), q = E.inOutSine(pS);
    // Circling, then spun up as the orbit tightens (extra angular velocity SPIN·p², held
    // through the plunge): one continuous angle, so the trails stay smooth curves.
    const spin = SPIN * ((BRAID - SPIRAL) * pS * pS * pS / 3 + Math.max(0, T - BRAID));
    const th = s.th0 + s.w * (T - s.tIgn) - spin;
    const r = lerp(s.r, 0.085, q);
    const cy = lerp(s.cy + 0.035 * Math.sin(T * 1.9 + s.bob), 1.12, q); // gather above the mouth (anticipation)
    const tilt = lerp(s.tilt, 0, q), yaw = lerp(s.yaw, 0, q);
    let p = [r * Math.cos(th), 0, r * Math.sin(th)];
    p = rotY(rotX(p, tilt), yaw);
    p[1] += cy;
    // the plunge: accelerate down through the mouth, the braid closing
    const d0 = DIVE[0] + i * 0.03, d1 = DIVE[1] + i * 0.03;
    const pd = E.inCubic(seg(T, d0, d1));
    if (pd > 0) {
      const k = 1 - pd * 0.8;
      p = [p[0] * k, lerp(p[1], 0.42, pd), p[2] * k];
    }
    return { p, inside: T > d1 };
  }

  // ─── Cup solid (for spark occlusion) ───────────────────────────────────────
  /** Build radius-at-height tables from the cup's own lathe geometry (column φ = 0). */
  function cupProfile(cup) {
    const col = (mesh) => {
      const pos = mesh.geometry.attributes.position, n = pos.count / (CUP_SEGMENTS + 1), out = [];
      for (let j = 0; j < n; j++) out.push([Math.hypot(pos.getX(j), pos.getZ(j)), pos.getY(j)]);
      return out;
    };
    const outer = col(cup.outer).concat(col(cup.rim)), inner = col(cup.inner);
    const N = 240, H = RB.CUP.height, rOut = new Float32Array(N + 1), rIn = new Float32Array(N + 1);
    // widest radius of the profile at each height
    const sample = (pts, table) => {
      for (let k = 0; k <= N; k++) {
        const y = (k / N) * H;
        let best = 0;
        for (let j = 1; j < pts.length; j++) {
          const [ra, ya] = pts[j - 1], [rb, yb] = pts[j];
          if ((y - ya) * (y - yb) > 0 || ya === yb) continue;
          const rr = lerp(ra, rb, (y - ya) / (yb - ya));
          best = Math.max(best, rr);
        }
        table[k] = best;
      }
    };
    sample(outer, rOut);
    sample(inner, rIn);
    for (let k = 0; k <= N; k++) if (rOut[k] <= 0) rOut[k] = k < N / 2 ? 0.3 : RB.CUP.rimRadius;
    const bottom = Math.min(...inner.map((v) => v[1]));
    return { N, H, rOut, rIn, bottom };
  }
  /** Is a world point inside the copper (walls, stem or foot)? */
  function inCopper(x, y, z) {
    const P = S.profile;
    if (y < 0 || y > P.H) return false;
    const k = Math.min(P.N, Math.round((y / P.H) * P.N)), r = Math.hypot(x, z);
    if (r > P.rOut[k]) return false;
    if (y > P.bottom && P.rIn[k] > 0 && r < P.rIn[k]) return false; // the hollow of the bowl
    if (y > 0.9 && r < 0.585) return false;                          // the open mouth
    return true;
  }
  /** Line of sight from the camera to a world point, marched through the cup's bounding box. */
  function visible(cam, p) {
    const dx = p[0] - cam[0], dy = p[1] - cam[1], dz = p[2] - cam[2];
    // clip the segment to the box |x|,|z| ≤ 0.62, 0 ≤ y ≤ 0.92
    let t0 = 0, t1 = 1;
    const slab = (o, d, lo, hi) => {
      if (Math.abs(d) < 1e-9) return o >= lo && o <= hi;
      let a = (lo - o) / d, b = (hi - o) / d; if (a > b) [a, b] = [b, a];
      t0 = Math.max(t0, a); t1 = Math.min(t1, b); return t0 <= t1;
    };
    if (!slab(cam[0], dx, -0.62, 0.62) || !slab(cam[1], dy, 0, 0.92) || !slab(cam[2], dz, -0.62, 0.62)) return true;
    const len = Math.hypot(dx, dy, dz) * (t1 - t0), steps = Math.max(2, Math.ceil(len / 0.005));
    for (let k = 0; k <= steps; k++) {
      const t = lerp(t0, t1, k / steps);
      if (t >= 0.999) break;
      if (inCopper(cam[0] + dx * t, cam[1] + dy * t, cam[2] + dz * t)) return false;
    }
    return true;
  }

  // ─── Projection ─────────────────────────────────────────────────────────────
  /** Screen position (logical px), depth and px-per-world-unit of a world point. */
  function project(p) {
    const cam = S.camera, [x, y] = RB.toScreen(cam, p[0], p[1], p[2]);
    const fwd = S.fwd, c = cam.position;
    const depth = (p[0] - c.x) * fwd.x + (p[1] - c.y) * fwd.y + (p[2] - c.z) * fwd.z;
    return { x, y, depth, ppu: R.H / 2 / HALF_FOV_TAN(cam.fov) / Math.max(0.05, depth) };
  }

  // ─── Build (once) ───────────────────────────────────────────────────────────
  /** Average the normals on the lathe's φ=0 / φ=2π seam (RB.cup recomputes normals after
   *  hammering, which leaves a visible line facing the camera at rotation 0). */
  function weldLatheSeam(mesh, segments = CUP_SEGMENTS) {
    const nrm = mesh.geometry.attributes.normal, n = nrm.count / (segments + 1);
    for (let j = 0; j < n; j++) {
      const a = j, b = segments * n + j;
      const v = new THREE.Vector3(nrm.getX(a) + nrm.getX(b), nrm.getY(a) + nrm.getY(b), nrm.getZ(a) + nrm.getZ(b)).normalize();
      nrm.setXYZ(a, v.x, v.y, v.z); nrm.setXYZ(b, v.x, v.y, v.z);
    }
    nrm.needsUpdate = true;
  }

  /** The museum plinth: near-black stone whose faces fall off to black below the lit top edge. */
  function buildPlinth() {
    const m = RB.plinth({ w: PLINTH.w, h: PLINTH.h, d: PLINTH.d, seed: 7 });
    const pos = m.geometry.attributes.position, col = m.geometry.attributes.color;
    for (let i = 0; i < pos.count; i++) {
      const wy = pos.getY(i) + m.position.y; // world y of the vertex
      const f = wy > -0.01 ? 0.36 : 0.2; // near-black stone; the top plane catches the light
      col.setXYZ(i, col.getX(i) * f, col.getY(i) * f, col.getZ(i) * f);
    }
    col.needsUpdate = true;
    // Museum light: the stone falls off to black a hand's width below the lit top edge.
    m.material.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying float vTaleY;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTaleY = (modelMatrix * vec4(transformed, 1.0)).y;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vTaleY;')
        .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= mix(0.02, 1.0, pow(smoothstep(-0.62, -0.004, vTaleY), 2.2));');
    };
    m.material.customProgramCacheKey = () => 'tale-plinth-falloff';
    m.material.transparent = true;
    m.renderOrder = 0;
    return m;
  }

  function init() {
    S = RB.stage();
    S.keyBase = S.key.intensity; S.rimBase = S.rim.intensity;
    S.keyHome = S.key.position.toArray();
    S.fwd = new THREE.Vector3();

    S.cup = RB.cup();
    [S.cup.outer, S.cup.rim, S.cup.inner].forEach((m) => weldLatheSeam(m));
    S.cup.rim.material.emissive = new THREE.Color(PAL.ember);
    S.cup.inner.material.emissive = new THREE.Color(PAL.copperHot);
    S.scene.add(S.cup.group);
    S.profile = cupProfile(S.cup);

    S.plinth = buildPlinth();
    S.scene.add(S.plinth);
    S.shadow = RB.contactShadow(0.78, 0.62);
    S.shadow.renderOrder = 1;
    S.scene.add(S.shadow);

    // The shaft's light on the stage: a soft museum spot from the upper left.
    S.spot = new THREE.SpotLight('#ffd6ad', 0, 0, 0.26, 0.9, 2);
    S.spot.position.set(-1.3, 6.2, 1.3);
    S.spot.target.position.set(0.08, 0.25, 0);
    S.scene.add(S.spot, S.spot.target);

    // One travelling FX light (lights cost per pixel in the headless renderer): the glint on
    // the lip, then each spark's ignition flash, then the copper ember, then the glow inside
    // the cup. It is never hidden (that would recompile shaders), only dimmed to 0.
    // A spot, not a point: with no shadow maps a point light inside the bowl would shine
    // through the copper onto the foot. Aimed at the cup (hemisphere cone) for the glint and
    // the sparks; pointed straight up out of the bowl for the glow within.
    S.fx = new THREE.SpotLight('#ffc9a0', 0, 0, Math.PI / 2, 0.35, 2);
    S.scene.add(S.fx, S.fx.target);

    // Ignition crackle: fixed directions/speeds per spark.
    S.crackle = SPARKS.map((_, i) => Array.from({ length: 9 }, (_, k) => ({
      a: TAU * (k / 9 + 0.6 * R.hash(k, 40 + i)), v: 110 + 170 * R.hash(k, 60 + i), life: 0.22 + 0.22 * R.hash(k, 80 + i),
    })));
  }

  // ─── 2D layers ──────────────────────────────────────────────────────────────
  /** Backdrop with the umber glow following the cup; exact defaults at the hand-off. */
  function drawBackdrop(ctx, T, cupScreen) {
    const toDefault = E.inOutSine(seg(T, 4.55, T_END));
    const gx = lerp(cupScreen.x + 110, 1060, toDefault), gy = lerp(cupScreen.y - 30, 520, toDefault);
    const lift = T >= T_END ? 1 : lerp(0.62 * E.inOutSine(seg(T, 0.8, 2.6)), 1, E.inOutSine(seg(T, 4.25, 4.95)));
    if (T >= T_END) RB.atmos.backdrop(ctx);
    else RB.atmos.backdrop(ctx, { gx, gy, gr: 900, warmth: 1, lift });
  }

  /** The shaft: aimed from the upper left onto the cup, moving with the camera. */
  function beamGeom(cupScreen) {
    const tx = cupScreen.x + 30, ty = cupScreen.y + 60; // lands on the cup and the plinth top
    const ox = tx - 560, oy = -120;
    const angle = -Math.atan2(tx - ox, ty - oy);
    return { x: ox, y: oy, angle, length: 1500, width: 640 };
  }
  /**
   * The shaft, rendered at quarter resolution (it is all soft gradient) and scaled up. Same
   * geometry and gradient as RB.atmos.shaft, with its blur(28) rescaled for the smaller buffer:
   * the kit version blurs a full-frame layer and costs more than this whole scene's 2D.
   */
  function shaftQuarter(c, { x, y, angle, length, width, alpha, color }) {
    c.save();
    c.translate(x, y); c.rotate(angle);
    const g = c.createLinearGradient(0, 0, 0, length);
    g.addColorStop(0, R.rgba(color, alpha)); g.addColorStop(0.6, R.rgba(color, alpha * 0.45)); g.addColorStop(1, R.rgba(color, 0));
    c.filter = R.blur(28 / 4);
    c.fillStyle = g;
    c.beginPath(); c.moveTo(-width * 0.12, 0); c.lineTo(width * 0.12, 0); c.lineTo(width / 2, length); c.lineTo(-width / 2, length); c.closePath(); c.fill();
    c.restore();
  }
  function drawBeam(ctx, g, a) {
    if (a <= 0.002) return;
    const q = R.buffer('tale-beam', R.W / 4, R.H / 4);
    q.clear();
    q.ctx.scale(0.25, 0.25);
    q.ctx.globalCompositeOperation = 'lighter';
    shaftQuarter(q.ctx, { ...g, alpha: 0.16 * a, color: '#ffd9b0' });
    shaftQuarter(q.ctx, { ...g, width: g.width * 0.45, alpha: 0.08 * a, color: '#ffe6c8' }); // brighter core
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(q.canvas, 0, 0, R.W, R.H);
    ctx.restore();
  }

  /** Dust turning in the beam: kit motes (absolute time), cut to the beam with a soft mask. */
  function drawBeamDust(ctx, T, g, a) {
    if (a <= 0.002) return;
    const m = R.buffer('tale-dust-mask', R.W / 4, R.H / 4);
    m.clear();
    const mc = m.ctx;
    mc.scale(0.25, 0.25);
    mc.filter = R.blur(12);
    mc.translate(g.x, g.y); mc.rotate(g.angle);
    const gr = mc.createLinearGradient(0, 0, 0, g.length);
    gr.addColorStop(0, 'rgba(0,0,0,0.3)'); gr.addColorStop(0.35, 'rgba(0,0,0,1)'); gr.addColorStop(0.8, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    mc.fillStyle = gr;
    const w = g.width * 1.1;
    mc.beginPath(); mc.moveTo(-w * 0.14, 0); mc.lineTo(w * 0.14, 0); mc.lineTo(w / 2, g.length); mc.lineTo(-w / 2, g.length); mc.closePath(); mc.fill();

    const buf = R.buffer('tale-dust', R.W, R.H);
    buf.clear();
    RB.atmos.dust(buf.ctx, T, { count: 190, seed: 21, alpha: 0.95, size: 1.7, drift: 12 });
    RB.atmos.dust(buf.ctx, T, { count: 22, seed: 77, alpha: 0.55, size: 2.8, drift: 18 }); // a few nearer, larger motes
    buf.ctx.globalCompositeOperation = 'destination-in';
    buf.ctx.drawImage(m.canvas, 0, 0, R.W, R.H);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = a;
    ctx.drawImage(buf.canvas, 0, 0, R.W, R.H);
    ctx.restore();
  }

  /** Point on the lip at parameter u ∈ [0, π]: left silhouette → front → right silhouette. */
  function lipPoint(az, u) {
    const rx = Math.cos(az), rz = -Math.sin(az), fx = Math.sin(az), fz = Math.cos(az);
    return [RIM_R * (-Math.cos(u) * rx + Math.sin(u) * fx), RIM_Y, RIM_R * (-Math.cos(u) * rz + Math.sin(u) * fz)];
  }
  const U0 = -0.22, U1 = Math.PI + 0.22;
  const traceHead = (T) => lerp(U0, U1, E.inOutSine(seg(T, TRACE[0], TRACE[1])));

  /** The glint crossing the lip: a thin line of light with a comet tail, then a flare on the strike. */
  function drawRimTrace(ctx, T, az, L) {
    if (T < TRACE[0] || L.trace <= 0.002) return;
    const head = traceHead(T), tail = traceHead(T - 0.3);
    const flare = Math.exp(-Math.max(0, T - STRIKE) / 0.28) * seg(T, STRIKE - 0.04, STRIKE);
    const N = 90, pts = [];
    for (let k = 0; k <= N; k++) {
      const u = lerp(U0, head, k / N), s = project(lipPoint(az, u));
      // brightness along the arc: the tail is hot, the path behind it keeps a faint memory
      const tailW = smooth(tail - 0.15, head, u);
      pts.push([s.x, s.y, 0.16 + 0.84 * tailW * tailW]);
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    // glow built from stacked strokes (no filters: per-stroke blur is ruinously slow)
    const passes = [[11, PAL.copperHot, 0.09], [6, PAL.copperHot, 0.16], [3, PAL.ember, 0.42], [1.1, '#fff1e0', 0.9]];
    for (const [width, color, alpha] of passes) {
      ctx.lineWidth = width;
      for (let k = 1; k < pts.length; k++) {
        const a = alpha * L.trace * Math.min(1, pts[k][2] + flare * 0.9);
        if (a < 0.01) continue;
        ctx.strokeStyle = R.rgba(color, a);
        ctx.beginPath(); ctx.moveTo(pts[k - 1][0], pts[k - 1][1]); ctx.lineTo(pts[k][0], pts[k][1]); ctx.stroke();
      }
    }
    ctx.restore();
    // the glint itself, riding the lip
    if (T <= TRACE[1] + 0.12) {
      const h = project(lipPoint(az, head)), on = seg(T, TRACE[0], TRACE[0] + 0.08) * (1 - seg(T, TRACE[1], TRACE[1] + 0.12));
      RB.fx.ember(ctx, h.x, h.y, 4.2, { intensity: 0.95 * on });
    }
  }

  /** Ember flicker: a slow breath plus a fast shimmer, per spark. */
  const flicker = (T, i) => 1 + 0.1 * R.noise.n2(T * 7.5, i * 7.3) + 0.06 * R.noise.n2(T * 21, i * 3.1 + 9);

  /**
   * Outline of a small flame-like ember: round at the head, drawn out into a short tail
   * opposite its motion (dir = unit screen vector of travel), with a living wobble.
   */
  function emberPath(ctx, x, y, r, dir, stretch, T, seed, scale = 1) {
    const back = Math.atan2(-dir[1], -dir[0]), n = 30;
    ctx.beginPath();
    for (let k = 0; k <= n; k++) {
      const a = (k / n) * TAU;
      const c = Math.max(0, Math.cos(a - back));
      const wob = 1 + 0.07 * R.noise.n2(Math.cos(a) * 1.3 + seed, Math.sin(a) * 1.3 + T * 3.1);
      const rr = r * scale * wob * (1 + stretch * c * c * c);
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  /**
   * A soft glow in the ember's own shape: drawn blurred into a small buffer (a blur on the
   * full frame costs ~30× more), then added onto the frame. `layers`: [scale, blur, colour, alpha].
   */
  function emberGlow(ctx, key, x, y, r, dir, stretch, T, seed, layers) {
    const B = 144, b = R.buffer('tale-ember-' + key, B, B);
    b.clear();
    for (const [scale, blur, color, alpha] of layers) {
      b.ctx.filter = R.blur(blur);
      b.ctx.fillStyle = R.rgba(color, clamp(alpha));
      emberPath(b.ctx, B / 2, B / 2, r, dir, stretch, T, seed, scale); b.ctx.fill();
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(b.canvas, x - B / 2, y - B / 2, B, B);
    ctx.restore();
  }

  /**
   * A dark ember: a charcoal body inside a copper corona, like the logo's dark flames.
   * `heat` (1 → 0 after ignition) makes the body flare white-hot and cool to charcoal.
   */
  function drawDarkEmber(ctx, x, y, r, a, heat, fl, dir, stretch, T, seed) {
    if (a <= 0.003) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const hr = r * 9;
    const halo = ctx.createRadialGradient(x, y, r * 0.4, x, y, hr);
    halo.addColorStop(0, R.rgba(PAL.copperHot, (0.5 + 0.4 * heat) * a * fl));
    halo.addColorStop(0.12, R.rgba(PAL.copperHot, (0.2 + 0.2 * heat) * a * fl));
    halo.addColorStop(0.4, R.rgba(PAL.copper, 0.05 * a * fl));
    halo.addColorStop(1, R.rgba(PAL.copper, 0));
    ctx.fillStyle = halo; ctx.fillRect(x - hr, y - hr, hr * 2, hr * 2);
    ctx.restore();
    // copper rim: the ember's own outline, glowing softly around the dark body
    emberGlow(ctx, 's' + seed, x, y, r, dir, stretch, T, seed, [
      [1.22, r * 0.32, PAL.copperHot, 0.9 * a * fl],
      [1.02, r * 0.12, PAL.ember, 0.75 * a * fl],
    ]);
    ctx.save();
    // the dark body, white-hot at ignition, cooling to a warm charcoal
    const bx = x - dir[0] * r * 0.1, by = y - dir[1] * r * 0.1;
    const body = ctx.createRadialGradient(bx + r * 0.25, by + r * 0.3, 0, bx, by, r * 1.3);
    body.addColorStop(0, R.mix('#141312', '#fff1e2', heat, a));
    body.addColorStop(0.55, R.mix('#211d1a', '#ffc8a0', heat, a));
    body.addColorStop(1, R.mix('#4a2f22', '#ffb48e', heat, a));
    ctx.fillStyle = body;
    emberPath(ctx, bx, by, r, dir, stretch * 0.85, T, seed, 0.78); ctx.fill();
    // a hot catch-light on the leading edge
    ctx.globalCompositeOperation = 'lighter';
    const hx = x + dir[0] * r * 0.55 - r * 0.15, hy = y + dir[1] * r * 0.55 - r * 0.2;
    const hot = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 0.6);
    hot.addColorStop(0, R.rgba('#ffe2c6', 0.7 * a * fl)); hot.addColorStop(1, R.rgba(PAL.ember, 0));
    ctx.fillStyle = hot; ctx.fillRect(hx - r, hy - r, r * 2, r * 2);
    ctx.restore();
  }

  /** The copper ember: the kit's glowing spark, drawn out a little along its motion. */
  function drawCopperEmber(ctx, x, y, r, a, heat, fl, dir, stretch, T, seed) {
    if (a <= 0.003) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const hr = r * 10;
    const halo = ctx.createRadialGradient(x, y, 0, x, y, hr);
    halo.addColorStop(0, R.rgba(PAL.ember, (0.24 + 0.4 * heat) * a * fl));
    halo.addColorStop(0.25, R.rgba(PAL.copperHot, 0.09 * a * fl));
    halo.addColorStop(1, R.rgba(PAL.copperHot, 0));
    ctx.fillStyle = halo; ctx.fillRect(x - hr, y - hr, hr * 2, hr * 2);
    ctx.restore();
    emberGlow(ctx, 's' + seed, x, y, r, dir, stretch, T, seed, [[1.25, r * 0.35, PAL.copperHot, 0.85 * a * fl]]);
    RB.fx.ember(ctx, x, y, r, { intensity: a * fl * (1 + 0.5 * heat) });
  }

  /** Ignition: a flash of light and a crackle of tiny sparks thrown from the ignition point. */
  function drawIgnition(ctx, T, i, at) {
    const dt = T - SPARKS[i].tIgn;
    if (dt < 0 || dt > 0.5) return;
    const s = project(at);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const flash = Math.exp(-dt / 0.07);
    const fr = 150 * (0.6 + 0.4 * E.outCubic(seg(dt, 0, 0.12)));
    const f = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, fr);
    f.addColorStop(0, R.rgba('#ffe8d2', 0.55 * flash)); f.addColorStop(0.25, R.rgba(PAL.ember, 0.2 * flash)); f.addColorStop(1, R.rgba(PAL.copperHot, 0));
    ctx.fillStyle = f; ctx.fillRect(s.x - fr, s.y - fr, fr * 2, fr * 2);
    ctx.lineCap = 'round';
    for (const c of S.crackle[i]) {
      if (dt > c.life) continue;
      const u = dt / c.life, pos = (tt) => [s.x + Math.cos(c.a) * c.v * tt, s.y + Math.sin(c.a) * c.v * tt + 220 * tt * tt];
      const [x1, y1] = pos(dt), [x0, y0] = pos(Math.max(0, dt - 0.03));
      ctx.strokeStyle = R.rgba(u < 0.35 ? '#fff0e0' : PAL.ember, 0.9 * (1 - u) * (1 - u));
      ctx.lineWidth = 1.6 * (1 - u) + 0.4;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    ctx.restore();
  }

  /** Faint trail behind a spark: its own recent path, occluded by the cup where it passes behind. */
  function drawTrail(ctx, T, i, camPos) {
    const s = SPARKS[i], n = 44;
    // about 1.6 rad of arc: long, lazy trails while circling, short ones once the vortex spins
    const pS = seg(T, SPIRAL, BRAID), omega = Math.abs(s.w) + SPIN * (T < BRAID ? pS * pS : 1);
    const span = clamp(1.6 / omega, 0.05, 0.62);
    const pts = [];
    for (let k = 0; k <= n; k++) {
      const tk = T - (span * k) / n;
      if (tk < s.tIgn) break;
      const sp = sparkPos(i, tk);
      if (sp.inside) { pts.push(null); continue; }
      const pr = project(sp.p);
      pts.push(visible(camPos, sp.p) ? [pr.x, pr.y, 1 - k / n] : null);
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    const col = s.kind === 'copper' ? PAL.ember : PAL.copperHot;
    for (const [wMul, aMul] of [[4.2, 0.07], [2.2, 0.14], [1, 0.4]]) {
      for (let k = 1; k < pts.length; k++) {
        const a = pts[k - 1], b = pts[k];
        if (!a || !b) continue;
        const w = b[2];
        ctx.strokeStyle = R.rgba(col, aMul * w * w);
        ctx.lineWidth = (0.5 + 1.7 * w) * wMul;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
    }
    ctx.restore();
  }

  /** Spark state at T: screen position, size, visibility, ignition heat. */
  function sparkState(T, i, camPos) {
    const s = SPARKS[i];
    if (T < s.tIgn) return null;
    const sp = sparkPos(i, T);
    if (sp.inside) return null;
    const pr = project(sp.p);
    // soft occlusion: five taps across the spark's own size
    const off = s.size * 1.2;
    const taps = [[0, 0, 0], [off, 0, 0], [-off, 0, 0], [0, off, 0], [0, -off, 0]];
    let vis = 0;
    for (const o of taps) vis += visible(camPos, [sp.p[0] + o[0], sp.p[1] + o[1], sp.p[2] + o[2]]) ? 0.2 : 0;
    const dt = T - s.tIgn;
    // hot on ignition; and all three turn to light as they plunge into the cup
    const heat = Math.max(Math.exp(-dt / 0.16), E.inQuad(seg(T, DIVE[0] + i * 0.03, DIVE[0] + i * 0.03 + 0.09)));
    const pop = 1 + 0.9 * Math.exp(-dt / 0.09) * seg(dt, 0, 0.02);
    // screen velocity → the ember's tail
    const prev = project(sparkPos(i, T - 0.04).p);
    const vx = (pr.x - prev.x) / 0.04, vy = (pr.y - prev.y) / 0.04, sp2 = Math.hypot(vx, vy);
    const dir = sp2 > 1e-3 ? [vx / sp2, vy / sp2] : [0, -1];
    const r = s.size * pr.ppu * pop;
    const stretch = clamp(0.25 + sp2 / 1400, 0.25, 1.1);
    return { p: sp.p, x: pr.x, y: pr.y, r, vis, heat, dir, stretch };
  }

  /** The bowl's visible outline (front lip, then down the two silhouette edges), as a path. */
  function bowlSilhouette(ctx, az) {
    const P = S.profile, right = [Math.cos(az), 0, -Math.sin(az)];
    const edge = (side, y) => {
      const r = P.rOut[Math.min(P.N, Math.round((y / P.H) * P.N))];
      return project([side * r * right[0], y, side * r * right[2]]);
    };
    for (let k = 0; k <= 24; k++) { const q = project(lipPoint(az, lerp(0, Math.PI, k / 24))); if (k) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }
    for (let k = 0; k <= 12; k++) { const q = edge(1, lerp(0.9, 0.2, k / 12)); ctx.lineTo(q.x, q.y); }
    for (let k = 0; k <= 12; k++) { const q = edge(-1, lerp(0.2, 0.9, k / 12)); ctx.lineTo(q.x, q.y); }
    ctx.closePath();
  }

  /** Light spilling from the mouth after the sparks go in (g = glow, 0..1). */
  function drawInnerGlow(ctx, g, az) {
    if (g <= 0.002) return;
    const m = project(MOUTH), rw = RIM_R * m.ppu;
    // light pours up out of the mouth: everywhere except over the (opaque) bowl in front of it
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, R.W, R.H);
    bowlSilhouette(ctx, az);
    ctx.clip('evenodd');
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(m.x, m.y - rw * 0.08);
    ctx.scale(1, 0.5);
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, rw * 1.3);
    halo.addColorStop(0, R.rgba('#ffe3c6', 0.6 * g));
    halo.addColorStop(0.4, R.rgba(PAL.ember, 0.32 * g));
    halo.addColorStop(1, R.rgba(PAL.copperHot, 0));
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(0, 0, rw * 1.3, 0, TAU); ctx.fill();
    ctx.restore();
    // a soft column of warm air above the mouth, and a little lens spill over the lip
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const col = ctx.createRadialGradient(m.x, m.y - rw * 0.45, 0, m.x, m.y - rw * 0.45, rw * 0.95);
    col.addColorStop(0, R.rgba(PAL.ember, 0.2 * g)); col.addColorStop(1, R.rgba(PAL.ember, 0));
    ctx.fillStyle = col; ctx.fillRect(m.x - rw, m.y - rw * 1.4, rw * 2, rw * 2);
    ctx.restore();
  }

  // ─── Typography ─────────────────────────────────────────────────────────────
  // A descending cadence. Line 1 lands at y≈490; "Three brothers." / "One cup." land two
  // leads below, in reading order. Line 1 is still leaving (lifting inside its own mask) when
  // "Three brothers." rises into the band below it, so the two never touch, and the whole
  // column (≈445–690) sits centred on the frame, left of the cup.
  const TYPE_X = 150, TYPE_Y = 490, TYPE_SIZE = 60, LEAD = TYPE_SIZE * 1.12;
  function drawType(ctx, T) {
    RB.type.line(ctx, T, { text: 'One of the oldest stories\nis about makers.', x: TYPE_X, y: TYPE_Y, size: TYPE_SIZE, tIn: 0.35, tOut: 2.4, stagger: 0.04, dur: 0.6 });
    RB.type.line(ctx, T, { text: 'Three brothers.', x: TYPE_X, y: TYPE_Y + 2 * LEAD, size: TYPE_SIZE, tIn: 2.55, tOut: 4.25, stagger: 0.04, dur: 0.6 });
    RB.type.line(ctx, T, { text: 'One cup.', x: TYPE_X, y: TYPE_Y + 3 * LEAD, size: TYPE_SIZE, tIn: 3.15, tOut: 4.25, stagger: 0.04, dur: 0.6 });
  }

  // ─── The FX light's roles over time ────────────────────────────────────────
  function poseFxLight(T, az, sparks, g) {
    const fx = S.fx; // (its target is in the scene graph, so the render updates its matrix)
    if (T < IGNITE[0]) {
      // the glint's own light, riding just outside the lip
      const hp = lipPoint(az, traceHead(T));
      const on = seg(T, TRACE[0], TRACE[0] + 0.1) * (1 - E.inOutSine(seg(T, TRACE[1], TRACE[1] + 0.5)));
      fx.position.set(hp[0] * 1.12, hp[1] + 0.07, hp[2] * 1.12);
      fx.target.position.set(0, 0.5, 0); fx.angle = Math.PI / 2;
      fx.intensity = 0.55 * on;
    } else if (T < 4.6) {
      // the newest spark: its ignition flashes on the copper; the copper ember keeps a glow
      const i = T < IGNITE[1] ? 0 : T < IGNITE[2] ? 1 : 2, st = sparks[i];
      if (!st) { fx.intensity = 0; return; }
      fx.position.set(st.p[0], st.p[1], st.p[2]);
      fx.target.position.set(0, 0.5, 0); fx.angle = Math.PI / 2;
      fx.intensity = SPARKS[i].light * (0.55 + 0.45 * st.vis) + 0.22 * st.heat * st.heat;
    } else {
      // inside the cup once the sparks have gone in
      fx.position.set(0, 0.34, 0);
      fx.target.position.set(0, 2, 0); fx.angle = 1.25;
      fx.intensity = 3.2 * g + SPARKS[2].light * (1 - seg(T, 4.6, 4.68));
    }
  }

  // ─── Frame ──────────────────────────────────────────────────────────────────
  function draw(ctx, t, env) {
    const T = env.T;
    const L = lightsAt(T);
    const g = glowAt(T);

    // camera (projections below are un-jittered; draw3D applies the sub-pixel jitter itself)
    const shot = shotAt(T);
    RB.setCam(S.camera, shot);
    S.camera.clearViewOffset();
    S.camera.getWorldDirection(S.fwd);
    const camPos = shot.pos;
    const az = Math.atan2(shot.pos[0] - shot.look[0], shot.pos[2] - shot.look[2]);
    const cupScreen = project([0, 0.46, 0]);

    // pose the world
    S.cup.group.position.set(0, 0, 0);
    S.cup.group.rotation.set(0, cupYaw(T), 0);
    S.scene.environmentIntensity = L.env;
    S.key.intensity = S.keyBase * L.key;
    if (L.keyHome >= 1) S.key.position.fromArray(S.keyHome);
    else S.key.position.set(...KEY_RAKE.map((v, k) => lerp(v, S.keyHome[k], L.keyHome)));
    S.rim.intensity = S.rimBase * L.rim;
    S.spot.intensity = 95 * L.spot;
    S.scene.environmentRotation.set(L.envPitch, 0, 0);
    const plinthA = 1 - E.inOutSine(seg(T, 4.35, 4.9));
    S.plinth.visible = plinthA > 0.001;
    S.plinth.material.opacity = plinthA;
    S.plinth.material.color.setScalar(lerp(1, 0.35, E.inOutSine(seg(T, 4.2, 4.8))));
    S.shadow.visible = plinthA > 0.001;
    S.shadow.material.opacity = 0.62 * plinthA;

    const sparks = SPARKS.map((_, i) => sparkState(T, i, camPos));
    poseFxLight(T, az, sparks, g);
    S.cup.rim.material.emissiveIntensity = 0.55 * g;
    S.cup.inner.material.emissiveIntensity = 0.45 * g;

    // ── paint ──
    drawBackdrop(ctx, T, cupScreen);
    if (L.ground < 1) { ctx.fillStyle = `rgba(0,0,0,${(1 - L.ground).toFixed(4)})`; ctx.fillRect(0, 0, R.W, R.H); }
    const beam = beamGeom(cupScreen);
    drawBeam(ctx, beam, L.beam);

    RB.draw3D(ctx, S.scene, S.camera);

    drawRimTrace(ctx, T, az, L);
    drawInnerGlow(ctx, g, az);
    sparks.forEach((st, i) => { if (st) drawTrail(ctx, T, i, camPos); });
    sparks.forEach((st, i) => {
      if (!st) return;
      drawIgnition(ctx, T, i, sparkPos(i, SPARKS[i].tIgn).p);
      const a = st.vis * seg(T, SPARKS[i].tIgn, SPARKS[i].tIgn + 0.02), fl = flicker(T, i);
      const paint = SPARKS[i].kind === 'copper' ? drawCopperEmber : drawDarkEmber;
      paint(ctx, st.x, st.y, st.r, a, st.heat, fl, st.dir, st.stretch, T, i * 5.7);
    });
    drawBeamDust(ctx, T, beam, L.beam);

    drawType(ctx, T);
  }

  R.scene({
    id: 'tale', index: 1, label: 'The tale', start: 0, end: 5,
    init,
    draw,
    // a touch more vignette in the dark opening; exactly the defaults by the hand-off
    post: (t) => ({ bloom: 0.35, vignette: lerp(0.56, 0.42, E.inOutSine(seg(t, 1.0, 4.6))), grain: R.grain }),
  });
})();
