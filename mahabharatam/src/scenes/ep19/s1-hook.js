/*
 * Ep 19 · line "hook" · COLD OPEN (Sauti) · "Who was born so bright that the gods thought the world was burning?"
 * Moving from frame 1: Garuda rising out of a burst of fire, wings opening, blazing gold against a red
 * sky; the question in big text from frame 1; the fire edge; the title after the text.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP10 = window.EP10;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const o = 0.5 + 0.5 * E.outCubic(clamp(t / (dur * 0.7)));
      EP10.sky(ctx, T, { red: 1, cam: { zoom: 1.0 + 0.06 * p }, after: (g) => {
        KIT.glow(g, 540, 1300, 1400, '#ff8a20', 0.7);
        CH.garuda.draw(g, { x: 560, y: lerp(2150, 1900, o), scale: 0.78, facing: 'left', pose: { name: 'spread', k: o, blaze: 1 }, light: { dir: -Math.PI / 2, intensity: 1.15, front: 0.55 }, t: T, key: 'h19-ga' });
      } });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 190, size: 76, gold: line.hookGold, out });
      KIT.series.fireEdge(ctx, T, 1 - 0.75 * E.inOutSine(clamp(t / 1.4)), { h: 300 });
      const tk = clamp((t - sp - 0.3) / 0.8);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 540, key: 'ep19-title' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.45, paper: 0.3 }),
  });
})();
