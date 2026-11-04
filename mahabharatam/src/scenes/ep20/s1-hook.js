/* Ep 20 · line "hook" · COLD OPEN (Sauti) · "Why would a mighty bird carry the serpents who enslaved his mother?" · Garuda LARGE in flight over the sea, serpents on his back; big text from frame 1; the fire edge; the title after. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17, EP20 = window.EP20;
  const { clamp, E } = R;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      EP17.ocean(ctx, T, { hz: 1300, cam: { zoom: 1.0 + 0.06 * p }, after: (g) => EP20.carrier(g, 600, 2050 + 30 * Math.sin(T * 2), 0.95, T, { key: 'h20' }) });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 190, size: 74, gold: line.hookGold, out });
      KIT.series.fireEdge(ctx, T, 1 - 0.75 * E.inOutSine(clamp(t / 1.4)), { h: 300 });
      const tk = clamp((t - sp - 0.3) / 0.8);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 560, key: 'ep20-title' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.42, paper: 0.3 }),
  });
})();
