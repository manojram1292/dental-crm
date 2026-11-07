/* Ep 35 · line "lap" · "He slept with his head in her lap." · The chamber, close and level: the sleeper and the watcher; the red shaft creeping nearer across the floor. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'lap',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP34.chamber(ctx, T, { sun: 0.35 + 0.15 * p, cam: { zoom: 1.5, dx: 0, dy: -760 }, after: (g) => EP34.sleep(g, T, { look: 0.3 }) });
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }),
  });
})();
