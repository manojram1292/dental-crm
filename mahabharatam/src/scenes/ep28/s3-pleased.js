/* Ep 28 · line "pleased" · Vishnu: "You held the amrita, and did not drink it. I am pleased. Choose a boon." · Vishnu frontal and LARGE in the dawn sky, his hand opening in blessing. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP28 = window.EP28;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'pleased',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP28.dawnSky(ctx, T, { cam: { zoom: 1.0, dy: 200 } });
      KIT.glow(ctx, 540, 1100, 800, '#6a9aff', 0.4, 'lighter', 0.4);
      CH.vishnu.draw(ctx, { x: 540, y: 2450 - 30 * p, scale: 1.45, facing: 'front', pose: { name: 'bless', k: E.inOutSine(clamp(t / 0.8)) }, expression: { speak: EP28.mouth(env, t) }, light: EP28.dawn(540, 2450, 1.15), t: T, key: 'p28-vi' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.44, paper: 0.3 }),
  });
})();
