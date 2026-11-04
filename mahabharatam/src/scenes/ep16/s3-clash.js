/*
 * Ep 16 · line "clash" · "On the shore of the salt sea, gods and asuras clashed, and the sky filled with weapons."
 * NEW PLACE AND LIGHT: the shore in battle at night (EP16.battle). A wide frieze: the hosts charge
 * from both sides (walk), meeting on "clashed" (beats[1], a drum) in raised and striking poses; the
 * weapon-streaks thicken across the sky (beats[3]).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP16 = window.EP16;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'clash',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 2.9, b3 = env.beats[3] ?? 5.4;
      const meet = E.outCubic(clamp((t - 0.2) / (b1 - 0.2))), fill = clamp(0.3 + (t - b3 + 1.5) / 1.5);
      EP16.battle(ctx, T, {
        streaks: fill, cam: { zoom: 1.0 + 0.04 * p },
        after: (g) => {
          for (let i = 3; i >= 0; i--) {
            const y = 1760 + i * 50, s = 0.7 + i * 0.06;
            const xd = lerp(-200 - i * 80, 330 - i * 70, meet), xa = lerp(1280 + i * 80, 750 + i * 70, meet);
            const fight = t > b1 - 0.1 ? { name: 'strike', k: 0.5 + 0.5 * Math.sin(T * 3 + i) } : { name: 'walk', phase: T * 7 + i };
            CH.deva.draw(g, { x: xd, y, scale: s, facing: 'right', index: [0, 2, 3, 5][i], pose: fight, light: EP16.fireLight(xd, y), t: T + i, key: 'c16-d' + i });
            CH.asura.draw(g, { x: xa, y, scale: s * 1.04, facing: 'left', index: [1, 0, 4, 2][i], pose: t > b1 - 0.1 ? { name: 'strike', k: 0.5 + 0.5 * Math.sin(T * 3 + i + 1.5) } : { name: 'walk', phase: T * 7 + i }, expression: { mood: 'wrath' }, light: EP16.fireLight(xa, y), t: T + i, key: 'c16-a' + i });
          }
        },
      });
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }),
  });
})();
