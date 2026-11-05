/* Ep 28 · line "mount" · Vishnu: "Then be my mount." · Close two-shot: Vishnu's hand comes to rest on Garuda's shoulder. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP28 = window.EP28;
  const { clamp, E } = R;
  R.scene({
    id: 'mount',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T;
      EP28.dawnSky(ctx, T, { cam: { zoom: 1.7, dx: 100, dy: -480 }, after: (g) => EP28.pair(g, T, 640, 1560, 0.55, { gpose: { name: 'bow', k: 0.4 }, vx: 400, vy: 1600, vs: 0.7, vpose: { name: 'bless', k: E.inOutSine(clamp(t / 0.8)) }, vex: { speak: EP28.mouth(env, t) }, pot: false }) });
    },
    post: () => ({ bloom: 0.4, vignette: 0.44, paper: 0.3 }),
  });
})();
