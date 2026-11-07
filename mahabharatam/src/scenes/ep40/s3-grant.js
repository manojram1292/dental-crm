/* Ep 40 · line "grant" · Janamejaya speaks · "So be it. Let the sacrifice end. Let Takshaka live." · The king lowers his raised arm, lit gold, the fire to the side; his face eases; a slow push. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39, EP40 = window.EP40;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'grant',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP40.embers(ctx, T, { k: 0.15 * p, cam: { zoom: lerp(1.5, 1.65, p), dy: -420, dx: -200 }, after: (g) => {
        CH.janamejaya.draw(g, { x: 840, y: 1800, scale: 0.95, facing: 'left', pose: { name: 'bless', k: 1 - 0.5 * p }, expression: { speak: EPA.mouth(env, t) }, light: { ...EP8.fireLight(840, 1500, 1.25, 0.8), fill: 0.5 }, t: T, key: 'g40-jj' });
      } });
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }),
  });
})();
