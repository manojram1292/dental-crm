/*
 * Ribhu film kit — the shared look and the shared objects.
 *
 *   RB.gl        one three.js renderer for the whole film; draw3D() composites a
 *                3D scene into the 2D frame and applies the motion-blur jitter
 *   RB.stage()   a scene pre-lit like the Ribhu workshop (warm key, rim, umber bounce)
 *   RB.mat       copper, charcoal, graphite, ivory ceramic, stone
 *   RB.cup()     the hand-hammered copper cup — the object the story is about
 *   RB.mark3D()  the exact three-flame logo, extruded; each flame animatable
 *   RB.mark2D()  the flat logo for lockups; RB.wordmark() the "Ribhu Labs" type
 *   RB.type      the film's single typographic voice (story lines, kickers, labels)
 *   RB.atmos     backdrop, light shafts, dust motes; RB.fx.ember() glowing sparks
 *   RB.shots     hand-off contracts between scenes (cameras, positions)
 *
 * Everything here is deterministic. Objects are built once (in a scene's init)
 * and posed from time in draw().
 */
(function () {
  'use strict';
  const R = window.REEL;
  const { PAL, E, clamp, lerp, seg, font } = R;
  const THREE = window.THREE, ADD = window.THREE_ADDONS;

  // ─── Renderer ───────────────────────────────────────────────────────────────
  const gl = { renderer: null, canvas: null, w: 0, h: 0, env: null };
  function renderer() {
    const w = Math.round(R.W * R.scale), h = Math.round(R.H * R.scale);
    if (!gl.renderer) {
      gl.canvas = document.createElement('canvas');
      gl.renderer = new THREE.WebGLRenderer({
        canvas: gl.canvas, alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true,
        antialias: R.live, // offline renders anti-alias through jittered motion-blur samples instead
        powerPreference: 'high-performance',
      });
      gl.renderer.outputColorSpace = THREE.SRGBColorSpace;
      gl.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      gl.renderer.setClearColor(0x000000, 0);
    }
    if (gl.w !== w || gl.h !== h) { gl.renderer.setSize(w, h, false); gl.w = w; gl.h = h; }
    return gl.renderer;
  }

  /** Render a three.js scene with the shared renderer (+ sub-pixel jitter). Returns the GL canvas. */
  function render3D(scene, camera, { exposure = 1 } = {}) {
    const r = renderer();
    r.toneMappingExposure = exposure;
    const [jx, jy] = R.jitter;
    if (jx || jy) camera.setViewOffset(gl.w, gl.h, jx, jy, gl.w, gl.h);
    else camera.clearViewOffset();
    r.render(scene, camera);
    // Don't let the jitter leak into later toScreen()/project() calls for 2D placement.
    if (jx || jy) camera.clearViewOffset();
    return gl.canvas;
  }
  /** Render and composite into the 2D frame. opts: { exposure, alpha, blend, filter } */
  function draw3D(ctx, scene, camera, opts = {}) {
    const c = render3D(scene, camera, opts);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = opts.alpha == null ? 1 : opts.alpha;
    ctx.globalCompositeOperation = opts.blend || 'source-over';
    if (opts.filter) ctx.filter = opts.filter;
    ctx.drawImage(c, 0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }

  /** Perspective camera with the film's aspect. */
  function camera(fov = 30) {
    return new THREE.PerspectiveCamera(fov, R.W / R.H, 0.05, 200);
  }
  /** Pose a camera: { pos:[x,y,z], look:[x,y,z], fov?, roll? } (roll in radians). */
  function setCam(cam, { pos, look, fov, roll = 0 }) {
    cam.position.set(pos[0], pos[1], pos[2]);
    cam.up.set(Math.sin(roll), Math.cos(roll), 0);
    cam.lookAt(look[0], look[1], look[2]);
    if (fov != null && cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
    cam.updateMatrixWorld(true);
    return cam;
  }
  /** Interpolate two shot descriptors { pos, look, fov, roll } at p ∈ [0,1]. */
  function lerpShot(a, b, p) {
    const l3 = (u, v) => [lerp(u[0], v[0], p), lerp(u[1], v[1], p), lerp(u[2], v[2], p)];
    return { pos: l3(a.pos, b.pos), look: l3(a.look, b.look), fov: lerp(a.fov, b.fov, p), roll: lerp(a.roll || 0, b.roll || 0, p) };
  }
  /** Screen position (logical px) of a world point for a posed camera. */
  function toScreen(cam, x, y, z) {
    const v = new THREE.Vector3(x, y, z).project(cam);
    return [(v.x * 0.5 + 0.5) * R.W, (-v.y * 0.5 + 0.5) * R.H, v.z];
  }

  // ─── Workshop lighting ──────────────────────────────────────────────────────
  /** Warm studio environment for reflections: dark umber room, a big warm softbox, a rim strip. */
  function workshopEnv() {
    if (gl.env) return gl.env;
    const r = renderer();
    const scene = new THREE.Scene();
    const room = new THREE.Mesh(new THREE.BoxGeometry(24, 14, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color('#1c1612'), side: THREE.BackSide }));
    scene.add(room);
    const panel = (w, h, color, k, pos) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(pos[0], pos[1], pos[2]); m.lookAt(0, 0, 0); scene.add(m);
    };
    panel(7, 5, '#ffe0bd', 7.5, [-6, 6, 5]);     // key softbox, high front-left
    panel(1.4, 9, '#ffcf9e', 5.0, [7, 2.5, -4]); // rim strip, right-back
    panel(9, 1.2, '#ffd6a8', 2.2, [0, 6.5, -7]); // top-back strip
    panel(24, 3, '#3b2b20', 1.2, [0, -6.5, 0]);  // warm floor bounce
    panel(3, 3, '#b46f43', 1.6, [-8, 0.5, -5]);  // copper kick from the left-back
    panel(12, 7, '#ffe4c8', 1.5, [1, 2.5, 10]);   // broad front fill (behind camera) — metal needs something to reflect
    panel(18, 0.5, '#fff0dc', 6.0, [0, 1.6, 9]);  // horizon strip — the product-shot highlight line
    panel(4, 2.5, '#ffd2a6', 3.0, [5, 4, 7]);     // front-right accent
    const pm = new THREE.PMREMGenerator(r);
    gl.env = pm.fromScene(scene, 0.035).texture;
    pm.dispose();
    return gl.env;
  }

  /**
   * A three.js scene pre-lit in the Ribhu workshop look.
   * Returns { scene, camera, key, rim } — add your meshes to `scene`.
   */
  function stage({ fov = 30, envIntensity = 1, key = 2.2 } = {}) {
    const scene = new THREE.Scene();
    scene.environment = workshopEnv();
    scene.environmentIntensity = envIntensity;
    const keyLight = new THREE.DirectionalLight('#ffd9b3', key);
    keyLight.position.set(-3.5, 5, 4);
    scene.add(keyLight);
    const rim = new THREE.DirectionalLight('#ffb98a', key * 0.9);
    rim.position.set(4, 2.5, -4);
    scene.add(rim);
    return { scene, camera: camera(fov), key: keyLight, rim };
  }

  // ─── Materials ──────────────────────────────────────────────────────────────
  const mat = {
    copper: (o = {}) => new THREE.MeshPhysicalMaterial({ color: PAL.copper, metalness: 1, roughness: 0.27, ...o }),
    copperPolished: (o = {}) => new THREE.MeshPhysicalMaterial({ color: '#c47a4b', metalness: 1, roughness: 0.15, ...o }),
    copperInner: (o = {}) => new THREE.MeshPhysicalMaterial({ color: '#8a4f2d', metalness: 1, roughness: 0.42, ...o }),
    charcoal: (o = {}) => new THREE.MeshPhysicalMaterial({ color: PAL.charcoal, metalness: 0.85, roughness: 0.34, ...o }),
    graphite: (o = {}) => new THREE.MeshPhysicalMaterial({ color: '#1e201e', metalness: 0.65, roughness: 0.42, clearcoat: 0.3, clearcoatRoughness: 0.4, ...o }),
    ivory: (o = {}) => new THREE.MeshPhysicalMaterial({ color: PAL.ivory, metalness: 0, roughness: 0.4, clearcoat: 0.55, clearcoatRoughness: 0.28, ...o }),
    stone: (o = {}) => new THREE.MeshStandardMaterial({ color: '#4a423b', metalness: 0, roughness: 0.93, ...o }),
    glow: (color = PAL.ember, o = {}) => new THREE.MeshBasicMaterial({ color: new THREE.Color(color), toneMapped: false, ...o }),
  };

  // ─── The cup ────────────────────────────────────────────────────────────────
  // Profile (radius, height) from the foot up the outside, over the rim, down the inside.
  const CUP_OUTER = [[0.0, 0.0], [0.27, 0.0], [0.305, 0.012], [0.3, 0.05], [0.2, 0.085], [0.125, 0.13], [0.115, 0.19], [0.17, 0.25], [0.33, 0.33], [0.47, 0.45], [0.555, 0.6], [0.595, 0.75], [0.612, 0.87]];
  const CUP_RIM = [[0.61, 0.9], [0.598, 0.912], [0.583, 0.903]];
  const CUP_INNER = [[0.572, 0.84], [0.55, 0.7], [0.5, 0.56], [0.41, 0.44], [0.27, 0.35], [0.12, 0.3], [0.0, 0.29]];
  const CUP_HEIGHT = 0.912, CUP_RIM_R = 0.61;

  function smoothProfile(pts, samples) {
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, y, 0)), false, 'centripetal');
    return curve.getSpacedPoints(samples).map((v) => new THREE.Vector2(Math.max(0, v.x), v.y));
  }

  /**
   * The hand-hammered copper cup (height ≈ 0.91, rim radius ≈ 0.61; foot at y=0).
   * Returns { group, outer, inner, height, rimRadius }.
   */
  function cup({ segments = 160, hammer = 1, seed = 11 } = {}) {
    const outerPts = smoothProfile(CUP_OUTER.concat(CUP_RIM.slice(0, 1)), 70);
    const rimPts = smoothProfile(CUP_RIM, 10);
    const innerPts = smoothProfile(CUP_RIM.slice(-1).concat(CUP_INNER), 50);
    const lathe = (pts, displace) => {
      const g = new THREE.LatheGeometry(pts, segments);
      if (displace) {
        // Hammered dimples on the outer bowl: small, dense, irregular — a maker's marks.
        const pos = g.attributes.position, n = pts.length;
        for (let i = 0; i <= segments; i++) for (let j = 0; j < n; j++) {
          const k = i * n + j, y = pts[j].y;
          const w = smoothstep01(0.24, 0.34, y) * (1 - smoothstep01(0.8, 0.88, y));
          if (w <= 0) continue;
          const a = ((i % segments) / segments) * Math.PI * 2;
          const d = hammerField(a, y, seed) * 0.0055 * hammer * w;
          const x = pos.getX(k), z = pos.getZ(k), r = Math.hypot(x, z) || 1;
          pos.setX(k, x + (x / r) * d); pos.setZ(k, z + (z / r) * d);
        }
      }
      g.computeVertexNormals();
      // Weld the φ=0 / φ=2π seam normals, or a hairline shows where the lathe closes
      // (it faces the camera at rotation 0). Idempotent, so scenes that weld too are unaffected.
      const nrm = g.attributes.normal, n = pts.length;
      for (let j = 0; j < n; j++) {
        const a = j, b = segments * n + j;
        const v = new THREE.Vector3(nrm.getX(a) + nrm.getX(b), nrm.getY(a) + nrm.getY(b), nrm.getZ(a) + nrm.getZ(b)).normalize();
        nrm.setXYZ(a, v.x, v.y, v.z); nrm.setXYZ(b, v.x, v.y, v.z);
      }
      return g;
    };
    const group = new THREE.Group();
    const outer = new THREE.Mesh(lathe(outerPts, true), mat.copper());
    const rim = new THREE.Mesh(lathe(rimPts, false), mat.copperPolished());
    const inner = new THREE.Mesh(lathe(innerPts, false), mat.copperInner({ side: THREE.DoubleSide }));
    group.add(outer, rim, inner);
    return { group, outer, rim, inner, height: CUP_HEIGHT, rimRadius: CUP_RIM_R };
  }
  function smoothstep01(a, b, x) { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  // Cellular-ish dimple field: negative bowls around jittered cell centres.
  function hammerField(a, y, seed) {
    const u = a * 9.5, v = y * 30;
    const iu = Math.floor(u), iv = Math.floor(v);
    let best = 9;
    for (let du = -1; du <= 1; du++) for (let dv = -1; dv <= 1; dv++) {
      const cu = iu + du, cv = iv + dv;
      const ju = cu + R.hash(cu * 131 + cv * 71, seed), jv = cv + R.hash(cu * 17 + cv * 331, seed + 1);
      const uu = (((u - ju) % 9.5) + 9.5) % 9.5, dd = Math.min(uu, 9.5 - uu);
      best = Math.min(best, Math.hypot(dd, v - jv));
    }
    return -(Math.max(0, 1 - best * 1.25) ** 2);
  }

  /** Uniform surface samples of the cup (for point clouds / scans). Returns Float32Array xyz. */
  function cupPoints(count = 6000, seed = 5) {
    const outerPts = smoothProfile(CUP_OUTER.concat(CUP_RIM), 120);
    // area-weighted along the profile: weight ∝ radius × segment length
    const w = [], acc = [0];
    for (let i = 1; i < outerPts.length; i++) {
      const a = outerPts[i - 1], b = outerPts[i];
      w.push(((a.x + b.x) / 2) * Math.hypot(b.x - a.x, b.y - a.y) + 1e-6);
      acc.push(acc[i - 1] + w[i - 1]);
    }
    const total = acc[acc.length - 1], r = R.rng(seed), out = new Float32Array(count * 3);
    for (let n = 0; n < count; n++) {
      const u = r() * total;
      let i = 1; while (i < acc.length - 1 && acc[i] < u) i++;
      const f = (u - acc[i - 1]) / (acc[i] - acc[i - 1] || 1);
      const x = lerp(outerPts[i - 1].x, outerPts[i].x, f), y = lerp(outerPts[i - 1].y, outerPts[i].y, f);
      const th = r() * Math.PI * 2;
      out[n * 3] = Math.cos(th) * x; out[n * 3 + 1] = y; out[n * 3 + 2] = Math.sin(th) * x;
    }
    return out;
  }

  /** Soft contact shadow under an object (a ground-plane disc). */
  function contactShadow(radius = 0.9, opacity = 0.55) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(0,0,0,1)'); grd.addColorStop(0.45, 'rgba(0,0,0,0.55)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity, depthWrite: false, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.002;
    return m;
  }

  /** A stone plinth / workbench slab, top face at y=0. */
  function plinth({ w = 3.2, h = 0.5, d = 2.2, seed = 3 } = {}) {
    const g = new ADD.RoundedBoxGeometry(w, h, d, 4, 0.035);
    const pos = g.attributes.position, col = new Float32Array(pos.count * 3), base = new THREE.Color('#453d36');
    for (let i = 0; i < pos.count; i++) {
      const v = 0.82 + 0.3 * (R.noise.fbm3(pos.getX(i) * 3.1, pos.getY(i) * 3.1, pos.getZ(i) * 3.1 + seed, 3) * 0.5 + 0.5);
      col[i * 3] = base.r * v; col[i * 3 + 1] = base.g * v; col[i * 3 + 2] = base.b * v;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new THREE.Mesh(g, mat.stone({ color: '#ffffff', vertexColors: true }));
    m.position.y = -h / 2;
    return m;
  }

  // ─── The mark ───────────────────────────────────────────────────────────────
  // The owner's three-flame logo, verbatim (public/brand/ribhu-mark.svg). Not to be reinterpreted.
  const MARK = {
    viewBox: [160, 60, 550, 700],
    paths: [
      { d: 'M490 86 C515 153 481 207 405 258 C335 305 297 349 303 413 C307 468 352 522 417 560 C384 505 384 463 413 417 C443 366 506 330 544 282 C583 233 560 155 490 86 Z', fill: '#b46f43', role: 'copper' },
      { d: 'M254 399 C206 440 177 496 186 558 C193 612 221 657 270 678 C349 713 443 654 501 557 C460 585 415 590 370 580 C333 545 297 544 274 516 C242 480 239 440 254 399 Z', fill: '#292925', role: 'charcoal' },
      { d: 'M543 333 C498 369 461 421 445 482 C486 449 530 489 544 531 C562 592 504 679 383 722 C474 749 561 725 620 674 C678 624 695 558 658 503 C620 449 535 421 543 333 Z', fill: '#292925', role: 'charcoal' },
    ],
    // Content bounds of the three paths (SVG units) — used to centre and size the mark.
    bounds: { x0: 180, y0: 86, x1: 694, y1: 745 },
  };
  const markPath2D = MARK.paths.map((p) => new Path2D(p.d));

  /**
   * Draw the flat mark centred at (cx, cy) with the given height (logical px).
   * opts: { alpha, fills:[copper, a, b], each:[1,1,1] (per-flame alpha) }
   */
  function mark2D(ctx, cx, cy, height, opts = {}) {
    const b = MARK.bounds, s = height / (b.y1 - b.y0);
    ctx.save();
    ctx.globalAlpha *= opts.alpha == null ? 1 : opts.alpha;
    ctx.translate(cx - ((b.x0 + b.x1) / 2) * s, cy - ((b.y0 + b.y1) / 2) * s);
    ctx.scale(s, s);
    const base = ctx.globalAlpha;
    MARK.paths.forEach((p, i) => {
      ctx.globalAlpha = base * (opts.each ? opts.each[i] : 1);
      ctx.fillStyle = (opts.fills && opts.fills[i]) || p.fill;
      ctx.fill(markPath2D[i]);
    });
    ctx.restore();
  }

  /** Parse the logo's M/C/Z path data into a THREE.Shape (y flipped, normalised to height 1, centred). */
  function markShape(d) {
    const b = MARK.bounds, s = 1 / (b.y1 - b.y0), cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
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
   * The logo in 3D: three extruded, bevelled flames (height 1, centred at origin, facing +z).
   * Each flame is its own pivot group (pivot at the flame's centroid) so the three can move
   * independently and land exactly in the logo. Returns { group, flames:[copper, left, right], home }.
   * `home[i]` is each flame's resting position — assemble by lerping to it.
   */
  function mark3D({ depth = 0.09, bevel = 0.012 } = {}) {
    const group = new THREE.Group(), flames = [], home = [];
    MARK.paths.forEach((p, i) => {
      const geo = new THREE.ExtrudeGeometry(markShape(p.d), { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.7, bevelSegments: 5, curveSegments: 64 });
      geo.translate(0, 0, -depth / 2);
      geo.computeBoundingBox();
      const c = new THREE.Vector3(); geo.boundingBox.getCenter(c);
      geo.translate(-c.x, -c.y, -c.z);
      const m = p.role === 'copper' ? mat.copper({ roughness: 0.24 }) : mat.charcoal();
      const mesh = new THREE.Mesh(geo, m);
      const pivot = new THREE.Group();
      pivot.add(mesh);
      pivot.position.copy(c);
      group.add(pivot);
      flames.push(pivot); home.push(c.clone());
    });
    return { group, flames, home };
  }

  /** "Ribhu Labs" wordmark in the site's display face. Returns its width. */
  function wordmark(ctx, x, y, size, { color = PAL.ivory, align = 'left', alpha = 1 } = {}) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.font = font(size, 'display', 500);
    ctx.letterSpacing = `${(-0.04 * size).toFixed(2)}px`;
    ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    ctx.fillText('Ribhu Labs', x, y);
    const w = ctx.measureText('Ribhu Labs').width;
    ctx.restore();
    return w;
  }

  // ─── Typography: one voice for the whole film ───────────────────────────────
  /**
   * A story line. Words rise out of a mask on their own line (outExpo, staggered),
   * hold, then lift and fade. Multi-line with '\n'.
   * spec: { text, x, y (first baseline), size=56, family='body', weight=500, color=ivory,
   *         align='left', tIn, tOut (absolute seconds; tOut optional), stagger=0.055,
   *         dur=0.75, leading=1.12, accent: { word, color } }
   * `T` is ABSOLUTE time (env.T) so lines can straddle scene cuts consistently.
   */
  function storyLine(ctx, T, spec) {
    const { text, x, y, size = 56, family = 'body', weight = 500, color = PAL.ivory, align = 'left', tIn, tOut, stagger = 0.055, dur = 0.75, leading = 1.12, accent } = spec;
    if (T < tIn || (tOut != null && T > tOut + 0.6)) return;
    ctx.save();
    ctx.font = font(size, family, weight);
    ctx.letterSpacing = `${(family === 'display' ? -0.035 : -0.018) * size}px`;
    ctx.textBaseline = 'alphabetic';
    const lines = text.split('\n');
    let wi = 0;
    lines.forEach((line, li) => {
      const by = y + li * size * leading;
      const words = line.split(' ');
      const spaceW = ctx.measureText(' ').width;
      const widths = words.map((w) => ctx.measureText(w).width);
      const total = widths.reduce((s, w) => s + w, 0) + spaceW * (words.length - 1);
      let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
      // mask: the line's own band — words rise into it from below
      ctx.save();
      ctx.beginPath(); ctx.rect(cx - size, by - size * 1.05, total + size * 2, size * 1.36); ctx.clip();
      words.forEach((w, k) => {
        const tStart = tIn + wi * stagger;
        const pIn = E.outExpo(seg(T, tStart, tStart + dur));
        const pOut = tOut == null ? 0 : E.inCubic(seg(T, tOut + wi * stagger * 0.4, tOut + wi * stagger * 0.4 + 0.42));
        const dy = (1 - pIn) * size * 1.05 - pOut * size * 0.35;
        ctx.globalAlpha = clamp(seg(T, tStart, tStart + dur * 0.35)) * (1 - pOut);
        ctx.fillStyle = accent && accent.word === w ? accent.color : color;
        if (ctx.globalAlpha > 0.002) ctx.fillText(w, cx, by + dy);
        cx += widths[k] + spaceW;
        wi++;
      });
      ctx.restore();
    });
    ctx.restore();
  }

  /**
   * Chapter kicker: "01 ── UNDERSTAND". Index in ember, a copper rule that draws on,
   * the label typing on. spec: { index, label, x, y, tIn, tOut }
   */
  function kicker(ctx, T, { index, label, x, y, tIn, tOut, align = 'left', size = 20 }) {
    if (T < tIn || (tOut != null && T > tOut + 0.5)) return;
    const pOut = tOut == null ? 0 : E.inCubic(seg(T, tOut, tOut + 0.4));
    const a = (1 - pOut) * clamp(seg(T, tIn, tIn + 0.15));
    ctx.save();
    ctx.font = font(size, 'mono', 700);
    ctx.letterSpacing = `${(size * 0.2).toFixed(1)}px`;
    ctx.textBaseline = 'middle';
    const idxW = ctx.measureText(index).width;
    ctx.font = font(size, 'mono', 400);
    const labW = ctx.measureText(label).width;
    const rule = size * 2.3, gap = size * 0.9;
    const total = idxW + gap + rule + gap + labW;
    let x0 = align === 'center' ? x - total / 2 : x;
    ctx.globalAlpha = a;
    ctx.font = font(size, 'mono', 700); ctx.fillStyle = PAL.ember;
    ctx.fillText(index, x0, y);
    const pr = E.outExpo(seg(T, tIn + 0.08, tIn + 0.6));
    ctx.fillStyle = PAL.copperHot;
    ctx.fillRect(x0 + idxW + gap, y - 1, rule * pr, 2);
    const n = Math.floor(label.length * clamp(seg(T, tIn + 0.2, tIn + 0.2 + label.length * 0.028)));
    ctx.font = font(size, 'mono', 400); ctx.fillStyle = PAL.ivory; ctx.globalAlpha = a * 0.78;
    ctx.fillText(label.slice(0, n), x0 + idxW + gap + rule + gap, y);
    ctx.restore();
  }

  /**
   * Annotation label with a leader line from an anchor point: small mono caps.
   * spec: { text, x, y (label pos), ax, ay (anchor), tIn, tOut, align }
   */
  function annotation(ctx, T, { text, x, y, ax, ay, tIn, tOut, align = 'left', color = PAL.ivory, size = 20 }) {
    if (T < tIn || (tOut != null && T > tOut + 0.4)) return;
    const pOut = tOut == null ? 0 : E.inCubic(seg(T, tOut, tOut + 0.3));
    const pl = E.outExpo(seg(T, tIn, tIn + 0.45));
    ctx.save();
    ctx.globalAlpha = 1 - pOut;
    if (ax != null) {
      ctx.strokeStyle = R.rgba(PAL.ivory, 0.55); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lerp(ax, x, pl), lerp(ay, y, pl)); ctx.stroke();
      R.fillCircle(ctx, ax, ay, 4 * pl, PAL.ember);
    }
    ctx.font = font(size, 'mono', 500); ctx.letterSpacing = `${(size * 0.16).toFixed(1)}px`; ctx.textBaseline = 'middle';
    ctx.textAlign = align; ctx.fillStyle = color;
    const n = Math.floor(text.length * clamp(seg(T, tIn + 0.15, tIn + 0.15 + text.length * 0.022)));
    ctx.globalAlpha = (1 - pOut) * 0.92;
    ctx.fillText(text.slice(0, n), x + (align === 'left' ? 10 : align === 'right' ? -10 : 0), y);
    ctx.restore();
  }

  // ─── Atmosphere ─────────────────────────────────────────────────────────────
  /**
   * Painted backdrop: graphite ground with a warm umber glow behind the subject.
   * opts: { gx, gy (glow centre), gr (radius), warmth 0..1, lift 0..1 }
   */
  function backdrop(ctx, { gx = 1060, gy = 520, gr = 900, warmth = 1, lift = 1 } = {}) {
    ctx.fillStyle = PAL.ink; ctx.fillRect(0, 0, R.W, R.H);
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
    g.addColorStop(0, R.mix(PAL.graphite, '#5a4434', 0.75 * warmth, 1 * lift));
    g.addColorStop(0.35, R.mix(PAL.graphite, PAL.umber, 0.8 * warmth, 0.9 * lift));
    g.addColorStop(1, R.rgba(PAL.ink, 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, R.W, R.H);
  }

  /** A soft beam of light: from (x, y) at `angle` (rad, 0 = down), spreading to `width` over `length`. */
  function shaft(ctx, { x = 700, y = -80, angle = -0.32, length = 1500, width = 520, alpha = 0.16, color = '#ffd9b0' } = {}) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(angle);
    const g = ctx.createLinearGradient(0, 0, 0, length);
    g.addColorStop(0, R.rgba(color, alpha)); g.addColorStop(0.6, R.rgba(color, alpha * 0.45)); g.addColorStop(1, R.rgba(color, 0));
    ctx.globalCompositeOperation = 'screen';
    ctx.filter = R.blur(28);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-width * 0.12, 0); ctx.lineTo(width * 0.12, 0); ctx.lineTo(width / 2, length); ctx.lineTo(-width / 2, length); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  /**
   * Dust motes drifting through the light — deterministic in absolute time T so they
   * continue seamlessly across cuts. opts: { count, seed, rect:[x,y,w,h], alpha, size }
   */
  function dust(ctx, T, { count = 90, seed = 21, rect = [0, 0, R.W, R.H], alpha = 0.55, size = 1.6, drift = 14 } = {}) {
    const [rx, ry, rw, rh] = rect;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < count; i++) {
      const h1 = R.hash(i, seed), h2 = R.hash(i, seed + 1), h3 = R.hash(i, seed + 2), h4 = R.hash(i, seed + 3);
      const x = rx + ((h1 * rw + T * drift * (h3 - 0.35) + R.noise.n2(i * 1.7, T * 0.25) * 22) % rw + rw) % rw;
      const y = ry + ((h2 * rh - T * drift * (0.4 + h4) + R.noise.n2(i * 2.3 + 9, T * 0.2) * 16) % rh + rh) % rh;
      const tw = 0.45 + 0.55 * Math.max(0, Math.sin(T * (0.9 + h3 * 1.6) + h4 * 6.28));
      const r = size * (0.5 + h3 * 1.2);
      ctx.globalAlpha = alpha * tw * (0.35 + h4 * 0.65);
      R.fillCircle(ctx, x, y, r, h1 > 0.8 ? PAL.ember : '#fff1dc');
    }
    ctx.restore();
  }

  /** A glowing ember/spark at (x, y): hot core, copper halo. opts: { intensity, color, core } */
  function ember(ctx, x, y, r, { intensity = 1, color = PAL.ember, core = '#fff4e6' } = {}) {
    if (intensity <= 0.001 || r <= 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
    halo.addColorStop(0, R.rgba(color, 0.55 * intensity)); halo.addColorStop(0.25, R.rgba(PAL.copperHot, 0.22 * intensity)); halo.addColorStop(1, R.rgba(PAL.copperHot, 0));
    ctx.fillStyle = halo; ctx.fillRect(x - r * 6, y - r * 6, r * 12, r * 12);
    const c = ctx.createRadialGradient(x, y, 0, x, y, r);
    c.addColorStop(0, R.rgba(core, intensity)); c.addColorStop(0.55, R.rgba(color, 0.85 * intensity)); c.addColorStop(1, R.rgba(color, 0));
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // ─── Hand-off contracts (see STORYBOARD.md) ─────────────────────────────────
  const shots = {
    /** S1 → S2 at T=5.0: the cup (at world origin, rotation 0) in its hero framing. */
    cupHero: { pos: [0.0, 0.78, 3.35], look: [0.0, 0.46, 0], fov: 30 },
    /** S2 → S3 at T=7.5: the solid cup, slightly lower-left, room for the hand upper-right. */
    cupMake: { pos: [0.55, 1.05, 3.05], look: [0.28, 0.5, 0], fov: 32 },
    /** S3 → S4 at T=10.0: four cups in a row (world x below), camera wide. */
    row4: { pos: [0, 1.35, 6.4], look: [0, 0.42, 0], fov: 32 },
    rowX: [-2.1, -0.7, 0.7, 2.1],
    /** S4 → S5 at T=15.0: same row, pulled back a touch further. */
    row4Wide: { pos: [0, 1.6, 7.6], look: [0, 0.45, 0], fov: 32 },
    /** S5 → S6 at T=17.5: a single ember at this screen point (logical px) on the dark backdrop. */
    palmSpark: { x: 960, y: 500, r: 13 },
    /** S6 → S7 at T=22.5: the ember rising, at this screen point. */
    riseSpark: { x: 960, y: 430, r: 12 },
  };

  window.RB = {
    THREE, ADD,
    gl: { renderer, render3D }, draw3D, camera, setCam, lerpShot, toScreen,
    stage, workshopEnv, mat,
    cup, cupPoints, contactShadow, plinth, CUP: { height: CUP_HEIGHT, rimRadius: CUP_RIM_R },
    MARK, mark2D, mark3D, wordmark,
    type: { line: storyLine, kicker, annotation },
    atmos: { backdrop, shaft, dust },
    fx: { ember },
    shots,
  };
})();
