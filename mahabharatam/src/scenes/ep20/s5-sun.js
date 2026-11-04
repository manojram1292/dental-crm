/* Ep 20 · line "sun" · "Garuda flew higher, close to the Sun." · Garuda climbs toward a blazing Sun at the top of the frame; the sky whitens with heat. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP15 = window.EP15, EP20 = window.EP20;
  const { clamp, E, lerp } = R;
  R.scene({
    id: 'sun',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      KIT.vgrad(ctx, 0, R.H, [[0, '#fff8e0'], [0.4, '#ffd890'], [1, '#e88a4a']]);
      KIT.glow(ctx, 540, 260, 900, '#ffffff', 0.9);
      ctx.fillStyle = '#fffbe8'; ctx.beginPath(); ctx.arc(540, 240, 180, 0, R.TAU); ctx.fill();
      EP20.carrier(ctx, 560, lerp(2050, 1700, p), 0.75, T, { key: 's20', faint: 0.2 * p, light: { dir: -Math.PI / 2, intensity: 1.2, front: 0.55 } });
      ctx.save(); ctx.globalAlpha = 0.25 * p; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore();
      void EP15;
    },
    post: () => ({ bloom: 0.5, vignette: 0.3, paper: 0.28 }),
  });
})();
