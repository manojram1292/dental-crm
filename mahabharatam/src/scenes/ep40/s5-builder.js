/* Ep 40 · line "builder" · "The builder's warning had come true: a brahmin had stopped the rite." · The old builder (episode 8's sthapati) nods at the edge of the dusk enclosure, his cord in hand, lit by the embers; plaque. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39, EP40 = window.EP40;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'builder',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP40.embers(ctx, T, { k: 1, cam: { zoom: 1.45 + 0.06 * p, dy: -380, dx: 200 }, after: (g) => {
        CH.sthapati.draw(g, { x: 300, y: 1760, scale: 0.85, facing: 'right', pose: { name: 'warn', k: 0.6 + 0.2 * Math.sin(t * 1.4) }, light: EP40.duskLit(300, 1500, 1.2), t: T, key: 'b40-st' });
      } });
      EPA.plaque(ctx, env.strings.builderName, env.strings.builderEpithet, KIT.CX, 340, clamp((t - env.beats[0]) / 0.3) * (1 - clamp((t - env.dur + 0.4) / 0.3)), { size: 46, key: 'b40-pl' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }),
  });
})();
