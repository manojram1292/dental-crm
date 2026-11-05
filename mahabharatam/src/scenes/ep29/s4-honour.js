/* Ep 29 · line "honour" · Garuda: "I honour the sage whose bones made this weapon. I honour you. Here is one feather." · Close on Garuda, respectful, wing lifting; on "sage" (beats[0]) a small medallion of an old sage in austerity. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP13 = window.EP13, EP11 = window.EP11, EP29 = window.EP29;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'honour',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b0 = env.beats[0] ?? 0.6, b2 = env.beats[2] ?? 3;
      EP13.storm(ctx, T, { flash: 0, rain: 0 });
      ctx.save(); ctx.fillStyle = 'rgba(255,240,210,0.15)'; ctx.fillRect(0, 0, R.W, R.H); ctx.restore();
      CH.garuda.draw(ctx, { x: 640, y: 2750, scale: 2.0, facing: 'left', pose: { name: 'bow', k: 0.3 * E.inOutSine(clamp((t - b2 + 0.4) / 0.6)) }, expression: { speak: EP29.mouth(env, t) }, light: { dir: -Math.PI / 2 - 0.6, intensity: 1.2, front: 0.65 }, t: T, key: 'ho29-ga' });
      const v = clamp((t - b0 + 0.2) / 0.4) * (1 - clamp((t - b2 + 0.4) / 0.4));
      EP11.roundel(ctx, 280, 560, 170, v, (g, TT) => { KIT.vgrad(g, 0, R.H, [[0, '#3a2a18'], [1, '#c89050']]); CH.sage.draw(g, { x: 540, y: 1400, scale: 0.8, facing: 'front', index: 6, pose: 'sit', light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.6 }, t: TT, key: 'ho29-s' }); }, T, { focus: [540, 1050], zoom: 0.5, key: 'ho29-r', glow: '#ffd890' });
      void dur;
    },
    post: () => ({ bloom: 0.42, vignette: 0.48, paper: 0.3 }),
  });
})();
