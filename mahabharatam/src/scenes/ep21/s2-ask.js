/* Ep 21 · line "ask" · Garuda: "Mother, why must we obey them?" · NEW LIGHT: the palm grove at evening, amber through the trunks; Garuda kneels to Vinata. The UNVOICED recap band rides the first 2.6 s. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP21 = window.EP21;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'ask',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP21.grove(ctx, T, { cam: { zoom: 1.12 + 0.05 * p, dx: -20 * p }, after: (g) => {
        CH.vinata.draw(g, { x: 330, y: 1720, scale: 0.95, facing: 'right', pose: { name: 'stand', slave: true }, light: EP21.amber(330, 1720), t: T, key: 'a21-vn' });
        CH.garuda.draw(g, { x: 780, y: 1720, scale: 0.62, facing: 'left', pose: { name: 'bow', k: 0.5 }, expression: { speak: EP21.mouth(env, t) }, light: EP21.amber(780, 1720, 1.15), t: T, key: 'a21-ga' });
      } });
      const rb = clamp(t / 0.3) * (1 - clamp((t - 2.6) / 0.35));
      KIT.series.recapBand(ctx, T, rb, env.strings, { y: 1560 });
      void E;
    },
    post: () => ({ bloom: 0.4, vignette: 0.42, paper: 0.32 }),
  });
})();
