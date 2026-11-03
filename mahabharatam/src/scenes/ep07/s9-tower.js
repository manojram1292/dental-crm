/*
 * Ep 7 · line "tower" · "The king hid in a palace on one pillar, guarded by healers and mantras."
 *
 * NEW PLACE, NEW LIGHT: the palace on one pillar (EP7.tower), a cold blue-silver moonlit
 * night. The camera rises up the pillar from the moat to the lamplit pavilion where the
 * king sits; guards at the foot, healers with their herbs on the steps; on "palace"
 * (beats[0]) the place label; on "mantras" (beats[2]) gold syllables circle the pavilion.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP7 = window.EP7;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'tower',
    fadeIn: 0.7,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1.3, b2 = env.beats[2] ?? 4.3;
      const rise = E.inOutSine(clamp(t / (dur * 0.8)));
      const mantra = E.outCubic(clamp((t - (b2 - 0.8)) / 1.0));
      EP7.tower(ctx, T, {
        sky: 0, mantra,
        cam: { zoom: lerp(1.0, 1.25, rise), dy: lerp(-120, 330, rise) },
        inside: (g, TW) => {
          CH.parikshit.draw(g, { x: TW.x + 40, y: TW.top - 20, scale: 0.2, facing: 'left', pose: 'sit', light: { dir: -0.3, intensity: 0.9, front: 0.3 }, t: T, key: 't7-pk' });
        },
        after: (g) => {
          // healers on the steps at the pillar's foot: herb bowls glowing
          for (const [x, i] of [[430, 1], [690, 4]]) {
            CH.sage.draw(g, { x, y: 1330, scale: 0.26, facing: 'front', index: i, pose: 'sit', light: { dir: -Math.PI / 2, intensity: 0.7, front: 0.4 }, t: T, key: 't7-s' + i });
            KIT.glow(g, x, 1310, 70, '#9affc0', 0.4);
          }
        },
      });
      const la = clamp((t - (b0 - 0.1)) / 0.5) * (1 - clamp((t - dur + 0.4) / 0.35));
      EP7.label(ctx, (env.strings.towerLabel || '').toUpperCase(), KIT.CX, 300, la, { size: 44, spacing: 5, key: 't7-place' });
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.32 }),
  });
})();
