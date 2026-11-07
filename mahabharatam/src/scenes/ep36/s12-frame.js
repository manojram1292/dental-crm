/* Ep 36 · line "frame" · FRAME (Sauti) · "Shaunaka, that teacher was of your own family." · A twenty-fifth angle, the reverse: Sauti turns to look straight at the elder across the fire; the elder lit in surprise, large in the foreground right. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35, EP36 = window.EP36;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.85, speed: 0, hide: [0, 1, 2, 3, 4, 5, 6], fireH: 230, smoke: { alpha: 0.35, lean: -10 },
        cam: { zoom: 1.5 + 0.04 * p, dx: -40, dy: -260 },
        after: (g) => {
          CH.sauti.draw(g, { x: 300, y: 1260, scale: 0.55, facing: 'right', pose: { name: 'speak', base: 'sit', k: 1 }, expression: { speak: EPA.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1000, F.x - 300), intensity: fl * 1.2, front: 0.7, fill: 0.3 }, t: T, key: 'f36-sauti' });
          CH.elder.draw(g, { x: 900, y: 1640, scale: 0.85, facing: 'left', pose: { name: 'sit' }, expression: { look: -0.1 }, light: { dir: Math.atan2(F.y - 1100, F.x - 900), intensity: fl * 1.2, front: 0.75, fill: 0.35 }, t: T, key: 'f36-elder' });
        },
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.52, paper: 0.32 }),
  });
})();
