/*
 * Ep 12 · line "hook" · COLD OPEN (Sauti) · "Who could tear a mountain from the earth?"
 *
 * Moving from frame 1: Mandara heaving up out of the torn ground in daylight (EP12.earth,
 * lift already under way), roots streaming, rock falling, Ananta's seven white hoods rising
 * behind it; the camera pushes in and tilts up with it. The question in big text from frame
 * 1; the fire edge at the bottom (the loop). On "tear" (beats[0]) the ground splits wider.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP12 = window.EP12;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 1.2;
      const lift = 0.25 + 0.35 * E.inOutSine(clamp(t / (b0 + 1.6)));
      EP12.earth(ctx, T, {
        lift, ms: 0.5, gy: 1420, cam: { zoom: 1.05 + 0.08 * E.inOutSine(clamp(t / dur)), dy: lerp(120, 40, clamp(t / dur)) },
        after: (g, my) => { CH.ananta.draw(g, { x: 840, y: my + 300, scale: 0.85, facing: 'left', pose: { name: 'rise', k: 1 }, light: EP12.dayLight(800, my), t: T, key: 'h12-an' }); },
      });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3);
      const line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 200, size: 86, gold: line.hookGold, out });
      KIT.series.fireEdge(ctx, T, 1 - 0.75 * E.inOutSine(clamp(t / 1.4)), { h: 300 });
      const tk = clamp((t - sp - 0.05) / 0.9);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 360, key: 'ep12-title' });
    },
    post: () => ({ bloom: 0.3, vignette: 0.42, paper: 0.32 }),
  });
})();
