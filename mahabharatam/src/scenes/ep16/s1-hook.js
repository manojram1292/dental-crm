/*
 * Ep 16 · line "hook" · COLD OPEN (Sauti) · "Gods against asuras: who would keep the drink that ends death?"
 * Moving from frame 1: the battle on the shore at night; a deva and an asura LARGE in the foreground
 * clash, weapons crossing; a blazing discus streaks overhead. Big text from frame 1; fire edge; title.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP16 = window.EP16;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const swing = 0.5 + 0.5 * Math.sin(T * 3.2);
      EP16.battle(ctx, T, {
        streaks: 1, cam: { zoom: 1.05 + 0.08 * p },
        after: (g) => {
          EP16.peak(g, lerp(1200, -200, (T * 0.25) % 1), 700 - Math.sin(Math.PI * ((T * 0.25) % 1)) * 200, 0.6, T, 1);
          CH.vishnu.discus(g, lerp(-100, 1200, p), 520 + 80 * Math.sin(p * 3), 60, T, 1, T * 12);
          CH.deva.draw(g, { x: 330, y: 1990, scale: 1.12, facing: 'right', index: 2, pose: { name: 'strike', k: swing }, light: EP16.fireLight(330, 1990), t: T, key: 'h16-d' });
          CH.asura.draw(g, { x: 790, y: 1990, scale: 1.15, facing: 'left', index: 0, pose: { name: 'strike', k: 1 - swing }, expression: { mood: 'wrath' }, light: EP16.fireLight(790, 1990), t: T, key: 'h16-a' });
        },
      });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 200, size: 76, gold: line.hookGold, out });
      KIT.series.fireEdge(ctx, T, 1 - 0.75 * E.inOutSine(clamp(t / 1.4)), { h: 300 });
      const tk = clamp((t - sp - 0.3) / 0.8);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 540, key: 'ep16-title' });
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }),
  });
})();
