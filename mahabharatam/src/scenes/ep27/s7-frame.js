/* Ep 27 · line "frame" · FRAME (Sauti) · "But two more guards were waiting." · A sixteenth angle: from behind Sauti's back, his hand raised with two fingers; the sages' faces lit beyond him across the fire. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP27 = window.EP27;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const fl = KIT.flicker(T, 0);
      KIT.ashram.draw(ctx, T, { cycle: 0.8, speed: 0, hide: [6, 7], fireH: 240, turn: () => 0.1, smoke: { alpha: 0.3, lean: 4 }, cam: { zoom: 1.3 + 0.04 * p, dy: -150 } });
      CH.sauti.draw(ctx, { x: 640, y: 2300, scale: 1.25, facing: 'left', pose: { name: 'bless', base: 'sit', k: E.inOutSine(clamp(t / 0.6)) }, expression: { speak: EP27.mouth(env, t) }, light: { dir: -Math.PI / 2 - 0.2, intensity: fl * 0.9, front: 0.1 }, t: T, key: 'f27-sauti' });
    },
    post: () => ({ bloom: 0.42, vignette: 0.52, paper: 0.32 }),
  });
})();
