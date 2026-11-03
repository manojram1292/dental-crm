/*
 * Ep 8 · line "flee" · "Takshaka fled to Indra, king of the gods."
 *
 * NEW PLACE, NEW LIGHT: Indra's heaven (EP8.svarga): white-gold clouds, a pale palace,
 * bright cool light from above. Takshaka rises through the clouds from below, recoiling,
 * afraid (beats[0]); Indra sits on his cloud-throne at the right, large; his name and
 * epithet on "Indra" (beats[1]).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP8 = window.EP8;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'flee',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 1.3;
      const up = E.outCubic(clamp(t / (dur * 0.85)));
      const L = { dir: -Math.PI / 2 + 0.2, intensity: 1.1, front: 0.35 };
      EP8.svarga(ctx, T, {
        cam: { zoom: 1.05 + 0.04 * p, dy: -30 },
        after: (g) => {
          CH.indra.draw(g, { x: 800, y: 1560, scale: 0.86, facing: 'left', pose: 'sit', expression: { look: 0.05 }, light: L, t: T, key: 'fl8-in' });
          CH.takshaka.draw(g, { x: 290, y: lerp(2300, 1620, up), scale: 0.72, facing: 'right', pose: { name: 'recoil', k: 0.6 + 0.2 * Math.sin(T * 3) }, expression: { look: -0.1 }, light: L, t: T, key: 'fl8-tk' });
        },
      });
      const la = clamp((t - (b1 - 0.1)) / 0.5) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP8.label(ctx, (env.strings.indraName || 'Indra').toUpperCase(), KIT.CX, 300, la, { size: 62, key: 'fl8-name' });
      if (la > 0.01) {
        ctx.save(); ctx.globalAlpha = la; ctx.font = R.font(40, 'caption', 600, 'italic'); ctx.textAlign = 'center';
        ctx.fillStyle = '#fff4dc'; ctx.shadowColor = 'rgba(10,8,20,0.95)'; ctx.shadowBlur = R.px(10);
        ctx.fillText(env.strings.indraEpithet || '', KIT.CX, 375); ctx.restore();
      }
    },
    post: () => ({ bloom: 0.42, vignette: 0.32, paper: 0.36 }),
  });
})();
