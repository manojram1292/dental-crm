/* Ep 21 · line "hook" · COLD OPEN (style A) · "What price could free a slave?" · Ramaniyaka in late gold: Garuda's wings snap open from t = 0, the serpents rear round him, the white pot of amrita glows high above; big text from frame 1; the title after. (No fire edge in the Garuda arc from here.) */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP20 = window.EP20, EP21 = window.EP21, EP15 = window.EP15;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const open = E.outBack ? E.outBack(clamp(t / 0.9)) : E.outCubic(clamp(t / 0.9));
      EP20.island(ctx, T, { cam: { zoom: lerp(1.95, 1.75, E.outCubic(clamp(t / 2))) + 0.05 * p, dy: -120 }, after: (g) => {
        CH.garuda.draw(g, { x: 560, y: 1380, scale: 0.42, facing: 'left', pose: { name: 'spread', k: lerp(0.25, 1, clamp(open)) }, expression: { look: -0.15 }, light: EP21.amber(560, 1380, 1.15), t: T, key: 'h21-ga' });
        for (let i = 0; i < 6; i++) { const x = [300, 370, 430, 700, 770, 840][i], sc = [0.24, 0.19, 0.16, 0.16, 0.2, 0.25][i]; CH.naga.draw(g, { x, y: 1395 + (i % 3) * 8, scale: sc, facing: x < 560 ? 'right' : 'left', index: i, pose: { name: 'rise', k: 0.7 + 0.3 * Math.sin(T * 2.2 + i) }, light: EP21.amber(x, 1395, 1.05), t: T + i, key: 'h21-n' + i }); }
      } });
      EP21.lateGold(ctx, 0.75);
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 200, size: 84, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.25) / 0.8);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 520, key: 'ep21-title' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.42, paper: 0.3 }),
  });
})();
