/*
 * Ep 7 · line "seventh" · "On the seventh day, serpents came as hermits, bearing fruit."
 *
 * The same pillar under the crimson sunset of the seventh day (EP7.tower, sky 1). Seven
 * sun-discs across the top: six spent, the seventh flares on "seventh" (beats[0]). Three
 * hermits walk in from the left with trays of fruit; on "serpents" (beats[1]) their shadows
 * on the ground are serpents and a cold green rim gives them away; "fruit" (beats[2]) glows.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP7 = window.EP7;
  const { clamp, E, lerp } = R;

  R.scene({
    id: 'seventh',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.6, b1 = env.beats[1] ?? 1.5, b2 = env.beats[2] ?? 4.1;
      const sev = clamp((t - (b0 - 0.2)) / 0.5);
      const sh = E.inOutSine(clamp((t - (b1 - 0.2)) / 0.8));
      const walk = clamp(t / dur);
      EP7.tower(ctx, T, {
        sky: 1, cam: { zoom: 1.0 + 0.04 * p, dy: 230 },
        after: (g) => {
          for (let i = 0; i < 3; i++) {
            const x = lerp(60 - i * 200, 560 - i * 190, E.outSine(walk));
            EP7.hermit(g, x, 1390 + i * 10, 0.5 - i * 0.03, T, T * 5 + i * 1.7, { facing: 'right', shadow: sh, key: 'v7-h' + i, alpha: 1 });
          }
          const fa = clamp((t - (b2 - 0.3)) / 0.5);
          if (fa > 0) for (let i = 0; i < 3; i++) { const x = lerp(60 - i * 200, 560 - i * 190, E.outSine(walk)) + 45 * (0.5 - i * 0.03); KIT.glow(g, x, 1390 - 880 * (0.5 - i * 0.03), 90, '#ffd070', 0.5 * fa); }
        },
      });
      EP7.dayMarks(ctx, 495, 360, 720, 6 + sev, T, { alpha: clamp(t / 0.5), dimPast: true });
      const la = clamp((t - (b0 - 0.1)) / 0.4) * (1 - clamp((t - dur + 0.4) / 0.35));
      if (la > 0.01) {
        ctx.save(); ctx.globalAlpha = la; ctx.font = R.font(46, 'display', 600); ctx.letterSpacing = '8px'; ctx.textAlign = 'center';
        ctx.fillStyle = '#ffd070'; ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = R.px(10);
        ctx.fillText(`${(env.strings.dayLabel || 'Day').toUpperCase()} 7`, KIT.CX, 270); ctx.restore();
      }
    },
    post: () => ({ bloom: 0.42, vignette: 0.48, paper: 0.32 }),
  });
})();
