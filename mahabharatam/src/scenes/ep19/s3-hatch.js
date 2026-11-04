/* Ep 19 · line "hatch" · "In his own time, the second egg broke open." · The gold egg in its jar at the hermitage before dawn; on "broke" (beats[1]) it splits and fire pours out. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP9 = window.EP9;
  const { clamp, E } = R;
  R.scene({
    id: 'hatch',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 2;
      const cr = E.inOutSine(clamp((t - b1 + 1.0) / 1.0)), burst = E.outCubic(clamp((t - b1) / 0.6));
      EP9.hermitage(ctx, T, { glow: 0.5 + burst, cam: { zoom: 1.4 + 0.1 * p, dy: -300 }, after: (g) => {
        EP9.jar(g, 540, 1720, 1.3, T, { kind: 'gold', glow: 0.5 + cr, crack: burst });
        EP9.egg(g, 540, 1400, 110, 'gold', T, { glow: 0.6 + cr, crack: cr });
        KIT.glow(g, 540, 1400, 1400 * burst, '#ffb030', 0.9 * burst);
      } });
    },
    post: () => ({ bloom: 0.5, vignette: 0.45, paper: 0.3 }),
  });
})();
