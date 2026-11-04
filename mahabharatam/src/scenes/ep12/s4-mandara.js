/*
 * Ep 12 · line "mandara" · "With Mandara: a mountain of forests, as deep below the earth as it rose above."
 *
 * NEW PLACE AND LIGHT: the plain of the world in clear high daylight (EP12.earth), Mandara
 * standing in it with its forests and waterfalls. Name card on "Mandara" (beats[0]); the
 * camera tilts DOWN through the cut-away earth to its roots (beats[1] 'below') and back UP
 * to the summit on "above" (beats[2]).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP12 = window.EP12;
  const { clamp, E, lerp } = R;

  R.scene({
    id: 'mandara',
    fadeIn: 0.35,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 0.5, b1 = env.beats[1] ?? 4, b2 = env.beats[2] ?? 5.5;
      const down = E.inOutCubic(clamp((t - b0 - 0.6) / (b1 - b0 - 0.4))), up = E.inOutCubic(clamp((t - b1 - 0.2) / (b2 - b1 + 0.4)));
      const dy = lerp(150, -650, down) + 750 * up;
      EP12.earth(ctx, T, { lift: 0, gy: 1180, ms: 0.5, cam: { zoom: 1.0, dy } });
      const la = clamp((t - b0) / 0.5) * (1 - clamp((t - b0 - 2.2) / 0.4));
      EP12.plaque(ctx, env.strings.mandaraName, env.strings.mandaraEpithet, KIT.CX, 820, la, { size: 64, key: 'm12-name' });
    },
    post: () => ({ bloom: 0.3, vignette: 0.32, paper: 0.34 }),
  });
})();
