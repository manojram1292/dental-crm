/* Ep 18 · line "slave" · "She bowed her head, and became her sister's slave." · Vinata bows; on "slave" (beats[1]) her ornaments fall away and her sari's end covers her head; Kadru stands over her. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP11 = window.EP11;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'slave',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T;
      const b1 = env.beats[1] ?? 2.5;
      const bow = E.inOutSine(clamp((t - 0.2) / 1.2)), slave = t > b1 - 0.1;
      EP11.shore(ctx, T, { cam: { zoom: 1.15, dy: -60 }, after: (g) => {
        const L = { dir: Math.atan2(1080 - 1400, 820 - 540), intensity: 1.05, front: 0.42 };
        CH.kadru.draw(g, { x: 330, y: 2000, scale: 1.12, facing: 'right', pose: 'stand', expression: { mood: 'wrath' }, light: L, t: T, key: 'v18-kd' });
        CH.vinata.draw(g, { x: 780, y: 2000, scale: 1.05, facing: 'left', pose: { name: 'bow', k: bow, slave }, light: L, t: T, key: 'v18-vn' });
      } });
    },
    post: () => ({ bloom: 0.4, vignette: 0.45, paper: 0.32 }),
  });
})();
