/* Ep 25 · line "frame" · FRAME (Shaunaka asks, as in CE 1.27) · "What fault had Indra made?" · A fourteenth angle, the elder's side: Shaunaka leans in across the fire, Sauti beyond the flames. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP25 = window.EP25;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.8, speed: 0, hide: [4, 5], fireH: 220, smoke: { alpha: 0.3, lean: -6 },
        cam: { zoom: 1.45 + 0.05 * p, dx: 120, dy: -240 },
        middle: (g) => CH.sauti.draw(g, { x: 330, y: 1080, scale: 0.48, facing: 'right', pose: { name: 'sit' }, light: { dir: Math.atan2(F.y - 800, F.x - 330), intensity: fl * 1.1, front: 0.5 }, t: T, key: 'f25-sauti' }),
      });
      CH.elder.draw(ctx, { x: 820, y: 2050, scale: 1.25, facing: 'left', pose: { name: 'speak', base: 'sit', k: E.inOutSine(clamp(t / 0.6)) }, expression: { speak: EP25.mouth(env, t) }, light: { dir: Math.atan2(-800, -400), intensity: fl * 1.2, front: 0.55 }, t: T, key: 'f25-elder' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.52, paper: 0.32 }),
  });
})();
