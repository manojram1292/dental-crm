/* Ep 28 · line "both" · "So each had his wish: the bird above the god, the god upon the bird." · Vishnu standing on Garuda's back in flight over the cloud-sea, and above them, small, the banner with Garuda's image. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP28 = window.EP28;
  const { clamp, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'both',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, p = clamp(t / env.dur);
      EP28.dawnSky(ctx, T, { cam: { zoom: 1.0, dx: lerp(60, -60, p) }, after: (g) => {
        const x = lerp(700, 480, p), y = 1450 + 20 * Math.sin(T * 2);
        CH.garuda.draw(g, { x, y, scale: 0.6, facing: 'left', pose: { name: 'fly', phase: T * 3 }, light: EP28.dawn(x, y, 1.2), t: T, key: 'bo28-ga' });
        CH.vishnu.draw(g, { x: x + 40, y: y - 520, scale: 0.36, facing: 'front', pose: { name: 'bless', k: 0.6 }, light: EP28.dawn(x, y - 500, 1.15), t: T, key: 'bo28-vi' });
        EP28.banner(g, x + 230, y - 560, 640, T, 1);
      } });
    },
    post: () => ({ bloom: 0.4, vignette: 0.4, paper: 0.3 }),
  });
})();
