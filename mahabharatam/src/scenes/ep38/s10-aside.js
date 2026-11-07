/* Ep 38 · line "aside" · "The guards stepped aside. The whole assembly fell silent." · The spears lift; the boy walks in alone down the long aisle between the seated priests, every head turning; a slow push behind him. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'aside',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur), lift = E.inOutSine(clamp(t / 0.8));
      EP38.noonSatra(ctx, T, { cam: { zoom: lerp(1.0, 1.15, p), dy: -200 }, after: (g) => {
        for (let i = 0; i < 6; i++) { const left = i < 3, x = left ? 160 + i * 70 : 760 + (i - 3) * 70, y = 1500 + (i % 3) * 120; CH.sage.draw(g, { x, y, scale: 0.4, facing: left ? 'right' : 'left', index: i, pose: { name: 'sit' }, expression: { look: lerp(0, 0.2, p) }, light: EP8.fireLight(x, y, 1.0, 0.5), t: T + i, key: 'as38-s' + i }); }
        CH.astika.draw(g, { x: 540, y: lerp(1950, 1600, p), scale: lerp(0.62, 0.48, p), facing: 'right', pose: { name: 'walk', phase: T * 2.6 }, light: EP8.fireLight(540, 1500, 1.1, 0.5), t: T, key: 'as38-as' });
        void lift;
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.46, paper: 0.3 }),
  });
})();
