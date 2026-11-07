/* Ep 39 · line "hook" · COLD OPEN (a statement card) · "The chant dragged down the king of gods." · Indra's white-gold car tilting down through black smoke from frame 1, gold chant-ropes wound round it; the card below in the dark. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, u = E.inOutSine(clamp(t / 3.5));
      EP39.storm(ctx, T, { cam: { zoom: 1.0 }, after: (g) => {
        const y = lerp(720, 960, u);
        EP39.car(g, 560, y + 120, 1.25, T, { tilt: -0.18 - 0.08 * u });
        CH.indra.draw(g, { x: 560, y: y + 70, scale: 0.6, facing: 'left', pose: { name: 'protect', k: 0.7 }, light: EP39.fireLit(560, y), t: T, key: 'h39-in' });
      } });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 1460, size: 80, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.15) / 0.7);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 1590, key: 'ep39-title' });
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }),
  });
})();
