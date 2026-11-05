/* Ep 22 · line "hook" · COLD OPEN (style B: direct speech in medias res) · Garuda: "Brahmin, come out of my mouth!" · Garuda's head huge in the dusty bay, a coal-red glow in his throat that pulses from frame 1, the camera pushing in; the line on the card; the title after. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP21 = window.EP21, EP22 = window.EP22;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const z = lerp(1.0, 1.12, E.outCubic(clamp(t / 1.5))) + 0.04 * p;
      EP22.dusty(ctx, T, { dust: 0.7, rush: 0.4, cam: { zoom: z, dy: 40 } });
      const rear = 0.12 * Math.sin(Math.min(t, 1.2) * 4) * Math.exp(-t);
      ctx.save(); ctx.translate(560, 1500); ctx.rotate(rear); ctx.translate(-560, -1500);
      CH.garuda.draw(ctx, { x: 640, y: 2900, scale: 1.75 * z, facing: 'left', pose: { name: 'stand' }, expression: { mood: 'wrath', look: -0.12 }, light: EP21.moon(640, 2900, 1.15), t: T, key: 'h22-ga' });
      EP21.coal(ctx, 625, 1545, 40, T, 0.75 + 0.25 * Math.sin(T * 6));
      ctx.restore();
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 200, size: 82, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.25) / 0.8);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 520, key: 'ep22-title' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.46, paper: 0.3 }),
  });
})();
