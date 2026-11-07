/* Ep 32 · line "council" · "Vasuki called his brothers to council." · NEW LIGHT, the hall by its jewel-fire: Vasuki large at centre behind the fire, serpents arriving at both sides; plaque; the unvoiced recap band at the top. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP32 = window.EP32;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'council',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur), arr = E.outCubic(clamp(t / 2));
      EP32.fireHall(ctx, T, { cam: { zoom: 1.0 + 0.06 * p, dy: -40 }, after: (g) => {
        CH.vasuki.draw(g, { x: 600, y: 1200, scale: 0.6, facing: 'left', pose: { name: 'rise', k: 0.9 }, light: EP32.fireLit(600, 1300), t: T, key: 'c32-va' });
        for (let i = 0; i < 6; i++) { const side = i < 3 ? -1 : 1, x0 = side < 0 ? 140 + i * 110 : 720 + (i - 3) * 110; CH.naga.draw(g, { x: lerp(x0 + side * 500, x0, arr), y: 1500 + (i % 2) * 40, scale: 0.36, facing: side < 0 ? 'right' : 'left', index: [0, 2, 3, 5, 0, 2][i], pose: { name: 'rise', k: 0.6 }, light: EP32.fireLit(x0, 1700), t: T + i, key: 'c32-n' + i }); }
      } });
      EPA.plaque(ctx, env.strings.vasukiName, env.strings.vasukiEpithet, KIT.CX, 560, clamp((t - env.beats[0] - 0.2) / 0.3) * (1 - clamp((t - env.dur + 0.4) / 0.3)), { size: 52, key: 'c32-pl' });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.3) / 0.3)), env.strings, { y: 300 });
    },
    post: () => ({ bloom: 0.42, vignette: 0.46, paper: 0.3 }),
  });
})();
