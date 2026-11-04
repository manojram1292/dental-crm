/*
 * Ep 17 · line "stakes" · "The loser would be the winner's slave. They would look at dawn."
 * The sisters face to face in silhouette, the sun sinking between them; the stake as a card ("The
 * loser becomes the winner's slave", beats[0..1]); on "dawn" (beats[2]) night comes down.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'stakes',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 0.3, b2 = env.beats[2] ?? 3.8;
      const night = E.inOutSine(clamp((t - b2 + 1.2) / 1.4));
      EP17.sunset(ctx, T, { night, after: (g) => {
        CH.kadru.draw(g, { x: 270, y: 1960, scale: 0.98, facing: 'right', pose: 'stand', light: EP17.sunLight(270, 1960), t: T, key: 's17-kd' });
        CH.vinata.draw(g, { x: 820, y: 1960, scale: 0.95, facing: 'left', pose: 'stand', light: EP17.sunLight(820, 1960), t: T, key: 's17-vn' });
      } });
      const la = clamp((t - b0) / 0.5) * (1 - clamp((t - b2 + 0.3) / 0.5));
      EP17.plaque(ctx, env.strings.stakeLabel, null, KIT.CX, 820, la, { size: 40, key: 's17-stake' });
      void dur;
    },
    post: () => ({ bloom: 0.38, vignette: 0.45, paper: 0.32 }),
  });
})();
