/* Ep 24 · line "plead" · Kashyapa: "Holy ones, his task is for the good of all. Let go." · Low under the branch held above him: Kashyapa, palms joined, speaks up to the tiny sages hanging over his head. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP24 = window.EP24;
  const { clamp, hash } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'plead',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP24.gandha(ctx, T, { cam: { zoom: 1.0, dy: 200 } });
      // the branch across the top of the frame, the sages hanging from it
      ctx.fillStyle = '#2a1a20'; ctx.fillRect(-20, 560, R.W + 40, 46);
      for (let i = 0; i < 16; i++) CH.valakhilya.hang(ctx, { x: 40 + i * 66 + (hash(i, 3) - 0.5) * 20, y: 600, scale: 0.13 * (0.85 + 0.3 * hash(i, 4)), index: i % 8, t: T, light: { dir: -Math.PI / 2, intensity: 1.05, front: 0.6 }, key: 'vk' + (i % 8) });
      CH.kashyapa.draw(ctx, { x: 540, y: 2050 - 20 * p, scale: 1.05, facing: 'left', pose: { name: 'bless', k: 0.6 }, expression: { speak: EP24.mouth(env, t), look: -0.3 }, light: EP24.warm(540, 2050, 1.15), t: T, key: 'p24-ka' });
    },
    post: () => ({ bloom: 0.38, vignette: 0.44, paper: 0.32 }),
  });
})();
