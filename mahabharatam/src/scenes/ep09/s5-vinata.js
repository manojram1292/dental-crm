/*
 * Ep 9 · line "vinata" · Vinata: "Give me only two, but greater than all of hers."
 *
 * Close on Vinata, large. She speaks, holding up two fingers' worth of hope; on "two"
 * (beats[0]) two great birds of light appear in the dawn behind her, one rose-red, one
 * gold; on "greater" (beats[1]) they spread their wings wide over the serpent hoods,
 * which dim (beats[2], "hers").
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP9 = window.EP9;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'vinata',
    fadeIn: 0.4,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1.4, b1 = env.beats[1] ?? 2.7;
      const two = E.outCubic(clamp((t - (b0 - 0.3)) / 0.8));
      const grow = E.inOutSine(clamp((t - (b1 - 0.3)) / 1.4));
      const sp = E.inOutCubic(clamp((t - 0.1) / 0.6));
      EP9.hermitage(ctx, T, {
        glow: 0.7, cam: { zoom: 1.75 + 0.05 * p, dx: -320, dy: 260 },
        after: (g) => {
          EP9.hoods(g, T, 760, 1000, 200, 0.7 * (1 - 0.7 * grow), { r: 300, size: 10 });
          EP9.lightBird(g, 690, 760, 0.5 + 0.35 * grow, '#ff7a6a', T, two);
          EP9.lightBird(g, 900, 680, 0.55 + 0.4 * grow, '#ffd060', T + 0.7, two);
          CH.vinata.draw(g, { x: 830, y: 1640, scale: 0.9, facing: 'left', pose: { name: 'speak', k: sp }, expression: { speak: EP9.mouth(env, t), look: -0.08 }, light: EP9.light(830, 1640, 1.1, 0.4), t: T, key: 'v9-vn' });
        },
      });
    },
    post: () => ({ bloom: 0.45, vignette: 0.5, paper: 0.32 }),
  });
})();
