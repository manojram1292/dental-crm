/* Ep 32 · line "astika" · "Their son will save the good serpents." · The two medallions slide together; a third, the boy lit gold, rises between them (beats[0]) and grows; serpents' eyes in the dark below all turn to it. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP32 = window.EP32;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'astika',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0], j = E.inOutSine(clamp(t / 0.8)), boy = E.outCubic(clamp((t - b0 + 0.2) / 0.7)), p = clamp(t / env.dur);
      EP32.memory(ctx, T, { cam: { zoom: 1.3 + 0.1 * p, dy: -120 } });
      KIT.vgrad(ctx, 1500, R.H, [[0, 'rgba(2,4,10,0)'], [1, 'rgba(2,4,10,0.95)']]);
      for (let k = 0; k < 14; k++) { const x = 90 + k * 68, y = 1700 + 60 * Math.sin(k * 1.7); ctx.fillStyle = '#c8ff90'; for (const d of [-8, 8]) { ctx.beginPath(); ctx.ellipse(x + d + 6 * boy, y, 5, 3, 0, 0, Math.PI * 2); ctx.fill(); } }
      EP32.medal(ctx, lerp(230, 300, j), 1000, lerp(150, 120, j), 1 - 0.3 * boy, 'sage', T, 'a32-m1');
      EP32.medal(ctx, lerp(860, 790, j), 1000, lerp(150, 120, j), 1 - 0.3 * boy, 'bride', T, 'a32-m2');
      EP32.medal(ctx, 545, lerp(1060, 860, boy), lerp(80, 210, boy), boy, 'boy', T, 'a32-m3');
    },
    post: () => ({ bloom: 0.5, vignette: 0.46, paper: 0.34 }),
  });
})();
