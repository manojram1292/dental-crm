/* Ep 38 · line "frame" · FRAME (Sauti) · "So he did what he did best. He spoke." · A twenty-sixth angle: low behind the fire, the flames between camera and Sauti; he smiles. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'frame',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const fl = KIT.flicker(T, 0), F = KIT.ashram.FIRE;
      KIT.ashram.draw(ctx, T, {
        cycle: 0.7, speed: 0, hide: [2, 3], fireH: 380, smoke: { alpha: 0.5, lean: 0 },
        cam: { zoom: 1.4 + 0.05 * p, dx: 0, dy: -60 },
        after: (g) => CH.sauti.draw(g, { x: 640, y: 1200, scale: 0.5, facing: 'left', pose: { name: 'speak', base: 'sit', k: 1 }, expression: { speak: EPA.mouth(env, t) }, light: { dir: Math.atan2(F.y - 1000, F.x - 640), intensity: fl * 1.2, front: 0.75, fill: 0.3 }, t: T, key: 'f38-sauti' }),
      });
    },
    post: () => ({ bloom: 0.46, vignette: 0.52, paper: 0.32 }),
  });
})();
