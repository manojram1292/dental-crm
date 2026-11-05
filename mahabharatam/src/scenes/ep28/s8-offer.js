/* Ep 28 · line "offer" · Garuda: "I too will give you a boon. Ask, Lord." · Garuda bows his head to Vishnu, wings half-folded, the pot held low. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP28 = window.EP28;
  const { clamp, E } = R;
  R.scene({
    id: 'offer',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP28.dawnSky(ctx, T, { cam: { zoom: 1.25 + 0.04 * p, dx: 60, dy: -60 }, after: (g) => EP28.pair(g, T, 740, 1520, 0.55, { gpose: { name: 'bow', k: 0.5 * E.inOutSine(clamp(t / 0.8)) }, gex: { speak: EP28.mouth(env, t) }, vx: 330, vy: 1600, vs: 0.68, pot: false }) });
    },
    post: () => ({ bloom: 0.4, vignette: 0.42, paper: 0.3 }),
  });
})();
