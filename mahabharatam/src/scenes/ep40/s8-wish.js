/* Ep 40 · line "wish" · Astika speaks · "Whoever tells this story, let them never fear a serpent." · The boy close, lit gold, hand open toward the serpents; all hoods lift together on the last word (the boon granted). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39, EP40 = window.EP40;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'wish',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, lift = E.outCubic(clamp((t - env.beats[1] + 0.2) / 0.5));
      EP40.goldHall(ctx, T, { cam: { zoom: 1.55, dy: -560, dx: 60 }, after: (g) => {
        for (let i = 0; i < 4; i++) { const x = 700 + i * 120; CH.naga.draw(g, { x, y: 1760 + (i % 2) * 40, scale: 0.34, facing: 'left', index: [0, 2, 0, 3][i], pose: { name: 'rise', k: lerp(0.45, 0.95, lift) }, light: EP40.goldLit(x, 1760), t: T + i, key: 'w40-n' + i }); }
        CH.astika.draw(g, { x: 420, y: 1820, scale: 0.85, facing: 'right', pose: { name: 'speak', k: 1 }, expression: { speak: EPA.mouth(env, t) }, light: EP40.goldLit(420, 1820, 1.3), t: T, key: 'w40-as' });
      } });
    },
    post: () => ({ bloom: 0.5, vignette: 0.44, paper: 0.3 }),
  });
})();
