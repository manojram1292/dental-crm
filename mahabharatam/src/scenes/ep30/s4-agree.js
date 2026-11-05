/* Ep 30 · line "agree" · the serpents: "So be it. She is free." · The serpents rear round the pot, eager, their heads bobbing. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP30 = window.EP30, EP15 = window.EP15;
  const { clamp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'agree',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP30.dawnIsle(ctx, T, { cam: { zoom: 2.0 + 0.06 * p, dy: -700 }, after: (g) => {
        EP30.kusha(g, 520, 1700, 0.8, T, {});
        EP15.potGlow(g, 520, 1640, 0.8, 1);
        for (let i = 0; i < 5; i++) { const x = 320 + i * 100; CH.naga.draw(g, { x, y: 1720 + (i % 2) * 10, scale: [0.2, 0.24, 0.28, 0.24, 0.2][i], facing: x < 520 ? 'right' : 'left', index: i, pose: { name: 'rise', k: 0.8 + 0.2 * Math.sin(T * 4 + i) }, expression: { speak: EP30.mouth(env, t) }, light: EP30.dawn(x, 1720), t: T + i, key: 'a30-n' + i }); }
      } });
    },
    post: () => ({ bloom: 0.38, vignette: 0.42, paper: 0.3 }),
  });
})();
