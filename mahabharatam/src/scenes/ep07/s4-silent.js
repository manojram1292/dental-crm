/*
 * Ep 7 · line "silent" · "But Shamika was under a vow of silence."
 *
 * Close on Shamika (the camera pushes in on him, large): eyes closed, still as stone. A lilac
 * stillness gathers round him; on "Shamika" (beats[0]) his name and "under a vow of silence";
 * on "silence" (beats[1]) the dust motes stop and the ring of stillness widens. The king's
 * shadow falls across him from the right.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP7 = window.EP7;
  const { clamp, E, TAU } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'silent',
    fadeIn: 0.4,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.4, b1 = env.beats[1] ?? 2.6;
      const hush = E.outCubic(clamp((t - (b1 - 0.3)) / 1.0));
      EP7.pen(ctx, T, {
        cam: { zoom: 1.5 + 0.12 * E.inOutSine(p), dx: 250, dy: -260 },
        after: (g) => {
                    KIT.glow(g, 340, 1250, 420 + 120 * hush, '#b8a0ff', 0.2 + 0.25 * hush, 'screen');
          g.save(); g.strokeStyle = `rgba(220,208,255,${0.35 * hush})`; g.lineWidth = 3;
          for (let i = 0; i < 3; i++) { const r = 160 + i * 70 + 60 * hush; g.beginPath(); g.ellipse(340, 1250, r, r * 1.25, 0, 0, TAU); g.stroke(); }
          g.restore();
          CH.shamika.draw(g, { x: 330, y: 1580, scale: 0.98, facing: 'right', pose: 'sit', light: EP7.penLight(330, 1580), t: T * (1 - 0.8 * hush), key: 'si7-sm' });
        },
      });
      const la = clamp((t - (b0 - 0.1)) / 0.5) * (1 - clamp((t - dur + 0.4) / 0.35));
      EP7.label(ctx, (env.strings.shamikaName || 'Shamika').toUpperCase(), KIT.CX, 330, la, { size: 62, key: 'si7-name' });
      if (la > 0.01) {
        ctx.save(); ctx.globalAlpha = la; ctx.font = R.font(40, 'caption', 600, 'italic'); ctx.textAlign = 'center';
        ctx.fillStyle = '#f4eeff'; ctx.shadowColor = 'rgba(10,6,16,0.95)'; ctx.shadowBlur = R.px(10);
        ctx.fillText(env.strings.shamikaEpithet || '', KIT.CX, 405); ctx.restore();
      }
    },
    post: () => ({ bloom: 0.34, vignette: 0.5, paper: 0.34 }),
  });
})();
