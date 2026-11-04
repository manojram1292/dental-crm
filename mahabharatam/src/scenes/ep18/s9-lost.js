/* Ep 18 · line "lost" · "Vinata had lost." · Close on Vinata, the rose light draining from her rim; Kadru's green glint at the edge of the frame. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'lost',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const dim = E.inOutSine(clamp(t / dur));
      EP11.shore(ctx, T, { cam: { zoom: 1.6, dx: 120, dy: -300 }, after: (g) => {
        CH.vinata.draw(g, { x: 640, y: 2000, scale: 1.2, facing: 'left', pose: { name: 'grieve', k: dim }, light: { dir: Math.atan2(1080 - 1400, 820 - 640), intensity: lerp(1.1, 0.6, dim), front: 0.45 }, t: T, key: 'l18-vn' });
        CH.kadru.draw(g, { x: 60, y: 2000, scale: 1.2, facing: 'right', pose: 'stand', expression: { mood: 'wrath' }, light: { dir: 0.3, intensity: 1.0, front: 0.3 }, t: T, key: 'l18-kd' });
      } });
    },
    post: () => ({ bloom: 0.38, vignette: 0.5, paper: 0.32 }),
  });
})();
