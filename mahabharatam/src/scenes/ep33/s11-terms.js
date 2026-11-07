/* Ep 33 · line "terms" · "A bride with his own name, freely given, and not his to keep." · The dawn wide; three gold lines appear one per beat (the conditions as a short list), the ascetic small walking away. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'terms',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP33.wild(ctx, T, { dawn: 1, cam: { zoom: 1.0 + 0.05 * p } , after: (g) => {
        CH.jaratkaru.draw(g, { x: lerp(560, 640, p), y: 1520, scale: 0.42, facing: 'right', pose: { name: 'walk', phase: T * 2.4 }, light: { dir: -0.4, intensity: 1.1, front: 0.6, fill: 0.5 }, t: T, key: 't33-jk' });
      } });
      const pa = clamp((t - env.beats[0] + 0.2) / 0.3);
      if (pa > 0) { ctx.save(); ctx.globalAlpha = 0.82 * pa; ctx.fillStyle = '#140a06'; ctx.beginPath(); ctx.roundRect(110, 320, 780, 400, 24); ctx.fill(); ctx.globalAlpha = pa; ctx.strokeStyle = '#e7b54a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(122, 332, 756, 376, 16); ctx.stroke(); ctx.restore(); }
      env.strings.conditions.forEach((c, i) => {
        const a = E.outCubic(clamp((t - env.beats[i] + 0.1) / 0.35));
        if (a <= 0) return;
        KIT.goldText(ctx, c, KIT.CX, 420 + i * 120 + (1 - a) * 20, { size: 54, spacing: 1, weight: 700, alpha: a, glow: 0.3, key: 't33-c' + i });
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.44, paper: 0.32 }),
  });
})();
