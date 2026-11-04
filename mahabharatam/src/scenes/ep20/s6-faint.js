/* Ep 20 · line "faint" · THE TURN · "In the heat, the serpents fainted." · Close on Garuda's back: the serpents' hoods droop and their rims dim one by one (beats[1]). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP20 = window.EP20;
  const { clamp, E } = R;
  R.scene({
    id: 'faint',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T;
      const b1 = env.beats[1] ?? 1.6;
      const fa = E.inOutSine(clamp((t - b1 + 1.0) / 1.2));
      KIT.vgrad(ctx, 0, R.H, [[0, '#fff4d0'], [1, '#e8904a']]);
      KIT.glow(ctx, 540, 0, 1200, '#ffffff', 0.7);
      ctx.save(); KIT.camera(ctx, { x: 540, y: 1000, zoom: 1.9, dx: -60, dy: 380 });
      EP20.carrier(ctx, 560, 1700, 0.75, T, { key: 'f20b', faint: fa, light: { dir: -Math.PI / 2, intensity: 1.15, front: 0.55 } });
      ctx.restore();
    },
    post: () => ({ bloom: 0.46, vignette: 0.4, paper: 0.28 }),
  });
})();
