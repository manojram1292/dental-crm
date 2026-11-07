/* Ep 31 · line "bone" · "His flesh and skin dried down to the bone." · Low angle at the foot of the Himalaya before dawn: the white serpent, thin now (belly plates like ribs), motionless against snow and stars; a slow tilt up his body; plaque "the Himalaya". */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA;
  const { clamp, E, lerp } = R;
  R.scene({
    id: 'bone',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      const thin = E.inOutSine(clamp((t - env.beats[0]) / (env.beats[1] - env.beats[0] + 0.4)));
      EPA.penance(ctx, T, { place: 4, hz: 1500, cam: { zoom: 1.35, dy: lerp(260, -160, p) }, after: (g) => {
        EPA.shesha(g, 560, 2050, 0.95, T, { k: 1, w: lerp(110, 62, thin), sway: 0.2, light: EPA.lit(560, 1500, 300, 600, 0.9, 0.5, 0.45), key: 'bo31-sh' });
      } });
      EPA.plaque(ctx, env.strings.places[4], null, KIT.CX, 300, clamp(t / 0.3) * (1 - clamp((t - env.dur + 0.4) / 0.3)), { size: 52, key: 'bo31-pl' });
    },
    post: () => ({ bloom: 0.36, vignette: 0.5, paper: 0.32 }),
  });
})();
