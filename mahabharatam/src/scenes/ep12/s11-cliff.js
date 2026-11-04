/*
 * Ep 12 · line "cliff" · NEXT (cliffhanger image) · "They began to churn, and the ocean began to burn."
 *
 * The mountain begins to turn (spin), the hosts haul in turn; on "burn" (beats[1]) fire and
 * smoke roll from Vasuki's mouths and the forests on the mountain catch fire, red light on
 * the whitening water. Stylised fire, no ruin.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11, EP12 = window.EP12;
  const { clamp, E } = R;

  R.scene({
    id: 'cliff',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1, b1 = env.beats[1] ?? 3.8;
      const go = E.inOutSine(clamp((t - b0 + 0.5) / 1.5));
      const spin = go * Math.sin(T * 1.6) * 1.2 + go * t * 0.8;
      const burn = E.inOutSine(clamp((t - b1 + 0.6) / 1.0));
      EP11.sea(ctx, T, {
        cam: { zoom: 1.0 + 0.06 * p, dy: 30 }, hz: 1000, jewels: 0.3, milk: 0.25 + 0.3 * go,
        after: (g) => {
          KIT.glow(g, 540, 1000, 1200, '#ff5a20', 0.35 * burn);
          EP12.churn(g, T, { cx: 540, y: 1560, s: 0.52, spin, wrap: 1, hosts: 1, pull: Math.sin(T * 1.6), fire: burn, burn });
          window.EP11.surf(g, 1520, T, 1, { color: '#ffe8d8', deep: '#3a2a6a', deep2: '#0a0624' });
        },
      });
    },
    post: () => ({ bloom: 0.45, vignette: 0.48, paper: 0.3 }),
  });
})();
