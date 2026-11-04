/*
 * Ep 14 · line "hook" · COLD OPEN (Sauti) · "Who would drink a poison that could burn the worlds?"
 * AS TRADITION TELLS IT (tag at the top from frame 1). Moving from frame 1: Shiva, ash-pale,
 * frontal, gathers the black-blue smoke to his lips over a darkened sea; his throat starts to
 * glow blue. The question in big text from frame 1; the fire edge; the title after the text.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13, EP14 = window.EP14;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const dk = E.inOutSine(clamp(t / dur));
      EP13.whiteSea(ctx, T, {
        hz: 1300, dark: 0.85, cam: { zoom: 1.05 + 0.1 * dk, dy: lerp(40, -40, dk) },
        after: (g) => {
          EP13.poison(g, 540, 1500, T, 0.7 - 0.3 * dk);
          CH.shiva.draw(g, { x: 540, y: 1960, scale: 1.08, facing: 'front', pose: { name: 'drink', k: 0.7 + 0.3 * dk, throat: 0.2 + 0.6 * dk }, light: { dir: -Math.PI / 2, intensity: 1.0, front: 0.5 }, t: T, key: 'h14-sh' });
        },
      });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 250, size: 80, gold: line.hookGold, out });
      EP14.tag(ctx, T, 1, env.strings);
      KIT.series.fireEdge(ctx, T, 1 - 0.75 * E.inOutSine(clamp(t / 1.4)), { h: 300 });
      const tk = clamp((t - sp - 0.3) / 0.8);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 560, key: 'ep14-title' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }),
  });
})();
