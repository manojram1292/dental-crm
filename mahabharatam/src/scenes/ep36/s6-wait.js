/* Ep 36 · line "wait" · FRAME (Sauti) · "All the serpents had left was one unborn child." · A twenty-fourth angle: Sauti seen across the fire from the elder's side, his hands cupped as if round a flame. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35, EP36 = window.EP36;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'wait',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.85, speed: 0, hide: [3, 4, 5, 6], fireH: 220, smoke: { alpha: 0.35, lean: 10 },
        cam: { zoom: 1.75 + 0.05 * p, dx: 40, dy: -380 },
        after: (g) => CH.sauti.draw(g, { x: 700, y: 1260, scale: 0.62, facing: 'left', pose: { name: 'speak', base: 'sit', k: 1 }, expression: { speak: EPA.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1000, F.x - 700), intensity: fl * 1.25, front: 0.75, fill: 0.3 }, t: T, key: 'w36-sauti' }),
      });
    },
    post: () => ({ bloom: 0.44, vignette: 0.54, paper: 0.32 }),
  });
})();
