/*
 * Ep 6 · line "gave" · "The queen gave them, but warned:"
 *
 * NEW PLACE, NEW LIGHT: King Paushya's palace in warm gold (EP6.palace): lamps, an arcade,
 * the glowing stone lattice. The queen (left) takes off her earrings and lays them in
 * Uttanka's cupped hands (right); on "gave" (beats[0]) they pass from hand to hand; on
 * "warned" (beats[1]) she lifts a finger.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP6 = window.EP6;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'gave',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.8, b1 = env.beats[1] ?? dur * 0.8;
      const give = E.inOutCubic(clamp((t - (b0 - 0.9)) / 0.9));
      const pass = E.inOutSine(clamp((t - (b0 - 0.1)) / 0.7));
      const warn = E.inOutCubic(clamp((t - (b1 - 0.3)) / 0.6));
      const L = EP6.PLAMP;
      EP6.palace(ctx, T, {
        cam: { zoom: 1.0 + 0.06 * p },
        after: (g) => {
          const qo = { x: 360, y: 1480, scale: 0.66, facing: 'right', pose: warn > 0 ? { name: 'warn', k: warn, earrings: false } : { name: 'give', k: give }, light: EP6.light(360, 1100, L.x, L.y, 1, 0.35), t: T, key: 'g6-q' };
          const uo = { x: 760, y: 1490, scale: 0.62, facing: 'left', pose: { name: 'hold', k: E.inOutCubic(clamp((t - (b0 - 0.6)) / 0.7)) }, light: EP6.light(760, 1100, L.x, L.y, 1, 0.35), t: T, key: 'g6-u' };
          CH.queen.draw(g, qo);
          CH.uttanka.draw(g, uo);
          if (give > 0.15) {
            const a = CH.queen.anchor({ ...qo, pose: { name: 'give', k: give } }, 'hands'), b = CH.uttanka.anchor(uo, 'hand');
            const x = lerp(a[0], b[0], pass), y = lerp(a[1], b[1] - 20, pass) - Math.sin(Math.PI * pass) * 50;
            KIT.kundala.pair(g, x, y, 34, T, { glow: 0.9 });
          }
        },
      });
      const la = clamp((t - 0.3) / 0.6) * (1 - clamp((t - dur + 0.5) / 0.4));
      EP6.label(ctx, env.strings.placePaushya || '', KIT.CX, 300, la, { size: 52, spacing: 4, key: 'g6-place' });
    },
    post: () => ({ bloom: 0.34, vignette: 0.42, paper: 0.32 }),
  });
})();
