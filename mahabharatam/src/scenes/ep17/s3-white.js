/* Ep 17 · line "white" · Vinata: "He is all white." · The sunset shore; Vinata LARGE in profile at the right, calm, the horse beyond her at the left. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17;
  const { clamp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'white',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP17.sunset(ctx, T, { cam: { zoom: 1.25 + 0.04 * p, dx: -60, dy: -160 }, after: (g) => {
        CH.horse.draw(g, { x: 250, y: 1420, scale: 0.32, facing: 'right', pose: 'stand', light: EP17.sunLight(250, 1420), t: T, key: 'w17-ho' });
        CH.vinata.draw(g, { x: 760, y: 2000, scale: 1.12, facing: 'left', pose: { name: 'speak', k: 0.6 }, expression: { speak: EP17.mouth(env, t) }, light: EP17.sunLight(760, 2000, 1.1), t: T, key: 'w17-vn' });
      } });
    },
    post: () => ({ bloom: 0.4, vignette: 0.42, paper: 0.32 }),
  });
})();
