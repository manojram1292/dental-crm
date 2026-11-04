/*
 * Ep 15 · line "enchantress" · "He became a woman so wondrous that the asuras forgot everything."
 * NEW LIGHT: the shore at violet dusk (EP15.dusk). The enchantress walks in from the right, LARGE
 * in profile, her veil floating; three asuras at the left turn to her, spellbound; on "forgot"
 * (beats[2]) their weapons lower (point → stand). Name card. Caption lifted.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP15 = window.EP15;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'enchantress',
    fadeIn: 0.35,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.8, b2 = env.beats[2] ?? 3.9;
      const walk = E.outCubic(clamp(t / (dur * 0.85))), lower = E.inOutSine(clamp((t - b2 + 0.3) / 0.6));
      EP15.dusk(ctx, T, {
        cam: { zoom: 1.0 + 0.04 * p },
        after: (g) => {
          for (let i = 2; i >= 0; i--) CH.asura.draw(g, { x: 70 + i * 120, y: 1900 + i * 18, scale: 0.8 - i * 0.05, facing: 'right', index: [1, 3, 5][i], pose: lower < 0.5 ? { name: 'raise', k: 1 - lower * 2 } : 'stand', expression: { look: -0.05 }, light: EP15.duskLight(70 + i * 120, 1900), t: T + i, key: 'e15-a' + i });
          CH.enchantress.draw(g, { x: lerp(1100, 700, walk), y: 1960, scale: 1.12, facing: 'left', pose: walk < 0.97 ? { name: 'walk', phase: T * 3.2, pot: false } : { name: 'beckon', k: 0.6 }, light: EP15.duskLight(700, 1960, 1.1), t: T, key: 'e15-en' });
        },
      });
      const la = clamp((t - b0) / 0.5) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP15.plaque(ctx, env.strings.enchantressName, env.strings.enchantressEpithet, KIT.CX, 250, la, { size: 52, key: 'e15-name' });
    },
    post: () => ({ bloom: 0.44, vignette: 0.42, paper: 0.3 }),
  });
})();
