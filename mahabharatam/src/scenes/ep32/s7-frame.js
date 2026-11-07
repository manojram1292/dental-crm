/* Ep 32 · line "frame" · FRAME (Sauti) · "Then the youngest voice in the hall spoke." · A twenty-first angle: a high three-quarter view from behind the fire, Sauti's face lit, the sages a dark ring below. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP32 = window.EP32;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.92, speed: 0, hide: [4, 5], fireH: 300, smoke: { alpha: 0.5, lean: 30 },
        cam: { zoom: 1.3 + 0.05 * p, dx: 180, dy: -140 },
        after: (g) => CH.sauti.draw(g, { x: 640, y: 1250, scale: 0.6, facing: 'left', pose: { name: 'speak', base: 'sit', k: E.inOutSine(clamp(t / 0.6)) }, expression: { speak: EPA.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1000, F.x - 640), intensity: fl * 1.2, front: 0.7, fill: 0.25 }, t: T, key: 'f32-sauti' }),
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.52, paper: 0.32 }),
  });
})();
