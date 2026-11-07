/* Ep 34 · line "frame" · FRAME (Sauti) · "A man who owned nothing, begging for a wife." · A twenty-second angle: very close, from the side; the fire only a glow on his cheek; a wry turn of the hand. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.75, speed: 0, hide: [0, 1, 2, 3, 4, 5, 6], fireH: 200, smoke: { alpha: 0.3, lean: 0 },
        cam: { zoom: 2.4 + 0.06 * p, dx: -220, dy: -560 },
        after: (g) => CH.sauti.draw(g, { x: 760, y: 1280, scale: 0.6, facing: 'left', pose: { name: 'speak', base: 'sit', k: E.inOutSine(clamp(t / 0.6)) }, expression: { speak: EPA.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1000, F.x - 760), intensity: fl * 1.2, front: 0.7, fill: 0.25 }, t: T, key: 'f34-sauti' }),
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.56, paper: 0.32 }),
  });
})();
