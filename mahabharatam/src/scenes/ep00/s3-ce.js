/* Ep 0 · line "ce" · "Nearly seventy-five thousand, in the Critical Edition." · The counter stays; under it ≈ 75,000 rises; the pile is trimmed: its later leaves lift away. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP0 = window.EP0, EP3 = window.EP3;
  const { clamp, E, lerp } = R;
  R.scene({
    id: 'ce',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 2.5;
      EP0.ground(ctx, T, 1);
      const tr = E.inOutSine(clamp((t - 0.3) / (b1 + 0.4)));
      ctx.save(); KIT.camera(ctx, { x: 540, y: 1100, zoom: 0.95, dy: 40 });
      EP0.pile(ctx, T, 40, { x: 540, y: 1180, step: 12, keep: 30, trim: tr });
      ctx.restore();
      EP3.counter(ctx, 100000, 540, 400, { size: lerp(150, 90, tr), alpha: lerp(1, 0.45, tr), glow: 0.2, key: 'c0-count', env });
      const k2 = E.outCubic(clamp((t - 0.25) / 0.6));
      KIT.goldText(ctx, env.strings.ceFigure, KIT.CX, lerp(640, 600, k2), { size: 140, spacing: 6, weight: 600, alpha: k2, reveal: k2, sheen: lerp(-0.3, 1.3, clamp((t - b1) / 1)), glow: 0.45, key: 'c0-ce' });
      ctx.save(); ctx.globalAlpha = clamp((t - 0.6) / 0.5) * (1 - clamp((t - dur + 0.2) / 0.2) * 0); ctx.font = R.font(50, 'caption', 500, 'italic'); ctx.textAlign = 'center';
      ctx.fillStyle = R.PAL.cream; ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = R.px(10);
      ctx.fillText(env.strings.ceLabel, KIT.CX, 690); ctx.restore();
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.34 }),
  });
})();
