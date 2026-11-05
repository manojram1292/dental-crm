/* Ep 29 · line "cliff" · NEXT 1 (the catalog line) · "Garuda flew down with the amrita. Indra followed, unseen." · Garuda dives toward Ramaniyaka far below with the pot; behind him, a faint translucent Indra follows in the clouds (beats[1]). EP29.down is reused by the Next overlay. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP29 = window.EP29, EP20 = window.EP20, EP15 = window.EP15;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  EP29.down = (ctx, T, t, b1) => {
    const p = clamp(t / 4), ghost = 0.3 * E.outCubic(clamp((t - b1 + 0.4) / 0.8));
    EP20.island(ctx, T, { cam: { zoom: 0.72, dy: 160 } });
    ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore();
    const x = lerp(700, 560, p), y = lerp(900, 1250, p);
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.5); ctx.translate(-x, -y);
    CH.garuda.draw(ctx, { x, y, scale: 0.55, facing: 'left', pose: { name: 'carry', k: 1 }, light: { dir: -Math.PI / 2, intensity: 1.2, front: 0.6 }, t: T, key: 'dn29-ga' });
    EP15.potGlow(ctx, x - 120, y - 300, 0.9, 1);
    ctx.restore();
    if (ghost > 0) CH.indra.draw(ctx, { x: lerp(980, 860, p), y: lerp(300, 650, p) + 600, scale: 0.55, facing: 'left', pose: 'stand', alpha: ghost, light: { dir: -Math.PI / 2, intensity: 1, front: 0.5 }, t: T, key: 'dn29-in' });
  };
  R.scene({
    id: 'cliff',
    fadeIn: 0.25,
    draw(ctx, t, env) { EP29.down(ctx, env.T, t, env.beats[1] ?? 2); },
    post: () => ({ bloom: 0.4, vignette: 0.42, paper: 0.3 }),
  });
})();
