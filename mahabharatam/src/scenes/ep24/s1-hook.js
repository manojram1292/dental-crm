/* Ep 24 · line "hook" · COLD OPEN (style A) · "How could he land without killing them?" · Garuda in flight over the midday cloud-sea, the branch in his beak with the tiny sages hanging from it, the elephant and tortoise in his talons; the land slides by from frame 1. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP24 = window.EP24;
  const { clamp, lerp } = R;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP24.glare(ctx, T, { slide: 300 + t * 260 });
      EP24.loaded(ctx, lerp(640, 600, p), 1640 + 20 * Math.sin(T * 2), 0.8, T, { key: 'h24' });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      ctx.save(); ctx.fillStyle = 'rgba(10,20,40,0.35)'; ctx.fillRect(0, 120, R.W, 480 * (1 - out)); ctx.restore();
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 200, size: 82, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.25) / 0.8);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 520, key: 'ep24-title' });
    },
    post: () => ({ bloom: 0.36, vignette: 0.38, paper: 0.3 }),
  });
})();
