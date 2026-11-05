/* Ep 29 · line "plan" · Garuda: "I will let no one drink it. Where I set it down, take it." · The two in the rainbow sky, the pot between them; Garuda's wing points down toward the earth. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP29 = window.EP29, EP15 = window.EP15;
  const { clamp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'plan',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP29.rainbow(ctx, T, { cam: { zoom: 1.3 + 0.04 * p, dy: -200 }, after: (g) => {
        CH.indra.draw(g, { x: 330, y: 1600, scale: 0.75, facing: 'right', pose: 'stand', light: EP29.clear(330, 1600), t: T, key: 'pl29-in' });
        CH.garuda.draw(g, { x: 800, y: 1650, scale: 0.6, facing: 'left', pose: { name: 'spread', k: 0.6 }, expression: { speak: EP29.mouth(env, t) }, light: EP29.clear(800, 1650, 1.2), t: T, key: 'pl29-ga' });
        EP15.potGlow(g, 560, 1200, 0.8, 1);
      } });
    },
    post: () => ({ bloom: 0.4, vignette: 0.42, paper: 0.3 }),
  });
})();
