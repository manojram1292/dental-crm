/* Ep 23 · line "tell" · "Kashyapa told him: the sage Vibhavasu had a younger brother, Supratika." · NEW LIGHT: the tale as a red-ochre mural panel: the two brothers seated, the elder stern; their plaques on their names. The unvoiced recap band rides the first 2.6 s. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP23 = window.EP23;
  const { clamp, E } = R;
  const CH = KIT.characters;
  EP23.brothers = (ctx, T, o = {}) => {
    const L = { dir: -Math.PI / 2 - 0.3, intensity: 1.05, front: 0.6 };
    if ((o.elder ?? 1) > 0.01) CH.sage.draw(ctx, { x: 300, y: 1480, scale: 0.8, facing: 'front', index: 5, pose: o.elderPose || 'sit', light: L, t: T, alpha: o.elder ?? 1, key: 'b23-e' });
    if ((o.younger ?? 1) > 0.01) CH.sage.draw(ctx, { x: 780, y: 1480, scale: 0.72, facing: 'front', index: 2, pose: o.youngerPose || 'sit', light: L, t: T, alpha: o.younger ?? 1, key: 'b23-y' });
  };
  R.scene({
    id: 'tell',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1.5, b1 = env.beats[1] ?? 3.5;
      EP23.panel(ctx, T, {});
      ctx.save(); KIT.camera(ctx, { x: 540, y: 1300, zoom: 1.0 + 0.06 * p }); EP23.brothers(ctx, T, {}); ctx.restore();
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.4) / 0.35)), env.strings, { y: 1640 });
      const la = clamp((t - b0) / 0.3) * (1 - clamp((t - dur + 0.3) / 0.3)), lb = clamp((t - b1) / 0.3) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP23.plaque(ctx, env.strings.vibhavasuName, env.strings.vibhavasuEpithet, 300, 760, la, { size: 44, key: 't23-v' });
      EP23.plaque(ctx, env.strings.supratikaName, env.strings.supratikaEpithet, 780, 860, lb, { size: 44, key: 't23-s' });
      void E;
    },
    post: () => ({ bloom: 0.3, vignette: 0.44, paper: 0.4 }),
  });
})();
