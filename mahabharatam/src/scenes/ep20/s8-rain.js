/* Ep 20 · line "rain" · "Indra covered the sky with clouds, and poured down rain." · Indra on his storm cloud, vajra raised; clouds roll over (beats[1]); rain sweeps down (beats[2]); the serpents revive below. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13, EP20 = window.EP20;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'rain',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T;
      const b1 = env.beats[1] ?? 1.8, b2 = env.beats[2] ?? 3.2;
      const raise = E.outCubic(clamp(t / 0.6)), flash = Math.exp(-Math.max(0, t - b1) * 4) * (t > b1 ? 1 : 0), rain = E.inOutSine(clamp((t - b2 + 0.8) / 0.6));
      EP13.storm(ctx, T, { flash, rain, after: (g) => {
        CH.indra.draw(g, { x: 640, y: 1000, scale: 0.7, facing: 'left', pose: { name: 'raise', k: raise }, light: { dir: -Math.PI / 2 - 0.3, intensity: 1.15, front: 0.45 }, t: T, key: 'r20-in' });
        window.EP5.cloud(g, 640, 1010, 560, 3, '#4a5470', '#c8d4f0', 1);
        EP20.carrier(g, 420, 1950, 0.5, T, { key: 'r20', faint: 1 - rain, light: { dir: -Math.PI / 2, intensity: 0.9, front: 0.4 } });
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.48, paper: 0.3 }),
  });
})();
