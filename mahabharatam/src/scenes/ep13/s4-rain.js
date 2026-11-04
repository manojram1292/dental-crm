/*
 * Ep 13 · line "rain" · "Indra put out the fire with rain."
 * A cut UP into Indra's storm (EP13.storm): Indra on a cloud, LARGE, raising the vajra (beats[0]);
 * lightning; on "rain" (beats[1]) silver rain sweeps down over the burning summit below and
 * its flames die into smoke.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'rain',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T;
      const b0 = env.beats[0] ?? 0.2, b1 = env.beats[1] ?? 2.2;
      const raise = E.outCubic(clamp((t - b0 + 0.2) / 0.6)), flash = Math.exp(-Math.max(0, t - b0 - 0.4) * 5) * (t > b0 + 0.4 ? 1 : 0);
      const rain = E.inOutSine(clamp((t - b1 + 0.7) / 0.6)), burn = 1 - E.inOutSine(clamp((t - b1) / 1.0));
      EP13.storm(ctx, T, {
        flash, rain,
        after: (g) => {
          CH.mandara.draw(g, { x: 560, y: 2700, scale: 0.85, facing: 'front', pose: { name: 'churn', k: 1, spin: T * 1.2, burn }, light: { dir: -Math.PI / 2 + 0.3, intensity: 0.9, front: 0.3 }, t: T, key: 'r13-m' });
          if (burn < 0.95) { g.save(); g.globalAlpha = (1 - burn) * 0.6; for (let i = 0; i < 8; i++) KIT.glow(g, 400 + i * 50, 1500 - ((T * 60 + i * 40) % 300), 120, '#8a8a9a', 0.5, 'source-over'); g.restore(); }
          CH.indra.draw(g, { x: 640, y: 1050, scale: 0.82, facing: 'left', pose: { name: 'raise', k: raise }, light: { dir: -Math.PI / 2 - 0.3, intensity: 1.15, front: 0.45 }, t: T, key: 'r13-in' });
          window.EP5.cloud(g, 640, 1060, 640, 3, '#4a5470', '#c8d4f0', 1);
        },
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.48, paper: 0.3 }),
  });
})();
