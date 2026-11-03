/*
 * Ep 10 · line "curse" · Aruna: "Mother, for your haste, you will be your rival's slave for five hundred years."
 *
 * Aruna above, raising his finger (curse) on "Mother" (beats[0]); Vinata sinks to her
 * knees before him; behind her Kadru's shadow lengthens across the ground on "haste"
 * (beats[1]); on "slave" (beats[2]) Vinata's ornaments fall away and the end of her sari
 * covers her head (slave); on "hundred" (beats[3]) a year-mark appears: 500.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP9 = window.EP9, EP10 = window.EP10;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'curse',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.2, b1 = env.beats[1] ?? 2, b2 = env.beats[2] ?? 4, b3 = env.beats[3] ?? 5.7;
      const cu = E.inOutCubic(clamp((t - b0) / 0.7));
      const shadow = E.inOutSine(clamp((t - (b1 - 0.3)) / 1.4));
      const slave = t > b2 - 0.1;
      const bow = E.inOutSine(clamp((t - 0.6) / 1.2));
      EP9.hermitage(ctx, T, {
        glow: 0.3, cam: { zoom: 1.12 + 0.04 * p, dy: -10 },
        after: (g) => {
          if (shadow > 0.01) {
            g.save(); g.globalAlpha = 0.6 * shadow; g.translate(160, 1700); g.transform(1, 0, lerp(0.2, 1.4, shadow), 0.4, 0, 0);
            CH.kadru.shape(g, '#06040a', { x: 0, y: 0, scale: 0.9, facing: 'right', pose: 'stand', t: T });
            g.restore();
          }
          KIT.glow(g, 380, 1000, 700, '#ff4a2a', 0.3);
          CH.aruna.draw(g, { x: 360, y: 1500, scale: 0.92, facing: 'right', pose: { name: 'curse', k: cu }, expression: { mood: 'wrath', speak: EP10.mouth(env, t) }, light: { dir: -Math.PI / 2, intensity: 1.15, front: 0.4 }, t: T, key: 'c10-ar' });
          CH.vinata.draw(g, { x: 820, y: 1700, scale: 0.92, facing: 'left', pose: { name: 'bow', k: bow, slave }, light: EP10.arunaLight(820, 1700, 360, 900, 0.9), t: T, key: 'c10-vn' });
        },
      });
      const a = clamp((t - (b3 - 0.2)) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      if (a > 0.01) {
        ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center';
        ctx.font = R.font(110, 'display', 700); ctx.fillStyle = '#ffd8c8'; ctx.shadowColor = 'rgba(16,4,8,0.95)'; ctx.shadowBlur = R.px(18);
        ctx.fillText('500', KIT.CX, 420);
        ctx.font = R.font(40, 'display', 600); ctx.letterSpacing = '10px'; ctx.fillText((env.strings.yearsLabel || 'years').toUpperCase(), KIT.CX + 5, 485); ctx.restore();
      }
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.32 }),
  });
})();
