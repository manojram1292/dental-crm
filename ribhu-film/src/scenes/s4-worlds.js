/*
 * S4 · FOUR KINDS OF WORK · 10.0–15.0 s (frames 300–449) · rail: 02 MAKE
 *
 * The shot. The four cups S3 made stand in a row (RB.shots.row4). The camera
 * cranes up out of that wide frame and travels the row a little from above and
 * a little from the left, so the row recedes to the right and we look down into
 * each cup. It glides between cups and breathes (a slow drift) on each one, so
 * every world pays off, and its title reads, on a nearly still frame. A shallow
 * depth of field racks from cup to cup. Each cup holds one kind of Ribhu work
 * for two beats (1.25 s):
 *
 *   10.000  AUTOMATION         loose paper slips and message cards flutter into
 *                              the cup (the paper flicks); on 10.625 they rise
 *                              back out as three sorted stacks with staggered
 *                              copper index tabs, which glint on the accented
 *                              sorting ticks (10.859, 11.016, 11.172).
 *   11.250  OPERATIONS         eight scattered points of light (people, teams)
 *                              are linked by copper hairlines, one per 16th-note
 *                              ping, and the ring closes on the chord at 12.344.
 *   12.500  ROBOTICS & VISION  a viewfinder opens on the two focus beeps; the
 *                              stone glides into it while the lens is soft; it
 *                              corrects and locks onto the stone on the shutter
 *                              at 13.125: brackets warm to ember, depth contours,
 *                              focus snaps sharp.
 *   13.750  AGRONOMY           dark soil pours in (the crunch) and heaps, then
 *                              slumps level; a thin moisture line draws across
 *                              it; from 14.375 a seedling rises with the
 *                              sprout's glide and opens.
 *
 * As the camera moves on, each world condenses into a small ember at its cup's
 * mouth: the work becomes a light. The seedling's cup is framed from the right,
 * with the rest of the row receding behind it; as the seedling rises the camera
 * backs away along its line of sight, then swings across to the row's centre and
 * feathers into RB.shots.row4Wide at frame 449, the lens holding on the seedling
 * until it racks out to the whole row: four lights, which S5 joins into one.
 *
 * Titles are the kit's annotation voice (at 26 px), pinned to their worlds by a
 * leader of constant length. They land as the camera settles on their cup and
 * fade quickly as it moves on, so they are only ever read on a still frame.
 *
 * Contracts.
 *   IN  (frame 300): four cups at rowX, camera exactly RB.shots.row4, no text,
 *       nothing else in frame (cards start above the frame).
 *   OUT (frame 449): four cups at rowX, camera exactly RB.shots.row4Wide (it lands
 *       there with zero velocity), RB.fx.ember(r = 26/6, intensity 0.5) at each mouth centre
 *       (y = 0.9 × cup height), no labels, no world objects, no depth of field,
 *       standard backdrop. Rail: 02 active.
 */
(function () {
  'use strict';
  const R = window.REEL, RB = window.RB, THREE = window.THREE;
  const { PAL, E, clamp, lerp, seg } = R;
  const TAU = Math.PI * 2;

  // ─── Constants ──────────────────────────────────────────────────────────────
  const XS = RB.shots.rowX;
  const CUP_H = RB.CUP.height;
  const MOUTH_Y = CUP_H * 0.9;            // the contract's "mouth centre" height
  const EMBER_R = 26 / 6, EMBER_I = 0.5;  // contract glow: halo ≈ 26 px, intensity 0.5
  // The titles: the kit's annotation voice set a step up from its 20 px labels (these are the
  // scene's only words), so they read on a phone without shouting. JetBrains Mono 500, the
  // kit's 0.16 em tracking, 26 px (was 12 px × 1.5 = 18 px).
  const LABEL_SIZE = 26;
  const LABEL_TRACK = (LABEL_SIZE * 0.16).toFixed(1) + 'px'; // exactly the kit's tracking at this size
  const LABEL_GAP = 16;                   // leader end → title's right edge (the kit then insets 10)
  const SAFE = { x0: 120, x1: 1800, y0: 150, y1: 900 };
  const B = (n) => 10 + n * R.BEAT;       // beat n of this scene: B(0) = 10.0 … B(8) = 15.0
  const S16 = R.BEAT / 4, S32 = R.BEAT / 8; // the score's 16th and 32nd notes
  const LAND = 449 / R.FPS;               // frame 449: the camera lands on row4Wide exactly here (zero velocity)

  // Titles land as the camera arrives at their cup and leave as it moves on (keyT: the
  // settled camera the title is laid out from).
  const LABELS = [
    { text: 'AUTOMATION', tIn: 10.6, tOut: 11.38, keyT: 10.95 },
    { text: 'OPERATIONS', tIn: 11.7, tOut: 12.44, keyT: 12.1 },
    { text: 'ROBOTICS & VISION', tIn: 12.74, tOut: 13.58, keyT: 13.12 },
    { text: 'AGRONOMY', tIn: 13.84, tOut: 14.28, keyT: 14.12 },
  ];

  // Inner lathe profile of the cup (mirrors RB.cup) — used to fit the soil to the wall.
  const CUP_INNER = [[0.583, 0.903], [0.572, 0.84], [0.55, 0.7], [0.5, 0.56], [0.41, 0.44], [0.27, 0.35], [0.12, 0.3], [0.0, 0.29]];

  let S = null; // everything built in init()

  // ─── Small helpers ──────────────────────────────────────────────────────────
  const _v = new THREE.Vector3();
  /** Screen position (logical px) of a world point; z = NDC depth. Call after the camera is posed. */
  function proj(cam, x, y, z) {
    _v.set(x, y, z).project(cam);
    return [(_v.x * 0.5 + 0.5) * R.W, (-_v.y * 0.5 + 0.5) * R.H, _v.z];
  }
  /** Pixels per world unit at a world point (for perspective-correct 2D sizes). */
  function pxPerUnit(cam, x, y, z) {
    const d = Math.hypot(cam.position.x - x, cam.position.y - y, cam.position.z - z);
    return (R.H / 2) / Math.tan((cam.fov * Math.PI) / 360) / d;
  }
  const hash = (i, s) => R.hash(i, s);
  /** 0 → 1 → 0 bump over [a, b] (zero outside). */
  const bump = (T, a, b) => (T <= a || T >= b ? 0 : Math.sin(Math.PI * (T - a) / (b - a)));

  // ─── Camera: a glide along the row ──────────────────────────────────────────
  // Keys are orbit parameters around a look point; a monotone Hermite spline
  // joins them, so the camera never stops dead except where a key asks for it.
  const CAM_PARAMS = ['lx', 'ly', 'lz', 'yaw', 'elev', 'dist', 'fov'];
  const CAM_TENSION = 0.8;
  function shotToParams(s) {
    const dx = s.pos[0] - s.look[0], dy = s.pos[1] - s.look[1], dz = s.pos[2] - s.look[2];
    const dist = Math.hypot(dx, dy, dz);
    return { lx: s.look[0], ly: s.look[1], lz: s.look[2], yaw: Math.atan2(dx, dz), elev: Math.asin(dy / dist), dist, fov: s.fov };
  }
  // Glide, breathe, glide: each cup has an arrive and a depart key. Between them the
  // camera only drifts along the row (DRIFT, world units/s), so the world and its title
  // read still and sharp; between cups it glides on a smooth bell of speed.
  const DRIFT = 0.2;
  const HOLD = (o = {}) => ({ lx: DRIFT, ...o });
  const CAM_KEYS = [
    [B(0), shotToParams(RB.shots.row4)],
    [10.84, { lx: -2.2, ly: 0.9, lz: 0, yaw: -0.2, elev: 0.54, dist: 4.3, fov: 30 }, HOLD()],
    [11.4, { lx: -2.09, ly: 0.9, lz: 0, yaw: -0.19, elev: 0.55, dist: 4.3, fov: 30 }, HOLD()],
    [11.96, { lx: -0.8, ly: 0.88, lz: 0, yaw: -0.17, elev: 0.6, dist: 4.25, fov: 30 }, HOLD()],
    [12.46, { lx: -0.7, ly: 0.88, lz: 0, yaw: -0.16, elev: 0.61, dist: 4.25, fov: 30 }, HOLD()],
    [13.04, { lx: 0.6, ly: 0.64, lz: 0, yaw: -0.14, elev: 0.84, dist: 3.9, fov: 30 }, HOLD()],
    [13.58, { lx: 0.71, ly: 0.65, lz: 0, yaw: -0.13, elev: 0.83, dist: 3.9, fov: 30 }, HOLD()],
    [14.08, { lx: 1.7, ly: 0.86, lz: 0, yaw: 0.2, elev: 0.6, dist: 4.5, fov: 30 }, HOLD({ lx: 0.1 })],
    [14.2, { lx: 1.71, ly: 0.87, lz: 0, yaw: 0.2, elev: 0.6, dist: 4.46, fov: 30 }, { lx: 0, ly: 0, lz: 0, yaw: 0, elev: 0, dist: 0, fov: 0 }],
    [LAND, shotToParams(RB.shots.row4Wide)],
  ];
  // The last move is the reveal. The seedling's cup is framed from the right, so the rest
  // of the row already recedes behind it; the camera backs away along its line of sight
  // (log distance: an even zoom rate) and swings across a beat later, when a sideways move
  // costs few pixels. It lands on the contract shot at frame 449 with zero velocity.
  const PULL = { back: E.bezier(0.35, 0, 0.35, 1), across: E.bezier(0.45, 0, 0.3, 1) };
  function camTangent(i, key) {
    const K = CAM_KEYS;
    if (i === 0 || i === K.length - 1) return 0;
    const ov = K[i][2];
    if (ov && ov[key] != null) return ov[key];
    const p = K[i - 1][1][key], c = K[i][1][key], q = K[i + 1][1][key];
    const dl = (c - p) / (K[i][0] - K[i - 1][0]), dr = (q - c) / (K[i + 1][0] - K[i][0]);
    if (dl * dr <= 0) return 0;
    const m = CAM_TENSION * (q - p) / (K[i + 1][0] - K[i - 1][0]);
    return Math.sign(m) * Math.min(Math.abs(m), 3 * Math.abs(dl), 3 * Math.abs(dr));
  }
  /** The camera shot { pos, look, fov } at absolute time T. Exact contract shots at both ends. */
  function camShot(T) {
    const K = CAM_KEYS, n = K.length;
    if (T <= K[0][0]) return RB.shots.row4;
    if (T >= K[n - 1][0]) return RB.shots.row4Wide;
    let i = 0;
    while (i < n - 2 && T > K[i + 1][0]) i++;
    const [t0, a] = K[i], [t1, b] = K[i + 1];
    const h = t1 - t0, u = clamp((T - t0) / h), u2 = u * u, u3 = u2 * u;
    const p = {};
    if (i === n - 2) {
      const eb = PULL.back(u), ea = PULL.across(u);
      p.dist = Math.exp(lerp(Math.log(a.dist), Math.log(b.dist), eb));
      p.elev = lerp(a.elev, b.elev, eb); p.fov = lerp(a.fov, b.fov, eb);
      for (const k of ['lx', 'ly', 'lz', 'yaw']) p[k] = lerp(a[k], b[k], ea);
    } else {
      for (const k of CAM_PARAMS) {
        p[k] = (2 * u3 - 3 * u2 + 1) * a[k] + (u3 - 2 * u2 + u) * h * camTangent(i, k)
          + (-2 * u3 + 3 * u2) * b[k] + (u3 - u2) * h * camTangent(i + 1, k);
      }
    }
    const ce = Math.cos(p.elev);
    return {
      pos: [p.lx + p.dist * Math.sin(p.yaw) * ce, p.ly + p.dist * Math.sin(p.elev), p.lz + p.dist * Math.cos(p.yaw) * ce],
      look: [p.lx, p.ly, p.lz], fov: p.fov,
    };
  }
  /**
   * Where the lens is focused: the hero cup's world. The camera frames the seedling's cup
   * from the right, so the focus is handed to that cup as the camera arrives, and it stays
   * on it through the pull back.
   */
  function focusPoint(T, shot) {
    const w = E.inOutSine(seg(T, 13.62, 14.08));
    return [lerp(shot.look[0], XS[3], w), lerp(shot.look[1] + 0.12, MOUTH_Y + 0.1, w), lerp(shot.look[2], 0, w)];
  }
  /** Depth of field: shallow in the close-ups; it holds on the seedling's cup through the pull back
   *  (softening the row as it streams in) and racks out to the whole row as the camera lands. */
  function lensAmount(T, close) {
    return Math.max(close, T > 14 ? 1 - E.inOutSine(seg(T, 14.64, 14.9)) : 0);
  }
  /** 0 on the wide contract shots → 1 in the cup close-ups (drives DOF, atmosphere, shadows). */
  function closeness(cam) {
    const d = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
    return R.smoothstep(6.4, 4.35, d);
  }

  // ─── Build: textures and shared materials ───────────────────────────────────
  /** Ivory paper with faint ruled writing (never legible): slips, message cards, notes. */
  function paperTexture(kind, w, d, seed) {
    const cw = 256, ch = Math.max(48, Math.round((256 * d) / w));
    const c = document.createElement('canvas');
    c.width = cw; c.height = ch;
    const g = c.getContext('2d'), r = R.rng(seed);
    g.fillStyle = '#f1ead7'; g.fillRect(0, 0, cw, ch);
    for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(110,90,70,${(0.035 * r()).toFixed(3)})`; g.fillRect(r() * cw, r() * ch, 1 + r() * 4, 1); }
    g.fillStyle = 'rgba(129,115,104,0.5)';
    const bar = (x, y, len, hgt) => { g.beginPath(); R.roundRectPath(g, x, y, len, hgt, hgt / 2); g.fill(); };
    if (kind === 0) { // slip: two long lines
      bar(18, ch * 0.34, cw * (0.62 + r() * 0.2), 5); bar(18, ch * 0.6, cw * (0.35 + r() * 0.25), 5);
    } else if (kind === 1) { // message card: a heavier first line, then body lines
      g.fillStyle = 'rgba(180,111,67,0.55)'; bar(20, 22, cw * 0.32, 8);
      g.fillStyle = 'rgba(129,115,104,0.45)';
      for (let k = 0; k < 4; k++) bar(20, 50 + k * 22, cw * (0.5 + r() * 0.35), 5);
    } else { // note: short lines
      for (let k = 0; k < 5; k++) bar(22, 30 + k * 36, cw * (0.35 + r() * 0.4), 6);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    return tex;
  }

  /** Dark, crumbly soil: umber grains of many sizes, a little grit catching the light. */
  function soilTexture(seed) {
    const n = 512, c = document.createElement('canvas');
    c.width = c.height = n;
    const g = c.getContext('2d'), r = R.rng(seed);
    g.fillStyle = '#1b130d'; g.fillRect(0, 0, n, n);
    for (let i = 0; i < 90; i++) { // low-frequency mottling: damp and dry patches
      g.fillStyle = r() < 0.55 ? 'rgba(6,4,3,0.22)' : 'rgba(62,45,32,0.14)';
      g.beginPath(); g.arc(r() * n, r() * n, 20 + r() * 60, 0, TAU); g.fill();
    }
    for (let i = 0; i < 14000; i++) { // crumbs: mostly dark, a lit top edge on the larger ones
      const v = r(), x = r() * n, y = r() * n, rad = 0.7 + r() * r() * 3.6;
      g.fillStyle = R.ramp(['#070504', '#1d140e', '#34261b', '#4a3727'], v * v, 0.7);
      g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill();
      if (rad > 2.4) { g.fillStyle = 'rgba(92,70,52,0.35)'; g.beginPath(); g.arc(x - rad * 0.3, y - rad * 0.3, rad * 0.45, 0, TAU); g.fill(); }
    }
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(140,112,86,${(0.15 + r() * 0.2).toFixed(2)})`; g.fillRect(r() * n, r() * n, 1, 1); }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    return tex;
  }

  // ─── World 0 · AUTOMATION ───────────────────────────────────────────────────
  const W0 = {
    kinds: [{ w: 0.4, d: 0.115 }, { w: 0.3, d: 0.2 }, { w: 0.22, d: 0.22 }], // slip, card, note
    perStack: 5,
    stackX: [-0.5, -0.03, 0.41],
    stackY: 1.3, gapY: 0.026, stackYaw: -0.16,
    build(S) {
      const g = new THREE.Group(); g.position.set(XS[0], 0, 0);
      const edge = new THREE.MeshStandardMaterial({ color: '#8c8471', roughness: 0.85 });
      const under = new THREE.MeshStandardMaterial({ color: '#80786a', roughness: 0.9 });
      const tabMat = RB.mat.copperPolished({ roughness: 0.22, emissive: new THREE.Color(PAL.copperHot), emissiveIntensity: 0.45 });
      this.cards = [];
      this.kinds.forEach((k, ki) => {
        const top = new THREE.MeshStandardMaterial({ map: paperTexture(ki, k.w, k.d, 40 + ki), color: '#ada48f', roughness: 0.85 });
        const geo = new THREE.BoxGeometry(k.w, 0.006, k.d);
        const tabGeo = new THREE.BoxGeometry(0.04, 0.0066, 0.04);
        for (let n = 0; n < this.perStack; n++) {
          const pivot = new THREE.Group();
          const card = new THREE.Mesh(geo, [edge, edge, top, under, edge, edge]);
          const tab = new THREE.Mesh(tabGeo, tabMat);
          tab.position.set(k.w / 2 + 0.017, 0, -k.d / 2 + 0.022 + (n * (k.d - 0.044)) / (this.perStack - 1));
          pivot.add(card, tab);
          g.add(pivot);
          const j = this.cards.length;
          this.cards.push({ pivot, tab, kind: ki, n, j, h: [0, 1, 2, 3, 4, 5, 6].map((s) => hash(j, 100 + s)) });
        }
      });
      // Cards fall in the order of a shuffled deck, not stack by stack.
      const order = this.cards.map((c) => c.j).sort((a, b) => hash(a, 7) - hash(b, 7));
      order.forEach((j, rank) => { this.cards[j].rank = rank; });
      S.scene.add(g);
      this.group = g;
    },
    /** Stack slot of a card (local to the cup), after the stack yaw. */
    slot(c) {
      const x = this.stackX[c.kind], y = this.stackY + c.n * this.gapY, cy = Math.cos(this.stackYaw), sy = Math.sin(this.stackYaw);
      return [x * cy, y, -x * sy];
    },
    times(c) {
      const fall0 = 10.02 + c.rank * 0.009, fall1 = fall0 + 0.4 + c.h[6] * 0.04;   // all in by 10.59, before any rise
      const rise0 = B(1) - 0.03 + c.kind * 0.06 + c.n * 0.012, rise1 = rise0 + 0.5;
      const back0 = 11.36 + c.kind * 0.07, back1 = back0 + 0.36;
      return { fall0, fall1, rise0, rise1, back0, back1 };
    },
    pose(T) {
      this.lightI = 0;
      for (const c of this.cards) {
        const { pivot, h } = c, tm = this.times(c);
        if (T < tm.fall0 || (T >= tm.fall1 && T < tm.rise0) || T >= tm.back1) { pivot.visible = false; continue; }
        pivot.visible = true;
        if (T < tm.fall1) {
          // Tumble in: a loose flurry converging on the mouth, gravity-eased.
          // paper doesn't drop like a stone: near its terminal speed from the start, swaying as it falls
          const u = seg(T, tm.fall0, tm.fall1), uy = 0.75 * u + 0.25 * u * u, uc = E.inOutSine(u);
          const x0 = (h[0] - 0.5) * 1.9, z0 = (h[1] - 0.5) * 1.1, y0 = 2.45 + h[2] * 0.55;
          pivot.position.set(lerp(x0, (h[0] - 0.5) * 0.16, uc), lerp(y0, 0.4, uy), lerp(z0, (h[1] - 0.5) * 0.1, uc));
          const spin = 1 + u * 1.1;
          pivot.rotation.set(h[3] * TAU + spin * (h[4] - 0.5) * 5, h[4] * TAU + spin * 1.5, h[5] * TAU + spin * (h[3] - 0.5) * 4);
          pivot.scale.setScalar(1);
        } else {
          // Rise out sorted: each stack lifts out of the mouth as one loose column, fans out to its
          // place and squares up (the gaps close) on landing. Then, as the camera leaves, it sinks back.
          const [sx, sy, sz] = this.slot(c);
          const u = seg(T, tm.rise0, tm.rise1), up = E.outCubic(seg(u, 0, 0.62)), fan = E.inOutCubic(seg(u, 0.18, 0.9));
          const square = E.backOut(1.4)(seg(u, 0.45, 1));
          const gap = lerp(lerp(0.02, 0.075, up), this.gapY, square);   // tight in the bowl, loose in flight, squared on landing
          const baseY = lerp(0.3, this.stackY, up);                         // starts below the front wall's sightline
          let x = lerp(sx * 0.34, sx, fan), z = lerp(sz * 0.34, sz, fan);
          let y = baseY + c.n * gap + 0.004 * Math.sin((T - 10) * 3.2 + c.kind * 1.7) * square;
          const loose = 1 - square;
          let rx = loose * (c.h[3] - 0.5) * 0.35, rz = loose * (c.h[5] - 0.5) * 0.35, ry = this.stackYaw + loose * (c.h[4] - 0.5) * 0.5;
          let sc = 1;
          const b = E.inCubic(seg(T, tm.back0, tm.back1));
          if (b > 0) { // the whole stack files back down into the cup, in order
            x = lerp(x, x * 0.42, b); z = lerp(z, z * 0.42, b); y -= (this.stackY - 0.42) * b;
            sc = lerp(1, 0.72, b);
          }
          pivot.position.set(x, y, z);
          pivot.rotation.set(rx, ry, rz);
          pivot.scale.setScalar(sc);
        }
      }
    },
    /** 2D: the routing hairlines — one mouth forks into three sorted stacks. */
    overlay(ctx, T, cam) {
      const a = E.outCubic(seg(T, B(1), B(1) + 0.3)) * (1 - seg(T, 11.05, 11.35));
      if (a <= 0.001) return;
      const ox = XS[0], m = proj(cam, ox, MOUTH_Y + 0.06, 0);
      const draw = seg(T, B(1), B(1) + 0.3);
      ctx.save();
      ctx.lineWidth = 1.1;
      for (let k = 0; k < 3; k++) {
        const c = { kind: k, n: 0 };
        const [sx, sy, sz] = this.slot(c);
        const e = proj(cam, ox + sx, sy - 0.03, sz);
        const cx = m[0], cy = lerp(m[1], e[1], 0.85);
        const pts = [];
        const f = E.outCubic(clamp(draw * 1.15 - k * 0.07));
        for (let i = 0; i <= 24; i++) {
          const s = (i / 24) * f, us = 1 - s;
          pts.push([us * us * m[0] + 2 * us * s * cx + s * s * e[0], us * us * m[1] + 2 * us * s * cy + s * s * e[1]]);
        }
        ctx.strokeStyle = R.rgba(PAL.ivory, 0.42 * a);
        ctx.beginPath(); R.polyPath(ctx, pts, false); ctx.stroke();
        const tip = pts[pts.length - 1];
        R.fillCircle(ctx, tip[0], tip[1], 2.2, R.rgba(PAL.ember, 0.9 * a));
      }
      R.fillCircle(ctx, m[0], m[1], 2.4, R.rgba(PAL.ember, 0.9 * a));
      ctx.restore();
      // Sorting ticks: each stack's top tab catches a spark on an accented tick of the score.
      const w = new THREE.Vector3();
      for (let k = 0; k < 3; k++) {
        const tk = this.tickAt[k];
        if (T < tk - 0.03 || T > tk + 0.4) continue;
        const g = T < tk ? (T - tk + 0.03) / 0.03 : Math.exp(-(T - tk) * 9);
        const top = this.cards.find((c) => c.kind === k && c.n === this.perStack - 1);
        if (!top.pivot.visible) continue;
        top.tab.getWorldPosition(w);
        const p = proj(cam, w.x, w.y, w.z);
        RB.fx.ember(ctx, p[0], p[1], 3.4, { intensity: 0.85 * g });
      }
    },
    tickAt: [B(1) + 3 * S32, B(1) + 5 * S32, B(1) + 7 * S32],   // 10.859, 11.016, 11.172
    anchor(cam) { const [sx, sy, sz] = this.slot({ kind: 0, n: 2 }); return proj(cam, XS[0] + sx - 0.22, sy, sz); },
    glow: { start: 11.56, ramp: 0.28, flare: 0.3 },
  };

  // ─── World 1 · OPERATIONS ───────────────────────────────────────────────────
  const W1 = {
    count: 8, ringR: 0.76, ringY: 1.02,
    build(S) {
      this.pts = [];
      for (let j = 0; j < this.count; j++) {
        this.pts.push({
          a: (j / this.count) * TAU + (hash(j, 210) - 0.5) * 0.7,
          r: 0.98 + hash(j, 211) * 0.42,
          y: 1.02 + hash(j, 212) * 0.5,
        });
      }
    },
    // The score's arpeggio: a ping every 16th from 11.25, one hairline per ping; the eighth
    // hairline closes the ring on the chord at 12.344.
    connectAt: (j) => B(2) + j * S16,
    closeT: B(2) + 7 * S16,
    igniteAt: (j) => 11.04 + j * 0.026,
    rot: (T) => 0.3 + 0.18 * (T - B(2)),
    condense: (T) => E.inOutCubic(seg(T, 12.6, 12.95)),
    /** Local polar position { a, r, y } of point j at time T. */
    point(j, T) {
      const p = this.pts[j];
      const move = E.inOutCubic(seg(T, this.connectAt(j) - 0.5, this.connectAt(j) + 0.04));   // each point finds its place as it connects
      const drift = 0.03 * R.noise.n2(j * 3.1, T * 0.9);
      const ringA = (j / this.count) * TAU + this.rot(T);
      let a = lerp(p.a + drift * 2, ringA, move), r = lerp(p.r + drift, this.ringR, move), y = lerp(p.y + drift, this.ringY, move);
      const c = this.condense(T);
      r *= 1 - c; y = lerp(y, MOUTH_Y, c);
      return { a, r, y };
    },
    world(pp) { return [XS[1] + Math.cos(pp.a) * pp.r, pp.y, Math.sin(pp.a) * pp.r]; },
    pose(T) {
      const closed = seg(T, this.closeT - 0.05, this.closeT + 0.1);
      const on = seg(T, this.igniteAt(0), this.igniteAt(0) + 0.25);
      // The ring lights the bowl from within; it goes out as the ring condenses.
      this.lightI = on * (0.22 + 0.5 * closed) * (1 - this.condense(T));
      this.lightPos = [XS[1], lerp(this.ringY - 0.08, MOUTH_Y - 0.1, this.condense(T)), 0];
    },
    overlay(ctx, T, cam) {
      if (T < this.igniteAt(0) || T > 13.02) return;
      const fade = 1 - seg(T, 12.8, 12.98);
      const P = [];
      for (let j = 0; j < this.count; j++) P.push(this.point(j, T));
      const ring = E.outCubic(seg(T, this.closeT - 0.04, this.closeT + 0.16));
      const pulse = Math.exp(-Math.max(0, T - this.closeT) * 7) * seg(T, this.closeT - 0.03, this.closeT);
      ctx.save();
      ctx.lineCap = 'round';
      // Hairlines, one per ping: point j reaches for point j+1 along the (forming) ring.
      for (let j = 0; j < this.count; j++) {
        const f = E.outCubic(seg(T, this.connectAt(j) - 0.12, this.connectAt(j)));
        if (f <= 0) continue;
        const A = P[j], Bp = P[(j + 1) % this.count];
        let da = Bp.a - A.a; da = ((da % TAU) + TAU + Math.PI) % TAU - Math.PI;
        const pts = [];
        for (let i = 0; i <= 16; i++) {
          const s = (i / 16) * f;
          const w = this.world({ a: A.a + da * s, r: lerp(A.r, Bp.r, s), y: lerp(A.y, Bp.y, s) });
          pts.push(proj(cam, w[0], w[1], w[2]));
        }
        ctx.strokeStyle = R.rgba(PAL.copperHot, (0.85 + 0.15 * ring) * fade);
        ctx.lineWidth = 1.3 + 0.5 * ring;
        ctx.beginPath(); R.polyPath(ctx, pts, false); ctx.stroke();
        if (ring > 0) {
          ctx.strokeStyle = R.rgba(PAL.ember, (0.22 * ring + 0.5 * pulse) * fade);
          ctx.lineWidth = 5;
          ctx.stroke();
        }
      }
      // Spokes: every point to one shared centre — one view.
      const hub = [XS[1], lerp(this.ringY, MOUTH_Y, this.condense(T)), 0];
      const hs = proj(cam, hub[0], hub[1], hub[2]);
      const sp = E.outCubic(seg(T, this.closeT, this.closeT + 0.26));
      if (sp > 0) {
        ctx.lineWidth = 0.9;
        ctx.strokeStyle = R.rgba(PAL.ivory, 0.28 * fade);
        for (let j = 0; j < this.count; j++) {
          const w = this.world(P[j]), s = proj(cam, w[0], w[1], w[2]);
          ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(lerp(s[0], hs[0], sp), lerp(s[1], hs[1], sp)); ctx.stroke();
        }
      }
      ctx.restore();
      // The points themselves: people, teams — each a small ember.
      for (let j = 0; j < this.count; j++) {
        const ig = seg(T, this.igniteAt(j), this.igniteAt(j) + 0.12);
        if (ig <= 0) continue;
        const w = this.world(P[j]), s = proj(cam, w[0], w[1], w[2]);
        const k = pxPerUnit(cam, w[0], w[1], w[2]) / 180;
        const flash = bump(T, this.igniteAt(j), this.igniteAt(j) + 0.3) * 0.6 + bump(T, this.connectAt(j) - 0.04, this.connectAt(j) + 0.16) * 0.5;
        RB.fx.ember(ctx, s[0], s[1], 5.2 * k, { intensity: (0.85 * ig + flash) * fade * (1 - 0.85 * this.condense(T)) });
      }
      if (sp > 0) RB.fx.ember(ctx, hs[0], hs[1], 6 * pxPerUnit(cam, hub[0], hub[1], hub[2]) / 180, { intensity: (0.5 * sp + 0.5 * pulse + 0.5 * this.condense(T)) * fade });
    },
    /** A fixed place on the ring (back left), not a moving point: the title's leader lands where the ring will close. */
    anchor(cam, T) {
      const c = this.condense(T), a = 1.22 * Math.PI, r = this.ringR * (1 - c);
      return proj(cam, XS[1] + Math.cos(a) * r, lerp(this.ringY, MOUTH_Y, c), Math.sin(a) * r);
    },
    glow: { start: 12.8, ramp: 0.28, flare: 0.3 },
  };

  // ─── World 2 · ROBOTICS & VISION ────────────────────────────────────────────
  const W2 = {
    stonePos: [0.03, 0.39, -0.06],
    lockT: B(5),                                 // 13.125
    build(S) {
      const g = weldedGeometry(new THREE.IcosahedronGeometry(1, 7));
      const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        const k = 1 + 0.13 * R.noise.fbm3(x * 1.1 + 4, y * 1.1, z * 1.1, 2) + 0.012 * R.noise.n3(x * 9, y * 9, z * 9);
        pos.setXYZ(i, x * k * 0.19, y * k * 0.1, z * k * 0.15);
      }
      g.computeVertexNormals(); g.computeBoundingBox();
      // A river stone, not a potato: fine mineral speckle and a darker, weathered band.
      const col = new Float32Array(pos.count * 3), base = new THREE.Color('#3b342f');
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i) * 30, y = pos.getY(i) * 30, z = pos.getZ(i) * 30;
        const v = 0.78 + 0.3 * (R.noise.fbm3(x * 0.4, y * 0.4, z * 0.4, 3) * 0.5 + 0.5) + 0.22 * Math.max(0, R.noise.n3(x * 3.1, y * 3.1, z * 3.1) - 0.45);
        col[i * 3] = base.r * v; col[i * 3 + 1] = base.g * v; col[i * 3 + 2] = base.b * v;
      }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      this.stone = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ color: '#ffffff', vertexColors: true, roughness: 0.6, clearcoat: 0.3, clearcoatRoughness: 0.45 }));
      this.stone.position.set(XS[2] + this.stonePos[0], this.stonePos[1], this.stonePos[2]);
      this.stone.rotation.set(0.05, 0.6, -0.04);
      this.stone.updateMatrixWorld(true);
      S.scene.add(this.stone);
      // Points on the stone's surface (not its bounding box), so the reticle frames its silhouette.
      this.silhouette = [];
      for (let i = 0; i < pos.count; i += 7) this.silhouette.push(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)));
    },
    condense: (T) => E.inOutCubic(seg(T, 13.66, 14.02)),
    pose(T) {
      this.stone.visible = T > 10.4 && T < 14.6;
      this.stone.updateMatrixWorld(true);
      this.lightI = 0;
    },
    /** Projected bounding rect of the stone: [x0, y0, x1, y1]. */
    targetRect(cam) {
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      const w = this._w || (this._w = new THREE.Vector3());
      for (const c of this.silhouette) {
        w.copy(c).applyMatrix4(this.stone.matrixWorld); const s = proj(cam, w.x, w.y, w.z);
        x0 = Math.min(x0, s[0]); y0 = Math.min(y0, s[1]); x1 = Math.max(x1, s[0]); y1 = Math.max(y1, s[1]);
      }
      return [x0, y0, x1, y1];
    },
    /** The stone's rect on the settled shot: where the viewfinder waits for it. */
    layout() {
      const cam = RB.camera(30);
      RB.setCam(cam, camShot(this.lockT));
      this.waitRect = this.targetRect(cam);
    },
    /**
     * Reticle state at T: centre, half-size, rotation, lock amount, alpha. While it hunts the
     * reticle belongs to the lens (screen space): the camera glides in, the stone slides into
     * the brackets, they guess past it, correct, and on the shutter they lock onto the stone
     * and from then on ride with it.
     */
    reticle(T, cam) {
      const rect = (r) => { const cx = (r[0] + r[2]) / 2, cy = (r[1] + r[3]) / 2; return [cx, cy, (r[2] - r[0]) / 2 + 14, (r[3] - r[1]) / 2 + 14]; };
      const live = rect(this.targetRect(cam)), wait = rect(this.waitRect);
      const follow = E.inOutSine(seg(T, 12.92, this.lockT));
      const key = R.tween(T, [
        [B(4), [1.6, 260, -10, 0.08]],                     // it opens ahead of the stone gliding in…
        [12.84, [1.35, 130, 14, -0.04], E.inOutSine],     // …drifts, searching; the stone slides through it
        [13.0, [1.1, -12, 4, 0.01], E.inOutCubic],        // a quick correction, a touch past
        [this.lockT, [1, 0, 0, 0], E.outCubic],           // and locks on the shutter
      ]);
      const lock = E.snap(seg(T, this.lockT, this.lockT + 0.2));
      const c = this.condense(T);
      const k = key[0] * (1 - 0.06 * lock) * (1 - c);
      return {
        x: lerp(wait[0], live[0], follow) + key[1], y: lerp(wait[1], live[1], follow) + key[2],
        hw: lerp(wait[2], live[2], follow) * k, hh: lerp(wait[3], live[3], follow) * k, rot: key[3], lock, c,
        alpha: seg(T, B(4), B(4) + 0.06) * (1 - seg(T, 13.8, 14.02)),
      };
    },
    /** Hero blur for the focus pull: soft while hunting, sharp on the lock. */
    heroBlur(T) {
      return 4.5 * bump(T, B(4) - 0.1, this.lockT + 0.25) * (1 - E.inOutSine(seg(T, this.lockT - 0.3, this.lockT)));
    },
    overlay(ctx, T, cam) {
      if (T < B(4) || T > 14.05) return;
      const r = this.reticle(T, cam);
      if (r.alpha <= 0.001) return;
      const ox = XS[2];
      ctx.save();
      // Depth contours: iso-depth rings on the inner wall, drawn from the rim down to the stone.
      const depthP = seg(T, this.lockT - 0.18, this.lockT + 0.3);
      const levels = [0.84, 0.7, 0.57, 0.46];
      levels.forEach((yl, li) => {
        const f = E.outCubic(clamp(depthP * 1.6 - li * 0.18));
        if (f <= 0) return;
        const rr = innerRadiusAt(yl) * 0.995;
        const pts = [];
        const n = 72;
        for (let i = 0; i <= n; i++) {
          const a = Math.PI + (i / n) * Math.PI * f; // back half of the wall (faces the camera)
          pts.push(proj(cam, ox + Math.cos(a) * rr, yl, Math.sin(a) * rr));
        }
        ctx.strokeStyle = R.rgba(PAL.ivory, 0.3 * r.alpha * (1 - r.c));
        ctx.lineWidth = 1;
        ctx.beginPath(); R.polyPath(ctx, pts, false); ctx.stroke();
      });
      // Plumb line with ticks: from above the rim down to the stone.
      const top = proj(cam, ox + this.stonePos[0], 1.32, this.stonePos[2]);
      const bot = proj(cam, ox + this.stonePos[0], this.stonePos[1] + 0.07, this.stonePos[2]);
      const pl = E.outCubic(seg(T, this.lockT - 0.05, this.lockT + 0.3));
      if (pl > 0) {
        ctx.strokeStyle = R.rgba(PAL.ivory, 0.45 * r.alpha * (1 - r.c));
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.lineTo(lerp(top[0], bot[0], pl), lerp(top[1], bot[1], pl)); ctx.stroke();
        levels.forEach((yl) => {
          const s = proj(cam, ox + this.stonePos[0], yl, this.stonePos[2]);
          if ((s[1] - top[1]) / Math.max(1, bot[1] - top[1]) > pl) return;
          ctx.beginPath(); ctx.moveTo(s[0] - 5, s[1]); ctx.lineTo(s[0] + 5, s[1]); ctx.stroke();
        });
      }
      // The reticle: four corner brackets and a centre cross.
      ctx.translate(r.x, r.y); ctx.rotate(r.rot);
      const L = Math.min(r.hw, r.hh) * 0.42;
      const beep = Math.max(bump(T, B(4), B(4) + 0.07), bump(T, 12.575, 12.645));   // the score's two focus beeps
      const brackets = () => {
        ctx.beginPath();
        for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
          ctx.moveTo(sx * r.hw, sy * (r.hh - L)); ctx.lineTo(sx * r.hw, sy * r.hh); ctx.lineTo(sx * (r.hw - L), sy * r.hh);
        }
      };
      ctx.lineJoin = 'miter'; ctx.lineCap = 'square';
      brackets();
      if (r.lock > 0) { // locked: the brackets warm to ember and glow
        ctx.strokeStyle = R.rgba(PAL.ember, 0.2 * r.lock * r.alpha * (1 - r.c)); ctx.lineWidth = 7;
        ctx.stroke();
      }
      ctx.strokeStyle = R.mix(PAL.ivory, PAL.ember, r.lock).replace(/,1\)$/, `,${Math.min(1, 0.85 * r.alpha + 0.3 * beep).toFixed(3)})`);
      ctx.lineWidth = 1.7 + 1.1 * beep + 0.6 * r.lock;
      ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.lineWidth = 1;
      ctx.strokeStyle = R.rgba(PAL.ivory, 0.55 * r.alpha);
      const cs = 7 + 5 * (1 - r.lock);
      ctx.beginPath(); ctx.moveTo(-cs, 0); ctx.lineTo(cs, 0); ctx.moveTo(0, -cs); ctx.lineTo(0, cs); ctx.stroke();
      // Edge ticks reaching out: the reticle's sight lines.
      ctx.strokeStyle = R.rgba(PAL.ivory, 0.3 * r.alpha);
      const ext = 26 * (1 - 0.5 * r.lock);
      ctx.beginPath();
      ctx.moveTo(-r.hw - ext, 0); ctx.lineTo(-r.hw - 6, 0); ctx.moveTo(r.hw + 6, 0); ctx.lineTo(r.hw + ext, 0);
      ctx.moveTo(0, -r.hh - ext); ctx.lineTo(0, -r.hh - 6); ctx.moveTo(0, r.hh + 6); ctx.lineTo(0, r.hh + ext);
      ctx.stroke();
      // Lock flash: a ring expanding off the brackets.
      const fl = seg(T, this.lockT, this.lockT + 0.35);
      if (fl > 0 && fl < 1) {
        ctx.strokeStyle = R.rgba(PAL.ember, 0.6 * (1 - fl) * r.alpha);
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-r.hw * (1 + fl * 0.35), -r.hh * (1 + fl * 0.35), r.hw * 2 * (1 + fl * 0.35), r.hh * 2 * (1 + fl * 0.35));
      }
      ctx.restore();
    },
    anchor(cam) { return proj(cam, XS[2] + this.stonePos[0] - 0.13, this.stonePos[1] + 0.06, this.stonePos[2]); },
    glow: { start: 13.85, ramp: 0.28, flare: 0.3 },
  };

  // ─── World 3 · AGRONOMY ─────────────────────────────────────────────────────
  const W3 = {
    crumbs: 90,
    build(S) {
      const g = new THREE.Group(); g.position.set(XS[3], 0, 0);
      // Soil: a clumpy disc that rises inside the cup, fitted to the wall.
      const geo = new THREE.RingGeometry(0, 1, 128, 28);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i), r = Math.hypot(x, z);
        const n = R.noise.fbm2(x * 6 + 3, z * 6, 3), clump = R.noise.n2(x * 17 + 9, z * 17);
        pos.setY(i, (0.02 * n + 0.009 * Math.max(0, clump)) * (1 - r ** 6) + 0.02 * R.smoothstep(0.84, 1, r));
      }
      geo.computeVertexNormals();
      this.soilBaseY = Float32Array.from({ length: pos.count }, (_, i) => pos.getY(i));
      const soilTex = soilTexture(77);
      const soilMat = new THREE.MeshStandardMaterial({ map: soilTex, bumpMap: soilTex, bumpScale: 3, roughness: 0.96, metalness: 0 });
      this.soil = new THREE.Mesh(geo, soilMat);
      g.add(this.soil);
      // Crumbs pouring in.
      this.crumbMesh = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: '#5a412f', roughness: 0.85 }), this.crumbs);
      this.crumbMesh.frustumCulled = false;
      g.add(this.crumbMesh);
      // Seedling: an ivory stem and two cotyledons.
      // warm ivory, softly translucent-looking (a little ember from within), never bleached white
      this.seedMat = RB.mat.ivory({ color: '#d9cdb0', side: THREE.DoubleSide, emissive: new THREE.Color(PAL.ember), emissiveIntensity: 0, roughness: 0.6, clearcoat: 0.12, clearcoatRoughness: 0.5 });
      this.seed = new THREE.Group();
      const stemCurve = new THREE.CatmullRomCurve3([[0, 0, 0], [0.018, 0.12, 0.006], [-0.014, 0.26, 0], [0.006, 0.38, -0.006]].map((p) => new THREE.Vector3(...p)));
      this.stemTop = new THREE.Vector3(0.006, 0.38, -0.006);
      this.stem = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 48, 0.0085, 12), this.seedMat);
      this.seed.add(this.stem);
      const L = 0.22, Wd = 0.14;
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.bezierCurveTo(Wd * 0.95, L * 0.22, Wd * 0.8, L * 0.85, 0, L);
      shape.bezierCurveTo(-Wd * 0.8, L * 0.85, -Wd * 0.95, L * 0.22, 0, 0);
      const leafGeo = new THREE.ShapeGeometry(shape, 24);
      const lp = leafGeo.attributes.position;
      for (let i = 0; i < lp.count; i++) { const x = lp.getX(i), y = lp.getY(i); lp.setZ(i, -1.4 * x * x + 0.1 * y * (1 - y / L)); }
      leafGeo.computeVertexNormals();
      this.leaves = [-1, 1].map((side) => {
        const pivot = new THREE.Group(), leaf = new THREE.Mesh(leafGeo, this.seedMat);
        pivot.add(leaf); pivot.position.copy(this.stemTop);
        this.seed.add(pivot);
        return { pivot, leaf, side };
      });
      g.add(this.seed);
      S.scene.add(g);
      this.group = g;
    },
    /** The pour builds a soft heap where the stream lands; it slumps flat as the cup fills. */
    heap(T) { return 0.17 * Math.sin(Math.PI * seg(T, 13.72, 14.26)) ** 1.5; },
    level(T) {
      const fill = E.outCubic(seg(T, 13.75, 14.15));
      const drain = E.inCubic(seg(T, 14.62, 14.9));
      return lerp(0.3, 0.785, fill * (1 - drain));
    },
    grow: (T) => E.outCubic(seg(T, B(7), 14.56)),                   // rises with the sprout's glide from 14.375
    unfurl: (T) => E.backOut(1.5)(seg(T, 14.44, 14.72)),           // and blooms open
    condense: (T) => E.inCubic(seg(T, 14.76, 14.92)),
    pose(T) {
      const lv = this.level(T), on = T > 13.7 && T < 14.92;
      this.soil.visible = on;
      const rS = innerRadiusAt(lv) * 1.025;
      this.soil.position.y = lv; this.soil.scale.set(rS, 1, rS);
      if (on) {
        // (the disc is a unit disc scaled by rS in x/z: the heap is placed and sized in world units)
        const hp = this.heap(T), g = this.soil.geometry, pos = g.attributes.position, sig = (0.2 / rS) ** 2;
        for (let i = 0; i < pos.count; i++) {
          const dx = pos.getX(i) + 0.12 / rS, dz = pos.getZ(i) - 0.05 / rS;
          pos.setY(i, this.soilBaseY[i] + hp * Math.exp(-(dx * dx + dz * dz) / sig));
        }
        pos.needsUpdate = true; g.computeVertexNormals();
      }
      // Crumbs: a loose stream from above, landing on the rising surface.
      const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), p = new THREE.Vector3();
      for (let i = 0; i < this.crumbs; i++) {
        const t0 = 13.42 + (i / this.crumbs) * 0.46 + hash(i, 300) * 0.05, t1 = t0 + 0.33 + hash(i, 301) * 0.06;   // first clods land on the crunch
        const u = seg(T, t0, t1);
        if (u <= 0 || u >= 1) { m.makeScale(0, 0, 0); this.crumbMesh.setMatrixAt(i, m); continue; }
        const x0 = -0.12 + (hash(i, 302) - 0.5) * 0.07, z0 = 0.05 + (hash(i, 303) - 0.5) * 0.06;   // a narrow stream…
        const spread = 0.12 + 0.35 * hash(i, 310);                                                  // …that splashes on landing
        const xe = -0.12 + (hash(i, 304) - 0.5) * spread, ze = 0.05 + (hash(i, 305) - 0.5) * spread;
        const land = this.level(t1) + this.heap(t1) * 0.8;
        const fy = 0.3 * u + 0.7 * u * u;   // falling, a little air resistance
        p.set(lerp(x0, xe, fy), lerp(1.95 + hash(i, 306) * 0.35, land, fy), lerp(z0, ze, fy));
        e.set(hash(i, 307) * 6 + u * 3, hash(i, 308) * 6 + u * 2.5, 0); q.setFromEuler(e);
        const cs = 0.008 + hash(i, 309) * 0.013; sc.set(cs * (0.8 + 0.5 * hash(i, 311)), cs * 0.7, cs * (0.8 + 0.5 * hash(i, 312)));   // clods, not beads
        m.compose(p, q, sc); this.crumbMesh.setMatrixAt(i, m);
      }
      this.crumbMesh.instanceMatrix.needsUpdate = true;
      this.crumbMesh.visible = T > 13.42 && T < 14.3;
      // Seedling.
      const gr = this.grow(T), uf = this.unfurl(T), c = this.condense(T);
      this.seed.visible = gr > 0.001 && c < 0.999;
      this.seed.position.set(0.0, lv - 0.004, 0.02);
      const s = Math.max(0.001, (0.25 + 0.75 * gr) * (1 - c));
      this.seed.scale.set(s, Math.max(0.001, gr * (1 - c)), s);
      this.seed.rotation.set(0, -0.3, 0.06 * (1 - gr));
      for (const L of this.leaves) {
        L.pivot.rotation.set(0, 0, -L.side * lerp(0.08, 1.05, uf));
        L.leaf.rotation.set(0, L.side * lerp(0.2, 0.9, uf), 0);
        L.pivot.scale.setScalar(lerp(0.35, 1, E.outCubic(seg(T, 14.4, 14.7))));
      }
      this.seedMat.emissiveIntensity = 0.12 * uf + 1.4 * c;
      this.lightI = 0.28 * seg(T, 14.38, 14.6) * (1 - seg(T, 14.7, 14.9));
      this.lightPos = [XS[3], 1.05, 0.05];
    },
    overlay(ctx, T, cam) {
      const draw = E.inOutCubic(seg(T, 14.12, 14.38)), a = 1 - seg(T, 14.56, 14.76);   // water first, then the sprout
      if (draw <= 0 || a <= 0) return;
      const lv = this.level(T) + 0.014, rS = innerRadiusAt(lv - 0.014);
      const z = 0.2, half = Math.sqrt(Math.max(0, rS * rS - z * z)) * 0.9, ox = XS[3];
      const pts = [], n = 64;
      for (let i = 0; i <= n * draw; i++) {
        const s = i / n;
        pts.push(proj(cam, ox + lerp(-half, half, s), lv, z + 0.02 * Math.sin(s * Math.PI * 5)));
      }
      if (pts.length < 2) return;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = R.rgba(PAL.ember, 0.18 * a); ctx.lineWidth = 5;
      ctx.beginPath(); R.polyPath(ctx, pts, false); ctx.stroke();
      ctx.strokeStyle = R.rgba(PAL.ivory, 0.8 * a); ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
      const tip = pts[pts.length - 1];
      RB.fx.ember(ctx, tip[0], tip[1], 3.2, { intensity: 0.9 * a * (1 - seg(T, 14.38, 14.5) * 0.5) });
    },
    anchor(cam) { return proj(cam, XS[3] - 0.24, 0.79, 0.1); },          // on the soil, where it settles
    glow: { start: 14.7, ramp: 0.2, flare: 0.22 },                  // settled (exactly 0.5, no flare) by 14.95
  };

  const WORLDS = [W0, W1, W2, W3];

  // ─── Soil fit: the cup's inner radius at height y ──────────────────────────
  let INNER_PTS = null; // [[r, y]] from the rim down (as RB.cup smooths it)
  function innerRadiusAt(y) {
    const P = INNER_PTS;
    if (y >= P[0][1]) return P[0][0];
    for (let i = 1; i < P.length; i++) {
      if (P[i][1] <= y) { const f = (y - P[i][1]) / (P[i - 1][1] - P[i][1] || 1); return lerp(P[i][0], P[i - 1][0], f); }
    }
    return 0;
  }
  /** Weld a polyhedron's duplicated vertices so displacement keeps it smooth. */
  function weldedGeometry(g) {
    g.deleteAttribute('normal'); g.deleteAttribute('uv');
    return RB.ADD.mergeVertices(g);
  }

  // ─── Cup glows: each world leaves an ember at its cup's mouth ───────────────
  /** Contract glow intensity of cup i at T (exactly EMBER_I once settled; a soft flare as the world condenses into it). */
  function glowIntensity(i, T) {
    const g = WORLDS[i].glow;
    return EMBER_I * E.outCubic(seg(T, g.start, g.start + g.ramp)) + 0.35 * bump(T, g.start + 0.03, g.start + 0.03 + g.flare);
  }
  function drawGlows(ctx, T, cam) {
    const wide = RB.shots.row4Wide.pos;
    for (let i = 0; i < 4; i++) {
      const I = glowIntensity(i, T);
      if (I <= 0.001) continue;
      const [sx, sy] = proj(cam, XS[i], MOUTH_Y, 0);
      // Perspective-correct size: exactly 26/6 on the contract shot.
      const dWide = Math.hypot(wide[0] - XS[i], wide[1] - MOUTH_Y, wide[2]);
      const d = Math.hypot(cam.position.x - XS[i], cam.position.y - MOUTH_Y, cam.position.z);
      RB.fx.ember(ctx, sx, sy, EMBER_R * (dWide / d), { intensity: I });
    }
  }

  // ─── Light shaft ────────────────────────────────────────────────────────────
  /**
   * The workshop's shaft of light from the upper left. RB.atmos.shaft blurs a large
   * polygon on every call, so it is drawn once at full strength into a buffer and
   * reused, scaled by alpha (the shaft's gradient is linear in alpha, so this is exact).
   */
  function drawShaft(ctx, alpha) {
    if (alpha <= 0.002) return;
    const b = R.buffer('s4-shaft');
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

  // ─── Lens: rack focus along the row ─────────────────────────────────────────
  /**
   * Composite the rendered 3D layer with a shallow depth of field: the hero cup
   * sharp (or deliberately soft for the focus pull), the rest of the row soft.
   * Falls back to a straight draw when there is no blur (the contract frames).
   */
  function compositeLens(ctx, gl, focus) {
    if (focus.bg < 0.05 && focus.hero < 0.05) { ctx.drawImage(gl, 0, 0, R.W, R.H); return; }
    const W2_ = R.W / 2, H2_ = R.H / 2;
    const grad = (g, k) => {
      const gr = g.createRadialGradient(focus.x * k, focus.y * k, focus.r0 * k, focus.x * k, focus.y * k, focus.r1 * k);
      gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      return gr;
    };
    // Soft copy at half resolution (a blur this size loses nothing there), dimmed a little.
    const soft = (key, px, dim) => {
      const b = R.buffer(key, W2_, H2_);
      b.clear();
      b.ctx.filter = `${R.blur(px / 2)} brightness(${dim.toFixed(3)})`;
      b.ctx.drawImage(gl, 0, 0, W2_, H2_);
      b.ctx.filter = 'none';
      return b;
    };
    // The soft layer, masked outside the focus at half resolution (the mask is smooth, so this is
    // the same as masking after the upscale, at a quarter of the cost) …
    const bg = soft('s4-lens-soft', focus.bg, focus.dim);
    bg.ctx.globalCompositeOperation = 'destination-out';
    bg.ctx.fillStyle = grad(bg.ctx, 0.5); bg.ctx.fillRect(0, 0, W2_, H2_);
    bg.ctx.globalCompositeOperation = 'source-over';
    // … the sharp (or focus-pulled) layer masked inside it, and their premultiplied sum: a clean crossfade.
    const fg = R.buffer('s4-lens-fg');
    fg.clear();
    fg.ctx.drawImage(focus.hero > 0.05 ? soft('s4-lens-hero', focus.hero, 1).canvas : gl, 0, 0, R.W, R.H);
    fg.ctx.globalCompositeOperation = 'destination-in';
    fg.ctx.fillStyle = grad(fg.ctx, 1); fg.ctx.fillRect(0, 0, R.W, R.H);
    fg.ctx.globalCompositeOperation = 'lighter';
    fg.ctx.drawImage(bg.canvas, 0, 0, R.W, R.H);
    fg.ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(fg.canvas, 0, 0, R.W, R.H);
  }

  // ─── Labels ─────────────────────────────────────────────────────────────────
  /**
   * Where each title sits relative to its world: laid out once, on the settled shot of its
   * cup, just above the cup's silhouette and inside the safe area.
   */
  function layoutLabels() {
    const cam = RB.camera(30);
    const m = document.createElement('canvas').getContext('2d');
    m.font = R.font(LABEL_SIZE, 'mono', 500); m.letterSpacing = LABEL_TRACK;
    LABELS.forEach((L, i) => {
      L.w = m.measureText(L.text).width;
      // the leader's end sits at the title's right edge, so the whole title stays in the safe area
      // while the leader end stays inside [xMin, SAFE.x1]
      L.xMin = SAFE.x0 + L.w + LABEL_GAP - 10;
      RB.setCam(cam, camShot(L.keyT));
      const a = WORLDS[i].anchor(cam, L.keyT);
      const rimTop = proj(cam, XS[i], CUP_H, -RB.CUP.rimRadius)[1];
      const x = clamp(a[0] - 150, L.xMin, SAFE.x1), y = clamp(Math.min(a[1] - 104, rimTop - 44), SAFE.y0, SAFE.y1);
      L.dx = x - a[0]; L.dy = y - a[1];  // the title's offset from its anchor, as framed on the settled shot
    });
  }
  /**
   * A world's title: the kit annotation (enlarged), pinned to its world by a leader of
   * constant length, so it arrives with its cup, reads still while the camera breathes
   * on it, and leaves with it. Clamped to the safe area.
   */
  function worldLabel(ctx, T, i, anchor) {
    const L = LABELS[i];
    const out = 1 - E.inOutSine(seg(T, L.tOut, L.tOut + 0.22));   // a quick, even fade: gone before the camera is at speed
    if (T < L.tIn || out <= 0) return;
    const sc = R.scale;
    // (x, y): the leader's end, at the title's right edge. The title is set left-aligned so it
    // types on left to right in place; right-aligned typing would slide the word as it grows.
    const x = clamp(anchor[0] + L.dx, L.xMin, SAFE.x1), y = clamp(anchor[1] + L.dy, SAFE.y0, SAFE.y1);
    // The leader, drawn exactly as RB.type.annotation draws it (1.5 px, ivory 0.55, ember dot).
    const pl = E.outExpo(seg(T, L.tIn, L.tIn + 0.45));
    ctx.save();
    ctx.globalAlpha = out;
    ctx.strokeStyle = R.rgba(PAL.ivory, 0.55); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(anchor[0], anchor[1]); ctx.lineTo(lerp(anchor[0], x, pl), lerp(anchor[1], y, pl)); ctx.stroke();
    R.fillCircle(ctx, anchor[0], anchor[1], 4.5 * pl, PAL.ember);
    ctx.restore();
    // The title itself goes through a small buffer, so it can take this fade (the kit's own
    // fade-out is set in stone and too slow here). The buffer is placed on whole backing pixels
    // and the text keeps its sub-pixel offset inside it: identical to drawing it directly.
    const BW = 640, BH = 64, bx = BW - 20, by = BH / 2;
    const X = x * sc, Y = y * sc, ix = Math.floor(X), iy = Math.floor(Y);
    const b = R.buffer('s4-title', BW, BH);
    b.clear();
    b.ctx.translate(bx + (X - ix) / sc, by + (Y - iy) / sc);
    RB.type.annotation(b.ctx, T, { text: L.text, x: -L.w - LABEL_GAP, y: 0, tIn: L.tIn, align: 'left', size: LABEL_SIZE });
    ctx.save();
    ctx.globalAlpha = out;
    ctx.drawImage(b.canvas, ix / sc - bx, iy / sc - by, BW, BH);
    ctx.restore();
  }

  // ─── Scene ──────────────────────────────────────────────────────────────────
  R.scene({
    id: 'worlds', index: 4, label: 'Four kinds of work', start: 10, end: 15,
    init() {
      const curve = new THREE.CatmullRomCurve3(CUP_INNER.map(([x, y]) => new THREE.Vector3(x, y, 0)), false, 'centripetal');
      INNER_PTS = curve.getSpacedPoints(240).map((v) => [Math.max(0, v.x), v.y]);
      S = RB.stage();
      S.innerBase = new THREE.Color('#8a4f2d'); // RB.mat.copperInner
      S.innerDark = new THREE.Color('#553624');
      S.cups = XS.map((x) => {
        const c = RB.cup();
        c.group.position.set(x, 0, 0);
        S.scene.add(c.group);
        const sh = RB.contactShadow(0.78, 0.5);
        sh.position.x = x;
        S.scene.add(sh);
        c.shadow = sh;
        return c;
      });
      WORLDS.forEach((w) => w.build(S));
      // One warm point light, handed from world to world (their windows never overlap).
      S.light = new THREE.PointLight('#ffb48e', 0, 1.6, 2);
      S.scene.add(S.light);
      RB.gl.renderer().compile(S.scene, S.camera); // no first-use shader stalls mid-scene
      W2.layout();
      layoutLabels();
    },

    draw(ctx, t, env) {
      const T = env.T;
      const shot = camShot(T), close = closeness(shot);
      RB.setCam(S.camera, shot);
      const cam = S.camera;

      // Backdrop: the warm pool drifts a little against the camera's travel (parallax).
      RB.atmos.backdrop(ctx, { gx: 1060 - shot.look[0] * 34 * close, gy: 520 + 40 * close });
      drawShaft(ctx, 0.075 * close);

      // Pose the row and every world from T.
      for (const c of S.cups) {
        c.group.rotation.set(0, 0, 0);
        // Look into a darker, golden bowl (a plain darkening turns the copper red): the world inside is
        // the light. Exact kit values on the wide contract shots.
        c.inner.material.color.copy(S.innerBase).lerp(S.innerDark, close);
        c.inner.material.roughness = lerp(0.42, 0.4, close);
        c.inner.material.envMapIntensity = lerp(1, 0.42, close);
        c.shadow.material.opacity = 0.42 * close; c.shadow.visible = close > 0.001;
      }
      WORLDS.forEach((w) => w.pose(T));
      const lit = WORLDS.reduce((a, w) => (w.lightI > a.lightI ? w : a), { lightI: 0 });
      const lp = lit.lightPos || [0, 1, 0];
      S.light.intensity = lit.lightI;
      S.light.position.set(lp[0], lp[1], lp[2]);

      // 3D, once, through the lens.
      const gl = RB.gl.render3D(S.scene, cam, { exposure: 1 });
      const f = focusPoint(T, shot), lens = lensAmount(T, close);
      const ppu = pxPerUnit(cam, f[0], f[1], f[2]), fc = proj(cam, f[0], f[1], f[2]);
      compositeLens(ctx, gl, { x: fc[0], y: fc[1], r0: ppu * 0.95, r1: ppu * 1.8, bg: 4.2 * lens, dim: 1 - 0.3 * lens, hero: W2.heroBlur(T) });

      // 2D line work, lights, titles.
      RB.atmos.dust(ctx, T, { count: 70, alpha: 0.4 * close, rect: [0, 0, R.W, 900] });
      WORLDS.forEach((w) => w.overlay(ctx, T, cam));
      drawGlows(ctx, T, cam);
      WORLDS.forEach((w, i) => worldLabel(ctx, T, i, w.anchor(cam, T)));
    },

    rail: (t, env) => ({ alpha: 1, active: 2, progress: (env.T - 7.5) / 10 }),
  });
})();
