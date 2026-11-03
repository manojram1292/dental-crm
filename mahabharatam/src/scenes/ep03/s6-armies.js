/*
 * Ep 3 · line "armies" · "Eighteen such armies gathered on that field."
 *
 * The field of five lakes from episode 2 (EP2.mandala: the bhupura, the lotus ring,
 * the five lakes, holy and clear now), seen from above and a little tilted, like a
 * map laid on a table. On each of the 18 ticks (env.line.ticks) one army block
 * slides into place: eleven Kaurava akshauhinis (terracotta) in two ranks along the
 * top, then seven Pandava akshauhinis (indigo) along the bottom, facing them across
 * the lakes. Each block is a massed field of patti tiles with a gold border and its
 * own banner; a puff of dust where it lands. The side names count up with them.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP2 = window.EP2, EP3 = window.EP3;
  const { clamp, lerp, E, PAL, hash } = R;
  const A = KIT.army;

  const VIEW = { cx: 540, cy: 770, s: 0.9, tilt: 0.6 };
  const SIDES = [
    { col: '#9a3a1c', edge: '#e7b54a', banner: '#d0602a', top: true },
    { col: '#2c3c78', edge: '#e7b54a', banner: '#7a8ad8', top: false },
  ];
  /** Block slots in plan coordinates: [x, y, w, h, side]. 11 on top (6 + 5), 7 below (4 + 3). */
  const BW = 128, BH = 92;
  const SLOTS = [];
  for (let i = 0; i < 6; i++) SLOTS.push([60 + i * 160, -270, BW, BH, 0]);
  for (let i = 0; i < 5; i++) SLOTS.push([140 + i * 160, -160, BW, BH, 0]);
  for (let i = 0; i < 4; i++) SLOTS.push([140 + i * 200, 1080, BW, BH, 1]);
  for (let i = 0; i < 3; i++) SLOTS.push([240 + i * 200, 1190, BW, BH, 1]);
  const toScreen = (x, y) => [VIEW.cx + (x - 500) * VIEW.s, VIEW.cy + (y - 500) * VIEW.s * VIEW.tilt];

  R.scene({
    id: 'armies',
    fadeIn: 0.7,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur, 0, 1.3);
      const ticks = (env.line.ticks || []).map((x) => x - env.line.start);
      ctx.fillStyle = '#1a1009'; ctx.fillRect(0, 0, R.W, R.H);
      // the field, tilted
      ctx.save();
      KIT.camera(ctx, { x: 540, y: 770, zoom: lerp(1.06, 1.0, E.inOutSine(p)) });
      ctx.translate(VIEW.cx, VIEW.cy);
      ctx.scale(VIEW.s, VIEW.s * VIEW.tilt);
      ctx.translate(-500, -500);
      EP2.mandala(ctx, T, [1, 1, 1, 1, 1], { red: 0, clear: 1 });
      // the blocks (in plan space: they lie flat on the field)
      SLOTS.forEach(([x, y, w, h, si], i) => {
        const tk = ticks[i] ?? (i / 18) * dur * 0.7;
        const u = clamp((t - (tk - 0.32)) / 0.32);
        if (u <= 0) return;
        const sd = SIDES[si];
        const from = sd.top ? -900 : 1900;
        const yy = lerp(from, y, E.outCubic(u));
        ctx.save();
        ctx.globalAlpha = clamp(u * 2);
        ctx.fillStyle = sd.col; ctx.fillRect(x, yy, w, h);
        // massed patti tiles over the colour
        ctx.globalAlpha = 0.55 * clamp(u * 2);
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = A.pattern(ctx, x, yy, 16, 16 / A.TILE.aspect, 16 * VIEW.s);
        ctx.fillRect(x, yy, w, h);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = clamp(u * 2);
        ctx.strokeStyle = sd.edge; ctx.lineWidth = 4; ctx.strokeRect(x, yy, w, h);
        ctx.restore();
        // dust where it lands
        const age = t - tk;
        if (age > 0 && age < 1.5) KIT.glow(ctx, x + w / 2, y + h / 2, 160, '#e8c8a0', 0.45 * Math.exp(-age / 0.35));
      });
      ctx.restore();
      // banners stand up out of the map (in screen space, so they are not flattened)
      SLOTS.forEach(([x, y, w, h, si], i) => {
        const tk = ticks[i] ?? (i / 18) * dur * 0.7;
        const u = E.outBack(clamp((t - tk) / 0.35));
        if (u <= 0) return;
        const [sx, sy] = toScreen(x + 16, y + h * 0.5);
        const z = lerp(1.06, 1.0, E.inOutSine(p));
        const X = 540 + (sx - 540) * z, Y = 770 + (sy - 770) * z;
        const hgt = 70 * u, wave = Math.sin(T * 4 + i) * 4;
        ctx.save();
        ctx.fillStyle = '#120806'; ctx.fillRect(X - 2, Y - hgt, 4, hgt);
        ctx.fillStyle = SIDES[si].banner;
        ctx.beginPath(); ctx.moveTo(X + 2, Y - hgt); ctx.lineTo(X + 34, Y - hgt + 8 + wave); ctx.lineTo(X + 2, Y - hgt + 20); ctx.fill();
        ctx.fillStyle = PAL.gold; ctx.beginPath(); ctx.arc(X, Y - hgt, 3.5, 0, R.TAU); ctx.fill();
        ctx.restore();
      });
      // the side names, counting up as their blocks arrive
      const S = env.strings;
      const nA = ticks.filter((x, i) => i < 11 && t >= x).length, nB = ticks.filter((x, i) => i >= 11 && t >= x).length;
      const la = E.outCubic(clamp((t - (ticks[0] ?? 0) + 0.2) / 0.5)), lb = E.outCubic(clamp((t - (ticks[11] ?? 1) + 0.2) / 0.5));
      if (la > 0) KIT.goldText(ctx, `${(S.sideA || '').toUpperCase()} · ${nA}`, KIT.CX, 232, { size: 46, spacing: 6, weight: 600, alpha: la, glow: 0.25, key: 'side-a' });
      if (lb > 0) KIT.goldText(ctx, `${(S.sideB || '').toUpperCase()} · ${nB}`, KIT.CX, 1250, { size: 46, spacing: 6, weight: 600, alpha: lb, glow: 0.25, key: 'side-b' });
      void hash;
    },
    post: () => ({ bloom: 0.36, vignette: 0.55, paper: 0.34 }),
  });
})();
