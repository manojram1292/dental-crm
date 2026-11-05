/* Ep 23 · line "curse2" · "Supratika cursed him back: 'Become a tortoise!'" · The elephant's trunk swings toward the elder (beats[0]); on "tortoise" (beats[1]) the elder sinks into a tortoise. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP23 = window.EP23;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'curse2',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T;
      const b0 = env.beats[0] ?? 0.6, b1 = env.beats[1] ?? 1.9;
      const m = E.inOutCubic(clamp((t - b1 + 0.3) / 0.7));
      EP23.panel(ctx, T, {});
      ctx.save(); KIT.camera(ctx, { x: 540, y: 1300, zoom: 1.05, dx: 40 });
      EP23.brothers(ctx, T, { younger: 0, elder: 1 - m });
      CH.supratika.draw(ctx, { x: 820, y: 1500, scale: 0.42, facing: 'left', pose: { name: 'stand', trunk: -1.0 * E.outCubic(clamp((t - b0 + 0.3) / 0.5)) }, light: { dir: -Math.PI / 2, intensity: 1.05, front: 0.6 }, t: T, key: 'c23b-sup' });
      if (m > 0.01) CH.vibhavasu.draw(ctx, { x: 300, y: 1500, scale: 0.08 + 0.2 * m, facing: 'right', pose: { name: 'swim', phase: T }, light: { dir: -Math.PI / 2, intensity: 1.05, front: 0.6 }, t: T, alpha: m, key: 'c23b-vib' });
      KIT.glow(ctx, 300, 1250, 360, '#fff0c0', 0.6 * Math.sin(Math.PI * m));
      ctx.restore();
    },
    post: () => ({ bloom: 0.34, vignette: 0.44, paper: 0.4 }),
  });
})();
