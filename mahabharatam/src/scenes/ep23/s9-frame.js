/* Ep 23 · line "frame" · FRAME (Sauti) · "But where could he land, with such a load?" · A twelfth angle: from very low behind the flames, Sauti's hands spread wide as if weighing. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP23 = window.EP23;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.8, speed: 0, hide: [0, 6, 7], fireH: 340, smoke: { alpha: 0.3, lean: 6 },
        cam: { zoom: 1.7 + 0.05 * p, dx: 0, dy: -60 },
        middle: (g) => CH.sauti.draw(g, { x: 770, y: 1090, scale: 0.55, facing: 'left', pose: { name: 'bless', base: 'sit', k: E.inOutSine(clamp(t / 0.8)) }, expression: { speak: EP23.mouth(env, t) }, light: { dir: Math.atan2(F.y - 700, F.x - 560), intensity: fl * 1.25, front: 0.6 }, t: T, key: 'f23-sauti' }),
      });
    },
    post: () => ({ bloom: 0.44, vignette: 0.52, paper: 0.32 }),
  });
})();
