/* Ep 40 · line "arcend" · the ARC-END CARD (silent, ≈ 1.5 s): over the told shot (still moving), the lapis cartouche: THE END OF AN ARC · ASTIKA · Episodes 31–40 · the playlist line. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39, EP40 = window.EP40;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'arcend',
    draw(ctx, t, env) {
      EP40.told(ctx, env.T, 5 + t);
      EP40.arcCard(ctx, env.T, E.outCubic(clamp(t / 0.3)) * (1 - clamp((t - env.dur + 0.25) / 0.25)), env.strings);
    },
    post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.3 }),
  });
})();
