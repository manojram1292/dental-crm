/*
 * Ep 18 · line "cliff" · NEXT (cliffhanger image) · "Then the second egg cracked open, and the sky caught fire."
 * Kashyapa's hermitage: the gold egg in its jar, LARGE; a crack of fire runs across it (beats[1]); on
 * "fire" (beats[2]) light bursts out and floods the sky gold and red.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP9 = window.EP9;
  const { clamp, E } = R;
  R.scene({
    id: 'cliff',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 1.9, b2 = env.beats[2] ?? 4.2;
      const cr = E.inOutSine(clamp((t - b1 + 0.6) / 1.0)), burst = E.outCubic(clamp((t - b2 + 0.4) / 0.6));
      EP9.hermitage(ctx, T, { glow: 0.6 + 0.6 * burst, cam: { zoom: 1.55 + 0.08 * p, dy: -380 }, after: (g) => {
        EP9.jar(g, 540, 1720, 1.4, T, { kind: 'gold', glow: 0.6 + cr });
        EP9.egg(g, 540, 1390, 120, 'gold', T, { glow: 0.6 + cr, crack: cr });
        KIT.glow(g, 540, 1390, 1600 * burst, '#ffb030', 0.9 * burst);
      } });
      if (burst > 0.01) { ctx.save(); ctx.globalAlpha = 0.5 * burst; ctx.globalCompositeOperation = 'lighter'; KIT.vgrad(ctx, 0, R.H, [[0, '#ff6a1a'], [0.5, '#ffb030'], [1, '#7a2a0a']]); ctx.restore(); }
    },
    post: () => ({ bloom: 0.5, vignette: 0.45, paper: 0.3 }),
  });
})();
