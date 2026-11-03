/*
 * Ep 8 · line "cliff" · NEXT · "Why were the serpents doomed? Because their own mother cursed them."
 *
 * Back at the sacrifice: the fire roars. On "doomed" (beats[0]) serpents still falling; on
 * "own" (beats[1]) in the smoke above the fire forms the shape of a crowned woman, Kadru,
 * mother of the serpents; on "cursed" (beats[2]) she raises her finger in a curse and her
 * green eye burns.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP8 = window.EP8;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'cliff',
    fadeIn: 0.5,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 2.5, b2 = env.beats[2] ?? 3.9;
      const mom = E.outCubic(clamp((t - (b1 - 0.5)) / 1.0));
      const curse = E.inOutCubic(clamp((t - (b2 - 0.4)) / 0.6));
      EP8.satra(ctx, T, {
        fire: 1.1, cam: { zoom: 1.0 - 0.03 * p, dy: 80 },
        sky: (g) => {
          EP8.fallers(g, T, 540, 1260, 12, 0.7 * (1 - 0.6 * mom), { top: -300 });
        },
        after: (g) => {
          if (mom > 0.01) {
            KIT.glow(g, 540, 640, 520, '#9aff9a', 0.18 * mom);
            EP8.ghost(g, 0.88 * mom, (q) => CH.kadru.draw(q, { x: 560, y: 1180, scale: 0.85, facing: 'left', pose: curse > 0.01 ? { name: 'curse', k: curse } : 'stand', expression: { mood: curse > 0.5 ? 'wrath' : 'calm' }, light: { dir: Math.PI / 2, intensity: 1.1, front: 0.2 }, t: T, key: 'c8-kd' }), 'c8-g');
          }
        },
      });
    },
    post: () => ({ bloom: 0.48, vignette: 0.55, paper: 0.3 }),
  });
})();
