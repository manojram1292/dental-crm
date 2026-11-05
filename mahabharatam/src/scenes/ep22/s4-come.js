/* Ep 22 · line "come" · Garuda: "Come out! I will never harm a brahmin." · On the moonlit sand Garuda bows low, beak to the ground, careful; the coal glows at his throat. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP21 = window.EP21, EP22 = window.EP22;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'come',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const bow = E.inOutSine(clamp(t / 0.9));
      EP21.bay(ctx, T, { village: 0.4, cam: { zoom: 1.5, dy: -380 }, after: (g) => {
        CH.garuda.draw(g, { x: 560, y: 1480, scale: 0.62, facing: 'left', pose: { name: 'bow', k: 0.9 * bow }, expression: { speak: EP22.mouth(env, t) }, light: EP21.moon(560, 1480, 1.15), t: T, key: 'c22-ga' });
      } });
      void p;
    },
    post: () => ({ bloom: 0.4, vignette: 0.45, paper: 0.32 }),
  });
})();
