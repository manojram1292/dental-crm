/* Ep 26 · line "hook" · COLD OPEN (style C) · "One bird against all the gods." · Garuda bursts LARGE through heaven's gate, wings slamming open from frame 1, the gods' spears raised against him in the foreground. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP26 = window.EP26;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const open = E.outCubic(clamp(t / 0.8));
      EP26.court(ctx, T, { storm: 1, cam: { zoom: lerp(1.15, 1.05, open) + 0.03 * p, dy: 60 }, after: (g) => {
        CH.garuda.draw(g, { x: 560, y: lerp(1300, 1460, open), scale: 0.62, facing: 'left', pose: { name: 'spread', k: lerp(0.3, 1, open) }, expression: { mood: 'wrath' }, light: EP26.storm(560, 1460, 1.2), t: T, key: 'h26-ga' });
      } });
      for (let i = 0; i < 4; i++) { const x = [80, 300, 780, 1000][i]; CH.deva.draw(ctx, { x, y: 2150, scale: 0.9, facing: x < 540 ? 'right' : 'left', index: i, pose: { name: 'raise', k: 1 }, light: { dir: -Math.PI / 2, intensity: 0.8, front: 0.2 }, t: T, key: 'h26-d' + i }); }
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 200, size: 84, gold: line.hookGold, out });
      const tk = clamp((t - sp - 0.25) / 0.8);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 520, key: 'ep26-title' });
    },
    post: () => ({ bloom: 0.4, vignette: 0.46, paper: 0.3 }),
  });
})();
