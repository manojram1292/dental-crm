/* Ep 27 · line "wheel" · THE TURN (≈ 45 %) · "Before the amrita spun a wheel of iron, its rim all blades." · After a 0.85 s rest, the reveal in the cold steel-blue vault: the wheel LARGE and frontal, spinning before the glowing pot; the small gold Garuda at its foot for scale. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP26 = window.EP26, EP27 = window.EP27;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'wheel',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const b0 = env.beats[0] ?? 0.8;
      const w = E.outCubic(clamp((t - b0 + 0.6) / 0.8));
      EP27.vault(ctx, T, { cam: { zoom: lerp(0.9, 1.0, p) }, after: (g) => {
        EP26.wheel(g, 540, 1000, 440, T, { a: w, spin: T * 5 });
        CH.garuda.draw(g, { x: 540, y: 1720, scale: 0.12, facing: 'left', pose: { name: 'stand', blaze: 0.5 }, light: EP27.steel(540, 1720, 1.3), t: T, key: 'w27-ga' });
        KIT.glow(g, 540, 1650, 120, '#ffd060', 0.5);
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.48, paper: 0.3 }),
  });
})();
