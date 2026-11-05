/* Ep 28 · line "ageless" · "From then on, he needed no amrita. Age and death could not touch him." · Garuda alone in the gold light, wings opening wide, the pot held out from him; a calm glow settles on him. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP28 = window.EP28, EP15 = window.EP15;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'ageless',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      const o = E.inOutSine(clamp(t / 1.6));
      EP28.dawnSky(ctx, T, { cam: { zoom: lerp(1.15, 1.05, p), dy: 120 }, after: (g) => {
        KIT.glow(g, 540, 1100, 700, '#fff0c0', 0.3 + 0.3 * o, 'lighter', 0.4);
        CH.garuda.draw(g, { x: 560, y: 1700, scale: 0.75, facing: 'left', pose: { name: 'spread', k: lerp(0.4, 1, o) }, light: EP28.dawn(560, 1700, 1.25), t: T, key: 'ag28-ga' });
        EP15.potGlow(g, 300, 1250, 0.9, 1);
      } });
    },
    post: () => ({ bloom: 0.44, vignette: 0.4, paper: 0.3 }),
  });
})();
