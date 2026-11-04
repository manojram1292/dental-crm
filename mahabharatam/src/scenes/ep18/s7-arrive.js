/* Ep 18 · line "arrive" · "They came down where the horse stood." · Dawn on the far shore: the sisters alight beside the horse, seen from behind them. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'arrive',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const d = E.outCubic(clamp(t / (dur * 0.7)));
      EP11.shore(ctx, T, { cam: { zoom: 1.1, dy: -60 }, horse: { x: 620, y: 1260, scale: 0.42, facing: 'right', pose: { name: 'stand', tail: 1 } }, after: (g) => {
        const L = { dir: Math.atan2(1080 - 1300, 820 - 300), intensity: 1.05, front: 0.3 };
        CH.kadru.draw(g, { x: 260, y: lerp(1700, 2000, d), scale: 1.05, facing: 'right', pose: 'stand', light: L, t: T, key: 'a18-kd' });
        CH.vinata.draw(g, { x: 900, y: lerp(1720, 2000, d), scale: 1.0, facing: 'left', pose: 'stand', light: L, t: T, key: 'a18-vn' });
      } });
    },
    post: () => ({ bloom: 0.4, vignette: 0.4, paper: 0.32 }),
  });
})();
