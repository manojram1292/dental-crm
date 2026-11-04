/*
 * Ep 16 · line "restore" · "Mandara was set back in its place, and the gods kept the amrita safe."
 * Dawn after the battle (EP12.earth's clear light, warmer): the mountain floats down onto its plain
 * (beats[0] → beats[1]); then the gods stand round the white pot, its light calm (beats[2]).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP12 = window.EP12, EP15 = window.EP15;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'restore',
    fadeIn: 0.35,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 2, b2 = env.beats[2] ?? 4;
      const down = E.inOutSine(clamp(t / (b1 + 0.2)));
      EP12.earth(ctx, T, {
        lift: 1 - down, gy: 1350, ms: 0.5, cam: { zoom: 1.0, dy: 40 },
        after: (g) => {
          const gk = E.outCubic(clamp((t - b2 + 1.2) / 0.8));
          if (gk > 0.01) {
            EP15.potGlow(g, 540, 1700, 0.8, gk);
            for (let i = 0; i < 4; i++) { const x = [170, 330, 750, 910][i]; CH.deva.draw(g, { x, y: 2020, scale: 0.78, facing: x < 540 ? 'right' : 'left', index: i + 1, pose: i % 2 ? { name: 'bow', k: 0.4 } : 'stand', light: EP12.dayLight(x, 2020, 1.1), t: T + i, alpha: gk, key: 'o16-d' + i }); }
          }
        },
      });
      void dur;
    },
    post: () => ({ bloom: 0.32, vignette: 0.34, paper: 0.34 }),
  });
})();
