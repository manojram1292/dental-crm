/* Ep 39 · line "frame" · FRAME (Sauti) · "Even the king of the gods could not hold on." · A twenty-seventh angle: from high above the Naimisha fire, Sauti's upturned face lit, the sages around. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.6, speed: 0, hide: [5], fireH: 260, smoke: { alpha: 0.4, lean: 25 },
        cam: { zoom: 1.2 + 0.05 * p, dx: -100, dy: -120 },
        after: (g) => CH.sauti.draw(g, { x: 780, y: 1280, scale: 0.6, facing: 'left', pose: { name: 'speak', base: 'sit', k: 1 }, expression: { look: -0.2, speak: EPA.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1000, F.x - 780), intensity: fl * 1.25, front: 0.8, fill: 0.3 }, t: T, key: 'f39-sauti' }),
      });
    },
    post: () => ({ bloom: 0.44, vignette: 0.52, paper: 0.32 }),
  });
})();
