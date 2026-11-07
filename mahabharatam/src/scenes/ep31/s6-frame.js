/* Ep 31 · line "frame" · FRAME (Sauti) · "Not every serpent took his mother's side." · A twentieth angle: over the elder's shoulder, Shaunaka large and dark in the foreground left, Sauti lit across the fire. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.55, speed: 0, hide: [0, 1, 2, 3, 4, 5, 6], fireH: 230, smoke: { alpha: 0.4, lean: -10 },
        cam: { zoom: 1.45 + 0.04 * p, dx: -60, dy: -240 },
        after: (g) => {
          CH.sauti.draw(g, { x: 760, y: 1300, scale: 0.6, facing: 'left', pose: { name: 'speak', base: 'sit', k: E.inOutSine(clamp(t / 0.6)) }, expression: { speak: EPA.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1000, F.x - 760), intensity: fl * 1.2, front: 0.6, fill: 0.2 }, t: T, key: 'f31-sauti' });
          CH.elder.draw(g, { x: 160, y: 1720, scale: 0.95, facing: 'right', pose: { name: 'sit' }, light: { dir: Math.atan2(F.y - 1200, F.x - 160), intensity: fl * 0.9, front: 0.1 }, t: T, key: 'f31-elder' });
        },
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.52, paper: 0.32 }),
  });
})();
