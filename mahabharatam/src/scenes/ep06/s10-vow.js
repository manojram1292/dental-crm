/*
 * Ep 6 · line "vow" · NEXT · "The king vowed a sacrifice to burn every serpent."
 *
 * The king rises from his throne and lifts his hand (beats[0], "vowed"); behind him the
 * fire of the vow roars up to fill the hall (beats[1], "burn") and serpent shadows writhe
 * and fall in it (beats[2], "serpent"). His saffron rim burns in its light.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP6 = window.EP6;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'vow',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.8, b1 = env.beats[1] ?? 2.4;
      const rise = E.inOutCubic(clamp((t - 0.1) / 0.6));
      const vow = E.inOutCubic(clamp((t - (b0 - 0.3)) / 0.7));
      const fire = E.inOutSine(clamp((t - (b1 - 1.4)) / 1.8));
      EP6.court(ctx, T, {
        fire, throneX: 540, cam: { zoom: 1.12 - 0.08 * p, dy: -60 },
        after: (g) => {
          const lt = { dir: -Math.PI / 2 - 0.2, intensity: 1 + 0.3 * fire, front: 0.2 };
          CH.janamejaya.draw(g, { x: 560, y: 1500, scale: 0.66, facing: 'right', pose: rise < 0.5 ? 'sit' : { name: 'bless', k: vow }, expression: { mood: 'wrath', look: -0.08 }, light: lt, t: T, key: 'o6-king' });
        },
      });
    },
    post: () => ({ bloom: 0.5, vignette: 0.55, paper: 0.3 }),
  });
})();
