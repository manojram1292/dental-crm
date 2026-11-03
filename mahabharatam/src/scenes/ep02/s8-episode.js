/*
 * Ep 2 · line "episode" · "Episode two. The field of five lakes." (not captioned: the
 * end card shows strings.episodeLabel / episodeTitle). The series end card (KIT.endCard),
 * arriving whole this time (no title hand-over), with five small lake-lights in the fire's glow.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { clamp, E } = R;

  R.scene({
    id: 'episode',
    fadeIn: 0.7,
    draw(ctx, t, env) {
      const k = clamp(t / Math.max(1.6, env.speech[1] + 0.2));
      KIT.endCard.draw(ctx, env.T, k, env.strings, {});
      // five points of light in a quincunx under the title: the five lakes
      const a = E.outCubic(clamp((k - 0.5) / 0.3));
      const cx = KIT.CX, cy = 1060;
      for (const [dx, dy] of [[0, 0], [-46, -30], [46, -30], [46, 30], [-46, 30]]) {
        KIT.glow(ctx, cx + dx, cy + dy, 40, '#8fd8d0', 0.6 * a);
        ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#e8fff8'; ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 4, 0, R.TAU); ctx.fill(); ctx.restore();
      }
      KIT.embers(ctx, env.T, { x: KIT.CX, y: 1180, spread: 120, rate: 5, life: 3.2, rise: 160, sway: 50, size: 2, alpha: 0.6 * k, seed: 94 });
    },
    post: () => ({ bloom: 0.36, vignette: 0.45, paper: 0.3 }),
  });
})();
