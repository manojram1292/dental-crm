/* Ep 36 · line "hope" · "And the serpents watched him, and remembered the promise." · The hall at dawn: the boy walks through the rows of serpents, who turn as he passes; Elapatra among them, larger. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35, EP36 = window.EP36;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hope',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur), bx = lerp(180, 860, p);
      EPA.hall(ctx, T, { mood: 'dawn', cam: { zoom: 1.25, dy: -460, dx: lerp(-60, 60, p) }, after: (g) => {
        CH.astika.draw(g, { x: bx, y: 1560, scale: 0.55, facing: 'right', pose: { name: 'walk', phase: T * 2.6 }, light: { dir: -Math.PI / 2 - 0.3, intensity: 1.15, front: 0.75, fill: 0.5 }, t: T, key: 'hp36-as' });
        for (let i = 0; i < 6; i++) { const x = 100 + i * 180; CH[i === 3 ? 'elapatra' : 'naga'].draw(g, { x, y: 1800, scale: i === 3 ? 0.42 : 0.32, facing: x < bx ? 'right' : 'left', index: [0, 2, 3, 0, 5, 2][i], pose: { name: 'rise', k: 0.6 }, light: { dir: -Math.PI / 2, intensity: 1, front: 0.6, fill: 0.4 }, t: T + i, key: 'hp36-n' + i }); }
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.46, paper: 0.3 }),
  });
})();
