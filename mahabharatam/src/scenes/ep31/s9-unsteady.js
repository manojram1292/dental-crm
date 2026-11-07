/* Ep 31 · line "unsteady" · "The earth was shaking, with all its mountains, seas and towns." · The earth as a painted disc in empty starry space, tilting and quaking; the camera picks out mountains, seas, towns on the beats. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { clamp, lerp, TAU, hash } = R;
  const EPA = window.EPA;
  R.scene({
    id: 'unsteady',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, B = env.beats, p = clamp(t / env.dur);
      KIT.vgrad(ctx, 0, R.H, [[0, '#04040e'], [0.6, '#0e0a22'], [1, '#1a1030']]);
      for (let k = 0; k < 80; k++) { ctx.globalAlpha = 0.3 + 0.5 * Math.sin(T + k * 2); ctx.fillStyle = '#e8ecff'; ctx.beginPath(); ctx.arc(hash(k, 1) * R.W, hash(k, 2) * R.H, 1.5 + 2 * hash(k, 3), 0, TAU); ctx.fill(); }
      ctx.globalAlpha = 1;
      const q = t > B[0] - 0.2 ? 1 : 0.4;
      ctx.save(); KIT.camera(ctx, { x: 540, y: 960, zoom: lerp(1.0, 1.25, p), dx: lerp(0, -80, clamp((t - B[1]) / 1.5)) });
      EPA.earth(ctx, 540 + 18 * q * Math.sin(T * 13), 980 + 12 * q * Math.sin(T * 11), 1000, T, { tilt: 0.16 * q * Math.sin(T * 3.3) + 0.05 * Math.sin(T * 7.1) });
      ctx.restore();
    },
    post: () => ({ bloom: 0.38, vignette: 0.5, paper: 0.3 }),
  });
})();
