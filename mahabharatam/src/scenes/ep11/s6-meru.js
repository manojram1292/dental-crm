/*
 * Ep 11 · line "meru" · "It began on Meru, the golden mountain, where the gods sat in council."
 *
 * NEW PLACE AND LIGHT: Meru blazing white-gold (EP11.meru), rays from its peak; every rim
 * turns toward the peak (EP11.meruLight). The camera starts high on the stepped summit and
 * tilts down (beats[0] 'Meru': the name card) to the terrace where six devas stand in a
 * loose circle, each a different crown (beats[2] 'council': they turn to one another).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  const GODS = [[150, 1780, 0.66, 'right', 0], [330, 1640, 0.5, 'right', 1], [480, 1600, 0.44, 'right', 2], [620, 1600, 0.44, 'left', 3], [770, 1640, 0.5, 'left', 4], [940, 1780, 0.66, 'left', 5]];

  R.scene({
    id: 'meru',
    fadeIn: 0.4,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 1.2, b2 = env.beats[2] ?? 4.2;
      const tilt = E.inOutCubic(clamp((t - 0.2) / (b2 - 0.2)));
      const turn = E.inOutSine(clamp((t - b2 + 0.4) / 0.8));
      EP11.meru(ctx, T, {
        cam: { zoom: lerp(1.5, 1.0, tilt), dy: lerp(620, 0, tilt) },
        after: (g) => {
          for (const [x, y, s, f, i] of GODS) CH.deva.draw(g, { x, y, scale: s, facing: f, index: i, pose: i === 2 || i === 3 ? { name: 'point', k: 0.4 * turn } : 'stand', expression: { look: (i % 2 ? -0.1 : 0.06) * turn }, light: EP11.meruLight(x, y), t: T + i, key: 'm11-d' + i });
        },
      });
      const la = clamp((t - b0 + 0.1) / 0.5) * (1 - clamp((t - b2 + 0.6) / 0.5));
      EP11.plaque(ctx, env.strings.meruName, env.strings.meruEpithet, KIT.CX, 1160, la, { size: 66, key: 'm11-name' });
    },
    post: () => ({ bloom: 0.5, vignette: 0.3, paper: 0.3 }),
  });
})();
