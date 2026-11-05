/* Ep 24 · line "name" · "On it hung the Valakhilyas, sages no bigger than a thumb." · Close along the branch in the beak: the tiny sages, Garuda's great eye above them for scale; the plaque. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP24 = window.EP24;
  const { clamp } = R;
  R.scene({
    id: 'name',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 1;
      EP24.glare(ctx, T, { slide: 900 + t * 120 });
      ctx.save(); KIT.camera(ctx, { x: 540, y: 960, zoom: 3.2 + 0.2 * p, dx: 0, dy: 0 });
      // camera centred on the branch under the beak
      const s = 0.6, x = 840, y = 1510;
      ctx.translate(540 - (x - 363 * s) + 120, 960 - (y - 753 * s) - 60);
      EP24.loaded(ctx, x, y, s, T, { key: 'n24' });
      ctx.restore();
      const la = clamp((t - b0 + 0.2) / 0.4) * (1 - clamp((t - dur + 0.3) / 0.3));
      EP24.plaque(ctx, env.strings.valakhilyaName, env.strings.valakhilyaEpithet, KIT.CX, 1600, la, { size: 52, key: 'n24-name' });
    },
    post: () => ({ bloom: 0.4, vignette: 0.42, paper: 0.3 }),
  });
})();
