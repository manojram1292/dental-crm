/*
 * KIT · core: shared look of the series ("an old temple mural come alive").
 *
 *   KIT.flicker(T, seed)          the sacred fire's light level, 0.72..1 (smooth, pure in T)
 *   KIT.glow(ctx, x, y, r, col, a) additive soft light from a cached sprite
 *   KIT.rimLit(ctx, draw, o)       flat silhouette with a painted rim of light on one side
 *   KIT.goldText(ctx, text, x, y, o) engraved gold lettering with a sheen sweep
 *   KIT.ornament(ctx, x, y, w, a)  gold divider: rule · lotus bud · rule
 *   KIT.embers(ctx, T, o)          rising sparks from a source (deterministic)
 *   KIT.fireflies(ctx, T, o)       drifting, blinking points of light
 *   KIT.scallopPath(ctx, …)        mural foliage / cloud outline
 *   KIT.vgrad(ctx, y0, y1, stops)  vertical sky / ground gradient fill
 *
 * Everything is a pure function of its arguments (sprites are cached, never mutated).
 */
(function () {
  'use strict';
  const R = window.REEL;
  const { TAU, clamp, lerp, noise, hash, PAL } = R;
  const KIT = (window.KIT = window.KIT || {});

  /** Mix two colours ('#rgb', '#rrggbb' or 'rgb(a)(…)') → '#rrggbb' (safe to nest and to pass to KIT.glow; uncached). */
  const parseC = (c) => { if (c[0] === '#') { let h = c.slice(1); if (h.length === 3) h = h.split('').map((x) => x + x).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; } const m = c.match(/[\d.]+/g); return [+m[0], +m[1], +m[2]]; };
  KIT.rgb = parseC;
  KIT.hex = (a, b, t = 0) => { const A = parseC(a), B = b ? parseC(b) : A, k = clamp(t); return '#' + [0, 1, 2].map((i) => Math.round(lerp(A[i], B[i], k)).toString(16).padStart(2, '0')).join(''); };

  /** The sacred fire's light, 0.72..1, continuous in T. Same seed → same flicker everywhere. */
  KIT.flicker = (T, seed = 0) => {
    const n = noise.n2(T * 3.1, seed * 7.3) * 0.55 + noise.n2(T * 7.7, seed * 7.3 + 30) * 0.3 + noise.n2(T * 17, seed + 61) * 0.15;
    return clamp(0.86 + n * 0.16, 0.66, 1);
  };

  // ─── Glow sprites ───────────────────────────────────────────────────────────
  const sprites = new Map();
  function glowSprite(color) {
    let c = sprites.get(color);
    if (c) return c;
    c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d'), [r, gg, b] = R.hexToRgb(color);
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    for (let i = 0; i <= 10; i++) {
      const u = i / 10, a = Math.exp(-u * u * 4.2) * (1 - u);
      grd.addColorStop(u, `rgba(${r},${gg},${b},${a.toFixed(4)})`);
    }
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
    sprites.set(color, c);
    return c;
  }
  KIT.glowSprite = glowSprite;
  /** Additive (or `mode`) soft glow of radius r. */
  KIT.glow = (ctx, x, y, r, color, alpha = 1, mode = 'lighter', sy = 1) => {
    if (alpha <= 0.002 || r <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = mode;
    ctx.globalAlpha = clamp(alpha);
    ctx.drawImage(glowSprite(color), x - r, y - r * sy, 2 * r, 2 * r * sy);
    ctx.restore();
  };

  /** Fill a vertical gradient from y0 to y1 across the frame. stops: [[u, color], …]. */
  KIT.vgrad = (ctx, y0, y1, stops, x0 = 0, x1 = R.W) => {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    for (const [u, c] of stops) g.addColorStop(clamp(u), c);
    ctx.fillStyle = g;
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  };

  // ─── Rim-lit silhouette ─────────────────────────────────────────────────────
  /**
   * Shadow-puppet silhouette lit from one side. `draw(g, color)` must fill the
   * figure's shapes with `color` (it is called twice). The rim is the part of
   * the figure not covered by itself shifted (dx, dy) AWAY from the light.
   *   o = { fill, rim, dx, dy, glow: alpha, glowColor, box: [x, y, w, h], key }
   */
  KIT.rimLit = (ctx, draw, o) => {
    const [bx, by, bw, bh] = (o.box || [0, 0, R.W, R.H]).map(Math.round);
    const b = R.buffer(o.key || 'rim', bw, bh);
    b.clear();
    const g = b.ctx;
    g.translate(-bx, -by);
    draw(g, o.rim);
    g.globalCompositeOperation = 'source-atop';
    if (o.inner) { g.globalAlpha = o.inner.alpha; g.save(); g.translate(o.dx * 0.4, o.dy * 0.4); draw(g, o.inner.color); g.restore(); g.globalAlpha = 1; }
    g.save(); g.translate(o.dx, o.dy); draw(g, o.fill); g.restore();
    g.globalCompositeOperation = 'source-over';
    if (o.glow) {
      // cheap wide blur: down-sample the rim pass, then draw it up-scaled additively
      const sw = Math.max(1, Math.round(bw / 8)), sh = Math.max(1, Math.round(bh / 8));
      const sb = R.buffer((o.key || 'rim') + '-glow', sw, sh);
      sb.clear();
      sb.ctx.filter = R.blur(2.2);
      sb.ctx.drawImage(b.canvas, 0, 0, sw, sh);
      sb.ctx.filter = 'none';
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = clamp(o.glow);
      ctx.drawImage(sb.canvas, bx, by, bw, bh);
      ctx.restore();
    }
    ctx.drawImage(b.canvas, bx, by, bw, bh);
  };

  // ─── Lettering ──────────────────────────────────────────────────────────────
  /**
   * Gold lettering. o = { size, family:'display', weight, spacing (px), align,
   *   alpha, sheen (0..1 position of the light band, <0 or >1 = none),
   *   reveal (0..1 left→right soft wipe), glow (0..1), key }
   * Returns the measured width.
   */
  KIT.goldText = (ctx, text, x, y, o = {}) => {
    const size = o.size || 80, spacing = o.spacing ?? size * 0.08, alpha = o.alpha ?? 1;
    if (alpha <= 0.002 || !text) return 0;
    const f = R.font(size, o.family || 'display', o.weight || 600, o.style || 'normal');
    ctx.save();
    ctx.font = f; ctx.letterSpacing = `${spacing}px`;
    const w = ctx.measureText(text).width;
    ctx.restore();
    const pad = size * 0.6, bw = Math.ceil(w + pad * 2), bh = Math.ceil(size * 1.9);
    const b = R.buffer(o.key || 'gold', bw, bh);
    b.clear();
    const g = b.ctx;
    g.font = f; g.letterSpacing = `${spacing}px`; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    const base = size * 1.25;
    g.fillStyle = '#000';
    g.fillText(text, pad, base);
    g.globalCompositeOperation = 'source-in';
    const gr = g.createLinearGradient(0, base - size * 0.8, 0, base + size * 0.1);
    gr.addColorStop(0, PAL.goldPale); gr.addColorStop(0.45, PAL.gold); gr.addColorStop(0.62, PAL.goldDeep); gr.addColorStop(0.8, PAL.gold); gr.addColorStop(1, '#f9e3a8');
    g.fillStyle = gr; g.fillRect(0, 0, bw, bh);
    if (o.sheen != null && o.sheen > -0.3 && o.sheen < 1.3) {
      g.globalCompositeOperation = 'source-atop';
      const sx = lerp(-bw * 0.3, bw * 1.3, o.sheen);
      const sg = g.createLinearGradient(sx - size, 0, sx + size, bh);
      sg.addColorStop(0, 'rgba(255,250,230,0)'); sg.addColorStop(0.5, 'rgba(255,250,230,0.85)'); sg.addColorStop(1, 'rgba(255,250,230,0)');
      g.fillStyle = sg; g.fillRect(0, 0, bw, bh);
    }
    if (o.reveal != null && o.reveal < 1) {
      g.globalCompositeOperation = 'destination-in';
      const rx = lerp(-size, bw + size, clamp(o.reveal));
      const rg = g.createLinearGradient(rx - size * 1.2, 0, rx, 0);
      rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg; g.fillRect(0, 0, bw, bh);
    }
    g.globalCompositeOperation = 'source-over';
    const align = o.align || 'center';
    const left = (align === 'center' ? x - w / 2 : align === 'right' ? x - w : x) - pad;
    ctx.save();
    ctx.globalAlpha = alpha;
    // engraved shadow
    ctx.shadowColor = 'rgba(10,6,4,0.85)';
    ctx.shadowBlur = R.px(size * 0.12);
    ctx.shadowOffsetY = R.px(size * 0.03);
    ctx.drawImage(b.canvas, left, y - base, bw, bh);
    ctx.restore();
    if (o.glow) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = alpha * clamp(o.glow);
      ctx.filter = R.blur(size * 0.18);
      ctx.drawImage(b.canvas, left, y - base, bw, bh);
      ctx.restore();
    }
    return w;
  };

  /** Gold divider: hairline · diamond · lotus bud · diamond · hairline. */
  KIT.ornament = (ctx, x, y, w, alpha = 1, grow = 1) => {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = PAL.gold; ctx.strokeStyle = PAL.gold;
    const half = (w / 2) * clamp(grow);
    const g = ctx.createLinearGradient(x - half, 0, x + half, 0);
    g.addColorStop(0, 'rgba(231,181,74,0)'); g.addColorStop(0.3, PAL.gold); g.addColorStop(0.7, PAL.gold); g.addColorStop(1, 'rgba(231,181,74,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - half, y - 1, half - 26, 2);
    ctx.fillRect(x + 26, y - 1, half - 26, 2);
    ctx.fillStyle = PAL.gold;
    const k = clamp(grow * 1.4 - 0.2);
    // lotus bud
    ctx.beginPath();
    ctx.moveTo(x, y - 15 * k);
    ctx.bezierCurveTo(x + 9 * k, y - 7 * k, x + 9 * k, y + 5 * k, x, y + 9 * k);
    ctx.bezierCurveTo(x - 9 * k, y + 5 * k, x - 9 * k, y - 7 * k, x, y - 15 * k);
    ctx.fill();
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + s * 13 * k, y); ctx.lineTo(x + s * 18 * k, y - 4 * k); ctx.lineTo(x + s * 23 * k, y); ctx.lineTo(x + s * 18 * k, y + 4 * k);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  };

  // ─── Particles ──────────────────────────────────────────────────────────────
  /**
   * Rising embers from a source. Each ember i is born periodically; its whole
   * path is a function of (T - birth), so the field is pure in T.
   * o = { x, y, spread, rate (per s), life, rise (px/s), sway, size, alpha, color, seed, lean }
   */
  KIT.embers = (ctx, T, o) => {
    const rate = o.rate || 12, life = o.life || 2.2, seed = o.seed || 1;
    const n = Math.ceil(rate * life) + 1;
    const k0 = Math.floor(T * rate);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let k = k0 - n; k <= k0; k++) {
      const birth = k / rate + hash(k, seed) / rate;
      const age = T - birth;
      if (age < 0 || age > life * (0.6 + 0.4 * hash(k, seed + 1))) continue;
      const u = age / life;
      const x0 = o.x + (hash(k, seed + 2) - 0.5) * (o.spread || 60);
      const rise = (o.rise || 160) * (0.6 + 0.8 * hash(k, seed + 3));
      const sway = (o.sway || 30) * noise.n2(k * 0.37, age * 1.3);
      const x = x0 + sway + (o.lean || 0) * age * 60;
      const y = o.y - rise * age - 30 * age * age;
      const tw = 0.6 + 0.4 * Math.sin(age * 23 + k);
      const a = (o.alpha ?? 1) * Math.sin(Math.PI * Math.min(1, u * 1.15)) * tw;
      const s = (o.size || 3) * (0.5 + hash(k, seed + 4)) * (1 - u * 0.5);
      if (a <= 0.01) continue;
      ctx.globalAlpha = clamp(a);
      ctx.fillStyle = u < 0.35 ? PAL.goldPale : u < 0.7 ? PAL.saffronLt : PAL.saffron;
      ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill();
      KIT.glow(ctx, x, y, s * 7, PAL.saffron, a * 0.35);
    }
    ctx.restore();
  };

  /**
   * Fireflies in a box, each on a slow Lissajous wander with a soft blink.
   * o = { box: [x, y, w, h], count, seed, size, alpha, color }
   */
  KIT.fireflies = (ctx, T, o) => {
    const [bx, by, bw, bh] = o.box, n = o.count || 24, seed = o.seed || 5;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const h1 = hash(i, seed), h2 = hash(i, seed + 1), h3 = hash(i, seed + 2), h4 = hash(i, seed + 3);
      const x = bx + bw * (h1 + 0.06 * Math.sin(T * (0.4 + h3 * 0.5) + h2 * 9) + 0.03 * noise.n2(i * 3.1, T * 0.35));
      const y = by + bh * (h2 + 0.05 * Math.sin(T * (0.33 + h4 * 0.4) + h1 * 7) + 0.03 * noise.n2(i * 3.1 + 50, T * 0.35));
      const blink = Math.pow(clamp(0.5 + 0.5 * Math.sin(T * (1.1 + h3 * 1.6) + h4 * TAU)), 3);
      const a = (o.alpha ?? 1) * (0.15 + 0.85 * blink);
      const s = (o.size || 2.4) * (0.7 + 0.6 * h3);
      ctx.globalAlpha = clamp(a);
      ctx.fillStyle = o.core || '#fff4c8';
      ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill();
      KIT.glow(ctx, x, y, s * 9, o.color || '#e8d86a', a * 0.55);
    }
    ctx.restore();
  };

  /** Closed scalloped outline (mural foliage clump / cloud): adds a subpath. */
  KIT.scallopPath = (ctx, cx, cy, rx, ry, bumps, seed = 0, depth = 0.22, rot = 0) => {
    const pts = [];
    for (let i = 0; i < bumps; i++) {
      const a = rot + (i / bumps) * TAU, j = 0.85 + 0.3 * hash(i, seed);
      pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
    }
    ctx.moveTo((pts[0][0] + pts[bumps - 1][0]) / 2, (pts[0][1] + pts[bumps - 1][1]) / 2);
    for (let i = 0; i < bumps; i++) {
      const p = pts[i], q = pts[(i + 1) % bumps];
      const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      // bulge outward from the centre
      const ox = (p[0] - cx) * (1 + depth), oy = (p[1] - cy) * (1 + depth);
      ctx.quadraticCurveTo(cx + ox, cy + oy, mx, my);
    }
    ctx.closePath();
  };

  /** Small 2D camera: scale about a focus point, then translate. */
  KIT.camera = (ctx, { x = R.W / 2, y = R.H / 2, zoom = 1, dx = 0, dy = 0, rot = 0 } = {}) => {
    ctx.translate(x + dx, y + dy);
    if (rot) ctx.rotate(rot);
    ctx.scale(zoom, zoom);
    ctx.translate(-x, -y);
  };
})();
