/* Ep 28 · line "hook" · COLD OPEN (style B) · Garuda: "Let me stand above you." · A gold dawn sky: the camera rises past Vishnu's crown to Garuda's eye from frame 1; the line on the card. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP28 = window.EP28;
  const { clamp, E, lerp } = R;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T;
      const rise = E.outCubic(clamp(t / 2.2));
      EP28.dawnSky(ctx, T, { cam: { zoom: 1.5, dy: lerp(-900, -300, rise) }, after: (g) => EP28.pair(g, T, 760, 1820, 0.55, { vx: 330, vy: 1700, vs: 0.75, gex: { speak: EP28.mouth(env, t) } }) });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 200, size: 86, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.25) / 0.8);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 520, key: 'ep28-title' });
    },
    post: () => ({ bloom: 0.4, vignette: 0.4, paper: 0.3 }),
  });
})();
