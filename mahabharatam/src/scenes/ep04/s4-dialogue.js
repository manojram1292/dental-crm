/*
 * Ep 4 · lines "condition" (Ganesha: "Never stop speaking.") and "reply" (Vyasa: "Then write
 * nothing you don't understand.") · the bargain, in two close shots of the same morning.
 *
 * condition: close on Ganesha (right of frame, facing left toward Vyasa), one finger
 *   raised, his trunk swaying as he speaks; vermilion aura; the tradition tag stays up.
 * reply: close on Vyasa (left, facing right), his hand opening toward the scribe as he
 *   answers (the speak pose: at this size the dictate finger reads as a blade); his gold halo.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP4 = window.EP4;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'condition',
    fadeIn: 0.35,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur, 0, 1.3);
      EP4.hermitage(ctx, T, { cam: { zoom: 1.35 + 0.04 * p, dx: -220, dy: 60 } });
      CH.ganesha.draw(ctx, {
        x: 700, y: 1560, scale: 1.12, facing: 'left', pose: { name: 'speak', base: 'sit', k: 1 },
        expression: { speak: EP4.mouth(env, t), look: -0.04 }, light: EP4.sunLight(700, 1100, 1.0), t: T, key: 'c4-ganesha',
      });
      EP4.grass(ctx, T, 1740, 0.9);
      KIT.series.traditionTag(ctx, T, 1, env.strings);
    },
    post: () => ({ bloom: 0.32, vignette: 0.48, paper: 0.3 }),
  });

  R.scene({
    id: 'reply',
    fadeIn: 0.35,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur, 0, 1.3);
      EP4.hermitage(ctx, T, { cam: { zoom: 1.35 + 0.04 * p, dx: 200, dy: 60 } });
      const k = E.inOutCubic(clamp((t - 0.1) / 0.9));
      CH.vyasa.draw(ctx, {
        x: 400, y: 1560, scale: 1.18, facing: 'right', pose: { name: 'speak', base: 'sit', k },
        expression: { speak: EP4.mouth(env, t), look: 0.02 }, light: EP4.sunLight(400, 1100, 1.0), t: T, key: 'r4-vyasa',
      });
      EP4.grass(ctx, T, 1740, 0.9);
      KIT.series.traditionTag(ctx, T, 1, env.strings);
    },
    post: () => ({ bloom: 0.32, vignette: 0.48, paper: 0.3 }),
  });
})();
