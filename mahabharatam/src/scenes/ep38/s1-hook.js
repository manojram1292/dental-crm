/* Ep 38 · line "hook" · COLD OPEN (direct speech in medias res) · "My limbs are burning. Send your son!" · Vasuki's hood straining against the red glow of the cracked vault, sparks falling past him from frame 1, mantra bands closing; the card at the side. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, u = clamp(t / 3.4);
      EP38.redHall(ctx, T, { cam: { zoom: 1.5 + 0.1 * u, dy: -420, dx: 60 }, after: (g) => {
        CH.vasuki.draw(g, { x: 640 + 14 * Math.sin(T * 9), y: 1950, scale: 0.85, facing: 'left', pose: { name: 'rise', k: 0.8 + 0.15 * Math.sin(T * 5) }, expression: { mood: 'wrath', speak: EPA.mouth(env, t) }, light: EP38.redLit(640, 1500, 1.25), t: T, key: 'h38-va' });
        EP8.bindings(g, 560, 1400, 200, T, 0.6 + 0.4 * u);
      } });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 220, size: 80, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.15) / 0.7);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 440, key: 'ep38-title' });
    },
    post: () => ({ bloom: 0.46, vignette: 0.52, paper: 0.3 }),
  });
})();
