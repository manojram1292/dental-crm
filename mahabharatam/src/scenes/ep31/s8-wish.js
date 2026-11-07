/* Ep 31 · line "wish" · "Let my mind delight in dharma, and in peace." · Close on Shesha's canopy in the rose light, lifting; the heads bow on "dharma"; a slow push. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA;
  const { clamp, E, lerp } = R;
  R.scene({
    id: 'wish',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      const bow = E.inOutSine(clamp((t - env.beats[1] + 0.3) / 0.6)) * (1 - 0.6 * clamp((t - env.beats[2]) / 0.8));
      EPA.penance(ctx, T, { place: 4, hz: 1700, rose: 1, cam: { zoom: 1.0 }, after: (g) => {
        EPA.shesha(g, 520, 2900, lerp(1.6, 1.75, p), T, { k: 1, w: 72, lean: -0.12 * bow, light: EPA.lit(520, 2000, 300, 900, 1.05, 0.8, 0.5), key: 'w31-sh' });
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.42, paper: 0.3 }),
  });
})();
