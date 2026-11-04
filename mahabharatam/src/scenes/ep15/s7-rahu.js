/*
 * Ep 15 · line "rahu" · THE TURN · "But one asura, Rahu, sat among the gods in disguise, and drank."
 * The row of seated gods, closer; one of them is drawn in Rahu's eclipse light (beats[1]: his name
 * card); on "drank" (beats[3]) he lifts the cup and the disguise slips: his rim burns red.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP15 = window.EP15;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'rahu',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 1, b3 = env.beats[3] ?? 5.4;
      const slip = E.inOutSine(clamp((t - b3 + 0.4) / 0.8));
      EP15.dusk(ctx, T, {
        cam: { zoom: 1.35 + 0.08 * p, dx: -80, dy: -230 },
        after: (g) => {
          for (let i = 0; i < 4; i++) { const x = 140 + i * 230; if (i === 2) continue; CH.deva.draw(g, { x, y: 1900, scale: 0.8, facing: 'right', index: [0, 3, 0, 5][i], pose: 'sit', light: EP15.duskLight(x, 1900), t: T + i, key: 'r15-d' + i }); }
          CH.rahu.draw(g, { x: 600, y: 1900, scale: 0.8, facing: 'right', pose: { name: 'disguise', base: 'sit', k: slip }, expression: { look: -0.1 - 0.2 * slip }, light: EP15.duskLight(600, 1900, 1.1), t: T, key: 'r15-ra' });
          EP15.potGlow(g, 760, 1520 - 120 * slip, 0.35, 0.8);
        },
      });
      const la = clamp((t - b1) / 0.4) * (1 - clamp((t - b3 + 0.6) / 0.4));
      EP15.plaque(ctx, env.strings.rahuName, null, KIT.CX, 300, la, { size: 56, key: 'r15-name' });
    },
    post: () => ({ bloom: 0.44, vignette: 0.45, paper: 0.3 }),
  });
})();
