/* Ep 29 · line "hook" · COLD OPEN (style C) · "The thunderbolt struck. He lost one feather." · Indra's storm: the vajra's white flash breaks on Garuda's wing from frame 1; a single gold feather spins away down the frame. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13, EP29 = window.EP29;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T;
      const fl = Math.exp(-t * 3);
      EP13.storm(ctx, T, { flash: fl, rain: 0.2, after: (g) => {
        CH.garuda.draw(g, { x: 600, y: 1700, scale: 0.75, facing: 'left', pose: { name: 'fly', phase: T * 4 }, light: { dir: -Math.PI / 2 - 0.6, intensity: 1.2, front: 0.6 }, t: T, key: 'h29-ga' });
      } });
      if (fl > 0.02) { ctx.save(); ctx.globalAlpha = 0.6 * fl; KIT.glow(ctx, 760, 900, 500, '#ffffff', 1); ctx.restore(); }
      const u = clamp(t / 4);
      EP29.feather(ctx, lerp(760, 380, u), lerp(950, 1650, E.inOutSine(u)) + 40 * Math.sin(t * 3), 0.35, 0.6 + t * 1.2, T, 1);
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 200, size: 80, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.25) / 0.8);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 520, key: 'ep29-title' });
    },
    post: () => ({ bloom: 0.44, vignette: 0.46, paper: 0.3 }),
  });
})();
