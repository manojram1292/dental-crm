/* Ep 22 · line "both" · Garuda: "Then take her with you. Go, both of you." · Wide on the moonlit sand: the brahmin and his wife walk out from beside the lowered beak together. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP21 = window.EP21, EP22 = window.EP22;
  const { clamp, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'both',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP21.bay(ctx, T, { village: 0.6, cam: { zoom: 1.3, dy: -260 }, after: (g) => {
        CH.garuda.draw(g, { x: 780, y: 1470, scale: 0.6, facing: 'left', pose: { name: 'bow', k: 0.8 }, expression: { speak: EP22.mouth(env, t) }, light: EP21.moon(780, 1470, 1.1), t: T, key: 'b22b-ga' });
        const x = lerp(560, 330, p);
        CH.brahmin.draw(g, { x, y: 1480, scale: 0.3, facing: 'left', pose: { name: 'walk', phase: T * 5 }, light: EP21.moon(x, 1480, 1.0), t: T, key: 'b22b-br' });
        CH.nishadi.draw(g, { x: x + 80, y: 1480, scale: 0.28, facing: 'left', pose: { name: 'walk', phase: T * 5 + 1 }, light: EP21.moon(x + 80, 1480, 1.0), t: T, key: 'b22b-ni' });
      } });
    },
    post: () => ({ bloom: 0.4, vignette: 0.45, paper: 0.32 }),
  });
})();
