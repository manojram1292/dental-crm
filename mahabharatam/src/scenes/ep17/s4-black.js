/* Ep 17 · line "black" · Kadru: "His tail is black." · Reverse angle: Kadru LARGE at the left, the green glint, a thin smile; on "tail" she points. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP17 = window.EP17;
  const { clamp, E } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'black',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const b0 = env.beats[0] ?? 0.4;
      const pt = E.inOutCubic(clamp((t - b0 + 0.2) / 0.5));
      EP17.sunset(ctx, T, { cam: { zoom: 1.3 + 0.04 * p, dx: 60, dy: -180 }, after: (g) => {
        CH.horse.draw(g, { x: 820, y: 1420, scale: 0.32, facing: 'left', pose: 'stand', light: EP17.sunLight(820, 1420), t: T, key: 'b17-ho' });
        CH.kadru.draw(g, { x: 330, y: 2000, scale: 1.14, facing: 'right', pose: { name: 'point', k: pt }, expression: { mood: 'wrath', speak: EP17.mouth(env, t) }, light: EP17.sunLight(330, 2000, 1.1), t: T, key: 'b17-kd' });
      } });
    },
    post: () => ({ bloom: 0.4, vignette: 0.42, paper: 0.32 }),
  });
})();
