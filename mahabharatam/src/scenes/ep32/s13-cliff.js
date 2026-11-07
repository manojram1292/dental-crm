/* Ep 32 · line "cliff" · NEXT 1 · "So the serpents watched for Jaratkaru, a sage who never wanted a wife." · NEW LIGHT, a forest at night in teal moonlight: serpents' eyes in the roots; along the moonlit path a gaunt ascetic walks alone, coming toward us. EP32.watch is reused by the Next overlay. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP32 = window.EP32;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP32.watch = (ctx, T, t) => {
    const u = clamp(t / 6);
    EP32.forest(ctx, T, { cam: { zoom: 1.0 + 0.12 * u }, after: (g) => {
      CH.jaratkaru.draw(g, { x: lerp(470, 560, u), y: lerp(1240, 1310, u), scale: lerp(0.4, 0.5, u), facing: 'right', pose: { name: 'walk', phase: T * 3 }, light: { dir: Math.atan2(260 - 900, 820 - 500), intensity: 1.1, front: 0.6, fill: 0.4 }, t: T, key: 'w32-jk' });
      CH.naga.draw(g, { x: 120, y: 1980, scale: 0.42, facing: 'right', index: 0, pose: { name: 'rise', k: 0.5 }, light: { dir: -0.6, intensity: 0.9, front: 0.4, fill: 0.2 }, t: T, key: 'w32-n1' });
      CH.naga.draw(g, { x: 1000, y: 2040, scale: 0.38, facing: 'left', index: 3, pose: { name: 'rise', k: 0.45 }, light: { dir: -2.3, intensity: 0.9, front: 0.4, fill: 0.2 }, t: T + 2, key: 'w32-n2' });
    } });
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.25,
    draw(ctx, t, env) { EP32.watch(ctx, env.T, t); },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }),
  });
})();
