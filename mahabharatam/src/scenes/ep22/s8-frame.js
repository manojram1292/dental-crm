/* Ep 22 · line "frame" · FRAME (Sauti) · "Hungry as he was, he kept his mother's word." · An eleventh angle: Sauti in profile, close against the fire, his hand at his own throat. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP22 = window.EP22;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, { cycle: 0.79, speed: 0, hide: [0, 1, 2, 3, 4], fireH: 300, smoke: { alpha: 0.3, lean: -10 }, cam: { zoom: 2.0 + 0.06 * p, dx: 160, dy: -700 } });
      CH.sauti.draw(ctx, { x: 400, y: 2000, scale: 1.45, facing: 'right', pose: { name: 'speak', base: 'sit', k: E.inOutSine(clamp(t / 0.8)) }, expression: { speak: EP22.mouth(env, t), look: 0.05 }, light: { dir: Math.atan2(F.y - 1200, F.x + 400), intensity: fl * 1.25, front: 0.6 }, t: T, key: 'f22-sauti' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.55, paper: 0.32 }),
  });
})();
