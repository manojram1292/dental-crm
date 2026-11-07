/* Ep 37 · line "could" · "The king learned that his father could have been saved." · Back in the court by torchlight, close on Janamejaya's face, lit; his father's painted panel behind him catches the light. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP36 = window.EP36, EP37 = window.EP37, EP8 = window.EP8;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'could',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP36.court(ctx, T, { cam: { zoom: lerp(1.6, 1.75, p), dy: -380 }, after: (g) => {
        CH.janamejaya.draw(g, { x: 600, y: 1520, scale: 0.85, facing: 'left', pose: { name: 'sit' }, expression: { look: -0.05 }, light: EP36.torch(600, 1200, 1.25), t: T, key: 'c37-jj' });
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.54, paper: 0.3 }),
  });
})();
