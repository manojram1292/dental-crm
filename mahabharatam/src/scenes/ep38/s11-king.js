/* Ep 38 · line "king" · Janamejaya speaks · "A boy, and he speaks like a sage. Choose a boon!" · The king rises from his seat, lit by the fire, his hand open toward the small boy (high-low: the boy dark in the foreground, the king beyond). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'king',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, up = E.inOutSine(clamp(t / 1.0));
      EP38.noonSatra(ctx, T, { cam: { zoom: 1.35, dy: -360, dx: -160 }, after: (g) => {
        CH.janamejaya.draw(g, { x: 900, y: 1640, scale: 0.85, facing: 'left', pose: { name: up > 0.4 ? 'speak' : 'sit', k: up }, expression: { speak: EPA.mouth(env, t) }, light: EP8.fireLight(660, 1400, 1.25, 0.8), t: T, key: 'k38-jj' });
        CH.astika.draw(g, { x: 420, y: 2150, scale: 0.9, facing: 'right', pose: { name: 'stand' }, light: { dir: 0, intensity: 0.9, front: 0.3, fill: 0.25 }, t: T, key: 'k38-as' });
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.48, paper: 0.3 }),
  });
})();
