/*
 * Ep 16 · line "flee" · "The asuras fled, into the earth and into the sea."
 * The discus sweeps low over the shore; the asuras turn and run; on "earth" (beats[1]) the ones at
 * the left sink as shadows into cracks of the ground; on "sea" (beats[2]) the ones at the right dive
 * under the waves. Stylised: they vanish as shadows, no blood.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP16 = window.EP16;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'flee',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 1.3, b2 = env.beats[2] ?? 2.9;
      const sinkL = E.inOutSine(clamp((t - b1 + 0.3) / 0.9)), sinkR = E.inOutSine(clamp((t - b2 + 0.3) / 0.9));
      EP16.battle(ctx, T, {
        streaks: 0.2, hz: 1250,
        after: (g) => {
          CH.vishnu.discus(g, lerp(-100, 1200, p), 900 + 60 * Math.sin(T * 2), 70, T, 1, T * 14);
          for (let i = 0; i < 3; i++) {
            const xl = 120 + i * 140, yl = 1900 + sinkL * 300;
            g.save(); g.beginPath(); g.rect(-400, -400, 2000, 1900 + 400 + i * 10); g.clip();
            CH.asura.draw(g, { x: xl, y: yl, scale: 0.8, facing: 'left', index: i, pose: { name: 'cower', k: 1 }, light: EP16.fireLight(xl, 1900), t: T + i, alpha: 1 - sinkL * 0.6, key: 'f16-l' + i });
            g.restore();
            if (sinkL > 0.05) { g.strokeStyle = '#ff9a50'; g.lineWidth = 4; g.globalAlpha = 0.7 * (1 - sinkL * 0.5); g.beginPath(); g.moveTo(xl - 120, 1905); g.lineTo(xl - 20, 1895); g.lineTo(xl + 40, 1910); g.lineTo(xl + 120, 1900); g.stroke(); g.globalAlpha = 1; }
            const xr = 680 + i * 150, yr = lerp(1880, 2300, sinkR);
            CH.asura.draw(g, { x: xr, y: yr, scale: 0.8, facing: 'right', index: i + 3, pose: { name: 'walk', phase: T * 7 + i }, light: EP16.fireLight(xr, 1880), t: T + i, alpha: 1 - sinkR * 0.7, key: 'f16-r' + i });
          }
          if (sinkR > 0.01) window.EP11.surf(g, 1950, T, sinkR, { color: '#ffd8c0', deep: '#3a1a20', deep2: '#0c0812' });
        },
      });
    },
    post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.3 }),
  });
})();
