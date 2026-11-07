/* Ep 35 · line "hook" · COLD OPEN (a statement card) · "Wake the sage, and lose him forever." · The sunset shaft crawls across the chamber onto the sleeping sage from frame 1; the camera pushes in; the card high in the dark wall. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, u = clamp(t / 3.5);
      EP34.chamber(ctx, T, { sun: 0.5 + 0.4 * u, cam: { zoom: 1.6 + 0.15 * u, dx: 120, dy: -820 }, after: (g) => EP34.sleep(g, T, { look: 0.1 }) });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 240, size: 82, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.15) / 0.7);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 460, key: 'ep35-title' });
    },
    post: () => ({ bloom: 0.44, vignette: 0.52, paper: 0.3 }),
  });
})();
