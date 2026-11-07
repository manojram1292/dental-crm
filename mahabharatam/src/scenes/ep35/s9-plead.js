/* Ep 35 · line "plead" · the bride speaks · "I woke you for your prayer. And the child my brother hoped for?" · She rises toward him (reverse angle, she large and lit right, his dark shoulder left); the lamp between them. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'plead',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, up = E.inOutSine(clamp(t / 1.2));
      EP34.chamber(ctx, T, { sun: 0.8, lampX: 520, lampY: 1500, cam: { zoom: 1.6, dx: 40, dy: -560 }, after: (g) => {
        CH.nagini.draw(g, { x: 760, y: lerp(2100, 1950, up), scale: 1.05, facing: 'left', pose: { name: 'cradle', k: 0.5 * up }, expression: { speak: EPA.mouth(env, t) }, light: EP34.lamp(760, 1500, 520, 1500, 1.25), t: T, key: 'p35-ng' });
        CH.jaratkaru.draw(g, { x: 80, y: 2300, scale: 1.4, facing: 'right', pose: { name: 'stand' }, light: { dir: 0, intensity: 0.7, front: 0.15, fill: 0.1 }, t: T, key: 'p35-jk' });
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.52, paper: 0.3 }),
  });
})();
