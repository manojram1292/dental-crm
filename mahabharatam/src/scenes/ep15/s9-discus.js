/*
 * Ep 15 · line "discus" · "Narayana's discus flew, and took his head, with the amrita still in his throat."
 * Stylised, never gore. Narayana at the right raises the discus (beats[0]); it flies in a white-gold
 * arc (beats[1]); on "head" (beats[2]) a flash of white fire, and the body, already smoke, falls away
 * while the head, wreathed in its corona, lifts free.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP15 = window.EP15;
  const { clamp, E, lerp, hash } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'discus',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 0.4, b2 = env.beats[2] ?? 2.8;
      const raise = E.outCubic(clamp((t - b0 + 0.3) / 0.5)), fly = E.inOutSine(clamp((t - b0 - 0.3) / (b2 - b0 - 0.3)));
      const cut = t > b2, after = clamp((t - b2) / 1.2), flash = cut ? Math.exp(-(t - b2) * 4) : 0;
      const hx = 300, hy = 1150;
      EP15.dusk(ctx, T, {
        cam: { zoom: 1.0 },
        after: (g) => {
          CH.vishnu.draw(g, { x: 820, y: 1980, scale: 0.95, facing: 'front', pose: { name: 'discus', k: raise * (1 - fly * 0.6) }, light: EP15.duskLight(820, 1980, 1.05), t: T, key: 'd15-vi' });
          if (!cut) CH.rahu.draw(g, { x: 300, y: 1960, scale: 0.9, facing: 'right', pose: { name: 'disguise', k: 1 }, light: EP15.duskLight(300, 1960), t: T, key: 'd15-ra' });
          else {
            // the body is smoke, falling away
            g.save(); for (let i = 0; i < 14; i++) { const y = lerp(1300, 1950, hash(i, 31)) + after * 120; KIT.glow(g, 300 + (hash(i, 32) - 0.5) * 220, y, 140, '#2a1a2a', 0.6 * (1 - after), 'source-over'); } g.restore();
            CH.rahu.draw(g, { x: hx + 40 * after, y: hy + 300 - 320 * after, scale: 0.5 + 0.2 * after, facing: 'right', pose: { name: 'head', roar: after }, light: { dir: -0.5, intensity: 1.2, front: 0.7 }, t: T, key: 'd15-head' });
          }
        },
      });
      if (fly > 0.01 && !cut) { const x = lerp(700, hx + 40, fly), y = lerp(780, hy + 40, fly) - Math.sin(Math.PI * fly) * 260; CH.vishnu.discus(ctx, x, y, 70, T, 1, T * 14); }
      if (flash > 0.01) { ctx.save(); ctx.globalAlpha = flash; KIT.glow(ctx, hx + 20, hy + 60, 700, '#ffffff', 1); ctx.restore(); }
      void dur;
    },
    post: () => ({ bloom: 0.5, vignette: 0.45, paper: 0.3 }),
  });
})();
