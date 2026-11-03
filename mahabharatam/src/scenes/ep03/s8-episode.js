/*
 * Ep 3 · line "episode" · "Episode three. Eighteen armies." (not captioned: the end card
 * shows strings.episodeLabel / episodeTitle). The series end card (KIT.endCard), with
 * eighteen small lights under the title: eleven terracotta, seven indigo.
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
      const cy = 1062;
      for (let i = 0; i < 18; i++) {
        const a = E.outCubic(clamp((k - 0.5 - i * 0.015) / 0.25));
        if (a <= 0) continue;
        const side = i < 11 ? 0 : 1;
        const x = KIT.CX + (i - 8.5) * 34 + (side ? 26 : -26) * 0.5;
        const col = side ? '#8a9ae8' : '#f08a50';
        KIT.glow(ctx, x, cy, 30, col, 0.55 * a);
        ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = side ? '#e4e8ff' : '#ffe0c0';
        ctx.beginPath(); ctx.arc(x, cy, 4, 0, R.TAU); ctx.fill(); ctx.restore();
      }
      KIT.embers(ctx, env.T, { x: KIT.CX, y: 1180, spread: 120, rate: 5, life: 3.2, rise: 160, sway: 50, size: 2, alpha: 0.6 * k, seed: 95 });
    },
    post: () => ({ bloom: 0.36, vignette: 0.45, paper: 0.3 }),
  });
})();
