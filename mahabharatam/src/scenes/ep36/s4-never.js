/* Ep 36 · line "never" · the bride speaks · "He said, there is one. He never spoke a lie." · She lifts her face to her brother (close, lit); the gold flame at her waist glows. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35, EP36 = window.EP36;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'never',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, up = E.inOutSine(clamp(t / 1.0));
      EP35.night(ctx, T, { lampX: 860, lampY: 1250, cam: { zoom: 1.7, dy: -600, dx: 40 }, after: (g) => {
        CH.nagini.draw(g, { x: 560, y: 1700, scale: 0.85, facing: 'left', pose: { name: 'cradle', k: 1 }, expression: { look: -0.2 * up, speak: EPA.mouth(env, t) }, light: EP34.lamp(560, 1450, 860, 1250, 1.2), t: T, key: 'n36-ng' });
        EP35.flame(g, 490, 1360, 0.9, T, 0.6 + 0.4 * clamp((t - env.beats[0]) / 0.5));
      } });
    },
    post: () => ({ bloom: 0.46, vignette: 0.52, paper: 0.3 }),
  });
})();
