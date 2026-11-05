/* Ep 23 · line "eat" · Kashyapa: "Eat them both, my son. Then go for the amrita." · The mountain ledge at dawn from a new angle: low, Kashyapa against the rose sky, his hand raised in blessing. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP22 = window.EP22, EP23 = window.EP23;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'eat',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP22.peak(ctx, T, { cam: { zoom: 2.2 + 0.08 * p, dx: 460, dy: -330 }, after: (g) => {
        CH.kashyapa.draw(g, { x: 330, y: 1430, scale: 0.55, facing: 'right', pose: { name: 'bless', base: 'sit', k: E.inOutSine(clamp(t / 0.7)) }, expression: { speak: EP23.mouth(env, t) }, light: EP22.dawn(330, 1430, 1.15), t: T, key: 'e23-ka' });
      } });
    },
    post: () => ({ bloom: 0.36, vignette: 0.46, paper: 0.32 }),
  });
})();
