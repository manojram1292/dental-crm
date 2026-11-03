/*
 * Ep 4 · line "hook" · HOOK · "But who first gave this war its words?"
 *
 * Back at the Naimisha fire at night (the frame of the whole series): Sauti seated on the
 * left, the elder on the right, the circle of sages. On "who" (beats[0]) Sauti's hand opens
 * toward the fire; on "words" (beats[1]) a palm leaf glimmers in the smoke above it, as if
 * the answer were written there. The episode title follows the question.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP4 = window.EP4;
  const { clamp, E, PAL } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'hook',
    fadeIn: 0.5,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur, 0, 1.3);
      const fl = KIT.flicker(T, 0);
      const b0 = env.beats[0] ?? 0.4, b1 = env.beats[1] ?? dur * 0.4;
      const k = E.inOutCubic(clamp((t - (b0 - 0.3)) / 0.9));
      const la = E.inOutSine(clamp((t - (b1 - 0.2)) / 1.0));
      const F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.75, speed: 0, hide: [5, 6], turn: (i) => (i < 2 ? -0.5 : i > 2 ? 0.4 : -0.3),
        smoke: { alpha: 0.38, lean: 10 }, fireH: 230 + 30 * la,
        cam: { zoom: 1.0 + 0.06 * E.inOutSine(p), dy: -10 * E.inOutSine(p) },
        vision: (g) => {
          if (la <= 0.01) return;
          KIT.glow(g, 540, 640, 380, PAL.saffron, 0.3 * la, 'lighter', 0.5);
          KIT.manuscript.leaf(g, 540 + Math.sin(T * 0.8) * 10, 640 + Math.sin(T * 0.6) * 8, 520, 50, E.outCubic(la), { seed: 77, alpha: 0.75 * la, light: 0.6, tilt: Math.sin(T * 0.5) * 0.04 });
        },
        after: (g) => {
          CH.sauti.draw(g, {
            x: 190, y: 1530, scale: 0.7, facing: 'right', pose: { name: 'speak', base: 'sit', k }, expression: { look: -0.04 * k },
            light: { dir: Math.atan2(F.y - 1250, F.x - 190), intensity: fl, front: 0.2 }, t: T, key: 'h4-sauti',
          });
          CH.elder.draw(g, {
            x: 880, y: 1540, scale: 0.74, facing: 'left', pose: 'sit', expression: { look: -0.06 * la },
            light: { dir: Math.atan2(F.y - 1250, F.x - 880), intensity: fl, front: 0.2 }, t: T, key: 'h4-elder',
          });
        },
      });
      const tk = clamp((t - (env.speech[1] + 0.05)) / 1.1);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 340, key: 'ep4-title' });
      void EP4;
    },
    post: () => ({ bloom: 0.34, vignette: 0.5, paper: 0.32 }),
  });
})();
