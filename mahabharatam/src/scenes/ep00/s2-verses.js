/* Ep 0 · line "verses" · TITLE MOMENT 1 · "…about a hundred thousand verses, by the traditional count." · Palm leaves fall and stack into a towering pile in the dark; a gold counter rolls up to 100,000. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP0 = window.EP0, EP3 = window.EP3;
  const { clamp, E, lerp } = R;
  R.scene({
    id: 'verses',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 3, b2 = env.beats[2] ?? 5;
      EP0.ground(ctx, T, 1);
      // the pile grows through the whole line (fast at first), the camera tilting up with it
      const n = 40 * E.outCubic(clamp((t + 0.4) / (b2 + 0.6)));
      ctx.save(); KIT.camera(ctx, { x: 540, y: 1100, zoom: lerp(1.25, 0.95, E.inOutSine(clamp(t / dur))), dy: lerp(-160, 40, clamp(t / dur)) });
      EP0.pile(ctx, T, n, { x: 540, y: 1180, step: 12 });
      ctx.restore();
      const c = E.outCubic(clamp((t - b1 + 0.3) / (b2 - b1 + 0.3)));
      const ka = clamp((t - 0.2) / 0.4);
      EP3.counter(ctx, Math.max(1000, Math.round(c * 100000 / 100) * 100), 540, 400, { size: 150, alpha: ka, sheen: lerp(-0.3, 1.3, clamp((t - b2) / 1)), glow: 0.4, key: 'v0-count', env });
      ctx.save(); ctx.globalAlpha = clamp((t - b2 + 0.2) / 0.5); ctx.font = R.font(50, 'caption', 500, 'italic'); ctx.textAlign = 'center';
      ctx.fillStyle = R.PAL.cream; ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = R.px(10);
      ctx.fillText(env.strings.versesLabel, KIT.CX, 490); ctx.restore();
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.34 }),
  });
})();
