/* Ep 38 · line "cliff" · NEXT 1 · "But first, the priests said, Takshaka must come to the fire." · The four priests turn to the sky as one, ladles raised (beats[1]); in the smoke above the fire, the shape of a great green hood far off (beats[2]). EP38.call is reused by the Next overlay. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP38.call = (ctx, T, t, b2) => {
    const h = E.inOutSine(clamp((t - b2 + 0.8) / 1.2)), u = clamp(t / 5);
    EP37.blaze(ctx, T, { cam: { zoom: 1.0 + 0.08 * u, dy: -160 }, after: (g) => {
      if (h > 0) { g.save(); g.globalAlpha = 0.55 * h; CH.takshaka.draw(g, { x: 560, y: 900, scale: 0.4, facing: 'left', pose: { name: 'recoil', k: 0.4 }, light: { dir: Math.PI / 2, intensity: 1.0, front: 0.5, fill: 0.3 }, t: T, key: 'cl38-tk' }); g.restore(); }
      for (let i = 0; i < 4; i++) CH.priest.draw(g, { x: 150 + i * 260, y: 1900, scale: 0.6, facing: i < 2 ? 'right' : 'left', index: i, pose: { name: 'offer', k: 1 }, light: EP8.fireLight(150 + i * 260, 1600, 1.15, 0.7), t: T + i, key: 'cl38-p' + i });
    } });
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.2,
    draw(ctx, t, env) { EP38.call(ctx, env.T, t, env.beats[2]); },
    post: () => ({ bloom: 0.48, vignette: 0.5, paper: 0.3 }),
  });
})();
