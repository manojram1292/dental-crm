/*
 * Ep 15 · line "cliff" · NEXT (cliffhanger image) · "The asuras saw they had been tricked. War broke out on the shore."
 * The enchantress turns and her rim shows Narayana's gold (pose.reveal, beats[0] 'tricked'); the
 * asuras raise their weapons (beats[1] 'War', a drum); the gods rise opposite.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP15 = window.EP15;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'cliff',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1.5, b1 = env.beats[1] ?? 2.6;
      const rv = clamp((t - b0 + 0.2) / 0.3), war = E.outCubic(clamp((t - b1 + 0.2) / 0.5));
      EP15.dusk(ctx, T, {
        cam: { zoom: 1.0 + 0.05 * p },
        after: (g) => {
          KIT.glow(g, 540, 1500, 700, '#e8b040', 0.3 * rv);
          CH.enchantress.draw(g, { x: 560, y: 1820, scale: 0.9, facing: 'left', pose: { name: 'carry', reveal: rv }, light: EP15.duskLight(560, 1820, 1.1), t: T, key: 'x15-en' });
          for (let i = 0; i < 3; i++) {
            CH.asura.draw(g, { x: 1000 - i * 120, y: 1990 + i * 12, scale: 0.86, facing: 'left', index: [0, 2, 4][i], pose: { name: 'raise', k: war }, expression: { mood: 'wrath' }, light: EP15.duskLight(1000 - i * 120, 1990), t: T + i, key: 'x15-a' + i });
            CH.deva.draw(g, { x: 80 + i * 120, y: 1990 + i * 12, scale: 0.84, facing: 'right', index: [0, 2, 3][i], pose: { name: 'raise', k: war }, light: EP15.duskLight(80 + i * 120, 1990), t: T + i, key: 'x15-d' + i });
          }
        },
      });
    },
    post: () => ({ bloom: 0.44, vignette: 0.45, paper: 0.3 }),
  });
})();
