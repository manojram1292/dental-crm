/* Ep 22 · line "hungry" · Garuda: "I go for the amrita, and I am still hungry. Show me other food." · A two-shot from behind Kashyapa: Garuda kneels before his father on the ledge. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP22 = window.EP22;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hungry',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP22.peak(ctx, T, { cam: { zoom: 1.5 + 0.05 * p, dx: -80, dy: -320 }, after: (g) => {
        CH.garuda.draw(g, { x: 700, y: 1430, scale: 0.5, facing: 'left', pose: { name: 'bow', k: 0.5 }, expression: { speak: EP22.mouth(env, t) }, light: EP22.dawn(700, 1430, 1.15), t: T, key: 'hu22-ga' });
      } });
      CH.kashyapa.draw(ctx, { x: 200, y: 2150, scale: 1.1, facing: 'right', pose: 'sit', light: EP22.dawn(200, 2350, 0.8), t: T, key: 'hu22-ka' });
      void E;
    },
    post: () => ({ bloom: 0.38, vignette: 0.46, paper: 0.32 }),
  });
})();
