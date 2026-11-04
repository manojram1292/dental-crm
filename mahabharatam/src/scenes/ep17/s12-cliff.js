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
        CH.kadru.draw(g, { x: lerp(980, 640, f), y: lerp(1500, 1100, f), scale: lerp(0.55, 0.32, f), facing: 'left', pose: { name: 'walk', phase: T * 2 }, light: L, t: T, key: 'x17-kd' });
        CH.vinata.draw(g, { x: lerp(860, 560, f), y: lerp(1650, 1180, f), scale: lerp(0.52, 0.3, f), facing: 'left', pose: { name: 'walk', phase: T * 2 + 1 }, light: L, t: T, key: 'x17-vn' });
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.4, paper: 0.3 }),
  });
})();
