/*
 * Ep 10 · line "cliff" · NEXT · "Then the sisters saw a horse rise from the ocean, and made a wager."
 *
 * NEW PLACE: the shore of the ocean at sunrise (EP10.shore), the water shining white. The two
 * sisters stand on the sand; on "horse" (beats[0]) a luminous white horse rises from the
 * waves; on "ocean" it rears; on "wager" (beats[2]) Kadru points at its tail (point) and
 * Vinata turns to her.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP10 = window.EP10;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'cliff',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1.3, b2 = env.beats[2] ?? 4.7;
      const horse = E.outCubic(clamp((t - (b0 - 0.5)) / 2.0));
      const pt = E.inOutCubic(clamp((t - (b2 - 0.5)) / 0.6));
      const L = { dir: -Math.PI / 2 + 0.1, intensity: 1.05, front: 0.35 };
      EP10.shore(ctx, T, {
        horse, cam: { zoom: 1.0 + 0.04 * p },
        after: (g) => {
          CH.kadru.draw(g, { x: 230, y: 1700, scale: 0.88, facing: 'right', pose: pt > 0.01 ? { name: 'point', k: pt } : 'stand', expression: { mood: pt > 0.5 ? 'wrath' : 'calm' }, light: L, t: T, key: 'x10-kd' });
          CH.vinata.draw(g, { x: 860, y: 1700, scale: 0.86, facing: 'left', pose: { name: 'stand' }, expression: { look: -0.12 }, light: L, t: T, key: 'x10-vn' });
        },
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.32, paper: 0.36 }),
  });
})();
