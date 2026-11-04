/* Ep 18 · line "tail" · THE REVEAL · "His tail was black." · After a 400 ms rest, a slow push along the horse to his tail, streaked with black (beats[1], a deep drum); held in silence. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { clamp, E, lerp } = R;
  R.scene({
    id: 'tail',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const z = E.inOutSine(clamp(t / dur));
      ctx.save(); KIT.camera(ctx, { x: 820, y: 1200, zoom: lerp(1.6, 2.6, z), dx: lerp(-200, -300, z), dy: lerp(-100, -260, z) });
      EP11.shore(ctx, T, { horse: { x: 520, y: 1400, scale: 0.75, facing: 'left', pose: { name: 'stand', tail: 1, wind: 0.8 } } });
      ctx.restore();
    },
    post: () => ({ bloom: 0.36, vignette: 0.55, paper: 0.32 }),
  });
})();
