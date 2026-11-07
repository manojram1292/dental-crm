/* Ep 36 · line "child" · Vasuki speaks · "Did he leave you with child?" · Close on Vasuki's single hood, low, the ruby catching the lamp. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35, EP36 = window.EP36;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'child',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP35.night(ctx, T, { lampX: 900, lampY: 1100, cam: { zoom: 1.9 + 0.06 * p, dy: -380, dx: -60 }, after: (g) => {
        CH.vasuki.draw(g, { x: 420, y: 1950, scale: 0.9, facing: 'right', pose: { name: 'rise', k: 1 }, light: EP34.lamp(420, 1300, 900, 1100, 1.2), t: T, key: 'c36-va' });
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.54, paper: 0.3 }),
  });
})();
