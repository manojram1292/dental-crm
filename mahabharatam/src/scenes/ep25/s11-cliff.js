/* Ep 25 · line "cliff" · NEXT 1 (the catalog line) · "And now that bird was flying toward heaven." · Garuda climbs LARGE through the cloud-banks toward the white walls of heaven, wings beating. EP25.climb is reused by the Next overlay. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP25 = window.EP25, EP8 = window.EP8;
  const { clamp, lerp } = R;
  const CH = KIT.characters;
  EP25.climb = (ctx, T, t) => {
    const p = clamp(t / 4);
    EP8.svarga(ctx, T, { cam: { zoom: 1.0, dy: lerp(-200, 0, p) } });
    ctx.save(); ctx.fillStyle = 'rgba(40,30,80,0.25)'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore();
    ctx.save(); ctx.translate(540, 1300); ctx.rotate(0.55); ctx.translate(-540, -1300);
    CH.garuda.draw(ctx, { x: lerp(620, 560, p), y: lerp(2200, 1950, p), scale: 1.0, facing: 'left', pose: { name: 'fly', phase: T * 4 }, expression: { mood: 'wrath', look: -0.3 }, light: { dir: -Math.PI / 2 - 0.3, intensity: 1.2, front: 0.6 }, t: T, key: 'cl25-ga' });
    ctx.restore();
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.2,
    draw(ctx, t, env) { EP25.climb(ctx, env.T, t); },
    post: () => ({ bloom: 0.4, vignette: 0.42, paper: 0.3 }),
  });
})();
