/*
 * Ep 7 · line "warn" · "Shamika grieved, and warned him."
 *
 * The hermitage at evening (EP7.pen, evening): the dead snake set down beside him, Shamika
 * bows his head, hand to his brow (grieve) on "Shamika" (beats[0]); on "warned" (beats[1])
 * he points the way and his disciple runs off toward the distant city, small on the road.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP7 = window.EP7;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'warn',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.1, b1 = env.beats[1] ?? 1.8;
      const gr = E.inOutSine(clamp((t - b0) / 1.0)) * (1 - E.inOutSine(clamp((t - (b1 - 0.5)) / 0.6)));
      const send = E.inOutCubic(clamp((t - (b1 - 0.4)) / 0.6));
      const run = clamp((t - (b1 - 0.2)) / 1.6);
      EP7.pen(ctx, T, {
        evening: 0.75, cam: { zoom: 1.12 + 0.04 * p, dx: 40, dy: -60 },
        after: (g) => {
          EP7.deadSnake(g, [[470, 1600], [520, 1590], [580, 1604], [640, 1594], [700, 1602]], 1.0, 1);
          const pose = send > 0.01 ? { name: 'send', base: 'sit', k: send } : { name: 'grieve', base: 'sit', k: gr };
          CH.shamika.draw(g, { x: 330, y: 1580, scale: 1.0, facing: 'right', pose, expression: { look: -0.25 * send }, light: EP7.penLight(330, 1580, 0.75), t: T, key: 'w7-sm' });
          if (run > 0.01) {
            const x = lerp(560, 1000, run), s = lerp(0.42, 0.26, run);
            CH.uttanka.shape(g, '#0c0810', { x, y: lerp(1500, 1330, run), scale: s, facing: 'right', pose: { name: 'run', phase: T * 11 }, t: T });
          }
        },
      });
    },
    post: () => ({ bloom: 0.34, vignette: 0.5, paper: 0.34 }),
  });
})();
