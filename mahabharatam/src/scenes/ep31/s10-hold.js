/* Ep 31 · line "hold" · "So Shesha went down through a cleft, and held it on his heads." · NEW LIGHT, beneath the earth: the white body pours down the cleft (beats[1]), lighting the cavern with its own pearl glow; the canopy rises under the earth and it stops shaking (beats[2]). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA;
  const { clamp, E, lerp } = R;
  R.scene({
    id: 'hold',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, B = env.beats;
      const down = E.inOutSine(clamp((t - B[0] + 0.3) / (B[1] - B[0] + 0.6))), up = E.outCubic(clamp((t - B[2] + 0.8) / 0.9)), still = clamp((t - B[2]) / 0.5);
      EPA.under(ctx, T, { glow: 0.25 + 0.75 * down, shake: 1 - still, cam: { zoom: lerp(0.9, 1.0, up), dy: lerp(-200, 60, up) }, after: (g) => {
        EPA.shesha(g, 560, lerp(620, 1910, down) + lerp(0, -40, up), 0.9, T, { k: lerp(0.35, 1, up), light: EPA.lit(560, 1500, 540, 2300, 1.1, 0.7, 0.4), key: 'ho31-sh' });
        EPA.earth(g, 540, 250, 1300, T, { tilt: 0.05 * (1 - still) * Math.sin(T * 6) });
        // the cleft: a bright seam in the earth's underside the body comes through
        KIT.glow(g, 600, 430, 200, '#fff0d0', 0.6 * (1 - up));
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.48, paper: 0.3 }),
  });
})();
