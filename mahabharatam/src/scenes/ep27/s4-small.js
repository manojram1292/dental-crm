/* Ep 27 · line "small" · "Then he made himself small, and bright as gold." · Through the white steam Garuda shrinks to a small figure blazing gold (beats[0] → beats[1]). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP27 = window.EP27;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'small',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T;
      const b0 = env.beats[0] ?? 1, b1 = env.beats[1] ?? 2;
      const sh = E.inOutCubic(clamp((t - b0 + 0.6) / (b1 - b0 + 0.6))), gold = clamp((t - b1 + 0.3) / 0.4);
      EP27.blaze(ctx, T, { douse: 1 });
      KIT.glow(ctx, 540, lerp(1100, 1500, sh), lerp(300, 260, sh), '#ffd060', 0.3 + 0.5 * gold, 'lighter', 0.4);
      CH.garuda.draw(ctx, { x: 540, y: lerp(1700, 1640, sh), scale: lerp(0.6, 0.14, sh), facing: 'left', pose: { name: 'fly', phase: T * 8, blaze: 0.6 * gold }, light: { dir: -Math.PI / 2, intensity: lerp(1.1, 1.3, gold), front: lerp(0.55, 0.8, gold) }, t: T, key: 's27-ga' });
    },
    post: () => ({ bloom: 0.46, vignette: 0.42, paper: 0.3 }),
  });
})();
