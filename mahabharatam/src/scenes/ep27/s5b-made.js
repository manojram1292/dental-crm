/* Ep 27 · line "made" · "The gods had made it to cut down any thief." · Close on the rim: the blades flash past one after another, steel-blue glints; a stray leaf drifting into them is cut in two. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP26 = window.EP26, EP27 = window.EP27;
  const { clamp, lerp } = R;
  R.scene({
    id: 'made',
    fadeIn: 0.1,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP27.vault(ctx, T, { pot: 0.5, cam: { zoom: 1.0 } });
      EP26.wheel(ctx, 1100, 1500, 1100, T, { spin: T * 3 });
      const lp = clamp((t - 0.6) / 1.4), cut = lp > 0.6;
      ctx.save(); ctx.fillStyle = '#8ac060';
      for (const s of cut ? [-1, 1] : [0]) { ctx.save(); ctx.translate(lerp(200, 360, lp) + s * 40 * (lp - 0.6), lerp(500, 700, lp) + (cut ? (lp - 0.6) * 600 : 0)); ctx.rotate(T * 2 + s); ctx.beginPath(); ctx.ellipse(0, 0, cut ? 30 : 60, 26, 0, 0, R.TAU); ctx.fill(); ctx.restore(); }
      ctx.restore();
      void p;
    },
    post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.3 }),
  });
})();
