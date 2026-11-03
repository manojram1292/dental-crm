/*
 * Line "fire" · "There, for twelve years, sages had tended a sacred fire."
 *
 * The clearing in the Naimisha forest. The sacred fire burns in its stepped
 * altar; seven sages sit around it; smoke rises. The sky runs through twelve
 * and a half days and nights, slow at first, then so fast that the sun and
 * moon become long-exposure arcs and the stars wheel around Dhruva, the pole
 * star, then it slows again into night. The fire never changes: it is the one
 * constant thing. The camera pushes in slowly.
 * Starts at dawn (continuity with the forest), ends at midnight (continuity
 * with the next shot).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { clamp, E } = R;

  const C0 = 0.02, DAYS = 12.73;          // sunrise → midnight, twelve years later
  const ramp = (u) => E.inOutCubic(clamp(u));
  function cycleAt(t, dur) {
    const a = 0.08 * dur, b = 0.94 * dur;
    return C0 + DAYS * ramp((t - a) / (b - a));
  }

  R.scene({
    id: 'fire',
    fadeIn: 0.45,
    draw(ctx, t, env) {
      const p = clamp(t / env.dur, 0, 1.2);
      const c = cycleAt(t, env.dur);
      const speed = Math.abs(cycleAt(t + 0.02, env.dur) - cycleAt(t - 0.02, env.dur)) / 0.04;
      KIT.ashram.draw(ctx, env.T, {
        cycle: c, speed,
        cam: { zoom: 1.0 + 0.05 * E.inOutSine(p), dy: 20 * p },
        smoke: { alpha: 0.36, lean: 30 },
      });
    },
    post: () => ({ bloom: 0.34, vignette: 0.5, paper: 0.32 }),
  });
})();
