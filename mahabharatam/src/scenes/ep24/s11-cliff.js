/* Ep 24 · line "cliff" · NEXT 1 (the catalog line) · "Why did the Valakhilyas matter so much? Because they had once frightened Indra." · Heaven at night, with omens: meteors streak, a red haze rises; Indra on his throne, his vajra flaring; he looks up, uneasy. EP24.omens is reused by the Next overlay. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP24 = window.EP24;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP24.omens = (ctx, T, t, b1) => {
    const fear = E.outCubic(clamp((t - b1 + 0.2) / 0.5));
    EP24.night(ctx, T, { omens: 0.4 + 0.6 * fear, after: (g) => {
      KIT.glow(g, 600, 1100, 500, '#ffe0a0', 0.3 + 0.4 * fear);
      CH.indra.draw(g, { x: 560, y: lerp(1950, 1900, clamp(t / 4)), scale: 1.05, facing: 'left', pose: { name: 'raise', k: fear }, expression: { look: -0.25 * fear }, light: { dir: -Math.PI / 2 - 0.4, intensity: 1.1, front: 0.55 }, t: T, key: 'om24-in' });
    } });
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.25,
    draw(ctx, t, env) { EP24.omens(ctx, env.T, t, env.beats[1] ?? 2.5); },
    post: () => ({ bloom: 0.42, vignette: 0.48, paper: 0.3 }),
  });
})();
