/* Ep 35 · line "setting" · "The sun was setting. Asleep, he would miss his evening prayer." · NEW LIGHT, the world above at the sandhya hour: the red disc touching the forest, birds going home; the disc sinks. Recap band at the top. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'setting',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP35.sandhya(ctx, T, { sink: 0.2 + 0.6 * p, cam: { zoom: 1.05 + 0.1 * p } });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.4) / 0.3)), env.strings, { y: 300 });
    },
    post: () => ({ bloom: 0.46, vignette: 0.42, paper: 0.3 }),
  });
})();
