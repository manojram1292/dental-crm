/* Ep 36 · line "cliff" · NEXT 1 · "Meanwhile, in Hastinapura, a king was asking how his father died." · NEW LIGHT, Janamejaya's court at night by torchlight: the young king on his throne leaning forward (beats[2]); ministers before him; his father's painted panel behind. EP36.ask is reused by the Next overlay. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35, EP36 = window.EP36;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP36.ask = (ctx, T, t, b2) => {
    const lean = E.inOutSine(clamp((t - b2 + 0.6) / 0.8)), u = clamp(t / 6);
    EP36.court(ctx, T, { cam: { zoom: 1.1 + 0.12 * u, dy: -200 }, after: (g) => {
      CH.janamejaya.draw(g, { x: 560, y: 1500, scale: 0.85, facing: 'left', pose: { name: 'sit' }, expression: { look: 0.05 + 0.12 * lean, mood: 'calm' }, light: EP36.torch(560, 1200, 1.15), t: T, key: 'c36-jj' });
      for (let i = 0; i < 2; i++) CH.sage.draw(g, { x: 120 + i * 150, y: 1760, scale: 0.6, facing: 'right', index: i + 2, pose: { name: 'stand' }, light: EP36.torch(150, 1500, 1.0), t: T + i, key: 'c36-m' + i });
    } });
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.25,
    draw(ctx, t, env) { EP36.ask(ctx, env.T, t, env.beats[2]); },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }),
  });
})();
