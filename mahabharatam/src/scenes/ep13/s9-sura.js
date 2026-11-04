/*
 * Ep 13 · line "sura" · "The goddess of wine, and the white horse."
 * A split frame: Sura Devi rising at the left, her cup held up (beats[0]); the white horse
 * leaping out of the milk at the right (beats[1]).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'sura',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T;
      const b0 = env.beats[0] ?? 0.3, b1 = env.beats[1] ?? 1.9;
      const s = E.outCubic(clamp((t - b0 + 0.5) / 1.2)), h = E.outCubic(clamp((t - b1 + 0.5) / 1.0));
      EP13.whiteSea(ctx, T, {
        hz: 1250,
        after: (g) => {
          CH.sura.draw(g, { x: 290, y: lerp(2200, 1780, s), scale: 0.95, facing: 'front', pose: { name: 'rise', k: s }, light: EP13.seaGlow(290, 1700, 1.05), t: T, key: 'u13-su' });
          CH.horse.draw(g, { x: 800, y: lerp(1900, 1500, h), scale: 0.62, facing: 'left', pose: { name: 'gallop', phase: T * 5 }, light: EP13.seaGlow(800, 1500, 1.0), t: T, alpha: clamp(h * 2), key: 'u13-ho' });
          window.EP11.surf(g, 1700, T, 1, { color: '#ffffff', deep: '#ecebf8', deep2: '#b8b8d8' });
        },
      });
      EP13.plaque(ctx, env.strings.suraName, env.strings.suraEpithet, 300, 330, clamp((t - b0) / 0.4) * (1 - clamp((t - b1 + 0.1) / 0.3)), { size: 46, key: 'u13-n1' });
      EP13.plaque(ctx, env.strings.horseName, null, 760, 330, clamp((t - b1) / 0.4), { size: 40, key: 'u13-n2' });
    },
    post: () => ({ bloom: 0.44, vignette: 0.32, paper: 0.28 }),
  });
})();
