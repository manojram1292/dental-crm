/* Ep 30 · line "hook" · COLD OPEN (style A) · "How did the serpents get forked tongues?" · Ground level in the dawn mist: a serpent's head rises over a bed of kusha grass from frame 1, its tongue flicking out, forked. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP30 = window.EP30;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T;
      const rise = E.outCubic(clamp(t / 1.2));
      EP30.dawnIsle(ctx, T, { cam: { zoom: 2.2, dy: -700 } });
      CH.naga.draw(ctx, { x: 620, y: 2300, scale: lerp(1.1, 1.5, rise), facing: 'left', index: 0, pose: { name: 'rise', k: rise }, light: EP30.dawn(620, 2300), t: T, key: 'h30-n' });
      EP30.kusha(ctx, 540, 2000, 2.2, T, {});
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 200, size: 84, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.25) / 0.8);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 520, key: 'ep30-title' });
    },
    post: () => ({ bloom: 0.38, vignette: 0.42, paper: 0.3 }),
  });
})();
