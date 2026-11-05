/* Ep 22 · line "welfare" · Kashyapa: "Are you well, my son? Do you have food enough?" · Kashyapa close, seated on the ledge in the rose dawn, his hand lifting in blessing. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP22 = window.EP22;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'welfare',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP22.peak(ctx, T, { cam: { zoom: 2.2 + 0.06 * p, dx: 380, dy: -560 }, after: (g) => {
        CH.kashyapa.draw(g, { x: 330, y: 1430, scale: 0.55, facing: 'right', pose: { name: 'bless', base: 'sit', k: E.inOutSine(clamp(t / 0.8)) }, expression: { speak: EP22.mouth(env, t) }, light: EP22.dawn(330, 1430, 1.1), t: T, key: 'w22-ka' });
      } });
    },
    post: () => ({ bloom: 0.36, vignette: 0.48, paper: 0.32 }),
  });
})();
