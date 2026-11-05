/* Ep 21 · line "nishadas" · Vinata: "In a bay of the ocean live the Nishadas. Eat them." · NEW LIGHT: the bay at moonrise, teal and silver: a far village of huts on stilts, boats, small fires; the plaque on "Nishadas". */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP21 = window.EP21;
  const { clamp, E } = R;
  R.scene({
    id: 'nishadas',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = E.inOutSine(clamp(t / dur));
      const b1 = env.beats[1] ?? 1.5;
      EP21.bay(ctx, T, { cam: { zoom: 1.15 + 0.35 * p, dx: 30 * p, dy: 40 } });
      const la = clamp((t - b1 + 0.2) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP21.plaque(ctx, env.strings.nishadaName, env.strings.nishadaEpithet, KIT.CX, 300, la, { size: 58, key: 'n21-name' });
    },
    post: () => ({ bloom: 0.36, vignette: 0.48, paper: 0.32 }),
  });
})();
