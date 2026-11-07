/* Ep 34 · line "name" · Jaratkaru speaks · "What is her name? I will not keep her." · Over the sage's shoulder: his dark profile large in the left foreground; Vasuki and the bride mid-ground right in the shaft of light (not a side-by-side two-shot). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'name',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP34.forest(ctx, T, { cam: { zoom: 1.2 + 0.04 * p, dx: 60 }, after: (g) => {
        CH.vasuki.draw(g, { x: 700, y: 1640, scale: 0.5, facing: 'left', pose: { name: 'rise', k: 0.85 }, light: EP34.shaft(700, 1400, 1.1), t: T, key: 'n34-va' });
        CH.nagini.draw(g, { x: 860, y: 1660, scale: 0.6, facing: 'left', pose: { name: 'stand' }, light: EP34.shaft(860, 1500, 1.15), t: T, key: 'n34-ng' });
        CH.jaratkaru.draw(g, { x: 150, y: 2500, scale: 1.7, facing: 'right', pose: { name: 'stand' }, expression: { speak: EPA.mouth(env, t) }, light: { dir: -0.2, intensity: 0.8, front: 0.15, fill: 0.15 }, t: T, key: 'n34-jk' });
      } });
    },
    post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.3 }),
  });
})();
