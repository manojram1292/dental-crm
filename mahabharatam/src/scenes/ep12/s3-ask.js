/*
 * Ep 12 · line "ask" · FRAME · Shaunaka: "But with what could anyone churn an ocean?"
 *
 * The Naimisha fire seen from behind Sauti this time (a new angle): Sauti large in the
 * right foreground, his back three-quarters to us, the fire between; across it the elder
 * sage Shaunaka leans forward and asks (speaks), the sages around him turned to Sauti. On
 * "ocean" (beats[1]) Sauti lifts his hand to answer.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP12 = window.EP12;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'ask',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 2.5;
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      const lean = E.inOutSine(clamp(t / 1.0)), hand = E.inOutCubic(clamp((t - b1 + 0.3) / 0.6));
      KIT.ashram.draw(ctx, T, {
        cycle: 0.78, speed: 0, hide: [0, 1, 6], turn: (i) => (i < 3 ? 0.4 : -0.3),
        smoke: { alpha: 0.3, lean: -4 }, fireH: 230,
        cam: { zoom: 1.25 + 0.04 * p, dx: -40, dy: -80 },
        after: (g) => {
          CH.elder.draw(g, { x: 330, y: 1500, scale: 0.8, facing: 'right', pose: { name: 'speak', base: 'sit', k: lean }, expression: { look: -0.1, speak: EP12.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1150, F.x - 330), intensity: fl * 1.1, front: 0.45 }, t: T, key: 'k12-elder' });
          CH.sauti.draw(g, { x: 860, y: 1800, scale: 1.05, facing: 'left', pose: { name: 'speak', base: 'sit', k: hand }, expression: { look: 0.05 }, light: { dir: Math.atan2(F.y - 1300, F.x - 930), intensity: fl * 1.2, front: 0.4 }, t: T, key: 'k12-sauti' });
        },
      });
    },
    post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.32 }),
  });
})();
