/* Ep 28 · line "banner" · "And Vishnu set him on his banner, so the bird sits above the god." · NEW LIGHT, a white-gold sky: Vishnu below; his tall banner-staff rises beside him and at its top Garuda's image; the plaque. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP28 = window.EP28;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'banner',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = E.inOutSine(clamp(t / dur));
      const b0 = env.beats[0] ?? 1;
      const rise = E.outCubic(clamp((t - b0 + 0.6) / 1.0));
      EP28.whiteGold(ctx, T, {});
      ctx.save(); KIT.camera(ctx, { x: 540, y: 1000, zoom: lerp(1.0, 0.92, p), dy: lerp(120, -40, p) });
      EP28.banner(ctx, 250, 1820, lerp(500, 1450, rise), T, 1);
      CH.vishnu.draw(ctx, { x: 640, y: 1820, scale: 0.85, facing: 'front', pose: { name: 'bless', k: 0.6 }, light: { dir: -Math.PI / 2, intensity: 1.1, front: 0.6 }, t: T, key: 'bn28-vi' });
      ctx.restore();
      const la = clamp((t - (env.beats[1] ?? 2) + 0.2) / 0.3) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP28.plaque(ctx, env.strings.bannerName, env.strings.bannerEpithet, KIT.CX, 1640, la, { size: 48, key: 'bn28-name' });
    },
    post: () => ({ bloom: 0.36, vignette: 0.36, paper: 0.3 }),
  });
})();
