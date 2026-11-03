/*
 * Ep 10 · line "dawn" · "He is the red of every dawn."
 *
 * Wide: the whole sky floods red, rose and gold from the horizon up (beats[1], "dawn"); the
 * chariot small and high; on the dark earth below, Vinata looks up, the gold jar beside her.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP9 = window.EP9, EP10 = window.EP10;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'dawn',
    fadeIn: 0.5,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 1.9;
      const red = E.inOutSine(clamp((t - 0.1) / (b1 + 0.4)));
      EP10.sky(ctx, T, {
        red: 0.6 + 0.4 * red, cam: { zoom: 1.0 - 0.04 * p },
        after: (g) => {
          EP10.chariot(g, 640, 640, 0.32, T, { a: 1 });
          CH.aruna.draw(g, { x: 520, y: 720, scale: 0.3, facing: 'left', pose: { name: 'rein', k: 1 }, light: { dir: 0, intensity: 1.2, front: 0.4 }, t: T, key: 'd10-ar' });
          KIT.glow(g, 540, 1500, 1200, '#ff6a3a', 0.4 * red);
          EP9.jar(g, 700, 1720, 0.6, T, { kind: 'gold', glow: 0.7 });
          CH.vinata.draw(g, { x: 840, y: 1760, scale: 0.7, facing: 'left', pose: { name: 'stand', slave: true }, expression: { look: -0.35 }, light: { dir: -Math.PI / 2 - 0.4, intensity: 1, front: 0.3 }, t: T, key: 'd10-vn' });
        },
      });
    },
    post: () => ({ bloom: 0.55, vignette: 0.42, paper: 0.3 }),
  });
})();
