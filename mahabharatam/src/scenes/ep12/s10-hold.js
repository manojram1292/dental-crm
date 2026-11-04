/*
 * Ep 12 · line "hold" · "The gods took one end, the asuras the other."
 *
 * The whole rig, wide: on "gods" (beats[0]) the devas on the left take hold of the tail
 * and lean back; on "asuras" (beats[1]) the asuras on the right take the head's end.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11, EP12 = window.EP12;
  const { clamp, E } = R;

  R.scene({
    id: 'hold',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.3, b1 = env.beats[1] ?? 2;
      const hosts = E.outCubic(clamp((t - b0 + 0.3) / 0.6));
      EP11.sea(ctx, T, {
        cam: { zoom: 0.92 + 0.03 * p, dy: 40 }, hz: 1000, jewels: 0.4, milk: 0.15,
        after: (g) => {
          EP12.churn(g, T, { cx: 540, y: 1560, s: 0.52, spin: 0, wrap: 1, hosts, pull: t > b1 ? -0.4 : 0.4 });
          window.EP11.surf(g, 1520, T, 1, { color: '#dfe6ff', deep: '#1e2a6a', deep2: '#060a24' });
        },
      });
    },
    post: () => ({ bloom: 0.38, vignette: 0.45, paper: 0.3 }),
  });
})();
