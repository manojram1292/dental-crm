/*
 * Ep 8 · line "builder" · "As the ground was measured, a builder foretold: a brahmin would stop this rite."
 *
 * NEW PLACE, NEW LIGHT: the sacrifice ground before the rite (EP8.satra, dawn): grey-rose
 * light, cords and pegs, the chalk square of the altar to be. A builder bends with his
 * plumb-line (measure); on "builder" (beats[1]) he looks up and raises a warning finger; on
 * "brahmin" (beats[2]) a boy's long shadow, a staff in his hand, falls across the cords
 * (a foreshadowing of the brahmin boy). The place label on "measured" (beats[0]).
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP8 = window.EP8;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'builder',
    fadeIn: 0.7,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1, b1 = env.beats[1] ?? 2.2, b2 = env.beats[2] ?? 3.9;
      const meas = E.inOutSine(clamp(t / 0.8)) * (1 - E.inOutCubic(clamp((t - (b1 - 0.3)) / 0.6)));
      const warn = E.inOutCubic(clamp((t - (b1 - 0.1)) / 0.6));
      const boy = E.inOutSine(clamp((t - (b2 - 0.5)) / 1.2));
      const L = { dir: -Math.PI / 2 - 0.6, intensity: 0.95, front: 0.3 };
      EP8.satra(ctx, T, {
        dawn: 1, fire: 0, cam: { zoom: 1.1 + 0.05 * p, dy: -60 },
        after: (g) => {
          if (boy > 0.01) {
            // a boy's long shadow across the cords (the light is low behind him, off-frame right)
            g.save(); g.globalAlpha = 0.55 * boy; g.translate(lerp(1200, 980, boy), 1560); g.transform(1, 0, 1.5, 0.5, 0, 0);
            CH.uttanka.shape(g, '#1a1018', { x: 0, y: 0, scale: 0.6, facing: 'left', pose: 'stand', t: T });
            g.restore();
          }
          const pose = warn > 0.01 ? { name: 'warn', k: warn } : { name: 'measure', k: meas };
          CH.sthapati.draw(g, { x: 560, y: 1620, scale: 1.0, facing: 'left', pose, expression: { look: -0.1 * warn }, light: L, t: T, key: 'b8-st' });
        },
      });
      const la = clamp((t - (b0 - 0.2)) / 0.5) * (1 - clamp((t - dur + 0.4) / 0.35));
      EP8.label(ctx, (env.strings.placeSatra || '').toUpperCase(), KIT.CX, 300, la, { size: 52, key: 'b8-place' });
    },
    post: () => ({ bloom: 0.3, vignette: 0.42, paper: 0.36 }),
  });
})();
