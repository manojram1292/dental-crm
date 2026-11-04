/*
 * Ep 16 · line "tail" · NEXT 2 (Kadru) · "What colour is his tail?"
 * Close on Kadru, LARGE, the green glint in her eye; on "colour" (beats[0]) she turns to her sister;
 * on "tail" (beats[1]) she points out across the water at the horse's tail.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'tail',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T;
      const b1 = env.beats[1] ?? 1.5;
      const pt = E.inOutCubic(clamp((t - b1 + 0.4) / 0.5));
      EP11.shore(ctx, T, {
        cam: { zoom: 1.5, dx: -120, dy: -260 },
        horse: { x: 740, y: 1110, scale: 0.18, pose: 'stand' },
        after: (g) => CH.kadru.draw(g, { x: 330, y: 2000, scale: 1.25, facing: 'right', pose: pt > 0.01 ? { name: 'point', k: pt } : { name: 'speak', k: 1 }, expression: { mood: pt > 0.4 ? 'wrath' : 'calm', speak: EP11.mouth(env, t) }, light: { dir: Math.atan2(1080 - 1400, 820 - 330), intensity: 1.1, front: 0.45 }, t: T, key: 't16-kd' }),
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.4, paper: 0.34 }),
  });
})();
