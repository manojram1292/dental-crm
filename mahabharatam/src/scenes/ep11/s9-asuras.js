/*
 * Ep 11 · line "asuras" · "Gods and asuras, old rivals, side by side."
 *
 * A split composition on the dark shore of the ocean (EP11.sea, a sand foreground): on
 * "Gods" (beats[0]) four devas walk in from the left (pearl-gold rims); on "asuras"
 * (beats[1], a low drum) four asuras stride in from the right (ember rims); on "side"
 * (beats[2]) both lines halt face to face, a gap of sea-light between them.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'asuras',
    fadeIn: 0.3,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.2, b1 = env.beats[1] ?? 1.1, b2 = env.beats[2] ?? 3.1;
      const gIn = E.outCubic(clamp((t - b0 + 0.3) / (b2 - b0))), aIn = E.outCubic(clamp((t - b1 + 0.4) / (b2 - b1 + 0.2)));
      EP11.sea(ctx, T, {
        cam: { zoom: 1.05 + 0.04 * p }, hz: 1060, jewels: 0.4,
        after: (g) => {
          KIT.vgrad(g, 1560, 2400, [[0, '#3a3450'], [0.2, '#24203a'], [1, '#0c0a14']], -400, 1480);
          const L = (x, y) => ({ ...EP11.seaLight(x, y, 1.1), front: 0.45 });
          for (let i = 3; i >= 0; i--) {
            const x = lerp(-300, 120 + i * 115, gIn) - i * 20, y = 1800 + i * 36;
            CH.deva.draw(g, { x, y, scale: 0.92 - i * 0.05, facing: 'right', index: [0, 2, 5, 3][i], pose: gIn < 0.98 ? { name: 'walk', phase: T * 6 + i } : 'stand', light: L(x, y), t: T + i, key: 'x11-d' + i });
          }
          for (let i = 3; i >= 0; i--) {
            const x = lerp(1400, 960 - i * 115, aIn) + i * 20, y = 1800 + i * 36;
            CH.asura.draw(g, { x, y, scale: 0.92 - i * 0.05, facing: 'left', index: [0, 1, 2, 4][i], pose: aIn < 0.98 ? { name: 'walk', phase: T * 5.5 + i } : 'stand', light: L(x, y), t: T + i, key: 'x11-a' + i });
          }
        },
      });
      const la = clamp((t - b1) / 0.4) * (1 - clamp((t - dur + 0.4) / 0.4));
      if (la > 0.01) {
        EP11.label(ctx, env.strings.devasName, 280, 520, la, { size: 50, band: 0, key: 'x11-dn' });
        EP11.label(ctx, env.strings.asurasName, 800, 520, la, { size: 50, band: 0, key: 'x11-an' });
      }
    },
    post: () => ({ bloom: 0.36, vignette: 0.45, paper: 0.32 }),
  });
})();
