/* Ep 27 · line "fire" · "First, a fire that reached the sky." · NEW LIGHT: the inner court all on fire: a wall of flame floor to sky; Garuda small and dark before it. Unvoiced recap band for the first 2.6 s. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP27 = window.EP27;
  const { clamp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'fire',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP27.blaze(ctx, T, {});
      CH.garuda.draw(ctx, { x: 540, y: 1900 - 30 * p, scale: 0.5, facing: 'left', pose: { name: 'spread', k: 0.8 }, light: EP27.fireLight(540, 1900), t: T, key: 'f27-ga' });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.4) / 0.3)), env.strings, { y: 300 });
    },
    post: () => ({ bloom: 0.48, vignette: 0.46, paper: 0.3 }),
  });
})();
