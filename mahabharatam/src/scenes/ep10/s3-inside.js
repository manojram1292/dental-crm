/*
 * Ep 10 · line "inside" · "Inside was a son: his upper body formed, his lower body not."
 *
 * Close, in his own red light: from the broken shell a young man of red light rises,
 * large (emerge) on "son" (beats[0]); his chest and arms are formed (beats[1]); below the
 * waist only wisps of light and mist (beats[2], "not"). Vinata, small in the foreground,
 * looks up at him.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP9 = window.EP9, EP10 = window.EP10;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'inside',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1.2;
      const up = E.outCubic(clamp((t - (b0 - 0.8)) / 1.8));
      EP9.hermitage(ctx, T, {
        glow: 0.25, cam: { zoom: 1.2 + 0.05 * p, dy: 0 },
        after: (g) => {
          KIT.glow(g, 560, 1100, 900, '#ff4a2a', 0.35 * up);
          CH.aruna.draw(g, { x: 580, y: lerp(1900, 1560, up), scale: 0.95, facing: 'left', pose: { name: 'emerge', k: up }, light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.4 }, t: T, alpha: clamp(up * 2), key: 'i10-ar' });
          EP9.egg(g, 560, 1700, 90, 'rose', T, { glow: 0.6, crack: 1, alpha: 1 - 0.6 * up });
          CH.vinata.draw(g, { x: 930, y: 1760, scale: 0.8, facing: 'left', pose: { name: 'grieve', k: 0.3 }, expression: { look: -0.3 }, light: EP10.arunaLight(930, 1760, 580, 1000, 1), t: T, key: 'i10-vn' });
        },
      });
    },
    post: () => ({ bloom: 0.5, vignette: 0.5, paper: 0.32 }),
  });
})();
