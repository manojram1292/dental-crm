/*
 * Ep 15 · line "head" · "The head could not die. Roaring, it rose into the sky."
 * The head, LARGE, in its dark corona, mane of smoke-flame, jaws open (beats[1], "Roaring": the roar),
 * soars up and out of frame (beats[2], "sky"), the dusk shore falling away below.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP15 = window.EP15;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'head',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 1.8, b2 = env.beats[2] ?? 3.8;
      const roar = E.outCubic(clamp((t - b1 + 0.3) / 0.4)), up = E.inOutCubic(clamp((t - b1) / (b2 - b1 + 0.6)));
      EP15.dusk(ctx, T, {
        cam: { zoom: 1.0, dy: lerp(0, 900, up) },
        after: (g) => CH.rahu.draw(g, { x: 560, y: lerp(1450, 300, up), scale: 1.25, facing: 'right', pose: { name: 'head', roar: 0.35 + 0.65 * roar }, expression: { look: -0.2 * up }, light: { dir: -0.6, intensity: 1.15, front: 0.45 }, t: T, key: 'h15-head' }),
      });
      void dur;
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }),
  });
})();
