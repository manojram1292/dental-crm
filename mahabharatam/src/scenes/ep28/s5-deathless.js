/* Ep 28 · line "deathless" · Garuda: "And let me be free of age and death, without the amrita." · Garuda holds the pot out, away from himself, toward Vishnu. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP28 = window.EP28;
  const { clamp } = R;
  R.scene({
    id: 'deathless',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP28.dawnSky(ctx, T, { cam: { zoom: 1.35 + 0.05 * p, dx: -150, dy: -150 }, after: (g) => EP28.pair(g, T, 760, 1450, 0.55, { gpose: { name: 'carry', k: 1 }, gex: { speak: EP28.mouth(env, t) }, vx: 330, vy: 1600, vs: 0.65 }) });
    },
    post: () => ({ bloom: 0.4, vignette: 0.42, paper: 0.3 }),
  });
})();
