/* Ep 27 · line "hook" · COLD OPEN (style A) · "How do you pass a wheel of blades?" · The iron wheel spinning LARGE, blades flashing past the camera from frame 1; through the gap between spokes, the white glow of the amrita. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP26 = window.EP26, EP27 = window.EP27;
  const { clamp, E, lerp } = R;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP27.vault(ctx, T, { cam: { zoom: 1.0 } });
      EP26.wheel(ctx, 540, 1200, lerp(820, 700, E.outCubic(clamp(t / 1.5))), T, { spin: T * 6 });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 200, size: 84, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.25) / 0.8);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 520, key: 'ep27-title' });
      void p;
    },
    post: () => ({ bloom: 0.44, vignette: 0.48, paper: 0.3 }),
  });
})();
