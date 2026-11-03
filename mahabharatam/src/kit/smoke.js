/*
 * KIT.smoke · rising sacrificial smoke, painted as soft curling ribbons with
 * mural volutes.
 *
 *   KIT.smoke.draw(g, x, y, T, o)
 *     o = { h (rise height px), w (base width), strands, alpha, color, lean (px at the top),
 *           speed, seed, curls (0..1 volute strength), spread (0..1 widening) }
 *   KIT.smoke.strand(j, s, T, o)   → [x, y] of strand j at height fraction s (for effects
 *                                     that sit "in" the smoke, e.g. visions, leaves)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, hash, noise } = R;

  function strand(j, s, T, o) {
    const seed = (o.seed || 0) + j * 17;
    const sp = o.speed || 1;
    const ph = hash(j, seed) * TAU;
    const amp = (o.w || 60) * (0.35 + 1.6 * s * (o.spread ?? 1));
    const wav = Math.sin(s * 5.5 - T * 1.7 * sp + ph) * 0.55 + noise.n2(s * 2.2 + j * 3.1, T * 0.45 * sp + seed) * 0.6;
    const x = o.x0 + (hash(j, seed + 1) - 0.5) * (o.w || 60) * 0.6 + wav * amp + (o.lean || 0) * s * s;
    const y = o.y0 - s * (o.h || 600);
    return [x, y];
  }

  const smokeSprites = new Map();
  function puff(col) {
    let c = smokeSprites.get(col);
    if (c) return c;
    c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), [r, gg, b] = R.hexToRgb(col);
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    for (let i = 0; i <= 8; i++) { const u = i / 8; grd.addColorStop(u, `rgba(${r},${gg},${b},${(Math.exp(-u * u * 3.5) * (1 - u)).toFixed(4)})`); }
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    smokeSprites.set(col, c);
    return c;
  }

  function draw(g, x, y, T, o = {}) {
    const n = o.strands || 5, a0 = o.alpha ?? 0.5, h = o.h || 600, w = o.w || 60;
    const oo = { ...o, x0: x, y0: y };
    const col = o.color || '#8f8aa6';
    const [cr, cg, cb] = R.hexToRgb(col);
    const sprite = puff(col);
    const fadeOutAt = o.fadeOutAt ?? 0.55;
    const env = (s) => clamp(s / 0.08) * (1 - clamp((s - fadeOutAt) / (1 - fadeOutAt)));
    g.save();
    for (let j = 0; j < n; j++) {
      const N = 36;
      const pts = [];
      for (let k = 0; k <= N; k++) pts.push(strand(j, k / N, T, oo));
      // soft volume: overlapping puffs along the strand
      for (let k = 1; k <= N; k += 2) {
        const s = k / N, a = a0 * 0.22 * env(s);
        if (a < 0.004) continue;
        const r = w * (0.6 + 2.2 * s);
        g.globalAlpha = a;
        g.drawImage(sprite, pts[k][0] - r, pts[k][1] - r, 2 * r, 2 * r);
      }
      g.globalAlpha = 1;
      // the painted ribbon: two tiers, filled, faded along its length
      for (const [wf, af] of [[0.5, 0.26], [0.18, 0.45]]) {
        const ws = pts.map((_, k) => w * wf * (0.35 + 1.5 * (k / N)));
        g.beginPath();
        KIT.limbOutline(g, pts, ws);
        const gr = g.createLinearGradient(0, y, 0, y - h);
        for (let i = 0; i <= 8; i++) { const s = i / 8; gr.addColorStop(s, `rgba(${cr},${cg},${cb},${(a0 * af * env(s)).toFixed(3)})`); }
        g.fillStyle = gr;
        g.fill();
      }
      // volute: a painted curl where the strand breaks up
      if ((o.curls ?? 0.7) > 0) {
        const s0 = 0.3 + 0.35 * hash(j, 77 + (o.seed || 0)) + 0.05 * Math.sin(T * 0.6 + j);
        const p = strand(j, s0, T, oo);
        const dir = hash(j, 91) < 0.5 ? -1 : 1, rad = w * (0.35 + 0.7 * s0);
        g.strokeStyle = `rgba(${cr},${cg},${cb},${(a0 * 0.6 * (o.curls ?? 0.7) * env(s0)).toFixed(3)})`;
        g.lineWidth = Math.max(1.5, w * 0.07); g.lineCap = 'round';
        g.beginPath();
        for (let k = 0; k <= 40; k++) {
          const u = k / 40, ang = dir * (u * TAU * 1.35 + T * 0.8 + j), rr = rad * (1 - u * 0.85);
          const px = p[0] + Math.cos(ang) * rr, py = p[1] + Math.sin(ang) * rr * 0.8;
          if (k) g.lineTo(px, py); else g.moveTo(px, py);
        }
        g.stroke();
      }
    }
    g.restore();
  }

  KIT.smoke = { draw, strand };
})();
