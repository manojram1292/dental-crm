/* Ep 23 · line "curse1" · "Vibhavasu cursed him: 'Become an elephant!'" · The elder points (beats[0]); on "elephant" (beats[1]) the younger brother's figure swells into the elephant, in the same red-ochre panel. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP23 = window.EP23;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'curse1',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T;
      const b0 = env.beats[0] ?? 0.6, b1 = env.beats[1] ?? 1.8;
      const m = E.inOutCubic(clamp((t - b1 + 0.3) / 0.7));
      EP23.panel(ctx, T, {});
      ctx.save(); KIT.camera(ctx, { x: 540, y: 1300, zoom: 1.05 });
      EP23.brothers(ctx, T, { younger: 1 - m, elderPose: { name: 'speak', k: E.outCubic(clamp((t - b0 + 0.3) / 0.4)) } });
      if (m > 0.01) CH.supratika.draw(ctx, { x: 820, y: 1500, scale: 0.12 + 0.3 * m, facing: 'left', pose: { name: 'stand', trunk: Math.sin(T * 2) * 0.5 }, light: { dir: -Math.PI / 2, intensity: 1.05, front: 0.6 }, t: T, alpha: m, key: 'c23-sup' });
      KIT.glow(ctx, 780, 1200, 400, '#fff0c0', 0.6 * Math.sin(Math.PI * m));
      ctx.restore();
    },
    post: () => ({ bloom: 0.34, vignette: 0.44, paper: 0.4 }),
  });
})();
