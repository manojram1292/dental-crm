/*
 * Ep 10 · line "free" · Aruna: "Do not break my brother's egg. Wait, and he will set you free."
 *
 * Gentler now: Aruna points to the gold egg glowing in its jar (point) on "brother's"
 * (beats[0]); on "Wait" (beats[1]) Vinata lifts her head; on "free" (beats[2]) the gold light
 * in the jar pulses like a heartbeat and lights her face.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP9 = window.EP9, EP10 = window.EP10;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'free',
    fadeIn: 0.4,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1.3, b1 = env.beats[1] ?? 2.9, b2 = env.beats[2] ?? 5.3;
      const pt = E.inOutCubic(clamp((t - (b0 - 0.6)) / 0.7));
      const lift = E.inOutSine(clamp((t - (b1 - 0.2)) / 1.0));
      const beat = clamp((t - (b2 - 0.2)) / 0.4) * (0.6 + 0.4 * Math.sin((t - b2) * 7));
      EP9.hermitage(ctx, T, {
        glow: 0.35, cam: { zoom: 1.12 + 0.04 * p, dy: -10 },
        after: (g) => {
          KIT.glow(g, 380, 1000, 600, '#ff4a2a', 0.25);
          CH.aruna.draw(g, { x: 340, y: 1500, scale: 0.9, facing: 'right', pose: { name: 'point', k: pt }, expression: { speak: EP10.mouth(env, t) }, light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.4 }, t: T, key: 'f10-ar' });
          EP9.jar(g, 640, 1700, 0.9, T, { kind: 'gold', glow: 0.6 + 0.8 * beat });
          if (beat > 0) KIT.glow(g, 640, 1580, 500, '#ffd060', 0.4 * beat);
          CH.vinata.draw(g, { x: 900, y: 1720, scale: 0.92, facing: 'left', pose: { name: 'bow', k: 1 - lift, slave: true }, expression: { look: -0.15 * lift }, light: EP10.arunaLight(900, 1720, 640, 1200, 0.9 + 0.3 * beat), t: T, key: 'f10-vn' });
        },
      });
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.32 }),
  });
})();
