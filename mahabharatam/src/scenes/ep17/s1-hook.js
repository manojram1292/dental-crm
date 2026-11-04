/*
 * Ep 17 · line "hook" · COLD OPEN (Sauti) · "What if a bet about a horse's tail could cost you your freedom?"
 * Moving from frame 1: the horse LARGE at sunset, his white tail streaming in the wind; dark strands
 * creep into it one by one (pose.tail rising); the two sisters' silhouettes small beyond, face to face.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      EP17.sunset(ctx, T, {
        cam: { zoom: 1.0 + 0.08 * E.inOutSine(p) },
        after: (g) => {
          CH.kadru.draw(g, { x: 170, y: 1580, scale: 0.42, facing: 'right', pose: { name: 'point', k: 1 }, light: EP17.sunLight(170, 1580), t: T, key: 'h17-kd' });
          CH.vinata.draw(g, { x: 380, y: 1580, scale: 0.4, facing: 'left', pose: 'stand', light: EP17.sunLight(380, 1580), t: T, key: 'h17-vn' });
          CH.horse.draw(g, { x: 430, y: 1980, scale: 1.0, facing: 'left', pose: { name: 'stand', tail: 0.15 + 0.6 * E.inOutSine(p), wind: 1.2 }, light: EP17.sunLight(430, 1980, 1.05), t: T, key: 'h17-ho' });
        },
      });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 200, size: 76, gold: line.hookGold, out });
      KIT.series.fireEdge(ctx, T, 1 - 0.75 * E.inOutSine(clamp(t / 1.4)), { h: 300 });
      const tk = clamp((t - sp - 0.3) / 0.8);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 540, key: 'ep17-title' });
    },
    post: () => ({ bloom: 0.4, vignette: 0.42, paper: 0.32 }),
  });
})();
