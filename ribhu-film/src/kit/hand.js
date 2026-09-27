/*
 * RB.hand — the Ribhu robotic hand, the film's second protagonist.
 *
 * An illustrative instrument (a concept, not a product): gunmetal-graphite shells with
 * crowned backs and crisp fillets, charcoal joint cores, copper pin caps, copper-banded
 * knuckle drums and a copper hairline under the back plate, matte grip pads, tendon cables,
 * a Cardan wrist, and the ivory ceramic sensor module with two dark glass lenses — the
 * website's identity. Procedural, deterministic, built once in create(). ~55k triangles.
 *
 * ── Core API ─────────────────────────────────────────────────────────────────
 *   const h = RB.hand.create({ side: 'right', forearm: 2.6 });   // in init() (~20 ms)
 *   stage.scene.add(h.group);
 *
 *   h.group            THREE.Group whose origin is the wrist joint centre. The forearm extends
 *                      along +Y (length `forearm`, enough to leave frame). At wrist [0,0,0] the
 *                      hand hangs along −Y, the palm faces −Z, the back of the hand (sensor
 *                      module) faces +Z, the thumb is on +X. side:'left' is a true mirror image.
 *                      Wrist→middle fingertip ≈ 1.25, palm width ≈ 0.55 (the cup is 0.91 tall).
 *   h.setPose(pose)    sets EVERY joint absolutely from `pose` — pure and idempotent: call it in
 *                      every draw, nothing accumulates. Missing fields fall back to neutral.
 *                      A built-in guard stops the thumb at first contact if curled fingers or
 *                      the palm are in its way (deterministic, so still pure).
 *   h.palmPoint(out?)  world point in the palm's hollow, just above the pads — rest a small
 *                      object here, lifted by its radius along palmNormal().
 *   h.palmNormal(out?) world unit vector pointing out of the palm.
 *   h.fingertips()     world points [thumb, index, middle, ring, pinky] at the rounded tip of
 *                      each digit, on the pad side.
 *
 *   pose = { curl: [thumb, index, middle, ring, pinky]   0 = straight … 1 = closed fist
 *                                                         (one number = all five)
 *            spread: 0..1       fingers parallel … fanned (the thumb abducts with it)
 *            thumbOpp: 0..1     thumb beside the palm … swung round in front of the palm
 *                               (down to −0.3 lays it back, to lie along a large surface)
 *            wrist: [pitch, yaw, roll] radians — pitch > 0 flexes toward the palm, yaw > 0
 *                   deviates toward the thumb, roll turns about the forearm axis.
 *                   Collision-free range: pitch ±1.1, yaw ±0.4, roll any.
 *            bend?: [5]         optional extra PIP/DIP flexion (radians) on top of curl; the
 *                               fitted grips use it so a digit hugs a curve. Default 0. }
 *
 *   RB.hand.poses          { open, relaxed, cupGrip, palmUp, offer } (fresh copies each read)
 *   RB.hand.blend(a, b, p) component-wise interpolation of two poses (p clamped to 0..1)
 *   RB.hand.gripPose(tilt = RB.hand.grip.tilt, { wrist, thumbOpp })
 *                          a cup grip whose digits are fitted to the real RB.cup() profile for
 *                          that grip tilt: every pad on first contact (3 mm), no penetration.
 *                          Cached per tilt; the first call for a new tilt costs ~0.2 s, so make
 *                          it in init(). poses.cupGrip === gripPose(RB.hand.grip.tilt).
 *
 * ── Placement helpers (absolute; call after setPose, every draw) ──────────────
 *   Coordinates are in h.group's parent space (normally the scene). Keep h.group.scale at 1.
 *   h.place({ palm, forearm, palmAt, at })
 *        orients h.group so the palm normal points exactly along `palm` and the forearm leans
 *        as close as it can toward `forearm` (directions), then puts palmPoint() at `palmAt`
 *        (or the wrist at `at`). The current pose's wrist is taken into account. E.g.
 *          h.setPose(RB.hand.poses.palmUp);
 *          h.place({ palm: [0, 1, 0], forearm: [0.85, -0.5, 0.35], palmAt: [0, 0.3, 0] });
 *   h.graspCup(cup, { around = 0, tilt = RB.hand.grip.tilt, away = 0 })
 *        places h.group so the hand holds `cup` (RB.cup().group, or any Object3D / Matrix4 in
 *        the same parent space: foot at its origin, axis +Y). `around` = radians about the cup
 *        axis: 0 = the hand on the cup's +Z side (toward a front camera), +π/2 = its +X side.
 *        `tilt` spins the hand about the contact normal: 0 = thumb up, forearm level off to
 *        the left; π/2 = forearm straight up; the default 2.2 is an overhand grip — forearm
 *        rising up and to the right, fingers wrapping across the front of the bowl, thumb
 *        down its flank. `away` backs the hand off along the outward contact normal: arrive
 *        and leave along it with the fingers open and nothing ever cuts the bowl.
 *        Pair with gripPose(tilt) (or a blend toward it). The wrist pose only steers the
 *        forearm; the palm stays on the cup. A left hand grips the mirror image.
 *   h.cupMatrix(out?, { around, tilt })  the exact inverse: the cup transform the current
 *        placement holds. Carry the cup with the hand:
 *          h.cupMatrix(m, { around, tilt }).decompose(cup.group.position, cup.group.quaternion, s)
 *
 * ── Extras ───────────────────────────────────────────────────────────────────
 *   h.materials   { shell, plate, core, pad, copper, ivory, glass, dark, cable } — this hand's own
 *                 materials (fade with transparent/opacity, warm the lenses via emissive, …).
 *                 They use the scene environment, so scene.environmentIntensity applies.
 *   h.triangles   triangle count.  h.parts: the joint groups (read-only, for debugging).
 *   RB.hand.DIMS  key dimensions.  RB.hand.grip.tilt  the default grip tilt.
 *
 * ── Presets ──────────────────────────────────────────────────────────────────
 *   open      flat and fanned, thumb out in the palm plane — "reveal", ready to receive.
 *   relaxed   the natural resting cascade: index least curled, pinky most, thumb soft.
 *   cupGrip   fitted overhand grip for graspCup() at the default tilt: fingers wrapped round
 *             the upper bowl (radius ≈0.6), thumb laid along its flank.
 *   palmUp    wrist slightly extended, fingers in a shallow cradle, thumb low — holds an ember.
 *   offer     palmUp with the wrist extended a further 0.55 rad and the fingers opened. Keep
 *             the group where place() put it for palmUp and blend toward offer: the palm
 *             tips ~30° toward the fingertips and pours/hands off in the fingers' direction
 *             (fingers pointing screen-left ⇒ it hands off to the left).
 */
(function () {
  'use strict';
  const R = window.REEL, RB = window.RB, THREE = window.THREE;
  const { clamp, lerp } = R;
  const PI = Math.PI, HP = PI / 2;
  const V3 = THREE.Vector3;

  // ─── Geometry helpers (indexed, position + analytic normals, no UVs) ─────────
  /** Build a BufferGeometry, orienting each triangle to agree with its vertex normals. */
  function geom(pos, nor, idx) {
    for (let t = 0; t < idx.length; t += 3) {
      const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
      const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
      const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
      const fx = uy * vz - uz * vy, fy = uz * vx - ux * vz, fz = ux * vy - uy * vx;
      const nx = nor[a] + nor[b] + nor[c], ny = nor[a + 1] + nor[b + 1] + nor[c + 1], nz = nor[a + 2] + nor[b + 2] + nor[c + 2];
      if (fx * nx + fy * ny + fz * nz < 0) { const s = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = s; }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setIndex(idx);
    return g;
  }

  /**
   * Section in the XZ plane: a rounded rectangle (half sizes a, b; corner radii rt top / rb
   * bottom) whose top and bottom faces may bulge by ct / cb (a parabolic crown that meets the
   * fillets tangentially — it rolls a highlight across dark shells). Returns [x, z, nx, nz].
   */
  function section(a, b, rt, rb, ct, cb, k, m) {
    const lim = Math.min(a, b);
    rt = clamp(rt, 1e-4, lim); rb = clamp(rb, 1e-4, lim);
    ct = clamp(ct, 0, b * 0.5); cb = clamp(cb, 0, b * 0.5);
    const edge = (r, c) => { // → { phi, xe, cz } for a fillet of radius r meeting a crown c
      let phi = 0, xe = a - r;
      for (let i = 0; i < 4; i++) { phi = Math.atan2(2 * c, Math.max(1e-4, xe)); xe = a - r + r * Math.sin(phi); }
      return { phi, xe, cz: b - c - r * Math.cos(phi) };
    };
    const T = edge(rt, ct), Bm = edge(rb, cb), out = [];
    const arc = (cx, cz, r, t0, t1) => { for (let i = 0; i <= k; i++) { const th = lerp(t0, t1, i / k), c = Math.cos(th), s = Math.sin(th); out.push([cx + r * c, cz + r * s, c, s]); } };
    const span = (xe, c, top) => {
      for (let i = 1; i <= m; i++) {
        const x = top ? xe * (1 - (2 * i) / (m + 1)) : -xe * (1 - (2 * i) / (m + 1));
        const dz = xe > 0 ? (2 * c * x) / (xe * xe) : 0, l = Math.hypot(dz, 1);
        out.push(top ? [x, b - c * (x / xe) ** 2, dz / l, 1 / l] : [x, -b + c * (x / xe) ** 2, dz / l, -1 / l]);
      }
    };
    arc(a - rt, T.cz, rt, 0, HP - T.phi);
    span(T.xe, ct, true);
    arc(rt - a, T.cz, rt, HP + T.phi, PI);
    arc(rb - a, -Bm.cz, rb, PI, 1.5 * PI - Bm.phi);
    span(Bm.xe, cb, false);
    arc(a - rb, -Bm.cz, rb, 1.5 * PI + Bm.phi, 2 * PI);
    return out;
  }

  /**
   * Loft a section along Y. st: [{ y, w, d, rt, rb, ct, cb, x, z, sharp }] ordered along y
   * (w/d are full width in x / depth in z). cap0 / cap1: rolling-ball radius of the end at
   * st[0] / st[n-1] (0 = flat). Normals: analytic around, finite-differenced along.
   */
  function loft(st, { k = 4, m = 3, cap0 = 0, cap1 = 0, steps = 4 } = {}) {
    const n = st.length;
    const sec = (s, inset) => {
      const a = Math.max(2e-4, s.w / 2 - inset), b = Math.max(2e-4, s.d / 2 - inset);
      const rt = s.rt == null ? 0.01 : s.rt, rb = s.rb == null ? rt : s.rb;
      return section(a, b, rt - inset, rb - inset, s.ct || 0, s.cb || 0, k, m);
    };
    const rings0 = st.map((s) => sec(s, 0)), N = rings0[0].length;
    const P = st.map((s, i) => rings0[i].map(([x, z]) => [x + (s.x || 0), s.y, z + (s.z || 0)]));
    const body = (i, i0, i1) => rings0[i].map(([, , cx, cz], j) => {
      const p = P[i][j], ty = [P[i1][j][0] - P[i0][j][0], P[i1][j][1] - P[i0][j][1], P[i1][j][2] - P[i0][j][2]];
      // around-tangent (−cz, 0, cx) × along-tangent ty; orientation fixed below
      let nx = -cx * ty[1], ny = cx * ty[0] + cz * ty[2], nz = -cz * ty[1];
      const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      if (nx * cx + nz * cz < 0) { nx = -nx; ny = -ny; nz = -nz; }
      return [p[0], p[1], p[2], nx, ny, nz];
    });
    // Rounded end: a quarter ellipse — inset `a` across (≤ the section's half size), reach `re`
    // along the axis (a circle when the section is big enough). Normals are analytic.
    const cap = (i, re, dir) => {
      const s = st[i], out = [], a = Math.min(re, Math.min(s.w, s.d) / 2 - 2e-4);
      for (let q = 1; q <= steps; q++) {
        const ph = (q / steps) * HP, c = Math.cos(ph), sn = Math.sin(ph);
        const inset = a * (1 - c), y = s.y + dir * re * sn;
        let nr = re * c, na = a * sn; const l = Math.hypot(nr, na) || 1; nr /= l; na /= l;
        out.push(sec(s, inset).map(([x, z, nx, nz]) => [x + (s.x || 0), y, z + (s.z || 0), nx * nr, dir * na, nz * nr]));
      }
      return out;
    };
    const flat = (i, dir) => P[i].map((p) => [p[0], p[1], p[2], 0, dir, 0]);
    const dir0 = Math.sign(st[0].y - st[1].y) || -1, dir1 = Math.sign(st[n - 1].y - st[n - 2].y) || 1;
    const list = [];
    if (cap0 > 0) cap(0, cap0, dir0).reverse().forEach((p) => list.push({ p, link: true }));
    else list.push({ p: flat(0, dir0), link: false });
    for (let i = 0; i < n; i++) {
      if (st[i].sharp && i > 0 && i < n - 1) {
        list.push({ p: body(i, i - 1, i), link: false });
        list.push({ p: body(i, i, i + 1), link: true });
      } else list.push({ p: body(i, Math.max(0, i - 1), Math.min(n - 1, i + 1)), link: true });
    }
    if (cap1 > 0) cap(n - 1, cap1, dir1).forEach((p) => list.push({ p, link: true }));
    else { list[list.length - 1].link = false; list.push({ p: flat(n - 1, dir1), link: true }); }
    const pos = [], nor = [], idx = [];
    const base = list.map(({ p }) => { const b = pos.length / 3; for (const v of p) { pos.push(v[0], v[1], v[2]); nor.push(v[3], v[4], v[5]); } return b; });
    for (let r = 0; r < list.length - 1; r++) {
      if (!list[r].link) continue;
      const A = base[r], B = base[r + 1];
      for (let j = 0; j < N; j++) { const j1 = (j + 1) % N; idx.push(A + j, B + j, B + j1, A + j, B + j1, A + j1); }
    }
    const fan = (r, dir) => {
      const p = list[r].p; let cx = 0, cy = 0, cz = 0;
      for (const v of p) { cx += v[0]; cy += v[1]; cz += v[2]; }
      const c = pos.length / 3; pos.push(cx / N, cy / N, cz / N); nor.push(0, dir, 0);
      for (let j = 0; j < N; j++) idx.push(c, base[r] + j, base[r] + ((j + 1) % N));
    };
    fan(0, dir0); fan(list.length - 1, dir1);
    return geom(pos, nor, idx);
  }

  /**
   * Lathe around +Y from a profile [[r, y], …]. Walk the section counter-clockwise (solid on the
   * left) so normals face out. Hard edges between segments unless `smooth`.
   */
  function lathe(prof, n = 24, { smooth = false } = {}) {
    const pos = [], nor = [], idx = [];
    const segN = (i) => { const dr = prof[i + 1][0] - prof[i][0], dy = prof[i + 1][1] - prof[i][1], l = Math.hypot(dr, dy) || 1; return [dy / l, -dr / l]; };
    const ring = (r, y, nr, ny) => {
      const b = pos.length / 3;
      for (let j = 0; j <= n; j++) { const a = (j / n) * 2 * PI, c = Math.cos(a), s = Math.sin(a); pos.push(r * c, y, r * s); nor.push(nr * c, ny, nr * s); }
      return b;
    };
    const quad = (A, B) => { for (let j = 0; j < n; j++) idx.push(A + j, B + j, B + j + 1, A + j, B + j + 1, A + j + 1); };
    if (smooth) {
      const rs = prof.map((p, i) => {
        const a = i > 0 ? segN(i - 1) : [0, 0], b = i < prof.length - 1 ? segN(i) : [0, 0];
        const nr = a[0] + b[0], ny = a[1] + b[1], l = Math.hypot(nr, ny) || 1;
        return ring(p[0], p[1], nr / l, ny / l);
      });
      for (let i = 0; i < rs.length - 1; i++) quad(rs[i], rs[i + 1]);
    } else {
      for (let i = 0; i < prof.length - 1; i++) { const [nr, ny] = segN(i); quad(ring(prof[i][0], prof[i][1], nr, ny), ring(prof[i + 1][0], prof[i + 1][1], nr, ny)); }
    }
    return geom(pos, nor, idx);
  }
  /** Chamfered disc / cylinder along +Y, from y=0 to y=h. */
  const disc = (r, h, ch = 0.003, n = 24) => lathe([[0, 0], [r - ch, 0], [r, ch], [r, h - ch], [r - ch, h], [0, h]], n);
  /** Chamfered annulus along +Y, from y=0 to y=h. */
  const annulus = (r0, r1, h, ch = 0.002, n = 28) => lathe([[r0 + ch, 0], [r1 - ch, 0], [r1, ch], [r1, h - ch], [r1 - ch, h], [r0 + ch, h], [r0, h - ch], [r0, ch], [r0 + ch, 0]], n);
  /** Visible half of a copper ring cap (outer wall, chamfer, top face, inner lip) — the rest is buried. */
  const capRing = (r0, r1, h, ch = 0.0018, n = 22) => lathe([[r1, 0], [r1, h - ch], [r1 - ch, h], [r0 + ch * 0.6, h], [r0, h - ch * 0.8]], n);
  /** Visible half of a pin head / plug (wall, chamfer, top). */
  const pinHead = (r, h, ch = 0.0012, n = 14) => lathe([[r, 0], [r, h - ch], [r - ch, h], [0, h]], n);
  /** Smooth sphere. */
  const sphere = (r, n = 24) => lathe(Array.from({ length: 13 }, (_, i) => { const a = -HP + (i / 12) * PI; return [Math.cos(a) * r, Math.sin(a) * r]; }), n, { smooth: true });

  const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _one = new V3(1, 1, 1), _p = new V3();
  /** Transform a geometry in place: Euler rotation (applied first), then position. */
  function X(g, p = [0, 0, 0], r = [0, 0, 0]) {
    _e.set(r[0], r[1], r[2]); _q.setFromEuler(_e);
    return g.applyMatrix4(_m4.compose(_p.set(p[0], p[1], p[2]), _q, _one));
  }
  const alongX = (g) => g.rotateZ(-HP); // +Y → +X
  const alongNX = (g) => g.rotateZ(HP); // +Y → −X
  const alongZ = (g) => g.rotateX(HP);  // +Y → +Z
  const alongNZ = (g) => g.rotateX(-HP); // +Y → −Z
  /** Point geometry `g` (built along −Y from its origin) from a along dir. */
  function aim(g, a, dirv, from = new V3(0, -1, 0)) {
    _q.setFromUnitVectors(from, new V3(...dirv).normalize());
    return g.applyMatrix4(_m4.compose(new V3(...a), _q, _one));
  }
  /** A round rod (capsule) from a to b with radius r. */
  function rod(a, b, r, k = 3) {
    const A = new V3(...a), B = new V3(...b), L = B.clone().sub(A).length();
    const g = loft([{ y: -r, w: 2 * r, d: 2 * r, rt: r, rb: r }, { y: -(L - r), w: 2 * r, d: 2 * r, rt: r, rb: r }], { k, m: 0, cap0: r * 0.9, cap1: r * 0.9, steps: 3 });
    return aim(g, a, B.sub(A).toArray());
  }
  /** A short chamfered cylinder starting at a along dirv (ferrules, rings). */
  const sleeve = (a, dirv, r, h, ch = 0.002) => aim(disc(r, h, ch, 16), a, dirv, new V3(0, 1, 0));

  function merge(geos) {
    let nv = 0, ni = 0;
    for (const g of geos) { nv += g.attributes.position.count; ni += g.index.count; }
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), idx = new Uint32Array(ni);
    let ov = 0, oi = 0;
    for (const g of geos) {
      pos.set(g.attributes.position.array, ov * 3); nor.set(g.attributes.normal.array, ov * 3);
      const src = g.index.array; for (let i = 0; i < src.length; i++) idx[oi + i] = src[i] + ov;
      ov += g.attributes.position.count; oi += src.length;
      g.dispose();
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    out.setIndex(new THREE.BufferAttribute(idx, 1));
    out.computeBoundingSphere();
    return out;
  }
  /** Per-rigid-body geometry buckets, one mesh per material. */
  const bucket = () => ({ shell: [], plate: [], core: [], pad: [], copper: [], ivory: [], glass: [], dark: [], cable: [] });
  /**
   * Merge each bucket into one mesh on `parent`. `glow` bakes the per-vertex palm-glow mask
   * (see setGlow): 1 on the palm side of the part (local z < −0.02, where the pads are), fading
   * to 0 by z = +0.03 — a light cupped in the palm can't reach the backs, the module or the arm.
   */
  function commit(B, parent, M, glow = true) {
    for (const key of Object.keys(B)) {
      if (!B[key].length) continue;
      const g = merge(B[key]), pos = g.attributes.position, mask = new Float32Array(pos.count);
      if (glow) for (let i = 0; i < pos.count; i++) { const t = clamp((0.03 - pos.getZ(i)) / 0.05); mask[i] = t * t * (3 - 2 * t); }
      g.setAttribute('rbGlowMask', new THREE.BufferAttribute(mask, 1));
      const mesh = new THREE.Mesh(g, M[key]);
      mesh.name = key;
      parent.add(mesh);
    }
  }

  // ─── Dimensions ───────────────────────────────────────────────────────────────
  // Hand frame (the wrist's yaw group): origin at the wrist centre, fingers along −Y,
  // palm facing −Z, thumb on +X.
  const CHEEK = 0.016, GAP = 0.005, CH = 0.018;
  // Proportions: fingers ≈ 1.1× the wrist→knuckle length and a touch stocky (length/width ≈ 5.3
  // for the middle finger) — an instrument, not a skeleton. The phalanges step 1 : 0.63 : 0.49.
  const FINGERS = [
    // MCP position, spread angle at spread=1, segments [length, width, thickness]
    { name: 'index',  x: 0.195,  y: -0.55,  spread: 0.2,   seg: [[0.261, 0.109, 0.097], [0.167, 0.104, 0.091], [0.135, 0.099, 0.086]] },
    { name: 'middle', x: 0.065,  y: -0.56,  spread: 0.04,  seg: [[0.293, 0.113, 0.1], [0.185, 0.108, 0.095], [0.144, 0.103, 0.089]] },
    { name: 'ring',   x: -0.065, y: -0.555, spread: -0.1,  seg: [[0.275, 0.107, 0.095], [0.176, 0.102, 0.089], [0.137, 0.097, 0.084]] },
    { name: 'pinky',  x: -0.19,  y: -0.545, spread: -0.24, seg: [[0.22, 0.0945, 0.084], [0.14, 0.09, 0.08], [0.115, 0.086, 0.076]] },
  ];
  // The thumb's ball joint sits just outside the palm's radial-palmar corner, so opposition
  // (a swing about the palm's long axis) carries the thumb round the outside of the palm.
  const THUMB = { root: [0.25, -0.29, -0.06], seg: [[0.157, 0.106, 0.097], [0.158, 0.104, 0.094], [0.134, 0.099, 0.088]] };
  const PALM_END = -0.495;               // distal edge of the palm chassis
  const PALM_PT = [-0.01, -0.35, -0.09]; // palm hollow between heel and knuckle pads, just off their surface
  // Curl → joint angles. MCP leads (a real grasp wraps from the knuckles), PIP/DIP follow,
  // so a partial curl hugs a large round object and curl 1 is a tight fist.
  const COUPLE = {
    mcp: (c) => 1.3 * (1 - Math.pow(1 - c, 1.6)),
    pip: (c) => 1.65 * Math.pow(c, 1.25),
    dip: (c) => 1.15 * Math.pow(c, 1.35),
    tcmc: (c) => 0.3 * c, tmcp: (c) => 0.8 * c, tip: (c) => 1.0 * c,
  };
  /** Joint angles [proximal, middle, distal] for curl c and extra distal bend b (radians). */
  function digitAngles(c, b, thumb) {
    const d = (v) => clamp(v, -0.12, 1.9);
    return thumb
      ? [COUPLE.tcmc(c), d(COUPLE.tmcp(c) + 0.5 * b), d(COUPLE.tip(c) + b)]
      : [COUPLE.mcp(c), d(COUPLE.pip(c) + b), d(COUPLE.dip(c) + 0.75 * b)];
  }
  const setDigit = (j, c, b, thumb) => { const a = digitAngles(c, b, thumb); j[0].rotation.set(a[0], 0, 0); j[1].rotation.set(a[1], 0, 0); j[2].rotation.set(a[2], 0, 0); };
  // opp: swing about the palm's long axis per unit thumbOpp; beyond 1 the thumb also abducts
  // (abd per unit) — it lifts out in front of the palm, as a thumb does to reach over a rim.
  const THUMB_K = { base: 0.5, spread: 0.32, opp: 1.2, abd: 1.6, pron0: 0.45, pron1: 0.75 };
  const DIMS = { handLength: +(-FINGERS[1].y + FINGERS[1].seg.reduce((a, g) => a + g[0], 0)).toFixed(3), palmWidth: 0.55, wristToKnuckles: 0.56, forearm: 2.6 };

  // Cup grip — a rim pinch, the way a maker lifts a wide bowl one-handed: the rim sits in the web
  // of the hand, the four fingers wrap down the outside of the bowl and the thumb reaches over the
  // rim and presses the inside wall, so the wall is held between opposed pads (a bowl this wide —
  // twice the hand's span — can't be held by wrapping the belly). The palm-side contact point
  // `contact` (hand frame) sits on the outer wall at height hc, with the palm plane tangent to the
  // wall there (radius and slope are read from the real RB.cup() profile). tilt: see graspCup().
  // `approach` is the direction (cup frame, before `around`) that graspCup's `away` backs off
  // along: up the cup axis and a little outward, so the thumb lifts out over the rim and the open
  // fingers clear the rim bead — never cutting the wall.
  // `wrist` is the grip's default wrist pose: it only steers the forearm (up and to the right,
  // leaning a little toward a front camera); tilts outside ~1.1–1.7 can't reach over the rim and
  // fall back to a thumb laid along the outside of the bowl.
  const GRIP = { hc: 0.87, contact: [0.1, -0.45, -0.078], tilt: 1.68, spread: 0.26, clearance: 0.003, opp: [0.8, 1.4], approach: [0, 1, 0.2], wrist: [0.25, 0.38, 0] };

  // ─── Materials ────────────────────────────────────────────────────────────────
  function materials() {
    const M = RB.mat;
    return {
      // shells: warm gunmetal, satin — bright enough to reflect the workshop, so the crowns and
      // fillets draw highlight lines instead of reading as black plastic. No clear coat: it looked
      // the same here and cost ~14% of a frame-filling close-up in the software renderer.
      shell: M.graphite({ color: '#57534b', metalness: 0.92, roughness: 0.34, clearcoat: 0 }),
      // the big plates (back of the hand, forearm): the same metal bead-blasted — a rougher,
      // broader sheen that still takes the key light when the plate faces away from it
      plate: M.graphite({ color: '#4b4741', metalness: 0.86, roughness: 0.5, clearcoat: 0 }),
      // charcoal cores: deeper, rougher metal — joints, chassis, axles
      core: M.charcoal({ color: '#1c1b19', metalness: 0.8, roughness: 0.46 }),
      pad: M.charcoal({ color: '#151513', metalness: 0.1, roughness: 0.78 }),
      copper: M.copper(),
      ivory: M.ivory(),
      glass: new THREE.MeshPhysicalMaterial({ color: '#0a0a09', metalness: 0, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, ior: 1.6, transparent: true, opacity: 0.84 }),
      dark: M.charcoal({ color: '#0c0c0b', metalness: 0.5, roughness: 0.5 }),
      cable: M.charcoal({ color: '#2b2a26', metalness: 0.7, roughness: 0.4 }),
    };
  }

  /**
   * Palm glow: a warm point light that only this hand sees, masked to the palm side of each part
   * (per-vertex rbGlowMask), so an ember cupped in the palm lights the pads and the insides of the
   * fingers without leaking through the metal onto the back plate, the module or the forearm (a
   * scene PointLight has no shadows, and would). Same units as THREE.PointLight(color, intensity,
   * distance, decay 2). The uniforms are shared by all of this hand's materials.
   */
  function addGlow(M, U) {
    for (const m of Object.values(M)) {
      m.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, U);
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', '#include <common>\nattribute float rbGlowMask;\nvarying float vRbGlow;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\n\tvRbGlow = rbGlowMask;');
        sh.fragmentShader = sh.fragmentShader
          .replace('#include <common>', '#include <common>\nuniform float rbGlowOn;\nuniform vec3 rbGlowPos;\nuniform vec3 rbGlowColor;\nuniform float rbGlowRange;\nvarying float vRbGlow;')
          .replace('#include <lights_fragment_begin>', [
            '#include <lights_fragment_begin>',
            'if ( rbGlowOn > 0.5 && vRbGlow > 0.004 ) {',
            '\tvec3 rbL = ( viewMatrix * vec4( rbGlowPos, 1.0 ) ).xyz - geometryPosition;',
            '\tfloat rbD = max( length( rbL ), 1e-4 );',
            '\tIncidentLight rbLight;',
            '\trbLight.direction = rbL / rbD;',
            '\trbLight.color = rbGlowColor * getDistanceAttenuation( rbD, rbGlowRange, 2.0 ) * vRbGlow;',
            '\trbLight.visible = true;',
            '\tRE_Direct( rbLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
            '}',
          ].join('\n'));
      };
      m.customProgramCacheKey = () => 'rb-hand-glow-1';
    }
  }

  // ─── Skeleton: the joint hierarchy (no meshes) + contact sample points ───────
  function skeleton() {
    const group = new THREE.Group(); group.name = 'RB.hand';
    const mirror = new THREE.Group(); group.add(mirror);
    const roll = new THREE.Group(), pitch = new THREE.Group(), yaw = new THREE.Group();
    mirror.add(roll); roll.add(pitch); pitch.add(yaw);
    const samples = (g, [L, w, t], distal) => {
      const fr = distal ? [0.18, 0.32, 0.46, 0.6, 0.72, 0.82] : [0.2, 0.35, 0.5, 0.65, 0.8, 0.92];
      // centre line + both pad edges (a finger meets a curved wall edge-first when it isn't square to it)
      const pts = [];
      for (const f of fr) for (const x of [-0.3 * w, 0, 0.3 * w]) { const o = new THREE.Object3D(); o.position.set(x, -L * f, -t / 2 - 0.009); g.add(o); pts.push(o); }
      if (distal) { const o = new THREE.Object3D(); o.position.set(0, -L + 0.01, -t * 0.28); g.add(o); pts.push(o); }
      return pts;
    };
    const chain = (parent, seg) => {
      const g0 = new THREE.Group(); parent.add(g0);
      const g1 = new THREE.Group(); g1.position.y = -seg[0][0]; g0.add(g1);
      const g2 = new THREE.Group(); g2.position.y = -seg[1][0]; g1.add(g2);
      const tip = new THREE.Object3D(); tip.position.set(0, -seg[2][0] + 0.004, -seg[2][2] * 0.14); g2.add(tip);
      const pads = [samples(g0, seg[0]), samples(g1, seg[1]), samples(g2, seg[2], true)].flat();
      return { j: [g0, g1, g2], tip, pads };
    };
    const fingers = FINGERS.map((f) => {
      const abd = new THREE.Group(); abd.position.set(f.x, f.y, 0); yaw.add(abd);
      return { abd, ...chain(abd, f.seg) };
    });
    const troot = new THREE.Group(); troot.position.set(...THUMB.root); yaw.add(troot);
    const thumb = { root: troot, ...chain(troot, THUMB.seg) };
    const palmMark = new THREE.Object3D(); palmMark.position.set(...PALM_PT); yaw.add(palmMark);
    return { group, mirror, roll, pitch, yaw, fingers, thumb, palmMark };
  }

  const _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion(), _qc = new THREE.Quaternion();
  const AY = new V3(0, 1, 0), AZ = new V3(0, 0, 1);
  function applyPose(sk, pose) {
    const p = norm(pose);
    sk.roll.rotation.set(0, p.wrist[2], 0);
    sk.pitch.rotation.set(p.wrist[0], 0, 0);
    sk.yaw.rotation.set(0, 0, p.wrist[1]);
    const s = clamp(p.spread, 0, 1);
    sk.fingers.forEach((f, i) => {
      const c = clamp(p.curl[i + 1], 0, 1);
      f.abd.rotation.set(0, 0, FINGERS[i].spread * s);
      setDigit(f.j, c, p.bend[i + 1], false);
    });
    // Thumb: opposition swings it about the palm's long axis; base abduction in the palm
    // plane; pronation rolls it about its own axis so the pad turns toward the fingers.
    const tc = clamp(p.curl[0], 0, 1), to = clamp(p.thumbOpp, -0.3, 1.4);
    applyThumb(sk, tc, to, s, p.bend[0]);
    // Guard: the thumb never passes through the index / middle / palm — when curled fingers are
    // in its way it stops at first contact (bisected; deterministic, so still pure).
    if (tc > 0.05 && thumbHits(sk)) {
      let lo = 0, hi = tc;
      for (let i = 0; i < 11; i++) { const mid = (lo + hi) / 2; applyThumb(sk, mid, to, s, p.bend[0]); if (thumbHits(sk)) hi = mid; else lo = mid; }
      applyThumb(sk, lo, to, s, p.bend[0]);
    }
  }
  // Thumb-guard geometry: surface samples on the thumb segments, inner boxes of the obstacles.
  const _T = [new THREE.Matrix4(), new THREE.Matrix4(), new THREE.Matrix4()], _O = new THREE.Matrix4(), _v = new V3();
  const THUMB_PTS = THUMB.seg.map(([L, w, t], i) => {
    const pts = [], y0 = i === 0 ? -0.06 : -0.05, y1 = i === 2 ? -L + 0.02 : -L + 0.03;
    for (const fy of [0, 0.33, 0.66, 1]) for (const x of [-w / 2, 0, w / 2]) for (const z of [-t / 2, t / 2]) pts.push(new V3(x, lerp(y0, y1, fy), z));
    return pts;
  });
  const GUARD = [0, 1].flatMap((f) => [0, 1, 2].map((i) => {
    const seg = FINGERS[f].seg, [L, w, t] = seg[i], rc = 0.46 * t, nrc = i < 2 ? 0.46 * seg[i + 1][2] : 0;
    const m = 0.012; // margin: the thumb's samples are sparse, the boxes are not
    return { f, i, min: new V3(-w / 2 - m, (i < 2 ? -(L - nrc - GAP) : -L) - m, -t / 2 - 0.012 - m), max: new V3(w / 2 + m, -(rc + GAP) + m, t / 2 + m) };
  }));
  const PALM_BOX = { min: new V3(-0.24, -0.49, -0.085), max: new V3(0.19, -0.12, 0.06) };
  function thumbHits(sk) {
    const th = sk.thumb;
    th.root.updateMatrix(); th.j.forEach((g) => g.updateMatrix());
    _T[0].multiplyMatrices(th.root.matrix, th.j[0].matrix);
    _T[1].multiplyMatrices(_T[0], th.j[1].matrix);
    _T[2].multiplyMatrices(_T[1], th.j[2].matrix);
    const inside = (b) => _v.x > b.min.x && _v.x < b.max.x && _v.y > b.min.y && _v.y < b.max.y && _v.z > b.min.z && _v.z < b.max.z;
    for (const g of GUARD) {
      const f = sk.fingers[g.f];
      f.abd.updateMatrix(); f.j.forEach((j) => j.updateMatrix());
      _O.multiplyMatrices(f.abd.matrix, f.j[0].matrix);
      if (g.i > 0) _O.multiply(f.j[1].matrix);
      if (g.i > 1) _O.multiply(f.j[2].matrix);
      _O.invert();
      for (let s = 0; s < 3; s++) for (const q of THUMB_PTS[s]) { _v.copy(q).applyMatrix4(_T[s]).applyMatrix4(_O); if (inside(g)) return true; }
    }
    for (let s = 1; s < 3; s++) for (const q of THUMB_PTS[s]) { _v.copy(q).applyMatrix4(_T[s]); if (inside(PALM_BOX)) return true; }
    return false;
  }
  function applyThumb(sk, c, o, s, b = 0) {
    _qa.setFromAxisAngle(AY, THUMB_K.opp * o);
    _qb.setFromAxisAngle(AZ, THUMB_K.base + THUMB_K.spread * s + THUMB_K.abd * Math.max(0, o - 1));
    _qc.setFromAxisAngle(AY, THUMB_K.pron0 + THUMB_K.pron1 * o);
    sk.thumb.root.quaternion.copy(_qa).multiply(_qb).multiply(_qc);
    setDigit(sk.thumb.j, c, b, true);
  }
  /** Hand frame (yaw group) relative to the root group: mirror · roll · pitch · yaw. */
  function handLocal(sk, out = new THREE.Matrix4()) {
    sk.mirror.updateMatrix(); sk.roll.updateMatrix(); sk.pitch.updateMatrix(); sk.yaw.updateMatrix();
    return out.copy(sk.mirror.matrix).multiply(sk.roll.matrix).multiply(sk.pitch.matrix).multiply(sk.yaw.matrix);
  }
  /** Hand frame expressed in the cup's frame (cup foot at origin, axis +Y), hand on the cup's +Z side. */
  function gripFrame(tilt, out = new THREE.Matrix4()) {
    const { r, delta } = wallAt(GRIP.hc);
    const s = Math.sin(delta), c = Math.cos(delta);
    const n = new V3(0, -s, c), up = new V3(0, c, s), side = new V3(1, 0, 0);
    const Xh = up.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(side, Math.sin(tilt));
    const Zh = n, Yh = new V3().crossVectors(Zh, Xh);
    const C = GRIP.contact, S = new V3(0, GRIP.hc, r);
    const O = S.addScaledVector(Xh, -C[0]).addScaledVector(Yh, -C[1]).addScaledVector(Zh, -C[2]);
    return out.makeBasis(Xh, Yh, Zh).setPosition(O);
  }
  /** GRIP.approach (cup frame) expressed in the hand frame of gripFrame(tilt). */
  const _ap = new THREE.Matrix4();
  function approachDir(tilt) {
    return new V3(...GRIP.approach).normalize().applyMatrix4(_ap.extractRotation(gripFrame(tilt)).transpose());
  }
  /** Outer-wall radius and outward lean (radians; > 0 when the wall faces a little downward) at height y. */
  const WALL = new Map();
  function wallAt(y) {
    const key = y.toFixed(4);
    if (!WALL.has(key)) {
      const rOut = (yy) => {
        let hi = 0.8, lo = 0.8;
        while (lo > 0 && cupSD(lo, yy) > 0) lo -= 0.01;
        for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (cupSD(m, yy) > 0) hi = m; else lo = m; }
        return hi;
      };
      WALL.set(key, { r: rOut(y), delta: Math.atan2(rOut(y + 0.02) - rOut(y - 0.02), 0.04) });
    }
    return WALL.get(key);
  }

  // ─── Parts (meshes) ───────────────────────────────────────────────────────────
  /**
   * One phalanx in its joint frame (origin on its proximal axle, extending along −Y).
   * s = [L, w, t]; next = the following segment (null for the distal).
   */
  function phalanx(B, s, next, { cheeks = true, distal = false, dome = 0, tendon = false } = {}) {
    const [L, w, t] = s, rc = 0.46 * t, nrc = next ? 0.46 * next[2] : 0;
    const yA = cheeks ? -(rc + GAP) : -0.012;
    const RT = 0.014, RBt = 0.02, CT = t * 0.07;
    // Rounded shoulders at the body ends; stations are pulled in by SH so the rounded extremes
    // land exactly on the joint-clearance lines (yA proximal, yB distal).
    const SH = 0.014, a0 = yA - SH;
    if (cheeks) {
      for (const sd of [-1, 1]) {
        const xo = sd > 0 ? w / 2 - CHEEK : -w / 2;
        B.shell.push(X(alongX(disc(rc, CHEEK, 0.004, 20)), [xo, 0, 0]));
        B.shell.push(loft([{ y: 0, w: CHEEK, d: 2 * rc * 0.9, rt: 0.004, x: sd * (w / 2 - CHEEK / 2) }, { y: yA - 0.03, w: CHEEK, d: 2 * rc * 0.9, rt: 0.004, x: sd * (w / 2 - CHEEK / 2) }], { k: 2, m: 0 }));
        const ax = sd > 0 ? alongX : alongNX;
        B.copper.push(X(ax(capRing(rc * 0.32, rc * 0.68, 0.0065)), [sd * (w / 2 - 0.001), 0, 0]));
        B.dark.push(X(ax(pinHead(rc * 0.33, 0.0055)), [sd * (w / 2 - 0.001), 0, 0]));
      }
    }
    const st = [];
    if (distal) {
      const re = Math.min(w * 0.9, t * 0.84) / 2 * 0.94;
      st.push({ y: a0, w, d: t - CH, z: CH / 2, rt: RT, rb: RBt * 0.6, ct: CT * 0.8 });
      st.push({ y: a0 - CH, w: w * 0.995, d: t, z: 0, rt: RT, rb: RBt, ct: CT });
      st.push({ y: Math.min(-L * 0.6, a0 - CH - 0.006), w: w * 0.96, d: t * 0.96, z: -t * 0.01, rt: RT * 1.3, rb: RBt, ct: CT });
      st.push({ y: -(L - re), w: w * 0.9, d: t * 0.84, z: -t * 0.05, rt: re * 0.8, rb: re * 0.9, ct: CT * 0.5 });
      B.shell.push(loft(st, { k: 4, cap0: SH, cap1: re, steps: 6 }));
      B.pad.push(loft([
        { y: a0 - CH - 0.006, w: w * 0.7, d: 0.02, z: -t / 2 + 0.004, rt: 0.008 },
        { y: -L * 0.6, w: w * 0.68, d: 0.02, z: -t * 0.49 + 0.004, rt: 0.008 },
        { y: -(L - re * 1.05), w: w * 0.6, d: 0.02, z: -t * 0.47 + 0.004, rt: 0.008 },
      ], { k: 2, m: 2, cap0: 0.008, cap1: 0.009 }));
    } else {
      const yB = -(L - nrc - GAP), b0 = yB + SH;
      if (dome) {
        st.push({ y: -0.004, w: w * 0.96, d: t * 0.96, rt: 0.036, rb: 0.036 });
        st.push({ y: -0.05, w, d: t, rt: RT * 1.6, rb: RBt, ct: CT });
      } else {
        st.push({ y: a0, w, d: t - CH, z: CH / 2, rt: RT, rb: RBt * 0.6, ct: CT });
        st.push({ y: a0 - CH, w: w * 0.995, d: t, z: 0, rt: RT, rb: RBt, ct: CT });
      }
      st.push({ y: b0 + CH, w: w * 0.965, d: t * 0.985, z: 0, rt: RT, rb: RBt, ct: CT });
      st.push({ y: b0, w: w * 0.96, d: t * 0.985 - CH, z: CH / 2, rt: RT, rb: RBt * 0.6, ct: CT });
      B.shell.push(loft(st, { k: 4, cap0: dome || SH, cap1: SH, steps: dome ? 5 : 4 }));
      const p0 = (dome ? -0.06 : a0 - CH) - 0.004, p1 = b0 + CH + 0.004;
      B.pad.push(loft([{ y: p0, w: w * 0.72, d: 0.02, z: -t / 2 + 0.003, rt: 0.008 }, { y: p1, w: w * 0.7, d: 0.02, z: -t * 0.4925 + 0.003, rt: 0.008 }], { k: 2, m: 2, cap0: 0.008, cap1: 0.008 }));
      // core of the next joint: barrel between the next segment's cheeks + a tongue into this body
      const bw = next[1] - 2 * CHEEK - 0.008, rbar = 0.36 * t;
      B.core.push(X(alongX(disc(rbar, bw, 0.004, 22)), [-bw / 2, -L, 0]));
      B.core.push(loft([{ y: yB + 0.03, w: bw * 0.86, d: 2 * rbar * 0.92, rt: 0.012 }, { y: -L, w: bw * 0.86, d: 2 * rbar * 0.92, rt: 0.012 }], { k: 3, m: 0 }));
      if (tendon) {
        const zt = t / 2 + CT + 0.005, y0 = (dome ? -0.075 : a0 - CH) - 0.004, y1 = b0 + CH + 0.006;
        B.cable.push(rod([0, y0, zt - 0.005], [0, y1, zt - 0.005], 0.0066)); // half-sunk: an inlay, not a nub
      }
    }
  }

  function fingerMeshes(spec, f, M) {
    const [s0, s1, s2] = spec.seg;
    // MCP core (static in the abduction frame): barrel + tongue back into the palm
    const B0 = bucket();
    const bw = s0[1] - 2 * CHEEK - 0.008, rbar = 0.36 * s0[2];
    const rk = 0.9 * (0.46 * s0[2] + GAP); // knuckle drum: just inside the proximal phalanx's swing
    B0.shell.push(X(alongX(disc(rk, bw, 0.005, 26)), [-bw / 2, 0, 0]));
    B0.copper.push(X(alongX(lathe([[rk - 0.001, 0], [rk + 0.0035, 0.002], [rk + 0.0035, 0.012], [rk - 0.001, 0.014]], 26)), [-0.007, 0, 0]));
    B0.core.push(loft([{ y: 0, w: bw * 0.8, d: 2 * rbar * 0.95, rt: 0.012 }, { y: PALM_END - spec.y + 0.045, w: bw * 0.8, d: 2 * rbar * 0.95, rt: 0.012 }], { k: 3, m: 0 }));
    commit(B0, f.abd, M);
    let B = bucket(); phalanx(B, s0, s1, { tendon: true }); commit(B, f.j[0], M);
    B = bucket(); phalanx(B, s1, s2); commit(B, f.j[1], M);
    B = bucket(); phalanx(B, s2, null, { distal: true }); commit(B, f.j[2], M);
  }
  function thumbMeshes(th, M) {
    const [s0, s1, s2] = THUMB.seg;
    let B = bucket(); phalanx(B, s0, s1, { cheeks: false, dome: 0.044 }); commit(B, th.j[0], M);
    B = bucket(); phalanx(B, s1, s2, { tendon: true }); commit(B, th.j[1], M);
    B = bucket(); phalanx(B, s2, null, { distal: true }); commit(B, th.j[2], M);
  }

  // Dorsal shell stations [y, w, zCentre, depth, crown]; plateTop() lets cables and the module sit on it.
  const PLATE = [[-0.15, 0.33, 0.055, 0.034, 0.01], [-0.19, 0.41, 0.057, 0.038, 0.012], [-0.25, 0.465, 0.057, 0.038, 0.014], [-0.33, 0.52, 0.057, 0.038, 0.016], [-0.41, 0.55, 0.057, 0.038, 0.017], [-0.462, 0.552, 0.056, 0.036, 0.017]];
  function plateTop(x, y) {
    let i = 0; while (i < PLATE.length - 2 && y < PLATE[i + 1][0]) i++;
    const A = PLATE[i], B = PLATE[i + 1], u = clamp((y - A[0]) / (B[0] - A[0]));
    const w = lerp(A[1], B[1], u), z = lerp(A[2], B[2], u), d = lerp(A[3], B[3], u), c = lerp(A[4], B[4], u);
    const xe = w / 2 - 0.017;
    return z + d / 2 + c * Math.max(0, 1 - (x / xe) ** 2);
  }

  /** Palm: chassis, dorsal shell, pads, thenar housing + ball, sensor module, cables, wrist fork. */
  function palmMeshes(M, hand) {
    const B = bucket();
    // chassis (charcoal core), pulled in on the radial side under the thumb's ball joint
    B.core.push(loft([
      { y: -0.15, w: 0.29, d: 0.1, rt: 0.03, rb: 0.03 },
      { y: -0.2, w: 0.38, d: 0.116, x: -0.02, rt: 0.03, rb: 0.03 },
      { y: -0.3, w: 0.44, d: 0.12, x: -0.022, rt: 0.03, rb: 0.03 },
      { y: -0.4, w: 0.505, d: 0.12, x: -0.006, rt: 0.03, rb: 0.03 },
      { y: PALM_END, w: 0.515, d: 0.114, rt: 0.028, rb: 0.028 },
    ], { k: 4, m: 2, cap0: 0.03, cap1: 0.012 }));
    // dorsal shell (graphite, crowned, flaring to the knuckles) + a stepped knuckle plate
    B.plate.push(loft(PLATE.map(([y, w, z, d, ct]) => ({ y, w, d, z, rt: 0.017, rb: 0.006, ct })), { k: 4, m: 6, cap0: 0.03, cap1: 0.014, steps: 5 }));
    // copper hairline: a thin shim under the plate, 3 mm proud of its edge — outlines the shell
    B.copper.push(loft(PLATE.map(([y, w, z, d]) => ({ y, w: w + 0.006, d: 0.006, z: z - d / 2 + 0.004, rt: 0.003 })), { k: 2, m: 0, cap0: 0.03, cap1: 0.017, steps: 3 }));
    // palmar pads (heel + knuckle) — matte
    // heel pad (ulnar side) and one pad under each knuckle, like a palm's own pads
    B.pad.push(loft([{ y: -0.17, w: 0.21, d: 0.03, z: -0.058, x: -0.07, rt: 0.014, cb: 0.005 }, { y: -0.33, w: 0.25, d: 0.032, z: -0.06, x: -0.075, rt: 0.014, cb: 0.007 }], { k: 3, m: 4, cap0: 0.016, cap1: 0.016 }));
    for (const f of FINGERS) {
      const pw = f.seg[0][1] * 0.86;
      B.pad.push(loft([{ y: -0.37, w: pw, d: 0.03, z: -0.06, x: f.x * 0.94, rt: 0.012, cb: 0.006 }, { y: -0.475, w: pw, d: 0.03, z: -0.059, x: f.x, rt: 0.012, cb: 0.006 }], { k: 3, m: 3, cap0: 0.014, cap1: 0.012 }));
    }
    // thenar housing: graphite, from the heel of the palm out to the thumb's ball joint
    const tr = new V3(...THUMB.root), from = new V3(0.085, -0.19, -0.062), dir = tr.clone().sub(from), wl = dir.length() - 0.076;
    B.shell.push(aim(loft([
      { y: 0, w: 0.15, d: 0.1, rt: 0.03, rb: 0.036, cb: 0.01 },
      { y: -wl * 0.55, w: 0.14, d: 0.1, rt: 0.03, rb: 0.034, cb: 0.012 },
      { y: -wl, w: 0.116, d: 0.094, rt: 0.026, rb: 0.03, cb: 0.008 },
    ], { k: 4, m: 3, cap0: 0.03, cap1: 0.01 }), from.toArray(), dir.toArray()));
    B.pad.push(aim(loft([{ y: -0.03, w: 0.1, d: 0.02, z: -0.05, rt: 0.008, cb: 0.004 }, { y: -wl * 0.8, w: 0.09, d: 0.02, z: -0.046, rt: 0.008, cb: 0.004 }], { k: 2, m: 3, cap0: 0.01, cap1: 0.01 }), from.toArray(), dir.toArray()));
    dir.normalize();
    B.copper.push(sleeve(from.clone().addScaledVector(dir, wl - 0.003).toArray(), dir.toArray(), 0.045, 0.011, 0.002));
    B.core.push(X(sphere(0.05, 26), THUMB.root));

    // wrist fork on the hand side (yaw axle along Z): charcoal plugs with a thin copper ring
    for (const sd of [-1, 1]) {
      const az = sd > 0 ? alongZ : alongNZ;
      B.shell.push(X(alongZ(disc(0.058, 0.026, 0.004, 26)), [0, 0, sd > 0 ? 0.057 : -0.083]));
      B.shell.push(loft([{ y: 0, w: 0.12, d: 0.026, z: sd * 0.07, rt: 0.006 }, { y: -0.16, w: 0.17, d: 0.026, z: sd * 0.07, rt: 0.006 }], { k: 2, m: 0, cap1: 0.004 }));
      B.core.push(X(az(pinHead(0.03, 0.007, 0.002, 22)), [0, 0, sd * 0.082]));
      B.copper.push(X(az(capRing(0.03, 0.037, 0.006, 0.0012, 26)), [0, 0, sd * 0.082]));
    }

    // sensor module: ivory ceramic block with two dark glass lenses, on the back of the hand
    const mod = new THREE.Group(); mod.position.set(0.0, -0.285, 0.122); mod.rotation.x = 0.3; hand.add(mod);
    const MB = bucket();
    const MW = 0.25, MH = 0.155, MD = 0.092, MR = 0.03;
    MB.ivory.push(loft([{ y: -(MH / 2 - MR), w: MW, d: MD, rt: MR, rb: MR, ct: 0.004 }, { y: MH / 2 - MR, w: MW, d: MD, rt: MR, rb: MR, ct: 0.004 }], { k: 5, m: 4, cap0: MR, cap1: MR, steps: 5 }));
    MB.copper.push(alongZ(loft([{ y: -0.004, w: MW + 0.004, d: MH + 0.004, rt: MR + 0.002 }, { y: 0.004, w: MW + 0.004, d: MH + 0.004, rt: MR + 0.002 }], { k: 5, m: 0 })).translate(0, 0, -0.016));
    MB.core.push(alongZ(loft([{ y: -0.024, w: 0.2, d: 0.12, rt: 0.02 }, { y: 0.024, w: 0.2, d: 0.12, rt: 0.02 }], { k: 3, m: 0, cap0: 0.008, cap1: 0.008 })).translate(0, 0.01, -MD / 2 - 0.014));
    for (const sx of [-1, 1]) {
      const lx = sx * 0.058, ly = -0.006, fz = MD / 2 + 0.004;
      MB.shell.push(X(alongZ(annulus(0.026, 0.038, 0.011, 0.0028, 32)), [lx, ly, fz - 0.006]));
      MB.dark.push(X(alongZ(pinHead(0.027, 0.004, 0.001, 28)), [lx, ly, fz - 0.002]));
      MB.copper.push(X(alongZ(capRing(0.009, 0.0165, 0.003, 0.0008, 28)), [lx, ly, fz + 0.001]));
      MB.dark.push(X(alongZ(pinHead(0.0095, 0.002, 0.0006, 20)), [lx, ly, fz + 0.001]));
      const dome = lathe(Array.from({ length: 9 }, (_, i) => { const a = (i / 8) * HP; return [Math.cos(a) * 0.027, Math.sin(a) * 0.009]; }), 32, { smooth: true });
      MB.glass.push(X(alongZ(dome), [lx, ly, fz + 0.001]));
    }
    MB.dark.push(X(alongZ(pinHead(0.0045, 0.003, 0.001, 14)), [0, 0.048, MD / 2 + 0.001])); // pin-hole mic
    commit(MB, mod, M, false);

    // four cap screws hold the plate down: gunmetal heads with a dark socket, set on the crown
    for (const [x, y] of [[-0.13, -0.19], [0.13, -0.19], [-0.228, -0.432], [0.228, -0.432]]) {
      const z = plateTop(x, y) - 0.0008, tilt = [-Math.atan(0.5 * (plateTop(x, y + 0.01) - plateTop(x, y - 0.01)) / 0.01), 0, 0];
      const lean = Math.atan((plateTop(x + 0.005, y) - plateTop(x - 0.005, y)) / 0.01);
      B.shell.push(X(alongZ(pinHead(0.0095, 0.0036, 0.0014, 16)), [x, y, z], [tilt[0], -lean, 0]));
      B.dark.push(X(alongZ(pinHead(0.0042, 0.0042, 0.0006, 6)), [x, y, z], [tilt[0], -lean, 0]));
    }
    // tendon cables on the back: from under the module to each knuckle, copper ferrules
    for (const f of FINGERS) {
      const ax = f.x * 0.6, ay = -0.33, bx = f.x, by = -0.43;
      const a = [ax, ay, plateTop(ax, ay) + 0.004], b = [bx, by, plateTop(bx, by) + 0.004];
      B.cable.push(rod(a, b, 0.0072));
      const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      B.copper.push(sleeve([lerp(a[0], b[0], 0.84), lerp(a[1], b[1], 0.84), lerp(a[2], b[2], 0.84)], d, 0.0102, 0.016));
    }
    commit(B, hand, M);
  }

  /** Forearm + roll bearing (static) and the wrist fork (roll group) + cross block (pitch group). */
  function wristMeshes(M, sk, len) {
    const F = bucket();
    F.plate.push(loft([
      { y: 0.33, w: 0.28, d: 0.25, rt: 0.075, rb: 0.075 },
      { y: 0.7, w: 0.3, d: 0.27, rt: 0.08, rb: 0.08, ct: 0.01, cb: 0.008 },
      { y: len, w: 0.36, d: 0.32, rt: 0.09, rb: 0.09, ct: 0.012, cb: 0.01 },
    ], { k: 5, m: 4, cap0: 0.03, cap1: 0.04 }));
    F.core.push(disc(0.118, 0.19, 0.006, 40).translate(0, 0.165, 0));
    F.copper.push(annulus(0.11, 0.128, 0.02, 0.003, 44).translate(0, 0.29, 0));
    F.core.push(loft([{ y: 0.98, w: 0.302, d: 0.272, rt: 0.082, ct: 0.01, cb: 0.008 }, { y: 1.04, w: 0.302, d: 0.272, rt: 0.082, ct: 0.01, cb: 0.008 }], { k: 5, m: 4, cap0: 0.006, cap1: 0.006 }));
    for (const sx of [-1, 1]) {
      F.cable.push(rod([sx * 0.062, 0.31, 0.13], [sx * 0.07, len, 0.152], 0.011));
      F.copper.push(sleeve([sx * 0.0625, 0.335, 0.131], [0, 1, 0.02], 0.0145, 0.022));
    }
    commit(F, sk.mirror, M, false);

    // roll group: a round yoke under the drum + fork cheeks + axle caps (pitch axis = X)
    const Rb = bucket();
    Rb.core.push(lathe([[0, 0.112], [0.118, 0.112], [0.128, 0.122], [0.128, 0.158], [0.118, 0.168], [0, 0.168]], 40));
    Rb.copper.push(annulus(0.108, 0.13, 0.006, 0.0015, 44).translate(0, 0.158, 0));
    for (const sd of [-1, 1]) {
      const ax = sd > 0 ? alongX : alongNX;
      Rb.shell.push(X(alongX(disc(0.07, 0.032, 0.005, 28)), [sd > 0 ? 0.128 : -0.16, 0, 0]));
      Rb.shell.push(loft([{ y: 0, w: 0.032, d: 0.12, x: sd * 0.144, rt: 0.008 }, { y: 0.125, w: 0.032, d: 0.13, x: sd * 0.144, rt: 0.008 }], { k: 2, m: 0, cap1: 0.004 }));
      Rb.core.push(X(ax(pinHead(0.036, 0.008, 0.002, 22)), [sd * 0.159, 0, 0]));
      Rb.copper.push(X(ax(capRing(0.036, 0.044, 0.007, 0.0014, 28)), [sd * 0.159, 0, 0]));
    }
    commit(Rb, sk.roll, M, false);
    const Pb = bucket();
    Pb.core.push(loft([{ y: -0.03, w: 0.1, d: 0.1, rt: 0.02 }, { y: 0.03, w: 0.1, d: 0.1, rt: 0.02 }], { k: 3, m: 0, cap0: 0.02, cap1: 0.02 }));
    Pb.core.push(X(alongX(disc(0.022, 0.29, 0.003, 16)), [-0.145, 0, 0]));
    Pb.core.push(X(alongZ(disc(0.02, 0.15, 0.003, 16)), [0, 0, -0.075]));
    commit(Pb, sk.pitch, M, false);
  }

  // ─── Poses ────────────────────────────────────────────────────────────────────
  const NEUTRAL = { curl: [0.15, 0.15, 0.15, 0.15, 0.15], bend: [0, 0, 0, 0, 0], spread: 0.3, thumbOpp: 0.3, wrist: [0, 0, 0] };
  function norm(p = {}) {
    const c = p.curl == null ? NEUTRAL.curl : typeof p.curl === 'number' ? [p.curl, p.curl, p.curl, p.curl, p.curl] : p.curl;
    const w = p.wrist || NEUTRAL.wrist, bd = p.bend == null ? NEUTRAL.bend : typeof p.bend === 'number' ? [p.bend, p.bend, p.bend, p.bend, p.bend] : p.bend;
    return {
      curl: [0, 1, 2, 3, 4].map((i) => (c[i] == null ? NEUTRAL.curl[i] : c[i])),
      bend: [0, 1, 2, 3, 4].map((i) => bd[i] || 0),
      spread: p.spread == null ? NEUTRAL.spread : p.spread,
      thumbOpp: p.thumbOpp == null ? NEUTRAL.thumbOpp : p.thumbOpp,
      wrist: [w[0] || 0, w[1] || 0, w[2] || 0],
    };
  }
  function blend(a, b, p) {
    const A = norm(a), B = norm(b), t = clamp(p);
    return {
      curl: A.curl.map((v, i) => lerp(v, B.curl[i], t)),
      bend: A.bend.map((v, i) => lerp(v, B.bend[i], t)),
      spread: lerp(A.spread, B.spread, t),
      thumbOpp: lerp(A.thumbOpp, B.thumbOpp, t),
      wrist: A.wrist.map((v, i) => lerp(v, B.wrist[i], t)),
    };
  }

  // ─── Grip fitting against the real cup profile ────────────────────────────────
  let CUP_POLY = null, SK = null, CUP_RIM_Y = 0.912, CUP_FLOOR_Y = 0.29;
  /** The cup's solid cross-section (r, y): outer wall, rim, inner wall — sampled from RB.cup(). */
  function cupPoly() {
    if (CUP_POLY) return CUP_POLY;
    const c = RB.cup({ segments: 4, hammer: 0 }), mer = (mesh) => {
      const a = mesh.geometry.attributes.position, n = a.count / 5, out = [];
      for (let j = 0; j < n; j++) out.push([Math.hypot(a.getX(j), a.getZ(j)), a.getY(j)]);
      return out;
    };
    CUP_POLY = mer(c.outer).concat(mer(c.rim).slice(1), mer(c.inner).slice(1));
    CUP_RIM_Y = Math.max(...CUP_POLY.map((q) => q[1]));
    CUP_FLOOR_Y = Math.min(...mer(c.inner).map((q) => q[1]));
    [c.outer, c.rim, c.inner].forEach((m) => m.geometry.dispose());
    return CUP_POLY;
  }
  /** Signed distance from (r, y) to the cup's solid (negative = inside the metal / foot). */
  function cupSD(r, y) {
    const P = cupPoly();
    let best = Infinity, inside = false;
    for (let i = 0; i < P.length - 1; i++) {
      const [x0, y0] = P[i], [x1, y1] = P[i + 1], dx = x1 - x0, dy = y1 - y0;
      const u = clamp(((r - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1));
      best = Math.min(best, Math.hypot(r - x0 - u * dx, y - y0 - u * dy));
    }
    // point-in-polygon, closing the section along the axis
    const Q = P.concat([[0, P[P.length - 1][1]], [0, P[0][1]]]);
    for (let i = 0, j = Q.length - 1; i < Q.length; j = i++) {
      const [xi, yi] = Q[i], [xj, yj] = Q[j];
      if ((yi > y) !== (yj > y) && r < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside ? -best : best;
  }
  // The fit samples the cup ~10⁵ times: a lazily filled 2.5 mm grid of cupSD, bilinearly
  // interpolated (error ≪ the 3 mm clearance), keeps it to a few hundred ms.
  const SDG = { h: 0.0025, r1: 0.85, y0: -0.05, y1: 1.1, nr: 0, ny: 0, v: null };
  function sdf(r, y) {
    if (!SDG.v) { SDG.nr = Math.ceil(SDG.r1 / SDG.h) + 1; SDG.ny = Math.ceil((SDG.y1 - SDG.y0) / SDG.h) + 1; SDG.v = new Float32Array(SDG.nr * SDG.ny).fill(NaN); }
    const fr = r / SDG.h, fy = (y - SDG.y0) / SDG.h;
    if (fr >= SDG.nr - 1 || fy < 0 || fy >= SDG.ny - 1) return cupSD(r, y);
    const i = Math.floor(fr), j = Math.floor(fy), u = fr - i, t = fy - j;
    const at = (a, b) => { const k = b * SDG.nr + a; let d = SDG.v[k]; if (d !== d) d = SDG.v[k] = cupSD(a * SDG.h, SDG.y0 + b * SDG.h); return d; };
    return (at(i, j) * (1 - u) + at(i + 1, j) * u) * (1 - t) + (at(i, j + 1) * (1 - u) + at(i + 1, j + 1) * u) * t;
  }
  const _w = new V3();
  function minGap(pts) {
    let g = Infinity;
    for (const o of pts) { o.getWorldPosition(_w); g = Math.min(g, sdf(Math.hypot(_w.x, _w.z), _w.y)); }
    return g;
  }
  /** First-contact curl for one digit: smallest c whose samples (gapFn) just touch the bowl. */
  function fitCurl(set, gapFn, clearance) {
    const gap = (c) => { set(c); SK.group.updateMatrixWorld(true); return gapFn() - clearance; };
    if (gap(0) <= 0) return 0;
    let lo = 0, hi = 1;
    for (let c = 0.04; c <= 1.0001; c += 0.04) { if (gap(c) <= 0) { hi = c; break; } lo = c; if (c >= 1) return 1; }
    for (let i = 0; i < 14; i++) { const mid = (lo + hi) / 2; if (gap(mid) <= 0) hi = mid; else lo = mid; }
    return lo;
  }
  const GRIP_CACHE = new Map();
  const _tm = new THREE.Matrix4();
  /** Min cup distance over the thumb's body samples (all four faces of every segment) + its pads. */
  function thumbGap() {
    let g = minGap(SK.thumb.pads);
    for (let s = 0; s < 3; s++) {
      _tm.copy(SK.thumb.j[s].matrixWorld);
      for (const q of THUMB_PTS[s]) { _w.copy(q).applyMatrix4(_tm); g = Math.min(g, sdf(Math.hypot(_w.x, _w.z), _w.y)); }
    }
    return g;
  }
  /**
   * A cup-grip pose for graspCup(…, { tilt }): the fingers curl to first contact with the outer
   * wall (+ GRIP.clearance) and the thumb, searched over opposition, reaches over the rim and curls
   * to first contact with the inside wall — the rim wall pinched between opposed pads.
   * Deterministic; cached per tilt. `thumbOpp` caps the opposition search (default GRIP.opp[1]).
   */
  function gripPose(tilt = GRIP.tilt, { wrist = GRIP.wrist, thumbOpp = GRIP.opp[1] } = {}) {
    const key = tilt.toFixed(4) + '|' + thumbOpp.toFixed(3);
    if (!GRIP_CACHE.has(key)) GRIP_CACHE.set(key, fitGrip(tilt, thumbOpp));
    const g = GRIP_CACHE.get(key);
    return { curl: g.curl.slice(), bend: g.bend.slice(), spread: g.spread, thumbOpp: g.thumbOpp, wrist: wrist.slice() };
  }
  /** The pre-grasp for gripPose(tilt): the same thumb opposition, every digit open. */
  function gripReady(tilt = GRIP.tilt, opts = {}) {
    const g = gripPose(tilt, opts);
    return { curl: [0, 0, 0, 0, 0], bend: [g.bend[0], 0, 0, 0, 0], spread: g.spread, thumbOpp: g.thumbOpp, wrist: g.wrist };
  }
  function fitGrip(tilt, oppMax) {
    if (!SK) SK = skeleton();
    applyPose(SK, { curl: [0, 0, 0, 0, 0], spread: GRIP.spread, thumbOpp: 0, wrist: [0, 0, 0] });
    // place the skeleton on a cup at the origin (around = 0)
    const G = gripFrame(tilt).multiply(handLocal(SK).invert());
    G.decompose(SK.group.position, SK.group.quaternion, _p);
    SK.group.updateMatrixWorld(true);
    const meanGap = (pads) => { let g = 0; for (const o of pads) { o.getWorldPosition(_w); g += sdf(Math.hypot(_w.x, _w.z), _w.y); } return g / pads.length; };
    // each finger: for a few extra distal bends, curl to first contact; keep the best hug
    const fitDigit = (j, pads, gapFn, thumb, ok = () => true) => {
      let best = { score: Infinity, c: 0, b: 0 };
      for (const b of [-0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.45]) {
        const set = (c) => setDigit(j, c, b, thumb);
        set(0); SK.group.updateMatrixWorld(true);
        if (gapFn() <= GRIP.clearance) continue;
        const c = fitCurl(set, gapFn, GRIP.clearance);
        set(c); SK.group.updateMatrixWorld(true);
        if (!ok()) continue;
        const score = meanGap(pads);
        if (score < best.score) best = { score, c, b };
      }
      return best;
    };
    const curl = [0, 0, 0, 0, 0], bend = [0, 0, 0, 0, 0];
    SK.fingers.forEach((f, i) => { const r = fitDigit(f.j, f.pads, () => minGap(f.pads), false); curl[i + 1] = r.c; bend[i + 1] = r.b; });
    // thumb: over the rim and into the bowl — its tip must end inside the wall, below the rim
    const inside = () => {
      SK.thumb.tip.getWorldPosition(_w);
      if (_w.y > CUP_RIM_Y - 0.03 || _w.y < CUP_FLOOR_Y + 0.02) return false;
      const r = Math.hypot(_w.x, _w.z);
      for (let q = 0; q < r; q += 0.01) if (cupSD(q, _w.y) <= 0) return false; // metal between it and the axis
      return true;
    };
    let bestT = { score: Infinity, opp: GRIP.opp[0], c: 0, b: 0 };
    for (let o = GRIP.opp[0]; o <= oppMax + 1e-6; o += 0.05) {
      applyThumb(SK, 0, o, GRIP.spread);
      const r = fitDigit(SK.thumb.j, SK.thumb.pads, () => (thumbHits(SK) ? -1 : thumbGap()), true, inside);
      if (r.score < bestT.score) bestT = { ...r, opp: o };
    }
    if (bestT.score === Infinity) {
      // can't reach over the rim at this tilt: lay the thumb along the outside of the bowl instead
      for (let o = -0.3; o <= 0.55 + 1e-6; o += 0.1) {
        applyThumb(SK, 0, o, GRIP.spread);
        const r = fitDigit(SK.thumb.j, SK.thumb.pads, () => (thumbHits(SK) ? -1 : thumbGap()), true);
        if (r.score < bestT.score) bestT = { ...r, opp: o, outside: true };
      }
    }
    curl[0] = bestT.c; bend[0] = bestT.b;
    return { curl: curl.map((v) => +v.toFixed(4)), bend, spread: GRIP.spread, thumbOpp: +bestT.opp.toFixed(4), thumbFit: bestT.score < Infinity ? +bestT.score.toFixed(4) : null, thumbInside: !bestT.outside };
  }

  const PRESETS = {
    open:    { curl: [0.03, 0.02, 0.02, 0.03, 0.04], spread: 0.75, thumbOpp: 0.05, wrist: [0, 0, 0] },
    relaxed: { curl: [0.16, 0.18, 0.24, 0.3, 0.36], spread: 0.3, thumbOpp: 0.3, wrist: [0.12, 0, 0] },
    palmUp:  { curl: [0.2, 0.24, 0.28, 0.32, 0.38], spread: 0.32, thumbOpp: 0.22, wrist: [-0.25, 0, 0] },
    // offer = palmUp with the wrist extended a further 0.55 rad and the fingers opened: keep the
    // group placed from palmUp and blend toward offer — the palm tips ~30° toward the fingertips.
    offer:   { curl: [0.1, 0.06, 0.06, 0.08, 0.11], spread: 0.42, thumbOpp: 0.1, wrist: [-0.8, 0, 0] },
  };
  // Every read returns a fresh copy, so a scene can tweak its pose without touching others'.
  const poses = {};
  const GETTERS = { cupGrip: () => gripPose(GRIP.tilt), cupReady: () => gripReady(GRIP.tilt) };
  for (const k of ['open', 'relaxed', 'cupReady', 'cupGrip', 'palmUp', 'offer']) {
    Object.defineProperty(poses, k, { enumerable: true, get: GETTERS[k] || (() => norm(PRESETS[k])) });
  }

  // ─── Create ───────────────────────────────────────────────────────────────────
  function create({ side = 'right', forearm = DIMS.forearm } = {}) {
    const M = materials();
    const GLOW = { rbGlowOn: { value: 0 }, rbGlowPos: { value: new V3() }, rbGlowColor: { value: new THREE.Color() }, rbGlowRange: { value: 2 } };
    addGlow(M, GLOW);
    const sk = skeleton();
    sk.mirror.scale.x = side === 'left' ? -1 : 1;
    wristMeshes(M, sk, forearm);
    palmMeshes(M, sk.yaw);
    sk.fingers.forEach((f, i) => fingerMeshes(FINGERS[i], f, M));
    thumbMeshes(sk.thumb, M);
    const group = sk.group;

    gripPose(GRIP.tilt); // fit (and cache) the default grip here, in init, not in a draw
    let triangles = 0;
    group.traverse((o) => { if (o.isMesh) triangles += o.geometry.index.count / 3; });

    function setPose(pose) { applyPose(sk, pose); return api; }
    const upd = () => group.updateWorldMatrix(true, true);
    function palmPoint(out = new V3()) { upd(); return sk.palmMark.getWorldPosition(out); }
    function palmNormal(out = new V3()) { upd(); return out.set(0, 0, -1).transformDirection(sk.yaw.matrixWorld); }
    function fingertips() { upd(); return [sk.thumb.tip, ...sk.fingers.map((f) => f.tip)].map((o) => o.getWorldPosition(new V3())); }

    const _A = new THREE.Matrix4(), _B = new THREE.Matrix4(), _C = new THREE.Matrix4(), _s3 = new V3();
    function place({ palm, forearm: fa, palmAt, at } = {}) {
      const HL = handLocal(sk, _A);
      if (palm) {
        const nl = new V3(0, 0, -1).transformDirection(HL), fl = new V3(0, 1, 0);
        const e2 = fl.clone().addScaledVector(nl, -fl.dot(nl)).normalize(), e3 = new V3().crossVectors(nl, e2);
        const P = new V3(...palm).normalize(), F = new V3(...(fa || [0, 1, 0]));
        let E2 = F.clone().addScaledVector(P, -F.dot(P));
        if (E2.lengthSq() < 1e-8) E2 = Math.abs(P.y) < 0.9 ? new V3(0, 1, 0).addScaledVector(P, -P.y) : new V3(1, 0, 0).addScaledVector(P, -P.x);
        E2.normalize();
        const E3 = new V3().crossVectors(P, E2);
        _B.makeBasis(nl, e2, e3).transpose();
        _C.makeBasis(P, E2, E3).multiply(_B);
        group.quaternion.setFromRotationMatrix(_C);
      }
      if (palmAt) {
        const pl = new V3(...PALM_PT).applyMatrix4(HL).multiply(group.scale).applyQuaternion(group.quaternion);
        group.position.set(palmAt[0] - pl.x, palmAt[1] - pl.y, palmAt[2] - pl.z);
      } else if (at) group.position.set(at[0], at[1], at[2]);
      return api;
    }
    function cupLocal(cup, out) {
      if (cup && cup.isMatrix4) return out.copy(cup);
      if (cup && cup.isObject3D) { cup.updateMatrix(); return out.copy(cup.matrix); }
      const p = (cup && cup.position) || [0, 0, 0];
      return out.makeRotationY((cup && cup.yaw) || 0).setPosition(p[0], p[1], p[2]);
    }
    // A left hand holds the cup as the mirror image of the right-hand grip (mirrored across the
    // plane through the cup axis and the contact), so `around` means the same side for both.
    const MIRROR = new THREE.Matrix4().makeScale(side === 'left' ? -1 : 1, 1, 1);
    function graspCup(cup, { around = 0, tilt = GRIP.tilt, away = 0 } = {}) {
      const APPROACH = approachDir(tilt);
      const H = cupLocal(cup, new THREE.Matrix4()).multiply(_B.makeRotationY(around)).multiply(MIRROR).multiply(gripFrame(tilt, _C));
      // back off along GRIP.approach (up the cup axis): with the digits open (cupReady) the fingers
      // slide clear down the outside of the bowl and the thumb lifts out over the rim
      if (away) H.multiply(_B.makeTranslation(APPROACH.x * away, APPROACH.y * away, APPROACH.z * away));
      H.multiply(handLocal(sk, _A).invert()).decompose(group.position, group.quaternion, _s3);
      return api;
    }
    function cupMatrix(out = new THREE.Matrix4(), { around = 0, tilt = GRIP.tilt } = {}) {
      group.updateMatrix();
      return out.copy(group.matrix).multiply(handLocal(sk, _A)).multiply(gripFrame(tilt, _C).invert()).multiply(MIRROR).multiply(_B.makeRotationY(-around));
    }

    const _gc = new THREE.Color();
    /**
     * Absolute, like setPose: set it every draw. { at: world point, intensity, color, range }.
     * setGlow(null) or intensity 0 turns it off. `at` defaults to palmPoint() + palmNormal() × 0.03.
     */
    function setGlow(g) {
      const on = !!g && (g.intensity || 0) > 0;
      GLOW.rbGlowOn.value = on ? 1 : 0;
      if (!on) return api;
      const at = g.at ? (g.at.isVector3 ? g.at : new V3(...g.at)) : palmPoint().addScaledVector(palmNormal(), 0.03);
      GLOW.rbGlowPos.value.copy(at);
      GLOW.rbGlowColor.value.copy(_gc.set(g.color || '#ffb48e')).multiplyScalar(g.intensity);
      GLOW.rbGlowRange.value = g.range == null ? 2 : g.range;
      return api;
    }

    const api = {
      group, side, materials: M, triangles,
      setPose, setGlow, palmPoint, palmNormal, fingertips, place, graspCup, cupMatrix,
      parts: sk,
    };
    setPose(poses.relaxed);
    return api;
  }

  RB.hand = { create, poses, blend, gripPose, gripReady, DIMS, grip: { tilt: GRIP.tilt }, _dev: { GRIP, THUMB, THUMB_K, cupSD, wallAt, fitGrip, reset: () => { SK = null; GRIP_CACHE.clear(); WALL.clear(); } } };
})();
