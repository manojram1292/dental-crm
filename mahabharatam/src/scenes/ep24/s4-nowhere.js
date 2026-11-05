/* Ep 24 · line "nowhere" · "Over land and sea he flew, and found no place to set it down." · NEW LIGHT: the world from high above at midday: Garuda small against the glare, coasts and mountains sliding fast beneath; the camera turns. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP24 = window.EP24;
  const { clamp, lerp } = R;
  R.scene({
    id: 'nowhere',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      ctx.save(); ctx.translate(540, 960); ctx.rotate(lerp(-0.08, 0.08, p)); ctx.translate(-540, -960);
      EP24.glare(ctx, T, { slide: 1600 + t * 520 });
      EP24.loaded(ctx, lerp(420, 700, p), lerp(1300, 1100, p), 0.42, T, { key: 'nw24' });
      ctx.restore();
    },
    post: () => ({ bloom: 0.36, vignette: 0.36, paper: 0.3 }),
  });
})();
