/* Ep 28 · line "above" · THE TURN (≈ 45 %) · Garuda: "Let me stand above you." · After a 0.9 s rest: close on Garuda's eagle head speaking; on "above" (beats[1]) a cut wide: the bird rising over the god. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EP28 = window.EP28;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'above',
    fadeIn: 0.1,
    draw(ctx, t, env) {
      const T = env.T;
      const b1 = env.beats[1] ?? 1.2;
      if (t < b1 - 0.1) {
        EP28.dawnSky(ctx, T, { cam: { zoom: 1.0 } });
        CH.garuda.draw(ctx, { x: 640, y: 3050, scale: 2.4, facing: 'left', pose: { name: 'stand' }, expression: { speak: EP28.mouth(env, t), look: 0.05 }, light: EP28.dawn(640, 3050, 1.2), t: T, key: 'ab28-ga' });
      } else {
        const u = E.outCubic(clamp((t - b1 + 0.1) / 1.2));
        EP28.dawnSky(ctx, T, { cam: { zoom: 0.95 }, after: (g) => EP28.pair(g, T, 560, lerp(1300, 900, u), 0.5, { gpose: { name: 'spread', k: 1 }, vx: 540, vy: 1750, vs: 0.6, vpose: { name: 'bless', k: 0.6 } }) });
      }
    },
    post: () => ({ bloom: 0.42, vignette: 0.44, paper: 0.3 }),
  });
})();
