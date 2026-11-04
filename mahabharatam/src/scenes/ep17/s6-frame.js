/* Ep 17 · line "frame" · FRAME (Sauti) · "But Kadru did not wait for dawn." · A sixth angle: over the elder's shoulder, Sauti across the fire, a knowing lean. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.76, speed: 0, hide: [0, 1, 5, 6], turn: () => -0.2,
        smoke: { alpha: 0.3, lean: 5 }, fireH: 220,
        cam: { zoom: 1.3 + 0.05 * p, dx: -40, dy: -120 },
        after: (g) => {
          CH.sauti.draw(g, { x: 330, y: 1480, scale: 0.72, facing: 'right', pose: { name: 'speak', base: 'sit', k: E.inOutSine(clamp(t / 0.8)) }, expression: { look: -0.05, speak: EP17.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1150, F.x - 330), intensity: fl * 1.2, front: 0.5 }, t: T, key: 'f17-sauti' });
          CH.elder.draw(g, { x: 1000, y: 2120, scale: 1.25, facing: 'left', pose: 'sit', expression: { look: -0.05 }, light: { dir: Math.atan2(F.y - 1400, F.x - 1000), intensity: fl, front: 0.15 }, t: T, key: 'f17-elder' });
        },
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.55, paper: 0.32 }),
  });
})();
