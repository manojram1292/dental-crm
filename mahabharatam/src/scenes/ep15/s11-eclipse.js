/*
 * Ep 15 · line "eclipse" · "And still it hunts the Sun and the Moon."
 * The deep sky: the head closes on the Sun and a bite of shadow eats into its disc (beats[1], an
 * eclipse); the Moon waits beyond (beats[2]).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP15 = window.EP15;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'eclipse',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 1.2;
      const bite = E.inOutSine(clamp((t - b1 + 0.4) / 1.6));
      EP15.heavens(ctx, T, {
        sun: [700, 760, 170], moon: [220, 520, 70], bite: 0.6 * bite,
        after: (g) => CH.rahu.draw(g, { x: lerp(300, 400, bite), y: lerp(1500, 1300, bite), scale: 0.9, facing: 'right', pose: { name: 'head', roar: 0.8 }, light: { dir: -0.7, intensity: 1.1, front: 0.4 }, t: T, key: 'e15-head' }),
      });
      void dur;
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }),
  });
})();
