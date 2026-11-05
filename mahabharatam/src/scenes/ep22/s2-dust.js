/* Ep 22 · line "dust" · "His wings raised a storm of dust, and the Nishadas ran blind, into his open beak." · NEW LIGHT: the bay under dust, the moon a copper coin: Garuda's wings beat the haze into whirls; Nishada men run with spears and nets toward him. The unvoiced recap band rides the first 2.6 s. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP21 = window.EP21, EP22 = window.EP22;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'dust',
    fadeIn: 0.2,
    draw(ctx, t, env) {
      const T = env.T, dur = env.dur, p = clamp(t / dur);
      const b1 = env.beats[1] ?? 2;
      const d = E.outCubic(clamp(t / 1.2));
      EP22.dusty(ctx, T, { dust: d, rush: 0.6, cam: { zoom: 1.25, dy: -180 }, after: (g) => {
        CH.garuda.draw(g, { x: 800, y: 1430, scale: 0.55, facing: 'left', pose: { name: 'fly', phase: T * 6 }, expression: { look: 0.15 }, light: EP21.moon(800, 1430, 1.1), t: T, key: 'd22-ga' });
        for (let i = 0; i < 5; i++) {
          const run = clamp((t - b1 + 0.6 + i * 0.1) / 2), x = lerp(120 + i * 70, 420 + i * 60, run);
          CH.nishada.draw(g, { x, y: 1430 + (i % 2) * 18, scale: 0.26, facing: 'right', index: i, pose: { name: 'run', phase: T * 7 + i }, light: EP21.moon(x, 1430, 0.9), t: T + i, key: 'd22-n' + i });
        }
      } });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.6) / 0.35)), env.strings, { y: 1560 });
      void p;
    },
    post: () => ({ bloom: 0.4, vignette: 0.45, paper: 0.32 }),
  });
})();
