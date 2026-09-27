/*
 * S2 · 01 UNDERSTAND · 5.0–7.5 s (frames 150–224) · rail: 01 UNDERSTAND
 *
 * Seeing the work as it is. The cup is not x-rayed by a machine; it is looked at
 * closely, the way a maker turns a piece in the light. The copper comes apart into
 * the same warm dust that hangs in the workshop air, holding its exact shape, and
 * the lathe's own contour lines are drawn over it like a draughtsman's study.
 *
 *   5.000  Cup strike #2. Frame 150 is S1's out frame: the solid cup in cupHero.
 *   5.00–5.60  A thin ember scan plane runs down the cup (in step with the glassy
 *          scan shimmer in the score). Where it passes, the copper opens along a
 *          glowing section line and lets go of its surface as a fine point cloud
 *          (RB.cupPoints); ivory contour rings of the lathe profile draw on around it.
 *   5.00–6.20  The camera floats off the hero framing, rising a little and easing the
 *          cup right of centre to make room for the story column on the left.
 *   5.150  Kicker "01 ── UNDERSTAND".  5.350 → 6.950  "See the work as it is."
 *   5.40–7.05  The cloud turns ~30° on its axis while the camera keeps drifting
 *          (together a ~35° orbit around the form); the cloud breathes out on the
 *          beat the scan lands (5.625) and hangs, lit by the key like dust in light.
 *   5.6 / 5.9 / 6.2  Three observations draw on with leader lines (one data tick
 *          each in the score): FORM · HAND-RAISED, MATERIAL · COPPER,
 *          USE · SHARED BY MANY.
 *   6.875  (beat) The notes leave; the points are drawn back onto the surface.
 *   6.90–7.467  One decisive move: the camera glides and pushes in to cupMake.
 *   7.065–7.43  The scan runs back up (the reverse swell): the cloud is absorbed and
 *          the copper re-forms behind a warm section line, landing solid for the
 *          downbeat at 7.5.
 *
 * Contracts
 *   IN   frame 150 = S1's out: cup at the origin, rotation 0, camera exactly
 *        RB.shots.cupHero, RB.atmos.backdrop() defaults, stage-default lights and
 *        environment, no text. S1's inner glow keeps decaying on its own curve
 *        (0.064 at frame 149 → 0.041 here → gone within a few frames).
 *   OUT  frame 224 (→ S3 at 7.5): solid cup at the origin, rotation.y 0, camera
 *        exactly RB.shots.cupMake, backdrop defaults, stage-default lights, no scan
 *        light, no points, no rings, no annotations, no text. Rail 01, progress (T−5)/2.5.
 *
 * One draw3D per frame: the kit cup (with a scan-dissolve patch on its three
 * materials) and one THREE.Points cloud with its own small shader.
 */
(function () {
  'use strict';
  const R = window.REEL, RB = window.RB, THREE = window.THREE;
  const { PAL, E, clamp, lerp, seg } = R;
  const TAU = Math.PI * 2;

  // ─── Timing (absolute seconds; one beat = 0.625 s) ──────────────────────────
  const T0 = 5.0;
  const T_END = 224 / 30;                  // last frame of the scene: the hand-off pose is exact here
  const SCAN_DOWN = [5.0, 5.6];            // the score's scan shimmer sweeps down over the same 0.6 s
  const SCAN_UP = [7.065, 7.43];           // the score's upward sweep runs 7.065 → 7.465
  const SOLID_AGAIN = 7.43;                // from here the copper is whole again
  const TURN = [5.4, 7.05];                // the cloud's slow turn on its axis
  const TURN_ANGLE = -0.52;                // ≈ −30°: front points travel right → left
  const BREATHE_OUT = [5.45, 6.2];         // the cloud exhales after the scan lands (5.625)
  const DRAW_BACK = [6.875, 7.12];         // (beat) points drawn back onto the surface
  const CAM_OUT = [5.0, 5.95];             // hero → study framing (clear of the line before it lands)
  const CAM_DRIFT = [5.6, 6.95];           // slow push while the notes are up
  const CAM_MAKE = [6.9, T_END];           // the decisive glide into cupMake

  // ─── Copy (verbatim from the storyboard) ────────────────────────────────────
  const KICKER = { index: '01', label: 'UNDERSTAND', x: 150, y: 470, tIn: 5.15, tOut: 6.95 };
  const LINE = { text: 'See the work as it is.', x: 150, y: 560, size: 60, tIn: 5.35, tOut: 6.95, stagger: 0.04, dur: 0.6 };
  // Contour rings are level cuts every RING_STEP; the rim ring sits on the lip.
  const RING_Y = (k) => 0.03 + k * 0.042;
  const RIM_RING_Y = 0.906;
  // Each observation is anchored on a contour ring (height in world y) at an azimuth to the
  // right of the camera's view (rad); that ring and the dust around it catch the light as
  // the note ticks in, as if the eye were measuring that part of the work.
  const NOTES = [
    { text: 'FORM · HAND-RAISED', tIn: 5.6, tOut: 7.0, y: RING_Y(14), az: 0.95 },
    { text: 'MATERIAL · COPPER', tIn: 5.9, tOut: 7.06, y: RING_Y(7), az: 0.8 },
    { text: 'USE · SHARED BY MANY', tIn: 6.2, tOut: 7.12, y: RIM_RING_Y, az: 1.1 },
  ];
  const NOTE_OFF = 0.74;                    // the label column, in world units right of the cup's axis
  const TYPE_PARALLAX = 0.35;               // how much of the final glide the exiting type drifts with
  const TYPE_GONE = 7.22;                   // the type has cleared before the cup reaches its column
  const TYPE_BOX = { x: 0, y: 440, w: 1000, h: 170 }; // covers the kicker and the line's mask band
  const CUP_MID = 0.45;                     // the cup's visual centre height

  // ─── Shots ──────────────────────────────────────────────────────────────────
  const HERO = RB.shots.cupHero, MAKE = RB.shots.cupMake;
  /** A shot as orbit parameters about a look point: { L:[x,y,z], D, az, el, fov }. */
  function orbitOf(shot) {
    const d = [shot.pos[0] - shot.look[0], shot.pos[1] - shot.look[1], shot.pos[2] - shot.look[2]];
    const D = Math.hypot(d[0], d[1], d[2]);
    return { L: shot.look.slice(), D, az: Math.atan2(d[0], d[2]), el: Math.asin(d[1] / D), fov: shot.fov };
  }
  const O_HERO = orbitOf(HERO), O_MAKE = orbitOf(MAKE);
  // The study framing: pulled back and raised a touch (the rings open into ellipses),
  // cup right of centre so the story column on the left has clean dark ground.
  const O_STUDY = { L: [-0.37, 0.45, 0.02], D: 3.95, az: 0.02, el: 0.2, fov: 30 };
  const O_DRIFT = { L: [-0.35, 0.455, 0.02], D: 3.72, az: 0.05, el: 0.215, fov: 30 };

  let S = null; // everything built once in init()

  // ─── Small maths ────────────────────────────────────────────────────────────
  const smooth01 = (x) => { const u = clamp(x); return u * u * (3 - 2 * u); };
  const mixOrbit = (a, b, p) => ({
    L: [lerp(a.L[0], b.L[0], p), lerp(a.L[1], b.L[1], p), lerp(a.L[2], b.L[2], p)],
    D: lerp(a.D, b.D, p), az: lerp(a.az, b.az, p), el: lerp(a.el, b.el, p), fov: lerp(a.fov, b.fov, p),
  });
  const shotOf = (o) => ({
    pos: [o.L[0] + o.D * Math.sin(o.az) * Math.cos(o.el), o.L[1] + o.D * Math.sin(o.el), o.L[2] + o.D * Math.cos(o.az) * Math.cos(o.el)],
    look: o.L.slice(), fov: o.fov,
  });

  // ─── Camera ─────────────────────────────────────────────────────────────────
  /**
   * One continuous move: float off the hero framing into the study framing, drift in
   * slowly while the notes are up, then one decisive inOutCubic glide into cupMake that
   * lands with zero velocity on frame 224. Exact contract shots at both ends.
   */
  function shotAt(T) {
    if (T <= T0) return { pos: HERO.pos.slice(), look: HERO.look.slice(), fov: HERO.fov };
    if (T >= T_END - 1e-6) return { pos: MAKE.pos.slice(), look: MAKE.look.slice(), fov: MAKE.fov };
    const pOut = E.inOutSine(seg(T, CAM_OUT[0], CAM_OUT[1]));
    const pDrift = E.inOutSine(seg(T, CAM_DRIFT[0], CAM_DRIFT[1]));
    const pMake = E.inOutCubic(seg(T, CAM_MAKE[0], CAM_MAKE[1]));
    const study = mixOrbit(O_STUDY, O_DRIFT, pDrift);
    return shotOf(mixOrbit(mixOrbit(O_HERO, study, pOut), O_MAKE, pMake));
  }

  // ─── The scan ───────────────────────────────────────────────────────────────
  const Y_TOP = 0.95, Y_BOT = -0.03;       // the scan plane starts above the lip, ends below the foot
  const cutDownAt = (T) => lerp(Y_TOP, Y_BOT, smooth01(seg(T, SCAN_DOWN[0], SCAN_DOWN[1])));
  const cutUpAt = (T) => lerp(Y_BOT, Y_TOP, smooth01(seg(T, SCAN_UP[0], SCAN_UP[1])));
  /** Height of the scan plane: copper below it, points above it. */
  const cutAt = (T) => Math.max(cutDownAt(T), cutUpAt(T));
  /** When the downward plane passes height y (inverse of cutDownAt). */
  function tDownAt(y) {
    const p = clamp((Y_TOP - y) / (Y_TOP - Y_BOT));
    // invert smoothstep: s = 0.5 − sin(asin(1 − 2p) / 3)
    const s = 0.5 - Math.sin(Math.asin(1 - 2 * p) / 3);
    return lerp(SCAN_DOWN[0], SCAN_DOWN[1], s);
  }
  /** Intensity of the scan light (0 when no plane is running). */
  function bandAt(T) {
    const down = seg(T, SCAN_DOWN[0], SCAN_DOWN[0] + 0.035) * (1 - E.inOutSine(seg(T, 5.44, 5.62)));
    const up = seg(T, SCAN_UP[0], SCAN_UP[0] + 0.04) * (1 - E.inOutSine(seg(T, 7.385, T_END)));
    return Math.max(down, up);
  }
  /** How far the cloud has breathed off the surface (0 = on the copper's skin). */
  const liftAt = (T) => E.outCubic(seg(T, BREATHE_OUT[0], BREATHE_OUT[1])) * (1 - E.inOutCubic(seg(T, DRAW_BACK[0], DRAW_BACK[1])));
  const turnAt = (T) => TURN_ANGLE * E.inOutSine(seg(T, TURN[0], TURN[1]));
  /** How strongly note i's contour catches the light: a glint on its tick, a trace while it is up. */
  function glintAt(T, i) {
    const n = NOTES[i];
    if (T < n.tIn) return 0;
    const flash = 0.22 + 0.78 * Math.exp(-(T - n.tIn) / 0.32);
    return E.outCubic(seg(T, n.tIn, n.tIn + 0.07)) * flash * (1 - E.inCubic(seg(T, n.tOut, n.tOut + 0.3)));
  }
  /** S1's inner glow, continuing its own decay across the cut (≈0.041 at frame 150). */
  const taleGlowAt = (T) => (T > 5.4 ? 0 : Math.exp(-Math.max(0, T - 4.76) / 0.075));

  // ─── Cup profile (from the kit cup's own lathe geometry) ────────────────────
  const CUP_SEGMENTS = 160; // RB.cup()'s default lathe segments
  /** [r, y] per profile vertex; the widest radius over all columns = the un-hammered form. */
  function lathePairs(mesh) {
    const pos = mesh.geometry.attributes.position, n = pos.count / (CUP_SEGMENTS + 1), out = [];
    for (let j = 0; j < n; j++) {
      let r = 0;
      for (let i = 0; i <= CUP_SEGMENTS; i++) r = Math.max(r, Math.hypot(pos.getX(i * n + j), pos.getZ(i * n + j)));
      out.push([r, pos.getY(j)]);
    }
    return out;
  }
  /** The outer skin (foot → stem → bowl → over the lip), as one polyline in (r, y). */
  function outerProfile(cup) {
    return lathePairs(cup.outer).concat(lathePairs(cup.rim).slice(1));
  }
  /** Widest radius of the profile at height y. */
  function radiusAt(prof, y) {
    let best = 0;
    for (let j = 1; j < prof.length; j++) {
      const [ra, ya] = prof[j - 1], [rb, yb] = prof[j];
      if ((y - ya) * (y - yb) > 0 || ya === yb) continue;
      best = Math.max(best, lerp(ra, rb, (y - ya) / (yb - ya)));
    }
    return best;
  }
  /** Outward surface normal (in the r–y plane) of the profile segment nearest (r, y). */
  function profileNormal(prof, r, y) {
    let best = 1e9, nr = 1, ny = 0;
    for (let j = 1; j < prof.length; j++) {
      const [ra, ya] = prof[j - 1], [rb, yb] = prof[j];
      const dr = rb - ra, dy = yb - ya, L2 = dr * dr + dy * dy;
      if (L2 < 1e-12) continue;
      const u = clamp(((r - ra) * dr + (y - ya) * dy) / L2);
      const d2 = (ra + dr * u - r) ** 2 + (ya + dy * u - y) ** 2;
      if (d2 < best) { best = d2; const l = Math.sqrt(L2); nr = dy / l; ny = -dr / l; }
    }
    return [nr, ny];
  }

  /** Average the normals on the lathe's φ=0 / φ=2π seam, exactly as S1 does (the seam faces the camera). */
  function weldLatheSeam(mesh, segments = CUP_SEGMENTS) {
    const nrm = mesh.geometry.attributes.normal, n = nrm.count / (segments + 1);
    for (let j = 0; j < n; j++) {
      const a = j, b = segments * n + j;
      const v = new THREE.Vector3(nrm.getX(a) + nrm.getX(b), nrm.getY(a) + nrm.getY(b), nrm.getZ(a) + nrm.getZ(b)).normalize();
      nrm.setXYZ(a, v.x, v.y, v.z); nrm.setXYZ(b, v.x, v.y, v.z);
    }
    nrm.needsUpdate = true;
  }

  // ─── The copper's scan dissolve (a patch on the kit materials) ──────────────
  /**
   * Fragments above the scan plane are discarded (with a fine grain on the edge, so the
   * surface flakes rather than being sliced), and the copper just below the plane glows
   * ember. Back faces (the inside of the wall, seen only through the open section) glow
   * hotter: a warm cross-section line. With uCut far above the cup and uHeat = 0 the
   * patch is an exact no-op, so the hand-off frames are the plain kit cup.
   */
  function patchScan(material, kind) {
    material.onBeforeCompile = (sh) => {
      sh.uniforms.uScanCut = S.scan.uCut;
      sh.uniforms.uScanHeat = S.scan.uHeat;
      sh.uniforms.uScanEmber = S.scan.uEmber;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vScanP;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvScanP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', [
          '#include <common>',
          'varying vec3 vScanP;',
          'uniform float uScanCut;',
          'uniform float uScanHeat;',
          'uniform vec3 uScanEmber;',
          'float scanGrain(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }',
        ].join('\n'))
        .replace('#include <clipping_planes_fragment>', [
          '#include <clipping_planes_fragment>',
          'float scanD = uScanCut - vScanP.y + (scanGrain(floor(vScanP * 220.0)) - 0.5) * 0.014;',
          'if (scanD < 0.0) discard;',
        ].join('\n'))
        .replace('#include <emissivemap_fragment>', [
          '#include <emissivemap_fragment>',
          'float scanEdge = uScanHeat * exp(-scanD / (gl_FrontFacing ? 0.008 : 0.016));',
          'totalEmissiveRadiance += uScanEmber * scanEdge * (gl_FrontFacing ? 1.5 : 2.2);',
        ].join('\n'));
    };
    material.customProgramCacheKey = () => `s2-scan-${kind}`;
  }

  // ─── The point cloud ────────────────────────────────────────────────────────
  const POINTS = 36000;
  const POINT_VS = /* glsl */ `
    attribute vec3 aNormal;
    attribute vec4 aRand;
    uniform float uCut, uBand, uLift, uTime, uSize, uAlpha, uFocus;
    uniform vec3 uKeyDir, uRimDir, uShadow, uCopper, uLit, uHot, uGlintY, uGlintA;
    varying vec3 vCol;
    varying float vA;
    void main() {
      // height above the scan plane (a little scatter so the edge is soft)
      float d = position.y - uCut + (aRand.z - 0.5) * 0.035;
      float on = smoothstep(0.0, 0.015, d);
      float dd = max(d, 0.0);
      float fresh = uBand * exp(-dd / 0.045);                                  // just let go / about to be taken back
      float pop = uBand * 0.022 * (1.0 - exp(-dd / 0.025)) * exp(-dd / 0.16);  // a small outward breath at the plane
      float stray = step(0.945, aRand.x);                                      // a few motes wander further off
      float breathe = uLift * (0.003 + 0.013 * aRand.x + stray * 0.085 * aRand.w)
                    * (0.8 + 0.2 * sin(uTime * 1.9 + aRand.w * 6.2832));
      vec3 p = position + aNormal * (pop + breathe) + vec3(0.0, uLift * stray * 0.05 * aRand.y, 0.0);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      // lit like the copper was: the workshop key from the upper left, a copper rim from the right
      vec3 wn = normalize(mat3(modelMatrix) * aNormal);
      float L = 0.16 + 0.84 * max(dot(wn, uKeyDir), 0.0) + 0.4 * pow(max(dot(wn, uRimDir), 0.0), 2.0);
      vec3 col = mix(uShadow, uCopper, smoothstep(0.05, 0.6, L));
      col = mix(col, uLit, smoothstep(0.6, 1.15, L));
      vCol = mix(col, uHot, clamp(fresh, 0.0, 1.0));
      float facing = normalize(normalMatrix * aNormal).z;                      // + toward the camera
      float back = mix(0.36, 1.0, smoothstep(-0.5, 0.35, facing));
      float lit = mix(0.55, 1.0, smoothstep(0.1, 0.9, L));                     // the lit side reads denser
      float fall = mix(0.42, 1.0, smoothstep(0.02, 0.42, position.y));         // museum light: the foot falls away
      vCol *= mix(0.72, 1.0, fall);
      // the observed contours catch the light
      vec3 gy = (position.y - uGlintY) / 0.028;
      float glint = dot(uGlintA, exp(-gy * gy));
      vCol = mix(vCol, uHot, clamp(glint, 0.0, 1.0));
      // a macro lens: sharp on the near wall, the far wall softly out of focus
      float coc = clamp(abs(-mv.z - uFocus) / 1.3, 0.0, 1.0);
      float bokeh = 1.0 + 1.3 * coc;
      vA = on * uAlpha * back * lit * fall * (0.75 + 0.25 * aRand.y) * (1.0 - stray * 0.4)
         * (1.0 + 0.9 * glint) / (bokeh * bokeh);
      gl_PointSize = uSize * bokeh * (0.85 + 0.3 * aRand.y) * (1.0 + 0.4 * fresh + 0.25 * glint) / -mv.z;
    }`;
  const POINT_FS = /* glsl */ `
    varying vec3 vCol;
    varying float vA;
    void main() {
      vec2 c = gl_PointCoord * 2.0 - 1.0;
      float a = vA * (1.0 - smoothstep(0.2, 1.0, dot(c, c)));
      if (a < 0.003) discard;
      gl_FragColor = vec4(vCol, 1.0);
      #include <colorspace_fragment>
      gl_FragColor = vec4(gl_FragColor.rgb * a, a);
    }`;

  /**
   * Uniform samples of the cup's outer skin (RB.cupPoints), each with its surface normal
   * and a random seed. The underside of the foot is dropped: it is never seen, and through
   * the cloud it only reads as a noisy disc.
   */
  function buildCloud(prof) {
    const all = RB.cupPoints(POINTS, 5);
    const keep = [];
    for (let i = 0; i < POINTS; i++) if (all[i * 3 + 1] > 0.004) keep.push(i);
    const n = keep.length;
    const pos = new Float32Array(n * 3), nrm = new Float32Array(n * 3), rnd = new Float32Array(n * 4);
    keep.forEach((src, i) => {
      const x = all[src * 3], y = all[src * 3 + 1], z = all[src * 3 + 2], r = Math.hypot(x, z) || 1e-6;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      const [nr, ny] = profileNormal(prof, r, y);
      nrm[i * 3] = (x / r) * nr; nrm[i * 3 + 1] = ny; nrm[i * 3 + 2] = (z / r) * nr;
      for (let k = 0; k < 4; k++) rnd[i * 4 + k] = R.hash(i, 71 + k * 13);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aNormal', new THREE.BufferAttribute(nrm, 3));
    geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 4));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.45, 0), 1.2);
    const key = new THREE.Vector3(-3.5, 5, 4).normalize(), rim = new THREE.Vector3(4, 2.5, -4).normalize();
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uCut: { value: 99 }, uBand: { value: 0 }, uLift: { value: 0 }, uTime: { value: 0 }, uSize: { value: 8 }, uAlpha: { value: 1 },
        uFocus: { value: 3.5 }, uGlintY: { value: new THREE.Vector3(NOTES[0].y, NOTES[1].y, NOTES[2].y) }, uGlintA: { value: new THREE.Vector3() },
        uKeyDir: { value: key }, uRimDir: { value: rim },
        uShadow: { value: new THREE.Color('#3b2518') }, uCopper: { value: new THREE.Color('#cb8454') },
        uLit: { value: new THREE.Color('#fbeedb') }, uHot: { value: new THREE.Color('#ffc39a') },
      },
      vertexShader: POINT_VS, fragmentShader: POINT_FS,
      transparent: true, premultipliedAlpha: true, depthWrite: false, depthTest: true, toneMapped: false,
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    return points;
  }

  // ─── Build (once) ───────────────────────────────────────────────────────────
  function init() {
    S = RB.stage();
    S.scan = {
      uCut: { value: 99 }, uHeat: { value: 0 },
      uEmber: { value: new THREE.Color(PAL.ember) },
    };
    S.cup = RB.cup();
    [S.cup.outer, S.cup.rim, S.cup.inner].forEach((m) => weldLatheSeam(m));
    S.cup.rim.material.emissive = new THREE.Color(PAL.ember);        // S1's glow, carried over
    S.cup.inner.material.emissive = new THREE.Color(PAL.copperHot);
    // Two material sets: the untouched kit copper whenever the cup is whole (the hand-off
    // frames are then exactly the kit cup, and cheap), and patched clones for the scan
    // (a shader with discard loses early-z, so it is only used while it is needed).
    S.parts = ['outer', 'rim', 'inner'];
    S.plainMat = {}; S.scanMat = {};
    for (const k of S.parts) {
      S.plainMat[k] = S.cup[k].material;
      S.scanMat[k] = S.cup[k].material.clone();
      patchScan(S.scanMat[k], k);
    }
    S.scanMat.outer.side = THREE.DoubleSide;                          // the wall's inside shows in the section
    S.scene.add(S.cup.group);

    S.prof = outerProfile(S.cup);
    S.points = buildCloud(S.prof);
    S.scene.add(S.points);

    // Contour rings: level cuts through the lathe form, like a draughtsman's study, with
    // every fourth one drawn a little firmer (index contours, as on a survey map).
    S.rings = [];
    for (let k = 0; RING_Y(k) < 0.885; k++) {
      const y = RING_Y(k);
      if (y > 0.09 && y < 0.27) continue; // not through the stem: there they only read as a coil
      S.rings.push({ y, r: radiusAt(S.prof, y), major: k % 4 === 1 });
    }
    S.rings.push({ y: RIM_RING_Y, r: radiusAt(S.prof, RIM_RING_Y), major: true });
    S.rings.forEach((g) => {
      g.tIn = tDownAt(g.y);
      g.note = NOTES.findIndex((n) => Math.abs(n.y - g.y) < 1e-9);
    });
    S.v = new THREE.Vector3();

    // Where the cup sits on screen when the final glide begins (the type exits with the move).
    RB.setCam(S.camera, shotAt(CAM_MAKE[0]));
    S.camera.clearViewOffset();
    S.cupXRef = project(0, CUP_MID, 0)[0];
  }

  // ─── Projection ─────────────────────────────────────────────────────────────
  /** Screen position (logical px) of a world point for the (un-jittered) camera. */
  function project(x, y, z) {
    const v = S.v.set(x, y, z).project(S.camera);
    return [(v.x * 0.5 + 0.5) * R.W, (-v.y * 0.5 + 0.5) * R.H];
  }
  /** Focus distance for the cloud: the near wall of the bowl, facing the camera. */
  function focusAt(shot) {
    const d = Math.hypot(shot.pos[0], shot.pos[1] - CUP_MID, shot.pos[2]);
    return d - 0.45;
  }
  /** Logical px per world unit at the cup's axis for a shot. */
  function pxPerUnit(shot) {
    const d = [-shot.pos[0], CUP_MID - shot.pos[1], -shot.pos[2]];
    const f = [shot.look[0] - shot.pos[0], shot.look[1] - shot.pos[1], shot.look[2] - shot.pos[2]];
    const depth = (d[0] * f[0] + d[1] * f[1] + d[2] * f[2]) / Math.hypot(f[0], f[1], f[2]);
    return R.H / 2 / Math.tan((shot.fov * Math.PI) / 360) / depth;
  }
  /** World point on a horizontal circle (radius r at height y) at angle a from the camera's azimuth. */
  function ringPoint(r, y, a, camAz) {
    const th = camAz + a;
    return project(r * Math.sin(th), y, r * Math.cos(th));
  }

  // ─── 2D layers ──────────────────────────────────────────────────────────────
  /** Backdrop: the umber glow follows the cup a little, and the room dims a touch while
   *  the cloud is up (so the dust reads); exact defaults at both hand-offs. */
  function drawBackdrop(ctx, T, cupX) {
    const away = E.inOutSine(seg(T, 5.0, 5.9)) * (1 - E.inOutSine(seg(T, 6.95, T_END - 0.02)));
    if (away <= 0) { RB.atmos.backdrop(ctx); return; }
    RB.atmos.backdrop(ctx, { gx: lerp(1060, cupX + 60, away), gy: lerp(520, 500, away), gr: 900, warmth: 1, lift: lerp(1, 0.82, away) });
  }

  /** An arc of a level ring from angle a0 to a1 (relative to the camera azimuth). */
  function ringArc(ctx, g, a0, a1, camAz, steps) {
    ctx.beginPath();
    for (let k = 0; k <= steps; k++) {
      const [x, y] = ringPoint(g.r * 1.004, g.y, lerp(a0, a1, k / steps), camAz);
      if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.stroke();
  }

  /**
   * The contour rings: each draws on from the front, both ways round, as the scan plane
   * passes its height, and is taken back by the upward plane. Back arcs are fainter, and
   * hidden while the copper in front of them is still solid.
   */
  function drawRings(ctx, T, camAz, camY) {
    const cutDown = cutDownAt(T), cutUp = cutUpAt(T);
    ctx.save();
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    for (const g of S.rings) {
      const grow = E.outCubic(seg(T, g.tIn, g.tIn + 0.42));
      const alive = smooth01((g.y - cutUp) / 0.035);
      if (grow <= 0 || alive <= 0) continue;
      const A = grow * Math.PI;
      const backVis = smooth01((Math.min(camY, g.y) - cutDown) / 0.06) * smooth01((camY - cutUp - 0.02) / 0.1 + 1);
      const fa = (g.major ? 0.46 : 0.2) * alive, ba = (g.major ? 0.17 : 0.07) * alive * backVis;
      ctx.strokeStyle = R.rgba(PAL.ivory, fa);
      ringArc(ctx, g, -Math.min(A, Math.PI / 2), Math.min(A, Math.PI / 2), camAz, 36);
      if (A > Math.PI / 2 && ba > 0.003) {
        ctx.strokeStyle = R.rgba(PAL.ivory, ba);
        ringArc(ctx, g, Math.PI / 2, A, camAz, 24);
        ringArc(ctx, g, -Math.PI / 2, -A, camAz, 24);
      }
      const gl = g.note >= 0 ? glintAt(T, g.note) * alive : 0;
      if (gl > 0.003) {
        // the observed contour, traced in ember (front firm, back faint)
        ctx.strokeStyle = R.rgba(PAL.ember, 0.75 * gl);
        ringArc(ctx, g, -Math.PI / 2, Math.PI / 2, camAz, 48);
        ctx.strokeStyle = R.rgba(PAL.ember, 0.3 * gl * backVis);
        ringArc(ctx, g, Math.PI / 2, Math.PI * 1.5, camAz, 48);
      }
    }
    ctx.restore();
  }

  /** The scan plane: an ember hairline where it cuts the copper, with a faint sheet of light. */
  function drawBand(ctx, T, camAz, camY) {
    const b = bandAt(T), cut = cutAt(T);
    if (b <= 0.002 || cut < 0 || cut > 0.93) return;
    const r = Math.max(radiusAt(S.prof, clamp(cut, 0.002, 0.91)), 0.05) * 1.006;
    const g = { r, y: cut };
    const backVis = smooth01((camY - cut + 0.01) / 0.05);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    // the sheet: a soft level disc of light, wider than the cup
    const [lx] = ringPoint(r * 1.9, cut, -Math.PI / 2, camAz), [rx] = ringPoint(r * 1.9, cut, Math.PI / 2, camAz);
    const [, fy] = ringPoint(r * 1.9, cut, 0, camAz), [, by] = ringPoint(r * 1.9, cut, Math.PI, camAz);
    const rw = Math.abs(rx - lx) / 2, rh = Math.max(2, Math.abs(fy - by) / 2);
    ctx.save();
    ctx.translate((lx + rx) / 2, (fy + by) / 2);
    ctx.scale(1, rh / rw);
    const sheet = ctx.createRadialGradient(0, 0, 0, 0, 0, rw);
    sheet.addColorStop(0, R.rgba(PAL.ember, 0.06 * b));
    sheet.addColorStop(0.55, R.rgba(PAL.copperHot, 0.03 * b));
    sheet.addColorStop(1, R.rgba(PAL.copperHot, 0));
    ctx.fillStyle = sheet;
    ctx.beginPath(); ctx.arc(0, 0, rw, 0, TAU); ctx.fill();
    ctx.restore();
    // the line where the plane meets the copper: a soft glow under a hot hairline
    const passes = [[4, 0.12], [1.2, 0.8]];
    for (const [w, a] of passes) {
      ctx.lineWidth = w;
      ctx.strokeStyle = R.rgba(w > 2 ? PAL.copperHot : '#ffe2c8', a * b);
      ringArc(ctx, g, -Math.PI / 2, Math.PI / 2, camAz, 48);
      if (backVis > 0.01) {
        ctx.strokeStyle = R.rgba(w > 2 ? PAL.copperHot : '#ffe2c8', a * b * 0.45 * backVis);
        ringArc(ctx, g, Math.PI / 2, Math.PI * 1.5, camAz, 48);
      }
    }
    ctx.restore();
  }

  /**
   * The three observations, anchored on the form, leaders running level into one label
   * column that travels with the cup (it sits a fixed distance off the rim).
   */
  function drawNotes(ctx, T, camAz, cupX, ppu) {
    const colX = cupX + NOTE_OFF * ppu;
    for (const n of NOTES) {
      if (T < n.tIn || T > n.tOut + 0.4) continue;
      const r = radiusAt(S.prof, n.y);
      const [ax, ay] = ringPoint(r, n.y, n.az, camAz);
      RB.type.annotation(ctx, T, { text: n.text, x: colX, y: ay, ax, ay, tIn: n.tIn, tOut: n.tOut });
    }
  }

  /**
   * Kicker and story line, through the kit (exact storyboard tIn/tOut). They are drawn into
   * a small buffer so the exit can be completed a little sooner than the kit's own fade:
   * the cup glides into their place for the downbeat, and it must never slide under
   * legible type. The kit's lift-and-fade still plays; the extra fade only shortens its
   * tail, and a touch of parallax lets the words drift with the camera as they go.
   */
  function drawType(ctx, T, cupX) {
    if (T < KICKER.tIn || T > TYPE_GONE) return;
    const dx = T > CAM_MAKE[0] ? TYPE_PARALLAX * (cupX - S.cupXRef) : 0;
    const fade = 1 - E.inOutSine(seg(T, LINE.tOut, TYPE_GONE));
    const b = R.buffer('s2-type', TYPE_BOX.w, TYPE_BOX.h);
    b.clear();
    RB.type.kicker(b.ctx, T, { ...KICKER, x: KICKER.x + dx - TYPE_BOX.x, y: KICKER.y - TYPE_BOX.y });
    RB.type.line(b.ctx, T, { ...LINE, x: LINE.x + dx - TYPE_BOX.x, y: LINE.y - TYPE_BOX.y });
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.drawImage(b.canvas, TYPE_BOX.x, TYPE_BOX.y, TYPE_BOX.w, TYPE_BOX.h);
    ctx.restore();
  }

  // ─── Frame ──────────────────────────────────────────────────────────────────
  function draw(ctx, t, env) {
    const T = env.T;

    // camera (projections are un-jittered; draw3D applies the sub-pixel jitter itself)
    const shot = shotAt(T);
    RB.setCam(S.camera, shot);
    S.camera.clearViewOffset();
    const camAz = Math.atan2(shot.pos[0], shot.pos[2]); // the camera's azimuth about the cup's axis
    const camY = shot.pos[1];

    // the scan state
    const solid = T <= T0 || T >= SOLID_AGAIN;
    const cut = solid ? 99 : cutAt(T), band = solid ? 0 : bandAt(T);

    // pose the world
    S.cup.group.position.set(0, 0, 0);
    S.cup.group.rotation.set(0, 0, 0);
    S.cup.group.visible = cut > Y_BOT + 0.005;                        // nothing solid left while the cloud hangs
    for (const k of S.parts) S.cup[k].material = solid ? S.plainMat[k] : S.scanMat[k];
    S.scan.uCut.value = cut;
    S.scan.uHeat.value = band;
    const g = taleGlowAt(T);
    for (const set of [S.plainMat, S.scanMat]) {
      set.rim.emissiveIntensity = 0.55 * g;
      set.inner.emissiveIntensity = 0.45 * g;
    }

    const pu = S.points.material.uniforms;
    S.points.visible = !solid;
    S.points.rotation.set(0, turnAt(T), 0);
    pu.uCut.value = cut;
    pu.uBand.value = band;
    pu.uLift.value = liftAt(T);
    pu.uTime.value = T;
    pu.uSize.value = 6.8 * R.scale;
    pu.uAlpha.value = 1;
    pu.uFocus.value = focusAt(shot);
    pu.uGlintA.value.set(glintAt(T, 0), glintAt(T, 1), glintAt(T, 2));

    // ── paint ──
    const [cupX] = project(0, CUP_MID, 0);
    const ppu = pxPerUnit(shot);
    drawBackdrop(ctx, T, cupX);
    RB.draw3D(ctx, S.scene, S.camera);
    if (!solid) {
      drawRings(ctx, T, camAz, camY);
      drawBand(ctx, T, camAz, camY);
    }
    drawNotes(ctx, T, camAz, cupX, ppu);
    drawType(ctx, T, cupX);
  }

  R.scene({
    id: 'understand', index: 2, label: 'Understand', start: 5, end: 7.5,
    init,
    draw,
    rail: (t) => ({ alpha: E.outCubic(seg(t, 0, 0.5)), active: 1, progress: t / 2.5 }),
  });
})();
