/* Ep 33 · line "rat" · "And a rat was gnawing at its root." · The hook's image from a new angle: side-on, the root in silhouette against the moonlit shaft, the rat large, gnawing on the beats. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'rat',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP33.pit(ctx, T, { view: 'up', cam: { zoom: 1.6 + 0.1 * p, dx: 0, dy: 0 }, after: (g) => {
        EP33.tuft(g, 560, 820, 1.4, T, { roots: 1 });
        EP33.rat(g, 420, 1020, 0.85, T, { gnaw: 1 });
      } });
    },
    post: () => ({ bloom: 0.4, vignette: 0.55, paper: 0.3 }),
  });
})();
