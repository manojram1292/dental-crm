/* Ep 18 · line "fly" · "The sisters flew out over the ocean, the home of all the waters." · From high above: the sisters small over the vast dawn ocean, the waves wheeling; the camera follows. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17;
  const { clamp, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'fly',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP17.ocean(ctx, T, { hz: 200, cam: { zoom: 1.0 + 0.1 * p, dy: lerp(0, -80, p) }, after: (g) => {
        const L = { dir: -Math.PI / 2 + 0.6, intensity: 1.05, front: 0.5 };
        EP17.flyer(g, (q, o) => CH.kadru.draw(q, o), lerp(300, 520, p), lerp(1300, 1000, p), 0.4, T, L, 'f18-kd');
        EP17.flyer(g, (q, o) => CH.vinata.draw(q, o), lerp(560, 740, p), lerp(1420, 1120, p), 0.38, T, L, 'f18-vn');
      } });
    },
    post: () => ({ bloom: 0.38, vignette: 0.4, paper: 0.3 }),
  });
})();
