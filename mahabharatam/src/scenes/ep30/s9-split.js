/* Ep 30 · line "split" · "And their tongues split in two." · Extreme close-up on one serpent's head over the blades: the tongue slides along a sharp blade (beats[0]) and comes away forked (beats[1]); held a beat in silence. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP30 = window.EP30;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'split',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T;
      const b1 = env.beats[1] ?? 1.4;
      const fork = E.outCubic(clamp((t - b1 + 0.15) / 0.3));
      EP30.dawnIsle(ctx, T, { cam: { zoom: 3.0, dy: -1000 } });
      EP30.kusha(ctx, 600, 2000, 3.2, T, { glow: 0.15 });
      CH.naga.draw(ctx, { x: 520, y: 2700, scale: 2.0, facing: 'left', index: 0, pose: { name: 'rise', k: 0.5 }, light: EP30.dawn(520, 2700, 1.1), t: T, key: 's30-n' });
      // the tongue: a single red line from the mouth, forking
      const mx = 280, my = 1180, L = lerp(80, 220, clamp(t / 0.6));
      ctx.save(); ctx.strokeStyle = '#d0302a'; ctx.lineWidth = 10; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx - L, my + 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx - L, my + 10); ctx.lineTo(mx - L - 60, my + 10 - 40 * fork); ctx.moveTo(mx - L, my + 10); ctx.lineTo(mx - L - 60, my + 10 + 40 * fork); if (fork < 0.05) { ctx.moveTo(mx - L, my + 10); ctx.lineTo(mx - L - 60, my + 10); } ctx.stroke();
      ctx.restore();
    },
    post: () => ({ bloom: 0.38, vignette: 0.5, paper: 0.3 }),
  });
})();
