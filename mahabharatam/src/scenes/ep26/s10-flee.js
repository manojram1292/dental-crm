/* Ep 26 · line "flee" · "The Sadhyas and Gandharvas east, the Vasus and Rudras south, the Adityas west, the Ashvins north." · Heaven from above as a compass: on each beat a group of small gods streams away to its quarter, the quarter lights and its label appears. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP26 = window.EP26;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'flee',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, S = env.strings;
      const bs = [0, 1, 2, 3].map((i) => (env.beats[i] ?? 1 + i) - 0.3);
      const k = bs.map((b) => E.inOutSine(clamp((t - b) / 1.1)));
      EP26.compass(ctx, T, { lit: k, after: (g) => {
        const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]], labels = [S.east, S.south, S.west, S.north];
        CH.garuda.draw(g, { x: 540, y: 1300, scale: 0.22, facing: 'left', pose: { name: 'spread', k: 1 }, light: { dir: -Math.PI / 2, intensity: 1.2, front: 0.6 }, t: T, key: 'fl26-ga' });
        dirs.forEach(([dx, dy], q) => {
          for (let j = 0; j < 3; j++) { const d = lerp(150, 380 + j * 30, k[q]); const x = 540 + dx * d * 0.9 + (dy ? (j - 1) * 50 : 0), y = 1150 + dy * d * 0.9 + (dx ? (j - 1) * 50 : 0); CH.deva.draw(g, { x, y: y + 60, scale: 0.12, facing: dx < 0 ? 'left' : 'right', index: q + j, pose: { name: 'walk', phase: T * 8 + j }, alpha: 0.4 + 0.6 * clamp(k[q] * 3), light: { dir: -Math.PI / 2, intensity: 1, front: 0.5 }, t: T, key: 'fl26-' + q + j }); }
          const lx = 540 + dx * 300, ly = 1000 + dy * 560 + (dy === 0 ? -520 - q * 0 : 0);
          g.save(); g.globalAlpha = k[q]; g.font = R.font(40, 'display', 600); g.textAlign = 'center'; g.fillStyle = '#f6e2a8'; g.shadowColor = 'rgba(0,0,0,0.9)'; g.shadowBlur = R.px(8);
          const pos = [[740, 520], [540, 1560], [340, 520], [540, 440]][q];
          g.font = R.font(36, 'display', 600); g.fillText(labels[q], 540, [1680, 1736, 1792, 1624][q]); g.restore(); void lx; void ly;
        });
      } });
    },
    post: () => ({ bloom: 0.38, vignette: 0.48, paper: 0.32 }),
  });
})();
