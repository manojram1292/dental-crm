/*
 * Ep 9 · line "jars" · "They were kept warm in steaming jars… for five hundred years."  (caption high)
 *
 * Rows of tall clay jars in the hermitage, steam curling, each egg glowing faintly through
 * the clay (olive for Kadru's, rose and gold for Vinata's two). On "jars" (beats[0]) the
 * sky begins to wheel: sun and moon arc over again and again, faster; a year counter runs
 * up to 500 by "years" (beats[2]).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP9 = window.EP9;
  const { clamp, E } = R;

  R.scene({
    id: 'jars',
    fadeIn: 0.5,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 1.6, b2 = env.beats[2] ?? 3.8;
      const u = clamp((t - (b0 - 0.6)) / (b2 - b0 + 0.6));
      const years = 0.2 + 18 * E.inQuad(u) + 0.1 * t;
      EP9.hermitage(ctx, T, {
        glow: 0.8, years, cam: { zoom: 1.05, dy: 40 },
        after: (g) => {
          for (let row = 0; row < 2; row++) for (let i = 0; i < 6; i++) {
            const x = 120 + i * 170 + row * 70, y = 1520 + row * 190, s = 0.7 + row * 0.15;
            const kind = row === 1 && i >= 4 ? (i === 4 ? 'rose' : 'gold') : 'serpent';
            EP9.jar(g, x, y, s, T, { kind, glow: kind === 'serpent' ? 0.35 : 0.6 });
          }
        },
      });
      const n = Math.round(500 * E.inOutSine(u));
      const a = clamp((t - (b0 - 0.4)) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      if (a > 0.01) {
        ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center';
        ctx.font = R.font(120, 'display', 700); ctx.fillStyle = '#ffe9b0'; ctx.shadowColor = 'rgba(10,6,16,0.95)'; ctx.shadowBlur = R.px(18);
        ctx.fillText(String(n), KIT.CX, 820);
        ctx.font = R.font(44, 'display', 600); ctx.letterSpacing = '10px';
        ctx.fillText((env.strings.yearsLabel || 'years').toUpperCase(), KIT.CX + 6, 890); ctx.restore();
      }
    },
    post: () => ({ bloom: 0.4, vignette: 0.45, paper: 0.34 }),
  });
})();
