/*
 * Ep 13 · line "moon" · THE TURN · "First, the Moon, cool and bright."
 * After a 300 ms rest: the first wonder. The Moon rises, frontal and LARGE, in his silver disc
 * out of the white sea (beats[1], a bell), arms opening; his light whitens the frame.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'moon',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 1.3;
      const rise = E.outCubic(clamp((t - b1 + 1.0) / 1.6));
      EP13.whiteSea(ctx, T, {
        hz: 1200, whirl: 1 - rise,
        after: (g) => {
          CH.chandra.draw(g, { x: 540, y: lerp(2200, 1720, rise), scale: 1.05, facing: 'front', pose: { name: 'rise', k: rise }, light: EP13.seaGlow(540, 1700, 1.15), t: T, key: 'm13-ch' });
          window.EP11.surf(g, 1660, T, 1, { color: '#ffffff', deep: '#ecebf8', deep2: '#b8b8d8' });
        },
      });
      const la = clamp((t - b1) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP13.plaque(ctx, env.strings.moonName, null, KIT.CX, 300, la, { size: 60, key: 'm13-name' });
    },
    post: () => ({ bloom: 0.5, vignette: 0.32, paper: 0.28 }),
  });
})();
