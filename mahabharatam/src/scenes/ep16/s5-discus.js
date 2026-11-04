/*
 * Ep 16 · line "discus" · THE TURN · "Then Narayana called his discus, Sudarshana, blazing like fire."
 * After a 350 ms rest: Narayana frontal and LARGE raises his hand (beats[0]); the discus comes down out
 * of the red sky, blazing, to hover above his hand (beats[2], name card, a bell); it spins and flares
 * (beats[3]). Its white-gold is now the scene's second light.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP16 = window.EP16;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'discus',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 0.4, b2 = env.beats[2] ?? 2.9, b3 = env.beats[3] ?? 4.8;
      const raise = E.outCubic(clamp((t - b0 + 0.2) / 0.6)), come = E.inOutCubic(clamp((t - b0) / (b2 - b0))), flare = E.inOutSine(clamp((t - b3 + 0.4) / 0.6));
      EP16.battle(ctx, T, {
        streaks: 0.3, hz: 1500,
        after: (g) => {
          KIT.glow(g, 540, 900, 900, '#ffe8a0', 0.25 + 0.3 * come);
          CH.vishnu.draw(g, { x: 560, y: 2040, scale: 1.18, facing: 'front', pose: { name: 'discus', k: raise * (0.4 + 0.6 * flare), noDiscus: come < 0.999 }, light: { dir: -Math.PI / 2, intensity: 1.15, front: 0.55 }, t: T, key: 'v16-vi' });
          if (come < 0.999) CH.vishnu.discus(g, lerp(1000, 560 - 300 * 1.18, come), lerp(-100, 2040 - 1260 * 1.18, come), 90, T, 1, T * 10);
        },
      });
      const la = clamp((t - b2) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP16.plaque(ctx, env.strings.discusName, env.strings.discusEpithet, KIT.CX, 250, la, { size: 56, key: 'v16-name' });
    },
    post: () => ({ bloom: 0.5, vignette: 0.48, paper: 0.3 }),
  });
})();
