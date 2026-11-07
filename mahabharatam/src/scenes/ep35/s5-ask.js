/* Ep 35 · line "ask" · FRAME (Shaunaka asks) · "And what did she choose, Sauti?" · A twenty-third angle: the elder close and lit (the first time he speaks in this arc), Sauti blurred across the fire. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'ask',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.8, speed: 0, hide: [0, 1, 2, 3, 4, 5, 6], fireH: 240, smoke: { alpha: 0.4, lean: -20 },
        cam: { zoom: 1.6 + 0.05 * p, dx: 100, dy: -300 },
        after: (g) => {
          g.save(); g.globalAlpha = 0.55; CH.sauti.draw(g, { x: 820, y: 1260, scale: 0.5, facing: 'left', pose: { name: 'sit' }, light: { dir: Math.atan2(F.y - 1000, F.x - 820), intensity: fl, front: 0.5 }, t: T, key: 'k35-sauti' }); g.restore();
          CH.elder.draw(g, { x: 330, y: 1500, scale: 0.75, facing: 'right', pose: { name: 'speak', base: 'sit', k: E.inOutSine(clamp(t / 0.5)) }, expression: { speak: EPA.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1100, F.x - 330), intensity: fl * 1.2, front: 0.75, fill: 0.3 }, t: T, key: 'k35-elder' });
        },
      });
    },
    post: () => ({ bloom: 0.42, vignette: 0.54, paper: 0.32 }),
  });
})();
