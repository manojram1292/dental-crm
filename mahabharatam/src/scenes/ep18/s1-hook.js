/*
 * Ep 18 · line "hook" · COLD OPEN (Sauti) · "Who won the bet: the honest sister, or the one who cheated?"
 * Moving from frame 1: the two sisters LARGE in the foreground, flying low over the dawn ocean toward
 * a far shore where the white horse stands; the question in big text from frame 1.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'hook',
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      EP17.ocean(ctx, T, { hz: 1050, cam: { zoom: 1.0 + 0.06 * p }, after: (g) => {
        g.fillStyle = '#c8a888'; g.beginPath(); g.ellipse(560, 1070, 240, 18, 0, 0, R.TAU); g.fill();
        CH.horse.draw(g, { x: 560, y: 1068, scale: 0.13, facing: 'left', pose: 'stand', light: { dir: -1.2, intensity: 1, front: 0.6 }, t: T, key: 'h18-ho' });
        const L = { dir: -Math.PI / 2 + 0.4, intensity: 1.1, front: 0.5 };
        CH.kadru.draw(g, { x: lerp(280, 300, p), y: 1950 + 20 * Math.sin(T * 1.2), scale: 1.1, facing: 'left', pose: { name: 'walk', phase: T * 1.5, wind: 1.4 }, light: L, t: T, key: 'h18-kd' });
        CH.vinata.draw(g, { x: lerp(820, 800, p), y: 1990 + 20 * Math.sin(T * 1.2 + 1), scale: 1.06, facing: 'left', pose: { name: 'walk', phase: T * 1.5 + 1, wind: 1.4 }, light: L, t: T, key: 'h18-vn' });
      } });
      const sp = env.speech[1], out = clamp((t - sp - 0.05) / 0.3), line = env.script.lines[0];
      KIT.series.hookCard(ctx, T, 1, line.text, { y: 200, size: 78, gold: line.hookGold, out });
      KIT.series.fireEdge(ctx, T, 1 - 0.75 * E.inOutSine(clamp(t / 1.4)), { h: 300 });
      const tk = clamp((t - sp - 0.3) / 0.8);
      if (tk > 0) KIT.series.episodeTitle(ctx, T, tk, env.strings, { y: 540, key: 'ep18-title' });
    },
    post: () => ({ bloom: 0.4, vignette: 0.4, paper: 0.3 }),
  });
})();
