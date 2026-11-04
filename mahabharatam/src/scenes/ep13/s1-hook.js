/*
 * Ep 13 · line "hook" · COLD OPEN (Sauti) · "What rose out of the churning sea?"
 * Moving from frame 1: a whirlpool turning in the white sea, the churning mountain small
 * behind it, and out of the whirl a silver disc already rising, the Moon (frontal, arms
 * opening). The question in big text from frame 1; the fire edge; the title after the text.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP12 = window.EP12, EP13 = window.EP13;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const rise = 0.3 + 0.7 * E.outCubic(clamp(t / (dur * 0.8)));
      EP13.whiteSea(ctx, T, {
        cam: { zoom: 1.04 + 0.08 * E.inOutSine(clamp(t / dur)) }, hz: 1060, whirl: 1, wx: 560, wy: 1480,
        after: (g) => {
          EP12.churn(g, T, { cx: 860, y: 1180, s: 0.26, spin: T * 0.9, wrap: 1, hosts: 0, light: EP13.seaGlow(860, 1100) });
          CH.chandra.draw(g, { x: 560, y: lerp(2150, 1720, rise), scale: 0.95, facing: 'front', pose: { name: 'rise', k: rise }, light: EP13.seaGlow(560, 1600, 1.1), t: T, key: 'h13-ch' });
          window.EP11.surf(g, 1560, T, 1, { color: '#ffffff', deep: '#ecebf8', deep2: '#b8b8d8' });
        },
      });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 200, size: 86, gold: line.hookGold, out });
      KIT.series.fireEdge(ctx, T, 1 - 0.75 * E.inOutSine(clamp(t / 1.4)), { h: 300 });
      const tk = clamp((t - sp - 0.3) / 0.8);   // after the hook text; held ≥ 1 s (ep 12 review)
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 520, key: 'ep13-title' });
    },
    post: () => ({ bloom: 0.36, vignette: 0.4, paper: 0.3 }),
  });
})();
