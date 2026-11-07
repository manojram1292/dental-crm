/* Ep 35 · line "eyes" · "His eyes opened, and his lips trembled with anger." · The sage rises off the mat into the red light (a cut to him standing up, close), a low drum. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'eyes',
    fadeIn: 0.1,
    draw(ctx, t, env) {
      const T = env.T, up = E.outCubic(clamp(t / 1.2));
      EP34.chamber(ctx, T, { sun: 1, cam: { zoom: 2.2, dx: 120, dy: lerp(-500, -700, up) }, after: (g) => {
        CH.jaratkaru.draw(g, { x: 640, y: lerp(2400, 2000, up), scale: 1.3, facing: 'left', pose: { name: 'stand' }, light: EP35.red(640, 1500, 1.25), t: T, key: 'e35-jk' });
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.56, paper: 0.3 }),
  });
})();
