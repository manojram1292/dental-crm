/* Ep 39 · line "boon" · Astika claims his boon · "Stop this sacrifice. Let no more serpents fall." · The boy before the king (boy right, lit, close; the king mid-ground left, his face falling); the fire off to the side. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'boon',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP38.noonSatra(ctx, T, { cam: { zoom: 1.45 + 0.05 * p, dy: -380, dx: 140 }, after: (g) => {
        CH.janamejaya.draw(g, { x: 300, y: 1600, scale: 0.72, facing: 'right', pose: { name: 'stand' }, expression: { look: 0.1 }, light: EP39.fireLit(300, 1400, 1.15), t: T, key: 'b39-jj' });
        CH.astika.draw(g, { x: 640, y: 1840, scale: 0.85, facing: 'left', pose: { name: 'speak', k: 1 }, expression: { speak: EPA.mouth(env, t) }, light: { dir: -Math.PI / 2 - 0.5, intensity: 1.25, front: 0.85, fill: 0.55 }, t: T, key: 'b39-as' });
      } });
    },
    post: () => ({ bloom: 0.46, vignette: 0.48, paper: 0.3 }),
  });
})();
