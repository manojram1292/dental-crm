/* Ep 36 · line "grew" · "He grew like the waxing moon, and kept every vow." · NEW LIGHT, the night sky over the serpent world: the moon waxes in steps on the beats while the boy on a rock grows taller each time. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35, EP36 = window.EP36;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'grew',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, B = env.beats;
      let st = 0; for (let k = 0; k < 3; k++) if (t >= B[k] - 0.1) st = k + 1;
      const ph = [0.2, 0.45, 0.7, 1][st], sc = [0.32, 0.4, 0.48, 0.56][st];
      EP36.moons(ctx, T, { phase: ph, cam: { zoom: 1.0 + 0.04 * st }, after: (g) => {
        CH.astika.draw(g, { x: 540, y: 1300, scale: sc, facing: 'right', pose: { name: 'stand' }, light: { dir: Math.atan2(420 - 900, 700 - 540), intensity: 1.1, front: 0.6, fill: 0.45 }, t: T, key: 'g36-as' });
      } });
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }),
  });
})();
