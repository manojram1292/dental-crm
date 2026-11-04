/*
 * Ep 16 · line "rocks" · "The asuras tore up mountain peaks and hurled them."
 * Close: an asura, LARGE, heaves a mountain peak overhead (beats[1]) and throws it (beats[2]); more
 * peaks wheel across the red sky.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP16 = window.EP16;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'rocks',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 1.3, b2 = env.beats[2] ?? 2.6;
      const lift = E.outCubic(clamp((t - b1 + 0.8) / 0.8)), thr = E.inOutSine(clamp((t - b2 + 0.1) / 1.0));
      EP16.battle(ctx, T, {
        streaks: 0.5, cam: { zoom: 1.1, dy: -60 },
        after: (g) => {
          for (let i = 0; i < 3; i++) { const u = (T * 0.3 + i / 3) % 1; EP16.peak(g, lerp(1300, -300, u), 400 + i * 160 - Math.sin(Math.PI * u) * 160, 0.5, T * (i + 1), 0.9); }
          CH.asura.draw(g, { x: 640, y: 2020, scale: 1.25, facing: 'left', index: 3, pose: { name: 'carry', k: lift * (1 - thr) }, expression: { mood: 'wrath' }, light: EP16.fireLight(640, 2020, 1.2), t: T, key: 'k16-a' });
          EP16.peak(g, lerp(650, -200, thr), lerp(lerp(1500, 680, lift), 300, thr), 0.95, thr * 3, T, 1);
        },
      });
      void dur;
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }),
  });
})();
