/* Ep 28 · line "meet" · "Flying out with the amrita, Garuda met Vishnu in the sky." · NEW LIGHT: first light over a cloud-sea: Vishnu in the air in his deep-blue light; Garuda comes in from the right with the pot; the plaque. Unvoiced recap band first 2.6 s. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP28 = window.EP28;
  const { clamp, E, lerp } = R;
  R.scene({
    id: 'meet',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = E.inOutSine(clamp(t / dur));
      const b1 = env.beats[1] ?? 2;
      EP28.dawnSky(ctx, T, { cam: { zoom: 1.0 }, after: (g) => EP28.pair(g, T, lerp(1100, 800, p), lerp(1100, 1350, p), 0.45, { gpose: { name: 'fly', phase: T * 4 }, vx: 330, vy: 1550, vs: 0.65 }) });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.6) / 0.35)), env.strings, { y: 1640 });
      const la = clamp((t - b1 + 0.2) / 0.3) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP28.plaque(ctx, env.strings.vishnuName, env.strings.vishnuEpithet, 330, 720, la, { size: 48, key: 'm28-name' });
    },
    post: () => ({ bloom: 0.4, vignette: 0.4, paper: 0.3 }),
  });
})();
