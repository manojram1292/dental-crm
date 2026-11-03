/*
 * Ep 8 · line "priests" · "Priests in black, their eyes red with smoke, called the serpents by name."
 *
 * The sarpa-satra ablaze (EP8.satra): the great fire in its altar, crimson smoke. Priests
 * in black sit on either side, large, facing the fire, pouring with the sruva (offer); on
 * "black" (beats[0]) the nearest leans in; on "smoke" (beats[1]) the smoke thickens round
 * their red eyes; on "serpents" (beats[2]) they raise their hands (chant) and the first
 * hoods appear in the clouds above.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP8 = window.EP8;
  const { clamp, E, hash } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'priests',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.6, b1 = env.beats[1] ?? 2.5, b2 = env.beats[2] ?? 4.2;
      const off = E.inOutSine(clamp((t - (b0 - 0.4)) / 0.8));
      const chant = E.inOutCubic(clamp((t - (b2 - 0.4)) / 0.6));
      const hoods = E.outCubic(clamp((t - (b2 - 0.2)) / 0.8));
      const smoke = clamp((t - (b1 - 0.5)) / 1.0);
      EP8.satra(ctx, T, {
        fire: 0.9 + 0.2 * chant, cam: { zoom: 1.08 + 0.04 * p, dy: -80 },
        sky: (g) => {
          if (hoods > 0.01) for (let i = 0; i < 6; i++) {
            const x = 140 + i * 160 + Math.sin(T + i) * 20, y = 220 + hash(i, 7) * 260;
            g.save(); g.globalAlpha = hoods * 0.8; EP8.serpent(g, x, y, 120 + hash(i, 8) * 80, -Math.PI / 2 + (hash(i, 9) - 0.5), T, i * 3, { kind: i, w: 14 + hash(i, 4) * 10, hood: true, speed: 3 }); g.restore();
          }
        },
        after: (g) => {
          const F = EP8.FIRE;
          KIT.smoke.draw(g, F.x, F.y - 500, T, { h: -900, w: 260, strands: 5, alpha: 0.18 + 0.25 * smoke, color: '#2a1410', lean: 30, speed: 0.8, seed: 81, curls: 1, spread: 1.6 });
          const seat = [[150, 1620, 0, 'right', 0.95], [300, 1500, 2, 'right', 0.7], [930, 1620, 1, 'left', 0.95], [780, 1500, 3, 'left', 0.7]];
          for (const [x, y, i, f, s] of seat) {
            const pose = chant > 0.01 ? { name: 'chant', base: 'sit', k: chant } : { name: 'offer', base: 'sit', k: i < 2 ? off : 0.6 * off, phase: T * 2 + i };
            CH.priest.draw(g, { x, y, scale: s, facing: f, index: i, pose, expression: { speak: chant > 0.5 ? 0.4 + 0.4 * Math.sin(T * 9 + i) : 0 }, light: EP8.fireLight(x, y, KIT.flicker(T, i * 7), 0.4), t: T, key: 'p8-' + i });
          }
        },
      });
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }),
  });
})();
