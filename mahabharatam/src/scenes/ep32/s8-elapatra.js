/* Ep 32 · line "elapatra" · THE TURN · "I heard Brahma speak of this, from our mother's lap." · After the 0.9 s silence: Elapatra, slender, silver-teal, rises out of the crowd into the jewel-light (beats[0]); plaque. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP32 = window.EP32;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'elapatra',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0], up = E.outCubic(clamp((t - b0 + 0.6) / 0.9)), p = clamp(t / env.dur);
      EP32.fireHall(ctx, T, { fire: 0.7, cam: { zoom: 1.35 + 0.08 * p, dx: -80, dy: 80 }, after: (g) => {
        for (let i = 0; i < 5; i++) { const x = 160 + i * 190; if (i === 2) continue; CH.naga.draw(g, { x, y: 1900, scale: 0.4, facing: x < 540 ? 'right' : 'left', index: [0, 2, 0, 3, 5][i], pose: { name: 'rise', k: 0.5 }, light: EP32.fireLit(x, 1900, 0.8), t: T + i, key: 'e32-n' + i }); }
        CH.elapatra.draw(g, { x: 560, y: lerp(2300, 1900, up), scale: 1.05, facing: 'left', pose: { name: 'rise', k: 0.4 + 0.6 * up }, light: EP32.fireLit(560, 1700, 1.25), t: T, key: 'e32-el' });
      } });
      EPA.plaque(ctx, env.strings.elapatraName, env.strings.elapatraEpithet, KIT.CX, 480, clamp((t - b0 - 0.4) / 0.3) * (1 - clamp((t - env.dur + 0.4) / 0.3)), { size: 52, key: 'e32-pl' });
    },
    post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.3 }),
  });
})();
