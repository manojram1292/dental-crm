/* Ep 22 · line "burn" · "But one of them burned in his throat, like a live coal." · Close on Garuda's head and neck in profile: a coal-red glow swells in the throat; on "coal" (beats[1]) he rears back. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP21 = window.EP21, EP22 = window.EP22;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'burn',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T;
      const b0 = env.beats[0] ?? 1, b1 = env.beats[1] ?? 2.4;
      const g0 = E.outCubic(clamp((t - b0 + 0.4) / 0.8)), rear = E.outBack ? E.outBack(clamp((t - b1) / 0.35)) : clamp((t - b1) / 0.35);
      EP22.dusty(ctx, T, { dust: 0.5, cam: { zoom: 1.6, dx: 200, dy: -300 } });
      ctx.save(); ctx.translate(700, 2300); ctx.rotate(0.25 * clamp(rear)); ctx.translate(-700, -2300);
      CH.garuda.draw(ctx, { x: 720, y: 3300, scale: 2.4, facing: 'left', pose: { name: 'stand' }, expression: { mood: t > b1 ? 'wrath' : undefined, look: -0.1 + 0.25 * clamp(rear) }, light: EP21.moon(720, 3300, 1.15), t: T, key: 'b22-ga' });
      EP21.coal(ctx, 698, 1480, 30 + 30 * g0, T, g0);
      ctx.restore();
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }),
  });
})();
