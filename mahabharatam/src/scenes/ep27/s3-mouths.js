/* Ep 27 · line "mouths" · "He made himself ninety times ninety mouths, drank whole rivers, and poured them on the fire." · The counter '90 × 90 · mouths' (beats[0]); silver rivers drawn up into him (beats[1..2]); poured down, the fire hisses into steam (beats[3]). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP27 = window.EP27, EP3 = window.EP3;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'mouths',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 1, b1 = env.beats[1] ?? 2, b3 = env.beats[3] ?? 4;
      const douse = E.inOutSine(clamp((t - b3 + 0.4) / 1.0)), drink = clamp((t - b1 + 0.5) / 1.2);
      EP27.blaze(ctx, T, { douse });
      // rivers: silver ribbons rising from the frame's bottom corners into him, then falling as rain
      ctx.save(); ctx.strokeStyle = 'rgba(220,240,255,0.85)'; ctx.lineCap = 'round';
      for (let k = 0; k < 4; k++) { const a = drink * (1 - douse); if (a <= 0) break; ctx.globalAlpha = a; ctx.lineWidth = 26 - k * 4; ctx.beginPath(); ctx.moveTo(k % 2 ? 1150 : -70, 1900 - k * 80); ctx.bezierCurveTo(k % 2 ? 900 : 200, 1500, 560 + (k - 1.5) * 40, 1300, 540, 980 + 20 * Math.sin(T * 6 + k)); ctx.stroke(); }
      ctx.restore();
      if (douse > 0) { ctx.save(); ctx.strokeStyle = 'rgba(220,240,255,0.7)'; ctx.lineWidth = 6; for (let i = 0; i < 40; i++) { const x = (i * 37) % R.W, y = ((T * 1600 + i * 97) % 1400) + 600; ctx.globalAlpha = douse; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 10, y + 90); ctx.stroke(); } ctx.restore(); }
      CH.garuda.draw(ctx, { x: 540, y: 1520, scale: 0.5, facing: 'left', pose: { name: 'spread', k: 1 }, light: EP27.fireLight(540, 1520, 1.2), t: T, key: 'm27-ga' });
      const ka = clamp((t - b0 + 0.2) / 0.4) * (1 - clamp((t - b1 - 0.6) / 0.4));
      EP3.counter(ctx, env.strings.mouthsFigure, 540, 380, { size: 130, label: env.strings.mouthsLabel, alpha: ka, glow: 0.4, key: 'm27-c', env });
      void dur; void lerp;
    },
    post: () => ({ bloom: 0.46, vignette: 0.46, paper: 0.3 }),
  });
})();
