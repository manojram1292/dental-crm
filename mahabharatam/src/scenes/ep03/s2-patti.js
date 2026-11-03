/*
 * Ep 3 · line "patti" · sauti: "Listen. One chariot, one elephant, three horses, five
 * soldiers on foot… that is a patti."
 *
 * Sauti, seated at the lower left, speaks toward the fire (lower right), as in
 * episode 2's answer. Above them, in the fire's light, a dark plaster panel: a
 * temple frieze in two registers. On each noun the unit steps into the frieze
 * (beats: chariot, elephant, the three horses, the five foot soldiers) with a puff
 * of embers; on "patti" (beats[4]) the panel's gold frame flares and its name is
 * written above it. The frieze is exactly the patti tile the next lines multiply.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP2 = window.EP2, EP3 = window.EP3;
  const { clamp, lerp, E, PAL } = R;
  const CH = KIT.characters;
  const P = EP3.PANEL;

  R.scene({
    id: 'patti',
    fadeIn: 0.45,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const fl = KIT.flicker(T, 0);
      const B = env.beats.length >= 5 ? env.beats : [dur * 0.15, dur * 0.3, dur * 0.45, dur * 0.6, dur * 0.85];
      // unit i of KIT.army.PATTI → its beat: 0 chariot, 1 elephant, 2–4 horses, 5–9 foot soldiers
      const when = (i) => (i === 0 ? B[0] : i === 1 ? B[1] : i < 5 ? B[2] + (i - 2) * 0.16 : B[3] + (i - 5) * 0.11) - 0.12;
      const appear = (i) => clamp((t - when(i)) / 0.45);
      const named = clamp((t - (B[4] - 0.1)) / 0.6);
      // night; the fire below right lights the wall
      KIT.vgrad(ctx, 0, R.H, [[0, '#06071a'], [0.4, '#141530'], [0.78, '#2a1520'], [1, '#2a120a']]);
      KIT.glow(ctx, 760, 1450, 1000, PAL.saffron, 0.42 * fl);
      KIT.glow(ctx, P.x + P.w / 2, P.y + P.h * 0.6, 760, '#ff9a40', (0.14 + 0.1 * named) * fl, 'lighter', 0.7);
      // the panel fades up first, then the units step in
      const pa = E.inOutSine(clamp(t / 0.7));
      EP3.panelFrame(ctx, pa, lerp(0.35, 0.95, named) * (0.85 + 0.15 * fl));
      EP3.panelUnits(ctx, T, { appear, flicker: fl, light: Math.atan2(1450 - (P.y + P.h / 2), 760 - (P.x + P.w / 2)) });
      // embers where each unit lands
      KIT.army.PATTI.forEach(([kind, x, y, s], i) => {
        const age = t - when(i) - 0.15;
        if (age < 0 || age > 1.6) return;
        const X = P.x + x * P.k, Y = P.y + y * P.k;
        KIT.glow(ctx, X, Y - 60 * s * P.k * 3, 200 * s * P.k * 2.4, '#ffb04a', 0.5 * Math.exp(-age / 0.3));
        KIT.embers(ctx, T, { x: X, y: Y - 20, spread: 120 * s * P.k * 2, rate: 30 * Math.exp(-age / 0.4), life: 1.2, rise: 140, sway: 30, size: 2.4, alpha: 0.8, seed: 300 + i });
      });
      // the frame flare on "patti"
      if (named > 0) {
        const fx = Math.exp(-Math.max(0, t - B[4]) / 0.5) * named;
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.6 * fx;
        ctx.strokeStyle = '#ffe2a0'; ctx.lineWidth = 6; ctx.strokeRect(P.x + 4, P.y + 4, P.w - 8, P.h - 8);
        ctx.restore();
        const S = env.strings;
        KIT.goldText(ctx, (S.pattiName || 'Patti').toUpperCase(), KIT.CX, P.y - 42 - 0 * named, { size: 92, spacing: 14, weight: 600, reveal: E.inOutSine(named), sheen: lerp(-0.3, 1.3, clamp((t - B[4] - 0.2) / 1.0)), glow: 0.4, key: 'patti-name' });
        const sa = E.outCubic(clamp((t - B[4] - 0.3) / 0.6));
        ctx.save(); ctx.globalAlpha = sa; ctx.font = R.font(40, 'caption', 500, 'italic'); ctx.textAlign = 'center';
        ctx.fillStyle = PAL.cream; ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = R.px(10);
        ctx.fillText(S.pattiParts || '', KIT.CX, P.y + P.h + 58 + (1 - sa) * 10); ctx.restore();
      }
      // the fire in its altar
      const base = KIT.fire.altar(ctx, 800, 1560, 250, T, { light: 1 });
      KIT.fire.draw(ctx, 800, base + 2, 270, T, { intensity: 1.05, seed: 0, lean: -0.12 });
      KIT.embers(ctx, T, { x: 800, y: 1330, spread: 140, rate: 10, life: 2.2, rise: 360, sway: 50, size: 2.6, alpha: 0.7, seed: 31, lean: -0.3 });
      // Sauti, seated, speaking toward the fire and the wall
      const k = E.inOutCubic(clamp((t - 0.1) / 0.9));
      CH.sauti.draw(ctx, {
        x: 190, y: 1690, scale: 0.72, facing: 'right', pose: { name: 'speak', base: 'sit', k },
        expression: { speak: EP2.mouth(env, t), look: -0.12 },
        light: { dir: Math.atan2(-110, 600), intensity: fl, front: 0.15 }, t: T, key: 'patti-sauti',
      });
    },
    post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.32 }),
  });
})();
