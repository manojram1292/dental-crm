/* Ep 28 · line "frame" · FRAME (Sauti) · "Then the bird offered a boon to the god." · A seventeenth angle: wide and level, all the sages turned to Sauti, his palm held up as if offering. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP28 = window.EP28;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.8, speed: 0, hide: [2], fireH: 220, turn: (i) => (i < 4 ? 0.4 : -0.4), smoke: { alpha: 0.3, lean: 0 },
        cam: { zoom: 0.95 + 0.03 * p, dy: 60 },
        after: (g) => CH.sauti.draw(g, { x: 840, y: 1290, scale: 0.55, facing: 'left', pose: { name: 'speak', base: 'sit', k: E.inOutSine(clamp(t / 0.7)) }, expression: { speak: EP28.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1000, F.x - 840), intensity: fl * 1.2, front: 0.55 }, t: T, key: 'f28-sauti' }),
      });
    },
    post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.32 }),
  });
})();
