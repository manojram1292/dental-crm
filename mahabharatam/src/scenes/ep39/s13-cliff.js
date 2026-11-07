/* Ep 39 · line "cliff" · NEXT 1 · "Would the king keep his word?" · Close on Janamejaya's face, torn, lit by the fire; above and behind him, small, the suspended serpent in its rings. EP39.word is reused by the Next overlay. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP39.word = (ctx, T, t) => {
    const u = clamp(t / 4);
    EP37.blaze(ctx, T, { cam: { zoom: 1.8 + 0.1 * u, dy: -520, dx: -120 }, after: (g) => {
      CH.takshaka.draw(g, { x: 420, y: 1000 + 8 * Math.sin(T * 1.5), scale: 0.26, facing: 'left', pose: { name: 'recoil', k: 0.8 }, light: { dir: Math.PI / 2, intensity: 1.1, front: 0.7, fill: 0.4 }, t: T, key: 'w39-tk' });
      EP39.rings(g, 420, 900, 180, T, 1);
      CH.janamejaya.draw(g, { x: 760, y: 1900, scale: 0.95, facing: 'left', pose: { name: 'stand' }, expression: { look: -0.12 }, light: EP39.fireLit(760, 1500, 1.25), t: T, key: 'w39-jj' });
    } });
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.2,
    draw(ctx, t, env) { EP39.word(ctx, env.T, t); },
    post: () => ({ bloom: 0.48, vignette: 0.52, paper: 0.3 }),
  });
})();
