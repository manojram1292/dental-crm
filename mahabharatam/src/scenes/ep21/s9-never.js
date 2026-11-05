/* Ep 21 · line "never" · Vinata: "But never a brahmin. He would burn in your throat like fire." · Close on Vinata in the dusk, her hand raised in warning (beats[0]); beside her Garuda's head in profile, and on "throat" (beats[1]) a coal glows in his throat. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP21 = window.EP21;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'never',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const b0 = env.beats[0] ?? 0.5, b1 = env.beats[1] ?? 2.2;
      EP21.grove(ctx, T, { near: false, cam: { zoom: 1.0 } });
      ctx.save(); ctx.fillStyle = 'rgba(30,14,50,0.45)'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore();
      const w = E.outCubic(clamp((t - b0 + 0.3) / 0.5));
      CH.vinata.draw(ctx, { x: 300, y: 2500, scale: 1.6, facing: 'right', pose: { name: 'speak', k: w, slave: true }, expression: { speak: EP21.mouth(env, t), mood: 'wrath' }, light: EP21.amber(300, 2500, 1.05), t: T, key: 'nv21-vn' });
      CH.garuda.draw(ctx, { x: 1000, y: 2950 - 20 * p, scale: 1.6, facing: 'left', pose: { name: 'stand' }, expression: { look: -0.1 }, light: EP21.amber(1000, 2950, 1.1), t: T, key: 'nv21-ga' });
      EP21.coal(ctx, 955, 1690 - 20 * p, 30, T, E.outCubic(clamp((t - b1 + 0.1) / 0.4)));
    },
    post: () => ({ bloom: 0.42, vignette: 0.5, paper: 0.32 }),
  });
})();
