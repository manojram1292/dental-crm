/*
 * Episode 4 · shared pieces for its scenes (not a scene itself).
 *
 * LOCATION: Vyasa's hermitage in the Himalayan foothills, MORNING. A new environment
 * with its own light (the series' fire-lit night is the Naimisha frame; here the key is
 * a low morning sun from the left, cool blue shadows, mist in the valleys). Characters
 * keep their signature light; only its direction and strength come from the sun.
 *
 *   EP4.hermitage(ctx, T, o)     the whole backdrop: sky, sun, snow peaks, misty ridges,
 *                                deodars, the meadow, the thatched hut, the stream.
 *                                o = { cam: { zoom, dx, dy }, hut (true), sunUp (0..1, default 1),
 *                                      fg (true: the near grasses) }
 *   EP4.SUN                      the sun's screen position (at cam zoom 1)
 *   EP4.sunLight(x, y, k)        a character light from (x, y) toward the sun (k = intensity)
 *   EP4.verses(ctx, T, cx, cy, r, a, o)   the epic held in mind: small gold verse-marks
 *                                kindling and circling (a ring of light), alpha a
 *   EP4.leaf(ctx, T, x, y, w, ink, o)     the scribe's palm leaf, written left→right up to ink (0..1)
 *   EP4.stack(ctx, x, y, n, o)   a growing pile of written leaves
 *   EP4.mouth(env, t)            = EP2.mouth (speech envelope for expression.speak)
 *   EP4.twoShot(ctx, T, o)       Vyasa (left, facing right) and Ganesha (right, facing left) on their
 *                                seats in the hermitage, the written leaves piling beside Ganesha.
 *                                o = { cam: {zoom, dx, dy}, vyasa: {pose, expression}, ganesha: {pose, expression,
 *                                alpha, reveal}, stack (n leaves), verses (0..1 above Vyasa), sunUp }
 *   EP4.POS                      their places: { vyasa: [x, y, scale], ganesha: [x, y, scale] }
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, hash, E, PAL } = R;
  const EP4 = (window.EP4 = {});

  const HZ = 1050;               // the meadow's far edge
  EP4.SUN = { x: 210, y: 560 };
  EP4.HZ = HZ;
  EP4.mouth = (env, t) => (window.EP2 ? window.EP2.mouth(env, t) : 0);

  /** Light for a character at (x, y): toward the sun, a touch of front light (it is day). */
  EP4.sunLight = (x, y, k = 1) => ({ dir: Math.atan2(EP4.SUN.y - y, EP4.SUN.x - x), intensity: k, front: 0.32 });

  // ─── peaks and ridges (built once) ──────────────────────────────────────────
  let GEO = null;
  function geo() {
    if (GEO) return GEO;
    const r = R.rng(4404);
    const ridge = (y0, amp, n, seed, rough) => {
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const x = -60 + (i / n) * 1200;
        const y = y0 - amp * (0.5 + 0.5 * Math.sin(i * 0.9 + seed)) * (0.6 + 0.4 * hash(i, seed)) - rough * (hash(i, seed + 7) - 0.5);
        pts.push([x, y]);
      }
      return pts;
    };
    // the snow range: big jagged peaks
    const peaks = [];
    const tops = [[120, 560], [330, 470], [520, 600], [700, 430], [900, 520], [1080, 470]];
    let x = -80;
    peaks.push([x, 960]);
    tops.forEach(([px, py], i) => {
      const prev = peaks[peaks.length - 1];
      // a shoulder, then the summit
      peaks.push([lerp(prev[0], px, 0.55) + r.range(-20, 20), lerp(prev[1], py, 0.45) + r.range(10, 50)]);
      peaks.push([px, py]);
      if (i === tops.length - 1) peaks.push([1180, 820]);
    });
    peaks.push([1180, 980]);
    GEO = {
      peaks,
      tops,
      ridge1: ridge(880, 120, 14, 1, 30),
      ridge2: ridge(960, 90, 18, 2, 24),
      ridge3: ridge(1030, 60, 24, 3, 14),
      deodars: Array.from({ length: 22 }, (_, i) => ({ x: -40 + i * 54 + r.range(-18, 18), y: HZ + r.range(-30, 10), h: r.range(180, 330) * (i % 5 === 2 ? 1.3 : 1), far: i % 2 })),
      grass: Array.from({ length: 70 }, (_, i) => ({ x: r() * 1100 - 10, h: r.range(30, 90), lean: r.range(-0.3, 0.3), ph: r() * TAU })),
    };
    return GEO;
  }

  function deodar(ctx, x, y, h, col, lit, T, i) {
    // a Himalayan cedar, mural-flat: a straight trunk and drooping tiered boughs to a spire
    const sway = Math.sin(T * 0.6 + i) * 2;
    ctx.fillStyle = col;
    ctx.fillRect(x - h * 0.02, y - h * 0.25, h * 0.04, h * 0.25);
    const tiers = 7;
    for (let k = 0; k < tiers; k++) {
      const u = k / tiers, w = h * 0.3 * (1 - u * 0.85), ty = y - h * 0.18 - u * h * 0.78;
      ctx.beginPath();
      ctx.moveTo(x + sway * u, ty - h * 0.14);
      ctx.quadraticCurveTo(x + w * 0.6, ty - h * 0.05, x + w + sway * u, ty + h * 0.03);
      ctx.lineTo(x - w + sway * u, ty + h * 0.03);
      ctx.quadraticCurveTo(x - w * 0.6, ty - h * 0.05, x + sway * u, ty - h * 0.14);
      ctx.fill();
      if (lit) {
        ctx.save(); ctx.strokeStyle = lit; ctx.lineWidth = 2; ctx.globalAlpha = 0.6;
        ctx.beginPath(); ctx.moveTo(x + sway * u, ty - h * 0.14); ctx.quadraticCurveTo(x - w * 0.6, ty - h * 0.05, x - w + sway * u, ty + h * 0.03); ctx.stroke();
        ctx.restore();
      }
    }
  }

  function hut(ctx, x, y, s, T) {
    // a parnashala: a low thatched hut on posts, its doorway warm
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#2a1e16';
    ctx.fillRect(-150, -120, 300, 120);
    ctx.fillStyle = '#e8a050'; ctx.globalAlpha = 0.55 + 0.1 * Math.sin(T * 3);
    ctx.fillRect(-36, -96, 72, 96);
    ctx.globalAlpha = 1;
    // the thatch: layered scallops
    ctx.fillStyle = '#6a5030';
    ctx.beginPath(); ctx.moveTo(-200, -100); ctx.lineTo(0, -250); ctx.lineTo(200, -100); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#a07a44'; ctx.lineWidth = 3;
    for (let k = 0; k < 5; k++) {
      const yy = -110 - k * 28, w = 200 * (1 - (k * 28 + 10) / 150);
      ctx.beginPath();
      for (let j = -6; j <= 6; j++) { const xx = (j / 6) * w; ctx.moveTo(xx - 14, yy); ctx.quadraticCurveTo(xx, yy + 10, xx + 14, yy); }
      ctx.stroke();
    }
    ctx.fillStyle = '#f2c070'; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(-200, -100); ctx.lineTo(0, -250); ctx.lineTo(-10, -240); ctx.lineTo(-190, -100); ctx.fill();
    ctx.restore();
  }

  EP4.hermitage = (ctx, T, o = {}) => {
    const G = geo();
    const up = o.sunUp ?? 1;
    ctx.save();
    const cam = o.cam || {};
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    // sky: cool blue above, warm gold at the horizon (morning)
    KIT.vgrad(ctx, -200, HZ, [[0, '#2c3e6a'], [0.35, '#5a76a6'], [0.62, '#a9bdd2'], [0.82, '#f2d6a8'], [1, '#f8c88a']]);
    const sun = { x: EP4.SUN.x, y: lerp(EP4.SUN.y + 200, EP4.SUN.y, up) };
    KIT.glow(ctx, sun.x, sun.y, 900, '#ffd890', 0.45, 'lighter', 0.8);
    KIT.glow(ctx, sun.x, sun.y, 240, '#fff2d0', 0.7);
    ctx.fillStyle = '#fff6e0'; ctx.beginPath(); ctx.arc(sun.x, sun.y, 46, 0, TAU); ctx.fill();
    // the snow range: blue shadow faces, sunlit faces (left of each summit) and snow caps
    ctx.fillStyle = '#7c8fb4';
    ctx.beginPath(); R.polyPath(ctx, G.peaks); ctx.fill();
    ctx.fillStyle = '#e8eaf4';
    G.tops.forEach(([px, py]) => {
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 120, py + 150); ctx.lineTo(px - 70, py + 130); ctx.lineTo(px - 50, py + 160); ctx.lineTo(px - 10, py + 120); ctx.lineTo(px + 20, py + 150); ctx.lineTo(px + 60, py + 110); ctx.closePath(); ctx.fill();
    });
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,200,140,0.6)';
    ctx.beginPath(); R.polyPath(ctx, G.peaks); ctx.fill(); ctx.restore();
    // mist band at the foot of the range
    const mist = (y, a, h = 90) => {
      const g = ctx.createLinearGradient(0, y - h, 0, y + h);
      g.addColorStop(0, 'rgba(240,232,226,0)'); g.addColorStop(0.5, `rgba(240,232,226,${a})`); g.addColorStop(1, 'rgba(240,232,226,0)');
      ctx.fillStyle = g; ctx.fillRect(-200, y - h, R.W + 400, h * 2);
    };
    mist(900, 0.55, 110);
    // ridges, far → near, bluer and lighter far away
    const ridge = (pts, col, base) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(pts[0][0], base); for (const p of pts) ctx.lineTo(p[0], p[1]); ctx.lineTo(pts[pts.length - 1][0], base); ctx.closePath(); ctx.fill(); };
    ridge(G.ridge1, '#6a809a', HZ + 40);
    mist(960 + Math.sin(T * 0.2) * 6, 0.4, 70);
    ridge(G.ridge2, '#4e6478', HZ + 40);
    // far deodars on the ridge line
    G.deodars.filter((d) => d.far).forEach((d, i) => deodar(ctx, d.x, d.y - 20, d.h * 0.55, '#33485a', null, T, i));
    ridge(G.ridge3, '#3a4c4a', HZ + 60);
    mist(1035, 0.32, 50);
    // the meadow
    KIT.vgrad(ctx, HZ, R.H + 300, [[0, '#6a7048'], [0.12, '#4e5636'], [0.5, '#2e3220'], [1, '#141608']]);
    // the stream: a pale ribbon winding toward us, catching the sun
    ctx.save();
    ctx.beginPath();
    const sx = (y) => 760 + Math.sin(y * 0.006) * 90 + (y - HZ) * 0.35;
    ctx.moveTo(sx(HZ) - 6, HZ);
    for (let y = HZ; y <= R.H + 200; y += 40) ctx.lineTo(sx(y) - 6 - (y - HZ) * 0.12, y);
    for (let y = R.H + 200; y >= HZ; y -= 40) ctx.lineTo(sx(y) + 6 + (y - HZ) * 0.12, y);
    ctx.closePath();
    const sg = ctx.createLinearGradient(0, HZ, 0, R.H);
    sg.addColorStop(0, '#e8e4d8'); sg.addColorStop(0.4, '#9ab4c0'); sg.addColorStop(1, '#3a5460');
    ctx.fillStyle = sg; ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,240,210,0.35)'; ctx.lineWidth = 2;
    for (let k = 0; k < 10; k++) { const y = HZ + 40 + ((k * 97 + T * 30) % 800); ctx.beginPath(); ctx.moveTo(sx(y) - 10, y); ctx.lineTo(sx(y) + 14, y + 3); ctx.stroke(); }
    ctx.restore();
    // near deodars at the meadow's edge
    G.deodars.filter((d) => !d.far && (d.x < 200 || d.x > 880)).forEach((d, i) => deodar(ctx, d.x, d.y + 30, d.h * 1.6, '#1a2a22', '#e8c890', T, i + 30));
    if (o.hut !== false) hut(ctx, 930, HZ + 70, 0.55, T);
    ctx.restore();
    // morning haze over everything far
    KIT.glow(ctx, EP4.SUN.x, EP4.SUN.y + 300, 1000, '#ffe0b0', 0.12, 'screen', 0.6);
  };

  /** Near grasses (drawn in front of the characters) */
  EP4.grass = (ctx, T, y0 = 1700, a = 1) => {
    const G = geo();
    ctx.save(); ctx.globalAlpha = a;
    ctx.strokeStyle = '#141a0e'; ctx.lineCap = 'round';
    for (const g of G.grass) {
      const sway = Math.sin(T * 1.2 + g.ph) * 6;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(g.x, y0 + 200); ctx.quadraticCurveTo(g.x + g.lean * 40, y0 + 200 - g.h * 0.6, g.x + g.lean * 60 + sway, y0 + 200 - g.h * 1.4); ctx.stroke();
    }
    ctx.restore();
  };

  /** Verse-marks: tiny gold glyph strokes kindling around (cx, cy), circling slowly. */
  EP4.verses = (ctx, T, cx, cy, r, a, o = {}) => {
    if (a <= 0.003) return;
    const n = o.n || 40, seed = o.seed || 9;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const born = hash(i, seed) * 0.8;
      const k = clamp((a - born) / 0.2);
      if (k <= 0) continue;
      const ang = hash(i, seed + 1) * TAU + T * (0.12 + 0.1 * hash(i, seed + 2)) * (i % 2 ? 1 : -1);
      const rr = r * (0.55 + 0.6 * hash(i, seed + 3));
      const x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr * (o.flat ?? 0.55) + Math.sin(T * 1.3 + i) * 6;
      const tw = 0.6 + 0.4 * Math.sin(T * 3 + i * 1.7);
      ctx.globalAlpha = k * tw * (o.alpha ?? 1);
      ctx.strokeStyle = PAL.goldPale; ctx.lineWidth = 2.2;
      // a glyph-like stroke: a little hooked line (not readable text)
      const s = 9 + 5 * hash(i, seed + 4);
      ctx.beginPath(); ctx.moveTo(x - s, y + s * 0.3); ctx.quadraticCurveTo(x - s * 0.2, y - s, x + s * 0.5, y - s * 0.2); ctx.lineTo(x + s, y + s * 0.4); ctx.stroke();
      KIT.glow(ctx, x, y, 34, '#ffc870', 0.4 * k * tw);
    }
    ctx.restore();
  };

  /** The scribe's palm leaf: incised rows written left → right up to `ink`. */
  EP4.leaf = (ctx, T, x, y, w, ink, o = {}) => {
    KIT.manuscript.leaf(ctx, x, y, w, o.h || 56, 1, { seed: o.seed || 400, alpha: o.alpha ?? 1, light: o.light ?? 0.4, tilt: o.tilt || 0, ink: 0 });
    // the written part
    const k = clamp(ink);
    if (k <= 0) return;
    ctx.save();
    ctx.translate(x, y); if (o.tilt) ctx.rotate(o.tilt);
    ctx.beginPath(); ctx.rect(-w / 2, -40, w * k, 80); ctx.clip();
    KIT.manuscript.leaf(ctx, 0, 0, w, o.h || 56, 1, { seed: o.seed || 400, alpha: o.alpha ?? 1, light: o.light ?? 0.4, ink: 1 });
    ctx.restore();
  };

  /** A pile of n written leaves (bound or loose). */
  EP4.stack = (ctx, x, y, n, o = {}) => {
    const w = o.w || 300;
    for (let i = 0; i < n; i++) {
      KIT.manuscript.leaf(ctx, x + (hash(i, 7) - 0.5) * 8, y - i * 9, w, 40, 1, { seed: 500 + i, alpha: 1, light: 0.3, tilt: (hash(i, 8) - 0.5) * 0.03, ink: 1 });
    }
    if (o.bound) {
      ctx.save(); ctx.strokeStyle = '#9a2a1c'; ctx.lineWidth = 4;
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * w * 0.3, y + 16); ctx.lineTo(x + s * w * 0.3, y - n * 9 - 18); ctx.stroke(); }
      // boards top and bottom
      ctx.fillStyle = '#4a2a16';
      ctx.fillRect(x - w / 2 - 6, y + 14, w + 12, 12); ctx.fillRect(x - w / 2 - 6, y - n * 9 - 24, w + 12, 12);
      ctx.restore();
    }
  };

  EP4.POS = { vyasa: [300, 1330, 0.66], ganesha: [790, 1342, 0.64] };
  EP4.twoShot = (ctx, T, o = {}) => {
    const CH = KIT.characters, cam = o.cam || {};
    EP4.hermitage(ctx, T, { cam, sunUp: o.sunUp });
    ctx.save();
    KIT.camera(ctx, { x: 540, y: 1100, zoom: cam.zoom || 1, dx: cam.dx || 0, dy: cam.dy || 0 });
    const [vx, vy, vs] = EP4.POS.vyasa, [gx, gy, gs] = EP4.POS.ganesha;
    // seats: a stone with a deer-skin for Vyasa, a low stone for the scribe
    ctx.fillStyle = '#2a2a26';
    ctx.beginPath(); ctx.ellipse(vx, vy + 22, 170, 38, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(gx, gy + 18, 190, 40, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#7a5a36'; ctx.beginPath(); ctx.ellipse(vx - 6, vy + 8, 120, 22, -0.04, 0, TAU); ctx.fill();
    const V = o.vyasa || {};
    CH.vyasa.draw(ctx, { x: vx, y: vy, scale: vs, facing: 'right', pose: V.pose || 'sit', expression: V.expression || {}, light: EP4.sunLight(vx, vy - 400, 0.95), t: T, key: 'ts-vyasa' });
    if (o.verses) EP4.verses(ctx, T, vx + 30, vy - 560, 210, o.verses, { n: 30, seed: 21 });
    const G = o.ganesha || {};
    const ga = G.alpha ?? 1;
    if (ga > 0.003) {
      if (G.reveal != null && G.reveal < 1) KIT.glow(ctx, gx, gy - 300, 520, '#ff7a3a', 0.6 * Math.sin(Math.PI * clamp(G.reveal)), 'lighter');
      CH.ganesha.draw(ctx, { x: gx, y: gy, scale: gs, facing: 'left', pose: G.pose || { name: 'write', k: 1, phase: T * 7 }, expression: G.expression || {}, light: EP4.sunLight(gx, gy - 400, 0.95), t: T, key: 'ts-ganesha', alpha: ga });
    }
    if (o.stack) EP4.stack(ctx, gx + 210, gy + 30, Math.round(o.stack), { w: 200 });
    ctx.restore();
    EP4.grass(ctx, T, 1720, 0.85);
  };
})();
