/*
 * Ep 9 · line "eggs" · "Kadru laid a thousand eggs. Vinata laid two."
 *
 * Under the banyan, at first light: on "thousand" (beats[0]) a wave of small olive eggs
 * spreads over the ground on Kadru's side; on "two" (beats[2]) two great luminous eggs,
 * rose-red and gold, appear before Vinata. Each sister watches over her own.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP9 = window.EP9;
  const { clamp, E, hash } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'eggs',
    fadeIn: 0.5,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1.2, b2 = env.beats[2] ?? 3.7;
      const wave = clamp((t - (b0 - 0.4)) / 1.2);
      const two = E.outBack ? E.outBack(clamp((t - (b2 - 0.3)) / 0.6)) : E.outCubic(clamp((t - (b2 - 0.3)) / 0.6));
      EP9.hermitage(ctx, T, {
        glow: 0.85, cam: { zoom: 1.1 + 0.03 * p, dy: -20 },
        after: (g) => {
          CH.kadru.draw(g, { x: 120, y: 1520, scale: 0.78, facing: 'right', pose: { name: 'cradle', k: 0.5 }, light: EP9.light(120, 1520), t: T, key: 'e9-kd' });
          CH.vinata.draw(g, { x: 960, y: 1520, scale: 0.76, facing: 'left', pose: { name: 'cradle', k: 0.5 }, light: EP9.light(960, 1520), t: T, key: 'e9-vn' });
          // a thousand small eggs (a few hundred drawn), appearing in a wave from Kadru outward
          for (let i = 0; i < 260; i++) {
            const x = 160 + hash(i, 81) * 460, y = 1300 + hash(i, 82) * 230, d = (x - 160) / 460;
            const a = clamp((wave - d * 0.8) * 5);
            if (a > 0.01) EP9.egg(g, x, y, 9 + hash(i, 83) * 6 + (y - 1300) * 0.02, 'serpent', T, { alpha: a, glow: 0.05 });
          }
          const s = Math.max(0, two);
          if (s > 0.01) { EP9.egg(g, 740, 1400, 70 * s, 'rose', T, { glow: 0.5 }); EP9.egg(g, 880, 1420, 72 * s, 'gold', T, { glow: 0.5 }); }
        },
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.42, paper: 0.34 }),
  });
})();
