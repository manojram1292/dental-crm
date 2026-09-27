/*
 * Ribhu Labs — "One Cup, Made Four" · engine
 *
 * Every frame of the film is a pure function of time. Scenes never keep state
 * between draw calls, so any frame can be rendered in any order: that is what
 * lets the player scrub, and the offline renderer take motion-blur sub-samples
 * (each with a sub-pixel camera jitter, so they double as anti-aliasing) and
 * split work across parallel browser pages.
 *
 * 3D is drawn with three.js through the shared renderer in src/kit/core.js and
 * composited into this 2D canvas, so type and 2D effects layer over it freely.
 *
 * Logical canvas is always 1920×1080. The runtime pre-scales the context, so
 * scenes draw in logical pixels no matter what the backing resolution is.
 */
(function () {
  'use strict';

  const W = 1920, H = 1080, FPS = 30, DURATION = 30, BPM = 96, BEAT = 60 / BPM; // one bar = 2.5 s
  const FRAMES = FPS * DURATION;

  // ─── Palette & type ─────────────────────────────────────────────────────────
  const PAL = {
    graphite: '#191b19', // dark ground (site theme colour)
    ink: '#111311',      // deepest shadow (site lab background)
    umber: '#44372e',    // warm workshop dark
    taupe: '#817368',    // stone, secondary text on dark
    ivory: '#eeead5',    // primary text on dark, ceramic
    copper: '#b46f43',   // the brand flame
    copperHot: '#d16d3e',// active copper (site accent)
    ember: '#ffb48e',    // glowing copper highlight
    charcoal: '#292925', // the two dark flames
    line: '#50564a',     // ruled lines on dark
    mute: '#979e91',     // quiet annotations
  };

  const FAMILY = {
    display: "'Space Grotesk'",  // variable 300–700 — headlines, wordmark
    body: "'Manrope'",           // variable 200–800 — story lines
    mono: "'JetBrains Mono'",    // variable 100–800 — kickers, annotations
  };

  /** CSS font string. weight may be any number in the family's range (variable fonts). */
  function font(size, family = 'display', weight = 500, style = 'normal') {
    return `${style} ${weight} ${size}px ${FAMILY[family] || family}`;
  }

  const FONT_FACES = [
    "300 64px 'Space Grotesk'", "700 64px 'Space Grotesk'",
    "200 64px 'Manrope'", "800 64px 'Manrope'",
    "400 64px 'JetBrains Mono'", "700 64px 'JetBrains Mono'",
  ];

  // ─── Math & timing ──────────────────────────────────────────────────────────
  const TAU = Math.PI * 2;
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const invLerp = (a, b, x) => (b === a ? 0 : (x - a) / (b - a));
  const remap = (x, a, b, c, d) => c + (d - c) * invLerp(a, b, x);
  const fract = (x) => x - Math.floor(x);
  const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  /** Clamped 0..1 progress of t through the window [a, b]. */
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  /** Eased progress of t through [a, b]. */
  const ease = (t, a, b, fn = E.inOutCubic) => fn(seg(t, a, b));
  const lerpAngle = (a, b, t) => a + ((((b - a) % TAU) + 3 * Math.PI) % TAU - Math.PI) * t;

  /**
   * Stagger helper: start time of element i of n, spreading starts over `spread`
   * seconds. Returns local progress 0..1 of a `dur`-long tween for element i.
   */
  function stagger(t, i, n, { start = 0, spread = 0.3, dur = 0.5, fn = E.outExpo } = {}) {
    const s = start + (n <= 1 ? 0 : (i / (n - 1)) * spread);
    return fn(seg(t, s, s + dur));
  }

  /**
   * Keyframes: tween(t, [[time, value, easeInto?], ...]). Values may be numbers
   * or equal-length arrays. The ease on a key shapes the segment arriving at it.
   */
  function tween(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, fn = E.inOutCubic] = keys[i];
      if (t <= t1) {
        const [t0, v0] = keys[i - 1];
        const p = fn(seg(t, t0, t1));
        return Array.isArray(v0) ? v0.map((v, k) => lerp(v, v1[k], p)) : lerp(v0, v1, p);
      }
    }
    return keys[keys.length - 1][1];
  }

  // ─── Easing ─────────────────────────────────────────────────────────────────
  /** Solves CSS cubic-bezier(x1,y1,x2,y2) the way browsers do. Returns y(x). */
  function bezierEasing(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (s) => ((ax * s + bx) * s + cx) * s;
    const sy = (s) => ((ay * s + by) * s + cy) * s;
    const dsx = (s) => (3 * ax * s + 2 * bx) * s + cx;
    const solve = (x) => {
      let s = x;
      for (let i = 0; i < 8; i++) {
        const e = sx(s) - x;
        if (Math.abs(e) < 1e-7) return s;
        const d = dsx(s);
        if (Math.abs(d) < 1e-6) break;
        s -= e / d;
      }
      let lo = 0, hi = 1; s = x;
      for (let i = 0; i < 40; i++) {
        const v = sx(s);
        if (Math.abs(v - x) < 1e-7) break;
        if (x > v) lo = s; else hi = s;
        s = (lo + hi) / 2;
      }
      return s;
    };
    return (x) => (x <= 0 ? 0 : x >= 1 ? 1 : sy(solve(x)));
  }

  const E = {
    linear: (t) => t,
    inSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
    outSine: (t) => Math.sin((t * Math.PI) / 2),
    inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    inQuad: (t) => t * t,
    outQuad: (t) => 1 - (1 - t) * (1 - t),
    inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    inCubic: (t) => t * t * t,
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    inQuart: (t) => t * t * t * t,
    outQuart: (t) => 1 - Math.pow(1 - t, 4),
    inOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
    inQuint: (t) => t * t * t * t * t,
    outQuint: (t) => 1 - Math.pow(1 - t, 5),
    inOutQuint: (t) => (t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2),
    inExpo: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
    outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inOutExpo: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
    inCirc: (t) => 1 - Math.sqrt(1 - t * t),
    outCirc: (t) => Math.sqrt(1 - Math.pow(t - 1, 2)),
    inOutCirc: (t) => (t < 0.5 ? (1 - Math.sqrt(1 - 4 * t * t)) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2),
    inBack: (t) => 2.70158 * t * t * t - 1.70158 * t * t,
    outBack: (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
    inOutBack: (t) => {
      const c = 1.70158 * 1.525;
      return t < 0.5 ? (Math.pow(2 * t, 2) * ((c + 1) * 2 * t - c)) / 2 : (Math.pow(2 * t - 2, 2) * ((c + 1) * (t * 2 - 2) + c) + 2) / 2;
    },
    outElastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
    outBounce: (t) => {
      const n = 7.5625, d = 2.75;
      if (t < 1 / d) return n * t * t;
      if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
      if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
      return n * (t -= 2.625 / d) * t + 0.984375;
    },
    /** Factory: CSS cubic-bezier. */
    bezier: bezierEasing,
    /** Factory: back-out with custom overshoot. */
    backOut: (s = 1.70158) => (t) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
    backIn: (s = 1.70158) => (t) => (s + 1) * t * t * t - s * t * t,
    /**
     * Factory: damped spring from 0 → 1 over normalised t in [0,1].
     * `bounces` ≈ visible oscillations, `damping` 0..1 (higher settles faster).
     * Ends exactly at 1.
     */
    spring: (bounces = 2, damping = 0.6) => (t) => {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      const w = Math.PI * (bounces * 2 + 0.5);
      const decay = 4 + damping * 8;
      const v = 1 - Math.exp(-decay * t) * Math.cos(w * t);
      return lerp(v, 1, E.inQuint(t)); // fold the tail so t=1 is exactly 1
    },
  };
  // Signature curves.
  E.reel = bezierEasing(0.83, 0, 0.17, 1);       // the S1 graph-editor curve
  E.snap = bezierEasing(0.2, 0.9, 0.1, 1);       // fast attack, soft landing
  E.whip = bezierEasing(0.7, 0, 0.84, 0);        // accelerate away

  // ─── Beat grid (120 BPM, 4/4) ───────────────────────────────────────────────
  const beatIndex = (T) => Math.floor(T / BEAT + 1e-9);
  const beatPhase = (T) => fract(T / BEAT + 1e-9);
  /** Exponential decay since the most recent beat (1 on the beat → 0). */
  const beatPulse = (T, decay = 8) => Math.exp(-decay * beatPhase(T) * BEAT);
  const beatTime = (n) => n * BEAT;

  // ─── Deterministic randomness ───────────────────────────────────────────────
  function rng(seed = 1) {
    let a = seed >>> 0;
    const next = () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    next.range = (lo, hi) => lo + (hi - lo) * next();
    next.int = (lo, hi) => Math.floor(lo + (hi - lo + 1) * next());
    next.pick = (arr) => arr[Math.floor(next() * arr.length)];
    next.sign = () => (next() < 0.5 ? -1 : 1);
    next.gauss = () => { let u = 0, v = 0; while (u === 0) u = next(); while (v === 0) v = next(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); };
    return next;
  }
  /** Stateless hash → [0,1). */
  function hash(i, seed = 0) {
    let h = Math.imul((i | 0) ^ Math.imul(seed | 0, 0x9E3779B1), 0x85EBCA6B);
    h ^= h >>> 13; h = Math.imul(h, 0xC2B2AE35); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  // ─── Simplex noise (seeded) ─────────────────────────────────────────────────
  const noise = (() => {
    const perm = new Uint8Array(512);
    const r = rng(20260927);
    const p = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    const g3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
    const F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;
    function n2(xin, yin) {
      const s = (xin + yin) * F2, i = Math.floor(xin + s), j = Math.floor(yin + s);
      const t = (i + j) * G2, x0 = xin - (i - t), y0 = yin - (j - t);
      const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
      const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2, x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
      const ii = i & 255, jj = j & 255;
      let n = 0, tt, g;
      tt = 0.5 - x0 * x0 - y0 * y0; if (tt > 0) { g = g3[perm[ii + perm[jj]] % 12]; tt *= tt; n += tt * tt * (g[0] * x0 + g[1] * y0); }
      tt = 0.5 - x1 * x1 - y1 * y1; if (tt > 0) { g = g3[perm[ii + i1 + perm[jj + j1]] % 12]; tt *= tt; n += tt * tt * (g[0] * x1 + g[1] * y1); }
      tt = 0.5 - x2 * x2 - y2 * y2; if (tt > 0) { g = g3[perm[ii + 1 + perm[jj + 1]] % 12]; tt *= tt; n += tt * tt * (g[0] * x2 + g[1] * y2); }
      return 70 * n; // ~[-1, 1]
    }
    const F3 = 1 / 3, G3 = 1 / 6;
    function n3(xin, yin, zin) {
      const s = (xin + yin + zin) * F3;
      const i = Math.floor(xin + s), j = Math.floor(yin + s), k = Math.floor(zin + s);
      const t = (i + j + k) * G3;
      const x0 = xin - (i - t), y0 = yin - (j - t), z0 = zin - (k - t);
      let i1, j1, k1, i2, j2, k2;
      if (x0 >= y0) {
        if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
        else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
        else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
      } else {
        if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
        else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
        else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      }
      const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
      const x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3;
      const x3 = x0 - 1 + 3 * G3, y3 = y0 - 1 + 3 * G3, z3 = z0 - 1 + 3 * G3;
      const ii = i & 255, jj = j & 255, kk = k & 255;
      let n = 0, tt, g;
      tt = 0.6 - x0 * x0 - y0 * y0 - z0 * z0; if (tt > 0) { g = g3[perm[ii + perm[jj + perm[kk]]] % 12]; tt *= tt; n += tt * tt * (g[0] * x0 + g[1] * y0 + g[2] * z0); }
      tt = 0.6 - x1 * x1 - y1 * y1 - z1 * z1; if (tt > 0) { g = g3[perm[ii + i1 + perm[jj + j1 + perm[kk + k1]]] % 12]; tt *= tt; n += tt * tt * (g[0] * x1 + g[1] * y1 + g[2] * z1); }
      tt = 0.6 - x2 * x2 - y2 * y2 - z2 * z2; if (tt > 0) { g = g3[perm[ii + i2 + perm[jj + j2 + perm[kk + k2]]] % 12]; tt *= tt; n += tt * tt * (g[0] * x2 + g[1] * y2 + g[2] * z2); }
      tt = 0.6 - x3 * x3 - y3 * y3 - z3 * z3; if (tt > 0) { g = g3[perm[ii + 1 + perm[jj + 1 + perm[kk + 1]]] % 12]; tt *= tt; n += tt * tt * (g[0] * x3 + g[1] * y3 + g[2] * z3); }
      return 32 * n; // ~[-1, 1]
    }
    function fbm2(x, y, oct = 4) { let a = 0.5, f = 1, s = 0; for (let i = 0; i < oct; i++) { s += a * n2(x * f, y * f); f *= 2; a *= 0.5; } return s; }
    function fbm3(x, y, z, oct = 4) { let a = 0.5, f = 1, s = 0; for (let i = 0; i < oct; i++) { s += a * n3(x * f, y * f, z * f); f *= 2; a *= 0.5; } return s; }
    /** Divergence-free 2D flow at (x, y) evolving with z. Returns [vx, vy]. */
    function curl2(x, y, z = 0, e = 0.01) {
      const dy = (n3(x, y + e, z) - n3(x, y - e, z)) / (2 * e);
      const dx = (n3(x + e, y, z) - n3(x - e, y, z)) / (2 * e);
      return [dy, -dx];
    }
    return { n2, n3, fbm2, fbm3, curl2 };
  })();

  // ─── Colour ─────────────────────────────────────────────────────────────────
  const rgbCache = new Map();
  function hexToRgb(hex) {
    let c = rgbCache.get(hex);
    if (c) return c;
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map((x) => x + x).join('');
    c = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    rgbCache.set(hex, c);
    return c;
  }
  const rgba = (hex, a = 1) => { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; };
  function mixRgb(a, b, t) { const A = hexToRgb(a), B = hexToRgb(b); return [lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)]; }
  const mix = (a, b, t, alpha = 1) => { const [r, g, bl] = mixRgb(a, b, t); return `rgba(${r | 0},${g | 0},${bl | 0},${alpha})`; };
  /** Sample a multi-stop ramp of hex colours at t ∈ [0,1]. */
  function ramp(stops, t, alpha = 1) {
    t = clamp(t) * (stops.length - 1);
    const i = Math.min(stops.length - 2, Math.floor(t));
    return mix(stops[i], stops[i + 1], t - i, alpha);
  }

  // ─── Geometry & drawing helpers ─────────────────────────────────────────────
  function circlePath(ctx, x, y, r) { ctx.moveTo(x + r, y); ctx.arc(x, y, Math.max(0, r), 0, TAU); }
  function fillCircle(ctx, x, y, r, color) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); ctx.fillStyle = color; ctx.fill(); }
  function roundRectPath(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function polyPath(ctx, pts, close = true) {
    if (!pts.length) return;
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if (close) ctx.closePath();
  }
  /** Distance from centre of a unit regular n-gon boundary at angle a (circumradius 1). */
  function ngonRadius(n, a) {
    const k = Math.PI / n;
    return Math.cos(k) / Math.cos(((a % (2 * k)) + 2 * k) % (2 * k) - k);
  }
  /**
   * `count` points around a named shape, sampled at the same polar angles for
   * every kind so shapes morph cleanly with morphPts(). Kinds: circle, square,
   * triangle, diamond, hex, star, plus ('ngon:5', 'star:6:0.45').
   */
  function shapePts(kind, cx, cy, r, count = 120, rot = 0) {
    const [name, a1, a2] = String(kind).split(':');
    const pts = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU;
      let rr = 1;
      if (name === 'square') rr = ngonRadius(4, a - Math.PI / 4) * Math.SQRT2 * 0.8;
      else if (name === 'diamond') rr = ngonRadius(4, a);
      else if (name === 'triangle') rr = ngonRadius(3, a + Math.PI / 2) * 1.1;
      else if (name === 'hex') rr = ngonRadius(6, a);
      else if (name === 'ngon') rr = ngonRadius(+a1 || 5, a + Math.PI / 2);
      else if (name === 'star') {
        // straight edges between tip (r=1, φ=0) and valley (r=inner, φ=k)
        const n = +a1 || 5, inner = +a2 || 0.45, k = Math.PI / n;
        let phi = ((((a + Math.PI / 2) % (2 * k)) + 2 * k) % (2 * k));
        if (phi > k) phi = 2 * k - phi;
        const dx = inner * Math.cos(k) - 1, dy = inner * Math.sin(k);
        rr = dy / (Math.cos(phi) * dy - Math.sin(phi) * dx);
      }
      const ang = a + rot;
      pts.push([cx + Math.cos(ang) * r * rr, cy + Math.sin(ang) * r * rr]);
    }
    return pts;
  }
  const morphPts = (A, B, t) => A.map((p, i) => [lerp(p[0], B[i][0], t), lerp(p[1], B[i][1], t)]);
  /** Resample a polyline/polygon to n points evenly spaced by arc length. */
  function resample(pts, n, closed = true) {
    const P = closed ? pts.concat([pts[0]]) : pts;
    const d = [0];
    for (let i = 1; i < P.length; i++) d.push(d[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const total = d[d.length - 1], out = [];
    let j = 1;
    for (let i = 0; i < n; i++) {
      const target = (i / (closed ? n : n - 1)) * total;
      while (j < d.length - 1 && d[j] < target) j++;
      const t = invLerp(d[j - 1], d[j], target);
      out.push([lerp(P[j - 1][0], P[j][0], t), lerp(P[j - 1][1], P[j][1], t)]);
    }
    return out;
  }
  function cubicPoint(p0, p1, p2, p3, t) {
    const u = 1 - t;
    return [
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ];
  }
  /** Points along a cubic bezier from s=0 to s=tEnd (for "draw-on" strokes). */
  function cubicPts(p0, p1, p2, p3, tEnd = 1, steps = 96, tStart = 0) {
    const out = [];
    for (let i = 0; i <= steps; i++) out.push(cubicPoint(p0, p1, p2, p3, lerp(tStart, tEnd, i / steps)));
    return out;
  }

  /**
   * Letter layout with real kerning: returns [{ch, x, w, i}] where x is the
   * left edge of each glyph relative to the string's aligned origin.
   * Uses ctx.font / ctx.letterSpacing as currently set.
   */
  function layoutLetters(ctx, text, align = 'left') {
    const total = ctx.measureText(text).width;
    const off = align === 'center' ? -total / 2 : align === 'right' ? -total : 0;
    const out = [];
    for (let i = 0; i < text.length; i++) {
      const x = ctx.measureText(text.slice(0, i)).width;
      const w = ctx.measureText(text[i]).width;
      out.push({ ch: text[i], x: off + x, w, i, total });
    }
    return out;
  }

  /**
   * Sample filled pixels of rendered text into points (logical px).
   * Deterministic and resolution-independent. Call in init(), not per frame.
   */
  function textPoints(text, fontStr, { x = W / 2, y = H / 2, step = 6, align = 'center', baseline = 'middle', letterSpacing = '0px', jitter = 0, seed = 7 } = {}) {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.font = fontStr; g.letterSpacing = letterSpacing; g.textAlign = align; g.textBaseline = baseline;
    g.fillStyle = '#fff'; g.fillText(text, x, y);
    const data = g.getImageData(0, 0, W, H).data, pts = [], r = rng(seed);
    for (let yy = 0; yy < H; yy += step) for (let xx = 0; xx < W; xx += step) {
      if (data[(yy * W + xx) * 4 + 3] > 128) pts.push([xx + (r() - 0.5) * jitter, yy + (r() - 0.5) * jitter]);
    }
    return pts;
  }

  // ─── 3D ─────────────────────────────────────────────────────────────────────
  const v3 = {
    rotX: ([x, y, z], a) => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)],
    rotY: ([x, y, z], a) => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)],
    rotZ: ([x, y, z], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z],
    add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    scale: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
    dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
    norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  };
  /** Perspective projection of camera-space point (z forward, +y up). */
  function project([x, y, z], { f = 1100, cx = W / 2, cy = H / 2 } = {}) {
    const s = f / Math.max(1e-3, z);
    return [cx + x * s, cy - y * s, s];
  }

  /** Scene hand-off contracts live in the film kit (src/kit/core.js → RB.shots). */
  const shared = {};

  // ─── Offscreen buffers (resolution-aware) ───────────────────────────────────
  const buffers = new Map();
  /**
   * Cached offscreen canvas of logical size lw×lh. Its context is pre-scaled
   * to the render scale, so draw in logical px and blit back with
   * ctx.drawImage(buf.canvas, x, y, lw, lh).
   */
  function buffer(key, lw = W, lh = H) {
    const s = REEL.scale;
    const id = `${key}@${lw}x${lh}@${s}`;
    let b = buffers.get(id);
    if (!b) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(lw * s));
      canvas.height = Math.max(1, Math.round(lh * s));
      const ctx = canvas.getContext('2d');
      b = { canvas, ctx, lw, lh, clear(color) { ctx.setTransform(1, 0, 0, 1, 0, 0); if (color) { ctx.fillStyle = color; ctx.fillRect(0, 0, canvas.width, canvas.height); } else ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.setTransform(s, 0, 0, s, 0, 0); } };
      buffers.set(id, b);
    }
    b.ctx.setTransform(s, 0, 0, s, 0, 0);
    b.ctx.globalAlpha = 1; b.ctx.globalCompositeOperation = 'source-over'; b.ctx.filter = 'none';
    return b;
  }
  /** ctx.filter / shadowBlur work in backing pixels — convert logical px. */
  const px = (n) => n * REEL.scale;
  const blur = (n) => `blur(${(n * REEL.scale).toFixed(2)}px)`;

  // ─── Scene registry & composition ───────────────────────────────────────────
  const scenes = [];
  /**
   * Register a scene:
   *   { id, index, label, start, end, init?(env), draw(ctx, t, env),
   *     rail?(t, env) → { alpha, active: 1|2|3, progress: 0..1 },
   *     post?(t, env) → { bloom?, vignette?, grain? } }
   * `t` is local seconds since the scene's start.
   */
  function scene(def) { scenes.push(def); scenes.sort((a, b) => a.start - b.start); }
  /** A chapter (HUD index) may span several scene files, e.g. the two montage halves. */
  const chapterCount = () => scenes.reduce((m, s) => Math.max(m, s.index || 0), 0);
  const chapterStarts = () => scenes.filter((s, i) => i === 0 || scenes[i - 1].index !== s.index);
  const sceneAt = (T) => scenes.find((s) => T >= s.start && T < s.end) || (T >= DURATION ? scenes[scenes.length - 1] : null);

  function resetCtx(ctx) {
    const s = REEL.scale;
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
    ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '0px'; ctx.setLineDash([]);
  }

  /** Draw scene content + HUD for absolute time T (no grain/vignette). */
  function renderContent(ctx, T) {
    T = clamp(T, 0, DURATION - 1e-6);
    resetCtx(ctx);
    ctx.fillStyle = PAL.graphite; ctx.fillRect(0, 0, W, H);
    const s = sceneAt(T);
    let railOpts = null;
    if (s) {
      const t = T - s.start;
      const env = { T, t, dur: s.end - s.start, p: (T - s.start) / (s.end - s.start), W, H, scene: s, scale: REEL.scale };
      ctx.save();
      try { s.draw(ctx, t, env); } catch (e) { REEL.errors.push(`${s.id}@${T.toFixed(3)}: ${e && e.stack || e}`); }
      ctx.restore();
      resetCtx(ctx);
      if (s.rail) { try { railOpts = s.rail(t, env) || null; } catch (e) { REEL.errors.push(`${s.id}.rail: ${e}`); } }
    }
    if (REEL.showHud && railOpts) drawRail(ctx, T, railOpts);
  }

  function timecode(T) {
    const f = Math.floor(T * FPS + 1e-6), ff = f % FPS, s = Math.floor(f / FPS);
    const p2 = (n) => String(n).padStart(2, '0');
    return `00:00:${p2(s)}:${p2(ff)}`;
  }

  // ─── Chapter rail: 01 Understand · 02 Make · 03 Renew (echoes the website) ─
  const RAIL = [['01', 'UNDERSTAND'], ['02', 'MAKE'], ['03', 'RENEW']];
  function drawRail(ctx, T, o) {
    const alpha = clamp(o.alpha == null ? 1 : o.alpha);
    if (alpha <= 0.001) return;
    const x0 = 96, y = H - 70, step = 190;
    ctx.save();
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '2.2px';
    ctx.globalAlpha = alpha * 0.22;
    ctx.fillStyle = PAL.ivory;
    ctx.fillRect(x0, y + 20, step * 3 - 30, 1);
    RAIL.forEach(([n, label], i) => {
      const on = o.active === i + 1;
      const x = x0 + i * step;
      ctx.globalAlpha = alpha * (on ? 1 : 0.38);
      ctx.font = font(12, 'mono', 700);
      ctx.fillStyle = on ? PAL.ember : PAL.ivory;
      ctx.fillText(n, x, y);
      ctx.font = font(12, 'mono', 400);
      ctx.fillStyle = PAL.ivory;
      ctx.fillText(label, x + 30, y);
      if (on) {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = PAL.copperHot;
        ctx.fillRect(x, y + 19, (step - 30) * clamp(o.progress == null ? 1 : o.progress), 3);
      }
    });
    ctx.restore();
  }

  // ─── Post: bloom + vignette + grain (applied once per output frame) ────────
  let grainTiles = null, vignette = null, bloomBufs = null;
  function buildPost() {
    grainTiles = [];
    for (let k = 0; k < 6; k++) {
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const g = c.getContext('2d'), img = g.createImageData(256, 256), r = rng(900 + k);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = 128 + r.gauss() * 38;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      grainTiles.push(c);
    }
    vignette = null;
  }
  /** Scene-controlled post settings at time T: { bloom, vignette, grain }. */
  function postOpts(T) {
    const o = { bloom: 0.35, vignette: 0.42, grain: REEL.grain };
    const s = sceneAt(clamp(T, 0, DURATION - 1e-6));
    if (s && s.post) {
      try { Object.assign(o, s.post(T - s.start, { T, t: T - s.start, dur: s.end - s.start, W, H, scene: s }) || {}); }
      catch (e) { REEL.errors.push(`${s.id}.post: ${e}`); }
    }
    return o;
  }
  function post(ctx, T, frame) {
    if (!grainTiles) buildPost();
    const o = postOpts(T);
    const s = REEL.scale, cw = ctx.canvas.width, ch = ctx.canvas.height;
    ctx.globalAlpha = 1; ctx.filter = 'none';
    // bloom — soft glow around bright highlights (copper, embers, type)
    if (o.bloom > 0) {
      const bw = Math.max(1, Math.round(cw / 6)), bh = Math.max(1, Math.round(ch / 6));
      if (!bloomBufs || bloomBufs.a.width !== bw || bloomBufs.a.height !== bh) {
        const mk = () => { const c = document.createElement('canvas'); c.width = bw; c.height = bh; return c; };
        bloomBufs = { a: mk(), b: mk() };
      }
      const ga = bloomBufs.a.getContext('2d'), gb = bloomBufs.b.getContext('2d');
      ga.setTransform(1, 0, 0, 1, 0, 0); ga.globalCompositeOperation = 'copy'; ga.filter = 'brightness(0.85) contrast(2.4) saturate(1.2)';
      ga.drawImage(ctx.canvas, 0, 0, bw, bh); ga.filter = 'none';
      gb.setTransform(1, 0, 0, 1, 0, 0); gb.globalCompositeOperation = 'copy'; gb.filter = `blur(${Math.max(1, bw / 90).toFixed(2)}px)`;
      gb.drawImage(bloomBufs.a, 0, 0); gb.filter = 'none';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = clamp(o.bloom);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bloomBufs.b, 0, 0, cw, ch);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    ctx.setTransform(s, 0, 0, s, 0, 0);
    // vignette
    if (!vignette || vignette.scale !== s) {
      const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 1.02);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
      vignette = { g, scale: s };
    }
    if (o.vignette > 0) {
      ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = clamp(o.vignette);
      ctx.fillStyle = vignette.g; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    // grain — tile a noise texture with a per-frame offset, soft-light blend
    if (o.grain > 0) {
      const tile = grainTiles[((frame % grainTiles.length) + grainTiles.length) % grainTiles.length];
      const ox = Math.floor(hash(frame, 3) * 256), oy = Math.floor(hash(frame, 4) * 256);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'soft-light';
      ctx.globalAlpha = o.grain;
      for (let y = -oy; y < ch; y += 256) for (let x = -ox; x < cw; x += 256) ctx.drawImage(tile, x, y);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.setTransform(s, 0, 0, s, 0, 0);
  }

  async function loadFonts() {
    await Promise.all(FONT_FACES.map((f) => document.fonts.load(f)));
    await document.fonts.ready;
  }

  async function init() {
    await loadFonts();
    for (const s of scenes) {
      if (s.init) {
        try { await s.init({ W, H, scene: s }); } catch (e) { REEL.errors.push(`${s.id}.init: ${e && e.stack || e}`); }
      }
    }
  }

  const REEL = {
    W, H, FPS, DURATION, FRAMES, BPM, BEAT, TAU, PAL, FAMILY,
    scale: 1, grain: 0.16, showHud: true, errors: [],
    /** Sub-pixel camera jitter [x, y] in backing px, set per motion-blur sub-sample by the runtime. */
    jitter: [0, 0], live: false,
    font, clamp, lerp, invLerp, remap, fract, smoothstep, seg, ease, lerpAngle, stagger, tween, E,
    beatIndex, beatPhase, beatPulse, beatTime,
    rng, hash, noise,
    hexToRgb, rgba, mix, mixRgb, ramp,
    circlePath, fillCircle, roundRectPath, polyPath, shapePts, morphPts, resample, cubicPoint, cubicPts,
    layoutLetters, textPoints,
    v3, project,
    shared, buffer, px, blur,
    scenes, scene, sceneAt, chapterStarts, chapterCount, renderContent, post, drawRail, timecode, init, loadFonts, resetCtx,
  };
  window.REEL = REEL;
})();
