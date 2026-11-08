/* Ep 40 · line "hook" · COLD OPEN (a statement card over the image) · "A king's word put out the fire." · The great fire sinking from frame 1 under the serpent held in its gold rings; the card in the smoke above. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39, EP40 = window.EP40;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, k = E.inOutSine(clamp(t / 3.4)), fast = E.outCubic(clamp(t / 1.0));
      EP40.embers(ctx, T, { k: 0.15 + 0.5 * k, cam: { zoom: lerp(1.6, 1.15, fast), dy: lerp(-560, -260, fast) }, after: (g) => {
        CH.takshaka.draw(g, { x: 540, y: 1200 + 8 * Math.sin(T * 1.5), scale: 0.45, facing: 'left', pose: { name: 'recoil', k: 0.8 }, light: { dir: Math.PI / 2, intensity: 1.15, front: 0.75, fill: 0.5 }, t: T, key: 'h40-tk' });
        EP39.rings(g, 540, 1060, 340, T, 1 - 0.5 * k);
      } });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 140, size: 84, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.15) / 0.7);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 560, key: 'ep40-title' });
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }),
  });
})();
