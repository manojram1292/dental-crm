/* Ep 40 · line "frame" · FRAME (Sauti) · "The serpents were saved by a boy who was half serpent." · A twenty-eighth angle, the arc's last: frontal and level, the fire low between him and us, the elder and the sages lit warm around him. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39, EP40 = window.EP40;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.9, speed: 0, hide: [], fireH: 160, smoke: { alpha: 0.3, lean: 0 },
        cam: { zoom: 1.25 + 0.04 * p, dx: 0, dy: -200 },
        after: (g) => CH.sauti.draw(g, { x: 560, y: 1200, scale: 0.6, facing: 'left', pose: { name: 'speak', base: 'sit', k: 1 }, expression: { speak: EPA.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1000, F.x - 560), intensity: fl * 1.3, front: 0.85, fill: 0.35 }, t: T, key: 'f40-sauti' }),
      });
    },
    post: () => ({ bloom: 0.44, vignette: 0.5, paper: 0.32 }),
  });
})();
