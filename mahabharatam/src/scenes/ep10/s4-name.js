/*
 * Ep 10 · line "name" · "Aruna."
 *
 * Aruna, large, opens his eyes; his name in gold with "the red of dawn".
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP9 = window.EP9, EP10 = window.EP10;
  const { clamp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'name',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      EP9.hermitage(ctx, T, {
        glow: 0.3, cam: { zoom: 1.45 + 0.05 * p, dy: 260 },
        after: (g) => {
          KIT.glow(g, 560, 1100, 900, '#ff4a2a', 0.35);
          CH.aruna.draw(g, { x: 580, y: 1560, scale: 0.95, facing: 'left', pose: { name: 'emerge', k: 1 }, expression: { mood: 'wrath' }, light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.4 }, t: T, key: 'n10-ar' });
        },
      });
      const la = clamp((t - 0.05) / 0.4);
      EP10.label(ctx, (env.strings.arunaName || 'Aruna').toUpperCase(), KIT.CX, 300, la, { size: 70, key: 'n10-name' });
      if (la > 0.01) {
        ctx.save(); ctx.globalAlpha = la; ctx.font = R.font(40, 'caption', 600, 'italic'); ctx.textAlign = 'center';
        ctx.fillStyle = '#ffe0d0'; ctx.shadowColor = 'rgba(16,4,4,0.95)'; ctx.shadowBlur = R.px(10);
        ctx.fillText(env.strings.arunaEpithet || '', KIT.CX, 380); ctx.restore();
      }
    },
    post: () => ({ bloom: 0.5, vignette: 0.5, paper: 0.32 }),
  });
})();
