/* Ep 23 · line "broke" · "He landed on it, and the branch broke." · Garuda settles on the branch; on "broke" (beats[1]) it cracks at the trunk, a burst of light, and drops. EP23.landing is reused by the cliffhanger. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP23 = window.EP23;
  const { clamp, E, lerp } = R;
  R.scene({
    id: 'broke',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur;
      const b1 = env.beats[1] ?? 1.6;
      const land = E.outCubic(clamp(t / (b1 * 0.8)));
      const c = clamp((t - b1 + 0.15) / 0.2), d = E.inCubic(clamp((t - b1) / (dur - b1 + 0.3)));
      const shake = c > 0 && d < 0.5 ? 8 * Math.sin(T * 70) : 0;
      ctx.save(); ctx.translate(shake, 0);
      EP23.alamba(ctx, T, { crack: c, drop: d * 0.6, cam: { zoom: 1.25, dx: 60, dy: 40 }, after: (g) => {
        const [x, y] = EP23.branchAt(0.55, { crack: c, drop: d * 0.6 });
        EP23.carry(g, lerp(x - 100, x, land), lerp(y - 500, y - 90, land), 0.55, T, { key: 'k23', light: EP23.dusk(x, y, 1.15) });
      } });
      ctx.restore();
    },
    post: () => ({ bloom: 0.42, vignette: 0.45, paper: 0.32 }),
  });
})();
