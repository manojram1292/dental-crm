/*
 * Ep 13 · line "fire" · "Fire and smoke poured from Vasuki's mouths, and the mountain's forests burned."
 * CLOSE on the churning at night: the mountain turning, the asuras hauling at the right;
 * fire and smoke roll from Vasuki's mouths (beats[1]); on "burned" (beats[2]) the forests
 * catch. Warm red light on the whitening water; stylised flames.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11, EP12 = window.EP12;
  const { clamp, E } = R;
  R.scene({
    id: 'fire',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 1.8, b2 = env.beats[2] ?? 5.4;
      const fire = E.outCubic(clamp((t - b1 + 0.4) / 0.8)), burn = E.inOutSine(clamp((t - b2 + 1.0) / 1.2));
      EP11.sea(ctx, T, {
        cam: { zoom: 1.35 + 0.08 * p, dx: -90, dy: 120 }, hz: 1000, jewels: 0.2, milk: 0.35,
        after: (g) => {
          KIT.glow(g, 700, 900, 1200, '#ff5a20', 0.3 * fire + 0.25 * burn);
          EP12.churn(g, T, { cx: 540, y: 1560, s: 0.52, spin: T * 1.4, wrap: 1, hosts: 1, pull: Math.sin(T * 2.2), fire, burn });
          EP11.surf(g, 1520, T, 1, { color: '#ffe8d8', deep: '#3a2a6a', deep2: '#0a0624' });
        },
      });
    },
    post: () => ({ bloom: 0.48, vignette: 0.48, paper: 0.3 }),
  });
})();
