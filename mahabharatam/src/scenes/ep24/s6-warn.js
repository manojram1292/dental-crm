/* Ep 24 · line "warn" · Kashyapa: "Careful, my son. Their anger could burn you." · Kashyapa rises on the fragrant mountain, a hand lifted to stop Garuda (whose wing fills the right of the frame). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP24 = window.EP24;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'warn',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP24.gandha(ctx, T, { cam: { zoom: 1.7 + 0.05 * p, dx: 300, dy: -260 }, after: (g) => {
        CH.kashyapa.draw(g, { x: 330, y: 1560, scale: 0.6, facing: 'right', pose: { name: 'bless', k: E.inOutSine(clamp(t / 0.6)) }, expression: { speak: EP24.mouth(env, t) }, light: EP24.warm(330, 1560, 1.15), t: T, key: 'w24-ka' });
      } });
      CH.garuda.draw(ctx, { x: 1250, y: 2300, scale: 1.3, facing: 'left', pose: { name: 'stand' }, light: EP24.warm(1250, 2300, 1.0), t: T, key: 'w24-ga' });
    },
    post: () => ({ bloom: 0.36, vignette: 0.44, paper: 0.32 }),
  });
})();
