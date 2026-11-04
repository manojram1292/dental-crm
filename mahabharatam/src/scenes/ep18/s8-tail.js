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
      ctx.save(); KIT.camera(ctx, { x: 900, y: 1150, zoom: lerp(1.4, 2.1, z), dx: -360, dy: -190 });
      EP11.shore(ctx, T, { horse: { x: 520, y: 1400, scale: 0.75, facing: 'left', pose: { name: 'stand', tail: 1, wind: 0.8 } } });
      ctx.restore();
    },
    post: () => ({ bloom: 0.36, vignette: 0.55, paper: 0.32 }),
  });
})();
