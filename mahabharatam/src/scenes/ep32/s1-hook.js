/* Ep 32 · line "hook" · COLD OPEN (a question over the council, chosen by content) · "How do you escape your own mother's curse?" · From the vault looking down: a ring of serpents round the jewel-fire, the camera sinking toward them from t = 0; the card at the top. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP32 = window.EP32;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, sink = E.outCubic(clamp(t / 3));
      EP32.fireHall(ctx, T, { cam: { zoom: lerp(1.35, 1.12, sink), dy: lerp(240, 120, sink) }, after: (g) => {
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + T * 0.05, x = 540 + Math.cos(a) * 380, y = 1300 + Math.sin(a) * 110; CH.naga.draw(g, { x, y: y + 80, scale: 0.26 + 0.04 * Math.sin(a), facing: Math.cos(a) > 0 ? 'left' : 'right', index: i % 6 === 1 || i % 6 === 4 ? 0 : i % 6, pose: { name: 'rise', k: 0.55 + 0.15 * Math.sin(T * 2 + i) }, light: EP32.fireLit(x, y), t: T + i, key: 'h32-n' + i }); }
      } });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 150, size: 80, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.15) / 0.7);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 360, key: 'ep32-title' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.3 }),
  });
})();
