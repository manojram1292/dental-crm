/* Ep 34 · line "cry" · "So he went into the forest, and called out three times." · NEW LIGHT, the deep forest in green-gold shafts, wide: the sage small among giant trunks; three rings of light spread through the trees on the beats. */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP33 = window.EP33;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'cry',
    fadeIn: 0.25,
    draw(ctx, t, env) {
      const T = env.T, B = env.beats, p = clamp(t / env.dur);
      EP34.forest(ctx, T, { rings: B.map((b) => clamp((t - b + 0.1) / 1.4)), ringAt: [480, 1560], cam: { zoom: 0.92 + 0.06 * p }, after: (g) => {
        CH.jaratkaru.draw(g, { x: 480, y: 1620, scale: 0.5, facing: 'right', pose: { name: t > B[0] - 0.3 ? 'bless' : 'walk', k: 1, phase: T * 2.4 }, light: EP34.shaft(480, 1500), t: T, key: 'c34-jk' });
      } });
    },
    post: () => ({ bloom: 0.42, vignette: 0.44, paper: 0.3 }),
  });
})();
