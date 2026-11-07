/* Ep 34 · line "alms" · Jaratkaru speaks · "All you who live here: give me a bride, as alms." · Close and low: his raised hands against the canopy, the gold shafts behind; a slow push. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'alms',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP34.forest(ctx, T, { cam: { zoom: lerp(1.9, 2.05, p), dy: -260, dx: 40 }, after: (g) => {
        CH.jaratkaru.draw(g, { x: 560, y: 1820, scale: 1.0, facing: 'right', pose: { name: 'bless', k: 1 }, expression: { speak: EPA.mouth(env, t) }, light: EP34.shaft(560, 1500, 1.25), t: T, key: 'a34-jk' });
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }),
  });
})();
