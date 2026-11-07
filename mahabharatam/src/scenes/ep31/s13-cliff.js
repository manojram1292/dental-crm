/* Ep 31 · line "cliff" · NEXT 1 · "Vasuki, his brother, chose another way. He called a council." · Vasuki's hall in the Naga world in violet: Vasuki rears on his throne-coil (beats[0]); serpents gather from the dark (beats[2]). EPA.council31 is reused by the Next overlay. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EPA.council31 = (ctx, T, t, b2) => {
    const g0 = E.outCubic(clamp((t - b2 + 0.6) / 0.8)), push = clamp(t / 6);
    EPA.hall(ctx, T, { mood: 'violet', cam: { zoom: 1.0 + 0.22 * push, dy: -80 - 120 * push }, after: (g) => {
      CH.vasuki.draw(g, { x: 560, y: 1640, scale: 0.62, facing: 'left', pose: { name: 'rise', k: 0.75 + 0.25 * push }, light: EPA.lit(560, 1600, 540, 600, 1.1, 0.6, 0.4), t: T, key: 'c31-va' });
      for (let i = 0; i < 6; i++) { const x = [80, 220, 340, 760, 880, 1010][i], y = 1880 + (i % 2) * 30; CH.naga.draw(g, { x: lerp(x < 540 ? -200 : 1280, x, Math.max(g0, 0.6 * push)), y, scale: 0.26, facing: x < 540 ? 'right' : 'left', index: i, pose: { name: 'rise', k: 0.6 }, light: EPA.lit(x, y, 540, 900, 0.9, 0.5, 0.3), t: T + i, key: 'c31-n' + i }); }
    } });
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.25,
    draw(ctx, t, env) { EPA.council31(ctx, env.T, t, env.beats[2]); },
    post: () => ({ bloom: 0.42, vignette: 0.48, paper: 0.3 }),
  });
})();
