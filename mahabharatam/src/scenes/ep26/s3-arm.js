/* Ep 26 · line "arm" · "The gods put on their armour, and stood round the amrita." · High above the courtyard: the gods form a ring round the white pot on its pedestal, spears out. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP26 = window.EP26;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'arm',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const close = E.inOutSine(clamp(t / 1.6));
      EP26.court(ctx, T, { storm: 1, pot: 1, cam: { zoom: 1.3 + 0.05 * p, dy: -250 }, after: (g) => {
        for (let i = 0; i < 6; i++) { const x = 540 + (i < 3 ? -1 : 1) * (380 - 120 * close + (i % 3) * 110), y = 1520 + (i % 3) * 30; CH.deva.draw(g, { x, y, scale: 0.36, facing: x < 540 ? 'right' : 'left', index: i, pose: { name: 'raise', k: close }, light: EP26.storm(x, y), t: T, key: 'a26-d' + i }); }
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.44, paper: 0.3 }),
  });
})();
