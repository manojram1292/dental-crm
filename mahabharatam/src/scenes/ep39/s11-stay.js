/* Ep 39 · line "stay" · Astika calls to Takshaka · "Stay! Stay! Stay!" · The boy turns to the sky, hand raised; on each word (beats) a ring of gold light pulses out; the word STAY on a plaque. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'stay',
    fadeIn: 0.1,
    draw(ctx, t, env) {
      const T = env.T, B = env.beats, k = clamp((t - B[0] + 0.2) / 0.3);
      EP37.blaze(ctx, T, { cam: { zoom: 1.5, dy: -420, dx: -160 }, after: (g) => {
        CH.astika.draw(g, { x: 820, y: 1840, scale: 0.9, facing: 'left', pose: { name: 'point', k: 1 }, expression: { speak: EPA.mouth(env, t) }, light: { ...EP39.fireLit(820, 1500, 1.25), fill: 0.6 }, t: T, key: 's39-as' });
        B.forEach((b, i) => { const u = clamp((t - b) / 0.9); if (u > 0 && u < 1) { g.save(); g.globalAlpha = 1 - u; g.strokeStyle = '#ffe080'; g.lineWidth = 12 * (1 - u) + 2; g.beginPath(); g.arc(700, 1200, 80 + u * 600, 0, Math.PI * 2); g.stroke(); g.restore(); } void i; });
      } });
      EPA.plaque(ctx, env.strings.stayWord, null, KIT.CX, 360, k * (1 - clamp((t - env.dur + 0.3) / 0.3)), { size: 70, key: 's39-pl' });
    },
    post: () => ({ bloom: 0.5, vignette: 0.48, paper: 0.3 }),
  });
})();
