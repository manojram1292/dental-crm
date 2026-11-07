/* Ep 31 · line "friend" · "And Brahma gave him a friend: Garuda." · At the earth's rim, in the gold of first light, Garuda glides past the white serpent's raised heads (beats[0]) and circles back; gold over pearl. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'friend',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, b0 = env.beats[0], u = E.inOutSine(clamp((t - b0 + 1.4) / 2.4));
      EPA.penance(ctx, T, { place: 2, hz: 1500, rose: 0.55, cam: { zoom: 1.0 }, after: (g) => {
        EPA.shesha(g, 300, 2000, 0.7, T, { k: 1, light: EPA.lit(300, 1500, 900, 700, 1.1, 0.7, 0.45), key: 'fr31-sh' });
        const gx = lerp(1250, 640, u), gy = lerp(500, 820, u) + 30 * Math.sin(T * 2);
        CH.garuda.draw(g, { x: gx, y: gy, scale: 0.42, facing: 'left', pose: { name: 'fly', phase: T * 3 }, light: EPA.lit(gx, gy, 300, 1000, 1.2, 0.7, 0.4), t: T, key: 'fr31-ga' });
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.44, paper: 0.3 }),
  });
})();
