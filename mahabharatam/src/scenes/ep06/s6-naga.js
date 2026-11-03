/*
 * Ep 6 · line "naga" · "Uttanka followed him into the serpent world, and won them back."
 *
 * NEW PLACE, NEW LIGHT: the Naga world (EP6.naga), deep blue-green bioluminescence. The
 * camera drops with Uttanka down the cleft (beats[0], "followed") and the world opens out
 * (beats[1], "world"): hooded domes, jewels in the rock, luminous roots; Takshaka risen on
 * his coils, the earrings in his hand. On "won" (beats[2]) fire and smoke pour in from
 * above (the Critical Edition's horse breathes fire through the Naga world); the serpent
 * king shrinks back and yields; the earrings fly gold across the green to Uttanka's raised hand.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP6 = window.EP6;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  const G = 1470;

  R.scene({
    id: 'naga',
    fadeIn: 0.4,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 0.6, b1 = env.beats[1] ?? 2.8, b2 = env.beats[2] ?? 4;
      const fall = E.inOutCubic(clamp((t - 0.1) / (b1 - 0.2)));
      const smoke = E.inOutSine(clamp((t - (b2 - 0.5)) / 0.9));
      const recoil = E.inOutCubic(clamp((t - (b2 - 0.3)) / 0.6));
      const give = E.inOutCubic(clamp((t - (b2 + 0.2)) / 0.5));
      const fly = E.inOutSine(clamp((t - (b2 + 0.4)) / 0.7));
      const raise = E.outCubic(clamp((t - (b2 + 0.9)) / 0.5));
      const camY = lerp(-1000, 0, fall);
      EP6.naga(ctx, T, {
        smoke, cam: { zoom: 1.0 + 0.05 * clamp(t / dur), dy: -camY },
        after: (g) => {
          const tko = { x: 700, y: G, scale: 0.7, facing: 'left', pose: give > 0 ? { name: 'give', k: give } : { name: 'recoil', k: recoil }, expression: { mood: 'wrath' }, light: { dir: Math.atan2(-600, -500), intensity: 1 + 0.3 * smoke, front: 0.1 }, t: T, key: 'n6-tk' };
          CH.takshaka.draw(g, tko);
          // Uttanka drops down the shaft and lands; then points; then raises the earrings
          const uy = lerp(G - 1100, G, E.outQuad(clamp((t - b0 + 0.3) / (b1 - b0))));
          const uo = { x: 240, y: uy, scale: 0.6, facing: 'right', pose: raise > 0 ? { name: 'raise', k: raise } : { name: 'point', k: E.inOutCubic(clamp((t - b1) / 0.6)) }, expression: { mood: 'wrath' }, light: { dir: Math.atan2(-700, -200), intensity: 1.1, front: 0.15 }, t: T, key: 'n6-u' };
          CH.uttanka.draw(g, uo);
          const a = CH.takshaka.anchor(tko, 'hand'), b = CH.uttanka.anchor({ ...uo, pose: { name: 'raise', k: 1 } }, 'hand');
          const x = lerp(a[0], b[0], fly), y = lerp(a[1], b[1] - 20, fly) - Math.sin(Math.PI * fly) * 160;
          if (fly > 0.01) KIT.glow(g, x, y, 180, '#ffd070', 0.5 * fly);
          KIT.kundala.pair(g, x, y, 28, T, { glow: 0.8 + fly, cold: 1 - fly });
        },
      });
      const la = clamp((t - b1 + 0.2) / 0.5) * (1 - clamp((t - b2 + 0.3) / 0.4));
      EP6.label(ctx, env.strings.placeNaga || '', KIT.CX, 330, la, { size: 50, spacing: 4, key: 'n6-place' });
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.28 }),
  });
})();
