/*
 * Ep 9 · line "kadru" · Kadru: "Give me a thousand sons, serpents, all equal in splendour."
 *
 * Close on Kadru, large, her diadem of hoods glinting. She speaks (speak), and behind her
 * the dawn fills with small cobra hoods: they multiply on "thousand" (beats[0]), glint on
 * "serpents" (beats[1]) and shine alike on "splendour" (beats[2]).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP9 = window.EP9;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'kadru',
    fadeIn: 0.4,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1, b2 = env.beats[2] ?? 4.5;
      const n = E.inOutSine(clamp((t - (b0 - 0.3)) / 1.6));
      const sp = E.inOutCubic(clamp((t - 0.1) / 0.6));
      const shine = clamp((t - (b2 - 0.2)) / 0.6);
      EP9.hermitage(ctx, T, {
        glow: 0.6, cam: { zoom: 1.75 + 0.05 * p, dx: 320, dy: 260 },
        after: (g) => {
          EP9.hoods(g, T, 360, 860, 220, n, { r: 480, size: 12 + 4 * shine });
          if (shine > 0) KIT.glow(g, 330, 900, 600, '#c8e070', 0.2 * shine);
          CH.kadru.draw(g, { x: 260, y: 1640, scale: 0.9, facing: 'right', pose: { name: 'speak', k: sp }, expression: { speak: EP9.mouth(env, t), look: -0.06 }, light: EP9.light(260, 1640, 1.1, 0.35), t: T, key: 'k9-kd' });
        },
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.32 }),
  });
})();
