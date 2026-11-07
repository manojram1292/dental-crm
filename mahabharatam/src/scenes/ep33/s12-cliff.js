/* Ep 33 · line "cliff" · NEXT 1 · "And one family had been waiting for him: the serpents." · The dawn wilderness from low behind the thorn scrub: serpents' heads rise at both edges of the frame (beats[1]) and watch the ascetic walk away down the riverbed. EP33.waiting is reused by the Next overlay. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP33.waiting = (ctx, T, t, b1) => {
    const up = E.outCubic(clamp((t - b1 + 0.9) / 0.9)), u = clamp(t / 5);
    EP33.wild(ctx, T, { dawn: 1, trees: [[960, 1380, 0.7]], cam: { zoom: 1.12 + 0.06 * u, dy: -60 }, after: (g) => {
      CH.jaratkaru.draw(g, { x: lerp(500, 600, u), y: 1440, scale: 0.34, facing: 'right', pose: { name: 'walk', phase: T * 2.4 }, light: { dir: -0.4, intensity: 1.1, front: 0.6, fill: 0.5 }, t: T, key: 'c33-jk' });
      const L = { dir: -0.5, intensity: 1.05, front: 0.6, fill: 0.4 };
      CH.naga.draw(g, { x: 120, y: lerp(2400, 1800, up), scale: 0.62, facing: 'right', index: 0, pose: { name: 'rise', k: 0.8 }, light: L, t: T, key: 'c33-n1' });
      CH.vasuki.draw(g, { x: 1000, y: lerp(2400, 1760, up), scale: 0.6, facing: 'left', pose: { name: 'rise', k: 0.8 }, light: L, t: T + 1, key: 'c33-va' });
    } });
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.2,
    draw(ctx, t, env) { EP33.waiting(ctx, env.T, t, env.beats[1]); },
    post: () => ({ bloom: 0.42, vignette: 0.46, paper: 0.32 }),
  });
})();
