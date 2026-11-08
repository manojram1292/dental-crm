/* Ep 33 · line "hook" · COLD OPEN (a statement card over the image) · "A rat was gnawing the last root." · Extreme close on the root at the pit's lip, the rat gnawing from frame 1; far below, pale hanging figures; a slow push; the card low. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / 3.4), fast = E.outCubic(clamp(t / 1.0));
      EP33.pit(ctx, T, { view: 'down', cam: { zoom: lerp(1.7, 1.0, fast) + 0.15 * p, dy: lerp(420, 0, fast) } , after: (g) => {
        for (let i = 0; i < 4; i++) EP33.hanging(g, 315 + i * 150, 900 + (i % 2) * 60, 0.32, T, i, { alpha: 0.75, key: 'h33-p' });
        g.fillStyle = '#1a120c'; g.fillRect(-500, 300, 2000, 220);
        EP33.tuft(g, 480, 520, 1.6, T, { roots: 1 });
        EP33.rat(g, 700, 600, 0.9, T, { flip: true });
      } });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 1380, size: 84, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.15) / 0.7);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 1520, key: 'ep33-title' });
    },
    post: () => ({ bloom: 0.4, vignette: 0.55, paper: 0.3 }),
  });
})();
