/* Ep 26 · line "indra" · "Indra himself stood among them, the thunderbolt in his hand." · Indra LARGE in the ring of gods, the vajra raised, lightning playing on it against the storm. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP26 = window.EP26;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'indra',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const b1 = env.beats[1] ?? 2;
      EP26.court(ctx, T, { storm: 1, cam: { zoom: 1.0, dy: 0 } });
      for (let i = 0; i < 2; i++) CH.deva.draw(ctx, { x: [140, 940][i], y: 1900, scale: 0.6, facing: i ? 'left' : 'right', index: i + 3, pose: { name: 'raise', k: 1 }, light: EP26.storm([140, 940][i], 1900, 0.9), t: T, key: 'i26-d' + i });
      CH.indra.draw(ctx, { x: 540, y: 2150 - 30 * p, scale: 1.25, facing: 'left', pose: { name: 'raise', k: E.outCubic(clamp(t / 0.7)) }, light: EP26.storm(540, 2150, 1.15), t: T, key: 'i26-in' });
      const fl = Math.exp(-Math.max(0, t - b1) * 5) * (t > b1 ? 1 : 0);
      if (fl > 0.01) { ctx.save(); ctx.globalAlpha = 0.35 * fl; ctx.fillStyle = '#e8f0ff'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore(); }
    },
    post: () => ({ bloom: 0.42, vignette: 0.46, paper: 0.3 }),
  });
})();
