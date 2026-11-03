/*
 * Ep 8 · line "pull" · "Bound by the mantras, not one could escape."
 *
 * Close on the fire: a great black-hooded serpent rears above the flames and strains to
 * rise; on "mantras" (beats[0]) gold bands of the chant close round it; on "one"
 * (beats[1]) it thrashes; on "escape" (beats[2]) it is drawn down into the fire, a burst
 * of gold sparks. Mural, no gore.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP8 = window.EP8;
  const { clamp, E, lerp } = R;

  R.scene({
    id: 'pull',
    fadeIn: 0.4,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.8, b1 = env.beats[1] ?? 2.1, b2 = env.beats[2] ?? 2.8;
      const bind = E.outCubic(clamp((t - (b0 - 0.3)) / 0.8));
      const thrash = clamp((t - (b1 - 0.4)) / 0.4) * (1 - clamp((t - b2) / 0.3));
      const down = E.inCubic(clamp((t - (b2 - 0.1)) / 0.7));
      const burst = clamp((t - (b2 + 0.4)) / 0.2) * (1 - clamp((t - b2 - 0.6) / 0.9));
      EP8.satra(ctx, T, {
        fire: 1.3, cam: { zoom: 1.8 + 0.08 * p, dy: 420 },
        after: (g) => {
          const x = 540 + Math.sin(T * 9) * 30 * thrash, y = lerp(700, 1200, down);
          if (down < 0.98) {
            g.save(); g.beginPath(); g.rect(-400, -800, 1900, 2000); g.clip();
            EP8.serpent(g, x, y, 520, Math.PI / 2 + Math.sin(T * 6) * 0.3 * thrash, T, 3, { kind: 3, w: 44, speed: 3 + 6 * thrash });
            g.restore();
            EP8.bindings(g, x, y + 160, 120, T, bind * (1 - down));
          }
          if (burst > 0) { KIT.glow(g, 540, 1150, 500, '#ffd070', 0.8 * burst); KIT.embers(g, T, { x: 540, y: 1150, spread: 200, rate: 60, life: 1.2, rise: 500, sway: 60, size: 3, alpha: burst, seed: 811 }); }
        },
      });
    },
    post: () => ({ bloom: 0.55, vignette: 0.55, paper: 0.3 }),
  });
})();
