/*
 * Ep 11 · line "ocean" · "Before them lay the ocean, full of jewels and monsters."
 *
 * NEW PLACE AND LIGHT: the cosmic ocean at night (EP11.sea), cold silver on the horizon.
 * The camera sinks from the sky to the waterline; on "jewels" (beats[1]) gems glint in the
 * depths; on "monsters" (beats[2]) a makara arches out of the swell.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { clamp, E, lerp } = R;

  R.scene({
    id: 'ocean',
    fadeIn: 0.35,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 2.6, b2 = env.beats[2] ?? 3.5;
      const sink = E.inOutCubic(clamp(t / (dur * 0.8)));
      EP11.sea(ctx, T, {
        cam: { zoom: lerp(1.05, 1.25, sink), dy: lerp(200, -150, sink) },
        jewels: 0.45 + 0.55 * E.outCubic(clamp((t - b1 + 0.3) / 0.6)),
        monster: E.outBack ? E.outBack(clamp((t - b2 + 0.4) / 0.9)) : E.outCubic(clamp((t - b2 + 0.4) / 0.9)), monsterX: 680, monsterY: 1330, monsterS: 1.1,
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.48, paper: 0.3 }),
  });
})();
