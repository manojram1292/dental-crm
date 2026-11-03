/*
 * Ep 7 · line "insect" · "In one fruit crawled a tiny copper insect."  (caption high)
 *
 * Inside the pavilion at sunset (EP7.pavilion), close and large: the king, the bow set
 * aside, turns a fruit in his hand before his eyes (hold). On "fruit" (beats[0]) it glows;
 * on "copper" (beats[1]) a tiny copper insect with black eyes crawls out onto his
 * fingertip; on "insect" (beats[2]) it glints cold green.
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP7 = window.EP7;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;

  R.scene({
    id: 'insect',
    fadeIn: 0.5,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b0 = env.beats[0] ?? 0.5, b1 = env.beats[1] ?? 2.1, b2 = env.beats[2] ?? 2.6;
      const hold = E.inOutCubic(clamp(t / 0.9));
      const crawl = clamp((t - (b1 - 0.5)) / 1.2);
      const glint = clamp((t - (b2 - 0.1)) / 0.4);
      const PK = { x: 760, y: 2050, scale: 1.35, facing: 'left', pose: { name: 'hold', k: hold }, expression: { look: 0.05 }, t: T };
      EP7.pavilion(ctx, T, {
        sky: 1, cam: { zoom: 1 + 0.05 * p },
        after: (g) => {
          CH.parikshit.draw(g, { ...PK, light: EP7.sunsetLight(760, 2050), key: 'i7-pk' });
          const h = CH.parikshit.anchor(PK, 'hand');
          const fx = h[0] - 6, fy = h[1] - 46;
          KIT.glow(g, fx, fy, 140, '#ffd070', 0.35 * clamp((t - (b0 - 0.2)) / 0.5));
          EP7.fruit(g, fx, fy, 40, T);
          if (crawl > 0.01) {
            const ix = lerp(fx - 10, fx - 70, E.inOutSine(crawl)), iy = lerp(fy - 20, fy - 36, crawl) + Math.sin(T * 9) * 2;
            KIT.glow(g, ix, iy, 120, '#ffa060', 0.3 * crawl);
            EP7.insect(g, ix, iy, 1.3, T, { ang: -0.3, glint });
          }
        },
      });
    },
    post: () => ({ bloom: 0.4, vignette: 0.52, paper: 0.32 }),
  });
})();
