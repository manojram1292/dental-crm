/*
 * Ep 15 · line "hook" · COLD OPEN (Sauti) · "Why does a head without a body chase the Sun and the Moon?"
 * Moving from frame 1: in the deep sky, the great roaring head of Rahu in its dark corona sweeps
 * from the lower left toward the Sun's disc at the upper right; the Moon pale at the left. The
 * question in big text from frame 1; the fire edge; the title after the text.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP15 = window.EP15;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const m = E.inOutSine(clamp(0.15 + t / (dur * 0.9)));
      EP15.heavens(ctx, T, {
        sun: [850, 1050, 150], moon: [180, 720, 80], bite: 0.12 * m,
        after: (g) => CH.rahu.draw(g, { x: lerp(330, 560, m), y: lerp(1800, 1500, m), scale: lerp(0.95, 1.05, m), facing: 'right', pose: { name: 'head', roar: 0.6 + 0.4 * Math.abs(Math.sin(T * 2.2)) }, light: { dir: -0.6, intensity: 1.1, front: 0.4 }, t: T, key: 'h15-ra' }),
      });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 200, size: 78, gold: line.hookGold, out });
      KIT.series.fireEdge(ctx, T, 1 - 0.75 * E.inOutSine(clamp(t / 1.4)), { h: 300 });
      const tk = clamp((t - sp - 0.3) / 0.8);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 520, key: 'ep15-title' });
      void p;
    },
    post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.3 }),
  });
})();
