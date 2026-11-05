/* Ep 21 · line "cliff" · NEXT 1 (the catalog line) · "He swooped down on the Nishadas, and swallowed something that burned." · Garuda dives on the moonlit bay, beak open, the water torn by his wings, the village rushing up; on "burned" (beats[2]) a coal-red glow lights in his throat and he jerks his head up. EP21.dive is reused by the Next overlay. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP21 = window.EP21;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP21.dive = (ctx, T, t, b2) => {
    const d = E.inCubic(clamp(t / Math.max(0.5, b2)));
    const jerk = E.outBack ? E.outBack(clamp((t - b2) / 0.4)) : E.outCubic(clamp((t - b2) / 0.4));
    EP21.bay(ctx, T, { rush: d, cam: { zoom: lerp(1.0, 1.4, d), dy: lerp(0, -120, d) }, after: (g) => {
      const gx = lerp(700, 560, d), gy = lerp(900, 1500, d);
      g.save(); g.translate(gx, gy); g.rotate(lerp(-0.5, -0.2, d) + 0.35 * clamp(jerk)); g.translate(-gx, -gy);
      CH.garuda.draw(g, { x: gx, y: gy, scale: lerp(0.35, 0.75, d), facing: 'left', pose: { name: 'fly', phase: T * 5 }, expression: { look: -0.2 + 0.3 * clamp(jerk), mood: t > b2 ? 'wrath' : undefined }, light: EP21.moon(gx, gy, 1.15), t: T, key: 'c21-ga' });
      const sc = lerp(0.35, 0.75, d);
      EP21.coal(g, gx - 10 * sc, gy - 735 * sc, 44 * sc, T, clamp((t - b2 + 0.1) / 0.3));
      g.restore();
    } });
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.15,
    draw(ctx, t, env) { EP21.dive(ctx, env.T, t, env.beats[2] ?? 3); },
    post: () => ({ bloom: 0.42, vignette: 0.46, paper: 0.3 }),
  });
})();
