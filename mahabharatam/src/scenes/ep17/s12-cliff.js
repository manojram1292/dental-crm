/* Ep 17 · line "cliff" · NEXT (cliffhanger image) · "At dawn the sisters flew out over the ocean to look." · Dawn over the endless sea; the two sisters fly out low over the waves toward the horizon. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'cliff',
    fadeIn: 0.35,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const f = E.inOutSine(p);
      EP17.ocean(ctx, T, { cam: { zoom: 1.0 + 0.06 * p }, after: (g) => {
        const L = { dir: -Math.PI / 2 + 0.3, intensity: 1.05, front: 0.45 };
        // flying: the figures pitched forward (rotated about the waist) over the waves, saris streaming
        EP17.flyer(g, (q, o) => CH.kadru.draw(q, o), lerp(980, 640, f), lerp(1400, 1000, f), lerp(0.55, 0.32, f), T, L, 'x17-kd');
        EP17.flyer(g, (q, o) => CH.vinata.draw(q, o), lerp(860, 560, f), lerp(1560, 1100, f), lerp(0.52, 0.3, f), T, L, 'x17-vn');
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.4, paper: 0.3 }),
  });
})();
