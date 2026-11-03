/*
 * Ep 2 · line "ask" · elder_sage: "Tell us, son of the Suta… where was that great war fought?"
 *
 * Back at the Naimisha fire circle, the night of episode 1 (same clearing, same
 * moon, same sages). The two front places of the circle are taken by the two
 * speakers in profile: Sauti seated on the left, facing the fire; the elder
 * sage, Shaunaka, seated on the right. The camera eases toward the elder; on
 * "where" (env.beats[0]) he leans in and his hand opens toward Sauti, and his
 * lips move with his words. The sages behind turn toward Sauti.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP2 = window.EP2;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'ask',
    fadeIn: 0.5,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur, 0, 1.3);
      const fl = KIT.flicker(T, 0);
      const wb = env.beats[0] ?? dur * 0.5;
      const lean = E.inOutCubic(clamp((t - (wb - 1.4)) / 1.5));
      const order = [0, 1, 2, 3, 4];
      const turn = (i) => E.inOutCubic(clamp((t - 0.4 - order.indexOf(i) * 0.15) / 0.8)) * (i < 2 ? -0.7 : i > 2 ? 0.5 : -0.4) * 0.8;
      const F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.75, speed: 0, hide: [5, 6], turn,
        smoke: { alpha: 0.36, lean: 20 },
        cam: { zoom: 1.0 + 0.08 * E.inOutSine(p), dx: -60 * E.inOutSine(p), dy: -20 * E.inOutSine(p) },
        after: (g) => {
          // Sauti: left, facing the fire and the elder
          CH.sauti.draw(g, {
            x: 190, y: 1530, scale: 0.7, facing: 'right', pose: 'sit', expression: { look: 0.03 },
            light: { dir: Math.atan2(F.y - 1250, F.x - 190), intensity: fl, front: 0.2 }, t: T, key: 'ask-sauti',
          });
          // the elder: right, leaning in to ask
          CH.elder.draw(g, {
            x: 880, y: 1540, scale: 0.74, facing: 'left', pose: { name: 'speak', base: 'sit', k: lean },
            expression: { speak: EP2.mouth(env, t) },
            light: { dir: Math.atan2(F.y - 1250, F.x - 880), intensity: fl, front: 0.2 }, t: T, key: 'ask-elder',
          });
        },
      });
      // the episode title, once the question has been asked
      const tk = clamp((t - (env.speech[1] + 0.05)) / 1.1);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 340, key: 'ep2-title' });
    },
    post: () => ({ bloom: 0.34, vignette: 0.5, paper: 0.32 }),
  });
})();
