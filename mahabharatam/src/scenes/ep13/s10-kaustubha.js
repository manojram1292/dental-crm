/*
 * Ep 13 · line "kaustubha" · "The Kaustubha jewel, which went to Narayana's breast."
 * A blazing white-blue jewel rises from the sea and flies in an arc (beats[1]) to Narayana,
 * frontal at the right; it settles on his breast and burns (beats[2]).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'kaustubha',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 1.8, b2 = env.beats[2] ?? 2.8;
      const fly = E.inOutCubic(clamp((t - 0.3) / (b2 - 0.1))), set = clamp((t - b2) / 0.4);
      const vx = 700, vy = 1960, vs = 1.12;
      const jx = lerp(260, vx, fly), jy = lerp(1500, vy - 720 * vs, fly) - Math.sin(Math.PI * fly) * 380;
      EP13.whiteSea(ctx, T, {
        hz: 1380,
        after: (g) => {
          CH.vishnu.draw(g, { x: vx, y: vy, scale: vs, facing: 'front', pose: { name: 'bless', k: 0.6 }, light: EP13.seaGlow(vx, 1700, 1.05), t: T, key: 'k13-vi' });
          window.EP11.surf(g, 1820, T, 1, { color: '#ffffff', deep: '#ecebf8', deep2: '#b8b8d8' });
        },
      });
      if (set < 1) {
        ctx.save(); ctx.translate(jx, jy);
        KIT.glow(ctx, 0, 0, 260, '#9ad8ff', 0.9);
        ctx.fillStyle = '#f4fbff'; ctx.shadowColor = '#9ad8ff'; ctx.shadowBlur = R.px(30); ctx.rotate(T * 2);
        ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * R.TAU; ctx.lineTo(Math.cos(a) * (i % 2 ? 26 : 44), Math.sin(a) * (i % 2 ? 26 : 44)); } ctx.closePath(); ctx.fill();
        ctx.restore();
      } else KIT.glow(ctx, vx, vy - 720 * vs, 340, '#9ad8ff', 0.9 * Math.exp(-(t - b2) * 1.5));
      const la = clamp((t - 0.3) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP13.plaque(ctx, env.strings.kaustubhaName, env.strings.kaustubhaEpithet, KIT.CX, 300, la, { size: 56, key: 'k13-name' });
    },
    post: () => ({ bloom: 0.48, vignette: 0.32, paper: 0.28 }),
  });
})();
