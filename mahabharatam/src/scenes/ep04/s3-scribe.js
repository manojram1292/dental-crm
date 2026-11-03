/*
 * Ep 4 · line "scribe" · "He needed a scribe. Ganesha agreed to write it — on one condition."
 *
 * From here to the tusk the series marks the material "As tradition tells it" (KIT.series
 * .traditionTag): the Ganesha story is later tradition, not in the Critical Edition.
 * The hermitage two-shot: Vyasa on the left. On "Ganesha" (beats[0]) the scribe appears on
 * the right out of a bloom of vermilion light, seated, palm leaf ready; his name is set in
 * gold. On "one" (beats[1]) he raises one finger.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP4 = window.EP4;
  const { clamp, lerp, E, PAL } = R;

  R.scene({
    id: 'scribe',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur, 0, 1.3);
      const b0 = env.beats[0] ?? dur * 0.35, b1 = env.beats[1] ?? dur * 0.8;
      const rv = clamp((t - (b0 - 0.4)) / 1.1);
      const fk = E.inOutCubic(clamp((t - (b1 - 0.45)) / 0.7));
      EP4.twoShot(ctx, T, {
        cam: { zoom: 1.02 + 0.04 * E.inOutSine(p) },
        vyasa: { pose: 'sit', expression: { look: 0.03 } },
        ganesha: { alpha: E.inOutSine(rv), reveal: rv, pose: fk > 0 ? { name: 'speak', base: 'sit', k: fk } : 'sit', expression: { look: -0.03 } },
      });
      KIT.series.traditionTag(ctx, T, E.outCubic(clamp(t / 0.6)), env.strings);
      const S = env.strings, keys = env.line.display || [];
      const nk = clamp((t - (b0 + 0.1)) / 0.75);
      if (nk > 0 && keys[0]) {
        const y = 400;
        KIT.goldText(ctx, (S[keys[0]] || '').toUpperCase(), KIT.CX, y, { size: 96, spacing: 14, weight: 600, reveal: E.inOutSine(nk), sheen: lerp(-0.3, 1.3, clamp((t - b0 - 0.4) / 1.1)), glow: 0.4, key: 's4-name' });
        const ka = clamp((t - b0 - 0.45) / 0.6);
        ctx.save(); ctx.globalAlpha = ka; ctx.font = R.font(46, 'caption', 500, 'italic'); ctx.textAlign = 'center';
        ctx.fillStyle = PAL.cream; ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = R.px(12);
        ctx.fillText(S[keys[1]] || '', KIT.CX, y + 66); ctx.restore();
      }
    },
    post: () => ({ bloom: 0.32, vignette: 0.42, paper: 0.3 }),
  });
})();
