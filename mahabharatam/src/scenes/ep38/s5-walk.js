/* Ep 38 · line "walk" · "So the boy walked to the king's sacrifice." · NEW LIGHT, the plain at a smoky red noon: the small boy on the long road toward the black smoke column; the posts on the horizon. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'walk',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP38.plain(ctx, T, { cam: { zoom: 1.0 + 0.1 * p }, after: (g) => {
        CH.astika.draw(g, { x: 560, y: lerp(2100, 1900, p), scale: lerp(0.72, 0.6, p), facing: 'right', pose: { name: 'walk', phase: T * 3 }, light: EP38.noonLit(560, 1600), t: T, key: 'w38-as' });
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.44, paper: 0.32 }),
  });
})();
