/* Ep 23 · line "divide" · "Supratika wanted their wealth divided." · The panel, closer: a heap of gold between the brothers; the younger brother stands and his hand cuts the air; the heap splits in two. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP23 = window.EP23;
  const { clamp, E, lerp } = R;
  R.scene({
    id: 'divide',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const b1 = env.beats[1] ?? 1.6, sp = E.inOutCubic(clamp((t - b1 + 0.4) / 0.6));
      EP23.panel(ctx, T, {});
      ctx.save(); KIT.camera(ctx, { x: 540, y: 1300, zoom: 1.25 + 0.05 * p, dy: -80 });
      EP23.brothers(ctx, T, { youngerPose: { name: 'speak', k: E.inOutSine(clamp(t / 0.6)) } });
      for (let i = 0; i < 18; i++) { const side = i % 2 ? 1 : -1, x = 540 + (Math.floor(i / 2) % 3 - 1) * 26 + side * 70 * sp, y = 1470 - Math.floor(i / 6) * 22; ctx.fillStyle = i % 3 ? '#f0c050' : '#ffe090'; ctx.beginPath(); ctx.ellipse(x, y, 22, 10, 0, 0, R.TAU); ctx.fill(); }
      KIT.glow(ctx, 540, 1440, 160, '#ffd060', 0.5);
      ctx.restore();
      void lerp;
    },
    post: () => ({ bloom: 0.32, vignette: 0.44, paper: 0.4 }),
  });
})();
