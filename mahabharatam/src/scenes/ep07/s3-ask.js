/*
 * Ep 7 · line "ask" · Parikshit: "Sage, where did the deer go?"
 *
 * NEW PLACE, NEW LIGHT: Shamika's hermitage among the cows (EP7.pen), honey-gold afternoon
 * light from the right. The sage sits under the pipal in meditation, eyes closed; the king,
 * breathless, stands over him and asks, his far hand opening (beats[0], "Sage").
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP7 = window.EP7;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'ask',
    fadeIn: 0.5,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.2;
      const sp = E.inOutCubic(clamp((t - (b0 - 0.2)) / 0.6));
      const kx = lerp(900, 850, E.outSine(clamp(t / 1.2)));
      EP7.pen(ctx, T, {
        cam: { zoom: 1.06 + 0.04 * p, dx: -10, dy: -30 },
        after: (g) => {
          CH.shamika.draw(g, { x: 330, y: 1580, scale: 0.98, facing: 'right', pose: 'sit', light: EP7.penLight(330, 1580), t: T, key: 'a7-sm' });
          CH.parikshit.draw(g, { x: kx, y: 1600, scale: 0.98, facing: 'left', pose: { name: 'speak', k: sp }, expression: { speak: EP7.mouth(env, t), look: 0.06 }, light: EP7.penLight(kx, 1600), t: T, key: 'a7-pk' });
        },
      });
    },
    post: () => ({ bloom: 0.34, vignette: 0.4, paper: 0.34 }),
  });
})();
