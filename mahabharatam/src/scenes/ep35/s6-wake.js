/* Ep 35 · line "wake" · the bride speaks · "Rise, my lord. The sun is setting." · She chooses: her hand on his shoulder; the red light reaches his face (beats[0]). */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT, EPA = window.EPA, EP34 = window.EP34, EP35 = window.EP35;
  const { clamp, E, lerp } = R;
  const CH = KIT.characters;
  R.scene({
    id: 'wake',
    fadeIn: 0.15,
    draw(ctx, t, env) {
      const T = env.T, r = E.inOutSine(clamp((t - env.beats[0] + 0.5) / 0.8));
      EP34.chamber(ctx, T, { sun: 0.6 + 0.35 * r, cam: { zoom: 1.85, dx: 220, dy: -900 }, after: (g) => EP34.sleep(g, T, { look: -0.1 }) });
    },
    post: () => ({ bloom: 0.46, vignette: 0.5, paper: 0.3 }),
  });
})();
