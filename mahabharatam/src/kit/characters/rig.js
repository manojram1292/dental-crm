/*
 * KIT.characters · the CHARACTER BIBLE in code (see CHARACTERS.md).
 *
 * Every character is one module in this folder with ONE entry point:
 *
 *   KIT.characters.<id>.draw(ctx, opts)
 *     opts = {
 *       x, y          where the feet (or the seat) touch the ground, in screen px
 *       scale         1 ≈ the character's full standing height in its bible (Sauti ≈ 1040 px)
 *       facing        'left' (every puppet's native profile) | 'right'; frontal figures: 'front' | 'back'
 *       index         which one of a group (generic sages: picks that sage's fixed variation)
 *       pose          'stand' | 'walk' | 'sit' | 'speak' | 'bless' | … or
 *                     { name, k (0..1 through a move), phase (walk, rad), stride (0..1), base ('stand'|'sit') }
 *       light         { dir, intensity, front }
 *                       dir       angle TOWARD the light in screen space (0 = right, π = left, −π/2 = above)
 *                       intensity 0..1.3 (the fire's flicker goes here)
 *                       front     0..1 how much the light falls on the side we see (lit face vs. pure silhouette)
 *                       fill      0..1 a soft frontal fill added to front (bright grounds: 0.3–0.5), so faces read
 *       expression    { look (head pitch, rad), speak (0..1 jaw / beard), mood ('calm' | 'wrath' | 'sorrow' | 'serene') }
 *       t             seconds (breath, cloth, flames: never the design)
 *       key           optional buffer key when the same character is drawn twice in one frame
 *     }
 *   KIT.characters.<id>.shape(g, color, opts)   the bare silhouette in one colour (visions, ghosts, masks)
 *   KIT.characters.<id>.bible                   palette, proportions, props, lighting rule, poses, voice
 *
 * The DESIGN (palette, proportions, props, the signature lighting rule) lives
 * inside each module and is not an option. Opts only say where the character
 * is, what it is doing and where the light comes from, so every episode draws
 * the same people the same way. All functions are pure in their arguments.
 *
 * This file: shared rig helpers (limbs, IK, ribbons, hands), the profile
 * skeleton with the common pose library, and render(), which applies a
 * character's signature lighting rule.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, PAL, noise, E } = R;
  const CH = (KIT.characters = KIT.characters || {});

  // ─── Shape helpers (local units; y up is negative) ──────────────────────────
  /** Next sub-shape: fill what is built so far and start a new path (avoids nonzero-winding holes). */
  const cut = (g) => { g.fill(); g.beginPath(); };
  /** Filled tapered limb through points pts with widths ws (round joints). Fills as it goes. */
  function limb(g, pts, ws) {
    const n = pts.length, L = [], Rr = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const w = ws[i] / 2;
      L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
      Rr.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
    }
    cut(g);
    g.moveTo(L[0][0], L[0][1]);
    for (let i = 1; i < n; i++) g.lineTo(L[i][0], L[i][1]);
    for (let i = n - 1; i >= 0; i--) g.lineTo(Rr[i][0], Rr[i][1]);
    g.closePath();
    cut(g);
    for (let i = 0; i < n; i++) { g.moveTo(pts[i][0] + ws[i] / 2, pts[i][1]); g.arc(pts[i][0], pts[i][1], ws[i] / 2, 0, TAU); cut(g); }
  }
  /** Ribbon outline only (no joint discs): a smooth tapered band. */
  function limbOutline(g, pts, ws) {
    const n = pts.length, L = [], Rr = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const w = ws[i] / 2;
      L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
      Rr.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
    }
    g.moveTo(L[0][0], L[0][1]);
    for (let i = 1; i < n; i++) g.lineTo(L[i][0], L[i][1]);
    for (let i = n - 1; i >= 0; i--) g.lineTo(Rr[i][0], Rr[i][1]);
    g.closePath();
  }
  /** Two-bone IK: shoulder s, target t, bone lengths a, b; bend sign ±1. Returns elbow. */
  function ik(s, t, a, b, bend) {
    const dx = t[0] - s[0], dy = t[1] - s[1];
    const d = clamp(Math.hypot(dx, dy), Math.abs(a - b) + 1e-3, a + b - 1e-3);
    const ang = Math.atan2(dy, dx);
    const c = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
    const e = ang + bend * c;
    return [s[0] + Math.cos(e) * a, s[1] + Math.sin(e) * a];
  }
  /** Points along a ribbon from p0 heading `dir` (rad), waving in the wind. */
  function ribbon(p0, dir, len, T, amp, seed, n = 14, droop = 40) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const s = i / n;
      const wv = Math.sin(s * 4.2 - T * 5.2 + seed) * amp * s + noise.n2(s * 2 + seed, T * 1.4) * amp * 0.6 * s;
      const a = dir + wv * 0.012;
      pts.push([p0[0] + Math.cos(dir) * len * s - Math.sin(a) * wv, p0[1] + Math.sin(dir) * len * s + Math.cos(a) * wv * 0.6 + s * s * droop]);
    }
    return pts;
  }
  /** Point along segment a→b at u. */
  const along = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];

  /**
   * A hand at `p`, pointing along angle `a` (rad, local), size `sz` (≈ palm length).
   * kind: 'fist' (holding a shaft), 'open' (flat palm, fingers together, mural style),
   *       'abhaya' (palm raised, fingers up), 'point', 'cup' (holding a pot from below).
   */
  function hand(g, p, a, sz, kind = 'fist') {
    g.save();
    g.translate(p[0], p[1]);
    g.rotate(a);
    if (kind === 'fist') {
      g.moveTo(sz * 0.62, 0); g.ellipse(0, 0, sz * 0.62, sz * 0.5, 0, 0, TAU); cut(g);
    } else if (kind === 'open' || kind === 'abhaya' || kind === 'point') {
      // palm + fingers together (a long leaf), thumb lifted
      const L = kind === 'point' ? 1.55 : 1.25;
      g.moveTo(-sz * 0.2, -sz * 0.32);
      g.quadraticCurveTo(sz * 0.55, -sz * 0.42, sz * L, -sz * 0.12);
      g.quadraticCurveTo(sz * (L + 0.08), 0, sz * L, sz * 0.1);
      g.quadraticCurveTo(sz * 0.55, sz * 0.36, -sz * 0.2, sz * 0.3);
      g.closePath(); cut(g);
      g.moveTo(sz * 0.1, -sz * 0.25);
      g.quadraticCurveTo(sz * 0.45, -sz * 0.75, sz * 0.62, -sz * 0.62);
      g.quadraticCurveTo(sz * 0.42, -sz * 0.38, sz * 0.35, -sz * 0.2);
      g.closePath(); cut(g);
    } else if (kind === 'cup') {
      g.moveTo(sz * 0.6, 0); g.ellipse(0, 0, sz * 0.6, sz * 0.42, 0, 0, TAU); cut(g);
    }
    g.restore();
  }

  // ─── Pose ───────────────────────────────────────────────────────────────────
  /** Normalise a pose (string or object) → { name, k, phase, stride, base }. */
  function pose(p) {
    const o = typeof p === 'string' ? { name: p } : { ...(p || {}) };
    o.name = o.name || 'stand';
    o.k = clamp(o.k ?? 1);
    o.phase = o.phase || 0;
    if (o.stride == null) o.stride = o.name === 'walk' ? 1 : 0;
    if (!o.base) o.base = o.name === 'sit' ? 'sit' : o.name === 'throne' ? 'throne' : 'stand';
    return o;
  }

  /**
   * Profile skeleton (faces LEFT: forward = −x; feet on y = 0). D = proportions:
   *   { hip, thigh, shin, foot, shoulder (y), upper, fore, sitHip (hip height when seated) }
   * Returns { legs[2]: {hip, knee, ankle, toe, heel, th}, bob, lean, drop (upper body drop when seated),
   *           sitting, st, ph }. Hands are left to each character (they hold different things).
   */
  function profileRig(po, D) {
    const sitting = po.base === 'sit';
    const ph = po.phase, st = sitting ? 0 : po.stride;
    const hip = [0, -D.hip];
    let legs, bob = 0, drop = 0;
    if (po.base === 'throne') {
      // seated on a raised seat (simhasana): near leg down, far leg folded up on the seat
      drop = D.hip - D.throneHip;
      const h = [0, -D.throneHip];
      const nk = [-D.thigh * 0.96, -D.throneHip + 14], na = [nk[0] + 18, -26];
      const fk = [-D.thigh * 0.72, -D.throneHip - 56], fa = [-40, -D.throneHip + 4];
      legs = [
        { hip: h, knee: nk, ankle: na, toe: [na[0] - D.foot, -6], heel: [na[0] + 16, 0], th: 1.5 },
        { hip: h, knee: fk, ankle: fa, toe: [fa[0] + D.foot * 0.7, fa[1] + 10], heel: [fa[0] - 10, fa[1] + 20], th: 1.5 },
      ];
      return { legs, bob: 0, drop, sitting: true, throne: true, st: 0, ph, lean: 0 };
    }
    if (!sitting) {
      legs = [0, Math.PI].map((off) => {
        const p = ph + off;
        const th = st * 0.36 * Math.sin(p);
        const flex = st * (0.12 + 0.55 * clamp(Math.sin(p + 1.25)));
        const knee = [hip[0] - Math.sin(th) * D.thigh, hip[1] + Math.cos(th) * D.thigh];
        const sa = th - flex;
        const ankle = [knee[0] - Math.sin(sa) * D.shin, knee[1] + Math.cos(sa) * D.shin];
        const fa = clamp(-sa * 0.6 + st * 0.25 * clamp(Math.sin(p + 2.4)), -0.5, 0.6);
        const toe = [ankle[0] - Math.cos(fa) * D.foot, ankle[1] + 10 + Math.sin(fa) * D.foot];
        const heel = [ankle[0] + 16, ankle[1] + 12];
        return { hip, knee, ankle, toe, heel, th };
      });
      const low = Math.max(...legs.map((l) => Math.max(l.toe[1], l.heel[1], l.ankle[1] + 22)));
      bob = -low;
    } else {
      // cross-legged (sukhasana) seen from the side: knees forward and low, feet tucked
      drop = D.hip - D.sitHip;
      const h = [0, -D.sitHip];
      legs = [[-0.92, -0.18, 0.0], [-0.8, -0.3, 1.0]].map(([kx, ky, far]) => {
        const knee = [h[0] + kx * D.thigh, ky * D.thigh * 0.5 - 30];
        const ankle = [h[0] - D.thigh * (0.18 + far * 0.12), -34 - far * 6];
        const toe = [ankle[0] + D.foot * 0.75, ankle[1] + 6];
        const heel = [ankle[0] - 12, ankle[1] + 18];
        return { hip: h, knee, ankle, toe, heel, th: 1.2 };
      });
    }
    return { legs, bob, drop, sitting, st, ph, lean: st * 0.05 };
  }

  // ─── Lighting ───────────────────────────────────────────────────────────────
  /** Common light setups (the model sheet's three lights are LIGHTS.key/back/low). */
  CH.LIGHTS = {
    key: { dir: Math.PI + 0.32, intensity: 1, front: 0.15 },     // the fire to the left, a little above
    back: { dir: -0.25, intensity: 0.8, front: 0 },              // from behind-right, pure silhouette
    low: { dir: Math.PI / 2 + 0.35, intensity: 0.55, front: 0.6 }, // a low, dim fire in front, below
  };
  function lightOf(o) {
    const L = o.light || CH.LIGHTS.key;
    // fill (0..1): a soft frontal fill on top of `front`, so a figure against a bright ground never goes to a pure black
    // cut-out (episode 31 on; the remaining weakness of eps 21–30). Bright locations pass light.fill ≈ 0.3–0.5.
    // From episode 41 (the back-light rule): wrap (0..1) puts the rim on BOTH sides (a fire or a sun behind the figure),
    // tint [colour, amount] colours the rim with the light's own colour, bounce [colour, amount] colours the fill with
    // the ground's bounce light, minLum (0..1) is a floor for the fill's luminance: no black cut-outs in front of fire.
    return { dir: L.dir ?? Math.PI, intensity: clamp(L.intensity ?? 1, 0, 1.5), front: clamp(L.front ?? 0, 0, 1), fill: clamp(L.fill ?? 0, 0, 1),
      wrap: clamp(L.wrap ?? 0, 0, 1), tint: L.tint || null, bounce: L.bounce || null, minLum: clamp(L.minLum ?? 0, 0, 1) };
  }
  /** Rim width in screen px for a figure drawn at `scale` (bigger figures, wider rims; brighter light, wider rim). */
  const rimWidth = (scale, k, rule) => (rule.rimW || 1) * 7.0 * Math.pow(Math.max(0.05, scale), 0.36) * (0.72 + 0.28 * clamp(k));

  const q32 = (v) => Math.ceil(v / 32) * 32;

  /**
   * Resolve opts into the parameters every module function receives:
   *   P = { x, y, s, flip, po (pose), ex (expression), T, L (light), k (light intensity 0..1) }
   */
  function resolve(o, def) {
    const L = lightOf(o);
    return {
      x: o.x ?? 540, y: o.y ?? 1600, s: o.scale ?? 1, flip: o.facing === 'right', facing: o.facing || 'left', back: o.facing === 'back',
      index: o.index ?? 0,
      po: pose(o.pose ?? (def && def.defaultPose)), ex: { look: 0, speak: 0, mood: 'calm', ...(o.expression || {}) },
      T: o.t || 0, L, k: clamp(L.intensity),
    };
  }

  /**
   * Draw a character with its signature lighting rule.
   *   def = { id, rule, rig(P), bounds(P) → [x0, y0, x1, y1] local, shape(g, color, P, rig),
   *           ornaments?(g, P, rig, alpha, color), before?(ctx, P, rig, k) (auras), after?(ctx, P, rig, k) }
   *   rule = { fill, lit (front-lit fill), rim: [dim, bright], inner, innerA, glow, ornament: [dim, bright],
   *            ornamentA: [a0, a1], rimW, alpha (translucent), mode (composite), fade (0..1 of the
   *            height faded at the feet), halo (rim on both sides) }
   */
  function render(ctx, def, opts) {
    const P = resolve(opts, def);
    const rig = def.rig(P);
    const rule = def.rule, L = P.L, k = P.k;
    const sx = P.flip ? -P.s : P.s;
    const toScreen = (lx, ly) => [P.x + lx * sx, P.y + ly * P.s];
    // screen box from local bounds
    const [bx0, by0, bx1, by1] = def.bounds(P, rig);
    const a = toScreen(bx0, by0), b = toScreen(bx1, by1);
    const pad = 24 + 30 * P.s;
    let x0 = Math.min(a[0], b[0]) - pad, y0 = Math.min(a[1], b[1]) - pad;
    const bw = q32(Math.abs(b[0] - a[0]) + pad * 2), bh = q32(Math.abs(b[1] - a[1]) + pad * 2);
    x0 = Math.floor(x0); y0 = Math.floor(y0);
    const tf = ctx.getTransform(), cw = ctx.canvas.width, chh = ctx.canvas.height;
    const sxa = tf.a * x0 + tf.c * y0 + tf.e, sya = tf.b * x0 + tf.d * y0 + tf.f;
    const sxb = tf.a * (x0 + bw) + tf.c * (y0 + bh) + tf.e, syb = tf.b * (x0 + bw) + tf.d * (y0 + bh) + tf.f;
    if (Math.min(sxa, sxb) > cw || Math.min(sya, syb) > chh || Math.max(sxa, sxb) < 0 || Math.max(sya, syb) < 0) return P; // off canvas

    if (def.before) def.before(ctx, P, rig, k);

    const place = (g) => { g.translate(P.x, P.y); g.scale(sx, P.s); };
    const drawShape = (g, color) => { g.save(); place(g); def.shape(g, color, P, rig); g.restore(); };

    const w = rimWidth(P.s, k, rule);
    const dx = -Math.cos(L.dir) * w, dy = -Math.sin(L.dir) * w;
    let fill = R.mix(rule.fill, rule.lit || rule.fill, clamp(L.front * k * (rule.litGain ?? 1) + L.fill * 0.6));
    let rim = R.mix(rule.rim[0], rule.rim[1], clamp(k));
    if (L.tint) rim = KIT.hex(rim, L.tint[0], L.tint[1] ?? 0.5);
    if (L.bounce) fill = KIT.hex(fill, L.bounce[0], L.bounce[1] ?? 0.25);
    if (L.minLum > 0) { for (let q = 0; q < 6 && lum(fill) < L.minLum; q++) fill = KIT.hex(fill, q < 3 ? (rule.lit || rule.fill) : '#f4e4c4', 0.35); }
    const key = `ch-${def.id}${opts.key ? '-' + opts.key : ''}`;
    const probeBg = R.probe && R.probe.figures ? probeBox(ctx, x0, y0, bw, bh) : null;
    const buf = R.buffer(key, bw, bh);
    buf.clear();
    const g = buf.ctx;
    g.translate(-x0, -y0);
    drawShape(g, rim);
    g.globalCompositeOperation = 'source-atop';
    if (rule.inner) {
      const ia = Array.isArray(rule.innerA) ? lerp(rule.innerA[0], rule.innerA[1], L.front) : rule.innerA * (1 - 0.6 * L.front);
      g.globalAlpha = clamp(ia * (0.75 + 0.25 * k));
      g.save(); g.translate(dx * 0.4, dy * 0.4); drawShape(g, rule.inner); g.restore();
      g.globalAlpha = 1;
    }
    const halo = rule.halo || (L.wrap > 0 ? 0.35 + 0.65 * L.wrap : 0);
    if (halo) {
      // luminous beings: a rim all round (the fill is the shape eroded from both sides),
      // brightest toward the light
      const fb = R.buffer(key + '-fill', bw, bh);
      fb.clear();
      fb.ctx.translate(-x0, -y0);
      fb.ctx.save(); fb.ctx.translate(dx, dy); drawShape(fb.ctx, fill); fb.ctx.restore();
      fb.ctx.globalCompositeOperation = 'destination-in';
      if (rule.halo) { fb.ctx.save(); fb.ctx.translate(-dx * halo, -dy * halo); drawShape(fb.ctx, '#000'); fb.ctx.restore(); }
      else {
        // light.wrap (episode 41 on): the mask is the WHOLE figure as one opaque shape (a figure built from many sub-fills would
        // otherwise be cut down to their intersection), so the fill keeps its body and only a thin far-side rim is uncovered
        const mb = R.buffer(key + '-mask', bw, bh); mb.clear(); mb.ctx.translate(-x0, -y0); drawShape(mb.ctx, '#000'); R.resetCtx(mb.ctx);
        fb.ctx.drawImage(mb.canvas, x0 - dx * halo, y0 - dy * halo, bw, bh);
      }
      g.drawImage(fb.canvas, x0, y0, bw, bh);
    } else {
      g.save(); g.translate(dx, dy); drawShape(g, fill); g.restore();
    }
    g.globalCompositeOperation = 'source-over';
    // ornaments are painted into the same buffer so translucency and fades apply to them too
    if (def.ornaments) {
      const oc = R.mix(rule.ornament[0], rule.ornament[1], clamp(k));
      const oa = lerp(rule.ornamentA[0], rule.ornamentA[1], clamp(k));
      g.save(); place(g); def.ornaments(g, P, rig, oa, oc); g.restore();
    }
    if (rule.fade) {
      // dissolve toward the feet (luminous beings do not quite touch the ground)
      g.globalCompositeOperation = 'destination-in';
      const top = toScreen(0, bounds0(def, P, rig))[1], foot = P.y;
      const fg = g.createLinearGradient(0, foot, 0, lerp(foot, top, rule.fade));
      fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(0,0,0,1)');
      g.fillStyle = fg; g.fillRect(x0, y0, bw, bh);
      g.globalCompositeOperation = 'source-over';
    }
    const glow = (rule.glow || 0) * (0.55 + 0.45 * k);
    if (glow > 0) {
      const gw = Math.max(1, Math.round(bw / 8)), gh = Math.max(1, Math.round(bh / 8));
      const sb = R.buffer(key + '-glow', gw, gh);
      sb.clear();
      sb.ctx.filter = R.blur(2.2);
      sb.ctx.drawImage(buf.canvas, 0, 0, gw, gh);
      sb.ctx.filter = 'none';
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = clamp(glow * (rule.alpha ?? 1));
      ctx.drawImage(sb.canvas, x0, y0, bw, bh);
      ctx.restore();
    }
    ctx.save();
    if (rule.mode) ctx.globalCompositeOperation = rule.mode;
    ctx.globalAlpha = clamp((rule.alpha ?? 1) * (opts.alpha ?? 1));
    ctx.drawImage(buf.canvas, x0, y0, bw, bh);
    ctx.restore();
    if (def.after) def.after(ctx, P, rig, k);
    if (def.face && R.faces) { const f = def.face(P, rig), q = toScreen(f[0], f[1]); R.faces.push({ id: def.id, x: (tf.a * q[0] + tf.c * q[1] + tf.e) / R.scale, y: (tf.b * q[0] + tf.d * q[1] + tf.f) / R.scale, r: f[2] * P.s * Math.hypot(tf.a, tf.b) / R.scale }); }
    if (probeBg) probeFigure(def.id, opts.key, buf, probeBg, Math.abs(syb - sya) / chh);
    return P;
  }
  // ── the gate's figure probe (tools/gate.mjs --frames, ep ≥ 41): mean colour of the figure and of the ground in its box ──
  const lum = (hex) => { const [r, g, b] = KIT.rgb(hex); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
  function probeBox(ctx, x0, y0, bw, bh) {
    try {
      const tf = ctx.getTransform(), c = ctx.canvas;
      const xs = [x0, x0 + bw].map((x) => tf.a * x + tf.e), ys = [y0, y0 + bh].map((y) => tf.d * y + tf.f);
      const ax = Math.max(0, Math.floor(Math.min(...xs))), ay = Math.max(0, Math.floor(Math.min(...ys)));
      const w = Math.min(c.width, Math.ceil(Math.max(...xs))) - ax, h = Math.min(c.height, Math.ceil(Math.max(...ys))) - ay;
      if (w < 4 || h < 4) return null;
      const d = ctx.getImageData(ax, ay, w, h).data; let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < d.length; i += 16) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
      return { bg: [r / n, g / n, b / n], frac: (w * h) / (c.width * c.height) };
    } catch { return null; }
  }
  function probeFigure(id, key, buf, pb, hFrac) {
    const c = buf.canvas, d = buf.ctx.getImageData(0, 0, c.width, c.height).data; let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 16) { const a = d[i + 3] / 255; if (a > 0.5) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; } }
    if (n > 8) R.probe.figures.push({ id, key: key || '', fig: [r / n, g / n, b / n], bg: pb.bg, h: +hFrac.toFixed(3) });
  }
  const bounds0 = (def, P, rig) => def.bounds(P, rig)[1];

  /** The bare silhouette in one colour (no light): for visions, ghosts, masks. */
  function shapeOnly(def, g, color, opts) {
    const P = resolve(opts, def);
    const rig = def.rig(P);
    g.save();
    g.translate(P.x, P.y); g.scale(P.flip ? -P.s : P.s, P.s);
    def.shape(g, color, P, rig);
    g.restore();
  }

  /** Register a character module: wires draw/shape and keeps the bible next to the code. */
  function define(def) {
    const mod = {
      id: def.id,
      bible: def.bible,
      poses: def.bible.poses.map((p) => p.name),
      draw: (ctx, opts = {}) => render(ctx, def, opts),
      shape: (g, color, opts = {}) => shapeOnly(def, g, color, opts),
      _def: def,
    };
    CH[def.id] = mod;
    return mod;
  }

  // ─── Shared costume pieces for profile figures ──────────────────────────────
  /**
   * A torso in profile (faces −x), from the waist (y = waistY) to the neck (neckY).
   * o = { front, back (x at the chest), waistF, waistB, neckF, neckB, chestY, pec (front bulge), lat (back bulge) }
   */
  function torso(g, o) {
    const wy = o.waistY, ny = o.neckY, cy = o.chestY ?? lerp(wy, ny, 0.62);
    g.moveTo(o.waistF, wy);
    g.bezierCurveTo(o.waistF - 6, lerp(wy, cy, 0.5), o.front - (o.pec || 0), cy + 30, o.front, cy);
    g.bezierCurveTo(o.front + 4, cy - 50, o.neckF - 26, ny + 22, o.neckF, ny);
    g.lineTo(o.neckB, ny - 2);
    g.bezierCurveTo(o.neckB + 22, ny + 26, o.back + (o.lat || 0), cy - 40, o.back, cy);
    g.bezierCurveTo(o.back - 2, lerp(cy, wy, 0.5), o.waistB + 4, wy - 30, o.waistB, wy);
    g.closePath(); cut(g);
  }

  /**
   * Dhoti / lower cloth over the legs in profile. Works for stand/walk (a flared
   * knee-length or ankle-length wrap) and sit (a mound over the folded legs).
   * o = { waistY, waistF, waistB, len: 'knee'|'ankle'|'short', flare, pleats (bool), T, wind }
   */
  function lowerCloth(g, r, o) {
    const [a, b] = r.legs;
    if (r.sitting) {
      const h = a.hip, kn = a.knee[0] < b.knee[0] ? a.knee : b.knee;
      g.moveTo(o.waistF, -r.legs[0].hip[1] * 0 + h[1] - 40);
      g.bezierCurveTo(o.waistF - 30, h[1] + 10, kn[0] + 40, kn[1] - 70, kn[0] - 26, kn[1] - 10);
      g.bezierCurveTo(kn[0] - 44, kn[1] + 20, kn[0] - 10, -2, kn[0] + 30, 0);
      g.lineTo(o.waistB + 70, 0);
      g.bezierCurveTo(o.waistB + 110, -10, o.waistB + 70, h[1] + 30, o.waistB, h[1] - 40);
      g.closePath(); cut(g);
      return;
    }
    const front = a.knee[0] < b.knee[0] ? a : b, back = front === a ? b : a;
    const wy = o.waistY;
    if (o.len === 'ankle') {
      const hemY = Math.max(a.ankle[1], b.ankle[1]) - 30;
      const fx = Math.min(front.ankle[0], back.ankle[0]), bx = Math.max(front.ankle[0], back.ankle[0]);
      g.moveTo(o.waistF, wy);
      g.bezierCurveTo(o.waistF - 30, wy + 140, front.knee[0] - 50, front.knee[1] - 40, fx - 40 * (o.flare || 1), hemY);
      g.quadraticCurveTo(lerp(fx, bx, 0.5), hemY + 18, bx + 44 * (o.flare || 1), hemY - 4);
      g.bezierCurveTo(back.knee[0] + 60, back.knee[1] - 40, o.waistB + 40, wy + 140, o.waistB, wy);
      g.closePath(); cut(g);
    } else {
      const deep = o.len === 'short' ? -60 : 34;
      const hemY = Math.max(a.knee[1], b.knee[1]) + deep;
      g.moveTo(o.waistF, wy);
      g.bezierCurveTo(o.waistF - 18, wy + 75, front.knee[0] - 40, front.knee[1] - 120, front.knee[0] - 34 * (o.flare || 1), hemY - 6);
      g.quadraticCurveTo(lerp(front.knee[0], back.knee[0], 0.5), hemY + 14, back.knee[0] + 40 * (o.flare || 1), hemY - 4);
      g.bezierCurveTo(back.knee[0] + 52, back.knee[1] - 120, o.waistB + 26, wy + 70, o.waistB, wy);
      g.closePath(); cut(g);
    }
    if (o.pleats) {
      const sway = Math.sin((o.T || 0) * 3.1) * 6 * (o.wind ?? 0.5) + r.st * 10;
      const len = o.len === 'ankle' ? 330 : 230;
      g.moveTo(o.waistF - 4, wy + 10);
      g.quadraticCurveTo(o.waistF - 30 - sway, wy + 120, o.waistF - 24 - sway, wy + len);
      g.lineTo(o.waistF + 10 - sway * 0.5, wy + len - 15);
      g.quadraticCurveTo(o.waistF + 6, wy + 110, o.waistF + 24, wy + 5);
      g.closePath(); cut(g);
    }
  }

  /** Legs (thigh-shin-foot) for every pose; widths [hip, knee, ankle]. */
  function legs(g, r, ws = [74, 46, 24], only) {
    r.legs.forEach((l, i) => {
      if (only != null && only !== i) return;
      limb(g, [l.hip, l.knee, l.ankle], ws);
      g.moveTo(l.heel[0], l.heel[1]);
      g.quadraticCurveTo(l.ankle[0] + 10, l.ankle[1] - 6, l.ankle[0] - 16, l.ankle[1] + 2);
      g.lineTo(l.toe[0], l.toe[1] - 8);
      g.quadraticCurveTo(l.toe[0] - 8, l.toe[1], l.toe[0], l.toe[1] + 2);
      g.lineTo(l.heel[0], l.heel[1] + 2);
      g.closePath(); cut(g);
    });
  }

  /** Beads along a quadratic curve (mala). */
  function beads(g, p0, p1, p2, n, r) {
    for (let i = 0; i <= n; i++) {
      const u = i / n, v = 1 - u;
      const x = v * v * p0[0] + 2 * v * u * p1[0] + u * u * p2[0], y = v * v * p0[1] + 2 * v * u * p1[1] + u * u * p2[1];
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }
  }

  Object.assign(CH, {
    cut, limb, limbOutline, ik, ribbon, along, hand, pose, profileRig, torso, lowerCloth, legs, beads,
    render, define, resolve, rimWidth, lightOf,
    /** Every character module registers here, in bible order. */
    ROSTER: CH.ROSTER || [],
  });
  // Back-compat helpers used by older kit code
  KIT.limb = limb; KIT.limbOutline = limbOutline; KIT.ik = ik;
  void E;
})();
