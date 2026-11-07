/* Ep 33 · line "hang" · "Men hung in it, head down, clinging to one stalk of grass." · Down the shaft: five pale ancestors hang head-down from one tuft, swaying; the camera drifts down past them. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hang',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP33.pit(ctx, T, { view: 'down', cam: { zoom: 1.15, dy: lerp(-200, 120, p) }, after: (g) => {
        EP33.tuft(g, 540, 300, 1.2, T, { roots: 1 });
        for (let i = 0; i < 3; i++) { const x = 540 + (i - 1) * 230, y = 540 + Math.abs(i - 1) * 50; g.strokeStyle = '#8a7a4a'; g.lineWidth = 6; g.beginPath(); g.moveTo(540 + (i - 1) * 24, 380); g.lineTo(x, y); g.stroke(); EP33.hanging(g, x, y, 0.5, T, i, { key: 'hg33-p' }); }
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.55, paper: 0.3 }),
  });
})();
