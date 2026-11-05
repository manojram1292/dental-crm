/* Ep 24 · line "omens" · "Then, in heaven, there were omens." · Heaven at night, wide: meteors streak over the dark cloud-palaces, the red haze rising; no figure yet. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP24 = window.EP24;
  const { clamp } = R;
  R.scene({
    id: 'omens',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      ctx.save(); KIT.camera(ctx, { x: 540, y: 960, zoom: 1.12 - 0.1 * p }); EP24.night(ctx, T * 1.6, { omens: 0.3 + 0.7 * p }); ctx.restore();
    },
    post: () => ({ bloom: 0.44, vignette: 0.48, paper: 0.3 }),
  });
})();
