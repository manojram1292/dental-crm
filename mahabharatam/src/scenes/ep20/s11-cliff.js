/* Ep 20 · line "cliff" · NEXT 1 · "Garuda asked them:" · Garuda turns to face the serpents, LARGE on the beach. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP20 = window.EP20;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'cliff',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP20.island(ctx, T, { cam: { zoom: 2.4, dy: -620 }, after: (g) => {
        CH.garuda.draw(g, { x: 600, y: 1400, scale: 0.55, facing: p > 0.5 ? 'right' : 'left', pose: 'stand', light: EP20.noon(600, 1400), t: T, key: 'x20-ga' });
        for (let i = 0; i < 3; i++) CH.naga.draw(g, { x: 340 + i * 60, y: 1400, scale: 0.24, facing: 'right', index: i, pose: { name: 'rise', k: 0.9 }, light: EP20.noon(340, 1400), t: T + i, key: 'x20-n' + i });
      } });
      void E;
    },
    post: () => ({ bloom: 0.36, vignette: 0.4, paper: 0.32 }),
  });
})();
