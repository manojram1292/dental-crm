/* Ep 20 · line "ask" · NEXT 2 (Garuda) · "What will buy our freedom?" · Close on Garuda's eagle head and shoulders, the fierce eye softening into the question; a single bell on "freedom" (beats[1]). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP20 = window.EP20;
  const { clamp, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'ask',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP20.island(ctx, T, { cam: { zoom: 1.0 } });
      ctx.save(); ctx.fillStyle = 'rgba(10,30,50,0.3)'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore();
      CH.garuda.draw(ctx, { x: 600, y: lerp(2700, 2650, p), scale: 2.0, facing: 'left', pose: 'stand', expression: { look: 0.08 }, light: { dir: -Math.PI / 2 - 0.3, intensity: 1.15, front: 0.6 }, t: T, key: 'k20-ga' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.32 }),
  });
})();
