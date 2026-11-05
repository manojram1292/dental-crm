/* Ep 24 · line "frame" · FRAME (Sauti) · "Now the branch was his to drop." · A thirteenth angle: over the elder sage's shoulder, Sauti opens his fingers as if letting something fall. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP24 = window.EP24;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.8, speed: 0, hide: [1, 2, 3], fireH: 230, smoke: { alpha: 0.3, lean: 8 },
        cam: { zoom: 1.5 + 0.05 * p, dx: -120, dy: -260 },
        after: (g) => CH.sauti.draw(g, { x: 760, y: 1300, scale: 0.6, facing: 'left', pose: { name: 'bless', base: 'sit', k: 1 - E.inOutSine(clamp((t - 0.8) / 0.8)) * 0.6 }, expression: { speak: EP24.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1000, F.x - 760), intensity: fl * 1.2, front: 0.55 }, t: T, key: 'f24-sauti' }),
      });
      CH.elder.draw(ctx, { x: 160, y: 2250, scale: 1.3, facing: 'right', pose: 'sit', light: { dir: 0, intensity: fl * 0.8, front: 0.15 }, t: T, key: 'f24-elder' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.52, paper: 0.32 }),
  });
})();
