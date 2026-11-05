/* Ep 30 · line "holy" · "And the kusha grass, touched by the amrita, became holy." · The kusha bed glows gold where the pot stood; dew on the blades catches the sunrise. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP30 = window.EP30;
  const { clamp, E } = R;
  R.scene({
    id: 'holy',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const g = E.inOutSine(clamp((t - (env.beats[1] ?? 1.5) + 0.6) / 1.2));
      EP30.dawnIsle(ctx, T, { cam: { zoom: 2.4 - 0.1 * p, dy: -820 } });
      EP30.kusha(ctx, 540, 1900, 2.4, T, { glow: g });
    },
    post: () => ({ bloom: 0.46, vignette: 0.42, paper: 0.3 }),
  });
})();
