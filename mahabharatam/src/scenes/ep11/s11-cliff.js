/*
 * Ep 11 · line "cliff" · NEXT (cliffhanger image) · "To churn an ocean, they needed a mountain for a stick and a serpent for a rope."
 *
 * The dark ocean; on "mountain" (beats[1]) a vast forested mountain (Mandara) rises into
 * the frame from the horizon, rim-lit green-gold; on "rope" (beats[3]) the serpent king
 * Vasuki rears beside it, his violet-and-gold hood spreading, a ruby on his brow.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'cliff',
    fadeIn: 0.35,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 2.5, b3 = env.beats[3] ?? 5.1;
      const m = E.outCubic(clamp((t - b1 + 0.6) / 1.4)), s = E.outCubic(clamp((t - b3 + 0.7) / 1.0));
      EP11.sea(ctx, T, {
        cam: { zoom: 1.0 + 0.04 * p }, hz: 1180, jewels: 0.5,
        after: (g) => {
          CH.mandara.draw(g, { x: 430, y: lerp(2300, 1320, m), scale: 0.6, facing: 'front', pose: 'stand', light: { dir: -Math.PI / 2 + 0.5, intensity: 1.0, front: 0.35 }, t: T, alpha: clamp(m * 1.5), key: 'c11-m' });
          if (s > 0.01) CH.vasuki.draw(g, { x: 880, y: lerp(1950, 1600, s), scale: lerp(0.6, 0.85, s), facing: 'left', pose: { name: 'rise', k: s }, light: { dir: -Math.PI / 2 - 0.4, intensity: 1.05, front: 0.35 }, t: T, alpha: clamp(s * 1.6), key: 'c11-v' });
          EP11.surf(g, 1500, T, 1, { color: '#dfe6ff', deep: '#1e2a6a', deep2: '#060a24' });
          // the two hosts on the shore, small against the sea, watching
          KIT.vgrad(g, 1700, 2300, [[0, '#2a2640'], [1, '#08060e']], -400, 1480);
          for (let i = 0; i < 3; i++) {
            CH.deva.draw(g, { x: 70 + i * 110, y: 1900 + i * 20, scale: 0.5, facing: 'right', index: i * 2, pose: 'stand', expression: { look: -0.2 * m }, light: { dir: -Math.PI / 2 + 0.3, intensity: 0.9, front: 0.3 }, t: T + i, key: 'c11-d' + i });
            CH.asura.draw(g, { x: 1010 - i * 110, y: 1900 + i * 20, scale: 0.52, facing: 'left', index: i * 2 + 1, pose: 'stand', expression: { look: -0.2 * m }, light: { dir: -Math.PI / 2 - 0.3, intensity: 0.9, front: 0.3 }, t: T + i, key: 'c11-a' + i });
          }
        },
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }),
  });
})();
