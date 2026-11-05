/* Ep 0 · line "hook" · COLD OPEN (Sauti) · "What does the Mahabharata actually say?" · Night at Naimisha, low and close across the fire: Sauti speaking, the sages listening, sparks rising; the question in big text from frame 1; the series title in the post. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP0 = window.EP0;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.8, speed: 0, hide: [1, 2], turn: () => 0.3,
        smoke: { alpha: 0.32, lean: 8 }, fireH: 250,
        cam: { zoom: 1.3 + 0.08 * E.inOutSine(p), dx: 40, dy: -120 },
        after: (g) => CH.sauti.draw(g, { x: 800, y: 1330, scale: 0.62, facing: 'left', pose: { name: 'speak', base: 'sit', k: 0.4 + 0.6 * E.inOutSine(clamp(t / 1.2)) }, expression: { look: -0.05, speak: EP0.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1000, F.x - 800), intensity: fl * 1.2, front: 0.55 }, t: T, key: 'h0-sauti' }),
      });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 220, size: 80, gold: line.hookGold, out });
      KIT.series.fireEdge(ctx, T, 1 - 0.75 * E.inOutSine(clamp(t / 1.4)), { h: 300 });
      const tk = clamp((t - sp - 0.25) / 0.8);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 520, key: 'ep0-title' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.48, paper: 0.3 }),
  });
})();
