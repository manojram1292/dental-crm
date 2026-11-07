/* Ep 40 · line "urge" · "The whole assembly urged the king: give the boy his boon." · The seated kings and sages turn to the king, hands raised; the fire still high behind. Recap band at the top. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP8 = window.EP8, EP34 = window.EP34, EP37 = window.EP37, EP38 = window.EP38, EP39 = window.EP39, EP40 = window.EP40;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'urge',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur), up = E.inOutSine(clamp((t - env.beats[1] + 0.3) / 0.6));
      EP40.embers(ctx, T, { k: 0.1, cam: { zoom: 1.1 + 0.05 * p, dy: -220 }, after: (g) => {
        for (let i = 0; i < 6; i++) { const left = i < 3, x = left ? 120 + i * 120 : 720 + (i - 3) * 120, y = 1560 + (i % 3) * 100; CH.sage.draw(g, { x, y, scale: 0.48, facing: left ? 'right' : 'left', index: i, pose: { name: 'bless', k: up }, light: EP8.fireLight(x, y, 1.1, 0.7), t: T + i, key: 'u40-s' + i }); }
      } });
      KIT.series.recapBand(ctx, T, clamp(t / 0.3) * (1 - clamp((t - 2.6) / 0.3)), env.strings, { y: 300 });
    },
    post: () => ({ bloom: 0.44, vignette: 0.48, paper: 0.3 }),
  });
})();
