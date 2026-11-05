/* Ep 26 · line "cliff" · NEXT 1 (the catalog line) · "But the amrita was ringed with fire, and a wheel of blades." · Garuda alone in the emptied courtyard faces the amrita: a ring of roaring fire (beats[0]) and behind it the spinning wheel edged with blades (beats[1]). EP26.ring is reused by the Next overlay. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP26 = window.EP26, EP15 = window.EP15;
  const { clamp, E } = R;
  const CH = KIT.characters;
  EP26.ring = (ctx, T, t, b0, b1) => {
    const f = E.outCubic(clamp((t - b0 + 0.3) / 0.5)), w = E.outCubic(clamp((t - b1 + 0.3) / 0.5));
    EP26.court(ctx, T, { storm: 0.4, cam: { zoom: 1.0, dy: 100 }, after: (g) => {
      EP26.wheel(g, 540, 1080, 300, T, { a: w });
      EP15.potGlow(g, 540, 1080, 0.8, 1);
      EP26.fireRing(g, 540, 1300, 420, T, f);
      CH.garuda.draw(g, { x: 900, y: 2050, scale: 0.85, facing: 'left', pose: { name: 'stand' }, expression: { look: -0.15 }, light: { dir: -Math.PI / 2 - 0.6, intensity: 1.2, front: 0.6 }, t: T, key: 'cl26-ga' });
    } });
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.2,
    draw(ctx, t, env) { EP26.ring(ctx, env.T, t, env.beats[0] ?? 1.5, env.beats[1] ?? 2.8); },
    post: () => ({ bloom: 0.44, vignette: 0.46, paper: 0.3 }),
  });
})();
