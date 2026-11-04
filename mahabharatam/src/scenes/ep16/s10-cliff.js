/*
 * Ep 16 · line "cliff" · NEXT 1 · "Back on the shore, Kadru and Vinata looked at the white horse."
 * The shore at sunrise again (episode 11's place, EP11.shore): the sisters LARGE in the foreground,
 * the horse far out on the shining water; a slow push toward him.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { clamp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'cliff',
    fadeIn: 0.4,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const sun = (x, y) => ({ dir: Math.atan2(1080 - (y - 600), 820 - x), intensity: 1.05, front: 0.42 });
      EP11.shore(ctx, T, {
        cam: { zoom: 1.0 + 0.08 * p, dy: -20 * p },
        horse: { x: 560, y: 1150, scale: 0.34, pose: 'stand' },
        after: (g) => {
          CH.kadru.draw(g, { x: 190, y: 2040, scale: 1.2, facing: 'right', pose: 'stand', expression: { look: -0.05 }, light: sun(190, 2040), t: T, key: 'x16-kd' });
          CH.vinata.draw(g, { x: 900, y: 2040, scale: 1.14, facing: 'left', pose: 'stand', expression: { look: -0.05 }, light: sun(900, 2040), t: T, key: 'x16-vn' });
        },
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.36, paper: 0.34 }),
  });
})();
