/* Ep 29 · line "strong" · Garuda: "On one feather I could carry the earth, its mountains and seas, and you as well." · A vision: the round earth with its mountains and seas resting on a single gold feather held up in the sky; on "you" a tiny Indra on top. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP29 = window.EP29;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'strong',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T;
      const b1 = env.beats[1] ?? 1, b2 = env.beats[2] ?? 2.5, b3 = env.beats[3] ?? 3.6;
      const e = E.outCubic(clamp((t - b1 + 0.4) / 0.6)), m = E.outCubic(clamp((t - b2 + 0.4) / 0.6)), you = E.outCubic(clamp((t - b3 + 0.2) / 0.4));
      EP29.rainbow(ctx, T, { cam: { zoom: 1.0 } });
      EP29.feather(ctx, 540, 1500, 0.8, Math.PI / 2 * 0, T, 1);
      ctx.save(); ctx.globalAlpha = e; ctx.translate(540, 1160);
      ctx.fillStyle = '#2a6aa0'; ctx.beginPath(); ctx.arc(0, -220, 240, 0, R.TAU); ctx.fill();
      ctx.fillStyle = '#5a9a50'; ctx.beginPath(); ctx.ellipse(-60, -260, 130, 80, 0.3, 0, R.TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(110, -140, 80, 60, -0.2, 0, R.TAU); ctx.fill();
      ctx.globalAlpha = e * m; ctx.fillStyle = '#e8e0d0'; for (const [x, y, h] of [[-90, -300, 70], [-30, -320, 90], [120, -170, 50]]) { ctx.beginPath(); ctx.moveTo(x - 40, y + 20); ctx.lineTo(x, y - h); ctx.lineTo(x + 40, y + 20); ctx.fill(); }
      ctx.restore();
      if (you > 0) CH.indra.draw(ctx, { x: 540, y: 700, scale: 0.12, facing: 'front', pose: 'stand', alpha: you, light: EP29.clear(540, 700), t: T, key: 'st29-in' });
    },
    post: () => ({ bloom: 0.4, vignette: 0.4, paper: 0.3 }),
  });
})();
