/*
 * Ep 4 · line "pause" · "Whenever Ganesha paused to grasp a verse, Vyasa composed more."
 *
 * The two-shot, working: Ganesha writes fast (the stylus strokes along the leaf, the pile
 * of written leaves grows beside him); Vyasa dictates, one finger raised. On "paused"
 * (beats[0]) the stylus lifts, Ganesha's head bows and his trunk curls: he is grasping a
 * verse. On "Vyasa" (beats[1]) new verses kindle as lights above Vyasa, more and more; then
 * the scribe bends to the leaf again.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP4 = window.EP4;
  const { clamp, E } = R;

  R.scene({
    id: 'pause',
    fadeIn: 0.45,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur, 0, 1.3);
      const b0 = env.beats[0] ?? dur * 0.3, b1 = env.beats[1] ?? dur * 0.65;
      const pk = E.inOutCubic(clamp((t - (b0 - 0.2)) / 0.5)) * (1 - E.inOutCubic(clamp((t - (b1 + 1.1)) / 0.6)));
      const gp = pk > 0.01 ? { name: 'pause', k: pk, phase: T * 7 } : { name: 'write', k: 1, phase: T * 7 };
      EP4.twoShot(ctx, T, {
        cam: { zoom: 1.04 + 0.03 * E.inOutSine(p) },
        vyasa: { pose: { name: 'dictate', base: 'sit', k: 1 }, expression: { speak: t > b1 ? 0.4 + 0.3 * Math.sin(T * 9) : 0 } },
        ganesha: { pose: gp, expression: {} },
        stack: 3 + clamp(t / dur) * 5,
        verses: clamp((t - (b1 - 0.2)) / 1.6),
      });
      KIT.series.traditionTag(ctx, T, 1, env.strings);
    },
    post: () => ({ bloom: 0.32, vignette: 0.42, paper: 0.3 }),
  });
})();
