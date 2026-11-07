/* Ep 31 · line "still" · "And he holds it still, to this day." · The wide cutaway: the earth at rest on the pearl canopy in the dark, the towns lit; a slow pull out. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA;
  const { clamp, E, lerp } = R;
  R.scene({
    id: 'still',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EPA.under(ctx, T, { glow: 1, cam: { zoom: lerp(1.15, 0.78, p), dy: lerp(-120, 80, p) }, after: (g) => {
        EPA.shesha(g, 540, 1900, 0.8, T, { k: 1, sway: 0.3, light: EPA.lit(540, 1600, 540, 2400, 1.1, 0.7, 0.4), key: 'st31-sh' });
        EPA.earth(g, 540, 450, 1150, T, { lights: clamp((t - env.beats[0]) / 0.8) });
      } });
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }),
  });
})();
