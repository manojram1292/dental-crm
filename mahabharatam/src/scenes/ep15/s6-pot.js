/*
 * Ep 15 · line "pot" · "They gave her the pot. She gave the amrita to the gods."
 * Two framings in one line (a cut on beats[1], "She"): first an asura holds the glowing pot out
 * to her and she takes it; then across the shore she walks down a row of seated gods, pouring.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP15 = window.EP15;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'pot',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 1.8;
      if (t < b1 - 0.1) {
        const give = E.inOutCubic(clamp((t - 0.2) / 1.0));
        EP15.dusk(ctx, T, { cam: { zoom: 1.25, dy: -120 }, after: (g) => {
          CH.asura.draw(g, { x: 290, y: 1960, scale: 1.0, facing: 'right', index: 0, pose: { name: 'point', k: 1 }, expression: { look: 0.05 }, light: EP15.duskLight(290, 1960), t: T, key: 'p15-a' });
          EP15.potGlow(g, lerp(560, 640, give), 1180, 0.9, 1);
          CH.enchantress.draw(g, { x: 840, y: 1960, scale: 1.05, facing: 'left', pose: { name: 'beckon', k: give }, light: EP15.duskLight(840, 1960, 1.1), t: T, key: 'p15-en' });
        } });
      } else {
        const u = clamp((t - b1) / (dur - b1));
        EP15.dusk(ctx, T, { cam: { zoom: 1.0 }, after: (g) => {
          const ex = lerp(980, 520, E.inOutSine(u));
          for (let i = 0; i < 5; i++) { const x = 120 + i * 190; CH.deva.draw(g, { x, y: 1900, scale: 0.72, facing: 'right', index: i, pose: 'sit', expression: { look: x < ex ? -0.25 : -0.1 }, light: EP15.duskLight(x, 1900), t: T + i, key: 'p15-d' + i }); }
          CH.enchantress.draw(g, { x: ex, y: 1980, scale: 1.0, facing: 'left', pose: { name: 'pour', k: 0.8 }, light: EP15.duskLight(ex, 1980, 1.1), t: T, key: 'p15-en2' });
        } });
      }
    },
    post: () => ({ bloom: 0.42, vignette: 0.42, paper: 0.3 }),
  });
})();
