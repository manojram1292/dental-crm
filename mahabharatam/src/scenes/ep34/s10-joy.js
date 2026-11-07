/* Ep 34 · line "joy" · "And the serpents rejoiced." · The rows of serpents in the gold hall sway, close and low; above the fire a faint gold medallion of the boy (episode 32's) glows and fades. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'joy',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EPA.hall(ctx, T, { mood: 'gold', cam: { zoom: 1.5 + 0.08 * p, dy: -420 }, after: (g) => {
        for (let i = 0; i < 6; i++) { const x = 120 + i * 170; CH.naga.draw(g, { x, y: 1700 + (i % 2) * 50, scale: 0.36, facing: i < 3 ? 'right' : 'left', index: [0, 2, 3, 5, 0, 2][i], pose: { name: 'rise', k: 0.6 + 0.3 * Math.sin(T * 3 + i) }, light: EP34.lamp(x, 1700, 540, 1500, 1.0), t: T + i, key: 'j34-n' + i }); }
      } });
      const m = Math.sin(clamp(t / env.dur) * Math.PI);
      if (window.EP32 && window.EP32.medal) window.EP32.medal(ctx, 540, 700, 150, 0.85 * m, 'boy', T, 'j34-m');
    },
    post: () => ({ bloom: 0.46, vignette: 0.44, paper: 0.3 }),
  });
})();
