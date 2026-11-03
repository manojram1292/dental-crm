/*
 * Ep 7 · line "cliff" · NEXT · "His son would answer with fire."
 *
 * Dawn after: the king's crown fallen in grey ash, wisps of green smoke. On "son"
 * (beats[0]) young Janamejaya's crowned figure rises out of the ash-light, large, lit from
 * below; on "fire" (beats[1]) the sacrificial fire flares up in front of him.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP6 = window.EP6, EP7 = window.EP7;
  const { clamp, E } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'cliff',
    fadeIn: 0.6,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.3, b1 = env.beats[1] ?? 1.8;
      const son = E.outCubic(clamp((t - (b0 - 0.2)) / 1.0));
      const fire = E.outCubic(clamp((t - (b1 - 0.4)) / 0.8));
      KIT.vgrad(ctx, 0, R.H, [[0, '#0e0a10'], [0.55, '#2a1a1c'], [0.75, '#3a2220'], [1, '#100806']]);
      KIT.glow(ctx, 540, 1500, 700 + 400 * fire, '#ff6a1a', 0.2 + 0.5 * fire);
      // ash ground
      KIT.vgrad(ctx, 1300, R.H, [[0, '#4a3a34'], [0.3, '#2a1e1a'], [1, '#0a0606']]);
      KIT.glow(ctx, 260, 1290, 260, '#e7b54a', 0.25 * (1 - 0.5 * son));
      EP6.fallenCrown(ctx, 250, 1310, 0.95, 1 - 0.4 * son);
      if (son > 0.01) {
        EP7.ghost(ctx, son, (q) => CH.janamejaya.draw(q, { x: 680, y: 1640, scale: 1.05, facing: 'left', pose: 'stand', expression: { mood: 'wrath', look: -0.05 }, light: { dir: Math.PI / 2 + 0.2, intensity: 0.7 + 0.6 * fire, front: 0.25 + 0.2 * fire }, t: T, key: 'x7-jj' }), 'x7-g');
      }
      if (fire > 0.01) KIT.fire.draw(ctx, 420, 1700, 520 * fire, T, { intensity: 1.1, width: 360 * fire, seed: 71, glow: 1 });
      void p;
    },
    post: () => ({ bloom: 0.5, vignette: 0.55, paper: 0.3 }),
  });
})();
