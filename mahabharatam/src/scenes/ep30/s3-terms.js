/* Ep 30 · line "terms" · Garuda: "Here is the amrita. Bathe first, then drink. And my mother is free." · Garuda over the pot on the kusha, wings half-open, facing the serpents (in the foreground, their hoods dark against the dawn). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP30 = window.EP30, EP15 = window.EP15;
  const { clamp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'terms',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP30.dawnIsle(ctx, T, { cam: { zoom: 1.3 + 0.04 * p, dy: -300 }, after: (g) => {
        EP30.kusha(g, 520, 1700, 0.8, T, {});
        EP15.potGlow(g, 520, 1640, 0.8, 1);
        CH.garuda.draw(g, { x: 720, y: 1700, scale: 0.6, facing: 'left', pose: { name: 'spread', k: 0.5 }, expression: { speak: EP30.mouth(env, t) }, light: EP30.dawn(720, 1700, 1.2), t: T, key: 't30-ga' });
      } });
      for (let i = 0; i < 3; i++) CH.naga.draw(ctx, { x: [80, 300, 1000][i], y: 2200, scale: [0.6, 0.45, 0.55][i], facing: i < 2 ? 'right' : 'left', index: i + 2, pose: { name: 'rise', k: 0.9 }, light: EP30.dawn(300, 2200, 0.8), t: T + i, key: 't30-n' + i });
    },
    post: () => ({ bloom: 0.38, vignette: 0.44, paper: 0.3 }),
  });
})();
