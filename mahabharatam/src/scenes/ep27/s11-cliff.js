/* Ep 27 · line "cliff" · NEXT 1 (the catalog line) · "On his way out, he met Vishnu." · The open sky at deep blue dusk: Garuda with the pot rises at the right; at the left a deep-blue light opens and Narayana stands in the air, waiting. EP27.meet is reused by the Next overlay. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP27 = window.EP27, EP15 = window.EP15;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP27.meet = (ctx, T, t, b0) => {
    const v = E.outCubic(clamp((t - b0 + 0.6) / 0.8));
    EP27.open(ctx, T, { vishnu: v, vx: 330, vy: 900, after: (g) => {
      CH.vishnu.draw(g, { x: 330, y: 1500, scale: 0.7, facing: 'front', pose: { name: 'stand' }, alpha: v, light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.55 }, t: T, key: 'mt27-vi' });
      CH.garuda.draw(g, { x: 820, y: lerp(1900, 1700, clamp(t / 3)), scale: 0.5, facing: 'left', pose: { name: 'carry', k: 1 }, light: { dir: Math.PI, intensity: 1.15, front: 0.6 }, t: T, key: 'mt27-ga' });
      EP15.potGlow(g, 820 - 110, 1700 - 280, 0.9, 1);
    } });
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.25,
    draw(ctx, t, env) { EP27.meet(ctx, env.T, t, env.beats[0] ?? 1); },
    post: () => ({ bloom: 0.44, vignette: 0.44, paper: 0.3 }),
  });
})();
