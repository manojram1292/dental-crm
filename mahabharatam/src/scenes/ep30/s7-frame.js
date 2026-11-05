/* Ep 30 · line "frame" · FRAME (Sauti, the arc's end) · "They had won the wager by a trick. Now a trick undid them." · A nineteenth angle: low and close, the dawn beginning behind the Naimisha trees; Sauti's hands turn over, one up, one down. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP30 = window.EP30;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.98 + 0.03 * p, speed: 0, hide: [5, 6], fireH: 200, smoke: { alpha: 0.3, lean: 12 },
        cam: { zoom: 1.5, dx: 60, dy: -200 },
        after: (g) => CH.sauti.draw(g, { x: 800, y: 1300, scale: 0.62, facing: 'left', pose: { name: 'speak', base: 'sit', k: E.inOutSine(clamp(t / 0.6)) }, expression: { speak: EP30.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1000, F.x - 800), intensity: fl * 1.15, front: 0.55 }, t: T, key: 'f30-sauti' }),
      });
    },
    post: () => ({ bloom: 0.4, vignette: 0.5, paper: 0.32 }),
  });
})();
