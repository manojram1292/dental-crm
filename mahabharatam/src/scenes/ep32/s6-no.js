/* Ep 32 · line "no" · Vasuki speaks · "No. Each plan is a crime, or a dream." · Close and low on Vasuki's single hood in the fire's light; the smoke of the visions blown away on "No". */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP32 = window.EP32;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'no',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, p = E.inOutSine(clamp(t / env.dur));
      EP32.fireHall(ctx, T, { cam: { zoom: lerp(1.9, 2.05, p), dx: 40, dy: -320 }, after: (g) => {
        CH.vasuki.draw(g, { x: 640, y: 1700, scale: 0.85, facing: 'left', pose: { name: 'rise', k: 1 }, expression: { mood: 'wrath' }, light: EP32.fireLit(640, 1300, 1.2), t: T, key: 'n32-va' });
      } });
      const v = 1 - clamp((t - env.beats[0]) / 0.5);
      EP32.vision(ctx, 540, 520, 600 * (1 + 0.6 * (1 - v)), 520, v * 0.8, () => {}, T);
    },
    post: () => ({ bloom: 0.42, vignette: 0.52, paper: 0.3 }),
  });
})();
