/* Ep 26 · line "omens" · "Heaven filled with omens: wild winds, falling stars, and a rain of blood." · NEW LIGHT: heaven's courtyard under a bruised green-violet storm: banners torn, meteors, red rain-streaks; the camera drifts across the colonnade. Unvoiced recap band first 2.6 s. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP26 = window.EP26;
  const { clamp, lerp } = R;
  R.scene({
    id: 'omens',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP26.court(ctx, T, { storm: lerp(0.5, 1, p), pot: 1, cam: { zoom: 1.0, dx: lerp(80, -80, p) } });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.6) / 0.35)), env.strings, { y: 1640 });
    },
    post: () => ({ bloom: 0.4, vignette: 0.44, paper: 0.3 }),
  });
})();
