/* Ep 39 · line "order" · Janamejaya speaks · "If Indra shields him, let Indra burn too!" · Low angle: the king at the fire, arm flung up at the sky, the fire to the side so his face is lit. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'order',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, up = E.outCubic(clamp(t / 0.8));
      EP37.blaze(ctx, T, { cam: { zoom: 1.4, dy: -300, dx: -200 }, after: (g) => {
        CH.janamejaya.draw(g, { x: 830, y: 1780, scale: 1.0, facing: 'left', pose: { name: 'speak', k: up }, expression: { mood: 'wrath', speak: EPA.mouth(env, t) }, light: EP39.fireLit(830, 1500, 1.25), t: T, key: 'o39-jj' });
      } });
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }),
  });
})();
