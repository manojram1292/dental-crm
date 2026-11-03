/*
 * KIT.fire · the sacred fire (agni), the light source of every shot.
 *
 *   KIT.fire.draw(ctx, x, y, h, T, o)   painted flame standing on (x, y), h px tall
 *        o = { lean (-1..1, tips pulled sideways), intensity (0..1.2), width, seed,
 *              embers (bool), glow (0..1) }
 *   KIT.fire.pool(ctx, x, y, rx, ry, T, a)  warm light pooled on the ground
 *   KIT.fire.altar(ctx, x, y, w, T, o)      stepped brick homa-kunda the fire sits in
 *   KIT.fire.light(T, seed)                 = KIT.flicker
 *
 * The flame is four flat painted layers (vermilion, saffron, gold, cream core),
 * each a crown of S-curved tongues, the way temple murals paint fire.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, noise, PAL } = R;

  const LAYERS = [
    { color: '#a92f17', scale: 1.0, n: 9, wf: 1.0 },
    { color: '#e0601d', scale: 0.86, n: 8, wf: 0.86 },
    { color: PAL.saffron, scale: 0.7, n: 7, wf: 0.7 },
    { color: '#ffc44d', scale: 0.5, n: 5, wf: 0.52 },
    { color: '#fff0c2', scale: 0.26, n: 3, wf: 0.3 },
  ];

  function tongue(ctx, cx, by, bw, th, tipX, T, i, wave) {
    const N = 18, L = [], Rr = [];
    for (let k = 0; k <= N; k++) {
      const s = k / N;
      const c = lerp(cx, tipX, Math.pow(s, 1.6)) + Math.sin(s * Math.PI * 1.7 - T * 6.5 + i * 1.9) * th * wave * s;
      const w = bw * Math.pow(1 - s, 0.8) * (1 + 0.55 * Math.sin(Math.PI * s) * (1 - s));
      const y = by - th * s;
      L.push([c - w, y]); Rr.push([c + w, y]);
    }
    ctx.moveTo(L[0][0], L[0][1]);
    for (let k = 1; k <= N; k++) ctx.lineTo(L[k][0], L[k][1]);
    for (let k = N; k >= 0; k--) ctx.lineTo(Rr[k][0], Rr[k][1]);
    ctx.closePath();
  }

  function draw(ctx, x, y, h, T, o = {}) {
    const lean = o.lean || 0, inten = o.intensity ?? 1, seed = o.seed || 0;
    const fl = KIT.flicker(T, seed);
    const H0 = h * inten * (0.82 + 0.22 * fl);
    const width = (o.width || h * 0.62) * (0.9 + 0.1 * inten);
    if (o.glow !== 0) {
      KIT.glow(ctx, x + lean * h * 0.2, y - H0 * 0.45, H0 * 2.1, PAL.saffron, 0.42 * fl * inten * (o.glow ?? 1));
      KIT.glow(ctx, x + lean * h * 0.2, y - H0 * 0.35, H0 * 0.95, '#ffcf6b', 0.35 * fl * inten * (o.glow ?? 1));
    }
    ctx.save();
    for (let li = 0; li < LAYERS.length; li++) {
      const Ly = LAYERS[li];
      const n = Ly.n;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const u = n === 1 ? 0 : i / (n - 1) - 0.5;
        const bx = x + u * width * 0.78 * Ly.wf;
        const bw = width * 0.2 * Ly.wf * (1 - Math.abs(u) * 0.5);
        const jit = noise.n2(T * 2.2 + i * 3.3 + li * 11, seed + li * 5);
        const vary = 0.72 + 0.5 * R.hash(i * 7 + li, 3 + seed);
        const th = H0 * Ly.scale * (1 - 0.6 * Math.pow(Math.abs(u) * 2, 1.2)) * (0.8 + 0.28 * jit) * vary * (li === 4 ? 1 : 1);
        const tipX = lerp(bx, x, 0.45) + lean * th * 0.75 + noise.n2(T * 1.6 + i * 2.1, seed + 20 + li) * th * 0.16;
        tongue(ctx, bx, y, bw, th, tipX, T + li * 0.13, i + li * 3, 0.07 + 0.015 * li);
      }
      // rounded body at the base so the tongues read as one fire
      const bodyW = width * 0.48 * Ly.wf, bodyH = H0 * 0.2 * Ly.scale;
      ctx.moveTo(x + bodyW, y);
      ctx.ellipse(x + lean * bodyH * 0.3, y - bodyH * 0.25, bodyW, bodyH, 0, 0, TAU);
      ctx.fillStyle = Ly.color;
      ctx.fill();
    }
    ctx.restore();
    if (o.embers !== false) {
      KIT.embers(ctx, T, { x: x + lean * H0 * 0.4, y: y - H0 * 0.6, spread: width * 0.6, rate: 9 * inten, life: 2.4, rise: H0 * 0.85, sway: 26, size: Math.max(1.6, h / 90), alpha: 0.95, seed: 31 + seed, lean: lean * 1.2 });
    }
  }

  function pool(ctx, x, y, rx, ry, T, a = 1, seed = 0) {
    const fl = KIT.flicker(T, seed);
    KIT.glow(ctx, x, y, rx, PAL.saffron, 0.5 * a * fl, 'lighter', ry / rx);
    KIT.glow(ctx, x, y, rx * 0.5, '#ffbf5e', 0.35 * a * fl, 'lighter', ry / rx);
  }

  /**
   * Stepped homa-kunda (three mekhala tiers) in front of the fire, seen from a
   * little above. (x, y) = front-centre of the top rim. Returns the fire base y.
   * o = { light (0..1), lean }
   */
  function altar(ctx, x, y, w, T, o = {}) {
    const fl = KIT.flicker(T, o.seed || 0) * (o.light ?? 1);
    const tiers = [[1.0, 0.115], [0.84, 0.1], [0.68, 0.09]];
    let yy = y + tiers.reduce((s, t) => s + t[1] * w, 0);
    const depth = w * 0.16;
    for (let k = 0; k < tiers.length; k++) {
      const [ww, hh] = tiers[k];
      const half = (w * ww) / 2, th = hh * w, top = yy - th;
      // top face (parallelogram receding), lit by the fire
      ctx.beginPath();
      ctx.moveTo(x - half, top); ctx.lineTo(x + half, top);
      ctx.lineTo(x + half * 0.8, top - depth * ww * 0.5); ctx.lineTo(x - half * 0.8, top - depth * ww * 0.5);
      ctx.closePath();
      ctx.fillStyle = R.mix('#5a2a18', '#e09a4c', 0.35 + 0.5 * fl);
      ctx.fill();
      // front face
      ctx.fillStyle = R.mix('#2a120b', '#8e3d22', 0.45 + 0.35 * fl);
      ctx.fillRect(x - half, top, half * 2, th);
      // brick courses
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#1a0b07';
      ctx.fillRect(x - half, top + th * 0.5 - 1, half * 2, 2);
      const bricks = Math.round(half / 26);
      for (let b = 0; b <= bricks * 2; b++) {
        const bx = x - half + (b / (bricks * 2)) * half * 2 + ((b % 2) ? 13 : 0);
        if (bx < x + half - 4) ctx.fillRect(bx, top + (b % 2 ? th * 0.5 : 0), 2, th * 0.5);
      }
      ctx.restore();
      // gold lip where the light catches the edge
      ctx.fillStyle = R.rgba(PAL.goldPale, 0.35 + 0.45 * fl);
      ctx.fillRect(x - half, top - 1, half * 2, 2.5);
      yy = top - depth * ww * 0.5 * 0.0;
    }
    // the pit mouth (dark, glowing)
    const half = (w * 0.68) / 2 * 0.8, top = yy - depth * 0.68 * 0.5;
    ctx.beginPath();
    ctx.ellipse(x, top + depth * 0.17, half * 0.92, depth * 0.2, 0, 0, TAU);
    ctx.fillStyle = R.mix('#3a1408', '#ff9a3a', 0.5 + 0.4 * fl);
    ctx.fill();
    return top + depth * 0.2;
  }

  KIT.fire = { draw, pool, altar, light: KIT.flicker };
})();
